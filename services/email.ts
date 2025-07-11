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
  }
} 