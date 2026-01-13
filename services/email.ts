interface EmailData {
  to: string
  subject: string
  content?: string
  html?: string
  replyTo?: string
}

export const emailService = {
  async sendEmail(data: EmailData): Promise<{ success: boolean; message: string }> {
    try {
      // Use API route in development, Netlify function in production
      const endpoint = process.env.NODE_ENV === 'development' 
        ? '/api/send-email' 
        : '/.netlify/functions/send-email'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email')
      }

      return result
    } catch (error) {
      console.error('Email service error:', error)
      throw error
    }
  },

  async sendConversationSummary(
    to: string,
    conversationContent: string,
    userName?: string
  ): Promise<{ success: boolean; message: string }> {
    const subject = `Your Human Glue AI Conversation Summary`
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Human Glue AI</h1>
          <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">Conversation Summary</p>
        </div>
        
        <div style="padding: 40px; background: #f9fafb;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Hello${userName ? ` ${userName}` : ''}!</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              Here's a summary of your recent conversation with Human Glue AI:
            </p>
            
            <div style="border-left: 4px solid #3b82f6; padding-left: 20px; margin: 20px 0;">
              ${conversationContent.split('\n').map(line => {
                if (line.startsWith('You:')) {
                  return `<p style="margin: 15px 0; color: #1f2937;"><strong>${line}</strong></p>`
                } else if (line.startsWith('AI:')) {
                  return `<p style="margin: 15px 0; color: #4b5563; background: #f3f4f6; padding: 15px; border-radius: 8px;">${line}</p>`
                } else {
                  return `<p style="margin: 10px 0; color: #6b7280;">${line}</p>`
                }
              }).join('')}
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: #eff6ff; border-radius: 8px;">
              <h3 style="color: #1e40af; margin-bottom: 10px;">Next Steps</h3>
              <p style="color: #3730a3; line-height: 1.6;">
                Ready to transform your organization with AI? 
                <a href="https://humanglue.netlify.app" style="color: #2563eb; text-decoration: none; font-weight: bold;">
                  Continue the conversation →
                </a>
              </p>
            </div>
          </div>
          
          <div style="margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
            <p>This email was sent by Human Glue AI</p>
            <p>© 2024 Human Glue. All rights reserved.</p>
            <p style="margin-top: 20px;">
              <a href="https://humanglue.netlify.app" style="color: #3b82f6; text-decoration: none;">Visit our website</a>
            </p>
          </div>
        </div>
      </div>
    `

    return this.sendEmail({
      to,
      subject,
      content: conversationContent,
      html,
    })
  },

  async sendAIInsights(
    to: string,
    insights: {
      readinessScore?: number
      recommendations?: string[]
      roi?: string
      timeline?: string
    },
    userName?: string
  ): Promise<{ success: boolean; message: string }> {
    const subject = `Your Personalized AI Transformation Insights`
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Human Glue AI</h1>
          <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">AI Transformation Insights</p>
        </div>
        
        <div style="padding: 40px; background: #f9fafb;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Hello${userName ? ` ${userName}` : ''}!</h2>
            
            ${insights.readinessScore ? `
              <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #1e40af; margin-bottom: 10px;">AI Readiness Score</h3>
                <div style="display: flex; align-items: center;">
                  <div style="font-size: 48px; font-weight: bold; color: #3b82f6;">${insights.readinessScore}%</div>
                  <div style="margin-left: 20px; color: #3730a3;">
                    Your organization is ${insights.readinessScore >= 70 ? 'well-positioned' : insights.readinessScore >= 40 ? 'moderately prepared' : 'in early stages'} for AI transformation
                  </div>
                </div>
              </div>
            ` : ''}
            
            ${insights.recommendations && insights.recommendations.length > 0 ? `
              <div style="margin-bottom: 20px;">
                <h3 style="color: #1f2937; margin-bottom: 15px;">Key Recommendations</h3>
                <ul style="padding-left: 20px;">
                  ${insights.recommendations.map(rec => 
                    `<li style="color: #4b5563; margin-bottom: 10px; line-height: 1.6;">${rec}</li>`
                  ).join('')}
                </ul>
              </div>
            ` : ''}
            
            ${insights.roi ? `
              <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #166534; margin-bottom: 10px;">Projected ROI</h3>
                <p style="font-size: 24px; font-weight: bold; color: #16a34a; margin: 0;">${insights.roi}</p>
              </div>
            ` : ''}
            
            ${insights.timeline ? `
              <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #92400e; margin-bottom: 10px;">Implementation Timeline</h3>
                <p style="color: #b45309; margin: 0;">${insights.timeline}</p>
              </div>
            ` : ''}
            
            <div style="margin-top: 30px; padding: 20px; background: #eff6ff; border-radius: 8px;">
              <h3 style="color: #1e40af; margin-bottom: 10px;">Ready to Get Started?</h3>
              <p style="color: #3730a3; line-height: 1.6; margin-bottom: 15px;">
                Let's discuss how Human Glue can accelerate your AI transformation journey.
              </p>
              <a href="https://humanglue.netlify.app" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                Schedule a Consultation
              </a>
            </div>
          </div>
          
          <div style="margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
            <p>This email was sent by Human Glue AI</p>
            <p>© 2024 Human Glue. All rights reserved.</p>
          </div>
        </div>
      </div>
    `

    return this.sendEmail({
      to,
      subject,
      html,
    })
  },

  /**
   * Send user invitation email with login credentials
   */
  async sendUserInvitation(
    to: string,
    invitation: {
      inviterName: string
      role: 'admin' | 'instructor' | 'expert' | 'client'
      temporaryPassword: string
      loginUrl: string
      organizationName?: string
    }
  ): Promise<{ success: boolean; message: string }> {
    const roleDescriptions = {
      admin: 'Full platform administration access',
      instructor: 'Create and manage courses, track student progress',
      expert: 'Provide expert insights and consultations',
      client: 'Access courses and track your learning journey'
    }

    const roleNextSteps = {
      admin: `
        <li>Access the Admin Portal to manage users and courses</li>
        <li>Configure platform settings and permissions</li>
        <li>View analytics and reports</li>
      `,
      instructor: `
        <li>Access the Instructor Portal to create your first course</li>
        <li>Set up your instructor profile</li>
        <li>Explore the course creation tools</li>
      `,
      expert: `
        <li>Access the Expert Portal to set up your profile</li>
        <li>Define your areas of expertise</li>
        <li>Start receiving consultation requests</li>
      `,
      client: `
        <li>Browse available courses in your dashboard</li>
        <li>Complete your profile setup</li>
        <li>Start your first learning module</li>
      `
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ${invitation.organizationName || 'HumanGlue'}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Welcome to ${invitation.organizationName || 'HumanGlue'}!</h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                        ${invitation.inviterName} has invited you to join ${invitation.organizationName || 'HumanGlue'} as a <strong>${invitation.role}</strong>.
                      </p>

                      <p style="margin: 0 0 30px; font-size: 14px; line-height: 1.6; color: #666666;">
                        ${roleDescriptions[invitation.role]}
                      </p>

                      <!-- Credentials Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-left: 4px solid #667eea; border-radius: 4px; margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 20px;">
                            <p style="margin: 0 0 10px; font-size: 14px; font-weight: 600; color: #333333;">Your Login Credentials</p>
                            <p style="margin: 0 0 8px; font-size: 14px; color: #666666;">
                              <strong>Email:</strong> ${to}
                            </p>
                            <p style="margin: 0; font-size: 14px; color: #666666;">
                              <strong>Temporary Password:</strong> <code style="background-color: #ffffff; padding: 4px 8px; border-radius: 4px; font-family: 'Courier New', monospace; color: #667eea; font-weight: 600;">${invitation.temporaryPassword}</code>
                            </p>
                            <p style="margin: 15px 0 0; font-size: 12px; color: #999999; font-style: italic;">
                              ⚠️ Please change this password after your first login
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                        <tr>
                          <td align="center">
                            <a href="${invitation.loginUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                              Log In Now
                            </a>
                          </td>
                        </tr>
                      </table>

                      <!-- Next Steps -->
                      <div style="background-color: #f8f9fa; border-radius: 4px; padding: 20px; margin-bottom: 20px;">
                        <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #333333;">Next Steps:</p>
                        <ol style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #666666;">
                          ${roleNextSteps[invitation.role]}
                        </ol>
                      </div>

                      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666;">
                        If you have any questions, feel free to reach out to ${invitation.inviterName} or our support team.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; text-align: center; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                      <p style="margin: 0; font-size: 12px; color: #999999;">
                        This invitation was sent by ${invitation.organizationName || 'HumanGlue'}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `

    return this.sendEmail({
      to,
      subject: `Welcome to ${invitation.organizationName || 'HumanGlue'} - Your ${invitation.role} account is ready`,
      html,
    })
  },

  /**
   * Send password reset email with new temporary password
   */
  async sendPasswordReset(
    to: string,
    options: {
      userName: string
      temporaryPassword: string
      loginUrl: string
      adminName: string
    }
  ): Promise<{ success: boolean; message: string }> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - HumanGlue</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 8px 8px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Password Reset</h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                        Hello ${options.userName},
                      </p>

                      <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #333333;">
                        Your password has been reset by ${options.adminName}. Please use the temporary password below to log in and then change it to something secure.
                      </p>

                      <!-- Credentials Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 20px;">
                            <p style="margin: 0 0 10px; font-size: 14px; font-weight: 600; color: #92400e;">Your New Temporary Password</p>
                            <p style="margin: 0; font-size: 18px; color: #78350f;">
                              <code style="background-color: #ffffff; padding: 8px 16px; border-radius: 4px; font-family: 'Courier New', monospace; color: #d97706; font-weight: 600; display: inline-block;">${options.temporaryPassword}</code>
                            </p>
                            <p style="margin: 15px 0 0; font-size: 12px; color: #92400e; font-style: italic;">
                              ⚠️ Please change this password immediately after logging in
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                        <tr>
                          <td align="center">
                            <a href="${options.loginUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                              Log In Now
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666;">
                        If you did not request this password reset, please contact your administrator immediately.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; text-align: center; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                      <p style="margin: 0; font-size: 12px; color: #999999;">
                        This password reset was initiated by HumanGlue
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `

    return this.sendEmail({
      to,
      subject: `Password Reset - HumanGlue`,
      html,
    })
  }
} 