/**
 * User Workshops API
 * GET /api/user/workshops - Get user's registered workshops
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  successResponse,
  errorResponse,
  handleUnknownError,
} from '@/lib/api/errors'
import { requireAuth } from '@/lib/api/auth'

/**
 * GET /api/user/workshops
 * Get all workshops user is registered for
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const supabase = await createClient()

    let query = supabase
      .from('workshop_registrations')
      .select(`
        id,
        status,
        price_paid,
        registered_at,
        attended,
        completed_at,
        rating,
        review,
        workshop:workshops(
          id,
          title,
          description,
          pillar,
          level,
          format,
          schedule_date,
          schedule_time,
          schedule_duration,
          schedule_timezone,
          instructor:users!workshops_instructor_id_fkey(
            id,
            full_name,
            avatar_url,
            bio
          )
        )
      `)
      .eq('user_id', user.id)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query.order('registered_at', { ascending: false })

    if (error) throw error

    // Separate into upcoming and past
    const now = new Date()
    const upcoming = data?.filter(reg =>
      new Date((reg.workshop as any).schedule_date) >= now &&
      ['registered', 'pending_payment'].includes(reg.status)
    ) || []

    const past = data?.filter(reg =>
      new Date((reg.workshop as any).schedule_date) < now ||
      ['completed', 'cancelled', 'no_show'].includes(reg.status)
    ) || []

    return NextResponse.json(
      successResponse({
        all: data || [],
        upcoming,
        past,
        stats: {
          total: data?.length || 0,
          upcoming: upcoming.length,
          completed: data?.filter(r => r.status === 'completed').length || 0,
          cancelled: data?.filter(r => r.status === 'cancelled').length || 0,
        },
      })
    )
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
