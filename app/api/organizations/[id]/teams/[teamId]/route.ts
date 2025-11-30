/**
 * Single Team API
 * GET /api/organizations/[id]/teams/[teamId] - Get team details
 * PATCH /api/organizations/[id]/teams/[teamId] - Update team
 * DELETE /api/organizations/[id]/teams/[teamId] - Delete team
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/api/auth'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string; teamId: string }>
}

const updateTeamSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  parentTeamId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().optional(),
})

/**
 * GET /api/organizations/[id]/teams/[teamId]
 * Get team details with members
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: orgId, teamId } = await params

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
          error: { code: 'FORBIDDEN', message: 'Not authorized' },
        },
        { status: 403 }
      )
    }

    // Fetch team
    const { data: team, error } = await supabase
      .from('teams')
      .select(`
        *,
        parent_team:teams!teams_parent_team_id_fkey(id, name)
      `)
      .eq('id', teamId)
      .eq('organization_id', orgId)
      .single()

    if (error || !team) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Team not found' },
        },
        { status: 404 }
      )
    }

    // Get team members
    const { data: members } = await supabase
      .from('team_members')
      .select(`
        user_id,
        role,
        joined_at,
        user:users(id, full_name, email, avatar_url, job_title)
      `)
      .eq('team_id', teamId)

    // Get child teams
    const { data: childTeams } = await supabase
      .from('teams')
      .select('id, name')
      .eq('parent_team_id', teamId)
      .eq('is_active', true)

    return NextResponse.json({
      success: true,
      data: {
        ...team,
        members: members || [],
        childTeams: childTeams || [],
      },
    })
  } catch (error) {
    console.error('Get team error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch team',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/organizations/[id]/teams/[teamId]
 * Update team details
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: orgId, teamId } = await params
    const body = await request.json()

    const validation = updateTeamSchema.safeParse(body)
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

    // Check if user can manage teams
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single()

    // Team leads can update their own team
    const { data: teamMembership } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single()

    const canManage =
      membership?.role && ['owner', 'org_admin'].includes(membership.role) ||
      teamMembership?.role === 'team_lead'

    if (!canManage) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Not authorized to update this team' },
        },
        { status: 403 }
      )
    }

    // Check for duplicate name if changing
    if (data.name) {
      const { data: existing } = await supabase
        .from('teams')
        .select('id')
        .eq('organization_id', orgId)
        .eq('name', data.name)
        .neq('id', teamId)
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
    }

    // Prevent circular parent references
    if (data.parentTeamId) {
      if (data.parentTeamId === teamId) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'INVALID_PARENT', message: 'Team cannot be its own parent' },
          },
          { status: 400 }
        )
      }

      // Check if parent exists in same org
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

    // Build update object
    const updates: Record<string, unknown> = {}
    if (data.name !== undefined) updates.name = data.name
    if (data.description !== undefined) updates.description = data.description
    if (data.parentTeamId !== undefined) updates.parent_team_id = data.parentTeamId
    if (data.isActive !== undefined) updates.is_active = data.isActive

    const { data: updated, error } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', teamId)
      .eq('organization_id', orgId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error) {
    console.error('Update team error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update team',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/organizations/[id]/teams/[teamId]
 * Delete (deactivate) a team
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: orgId, teamId } = await params

    const supabase = await createClient()

    // Check if user can manage teams (owner or org_admin only)
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
          error: { code: 'FORBIDDEN', message: 'Not authorized to delete teams' },
        },
        { status: 403 }
      )
    }

    // Check if team has child teams
    const { data: childTeams } = await supabase
      .from('teams')
      .select('id')
      .eq('parent_team_id', teamId)
      .eq('is_active', true)

    if (childTeams && childTeams.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'HAS_CHILDREN',
            message: 'Cannot delete team with sub-teams. Delete or reassign sub-teams first.',
          },
        },
        { status: 400 }
      )
    }

    // Soft delete (deactivate) the team
    const { error } = await supabase
      .from('teams')
      .update({ is_active: false })
      .eq('id', teamId)
      .eq('organization_id', orgId)

    if (error) throw error

    // Remove all team members
    await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)

    return NextResponse.json({
      success: true,
      message: 'Team deleted successfully',
    })
  } catch (error) {
    console.error('Delete team error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete team',
        },
      },
      { status: 500 }
    )
  }
}
