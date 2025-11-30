/**
 * Communications Intelligence Service
 *
 * Agentic service that provides context-aware communications capabilities.
 * This service knows your organization, upcoming events, past performance,
 * and continuously learns to improve communications.
 *
 * Features:
 * - Organization context awareness (brand voice, values, team)
 * - Upcoming events knowledge (workshops, launches, campaigns)
 * - Historical performance learning (what content performs best)
 * - Audience segmentation intelligence
 * - Optimal timing recommendations
 * - Cross-channel coordination
 * - Proactive content suggestions
 */

import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface OrganizationContext {
  id: string
  name: string
  brandVoice: string
  values: string[]
  industry: string
  targetAudience: string[]
  teamMembers: { name: string; role: string; bio?: string }[]
  socialHandles: Record<string, string>
  website: string
  tagline?: string
  missionStatement?: string
}

export interface UpcomingEvent {
  id: string
  type: 'workshop' | 'webinar' | 'course_launch' | 'campaign' | 'milestone'
  title: string
  description: string
  date: string
  time?: string
  timezone?: string
  registrationUrl?: string
  targetAudience?: string[]
  keyMessages?: string[]
  promotionStatus: 'not_started' | 'in_progress' | 'completed'
  daysUntil: number
}

export interface ContentPerformance {
  platform: string
  contentType: string
  engagementRate: number
  bestPostingTimes: string[]
  topHashtags: string[]
  audienceGrowth: number
  topPerformingContent: { content: string; metrics: Record<string, number> }[]
}

export interface CommunicationSuggestion {
  type: 'social_post' | 'email' | 'newsletter' | 'workshop_announcement'
  urgency: 'immediate' | 'soon' | 'scheduled'
  reason: string
  suggestedContent: string
  relatedEvent?: UpcomingEvent
  platforms?: string[]
  scheduledFor?: string
}

export interface AgentContext {
  organization: OrganizationContext
  upcomingEvents: UpcomingEvent[]
  contentPerformance: ContentPerformance[]
  recentCommunications: { platform: string; content: string; sentAt: string; engagement: number }[]
  audienceInsights: { segment: string; preferences: string[]; bestChannels: string[] }[]
  currentDate: string
  timezone: string
}

class CommunicationsIntelligenceService {
  /**
   * Get full context for an organization - everything the AI needs to know
   */
  async getOrganizationContext(organizationId: string): Promise<AgentContext> {
    const supabase = await createClient()
    const now = new Date()

    // Fetch organization details
    const { data: org } = await supabase
      .from('organizations')
      .select(`
        *,
        organization_settings (
          brand_voice,
          values,
          mission_statement,
          tagline,
          target_audience
        )
      `)
      .eq('id', organizationId)
      .single()

    // Fetch team members
    const { data: teamMembers } = await supabase
      .from('profiles')
      .select('id, full_name, role, bio')
      .eq('organization_id', organizationId)
      .eq('is_active', true)

    // Fetch social connections
    const { data: socialConnections } = await supabase
      .from('social_connections')
      .select('platform, handle, is_connected')
      .eq('organization_id', organizationId)
      .eq('is_connected', true)

    // Fetch upcoming workshops/events (next 60 days)
    const futureDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
    const { data: workshops } = await supabase
      .from('workshops')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('date', now.toISOString().split('T')[0])
      .lte('date', futureDate.toISOString().split('T')[0])
      .eq('status', 'published')
      .order('date', { ascending: true })

    // Fetch scheduled campaigns
    const { data: campaigns } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('scheduled_at', now.toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(10)

    // Fetch recent social posts performance
    const { data: recentPosts } = await supabase
      .from('social_posts')
      .select('*')
      .eq('organization_id', organizationId)
      .order('posted_at', { ascending: false })
      .limit(50)

    // Fetch audience segments
    const { data: audienceSegments } = await supabase
      .from('audience_segments')
      .select('*')
      .eq('organization_id', organizationId)

    // Build organization context
    const organization: OrganizationContext = {
      id: org?.id || organizationId,
      name: org?.name || 'Your Organization',
      brandVoice: org?.organization_settings?.brand_voice || 'Professional yet approachable',
      values: org?.organization_settings?.values || ['Innovation', 'Excellence', 'Integrity'],
      industry: org?.industry || 'AI Transformation',
      targetAudience: org?.organization_settings?.target_audience || ['Business Leaders', 'HR Professionals', 'Tech Decision Makers'],
      teamMembers: (teamMembers || []).map((m) => ({
        name: m.full_name || 'Team Member',
        role: m.role || 'Team',
        bio: m.bio,
      })),
      socialHandles: (socialConnections || []).reduce((acc, conn) => {
        acc[conn.platform] = conn.handle
        return acc
      }, {} as Record<string, string>),
      website: org?.website || '',
      tagline: org?.organization_settings?.tagline,
      missionStatement: org?.organization_settings?.mission_statement,
    }

    // Build upcoming events with days until calculation
    const upcomingEvents: UpcomingEvent[] = [
      ...(workshops || []).map((w) => ({
        id: w.id,
        type: 'workshop' as const,
        title: w.title,
        description: w.description,
        date: w.date,
        time: w.time,
        timezone: w.timezone,
        registrationUrl: w.registration_url,
        targetAudience: w.target_audience,
        keyMessages: w.key_messages,
        promotionStatus: this.getPromotionStatus(w),
        daysUntil: Math.ceil((new Date(w.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      })),
      ...(campaigns || []).map((c) => ({
        id: c.id,
        type: 'campaign' as const,
        title: c.name,
        description: c.description || '',
        date: c.scheduled_at,
        promotionStatus: c.status as 'not_started' | 'in_progress' | 'completed',
        daysUntil: Math.ceil((new Date(c.scheduled_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      })),
    ].sort((a, b) => a.daysUntil - b.daysUntil)

    // Calculate content performance by platform
    const contentPerformance = this.calculateContentPerformance(recentPosts || [])

    // Recent communications
    const recentCommunications = (recentPosts || []).slice(0, 20).map((p) => ({
      platform: p.platform,
      content: p.content,
      sentAt: p.posted_at,
      engagement: p.likes + p.shares + p.comments || 0,
    }))

    // Audience insights
    const audienceInsights = (audienceSegments || []).map((seg) => ({
      segment: seg.name,
      preferences: seg.preferences || [],
      bestChannels: seg.preferred_channels || [],
    }))

    return {
      organization,
      upcomingEvents,
      contentPerformance,
      recentCommunications,
      audienceInsights,
      currentDate: now.toISOString(),
      timezone: 'America/Los_Angeles',
    }
  }

  /**
   * Generate proactive communication suggestions based on context
   */
  async generateProactiveSuggestions(organizationId: string): Promise<CommunicationSuggestion[]> {
    const context = await this.getOrganizationContext(organizationId)
    const suggestions: CommunicationSuggestion[] = []

    // Check upcoming events needing promotion
    for (const event of context.upcomingEvents) {
      if (event.promotionStatus === 'not_started' && event.daysUntil <= 14) {
        // Event needs promotion!
        suggestions.push({
          type: 'social_post',
          urgency: event.daysUntil <= 3 ? 'immediate' : 'soon',
          reason: `${event.title} is in ${event.daysUntil} days and hasn't been promoted yet`,
          suggestedContent: await this.generateEventPromotion(event, context),
          relatedEvent: event,
          platforms: ['linkedin', 'twitter'],
        })
      }

      // 7 days before - send reminder email
      if (event.daysUntil === 7 && event.type === 'workshop') {
        suggestions.push({
          type: 'email',
          urgency: 'soon',
          reason: `${event.title} is in 1 week - time for a reminder email`,
          suggestedContent: await this.generateEventReminder(event, context),
          relatedEvent: event,
        })
      }

      // 1 day before - final reminder
      if (event.daysUntil === 1) {
        suggestions.push({
          type: 'social_post',
          urgency: 'immediate',
          reason: `${event.title} is TOMORROW - final push needed`,
          suggestedContent: await this.generateLastCallContent(event, context),
          relatedEvent: event,
          platforms: ['linkedin', 'twitter', 'facebook'],
        })
      }
    }

    // Check if it's been too long since last post
    const lastPost = context.recentCommunications[0]
    if (lastPost) {
      const daysSinceLastPost = Math.floor(
        (new Date().getTime() - new Date(lastPost.sentAt).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysSinceLastPost >= 3) {
        suggestions.push({
          type: 'social_post',
          urgency: daysSinceLastPost >= 7 ? 'immediate' : 'soon',
          reason: `It's been ${daysSinceLastPost} days since your last social post`,
          suggestedContent: await this.generateEngagementContent(context),
          platforms: ['linkedin'],
        })
      }
    }

    return suggestions.sort((a, b) => {
      const urgencyOrder = { immediate: 0, soon: 1, scheduled: 2 }
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
    })
  }

  /**
   * Generate social content with full context awareness
   */
  async generateSocialContent(
    organizationId: string,
    request: {
      topic?: string
      platforms: string[]
      tone?: string
      includeHashtags?: boolean
      includeCTA?: boolean
      relatedEventId?: string
    }
  ): Promise<{
    content: string
    hashtags: string[]
    mentions: string[]
    suggestedTiming: string
    platformVariants: Record<string, string>
  }> {
    const context = await this.getOrganizationContext(organizationId)

    // Find related event if specified
    const relatedEvent = request.relatedEventId
      ? context.upcomingEvents.find((e) => e.id === request.relatedEventId)
      : undefined

    const systemPrompt = `You are the communications AI for ${context.organization.name}.
You have deep knowledge of this organization:

BRAND VOICE: ${context.organization.brandVoice}
VALUES: ${context.organization.values.join(', ')}
INDUSTRY: ${context.organization.industry}
TARGET AUDIENCE: ${context.organization.targetAudience.join(', ')}
MISSION: ${context.organization.missionStatement || 'Transform businesses through AI'}

UPCOMING EVENTS (next 2 months):
${context.upcomingEvents.map((e) => `- ${e.title} (${e.type}) - ${e.daysUntil} days away`).join('\n')}

TOP PERFORMING CONTENT INSIGHTS:
${context.contentPerformance.map((p) => `- ${p.platform}: Best times ${p.bestPostingTimes.join(', ')}, Top hashtags: ${p.topHashtags.join(', ')}`).join('\n')}

Generate content that:
1. Matches the brand voice perfectly
2. Resonates with the target audience
3. Incorporates proven high-performing elements
4. References upcoming events when relevant
5. Uses optimal hashtags for reach`

    const userPrompt = `Generate a ${request.platforms.join('/')} post about: ${request.topic || 'AI transformation and business value'}
${relatedEvent ? `\nRelated event to promote: ${relatedEvent.title} - ${relatedEvent.description}\nRegistration: ${relatedEvent.registrationUrl}` : ''}
${request.tone ? `\nTone: ${request.tone}` : ''}
${request.includeCTA ? '\nInclude a clear call-to-action' : ''}

Return JSON with:
- content: main post text
- hashtags: array of relevant hashtags (without #)
- suggestedTiming: best time to post
- platformVariants: object with platform-specific versions if needed`

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')

      return {
        content: result.content || '',
        hashtags: result.hashtags || [],
        mentions: result.mentions || [],
        suggestedTiming: result.suggestedTiming || '9:00 AM PST',
        platformVariants: result.platformVariants || {},
      }
    } catch (error) {
      console.error('Error generating social content:', error)
      return {
        content: '',
        hashtags: [],
        mentions: [],
        suggestedTiming: '',
        platformVariants: {},
      }
    }
  }

  /**
   * Generate email content with context
   */
  async generateEmailContent(
    organizationId: string,
    request: {
      type: 'promotional' | 'newsletter' | 'reminder' | 'announcement'
      topic?: string
      audienceSegment?: string
      relatedEventId?: string
    }
  ): Promise<{
    subject: string
    preheader: string
    body: string
    ctaText: string
    ctaUrl: string
  }> {
    const context = await this.getOrganizationContext(organizationId)
    const relatedEvent = request.relatedEventId
      ? context.upcomingEvents.find((e) => e.id === request.relatedEventId)
      : undefined

    const audienceInsight = request.audienceSegment
      ? context.audienceInsights.find((a) => a.segment === request.audienceSegment)
      : undefined

    const systemPrompt = `You are crafting emails for ${context.organization.name}.

BRAND VOICE: ${context.organization.brandVoice}
WRITING STYLE: Professional, value-focused, concise
TARGET: ${audienceInsight ? `${audienceInsight.segment} - preferences: ${audienceInsight.preferences.join(', ')}` : context.organization.targetAudience.join(', ')}

Create emails that:
1. Have compelling subject lines (under 50 chars)
2. Use personalization tokens like {{first_name}}
3. Clearly communicate value
4. Have one clear CTA
5. Match the brand voice`

    const userPrompt = `Generate a ${request.type} email about: ${request.topic || relatedEvent?.title || 'upcoming opportunities'}
${relatedEvent ? `\nEvent details:\n- Title: ${relatedEvent.title}\n- Date: ${relatedEvent.date}\n- Description: ${relatedEvent.description}\n- Registration: ${relatedEvent.registrationUrl}` : ''}

Return JSON with: subject, preheader, body (HTML), ctaText, ctaUrl`

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')

      return {
        subject: result.subject || '',
        preheader: result.preheader || '',
        body: result.body || '',
        ctaText: result.ctaText || 'Learn More',
        ctaUrl: result.ctaUrl || relatedEvent?.registrationUrl || context.organization.website,
      }
    } catch (error) {
      console.error('Error generating email content:', error)
      return { subject: '', preheader: '', body: '', ctaText: '', ctaUrl: '' }
    }
  }

  /**
   * Learn from communication performance
   */
  async recordPerformance(
    organizationId: string,
    communication: {
      type: 'social' | 'email' | 'newsletter'
      platform?: string
      content: string
      sentAt: string
      metrics: {
        opens?: number
        clicks?: number
        likes?: number
        shares?: number
        comments?: number
        conversions?: number
      }
    }
  ): Promise<void> {
    const supabase = await createClient()

    // Store performance data for learning
    await supabase.from('communication_performance').insert({
      organization_id: organizationId,
      type: communication.type,
      platform: communication.platform,
      content: communication.content,
      sent_at: communication.sentAt,
      metrics: communication.metrics,
      // Extract features for ML
      content_length: communication.content.length,
      has_emoji: /[\u{1F300}-\u{1F9FF}]/u.test(communication.content),
      has_question: communication.content.includes('?'),
      has_hashtags: communication.content.includes('#'),
      has_mentions: communication.content.includes('@'),
      day_of_week: new Date(communication.sentAt).getDay(),
      hour_of_day: new Date(communication.sentAt).getHours(),
    })

    // Update aggregate performance stats
    await this.updatePerformanceAggregates(organizationId, communication)
  }

  // Private helper methods

  private getPromotionStatus(
    workshop: Record<string, unknown>
  ): 'not_started' | 'in_progress' | 'completed' {
    // Check if workshop has been promoted
    if (workshop.promotion_completed) return 'completed'
    if (workshop.promotion_started) return 'in_progress'
    return 'not_started'
  }

  private calculateContentPerformance(posts: Record<string, unknown>[]): ContentPerformance[] {
    // Type for social post data
    interface SocialPost {
      platform: string
      content: string
      posted_at: string
      likes: number
      shares: number
      comments: number
    }

    // Group posts by platform with proper typing
    const byPlatform: Record<string, SocialPost[]> = {}
    for (const post of posts) {
      const platform = (post.platform as string) || 'unknown'
      const socialPost: SocialPost = {
        platform,
        content: (post.content as string) || '',
        posted_at: (post.posted_at as string) || '',
        likes: (post.likes as number) || 0,
        shares: (post.shares as number) || 0,
        comments: (post.comments as number) || 0,
      }
      if (!byPlatform[platform]) {
        byPlatform[platform] = []
      }
      byPlatform[platform].push(socialPost)
    }

    return Object.entries(byPlatform).map(([platform, platformPosts]) => {
      const totalEngagement = platformPosts.reduce(
        (sum, p) => sum + p.likes + p.shares + p.comments,
        0
      )

      // Extract hashtags and their performance
      const hashtagPerformance: Record<string, number> = {}
      platformPosts.forEach((p) => {
        const hashtags = (p.content || '').match(/#\w+/g) || []
        const engagement = p.likes + p.shares + p.comments
        hashtags.forEach((tag) => {
          hashtagPerformance[tag] = (hashtagPerformance[tag] || 0) + engagement
        })
      })

      const topHashtags = Object.entries(hashtagPerformance)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tag]) => tag.replace('#', ''))

      // Calculate best posting times
      const hourPerformance: Record<number, number[]> = {}
      platformPosts.forEach((p) => {
        if (p.posted_at) {
          const hour = new Date(p.posted_at).getHours()
          const engagement = p.likes + p.shares + p.comments
          if (!hourPerformance[hour]) hourPerformance[hour] = []
          hourPerformance[hour].push(engagement)
        }
      })

      const bestHours = Object.entries(hourPerformance)
        .map(([hour, engagements]) => ({
          hour: parseInt(hour),
          avgEngagement: engagements.reduce((a, b) => a + b, 0) / engagements.length,
        }))
        .sort((a, b) => b.avgEngagement - a.avgEngagement)
        .slice(0, 3)
        .map((h) => `${h.hour}:00`)

      return {
        platform,
        contentType: 'mixed',
        engagementRate: platformPosts.length > 0 ? totalEngagement / platformPosts.length : 0,
        bestPostingTimes: bestHours.length > 0 ? bestHours : ['9:00', '12:00', '17:00'],
        topHashtags,
        audienceGrowth: 0, // Would need historical data
        topPerformingContent: platformPosts
          .sort((a, b) => (b.likes + b.shares) - (a.likes + a.shares))
          .slice(0, 3)
          .map((p) => ({
            content: p.content || '',
            metrics: {
              likes: p.likes,
              shares: p.shares,
              comments: p.comments,
            },
          })),
      }
    })
  }

  private async generateEventPromotion(
    event: UpcomingEvent,
    context: AgentContext
  ): Promise<string> {
    const result = await this.generateSocialContent(context.organization.id, {
      topic: `Promote our upcoming ${event.type}: ${event.title}`,
      platforms: ['linkedin', 'twitter'],
      includeCTA: true,
      relatedEventId: event.id,
    })
    return result.content
  }

  private async generateEventReminder(
    event: UpcomingEvent,
    context: AgentContext
  ): Promise<string> {
    const result = await this.generateEmailContent(context.organization.id, {
      type: 'reminder',
      topic: `Reminder: ${event.title} is coming up`,
      relatedEventId: event.id,
    })
    return result.body
  }

  private async generateLastCallContent(
    event: UpcomingEvent,
    context: AgentContext
  ): Promise<string> {
    const result = await this.generateSocialContent(context.organization.id, {
      topic: `LAST CALL: ${event.title} is TOMORROW! Don't miss out.`,
      platforms: ['linkedin', 'twitter'],
      tone: 'urgent but professional',
      includeCTA: true,
      relatedEventId: event.id,
    })
    return result.content
  }

  private async generateEngagementContent(context: AgentContext): Promise<string> {
    // Generate content based on what's performed well
    const topContent = context.contentPerformance
      .flatMap((p) => p.topPerformingContent)
      .sort((a, b) => b.metrics.likes + b.metrics.shares - a.metrics.likes - a.metrics.shares)[0]

    const result = await this.generateSocialContent(context.organization.id, {
      topic: topContent
        ? `Create something similar in theme to: ${topContent.content.substring(0, 100)}`
        : 'Share valuable AI transformation insights',
      platforms: ['linkedin'],
      includeCTA: true,
    })
    return result.content
  }

  private async updatePerformanceAggregates(
    organizationId: string,
    communication: {
      type: string
      platform?: string
      metrics: Record<string, number>
    }
  ): Promise<void> {
    const supabase = await createClient()

    // Update rolling averages and stats
    const { data: existing } = await supabase
      .from('communication_aggregates')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('type', communication.type)
      .eq('platform', communication.platform || 'all')
      .single()

    const totalEngagement = Object.values(communication.metrics).reduce((a, b) => a + b, 0)

    if (existing) {
      await supabase
        .from('communication_aggregates')
        .update({
          total_sends: existing.total_sends + 1,
          total_engagement: existing.total_engagement + totalEngagement,
          avg_engagement: (existing.total_engagement + totalEngagement) / (existing.total_sends + 1),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
    } else {
      await supabase.from('communication_aggregates').insert({
        organization_id: organizationId,
        type: communication.type,
        platform: communication.platform || 'all',
        total_sends: 1,
        total_engagement: totalEngagement,
        avg_engagement: totalEngagement,
      })
    }
  }
}

export const communicationsIntelligence = new CommunicationsIntelligenceService()
