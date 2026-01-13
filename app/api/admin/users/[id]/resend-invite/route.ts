/**
 * POST /api/admin/users/[id]/resend-invite
 * Admin-triggered invitation resend - generates new temp password and emails user
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

/**
 * Generate a secure temporary password
 * Uses a mix of lowercase, uppercase, numbers, and special characters
 */
function generateSecurePassword(): string {
  const length = 14
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const special = '!@#$%^&*'
  const allChars = lowercase + uppercase + numbers + special

  // Ensure at least one of each type
  let password = ''
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length))
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length))
  password += numbers.charAt(Math.floor(Math.random() * numbers.length))
  password += special.charAt(Math.floor(Math.random() * special.length))

  // Fill remaining characters randomly
  for (let i = password.length; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length))
  }

  // Shuffle the password to randomize character positions
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('')
}

/**
 * Verify that the current user is an admin
 */
async function verifyAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw APIErrors.UNAUTHORIZED('You must be logged in')
  }

  const { data: adminRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

  if (!adminRoles || adminRoles.length === 0) {
    throw APIErrors.FORBIDDEN('Only admins can resend invitations')
  }

  return user
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const adminUser = await verifyAdmin(supabase)

    const supabaseAdmin = await createAdminClient()

    // Get target user details
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        status,
        roles:user_roles(role)
      `)
      .eq('id', id)
      .single()

    if (userError || !targetUser) {
      return NextResponse.json(
        errorResponse(APIErrors.NOT_FOUND('User')),
        { status: 404 }
      )
    }

    // Generate new temporary password
    const temporaryPassword = generateSecurePassword()

    // Update password in Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, {
      password: temporaryPassword,
    })

    if (authError) {
      console.error('Failed to update user password:', authError)
      throw APIErrors.INTERNAL_ERROR('Failed to reset user password')
    }

    // Get admin profile for the invitation email
    const { data: adminProfile } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', adminUser.id)
      .single()

    const adminName = adminProfile?.full_name || adminUser.email || 'Admin'
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5040'}/login`

    // Determine user's primary role for the invitation email
    const userRoles = targetUser.roles as Array<{ role: string }> | null
    const primaryRole = userRoles?.[0]?.role as 'admin' | 'instructor' | 'expert' | 'client' || 'client'

    // Send invitation email
    let emailSent = false
    try {
      await emailService.sendUserInvitation(targetUser.email, {
        inviterName: adminName,
        role: primaryRole,
        temporaryPassword,
        loginUrl,
        organizationName: 'HumanGlue',
      })
      emailSent = true
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError)
      // Don't fail the request if email fails - admin can share credentials manually
    }

    // Log action to audit_logs table
    try {
      await supabaseAdmin
        .from('audit_logs')
        .insert({
          action: 'resend_invitation',
          actor_id: adminUser.id,
          target_type: 'user',
          target_id: id,
          metadata: {
            target_email: targetUser.email,
            target_name: targetUser.full_name,
            email_sent: emailSent,
            role: primaryRole,
          },
          created_at: new Date().toISOString(),
        })
    } catch (auditError) {
      // Log audit failure but don't fail the request
      console.error('Failed to create audit log:', auditError)
    }

    return NextResponse.json(successResponse({
      message: emailSent
        ? 'Invitation resent successfully. Email sent to user.'
        : 'Password reset successfully. Email failed to send - please share credentials manually.',
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
