/**
 * Assessments API - Individual Assessment Operations
 * GET /api/assessments/[id] - Get assessment details
 * PATCH /api/assessments/[id] - Update assessment
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  APIErrors,
  successResponse,
  errorResponse,
  handleUnknownError,
} from '@/lib/api/errors'
import { requireAuth, requireOwnership } from '@/lib/api/auth'

/**
 * GET /api/assessments/[id]
 * Get assessment details with answers
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const user = await requireAuth()
    const supabase = createClient()

    const { data, error } = await supabase
      .from('assessments')
      .select(`
        *,
        organization:organizations(
          id,
          name,
          slug
        ),
        answers:assessment_answers(
          id,
          question_id,
          dimension,
          answer_type,
          answer_value,
          answer_text,
          question_weight,
          created_at
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse(APIErrors.NOT_FOUND('Assessment')),
          { status: 404 }
        )
      }
      throw error
    }

    // Check ownership
    await requireOwnership(user, data.user_id)

    return NextResponse.json(successResponse(data))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}

/**
 * PATCH /api/assessments/[id]
 * Update assessment (mark as completed, etc.)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const user = await requireAuth()
    const supabase = createClient()

    // Get assessment to verify ownership
    const { data: assessment, error: fetchError } = await supabase
      .from('assessments')
      .select('user_id, status')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse(APIErrors.NOT_FOUND('Assessment')),
          { status: 404 }
        )
      }
      throw fetchError
    }

    // Check ownership
    await requireOwnership(user, assessment.user_id)

    // Only allow updating in_progress assessments
    if (assessment.status !== 'in_progress') {
      return NextResponse.json(
        errorResponse(APIErrors.CONFLICT('Cannot update completed or abandoned assessment')),
        { status: 409 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { status } = body

    if (!status || !['completed', 'abandoned'].includes(status)) {
      return NextResponse.json(
        errorResponse(APIErrors.VALIDATION_ERROR({ status: 'Must be completed or abandoned' })),
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }

    // Update assessment
    const { data, error } = await supabase
      .from('assessments')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        organization:organizations(
          id,
          name,
          slug
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
