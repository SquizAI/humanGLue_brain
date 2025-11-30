/**
 * Organization Mind Detail API
 * GET /api/organizations/[id]/minds/[mindId] - Get mind details
 * PATCH /api/organizations/[id]/minds/[mindId] - Update mind
 * DELETE /api/organizations/[id]/minds/[mindId] - Deactivate mind
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, handleUnknownError, APIErrors } from '@/lib/api/errors'
import { requireAuth } from '@/lib/api/auth'
import {
  generateLearningRecommendations,
  compareProfiles,
  PsychometricProfile,
} from '@/lib/services/mind-reasoner'

interface RouteParams {
  params: Promise<{ id: string; mindId: string }>
}

// Helper to create a full profile from partial
function createFullProfile(partial: Partial<PsychometricProfile>): PsychometricProfile {
  return {
    mindId: partial.mindId || '',
    snapshotId: partial.snapshotId,
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
 * GET /api/organizations/[id]/minds/[mindId]
 * Get detailed mind information including profile and recommendations
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: organizationId, mindId } = await params

    const searchParams = request.nextUrl.searchParams
    const includeRecommendations = searchParams.get('recommendations') !== 'false'
    const includeSimulations = searchParams.get('simulations') === 'true'
    const compareWithMindId = searchParams.get('compareWith')

    const supabase = await createClient()

    // Verify organization membership
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json(
        errorResponse(APIErrors.FORBIDDEN()),
        { status: 403 }
      )
    }

    // Get mind with related data
    const { data: mind, error: mindError } = await supabase
      .from('organization_minds')
      .select(`
        *,
        users:user_id(id, email, user_profile(full_name, avatar_url, title)),
        teams:team_id(id, name, description)
      `)
      .eq('id', mindId)
      .eq('organization_id', organizationId)
      .single()

    if (mindError || !mind) {
      return NextResponse.json(
        errorResponse(APIErrors.NOT_FOUND('Mind')),
        { status: 404 }
      )
    }

    // Build response
    const response: Record<string, unknown> = {
      id: mind.id,
      mindReasonerId: mind.mind_reasoner_mind_id,
      digitalTwinId: mind.mind_reasoner_digital_twin_id,
      name: mind.name,
      description: mind.description,
      type: mind.mind_type,
      userId: mind.user_id,
      teamId: mind.team_id,
      user: mind.users,
      team: mind.teams,
      profile: mind.psychometric_profile,
      confidence: mind.profile_confidence,
      snapshotId: mind.latest_snapshot_id,
      snapshotStatus: mind.latest_snapshot_status,
      snapshotAt: mind.latest_snapshot_at,
      isActive: mind.is_active,
      createdAt: mind.created_at,
      updatedAt: mind.updated_at,
    }

    // Add learning recommendations
    if (includeRecommendations && mind.psychometric_profile) {
      const fullProfile = createFullProfile(mind.psychometric_profile as Partial<PsychometricProfile>)
      response.recommendations = generateLearningRecommendations(fullProfile)
    }

    // Get simulation history if requested
    if (includeSimulations) {
      const { data: simulations } = await supabase
        .from('mind_simulations')
        .select('*')
        .eq('mind_id', mindId)
        .order('created_at', { ascending: false })
        .limit(20)

      response.simulations = simulations?.map(s => ({
        id: s.id,
        scenario: s.scenario,
        model: s.simulation_model,
        result: {
          thinking: s.thinking,
          feeling: s.feeling,
          saying: s.saying,
          acting: s.acting,
        },
        contextType: s.context_type,
        contextId: s.context_id,
        createdAt: s.created_at,
      })) || []
    }

    // Compare with another mind if requested
    if (compareWithMindId && mind.psychometric_profile) {
      const { data: compareMind } = await supabase
        .from('organization_minds')
        .select('psychometric_profile, name')
        .eq('id', compareWithMindId)
        .eq('organization_id', organizationId)
        .single()

      if (compareMind?.psychometric_profile) {
        const profile1 = createFullProfile(mind.psychometric_profile as Partial<PsychometricProfile>)
        const profile2 = createFullProfile(compareMind.psychometric_profile as Partial<PsychometricProfile>)

        response.comparison = {
          compareWithName: compareMind.name,
          ...compareProfiles(profile1, profile2),
        }
      }
    }

    return NextResponse.json(successResponse(response))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}

/**
 * PATCH /api/organizations/[id]/minds/[mindId]
 * Update a mind's information or profile
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: organizationId, mindId } = await params

    const body = await request.json()
    const {
      name,
      description,
      teamId,
      psychometricProfile,
      profileConfidence,
    } = body

    const supabase = await createClient()

    // Verify admin access
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json(
        errorResponse(APIErrors.FORBIDDEN()),
        { status: 403 }
      )
    }

    // Get existing mind
    const { data: existingMind, error: mindError } = await supabase
      .from('organization_minds')
      .select('*')
      .eq('id', mindId)
      .eq('organization_id', organizationId)
      .single()

    if (mindError || !existingMind) {
      return NextResponse.json(
        errorResponse(APIErrors.NOT_FOUND('Mind')),
        { status: 404 }
      )
    }

    // Check permissions: only admins can update others' minds
    const isAdmin = ['admin', 'org_admin'].includes(membership.role)
    const isOwner = existingMind.user_id === user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        errorResponse(APIErrors.FORBIDDEN()),
        { status: 403 }
      )
    }

    // Build update object
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (teamId !== undefined) updates.team_id = teamId

    // Update profile if provided
    if (psychometricProfile) {
      updates.psychometric_profile = {
        ...existingMind.psychometric_profile,
        ...psychometricProfile,
        analyzedAt: new Date().toISOString(),
      }
    }

    if (profileConfidence !== undefined) {
      updates.profile_confidence = Math.max(0, Math.min(100, profileConfidence))
    }

    // Perform update
    const { data: updatedMind, error: updateError } = await supabase
      .from('organization_minds')
      .update(updates)
      .eq('id', mindId)
      .select(`
        *,
        users:user_id(id, email, user_profile(full_name)),
        teams:team_id(id, name)
      `)
      .single()

    if (updateError) throw updateError

    return NextResponse.json(successResponse({
      message: 'Mind updated successfully',
      mind: {
        id: updatedMind.id,
        name: updatedMind.name,
        description: updatedMind.description,
        type: updatedMind.mind_type,
        teamId: updatedMind.team_id,
        profile: updatedMind.psychometric_profile,
        confidence: updatedMind.profile_confidence,
        updatedAt: updatedMind.updated_at,
        user: updatedMind.users,
        team: updatedMind.teams,
      },
    }))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}

/**
 * DELETE /api/organizations/[id]/minds/[mindId]
 * Soft-delete (deactivate) a mind
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: organizationId, mindId } = await params

    const supabase = await createClient()

    // Verify admin access
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json(
        errorResponse(APIErrors.FORBIDDEN()),
        { status: 403 }
      )
    }

    // Get mind
    const { data: mind, error: mindError } = await supabase
      .from('organization_minds')
      .select('id, user_id')
      .eq('id', mindId)
      .eq('organization_id', organizationId)
      .single()

    if (mindError || !mind) {
      return NextResponse.json(
        errorResponse(APIErrors.NOT_FOUND('Mind')),
        { status: 404 }
      )
    }

    // Check permissions
    const isAdmin = ['admin', 'org_admin'].includes(membership.role)
    const isOwner = mind.user_id === user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        errorResponse(APIErrors.FORBIDDEN()),
        { status: 403 }
      )
    }

    // Soft delete by setting is_active to false
    const { error: deleteError } = await supabase
      .from('organization_minds')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', mindId)

    if (deleteError) throw deleteError

    return NextResponse.json(successResponse({
      message: 'Mind deactivated successfully',
      mindId,
    }))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
