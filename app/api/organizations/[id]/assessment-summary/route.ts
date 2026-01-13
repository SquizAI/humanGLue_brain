/**
 * Organization Assessment Summary API
 * GET - Returns executive summary, key metrics, and maturity level for dashboard header
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
import type { AssessmentSummary, MaturityLevel } from '@/lib/types/assessment'

/**
 * Check if user has access to the organization
 */
async function checkOrganizationAccess(
  organizationId: string,
  userId: string
): Promise<{ hasAccess: boolean; isAdmin: boolean; organization: { name: string; industry: string | null } | null }> {
  const supabase = await createClient()

  // Get organization
  const { data: organization, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, industry')
    .eq('id', organizationId)
    .single()

  if (orgError || !organization) {
    return { hasAccess: false, isAdmin: false, organization: null }
  }

  // Check user role (admin/super_admin gets access to all orgs)
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)

  const isAdmin = userRoles?.some(r =>
    r.role === 'admin' || r.role === 'super_admin_full' || r.role === 'super_admin'
  ) || false

  // Check if user is part of the organization via team membership
  const { data: teamMembership } = await supabase
    .from('team_members')
    .select('team_id, teams!inner(organization_id)')
    .eq('user_id', userId)
    .eq('teams.organization_id', organizationId)
    .limit(1)

  const isOrgMember = (teamMembership && teamMembership.length > 0) || false

  return {
    hasAccess: isAdmin || isOrgMember,
    isAdmin,
    organization: { name: organization.name, industry: organization.industry },
  }
}

/**
 * Map numeric score to maturity level
 */
function getMaturityLevel(score: number): MaturityLevel {
  if (score >= 8) return 'excelling'
  if (score >= 6) return 'evolving'
  if (score >= 4) return 'establishing'
  if (score >= 2) return 'experimenting'
  return 'exploring'
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
    const accessResult = await checkOrganizationAccess(organizationId, user.id)

    if (!accessResult.organization) {
      throw APIErrors.NOT_FOUND('Organization')
    }

    if (!accessResult.hasAccess) {
      throw APIErrors.FORBIDDEN('You do not have access to this organization')
    }

    const supabase = await createClient()

    // Get the latest assessment for the organization from ai_maturity_assessments
    const { data: latestAssessment, error: assessmentError } = await supabase
      .from('ai_maturity_assessments')
      .select(`
        id,
        assessment_date,
        overall_maturity,
        confidence_level,
        technical_score,
        human_score,
        business_score,
        ai_adoption_score,
        industry_average,
        percentile,
        benchmark_rank,
        data_source,
        transcript_count,
        created_at,
        updated_at
      `)
      .eq('organization_id', organizationId)
      .order('assessment_date', { ascending: false })
      .limit(1)
      .single()

    if (assessmentError && assessmentError.code !== 'PGRST116') {
      throw APIErrors.DATABASE_ERROR('Failed to fetch assessment data')
    }

    // If no assessment found, return empty summary
    if (!latestAssessment) {
      const emptySummary: AssessmentSummary = {
        organizationId,
        organizationName: accessResult.organization.name,
        industry: accessResult.organization.industry,
        assessmentDate: new Date().toISOString(),
        executiveSummary: 'No assessment has been completed for this organization yet.',
        maturityLevel: 'exploring',
        maturityScore: 0,
        maturityPercentile: null,
        keyMetrics: {
          overallScore: 0,
          dimensionCount: 0,
          strengthsCount: 0,
          gapsCount: 0,
          recommendationsCount: 0,
          participantsCount: 0,
        },
        topStrengths: [],
        criticalGaps: [],
      }

      return NextResponse.json(successResponse(emptySummary))
    }

    // Get executive summary
    const { data: execSummary } = await supabase
      .from('executive_summaries')
      .select('executive_summary, key_metrics')
      .eq('assessment_id', latestAssessment.id)
      .single()

    // Get recommendations count
    const { count: recommendationsCount } = await supabase
      .from('ai_recommendations')
      .select('*', { count: 'exact', head: true })
      .eq('assessment_id', latestAssessment.id)

    // Get reality gaps (critical gaps)
    const { data: realityGaps } = await supabase
      .from('reality_gaps')
      .select('dimension, gap_size')
      .eq('organization_id', organizationId)
      .order('gap_size', { ascending: false })
      .limit(5)

    // Get skills profiles for participants count
    const { count: participantsCount } = await supabase
      .from('skills_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('assessment_id', latestAssessment.id)

    // Build key strengths from high scores
    const topStrengths: string[] = []
    if (latestAssessment.technical_score >= 5) topStrengths.push('Technical Infrastructure')
    if (latestAssessment.human_score >= 5) topStrengths.push('Human Capital Readiness')
    if (latestAssessment.business_score >= 5) topStrengths.push('Business Strategy Alignment')
    if (latestAssessment.ai_adoption_score >= 5) topStrengths.push('AI Adoption Progress')

    // Build critical gaps from reality gaps
    const criticalGaps = realityGaps?.map(g => `${g.dimension} (gap: ${g.gap_size?.toFixed(1)})`) || []

    // Build response
    const summary: AssessmentSummary = {
      organizationId,
      organizationName: accessResult.organization.name,
      industry: accessResult.organization.industry,
      assessmentDate: latestAssessment.assessment_date,

      executiveSummary: execSummary?.executive_summary || '',

      maturityLevel: getMaturityLevel(latestAssessment.overall_maturity || 0),
      maturityScore: (latestAssessment.overall_maturity || 0) * 10, // Convert 0-10 to 0-100
      maturityPercentile: latestAssessment.percentile,

      keyMetrics: {
        overallScore: (latestAssessment.overall_maturity || 0) * 10,
        dimensionCount: 4, // technical, human, business, ai_adoption
        strengthsCount: topStrengths.length,
        gapsCount: criticalGaps.length,
        recommendationsCount: recommendationsCount || 0,
        participantsCount: participantsCount || latestAssessment.transcript_count || 0,
      },

      topStrengths,
      criticalGaps,

      industryComparison: latestAssessment.industry_average ? {
        industryName: accessResult.organization.industry || 'Unknown',
        industryAverage: latestAssessment.industry_average * 10,
        organizationRank: latestAssessment.percentile ? Math.ceil((100 - latestAssessment.percentile) / 10) : 0,
        totalInIndustry: 100, // Placeholder - would need actual industry data
      } : undefined,
    }

    return NextResponse.json(successResponse(summary))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
