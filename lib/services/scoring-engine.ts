/**
 * Multi-Dimensional Scoring Engine
 *
 * Provides advanced scoring capabilities:
 * - Weighted dimension scoring
 * - Gap analysis to next maturity level
 * - Subdimension breakdowns
 * - Peer comparison scoring
 * - Trend analysis
 */

import { createClient } from '@/lib/supabase/server'

export interface DimensionScore {
  dimension: string
  score: number
  maxScore: number
  percentage: number
  weight: number
  weightedScore: number
  subdimensions: SubdimensionScore[]
  questionsAnswered: number
  questionsSkipped: number
}

export interface SubdimensionScore {
  name: string
  score: number
  maxScore: number
  percentage: number
  questionCount: number
}

export interface MaturityLevel {
  level: number
  name: string
  minScore: number
  maxScore: number
  description?: string
}

export interface GapAnalysis {
  currentLevel: MaturityLevel
  nextLevel: MaturityLevel | null
  pointsToNextLevel: number
  percentageToNextLevel: number
  dimensionGaps: Array<{
    dimension: string
    currentScore: number
    targetScore: number
    gap: number
    priority: 'high' | 'medium' | 'low'
  }>
  recommendations: string[]
}

export interface AssessmentScores {
  assessmentId: string
  overallScore: number
  overallPercentage: number
  maturityLevel: MaturityLevel
  dimensions: DimensionScore[]
  gapAnalysis: GapAnalysis
  peerComparison?: {
    industryAverage: number
    percentile: number
    rank: string
  }
  timestamp: string
}

// Maturity levels (0-9 scale)
const MATURITY_LEVELS: MaturityLevel[] = [
  { level: 0, name: 'Unaware', minScore: 0, maxScore: 10, description: 'No awareness of AI potential' },
  {
    level: 1,
    name: 'Aware',
    minScore: 11,
    maxScore: 20,
    description: 'Beginning to understand AI possibilities',
  },
  {
    level: 2,
    name: 'Exploring',
    minScore: 21,
    maxScore: 30,
    description: 'Actively researching AI applications',
  },
  {
    level: 3,
    name: 'Experimenting',
    minScore: 31,
    maxScore: 40,
    description: 'Running initial AI pilots',
  },
  {
    level: 4,
    name: 'Adopting',
    minScore: 41,
    maxScore: 50,
    description: 'Implementing AI in select areas',
  },
  {
    level: 5,
    name: 'Scaling',
    minScore: 51,
    maxScore: 60,
    description: 'Expanding AI across organization',
  },
  { level: 6, name: 'Optimizing', minScore: 61, maxScore: 70, description: 'Refining AI for maximum value' },
  {
    level: 7,
    name: 'Innovating',
    minScore: 71,
    maxScore: 80,
    description: 'Creating novel AI applications',
  },
  {
    level: 8,
    name: 'Leading',
    minScore: 81,
    maxScore: 90,
    description: 'Industry leader in AI adoption',
  },
  {
    level: 9,
    name: 'Transforming',
    minScore: 91,
    maxScore: 100,
    description: 'AI-native organization',
  },
]

// Default dimension weights
const DEFAULT_DIMENSION_WEIGHTS: Record<string, number> = {
  individual: 0.25,
  leadership: 0.2,
  cultural: 0.2,
  embedding: 0.2,
  velocity: 0.15,
}

/**
 * Calculate comprehensive scores for an assessment
 */
export async function calculateAssessmentScores(
  assessmentId: string,
  options?: {
    includeGapAnalysis?: boolean
    includePeerComparison?: boolean
    customWeights?: Record<string, number>
  }
): Promise<AssessmentScores> {
  const supabase = await createClient()
  const weights = options?.customWeights || DEFAULT_DIMENSION_WEIGHTS

  // Get all responses for this assessment
  const { data: responses } = await supabase
    .from('assessment_responses')
    .select(
      `
      *,
      question_bank(dimension, subdimension, weight)
    `
    )
    .eq('assessment_id', assessmentId)

  if (!responses || responses.length === 0) {
    throw new Error('No answers found for assessment')
  }

  // Map responses to include dimension from question_bank
  const answers = responses.map((r) => ({
    ...r,
    dimension: (r.question_bank as any)?.dimension || 'individual',
    question_weight: (r.question_bank as any)?.weight || 1,
    answer_value: (r.metadata as any)?.answer_value || r.ai_confidence_score || 0,
  }))

  // Group answers by dimension
  const dimensionAnswers = groupBy(answers, 'dimension')

  // Calculate dimension scores
  const dimensions: DimensionScore[] = []

  for (const [dimension, dimAnswers] of Object.entries(dimensionAnswers)) {
    const validAnswers = dimAnswers.filter((a) => !a.skipped && a.answer_value !== null)
    const skippedCount = dimAnswers.filter((a) => a.skipped).length

    // Calculate weighted average
    let totalWeight = 0
    let weightedSum = 0

    for (const answer of validAnswers) {
      const questionWeight = answer.question_weight || 1
      totalWeight += questionWeight
      weightedSum += (answer.answer_value || 0) * questionWeight
    }

    const rawScore = totalWeight > 0 ? weightedSum / totalWeight : 0
    const dimensionWeight = weights[dimension] || 0.2

    // Calculate subdimension scores
    const subdimensionAnswers = groupBy(validAnswers, (a) => a.question_bank?.subdimension || 'general')
    const subdimensions: SubdimensionScore[] = []

    for (const [subdim, subAnswers] of Object.entries(subdimensionAnswers)) {
      const subAvg =
        subAnswers.reduce((sum, a) => sum + (a.answer_value || 0), 0) / subAnswers.length

      subdimensions.push({
        name: subdim,
        score: Math.round(subAvg),
        maxScore: 100,
        percentage: Math.round(subAvg),
        questionCount: subAnswers.length,
      })
    }

    dimensions.push({
      dimension,
      score: Math.round(rawScore),
      maxScore: 100,
      percentage: Math.round(rawScore),
      weight: dimensionWeight,
      weightedScore: Math.round(rawScore * dimensionWeight),
      subdimensions,
      questionsAnswered: validAnswers.length,
      questionsSkipped: skippedCount,
    })
  }

  // Calculate overall score
  const overallScore = dimensions.reduce((sum, d) => sum + d.weightedScore, 0)
  const totalWeight = dimensions.reduce((sum, d) => sum + d.weight, 0)
  const normalizedOverall = Math.round(overallScore / totalWeight)

  // Get maturity level
  const maturityLevel = getMaturityLevel(normalizedOverall)

  // Build result
  const result: AssessmentScores = {
    assessmentId,
    overallScore: normalizedOverall,
    overallPercentage: normalizedOverall,
    maturityLevel,
    dimensions,
    gapAnalysis: calculateGapAnalysis(normalizedOverall, dimensions),
    timestamp: new Date().toISOString(),
  }

  // Add peer comparison if requested
  if (options?.includePeerComparison) {
    const { data: assessment } = await supabase
      .from('assessments')
      .select('organization_id, organizations(industry)')
      .eq('id', assessmentId)
      .single()

    // organizations join returns array or object depending on relationship
    const org = Array.isArray(assessment?.organizations)
      ? assessment.organizations[0]
      : assessment?.organizations
    if (org?.industry) {
      result.peerComparison = await calculatePeerComparison(normalizedOverall, org.industry)
    }
  }

  // Update assessment with calculated scores
  await supabase
    .from('assessments')
    .update({
      individual_score: dimensions.find((d) => d.dimension === 'individual')?.score,
      leadership_score: dimensions.find((d) => d.dimension === 'leadership')?.score,
      cultural_score: dimensions.find((d) => d.dimension === 'cultural')?.score,
      embedding_score: dimensions.find((d) => d.dimension === 'embedding')?.score,
      velocity_score: dimensions.find((d) => d.dimension === 'velocity')?.score,
      results: {
        ...result,
        calculatedAt: new Date().toISOString(),
      },
    })
    .eq('id', assessmentId)

  return result
}

/**
 * Get maturity level from score
 */
export function getMaturityLevel(score: number): MaturityLevel {
  for (const level of MATURITY_LEVELS) {
    if (score >= level.minScore && score <= level.maxScore) {
      return level
    }
  }
  // Default to highest level if score > 100
  return MATURITY_LEVELS[MATURITY_LEVELS.length - 1]
}

/**
 * Calculate gap analysis
 */
function calculateGapAnalysis(overallScore: number, dimensions: DimensionScore[]): GapAnalysis {
  const currentLevel = getMaturityLevel(overallScore)
  const nextLevelIndex = MATURITY_LEVELS.findIndex((l) => l.level === currentLevel.level) + 1
  const nextLevel = nextLevelIndex < MATURITY_LEVELS.length ? MATURITY_LEVELS[nextLevelIndex] : null

  const pointsToNextLevel = nextLevel ? nextLevel.minScore - overallScore : 0
  const percentageToNextLevel = nextLevel
    ? Math.round((overallScore / nextLevel.minScore) * 100)
    : 100

  // Calculate dimension gaps
  const dimensionGaps = dimensions.map((d) => {
    const targetScore = nextLevel ? nextLevel.minScore : 100
    const gap = targetScore - d.score

    return {
      dimension: d.dimension,
      currentScore: d.score,
      targetScore,
      gap,
      priority: gap > 30 ? 'high' : gap > 15 ? 'medium' : ('low' as 'high' | 'medium' | 'low'),
    }
  })

  // Sort by gap (highest first)
  dimensionGaps.sort((a, b) => b.gap - a.gap)

  // Generate recommendations
  const recommendations = generateRecommendations(dimensionGaps, currentLevel, nextLevel)

  return {
    currentLevel,
    nextLevel,
    pointsToNextLevel,
    percentageToNextLevel,
    dimensionGaps,
    recommendations,
  }
}

/**
 * Generate recommendations based on gaps
 */
function generateRecommendations(
  gaps: GapAnalysis['dimensionGaps'],
  currentLevel: MaturityLevel,
  nextLevel: MaturityLevel | null
): string[] {
  const recommendations: string[] = []

  // Add level-specific recommendations
  if (currentLevel.level < 3) {
    recommendations.push(
      'Focus on building foundational AI awareness and basic literacy across the organization.'
    )
  } else if (currentLevel.level < 6) {
    recommendations.push(
      'Prioritize scaling successful AI pilots and standardizing practices across departments.'
    )
  } else {
    recommendations.push(
      'Continue innovating and consider sharing AI best practices as an industry thought leader.'
    )
  }

  // Add gap-specific recommendations
  const highPriorityGaps = gaps.filter((g) => g.priority === 'high')

  for (const gap of highPriorityGaps.slice(0, 3)) {
    switch (gap.dimension) {
      case 'individual':
        recommendations.push(
          `Individual adaptability needs attention. Consider implementing personalized AI training programs.`
        )
        break
      case 'leadership':
        recommendations.push(
          `Leadership engagement is below target. Executive sponsorship and visible AI adoption by leaders is critical.`
        )
        break
      case 'cultural':
        recommendations.push(
          `Cultural readiness requires focus. Create safe spaces for AI experimentation and celebrate learning from failures.`
        )
        break
      case 'embedding':
        recommendations.push(
          `AI integration depth is lacking. Develop a roadmap for embedding AI into core business processes.`
        )
        break
      case 'velocity':
        recommendations.push(
          `Speed of AI adoption is slow. Streamline approval processes and create fast-track programs for AI initiatives.`
        )
        break
    }
  }

  // Add next level goal
  if (nextLevel) {
    recommendations.push(
      `Target: Reach ${nextLevel.name} level (${nextLevel.minScore}+ score) to ${nextLevel.description?.toLowerCase() || 'advance your AI maturity'}.`
    )
  }

  return recommendations
}

/**
 * Calculate peer comparison
 */
async function calculatePeerComparison(
  score: number,
  industry: string
): Promise<{ industryAverage: number; percentile: number; rank: string }> {
  const supabase = await createClient()

  // Get all completed assessments in the same industry
  const { data: peerAssessments } = await supabase
    .from('assessments')
    .select('overall_score, organizations!inner(industry)')
    .eq('status', 'completed')
    .eq('organizations.industry', industry)
    .not('overall_score', 'is', null)

  if (!peerAssessments || peerAssessments.length === 0) {
    return {
      industryAverage: score,
      percentile: 50,
      rank: 'Average',
    }
  }

  const scores = peerAssessments.map((a) => a.overall_score as number)
  const industryAverage = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)

  // Calculate percentile
  const scoresBelow = scores.filter((s) => s < score).length
  const percentile = Math.round((scoresBelow / scores.length) * 100)

  // Determine rank
  let rank: string
  if (percentile >= 90) rank = 'Top 10%'
  else if (percentile >= 75) rank = 'Top 25%'
  else if (percentile >= 50) rank = 'Above Average'
  else if (percentile >= 25) rank = 'Below Average'
  else rank = 'Bottom 25%'

  return {
    industryAverage,
    percentile,
    rank,
  }
}

/**
 * Calculate score trend over time
 */
export async function calculateScoreTrend(
  userId: string,
  months: number = 12
): Promise<
  Array<{
    assessmentId: string
    completedAt: string
    overallScore: number
    maturityLevel: number
    dimensions: Record<string, number>
  }>
> {
  const supabase = await createClient()

  const cutoffDate = new Date()
  cutoffDate.setMonth(cutoffDate.getMonth() - months)

  const { data: assessments } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('completed_at', cutoffDate.toISOString())
    .order('completed_at', { ascending: true })

  if (!assessments) return []

  return assessments.map((a) => ({
    assessmentId: a.id,
    completedAt: a.completed_at,
    overallScore: a.overall_score || 0,
    maturityLevel: getMaturityLevel(a.overall_score || 0).level,
    dimensions: {
      individual: a.individual_score || 0,
      leadership: a.leadership_score || 0,
      cultural: a.cultural_score || 0,
      embedding: a.embedding_score || 0,
      velocity: a.velocity_score || 0,
    },
  }))
}

/**
 * Get organization score summary
 */
export async function getOrganizationScoreSummary(organizationId: string): Promise<{
  assessmentCount: number
  averageScore: number
  medianScore: number
  maturityLevel: MaturityLevel
  trendDirection: 'improving' | 'stable' | 'declining'
  dimensionAverages: Record<string, number>
}> {
  const supabase = await createClient()

  const { data: assessments } = await supabase
    .from('assessments')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })

  if (!assessments || assessments.length === 0) {
    return {
      assessmentCount: 0,
      averageScore: 0,
      medianScore: 0,
      maturityLevel: MATURITY_LEVELS[0],
      trendDirection: 'stable',
      dimensionAverages: {
        individual: 0,
        leadership: 0,
        cultural: 0,
        embedding: 0,
        velocity: 0,
      },
    }
  }

  const scores = assessments.map((a) => a.overall_score || 0)
  const averageScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)

  const sortedScores = [...scores].sort((a, b) => a - b)
  const medianScore = sortedScores[Math.floor(sortedScores.length / 2)]

  // Calculate dimension averages
  const dimensionAverages = {
    individual: Math.round(
      assessments.reduce((sum, a) => sum + (a.individual_score || 0), 0) / assessments.length
    ),
    leadership: Math.round(
      assessments.reduce((sum, a) => sum + (a.leadership_score || 0), 0) / assessments.length
    ),
    cultural: Math.round(
      assessments.reduce((sum, a) => sum + (a.cultural_score || 0), 0) / assessments.length
    ),
    embedding: Math.round(
      assessments.reduce((sum, a) => sum + (a.embedding_score || 0), 0) / assessments.length
    ),
    velocity: Math.round(
      assessments.reduce((sum, a) => sum + (a.velocity_score || 0), 0) / assessments.length
    ),
  }

  // Calculate trend (compare recent vs older)
  let trendDirection: 'improving' | 'stable' | 'declining' = 'stable'
  if (assessments.length >= 2) {
    const recentAvg =
      assessments.slice(0, Math.ceil(assessments.length / 2)).reduce((sum, a) => sum + (a.overall_score || 0), 0) /
      Math.ceil(assessments.length / 2)
    const olderAvg =
      assessments.slice(Math.ceil(assessments.length / 2)).reduce((sum, a) => sum + (a.overall_score || 0), 0) /
      Math.floor(assessments.length / 2)

    if (recentAvg - olderAvg > 5) trendDirection = 'improving'
    else if (olderAvg - recentAvg > 5) trendDirection = 'declining'
  }

  return {
    assessmentCount: assessments.length,
    averageScore,
    medianScore,
    maturityLevel: getMaturityLevel(averageScore),
    trendDirection,
    dimensionAverages,
  }
}

// Utility function
function groupBy<T>(array: T[], keyOrFn: keyof T | ((item: T) => string)): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const key = typeof keyOrFn === 'function' ? keyOrFn(item) : String(item[keyOrFn])
      if (!result[key]) result[key] = []
      result[key].push(item)
      return result
    },
    {} as Record<string, T[]>
  )
}
