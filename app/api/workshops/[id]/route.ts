/**
 * Workshops API - Individual Workshop Operations
 * GET /api/workshops/[id] - Get workshop details
 * PATCH /api/workshops/[id] - Update workshop
 * DELETE /api/workshops/[id] - Delete workshop
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateRequest, updateWorkshopSchema } from '@/lib/api/validation'
import {
  APIErrors,
  successResponse,
  errorResponse,
  handleUnknownError,
} from '@/lib/api/errors'
import { requireAuth, requireOwnership } from '@/lib/api/auth'
import { enforceRateLimit } from '@/lib/api/rate-limit'

/**
 * GET /api/workshops/[id]
 * Get workshop details with instructor and registration info
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const supabase = createClient()

    const { data, error } = await supabase
      .from('workshops')
      .select(`
        *,
        instructor:users!workshops_instructor_id_fkey(
          id,
          full_name,
          avatar_url,
          bio
        ),
        registrations:workshop_registrations(
          count
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse(APIErrors.NOT_FOUND('Workshop')),
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json(successResponse(data))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}

/**
 * PATCH /api/workshops/[id]
 * Update workshop (owner or admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const user = await requireAuth()
    const supabase = createClient()

    // Enforce rate limit
    await enforceRateLimit(request, 'standard', user.id)

    // Get workshop to verify ownership
    const { data: workshop, error: fetchError } = await supabase
      .from('workshops')
      .select('instructor_id, capacity_remaining, capacity_total')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse(APIErrors.NOT_FOUND('Workshop')),
          { status: 404 }
        )
      }
      throw fetchError
    }

    // Check ownership
    await requireOwnership(user, workshop.instructor_id)

    // Parse and validate request body
    const body = await request.json()
    const validation = validateRequest(updateWorkshopSchema, body)

    if (!validation.success) {
      return NextResponse.json(
        errorResponse(APIErrors.VALIDATION_ERROR(validation.errors)),
        { status: 400 }
      )
    }

    const updates = validation.data

    // Build update object
    const updateData: Record<string, unknown> = {}

    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.pillar !== undefined) updateData.pillar = updates.pillar
    if (updates.level !== undefined) updateData.level = updates.level
    if (updates.format !== undefined) updateData.format = updates.format
    if (updates.outcomes !== undefined) updateData.outcomes = updates.outcomes
    if (updates.tags !== undefined) updateData.tags = updates.tags
    if (updates.prerequisites !== undefined) updateData.prerequisites = updates.prerequisites
    if (updates.materials !== undefined) updateData.materials = updates.materials

    if (updates.schedule) {
      if (updates.schedule.date) updateData.schedule_date = updates.schedule.date
      if (updates.schedule.time) updateData.schedule_time = updates.schedule.time
      if (updates.schedule.duration) updateData.schedule_duration = updates.schedule.duration
      if (updates.schedule.timezone) updateData.schedule_timezone = updates.schedule.timezone
    }

    if (updates.capacity) {
      if (updates.capacity.total !== undefined) {
        updateData.capacity_total = updates.capacity.total
        // Only update remaining if increasing capacity
        const currentRemaining = workshop.capacity_remaining || 0
        const currentTotal = workshop.capacity_total || 0
        const difference = updates.capacity.total - currentTotal
        if (difference > 0) {
          updateData.capacity_remaining = currentRemaining + difference
        }
      }
    }

    if (updates.price) {
      if (updates.price.amount !== undefined) updateData.price_amount = updates.price.amount
      if (updates.price.earlyBird !== undefined) updateData.price_early_bird = updates.price.earlyBird
      if (updates.price.currency !== undefined) updateData.price_currency = updates.price.currency
    }

    updateData.updated_at = new Date().toISOString()

    // Update workshop
    const { data, error } = await supabase
      .from('workshops')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        instructor:users!workshops_instructor_id_fkey(
          id,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (error) throw error

    return NextResponse.json(successResponse(data))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}

/**
 * DELETE /api/workshops/[id]
 * Delete workshop (owner or admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const user = await requireAuth()
    const supabase = createClient()

    // Get workshop to verify ownership
    const { data: workshop, error: fetchError } = await supabase
      .from('workshops')
      .select('instructor_id, status')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse(APIErrors.NOT_FOUND('Workshop')),
          { status: 404 }
        )
      }
      throw fetchError
    }

    // Check ownership
    await requireOwnership(user, workshop.instructor_id)

    // Check if workshop has registrations
    const { count } = await supabase
      .from('workshop_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('workshop_id', id)

    if (count && count > 0) {
      // Don't delete if there are registrations, archive instead
      const { error: archiveError } = await supabase
        .from('workshops')
        .update({ status: 'cancelled' })
        .eq('id', id)

      if (archiveError) throw archiveError

      return NextResponse.json(
        successResponse({
          message: 'Workshop cancelled due to existing registrations',
          status: 'cancelled'
        })
      )
    }

    // Delete workshop
    const { error } = await supabase
      .from('workshops')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json(
      successResponse({ message: 'Workshop deleted successfully' })
    )
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
