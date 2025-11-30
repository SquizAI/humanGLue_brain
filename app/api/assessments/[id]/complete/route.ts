/**
 * Assessment Completion API
 * POST /api/assessments/[id]/complete - Complete assessment and generate results
 *
 * This endpoint:
 * 1. Validates all required questions are answered
 * 2. Calculates dimension scores and overall maturity level
 * 3. Generates psychometric profile from responses
 * 4. Optionally creates Mind Reasoner mind for advanced profiling
 * 5. Generates gap analysis and recommendations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, handleUnknownError, APIErrors, APIError } from '@/lib/api/errors'
import { requireAuth } from '@/lib/api/auth'
import { calculateAssessmentScores, getMaturityLevel } from '@/lib/services/scoring-engine'
import { mapAssessmentToProfile, generateLearningRecommendations } from '@/lib/services/mind-reasoner'
import { maturityLevels, getNextLevel } from '@/lib/assessment/maturityModel'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/assessments/[id]/complete
 * Complete an assessment and generate full results
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: assessmentId } = await params

    const body = await request.json().catch(() => ({}))
    const {
      createMindReasonerProfile = false,
      generateRecommendations = true,
    } = body

    const supabase = await createClient()

    // Verify user owns this assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select(`
        *,
        organizations(id, name, industry, mind_reasoner_enabled),
        assessment_sessions(
          id,
          total_questions,
          questions_answered,
          questions_skipped,
          question_sequence
        )
      `)
      .eq('id', assessmentId)
      .single()

    if (assessmentError || !assessment) {
      return NextResponse.json(
        errorResponse(APIErrors.NOT_FOUND('Assessment')),
        { status: 404 }
      )
    }

    if (assessment.user_id !== user.id) {
      return NextResponse.json(
        errorResponse(APIErrors.FORBIDDEN()),
        { status: 403 }
      )
    }

    // Check if already completed
    if (assessment.status === 'completed') {
      return NextResponse.json(
        errorResponse(APIErrors.CONFLICT('Assessment is already completed')),
        { status: 409 }
      )
    }

    // Get session info
    const session = Array.isArray(assessment.assessment_sessions)
      ? assessment.assessment_sessions[0]
      : assessment.assessment_sessions

    // Get all responses
    const { data: responses, error: responsesError } = await supabase
      .from('assessment_responses')
      .select(`
        *,
        question_bank(
          question_code,
          dimension,
          subdimension,
          weight
        )
      `)
      .eq('assessment_id', assessmentId)

    if (responsesError) throw responsesError

    // Validate minimum completion (allow some skipped questions)
    const answeredCount = responses?.filter(r => !r.skipped).length || 0
    const totalQuestions = session?.total_questions || 0
    const completionPercentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0

    // Require at least 70% completion
    if (completionPercentage < 70) {
      return NextResponse.json(
        errorResponse(
          new APIError(
            'INSUFFICIENT_RESPONSES',
            'Assessment requires at least 70% of questions to be answered',
            400,
            {
              answered: answeredCount,
              total: totalQuestions,
              percentage: Math.round(completionPercentage),
              required: 70,
            }
          )
        ),
        { status: 400 }
      )
    }

    // Calculate scores
    const scores = await calculateAssessmentScores(assessmentId, {
      includeGapAnalysis: true,
      includePeerComparison: true,
    })

    // Get maturity level details
    const maturityLevel = getMaturityLevel(scores.overallScore)
    const maturityDetails = maturityLevels.find(m => m.level === maturityLevel.level)
    const nextLevelDetails = getNextLevel(maturityLevel.level)

    // Generate psychometric profile from assessment responses
    const assessmentResponses = (responses || [])
      .filter(r => !r.skipped && r.question_bank)
      .map(r => ({
        dimension: (r.question_bank as { dimension?: string })?.dimension || 'individual',
        subdimension: (r.question_bank as { subdimension?: string })?.subdimension,
        value: (r.metadata as { answer_value?: number })?.answer_value || r.ai_confidence_score || 5,
        questionCode: (r.question_bank as { question_code?: string })?.question_code || r.question_code,
      }))

    const psychometricProfile = mapAssessmentToProfile(assessmentResponses)

    // Generate learning recommendations based on profile
    let recommendations: ReturnType<typeof generateLearningRecommendations> = []
    if (generateRecommendations && psychometricProfile) {
      // Fill in default values for full profile
      const fullProfile = {
        mindId: '',
        communicationStyle: psychometricProfile.communicationStyle || 'diplomatic',
        listeningStyle: 'active' as const,
        feedbackPreference: 'direct' as const,
        conflictStyle: 'collaborating' as const,
        decisionMaking: 'analytical' as const,
        problemSolving: 'systematic' as const,
        informationProcessing: 'sequential' as const,
        learningStyle: 'visual' as const,
        riskTolerance: 'moderate' as const,
        changeReadiness: psychometricProfile.changeReadiness || 'adaptable',
        workStyle: 'collaborative' as const,
        motivationType: 'balanced' as const,
        persuasionStyle: 'logical' as const,
        leadershipStyle: psychometricProfile.leadershipStyle || 'coaching',
        influenceApproach: 'consultative' as const,
        aiReadiness: psychometricProfile.aiReadiness || 'curious',
        technologyAdoption: psychometricProfile.technologyAdoption || 'early_majority',
        dataComfort: 'moderate' as const,
        automationOpenness: psychometricProfile.automationOpenness || 'selective',
        selfAwareness: 'moderate' as const,
        empathy: 'moderate' as const,
        emotionalRegulation: 'moderate' as const,
        socialSkills: 'moderate' as const,
        teamRole: 'contributor' as const,
        collaborationPreference: 'hybrid' as const,
        meetingStyle: 'structured' as const,
        motivators: [],
        stressors: [],
        strengths: [],
        growthAreas: scores.gapAnalysis.dimensionGaps
          .filter(g => g.priority === 'high')
          .map(g => g.dimension),
        values: [],
      }
      recommendations = generateLearningRecommendations(fullProfile)
    }

    // Build results object
    const results = {
      // Overall scores
      overallScore: scores.overallScore,
      overallPercentage: scores.overallPercentage,

      // Maturity assessment
      maturityLevel: {
        level: maturityLevel.level,
        name: maturityLevel.name,
        description: maturityDetails?.description || maturityLevel.description,
        characteristics: maturityDetails?.characteristics || [],
        capabilities: maturityDetails?.capabilities || [],
        typicalChallenges: maturityDetails?.typicalChallenges || [],
      },

      // Next level info
      nextLevel: nextLevelDetails ? {
        level: nextLevelDetails.level,
        name: nextLevelDetails.name,
        description: nextLevelDetails.description,
        estimatedTimeToNext: nextLevelDetails.estimatedTimeToNext,
        requiredInvestment: nextLevelDetails.requiredInvestment,
        nextSteps: nextLevelDetails.nextSteps,
      } : null,

      // Dimension breakdown
      dimensions: scores.dimensions.map(d => ({
        dimension: d.dimension,
        score: d.score,
        percentage: d.percentage,
        weight: d.weight,
        weightedScore: d.weightedScore,
        questionsAnswered: d.questionsAnswered,
        questionsSkipped: d.questionsSkipped,
        subdimensions: d.subdimensions,
      })),

      // Gap analysis
      gapAnalysis: scores.gapAnalysis,

      // Peer comparison (if available)
      peerComparison: scores.peerComparison || null,

      // Psychometric profile
      psychometricProfile: {
        ...psychometricProfile,
        confidence: Math.round(completionPercentage),
        analyzedAt: new Date().toISOString(),
      },

      // Personalized recommendations
      recommendations: [
        ...scores.gapAnalysis.recommendations,
        ...recommendations.map(r => r.recommendation),
      ],

      // Learning path recommendations
      learningRecommendations: recommendations,

      // Completion metadata
      completedAt: new Date().toISOString(),
      completionPercentage: Math.round(completionPercentage),
      questionsAnswered: answeredCount,
      questionsSkipped: (responses?.filter(r => r.skipped).length) || 0,
      totalQuestions,
    }

    // Update assessment status and store results
    const { error: updateError } = await supabase
      .from('assessments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        overall_score: scores.overallScore,
        individual_score: scores.dimensions.find(d => d.dimension === 'individual')?.score,
        leadership_score: scores.dimensions.find(d => d.dimension === 'leadership')?.score,
        cultural_score: scores.dimensions.find(d => d.dimension === 'cultural')?.score,
        embedding_score: scores.dimensions.find(d => d.dimension === 'embedding')?.score,
        velocity_score: scores.dimensions.find(d => d.dimension === 'velocity')?.score,
        results,
        updated_at: new Date().toISOString(),
      })
      .eq('id', assessmentId)

    if (updateError) throw updateError

    // Update session if exists
    if (session?.id) {
      await supabase
        .from('assessment_sessions')
        .update({
          questions_answered: answeredCount,
          questions_skipped: responses?.filter(r => r.skipped).length || 0,
          last_activity_at: new Date().toISOString(),
        })
        .eq('id', session.id)
    }

    // Optionally create Mind Reasoner profile for advanced analysis
    let mindReasonerInfo = null
    const org = Array.isArray(assessment.organizations)
      ? assessment.organizations[0]
      : assessment.organizations

    if (createMindReasonerProfile && org?.mind_reasoner_enabled) {
      // Create organization mind record for future Mind Reasoner integration
      const { data: orgMind, error: mindError } = await supabase
        .from('organization_minds')
        .insert({
          organization_id: org.id,
          mind_reasoner_mind_id: `assessment-${assessmentId}`,
          user_id: user.id,
          name: `Assessment: ${assessment.assessment_name || 'AI Maturity'}`,
          description: `Generated from assessment completed on ${new Date().toLocaleDateString()}`,
          mind_type: 'individual',
          psychometric_profile: results.psychometricProfile,
          profile_confidence: results.psychometricProfile.confidence,
        })
        .select()
        .single()

      if (!mindError && orgMind) {
        mindReasonerInfo = {
          mindId: orgMind.id,
          status: 'profile_generated',
          message: 'Psychometric profile generated from assessment responses',
        }
      }
    }

    return NextResponse.json(successResponse({
      message: 'Assessment completed successfully',
      assessmentId,
      results,
      mindReasonerInfo,
    }))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
