import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Assessment dimensions for HMN (5 core dimensions)
const DIMENSIONS = {
  individual: 'Individual Adaptability',
  leadership: 'Leadership Alignment',
  cultural: 'Cultural Readiness',
  embedding: 'Embedding Capability',
  velocity: 'Velocity (Speed of Change)'
}

interface MaturityResults {
  assessmentId: string
  overallScore: number
  dimensionScores: {
    individual: number
    leadership: number
    cultural: number
    embedding: number
    velocity: number
  }
  maturityLevel: string // 'emerging' | 'developing' | 'maturing' | 'advanced' | 'leading'
  topStrengths: Array<{ dimension: string; score: number; insight: string }>
  criticalGaps: Array<{ dimension: string; score: number; insight: string }>
  velocityInsight: string
  embeddingInsight: string
  transformationReadiness: {
    level: string
    description: string
    nextSteps: string[]
  }
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

    // Get assessment with scores
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

    // Extract dimension scores
    const dimensionScores = {
      individual: assessment.individual_score || 0,
      leadership: assessment.leadership_score || 0,
      cultural: assessment.cultural_score || 0,
      embedding: assessment.embedding_score || 0,
      velocity: assessment.velocity_score || 0
    }

    const overallScore = assessment.overall_score || 0

    // Calculate maturity level
    const maturityLevel = calculateMaturityLevel(overallScore)

    // Identify strengths and gaps
    const { topStrengths, criticalGaps } = identifyStrengthsAndGaps(dimensionScores)

    // Generate specific insights
    const velocityInsight = generateVelocityInsight(dimensionScores.velocity, dimensionScores)
    const embeddingInsight = generateEmbeddingInsight(dimensionScores.embedding, dimensionScores)

    // Determine transformation readiness
    const transformationReadiness = assessTransformationReadiness(overallScore, dimensionScores)

    const results: MaturityResults = {
      assessmentId,
      overallScore,
      dimensionScores,
      maturityLevel,
      topStrengths,
      criticalGaps,
      velocityInsight,
      embeddingInsight,
      transformationReadiness
    }

    console.log(`Maturity calculated for assessment ${assessmentId}:`, {
      overallScore,
      maturityLevel,
      strengthsCount: topStrengths.length,
      gapsCount: criticalGaps.length
    })

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(results)
    }

  } catch (error) {
    console.error('Error calculating maturity scores:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to calculate maturity scores',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}

/**
 * Calculate maturity level from overall score
 * HMN 0-100 scale mapped to maturity levels
 */
function calculateMaturityLevel(overallScore: number): string {
  if (overallScore >= 85) return 'leading' // Industry leader in adaptability
  if (overallScore >= 70) return 'advanced' // Strong adaptability, ready for complex transformation
  if (overallScore >= 55) return 'maturing' // Growing adaptability, ready for structured change
  if (overallScore >= 40) return 'developing' // Basic adaptability, needs foundational work
  return 'emerging' // Early stage, requires significant development
}

/**
 * Identify top strengths and critical gaps
 */
function identifyStrengthsAndGaps(dimensionScores: any) {
  const dimensions = Object.entries(dimensionScores) as [keyof typeof DIMENSIONS, number][]

  // Sort by score
  const sorted = dimensions.sort(([,a], [,b]) => b - a)

  // Top strengths (70+)
  const topStrengths = sorted
    .filter(([, score]) => score >= 70)
    .slice(0, 3)
    .map(([dim, score]) => ({
      dimension: DIMENSIONS[dim],
      score,
      insight: generateStrengthInsight(dim, score)
    }))

  // Critical gaps (below 60)
  const criticalGaps = sorted
    .filter(([, score]) => score < 60)
    .sort(([,a], [,b]) => a - b) // Lowest first
    .slice(0, 3)
    .map(([dim, score]) => ({
      dimension: DIMENSIONS[dim],
      score,
      insight: generateGapInsight(dim, score)
    }))

  return { topStrengths, criticalGaps }
}

/**
 * Generate insight for a strength
 */
function generateStrengthInsight(dimension: keyof typeof DIMENSIONS, score: number): string {
  const insights: Record<keyof typeof DIMENSIONS, string> = {
    individual: 'Strong individual adaptability provides a solid foundation for organizational change.',
    leadership: 'Leadership alignment enables clear direction and sustained transformation momentum.',
    cultural: 'Positive cultural readiness reduces resistance and accelerates adoption.',
    embedding: 'Effective embedding practices ensure changes stick and become part of daily operations.',
    velocity: 'High velocity indicates the organization can rapidly respond to change and opportunity.'
  }
  return insights[dimension]
}

/**
 * Generate insight for a gap
 */
function generateGapInsight(dimension: keyof typeof DIMENSIONS, score: number): string {
  const insights: Record<keyof typeof DIMENSIONS, string> = {
    individual: 'Low individual adaptability may create resistance and slow transformation efforts.',
    leadership: 'Weak leadership alignment can lead to mixed messages and fragmented initiatives.',
    cultural: 'Cultural barriers can undermine even well-designed transformation programs.',
    embedding: 'Poor embedding means changes may not stick, leading to backsliding and wasted effort.',
    velocity: 'Low velocity suggests the organization struggles to keep pace with change requirements.'
  }
  return insights[dimension]
}

/**
 * Generate velocity-specific insight
 */
function generateVelocityInsight(velocityScore: number, allScores: any): string {
  if (velocityScore >= 80) {
    return 'Excellent velocity - your organization can move fast and adapt quickly to new challenges and opportunities.'
  } else if (velocityScore >= 70) {
    return 'Good velocity - you can implement changes at a sustainable pace, though there may be room to accelerate in key areas.'
  } else if (velocityScore >= 55) {
    return 'Moderate velocity - changes take time to implement. Focus on reducing decision cycles and removing bottlenecks.'
  } else if (velocityScore >= 40) {
    return 'Low velocity - slow pace of change could cause you to fall behind. Prioritize streamlining processes and empowering decision-making.'
  } else {
    return 'Critical velocity gap - the organization struggles to implement change at the speed required. This needs immediate attention.'
  }
}

/**
 * Generate embedding-specific insight
 */
function generateEmbeddingInsight(embeddingScore: number, allScores: any): string {
  if (embeddingScore >= 80) {
    return 'Strong embedding capability - changes become part of your organizational DNA, leading to lasting transformation.'
  } else if (embeddingScore >= 70) {
    return 'Good embedding - most changes stick, though some may require reinforcement to become fully integrated.'
  } else if (embeddingScore >= 55) {
    return 'Moderate embedding - about half of changes stick. You need better reinforcement mechanisms and follow-through.'
  } else if (embeddingScore >= 40) {
    return 'Weak embedding - changes often fade over time. Invest in coaching, practice, and accountability systems.'
  } else {
    return 'Critical embedding gap - new behaviors and practices rarely stick. This severely limits transformation success.'
  }
}

/**
 * Assess overall transformation readiness
 */
function assessTransformationReadiness(overallScore: number, dimensionScores: any) {
  const leadership = dimensionScores.leadership
  const cultural = dimensionScores.cultural
  const velocity = dimensionScores.velocity
  const embedding = dimensionScores.embedding

  // Readiness requires balance, not just high scores
  const hasFoundation = leadership >= 60 && cultural >= 60
  const canExecute = velocity >= 55 && embedding >= 55

  if (overallScore >= 75 && hasFoundation && canExecute) {
    return {
      level: 'ready',
      description: 'Your organization is ready for major transformation initiatives.',
      nextSteps: [
        'Launch high-impact AI transformation initiatives',
        'Scale successful practices across the organization',
        'Build advanced capabilities for sustained competitive advantage'
      ]
    }
  } else if (overallScore >= 60 && hasFoundation) {
    return {
      level: 'developing',
      description: 'You have the foundation but need to build execution capabilities.',
      nextSteps: [
        'Start with pilot programs to build confidence and capability',
        'Strengthen velocity and embedding through agile practices',
        'Create clear success metrics and feedback loops'
      ]
    }
  } else if (hasFoundation) {
    return {
      level: 'building',
      description: 'Leadership and culture are aligned, but need broader organizational readiness.',
      nextSteps: [
        'Expand adaptability skills throughout the organization',
        'Build change management and embedding practices',
        'Start small with high-visibility quick wins'
      ]
    }
  } else {
    return {
      level: 'foundation',
      description: 'Focus first on building the foundational elements for transformation.',
      nextSteps: [
        'Secure leadership alignment and commitment',
        'Address cultural barriers and build readiness',
        'Invest in change management capabilities before scaling initiatives'
      ]
    }
  }
}