/**
 * Talent Marketplace API - Browse Experts
 * GET /api/talent - Browse talent profiles with filtering
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
 * GET /api/talent
 * Browse talent profiles with advanced filtering
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

    // Build query
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

    // Apply filters
    if (filters.expertise) {
      const expertiseList = filters.expertise.split(',').map(e => e.trim())
      query = query.overlaps('expertise', expertiseList)
    }

    if (filters.industries) {
      const industriesList = filters.industries.split(',').map(i => i.trim())
      query = query.overlaps('industries', industriesList)
    }

    if (filters.transformationStages) {
      const stagesList = filters.transformationStages.split(',').map(s => s.trim())
      query = query.overlaps('transformation_stages', stagesList)
    }

    if (filters.coachingStyle) {
      query = query.eq('coaching_style', filters.coachingStyle)
    }

    if (filters.availability) {
      query = query.eq('availability', filters.availability)
    }

    if (filters.minRating) {
      query = query.gte('rating', filters.minRating)
    }

    if (filters.minExperience) {
      query = query.gte('years_experience', filters.minExperience)
    }

    if (filters.maxHourlyRate) {
      query = query.lte('hourly_rate', filters.maxHourlyRate)
    }

    if (filters.search) {
      query = query.or(
        `tagline.ilike.%${filters.search}%,bio.ilike.%${filters.search}%`
      )
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
      })
    )
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
