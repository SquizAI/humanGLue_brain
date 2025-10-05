import type { Handler, HandlerEvent } from '@netlify/functions'

// Email service - using Resend for Netlify compatibility
const RESEND_API_KEY = process.env.RESEND_API_KEY

interface AssessmentEmailData {
  to: string
  name: string
  company: string
  assessmentId: string
  score: number
  resultsUrl: string
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
        body: JSON.stringify({ error: 'Missing required fields' })
      }
    }

    // Check if Resend API key is configured
    if (!RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email send')
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Email service not configured - results saved locally'
        })
      }
    }

    // Send email using Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'HumanGlue <onboarding@humanglue.ai>',
        to: [data.to],
        subject: `Your AI Transformation Assessment Results - ${data.company}`,
        html: generateEmailHTML(data)
      })
    })

    if (!emailResponse.ok) {
      const error = await emailResponse.text()
      console.error('Resend API error:', error)
      throw new Error('Failed to send email')
    }

    const result = await emailResponse.json()

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

function generateEmailHTML(data: AssessmentEmailData): string {
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
      font-size: 28px;
      font-weight: bold;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }
    .score-badge {
      display: inline-block;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      color: white;
      padding: 12px 24px;
      border-radius: 50px;
      font-size: 24px;
      font-weight: bold;
      margin: 20px 0;
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
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
      text-align: center;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">HumanGlue</div>
      <h1 style="color: #111827; margin: 0;">Your AI Transformation Assessment</h1>
    </div>

    <p>Hi ${data.name},</p>

    <p>Thank you for completing your AI transformation assessment with HumanGlue. We've analyzed ${data.company}'s readiness for AI adoption and created a personalized transformation roadmap.</p>

    <div style="text-align: center;">
      <div class="score-badge">
        Your Score: ${data.score}/100
      </div>
    </div>

    <div class="section">
      <div class="section-title">What's Inside Your Report</div>
      <ul style="line-height: 2;">
        <li>📊 Comprehensive AI readiness analysis</li>
        <li>💡 Key findings and opportunities</li>
        <li>🎯 Personalized recommendations</li>
        <li>💰 ROI projections and timeline estimates</li>
        <li>📈 Industry benchmarks and comparisons</li>
      </ul>
    </div>

    <div style="text-align: center;">
      <a href="${data.resultsUrl}" class="cta-button">
        View Your Full Assessment →
      </a>
    </div>

    <div class="section">
      <div class="section-title">Next Steps</div>
      <p>Our transformation specialists are ready to help you:</p>
      <ul>
        <li>Deep-dive into your assessment results</li>
        <li>Create a customized 90-day implementation roadmap</li>
        <li>Identify quick wins and long-term strategic initiatives</li>
        <li>Answer any questions about AI transformation</li>
      </ul>
      <p><strong>Schedule a complimentary 30-minute strategy session to get started.</strong></p>
    </div>

    <div class="footer">
      <p>
        <strong>HumanGlue</strong><br>
        Guiding Fortune 1000 companies of tomorrow, today
      </p>
      <p style="font-size: 12px; color: #9ca3af;">
        This email was sent to ${data.to} because you completed an assessment on HumanGlue.ai
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}
