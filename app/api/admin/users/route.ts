/**
 * Admin User Management API
 * POST /api/admin/users - Create a single user
 * GET /api/admin/users - List users with pagination, search, and filters
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import {
  APIErrors,
  successResponse,
  errorResponse,
  handleUnknownError,
} from '@/lib/api/errors'
import { emailService } from '@/services/email'
import {
  verifyAdmin,
  generateSecurePassword,
  canAssignRole,
  isValidEmail,
  isValidRole,
  sanitizeString,
  logAuditAction,
  type UserRole,
  type AdminUser,
} from '@/lib/admin/utils'

// ============================================================
// TYPES
// ============================================================

interface CreateUserRequest {
  email: string
  fullName?: string
  role?: string
  phone?: string
  jobTitle?: string
  companyName?: string
  organizationId?: string
  sendInvite?: boolean
}

interface CreateUserResponse {
  userId: string
  email: string
  fullName: string
  role: string
  organizationId?: string
  emailSent: boolean
  temporaryPassword?: string
}

// ============================================================
// POST /api/admin/users - Create a single user
// ============================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const supabaseAdmin = await createAdminClient()

    // Verify admin status and get their info
    const user = await verifyAdmin(supabase)

    // Fetch admin roles for the verified user
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
    const adminRoles = (userRoles || []).map(r => r.role as string)
    const adminUser: AdminUser = {
      id: user.id,
      email: user.email || '',
      role: adminRoles[0] as UserRole || 'client',
      organizationId: null,
    }

    // Parse request body
    const body: CreateUserRequest = await request.json()
    const {
      email,
      fullName,
      role = 'client',
      phone,
      jobTitle,
      companyName,
      organizationId,
      sendInvite = true,
    } = body

    // ============================================================
    // VALIDATION
    // ============================================================

    // Validate email
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        errorResponse(APIErrors.VALIDATION_ERROR({ email: 'Valid email address is required' })),
        { status: 400 }
      )
    }

    // Validate role
    if (!isValidRole(role)) {
      return NextResponse.json(
        errorResponse(APIErrors.VALIDATION_ERROR({
          role: `Invalid role. Must be one of: admin, instructor, expert, client, org_admin, team_lead, member, user`
        })),
        { status: 400 }
      )
    }

    // Check role hierarchy - can the admin assign this role?
    if (!canAssignRole(adminRoles, role as UserRole)) {
      return NextResponse.json(
        errorResponse(APIErrors.FORBIDDEN(`You cannot assign the role '${role}'. Insufficient permissions.`)),
        { status: 403 }
      )
    }

    // For org_admin, enforce organization scope
    if (adminUser.role === 'org_admin') {
      if (organizationId && organizationId !== adminUser.organizationId) {
        return NextResponse.json(
          errorResponse(APIErrors.FORBIDDEN('You can only create users within your organization')),
          { status: 403 }
        )
      }
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single()

    if (existingUser) {
      return NextResponse.json(
        errorResponse(APIErrors.CONFLICT('A user with this email already exists')),
        { status: 409 }
      )
    }

    // ============================================================
    // CREATE USER
    // ============================================================

    // Generate secure temporary password
    const temporaryPassword = generateSecurePassword()

    // Sanitize inputs
    const sanitizedFullName = sanitizeString(fullName) || email.split('@')[0]
    const sanitizedPhone = sanitizeString(phone, 50)
    const sanitizedJobTitle = sanitizeString(jobTitle, 100)
    const sanitizedCompanyName = sanitizeString(companyName, 200)

    // Determine organization ID
    const effectiveOrgId = organizationId || (adminUser.role === 'org_admin' ? adminUser.organizationId : null)

    // Create user in Supabase Auth
    const { data: newUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password: temporaryPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: sanitizedFullName,
      },
    })

    if (authError || !newUser.user) {
      console.error('Failed to create auth user:', authError)

      // Handle specific auth errors
      if (authError?.message?.includes('already been registered')) {
        return NextResponse.json(
          errorResponse(APIErrors.CONFLICT('A user with this email already exists in authentication')),
          { status: 409 }
        )
      }

      return NextResponse.json(
        errorResponse(APIErrors.INTERNAL_ERROR(authError?.message || 'Failed to create user account')),
        { status: 500 }
      )
    }

    const userId = newUser.user.id

    // Create user profile in users table
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email: email.toLowerCase(),
        full_name: sanitizedFullName,
        phone: sanitizedPhone || null,
        job_title: sanitizedJobTitle || null,
        company_name: sanitizedCompanyName || null,
        organization_id: effectiveOrgId,
        status: 'active',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
      console.error('Failed to create user profile:', profileError)
      // Continue - profile can be created on first login via trigger
    }

    // Assign role to user
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userId,
        role: role,
        organization_id: effectiveOrgId,
        granted_by: adminUser.id,
        granted_at: new Date().toISOString(),
      })

    if (roleError) {
      console.error('Failed to assign role:', roleError)
      return NextResponse.json(
        errorResponse(APIErrors.INTERNAL_ERROR('User created but failed to assign role')),
        { status: 500 }
      )
    }

    // ============================================================
    // AUDIT LOGGING
    // ============================================================

    await logAuditAction({
      userId: adminUser.id,
      action: 'user_created',
      targetUserId: userId,
      details: {
        email: email.toLowerCase(),
        role,
        organizationId: effectiveOrgId,
        inviteSent: sendInvite,
        createdBy: adminUser.email,
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    // ============================================================
    // SEND INVITATION EMAIL
    // ============================================================

    let emailSent = false

    if (sendInvite) {
      try {
        // Get admin's name for the invitation
        const { data: adminProfile } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', adminUser.id)
          .single()

        const inviterName = adminProfile?.full_name || adminUser.email || 'Admin'
        const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5040'}/login`

        // Get organization name if applicable
        let organizationName = 'HMN'
        if (effectiveOrgId) {
          const { data: org } = await supabase
            .from('organizations')
            .select('name')
            .eq('id', effectiveOrgId)
            .single()
          if (org?.name) {
            organizationName = org.name
          }
        }

        await emailService.sendUserInvitation(email.toLowerCase(), {
          inviterName,
          role: role as 'admin' | 'instructor' | 'expert' | 'client',
          temporaryPassword,
          loginUrl,
          organizationName,
        })

        emailSent = true
      } catch (emailError) {
        console.error('Failed to send invitation email:', emailError)
        // Don't fail the request - return the password so admin can share manually
      }
    }

    // ============================================================
    // RESPONSE
    // ============================================================

    const response: CreateUserResponse = {
      userId,
      email: email.toLowerCase(),
      fullName: sanitizedFullName,
      role,
      organizationId: effectiveOrgId || undefined,
      emailSent,
    }

    // Include temporary password if email wasn't sent
    if (!emailSent) {
      response.temporaryPassword = temporaryPassword
    }

    return NextResponse.json(
      successResponse(response, {
        message: emailSent
          ? 'User created successfully. Invitation email sent.'
          : 'User created successfully. Share the temporary password with the user.',
      }),
      { status: 201 }
    )
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}

// ============================================================
// GET /api/admin/users - List users with pagination and filters
// ============================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Verify admin status
    const user = await verifyAdmin(supabase)

    // Fetch admin roles for the verified user
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
    const adminRoles = (userRoles || []).map(r => r.role as string)
    const adminUser: AdminUser = {
      id: user.id,
      email: user.email || '',
      role: adminRoles[0] as UserRole || 'client',
      organizationId: null,
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const search = searchParams.get('search')?.trim()
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const organizationId = searchParams.get('organizationId')

    // Calculate offset
    const offset = (page - 1) * limit

    // ============================================================
    // BUILD QUERY
    // ============================================================

    let query = supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        phone,
        job_title,
        company_name,
        organization_id,
        status,
        is_active,
        avatar_url,
        created_at,
        updated_at,
        last_login_at,
        roles:user_roles(
          id,
          role,
          organization_id,
          granted_at,
          expires_at
        )
      `, { count: 'exact' })

    // ============================================================
    // ORGANIZATION SCOPING
    // ============================================================

    // If requester is org_admin, scope to their organization only
    if (adminUser.role === 'org_admin' && adminUser.organizationId) {
      query = query.eq('organization_id', adminUser.organizationId)
    } else if (organizationId) {
      // Admin requested specific organization filter
      query = query.eq('organization_id', organizationId)
    }

    // ============================================================
    // SEARCH FILTER
    // ============================================================

    if (search) {
      // Search in email or full_name (case-insensitive)
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
    }

    // ============================================================
    // STATUS FILTER
    // ============================================================

    if (status) {
      const validStatuses = ['active', 'inactive', 'disabled', 'suspended']
      if (validStatuses.includes(status)) {
        query = query.eq('status', status)
      }
    }

    // ============================================================
    // EXECUTE QUERY
    // ============================================================

    // Order by created_at descending (newest first)
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: users, error: queryError, count } = await query

    if (queryError) {
      console.error('Failed to fetch users:', queryError)
      throw queryError
    }

    // ============================================================
    // ROLE FILTER (post-query since it's in a related table)
    // ============================================================

    let filteredUsers = users || []

    if (role && isValidRole(role)) {
      filteredUsers = filteredUsers.filter(user => {
        const userRoles = user.roles as Array<{ role: string }> | null
        return userRoles?.some(r => r.role === role)
      })
    }

    // ============================================================
    // TRANSFORM RESPONSE
    // ============================================================

    const transformedUsers = filteredUsers.map(user => {
      const userRoles = user.roles as Array<{
        id: string
        role: string
        organization_id: string | null
        granted_at: string
        expires_at: string | null
      }> | null

      // Get active (non-expired) roles
      const activeRoles = userRoles?.filter(r =>
        !r.expires_at || new Date(r.expires_at) > new Date()
      ) || []

      // Get primary role (highest in hierarchy)
      const roleHierarchy: Record<string, number> = {
        super_admin: 100, admin: 90, org_admin: 70,
        instructor: 60, expert: 60, team_lead: 50,
        client: 40, member: 30, user: 10,
      }

      const primaryRole = activeRoles.reduce((highest, current) => {
        const currentLevel = roleHierarchy[current.role] ?? 0
        const highestLevel = highest ? (roleHierarchy[highest.role] ?? 0) : -1
        return currentLevel > highestLevel ? current : highest
      }, null as (typeof activeRoles)[0] | null)

      return {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        jobTitle: user.job_title,
        companyName: user.company_name,
        organizationId: user.organization_id,
        status: user.status,
        isActive: user.is_active,
        avatarUrl: user.avatar_url,
        primaryRole: primaryRole?.role || 'user',
        roles: activeRoles.map(r => r.role),
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLoginAt: user.last_login_at,
      }
    })

    // ============================================================
    // PAGINATION META
    // ============================================================

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json(
      successResponse({
        users: transformedUsers,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      })
    )
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
