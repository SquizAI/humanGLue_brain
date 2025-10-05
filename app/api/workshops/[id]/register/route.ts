/**
 * Workshop Registration API
 * POST /api/workshops/[id]/register - Register for workshop
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  APIErrors,
  successResponse,
  errorResponse,
  handleUnknownError,
} from '@/lib/api/errors'
import { requireAuth } from '@/lib/api/auth'
import { enforceRateLimit } from '@/lib/api/rate-limit'

/**
 * POST /api/workshops/[id]/register
 * Register user for workshop (requires authentication)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: workshopId } = params
    const user = await requireAuth()

    // Enforce rate limit
    await enforceRateLimit(request, 'standard', user.id)

    const supabase = createClient()

    // Get workshop details
    const { data: workshop, error: workshopError } = await supabase
      .from('workshops')
      .select('id, title, capacity_remaining, price_amount, price_early_bird, status')
      .eq('id', workshopId)
      .single()

    if (workshopError) {
      if (workshopError.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse(APIErrors.NOT_FOUND('Workshop')),
          { status: 404 }
        )
      }
      throw workshopError
    }

    // Check if workshop is published
    if (workshop.status !== 'published') {
      return NextResponse.json(
        errorResponse(APIErrors.CONFLICT('Workshop is not available for registration')),
        { status: 409 }
      )
    }

    // Check capacity
    if (workshop.capacity_remaining <= 0) {
      return NextResponse.json(
        errorResponse(APIErrors.CAPACITY_EXCEEDED()),
        { status: 409 }
      )
    }

    // Check if already registered
    const { data: existingRegistration } = await supabase
      .from('workshop_registrations')
      .select('id, status')
      .eq('workshop_id', workshopId)
      .eq('user_id', user.id)
      .single()

    if (existingRegistration && existingRegistration.status !== 'cancelled') {
      return NextResponse.json(
        errorResponse(APIErrors.ALREADY_REGISTERED()),
        { status: 409 }
      )
    }

    // Determine price (early bird if available, otherwise regular)
    const price = workshop.price_early_bird || workshop.price_amount

    // Create registration
    const { data: registration, error: regError } = await supabase
      .from('workshop_registrations')
      .insert({
        workshop_id: workshopId,
        user_id: user.id,
        status: price > 0 ? 'pending_payment' : 'registered',
        price_paid: price,
      })
      .select(`
        *,
        workshop:workshops(
          id,
          title,
          schedule_date,
          schedule_time,
          instructor:users!workshops_instructor_id_fkey(
            id,
            full_name,
            email
          )
        )
      `)
      .single()

    if (regError) throw regError

    // If free workshop, decrement capacity immediately
    if (price === 0) {
      const { error: capacityError } = await supabase
        .from('workshops')
        .update({ capacity_remaining: workshop.capacity_remaining - 1 })
        .eq('id', workshopId)

      if (capacityError) throw capacityError
    }

    // Return registration with payment info if needed
    const response = {
      ...registration,
      requiresPayment: price > 0,
      amount: price,
    }

    return NextResponse.json(
      successResponse(response, {
        message: price > 0
          ? 'Registration created. Payment required to complete enrollment.'
          : 'Successfully registered for workshop',
      }),
      { status: 201 }
    )
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
