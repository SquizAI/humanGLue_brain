/**
 * Newsletter API
 *
 * POST /api/communications/newsletter - Send newsletter to list
 * GET /api/communications/newsletter - Get sent newsletters
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { newsletterService } from '@/lib/services/newsletter'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's organization
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (!userData?.organization_id) {
      return NextResponse.json(
        { success: false, error: 'No organization' },
        { status: 400 }
      )
    }

    // Check permission
    if (!['admin', 'org_admin', 'team_lead'].includes(userData.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { listId, subject, html, text } = body

    if (!listId) {
      return NextResponse.json(
        { success: false, error: 'listId is required' },
        { status: 400 }
      )
    }

    if (!subject || !html) {
      return NextResponse.json(
        { success: false, error: 'subject and html are required' },
        { status: 400 }
      )
    }

    // Verify list belongs to organization
    const { data: list } = await supabase
      .from('subscriber_lists')
      .select('organization_id')
      .eq('id', listId)
      .single()

    if (list?.organization_id !== userData.organization_id) {
      return NextResponse.json(
        { success: false, error: 'List not found' },
        { status: 404 }
      )
    }

    // Send newsletter
    const result = await newsletterService.sendNewsletter(
      userData.organization_id,
      listId,
      {
        subject,
        html,
        text,
        createdBy: user.id,
      }
    )

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error('[Newsletter API] POST error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send newsletter',
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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's organization
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!userData?.organization_id) {
      return NextResponse.json(
        { success: false, error: 'No organization' },
        { status: 400 }
      )
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get sent newsletters
    const { data, error, count } = await supabase
      .from('channel_content')
      .select('*, publication_results(*)', { count: 'exact' })
      .eq('organization_id', userData.organization_id)
      .eq('channel_type', 'newsletter')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      newsletters: data || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    })
  } catch (error) {
    console.error('[Newsletter API] GET error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch newsletters',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
