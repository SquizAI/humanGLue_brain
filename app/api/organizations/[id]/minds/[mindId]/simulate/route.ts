/**
 * Mind Simulation API
 * POST /api/organizations/[id]/minds/[mindId]/simulate - Run a simulation
 *
 * Runs a Mind Reasoner simulation to predict how the mind will respond
 * to a given scenario. Results can be used for:
 * - Communication planning
 * - Change management strategies
 * - Training recommendations
 * - Team dynamics analysis
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, handleUnknownError, APIErrors } from '@/lib/api/errors'
import { requireAuth } from '@/lib/api/auth'
import { mindReasonerService, SimulationResult } from '@/lib/services/mind-reasoner'

interface RouteParams {
  params: Promise<{ id: string; mindId: string }>
}

/**
 * POST /api/organizations/[id]/minds/[mindId]/simulate
 * Run a simulation on a mind
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: organizationId, mindId } = await params

    const body = await request.json()
    const {
      scenario,
      model = 'mind-reasoner-pro',
      contextType,
      contextId,
      saveResult = true,
    } = body

    if (!scenario) {
      return NextResponse.json(
        errorResponse(APIErrors.BAD_REQUEST('Scenario is required')),
        { status: 400 }
      )
    }

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

    // Only admins and team leads can run simulations
    const canSimulate = ['admin', 'org_admin', 'team_lead'].includes(membership.role)
    if (!canSimulate) {
      return NextResponse.json(
        errorResponse(APIErrors.FORBIDDEN()),
        { status: 403 }
      )
    }

    // Get the mind
    const { data: mind, error: mindError } = await supabase
      .from('organization_minds')
      .select(`
        *,
        organizations(
          mind_reasoner_enabled,
          mind_reasoner_api_key_encrypted
        )
      `)
      .eq('id', mindId)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .single()

    if (mindError || !mind) {
      return NextResponse.json(
        errorResponse(APIErrors.NOT_FOUND('Mind')),
        { status: 404 }
      )
    }

    const org = Array.isArray(mind.organizations) ? mind.organizations[0] : mind.organizations

    let simulationResult: SimulationResult

    // Check if Mind Reasoner is configured and mind has been trained
    if (
      org?.mind_reasoner_enabled &&
      mind.latest_snapshot_status === 'completed' &&
      mindReasonerService.isConfigured()
    ) {
      // Use actual Mind Reasoner API
      try {
        simulationResult = await mindReasonerService.simulate(
          mind.mind_reasoner_mind_id,
          scenario,
          model as 'mind-reasoner-pro' | 'mind-reasoner-standard'
        )
      } catch {
        // Fall back to profile-based simulation if API fails
        simulationResult = generateProfileBasedSimulation(
          mind.psychometric_profile,
          scenario
        )
      }
    } else {
      // Generate simulation from psychometric profile
      simulationResult = generateProfileBasedSimulation(
        mind.psychometric_profile,
        scenario
      )
    }

    // Save result if requested
    let savedSimulation = null
    if (saveResult) {
      const { data: saved, error: saveError } = await supabase
        .from('mind_simulations')
        .insert({
          organization_id: organizationId,
          mind_id: mindId,
          scenario,
          simulation_model: model,
          thinking: simulationResult.thinking,
          feeling: simulationResult.feeling,
          saying: simulationResult.saying,
          acting: simulationResult.acting,
          context_type: contextType,
          context_id: contextId,
          created_by: user.id,
        })
        .select()
        .single()

      if (!saveError && saved) {
        savedSimulation = {
          id: saved.id,
          createdAt: saved.created_at,
        }
      }
    }

    return NextResponse.json(successResponse({
      mindId,
      scenario,
      model,
      result: simulationResult,
      source: mind.latest_snapshot_status === 'completed' ? 'mind_reasoner' : 'profile_based',
      saved: savedSimulation,
    }))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}

/**
 * Generate a simulation result based on psychometric profile
 * Used when Mind Reasoner API is not available or mind isn't trained
 */
function generateProfileBasedSimulation(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile: Record<string, any> | null,
  scenario: string
): SimulationResult {
  if (!profile) {
    return {
      thinking: 'Unable to generate simulation without psychometric profile.',
      feeling: 'Neutral - no profile data available.',
      saying: 'I would need more context to respond appropriately.',
      acting: 'Would likely seek more information before taking action.',
    }
  }

  // Extract profile traits
  const commStyle = profile.communicationStyle || 'diplomatic'
  const decisionMaking = profile.decisionMaking || 'analytical'
  const riskTolerance = profile.riskTolerance || 'moderate'
  const changeReadiness = profile.changeReadiness || 'adaptable'
  const aiReadiness = profile.aiReadiness || 'curious'
  const conflictStyle = profile.conflictStyle || 'collaborating'

  // Generate thinking based on decision making style
  let thinking = ''
  switch (decisionMaking) {
    case 'intuitive':
      thinking = `Based on gut feeling and past experience, this scenario feels ${riskTolerance === 'aggressive' ? 'like an opportunity' : 'worth careful consideration'}. `
      break
    case 'analytical':
      thinking = 'Breaking down the components of this scenario to understand cause and effect. Looking for data points and patterns. '
      break
    case 'collaborative':
      thinking = 'Wondering what others would think about this. Should gather input from the team before deciding. '
      break
    case 'decisive':
      thinking = 'The path forward is clear. Need to act quickly and decisively on this. '
      break
    default:
      thinking = 'Analyzing the situation and considering multiple perspectives. '
  }

  // Add change readiness perspective
  if (scenario.toLowerCase().includes('change') || scenario.toLowerCase().includes('new')) {
    switch (changeReadiness) {
      case 'resistant':
        thinking += 'Concerned about the disruption this could cause. What about our current systems?'
        break
      case 'cautious':
        thinking += 'Need to see proven results before committing. What are the risks?'
        break
      case 'adaptable':
        thinking += 'Open to this if the benefits are clear. Let\'s explore the possibilities.'
        break
      case 'embracing':
        thinking += 'Excited about the potential here. How can we move quickly on this?'
        break
    }
  }

  // Add AI-specific perspective if relevant
  if (scenario.toLowerCase().includes('ai') || scenario.toLowerCase().includes('automation')) {
    switch (aiReadiness) {
      case 'skeptical':
        thinking += ' Still not convinced AI can handle the nuances of our work.'
        break
      case 'curious':
        thinking += ' Interested to see how AI could help, but want to understand the limitations.'
        break
      case 'enthusiastic':
        thinking += ' This aligns with our AI transformation goals. Great opportunity!'
        break
      case 'expert':
        thinking += ' I can see exactly how this would work. Let me suggest some technical approaches.'
        break
    }
  }

  // Generate feeling based on risk tolerance and change readiness
  let feeling = ''
  if (riskTolerance === 'conservative') {
    feeling = changeReadiness === 'resistant'
      ? 'Anxious about the potential negative outcomes. Prefer to maintain stability.'
      : 'Cautiously optimistic but would feel better with more guarantees.'
  } else if (riskTolerance === 'aggressive') {
    feeling = changeReadiness === 'embracing'
      ? 'Energized and excited about the possibilities. Ready to move forward.'
      : 'Eager to take action but aware of the need to bring others along.'
  } else {
    feeling = 'Balanced perspective - see both opportunities and risks. Feeling measured about the situation.'
  }

  // Generate saying based on communication style
  let saying = ''
  switch (commStyle) {
    case 'direct':
      saying = 'Here\'s what I think we should do... [provides clear, straightforward recommendation]'
      break
    case 'diplomatic':
      saying = 'I appreciate the different perspectives here. Perhaps we could consider... [offers balanced suggestion]'
      break
    case 'analytical':
      saying = 'Let me share some data points that might help us decide... [presents facts and analysis]'
      break
    case 'expressive':
      saying = 'I\'m really feeling [enthusiasm/concern] about this! Let me paint a picture of what I see... [shares vision]'
      break
    default:
      saying = 'I\'d like to share my thoughts on this... [provides thoughtful response]'
  }

  // Generate acting based on conflict style and decision making
  let acting = ''
  switch (conflictStyle) {
    case 'avoiding':
      acting = 'Would likely defer to others or suggest more time to think before taking action.'
      break
    case 'accommodating':
      acting = 'Would prioritize team harmony and align with the majority preference.'
      break
    case 'competing':
      acting = 'Would advocate strongly for their position and push for their preferred outcome.'
      break
    case 'collaborating':
      acting = 'Would work to find a solution that addresses everyone\'s concerns.'
      break
    case 'compromising':
      acting = 'Would look for middle ground that everyone can accept.'
      break
    default:
      acting = 'Would take thoughtful action after considering the input received.'
  }

  return {
    thinking,
    feeling,
    saying,
    acting,
  }
}
