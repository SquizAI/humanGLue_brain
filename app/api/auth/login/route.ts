/**
 * POST /api/auth/login
 * Authenticate user with email/password
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { loginSchema, validateData } from '@/lib/validation/auth-schemas'

export async function POST(request: NextRequest) {
  // Create arrays to collect cookies that Supabase wants to set
  const cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }> = []
  const cookiesToRemove: Array<{ name: string; options: CookieOptions }> = []

  // Create Supabase client that can set cookies on the response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookiesToSet.push({ name, value, options })
        },
        remove(name: string, options: CookieOptions) {
          cookiesToRemove.push({ name, options })
        },
      },
    }
  )

  try {
    const body = await request.json()

    // Validate input
    const validation = validateData(loginSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid login credentials',
            details: validation.errors,
          },
        },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      // Handle specific errors
      if (authError.message.includes('Invalid login credentials')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_CREDENTIALS',
              message: 'Invalid email or password',
            },
          },
          { status: 401 }
        )
      }

      if (authError.message.includes('Email not confirmed')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'EMAIL_NOT_VERIFIED',
              message: 'Please verify your email address before logging in',
            },
          },
          { status: 403 }
        )
      }

      throw authError
    }

    if (!authData.user || !authData.session) {
      throw new Error('Login failed')
    }

    // Fetch user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      throw profileError
    }

    // Check if user has instructor profile
    const { data: instructorProfile } = await supabase
      .from('instructor_profiles')
      .select('id')
      .eq('user_id', authData.user.id)
      .single()

    // Update last login timestamp
    await supabase
      .from('profiles')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', authData.user.id)

    // Determine application role for redirect
    let role: 'admin' | 'instructor' | 'client'
    if (profile.role === 'admin') {
      role = 'admin'
    } else if (instructorProfile) {
      role = 'instructor'
    } else {
      role = 'client'
    }

    // Determine redirect path
    let redirectPath = '/dashboard'
    if (role === 'admin') {
      redirectPath = '/admin'
    } else if (role === 'instructor') {
      redirectPath = '/instructor'
    } else {
      redirectPath = '/dashboard'
    }

    const jsonResponse = NextResponse.json({
      success: true,
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          role,
        },
        redirectPath,
      },
    })

    // Apply all cookies that Supabase wanted to set
    cookiesToSet.forEach(({ name, value, options }) => {
      jsonResponse.cookies.set(name, value, options)
    })
    cookiesToRemove.forEach(({ name, options }) => {
      jsonResponse.cookies.set(name, '', options)
    })

    return jsonResponse
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'LOGIN_ERROR',
          message: error instanceof Error ? error.message : 'Failed to log in',
        },
      },
      { status: 500 }
    )
  }
}
