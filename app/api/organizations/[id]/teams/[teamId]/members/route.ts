/**
 * Team Members API
 * GET - List team members
 * POST - Add member to team
 * DELETE - Remove member from team
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/api/auth'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string; teamId: string }>
}

const addMemberSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['member', 'team_lead']).default('member'),
})

const removeMemberSchema = z.object({
  userId: z.string().uuid(),
})

/**
 * GET /api/organizations/[id]/teams/[teamId]/members
 * List all members of a team
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

    // Verify team belongs to org
    const { data: team } = await supabase
      .from('teams')
      .select('id')
      .eq('id', teamId)
      .eq('organization_id', orgId)
      .single()

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Team not found' },
        },
        { status: 404 }
      )
    }

    // Fetch team members with user details
    const { data: members, error } = await supabase
      .from('team_members')
      .select(`
        user_id,
        role,
        joined_at,
        user:users(id, full_name, email, avatar_url, job_title)
      `)
      .eq('team_id', teamId)
      .order('role')

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: members || [],
    })
  } catch (error) {
    console.error('Get team members error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch team members',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/organizations/[id]/teams/[teamId]/members
 * Add a member to the team
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: orgId, teamId } = await params
    const body = await request.json()

    const validation = addMemberSchema.safeParse(body)
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

    // Check if user can manage team members
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single()

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
          error: { code: 'FORBIDDEN', message: 'Not authorized to manage team members' },
        },
        { status: 403 }
      )
    }

    // Verify team belongs to org
    const { data: team } = await supabase
      .from('teams')
      .select('id')
      .eq('id', teamId)
      .eq('organization_id', orgId)
      .single()

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Team not found' },
        },
        { status: 404 }
      )
    }

    // Verify user is in the organization
    const { data: targetMember } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', orgId)
      .eq('user_id', data.userId)
      .single()

    if (!targetMember) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_ORG_MEMBER', message: 'User is not a member of this organization' },
        },
        { status: 400 }
      )
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('team_id', teamId)
      .eq('user_id', data.userId)
      .single()

    if (existingMember) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'ALREADY_MEMBER', message: 'User is already a member of this team' },
        },
        { status: 409 }
      )
    }

    // Add member
    const { error } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: data.userId,
        role: data.role,
      })

    if (error) throw error

    // Fetch the added member with details
    const { data: newMember } = await supabase
      .from('team_members')
      .select(`
        user_id,
        role,
        joined_at,
        user:users(id, full_name, email, avatar_url, job_title)
      `)
      .eq('team_id', teamId)
      .eq('user_id', data.userId)
      .single()

    return NextResponse.json(
      {
        success: true,
        data: newMember,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Add team member error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'ADD_ERROR',
          message: error instanceof Error ? error.message : 'Failed to add team member',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/organizations/[id]/teams/[teamId]/members
 * Remove a member from the team
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: orgId, teamId } = await params
    const body = await request.json()

    const validation = removeMemberSchema.safeParse(body)
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

    const { userId: targetUserId } = validation.data
    const supabase = await createClient()

    // Check if user can manage team members
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single()

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
          error: { code: 'FORBIDDEN', message: 'Not authorized to manage team members' },
        },
        { status: 403 }
      )
    }

    // Team leads can't remove themselves
    if (teamMembership?.role === 'team_lead' && targetUserId === user.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Team leads cannot remove themselves' },
        },
        { status: 403 }
      )
    }

    // Team leads can't remove other team leads (only org admins can)
    const { data: targetTeamMember } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', targetUserId)
      .single()

    if (
      targetTeamMember?.role === 'team_lead' &&
      membership?.role && !['owner', 'org_admin'].includes(membership.role)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Only organization admins can remove team leads' },
        },
        { status: 403 }
      )
    }

    // Remove member
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', targetUserId)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Member removed from team',
    })
  } catch (error) {
    console.error('Remove team member error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'REMOVE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to remove team member',
        },
      },
      { status: 500 }
    )
  }
}
