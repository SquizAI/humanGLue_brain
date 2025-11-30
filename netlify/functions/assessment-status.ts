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

    // Get assessment
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

    // Get answers grouped by dimension
    const { data: answers, error: answersError } = await supabase
      .from('assessment_responses')
      .select('dimension, response_value:metadata->answer_value')
      .eq('assessment_id', assessmentId)

    if (answersError) {
      throw new Error(`Failed to fetch answers: ${answersError.message}`)
    }

    // Calculate progress by dimension
    const dimensions = ['individual', 'leadership', 'cultural', 'embedding', 'velocity']
    const dimensionProgress = dimensions.map(dim => {
      const dimAnswers = answers?.filter(a => a.dimension === dim) || []
      // Assume 10 questions per dimension (adjust based on your actual assessment)
      const expectedQuestions = 10
      return {
        dimension: dim,
        total: expectedQuestions,
        answered: dimAnswers.length,
        percentComplete: Math.round((dimAnswers.length / expectedQuestions) * 100)
      }
    })

    const totalQuestions = dimensions.length * 10 // 50 total questions
    const answeredQuestions = answers?.length || 0
    const percentComplete = Math.round((answeredQuestions / totalQuestions) * 100)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: assessment.status,
        progress: {
          totalQuestions,
          answeredQuestions,
          percentComplete,
          dimensionProgress
        }
      })
    }

  } catch (error) {
    console.error('Error getting assessment status:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to get assessment status',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}
