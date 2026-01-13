/**
 * Organization Recommendations API
 * GET - Returns immediate/short-term/long-term recommendations
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
  RecommendationsResponse,
  Recommendation,
  RecommendationPriority,
  RecommendationTimeframe,
  RecommendationCategory,
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
 * Map effort string to standardized format
 */
function mapEffort(effort: string | null): 'low' | 'medium' | 'high' {
  const normalized = (effort || 'medium').toLowerCase()
  if (normalized === 'low' || normalized === 'minimal') return 'low'
  if (normalized === 'high' || normalized === 'significant' || normalized === 'major') return 'high'
  return 'medium'
}

/**
 * Map dimension string to DimensionCategory
 */
function mapToDimensionCategory(dimension: string | null): DimensionCategory {
  const mapping: Record<string, DimensionCategory> = {
    individual: 'individual',
    leadership: 'leadership',
    cultural: 'cultural',
    embedding: 'embedding',
    velocity: 'velocity',
    technical: 'embedding',
    human: 'individual',
    business: 'leadership',
    ai_adoption: 'velocity',
    strategy: 'leadership',
    culture: 'cultural',
    process: 'embedding',
    tools: 'embedding',
    training: 'individual',
    governance: 'leadership',
    infrastructure: 'embedding',
  }
  return mapping[(dimension || '').toLowerCase()] || 'individual'
}

/**
 * Map dimension to category for recommendations
 */
function mapToCategory(dimension: string | null): RecommendationCategory {
  const mapping: Record<string, RecommendationCategory> = {
    technical: 'infrastructure',
    human: 'training',
    business: 'strategy',
    ai_adoption: 'tools',
    individual: 'training',
    leadership: 'strategy',
    cultural: 'culture',
    embedding: 'process',
    velocity: 'tools',
    strategy: 'strategy',
    culture: 'culture',
    process: 'process',
    tools: 'tools',
    training: 'training',
    governance: 'governance',
    infrastructure: 'infrastructure',
  }
  return mapping[(dimension || '').toLowerCase()] || 'process'
}

/**
 * Derive priority from timeframe and sort order
 */
function derivePriority(timeframe: string, sortOrder: number): RecommendationPriority {
  if (timeframe === 'immediate' && sortOrder <= 2) return 'critical'
  if (timeframe === 'immediate' || sortOrder <= 3) return 'high'
  if (timeframe === 'short_term' || sortOrder <= 6) return 'medium'
  return 'low'
}

/**
 * Map database recommendation to API type
 */
function mapRecommendation(rec: {
  id: string
  title: string
  description: string | null
  rationale: string | null
  timeframe: string
  sort_order: number
  related_dimension: string | null
  expected_impact: string | null
  effort_required: string | null
  estimated_cost_range: string | null
  status: string | null
}): Recommendation {
  const timeframe = (rec.timeframe || 'short_term') as RecommendationTimeframe
  const priority = derivePriority(timeframe, rec.sort_order || 99)
  const category = mapToCategory(rec.related_dimension)
  const dimension = mapToDimensionCategory(rec.related_dimension)

  return {
    id: rec.id,
    title: rec.title || 'Untitled Recommendation',
    description: rec.description || rec.rationale || '',
    priority,
    timeframe,
    category,
    targetDimensions: [dimension],
    expectedImpact: {
      scoreImprovement: timeframe === 'immediate' ? 10 : timeframe === 'short_term' ? 7 : 5,
      confidence: 0.7,
      description: rec.expected_impact || '',
    },
    implementation: {
      effort: mapEffort(rec.effort_required),
      resources: [],
      prerequisites: [],
      successMetrics: [],
    },
    relatedGaps: [],
    status: (rec.status as Recommendation['status']) || 'pending',
  }
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
    const timeframeFilter = searchParams.get('timeframe') as RecommendationTimeframe | null
    const priorityFilter = searchParams.get('priority') as RecommendationPriority | null
    const limit = parseInt(searchParams.get('limit') || '100')

    // Validate filters
    const validTimeframes: RecommendationTimeframe[] = ['immediate', 'short_term', 'long_term']
    if (timeframeFilter && !validTimeframes.includes(timeframeFilter)) {
      throw APIErrors.INVALID_QUERY_PARAMS({
        timeframe: `Invalid timeframe. Must be one of: ${validTimeframes.join(', ')}`,
      })
    }

    // Fetch recommendations directly for this organization
    let recsQuery = supabase
      .from('ai_recommendations')
      .select(`
        id,
        title,
        description,
        rationale,
        timeframe,
        sort_order,
        related_dimension,
        expected_impact,
        effort_required,
        estimated_cost_range,
        status,
        created_at
      `)
      .eq('organization_id', organizationId)

    if (timeframeFilter) {
      recsQuery = recsQuery.eq('timeframe', timeframeFilter)
    }

    recsQuery = recsQuery
      .order('sort_order', { ascending: true })
      .limit(limit)

    const { data: recsData, error: recsError } = await recsQuery

    if (recsError) {
      throw APIErrors.DATABASE_ERROR('Failed to fetch recommendations')
    }

    // Map and group recommendations by timeframe
    const allRecommendations = (recsData || []).map(mapRecommendation)

    // Filter by priority if requested
    const filteredRecs = priorityFilter
      ? allRecommendations.filter(r => r.priority === priorityFilter)
      : allRecommendations

    const immediate = filteredRecs.filter((r) => r.timeframe === 'immediate')
    const shortTerm = filteredRecs.filter((r) => r.timeframe === 'short_term')
    const longTerm = filteredRecs.filter((r) => r.timeframe === 'long_term')

    // Calculate priority breakdown
    const priorityBreakdown = {
      critical: filteredRecs.filter((r) => r.priority === 'critical').length,
      high: filteredRecs.filter((r) => r.priority === 'high').length,
      medium: filteredRecs.filter((r) => r.priority === 'medium').length,
      low: filteredRecs.filter((r) => r.priority === 'low').length,
    }

    // Calculate category breakdown
    const categoryBreakdown: Record<RecommendationCategory, number> = {
      training: 0,
      tools: 0,
      governance: 0,
      culture: 0,
      process: 0,
      infrastructure: 0,
      strategy: 0,
    }
    filteredRecs.forEach((r) => {
      if (r.category in categoryBreakdown) {
        categoryBreakdown[r.category]++
      }
    })

    // Calculate estimated impact
    const totalPotentialIncrease = filteredRecs.reduce(
      (sum, r) => sum + r.expectedImpact.scoreImprovement,
      0
    )

    // Estimate time to achieve based on timeframe distribution
    let timeToAchieve = '6-12 months'
    if (longTerm.length > immediate.length + shortTerm.length) {
      timeToAchieve = '12-24 months'
    } else if (immediate.length > shortTerm.length + longTerm.length) {
      timeToAchieve = '3-6 months'
    }

    // Build response
    const response: RecommendationsResponse = {
      organizationId,
      totalRecommendations: filteredRecs.length,
      immediate,
      shortTerm,
      longTerm,
      priorityBreakdown,
      categoryBreakdown,
      estimatedImpact: {
        potentialScoreIncrease: Math.round(totalPotentialIncrease * 100) / 100,
        timeToAchieve,
      },
    }

    return NextResponse.json(successResponse(response))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
