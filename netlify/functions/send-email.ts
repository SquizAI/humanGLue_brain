import { Handler } from '@netlify/functions'
import * as nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'

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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface OrgBranding {
  company_name: string
  primary_color: string
  secondary_color: string
  logo_url: string
  sender_name: string
  sender_email: string
  footer_text: string
  website: string
}

/**
 * Fetch organization branding configuration
 * Falls back to HMN defaults if not configured
 */
async function getOrgBranding(orgId: string): Promise<OrgBranding> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const { data } = await supabase
    .from('organizations')
    .select('settings, logo_url')
    .eq('id', orgId)
    .single()

  const branding = data?.settings?.branding || {}

  return {
    company_name: branding.company_name || 'HMN',
    primary_color: branding.colors?.primary || '#3b82f6',
    secondary_color: branding.colors?.secondary || '#8b5cf6',
    logo_url: data?.logo_url || branding.logo?.url || '/HumnaGlue_logo_white_blue.png',
    sender_name: branding.email?.sender_name || 'HMN',
    sender_email: branding.email?.sender_email || 'hmnglue@prjctcode.ai',
    footer_text: branding.email?.footer_text || '© 2025 HMN. All rights reserved.',
    website: branding.social?.website || 'https://humanglue.ai'
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
    const { to, subject, content, html, replyTo, organizationId } = JSON.parse(event.body || '{}')

    // Validate required fields
    if (!to || !subject || (!content && !html)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing required fields: to, subject, and either content or html'
        })
      }
    }

    // Fetch organization branding (falls back to defaults if no organizationId)
    const branding = organizationId
      ? await getOrgBranding(organizationId)
      : {
          company_name: 'HMN',
          primary_color: '#3b82f6',
          secondary_color: '#8b5cf6',
          logo_url: '/HumnaGlue_logo_white_blue.png',
          sender_name: 'HMN',
          sender_email: 'hmnglue@prjctcode.ai',
          footer_text: '© 2025 HMN. All rights reserved.',
          website: 'https://humanglue.ai'
        }

    // Create transporter
    const transporter = nodemailer.createTransport(EMAIL_CONFIG)

    // Email options
    const mailOptions = {
      from: `"${branding.sender_name}" <${branding.sender_email}>`,
      to,
      subject,
      text: content,
      html: html || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, ${branding.primary_color} 0%, ${branding.secondary_color} 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">${branding.company_name}</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              ${content.split('\n').map((line: string) => `<p style="margin: 10px 0; color: #374151;">${line}</p>`).join('')}
            </div>
            <div style="margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
              <p>This email was sent by ${branding.company_name}</p>
              <p>${branding.footer_text}</p>
            </div>
          </div>
        </div>
      `,
      replyTo: replyTo || branding.sender_email
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