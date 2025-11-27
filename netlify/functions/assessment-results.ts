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
    const assessmentId = event.queryStringParameters?.assessmentId

    if (!assessmentId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'assessmentId is required' })
      }
    }

    // Get assessment with all data
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .single()

    if (assessmentError || !assessment) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Assessment not found' })
      }
    }

    if (assessment.status !== 'completed') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Assessment is not completed yet' })
      }
    }

    // Build response
    const result = {
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
      results: assessment.results, // Contains insights, strengths, gaps
      recommendations: assessment.recommendations,
      metadata: assessment.metadata,
      startedAt: assessment.started_at,
      completedAt: assessment.completed_at
    }

    console.log(`Assessment results retrieved for ${assessmentId}`)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    }

  } catch (error) {
    console.error('Error getting assessment results:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to get assessment results',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}
