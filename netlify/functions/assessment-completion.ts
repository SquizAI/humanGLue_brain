import { Handler } from '@netlify/functions'
import nodemailer from 'nodemailer'

interface ContactInfo {
  name: string
  email: string
  phone?: string
  company: string
  role?: string
}

interface CompletionRequest {
  organizationId: string
  contactInfo: ContactInfo
  deliveryMethod: 'email' | 'call' | 'meeting'
  priority: 'urgent' | 'high' | 'normal' | 'low'
}

// Mock data access (replace with actual database)
const assessmentData = new Map<string, any[]>()
const completedAssessments = new Map<string, any>()

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const request: CompletionRequest = JSON.parse(event.body || '{}')

    // Validate required fields
    if (!request.organizationId || !request.contactInfo || !request.deliveryMethod) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields: organizationId, contactInfo, deliveryMethod' 
        })
      }
    }

    if (!request.contactInfo.name || !request.contactInfo.email || !request.contactInfo.company) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required contact info: name, email, company' 
        })
      }
    }

    // Store completion data
    const completionData = {
      ...request,
      completedAt: new Date().toISOString(),
      status: 'completed',
      reportGenerated: false
    }

    completedAssessments.set(request.organizationId, completionData)

    // Generate assessment summary for email
    const orgData = assessmentData.get(request.organizationId) || []
    const assessmentSummary = generateAssessmentSummary(orgData)

    // Send email based on delivery method
    if (request.deliveryMethod === 'email') {
      try {
        await sendAssessmentReport(request.contactInfo, assessmentSummary)
        completionData.reportGenerated = true
      } catch (emailError) {
        console.error('Email sending failed:', emailError)
        // Continue with success response but note email failure
      }
    }

    // Log completion for follow-up processing
    console.log(`Assessment completed for ${request.organizationId}:`, {
      contact: request.contactInfo.name,
      company: request.contactInfo.company,
      deliveryMethod: request.deliveryMethod,
      priority: request.priority,
      dataPoints: orgData.length
    })

    // Schedule follow-up based on priority
    const followUpSchedule = scheduleFollowUp(request.priority, request.deliveryMethod)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Assessment completed successfully',
        organizationId: request.organizationId,
        deliveryMethod: request.deliveryMethod,
        reportGenerated: completionData.reportGenerated,
        followUpScheduled: followUpSchedule,
        nextSteps: getNextSteps(request.deliveryMethod, request.priority)
      })
    }

  } catch (error) {
    console.error('Error completing assessment:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to complete assessment',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}

function generateAssessmentSummary(orgData: any[]) {
  if (orgData.length === 0) {
    return {
      dataPointsCollected: 0,
      dimensionsAssessed: 0,
      preliminaryFindings: 'Insufficient data for analysis'
    }
  }

  const dimensionsAssessed = new Set(orgData.map(d => d.dimensionId)).size
  const avgScore = orgData.reduce((sum, d) => sum + d.scoreValue, 0) / orgData.length

  return {
    dataPointsCollected: orgData.length,
    dimensionsAssessed,
    preliminaryMaturityLevel: Math.round(avgScore),
    assessmentDate: new Date().toISOString().split('T')[0]
  }
}

async function sendAssessmentReport(contactInfo: ContactInfo, summary: any) {
  // Configure email transporter (use environment variables for production)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })

  const emailContent = `
Dear ${contactInfo.name},

Thank you for completing the HumanGlue AI Maturity Assessment for ${contactInfo.company}.

ASSESSMENT SUMMARY:
- Dimensions Assessed: ${summary.dimensionsAssessed}/23
- Data Points Collected: ${summary.dataPointsCollected}
- Preliminary Maturity Level: ${summary.preliminaryMaturityLevel}/10
- Assessment Date: ${summary.assessmentDate}

NEXT STEPS:
1. Our AI transformation specialists will analyze your detailed responses
2. You'll receive a comprehensive report within 24 hours
3. A follow-up consultation will be scheduled to discuss recommendations

WHAT'S INCLUDED IN YOUR FULL REPORT:
✓ Detailed maturity scores across all 23 dimensions
✓ Category analysis (Technical, Human, Business, AI Adoption)
✓ Personalized transformation roadmap
✓ ROI projections and investment recommendations
✓ Implementation timeline and milestones

Questions? Reply to this email or call us at +1 (817) 761-5671.

Best regards,
The HumanGlue AI Transformation Team

---
This assessment was conducted using our proprietary 23-dimension AI maturity framework.
Visit https://hmnglue.com to learn more about our AI transformation solutions.
`

  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@hmnglue.com',
    to: contactInfo.email,
    subject: `${contactInfo.company} - AI Maturity Assessment Results`,
    text: emailContent,
    html: emailContent.replace(/\n/g, '<br>')
  }

  await transporter.sendMail(mailOptions)
}

function scheduleFollowUp(priority: string, deliveryMethod: string) {
  const schedule = {
    urgent: '4 hours',
    high: '24 hours',
    normal: '48 hours',
    low: '1 week'
  }

  return {
    timeframe: schedule[priority as keyof typeof schedule] || '48 hours',
    method: deliveryMethod,
    scheduled: true
  }
}

function getNextSteps(deliveryMethod: string, priority: string) {
  const baseSteps = [
    'Detailed analysis of your responses is being conducted',
    'Comprehensive report generation in progress',
    'AI transformation roadmap being customized for your organization'
  ]

  if (deliveryMethod === 'email') {
    baseSteps.push('Report will be delivered via email within 24 hours')
    baseSteps.push('Follow-up consultation call will be scheduled')
  } else if (deliveryMethod === 'call') {
    baseSteps.push('Follow-up consultation call will be scheduled within ' + (priority === 'urgent' ? '4 hours' : '24 hours'))
  } else if (deliveryMethod === 'meeting') {
    baseSteps.push('In-person or virtual meeting will be arranged to review results')
  }

  return baseSteps
}