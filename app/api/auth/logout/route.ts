/**
 * POST /api/auth/logout
 * Sign out current user
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })
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
