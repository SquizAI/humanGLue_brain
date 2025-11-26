/**
 * Netlify Function: Create Payment Intent
 * POST /.netlify/functions/create-payment-intent
 * Creates a Stripe Payment Intent for workshop or engagement payments
 */

import { Handler } from '@netlify/functions'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

export const handler: Handler = async (event, context) => {
  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    // Verify authentication
    const authHeader = event.headers.authorization
    if (!authHeader) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Missing authorization header' }),
      }
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid authentication token' }),
      }
    }

    // Parse request body
    const body = JSON.parse(event.body || '{}')
    const { workshopId, engagementId, metadata } = body

    // Get user profile for customer creation
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      console.warn('Could not fetch user profile, continuing without customer data')
    }

    let amount = 0
    let description = ''
    let paymentMetadata: Record<string, string> = {
      userId: user.id,
      userEmail: user.email || userProfile?.email || '',
      userName: userProfile?.full_name || '',
      ...metadata,
    }

    // Determine payment type and amount
    if (workshopId) {
      // Workshop payment
      const { data: workshop, error: workshopError } = await supabase
        .from('workshops')
        .select('id, title, price_amount, price_early_bird, capacity_remaining')
        .eq('id', workshopId)
        .single()

      if (workshopError || !workshop) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Workshop not found' }),
        }
      }

      if (workshop.capacity_remaining <= 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Workshop is sold out' }),
        }
      }

      // Validate amount
      const priceToUse = workshop.price_early_bird || workshop.price_amount
      if (!priceToUse || priceToUse <= 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid workshop price' }),
        }
      }

      amount = Math.round(priceToUse * 100)
      description = `Workshop: ${workshop.title}`
      paymentMetadata.workshopId = workshopId
      paymentMetadata.workshopTitle = workshop.title
      paymentMetadata.paymentType = 'workshop'

      // Check for duplicate pending payment
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id, transaction_id')
        .eq('user_id', user.id)
        .eq('payment_type', 'workshop')
        .eq('related_entity_id', workshopId)
        .in('status', ['pending', 'processing'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (existingPayment?.transaction_id) {
        // Return existing payment intent
        const existingIntent = await stripe.paymentIntents.retrieve(existingPayment.transaction_id)
        if (existingIntent.status !== 'succeeded' && existingIntent.status !== 'canceled') {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              clientSecret: existingIntent.client_secret,
              paymentIntentId: existingIntent.id,
              amount: amount / 100,
              existing: true,
            }),
          }
        }
      }
    } else if (engagementId) {
      // Engagement payment
      const { data: engagement, error: engagementError } = await supabase
        .from('engagements')
        .select('id, focus_area, hourly_rate, hours_total')
        .eq('id', engagementId)
        .single()

      if (engagementError || !engagement) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Engagement not found' }),
        }
      }

      // Validate amount
      if (!engagement.hourly_rate || !engagement.hours_total || engagement.hourly_rate <= 0 || engagement.hours_total <= 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid engagement pricing' }),
        }
      }

      amount = Math.round(engagement.hourly_rate * engagement.hours_total * 100)
      description = `Engagement: ${engagement.focus_area}`
      paymentMetadata.engagementId = engagementId
      paymentMetadata.paymentType = 'engagement'
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Either workshopId or engagementId is required',
        }),
      }
    }

    // Validate minimum amount ($0.50)
    if (amount < 50) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Payment amount must be at least $0.50' }),
      }
    }

    // Get or create Stripe customer
    let customerId: string | undefined
    try {
      // Check if user already has a Stripe customer ID
      const { data: existingCustomer } = await supabase
        .from('payments')
        .select('provider_customer_id')
        .eq('user_id', user.id)
        .eq('provider', 'stripe')
        .not('provider_customer_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (existingCustomer?.provider_customer_id) {
        customerId = existingCustomer.provider_customer_id
      } else if (userProfile?.email) {
        // Create new Stripe customer
        const customer = await stripe.customers.create({
          email: userProfile.email,
          name: userProfile.full_name || undefined,
          metadata: {
            userId: user.id,
          },
        })
        customerId = customer.id
      }
    } catch (error) {
      console.warn('Failed to create/retrieve Stripe customer:', error)
      // Continue without customer - not critical for payment
    }

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      description,
      metadata: paymentMetadata,
      customer: customerId,
      receipt_email: userProfile?.email || user.email || undefined,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    // Record pending payment in database
    const { error: recordError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        amount: amount / 100,
        currency: 'USD',
        provider: 'stripe',
        transaction_id: paymentIntent.id,
        provider_customer_id: customerId,
        status: 'pending',
        payment_type: paymentMetadata.paymentType as 'workshop' | 'engagement',
        related_entity_id: workshopId || engagementId,
        metadata: {
          description,
          ...paymentMetadata,
        },
      })

    if (recordError) {
      console.error('Failed to record payment in database:', recordError)
      // Don't fail the request - webhook will handle it
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amount / 100,
      }),
    }
  } catch (error) {
    console.error('Payment Intent creation error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to create payment intent',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    }
  }
}
