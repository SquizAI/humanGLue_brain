/**
 * Courses API - Individual Course Operations
 * GET /api/courses/[id] - Get course details
 * PUT /api/courses/[id] - Update course
 * DELETE /api/courses/[id] - Delete course
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateRequest, updateCourseSchema } from '@/lib/api/validation'
import {
  APIErrors,
  successResponse,
  errorResponse,
  handleUnknownError,
} from '@/lib/api/errors'
import { requireAuth, requireOwnership } from '@/lib/api/auth'
import { enforceRateLimit } from '@/lib/api/rate-limit'

/**
 * GET /api/courses/[id]
 * Get course details with instructor and enrollment info
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        instructor:users!courses_instructor_id_fkey(
          id,
          full_name,
          avatar_url,
          bio
        ),
        enrollments:course_enrollments(count),
        modules:course_modules(
          id,
          title,
          description,
          order_index
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse(APIErrors.NOT_FOUND('Course')),
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
 * PUT /api/courses/[id]
 * Update course (owner or admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await requireAuth()
    const supabase = await createClient()

    // Enforce rate limit
    await enforceRateLimit(request, 'standard', user.id)

    // Get course to verify ownership
    const { data: course, error: fetchError } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse(APIErrors.NOT_FOUND('Course')),
          { status: 404 }
        )
      }
      throw fetchError
    }

    // Check ownership
    await requireOwnership(user, course.instructor_id)

    // Parse and validate request body
    const body = await request.json()
    const validation = validateRequest(updateCourseSchema, body)

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
    if (updates.difficulty !== undefined) updateData.difficulty = updates.difficulty
    if (updates.duration !== undefined) updateData.duration = updates.duration
    if (updates.learningOutcomes !== undefined) updateData.learning_outcomes = updates.learningOutcomes
    if (updates.syllabus !== undefined) updateData.syllabus = updates.syllabus
    if (updates.tags !== undefined) updateData.tags = updates.tags
    if (updates.prerequisites !== undefined) updateData.prerequisites = updates.prerequisites
    if (updates.thumbnailUrl !== undefined) updateData.thumbnail_url = updates.thumbnailUrl

    if (updates.price) {
      if (updates.price.amount !== undefined) updateData.price_amount = updates.price.amount
      if (updates.price.currency !== undefined) updateData.price_currency = updates.price.currency
    }

    updateData.updated_at = new Date().toISOString()

    // Update course
    const { data, error } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        instructor:users!courses_instructor_id_fkey(
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
 * DELETE /api/courses/[id]
 * Delete course (owner or admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await requireAuth()
    const supabase = await createClient()

    // Get course to verify ownership
    const { data: course, error: fetchError } = await supabase
      .from('courses')
      .select('instructor_id, status')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse(APIErrors.NOT_FOUND('Course')),
          { status: 404 }
        )
      }
      throw fetchError
    }

    // Check ownership
    await requireOwnership(user, course.instructor_id)

    // Check if course has enrollments
    const { count } = await supabase
      .from('course_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', id)

    if (count && count > 0) {
      // Don't delete if there are enrollments, archive instead
      const { error: archiveError } = await supabase
        .from('courses')
        .update({ status: 'archived' })
        .eq('id', id)

      if (archiveError) throw archiveError

      return NextResponse.json(
        successResponse({
          message: 'Course archived due to existing enrollments',
          status: 'archived'
        })
      )
    }

    // Delete course
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json(
      successResponse({ message: 'Course deleted successfully' })
    )
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
