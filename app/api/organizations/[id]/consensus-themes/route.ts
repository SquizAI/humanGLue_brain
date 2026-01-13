/**
 * Organization Consensus Themes API
 * GET - Returns themes with quotes, frequency, and sentiment analysis
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  requireAuth,
  APIErrors,
  successResponse,
  errorResponse,
  handleUnknownError,
} from '@/lib/api'
import type {
  ConsensusThemesResponse,
  ConsensusTheme,
  ThemeQuote,
  SentimentType,
  DimensionCategory,
} from '@/lib/types/assessment'

/**
 * Check if user has access to the organization
 */
async function checkOrganizationAccess(
  organizationId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient()

  // Check user role (admin/super_admin gets access to all orgs)
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)

  const isAdmin = userRoles?.some(r =>
    r.role === 'admin' || r.role === 'super_admin_full' || r.role === 'super_admin'
  ) || false

  if (isAdmin) return true

  // Check if user is part of the organization via team membership
  const { data: teamMembership } = await supabase
    .from('team_members')
    .select('team_id, teams!inner(organization_id)')
    .eq('user_id', userId)
    .eq('teams.organization_id', organizationId)
    .limit(1)

  return (teamMembership && teamMembership.length > 0) || false
}

/**
 * Map numeric sentiment to sentiment type
 */
function numericToSentiment(score: number | null): SentimentType {
  if (score === null || score === undefined) return 'neutral'
  if (score >= 0.3) return 'positive'
  if (score <= -0.3) return 'negative'
  return 'neutral'
}

/**
 * Calculate dominant sentiment from array of sentiments
 */
function calculateDominantSentiment(sentiments: SentimentType[]): SentimentType {
  const counts: Record<SentimentType, number> = {
    positive: 0,
    negative: 0,
    neutral: 0,
    mixed: 0,
  }

  sentiments.forEach((s) => {
    if (s in counts) counts[s]++
  })

  const entries = Object.entries(counts) as [SentimentType, number][]
  const sorted = entries.sort((a, b) => b[1] - a[1])

  // If top two are close, return mixed
  if (sorted.length >= 2 && sorted[0][1] - sorted[1][1] <= 1) {
    return 'mixed'
  }

  return sorted[0][0]
}

/**
 * Calculate consensus strength based on theme frequency and sentiment consistency
 */
function calculateConsensusStrength(
  themes: ConsensusTheme[],
  totalQuotes: number
): 'strong' | 'moderate' | 'weak' {
  if (themes.length === 0) return 'weak'

  // Calculate average frequency percentage
  const avgFrequency = themes.reduce((sum, t) => sum + t.frequencyPercentage, 0) / themes.length

  // Calculate sentiment consistency
  const sentimentCounts: Record<SentimentType, number> = { positive: 0, negative: 0, neutral: 0, mixed: 0 }
  themes.forEach((t) => sentimentCounts[t.sentiment]++)
  const dominantSentimentRatio = Math.max(...Object.values(sentimentCounts)) / themes.length

  const consensusScore = (avgFrequency + dominantSentimentRatio * 100) / 2

  if (consensusScore >= 60) return 'strong'
  if (consensusScore >= 35) return 'moderate'
  return 'weak'
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params

    // Require authentication
    const user = await requireAuth()

    // Check organization access
    const hasAccess = await checkOrganizationAccess(organizationId, user.id)

    if (!hasAccess) {
      throw APIErrors.FORBIDDEN('You do not have access to this organization')
    }

    const supabase = await createClient()

    // Parse query params
    const searchParams = request.nextUrl.searchParams
    const sentimentFilter = searchParams.get('sentiment') as SentimentType | null
    const limit = parseInt(searchParams.get('limit') || '50')

    // Validate filters
    const validSentiments: SentimentType[] = ['positive', 'negative', 'neutral', 'mixed']
    if (sentimentFilter && !validSentiments.includes(sentimentFilter)) {
      throw APIErrors.INVALID_QUERY_PARAMS({
        sentiment: `Invalid sentiment. Must be one of: ${validSentiments.join(', ')}`,
      })
    }

    // Fetch consensus themes directly for this organization
    // The consensus_themes table has organization_id directly
    const { data: themesData, error: themesError } = await supabase
      .from('consensus_themes')
      .select(`
        id,
        theme_name,
        description,
        frequency,
        sentiment,
        interviewees,
        quotes,
        created_at
      `)
      .eq('organization_id', organizationId)
      .order('frequency', { ascending: false })
      .limit(limit)

    if (themesError) {
      throw APIErrors.DATABASE_ERROR('Failed to fetch consensus themes')
    }

    // Calculate total quotes count
    const totalQuotesCount = (themesData || []).reduce((sum, t) => {
      const quotes = Array.isArray(t.quotes) ? t.quotes.length : 0
      return sum + quotes
    }, 0)

    const quotesTotal = totalQuotesCount || 1

    // Build theme responses
    const themes = (themesData || []).map((theme) => {
      // Parse quotes from JSON field
      const quotesArray = Array.isArray(theme.quotes) ? theme.quotes : []
      const quotes: ThemeQuote[] = quotesArray.slice(0, 10).map((q: { text?: string; speaker?: string; role?: string; sentiment?: number }, idx: number) => ({
        id: `${theme.id}-quote-${idx}`,
        text: q.text || '',
        speaker: q.speaker || 'Unknown',
        role: q.role || '',
        sentiment: numericToSentiment(q.sentiment ?? null),
        timestamp: theme.created_at,
      }))

      // Calculate sentiment from numeric value
      const sentimentValue = typeof theme.sentiment === 'number' ? theme.sentiment : 0
      const sentiment = numericToSentiment(sentimentValue)

      // Filter by sentiment if requested
      if (sentimentFilter && sentiment !== sentimentFilter) {
        return null
      }

      return {
        id: theme.id,
        theme: theme.theme_name,
        description: theme.description || '',
        frequency: theme.frequency || 0,
        frequencyPercentage: Math.round(((theme.frequency || 0) / quotesTotal) * 100 * 100) / 100,
        sentiment,
        sentimentScore: sentimentValue,
        dimension: null as DimensionCategory | null, // Not stored in current schema
        quotes,
        significance: 'medium' as 'high' | 'medium' | 'low', // Default
      }
    }).filter((t): t is ConsensusTheme => t !== null)

    // Calculate summary statistics
    const allSentiments = themes.map((t) => t.sentiment)
    const dominantSentiment = calculateDominantSentiment(allSentiments)

    const totalThemeQuotes = themes.reduce((sum, t) => sum + t.quotes.length, 0)

    // Build response
    const response: ConsensusThemesResponse = {
      organizationId,
      totalThemes: themes.length,
      totalQuotes: totalThemeQuotes,
      themes,
      summary: {
        dominantSentiment,
        topThemes: themes.slice(0, 5).map((t) => t.theme),
        mostDiscussedDimension: 'individual' as DimensionCategory, // Default since not in schema
        consensusStrength: calculateConsensusStrength(themes, quotesTotal),
      },
    }

    return NextResponse.json(successResponse(response))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
