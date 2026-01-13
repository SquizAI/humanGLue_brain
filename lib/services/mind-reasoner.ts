/**
 * Mind Reasoner Service
 *
 * Creates psychometrically accurate digital twins from conversation transcripts.
 * Used for prospect profiling and communication optimization.
 *
 * API Base: https://app.mindreasoner.com/api/public/v1
 * MCP Server: https://mcp.mindreasoner.com/mcp
 */

import { executeWrite, executeRead } from '@/lib/neo4j/client'

// Types
export interface Mind {
  id: string
  name: string
  digitalTwin: {
    id: string
  }
  createdAt?: string
  updatedAt?: string
}

export interface UploadUrlResponse {
  signedUrl: string
  artifactId: string
}

export interface SnapshotResponse {
  mindAssessmentId: string
}

export interface SnapshotStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress?: number
}

export interface SimulationResult {
  thinking: string
  feeling: string
  saying: string
  acting: string
}

export interface PsychometricProfile {
  mindId: string
  snapshotId?: string

  // Core Communication Dimensions
  communicationStyle: 'direct' | 'diplomatic' | 'analytical' | 'expressive'
  listeningStyle: 'active' | 'reflective' | 'selective' | 'passive'
  feedbackPreference: 'direct' | 'indirect' | 'written' | 'verbal'
  conflictStyle: 'avoiding' | 'accommodating' | 'competing' | 'collaborating' | 'compromising'

  // Decision Making & Cognition
  decisionMaking: 'intuitive' | 'analytical' | 'collaborative' | 'decisive'
  problemSolving: 'systematic' | 'creative' | 'pragmatic' | 'theoretical'
  informationProcessing: 'sequential' | 'global' | 'visual' | 'verbal'
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing'

  // Personality & Values
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  changeReadiness: 'resistant' | 'cautious' | 'adaptable' | 'embracing'
  workStyle: 'independent' | 'collaborative' | 'flexible'
  motivationType: 'intrinsic' | 'extrinsic' | 'balanced'

  // Influence & Leadership
  persuasionStyle: 'logical' | 'emotional' | 'authority' | 'social_proof'
  leadershipStyle: 'directive' | 'coaching' | 'supportive' | 'delegating'
  influenceApproach: 'assertive' | 'consultative' | 'inspirational' | 'tactical'

  // AI & Technology Readiness
  aiReadiness: 'skeptical' | 'curious' | 'enthusiastic' | 'expert'
  technologyAdoption: 'laggard' | 'late_majority' | 'early_majority' | 'early_adopter' | 'innovator'
  dataComfort: 'low' | 'moderate' | 'high'
  automationOpenness: 'resistant' | 'selective' | 'embracing'

  // Emotional Intelligence
  selfAwareness: 'developing' | 'moderate' | 'high'
  empathy: 'developing' | 'moderate' | 'high'
  emotionalRegulation: 'developing' | 'moderate' | 'high'
  socialSkills: 'developing' | 'moderate' | 'high'

  // Team Dynamics
  teamRole: 'leader' | 'contributor' | 'specialist' | 'coordinator' | 'innovator'
  collaborationPreference: 'synchronous' | 'asynchronous' | 'hybrid'
  meetingStyle: 'structured' | 'free_form' | 'minimal'

  // Dynamic attributes (arrays)
  motivators: string[]
  stressors: string[]
  strengths: string[]
  growthAreas: string[]
  values: string[]

  // Metadata
  analyzedAt?: string
  confidence?: number // 0-100, how confident the analysis is
}

// Analysis prompts for psychometric extraction (25+ dimensions)
const ANALYSIS_PROMPTS: Record<string, string> = {
  // Core Communication Dimensions
  communicationStyle: `Based on the conversation patterns, what is this person's primary communication style?
Options: direct, diplomatic, analytical, expressive.
Respond with just the style name in lowercase.`,

  listeningStyle: `How does this person typically listen and respond to others?
Options: active (engaged, asks follow-ups), reflective (paraphrases, seeks understanding),
selective (focuses on specific topics), passive (minimal engagement).
Respond with just the style name in lowercase.`,

  feedbackPreference: `How does this person prefer to receive feedback?
Options: direct, indirect, written, verbal.
Respond with just the preference in lowercase.`,

  conflictStyle: `How does this person typically handle conflict?
Options: avoiding, accommodating, competing, collaborating, compromising.
Respond with just the style name in lowercase.`,

  // Decision Making & Cognition
  decisionMaking: `How does this person typically make decisions?
Options: intuitive, analytical, collaborative, decisive.
Respond with just the style name in lowercase.`,

  problemSolving: `What is this person's approach to solving problems?
Options: systematic (step-by-step), creative (innovative), pragmatic (practical), theoretical (explores principles).
Respond with just the approach in lowercase.`,

  informationProcessing: `How does this person best process information?
Options: sequential (linear, step-by-step), global (big picture first), visual (diagrams), verbal (discussion).
Respond with just the style in lowercase.`,

  learningStyle: `How does this person best absorb new information?
Options: visual, auditory, kinesthetic, reading_writing.
Respond with just the style name in lowercase.`,

  // Personality & Values
  riskTolerance: `What is this person's risk tolerance level?
Options: conservative, moderate, aggressive.
Respond with just the level in lowercase.`,

  changeReadiness: `How does this person respond to change?
Options: resistant (prefers status quo), cautious (needs convincing), adaptable (accepts change), embracing (drives change).
Respond with just the level in lowercase.`,

  workStyle: `What is this person's preferred work style?
Options: independent, collaborative, flexible.
Respond with just the style in lowercase.`,

  motivationType: `Is this person primarily motivated by internal or external factors?
Options: intrinsic (purpose, mastery), extrinsic (rewards, recognition), balanced.
Respond with just the type in lowercase.`,

  // Influence & Leadership
  persuasionStyle: `What type of persuasion is most effective with this person?
Options: logical, emotional, authority, social_proof.
Respond with just the style name in lowercase.`,

  leadershipStyle: `What leadership style does this person exhibit or respond best to?
Options: directive, coaching, supportive, delegating.
Respond with just the style in lowercase.`,

  influenceApproach: `How does this person typically influence others?
Options: assertive (direct), consultative (collaborative), inspirational (vision), tactical (strategic).
Respond with just the approach in lowercase.`,

  // AI & Technology Readiness
  aiReadiness: `What is this person's readiness and attitude toward AI tools?
Options: skeptical (concerns), curious (interested), enthusiastic (excited), expert (proficient).
Respond with just the level in lowercase.`,

  technologyAdoption: `Where does this person fall on the technology adoption curve?
Options: laggard, late_majority, early_majority, early_adopter, innovator.
Respond with just the category in lowercase.`,

  dataComfort: `How comfortable is this person working with data and analytics?
Options: low, moderate, high.
Respond with just the level in lowercase.`,

  automationOpenness: `How open is this person to automating their work?
Options: resistant (prefers manual), selective (automate some), embracing (automate everything possible).
Respond with just the level in lowercase.`,

  // Emotional Intelligence
  selfAwareness: `How self-aware is this person about their emotions and impact?
Options: developing, moderate, high.
Respond with just the level in lowercase.`,

  empathy: `How empathetic is this person toward others?
Options: developing, moderate, high.
Respond with just the level in lowercase.`,

  emotionalRegulation: `How well does this person manage their emotions under stress?
Options: developing, moderate, high.
Respond with just the level in lowercase.`,

  socialSkills: `How skilled is this person at social interactions and relationship building?
Options: developing, moderate, high.
Respond with just the level in lowercase.`,

  // Team Dynamics
  teamRole: `What role does this person typically play in a team setting?
Options: leader (directs), contributor (executes), specialist (expertise), coordinator (organizes), innovator (creates).
Respond with just the role in lowercase.`,

  collaborationPreference: `How does this person prefer to collaborate with others?
Options: synchronous (real-time), asynchronous (at own pace), hybrid (mix).
Respond with just the preference in lowercase.`,

  meetingStyle: `What meeting style does this person prefer?
Options: structured (agenda-driven), free_form (organic), minimal (as few as possible).
Respond with just the style in lowercase.`,

  // Dynamic attributes (return comma-separated lists)
  motivators: `List the top 3-5 things that motivate this person.
Format as a comma-separated list with no additional text.`,

  stressors: `List the top 3-5 things that stress or frustrate this person.
Format as a comma-separated list with no additional text.`,

  strengths: `List the top 3-5 professional strengths this person demonstrates.
Format as a comma-separated list with no additional text.`,

  growthAreas: `List 3-5 areas where this person could grow professionally.
Format as a comma-separated list with no additional text.`,

  values: `List the top 3-5 values that appear important to this person.
Format as a comma-separated list with no additional text.`,
}

class MindReasonerService {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.MIND_REASONER_API_KEY || ''
    this.baseUrl = 'https://app.mindreasoner.com/api/public/v1'
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Mind Reasoner API error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  /**
   * Check if the service is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey
  }

  /**
   * List all minds
   */
  async listMinds(): Promise<Mind[]> {
    return this.request<Mind[]>('/minds')
  }

  /**
   * Create a new mind
   */
  async createMind(name: string): Promise<Mind> {
    return this.request<Mind>('/minds', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  }

  /**
   * Get a specific mind by ID
   */
  async getMind(mindId: string): Promise<Mind> {
    return this.request<Mind>(`/minds/${mindId}`)
  }

  /**
   * Get signed URL for file upload
   */
  async getUploadUrl(mindId: string): Promise<UploadUrlResponse> {
    return this.request<UploadUrlResponse>(`/minds/${mindId}/upload-url`)
  }

  /**
   * Upload a file to the signed URL
   */
  async uploadFile(
    signedUrl: string,
    file: Buffer | Blob,
    contentType: string
  ): Promise<void> {
    // Convert Buffer to Blob for fetch compatibility
    let body: Blob
    if (file instanceof Blob) {
      body = file
    } else {
      // Convert Node.js Buffer to Uint8Array for Blob compatibility
      const uint8Array = new Uint8Array(file)
      body = new Blob([uint8Array], { type: contentType })
    }

    const response = await fetch(signedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body,
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`)
    }
  }

  /**
   * Create a snapshot from uploaded artifact
   */
  async createSnapshot(
    mindId: string,
    digitalTwinId: string,
    artifactId: string
  ): Promise<SnapshotResponse> {
    return this.request<SnapshotResponse>(
      `/digital-twins/${digitalTwinId}/assessments`,
      {
        method: 'POST',
        body: JSON.stringify({
          mindId,
          artifactIds: [artifactId],
        }),
      }
    )
  }

  /**
   * Check snapshot status
   */
  async getSnapshotStatus(
    mindId: string,
    snapshotId: string
  ): Promise<SnapshotStatus> {
    return this.request<SnapshotStatus>(
      `/minds/${mindId}/assessments/${snapshotId}`
    )
  }

  /**
   * Wait for snapshot to complete
   */
  async waitForSnapshot(
    mindId: string,
    snapshotId: string,
    maxAttempts: number = 60,
    intervalMs: number = 10000
  ): Promise<SnapshotStatus> {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.getSnapshotStatus(mindId, snapshotId)

      if (status.status === 'completed' || status.status === 'failed') {
        return status
      }

      await new Promise(resolve => setTimeout(resolve, intervalMs))
    }

    throw new Error('Snapshot processing timeout')
  }

  /**
   * Run a simulation
   */
  async simulate(
    mindId: string,
    scenario: string,
    model: 'mind-reasoner-pro' | 'mind-reasoner-standard' = 'mind-reasoner-pro'
  ): Promise<SimulationResult> {
    return this.request<SimulationResult>('/simulate', {
      method: 'POST',
      body: JSON.stringify({
        mindId,
        selectedSimulationModel: model,
        scenario: { message: scenario },
      }),
    })
  }

  /**
   * Analyze psychometrics from a trained mind (25+ dimensions)
   */
  async analyzePsychometrics(mindId: string, snapshotId?: string): Promise<PsychometricProfile> {
    const results: Partial<PsychometricProfile> = {
      mindId,
      snapshotId,
      motivators: [],
      stressors: [],
      strengths: [],
      growthAreas: [],
      values: [],
    }

    const listFields = ['motivators', 'stressors', 'strengths', 'growthAreas', 'values']
    const promptEntries = Object.entries(ANALYSIS_PROMPTS)

    // Run analyses in batches to avoid rate limiting
    const batchSize = 5
    let successCount = 0

    for (let i = 0; i < promptEntries.length; i += batchSize) {
      const batch = promptEntries.slice(i, i + batchSize)

      const batchResults = await Promise.allSettled(
        batch.map(async ([key, prompt]) => {
          const result = await this.simulate(mindId, prompt)
          const value = (result.saying || result.thinking || '').toLowerCase().trim()
          return { key, value }
        })
      )

      // Process batch results
      for (const analysis of batchResults) {
        if (analysis.status === 'fulfilled') {
          const { key, value } = analysis.value
          successCount++

          if (listFields.includes(key)) {
            (results as Record<string, unknown>)[key] = value
              .split(',')
              .map((s: string) => s.trim())
              .filter((s: string) => s.length > 0)
          } else {
            (results as Record<string, unknown>)[key] = value
          }
        }
      }

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < promptEntries.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Calculate confidence based on successful analyses
    results.confidence = Math.round((successCount / promptEntries.length) * 100)
    results.analyzedAt = new Date().toISOString()

    // Fill defaults for missing values
    return this.fillDefaults(results)
  }

  /**
   * Fill default values for missing psychometric fields
   */
  private fillDefaults(partial: Partial<PsychometricProfile>): PsychometricProfile {
    return {
      mindId: partial.mindId || '',
      snapshotId: partial.snapshotId,
      // Communication
      communicationStyle: partial.communicationStyle || 'diplomatic',
      listeningStyle: partial.listeningStyle || 'active',
      feedbackPreference: partial.feedbackPreference || 'direct',
      conflictStyle: partial.conflictStyle || 'collaborating',
      // Decision Making
      decisionMaking: partial.decisionMaking || 'analytical',
      problemSolving: partial.problemSolving || 'systematic',
      informationProcessing: partial.informationProcessing || 'sequential',
      learningStyle: partial.learningStyle || 'visual',
      // Personality
      riskTolerance: partial.riskTolerance || 'moderate',
      changeReadiness: partial.changeReadiness || 'adaptable',
      workStyle: partial.workStyle || 'collaborative',
      motivationType: partial.motivationType || 'balanced',
      // Influence
      persuasionStyle: partial.persuasionStyle || 'logical',
      leadershipStyle: partial.leadershipStyle || 'coaching',
      influenceApproach: partial.influenceApproach || 'consultative',
      // AI & Tech
      aiReadiness: partial.aiReadiness || 'curious',
      technologyAdoption: partial.technologyAdoption || 'early_majority',
      dataComfort: partial.dataComfort || 'moderate',
      automationOpenness: partial.automationOpenness || 'selective',
      // Emotional Intelligence
      selfAwareness: partial.selfAwareness || 'moderate',
      empathy: partial.empathy || 'moderate',
      emotionalRegulation: partial.emotionalRegulation || 'moderate',
      socialSkills: partial.socialSkills || 'moderate',
      // Team Dynamics
      teamRole: partial.teamRole || 'contributor',
      collaborationPreference: partial.collaborationPreference || 'hybrid',
      meetingStyle: partial.meetingStyle || 'structured',
      // Arrays
      motivators: partial.motivators || [],
      stressors: partial.stressors || [],
      strengths: partial.strengths || [],
      growthAreas: partial.growthAreas || [],
      values: partial.values || [],
      // Metadata
      analyzedAt: partial.analyzedAt,
      confidence: partial.confidence,
    } as PsychometricProfile
  }

  /**
   * Store mind reference in Neo4j
   */
  async storeMindInGraph(
    mindId: string,
    name: string,
    digitalTwinId: string,
    prospectId: string
  ): Promise<void> {
    const query = `
      MATCH (p:Prospect {id: $prospectId})
      CREATE (m:Mind {
        id: $mindId,
        name: $name,
        digitalTwinId: $digitalTwinId,
        snapshotStatus: 'pending',
        createdAt: datetime(),
        updatedAt: datetime()
      })
      CREATE (p)-[:HAS_MIND]->(m)
      RETURN m
    `

    await executeWrite(query, { mindId, name, digitalTwinId, prospectId })
  }

  /**
   * Store psychometric profile in Neo4j (all 25+ dimensions)
   */
  async storePsychometricProfile(profile: PsychometricProfile): Promise<void> {
    const query = `
      MATCH (m:Mind {id: $mindId})
      CREATE (pp:PsychometricProfile {
        id: randomUUID(),
        mindId: $mindId,
        snapshotId: $snapshotId,
        // Communication
        communicationStyle: $communicationStyle,
        listeningStyle: $listeningStyle,
        feedbackPreference: $feedbackPreference,
        conflictStyle: $conflictStyle,
        // Decision Making
        decisionMaking: $decisionMaking,
        problemSolving: $problemSolving,
        informationProcessing: $informationProcessing,
        learningStyle: $learningStyle,
        // Personality
        riskTolerance: $riskTolerance,
        changeReadiness: $changeReadiness,
        workStyle: $workStyle,
        motivationType: $motivationType,
        // Influence
        persuasionStyle: $persuasionStyle,
        leadershipStyle: $leadershipStyle,
        influenceApproach: $influenceApproach,
        // AI & Tech
        aiReadiness: $aiReadiness,
        technologyAdoption: $technologyAdoption,
        dataComfort: $dataComfort,
        automationOpenness: $automationOpenness,
        // Emotional Intelligence
        selfAwareness: $selfAwareness,
        empathy: $empathy,
        emotionalRegulation: $emotionalRegulation,
        socialSkills: $socialSkills,
        // Team Dynamics
        teamRole: $teamRole,
        collaborationPreference: $collaborationPreference,
        meetingStyle: $meetingStyle,
        // Arrays
        motivators: $motivators,
        stressors: $stressors,
        strengths: $strengths,
        growthAreas: $growthAreas,
        values: $values,
        // Metadata
        confidence: $confidence,
        analyzedAt: datetime()
      })
      CREATE (m)-[:HAS_PROFILE]->(pp)
      RETURN pp
    `

    await executeWrite(query, profile)
  }

  /**
   * Store simulation result in Neo4j
   */
  async storeSimulationResult(
    mindId: string,
    scenario: string,
    result: SimulationResult,
    model: string
  ): Promise<void> {
    const query = `
      MATCH (m:Mind {id: $mindId})
      CREATE (sr:SimulationResult {
        id: randomUUID(),
        mindId: $mindId,
        scenario: $scenario,
        thinking: $thinking,
        feeling: $feeling,
        saying: $saying,
        acting: $acting,
        model: $model,
        simulatedAt: datetime()
      })
      CREATE (m)-[:SIMULATION]->(sr)
      RETURN sr
    `

    await executeWrite(query, {
      mindId,
      scenario,
      ...result,
      model,
    })
  }

  /**
   * Get psychometric profile for a prospect from Neo4j
   */
  async getProspectProfile(prospectId: string): Promise<PsychometricProfile | null> {
    const query = `
      MATCH (p:Prospect {id: $prospectId})-[:HAS_MIND]->(m:Mind)-[:HAS_PROFILE]->(pp:PsychometricProfile)
      RETURN pp {
        .mindId,
        .snapshotId,
        .communicationStyle,
        .decisionMaking,
        .riskTolerance,
        .persuasionStyle,
        .conflictStyle,
        .motivators,
        .stressors,
        .analyzedAt
      } as profile
      ORDER BY pp.analyzedAt DESC
      LIMIT 1
    `

    const results = await executeRead<{ profile: PsychometricProfile }>(query, { prospectId })
    return results[0]?.profile || null
  }

  /**
   * Check if prospect has a mind
   */
  async prospectHasMind(prospectId: string): Promise<boolean> {
    const query = `
      MATCH (p:Prospect {id: $prospectId})-[:HAS_MIND]->(m:Mind)
      RETURN count(m) > 0 as hasMind
    `

    const results = await executeRead<{ hasMind: boolean }>(query, { prospectId })
    return results[0]?.hasMind || false
  }

  /**
   * Get all simulation history for a mind
   */
  async getSimulationHistory(mindId: string, limit: number = 20): Promise<any[]> {
    const query = `
      MATCH (m:Mind {id: $mindId})-[:SIMULATION]->(sr:SimulationResult)
      RETURN sr
      ORDER BY sr.simulatedAt DESC
      LIMIT $limit
    `

    return executeRead(query, { mindId, limit })
  }
}

// Export singleton instance
export const mindReasonerService = new MindReasonerService()

// Export class for testing
export { MindReasonerService }

// =====================================================
// ASSESSMENT INTEGRATION HELPERS
// =====================================================

/**
 * Map HMN assessment responses to psychometric dimensions
 * This bridges assessment data with Mind Reasoner profiles
 */
export function mapAssessmentToProfile(
  assessmentResponses: Array<{
    dimension: string
    subdimension?: string
    value: number
    questionCode: string
  }>
): Partial<PsychometricProfile> {
  const profile: Partial<PsychometricProfile> = {}

  // Group responses by dimension
  const byDimension: Record<string, number[]> = {}
  for (const response of assessmentResponses) {
    if (!byDimension[response.dimension]) {
      byDimension[response.dimension] = []
    }
    byDimension[response.dimension].push(response.value)
  }

  // Calculate dimension averages
  const avgScore = (scores: number[]) =>
    scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 5

  // Map Individual dimension to AI readiness
  if (byDimension.individual) {
    const avg = avgScore(byDimension.individual)
    if (avg >= 8) profile.aiReadiness = 'expert'
    else if (avg >= 6) profile.aiReadiness = 'enthusiastic'
    else if (avg >= 4) profile.aiReadiness = 'curious'
    else profile.aiReadiness = 'skeptical'
  }

  // Map Cultural dimension to change readiness
  if (byDimension.cultural) {
    const avg = avgScore(byDimension.cultural)
    if (avg >= 8) profile.changeReadiness = 'embracing'
    else if (avg >= 6) profile.changeReadiness = 'adaptable'
    else if (avg >= 4) profile.changeReadiness = 'cautious'
    else profile.changeReadiness = 'resistant'
  }

  // Map Leadership dimension to leadership style
  if (byDimension.leadership) {
    const avg = avgScore(byDimension.leadership)
    if (avg >= 8) profile.leadershipStyle = 'coaching'
    else if (avg >= 6) profile.leadershipStyle = 'supportive'
    else if (avg >= 4) profile.leadershipStyle = 'delegating'
    else profile.leadershipStyle = 'directive'
  }

  // Map Velocity dimension to technology adoption
  if (byDimension.velocity) {
    const avg = avgScore(byDimension.velocity)
    if (avg >= 8) profile.technologyAdoption = 'innovator'
    else if (avg >= 6) profile.technologyAdoption = 'early_adopter'
    else if (avg >= 4) profile.technologyAdoption = 'early_majority'
    else if (avg >= 2) profile.technologyAdoption = 'late_majority'
    else profile.technologyAdoption = 'laggard'
  }

  // Map Embedding dimension to automation openness
  if (byDimension.embedding) {
    const avg = avgScore(byDimension.embedding)
    if (avg >= 7) profile.automationOpenness = 'embracing'
    else if (avg >= 4) profile.automationOpenness = 'selective'
    else profile.automationOpenness = 'resistant'
  }

  return profile
}

/**
 * Generate personalized learning recommendations based on profile
 */
export function generateLearningRecommendations(
  profile: PsychometricProfile
): Array<{
  area: string
  recommendation: string
  priority: 'high' | 'medium' | 'low'
  resourceType: string
}> {
  const recommendations: Array<{
    area: string
    recommendation: string
    priority: 'high' | 'medium' | 'low'
    resourceType: string
  }> = []

  // AI readiness recommendations
  if (profile.aiReadiness === 'skeptical') {
    recommendations.push({
      area: 'AI Fundamentals',
      recommendation: 'Start with practical AI use cases that solve immediate problems',
      priority: 'high',
      resourceType: profile.learningStyle === 'visual' ? 'video' : 'hands-on',
    })
  }

  // Technology adoption recommendations
  if (profile.technologyAdoption === 'laggard' || profile.technologyAdoption === 'late_majority') {
    recommendations.push({
      area: 'Tool Adoption',
      recommendation: 'Pair with early adopters for peer learning and support',
      priority: 'medium',
      resourceType: 'mentoring',
    })
  }

  // Change readiness recommendations
  if (profile.changeReadiness === 'resistant' || profile.changeReadiness === 'cautious') {
    recommendations.push({
      area: 'Change Management',
      recommendation: 'Provide clear ROI and success stories before introducing new processes',
      priority: 'high',
      resourceType: 'case_study',
    })
  }

  // Communication style recommendations for AI tools
  if (profile.communicationStyle === 'analytical') {
    recommendations.push({
      area: 'AI Communication',
      recommendation: 'Focus on data-driven AI training with measurable outcomes',
      priority: 'medium',
      resourceType: 'documentation',
    })
  } else if (profile.communicationStyle === 'expressive') {
    recommendations.push({
      area: 'AI Communication',
      recommendation: 'Use storytelling and creative examples to demonstrate AI capabilities',
      priority: 'medium',
      resourceType: 'workshop',
    })
  }

  // Automation openness recommendations
  if (profile.automationOpenness === 'resistant') {
    recommendations.push({
      area: 'Automation Readiness',
      recommendation: 'Start with low-risk automation that augments rather than replaces',
      priority: 'high',
      resourceType: 'pilot_project',
    })
  }

  // Growth areas from profile
  for (const area of profile.growthAreas || []) {
    recommendations.push({
      area: area,
      recommendation: `Targeted development in ${area.toLowerCase()}`,
      priority: 'medium',
      resourceType: profile.learningStyle === 'kinesthetic' ? 'workshop' : 'course',
    })
  }

  // Data comfort recommendations
  if (profile.dataComfort === 'low') {
    recommendations.push({
      area: 'Data Literacy',
      recommendation: 'Build foundational data analysis skills to support AI tool adoption',
      priority: 'medium',
      resourceType: profile.learningStyle === 'visual' ? 'interactive_tutorial' : 'course',
    })
  }

  return recommendations
}

/**
 * Compare two profiles for team compatibility
 */
export function compareProfiles(
  profile1: PsychometricProfile,
  profile2: PsychometricProfile
): {
  compatibilityScore: number
  complementaryAreas: string[]
  potentialFriction: string[]
  collaborationTips: string[]
} {
  const scores: number[] = []

  // Communication compatibility
  if (profile1.communicationStyle === profile2.communicationStyle) {
    scores.push(80)
  } else if (
    (profile1.communicationStyle === 'analytical' && profile2.communicationStyle === 'direct') ||
    (profile1.communicationStyle === 'direct' && profile2.communicationStyle === 'analytical')
  ) {
    scores.push(70) // These styles often work well together
  } else {
    scores.push(50)
  }

  // Work style compatibility
  if (profile1.workStyle === profile2.workStyle) {
    scores.push(80)
  } else if (profile1.workStyle === 'flexible' || profile2.workStyle === 'flexible') {
    scores.push(70)
  } else {
    scores.push(40)
  }

  // Decision making compatibility
  if (profile1.decisionMaking === profile2.decisionMaking) {
    scores.push(70)
  } else {
    scores.push(60) // Different decision styles can be complementary
  }

  // Conflict style compatibility
  const goodConflictPairs = [
    ['avoiding', 'accommodating'],
    ['collaborating', 'compromising'],
  ]
  const isGoodPair = goodConflictPairs.some(
    (pair) =>
      pair.includes(profile1.conflictStyle) && pair.includes(profile2.conflictStyle)
  )
  scores.push(isGoodPair ? 75 : 55)

  // AI readiness alignment
  const aiReadinessOrder = ['skeptical', 'curious', 'enthusiastic', 'expert']
  const aiGap = Math.abs(
    aiReadinessOrder.indexOf(profile1.aiReadiness) -
    aiReadinessOrder.indexOf(profile2.aiReadiness)
  )
  scores.push(aiGap <= 1 ? 80 : aiGap === 2 ? 60 : 40)

  const compatibilityScore = Math.round(
    scores.reduce((a, b) => a + b, 0) / scores.length
  )

  // Identify complementary areas
  const complementaryAreas: string[] = []
  if (profile1.decisionMaking !== profile2.decisionMaking) {
    complementaryAreas.push(
      `Different decision styles (${profile1.decisionMaking} + ${profile2.decisionMaking}) provide balance`
    )
  }
  if (profile1.problemSolving !== profile2.problemSolving) {
    complementaryAreas.push(
      `Diverse problem-solving approaches (${profile1.problemSolving} + ${profile2.problemSolving})`
    )
  }
  if (profile1.aiReadiness !== profile2.aiReadiness) {
    complementaryAreas.push('Different AI experience levels enable peer learning')
  }

  // Identify friction points
  const potentialFriction: string[] = []
  if (
    profile1.communicationStyle === 'direct' &&
    profile2.communicationStyle === 'diplomatic'
  ) {
    potentialFriction.push('Direct vs diplomatic communication may cause misunderstandings')
  }
  if (
    profile1.riskTolerance === 'aggressive' &&
    profile2.riskTolerance === 'conservative'
  ) {
    potentialFriction.push('Different risk tolerances may lead to decision conflicts')
  }
  if (
    (profile1.workStyle === 'independent' && profile2.workStyle === 'collaborative') ||
    (profile1.workStyle === 'collaborative' && profile2.workStyle === 'independent')
  ) {
    potentialFriction.push('Different work style preferences require clear expectations')
  }

  // Generate collaboration tips
  const collaborationTips: string[] = [
    'Schedule regular check-ins to align on expectations',
  ]
  if (profile1.feedbackPreference !== profile2.feedbackPreference) {
    collaborationTips.push(
      `Agree on feedback approach - one prefers ${profile1.feedbackPreference}, other ${profile2.feedbackPreference}`
    )
  }
  if (profile1.meetingStyle !== profile2.meetingStyle) {
    collaborationTips.push(
      `Balance meeting styles - rotate between ${profile1.meetingStyle} and ${profile2.meetingStyle} formats`
    )
  }
  if (profile1.collaborationPreference !== profile2.collaborationPreference) {
    collaborationTips.push(
      `Mix collaboration modes to accommodate both ${profile1.collaborationPreference} and ${profile2.collaborationPreference} preferences`
    )
  }

  return {
    compatibilityScore,
    complementaryAreas,
    potentialFriction,
    collaborationTips,
  }
}

/**
 * Calculate team dynamics from multiple profiles
 */
export function analyzeTeamDynamics(
  profiles: PsychometricProfile[]
): {
  dominantCommunicationStyle: string
  dominantDecisionMaking: string
  aiReadinessDistribution: Record<string, number>
  changeReadinessScore: number
  diversityScore: number
  recommendations: string[]
} {
  if (profiles.length === 0) {
    return {
      dominantCommunicationStyle: 'unknown',
      dominantDecisionMaking: 'unknown',
      aiReadinessDistribution: {},
      changeReadinessScore: 0,
      diversityScore: 0,
      recommendations: [],
    }
  }

  // Count style frequencies
  const commStyleCounts: Record<string, number> = {}
  const decisionCounts: Record<string, number> = {}
  const aiReadinessCounts: Record<string, number> = {}
  const changeReadinessScores: number[] = []

  const changeReadinessMap: Record<string, number> = {
    resistant: 1,
    cautious: 2,
    adaptable: 3,
    embracing: 4,
  }

  for (const profile of profiles) {
    commStyleCounts[profile.communicationStyle] =
      (commStyleCounts[profile.communicationStyle] || 0) + 1
    decisionCounts[profile.decisionMaking] =
      (decisionCounts[profile.decisionMaking] || 0) + 1
    aiReadinessCounts[profile.aiReadiness] =
      (aiReadinessCounts[profile.aiReadiness] || 0) + 1
    changeReadinessScores.push(changeReadinessMap[profile.changeReadiness] || 2)
  }

  // Find dominant styles
  const dominantCommunicationStyle = Object.entries(commStyleCounts).sort(
    (a, b) => b[1] - a[1]
  )[0][0]
  const dominantDecisionMaking = Object.entries(decisionCounts).sort(
    (a, b) => b[1] - a[1]
  )[0][0]

  // Calculate change readiness score (1-100)
  const avgChangeReadiness =
    changeReadinessScores.reduce((a, b) => a + b, 0) / changeReadinessScores.length
  const changeReadinessScore = Math.round((avgChangeReadiness / 4) * 100)

  // Calculate diversity score based on variety of styles
  const uniqueCommStyles = Object.keys(commStyleCounts).length
  const uniqueDecisionStyles = Object.keys(decisionCounts).length
  const uniqueAiReadiness = Object.keys(aiReadinessCounts).length
  const diversityScore = Math.round(
    ((uniqueCommStyles / 4 + uniqueDecisionStyles / 4 + uniqueAiReadiness / 4) / 3) * 100
  )

  // Generate team recommendations
  const recommendations: string[] = []

  if (changeReadinessScore < 50) {
    recommendations.push(
      'Team has low change readiness - prioritize change management and communication'
    )
  }

  if (diversityScore < 30) {
    recommendations.push(
      'Team styles are homogeneous - consider diverse perspectives when making decisions'
    )
  } else if (diversityScore > 70) {
    recommendations.push(
      'High style diversity - establish clear communication norms to bridge differences'
    )
  }

  const skepticalCount = aiReadinessCounts['skeptical'] || 0
  if (skepticalCount / profiles.length > 0.5) {
    recommendations.push(
      'Many team members are AI skeptical - start with high-value, low-risk AI use cases'
    )
  }

  return {
    dominantCommunicationStyle,
    dominantDecisionMaking,
    aiReadinessDistribution: aiReadinessCounts,
    changeReadinessScore,
    diversityScore,
    recommendations,
  }
}
