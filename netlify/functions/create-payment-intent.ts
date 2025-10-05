/**
 * Netlify Function: Create Payment Intent
 * POST /.netlify/functions/create-payment-intent
 * Creates a Stripe Payment Intent for workshop or engagement payments
 */

import { Handler } from '@netlify/functions'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
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

    let amount = 0
    let description = ''
    let paymentMetadata: Record<string, string> = {
      userId: user.id,
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

      amount = Math.round((workshop.price_early_bird || workshop.price_amount) * 100)
      description = `Workshop: ${workshop.title}`
      paymentMetadata.workshopId = workshopId
      paymentMetadata.workshopTitle = workshop.title
      paymentMetadata.paymentType = 'workshop'
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

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      description,
      metadata: paymentMetadata,
      automatic_payment_methods: {
        enabled: true,
      },
    })

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
