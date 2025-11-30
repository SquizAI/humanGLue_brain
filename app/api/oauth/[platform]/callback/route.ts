/**
 * OAuth Callback Handler
 *
 * Handles OAuth callbacks for all social platforms
 * GET /api/oauth/[platform]/callback
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
      return NextResponse.redirect(
        new URL(`/admin/settings/channels?error=invalid_platform`, request.url)
      )
    }

    const validPlatform = platform as SocialPlatform

    // Get query params
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    // Handle OAuth errors
    if (error) {
      console.error(`[OAuth Callback] ${platform} error:`, error, errorDescription)
      return NextResponse.redirect(
        new URL(
          `/admin/settings/channels?error=${encodeURIComponent(errorDescription || error)}&platform=${platform}`,
          request.url
        )
      )
    }

    // Validate code and state
    if (!code || !state) {
      return NextResponse.redirect(
        new URL(`/admin/settings/channels?error=missing_params&platform=${platform}`, request.url)
      )
    }

    // Decode state
    let stateData: {
      organizationId: string
      nonce: string
      timestamp: number
      customState?: string
    }

    try {
      stateData = JSON.parse(Buffer.from(state, 'base64url').toString())
    } catch {
      return NextResponse.redirect(
        new URL(`/admin/settings/channels?error=invalid_state&platform=${platform}`, request.url)
      )
    }

    // Verify state is not too old (15 minute window)
    if (Date.now() - stateData.timestamp > 15 * 60 * 1000) {
      return NextResponse.redirect(
        new URL(`/admin/settings/channels?error=state_expired&platform=${platform}`, request.url)
      )
    }

    // Get current user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(
        new URL(`/login?redirect=/admin/settings/channels&platform=${platform}`, request.url)
      )
    }

    // Verify user belongs to organization
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (!userData || userData.organization_id !== stateData.organizationId) {
      return NextResponse.redirect(
        new URL(`/admin/settings/channels?error=unauthorized&platform=${platform}`, request.url)
      )
    }

    // Check user has permission (admin or org_admin)
    if (!['admin', 'org_admin'].includes(userData.role)) {
      return NextResponse.redirect(
        new URL(`/admin/settings/channels?error=insufficient_permissions&platform=${platform}`, request.url)
      )
    }

    // Exchange code for tokens
    const tokens = await socialOAuthService.exchangeCodeForTokens(validPlatform, code)

    // Fetch user profile
    const profile = await socialOAuthService.fetchUserProfile(validPlatform, tokens.accessToken)

    // Save connection
    const connection = await socialOAuthService.saveConnection(
      stateData.organizationId,
      validPlatform,
      tokens,
      profile,
      user.id
    )

    // Fetch and save pages
    const pages = await socialOAuthService.fetchPages(validPlatform, tokens.accessToken)
    if (pages.length > 0) {
      await socialOAuthService.savePages(
        connection.id,
        stateData.organizationId,
        validPlatform,
        pages
      )
    }

    // Redirect back to settings with success
    return NextResponse.redirect(
      new URL(
        `/admin/settings/channels?success=connected&platform=${platform}&account=${encodeURIComponent(profile.username)}`,
        request.url
      )
    )
  } catch (err) {
    console.error(`[OAuth Callback] ${platform} error:`, err)
    return NextResponse.redirect(
      new URL(
        `/admin/settings/channels?error=${encodeURIComponent(err instanceof Error ? err.message : 'Connection failed')}&platform=${platform}`,
        request.url
      )
    )
  }
}
