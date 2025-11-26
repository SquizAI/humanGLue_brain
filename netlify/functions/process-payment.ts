/**
 * Netlify Function: Process Payment
 * POST /.netlify/functions/process-payment
 * Complete payment and create registration/engagement
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

    // Check for duplicate payment record
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('*')
      .eq('transaction_id', paymentIntent.id)
      .single()

    let payment = existingPayment

    if (!existingPayment) {
      // Record payment in database
      const { data: newPayment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency.toUpperCase(),
          provider: 'stripe',
          transaction_id: paymentIntent.id,
          provider_customer_id: paymentIntent.customer as string | null,
          status: 'succeeded',
          processed_at: new Date().toISOString(),
          payment_type: workshopId ? 'workshop' : 'engagement',
          related_entity_id: workshopId || engagementId,
          metadata: paymentIntent.metadata,
        })
        .select()
        .single()

      if (paymentError) {
        console.error('Failed to create payment record:', paymentError)
        throw paymentError
      }
      payment = newPayment
    } else if (existingPayment.status !== 'succeeded') {
      // Update existing payment record
      const { data: updatedPayment, error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'succeeded',
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingPayment.id)
        .select()
        .single()

      if (updateError) {
        console.error('Failed to update payment record:', updateError)
        throw updateError
      }
      payment = updatedPayment
    }

    // Verify user owns this payment
    if (payment.user_id !== user.id) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Unauthorized - payment belongs to another user' }),
      }
    }

    // Process workshop registration
    if (workshopId) {
      // Check if already registered
      const { data: existingReg } = await supabase
        .from('workshop_registrations')
        .select('id, status')
        .eq('workshop_id', workshopId)
        .eq('user_id', user.id)
        .single()

      if (existingReg?.status === 'registered') {
        // Already registered, return existing registration
        const { data: registration } = await supabase
          .from('workshop_registrations')
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
          .eq('id', existingReg.id)
          .single()

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'Already registered for this workshop',
            registration,
            payment,
            alreadyRegistered: true,
          }),
        }
      }

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

      if (workshop.capacity_remaining <= 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Workshop is now sold out' }),
        }
      }

      // Create or update registration
      const { data: registration, error: regError } = await supabase
        .from('workshop_registrations')
        .upsert({
          workshop_id: workshopId,
          user_id: user.id,
          status: 'registered',
          price_paid: paymentIntent.amount / 100,
          payment_id: payment.id,
        }, {
          onConflict: 'workshop_id,user_id',
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

      if (regError) {
        console.error('Failed to create/update registration:', regError)
        throw regError
      }

      // Note: Capacity is automatically decremented by the database trigger
      // when status is 'registered'

      console.log('Workshop registration successful:', {
        registrationId: registration.id,
        workshopId,
        userId: user.id,
      })

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
