/**
 * Organization Data Migration Script
 *
 * Migrates organization assessment data from JSON files to Supabase database.
 * This script handles the GlueIQ organization data and can be reused for
 * future organizations by passing the organization directory as a parameter.
 *
 * Usage:
 *   npx tsx scripts/migrate-organization-data.ts glueiq
 *   npx tsx scripts/migrate-organization-data.ts <org-directory-name>
 *
 * Expected JSON files in /data/organizations/<org-directory>/:
 *   - organization.json
 *   - maturity-scores.json
 *   - executive-summary.json
 *   - analysis-results.json
 *   - skills-mapping.json
 */

import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import * as fs from 'fs'

// Type definitions for JSON data structures
interface BusinessLine {
  name: string
  lead: string
  description: string
}

interface Partner {
  name: string
  title: string
  department: string
  aiSkillLevel: string
  isChampion: boolean
}

interface AssessmentMetadata {
  assessmentDate: string
  assessmentType: string
  transcriptCount: number
  totalInterviewDuration: number
  analysisMethod: string
  dataQuality: string
}

interface OrganizationData {
  id: string
  name: string
  slug: string
  industry: string
  subIndustry: string
  size: string
  region: string
  headquarters: string
  founded: number
  description: string
  website: string
  businessLines: BusinessLine[]
  partners: Partner[]
  assessmentMetadata: AssessmentMetadata
}

interface DimensionScore {
  dimension: string
  score: number
  evidence: string[]
  confidence: number
  levelMatches?: number
}

interface GapPrioritization {
  dimension: string
  currentScore: number
  targetScore: number
  priority: string
  effort: string
  recommendation: string
}

interface BenchmarkComparison {
  industryAverage: number
  percentile: number
  rank: string
  topPerformerScore: number
  gapToTop: number
}

interface MaturityScoresData {
  organizationId: string
  organizationName: string
  overallMaturity: number
  confidenceLevel: number
  assessmentDate: string
  dataSource: string
  dimensionScores: Record<string, DimensionScore>
  categoryScores: Record<string, number>
  maturityProfile: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
  }
  gapPrioritization: GapPrioritization[]
  benchmarkComparison: BenchmarkComparison
}

interface KeyMetric {
  label: string
  value: string
  trend: string
  benchmark: string
}

interface ConsensusTheme {
  name: string
  frequency: number
  sentiment: number
  interviewees: string[]
  quotes: string[]
}

interface RealityGap {
  dimension: string
  leadershipPerception: number
  actualEvidence: number
  gap: number
  evidence: {
    supporting: string[]
    contradicting: string[]
  }
}

interface Recommendations {
  immediate: string[]
  shortTerm: string[]
  longTerm: string[]
}

interface RiskAnalysis {
  high: string[]
  medium: string[]
  low: string[]
}

interface NextSteps {
  '30days': string[]
  '60days': string[]
  '90days': string[]
}

interface ExecutiveSummaryData {
  organizationId: string
  organizationName: string
  timestamp: string
  executiveSummary: string
  keyMetrics: KeyMetric[]
  consensusThemes: ConsensusTheme[]
  realityGaps: RealityGap[]
  recommendations: Recommendations
  riskAnalysis: RiskAnalysis
  nextSteps: NextSteps
}

interface AnalysisEntity {
  type: string
  value: string
  context: string
  frequency: number
  sourceQuotes: string[]
  sentiment: string
}

interface AnalysisTheme {
  id: string
  name: string
  description: string
  keywords: string[]
  frequency: number
  sentiment: number
  sourceInterviews: string[]
  representativeQuotes: string[]
  dimensions: string[]
}

interface SkillProfile {
  name: string
  title: string
  aiSkillLevel: string
  aiSkillScore: number
  toolsUsed: string[]
  frequency: string
  mentionedBy: string[]
  evidence: string[]
  isChampion: boolean
  growthPotential: string
}

interface AnalysisResultsData {
  transcriptCount: number
  analysisTimestamp: string
  entities: AnalysisEntity[]
  themes: AnalysisTheme[]
  skillProfiles: SkillProfile[]
  champions: any[]
  dimensionScores: Record<string, DimensionScore>
  overallMaturity: number
  confidence: number
  executiveSummary: string
}

interface Champion {
  name: string
  title: string
  aiSkillLevel: string
  reason: string
}

interface DepartmentBreakdown {
  fluencyRate: number
  topUsers: string[]
  adoptionStatus: string
}

interface TrainingCohort {
  name: string
  description: string
  members: string[]
  focus: string[]
  duration: string
  objective: string
}

interface SkillsMappingData {
  organizationId: string
  organizationName: string
  timestamp: string
  profiles: SkillProfile[]
  champions: Champion[]
  skillDistribution: Record<string, number>
  departmentBreakdown: Record<string, DepartmentBreakdown>
  recommendedTrainingCohorts: TrainingCohort[]
}

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create Supabase client with service role key for admin access
const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Logger utility
const log = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  success: (message: string) => console.log(`[SUCCESS] ${message}`),
  error: (message: string, error?: any) => console.error(`[ERROR] ${message}`, error || ''),
  warn: (message: string) => console.warn(`[WARN] ${message}`),
  section: (title: string) => {
    console.log('\n' + '='.repeat(60))
    console.log(title)
    console.log('='.repeat(60))
  }
}

/**
 * Read and parse a JSON file
 */
function readJsonFile<T>(filePath: string): T | null {
  try {
    if (!fs.existsSync(filePath)) {
      log.warn(`File not found: ${filePath}`)
      return null
    }
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content) as T
  } catch (error) {
    log.error(`Failed to read ${filePath}`, error)
    return null
  }
}

/**
 * Migrate organization base data
 * Uses the existing organizations table schema and stores additional
 * assessment-specific data in the metadata JSONB field
 */
async function migrateOrganization(data: OrganizationData): Promise<string | null> {
  log.section('Migrating Organization')

  try {
    // Build metadata object with assessment-specific information
    const metadata = {
      subIndustry: data.subIndustry,
      region: data.region,
      headquarters: data.headquarters,
      foundedYear: data.founded,
      description: data.description,
      businessLines: data.businessLines,
      assessmentMetadata: data.assessmentMetadata
    }

    const organizationRecord = {
      id: data.id,
      name: data.name,
      slug: data.slug,
      industry: data.industry,
      size_range: data.size,
      website: data.website,
      metadata: metadata,
      is_active: true,
      updated_at: new Date().toISOString()
    }

    const { data: result, error } = await supabase
      .from('organizations')
      .upsert(organizationRecord, { onConflict: 'id' })
      .select('id')
      .single()

    if (error) {
      log.error('Failed to migrate organization', error)
      return null
    }

    log.success(`Migrated organization: ${data.name} (${result.id})`)
    return result.id
  } catch (error) {
    log.error('Exception during organization migration', error)
    return null
  }
}

/**
 * Migrate team members (partners) for the organization
 */
async function migrateTeamMembers(
  organizationId: string,
  partners: Partner[]
): Promise<void> {
  log.section('Migrating Team Members')

  try {
    const teamMemberRecords = partners.map((partner, index) => ({
      organization_id: organizationId,
      name: partner.name,
      title: partner.title,
      department: partner.department,
      ai_skill_level: partner.aiSkillLevel,
      is_champion: partner.isChampion,
      sort_order: index,
      is_active: true,
      updated_at: new Date().toISOString()
    }))

    // Delete existing team members for this organization to avoid duplicates
    const { error: deleteError } = await supabase
      .from('organization_team_members')
      .delete()
      .eq('organization_id', organizationId)

    if (deleteError) {
      log.warn(`Could not delete existing team members: ${deleteError.message}`)
    }

    const { error } = await supabase
      .from('organization_team_members')
      .insert(teamMemberRecords)

    if (error) {
      log.error('Failed to migrate team members', error)
      return
    }

    log.success(`Migrated ${partners.length} team members`)
  } catch (error) {
    log.error('Exception during team members migration', error)
  }
}

/**
 * Migrate maturity scores for the organization
 */
async function migrateMaturityScores(
  organizationId: string,
  data: MaturityScoresData
): Promise<void> {
  log.section('Migrating Maturity Scores')

  try {
    const maturityScoreRecord = {
      organization_id: organizationId,
      overall_maturity: data.overallMaturity,
      confidence_level: data.confidenceLevel,
      assessment_date: data.assessmentDate,
      data_source: data.dataSource,
      dimension_scores: data.dimensionScores,
      category_scores: data.categoryScores,
      maturity_profile: data.maturityProfile,
      gap_prioritization: data.gapPrioritization,
      benchmark_comparison: data.benchmarkComparison,
      updated_at: new Date().toISOString()
    }

    // Delete existing maturity scores for this organization
    const { error: deleteError } = await supabase
      .from('organization_maturity_scores')
      .delete()
      .eq('organization_id', organizationId)

    if (deleteError) {
      log.warn(`Could not delete existing maturity scores: ${deleteError.message}`)
    }

    const { error } = await supabase
      .from('organization_maturity_scores')
      .insert(maturityScoreRecord)

    if (error) {
      log.error('Failed to migrate maturity scores', error)
      return
    }

    log.success(`Migrated maturity scores (overall: ${data.overallMaturity})`)
  } catch (error) {
    log.error('Exception during maturity scores migration', error)
  }
}

/**
 * Migrate executive summary and related data
 */
async function migrateExecutiveSummary(
  organizationId: string,
  data: ExecutiveSummaryData
): Promise<void> {
  log.section('Migrating Executive Summary')

  try {
    // Main executive summary
    const executiveSummaryRecord = {
      organization_id: organizationId,
      summary_text: data.executiveSummary,
      key_metrics: data.keyMetrics,
      recommendations: data.recommendations,
      risk_analysis: data.riskAnalysis,
      next_steps: data.nextSteps,
      timestamp: data.timestamp,
      updated_at: new Date().toISOString()
    }

    // Delete existing executive summary
    const { error: deleteError } = await supabase
      .from('organization_executive_summaries')
      .delete()
      .eq('organization_id', organizationId)

    if (deleteError) {
      log.warn(`Could not delete existing executive summary: ${deleteError.message}`)
    }

    const { error } = await supabase
      .from('organization_executive_summaries')
      .insert(executiveSummaryRecord)

    if (error) {
      log.error('Failed to migrate executive summary', error)
      return
    }

    log.success('Migrated executive summary')

    // Migrate consensus themes
    await migrateConsensusThemes(organizationId, data.consensusThemes)

    // Migrate reality gaps
    await migrateRealityGaps(organizationId, data.realityGaps)
  } catch (error) {
    log.error('Exception during executive summary migration', error)
  }
}

/**
 * Migrate consensus themes
 */
async function migrateConsensusThemes(
  organizationId: string,
  themes: ConsensusTheme[]
): Promise<void> {
  log.info('Migrating consensus themes...')

  try {
    const themeRecords = themes.map((theme, index) => ({
      organization_id: organizationId,
      name: theme.name,
      frequency: theme.frequency,
      sentiment: theme.sentiment,
      interviewees: theme.interviewees,
      quotes: theme.quotes,
      sort_order: index,
      created_at: new Date().toISOString()
    }))

    // Delete existing consensus themes
    const { error: deleteError } = await supabase
      .from('organization_consensus_themes')
      .delete()
      .eq('organization_id', organizationId)

    if (deleteError) {
      log.warn(`Could not delete existing consensus themes: ${deleteError.message}`)
    }

    const { error } = await supabase
      .from('organization_consensus_themes')
      .insert(themeRecords)

    if (error) {
      log.error('Failed to migrate consensus themes', error)
      return
    }

    log.success(`Migrated ${themes.length} consensus themes`)
  } catch (error) {
    log.error('Exception during consensus themes migration', error)
  }
}

/**
 * Migrate reality gaps
 */
async function migrateRealityGaps(
  organizationId: string,
  gaps: RealityGap[]
): Promise<void> {
  log.info('Migrating reality gaps...')

  try {
    const gapRecords = gaps.map((gap, index) => ({
      organization_id: organizationId,
      dimension: gap.dimension,
      leadership_perception: gap.leadershipPerception,
      actual_evidence: gap.actualEvidence,
      gap_size: gap.gap,
      supporting_evidence: gap.evidence.supporting,
      contradicting_evidence: gap.evidence.contradicting,
      sort_order: index,
      created_at: new Date().toISOString()
    }))

    // Delete existing reality gaps
    const { error: deleteError } = await supabase
      .from('organization_reality_gaps')
      .delete()
      .eq('organization_id', organizationId)

    if (deleteError) {
      log.warn(`Could not delete existing reality gaps: ${deleteError.message}`)
    }

    const { error } = await supabase
      .from('organization_reality_gaps')
      .insert(gapRecords)

    if (error) {
      log.error('Failed to migrate reality gaps', error)
      return
    }

    log.success(`Migrated ${gaps.length} reality gaps`)
  } catch (error) {
    log.error('Exception during reality gaps migration', error)
  }
}

/**
 * Migrate analysis results (entities, themes, skill profiles)
 */
async function migrateAnalysisResults(
  organizationId: string,
  data: AnalysisResultsData
): Promise<void> {
  log.section('Migrating Analysis Results')

  try {
    // Deduplicate entities by combining frequency counts for same type+value
    const entityMap = new Map<string, AnalysisEntity>()
    data.entities.forEach(entity => {
      const key = `${entity.type}:${entity.value}`
      if (entityMap.has(key)) {
        const existing = entityMap.get(key)!
        existing.frequency += entity.frequency
        existing.sourceQuotes = [...new Set([...existing.sourceQuotes, ...entity.sourceQuotes])]
      } else {
        entityMap.set(key, { ...entity })
      }
    })

    const deduplicatedEntities = Array.from(entityMap.values())

    const entityRecords = deduplicatedEntities.map((entity, index) => ({
      organization_id: organizationId,
      entity_type: entity.type,
      entity_value: entity.value,
      context: entity.context,
      frequency: entity.frequency,
      source_quotes: entity.sourceQuotes.slice(0, 10), // Limit quotes to prevent data bloat
      sentiment: entity.sentiment,
      sort_order: index,
      created_at: new Date().toISOString()
    }))

    // Delete existing analysis entities
    const { error: deleteError } = await supabase
      .from('organization_analysis_entities')
      .delete()
      .eq('organization_id', organizationId)

    if (deleteError) {
      log.warn(`Could not delete existing analysis entities: ${deleteError.message}`)
    }

    // Insert in batches to avoid potential size limits
    const batchSize = 100
    for (let i = 0; i < entityRecords.length; i += batchSize) {
      const batch = entityRecords.slice(i, i + batchSize)
      const { error } = await supabase
        .from('organization_analysis_entities')
        .insert(batch)

      if (error) {
        log.error(`Failed to migrate analysis entities batch ${i / batchSize + 1}`, error)
      }
    }

    log.success(`Migrated ${entityRecords.length} analysis entities (deduplicated from ${data.entities.length})`)

    // Migrate themes as recommendations (reusing the recommendations table)
    await migrateAnalysisThemes(organizationId, data.themes)

  } catch (error) {
    log.error('Exception during analysis results migration', error)
  }
}

/**
 * Migrate analysis themes to recommendations table
 */
async function migrateAnalysisThemes(
  organizationId: string,
  themes: AnalysisTheme[]
): Promise<void> {
  log.info('Migrating analysis themes...')

  try {
    const themeRecords = themes.map((theme, index) => ({
      organization_id: organizationId,
      recommendation_type: 'theme',
      title: theme.name,
      description: theme.description,
      priority: theme.frequency > 100 ? 'high' : theme.frequency > 50 ? 'medium' : 'low',
      category: theme.dimensions.join(', '),
      metadata: {
        id: theme.id,
        keywords: theme.keywords,
        frequency: theme.frequency,
        sentiment: theme.sentiment,
        sourceInterviews: theme.sourceInterviews,
        representativeQuotes: theme.representativeQuotes
      },
      sort_order: index,
      created_at: new Date().toISOString()
    }))

    // Delete existing theme recommendations
    const { error: deleteError } = await supabase
      .from('organization_recommendations')
      .delete()
      .eq('organization_id', organizationId)
      .eq('recommendation_type', 'theme')

    if (deleteError) {
      log.warn(`Could not delete existing analysis themes: ${deleteError.message}`)
    }

    const { error } = await supabase
      .from('organization_recommendations')
      .insert(themeRecords)

    if (error) {
      log.error('Failed to migrate analysis themes', error)
      return
    }

    log.success(`Migrated ${themes.length} analysis themes`)
  } catch (error) {
    log.error('Exception during analysis themes migration', error)
  }
}

/**
 * Migrate skills mapping data
 */
async function migrateSkillsMapping(
  organizationId: string,
  data: SkillsMappingData
): Promise<void> {
  log.section('Migrating Skills Mapping')

  try {
    // Update organization with skills-related metadata
    const { error: updateError } = await supabase
      .from('organizations')
      .update({
        skill_distribution: data.skillDistribution,
        department_breakdown: data.departmentBreakdown,
        training_cohorts: data.recommendedTrainingCohorts,
        updated_at: new Date().toISOString()
      })
      .eq('id', organizationId)

    if (updateError) {
      log.warn(`Could not update organization with skills data: ${updateError.message}`)
    }

    // Update team members with detailed skill profiles
    for (const profile of data.profiles) {
      const { error } = await supabase
        .from('organization_team_members')
        .update({
          ai_skill_level: profile.aiSkillLevel,
          ai_skill_score: profile.aiSkillScore,
          tools_used: profile.toolsUsed,
          usage_frequency: profile.frequency,
          evidence: profile.evidence,
          is_champion: profile.isChampion,
          growth_potential: profile.growthPotential,
          updated_at: new Date().toISOString()
        })
        .eq('organization_id', organizationId)
        .eq('name', profile.name)

      if (error) {
        log.warn(`Could not update team member ${profile.name}: ${error.message}`)
      }
    }

    log.success(`Updated skill mappings for ${data.profiles.length} team members`)

    // Migrate champions as a separate recommendation category
    if (data.champions && data.champions.length > 0) {
      const championRecords = data.champions.map((champion, index) => ({
        organization_id: organizationId,
        recommendation_type: 'champion',
        title: champion.name,
        description: champion.reason,
        priority: 'high',
        category: champion.aiSkillLevel,
        metadata: {
          title: champion.title,
          aiSkillLevel: champion.aiSkillLevel
        },
        sort_order: index,
        created_at: new Date().toISOString()
      }))

      // Delete existing champion recommendations
      const { error: deleteError } = await supabase
        .from('organization_recommendations')
        .delete()
        .eq('organization_id', organizationId)
        .eq('recommendation_type', 'champion')

      if (deleteError) {
        log.warn(`Could not delete existing champions: ${deleteError.message}`)
      }

      const { error } = await supabase
        .from('organization_recommendations')
        .insert(championRecords)

      if (error) {
        log.error('Failed to migrate champions', error)
      } else {
        log.success(`Migrated ${data.champions.length} champions`)
      }
    }
  } catch (error) {
    log.error('Exception during skills mapping migration', error)
  }
}

/**
 * Main migration function
 */
async function runMigration(orgDirectory: string): Promise<void> {
  console.log('\n')
  log.section(`Organization Data Migration: ${orgDirectory}`)
  console.log(`Starting migration at ${new Date().toISOString()}`)
  console.log('\n')

  // Validate environment
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    log.error('Missing required environment variables:')
    log.error('  - NEXT_PUBLIC_SUPABASE_URL')
    log.error('  - SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  // Construct data directory path
  const dataDir = path.join(
    process.cwd(),
    'data',
    'organizations',
    orgDirectory
  )

  if (!fs.existsSync(dataDir)) {
    log.error(`Organization data directory not found: ${dataDir}`)
    process.exit(1)
  }

  log.info(`Reading data from: ${dataDir}`)

  // Read all JSON files
  const organizationData = readJsonFile<OrganizationData>(
    path.join(dataDir, 'organization.json')
  )
  const maturityScoresData = readJsonFile<MaturityScoresData>(
    path.join(dataDir, 'maturity-scores.json')
  )
  const executiveSummaryData = readJsonFile<ExecutiveSummaryData>(
    path.join(dataDir, 'executive-summary.json')
  )
  const analysisResultsData = readJsonFile<AnalysisResultsData>(
    path.join(dataDir, 'analysis-results.json')
  )
  const skillsMappingData = readJsonFile<SkillsMappingData>(
    path.join(dataDir, 'skills-mapping.json')
  )

  // Validate required data
  if (!organizationData) {
    log.error('organization.json is required but not found or invalid')
    process.exit(1)
  }

  try {
    // Step 1: Migrate organization
    const organizationId = await migrateOrganization(organizationData)
    if (!organizationId) {
      log.error('Failed to migrate organization - aborting')
      process.exit(1)
    }

    // Step 2: Migrate team members
    if (organizationData.partners && organizationData.partners.length > 0) {
      await migrateTeamMembers(organizationId, organizationData.partners)
    }

    // Step 3: Migrate maturity scores
    if (maturityScoresData) {
      await migrateMaturityScores(organizationId, maturityScoresData)
    } else {
      log.warn('Skipping maturity scores - file not found or invalid')
    }

    // Step 4: Migrate executive summary
    if (executiveSummaryData) {
      await migrateExecutiveSummary(organizationId, executiveSummaryData)
    } else {
      log.warn('Skipping executive summary - file not found or invalid')
    }

    // Step 5: Migrate analysis results
    if (analysisResultsData) {
      await migrateAnalysisResults(organizationId, analysisResultsData)
    } else {
      log.warn('Skipping analysis results - file not found or invalid')
    }

    // Step 6: Migrate skills mapping
    if (skillsMappingData) {
      await migrateSkillsMapping(organizationId, skillsMappingData)
    } else {
      log.warn('Skipping skills mapping - file not found or invalid')
    }

    // Summary
    log.section('Migration Complete')
    console.log(`
Organization: ${organizationData.name}
ID: ${organizationId}
Timestamp: ${new Date().toISOString()}

Data Migrated:
  - Organization: Yes
  - Team Members: ${organizationData.partners?.length || 0}
  - Maturity Scores: ${maturityScoresData ? 'Yes' : 'No'}
  - Executive Summary: ${executiveSummaryData ? 'Yes' : 'No'}
  - Consensus Themes: ${executiveSummaryData?.consensusThemes?.length || 0}
  - Reality Gaps: ${executiveSummaryData?.realityGaps?.length || 0}
  - Analysis Entities: ${analysisResultsData?.entities?.length || 0}
  - Analysis Themes: ${analysisResultsData?.themes?.length || 0}
  - Skill Profiles: ${skillsMappingData?.profiles?.length || 0}
  - Champions: ${skillsMappingData?.champions?.length || 0}

Migration completed successfully!
`)

  } catch (error) {
    log.error('Migration failed with exception', error)
    process.exit(1)
  }
}

// Parse command line arguments and run
const args = process.argv.slice(2)
if (args.length === 0) {
  console.log('Usage: npx tsx scripts/migrate-organization-data.ts <org-directory>')
  console.log('Example: npx tsx scripts/migrate-organization-data.ts glueiq')
  process.exit(1)
}

const orgDirectory = args[0]
runMigration(orgDirectory).catch(error => {
  log.error('Unhandled error during migration', error)
  process.exit(1)
})
