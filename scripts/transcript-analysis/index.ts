#!/usr/bin/env npx ts-node --transpile-only
/**
 * GlueIQ Transcript Analysis Pipeline v2
 * LLM-Powered Analysis with Claude
 *
 * Usage:
 *   npx ts-node --transpile-only scripts/transcript-analysis/index.ts
 *
 * Features:
 *   - LLM-powered dimension scoring (not keyword matching)
 *   - Semantic theme discovery
 *   - Cross-reference validation for skill assessments
 *   - Reality gap detection
 *   - Direct Supabase integration
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// ESM compatibility
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Import analysis modules
import { scoreAllDimensions, type DimensionAnalysis } from './llm-dimension-scorer.js'
import { discoverThemes, type DiscoveredTheme } from './theme-discovery.js'
import { validateSkillAssessments, type ValidatedSkillProfile } from './cross-reference-validator.js'
import { detectRealityGaps, type RealityGap, type RealityGapSummary } from './reality-gap-detector.js'
import {
  saveAssessmentResults,
  loadExistingAssessment,
} from './database-integration.js'

// ============================================================================
// CONFIGURATION
// ============================================================================

const GLUEIQ_ORG = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  name: 'GlueIQ',
  slug: 'glueiq',
  industry: 'Marketing & Advertising',
  size: '50-100',
  region: 'North America',
}

interface TranscriptConfig {
  filename: string
  interviewee: {
    name: string
    title: string
    role: 'c_suite' | 'leadership' | 'manager' | 'individual_contributor'
    department: string
  }
  date: string
  duration: number
}

const TRANSCRIPT_FILES: TranscriptConfig[] = [
  { filename: 'Gaston Legorburu Interview - October 29.md', interviewee: { name: 'Gaston Legorburu', title: 'CEO & Founder', role: 'c_suite', department: 'Executive' }, date: '2024-10-29', duration: 78 },
  { filename: 'Joey Wilson Interview December 11.md', interviewee: { name: 'Joey Wilson', title: 'Partner', role: 'c_suite', department: 'Strategy' }, date: '2024-12-11', duration: 85 },
  { filename: 'Boris-Stojanovic.md', interviewee: { name: 'Boris Stojanovic', title: 'Partner', role: 'c_suite', department: 'Advisory' }, date: '2024-11-15', duration: 34 },
  { filename: 'Matt-Kujawa.md', interviewee: { name: 'Matt Kujawa', title: 'Partner', role: 'c_suite', department: 'Technology' }, date: '2024-12-09', duration: 85 },
  { filename: 'Maggy Conde Interview - November 10.md', interviewee: { name: 'Maggy Conde', title: 'Partner', role: 'c_suite', department: 'Agency Services' }, date: '2024-11-10', duration: 65 },
  { filename: 'Noel Artiles Interview - December 10.md', interviewee: { name: 'Noel Artiles', title: 'CCO', role: 'c_suite', department: 'Creative' }, date: '2024-12-10', duration: 64 },
  { filename: 'Michele Conigliaro Interview Transcript Parts 1 & 2 - Dec 16 & 17, 2025.md', interviewee: { name: 'Michele Conigliaro', title: 'Head of People', role: 'leadership', department: 'HR' }, date: '2024-12-16', duration: 92 },
  { filename: 'Chiny Chewing Interview - November 12.md', interviewee: { name: 'Chiny Chewing', title: 'Partner', role: 'c_suite', department: 'Strategy' }, date: '2024-11-12', duration: 67 },
  { filename: 'Dave Serrano Interview - November 11.md', interviewee: { name: 'Dave Serrano', title: 'Partner', role: 'c_suite', department: 'Client Services' }, date: '2024-11-11', duration: 54 },
]

const TRANSCRIPTS_DIR = path.resolve(__dirname, '../../transcripts/GLUEIQ/C-suite')
const OUTPUT_DIR = path.resolve(__dirname, '../../data/organizations/glueiq')

// ============================================================================
// TYPES
// ============================================================================

export interface TranscriptData {
  id: string
  interviewee: {
    name: string
    title: string
    role: 'c_suite' | 'leadership' | 'manager' | 'individual_contributor'
    department: string
  }
  organization: string
  timestamp: Date
  duration: number
  rawContent: string
  metadata?: {
    interviewer?: string
    platform?: string
    topics?: string[]
  }
}

export interface AnalysisResults {
  organizationId: string
  organizationName: string
  transcriptCount: number
  analysisTimestamp: Date

  // Core results
  dimensionScores: Record<string, DimensionAnalysis>
  overallMaturity: number
  overallConfidence: number

  // Theme discovery
  themes: DiscoveredTheme[]

  // Skill profiles
  skillProfiles: ValidatedSkillProfile[]
  champions: ValidatedSkillProfile[]

  // Reality gaps
  realityGaps: RealityGap[]
  gapSummary: RealityGapSummary

  // Executive summary
  executiveSummary: string

  // Recommendations
  recommendations: Recommendation[]
}

interface Recommendation {
  id: string
  title: string
  description: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  timeframe: 'immediate' | 'short_term' | 'long_term'
  category: 'training' | 'tools' | 'governance' | 'culture' | 'process' | 'infrastructure' | 'strategy'
  targetDimensions: string[]
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
}

// ============================================================================
// TRANSCRIPT LOADING
// ============================================================================

async function loadTranscripts(): Promise<TranscriptData[]> {
  console.log('\n' + '='.repeat(60))
  console.log('LOADING TRANSCRIPTS')
  console.log('='.repeat(60))
  console.log(`Source: ${TRANSCRIPTS_DIR}\n`)

  const transcripts: TranscriptData[] = []

  for (const file of TRANSCRIPT_FILES) {
    const filePath = path.join(TRANSCRIPTS_DIR, file.filename)

    try {
      if (!fs.existsSync(filePath)) {
        console.warn(`  [SKIP] ${file.filename} - not found`)
        continue
      }

      const content = fs.readFileSync(filePath, 'utf-8')
      const sizeKB = (content.length / 1024).toFixed(1)
      console.log(`  [OK] ${file.interviewee.name.padEnd(20)} (${sizeKB} KB)`)

      transcripts.push({
        id: `glueiq-${file.interviewee.name.toLowerCase().replace(/\s+/g, '-')}`,
        interviewee: file.interviewee,
        organization: GLUEIQ_ORG.name,
        timestamp: new Date(file.date),
        duration: file.duration,
        rawContent: content,
        metadata: {
          interviewer: 'HumanGlue',
          platform: 'Zoom',
          topics: ['AI adoption', 'AI maturity']
        }
      })
    } catch (error) {
      console.error(`  [ERROR] ${file.filename}:`, error)
    }
  }

  console.log(`\nLoaded ${transcripts.length}/${TRANSCRIPT_FILES.length} transcripts`)
  return transcripts
}

// ============================================================================
// RECOMMENDATION GENERATION
// ============================================================================

function generateRecommendations(
  dimensionScores: Record<string, DimensionAnalysis>,
  realityGaps: RealityGap[],
  themes: DiscoveredTheme[]
): Recommendation[] {
  const recommendations: Recommendation[] = []

  // Find lowest scoring dimensions
  const sortedDimensions = Object.entries(dimensionScores)
    .sort((a, b) => a[1].score - b[1].score)

  // Critical gaps first
  const criticalGaps = realityGaps.filter(g => g.severity === 'critical')

  // Generate recommendations for critical gaps
  for (const gap of criticalGaps.slice(0, 3)) {
    recommendations.push({
      id: `rec-gap-${gap.id}`,
      title: `Address ${gap.dimensionName} Gap`,
      description: `${gap.description}. Current perception (${gap.perceptionScore}/10) exceeds evidence (${gap.evidenceScore}/10).`,
      priority: 'critical',
      timeframe: 'immediate',
      category: mapDimensionToCategory(gap.dimension),
      targetDimensions: [gap.dimension],
      expectedImpact: {
        scoreImprovement: gap.gapSize * 0.5,
        confidence: 0.7,
        description: gap.impact
      },
      implementation: {
        effort: 'medium',
        resources: ['Leadership time', 'Change management'],
        prerequisites: ['Stakeholder alignment'],
        successMetrics: ['Gap reduction by 50%']
      }
    })
  }

  // Generate recommendations for lowest dimensions
  for (const [dimension, analysis] of sortedDimensions.slice(0, 5)) {
    if (analysis.score < 2) {
      recommendations.push({
        id: `rec-dim-${dimension}`,
        title: `Improve ${dimension.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`,
        description: `Current score: ${analysis.score}/10. ${analysis.reasoning?.slice(0, 200)}...`,
        priority: analysis.score < 1 ? 'critical' : 'high',
        timeframe: analysis.score < 1 ? 'immediate' : 'short_term',
        category: mapDimensionToCategory(dimension),
        targetDimensions: [dimension],
        expectedImpact: {
          scoreImprovement: Math.min(2, 3 - analysis.score),
          confidence: analysis.confidence,
          description: `Move from Level ${Math.round(analysis.score)} to Level ${Math.round(analysis.score) + 2}`
        },
        implementation: {
          effort: 'medium',
          resources: getResourcesForDimension(dimension),
          prerequisites: getPrerequisitesForDimension(dimension),
          successMetrics: getMetricsForDimension(dimension)
        }
      })
    }
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
}

function mapDimensionToCategory(dimension: string): Recommendation['category'] {
  const categoryMap: Record<string, Recommendation['category']> = {
    leadership_vision: 'strategy',
    strategy_alignment: 'strategy',
    change_management: 'culture',
    skills_talent: 'training',
    cultural_readiness: 'culture',
    learning_development: 'training',
    psychological_safety: 'culture',
    champion_network: 'culture',
    data_infrastructure: 'infrastructure',
    technology_stack: 'tools',
    integration_capability: 'infrastructure',
    ai_use_cases: 'process',
    process_automation: 'process',
    ai_governance: 'governance',
    ethics_responsibility: 'governance',
    risk_management: 'governance',
    roi_measurement: 'process'
  }
  return categoryMap[dimension] || 'strategy'
}

function getResourcesForDimension(dimension: string): string[] {
  const resources: Record<string, string[]> = {
    strategy_alignment: ['Executive sponsor', 'Strategy team', 'External consultant'],
    ai_governance: ['Legal/compliance', 'IT leadership', 'Ethics committee'],
    skills_talent: ['L&D team', 'Training budget', 'External trainers'],
    default: ['Leadership time', 'Budget allocation', 'Change management']
  }
  return resources[dimension] || resources.default
}

function getPrerequisitesForDimension(dimension: string): string[] {
  const prereqs: Record<string, string[]> = {
    strategy_alignment: ['Leadership buy-in', 'Budget approval'],
    ai_governance: ['Policy framework', 'Stakeholder agreement'],
    skills_talent: ['Training program design', 'Time allocation'],
    default: ['Stakeholder alignment', 'Resource allocation']
  }
  return prereqs[dimension] || prereqs.default
}

function getMetricsForDimension(dimension: string): string[] {
  const metrics: Record<string, string[]> = {
    strategy_alignment: ['Documented AI strategy', 'Quarterly reviews', 'Budget tracking'],
    ai_governance: ['Policy adoption rate', 'Compliance score', 'Incident tracking'],
    skills_talent: ['Training completion rate', 'Skill assessment scores', 'Tool adoption rate'],
    default: ['Score improvement', 'Adoption metrics', 'Stakeholder feedback']
  }
  return metrics[dimension] || metrics.default
}

// ============================================================================
// EXECUTIVE SUMMARY GENERATION
// ============================================================================

function generateExecutiveSummary(results: Omit<AnalysisResults, 'executiveSummary'>): string {
  const {
    transcriptCount,
    overallMaturity,
    overallConfidence,
    dimensionScores,
    themes,
    champions,
    realityGaps,
    gapSummary
  } = results

  // Find strongest and weakest dimensions
  const sortedDimensions = Object.entries(dimensionScores)
    .sort((a, b) => b[1].score - a[1].score)

  const strongest = sortedDimensions[0]
  const weakest = sortedDimensions[sortedDimensions.length - 1]

  // Top themes
  const topThemes = themes.slice(0, 3).map(t => t.name.toLowerCase()).join(', ')

  // Critical issues
  const criticalCount = realityGaps.filter(g => g.severity === 'critical').length

  return `
## Executive Summary: ${results.organizationName} AI Maturity Assessment

### Overall Assessment
Based on LLM-powered analysis of ${transcriptCount} C-suite interviews, ${results.organizationName} demonstrates **Level ${Math.round(overallMaturity)} AI Maturity** (${overallMaturity.toFixed(1)}/10) with ${(overallConfidence * 100).toFixed(0)}% confidence.

### Key Findings

**Strengths:**
- ${strongest[0].replace(/_/g, ' ')}: ${strongest[1].score.toFixed(1)}/10
- ${champions.length} identified AI champion${champions.length !== 1 ? 's' : ''}: ${champions.slice(0, 3).map(c => c.name).join(', ')}

**Critical Gaps:**
- ${weakest[0].replace(/_/g, ' ')}: ${weakest[1].score.toFixed(1)}/10
- ${criticalCount} critical reality gap${criticalCount !== 1 ? 's' : ''} identified
- Overall perception-reality alignment: ${gapSummary.overallAlignment.toFixed(0)}%

**Dominant Themes:**
${topThemes}

### Immediate Priorities
1. **Formalize AI Strategy** - Move from discussion to documented roadmap with budget
2. **Establish Governance** - Define accountability, policies, and ethical guidelines
3. **Targeted Upskilling** - Leverage champions to train broader team
4. **Measure ROI** - Implement tracking for AI investments

### Reality Check
${gapSummary.overestimationCount > gapSummary.underestimationCount
  ? `The organization tends to **overestimate** its AI capabilities. Leadership perception exceeds evidence by an average of ${gapSummary.averageGapSize.toFixed(1)} points.`
  : `The organization has a realistic view of its AI capabilities, with perception closely matching evidence.`
}

---
*Analysis powered by Claude LLM • ${new Date().toISOString().split('T')[0]}*
`.trim()
}

// ============================================================================
// MAIN PIPELINE
// ============================================================================

async function runAnalysisPipeline(): Promise<AnalysisResults> {
  console.log('\n' + '='.repeat(60))
  console.log('GLUEIQ TRANSCRIPT ANALYSIS PIPELINE v2')
  console.log('LLM-Powered Analysis with Claude')
  console.log('='.repeat(60))
  console.log(`Organization: ${GLUEIQ_ORG.name}`)
  console.log(`Industry: ${GLUEIQ_ORG.industry}`)
  console.log(`Started: ${new Date().toISOString()}`)
  console.log('='.repeat(60))

  // 1. Load transcripts
  const transcripts = await loadTranscripts()
  if (transcripts.length === 0) {
    throw new Error('No transcripts found!')
  }

  // 2. Run LLM-powered dimension scoring
  console.log('\n' + '='.repeat(60))
  console.log('[1/5] LLM DIMENSION SCORING')
  console.log('='.repeat(60))
  const dimensionScores = await scoreAllDimensions(transcripts)

  // Calculate overall maturity
  const scores = Object.values(dimensionScores)
  const overallMaturity = scores.reduce((sum, s) => sum + s.score, 0) / scores.length
  const overallConfidence = scores.reduce((sum, s) => sum + s.confidence, 0) / scores.length

  // 3. Discover themes
  console.log('\n' + '='.repeat(60))
  console.log('[2/5] THEME DISCOVERY')
  console.log('='.repeat(60))
  const themes = await discoverThemes(transcripts)

  // 4. Validate skill profiles
  console.log('\n' + '='.repeat(60))
  console.log('[3/5] SKILL ASSESSMENT VALIDATION')
  console.log('='.repeat(60))
  const skillProfiles = await validateSkillAssessments(transcripts)
  const champions = skillProfiles.filter(p => p.isChampion)

  // 5. Detect reality gaps
  console.log('\n' + '='.repeat(60))
  console.log('[4/5] REALITY GAP DETECTION')
  console.log('='.repeat(60))
  const { gaps: realityGaps, summary: gapSummary } = await detectRealityGaps(
    transcripts,
    dimensionScores
  )

  // 6. Generate recommendations
  console.log('\n' + '='.repeat(60))
  console.log('[5/5] GENERATING RECOMMENDATIONS')
  console.log('='.repeat(60))
  const recommendations = generateRecommendations(dimensionScores, realityGaps, themes)

  // Build results object
  const resultsWithoutSummary = {
    organizationId: GLUEIQ_ORG.id,
    organizationName: GLUEIQ_ORG.name,
    transcriptCount: transcripts.length,
    analysisTimestamp: new Date(),
    dimensionScores,
    overallMaturity,
    overallConfidence,
    themes,
    skillProfiles,
    champions,
    realityGaps,
    gapSummary,
    recommendations
  }

  // Generate executive summary
  const executiveSummary = generateExecutiveSummary(resultsWithoutSummary)

  const results: AnalysisResults = {
    ...resultsWithoutSummary,
    executiveSummary
  }

  return results
}

// ============================================================================
// OUTPUT
// ============================================================================

async function saveResults(results: AnalysisResults) {
  console.log('\n' + '='.repeat(60))
  console.log('SAVING RESULTS')
  console.log('='.repeat(60))

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  // Save to JSON files (backup)
  const fullResultsPath = path.join(OUTPUT_DIR, 'analysis-results-v2.json')
  fs.writeFileSync(fullResultsPath, JSON.stringify(results, null, 2))
  console.log(`  [JSON] ${fullResultsPath}`)

  // Save to Supabase
  console.log('\n  Saving to Supabase...')
  try {
    await saveAssessmentResults(results)
    console.log('  [DB] Saved to Supabase successfully')
  } catch (error) {
    console.error('  [DB ERROR] Failed to save to Supabase:', error)
    console.log('  [FALLBACK] JSON files saved successfully')
  }
}

function printSummary(results: AnalysisResults) {
  console.log('\n' + '='.repeat(60))
  console.log('ANALYSIS COMPLETE')
  console.log('='.repeat(60))

  console.log(`\nOverall Maturity: ${results.overallMaturity.toFixed(1)}/10`)
  console.log(`Confidence: ${(results.overallConfidence * 100).toFixed(0)}%`)
  console.log(`Themes Discovered: ${results.themes.length}`)
  console.log(`AI Champions: ${results.champions.length}`)
  console.log(`Reality Gaps: ${results.realityGaps.length}`)
  console.log(`Recommendations: ${results.recommendations.length}`)

  console.log('\n' + '='.repeat(60))
  console.log('EXECUTIVE SUMMARY')
  console.log('='.repeat(60))
  console.log(results.executiveSummary)
}

// ============================================================================
// ENTRY POINT
// ============================================================================

async function main() {
  try {
    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ERROR: ANTHROPIC_API_KEY environment variable not set')
      console.log('Set it with: export ANTHROPIC_API_KEY=your-key-here')
      process.exit(1)
    }

    // Run pipeline
    const results = await runAnalysisPipeline()

    // Print summary
    printSummary(results)

    // Save results
    await saveResults(results)

    console.log('\n' + '='.repeat(60))
    console.log('PIPELINE COMPLETE')
    console.log('='.repeat(60))
    console.log(`Completed: ${new Date().toISOString()}`)
    console.log(`Results saved to: ${OUTPUT_DIR}`)

  } catch (error) {
    console.error('\nPIPELINE FAILED:', error)
    process.exit(1)
  }
}

main()
