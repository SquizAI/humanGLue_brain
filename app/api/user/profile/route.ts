/**
 * User Profile API
 * GET /api/user/profile - Get current user's profile
 * PATCH /api/user/profile - Update current user's profile
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateRequest, updateProfileSchema } from '@/lib/api/validation'
import {
  APIErrors,
  successResponse,
  errorResponse,
  handleUnknownError,
} from '@/lib/api/errors'
import { requireAuth } from '@/lib/api/auth'
import { enforceRateLimit } from '@/lib/api/rate-limit'

/**
 * GET /api/user/profile
 * Get current authenticated user's profile
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = createClient()

    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        roles:user_roles(
          role,
          organization_id,
          expires_at
        ),
        talent_profile:talent_profiles(
          id,
          tagline,
          rating,
          review_count
        )
      `)
      .eq('id', user.id)
      .single()

    if (error) throw error

    return NextResponse.json(successResponse(data))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}

/**
 * PATCH /api/user/profile
 * Update current user's profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Enforce rate limit
    await enforceRateLimit(request, 'standard', user.id)

    // Parse and validate request body
    const body = await request.json()
    const validation = validateRequest(updateProfileSchema, body)

    if (!validation.success) {
      return NextResponse.json(
        errorResponse(APIErrors.VALIDATION_ERROR(validation.errors)),
        { status: 400 }
      )
    }

    const updates = validation.data
    const supabase = createClient()

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (updates.fullName !== undefined) updateData.full_name = updates.fullName
    if (updates.companyName !== undefined) updateData.company_name = updates.companyName
    if (updates.bio !== undefined) updateData.bio = updates.bio
    if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl
    if (updates.metadata !== undefined) updateData.metadata = updates.metadata

    // Update profile
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select(`
        *,
        roles:user_roles(
          role,
          organization_id,
          expires_at
        ),
        talent_profile:talent_profiles(
          id,
          tagline,
          rating,
          review_count
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
