/**
 * HMN Transcript Analysis Agents
 * Data science sub-agents for parallel analysis of interview transcripts
 *
 * These agents process raw interview transcripts to extract structured insights,
 * identify patterns across interviews, and generate evidence-based maturity scores.
 */

export interface TranscriptData {
  id: string
  interviewee: {
    name: string
    title: string
    role: 'c_suite' | 'leadership' | 'manager' | 'individual_contributor'
    department?: string
  }
  organization: string
  timestamp: Date
  duration: number // minutes
  rawContent: string
  metadata?: {
    interviewer?: string
    platform?: string
    topics?: string[]
  }
}

export interface ExtractedEntity {
  type: 'person' | 'tool' | 'process' | 'team' | 'company' | 'metric' | 'challenge' | 'opportunity'
  value: string
  context: string
  sentiment?: 'positive' | 'negative' | 'neutral'
  frequency: number
  sourceQuotes: string[]
}

export interface ThemeCluster {
  id: string
  name: string
  description: string
  keywords: string[]
  frequency: number
  sentiment: number // -1 to 1
  sourceInterviews: string[]
  representativeQuotes: string[]
  dimensions: string[] // maps to assessment dimensions
}

export interface RealityGap {
  dimension: string
  leadershipPerception: number // 0-10
  actualEvidence: number // 0-10
  gap: number // difference
  evidence: {
    supporting: string[]
    contradicting: string[]
  }
  confidence: number
}

export interface PersonSkillProfile {
  name: string
  title: string
  aiSkillLevel: 'expert' | 'advanced' | 'intermediate' | 'beginner' | 'none'
  toolsUsed: string[]
  frequency: 'daily' | 'weekly' | 'occasionally' | 'rarely' | 'never'
  mentionedBy: string[]
  evidence: string[]
  isChampion: boolean
  growthPotential: 'high' | 'medium' | 'low'
}

export interface TranscriptAnalysis {
  transcriptId: string
  interviewee: string
  entities: ExtractedEntity[]
  themes: ThemeCluster[]
  sentimentProfile: {
    overall: number
    byTopic: Map<string, number>
    emotionalMoments: { timestamp: string; emotion: string; context: string }[]
  }
  keyInsights: string[]
  quotableStatements: string[]
  dimensionEvidence: Map<string, { score: number; evidence: string[] }>
  confidence: number
}

export interface CrossInterviewSynthesis {
  organizationId: string
  totalInterviews: number
  consensusThemes: ThemeCluster[]
  divergencePoints: {
    topic: string
    positions: { interviewee: string; position: string }[]
    significance: 'high' | 'medium' | 'low'
  }[]
  realityGaps: RealityGap[]
  skillsMap: PersonSkillProfile[]
  aggregateScores: Map<string, number>
  executiveSummary: string
  actionableRecommendations: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
  }
}

/**
 * Base interface for all transcript analysis agents
 */
export interface TranscriptAnalysisAgent {
  id: string
  name: string
  description: string
  analyze: (transcripts: TranscriptData[]) => Promise<any>
}

/**
 * 1. TRANSCRIPT PARSER AGENT
 * Parses raw transcript text into structured sections and dialogue turns
 */
export class TranscriptParserAgent implements TranscriptAnalysisAgent {
  id = 'transcript_parser_agent'
  name = 'Transcript Parser'
  description = 'Parses raw transcripts into structured dialogue sections'

  async analyze(transcripts: TranscriptData[]): Promise<ParsedTranscript[]> {
    return Promise.all(transcripts.map(t => this.parseTranscript(t)))
  }

  private async parseTranscript(transcript: TranscriptData): Promise<ParsedTranscript> {
    const lines = transcript.rawContent.split('\n')
    const dialogueTurns: DialogueTurn[] = []
    let currentSpeaker = ''
    let currentContent: string[] = []
    let currentTimestamp = ''

    for (const line of lines) {
      // Parse timestamp markers like [@1:23:45]
      const timestampMatch = line.match(/\[@(\d+:\d+(?::\d+)?)\]/)
      if (timestampMatch) {
        currentTimestamp = timestampMatch[1]
      }

      // Parse speaker markers
      const speakerMatch = line.match(/\*\*([^*]+)\*\*/)
      if (speakerMatch) {
        // Save previous turn
        if (currentSpeaker && currentContent.length > 0) {
          dialogueTurns.push({
            speaker: currentSpeaker,
            content: currentContent.join(' ').trim(),
            timestamp: currentTimestamp,
            isInterviewee: currentSpeaker.includes(transcript.interviewee.name.split(' ')[1]) ||
                          currentSpeaker.includes(transcript.organization)
          })
        }
        currentSpeaker = speakerMatch[1]
        currentContent = []
      } else if (line.trim() && !timestampMatch) {
        currentContent.push(line.trim())
      }
    }

    // Don't forget the last turn
    if (currentSpeaker && currentContent.length > 0) {
      dialogueTurns.push({
        speaker: currentSpeaker,
        content: currentContent.join(' ').trim(),
        timestamp: currentTimestamp,
        isInterviewee: currentSpeaker.includes(transcript.interviewee.name.split(' ')[1])
      })
    }

    return {
      transcriptId: transcript.id,
      interviewee: transcript.interviewee,
      dialogueTurns,
      wordCount: transcript.rawContent.split(/\s+/).length,
      sections: this.identifySections(dialogueTurns),
      metadata: transcript.metadata
    }
  }

  private identifySections(turns: DialogueTurn[]): TranscriptSection[] {
    const sections: TranscriptSection[] = []
    const sectionKeywords: Record<string, string[]> = {
      'introduction': ['background', 'role', 'responsibilities', 'history'],
      'ai_usage': ['ai', 'chatgpt', 'claude', 'tool', 'use', 'daily', 'workflow'],
      'skills': ['learn', 'training', 'skill', 'capable', 'fluent', 'expert'],
      'culture': ['culture', 'change', 'adoption', 'resistance', 'willing'],
      'strategy': ['strategy', 'plan', 'vision', 'roadmap', 'priority'],
      'challenges': ['challenge', 'obstacle', 'barrier', 'problem', 'issue'],
      'opportunities': ['opportunity', 'potential', 'improve', 'automate'],
      'governance': ['ethics', 'governance', 'policy', 'compliance', 'security'],
      'wrap_up': ['summary', 'final', 'conclude', 'wrap', 'last']
    }

    let currentSection = 'introduction'
    let sectionStart = 0

    turns.forEach((turn, index) => {
      const content = turn.content.toLowerCase()
      for (const [section, keywords] of Object.entries(sectionKeywords)) {
        const matches = keywords.filter(kw => content.includes(kw)).length
        if (matches >= 2 && section !== currentSection) {
          if (index > sectionStart) {
            sections.push({
              name: currentSection,
              startIndex: sectionStart,
              endIndex: index - 1,
              turns: turns.slice(sectionStart, index)
            })
          }
          currentSection = section
          sectionStart = index
          break
        }
      }
    })

    // Add final section
    if (sectionStart < turns.length) {
      sections.push({
        name: currentSection,
        startIndex: sectionStart,
        endIndex: turns.length - 1,
        turns: turns.slice(sectionStart)
      })
    }

    return sections
  }
}

interface ParsedTranscript {
  transcriptId: string
  interviewee: TranscriptData['interviewee']
  dialogueTurns: DialogueTurn[]
  wordCount: number
  sections: TranscriptSection[]
  metadata?: TranscriptData['metadata']
}

interface DialogueTurn {
  speaker: string
  content: string
  timestamp: string
  isInterviewee: boolean
}

interface TranscriptSection {
  name: string
  startIndex: number
  endIndex: number
  turns: DialogueTurn[]
}

/**
 * 2. ENTITY EXTRACTION AGENT
 * Extracts named entities: people, tools, processes, teams, companies
 */
export class EntityExtractionAgent implements TranscriptAnalysisAgent {
  id = 'entity_extraction_agent'
  name = 'Entity Extractor'
  description = 'Extracts named entities from transcript content'

  // Pre-defined entity patterns
  private toolPatterns = [
    'ChatGPT', 'Claude', 'Gemini', 'Perplexity', 'Copilot', 'MidJourney',
    'Beautiful AI', 'Gamma', 'Builder.io', 'Figma', 'Motion', 'Atlas',
    'N8N', 'Fixer AI', 'Productive', 'HubSpot', 'Slack', 'Google Slides',
    'PowerPoint', 'Notion', 'Fathom', 'Otter', 'DALL-E', 'Runway',
    'OpenAI', 'Anthropic', 'Google', 'Microsoft', 'Stripe', 'Pencil'
  ]

  private processPatterns = [
    'onboarding', 'workflow', 'pipeline', 'process', 'automation',
    'integration', 'deployment', 'training', 'review', 'approval',
    'reporting', 'analysis', 'creative production', 'media planning',
    'project management', 'client management', 'quality assurance'
  ]

  async analyze(transcripts: TranscriptData[]): Promise<EntityExtractionResult[]> {
    return Promise.all(transcripts.map(t => this.extractEntities(t)))
  }

  private async extractEntities(transcript: TranscriptData): Promise<EntityExtractionResult> {
    const content = transcript.rawContent
    const entities: ExtractedEntity[] = []

    // Extract tools
    for (const tool of this.toolPatterns) {
      const regex = new RegExp(`\\b${tool}\\b`, 'gi')
      const matches = content.match(regex)
      if (matches && matches.length > 0) {
        const quotes = this.extractContextQuotes(content, tool)
        entities.push({
          type: 'tool',
          value: tool,
          context: `AI/Technology tool`,
          frequency: matches.length,
          sourceQuotes: quotes,
          sentiment: this.analyzeSentiment(quotes.join(' '))
        })
      }
    }

    // Extract people mentioned
    const peopleRegex = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b(?:\s+(?:is|does|uses|said|mentioned|thinks))/g
    const peopleMatches = content.matchAll(peopleRegex)
    const peopleCount = new Map<string, number>()
    for (const match of peopleMatches) {
      const name = match[1]
      if (!this.toolPatterns.some(t => t.toLowerCase() === name.toLowerCase())) {
        peopleCount.set(name, (peopleCount.get(name) || 0) + 1)
      }
    }
    for (const [name, count] of peopleCount) {
      if (count >= 2) {
        entities.push({
          type: 'person',
          value: name,
          context: 'Team member or stakeholder',
          frequency: count,
          sourceQuotes: this.extractContextQuotes(content, name),
          sentiment: 'neutral'
        })
      }
    }

    // Extract processes
    for (const process of this.processPatterns) {
      const regex = new RegExp(`\\b${process}\\b`, 'gi')
      const matches = content.match(regex)
      if (matches && matches.length >= 2) {
        entities.push({
          type: 'process',
          value: process,
          context: 'Business process',
          frequency: matches.length,
          sourceQuotes: this.extractContextQuotes(content, process),
          sentiment: this.analyzeSentiment(this.extractContextQuotes(content, process).join(' '))
        })
      }
    }

    // Extract challenges
    const challengeRegex = /(?:challenge|problem|issue|struggle|difficult|hard|can't|cannot|don't|haven't)[\s\S]{10,200}?[.!?]/gi
    const challengeMatches = content.match(challengeRegex) || []
    for (const match of challengeMatches) {
      entities.push({
        type: 'challenge',
        value: match.slice(0, 50) + '...',
        context: 'Challenge or barrier',
        frequency: 1,
        sourceQuotes: [match],
        sentiment: 'negative'
      })
    }

    // Extract opportunities
    const opportunityRegex = /(?:opportunity|potential|could|should|would|improve|better|faster|automate)[\s\S]{10,200}?[.!?]/gi
    const opportunityMatches = content.match(opportunityRegex) || []
    for (const match of opportunityMatches) {
      entities.push({
        type: 'opportunity',
        value: match.slice(0, 50) + '...',
        context: 'Opportunity or improvement',
        frequency: 1,
        sourceQuotes: [match],
        sentiment: 'positive'
      })
    }

    return {
      transcriptId: transcript.id,
      interviewee: transcript.interviewee.name,
      entities,
      toolsFound: entities.filter(e => e.type === 'tool').map(e => e.value),
      peopleFound: entities.filter(e => e.type === 'person').map(e => e.value),
      challengesFound: entities.filter(e => e.type === 'challenge').length,
      opportunitiesFound: entities.filter(e => e.type === 'opportunity').length
    }
  }

  private extractContextQuotes(content: string, term: string): string[] {
    const quotes: string[] = []
    const regex = new RegExp(`[^.!?]*\\b${term}\\b[^.!?]*[.!?]`, 'gi')
    const matches = content.matchAll(regex)
    for (const match of matches) {
      if (match[0].length < 500) {
        quotes.push(match[0].trim())
      }
    }
    return quotes.slice(0, 5)
  }

  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['great', 'good', 'excellent', 'love', 'helpful', 'amazing', 'fantastic', 'better', 'improve', 'success']
    const negativeWords = ['bad', 'poor', 'difficult', 'challenge', 'problem', 'issue', 'struggle', 'fail', 'hard', 'can\'t']

    const lower = text.toLowerCase()
    const positiveCount = positiveWords.filter(w => lower.includes(w)).length
    const negativeCount = negativeWords.filter(w => lower.includes(w)).length

    if (positiveCount > negativeCount + 1) return 'positive'
    if (negativeCount > positiveCount + 1) return 'negative'
    return 'neutral'
  }
}

interface EntityExtractionResult {
  transcriptId: string
  interviewee: string
  entities: ExtractedEntity[]
  toolsFound: string[]
  peopleFound: string[]
  challengesFound: number
  opportunitiesFound: number
}

/**
 * 3. SENTIMENT ANALYZER AGENT
 * Analyzes emotional tone and confidence levels throughout the transcript
 */
export class SentimentAnalyzerAgent implements TranscriptAnalysisAgent {
  id = 'sentiment_analyzer_agent'
  name = 'Sentiment Analyzer'
  description = 'Analyzes emotional tone and confidence in transcript'

  private sentimentLexicon = {
    positive: ['excited', 'great', 'amazing', 'love', 'fantastic', 'excellent', 'wonderful', 'impressive', 'thrilled', 'optimistic', 'confident', 'success', 'opportunity', 'potential'],
    negative: ['frustrated', 'concerned', 'worried', 'difficult', 'challenging', 'problem', 'issue', 'struggle', 'fear', 'anxiety', 'behind', 'lagging', 'gap', 'fail'],
    uncertainty: ['maybe', 'perhaps', 'not sure', 'don\'t know', 'uncertain', 'unclear', 'might', 'could', 'possibly'],
    confidence: ['definitely', 'certainly', 'absolutely', 'clearly', 'obviously', 'sure', 'know', 'believe']
  }

  async analyze(transcripts: TranscriptData[]): Promise<SentimentAnalysisResult[]> {
    return Promise.all(transcripts.map(t => this.analyzeSentiment(t)))
  }

  private async analyzeSentiment(transcript: TranscriptData): Promise<SentimentAnalysisResult> {
    const content = transcript.rawContent.toLowerCase()
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10)

    let positiveScore = 0
    let negativeScore = 0
    let uncertaintyScore = 0
    let confidenceScore = 0

    // Count sentiment words
    for (const word of this.sentimentLexicon.positive) {
      const matches = (content.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length
      positiveScore += matches
    }
    for (const word of this.sentimentLexicon.negative) {
      const matches = (content.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length
      negativeScore += matches
    }
    for (const phrase of this.sentimentLexicon.uncertainty) {
      const matches = (content.match(new RegExp(phrase, 'g')) || []).length
      uncertaintyScore += matches
    }
    for (const word of this.sentimentLexicon.confidence) {
      const matches = (content.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length
      confidenceScore += matches
    }

    // Calculate overall sentiment (-1 to 1)
    const totalSentiment = positiveScore + negativeScore
    const overallSentiment = totalSentiment > 0
      ? (positiveScore - negativeScore) / totalSentiment
      : 0

    // Calculate confidence level (0 to 1)
    const totalCertainty = confidenceScore + uncertaintyScore
    const confidenceLevel = totalCertainty > 0
      ? confidenceScore / totalCertainty
      : 0.5

    // Find emotional moments
    const emotionalMoments = this.findEmotionalMoments(transcript.rawContent)

    // Analyze sentiment by topic
    const topicSentiments = new Map<string, number>()
    const topics = ['ai', 'tools', 'team', 'strategy', 'culture', 'process', 'training', 'clients']
    for (const topic of topics) {
      const topicSentences = sentences.filter(s => s.includes(topic))
      if (topicSentences.length > 0) {
        let topicPositive = 0
        let topicNegative = 0
        for (const sentence of topicSentences) {
          for (const word of this.sentimentLexicon.positive) {
            if (sentence.includes(word)) topicPositive++
          }
          for (const word of this.sentimentLexicon.negative) {
            if (sentence.includes(word)) topicNegative++
          }
        }
        const topicTotal = topicPositive + topicNegative
        topicSentiments.set(topic, topicTotal > 0 ? (topicPositive - topicNegative) / topicTotal : 0)
      }
    }

    return {
      transcriptId: transcript.id,
      interviewee: transcript.interviewee.name,
      overallSentiment,
      confidenceLevel,
      positiveScore,
      negativeScore,
      emotionalMoments,
      topicSentiments,
      keyEmotionalInsights: this.generateEmotionalInsights(overallSentiment, confidenceLevel, emotionalMoments)
    }
  }

  private findEmotionalMoments(content: string): EmotionalMoment[] {
    const moments: EmotionalMoment[] = []

    // Find strong emotional expressions
    const exclamationRegex = /[^.!?]*![^.!?]*/g
    const exclamations = content.match(exclamationRegex) || []
    for (const ex of exclamations.slice(0, 5)) {
      moments.push({
        text: ex.trim(),
        emotion: 'emphasis',
        intensity: 'high'
      })
    }

    // Find frustration
    const frustrationPatterns = /(?:frustrat|annoy|irritat|upset|angry|bothers? me)[^.!?]+[.!?]/gi
    const frustrations = content.match(frustrationPatterns) || []
    for (const f of frustrations.slice(0, 3)) {
      moments.push({
        text: f.trim(),
        emotion: 'frustration',
        intensity: 'high'
      })
    }

    // Find excitement
    const excitementPatterns = /(?:excit|thrill|can't wait|amazing|love|incredible)[^.!?]+[.!?]/gi
    const excitement = content.match(excitementPatterns) || []
    for (const e of excitement.slice(0, 3)) {
      moments.push({
        text: e.trim(),
        emotion: 'excitement',
        intensity: 'high'
      })
    }

    return moments
  }

  private generateEmotionalInsights(sentiment: number, confidence: number, moments: EmotionalMoment[]): string[] {
    const insights: string[] = []

    if (sentiment > 0.3) {
      insights.push('Generally positive attitude toward AI transformation')
    } else if (sentiment < -0.3) {
      insights.push('Shows skepticism or concern about AI initiatives')
    } else {
      insights.push('Mixed or neutral emotional tone toward AI')
    }

    if (confidence > 0.6) {
      insights.push('Speaks with high confidence and certainty')
    } else if (confidence < 0.4) {
      insights.push('Shows uncertainty - may need more clarity or support')
    }

    const frustrations = moments.filter(m => m.emotion === 'frustration')
    if (frustrations.length > 0) {
      insights.push(`Expressed frustration ${frustrations.length} time(s) - identify pain points`)
    }

    return insights
  }
}

interface EmotionalMoment {
  text: string
  emotion: string
  intensity: 'high' | 'medium' | 'low'
}

interface SentimentAnalysisResult {
  transcriptId: string
  interviewee: string
  overallSentiment: number
  confidenceLevel: number
  positiveScore: number
  negativeScore: number
  emotionalMoments: EmotionalMoment[]
  topicSentiments: Map<string, number>
  keyEmotionalInsights: string[]
}

/**
 * 4. THEME MINING AGENT
 * Identifies recurring themes and patterns across transcript content
 */
export class ThemeMiningAgent implements TranscriptAnalysisAgent {
  id = 'theme_mining_agent'
  name = 'Theme Miner'
  description = 'Identifies recurring themes and patterns in transcripts'

  private themeDefinitions: Record<string, { keywords: string[], dimension: string }> = {
    'no_formal_ai_plan': {
      keywords: ['no plan', 'no strategy', 'no roadmap', 'don\'t have a plan', 'haven\'t formalized', 'no formal'],
      dimension: 'strategy_alignment'
    },
    'no_roi_measurement': {
      keywords: ['not measuring', 'don\'t track', 'no roi', 'haven\'t quantified', 'hard to measure'],
      dimension: 'financial_performance'
    },
    'no_ethics_governance': {
      keywords: ['no ethics', 'no governance', 'no one accountable', 'haven\'t defined', 'no policy'],
      dimension: 'ai_governance'
    },
    'tool_fragmentation': {
      keywords: ['too many tools', 'fragmented', 'scattered', 'different tools', 'not standardized'],
      dimension: 'integration_capability'
    },
    'skills_gap': {
      keywords: ['skill gap', 'need training', 'don\'t know how', 'learning curve', 'not fluent'],
      dimension: 'skills_talent'
    },
    'resistance_to_change': {
      keywords: ['resist', 'won\'t adopt', 'old school', 'traditional', 'comfortable with'],
      dimension: 'culture_change'
    },
    'leadership_alignment': {
      keywords: ['leadership', 'partners aligned', 'top down', 'c-suite', 'vision'],
      dimension: 'leadership_vision'
    },
    'process_automation_need': {
      keywords: ['automate', 'manual', 'repetitive', 'workflow', 'efficiency'],
      dimension: 'process_optimization'
    },
    'reputation_exceeds_capability': {
      keywords: ['reputation', 'perception', 'talk about ai', 'not really doing', 'cobbler'],
      dimension: 'ai_use_cases'
    },
    'creative_team_leads': {
      keywords: ['creative', 'design', 'art', 'video', 'visual', 'ahead'],
      dimension: 'skills_talent'
    },
    'psychological_safety': {
      keywords: ['safe', 'afraid', 'fear', 'comfortable', 'permission', 'judgment'],
      dimension: 'culture_change'
    },
    'agentic_commerce': {
      keywords: ['agentic', 'agent', 'autonomous', 'shopping', 'commerce', 'future'],
      dimension: 'ai_use_cases'
    }
  }

  async analyze(transcripts: TranscriptData[]): Promise<ThemeMiningResult[]> {
    return Promise.all(transcripts.map(t => this.mineThemes(t)))
  }

  private async mineThemes(transcript: TranscriptData): Promise<ThemeMiningResult> {
    const content = transcript.rawContent.toLowerCase()
    const themes: ThemeCluster[] = []

    for (const [themeName, definition] of Object.entries(this.themeDefinitions)) {
      let matchCount = 0
      const matchingQuotes: string[] = []

      for (const keyword of definition.keywords) {
        const regex = new RegExp(`[^.!?]*${keyword}[^.!?]*[.!?]`, 'gi')
        const matches = transcript.rawContent.match(regex) || []
        matchCount += matches.length
        matchingQuotes.push(...matches.slice(0, 2))
      }

      if (matchCount >= 2) {
        themes.push({
          id: themeName,
          name: themeName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          description: `Theme identified from ${matchCount} keyword matches`,
          keywords: definition.keywords,
          frequency: matchCount,
          sentiment: this.calculateThemeSentiment(matchingQuotes.join(' ')),
          sourceInterviews: [transcript.interviewee.name],
          representativeQuotes: matchingQuotes.slice(0, 3),
          dimensions: [definition.dimension]
        })
      }
    }

    // Sort by frequency
    themes.sort((a, b) => b.frequency - a.frequency)

    return {
      transcriptId: transcript.id,
      interviewee: transcript.interviewee.name,
      themes,
      topThemes: themes.slice(0, 5).map(t => t.name),
      dimensionsCovered: [...new Set(themes.flatMap(t => t.dimensions))]
    }
  }

  private calculateThemeSentiment(text: string): number {
    const positive = ['good', 'great', 'helpful', 'improve', 'better', 'opportunity'].filter(w => text.toLowerCase().includes(w)).length
    const negative = ['problem', 'issue', 'challenge', 'difficult', 'gap', 'lack'].filter(w => text.toLowerCase().includes(w)).length
    const total = positive + negative
    return total > 0 ? (positive - negative) / total : 0
  }
}

interface ThemeMiningResult {
  transcriptId: string
  interviewee: string
  themes: ThemeCluster[]
  topThemes: string[]
  dimensionsCovered: string[]
}

/**
 * 5. REALITY GAP ANALYZER AGENT
 * Compares leadership perception vs actual evidence in transcripts
 */
export class RealityGapAnalyzerAgent implements TranscriptAnalysisAgent {
  id = 'reality_gap_analyzer_agent'
  name = 'Reality Gap Analyzer'
  description = 'Identifies gaps between leadership perception and reality'

  private dimensionIndicators: Record<string, { aspirational: string[], actual: string[] }> = {
    'skills_talent': {
      aspirational: ['we have talent', 'our people can', 'team is capable', 'skilled workforce'],
      actual: ['only', 'percent', 'few people', 'skill gap', 'need training', 'not fluent']
    },
    'ai_use_cases': {
      aspirational: ['we use ai', 'ai-powered', 'leverage ai', 'ai in everything'],
      actual: ['don\'t really', 'not actually', 'haven\'t implemented', 'experimenting', 'pilot']
    },
    'strategy_alignment': {
      aspirational: ['strategy', 'roadmap', 'plan', 'vision'],
      actual: ['no plan', 'don\'t have', 'haven\'t formalized', 'make it up']
    },
    'process_optimization': {
      aspirational: ['efficient', 'streamlined', 'automated', 'optimized'],
      actual: ['manual', 'repetitive', 'old school', 'same way', 'take forever']
    },
    'ai_governance': {
      aspirational: ['governance', 'ethics', 'policy', 'compliance'],
      actual: ['no one', 'haven\'t defined', 'don\'t have', 'need to']
    }
  }

  async analyze(transcripts: TranscriptData[]): Promise<RealityGapResult[]> {
    return Promise.all(transcripts.map(t => this.analyzeGaps(t)))
  }

  private async analyzeGaps(transcript: TranscriptData): Promise<RealityGapResult> {
    const content = transcript.rawContent.toLowerCase()
    const gaps: RealityGap[] = []

    for (const [dimension, indicators] of Object.entries(this.dimensionIndicators)) {
      const aspirationalMatches: string[] = []
      const actualMatches: string[] = []

      // Find aspirational statements
      for (const phrase of indicators.aspirational) {
        const regex = new RegExp(`[^.!?]*${phrase}[^.!?]*[.!?]`, 'gi')
        const matches = transcript.rawContent.match(regex) || []
        aspirationalMatches.push(...matches)
      }

      // Find actual/reality statements
      for (const phrase of indicators.actual) {
        const regex = new RegExp(`[^.!?]*${phrase}[^.!?]*[.!?]`, 'gi')
        const matches = transcript.rawContent.match(regex) || []
        actualMatches.push(...matches)
      }

      // Extract numeric estimates (e.g., "20%", "1 in 5")
      const percentageMatch = content.match(/(\d+)\s*(?:percent|%)/g)
      const fractionMatch = content.match(/(\d+)\s*(?:in|out of)\s*(\d+)/g)

      let actualScore = 5 // default middle
      if (percentageMatch && percentageMatch.length > 0) {
        const percentages = percentageMatch.map(p => parseInt(p.match(/\d+/)?.[0] || '50'))
        actualScore = Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length / 10)
      }

      // Calculate leadership perception based on tone
      let leadershipPerception = 7 // Leaders tend to be optimistic
      if (aspirationalMatches.length < actualMatches.length) {
        leadershipPerception = 5
      }

      const gap = leadershipPerception - actualScore

      if (Math.abs(gap) >= 2 || actualMatches.length > 0) {
        gaps.push({
          dimension,
          leadershipPerception,
          actualEvidence: actualScore,
          gap,
          evidence: {
            supporting: aspirationalMatches.slice(0, 2),
            contradicting: actualMatches.slice(0, 2)
          },
          confidence: Math.min((aspirationalMatches.length + actualMatches.length) / 10, 1)
        })
      }
    }

    // Sort by gap size
    gaps.sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))

    return {
      transcriptId: transcript.id,
      interviewee: transcript.interviewee.name,
      gaps,
      largestGaps: gaps.slice(0, 3).map(g => g.dimension),
      overallRealityGap: gaps.reduce((sum, g) => sum + g.gap, 0) / (gaps.length || 1)
    }
  }
}

interface RealityGapResult {
  transcriptId: string
  interviewee: string
  gaps: RealityGap[]
  largestGaps: string[]
  overallRealityGap: number
}

/**
 * 6. SKILLS MAPPING AGENT
 * Maps AI skills and fluency across individuals mentioned in transcripts
 */
export class SkillsMappingAgent implements TranscriptAnalysisAgent {
  id = 'skills_mapping_agent'
  name = 'Skills Mapper'
  description = 'Maps AI skills and fluency across organization'

  async analyze(transcripts: TranscriptData[]): Promise<SkillsMappingResult> {
    const allProfiles = new Map<string, PersonSkillProfile>()

    for (const transcript of transcripts) {
      const profiles = await this.extractSkillProfiles(transcript)
      for (const profile of profiles) {
        const existing = allProfiles.get(profile.name.toLowerCase())
        if (existing) {
          // Merge profiles
          existing.toolsUsed = [...new Set([...existing.toolsUsed, ...profile.toolsUsed])]
          existing.mentionedBy = [...new Set([...existing.mentionedBy, ...profile.mentionedBy])]
          existing.evidence = [...existing.evidence, ...profile.evidence]
          // Upgrade skill level if higher
          if (this.skillRank(profile.aiSkillLevel) > this.skillRank(existing.aiSkillLevel)) {
            existing.aiSkillLevel = profile.aiSkillLevel
          }
          existing.isChampion = existing.isChampion || profile.isChampion
        } else {
          allProfiles.set(profile.name.toLowerCase(), profile)
        }
      }
    }

    const profiles = Array.from(allProfiles.values())
    profiles.sort((a, b) => this.skillRank(b.aiSkillLevel) - this.skillRank(a.aiSkillLevel))

    return {
      profiles,
      champions: profiles.filter(p => p.isChampion),
      skillDistribution: this.calculateSkillDistribution(profiles),
      recommendedTrainingCohorts: this.identifyTrainingCohorts(profiles)
    }
  }

  private async extractSkillProfiles(transcript: TranscriptData): Promise<PersonSkillProfile[]> {
    const profiles: PersonSkillProfile[] = []
    const content = transcript.rawContent

    // Known AI champions from transcript analysis
    const championPatterns = [
      { pattern: /gaston|g\s|legorburu/gi, name: 'Gaston Legorburu', title: 'CEO' },
      { pattern: /matt\s*k|kujawa/gi, name: 'Matt Kujawa', title: 'Partner' },
      { pattern: /casey/gi, name: 'Casey Woods', title: 'Creative Director' },
      { pattern: /noel|artiles/gi, name: 'Noel Artiles', title: 'CCO' },
      { pattern: /joey|wilson|jw/gi, name: 'Joey Wilson', title: 'Partner' },
      { pattern: /angie/gi, name: 'Angie', title: 'Team Member' },
      { pattern: /juan|wally/gi, name: 'Juan (Wally)', title: 'Designer' }
    ]

    // Extract tools mentioned
    const tools = ['ChatGPT', 'Claude', 'MidJourney', 'Beautiful AI', 'Figma', 'Builder.io', 'Atlas', 'Perplexity', 'Copilot', 'Motion', 'N8N', 'Gamma']
    const toolsFound = tools.filter(t => content.toLowerCase().includes(t.toLowerCase()))

    for (const pattern of championPatterns) {
      const matches = content.match(pattern.pattern)
      if (matches && matches.length >= 2) {
        // Find context around mentions
        const contextRegex = new RegExp(`[^.!?]*${pattern.pattern.source}[^.!?]*[.!?]`, 'gi')
        const contexts = content.match(contextRegex) || []

        // Determine skill level from context
        const contextStr = contexts.join(' ').toLowerCase()
        let skillLevel: PersonSkillProfile['aiSkillLevel'] = 'intermediate'
        if (contextStr.includes('expert') || contextStr.includes('fluent') || contextStr.includes('best') || contextStr.includes('top')) {
          skillLevel = 'expert'
        } else if (contextStr.includes('advanced') || contextStr.includes('great') || contextStr.includes('good')) {
          skillLevel = 'advanced'
        } else if (contextStr.includes('learning') || contextStr.includes('starting') || contextStr.includes('beginning')) {
          skillLevel = 'beginner'
        }

        // Determine frequency
        let frequency: PersonSkillProfile['frequency'] = 'occasionally'
        if (contextStr.includes('daily') || contextStr.includes('every day')) {
          frequency = 'daily'
        } else if (contextStr.includes('weekly') || contextStr.includes('regular')) {
          frequency = 'weekly'
        }

        // Check if champion
        const isChampion = contextStr.includes('best') || contextStr.includes('lead') ||
                          contextStr.includes('top') || contextStr.includes('expert') ||
                          matches.length >= 5

        profiles.push({
          name: pattern.name,
          title: pattern.title,
          aiSkillLevel: skillLevel,
          toolsUsed: toolsFound,
          frequency,
          mentionedBy: [transcript.interviewee.name],
          evidence: contexts.slice(0, 3),
          isChampion,
          growthPotential: skillLevel === 'beginner' || skillLevel === 'intermediate' ? 'high' : 'medium'
        })
      }
    }

    // Add the interviewee themselves
    profiles.push({
      name: transcript.interviewee.name,
      title: transcript.interviewee.title,
      aiSkillLevel: this.inferIntervieweeSkillLevel(content),
      toolsUsed: toolsFound,
      frequency: this.inferUsageFrequency(content),
      mentionedBy: ['self'],
      evidence: [`Interviewee in ${transcript.id}`],
      isChampion: content.toLowerCase().includes('i use ai') || content.toLowerCase().includes('daily'),
      growthPotential: 'medium'
    })

    return profiles
  }

  private inferIntervieweeSkillLevel(content: string): PersonSkillProfile['aiSkillLevel'] {
    const lower = content.toLowerCase()
    const expertIndicators = ['i use', 'daily', 'workflow', 'integrated', 'automate'].filter(i => lower.includes(i)).length
    const beginnerIndicators = ['don\'t use', 'haven\'t tried', 'learning', 'new to'].filter(i => lower.includes(i)).length

    if (expertIndicators >= 3) return 'expert'
    if (expertIndicators >= 2) return 'advanced'
    if (beginnerIndicators >= 2) return 'beginner'
    return 'intermediate'
  }

  private inferUsageFrequency(content: string): PersonSkillProfile['frequency'] {
    const lower = content.toLowerCase()
    if (lower.includes('every day') || lower.includes('daily')) return 'daily'
    if (lower.includes('weekly') || lower.includes('regularly')) return 'weekly'
    if (lower.includes('occasionally') || lower.includes('sometimes')) return 'occasionally'
    if (lower.includes('rarely') || lower.includes('not often')) return 'rarely'
    return 'occasionally'
  }

  private skillRank(level: PersonSkillProfile['aiSkillLevel']): number {
    const ranks = { expert: 5, advanced: 4, intermediate: 3, beginner: 2, none: 1 }
    return ranks[level]
  }

  private calculateSkillDistribution(profiles: PersonSkillProfile[]): Record<string, number> {
    const distribution: Record<string, number> = {
      expert: 0, advanced: 0, intermediate: 0, beginner: 0, none: 0
    }
    for (const p of profiles) {
      distribution[p.aiSkillLevel]++
    }
    return distribution
  }

  private identifyTrainingCohorts(profiles: PersonSkillProfile[]): TrainingCohort[] {
    return [
      {
        name: 'AI Champions Program',
        description: 'Advanced training for identified AI leaders',
        members: profiles.filter(p => p.aiSkillLevel === 'expert' || p.aiSkillLevel === 'advanced').map(p => p.name),
        focus: ['AI strategy', 'Change leadership', 'Tool evaluation']
      },
      {
        name: 'AI Practitioners',
        description: 'Skill building for intermediate users',
        members: profiles.filter(p => p.aiSkillLevel === 'intermediate').map(p => p.name),
        focus: ['Prompt engineering', 'Workflow integration', 'Best practices']
      },
      {
        name: 'AI Foundations',
        description: 'Introduction for beginners',
        members: profiles.filter(p => p.aiSkillLevel === 'beginner' || p.aiSkillLevel === 'none').map(p => p.name),
        focus: ['AI basics', 'Tool introduction', 'Use cases']
      }
    ]
  }
}

interface TrainingCohort {
  name: string
  description: string
  members: string[]
  focus: string[]
}

interface SkillsMappingResult {
  profiles: PersonSkillProfile[]
  champions: PersonSkillProfile[]
  skillDistribution: Record<string, number>
  recommendedTrainingCohorts: TrainingCohort[]
}

/**
 * 7. CROSS-INTERVIEW SYNTHESIZER AGENT
 * Synthesizes findings across all interviews for holistic analysis
 */
export class CrossInterviewSynthesizerAgent implements TranscriptAnalysisAgent {
  id = 'cross_interview_synthesizer_agent'
  name = 'Cross-Interview Synthesizer'
  description = 'Synthesizes findings across all interviews'

  async analyze(transcripts: TranscriptData[]): Promise<CrossInterviewSynthesis> {
    // Run all other agents first
    const parser = new TranscriptParserAgent()
    const entityAgent = new EntityExtractionAgent()
    const sentimentAgent = new SentimentAnalyzerAgent()
    const themeAgent = new ThemeMiningAgent()
    const gapAgent = new RealityGapAnalyzerAgent()
    const skillsAgent = new SkillsMappingAgent()

    const [entities, sentiments, themes, gaps, skills] = await Promise.all([
      entityAgent.analyze(transcripts),
      sentimentAgent.analyze(transcripts),
      themeAgent.analyze(transcripts),
      gapAgent.analyze(transcripts),
      skillsAgent.analyze(transcripts)
    ])

    // Aggregate consensus themes
    const themeFrequency = new Map<string, number>()
    const themeDetails = new Map<string, ThemeCluster>()
    for (const result of themes) {
      for (const theme of result.themes) {
        themeFrequency.set(theme.id, (themeFrequency.get(theme.id) || 0) + 1)
        const existing = themeDetails.get(theme.id)
        if (existing) {
          existing.frequency += theme.frequency
          existing.sourceInterviews.push(...theme.sourceInterviews)
          existing.representativeQuotes.push(...theme.representativeQuotes.slice(0, 2))
        } else {
          themeDetails.set(theme.id, { ...theme })
        }
      }
    }

    const consensusThemes = Array.from(themeDetails.values())
      .filter(t => (themeFrequency.get(t.id) || 0) >= Math.ceil(transcripts.length / 2))
      .sort((a, b) => b.frequency - a.frequency)

    // Identify divergence points
    const divergencePoints = this.identifyDivergence(themes)

    // Aggregate reality gaps
    const aggregatedGaps = this.aggregateRealityGaps(gaps)

    // Generate aggregate scores
    const aggregateScores = this.calculateAggregateScores(themes, gaps, sentiments)

    // Generate executive summary
    const executiveSummary = this.generateExecutiveSummary(
      transcripts.length,
      consensusThemes,
      aggregatedGaps,
      skills.champions,
      aggregateScores
    )

    // Generate recommendations
    const recommendations = this.generateRecommendations(consensusThemes, aggregatedGaps, skills)

    return {
      organizationId: transcripts[0]?.organization || 'unknown',
      totalInterviews: transcripts.length,
      consensusThemes,
      divergencePoints,
      realityGaps: aggregatedGaps,
      skillsMap: skills.profiles,
      aggregateScores,
      executiveSummary,
      actionableRecommendations: recommendations
    }
  }

  private identifyDivergence(themes: ThemeMiningResult[]): CrossInterviewSynthesis['divergencePoints'] {
    const points: CrossInterviewSynthesis['divergencePoints'] = []

    // Look for topics with varying sentiment
    const topicPositions = new Map<string, { interviewee: string; position: string }[]>()

    for (const result of themes) {
      for (const theme of result.themes) {
        const positions = topicPositions.get(theme.id) || []
        positions.push({
          interviewee: result.interviewee,
          position: theme.sentiment > 0 ? 'positive' : theme.sentiment < 0 ? 'negative' : 'neutral'
        })
        topicPositions.set(theme.id, positions)
      }
    }

    for (const [topic, positions] of topicPositions) {
      const uniquePositions = new Set(positions.map(p => p.position))
      if (uniquePositions.size >= 2 && positions.length >= 3) {
        points.push({
          topic,
          positions,
          significance: uniquePositions.size === 3 ? 'high' : 'medium'
        })
      }
    }

    return points
  }

  private aggregateRealityGaps(gapResults: RealityGapResult[]): RealityGap[] {
    const aggregated = new Map<string, RealityGap>()

    for (const result of gapResults) {
      for (const gap of result.gaps) {
        const existing = aggregated.get(gap.dimension)
        if (existing) {
          existing.leadershipPerception = (existing.leadershipPerception + gap.leadershipPerception) / 2
          existing.actualEvidence = (existing.actualEvidence + gap.actualEvidence) / 2
          existing.gap = existing.leadershipPerception - existing.actualEvidence
          existing.evidence.supporting.push(...gap.evidence.supporting)
          existing.evidence.contradicting.push(...gap.evidence.contradicting)
          existing.confidence = (existing.confidence + gap.confidence) / 2
        } else {
          aggregated.set(gap.dimension, { ...gap })
        }
      }
    }

    return Array.from(aggregated.values()).sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))
  }

  private calculateAggregateScores(
    themes: ThemeMiningResult[],
    gaps: RealityGapResult[],
    sentiments: SentimentAnalysisResult[]
  ): Map<string, number> {
    const scores = new Map<string, number>()
    const dimensions = [
      'skills_talent', 'ai_use_cases', 'strategy_alignment', 'process_optimization',
      'ai_governance', 'leadership_vision', 'culture_change', 'integration_capability'
    ]

    for (const dim of dimensions) {
      // Start with baseline
      let score = 5

      // Adjust based on reality gaps
      for (const gapResult of gaps) {
        const gap = gapResult.gaps.find(g => g.dimension === dim)
        if (gap) {
          score = gap.actualEvidence
        }
      }

      // Adjust based on sentiment
      const avgSentiment = sentiments.reduce((sum, s) => sum + s.overallSentiment, 0) / sentiments.length
      if (avgSentiment > 0.2) score += 0.5
      if (avgSentiment < -0.2) score -= 0.5

      scores.set(dim, Math.max(0, Math.min(10, Math.round(score * 10) / 10)))
    }

    return scores
  }

  private generateExecutiveSummary(
    interviewCount: number,
    themes: ThemeCluster[],
    gaps: RealityGap[],
    champions: PersonSkillProfile[],
    scores: Map<string, number>
  ): string {
    const topThemes = themes.slice(0, 3).map(t => t.name).join(', ')
    const topGaps = gaps.slice(0, 2).map(g => g.dimension.replace(/_/g, ' ')).join(' and ')
    const championNames = champions.slice(0, 3).map(c => c.name).join(', ')
    const avgScore = Array.from(scores.values()).reduce((a, b) => a + b, 0) / scores.size

    return `Based on analysis of ${interviewCount} C-suite interviews, the organization demonstrates emerging AI adoption with significant gaps between leadership aspiration and operational reality. Key themes include: ${topThemes}. The largest reality gaps exist in ${topGaps}. Identified AI champions (${championNames}) can serve as change agents. Overall AI maturity score: ${avgScore.toFixed(1)}/10. Immediate priorities should focus on formalizing AI strategy, establishing governance, and targeted upskilling.`
  }

  private generateRecommendations(
    themes: ThemeCluster[],
    gaps: RealityGap[],
    skills: SkillsMappingResult
  ): CrossInterviewSynthesis['actionableRecommendations'] {
    const immediate: string[] = []
    const shortTerm: string[] = []
    const longTerm: string[] = []

    // Based on gaps
    for (const gap of gaps.slice(0, 3)) {
      if (gap.gap >= 3) {
        immediate.push(`Address ${gap.dimension.replace(/_/g, ' ')} gap: current reality is ${gap.actualEvidence}/10 vs perception of ${gap.leadershipPerception}/10`)
      }
    }

    // Based on themes
    if (themes.some(t => t.id === 'no_formal_ai_plan')) {
      immediate.push('Develop and communicate formal AI strategy within 90 days')
    }
    if (themes.some(t => t.id === 'no_ethics_governance')) {
      shortTerm.push('Establish AI ethics and governance framework with designated owner')
    }
    if (themes.some(t => t.id === 'tool_fragmentation')) {
      shortTerm.push('Consolidate and standardize AI tool stack across organization')
    }
    if (themes.some(t => t.id === 'skills_gap')) {
      shortTerm.push('Launch tiered AI training program for all employees')
    }
    if (themes.some(t => t.id === 'process_automation_need')) {
      longTerm.push('Implement workflow automation for top 5 repetitive processes')
    }

    // Based on skills
    if (skills.champions.length > 0) {
      immediate.push(`Empower identified AI champions (${skills.champions.slice(0, 3).map(c => c.name).join(', ')}) to lead transformation`)
    }

    // Add generic recommendations
    shortTerm.push('Establish ROI measurement framework for AI initiatives')
    longTerm.push('Build AI Center of Excellence with dedicated resources')
    longTerm.push('Create psychological safety for experimentation and learning')

    return {
      immediate: immediate.slice(0, 5),
      shortTerm: shortTerm.slice(0, 5),
      longTerm: longTerm.slice(0, 5)
    }
  }
}

/**
 * 8. MATURITY EVIDENCE SCORER AGENT
 * Converts qualitative transcript evidence to quantitative dimension scores
 */
export class MaturityEvidenceScorerAgent implements TranscriptAnalysisAgent {
  id = 'maturity_evidence_scorer_agent'
  name = 'Maturity Evidence Scorer'
  description = 'Converts qualitative evidence to quantitative maturity scores'

  private scoringRubric: Record<string, ScoringCriteria> = {
    'skills_talent': {
      level0: ['no one uses', 'don\'t know', 'not aware', 'no training'],
      level3: ['some people', 'few users', 'starting to', 'learning'],
      level5: ['half the team', '50%', 'many people', 'regular training'],
      level7: ['most people', 'majority', '70%', 'embedded'],
      level9: ['everyone', 'all employees', 'company-wide', 'fluent']
    },
    'ai_use_cases': {
      level0: ['no ai', 'not using', 'haven\'t implemented'],
      level3: ['experimenting', 'pilot', 'trying', 'one or two'],
      level5: ['several use cases', 'multiple projects', 'expanding'],
      level7: ['production', 'enterprise-wide', 'core workflow'],
      level9: ['ai-first', 'transformed', 'industry leader']
    },
    'strategy_alignment': {
      level0: ['no strategy', 'no plan', 'reactive'],
      level3: ['informal', 'ad hoc', 'starting to plan'],
      level5: ['documented', 'some alignment', 'roadmap exists'],
      level7: ['integrated', 'aligned', 'board-level'],
      level9: ['ai-native', 'strategic pillar', 'fully integrated']
    },
    'process_optimization': {
      level0: ['manual', 'no automation', 'inefficient'],
      level3: ['some automation', 'basic', 'starting'],
      level5: ['automated workflows', 'improving', 'documented'],
      level7: ['intelligent automation', 'optimized', 'measured'],
      level9: ['self-optimizing', 'ai-driven', 'zero-touch']
    },
    'ai_governance': {
      level0: ['no governance', 'no policy', 'not addressed'],
      level3: ['informal', 'ad hoc', 'starting'],
      level5: ['basic framework', 'some policies', 'designated'],
      level7: ['comprehensive', 'enforced', 'ethics board'],
      level9: ['industry leader', 'proactive', 'certified']
    },
    'leadership_vision': {
      level0: ['no vision', 'not interested', 'skeptical'],
      level3: ['aware', 'considering', 'interested'],
      level5: ['committed', 'engaged', 'supportive'],
      level7: ['championing', 'leading', 'driving'],
      level9: ['visionary', 'transformational', 'industry thought leader']
    },
    'culture_change': {
      level0: ['resistant', 'fear', 'opposition'],
      level3: ['hesitant', 'cautious', 'some openness'],
      level5: ['willing', 'adapting', 'learning'],
      level7: ['embracing', 'innovative', 'proactive'],
      level9: ['ai-native', 'pioneering', 'change leaders']
    }
  }

  async analyze(transcripts: TranscriptData[]): Promise<MaturityEvidenceResult> {
    const dimensionScores = new Map<string, DimensionScore>()

    for (const [dimension, criteria] of Object.entries(this.scoringRubric)) {
      const score = await this.scoreDimension(transcripts, dimension, criteria)
      dimensionScores.set(dimension, score)
    }

    const overallMaturity = this.calculateOverallMaturity(dimensionScores)
    const confidenceLevel = this.calculateConfidence(dimensionScores)

    return {
      dimensionScores,
      overallMaturity,
      confidenceLevel,
      maturityProfile: this.generateMaturityProfile(dimensionScores),
      gapPrioritization: this.prioritizeGaps(dimensionScores)
    }
  }

  private async scoreDimension(
    transcripts: TranscriptData[],
    dimension: string,
    criteria: ScoringCriteria
  ): Promise<DimensionScore> {
    const allContent = transcripts.map(t => t.rawContent.toLowerCase()).join(' ')
    const evidence: string[] = []
    let levelScores: number[] = []

    // Check each level
    for (const [level, phrases] of Object.entries(criteria)) {
      const levelNum = parseInt(level.replace('level', ''))
      for (const phrase of phrases) {
        const regex = new RegExp(`[^.!?]*${phrase}[^.!?]*[.!?]`, 'gi')
        const matches = transcripts.flatMap(t => t.rawContent.match(regex) || [])
        if (matches.length > 0) {
          evidence.push(...matches.slice(0, 2))
          levelScores.push(levelNum)
        }
      }
    }

    // Calculate weighted average score
    const score = levelScores.length > 0
      ? levelScores.reduce((a, b) => a + b, 0) / levelScores.length
      : 5

    return {
      dimension,
      score: Math.round(score * 10) / 10,
      evidence: evidence.slice(0, 5),
      confidence: Math.min(evidence.length / 10, 1),
      levelMatches: levelScores.length
    }
  }

  private calculateOverallMaturity(scores: Map<string, DimensionScore>): number {
    const values = Array.from(scores.values())
    const weightedSum = values.reduce((sum, s) => sum + s.score * s.confidence, 0)
    const totalWeight = values.reduce((sum, s) => sum + s.confidence, 0)
    return Math.round((weightedSum / totalWeight) * 10) / 10
  }

  private calculateConfidence(scores: Map<string, DimensionScore>): number {
    const values = Array.from(scores.values())
    return values.reduce((sum, s) => sum + s.confidence, 0) / values.length
  }

  private generateMaturityProfile(scores: Map<string, DimensionScore>): MaturityProfile {
    const strengths: string[] = []
    const weaknesses: string[] = []
    const opportunities: string[] = []

    for (const [dimension, score] of scores) {
      if (score.score >= 7) {
        strengths.push(dimension.replace(/_/g, ' '))
      } else if (score.score <= 3) {
        weaknesses.push(dimension.replace(/_/g, ' '))
      } else if (score.score >= 4 && score.score <= 6) {
        opportunities.push(dimension.replace(/_/g, ' '))
      }
    }

    return { strengths, weaknesses, opportunities }
  }

  private prioritizeGaps(scores: Map<string, DimensionScore>): GapPrioritization[] {
    return Array.from(scores.entries())
      .filter(([_, score]) => score.score < 5)
      .map(([dimension, score]) => ({
        dimension,
        currentScore: score.score,
        targetScore: Math.min(score.score + 3, 9),
        priority: (score.score < 3 ? 'critical' : score.score < 4 ? 'high' : 'medium') as 'low' | 'medium' | 'high' | 'critical',
        effort: (score.score < 3 ? 'high' : 'medium') as 'low' | 'medium' | 'high'
      }))
      .sort((a, b) => a.currentScore - b.currentScore)
  }
}

interface ScoringCriteria {
  level0: string[]
  level3: string[]
  level5: string[]
  level7: string[]
  level9: string[]
}

interface DimensionScore {
  dimension: string
  score: number
  evidence: string[]
  confidence: number
  levelMatches: number
}

interface MaturityProfile {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
}

interface GapPrioritization {
  dimension: string
  currentScore: number
  targetScore: number
  priority: 'critical' | 'high' | 'medium' | 'low'
  effort: 'high' | 'medium' | 'low'
}

interface MaturityEvidenceResult {
  dimensionScores: Map<string, DimensionScore>
  overallMaturity: number
  confidenceLevel: number
  maturityProfile: MaturityProfile
  gapPrioritization: GapPrioritization[]
}

/**
 * TRANSCRIPT ANALYSIS ORCHESTRATOR
 * Coordinates all transcript analysis agents for parallel processing
 */
export class TranscriptAnalysisOrchestrator {
  private agents: TranscriptAnalysisAgent[] = []

  constructor() {
    this.agents = [
      new TranscriptParserAgent(),
      new EntityExtractionAgent(),
      new SentimentAnalyzerAgent(),
      new ThemeMiningAgent(),
      new RealityGapAnalyzerAgent(),
      new SkillsMappingAgent(),
      new MaturityEvidenceScorerAgent(),
      new CrossInterviewSynthesizerAgent()
    ]
  }

  async analyzeTranscripts(transcripts: TranscriptData[]): Promise<FullAnalysisResult> {
    console.log(`Starting analysis of ${transcripts.length} transcripts with ${this.agents.length} agents...`)

    // Run agents in parallel where possible
    const [
      entityResults,
      sentimentResults,
      themeResults,
      gapResults,
      skillsResult,
      maturityResult,
      synthesis
    ] = await Promise.all([
      new EntityExtractionAgent().analyze(transcripts),
      new SentimentAnalyzerAgent().analyze(transcripts),
      new ThemeMiningAgent().analyze(transcripts),
      new RealityGapAnalyzerAgent().analyze(transcripts),
      new SkillsMappingAgent().analyze(transcripts),
      new MaturityEvidenceScorerAgent().analyze(transcripts),
      new CrossInterviewSynthesizerAgent().analyze(transcripts)
    ])

    return {
      transcriptCount: transcripts.length,
      analysisTimestamp: new Date(),
      entities: entityResults,
      sentiments: sentimentResults,
      themes: themeResults,
      realityGaps: gapResults,
      skillsMapping: skillsResult,
      maturityScores: maturityResult,
      synthesis,
      executiveSummary: synthesis.executiveSummary,
      recommendations: synthesis.actionableRecommendations
    }
  }
}

interface FullAnalysisResult {
  transcriptCount: number
  analysisTimestamp: Date
  entities: EntityExtractionResult[]
  sentiments: SentimentAnalysisResult[]
  themes: ThemeMiningResult[]
  realityGaps: RealityGapResult[]
  skillsMapping: SkillsMappingResult
  maturityScores: MaturityEvidenceResult
  synthesis: CrossInterviewSynthesis
  executiveSummary: string
  recommendations: CrossInterviewSynthesis['actionableRecommendations']
}

// Export singleton orchestrator
export const transcriptAnalysisOrchestrator = new TranscriptAnalysisOrchestrator()
