/**
 * Courses API - List & Create
 * GET /api/courses - List courses with filtering
 * POST /api/courses - Create new course
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  validateQueryParams,
  validateRequest,
  courseFilterSchema,
  createCourseSchema,
} from '@/lib/api/validation'
import {
  APIErrors,
  successResponse,
  errorResponse,
  handleUnknownError,
} from '@/lib/api/errors'
import { requireAuth, requireRole } from '@/lib/api/auth'
import { enforceRateLimit } from '@/lib/api/rate-limit'

/**
 * GET /api/courses
 * List courses with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Validate query parameters
    const validation = validateQueryParams(courseFilterSchema, searchParams)
    if (!validation.success) {
      return NextResponse.json(
        errorResponse(APIErrors.INVALID_QUERY_PARAMS(validation.errors)),
        { status: 400 }
      )
    }

    const filters = validation.data
    const supabase = await createClient()

    // Build query - using actual database schema
    // Note: courses table uses instructor_name (text) not instructor_id (FK)
    // and is_published (boolean) instead of status (enum)
    let query = supabase
      .from('courses')
      .select(`
        *,
        enrollments:course_enrollments(count)
      `, { count: 'exact' })

    // Apply filters
    if (filters.pillar) {
      query = query.eq('pillar', filters.pillar)
    }

    if (filters.difficulty) {
      query = query.eq('level', filters.difficulty)
    }

    if (filters.status && filters.status !== 'all') {
      // Map status to is_published boolean
      query = query.eq('is_published', filters.status === 'published')
    } else if (!filters.status) {
      // Default to published courses only for non-admin requests
      query = query.eq('is_published', true)
    }
    // If status=all, don't filter by is_published (admin view)

    if (filters.tags) {
      const tags = filters.tags.split(',').map(t => t.trim())
      query = query.overlaps('tags', tags)
    }

    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      )
    }

    // Apply pagination
    const from = ((filters.page || 1) - 1) * (filters.limit || 10)
    const to = from + (filters.limit || 10) - 1

    query = query
      .range(from, to)
      .order('created_at', { ascending: false })

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json(
      successResponse(data, {
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 10,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / (filters.limit || 10)),
        },
      })
    )
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}

/**
 * POST /api/courses
 * Create new course (instructors and admins only)
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication and role
    const { user, role } = await requireRole(['instructor', 'admin'])

    // Enforce rate limit
    await enforceRateLimit(request, 'standard', user.id)

    // Parse and validate request body
    const body = await request.json()
    const validation = validateRequest(createCourseSchema, body)

    if (!validation.success) {
      return NextResponse.json(
        errorResponse(APIErrors.VALIDATION_ERROR(validation.errors)),
        { status: 400 }
      )
    }

    const courseData = validation.data
    const supabase = await createClient()

    // Create course - using actual database schema
    // Note: instructor_name is text field, not foreign key
    const { data: userData } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const { data, error } = await supabase
      .from('courses')
      .insert({
        title: courseData.title,
        description: courseData.description,
        instructor_name: userData?.full_name || 'Unknown',
        pillar: courseData.pillar,
        level: courseData.difficulty || 'beginner',
        duration_hours: courseData.duration ? parseInt(courseData.duration) : null,
        price_amount: courseData.price?.amount || 0,
        currency: courseData.price?.currency || 'USD',
        learning_outcomes: courseData.learningOutcomes,
        prerequisites: courseData.prerequisites,
        thumbnail_url: courseData.thumbnailUrl,
        is_published: false, // Always start as unpublished
        metadata: { syllabus: courseData.syllabus, tags: courseData.tags }
      })
      .select('*')
      .single()

    if (error) throw error

    return NextResponse.json(successResponse(data), { status: 201 })
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
