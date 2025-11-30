/**
 * Workshop Announcement API
 *
 * POST /api/communications/workshops/announce - Announce a workshop
 * GET /api/communications/workshops/announce - Get announcement settings and history
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { workshopAnnouncementService } from '@/lib/services/workshop-announcements'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (!userData?.organization_id) {
      return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })
    }

    const { workshopId, channels, customContent } = body

    if (!workshopId) {
      return NextResponse.json(
        { success: false, error: 'workshopId is required' },
        { status: 400 }
      )
    }

    // Get workshop
    const { data: workshop, error: workshopError } = await supabase
      .from('workshops')
      .select('*')
      .eq('id', workshopId)
      .single()

    if (workshopError || !workshop) {
      return NextResponse.json({ success: false, error: 'Workshop not found' }, { status: 404 })
    }

    // Verify workshop belongs to organization
    if (workshop.organization_id !== userData.organization_id) {
      return NextResponse.json({ success: false, error: 'Workshop not found' }, { status: 404 })
    }

    // Announce workshop
    const results = await workshopAnnouncementService.announceWorkshop(workshop, {
      channels,
      customContent,
    })

    const successCount = results.filter((r) => r.success).length
    const failCount = results.filter((r) => !r.success).length

    return NextResponse.json({
      success: successCount > 0,
      results,
      summary: {
        total: results.length,
        succeeded: successCount,
        failed: failCount,
      },
    })
  } catch (error) {
    console.error('[Workshop Announce API] POST error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to announce workshop',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!userData?.organization_id) {
      return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const workshopId = searchParams.get('workshopId')

    // Get settings
    const settings = await workshopAnnouncementService.getSettings(userData.organization_id)

    // Get history if workshopId provided
    let history = null
    if (workshopId) {
      // Verify workshop belongs to org
      const { data: workshop } = await supabase
        .from('workshops')
        .select('organization_id')
        .eq('id', workshopId)
        .single()

      if (workshop?.organization_id === userData.organization_id) {
        history = await workshopAnnouncementService.getAnnouncementHistory(workshopId)
      }
    }

    // Get upcoming workshops needing reminders
    const upcomingWorkshops = await workshopAnnouncementService.getUpcomingWorkshopsForReminders(
      userData.organization_id
    )

    return NextResponse.json({
      success: true,
      settings,
      history,
      upcomingWorkshops: upcomingWorkshops.map((w) => ({
        id: w.id,
        title: w.title,
        date: w.date,
        time: w.time,
      })),
    })
  } catch (error) {
    console.error('[Workshop Announce API] GET error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch announcement data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization and role
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (!userData?.organization_id) {
      return NextResponse.json({ success: false, error: 'No organization' }, { status: 400 })
    }

    // Check permissions
    if (!['admin', 'org_admin'].includes(userData.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Update settings
    const settings = await workshopAnnouncementService.updateSettings(
      userData.organization_id,
      body
    )

    return NextResponse.json({
      success: true,
      settings,
    })
  } catch (error) {
    console.error('[Workshop Announce API] PUT error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update settings',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
