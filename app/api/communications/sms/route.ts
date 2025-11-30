/**
 * SMS API Routes
 * Handles sending and receiving SMS via Bird API
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BIRD_API_KEY = process.env.BIRD_API_KEY
const BIRD_WORKSPACE_ID = process.env.BIRD_WORKSPACE_ID
const BIRD_CHANNEL_ID = process.env.BIRD_CHANNEL_ID
const BIRD_BASE_URL = 'https://api.bird.com'

interface SendSMSRequest {
  to: string
  message: string
  channelId?: string
}

interface BirdMessageResponse {
  id: string
  channelId: string
  status: string
  createdAt: string
  body: {
    type: string
    text: { text: string }
  }
  receiver: {
    contacts: Array<{
      id: string
      identifierValue: string
    }>
  }
}

// Format phone number to E.164
function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '')
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`
}

/**
 * POST /api/communications/sms
 * Send an SMS message
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate Bird configuration
    if (!BIRD_API_KEY || !BIRD_WORKSPACE_ID || !BIRD_CHANNEL_ID) {
      return NextResponse.json(
        { error: 'Bird SMS is not configured' },
        { status: 500 }
      )
    }

    const body: SendSMSRequest = await request.json()
    const { to, message, channelId } = body

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, message' },
        { status: 400 }
      )
    }

    const channel = channelId || BIRD_CHANNEL_ID

    // Send SMS via Bird API
    const response = await fetch(
      `${BIRD_BASE_URL}/workspaces/${BIRD_WORKSPACE_ID}/channels/${channel}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `AccessKey ${BIRD_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiver: {
            contacts: [{ identifierValue: formatPhoneNumber(to) }],
          },
          body: {
            type: 'text',
            text: { text: message },
          },
        }),
      }
    )

    const data: BirdMessageResponse = await response.json()

    if (!response.ok) {
      console.error('Bird API error:', data)
      return NextResponse.json(
        { error: 'Failed to send SMS', details: data },
        { status: response.status }
      )
    }

    // Log the message to database for tracking
    await supabase.from('communication_logs').insert({
      user_id: user.id,
      channel: 'sms',
      provider: 'bird',
      direction: 'outbound',
      recipient: formatPhoneNumber(to),
      content: message,
      external_id: data.id,
      status: data.status,
      metadata: {
        channelId: data.channelId,
        createdAt: data.createdAt,
      },
    })

    return NextResponse.json({
      success: true,
      messageId: data.id,
      status: data.status,
      to: formatPhoneNumber(to),
    })
  } catch (error) {
    console.error('SMS send error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/communications/sms
 * Get SMS message history
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { data: messages, error } = await supabase
      .from('communication_logs')
      .select('*')
      .eq('channel', 'sms')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    return NextResponse.json({
      messages,
      pagination: {
        limit,
        offset,
        hasMore: messages.length === limit,
      },
    })
  } catch (error) {
    console.error('SMS history error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
