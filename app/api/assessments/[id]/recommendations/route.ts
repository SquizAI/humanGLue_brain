/**
 * Assessment Recommendations API
 * GET - Get personalized recommendations for an assessment
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  generateRecommendations,
  getDimensionRecommendations,
} from '@/lib/services/recommendation-engine'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get assessment
    const { data: assessment } = await supabase
      .from('assessments')
      .select('*, organizations(id, name, industry)')
      .eq('id', assessmentId)
      .single()

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    // Check access
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const isAdmin = userRole?.role === 'admin' || userRole?.role === 'super_admin_full'
    const isOwner = assessment.user_id === user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if assessment is completed
    if (assessment.status !== 'completed') {
      return NextResponse.json(
        {
          error: 'Assessment not completed',
          status: assessment.status,
          message: 'Recommendations are only available for completed assessments',
        },
        { status: 400 }
      )
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams
    const dimension = searchParams.get('dimension')
    const priorityFilter = searchParams.get('priority') as
      | 'critical'
      | 'high'
      | 'medium'
      | 'low'
      | null
    const categoryFilter = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '0')

    // If specific dimension requested, return dimension-specific recommendations
    if (dimension) {
      const validDimensions = ['individual', 'leadership', 'cultural', 'embedding', 'velocity']
      if (!validDimensions.includes(dimension)) {
        return NextResponse.json(
          { error: `Invalid dimension. Must be one of: ${validDimensions.join(', ')}` },
          { status: 400 }
        )
      }

      const recommendations = await getDimensionRecommendations(assessmentId, dimension)

      let filteredRecommendations = recommendations

      // Apply priority filter
      if (priorityFilter) {
        filteredRecommendations = filteredRecommendations.filter(
          (r) => r.priority === priorityFilter
        )
      }

      // Apply category filter
      if (categoryFilter) {
        filteredRecommendations = filteredRecommendations.filter(
          (r) => r.category === categoryFilter
        )
      }

      // Apply limit
      if (limit > 0) {
        filteredRecommendations = filteredRecommendations.slice(0, limit)
      }

      return NextResponse.json({
        assessmentId,
        dimension,
        recommendations: filteredRecommendations,
        totalCount: recommendations.length,
        filteredCount: filteredRecommendations.length,
      })
    }

    // Generate full recommendation plan
    const recommendationPlan = await generateRecommendations(assessmentId)

    // Apply filters to all recommendation lists if specified
    let response = { ...recommendationPlan }

    if (priorityFilter || categoryFilter || limit > 0) {
      const filterRecommendations = (recs: typeof recommendationPlan.quickWins) => {
        let filtered = recs

        if (priorityFilter) {
          filtered = filtered.filter((r) => r.priority === priorityFilter)
        }

        if (categoryFilter) {
          filtered = filtered.filter((r) => r.category === categoryFilter)
        }

        if (limit > 0) {
          filtered = filtered.slice(0, limit)
        }

        return filtered
      }

      response = {
        ...response,
        quickWins: filterRecommendations(response.quickWins),
        mediumTermGoals: filterRecommendations(response.mediumTermGoals),
        longTermInitiatives: filterRecommendations(response.longTermInitiatives),
      }
    }

    return NextResponse.json({
      organization: assessment.organizations,
      completedAt: assessment.completed_at,
      ...response,
    })
  } catch (error) {
    console.error('Error getting recommendations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
