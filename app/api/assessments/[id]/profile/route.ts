/**
 * Psychometric Profile API
 * GET /api/assessments/[id]/profile - Get psychometric profile for assessment
 * POST /api/assessments/[id]/profile - Generate enhanced profile using Mind Reasoner
 *
 * This endpoint provides:
 * 1. Assessment-derived psychometric profile
 * 2. Learning recommendations based on profile
 * 3. Team compatibility analysis (if team context)
 * 4. Mind Reasoner enhanced profiling (optional)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, handleUnknownError, APIErrors, APIError } from '@/lib/api/errors'
import { requireAuth } from '@/lib/api/auth'
import {
  mapAssessmentToProfile,
  generateLearningRecommendations,
  compareProfiles,
  analyzeTeamDynamics,
  PsychometricProfile,
} from '@/lib/services/mind-reasoner'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Helper to create a full profile from partial
function createFullProfile(partial: Partial<PsychometricProfile>, mindId: string = ''): PsychometricProfile {
  return {
    mindId,
    snapshotId: undefined,
    communicationStyle: partial.communicationStyle || 'diplomatic',
    listeningStyle: partial.listeningStyle || 'active',
    feedbackPreference: partial.feedbackPreference || 'direct',
    conflictStyle: partial.conflictStyle || 'collaborating',
    decisionMaking: partial.decisionMaking || 'analytical',
    problemSolving: partial.problemSolving || 'systematic',
    informationProcessing: partial.informationProcessing || 'sequential',
    learningStyle: partial.learningStyle || 'visual',
    riskTolerance: partial.riskTolerance || 'moderate',
    changeReadiness: partial.changeReadiness || 'adaptable',
    workStyle: partial.workStyle || 'collaborative',
    motivationType: partial.motivationType || 'balanced',
    persuasionStyle: partial.persuasionStyle || 'logical',
    leadershipStyle: partial.leadershipStyle || 'coaching',
    influenceApproach: partial.influenceApproach || 'consultative',
    aiReadiness: partial.aiReadiness || 'curious',
    technologyAdoption: partial.technologyAdoption || 'early_majority',
    dataComfort: partial.dataComfort || 'moderate',
    automationOpenness: partial.automationOpenness || 'selective',
    selfAwareness: partial.selfAwareness || 'moderate',
    empathy: partial.empathy || 'moderate',
    emotionalRegulation: partial.emotionalRegulation || 'moderate',
    socialSkills: partial.socialSkills || 'moderate',
    teamRole: partial.teamRole || 'contributor',
    collaborationPreference: partial.collaborationPreference || 'hybrid',
    meetingStyle: partial.meetingStyle || 'structured',
    motivators: partial.motivators || [],
    stressors: partial.stressors || [],
    strengths: partial.strengths || [],
    growthAreas: partial.growthAreas || [],
    values: partial.values || [],
    analyzedAt: partial.analyzedAt,
    confidence: partial.confidence,
  }
}

/**
 * GET /api/assessments/[id]/profile
 * Get psychometric profile for a completed assessment
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: assessmentId } = await params

    const searchParams = request.nextUrl.searchParams
    const includeRecommendations = searchParams.get('recommendations') !== 'false'
    const includeTeamContext = searchParams.get('teamContext') === 'true'
    const compareWithId = searchParams.get('compareWith')

    const supabase = await createClient()

    // Get assessment with results
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select(`
        *,
        organizations(id, name, industry),
        organization_minds(
          id,
          psychometric_profile,
          profile_confidence,
          latest_snapshot_status
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

    // Check access
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const isAdmin = userRole?.role === 'admin' || userRole?.role === 'super_admin_full'
    const isOwner = assessment.user_id === user.id

    // Check organization membership
    let hasOrgAccess = false
    if (assessment.organization_id) {
      const { data: membership } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', assessment.organization_id)
        .eq('user_id', user.id)
        .single()

      hasOrgAccess = !!membership
    }

    if (!isAdmin && !isOwner && !hasOrgAccess) {
      return NextResponse.json(
        errorResponse(APIErrors.FORBIDDEN()),
        { status: 403 }
      )
    }

    // Check if assessment is completed
    if (assessment.status !== 'completed') {
      return NextResponse.json(
        errorResponse(
          APIErrors.BAD_REQUEST('Psychometric profile is only available for completed assessments')
        ),
        { status: 400 }
      )
    }

    // Get profile from results or organization_minds
    const orgMind = Array.isArray(assessment.organization_minds)
      ? assessment.organization_minds[0]
      : assessment.organization_minds

    let profile: Partial<PsychometricProfile> = {}
    let profileSource = 'assessment'

    if (orgMind?.psychometric_profile) {
      profile = orgMind.psychometric_profile as Partial<PsychometricProfile>
      profileSource = orgMind.latest_snapshot_status === 'completed' ? 'mind_reasoner' : 'assessment'
    } else if (assessment.results?.psychometricProfile) {
      profile = assessment.results.psychometricProfile as Partial<PsychometricProfile>
    } else {
      // Generate from responses if not cached
      const { data: responses } = await supabase
        .from('assessment_responses')
        .select(`
          *,
          question_bank(dimension, subdimension, weight)
        `)
        .eq('assessment_id', assessmentId)
        .eq('skipped', false)

      if (responses && responses.length > 0) {
        const assessmentResponses = responses.map(r => ({
          dimension: (r.question_bank as { dimension?: string })?.dimension || 'individual',
          subdimension: (r.question_bank as { subdimension?: string })?.subdimension,
          value: (r.metadata as { answer_value?: number })?.answer_value || r.ai_confidence_score || 5,
          questionCode: (r.question_bank as { question_code?: string })?.question_code || r.question_code,
        }))

        profile = mapAssessmentToProfile(assessmentResponses)
        profileSource = 'generated'
      }
    }

    const fullProfile = createFullProfile(profile, assessmentId)

    // Build response
    const response: Record<string, unknown> = {
      assessmentId,
      profileSource,
      profile: fullProfile,
      confidence: orgMind?.profile_confidence || profile.confidence || 70,
      analyzedAt: profile.analyzedAt || assessment.completed_at,
    }

    // Include learning recommendations if requested
    if (includeRecommendations) {
      response.learningRecommendations = generateLearningRecommendations(fullProfile)
    }

    // Include team context analysis if requested
    if (includeTeamContext && assessment.organization_id) {
      // Get other team members' profiles
      const { data: teamMinds } = await supabase
        .from('organization_minds')
        .select('psychometric_profile, profile_confidence')
        .eq('organization_id', assessment.organization_id)
        .eq('is_active', true)
        .not('psychometric_profile', 'is', null)

      if (teamMinds && teamMinds.length > 1) {
        const teamProfiles = teamMinds
          .filter(m => m.psychometric_profile)
          .map(m => createFullProfile(m.psychometric_profile as Partial<PsychometricProfile>))

        response.teamDynamics = analyzeTeamDynamics(teamProfiles)
      }
    }

    // Compare with another assessment if requested
    if (compareWithId) {
      const { data: compareAssessment } = await supabase
        .from('assessments')
        .select('results')
        .eq('id', compareWithId)
        .eq('status', 'completed')
        .single()

      if (compareAssessment?.results?.psychometricProfile) {
        const compareProfile = createFullProfile(
          compareAssessment.results.psychometricProfile as Partial<PsychometricProfile>
        )
        response.comparison = compareProfiles(fullProfile, compareProfile)
      }
    }

    // Add dimension scores for context
    response.dimensionScores = {
      individual: assessment.individual_score,
      leadership: assessment.leadership_score,
      cultural: assessment.cultural_score,
      embedding: assessment.embedding_score,
      velocity: assessment.velocity_score,
      overall: assessment.overall_score,
    }

    return NextResponse.json(successResponse(response))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}

/**
 * POST /api/assessments/[id]/profile
 * Request enhanced psychometric profile (queues Mind Reasoner analysis)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: assessmentId } = await params

    const body = await request.json().catch(() => ({}))
    const { includeMindReasonerAnalysis = false } = body

    const supabase = await createClient()

    // Get assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select(`
        *,
        organizations(
          id,
          name,
          mind_reasoner_enabled,
          mind_reasoner_api_key_encrypted
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

    if (assessment.status !== 'completed') {
      return NextResponse.json(
        errorResponse(APIErrors.BAD_REQUEST('Profile generation requires a completed assessment')),
        { status: 400 }
      )
    }

    // Get responses
    const { data: responses } = await supabase
      .from('assessment_responses')
      .select(`
        *,
        question_bank(dimension, subdimension, weight)
      `)
      .eq('assessment_id', assessmentId)
      .eq('skipped', false)

    if (!responses || responses.length === 0) {
      return NextResponse.json(
        errorResponse(APIErrors.BAD_REQUEST('No assessment responses found')),
        { status: 400 }
      )
    }

    // Map responses to profile
    const assessmentResponses = responses.map(r => ({
      dimension: (r.question_bank as { dimension?: string })?.dimension || 'individual',
      subdimension: (r.question_bank as { subdimension?: string })?.subdimension,
      value: (r.metadata as { answer_value?: number })?.answer_value || r.ai_confidence_score || 5,
      questionCode: (r.question_bank as { question_code?: string })?.question_code || r.question_code,
    }))

    const partialProfile = mapAssessmentToProfile(assessmentResponses)
    const fullProfile = createFullProfile(partialProfile, assessmentId)
    fullProfile.analyzedAt = new Date().toISOString()
    fullProfile.confidence = Math.round((responses.length / 30) * 100) // Estimate based on question count

    // Save to organization_minds if org has Mind Reasoner enabled
    const org = Array.isArray(assessment.organizations)
      ? assessment.organizations[0]
      : assessment.organizations

    let mindRecord = null

    if (org?.id) {
      // Check if mind already exists
      const { data: existingMind } = await supabase
        .from('organization_minds')
        .select('id')
        .eq('organization_id', org.id)
        .eq('user_id', user.id)
        .eq('mind_reasoner_mind_id', `assessment-${assessmentId}`)
        .single()

      if (existingMind) {
        // Update existing
        const { data: updated, error: updateError } = await supabase
          .from('organization_minds')
          .update({
            psychometric_profile: fullProfile,
            profile_confidence: fullProfile.confidence,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingMind.id)
          .select()
          .single()

        if (!updateError) mindRecord = updated
      } else {
        // Create new
        const { data: created, error: createError } = await supabase
          .from('organization_minds')
          .insert({
            organization_id: org.id,
            mind_reasoner_mind_id: `assessment-${assessmentId}`,
            user_id: user.id,
            name: `Assessment Profile: ${assessment.assessment_name || 'AI Maturity'}`,
            description: `Psychometric profile generated from assessment`,
            mind_type: 'individual',
            psychometric_profile: fullProfile,
            profile_confidence: fullProfile.confidence,
            latest_snapshot_status: includeMindReasonerAnalysis ? 'pending' : 'completed',
          })
          .select()
          .single()

        if (!createError) mindRecord = created
      }
    }

    // Update assessment results with profile
    await supabase
      .from('assessments')
      .update({
        results: {
          ...assessment.results,
          psychometricProfile: fullProfile,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', assessmentId)

    // Generate recommendations
    const recommendations = generateLearningRecommendations(fullProfile)

    return NextResponse.json(successResponse({
      message: 'Psychometric profile generated successfully',
      profile: fullProfile,
      recommendations,
      mindRecord: mindRecord ? {
        id: mindRecord.id,
        status: mindRecord.latest_snapshot_status,
      } : null,
      mindReasonerAnalysisQueued: includeMindReasonerAnalysis && org?.mind_reasoner_enabled,
    }), { status: 201 })
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
