/**
 * Admin User Login History API
 * GET /api/admin/users/[id]/login-history - Get login history for a specific user
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
    throw APIErrors.FORBIDDEN('Only admins can view login history')
  }

  return user
}

interface LoginHistoryEntry {
  id: string
  user_id: string
  login_at: string
  ip_address: string | null
  user_agent: string | null
  success: boolean | null
  failure_reason: string | null
  location: { country?: string; city?: string } | null
  device_info: { device_type?: string; browser?: string; os?: string } | null
}

interface LoginStats {
  total_logins: number
  first_login: string | null
  last_login: string | null
  logins_last_30_days: number
  logins_last_7_days: number
}

/**
 * GET /api/admin/users/[id]/login-history
 * Get paginated login history for a specific user
 *
 * Query params:
 * - limit: number of records to return (default: 50, max: 100)
 * - offset: number of records to skip (default: 0)
 * - include_stats: if "true", include login statistics
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
    const includeStats = searchParams.get('include_stats') === 'true'

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

    // Fetch login history
    const { data: loginHistory, error: historyError, count } = await supabase
      .from('login_history')
      .select('*', { count: 'exact' })
      .eq('user_id', id)
      .order('login_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (historyError) {
      // Table might not exist yet
      if (historyError.code === '42P01') {
        return NextResponse.json(successResponse({
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
          },
          logins: [],
          stats: null,
          pagination: {
            total: 0,
            limit,
            offset,
            hasMore: false,
          },
        }))
      }
      throw historyError
    }

    // Format login entries
    const formattedLogins = (loginHistory || []).map((entry: LoginHistoryEntry) => ({
      id: entry.id,
      loginAt: entry.login_at,
      ipAddress: entry.ip_address,
      userAgent: entry.user_agent,
      deviceType: entry.device_info?.device_type || null,
      browser: entry.device_info?.browser || null,
      os: entry.device_info?.os || null,
      location: entry.location?.country && entry.location?.city
        ? `${entry.location.city}, ${entry.location.country}`
        : entry.location?.country || entry.location?.city || null,
      loginMethod: entry.success === false ? 'failed' : 'password',
      success: entry.success,
    }))

    // Get login stats if requested
    let stats: LoginStats | null = null
    if (includeStats) {
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_user_login_stats', { p_user_id: id })
        .single()

      if (!statsError && statsData) {
        stats = statsData as LoginStats
      }
    }

    // Build response
    const response = {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
      logins: formattedLogins,
      stats: stats ? {
        totalLogins: stats.total_logins,
        firstLogin: stats.first_login,
        lastLogin: stats.last_login,
        loginsLast30Days: stats.logins_last_30_days,
        loginsLast7Days: stats.logins_last_7_days,
      } : null,
      pagination: {
        total: count || 0,
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
