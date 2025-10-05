/**
 * Users API - List & Create
 * GET /api/users - List users (admin only)
 * POST /api/users - Create new user (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import {
  validateQueryParams,
  validateRequest,
  userFilterSchema,
  createUserSchema,
} from '@/lib/api/validation'
import {
  APIErrors,
  successResponse,
  errorResponse,
  handleUnknownError,
} from '@/lib/api/errors'
import { requireRole } from '@/lib/api/auth'
import { enforceRateLimit } from '@/lib/api/rate-limit'

/**
 * GET /api/users
 * List users with filtering and pagination (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin role
    const { user } = await requireRole(['admin'])

    const { searchParams } = new URL(request.url)

    // Validate query parameters
    const validation = validateQueryParams(userFilterSchema, searchParams)
    if (!validation.success) {
      return NextResponse.json(
        errorResponse(APIErrors.INVALID_QUERY_PARAMS(validation.errors)),
        { status: 400 }
      )
    }

    const filters = validation.data
    const supabase = createClient()

    // Build query
    let query = supabase
      .from('users')
      .select(`
        *,
        roles:user_roles(
          id,
          role,
          organization_id,
          granted_at
        )
      `, { count: 'exact' })

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.search) {
      query = query.or(
        `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`
      )
    }

    // Filter by role if specified
    if (filters.role) {
      // Join with user_roles table
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', filters.role)

      if (roleError) throw roleError

      const userIds = userRoles.map(ur => ur.user_id)
      if (userIds.length > 0) {
        query = query.in('id', userIds)
      } else {
        // No users with this role
        return NextResponse.json(
          successResponse([], {
            pagination: {
              page: filters.page || 1,
              limit: filters.limit || 10,
              total: 0,
              totalPages: 0,
            },
          })
        )
      }
    }

    // Apply pagination
    const from = ((filters.page || 1) - 1) * (filters.limit || 10)
    const to = from + (filters.limit || 10) - 1

    query = query
      .range(from, to)
      .order('created_at', { ascending: false })

    const { data, error, count } = await query

    if (error) throw error

    // Remove sensitive data
    const sanitizedData = data?.map(u => ({
      ...u,
      metadata: undefined, // Don't expose raw metadata
    }))

    return NextResponse.json(
      successResponse(sanitizedData, {
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
 * POST /api/users
 * Create new user (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin role
    const { user: adminUser } = await requireRole(['admin'])

    // Enforce rate limit
    await enforceRateLimit(request, 'standard', adminUser.id)

    // Parse and validate request body
    const body = await request.json()
    const validation = validateRequest(createUserSchema, body)

    if (!validation.success) {
      return NextResponse.json(
        errorResponse(APIErrors.VALIDATION_ERROR(validation.errors)),
        { status: 400 }
      )
    }

    const userData = validation.data

    // Use admin client to create user
    const supabaseAdmin = createAdminClient()

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      email_confirm: true,
      user_metadata: {
        full_name: userData.fullName,
        company_name: userData.companyName,
        job_title: userData.jobTitle,
      },
    })

    if (authError) throw authError

    // Create user profile
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: userData.email,
        full_name: userData.fullName,
        company_name: userData.companyName,
        job_title: userData.jobTitle,
        phone: userData.phone,
        status: 'active',
      })
      .select()
      .single()

    if (profileError) throw profileError

    // Assign role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: userData.role,
        granted_by: adminUser.id,
      })

    if (roleError) throw roleError

    return NextResponse.json(successResponse(profileData), { status: 201 })
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
