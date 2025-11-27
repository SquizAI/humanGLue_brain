/**
 * Netlify Function: Register for Workshop
 * POST /.netlify/functions/workshops-register
 * Creates a workshop registration after successful payment
 */

import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

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

// Rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 10 // requests per minute (stricter for registration)
const RATE_WINDOW = 60 * 1000 // 1 minute

function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const record = requestCounts.get(identifier)

  if (!record || now > record.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + RATE_WINDOW })
    return true
  }

  if (record.count >= RATE_LIMIT) {
    return false
  }

  record.count++
  return true
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

    // Rate limiting by user
    if (!checkRateLimit(user.id)) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({
          error: 'Too many registration attempts. Please try again later.',
        }),
      }
    }

    // Parse request body
    const body = JSON.parse(event.body || '{}')
    const { workshopId, paymentId } = body

    if (!workshopId || !paymentId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required fields: workshopId, paymentId',
        }),
      }
    }

    // Verify payment exists and is successful
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, status, amount, user_id, payment_type, related_entity_id')
      .eq('id', paymentId)
      .single()

    if (paymentError || !payment) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Payment not found' }),
      }
    }

    if (payment.user_id !== user.id) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Payment does not belong to user' }),
      }
    }

    if (payment.status !== 'succeeded') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Payment must be successful before registration',
          paymentStatus: payment.status,
        }),
      }
    }

    if (payment.payment_type !== 'workshop' || payment.related_entity_id !== workshopId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Payment is not for this workshop',
        }),
      }
    }

    // Check if workshop exists and has capacity
    const { data: workshop, error: workshopError } = await supabase
      .from('workshops')
      .select('id, title, capacity_remaining, status, price_amount, price_early_bird')
      .eq('id', workshopId)
      .single()

    if (workshopError || !workshop) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Workshop not found' }),
      }
    }

    if (workshop.status !== 'published') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Workshop is not available for registration',
        }),
      }
    }

    if (workshop.capacity_remaining <= 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Workshop is fully booked',
        }),
      }
    }

    // Check if user is already registered
    const { data: existingRegistration } = await supabase
      .from('workshop_registrations')
      .select('id, status')
      .eq('workshop_id', workshopId)
      .eq('user_id', user.id)
      .single()

    if (existingRegistration) {
      if (existingRegistration.status === 'registered') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'You are already registered for this workshop',
          }),
        }
      }
      if (existingRegistration.status === 'completed') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'You have already completed this workshop',
          }),
        }
      }
    }

    // Create registration
    // Note: The database trigger will automatically decrement capacity_remaining
    const { data: registration, error: registrationError } = await supabase
      .from('workshop_registrations')
      .insert({
        workshop_id: workshopId,
        user_id: user.id,
        payment_id: paymentId,
        price_paid: payment.amount,
        status: 'registered',
        metadata: {
          registered_via: 'web',
          workshop_title: workshop.title,
        },
      })
      .select(
        `
        *,
        workshop:workshops(
          *,
          instructor:users!instructor_id(
            full_name,
            email,
            avatar_url
          )
        )
      `
      )
      .single()

    if (registrationError) {
      console.error('Registration error:', registrationError)

      // Check if it's a capacity error
      if (registrationError.message.includes('full capacity')) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Workshop became fully booked while processing your registration',
          }),
        }
      }

      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Failed to create registration',
          message: registrationError.message,
        }),
      }
    }

    // TODO: Send confirmation email
    // TODO: Add to calendar
    // TODO: Send notification to instructor

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Successfully registered for workshop',
        data: registration,
      }),
    }
  } catch (error) {
    console.error('Workshop registration endpoint error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    }
  }
}
