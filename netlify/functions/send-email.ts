import { Handler } from '@netlify/functions'
import * as nodemailer from 'nodemailer'

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST || 'mail.prjctcode.ai',
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'hmnglue@prjctcode.ai',
    pass: process.env.EMAIL_PASS || '@6^62zb21&1b'
  }
}

export const handler: Handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { to, subject, content, html, replyTo } = JSON.parse(event.body || '{}')

    // Validate required fields
    if (!to || !subject || (!content && !html)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Missing required fields: to, subject, and either content or html' 
        })
      }
    }

    // Create transporter
    const transporter = nodemailer.createTransport(EMAIL_CONFIG)

    // Email options
    const mailOptions = {
      from: '"Human Glue AI" <hmnglue@prjctcode.ai>',
      to,
      subject,
      text: content,
      html: html || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Human Glue AI</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              ${content.split('\n').map((line: string) => `<p style="margin: 10px 0; color: #374151;">${line}</p>`).join('')}
            </div>
            <div style="margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
              <p>This email was sent by Human Glue AI</p>
              <p>© 2024 Human Glue. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
      replyTo: replyTo || 'hmnglue@prjctcode.ai'
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)

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