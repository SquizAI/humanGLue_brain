import type { Handler, HandlerEvent } from '@netlify/functions'

// Email service - using Resend
const RESEND_API_KEY = process.env.RESEND_API_KEY
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'hello@hmnglue.com'

interface AssessmentEmailData {
  to: string
  name: string
  company?: string
  assessmentId: string
  score: number
  resultsUrl: string
}

// Default HMN branding
const DEFAULT_BRANDING = {
  company_name: 'HMN',
  primary_color: '#3b82f6',
  secondary_color: '#8b5cf6',
  logo_url: 'https://hmnglue.com/HumnaGlue_logo_white_blue.png',
  sender_name: 'HMN',
  sender_email: RESEND_FROM_EMAIL,
  support_email: 'support@hmnglue.com',
  footer_text: '© 2025 HMN. All rights reserved.',
  website: 'https://hmnglue.com'
}

export const handler: Handler = async (event: HandlerEvent) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const data: AssessmentEmailData = JSON.parse(event.body || '{}')

    if (!data.to || !data.name || !data.assessmentId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields (to, name, assessmentId)' })
      }
    }

    // Check if Resend API key is configured
    if (!RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email send')
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: false,
          message: 'Email service not configured - RESEND_API_KEY missing'
        })
      }
    }

    // Use default HMN branding
    const branding = DEFAULT_BRANDING

    // Send email using Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `${branding.sender_name} <${branding.sender_email}>`,
        to: [data.to],
        subject: `Your AI Transformation Assessment Results${data.company ? ` - ${data.company}` : ''}`,
        html: generateEmailHTML(data, branding)
      })
    })

    if (!emailResponse.ok) {
      const error = await emailResponse.text()
      console.error('Resend API error:', error)
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: 'Failed to send email',
          details: error
        })
      }
    }

    const result = await emailResponse.json()

    console.log('Email sent successfully:', { to: data.to, emailId: result.id })

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        emailId: result.id,
        message: 'Assessment email sent successfully'
      })
    }

  } catch (error) {
    console.error('Email send error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to send assessment email',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}

function generateEmailHTML(data: AssessmentEmailData, branding: typeof DEFAULT_BRANDING): string {
  const scoreColor = data.score >= 70 ? '#22c55e' : data.score >= 50 ? '#eab308' : '#ef4444'
  const scoreLabel = data.score >= 70 ? 'High Readiness' : data.score >= 50 ? 'Moderate Readiness' : 'Early Stage'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your AI Transformation Assessment</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9fafb;
    }
    .container {
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      background: linear-gradient(135deg, ${branding.primary_color} 0%, ${branding.secondary_color} 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 10px;
    }
    .score-container {
      text-align: center;
      margin: 30px 0;
    }
    .score-badge {
      display: inline-block;
      background: linear-gradient(135deg, ${branding.primary_color} 0%, ${branding.secondary_color} 100%);
      color: white;
      padding: 16px 32px;
      border-radius: 50px;
      font-size: 28px;
      font-weight: bold;
      margin: 10px 0;
    }
    .score-label {
      display: block;
      font-size: 14px;
      color: ${scoreColor};
      font-weight: 600;
      margin-top: 8px;
    }
    .section {
      margin: 25px 0;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 12px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 8px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, ${branding.primary_color} 0%, ${branding.secondary_color} 100%);
      color: white;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      text-align: center;
    }
    .cta-button:hover {
      opacity: 0.9;
    }
    .checklist {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .checklist li {
      padding: 8px 0;
      padding-left: 28px;
      position: relative;
    }
    .checklist li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: ${branding.primary_color};
      font-weight: bold;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 14px;
    }
    .footer a {
      color: ${branding.primary_color};
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">${branding.company_name}</div>
      <h1 style="color: #111827; margin: 0; font-size: 24px;">Your AI Transformation Assessment</h1>
    </div>

    <p>Hi ${data.name},</p>

    <p>Thank you for completing your AI transformation assessment${data.company ? ` for <strong>${data.company}</strong>` : ''}. We've analyzed your organization's readiness for AI adoption and created a personalized transformation roadmap.</p>

    <div class="score-container">
      <div class="score-badge">
        ${data.score}/100
      </div>
      <span class="score-label">${scoreLabel}</span>
    </div>

    <div class="section">
      <div class="section-title">What's Inside Your Report</div>
      <ul class="checklist">
        <li>Comprehensive AI readiness analysis across 5 dimensions</li>
        <li>Key findings and transformation opportunities</li>
        <li>Personalized recommendations for your organization</li>
        <li>ROI projections and timeline estimates</li>
        <li>Industry benchmarks and comparisons</li>
      </ul>
    </div>

    <div style="text-align: center;">
      <a href="${data.resultsUrl}" class="cta-button">
        View Your Full Assessment →
      </a>
    </div>

    <div class="section">
      <div class="section-title">Ready to Transform?</div>
      <p>Our transformation specialists are ready to help you:</p>
      <ul class="checklist">
        <li>Deep-dive into your assessment results</li>
        <li>Create a customized 90-day implementation roadmap</li>
        <li>Identify quick wins and long-term strategic initiatives</li>
        <li>Calculate precise ROI for your AI investments</li>
      </ul>
      <p style="margin-top: 16px;"><strong>Schedule a complimentary 30-minute strategy session to accelerate your AI transformation.</strong></p>
    </div>

    <div class="footer">
      <p>
        <strong>${branding.company_name}</strong><br>
        The Human Element in AI Transformation
      </p>
      <p>${branding.footer_text}</p>
      <p style="font-size: 12px; color: #9ca3af;">
        This email was sent to ${data.to} because you completed an AI transformation assessment.<br>
        For support, contact <a href="mailto:${branding.support_email}">${branding.support_email}</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}
