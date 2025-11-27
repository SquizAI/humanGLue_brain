/**
 * POST /api/auth/logout
 * Sign out current user
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  // Create arrays to collect cookies that Supabase wants to set/remove
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
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }

    const jsonResponse = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })

    // Apply all cookies that Supabase wanted to set
    cookiesToSet.forEach(({ name, value, options }) => {
      jsonResponse.cookies.set(name, value, options)
    })

    // Apply all cookies that Supabase wanted to remove
    cookiesToRemove.forEach(({ name, options }) => {
      jsonResponse.cookies.set(name, '', options)
    })

    return jsonResponse
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'LOGOUT_ERROR',
          message: error instanceof Error ? error.message : 'Failed to log out',
        },
      },
      { status: 500 }
    )
  }
}
