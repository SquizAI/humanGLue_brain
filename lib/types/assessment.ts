/**
 * Organization Assessment Types
 * TypeScript types for AI Maturity Assessment data
 */

// =====================================================================================
// CORE ASSESSMENT TYPES
// =====================================================================================

export type MaturityLevel =
  | 'exploring'
  | 'experimenting'
  | 'establishing'
  | 'evolving'
  | 'excelling'

export type SentimentType = 'positive' | 'negative' | 'neutral' | 'mixed'

export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low'

export type RecommendationTimeframe = 'immediate' | 'short_term' | 'long_term'

export type RecommendationCategory =
  | 'training'
  | 'tools'
  | 'governance'
  | 'culture'
  | 'process'
  | 'infrastructure'
  | 'strategy'

export type DimensionCategory =
  | 'individual'
  | 'leadership'
  | 'cultural'
  | 'embedding'
  | 'velocity'

export type SkillLevel = 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert'

export type EntityType =
  | 'ai_tool'
  | 'ai_concept'
  | 'business_process'
  | 'challenge'
  | 'opportunity'
  | 'competitor'
  | 'technology'

// =====================================================================================
// ASSESSMENT SUMMARY TYPES
// =====================================================================================

export interface AssessmentSummary {
  organizationId: string
  organizationName: string
  industry: string | null
  assessmentDate: string

  executiveSummary: string

  maturityLevel: MaturityLevel
  maturityScore: number
  maturityPercentile: number | null

  keyMetrics: {
    overallScore: number
    dimensionCount: number
    strengthsCount: number
    gapsCount: number
    recommendationsCount: number
    participantsCount: number
  }

  topStrengths: string[]
  criticalGaps: string[]

  industryComparison?: {
    industryName: string
    industryAverage: number
    organizationRank: number
    totalInIndustry: number
  }
}

// =====================================================================================
// MATURITY SCORE TYPES
// =====================================================================================

export interface DimensionScore {
  dimension: DimensionCategory
  dimensionName: string
  score: number
  maxScore: number
  percentage: number
  weight: number
  weightedScore: number

  evidence: DimensionEvidence[]
  subdimensions: SubdimensionScore[]
}

export interface SubdimensionScore {
  name: string
  score: number
  maxScore: number
  percentage: number
}

export interface DimensionEvidence {
  id: string
  source: 'transcript' | 'survey' | 'assessment' | 'observation'
  quote: string
  sentiment: SentimentType
  confidence: number
  timestamp?: string
}

export interface MaturityScoresResponse {
  organizationId: string
  overallScore: number
  overallPercentage: number
  maturityLevel: MaturityLevel

  dimensions: DimensionScore[]

  scoringMetadata: {
    algorithm: string
    version: string
    calculatedAt: string
    dataPoints: number
  }
}

// =====================================================================================
// CONSENSUS THEME TYPES
// =====================================================================================

export interface ConsensusTheme {
  id: string
  theme: string
  description: string

  frequency: number
  frequencyPercentage: number

  sentiment: SentimentType
  sentimentScore: number

  dimension: DimensionCategory | null

  quotes: ThemeQuote[]

  significance: 'high' | 'medium' | 'low'
  trend?: 'increasing' | 'stable' | 'decreasing'
}

export interface ThemeQuote {
  id: string
  text: string
  speaker: string
  role?: string
  sentiment: SentimentType
  timestamp?: string
}

export interface ConsensusThemesResponse {
  organizationId: string
  totalThemes: number
  totalQuotes: number

  themes: ConsensusTheme[]

  summary: {
    dominantSentiment: SentimentType
    topThemes: string[]
    mostDiscussedDimension: DimensionCategory
    consensusStrength: 'strong' | 'moderate' | 'weak'
  }
}

// =====================================================================================
// REALITY GAP TYPES
// =====================================================================================

export interface RealityGap {
  id: string
  dimension: DimensionCategory
  dimensionName: string

  aspect: string
  description: string

  perceptionScore: number
  evidenceScore: number
  gapSize: number
  gapDirection: 'overestimation' | 'underestimation' | 'aligned'

  perceptionSources: GapSource[]
  evidenceSources: GapSource[]

  severity: 'critical' | 'significant' | 'moderate' | 'minor'
  impact: string
  recommendation: string
}

export interface GapSource {
  type: 'survey_response' | 'transcript_quote' | 'behavioral_data' | 'external_benchmark'
  content: string
  confidence: number
}

export interface RealityGapsResponse {
  organizationId: string

  overallAlignment: number
  gapCount: number

  gaps: RealityGap[]

  summary: {
    mostMisalignedDimension: DimensionCategory
    averageGapSize: number
    overestimationCount: number
    underestimationCount: number
    alignedCount: number
  }
}

// =====================================================================================
// RECOMMENDATION TYPES
// =====================================================================================

export interface Recommendation {
  id: string
  title: string
  description: string

  priority: RecommendationPriority
  timeframe: RecommendationTimeframe
  category: RecommendationCategory

  targetDimensions: DimensionCategory[]

  expectedImpact: {
    scoreImprovement: number
    confidence: number
    description: string
  }

  implementation: {
    effort: 'low' | 'medium' | 'high'
    resources: string[]
    prerequisites: string[]
    successMetrics: string[]
  }

  relatedGaps: string[]

  status?: 'pending' | 'in_progress' | 'completed' | 'deferred'
}

export interface RecommendationsResponse {
  organizationId: string
  totalRecommendations: number

  immediate: Recommendation[]
  shortTerm: Recommendation[]
  longTerm: Recommendation[]

  priorityBreakdown: {
    critical: number
    high: number
    medium: number
    low: number
  }

  categoryBreakdown: Record<RecommendationCategory, number>

  estimatedImpact: {
    potentialScoreIncrease: number
    timeToAchieve: string
  }
}

// =====================================================================================
// TEAM SKILLS TYPES
// =====================================================================================

export interface TeamMemberSkill {
  id: string
  userId: string
  name: string
  email: string
  role: string
  department: string | null

  overallSkillLevel: SkillLevel
  overallScore: number

  skills: {
    category: string
    skill: string
    level: SkillLevel
    score: number
    assessedAt: string
  }[]

  strengths: string[]
  developmentAreas: string[]

  learningPath?: {
    currentCourse: string | null
    completedCourses: number
    recommendedNextSteps: string[]
  }
}

export interface TeamSkillsSummary {
  totalMembers: number

  skillDistribution: Record<SkillLevel, number>

  averageScore: number

  topSkills: {
    skill: string
    averageLevel: SkillLevel
    teamCoverage: number
  }[]

  skillGaps: {
    skill: string
    currentLevel: SkillLevel
    targetLevel: SkillLevel
    gap: number
    membersAffected: number
  }[]
}

export interface TeamSkillsResponse {
  organizationId: string

  summary: TeamSkillsSummary
  members: TeamMemberSkill[]

  departmentBreakdown?: Record<string, TeamSkillsSummary>
}

// =====================================================================================
// ANALYSIS ENTITIES TYPES
// =====================================================================================

export interface AnalysisEntity {
  id: string
  name: string
  type: EntityType

  frequency: number
  frequencyPercentage: number

  sentiment: SentimentType
  sentimentScore: number

  mentions: EntityMention[]

  relatedEntities: {
    entityId: string
    entityName: string
    relationshipType: string
    strength: number
  }[]

  firstMentioned: string
  lastMentioned: string
}

export interface EntityMention {
  id: string
  context: string
  speaker: string
  sentiment: SentimentType
  timestamp?: string
}

export interface AnalysisEntitiesResponse {
  organizationId: string
  totalEntities: number

  entities: AnalysisEntity[]

  byType: Record<EntityType, AnalysisEntity[]>

  summary: {
    mostMentionedEntity: string
    mostPositiveEntity: string
    mostNegativeEntity: string
    entityDiversity: number
  }
}

// =====================================================================================
// API FILTER TYPES
// =====================================================================================

export interface MaturityScoresFilter {
  category?: DimensionCategory
  includeEvidence?: boolean
  includeSubdimensions?: boolean
}

export interface ConsensusThemesFilter {
  sentiment?: SentimentType
  dimension?: DimensionCategory
  significance?: 'high' | 'medium' | 'low'
  limit?: number
}

export interface RealityGapsFilter {
  dimension?: DimensionCategory
  severity?: 'critical' | 'significant' | 'moderate' | 'minor'
  direction?: 'overestimation' | 'underestimation'
}

export interface RecommendationsFilter {
  timeframe?: RecommendationTimeframe
  priority?: RecommendationPriority
  category?: RecommendationCategory
  dimension?: DimensionCategory
  limit?: number
}

export interface TeamSkillsFilter {
  department?: string
  skillLevel?: SkillLevel
  limit?: number
}

export interface AnalysisEntitiesFilter {
  type?: EntityType
  sentiment?: SentimentType
  minFrequency?: number
  limit?: number
}

// =====================================================================================
// ORGANIZATION ACCESS TYPES
// =====================================================================================

export interface OrganizationAccess {
  organizationId: string
  userId: string
  hasAccess: boolean
  accessLevel: 'admin' | 'member' | 'viewer'
  organizationName?: string
}
