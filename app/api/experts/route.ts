/**
 * Experts/Talent API - List & Create
 * GET /api/experts - List talent profiles with filtering
 * POST /api/experts - Create new talent profile
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  validateQueryParams,
  validateRequest,
  talentFilterSchema,
  createTalentProfileSchema,
} from '@/lib/api/validation'
import {
  APIErrors,
  successResponse,
  errorResponse,
  handleUnknownError,
} from '@/lib/api/errors'
import { requireAuth, requireRole } from '@/lib/api/auth'
import { enforceRateLimit } from '@/lib/api/rate-limit'

/**
 * GET /api/experts
 * List talent profiles with filtering and pagination
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
    const supabase = createClient()

    // Build query - only show public profiles accepting clients
    let query = supabase
      .from('talent_profiles')
      .select(`
        *,
        user:users!talent_profiles_user_id_fkey(
          id,
          full_name,
          email
        ),
        testimonials:talent_testimonials(
          id,
          client_name,
          client_company,
          quote,
          is_featured
        )
      `, { count: 'exact' })
      .eq('is_public', true)
      .eq('accepting_clients', true)

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

    if (filters.minRating !== undefined) {
      query = query.gte('rating', filters.minRating)
    }

    if (filters.minExperience !== undefined) {
      query = query.gte('years_experience', filters.minExperience)
    }

    if (filters.maxHourlyRate !== undefined) {
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

/**
 * POST /api/experts
 * Create new talent profile (experts and admins only)
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication and role
    const { user } = await requireRole(['expert', 'admin'])

    // Enforce rate limit
    await enforceRateLimit(request, 'standard', user.id)

    // Parse and validate request body
    const body = await request.json()
    const validation = validateRequest(createTalentProfileSchema, body)

    if (!validation.success) {
      return NextResponse.json(
        errorResponse(APIErrors.VALIDATION_ERROR(validation.errors)),
        { status: 400 }
      )
    }

    const profileData = validation.data
    const supabase = createClient()

    // Check if user already has a talent profile
    const { data: existingProfile } = await supabase
      .from('talent_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existingProfile) {
      return NextResponse.json(
        errorResponse(APIErrors.CONFLICT('User already has a talent profile')),
        { status: 409 }
      )
    }

    // Create talent profile
    const { data, error } = await supabase
      .from('talent_profiles')
      .insert({
        user_id: user.id,
        tagline: profileData.tagline,
        bio: profileData.bio,
        location: profileData.location,
        expertise: profileData.expertise,
        certifications: profileData.certifications,
        languages: profileData.languages,
        years_experience: profileData.yearsExperience,
        industries: profileData.industries,
        transformation_stages: profileData.transformationStages,
        coaching_style: profileData.coachingStyle,
        hourly_rate: profileData.hourlyRate,
        min_engagement_hours: profileData.minEngagementHours,
        max_hours_per_week: profileData.maxHoursPerWeek,
        avatar_url: profileData.avatarUrl,
        video_intro_url: profileData.videoIntroUrl,
        is_public: profileData.isPublic,
        accepting_clients: profileData.acceptingClients,
        rating: 0,
        review_count: 0,
        availability: 'available',
        cultures_transformed: 0,
        clients_transformed: 0,
        employees_reframed: 0,
      })
      .select(`
        *,
        user:users!talent_profiles_user_id_fkey(
          id,
          full_name,
          email
        )
      `)
      .single()

    if (error) throw error

    return NextResponse.json(successResponse(data), { status: 201 })
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
