/**
 * POST /api/admin/users/bulk-import
 * Bulk import users from CSV data
 *
 * Optimized for performance with:
 * - Parallel batch processing (batches of 10)
 * - Promise.allSettled for resilient error handling
 * - Batch ID tracking for audit logs
 * - Shared admin utilities for security
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import {
  APIErrors,
  successResponse,
  errorResponse,
  handleUnknownError,
} from '@/lib/api/errors'
import { emailService } from '@/services/email'
import {
  generateSecurePassword,
  verifyAdmin,
  isValidEmail,
  logAuditAction,
} from '@/lib/admin/utils'

// =============================================================================
// CONSTANTS
// =============================================================================

const BATCH_SIZE = 10
const VALID_ROLES = ['admin', 'instructor', 'expert', 'client', 'org_admin', 'team_lead', 'member']

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Splits an array into chunks of specified size
 */
function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

/**
 * Generates a unique batch ID for tracking imports in audit logs
 */
function generateBatchId(): string {
  return `bulk-import-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`
}

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface ImportUser {
  email: string
  fullName?: string
  role?: string
  phone?: string
  jobTitle?: string
  companyName?: string
  organizationId?: string
}

interface ImportResult {
  success: boolean
  email: string
  userId?: string
  error?: string
  errorCode?: string
  temporaryPassword?: string
  emailSent?: boolean
}

interface ProcessUserContext {
  supabaseAdmin: Awaited<ReturnType<typeof createAdminClient>>
  adminUserId: string
  defaultRole: string
  organizationId?: string
  sendInvites: boolean
  inviterName: string
  loginUrl: string
  organizationName: string
  batchId: string
}

// =============================================================================
// USER PROCESSING FUNCTION
// =============================================================================

/**
 * Process a single user import
 * Extracted to enable parallel processing with Promise.allSettled
 */
async function processUser(
  user: ImportUser,
  context: ProcessUserContext
): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    email: user.email || 'unknown',
  }

  try {
    // Validate email using shared utility
    if (!user.email || !isValidEmail(user.email)) {
      result.error = 'Invalid or missing email address'
      result.errorCode = 'INVALID_EMAIL'
      return result
    }

    // Check if user already exists
    const { data: existingUser } = await context.supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', user.email)
      .maybeSingle()

    if (existingUser) {
      result.error = 'User with this email already exists'
      result.errorCode = 'USER_EXISTS'
      return result
    }

    // Validate role
    const role = user.role || context.defaultRole
    if (!VALID_ROLES.includes(role)) {
      result.error = `Invalid role: ${role}`
      result.errorCode = 'INVALID_ROLE'
      return result
    }

    // Generate cryptographically secure temporary password
    const temporaryPassword = generateSecurePassword(12)

    // Create user in Supabase Auth
    const { data: newUser, error: authError } = await context.supabaseAdmin.auth.admin.createUser({
      email: user.email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name: user.fullName || user.email.split('@')[0],
      },
    })

    if (authError || !newUser.user) {
      result.error = authError?.message || 'Failed to create auth user'
      result.errorCode = 'AUTH_CREATE_FAILED'
      return result
    }

    result.userId = newUser.user.id

    // Create user profile
    const { error: profileError } = await context.supabaseAdmin
      .from('users')
      .insert({
        id: newUser.user.id,
        email: user.email,
        full_name: user.fullName || user.email.split('@')[0],
        phone: user.phone,
        job_title: user.jobTitle,
        company_name: user.companyName,
        organization_id: user.organizationId || context.organizationId,
        status: 'active',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
      console.error(`[Bulk Import] Profile creation error for ${user.email}:`, profileError)
      // Continue anyway - profile can be created on first login
    }

    // Assign role
    const { error: roleError } = await context.supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role,
        granted_by: context.adminUserId,
        granted_at: new Date().toISOString(),
      })

    if (roleError) {
      console.error(`[Bulk Import] Role assignment error for ${user.email}:`, roleError)
      result.error = 'User created but role assignment failed'
      result.errorCode = 'ROLE_ASSIGN_FAILED'
      // Still mark as partial success - user was created
      result.success = true
      result.temporaryPassword = temporaryPassword
      return result
    }

    // Send invitation email if requested
    if (context.sendInvites) {
      try {
        await emailService.sendUserInvitation(user.email, {
          inviterName: context.inviterName,
          role: role as 'admin' | 'instructor' | 'expert' | 'client',
          temporaryPassword,
          loginUrl: context.loginUrl,
          organizationName: context.organizationName,
        })
        result.emailSent = true
      } catch (emailError) {
        console.error(`[Bulk Import] Email send error for ${user.email}:`, emailError)
        result.emailSent = false
        result.temporaryPassword = temporaryPassword // Include so admin can share manually
      }
    } else {
      result.temporaryPassword = temporaryPassword
    }

    // Log successful user creation to audit log
    await logAuditAction({
      userId: context.adminUserId,
      action: 'user.bulk_import.created',
      targetType: 'user',
      targetId: newUser.user.id,
      details: {
        batch_id: context.batchId,
        email: user.email,
        role,
        organization_id: user.organizationId || context.organizationId,
      },
    })

    result.success = true
    return result
  } catch (userError) {
    console.error(`[Bulk Import] Unexpected error for ${user.email}:`, userError)
    result.error = userError instanceof Error ? userError.message : 'Unknown error'
    result.errorCode = 'UNEXPECTED_ERROR'
    return result
  }
}

// =============================================================================
// MAIN ENDPOINT HANDLER
// =============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const batchId = generateBatchId()

  try {
    const supabase = await createClient()
    const adminUser = await verifyAdmin(supabase)

    const body = await request.json()
    const {
      users,
      sendInvites = true,
      defaultRole = 'client',
      organizationId,
      organizationName = 'HumanGlue'
    }: {
      users: ImportUser[]
      sendInvites?: boolean
      defaultRole?: string
      organizationId?: string
      organizationName?: string
    } = body

    // Validate input
    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        errorResponse(APIErrors.VALIDATION_ERROR({ users: 'Must provide an array of users' })),
        { status: 400 }
      )
    }

    if (users.length > 100) {
      return NextResponse.json(
        errorResponse(APIErrors.VALIDATION_ERROR({ users: 'Maximum 100 users per import' })),
        { status: 400 }
      )
    }

    // Validate default role
    if (!VALID_ROLES.includes(defaultRole)) {
      return NextResponse.json(
        errorResponse(APIErrors.VALIDATION_ERROR({ defaultRole: `Invalid default role: ${defaultRole}` })),
        { status: 400 }
      )
    }

    const supabaseAdmin = await createAdminClient()

    // Get admin info for invite emails
    const { data: adminProfile } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', adminUser.id)
      .single()

    const inviterName = adminProfile?.full_name || adminUser.email || 'Admin'
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5040'}/login`

    // Create processing context
    const context: ProcessUserContext = {
      supabaseAdmin,
      adminUserId: adminUser.id,
      defaultRole,
      organizationId,
      sendInvites,
      inviterName,
      loginUrl,
      organizationName,
      batchId,
    }

    // Log batch import start
    await logAuditAction({
      userId: adminUser.id,
      action: 'user.bulk_import.started',
      targetType: 'batch',
      targetId: batchId,
      details: {
        batch_id: batchId,
        total_users: users.length,
        send_invites: sendInvites,
        default_role: defaultRole,
        organization_id: organizationId,
      },
    })

    // Process users in parallel batches
    const results: ImportResult[] = []
    const batches = chunk(users, BATCH_SIZE)

    console.log(`[Bulk Import] Starting batch import ${batchId}: ${users.length} users in ${batches.length} batches`)

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex]
      console.log(`[Bulk Import] Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} users)`)

      // Process batch in parallel using Promise.allSettled
      const batchResults = await Promise.allSettled(
        batch.map(user => processUser(user, context))
      )

      // Collect results from this batch
      for (const settledResult of batchResults) {
        if (settledResult.status === 'fulfilled') {
          results.push(settledResult.value)
        } else {
          // Promise was rejected (unexpected error)
          results.push({
            success: false,
            email: 'unknown',
            error: settledResult.reason?.message || 'Batch processing failed',
            errorCode: 'BATCH_ERROR',
          })
        }
      }
    }

    // Calculate statistics
    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length
    const processingTimeMs = Date.now() - startTime

    // Log batch import completion
    await logAuditAction({
      userId: adminUser.id,
      action: 'user.bulk_import.completed',
      targetType: 'batch',
      targetId: batchId,
      details: {
        batch_id: batchId,
        total_processed: results.length,
        success_count: successCount,
        failure_count: failureCount,
        processing_time_ms: processingTimeMs,
        failed_emails: results
          .filter(r => !r.success)
          .map(r => ({ email: r.email, error: r.errorCode || r.error })),
      },
    })

    console.log(`[Bulk Import] Completed batch ${batchId}: ${successCount} succeeded, ${failureCount} failed in ${processingTimeMs}ms`)

    return NextResponse.json(successResponse({
      message: `Import completed: ${successCount} succeeded, ${failureCount} failed`,
      batchId,
      totalProcessed: results.length,
      successCount,
      failureCount,
      processingTimeMs,
      results,
    }))
  } catch (error) {
    // Log batch import failure
    console.error(`[Bulk Import] Batch ${batchId} failed:`, error)

    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
