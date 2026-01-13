/**
 * Signal Messaging Service
 * Uses signal-cli for sending/receiving Signal messages
 *
 * Setup Instructions:
 * 1. Install signal-cli: brew install signal-cli
 * 2. Register a phone number: signal-cli -a +1234567890 register
 * 3. Verify with code: signal-cli -a +1234567890 verify CODE
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface SignalMessage {
  recipient: string // Phone number in E.164 format
  message: string
  attachments?: string[] // File paths
}

export interface SignalSendResult {
  success: boolean
  messageId?: string
  timestamp?: number
  error?: string
}

export interface SignalReceivedMessage {
  sender: string
  message: string
  timestamp: number
  attachments?: Array<{
    id: string
    contentType: string
    filename?: string
  }>
}

class SignalMessagingService {
  private accountNumber: string
  private configPath?: string

  constructor(accountNumber: string, configPath?: string) {
    this.accountNumber = accountNumber
    this.configPath = configPath
  }

  /**
   * Send a Signal message
   */
  async sendMessage(params: SignalMessage): Promise<SignalSendResult> {
    try {
      const attachmentArgs = params.attachments?.length
        ? params.attachments.map(file => `-a "${file}"`).join(' ')
        : ''

      const configArg = this.configPath ? `--config "${this.configPath}"` : ''

      const command = `signal-cli ${configArg} -a ${this.accountNumber} send -m "${params.message}" ${attachmentArgs} ${params.recipient}`

      const { stdout, stderr } = await execAsync(command)

      if (stderr && !stderr.includes('INFO')) {
        return {
          success: false,
          error: stderr,
        }
      }

      return {
        success: true,
        timestamp: Date.now(),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send Signal message',
      }
    }
  }

  /**
   * Send a Signal message to a group
   */
  async sendGroupMessage(groupId: string, message: string): Promise<SignalSendResult> {
    try {
      const configArg = this.configPath ? `--config "${this.configPath}"` : ''
      const command = `signal-cli ${configArg} -a ${this.accountNumber} send -g ${groupId} -m "${message}"`

      const { stdout, stderr } = await execAsync(command)

      if (stderr && !stderr.includes('INFO')) {
        return {
          success: false,
          error: stderr,
        }
      }

      return {
        success: true,
        timestamp: Date.now(),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send group message',
      }
    }
  }

  /**
   * Receive Signal messages
   */
  async receiveMessages(): Promise<SignalReceivedMessage[]> {
    try {
      const configArg = this.configPath ? `--config "${this.configPath}"` : ''
      const command = `signal-cli ${configArg} -a ${this.accountNumber} receive --json`

      const { stdout } = await execAsync(command)

      if (!stdout.trim()) {
        return []
      }

      const messages: SignalReceivedMessage[] = []
      const lines = stdout.trim().split('\n')

      for (const line of lines) {
        try {
          const data = JSON.parse(line)

          if (data.envelope?.dataMessage) {
            messages.push({
              sender: data.envelope.source || data.envelope.sourceNumber,
              message: data.envelope.dataMessage.message || '',
              timestamp: data.envelope.timestamp,
              attachments: data.envelope.dataMessage.attachments,
            })
          }
        } catch (parseError) {
          console.error('Failed to parse Signal message:', parseError)
        }
      }

      return messages
    } catch (error) {
      console.error('Failed to receive Signal messages:', error)
      return []
    }
  }

  /**
   * List groups
   */
  async listGroups(): Promise<Array<{ id: string; name: string; members: string[] }>> {
    try {
      const configArg = this.configPath ? `--config "${this.configPath}"` : ''
      const command = `signal-cli ${configArg} -a ${this.accountNumber} listGroups -d`

      const { stdout } = await execAsync(command)

      const groups: Array<{ id: string; name: string; members: string[] }> = []
      const lines = stdout.trim().split('\n')

      let currentGroup: any = null

      for (const line of lines) {
        if (line.startsWith('Id:')) {
          if (currentGroup) groups.push(currentGroup)
          currentGroup = { id: line.replace('Id:', '').trim(), name: '', members: [] }
        } else if (line.startsWith('Name:') && currentGroup) {
          currentGroup.name = line.replace('Name:', '').trim()
        } else if (line.startsWith('Members:') && currentGroup) {
          const members = line.replace('Members:', '').trim().split(',').map(m => m.trim())
          currentGroup.members = members.filter(m => m.length > 0)
        }
      }

      if (currentGroup) groups.push(currentGroup)

      return groups
    } catch (error) {
      console.error('Failed to list groups:', error)
      return []
    }
  }

  /**
   * Check if signal-cli is installed
   */
  async isInstalled(): Promise<boolean> {
    try {
      await execAsync('which signal-cli')
      return true
    } catch {
      return false
    }
  }

  /**
   * Check if account is registered
   */
  async isRegistered(): Promise<boolean> {
    try {
      const configArg = this.configPath ? `--config "${this.configPath}"` : ''
      const command = `signal-cli ${configArg} -a ${this.accountNumber} listIdentities`
      await execAsync(command)
      return true
    } catch {
      return false
    }
  }
}

// Singleton instance
let signalService: SignalMessagingService | null = null

export function getSignalService(): SignalMessagingService | null {
  const phoneNumber = process.env.SIGNAL_PHONE_NUMBER
  const configPath = process.env.SIGNAL_CONFIG_PATH

  if (!phoneNumber) {
    console.warn('SIGNAL_PHONE_NUMBER not configured')
    return null
  }

  if (!signalService) {
    signalService = new SignalMessagingService(phoneNumber, configPath)
  }

  return signalService
}

export function createSignalService(phoneNumber: string, configPath?: string): SignalMessagingService {
  return new SignalMessagingService(phoneNumber, configPath)
}
