/**
 * GlueIQ Assessment Scoring Engine
 *
 * Calculates dimension scores, overall GlueIQ score, maturity level,
 * and generates personalized insights and recommendations.
 */

import { glueiqDimensions } from '../questions/glueiq-questions'

export interface Answer {
  questionCode: string
  dimension: string
  subdimension: string
  answerType: 'scale' | 'multiChoice' | 'fearToConfidence' | 'boolean'
  value: number // 0-100 normalized value
  weight: number
  answeredAt: Date
}

export interface DimensionScore {
  dimension: string
  name: string
  score: number // 0-100
  level: 'low' | 'developing' | 'proficient' | 'advanced' | 'expert'
  questionsAnswered: number
  totalWeight: number
  subdimensionScores: Record<string, number>
  color: string
}

export interface GlueIQResult {
  overallScore: number
  maturityLevel: number // 0-10
  maturityName: string
  dimensionScores: DimensionScore[]
  strengths: string[]
  growthAreas: string[]
  recommendations: Recommendation[]
  insights: Insight[]
  percentile?: number // Compared to other users
  completedAt: Date
}

export interface Recommendation {
  priority: 'high' | 'medium' | 'low'
  dimension: string
  title: string
  description: string
  actionItems: string[]
  resources?: string[]
  estimatedImpact: 'high' | 'medium' | 'low'
}

export interface Insight {
  type: 'strength' | 'gap' | 'opportunity' | 'pattern'
  title: string
  description: string
  dimension?: string
}

/**
 * Get level classification from score
 */
function getScoreLevel(score: number): 'low' | 'developing' | 'proficient' | 'advanced' | 'expert' {
  if (score < 20) return 'low'
  if (score < 40) return 'developing'
  if (score < 60) return 'proficient'
  if (score < 80) return 'advanced'
  return 'expert'
}

/**
 * Get maturity level name from 0-10 scale
 */
function getMaturityName(level: number): string {
  const names = [
    'AI Unaware',
    'AI Curious',
    'AI Aware',
    'AI Exploring',
    'AI Adopting',
    'AI Practicing',
    'AI Proficient',
    'AI Advanced',
    'AI Champion',
    'AI Leader',
    'AI Visionary',
  ]
  return names[Math.min(level, 10)]
}

/**
 * Calculate dimension score from answers
 */
function calculateDimensionScore(
  dimension: string,
  answers: Answer[]
): DimensionScore {
  const dimensionAnswers = answers.filter(a => a.dimension === dimension)

  if (dimensionAnswers.length === 0) {
    return {
      dimension,
      name: glueiqDimensions[dimension as keyof typeof glueiqDimensions]?.name || dimension,
      score: 0,
      level: 'low',
      questionsAnswered: 0,
      totalWeight: 0,
      subdimensionScores: {},
      color: glueiqDimensions[dimension as keyof typeof glueiqDimensions]?.color || '#666',
    }
  }

  // Calculate weighted average
  let totalWeightedScore = 0
  let totalWeight = 0
  const subdimensionScores: Record<string, { total: number; weight: number }> = {}

  for (const answer of dimensionAnswers) {
    const weightedValue = answer.value * answer.weight
    totalWeightedScore += weightedValue
    totalWeight += answer.weight

    // Track subdimension scores
    if (!subdimensionScores[answer.subdimension]) {
      subdimensionScores[answer.subdimension] = { total: 0, weight: 0 }
    }
    subdimensionScores[answer.subdimension].total += weightedValue
    subdimensionScores[answer.subdimension].weight += answer.weight
  }

  const score = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0

  // Calculate subdimension averages
  const subdimensionAvgs: Record<string, number> = {}
  for (const [subdim, data] of Object.entries(subdimensionScores)) {
    subdimensionAvgs[subdim] = data.weight > 0 ? Math.round(data.total / data.weight) : 0
  }

  const dimConfig = glueiqDimensions[dimension as keyof typeof glueiqDimensions]

  return {
    dimension,
    name: dimConfig?.name || dimension,
    score,
    level: getScoreLevel(score),
    questionsAnswered: dimensionAnswers.length,
    totalWeight,
    subdimensionScores: subdimensionAvgs,
    color: dimConfig?.color || '#666',
  }
}

/**
 * Generate recommendations based on scores
 */
function generateRecommendations(dimensionScores: DimensionScore[]): Recommendation[] {
  const recommendations: Recommendation[] = []

  for (const dim of dimensionScores) {
    if (dim.score < 40) {
      // High priority - significant gap
      recommendations.push(createRecommendation(dim, 'high'))
    } else if (dim.score < 60) {
      // Medium priority - room for improvement
      recommendations.push(createRecommendation(dim, 'medium'))
    } else if (dim.score < 80) {
      // Low priority - good but can optimize
      recommendations.push(createRecommendation(dim, 'low'))
    }
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
}

/**
 * Create recommendation for a dimension
 */
function createRecommendation(
  dim: DimensionScore,
  priority: 'high' | 'medium' | 'low'
): Recommendation {
  const recommendationTemplates: Record<string, { title: string; description: string; actionItems: string[] }> = {
    individual: {
      title: 'Build Your AI Foundation',
      description: `Your Individual Readiness score of ${dim.score}% indicates opportunity to strengthen your personal AI capabilities.`,
      actionItems: [
        'Complete an AI literacy course (e.g., Google AI Essentials, LinkedIn Learning)',
        'Experiment with one new AI tool this week',
        'Set aside 30 minutes daily for AI exploration',
        'Join an AI community or forum to learn from others',
      ],
    },
    leadership: {
      title: 'Develop AI Leadership Skills',
      description: `Your Leadership Capability score of ${dim.score}% shows room to grow in guiding others through AI transformation.`,
      actionItems: [
        'Create a vision document for how AI will benefit your team',
        'Schedule monthly AI learning sessions with your team',
        'Identify and mentor one team member as an AI champion',
        'Practice communicating AI benefits in business terms',
      ],
    },
    cultural: {
      title: 'Foster Innovation Culture',
      description: `Your Cultural Alignment score of ${dim.score}% suggests opportunity to create a more innovation-friendly environment.`,
      actionItems: [
        'Celebrate AI experiments, even unsuccessful ones',
        'Create a safe space for sharing AI concerns and fears',
        'Start a weekly AI wins and learnings share-out',
        'Establish guidelines for responsible AI experimentation',
      ],
    },
    embedding: {
      title: 'Embed AI Into Your Workflow',
      description: `Your Behavior Embedding score of ${dim.score}% indicates AI practices aren't yet fully integrated into daily work.`,
      actionItems: [
        'Document your top 3 AI use cases with step-by-step guides',
        'Add AI prompts to your existing templates and processes',
        'Set weekly goals for AI usage and track progress',
        'Create an AI playbook for your most common tasks',
      ],
    },
    velocity: {
      title: 'Accelerate Your AI Adoption',
      description: `Your Change Velocity score of ${dim.score}% suggests room to increase the speed of AI transformation.`,
      actionItems: [
        'Set up rapid experimentation sprints for new AI tools',
        'Create a fast-track approval process for AI pilots',
        'Build resilience through small, frequent iterations',
        'Establish clear success metrics for AI initiatives',
      ],
    },
  }

  const template = recommendationTemplates[dim.dimension] || {
    title: `Improve ${dim.name}`,
    description: `Your score of ${dim.score}% indicates opportunity for improvement.`,
    actionItems: ['Identify specific areas for improvement', 'Create an action plan', 'Track progress weekly'],
  }

  return {
    priority,
    dimension: dim.dimension,
    title: template.title,
    description: template.description,
    actionItems: template.actionItems.slice(0, priority === 'high' ? 4 : priority === 'medium' ? 3 : 2),
    estimatedImpact: priority,
  }
}

/**
 * Generate insights from scores
 */
function generateInsights(dimensionScores: DimensionScore[], overallScore: number): Insight[] {
  const insights: Insight[] = []

  // Find strengths (top 2 dimensions)
  const sortedDims = [...dimensionScores].sort((a, b) => b.score - a.score)
  const topDims = sortedDims.slice(0, 2).filter(d => d.score >= 60)
  const bottomDims = sortedDims.slice(-2).filter(d => d.score < 60)

  for (const dim of topDims) {
    insights.push({
      type: 'strength',
      title: `Strong ${dim.name}`,
      description: `Your ${dim.name.toLowerCase()} is a significant strength at ${dim.score}%. This positions you well to help others and lead AI initiatives.`,
      dimension: dim.dimension,
    })
  }

  for (const dim of bottomDims) {
    insights.push({
      type: 'gap',
      title: `${dim.name} Gap`,
      description: `Your ${dim.name.toLowerCase()} score of ${dim.score}% is an area for focused development. Addressing this will significantly boost your overall AI adaptability.`,
      dimension: dim.dimension,
    })
  }

  // Pattern insights
  const avgScore = overallScore
  const variance = dimensionScores.reduce((sum, d) => sum + Math.pow(d.score - avgScore, 2), 0) / dimensionScores.length
  const stdDev = Math.sqrt(variance)

  if (stdDev < 10) {
    insights.push({
      type: 'pattern',
      title: 'Balanced Profile',
      description: 'Your scores are relatively consistent across all dimensions, indicating a well-rounded AI adaptability profile.',
    })
  } else if (stdDev > 25) {
    insights.push({
      type: 'pattern',
      title: 'Uneven Development',
      description: 'There\'s significant variation in your dimension scores. Focus on bringing up your lower-scoring areas for more balanced growth.',
    })
  }

  // Opportunity insights
  if (overallScore >= 60 && overallScore < 80) {
    insights.push({
      type: 'opportunity',
      title: 'Ready to Lead',
      description: 'Your profile suggests you\'re ready to take on AI leadership responsibilities. Consider mentoring others or leading AI initiatives.',
    })
  }

  return insights
}

/**
 * Main scoring function - calculate complete GlueIQ results
 */
export function calculateGlueIQScore(answers: Answer[]): GlueIQResult {
  // Calculate dimension scores
  const dimensions = ['individual', 'leadership', 'cultural', 'embedding', 'velocity']
  const dimensionScores = dimensions.map(dim => calculateDimensionScore(dim, answers))

  // Calculate overall score (weighted average of dimensions)
  const totalScore = dimensionScores.reduce((sum, d) => sum + d.score, 0)
  const overallScore = Math.round(totalScore / dimensionScores.length)

  // Calculate maturity level (0-10 scale)
  const maturityLevel = Math.min(Math.floor(overallScore / 10), 10)

  // Identify strengths and growth areas
  const strengths = dimensionScores
    .filter(d => d.score >= 70)
    .sort((a, b) => b.score - a.score)
    .map(d => d.name)

  const growthAreas = dimensionScores
    .filter(d => d.score < 50)
    .sort((a, b) => a.score - b.score)
    .map(d => d.name)

  // Generate recommendations and insights
  const recommendations = generateRecommendations(dimensionScores)
  const insights = generateInsights(dimensionScores, overallScore)

  return {
    overallScore,
    maturityLevel,
    maturityName: getMaturityName(maturityLevel),
    dimensionScores,
    strengths,
    growthAreas,
    recommendations,
    insights,
    completedAt: new Date(),
  }
}

/**
 * Normalize raw answer value to 0-100 scale
 */
export function normalizeAnswerValue(
  answerType: string,
  rawValue: number | string | boolean,
  options?: Array<{ value: number; label: string }>
): number {
  switch (answerType) {
    case 'scale':
    case 'fearToConfidence':
      // Already 0-100
      return typeof rawValue === 'number' ? Math.min(100, Math.max(0, rawValue)) : 0

    case 'multiChoice':
      // Value should already be 0-100 from options
      return typeof rawValue === 'number' ? rawValue : 0

    case 'boolean':
      return rawValue === true || rawValue === 'yes' || rawValue === 1 ? 100 : 0

    case 'percentage':
      return typeof rawValue === 'number' ? Math.min(100, Math.max(0, rawValue)) : 0

    default:
      return typeof rawValue === 'number' ? rawValue : 0
  }
}

/**
 * Convert assessment responses to Answer format for scoring
 */
export function prepareAnswersForScoring(
  responses: Array<{
    question_code: string
    metadata: {
      dimension?: string
      subdimension?: string
      answer_type?: string
      answer_value?: number
      question_weight?: number
    }
    answered_at?: string
  }>
): Answer[] {
  return responses.map(r => ({
    questionCode: r.question_code,
    dimension: r.metadata?.dimension || 'individual',
    subdimension: r.metadata?.subdimension || 'general',
    answerType: (r.metadata?.answer_type || 'scale') as Answer['answerType'],
    value: normalizeAnswerValue(r.metadata?.answer_type || 'scale', r.metadata?.answer_value || 0),
    weight: r.metadata?.question_weight || 1,
    answeredAt: r.answered_at ? new Date(r.answered_at) : new Date(),
  }))
}

export default calculateGlueIQScore
