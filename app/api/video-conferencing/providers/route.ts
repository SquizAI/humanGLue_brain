/**
 * Video Conferencing Providers API Route
 * Get available video conferencing providers
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createVideoConferencingService } from '@/lib/services/video-conferencing'

/**
 * GET /api/video-conferencing/providers
 * Get list of configured video conferencing providers
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

    const videoService = createVideoConferencingService()
    const availableProviders = videoService.getAvailableProviders()

    const providerDetails = {
      zoom: {
        name: 'Zoom',
        available: availableProviders.includes('zoom'),
        features: ['HD Video', 'Screen Sharing', 'Cloud Recording', 'Waiting Room', 'Breakout Rooms'],
        maxParticipants: 100,
      },
      google_meet: {
        name: 'Google Meet',
        available: availableProviders.includes('google_meet'),
        features: ['HD Video', 'Screen Sharing', 'Live Captions', 'Calendar Integration'],
        maxParticipants: 100,
      },
      microsoft_teams: {
        name: 'Microsoft Teams',
        available: availableProviders.includes('microsoft_teams'),
        features: ['HD Video', 'Screen Sharing', 'Recording', 'Together Mode', 'Whiteboard'],
        maxParticipants: 250,
      },
    }

    return NextResponse.json({
      providers: providerDetails,
      availableProviders,
    })
  } catch (error) {
    console.error('Get providers error:', error)
    return NextResponse.json(
      { error: 'Failed to get providers' },
      { status: 500 }
    )
  }
}
