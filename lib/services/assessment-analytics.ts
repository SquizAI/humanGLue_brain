/**
 * Assessment Analytics Service
 *
 * Provides deep analytics and insights:
 * - Individual performance analysis
 * - Organization-wide analytics
 * - Industry comparisons
 * - Trend analysis
 * - Predictive insights
 */

import { createClient } from '@/lib/supabase/server'
import { getMaturityLevel, calculateScoreTrend, getOrganizationScoreSummary } from './scoring-engine'
import { getIndustryBenchmark } from './industry-benchmarks'

export interface IndividualAnalytics {
  userId: string
  assessmentHistory: Array<{
    assessmentId: string
    completedAt: string
    overallScore: number
    maturityLevel: string
  }>
  currentScore: number
  currentMaturityLevel: string
  improvement: {
    sinceFirst: number
    sinceLast: number
    averagePerAssessment: number
  }
  strengths: Array<{
    dimension: string
    score: number
    percentile: number
  }>
  weaknesses: Array<{
    dimension: string
    score: number
    percentile: number
  }>
  learningVelocity: 'fast' | 'moderate' | 'slow'
  consistency: number // 0-100, how consistent scores are across dimensions
}

export interface OrganizationAnalytics {
  organizationId: string
  organizationName: string
  industry: string
  totalAssessments: number
  activeUsers: number
  averageScore: number
  maturityLevel: string
  maturityDistribution: Array<{
    level: string
    count: number
    percentage: number
  }>
  dimensionBreakdown: Array<{
    dimension: string
    average: number
    min: number
    max: number
    stdDev: number
  }>
  trends: {
    direction: 'improving' | 'stable' | 'declining'
    monthlyScores: Array<{
      month: string
      average: number
      assessmentCount: number
    }>
  }
  industryComparison: {
    industryAverage: number
    percentile: number
    rank: string
  }
  topPerformers: Array<{
    userId: string
    score: number
    improvement: number
  }>
  areasNeedingAttention: string[]
}

export interface IndustryAnalytics {
  industry: string
  totalOrganizations: number
  totalAssessments: number
  averageScore: number
  maturityLevel: string
  leaderScore: number
  laggardScore: number
  dimensionAverages: Record<string, number>
  topTrends: string[]
}

/**
 * Get comprehensive analytics for an individual user
 */
export async function getIndividualAnalytics(userId: string): Promise<IndividualAnalytics> {
  const supabase = await createClient()

  // Get assessment history
  const { data: assessments } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: true })

  if (!assessments || assessments.length === 0) {
    throw new Error('No completed assessments found for user')
  }

  const assessmentHistory = assessments.map((a) => ({
    assessmentId: a.id,
    completedAt: a.completed_at,
    overallScore: a.overall_score || 0,
    maturityLevel: getMaturityLevel(a.overall_score || 0).name,
  }))

  const latestAssessment = assessments[assessments.length - 1]
  const firstAssessment = assessments[0]

  // Calculate improvement metrics
  const sinceFirst = (latestAssessment.overall_score || 0) - (firstAssessment.overall_score || 0)
  const sinceLast =
    assessments.length > 1
      ? (latestAssessment.overall_score || 0) -
        (assessments[assessments.length - 2].overall_score || 0)
      : 0
  const averagePerAssessment = assessments.length > 1 ? sinceFirst / (assessments.length - 1) : 0

  // Identify strengths and weaknesses
  const dimensions = ['individual', 'leadership', 'cultural', 'embedding', 'velocity']
  const dimensionScores = dimensions.map((dim) => ({
    dimension: dim,
    score: (latestAssessment as any)[`${dim}_score`] || 0,
    percentile: 50, // TODO: Calculate actual percentile
  }))

  dimensionScores.sort((a, b) => b.score - a.score)
  const strengths = dimensionScores.slice(0, 2)
  const weaknesses = dimensionScores.slice(-2).reverse()

  // Calculate learning velocity
  let learningVelocity: 'fast' | 'moderate' | 'slow' = 'moderate'
  if (averagePerAssessment > 5) learningVelocity = 'fast'
  else if (averagePerAssessment < 1) learningVelocity = 'slow'

  // Calculate consistency (low std dev = high consistency)
  const scores = dimensionScores.map((d) => d.score)
  const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length
  const stdDev = Math.sqrt(variance)
  const consistency = Math.max(0, Math.round(100 - stdDev * 2))

  return {
    userId,
    assessmentHistory,
    currentScore: latestAssessment.overall_score || 0,
    currentMaturityLevel: getMaturityLevel(latestAssessment.overall_score || 0).name,
    improvement: {
      sinceFirst: Math.round(sinceFirst),
      sinceLast: Math.round(sinceLast),
      averagePerAssessment: Math.round(averagePerAssessment * 10) / 10,
    },
    strengths,
    weaknesses,
    learningVelocity,
    consistency,
  }
}

/**
 * Get comprehensive analytics for an organization
 */
export async function getOrganizationAnalytics(
  organizationId: string
): Promise<OrganizationAnalytics> {
  const supabase = await createClient()

  // Get organization info
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single()

  if (!org) {
    throw new Error('Organization not found')
  }

  // Get all assessments for this organization
  const { data: assessments } = await supabase
    .from('assessments')
    .select('*, users(id, email)')
    .eq('organization_id', organizationId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })

  if (!assessments || assessments.length === 0) {
    return {
      organizationId,
      organizationName: org.name,
      industry: org.industry || 'Unknown',
      totalAssessments: 0,
      activeUsers: 0,
      averageScore: 0,
      maturityLevel: 'Unaware',
      maturityDistribution: [],
      dimensionBreakdown: [],
      trends: { direction: 'stable', monthlyScores: [] },
      industryComparison: { industryAverage: 0, percentile: 0, rank: 'N/A' },
      topPerformers: [],
      areasNeedingAttention: [],
    }
  }

  // Calculate basic metrics
  const scores = assessments.map((a) => a.overall_score || 0)
  const averageScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
  const uniqueUsers = new Set(assessments.map((a) => a.user_id))

  // Maturity distribution
  const maturityCounts: Record<string, number> = {}
  for (const assessment of assessments) {
    const level = getMaturityLevel(assessment.overall_score || 0).name
    maturityCounts[level] = (maturityCounts[level] || 0) + 1
  }
  const maturityDistribution = Object.entries(maturityCounts).map(([level, count]) => ({
    level,
    count,
    percentage: Math.round((count / assessments.length) * 100),
  }))

  // Dimension breakdown
  const dimensions = ['individual', 'leadership', 'cultural', 'embedding', 'velocity']
  const dimensionBreakdown = dimensions.map((dim) => {
    const dimScores = assessments.map((a) => (a as any)[`${dim}_score`] || 0)
    const avg = dimScores.reduce((sum, s) => sum + s, 0) / dimScores.length
    const min = Math.min(...dimScores)
    const max = Math.max(...dimScores)
    const variance = dimScores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / dimScores.length
    const stdDev = Math.sqrt(variance)

    return {
      dimension: dim,
      average: Math.round(avg),
      min,
      max,
      stdDev: Math.round(stdDev * 10) / 10,
    }
  })

  // Monthly trends
  const monthlyScores: Record<string, { total: number; count: number }> = {}
  for (const assessment of assessments) {
    const month = assessment.completed_at.substring(0, 7) // YYYY-MM
    if (!monthlyScores[month]) monthlyScores[month] = { total: 0, count: 0 }
    monthlyScores[month].total += assessment.overall_score || 0
    monthlyScores[month].count++
  }
  const monthlyScoresArray = Object.entries(monthlyScores)
    .map(([month, data]) => ({
      month,
      average: Math.round(data.total / data.count),
      assessmentCount: data.count,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))

  // Calculate trend direction
  let trendDirection: 'improving' | 'stable' | 'declining' = 'stable'
  if (monthlyScoresArray.length >= 2) {
    const recentAvg =
      monthlyScoresArray.slice(-2).reduce((sum, m) => sum + m.average, 0) /
      Math.min(2, monthlyScoresArray.length)
    const olderAvg =
      monthlyScoresArray.slice(0, -2).reduce((sum, m) => sum + m.average, 0) /
      Math.max(1, monthlyScoresArray.length - 2)

    if (recentAvg - olderAvg > 3) trendDirection = 'improving'
    else if (olderAvg - recentAvg > 3) trendDirection = 'declining'
  }

  // Industry comparison
  let industryComparison = { industryAverage: averageScore, percentile: 50, rank: 'Average' }
  if (org.industry) {
    const benchmark = await getIndustryBenchmark(org.industry)
    if (benchmark) {
      industryComparison = {
        industryAverage: benchmark.averageMaturityLevel * 10, // Convert 0-10 to 0-100
        percentile: calculatePercentile(
          averageScore,
          benchmark.maturityDistribution.map((d) => d.level * 10)
        ),
        rank: getRank(averageScore, benchmark.averageMaturityLevel * 10),
      }
    }
  }

  // Top performers (most improved)
  const userLatestScores: Record<string, { latest: number; earliest: number }> = {}
  for (const assessment of assessments) {
    const userId = assessment.user_id
    if (!userLatestScores[userId]) {
      userLatestScores[userId] = { latest: assessment.overall_score || 0, earliest: 0 }
    }
    userLatestScores[userId].earliest = assessment.overall_score || 0 // Will end up with earliest due to DESC order
  }
  const topPerformers = Object.entries(userLatestScores)
    .map(([userId, scores]) => ({
      userId,
      score: scores.latest,
      improvement: scores.latest - scores.earliest,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  // Areas needing attention (dimensions below industry average)
  const areasNeedingAttention: string[] = []
  for (const dim of dimensionBreakdown) {
    if (dim.average < averageScore - 10) {
      areasNeedingAttention.push(
        `${dim.dimension.charAt(0).toUpperCase() + dim.dimension.slice(1)} dimension (${dim.average}) is significantly below organization average`
      )
    }
    if (dim.stdDev > 20) {
      areasNeedingAttention.push(
        `High variance in ${dim.dimension} scores suggests inconsistent adoption across teams`
      )
    }
  }

  return {
    organizationId,
    organizationName: org.name,
    industry: org.industry || 'Unknown',
    totalAssessments: assessments.length,
    activeUsers: uniqueUsers.size,
    averageScore,
    maturityLevel: getMaturityLevel(averageScore).name,
    maturityDistribution,
    dimensionBreakdown,
    trends: {
      direction: trendDirection,
      monthlyScores: monthlyScoresArray,
    },
    industryComparison,
    topPerformers,
    areasNeedingAttention,
  }
}

/**
 * Get industry-wide analytics
 */
export async function getIndustryAnalytics(industry: string): Promise<IndustryAnalytics> {
  const supabase = await createClient()

  // Get all organizations and assessments in this industry
  const { data: orgs } = await supabase.from('organizations').select('id').eq('industry', industry)

  if (!orgs || orgs.length === 0) {
    return {
      industry,
      totalOrganizations: 0,
      totalAssessments: 0,
      averageScore: 0,
      maturityLevel: 'Unaware',
      leaderScore: 0,
      laggardScore: 0,
      dimensionAverages: {},
      topTrends: [],
    }
  }

  const orgIds = orgs.map((o) => o.id)

  const { data: assessments } = await supabase
    .from('assessments')
    .select('*')
    .in('organization_id', orgIds)
    .eq('status', 'completed')

  if (!assessments || assessments.length === 0) {
    return {
      industry,
      totalOrganizations: orgs.length,
      totalAssessments: 0,
      averageScore: 0,
      maturityLevel: 'Unaware',
      leaderScore: 0,
      laggardScore: 0,
      dimensionAverages: {},
      topTrends: [],
    }
  }

  const scores = assessments.map((a) => a.overall_score || 0)
  const averageScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)

  // Calculate dimension averages
  const dimensions = ['individual', 'leadership', 'cultural', 'embedding', 'velocity']
  const dimensionAverages: Record<string, number> = {}
  for (const dim of dimensions) {
    const dimScores = assessments.map((a) => (a as any)[`${dim}_score`] || 0)
    dimensionAverages[dim] = Math.round(
      dimScores.reduce((sum, s) => sum + s, 0) / dimScores.length
    )
  }

  // Identify trends
  const topTrends: string[] = []
  const sortedDimensions = Object.entries(dimensionAverages).sort((a, b) => b[1] - a[1])

  topTrends.push(`${sortedDimensions[0][0]} is the strongest dimension in ${industry} (avg: ${sortedDimensions[0][1]})`)
  topTrends.push(`${sortedDimensions[4][0]} presents the biggest opportunity for growth (avg: ${sortedDimensions[4][1]})`)

  if (averageScore < 50) {
    topTrends.push(`${industry} industry is still in early stages of AI maturity`)
  } else if (averageScore > 70) {
    topTrends.push(`${industry} industry shows advanced AI adoption`)
  }

  return {
    industry,
    totalOrganizations: orgs.length,
    totalAssessments: assessments.length,
    averageScore,
    maturityLevel: getMaturityLevel(averageScore).name,
    leaderScore: Math.max(...scores),
    laggardScore: Math.min(...scores),
    dimensionAverages,
    topTrends,
  }
}

/**
 * Generate executive summary for organization
 */
export async function generateExecutiveSummary(organizationId: string): Promise<{
  headline: string
  keyMetrics: Array<{ label: string; value: string; trend?: 'up' | 'down' | 'stable' }>
  highlights: string[]
  concerns: string[]
  recommendations: string[]
}> {
  const analytics = await getOrganizationAnalytics(organizationId)

  const headline = `${analytics.organizationName} is at ${analytics.maturityLevel} maturity level with an average score of ${analytics.averageScore}/100`

  const getTrend = (direction: string): 'up' | 'down' | 'stable' => {
    if (direction === 'improving') return 'up'
    if (direction === 'declining') return 'down'
    return 'stable'
  }

  const keyMetrics: Array<{ label: string; value: string; trend?: 'up' | 'down' | 'stable' }> = [
    {
      label: 'Average Score',
      value: `${analytics.averageScore}/100`,
      trend: getTrend(analytics.trends.direction),
    },
    { label: 'Maturity Level', value: analytics.maturityLevel },
    { label: 'Active Users', value: String(analytics.activeUsers) },
    {
      label: 'Industry Percentile',
      value: `${analytics.industryComparison.percentile}%`,
    },
  ]

  const highlights: string[] = []
  const concerns: string[] = []

  // Find highlights (high-performing dimensions)
  const strongDimensions = analytics.dimensionBreakdown.filter((d) => d.average > analytics.averageScore + 5)
  for (const dim of strongDimensions) {
    highlights.push(`Strong ${dim.dimension} capability (${dim.average}/100)`)
  }

  if (analytics.trends.direction === 'improving') {
    highlights.push('Positive trend in AI maturity scores')
  }

  if (analytics.industryComparison.percentile > 75) {
    highlights.push(`Outperforming ${100 - analytics.industryComparison.percentile}% of industry peers`)
  }

  // Add concerns from areas needing attention
  concerns.push(...analytics.areasNeedingAttention)

  if (analytics.trends.direction === 'declining') {
    concerns.push('Scores have been declining - immediate attention needed')
  }

  // Generate recommendations
  const recommendations: string[] = []

  const weakestDimension = analytics.dimensionBreakdown.reduce((min, d) =>
    d.average < min.average ? d : min
  )
  recommendations.push(
    `Priority focus: Improve ${weakestDimension.dimension} dimension which is currently at ${weakestDimension.average}/100`
  )

  if (analytics.activeUsers < 10) {
    recommendations.push('Increase assessment participation to get more comprehensive organizational insights')
  }

  if (analytics.industryComparison.percentile < 50) {
    recommendations.push('Consider industry-specific AI training programs to catch up with peers')
  }

  return {
    headline,
    keyMetrics,
    highlights,
    concerns,
    recommendations,
  }
}

// Utility functions
function calculatePercentile(score: number, distribution: number[]): number {
  const below = distribution.filter((d) => d < score).length
  return Math.round((below / distribution.length) * 100)
}

function getRank(score: number, industryAverage: number): string {
  const diff = score - industryAverage
  if (diff > 20) return 'Industry Leader'
  if (diff > 10) return 'Above Average'
  if (diff > -10) return 'Average'
  if (diff > -20) return 'Below Average'
  return 'Needs Improvement'
}
