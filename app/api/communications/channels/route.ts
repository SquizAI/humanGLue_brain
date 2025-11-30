/**
 * Bird Channels API Routes
 * Manage messaging channels (SMS, WhatsApp, Voice)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import BirdService from '@/lib/services/bird-communications'

/**
 * GET /api/communications/channels
 * List all channels in the workspace
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const channels = await BirdService.listChannels()

    return NextResponse.json({
      channels: channels.results,
      count: channels.results.length,
    })
  } catch (error) {
    console.error('List channels error:', error)
    return NextResponse.json(
      { error: 'Failed to list channels' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/communications/channels
 * Create a new SMS channel
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, phoneNumberId, channelMessageType, useCaseId, enableConversations } = body

    if (!name || !phoneNumberId || !channelMessageType) {
      return NextResponse.json(
        { error: 'Missing required fields: name, phoneNumberId, channelMessageType' },
        { status: 400 }
      )
    }

    const connector = await BirdService.createSMSChannel({
      name,
      phoneNumberId,
      channelMessageType,
      useCaseId,
      enableConversations,
    })

    return NextResponse.json({
      success: true,
      connector,
      channelId: connector.channel?.channelId,
    })
  } catch (error) {
    console.error('Create channel error:', error)
    return NextResponse.json(
      { error: 'Failed to create channel' },
      { status: 500 }
    )
  }
}
