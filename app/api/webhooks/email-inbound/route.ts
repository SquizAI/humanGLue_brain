/**
 * POST /api/webhooks/email-inbound
 * Webhook endpoint for receiving emails via Resend
 *
 * Configure this webhook URL in Resend:
 * https://hmnglue.com/api/webhooks/email-inbound
 *
 * This endpoint:
 * 1. Receives incoming emails from Resend
 * 2. Parses the email content
 * 3. Generates an AI response using OpenAI
 * 4. Sends the response back to the sender
 */

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Resend inbound email payload interface
interface ResendInboundEmail {
  from: string
  to: string
  subject: string
  text: string
  html: string
  headers: Record<string, string>
  attachments?: Array<{
    filename: string
    content: string
    content_type: string
  }>
}

// Extract email address from "Name <email@domain.com>" format
function extractEmail(emailString: string): string {
  const match = emailString.match(/<([^>]+)>/)
  return match ? match[1] : emailString
}

// Extract name from "Name <email@domain.com>" format
function extractName(emailString: string): string {
  const match = emailString.match(/^([^<]+)/)
  return match ? match[1].trim() : emailString
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ResendInboundEmail

    console.log('[Email Inbound Webhook] Received email:')
    console.log('  From:', body.from)
    console.log('  To:', body.to)
    console.log('  Subject:', body.subject)
    console.log('  Text length:', body.text?.length || 0)

    // Extract sender info
    const senderEmail = extractEmail(body.from)
    const senderName = extractName(body.from)

    // Don't respond to no-reply addresses or our own emails
    if (senderEmail.includes('noreply') ||
        senderEmail.includes('no-reply') ||
        senderEmail.endsWith('@hmnglue.com')) {
      console.log('[Email Inbound Webhook] Ignoring email from:', senderEmail)
      return NextResponse.json({
        success: true,
        message: 'Email ignored (no-reply or internal)'
      })
    }

    // Generate AI response
    const aiResponse = await generateAIResponse({
      senderName,
      senderEmail,
      subject: body.subject,
      content: body.text || body.html,
    })

    // Send the response email
    const sendResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://hmnglue.com'}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: senderEmail,
        subject: `Re: ${body.subject}`,
        html: aiResponse,
        replyTo: 'hello@hmnglue.com',
      }),
    })

    const sendResult = await sendResponse.json()

    if (!sendResult.success) {
      console.error('[Email Inbound Webhook] Failed to send response:', sendResult.error)
      return NextResponse.json({
        success: false,
        error: 'Failed to send response email',
        details: sendResult.error,
      }, { status: 500 })
    }

    console.log('[Email Inbound Webhook] Response sent successfully!')

    return NextResponse.json({
      success: true,
      message: 'Email received and response sent',
      responseMessageId: sendResult.messageId,
    })

  } catch (error) {
    console.error('[Email Inbound Webhook] Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process inbound email',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

interface EmailContext {
  senderName: string
  senderEmail: string
  subject: string
  content: string
}

async function generateAIResponse(context: EmailContext): Promise<string> {
  const systemPrompt = `You are the HMN AI Assistant, responding to emails on behalf of the HMN team.

About HMN:
- HMN is an AI transformation platform that helps organizations achieve AI maturity
- We measure AI readiness on a 0-10 scale across People, Process, Technology, and Strategy
- Our founders are Alex Schwartz and Matty Squarzoni
- We offer AI maturity assessments, transformation roadmaps, and implementation guidance

Your personality:
- Professional yet approachable
- Knowledgeable about AI transformation
- Helpful and solution-oriented
- Concise but thorough

Guidelines:
- Address the person by name if available
- Directly answer their question or address their topic
- If they're asking about services, explain HMN's offerings
- If they want to schedule a meeting, suggest they visit hmnglue.com/demo
- Sign off as "HMN AI Assistant"
- Keep responses professional and under 300 words unless more detail is needed

Format your response as clean HTML suitable for email (no <html> or <body> tags, just the content).
Use <p> tags for paragraphs and proper formatting.`

  const userPrompt = `Respond to this email:

From: ${context.senderName} <${context.senderEmail}>
Subject: ${context.subject}

${context.content}

Generate a helpful, personalized response.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  })

  const responseContent = completion.choices[0]?.message?.content ||
    '<p>Thank you for your email. We will get back to you shortly.</p>'

  // Wrap in email template
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      ${responseContent}

      <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;" />

      <p style="color: #666; font-size: 14px;">
        <em>This response was generated by HMN's AI Assistant.</em><br/>
        <a href="https://hmnglue.com" style="color: #3b82f6;">Visit HMN</a> |
        <a href="https://hmnglue.com/demo" style="color: #3b82f6;">Schedule a Demo</a>
      </p>
    </div>
  `
}

// Also handle GET for webhook verification
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'HMN Email Inbound Webhook is active',
    timestamp: new Date().toISOString(),
  })
}
