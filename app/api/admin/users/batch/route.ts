/**
 * Admin Batch User Operations API
 * POST /api/admin/users/batch - Execute batch operations on multiple users
 *
 * Supports: enable, disable, delete, assign_role, remove_role
 * Features: Role hierarchy validation, audit logging, parallel processing
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import {
  APIErrors,
  successResponse,
  errorResponse,
  handleUnknownError,
} from '@/lib/api/errors'
import { randomUUID } from 'crypto'

// ============================================================================
// Types
// ============================================================================

type BatchAction = 'enable' | 'disable' | 'delete' | 'assign_role' | 'remove_role'

interface BatchOperationRequest {
  userIds: string[]
  action: BatchAction
  role?: string // Required for assign_role/remove_role
  hardDelete?: boolean // For delete action - permanent deletion
}

interface UserOperationResult {
  userId: string
  email?: string
  success: boolean
  action: BatchAction
  error?: string
  details?: Record<string, unknown>
}

interface UserWithRoles {
  id: string
  email: string
  full_name: string | null
  status: string
  is_active: boolean
  roles: Array<{
    id: string
    role: string
    expires_at: string | null
  }>
}

// Role hierarchy - higher index = higher privilege
const ROLE_HIERARCHY: Record<string, number> = {
  member: 1,
  client: 2,
  team_lead: 3,
  expert: 4,
  instructor: 5,
  org_admin: 6,
  admin: 7,
  super_admin: 8,
}

const VALID_ROLES = Object.keys(ROLE_HIERARCHY)

const MAX_BATCH_SIZE = 50

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Verify admin access and return admin user with their highest role
 */
async function verifyAdminAccess(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw APIErrors.UNAUTHORIZED('You must be logged in')
  }

  // Get admin's roles
  const { data: adminRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select('role, expires_at')
    .eq('user_id', user.id)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

  if (rolesError) throw rolesError

  if (!adminRoles || adminRoles.length === 0) {
    throw APIErrors.FORBIDDEN('You do not have any assigned roles')
  }

  // Check if user has admin or higher role
  const hasAdminAccess = adminRoles.some(
    r => ['admin', 'super_admin'].includes(r.role)
  )

  if (!hasAdminAccess) {
    throw APIErrors.FORBIDDEN('Only admins can perform batch user operations')
  }

  // Get the highest role level for the admin
  const highestRoleLevel = Math.max(
    ...adminRoles.map(r => ROLE_HIERARCHY[r.role] || 0)
  )

  return {
    user,
    roles: adminRoles.map(r => r.role),
    highestRoleLevel,
  }
}

/**
 * Get highest role level for a user's roles
 */
function getHighestRoleLevel(roles: Array<{ role: string }>): number {
  if (!roles || roles.length === 0) return 0
  return Math.max(...roles.map(r => ROLE_HIERARCHY[r.role] || 0))
}

/**
 * Validate UUID format
 */
function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

/**
 * Extract client info from request for audit logging
 */
function extractClientInfo(request: NextRequest): { ipAddress: string; userAgent: string } {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const userAgent = request.headers.get('user-agent') || 'Unknown'

  let ipAddress = 'unknown'
  if (forwardedFor) {
    ipAddress = forwardedFor.split(',')[0].trim()
  } else if (realIp) {
    ipAddress = realIp
  }

  return { ipAddress, userAgent }
}

/**
 * Log batch operation to audit log
 */
async function logBatchAction(
  supabaseAdmin: Awaited<ReturnType<typeof createAdminClient>>,
  params: {
    adminId: string
    targetUserId: string
    action: BatchAction
    batchId: string
    success: boolean
    metadata: Record<string, unknown>
    clientInfo: { ipAddress: string; userAgent: string }
  }
): Promise<void> {
  try {
    await supabaseAdmin.from('auth_audit_log').insert({
      user_id: params.adminId,
      event_type: `batch_${params.action}`,
      ip_address: params.clientInfo.ipAddress,
      user_agent: params.clientInfo.userAgent,
      metadata: {
        target_user_id: params.targetUserId,
        batch_id: params.batchId,
        action: params.action,
        success: params.success,
        ...params.metadata,
      },
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    // Don't fail the operation if audit logging fails
    console.error('Failed to log batch action:', error)
  }
}

// ============================================================================
// Action Processors
// ============================================================================

/**
 * Enable a user account
 */
async function processEnableUser(
  supabaseAdmin: Awaited<ReturnType<typeof createAdminClient>>,
  user: UserWithRoles
): Promise<UserOperationResult> {
  const { error } = await supabaseAdmin
    .from('users')
    .update({
      is_active: true,
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    return {
      userId: user.id,
      email: user.email,
      success: false,
      action: 'enable',
      error: error.message,
    }
  }

  return {
    userId: user.id,
    email: user.email,
    success: true,
    action: 'enable',
    details: { previousStatus: user.status, newStatus: 'active' },
  }
}

/**
 * Disable a user account
 */
async function processDisableUser(
  supabaseAdmin: Awaited<ReturnType<typeof createAdminClient>>,
  user: UserWithRoles
): Promise<UserOperationResult> {
  const { error } = await supabaseAdmin
    .from('users')
    .update({
      is_active: false,
      status: 'disabled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    return {
      userId: user.id,
      email: user.email,
      success: false,
      action: 'disable',
      error: error.message,
    }
  }

  return {
    userId: user.id,
    email: user.email,
    success: true,
    action: 'disable',
    details: { previousStatus: user.status, newStatus: 'disabled' },
  }
}

/**
 * Delete a user account (soft or hard delete)
 */
async function processDeleteUser(
  supabaseAdmin: Awaited<ReturnType<typeof createAdminClient>>,
  user: UserWithRoles,
  hardDelete: boolean
): Promise<UserOperationResult> {
  if (hardDelete) {
    // Hard delete - remove from auth and all related data
    try {
      // Delete user roles
      await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', user.id)

      // Delete user permissions
      await supabaseAdmin
        .from('user_permissions')
        .delete()
        .eq('user_id', user.id)

      // Delete user profile
      await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', user.id)

      // Delete from auth
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
      if (authError) throw authError

      return {
        userId: user.id,
        email: user.email,
        success: true,
        action: 'delete',
        details: { deleteType: 'hard', permanentlyDeleted: true },
      }
    } catch (error) {
      return {
        userId: user.id,
        email: user.email,
        success: false,
        action: 'delete',
        error: error instanceof Error ? error.message : 'Hard delete failed',
      }
    }
  } else {
    // Soft delete - just disable the account
    const { error } = await supabaseAdmin
      .from('users')
      .update({
        status: 'deleted',
        is_active: false,
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      return {
        userId: user.id,
        email: user.email,
        success: false,
        action: 'delete',
        error: error.message,
      }
    }

    return {
      userId: user.id,
      email: user.email,
      success: true,
      action: 'delete',
      details: { deleteType: 'soft', status: 'deleted' },
    }
  }
}

/**
 * Assign a role to a user
 */
async function processAssignRole(
  supabaseAdmin: Awaited<ReturnType<typeof createAdminClient>>,
  user: UserWithRoles,
  role: string,
  grantedBy: string
): Promise<UserOperationResult> {
  // Check if user already has this role
  const existingRole = user.roles.find(r => r.role === role)
  if (existingRole) {
    return {
      userId: user.id,
      email: user.email,
      success: true,
      action: 'assign_role',
      details: { role, alreadyAssigned: true },
    }
  }

  const { error } = await supabaseAdmin
    .from('user_roles')
    .insert({
      user_id: user.id,
      role,
      granted_by: grantedBy,
      granted_at: new Date().toISOString(),
    })

  if (error) {
    return {
      userId: user.id,
      email: user.email,
      success: false,
      action: 'assign_role',
      error: error.message,
    }
  }

  return {
    userId: user.id,
    email: user.email,
    success: true,
    action: 'assign_role',
    details: { role, assigned: true },
  }
}

/**
 * Remove a role from a user
 */
async function processRemoveRole(
  supabaseAdmin: Awaited<ReturnType<typeof createAdminClient>>,
  user: UserWithRoles,
  role: string
): Promise<UserOperationResult> {
  // Check if user has this role
  const existingRole = user.roles.find(r => r.role === role)
  if (!existingRole) {
    return {
      userId: user.id,
      email: user.email,
      success: true,
      action: 'remove_role',
      details: { role, notAssigned: true },
    }
  }

  const { error } = await supabaseAdmin
    .from('user_roles')
    .delete()
    .eq('user_id', user.id)
    .eq('role', role)

  if (error) {
    return {
      userId: user.id,
      email: user.email,
      success: false,
      action: 'remove_role',
      error: error.message,
    }
  }

  return {
    userId: user.id,
    email: user.email,
    success: true,
    action: 'remove_role',
    details: { role, removed: true },
  }
}

// ============================================================================
// Main Handler
// ============================================================================

/**
 * POST /api/admin/users/batch
 * Execute batch operations on multiple users
 */
export async function POST(request: NextRequest) {
  const batchId = randomUUID()

  try {
    const supabase = await createClient()
    const adminInfo = await verifyAdminAccess(supabase)
    const clientInfo = extractClientInfo(request)

    // Parse and validate request body
    const body: BatchOperationRequest = await request.json()
    const { userIds, action, role, hardDelete = false } = body

    // Validate required fields
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        errorResponse(APIErrors.VALIDATION_ERROR({
          userIds: 'Must provide an array of user IDs',
        })),
        { status: 400 }
      )
    }

    // Validate batch size
    if (userIds.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        errorResponse(APIErrors.VALIDATION_ERROR({
          userIds: `Maximum ${MAX_BATCH_SIZE} users per batch operation`,
        })),
        { status: 400 }
      )
    }

    // Validate action
    const validActions: BatchAction[] = ['enable', 'disable', 'delete', 'assign_role', 'remove_role']
    if (!action || !validActions.includes(action)) {
      return NextResponse.json(
        errorResponse(APIErrors.VALIDATION_ERROR({
          action: `Must be one of: ${validActions.join(', ')}`,
        })),
        { status: 400 }
      )
    }

    // Validate role for role-related actions
    if ((action === 'assign_role' || action === 'remove_role') && !role) {
      return NextResponse.json(
        errorResponse(APIErrors.VALIDATION_ERROR({
          role: `Role is required for ${action} action`,
        })),
        { status: 400 }
      )
    }

    if (role && !VALID_ROLES.includes(role)) {
      return NextResponse.json(
        errorResponse(APIErrors.VALIDATION_ERROR({
          role: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`,
        })),
        { status: 400 }
      )
    }

    // Check if admin is trying to assign a role higher than their own
    if (action === 'assign_role' && role) {
      const targetRoleLevel = ROLE_HIERARCHY[role] || 0
      if (targetRoleLevel >= adminInfo.highestRoleLevel) {
        return NextResponse.json(
          errorResponse(APIErrors.FORBIDDEN(
            `Cannot assign role '${role}' - you can only assign roles lower than your own`
          )),
          { status: 403 }
        )
      }
    }

    // Validate all user IDs are valid UUIDs
    const invalidIds = userIds.filter(id => !isValidUUID(id))
    if (invalidIds.length > 0) {
      return NextResponse.json(
        errorResponse(APIErrors.VALIDATION_ERROR({
          userIds: `Invalid UUID format: ${invalidIds.join(', ')}`,
        })),
        { status: 400 }
      )
    }

    // Prevent self-modification
    if (userIds.includes(adminInfo.user.id)) {
      return NextResponse.json(
        errorResponse(APIErrors.BAD_REQUEST('You cannot perform batch operations on your own account')),
        { status: 400 }
      )
    }

    const supabaseAdmin = await createAdminClient()

    // Fetch all target users with their roles
    const { data: targetUsers, error: fetchError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        status,
        is_active,
        roles:user_roles(
          id,
          role,
          expires_at
        )
      `)
      .in('id', userIds)

    if (fetchError) {
      throw fetchError
    }

    // Create a map for quick lookup
    const usersMap = new Map<string, UserWithRoles>()
    if (targetUsers) {
      for (const user of targetUsers) {
        usersMap.set(user.id, user as UserWithRoles)
      }
    }

    // Process each user and collect results
    const processUser = async (userId: string): Promise<UserOperationResult> => {
      const user = usersMap.get(userId)

      // User not found
      if (!user) {
        return {
          userId,
          success: false,
          action,
          error: 'User not found',
        }
      }

      // Check role hierarchy - can't modify users with higher or equal roles
      const userRoleLevel = getHighestRoleLevel(user.roles)
      if (userRoleLevel >= adminInfo.highestRoleLevel) {
        return {
          userId,
          email: user.email,
          success: false,
          action,
          error: 'Cannot modify user with equal or higher role level',
        }
      }

      // Process based on action
      let result: UserOperationResult

      switch (action) {
        case 'enable':
          result = await processEnableUser(supabaseAdmin, user)
          break
        case 'disable':
          result = await processDisableUser(supabaseAdmin, user)
          break
        case 'delete':
          result = await processDeleteUser(supabaseAdmin, user, hardDelete)
          break
        case 'assign_role':
          result = await processAssignRole(supabaseAdmin, user, role!, adminInfo.user.id)
          break
        case 'remove_role':
          result = await processRemoveRole(supabaseAdmin, user, role!)
          break
        default:
          result = {
            userId,
            email: user.email,
            success: false,
            action,
            error: 'Unknown action',
          }
      }

      // Log the action
      await logBatchAction(supabaseAdmin, {
        adminId: adminInfo.user.id,
        targetUserId: userId,
        action,
        batchId,
        success: result.success,
        metadata: {
          email: user.email,
          role: role,
          hardDelete: action === 'delete' ? hardDelete : undefined,
          error: result.error,
        },
        clientInfo,
      })

      return result
    }

    // Process all users in parallel using Promise.allSettled
    const settledResults = await Promise.allSettled(userIds.map(processUser))

    // Extract results from settled promises
    const results: UserOperationResult[] = settledResults.map((settled, index) => {
      if (settled.status === 'fulfilled') {
        return settled.value
      } else {
        return {
          userId: userIds[index],
          success: false,
          action,
          error: settled.reason instanceof Error
            ? settled.reason.message
            : 'Unknown error during processing',
        }
      }
    })

    // Calculate summary
    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    // Log batch summary
    await logBatchAction(supabaseAdmin, {
      adminId: adminInfo.user.id,
      targetUserId: 'batch_summary',
      action,
      batchId,
      success: failureCount === 0,
      metadata: {
        totalProcessed: results.length,
        successCount,
        failureCount,
        role: role,
        hardDelete: action === 'delete' ? hardDelete : undefined,
      },
      clientInfo,
    })

    return NextResponse.json(
      successResponse({
        message: `Batch ${action} completed: ${successCount} succeeded, ${failureCount} failed`,
        batchId,
        action,
        totalProcessed: results.length,
        successCount,
        failureCount,
        results,
      }),
      { status: failureCount === results.length ? 400 : 200 }
    )
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
