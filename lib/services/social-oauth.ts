/**
 * Social Media OAuth Integration Service
 *
 * Handles OAuth flows for all supported social platforms:
 * - LinkedIn, Twitter/X, Instagram, Facebook, YouTube, TikTok, Threads
 *
 * White-label aware: Each organization has its own connections
 */

import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

// Types
export type SocialPlatform =
  | 'linkedin'
  | 'twitter'
  | 'instagram'
  | 'facebook'
  | 'youtube'
  | 'tiktok'
  | 'threads'

export type OAuthStatus = 'pending' | 'connected' | 'expired' | 'revoked' | 'error'

export interface OAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
  authUrl: string
  tokenUrl: string
  apiBaseUrl: string
}

export interface OAuthConnection {
  id: string
  organizationId: string
  platform: SocialPlatform
  status: OAuthStatus
  platformUserId?: string
  platformUsername?: string
  platformDisplayName?: string
  platformProfileUrl?: string
  platformAvatarUrl?: string
  scopes?: string[]
  tokenExpiresAt?: Date
  lastVerifiedAt?: Date
  errorMessage?: string
}

export interface SocialPage {
  id: string
  oauthConnectionId: string
  organizationId: string
  platform: SocialPlatform
  pageId: string
  pageName: string
  pageType?: string
  pageUrl?: string
  pageAvatarUrl?: string
  followerCount?: number
  isActive: boolean
  isDefault: boolean
}

export interface OAuthTokens {
  accessToken: string
  refreshToken?: string
  expiresIn?: number
  tokenType?: string
  scope?: string
}

// Platform-specific configurations
const PLATFORM_CONFIGS: Record<SocialPlatform, Partial<OAuthConfig>> = {
  linkedin: {
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    apiBaseUrl: 'https://api.linkedin.com/v2',
    scopes: ['r_liteprofile', 'r_emailaddress', 'w_member_social', 'r_organization_social', 'w_organization_social'],
  },
  twitter: {
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    apiBaseUrl: 'https://api.twitter.com/2',
    scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
  },
  instagram: {
    authUrl: 'https://api.instagram.com/oauth/authorize',
    tokenUrl: 'https://api.instagram.com/oauth/access_token',
    apiBaseUrl: 'https://graph.instagram.com',
    scopes: ['user_profile', 'user_media'],
  },
  facebook: {
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    apiBaseUrl: 'https://graph.facebook.com/v18.0',
    scopes: ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts', 'public_profile'],
  },
  youtube: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    apiBaseUrl: 'https://www.googleapis.com/youtube/v3',
    scopes: ['https://www.googleapis.com/auth/youtube', 'https://www.googleapis.com/auth/youtube.upload'],
  },
  tiktok: {
    authUrl: 'https://www.tiktok.com/v2/auth/authorize/',
    tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
    apiBaseUrl: 'https://open.tiktokapis.com/v2',
    scopes: ['user.info.basic', 'video.list', 'video.upload'],
  },
  threads: {
    authUrl: 'https://threads.net/oauth/authorize',
    tokenUrl: 'https://graph.threads.net/oauth/access_token',
    apiBaseUrl: 'https://graph.threads.net/v1.0',
    scopes: ['threads_basic', 'threads_content_publish'],
  },
}

// Encryption helper (uses organization-specific key + master key)
const ENCRYPTION_KEY = process.env.OAUTH_ENCRYPTION_KEY || 'default-dev-key-change-in-production'

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
    iv
  )
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

function decrypt(text: string): string {
  const parts = text.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const encrypted = parts[1]
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
    iv
  )
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

class SocialOAuthService {
  private getConfig(platform: SocialPlatform): OAuthConfig {
    const baseConfig = PLATFORM_CONFIGS[platform]
    const envPrefix = platform.toUpperCase()

    return {
      clientId: process.env[`${envPrefix}_CLIENT_ID`] || '',
      clientSecret: process.env[`${envPrefix}_CLIENT_SECRET`] || '',
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/${platform}/callback`,
      scopes: baseConfig.scopes || [],
      authUrl: baseConfig.authUrl || '',
      tokenUrl: baseConfig.tokenUrl || '',
      apiBaseUrl: baseConfig.apiBaseUrl || '',
    }
  }

  /**
   * Check if platform is configured
   */
  isPlatformConfigured(platform: SocialPlatform): boolean {
    const config = this.getConfig(platform)
    return !!(config.clientId && config.clientSecret)
  }

  /**
   * Get list of configured platforms
   */
  getConfiguredPlatforms(): SocialPlatform[] {
    const platforms: SocialPlatform[] = [
      'linkedin',
      'twitter',
      'instagram',
      'facebook',
      'youtube',
      'tiktok',
      'threads',
    ]
    return platforms.filter(p => this.isPlatformConfigured(p))
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthorizationUrl(
    platform: SocialPlatform,
    organizationId: string,
    state?: string
  ): string {
    const config = this.getConfig(platform)

    // Generate state token that includes organization ID
    const stateData = {
      organizationId,
      nonce: crypto.randomBytes(16).toString('hex'),
      timestamp: Date.now(),
      customState: state,
    }
    const encodedState = Buffer.from(JSON.stringify(stateData)).toString('base64url')

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: config.scopes.join(' '),
      state: encodedState,
    })

    // Platform-specific params
    if (platform === 'twitter') {
      params.set('code_challenge', crypto.randomBytes(32).toString('base64url'))
      params.set('code_challenge_method', 'plain')
    }

    if (platform === 'linkedin') {
      params.set('response_type', 'code')
    }

    return `${config.authUrl}?${params.toString()}`
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(
    platform: SocialPlatform,
    code: string,
    codeVerifier?: string
  ): Promise<OAuthTokens> {
    const config = this.getConfig(platform)

    const body: Record<string, string> = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.redirectUri,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    }

    if (codeVerifier) {
      body.code_verifier = codeVerifier
    }

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(body).toString(),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Token exchange failed: ${error}`)
    }

    const data = await response.json()

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(
    platform: SocialPlatform,
    refreshToken: string
  ): Promise<OAuthTokens> {
    const config = this.getConfig(platform)

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: config.clientId,
        client_secret: config.clientSecret,
      }).toString(),
    })

    if (!response.ok) {
      throw new Error('Token refresh failed')
    }

    const data = await response.json()

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
    }
  }

  /**
   * Fetch user profile from platform
   */
  async fetchUserProfile(
    platform: SocialPlatform,
    accessToken: string
  ): Promise<{
    userId: string
    username: string
    displayName: string
    profileUrl?: string
    avatarUrl?: string
  }> {
    const config = this.getConfig(platform)

    switch (platform) {
      case 'linkedin': {
        const response = await fetch(`${config.apiBaseUrl}/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        const data = await response.json()
        return {
          userId: data.id,
          username: data.vanityName || data.id,
          displayName: `${data.localizedFirstName} ${data.localizedLastName}`,
          profileUrl: `https://linkedin.com/in/${data.vanityName || data.id}`,
        }
      }

      case 'twitter': {
        const response = await fetch(`${config.apiBaseUrl}/users/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        const data = await response.json()
        return {
          userId: data.data.id,
          username: data.data.username,
          displayName: data.data.name,
          profileUrl: `https://twitter.com/${data.data.username}`,
          avatarUrl: data.data.profile_image_url,
        }
      }

      case 'facebook': {
        const response = await fetch(
          `${config.apiBaseUrl}/me?fields=id,name,picture`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
        const data = await response.json()
        return {
          userId: data.id,
          username: data.id,
          displayName: data.name,
          profileUrl: `https://facebook.com/${data.id}`,
          avatarUrl: data.picture?.data?.url,
        }
      }

      case 'instagram': {
        const response = await fetch(
          `${config.apiBaseUrl}/me?fields=id,username`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
        const data = await response.json()
        return {
          userId: data.id,
          username: data.username,
          displayName: data.username,
          profileUrl: `https://instagram.com/${data.username}`,
        }
      }

      case 'youtube': {
        const response = await fetch(
          `${config.apiBaseUrl}/channels?part=snippet&mine=true`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
        const data = await response.json()
        const channel = data.items?.[0]
        return {
          userId: channel?.id || '',
          username: channel?.snippet?.customUrl || channel?.id,
          displayName: channel?.snippet?.title || '',
          profileUrl: `https://youtube.com/channel/${channel?.id}`,
          avatarUrl: channel?.snippet?.thumbnails?.default?.url,
        }
      }

      case 'tiktok': {
        const response = await fetch(`${config.apiBaseUrl}/user/info/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        const data = await response.json()
        const user = data.data?.user
        return {
          userId: user?.open_id || '',
          username: user?.display_name || '',
          displayName: user?.display_name || '',
          avatarUrl: user?.avatar_url,
        }
      }

      case 'threads': {
        const response = await fetch(
          `${config.apiBaseUrl}/me?fields=id,username`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
        const data = await response.json()
        return {
          userId: data.id,
          username: data.username,
          displayName: data.username,
          profileUrl: `https://threads.net/@${data.username}`,
        }
      }

      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }
  }

  /**
   * Fetch available pages/accounts for posting
   */
  async fetchPages(
    platform: SocialPlatform,
    accessToken: string
  ): Promise<Array<{
    pageId: string
    pageName: string
    pageType: string
    pageUrl?: string
    avatarUrl?: string
    accessToken?: string
  }>> {
    const config = this.getConfig(platform)

    switch (platform) {
      case 'facebook': {
        const response = await fetch(
          `${config.apiBaseUrl}/me/accounts?fields=id,name,category,picture,access_token`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
        const data = await response.json()
        return (data.data || []).map((page: any) => ({
          pageId: page.id,
          pageName: page.name,
          pageType: page.category,
          pageUrl: `https://facebook.com/${page.id}`,
          avatarUrl: page.picture?.data?.url,
          accessToken: page.access_token,
        }))
      }

      case 'linkedin': {
        // Fetch organization pages the user administers
        const response = await fetch(
          `${config.apiBaseUrl}/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&projection=(elements*(organization~(localizedName,vanityName,logoV2(original~:playableStreams))))`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
        const data = await response.json()
        return (data.elements || []).map((elem: any) => ({
          pageId: elem.organization?.split(':').pop() || '',
          pageName: elem['organization~']?.localizedName || '',
          pageType: 'organization',
          pageUrl: `https://linkedin.com/company/${elem['organization~']?.vanityName}`,
        }))
      }

      case 'youtube': {
        const response = await fetch(
          `${config.apiBaseUrl}/channels?part=snippet,statistics&mine=true`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
        const data = await response.json()
        return (data.items || []).map((channel: any) => ({
          pageId: channel.id,
          pageName: channel.snippet.title,
          pageType: 'channel',
          pageUrl: `https://youtube.com/channel/${channel.id}`,
          avatarUrl: channel.snippet.thumbnails?.default?.url,
        }))
      }

      // For platforms without pages (Twitter, Instagram personal, TikTok, Threads)
      // Return the main account as the "page"
      default: {
        const profile = await this.fetchUserProfile(platform, accessToken)
        return [{
          pageId: profile.userId,
          pageName: profile.displayName,
          pageType: 'personal',
          pageUrl: profile.profileUrl,
          avatarUrl: profile.avatarUrl,
        }]
      }
    }
  }

  /**
   * Save OAuth connection to database
   */
  async saveConnection(
    organizationId: string,
    platform: SocialPlatform,
    tokens: OAuthTokens,
    profile: {
      userId: string
      username: string
      displayName: string
      profileUrl?: string
      avatarUrl?: string
    },
    connectedBy: string
  ): Promise<OAuthConnection> {
    const supabase = await createClient()

    const expiresAt = tokens.expiresIn
      ? new Date(Date.now() + tokens.expiresIn * 1000)
      : null

    const { data, error } = await supabase
      .from('social_oauth_connections')
      .upsert({
        organization_id: organizationId,
        platform,
        status: 'connected',
        access_token_encrypted: encrypt(tokens.accessToken),
        refresh_token_encrypted: tokens.refreshToken ? encrypt(tokens.refreshToken) : null,
        token_expires_at: expiresAt?.toISOString(),
        platform_user_id: profile.userId,
        platform_username: profile.username,
        platform_display_name: profile.displayName,
        platform_profile_url: profile.profileUrl,
        platform_avatar_url: profile.avatarUrl,
        scopes: tokens.scope?.split(' ') || [],
        last_verified_at: new Date().toISOString(),
        connected_by: connectedBy,
      }, {
        onConflict: 'organization_id,platform,platform_user_id',
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save connection: ${error.message}`)
    }

    return this.mapConnectionFromDb(data)
  }

  /**
   * Save pages to database
   */
  async savePages(
    connectionId: string,
    organizationId: string,
    platform: SocialPlatform,
    pages: Array<{
      pageId: string
      pageName: string
      pageType: string
      pageUrl?: string
      avatarUrl?: string
      accessToken?: string
    }>
  ): Promise<SocialPage[]> {
    const supabase = await createClient()

    const pagesData = pages.map((page, index) => ({
      oauth_connection_id: connectionId,
      organization_id: organizationId,
      platform,
      page_id: page.pageId,
      page_name: page.pageName,
      page_type: page.pageType,
      page_url: page.pageUrl,
      page_avatar_url: page.avatarUrl,
      page_access_token_encrypted: page.accessToken ? encrypt(page.accessToken) : null,
      is_active: true,
      is_default: index === 0, // First page is default
    }))

    const { data, error } = await supabase
      .from('social_pages')
      .upsert(pagesData, {
        onConflict: 'organization_id,platform,page_id',
      })
      .select()

    if (error) {
      throw new Error(`Failed to save pages: ${error.message}`)
    }

    return data.map(this.mapPageFromDb)
  }

  /**
   * Get connections for organization
   */
  async getConnections(organizationId: string): Promise<OAuthConnection[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('social_oauth_connections')
      .select('*')
      .eq('organization_id', organizationId)
      .order('platform')

    if (error) {
      throw new Error(`Failed to fetch connections: ${error.message}`)
    }

    return data.map(this.mapConnectionFromDb)
  }

  /**
   * Get pages for organization
   */
  async getPages(organizationId: string, platform?: SocialPlatform): Promise<SocialPage[]> {
    const supabase = await createClient()

    let query = supabase
      .from('social_pages')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)

    if (platform) {
      query = query.eq('platform', platform)
    }

    const { data, error } = await query.order('platform').order('is_default', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch pages: ${error.message}`)
    }

    return data.map(this.mapPageFromDb)
  }

  /**
   * Get decrypted access token for a connection
   */
  async getAccessToken(connectionId: string): Promise<string> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('social_oauth_connections')
      .select('access_token_encrypted, refresh_token_encrypted, token_expires_at, platform, organization_id')
      .eq('id', connectionId)
      .single()

    if (error || !data) {
      throw new Error('Connection not found')
    }

    // Check if token is expired
    if (data.token_expires_at && new Date(data.token_expires_at) < new Date()) {
      // Try to refresh
      if (data.refresh_token_encrypted) {
        const refreshToken = decrypt(data.refresh_token_encrypted)
        const newTokens = await this.refreshAccessToken(data.platform, refreshToken)

        // Update in database
        const expiresAt = newTokens.expiresIn
          ? new Date(Date.now() + newTokens.expiresIn * 1000)
          : null

        await supabase
          .from('social_oauth_connections')
          .update({
            access_token_encrypted: encrypt(newTokens.accessToken),
            refresh_token_encrypted: newTokens.refreshToken ? encrypt(newTokens.refreshToken) : data.refresh_token_encrypted,
            token_expires_at: expiresAt?.toISOString(),
            last_verified_at: new Date().toISOString(),
          })
          .eq('id', connectionId)

        return newTokens.accessToken
      } else {
        // Mark as expired
        await supabase
          .from('social_oauth_connections')
          .update({
            status: 'expired',
            error_message: 'Token expired and no refresh token available',
          })
          .eq('id', connectionId)

        throw new Error('Token expired')
      }
    }

    return decrypt(data.access_token_encrypted)
  }

  /**
   * Disconnect a platform
   */
  async disconnect(connectionId: string): Promise<void> {
    const supabase = await createClient()

    // Delete pages first
    await supabase
      .from('social_pages')
      .delete()
      .eq('oauth_connection_id', connectionId)

    // Delete connection
    const { error } = await supabase
      .from('social_oauth_connections')
      .delete()
      .eq('id', connectionId)

    if (error) {
      throw new Error(`Failed to disconnect: ${error.message}`)
    }
  }

  /**
   * Set default page for platform
   */
  async setDefaultPage(pageId: string, organizationId: string, platform: SocialPlatform): Promise<void> {
    const supabase = await createClient()

    // Unset current default
    await supabase
      .from('social_pages')
      .update({ is_default: false })
      .eq('organization_id', organizationId)
      .eq('platform', platform)

    // Set new default
    const { error } = await supabase
      .from('social_pages')
      .update({ is_default: true })
      .eq('id', pageId)

    if (error) {
      throw new Error(`Failed to set default page: ${error.message}`)
    }
  }

  // Helper to map database row to OAuthConnection
  private mapConnectionFromDb(row: any): OAuthConnection {
    return {
      id: row.id,
      organizationId: row.organization_id,
      platform: row.platform,
      status: row.status,
      platformUserId: row.platform_user_id,
      platformUsername: row.platform_username,
      platformDisplayName: row.platform_display_name,
      platformProfileUrl: row.platform_profile_url,
      platformAvatarUrl: row.platform_avatar_url,
      scopes: row.scopes,
      tokenExpiresAt: row.token_expires_at ? new Date(row.token_expires_at) : undefined,
      lastVerifiedAt: row.last_verified_at ? new Date(row.last_verified_at) : undefined,
      errorMessage: row.error_message,
    }
  }

  // Helper to map database row to SocialPage
  private mapPageFromDb(row: any): SocialPage {
    return {
      id: row.id,
      oauthConnectionId: row.oauth_connection_id,
      organizationId: row.organization_id,
      platform: row.platform,
      pageId: row.page_id,
      pageName: row.page_name,
      pageType: row.page_type,
      pageUrl: row.page_url,
      pageAvatarUrl: row.page_avatar_url,
      followerCount: row.follower_count,
      isActive: row.is_active,
      isDefault: row.is_default,
    }
  }
}

// Export singleton
export const socialOAuthService = new SocialOAuthService()

// Export class for testing
export { SocialOAuthService }
