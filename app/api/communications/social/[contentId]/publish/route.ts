/**
 * Publish Social Content API
 *
 * POST /api/communications/social/[contentId]/publish - Publish saved content
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { socialPostingService } from '@/lib/services/social-posting'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  const { contentId } = await params

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

    // Verify content belongs to organization
    const { data: content, error: contentError } = await supabase
      .from('channel_content')
      .select('organization_id, status')
      .eq('id', contentId)
      .single()

    if (contentError || !content) {
      return NextResponse.json(
        { success: false, error: 'Content not found' },
        { status: 404 }
      )
    }

    if (content.organization_id !== userData.organization_id) {
      return NextResponse.json(
        { success: false, error: 'Content not found' },
        { status: 404 }
      )
    }

    if (content.status === 'published') {
      return NextResponse.json(
        { success: false, error: 'Content already published' },
        { status: 400 }
      )
    }

    // Publish
    const results = await socialPostingService.publishContent(contentId)

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
    console.error('[Social Publish API] error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to publish content',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
