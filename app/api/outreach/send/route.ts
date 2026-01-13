/**
 * POST /api/outreach/send
 * Send a personalized recruitment email using the email template system
 */

import { NextRequest, NextResponse } from 'next/server'
import { emailTemplates } from '@/lib/email-templates'
import { Resend } from 'resend'

// Lazy initialization to prevent build-time errors when env vars are not set
function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not configured')
  }
  return new Resend(apiKey)
}

function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL
    ? `HMN <${process.env.RESEND_FROM_EMAIL}>`
    : 'HMN <onboarding@resend.dev>'
}

export async function POST(request: NextRequest) {
  try {
    // Initialize client at runtime, not build time
    const resend = getResendClient()
    const FROM_EMAIL = getFromEmail()

    const body = await request.json()
    const {
      recipientName,
      recipientEmail,
      subject,
      personalizedIntro,
      discoveredFacts,
      whyTheyFit,
      opportunity,
      senderName,
      senderTitle,
      senderEmail,
      ctaText = "Let's Connect",
      ctaUrl = 'https://hmnglue.com/demo',
    } = body

    // Validate required fields
    if (!recipientEmail || !recipientName || !subject) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: recipientEmail, recipientName, subject' },
        { status: 400 }
      )
    }

    console.log(`[Outreach Send] Sending to: ${recipientEmail}`)
    console.log(`[Outreach Send] Subject: ${subject}`)

    // Generate HTML using recruitment template
    const html = emailTemplates.recruitment({
      recipientName,
      personalizedIntro: personalizedIntro || `We've been following your work and are impressed by what you've accomplished.`,
      discoveredFacts: discoveredFacts || [],
      whyTheyFit: whyTheyFit || `Your background makes you an ideal fit for what we're building at HMN.`,
      opportunity: opportunity || [
        'Shape our AI maturity assessment methodology',
        'Strategic collaboration opportunities',
        'Equity participation as a founding advisor',
      ],
      senderName: senderName || 'Matty Squarzoni',
      senderTitle: senderTitle || 'Co-Founder & CTO, HMN',
      senderEmail: senderEmail || 'matty@humanglue.ai',
      ctaText,
      ctaUrl,
    })

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [recipientEmail],
      subject,
      html,
      replyTo: senderEmail || 'matty@humanglue.ai',
    })

    if (error) {
      console.error('[Outreach Send] Resend API error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to send email', details: error.message },
        { status: 500 }
      )
    }

    console.log(`[Outreach Send] Email sent successfully! ID: ${data?.id}`)

    return NextResponse.json({
      success: true,
      message: 'Recruitment email sent successfully',
      messageId: data?.id,
      recipient: recipientEmail,
    })

  } catch (error) {
    console.error('[Outreach Send] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send recruitment email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
