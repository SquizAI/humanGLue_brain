/**
 * GET /auth/callback
 * Handles Supabase auth callbacks for:
 * - Email verification
 * - Password reset
 * - OAuth flows (future)
 *
 * This route exchanges the auth code for a session and redirects appropriately.
 */

import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle error from Supabase (e.g., expired link)
  if (error) {
    console.error('Auth callback error:', error, errorDescription)
    const errorUrl = new URL('/login', request.url)
    errorUrl.searchParams.set('error', error)
    errorUrl.searchParams.set('message', errorDescription || 'Authentication failed')
    return NextResponse.redirect(errorUrl)
  }

  if (!code) {
    console.error('No auth code provided in callback')
    const errorUrl = new URL('/login', request.url)
    errorUrl.searchParams.set('error', 'no_code')
    errorUrl.searchParams.set('message', 'Invalid authentication link')
    return NextResponse.redirect(errorUrl)
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  try {
    // Exchange code for session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      throw exchangeError
    }

    if (!data.session || !data.user) {
      throw new Error('Failed to establish session')
    }

    // Determine redirect based on user type
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single()

    const { data: instructorProfile } = await supabase
      .from('instructor_profiles')
      .select('id')
      .eq('user_id', data.user.id)
      .single()

    // Determine role-based redirect
    let redirectPath = next
    if (next === '/') {
      if (profile?.role === 'admin') {
        redirectPath = '/admin'
      } else if (instructorProfile) {
        redirectPath = '/instructor'
      } else {
        redirectPath = '/client'
      }
    }

    // Redirect to appropriate dashboard
    return NextResponse.redirect(new URL(redirectPath, request.url))
  } catch (error) {
    console.error('Error exchanging code for session:', error)
    const errorUrl = new URL('/login', request.url)
    errorUrl.searchParams.set('error', 'session_error')
    errorUrl.searchParams.set('message', 'Failed to verify authentication. Please try again.')
    return NextResponse.redirect(errorUrl)
  }
}
