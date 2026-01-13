/**
 * Unified Communications Service
 * Supports Slack, Discord, WhatsApp, SMS (Bird), and Email
 */

export type CommunicationChannel = 'slack' | 'discord' | 'whatsapp' | 'sms' | 'email'

export interface MessagePayload {
  channel: CommunicationChannel
  recipient: string // channel ID, phone number, or email
  content: string
  attachments?: MessageAttachment[]
  metadata?: Record<string, unknown>
}

export interface MessageAttachment {
  type: 'image' | 'file' | 'video' | 'audio'
  url: string
  name?: string
  mimeType?: string
}

export interface SendResult {
  success: boolean
  messageId?: string
  channel: CommunicationChannel
  timestamp: Date
  error?: string
}

export interface ChannelConfig {
  slack?: {
    botToken: string
    appToken?: string
    signingSecret?: string
  }
  discord?: {
    botToken: string
    applicationId?: string
  }
  whatsapp?: {
    phoneNumberId: string
    accessToken: string
    businessAccountId?: string
  }
  bird?: {
    apiKey: string
    workspaceId: string
    channelId: string
  }
  email?: {
    provider: 'resend' | 'sendgrid'
    apiKey: string
    fromEmail: string
    fromName?: string
  }
}

/**
 * Slack Integration Service
 * Uses the Slack Web API for messaging
 */
class SlackService {
  private baseUrl = 'https://slack.com/api'

  constructor(
    private botToken: string,
    private signingSecret?: string
  ) {}

  async sendMessage(
    channel: string,
    text: string,
    attachments?: MessageAttachment[]
  ): Promise<SendResult> {
    try {
      const blocks = attachments?.map(att => {
        if (att.type === 'image') {
          return {
            type: 'image',
            image_url: att.url,
            alt_text: att.name || 'Image',
          }
        }
        return {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `<${att.url}|${att.name || 'Attachment'}>`,
          },
        }
      })

      const response = await fetch(`${this.baseUrl}/chat.postMessage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel,
          text,
          blocks: blocks?.length ? blocks : undefined,
        }),
      })

      const data = await response.json()

      if (!data.ok) {
        return {
          success: false,
          channel: 'slack',
          timestamp: new Date(),
          error: data.error || 'Failed to send Slack message',
        }
      }

      return {
        success: true,
        messageId: data.ts,
        channel: 'slack',
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        success: false,
        channel: 'slack',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async sendDirectMessage(
    userId: string,
    text: string,
    attachments?: MessageAttachment[]
  ): Promise<SendResult> {
    try {
      // First, open a DM channel with the user
      const dmResponse = await fetch(`${this.baseUrl}/conversations.open`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ users: userId }),
      })

      const dmData = await dmResponse.json()

      if (!dmData.ok) {
        return {
          success: false,
          channel: 'slack',
          timestamp: new Date(),
          error: dmData.error || 'Failed to open DM channel',
        }
      }

      // Send message to the DM channel
      return this.sendMessage(dmData.channel.id, text, attachments)
    } catch (error) {
      return {
        success: false,
        channel: 'slack',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async getChannels(): Promise<{ id: string; name: string }[]> {
    const response = await fetch(`${this.baseUrl}/conversations.list`, {
      headers: {
        'Authorization': `Bearer ${this.botToken}`,
      },
    })

    const data = await response.json()

    if (!data.ok) {
      throw new Error(data.error || 'Failed to get Slack channels')
    }

    return data.channels.map((ch: any) => ({
      id: ch.id,
      name: ch.name,
    }))
  }

  async getUserByEmail(email: string): Promise<{ id: string; name: string } | null> {
    const response = await fetch(`${this.baseUrl}/users.lookupByEmail?email=${encodeURIComponent(email)}`, {
      headers: {
        'Authorization': `Bearer ${this.botToken}`,
      },
    })

    const data = await response.json()

    if (!data.ok) {
      return null
    }

    return {
      id: data.user.id,
      name: data.user.real_name || data.user.name,
    }
  }
}

/**
 * Discord Integration Service
 * Uses Discord's REST API for messaging
 */
class DiscordService {
  private baseUrl = 'https://discord.com/api/v10'

  constructor(private botToken: string) {}

  async sendMessage(
    channelId: string,
    content: string,
    attachments?: MessageAttachment[]
  ): Promise<SendResult> {
    try {
      const embeds = attachments?.map(att => {
        if (att.type === 'image') {
          return {
            image: { url: att.url },
            title: att.name,
          }
        }
        return {
          title: att.name || 'Attachment',
          url: att.url,
        }
      })

      const response = await fetch(`${this.baseUrl}/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${this.botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          embeds: embeds?.length ? embeds : undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        return {
          success: false,
          channel: 'discord',
          timestamp: new Date(),
          error: `Discord API error: ${error}`,
        }
      }

      const data = await response.json()

      return {
        success: true,
        messageId: data.id,
        channel: 'discord',
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        success: false,
        channel: 'discord',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async sendDirectMessage(
    userId: string,
    content: string,
    attachments?: MessageAttachment[]
  ): Promise<SendResult> {
    try {
      // Create DM channel
      const dmResponse = await fetch(`${this.baseUrl}/users/@me/channels`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${this.botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipient_id: userId }),
      })

      if (!dmResponse.ok) {
        const error = await dmResponse.text()
        return {
          success: false,
          channel: 'discord',
          timestamp: new Date(),
          error: `Failed to create DM: ${error}`,
        }
      }

      const dmData = await dmResponse.json()
      return this.sendMessage(dmData.id, content, attachments)
    } catch (error) {
      return {
        success: false,
        channel: 'discord',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async getGuilds(): Promise<{ id: string; name: string }[]> {
    const response = await fetch(`${this.baseUrl}/users/@me/guilds`, {
      headers: {
        'Authorization': `Bot ${this.botToken}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get Discord guilds')
    }

    const data = await response.json()
    return data.map((guild: any) => ({
      id: guild.id,
      name: guild.name,
    }))
  }

  async getGuildChannels(guildId: string): Promise<{ id: string; name: string; type: number }[]> {
    const response = await fetch(`${this.baseUrl}/guilds/${guildId}/channels`, {
      headers: {
        'Authorization': `Bot ${this.botToken}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get Discord channels')
    }

    const data = await response.json()
    return data.map((ch: any) => ({
      id: ch.id,
      name: ch.name,
      type: ch.type,
    }))
  }
}

/**
 * WhatsApp Business API Integration
 * Uses Meta's Cloud API for WhatsApp Business
 */
class WhatsAppService {
  private baseUrl = 'https://graph.facebook.com/v18.0'

  constructor(
    private phoneNumberId: string,
    private accessToken: string
  ) {}

  async sendMessage(
    to: string,
    text: string,
    attachments?: MessageAttachment[]
  ): Promise<SendResult> {
    try {
      // Format phone number (remove any non-numeric characters except +)
      const formattedPhone = to.replace(/[^\d+]/g, '').replace(/^\+/, '')

      // If there are attachments, send them first
      if (attachments?.length) {
        for (const attachment of attachments) {
          await this.sendMedia(formattedPhone, attachment)
        }
      }

      const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedPhone,
          type: 'text',
          text: { body: text },
        }),
      })

      const data = await response.json()

      if (data.error) {
        return {
          success: false,
          channel: 'whatsapp',
          timestamp: new Date(),
          error: data.error.message || 'Failed to send WhatsApp message',
        }
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
        channel: 'whatsapp',
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        success: false,
        channel: 'whatsapp',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private async sendMedia(to: string, attachment: MessageAttachment): Promise<void> {
    const typeMap: Record<string, string> = {
      image: 'image',
      video: 'video',
      audio: 'audio',
      file: 'document',
    }

    await fetch(`${this.baseUrl}/${this.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: typeMap[attachment.type] || 'document',
        [typeMap[attachment.type] || 'document']: {
          link: attachment.url,
          caption: attachment.name,
        },
      }),
    })
  }

  async sendTemplate(
    to: string,
    templateName: string,
    languageCode: string,
    components?: any[]
  ): Promise<SendResult> {
    try {
      const formattedPhone = to.replace(/[^\d+]/g, '').replace(/^\+/, '')

      const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode },
            components,
          },
        }),
      })

      const data = await response.json()

      if (data.error) {
        return {
          success: false,
          channel: 'whatsapp',
          timestamp: new Date(),
          error: data.error.message,
        }
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
        channel: 'whatsapp',
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        success: false,
        channel: 'whatsapp',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

/**
 * Bird SMS Service
 * Uses Bird's messaging API for SMS
 * @see https://docs.bird.com/api/
 */
class BirdSMSService {
  private baseUrl = 'https://api.bird.com'

  constructor(
    private apiKey: string,
    private workspaceId: string,
    private channelId: string
  ) {}

  async sendMessage(
    to: string,
    text: string,
    _mediaUrls?: string[] // Bird handles media differently
  ): Promise<SendResult> {
    try {
      // Format phone number - Bird expects E.164 format
      const formattedTo = to.startsWith('+') ? to : `+${to}`

      const response = await fetch(
        `${this.baseUrl}/workspaces/${this.workspaceId}/channels/${this.channelId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `AccessKey ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            receiver: {
              contacts: [
                {
                  identifierValue: formattedTo,
                },
              ],
            },
            body: {
              type: 'text',
              text: {
                text: text,
              },
            },
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          channel: 'sms',
          timestamp: new Date(),
          error: data.message || data.error || `Bird API error: ${response.status}`,
        }
      }

      return {
        success: true,
        messageId: data.id,
        channel: 'sms',
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        success: false,
        channel: 'sms',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async getMessageStatus(messageId: string): Promise<string> {
    const response = await fetch(
      `${this.baseUrl}/workspaces/${this.workspaceId}/channels/${this.channelId}/messages/${messageId}`,
      {
        headers: {
          'Authorization': `AccessKey ${this.apiKey}`,
        },
      }
    )

    const data = await response.json()
    return data.status || 'unknown'
  }

  /**
   * Send SMS using Bird's Navigator (alternative routing)
   * Useful for conversation flows
   */
  async sendViaNavigator(
    navigatorId: string,
    to: string,
    text: string
  ): Promise<SendResult> {
    try {
      const formattedTo = to.startsWith('+') ? to : `+${to}`

      const response = await fetch(
        `${this.baseUrl}/workspaces/${this.workspaceId}/navigators/${navigatorId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `AccessKey ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            receiver: {
              contacts: [
                {
                  identifierValue: formattedTo,
                },
              ],
            },
            body: {
              type: 'text',
              text: {
                text: text,
              },
            },
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          channel: 'sms',
          timestamp: new Date(),
          error: data.message || data.error || `Bird API error: ${response.status}`,
        }
      }

      return {
        success: true,
        messageId: data.id,
        channel: 'sms',
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        success: false,
        channel: 'sms',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

/**
 * Email Service (supports Resend and SendGrid)
 */
class EmailService {
  constructor(
    private provider: 'resend' | 'sendgrid',
    private apiKey: string,
    private fromEmail: string,
    private fromName?: string
  ) {}

  async sendMessage(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string,
    attachments?: { filename: string; content: string; type: string }[]
  ): Promise<SendResult> {
    try {
      if (this.provider === 'resend') {
        return this.sendViaResend(to, subject, htmlContent, textContent, attachments)
      } else {
        return this.sendViaSendGrid(to, subject, htmlContent, textContent, attachments)
      }
    } catch (error) {
      return {
        success: false,
        channel: 'email',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private async sendViaResend(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string,
    attachments?: { filename: string; content: string; type: string }[]
  ): Promise<SendResult> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.fromName ? `${this.fromName} <${this.fromEmail}>` : this.fromEmail,
        to: [to],
        subject,
        html: htmlContent,
        text: textContent,
        attachments: attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
        })),
      }),
    })

    const data = await response.json()

    if (data.error) {
      return {
        success: false,
        channel: 'email',
        timestamp: new Date(),
        error: data.error.message || 'Failed to send email',
      }
    }

    return {
      success: true,
      messageId: data.id,
      channel: 'email',
      timestamp: new Date(),
    }
  }

  private async sendViaSendGrid(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string,
    attachments?: { filename: string; content: string; type: string }[]
  ): Promise<SendResult> {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject,
        content: [
          ...(textContent ? [{ type: 'text/plain', value: textContent }] : []),
          { type: 'text/html', value: htmlContent },
        ],
        attachments: attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          type: att.type,
        })),
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return {
        success: false,
        channel: 'email',
        timestamp: new Date(),
        error: `SendGrid error: ${error}`,
      }
    }

    const messageId = response.headers.get('X-Message-Id')

    return {
      success: true,
      messageId: messageId || undefined,
      channel: 'email',
      timestamp: new Date(),
    }
  }
}

/**
 * Unified Communications Service
 * Provides a single interface for all communication channels
 */
export class UnifiedCommunicationsService {
  private slackService?: SlackService
  private discordService?: DiscordService
  private whatsAppService?: WhatsAppService
  private birdService?: BirdSMSService
  private emailService?: EmailService

  constructor(config: ChannelConfig) {
    if (config.slack) {
      this.slackService = new SlackService(
        config.slack.botToken,
        config.slack.signingSecret
      )
    }

    if (config.discord) {
      this.discordService = new DiscordService(config.discord.botToken)
    }

    if (config.whatsapp) {
      this.whatsAppService = new WhatsAppService(
        config.whatsapp.phoneNumberId,
        config.whatsapp.accessToken
      )
    }

    if (config.bird) {
      this.birdService = new BirdSMSService(
        config.bird.apiKey,
        config.bird.workspaceId,
        config.bird.channelId
      )
    }

    if (config.email) {
      this.emailService = new EmailService(
        config.email.provider,
        config.email.apiKey,
        config.email.fromEmail,
        config.email.fromName
      )
    }
  }

  async send(payload: MessagePayload): Promise<SendResult> {
    switch (payload.channel) {
      case 'slack':
        if (!this.slackService) {
          return {
            success: false,
            channel: 'slack',
            timestamp: new Date(),
            error: 'Slack is not configured',
          }
        }
        return this.slackService.sendMessage(
          payload.recipient,
          payload.content,
          payload.attachments
        )

      case 'discord':
        if (!this.discordService) {
          return {
            success: false,
            channel: 'discord',
            timestamp: new Date(),
            error: 'Discord is not configured',
          }
        }
        return this.discordService.sendMessage(
          payload.recipient,
          payload.content,
          payload.attachments
        )

      case 'whatsapp':
        if (!this.whatsAppService) {
          return {
            success: false,
            channel: 'whatsapp',
            timestamp: new Date(),
            error: 'WhatsApp is not configured',
          }
        }
        return this.whatsAppService.sendMessage(
          payload.recipient,
          payload.content,
          payload.attachments
        )

      case 'sms':
        if (!this.birdService) {
          return {
            success: false,
            channel: 'sms',
            timestamp: new Date(),
            error: 'SMS (Bird) is not configured',
          }
        }
        return this.birdService.sendMessage(
          payload.recipient,
          payload.content,
          payload.attachments?.map(a => a.url)
        )

      case 'email':
        if (!this.emailService) {
          return {
            success: false,
            channel: 'email',
            timestamp: new Date(),
            error: 'Email is not configured',
          }
        }
        return this.emailService.sendMessage(
          payload.recipient,
          payload.metadata?.subject as string || 'Message from HMN',
          payload.content,
          payload.metadata?.textContent as string
        )

      default:
        return {
          success: false,
          channel: payload.channel,
          timestamp: new Date(),
          error: `Unsupported channel: ${payload.channel}`,
        }
    }
  }

  async broadcast(
    channels: CommunicationChannel[],
    recipients: Record<CommunicationChannel, string[]>,
    content: string,
    attachments?: MessageAttachment[]
  ): Promise<SendResult[]> {
    const results: SendResult[] = []

    for (const channel of channels) {
      const channelRecipients = recipients[channel] || []
      for (const recipient of channelRecipients) {
        const result = await this.send({
          channel,
          recipient,
          content,
          attachments,
        })
        results.push(result)
      }
    }

    return results
  }

  getAvailableChannels(): CommunicationChannel[] {
    const channels: CommunicationChannel[] = []
    if (this.slackService) channels.push('slack')
    if (this.discordService) channels.push('discord')
    if (this.whatsAppService) channels.push('whatsapp')
    if (this.birdService) channels.push('sms')
    if (this.emailService) channels.push('email')
    return channels
  }

  // Slack-specific methods
  getSlackService(): SlackService | undefined {
    return this.slackService
  }

  // Discord-specific methods
  getDiscordService(): DiscordService | undefined {
    return this.discordService
  }

  // WhatsApp-specific methods
  getWhatsAppService(): WhatsAppService | undefined {
    return this.whatsAppService
  }

  // Bird SMS-specific methods
  getBirdService(): BirdSMSService | undefined {
    return this.birdService
  }

  // Email-specific methods
  getEmailService(): EmailService | undefined {
    return this.emailService
  }
}

/**
 * Factory function to create UnifiedCommunicationsService from environment variables
 */
export function createUnifiedCommunicationsService(): UnifiedCommunicationsService {
  const config: ChannelConfig = {}

  // Slack configuration
  if (process.env.SLACK_BOT_TOKEN) {
    config.slack = {
      botToken: process.env.SLACK_BOT_TOKEN,
      appToken: process.env.SLACK_APP_TOKEN,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
    }
  }

  // Discord configuration
  if (process.env.DISCORD_BOT_TOKEN) {
    config.discord = {
      botToken: process.env.DISCORD_BOT_TOKEN,
      applicationId: process.env.DISCORD_APPLICATION_ID,
    }
  }

  // WhatsApp configuration
  if (process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN) {
    config.whatsapp = {
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    }
  }

  // Bird SMS configuration
  if (process.env.BIRD_API_KEY && process.env.BIRD_WORKSPACE_ID && process.env.BIRD_CHANNEL_ID) {
    config.bird = {
      apiKey: process.env.BIRD_API_KEY,
      workspaceId: process.env.BIRD_WORKSPACE_ID,
      channelId: process.env.BIRD_CHANNEL_ID,
    }
  }

  // Email configuration (Resend or SendGrid)
  if (process.env.RESEND_API_KEY) {
    config.email = {
      provider: 'resend',
      apiKey: process.env.RESEND_API_KEY,
      fromEmail: process.env.EMAIL_FROM || 'noreply@hmnglue.com',
      fromName: process.env.EMAIL_FROM_NAME || 'HMN',
    }
  } else if (process.env.SENDGRID_API_KEY) {
    config.email = {
      provider: 'sendgrid',
      apiKey: process.env.SENDGRID_API_KEY,
      fromEmail: process.env.EMAIL_FROM || 'noreply@hmnglue.com',
      fromName: process.env.EMAIL_FROM_NAME || 'HMN',
    }
  }

  return new UnifiedCommunicationsService(config)
}
