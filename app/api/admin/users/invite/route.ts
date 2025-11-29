/**
 * POST /api/admin/users/invite
 * Invite a new user and send them login credentials via email
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { emailService } from '@/services/email'

// Helper to generate a random password
function generateTemporaryPassword(): string {
  const length = 12
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Not needed for this endpoint
        },
        remove(name: string, options: CookieOptions) {
          // Not needed for this endpoint
        },
      },
    }
  )

  try {
    // Verify that the requester is an admin
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to invite users',
          },
        },
        { status: 401 }
      )
    }

    // Check if user has admin role
    const { data: adminRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', currentUser.id)
      .eq('role', 'admin')
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

    if (!adminRoles || adminRoles.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Only admins can invite users',
          },
        },
        { status: 403 }
      )
    }

    // Get request body
    const body = await request.json()
    const { email, role, fullName, organizationName } = body

    // Validate input
    if (!email || !role) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email and role are required',
          },
        },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['admin', 'instructor', 'expert', 'client']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
          },
        },
        { status: 400 }
      )
    }

    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword()

    // Create user in Supabase Auth using Admin API
    // Note: This requires a service role key for production
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set() {},
          remove() {},
        },
      }
    )

    const { data: newUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName || email.split('@')[0],
      },
    })

    if (authError) {
      console.error('Failed to create user:', authError)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_CREATION_FAILED',
            message: authError.message || 'Failed to create user account',
          },
        },
        { status: 500 }
      )
    }

    if (!newUser.user) {
      throw new Error('User creation succeeded but no user returned')
    }

    // Create user profile in public.users
    const { error: profileError } = await supabase.from('users').insert({
      id: newUser.user.id,
      email,
      full_name: fullName || email.split('@')[0],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error('Failed to create user profile:', profileError)
      // Continue anyway - profile will be created on first login
    }

    // Assign role to user
    const { error: roleError } = await supabase.from('user_roles').insert({
      user_id: newUser.user.id,
      role,
      granted_at: new Date().toISOString(),
    })

    if (roleError) {
      console.error('Failed to assign role:', roleError)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ROLE_ASSIGNMENT_FAILED',
            message: 'User created but failed to assign role',
          },
        },
        { status: 500 }
      )
    }

    // Get current user's full name for the invitation email
    const { data: inviterProfile } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', currentUser.id)
      .single()

    const inviterName = inviterProfile?.full_name || currentUser.email || 'Admin'

    // Send invitation email
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`

    try {
      await emailService.sendUserInvitation(email, {
        inviterName,
        role,
        temporaryPassword,
        loginUrl,
        organizationName,
      })
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError)
      // Don't fail the entire request if email fails
      return NextResponse.json({
        success: true,
        data: {
          userId: newUser.user.id,
          email,
          role,
          emailSent: false,
          temporaryPassword, // Return password so admin can share it manually
        },
        warning: 'User created but invitation email failed to send',
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: newUser.user.id,
        email,
        role,
        emailSent: true,
      },
    })
  } catch (error) {
    console.error('User invitation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVITATION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to invite user',
        },
      },
      { status: 500 }
    )
  }
}
