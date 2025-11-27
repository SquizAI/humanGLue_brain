/**
 * Netlify Function: Get User's Workshops
 * GET /.netlify/functions/workshops-my-workshops
 * Retrieve all workshop registrations for the authenticated user
 */

import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
}

export const handler: Handler = async (event, context) => {
  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'GET') {
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

    // Parse query parameters for filtering
    const params = event.queryStringParameters || {}
    const { status, limit = '50', offset = '0' } = params

    // Build query
    let query = supabase
      .from('workshop_registrations')
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
        ),
        payment:payments(
          id,
          amount,
          status,
          transaction_id,
          created_at
        )
      `,
        { count: 'exact' }
      )
      .eq('user_id', user.id)

    // Filter by status if provided
    if (status && ['registered', 'completed', 'cancelled', 'no_show'].includes(status)) {
      query = query.eq('status', status)
    }

    // Order by registration date (most recent first)
    query = query.order('registered_at', { ascending: false })

    // Pagination
    const limitNum = Math.min(parseInt(limit) || 50, 100) // Max 100
    const offsetNum = parseInt(offset) || 0
    query = query.range(offsetNum, offsetNum + limitNum - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching user workshops:', error)
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Failed to fetch workshops',
          message: error.message,
        }),
      }
    }

    // Categorize workshops
    const categorized = {
      upcoming: [],
      completed: [],
      cancelled: [],
    } as {
      upcoming: any[]
      completed: any[]
      cancelled: any[]
    }

    const now = new Date()

    data?.forEach((registration) => {
      if (registration.status === 'cancelled') {
        categorized.cancelled.push(registration)
      } else if (registration.status === 'completed') {
        categorized.completed.push(registration)
      } else if (registration.status === 'registered') {
        // Check if workshop is in the future
        const workshopDate = registration.workshop?.schedule_date
        if (workshopDate) {
          const scheduleDate = new Date(workshopDate)
          if (scheduleDate >= now) {
            categorized.upcoming.push(registration)
          } else {
            // Past workshop but not marked completed
            categorized.completed.push(registration)
          }
        } else {
          // No schedule date, consider it upcoming
          categorized.upcoming.push(registration)
        }
      }
    })

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: data || [],
        categorized,
        pagination: {
          total: count || 0,
          limit: limitNum,
          offset: offsetNum,
          hasMore: count ? offsetNum + limitNum < count : false,
        },
      }),
    }
  } catch (error) {
    console.error('My workshops endpoint error:', error)
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
