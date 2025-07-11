import { Handler } from '@netlify/functions'
import * as nodemailer from 'nodemailer'
import { UserProfile, ProfileAnalysis } from '../../lib/userProfile'

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST || 'mail.prjctcode.ai',
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || 'hmnglue@prjctcode.ai',
    pass: process.env.EMAIL_PASS || 'H)1552@@2;[D'
  }
}

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { profile, analysis, type = 'assessment' } = JSON.parse(event.body || '{}') as {
      profile: UserProfile
      analysis: ProfileAnalysis
      type?: 'assessment' | 'follow-up' | 'demo-confirmation'
    }
    
    if (!profile || !profile.email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Profile with email is required' })
      }
    }

    // Create transporter
    const transporter = nodemailer.createTransport(EMAIL_CONFIG)

    // Generate email content based on type
    let subject = ''
    let html = ''
    
    switch (type) {
      case 'assessment':
        subject = `${profile.name}, Your AI Transformation Assessment for ${profile.company}`
        html = generateAssessmentEmail(profile, analysis)
        break
      
      case 'follow-up':
        subject = `Next Steps for ${profile.company}'s AI Transformation`
        html = generateFollowUpEmail(profile, analysis)
        break
      
      case 'demo-confirmation':
        subject = `Demo Confirmed: ${profile.company} AI Strategy Session`
        html = generateDemoConfirmationEmail(profile)
        break
      
      default:
        subject = `Human Glue AI - Information for ${profile.name}`
        html = generateGenericEmail(profile)
    }

    // Email options
    const mailOptions = {
      from: '"Human Glue AI" <hmnglue@prjctcode.ai>',
      to: profile.email,
      subject,
      html,
      replyTo: 'team@humanglue.ai',
      headers: {
        'X-Profile-ID': profile.id || 'unknown',
        'X-Lead-Score': String(profile.leadScore || 0),
        'X-Company': profile.company
      }
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)

    // Log for analytics
    console.log('Profile email sent:', {
      type,
      profileId: profile.id,
      email: profile.email,
      company: profile.company,
      leadScore: profile.leadScore,
      messageId: info.messageId
    })

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        messageId: info.messageId,
        message: 'Email sent successfully' 
      })
    }
  } catch (error) {
    console.error('Email error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}

function generateAssessmentEmail(profile: UserProfile, analysis: ProfileAnalysis): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your AI Transformation Assessment</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Human Glue AI</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Organizational Transformation Assessment</p>
    </div>
    
    <!-- Personal Greeting -->
    <div style="padding: 40px 30px 20px;">
      <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px;">Hello ${profile.name},</h2>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
        Thank you for completing the AI transformation assessment for <strong>${profile.company}</strong>. 
        Based on your responses, I've prepared a personalized analysis and roadmap for your organization.
      </p>
    </div>
    
    <!-- Score Section -->
    <div style="background: #f9fafb; padding: 30px; margin: 0 30px; border-radius: 10px;">
      <h3 style="color: #1f2937; font-size: 20px; margin: 0 0 20px; text-align: center;">Your AI Transformation Score</h3>
      <div style="text-align: center;">
        <div style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; font-size: 48px; font-weight: bold; width: 120px; height: 120px; line-height: 120px; border-radius: 50%;">
          ${analysis.scoring.fitScore}
        </div>
        <p style="color: #6b7280; margin: 15px 0 0; font-size: 14px;">out of 100</p>
      </div>
    </div>
    
    <!-- Key Findings -->
    <div style="padding: 30px;">
      <h3 style="color: #1f2937; font-size: 20px; margin: 0 0 20px;">Key Findings</h3>
      <ul style="color: #4b5563; font-size: 16px; line-height: 1.8; margin: 0; padding-left: 20px;">
        ${analysis.insights.keyFindings.map(finding => `<li style="margin-bottom: 10px;">${finding}</li>`).join('')}
      </ul>
    </div>
    
    <!-- Recommendations -->
    <div style="background: #f0f9ff; padding: 30px; margin: 0 30px; border-radius: 10px;">
      <h3 style="color: #1f2937; font-size: 20px; margin: 0 0 20px;">Recommended Next Steps</h3>
      <ol style="color: #4b5563; font-size: 16px; line-height: 1.8; margin: 0; padding-left: 20px;">
        ${analysis.insights.nextBestActions.map(action => `<li style="margin-bottom: 10px;">${action}</li>`).join('')}
      </ol>
    </div>
    
    <!-- ROI Projection -->
    <div style="padding: 30px;">
      <h3 style="color: #1f2937; font-size: 20px; margin: 0 0 20px;">Projected Outcomes</h3>
      <div style="display: flex; justify-content: space-around; text-align: center;">
        <div>
          <p style="color: #8b5cf6; font-size: 28px; font-weight: bold; margin: 0;">
            ${analysis.predictions.timeToClose} days
          </p>
          <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0;">Time to Value</p>
        </div>
        <div>
          <p style="color: #3b82f6; font-size: 28px; font-weight: bold; margin: 0;">
            $${(analysis.predictions.dealSize / 1000).toFixed(0)}K
          </p>
          <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0;">Estimated ROI</p>
        </div>
        <div>
          <p style="color: #10b981; font-size: 28px; font-weight: bold; margin: 0;">
            ${(analysis.predictions.successProbability * 100).toFixed(0)}%
          </p>
          <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0;">Success Rate</p>
        </div>
      </div>
    </div>
    
    <!-- CTA Section -->
    <div style="background: #1f2937; padding: 40px 30px; text-align: center;">
      <h3 style="color: white; font-size: 24px; margin: 0 0 20px;">Ready to Transform ${profile.company}?</h3>
      <p style="color: rgba(255,255,255,0.8); font-size: 16px; margin: 0 0 30px;">
        Schedule a personalized strategy session to discuss your assessment results and implementation roadmap.
      </p>
      <a href="https://humanglue.ai/schedule?email=${encodeURIComponent(profile.email)}&company=${encodeURIComponent(profile.company)}" 
         style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px;">
        Schedule Strategy Session
      </a>
    </div>
    
    <!-- Footer -->
    <div style="padding: 30px; text-align: center; color: #6b7280; font-size: 14px;">
      <p style="margin: 0 0 10px;">
        This assessment is based on ${profile.company}'s profile and industry benchmarks.
      </p>
      <p style="margin: 0 0 10px;">
        Questions? Reply to this email or call us at 1-800-HUMANGLUE
      </p>
      <p style="margin: 20px 0 0;">
        © 2024 Human Glue AI. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `
}

function generateFollowUpEmail(profile: UserProfile, analysis: ProfileAnalysis): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Follow Up - ${profile.company}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <h2>Hi ${profile.name},</h2>
    <p>I wanted to follow up on your AI transformation assessment for ${profile.company}.</p>
    <p>Based on your interest in ${profile.challenge}, I've prepared some additional resources that might be helpful:</p>
    <ul>
      ${analysis.insights.personalizedContent.map(content => `<li>${content}</li>`).join('')}
    </ul>
    <p>Would you like to schedule a brief call to discuss how we can help ${profile.company} achieve its transformation goals?</p>
    <p>Best regards,<br>The Human Glue Team</p>
  </div>
</body>
</html>
  `
}

function generateDemoConfirmationEmail(profile: UserProfile): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Demo Confirmed</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <h2>Demo Confirmed for ${profile.company}</h2>
    <p>Hi ${profile.name},</p>
    <p>Your AI strategy session has been confirmed. Here are the details:</p>
    <ul>
      <li><strong>Date:</strong> Tuesday, January 14th, 2024</li>
      <li><strong>Time:</strong> 2:00 PM EST</li>
      <li><strong>Duration:</strong> 30 minutes</li>
      <li><strong>Format:</strong> Video Call (link will be sent separately)</li>
    </ul>
    <p>We'll be discussing:</p>
    <ul>
      <li>Your assessment results</li>
      <li>Custom implementation roadmap for ${profile.company}</li>
      <li>ROI projections specific to ${profile.challenge}</li>
      <li>Next steps and timeline</li>
    </ul>
    <p>Looking forward to speaking with you!</p>
    <p>Best regards,<br>The Human Glue Team</p>
  </div>
</body>
</html>
  `
}

function generateGenericEmail(profile: UserProfile): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Human Glue AI</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <h2>Hello ${profile.name},</h2>
    <p>Thank you for your interest in Human Glue AI.</p>
    <p>We're excited to help ${profile.company} with its transformation journey.</p>
    <p>Our team will be in touch shortly to discuss your needs.</p>
    <p>Best regards,<br>The Human Glue Team</p>
  </div>
</body>
</html>
  `
} 