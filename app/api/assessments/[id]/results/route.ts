/**
 * Assessment Results API
 * GET /api/assessments/[id]/results - Get assessment results with detailed analysis
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  APIErrors,
  successResponse,
  errorResponse,
  handleUnknownError,
} from '@/lib/api/errors'
import { requireAuth, requireOwnership } from '@/lib/api/auth'

/**
 * Generate recommendations based on scores
 */
function generateRecommendations(scores: {
  individual_score: number
  leadership_score: number
  cultural_score: number
  embedding_score: number
  velocity_score: number
  overall_score: number
}) {
  const recommendations: Array<{
    dimension: string
    priority: 'high' | 'medium' | 'low'
    score: number
    action: string
    resources: string[]
  }> = []

  const dimensions = [
    {
      key: 'individual',
      name: 'Individual Readiness',
      lowActions: 'Focus on building personal AI literacy and comfort with AI tools',
      resources: ['AI Fundamentals Workshop', 'Personal AI Adoption Guide'],
    },
    {
      key: 'leadership',
      name: 'Leadership Capability',
      lowActions: 'Develop leadership skills for guiding AI transformation',
      resources: ['AI Leadership Masterclass', 'Change Leadership Coaching'],
    },
    {
      key: 'cultural',
      name: 'Organizational Culture',
      lowActions: 'Build a culture of experimentation and innovation',
      resources: ['Culture Transformation Program', 'Innovation Workshops'],
    },
    {
      key: 'embedding',
      name: 'Behavior Sustainability',
      lowActions: 'Create systems and habits to sustain AI adoption',
      resources: ['Embedding AI Workshop', 'Habit Formation Coaching'],
    },
    {
      key: 'velocity',
      name: 'Change Velocity',
      lowActions: 'Accelerate your pace of AI implementation',
      resources: ['Rapid Implementation Workshop', 'Velocity Coaching'],
    },
  ]

  for (const dimension of dimensions) {
    const score = scores[`${dimension.key}_score` as keyof typeof scores] as number

    let priority: 'high' | 'medium' | 'low'
    if (score < 40) priority = 'high'
    else if (score < 70) priority = 'medium'
    else priority = 'low'

    if (priority !== 'low') {
      recommendations.push({
        dimension: dimension.name,
        priority,
        score,
        action: dimension.lowActions,
        resources: dimension.resources,
      })
    }
  }

  // Sort by priority (high first)
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
}

/**
 * GET /api/assessments/[id]/results
 * Get detailed assessment results with recommendations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await requireAuth()
    const supabase = await createClient()

    const { data: assessment, error } = await supabase
      .from('assessments')
      .select(`
        *,
        organization:organizations(
          id,
          name,
          slug
        ),
        responses:assessment_responses(
          id,
          question_id,
          question_number,
          response_text,
          metadata
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse(APIErrors.NOT_FOUND('Assessment')),
          { status: 404 }
        )
      }
      throw error
    }

    // Check ownership
    await requireOwnership(user, assessment.user_id)

    // Only return results for completed assessments
    if (assessment.status !== 'completed') {
      return NextResponse.json(
        errorResponse(APIErrors.CONFLICT('Assessment must be completed to view results')),
        { status: 409 }
      )
    }

    // Generate recommendations
    const recommendations = generateRecommendations({
      individual_score: assessment.individual_score,
      leadership_score: assessment.leadership_score,
      cultural_score: assessment.cultural_score,
      embedding_score: assessment.embedding_score,
      velocity_score: assessment.velocity_score,
      overall_score: assessment.overall_score,
    })

    // Calculate readiness level
    let readinessLevel: 'beginner' | 'intermediate' | 'advanced'
    if (assessment.overall_score < 40) readinessLevel = 'beginner'
    else if (assessment.overall_score < 70) readinessLevel = 'intermediate'
    else readinessLevel = 'advanced'

    // Get suggested workshops based on readiness level
    const { data: suggestedWorkshops } = await supabase
      .from('workshops')
      .select(`
        id,
        title,
        description,
        level,
        pillar,
        schedule_date,
        schedule_time,
        price_amount
      `)
      .eq('status', 'published')
      .eq('level', readinessLevel)
      .gt('capacity_remaining', 0)
      .order('schedule_date', { ascending: true })
      .limit(3)

    const results = {
      assessment: {
        id: assessment.id,
        type: assessment.assessment_type,
        completed_at: assessment.completed_at,
        overall_score: assessment.overall_score,
      },
      scores: {
        individual: assessment.individual_score,
        leadership: assessment.leadership_score,
        cultural: assessment.cultural_score,
        embedding: assessment.embedding_score,
        velocity: assessment.velocity_score,
        overall: assessment.overall_score,
      },
      readinessLevel,
      recommendations,
      suggestedWorkshops: suggestedWorkshops || [],
      insights: {
        strengths: recommendations
          .filter(r => r.score >= 70)
          .map(r => r.dimension),
        areasForGrowth: recommendations
          .filter(r => r.priority === 'high')
          .map(r => r.dimension),
      },
    }

    return NextResponse.json(successResponse(results))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
