/**
 * Newsletter Subscribers API
 *
 * POST /api/communications/newsletter/subscribers - Add subscriber
 * GET /api/communications/newsletter/subscribers - Get subscribers
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
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!userData?.organization_id) {
      return NextResponse.json(
        { success: false, error: 'No organization' },
        { status: 400 }
      )
    }

    const { listId, email, firstName, lastName, source, tags } = body

    if (!listId || !email) {
      return NextResponse.json(
        { success: false, error: 'listId and email are required' },
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

    // Add subscriber
    const subscriber = await newsletterService.addSubscriber(
      userData.organization_id,
      listId,
      {
        email,
        firstName,
        lastName,
        source: source || 'api',
        tags,
      }
    )

    return NextResponse.json({
      success: true,
      subscriber,
    })
  } catch (error) {
    console.error('[Subscribers API] POST error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add subscriber',
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
    const listId = searchParams.get('listId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const subscribedOnly = searchParams.get('subscribedOnly') !== 'false'
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)

    if (!listId) {
      return NextResponse.json(
        { success: false, error: 'listId is required' },
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

    // Get subscribers
    const result = await newsletterService.getSubscribers(listId, {
      limit,
      offset,
      subscribedOnly,
      tags,
    })

    return NextResponse.json({
      success: true,
      ...result,
      pagination: {
        total: result.total,
        limit,
        offset,
        hasMore: result.total > offset + limit,
      },
    })
  } catch (error) {
    console.error('[Subscribers API] GET error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch subscribers',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
