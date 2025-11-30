/**
 * AI Content Generation API
 *
 * Unified endpoint for generating AI-powered content across all channels.
 * Uses the Communications Intelligence Service for context-aware generation.
 *
 * POST /api/communications/generate
 *
 * Supported content types:
 * - social: Social media posts (LinkedIn, Twitter, Facebook, Instagram)
 * - email: Marketing and transactional emails
 * - newsletter: Newsletter content
 * - workshop: Workshop promotion content
 * - blog: Blog posts and articles
 * - announcement: Company announcements
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { communicationsIntelligence } from '@/lib/services/communications-intelligence'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface GenerateContentRequest {
  // Content type to generate
  type: 'social' | 'email' | 'newsletter' | 'workshop' | 'blog' | 'announcement'

  // Organization context
  organizationId: string

  // Content parameters
  topic?: string
  prompt?: string
  tone?: 'professional' | 'casual' | 'urgent' | 'friendly' | 'authoritative' | 'inspirational'
  length?: 'short' | 'medium' | 'long'

  // Platform-specific (for social)
  platforms?: ('linkedin' | 'twitter' | 'facebook' | 'instagram')[]

  // Event-related
  relatedEventId?: string
  relatedEventType?: 'workshop' | 'webinar' | 'course_launch' | 'campaign'

  // Advanced options
  includeHashtags?: boolean
  includeCTA?: boolean
  includeEmoji?: boolean
  targetAudience?: string[]
  keyMessages?: string[]

  // Variations
  generateVariations?: number // 1-5 variations
}

export interface GeneratedContent {
  type: string
  content: string
  variants?: {
    platform?: string
    content: string
    characterCount: number
  }[]
  metadata: {
    hashtags?: string[]
    mentions?: string[]
    suggestedTiming?: string
    estimatedEngagement?: 'low' | 'medium' | 'high'
    characterCount: number
    wordCount: number
  }
  emailMetadata?: {
    subject: string
    preheader: string
    ctaText: string
    ctaUrl: string
  }
}

export interface GenerateContentResponse {
  success: boolean
  content?: GeneratedContent
  variations?: GeneratedContent[]
  suggestions?: string[]
  context?: {
    upcomingEvents: number
    recentPerformance: string
    topHashtags: string[]
  }
  error?: string
}

export async function POST(request: Request): Promise<Response> {
  try {
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body: GenerateContentRequest = await request.json()

    // Validate required fields
    if (!body.type) {
      return NextResponse.json(
        { success: false, error: 'Content type is required' },
        { status: 400 }
      )
    }

    if (!body.organizationId) {
      return NextResponse.json(
        { success: false, error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    // Verify user has access to organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', body.organizationId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json(
        { success: false, error: 'Access denied to organization' },
        { status: 403 }
      )
    }

    // Get organization context for AI generation
    const context = await communicationsIntelligence.getOrganizationContext(body.organizationId)

    // Generate content based on type
    let generatedContent: GeneratedContent
    let variations: GeneratedContent[] = []

    switch (body.type) {
      case 'social':
        generatedContent = await generateSocialContent(body, context)
        break
      case 'email':
        generatedContent = await generateEmailContent(body, context)
        break
      case 'newsletter':
        generatedContent = await generateNewsletterContent(body, context)
        break
      case 'workshop':
        generatedContent = await generateWorkshopContent(body, context)
        break
      case 'blog':
        generatedContent = await generateBlogContent(body, context)
        break
      case 'announcement':
        generatedContent = await generateAnnouncementContent(body, context)
        break
      default:
        return NextResponse.json(
          { success: false, error: `Unsupported content type: ${body.type}` },
          { status: 400 }
        )
    }

    // Generate variations if requested
    if (body.generateVariations && body.generateVariations > 1) {
      for (let i = 1; i < Math.min(body.generateVariations, 5); i++) {
        const variation = await generateVariation(body, context, generatedContent.content)
        variations.push(variation)
      }
    }

    // Build context summary for response
    const contextSummary = {
      upcomingEvents: context.upcomingEvents.length,
      recentPerformance:
        context.contentPerformance.length > 0
          ? `${context.contentPerformance[0].engagementRate.toFixed(1)}% avg engagement`
          : 'No recent data',
      topHashtags: context.contentPerformance.flatMap((p) => p.topHashtags).slice(0, 10),
    }

    // Generate smart suggestions based on context
    const suggestions = generateSmartSuggestions(body, context)

    // Log content generation for analytics
    await logContentGeneration(supabase, {
      organizationId: body.organizationId,
      userId: user.id,
      contentType: body.type,
      topic: body.topic,
      characterCount: generatedContent.metadata.characterCount,
    })

    return NextResponse.json({
      success: true,
      content: generatedContent,
      variations: variations.length > 0 ? variations : undefined,
      suggestions,
      context: contextSummary,
    } as GenerateContentResponse)
  } catch (error) {
    console.error('Error generating content:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate content',
      },
      { status: 500 }
    )
  }
}

// Helper functions for each content type

async function generateSocialContent(
  request: GenerateContentRequest,
  context: Awaited<ReturnType<typeof communicationsIntelligence.getOrganizationContext>>
): Promise<GeneratedContent> {
  const result = await communicationsIntelligence.generateSocialContent(request.organizationId, {
    topic: request.topic,
    platforms: request.platforms || ['linkedin'],
    tone: request.tone,
    includeHashtags: request.includeHashtags ?? true,
    includeCTA: request.includeCTA ?? true,
    relatedEventId: request.relatedEventId,
  })

  const variants =
    request.platforms && request.platforms.length > 1
      ? Object.entries(result.platformVariants || {}).map(([platform, content]) => ({
          platform,
          content,
          characterCount: content.length,
        }))
      : undefined

  return {
    type: 'social',
    content: result.content,
    variants,
    metadata: {
      hashtags: result.hashtags,
      mentions: result.mentions,
      suggestedTiming: result.suggestedTiming,
      estimatedEngagement: estimateEngagement(context, result.content),
      characterCount: result.content.length,
      wordCount: result.content.split(/\s+/).length,
    },
  }
}

async function generateEmailContent(
  request: GenerateContentRequest,
  context: Awaited<ReturnType<typeof communicationsIntelligence.getOrganizationContext>>
): Promise<GeneratedContent> {
  const result = await communicationsIntelligence.generateEmailContent(request.organizationId, {
    type: 'promotional',
    topic: request.topic,
    relatedEventId: request.relatedEventId,
  })

  return {
    type: 'email',
    content: result.body,
    metadata: {
      estimatedEngagement: 'medium',
      characterCount: result.body.length,
      wordCount: result.body.split(/\s+/).length,
    },
    emailMetadata: {
      subject: result.subject,
      preheader: result.preheader,
      ctaText: result.ctaText,
      ctaUrl: result.ctaUrl,
    },
  }
}

async function generateNewsletterContent(
  request: GenerateContentRequest,
  context: Awaited<ReturnType<typeof communicationsIntelligence.getOrganizationContext>>
): Promise<GeneratedContent> {
  const systemPrompt = buildContextPrompt(context, 'newsletter')

  const userPrompt = `Generate a newsletter section about: ${request.topic || 'AI transformation updates'}

Key messages to include: ${request.keyMessages?.join(', ') || 'Latest insights, upcoming events, success stories'}

Target audience: ${request.targetAudience?.join(', ') || context.organization.targetAudience.join(', ')}

Tone: ${request.tone || 'professional yet approachable'}

Length: ${request.length || 'medium'} (short=150 words, medium=300 words, long=500 words)

Include:
- Engaging opening hook
- Value-driven content
- Clear call-to-action
- ${request.includeEmoji ? 'Tasteful use of emojis' : 'No emojis'}

Format as clean HTML with paragraphs, emphasis, and links.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
  })

  const content = response.choices[0].message.content || ''

  return {
    type: 'newsletter',
    content,
    metadata: {
      estimatedEngagement: 'medium',
      characterCount: content.length,
      wordCount: content.split(/\s+/).length,
    },
  }
}

async function generateWorkshopContent(
  request: GenerateContentRequest,
  context: Awaited<ReturnType<typeof communicationsIntelligence.getOrganizationContext>>
): Promise<GeneratedContent> {
  // Find the workshop in context
  const workshop = request.relatedEventId
    ? context.upcomingEvents.find((e) => e.id === request.relatedEventId)
    : context.upcomingEvents.find((e) => e.type === 'workshop')

  const systemPrompt = buildContextPrompt(context, 'workshop promotion')

  const userPrompt = `Generate promotional content for this workshop:
${
  workshop
    ? `
Title: ${workshop.title}
Description: ${workshop.description}
Date: ${workshop.date}
Days until: ${workshop.daysUntil}
Registration URL: ${workshop.registrationUrl || 'TBD'}
`
    : `Topic: ${request.topic || 'AI Transformation Workshop'}`
}

Generate content for: ${request.platforms?.join(', ') || 'all channels'}
Tone: ${request.tone || 'exciting and professional'}
${workshop && workshop.daysUntil <= 3 ? 'URGENT: Event is very soon! Create urgency.' : ''}

Include:
- Compelling hook
- Key benefits for attendees
- Clear date/time
- Strong call-to-action
${request.includeHashtags ? '- Relevant hashtags' : ''}

Return JSON with:
- socialPost: LinkedIn/Twitter version
- emailSnippet: Email-friendly version
- shortVersion: 280 char version for Twitter
- hashtags: array`

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
    type: 'workshop',
    content: result.socialPost || '',
    variants: [
      {
        platform: 'twitter',
        content: result.shortVersion || '',
        characterCount: (result.shortVersion || '').length,
      },
      {
        platform: 'email',
        content: result.emailSnippet || '',
        characterCount: (result.emailSnippet || '').length,
      },
    ],
    metadata: {
      hashtags: result.hashtags || [],
      suggestedTiming: workshop
        ? `${Math.max(workshop.daysUntil - 1, 0)} days before event`
        : 'Immediately',
      estimatedEngagement: workshop && workshop.daysUntil <= 7 ? 'high' : 'medium',
      characterCount: (result.socialPost || '').length,
      wordCount: (result.socialPost || '').split(/\s+/).length,
    },
  }
}

async function generateBlogContent(
  request: GenerateContentRequest,
  context: Awaited<ReturnType<typeof communicationsIntelligence.getOrganizationContext>>
): Promise<GeneratedContent> {
  const systemPrompt = buildContextPrompt(context, 'blog post')

  const lengthGuide = {
    short: '500-700 words',
    medium: '1000-1500 words',
    long: '2000-2500 words',
  }

  const userPrompt = `Write a ${request.length || 'medium'} blog post (${lengthGuide[request.length || 'medium']}) about:

Topic: ${request.topic || 'AI transformation best practices'}

Target audience: ${request.targetAudience?.join(', ') || context.organization.targetAudience.join(', ')}

Key messages to incorporate: ${request.keyMessages?.join(', ') || 'ROI of AI, change management, practical implementation'}

Tone: ${request.tone || 'authoritative yet accessible'}

Structure:
1. Compelling headline
2. Hook/intro paragraph
3. Main sections with subheadings
4. Practical examples or case studies
5. Actionable takeaways
6. Call-to-action

Format as clean markdown with headers, bullet points, and emphasis.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 3000,
  })

  const content = response.choices[0].message.content || ''

  return {
    type: 'blog',
    content,
    metadata: {
      estimatedEngagement: 'medium',
      characterCount: content.length,
      wordCount: content.split(/\s+/).length,
    },
  }
}

async function generateAnnouncementContent(
  request: GenerateContentRequest,
  context: Awaited<ReturnType<typeof communicationsIntelligence.getOrganizationContext>>
): Promise<GeneratedContent> {
  const systemPrompt = buildContextPrompt(context, 'company announcement')

  const userPrompt = `Create a company announcement about:

Topic: ${request.topic || 'Company update'}

Tone: ${request.tone || 'professional and exciting'}

Target: ${request.targetAudience?.join(', ') || 'All stakeholders'}

Generate:
1. Main announcement (200-300 words)
2. Social media version (LinkedIn)
3. Email subject line
4. Tweet version (280 chars)

Return JSON with: announcement, socialPost, emailSubject, tweet`

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
    type: 'announcement',
    content: result.announcement || '',
    variants: [
      {
        platform: 'linkedin',
        content: result.socialPost || '',
        characterCount: (result.socialPost || '').length,
      },
      {
        platform: 'twitter',
        content: result.tweet || '',
        characterCount: (result.tweet || '').length,
      },
    ],
    metadata: {
      estimatedEngagement: 'high',
      characterCount: (result.announcement || '').length,
      wordCount: (result.announcement || '').split(/\s+/).length,
    },
    emailMetadata: {
      subject: result.emailSubject || '',
      preheader: '',
      ctaText: 'Learn More',
      ctaUrl: context.organization.website,
    },
  }
}

async function generateVariation(
  request: GenerateContentRequest,
  context: Awaited<ReturnType<typeof communicationsIntelligence.getOrganizationContext>>,
  originalContent: string
): Promise<GeneratedContent> {
  const systemPrompt = buildContextPrompt(context, 'content variation')

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Create a variation of this content while keeping the same message and tone:

Original:
${originalContent}

Requirements:
- Same length and format
- Same key message
- Different wording and structure
- Equally engaging

Return only the new variation, no explanation.`,
      },
    ],
    temperature: 0.9,
  })

  const content = response.choices[0].message.content || ''

  return {
    type: request.type,
    content,
    metadata: {
      characterCount: content.length,
      wordCount: content.split(/\s+/).length,
      estimatedEngagement: 'medium',
    },
  }
}

// Utility functions

function buildContextPrompt(
  context: Awaited<ReturnType<typeof communicationsIntelligence.getOrganizationContext>>,
  contentType: string
): string {
  return `You are the communications AI for ${context.organization.name}, creating ${contentType}.

BRAND CONTEXT:
- Voice: ${context.organization.brandVoice}
- Values: ${context.organization.values.join(', ')}
- Industry: ${context.organization.industry}
- Mission: ${context.organization.missionStatement || 'AI transformation excellence'}
- Tagline: ${context.organization.tagline || ''}

TARGET AUDIENCE:
${context.organization.targetAudience.join(', ')}

UPCOMING EVENTS (consider mentioning if relevant):
${context.upcomingEvents.slice(0, 3).map((e) => `- ${e.title} (${e.type}) in ${e.daysUntil} days`).join('\n')}

TOP PERFORMING CONTENT INSIGHTS:
${context.contentPerformance
  .slice(0, 2)
  .map((p) => `- ${p.platform}: Best at ${p.bestPostingTimes.join(', ')}, use #${p.topHashtags.slice(0, 3).join(' #')}`)
  .join('\n')}

GUIDELINES:
1. Match brand voice exactly
2. Provide genuine value to the audience
3. Be authentic, not salesy
4. Use proven engagement patterns
5. Include clear next steps when appropriate`
}

function estimateEngagement(
  context: Awaited<ReturnType<typeof communicationsIntelligence.getOrganizationContext>>,
  content: string
): 'low' | 'medium' | 'high' {
  let score = 0

  // Check for high-performing patterns
  const hasQuestion = content.includes('?')
  const hasEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(content)
  const hasNumbers = /\d+%|\d+ (days|people|companies)/.test(content)
  const hasHashtags = content.includes('#')
  const optimalLength = content.length >= 100 && content.length <= 300

  if (hasQuestion) score += 2
  if (hasEmoji) score += 1
  if (hasNumbers) score += 2
  if (hasHashtags) score += 1
  if (optimalLength) score += 1

  // Check for top hashtags from historical performance
  const topHashtags = context.contentPerformance.flatMap((p) => p.topHashtags)
  const usesTopHashtags = topHashtags.some((tag) => content.toLowerCase().includes(tag.toLowerCase()))
  if (usesTopHashtags) score += 2

  if (score >= 6) return 'high'
  if (score >= 3) return 'medium'
  return 'low'
}

function generateSmartSuggestions(
  request: GenerateContentRequest,
  context: Awaited<ReturnType<typeof communicationsIntelligence.getOrganizationContext>>
): string[] {
  const suggestions: string[] = []

  // Suggest event promotion if events are upcoming
  const urgentEvents = context.upcomingEvents.filter((e) => e.daysUntil <= 7 && e.promotionStatus !== 'completed')
  if (urgentEvents.length > 0) {
    suggestions.push(`Promote "${urgentEvents[0].title}" - only ${urgentEvents[0].daysUntil} days away!`)
  }

  // Suggest best posting times
  const bestTimes = context.contentPerformance[0]?.bestPostingTimes
  if (bestTimes && bestTimes.length > 0) {
    suggestions.push(`Best time to post: ${bestTimes[0]} based on your audience engagement`)
  }

  // Suggest top hashtags
  const topHashtags = context.contentPerformance.flatMap((p) => p.topHashtags).slice(0, 5)
  if (topHashtags.length > 0) {
    suggestions.push(`Top performing hashtags: #${topHashtags.join(' #')}`)
  }

  // Content type specific suggestions
  if (request.type === 'social' && !request.includeCTA) {
    suggestions.push('Consider adding a call-to-action for better conversion')
  }

  if (request.type === 'email' && !request.relatedEventId && context.upcomingEvents.length > 0) {
    suggestions.push('Tie this email to an upcoming event for higher relevance')
  }

  return suggestions
}

async function logContentGeneration(
  supabase: Awaited<ReturnType<typeof createClient>>,
  data: {
    organizationId: string
    userId: string
    contentType: string
    topic?: string
    characterCount: number
  }
): Promise<void> {
  try {
    await supabase.from('content_generation_logs').insert({
      organization_id: data.organizationId,
      user_id: data.userId,
      content_type: data.contentType,
      topic: data.topic,
      character_count: data.characterCount,
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    // Non-critical, just log
    console.error('Failed to log content generation:', error)
  }
}
