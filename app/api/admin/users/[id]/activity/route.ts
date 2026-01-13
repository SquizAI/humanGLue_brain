/**
 * Admin User Activity/Change History API
 * GET /api/admin/users/[id]/activity - Get audit log entries for a specific user
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  APIErrors,
  successResponse,
  errorResponse,
  handleUnknownError,
} from '@/lib/api/errors'

// Helper to verify admin status
async function verifyAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw APIErrors.UNAUTHORIZED('You must be logged in')
  }

  const { data: adminRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

  if (!adminRoles || adminRoles.length === 0) {
    throw APIErrors.FORBIDDEN('Only admins can view user activity')
  }

  return user
}

interface AuditLogEntry {
  id: string
  user_id: string | null
  action: string
  target_type: string | null
  target_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

interface FormattedActivityEntry {
  id: string
  action: string
  actorId: string | null
  actorName: string | null
  actorEmail: string | null
  details: Record<string, unknown> | null
  ipAddress: string | null
  timestamp: string
}

/**
 * GET /api/admin/users/[id]/activity
 * Get paginated audit log entries for a specific user
 *
 * Query params:
 * - limit: number of records to return (default: 50, max: 100)
 * - offset: number of records to skip (default: 0)
 * - include_auth_events: if "true", include auth_audit_log entries too
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    await verifyAdmin(supabase)

    // Parse query params
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const includeAuthEvents = searchParams.get('include_auth_events') === 'true'

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        errorResponse(APIErrors.INVALID_ID('User ID')),
        { status: 400 }
      )
    }

    // Check user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('id', id)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        errorResponse(APIErrors.NOT_FOUND('User')),
        { status: 404 }
      )
    }

    // Fetch audit logs where this user is the target
    // We query audit_logs where target_id = user id OR target_type = 'user' and target_id = user id
    const { data: auditLogs, error: auditError, count } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .or(`target_id.eq.${id},target_user_id.eq.${id}`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (auditError) {
      // Table might not exist yet
      if (auditError.code === '42P01') {
        return NextResponse.json(successResponse({
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
          },
          activities: [],
          pagination: {
            total: 0,
            limit,
            offset,
            hasMore: false,
          },
        }))
      }
      throw auditError
    }

    // Get unique actor IDs to fetch their info
    const actorIds = [...new Set((auditLogs || [])
      .map((log: AuditLogEntry) => log.user_id)
      .filter((id): id is string => id !== null))]

    // Fetch actor user info
    let actorMap: Record<string, { full_name: string; email: string }> = {}
    if (actorIds.length > 0) {
      const { data: actors } = await supabase
        .from('users')
        .select('id, full_name, email')
        .in('id', actorIds)

      if (actors) {
        actorMap = actors.reduce((acc, actor) => {
          acc[actor.id] = { full_name: actor.full_name, email: actor.email }
          return acc
        }, {} as Record<string, { full_name: string; email: string }>)
      }
    }

    // Format audit log entries
    const formattedActivities: FormattedActivityEntry[] = (auditLogs || []).map((entry: AuditLogEntry) => {
      const actor = entry.user_id ? actorMap[entry.user_id] : null
      return {
        id: entry.id,
        action: entry.action,
        actorId: entry.user_id,
        actorName: actor?.full_name || null,
        actorEmail: actor?.email || null,
        details: entry.details,
        ipAddress: entry.ip_address,
        timestamp: entry.created_at,
      }
    })

    // Optionally include auth events (login, password reset, etc.)
    let authActivities: FormattedActivityEntry[] = []
    if (includeAuthEvents) {
      const { data: authLogs } = await supabase
        .from('auth_audit_log')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (authLogs) {
        authActivities = authLogs.map((entry) => ({
          id: entry.id,
          action: entry.event_type,
          actorId: entry.user_id,
          actorName: user.full_name,
          actorEmail: user.email,
          details: entry.metadata,
          ipAddress: entry.ip_address,
          timestamp: entry.created_at,
        }))
      }
    }

    // Merge and sort all activities
    const allActivities = [...formattedActivities, ...authActivities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Build response
    const response = {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
      activities: allActivities,
      pagination: {
        total: (count || 0) + authActivities.length,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    }

    return NextResponse.json(successResponse(response))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
