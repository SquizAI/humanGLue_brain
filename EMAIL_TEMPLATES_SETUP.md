# HumanGlue Email Templates for Supabase Auth

This guide shows you how to customize Supabase authentication emails with beautiful, branded templates.

## How to Apply These Templates

1. **Go to your Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
   - Go to **Authentication** → **Email Templates**

2. **For each template below:**
   - Click on the template type (Confirm Signup, Magic Link, etc.)
   - Replace the default HTML with the template provided below
   - Click **Save**

## Available Template Variables

Supabase provides these variables you can use in templates:
- `{{ .ConfirmationURL }}` - The confirmation/action link
- `{{ .Token }}` - The 6-digit OTP code
- `{{ .TokenHash }}` - The token hash
- `{{ .SiteURL }}` - Your site URL
- `{{ .Email }}` - User's email address

---

## 1. Confirm Signup Email

**When to use**: Sent when a new user signs up and needs to verify their email.

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to HumanGlue</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #0a0a0f;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-radius: 16px; border: 1px solid rgba(139, 92, 246, 0.2); overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);">
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); border-radius: 12px; display: flex; align-items: center; justify-center;">
                        <span style="font-size: 24px;">🧠</span>
                      </div>
                      <span style="font-size: 24px; font-weight: 700; color: #ffffff;">HumanGlue</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 16px; font-size: 28px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                Welcome to HumanGlue! 🎉
              </h1>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #9ca3af;">
                You're just one step away from starting your AI transformation journey. Confirm your email address to unlock your personalized dashboard and access exclusive features.
              </p>

              <!-- What's Waiting -->
              <div style="background: rgba(139, 92, 246, 0.05); border-left: 3px solid #8b5cf6; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #ffffff;">
                  What's waiting for you:
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #9ca3af; font-size: 14px; line-height: 1.8;">
                  <li>🎯 Personalized AI maturity assessment</li>
                  <li>⚡ 50+ ready-to-deploy automation workflows</li>
                  <li>👥 Access to expert AI transformation community</li>
                  <li>🎓 Live workshops with industry leaders</li>
                </ul>
              </div>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 32px 0;">
                <tr>
                  <td>
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);">
                      Confirm Email Address
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; font-size: 14px; color: #6b7280;">
                Or copy and paste this link into your browser:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #8b5cf6; text-decoration: none; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>

              <div style="margin: 32px 0 0; padding: 20px; background: rgba(239, 68, 68, 0.1); border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.2);">
                <p style="margin: 0; font-size: 13px; color: #9ca3af; line-height: 1.5;">
                  <strong style="color: #ef4444;">⚠️ Security Notice:</strong> This link expires in 24 hours. If you didn't create a HumanGlue account, you can safely ignore this email.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background: rgba(255, 255, 255, 0.02); border-top: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;">
                Need help? Visit our <a href="https://hmnglue.com/support" style="color: #8b5cf6; text-decoration: none;">support center</a> or reply to this email.
              </p>
              <p style="margin: 0; font-size: 12px; color: #4b5563;">
                &copy; 2025 HumanGlue. Building AI maturity, one organization at a time.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 2. Magic Link Email

**When to use**: Sent when users request to sign in via magic link (passwordless login).

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Magic Link</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #0a0a0f;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-radius: 16px; border: 1px solid rgba(139, 92, 246, 0.2); overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);">
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); border-radius: 12px; display: flex; align-items: center; justify-center;">
                        <span style="font-size: 24px;">✨</span>
                      </div>
                      <span style="font-size: 24px; font-weight: 700; color: #ffffff;">HumanGlue</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 16px; font-size: 28px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                Your Magic Sign-In Link ✨
              </h1>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #9ca3af;">
                Click the button below to securely sign in to your HumanGlue account. No password needed!
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 32px 0;">
                <tr>
                  <td>
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);">
                      Sign In to HumanGlue
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; font-size: 14px; color: #6b7280;">
                Or copy and paste this link into your browser:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #8b5cf6; text-decoration: none; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>

              <div style="margin: 32px 0 0; padding: 20px; background: rgba(239, 68, 68, 0.1); border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.2);">
                <p style="margin: 0; font-size: 13px; color: #9ca3af; line-height: 1.5;">
                  <strong style="color: #ef4444;">⚠️ Security Notice:</strong> This link expires in 1 hour and can only be used once. If you didn't request this sign-in link, someone may be trying to access your account.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background: rgba(255, 255, 255, 0.02); border-top: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;">
                Need help? Visit our <a href="https://hmnglue.com/support" style="color: #8b5cf6; text-decoration: none;">support center</a> or reply to this email.
              </p>
              <p style="margin: 0; font-size: 12px; color: #4b5563;">
                &copy; 2025 HumanGlue. Building AI maturity, one organization at a time.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 3. Password Reset Email

**When to use**: Sent when users request to reset their password.

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #0a0a0f;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-radius: 16px; border: 1px solid rgba(139, 92, 246, 0.2); overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);">
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); border-radius: 12px; display: flex; align-items: center; justify-center;">
                        <span style="font-size: 24px;">🔑</span>
                      </div>
                      <span style="font-size: 24px; font-weight: 700; color: #ffffff;">HumanGlue</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 16px; font-size: 28px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                Reset Your Password 🔑
              </h1>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #9ca3af;">
                We received a request to reset the password for your HumanGlue account (<strong style="color: #ffffff;">{{ .Email }}</strong>). Click the button below to create a new password.
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 32px 0;">
                <tr>
                  <td>
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; font-size: 14px; color: #6b7280;">
                Or copy and paste this link into your browser:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #8b5cf6; text-decoration: none; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>

              <div style="margin: 32px 0 0; padding: 20px; background: rgba(239, 68, 68, 0.1); border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.2);">
                <p style="margin: 0; font-size: 13px; color: #9ca3af; line-height: 1.5;">
                  <strong style="color: #ef4444;">⚠️ Security Notice:</strong> This link expires in 1 hour. If you didn't request a password reset, someone may be trying to access your account. Please secure your account immediately by changing your password.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background: rgba(255, 255, 255, 0.02); border-top: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;">
                Need help? Visit our <a href="https://hmnglue.com/support" style="color: #8b5cf6; text-decoration: none;">support center</a> or reply to this email.
              </p>
              <p style="margin: 0; font-size: 12px; color: #4b5563;">
                &copy; 2025 HumanGlue. Building AI maturity, one organization at a time.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 4. Email Change Confirmation

**When to use**: Sent when users change their email address.

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Email Change</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #0a0a0f;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); border-radius: 16px; border: 1px solid rgba(139, 92, 246, 0.2); overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);">
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); border-radius: 12px; display: flex; align-items: center; justify-center;">
                        <span style="font-size: 24px;">📧</span>
                      </div>
                      <span style="font-size: 24px; font-weight: 700; color: #ffffff;">HumanGlue</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 16px; font-size: 28px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                Confirm Your New Email 📧
              </h1>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #9ca3af;">
                You've requested to change the email address for your HumanGlue account. Please confirm this change by clicking the button below.
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 32px 0;">
                <tr>
                  <td>
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);">
                      Confirm Email Change
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; font-size: 14px; color: #6b7280;">
                Or copy and paste this link into your browser:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #8b5cf6; text-decoration: none; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>

              <div style="margin: 32px 0 0; padding: 20px; background: rgba(239, 68, 68, 0.1); border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.2);">
                <p style="margin: 0; font-size: 13px; color: #9ca3af; line-height: 1.5;">
                  <strong style="color: #ef4444;">⚠️ Security Notice:</strong> If you didn't request this email change, please contact our support team immediately to secure your account.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background: rgba(255, 255, 255, 0.02); border-top: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;">
                Need help? Visit our <a href="https://hmnglue.com/support" style="color: #8b5cf6; text-decoration: none;">support center</a> or reply to this email.
              </p>
              <p style="margin: 0; font-size: 12px; color: #4b5563;">
                &copy; 2025 HumanGlue. Building AI maturity, one organization at a time.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Testing Your Email Templates

1. **Test in Supabase**: After saving each template, use the "Send Test Email" button in the Supabase dashboard
2. **Check Multiple Clients**: Test in Gmail, Outlook, Apple Mail to ensure compatibility
3. **Mobile Testing**: View on mobile devices to ensure responsiveness
4. **Link Testing**: Verify all confirmation URLs work correctly

## Customization Tips

- Update `https://hmnglue.com` with your actual domain
- Replace emojis with your own icons or remove them
- Adjust colors by changing the gradient values
- Add your own footer links and social media

## Notes

- Email clients have varying HTML/CSS support
- Inline styles are used for maximum compatibility
- Tables are used for layout (best practice for emails)
- Gradients may not work in all email clients (fallback colors provided)
