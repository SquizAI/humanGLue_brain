/**
 * User Assessments API
 * GET /api/user/assessments - Get user's assessment history
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
 * GET /api/user/assessments
 * Get user's assessment history with trend analysis
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = createClient()

    const { data: assessments, error } = await supabase
      .from('assessments')
      .select(`
        id,
        assessment_type,
        status,
        individual_score,
        leadership_score,
        cultural_score,
        embedding_score,
        velocity_score,
        overall_score,
        completed_at,
        created_at,
        organization:organizations(
          id,
          name
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Calculate trends (compare with previous assessment)
    const completed = assessments?.filter(a => a.status === 'completed') || []
    let trends = null

    if (completed.length >= 2) {
      const latest = completed[0]
      const previous = completed[1]

      trends = {
        overall: latest.overall_score - previous.overall_score,
        individual: latest.individual_score - previous.individual_score,
        leadership: latest.leadership_score - previous.leadership_score,
        cultural: latest.cultural_score - previous.cultural_score,
        embedding: latest.embedding_score - previous.embedding_score,
        velocity: latest.velocity_score - previous.velocity_score,
      }
    }

    // Calculate average scores
    let averages = null
    if (completed.length > 0) {
      const sum = completed.reduce(
        (acc, curr) => ({
          overall: acc.overall + curr.overall_score,
          individual: acc.individual + curr.individual_score,
          leadership: acc.leadership + curr.leadership_score,
          cultural: acc.cultural + curr.cultural_score,
          embedding: acc.embedding + curr.embedding_score,
          velocity: acc.velocity + curr.velocity_score,
        }),
        {
          overall: 0,
          individual: 0,
          leadership: 0,
          cultural: 0,
          embedding: 0,
          velocity: 0,
        }
      )

      const count = completed.length
      averages = {
        overall: Math.round(sum.overall / count),
        individual: Math.round(sum.individual / count),
        leadership: Math.round(sum.leadership / count),
        cultural: Math.round(sum.cultural / count),
        embedding: Math.round(sum.embedding / count),
        velocity: Math.round(sum.velocity / count),
      }
    }

    return NextResponse.json(
      successResponse({
        assessments: assessments || [],
        stats: {
          total: assessments?.length || 0,
          completed: completed.length,
          inProgress: assessments?.filter(a => a.status === 'in_progress').length || 0,
        },
        trends,
        averages,
      })
    )
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
