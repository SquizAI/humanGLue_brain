/**
 * OAuth Initiation and Management API
 *
 * GET /api/oauth/[platform] - Get authorization URL
 * DELETE /api/oauth/[platform] - Disconnect platform
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { socialOAuthService, SocialPlatform } from '@/lib/services/social-oauth'

const VALID_PLATFORMS: SocialPlatform[] = [
  'linkedin',
  'twitter',
  'instagram',
  'facebook',
  'youtube',
  'tiktok',
  'threads',
]

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params

  try {
    // Validate platform
    if (!VALID_PLATFORMS.includes(platform as SocialPlatform)) {
      return NextResponse.json(
        { success: false, error: 'Invalid platform' },
        { status: 400 }
      )
    }

    const validPlatform = platform as SocialPlatform

    // Check if platform is configured
    if (!socialOAuthService.isPlatformConfigured(validPlatform)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Platform not configured',
          message: `OAuth credentials not set for ${platform}`,
        },
        { status: 503 }
      )
    }

    // Get current user and organization
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

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
    if (!['admin', 'org_admin'].includes(userData.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Generate authorization URL
    const authUrl = socialOAuthService.getAuthorizationUrl(
      validPlatform,
      userData.organization_id
    )

    return NextResponse.json({
      success: true,
      authUrl,
      platform,
    })
  } catch (error) {
    console.error(`[OAuth API] ${platform} error:`, error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate authorization URL',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params

  try {
    const { searchParams } = new URL(request.url)
    const connectionId = searchParams.get('connectionId')

    if (!connectionId) {
      return NextResponse.json(
        { success: false, error: 'connectionId is required' },
        { status: 400 }
      )
    }

    // Get current user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check user has permission
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (!['admin', 'org_admin'].includes(userData?.role || '')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Verify connection belongs to user's organization
    const { data: connection } = await supabase
      .from('social_oauth_connections')
      .select('organization_id')
      .eq('id', connectionId)
      .single()

    if (connection?.organization_id !== userData?.organization_id) {
      return NextResponse.json(
        { success: false, error: 'Connection not found' },
        { status: 404 }
      )
    }

    // Disconnect
    await socialOAuthService.disconnect(connectionId)

    return NextResponse.json({
      success: true,
      message: `Disconnected ${platform}`,
    })
  } catch (error) {
    console.error(`[OAuth API] ${platform} disconnect error:`, error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to disconnect',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
