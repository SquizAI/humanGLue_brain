/**
 * Bird Inbound Webhook
 * Handles incoming messages from Bird (SMS, WhatsApp, etc.)
 * Configure this URL in Bird dashboard: https://your-domain/api/webhooks/bird-inbound
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role for webhook (no user auth)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Bird webhook payload types
interface BirdWebhookMessage {
  id: string
  channelId: string
  conversationId?: string
  direction: 'incoming' | 'outgoing'
  status: string
  body: {
    type: 'text' | 'template' | 'media'
    text?: { text: string }
    media?: {
      url: string
      contentType: string
    }
  }
  sender?: {
    id: string
    identifierValue: string
    displayName?: string
  }
  receiver?: {
    contacts: Array<{
      id: string
      identifierValue: string
    }>
  }
  createdAt: string
  updatedAt: string
}

interface BirdWebhookPayload {
  type: 'message.created' | 'message.updated' | 'message.status.updated'
  organizationId: string
  workspaceId: string
  data: BirdWebhookMessage
}

/**
 * POST /api/webhooks/bird-inbound
 * Receive webhook events from Bird
 */
export async function POST(request: NextRequest) {
  try {
    // Verify Bird webhook signature (optional but recommended)
    const signature = request.headers.get('X-Bird-Signature')
    const timestamp = request.headers.get('X-Bird-Timestamp')

    // Parse the webhook payload
    const payload: BirdWebhookPayload = await request.json()

    console.log('[Bird Webhook] Received event:', payload.type, payload.data?.id)

    // Handle different event types
    switch (payload.type) {
      case 'message.created':
        await handleIncomingMessage(payload.data)
        break

      case 'message.status.updated':
        await handleStatusUpdate(payload.data)
        break

      case 'message.updated':
        // Handle message updates if needed
        console.log('[Bird Webhook] Message updated:', payload.data.id)
        break

      default:
        console.log('[Bird Webhook] Unhandled event type:', payload.type)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Bird Webhook] Error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle incoming messages
 */
async function handleIncomingMessage(message: BirdWebhookMessage) {
  // Only process incoming messages
  if (message.direction !== 'incoming') {
    return
  }

  const senderPhone = message.sender?.identifierValue
  const messageText = message.body?.text?.text || ''

  console.log('[Bird Webhook] Incoming message from:', senderPhone)

  // Find the user/organization associated with this channel
  const { data: channel } = await supabase
    .from('messaging_channels')
    .select('*')
    .eq('external_channel_id', message.channelId)
    .single()

  // Log the inbound message
  const { error: insertError } = await supabase
    .from('communication_logs')
    .insert({
      // If we found the channel, use its organization
      organization_id: channel?.organization_id,
      // Try to find a user who has sent to this number before
      user_id: await findUserByContact(senderPhone),
      channel: 'sms',
      provider: 'bird',
      direction: 'inbound',
      sender: senderPhone,
      recipient: message.receiver?.contacts?.[0]?.identifierValue || '',
      content: messageText,
      external_id: message.id,
      status: 'delivered',
      metadata: {
        channelId: message.channelId,
        conversationId: message.conversationId,
        senderDisplayName: message.sender?.displayName,
        createdAt: message.createdAt,
      },
    })

  if (insertError) {
    console.error('[Bird Webhook] Error logging message:', insertError)
    throw insertError
  }

  // Optionally: Trigger notifications, auto-responses, etc.
  await triggerNotifications(senderPhone, messageText, channel)
}

/**
 * Handle status updates for outbound messages
 */
async function handleStatusUpdate(message: BirdWebhookMessage) {
  const { error } = await supabase
    .from('communication_logs')
    .update({
      status: mapBirdStatus(message.status),
      updated_at: new Date().toISOString(),
    })
    .eq('external_id', message.id)

  if (error) {
    console.error('[Bird Webhook] Error updating status:', error)
  }
}

/**
 * Map Bird status to our status
 */
function mapBirdStatus(birdStatus: string): string {
  const statusMap: Record<string, string> = {
    accepted: 'pending',
    sent: 'sent',
    delivered: 'delivered',
    read: 'read',
    failed: 'failed',
    rejected: 'failed',
  }
  return statusMap[birdStatus] || birdStatus
}

/**
 * Find user who has previously communicated with this contact
 */
async function findUserByContact(phone?: string): Promise<string | null> {
  if (!phone) return null

  const { data } = await supabase
    .from('communication_logs')
    .select('user_id')
    .eq('recipient', phone)
    .eq('direction', 'outbound')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return data?.user_id || null
}

/**
 * Trigger notifications for incoming messages
 */
async function triggerNotifications(
  senderPhone?: string,
  messageText?: string,
  channel?: any
) {
  // Find users to notify
  const userId = await findUserByContact(senderPhone)
  if (!userId) return

  // Create a notification
  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'message_received',
    title: 'New SMS Message',
    message: `New message from ${senderPhone}: ${messageText?.substring(0, 100)}${messageText && messageText.length > 100 ? '...' : ''}`,
    data: {
      channel: 'sms',
      sender: senderPhone,
      channelId: channel?.id,
    },
  })
}

/**
 * GET endpoint for webhook verification
 */
export async function GET(request: NextRequest) {
  // Bird may send a GET request to verify the webhook
  const { searchParams } = new URL(request.url)
  const challenge = searchParams.get('challenge')

  if (challenge) {
    return NextResponse.json({ challenge })
  }

  return NextResponse.json({
    status: 'ok',
    webhook: 'bird-inbound',
    timestamp: new Date().toISOString(),
  })
}
