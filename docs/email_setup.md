# Email Configuration Guide

## Overview

HumanGlue automatically sends assessment emails when users complete their profile through the chat interface. This guide explains how to configure and test the email functionality.

## Email Credentials

The application is configured to use the following email server:

```
Username: hmnglue@prjctcode.ai
Password: @6^62zb21&1b
Incoming Server: mail.prjctcode.ai
IMAP Port: 993
Outgoing Server: mail.prjctcode.ai
SMTP Port: 465
```

## Environment Variables

Add these variables to your `.env.local` file:

```bash
# Email Configuration
EMAIL_HOST=mail.prjctcode.ai
EMAIL_PORT=465
EMAIL_USER=hmnglue@prjctcode.ai
EMAIL_PASS=@6^62zb21&1b
```

## How It Works

1. **User Profile Collection**: When a user completes the chat flow and provides their information (name, email, company, role, challenge), a profile is created.

2. **Automatic Email Trigger**: Upon profile creation, the system automatically:
   - Generates a personalized AI transformation assessment
   - Calculates scores and recommendations
   - Sends a beautifully formatted HTML email to the user

3. **Email Content**: The assessment email includes:
   - Personalized greeting with the user's name and company
   - AI Transformation Score (visual display)
   - Key findings based on their responses
   - Recommended next steps
   - Projected outcomes (time to value, ROI, success rate)
   - Call-to-action to schedule a strategy session

## Email Types

The system supports three types of emails:

1. **Assessment Email** (`type: 'assessment'`)
   - Sent automatically when a profile is created
   - Contains full assessment results and recommendations

2. **Follow-up Email** (`type: 'follow-up'`)
   - Can be triggered manually for nurturing leads
   - Contains additional resources and case studies

3. **Demo Confirmation** (`type: 'demo-confirmation'`)
   - Sent when a demo is scheduled
   - Contains meeting details and preparation materials

## Testing Email Functionality

### Local Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Complete the chat flow on the homepage:
   - Click "Start Your AI Journey"
   - Answer all questions
   - Provide your email address when prompted

3. Check the console logs for email status:
   ```
   Assessment email sent successfully to: user@example.com
   ```

### Production Testing

1. Visit https://humanglue.netlify.app
2. Complete the chat flow
3. Check your email inbox for the assessment

## Troubleshooting

### Email Not Sending

1. **Check Environment Variables**: Ensure all email variables are set correctly
2. **Check Console Logs**: Look for error messages in the browser console or server logs
3. **Verify SMTP Settings**: Ensure port 465 with SSL/TLS is enabled
4. **Test Credentials**: Try logging into webmail with the provided credentials

### Common Issues

- **Authentication Failed**: Double-check the password, ensure special characters are properly escaped
- **Connection Timeout**: Verify the mail server hostname and port
- **Email in Spam**: Add SPF/DKIM records for the domain

## Email Templates

Email templates are located in:
- `netlify/functions/send-profile-email.ts`

To customize the email design, modify the HTML in the `generateAssessmentEmail` function.

## Monitoring

In production, email sending is logged with:
- Profile ID
- Email address
- Company name
- Lead score
- Message ID (for tracking)

These logs can be viewed in the Netlify Functions logs.

## Security Notes

- Email credentials are stored in environment variables, never in code
- The email function validates all required fields before sending
- Rate limiting should be implemented for production use
- Consider using a dedicated transactional email service (SendGrid, Postmark) for scale 