/**
 * POST /api/send-email
 * Send emails using Resend API
 *
 * IMPORTANT: To send emails to external users, you must:
 * 1. Add your domain at https://resend.com/domains
 * 2. Add DNS records (SPF + DKIM) to verify the domain
 * 3. Set RESEND_FROM_EMAIL environment variable (e.g., "noreply@humanglue.ai")
 *
 * The default "onboarding@resend.dev" only sends to the Resend account owner.
 */

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// Lazy initialization to prevent build-time errors when env vars are not set
function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not configured')
  }
  return new Resend(apiKey)
}

// Use verified domain from env, or fallback to Resend test domain
function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL
    ? `HumanGlue <${process.env.RESEND_FROM_EMAIL}>`
    : 'HumanGlue <onboarding@resend.dev>'
}

export async function POST(request: NextRequest) {
  try {
    // Initialize client at runtime, not build time
    const resend = getResendClient()
    const FROM_EMAIL = getFromEmail()

    const body = await request.json()
    const { to, subject, html, content, replyTo } = body

    // Validate required fields
    if (!to || !subject || (!content && !html)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: to, subject, and either content or html',
        },
        { status: 400 }
      )
    }

    console.log('[Send Email API] Sending email to:', to)
    console.log('[Send Email API] Subject:', subject)
    console.log('[Send Email API] From:', FROM_EMAIL)
    console.log('[Send Email API] Resend API Key exists:', !!process.env.RESEND_API_KEY)

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html: html || `<pre>${content}</pre>`,
      replyTo,
    })

    if (error) {
      console.error('[Send Email API] Resend API error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send email via Resend',
          details: error.message,
        },
        { status: 500 }
      )
    }

    console.log('[Send Email API] Email sent successfully! ID:', data?.id)

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      messageId: data?.id,
    })
  } catch (error) {
    console.error('[Send Email API] Email sending error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
} 