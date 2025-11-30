/**
 * Organization Analytics API
 * GET - Get comprehensive analytics for an organization
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getOrganizationAnalytics,
  getIndustryAnalytics,
  generateExecutiveSummary,
} from '@/lib/services/assessment-analytics'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get organization
    const { data: organization } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single()

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Check access - must be admin or member of organization
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const isAdmin = userRole?.role === 'admin' || userRole?.role === 'super_admin_full'

    // Check if user is part of the organization
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    const isOrgMember = userProfile?.organization_id === organizationId

    if (!isAdmin && !isOrgMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams
    const includeIndustry = searchParams.get('industry') !== 'false'
    const includeExecutiveSummary = searchParams.get('executiveSummary') === 'true'

    // Get organization analytics
    const orgAnalytics = await getOrganizationAnalytics(organizationId)

    // Build response
    const response: Record<string, unknown> = {
      organizationId,
      organizationName: orgAnalytics.organizationName,
      industry: orgAnalytics.industry,

      // Overview metrics
      overview: {
        totalAssessments: orgAnalytics.totalAssessments,
        activeUsers: orgAnalytics.activeUsers,
        averageScore: orgAnalytics.averageScore,
        maturityLevel: orgAnalytics.maturityLevel,
      },

      // Maturity distribution across org
      maturityDistribution: orgAnalytics.maturityDistribution,

      // Dimension breakdown
      dimensionBreakdown: orgAnalytics.dimensionBreakdown,

      // Trends
      trends: orgAnalytics.trends,

      // Industry comparison
      industryComparison: orgAnalytics.industryComparison,

      // Top performers
      topPerformers: orgAnalytics.topPerformers,

      // Areas needing attention
      areasNeedingAttention: orgAnalytics.areasNeedingAttention,
    }

    // Include industry-wide analytics if requested
    if (includeIndustry && organization.industry) {
      try {
        const industryAnalytics = await getIndustryAnalytics(organization.industry)
        response.industryAnalytics = {
          industry: industryAnalytics.industry,
          totalOrganizations: industryAnalytics.totalOrganizations,
          totalAssessments: industryAnalytics.totalAssessments,
          averageScore: industryAnalytics.averageScore,
          maturityLevel: industryAnalytics.maturityLevel,
          leaderScore: industryAnalytics.leaderScore,
          laggardScore: industryAnalytics.laggardScore,
          dimensionAverages: industryAnalytics.dimensionAverages,
          topTrends: industryAnalytics.topTrends,
        }
      } catch (err) {
        console.error('Error getting industry analytics:', err)
        response.industryAnalytics = null
      }
    }

    // Include executive summary if requested
    if (includeExecutiveSummary) {
      try {
        const executiveSummary = await generateExecutiveSummary(organizationId)
        response.executiveSummary = executiveSummary
      } catch (err) {
        console.error('Error generating executive summary:', err)
        response.executiveSummary = null
      }
    }

    // Get recent assessment activity
    const { data: recentAssessments } = await supabase
      .from('assessments')
      .select(
        `
        id,
        status,
        assessment_type,
        overall_score,
        created_at,
        completed_at,
        profiles!inner(full_name, email)
      `
      )
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(10)

    response.recentActivity = recentAssessments?.map((a) => {
      // profiles is returned as array from inner join, get first element
      const profile = Array.isArray(a.profiles) ? a.profiles[0] : a.profiles
      return {
        assessmentId: a.id,
        status: a.status,
        type: a.assessment_type,
        score: a.overall_score,
        createdAt: a.created_at,
        completedAt: a.completed_at,
        user: {
          name: profile?.full_name,
          email: profile?.email,
        },
      }
    })

    // Calculate completion rate
    const { count: totalStarted } = await supabase
      .from('assessments')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)

    const { count: totalCompleted } = await supabase
      .from('assessments')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('status', 'completed')

    response.completionMetrics = {
      totalStarted: totalStarted || 0,
      totalCompleted: totalCompleted || 0,
      completionRate:
        totalStarted && totalStarted > 0
          ? Math.round(((totalCompleted || 0) / totalStarted) * 100)
          : 0,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error getting organization analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
