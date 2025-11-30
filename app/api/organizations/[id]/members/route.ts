/**
 * Organization Members API
 * GET /api/organizations/[id]/members - List members
 * POST /api/organizations/[id]/members - Add member (admin only)
 * PATCH /api/organizations/[id]/members - Update member role
 * DELETE /api/organizations/[id]/members - Remove member
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/api/auth'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Schema for updating member
const updateMemberSchema = z.object({
  memberId: z.string().uuid(),
  role: z.enum(['member', 'team_lead', 'org_admin']).optional(),
  status: z.enum(['active', 'suspended']).optional(),
  title: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
})

// Schema for removing member
const removeMemberSchema = z.object({
  memberId: z.string().uuid(),
})

/**
 * GET /api/organizations/[id]/members
 * List all members of an organization
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: orgId } = await params

    const supabase = await createClient()

    // Check if user is a member of this organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single()

    // Platform admins can view any org
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
          error: { code: 'FORBIDDEN', message: 'Not a member of this organization' },
        },
        { status: 403 }
      )
    }

    // Fetch members with user details
    const { data: members, error } = await supabase
      .from('organization_members')
      .select(
        `
        id,
        user_id,
        role,
        status,
        title,
        department,
        joined_at,
        created_at,
        user:users(
          id,
          email,
          full_name,
          avatar_url
        )
      `
      )
      .eq('organization_id', orgId)
      .order('role', { ascending: true })
      .order('joined_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: members,
    })
  } catch (error) {
    console.error('List members error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch members',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/organizations/[id]/members
 * Update a member's role or status
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: orgId } = await params
    const body = await request.json()

    // Validate input
    const validation = updateMemberSchema.safeParse(body)
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
          error: { code: 'FORBIDDEN', message: 'Not authorized to manage members' },
        },
        { status: 403 }
      )
    }

    // Get target member
    const { data: targetMember } = await supabase
      .from('organization_members')
      .select('role, user_id')
      .eq('id', data.memberId)
      .eq('organization_id', orgId)
      .single()

    if (!targetMember) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Member not found' },
        },
        { status: 404 }
      )
    }

    // Can't modify owner
    if (targetMember.role === 'owner') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Cannot modify owner' },
        },
        { status: 403 }
      )
    }

    // Can't modify yourself
    if (targetMember.user_id === user.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Cannot modify your own membership' },
        },
        { status: 403 }
      )
    }

    // Build update object
    const updates: Record<string, string> = {}
    if (data.role) updates.role = data.role
    if (data.status) updates.status = data.status
    if (data.title !== undefined) updates.title = data.title
    if (data.department !== undefined) updates.department = data.department

    const { data: updated, error: updateError } = await supabase
      .from('organization_members')
      .update(updates)
      .eq('id', data.memberId)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error) {
    console.error('Update member error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update member',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/organizations/[id]/members
 * Remove a member from the organization
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: orgId } = await params
    const body = await request.json()

    // Validate input
    const validation = removeMemberSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid data',
          },
        },
        { status: 400 }
      )
    }

    const { memberId } = validation.data
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
          error: { code: 'FORBIDDEN', message: 'Not authorized to remove members' },
        },
        { status: 403 }
      )
    }

    // Get target member
    const { data: targetMember } = await supabase
      .from('organization_members')
      .select('role, user_id')
      .eq('id', memberId)
      .eq('organization_id', orgId)
      .single()

    if (!targetMember) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Member not found' },
        },
        { status: 404 }
      )
    }

    // Can't remove owner
    if (targetMember.role === 'owner') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Cannot remove organization owner' },
        },
        { status: 403 }
      )
    }

    // Can't remove yourself
    if (targetMember.user_id === user.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Cannot remove yourself. Transfer ownership first.' },
        },
        { status: 403 }
      )
    }

    // Remove from team_members first
    await supabase
      .from('team_members')
      .delete()
      .eq('user_id', targetMember.user_id)

    // Remove from organization
    const { error: deleteError } = await supabase
      .from('organization_members')
      .delete()
      .eq('id', memberId)

    if (deleteError) throw deleteError

    // Update subscription user count
    const supabaseAdmin = await createAdminClient()
    const { count } = await supabaseAdmin
      .from('organization_members')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'active')

    await supabaseAdmin
      .from('organization_subscriptions')
      .update({ current_user_count: count || 0 })
      .eq('organization_id', orgId)

    return NextResponse.json({
      success: true,
      message: 'Member removed successfully',
    })
  } catch (error) {
    console.error('Remove member error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to remove member',
        },
      },
      { status: 500 }
    )
  }
}
