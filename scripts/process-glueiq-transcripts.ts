#!/usr/bin/env ts-node
/**
 * GlueIQ Transcript Analysis Pipeline
 * Self-contained script for processing C-suite interview transcripts
 *
 * Usage:
 *   npx ts-node --transpile-only scripts/process-glueiq-transcripts.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// ESM compatibility for __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface TranscriptData {
  id: string
  interviewee: {
    name: string
    title: string
    role: 'c_suite' | 'leadership' | 'manager' | 'individual_contributor'
    department?: string
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

interface ExtractedEntity {
  type: 'person' | 'tool' | 'process' | 'team' | 'company' | 'metric' | 'challenge' | 'opportunity'
  value: string
  context: string
  sentiment?: 'positive' | 'negative' | 'neutral'
  frequency: number
  sourceQuotes: string[]
}

interface ThemeCluster {
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

interface PersonSkillProfile {
  name: string
  title: string
  aiSkillLevel: string  // Label: 'Resistant', 'Skeptical', 'Basic ChatGPT', 'Regular User', etc.
  aiSkillScore: number  // Numeric scale: -2 to +5
  toolsUsed: string[]
  frequency: 'daily' | 'weekly' | 'occasionally' | 'rarely' | 'never'
  mentionedBy: string[]
  evidence: string[]
  isChampion: boolean
  growthPotential: 'high' | 'medium' | 'low'
}

interface DimensionScore {
  dimension: string
  score: number
  evidence: string[]
  confidence: number
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const GLUEIQ_ORG = {
  id: 'glueiq-001',
  name: 'GlueIQ',
  slug: 'glueiq',
  industry: 'Marketing & Advertising',
  size: '50-100',
  region: 'North America',
}

const TRANSCRIPT_FILES = [
  { filename: 'Gaston Legorburu Interview - October 29.md', interviewee: { name: 'Gaston Legorburu', title: 'CEO & Founder', role: 'c_suite' as const, department: 'Executive' }, date: '2024-10-29', duration: 78 },
  { filename: 'Joey Wilson Interview December 11.md', interviewee: { name: 'Joey Wilson', title: 'Partner', role: 'c_suite' as const, department: 'Strategy' }, date: '2024-12-11', duration: 85 },
  { filename: 'Boris-Stojanovic.md', interviewee: { name: 'Boris Stojanovic', title: 'Partner', role: 'c_suite' as const, department: 'Advisory' }, date: '2024-11-15', duration: 34 },
  { filename: 'Matt-Kujawa.md', interviewee: { name: 'Matt Kujawa', title: 'Partner', role: 'c_suite' as const, department: 'Technology' }, date: '2024-12-09', duration: 85 },
  { filename: 'Maggy Conde Interview - November 10.md', interviewee: { name: 'Maggy Conde', title: 'Partner', role: 'c_suite' as const, department: 'Agency Services' }, date: '2024-11-10', duration: 65 },
  { filename: 'Noel Artiles Interview - December 10.md', interviewee: { name: 'Noel Artiles', title: 'CCO', role: 'c_suite' as const, department: 'Creative' }, date: '2024-12-10', duration: 64 },
  { filename: 'Michele Conigliaro Interview Transcript Parts 1 & 2 - Dec 16 & 17, 2025.md', interviewee: { name: 'Michele Conigliaro', title: 'Head of People', role: 'leadership' as const, department: 'HR' }, date: '2024-12-16', duration: 92 },
  { filename: 'Chiny Chewing Interview - November 12.md', interviewee: { name: 'Chiny Chewing', title: 'Partner', role: 'c_suite' as const, department: 'Strategy' }, date: '2024-11-12', duration: 67 },
  { filename: 'Dave Serrano Interview - November 11.md', interviewee: { name: 'Dave Serrano', title: 'Partner', role: 'c_suite' as const, department: 'Client Services' }, date: '2024-11-11', duration: 54 },
]

const TRANSCRIPTS_DIR = path.resolve(__dirname, '../transcripts/GLUEIQ/C-suite')
const OUTPUT_DIR = path.resolve(__dirname, '../data/organizations/glueiq')

// ============================================================================
// ANALYSIS FUNCTIONS
// ============================================================================

const TOOL_PATTERNS = ['ChatGPT', 'Claude', 'Gemini', 'Perplexity', 'Copilot', 'MidJourney', 'Beautiful AI', 'Gamma', 'Builder.io', 'Figma', 'Motion', 'Atlas', 'N8N', 'Fixer AI', 'Productive', 'HubSpot', 'Slack', 'Notion', 'Fathom', 'Otter', 'DALL-E', 'Runway', 'OpenAI', 'Anthropic', 'Pencil']

const THEME_DEFINITIONS: Record<string, { keywords: string[], dimension: string }> = {
  'no_formal_ai_plan': { keywords: ['no plan', 'no strategy', 'no roadmap', "don't have a plan", "haven't formalized"], dimension: 'strategy_alignment' },
  'no_roi_measurement': { keywords: ['not measuring', "don't track", 'no roi', "haven't quantified"], dimension: 'financial_performance' },
  'no_ethics_governance': { keywords: ['no ethics', 'no governance', 'no one accountable', "haven't defined"], dimension: 'ai_governance' },
  'tool_fragmentation': { keywords: ['too many tools', 'fragmented', 'scattered', 'different tools'], dimension: 'integration_capability' },
  'skills_gap': { keywords: ['skill gap', 'need training', "don't know how", 'learning curve'], dimension: 'skills_talent' },
  'resistance_to_change': { keywords: ['resist', "won't adopt", 'old school', 'traditional'], dimension: 'culture_change' },
  'leadership_aligned': { keywords: ['leadership', 'partners aligned', 'top down', 'c-suite'], dimension: 'leadership_vision' },
  'process_automation_need': { keywords: ['automate', 'manual', 'repetitive', 'workflow', 'efficiency'], dimension: 'process_optimization' },
  'reputation_exceeds_capability': { keywords: ['reputation', 'perception', 'talk about ai', 'not really doing'], dimension: 'ai_use_cases' },
  'creative_team_leads': { keywords: ['creative', 'design', 'art', 'video', 'visual', 'ahead'], dimension: 'skills_talent' },
  'psychological_safety': { keywords: ['safe', 'afraid', 'fear', 'comfortable', 'permission', 'judgment'], dimension: 'culture_change' },
}

// ============================================================================
// LVNG.AI ALIGNED 23 DIMENSION SCORING RUBRIC (-2 to 10 scale)
// ============================================================================
// Level -2: Actively Hostile - blocking AI, fighting adoption, sabotaging
// Level -1: Resistant - refuses to engage, sees AI as threat
// Level  0: AI Unaware - no AI usage, manual processes, no awareness
// Level  1: AI Curious - beginning to explore, some personal experimentation
// Level  2: AI Experimenting - AI tools in use, simple automations (25% adoption)
// Level  3: AI Connecting - first agents, measurable ROI
// Level  4: AI Collaborating - multi-agent, cross-functional AI workflows
// Level  5: AI Integrating - department-wide AI, 3:1 human-agent ratio
// Level  6: AI Orchestrating - enterprise-wide orchestration, predictive
// Level  7: AI Leading - strategic AI decisions, AI board advisors
// Level  8: AI Innovating - AI creates products, self-improving systems
// Level  9: AI Transforming - business model evolves via AI
// Level 10: AI Transcending - fully autonomous, living intelligence
// ============================================================================

// Dimension metadata for reporting
const DIMENSION_METADATA: Record<string, { name: string, category: string, description: string }> = {
  // STRATEGY & LEADERSHIP (5 dimensions)
  'leadership_vision': { name: 'Leadership Vision', category: 'Strategy & Leadership', description: 'C-suite commitment and AI vision clarity' },
  'strategy_alignment': { name: 'Strategy Alignment', category: 'Strategy & Leadership', description: 'AI strategy alignment with business goals' },
  'change_management': { name: 'Change Management', category: 'Strategy & Leadership', description: 'Organizational change readiness and execution' },
  'competitive_positioning': { name: 'Competitive Positioning', category: 'Strategy & Leadership', description: 'AI-driven market differentiation' },
  'innovation_capacity': { name: 'Innovation Capacity', category: 'Strategy & Leadership', description: 'Ability to innovate with AI' },

  // PEOPLE & CULTURE (5 dimensions)
  'skills_talent': { name: 'Skills & Talent', category: 'People & Culture', description: 'AI skills across the workforce' },
  'cultural_readiness': { name: 'Cultural Readiness', category: 'People & Culture', description: 'Organizational culture openness to AI' },
  'learning_development': { name: 'Learning & Development', category: 'People & Culture', description: 'AI training and upskilling programs' },
  'psychological_safety': { name: 'Psychological Safety', category: 'People & Culture', description: 'Safe environment for AI experimentation' },
  'champion_network': { name: 'Champion Network', category: 'People & Culture', description: 'AI advocates and change agents' },

  // TECHNOLOGY & DATA (5 dimensions)
  'data_infrastructure': { name: 'Data Infrastructure', category: 'Technology & Data', description: 'Data quality, accessibility, and governance' },
  'technology_stack': { name: 'Technology Stack', category: 'Technology & Data', description: 'AI-ready technology infrastructure' },
  'integration_capability': { name: 'Integration Capability', category: 'Technology & Data', description: 'Ability to integrate AI into existing systems' },
  'security_compliance': { name: 'Security & Compliance', category: 'Technology & Data', description: 'AI security and regulatory compliance' },
  'vendor_ecosystem': { name: 'Vendor Ecosystem', category: 'Technology & Data', description: 'AI vendor relationships and partnerships' },

  // OPERATIONS & PROCESSES (4 dimensions)
  'ai_use_cases': { name: 'AI Use Cases', category: 'Operations & Processes', description: 'Active AI implementations and applications' },
  'process_automation': { name: 'Process Automation', category: 'Operations & Processes', description: 'Automated workflows and efficiency gains' },
  'operational_excellence': { name: 'Operational Excellence', category: 'Operations & Processes', description: 'AI-driven operational improvements' },
  'customer_experience': { name: 'Customer Experience', category: 'Operations & Processes', description: 'AI enhancement of customer touchpoints' },

  // GOVERNANCE & RISK (4 dimensions)
  'ai_governance': { name: 'AI Governance', category: 'Governance & Risk', description: 'AI policies, accountability, and oversight' },
  'ethics_responsibility': { name: 'Ethics & Responsibility', category: 'Governance & Risk', description: 'Ethical AI practices and responsibility' },
  'risk_management': { name: 'Risk Management', category: 'Governance & Risk', description: 'AI risk identification and mitigation' },
  'roi_measurement': { name: 'ROI Measurement', category: 'Governance & Risk', description: 'AI investment tracking and value measurement' },
}

type DimensionRubric = {
  'level-2': string[], 'level-1': string[], level0: string[], level1: string[],
  level2: string[], level3: string[], level4: string[], level5: string[],
  level6: string[], level7: string[], level8: string[], level9: string[], level10: string[]
}

const SCORING_RUBRIC: Record<string, DimensionRubric> = {
  // ============================================================================
  // STRATEGY & LEADERSHIP DIMENSIONS
  // ============================================================================
  'leadership_vision': {
    'level-2': ['blocking ai', 'anti-ai leadership', 'fighting adoption'],
    'level-1': ['skeptical leadership', 'resistant executives', 'afraid of ai'],
    level0: ['no vision', 'not interested', 'skeptical', 'resistant', 'afraid of'],
    level1: ['aware', 'considering', 'interested', 'want to invest', 'see potential', 'discussing'],
    level2: ['committed', 'engaged', 'supportive', 'aligned', 'investing'],
    level3: ['championing', 'leading', 'driving', 'modeling behavior'],
    level4: ['ai advocates', 'leading transformation', 'public commitment'],
    level5: ['visionary leadership', 'ai-first executives', 'industry voice'],
    level6: ['enterprise ai vision', 'strategic ai leadership', 'board mandate'],
    level7: ['industry thought leader', 'ai evangelist', 'market shaper'],
    level8: ['ai-driven leadership', 'autonomous decisions', 'innovation pioneer'],
    level9: ['transformational leader', 'ai-native executive', 'adaptive vision'],
    level10: ['transcendent leadership', 'consciousness leader', 'living vision']
  },
  'strategy_alignment': {
    'level-2': ['anti-ai strategy', 'banning ai', 'blocking adoption'],
    'level-1': ['ignoring ai', 'no interest', 'resistant to strategy'],
    level0: ['no strategy', 'no plan', 'no roadmap', 'reactive', 'ad hoc', 'no formal'],
    level1: ['discussing', 'considering', 'talking about', 'want to', 'plan to', 'thinking about'],
    level2: ['starting to plan', 'informal roadmap', 'pilot budget', 'initial investment'],
    level3: ['documented strategy', 'formal plan', 'budget allocated', 'roadmap exists'],
    level4: ['integrated plan', 'cross-functional strategy', '50% aligned'],
    level5: ['department strategies', 'custom ai roadmaps', 'ai-first planning'],
    level6: ['enterprise strategy', 'ai central to business', 'predictive planning'],
    level7: ['board-level strategy', 'ai strategic pillar', 'market leadership'],
    level8: ['ai-driven strategy', 'autonomous planning', 'innovation-led'],
    level9: ['adaptive strategy', 'real-time evolution', 'ai-native business'],
    level10: ['transcendent strategy', 'living strategy', 'self-evolving']
  },
  'change_management': {
    'level-2': ['blocking change', 'sabotaging transformation', 'active resistance'],
    'level-1': ['resistant to change', 'change fatigue', 'transformation failure'],
    level0: ['no change plan', 'no communication', 'surprised by change', 'unprepared'],
    level1: ['starting to communicate', 'awareness building', 'initial discussions'],
    level2: ['change plan exists', 'communication started', 'some training'],
    level3: ['formal change program', 'stakeholder engagement', 'training underway'],
    level4: ['change champions', 'regular communication', 'adoption tracking'],
    level5: ['embedded change', 'culture shifting', 'continuous improvement'],
    level6: ['enterprise change', 'agile transformation', 'rapid adaptation'],
    level7: ['change leadership', 'industry benchmark', 'best practices'],
    level8: ['autonomous change', 'self-organizing', 'adaptive organization'],
    level9: ['continuous evolution', 'living organization', 'real-time adaptation'],
    level10: ['transcendent change', 'consciousness evolution', 'universal adaptation']
  },
  'competitive_positioning': {
    'level-2': ['losing market share', 'ai disrupted', 'falling behind'],
    'level-1': ['ignoring competition', 'no awareness', 'complacent'],
    level0: ['no competitive awareness', 'not tracking ai', 'reactive'],
    level1: ['watching competitors', 'aware of ai trends', 'discussing threat'],
    level2: ['competitive analysis', 'ai benchmarking', 'initial response'],
    level3: ['ai differentiation', 'competitive advantage', 'market positioning'],
    level4: ['ai leadership', 'market innovation', 'customer value'],
    level5: ['industry leader', 'ai-driven differentiation', 'market shaper'],
    level6: ['market dominance', 'ai ecosystem leader', 'standard setter'],
    level7: ['industry transformer', 'market creator', 'category leader'],
    level8: ['autonomous positioning', 'ai-driven strategy', 'market prediction'],
    level9: ['adaptive positioning', 'real-time response', 'market evolution'],
    level10: ['transcendent positioning', 'market creation', 'industry transcendence']
  },
  'innovation_capacity': {
    'level-2': ['blocking innovation', 'killing ideas', 'status quo'],
    'level-1': ['resistant to innovation', 'risk averse', 'no experimentation'],
    level0: ['no innovation', 'no experimentation', 'no r&d', 'no ideas'],
    level1: ['some ideas', 'discussing innovation', 'interested in new'],
    level2: ['pilot projects', 'experimentation starting', 'innovation time'],
    level3: ['innovation program', 'dedicated resources', 'regular experiments'],
    level4: ['innovation culture', 'fail fast', 'continuous experimentation'],
    level5: ['ai-driven innovation', 'predictive r&d', 'rapid prototyping'],
    level6: ['enterprise innovation', 'cross-functional', 'portfolio approach'],
    level7: ['industry innovation', 'thought leadership', 'patent generation'],
    level8: ['autonomous innovation', 'ai creates ideas', 'self-improving'],
    level9: ['adaptive innovation', 'real-time ideation', 'living innovation'],
    level10: ['transcendent innovation', 'reality creation', 'breakthrough discovery']
  },

  // ============================================================================
  // PEOPLE & CULTURE DIMENSIONS
  // ============================================================================
  'skills_talent': {
    'level-2': ['blocking training', 'against ai', 'refuse to learn', 'ai will destroy'],
    'level-1': ['resistant', "won't learn", 'skeptical workforce', 'afraid', 'threatened'],
    level0: ['no one uses', "don't know", 'not aware', 'no training', '75% not using', '85% not using', 'most people not'],
    level1: ['some people', 'few users', 'starting to', 'exploring', 'trying out', 'personal use'],
    level2: ['25% using', 'regular training', 'team learning', 'weekly usage', 'standard tools'],
    level3: ['half the team', '50%', 'many people', 'embedded', 'daily workflows'],
    level4: ['most team members', '60%', 'integrated workflows', 'ai-augmented'],
    level5: ['majority', '70%', 'company-wide adoption', 'ai fluent', '3:1 ratio'],
    level6: ['all employees', 'enterprise fluency', 'ai-first culture', '80%+'],
    level7: ['industry leaders', 'ai experts', 'thought leaders', '90%+'],
    level8: ['creating ai tools', 'ai developers', 'building systems'],
    level9: ['ai architects', 'ai-native workforce', 'human-ai fusion'],
    level10: ['transcendent skills', 'consciousness integration', 'living systems']
  },
  'cultural_readiness': {
    'level-2': ['toxic culture', 'anti-change', 'hostile environment'],
    'level-1': ['resistant culture', 'fear of change', 'blame culture'],
    level0: ['no readiness', 'unaware', 'traditional culture', 'change resistant'],
    level1: ['starting conversations', 'some openness', 'curious culture'],
    level2: ['accepting change', 'open to ai', 'experimentation allowed'],
    level3: ['embracing ai', 'culture shifting', 'change positive'],
    level4: ['ai-positive culture', 'innovation encouraged', 'learning culture'],
    level5: ['ai-first culture', 'continuous learning', 'adaptive mindset'],
    level6: ['enterprise culture', 'ai-native values', 'transformation embedded'],
    level7: ['industry culture leader', 'best practices', 'cultural benchmark'],
    level8: ['autonomous culture', 'self-evolving values', 'adaptive norms'],
    level9: ['living culture', 'real-time adaptation', 'consciousness culture'],
    level10: ['transcendent culture', 'universal values', 'collective consciousness']
  },
  'learning_development': {
    'level-2': ['no training allowed', 'blocking development', 'anti-learning'],
    'level-1': ['no interest in training', 'resistant to learning', 'no time'],
    level0: ['no training', 'no program', 'figure it out', 'on their own', 'no upskilling'],
    level1: ['informal learning', 'self-directed', 'some resources', 'interested'],
    level2: ['training started', 'basic program', 'workshops offered', 'courses available'],
    level3: ['formal program', 'structured training', 'certification paths', 'dedicated time'],
    level4: ['comprehensive training', 'role-specific', 'continuous learning'],
    level5: ['ai-native learning', 'personalized paths', 'ai-augmented training'],
    level6: ['enterprise learning', 'ai university', 'continuous upskilling'],
    level7: ['industry training leader', 'thought leadership', 'external training'],
    level8: ['autonomous learning', 'ai-generated curriculum', 'adaptive training'],
    level9: ['living learning', 'real-time skill building', 'consciousness development'],
    level10: ['transcendent learning', 'universal knowledge', 'infinite learning']
  },
  'psychological_safety': {
    'level-2': ['punishment for failure', 'blame culture', 'fear environment'],
    'level-1': ['afraid to try', 'fear of failure', 'no permission', 'judgment'],
    level0: ['no safety', 'afraid', 'fear', 'no permission', 'judgment', 'scared'],
    level1: ['some safety', 'starting to trust', 'permission given'],
    level2: ['safe to try', 'failure accepted', 'experimentation ok'],
    level3: ['safe environment', 'fail fast encouraged', 'learning from failure'],
    level4: ['psychological safety', 'open communication', 'trust established'],
    level5: ['innovation safety', 'radical candor', 'full trust'],
    level6: ['enterprise safety', 'organization-wide trust', 'open culture'],
    level7: ['industry benchmark', 'safety leader', 'best practices'],
    level8: ['autonomous safety', 'self-regulating trust', 'adaptive safety'],
    level9: ['living safety', 'real-time trust', 'consciousness safety'],
    level10: ['transcendent safety', 'universal trust', 'collective safety']
  },
  'champion_network': {
    'level-2': ['blocking champions', 'isolating advocates', 'punishing leaders'],
    'level-1': ['no champions', 'no advocates', 'no support'],
    level0: ['no champions', 'no advocates', 'isolated efforts', 'no network'],
    level1: ['few enthusiasts', 'informal champions', 'scattered advocates'],
    level2: ['identified champions', 'starting network', 'some support'],
    level3: ['formal champions', 'network established', 'regular meetings'],
    level4: ['champion program', 'resources provided', 'recognition'],
    level5: ['mature network', 'peer learning', 'cross-functional'],
    level6: ['enterprise network', 'global champions', 'community of practice'],
    level7: ['industry champions', 'external recognition', 'thought leaders'],
    level8: ['autonomous network', 'self-organizing', 'adaptive community'],
    level9: ['living network', 'real-time collaboration', 'consciousness network'],
    level10: ['transcendent network', 'universal collaboration', 'collective champions']
  },

  // ============================================================================
  // TECHNOLOGY & DATA DIMENSIONS
  // ============================================================================
  'data_infrastructure': {
    'level-2': ['data silos blocked', 'preventing access', 'anti-data'],
    'level-1': ['data chaos', 'no governance', 'poor quality', 'inaccessible'],
    level0: ['no data strategy', 'siloed data', 'poor quality', 'no access'],
    level1: ['aware of issues', 'discussing data', 'starting cleanup'],
    level2: ['data cleanup', 'basic governance', 'some integration'],
    level3: ['data platform', 'quality improving', 'accessibility growing'],
    level4: ['mature data', 'governed', 'accessible', 'quality assured'],
    level5: ['ai-ready data', 'real-time', 'high quality', 'self-service'],
    level6: ['enterprise data', 'unified platform', 'predictive quality'],
    level7: ['industry data leader', 'data monetization', 'ecosystem data'],
    level8: ['autonomous data', 'self-healing', 'ai-managed'],
    level9: ['living data', 'real-time evolution', 'adaptive data'],
    level10: ['transcendent data', 'universal data', 'consciousness data']
  },
  'technology_stack': {
    'level-2': ['blocking technology', 'preventing upgrades', 'anti-modernization'],
    'level-1': ['legacy systems', 'outdated', 'technical debt', 'no investment'],
    level0: ['no ai infrastructure', 'legacy', 'outdated', 'manual'],
    level1: ['aware of needs', 'discussing upgrades', 'evaluating tools'],
    level2: ['initial tools', 'cloud starting', 'some modernization'],
    level3: ['ai tools deployed', 'cloud adopted', 'apis available'],
    level4: ['integrated stack', 'ai platforms', 'modern architecture'],
    level5: ['ai-native stack', 'scalable', 'flexible', 'integrated'],
    level6: ['enterprise platform', 'unified ai', 'ecosystem integrated'],
    level7: ['industry leading', 'cutting edge', 'innovation platform'],
    level8: ['autonomous stack', 'self-healing', 'ai-managed'],
    level9: ['living stack', 'real-time evolution', 'adaptive technology'],
    level10: ['transcendent stack', 'universal platform', 'consciousness technology']
  },
  'integration_capability': {
    'level-2': ['blocking integration', 'preventing connections', 'isolation'],
    'level-1': ['no integration', 'siloed systems', 'disconnected'],
    level0: ['no integration', 'siloed', 'manual connections', 'fragmented'],
    level1: ['aware of needs', 'discussing integration', 'planning'],
    level2: ['initial integration', 'some apis', 'basic connections'],
    level3: ['integration platform', 'apis established', 'data flowing'],
    level4: ['mature integration', 'real-time', 'automated'],
    level5: ['ai integration', 'intelligent routing', 'predictive'],
    level6: ['enterprise integration', 'unified platform', 'ecosystem'],
    level7: ['industry integration', 'standard apis', 'ecosystem leader'],
    level8: ['autonomous integration', 'self-connecting', 'ai-managed'],
    level9: ['living integration', 'real-time adaptation', 'organic connections'],
    level10: ['transcendent integration', 'universal connectivity', 'consciousness integration']
  },
  'security_compliance': {
    'level-2': ['blocking security', 'ignoring compliance', 'reckless'],
    'level-1': ['no security plan', 'compliance gaps', 'risky practices'],
    level0: ['no ai security', 'no compliance', 'unknown risks', 'gaps'],
    level1: ['aware of risks', 'discussing security', 'compliance review'],
    level2: ['initial security', 'basic compliance', 'risk assessment'],
    level3: ['security program', 'compliance framework', 'risk management'],
    level4: ['mature security', 'continuous compliance', 'proactive risk'],
    level5: ['ai security', 'automated compliance', 'predictive risk'],
    level6: ['enterprise security', 'unified compliance', 'zero trust'],
    level7: ['industry security leader', 'compliance benchmark', 'best practices'],
    level8: ['autonomous security', 'ai-managed', 'self-healing'],
    level9: ['living security', 'real-time adaptation', 'adaptive compliance'],
    level10: ['transcendent security', 'universal compliance', 'consciousness security']
  },
  'vendor_ecosystem': {
    'level-2': ['blocking vendors', 'isolation', 'anti-partnership'],
    'level-1': ['no vendor relationships', 'isolated', 'no partnerships'],
    level0: ['no ai vendors', 'no partnerships', 'unknown ecosystem'],
    level1: ['evaluating vendors', 'exploring partnerships', 'initial contact'],
    level2: ['initial vendors', 'pilot partnerships', 'some relationships'],
    level3: ['vendor portfolio', 'strategic partnerships', 'ecosystem forming'],
    level4: ['mature ecosystem', 'integrated vendors', 'partnership value'],
    level5: ['ai ecosystem', 'strategic alliances', 'co-innovation'],
    level6: ['enterprise ecosystem', 'unified partnerships', 'ecosystem orchestration'],
    level7: ['industry ecosystem leader', 'platform partnerships', 'ecosystem shaper'],
    level8: ['autonomous ecosystem', 'ai-managed partnerships', 'self-optimizing'],
    level9: ['living ecosystem', 'real-time partnerships', 'adaptive alliances'],
    level10: ['transcendent ecosystem', 'universal partnerships', 'consciousness ecosystem']
  },

  // ============================================================================
  // OPERATIONS & PROCESSES DIMENSIONS
  // ============================================================================
  'ai_use_cases': {
    'level-2': ['banning ai', 'prohibited', 'blocked all ai'],
    'level-1': ['avoiding ai', 'not implementing', "won't use"],
    level0: ['no ai', 'not using', "haven't implemented", 'no plan', 'no roadmap', 'cobbler\'s children'],
    level1: ['experimenting', 'pilot', 'trying', 'playing with', 'exploring', 'one or two people'],
    level2: ['few use cases', 'some projects', 'basic chatbots', 'ai writing', 'simple automation'],
    level3: ['agents', 'roi', 'measurable', 'production', 'integrated'],
    level4: ['multi-agent', 'orchestrated workflows', '50% processes'],
    level5: ['department-wide', 'custom models', 'platform', '3:1 ratio'],
    level6: ['enterprise-wide', 'cross-functional ai', 'predictive'],
    level7: ['strategic ai', 'board-level ai', 'ai-driven decisions'],
    level8: ['ai creates products', 'autonomous development', 'self-improving'],
    level9: ['ai transforms business', 'autonomous operations', 'adaptive'],
    level10: ['ai transcending', 'living intelligence', 'self-evolving']
  },
  'process_automation': {
    'level-2': ['blocking automation', 'preventing efficiency', 'anti-automation'],
    'level-1': ['resistant to automation', 'manual preferred', 'no interest'],
    level0: ['no automation', 'manual processes', 'repetitive', 'inefficient'],
    level1: ['aware of opportunities', 'discussing automation', 'interested'],
    level2: ['initial automation', 'simple workflows', 'basic rpa'],
    level3: ['automation program', 'multiple processes', 'measuring savings'],
    level4: ['intelligent automation', 'ai-augmented', 'significant savings'],
    level5: ['enterprise automation', 'ai orchestration', 'predictive workflows'],
    level6: ['autonomous processes', 'self-optimizing', 'minimal intervention'],
    level7: ['industry automation leader', 'best practices', 'benchmark'],
    level8: ['ai-driven processes', 'self-designing', 'autonomous operations'],
    level9: ['living processes', 'real-time adaptation', 'organic workflows'],
    level10: ['transcendent processes', 'universal automation', 'consciousness processes']
  },
  'operational_excellence': {
    'level-2': ['blocking improvements', 'preventing optimization', 'anti-excellence'],
    'level-1': ['declining operations', 'no improvement', 'inefficient'],
    level0: ['no excellence', 'inefficient', 'no measurement', 'reactive'],
    level1: ['aware of gaps', 'discussing improvements', 'initial metrics'],
    level2: ['improvement program', 'basic metrics', 'some optimization'],
    level3: ['operational program', 'kpis established', 'continuous improvement'],
    level4: ['ai-enhanced operations', 'predictive maintenance', 'optimization'],
    level5: ['ai-driven excellence', 'real-time optimization', 'proactive'],
    level6: ['enterprise excellence', 'unified operations', 'predictive'],
    level7: ['industry excellence leader', 'benchmark operations', 'best practices'],
    level8: ['autonomous operations', 'self-optimizing', 'ai-managed'],
    level9: ['living operations', 'real-time evolution', 'adaptive excellence'],
    level10: ['transcendent operations', 'universal excellence', 'consciousness operations']
  },
  'customer_experience': {
    'level-2': ['blocking cx improvement', 'ignoring customers', 'anti-service'],
    'level-1': ['poor cx', 'declining satisfaction', 'complaints'],
    level0: ['no ai in cx', 'manual service', 'reactive', 'slow response'],
    level1: ['exploring ai cx', 'discussing improvements', 'customer research'],
    level2: ['initial ai cx', 'basic chatbot', 'some personalization'],
    level3: ['ai-enhanced cx', 'improved response', 'personalization'],
    level4: ['ai-driven cx', 'predictive service', 'proactive outreach'],
    level5: ['intelligent cx', 'hyper-personalization', 'anticipatory service'],
    level6: ['enterprise cx', 'omnichannel ai', 'unified experience'],
    level7: ['industry cx leader', 'best-in-class service', 'cx innovation'],
    level8: ['autonomous cx', 'ai-managed relationships', 'self-optimizing'],
    level9: ['living cx', 'real-time adaptation', 'organic relationships'],
    level10: ['transcendent cx', 'universal service', 'consciousness cx']
  },

  // ============================================================================
  // GOVERNANCE & RISK DIMENSIONS
  // ============================================================================
  'ai_governance': {
    'level-2': ['anti-governance', 'blocking compliance', 'sabotaging'],
    'level-1': ['ignoring governance', 'no interest in ethics', 'resistant'],
    level0: ['no governance', 'no policy', 'not addressed', 'no ethics', 'no one accountable', 'no owner'],
    level1: ['informal', 'case by case', 'starting to think', 'discussing'],
    level2: ['basic guidelines', 'some policies', 'designated owner', 'informal framework'],
    level3: ['formal framework', 'ethics guidelines', 'compliance', 'governance committee'],
    level4: ['comprehensive policies', 'enforced governance', 'ai ethics board'],
    level5: ['certified governance', 'industry standards', 'proactive compliance'],
    level6: ['enterprise governance', 'ai-specific compliance', 'predictive ethics'],
    level7: ['industry leader governance', 'thought leadership', 'regulatory influence'],
    level8: ['autonomous governance', 'self-regulating', 'ai ethics innovation'],
    level9: ['adaptive governance', 'real-time ethics', 'ai-native compliance'],
    level10: ['transcendent governance', 'consciousness ethics', 'universal standards']
  },
  'ethics_responsibility': {
    'level-2': ['unethical practices', 'ignoring responsibility', 'harmful ai'],
    'level-1': ['no ethics awareness', 'irresponsible', 'risky practices'],
    level0: ['no ethics policy', 'no awareness', 'no consideration', 'no ai ethics'],
    level1: ['aware of ethics', 'discussing responsibility', 'concerned'],
    level2: ['initial ethics', 'basic guidelines', 'some consideration'],
    level3: ['ethics program', 'formal guidelines', 'responsibility assigned'],
    level4: ['comprehensive ethics', 'board oversight', 'external review'],
    level5: ['proactive ethics', 'industry standards', 'transparency'],
    level6: ['enterprise ethics', 'unified standards', 'predictive ethics'],
    level7: ['ethics leader', 'industry benchmark', 'thought leadership'],
    level8: ['autonomous ethics', 'ai-managed responsibility', 'self-governing'],
    level9: ['living ethics', 'real-time adaptation', 'organic responsibility'],
    level10: ['transcendent ethics', 'universal responsibility', 'consciousness ethics']
  },
  'risk_management': {
    'level-2': ['ignoring risks', 'reckless', 'dangerous practices'],
    'level-1': ['poor risk awareness', 'reactive only', 'unprepared'],
    level0: ['no risk management', 'unknown risks', 'no assessment', 'unprepared'],
    level1: ['aware of risks', 'discussing risk', 'initial assessment'],
    level2: ['basic risk', 'some assessment', 'mitigation starting'],
    level3: ['risk program', 'formal assessment', 'mitigation plans'],
    level4: ['comprehensive risk', 'continuous monitoring', 'proactive'],
    level5: ['ai risk management', 'predictive risk', 'automated monitoring'],
    level6: ['enterprise risk', 'unified management', 'real-time monitoring'],
    level7: ['industry risk leader', 'best practices', 'benchmark'],
    level8: ['autonomous risk', 'ai-managed', 'self-mitigating'],
    level9: ['living risk', 'real-time adaptation', 'adaptive mitigation'],
    level10: ['transcendent risk', 'universal management', 'consciousness risk']
  },
  'roi_measurement': {
    'level-2': ['blocking measurement', 'hiding results', 'anti-accountability'],
    'level-1': ['no measurement', 'no tracking', 'unknown roi'],
    level0: ['no roi tracking', 'not measuring', 'no roi', "haven't measured", "don't track", 'hard to quantify'],
    level1: ['aware of need', 'discussing measurement', 'initial metrics'],
    level2: ['basic tracking', 'some metrics', 'initial roi'],
    level3: ['formal measurement', 'roi framework', 'regular reporting'],
    level4: ['comprehensive roi', 'business cases', 'value tracking'],
    level5: ['ai-driven measurement', 'predictive roi', 'automated tracking'],
    level6: ['enterprise measurement', 'unified roi', 'real-time value'],
    level7: ['industry measurement leader', 'benchmark roi', 'best practices'],
    level8: ['autonomous measurement', 'ai-managed roi', 'self-optimizing'],
    level9: ['living measurement', 'real-time adaptation', 'organic value'],
    level10: ['transcendent measurement', 'universal value', 'consciousness roi']
  },
}

function extractEntities(transcript: TranscriptData): ExtractedEntity[] {
  const content = transcript.rawContent
  const entities: ExtractedEntity[] = []

  // Extract tools
  for (const tool of TOOL_PATTERNS) {
    const regex = new RegExp(`\\b${tool}\\b`, 'gi')
    const matches = content.match(regex)
    if (matches && matches.length > 0) {
      entities.push({
        type: 'tool',
        value: tool,
        context: 'AI/Technology tool',
        frequency: matches.length,
        sourceQuotes: extractContextQuotes(content, tool),
        sentiment: 'neutral'
      })
    }
  }

  return entities
}

function extractContextQuotes(content: string, term: string): string[] {
  const quotes: string[] = []
  const regex = new RegExp(`[^.!?]*\\b${term}\\b[^.!?]*[.!?]`, 'gi')
  const matches = content.matchAll(regex)
  for (const match of matches) {
    if (match[0].length < 500) {
      quotes.push(match[0].trim())
    }
  }
  return quotes.slice(0, 3)
}

function mineThemes(transcript: TranscriptData): ThemeCluster[] {
  const content = transcript.rawContent.toLowerCase()
  const themes: ThemeCluster[] = []

  for (const [themeName, definition] of Object.entries(THEME_DEFINITIONS)) {
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
        sentiment: calculateSentiment(matchingQuotes.join(' ')),
        sourceInterviews: [transcript.interviewee.name],
        representativeQuotes: matchingQuotes.slice(0, 3),
        dimensions: [definition.dimension]
      })
    }
  }

  return themes.sort((a, b) => b.frequency - a.frequency)
}

function calculateSentiment(text: string): number {
  const positive = ['good', 'great', 'helpful', 'improve', 'better', 'opportunity'].filter(w => text.toLowerCase().includes(w)).length
  const negative = ['problem', 'issue', 'challenge', 'difficult', 'gap', 'lack'].filter(w => text.toLowerCase().includes(w)).length
  const total = positive + negative
  return total > 0 ? (positive - negative) / total : 0
}

// CRITICAL NEGATIVE INDICATORS - things that cap scores to 1-2 range
// Each indicator maps to specific dimensions and score caps (0-10 scale)
// GlueIQ reality: NO plan, NO governance, NO measurement = essentially Level 1-2
const NEGATIVE_INDICATORS: { [key: string]: { phrases: string[], affects: { [dim: string]: number } } } = {
  no_plan: {
    phrases: ['no plan', 'no roadmap', 'no strategy', 'haven\'t formalized', 'no formal', 'don\'t have any plan', 'no ai plan'],
    affects: { strategy_alignment: 1.0, ai_use_cases: 1.5 }
  },
  no_measurement: {
    phrases: ['not measuring', 'no roi', 'haven\'t measured', 'don\'t measure', 'no metrics', 'hard to quantify'],
    affects: { ai_use_cases: 1.5, strategy_alignment: 1.5 }
  },
  no_governance: {
    phrases: ['no ethics', 'no one accountable', 'no governance', 'no policy', 'no owner', 'no one is accountable', 'haven\'t defined', 'not accountable', 'nobody owns', 'who owns'],
    affects: { ai_governance: 1.0, strategy_alignment: 1.5 }  // Governance is basically zero
  },
  no_ethics_policy: {
    phrases: ['no ai ethics', 'ethics policy', 'don\'t have a policy', 'no guidelines'],
    affects: { ai_governance: 1.0 }
  },
  reputation_gap: {
    phrases: ['reputation exceeds', 'not really doing', 'cobbler\'s children', 'sell it but', 'talk about it but', 'exceeds capability'],
    affects: { ai_use_cases: 1.5, skills_talent: 2.0, strategy_alignment: 1.5 }
  },
  low_adoption: {
    phrases: ['not using', '75% not using', '85% not using', 'lagging', 'old school', 'resistant'],
    affects: { skills_talent: 2.0, ai_use_cases: 1.5 }
  },
  no_training: {
    phrases: ['no training', 'no program', 'no upskilling', 'figure it out', 'on their own'],
    affects: { skills_talent: 1.5 }
  },
  vision_exists: {
    phrases: ['partners aligned', 'all believe', 'top down support', 'want to invest', 'committed'],
    affects: { leadership_vision: 2.5 }  // Vision exists but without execution it's only a 2.5
  },
  talk_no_action: {
    phrases: ['talk about', 'discussed', 'we should', 'we need to', 'plan to', 'want to', 'thinking about', 'considering'],
    affects: { leadership_vision: 2.0, strategy_alignment: 1.5 }  // Talk without action = very low
  }
}

function scoreDimension(transcripts: TranscriptData[], dimension: string): DimensionScore {
  const criteria = SCORING_RUBRIC[dimension]
  if (!criteria) {
    // DEFAULT TO LOW (0.5) - be very conservative
    return { dimension, score: 0.5, evidence: ['No specific evidence found - defaulting to minimal'], confidence: 0.3 }
  }

  const allContent = transcripts.map(t => t.rawContent).join(' ')
  const allContentLower = allContent.toLowerCase()
  const evidence: string[] = []
  const negativeEvidence: string[] = []

  // ============================================================================
  // LVNG.AI ALIGNED DIMENSION SCORING (-2 to 10 scale)
  // Negative evidence sets HARD CAPS
  // ============================================================================

  // First, check for NEGATIVE indicators - these set absolute caps
  let maxScore = 10

  for (const [category, indicator] of Object.entries(NEGATIVE_INDICATORS)) {
    for (const phrase of indicator.phrases) {
      if (allContentLower.includes(phrase)) {
        const regex = new RegExp(`[^.!?]*${phrase}[^.!?]*[.!?]`, 'gi')
        const matches = allContent.match(regex) || []
        if (matches.length > 0 && matches[0]) {
          negativeEvidence.push(matches[0].trim().slice(0, 200))
          if (indicator.affects[dimension] !== undefined) {
            maxScore = Math.min(maxScore, indicator.affects[dimension])
          }
        }
      }
    }
  }

  // ============================================================================
  // FULL PROGRESSIVE SCORING: -2 → -1 → 0 → 1 → 2 → ... → 10
  // ============================================================================

  // Track evidence at each level (-2 to 10)
  const levelEvidence: { [level: number]: string[] } = {}
  for (let i = -2; i <= 10; i++) {
    levelEvidence[i] = []
  }

  for (const [level, phrases] of Object.entries(criteria)) {
    // Parse level number (handles 'level-2', 'level-1', 'level0', etc.)
    const levelNum = parseInt(level.replace('level', ''))
    if (isNaN(levelNum)) continue

    for (const phrase of phrases as string[]) {
      const regex = new RegExp(`[^.!?]*${phrase}[^.!?]*[.!?]`, 'gi')
      const matches = transcripts.flatMap(t => t.rawContent.match(regex) || [])
      if (matches.length > 0) {
        levelEvidence[levelNum].push(...matches.slice(0, 2))
      }
    }
  }

  // Start at level 0 (AI Unaware) - baseline
  let score = 0

  // Check for NEGATIVE levels first (-2, -1)
  if (levelEvidence[-2].length >= 2) {
    score = -2  // Actively hostile
    evidence.push(...levelEvidence[-2].slice(0, 2))
  } else if (levelEvidence[-1].length >= 2) {
    score = -1  // Resistant
    evidence.push(...levelEvidence[-1].slice(0, 2))
  }

  // If not negative, check positive progression
  if (score >= 0) {
    // Level 0: Problems/gaps identified (awareness exists)
    if (levelEvidence[0].length >= 1) {
      evidence.push(...levelEvidence[0].slice(0, 1))
      score = 0.5
    }

    // Level 1: AI Curious
    if (score >= 0.5 && levelEvidence[1].length >= 1) {
      evidence.push(...levelEvidence[1].slice(0, 1))
      score = 1.0
    }
    if (score >= 1.0 && levelEvidence[1].length >= 2) {
      score = 1.5
    }

    // Level 2: AI Experimenting
    if (score >= 1.5 && levelEvidence[2].length >= 2) {
      evidence.push(...levelEvidence[2].slice(0, 1))
      score = 2.0
    }
    if (score >= 2.0 && levelEvidence[2].length >= 3) {
      score = 2.5
    }

    // Level 3: AI Connecting
    if (score >= 2.5 && levelEvidence[3].length >= 2) {
      evidence.push(...levelEvidence[3].slice(0, 1))
      score = 3.0
    }

    // Level 4: AI Collaborating
    if (score >= 3.0 && levelEvidence[4].length >= 2) {
      evidence.push(...levelEvidence[4].slice(0, 1))
      score = 4.0
    }

    // Level 5: AI Integrating
    if (score >= 4.0 && levelEvidence[5].length >= 2) {
      evidence.push(...levelEvidence[5].slice(0, 1))
      score = 5.0
    }

    // Level 6: AI Orchestrating
    if (score >= 5.0 && levelEvidence[6].length >= 2) {
      evidence.push(...levelEvidence[6].slice(0, 1))
      score = 6.0
    }

    // Level 7: AI Leading
    if (score >= 6.0 && levelEvidence[7].length >= 2) {
      evidence.push(...levelEvidence[7].slice(0, 1))
      score = 7.0
    }

    // Level 8: AI Innovating
    if (score >= 7.0 && levelEvidence[8].length >= 2) {
      evidence.push(...levelEvidence[8].slice(0, 1))
      score = 8.0
    }

    // Level 9: AI Transforming
    if (score >= 8.0 && levelEvidence[9].length >= 2) {
      evidence.push(...levelEvidence[9].slice(0, 1))
      score = 9.0
    }

    // Level 10: AI Transcending
    if (score >= 9.0 && levelEvidence[10].length >= 2) {
      evidence.push(...levelEvidence[10].slice(0, 1))
      score = 10.0
    }
  }

  // Default if no evidence at all
  if (evidence.length === 0 && negativeEvidence.length > 0) {
    score = 0.5  // Awareness of gaps
  } else if (evidence.length === 0) {
    score = 0  // AI Unaware
  }

  // ============================================================================
  // APPLY HARD CAP from negative indicators
  // ============================================================================
  score = Math.min(score, maxScore)

  const combinedEvidence = [...negativeEvidence.slice(0, 3), ...evidence.slice(0, 2)]

  return {
    dimension,
    score: Math.round(score * 10) / 10,
    evidence: combinedEvidence.slice(0, 5),
    confidence: Math.min((evidence.length + negativeEvidence.length) / 10, 1)
  }
}

// ============================================================================
// AI SKILL LEVEL SCALE (-2 to +10) - ALIGNED WITH LVNG.AI MATURITY FRAMEWORK
// ============================================================================
// IMPORTANT: Progression is SLOW and EVIDENCE-BASED. Using ChatGPT daily != Level 2+
// Each level requires DEMONSTRATED capability, not just usage
//
// Level -2: Actively Resistant - refuses AI, sees it as threat, won't engage
// Level -1: Skeptical/Reluctant - minimal engagement, afraid of AI, needs heavy convincing
// Level  0: AI Unaware/Basic - uses ChatGPT occasionally for simple Q&A, copy/paste (BASELINE)
//           "Standard stuff", "just the basics", occasional use = Level 0
// Level  1: AI Curious - exploring possibilities, trying different tools, daily usage but basic
//           Uses 2-3 tools, regular usage, but still basic prompts = Level 1
// Level  2: AI Experimenting - AI writing assistants integrated into workflow, simple automations
//           REQUIRES: 25%+ team adoption OR demonstrated workflow integration OR automation attempts
// Level  3: AI Connecting - single-purpose agents, measurable ROI from AI
//           REQUIRES: Built/deployed at least one agent OR demonstrated measurable AI ROI
// Level  4: AI Collaborating - multi-agent workflows, orchestration
//           REQUIRES: Multiple agents working together, cross-functional AI workflows
// Level  5: AI Integrating - department-wide AI platforms, custom models
//           REQUIRES: Department operating with significant AI integration (3:1 human-agent ratio)
// Level  6: AI Orchestrating - cross-functional intelligence, predictive capabilities
//           REQUIRES: Enterprise-wide AI orchestration, AI prevents issues proactively
// Level  7: AI Leading - strategic AI decisions, AI board advisors
//           REQUIRES: AI driving strategic decisions, new revenue from AI
// Level  8: AI Innovating - AI creates products/services, self-improving systems
//           REQUIRES: AI-driven R&D, autonomous product development
// Level  9: AI Transforming - business model evolves via AI, AI manages most operations
//           REQUIRES: Real-time business model adaptation, AI manages operations autonomously
// Level 10: AI Transcending - fully autonomous, self-evolving organization
//           REQUIRES: Organization operates as living system

type AISkillLevel = -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

const SKILL_LEVEL_LABELS: { [key: number]: string } = {
  [-2]: 'Resistant',
  [-1]: 'Skeptical',
  [0]: 'AI Unaware',
  [1]: 'AI Curious',
  [2]: 'AI Experimenting',
  [3]: 'AI Connecting',
  [4]: 'AI Collaborating',
  [5]: 'AI Integrating',
  [6]: 'AI Orchestrating',
  [7]: 'AI Leading',
  [8]: 'AI Innovating',
  [9]: 'AI Transforming',
  [10]: 'AI Transcending'
}

// REALISTIC skill assessment - be brutally honest
// Key insight: mentioning a tool != understanding it; talking about AI != being capable

function extractToolsFromOwnWords(content: string, speakerName: string): string[] {
  // Only count tools the person says THEY use, not just mention
  const tools: string[] = []
  const iUsePatterns = [
    /i use (\w+)/gi,
    /i'm using (\w+)/gi,
    /been using (\w+)/gi,
    /i've been using (\w+)/gi,
    /tools? (?:that )?i use[^.]*?(\w+)/gi
  ]

  for (const pattern of iUsePatterns) {
    const matches = content.matchAll(pattern)
    for (const match of matches) {
      const toolMention = match[1]
      // Check if it's a known AI tool
      const knownTool = TOOL_PATTERNS.find(t =>
        t.toLowerCase() === toolMention.toLowerCase() ||
        toolMention.toLowerCase().includes(t.toLowerCase())
      )
      if (knownTool && !tools.includes(knownTool)) {
        tools.push(knownTool)
      }
    }
  }

  // Also check for explicit tool mentions with context
  for (const tool of TOOL_PATTERNS) {
    const regex = new RegExp(`(?:i |we |my )(?:use|using|tried|playing with|experimenting).*?${tool}`, 'gi')
    if (content.match(regex) && !tools.includes(tool)) {
      tools.push(tool)
    }
  }

  return tools
}

function assessRealSkillLevel(transcript: TranscriptData): AISkillLevel {
  const content = transcript.rawContent.toLowerCase()

  // ============================================================================
  // LVNG.AI ALIGNED ASSESSMENT - VERY STRICT PROGRESSION
  // ============================================================================
  // Key insight: Using ChatGPT every day does NOT equal Level 2+
  // Level 2+ requires WORKFLOW INTEGRATION or AUTOMATION, not just usage
  // Level 3+ requires AGENTS and MEASURABLE ROI - virtually impossible for GlueIQ
  // ============================================================================

  // NEGATIVE indicators (puts you in negative territory)
  const resistanceIndicators = [
    'don\'t trust ai', 'won\'t use ai', 'refuse to use', 'ai is a threat',
    'replace us', 'take our jobs', 'ai is not for me', 'ai is dangerous'
  ]
  const skepticismIndicators = [
    'skeptical about ai', 'not convinced about ai', 'hesitant about ai',
    'worried about ai', 'not sure about ai', 'ai concerns me', 'afraid of'
  ]

  // CAPPING INDICATORS - these phrases LIMIT how high you can score
  // "Standard stuff", "basics", "just use it" = caps at Level 0
  const level0Cappers = [
    'standard stuff', 'like the basics', 'just the basics', 'basic stuff',
    'pretty basic', 'just use', 'just ask it', 'simple questions',
    'copy paste', 'copy and paste'
  ]
  // "Playing with", "experimenting", "trying out" = caps at Level 1
  const level1Cappers = [
    'playing with', 'just playing', 'messing around', 'experimenting',
    'trying out', 'testing', 'not sure how', 'still learning',
    'trying to figure', 'figure it out'
  ]

  // ============================================================================
  // LEVEL INDICATORS - Each level requires SPECIFIC evidence
  // ============================================================================

  // Level 0: AI Unaware/Basic - uses ChatGPT for simple Q&A
  // THIS IS WHERE MOST GLUEIQ PEOPLE SHOULD BE
  const level0Indicators = [
    'chatgpt', 'chat gpt', 'use chat', 'ask it questions', 'type in',
    'use it for', 'i use', 'beautiful ai', 'gamma'
  ]

  // Level 1: AI Curious - exploring possibilities, trying different tools daily
  // REQUIRES: Multiple tools AND regular/daily usage AND some intentionality
  const level1Indicators = [
    'every day', 'daily', 'multiple times a day', 'use it constantly',
    'all the time', 'regularly', 'pretty often'
  ]
  const level1ToolAwareness = [
    'claude', 'perplexity', 'different tools', 'tried different',
    'switched to', 'comparing tools', 'each tool'
  ]

  // Level 2: AI Experimenting - REQUIRES workflow integration or automation attempts
  // NOT just using tools, but integrating into actual work processes
  const level2Indicators = [
    'integrated into', 'workflow', 'automate', 'automation',
    'process', 'zapier', 'power automate', 'make.com',
    'systematic', 'template', 'standard process'
  ]

  // Level 3: AI Connecting - REQUIRES agents or measurable ROI
  // Virtually impossible for GlueIQ based on interviews
  const level3Indicators = [
    'agent', 'bot', 'custom gpt', 'built a gpt', 'my own gpt',
    'measurable roi', 'roi from ai', 'saved hours', 'productivity gain'
  ]

  // Level 4+: Multi-agent systems - impossible for GlueIQ
  const level4Indicators = [
    'multi-agent', 'orchestration', 'multiple agents', 'agent team',
    'ai platform', 'enterprise ai'
  ]

  // Level 5+: Department-wide AI - impossible for GlueIQ
  const level5Indicators = [
    'department-wide', 'team-wide', 'company-wide ai',
    'ai-first', 'ai native'
  ]

  // ============================================================================
  // COUNT EVIDENCE
  // ============================================================================

  const resistanceCount = resistanceIndicators.filter(i => content.includes(i)).length
  const skepticismCount = skepticismIndicators.filter(i => content.includes(i)).length
  const level0CapCount = level0Cappers.filter(i => content.includes(i)).length
  const level1CapCount = level1Cappers.filter(i => content.includes(i)).length

  const level0Count = level0Indicators.filter(i => content.includes(i)).length
  const level1Count = level1Indicators.filter(i => content.includes(i)).length
  const level1ToolCount = level1ToolAwareness.filter(i => content.includes(i)).length
  const level2Count = level2Indicators.filter(i => content.includes(i)).length
  const level3Count = level3Indicators.filter(i => content.includes(i)).length
  const level4Count = level4Indicators.filter(i => content.includes(i)).length
  const level5Count = level5Indicators.filter(i => content.includes(i)).length

  const toolsUsed = extractToolsFromOwnWords(transcript.rawContent, transcript.interviewee.name)
  const toolCount = toolsUsed.length

  // ============================================================================
  // SCORING: Start at -1 (skeptical/unaware) and work UP SLOWLY
  // ============================================================================

  // NEGATIVE TERRITORY: Active resistance
  if (resistanceCount >= 2) return -2
  if (resistanceCount >= 1 || skepticismCount >= 2) return -1

  // Default: If no AI mentioned at all = Level -1 (AI Unaware/Skeptical)
  let score: number = -1

  // Level 0: Uses ChatGPT or any AI tool at all
  // "Standard stuff", "just the basics" = Level 0 (capped here)
  if (level0Count >= 1 || toolCount >= 1) {
    score = 0  // AI Unaware/Basic user
  }

  // HARD CAP: "Standard stuff" / "basics" language caps at Level 0
  if (level0CapCount >= 1) {
    return Math.min(score, 0) as AISkillLevel
  }

  // Level 1: AI Curious - REQUIRES daily usage AND tool awareness
  // Must have: regular usage + exploration of multiple tools
  if (score >= 0 && level1Count >= 1 && (level1ToolCount >= 1 || toolCount >= 3)) {
    score = 1  // AI Curious - exploring but still basic
  }

  // HARD CAP: "Playing with" / "experimenting" language caps at Level 1
  if (level1CapCount >= 1) {
    return Math.min(score, 1) as AISkillLevel
  }

  // Level 2: AI Experimenting - REQUIRES workflow integration or automation
  // NOT just usage, but actual process integration
  if (score >= 1 && level2Count >= 2) {
    score = 2  // AI Experimenting - integrating into workflows
  }

  // Level 3: AI Connecting - REQUIRES agents or measurable ROI
  if (score >= 2 && level3Count >= 2) {
    score = 3  // AI Connecting - agents/ROI
  }

  // Level 4+: Multi-agent - virtually impossible
  if (score >= 3 && level4Count >= 2) {
    score = 4
  }

  // Level 5+: Department-wide - impossible
  if (score >= 4 && level5Count >= 2) {
    score = 5
  }

  // Skepticism limits score to Level 0 max
  if (skepticismCount >= 1) {
    score = Math.min(score, 0)
  }

  return score as AISkillLevel
}

function extractSkillProfiles(transcripts: TranscriptData[]): PersonSkillProfile[] {
  const profiles: PersonSkillProfile[] = []

  // First, analyze each interviewee based on THEIR OWN interview
  for (const transcript of transcripts) {
    const skillLevel = assessRealSkillLevel(transcript)
    const toolsUsed = extractToolsFromOwnWords(transcript.rawContent, transcript.interviewee.name)

    // Extract evidence of what they actually said about their own AI usage
    const selfEvidence: string[] = []
    const iUseRegex = /[^.!?]*\bi (?:use|using|tried|playing)[^.!?]*[.!?]/gi
    const matches = transcript.rawContent.match(iUseRegex) || []
    selfEvidence.push(...matches.slice(0, 3).map(m => m.trim().slice(0, 200)))

    // Determine frequency based on numeric level (LVNG aligned)
    // Level 0-1 = occasional/weekly, Level 2+ = daily (but that requires workflow integration)
    let frequency: 'daily' | 'weekly' | 'occasionally' | 'rarely' | 'never' = 'occasionally'
    if (skillLevel >= 2) frequency = 'daily'  // Level 2+ = integrated into workflows
    else if (skillLevel === 1) frequency = 'weekly'  // Level 1 = curious, exploring
    else if (skillLevel === 0) frequency = 'occasionally'  // Level 0 = basic, occasional
    else if (skillLevel <= -1) frequency = 'rarely'  // Negative = skeptical/resistant

    // Growth potential: Level 0-1 have highest potential (most room to grow)
    // Level 2+ have lower potential (already showing capability)
    let growthPotential: 'high' | 'medium' | 'low' = 'medium'
    if (skillLevel <= 0) growthPotential = 'high'  // Most room to grow
    else if (skillLevel === 1) growthPotential = 'medium'  // Some room
    else if (skillLevel >= 2) growthPotential = 'low'  // Already advanced

    profiles.push({
      name: transcript.interviewee.name,
      title: transcript.interviewee.title,
      aiSkillLevel: SKILL_LEVEL_LABELS[skillLevel] || 'Unknown',
      aiSkillScore: skillLevel, // NEW: numeric score
      toolsUsed: toolsUsed.length > 0 ? toolsUsed : ['ChatGPT (basic)'],
      frequency,
      mentionedBy: ['self'],
      evidence: selfEvidence.length > 0 ? selfEvidence : ['Limited AI usage evidence in interview'],
      isChampion: false, // Default false - we'll identify champions separately
      growthPotential
    })
  }

  // Now look for people mentioned BY OTHERS as being good at AI
  const championCandidates: { [name: string]: { mentions: number, positiveContext: string[] } } = {}

  for (const transcript of transcripts) {
    // Look for positive mentions of other people + AI
    const positivePatterns = [
      /(\w+(?:\s+\w+)?)\s+(?:is|are)\s+(?:really|very|pretty)\s+(?:good|fluent|capable|ahead)/gi,
      /(\w+(?:\s+\w+)?)\s+(?:knows?|understands?)\s+(?:ai|this stuff|these tools)/gi,
      /(?:like|such as)\s+(\w+(?:\s+\w+)?)\s+(?:who|that)\s+(?:is|are)\s+(?:really|pretty)/gi
    ]

    for (const pattern of positivePatterns) {
      const matches = transcript.rawContent.matchAll(pattern)
      for (const match of matches) {
        const name = match[1]
        if (!championCandidates[name]) {
          championCandidates[name] = { mentions: 0, positiveContext: [] }
        }
        championCandidates[name].mentions++
        championCandidates[name].positiveContext.push(match[0].slice(0, 150))
      }
    }
  }

  // Mark champions - need at least 3 positive mentions from different people
  for (const profile of profiles) {
    const firstName = profile.name.split(' ')[0].toLowerCase()
    const lastName = profile.name.split(' ')[1]?.toLowerCase() || ''

    for (const [candidate, data] of Object.entries(championCandidates)) {
      if (candidate.toLowerCase().includes(firstName) ||
          (lastName && candidate.toLowerCase().includes(lastName))) {
        if (data.mentions >= 2) {
          profile.isChampion = true
          profile.evidence = [...profile.evidence, ...data.positiveContext.slice(0, 2)]
        }
      }
    }
  }

  // Sort by numeric skill score (highest first)
  return profiles.sort((a, b) => b.aiSkillScore - a.aiSkillScore)
}

// ============================================================================
// MAIN PIPELINE
// ============================================================================

async function loadTranscripts(): Promise<TranscriptData[]> {
  console.log('Loading transcripts from:', TRANSCRIPTS_DIR)
  const transcripts: TranscriptData[] = []

  for (const file of TRANSCRIPT_FILES) {
    const filePath = path.join(TRANSCRIPTS_DIR, file.filename)

    try {
      if (!fs.existsSync(filePath)) {
        console.warn(`  [SKIP] ${file.filename} - not found`)
        continue
      }

      const content = fs.readFileSync(filePath, 'utf-8')
      console.log(`  [OK] ${file.filename} (${(content.length / 1024).toFixed(1)} KB)`)

      transcripts.push({
        id: `glueiq-${file.interviewee.name.toLowerCase().replace(/\s+/g, '-')}`,
        interviewee: file.interviewee,
        organization: GLUEIQ_ORG.name,
        timestamp: new Date(file.date),
        duration: file.duration,
        rawContent: content,
        metadata: { interviewer: 'HumanGlue', platform: 'Zoom', topics: ['AI adoption'] }
      })
    } catch (error) {
      console.error(`  [ERROR] ${file.filename}:`, error)
    }
  }

  console.log(`\nLoaded ${transcripts.length} transcripts\n`)
  return transcripts
}

async function analyzeTranscripts(transcripts: TranscriptData[]) {
  console.log('=' .repeat(60))
  console.log('RUNNING ANALYSIS PIPELINE')
  console.log('='.repeat(60))

  // 1. Entity Extraction
  console.log('\n[1/5] Extracting entities...')
  const allEntities: ExtractedEntity[] = []
  for (const t of transcripts) {
    allEntities.push(...extractEntities(t))
  }
  const uniqueTools = [...new Set(allEntities.filter(e => e.type === 'tool').map(e => e.value))]
  console.log(`  Found ${uniqueTools.length} unique tools: ${uniqueTools.slice(0, 5).join(', ')}...`)

  // 2. Theme Mining
  console.log('\n[2/5] Mining themes...')
  const allThemes: ThemeCluster[] = []
  for (const t of transcripts) {
    allThemes.push(...mineThemes(t))
  }
  const themeFrequency = new Map<string, ThemeCluster>()
  for (const theme of allThemes) {
    const existing = themeFrequency.get(theme.id)
    if (existing) {
      existing.frequency += theme.frequency
      existing.sourceInterviews = [...new Set([...existing.sourceInterviews, ...theme.sourceInterviews])]
    } else {
      themeFrequency.set(theme.id, { ...theme })
    }
  }
  const consensusThemes = Array.from(themeFrequency.values())
    .filter(t => t.sourceInterviews.length >= Math.ceil(transcripts.length / 2))
    .sort((a, b) => b.frequency - a.frequency)
  console.log(`  Found ${consensusThemes.length} consensus themes`)

  // 3. Skills Mapping
  console.log('\n[3/5] Mapping skills...')
  const skillProfiles = extractSkillProfiles(transcripts)
  const champions = skillProfiles.filter(p => p.isChampion)
  console.log(`  Identified ${champions.length} AI champions: ${champions.map(c => c.name).join(', ')}`)

  // 4. Dimension Scoring - ALL 23 DIMENSIONS
  console.log('\n[4/5] Scoring all 23 dimensions...')

  // Get all dimension keys from metadata
  const allDimensions = Object.keys(DIMENSION_METADATA)
  const dimensionScores = new Map<string, DimensionScore>()

  // Group dimensions by category for organized output
  const categories = ['Strategy & Leadership', 'People & Culture', 'Technology & Data', 'Operations & Processes', 'Governance & Risk']

  for (const category of categories) {
    console.log(`\n  📊 ${category}`)
    const categoryDimensions = allDimensions.filter(d => DIMENSION_METADATA[d]?.category === category)

    for (const dim of categoryDimensions) {
      const score = scoreDimension(transcripts, dim)
      dimensionScores.set(dim, score)
      // Handle -2 to 10 scale visualization
      const normalizedScore = Math.max(0, Math.round(score.score + 2))
      const maxBar = 12
      const bar = '█'.repeat(normalizedScore) + '░'.repeat(maxBar - normalizedScore)
      const prefix = score.score < 0 ? '' : ' '
      const dimName = DIMENSION_METADATA[dim]?.name || dim
      console.log(`     ${dimName.padEnd(24)} [${bar}] ${prefix}${score.score.toFixed(1)}/10`)
    }
  }

  // 5. Calculate overall maturity
  console.log('\n[5/5] Calculating overall maturity...')
  const scores = Array.from(dimensionScores.values())
  const overallMaturity = scores.reduce((sum, s) => sum + s.score, 0) / scores.length
  const confidence = scores.reduce((sum, s) => sum + s.confidence, 0) / scores.length
  console.log(`  Overall Maturity: ${overallMaturity.toFixed(1)}/10`)
  console.log(`  Confidence: ${(confidence * 100).toFixed(0)}%`)

  return {
    transcriptCount: transcripts.length,
    analysisTimestamp: new Date(),
    entities: allEntities,
    themes: consensusThemes,
    skillProfiles,
    champions,
    dimensionScores: Object.fromEntries(dimensionScores),
    overallMaturity,
    confidence
  }
}

function generateExecutiveSummary(results: any): string {
  const { transcriptCount, overallMaturity, champions, themes, dimensionScores } = results

  const topThemes = themes.slice(0, 3).map((t: ThemeCluster) => t.name.toLowerCase()).join(', ')
  const weakestDimension = Object.entries(dimensionScores)
    .sort((a: any, b: any) => a[1].score - b[1].score)[0]
  const strongestDimension = Object.entries(dimensionScores)
    .sort((a: any, b: any) => b[1].score - a[1].score)[0]

  return `Based on analysis of ${transcriptCount} C-suite interviews, GlueIQ demonstrates emerging AI adoption with significant gaps between leadership aspiration and operational reality. Overall AI maturity score: ${overallMaturity.toFixed(1)}/10. Key themes include: ${topThemes}. Strongest dimension: ${(strongestDimension[0] as string).replace(/_/g, ' ')} (${(strongestDimension[1] as any).score}/10). Weakest dimension: ${(weakestDimension[0] as string).replace(/_/g, ' ')} (${(weakestDimension[1] as any).score}/10). Identified AI champions (${champions.slice(0, 3).map((c: PersonSkillProfile) => c.name).join(', ')}) can serve as change agents. Immediate priorities: formalize AI strategy, establish governance, and targeted upskilling.`
}

function saveResults(results: any) {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  // Save full results
  const fullResults = {
    ...results,
    executiveSummary: generateExecutiveSummary(results)
  }
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'analysis-results.json'),
    JSON.stringify(fullResults, null, 2)
  )
  console.log(`Saved: ${OUTPUT_DIR}/analysis-results.json`)

  // Update maturity scores
  const maturityData = {
    organizationId: GLUEIQ_ORG.id,
    organizationName: GLUEIQ_ORG.name,
    overallMaturity: results.overallMaturity,
    confidenceLevel: results.confidence,
    dimensionScores: results.dimensionScores,
    timestamp: new Date().toISOString()
  }
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'maturity-scores-live.json'),
    JSON.stringify(maturityData, null, 2)
  )
  console.log(`Saved: ${OUTPUT_DIR}/maturity-scores-live.json`)

  // Update skills mapping
  const skillsData = {
    organizationId: GLUEIQ_ORG.id,
    profiles: results.skillProfiles,
    champions: results.champions,
    timestamp: new Date().toISOString()
  }
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'skills-mapping-live.json'),
    JSON.stringify(skillsData, null, 2)
  )
  console.log(`Saved: ${OUTPUT_DIR}/skills-mapping-live.json`)
}

async function main() {
  console.log('\n' + '='.repeat(60))
  console.log('GLUEIQ TRANSCRIPT ANALYSIS PIPELINE')
  console.log('='.repeat(60))
  console.log(`Organization: ${GLUEIQ_ORG.name}`)
  console.log(`Industry: ${GLUEIQ_ORG.industry}`)
  console.log(`Started: ${new Date().toISOString()}`)
  console.log('='.repeat(60) + '\n')

  try {
    // Load transcripts
    const transcripts = await loadTranscripts()
    if (transcripts.length === 0) {
      console.error('No transcripts found!')
      process.exit(1)
    }

    // Run analysis
    const results = await analyzeTranscripts(transcripts)

    // Print executive summary
    console.log('\n' + '='.repeat(60))
    console.log('EXECUTIVE SUMMARY')
    console.log('='.repeat(60))
    console.log(generateExecutiveSummary(results))

    // Save results
    console.log('\n' + '='.repeat(60))
    console.log('SAVING RESULTS')
    console.log('='.repeat(60))
    saveResults(results)

    console.log('\n' + '='.repeat(60))
    console.log('PIPELINE COMPLETE')
    console.log('='.repeat(60))
    console.log(`\nResults saved to: ${OUTPUT_DIR}`)
    console.log(`Completed: ${new Date().toISOString()}`)

  } catch (error) {
    console.error('Pipeline failed:', error)
    process.exit(1)
  }
}

main()
