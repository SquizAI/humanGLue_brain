/**
 * Organization Invitations API
 * GET /api/organizations/[id]/invitations - List invitations
 * POST /api/organizations/[id]/invitations - Create invitation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/api/auth'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Validation schema for creating invitation
const createInvitationSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['org_admin', 'team_lead', 'member']).default('member'),
  teamId: z.string().uuid().nullable().optional(),
  personalMessage: z.string().max(500).optional(),
})

/**
 * GET /api/organizations/[id]/invitations
 * List all invitations for an organization
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: orgId } = await params

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
          error: { code: 'FORBIDDEN', message: 'Not authorized to view invitations' },
        },
        { status: 403 }
      )
    }

    // Get invitations
    const { data: invitations, error } = await supabase
      .from('organization_invitations')
      .select(
        `
        *,
        invited_by_user:users!organization_invitations_invited_by_fkey(full_name, email),
        team:teams(id, name)
      `
      )
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: invitations,
    })
  } catch (error) {
    console.error('List invitations error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch invitations',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/organizations/[id]/invitations
 * Create a new invitation
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: orgId } = await params
    const body = await request.json()

    // Validate input
    const validation = createInvitationSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid invitation data',
            details: validation.error.errors,
          },
        },
        { status: 400 }
      )
    }

    const data = validation.data
    const supabase = await createClient()
    const supabaseAdmin = await createAdminClient()

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
          error: { code: 'FORBIDDEN', message: 'Not authorized to send invitations' },
        },
        { status: 403 }
      )
    }

    // Check organization limits
    const { data: org } = await supabase
      .from('organizations')
      .select('name, max_users')
      .eq('id', orgId)
      .single()

    if (!org) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Organization not found' },
        },
        { status: 404 }
      )
    }

    // Count current members + pending invitations
    const { count: memberCount } = await supabase
      .from('organization_members')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'active')

    const { count: pendingCount } = await supabase
      .from('organization_invitations')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'pending')

    const totalCount = (memberCount || 0) + (pendingCount || 0)

    if (org.max_users !== -1 && totalCount >= org.max_users) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'LIMIT_REACHED',
            message: `Organization has reached the maximum of ${org.max_users} users. Please upgrade your plan.`,
          },
        },
        { status: 400 }
      )
    }

    // Check if email already has pending invitation
    const { data: existingInvite } = await supabase
      .from('organization_invitations')
      .select('id')
      .eq('organization_id', orgId)
      .eq('email', data.email.toLowerCase())
      .eq('status', 'pending')
      .single()

    if (existingInvite) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ALREADY_INVITED',
            message: 'This email already has a pending invitation',
          },
        },
        { status: 409 }
      )
    }

    // Check if email is already a member
    const { data: existingMember } = await supabase
      .from('organization_members')
      .select('id, users(email)')
      .eq('organization_id', orgId)
      .single()

    // Check via users table
    const { data: userByEmail } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', data.email.toLowerCase())
      .single()

    if (userByEmail) {
      const { data: isMember } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', orgId)
        .eq('user_id', userByEmail.id)
        .single()

      if (isMember) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'ALREADY_MEMBER',
              message: 'This email is already a member of the organization',
            },
          },
          { status: 409 }
        )
      }
    }

    // Create invitation
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from('organization_invitations')
      .insert({
        organization_id: orgId,
        email: data.email.toLowerCase(),
        role: data.role,
        team_id: data.teamId || null,
        invited_by: user.id,
        personal_message: data.personalMessage || null,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      })
      .select()
      .single()

    if (inviteError) throw inviteError

    // Send invitation email
    // TODO: Implement email sending via Resend
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invitation.token}`

    // For now, log the invite URL (in production, send via email)
    console.log(`Invitation created for ${data.email}: ${inviteUrl}`)

    return NextResponse.json(
      {
        success: true,
        data: {
          invitation: {
            id: invitation.id,
            email: invitation.email,
            role: invitation.role,
            status: invitation.status,
            expires_at: invitation.expires_at,
          },
          inviteUrl, // Include for testing, remove in production
          message: `Invitation sent to ${data.email}`,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create invitation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVITATION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create invitation',
        },
      },
      { status: 500 }
    )
  }
}
