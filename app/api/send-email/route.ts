/**
 * POST /api/send-email
 * Send emails using Resend API
 */

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
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
    console.log('[Send Email API] Resend API Key exists:', !!process.env.RESEND_API_KEY)

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'HumanGlue <onboarding@resend.dev>', // Resend's test domain
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