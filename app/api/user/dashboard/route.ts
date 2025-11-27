/**
 * User Dashboard API
 * GET /api/user/dashboard - Get dashboard data for current user
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
 * GET /api/user/dashboard
 * Get comprehensive dashboard data for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get user profile with roles
    const { data: profile } = await supabase
      .from('users')
      .select(`
        *,
        roles:user_roles(
          role,
          organization_id
        )
      `)
      .eq('id', user.id)
      .single()

    // Get upcoming workshops
    const { data: upcomingWorkshops } = await supabase
      .from('workshop_registrations')
      .select(`
        id,
        status,
        registered_at,
        workshop:workshops(
          id,
          title,
          schedule_date,
          schedule_time,
          pillar,
          level,
          instructor:users!workshops_instructor_id_fkey(
            id,
            full_name,
            avatar_url
          )
        )
      `)
      .eq('user_id', user.id)
      .in('status', ['registered', 'pending_payment'])
      .gte('workshop.schedule_date', new Date().toISOString())
      .order('workshop.schedule_date', { ascending: true })
      .limit(5)

    // Get recent assessments
    const { data: recentAssessments } = await supabase
      .from('assessments')
      .select(`
        id,
        assessment_type,
        status,
        overall_score,
        completed_at,
        created_at
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3)

    // Get latest completed assessment
    const { data: latestAssessment } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single()

    // Get active engagements (if user is a client)
    const { data: activeEngagements } = await supabase
      .from('engagements')
      .select(`
        id,
        focus_area,
        status,
        hours_total,
        hours_used,
        expert:users!engagements_expert_id_fkey(
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('client_id', user.id)
      .in('status', ['pending', 'active'])
      .limit(5)

    // Get certificates
    const { data: certificates, count: certificateCount } = await supabase
      .from('certificates')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('is_verified', true)
      .order('issue_date', { ascending: false })
      .limit(5)

    // Calculate stats
    const { count: completedWorkshops } = await supabase
      .from('workshop_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'completed')

    const { count: totalAssessments } = await supabase
      .from('assessments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'completed')

    const dashboard = {
      user: {
        id: user.id,
        email: user.email,
        fullName: profile?.full_name,
        avatarUrl: profile?.avatar_url,
        roles: profile?.roles || [],
      },
      stats: {
        completedWorkshops: completedWorkshops || 0,
        completedAssessments: totalAssessments || 0,
        certificatesEarned: certificateCount || 0,
        activeEngagements: activeEngagements?.length || 0,
      },
      upcomingWorkshops: upcomingWorkshops || [],
      recentAssessments: recentAssessments || [],
      latestAssessment: latestAssessment || null,
      activeEngagements: activeEngagements || [],
      certificates: certificates || [],
    }

    return NextResponse.json(successResponse(dashboard))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
