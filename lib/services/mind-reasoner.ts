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

// Analysis prompts for psychometric extraction
const ANALYSIS_PROMPTS = {
  communicationStyle: `
Based on the conversation patterns, what is this person's primary communication style?
Options: direct (gets to the point quickly), diplomatic (softens messages, uses qualifiers),
analytical (data-driven, asks clarifying questions), expressive (uses stories, emotional language).
Respond with just the style name in lowercase.
  `.trim(),

  decisionMaking: `
How does this person typically make decisions?
Options: intuitive (goes with gut feeling), analytical (needs data and time),
collaborative (seeks consensus), decisive (makes quick calls).
Respond with just the style name in lowercase.
  `.trim(),

  riskTolerance: `
What is this person's risk tolerance level?
Options: conservative (prefers safe, proven approaches), moderate (balanced risk/reward),
aggressive (willing to take big risks for big rewards).
Respond with just the level in lowercase.
  `.trim(),

  persuasionStyle: `
What type of persuasion is most effective with this person?
Options: logical (facts, data, ROI), emotional (stories, vision, values),
authority (credentials, expertise), social-proof (testimonials, case studies).
Respond with just the style name in lowercase.
  `.trim(),

  conflictStyle: `
How does this person typically handle conflict?
Options: avoiding (sidesteps issues), accommodating (yields to others),
competing (stands firm), collaborating (seeks win-win).
Respond with just the style name in lowercase.
  `.trim(),

  motivators: `
List the top 3-5 things that motivate this person based on their communication.
Format as a comma-separated list with no additional text.
  `.trim(),

  stressors: `
List the top 3-5 things that seem to stress or frustrate this person.
Format as a comma-separated list with no additional text.
  `.trim(),
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
    const response = await fetch(signedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: file,
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
   * Analyze psychometrics from a trained mind
   */
  async analyzePsychometrics(mindId: string): Promise<PsychometricProfile> {
    const results: Partial<PsychometricProfile> = {
      mindId,
      motivators: [],
      stressors: [],
    }

    // Run all analysis simulations
    const analyses = await Promise.allSettled(
      Object.entries(ANALYSIS_PROMPTS).map(async ([key, prompt]) => {
        const result = await this.simulate(mindId, prompt)
        const value = (result.saying || result.thinking || '').toLowerCase().trim()
        return { key, value }
      })
    )

    // Process results
    for (const analysis of analyses) {
      if (analysis.status === 'fulfilled') {
        const { key, value } = analysis.value

        if (key === 'motivators' || key === 'stressors') {
          (results as any)[key] = value
            .split(',')
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0)
        } else {
          (results as any)[key] = value
        }
      }
    }

    results.analyzedAt = new Date().toISOString()

    return results as PsychometricProfile
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
   * Store psychometric profile in Neo4j
   */
  async storePsychometricProfile(profile: PsychometricProfile): Promise<void> {
    const query = `
      MATCH (m:Mind {id: $mindId})
      CREATE (pp:PsychometricProfile {
        id: randomUUID(),
        mindId: $mindId,
        snapshotId: $snapshotId,
        communicationStyle: $communicationStyle,
        decisionMaking: $decisionMaking,
        riskTolerance: $riskTolerance,
        persuasionStyle: $persuasionStyle,
        conflictStyle: $conflictStyle,
        motivators: $motivators,
        stressors: $stressors,
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
