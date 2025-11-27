/**
 * Netlify Function: Get Workshop Detail
 * GET /.netlify/functions/workshops-detail?id={workshopId}
 * Retrieve detailed information for a specific workshop
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
    const workshopId = event.queryStringParameters?.id

    if (!workshopId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required parameter: id',
        }),
      }
    }

    // Fetch workshop with instructor details
    const { data: workshop, error: workshopError } = await supabase
      .from('workshops')
      .select(
        `
        *,
        instructor:users!instructor_id(
          id,
          full_name,
          email,
          avatar_url,
          bio
        )
      `
      )
      .eq('id', workshopId)
      .single()

    if (workshopError) {
      if (workshopError.code === 'PGRST116') {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            error: 'Workshop not found',
          }),
        }
      }

      console.error('Error fetching workshop:', workshopError)
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Failed to fetch workshop',
          message: workshopError.message,
        }),
      }
    }

    // If workshop is not published, only allow instructor or admin to view
    if (workshop.status !== 'published') {
      const authHeader = event.headers.authorization
      if (!authHeader) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Workshop not found' }),
        }
      }

      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)

      if (authError || !user) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Workshop not found' }),
        }
      }

      // Check if user is instructor or admin
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      const isInstructor = workshop.instructor_id === user.id
      const isAdmin = userRole?.role === 'admin'

      if (!isInstructor && !isAdmin) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Workshop not found' }),
        }
      }
    }

    // Get workshop statistics (registration count, average rating)
    const { data: registrations, error: regError } = await supabase
      .from('workshop_registrations')
      .select('id, status, rating')
      .eq('workshop_id', workshopId)

    let stats = {
      total_registered: 0,
      completed: 0,
      average_rating: null as number | null,
      spots_remaining: workshop.capacity_remaining,
    }

    if (!regError && registrations) {
      stats.total_registered = registrations.length
      stats.completed = registrations.filter((r) => r.status === 'completed').length

      const ratings = registrations.filter((r) => r.rating).map((r) => r.rating)
      if (ratings.length > 0) {
        stats.average_rating =
          Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10
      }
    }

    // Get approved reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(
        `
        id,
        rating,
        title,
        review_text,
        created_at,
        user_id,
        users!reviews_user_id_fkey(
          full_name,
          avatar_url
        )
      `
      )
      .eq('workshop_id', workshopId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(10)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          ...workshop,
          stats,
          reviews: reviews || [],
        },
      }),
    }
  } catch (error) {
    console.error('Workshop detail endpoint error:', error)
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
