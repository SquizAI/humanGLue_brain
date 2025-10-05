import { Handler } from '@netlify/functions'

interface AssessmentDataPoint {
  organizationId: string
  dimensionId: string
  questionId: string
  response: string
  scoreValue: number
  timestamp: string
  context?: {
    industry?: string
    companySize?: string
    region?: string
  }
}

// In-memory storage for demo (replace with actual database)
const assessmentData = new Map<string, AssessmentDataPoint[]>()

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
    if (!data.organizationId || !data.dimensionId || !data.questionId || !data.response || data.scoreValue === undefined) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields: organizationId, dimensionId, questionId, response, scoreValue' 
        })
      }
    }

    // Add timestamp
    data.timestamp = new Date().toISOString()

    // Store data
    if (!assessmentData.has(data.organizationId)) {
      assessmentData.set(data.organizationId, [])
    }
    
    const orgData = assessmentData.get(data.organizationId)!
    orgData.push(data)

    console.log(`Assessment data collected for ${data.organizationId}:`, {
      dimension: data.dimensionId,
      question: data.questionId,
      score: data.scoreValue,
      totalDataPoints: orgData.length
    })

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Assessment data collected successfully',
        dataPointsCollected: orgData.length,
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