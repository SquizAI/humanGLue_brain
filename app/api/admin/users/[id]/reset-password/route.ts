/**
 * POST /api/admin/users/[id]/reset-password
 * Admin-triggered password reset - generates new temp password and emails user
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import {
  APIErrors,
  successResponse,
  errorResponse,
  handleUnknownError,
} from '@/lib/api/errors'
import { emailService } from '@/services/email'
import {
  verifyAdmin,
  generateSecurePassword,
  logAuditAction,
} from '@/lib/admin/utils'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const adminUser = await verifyAdmin(supabase)

    const supabaseAdmin = await createAdminClient()

    // Get user details
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('id', id)
      .single()

    if (userError || !targetUser) {
      return NextResponse.json(
        errorResponse(APIErrors.NOT_FOUND('User')),
        { status: 404 }
      )
    }

    // Generate new cryptographically secure temporary password
    const temporaryPassword = generateSecurePassword(12)

    // Update password in Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, {
      password: temporaryPassword,
    })

    if (authError) throw authError

    // Get admin name for email
    const { data: adminProfile } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', adminUser.id)
      .single()

    const adminName = adminProfile?.full_name || adminUser.email || 'Admin'
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5040'}/login`

    // Send password reset email
    let emailSent = false
    try {
      await emailService.sendPasswordReset(targetUser.email, {
        userName: targetUser.full_name || targetUser.email.split('@')[0],
        temporaryPassword,
        loginUrl,
        adminName,
      })
      emailSent = true
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError)
      // Don't fail the request if email fails
    }

    // Log audit action for password reset
    await logAuditAction({
      userId: adminUser.id,
      action: 'password_reset',
      targetType: 'user',
      targetId: id,
      details: {
        target_email: targetUser.email,
        target_name: targetUser.full_name,
        email_sent: emailSent,
        initiated_by: adminName,
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json(successResponse({
      message: emailSent
        ? 'Password reset successfully. Email sent to user.'
        : 'Password reset successfully. Email failed to send.',
      userId: id,
      email: targetUser.email,
      emailSent,
      // Only include temp password if email failed so admin can share manually
      ...(emailSent ? {} : { temporaryPassword }),
    }))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
