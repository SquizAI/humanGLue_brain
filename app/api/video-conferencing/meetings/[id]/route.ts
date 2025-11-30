/**
 * Video Conferencing Meeting by ID API Routes
 * Get, update, and delete specific meetings
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
 * GET /api/video-conferencing/meetings/[id]
 * Get a specific meeting by ID
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

    const { data: meeting, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      )
    }

    // Optionally fetch latest status from provider
    const { searchParams } = new URL(request.url)
    if (searchParams.get('refresh') === 'true') {
      try {
        const videoService = createVideoConferencingService()

        let microsoftUserId: string | undefined
        if (meeting.provider === 'microsoft_teams') {
          const { data: profile } = await supabase
            .from('profiles')
            .select('microsoft_user_id')
            .eq('id', user.id)
            .single()
          microsoftUserId = profile?.microsoft_user_id
        }

        const providerMeeting = await videoService.getMeeting(
          meeting.provider as VideoProvider,
          meeting.external_id,
          microsoftUserId
        )

        if (providerMeeting) {
          // Update local record with latest from provider
          await supabase
            .from('meetings')
            .update({
              join_url: providerMeeting.joinUrl,
              host_url: providerMeeting.hostUrl,
              updated_at: new Date().toISOString(),
            })
            .eq('id', id)
        }
      } catch (refreshError) {
        console.error('Error refreshing meeting from provider:', refreshError)
      }
    }

    return NextResponse.json({ meeting })
  } catch (error) {
    console.error('Get meeting error:', error)
    return NextResponse.json(
      { error: 'Failed to get meeting' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/video-conferencing/meetings/[id]
 * Update a meeting
 */
export async function PATCH(
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

    // Get existing meeting
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

    const body = await request.json()
    const allowedFields = ['title', 'description', 'participants', 'notes']
    const updates: Record<string, unknown> = {}

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    updates.updated_at = new Date().toISOString()

    const { data: updatedMeeting, error: updateError } = await supabase
      .from('meetings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      meeting: updatedMeeting,
    })
  } catch (error) {
    console.error('Update meeting error:', error)
    return NextResponse.json(
      { error: 'Failed to update meeting' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/video-conferencing/meetings/[id]
 * Delete/cancel a meeting
 */
export async function DELETE(
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

    // Get existing meeting
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

    // Delete from provider
    try {
      const videoService = createVideoConferencingService()

      let microsoftUserId: string | undefined
      if (meeting.provider === 'microsoft_teams') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('microsoft_user_id')
          .eq('id', user.id)
          .single()
        microsoftUserId = profile?.microsoft_user_id
      }

      await videoService.deleteMeeting(
        meeting.provider as VideoProvider,
        meeting.external_id,
        microsoftUserId
      )
    } catch (providerError) {
      console.error('Error deleting meeting from provider:', providerError)
      // Continue with local deletion even if provider fails
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('meetings')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    return NextResponse.json({
      success: true,
      message: 'Meeting deleted successfully',
    })
  } catch (error) {
    console.error('Delete meeting error:', error)
    return NextResponse.json(
      { error: 'Failed to delete meeting' },
      { status: 500 }
    )
  }
}
