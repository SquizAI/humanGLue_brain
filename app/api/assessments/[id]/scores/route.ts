/**
 * Assessment Scores API
 * GET - Get calculated scores for an assessment
 * POST - Recalculate scores (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  calculateAssessmentScores,
  getMaturityLevel,
} from '@/lib/services/scoring-engine'

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

    // Get assessment with organization info
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

    // Check if assessment is completed
    if (assessment.status !== 'completed') {
      return NextResponse.json(
        {
          error: 'Assessment not completed',
          status: assessment.status,
          message: 'Scores are only available for completed assessments',
        },
        { status: 400 }
      )
    }

    // Get query params for options
    const searchParams = request.nextUrl.searchParams
    const includeGapAnalysis = searchParams.get('gapAnalysis') !== 'false'
    const includePeerComparison = searchParams.get('peerComparison') !== 'false'

    // Calculate scores
    const scores = await calculateAssessmentScores(assessmentId, {
      includeGapAnalysis,
      includePeerComparison,
    })

    // Get maturity level info
    const maturityLevel = getMaturityLevel(scores.overallScore)

    return NextResponse.json({
      assessmentId,
      organization: assessment.organizations,
      completedAt: assessment.completed_at,

      // Overall scores
      overallScore: scores.overallScore,
      overallPercentage: scores.overallPercentage,

      // Maturity info
      maturityLevel: {
        level: maturityLevel.level,
        name: maturityLevel.name,
        description: maturityLevel.description,
      },

      // Dimension breakdown
      dimensionScores: scores.dimensions.map((d) => ({
        dimension: d.dimension,
        score: d.score,
        maxScore: d.maxScore,
        percentage: d.percentage,
        weight: d.weight,
        weightedScore: d.weightedScore,
        questionsAnswered: d.questionsAnswered,
        subdimensions: d.subdimensions,
      })),

      // Gap analysis (if requested)
      ...(includeGapAnalysis &&
        scores.gapAnalysis && {
          gapAnalysis: scores.gapAnalysis,
        }),

      // Peer comparison (if requested)
      ...(includePeerComparison &&
        scores.peerComparison && {
          peerComparison: scores.peerComparison,
        }),

      // Metadata
      calculatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error getting assessment scores:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
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

    // Admin only for recalculation
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const isAdmin = userRole?.role === 'admin' || userRole?.role === 'super_admin_full'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get assessment
    const { data: assessment } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .single()

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    // Parse custom weights from body if provided
    const body = await request.json().catch(() => ({}))
    const customWeights = body.customWeights

    // Recalculate scores
    const scores = await calculateAssessmentScores(assessmentId, {
      includeGapAnalysis: true,
      includePeerComparison: true,
      customWeights,
    })

    // Update assessment with new scores
    await supabase
      .from('assessments')
      .update({
        overall_score: scores.overallScore,
        individual_score: scores.dimensions.find((d) => d.dimension === 'individual')?.score,
        leadership_score: scores.dimensions.find((d) => d.dimension === 'leadership')?.score,
        cultural_score: scores.dimensions.find((d) => d.dimension === 'cultural')?.score,
        embedding_score: scores.dimensions.find((d) => d.dimension === 'embedding')?.score,
        velocity_score: scores.dimensions.find((d) => d.dimension === 'velocity')?.score,
        updated_at: new Date().toISOString(),
      })
      .eq('id', assessmentId)

    return NextResponse.json({
      success: true,
      message: 'Scores recalculated',
      overallScore: scores.overallScore,
      dimensionScores: scores.dimensions.map((d) => ({
        dimension: d.dimension,
        score: d.score,
        percentage: d.percentage,
      })),
      recalculatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error recalculating scores:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
