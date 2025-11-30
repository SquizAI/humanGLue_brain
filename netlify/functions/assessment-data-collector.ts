import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface AssessmentDataPoint {
  assessmentId: string
  dimensionId: string
  questionId: string
  response: string
  scoreValue: number
  timestamp?: string
  context?: {
    industry?: string
    companySize?: string
    region?: string
  }
}

export const handler: Handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const data: AssessmentDataPoint = JSON.parse(event.body || '{}')

    // Validate required fields
    if (!data.assessmentId || !data.dimensionId || !data.questionId || !data.response || data.scoreValue === undefined) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required fields: assessmentId, dimensionId, questionId, response, scoreValue'
        })
      }
    }

    // Map dimensionId to dimension name
    const dimensionMap: Record<string, string> = {
      'individual': 'individual',
      'leadership': 'leadership',
      'cultural': 'cultural',
      'embedding': 'embedding',
      'velocity': 'velocity'
    }

    const dimension = dimensionMap[data.dimensionId] || data.dimensionId

    // Validate dimension
    const validDimensions = ['individual', 'leadership', 'cultural', 'embedding', 'velocity']
    if (!validDimensions.includes(dimension)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: `Invalid dimension. Must be one of: ${validDimensions.join(', ')}`
        })
      }
    }

    // Check if assessment exists
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('id, status')
      .eq('id', data.assessmentId)
      .single()

    if (assessmentError || !assessment) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Assessment not found' })
      }
    }

    if (assessment.status !== 'in_progress') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Assessment is not in progress' })
      }
    }

    // Store answer in database
    const { data: answer, error: insertError } = await supabase
      .from('assessment_responses')
      .upsert({
        assessment_id: data.assessmentId,
        question_code: data.questionId,
        dimension,
        metadata: {
          answer_type: 'scale', // Default to scale for backward compatibility
          answer_value: data.scoreValue,
          answer_text: data.response,
          question_text: data.response, // Using response as question text for backward compatibility
          question_weight: 1,
        },
        created_at: data.timestamp || new Date().toISOString()
      }, {
        onConflict: 'assessment_id,question_code'
      })
      .select()
      .single()

    if (insertError) {
      throw new Error(`Failed to save answer: ${insertError.message}`)
    }

    // Get count of answers for this assessment
    const { count } = await supabase
      .from('assessment_responses')
      .select('*', { count: 'exact', head: true })
      .eq('assessment_id', data.assessmentId)

    console.log(`Assessment data collected for ${data.assessmentId}:`, {
      dimension: data.dimensionId,
      question: data.questionId,
      score: data.scoreValue,
      totalDataPoints: count || 0
    })

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Assessment data collected successfully',
        dataPointsCollected: count || 0,
        dimensionId: data.dimensionId,
        scoreValue: data.scoreValue
      })
    }

  } catch (error) {
    console.error('Error collecting assessment data:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to collect assessment data',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}