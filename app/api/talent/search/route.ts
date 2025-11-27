/**
 * Talent Search API
 * GET /api/talent/search - Advanced search with full-text search
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateQueryParams, talentFilterSchema } from '@/lib/api/validation'
import {
  APIErrors,
  successResponse,
  errorResponse,
  handleUnknownError,
} from '@/lib/api/errors'

/**
 * GET /api/talent/search
 * Advanced search with full-text capabilities
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Validate query parameters
    const validation = validateQueryParams(talentFilterSchema, searchParams)
    if (!validation.success) {
      return NextResponse.json(
        errorResponse(APIErrors.INVALID_QUERY_PARAMS(validation.errors)),
        { status: 400 }
      )
    }

    const filters = validation.data
    const supabase = await createClient()

    if (!filters.search) {
      return NextResponse.json(
        errorResponse(APIErrors.MISSING_REQUIRED_FIELDS(['search'])),
        { status: 400 }
      )
    }

    // Use RPC function for full-text search if available
    // Otherwise fall back to ILIKE search
    const searchTerm = filters.search.toLowerCase()

    let query = supabase
      .from('talent_profiles')
      .select(`
        *,
        user:users!talent_profiles_user_id_fkey(
          id,
          full_name,
          avatar_url
        ),
        testimonials:talent_testimonials(
          count
        )
      `, { count: 'exact' })
      .eq('is_public', true)

    // Apply search across multiple fields
    query = query.or(
      `tagline.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%,expertise.cs.{${searchTerm}},industries.cs.{${searchTerm}}`
    )

    // Apply additional filters
    if (filters.minRating) {
      query = query.gte('rating', filters.minRating)
    }

    if (filters.availability) {
      query = query.eq('availability', filters.availability)
    }

    if (filters.coachingStyle) {
      query = query.eq('coaching_style', filters.coachingStyle)
    }

    if (filters.maxHourlyRate) {
      query = query.lte('hourly_rate', filters.maxHourlyRate)
    }

    // Apply pagination
    const from = ((filters.page || 1) - 1) * (filters.limit || 10)
    const to = from + (filters.limit || 10) - 1

    query = query
      .range(from, to)
      .order('rating', { ascending: false })
      .order('review_count', { ascending: false })

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json(
      successResponse(data, {
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 10,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / (filters.limit || 10)),
        },
        search: {
          query: filters.search,
          resultsCount: count || 0,
        },
      })
    )
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
