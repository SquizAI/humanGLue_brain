/**
 * Experts/Talent API - Individual Talent Profile Operations
 * GET /api/experts/[id] - Get talent profile details
 * PUT /api/experts/[id] - Update talent profile
 * DELETE /api/experts/[id] - Delete talent profile
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateRequest, updateTalentProfileSchema } from '@/lib/api/validation'
import {
  APIErrors,
  successResponse,
  errorResponse,
  handleUnknownError,
} from '@/lib/api/errors'
import { requireAuth, requireOwnership } from '@/lib/api/auth'
import { enforceRateLimit } from '@/lib/api/rate-limit'

/**
 * GET /api/experts/[id]
 * Get talent profile details with testimonials and engagements
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('talent_profiles')
      .select(`
        *,
        user:users!talent_profiles_user_id_fkey(
          id,
          full_name,
          email,
          avatar_url
        ),
        testimonials:talent_testimonials(
          id,
          client_name,
          client_company,
          client_title,
          quote,
          metric,
          verified,
          is_featured,
          display_order
        ),
        engagements:engagements!engagements_expert_id_fkey(
          id,
          title,
          status,
          focus_area,
          client_satisfaction_score
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse(APIErrors.NOT_FOUND('Talent profile')),
          { status: 404 }
        )
      }
      throw error
    }

    // Only show public profiles unless it's the owner or admin viewing
    if (!data.is_public) {
      try {
        const user = await requireAuth()
        await requireOwnership(user, data.user_id)
      } catch {
        return NextResponse.json(
          errorResponse(APIErrors.NOT_FOUND('Talent profile')),
          { status: 404 }
        )
      }
    }

    return NextResponse.json(successResponse(data))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}

/**
 * PUT /api/experts/[id]
 * Update talent profile (owner or admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await requireAuth()
    const supabase = await createClient()

    // Enforce rate limit
    await enforceRateLimit(request, 'standard', user.id)

    // Get talent profile to verify ownership
    const { data: profile, error: fetchError } = await supabase
      .from('talent_profiles')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse(APIErrors.NOT_FOUND('Talent profile')),
          { status: 404 }
        )
      }
      throw fetchError
    }

    // Check ownership
    await requireOwnership(user, profile.user_id)

    // Parse and validate request body
    const body = await request.json()
    const validation = validateRequest(updateTalentProfileSchema, body)

    if (!validation.success) {
      return NextResponse.json(
        errorResponse(APIErrors.VALIDATION_ERROR(validation.errors)),
        { status: 400 }
      )
    }

    const updates = validation.data

    // Build update object
    const updateData: Record<string, unknown> = {}

    if (updates.tagline !== undefined) updateData.tagline = updates.tagline
    if (updates.bio !== undefined) updateData.bio = updates.bio
    if (updates.location !== undefined) updateData.location = updates.location
    if (updates.expertise !== undefined) updateData.expertise = updates.expertise
    if (updates.certifications !== undefined) updateData.certifications = updates.certifications
    if (updates.languages !== undefined) updateData.languages = updates.languages
    if (updates.yearsExperience !== undefined) updateData.years_experience = updates.yearsExperience
    if (updates.industries !== undefined) updateData.industries = updates.industries
    if (updates.transformationStages !== undefined) updateData.transformation_stages = updates.transformationStages
    if (updates.coachingStyle !== undefined) updateData.coaching_style = updates.coachingStyle
    if (updates.hourlyRate !== undefined) updateData.hourly_rate = updates.hourlyRate
    if (updates.minEngagementHours !== undefined) updateData.min_engagement_hours = updates.minEngagementHours
    if (updates.maxHoursPerWeek !== undefined) updateData.max_hours_per_week = updates.maxHoursPerWeek
    if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl
    if (updates.videoIntroUrl !== undefined) updateData.video_intro_url = updates.videoIntroUrl
    if (updates.isPublic !== undefined) updateData.is_public = updates.isPublic
    if (updates.acceptingClients !== undefined) updateData.accepting_clients = updates.acceptingClients

    updateData.updated_at = new Date().toISOString()

    // Update talent profile
    const { data, error } = await supabase
      .from('talent_profiles')
      .update(updateData)
      .eq('id', id)
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

    return NextResponse.json(successResponse(data))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}

/**
 * DELETE /api/experts/[id]
 * Delete talent profile (owner or admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await requireAuth()
    const supabase = await createClient()

    // Get talent profile to verify ownership
    const { data: profile, error: fetchError } = await supabase
      .from('talent_profiles')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse(APIErrors.NOT_FOUND('Talent profile')),
          { status: 404 }
        )
      }
      throw fetchError
    }

    // Check ownership
    await requireOwnership(user, profile.user_id)

    // Check if profile has active engagements
    const { count } = await supabase
      .from('engagements')
      .select('*', { count: 'exact', head: true })
      .eq('expert_id', profile.user_id)
      .in('status', ['pending', 'active'])

    if (count && count > 0) {
      return NextResponse.json(
        errorResponse(
          APIErrors.CONFLICT(
            'Cannot delete talent profile with active engagements. Please complete or cancel all active engagements first.'
          )
        ),
        { status: 409 }
      )
    }

    // Delete talent profile
    const { error } = await supabase
      .from('talent_profiles')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json(
      successResponse({ message: 'Talent profile deleted successfully' })
    )
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
