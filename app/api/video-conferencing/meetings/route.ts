/**
 * Video Conferencing Meetings API Routes
 * Create, list, and manage video conference meetings
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createVideoConferencingService,
  VideoProvider,
  CreateMeetingParams,
} from '@/lib/services/video-conferencing'

/**
 * GET /api/video-conferencing/meetings
 * List scheduled meetings for the authenticated user
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
    const provider = searchParams.get('provider') as VideoProvider | null
    const upcoming = searchParams.get('upcoming') === 'true'

    let query = supabase
      .from('meetings')
      .select('*')
      .eq('user_id', user.id)
      .order('start_time', { ascending: true })

    if (provider) {
      query = query.eq('provider', provider)
    }

    if (upcoming) {
      query = query.gte('start_time', new Date().toISOString())
    }

    const { data: meetings, error } = await query
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      meetings,
      pagination: {
        limit,
        offset,
        hasMore: meetings.length === limit,
      },
    })
  } catch (error) {
    console.error('List meetings error:', error)
    return NextResponse.json(
      { error: 'Failed to list meetings' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/video-conferencing/meetings
 * Create a new video conference meeting
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
    const {
      provider,
      title,
      description,
      startTime,
      duration,
      timezone,
      participants,
      recordingEnabled,
      waitingRoomEnabled,
    } = body

    if (!provider || !title || !startTime || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields: provider, title, startTime, duration' },
        { status: 400 }
      )
    }

    // Validate provider
    if (!['zoom', 'google_meet', 'microsoft_teams'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Must be zoom, google_meet, or microsoft_teams' },
        { status: 400 }
      )
    }

    const videoService = createVideoConferencingService()
    const availableProviders = videoService.getAvailableProviders()

    if (!availableProviders.includes(provider)) {
      return NextResponse.json(
        { error: `${provider} is not configured. Available providers: ${availableProviders.join(', ') || 'none'}` },
        { status: 400 }
      )
    }

    const meetingParams: CreateMeetingParams = {
      provider,
      title,
      description,
      startTime: new Date(startTime),
      duration,
      timezone: timezone || 'America/New_York',
      participants,
      recordingEnabled: recordingEnabled ?? false,
      waitingRoomEnabled: waitingRoomEnabled ?? true,
    }

    // Get user's Microsoft ID if using Teams
    let microsoftUserId: string | undefined
    if (provider === 'microsoft_teams') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('microsoft_user_id')
        .eq('id', user.id)
        .single()
      microsoftUserId = profile?.microsoft_user_id
    }

    // Create meeting with provider
    const meeting = await videoService.createMeeting(meetingParams, microsoftUserId)

    // Store in database
    const { data: savedMeeting, error: saveError } = await supabase
      .from('meetings')
      .insert({
        user_id: user.id,
        provider: meeting.provider,
        external_id: meeting.id,
        title: meeting.title,
        description: meeting.description,
        start_time: meeting.startTime.toISOString(),
        end_time: meeting.endTime.toISOString(),
        timezone: meeting.timezone,
        join_url: meeting.joinUrl,
        host_url: meeting.hostUrl,
        password: meeting.password,
        dial_in: meeting.dialIn,
        recording_enabled: meetingParams.recordingEnabled,
        waiting_room_enabled: meetingParams.waitingRoomEnabled,
        participants,
        metadata: meeting.metadata,
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving meeting:', saveError)
    }

    return NextResponse.json({
      success: true,
      meeting: {
        ...meeting,
        id: savedMeeting?.id || meeting.id,
      },
    })
  } catch (error) {
    console.error('Create meeting error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create meeting' },
      { status: 500 }
    )
  }
}
