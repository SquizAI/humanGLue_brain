#!/usr/bin/env ts-node
/**
 * Semantic Theme Discovery for GlueIQ Transcript Analysis Pipeline
 *
 * Uses Claude for semantic clustering and theme extraction instead of
 * simple keyword matching. Discovers both positive and negative themes
 * with sentiment analysis and dimension mapping.
 *
 * Usage:
 *   npx ts-node --transpile-only scripts/transcript-analysis/theme-discovery.ts
 */

import Anthropic from '@anthropic-ai/sdk'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Input transcript content with speaker attribution
 */
export interface TranscriptContent {
  id: string
  speakerName: string
  speakerTitle: string
  speakerRole: 'c_suite' | 'leadership' | 'manager' | 'individual_contributor'
  content: string
  organization?: string
  timestamp?: Date
}

/**
 * Extracted statement from transcript
 */
export interface ExtractedStatement {
  id: string
  text: string
  speaker: string
  speakerTitle: string
  sentiment: number // -1 to 1
  sentimentLabel: 'positive' | 'negative' | 'neutral'
  topics: string[]
  isStrength: boolean
  isGap: boolean
  isOpportunity: boolean
  confidence: number
  sourceTranscriptId: string
}

/**
 * Quote associated with a theme
 */
export interface ThemeQuote {
  text: string
  speaker: string
  speakerTitle: string
  sentiment: number
  sourceTranscriptId: string
}

/**
 * Discovered theme from semantic analysis
 */
export interface DiscoveredTheme {
  id: string
  name: string
  description: string
  frequency: number
  consensusCount: number // how many interviewees mentioned this theme
  sentiment: number // -1 to 1 aggregate
  sentimentLabel: 'positive' | 'negative' | 'neutral' | 'mixed'
  significance: 'high' | 'medium' | 'low'
  quotes: ThemeQuote[]
  relatedDimensions: string[]
  themeType: 'strength' | 'gap' | 'opportunity' | 'general'
  trend?: 'increasing' | 'stable' | 'decreasing'
  keywords: string[]
  statementIds: string[]
}

/**
 * Semantic cluster from LLM analysis
 */
interface SemanticCluster {
  themeName: string
  themeDescription: string
  themeType: 'strength' | 'gap' | 'opportunity' | 'general'
  statementIndices: number[]
  sentiment: number
  relatedDimensions: string[]
  keywords: string[]
}

/**
 * Theme discovery options
 */
export interface ThemeDiscoveryOptions {
  minConsensus?: number // minimum interviewees for a theme (default: 2)
  maxThemes?: number // maximum themes to return (default: 20)
  batchSize?: number // statements per LLM batch (default: 30)
  temperature?: number // LLM temperature (default: 0.3)
  model?: string // Claude model to use
}

/**
 * Logger interface for consistent logging
 */
interface Logger {
  info: (message: string, ...args: unknown[]) => void
  warn: (message: string, ...args: unknown[]) => void
  error: (message: string, ...args: unknown[]) => void
  debug: (message: string, ...args: unknown[]) => void
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * LVNG.AI 23 Dimension Mapping
 */
const DIMENSION_METADATA: Record<string, { name: string; category: string; description: string }> = {
  // STRATEGY & LEADERSHIP (5 dimensions)
  leadership_vision: { name: 'Leadership Vision', category: 'Strategy & Leadership', description: 'C-suite commitment and AI vision clarity' },
  strategy_alignment: { name: 'Strategy Alignment', category: 'Strategy & Leadership', description: 'AI strategy alignment with business goals' },
  change_management: { name: 'Change Management', category: 'Strategy & Leadership', description: 'Organizational change readiness and execution' },
  competitive_positioning: { name: 'Competitive Positioning', category: 'Strategy & Leadership', description: 'AI-driven market differentiation' },
  innovation_capacity: { name: 'Innovation Capacity', category: 'Strategy & Leadership', description: 'Ability to innovate with AI' },

  // PEOPLE & CULTURE (5 dimensions)
  skills_talent: { name: 'Skills & Talent', category: 'People & Culture', description: 'AI skills across the workforce' },
  cultural_readiness: { name: 'Cultural Readiness', category: 'People & Culture', description: 'Organizational culture openness to AI' },
  learning_development: { name: 'Learning & Development', category: 'People & Culture', description: 'AI training and upskilling programs' },
  psychological_safety: { name: 'Psychological Safety', category: 'People & Culture', description: 'Safe environment for AI experimentation' },
  champion_network: { name: 'Champion Network', category: 'People & Culture', description: 'AI advocates and change agents' },

  // TECHNOLOGY & DATA (5 dimensions)
  data_infrastructure: { name: 'Data Infrastructure', category: 'Technology & Data', description: 'Data quality, accessibility, and governance' },
  technology_stack: { name: 'Technology Stack', category: 'Technology & Data', description: 'AI-ready technology infrastructure' },
  integration_capability: { name: 'Integration Capability', category: 'Technology & Data', description: 'Ability to integrate AI into existing systems' },
  security_compliance: { name: 'Security & Compliance', category: 'Technology & Data', description: 'AI security and regulatory compliance' },
  vendor_ecosystem: { name: 'Vendor Ecosystem', category: 'Technology & Data', description: 'AI vendor relationships and partnerships' },

  // OPERATIONS & PROCESSES (4 dimensions)
  ai_use_cases: { name: 'AI Use Cases', category: 'Operations & Processes', description: 'Active AI implementations and applications' },
  process_automation: { name: 'Process Automation', category: 'Operations & Processes', description: 'Automated workflows and efficiency gains' },
  operational_excellence: { name: 'Operational Excellence', category: 'Operations & Processes', description: 'AI-driven operational improvements' },
  customer_experience: { name: 'Customer Experience', category: 'Operations & Processes', description: 'AI enhancement of customer touchpoints' },

  // GOVERNANCE & RISK (4 dimensions)
  ai_governance: { name: 'AI Governance', category: 'Governance & Risk', description: 'AI policies, accountability, and oversight' },
  ethics_responsibility: { name: 'Ethics & Responsibility', category: 'Governance & Risk', description: 'Ethical AI practices and responsibility' },
  risk_management: { name: 'Risk Management', category: 'Governance & Risk', description: 'AI risk identification and mitigation' },
  roi_measurement: { name: 'ROI Measurement', category: 'Governance & Risk', description: 'AI investment tracking and value measurement' },
}

const ALL_DIMENSIONS = Object.keys(DIMENSION_METADATA)

// ============================================================================
// LOGGER
// ============================================================================

const createLogger = (prefix: string): Logger => ({
  info: (message: string, ...args: unknown[]) => console.log(`[${prefix}] INFO: ${message}`, ...args),
  warn: (message: string, ...args: unknown[]) => console.warn(`[${prefix}] WARN: ${message}`, ...args),
  error: (message: string, ...args: unknown[]) => console.error(`[${prefix}] ERROR: ${message}`, ...args),
  debug: (message: string, ...args: unknown[]) => {
    if (process.env.DEBUG) console.log(`[${prefix}] DEBUG: ${message}`, ...args)
  },
})

const logger = createLogger('ThemeDiscovery')

// ============================================================================
// ANTHROPIC CLIENT
// ============================================================================

const getAnthropicClient = (): Anthropic => {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required')
  }
  return new Anthropic({ apiKey })
}

// ============================================================================
// STATEMENT EXTRACTION
// ============================================================================

/**
 * Extracts discrete statements from transcript content using Claude
 */
export async function extractStatements(
  transcripts: TranscriptContent[],
  options: { batchSize?: number; temperature?: number; model?: string } = {}
): Promise<ExtractedStatement[]> {
  const { batchSize = 3, temperature = 0.3, model = 'claude-sonnet-4-5-20250929' } = options

  logger.info(`Extracting statements from ${transcripts.length} transcripts`)

  const client = getAnthropicClient()
  const allStatements: ExtractedStatement[] = []

  // Process transcripts in batches
  for (let i = 0; i < transcripts.length; i += batchSize) {
    const batch = transcripts.slice(i, i + batchSize)
    logger.info(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(transcripts.length / batchSize)}`)

    const batchPromises = batch.map(async (transcript) => {
      try {
        const statements = await extractStatementsFromSingleTranscript(
          client,
          transcript,
          { temperature, model }
        )
        return statements
      } catch (error) {
        logger.error(`Failed to extract from ${transcript.speakerName}:`, error)
        return []
      }
    })

    const batchResults = await Promise.all(batchPromises)
    for (const statements of batchResults) {
      allStatements.push(...statements)
    }

    // Rate limiting between batches
    if (i + batchSize < transcripts.length) {
      await sleep(1000)
    }
  }

  logger.info(`Extracted ${allStatements.length} total statements`)
  return allStatements
}

async function extractStatementsFromSingleTranscript(
  client: Anthropic,
  transcript: TranscriptContent,
  options: { temperature: number; model: string }
): Promise<ExtractedStatement[]> {
  const { temperature, model } = options

  const systemPrompt = `You are an expert organizational analyst extracting discrete claims, opinions, and observations from interview transcripts about AI adoption and organizational capabilities.

For each statement you extract:
1. Identify discrete claims, opinions, or factual observations
2. Determine sentiment (-1 to 1 scale: -1=very negative, 0=neutral, 1=very positive)
3. Identify relevant topics (leadership, skills, tools, culture, process, strategy, governance, etc.)
4. Flag if it's a STRENGTH (positive capability), GAP (missing/lacking), or OPPORTUNITY (potential improvement)
5. Assign confidence (0-1) based on how clearly the statement was expressed

Focus on substantive statements about:
- AI tools and usage
- Skills and capabilities
- Organizational culture
- Processes and workflows
- Leadership and strategy
- Challenges and opportunities
- Governance and ethics

Return JSON array of statements.`

  const userPrompt = `Extract all substantive statements from this interview transcript.

Speaker: ${transcript.speakerName}
Title: ${transcript.speakerTitle}
Role: ${transcript.speakerRole}

Transcript:
${transcript.content.slice(0, 15000)} ${transcript.content.length > 15000 ? '...[truncated]' : ''}

Return a JSON array with this structure:
[
  {
    "text": "The exact or closely paraphrased statement",
    "sentiment": 0.5,
    "sentimentLabel": "positive",
    "topics": ["leadership", "strategy"],
    "isStrength": true,
    "isGap": false,
    "isOpportunity": false,
    "confidence": 0.9
  }
]

Extract 10-30 substantive statements. Focus on claims about AI, capabilities, challenges, and organizational state.`

  try {
    const response = await client.messages.create({
      model,
      max_tokens: 4096,
      temperature,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const textContent = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('')

    // Parse JSON from response
    const jsonMatch = textContent.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      logger.warn(`No JSON array found in response for ${transcript.speakerName}`)
      return []
    }

    const parsed = JSON.parse(jsonMatch[0]) as Array<{
      text: string
      sentiment: number
      sentimentLabel: 'positive' | 'negative' | 'neutral'
      topics: string[]
      isStrength: boolean
      isGap: boolean
      isOpportunity: boolean
      confidence: number
    }>

    return parsed.map((s, index) => ({
      id: `${transcript.id}-stmt-${index}`,
      text: s.text,
      speaker: transcript.speakerName,
      speakerTitle: transcript.speakerTitle,
      sentiment: clamp(s.sentiment, -1, 1),
      sentimentLabel: s.sentimentLabel || getSentimentLabel(s.sentiment),
      topics: s.topics || [],
      isStrength: s.isStrength || false,
      isGap: s.isGap || false,
      isOpportunity: s.isOpportunity || false,
      confidence: clamp(s.confidence, 0, 1),
      sourceTranscriptId: transcript.id,
    }))
  } catch (error) {
    logger.error(`Error extracting statements from ${transcript.speakerName}:`, error)
    throw error
  }
}

// ============================================================================
// SEMANTIC CLUSTERING
// ============================================================================

/**
 * Groups statements into semantic clusters using Claude
 */
async function clusterStatementsSemantically(
  statements: ExtractedStatement[],
  options: { batchSize?: number; temperature?: number; model?: string } = {}
): Promise<SemanticCluster[]> {
  const { batchSize = 30, temperature = 0.3, model = 'claude-sonnet-4-5-20250929' } = options

  logger.info(`Clustering ${statements.length} statements semantically`)

  const client = getAnthropicClient()
  const allClusters: SemanticCluster[] = []

  // Process in batches
  for (let i = 0; i < statements.length; i += batchSize) {
    const batch = statements.slice(i, i + batchSize)
    const batchStart = i

    logger.info(`Clustering batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(statements.length / batchSize)}`)

    try {
      const clusters = await clusterBatch(client, batch, batchStart, { temperature, model })
      allClusters.push(...clusters)
    } catch (error) {
      logger.error(`Failed to cluster batch:`, error)
    }

    // Rate limiting
    if (i + batchSize < statements.length) {
      await sleep(1000)
    }
  }

  // Merge similar clusters across batches
  const mergedClusters = mergeSimilarClusters(allClusters)

  logger.info(`Created ${mergedClusters.length} semantic clusters`)
  return mergedClusters
}

async function clusterBatch(
  client: Anthropic,
  statements: ExtractedStatement[],
  batchStart: number,
  options: { temperature: number; model: string }
): Promise<SemanticCluster[]> {
  const { temperature, model } = options

  const dimensionsList = ALL_DIMENSIONS.map(
    (d) => `- ${d}: ${DIMENSION_METADATA[d].name} (${DIMENSION_METADATA[d].description})`
  ).join('\n')

  const systemPrompt = `You are an expert at semantic analysis and theme discovery in organizational interview data.

Your task is to group statements by their underlying themes and meaning, NOT just by keywords. Look for:
1. Common conceptual themes (e.g., "lack of formal planning", "leadership alignment", "tool fragmentation")
2. Both positive themes (strengths) and negative themes (gaps/challenges)
3. Opportunities for improvement
4. Patterns that indicate organizational maturity or immaturity

Each cluster should have:
- A clear, descriptive name (e.g., "No Formal AI Strategy", "Creative Team Leads Adoption", "Skills Gap Across Organization")
- A brief description of what the theme represents
- Type: strength (positive), gap (negative/missing), opportunity (potential), or general
- Sentiment score (-1 to 1)
- Related LVNG.AI dimensions from this list:
${dimensionsList}

Group by MEANING, not just similar words. Two statements can use different words but express the same theme.`

  const statementsText = statements
    .map((s, idx) => `[${batchStart + idx}] "${s.text}" (${s.speaker}, ${s.sentimentLabel})`)
    .join('\n')

  const userPrompt = `Group these statements into semantic theme clusters:

${statementsText}

Return JSON array of clusters:
[
  {
    "themeName": "No Formal AI Strategy",
    "themeDescription": "Organization lacks a documented AI roadmap and formal strategic plan",
    "themeType": "gap",
    "statementIndices": [0, 3, 7],
    "sentiment": -0.6,
    "relatedDimensions": ["strategy_alignment", "ai_governance"],
    "keywords": ["no plan", "no roadmap", "informal"]
  }
]

Create 3-10 clusters. Each statement should belong to exactly one cluster.`

  try {
    const response = await client.messages.create({
      model,
      max_tokens: 4096,
      temperature,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const textContent = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('')

    const jsonMatch = textContent.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      logger.warn('No JSON array found in clustering response')
      return []
    }

    const parsed = JSON.parse(jsonMatch[0]) as SemanticCluster[]
    return parsed.map((c) => ({
      ...c,
      sentiment: clamp(c.sentiment, -1, 1),
      relatedDimensions: c.relatedDimensions.filter((d) => ALL_DIMENSIONS.includes(d)),
    }))
  } catch (error) {
    logger.error('Error clustering statements:', error)
    throw error
  }
}

/**
 * Merges similar clusters that may have been created across batches
 */
function mergeSimilarClusters(clusters: SemanticCluster[]): SemanticCluster[] {
  if (clusters.length === 0) return []

  const merged: SemanticCluster[] = []
  const used = new Set<number>()

  for (let i = 0; i < clusters.length; i++) {
    if (used.has(i)) continue

    const current = { ...clusters[i] }

    // Find similar clusters
    for (let j = i + 1; j < clusters.length; j++) {
      if (used.has(j)) continue

      if (areSimilarClusters(current, clusters[j])) {
        // Merge - use Array.from() for ES2017 compatibility
        current.statementIndices = Array.from(
          new Set([...current.statementIndices, ...clusters[j].statementIndices])
        )
        current.keywords = Array.from(
          new Set([...current.keywords, ...clusters[j].keywords])
        )
        current.relatedDimensions = Array.from(
          new Set([...current.relatedDimensions, ...clusters[j].relatedDimensions])
        )
        current.sentiment = (current.sentiment + clusters[j].sentiment) / 2
        used.add(j)
      }
    }

    merged.push(current)
    used.add(i)
  }

  return merged
}

/**
 * Determines if two clusters are similar enough to merge
 */
function areSimilarClusters(a: SemanticCluster, b: SemanticCluster): boolean {
  // Check name similarity
  const nameA = a.themeName.toLowerCase()
  const nameB = b.themeName.toLowerCase()

  // Same type and similar keywords
  if (a.themeType === b.themeType) {
    const keywordOverlap = a.keywords.filter((k) =>
      b.keywords.some((bk) => bk.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(bk.toLowerCase()))
    )
    if (keywordOverlap.length >= 2) return true
  }

  // Similar names
  const nameWords = nameA.split(/\s+/)
  const matchingWords = nameWords.filter((w) => nameB.includes(w) && w.length > 3)
  if (matchingWords.length >= 2) return true

  return false
}

// ============================================================================
// THEME DISCOVERY (MAIN FUNCTION)
// ============================================================================

/**
 * Main function: Discovers themes from transcript content using semantic analysis
 */
export async function discoverThemes(
  transcripts: TranscriptContent[],
  options: ThemeDiscoveryOptions = {}
): Promise<DiscoveredTheme[]> {
  const {
    minConsensus = 2,
    maxThemes = 20,
    batchSize = 30,
    temperature = 0.3,
    model = 'claude-sonnet-4-5-20250929',
  } = options

  logger.info('=' .repeat(60))
  logger.info('SEMANTIC THEME DISCOVERY')
  logger.info('='.repeat(60))
  logger.info(`Processing ${transcripts.length} transcripts`)
  logger.info(`Options: minConsensus=${minConsensus}, maxThemes=${maxThemes}`)

  // Step 1: Extract statements from all transcripts
  logger.info('\n[1/4] Extracting statements from transcripts...')
  const statements = await extractStatements(transcripts, { batchSize: 3, temperature, model })

  if (statements.length === 0) {
    logger.warn('No statements extracted')
    return []
  }

  // Step 2: Cluster statements semantically
  logger.info('\n[2/4] Clustering statements semantically...')
  const clusters = await clusterStatementsSemantically(statements, { batchSize, temperature, model })

  if (clusters.length === 0) {
    logger.warn('No clusters created')
    return []
  }

  // Step 3: Convert clusters to themes
  logger.info('\n[3/4] Converting clusters to themes...')
  const themes = convertClustersToThemes(clusters, statements, transcripts)

  // Step 4: Filter and rank themes
  logger.info('\n[4/4] Filtering and ranking themes...')
  const filteredThemes = filterAndRankThemes(themes, { minConsensus, maxThemes })

  logger.info(`\nDiscovered ${filteredThemes.length} themes meeting criteria`)
  return filteredThemes
}

/**
 * Converts semantic clusters into discovered themes
 */
function convertClustersToThemes(
  clusters: SemanticCluster[],
  statements: ExtractedStatement[],
  transcripts: TranscriptContent[]
): DiscoveredTheme[] {
  const speakerMap = new Map<string, TranscriptContent>()
  for (const t of transcripts) {
    speakerMap.set(t.speakerName, t)
  }

  return clusters.map((cluster, idx) => {
    // Get statements for this cluster
    const clusterStatements = cluster.statementIndices
      .map((i) => statements[i])
      .filter(Boolean)

    // Count unique speakers
    const uniqueSpeakers = new Set(clusterStatements.map((s) => s.speaker))
    const consensusCount = uniqueSpeakers.size

    // Calculate aggregate sentiment
    const avgSentiment =
      clusterStatements.length > 0
        ? clusterStatements.reduce((sum, s) => sum + s.sentiment, 0) / clusterStatements.length
        : cluster.sentiment

    // Check for sentiment agreement/disagreement
    const sentiments = clusterStatements.map((s) => s.sentiment)
    const sentimentVariance = calculateVariance(sentiments)
    const hasMixedSentiment = sentimentVariance > 0.3

    // Build quotes
    const quotes: ThemeQuote[] = clusterStatements.slice(0, 5).map((s) => ({
      text: s.text,
      speaker: s.speaker,
      speakerTitle: s.speakerTitle,
      sentiment: s.sentiment,
      sourceTranscriptId: s.sourceTranscriptId,
    }))

    // Calculate significance
    const significance = calculateSignificance(consensusCount, clusterStatements.length, transcripts.length)

    return {
      id: `theme-${idx + 1}`,
      name: cluster.themeName,
      description: cluster.themeDescription,
      frequency: clusterStatements.length,
      consensusCount,
      sentiment: Math.round(avgSentiment * 100) / 100,
      sentimentLabel: hasMixedSentiment ? 'mixed' : getSentimentLabel(avgSentiment),
      significance,
      quotes,
      relatedDimensions: cluster.relatedDimensions,
      themeType: cluster.themeType,
      keywords: cluster.keywords,
      statementIds: clusterStatements.map((s) => s.id),
    }
  })
}

/**
 * Filters and ranks themes by relevance
 */
function filterAndRankThemes(
  themes: DiscoveredTheme[],
  options: { minConsensus: number; maxThemes: number }
): DiscoveredTheme[] {
  const { minConsensus, maxThemes } = options

  // Filter by minimum consensus
  const filtered = themes.filter((t) => t.consensusCount >= minConsensus)

  // Sort by significance, then consensus, then frequency
  const sorted = filtered.sort((a, b) => {
    const sigOrder = { high: 3, medium: 2, low: 1 }
    const sigDiff = sigOrder[b.significance] - sigOrder[a.significance]
    if (sigDiff !== 0) return sigDiff

    const consensusDiff = b.consensusCount - a.consensusCount
    if (consensusDiff !== 0) return consensusDiff

    return b.frequency - a.frequency
  })

  // Take top N
  return sorted.slice(0, maxThemes)
}

/**
 * Calculates theme significance based on consensus and frequency
 */
function calculateSignificance(
  consensusCount: number,
  statementCount: number,
  totalInterviewees: number
): 'high' | 'medium' | 'low' {
  const consensusRatio = consensusCount / totalInterviewees

  if (consensusRatio >= 0.6 || (consensusCount >= 4 && statementCount >= 8)) {
    return 'high'
  } else if (consensusRatio >= 0.3 || (consensusCount >= 2 && statementCount >= 4)) {
    return 'medium'
  }
  return 'low'
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getSentimentLabel(sentiment: number): 'positive' | 'negative' | 'neutral' {
  if (sentiment > 0.2) return 'positive'
  if (sentiment < -0.2) return 'negative'
  return 'neutral'
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2))
  return squaredDiffs.reduce((a, b) => a + b, 0) / values.length
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ============================================================================
// ADDITIONAL EXPORTS FOR CONVENIENCE
// ============================================================================

/**
 * Get positive themes (strengths)
 */
export function getStrengthThemes(themes: DiscoveredTheme[]): DiscoveredTheme[] {
  return themes.filter((t) => t.themeType === 'strength' || t.sentiment > 0.3)
}

/**
 * Get negative themes (gaps/challenges)
 */
export function getGapThemes(themes: DiscoveredTheme[]): DiscoveredTheme[] {
  return themes.filter((t) => t.themeType === 'gap' || t.sentiment < -0.3)
}

/**
 * Get opportunity themes
 */
export function getOpportunityThemes(themes: DiscoveredTheme[]): DiscoveredTheme[] {
  return themes.filter((t) => t.themeType === 'opportunity')
}

/**
 * Get themes by dimension
 */
export function getThemesByDimension(
  themes: DiscoveredTheme[],
  dimension: string
): DiscoveredTheme[] {
  return themes.filter((t) => t.relatedDimensions.includes(dimension))
}

/**
 * Get theme summary statistics
 */
export function getThemeSummary(themes: DiscoveredTheme[]): {
  total: number
  strengths: number
  gaps: number
  opportunities: number
  avgSentiment: number
  highSignificance: number
  topDimensions: Array<{ dimension: string; count: number }>
} {
  const strengths = themes.filter((t) => t.themeType === 'strength').length
  const gaps = themes.filter((t) => t.themeType === 'gap').length
  const opportunities = themes.filter((t) => t.themeType === 'opportunity').length
  const avgSentiment = themes.length > 0
    ? themes.reduce((sum, t) => sum + t.sentiment, 0) / themes.length
    : 0
  const highSignificance = themes.filter((t) => t.significance === 'high').length

  // Count dimensions
  const dimCounts = new Map<string, number>()
  for (const theme of themes) {
    for (const dim of theme.relatedDimensions) {
      dimCounts.set(dim, (dimCounts.get(dim) || 0) + 1)
    }
  }

  const topDimensions = Array.from(dimCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([dimension, count]) => ({ dimension, count }))

  return {
    total: themes.length,
    strengths,
    gaps,
    opportunities,
    avgSentiment: Math.round(avgSentiment * 100) / 100,
    highSignificance,
    topDimensions,
  }
}

// ============================================================================
// CLI ENTRY POINT
// ============================================================================

async function main() {
  console.log('\n' + '='.repeat(60))
  console.log('SEMANTIC THEME DISCOVERY - TEST RUN')
  console.log('='.repeat(60))

  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ERROR: ANTHROPIC_API_KEY environment variable is required')
    process.exit(1)
  }

  // Test with sample data
  const sampleTranscripts: TranscriptContent[] = [
    {
      id: 'test-1',
      speakerName: 'Test Speaker 1',
      speakerTitle: 'CEO',
      speakerRole: 'c_suite',
      content: `We don't have a formal AI plan right now. The partners are all aligned on wanting to invest in AI,
      but we haven't documented a strategy. Some people are using ChatGPT daily, others aren't using AI at all.
      The creative team is actually ahead of everyone else - they're using Midjourney and other tools effectively.
      We need to figure out governance and ethics policies too.`,
    },
    {
      id: 'test-2',
      speakerName: 'Test Speaker 2',
      speakerTitle: 'Partner',
      speakerRole: 'c_suite',
      content: `I think our reputation exceeds our actual AI capability. We talk about AI a lot but we're not really
      doing as much as clients think. There's no ROI measurement happening - we can't quantify the time savings.
      Leadership is supportive though, and there are some real AI champions on the team like the creative director.`,
    },
  ]

  console.log(`\nProcessing ${sampleTranscripts.length} sample transcripts...`)

  try {
    const themes = await discoverThemes(sampleTranscripts, {
      minConsensus: 1,
      maxThemes: 10,
    })

    console.log('\n' + '='.repeat(60))
    console.log('DISCOVERED THEMES')
    console.log('='.repeat(60))

    for (const theme of themes) {
      console.log(`\n[${theme.themeType.toUpperCase()}] ${theme.name}`)
      console.log(`  Description: ${theme.description}`)
      console.log(`  Sentiment: ${theme.sentiment} (${theme.sentimentLabel})`)
      console.log(`  Consensus: ${theme.consensusCount} interviewees`)
      console.log(`  Significance: ${theme.significance}`)
      console.log(`  Dimensions: ${theme.relatedDimensions.join(', ')}`)
      console.log(`  Sample Quote: "${theme.quotes[0]?.text.slice(0, 100)}..."`)
    }

    const summary = getThemeSummary(themes)
    console.log('\n' + '='.repeat(60))
    console.log('SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total Themes: ${summary.total}`)
    console.log(`Strengths: ${summary.strengths}`)
    console.log(`Gaps: ${summary.gaps}`)
    console.log(`Opportunities: ${summary.opportunities}`)
    console.log(`Average Sentiment: ${summary.avgSentiment}`)
    console.log(`High Significance: ${summary.highSignificance}`)

  } catch (error) {
    console.error('Error during theme discovery:', error)
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  main()
}
