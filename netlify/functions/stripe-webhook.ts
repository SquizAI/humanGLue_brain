/**
 * Netlify Function: Stripe Webhook
 * POST /.netlify/functions/stripe-webhook
 * Handle Stripe webhook events for payment updates
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

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  const sig = event.headers['stripe-signature']

  if (!sig) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing stripe-signature header' }),
    }
  }

  let stripeEvent: Stripe.Event

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body!,
      sig,
      webhookSecret
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Webhook signature verification failed',
      }),
    }
  }

  try {
    // Handle different event types
    switch (stripeEvent.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(stripeEvent.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(stripeEvent.data.object as Stripe.PaymentIntent)
        break

      case 'charge.refunded':
        await handleRefund(stripeEvent.data.object as Stripe.Charge)
        break

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`)
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    }
  } catch (error) {
    console.error('Webhook handler error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Webhook handler failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    }
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id)

  // Update payment status in database
  const { error } = await supabase
    .from('payments')
    .update({
      status: 'succeeded',
      updated_at: new Date().toISOString(),
    })
    .eq('transaction_id', paymentIntent.id)

  if (error) {
    console.error('Failed to update payment status:', error)
    throw error
  }

  // If it's a workshop payment, ensure registration is confirmed
  const workshopId = paymentIntent.metadata.workshopId
  if (workshopId) {
    const userId = paymentIntent.metadata.userId

    const { error: regError } = await supabase
      .from('workshop_registrations')
      .update({ status: 'registered' })
      .eq('workshop_id', workshopId)
      .eq('user_id', userId)

    if (regError) {
      console.error('Failed to confirm workshop registration:', regError)
    }
  }

  // If it's an engagement payment, activate the engagement
  const engagementId = paymentIntent.metadata.engagementId
  if (engagementId) {
    const { error: engagementError } = await supabase
      .from('engagements')
      .update({ status: 'active' })
      .eq('id', engagementId)

    if (engagementError) {
      console.error('Failed to activate engagement:', engagementError)
    }
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id)

  const { error } = await supabase
    .from('payments')
    .update({
      status: 'failed',
      updated_at: new Date().toISOString(),
    })
    .eq('transaction_id', paymentIntent.id)

  if (error) {
    console.error('Failed to update payment status:', error)
    throw error
  }

  // Update workshop registration if applicable
  const workshopId = paymentIntent.metadata.workshopId
  if (workshopId) {
    const userId = paymentIntent.metadata.userId

    const { error: regError } = await supabase
      .from('workshop_registrations')
      .update({ status: 'payment_failed' })
      .eq('workshop_id', workshopId)
      .eq('user_id', userId)

    if (regError) {
      console.error('Failed to update registration status:', regError)
    }
  }
}

async function handleRefund(charge: Stripe.Charge) {
  console.log('Charge refunded:', charge.id)

  // Find payment by charge ID or payment intent ID
  const paymentIntentId = typeof charge.payment_intent === 'string'
    ? charge.payment_intent
    : charge.payment_intent?.id

  if (!paymentIntentId) {
    console.error('No payment intent ID found for refunded charge')
    return
  }

  const { error } = await supabase
    .from('payments')
    .update({
      status: 'refunded',
      refund_amount: charge.amount_refunded / 100,
      refunded_at: new Date().toISOString(),
    })
    .eq('transaction_id', paymentIntentId)

  if (error) {
    console.error('Failed to update refund status:', error)
    throw error
  }
}
