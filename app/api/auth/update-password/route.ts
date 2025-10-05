/**
 * POST /api/auth/update-password
 * Update user password (requires authenticated session)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updatePasswordSchema, validateData } from '@/lib/validation/auth-schemas'
import { requireAuth } from '@/lib/auth/server'

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    await requireAuth()

    const body = await request.json()

    // Validate input
    const validation = validateData(updatePasswordSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid password',
            details: validation.errors,
          },
        },
        { status: 400 }
      )
    }

    const { password } = validation.data

    const supabase = createClient()

    // Update password
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    })
  } catch (error) {
    console.error('Update password error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_PASSWORD_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update password',
        },
      },
      { status: 500 }
    )
  }
}
