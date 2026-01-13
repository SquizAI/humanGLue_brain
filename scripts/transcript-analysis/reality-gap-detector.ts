/**
 * Reality Gap Detector
 *
 * Automatic detection of perception vs reality gaps in interview transcripts.
 * Uses Claude to analyze discrepancies between what people believe/say and
 * what the evidence actually shows.
 *
 * Gap Types Detected:
 * - Aspiration vs Reality: "We want to be AI-first" but no plan/budget/action
 * - Reputation vs Capability: "We're known for AI" but low actual usage
 * - Leadership vs Execution: Leaders committed but team not using
 * - Talk vs Action: Discuss AI a lot but no measurable outcomes
 * - Perception vs Evidence: "We're advanced" but evidence shows basic usage
 */

import Anthropic from '@anthropic-ai/sdk'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface GapSource {
  type: 'quote' | 'observation' | 'absence'
  content: string
  speaker?: string
  confidence: number
}

export interface RealityGap {
  id: string
  dimension: string
  dimensionName: string
  aspect: string
  description: string
  perceptionScore: number
  evidenceScore: number
  gapSize: number
  gapDirection: 'overestimation' | 'underestimation' | 'aligned'
  severity: 'critical' | 'significant' | 'moderate' | 'minor'
  perceptionSources: GapSource[]
  evidenceSources: GapSource[]
  impact: string
  recommendation: string
}

export interface RealityGapSummary {
  totalGaps: number
  criticalGaps: number
  overallAlignment: number // 0-100
  mostMisalignedDimension: string
  averageGapSize: number
  overestimationCount: number
  underestimationCount: number
}

export interface TranscriptInput {
  id: string
  intervieweeName: string
  intervieweeTitle: string
  intervieweeRole: 'c_suite' | 'leadership' | 'manager' | 'individual_contributor'
  organization: string
  content: string
  timestamp?: Date
}

export interface RealityGapAnalysisResult {
  organizationId: string
  organizationName: string
  analysisTimestamp: Date
  transcriptsAnalyzed: number
  gaps: RealityGap[]
  summary: RealityGapSummary
  crossInterviewContradictions: CrossInterviewContradiction[]
  cobblerChildrenScenarios: CobblerChildrenScenario[]
}

export interface CrossInterviewContradiction {
  id: string
  topic: string
  positions: Array<{
    interviewee: string
    title: string
    position: string
    quote: string
  }>
  significance: 'high' | 'medium' | 'low'
  impact: string
}

export interface CobblerChildrenScenario {
  id: string
  description: string
  whatTheySell: string
  whatTheyDo: string
  gap: string
  evidence: GapSource[]
  severity: 'critical' | 'significant' | 'moderate' | 'minor'
}

// ============================================================================
// DIMENSION MAPPINGS (LVNG.AI aligned)
// ============================================================================

const DIMENSION_MAP: Record<string, { name: string; category: string }> = {
  'leadership_vision': { name: 'Leadership Vision', category: 'Strategy & Leadership' },
  'strategy_alignment': { name: 'Strategy Alignment', category: 'Strategy & Leadership' },
  'change_management': { name: 'Change Management', category: 'Strategy & Leadership' },
  'competitive_positioning': { name: 'Competitive Positioning', category: 'Strategy & Leadership' },
  'innovation_capacity': { name: 'Innovation Capacity', category: 'Strategy & Leadership' },
  'skills_talent': { name: 'Skills & Talent', category: 'People & Culture' },
  'cultural_readiness': { name: 'Cultural Readiness', category: 'People & Culture' },
  'learning_development': { name: 'Learning & Development', category: 'People & Culture' },
  'psychological_safety': { name: 'Psychological Safety', category: 'People & Culture' },
  'champion_network': { name: 'Champion Network', category: 'People & Culture' },
  'data_infrastructure': { name: 'Data Infrastructure', category: 'Technology & Data' },
  'technology_stack': { name: 'Technology Stack', category: 'Technology & Data' },
  'integration_capability': { name: 'Integration Capability', category: 'Technology & Data' },
  'security_compliance': { name: 'Security & Compliance', category: 'Technology & Data' },
  'vendor_ecosystem': { name: 'Vendor Ecosystem', category: 'Technology & Data' },
  'ai_use_cases': { name: 'AI Use Cases', category: 'Operations & Processes' },
  'process_automation': { name: 'Process Automation', category: 'Operations & Processes' },
  'operational_excellence': { name: 'Operational Excellence', category: 'Operations & Processes' },
  'customer_experience': { name: 'Customer Experience', category: 'Operations & Processes' },
  'ai_governance': { name: 'AI Governance', category: 'Governance & Risk' },
  'ethics_responsibility': { name: 'Ethics & Responsibility', category: 'Governance & Risk' },
  'risk_management': { name: 'Risk Management', category: 'Governance & Risk' },
  'roi_measurement': { name: 'ROI Measurement', category: 'Governance & Risk' },
}

// ============================================================================
// GAP TYPE DEFINITIONS
// ============================================================================

const GAP_TYPES = {
  ASPIRATION_VS_REALITY: {
    id: 'aspiration_vs_reality',
    name: 'Aspiration vs Reality',
    description: 'Goals and aspirations without concrete plans, budgets, or actions',
    perceptionIndicators: [
      'we want to be', 'we aspire to', 'our goal is', 'we plan to',
      'we\'re going to', 'we should be', 'we need to become',
      'the vision is', 'we\'re committed to', 'it\'s a priority'
    ],
    realityIndicators: [
      'no plan', 'no budget', 'no roadmap', 'haven\'t started',
      'no timeline', 'no resources', 'no owner', 'not formalized',
      'haven\'t allocated', 'no dedicated'
    ]
  },
  REPUTATION_VS_CAPABILITY: {
    id: 'reputation_vs_capability',
    name: 'Reputation vs Capability',
    description: 'External reputation exceeds internal capabilities',
    perceptionIndicators: [
      'we\'re known for', 'our reputation', 'clients come to us for',
      'we\'re leaders in', 'we\'re seen as', 'we position ourselves',
      'we sell', 'we market ourselves', 'our brand'
    ],
    realityIndicators: [
      'not really doing', 'don\'t actually', 'only a few people',
      'basic usage', 'haven\'t implemented', 'experimenting',
      'playing with', 'just starting', 'cobbler\'s children'
    ]
  },
  LEADERSHIP_VS_EXECUTION: {
    id: 'leadership_vs_execution',
    name: 'Leadership vs Execution',
    description: 'Leaders are committed but team is not executing',
    perceptionIndicators: [
      'leadership believes', 'partners are aligned', 'c-suite committed',
      'top-down support', 'executives want', 'board supports',
      'management is behind', 'leadership vision'
    ],
    realityIndicators: [
      'team not using', 'adoption is low', 'resistance', 'not trickling down',
      'middle management', 'employees aren\'t', 'grass roots missing',
      'siloed efforts', 'individual pockets'
    ]
  },
  TALK_VS_ACTION: {
    id: 'talk_vs_action',
    name: 'Talk vs Action',
    description: 'Lots of discussion about AI without measurable outcomes',
    perceptionIndicators: [
      'we talk about', 'we discuss', 'we\'ve been talking',
      'it comes up', 'conversation around', 'dialogue about',
      'we\'re thinking about', 'considering', 'exploring'
    ],
    realityIndicators: [
      'no measurable', 'haven\'t measured', 'no roi', 'no metrics',
      'can\'t quantify', 'no outcomes', 'no results', 'unclear impact',
      'no before and after', 'anecdotal'
    ]
  },
  PERCEPTION_VS_EVIDENCE: {
    id: 'perception_vs_evidence',
    name: 'Perception vs Evidence',
    description: 'Self-perception of advancement doesn\'t match observable evidence',
    perceptionIndicators: [
      'we\'re advanced', 'we\'re ahead', 'we\'re leading',
      'we\'re mature', 'we\'re sophisticated', 'we\'re innovative',
      'cutting edge', 'state of the art', 'best in class'
    ],
    realityIndicators: [
      'basic chatgpt', 'simple queries', 'copy paste', 'standard stuff',
      'just the basics', 'occasional use', 'sporadic', 'informal',
      'ad hoc', 'no standardization'
    ]
  }
}

// ============================================================================
// CLAUDE PROMPTS
// ============================================================================

const SYSTEM_PROMPT = `You are an expert organizational analyst specializing in detecting gaps between perception and reality in corporate interviews about AI adoption.

Your role is to analyze interview transcripts and identify discrepancies where:
1. What people SAY doesn't match what the EVIDENCE shows
2. Aspirations lack supporting plans, budgets, or actions
3. Leadership perceptions differ from ground-level reality
4. Talk about AI is plentiful but measurable outcomes are absent
5. Self-assessment of maturity exceeds observable capabilities

You are ruthlessly honest and evidence-based. You do NOT give credit for intentions, plans, or aspirations - only for demonstrated capabilities and outcomes.

SCORING SCALE (0-10):
- 0-2: No evidence / Actively resistant / Fundamental gaps
- 3-4: Early awareness / Discussion stage / No action
- 5-6: Some progress / Isolated efforts / Inconsistent
- 7-8: Significant progress / Measurable outcomes / Widespread adoption
- 9-10: Industry leading / Fully integrated / Transformational

CRITICAL: A score of 7+ requires EVIDENCE of outcomes, not just activity or intentions.`

const SINGLE_TRANSCRIPT_PROMPT = `Analyze this interview transcript for perception vs reality gaps.

INTERVIEW DETAILS:
- Interviewee: {intervieweeName} ({intervieweeTitle})
- Role Level: {intervieweeRole}
- Organization: {organization}

TRANSCRIPT:
{content}

For each gap you identify, provide:
1. The dimension affected (from the LVNG.AI framework)
2. What the person PERCEIVES/SAYS (with direct quotes)
3. What the EVIDENCE actually shows (with supporting quotes or notable absences)
4. Perception score (0-10)
5. Evidence score (0-10)
6. Gap severity (critical/significant/moderate/minor)
7. Business impact
8. Recommended action

Look specifically for:
- Aspirational statements without plans ("We want to be AI-first" but no roadmap)
- Reputation claims without capability ("We're known for AI" but limited usage)
- Leadership commitment without execution (Leaders say yes, team says no/maybe)
- Discussion without measurement ("We talk about AI a lot" but no ROI tracking)
- Self-perception gaps ("We're advanced" but using basic tools)
- Contradictions within the same interview
- Claims without supporting evidence
- "Cobbler's children" scenarios (selling AI but not using it)

Respond in JSON format:
{
  "gaps": [
    {
      "dimension": "dimension_key",
      "aspect": "specific aspect of the gap",
      "description": "clear description of the gap",
      "perceptionScore": 0-10,
      "evidenceScore": 0-10,
      "perceptionSources": [
        {"type": "quote", "content": "exact quote", "confidence": 0-1}
      ],
      "evidenceSources": [
        {"type": "quote|observation|absence", "content": "evidence", "confidence": 0-1}
      ],
      "severity": "critical|significant|moderate|minor",
      "impact": "business impact description",
      "recommendation": "specific actionable recommendation"
    }
  ],
  "internalContradictions": [
    {
      "topic": "topic of contradiction",
      "statement1": "first contradicting statement",
      "statement2": "second contradicting statement",
      "significance": "high|medium|low"
    }
  ],
  "cobblerChildren": {
    "detected": true|false,
    "whatTheySell": "what they sell/market externally",
    "whatTheyDo": "what they actually do internally",
    "evidence": "supporting evidence"
  }
}`

const CROSS_INTERVIEW_PROMPT = `Analyze these multiple interview transcripts from the same organization to identify:

1. CONTRADICTIONS between different interviewees
2. PATTERN gaps that appear across multiple interviews
3. LEADERSHIP vs TEAM perception differences
4. AGGREGATE reality gaps for the organization

TRANSCRIPTS:
{transcripts}

For each cross-interview finding, identify:
1. The topic of disagreement/gap
2. Who said what (with quotes)
3. The significance of the discrepancy
4. Which perspective is likely more accurate (and why)
5. The organizational impact

Respond in JSON format:
{
  "crossInterviewContradictions": [
    {
      "topic": "topic",
      "positions": [
        {"interviewee": "name", "title": "title", "position": "their view", "quote": "exact quote"}
      ],
      "significance": "high|medium|low",
      "likelyReality": "assessment of actual situation",
      "impact": "organizational impact"
    }
  ],
  "patternGaps": [
    {
      "dimension": "dimension_key",
      "description": "pattern description",
      "frequency": "how many interviewees showed this",
      "severity": "critical|significant|moderate|minor",
      "aggregatePerceptionScore": 0-10,
      "aggregateEvidenceScore": 0-10
    }
  ],
  "leadershipVsTeamGaps": [
    {
      "topic": "topic",
      "leadershipView": "what leaders say",
      "teamView": "what team/lower levels say",
      "gapSize": 0-10,
      "impact": "impact description"
    }
  ],
  "cobblerChildrenPatterns": [
    {
      "description": "pattern description",
      "whatTheySell": "external positioning",
      "whatTheyDo": "internal reality",
      "evidenceCount": number,
      "severity": "critical|significant|moderate|minor"
    }
  ]
}`

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateGapId(dimension: string, aspect: string): string {
  return `gap_${dimension}_${aspect.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`
}

function calculateGapDirection(perception: number, evidence: number): 'overestimation' | 'underestimation' | 'aligned' {
  const gap = perception - evidence
  if (Math.abs(gap) <= 1) return 'aligned'
  return gap > 0 ? 'overestimation' : 'underestimation'
}

function calculateSeverity(gapSize: number): 'critical' | 'significant' | 'moderate' | 'minor' {
  const absGap = Math.abs(gapSize)
  if (absGap >= 5) return 'critical'
  if (absGap >= 3) return 'significant'
  if (absGap >= 2) return 'moderate'
  return 'minor'
}

function calculateOverallAlignment(gaps: RealityGap[]): number {
  if (gaps.length === 0) return 100
  const avgGapSize = gaps.reduce((sum, g) => sum + Math.abs(g.gapSize), 0) / gaps.length
  // Convert gap size (0-10 scale) to alignment (0-100 scale)
  // 0 gap = 100% aligned, 10 gap = 0% aligned
  return Math.max(0, Math.round(100 - (avgGapSize * 10)))
}

function findMostMisalignedDimension(gaps: RealityGap[]): string {
  if (gaps.length === 0) return 'none'

  const dimensionGaps: Record<string, number[]> = {}
  for (const gap of gaps) {
    const existing = dimensionGaps[gap.dimension] || []
    existing.push(Math.abs(gap.gapSize))
    dimensionGaps[gap.dimension] = existing
  }

  let maxAvg = 0
  let maxDimension = 'none'
  for (const dim of Object.keys(dimensionGaps)) {
    const sizes = dimensionGaps[dim]
    const avg = sizes.reduce((a, b) => a + b, 0) / sizes.length
    if (avg > maxAvg) {
      maxAvg = avg
      maxDimension = dim
    }
  }

  return maxDimension
}

// ============================================================================
// LOGGING
// ============================================================================

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}

let currentLogLevel: LogLevel = 'info'

function setLogLevel(level: LogLevel): void {
  currentLogLevel = level
}

function log(level: LogLevel, message: string, data?: unknown): void {
  if (LOG_LEVELS[level] >= LOG_LEVELS[currentLogLevel]) {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`
    if (data) {
      console.log(`${prefix} ${message}`, data)
    } else {
      console.log(`${prefix} ${message}`)
    }
  }
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

export interface DetectRealityGapsOptions {
  apiKey?: string
  model?: string
  maxTokens?: number
  temperature?: number
  logLevel?: LogLevel
}

export async function detectRealityGaps(
  transcripts: TranscriptInput[],
  organizationName: string,
  options: DetectRealityGapsOptions = {}
): Promise<RealityGapAnalysisResult> {
  const {
    apiKey = process.env.ANTHROPIC_API_KEY,
    model = 'claude-sonnet-4-20250514',
    maxTokens = 8192,
    temperature = 0.3,
    logLevel = 'info'
  } = options

  setLogLevel(logLevel)

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required')
  }

  const anthropic = new Anthropic({ apiKey })

  log('info', `Starting reality gap analysis for ${organizationName}`)
  log('info', `Analyzing ${transcripts.length} transcripts`)

  const allGaps: RealityGap[] = []
  const allContradictions: CrossInterviewContradiction[] = []
  const allCobblerScenarios: CobblerChildrenScenario[] = []

  // ============================================================================
  // PHASE 1: Analyze each transcript individually
  // ============================================================================

  log('info', 'Phase 1: Individual transcript analysis')

  for (const transcript of transcripts) {
    log('debug', `Analyzing transcript: ${transcript.intervieweeName}`)

    try {
      const prompt = SINGLE_TRANSCRIPT_PROMPT
        .replace('{intervieweeName}', transcript.intervieweeName)
        .replace('{intervieweeTitle}', transcript.intervieweeTitle)
        .replace('{intervieweeRole}', transcript.intervieweeRole)
        .replace('{organization}', transcript.organization)
        .replace('{content}', transcript.content.slice(0, 50000)) // Limit content size

      const response = await anthropic.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }]
      })

      const textContent = response.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n')

      // Parse JSON response
      const jsonMatch = textContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])

        // Process gaps
        if (parsed.gaps && Array.isArray(parsed.gaps)) {
          for (const gap of parsed.gaps) {
            const gapSize = gap.perceptionScore - gap.evidenceScore
            const processedGap: RealityGap = {
              id: generateGapId(gap.dimension, gap.aspect),
              dimension: gap.dimension,
              dimensionName: DIMENSION_MAP[gap.dimension]?.name || gap.dimension,
              aspect: gap.aspect,
              description: gap.description,
              perceptionScore: gap.perceptionScore,
              evidenceScore: gap.evidenceScore,
              gapSize,
              gapDirection: calculateGapDirection(gap.perceptionScore, gap.evidenceScore),
              severity: gap.severity || calculateSeverity(gapSize),
              perceptionSources: (gap.perceptionSources || []).map((s: GapSource) => ({
                ...s,
                speaker: transcript.intervieweeName
              })),
              evidenceSources: (gap.evidenceSources || []).map((s: GapSource) => ({
                ...s,
                speaker: transcript.intervieweeName
              })),
              impact: gap.impact,
              recommendation: gap.recommendation
            }
            allGaps.push(processedGap)
          }
        }

        // Process cobbler's children scenarios
        if (parsed.cobblerChildren?.detected) {
          allCobblerScenarios.push({
            id: `cobbler_${transcript.id}_${Date.now()}`,
            description: `${transcript.intervieweeName}: Cobbler's children scenario detected`,
            whatTheySell: parsed.cobblerChildren.whatTheySell,
            whatTheyDo: parsed.cobblerChildren.whatTheyDo,
            gap: `External: ${parsed.cobblerChildren.whatTheySell} vs Internal: ${parsed.cobblerChildren.whatTheyDo}`,
            evidence: [{
              type: 'observation',
              content: parsed.cobblerChildren.evidence,
              speaker: transcript.intervieweeName,
              confidence: 0.8
            }],
            severity: 'significant'
          })
        }
      }

      log('debug', `Completed analysis for ${transcript.intervieweeName}`)

    } catch (error) {
      log('error', `Failed to analyze transcript ${transcript.intervieweeName}`, error)
    }
  }

  // ============================================================================
  // PHASE 2: Cross-interview analysis (if multiple transcripts)
  // ============================================================================

  if (transcripts.length > 1) {
    log('info', 'Phase 2: Cross-interview analysis')

    try {
      // Prepare summarized transcripts for cross-analysis
      const transcriptSummaries = transcripts.map(t => ({
        interviewee: t.intervieweeName,
        title: t.intervieweeTitle,
        role: t.intervieweeRole,
        // Include key excerpts rather than full transcripts
        excerpts: t.content.slice(0, 10000)
      }))

      const crossPrompt = CROSS_INTERVIEW_PROMPT
        .replace('{transcripts}', JSON.stringify(transcriptSummaries, null, 2))

      const response = await anthropic.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: crossPrompt }]
      })

      const textContent = response.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n')

      // Parse JSON response
      const jsonMatch = textContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])

        // Process cross-interview contradictions
        if (parsed.crossInterviewContradictions && Array.isArray(parsed.crossInterviewContradictions)) {
          for (const contradiction of parsed.crossInterviewContradictions) {
            allContradictions.push({
              id: `contradiction_${Date.now()}_${Math.random().toString(36).slice(2)}`,
              topic: contradiction.topic,
              positions: contradiction.positions,
              significance: contradiction.significance,
              impact: contradiction.impact
            })
          }
        }

        // Process cobbler's children patterns
        if (parsed.cobblerChildrenPatterns && Array.isArray(parsed.cobblerChildrenPatterns)) {
          for (const pattern of parsed.cobblerChildrenPatterns) {
            allCobblerScenarios.push({
              id: `cobbler_pattern_${Date.now()}_${Math.random().toString(36).slice(2)}`,
              description: pattern.description,
              whatTheySell: pattern.whatTheySell,
              whatTheyDo: pattern.whatTheyDo,
              gap: `Sells: ${pattern.whatTheySell}, Does: ${pattern.whatTheyDo}`,
              evidence: [{
                type: 'observation',
                content: `Pattern observed across ${pattern.evidenceCount} interviews`,
                confidence: 0.9
              }],
              severity: pattern.severity
            })
          }
        }
      }

      log('debug', 'Completed cross-interview analysis')

    } catch (error) {
      log('error', 'Failed to perform cross-interview analysis', error)
    }
  }

  // ============================================================================
  // PHASE 3: Generate summary
  // ============================================================================

  log('info', 'Phase 3: Generating summary')

  const summary: RealityGapSummary = {
    totalGaps: allGaps.length,
    criticalGaps: allGaps.filter(g => g.severity === 'critical').length,
    overallAlignment: calculateOverallAlignment(allGaps),
    mostMisalignedDimension: findMostMisalignedDimension(allGaps),
    averageGapSize: allGaps.length > 0
      ? allGaps.reduce((sum, g) => sum + Math.abs(g.gapSize), 0) / allGaps.length
      : 0,
    overestimationCount: allGaps.filter(g => g.gapDirection === 'overestimation').length,
    underestimationCount: allGaps.filter(g => g.gapDirection === 'underestimation').length
  }

  // Sort gaps by severity and size
  allGaps.sort((a, b) => {
    const severityOrder = { critical: 0, significant: 1, moderate: 2, minor: 3 }
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity]
    }
    return Math.abs(b.gapSize) - Math.abs(a.gapSize)
  })

  log('info', `Analysis complete: ${allGaps.length} gaps, ${allContradictions.length} contradictions, ${allCobblerScenarios.length} cobbler scenarios`)

  return {
    organizationId: transcripts[0]?.organization?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
    organizationName,
    analysisTimestamp: new Date(),
    transcriptsAnalyzed: transcripts.length,
    gaps: allGaps,
    summary,
    crossInterviewContradictions: allContradictions,
    cobblerChildrenScenarios: allCobblerScenarios
  }
}

// ============================================================================
// RULE-BASED PRE-ANALYSIS (No API calls)
// ============================================================================

/**
 * Perform quick rule-based gap detection without API calls.
 * Useful for initial screening or when API quota is limited.
 */
export function detectRealityGapsRuleBased(
  transcripts: TranscriptInput[],
  organizationName: string
): Partial<RealityGapAnalysisResult> {
  const gaps: RealityGap[] = []

  for (const transcript of transcripts) {
    const contentLower = transcript.content.toLowerCase()

    for (const [gapTypeKey, gapType] of Object.entries(GAP_TYPES)) {
      const perceptionMatches: string[] = []
      const realityMatches: string[] = []

      // Find perception indicators
      for (const indicator of gapType.perceptionIndicators) {
        const regex = new RegExp(`[^.!?]*${indicator}[^.!?]*[.!?]`, 'gi')
        const matches = transcript.content.match(regex) || []
        perceptionMatches.push(...matches.slice(0, 2))
      }

      // Find reality indicators
      for (const indicator of gapType.realityIndicators) {
        const regex = new RegExp(`[^.!?]*${indicator}[^.!?]*[.!?]`, 'gi')
        const matches = transcript.content.match(regex) || []
        realityMatches.push(...matches.slice(0, 2))
      }

      // If we have both perception and reality indicators, we likely have a gap
      if (perceptionMatches.length > 0 && realityMatches.length > 0) {
        const perceptionScore = Math.min(7, 5 + perceptionMatches.length)
        const evidenceScore = Math.max(1, 4 - realityMatches.length)
        const gapSize = perceptionScore - evidenceScore

        // Map gap type to dimension
        const dimensionMap: Record<string, string> = {
          'aspiration_vs_reality': 'strategy_alignment',
          'reputation_vs_capability': 'ai_use_cases',
          'leadership_vs_execution': 'change_management',
          'talk_vs_action': 'roi_measurement',
          'perception_vs_evidence': 'skills_talent'
        }

        const dimension = dimensionMap[gapType.id] || 'strategy_alignment'

        gaps.push({
          id: generateGapId(dimension, gapType.name),
          dimension,
          dimensionName: DIMENSION_MAP[dimension]?.name || dimension,
          aspect: gapType.name,
          description: `${gapType.description} - detected via rule-based analysis`,
          perceptionScore,
          evidenceScore,
          gapSize,
          gapDirection: calculateGapDirection(perceptionScore, evidenceScore),
          severity: calculateSeverity(gapSize),
          perceptionSources: perceptionMatches.slice(0, 2).map(m => ({
            type: 'quote' as const,
            content: m.trim().slice(0, 200),
            speaker: transcript.intervieweeName,
            confidence: 0.7
          })),
          evidenceSources: realityMatches.slice(0, 2).map(m => ({
            type: 'quote' as const,
            content: m.trim().slice(0, 200),
            speaker: transcript.intervieweeName,
            confidence: 0.7
          })),
          impact: `Potential ${gapType.name.toLowerCase()} gap affecting ${DIMENSION_MAP[dimension]?.category || 'organization'}`,
          recommendation: `Investigate the gap between ${gapType.perceptionIndicators[0]} and ${gapType.realityIndicators[0]}`
        })
      }
    }
  }

  return {
    organizationId: transcripts[0]?.organization?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
    organizationName,
    analysisTimestamp: new Date(),
    transcriptsAnalyzed: transcripts.length,
    gaps,
    summary: {
      totalGaps: gaps.length,
      criticalGaps: gaps.filter(g => g.severity === 'critical').length,
      overallAlignment: calculateOverallAlignment(gaps),
      mostMisalignedDimension: findMostMisalignedDimension(gaps),
      averageGapSize: gaps.length > 0 ? gaps.reduce((sum, g) => sum + Math.abs(g.gapSize), 0) / gaps.length : 0,
      overestimationCount: gaps.filter(g => g.gapDirection === 'overestimation').length,
      underestimationCount: gaps.filter(g => g.gapDirection === 'underestimation').length
    },
    crossInterviewContradictions: [],
    cobblerChildrenScenarios: []
  }
}

// ============================================================================
// CLI ENTRYPOINT
// ============================================================================

async function main() {
  const args = process.argv.slice(2)

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Reality Gap Detector - Analyze interview transcripts for perception vs reality gaps

Usage:
  npx ts-node reality-gap-detector.ts [options] <transcript-files...>

Options:
  --org <name>       Organization name (required)
  --output <file>    Output file path (default: stdout)
  --rule-based       Use rule-based analysis (no API calls)
  --log-level <lvl>  Log level: debug, info, warn, error (default: info)
  --help, -h         Show this help message

Environment Variables:
  ANTHROPIC_API_KEY  Required for Claude-based analysis

Examples:
  # Analyze transcripts with Claude
  npx ts-node reality-gap-detector.ts --org "GlueIQ" transcript1.md transcript2.md

  # Rule-based analysis (no API)
  npx ts-node reality-gap-detector.ts --rule-based --org "GlueIQ" *.md

  # Save to file
  npx ts-node reality-gap-detector.ts --org "GlueIQ" --output results.json *.md
`)
    process.exit(0)
  }

  // Parse arguments
  let orgName = ''
  let outputFile = ''
  let ruleBasedOnly = false
  let logLevel: LogLevel = 'info'
  const transcriptFiles: string[] = []

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--org' && args[i + 1]) {
      orgName = args[++i]
    } else if (args[i] === '--output' && args[i + 1]) {
      outputFile = args[++i]
    } else if (args[i] === '--rule-based') {
      ruleBasedOnly = true
    } else if (args[i] === '--log-level' && args[i + 1]) {
      logLevel = args[++i] as LogLevel
    } else if (!args[i].startsWith('--')) {
      transcriptFiles.push(args[i])
    }
  }

  if (!orgName) {
    console.error('Error: --org <name> is required')
    process.exit(1)
  }

  if (transcriptFiles.length === 0) {
    console.error('Error: At least one transcript file is required')
    process.exit(1)
  }

  // Load transcripts
  const fs = await import('fs')
  const path = await import('path')

  const transcripts: TranscriptInput[] = []
  for (const file of transcriptFiles) {
    try {
      const content = fs.readFileSync(file, 'utf-8')
      const basename = path.basename(file, path.extname(file))

      transcripts.push({
        id: basename.toLowerCase().replace(/\s+/g, '-'),
        intervieweeName: basename,
        intervieweeTitle: 'Unknown',
        intervieweeRole: 'leadership',
        organization: orgName,
        content
      })
    } catch (error) {
      console.error(`Warning: Could not read ${file}:`, error)
    }
  }

  if (transcripts.length === 0) {
    console.error('Error: No valid transcripts loaded')
    process.exit(1)
  }

  // Run analysis
  let result: Partial<RealityGapAnalysisResult>

  if (ruleBasedOnly) {
    result = detectRealityGapsRuleBased(transcripts, orgName)
  } else {
    result = await detectRealityGaps(transcripts, orgName, { logLevel })
  }

  // Output results
  const output = JSON.stringify(result, null, 2)

  if (outputFile) {
    fs.writeFileSync(outputFile, output)
    console.log(`Results saved to: ${outputFile}`)
  } else {
    console.log(output)
  }
}

// Run if called directly
// Note: This check works when running with ts-node or node
const isMainModule = typeof require !== 'undefined' && require.main === module

if (isMainModule) {
  main().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}
