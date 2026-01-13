/**
 * Admin User Management API - Individual User Operations
 * GET /api/admin/users/[id] - Get user details
 * PATCH /api/admin/users/[id] - Update user (roles, status, profile)
 * DELETE /api/admin/users/[id] - Soft delete/deactivate user
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import {
  APIErrors,
  successResponse,
  errorResponse,
  handleUnknownError,
} from '@/lib/api/errors'
import {
  verifyAdmin,
  canAssignRole,
  isValidEmail,
  logAuditAction,
  ROLE_HIERARCHY,
} from '@/lib/admin/utils'

/**
 * GET /api/admin/users/[id]
 * Get detailed user information including roles and permissions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    await verifyAdmin(supabase)

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (userError) {
      if (userError.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse(APIErrors.NOT_FOUND('User')),
          { status: 404 }
        )
      }
      throw userError
    }

    // Get user roles separately (no FK relationship)
    const { data: roles } = await supabase
      .from('user_roles')
      .select('id, role, organization_id, granted_at, granted_by, expires_at')
      .eq('user_id', id)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

    // Get user permissions separately
    const { data: permissions } = await supabase
      .from('user_permissions')
      .select('*')
      .eq('user_id', id)

    return NextResponse.json(successResponse({
      ...user,
      roles: roles || [],
      permissions: permissions || [],
    }))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}

/**
 * PATCH /api/admin/users/[id]
 * Update user profile, roles, or status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const adminUser = await verifyAdmin(supabase)

    const body = await request.json()
    const {
      fullName,
      email,
      phone,
      jobTitle,
      companyName,
      status,
      roles, // Array of role strings to assign
      removeRoles, // Array of role strings to remove
      organizationId
    } = body

    const supabaseAdmin = await createAdminClient()

    // Check user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email, full_name, status')
      .eq('id', id)
      .single()

    if (checkError || !existingUser) {
      return NextResponse.json(
        errorResponse(APIErrors.NOT_FOUND('User')),
        { status: 404 }
      )
    }

    // Get admin's roles for hierarchy check
    const { data: adminRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', adminUser.id)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

    const adminRoleNames = adminRoles?.map(r => r.role) || []

    // Track changes for audit log
    const changedFields: Record<string, { from: unknown; to: unknown }> = {}

    // Build profile update
    const profileUpdate: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (fullName !== undefined && fullName !== existingUser.full_name) {
      profileUpdate.full_name = fullName
      changedFields.full_name = { from: existingUser.full_name, to: fullName }
    }
    if (phone !== undefined) {
      profileUpdate.phone = phone
      changedFields.phone = { from: 'redacted', to: 'updated' }
    }
    if (jobTitle !== undefined) {
      profileUpdate.job_title = jobTitle
      changedFields.job_title = { from: 'previous', to: jobTitle }
    }
    if (companyName !== undefined) {
      profileUpdate.company_name = companyName
      changedFields.company_name = { from: 'previous', to: companyName }
    }
    if (status !== undefined) {
      if (!['active', 'inactive', 'disabled'].includes(status)) {
        return NextResponse.json(
          errorResponse(APIErrors.VALIDATION_ERROR({ status: 'Must be active, inactive, or disabled' })),
          { status: 400 }
        )
      }
      if (status !== existingUser.status) {
        changedFields.status = { from: existingUser.status, to: status }
      }
      profileUpdate.status = status
      profileUpdate.is_active = status === 'active'
    }
    if (organizationId !== undefined) {
      profileUpdate.organization_id = organizationId
      changedFields.organization_id = { from: 'previous', to: organizationId }
    }

    // Update profile if there are changes
    if (Object.keys(profileUpdate).length > 1) {
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update(profileUpdate)
        .eq('id', id)

      if (updateError) throw updateError
    }

    // Update email in auth if changed
    if (email && email !== existingUser.email) {
      // Validate email format
      if (!isValidEmail(email)) {
        return NextResponse.json(
          errorResponse(APIErrors.VALIDATION_ERROR({ email: 'Invalid email format' })),
          { status: 400 }
        )
      }

      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, {
        email,
      })
      if (authError) throw authError

      // Also update email in users table
      await supabaseAdmin
        .from('users')
        .update({ email })
        .eq('id', id)

      changedFields.email = { from: existingUser.email, to: email }
    }

    // Track role changes for audit
    const rolesAdded: string[] = []
    const rolesRemoved: string[] = []

    // Handle role additions with hierarchy check
    if (roles && Array.isArray(roles) && roles.length > 0) {
      for (const role of roles) {
        // Validate role exists in hierarchy
        if (!(role in ROLE_HIERARCHY)) {
          return NextResponse.json(
            errorResponse(APIErrors.VALIDATION_ERROR({ role: `Invalid role: ${role}` })),
            { status: 400 }
          )
        }

        // Check if admin can assign this role (hierarchy enforcement)
        if (!canAssignRole(adminRoleNames, role)) {
          return NextResponse.json(
            errorResponse(APIErrors.FORBIDDEN(`You cannot assign the '${role}' role. You can only assign roles lower than your own.`)),
            { status: 403 }
          )
        }

        // Check if role already exists
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', id)
          .eq('role', role)
          .single()

        if (!existingRole) {
          await supabaseAdmin
            .from('user_roles')
            .insert({
              user_id: id,
              role,
              granted_by: adminUser.id,
              granted_at: new Date().toISOString(),
            })
          rolesAdded.push(role)
        }
      }
    }

    // Handle role removals
    if (removeRoles && Array.isArray(removeRoles) && removeRoles.length > 0) {
      for (const role of removeRoles) {
        await supabaseAdmin
          .from('user_roles')
          .delete()
          .eq('user_id', id)
          .eq('role', role)
        rolesRemoved.push(role)
      }
    }

    // Fetch updated user
    const { data: updatedUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    // Fetch updated roles separately
    const { data: updatedRoles } = await supabase
      .from('user_roles')
      .select('id, role, organization_id, granted_at, expires_at')
      .eq('user_id', id)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

    // Log audit action for user update
    const hasChanges = Object.keys(changedFields).length > 0 || rolesAdded.length > 0 || rolesRemoved.length > 0
    if (hasChanges) {
      await logAuditAction({
        userId: adminUser.id,
        action: 'user_updated',
        targetType: 'user',
        targetId: id,
        details: {
          changed_fields: changedFields,
          roles_added: rolesAdded.length > 0 ? rolesAdded : undefined,
          roles_removed: rolesRemoved.length > 0 ? rolesRemoved : undefined,
          target_email: existingUser.email,
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      })
    }

    return NextResponse.json(successResponse({
      ...updatedUser,
      roles: updatedRoles || [],
    }))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Soft delete (deactivate) a user - sets status to 'disabled'
 * Use ?hard=true for permanent deletion (dangerous!)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const adminUser = await verifyAdmin(supabase)

    const { searchParams } = new URL(request.url)
    const hardDelete = searchParams.get('hard') === 'true'

    // Prevent self-deletion
    if (id === adminUser.id) {
      return NextResponse.json(
        errorResponse(APIErrors.BAD_REQUEST('You cannot delete your own account')),
        { status: 400 }
      )
    }

    const supabaseAdmin = await createAdminClient()

    // Check user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('id', id)
      .single()

    if (checkError || !existingUser) {
      return NextResponse.json(
        errorResponse(APIErrors.NOT_FOUND('User')),
        { status: 404 }
      )
    }

    if (hardDelete) {
      // Permanent deletion - removes from auth and all related data
      // First delete user roles
      await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', id)

      // Delete user permissions
      await supabaseAdmin
        .from('user_permissions')
        .delete()
        .eq('user_id', id)

      // Delete user profile
      await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', id)

      // Delete from auth
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id)
      if (authError) throw authError

      // Log audit action for permanent deletion
      await logAuditAction({
        userId: adminUser.id,
        action: 'user_deleted',
        targetType: 'user',
        targetId: id,
        details: {
          deletion_type: 'hard',
          target_email: existingUser.email,
          target_name: existingUser.full_name,
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      })

      return NextResponse.json(successResponse({
        message: 'User permanently deleted',
        userId: id,
        email: existingUser.email
      }))
    } else {
      // Soft delete - just disable the account
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          status: 'disabled',
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (updateError) throw updateError

      // Log audit action for account disable
      await logAuditAction({
        userId: adminUser.id,
        action: 'user_disabled',
        targetType: 'user',
        targetId: id,
        details: {
          deletion_type: 'soft',
          target_email: existingUser.email,
          target_name: existingUser.full_name,
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      })

      return NextResponse.json(successResponse({
        message: 'User account disabled',
        userId: id,
        email: existingUser.email
      }))
    }
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
