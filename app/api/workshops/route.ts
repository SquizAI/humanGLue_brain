/**
 * Workshops API - List & Create
 * GET /api/workshops - List workshops with filtering
 * POST /api/workshops - Create new workshop
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  validateQueryParams,
  validateRequest,
  workshopFilterSchema,
  createWorkshopSchema,
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
 * GET /api/workshops
 * List workshops with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Validate query parameters
    const validation = validateQueryParams(workshopFilterSchema, searchParams)
    if (!validation.success) {
      return NextResponse.json(
        errorResponse(APIErrors.INVALID_QUERY_PARAMS(validation.errors)),
        { status: 400 }
      )
    }

    const filters = validation.data
    const supabase = await createClient()

    // Build query
    let query = supabase
      .from('workshops')
      .select(`
        *,
        instructor:users!workshops_instructor_id_fkey(
          id,
          full_name,
          avatar_url
        ),
        registrations:workshop_registrations(count)
      `, { count: 'exact' })

    // Apply filters
    if (filters.pillar) {
      query = query.eq('pillar', filters.pillar)
    }

    if (filters.level) {
      query = query.eq('level', filters.level)
    }

    if (filters.format) {
      query = query.eq('format', filters.format)
    }

    if (filters.status) {
      query = query.eq('status', filters.status)
    } else {
      // Default to published workshops only
      query = query.eq('status', 'published')
    }

    if (filters.isFeatured !== undefined) {
      query = query.eq('is_featured', filters.isFeatured)
    }

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
      .order('is_featured', { ascending: false })
      .order('schedule_date', { ascending: true })

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
 * POST /api/workshops
 * Create new workshop (instructors and admins only)
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication and role
    const { user, role } = await requireRole(['instructor', 'admin'])

    // Enforce rate limit
    await enforceRateLimit(request, 'standard', user.id)

    // Parse and validate request body
    const body = await request.json()
    const validation = validateRequest(createWorkshopSchema, body)

    if (!validation.success) {
      return NextResponse.json(
        errorResponse(APIErrors.VALIDATION_ERROR(validation.errors)),
        { status: 400 }
      )
    }

    const workshopData = validation.data
    const supabase = await createClient()

    // Create workshop
    const { data, error } = await supabase
      .from('workshops')
      .insert({
        title: workshopData.title,
        description: workshopData.description,
        instructor_id: user.id,
        pillar: workshopData.pillar,
        level: workshopData.level,
        format: workshopData.format,
        schedule_date: workshopData.schedule.date,
        schedule_time: workshopData.schedule.time,
        schedule_duration: workshopData.schedule.duration,
        schedule_timezone: workshopData.schedule.timezone,
        capacity_total: workshopData.capacity.total,
        capacity_remaining: workshopData.capacity.total,
        price_amount: workshopData.price.amount,
        price_early_bird: workshopData.price.earlyBird,
        price_currency: workshopData.price.currency,
        outcomes: workshopData.outcomes,
        tags: workshopData.tags,
        prerequisites: workshopData.prerequisites,
        materials: workshopData.materials,
        status: 'draft', // Always start as draft
      })
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

    return NextResponse.json(successResponse(data), { status: 201 })
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
