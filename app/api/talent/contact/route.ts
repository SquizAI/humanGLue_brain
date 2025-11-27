/**
 * Talent Contact API
 * POST /api/talent/contact - Request engagement with expert
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateRequest, contactTalentSchema } from '@/lib/api/validation'
import {
  APIErrors,
  successResponse,
  errorResponse,
  handleUnknownError,
} from '@/lib/api/errors'
import { requireAuth } from '@/lib/api/auth'
import { enforceRateLimit } from '@/lib/api/rate-limit'

/**
 * POST /api/talent/contact
 * Request engagement with talent expert
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Enforce strict rate limit (prevent spam)
    await enforceRateLimit(request, 'strict', user.id)

    // Parse and validate request body
    const body = await request.json()
    const validation = validateRequest(contactTalentSchema, body)

    if (!validation.success) {
      return NextResponse.json(
        errorResponse(APIErrors.VALIDATION_ERROR(validation.errors)),
        { status: 400 }
      )
    }

    const contactData = validation.data
    const supabase = await createClient()

    // Get talent profile to verify it exists and get expert user ID
    const { data: talentProfile, error: talentError } = await supabase
      .from('talent_profiles')
      .select(`
        id,
        user_id,
        is_public,
        accepting_clients,
        hourly_rate,
        user:users!talent_profiles_user_id_fkey(
          id,
          full_name,
          email
        )
      `)
      .eq('id', contactData.talentId)
      .single()

    if (talentError) {
      if (talentError.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse(APIErrors.NOT_FOUND('Talent profile')),
          { status: 404 }
        )
      }
      throw talentError
    }

    // Verify profile is public and accepting clients
    if (!talentProfile.is_public || !talentProfile.accepting_clients) {
      return NextResponse.json(
        errorResponse(APIErrors.CONFLICT('This expert is not currently accepting new clients')),
        { status: 409 }
      )
    }

    // Calculate estimated budget
    const estimatedBudget = contactData.estimatedHours * talentProfile.hourly_rate

    // Create engagement request
    const { data: engagement, error: engagementError } = await supabase
      .from('engagements')
      .insert({
        client_id: user.id,
        expert_id: talentProfile.user_id,
        organization_id: contactData.organizationId,
        focus_area: contactData.focusArea,
        hours_total: contactData.estimatedHours,
        hours_used: 0,
        hourly_rate: talentProfile.hourly_rate,
        status: 'pending',
        initial_message: contactData.message,
        timeline: contactData.timeline,
        deliverables: {
          requested: [],
          completed: [],
        },
      })
      .select(`
        *,
        client:users!engagements_client_id_fkey(
          id,
          full_name,
          email,
          company_name
        ),
        expert:users!engagements_expert_id_fkey(
          id,
          full_name,
          email
        ),
        organization:organizations(
          id,
          name
        )
      `)
      .single()

    if (engagementError) throw engagementError

    // TODO: Send notification email to expert
    // This would be handled by a separate email service

    return NextResponse.json(
      successResponse(
        {
          ...engagement,
          estimatedBudget,
        },
        {
          message: 'Engagement request sent successfully. The expert will review and respond shortly.',
        }
      ),
      { status: 201 }
    )
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
