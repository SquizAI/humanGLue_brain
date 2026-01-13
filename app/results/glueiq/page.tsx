'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  BarChart3,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Building2,
  AlertCircle,
  Award,
  Lightbulb,
  Zap,
  Brain,
  Shield,
  Cog,
  BookOpen,
  Database,
  ChevronDown,
  ChevronUp,
  Quote,
  Info,
  Clock,
  User,
  Briefcase,
  MessageSquare,
  Eye,
  EyeOff,
  ExternalLink,
  Share2,
  FileText
} from 'lucide-react'
import { ResponsiveLayout } from '@/components/templates/ResponsiveLayout'

// Complete GlueIQ Assessment Data with detailed evidence
const glueiqData = {
  organizationName: 'GlueIQ',
  assessmentDate: 'December 29, 2025',
  overallScore: 0.65,
  maturityLevel: 0,
  maturityName: 'AI Unaware',
  interviewCount: 9,
  totalInterviewMinutes: 627,
  championsIdentified: 0,
  confidenceLevel: 100,

  maturityLevels: [
    { level: -2, name: 'Resistant', description: 'Active opposition to AI adoption' },
    { level: -1, name: 'Skeptical', description: 'Doubtful, hesitant about AI' },
    { level: 0, name: 'AI Unaware', description: 'No structured AI usage', current: true },
    { level: 1, name: 'AI Curious', description: 'Beginning to explore AI' },
    { level: 2, name: 'AI Experimenting', description: '~25% adoption, simple automations' },
    { level: 3, name: 'AI Connecting', description: 'Building AI into workflows' },
    { level: 4, name: 'AI Collaborating', description: 'Teams working with AI daily' },
    { level: 5, name: 'AI Integrating', description: 'AI embedded in core processes' },
    { level: 6, name: 'AI Orchestrating', description: 'Multiple AI systems working together' },
    { level: 7, name: 'AI Leading', description: 'Industry-leading AI practices' },
    { level: 8, name: 'AI Innovating', description: 'Creating new AI applications' },
    { level: 9, name: 'AI Transforming', description: 'AI reshaping business model' },
    { level: 10, name: 'AI Transcending', description: 'AI-native organization' },
  ],

  categories: [
    {
      id: 'strategy',
      name: 'Strategy & Leadership',
      icon: Target,
      color: 'cyan',
      average: 0.9,
      description: 'Executive commitment, vision clarity, and strategic alignment with AI initiatives',
      dimensions: [
        {
          id: 'leadership_vision',
          name: 'Leadership Vision',
          score: 2.0,
          description: 'C-suite commitment and AI vision clarity',
          reasoning: 'Leadership shows genuine interest in AI but lacks a formal, documented vision. CEO Gaston uses 9+ AI tools personally (ChatGPT, Claude, Perplexity, Motion, Copilot, MidJourney, Beautiful AI, Gamma, Fixer AI) but explicitly admits "we have no AI plan." Partners are exploring individually without coordination. The phrase "playing with" appears repeatedly, indicating experimental rather than strategic usage.',
          evidence: [
            { quote: "We have no AI plan, no investment from a structured standpoint.", speaker: "Gaston Legorburu, CEO", sentiment: "negative" },
            { quote: "AI tools that I use, you know, I use obviously ChatGPT, Perplexity, CoPilot, I use Motion, I use, well, I'm playing with Claude, I use Beautiful AI, Gamma, Midjourney.", speaker: "Gaston Legorburu, CEO", sentiment: "neutral" },
            { quote: "You'll have maybe 25% of the people that are maybe a little skeptical, but are starting to come around and are starting to actively use it.", speaker: "Gaston Legorburu, CEO", sentiment: "neutral" },
            { quote: "Sometimes your reputation exceeds your capability.", speaker: "Gaston Legorburu, CEO", sentiment: "negative" },
            { quote: "We're trying to build a legacy and a franchise.", speaker: "Gaston Legorburu, CEO", sentiment: "positive" },
            { quote: "This is about strategic vision and thought leadership.", speaker: "Gaston Legorburu, CEO", sentiment: "positive" }
          ],
          gaps: ['No documented AI vision statement', 'Leadership using AI individually, not strategically', 'No investment framework for AI initiatives', 'Vision exists conceptually but not operationalized'],
          nextSteps: ['Create executive AI vision document', 'Align leadership on AI priorities', 'Establish AI investment criteria', 'Move from "playing with" to "implementing" mindset']
        },
        {
          id: 'strategy_alignment',
          name: 'Strategy Alignment',
          score: 1.0,
          description: 'AI strategy alignment with business goals',
          reasoning: 'AI activities are entirely ad-hoc with no connection to business strategy. Matt Kujawa explicitly describes work as "ad hoc." No formal AI roadmap exists. Tool adoption happens opportunistically - when asked about Productive being launched, Maggy responded "what the f*** is Productive?" indicating siloed decisions without organizational alignment.',
          evidence: [
            { quote: "I think much like I'm thinking about the design to dev to production, that's great, except it's something we do ad hoc.", speaker: "Matt Kujawa, Partner", sentiment: "negative" },
            { quote: "I was like on some partner meeting and someone's like, yeah, we're in the second phase of productive. I'm like, what the f*** is productive?", speaker: "Maggy Conde, Partner", sentiment: "negative" },
            { quote: "We're good with like, oh my God, we have this tool, let's say productive, or let's say whatever. But there's no structured process.", speaker: "Maggy Conde, Partner", sentiment: "negative" },
            { quote: "We have some tool sets, you know, we use Motion and we use things like that, but there's no structured process.", speaker: "Gaston Legorburu, CEO", sentiment: "negative" },
            { quote: "Client wants a weekly optimization plan... I want five or six things we do repetitively in strategy.", speaker: "Joey Wilson, Partner", sentiment: "neutral" }
          ],
          gaps: ['No AI strategy document', 'Ad-hoc approach to AI projects', 'Missing connection to business objectives', 'Tool adoption decisions made in silos', 'No strategic prioritization framework'],
          nextSteps: ['Develop AI strategy aligned to business goals', 'Create quarterly AI roadmap', 'Establish AI steering committee', 'Create communication protocol for new tool adoption']
        },
        {
          id: 'change_management',
          name: 'Change Management',
          score: 0.5,
          description: 'Organizational change readiness and execution',
          reasoning: 'No formal change management process for AI initiatives. Tool rollouts happen without proper training or communication. Productive launch described as "getting lucky" - success was accidental, not planned. Junior staff face learning gaps without support structure.',
          evidence: [
            { quote: "Recently, like we put in productive and I would say that's a successful launch because for all the opposite reasons... I think we got lucky with this one.", speaker: "Matt Kujawa, Partner", sentiment: "negative" },
            { quote: "Any tool that we've used, it's just like, okay, go, there's a tool go.", speaker: "Maggy Conde, Partner", sentiment: "negative" },
            { quote: "All of the long-tail stuff are the things that are getting automated and commoditized.", speaker: "Gaston Legorburu, CEO", sentiment: "neutral" },
            { quote: "These kids coming right out of school have no AI ethics.", speaker: "Gaston Legorburu, CEO", sentiment: "negative" },
            { quote: "There's no onboarding, no structured introduction to tools.", speaker: "Multiple Interviews", sentiment: "negative" }
          ],
          gaps: ['No change management framework', 'Luck-based not process-based rollouts', 'No change champions identified', 'Junior staff unsupported', 'No AI ethics training'],
          nextSteps: ['Implement change management process', 'Create AI communication plan', 'Train change champions', 'Develop onboarding curriculum', 'Establish AI ethics guidelines']
        },
        {
          id: 'competitive_positioning',
          name: 'Competitive Positioning',
          score: 0.5,
          description: 'AI-driven market differentiation',
          reasoning: 'No clear AI differentiation strategy. Competitors are not being monitored for AI capabilities. Risk of falling behind industry peers.',
          evidence: [
            { quote: "And sometimes your reputation exceeds your capability.", speaker: "Leadership Team", sentiment: "negative" }
          ],
          gaps: ['No competitive AI analysis', 'Unclear differentiation strategy', 'Risk of market disruption'],
          nextSteps: ['Conduct competitive AI audit', 'Define AI value proposition', 'Identify quick-win differentiators']
        },
        {
          id: 'innovation_capacity',
          name: 'Innovation Capacity',
          score: 0.5,
          description: 'Ability to innovate with AI',
          reasoning: 'Innovation is individual rather than organizational. No structured innovation process or time allocated for experimentation.',
          evidence: [
            { quote: "Whether they're approved or not, it's good because we want them experimenting.", speaker: "Leadership Team", sentiment: "positive" }
          ],
          gaps: ['No innovation framework', 'Individual experimentation only', 'No dedicated innovation time'],
          nextSteps: ['Create innovation time policy', 'Establish experimentation framework', 'Launch innovation challenges']
        }
      ]
    },
    {
      id: 'people',
      name: 'People & Culture',
      icon: Users,
      color: 'red',
      average: 0.1,
      critical: true,
      description: 'Workforce AI capabilities, cultural readiness, and psychological safety for experimentation',
      dimensions: [
        {
          id: 'skills_talent',
          name: 'Skills & Talent',
          score: -1.0,
          description: 'Workforce AI capabilities',
          reasoning: 'CRITICAL: Active resistance observed across workforce. All 9 interviewees score at Level 0 (AI Unaware) or Level 1 (AI Curious) maximum. Matt Kujawa is most advanced at Level 1. Usage language is consistently "standard stuff" and "basic" - not strategic. No formal training program exists. Creative team slightly ahead in visual AI tools but still lacks structured competency.',
          evidence: [
            { quote: "So people are resistant.", speaker: "Gaston Legorburu, CEO", sentiment: "negative" },
            { quote: "These kids coming right out of school have no AI ethics.", speaker: "Gaston Legorburu, CEO", sentiment: "negative" },
            { quote: "I mean, I use like the ChatGPT and the Beautiful AI, like just like to me, like the standard, I guess, you know, like the standard stuff.", speaker: "Maggy Conde, Partner", sentiment: "neutral" },
            { quote: "My guess would be, you know, predominantly is, like, chat and, like, MidJourney or, like, some of the other, like, image gen stuff.", speaker: "Boris Stojanovic, Partner", sentiment: "neutral" },
            { quote: "I mean, I understand why, but I'm also not afraid of [AI].", speaker: "Joey Wilson, Partner", sentiment: "neutral" },
            { quote: "We don't track or trace how much people actually produce and the quality of what they produce.", speaker: "Gaston Legorburu, CEO", sentiment: "negative" },
            { quote: "As you know, I've tried to do sort of Claude code, but that's not going very well.", speaker: "Matt Kujawa, Partner", sentiment: "negative" }
          ],
          gaps: ['Active resistance in workforce', 'No AI training program', 'All staff at Level 0-1', 'No competency framework', 'No skill tracking system', 'Creative team ahead but unstructured'],
          nextSteps: ['Launch mandatory AI basics training', 'Create AI competency framework', 'Address resistance through education', 'Implement skills tracking', 'Start with creative team as early adopters'],
          critical: true
        },
        {
          id: 'cultural_readiness',
          name: 'Cultural Readiness',
          score: 0.5,
          description: 'Organizational openness to AI',
          reasoning: 'Mixed signals on cultural readiness. Some openness exists but is tempered by skepticism and fear of job displacement.',
          evidence: [
            { quote: "Whether they're approved or not, it's good because we want them experimenting.", speaker: "Leadership Team", sentiment: "positive" }
          ],
          gaps: ['Mixed cultural signals', 'Fear of job displacement', 'Unclear AI messaging'],
          nextSteps: ['Develop AI culture narrative', 'Address job security concerns', 'Celebrate AI wins publicly']
        },
        {
          id: 'learning_development',
          name: 'Learning & Development',
          score: 1.5,
          description: 'AI training and upskilling',
          reasoning: 'Some interest in learning exists, but no formal program. Self-directed learning happening sporadically. Need for structured curriculum.',
          evidence: [
            { quote: "And I'm particularly interested in your candid responses on what's working, what's not, and where you see the gaps.", speaker: "Interviewer", sentiment: "neutral" }
          ],
          gaps: ['No formal AI training', 'Self-directed only', 'No learning paths defined'],
          nextSteps: ['Create AI learning curriculum', 'Define role-based training paths', 'Implement learning tracking']
        },
        {
          id: 'psychological_safety',
          name: 'Psychological Safety',
          score: -1.0,
          description: 'Safe experimentation environment',
          reasoning: 'CRITICAL: Clear signs of fear and resistance indicate low psychological safety. While leadership says "there\'s no judgment," actual behavior shows people are resistant to AI adoption. "AI work slop" fatigue mentioned - people overwhelmed by AI outputs. Fear of job displacement underlies resistance. The gap between stated policy ("no judgment") and observed behavior (resistance) is telling.',
          evidence: [
            { quote: "And there's no judgment.", speaker: "Gaston Legorburu, CEO", sentiment: "positive" },
            { quote: "So people are resistant.", speaker: "Gaston Legorburu, CEO", sentiment: "negative" },
            { quote: "We're seeing all this stuff with AI work slop, where you're just getting these people are getting so fatigued because they're getting 20 page responses from Claude or GPT.", speaker: "Alex Schwartz, Interviewer", sentiment: "negative" },
            { quote: "Whether they're approved or not, it's good because we want them experimenting.", speaker: "Gaston Legorburu, CEO", sentiment: "positive" },
            { quote: "I'm also not afraid of [AI]... I understand why [others are].", speaker: "Joey Wilson, Partner", sentiment: "neutral" },
            { quote: "The fear is real - people worry about being replaced.", speaker: "Multiple Interviews", sentiment: "negative" }
          ],
          gaps: ['Fear of failure persists', 'Resistance to change despite "no judgment" policy', 'AI fatigue affecting adoption', 'Fear of job displacement', 'Gap between stated values and actual behavior'],
          nextSteps: ['Formalize "no judgment" policy in writing', 'Create experimentation sandbox', 'Celebrate learning from failures publicly', 'Address job security concerns directly', 'Implement AI output quality guidelines'],
          critical: true
        },
        {
          id: 'champion_network',
          name: 'Champion Network',
          score: 0.5,
          description: 'Internal AI advocates',
          reasoning: 'No formal AI champions identified. Matt Kujawa shows potential as first champion at Level 1. Need to build a network of advocates.',
          evidence: [
            { quote: "Limited AI usage evidence in interview", speaker: "Various", sentiment: "neutral" }
          ],
          gaps: ['No champions identified', 'No advocate program', 'Isolated experimentation'],
          nextSteps: ['Identify 2-3 potential champions', 'Create AI Champion program', 'Connect champions across teams']
        }
      ]
    },
    {
      id: 'technology',
      name: 'Technology & Data',
      icon: Database,
      color: 'purple',
      average: 0.5,
      description: 'Technical infrastructure, data quality, and integration capabilities for AI',
      dimensions: [
        {
          id: 'data_infrastructure',
          name: 'Data Infrastructure',
          score: 0.5,
          description: 'Data quality and accessibility',
          reasoning: 'Basic data exists but no AI-ready data strategy. Data is siloed and not prepared for AI applications.',
          evidence: [],
          gaps: ['No data strategy', 'Siloed data', 'Not AI-ready'],
          nextSteps: ['Audit current data landscape', 'Define data strategy', 'Identify AI data needs']
        },
        {
          id: 'technology_stack',
          name: 'Technology Stack',
          score: 0.5,
          description: 'AI-ready technology foundation',
          reasoning: 'Multiple point solutions exist (15+ tools mentioned) but no cohesive stack. Enterprise ChatGPT and Copilot licenses underutilized.',
          evidence: [
            { quote: "We have some tool sets, you know, we use Motion and we use things like that, but there's no structured process.", speaker: "Leadership Team", sentiment: "negative" },
            { quote: "But we're also trying to build a legacy and a franchise.", speaker: "Leadership Team", sentiment: "neutral" }
          ],
          gaps: ['Tool sprawl (15+ tools)', 'No cohesive stack', 'Underutilized licenses'],
          nextSteps: ['Conduct tool audit', 'Consolidate to core stack', 'Maximize license utilization']
        },
        {
          id: 'integration_capability',
          name: 'Integration Capability',
          score: 0.5,
          description: 'Systems integration maturity',
          reasoning: 'Limited integration between tools. Mostly manual handoffs. No automation connecting systems.',
          evidence: [],
          gaps: ['No integrations', 'Manual handoffs', 'Disconnected tools'],
          nextSteps: ['Map integration needs', 'Identify quick-win integrations', 'Plan automation roadmap']
        },
        {
          id: 'security_compliance',
          name: 'Security & Compliance',
          score: 0.5,
          description: 'AI security posture',
          reasoning: 'Basic security exists but no AI-specific policies. Concerns raised about ethics and data handling.',
          evidence: [
            { quote: "These kids coming right out of school have no AI ethics.", speaker: "Leadership Team", sentiment: "negative" }
          ],
          gaps: ['No AI security policy', 'Ethics concerns raised', 'Missing compliance framework'],
          nextSteps: ['Create AI usage policy', 'Define data handling rules', 'Establish ethics guidelines']
        },
        {
          id: 'vendor_ecosystem',
          name: 'Vendor Ecosystem',
          score: 0.5,
          description: 'AI vendor relationships',
          reasoning: 'Multiple vendors used but no strategic partnerships. Ad-hoc tool selection without evaluation criteria.',
          evidence: [],
          gaps: ['No vendor strategy', 'Ad-hoc selection', 'No partnerships'],
          nextSteps: ['Define vendor criteria', 'Evaluate current vendors', 'Identify strategic partners']
        }
      ]
    },
    {
      id: 'operations',
      name: 'Operations & Processes',
      icon: Cog,
      color: 'green',
      average: 1.0,
      description: 'Process automation, AI use cases, and operational excellence with AI',
      dimensions: [
        {
          id: 'ai_use_cases',
          name: 'AI Use Cases',
          score: 1.5,
          description: 'Identified AI applications',
          reasoning: 'Some use cases identified organically. Staff experimenting individually. Need to formalize and prioritize use cases.',
          evidence: [
            { quote: "Whether they're approved or not, it's good because we want them experimenting.", speaker: "Leadership Team", sentiment: "positive" }
          ],
          gaps: ['No use case inventory', 'Individual experimentation', 'Missing prioritization'],
          nextSteps: ['Create use case inventory', 'Prioritize by impact/effort', 'Launch pilot programs']
        },
        {
          id: 'process_automation',
          name: 'Process Automation',
          score: 1.5,
          description: 'Automation maturity',
          reasoning: 'Clear opportunities identified for automation. Staff recognize repetitive tasks. Need structured approach to implementation.',
          evidence: [
            { quote: "And client wants, you know, a weekly optimization plan, you know, client wants, so I want five or six, the five or six things we do repetitively in strategy.", speaker: "Leadership Team", sentiment: "positive" },
            { quote: "I pretty much use it probably every day, and I use it for everything from articulating feedback to transcribing meetings.", speaker: "Dave Serrano", sentiment: "positive" }
          ],
          gaps: ['Opportunities identified but not actioned', 'No automation framework', 'Manual processes persist'],
          nextSteps: ['Map repetitive processes', 'Select automation candidates', 'Launch automation pilots']
        },
        {
          id: 'operational_excellence',
          name: 'Operational Excellence',
          score: 0.5,
          description: 'AI in operations',
          reasoning: 'Operations largely manual. AI not yet integrated into core operational processes.',
          evidence: [],
          gaps: ['Manual operations', 'No AI in core processes', 'Missing metrics'],
          nextSteps: ['Identify operational AI opportunities', 'Define success metrics', 'Pilot operational AI']
        },
        {
          id: 'customer_experience',
          name: 'Customer Experience',
          score: 0.5,
          description: 'AI-enhanced CX',
          reasoning: 'Customer experience not yet AI-enhanced. Opportunity to differentiate through AI-powered services.',
          evidence: [],
          gaps: ['No AI in CX', 'Manual client services', 'Missing personalization'],
          nextSteps: ['Map customer journey', 'Identify AI touchpoints', 'Pilot AI-enhanced service']
        }
      ]
    },
    {
      id: 'governance',
      name: 'Governance & Risk',
      icon: Shield,
      color: 'orange',
      average: 0.875,
      description: 'AI policies, ethics, risk management, and ROI tracking',
      dimensions: [
        {
          id: 'ai_governance',
          name: 'AI Governance',
          score: 1.0,
          description: 'AI policies and oversight',
          reasoning: 'Governance being discussed but not formalized. Leadership aware of need but no framework in place.',
          evidence: [
            { quote: "Alex Schwartz asked what single thing, if not addressed in the next 90 days, could derail GlueIQ's AI transformation.", speaker: "Meeting Notes", sentiment: "neutral" }
          ],
          gaps: ['No governance framework', 'Policies not documented', 'Missing oversight structure'],
          nextSteps: ['Create AI governance framework', 'Document core policies', 'Establish oversight committee']
        },
        {
          id: 'ethics_responsibility',
          name: 'Ethics & Responsibility',
          score: 1.5,
          description: 'Responsible AI practices',
          reasoning: 'Ethics concerns raised by leadership, particularly around new hires. Awareness exists but no formal framework.',
          evidence: [
            { quote: "These kids coming right out of school have no AI ethics.", speaker: "Leadership Team", sentiment: "negative" },
            { quote: "So, I mean, I think that would be the thing to maybe be concerned about.", speaker: "Leadership Team", sentiment: "negative" }
          ],
          gaps: ['No ethics framework', 'Concerns about new hires', 'Missing guidelines'],
          nextSteps: ['Create AI ethics guidelines', 'Include in onboarding', 'Establish ethics review process']
        },
        {
          id: 'risk_management',
          name: 'Risk Management',
          score: 0.5,
          description: 'AI risk assessment',
          reasoning: 'Risks not formally assessed. No risk framework for AI initiatives. Potential blind spots.',
          evidence: [],
          gaps: ['No risk framework', 'Unassessed risks', 'Missing controls'],
          nextSteps: ['Conduct AI risk assessment', 'Create risk register', 'Implement controls']
        },
        {
          id: 'roi_measurement',
          name: 'ROI Measurement',
          score: 0.5,
          description: 'AI value tracking',
          reasoning: 'No tracking of AI productivity or ROI. Cannot demonstrate value of AI investments.',
          evidence: [
            { quote: "We don't track or trace how much people actually produce and the quality of what they produce.", speaker: "Leadership Team", sentiment: "negative" }
          ],
          gaps: ['No ROI tracking', 'Missing metrics', 'Cannot demonstrate value'],
          nextSteps: ['Define AI success metrics', 'Implement tracking system', 'Create ROI dashboard']
        }
      ]
    }
  ],

  skillProfiles: [
    { name: 'Gaston Legorburu', title: 'CEO & Founder', level: 0, levelName: 'AI Unaware', tools: ['ChatGPT', 'Claude', 'Perplexity', 'Motion', 'Copilot', 'MidJourney', 'Beautiful AI', 'Gamma', 'Fixer AI'], growth: 'high', department: 'Executive', interviewDuration: 122 },
    { name: 'Matt Kujawa', title: 'Partner', level: 1, levelName: 'AI Curious', tools: ['Perplexity', 'Claude Projects', 'Google LM'], growth: 'medium', department: 'Strategy', interviewDuration: 85, potential: true },
    { name: 'Joey Wilson', title: 'Partner', level: 0, levelName: 'AI Unaware', tools: ['Atlas', 'Motion', 'Productive'], growth: 'high', department: 'Strategy', interviewDuration: 69 },
    { name: 'Boris Stojanovic', title: 'Partner', level: 0, levelName: 'AI Unaware', tools: ['Claude', 'Perplexity', 'N8N'], growth: 'high', department: 'Technology', interviewDuration: 34 },
    { name: 'Maggy Conde', title: 'Partner', level: 0, levelName: 'AI Unaware', tools: ['Beautiful AI', 'Productive', 'ChatGPT'], growth: 'high', department: 'Client Services', interviewDuration: 65 },
    { name: 'Noel Artiles', title: 'CCO', level: 0, levelName: 'AI Unaware', tools: ['Gemini'], growth: 'high', department: 'Creative', interviewDuration: 64 },
    { name: 'Michele Conigliaro', title: 'Head of People', level: 0, levelName: 'AI Unaware', tools: ['Otter', 'ChatGPT'], growth: 'high', department: 'People', interviewDuration: 67 },
    { name: 'Chiny Chewing', title: 'Partner', level: 0, levelName: 'AI Unaware', tools: ['ChatGPT'], growth: 'high', department: 'Strategy', interviewDuration: 67 },
    { name: 'Dave Serrano', title: 'Partner', level: 0, levelName: 'AI Unaware', tools: ['Gamma', 'Beautiful AI', 'ChatGPT'], growth: 'high', department: 'Creative', interviewDuration: 54 },
  ],

  toolsInventory: [
    { name: 'ChatGPT', category: 'LLM', users: 5, enterprise: true },
    { name: 'Beautiful AI', category: 'Presentation', users: 6 },
    { name: 'Claude', category: 'LLM', users: 4 },
    { name: 'Perplexity', category: 'Research', users: 4 },
    { name: 'Motion', category: 'Scheduling', users: 3 },
    { name: 'Productive', category: 'PM', users: 4 },
    { name: 'Gemini', category: 'LLM', users: 3 },
    { name: 'Atlas', category: 'Research Agent', users: 2 },
    { name: 'MidJourney', category: 'Image Gen', users: 1 },
    { name: 'Copilot', category: 'LLM', users: 1, enterprise: true },
    { name: 'Gamma', category: 'Presentation', users: 2 },
    { name: 'N8N', category: 'Automation', users: 1 },
    { name: 'Otter', category: 'Transcription', users: 1 },
    { name: 'Fathom', category: 'Meeting Notes', users: 9 },
  ]
}

const getColorClasses = (color: string) => {
  const colors: Record<string, { gradient: string, bg: string, text: string, border: string, bgHover: string }> = {
    cyan: { gradient: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', bgHover: 'hover:bg-cyan-500/20' },
    blue: { gradient: 'from-blue-500 to-indigo-500', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', bgHover: 'hover:bg-blue-500/20' },
    purple: { gradient: 'from-purple-500 to-pink-500', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', bgHover: 'hover:bg-purple-500/20' },
    green: { gradient: 'from-green-500 to-emerald-500', bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', bgHover: 'hover:bg-green-500/20' },
    orange: { gradient: 'from-orange-500 to-amber-500', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', bgHover: 'hover:bg-orange-500/20' },
    red: { gradient: 'from-red-500 to-rose-500', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', bgHover: 'hover:bg-red-500/20' },
  }
  return colors[color] || colors.cyan
}

const getScoreColor = (score: number) => {
  if (score >= 5) return 'text-green-400'
  if (score >= 2) return 'text-cyan-400'
  if (score >= 0) return 'text-yellow-400'
  return 'text-red-400'
}

const getScoreBarWidth = (score: number) => {
  const normalized = ((score + 2) / 12) * 100
  return Math.max(0, Math.min(100, normalized))
}

const getScoreBarColor = (score: number) => {
  if (score >= 5) return 'from-green-500 to-emerald-500'
  if (score >= 2) return 'from-cyan-500 to-blue-500'
  if (score >= 0) return 'from-yellow-500 to-orange-500'
  return 'from-red-500 to-rose-500'
}

export default function GlueIQAssessmentPage() {
  const router = useRouter()
  const [expandedCategory, setExpandedCategory] = useState<string | null>('strategy')
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'dimensions' | 'people' | 'roadmap'>('overview')
  const [showEvidence, setShowEvidence] = useState(true)

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  const handleScheduleCall = () => {
    window.open('https://calendly.com/humanglue/strategy-session', '_blank')
  }

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-black">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-4 sm:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20"
                  >
                    <span className="text-xs text-cyan-300 font-diatype">C-Suite Assessment</span>
                  </motion.div>
                  <span className="text-xs text-gray-500 font-diatype">{glueiqData.assessmentDate}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white font-gendy">
                  {glueiqData.organizationName} AI Maturity Assessment
                </h1>
                <p className="text-gray-400 font-diatype text-sm mt-1">
                  Based on {glueiqData.interviewCount} interviews ({Math.round(glueiqData.totalInterviewMinutes / 60 * 10) / 10} hours) | LVNG.ai Framework
                </p>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleScheduleCall}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold inline-flex items-center gap-2 font-diatype text-sm"
                >
                  <Calendar className="w-4 h-4" />
                  Schedule Call
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl font-semibold inline-flex items-center gap-2 font-diatype text-sm hover:border-cyan-500/30"
                >
                  <Download className="w-4 h-4" />
                  Export
                </motion.button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-6 overflow-x-auto pb-2">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'dimensions', label: 'All 23 Dimensions', icon: Target },
                { id: 'people', label: 'Team Profiles', icon: Users },
                { id: 'roadmap', label: 'Roadmap', icon: ArrowRight },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-4 py-2 rounded-lg font-diatype text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-8 space-y-6 sm:space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Score Hero */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Score */}
                  <div className="lg:col-span-2 bg-gradient-to-br from-red-500/10 via-orange-500/5 to-transparent rounded-2xl p-6 sm:p-8 border border-red-500/20">
                    <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
                      <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex-shrink-0">
                        <svg className="transform -rotate-90 w-full h-full">
                          <circle
                            cx="50%"
                            cy="50%"
                            r="45%"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            className="text-white/10"
                          />
                          <circle
                            cx="50%"
                            cy="50%"
                            r="45%"
                            stroke="url(#scoreGradient)"
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={`${2 * Math.PI * 45}`}
                            strokeDashoffset={`${2 * Math.PI * 45 * (1 - (glueiqData.overallScore + 2) / 12)}`}
                            className="transition-all duration-1000"
                            strokeLinecap="round"
                          />
                          <defs>
                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#f97316" />
                              <stop offset="100%" stopColor="#ef4444" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl sm:text-5xl font-bold text-white font-gendy">{glueiqData.overallScore.toFixed(1)}</span>
                          <span className="text-gray-400 text-sm font-diatype">out of 10</span>
                        </div>
                      </div>

                      <div className="flex-1 text-center lg:text-left">
                        <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
                          <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400" />
                          <div>
                            <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider font-diatype">
                              Maturity Level {glueiqData.maturityLevel}
                            </p>
                            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent font-gendy">
                              {glueiqData.maturityName}
                            </h2>
                          </div>
                        </div>
                        <p className="text-gray-300 font-diatype text-sm mb-4">
                          Basic ChatGPT exploration without formal strategy, training, or structured adoption. Significant opportunity for transformation.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                          <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-full font-diatype">
                            No AI Strategy
                          </span>
                          <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs rounded-full font-diatype">
                            0 Champions
                          </span>
                          <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs rounded-full font-diatype">
                            Ad-hoc Usage
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-diatype">Target State (12 months)</p>
                      <p className="text-lg font-semibold text-cyan-400 font-gendy">Level 3: AI Connecting</p>
                      <p className="text-xs text-gray-500 font-diatype mt-1">Building AI into workflows</p>
                    </div>
                    <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
                      <p className="text-xs text-red-300 uppercase tracking-wider mb-2 font-diatype">Critical Gap</p>
                      <p className="text-lg font-semibold text-red-400 font-gendy">People & Culture</p>
                      <p className="text-xs text-gray-400 font-diatype mt-1">0.1/10 average - Needs immediate attention</p>
                    </div>
                    <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                      <p className="text-xs text-green-300 uppercase tracking-wider mb-2 font-diatype">Quick Win</p>
                      <p className="text-lg font-semibold text-green-400 font-gendy">Operations</p>
                      <p className="text-xs text-gray-400 font-diatype mt-1">1.0/10 - Highest potential category</p>
                    </div>
                  </div>
                </div>

                {/* Category Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {glueiqData.categories.map((category, index) => {
                    const colorClasses = getColorClasses(category.color)
                    const Icon = category.icon

                    return (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        onClick={() => {
                          setActiveTab('dimensions')
                          setExpandedCategory(category.id)
                        }}
                        className={`group cursor-pointer bg-white/5 backdrop-blur-xl rounded-xl border ${
                          category.critical ? 'border-red-500/30' : 'border-white/10'
                        } p-4 hover:border-cyan-500/30 transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses.gradient}`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-400 font-diatype">{category.name}</p>
                            <p className={`text-xl font-bold font-gendy ${category.critical ? 'text-red-400' : colorClasses.text}`}>
                              {category.average.toFixed(1)}/10
                            </p>
                          </div>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${getScoreBarWidth(category.average)}%` }}
                            transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                            className={`h-full bg-gradient-to-r ${getScoreBarColor(category.average)} rounded-full`}
                          />
                        </div>
                        {category.critical && (
                          <p className="text-[10px] text-red-400 mt-2 font-diatype">CRITICAL</p>
                        )}
                      </motion.div>
                    )
                  })}
                </div>

                {/* Maturity Level Scale */}
                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white font-gendy mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-cyan-400" />
                    LVNG.ai Maturity Framework
                  </h3>
                  <div className="overflow-x-auto">
                    <div className="flex gap-2 min-w-max pb-2">
                      {glueiqData.maturityLevels.map((level, index) => (
                        <div
                          key={level.level}
                          className={`flex-shrink-0 w-32 p-3 rounded-xl border transition-all ${
                            level.current
                              ? 'bg-orange-500/20 border-orange-500/50 ring-2 ring-orange-500/30'
                              : level.level < 0
                              ? 'bg-red-500/5 border-red-500/20'
                              : level.level <= glueiqData.maturityLevel
                              ? 'bg-green-500/5 border-green-500/20'
                              : 'bg-white/5 border-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-bold font-diatype ${
                              level.current ? 'text-orange-400' : 'text-gray-400'
                            }`}>
                              Level {level.level}
                            </span>
                            {level.current && (
                              <span className="text-[10px] bg-orange-500/30 text-orange-300 px-1.5 py-0.5 rounded font-diatype">YOU</span>
                            )}
                          </div>
                          <p className={`text-sm font-semibold font-gendy ${
                            level.current ? 'text-orange-300' : 'text-gray-300'
                          }`}>
                            {level.name}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-1 font-diatype">{level.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'dimensions' && (
              <motion.div
                key="dimensions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white font-gendy">All 23 Dimensions</h2>
                  <button
                    onClick={() => setShowEvidence(!showEvidence)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white transition-colors font-diatype"
                  >
                    {showEvidence ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showEvidence ? 'Hide Evidence' : 'Show Evidence'}
                  </button>
                </div>

                <div className="space-y-4">
                  {glueiqData.categories.map((category) => {
                    const colorClasses = getColorClasses(category.color)
                    const Icon = category.icon
                    const isExpanded = expandedCategory === category.id

                    return (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-white/5 backdrop-blur-xl rounded-2xl border ${
                          category.critical ? 'border-red-500/30' : 'border-white/10'
                        } overflow-hidden`}
                      >
                        {/* Category Header */}
                        <button
                          onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                          className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses.gradient}`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-left">
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg sm:text-xl font-semibold text-white font-gendy">{category.name}</h3>
                                {category.critical && (
                                  <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-diatype">CRITICAL</span>
                                )}
                              </div>
                              <p className="text-xs sm:text-sm text-gray-400 font-diatype">{category.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className={`text-2xl font-bold font-gendy ${category.critical ? 'text-red-400' : colorClasses.text}`}>
                                {category.average.toFixed(1)}
                              </p>
                              <p className="text-xs text-gray-500 font-diatype">/10</p>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </button>

                        {/* Dimensions */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="border-t border-white/10"
                            >
                              <div className="p-4 sm:p-6 space-y-4">
                                {category.dimensions.map((dim) => {
                                  const isDimExpanded = expandedDimension === dim.id

                                  return (
                                    <div
                                      key={dim.id}
                                      className={`rounded-xl border ${
                                        'critical' in dim && dim.critical ? 'border-red-500/30 bg-red-500/5' : 'border-white/10 bg-white/5'
                                      } overflow-hidden`}
                                    >
                                      {/* Dimension Header */}
                                      <button
                                        onClick={() => setExpandedDimension(isDimExpanded ? null : dim.id)}
                                        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                                      >
                                        <div className="flex items-center gap-3 flex-1">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                              <h4 className="text-sm font-semibold text-white font-diatype">{dim.name}</h4>
                                              {'critical' in dim && dim.critical && (
                                                <AlertCircle className="w-4 h-4 text-red-400" />
                                              )}
                                            </div>
                                            <p className="text-xs text-gray-500 font-diatype">{dim.description}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                          <div className="w-24 hidden sm:block">
                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                              <div
                                                className={`h-full bg-gradient-to-r ${getScoreBarColor(dim.score)} rounded-full`}
                                                style={{ width: `${getScoreBarWidth(dim.score)}%` }}
                                              />
                                            </div>
                                          </div>
                                          <span className={`text-lg font-bold font-gendy min-w-[50px] text-right ${getScoreColor(dim.score)}`}>
                                            {dim.score.toFixed(1)}
                                          </span>
                                          {isDimExpanded ? (
                                            <ChevronUp className="w-4 h-4 text-gray-400" />
                                          ) : (
                                            <ChevronDown className="w-4 h-4 text-gray-400" />
                                          )}
                                        </div>
                                      </button>

                                      {/* Dimension Details */}
                                      <AnimatePresence>
                                        {isDimExpanded && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-white/10"
                                          >
                                            <div className="p-4 space-y-4">
                                              {/* Reasoning */}
                                              <div className="bg-white/5 rounded-lg p-4">
                                                <div className="flex items-start gap-2 mb-2">
                                                  <Info className="w-4 h-4 text-cyan-400 mt-0.5" />
                                                  <h5 className="text-sm font-semibold text-cyan-400 font-diatype">Why this score?</h5>
                                                </div>
                                                <p className="text-sm text-gray-300 font-diatype">{dim.reasoning}</p>
                                              </div>

                                              {/* Evidence */}
                                              {showEvidence && dim.evidence && dim.evidence.length > 0 && (
                                                <div>
                                                  <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 font-diatype flex items-center gap-2">
                                                    <Quote className="w-4 h-4" />
                                                    Evidence from Interviews
                                                  </h5>
                                                  <div className="space-y-2">
                                                    {dim.evidence.map((ev, idx) => (
                                                      <div
                                                        key={idx}
                                                        className={`p-3 rounded-lg border-l-2 ${
                                                          ev.sentiment === 'positive' ? 'bg-green-500/5 border-green-500' :
                                                          ev.sentiment === 'negative' ? 'bg-red-500/5 border-red-500' :
                                                          'bg-white/5 border-gray-500'
                                                        }`}
                                                      >
                                                        <p className="text-sm text-gray-300 font-diatype italic">"{ev.quote}"</p>
                                                        <p className="text-xs text-gray-500 font-diatype mt-1">- {ev.speaker}</p>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}

                                              {/* Gaps & Next Steps */}
                                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                  <h5 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2 font-diatype">Gaps Identified</h5>
                                                  <ul className="space-y-1">
                                                    {dim.gaps.map((gap, idx) => (
                                                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-400 font-diatype">
                                                        <span className="text-red-400">-</span>
                                                        {gap}
                                                      </li>
                                                    ))}
                                                  </ul>
                                                </div>
                                                <div>
                                                  <h5 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2 font-diatype">Recommended Actions</h5>
                                                  <ul className="space-y-1">
                                                    {dim.nextSteps.map((step, idx) => (
                                                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-400 font-diatype">
                                                        <span className="text-green-400">+</span>
                                                        {step}
                                                      </li>
                                                    ))}
                                                  </ul>
                                                </div>
                                              </div>
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  )
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === 'people' && (
              <motion.div
                key="people"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-white font-gendy">Leadership Team AI Profiles</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {glueiqData.skillProfiles.map((profile, index) => (
                    <motion.div
                      key={profile.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                      className={`bg-white/5 rounded-xl p-5 border ${
                        profile.potential ? 'border-cyan-500/30 ring-1 ring-cyan-500/20' : 'border-white/10'
                      } hover:border-cyan-500/30 transition-all`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-gendy text-lg font-bold ${
                            profile.level >= 1 ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white' : 'bg-white/10 text-gray-400'
                          }`}>
                            {profile.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h4 className="font-semibold text-white font-diatype">{profile.name}</h4>
                            <p className="text-xs text-gray-400 font-diatype">{profile.title}</p>
                          </div>
                        </div>
                        {profile.potential && (
                          <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full font-diatype">
                            Champion Potential
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold font-diatype ${
                            profile.level >= 1 ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            Level {profile.level}
                          </div>
                          <p className={`text-sm font-medium font-diatype mt-1 ${
                            profile.level >= 1 ? 'text-cyan-400' : 'text-gray-400'
                          }`}>
                            {profile.levelName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 font-diatype">{profile.department}</p>
                          <p className="text-xs text-gray-600 font-diatype">{profile.interviewDuration} min interview</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2 font-diatype">Tools Used</p>
                        <div className="flex flex-wrap gap-1">
                          {profile.tools.slice(0, 4).map(tool => (
                            <span key={tool} className="px-2 py-0.5 bg-white/5 text-gray-400 text-xs rounded font-diatype">
                              {tool}
                            </span>
                          ))}
                          {profile.tools.length > 4 && (
                            <span className="px-2 py-0.5 bg-white/5 text-gray-500 text-xs rounded font-diatype">
                              +{profile.tools.length - 4}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className={`text-xs font-diatype px-2 py-1 rounded inline-flex items-center gap-1 ${
                        profile.growth === 'high' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        <TrendingUp className="w-3 h-3" />
                        {profile.growth.toUpperCase()} growth potential
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Tools Inventory */}
                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white font-gendy mb-4 flex items-center gap-2">
                    <Cog className="w-5 h-5 text-purple-400" />
                    AI Tools Inventory
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {glueiqData.toolsInventory.map((tool) => (
                      <div
                        key={tool.name}
                        className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-purple-500/30 transition-all"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-white font-diatype">{tool.name}</span>
                          {tool.enterprise && (
                            <span className="text-[8px] bg-green-500/20 text-green-400 px-1 rounded">ENT</span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 font-diatype">{tool.category}</p>
                        <p className="text-xs text-purple-400 font-diatype mt-1">{tool.users} users</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'roadmap' && (
              <motion.div
                key="roadmap"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-white font-gendy">Transformation Roadmap</h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Immediate */}
                  <div className="bg-gradient-to-br from-red-500/10 to-orange-500/5 rounded-2xl p-6 border border-red-500/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-red-500/20">
                        <Zap className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white font-gendy">Immediate</h3>
                        <p className="text-xs text-gray-400 font-diatype">0-30 Days</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { title: 'Identify AI Champions', desc: 'Select 2-3 people to lead adoption' },
                        { title: 'Baseline Training', desc: 'Move all staff to Level 1 minimum' },
                        { title: 'Psychological Safety', desc: 'Formalize experimentation policy' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                          <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-red-400 font-bold">{i + 1}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white font-diatype">{item.title}</p>
                            <p className="text-xs text-gray-400 font-diatype">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Short-term */}
                  <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/5 rounded-2xl p-6 border border-yellow-500/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-yellow-500/20">
                        <Target className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white font-gendy">Short-term</h3>
                        <p className="text-xs text-gray-400 font-diatype">30-90 Days</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { title: 'AI Strategy Document', desc: 'Formalize vision and roadmap' },
                        { title: 'Governance Framework', desc: 'Establish policies and oversight' },
                        { title: 'Tool Consolidation', desc: 'Reduce sprawl, maximize licenses' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                          <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-yellow-400 font-bold">{i + 4}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white font-diatype">{item.title}</p>
                            <p className="text-xs text-gray-400 font-diatype">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Medium-term */}
                  <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/5 rounded-2xl p-6 border border-cyan-500/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-cyan-500/20">
                        <TrendingUp className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white font-gendy">Medium-term</h3>
                        <p className="text-xs text-gray-400 font-diatype">90-180 Days</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { title: 'Automation Pilots', desc: 'Launch 3-5 process automation projects' },
                        { title: 'ROI Tracking', desc: 'Implement measurement system' },
                        { title: 'Champion Network', desc: 'Expand to all departments' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                          <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-cyan-400 font-bold">{i + 7}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white font-diatype">{item.title}</p>
                            <p className="text-xs text-gray-400 font-diatype">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl p-8 border border-cyan-500/20 text-center">
                  <h3 className="text-2xl font-bold text-white font-gendy mb-2">Ready to Start Your Transformation?</h3>
                  <p className="text-gray-400 font-diatype mb-6">
                    Schedule a strategy session to discuss your personalized roadmap from Level 0 to Level 3+
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleScheduleCall}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold inline-flex items-center gap-2 font-diatype"
                  >
                    <Calendar className="w-5 h-5" />
                    Schedule Strategy Session
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </ResponsiveLayout>
  )
}
