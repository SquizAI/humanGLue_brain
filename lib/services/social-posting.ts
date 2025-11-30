/**
 * Social Media Posting Service
 *
 * Handles posting content to all connected social platforms
 */

import { createClient } from '@/lib/supabase/server'
import { socialOAuthService, SocialPlatform } from './social-oauth'

export interface PostContent {
  text: string
  mediaUrls?: string[]
  link?: string
  linkTitle?: string
  linkDescription?: string
}

export interface PostResult {
  platform: SocialPlatform
  pageId: string
  success: boolean
  postId?: string
  postUrl?: string
  error?: string
}

export interface ScheduledPost {
  id: string
  organizationId: string
  content: PostContent
  targetPlatforms: SocialPlatform[]
  targetPageIds?: string[]
  scheduledAt: Date
  status: 'scheduled' | 'publishing' | 'published' | 'failed'
}

class SocialPostingService {
  /**
   * Post content to a specific platform
   */
  async postToplatform(
    platform: SocialPlatform,
    accessToken: string,
    content: PostContent,
    pageId?: string,
    pageAccessToken?: string
  ): Promise<{ postId?: string; postUrl?: string }> {
    switch (platform) {
      case 'linkedin':
        return this.postToLinkedIn(accessToken, content, pageId)

      case 'twitter':
        return this.postToTwitter(accessToken, content)

      case 'facebook':
        return this.postToFacebook(pageAccessToken || accessToken, content, pageId)

      case 'instagram':
        return this.postToInstagram(accessToken, content)

      case 'threads':
        return this.postToThreads(accessToken, content)

      default:
        throw new Error(`Posting to ${platform} is not yet supported`)
    }
  }

  /**
   * Post to LinkedIn
   */
  private async postToLinkedIn(
    accessToken: string,
    content: PostContent,
    organizationId?: string
  ): Promise<{ postId?: string; postUrl?: string }> {
    // Get author URN (person or organization)
    let authorUrn: string

    if (organizationId) {
      authorUrn = `urn:li:organization:${organizationId}`
    } else {
      // Get user's URN
      const userResponse = await fetch('https://api.linkedin.com/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const userData = await userResponse.json()
      authorUrn = `urn:li:person:${userData.id}`
    }

    // Build post payload
    const postPayload: any = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content.text,
          },
          shareMediaCategory: content.mediaUrls?.length ? 'IMAGE' : content.link ? 'ARTICLE' : 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    }

    // Add article if link provided
    if (content.link && !content.mediaUrls?.length) {
      postPayload.specificContent['com.linkedin.ugc.ShareContent'].media = [{
        status: 'READY',
        originalUrl: content.link,
        title: { text: content.linkTitle || '' },
        description: { text: content.linkDescription || '' },
      }]
    }

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(postPayload),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`LinkedIn post failed: ${error}`)
    }

    const result = await response.json()
    const postId = result.id

    return {
      postId,
      postUrl: `https://www.linkedin.com/feed/update/${postId}`,
    }
  }

  /**
   * Post to Twitter/X
   */
  private async postToTwitter(
    accessToken: string,
    content: PostContent
  ): Promise<{ postId?: string; postUrl?: string }> {
    const payload: any = {
      text: content.text,
    }

    // Add media if provided (would need separate upload step)
    // Twitter requires uploading media first via media upload endpoint

    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Twitter post failed: ${error}`)
    }

    const result = await response.json()

    // Get username for URL
    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const userData = await userResponse.json()

    return {
      postId: result.data.id,
      postUrl: `https://twitter.com/${userData.data.username}/status/${result.data.id}`,
    }
  }

  /**
   * Post to Facebook Page
   */
  private async postToFacebook(
    accessToken: string,
    content: PostContent,
    pageId?: string
  ): Promise<{ postId?: string; postUrl?: string }> {
    if (!pageId) {
      throw new Error('Page ID required for Facebook posting')
    }

    const payload: any = {
      message: content.text,
      access_token: accessToken,
    }

    if (content.link) {
      payload.link = content.link
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/feed`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Facebook post failed: ${error}`)
    }

    const result = await response.json()

    return {
      postId: result.id,
      postUrl: `https://facebook.com/${result.id}`,
    }
  }

  /**
   * Post to Instagram (requires Business/Creator account)
   */
  private async postToInstagram(
    accessToken: string,
    content: PostContent
  ): Promise<{ postId?: string; postUrl?: string }> {
    // Instagram API requires image or video
    if (!content.mediaUrls?.length) {
      throw new Error('Instagram requires at least one image or video')
    }

    // Get Instagram Business Account ID
    const accountResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?fields=instagram_business_account&access_token=${accessToken}`
    )
    const accountData = await accountResponse.json()
    const igAccountId = accountData.data?.[0]?.instagram_business_account?.id

    if (!igAccountId) {
      throw new Error('No Instagram Business account connected')
    }

    // Create media container
    const containerResponse = await fetch(
      `https://graph.facebook.com/v18.0/${igAccountId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: content.mediaUrls[0],
          caption: content.text,
          access_token: accessToken,
        }),
      }
    )

    const containerData = await containerResponse.json()

    if (!containerData.id) {
      throw new Error('Failed to create Instagram media container')
    }

    // Publish media
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${igAccountId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerData.id,
          access_token: accessToken,
        }),
      }
    )

    const publishData = await publishResponse.json()

    return {
      postId: publishData.id,
      postUrl: `https://instagram.com/p/${publishData.id}`,
    }
  }

  /**
   * Post to Threads
   */
  private async postToThreads(
    accessToken: string,
    content: PostContent
  ): Promise<{ postId?: string; postUrl?: string }> {
    // Get user ID
    const userResponse = await fetch(
      `https://graph.threads.net/v1.0/me?access_token=${accessToken}`
    )
    const userData = await userResponse.json()

    // Create container
    const containerPayload: any = {
      media_type: content.mediaUrls?.length ? 'IMAGE' : 'TEXT',
      text: content.text,
      access_token: accessToken,
    }

    if (content.mediaUrls?.length) {
      containerPayload.image_url = content.mediaUrls[0]
    }

    const containerResponse = await fetch(
      `https://graph.threads.net/v1.0/${userData.id}/threads`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(containerPayload),
      }
    )

    const containerData = await containerResponse.json()

    // Publish
    const publishResponse = await fetch(
      `https://graph.threads.net/v1.0/${userData.id}/threads_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerData.id,
          access_token: accessToken,
        }),
      }
    )

    const publishData = await publishResponse.json()

    return {
      postId: publishData.id,
      postUrl: `https://threads.net/@${userData.username}/post/${publishData.id}`,
    }
  }

  /**
   * Post to multiple platforms at once
   */
  async postToMultiplePlatforms(
    organizationId: string,
    content: PostContent,
    targetPlatforms: SocialPlatform[],
    targetPageIds?: Record<SocialPlatform, string>
  ): Promise<PostResult[]> {
    const results: PostResult[] = []

    // Get connections and pages for the organization
    const connections = await socialOAuthService.getConnections(organizationId)
    const pages = await socialOAuthService.getPages(organizationId)

    for (const platform of targetPlatforms) {
      const connection = connections.find(
        (c) => c.platform === platform && c.status === 'connected'
      )

      if (!connection) {
        results.push({
          platform,
          pageId: '',
          success: false,
          error: `No connected account for ${platform}`,
        })
        continue
      }

      // Get page if specified or use default
      let targetPage = targetPageIds?.[platform]
        ? pages.find((p) => p.id === targetPageIds[platform])
        : pages.find((p) => p.platform === platform && p.isDefault)

      if (!targetPage) {
        targetPage = pages.find((p) => p.platform === platform)
      }

      try {
        const accessToken = await socialOAuthService.getAccessToken(connection.id)

        const result = await this.postToplatform(
          platform,
          accessToken,
          content,
          targetPage?.pageId,
          undefined // Would get page-specific token if needed
        )

        results.push({
          platform,
          pageId: targetPage?.pageId || '',
          success: true,
          postId: result.postId,
          postUrl: result.postUrl,
        })
      } catch (error) {
        results.push({
          platform,
          pageId: targetPage?.pageId || '',
          success: false,
          error: error instanceof Error ? error.message : 'Post failed',
        })
      }
    }

    return results
  }

  /**
   * Save content to database (for scheduling or drafts)
   */
  async saveContent(
    organizationId: string,
    content: PostContent,
    options: {
      targetPlatforms: SocialPlatform[]
      targetPageIds?: string[]
      scheduledAt?: Date
      status?: 'draft' | 'scheduled' | 'pending_review'
      createdBy: string
    }
  ): Promise<string> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('channel_content')
      .insert({
        organization_id: organizationId,
        channel_type: 'social',
        body: content.text,
        media_urls: content.mediaUrls,
        target_platforms: options.targetPlatforms,
        target_page_ids: options.targetPageIds,
        scheduled_at: options.scheduledAt?.toISOString(),
        status: options.status || 'draft',
        created_by: options.createdBy,
        metadata: {
          link: content.link,
          linkTitle: content.linkTitle,
          linkDescription: content.linkDescription,
        },
      })
      .select('id')
      .single()

    if (error) {
      throw new Error(`Failed to save content: ${error.message}`)
    }

    return data.id
  }

  /**
   * Record publication result
   */
  async recordPublicationResult(
    contentId: string,
    organizationId: string,
    result: PostResult
  ): Promise<void> {
    const supabase = await createClient()

    await supabase.from('publication_results').insert({
      content_id: contentId,
      organization_id: organizationId,
      channel_type: 'social',
      platform: result.platform,
      external_post_id: result.postId,
      external_post_url: result.postUrl,
      status: result.success ? 'published' : 'failed',
      error_message: result.error,
      published_at: result.success ? new Date().toISOString() : null,
    })
  }

  /**
   * Publish saved content
   */
  async publishContent(contentId: string): Promise<PostResult[]> {
    const supabase = await createClient()

    // Get content
    const { data: content, error } = await supabase
      .from('channel_content')
      .select('*')
      .eq('id', contentId)
      .single()

    if (error || !content) {
      throw new Error('Content not found')
    }

    // Update status
    await supabase
      .from('channel_content')
      .update({ status: 'publishing' })
      .eq('id', contentId)

    // Post to platforms
    const results = await this.postToMultiplePlatforms(
      content.organization_id,
      {
        text: content.body,
        mediaUrls: content.media_urls,
        link: content.metadata?.link,
        linkTitle: content.metadata?.linkTitle,
        linkDescription: content.metadata?.linkDescription,
      },
      content.target_platforms,
      undefined // Could map page IDs if needed
    )

    // Record results
    for (const result of results) {
      await this.recordPublicationResult(contentId, content.organization_id, result)
    }

    // Update content status
    const allSucceeded = results.every((r) => r.success)
    const anySucceeded = results.some((r) => r.success)

    await supabase
      .from('channel_content')
      .update({
        status: allSucceeded ? 'published' : anySucceeded ? 'published' : 'failed',
        published_at: anySucceeded ? new Date().toISOString() : null,
      })
      .eq('id', contentId)

    return results
  }
}

// Export singleton
export const socialPostingService = new SocialPostingService()

// Export class for testing
export { SocialPostingService }
