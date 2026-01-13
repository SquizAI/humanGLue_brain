/**
 * AI Maturity Assessment Component Types
 * Generic TypeScript interfaces for reusable assessment dashboard components
 */

import { LucideIcon } from 'lucide-react'

// ============================================================================
// Core Assessment Types
// ============================================================================

/** Maturity level from -2 (Resistant) to 10 (Transcending) */
export type MaturityScore = -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

/** Sentiment classification for interview quotes */
export type Sentiment = 'positive' | 'negative' | 'neutral'

/** Growth potential classification */
export type GrowthPotential = 'low' | 'medium' | 'high'

/** AI anxiety level classification */
export type AnxietyLevel = 'low' | 'medium' | 'high'

/** Opportunity level classification */
export type OpportunityLevel = 'low' | 'medium' | 'high'

/** Color theme options for components */
export type ColorTheme = 'cyan' | 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'amber'

// ============================================================================
// Interview Evidence Types
// ============================================================================

export interface InterviewQuote {
  /** The quoted text from the interview */
  quote: string
  /** Name and title of the speaker */
  speaker: string
  /** Sentiment classification of the quote */
  sentiment: Sentiment
}

export interface ConsensusTheme {
  /** Theme identifier */
  id: string
  /** Theme title */
  title: string
  /** Theme description */
  description: string
  /** Number of interviewees mentioning this theme */
  mentionCount: number
  /** Total interviewees */
  totalInterviews: number
  /** Related quotes supporting this theme */
  quotes: InterviewQuote[]
  /** Overall sentiment of the theme */
  sentiment: Sentiment
}

// ============================================================================
// Maturity Level Types
// ============================================================================

export interface MaturityLevel {
  /** Numeric level from -2 to 10 */
  level: MaturityScore
  /** Level name (e.g., "AI Unaware", "AI Curious") */
  name: string
  /** Short description */
  description: string
  /** Full detailed description */
  fullDescription: string
  /** Key characteristics of this level */
  characteristics: string[]
  /** Typical behaviors at this level */
  typicalBehaviors: string[]
  /** Estimated time to reach next level */
  timeToNext: string
  /** Whether this is the current level */
  current?: boolean
}

export const MATURITY_LEVELS: Record<MaturityScore, string> = {
  [-2]: 'Resistant',
  [-1]: 'Skeptical',
  [0]: 'AI Unaware',
  [1]: 'AI Curious',
  [2]: 'AI Experimenting',
  [3]: 'AI Connecting',
  [4]: 'AI Collaborating',
  [5]: 'AI Integrating',
  [6]: 'AI Orchestrating',
  [7]: 'AI Leading',
  [8]: 'AI Innovating',
  [9]: 'AI Transforming',
  [10]: 'AI Transcending',
}

// ============================================================================
// Dimension & Category Types
// ============================================================================

export interface AssessmentDimension {
  /** Unique dimension identifier */
  id: string
  /** Dimension name */
  name: string
  /** Score from -2 to 10 */
  score: number
  /** Short description */
  description: string
  /** Detailed reasoning for the score */
  reasoning: string
  /** Supporting evidence from interviews */
  evidence: InterviewQuote[]
  /** Identified gaps */
  gaps: string[]
  /** Recommended next steps */
  nextSteps: string[]
  /** Whether this dimension is critical */
  critical?: boolean
}

export interface AssessmentCategory {
  /** Unique category identifier */
  id: string
  /** Category name (e.g., "Strategy & Leadership") */
  name: string
  /** Lucide icon component */
  icon: LucideIcon
  /** Color theme */
  color: ColorTheme
  /** Average score across dimensions */
  average: number
  /** Category description */
  description: string
  /** Dimensions within this category */
  dimensions: AssessmentDimension[]
  /** Whether this category is critical */
  critical?: boolean
}

// ============================================================================
// People & Skills Types
// ============================================================================

export interface PsychologicalProfile {
  /** How the person approaches problems */
  thinkingStyle: string
  /** How the person communicates */
  communicationStyle: string
  /** Readiness for change (0-100) */
  changeReadiness: number
  /** Level of AI-related anxiety */
  aiAnxiety: AnxietyLevel
  /** Primary motivation driver */
  keyMotivator: string
  /** Potential blocker to adoption */
  potentialBlocker: string
  /** Recommended engagement approach */
  recommendedApproach: string
}

export interface TeamMemberProfile {
  /** Full name */
  name: string
  /** Job title */
  title: string
  /** Current maturity level */
  level: MaturityScore
  /** Level name */
  levelName: string
  /** AI tools currently used */
  tools: string[]
  /** Growth potential */
  growth: GrowthPotential
  /** Department */
  department: string
  /** Interview duration in minutes */
  interviewDuration: number
  /** Psychological profile */
  psychology: PsychologicalProfile
  /** Notable quotes from interview */
  keyQuotes?: string[]
  /** Whether identified as potential AI champion */
  potential?: boolean
}

export interface AITool {
  /** Tool name */
  name: string
  /** Tool category */
  category: string
  /** Number of users */
  users: number
  /** Whether enterprise licensed */
  enterprise?: boolean
}

// ============================================================================
// Business Process Types
// ============================================================================

export interface BusinessProcess {
  /** Process identifier */
  id: string
  /** Process name */
  name: string
  /** Owning department */
  department: string
  /** Current state description */
  currentState: string
  /** Pain points in current process */
  painPoints: string[]
  /** AI opportunity level */
  aiOpportunity: OpportunityLevel
  /** Automation potential percentage (0-100) */
  automationPotential: number
  /** Recommended AI tools */
  recommendedTools: string[]
  /** Estimated time savings */
  estimatedTimeSavings: string
  /** Priority ranking */
  priority: number
}

export interface DepartmentAnalysis {
  /** Department name */
  name: string
  /** Team members */
  members: string[]
  /** Average maturity score */
  avgMaturity: number
  /** Department strengths */
  strengths: string[]
  /** Department weaknesses */
  weaknesses: string[]
  /** Potential AI champion */
  championCandidate: string | null
  /** Priority actions */
  priorityActions: string[]
}

// ============================================================================
// Recommendations Types
// ============================================================================

export interface Recommendation {
  /** Recommendation identifier */
  id: string
  /** Title */
  title: string
  /** Description */
  description: string
  /** Category (e.g., "Training", "Infrastructure") */
  category: string
  /** Priority level */
  priority: 'critical' | 'high' | 'medium' | 'low'
  /** Estimated effort */
  effort: 'low' | 'medium' | 'high'
  /** Expected impact */
  impact: 'low' | 'medium' | 'high'
  /** Related dimensions */
  relatedDimensions?: string[]
}

export interface TimelinePhase {
  /** Phase identifier */
  id: string
  /** Phase label (e.g., "30 Days", "60 Days", "90 Days") */
  label: string
  /** Days from start */
  days: number
  /** Phase title */
  title: string
  /** Phase description */
  description: string
  /** Recommendations for this phase */
  recommendations: Recommendation[]
  /** Key milestones */
  milestones: string[]
  /** Expected outcomes */
  outcomes: string[]
}

// ============================================================================
// Gap Analysis Types
// ============================================================================

export interface PerceptionGap {
  /** Dimension or area being measured */
  dimension: string
  /** Self-reported/perceived score */
  perceivedScore: number
  /** Actual/assessed score */
  actualScore: number
  /** Gap size (perceived - actual) */
  gapSize: number
  /** Analysis of the gap */
  analysis?: string
}

export interface RealityGapData {
  /** Overall perceived maturity */
  overallPerceived: number
  /** Overall actual maturity */
  overallActual: number
  /** Gap breakdown by dimension */
  dimensions: PerceptionGap[]
  /** Key insights */
  insights: string[]
}

// ============================================================================
// Executive Summary Types
// ============================================================================

export interface BenchmarkComparison {
  /** Metric name */
  metric: string
  /** Organization's value */
  orgValue: number
  /** Industry benchmark */
  industryBenchmark: number
  /** Percentile rank */
  percentile?: number
}

export interface ExecutiveSummary {
  /** Overall maturity score */
  overallScore: number
  /** Current maturity level */
  maturityLevel: MaturityScore
  /** Maturity level name */
  maturityName: string
  /** Number of interviews conducted */
  interviewCount: number
  /** Total interview minutes */
  totalInterviewMinutes: number
  /** Number of AI champions identified */
  championsIdentified: number
  /** Assessment confidence level (0-100) */
  confidenceLevel: number
  /** Critical gaps identified */
  criticalGaps: string[]
  /** Quick wins identified */
  quickWins: string[]
  /** Target maturity level (12 months) */
  targetLevel?: MaturityScore
  /** Benchmark comparisons */
  benchmarks?: BenchmarkComparison[]
}

// ============================================================================
// Full Assessment Data Type
// ============================================================================

export interface AssessmentData {
  /** Organization name */
  organizationName: string
  /** Assessment date */
  assessmentDate: string
  /** Executive summary */
  summary: ExecutiveSummary
  /** All maturity level definitions */
  maturityLevels: MaturityLevel[]
  /** Assessment categories with dimensions */
  categories: AssessmentCategory[]
  /** Team member profiles */
  skillProfiles: TeamMemberProfile[]
  /** Business process analysis */
  businessProcesses: BusinessProcess[]
  /** Department analysis */
  departmentAnalysis: DepartmentAnalysis[]
  /** Tools inventory */
  toolsInventory: AITool[]
  /** Consensus themes from interviews */
  consensusThemes?: ConsensusTheme[]
  /** Reality gap analysis */
  realityGaps?: RealityGapData
  /** Recommendations timeline */
  timeline?: TimelinePhase[]
}
