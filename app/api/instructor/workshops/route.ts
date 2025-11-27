/**
 * Instructor Workshops Management API
 * @endpoint GET /api/instructor/workshops
 * @endpoint POST /api/instructor/workshops
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireInstructor, getPaginationParams } from '@/lib/api/instructor-auth'
import { handleAPIError, paginatedResponse, successResponse, logError, APIErrors } from '@/lib/api/instructor-errors'
import { getInstructorWorkshopsQuerySchema, createWorkshopSchema } from '@/lib/validation/instructor-schemas'

// ============================================================================
// GET /api/instructor/workshops
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize
    const { instructorId } = await requireInstructor(request)
    const supabase = await createClient()

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams
    const query = getInstructorWorkshopsQuerySchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      status: searchParams.get('status'),
      pillar: searchParams.get('pillar'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
    })

    const { page, limit, offset } = getPaginationParams(searchParams)

    // Build base query
    let workshopsQuery = supabase
      .from('workshops')
      .select('*', { count: 'exact' })
      .eq('instructor_id', instructorId)

    // Apply status filter
    if (query.status !== 'all') {
      if (query.status === 'upcoming') {
        workshopsQuery = workshopsQuery
          .eq('status', 'published')
          .gte('start_time', new Date().toISOString())
      } else if (query.status === 'in-progress') {
        const now = new Date().toISOString()
        workshopsQuery = workshopsQuery
          .eq('status', 'published')
          .lte('start_time', now)
          .gte('end_time', now)
      } else if (query.status === 'completed') {
        workshopsQuery = workshopsQuery
          .eq('status', 'completed')
          .or(`status.eq.published,status.eq.completed`)
          .lte('end_time', new Date().toISOString())
      } else {
        workshopsQuery = workshopsQuery.eq('status', query.status)
      }
    }

    // Apply pillar filter
    if (query.pillar) {
      workshopsQuery = workshopsQuery.eq('pillar', query.pillar)
    }

    // Apply date range filter
    if (query.startDate) {
      workshopsQuery = workshopsQuery.gte('start_time', query.startDate)
    }
    if (query.endDate) {
      workshopsQuery = workshopsQuery.lte('start_time', query.endDate)
    }

    // Apply sorting
    const sortColumn = query.sortBy === 'enrollments'
      ? 'capacity_total' // Proxy for enrollments
      : query.sortBy === 'revenue'
        ? 'price_amount'
        : 'start_time'

    workshopsQuery = workshopsQuery.order(
      sortColumn,
      { ascending: query.sortOrder === 'asc' }
    )

    // Execute query with pagination
    const { data: workshops, error: workshopsError, count } = await workshopsQuery
      .range(offset, offset + limit - 1)

    if (workshopsError) {
      throw workshopsError
    }

    // Get registration counts for each workshop
    const workshopsWithStats = await Promise.all(
      workshops?.map(async (workshop) => {
        const { count: registrationsCount } = await supabase
          .from('workshop_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('workshop_id', workshop.id)
          .in('status', ['registered', 'attended'])

        const { count: attendedCount } = await supabase
          .from('workshop_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('workshop_id', workshop.id)
          .eq('status', 'attended')

        return {
          id: workshop.id,
          title: workshop.title,
          slug: workshop.slug,
          description: workshop.description,
          pillar: workshop.pillar,
          level: workshop.level,
          format: workshop.format,
          location: workshop.location || undefined,
          meetingUrl: workshop.meeting_url || undefined,
          durationHours: workshop.duration_hours,
          capacityTotal: workshop.capacity_total,
          capacityRemaining: workshop.capacity_remaining,
          registrationsCount: registrationsCount || 0,
          attendedCount: attendedCount || 0,
          priceAmount: workshop.price_amount,
          priceEarlyBird: workshop.price_early_bird || undefined,
          earlyBirdDeadline: workshop.early_bird_deadline || undefined,
          startTime: workshop.start_time,
          endTime: workshop.end_time,
          timezone: workshop.timezone,
          status: workshop.status,
          thumbnailUrl: workshop.thumbnail_url || undefined,
          materialsUrl: workshop.materials_url || undefined,
          recordingUrl: workshop.recording_url || undefined,
          createdAt: workshop.created_at,
          updatedAt: workshop.updated_at,
        }
      }) || []
    )

    return paginatedResponse(workshopsWithStats, {
      page,
      limit,
      total: count || 0,
    })

  } catch (error) {
    logError(error, { endpoint: 'GET /api/instructor/workshops' })
    return handleAPIError(error)
  }
}

// ============================================================================
// POST /api/instructor/workshops
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize
    const { instructorId, user } = await requireInstructor(request)
    const supabase = await createClient()

    // Parse and validate request body
    const body = await request.json()
    const validated = createWorkshopSchema.parse(body)

    // Get instructor info for the workshop
    const { data: instructorData } = await supabase
      .from('users')
      .select('full_name, avatar_url, metadata')
      .eq('id', instructorId)
      .single()

    const instructorBio = instructorData?.metadata?.bio || ''

    // Generate slug from title
    const slug = validated.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36)

    // Create workshop
    const { data: workshop, error: workshopError } = await supabase
      .from('workshops')
      .insert({
        title: validated.title,
        slug,
        description: validated.description,
        pillar: validated.pillar,
        level: validated.level,
        instructor_id: instructorId,
        instructor_name: instructorData?.full_name || user.email || '',
        instructor_bio: instructorBio,
        instructor_avatar_url: instructorData?.avatar_url || null,
        format: validated.format,
        location: validated.location,
        meeting_url: validated.meetingUrl,
        duration_hours: validated.durationHours,
        capacity_total: validated.capacityTotal,
        capacity_remaining: validated.capacityTotal,
        waitlist_enabled: validated.waitlistEnabled,
        price_amount: validated.priceAmount,
        price_early_bird: validated.priceEarlyBird,
        early_bird_deadline: validated.earlyBirdDeadline,
        start_time: validated.startTime,
        end_time: validated.endTime,
        timezone: validated.timezone,
        status: 'draft',
      })
      .select()
      .single()

    if (workshopError) {
      throw workshopError
    }

    return successResponse(
      {
        id: workshop.id,
        slug: workshop.slug,
        status: workshop.status,
        createdAt: workshop.created_at,
      },
      undefined,
      201
    )

  } catch (error) {
    logError(error, { endpoint: 'POST /api/instructor/workshops' })
    return handleAPIError(error)
  }
}
