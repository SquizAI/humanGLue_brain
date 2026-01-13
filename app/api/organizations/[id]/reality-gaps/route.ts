/**
 * Organization Reality Gaps API
 * GET - Returns perception vs evidence gaps by dimension
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
  RealityGapsResponse,
  RealityGap,
  GapSource,
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
 * Get readable dimension name
 */
function getDimensionName(dimension: string): string {
  const names: Record<string, string> = {
    individual: 'Individual Readiness',
    leadership: 'Leadership & Strategy',
    cultural: 'Cultural Alignment',
    embedding: 'Operational Embedding',
    velocity: 'Innovation Velocity',
    technical: 'Technical Infrastructure',
    human: 'Human Capital',
    business: 'Business Strategy',
    ai_adoption: 'AI Adoption',
  }
  return names[dimension] || dimension
}

/**
 * Map dimension string to DimensionCategory
 */
function mapToDimensionCategory(dimension: string): DimensionCategory {
  const mapping: Record<string, DimensionCategory> = {
    individual: 'individual',
    leadership: 'leadership',
    cultural: 'cultural',
    embedding: 'embedding',
    velocity: 'velocity',
    technical: 'embedding', // Map technical to embedding
    human: 'individual', // Map human to individual
    business: 'leadership', // Map business to leadership
    ai_adoption: 'velocity', // Map AI adoption to velocity
  }
  return mapping[dimension] || 'individual'
}

/**
 * Determine gap direction based on perception vs evidence scores
 */
function getGapDirection(
  perceptionScore: number,
  evidenceScore: number
): 'overestimation' | 'underestimation' | 'aligned' {
  const difference = perceptionScore - evidenceScore
  const threshold = 1 // 1 point threshold on 0-10 scale

  if (difference > threshold) return 'overestimation'
  if (difference < -threshold) return 'underestimation'
  return 'aligned'
}

/**
 * Determine severity based on gap size
 */
function getSeverity(gapSize: number): 'critical' | 'significant' | 'moderate' | 'minor' {
  const absGap = Math.abs(gapSize)
  if (absGap >= 4) return 'critical'
  if (absGap >= 2.5) return 'significant'
  if (absGap >= 1.5) return 'moderate'
  return 'minor'
}

/**
 * Parse evidence from JSONB field
 */
function parseEvidence(evidence: unknown): GapSource[] {
  if (!evidence) return []
  if (!Array.isArray(evidence)) return []

  return evidence.map((e: { type?: string; content?: string; confidence?: number }) => ({
    type: (e.type || 'transcript') as GapSource['type'],
    content: e.content || '',
    confidence: e.confidence || 0.5,
  }))
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
    const dimensionFilter = searchParams.get('dimension') as DimensionCategory | null
    const severityFilter = searchParams.get('severity') as 'critical' | 'significant' | 'moderate' | 'minor' | null
    const directionFilter = searchParams.get('direction') as 'overestimation' | 'underestimation' | null

    // Fetch reality gaps directly for this organization
    const { data: gapsData, error: gapsError } = await supabase
      .from('reality_gaps')
      .select(`
        id,
        dimension,
        leadership_perception,
        actual_evidence,
        gap_size,
        supporting_evidence,
        contradicting_evidence,
        created_at
      `)
      .eq('organization_id', organizationId)
      .order('gap_size', { ascending: false })

    if (gapsError) {
      throw APIErrors.DATABASE_ERROR('Failed to fetch reality gaps')
    }

    // Build gap responses
    const gaps: RealityGap[] = (gapsData || []).map((gap) => {
      const dimension = mapToDimensionCategory(gap.dimension || 'individual')
      const perceptionScore = (gap.leadership_perception || 0) * 10 // Convert to 0-100
      const evidenceScore = (gap.actual_evidence || 0) * 10
      const gapSizeRaw = gap.gap_size || (gap.leadership_perception - gap.actual_evidence) || 0
      const gapSize = gapSizeRaw * 10 // Convert to percentage

      const gapDirection = getGapDirection(perceptionScore, evidenceScore)
      const severity = getSeverity(gapSizeRaw)

      // Filter by dimension
      if (dimensionFilter && dimension !== dimensionFilter) {
        return null
      }

      // Filter by severity
      if (severityFilter && severity !== severityFilter) {
        return null
      }

      // Filter by direction
      if (directionFilter && gapDirection !== directionFilter) {
        return null
      }

      // Parse evidence sources
      const perceptionSources = parseEvidence(gap.supporting_evidence)
      const evidenceSources = parseEvidence(gap.contradicting_evidence)

      return {
        id: gap.id,
        dimension,
        dimensionName: getDimensionName(gap.dimension || 'individual'),
        aspect: gap.dimension || 'General',
        description: `Gap between leadership perception (${(gap.leadership_perception || 0).toFixed(1)}) and actual evidence (${(gap.actual_evidence || 0).toFixed(1)})`,
        perceptionScore,
        evidenceScore,
        gapSize: Math.abs(gapSize),
        gapDirection,
        perceptionSources,
        evidenceSources,
        severity,
        impact: severity === 'critical' || severity === 'significant'
          ? 'High priority for addressing'
          : 'Monitor and address as needed',
        recommendation: gapDirection === 'overestimation'
          ? 'Leadership may be overestimating capabilities in this area. Consider deeper assessment.'
          : gapDirection === 'underestimation'
          ? 'There may be hidden strengths in this area that leadership is not fully aware of.'
          : 'Perception and evidence are well aligned.',
      }
    }).filter((g): g is RealityGap => g !== null)

    // Calculate summary statistics
    const overestimationCount = gaps.filter((g) => g.gapDirection === 'overestimation').length
    const underestimationCount = gaps.filter((g) => g.gapDirection === 'underestimation').length
    const alignedCount = gaps.filter((g) => g.gapDirection === 'aligned').length

    const averageGapSize = gaps.length > 0
      ? Math.round((gaps.reduce((sum, g) => sum + Math.abs(g.gapSize), 0) / gaps.length) * 100) / 100
      : 0

    // Find most misaligned dimension
    const dimensionGaps: Record<DimensionCategory, number[]> = {
      individual: [],
      leadership: [],
      cultural: [],
      embedding: [],
      velocity: [],
    }
    gaps.forEach((g) => {
      if (g.dimension in dimensionGaps) {
        dimensionGaps[g.dimension].push(Math.abs(g.gapSize))
      }
    })

    let mostMisalignedDimension: DimensionCategory = 'individual'
    let maxAvgGap = 0
    for (const [dim, gapSizes] of Object.entries(dimensionGaps) as [DimensionCategory, number[]][]) {
      if (gapSizes.length > 0) {
        const avg = gapSizes.reduce((a, b) => a + b, 0) / gapSizes.length
        if (avg > maxAvgGap) {
          maxAvgGap = avg
          mostMisalignedDimension = dim
        }
      }
    }

    // Calculate overall alignment score (100 - average gap)
    const overallAlignment = Math.max(0, Math.round((100 - averageGapSize) * 100) / 100)

    // Build response
    const response: RealityGapsResponse = {
      organizationId,
      overallAlignment,
      gapCount: gaps.length,
      gaps,
      summary: {
        mostMisalignedDimension,
        averageGapSize,
        overestimationCount,
        underestimationCount,
        alignedCount,
      },
    }

    return NextResponse.json(successResponse(response))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
