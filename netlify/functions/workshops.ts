/**
 * Netlify Function: Get Workshops
 * GET /.netlify/functions/workshops
 * Retrieve all published workshops with optional filters
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

// Rate limiting (simple in-memory implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 100 // requests per minute
const RATE_WINDOW = 60 * 1000 // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = requestCounts.get(ip)

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_WINDOW })
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

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    // Rate limiting
    const ip = event.headers['x-forwarded-for']?.split(',')[0] || 'unknown'
    if (!checkRateLimit(ip)) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({
          error: 'Too many requests. Please try again later.',
        }),
      }
    }

    // Parse query parameters
    const params = event.queryStringParameters || {}
    const {
      pillar,
      level,
      format,
      is_featured,
      search,
      limit = '20',
      offset = '0',
    } = params

    // Build query
    let query = supabase
      .from('workshops')
      .select(
        `
        *,
        instructor:users!instructor_id(
          full_name,
          email,
          avatar_url
        )
      `,
        { count: 'exact' }
      )
      .eq('status', 'published')

    // Apply filters
    if (pillar && ['adaptability', 'coaching', 'marketplace'].includes(pillar)) {
      query = query.eq('pillar', pillar)
    }

    if (level && ['beginner', 'intermediate', 'advanced'].includes(level)) {
      query = query.eq('level', level)
    }

    if (format && ['live', 'hybrid', 'recorded'].includes(format)) {
      query = query.eq('format', format)
    }

    if (is_featured === 'true') {
      query = query.eq('is_featured', true)
    }

    // Full-text search
    if (search) {
      const searchTerm = search.trim()
      query = query.or(
        `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
      )
    }

    // Order by featured first, then by schedule date
    query = query.order('is_featured', { ascending: false })
    query = query.order('schedule_date', { ascending: true, nullsFirst: false })

    // Pagination
    const limitNum = Math.min(parseInt(limit) || 20, 100) // Max 100
    const offsetNum = parseInt(offset) || 0
    query = query.range(offsetNum, offsetNum + limitNum - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching workshops:', error)
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Failed to fetch workshops',
          message: error.message,
        }),
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: data || [],
        pagination: {
          total: count || 0,
          limit: limitNum,
          offset: offsetNum,
          hasMore: count ? offsetNum + limitNum < count : false,
        },
      }),
    }
  } catch (error) {
    console.error('Workshops endpoint error:', error)
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
