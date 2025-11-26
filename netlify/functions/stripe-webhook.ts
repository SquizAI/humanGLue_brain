/**
 * Netlify Function: Stripe Webhook
 * POST /.netlify/functions/stripe-webhook
 * Handle Stripe webhook events for payment updates
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

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Email notification stubs - Replace with actual email service when ready
async function sendWorkshopConfirmationEmail(registration: any) {
  console.log('TODO: Send workshop confirmation email', {
    to: registration.user?.email,
    workshopTitle: registration.workshop?.title,
    registrationId: registration.id,
  })
  // TODO: Integrate with Resend, SendGrid, or other email service
  // Example:
  // await resend.emails.send({
  //   from: 'HumanGlue <noreply@humanglue.ai>',
  //   to: registration.user.email,
  //   subject: `Workshop Registration Confirmed: ${registration.workshop.title}`,
  //   html: confirmationEmailTemplate(registration),
  // })
}

async function sendEngagementActivationEmail(engagement: any) {
  console.log('TODO: Send engagement activation email', {
    clientEmail: engagement.client?.email,
    expertEmail: engagement.expert?.email,
    engagementId: engagement.id,
  })
  // TODO: Integrate with email service
}

async function sendPaymentFailureEmail(userEmail: string, details: any) {
  console.log('TODO: Send payment failure email', {
    to: userEmail,
    details,
  })
  // TODO: Integrate with email service
}

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
  console.log('Payment succeeded:', paymentIntent.id, {
    amount: paymentIntent.amount / 100,
    metadata: paymentIntent.metadata,
  })

  // Update payment status in database
  const { data: payment, error } = await supabase
    .from('payments')
    .update({
      status: 'succeeded',
      processed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('transaction_id', paymentIntent.id)
    .select()
    .single()

  if (error) {
    console.error('Failed to update payment status:', error)
    throw error
  }

  // If it's a workshop payment, ensure registration is confirmed
  const workshopId = paymentIntent.metadata.workshopId
  if (workshopId) {
    const userId = paymentIntent.metadata.userId

    // Create or update workshop registration
    const { data: registration, error: regError } = await supabase
      .from('workshop_registrations')
      .upsert({
        workshop_id: workshopId,
        user_id: userId,
        status: 'registered',
        price_paid: paymentIntent.amount / 100,
        payment_id: payment?.id,
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
        ),
        user:users(
          id,
          full_name,
          email
        )
      `)
      .single()

    if (regError) {
      console.error('Failed to confirm workshop registration:', regError)
      throw regError
    }

    console.log('Workshop registration confirmed:', {
      registrationId: registration?.id,
      workshopTitle: registration?.workshop?.title,
    })

    // Send confirmation email (stub for now)
    try {
      await sendWorkshopConfirmationEmail(registration)
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't throw - payment already succeeded
    }
  }

  // If it's an engagement payment, activate the engagement
  const engagementId = paymentIntent.metadata.engagementId
  if (engagementId) {
    const { data: engagement, error: engagementError } = await supabase
      .from('engagements')
      .update({
        status: 'active',
        payment_id: payment?.id,
      })
      .eq('id', engagementId)
      .select(`
        *,
        client:users!engagements_client_id_fkey(
          id,
          full_name,
          email
        ),
        expert:users!engagements_expert_id_fkey(
          id,
          full_name,
          email
        )
      `)
      .single()

    if (engagementError) {
      console.error('Failed to activate engagement:', engagementError)
      throw engagementError
    }

    console.log('Engagement activated:', {
      engagementId: engagement?.id,
    })

    // Send engagement activation email (stub for now)
    try {
      await sendEngagementActivationEmail(engagement)
    } catch (emailError) {
      console.error('Failed to send engagement activation email:', emailError)
      // Don't throw - payment already succeeded
    }
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id, {
    amount: paymentIntent.amount / 100,
    lastError: paymentIntent.last_payment_error,
    metadata: paymentIntent.metadata,
  })

  const { data: payment, error } = await supabase
    .from('payments')
    .update({
      status: 'failed',
      updated_at: new Date().toISOString(),
      metadata: {
        failure_code: paymentIntent.last_payment_error?.code,
        failure_message: paymentIntent.last_payment_error?.message,
      },
    })
    .eq('transaction_id', paymentIntent.id)
    .select()
    .single()

  if (error) {
    console.error('Failed to update payment status:', error)
    throw error
  }

  // Update workshop registration if applicable
  const workshopId = paymentIntent.metadata.workshopId
  if (workshopId) {
    const userId = paymentIntent.metadata.userId
    const userEmail = paymentIntent.metadata.userEmail

    const { error: regError } = await supabase
      .from('workshop_registrations')
      .update({ status: 'payment_failed' })
      .eq('workshop_id', workshopId)
      .eq('user_id', userId)

    if (regError) {
      console.error('Failed to update registration status:', regError)
      throw regError
    }

    // Send payment failure notification
    try {
      await sendPaymentFailureEmail(userEmail, {
        workshopId,
        workshopTitle: paymentIntent.metadata.workshopTitle,
        amount: paymentIntent.amount / 100,
        failureReason: paymentIntent.last_payment_error?.message,
      })
    } catch (emailError) {
      console.error('Failed to send payment failure email:', emailError)
    }
  }

  // Update engagement if applicable
  const engagementId = paymentIntent.metadata.engagementId
  if (engagementId) {
    const userEmail = paymentIntent.metadata.userEmail

    const { error: engagementError } = await supabase
      .from('engagements')
      .update({
        status: 'payment_failed',
      })
      .eq('id', engagementId)

    if (engagementError) {
      console.error('Failed to update engagement status:', engagementError)
    }

    try {
      await sendPaymentFailureEmail(userEmail, {
        engagementId,
        amount: paymentIntent.amount / 100,
        failureReason: paymentIntent.last_payment_error?.message,
      })
    } catch (emailError) {
      console.error('Failed to send payment failure email:', emailError)
    }
  }
}

async function handleRefund(charge: Stripe.Charge) {
  console.log('Charge refunded:', charge.id, {
    amount: charge.amount / 100,
    amountRefunded: charge.amount_refunded / 100,
    refunds: charge.refunds,
  })

  // Find payment by charge ID or payment intent ID
  const paymentIntentId = typeof charge.payment_intent === 'string'
    ? charge.payment_intent
    : charge.payment_intent?.id

  if (!paymentIntentId) {
    console.error('No payment intent ID found for refunded charge')
    return
  }

  const { data: payment, error } = await supabase
    .from('payments')
    .update({
      status: 'refunded',
      refund_amount: charge.amount_refunded / 100,
      refunded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('transaction_id', paymentIntentId)
    .select()
    .single()

  if (error) {
    console.error('Failed to update refund status:', error)
    throw error
  }

  // Handle workshop refund - restore capacity
  if (payment?.payment_type === 'workshop' && payment.related_entity_id) {
    const { error: regError } = await supabase
      .from('workshop_registrations')
      .update({ status: 'cancelled' })
      .eq('workshop_id', payment.related_entity_id)
      .eq('payment_id', payment.id)

    if (regError) {
      console.error('Failed to cancel workshop registration:', regError)
    } else {
      console.log('Workshop registration cancelled due to refund')
    }
  }

  // Handle engagement refund
  if (payment?.payment_type === 'engagement' && payment.related_entity_id) {
    const { error: engagementError } = await supabase
      .from('engagements')
      .update({ status: 'cancelled' })
      .eq('id', payment.related_entity_id)
      .eq('payment_id', payment.id)

    if (engagementError) {
      console.error('Failed to cancel engagement:', engagementError)
    } else {
      console.log('Engagement cancelled due to refund')
    }
  }
}
