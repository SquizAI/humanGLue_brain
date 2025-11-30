/**
 * Assessment Progress API
 * GET - Get assessment progress including dimension breakdown
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAssessmentProgress } from '@/lib/services/question-engine'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: assessmentId } = await params
    const supabase = await createClient()

    // Check if user owns this assessment or is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: assessment } = await supabase
      .from('assessments')
      .select('*, organizations(name, industry)')
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

    // Get progress
    const progress = await getAssessmentProgress(assessmentId)

    // Get timing info
    const { data: session } = await supabase
      .from('assessment_sessions')
      .select('started_at, last_activity_at')
      .eq('assessment_id', assessmentId)
      .single()

    // Calculate estimated time remaining
    const avgTimePerQuestion = 45 // seconds
    const remainingQuestions = progress.totalQuestions - progress.answeredQuestions
    const estimatedSecondsRemaining = remainingQuestions * avgTimePerQuestion

    return NextResponse.json({
      assessmentId,
      status: assessment.status,
      assessmentType: assessment.assessment_type,
      organization: assessment.organizations,

      // Overall progress
      totalQuestions: progress.totalQuestions,
      answeredQuestions: progress.answeredQuestions,
      skippedQuestions: progress.skippedQuestions,
      completionPercentage: progress.completionPercentage,

      // Dimension progress
      dimensionProgress: progress.dimensionProgress,

      // Timing
      startedAt: session?.started_at,
      lastActivityAt: session?.last_activity_at,
      estimatedSecondsRemaining,

      // Scores (if complete)
      ...(assessment.status === 'completed' && {
        scores: {
          overall: assessment.overall_score,
          individual: assessment.individual_score,
          leadership: assessment.leadership_score,
          cultural: assessment.cultural_score,
          embedding: assessment.embedding_score,
          velocity: assessment.velocity_score,
        },
      }),
    })
  } catch (error) {
    console.error('Error getting assessment progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
