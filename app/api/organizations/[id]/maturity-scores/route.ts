/**
 * Organization Maturity Scores API
 * GET - Returns all dimension scores with evidence, supports filtering by category
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
  MaturityScoresResponse,
  DimensionScore,
  DimensionEvidence,
  SubdimensionScore,
  MaturityLevel,
  DimensionCategory,
  SentimentType,
} from '@/lib/types/assessment'

/**
 * Check if user has access to the organization
 */
async function checkOrganizationAccess(
  organizationId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient()

  // Check user role
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single()

  const isAdmin = userRole?.role === 'admin' || userRole?.role === 'super_admin_full'
  if (isAdmin) return true

  // Check if user is part of the organization
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', userId)
    .single()

  return userProfile?.organization_id === organizationId
}

/**
 * Map numeric score to maturity level
 */
function getMaturityLevel(score: number): MaturityLevel {
  if (score >= 80) return 'excelling'
  if (score >= 60) return 'evolving'
  if (score >= 40) return 'establishing'
  if (score >= 20) return 'experimenting'
  return 'exploring'
}

/**
 * Get readable dimension name
 */
function getDimensionName(dimension: DimensionCategory): string {
  const names: Record<DimensionCategory, string> = {
    individual: 'Individual Readiness',
    leadership: 'Leadership & Strategy',
    cultural: 'Cultural Alignment',
    embedding: 'Operational Embedding',
    velocity: 'Innovation Velocity',
  }
  return names[dimension] || dimension
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
    const categoryFilter = searchParams.get('category') as DimensionCategory | null
    const includeEvidence = searchParams.get('includeEvidence') !== 'false'
    const includeSubdimensions = searchParams.get('includeSubdimensions') !== 'false'

    // Validate category filter
    const validCategories: DimensionCategory[] = ['individual', 'leadership', 'cultural', 'embedding', 'velocity']
    if (categoryFilter && !validCategories.includes(categoryFilter)) {
      throw APIErrors.INVALID_QUERY_PARAMS({
        category: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
      })
    }

    // Get the latest assessment for the organization
    const { data: latestAssessment, error: assessmentError } = await supabase
      .from('organization_assessments')
      .select('id, overall_score, maturity_level, assessment_date')
      .eq('organization_id', organizationId)
      .order('assessment_date', { ascending: false })
      .limit(1)
      .single()

    if (assessmentError && assessmentError.code !== 'PGRST116') {
      throw APIErrors.DATABASE_ERROR('Failed to fetch assessment data')
    }

    if (!latestAssessment) {
      throw APIErrors.NOT_FOUND('Assessment data')
    }

    // Build dimension scores query
    let dimensionQuery = supabase
      .from('organization_dimension_scores')
      .select(`
        id,
        dimension,
        score,
        max_score,
        weight,
        data_points_count,
        created_at,
        updated_at
      `)
      .eq('assessment_id', latestAssessment.id)
      .order('dimension', { ascending: true })

    if (categoryFilter) {
      dimensionQuery = dimensionQuery.eq('dimension', categoryFilter)
    }

    const { data: dimensionScores, error: scoresError } = await dimensionQuery

    if (scoresError) {
      throw APIErrors.DATABASE_ERROR('Failed to fetch dimension scores')
    }

    // Build dimension score responses
    const dimensions: DimensionScore[] = await Promise.all(
      (dimensionScores || []).map(async (ds) => {
        const percentage = ds.max_score > 0 ? (ds.score / ds.max_score) * 100 : 0
        const weightedScore = ds.score * (ds.weight || 1)

        let evidence: DimensionEvidence[] = []
        let subdimensions: SubdimensionScore[] = []

        // Fetch evidence if requested
        if (includeEvidence) {
          const { data: evidenceData } = await supabase
            .from('organization_dimension_evidence')
            .select(`
              id,
              source,
              quote,
              sentiment,
              confidence,
              timestamp
            `)
            .eq('dimension_score_id', ds.id)
            .order('confidence', { ascending: false })
            .limit(10)

          evidence = (evidenceData || []).map((e) => ({
            id: e.id,
            source: e.source as DimensionEvidence['source'],
            quote: e.quote,
            sentiment: e.sentiment as SentimentType,
            confidence: e.confidence,
            timestamp: e.timestamp,
          }))
        }

        // Fetch subdimensions if requested
        if (includeSubdimensions) {
          const { data: subdimensionData } = await supabase
            .from('organization_subdimension_scores')
            .select(`
              name,
              score,
              max_score
            `)
            .eq('dimension_score_id', ds.id)
            .order('name', { ascending: true })

          subdimensions = (subdimensionData || []).map((sd) => ({
            name: sd.name,
            score: sd.score,
            maxScore: sd.max_score,
            percentage: sd.max_score > 0 ? (sd.score / sd.max_score) * 100 : 0,
          }))
        }

        return {
          dimension: ds.dimension as DimensionCategory,
          dimensionName: getDimensionName(ds.dimension as DimensionCategory),
          score: ds.score,
          maxScore: ds.max_score,
          percentage: Math.round(percentage * 100) / 100,
          weight: ds.weight || 1,
          weightedScore: Math.round(weightedScore * 100) / 100,
          evidence,
          subdimensions,
        }
      })
    )

    // Calculate overall percentage
    const totalScore = dimensions.reduce((sum, d) => sum + d.score, 0)
    const totalMaxScore = dimensions.reduce((sum, d) => sum + d.maxScore, 0)
    const overallPercentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0

    // Build response
    const response: MaturityScoresResponse = {
      organizationId,
      overallScore: latestAssessment.overall_score || 0,
      overallPercentage: Math.round(overallPercentage * 100) / 100,
      maturityLevel: (latestAssessment.maturity_level as MaturityLevel) || getMaturityLevel(latestAssessment.overall_score || 0),
      dimensions,
      scoringMetadata: {
        algorithm: 'weighted-dimension-v2',
        version: '2.0.0',
        calculatedAt: latestAssessment.assessment_date,
        dataPoints: dimensions.reduce((sum, d) => sum + (d.evidence?.length || 0), 0),
      },
    }

    return NextResponse.json(successResponse(response))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
