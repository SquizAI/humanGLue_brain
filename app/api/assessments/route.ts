/**
 * Assessments API - List & Create
 * GET /api/assessments - List user's assessments
 * POST /api/assessments - Create new assessment
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  validateQueryParams,
  validateRequest,
  assessmentFilterSchema,
  createAssessmentSchema,
} from '@/lib/api/validation'
import {
  APIErrors,
  successResponse,
  errorResponse,
  handleUnknownError,
} from '@/lib/api/errors'
import { requireAuth } from '@/lib/api/auth'
import { enforceRateLimit } from '@/lib/api/rate-limit'

/**
 * GET /api/assessments
 * List user's assessments with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)

    // Validate query parameters
    const validation = validateQueryParams(assessmentFilterSchema, searchParams)
    if (!validation.success) {
      return NextResponse.json(
        errorResponse(APIErrors.INVALID_QUERY_PARAMS(validation.errors)),
        { status: 400 }
      )
    }

    const filters = validation.data
    const supabase = createClient()

    // Build query
    let query = supabase
      .from('assessments')
      .select(`
        *,
        organization:organizations(
          id,
          name,
          slug
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.assessmentType) {
      query = query.eq('assessment_type', filters.assessmentType)
    }

    if (filters.fromDate) {
      query = query.gte('created_at', filters.fromDate)
    }

    if (filters.toDate) {
      query = query.lte('created_at', filters.toDate)
    }

    // Apply pagination
    const from = ((filters.page || 1) - 1) * ((filters.limit || 10) || 10)
    const to = from + ((filters.limit || 10) || 10) - 1

    query = query
      .range(from, to)
      .order('created_at', { ascending: false })

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json(
      successResponse(data, {
        pagination: {
          page: filters.page,
          limit: (filters.limit || 10),
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
 * POST /api/assessments
 * Create new assessment
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Enforce rate limit
    await enforceRateLimit(request, 'standard', user.id)

    // Parse and validate request body
    const body = await request.json()
    const validation = validateRequest(createAssessmentSchema, body)

    if (!validation.success) {
      return NextResponse.json(
        errorResponse(APIErrors.VALIDATION_ERROR(validation.errors)),
        { status: 400 }
      )
    }

    const assessmentData = validation.data
    const supabase = createClient()

    // Create assessment
    const { data, error } = await supabase
      .from('assessments')
      .insert({
        user_id: user.id,
        organization_id: assessmentData.organizationId,
        assessment_type: assessmentData.assessmentType,
        status: 'in_progress',
        individual_score: 0,
        leadership_score: 0,
        cultural_score: 0,
        embedding_score: 0,
        velocity_score: 0,
      })
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

    return NextResponse.json(successResponse(data), { status: 201 })
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
