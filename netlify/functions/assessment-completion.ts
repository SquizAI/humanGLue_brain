import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import { AnthropicProvider } from '../../lib/mcp/providers/anthropic'

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Initialize AI provider
const aiProvider = process.env.ANTHROPIC_API_KEY
  ? new AnthropicProvider(process.env.ANTHROPIC_API_KEY)
  : null

interface DimensionScores {
  individual: number
  leadership: number
  cultural: number
  embedding: number
  velocity: number
}

interface AssessmentInsights {
  insights: string[]
  strengths: string[]
  gaps: string[]
}

interface Recommendation {
  type: 'immediate' | 'short-term' | 'long-term'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
}

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
    const { assessmentId } = JSON.parse(event.body || '{}')

    if (!assessmentId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'assessmentId is required' })
      }
    }

    // Get assessment and verify it's in progress
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

    if (assessment.status === 'completed') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Assessment already completed' })
      }
    }

    // Get all answers for the assessment
    const { data: answers, error: answersError } = await supabase
      .from('assessment_answers')
      .select('*')
      .eq('assessment_id', assessmentId)

    if (answersError) {
      throw new Error(`Failed to fetch answers: ${answersError.message}`)
    }

    if (!answers || answers.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No answers found for assessment' })
      }
    }

    // Calculate dimension scores (already calculated by triggers, but we'll verify)
    const dimensionScores: Partial<DimensionScores> = {
      individual: assessment.individual_score || 0,
      leadership: assessment.leadership_score || 0,
      cultural: assessment.cultural_score || 0,
      embedding: assessment.embedding_score || 0,
      velocity: assessment.velocity_score || 0
    }

    // Calculate overall score
    const overallScore = assessment.overall_score || 0

    // Generate AI insights based on responses
    const insights = await generateAIInsights(answers, dimensionScores, overallScore)

    // Generate recommendations
    const recommendations = await generateRecommendations(dimensionScores, insights, overallScore)

    // Update assessment with completion data
    const { data: updatedAssessment, error: updateError } = await supabase
      .from('assessments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        results: insights,
        recommendations: recommendations
      })
      .eq('id', assessmentId)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Failed to update assessment: ${updateError.message}`)
    }

    console.log(`Assessment ${assessmentId} completed successfully:`, {
      overallScore,
      dimensionScores,
      insightsCount: insights.insights.length,
      recommendationsCount: recommendations.length
    })

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        id: updatedAssessment.id,
        userId: updatedAssessment.user_id,
        status: updatedAssessment.status,
        overallScore,
        dimensionScores,
        results: insights,
        recommendations,
        completedAt: updatedAssessment.completed_at
      })
    }

  } catch (error) {
    console.error('Error completing assessment:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to complete assessment',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}

/**
 * Generate AI-powered insights based on assessment responses
 */
async function generateAIInsights(
  answers: any[],
  dimensionScores: Partial<DimensionScores>,
  overallScore: number
): Promise<AssessmentInsights> {
  if (!aiProvider) {
    // Fallback to rule-based insights if AI provider not available
    return generateRuleBasedInsights(answers, dimensionScores, overallScore)
  }

  try {
    // Prepare context for AI
    const answerSummary = answers.map(a => ({
      dimension: a.dimension,
      question: a.question_text,
      value: a.answer_value,
      text: a.answer_text
    }))

    const prompt = `You are an AI transformation expert analyzing an organization's adaptability assessment.

Assessment Results:
- Overall Score: ${overallScore}/100
- Individual Adaptability: ${dimensionScores.individual}/100
- Leadership Alignment: ${dimensionScores.leadership}/100
- Cultural Readiness: ${dimensionScores.cultural}/100
- Embedding Capability: ${dimensionScores.embedding}/100
- Velocity (Speed of Change): ${dimensionScores.velocity}/100

Answer Details:
${JSON.stringify(answerSummary, null, 2)}

Based on this assessment, provide:
1. 3-5 key insights about the organization's adaptability and transformation readiness
2. 2-3 top strengths (areas scoring 70+)
3. 2-3 critical gaps that need immediate attention (areas scoring below 60)

Return as JSON with keys: insights (array of strings), strengths (array of strings), gaps (array of strings).
Keep each insight concise (1-2 sentences). Focus on actionable observations.`

    const response = await aiProvider.generateResponse(
      'claude-sonnet-4.5' as any,
      [{ role: 'user', content: prompt }],
      0.7,
      1500
    )

    const parsed = JSON.parse(response.content)
    return {
      insights: parsed.insights || [],
      strengths: parsed.strengths || [],
      gaps: parsed.gaps || []
    }
  } catch (error) {
    console.error('AI insights generation failed, falling back to rule-based:', error)
    return generateRuleBasedInsights(answers, dimensionScores, overallScore)
  }
}

/**
 * Generate rule-based insights when AI is not available
 */
function generateRuleBasedInsights(
  answers: any[],
  dimensionScores: Partial<DimensionScores>,
  overallScore: number
): AssessmentInsights {
  const insights: string[] = []
  const strengths: string[] = []
  const gaps: string[] = []

  // Overall assessment
  if (overallScore >= 80) {
    insights.push('Your organization demonstrates strong adaptability and is well-positioned for AI transformation.')
  } else if (overallScore >= 60) {
    insights.push('Your organization shows moderate adaptability with clear opportunities for improvement.')
  } else {
    insights.push('Your organization faces significant adaptability challenges that require immediate attention.')
  }

  // Analyze each dimension
  const dimensions = [
    { name: 'Individual Adaptability', key: 'individual' as keyof DimensionScores },
    { name: 'Leadership Alignment', key: 'leadership' as keyof DimensionScores },
    { name: 'Cultural Readiness', key: 'cultural' as keyof DimensionScores },
    { name: 'Embedding Capability', key: 'embedding' as keyof DimensionScores },
    { name: 'Velocity', key: 'velocity' as keyof DimensionScores }
  ]

  dimensions.forEach(dim => {
    const score = dimensionScores[dim.key] || 0
    if (score >= 70) {
      strengths.push(`${dim.name} (${score}/100) - Strong foundation for transformation`)
    } else if (score < 60) {
      gaps.push(`${dim.name} (${score}/100) - Requires focused improvement`)
    }
  })

  // Pattern detection
  const avgScore = Object.values(dimensionScores).reduce((a, b) => a + b, 0) / 5
  const variance = Object.values(dimensionScores).reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / 5

  if (variance > 400) {
    insights.push('Significant variation across dimensions suggests uneven transformation readiness.')
  } else {
    insights.push('Consistent scores across dimensions indicate balanced organizational development.')
  }

  // Specific patterns
  if ((dimensionScores.leadership || 0) > 70 && (dimensionScores.cultural || 0) < 60) {
    insights.push('Leadership commitment is strong, but cultural readiness needs development to match.')
  }

  if ((dimensionScores.velocity || 0) < 60) {
    insights.push('Low velocity indicates the organization may struggle with the pace of change required for AI adoption.')
  }

  return { insights, strengths, gaps }
}

/**
 * Generate actionable recommendations based on assessment
 */
async function generateRecommendations(
  dimensionScores: Partial<DimensionScores>,
  insights: AssessmentInsights,
  overallScore: number
): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = []

  // Immediate actions (0-3 months)
  if (overallScore < 60) {
    recommendations.push({
      type: 'immediate',
      title: 'Establish AI Transformation Foundation',
      description: 'Create a clear AI vision, secure executive sponsorship, and form a cross-functional transformation team.',
      priority: 'critical'
    })
  }

  insights.gaps.forEach(gap => {
    if (gap.includes('Individual')) {
      recommendations.push({
        type: 'immediate',
        title: 'Launch Adaptability Skills Program',
        description: 'Implement training programs focused on growth mindset, learning agility, and change resilience.',
        priority: 'high'
      })
    }
    if (gap.includes('Leadership')) {
      recommendations.push({
        type: 'immediate',
        title: 'Align Leadership on AI Strategy',
        description: 'Conduct executive workshops to build shared understanding and commitment to AI transformation.',
        priority: 'critical'
      })
    }
    if (gap.includes('Cultural')) {
      recommendations.push({
        type: 'immediate',
        title: 'Address Cultural Barriers',
        description: 'Identify and address cultural blockers through targeted change management initiatives.',
        priority: 'high'
      })
    }
  })

  // Short-term actions (3-12 months)
  if ((dimensionScores.embedding || 0) < 70) {
    recommendations.push({
      type: 'short-term',
      title: 'Develop Embedding Practices',
      description: 'Create structured programs to embed new AI capabilities through practice, coaching, and reinforcement.',
      priority: 'high'
    })
  }

  if ((dimensionScores.velocity || 0) < 70) {
    recommendations.push({
      type: 'short-term',
      title: 'Accelerate Change Velocity',
      description: 'Implement agile practices, reduce decision cycles, and create fast-feedback loops.',
      priority: 'medium'
    })
  }

  recommendations.push({
    type: 'short-term',
    title: 'Launch Pilot AI Initiatives',
    description: 'Start with 2-3 high-impact, low-risk AI projects to build confidence and capability.',
    priority: 'high'
  })

  // Long-term actions (1-3 years)
  recommendations.push({
    type: 'long-term',
    title: 'Scale AI Across Organization',
    description: 'Systematically expand successful AI initiatives across departments and functions.',
    priority: 'medium'
  })

  if (overallScore >= 70) {
    recommendations.push({
      type: 'long-term',
      title: 'Become AI-Native Organization',
      description: 'Transform core processes and culture to be inherently adaptive and AI-enabled.',
      priority: 'medium'
    })
  }

  recommendations.push({
    type: 'long-term',
    title: 'Continuous Adaptability Development',
    description: 'Establish ongoing assessment and development cycles to maintain transformation momentum.',
    priority: 'low'
  })

  return recommendations
}