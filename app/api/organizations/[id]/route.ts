/**
 * Single Organization API
 * GET /api/organizations/[id] - Get organization details
 * PATCH /api/organizations/[id] - Update organization
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/api/auth'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Schema for updating organization
const updateOrgSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  industry: z.string().max(100).optional(),
  companySize: z.string().max(50).optional(),
  website: z.string().url().nullable().optional(),
  settings: z.record(z.unknown()).optional(),
})

/**
 * GET /api/organizations/[id]
 * Get organization details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: orgId } = await params

    const supabase = await createClient()

    // Check if user is a member or platform admin
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single()

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isPlatformAdmin = profile?.role && ['admin', 'super_admin_full'].includes(profile.role)

    if (!membership && !isPlatformAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Not authorized to view this organization' },
        },
        { status: 403 }
      )
    }

    // Fetch organization with subscription
    const { data: org, error } = await supabase
      .from('organizations')
      .select(
        `
        *,
        subscription:organization_subscriptions(
          id,
          status,
          billing_cycle,
          current_period_end,
          current_user_count,
          current_team_count,
          plan:subscription_plans(
            name,
            slug,
            max_users,
            max_teams,
            features
          )
        ),
        owner:users!organizations_owner_id_fkey(
          id,
          email,
          full_name
        )
      `
      )
      .eq('id', orgId)
      .single()

    if (error) throw error

    if (!org) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Organization not found' },
        },
        { status: 404 }
      )
    }

    // Add member counts
    const { count: memberCount } = await supabase
      .from('organization_members')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'active')

    const { count: teamCount } = await supabase
      .from('teams')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)

    return NextResponse.json({
      success: true,
      data: {
        ...org,
        memberCount: memberCount || 0,
        teamCount: teamCount || 0,
        userRole: membership?.role || (isPlatformAdmin ? 'admin' : null),
      },
    })
  } catch (error) {
    console.error('Get organization error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch organization',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/organizations/[id]
 * Update organization details
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: orgId } = await params
    const body = await request.json()

    // Validate input
    const validation = updateOrgSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid data',
            details: validation.error.errors,
          },
        },
        { status: 400 }
      )
    }

    const data = validation.data
    const supabase = await createClient()

    // Check if user can manage this organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single()

    if (!membership || !['owner', 'org_admin'].includes(membership.role)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Not authorized to update organization' },
        },
        { status: 403 }
      )
    }

    // Build update object
    const updates: Record<string, unknown> = {}
    if (data.name) updates.name = data.name
    if (data.industry !== undefined) updates.industry = data.industry
    if (data.companySize !== undefined) updates.company_size = data.companySize
    if (data.website !== undefined) updates.website = data.website
    if (data.settings) updates.settings = data.settings

    const { data: updated, error: updateError } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', orgId)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error) {
    console.error('Update organization error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update organization',
        },
      },
      { status: 500 }
    )
  }
}
