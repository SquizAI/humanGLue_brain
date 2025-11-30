/**
 * Organization Teams CRUD API
 * GET - List all teams for organization
 * POST - Create a new team
 * PATCH - Update a team
 * DELETE - Delete a team
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/api/auth'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Schema for creating/updating team
const teamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters').max(100),
  description: z.string().max(500).optional().nullable(),
  parentTeamId: z.string().uuid().optional().nullable(),
})

/**
 * GET /api/organizations/[id]/teams/crud
 * List all teams for an organization
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: orgId } = await params

    const supabase = await createClient()

    // Check membership
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

    // Fetch teams with member counts
    const { data: teams, error } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        description,
        parent_team_id,
        is_active,
        created_at,
        updated_at,
        settings,
        metadata
      `)
      .eq('organization_id', orgId)
      .eq('is_active', true)
      .order('name')

    if (error) throw error

    // Get member counts for each team
    const teamIds = teams?.map((t) => t.id) || []
    const { data: memberCounts } = await supabase
      .from('team_members')
      .select('team_id')
      .in('team_id', teamIds)

    // Count members per team
    const countMap: Record<string, number> = {}
    memberCounts?.forEach((m) => {
      countMap[m.team_id] = (countMap[m.team_id] || 0) + 1
    })

    // Get team leads for each team
    const { data: teamLeads } = await supabase
      .from('team_members')
      .select(`
        team_id,
        user:users(id, full_name, email, avatar_url)
      `)
      .in('team_id', teamIds)
      .eq('role', 'team_lead')

    const leadMap: Record<string, unknown> = {}
    teamLeads?.forEach((tl) => {
      leadMap[tl.team_id] = tl.user
    })

    // Build hierarchy and add counts
    const teamsWithMeta = teams?.map((team) => ({
      ...team,
      memberCount: countMap[team.id] || 0,
      teamLead: leadMap[team.id] || null,
    }))

    return NextResponse.json({
      success: true,
      data: teamsWithMeta || [],
    })
  } catch (error) {
    console.error('Get teams error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch teams',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/organizations/[id]/teams/crud
 * Create a new team
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: orgId } = await params
    const body = await request.json()

    // Validate input
    const validation = teamSchema.safeParse(body)
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

    // Check if user can manage teams (owner or org_admin)
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
          error: { code: 'FORBIDDEN', message: 'Not authorized to create teams' },
        },
        { status: 403 }
      )
    }

    // Check for duplicate name
    const { data: existing } = await supabase
      .from('teams')
      .select('id')
      .eq('organization_id', orgId)
      .eq('name', data.name)
      .single()

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'DUPLICATE', message: 'A team with this name already exists' },
        },
        { status: 409 }
      )
    }

    // If parent team specified, verify it belongs to same org
    if (data.parentTeamId) {
      const { data: parentTeam } = await supabase
        .from('teams')
        .select('id')
        .eq('id', data.parentTeamId)
        .eq('organization_id', orgId)
        .single()

      if (!parentTeam) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'INVALID_PARENT', message: 'Parent team not found' },
          },
          { status: 400 }
        )
      }
    }

    // Create team
    const { data: team, error } = await supabase
      .from('teams')
      .insert({
        organization_id: orgId,
        name: data.name,
        description: data.description || null,
        parent_team_id: data.parentTeamId || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(
      {
        success: true,
        data: team,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create team error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create team',
        },
      },
      { status: 500 }
    )
  }
}
