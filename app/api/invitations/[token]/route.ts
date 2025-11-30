/**
 * Invitation Token API
 * GET /api/invitations/[token] - Get invitation details
 * POST /api/invitations/[token] - Accept invitation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ token: string }>
}

// Schema for accepting invitation
const acceptInvitationSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain a special character'),
  jobTitle: z.string().optional(),
})

/**
 * GET /api/invitations/[token]
 * Get invitation details by token
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params
    const supabase = await createClient()

    // Find invitation by token
    const { data: invitation, error } = await supabase
      .from('organization_invitations')
      .select(
        `
        id,
        email,
        role,
        status,
        expires_at,
        personal_message,
        organization:organizations(id, name, slug),
        team:teams(id, name),
        invited_by_user:users!organization_invitations_invited_by_fkey(full_name)
      `
      )
      .eq('token', token)
      .single()

    if (error || !invitation) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Invitation not found' },
        },
        { status: 404 }
      )
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'EXPIRED', message: 'This invitation has expired' },
        },
        { status: 410 }
      )
    }

    // Check if already accepted
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: `This invitation has been ${invitation.status}`,
          },
        },
        { status: 400 }
      )
    }

    // Check if user already has an account
    const supabaseAdmin = await createAdminClient()
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', invitation.email)
      .single()

    return NextResponse.json({
      success: true,
      data: {
        invitation: {
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          personalMessage: invitation.personal_message,
          expiresAt: invitation.expires_at,
        },
        organization: invitation.organization,
        team: invitation.team,
        invitedBy: invitation.invited_by_user,
        hasExistingAccount: !!existingUser,
      },
    })
  } catch (error) {
    console.error('Get invitation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch invitation',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/invitations/[token]
 * Accept invitation and create/link account
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params
    const body = await request.json()

    const supabaseAdmin = await createAdminClient()

    // Find invitation
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from('organization_invitations')
      .select(
        `
        *,
        organization:organizations(id, name)
      `
      )
      .eq('token', token)
      .single()

    if (inviteError || !invitation) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Invitation not found' },
        },
        { status: 404 }
      )
    }

    // Validate invitation status
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: `This invitation has been ${invitation.status}`,
          },
        },
        { status: 400 }
      )
    }

    if (new Date(invitation.expires_at) < new Date()) {
      // Mark as expired
      await supabaseAdmin
        .from('organization_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id)

      return NextResponse.json(
        {
          success: false,
          error: { code: 'EXPIRED', message: 'This invitation has expired' },
        },
        { status: 410 }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', invitation.email)
      .single()

    let userId: string

    if (existingUser) {
      // Existing user - just add to organization
      userId = existingUser.id
    } else {
      // New user - validate and create account
      const validation = acceptInvitationSchema.safeParse(body)
      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid account data',
              details: validation.error.errors,
            },
          },
          { status: 400 }
        )
      }

      const data = validation.data

      // Create auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: invitation.email,
        password: data.password,
        email_confirm: true, // Auto-confirm since they clicked invite link
        user_metadata: {
          full_name: data.fullName,
          role: invitation.role,
        },
      })

      if (authError || !authData.user) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'USER_CREATION_FAILED',
              message: authError?.message || 'Failed to create account',
            },
          },
          { status: 500 }
        )
      }

      userId = authData.user.id

      // Create user profile
      const { error: userError } = await supabaseAdmin.from('users').insert({
        id: userId,
        email: invitation.email,
        full_name: data.fullName,
        role: invitation.role === 'org_admin' ? 'org_admin' : 'member',
        organization_id: invitation.organization_id,
        status: 'active',
        email_verified: true,
      })

      if (userError) {
        // Rollback auth user
        await supabaseAdmin.auth.admin.deleteUser(userId)
        throw userError
      }
    }

    // Add user to organization
    const { error: memberError } = await supabaseAdmin.from('organization_members').insert({
      organization_id: invitation.organization_id,
      user_id: userId,
      role: invitation.role,
      status: 'active',
      title: body.jobTitle || null,
      invited_by: invitation.invited_by,
      joined_at: new Date().toISOString(),
    })

    if (memberError) {
      console.error('Member creation error:', memberError)
      // Don't fail - user might already be a member
    }

    // Add to team if specified
    if (invitation.team_id) {
      await supabaseAdmin.from('team_members').insert({
        team_id: invitation.team_id,
        user_id: userId,
        role: invitation.role === 'team_lead' ? 'team_lead' : 'member',
      })
    }

    // Update invitation status
    await supabaseAdmin
      .from('organization_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        accepted_by: userId,
      })
      .eq('id', invitation.id)

    // Update organization member count
    await supabaseAdmin
      .from('organization_subscriptions')
      .update({
        current_user_count: await supabaseAdmin
          .from('organization_members')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', invitation.organization_id)
          .eq('status', 'active')
          .then(({ count }) => count || 1),
      })
      .eq('organization_id', invitation.organization_id)

    return NextResponse.json({
      success: true,
      data: {
        userId,
        organizationId: invitation.organization_id,
        role: invitation.role,
        message: existingUser
          ? 'You have been added to the organization'
          : 'Account created and added to organization',
      },
    })
  } catch (error) {
    console.error('Accept invitation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'ACCEPT_ERROR',
          message: error instanceof Error ? error.message : 'Failed to accept invitation',
        },
      },
      { status: 500 }
    )
  }
}
