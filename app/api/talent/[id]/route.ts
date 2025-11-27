/**
 * Talent API - Individual Profile
 * GET /api/talent/[id] - Get talent profile details
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  APIErrors,
  successResponse,
  errorResponse,
  handleUnknownError,
} from '@/lib/api/errors'

/**
 * GET /api/talent/[id]
 * Get detailed talent profile with testimonials
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('talent_profiles')
      .select(`
        *,
        user:users!talent_profiles_user_id_fkey(
          id,
          full_name,
          avatar_url,
          company_name
        ),
        testimonials:talent_testimonials(
          id,
          client_name,
          client_company,
          client_role,
          quote,
          metric,
          transformation_area,
          verified,
          is_featured,
          created_at
        )
      `)
      .eq('id', id)
      .eq('is_public', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse(APIErrors.NOT_FOUND('Talent profile')),
          { status: 404 }
        )
      }
      throw error
    }

    // Get active engagements count (without exposing client details)
    const { count: activeEngagements } = await supabase
      .from('engagements')
      .select('*', { count: 'exact', head: true })
      .eq('expert_id', data.user_id)
      .in('status', ['active', 'pending'])

    // Get completed engagements count
    const { count: completedEngagements } = await supabase
      .from('engagements')
      .select('*', { count: 'exact', head: true })
      .eq('expert_id', data.user_id)
      .eq('status', 'completed')

    const profile = {
      ...data,
      stats: {
        activeEngagements: activeEngagements || 0,
        completedEngagements: completedEngagements || 0,
        testimonialCount: data.testimonials?.length || 0,
      },
    }

    return NextResponse.json(successResponse(profile))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
