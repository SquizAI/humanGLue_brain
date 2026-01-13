/**
 * AI Maturity Assessment Components
 *
 * Reusable React components for displaying AI maturity assessment dashboards.
 * These components are designed to work with any organization's assessment data,
 * not just GlueIQ.
 *
 * @example
 * ```tsx
 * import {
 *   MaturityScoreCard,
 *   CategoryAssessmentList,
 *   SkillsMappingTable,
 *   ExecutiveSummaryHeader,
 * } from '@/components/assessment'
 *
 * function AssessmentDashboard({ data }: { data: AssessmentData }) {
 *   return (
 *     <div>
 *       <ExecutiveSummaryHeader
 *         organizationName={data.organizationName}
 *         assessmentDate={data.assessmentDate}
 *         summary={data.summary}
 *       />
 *       <MaturityScoreCard
 *         score={data.summary.overallScore}
 *         maturityLevel={data.summary.maturityLevel}
 *       />
 *       <CategoryAssessmentList categories={data.categories} />
 *       <SkillsMappingTable profiles={data.skillProfiles} />
 *     </div>
 *   )
 * }
 * ```
 */

// ============================================================================
// Type Exports
// ============================================================================
export type {
  // Core types
  MaturityScore,
  Sentiment,
  GrowthPotential,
  AnxietyLevel,
  OpportunityLevel,
  ColorTheme,

  // Interview & Evidence
  InterviewQuote,
  ConsensusTheme,

  // Maturity
  MaturityLevel,

  // Dimensions & Categories
  AssessmentDimension,
  AssessmentCategory,

  // People & Skills
  PsychologicalProfile,
  TeamMemberProfile,
  AITool,

  // Business Process
  BusinessProcess,
  DepartmentAnalysis,

  // Recommendations
  Recommendation,
  TimelinePhase,

  // Gap Analysis
  PerceptionGap,
  RealityGapData,

  // Executive Summary
  BenchmarkComparison,
  ExecutiveSummary,

  // Full Assessment
  AssessmentData,
} from './types'

export { MATURITY_LEVELS } from './types'

// ============================================================================
// Component Exports
// ============================================================================

// Score Display Components
export { MaturityScoreCard } from './MaturityScoreCard'
export type { MaturityScoreCardProps } from './MaturityScoreCard'

export { MaturityLevelScale } from './MaturityLevelScale'
export type { MaturityLevelScaleProps } from './MaturityLevelScale'

// Dimension & Category Components
export { DimensionScoresGrid } from './DimensionScoresGrid'
export type { DimensionScoresGridProps } from './DimensionScoresGrid'

export {
  CategoryAssessmentPanel,
  CategoryAssessmentList,
} from './CategoryAssessmentPanel'
export type {
  CategoryAssessmentPanelProps,
  CategoryAssessmentListProps,
} from './CategoryAssessmentPanel'

// Consensus & Evidence Components
export { ConsensusThemesView } from './ConsensusThemesView'
export type { ConsensusThemesViewProps } from './ConsensusThemesView'

export {
  InterviewQuoteCard,
  QuoteGrid,
  QuoteCarousel,
} from './InterviewQuoteCard'
export type {
  InterviewQuoteCardProps,
  QuoteGridProps,
  QuoteCarouselProps,
} from './InterviewQuoteCard'

// Gap Analysis Components
export { RealityGapChart } from './RealityGapChart'
export type { RealityGapChartProps } from './RealityGapChart'

// Recommendations Components
export { RecommendationsTimeline } from './RecommendationsTimeline'
export type { RecommendationsTimelineProps } from './RecommendationsTimeline'

// Header & Summary Components
export { ExecutiveSummaryHeader } from './ExecutiveSummaryHeader'
export type { ExecutiveSummaryHeaderProps } from './ExecutiveSummaryHeader'

// People & Skills Components
export { SkillsMappingTable } from './SkillsMappingTable'
export type { SkillsMappingTableProps } from './SkillsMappingTable'
