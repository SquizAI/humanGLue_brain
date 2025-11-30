/**
 * Bird Communications Service
 * Complete integration with Bird API for SMS, WhatsApp, Email, Voice
 * @see https://docs.bird.com/api/
 */

const BIRD_API_KEY = process.env.BIRD_API_KEY
const BIRD_WORKSPACE_ID = process.env.BIRD_WORKSPACE_ID
const BIRD_CHANNEL_ID = process.env.BIRD_CHANNEL_ID
const BIRD_BASE_URL = 'https://api.bird.com'

// ============================================================================
// Types
// ============================================================================

export interface BirdChannel {
  id: string
  status: 'active' | 'inactive' | 'pending'
  platformId: string
  name: string
  connectorId: string
  identifier: string
  createdAt: string
  updatedAt: string
}

export interface BirdNumber {
  id: string
  number: string
  type: 'local' | 'toll-free' | 'short-code'
  country: string
  capabilities: {
    voice: { inbound: boolean; outbound: boolean }
    sms: { inbound: boolean; outbound: boolean }
    mms: { inbound: boolean; outbound: boolean }
  }
  status: 'active' | 'pending' | 'inactive'
}

export interface BirdConnector {
  id: string
  workspaceId: string
  name: string
  connectorTemplateRef: string
  channel?: {
    channelId: string
    platform: string
  }
  number?: {
    phoneNumber: string
    numberId: string
  }
  createdAt: string
}

export interface BirdMessage {
  id: string
  channelId: string
  status: 'accepted' | 'sent' | 'delivered' | 'failed' | 'read'
  direction: 'outgoing' | 'incoming'
  body: {
    type: 'text' | 'template' | 'media'
    text?: { text: string }
  }
  receiver: {
    contacts: Array<{
      id: string
      identifierValue: string
    }>
  }
  createdAt: string
}

export interface SendMessageOptions {
  to: string
  message: string
  channelId?: string
  mediaUrls?: string[]
}

export interface CreateChannelOptions {
  name: string
  phoneNumberId: string
  channelMessageType: 'promotional' | '2fa' | 'conversational' | 'transactional' | 'emergency'
  useCaseId?: string
  enableConversations?: boolean
}

// ============================================================================
// API Helper
// ============================================================================

async function birdRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: unknown
): Promise<T> {
  if (!BIRD_API_KEY) {
    throw new Error('BIRD_API_KEY environment variable is not set')
  }
  if (!BIRD_WORKSPACE_ID) {
    throw new Error('BIRD_WORKSPACE_ID environment variable is not set')
  }

  const url = `${BIRD_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `AccessKey ${BIRD_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      `Bird API error (${response.status}): ${JSON.stringify(data)}`
    )
  }

  return data as T
}

// Format phone number to E.164
function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '')
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`
}

// ============================================================================
// Messaging Functions
// ============================================================================

/**
 * Send an SMS message
 */
export async function sendSMS(options: SendMessageOptions): Promise<BirdMessage> {
  const { to, message, channelId } = options
  const channel = channelId || BIRD_CHANNEL_ID

  if (!channel) {
    throw new Error('No channel ID provided and BIRD_CHANNEL_ID is not set')
  }

  return birdRequest<BirdMessage>(
    `/workspaces/${BIRD_WORKSPACE_ID}/channels/${channel}/messages`,
    'POST',
    {
      receiver: {
        contacts: [{ identifierValue: formatPhoneNumber(to) }],
      },
      body: {
        type: 'text',
        text: { text: message },
      },
    }
  )
}

/**
 * Send a message template (for WhatsApp Business, etc.)
 */
export async function sendTemplate(
  to: string,
  templateId: string,
  parameters?: Record<string, string>,
  channelId?: string
): Promise<BirdMessage> {
  const channel = channelId || BIRD_CHANNEL_ID

  if (!channel) {
    throw new Error('No channel ID provided and BIRD_CHANNEL_ID is not set')
  }

  return birdRequest<BirdMessage>(
    `/workspaces/${BIRD_WORKSPACE_ID}/channels/${channel}/messages`,
    'POST',
    {
      receiver: {
        contacts: [{ identifierValue: formatPhoneNumber(to) }],
      },
      body: {
        type: 'template',
        template: {
          templateId,
          parameters: parameters || {},
        },
      },
    }
  )
}

/**
 * Get message details
 */
export async function getMessage(
  messageId: string,
  channelId?: string
): Promise<BirdMessage> {
  const channel = channelId || BIRD_CHANNEL_ID

  if (!channel) {
    throw new Error('No channel ID provided and BIRD_CHANNEL_ID is not set')
  }

  return birdRequest<BirdMessage>(
    `/workspaces/${BIRD_WORKSPACE_ID}/channels/${channel}/messages/${messageId}`
  )
}

// ============================================================================
// Channel Management
// ============================================================================

/**
 * List all channels in the workspace
 */
export async function listChannels(): Promise<{ results: BirdChannel[] }> {
  return birdRequest<{ results: BirdChannel[] }>(
    `/workspaces/${BIRD_WORKSPACE_ID}/channels`
  )
}

/**
 * Get a specific channel
 */
export async function getChannel(channelId: string): Promise<BirdChannel> {
  return birdRequest<BirdChannel>(
    `/workspaces/${BIRD_WORKSPACE_ID}/channels/${channelId}`
  )
}

/**
 * Create a new SMS channel from a phone number
 */
export async function createSMSChannel(
  options: CreateChannelOptions
): Promise<BirdConnector> {
  const body: Record<string, unknown> = {
    connectorTemplateRef: 'sms-messagebird:1',
    name: options.name,
    arguments: {
      phoneNumberId: options.phoneNumberId,
      channelMessageType: options.channelMessageType,
    },
    channelConversationalStatusEnabled: options.enableConversations ?? true,
  }

  // US 10DLC requires use case ID
  if (options.useCaseId) {
    (body.arguments as Record<string, unknown>).useCaseId = options.useCaseId
  }

  return birdRequest<BirdConnector>(
    `/workspaces/${BIRD_WORKSPACE_ID}/connectors`,
    'POST',
    body
  )
}

/**
 * Create a WhatsApp channel
 */
export async function createWhatsAppChannel(
  name: string,
  phoneNumberId: string
): Promise<BirdConnector> {
  return birdRequest<BirdConnector>(
    `/workspaces/${BIRD_WORKSPACE_ID}/connectors`,
    'POST',
    {
      connectorTemplateRef: 'whatsapp:1',
      name,
      arguments: {
        phoneNumberId,
      },
      channelConversationalStatusEnabled: true,
    }
  )
}

/**
 * Delete a channel/connector
 */
export async function deleteChannel(connectorId: string): Promise<void> {
  await birdRequest<void>(
    `/workspaces/${BIRD_WORKSPACE_ID}/connectors/${connectorId}`,
    'DELETE'
  )
}

// ============================================================================
// Number Management
// ============================================================================

/**
 * List all phone numbers in the workspace
 */
export async function listNumbers(): Promise<{ results: BirdNumber[] }> {
  return birdRequest<{ results: BirdNumber[] }>(
    `/workspaces/${BIRD_WORKSPACE_ID}/numbers`
  )
}

/**
 * Get details of a specific phone number
 */
export async function getNumber(numberId: string): Promise<BirdNumber> {
  return birdRequest<BirdNumber>(
    `/workspaces/${BIRD_WORKSPACE_ID}/numbers/${numberId}`
  )
}

/**
 * List connectors (channel configurations)
 */
export async function listConnectors(
  templateRef?: string
): Promise<{ results: BirdConnector[] }> {
  const query = templateRef ? `?templateRef=${templateRef}` : ''
  return birdRequest<{ results: BirdConnector[] }>(
    `/workspaces/${BIRD_WORKSPACE_ID}/connectors${query}`
  )
}

/**
 * Get connector details
 */
export async function getConnector(connectorId: string): Promise<BirdConnector> {
  return birdRequest<BirdConnector>(
    `/workspaces/${BIRD_WORKSPACE_ID}/connectors/${connectorId}`
  )
}

/**
 * Get connector status (check if channel is ready)
 */
export async function getConnectorStatus(connectorId: string): Promise<{
  channel: { status: string; stage: string }
  number: { status: string }
}> {
  return birdRequest(
    `/workspaces/${BIRD_WORKSPACE_ID}/connectors/${connectorId}/status`
  )
}

// ============================================================================
// Workspace Info
// ============================================================================

/**
 * Get workspace information
 */
export async function getWorkspaceInfo(): Promise<{
  id: string
  name: string
  organizationId: string
}> {
  return birdRequest(`/workspaces/${BIRD_WORKSPACE_ID}`)
}

// ============================================================================
// Bulk Operations
// ============================================================================

/**
 * Send bulk SMS messages
 */
export async function sendBulkSMS(
  recipients: Array<{ to: string; message: string }>,
  channelId?: string
): Promise<BirdMessage[]> {
  const results: BirdMessage[] = []

  // Bird API handles bulk through batch, but for simplicity we'll send individually
  // In production, consider using Bird's batch endpoints
  for (const recipient of recipients) {
    try {
      const result = await sendSMS({
        to: recipient.to,
        message: recipient.message,
        channelId,
      })
      results.push(result)
    } catch (error) {
      console.error(`Failed to send SMS to ${recipient.to}:`, error)
    }
  }

  return results
}

// ============================================================================
// Client-Specific Channel Assignment
// ============================================================================

/**
 * Assign a dedicated channel to a client
 * This creates a new SMS channel using an available phone number
 */
export async function assignChannelToClient(
  clientId: string,
  clientName: string,
  phoneNumberId: string
): Promise<{
  channelId: string
  connectorId: string
  phoneNumber: string
}> {
  // Create a new SMS channel for this client
  const connector = await createSMSChannel({
    name: `${clientName} - SMS Channel`,
    phoneNumberId,
    channelMessageType: 'conversational',
    enableConversations: true,
  })

  return {
    channelId: connector.channel?.channelId || '',
    connectorId: connector.id,
    phoneNumber: connector.number?.phoneNumber || '',
  }
}

// ============================================================================
// Web SDK Configuration
// ============================================================================

/**
 * Get Web SDK configuration for client-side integration
 * Note: You need to generate a config URL from Bird dashboard
 */
export function getWebSDKConfig(): {
  scriptUrl: string
  configUrl: string | null
} {
  return {
    scriptUrl: 'https://embeddables.p.mbirdcdn.net/sdk/v0/bird-sdk.js',
    configUrl: process.env.BIRD_WEB_SDK_CONFIG_URL || null,
  }
}

// ============================================================================
// Export Default Service
// ============================================================================

export const BirdService = {
  // Messaging
  sendSMS,
  sendTemplate,
  getMessage,
  sendBulkSMS,

  // Channels
  listChannels,
  getChannel,
  createSMSChannel,
  createWhatsAppChannel,
  deleteChannel,

  // Numbers
  listNumbers,
  getNumber,

  // Connectors
  listConnectors,
  getConnector,
  getConnectorStatus,

  // Workspace
  getWorkspaceInfo,

  // Client Management
  assignChannelToClient,

  // Web SDK
  getWebSDKConfig,
}

export default BirdService
