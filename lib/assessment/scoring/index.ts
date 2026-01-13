/**
 * Assessment Scoring Engines
 *
 * Exports all scoring logic for different assessment types.
 */

// GlueIQ Scorer
export {
  calculateGlueIQScore,
  normalizeAnswerValue,
  prepareAnswersForScoring,
  type Answer,
  type DimensionScore,
  type GlueIQResult,
  type Recommendation,
  type Insight,
} from './glueiq-scorer'

// Scoring utilities
export function getMaturityLabel(score: number): string {
  if (score < 10) return 'AI Unaware'
  if (score < 20) return 'AI Curious'
  if (score < 30) return 'AI Aware'
  if (score < 40) return 'AI Exploring'
  if (score < 50) return 'AI Adopting'
  if (score < 60) return 'AI Practicing'
  if (score < 70) return 'AI Proficient'
  if (score < 80) return 'AI Advanced'
  if (score < 90) return 'AI Champion'
  if (score < 100) return 'AI Leader'
  return 'AI Visionary'
}

export function getScoreColor(score: number): string {
  if (score < 30) return '#EF4444' // red
  if (score < 50) return '#F59E0B' // amber
  if (score < 70) return '#FBBF24' // yellow
  if (score < 85) return '#10B981' // emerald
  return '#06B6D4' // cyan
}

export function getScoreGrade(score: number): 'F' | 'D' | 'C' | 'B' | 'A' | 'A+' {
  if (score < 30) return 'F'
  if (score < 50) return 'D'
  if (score < 60) return 'C'
  if (score < 75) return 'B'
  if (score < 90) return 'A'
  return 'A+'
}

export function formatScorePercentage(score: number): string {
  return `${Math.round(score)}%`
}

export function calculatePercentile(score: number, benchmarks: number[]): number {
  if (benchmarks.length === 0) return 50
  const sorted = [...benchmarks].sort((a, b) => a - b)
  const position = sorted.filter(b => b < score).length
  return Math.round((position / sorted.length) * 100)
}
