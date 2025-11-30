/**
 * Newsletter Service
 *
 * White-label newsletter service supporting multiple email providers
 * - Resend
 * - SendGrid
 * - Mailchimp
 * - Custom SMTP
 */

import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export type NewsletterProvider = 'resend' | 'sendgrid' | 'mailchimp' | 'custom_smtp'

export interface EmailConfig {
  provider: NewsletterProvider
  apiKey?: string
  fromName: string
  fromEmail: string
  replyToEmail?: string
  // SMTP settings
  smtpHost?: string
  smtpPort?: number
  smtpUsername?: string
  smtpPassword?: string
  smtpUseTls?: boolean
}

export interface NewsletterConfig {
  name: string
  description?: string
  logoUrl?: string
  primaryColor: string
  secondaryColor: string
  requireDoubleOptin: boolean
  trackOpens: boolean
  trackClicks: boolean
}

export interface Subscriber {
  id: string
  email: string
  firstName?: string
  lastName?: string
  isSubscribed: boolean
  confirmedAt?: Date
  source?: string
  customFields?: Record<string, any>
  tags?: string[]
}

export interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
  text?: string
  tags?: string[]
  metadata?: Record<string, any>
}

export interface SendResult {
  success: boolean
  messageId?: string
  error?: string
}

// Encryption helper
const ENCRYPTION_KEY = process.env.EMAIL_ENCRYPTION_KEY || process.env.OAUTH_ENCRYPTION_KEY || 'default-dev-key'

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
    iv
  )
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

function decrypt(text: string): string {
  const parts = text.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const encrypted = parts[1]
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
    iv
  )
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

class NewsletterService {
  /**
   * Send email via configured provider
   */
  async sendEmail(
    organizationId: string,
    params: SendEmailParams
  ): Promise<SendResult> {
    const config = await this.getEmailConfig(organizationId)

    if (!config) {
      return { success: false, error: 'Email not configured' }
    }

    switch (config.provider) {
      case 'resend':
        return this.sendViaResend(config, params)
      case 'sendgrid':
        return this.sendViaSendGrid(config, params)
      case 'mailchimp':
        return this.sendViaMailchimp(config, params)
      case 'custom_smtp':
        return this.sendViaSmtp(config, params)
      default:
        return { success: false, error: `Unknown provider: ${config.provider}` }
    }
  }

  /**
   * Send via Resend
   */
  private async sendViaResend(
    config: EmailConfig,
    params: SendEmailParams
  ): Promise<SendResult> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${config.fromName} <${config.fromEmail}>`,
        to: Array.isArray(params.to) ? params.to : [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
        reply_to: config.replyToEmail,
        tags: params.tags?.map((t) => ({ name: t, value: 'true' })),
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return { success: false, error: `Resend error: ${error}` }
    }

    const result = await response.json()
    return { success: true, messageId: result.id }
  }

  /**
   * Send via SendGrid
   */
  private async sendViaSendGrid(
    config: EmailConfig,
    params: SendEmailParams
  ): Promise<SendResult> {
    const recipients = Array.isArray(params.to) ? params.to : [params.to]

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: recipients.map((email) => ({ email })),
        }],
        from: { email: config.fromEmail, name: config.fromName },
        reply_to: config.replyToEmail ? { email: config.replyToEmail } : undefined,
        subject: params.subject,
        content: [
          { type: 'text/html', value: params.html },
          ...(params.text ? [{ type: 'text/plain', value: params.text }] : []),
        ],
        categories: params.tags,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return { success: false, error: `SendGrid error: ${error}` }
    }

    const messageId = response.headers.get('x-message-id')
    return { success: true, messageId: messageId || undefined }
  }

  /**
   * Send via Mailchimp Transactional (Mandrill)
   */
  private async sendViaMailchimp(
    config: EmailConfig,
    params: SendEmailParams
  ): Promise<SendResult> {
    const recipients = Array.isArray(params.to) ? params.to : [params.to]

    const response = await fetch('https://mandrillapp.com/api/1.0/messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: config.apiKey,
        message: {
          from_email: config.fromEmail,
          from_name: config.fromName,
          to: recipients.map((email) => ({ email, type: 'to' })),
          subject: params.subject,
          html: params.html,
          text: params.text,
          headers: config.replyToEmail
            ? { 'Reply-To': config.replyToEmail }
            : undefined,
          tags: params.tags,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return { success: false, error: `Mailchimp error: ${error}` }
    }

    const result = await response.json()
    return {
      success: result[0]?.status === 'sent',
      messageId: result[0]?._id,
      error: result[0]?.reject_reason,
    }
  }

  /**
   * Send via Custom SMTP (using Nodemailer on server side)
   */
  private async sendViaSmtp(
    config: EmailConfig,
    params: SendEmailParams
  ): Promise<SendResult> {
    // SMTP requires server-side Node.js with Nodemailer
    // This would be implemented as a serverless function
    // For now, we'll return an error suggesting to use a supported provider
    return {
      success: false,
      error: 'Custom SMTP is not yet supported. Please use Resend, SendGrid, or Mailchimp.',
    }
  }

  /**
   * Get email configuration for organization
   */
  async getEmailConfig(organizationId: string): Promise<EmailConfig | null> {
    const supabase = await createClient()

    const { data } = await supabase
      .from('email_configurations')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .single()

    if (!data) return null

    return {
      provider: data.provider,
      apiKey: data.api_key_encrypted ? decrypt(data.api_key_encrypted) : undefined,
      fromName: data.from_name,
      fromEmail: data.from_email,
      replyToEmail: data.reply_to_email,
      smtpHost: data.smtp_host,
      smtpPort: data.smtp_port,
      smtpUsername: data.smtp_username,
      smtpPassword: data.smtp_password_encrypted
        ? decrypt(data.smtp_password_encrypted)
        : undefined,
      smtpUseTls: data.smtp_use_tls,
    }
  }

  /**
   * Get newsletter configuration for organization
   */
  async getNewsletterConfig(organizationId: string): Promise<NewsletterConfig | null> {
    const supabase = await createClient()

    const { data } = await supabase
      .from('newsletter_configurations')
      .select('*')
      .eq('organization_id', organizationId)
      .single()

    if (!data) return null

    return {
      name: data.newsletter_name,
      description: data.newsletter_description,
      logoUrl: data.newsletter_logo_url,
      primaryColor: data.newsletter_color_primary,
      secondaryColor: data.newsletter_color_secondary,
      requireDoubleOptin: data.require_double_optin,
      trackOpens: data.track_opens,
      trackClicks: data.track_clicks,
    }
  }

  /**
   * Add subscriber to list
   */
  async addSubscriber(
    organizationId: string,
    listId: string,
    subscriber: Omit<Subscriber, 'id' | 'isSubscribed'>
  ): Promise<Subscriber> {
    const supabase = await createClient()
    const config = await this.getNewsletterConfig(organizationId)

    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .upsert({
        organization_id: organizationId,
        list_id: listId,
        email: subscriber.email.toLowerCase(),
        first_name: subscriber.firstName,
        last_name: subscriber.lastName,
        source: subscriber.source || 'api',
        custom_fields: subscriber.customFields || {},
        tags: subscriber.tags || [],
        is_subscribed: true,
        confirmed_at: config?.requireDoubleOptin ? null : new Date().toISOString(),
      }, {
        onConflict: 'list_id,email',
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to add subscriber: ${error.message}`)
    }

    // Send confirmation email if double opt-in required
    if (config?.requireDoubleOptin && !data.confirmed_at) {
      await this.sendConfirmationEmail(organizationId, data.id, subscriber.email)
    }

    return this.mapSubscriberFromDb(data)
  }

  /**
   * Send confirmation email
   */
  async sendConfirmationEmail(
    organizationId: string,
    subscriberId: string,
    email: string
  ): Promise<void> {
    const config = await this.getNewsletterConfig(organizationId)
    if (!config) return

    // Generate confirmation token
    const token = crypto.randomBytes(32).toString('hex')
    const supabase = await createClient()

    // Store token (you'd add a column for this)
    // For now we'll use the custom_fields
    await supabase
      .from('newsletter_subscribers')
      .update({
        custom_fields: { confirmation_token: token, token_expires: Date.now() + 24 * 60 * 60 * 1000 },
      })
      .eq('id', subscriberId)

    const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL}/newsletter/confirm?token=${token}&id=${subscriberId}`

    await this.sendEmail(organizationId, {
      to: email,
      subject: `Confirm your subscription to ${config.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button {
              display: inline-block;
              background: ${config.primaryColor};
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 4px;
              margin: 20px 0;
            }
            .footer { color: #666; font-size: 12px; margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="container">
            ${config.logoUrl ? `<img src="${config.logoUrl}" alt="${config.name}" style="max-height: 60px; margin-bottom: 20px;">` : ''}
            <h2>Confirm your subscription</h2>
            <p>Thanks for subscribing to <strong>${config.name}</strong>!</p>
            <p>Please click the button below to confirm your email address:</p>
            <a href="${confirmUrl}" class="button">Confirm Subscription</a>
            <p>If you didn't subscribe, you can safely ignore this email.</p>
            <div class="footer">
              <p>This link will expire in 24 hours.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })
  }

  /**
   * Confirm subscriber
   */
  async confirmSubscriber(subscriberId: string): Promise<boolean> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({
        confirmed_at: new Date().toISOString(),
        custom_fields: {},
      })
      .eq('id', subscriberId)

    return !error
  }

  /**
   * Unsubscribe
   */
  async unsubscribe(
    subscriberId: string,
    reason?: string
  ): Promise<void> {
    const supabase = await createClient()

    await supabase
      .from('newsletter_subscribers')
      .update({
        is_subscribed: false,
        unsubscribed_at: new Date().toISOString(),
        unsubscribe_reason: reason,
      })
      .eq('id', subscriberId)
  }

  /**
   * Get subscriber lists for organization
   */
  async getLists(organizationId: string): Promise<Array<{
    id: string
    name: string
    description?: string
    listType: string
    subscriberCount: number
    isDefault: boolean
  }>> {
    const supabase = await createClient()

    const { data } = await supabase
      .from('subscriber_lists')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .order('name')

    return (data || []).map((list: any) => ({
      id: list.id,
      name: list.name,
      description: list.description,
      listType: list.list_type,
      subscriberCount: list.subscriber_count,
      isDefault: list.is_default,
    }))
  }

  /**
   * Create subscriber list
   */
  async createList(
    organizationId: string,
    name: string,
    options?: {
      description?: string
      listType?: string
      isDefault?: boolean
    }
  ): Promise<string> {
    const supabase = await createClient()

    // If setting as default, unset other defaults
    if (options?.isDefault) {
      await supabase
        .from('subscriber_lists')
        .update({ is_default: false })
        .eq('organization_id', organizationId)
    }

    const { data, error } = await supabase
      .from('subscriber_lists')
      .insert({
        organization_id: organizationId,
        name,
        description: options?.description,
        list_type: options?.listType || 'general',
        is_default: options?.isDefault || false,
      })
      .select('id')
      .single()

    if (error) {
      throw new Error(`Failed to create list: ${error.message}`)
    }

    return data.id
  }

  /**
   * Get subscribers for a list
   */
  async getSubscribers(
    listId: string,
    options?: {
      limit?: number
      offset?: number
      subscribedOnly?: boolean
      tags?: string[]
    }
  ): Promise<{ subscribers: Subscriber[]; total: number }> {
    const supabase = await createClient()

    let query = supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact' })
      .eq('list_id', listId)

    if (options?.subscribedOnly !== false) {
      query = query.eq('is_subscribed', true)
    }

    if (options?.tags?.length) {
      query = query.overlaps('tags', options.tags)
    }

    if (options?.limit) {
      query = query.range(
        options.offset || 0,
        (options.offset || 0) + options.limit - 1
      )
    }

    const { data, count, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get subscribers: ${error.message}`)
    }

    return {
      subscribers: (data || []).map(this.mapSubscriberFromDb),
      total: count || 0,
    }
  }

  /**
   * Send newsletter to list
   */
  async sendNewsletter(
    organizationId: string,
    listId: string,
    options: {
      subject: string
      html: string
      text?: string
      createdBy: string
    }
  ): Promise<{ sentCount: number; failedCount: number; contentId: string }> {
    const supabase = await createClient()

    // Get subscribers
    const { subscribers } = await this.getSubscribers(listId, {
      subscribedOnly: true,
    })

    if (subscribers.length === 0) {
      throw new Error('No subscribers in list')
    }

    // Save content
    const { data: content } = await supabase
      .from('channel_content')
      .insert({
        organization_id: organizationId,
        channel_type: 'newsletter',
        title: options.subject,
        body: options.text || '',
        body_html: options.html,
        target_list_ids: [listId],
        status: 'publishing',
        created_by: options.createdBy,
      })
      .select('id')
      .single()

    let sentCount = 0
    let failedCount = 0

    // Send to each subscriber in batches
    const batchSize = 50
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize)
      const emails = batch.map((s) => s.email)

      const result = await this.sendEmail(organizationId, {
        to: emails,
        subject: options.subject,
        html: options.html,
        text: options.text,
        tags: ['newsletter'],
      })

      if (result.success) {
        sentCount += batch.length
      } else {
        failedCount += batch.length
      }
    }

    // Update content status and record results
    await supabase
      .from('channel_content')
      .update({
        status: sentCount > 0 ? 'published' : 'failed',
        published_at: new Date().toISOString(),
      })
      .eq('id', content!.id)

    await supabase.from('publication_results').insert({
      content_id: content!.id,
      organization_id: organizationId,
      channel_type: 'newsletter',
      list_id: listId,
      status: sentCount > 0 ? 'published' : 'failed',
      emails_sent: sentCount,
      published_at: new Date().toISOString(),
    })

    // Update subscriber email counts
    await supabase.rpc('increment_subscriber_email_count', {
      p_list_id: listId,
    }).catch(() => {
      // Function may not exist yet
    })

    return {
      sentCount,
      failedCount,
      contentId: content!.id,
    }
  }

  // Helper to map DB row to Subscriber
  private mapSubscriberFromDb(row: any): Subscriber {
    return {
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      isSubscribed: row.is_subscribed,
      confirmedAt: row.confirmed_at ? new Date(row.confirmed_at) : undefined,
      source: row.source,
      customFields: row.custom_fields,
      tags: row.tags,
    }
  }
}

// Export singleton
export const newsletterService = new NewsletterService()

// Export class for testing
export { NewsletterService }
