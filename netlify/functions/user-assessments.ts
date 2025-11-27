import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const userId = event.queryStringParameters?.userId
    const status = event.queryStringParameters?.status // optional filter
    const limit = parseInt(event.queryStringParameters?.limit || '10')

    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'userId is required' })
      }
    }

    // Build query
    let query = supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    // Add status filter if provided
    if (status && ['in_progress', 'completed', 'abandoned'].includes(status)) {
      query = query.eq('status', status)
    }

    const { data: assessments, error: assessmentsError } = await query

    if (assessmentsError) {
      throw new Error(`Failed to fetch assessments: ${assessmentsError.message}`)
    }

    // Format response
    const formattedAssessments = assessments?.map(assessment => ({
      id: assessment.id,
      userId: assessment.user_id,
      organizationId: assessment.organization_id,
      status: assessment.status,
      assessmentType: assessment.assessment_type,
      overallScore: assessment.overall_score,
      dimensionScores: {
        individual: assessment.individual_score,
        leadership: assessment.leadership_score,
        cultural: assessment.cultural_score,
        embedding: assessment.embedding_score,
        velocity: assessment.velocity_score
      },
      results: assessment.results,
      recommendations: assessment.recommendations,
      metadata: assessment.metadata,
      startedAt: assessment.started_at,
      completedAt: assessment.completed_at
    })) || []

    console.log(`Retrieved ${formattedAssessments.length} assessments for user ${userId}`)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        assessments: formattedAssessments,
        count: formattedAssessments.length
      })
    }

  } catch (error) {
    console.error('Error getting user assessments:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to get user assessments',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}
