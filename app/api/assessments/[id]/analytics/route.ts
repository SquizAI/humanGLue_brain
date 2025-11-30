/**
 * Assessment Analytics API
 * GET - Get detailed analytics for an assessment
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getIndividualAnalytics,
  getOrganizationAnalytics,
} from '@/lib/services/assessment-analytics'
import { getAssessmentProgress } from '@/lib/services/question-engine'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get assessment
    const { data: assessment } = await supabase
      .from('assessments')
      .select('*, organizations(id, name, industry)')
      .eq('id', assessmentId)
      .single()

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    // Check access
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const isAdmin = userRole?.role === 'admin' || userRole?.role === 'super_admin_full'
    const isOwner = assessment.user_id === user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams
    const includeIndividual = searchParams.get('individual') !== 'false'
    const includeOrganization = searchParams.get('organization') !== 'false'

    // Get assessment progress
    const progress = await getAssessmentProgress(assessmentId)

    // Get answer breakdown
    const { data: responses } = await supabase
      .from('assessment_responses')
      .select('*, question_bank(question_code, dimension)')
      .eq('assessment_id', assessmentId)

    // Calculate answer statistics
    const answerStats = {
      totalAnswers: responses?.length || 0,
      averageTimePerQuestion:
        responses && responses.length > 0
          ? Math.round(
              responses.reduce((sum, a) => sum + (a.time_spent_seconds || 0), 0) / responses.length
            )
          : 0,
      textResponses: responses?.filter((a) => a.response_text).length || 0,
      skippedQuestions: responses?.filter((a) => a.skipped).length || 0,
    }

    // Build response
    const response: Record<string, unknown> = {
      assessmentId,
      assessmentType: assessment.assessment_type,
      status: assessment.status,
      organization: assessment.organizations,
      createdAt: assessment.created_at,
      completedAt: assessment.completed_at,

      // Progress
      progress: {
        totalQuestions: progress.totalQuestions,
        answeredQuestions: progress.answeredQuestions,
        skippedQuestions: progress.skippedQuestions,
        completionPercentage: progress.completionPercentage,
        dimensionProgress: progress.dimensionProgress,
      },

      // Answer statistics
      answerStatistics: answerStats,
    }

    // Individual analytics (for the user who took the assessment)
    if (includeIndividual && assessment.status === 'completed') {
      try {
        const individualAnalytics = await getIndividualAnalytics(assessment.user_id)
        response.individualAnalytics = {
          currentScore: individualAnalytics.currentScore,
          currentMaturityLevel: individualAnalytics.currentMaturityLevel,
          improvement: individualAnalytics.improvement,
          strengths: individualAnalytics.strengths,
          weaknesses: individualAnalytics.weaknesses,
          learningVelocity: individualAnalytics.learningVelocity,
          consistency: individualAnalytics.consistency,
          assessmentCount: individualAnalytics.assessmentHistory.length,
        }
      } catch (err) {
        console.error('Error getting individual analytics:', err)
        response.individualAnalytics = null
      }
    }

    // Organization analytics (if assessment belongs to an org)
    if (includeOrganization && assessment.organization_id && assessment.status === 'completed') {
      try {
        const orgAnalytics = await getOrganizationAnalytics(assessment.organization_id)
        response.organizationAnalytics = {
          organizationName: orgAnalytics.organizationName,
          industry: orgAnalytics.industry,
          totalAssessments: orgAnalytics.totalAssessments,
          activeUsers: orgAnalytics.activeUsers,
          averageScore: orgAnalytics.averageScore,
          maturityLevel: orgAnalytics.maturityLevel,
          industryComparison: orgAnalytics.industryComparison,
          trends: orgAnalytics.trends,
        }
      } catch (err) {
        console.error('Error getting organization analytics:', err)
        response.organizationAnalytics = null
      }
    }

    // Dimension-level answer breakdown
    if (responses && responses.length > 0) {
      const dimensionAnswers: Record<string, { count: number; avgScore: number; avgTime: number }> =
        {}

      responses.forEach((r) => {
        const dimension = (r.question_bank as any)?.dimension || 'unknown'
        if (!dimensionAnswers[dimension]) {
          dimensionAnswers[dimension] = { count: 0, avgScore: 0, avgTime: 0 }
        }
        dimensionAnswers[dimension].count++
        // Get score from metadata or ai_confidence_score
        const score = (r.metadata as any)?.answer_value || r.ai_confidence_score || 0
        dimensionAnswers[dimension].avgScore += score
        dimensionAnswers[dimension].avgTime += r.time_spent_seconds || 0
      })

      // Calculate averages
      Object.keys(dimensionAnswers).forEach((dim) => {
        const d = dimensionAnswers[dim]
        d.avgScore = d.count > 0 ? Math.round((d.avgScore / d.count) * 100) / 100 : 0
        d.avgTime = d.count > 0 ? Math.round(d.avgTime / d.count) : 0
      })

      response.dimensionBreakdown = dimensionAnswers
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error getting assessment analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
