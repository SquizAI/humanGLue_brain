/**
 * Twilio SMS Service
 * Handles SMS messaging via Twilio API
 */

import twilio from 'twilio'

// Types
export interface TwilioConfig {
  accountSid: string
  authToken: string
  phoneNumber: string
}

export interface SendSMSParams {
  to: string
  body: string
  from?: string
  statusCallback?: string
}

export interface SendSMSResult {
  success: boolean
  messageId?: string
  status?: string
  error?: string
}

export interface SMSMessage {
  sid: string
  to: string
  from: string
  body: string
  status: string
  dateCreated: Date
  dateSent?: Date
  direction: 'inbound' | 'outbound-api' | 'outbound-call' | 'outbound-reply'
  errorCode?: number
  errorMessage?: string
}

// Default compliance messages
export const COMPLIANCE_MESSAGES = {
  optIn: 'HumanGlue: You opted in to receive SMS notifications. Msg frequency varies, up to 10/month. Reply HELP for help; STOP to opt out. Msg&data rates may apply.',
  optOut: 'HumanGlue: You have been unsubscribed. No further messages will be sent. Reply START to opt back in. Msg&data rates may apply.',
  help: 'HumanGlue: For help, email support@hmnglue.com or visit hmnglue.com/sms-terms. Reply STOP to opt out, START to subscribe. Msg&data rates may apply.',
}

class TwilioSMSService {
  private client: twilio.Twilio | null = null
  private phoneNumber: string = ''
  private isConfigured: boolean = false

  constructor() {
    this.initialize()
  }

  private initialize() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER

    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken)
      this.phoneNumber = phoneNumber || ''
      this.isConfigured = true
    } else {
      console.warn('Twilio credentials not configured')
      this.isConfigured = false
    }
  }

  /**
   * Check if Twilio is properly configured
   */
  isAvailable(): boolean {
    return this.isConfigured && !!this.phoneNumber
  }

  /**
   * Get the configured phone number
   */
  getPhoneNumber(): string {
    return this.phoneNumber
  }

  /**
   * Send an SMS message
   */
  async sendSMS(params: SendSMSParams): Promise<SendSMSResult> {
    if (!this.client) {
      return { success: false, error: 'Twilio client not initialized' }
    }

    if (!this.phoneNumber && !params.from) {
      return { success: false, error: 'No phone number configured' }
    }

    try {
      // Format phone number to E.164
      const toNumber = this.formatPhoneNumber(params.to)

      const message = await this.client.messages.create({
        to: toNumber,
        from: params.from || this.phoneNumber,
        body: params.body,
        statusCallback: params.statusCallback,
      })

      return {
        success: true,
        messageId: message.sid,
        status: message.status,
      }
    } catch (error) {
      console.error('Twilio SMS error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send SMS',
      }
    }
  }

  /**
   * Send opt-in confirmation message
   */
  async sendOptInConfirmation(to: string): Promise<SendSMSResult> {
    return this.sendSMS({
      to,
      body: COMPLIANCE_MESSAGES.optIn,
    })
  }

  /**
   * Send opt-out confirmation message
   */
  async sendOptOutConfirmation(to: string): Promise<SendSMSResult> {
    return this.sendSMS({
      to,
      body: COMPLIANCE_MESSAGES.optOut,
    })
  }

  /**
   * Send help response message
   */
  async sendHelpResponse(to: string): Promise<SendSMSResult> {
    return this.sendSMS({
      to,
      body: COMPLIANCE_MESSAGES.help,
    })
  }

  /**
   * Get message by SID
   */
  async getMessage(messageSid: string): Promise<SMSMessage | null> {
    if (!this.client) return null

    try {
      const message = await this.client.messages(messageSid).fetch()
      return {
        sid: message.sid,
        to: message.to,
        from: message.from,
        body: message.body || '',
        status: message.status,
        dateCreated: message.dateCreated,
        dateSent: message.dateSent || undefined,
        direction: message.direction as SMSMessage['direction'],
        errorCode: message.errorCode || undefined,
        errorMessage: message.errorMessage || undefined,
      }
    } catch (error) {
      console.error('Error fetching message:', error)
      return null
    }
  }

  /**
   * List messages with optional filters
   */
  async listMessages(options?: {
    to?: string
    from?: string
    dateSentAfter?: Date
    dateSentBefore?: Date
    limit?: number
  }): Promise<SMSMessage[]> {
    if (!this.client) return []

    try {
      const messages = await this.client.messages.list({
        to: options?.to,
        from: options?.from,
        dateSentAfter: options?.dateSentAfter,
        dateSentBefore: options?.dateSentBefore,
        limit: options?.limit || 50,
      })

      return messages.map(msg => ({
        sid: msg.sid,
        to: msg.to,
        from: msg.from,
        body: msg.body || '',
        status: msg.status,
        dateCreated: msg.dateCreated,
        dateSent: msg.dateSent || undefined,
        direction: msg.direction as SMSMessage['direction'],
        errorCode: msg.errorCode || undefined,
        errorMessage: msg.errorMessage || undefined,
      }))
    } catch (error) {
      console.error('Error listing messages:', error)
      return []
    }
  }

  /**
   * List available phone numbers in account
   */
  async listPhoneNumbers(): Promise<Array<{ phoneNumber: string; friendlyName: string; capabilities: object }>> {
    if (!this.client) return []

    try {
      const numbers = await this.client.incomingPhoneNumbers.list({ limit: 20 })
      return numbers.map(num => ({
        phoneNumber: num.phoneNumber,
        friendlyName: num.friendlyName,
        capabilities: num.capabilities,
      }))
    } catch (error) {
      console.error('Error listing phone numbers:', error)
      return []
    }
  }

  /**
   * Format phone number to E.164 format
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '')

    // If it starts with 1 and is 11 digits, assume US
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`
    }

    // If it's 10 digits, assume US and add +1
    if (cleaned.length === 10) {
      return `+1${cleaned}`
    }

    // If it already has a plus, return as-is
    if (phone.startsWith('+')) {
      return phone
    }

    // Otherwise add + prefix
    return `+${cleaned}`
  }

  /**
   * Handle incoming webhook from Twilio
   * Returns the appropriate response message based on keywords
   */
  handleIncomingKeyword(body: string): string | null {
    const keyword = body.trim().toUpperCase()

    switch (keyword) {
      case 'STOP':
      case 'CANCEL':
      case 'END':
      case 'QUIT':
      case 'UNSUBSCRIBE':
        return COMPLIANCE_MESSAGES.optOut

      case 'START':
      case 'YES':
      case 'UNSTOP':
        return COMPLIANCE_MESSAGES.optIn

      case 'HELP':
      case 'INFO':
        return COMPLIANCE_MESSAGES.help

      default:
        return null
    }
  }
}

// Singleton instance
let twilioService: TwilioSMSService | null = null

export function getTwilioSMSService(): TwilioSMSService {
  if (!twilioService) {
    twilioService = new TwilioSMSService()
  }
  return twilioService
}

export function createTwilioSMSService(): TwilioSMSService {
  return new TwilioSMSService()
}
