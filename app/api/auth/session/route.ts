/**
 * GET /api/auth/session
 * Get current session and user profile
 */

import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/server'

export async function GET() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({
        success: true,
        data: {
          user: null,
          session: null,
        },
      })
    }

    // Determine application role
    let role: 'admin' | 'instructor' | 'client'
    if (currentUser.profile.role === 'admin') {
      role = 'admin'
    } else if (currentUser.profile.is_instructor) {
      role = 'instructor'
    } else {
      role = 'client'
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: currentUser.user.id,
          email: currentUser.user.email,
          full_name: currentUser.profile.full_name,
          avatar_url: currentUser.profile.avatar_url,
          role,
          organization_id: currentUser.profile.organization_id,
        },
        session: {
          authenticated: true,
        },
      },
    })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SESSION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get session',
        },
      },
      { status: 500 }
    )
  }
}
