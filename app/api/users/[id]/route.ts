/**
 * Users API - Individual User Operations
 * GET /api/users/[id] - Get user details
 * PUT /api/users/[id] - Update user
 * DELETE /api/users/[id] - Delete user (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { validateRequest, updateUserSchema } from '@/lib/api/validation'
import {
  APIErrors,
  successResponse,
  errorResponse,
  handleUnknownError,
} from '@/lib/api/errors'
import { requireAuth, checkResourceOwnership } from '@/lib/api/auth'
import { enforceRateLimit } from '@/lib/api/rate-limit'

/**
 * GET /api/users/[id]
 * Get user details (own profile or admin)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const user = await requireAuth()
    const supabase = createClient()

    // Check if user can access this profile
    const canAccess = await checkResourceOwnership(user.id, id)
    if (!canAccess) {
      return NextResponse.json(
        errorResponse(APIErrors.FORBIDDEN('Cannot access this user profile')),
        { status: 403 }
      )
    }

    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        roles:user_roles(
          id,
          role,
          organization_id,
          granted_at,
          expires_at
        ),
        talent_profile:talent_profiles(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse(APIErrors.NOT_FOUND('User')),
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json(successResponse(data))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}

/**
 * PUT /api/users/[id]
 * Update user (own profile or admin)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const user = await requireAuth()
    const supabase = createClient()

    // Enforce rate limit
    await enforceRateLimit(request, 'standard', user.id)

    // Check if user can update this profile
    const canUpdate = await checkResourceOwnership(user.id, id)
    if (!canUpdate) {
      return NextResponse.json(
        errorResponse(APIErrors.FORBIDDEN('Cannot update this user profile')),
        { status: 403 }
      )
    }

    // Verify user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, status')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse(APIErrors.NOT_FOUND('User')),
          { status: 404 }
        )
      }
      throw fetchError
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = validateRequest(updateUserSchema, body)

    if (!validation.success) {
      return NextResponse.json(
        errorResponse(APIErrors.VALIDATION_ERROR(validation.errors)),
        { status: 400 }
      )
    }

    const updates = validation.data

    // Build update object
    const updateData: Record<string, unknown> = {}

    if (updates.fullName !== undefined) updateData.full_name = updates.fullName
    if (updates.companyName !== undefined) updateData.company_name = updates.companyName
    if (updates.jobTitle !== undefined) updateData.job_title = updates.jobTitle
    if (updates.phone !== undefined) updateData.phone = updates.phone
    if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl
    if (updates.metadata !== undefined) updateData.metadata = updates.metadata

    // Only admins can update status
    if (updates.status !== undefined && user.id !== id) {
      updateData.status = updates.status
    }

    updateData.updated_at = new Date().toISOString()

    // Update user
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        roles:user_roles(
          id,
          role,
          organization_id
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
 * DELETE /api/users/[id]
 * Delete user (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const user = await requireAuth()

    // Only admins can delete users
    const supabase = createClient()
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!roleData || roleData.role !== 'admin') {
      return NextResponse.json(
        errorResponse(APIErrors.FORBIDDEN('Only admins can delete users')),
        { status: 403 }
      )
    }

    // Cannot delete self
    if (user.id === id) {
      return NextResponse.json(
        errorResponse(APIErrors.FORBIDDEN('Cannot delete your own account')),
        { status: 403 }
      )
    }

    // Verify user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse(APIErrors.NOT_FOUND('User')),
          { status: 404 }
        )
      }
      throw fetchError
    }

    // Use admin client to delete auth user
    const supabaseAdmin = createAdminClient()

    // Delete auth user (this will cascade to profile due to foreign key)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(id)

    if (deleteError) throw deleteError

    return NextResponse.json(
      successResponse({
        message: 'User deleted successfully',
        deletedUserId: id,
      })
    )
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
