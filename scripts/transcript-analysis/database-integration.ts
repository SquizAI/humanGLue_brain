/**
 * Transcript Analysis Database Integration
 *
 * Handles storing analysis results from GlueIQ assessment transcript analysis
 * into the Supabase database using the AI Maturity Assessment platform schema.
 *
 * Usage:
 *   import { saveAssessmentResults, loadExistingAssessment } from './database-integration'
 *
 * Tables Used:
 *   - ai_maturity_assessments
 *   - maturity_dimension_scores
 *   - executive_summaries
 *   - consensus_themes
 *   - reality_gaps
 *   - assessment_risks
 *   - analysis_entities
 *   - analysis_themes
 *   - skills_profiles
 *   - skill_distributions
 *   - department_skill_breakdown
 *   - ai_recommendations
 *   - ai_champions
 */

import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ============================================================================
// CONFIGURATION
// ============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY')
}

// GlueIQ Organization ID (consistent across all scripts)
export const GLUEIQ_ORG_ID = '550e8400-e29b-41d4-a716-446655440001'

// ============================================================================
// ENUMS - Match database schema exactly
// ============================================================================

export type AISkillLevel = 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert'

export type MaturityDimension =
  | 'skills_talent'
  | 'ai_use_cases'
  | 'strategy_alignment'
  | 'process_optimization'
  | 'ai_governance'
  | 'leadership_vision'
  | 'culture_change'
  | 'integration_capability'

export type GapPriority = 'critical' | 'high' | 'medium' | 'low'

export type EffortLevel = 'low' | 'medium' | 'high'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export type RecommendationTimeframe = 'immediate' | 'short_term' | 'long_term'

export type AssessmentDataSource =
  | 'c_suite_interview'
  | 'team_survey'
  | 'automated_analysis'
  | 'manual_assessment'
  | 'hybrid'

export type RiskCategory =
  | 'reputation'
  | 'competitive'
  | 'governance'
  | 'talent'
  | 'adoption'
  | 'client'
  | 'tool'
  | 'cost'
  | 'security'
  | 'other'

export type EntityType = 'tool' | 'platform' | 'person' | 'company' | 'concept' | 'process'

export type SentimentValue = 'positive' | 'negative' | 'neutral' | 'mixed'

// ============================================================================
// DATABASE INTERFACES - Match Supabase schema
// ============================================================================

export interface DBAssessment {
  id?: string
  organization_id: string
  assessment_name: string
  version: number
  overall_maturity: number
  confidence_level: number
  technical_score?: number
  human_score?: number
  business_score?: number
  ai_adoption_score?: number
  maturity_profile?: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
  }
  industry_average?: number
  percentile?: number
  benchmark_rank?: string
  top_performer_score?: number
  gap_to_top?: number
  data_source: AssessmentDataSource
  data_source_description?: string
  transcript_count?: number
  total_interview_duration_minutes?: number
  analysis_method?: string
  data_quality?: 'low' | 'medium' | 'high' | 'very_high'
  assessment_date: string
  valid_until?: string
  metadata?: Record<string, unknown>
  created_at?: string
  updated_at?: string
  created_by?: string
}

export interface DBDimensionScore {
  id?: string
  assessment_id: string
  organization_id: string
  dimension: MaturityDimension
  score: number
  confidence: number
  level_matches?: number
  evidence: DimensionEvidence[]
  created_at?: string
  updated_at?: string
}

export interface DimensionEvidence {
  quote: string
  source: string
  speaker?: string
  sentiment?: SentimentValue
  confidence?: number
  timestamp?: string
}

export interface DBExecutiveSummary {
  id?: string
  assessment_id: string
  organization_id: string
  executive_summary: string
  key_metrics: KeyMetric[]
  next_steps_30_days?: NextStep[]
  next_steps_60_days?: NextStep[]
  next_steps_90_days?: NextStep[]
  generated_by?: string
  reviewed_by?: string
  reviewed_at?: string
  created_at?: string
  updated_at?: string
}

export interface KeyMetric {
  label: string
  value: string | number
  trend?: 'up' | 'down' | 'stable'
  benchmark?: string | number
}

export interface NextStep {
  action: string
  owner?: string
  priority?: GapPriority
}

export interface DBConsensusTheme {
  id?: string
  executive_summary_id: string
  organization_id: string
  theme_name: string
  description?: string
  frequency: number
  sentiment?: number
  interviewees?: string[]
  quotes?: ThemeQuote[]
  created_at?: string
  updated_at?: string
}

export interface ThemeQuote {
  text: string
  speaker: string
  role?: string
  sentiment?: SentimentValue
}

export interface DBRealityGap {
  id?: string
  executive_summary_id: string
  organization_id: string
  dimension: string
  leadership_perception?: number
  actual_evidence?: number
  // gap_size is GENERATED column - don't include in insert
  supporting_evidence?: GapEvidence[]
  contradicting_evidence?: GapEvidence[]
  created_at?: string
  updated_at?: string
}

export interface GapEvidence {
  quote: string
  source: string
  speaker?: string
}

export interface DBAssessmentRisk {
  id?: string
  executive_summary_id: string
  organization_id: string
  risk_level: RiskLevel
  risk_category: RiskCategory
  description: string
  mitigation_strategy?: string
  owner?: string
  status?: 'identified' | 'mitigating' | 'mitigated' | 'accepted'
  created_at?: string
  updated_at?: string
}

export interface DBAnalysisEntity {
  id?: string
  assessment_id: string
  organization_id: string
  entity_type: EntityType
  entity_value: string
  context?: string
  frequency: number
  sentiment?: SentimentValue
  source_quotes?: string[]
  first_mentioned_by?: string
  categories?: string[]
  created_at?: string
  updated_at?: string
}

export interface DBAnalysisTheme {
  id?: string
  assessment_id: string
  organization_id: string
  theme_id: string
  theme_name: string
  description?: string
  keywords: string[]
  frequency: number
  sentiment?: number
  source_interviews?: string[]
  representative_quotes?: string[]
  related_dimensions?: MaturityDimension[]
  created_at?: string
  updated_at?: string
}

export interface DBSkillsProfile {
  id?: string
  organization_id: string
  assessment_id?: string
  user_id?: string
  person_name: string
  title?: string
  department?: string
  ai_skill_level: AISkillLevel
  ai_skill_score?: number
  tools_used?: string[]
  usage_frequency?: 'never' | 'occasionally' | 'weekly' | 'daily' | 'multiple_daily'
  mentioned_by?: string[]
  evidence?: ProfileEvidence[]
  is_champion: boolean
  champion_reason?: string
  growth_potential?: 'low' | 'medium' | 'high'
  recommended_training?: string[]
  created_at?: string
  updated_at?: string
}

export interface ProfileEvidence {
  quote: string
  source: string
  speaker?: string
}

export interface DBSkillDistribution {
  id?: string
  assessment_id: string
  organization_id: string
  expert_count: number
  advanced_count: number
  intermediate_count: number
  beginner_count: number
  none_count: number
  // total_assessed is GENERATED column
  created_at?: string
  updated_at?: string
}

export interface DBDepartmentBreakdown {
  id?: string
  assessment_id: string
  organization_id: string
  department_name: string
  fluency_rate?: number
  top_users?: string[]
  adoption_status?: 'Leading' | 'Emerging' | 'Lagging' | 'Not Started'
  team_size?: number
  ai_capable_count?: number
  created_at?: string
  updated_at?: string
}

export interface DBRecommendation {
  id?: string
  assessment_id: string
  organization_id: string
  timeframe: RecommendationTimeframe
  sort_order: number
  title: string
  description: string
  rationale?: string
  related_dimension?: MaturityDimension
  expected_impact?: 'low' | 'medium' | 'high' | 'transformational'
  effort_required?: EffortLevel
  estimated_cost_range?: string
  status?: 'pending' | 'in_progress' | 'completed' | 'deferred' | 'rejected'
  owner?: string
  due_date?: string
  completed_date?: string
  completion_notes?: string
  created_at?: string
  updated_at?: string
}

export interface DBMaturityGapPriority {
  id?: string
  assessment_id: string
  organization_id: string
  dimension: MaturityDimension
  current_score: number
  target_score: number
  // gap_size is GENERATED column
  priority: GapPriority
  effort: EffortLevel
  recommendation: string
  status?: 'identified' | 'in_progress' | 'completed' | 'deferred'
  due_date?: string
  assigned_to?: string
  created_at?: string
  updated_at?: string
}

export interface DBAIChampion {
  id?: string
  assessment_id: string
  organization_id: string
  skills_profile_id?: string
  person_name: string
  title?: string
  ai_skill_level: AISkillLevel
  champion_reason: string
  influence_areas?: string[]
  mentee_capacity?: number
  is_activated?: boolean
  activated_at?: string
  created_at?: string
  updated_at?: string
}

// ============================================================================
// INPUT INTERFACES - For function parameters
// ============================================================================

export interface AssessmentInput {
  organizationId: string
  assessmentName?: string
  version?: number
  overallMaturity: number
  confidenceLevel: number
  categoryScores?: {
    technical?: number
    human?: number
    business?: number
    aiAdoption?: number
  }
  maturityProfile?: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
  }
  benchmark?: {
    industryAverage?: number
    percentile?: number
    rank?: string
    topPerformerScore?: number
    gapToTop?: number
  }
  dataSource: AssessmentDataSource
  transcriptCount?: number
  totalInterviewDuration?: number
  analysisMethod?: string
  dataQuality?: 'low' | 'medium' | 'high' | 'very_high'
  assessmentDate?: string
  metadata?: Record<string, unknown>
}

export interface DimensionScoreInput {
  dimension: MaturityDimension
  score: number
  confidence: number
  levelMatches?: number
  evidence: DimensionEvidence[]
}

export interface ThemeInput {
  themeId: string
  themeName: string
  description?: string
  keywords: string[]
  frequency: number
  sentiment?: number
  sourceInterviews?: string[]
  representativeQuotes?: string[]
  relatedDimensions?: MaturityDimension[]
}

export interface RealityGapInput {
  dimension: string
  leadershipPerception?: number
  actualEvidence?: number
  supportingEvidence?: GapEvidence[]
  contradictingEvidence?: GapEvidence[]
}

export interface SkillProfileInput {
  personName: string
  title?: string
  department?: string
  aiSkillLevel: AISkillLevel
  aiSkillScore?: number
  toolsUsed?: string[]
  usageFrequency?: 'never' | 'occasionally' | 'weekly' | 'daily' | 'multiple_daily'
  mentionedBy?: string[]
  evidence?: ProfileEvidence[]
  isChampion: boolean
  championReason?: string
  growthPotential?: 'low' | 'medium' | 'high'
  recommendedTraining?: string[]
}

export interface RecommendationInput {
  timeframe: RecommendationTimeframe
  sortOrder: number
  title: string
  description: string
  rationale?: string
  relatedDimension?: MaturityDimension
  expectedImpact?: 'low' | 'medium' | 'high' | 'transformational'
  effortRequired?: EffortLevel
  estimatedCostRange?: string
}

export interface ExecutiveSummaryInput {
  executiveSummary: string
  keyMetrics: KeyMetric[]
  nextSteps30Days?: NextStep[]
  nextSteps60Days?: NextStep[]
  nextSteps90Days?: NextStep[]
  generatedBy?: string
}

export interface ConsensusThemeInput {
  themeName: string
  description?: string
  frequency: number
  sentiment?: number
  interviewees?: string[]
  quotes?: ThemeQuote[]
}

export interface RiskInput {
  riskLevel: RiskLevel
  riskCategory: RiskCategory
  description: string
  mitigationStrategy?: string
}

export interface AnalysisEntityInput {
  entityType: EntityType
  entityValue: string
  context?: string
  frequency: number
  sentiment?: SentimentValue
  sourceQuotes?: string[]
  firstMentionedBy?: string
  categories?: string[]
}

// ============================================================================
// RESULT INTERFACES
// ============================================================================

export interface SaveResult {
  success: boolean
  id?: string
  error?: string
}

export interface SaveAllResult {
  success: boolean
  assessmentId?: string
  executiveSummaryId?: string
  dimensionScoresCount?: number
  themesCount?: number
  gapsCount?: number
  profilesCount?: number
  recommendationsCount?: number
  errors: string[]
}

export interface ExistingAssessment {
  assessment: DBAssessment | null
  executiveSummary: DBExecutiveSummary | null
  dimensionScores: DBDimensionScore[]
  themes: DBAnalysisTheme[]
  consensusThemes: DBConsensusTheme[]
  realityGaps: DBRealityGap[]
  risks: DBAssessmentRisk[]
  entities: DBAnalysisEntity[]
  skillProfiles: DBSkillsProfile[]
  recommendations: DBRecommendation[]
  champions: DBAIChampion[]
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate a UUID v4
 */
function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Create the Supabase admin client
 */
function getSupabaseClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Logger utility
 */
const log = {
  info: (msg: string) => console.log(`[DB-INTEGRATION] ${msg}`),
  success: (msg: string) => console.log(`[DB-INTEGRATION] SUCCESS: ${msg}`),
  error: (msg: string, err?: unknown) => console.error(`[DB-INTEGRATION] ERROR: ${msg}`, err || ''),
  warn: (msg: string) => console.warn(`[DB-INTEGRATION] WARN: ${msg}`),
}

// ============================================================================
// INDIVIDUAL SAVE FUNCTIONS
// ============================================================================

/**
 * Save or update an assessment record
 */
export async function saveAssessment(
  supabase: SupabaseClient,
  input: AssessmentInput,
  existingId?: string
): Promise<SaveResult> {
  const id = existingId || uuid()

  const record: DBAssessment = {
    id,
    organization_id: input.organizationId,
    assessment_name: input.assessmentName || 'AI Maturity Assessment',
    version: input.version || 1,
    overall_maturity: input.overallMaturity,
    confidence_level: input.confidenceLevel,
    technical_score: input.categoryScores?.technical,
    human_score: input.categoryScores?.human,
    business_score: input.categoryScores?.business,
    ai_adoption_score: input.categoryScores?.aiAdoption,
    maturity_profile: input.maturityProfile,
    industry_average: input.benchmark?.industryAverage,
    percentile: input.benchmark?.percentile,
    benchmark_rank: input.benchmark?.rank,
    top_performer_score: input.benchmark?.topPerformerScore,
    gap_to_top: input.benchmark?.gapToTop,
    data_source: input.dataSource,
    transcript_count: input.transcriptCount,
    total_interview_duration_minutes: input.totalInterviewDuration,
    analysis_method: input.analysisMethod,
    data_quality: input.dataQuality,
    assessment_date: input.assessmentDate || new Date().toISOString().split('T')[0],
    metadata: input.metadata,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('ai_maturity_assessments')
    .upsert(record, { onConflict: 'id' })

  if (error) {
    log.error('Failed to save assessment', error)
    return { success: false, error: error.message }
  }

  return { success: true, id }
}

/**
 * Save dimension scores for an assessment
 */
export async function saveDimensionScores(
  assessmentId: string,
  scores: DimensionScoreInput[],
  organizationId: string = GLUEIQ_ORG_ID
): Promise<SaveResult> {
  const supabase = getSupabaseClient()

  // Delete existing dimension scores for this assessment
  const { error: deleteError } = await supabase
    .from('maturity_dimension_scores')
    .delete()
    .eq('assessment_id', assessmentId)

  if (deleteError) {
    log.warn(`Failed to delete existing dimension scores: ${deleteError.message}`)
  }

  const records: DBDimensionScore[] = scores.map((score) => ({
    id: uuid(),
    assessment_id: assessmentId,
    organization_id: organizationId,
    dimension: score.dimension,
    score: score.score,
    confidence: score.confidence,
    level_matches: score.levelMatches,
    evidence: score.evidence,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase.from('maturity_dimension_scores').insert(records)

  if (error) {
    log.error('Failed to save dimension scores', error)
    return { success: false, error: error.message }
  }

  log.success(`Saved ${records.length} dimension scores`)
  return { success: true }
}

/**
 * Save analysis themes for an assessment
 */
export async function saveThemes(
  assessmentId: string,
  themes: ThemeInput[],
  organizationId: string = GLUEIQ_ORG_ID
): Promise<SaveResult> {
  const supabase = getSupabaseClient()

  // Delete existing themes for this assessment
  const { error: deleteError } = await supabase
    .from('analysis_themes')
    .delete()
    .eq('assessment_id', assessmentId)

  if (deleteError) {
    log.warn(`Failed to delete existing themes: ${deleteError.message}`)
  }

  const records: DBAnalysisTheme[] = themes.map((theme) => ({
    id: uuid(),
    assessment_id: assessmentId,
    organization_id: organizationId,
    theme_id: theme.themeId,
    theme_name: theme.themeName,
    description: theme.description,
    keywords: theme.keywords,
    frequency: theme.frequency,
    sentiment: theme.sentiment,
    source_interviews: theme.sourceInterviews,
    representative_quotes: theme.representativeQuotes,
    related_dimensions: theme.relatedDimensions,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase.from('analysis_themes').insert(records)

  if (error) {
    log.error('Failed to save themes', error)
    return { success: false, error: error.message }
  }

  log.success(`Saved ${records.length} analysis themes`)
  return { success: true }
}

/**
 * Save reality gaps (requires executive_summary_id)
 */
export async function saveRealityGaps(
  executiveSummaryId: string,
  gaps: RealityGapInput[],
  organizationId: string = GLUEIQ_ORG_ID
): Promise<SaveResult> {
  const supabase = getSupabaseClient()

  // Delete existing gaps
  const { error: deleteError } = await supabase
    .from('reality_gaps')
    .delete()
    .eq('executive_summary_id', executiveSummaryId)

  if (deleteError) {
    log.warn(`Failed to delete existing reality gaps: ${deleteError.message}`)
  }

  // Note: gap_size is a GENERATED column, don't include it
  const records: DBRealityGap[] = gaps.map((gap) => ({
    id: uuid(),
    executive_summary_id: executiveSummaryId,
    organization_id: organizationId,
    dimension: gap.dimension,
    leadership_perception: gap.leadershipPerception,
    actual_evidence: gap.actualEvidence,
    supporting_evidence: gap.supportingEvidence,
    contradicting_evidence: gap.contradictingEvidence,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase.from('reality_gaps').insert(records)

  if (error) {
    log.error('Failed to save reality gaps', error)
    return { success: false, error: error.message }
  }

  log.success(`Saved ${records.length} reality gaps`)
  return { success: true }
}

/**
 * Save skill profiles for an organization
 */
export async function saveSkillProfiles(
  organizationId: string,
  profiles: SkillProfileInput[],
  assessmentId?: string
): Promise<SaveResult> {
  const supabase = getSupabaseClient()

  // Delete existing profiles for this organization/assessment
  if (assessmentId) {
    await supabase
      .from('skills_profiles')
      .delete()
      .eq('organization_id', organizationId)
      .eq('assessment_id', assessmentId)
  }

  const records: DBSkillsProfile[] = profiles.map((profile) => ({
    id: uuid(),
    organization_id: organizationId,
    assessment_id: assessmentId,
    person_name: profile.personName,
    title: profile.title,
    department: profile.department,
    ai_skill_level: profile.aiSkillLevel,
    ai_skill_score: profile.aiSkillScore,
    tools_used: profile.toolsUsed,
    usage_frequency: profile.usageFrequency,
    mentioned_by: profile.mentionedBy,
    evidence: profile.evidence,
    is_champion: profile.isChampion,
    champion_reason: profile.championReason,
    growth_potential: profile.growthPotential,
    recommended_training: profile.recommendedTraining,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase.from('skills_profiles').insert(records)

  if (error) {
    log.error('Failed to save skill profiles', error)
    return { success: false, error: error.message }
  }

  log.success(`Saved ${records.length} skill profiles`)
  return { success: true }
}

/**
 * Save recommendations for an assessment
 */
export async function saveRecommendations(
  assessmentId: string,
  recommendations: RecommendationInput[],
  organizationId: string = GLUEIQ_ORG_ID
): Promise<SaveResult> {
  const supabase = getSupabaseClient()

  // Delete existing recommendations
  const { error: deleteError } = await supabase
    .from('ai_recommendations')
    .delete()
    .eq('assessment_id', assessmentId)

  if (deleteError) {
    log.warn(`Failed to delete existing recommendations: ${deleteError.message}`)
  }

  const records: DBRecommendation[] = recommendations.map((rec) => ({
    id: uuid(),
    assessment_id: assessmentId,
    organization_id: organizationId,
    timeframe: rec.timeframe,
    sort_order: rec.sortOrder,
    title: rec.title,
    description: rec.description,
    rationale: rec.rationale,
    related_dimension: rec.relatedDimension,
    expected_impact: rec.expectedImpact,
    effort_required: rec.effortRequired,
    estimated_cost_range: rec.estimatedCostRange,
    status: 'pending',
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase.from('ai_recommendations').insert(records)

  if (error) {
    log.error('Failed to save recommendations', error)
    return { success: false, error: error.message }
  }

  log.success(`Saved ${records.length} recommendations`)
  return { success: true }
}

/**
 * Save executive summary
 */
export async function saveExecutiveSummary(
  assessmentId: string,
  input: ExecutiveSummaryInput,
  organizationId: string = GLUEIQ_ORG_ID,
  existingId?: string
): Promise<SaveResult> {
  const supabase = getSupabaseClient()
  const id = existingId || uuid()

  const record: DBExecutiveSummary = {
    id,
    assessment_id: assessmentId,
    organization_id: organizationId,
    executive_summary: input.executiveSummary,
    key_metrics: input.keyMetrics,
    next_steps_30_days: input.nextSteps30Days,
    next_steps_60_days: input.nextSteps60Days,
    next_steps_90_days: input.nextSteps90Days,
    generated_by: input.generatedBy,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from('executive_summaries').upsert(record, { onConflict: 'id' })

  if (error) {
    log.error('Failed to save executive summary', error)
    return { success: false, error: error.message }
  }

  log.success('Saved executive summary')
  return { success: true, id }
}

/**
 * Save consensus themes (requires executive_summary_id)
 */
export async function saveConsensusThemes(
  executiveSummaryId: string,
  themes: ConsensusThemeInput[],
  organizationId: string = GLUEIQ_ORG_ID
): Promise<SaveResult> {
  const supabase = getSupabaseClient()

  // Delete existing consensus themes
  const { error: deleteError } = await supabase
    .from('consensus_themes')
    .delete()
    .eq('executive_summary_id', executiveSummaryId)

  if (deleteError) {
    log.warn(`Failed to delete existing consensus themes: ${deleteError.message}`)
  }

  const records: DBConsensusTheme[] = themes.map((theme) => ({
    id: uuid(),
    executive_summary_id: executiveSummaryId,
    organization_id: organizationId,
    theme_name: theme.themeName,
    description: theme.description,
    frequency: theme.frequency,
    sentiment: theme.sentiment,
    interviewees: theme.interviewees,
    quotes: theme.quotes,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase.from('consensus_themes').insert(records)

  if (error) {
    log.error('Failed to save consensus themes', error)
    return { success: false, error: error.message }
  }

  log.success(`Saved ${records.length} consensus themes`)
  return { success: true }
}

/**
 * Save assessment risks (requires executive_summary_id)
 */
export async function saveAssessmentRisks(
  executiveSummaryId: string,
  risks: RiskInput[],
  organizationId: string = GLUEIQ_ORG_ID
): Promise<SaveResult> {
  const supabase = getSupabaseClient()

  // Delete existing risks
  const { error: deleteError } = await supabase
    .from('assessment_risks')
    .delete()
    .eq('executive_summary_id', executiveSummaryId)

  if (deleteError) {
    log.warn(`Failed to delete existing assessment risks: ${deleteError.message}`)
  }

  const records: DBAssessmentRisk[] = risks.map((risk) => ({
    id: uuid(),
    executive_summary_id: executiveSummaryId,
    organization_id: organizationId,
    risk_level: risk.riskLevel,
    risk_category: risk.riskCategory,
    description: risk.description,
    mitigation_strategy: risk.mitigationStrategy,
    status: 'identified',
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase.from('assessment_risks').insert(records)

  if (error) {
    log.error('Failed to save assessment risks', error)
    return { success: false, error: error.message }
  }

  log.success(`Saved ${records.length} assessment risks`)
  return { success: true }
}

/**
 * Save analysis entities (tools, concepts, etc.)
 */
export async function saveAnalysisEntities(
  assessmentId: string,
  entities: AnalysisEntityInput[],
  organizationId: string = GLUEIQ_ORG_ID
): Promise<SaveResult> {
  const supabase = getSupabaseClient()

  // Delete existing entities
  const { error: deleteError } = await supabase
    .from('analysis_entities')
    .delete()
    .eq('assessment_id', assessmentId)

  if (deleteError) {
    log.warn(`Failed to delete existing analysis entities: ${deleteError.message}`)
  }

  // Deduplicate entities by type and value
  const entityMap = new Map<string, DBAnalysisEntity>()
  entities.forEach((entity) => {
    const key = `${entity.entityType}:${entity.entityValue}`
    if (entityMap.has(key)) {
      const existing = entityMap.get(key)!
      existing.frequency += entity.frequency
      if (entity.sourceQuotes) {
        const combined = [...(existing.source_quotes || []), ...entity.sourceQuotes]
        existing.source_quotes = Array.from(new Set(combined)).slice(0, 10)
      }
    } else {
      entityMap.set(key, {
        id: uuid(),
        assessment_id: assessmentId,
        organization_id: organizationId,
        entity_type: entity.entityType,
        entity_value: entity.entityValue,
        context: entity.context,
        frequency: entity.frequency,
        sentiment: entity.sentiment,
        source_quotes: entity.sourceQuotes?.slice(0, 10),
        first_mentioned_by: entity.firstMentionedBy,
        categories: entity.categories,
        updated_at: new Date().toISOString(),
      })
    }
  })

  const records = Array.from(entityMap.values())

  // Insert in batches to avoid timeout
  const batchSize = 50
  let totalInserted = 0

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)
    const { error } = await supabase.from('analysis_entities').insert(batch)

    if (error) {
      log.error(`Failed to save entity batch ${Math.floor(i / batchSize) + 1}`, error)
    } else {
      totalInserted += batch.length
    }
  }

  log.success(`Saved ${totalInserted} analysis entities`)
  return { success: true }
}

/**
 * Save AI champions
 */
export async function saveAIChampions(
  assessmentId: string,
  profiles: DBSkillsProfile[],
  organizationId: string = GLUEIQ_ORG_ID
): Promise<SaveResult> {
  const supabase = getSupabaseClient()

  // Delete existing champions
  const { error: deleteError } = await supabase
    .from('ai_champions')
    .delete()
    .eq('assessment_id', assessmentId)

  if (deleteError) {
    log.warn(`Failed to delete existing AI champions: ${deleteError.message}`)
  }

  const champions = profiles.filter((p) => p.is_champion)

  if (champions.length === 0) {
    log.info('No AI champions to save')
    return { success: true }
  }

  const records: DBAIChampion[] = champions.map((champion) => ({
    id: uuid(),
    assessment_id: assessmentId,
    organization_id: organizationId,
    skills_profile_id: champion.id,
    person_name: champion.person_name,
    title: champion.title,
    ai_skill_level: champion.ai_skill_level,
    champion_reason:
      champion.champion_reason ||
      `Identified as AI champion based on ${champion.ai_skill_level} skill level`,
    influence_areas: champion.department ? [champion.department] : [],
    is_activated: false,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase.from('ai_champions').insert(records)

  if (error) {
    log.error('Failed to save AI champions', error)
    return { success: false, error: error.message }
  }

  log.success(`Saved ${records.length} AI champions`)
  return { success: true }
}

/**
 * Save skill distribution aggregate
 */
export async function saveSkillDistribution(
  assessmentId: string,
  profiles: DBSkillsProfile[],
  organizationId: string = GLUEIQ_ORG_ID
): Promise<SaveResult> {
  const supabase = getSupabaseClient()

  // Calculate distribution
  const distribution = {
    expert: 0,
    advanced: 0,
    intermediate: 0,
    beginner: 0,
    none: 0,
  }

  profiles.forEach((profile) => {
    const level = profile.ai_skill_level
    if (level in distribution) {
      distribution[level as keyof typeof distribution]++
    }
  })

  const record: DBSkillDistribution = {
    id: uuid(),
    assessment_id: assessmentId,
    organization_id: organizationId,
    expert_count: distribution.expert,
    advanced_count: distribution.advanced,
    intermediate_count: distribution.intermediate,
    beginner_count: distribution.beginner,
    none_count: distribution.none,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('skill_distributions')
    .upsert(record, { onConflict: 'assessment_id' })

  if (error) {
    log.error('Failed to save skill distribution', error)
    return { success: false, error: error.message }
  }

  log.success('Saved skill distribution')
  return { success: true }
}

// ============================================================================
// MAIN SAVE FUNCTION - Transaction-like behavior
// ============================================================================

export interface FullAssessmentInput {
  assessment: AssessmentInput
  executiveSummary?: ExecutiveSummaryInput
  dimensionScores?: DimensionScoreInput[]
  analysisThemes?: ThemeInput[]
  consensusThemes?: ConsensusThemeInput[]
  realityGaps?: RealityGapInput[]
  risks?: RiskInput[]
  entities?: AnalysisEntityInput[]
  skillProfiles?: SkillProfileInput[]
  recommendations?: RecommendationInput[]
}

/**
 * Save all assessment results with transaction-like behavior
 * This creates/updates an assessment and all related data
 */
export async function saveAssessmentResults(
  input: FullAssessmentInput,
  existingAssessmentId?: string,
  existingExecutiveSummaryId?: string
): Promise<SaveAllResult> {
  const supabase = getSupabaseClient()
  const errors: string[] = []
  const organizationId = input.assessment.organizationId

  log.info('Starting assessment save operation...')

  // 1. Save the main assessment record
  const assessmentResult = await saveAssessment(supabase, input.assessment, existingAssessmentId)
  if (!assessmentResult.success) {
    return { success: false, errors: [`Assessment save failed: ${assessmentResult.error}`] }
  }
  const assessmentId = assessmentResult.id!
  log.success(`Assessment saved with ID: ${assessmentId}`)

  let executiveSummaryId = existingExecutiveSummaryId

  // 2. Save executive summary if provided
  if (input.executiveSummary) {
    const summaryResult = await saveExecutiveSummary(
      assessmentId,
      input.executiveSummary,
      organizationId,
      existingExecutiveSummaryId
    )
    if (!summaryResult.success) {
      errors.push(`Executive summary save failed: ${summaryResult.error}`)
    } else {
      executiveSummaryId = summaryResult.id
    }
  }

  // 3. Save dimension scores if provided
  let dimensionScoresCount = 0
  if (input.dimensionScores && input.dimensionScores.length > 0) {
    const scoresResult = await saveDimensionScores(
      assessmentId,
      input.dimensionScores,
      organizationId
    )
    if (!scoresResult.success) {
      errors.push(`Dimension scores save failed: ${scoresResult.error}`)
    } else {
      dimensionScoresCount = input.dimensionScores.length
    }
  }

  // 4. Save analysis themes if provided
  let themesCount = 0
  if (input.analysisThemes && input.analysisThemes.length > 0) {
    const themesResult = await saveThemes(assessmentId, input.analysisThemes, organizationId)
    if (!themesResult.success) {
      errors.push(`Analysis themes save failed: ${themesResult.error}`)
    } else {
      themesCount = input.analysisThemes.length
    }
  }

  // 5. Save consensus themes if executive summary exists
  if (executiveSummaryId && input.consensusThemes && input.consensusThemes.length > 0) {
    const consensusResult = await saveConsensusThemes(
      executiveSummaryId,
      input.consensusThemes,
      organizationId
    )
    if (!consensusResult.success) {
      errors.push(`Consensus themes save failed: ${consensusResult.error}`)
    }
  }

  // 6. Save reality gaps if executive summary exists
  let gapsCount = 0
  if (executiveSummaryId && input.realityGaps && input.realityGaps.length > 0) {
    const gapsResult = await saveRealityGaps(executiveSummaryId, input.realityGaps, organizationId)
    if (!gapsResult.success) {
      errors.push(`Reality gaps save failed: ${gapsResult.error}`)
    } else {
      gapsCount = input.realityGaps.length
    }
  }

  // 7. Save risks if executive summary exists
  if (executiveSummaryId && input.risks && input.risks.length > 0) {
    const risksResult = await saveAssessmentRisks(executiveSummaryId, input.risks, organizationId)
    if (!risksResult.success) {
      errors.push(`Assessment risks save failed: ${risksResult.error}`)
    }
  }

  // 8. Save analysis entities
  if (input.entities && input.entities.length > 0) {
    const entitiesResult = await saveAnalysisEntities(assessmentId, input.entities, organizationId)
    if (!entitiesResult.success) {
      errors.push(`Analysis entities save failed: ${entitiesResult.error}`)
    }
  }

  // 9. Save skill profiles
  let profilesCount = 0
  if (input.skillProfiles && input.skillProfiles.length > 0) {
    const profilesResult = await saveSkillProfiles(
      organizationId,
      input.skillProfiles,
      assessmentId
    )
    if (!profilesResult.success) {
      errors.push(`Skill profiles save failed: ${profilesResult.error}`)
    } else {
      profilesCount = input.skillProfiles.length

      // Also save skill distribution and champions
      const dbProfiles: DBSkillsProfile[] = input.skillProfiles.map((p) => ({
        id: uuid(),
        organization_id: organizationId,
        assessment_id: assessmentId,
        person_name: p.personName,
        title: p.title,
        department: p.department,
        ai_skill_level: p.aiSkillLevel,
        ai_skill_score: p.aiSkillScore,
        tools_used: p.toolsUsed,
        usage_frequency: p.usageFrequency,
        mentioned_by: p.mentionedBy,
        evidence: p.evidence,
        is_champion: p.isChampion,
        champion_reason: p.championReason,
        growth_potential: p.growthPotential,
        recommended_training: p.recommendedTraining,
      }))

      await saveSkillDistribution(assessmentId, dbProfiles, organizationId)
      await saveAIChampions(assessmentId, dbProfiles, organizationId)
    }
  }

  // 10. Save recommendations
  let recommendationsCount = 0
  if (input.recommendations && input.recommendations.length > 0) {
    const recsResult = await saveRecommendations(
      assessmentId,
      input.recommendations,
      organizationId
    )
    if (!recsResult.success) {
      errors.push(`Recommendations save failed: ${recsResult.error}`)
    } else {
      recommendationsCount = input.recommendations.length
    }
  }

  const success = errors.length === 0
  log.info(`Save operation completed. Success: ${success}, Errors: ${errors.length}`)

  return {
    success,
    assessmentId,
    executiveSummaryId,
    dimensionScoresCount,
    themesCount,
    gapsCount,
    profilesCount,
    recommendationsCount,
    errors,
  }
}

// ============================================================================
// LOAD FUNCTIONS
// ============================================================================

/**
 * Load an existing assessment with all related data
 */
export async function loadExistingAssessment(
  assessmentId: string,
  organizationId: string = GLUEIQ_ORG_ID
): Promise<ExistingAssessment> {
  const supabase = getSupabaseClient()

  log.info(`Loading existing assessment: ${assessmentId}`)

  // Load assessment
  const { data: assessment, error: assessmentError } = await supabase
    .from('ai_maturity_assessments')
    .select('*')
    .eq('id', assessmentId)
    .eq('organization_id', organizationId)
    .single()

  if (assessmentError) {
    log.warn(`Assessment not found: ${assessmentError.message}`)
  }

  // Load executive summary
  const { data: executiveSummary, error: summaryError } = await supabase
    .from('executive_summaries')
    .select('*')
    .eq('assessment_id', assessmentId)
    .single()

  if (summaryError) {
    log.warn(`Executive summary not found: ${summaryError.message}`)
  }

  // Load dimension scores
  const { data: dimensionScores, error: scoresError } = await supabase
    .from('maturity_dimension_scores')
    .select('*')
    .eq('assessment_id', assessmentId)

  if (scoresError) {
    log.warn(`Dimension scores not found: ${scoresError.message}`)
  }

  // Load analysis themes
  const { data: themes, error: themesError } = await supabase
    .from('analysis_themes')
    .select('*')
    .eq('assessment_id', assessmentId)

  if (themesError) {
    log.warn(`Analysis themes not found: ${themesError.message}`)
  }

  // Load consensus themes (via executive summary)
  let consensusThemes: DBConsensusTheme[] = []
  if (executiveSummary?.id) {
    const { data: ct, error: ctError } = await supabase
      .from('consensus_themes')
      .select('*')
      .eq('executive_summary_id', executiveSummary.id)

    if (!ctError && ct) {
      consensusThemes = ct
    }
  }

  // Load reality gaps
  let realityGaps: DBRealityGap[] = []
  if (executiveSummary?.id) {
    const { data: rg, error: rgError } = await supabase
      .from('reality_gaps')
      .select('*')
      .eq('executive_summary_id', executiveSummary.id)

    if (!rgError && rg) {
      realityGaps = rg
    }
  }

  // Load assessment risks
  let risks: DBAssessmentRisk[] = []
  if (executiveSummary?.id) {
    const { data: ar, error: arError } = await supabase
      .from('assessment_risks')
      .select('*')
      .eq('executive_summary_id', executiveSummary.id)

    if (!arError && ar) {
      risks = ar
    }
  }

  // Load analysis entities
  const { data: entities, error: entitiesError } = await supabase
    .from('analysis_entities')
    .select('*')
    .eq('assessment_id', assessmentId)

  if (entitiesError) {
    log.warn(`Analysis entities not found: ${entitiesError.message}`)
  }

  // Load skill profiles
  const { data: skillProfiles, error: profilesError } = await supabase
    .from('skills_profiles')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('assessment_id', assessmentId)

  if (profilesError) {
    log.warn(`Skill profiles not found: ${profilesError.message}`)
  }

  // Load recommendations
  const { data: recommendations, error: recsError } = await supabase
    .from('ai_recommendations')
    .select('*')
    .eq('assessment_id', assessmentId)
    .order('sort_order', { ascending: true })

  if (recsError) {
    log.warn(`Recommendations not found: ${recsError.message}`)
  }

  // Load AI champions
  const { data: champions, error: champsError } = await supabase
    .from('ai_champions')
    .select('*')
    .eq('assessment_id', assessmentId)

  if (champsError) {
    log.warn(`AI champions not found: ${champsError.message}`)
  }

  log.success('Assessment data loaded')

  return {
    assessment: assessment || null,
    executiveSummary: executiveSummary || null,
    dimensionScores: dimensionScores || [],
    themes: themes || [],
    consensusThemes,
    realityGaps,
    risks,
    entities: entities || [],
    skillProfiles: skillProfiles || [],
    recommendations: recommendations || [],
    champions: champions || [],
  }
}

/**
 * Load the latest assessment for an organization
 */
export async function loadLatestAssessment(
  organizationId: string = GLUEIQ_ORG_ID
): Promise<ExistingAssessment | null> {
  const supabase = getSupabaseClient()

  log.info(`Loading latest assessment for organization: ${organizationId}`)

  // Get the latest assessment
  const { data: latestAssessment, error } = await supabase
    .from('ai_maturity_assessments')
    .select('id')
    .eq('organization_id', organizationId)
    .order('assessment_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !latestAssessment) {
    log.warn(`No assessment found for organization: ${organizationId}`)
    return null
  }

  return loadExistingAssessment(latestAssessment.id, organizationId)
}

/**
 * Get assessment history for an organization
 */
export async function getAssessmentHistory(
  organizationId: string = GLUEIQ_ORG_ID,
  limit: number = 10
): Promise<DBAssessment[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('ai_maturity_assessments')
    .select('*')
    .eq('organization_id', organizationId)
    .order('assessment_date', { ascending: false })
    .limit(limit)

  if (error) {
    log.error('Failed to load assessment history', error)
    return []
  }

  return data || []
}

/**
 * Compare two assessments to track progress
 */
export async function compareAssessments(
  assessmentId1: string,
  assessmentId2: string,
  organizationId: string = GLUEIQ_ORG_ID
): Promise<{
  assessment1: ExistingAssessment
  assessment2: ExistingAssessment
  changes: {
    overallMaturityChange: number
    dimensionChanges: Record<string, number>
    newStrengths: string[]
    resolvedGaps: string[]
  }
}> {
  const assessment1 = await loadExistingAssessment(assessmentId1, organizationId)
  const assessment2 = await loadExistingAssessment(assessmentId2, organizationId)

  // Calculate changes
  const overallMaturityChange =
    (assessment2.assessment?.overall_maturity || 0) -
    (assessment1.assessment?.overall_maturity || 0)

  // Calculate dimension changes
  const dimensionChanges: Record<string, number> = {}
  const dims1 = new Map(assessment1.dimensionScores.map((d) => [d.dimension, d.score]))
  assessment2.dimensionScores.forEach((d) => {
    const oldScore = dims1.get(d.dimension) || 0
    dimensionChanges[d.dimension] = d.score - oldScore
  })

  // Find new strengths (dimensions that improved significantly)
  const newStrengths = Object.entries(dimensionChanges)
    .filter(([_, change]) => change >= 1)
    .map(([dim]) => dim)

  // Find resolved gaps (reality gaps that are no longer present)
  const gaps1 = new Set(assessment1.realityGaps.map((g) => g.dimension))
  const gaps2 = new Set(assessment2.realityGaps.map((g) => g.dimension))
  const resolvedGaps = Array.from(gaps1).filter((g) => !gaps2.has(g))

  return {
    assessment1,
    assessment2,
    changes: {
      overallMaturityChange,
      dimensionChanges,
      newStrengths,
      resolvedGaps,
    },
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  getSupabaseClient,
  uuid,
  log,
}

// Default export for convenience
export default {
  saveAssessmentResults,
  saveDimensionScores,
  saveThemes,
  saveRealityGaps,
  saveSkillProfiles,
  saveRecommendations,
  saveExecutiveSummary,
  saveConsensusThemes,
  saveAssessmentRisks,
  saveAnalysisEntities,
  saveAIChampions,
  saveSkillDistribution,
  loadExistingAssessment,
  loadLatestAssessment,
  getAssessmentHistory,
  compareAssessments,
  GLUEIQ_ORG_ID,
}
