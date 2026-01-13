/**
 * Admin Audit Logs API
 * GET /api/admin/audit-logs - List audit logs with pagination, filtering, and search
 *
 * Features:
 * - Filter by action type, user, date range
 * - Search in details JSON
 * - Pagination support
 * - Admin-only access
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
  PLATFORM_ADMIN_ROLES,
  type AdminUser,
} from '@/lib/admin/utils'

// ============================================================
// TYPES
// ============================================================

interface AuditLogEntry {
  id: string
  userId: string | null
  userName: string | null
  userEmail: string | null
  action: string
  targetType: string | null
  targetId: string | null
  details: Record<string, unknown>
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

interface AuditLogsResponse {
  logs: AuditLogEntry[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  filters: {
    action: string | null
    userId: string | null
    targetType: string | null
    startDate: string | null
    endDate: string | null
  }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Validate UUID format
 */
function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

/**
 * Parse and validate date string
 */
function parseDate(dateStr: string | null): Date | null {
  if (!dateStr) return null
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? null : date
}

// ============================================================
// GET /api/admin/audit-logs - List audit logs
// ============================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Verify admin status - only platform admins can view audit logs
    // (humanglue_admin, super_admin_full, admin)
    await verifyAdmin(supabase)

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const action = searchParams.get('action')?.trim()
    const userId = searchParams.get('userId')?.trim()
    const targetType = searchParams.get('targetType')?.trim()
    const targetId = searchParams.get('targetId')?.trim()
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const search = searchParams.get('search')?.trim()

    // Calculate offset
    const offset = (page - 1) * limit

    // ============================================================
    // VALIDATION
    // ============================================================

    // Validate userId if provided
    if (userId && !isValidUUID(userId)) {
      return NextResponse.json(
        errorResponse(APIErrors.INVALID_ID('userId')),
        { status: 400 }
      )
    }

    // Validate targetId if provided
    if (targetId && !isValidUUID(targetId)) {
      return NextResponse.json(
        errorResponse(APIErrors.INVALID_ID('targetId')),
        { status: 400 }
      )
    }

    // Parse dates
    const parsedStartDate = parseDate(startDate)
    const parsedEndDate = parseDate(endDate)

    // ============================================================
    // BUILD QUERY
    // ============================================================

    // Use admin client for service role access
    const supabaseAdmin = await createAdminClient()

    // Base query with user join
    let query = supabaseAdmin
      .from('audit_logs')
      .select(`
        id,
        user_id,
        action,
        target_type,
        target_id,
        details,
        ip_address,
        user_agent,
        created_at,
        profiles:user_id (
          full_name,
          email
        )
      `, { count: 'exact' })

    // ============================================================
    // APPLY FILTERS
    // ============================================================

    // Filter by action
    if (action) {
      // Support partial matching with wildcards
      if (action.includes('*')) {
        query = query.ilike('action', action.replace(/\*/g, '%'))
      } else {
        query = query.eq('action', action)
      }
    }

    // Filter by user
    if (userId) {
      query = query.eq('user_id', userId)
    }

    // Filter by target type
    if (targetType) {
      query = query.eq('target_type', targetType)
    }

    // Filter by target id
    if (targetId) {
      query = query.eq('target_id', targetId)
    }

    // Filter by date range
    if (parsedStartDate) {
      query = query.gte('created_at', parsedStartDate.toISOString())
    }

    if (parsedEndDate) {
      // Set to end of day
      const endOfDay = new Date(parsedEndDate)
      endOfDay.setHours(23, 59, 59, 999)
      query = query.lte('created_at', endOfDay.toISOString())
    }

    // Search in details (JSONB contains)
    if (search) {
      // Search across multiple fields
      query = query.or(`action.ilike.%${search}%,target_type.ilike.%${search}%`)
    }

    // ============================================================
    // EXECUTE QUERY
    // ============================================================

    // Order by created_at descending (newest first)
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: logs, error: queryError, count } = await query

    if (queryError) {
      console.error('Failed to fetch audit logs:', queryError)
      throw queryError
    }

    // ============================================================
    // TRANSFORM RESPONSE
    // ============================================================

    const transformedLogs: AuditLogEntry[] = (logs || []).map(log => {
      // Handle profiles which can be an array or single object from join
      const profileData = log.profiles as unknown
      const profile = Array.isArray(profileData)
        ? profileData[0] as { full_name: string | null; email: string | null } | undefined
        : profileData as { full_name: string | null; email: string | null } | null

      return {
        id: log.id,
        userId: log.user_id,
        userName: profile?.full_name || null,
        userEmail: profile?.email || null,
        action: log.action,
        targetType: log.target_type,
        targetId: log.target_id,
        details: log.details as Record<string, unknown>,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        createdAt: log.created_at,
      }
    })

    // ============================================================
    // PAGINATION META
    // ============================================================

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / limit)

    const response: AuditLogsResponse = {
      logs: transformedLogs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      filters: {
        action: action || null,
        userId: userId || null,
        targetType: targetType || null,
        startDate: parsedStartDate?.toISOString() || null,
        endDate: parsedEndDate?.toISOString() || null,
      },
    }

    return NextResponse.json(successResponse(response))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}

// ============================================================
// POST /api/admin/audit-logs - Create audit log entry
// (For internal use - typically called from other APIs)
// ============================================================

interface CreateAuditLogRequest {
  action: string
  targetType?: string
  targetId?: string
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Verify admin status (any admin role can create audit logs)
    const adminUser = await verifyAdmin(supabase)

    // Parse request body
    const body: CreateAuditLogRequest = await request.json()
    const { action, targetType, targetId, details } = body

    // Get IP and user agent from request if not provided
    const ipAddress = body.ipAddress ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      null

    const userAgent = body.userAgent ||
      request.headers.get('user-agent') ||
      null

    // ============================================================
    // VALIDATION
    // ============================================================

    if (!action || typeof action !== 'string') {
      return NextResponse.json(
        errorResponse(APIErrors.MISSING_REQUIRED_FIELDS(['action'])),
        { status: 400 }
      )
    }

    if (action.length > 100) {
      return NextResponse.json(
        errorResponse(APIErrors.VALIDATION_ERROR({ action: 'Action must be 100 characters or less' })),
        { status: 400 }
      )
    }

    if (targetType && targetType.length > 50) {
      return NextResponse.json(
        errorResponse(APIErrors.VALIDATION_ERROR({ targetType: 'Target type must be 50 characters or less' })),
        { status: 400 }
      )
    }

    if (targetId && !isValidUUID(targetId)) {
      return NextResponse.json(
        errorResponse(APIErrors.INVALID_ID('targetId')),
        { status: 400 }
      )
    }

    // ============================================================
    // CREATE AUDIT LOG
    // ============================================================

    const supabaseAdmin = await createAdminClient()

    const { data: log, error: insertError } = await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: adminUser.id,  // adminUser is a Supabase User object
        action,
        target_type: targetType || null,
        target_id: targetId || null,
        details: details || {},
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Failed to create audit log:', insertError)
      throw insertError
    }

    return NextResponse.json(
      successResponse({ id: log.id, createdAt: log.created_at }),
      { status: 201 }
    )
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
