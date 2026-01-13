#!/usr/bin/env ts-node
/**
 * LLM-Powered Dimension Scoring for GlueIQ Transcript Analysis
 *
 * Uses Claude API to analyze transcript segments and score dimensions
 * on the LVNG.AI maturity scale (-2 to 10).
 *
 * Usage:
 *   import { scoreDimensionWithLLM, scoreAllDimensions } from './llm-dimension-scorer'
 */

import Anthropic from '@anthropic-ai/sdk'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Score range for LVNG.AI maturity scale
 * -2: Actively Hostile
 * -1: Resistant
 *  0: AI Unaware
 *  1: AI Curious
 *  2: AI Experimenting
 *  3-10: Progressive maturity levels
 */
export type MaturityScore = -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export interface TranscriptSegment {
  source: string // Interviewee name or transcript ID
  content: string
  role?: string
  department?: string
  timestamp?: Date
}

export interface DimensionRubric {
  name: string
  category: DimensionCategory
  description: string
  scoringGuidelines: {
    level: MaturityScore
    label: string
    indicators: string[]
  }[]
}

export interface DimensionAnalysis {
  dimension: string
  dimensionName: string
  category: DimensionCategory
  score: MaturityScore
  reasoning: string
  supportingEvidence: EvidenceItem[]
  contradictingEvidence: EvidenceItem[]
  confidence: number // 0-1
  keyInsights: string[]
}

export interface EvidenceItem {
  quote: string
  source: string
  relevance: 'strong' | 'moderate' | 'weak'
}

export interface BatchScoringResult {
  dimensions: DimensionAnalysis[]
  overallMaturity: number
  overallConfidence: number
  categoryScores: Record<DimensionCategory, number>
  timestamp: Date
  processingTime: number
  tokensUsed: number
}

export type DimensionCategory =
  | 'Strategy & Leadership'
  | 'People & Culture'
  | 'Technology & Data'
  | 'Operations & Processes'
  | 'Governance & Risk'

export interface ScoringConfig {
  model?: string
  maxTokens?: number
  temperature?: number
  batchSize?: number
  rateLimitDelayMs?: number
  verbose?: boolean
}

// ============================================================================
// DIMENSION DEFINITIONS (LVNG.AI Framework - 23 Dimensions)
// ============================================================================

export const DIMENSION_DEFINITIONS: Record<string, DimensionRubric> = {
  // STRATEGY & LEADERSHIP (5 dimensions)
  leadership_vision: {
    name: 'Leadership Vision',
    category: 'Strategy & Leadership',
    description: 'C-suite commitment, AI vision clarity, and leadership engagement with AI transformation',
    scoringGuidelines: [
      { level: -2, label: 'Actively Hostile', indicators: ['Leadership blocks AI initiatives', 'Anti-AI stance from executives', 'Active sabotage of AI adoption'] },
      { level: -1, label: 'Resistant', indicators: ['Skeptical leadership', 'Resistant executives', 'AI seen as threat by leaders'] },
      { level: 0, label: 'AI Unaware', indicators: ['No AI vision', 'Not interested', 'Skeptical', 'Resistant'] },
      { level: 1, label: 'AI Curious', indicators: ['Aware of AI', 'Considering investment', 'Interested', 'Want to invest', 'See potential'] },
      { level: 2, label: 'AI Experimenting', indicators: ['Committed', 'Engaged', 'Supportive', 'Aligned', 'Investing'] },
      { level: 3, label: 'AI Connecting', indicators: ['Championing AI', 'Leading initiatives', 'Driving adoption', 'Modeling behavior'] },
      { level: 4, label: 'AI Collaborating', indicators: ['AI advocates', 'Leading transformation', 'Public commitment'] },
      { level: 5, label: 'AI Integrating', indicators: ['Visionary leadership', 'AI-first executives', 'Industry voice'] },
      { level: 6, label: 'AI Orchestrating', indicators: ['Enterprise AI vision', 'Strategic AI leadership', 'Board mandate'] },
      { level: 7, label: 'AI Leading', indicators: ['Industry thought leader', 'AI evangelist', 'Market shaper'] },
      { level: 8, label: 'AI Innovating', indicators: ['AI-driven leadership', 'Autonomous decisions', 'Innovation pioneer'] },
      { level: 9, label: 'AI Transforming', indicators: ['Transformational leader', 'AI-native executive', 'Adaptive vision'] },
      { level: 10, label: 'AI Transcending', indicators: ['Transcendent leadership', 'Consciousness leader', 'Living vision'] }
    ]
  },
  strategy_alignment: {
    name: 'Strategy Alignment',
    category: 'Strategy & Leadership',
    description: 'AI strategy alignment with business goals, formal planning, and roadmap existence',
    scoringGuidelines: [
      { level: -2, label: 'Actively Hostile', indicators: ['Anti-AI strategy', 'Banning AI', 'Blocking adoption'] },
      { level: -1, label: 'Resistant', indicators: ['Ignoring AI', 'No interest', 'Resistant to strategy'] },
      { level: 0, label: 'AI Unaware', indicators: ['No strategy', 'No plan', 'No roadmap', 'Reactive', 'Ad hoc', 'No formal plan'] },
      { level: 1, label: 'AI Curious', indicators: ['Discussing', 'Considering', 'Talking about', 'Want to', 'Plan to', 'Thinking about'] },
      { level: 2, label: 'AI Experimenting', indicators: ['Starting to plan', 'Informal roadmap', 'Pilot budget', 'Initial investment'] },
      { level: 3, label: 'AI Connecting', indicators: ['Documented strategy', 'Formal plan', 'Budget allocated', 'Roadmap exists'] },
      { level: 4, label: 'AI Collaborating', indicators: ['Integrated plan', 'Cross-functional strategy', '50% aligned'] },
      { level: 5, label: 'AI Integrating', indicators: ['Department strategies', 'Custom AI roadmaps', 'AI-first planning'] },
      { level: 6, label: 'AI Orchestrating', indicators: ['Enterprise strategy', 'AI central to business', 'Predictive planning'] },
      { level: 7, label: 'AI Leading', indicators: ['Board-level strategy', 'AI strategic pillar', 'Market leadership'] },
      { level: 8, label: 'AI Innovating', indicators: ['AI-driven strategy', 'Autonomous planning', 'Innovation-led'] },
      { level: 9, label: 'AI Transforming', indicators: ['Adaptive strategy', 'Real-time evolution', 'AI-native business'] },
      { level: 10, label: 'AI Transcending', indicators: ['Transcendent strategy', 'Living strategy', 'Self-evolving'] }
    ]
  },
  change_management: {
    name: 'Change Management',
    category: 'Strategy & Leadership',
    description: 'Organizational change readiness, communication, and transformation execution',
    scoringGuidelines: [
      { level: -2, label: 'Actively Hostile', indicators: ['Blocking change', 'Sabotaging transformation', 'Active resistance'] },
      { level: -1, label: 'Resistant', indicators: ['Resistant to change', 'Change fatigue', 'Transformation failure'] },
      { level: 0, label: 'AI Unaware', indicators: ['No change plan', 'No communication', 'Surprised by change', 'Unprepared'] },
      { level: 1, label: 'AI Curious', indicators: ['Starting to communicate', 'Awareness building', 'Initial discussions'] },
      { level: 2, label: 'AI Experimenting', indicators: ['Change plan exists', 'Communication started', 'Some training'] },
      { level: 3, label: 'AI Connecting', indicators: ['Formal change program', 'Stakeholder engagement', 'Training underway'] },
      { level: 4, label: 'AI Collaborating', indicators: ['Change champions', 'Regular communication', 'Adoption tracking'] },
      { level: 5, label: 'AI Integrating', indicators: ['Embedded change', 'Culture shifting', 'Continuous improvement'] },
      { level: 6, label: 'AI Orchestrating', indicators: ['Enterprise change', 'Agile transformation', 'Rapid adaptation'] },
      { level: 7, label: 'AI Leading', indicators: ['Change leadership', 'Industry benchmark', 'Best practices'] },
      { level: 8, label: 'AI Innovating', indicators: ['Autonomous change', 'Self-organizing', 'Adaptive organization'] },
      { level: 9, label: 'AI Transforming', indicators: ['Continuous evolution', 'Living organization', 'Real-time adaptation'] },
      { level: 10, label: 'AI Transcending', indicators: ['Transcendent change', 'Consciousness evolution', 'Universal adaptation'] }
    ]
  },
  competitive_positioning: {
    name: 'Competitive Positioning',
    category: 'Strategy & Leadership',
    description: 'AI-driven market differentiation and competitive awareness',
    scoringGuidelines: [
      { level: -2, label: 'Actively Hostile', indicators: ['Losing market share to AI', 'AI disrupted', 'Falling behind'] },
      { level: -1, label: 'Resistant', indicators: ['Ignoring competition', 'No awareness', 'Complacent'] },
      { level: 0, label: 'AI Unaware', indicators: ['No competitive awareness', 'Not tracking AI', 'Reactive'] },
      { level: 1, label: 'AI Curious', indicators: ['Watching competitors', 'Aware of AI trends', 'Discussing threat'] },
      { level: 2, label: 'AI Experimenting', indicators: ['Competitive analysis', 'AI benchmarking', 'Initial response'] },
      { level: 3, label: 'AI Connecting', indicators: ['AI differentiation', 'Competitive advantage', 'Market positioning'] },
      { level: 4, label: 'AI Collaborating', indicators: ['AI leadership', 'Market innovation', 'Customer value'] },
      { level: 5, label: 'AI Integrating', indicators: ['Industry leader', 'AI-driven differentiation', 'Market shaper'] },
      { level: 6, label: 'AI Orchestrating', indicators: ['Market dominance', 'AI ecosystem leader', 'Standard setter'] },
      { level: 7, label: 'AI Leading', indicators: ['Industry transformer', 'Market creator', 'Category leader'] },
      { level: 8, label: 'AI Innovating', indicators: ['Autonomous positioning', 'AI-driven strategy', 'Market prediction'] },
      { level: 9, label: 'AI Transforming', indicators: ['Adaptive positioning', 'Real-time response', 'Market evolution'] },
      { level: 10, label: 'AI Transcending', indicators: ['Transcendent positioning', 'Market creation', 'Industry transcendence'] }
    ]
  },
  innovation_capacity: {
    name: 'Innovation Capacity',
    category: 'Strategy & Leadership',
    description: 'Ability to innovate with AI, experimentation culture, and R&D investment',
    scoringGuidelines: [
      { level: -2, label: 'Actively Hostile', indicators: ['Blocking innovation', 'Killing ideas', 'Status quo'] },
      { level: -1, label: 'Resistant', indicators: ['Resistant to innovation', 'Risk averse', 'No experimentation'] },
      { level: 0, label: 'AI Unaware', indicators: ['No innovation', 'No experimentation', 'No R&D', 'No ideas'] },
      { level: 1, label: 'AI Curious', indicators: ['Some ideas', 'Discussing innovation', 'Interested in new'] },
      { level: 2, label: 'AI Experimenting', indicators: ['Pilot projects', 'Experimentation starting', 'Innovation time'] },
      { level: 3, label: 'AI Connecting', indicators: ['Innovation program', 'Dedicated resources', 'Regular experiments'] },
      { level: 4, label: 'AI Collaborating', indicators: ['Innovation culture', 'Fail fast', 'Continuous experimentation'] },
      { level: 5, label: 'AI Integrating', indicators: ['AI-driven innovation', 'Predictive R&D', 'Rapid prototyping'] },
      { level: 6, label: 'AI Orchestrating', indicators: ['Enterprise innovation', 'Cross-functional', 'Portfolio approach'] },
      { level: 7, label: 'AI Leading', indicators: ['Industry innovation', 'Thought leadership', 'Patent generation'] },
      { level: 8, label: 'AI Innovating', indicators: ['Autonomous innovation', 'AI creates ideas', 'Self-improving'] },
      { level: 9, label: 'AI Transforming', indicators: ['Adaptive innovation', 'Real-time ideation', 'Living innovation'] },
      { level: 10, label: 'AI Transcending', indicators: ['Transcendent innovation', 'Reality creation', 'Breakthrough discovery'] }
    ]
  },

  // PEOPLE & CULTURE (5 dimensions)
  skills_talent: {
    name: 'Skills & Talent',
    category: 'People & Culture',
    description: 'AI skills across the workforce, training programs, and talent development',
    scoringGuidelines: [
      { level: -2, label: 'Actively Hostile', indicators: ['Blocking training', 'Against AI', 'Refuse to learn', 'AI will destroy'] },
      { level: -1, label: 'Resistant', indicators: ['Resistant', "Won't learn", 'Skeptical workforce', 'Afraid', 'Threatened'] },
      { level: 0, label: 'AI Unaware', indicators: ['No one uses', "Don't know", 'Not aware', 'No training', '75% not using', '85% not using'] },
      { level: 1, label: 'AI Curious', indicators: ['Some people', 'Few users', 'Starting to', 'Exploring', 'Trying out', 'Personal use'] },
      { level: 2, label: 'AI Experimenting', indicators: ['25% using', 'Regular training', 'Team learning', 'Weekly usage', 'Standard tools'] },
      { level: 3, label: 'AI Connecting', indicators: ['Half the team', '50%', 'Many people', 'Embedded', 'Daily workflows'] },
      { level: 4, label: 'AI Collaborating', indicators: ['Most team members', '60%', 'Integrated workflows', 'AI-augmented'] },
      { level: 5, label: 'AI Integrating', indicators: ['Majority', '70%', 'Company-wide adoption', 'AI fluent', '3:1 ratio'] },
      { level: 6, label: 'AI Orchestrating', indicators: ['All employees', 'Enterprise fluency', 'AI-first culture', '80%+'] },
      { level: 7, label: 'AI Leading', indicators: ['Industry leaders', 'AI experts', 'Thought leaders', '90%+'] },
      { level: 8, label: 'AI Innovating', indicators: ['Creating AI tools', 'AI developers', 'Building systems'] },
      { level: 9, label: 'AI Transforming', indicators: ['AI architects', 'AI-native workforce', 'Human-AI fusion'] },
      { level: 10, label: 'AI Transcending', indicators: ['Transcendent skills', 'Consciousness integration', 'Living systems'] }
    ]
  },
  cultural_readiness: {
    name: 'Cultural Readiness',
    category: 'People & Culture',
    description: 'Organizational culture openness to AI and change acceptance',
    scoringGuidelines: [
      { level: -2, label: 'Actively Hostile', indicators: ['Toxic culture', 'Anti-change', 'Hostile environment'] },
      { level: -1, label: 'Resistant', indicators: ['Resistant culture', 'Fear of change', 'Blame culture'] },
      { level: 0, label: 'AI Unaware', indicators: ['No readiness', 'Unaware', 'Traditional culture', 'Change resistant'] },
      { level: 1, label: 'AI Curious', indicators: ['Starting conversations', 'Some openness', 'Curious culture'] },
      { level: 2, label: 'AI Experimenting', indicators: ['Accepting change', 'Open to AI', 'Experimentation allowed'] },
      { level: 3, label: 'AI Connecting', indicators: ['Embracing AI', 'Culture shifting', 'Change positive'] },
      { level: 4, label: 'AI Collaborating', indicators: ['AI-positive culture', 'Innovation encouraged', 'Learning culture'] },
      { level: 5, label: 'AI Integrating', indicators: ['AI-first culture', 'Continuous learning', 'Adaptive mindset'] },
      { level: 6, label: 'AI Orchestrating', indicators: ['Enterprise culture', 'AI-native values', 'Transformation embedded'] },
      { level: 7, label: 'AI Leading', indicators: ['Industry culture leader', 'Best practices', 'Cultural benchmark'] },
      { level: 8, label: 'AI Innovating', indicators: ['Autonomous culture', 'Self-evolving values', 'Adaptive norms'] },
      { level: 9, label: 'AI Transforming', indicators: ['Living culture', 'Real-time adaptation', 'Consciousness culture'] },
      { level: 10, label: 'AI Transcending', indicators: ['Transcendent culture', 'Universal values', 'Collective consciousness'] }
    ]
  },
  learning_development: {
    name: 'Learning & Development',
    category: 'People & Culture',
    description: 'AI training programs, upskilling initiatives, and continuous learning',
    scoringGuidelines: [
      { level: -2, label: 'Actively Hostile', indicators: ['No training allowed', 'Blocking development', 'Anti-learning'] },
      { level: -1, label: 'Resistant', indicators: ['No interest in training', 'Resistant to learning', 'No time'] },
      { level: 0, label: 'AI Unaware', indicators: ['No training', 'No program', 'Figure it out', 'On their own', 'No upskilling'] },
      { level: 1, label: 'AI Curious', indicators: ['Informal learning', 'Self-directed', 'Some resources', 'Interested'] },
      { level: 2, label: 'AI Experimenting', indicators: ['Training started', 'Basic program', 'Workshops offered', 'Courses available'] },
      { level: 3, label: 'AI Connecting', indicators: ['Formal program', 'Structured training', 'Certification paths', 'Dedicated time'] },
      { level: 4, label: 'AI Collaborating', indicators: ['Comprehensive training', 'Role-specific', 'Continuous learning'] },
      { level: 5, label: 'AI Integrating', indicators: ['AI-native learning', 'Personalized paths', 'AI-augmented training'] },
      { level: 6, label: 'AI Orchestrating', indicators: ['Enterprise learning', 'AI university', 'Continuous upskilling'] },
      { level: 7, label: 'AI Leading', indicators: ['Industry training leader', 'Thought leadership', 'External training'] },
      { level: 8, label: 'AI Innovating', indicators: ['Autonomous learning', 'AI-generated curriculum', 'Adaptive training'] },
      { level: 9, label: 'AI Transforming', indicators: ['Living learning', 'Real-time skill building', 'Consciousness development'] },
      { level: 10, label: 'AI Transcending', indicators: ['Transcendent learning', 'Universal knowledge', 'Infinite learning'] }
    ]
  },
  psychological_safety: {
    name: 'Psychological Safety',
    category: 'People & Culture',
    description: 'Safe environment for AI experimentation, failure acceptance, and trust',
    scoringGuidelines: [
      { level: -2, label: 'Actively Hostile', indicators: ['Punishment for failure', 'Blame culture', 'Fear environment'] },
      { level: -1, label: 'Resistant', indicators: ['Afraid to try', 'Fear of failure', 'No permission', 'Judgment'] },
      { level: 0, label: 'AI Unaware', indicators: ['No safety', 'Afraid', 'Fear', 'No permission', 'Judgment', 'Scared'] },
      { level: 1, label: 'AI Curious', indicators: ['Some safety', 'Starting to trust', 'Permission given'] },
      { level: 2, label: 'AI Experimenting', indicators: ['Safe to try', 'Failure accepted', 'Experimentation ok'] },
      { level: 3, label: 'AI Connecting', indicators: ['Safe environment', 'Fail fast encouraged', 'Learning from failure'] },
      { level: 4, label: 'AI Collaborating', indicators: ['Psychological safety', 'Open communication', 'Trust established'] },
      { level: 5, label: 'AI Integrating', indicators: ['Innovation safety', 'Radical candor', 'Full trust'] },
      { level: 6, label: 'AI Orchestrating', indicators: ['Enterprise safety', 'Organization-wide trust', 'Open culture'] },
      { level: 7, label: 'AI Leading', indicators: ['Industry benchmark', 'Safety leader', 'Best practices'] },
      { level: 8, label: 'AI Innovating', indicators: ['Autonomous safety', 'Self-regulating trust', 'Adaptive safety'] },
      { level: 9, label: 'AI Transforming', indicators: ['Living safety', 'Real-time trust', 'Consciousness safety'] },
      { level: 10, label: 'AI Transcending', indicators: ['Transcendent safety', 'Universal trust', 'Collective safety'] }
    ]
  },
  champion_network: {
    name: 'Champion Network',
    category: 'People & Culture',
    description: 'AI advocates, change agents, and internal champion programs',
    scoringGuidelines: [
      { level: -2, label: 'Actively Hostile', indicators: ['Blocking champions', 'Isolating advocates', 'Punishing leaders'] },
      { level: -1, label: 'Resistant', indicators: ['No champions', 'No advocates', 'No support'] },
      { level: 0, label: 'AI Unaware', indicators: ['No champions', 'No advocates', 'Isolated efforts', 'No network'] },
      { level: 1, label: 'AI Curious', indicators: ['Few enthusiasts', 'Informal champions', 'Scattered advocates'] },
      { level: 2, label: 'AI Experimenting', indicators: ['Identified champions', 'Starting network', 'Some support'] },
      { level: 3, label: 'AI Connecting', indicators: ['Formal champions', 'Network established', 'Regular meetings'] },
      { level: 4, label: 'AI Collaborating', indicators: ['Champion program', 'Resources provided', 'Recognition'] },
      { level: 5, label: 'AI Integrating', indicators: ['Mature network', 'Peer learning', 'Cross-functional'] },
      { level: 6, label: 'AI Orchestrating', indicators: ['Enterprise network', 'Global champions', 'Community of practice'] },
      { level: 7, label: 'AI Leading', indicators: ['Industry champions', 'External recognition', 'Thought leaders'] },
      { level: 8, label: 'AI Innovating', indicators: ['Autonomous network', 'Self-organizing', 'Adaptive community'] },
      { level: 9, label: 'AI Transforming', indicators: ['Living network', 'Real-time collaboration', 'Consciousness network'] },
      { level: 10, label: 'AI Transcending', indicators: ['Transcendent network', 'Universal collaboration', 'Collective champions'] }
    ]
  },

  // TECHNOLOGY & DATA (5 dimensions)
  data_infrastructure: {
    name: 'Data Infrastructure',
    category: 'Technology & Data',
    description: 'Data quality, accessibility, governance, and AI-readiness',
    scoringGuidelines: [
      { level: -2, label: 'Actively Hostile', indicators: ['Data silos blocked', 'Preventing access', 'Anti-data'] },
      { level: -1, label: 'Resistant', indicators: ['Data chaos', 'No governance', 'Poor quality', 'Inaccessible'] },
      { level: 0, label: 'AI Unaware', indicators: ['No data strategy', 'Siloed data', 'Poor quality', 'No access'] },
      { level: 1, label: 'AI Curious', indicators: ['Aware of issues', 'Discussing data', 'Starting cleanup'] },
      { level: 2, label: 'AI Experimenting', indicators: ['Data cleanup', 'Basic governance', 'Some integration'] },
      { level: 3, label: 'AI Connecting', indicators: ['Data platform', 'Quality improving', 'Accessibility growing'] },
      { level: 4, label: 'AI Collaborating', indicators: ['Mature data', 'Governed', 'Accessible', 'Quality assured'] },
      { level: 5, label: 'AI Integrating', indicators: ['AI-ready data', 'Real-time', 'High quality', 'Self-service'] },
      { level: 6, label: 'AI Orchestrating', indicators: ['Enterprise data', 'Unified platform', 'Predictive quality'] },
      { level: 7, label: 'AI Leading', indicators: ['Industry data leader', 'Data monetization', 'Ecosystem data'] },
      { level: 8, label: 'AI Innovating', indicators: ['Autonomous data', 'Self-healing', 'AI-managed'] },
      { level: 9, label: 'AI Transforming', indicators: ['Living data', 'Real-time evolution', 'Adaptive data'] },
      { level: 10, label: 'AI Transcending', indicators: ['Transcendent data', 'Universal data', 'Consciousness data'] }
    ]
  },
  technology_stack: {
    name: 'Technology Stack',
    category: 'Technology & Data',
    description: 'AI-ready technology infrastructure, cloud adoption, and modernization',
    scoringGuidelines: [
      { level: -2, label: 'Actively Hostile', indicators: ['Blocking technology', 'Preventing upgrades', 'Anti-modernization'] },
      { level: -1, label: 'Resistant', indicators: ['Legacy systems', 'Outdated', 'Technical debt', 'No investment'] },
      { level: 0, label: 'AI Unaware', indicators: ['No AI infrastructure', 'Legacy', 'Outdated', 'Manual'] },
      { level: 1, label: 'AI Curious', indicators: ['Aware of needs', 'Discussing upgrades', 'Evaluating tools'] },
      { level: 2, label: 'AI Experimenting', indicators: ['Initial tools', 'Cloud starting', 'Some modernization'] },
      { level: 3, label: 'AI Connecting', indicators: ['AI tools deployed', 'Cloud adopted', 'APIs available'] },
      { level: 4, label: 'AI Collaborating', indicators: ['Integrated stack', 'AI platforms', 'Modern architecture'] },
      { level: 5, label: 'AI Integrating', indicators: ['AI-native stack', 'Scalable', 'Flexible', 'Integrated'] },
      { level: 6, label: 'AI Orchestrating', indicators: ['Enterprise platform', 'Unified AI', 'Ecosystem integrated'] },
      { level: 7, label: 'AI Leading', indicators: ['Industry leading', 'Cutting edge', 'Innovation platform'] },
      { level: 8, label: 'AI Innovating', indicators: ['Autonomous stack', 'Self-healing', 'AI-managed'] },
      { level: 9, label: 'AI Transforming', indicators: ['Living stack', 'Real-time evolution', 'Adaptive technology'] },
      { level: 10, label: 'AI Transcending', indicators: ['Transcendent stack', 'Universal platform', 'Consciousness technology'] }
    ]
  },
  integration_capability: {
    name: 'Integration Capability',
    category: 'Technology & Data',
    description: 'Ability to integrate AI into existing systems and API maturity',
    scoringGuidelines: [
      { level: -2, label: 'Actively Hostile', indicators: ['Blocking integration', 'Preventing connections', 'Isolation'] },
      { level: -1, label: 'Resistant', indicators: ['No integration', 'Siloed systems', 'Disconnected'] },
      { level: 0, label: 'AI Unaware', indicators: ['No integration', 'Siloed', 'Manual connections', 'Fragmented'] },
      { level: 1, label: 'AI Curious', indicators: ['Aware of needs', 'Discussing integration', 'Planning'] },
      { level: 2, label: 'AI Experimenting', indicators: ['Initial integration', 'Some APIs', 'Basic connections'] },
      { level: 3, label: 'AI Connecting', indicators: ['Integration platform', 'APIs established', 'Data flowing'] },
      { level: 4, label: 'AI Collaborating', indicators: ['Mature integration', 'Real-time', 'Automated'] },
      { level: 5, label: 'AI Integrating', indicators: ['AI integration', 'Intelligent routing', 'Predictive'] },
      { level: 6, label: 'AI Orchestrating', indicators: ['Enterprise integration', 'Unified platform', 'Ecosystem'] },
      { level: 7, label: 'AI Leading', indicators: ['Industry integration', 'Standard APIs', 'Ecosystem leader'] },
      { level: 8, label: 'AI Innovating', indicators: ['Autonomous integration', 'Self-connecting', 'AI-managed'] },
      { level: 9, label: 'AI Transforming', indicators: ['Living integration', 'Real-time adaptation', 'Organic connections'] },
      { level: 10, label: 'AI Transcending', indicators: ['Transcendent integration', 'Universal connectivity', 'Consciousness integration'] }
    ]
  },
  security_compliance: {
    name: 'Security & Compliance',
    category: 'Technology & Data',
    description: 'AI security practices, regulatory compliance, and risk management',
    scoringGuidelines: [
      { level: -2, label: 'Actively Hostile', indicators: ['Blocking security', 'Ignoring compliance', 'Reckless'] },
      { level: -1, label: 'Resistant', indicators: ['No security plan', 'Compliance gaps', 'Risky practices'] },
      { level: 0, label: 'AI Unaware', indicators: ['No AI security', 'No compliance', 'Unknown risks', 'Gaps'] },
      { level: 1, label: 'AI Curious', indicators: ['Aware of risks', 'Discussing security', 'Compliance review'] },
      { level: 2, label: 'AI Experimenting', indicators: ['Initial security', 'Basic compliance', 'Risk assessment'] },
      { level: 3, label: 'AI Connecting', indicators: ['Security program', 'Compliance framework', 'Risk management'] },
      { level: 4, label: 'AI Collaborating', indicators: ['Mature security', 'Continuous compliance', 'Proactive risk'] },
      { level: 5, label: 'AI Integrating', indicators: ['AI security', 'Automated compliance', 'Predictive risk'] },
      { level: 6, label: 'AI Orchestrating', indicators: ['Enterprise security', 'Unified compliance', 'Zero trust'] },
      { level: 7, label: 'AI Leading', indicators: ['Industry security leader', 'Compliance benchmark', 'Best practices'] },
      { level: 8, label: 'AI Innovating', indicators: ['Autonomous security', 'AI-managed', 'Self-healing'] },
      { level: 9, label: 'AI Transforming', indicators: ['Living security', 'Real-time adaptation', 'Adaptive compliance'] },
      { level: 10, label: 'AI Transcending', indicators: ['Transcendent security', 'Universal compliance', 'Consciousness security'] }
    ]
  },
  vendor_ecosystem: {
    name: 'Vendor Ecosystem',
    category: 'Technology & Data',
    description: 'AI vendor relationships, partnerships, and ecosystem maturity',
    scoringGuidelines: [
      { level: -2, label: 'Actively Hostile', indicators: ['Blocking vendors', 'Isolation', 'Anti-partnership'] },
      { level: -1, label: 'Resistant', indicators: ['No vendor relationships', 'Isolated', 'No partnerships'] },
      { level: 0, label: 'AI Unaware', indicators: ['No AI vendors', 'No partnerships', 'Unknown ecosystem'] },
      { level: 1, label: 'AI Curious', indicators: ['Evaluating vendors', 'Exploring partnerships', 'Initial contact'] },
      { level: 2, label: 'AI Experimenting', indicators: ['Initial vendors', 'Pilot partnerships', 'Some relationships'] },
      { level: 3, label: 'AI Connecting', indicators: ['Vendor portfolio', 'Strategic partnerships', 'Ecosystem forming'] },
      { level: 4, label: 'AI Collaborating', indicators: ['Mature ecosystem', 'Integrated vendors', 'Partnership value'] },
      { level: 5, label: 'AI Integrating', indicators: ['AI ecosystem', 'Strategic alliances', 'Co-innovation'] },
      { level: 6, label: 'AI Orchestrating', indicators: ['Enterprise ecosystem', 'Unified partnerships', 'Ecosystem orchestration'] },
      { level: 7, label: 'AI Leading', indicators: ['Industry ecosystem leader', 'Platform partnerships', 'Ecosystem shaper'] },
      { level: 8, label: 'AI Innovating', indicators: ['Autonomous ecosystem', 'AI-managed partnerships', 'Self-optimizing'] },
      { level: 9, label: 'AI Transforming', indicators: ['Living ecosystem', 'Real-time partnerships', 'Adaptive alliances'] },
      { level: 10, label: 'AI Transcending', indicators: ['Transcendent ecosystem', 'Universal partnerships', 'Consciousness ecosystem'] }
    ]
  },

  // OPERATIONS & PROCESSES (4 dimensions)
  ai_use_cases: {
    name: 'AI Use Cases',
    category: 'Operations & Processes',
    description: 'Active AI implementations, production deployments, and business applications',
    scoringGuidelines: [
      { level: -2, label: 'Actively Hostile', indicators: ['Banning AI', 'Prohibited', 'Blocked all AI'] },
      { level: -1, label: 'Resistant', indicators: ['Avoiding AI', 'Not implementing', "Won't use"] },
      { level: 0, label: 'AI Unaware', indicators: ['No AI', 'Not using', "Haven't implemented", 'No plan', "Cobbler's children"] },
      { level: 1, label: 'AI Curious', indicators: ['Experimenting', 'Pilot', 'Trying', 'Playing with', 'Exploring', 'One or two people'] },
      { level: 2, label: 'AI Experimenting', indicators: ['Few use cases', 'Some projects', 'Basic chatbots', 'AI writing', 'Simple automation'] },
      { level: 3, label: 'AI Connecting', indicators: ['Agents', 'ROI', 'Measurable', 'Production', 'Integrated'] },
      { level: 4, label: 'AI Collaborating', indicators: ['Multi-agent', 'Orchestrated workflows', '50% processes'] },
      { level: 5, label: 'AI Integrating', indicators: ['Department-wide', 'Custom models', 'Platform', '3:1 ratio'] },
      { level: 6, label: 'AI Orchestrating', indicators: ['Enterprise-wide', 'Cross-functional AI', 'Predictive'] },
      { level: 7, label: 'AI Leading', indicators: ['Strategic AI', 'Board-level AI', 'AI-driven decisions'] },
      { level: 8, label: 'AI Innovating', indicators: ['AI creates products', 'Autonomous development', 'Self-improving'] },
      { level: 9, label: 'AI Transforming', indicators: ['AI transforms business', 'Autonomous operations', 'Adaptive'] },
      { level: 10, label: 'AI Transcending', indicators: ['AI transcending', 'Living intelligence', 'Self-evolving'] }
    ]
  },
  process_automation: {
    name: 'Process Automation',
    category: 'Operations & Processes',
    description: 'Automated workflows, efficiency gains, and intelligent automation',
    scoringGuidelines: [
      { level: -2, label: 'Actively Hostile', indicators: ['Blocking automation', 'Preventing efficiency', 'Anti-automation'] },
      { level: -1, label: 'Resistant', indicators: ['Resistant to automation', 'Manual preferred', 'No interest'] },
      { level: 0, label: 'AI Unaware', indicators: ['No automation', 'Manual processes', 'Repetitive', 'Inefficient'] },
      { level: 1, label: 'AI Curious', indicators: ['Aware of opportunities', 'Discussing automation', 'Interested'] },
      { level: 2, label: 'AI Experimenting', indicators: ['Initial automation', 'Simple workflows', 'Basic RPA'] },
      { level: 3, label: 'AI Connecting', indicators: ['Automation program', 'Multiple processes', 'Measuring savings'] },
      { level: 4, label: 'AI Collaborating', indicators: ['Intelligent automation', 'AI-augmented', 'Significant savings'] },
      { level: 5, label: 'AI Integrating', indicators: ['Enterprise automation', 'AI orchestration', 'Predictive workflows'] },
      { level: 6, label: 'AI Orchestrating', indicators: ['Autonomous processes', 'Self-optimizing', 'Minimal intervention'] },
      { level: 7, label: 'AI Leading', indicators: ['Industry automation leader', 'Best practices', 'Benchmark'] },
      { level: 8, label: 'AI Innovating', indicators: ['AI-driven processes', 'Self-designing', 'Autonomous operations'] },
      { level: 9, label: 'AI Transforming', indicators: ['Living processes', 'Real-time adaptation', 'Organic workflows'] },
      { level: 10, label: 'AI Transcending', indicators: ['Transcendent processes', 'Universal automation', 'Consciousness processes'] }
    ]
  },
  operational_excellence: {
    name: 'Operational Excellence',
    category: 'Operations & Processes',
    description: 'AI-driven operational improvements, KPIs, and continuous optimization',
    scoringGuidelines: [
      { level: -2, label: 'Actively Hostile', indicators: ['Blocking improvements', 'Preventing optimization', 'Anti-excellence'] },
      { level: -1, label: 'Resistant', indicators: ['Declining operations', 'No improvement', 'Inefficient'] },
      { level: 0, label: 'AI Unaware', indicators: ['No excellence', 'Inefficient', 'No measurement', 'Reactive'] },
      { level: 1, label: 'AI Curious', indicators: ['Aware of gaps', 'Discussing improvements', 'Initial metrics'] },
      { level: 2, label: 'AI Experimenting', indicators: ['Improvement program', 'Basic metrics', 'Some optimization'] },
      { level: 3, label: 'AI Connecting', indicators: ['Operational program', 'KPIs established', 'Continuous improvement'] },
      { level: 4, label: 'AI Collaborating', indicators: ['AI-enhanced operations', 'Predictive maintenance', 'Optimization'] },
      { level: 5, label: 'AI Integrating', indicators: ['AI-driven excellence', 'Real-time optimization', 'Proactive'] },
      { level: 6, label: 'AI Orchestrating', indicators: ['Enterprise excellence', 'Unified operations', 'Predictive'] },
      { level: 7, label: 'AI Leading', indicators: ['Industry excellence leader', 'Benchmark operations', 'Best practices'] },
      { level: 8, label: 'AI Innovating', indicators: ['Autonomous operations', 'Self-optimizing', 'AI-managed'] },
      { level: 9, label: 'AI Transforming', indicators: ['Living operations', 'Real-time evolution', 'Adaptive excellence'] },
      { level: 10, label: 'AI Transcending', indicators: ['Transcendent operations', 'Universal excellence', 'Consciousness operations'] }
    ]
  },
  customer_experience: {
    name: 'Customer Experience',
    category: 'Operations & Processes',
    description: 'AI enhancement of customer touchpoints, personalization, and service',
    scoringGuidelines: [
      { level: -2, label: 'Actively Hostile', indicators: ['Blocking CX improvement', 'Ignoring customers', 'Anti-service'] },
      { level: -1, label: 'Resistant', indicators: ['Poor CX', 'Declining satisfaction', 'Complaints'] },
      { level: 0, label: 'AI Unaware', indicators: ['No AI in CX', 'Manual service', 'Reactive', 'Slow response'] },
      { level: 1, label: 'AI Curious', indicators: ['Exploring AI CX', 'Discussing improvements', 'Customer research'] },
      { level: 2, label: 'AI Experimenting', indicators: ['Initial AI CX', 'Basic chatbot', 'Some personalization'] },
      { level: 3, label: 'AI Connecting', indicators: ['AI-enhanced CX', 'Improved response', 'Personalization'] },
      { level: 4, label: 'AI Collaborating', indicators: ['AI-driven CX', 'Predictive service', 'Proactive outreach'] },
      { level: 5, label: 'AI Integrating', indicators: ['Intelligent CX', 'Hyper-personalization', 'Anticipatory service'] },
      { level: 6, label: 'AI Orchestrating', indicators: ['Enterprise CX', 'Omnichannel AI', 'Unified experience'] },
      { level: 7, label: 'AI Leading', indicators: ['Industry CX leader', 'Best-in-class service', 'CX innovation'] },
      { level: 8, label: 'AI Innovating', indicators: ['Autonomous CX', 'AI-managed relationships', 'Self-optimizing'] },
      { level: 9, label: 'AI Transforming', indicators: ['Living CX', 'Real-time adaptation', 'Organic relationships'] },
      { level: 10, label: 'AI Transcending', indicators: ['Transcendent CX', 'Universal service', 'Consciousness CX'] }
    ]
  },

  // GOVERNANCE & RISK (4 dimensions)
  ai_governance: {
    name: 'AI Governance',
    category: 'Governance & Risk',
    description: 'AI policies, accountability, oversight, and ethical frameworks',
    scoringGuidelines: [
      { level: -2, label: 'Actively Hostile', indicators: ['Anti-governance', 'Blocking compliance', 'Sabotaging'] },
      { level: -1, label: 'Resistant', indicators: ['Ignoring governance', 'No interest in ethics', 'Resistant'] },
      { level: 0, label: 'AI Unaware', indicators: ['No governance', 'No policy', 'Not addressed', 'No ethics', 'No one accountable', 'No owner'] },
      { level: 1, label: 'AI Curious', indicators: ['Informal', 'Case by case', 'Starting to think', 'Discussing'] },
      { level: 2, label: 'AI Experimenting', indicators: ['Basic guidelines', 'Some policies', 'Designated owner', 'Informal framework'] },
      { level: 3, label: 'AI Connecting', indicators: ['Formal framework', 'Ethics guidelines', 'Compliance', 'Governance committee'] },
      { level: 4, label: 'AI Collaborating', indicators: ['Comprehensive policies', 'Enforced governance', 'AI ethics board'] },
      { level: 5, label: 'AI Integrating', indicators: ['Certified governance', 'Industry standards', 'Proactive compliance'] },
      { level: 6, label: 'AI Orchestrating', indicators: ['Enterprise governance', 'AI-specific compliance', 'Predictive ethics'] },
      { level: 7, label: 'AI Leading', indicators: ['Industry leader governance', 'Thought leadership', 'Regulatory influence'] },
      { level: 8, label: 'AI Innovating', indicators: ['Autonomous governance', 'Self-regulating', 'AI ethics innovation'] },
      { level: 9, label: 'AI Transforming', indicators: ['Adaptive governance', 'Real-time ethics', 'AI-native compliance'] },
      { level: 10, label: 'AI Transcending', indicators: ['Transcendent governance', 'Consciousness ethics', 'Universal standards'] }
    ]
  },
  ethics_responsibility: {
    name: 'Ethics & Responsibility',
    category: 'Governance & Risk',
    description: 'Ethical AI practices, bias monitoring, and responsible AI deployment',
    scoringGuidelines: [
      { level: -2, label: 'Actively Hostile', indicators: ['Unethical practices', 'Ignoring responsibility', 'Harmful AI'] },
      { level: -1, label: 'Resistant', indicators: ['No ethics awareness', 'Irresponsible', 'Risky practices'] },
      { level: 0, label: 'AI Unaware', indicators: ['No ethics policy', 'No awareness', 'No consideration', 'No AI ethics'] },
      { level: 1, label: 'AI Curious', indicators: ['Aware of ethics', 'Discussing responsibility', 'Concerned'] },
      { level: 2, label: 'AI Experimenting', indicators: ['Initial ethics', 'Basic guidelines', 'Some consideration'] },
      { level: 3, label: 'AI Connecting', indicators: ['Ethics program', 'Formal guidelines', 'Responsibility assigned'] },
      { level: 4, label: 'AI Collaborating', indicators: ['Comprehensive ethics', 'Board oversight', 'External review'] },
      { level: 5, label: 'AI Integrating', indicators: ['Proactive ethics', 'Industry standards', 'Transparency'] },
      { level: 6, label: 'AI Orchestrating', indicators: ['Enterprise ethics', 'Unified standards', 'Predictive ethics'] },
      { level: 7, label: 'AI Leading', indicators: ['Ethics leader', 'Industry benchmark', 'Thought leadership'] },
      { level: 8, label: 'AI Innovating', indicators: ['Autonomous ethics', 'AI-managed responsibility', 'Self-governing'] },
      { level: 9, label: 'AI Transforming', indicators: ['Living ethics', 'Real-time adaptation', 'Organic responsibility'] },
      { level: 10, label: 'AI Transcending', indicators: ['Transcendent ethics', 'Universal responsibility', 'Consciousness ethics'] }
    ]
  },
  risk_management: {
    name: 'Risk Management',
    category: 'Governance & Risk',
    description: 'AI risk identification, mitigation, and proactive management',
    scoringGuidelines: [
      { level: -2, label: 'Actively Hostile', indicators: ['Ignoring risks', 'Reckless', 'Dangerous practices'] },
      { level: -1, label: 'Resistant', indicators: ['Poor risk awareness', 'Reactive only', 'Unprepared'] },
      { level: 0, label: 'AI Unaware', indicators: ['No risk management', 'Unknown risks', 'No assessment', 'Unprepared'] },
      { level: 1, label: 'AI Curious', indicators: ['Aware of risks', 'Discussing risk', 'Initial assessment'] },
      { level: 2, label: 'AI Experimenting', indicators: ['Basic risk', 'Some assessment', 'Mitigation starting'] },
      { level: 3, label: 'AI Connecting', indicators: ['Risk program', 'Formal assessment', 'Mitigation plans'] },
      { level: 4, label: 'AI Collaborating', indicators: ['Comprehensive risk', 'Continuous monitoring', 'Proactive'] },
      { level: 5, label: 'AI Integrating', indicators: ['AI risk management', 'Predictive risk', 'Automated monitoring'] },
      { level: 6, label: 'AI Orchestrating', indicators: ['Enterprise risk', 'Unified management', 'Real-time monitoring'] },
      { level: 7, label: 'AI Leading', indicators: ['Industry risk leader', 'Best practices', 'Benchmark'] },
      { level: 8, label: 'AI Innovating', indicators: ['Autonomous risk', 'AI-managed', 'Self-mitigating'] },
      { level: 9, label: 'AI Transforming', indicators: ['Living risk', 'Real-time adaptation', 'Adaptive mitigation'] },
      { level: 10, label: 'AI Transcending', indicators: ['Transcendent risk', 'Universal management', 'Consciousness risk'] }
    ]
  },
  roi_measurement: {
    name: 'ROI Measurement',
    category: 'Governance & Risk',
    description: 'AI investment tracking, value measurement, and business case development',
    scoringGuidelines: [
      { level: -2, label: 'Actively Hostile', indicators: ['Blocking measurement', 'Hiding results', 'Anti-accountability'] },
      { level: -1, label: 'Resistant', indicators: ['No measurement', 'No tracking', 'Unknown ROI'] },
      { level: 0, label: 'AI Unaware', indicators: ['No ROI tracking', 'Not measuring', 'No ROI', "Haven't measured", "Don't track", 'Hard to quantify'] },
      { level: 1, label: 'AI Curious', indicators: ['Aware of need', 'Discussing measurement', 'Initial metrics'] },
      { level: 2, label: 'AI Experimenting', indicators: ['Basic tracking', 'Some metrics', 'Initial ROI'] },
      { level: 3, label: 'AI Connecting', indicators: ['Formal measurement', 'ROI framework', 'Regular reporting'] },
      { level: 4, label: 'AI Collaborating', indicators: ['Comprehensive ROI', 'Business cases', 'Value tracking'] },
      { level: 5, label: 'AI Integrating', indicators: ['AI-driven measurement', 'Predictive ROI', 'Automated tracking'] },
      { level: 6, label: 'AI Orchestrating', indicators: ['Enterprise measurement', 'Unified ROI', 'Real-time value'] },
      { level: 7, label: 'AI Leading', indicators: ['Industry measurement leader', 'Benchmark ROI', 'Best practices'] },
      { level: 8, label: 'AI Innovating', indicators: ['Autonomous measurement', 'AI-managed ROI', 'Self-optimizing'] },
      { level: 9, label: 'AI Transforming', indicators: ['Living measurement', 'Real-time adaptation', 'Organic value'] },
      { level: 10, label: 'AI Transcending', indicators: ['Transcendent measurement', 'Universal value', 'Consciousness ROI'] }
    ]
  }
}

// ============================================================================
// SCORING SCALE DEFINITIONS
// ============================================================================

export const MATURITY_SCALE: Record<MaturityScore, { label: string; description: string }> = {
  [-2]: { label: 'Actively Hostile', description: 'Blocking AI, fighting adoption, sabotaging initiatives' },
  [-1]: { label: 'Resistant', description: 'Refuses to engage, sees AI as threat' },
  [0]: { label: 'AI Unaware', description: 'No AI usage, manual processes, no awareness' },
  [1]: { label: 'AI Curious', description: 'Beginning to explore, some personal experimentation' },
  [2]: { label: 'AI Experimenting', description: 'AI tools in use, simple automations, ~25% adoption' },
  [3]: { label: 'AI Connecting', description: 'First agents, measurable ROI' },
  [4]: { label: 'AI Collaborating', description: 'Multi-agent, cross-functional AI workflows' },
  [5]: { label: 'AI Integrating', description: 'Department-wide AI, 3:1 human-agent ratio' },
  [6]: { label: 'AI Orchestrating', description: 'Enterprise-wide orchestration, predictive' },
  [7]: { label: 'AI Leading', description: 'Strategic AI decisions, AI board advisors' },
  [8]: { label: 'AI Innovating', description: 'AI creates products, self-improving systems' },
  [9]: { label: 'AI Transforming', description: 'Business model evolves via AI' },
  [10]: { label: 'AI Transcending', description: 'Fully autonomous, living intelligence' }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const DEFAULT_CONFIG: Required<ScoringConfig> = {
  model: 'claude-sonnet-4-20250514',
  maxTokens: 4096,
  temperature: 0.3,
  batchSize: 5,
  rateLimitDelayMs: 1000,
  verbose: false
}

function log(message: string, config: ScoringConfig): void {
  if (config.verbose) {
    console.log(`[LLM-Scorer] ${message}`)
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function formatRubricForPrompt(rubric: DimensionRubric): string {
  const guidelines = rubric.scoringGuidelines
    .map(g => `  Level ${g.level} (${g.label}): ${g.indicators.join(', ')}`)
    .join('\n')

  return `
Dimension: ${rubric.name}
Category: ${rubric.category}
Description: ${rubric.description}

Scoring Guidelines:
${guidelines}
`
}

function formatTranscriptSegments(segments: TranscriptSegment[]): string {
  return segments
    .map((s, i) => {
      const header = s.role
        ? `[Source ${i + 1}: ${s.source} (${s.role}${s.department ? `, ${s.department}` : ''})]`
        : `[Source ${i + 1}: ${s.source}]`
      return `${header}\n${s.content}`
    })
    .join('\n\n---\n\n')
}

// ============================================================================
// MAIN SCORING FUNCTIONS
// ============================================================================

/**
 * Score a single dimension using Claude API with chain-of-thought prompting
 */
export async function scoreDimensionWithLLM(
  dimensionKey: string,
  segments: TranscriptSegment[],
  config: ScoringConfig = {}
): Promise<DimensionAnalysis> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }

  const rubric = DIMENSION_DEFINITIONS[dimensionKey]
  if (!rubric) {
    throw new Error(`Unknown dimension: ${dimensionKey}`)
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set')
  }

  const client = new Anthropic({ apiKey })

  const systemPrompt = `You are an expert AI maturity assessor analyzing interview transcripts to score organizations on the LVNG.AI maturity framework. Your task is to provide accurate, evidence-based scoring on a scale from -2 (Actively Hostile) to 10 (AI Transcending).

CRITICAL INSTRUCTIONS:
1. Be CONSERVATIVE in your scoring - most organizations are between 0-3
2. Evidence must DIRECTLY support the score, not be inferred
3. Distinguish between ASPIRATIONS (talking about AI) and REALITY (actually doing AI)
4. A score of 4+ requires significant production deployments and measurable results
5. Contradicting evidence should lower confidence, not be ignored
6. If evidence is mixed or unclear, score lower and note uncertainty

SCORING SCALE:
-2: Actively Hostile - blocking AI, fighting adoption
-1: Resistant - refuses to engage, sees AI as threat
 0: AI Unaware - no AI usage, manual processes
 1: AI Curious - beginning to explore, personal experimentation
 2: AI Experimenting - AI tools in use, ~25% adoption
 3: AI Connecting - first agents, measurable ROI
 4: AI Collaborating - multi-agent workflows
 5: AI Integrating - department-wide AI
 6: AI Orchestrating - enterprise-wide orchestration
 7: AI Leading - strategic AI decisions
 8: AI Innovating - AI creates products
 9: AI Transforming - business model via AI
10: AI Transcending - fully autonomous

Most organizations score between 0-3. Scores above 5 are exceptional and rare.`

  const userPrompt = `Analyze the following transcript segments and score this dimension:

${formatRubricForPrompt(rubric)}

TRANSCRIPT SEGMENTS:
${formatTranscriptSegments(segments)}

Please analyze step-by-step:

1. EVIDENCE GATHERING: What specific quotes or facts from the transcripts relate to this dimension?

2. SUPPORTING EVIDENCE: What evidence suggests higher maturity?
   - Quote the specific text
   - Note which source it came from
   - Rate relevance (strong/moderate/weak)

3. CONTRADICTING EVIDENCE: What evidence suggests lower maturity or contradicts higher scores?
   - Quote the specific text
   - Note which source it came from
   - Rate relevance (strong/moderate/weak)

4. REALITY CHECK:
   - Are statements about aspirations/plans or actual implementations?
   - Is there evidence of measurable results or just intentions?
   - Are there gaps between what's said and what's done?

5. SCORE DETERMINATION: Based on the evidence, what score (-2 to 10) best represents the CURRENT STATE (not aspirations)?

6. CONFIDENCE ASSESSMENT: How confident are you in this score (0.0 to 1.0)?
   - High confidence (0.8-1.0): Multiple consistent evidence points
   - Medium confidence (0.5-0.7): Some evidence but gaps
   - Low confidence (0.0-0.4): Limited or contradictory evidence

7. KEY INSIGHTS: What are 2-3 key insights about this dimension for this organization?

Respond in the following JSON format:
{
  "score": <number from -2 to 10>,
  "reasoning": "<detailed explanation of why you chose this score>",
  "supportingEvidence": [
    {"quote": "<exact quote>", "source": "<interviewee name>", "relevance": "strong|moderate|weak"}
  ],
  "contradictingEvidence": [
    {"quote": "<exact quote>", "source": "<interviewee name>", "relevance": "strong|moderate|weak"}
  ],
  "confidence": <number from 0.0 to 1.0>,
  "keyInsights": ["<insight 1>", "<insight 2>", "<insight 3>"]
}`

  log(`Scoring dimension: ${dimensionKey}`, mergedConfig)

  try {
    const response = await client.messages.create({
      model: mergedConfig.model,
      max_tokens: mergedConfig.maxTokens,
      temperature: mergedConfig.temperature,
      messages: [
        { role: 'user', content: userPrompt }
      ],
      system: systemPrompt
    })

    // Extract text content from response
    const textContent = response.content.find(c => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response')
    }

    // Parse JSON from response (handle markdown code blocks)
    let jsonStr = textContent.text
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1]
    }

    const parsed = JSON.parse(jsonStr.trim())

    // Validate and normalize score
    let score = Math.round(parsed.score) as MaturityScore
    if (score < -2) score = -2
    if (score > 10) score = 10

    // Validate confidence
    let confidence = parseFloat(parsed.confidence)
    if (isNaN(confidence) || confidence < 0) confidence = 0
    if (confidence > 1) confidence = 1

    return {
      dimension: dimensionKey,
      dimensionName: rubric.name,
      category: rubric.category,
      score,
      reasoning: parsed.reasoning || 'No reasoning provided',
      supportingEvidence: Array.isArray(parsed.supportingEvidence)
        ? parsed.supportingEvidence.map((e: EvidenceItem) => ({
            quote: e.quote || '',
            source: e.source || 'Unknown',
            relevance: e.relevance || 'moderate'
          }))
        : [],
      contradictingEvidence: Array.isArray(parsed.contradictingEvidence)
        ? parsed.contradictingEvidence.map((e: EvidenceItem) => ({
            quote: e.quote || '',
            source: e.source || 'Unknown',
            relevance: e.relevance || 'moderate'
          }))
        : [],
      confidence,
      keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights : []
    }
  } catch (error) {
    log(`Error scoring ${dimensionKey}: ${error}`, mergedConfig)

    // Return a default analysis on error
    return {
      dimension: dimensionKey,
      dimensionName: rubric.name,
      category: rubric.category,
      score: 0,
      reasoning: `Error during analysis: ${error instanceof Error ? error.message : 'Unknown error'}`,
      supportingEvidence: [],
      contradictingEvidence: [],
      confidence: 0,
      keyInsights: ['Analysis failed - manual review recommended']
    }
  }
}

/**
 * Score all 23 dimensions with rate limiting and batching
 */
export async function scoreAllDimensions(
  segments: TranscriptSegment[],
  config: ScoringConfig = {}
): Promise<BatchScoringResult> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }
  const startTime = Date.now()

  const dimensionKeys = Object.keys(DIMENSION_DEFINITIONS)
  const results: DimensionAnalysis[] = []
  let totalTokens = 0

  log(`Starting analysis of ${dimensionKeys.length} dimensions`, mergedConfig)
  log(`Batch size: ${mergedConfig.batchSize}, Rate limit delay: ${mergedConfig.rateLimitDelayMs}ms`, mergedConfig)

  // Process in batches to respect rate limits
  for (let i = 0; i < dimensionKeys.length; i += mergedConfig.batchSize) {
    const batch = dimensionKeys.slice(i, i + mergedConfig.batchSize)

    log(`Processing batch ${Math.floor(i / mergedConfig.batchSize) + 1}/${Math.ceil(dimensionKeys.length / mergedConfig.batchSize)}: ${batch.join(', ')}`, mergedConfig)

    // Process batch in parallel
    const batchResults = await Promise.all(
      batch.map(key => scoreDimensionWithLLM(key, segments, mergedConfig))
    )

    results.push(...batchResults)

    // Estimate token usage (rough estimate based on response complexity)
    totalTokens += batchResults.length * 2000 // ~2k tokens per dimension

    // Rate limit delay between batches
    if (i + mergedConfig.batchSize < dimensionKeys.length) {
      log(`Waiting ${mergedConfig.rateLimitDelayMs}ms before next batch...`, mergedConfig)
      await sleep(mergedConfig.rateLimitDelayMs)
    }
  }

  // Calculate category scores
  const categoryScores: Record<DimensionCategory, number> = {
    'Strategy & Leadership': 0,
    'People & Culture': 0,
    'Technology & Data': 0,
    'Operations & Processes': 0,
    'Governance & Risk': 0
  }

  const categoryCounts: Record<DimensionCategory, number> = {
    'Strategy & Leadership': 0,
    'People & Culture': 0,
    'Technology & Data': 0,
    'Operations & Processes': 0,
    'Governance & Risk': 0
  }

  for (const result of results) {
    categoryScores[result.category] += result.score
    categoryCounts[result.category]++
  }

  for (const category of Object.keys(categoryScores) as DimensionCategory[]) {
    if (categoryCounts[category] > 0) {
      categoryScores[category] = Math.round((categoryScores[category] / categoryCounts[category]) * 10) / 10
    }
  }

  // Calculate overall maturity and confidence
  const overallMaturity = Math.round(
    (results.reduce((sum, r) => sum + r.score, 0) / results.length) * 10
  ) / 10

  const overallConfidence = Math.round(
    (results.reduce((sum, r) => sum + r.confidence, 0) / results.length) * 100
  ) / 100

  const processingTime = Date.now() - startTime

  log(`Analysis complete in ${processingTime}ms`, mergedConfig)
  log(`Overall maturity: ${overallMaturity}, Confidence: ${overallConfidence}`, mergedConfig)

  return {
    dimensions: results,
    overallMaturity,
    overallConfidence,
    categoryScores,
    timestamp: new Date(),
    processingTime,
    tokensUsed: totalTokens
  }
}

/**
 * Score a subset of dimensions (useful for focused analysis)
 */
export async function scoreSelectedDimensions(
  dimensionKeys: string[],
  segments: TranscriptSegment[],
  config: ScoringConfig = {}
): Promise<DimensionAnalysis[]> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }
  const results: DimensionAnalysis[] = []

  // Validate dimension keys
  for (const key of dimensionKeys) {
    if (!DIMENSION_DEFINITIONS[key]) {
      throw new Error(`Unknown dimension: ${key}`)
    }
  }

  log(`Scoring ${dimensionKeys.length} selected dimensions`, mergedConfig)

  // Process in batches
  for (let i = 0; i < dimensionKeys.length; i += mergedConfig.batchSize) {
    const batch = dimensionKeys.slice(i, i + mergedConfig.batchSize)

    const batchResults = await Promise.all(
      batch.map(key => scoreDimensionWithLLM(key, segments, mergedConfig))
    )

    results.push(...batchResults)

    if (i + mergedConfig.batchSize < dimensionKeys.length) {
      await sleep(mergedConfig.rateLimitDelayMs)
    }
  }

  return results
}

/**
 * Get dimensions by category
 */
export function getDimensionsByCategory(category: DimensionCategory): string[] {
  return Object.entries(DIMENSION_DEFINITIONS)
    .filter(([_, rubric]) => rubric.category === category)
    .map(([key]) => key)
}

/**
 * Get all dimension categories
 */
export function getAllCategories(): DimensionCategory[] {
  return [
    'Strategy & Leadership',
    'People & Culture',
    'Technology & Data',
    'Operations & Processes',
    'Governance & Risk'
  ]
}

/**
 * Format analysis result for display
 */
export function formatAnalysisForDisplay(analysis: DimensionAnalysis): string {
  const scaleInfo = MATURITY_SCALE[analysis.score]

  let output = `
${analysis.dimensionName} (${analysis.category})
${'='.repeat(60)}
Score: ${analysis.score}/10 - ${scaleInfo.label}
Confidence: ${(analysis.confidence * 100).toFixed(0)}%

Reasoning:
${analysis.reasoning}

Supporting Evidence:
${analysis.supportingEvidence.length > 0
  ? analysis.supportingEvidence.map(e => `  [${e.relevance}] "${e.quote}" - ${e.source}`).join('\n')
  : '  None identified'}

Contradicting Evidence:
${analysis.contradictingEvidence.length > 0
  ? analysis.contradictingEvidence.map(e => `  [${e.relevance}] "${e.quote}" - ${e.source}`).join('\n')
  : '  None identified'}

Key Insights:
${analysis.keyInsights.map((i, idx) => `  ${idx + 1}. ${i}`).join('\n')}
`
  return output
}

/**
 * Format batch results for display
 */
export function formatBatchResultsForDisplay(results: BatchScoringResult): string {
  let output = `
${'='.repeat(80)}
AI MATURITY ASSESSMENT RESULTS
${'='.repeat(80)}

Overall Maturity: ${results.overallMaturity}/10
Overall Confidence: ${(results.overallConfidence * 100).toFixed(0)}%
Analysis Time: ${(results.processingTime / 1000).toFixed(1)}s
Timestamp: ${results.timestamp.toISOString()}

CATEGORY SCORES:
${Object.entries(results.categoryScores)
  .map(([cat, score]) => `  ${cat}: ${score}/10`)
  .join('\n')}

DIMENSION DETAILS:
`

  // Group by category
  for (const category of getAllCategories()) {
    output += `\n${'─'.repeat(60)}\n${category}\n${'─'.repeat(60)}\n`

    const categoryDimensions = results.dimensions.filter(d => d.category === category)
    for (const dim of categoryDimensions) {
      const scaleInfo = MATURITY_SCALE[dim.score]
      const bar = '█'.repeat(Math.max(0, dim.score + 2)) + '░'.repeat(12 - Math.max(0, dim.score + 2))
      output += `  ${dim.dimensionName.padEnd(25)} [${bar}] ${dim.score.toString().padStart(2)}/10 (${scaleInfo.label})\n`
    }
  }

  return output
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  formatRubricForPrompt,
  formatTranscriptSegments
}
