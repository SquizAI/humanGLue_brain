/**
 * POST /api/auth/signup
 * Create new user account with email/password
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { signupSchema, validateData } from '@/lib/validation/auth-schemas'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = validateData(signupSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid signup data',
            details: validation.errors,
          },
        },
        { status: 400 }
      )
    }

    const { email, password, fullName, role, organizationId } = validation.data

    const supabase = await createClient()
    const supabaseAdmin = await createAdminClient()

    // Create Supabase auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (authError) {
      // Handle specific errors
      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'EMAIL_EXISTS',
              message: 'An account with this email already exists',
            },
          },
          { status: 409 }
        )
      }

      throw authError
    }

    if (!authData.user) {
      throw new Error('User creation failed')
    }

    // Determine database role based on application role
    // The profiles table expects 'client', 'instructor', or 'admin'
    // The validation schema ensures role is 'client' or 'instructor'
    const dbRole = role

    // Create user profile in database
    // Use admin client to bypass RLS since the user might not have a session yet
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: authData.user.id,
      email,
      full_name: fullName,
      role: dbRole,
      // organization_id removed as it doesn't exist in schema
    })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Rollback: delete auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw profileError
    }

    // If instructor, create instructor profile
    if (role === 'instructor') {
      const { error: instructorError } = await supabaseAdmin
        .from('instructor_profiles')
        .insert({
          user_id: authData.user.id,
          bio: 'New instructor - please update your bio',
          professional_title: 'Instructor',
        })

      if (instructorError) {
        console.error('Failed to create instructor profile:', instructorError)
        // Don't rollback - user can create instructor profile later
      }

      // Create instructor settings
      await supabaseAdmin.from('instructor_settings').insert({
        user_id: authData.user.id,
      })
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: authData.user.id,
            email: authData.user.email,
            emailConfirmed: authData.user.email_confirmed_at !== null,
          },
          message: authData.user.email_confirmed_at
            ? 'Account created successfully'
            : 'Account created! Please check your email to verify your account.',
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SIGNUP_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create account',
        },
      },
      { status: 500 }
    )
  }
}
