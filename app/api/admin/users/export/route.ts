/**
 * GET /api/admin/users/export
 * Export users to CSV file with filtering support
 *
 * Query Parameters:
 * - role: Filter by role (admin, instructor, expert, client, org_admin, team_lead, member)
 * - status: Filter by status (active, inactive, disabled)
 * - organizationId: Filter by organization
 * - search: Search by email or name
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import {
  APIErrors,
  errorResponse,
  handleUnknownError,
} from '@/lib/api/errors'

// Helper to verify admin or org_admin status and get organization scope
async function verifyAdminAccess(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw APIErrors.UNAUTHORIZED('You must be logged in')
  }

  // Check for admin role
  const { data: adminRoles } = await supabase
    .from('user_roles')
    .select('role, organization_id')
    .eq('user_id', user.id)
    .in('role', ['admin', 'org_admin'])
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

  if (!adminRoles || adminRoles.length === 0) {
    throw APIErrors.FORBIDDEN('Only admins can export users')
  }

  // Determine if user is global admin or org_admin
  const isGlobalAdmin = adminRoles.some(r => r.role === 'admin')
  const orgAdminRole = adminRoles.find(r => r.role === 'org_admin')

  // Get user's organization if they're an org_admin
  let organizationId: string | null = null
  if (!isGlobalAdmin && orgAdminRole) {
    // Get org from role or from user profile
    if (orgAdminRole.organization_id) {
      organizationId = orgAdminRole.organization_id
    } else {
      const { data: userProfile } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single()
      organizationId = userProfile?.organization_id || null
    }
  }

  return {
    user,
    isGlobalAdmin,
    organizationId, // null means full access, otherwise scoped to org
  }
}

// Escape CSV field values
function escapeCSVField(value: string | null | undefined): string {
  if (value === null || value === undefined) {
    return ''
  }
  const stringValue = String(value)
  // If the value contains comma, newline, or quotes, wrap in quotes and escape internal quotes
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

// Format date for CSV
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0] // YYYY-MM-DD format
  } catch {
    return ''
  }
}

// Format datetime for CSV
function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toISOString().replace('T', ' ').split('.')[0] // YYYY-MM-DD HH:MM:SS format
  } catch {
    return ''
  }
}

interface UserWithRoles {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  job_title: string | null
  company_name: string | null
  organization_id: string | null
  status: string | null
  created_at: string | null
  last_login: string | null
  roles: Array<{ role: string }>
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { user, isGlobalAdmin, organizationId: scopedOrgId } = await verifyAdminAccess(supabase)

    const { searchParams } = new URL(request.url)
    const roleFilter = searchParams.get('role')
    const statusFilter = searchParams.get('status')
    const orgIdFilter = searchParams.get('organizationId')
    const searchTerm = searchParams.get('search')

    const supabaseAdmin = await createAdminClient()

    // Build query
    let query = supabaseAdmin
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
        created_at,
        last_login,
        roles:user_roles(role)
      `)
      .order('created_at', { ascending: false })

    // Apply organization scoping for org_admin users
    if (!isGlobalAdmin && scopedOrgId) {
      query = query.eq('organization_id', scopedOrgId)
    } else if (orgIdFilter) {
      // Global admin can filter by specific org
      query = query.eq('organization_id', orgIdFilter)
    }

    // Apply status filter
    if (statusFilter) {
      if (!['active', 'inactive', 'disabled'].includes(statusFilter)) {
        return NextResponse.json(
          errorResponse(APIErrors.VALIDATION_ERROR({ status: 'Must be active, inactive, or disabled' })),
          { status: 400 }
        )
      }
      query = query.eq('status', statusFilter)
    }

    // Apply search filter
    if (searchTerm) {
      query = query.or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
    }

    // Execute query
    const { data: users, error: fetchError } = await query

    if (fetchError) {
      throw fetchError
    }

    // Filter by role if specified (must be done in JS since roles is a joined table)
    let filteredUsers = users as UserWithRoles[]
    if (roleFilter) {
      const validRoles = ['admin', 'instructor', 'expert', 'client', 'org_admin', 'team_lead', 'member']
      if (!validRoles.includes(roleFilter)) {
        return NextResponse.json(
          errorResponse(APIErrors.VALIDATION_ERROR({ role: `Invalid role. Must be one of: ${validRoles.join(', ')}` })),
          { status: 400 }
        )
      }
      filteredUsers = filteredUsers.filter(user =>
        user.roles && user.roles.some(r => r.role === roleFilter)
      )
    }

    // Generate CSV header
    const csvHeaders = [
      'email',
      'full_name',
      'roles',
      'phone',
      'job_title',
      'company_name',
      'organization_id',
      'status',
      'created_at',
      'last_login'
    ]

    // Generate CSV rows
    const csvRows: string[] = [csvHeaders.join(',')]

    for (const userRecord of filteredUsers) {
      const rolesString = userRecord.roles
        ? userRecord.roles.map(r => r.role).join('; ')
        : ''

      const row = [
        escapeCSVField(userRecord.email),
        escapeCSVField(userRecord.full_name),
        escapeCSVField(rolesString),
        escapeCSVField(userRecord.phone),
        escapeCSVField(userRecord.job_title),
        escapeCSVField(userRecord.company_name),
        escapeCSVField(userRecord.organization_id),
        escapeCSVField(userRecord.status),
        escapeCSVField(formatDateTime(userRecord.created_at)),
        escapeCSVField(formatDateTime(userRecord.last_login)),
      ]

      csvRows.push(row.join(','))
    }

    const csvContent = csvRows.join('\n')

    // Log the export action to audit log
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     request.headers.get('x-real-ip') ||
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    await supabaseAdmin
      .from('auth_audit_log')
      .insert({
        user_id: user.id,
        event_type: 'user_export',
        ip_address: clientIp,
        user_agent: userAgent,
        metadata: {
          exported_count: filteredUsers.length,
          filters: {
            role: roleFilter,
            status: statusFilter,
            organizationId: orgIdFilter || scopedOrgId,
            search: searchTerm,
          },
          is_global_admin: isGlobalAdmin,
        },
      })

    // Generate filename with date
    const dateStr = new Date().toISOString().split('T')[0]
    const filename = `users_export_${dateStr}.csv`

    // Return CSV response with proper headers
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
