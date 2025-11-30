/**
 * Video Conferencing Recordings API Route
 * Get recordings for a specific meeting
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createVideoConferencingService,
  VideoProvider,
} from '@/lib/services/video-conferencing'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/video-conferencing/meetings/[id]/recordings
 * Get recordings for a specific meeting (Zoom only currently)
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get meeting details
    const { data: meeting, error: fetchError } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      )
    }

    // Check if recording was enabled
    if (!meeting.recording_enabled) {
      return NextResponse.json({
        recordings: [],
        message: 'Recording was not enabled for this meeting',
      })
    }

    // Currently only Zoom supports direct recording retrieval
    if (meeting.provider !== 'zoom') {
      return NextResponse.json({
        recordings: [],
        message: `Recording retrieval not supported for ${meeting.provider}. Please check the provider dashboard.`,
        providerDashboard: getProviderDashboardUrl(meeting.provider as VideoProvider),
      })
    }

    try {
      const videoService = createVideoConferencingService()
      const recordings = await videoService.getRecordings(
        meeting.provider as VideoProvider,
        meeting.external_id
      )

      return NextResponse.json({
        recordings,
        meetingId: meeting.id,
        provider: meeting.provider,
      })
    } catch (recordingError) {
      console.error('Error fetching recordings:', recordingError)
      return NextResponse.json({
        recordings: [],
        message: 'Recordings not available yet. They may still be processing.',
      })
    }
  } catch (error) {
    console.error('Get recordings error:', error)
    return NextResponse.json(
      { error: 'Failed to get recordings' },
      { status: 500 }
    )
  }
}

function getProviderDashboardUrl(provider: VideoProvider): string {
  switch (provider) {
    case 'zoom':
      return 'https://zoom.us/recording'
    case 'google_meet':
      return 'https://drive.google.com/drive/my-drive'
    case 'microsoft_teams':
      return 'https://www.microsoft.com/microsoft-365/microsoft-teams/online-meetings'
    default:
      return ''
  }
}
