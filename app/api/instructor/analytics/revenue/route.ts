/**
 * Instructor Analytics - Revenue API
 * @endpoint GET /api/instructor/analytics/revenue
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireInstructor } from '@/lib/api/instructor-auth'
import { handleAPIError, successResponse, logError } from '@/lib/api/instructor-errors'
import { getRevenueQuerySchema } from '@/lib/validation/instructor-schemas'

// ============================================================================
// GET /api/instructor/analytics/revenue
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize
    const { instructorId } = await requireInstructor(request)
    const supabase = await createClient()

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams
    const query = getRevenueQuerySchema.parse({
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      granularity: searchParams.get('granularity') || 'day',
      courseId: searchParams.get('courseId'),
    })

    // Set default date range if not provided (last 90 days)
    const endDate = query.endDate ? new Date(query.endDate) : new Date()
    const startDate = query.startDate
      ? new Date(query.startDate)
      : new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000)

    // Get all courses by instructor
    // TODO: Add instructor_id to courses table, for now get all courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title, price_amount')

    if (coursesError) {
      throw coursesError
    }

    const courseIds = query.courseId
      ? [query.courseId]
      : courses?.map(c => c.id) || []

    // Get course enrollments within date range
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('course_enrollments')
      .select(`
        id,
        course_id,
        created_at,
        courses (
          id,
          title,
          price_amount
        )
      `)
      .in('course_id', courseIds)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true })

    if (enrollmentsError) {
      throw enrollmentsError
    }

    // Get workshop registrations (instructor's workshops)
    const { data: workshops } = await supabase
      .from('workshops')
      .select('id, title, price_amount')
      .eq('instructor_id', instructorId)

    const workshopIds = workshops?.map(w => w.id) || []

    const { data: workshopRegistrations } = await supabase
      .from('workshop_registrations')
      .select(`
        id,
        workshop_id,
        amount_paid,
        registered_at,
        workshops (
          id,
          title,
          price_amount
        )
      `)
      .in('workshop_id', workshopIds)
      .eq('payment_status', 'completed')
      .gte('registered_at', startDate.toISOString())
      .lte('registered_at', endDate.toISOString())
      .order('registered_at', { ascending: true })

    // Build time series data
    const timeSeriesMap = new Map<string, {
      date: string
      revenue: number
      enrollments: number
      courses: number
      workshops: number
    }>()

    // Helper to get date key based on granularity
    const getDateKey = (date: Date): string => {
      if (query.granularity === 'day') {
        return date.toISOString().split('T')[0]
      } else if (query.granularity === 'week') {
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        return weekStart.toISOString().split('T')[0]
      } else { // month
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
      }
    }

    // Process course enrollments
    enrollments?.forEach(enrollment => {
      const dateKey = getDateKey(new Date(enrollment.created_at))
      const revenue = (enrollment.courses as any)?.price_amount || 0

      if (!timeSeriesMap.has(dateKey)) {
        timeSeriesMap.set(dateKey, {
          date: dateKey,
          revenue: 0,
          enrollments: 0,
          courses: 0,
          workshops: 0,
        })
      }

      const point = timeSeriesMap.get(dateKey)!
      point.revenue += revenue
      point.enrollments += 1
      point.courses += revenue
    })

    // Process workshop registrations
    workshopRegistrations?.forEach(registration => {
      const dateKey = getDateKey(new Date(registration.registered_at))
      const revenue = registration.amount_paid || (registration.workshops as any)?.price_amount || 0

      if (!timeSeriesMap.has(dateKey)) {
        timeSeriesMap.set(dateKey, {
          date: dateKey,
          revenue: 0,
          enrollments: 0,
          courses: 0,
          workshops: 0,
        })
      }

      const point = timeSeriesMap.get(dateKey)!
      point.revenue += revenue
      point.enrollments += 1
      point.workshops += revenue
    })

    // Convert map to sorted array
    const timeSeries = Array.from(timeSeriesMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))

    // Calculate summary statistics
    const totalRevenue = timeSeries.reduce((sum, point) => sum + point.revenue, 0)
    const averageRevenue = timeSeries.length > 0 ? totalRevenue / timeSeries.length : 0

    // Calculate growth rate (comparing first half to second half of period)
    const midPoint = Math.floor(timeSeries.length / 2)
    const firstHalf = timeSeries.slice(0, midPoint)
    const secondHalf = timeSeries.slice(midPoint)

    const firstHalfRevenue = firstHalf.reduce((sum, point) => sum + point.revenue, 0)
    const secondHalfRevenue = secondHalf.reduce((sum, point) => sum + point.revenue, 0)

    const growthRate = firstHalfRevenue > 0
      ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100
      : 0

    // Calculate previous period revenue for comparison
    const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const previousStartDate = new Date(startDate.getTime() - periodDays * 24 * 60 * 60 * 1000)

    const { data: previousEnrollments } = await supabase
      .from('course_enrollments')
      .select(`
        courses (
          price_amount
        )
      `)
      .in('course_id', courseIds)
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', startDate.toISOString())

    const previousPeriodRevenue = previousEnrollments?.reduce(
      (sum, e) => sum + ((e.courses as any)?.price_amount || 0),
      0
    ) || 0

    // Calculate breakdown
    const coursesRevenue = timeSeries.reduce((sum, point) => sum + point.courses, 0)
    const workshopsRevenue = timeSeries.reduce((sum, point) => sum + point.workshops, 0)

    const response = {
      timeSeries,
      summary: {
        totalRevenue,
        averageRevenue: Math.round(averageRevenue * 100) / 100,
        growthRate: Math.round(growthRate * 100) / 100,
        previousPeriodRevenue,
      },
      breakdown: {
        courses: coursesRevenue,
        workshops: workshopsRevenue,
        consultations: 0, // TODO: Add consultation revenue when implemented
      },
    }

    return successResponse(response)

  } catch (error) {
    logError(error, { endpoint: 'GET /api/instructor/analytics/revenue' })
    return handleAPIError(error)
  }
}
