/**
 * Social Media Content API
 *
 * POST /api/communications/social - Create and optionally publish social content
 * GET /api/communications/social - Get social content/posts
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { socialPostingService } from '@/lib/services/social-posting'
import { SocialPlatform } from '@/lib/services/social-oauth'

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

    const {
      text,
      mediaUrls,
      link,
      linkTitle,
      linkDescription,
      targetPlatforms,
      targetPageIds,
      scheduledAt,
      publishNow = false,
    } = body

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Text content is required' },
        { status: 400 }
      )
    }

    if (!targetPlatforms || targetPlatforms.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one target platform is required' },
        { status: 400 }
      )
    }

    const content = {
      text: text.trim(),
      mediaUrls,
      link,
      linkTitle,
      linkDescription,
    }

    // If publishing immediately
    if (publishNow) {
      const results = await socialPostingService.postToMultiplePlatforms(
        userData.organization_id,
        content,
        targetPlatforms as SocialPlatform[],
        targetPageIds
      )

      // Save content and results
      const contentId = await socialPostingService.saveContent(
        userData.organization_id,
        content,
        {
          targetPlatforms,
          targetPageIds: targetPageIds ? Object.values(targetPageIds) : undefined,
          status: 'published' as any,
          createdBy: user.id,
        }
      )

      // Record each publication result
      for (const result of results) {
        await socialPostingService.recordPublicationResult(
          contentId,
          userData.organization_id,
          result
        )
      }

      const successCount = results.filter((r) => r.success).length
      const failCount = results.filter((r) => !r.success).length

      return NextResponse.json({
        success: true,
        contentId,
        results,
        summary: {
          total: results.length,
          succeeded: successCount,
          failed: failCount,
        },
      })
    }

    // Save as draft or scheduled
    const contentId = await socialPostingService.saveContent(
      userData.organization_id,
      content,
      {
        targetPlatforms,
        targetPageIds: targetPageIds ? Object.values(targetPageIds) : undefined,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        status: scheduledAt ? 'scheduled' as any : 'draft' as any,
        createdBy: user.id,
      }
    )

    return NextResponse.json({
      success: true,
      contentId,
      status: scheduledAt ? 'scheduled' : 'draft',
      scheduledAt: scheduledAt || null,
    })
  } catch (error) {
    console.error('[Social API] POST error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create social content',
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
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('channel_content')
      .select('*, publication_results(*)', { count: 'exact' })
      .eq('organization_id', userData.organization_id)
      .eq('channel_type', 'social')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: content, error, count } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      content: content || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    })
  } catch (error) {
    console.error('[Social API] GET error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch social content',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
