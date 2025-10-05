/**
 * Netlify Function: Process Payment
 * POST /.netlify/functions/process-payment
 * Complete payment and create registration/engagement
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

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

export const handler: Handler = async (event, context) => {
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
    const { paymentIntentId, workshopId, engagementId } = body

    if (!paymentIntentId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'paymentIntentId is required' }),
      }
    }

    // Retrieve payment intent to verify it succeeded
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== 'succeeded') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Payment has not succeeded',
          status: paymentIntent.status,
        }),
      }
    }

    // Record payment in database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        provider: 'stripe',
        transaction_id: paymentIntent.id,
        status: 'succeeded',
        payment_type: workshopId ? 'workshop' : 'engagement',
        related_entity_id: workshopId || engagementId,
      })
      .select()
      .single()

    if (paymentError) throw paymentError

    // Process workshop registration
    if (workshopId) {
      const { data: workshop, error: workshopError } = await supabase
        .from('workshops')
        .select('capacity_remaining, title')
        .eq('id', workshopId)
        .single()

      if (workshopError || !workshop) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Workshop not found' }),
        }
      }

      // Update or create registration
      const { data: registration, error: regError } = await supabase
        .from('workshop_registrations')
        .upsert({
          workshop_id: workshopId,
          user_id: user.id,
          status: 'registered',
          price_paid: paymentIntent.amount / 100,
          payment_id: payment.id,
        })
        .select(`
          *,
          workshop:workshops(
            id,
            title,
            schedule_date,
            schedule_time,
            instructor:users!workshops_instructor_id_fkey(
              id,
              full_name,
              email
            )
          )
        `)
        .single()

      if (regError) throw regError

      // Decrement capacity
      const { error: capacityError } = await supabase
        .from('workshops')
        .update({ capacity_remaining: workshop.capacity_remaining - 1 })
        .eq('id', workshopId)

      if (capacityError) throw capacityError

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Payment successful and registration confirmed',
          registration,
          payment,
        }),
      }
    }

    // Process engagement payment
    if (engagementId) {
      const { data: engagement, error: engagementError } = await supabase
        .from('engagements')
        .update({
          status: 'active',
          payment_id: payment.id,
        })
        .eq('id', engagementId)
        .select(`
          *,
          expert:users!engagements_expert_id_fkey(
            id,
            full_name,
            email
          )
        `)
        .single()

      if (engagementError) throw engagementError

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Payment successful and engagement activated',
          engagement,
          payment,
        }),
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Payment processed successfully',
        payment,
      }),
    }
  } catch (error) {
    console.error('Payment processing error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to process payment',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    }
  }
}
