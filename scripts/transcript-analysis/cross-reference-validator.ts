#!/usr/bin/env ts-node
/**
 * Cross-Reference Validator for Skill Assessments
 *
 * This module validates AI skill assessments by cross-referencing
 * self-assessments with peer assessments from transcript data.
 *
 * Usage:
 *   import { validateSkillAssessments, extractSelfAssessment, extractPeerAssessments } from './cross-reference-validator'
 */

import Anthropic from '@anthropic-ai/sdk'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PeerMention {
  mentionedBy: string
  context: string
  sentiment: 'positive' | 'negative' | 'neutral'
  skillsAttributed: string[]
}

export interface ValidatedSkillProfile {
  name: string
  title: string
  department: string
  selfAssessedLevel: number // -2 to 10
  peerAssessedLevel: number | null
  validatedLevel: number
  discrepancy: 'self_underestimate' | 'self_overestimate' | 'aligned' | 'unknown'
  confidence: number
  toolsUsed: string[]
  frequency: 'daily' | 'weekly' | 'occasionally' | 'rarely' | 'never'
  isChampion: boolean
  championScore: number // 0-100
  selfEvidence: string[]
  peerEvidence: PeerMention[]
  growthPotential: 'high' | 'medium' | 'low'
}

export interface SelfAssessment {
  name: string
  title: string
  department: string
  skillLevel: number // -2 to 10
  toolsClaimed: string[]
  frequencyClaimed: 'daily' | 'weekly' | 'occasionally' | 'rarely' | 'never'
  hedgingDetected: boolean
  hedgingPhrases: string[]
  evidence: string[]
  confidence: number
}

export interface PeerAssessment {
  subjectName: string
  mentionedBy: string
  sentiment: 'positive' | 'negative' | 'neutral'
  skillsAttributed: string[]
  context: string
  impliedLevel: number | null // -2 to 10, null if unclear
}

export interface TranscriptWithSpeaker {
  speakerName: string
  speakerTitle: string
  speakerDepartment: string
  content: string
  organization: string
  timestamp: Date
}

export interface ValidationResult {
  profiles: ValidatedSkillProfile[]
  champions: ValidatedSkillProfile[]
  discrepancySummary: {
    selfUnderestimates: number
    selfOverestimates: number
    aligned: number
    unknown: number
  }
  overallConfidence: number
}

// ============================================================================
// ANTHROPIC CLIENT
// ============================================================================

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set')
  }
  return new Anthropic({ apiKey })
}

// ============================================================================
// SELF-ASSESSMENT EXTRACTION
// ============================================================================

/**
 * Extract self-assessment from a transcript where the speaker talks about their own AI usage
 */
export async function extractSelfAssessment(
  transcript: TranscriptWithSpeaker
): Promise<SelfAssessment> {
  const client = getAnthropicClient()

  const prompt = `Analyze this interview transcript and extract the speaker's self-assessment of their AI skills and usage.

SPEAKER: ${transcript.speakerName}
TITLE: ${transcript.speakerTitle}
DEPARTMENT: ${transcript.speakerDepartment}

TRANSCRIPT:
${transcript.content}

Analyze ONLY statements where ${transcript.speakerName} talks about THEIR OWN AI usage, skills, and capabilities.

Respond in JSON format:
{
  "skillLevel": <number from -2 to 10 based on this scale:
    -2: Actively resistant/hostile to AI
    -1: Skeptical, reluctant to engage
    0: Basic awareness, occasional simple use (ChatGPT for Q&A)
    1: Curious, exploring multiple tools, regular but basic usage
    2: Experimenting, integrating AI into workflows
    3: Building agents, measuring ROI
    4: Multi-agent orchestration
    5: Department-wide AI integration
    6-10: Enterprise-level and beyond>,
  "toolsClaimed": [<list of specific AI tools they say they use>],
  "frequencyClaimed": "<daily|weekly|occasionally|rarely|never>",
  "hedgingDetected": <true if they use qualifying language>,
  "hedgingPhrases": [<specific phrases like "just basics", "playing with", "trying to figure out">],
  "evidence": [<up to 5 direct quotes showing their self-assessment>],
  "confidence": <0-1 how confident you are in this assessment>
}

Be STRICT in scoring:
- "Standard stuff", "just basics", "simple questions" = Level 0 max
- "Playing with", "experimenting", "trying out" = Level 1 max
- Daily ChatGPT use alone does NOT equal Level 2+
- Level 2+ requires demonstrated workflow integration or automation
- Level 3+ requires agents or measurable ROI`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    // Extract JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const parsed = JSON.parse(jsonMatch[0])

    return {
      name: transcript.speakerName,
      title: transcript.speakerTitle,
      department: transcript.speakerDepartment,
      skillLevel: Math.max(-2, Math.min(10, parsed.skillLevel ?? 0)),
      toolsClaimed: parsed.toolsClaimed ?? [],
      frequencyClaimed: parsed.frequencyClaimed ?? 'occasionally',
      hedgingDetected: parsed.hedgingDetected ?? false,
      hedgingPhrases: parsed.hedgingPhrases ?? [],
      evidence: parsed.evidence ?? [],
      confidence: Math.max(0, Math.min(1, parsed.confidence ?? 0.5))
    }
  } catch (error) {
    console.error(`Error extracting self-assessment for ${transcript.speakerName}:`, error)

    // Return a default assessment on error
    return {
      name: transcript.speakerName,
      title: transcript.speakerTitle,
      department: transcript.speakerDepartment,
      skillLevel: 0,
      toolsClaimed: [],
      frequencyClaimed: 'occasionally',
      hedgingDetected: false,
      hedgingPhrases: [],
      evidence: [],
      confidence: 0
    }
  }
}

// ============================================================================
// PEER ASSESSMENT EXTRACTION
// ============================================================================

/**
 * Extract peer assessments - what speakers say about OTHER people's AI skills
 */
export async function extractPeerAssessments(
  transcripts: TranscriptWithSpeaker[],
  knownPeople: string[]
): Promise<PeerAssessment[]> {
  const client = getAnthropicClient()
  const allAssessments: PeerAssessment[] = []

  for (const transcript of transcripts) {
    // Filter out the current speaker from the list of people to look for
    const otherPeople = knownPeople.filter(
      name => name.toLowerCase() !== transcript.speakerName.toLowerCase()
    )

    if (otherPeople.length === 0) continue

    const prompt = `Analyze this interview transcript and find any mentions of OTHER people's AI skills or capabilities.

SPEAKER: ${transcript.speakerName} (ignore any self-references)
LOOKING FOR MENTIONS OF: ${otherPeople.join(', ')}

TRANSCRIPT:
${transcript.content}

Find statements where ${transcript.speakerName} talks about any of these people's AI skills, capabilities, or AI usage patterns.

Respond in JSON format:
{
  "mentions": [
    {
      "subjectName": "<name of person being mentioned>",
      "sentiment": "<positive|negative|neutral>",
      "skillsAttributed": [<specific AI skills or capabilities mentioned>],
      "context": "<the exact quote or paraphrase>",
      "impliedLevel": <number -2 to 10 or null if unclear, using same scale:
        -2: Actively hostile
        -1: Skeptical
        0: Basic user
        1: Curious/exploring
        2: Experimenting with workflows
        3: Building agents
        4+: Advanced orchestration>
    }
  ]
}

If no mentions of other people's AI skills are found, return: {"mentions": []}

Look for:
- Direct compliments ("X is really good with AI")
- Comparisons ("X is ahead of us", "X knows more than most")
- Go-to references ("We ask X when we have AI questions")
- Criticisms ("X doesn't use AI", "X is resistant")
- Neutral observations ("X uses ChatGPT for writing")`

    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const content = response.content[0]
      if (content.type !== 'text') continue

      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) continue

      const parsed = JSON.parse(jsonMatch[0])

      for (const mention of parsed.mentions ?? []) {
        allAssessments.push({
          subjectName: mention.subjectName,
          mentionedBy: transcript.speakerName,
          sentiment: mention.sentiment ?? 'neutral',
          skillsAttributed: mention.skillsAttributed ?? [],
          context: mention.context ?? '',
          impliedLevel: mention.impliedLevel
        })
      }
    } catch (error) {
      console.error(`Error extracting peer assessments from ${transcript.speakerName}:`, error)
      // Continue with other transcripts
    }
  }

  return allAssessments
}

// ============================================================================
// DISCREPANCY DETECTION
// ============================================================================

function detectDiscrepancy(
  selfLevel: number,
  peerLevel: number | null
): 'self_underestimate' | 'self_overestimate' | 'aligned' | 'unknown' {
  if (peerLevel === null) {
    return 'unknown'
  }

  const difference = selfLevel - peerLevel

  // Allow for 1 level of variance as "aligned"
  if (Math.abs(difference) <= 1) {
    return 'aligned'
  }

  if (difference < -1) {
    return 'self_underestimate' // Self-assessment is lower than peer assessment
  }

  return 'self_overestimate' // Self-assessment is higher than peer assessment
}

function calculatePeerLevel(peerAssessments: PeerAssessment[]): number | null {
  const validLevels = peerAssessments
    .map(a => a.impliedLevel)
    .filter((level): level is number => level !== null)

  if (validLevels.length === 0) {
    return null
  }

  // Use weighted average: positive mentions get more weight
  let weightedSum = 0
  let totalWeight = 0

  for (const assessment of peerAssessments) {
    if (assessment.impliedLevel === null) continue

    let weight = 1
    if (assessment.sentiment === 'positive') weight = 1.5
    if (assessment.sentiment === 'negative') weight = 1.2

    weightedSum += assessment.impliedLevel * weight
    totalWeight += weight
  }

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight * 10) / 10 : null
}

// ============================================================================
// CHAMPION IDENTIFICATION
// ============================================================================

function calculateChampionScore(
  selfAssessment: SelfAssessment,
  peerAssessments: PeerAssessment[]
): number {
  let score = 0

  // Self-assessment component (up to 30 points)
  // Scale: -2 to 10 mapped to 0-30
  score += Math.max(0, ((selfAssessment.skillLevel + 2) / 12) * 30)

  // Peer mention count (up to 30 points)
  const positiveMentions = peerAssessments.filter(a => a.sentiment === 'positive').length
  const uniqueMentioners = new Set(peerAssessments.map(a => a.mentionedBy)).size
  score += Math.min(30, positiveMentions * 10 + uniqueMentioners * 5)

  // Go-to person indicators (up to 20 points)
  const goToIndicators = ['go-to', 'ask', 'knows', 'expert', 'ahead', 'leads', 'champion']
  for (const assessment of peerAssessments) {
    const contextLower = assessment.context.toLowerCase()
    for (const indicator of goToIndicators) {
      if (contextLower.includes(indicator)) {
        score += 5
        break
      }
    }
  }
  score = Math.min(score, 80) // Cap at 80 so far

  // Frequency bonus (up to 10 points)
  if (selfAssessment.frequencyClaimed === 'daily') score += 10
  else if (selfAssessment.frequencyClaimed === 'weekly') score += 5

  // Tool diversity bonus (up to 10 points)
  score += Math.min(10, selfAssessment.toolsClaimed.length * 2)

  return Math.min(100, Math.max(0, score))
}

function isChampion(championScore: number, peerAssessments: PeerAssessment[]): boolean {
  // Champion criteria:
  // 1. Champion score >= 60
  // 2. At least 2 positive peer mentions from different people
  const positiveMentioners = new Set(
    peerAssessments
      .filter(a => a.sentiment === 'positive')
      .map(a => a.mentionedBy)
  )

  return championScore >= 60 && positiveMentioners.size >= 2
}

// ============================================================================
// VALIDATED LEVEL CALCULATION
// ============================================================================

function calculateValidatedLevel(
  selfLevel: number,
  peerLevel: number | null,
  confidence: number
): number {
  if (peerLevel === null) {
    // No peer data - use self-assessment with reduced confidence
    return selfLevel
  }

  // Weight self vs peer based on confidence and number of peer mentions
  // Higher confidence in self = more weight to self
  // More peer mentions = more weight to peer
  const selfWeight = 0.4 + (confidence * 0.2) // 0.4 to 0.6
  const peerWeight = 1 - selfWeight

  const weighted = selfLevel * selfWeight + peerLevel * peerWeight

  // Round to 1 decimal place
  return Math.round(weighted * 10) / 10
}

// ============================================================================
// GROWTH POTENTIAL ASSESSMENT
// ============================================================================

function assessGrowthPotential(
  validatedLevel: number,
  hedgingDetected: boolean,
  discrepancy: string
): 'high' | 'medium' | 'low' {
  // High potential:
  // - Lower skill levels (0-2) with no resistance
  // - Self-underestimators (they're better than they think)
  // - Hedging detected (shows humility/openness to learning)

  if (validatedLevel <= 0) {
    return 'high' // Lots of room to grow
  }

  if (discrepancy === 'self_underestimate') {
    return 'high' // Already better than they think, likely to continue growing
  }

  if (validatedLevel <= 2 && hedgingDetected) {
    return 'high' // Shows awareness of gaps
  }

  if (validatedLevel <= 3) {
    return 'medium'
  }

  // Level 4+ already shows significant capability
  return 'low'
}

// ============================================================================
// MAIN VALIDATION FUNCTION
// ============================================================================

/**
 * Main function to validate skill assessments by cross-referencing
 * self-assessments with peer assessments
 */
export async function validateSkillAssessments(
  transcripts: TranscriptWithSpeaker[]
): Promise<ValidationResult> {
  console.log(`\nValidating skill assessments for ${transcripts.length} transcripts...`)

  // Get list of all known people from transcripts
  const knownPeople = transcripts.map(t => t.speakerName)

  // Extract self-assessments for each person
  console.log('\n[1/4] Extracting self-assessments...')
  const selfAssessments: Map<string, SelfAssessment> = new Map()

  for (const transcript of transcripts) {
    console.log(`  Processing ${transcript.speakerName}...`)
    const assessment = await extractSelfAssessment(transcript)
    selfAssessments.set(transcript.speakerName.toLowerCase(), assessment)
  }

  // Extract peer assessments
  console.log('\n[2/4] Extracting peer assessments...')
  const peerAssessments = await extractPeerAssessments(transcripts, knownPeople)
  console.log(`  Found ${peerAssessments.length} peer mentions`)

  // Group peer assessments by subject
  const peerAssessmentsBySubject: Map<string, PeerAssessment[]> = new Map()
  for (const assessment of peerAssessments) {
    const key = assessment.subjectName.toLowerCase()
    if (!peerAssessmentsBySubject.has(key)) {
      peerAssessmentsBySubject.set(key, [])
    }
    peerAssessmentsBySubject.get(key)!.push(assessment)
  }

  // Build validated profiles
  console.log('\n[3/4] Building validated profiles...')
  const profiles: ValidatedSkillProfile[] = []
  const discrepancySummary = {
    selfUnderestimates: 0,
    selfOverestimates: 0,
    aligned: 0,
    unknown: 0
  }

  for (const [key, selfAssessment] of selfAssessments) {
    const subjectPeerAssessments = peerAssessmentsBySubject.get(key) ?? []
    const peerLevel = calculatePeerLevel(subjectPeerAssessments)
    const discrepancy = detectDiscrepancy(selfAssessment.skillLevel, peerLevel)
    const validatedLevel = calculateValidatedLevel(
      selfAssessment.skillLevel,
      peerLevel,
      selfAssessment.confidence
    )
    const championScore = calculateChampionScore(selfAssessment, subjectPeerAssessments)

    // Convert peer assessments to PeerMention format
    const peerEvidence: PeerMention[] = subjectPeerAssessments.map(a => ({
      mentionedBy: a.mentionedBy,
      context: a.context,
      sentiment: a.sentiment,
      skillsAttributed: a.skillsAttributed
    }))

    const profile: ValidatedSkillProfile = {
      name: selfAssessment.name,
      title: selfAssessment.title,
      department: selfAssessment.department,
      selfAssessedLevel: selfAssessment.skillLevel,
      peerAssessedLevel: peerLevel,
      validatedLevel,
      discrepancy,
      confidence: selfAssessment.confidence,
      toolsUsed: selfAssessment.toolsClaimed,
      frequency: selfAssessment.frequencyClaimed,
      isChampion: isChampion(championScore, subjectPeerAssessments),
      championScore,
      selfEvidence: selfAssessment.evidence,
      peerEvidence,
      growthPotential: assessGrowthPotential(
        validatedLevel,
        selfAssessment.hedgingDetected,
        discrepancy
      )
    }

    profiles.push(profile)

    // Update discrepancy summary
    switch (discrepancy) {
      case 'self_underestimate':
        discrepancySummary.selfUnderestimates++
        break
      case 'self_overestimate':
        discrepancySummary.selfOverestimates++
        break
      case 'aligned':
        discrepancySummary.aligned++
        break
      case 'unknown':
        discrepancySummary.unknown++
        break
    }
  }

  // Identify champions
  console.log('\n[4/4] Identifying AI champions...')
  const champions = profiles
    .filter(p => p.isChampion)
    .sort((a, b) => b.championScore - a.championScore)

  console.log(`  Found ${champions.length} AI champions`)

  // Calculate overall confidence
  const overallConfidence = profiles.length > 0
    ? profiles.reduce((sum, p) => sum + p.confidence, 0) / profiles.length
    : 0

  return {
    profiles: profiles.sort((a, b) => b.validatedLevel - a.validatedLevel),
    champions,
    discrepancySummary,
    overallConfidence
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate a human-readable report from validation results
 */
export function generateValidationReport(result: ValidationResult): string {
  const lines: string[] = []

  lines.push('=' .repeat(60))
  lines.push('CROSS-REFERENCE VALIDATION REPORT')
  lines.push('='.repeat(60))
  lines.push('')

  // Summary
  lines.push('SUMMARY')
  lines.push('-'.repeat(40))
  lines.push(`Total profiles validated: ${result.profiles.length}`)
  lines.push(`AI Champions identified: ${result.champions.length}`)
  lines.push(`Overall confidence: ${(result.overallConfidence * 100).toFixed(0)}%`)
  lines.push('')

  // Discrepancy breakdown
  lines.push('DISCREPANCY ANALYSIS')
  lines.push('-'.repeat(40))
  lines.push(`Self-underestimates: ${result.discrepancySummary.selfUnderestimates}`)
  lines.push(`Self-overestimates: ${result.discrepancySummary.selfOverestimates}`)
  lines.push(`Aligned: ${result.discrepancySummary.aligned}`)
  lines.push(`Unknown (no peer data): ${result.discrepancySummary.unknown}`)
  lines.push('')

  // Champions
  if (result.champions.length > 0) {
    lines.push('AI CHAMPIONS')
    lines.push('-'.repeat(40))
    for (const champion of result.champions) {
      lines.push(`  ${champion.name} (${champion.title})`)
      lines.push(`    Champion Score: ${champion.championScore}/100`)
      lines.push(`    Validated Level: ${champion.validatedLevel}/10`)
      lines.push(`    Positive peer mentions: ${champion.peerEvidence.filter(p => p.sentiment === 'positive').length}`)
    }
    lines.push('')
  }

  // Profile details
  lines.push('PROFILE DETAILS')
  lines.push('-'.repeat(40))
  for (const profile of result.profiles) {
    lines.push(`\n${profile.name} (${profile.title}, ${profile.department})`)
    lines.push(`  Self-assessed: ${profile.selfAssessedLevel}/10`)
    lines.push(`  Peer-assessed: ${profile.peerAssessedLevel !== null ? `${profile.peerAssessedLevel}/10` : 'N/A'}`)
    lines.push(`  Validated: ${profile.validatedLevel}/10`)
    lines.push(`  Discrepancy: ${profile.discrepancy}`)
    lines.push(`  Frequency: ${profile.frequency}`)
    lines.push(`  Tools: ${profile.toolsUsed.join(', ') || 'None claimed'}`)
    lines.push(`  Growth potential: ${profile.growthPotential}`)
    if (profile.isChampion) {
      lines.push(`  *** AI CHAMPION (score: ${profile.championScore}) ***`)
    }
  }

  return lines.join('\n')
}

// ============================================================================
// CLI SUPPORT
// ============================================================================

// Allow running as a standalone script for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Cross-Reference Validator')
  console.log('This module is designed to be imported, not run directly.')
  console.log('')
  console.log('Usage:')
  console.log('  import { validateSkillAssessments } from "./cross-reference-validator"')
  console.log('  const result = await validateSkillAssessments(transcripts)')
}
