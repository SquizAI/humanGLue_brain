/**
 * Expert Application Email Service
 * Handles all email notifications for the expert/instructor application workflow
 *
 * WHITE-LABEL READY: Uses centralized BRAND colors for consistent theming.
 */

import { Resend } from 'resend'
import { BRAND } from '@/lib/email-templates'

interface ApplicationData {
  id: string
  full_name: string
  email: string
  professional_title: string
  headline?: string
  expertise_areas?: string[]
}

interface ReviewData {
  reviewer_name: string
  review_notes?: string
  rejection_reason?: string
}

// Admin emails that receive new application notifications
const ADMIN_EMAILS = ['matty@lvng.ai']

// Initialize Resend client
function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured')
  }
  return new Resend(apiKey)
}

function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL
    ? `HumanGlue <${process.env.RESEND_FROM_EMAIL}>`
    : 'HumanGlue <onboarding@resend.dev>'
}

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://hmnglue.com'
}

/**
 * Send confirmation email to applicant after submission
 */
export async function sendApplicationConfirmation(application: ApplicationData): Promise<void> {
  const resend = getResendClient()
  const siteUrl = getSiteUrl()

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Received</title>
</head>
<body style="font-family: ${BRAND.fonts.primary}; line-height: 1.6; color: ${BRAND.colors.gray}; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, ${BRAND.colors.primary} 0%, ${BRAND.colors.secondary} 100%); padding: 30px; border-radius: 12px 12px 0 0;">
    <h1 style="color: ${BRAND.colors.white}; margin: 0; font-size: 24px;">Application Received!</h1>
  </div>

  <div style="background: ${BRAND.colors.light}; padding: 30px; border: 1px solid ${BRAND.colors.border}; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 16px;">Hi ${application.full_name},</p>

    <p>Thank you for applying to become an expert instructor on ${BRAND.company.name}! We've received your application and our team will review it shortly.</p>

    <div style="background: ${BRAND.colors.white}; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid ${BRAND.colors.border};">
      <h3 style="margin-top: 0; color: ${BRAND.colors.primary};">Application Summary</h3>
      <p><strong>Name:</strong> ${application.full_name}</p>
      <p><strong>Title:</strong> ${application.professional_title}</p>
      ${application.headline ? `<p><strong>Headline:</strong> ${application.headline}</p>` : ''}
      ${application.expertise_areas?.length ? `<p><strong>Expertise:</strong> ${application.expertise_areas.join(', ')}</p>` : ''}
    </div>

    <h3 style="color: ${BRAND.colors.primary};">What's Next?</h3>
    <ol style="padding-left: 20px;">
      <li style="margin-bottom: 10px;">Our team will review your application within 2-3 business days</li>
      <li style="margin-bottom: 10px;">You'll receive an email notification with our decision</li>
      <li style="margin-bottom: 10px;">If approved, we'll guide you through the onboarding process</li>
    </ol>

    <p style="color: ${BRAND.colors.lightGray}; font-size: 14px;">
      If you have any questions, please reply to this email or contact us at ${BRAND.company.supportEmail}
    </p>

    <hr style="border: none; border-top: 1px solid ${BRAND.colors.border}; margin: 30px 0;">

    <p style="color: ${BRAND.colors.lightGray}; font-size: 12px; text-align: center;">
      &copy; ${new Date().getFullYear()} ${BRAND.company.name}. All rights reserved.<br>
      <a href="${siteUrl}" style="color: ${BRAND.colors.primary};">${BRAND.urls.website.replace('https://', '')}</a>
    </p>
  </div>
</body>
</html>
`

  try {
    await resend.emails.send({
      from: getFromEmail(),
      to: [application.email],
      subject: 'Your Expert Application Has Been Received - HumanGlue',
      html,
    })
    console.log(`[Expert Emails] Confirmation sent to ${application.email}`)
  } catch (error) {
    console.error('[Expert Emails] Failed to send confirmation:', error)
    throw error
  }
}

/**
 * Notify admins of new application submission
 */
export async function notifyAdminsOfNewApplication(application: ApplicationData): Promise<void> {
  const resend = getResendClient()
  const siteUrl = getSiteUrl()

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Expert Application</title>
</head>
<body style="font-family: ${BRAND.fonts.primary}; line-height: 1.6; color: ${BRAND.colors.gray}; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, ${BRAND.colors.info} 0%, ${BRAND.colors.primary} 100%); padding: 30px; border-radius: 12px 12px 0 0;">
    <h1 style="color: ${BRAND.colors.white}; margin: 0; font-size: 24px;">🎯 New Expert Application</h1>
  </div>

  <div style="background: ${BRAND.colors.light}; padding: 30px; border: 1px solid ${BRAND.colors.border}; border-top: none; border-radius: 0 0 12px 12px;">
    <p>A new expert application has been submitted and is waiting for review.</p>

    <div style="background: ${BRAND.colors.white}; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid ${BRAND.colors.border};">
      <h3 style="margin-top: 0; color: ${BRAND.colors.info};">Applicant Details</h3>
      <p><strong>Name:</strong> ${application.full_name}</p>
      <p><strong>Email:</strong> <a href="mailto:${application.email}">${application.email}</a></p>
      <p><strong>Title:</strong> ${application.professional_title}</p>
      ${application.headline ? `<p><strong>Headline:</strong> ${application.headline}</p>` : ''}
      ${application.expertise_areas?.length ? `<p><strong>Expertise:</strong> ${application.expertise_areas.join(', ')}</p>` : ''}
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${siteUrl}/admin/applications/${application.id}" style="display: inline-block; background: ${BRAND.colors.info}; color: ${BRAND.colors.white}; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        Review Application
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid ${BRAND.colors.border}; margin: 30px 0;">

    <p style="color: ${BRAND.colors.lightGray}; font-size: 12px; text-align: center;">
      ${BRAND.company.name} Admin Notification<br>
      <a href="${siteUrl}/admin/applications" style="color: ${BRAND.colors.info};">View All Applications</a>
    </p>
  </div>
</body>
</html>
`

  try {
    for (const adminEmail of ADMIN_EMAILS) {
      await resend.emails.send({
        from: getFromEmail(),
        to: [adminEmail],
        subject: `New Expert Application: ${application.full_name}`,
        html,
        replyTo: application.email,
      })
    }
    console.log(`[Expert Emails] Admin notification sent for application ${application.id}`)
  } catch (error) {
    console.error('[Expert Emails] Failed to notify admins:', error)
    throw error
  }
}

/**
 * Send approval email to applicant
 */
export async function sendApprovalEmail(
  application: ApplicationData,
  review?: ReviewData
): Promise<void> {
  const resend = getResendClient()
  const siteUrl = getSiteUrl()

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Approved!</title>
</head>
<body style="font-family: ${BRAND.fonts.primary}; line-height: 1.6; color: ${BRAND.colors.gray}; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, ${BRAND.colors.success} 0%, #34d399 100%); padding: 30px; border-radius: 12px 12px 0 0;">
    <h1 style="color: ${BRAND.colors.white}; margin: 0; font-size: 24px;">🎉 Congratulations!</h1>
  </div>

  <div style="background: ${BRAND.colors.light}; padding: 30px; border: 1px solid ${BRAND.colors.border}; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 18px; color: ${BRAND.colors.success}; font-weight: 600;">Your Expert Application Has Been Approved!</p>

    <p>Hi ${application.full_name},</p>

    <p>Great news! We've reviewed your application to become an expert instructor on ${BRAND.company.name}, and we're excited to welcome you to our platform.</p>

    ${review?.review_notes ? `
    <div style="background: #ecfdf5; border-left: 4px solid ${BRAND.colors.success}; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-style: italic;">"${review.review_notes}"</p>
      ${review.reviewer_name ? `<p style="margin: 10px 0 0 0; font-size: 14px; color: ${BRAND.colors.success};">— ${review.reviewer_name}</p>` : ''}
    </div>
    ` : ''}

    <h3 style="color: ${BRAND.colors.success};">Next Steps</h3>
    <ol style="padding-left: 20px;">
      <li style="margin-bottom: 10px;"><strong>Complete Your Profile:</strong> Log in to finish setting up your instructor profile</li>
      <li style="margin-bottom: 10px;"><strong>Create Your First Course:</strong> Start building your first course or workshop</li>
      <li style="margin-bottom: 10px;"><strong>Go Live:</strong> Publish and start teaching!</li>
    </ol>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${siteUrl}/login" style="display: inline-block; background: ${BRAND.colors.success}; color: ${BRAND.colors.white}; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
        Get Started
      </a>
    </div>

    <p>If you have any questions or need assistance, our team is here to help. Just reply to this email!</p>

    <p style="font-weight: 600;">Welcome to the ${BRAND.company.name} community!</p>

    <hr style="border: none; border-top: 1px solid ${BRAND.colors.border}; margin: 30px 0;">

    <p style="color: ${BRAND.colors.lightGray}; font-size: 12px; text-align: center;">
      &copy; ${new Date().getFullYear()} ${BRAND.company.name}. All rights reserved.<br>
      <a href="${siteUrl}" style="color: ${BRAND.colors.success};">${BRAND.urls.website.replace('https://', '')}</a>
    </p>
  </div>
</body>
</html>
`

  try {
    await resend.emails.send({
      from: getFromEmail(),
      to: [application.email],
      subject: '🎉 Your HumanGlue Expert Application Has Been Approved!',
      html,
    })
    console.log(`[Expert Emails] Approval email sent to ${application.email}`)
  } catch (error) {
    console.error('[Expert Emails] Failed to send approval email:', error)
    throw error
  }
}

/**
 * Send rejection email to applicant
 */
export async function sendRejectionEmail(
  application: ApplicationData,
  review: ReviewData
): Promise<void> {
  const resend = getResendClient()
  const siteUrl = getSiteUrl()

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Update</title>
</head>
<body style="font-family: ${BRAND.fonts.primary}; line-height: 1.6; color: ${BRAND.colors.gray}; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, ${BRAND.colors.lightGray} 0%, #94a3b8 100%); padding: 30px; border-radius: 12px 12px 0 0;">
    <h1 style="color: ${BRAND.colors.white}; margin: 0; font-size: 24px;">Application Update</h1>
  </div>

  <div style="background: ${BRAND.colors.light}; padding: 30px; border: 1px solid ${BRAND.colors.border}; border-top: none; border-radius: 0 0 12px 12px;">
    <p>Hi ${application.full_name},</p>

    <p>Thank you for your interest in becoming an expert instructor on ${BRAND.company.name}. After careful review, we've decided not to move forward with your application at this time.</p>

    ${review.rejection_reason ? `
    <div style="background: #fef2f2; border-left: 4px solid ${BRAND.colors.error}; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-weight: 600; color: ${BRAND.colors.error};">Reason:</p>
      <p style="margin: 10px 0 0 0;">${review.rejection_reason}</p>
    </div>
    ` : ''}

    <p>This decision was based on our current needs and the fit with our platform's focus areas. We encourage you to:</p>

    <ul style="padding-left: 20px;">
      <li style="margin-bottom: 10px;">Continue building your expertise in your field</li>
      <li style="margin-bottom: 10px;">Consider reapplying in the future as our needs evolve</li>
      <li style="margin-bottom: 10px;">Explore other ways to share your knowledge with the community</li>
    </ul>

    <p>We appreciate the time you took to apply and wish you the best in your endeavors.</p>

    <p>Best regards,<br>The ${BRAND.company.name} Team</p>

    <hr style="border: none; border-top: 1px solid ${BRAND.colors.border}; margin: 30px 0;">

    <p style="color: ${BRAND.colors.lightGray}; font-size: 12px; text-align: center;">
      &copy; ${new Date().getFullYear()} ${BRAND.company.name}. All rights reserved.<br>
      <a href="${siteUrl}" style="color: ${BRAND.colors.lightGray};">${BRAND.urls.website.replace('https://', '')}</a>
    </p>
  </div>
</body>
</html>
`

  try {
    await resend.emails.send({
      from: getFromEmail(),
      to: [application.email],
      subject: 'Update on Your HumanGlue Expert Application',
      html,
    })
    console.log(`[Expert Emails] Rejection email sent to ${application.email}`)
  } catch (error) {
    console.error('[Expert Emails] Failed to send rejection email:', error)
    throw error
  }
}

/**
 * Send request for more information email
 */
export async function sendRequestInfoEmail(
  application: ApplicationData,
  requestedChanges: string
): Promise<void> {
  const resend = getResendClient()
  const siteUrl = getSiteUrl()

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Additional Information Requested</title>
</head>
<body style="font-family: ${BRAND.fonts.primary}; line-height: 1.6; color: ${BRAND.colors.gray}; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, ${BRAND.colors.warning} 0%, #fbbf24 100%); padding: 30px; border-radius: 12px 12px 0 0;">
    <h1 style="color: ${BRAND.colors.white}; margin: 0; font-size: 24px;">📝 Additional Information Requested</h1>
  </div>

  <div style="background: ${BRAND.colors.light}; padding: 30px; border: 1px solid ${BRAND.colors.border}; border-top: none; border-radius: 0 0 12px 12px;">
    <p>Hi ${application.full_name},</p>

    <p>Thank you for your application to become an expert instructor on ${BRAND.company.name}. We're interested in learning more about you!</p>

    <div style="background: #fffbeb; border-left: 4px solid ${BRAND.colors.warning}; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-weight: 600; color: ${BRAND.colors.warning};">We need the following information:</p>
      <p style="margin: 10px 0 0 0; white-space: pre-line;">${requestedChanges}</p>
    </div>

    <p>Please reply to this email with the requested information, or update your application directly:</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${siteUrl}/apply/expert?edit=${application.id}" style="display: inline-block; background: ${BRAND.colors.warning}; color: ${BRAND.colors.white}; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        Update Application
      </a>
    </div>

    <p style="color: ${BRAND.colors.lightGray}; font-size: 14px;">
      Once we receive this information, we'll continue reviewing your application.
    </p>

    <hr style="border: none; border-top: 1px solid ${BRAND.colors.border}; margin: 30px 0;">

    <p style="color: ${BRAND.colors.lightGray}; font-size: 12px; text-align: center;">
      &copy; ${new Date().getFullYear()} ${BRAND.company.name}. All rights reserved.<br>
      <a href="${siteUrl}" style="color: ${BRAND.colors.warning};">${BRAND.urls.website.replace('https://', '')}</a>
    </p>
  </div>
</body>
</html>
`

  try {
    await resend.emails.send({
      from: getFromEmail(),
      to: [application.email],
      subject: 'Additional Information Needed - HumanGlue Expert Application',
      html,
    })
    console.log(`[Expert Emails] Request info email sent to ${application.email}`)
  } catch (error) {
    console.error('[Expert Emails] Failed to send request info email:', error)
    throw error
  }
}

/**
 * Send a test email (for verification purposes)
 */
export async function sendTestEmail(to: string, customMessage?: string): Promise<void> {
  const resend = getResendClient()
  const siteUrl = getSiteUrl()

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${BRAND.company.name} Test Email</title>
</head>
<body style="font-family: ${BRAND.fonts.primary}; line-height: 1.6; color: ${BRAND.colors.gray}; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, ${BRAND.colors.primary} 0%, ${BRAND.colors.secondary} 100%); padding: 30px; border-radius: 12px 12px 0 0;">
    <h1 style="color: ${BRAND.colors.white}; margin: 0; font-size: 24px;">✅ Test Email Successful!</h1>
  </div>

  <div style="background: ${BRAND.colors.light}; padding: 30px; border: 1px solid ${BRAND.colors.border}; border-top: none; border-radius: 0 0 12px 12px;">
    <p>This is a test email from ${BRAND.company.name} to verify the email notification system is working correctly.</p>

    <div style="background: #ecfdf5; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
      <p style="margin: 0; font-size: 18px; color: ${BRAND.colors.success}; font-weight: 600;">Email System Status: Operational ✓</p>
      <p style="margin: 10px 0 0 0; color: ${BRAND.colors.lightGray};">Sent at: ${new Date().toLocaleString()}</p>
    </div>

    ${customMessage ? `
    <div style="background: ${BRAND.colors.white}; border-radius: 8px; padding: 15px; margin: 20px 0; border: 1px solid ${BRAND.colors.border};">
      <p style="margin: 0; font-weight: 600;">Custom Message:</p>
      <p style="margin: 10px 0 0 0;">${customMessage}</p>
    </div>
    ` : ''}

    <p style="color: ${BRAND.colors.lightGray}; font-size: 14px;">
      This email confirms that the ${BRAND.company.name} expert application notification system is fully functional.
    </p>

    <hr style="border: none; border-top: 1px solid ${BRAND.colors.border}; margin: 30px 0;">

    <p style="color: ${BRAND.colors.lightGray}; font-size: 12px; text-align: center;">
      &copy; ${new Date().getFullYear()} ${BRAND.company.name}. All rights reserved.<br>
      <a href="${siteUrl}" style="color: ${BRAND.colors.primary};">${BRAND.urls.website.replace('https://', '')}</a>
    </p>
  </div>
</body>
</html>
`

  try {
    const result = await resend.emails.send({
      from: getFromEmail(),
      to: [to],
      subject: '✅ HumanGlue Email System Test',
      html,
    })
    console.log(`[Expert Emails] Test email sent to ${to}`, result)
  } catch (error) {
    console.error('[Expert Emails] Failed to send test email:', error)
    throw error
  }
}
