/**
 * GlueIQ Data Migration Script
 *
 * Migrates GlueIQ assessment data from JSON files to Supabase database.
 * Uses the actual database schema.
 *
 * Usage:
 *   npx tsx scripts/migrate-glueiq-data.ts
 */

import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Data directory
const DATA_DIR = path.join(process.cwd(), 'data', 'organizations', 'glueiq')

// Consistent UUIDs for idempotent migrations
const GLUEIQ_ORG_ID = '550e8400-e29b-41d4-a716-446655440001'
const GLUEIQ_ASSESSMENT_ID = '550e8400-e29b-41d4-a716-446655440002'
const GLUEIQ_EXEC_SUMMARY_ID = '550e8400-e29b-41d4-a716-446655440003'

// Logger
const log = {
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  success: (msg: string) => console.log(`[SUCCESS] ${msg}`),
  error: (msg: string, err?: any) => console.error(`[ERROR] ${msg}`, err || ''),
  warn: (msg: string) => console.warn(`[WARN] ${msg}`),
  section: (title: string) => {
    console.log('\n' + '='.repeat(60))
    console.log(title)
    console.log('='.repeat(60))
  }
}

// Read JSON file
function readJson<T>(filename: string): T | null {
  const filepath = path.join(DATA_DIR, filename)
  try {
    if (!fs.existsSync(filepath)) {
      log.warn(`File not found: ${filepath}`)
      return null
    }
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'))
  } catch (err) {
    log.error(`Failed to read ${filename}`, err)
    return null
  }
}

// Generate UUID v4
function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

async function main() {
  log.section('GlueIQ Data Migration')
  log.info(`Data directory: ${DATA_DIR}`)

  // Read all JSON files
  const orgData = readJson<any>('organization.json')
  const execSummary = readJson<any>('executive-summary.json')
  const maturityScores = readJson<any>('maturity-scores.json')
  const analysisResults = readJson<any>('analysis-results.json')

  if (!orgData) {
    log.error('organization.json is required')
    process.exit(1)
  }

  log.info(`Organization ID: ${GLUEIQ_ORG_ID}`)
  log.info(`Assessment ID: ${GLUEIQ_ASSESSMENT_ID}`)

  // 1. Upsert Organization
  log.section('1. Migrating Organization')
  {
    const metadata = {
      subIndustry: orgData.subIndustry,
      region: orgData.region,
      headquarters: orgData.headquarters,
      foundedYear: orgData.founded,
      description: orgData.description,
      businessLines: orgData.businessLines,
      assessmentMetadata: orgData.assessmentMetadata
    }

    // Map size to valid constraint values
    const mapSizeRange = (size: string): string => {
      const sizeNum = parseInt(size?.split('-')[0] || size) || 50
      if (sizeNum <= 10) return '1-10'
      if (sizeNum <= 50) return '11-50'
      if (sizeNum <= 200) return '51-200'
      if (sizeNum <= 500) return '201-500'
      if (sizeNum <= 1000) return '501-1000'
      return '1000+'
    }

    const { error } = await supabase
      .from('organizations')
      .upsert({
        id: GLUEIQ_ORG_ID,
        name: orgData.name,
        slug: orgData.slug,
        industry: orgData.industry,
        size_range: mapSizeRange(orgData.size),
        website: orgData.website,
        metadata,
        is_active: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })

    if (error) {
      log.error('Failed to upsert organization', error)
      process.exit(1)
    }
    log.success(`Organization: ${orgData.name}`)
  }

  // 2. Create AI Maturity Assessment
  // Valid data_source: 'c_suite_interview', 'team_survey', 'automated_analysis', 'manual_assessment', 'hybrid'
  log.section('2. Migrating AI Maturity Assessment')
  {
    const overallMaturity = maturityScores?.overallMaturity ||
      parseFloat(execSummary?.keyMetrics?.find((m: any) => m.label === 'Overall AI Maturity')?.value?.replace('/10', '') || '3.8')

    const { error } = await supabase
      .from('ai_maturity_assessments')
      .upsert({
        id: GLUEIQ_ASSESSMENT_ID,
        organization_id: GLUEIQ_ORG_ID,
        assessment_name: 'Initial AI Maturity Assessment',
        version: 1,
        overall_maturity: overallMaturity,
        confidence_level: maturityScores?.confidenceLevel || 0.85,
        technical_score: maturityScores?.categoryScores?.technical || 3.5,
        human_score: maturityScores?.categoryScores?.human || 3.2,
        business_score: maturityScores?.categoryScores?.business || 4.0,
        ai_adoption_score: maturityScores?.categoryScores?.aiAdoption || 3.5,
        maturity_profile: maturityScores?.maturityProfile || {},
        industry_average: 4.2,
        percentile: 38,
        benchmark_rank: 'Below Average',
        data_source: 'c_suite_interview',
        transcript_count: orgData.assessmentMetadata?.transcriptCount || 9,
        total_interview_duration_minutes: orgData.assessmentMetadata?.totalInterviewDuration || 600,
        analysis_method: orgData.assessmentMetadata?.analysisMethod || 'AI-assisted qualitative analysis',
        data_quality: orgData.assessmentMetadata?.dataQuality || 'high',
        assessment_date: new Date().toISOString().split('T')[0],
        metadata: { source: 'json_migration' },
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })

    if (error) {
      log.error('Failed to create assessment', error)
      process.exit(1)
    }
    log.success('Assessment created')
  }

  // 3. Migrate Executive Summary
  log.section('3. Migrating Executive Summary')
  if (execSummary) {
    const { error } = await supabase
      .from('executive_summaries')
      .upsert({
        id: GLUEIQ_EXEC_SUMMARY_ID,
        assessment_id: GLUEIQ_ASSESSMENT_ID,
        organization_id: GLUEIQ_ORG_ID,
        executive_summary: execSummary.executiveSummary,
        key_metrics: execSummary.keyMetrics,
        next_steps_30_days: execSummary.nextSteps?.['30days'] || [],
        next_steps_60_days: execSummary.nextSteps?.['60days'] || [],
        next_steps_90_days: execSummary.nextSteps?.['90days'] || [],
        generated_by: 'claude-analysis',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })

    if (error) {
      log.error('Failed to create executive summary', error)
    } else {
      log.success('Executive summary created')
    }
  }

  // 4. Migrate Consensus Themes
  log.section('4. Migrating Consensus Themes')
  if (execSummary?.consensusThemes) {
    // Delete existing themes for this org
    await supabase
      .from('consensus_themes')
      .delete()
      .eq('organization_id', GLUEIQ_ORG_ID)

    const themes = execSummary.consensusThemes.map((t: any) => ({
      id: uuid(),
      executive_summary_id: GLUEIQ_EXEC_SUMMARY_ID,
      organization_id: GLUEIQ_ORG_ID,
      theme_name: t.name,
      description: t.name,
      frequency: t.frequency,
      sentiment: t.sentiment,
      interviewees: t.interviewees,
      quotes: t.quotes,
      updated_at: new Date().toISOString()
    }))

    const { error } = await supabase
      .from('consensus_themes')
      .insert(themes)

    if (error) {
      log.error('Failed to insert consensus themes', error)
    } else {
      log.success(`Inserted ${themes.length} consensus themes`)
    }
  }

  // 5. Migrate Reality Gaps (gap_size is a GENERATED column - don't include it)
  log.section('5. Migrating Reality Gaps')
  if (execSummary?.realityGaps) {
    // Delete existing gaps for this org
    await supabase
      .from('reality_gaps')
      .delete()
      .eq('organization_id', GLUEIQ_ORG_ID)

    const gaps = execSummary.realityGaps.map((g: any) => ({
      id: uuid(),
      executive_summary_id: GLUEIQ_EXEC_SUMMARY_ID,
      organization_id: GLUEIQ_ORG_ID,
      dimension: g.dimension,
      leadership_perception: g.leadershipPerception,
      actual_evidence: g.actualEvidence,
      // gap_size is generated automatically
      supporting_evidence: g.evidence?.supporting || [],
      contradicting_evidence: g.evidence?.contradicting || [],
      updated_at: new Date().toISOString()
    }))

    const { error } = await supabase
      .from('reality_gaps')
      .insert(gaps)

    if (error) {
      log.error('Failed to insert reality gaps', error)
    } else {
      log.success(`Inserted ${gaps.length} reality gaps`)
    }
  }

  // 6. Migrate Assessment Risks
  // Uses executive_summary_id (not assessment_id), risk_category, description
  // risk_level enum: 'low', 'medium', 'high', 'critical'
  // risk_category values: 'reputation', 'competitive', 'governance', 'talent', 'adoption', 'client', 'tool', 'cost', 'security', 'other'
  log.section('6. Migrating Assessment Risks')
  if (execSummary?.riskAnalysis) {
    // Delete existing risks for this org
    await supabase
      .from('assessment_risks')
      .delete()
      .eq('organization_id', GLUEIQ_ORG_ID)

    const risks: any[] = []

    // Map risk title to valid category
    const mapRiskCategory = (title: string): string => {
      const lowerTitle = title.toLowerCase()
      if (lowerTitle.includes('reputation')) return 'reputation'
      if (lowerTitle.includes('competitive')) return 'competitive'
      if (lowerTitle.includes('governance')) return 'governance'
      if (lowerTitle.includes('talent')) return 'talent'
      if (lowerTitle.includes('adoption')) return 'adoption'
      if (lowerTitle.includes('client')) return 'client'
      if (lowerTitle.includes('tool')) return 'tool'
      if (lowerTitle.includes('cost')) return 'cost'
      if (lowerTitle.includes('security')) return 'security'
      return 'other'
    }

    const addRisks = (riskList: string[], level: string) => {
      riskList?.forEach((risk: string) => {
        const [title, ...descParts] = risk.split(' - ')
        risks.push({
          id: uuid(),
          executive_summary_id: GLUEIQ_EXEC_SUMMARY_ID,
          organization_id: GLUEIQ_ORG_ID,
          risk_level: level,
          risk_category: mapRiskCategory(title),
          description: risk,
          status: 'identified',
          updated_at: new Date().toISOString()
        })
      })
    }

    addRisks(execSummary.riskAnalysis.high, 'high')
    addRisks(execSummary.riskAnalysis.medium, 'medium')
    addRisks(execSummary.riskAnalysis.low, 'low')

    if (risks.length > 0) {
      const { error } = await supabase
        .from('assessment_risks')
        .insert(risks)

      if (error) {
        log.error('Failed to insert assessment risks', error)
      } else {
        log.success(`Inserted ${risks.length} assessment risks`)
      }
    }
  }

  // 7. Migrate Skills Profiles (Partners)
  log.section('7. Migrating Skills Profiles')
  if (orgData.partners) {
    // Delete existing profiles for this org
    await supabase
      .from('skills_profiles')
      .delete()
      .eq('organization_id', GLUEIQ_ORG_ID)

    // ai_skill_level enum check
    const mapSkillLevel = (level: string): string => {
      const mapping: Record<string, string> = {
        'advanced': 'advanced',
        'intermediate': 'intermediate',
        'beginner': 'beginner',
        'aware': 'aware',
        'none': 'none'
      }
      return mapping[level?.toLowerCase()] || 'beginner'
    }

    const profiles = orgData.partners.map((p: any) => ({
      id: uuid(),
      organization_id: GLUEIQ_ORG_ID,
      assessment_id: GLUEIQ_ASSESSMENT_ID,
      person_name: p.name,
      title: p.title,
      department: p.department,
      ai_skill_level: mapSkillLevel(p.aiSkillLevel),
      ai_skill_score: p.aiSkillLevel === 'advanced' ? 8 : p.aiSkillLevel === 'intermediate' ? 5 : 3,
      tools_used: [],
      is_champion: p.isChampion || false,
      updated_at: new Date().toISOString()
    }))

    const { error } = await supabase
      .from('skills_profiles')
      .insert(profiles)

    if (error) {
      log.error('Failed to insert skills profiles', error)
    } else {
      log.success(`Inserted ${profiles.length} skills profiles`)
    }
  }

  // 8. Migrate AI Champions
  log.section('8. Migrating AI Champions')
  if (orgData.partners) {
    const champions = orgData.partners.filter((p: any) => p.isChampion)

    if (champions.length > 0) {
      // Delete existing champions for this org
      await supabase
        .from('ai_champions')
        .delete()
        .eq('organization_id', GLUEIQ_ORG_ID)

      const championRecords = champions.map((p: any) => ({
        id: uuid(),
        assessment_id: GLUEIQ_ASSESSMENT_ID,
        organization_id: GLUEIQ_ORG_ID,
        person_name: p.name,
        title: p.title,
        ai_skill_level: p.aiSkillLevel === 'advanced' ? 'advanced' : 'intermediate',
        champion_reason: `Identified as AI champion based on ${p.aiSkillLevel} skill level and leadership position`,
        influence_areas: [p.department],
        is_activated: false,
        updated_at: new Date().toISOString()
      }))

      const { error } = await supabase
        .from('ai_champions')
        .insert(championRecords)

      if (error) {
        log.error('Failed to insert AI champions', error)
      } else {
        log.success(`Inserted ${championRecords.length} AI champions`)
      }
    }
  }

  // 9. Migrate Analysis Entities
  log.section('9. Migrating Analysis Entities')
  if (analysisResults?.entities) {
    // Delete existing entities for this org
    await supabase
      .from('analysis_entities')
      .delete()
      .eq('organization_id', GLUEIQ_ORG_ID)

    // Deduplicate entities
    const entityMap = new Map<string, any>()
    analysisResults.entities.forEach((e: any) => {
      const key = `${e.type}:${e.value}`
      if (entityMap.has(key)) {
        const existing = entityMap.get(key)
        existing.frequency += e.frequency || 1
        if (e.sourceQuotes) {
          existing.source_quotes = [...new Set([...existing.source_quotes, ...e.sourceQuotes])]
        }
      } else {
        entityMap.set(key, {
          id: uuid(),
          assessment_id: GLUEIQ_ASSESSMENT_ID,
          organization_id: GLUEIQ_ORG_ID,
          entity_type: e.type,
          entity_value: e.value,
          context: e.context || '',
          frequency: e.frequency || 1,
          sentiment: e.sentiment || 'neutral',
          source_quotes: (e.sourceQuotes || []).slice(0, 5),
          updated_at: new Date().toISOString()
        })
      }
    })

    const entities = Array.from(entityMap.values())

    // Insert in batches
    const batchSize = 50
    let inserted = 0
    for (let i = 0; i < entities.length; i += batchSize) {
      const batch = entities.slice(i, i + batchSize)
      const { error } = await supabase
        .from('analysis_entities')
        .insert(batch)

      if (error) {
        log.error(`Failed to insert entity batch ${i / batchSize + 1}`, error)
      } else {
        inserted += batch.length
      }
    }
    log.success(`Inserted ${inserted} analysis entities`)
  }

  // 10. Migrate Recommendations
  // timeframe enum: 'immediate', 'short_term', 'long_term'
  // effort_required enum: 'low', 'medium', 'high'
  log.section('10. Migrating Recommendations')
  if (execSummary?.recommendations) {
    // Delete existing recommendations for this org
    await supabase
      .from('ai_recommendations')
      .delete()
      .eq('organization_id', GLUEIQ_ORG_ID)

    const recs: any[] = []

    const addRecs = (recList: string[], timeframe: string, startOrder: number, effortLevel: string) => {
      recList?.forEach((rec: string, idx: number) => {
        const [title, ...descParts] = rec.split(' - ')
        recs.push({
          id: uuid(),
          assessment_id: GLUEIQ_ASSESSMENT_ID,
          organization_id: GLUEIQ_ORG_ID,
          timeframe,
          sort_order: startOrder + idx,
          title: title.trim(),
          description: descParts.join(' - ').trim() || title.trim(),
          effort_required: effortLevel,
          status: 'pending',
          updated_at: new Date().toISOString()
        })
      })
    }

    addRecs(execSummary.recommendations.immediate, 'immediate', 1, 'low')
    addRecs(execSummary.recommendations.shortTerm, 'short_term', 10, 'medium')
    addRecs(execSummary.recommendations.longTerm, 'long_term', 20, 'high')

    if (recs.length > 0) {
      const { error } = await supabase
        .from('ai_recommendations')
        .insert(recs)

      if (error) {
        log.error('Failed to insert recommendations', error)
      } else {
        log.success(`Inserted ${recs.length} recommendations`)
      }
    }
  }

  log.section('Migration Complete!')
  log.success(`Organization ID: ${GLUEIQ_ORG_ID}`)
  log.success(`Assessment ID: ${GLUEIQ_ASSESSMENT_ID}`)
  log.success(`Executive Summary ID: ${GLUEIQ_EXEC_SUMMARY_ID}`)
}

main().catch(err => {
  log.error('Migration failed', err)
  process.exit(1)
})
