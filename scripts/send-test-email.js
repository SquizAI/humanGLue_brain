require('dotenv').config({ path: '.env.local' })
const { Resend } = require('resend')

const apiKey = process.env.RESEND_API_KEY
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

if (!apiKey) {
  console.error('RESEND_API_KEY not configured')
  process.exit(1)
}

const resend = new Resend(apiKey)

async function sendTestEmail() {
  const to = 'matty@lvng.ai'
  const now = new Date().toLocaleString()
  const year = new Date().getFullYear()

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HumanGlue Test Email</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); padding: 30px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Test Email Successful!</h1>
  </div>

  <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
    <p>This is a test email from HumanGlue to verify the expert application email notification system is working correctly.</p>

    <div style="background: #ecfdf5; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
      <p style="margin: 0; font-size: 18px; color: #059669; font-weight: 600;">Email System Status: Operational</p>
      <p style="margin: 10px 0 0 0; color: #64748b;">Sent at: ${now}</p>
    </div>

    <h3 style="color: #0891b2;">Email notifications that are now active:</h3>
    <ul style="padding-left: 20px;">
      <li style="margin-bottom: 8px;">Application submission confirmation to applicants</li>
      <li style="margin-bottom: 8px;">Admin notification of new applications</li>
      <li style="margin-bottom: 8px;">Approval emails to applicants</li>
      <li style="margin-bottom: 8px;">Rejection emails to applicants</li>
      <li style="margin-bottom: 8px;">Request for additional information emails</li>
    </ul>

    <p style="color: #64748b; font-size: 14px;">
      This email confirms that the HumanGlue expert application notification system is fully functional.
    </p>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

    <p style="color: #94a3b8; font-size: 12px; text-align: center;">
      Copyright ${year} HumanGlue. All rights reserved.<br>
      <a href="https://hmnglue.com" style="color: #0891b2;">hmnglue.com</a>
    </p>
  </div>
</body>
</html>
`

  console.log('Sending test email to:', to)
  console.log('From:', fromEmail)
  console.log('API Key exists:', !!apiKey)

  try {
    const result = await resend.emails.send({
      from: `HumanGlue <${fromEmail}>`,
      to: [to],
      subject: 'HumanGlue Expert Application Email System Test',
      html,
    })

    console.log('Email sent successfully!')
    console.log('Result:', JSON.stringify(result, null, 2))
    process.exit(0)
  } catch (error) {
    console.error('Error sending email:', error)
    process.exit(1)
  }
}

sendTestEmail()
