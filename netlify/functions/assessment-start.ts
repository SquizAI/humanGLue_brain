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
    const { userId, organizationId, assessmentType = 'full', metadata = {} } = JSON.parse(event.body || '{}')

    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'userId is required' })
      }
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'User not found' })
      }
    }

    // Create new assessment
    const { data: assessment, error: createError } = await supabase
      .from('assessments')
      .insert({
        user_id: userId,
        organization_id: organizationId || null,
        assessment_type: assessmentType,
        status: 'in_progress',
        metadata: metadata,
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (createError) {
      throw new Error(`Failed to create assessment: ${createError.message}`)
    }

    console.log(`Assessment started for user ${userId}:`, {
      assessmentId: assessment.id,
      type: assessmentType,
      organizationId
    })

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        assessmentId: assessment.id,
        status: assessment.status,
        startedAt: assessment.started_at
      })
    }

  } catch (error) {
    console.error('Error starting assessment:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to start assessment',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}
