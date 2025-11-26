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
    const {
      assessmentId,
      questionId,
      dimension,
      answerType,
      answerValue,
      answerText,
      questionText,
      questionWeight = 1
    } = JSON.parse(event.body || '{}')

    // Validate required fields
    if (!assessmentId || !questionId || !dimension || !answerType || !questionText) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required fields: assessmentId, questionId, dimension, answerType, questionText'
        })
      }
    }

    // Validate dimension
    const validDimensions = ['individual', 'leadership', 'cultural', 'embedding', 'velocity']
    if (!validDimensions.includes(dimension)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: `Invalid dimension. Must be one of: ${validDimensions.join(', ')}` })
      }
    }

    // Validate answer type
    const validAnswerTypes = ['scale', 'multiChoice', 'fearToConfidence', 'text']
    if (!validAnswerTypes.includes(answerType)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: `Invalid answerType. Must be one of: ${validAnswerTypes.join(', ')}` })
      }
    }

    // Check if assessment exists and is in progress
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('id, status')
      .eq('id', assessmentId)
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

    // Upsert answer (insert or update if already exists)
    const { data: answer, error: upsertError } = await supabase
      .from('assessment_answers')
      .upsert({
        assessment_id: assessmentId,
        question_id: questionId,
        dimension,
        answer_type: answerType,
        answer_value: answerValue || null,
        answer_text: answerText || null,
        question_text: questionText,
        question_weight: questionWeight,
        answered_at: new Date().toISOString()
      }, {
        onConflict: 'assessment_id,question_id'
      })
      .select()
      .single()

    if (upsertError) {
      throw new Error(`Failed to save answer: ${upsertError.message}`)
    }

    // Get updated dimension score (calculated by trigger)
    const { data: updatedAssessment } = await supabase
      .from('assessments')
      .select(`${dimension}_score`)
      .eq('id', assessmentId)
      .single()

    const scoreKey = `${dimension}_score` as keyof typeof updatedAssessment

    console.log(`Answer saved for assessment ${assessmentId}:`, {
      questionId,
      dimension,
      answerValue,
      newDimensionScore: updatedAssessment?.[scoreKey]
    })

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        answerId: answer.id,
        dimensionScore: updatedAssessment?.[scoreKey] || null
      })
    }

  } catch (error) {
    console.error('Error saving assessment answer:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to save assessment answer',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}
