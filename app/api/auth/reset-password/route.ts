/**
 * POST /api/auth/reset-password
 * Send password reset email
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resetPasswordRequestSchema, validateData } from '@/lib/validation/auth-schemas'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = validateData(resetPasswordRequestSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid email address',
            details: validation.errors,
          },
        },
        { status: 400 }
      )
    }

    const { email } = validation.data

    const supabase = await createClient()

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/update-password`,
    })

    if (error) {
      throw error
    }

    // Always return success (don't reveal if email exists)
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    // Don't reveal if email exists - return success
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    })
  }
}
