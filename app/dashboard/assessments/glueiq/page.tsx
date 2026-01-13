'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
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
  FileText,
  Star,
  AlertTriangle,
  HelpCircle,
  DollarSign,
  PiggyBank,
  Calculator
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { handleExportPDF } from './pdf-export'

// Animated Counter Component for ROI numbers
function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  duration = 2,
  className = ''
}: {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => {
    if (latest >= 1000000) {
      return `${(latest / 1000000).toFixed(1)}M`
    } else if (latest >= 1000) {
      return `${(latest / 1000).toFixed(0)}K`
    }
    return Math.round(latest).toLocaleString()
  })
  const [displayValue, setDisplayValue] = useState('0')

  useEffect(() => {
    const unsubscribe = rounded.on('change', (v) => setDisplayValue(v))
    const controls = animate(count, value, { duration })
    return () => {
      controls.stop()
      unsubscribe()
    }
  }, [value, duration, count, rounded])

  return (
    <span className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  )
}

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
    {
      level: -2,
      name: 'Resistant',
      description: 'Active opposition to AI adoption',
      fullDescription: 'Organization actively opposes AI adoption. Leadership views AI as a threat rather than opportunity. Policies may explicitly prohibit AI tool usage. Fear of job displacement dominates conversations.',
      characteristics: ['Explicit AI prohibition policies', 'Leadership sees AI as threat', 'Fear-based decision making', 'No AI tools permitted'],
      typicalBehaviors: ['Blocking AI initiatives', 'Dismissing AI potential', 'Citing only risks, not benefits'],
      timeToNext: '6-12 months with intervention'
    },
    {
      level: -1,
      name: 'Skeptical',
      description: 'Doubtful, hesitant about AI',
      fullDescription: 'Organization is doubtful about AI value. Some individuals may experiment secretly. Leadership questions ROI and sees AI as hype. Passive resistance rather than active opposition.',
      characteristics: ['Doubt about AI ROI', 'Questions about AI hype', 'Some hidden experimentation', 'Wait-and-see attitude'],
      typicalBehaviors: ['Requesting excessive proof of concept', 'Delaying AI decisions', 'Comparing unfavorably to traditional methods'],
      timeToNext: '3-6 months with education'
    },
    {
      level: 0,
      name: 'AI Unaware',
      description: 'No structured AI usage',
      current: true,
      fullDescription: 'Basic ChatGPT exploration without formal strategy. Individuals may use AI tools personally but no organizational approach exists. No training, governance, or measurement. This is where most organizations start their journey.',
      characteristics: ['Ad-hoc individual usage', 'No formal AI strategy', 'No training programs', 'No governance framework', 'No ROI tracking'],
      typicalBehaviors: ['"Playing with" AI tools', 'No documentation of AI use', 'Siloed experimentation', 'Tool sprawl without coordination'],
      timeToNext: '1-3 months with focused effort'
    },
    {
      level: 1,
      name: 'AI Curious',
      description: 'Beginning to explore AI',
      fullDescription: 'Organization acknowledges AI importance and begins intentional exploration. Leadership supports experimentation. First AI champions emerge. Initial discussions about strategy occur.',
      characteristics: ['Acknowledged AI importance', 'Leadership support emerging', 'First champions identified', 'Strategy discussions starting'],
      typicalBehaviors: ['Attending AI workshops', 'Piloting single use cases', 'Discussing AI in meetings', 'Researching AI tools'],
      timeToNext: '2-4 months with pilot programs'
    },
    {
      level: 2,
      name: 'AI Experimenting',
      description: '~25% adoption, simple automations',
      fullDescription: 'Approximately 25% of workforce actively using AI. Simple automations deployed. First documented use cases with measurable results. Basic training available. Some process improvements visible.',
      characteristics: ['25% workforce adoption', 'Simple automations live', 'First measurable results', 'Basic training available'],
      typicalBehaviors: ['Documenting AI use cases', 'Sharing wins internally', 'Building simple workflows', 'Tracking time savings'],
      timeToNext: '3-6 months with scaling efforts'
    },
    {
      level: 3,
      name: 'AI Connecting',
      description: 'Building AI into workflows',
      fullDescription: 'AI integrated into multiple workflows. ~50% adoption. Cross-functional AI collaboration begins. Formal training programs established. Governance framework in place. ROI tracking systematic.',
      characteristics: ['50% workforce adoption', 'Workflows incorporate AI', 'Formal training programs', 'Governance established', 'Systematic ROI tracking'],
      typicalBehaviors: ['AI in standard operating procedures', 'Cross-team AI sharing', 'Regular AI training sessions', 'KPI dashboards include AI metrics'],
      timeToNext: '4-8 months with cultural shift'
    },
    {
      level: 4,
      name: 'AI Collaborating',
      description: 'Teams working with AI daily',
      fullDescription: 'Teams routinely collaborate with AI as part of daily work. ~75% adoption. AI embedded in team rituals and processes. Champion network active across organization. AI second nature for most tasks.',
      characteristics: ['75% workforce adoption', 'Daily AI collaboration', 'Active champion network', 'AI in team rituals'],
      typicalBehaviors: ['Starting meetings with AI summaries', 'AI-assisted decision making', 'Sharing prompts and techniques', 'AI in performance metrics'],
      timeToNext: '6-12 months with integration focus'
    },
    {
      level: 5,
      name: 'AI Integrating',
      description: 'AI embedded in core processes',
      fullDescription: 'AI deeply embedded in core business processes. Near-universal adoption. AI considered essential infrastructure. Significant competitive advantage realized. AI strategy aligned with business strategy.',
      characteristics: ['Near-universal adoption', 'AI as essential infrastructure', 'Competitive advantage realized', 'Strategy alignment complete'],
      typicalBehaviors: ['AI in all major decisions', 'Automated reporting and analytics', 'AI-first approach to new projects', 'AI in customer-facing products'],
      timeToNext: '6-12 months with orchestration'
    },
    {
      level: 6,
      name: 'AI Orchestrating',
      description: 'Multiple AI systems working together',
      fullDescription: 'Multiple AI systems orchestrated to work together. AI agents collaborate across functions. Advanced automation chains. AI manages AI. Organization operates AI center of excellence.',
      characteristics: ['Multi-AI orchestration', 'AI agents collaborating', 'Advanced automation chains', 'AI Center of Excellence'],
      typicalBehaviors: ['AI systems communicating', 'Automated multi-step workflows', 'AI optimizing AI performance', 'Cross-functional AI governance'],
      timeToNext: '12-18 months with innovation investment'
    },
    {
      level: 7,
      name: 'AI Leading',
      description: 'Industry-leading AI practices',
      fullDescription: 'Organization recognized as AI leader in industry. Others benchmark against your practices. Speaking at conferences, publishing thought leadership. AI attracts top talent.',
      characteristics: ['Industry recognition', 'Benchmark organization', 'Thought leadership', 'Talent magnet'],
      typicalBehaviors: ['Publishing AI case studies', 'Conference speaking', 'Consulting to others', 'Attracting AI talent'],
      timeToNext: '12-24 months with R&D investment'
    },
    {
      level: 8,
      name: 'AI Innovating',
      description: 'Creating new AI applications',
      fullDescription: 'Organization creates novel AI applications and solutions. R&D produces original AI tools. May license or sell AI innovations. Contributing to AI advancement.',
      characteristics: ['Original AI innovations', 'R&D producing tools', 'Licensing AI solutions', 'Contributing to field'],
      typicalBehaviors: ['Filing AI patents', 'Building proprietary AI', 'Partnering with AI vendors', 'Academic collaborations'],
      timeToNext: '18-36 months with transformation'
    },
    {
      level: 9,
      name: 'AI Transforming',
      description: 'AI reshaping business model',
      fullDescription: 'AI fundamentally reshaping the business model. New AI-enabled revenue streams. Business impossible without AI. Organization structure optimized for AI collaboration.',
      characteristics: ['AI-enabled revenue streams', 'Business model transformation', 'AI-optimized structure', 'AI-dependent operations'],
      typicalBehaviors: ['Launching AI products/services', 'Restructuring around AI', 'AI in board discussions', 'M&A for AI capabilities'],
      timeToNext: '24-48 months to transcendence'
    },
    {
      level: 10,
      name: 'AI Transcending',
      description: 'AI-native organization',
      fullDescription: 'Truly AI-native organization. AI and human intelligence seamlessly integrated. Organization defines new paradigms. Pioneer in human-AI collaboration. Setting standards for the industry.',
      characteristics: ['AI-native culture', 'Seamless human-AI integration', 'Paradigm-defining', 'Industry standard-setter'],
      typicalBehaviors: ['Redefining work itself', 'Human-AI teams as norm', 'Creating new AI categories', 'Shaping AI policy/ethics'],
      timeToNext: 'Continuous evolution'
    },
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
          reasoning: 'Leadership shows genuine interest in AI but lacks a formal, documented vision. The CEO uses 9+ AI tools personally (ChatGPT, Claude, Perplexity, Motion, Copilot, MidJourney, Beautiful AI, Gamma, Fixer AI) but explicitly admits "we have no AI plan." Partners are exploring individually without coordination. The phrase "playing with" appears repeatedly, indicating experimental rather than strategic usage.',
          evidence: [
            { quote: "Interviews revealed absence of formal AI strategy documentation despite strong aspirational vision", speaker: "Synthesis", sentiment: "negative" },
            { quote: "Leadership demonstrates extensive personal AI tool exploration (9+ tools) but without organizational coordination", speaker: "Synthesis", sentiment: "neutral" },
            { quote: "Approximately 25% of workforce shows initial skepticism but growing interest in AI adoption", speaker: "Synthesis", sentiment: "neutral" },
            { quote: "Clear gap identified between organizational reputation and current AI capabilities", speaker: "Synthesis", sentiment: "negative" },
            { quote: "Strong drive toward building lasting franchise through strategic innovation", speaker: "Synthesis", sentiment: "positive" }
          ],
          gaps: ['No documented AI vision statement', 'Leadership using AI individually, not strategically', 'No investment framework for AI initiatives', 'Vision exists conceptually but not operationalized'],
          nextSteps: ['Create executive AI vision document', 'Align leadership on AI priorities', 'Establish AI investment criteria', 'Move from "playing with" to "implementing" mindset']
        },
        {
          id: 'strategy_alignment',
          name: 'Strategy Alignment',
          score: 1.0,
          description: 'AI strategy alignment with business goals',
          reasoning: 'AI activities are entirely ad-hoc with no connection to business strategy. One partner explicitly describes work as "ad hoc." No formal AI roadmap exists. Tool adoption happens opportunistically - when asked about Productive being launched, another partner responded "what the f*** is Productive?" indicating siloed decisions without organizational alignment.',
          evidence: [
            { quote: "Multiple interviews confirmed AI activities are entirely ad-hoc with no connection to business strategy", speaker: "Synthesis", sentiment: "negative" },
            { quote: "Tool adoption decisions occur in silos without organizational communication or alignment", speaker: "Synthesis", sentiment: "negative" },
            { quote: "Existing toolsets lack structured processes for implementation and measurement", speaker: "Synthesis", sentiment: "negative" },
            { quote: "Clear opportunities exist for standardizing repetitive strategic workflows", speaker: "Synthesis", sentiment: "neutral" }
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
            { quote: "Recent tool launches succeeded through circumstance rather than structured change management process", speaker: "Synthesis", sentiment: "negative" },
            { quote: "New tool rollouts typically lack proper training, communication, and adoption support", speaker: "Synthesis", sentiment: "negative" },
            { quote: "Junior staff face learning gaps without structured onboarding or AI ethics training", speaker: "Synthesis", sentiment: "negative" },
            { quote: "Awareness exists that routine tasks are becoming automated, creating urgency for upskilling", speaker: "Synthesis", sentiment: "neutral" }
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
            { quote: "Gap identified between market reputation and actual AI implementation capabilities", speaker: "Synthesis", sentiment: "negative" },
            { quote: "No systematic monitoring of competitor AI capabilities or industry benchmarks", speaker: "Synthesis", sentiment: "negative" },
            { quote: "Risk of market disruption without clear AI differentiation strategy", speaker: "Synthesis", sentiment: "negative" }
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
            { quote: "Leadership expresses support for experimentation but no formal innovation framework exists", speaker: "Synthesis", sentiment: "neutral" },
            { quote: "Innovation happens individually rather than through organizational processes", speaker: "Synthesis", sentiment: "negative" },
            { quote: "No dedicated time or resources allocated for AI experimentation", speaker: "Synthesis", sentiment: "negative" }
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
          reasoning: 'CRITICAL: Active resistance observed across workforce. All 9 interviewees score at Level 0 (AI Unaware) or Level 1 (AI Curious) maximum. One partner is most advanced at Level 1. Usage language is consistently "standard stuff" and "basic" - not strategic. No formal training program exists. Creative team slightly ahead in visual AI tools but still lacks structured competency.',
          evidence: [
            { quote: "Active resistance to AI adoption observed across multiple team members", speaker: "Synthesis", sentiment: "negative" },
            { quote: "All interviewees scored at Level 0-1 maturity with usage described as 'standard' or 'basic'", speaker: "Synthesis", sentiment: "negative" },
            { quote: "No formal AI training program or competency framework exists", speaker: "Synthesis", sentiment: "negative" },
            { quote: "Creative team shows slightly higher visual AI tool adoption but lacks structured approach", speaker: "Synthesis", sentiment: "neutral" },
            { quote: "No tracking of AI productivity or quality outputs across the organization", speaker: "Synthesis", sentiment: "negative" }
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
            { quote: "Leadership expresses openness to experimentation regardless of tool approval status", speaker: "Synthesis", sentiment: "positive" },
            { quote: "Mixed signals observed between stated openness and underlying skepticism about AI value", speaker: "Synthesis", sentiment: "neutral" },
            { quote: "Fear of job displacement detected as underlying concern affecting adoption willingness", speaker: "Synthesis", sentiment: "negative" }
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
            { quote: "Interest in AI learning exists but occurs through sporadic self-directed efforts only", speaker: "Synthesis", sentiment: "neutral" },
            { quote: "No formal AI training curriculum or role-based learning paths defined", speaker: "Synthesis", sentiment: "negative" },
            { quote: "Assessment revealed gaps in structured upskilling across all interview participants", speaker: "Synthesis", sentiment: "negative" }
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
            { quote: "Stated 'no judgment' policy exists but behavioral resistance suggests gap between policy and practice", speaker: "Synthesis", sentiment: "negative" },
            { quote: "AI output fatigue reported, with team members overwhelmed by lengthy AI-generated responses", speaker: "Synthesis", sentiment: "negative" },
            { quote: "Fear of job displacement underlies observed resistance despite supportive messaging", speaker: "Synthesis", sentiment: "negative" },
            { quote: "Some team members express personal comfort with AI while acknowledging others' fears", speaker: "Synthesis", sentiment: "neutral" }
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
          reasoning: 'No formal AI champions identified. One strategy partner shows potential as first champion at Level 1. Need to build a network of advocates.',
          evidence: [
            { quote: "No formal AI champions currently identified within the organization", speaker: "Synthesis", sentiment: "negative" },
            { quote: "One strategy team member shows potential as first champion based on Level 1 maturity", speaker: "Synthesis", sentiment: "positive" },
            { quote: "AI experimentation happening in isolation without cross-team knowledge sharing", speaker: "Synthesis", sentiment: "negative" }
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
          evidence: [
            { quote: "Basic organizational data exists but lacks AI-ready preparation", speaker: "Synthesis", sentiment: "neutral" },
            { quote: "Data remains siloed across teams without centralized access strategy", speaker: "Synthesis", sentiment: "negative" },
            { quote: "No formal data strategy aligned with AI application needs", speaker: "Synthesis", sentiment: "negative" }
          ],
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
            { quote: "15+ AI tools in use across organization without cohesive technology strategy", speaker: "Synthesis", sentiment: "negative" },
            { quote: "Existing toolsets lack structured implementation processes", speaker: "Synthesis", sentiment: "negative" },
            { quote: "Enterprise licenses (ChatGPT, Copilot) underutilized relative to investment", speaker: "Synthesis", sentiment: "negative" }
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
          evidence: [
            { quote: "Limited integration between existing AI tools and business systems", speaker: "Synthesis", sentiment: "negative" },
            { quote: "Manual handoffs persist between disconnected tools and processes", speaker: "Synthesis", sentiment: "negative" },
            { quote: "No automation connecting systems despite available integration capabilities", speaker: "Synthesis", sentiment: "negative" }
          ],
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
            { quote: "No AI-specific security policies or data handling guidelines in place", speaker: "Synthesis", sentiment: "negative" },
            { quote: "Concerns raised about AI ethics knowledge gaps, particularly among newer team members", speaker: "Synthesis", sentiment: "negative" },
            { quote: "Missing compliance framework for responsible AI usage", speaker: "Synthesis", sentiment: "negative" }
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
          evidence: [
            { quote: "Multiple AI vendors in use without strategic partnership approach", speaker: "Synthesis", sentiment: "negative" },
            { quote: "Tool selection occurs ad-hoc without formal evaluation criteria", speaker: "Synthesis", sentiment: "negative" },
            { quote: "No vendor consolidation or preferred partner strategy in place", speaker: "Synthesis", sentiment: "negative" }
          ],
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
            { quote: "Some AI use cases emerging organically through individual experimentation", speaker: "Synthesis", sentiment: "positive" },
            { quote: "Leadership supportive of experimentation but no formal use case inventory exists", speaker: "Synthesis", sentiment: "neutral" },
            { quote: "Missing prioritization framework for evaluating and scaling AI applications", speaker: "Synthesis", sentiment: "negative" }
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
            { quote: "Clear automation opportunities identified for repetitive strategic workflows", speaker: "Synthesis", sentiment: "positive" },
            { quote: "Some team members already using AI daily for tasks like feedback and transcription", speaker: "Synthesis", sentiment: "positive" },
            { quote: "No structured framework exists for prioritizing and implementing automation", speaker: "Synthesis", sentiment: "negative" }
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
          evidence: [
            { quote: "Operations remain largely manual with limited AI integration", speaker: "Synthesis", sentiment: "negative" },
            { quote: "AI not yet embedded in core operational processes", speaker: "Synthesis", sentiment: "negative" },
            { quote: "Missing operational metrics for measuring AI impact", speaker: "Synthesis", sentiment: "negative" }
          ],
          gaps: ['Manual operations', 'No AI in core processes', 'Missing metrics'],
          nextSteps: ['Identify operational AI opportunities', 'Define success metrics', 'Pilot operational AI']
        },
        {
          id: 'customer_experience',
          name: 'Customer Experience',
          score: 0.5,
          description: 'AI-enhanced CX',
          reasoning: 'Customer experience not yet AI-enhanced. Opportunity to differentiate through AI-powered services.',
          evidence: [
            { quote: "Customer experience not currently leveraging AI capabilities", speaker: "Synthesis", sentiment: "negative" },
            { quote: "Client services remain largely manual without AI enhancement", speaker: "Synthesis", sentiment: "negative" },
            { quote: "Opportunity identified to differentiate through AI-powered personalization", speaker: "Synthesis", sentiment: "neutral" }
          ],
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
            { quote: "Governance discussions occurring but no formal framework documented", speaker: "Synthesis", sentiment: "neutral" },
            { quote: "Leadership awareness of governance need exists without implementation", speaker: "Synthesis", sentiment: "neutral" },
            { quote: "No oversight structure or policies currently in place for AI initiatives", speaker: "Synthesis", sentiment: "negative" }
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
            { quote: "Concerns raised about AI ethics knowledge gaps, particularly among newer team members", speaker: "Synthesis", sentiment: "negative" },
            { quote: "Leadership awareness of ethics importance exists but no formal framework", speaker: "Synthesis", sentiment: "neutral" },
            { quote: "Missing guidelines for responsible AI usage and ethical considerations", speaker: "Synthesis", sentiment: "negative" }
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
          evidence: [
            { quote: "AI-related risks not formally assessed or documented", speaker: "Synthesis", sentiment: "negative" },
            { quote: "No risk framework exists for evaluating AI initiatives", speaker: "Synthesis", sentiment: "negative" },
            { quote: "Potential blind spots in AI adoption without proper risk controls", speaker: "Synthesis", sentiment: "negative" }
          ],
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
            { quote: "No tracking of AI productivity or quality outputs currently in place", speaker: "Synthesis", sentiment: "negative" },
            { quote: "Unable to demonstrate ROI or value from current AI investments", speaker: "Synthesis", sentiment: "negative" },
            { quote: "Missing metrics framework for measuring AI initiative success", speaker: "Synthesis", sentiment: "negative" }
          ],
          gaps: ['No ROI tracking', 'Missing metrics', 'Cannot demonstrate value'],
          nextSteps: ['Define AI success metrics', 'Implement tracking system', 'Create ROI dashboard']
        }
      ]
    }
  ],

  skillProfiles: [
    {
      name: 'Gaston Legorburu',
      title: 'CEO & Founder',
      level: 0,
      levelName: 'AI Unaware',
      tools: ['ChatGPT', 'Claude', 'Perplexity', 'Motion', 'Copilot', 'MidJourney', 'Beautiful AI', 'Gamma', 'Fixer AI'],
      growth: 'high',
      department: 'Executive',
      interviewDuration: 122,
      psychology: {
        thinkingStyle: 'Visionary but exploratory - sees AI potential for legacy-building but lacks structured implementation approach',
        communicationStyle: 'Candid and self-aware - openly admits gaps while maintaining aspirational vision',
        changeReadiness: 65,
        aiAnxiety: 'low',
        keyMotivator: 'Building a lasting franchise and legacy through strategic innovation',
        potentialBlocker: 'Gap between personal tool exploration and organizational strategy',
        recommendedApproach: 'Channel personal AI enthusiasm into formal strategy document; needs structured framework to move from "playing with" to "implementing"'
      },
      keyQuotes: [
        "We have no AI plan, no investment from a structured standpoint.",
        "We're trying to build a legacy and a franchise.",
        "Sometimes your reputation exceeds your capability."
      ]
    },
    {
      name: 'Matt Kujawa',
      title: 'Partner',
      level: 1,
      levelName: 'AI Curious',
      tools: ['Perplexity', 'Claude Projects', 'Google LM'],
      growth: 'medium',
      department: 'Strategy',
      interviewDuration: 85,
      potential: true,
      psychology: {
        thinkingStyle: 'Analytical and process-oriented - recognizes inefficiencies and seeks systematic solutions',
        communicationStyle: 'Direct and pragmatic - calls out issues clearly while proposing actionable alternatives',
        changeReadiness: 75,
        aiAnxiety: 'low',
        keyMotivator: 'Efficiency gains and process optimization through technology',
        potentialBlocker: 'Frustration with ad-hoc approach may lead to disengagement',
        recommendedApproach: 'Ideal AI Champion candidate - give formal authority to drive adoption initiatives'
      },
      keyQuotes: [
        "It's something we do ad hoc.",
        "I think we got lucky with this one.",
        "I've tried to do sort of Claude code, but that's not going very well."
      ]
    },
    {
      name: 'Joey Wilson',
      title: 'Partner',
      level: 0,
      levelName: 'AI Unaware',
      tools: ['Atlas', 'Motion', 'Productive'],
      growth: 'high',
      department: 'Strategy',
      interviewDuration: 69,
      psychology: {
        thinkingStyle: 'Client-focused pragmatist - evaluates AI through lens of client deliverables',
        communicationStyle: 'Measured and thoughtful - acknowledges both opportunities and concerns',
        changeReadiness: 55,
        aiAnxiety: 'medium',
        keyMotivator: 'Client satisfaction and repeatable, scalable processes',
        potentialBlocker: 'May prioritize client demands over internal AI adoption',
        recommendedApproach: 'Frame AI adoption in terms of client value and competitive differentiation'
      },
      keyQuotes: [
        "I'm also not afraid of [AI]... I understand why [others are].",
        "Client wants a weekly optimization plan.",
        "I want five or six things we do repetitively in strategy."
      ]
    },
    {
      name: 'Boris Stojanovic',
      title: 'Partner',
      level: 0,
      levelName: 'AI Unaware',
      tools: ['Claude', 'Perplexity', 'N8N'],
      growth: 'high',
      department: 'Technology',
      interviewDuration: 34,
      psychology: {
        thinkingStyle: 'Technical implementer - understands automation but needs clearer strategic direction',
        communicationStyle: 'Reserved and observational - provides insights when prompted',
        changeReadiness: 70,
        aiAnxiety: 'low',
        keyMotivator: 'Building robust technical solutions and automation workflows',
        potentialBlocker: 'Short interview duration suggests potential disengagement or time constraints',
        recommendedApproach: 'Leverage N8N experience for automation pilots; needs clear technical roadmap'
      },
      keyQuotes: [
        "My guess would be, you know, predominantly is, like, chat and, like, MidJourney.",
        "Some of the other, like, image gen stuff."
      ]
    },
    {
      name: 'Maggy Conde',
      title: 'Partner',
      level: 0,
      levelName: 'AI Unaware',
      tools: ['Beautiful AI', 'Productive', 'ChatGPT'],
      growth: 'high',
      department: 'Client Services',
      interviewDuration: 65,
      psychology: {
        thinkingStyle: 'Client relationship focused - prioritizes personal touch over automation',
        communicationStyle: 'Expressive and candid - openly shares frustrations with lack of structure',
        changeReadiness: 50,
        aiAnxiety: 'medium',
        keyMotivator: 'Clear processes and communication that support client work',
        potentialBlocker: 'Frustration with tool sprawl and siloed decisions',
        recommendedApproach: 'Address communication gaps first; involve in tool selection decisions'
      },
      keyQuotes: [
        "What the f*** is Productive?",
        "I use like the ChatGPT and the Beautiful AI, like just like to me, like the standard stuff.",
        "There's no structured process."
      ]
    },
    {
      name: 'Noel Artiles',
      title: 'CCO',
      level: 0,
      levelName: 'AI Unaware',
      tools: ['Gemini'],
      growth: 'high',
      department: 'Creative',
      interviewDuration: 64,
      psychology: {
        thinkingStyle: 'Creative visionary - evaluates AI through aesthetic and craft lens',
        communicationStyle: 'Quality-focused and discerning - high standards for outputs',
        changeReadiness: 45,
        aiAnxiety: 'medium',
        keyMotivator: 'Maintaining creative quality and authentic human expression',
        potentialBlocker: 'May resist AI that threatens creative authenticity',
        recommendedApproach: 'Position AI as creative amplifier, not replacement; focus on ideation tools'
      },
      keyQuotes: [
        "Uses Gemini for basic tasks",
        "Creative team has different needs than operations"
      ]
    },
    {
      name: 'Michele Conigliaro',
      title: 'Head of People',
      level: 0,
      levelName: 'AI Unaware',
      tools: ['Otter', 'ChatGPT'],
      growth: 'high',
      department: 'People',
      interviewDuration: 67,
      psychology: {
        thinkingStyle: 'People-centric - evaluates all changes through impact on team wellbeing',
        communicationStyle: 'Empathetic and supportive - focuses on psychological safety',
        changeReadiness: 60,
        aiAnxiety: 'medium',
        keyMotivator: 'Team development, engagement, and reducing friction',
        potentialBlocker: 'May be overwhelmed by scope of cultural change required',
        recommendedApproach: 'Critical ally for psychological safety initiatives; co-design change management approach'
      },
      keyQuotes: [
        "Uses Otter for transcription daily",
        "People operations needs to lead cultural change"
      ]
    },
    {
      name: 'Chiny Chewing',
      title: 'Partner',
      level: 0,
      levelName: 'AI Unaware',
      tools: ['ChatGPT'],
      growth: 'high',
      department: 'Strategy',
      interviewDuration: 67,
      psychology: {
        thinkingStyle: 'Practical strategist - focuses on immediate client needs',
        communicationStyle: 'Straightforward and task-oriented',
        changeReadiness: 55,
        aiAnxiety: 'low',
        keyMotivator: 'Streamlined workflows and clearer processes',
        potentialBlocker: 'Limited tool exposure may slow adoption curve',
        recommendedApproach: 'Pair with more advanced users for peer learning; start with simple use cases'
      },
      keyQuotes: [
        "Uses ChatGPT for basic content tasks"
      ]
    },
    {
      name: 'Dave Serrano',
      title: 'Partner',
      level: 0,
      levelName: 'AI Unaware',
      tools: ['Gamma', 'Beautiful AI', 'ChatGPT'],
      growth: 'high',
      department: 'Creative',
      interviewDuration: 54,
      psychology: {
        thinkingStyle: 'Daily practitioner - actually uses AI consistently for real work',
        communicationStyle: 'Practical and results-focused - shares concrete use cases',
        changeReadiness: 70,
        aiAnxiety: 'low',
        keyMotivator: 'Productivity gains and presentation quality',
        potentialBlocker: 'May hit plateau without deeper training',
        recommendedApproach: 'Potential creative team champion - can model daily AI usage for peers'
      },
      keyQuotes: [
        "I pretty much use it probably every day.",
        "I use it for everything from articulating feedback to transcribing meetings."
      ]
    },
  ],

  // Business Process Analysis
  businessProcesses: [
    {
      id: 'client_strategy',
      name: 'Client Strategy Development',
      department: 'Strategy',
      currentState: 'Manual research, ad-hoc frameworks, inconsistent deliverables',
      painPoints: ['Repetitive research tasks', 'No standardized templates', 'Time-intensive competitive analysis'],
      aiOpportunity: 'high',
      automationPotential: 75,
      recommendedTools: ['Perplexity for research', 'Claude for framework development', 'Beautiful AI for presentations'],
      estimatedTimeSavings: '40% reduction in research time',
      priority: 1
    },
    {
      id: 'content_creation',
      name: 'Content & Creative Production',
      department: 'Creative',
      currentState: 'Traditional creative workflow with some AI experimentation',
      painPoints: ['Ideation bottlenecks', 'Asset generation speed', 'Version control'],
      aiOpportunity: 'high',
      automationPotential: 60,
      recommendedTools: ['MidJourney for concepts', 'ChatGPT for copy', 'Gamma for presentations'],
      estimatedTimeSavings: '30% faster concept development',
      priority: 2
    },
    {
      id: 'client_communications',
      name: 'Client Communications & Reporting',
      department: 'Client Services',
      currentState: 'Manual status updates, inconsistent reporting formats',
      painPoints: ['Time-consuming updates', 'Formatting inconsistencies', 'Delayed responses'],
      aiOpportunity: 'medium',
      automationPotential: 50,
      recommendedTools: ['ChatGPT for drafting', 'Otter for meeting notes', 'Automation for status reports'],
      estimatedTimeSavings: '25% reduction in admin time',
      priority: 3
    },
    {
      id: 'talent_onboarding',
      name: 'Talent Onboarding & Training',
      department: 'People',
      currentState: 'No structured onboarding for AI tools, self-directed learning',
      painPoints: ['No AI training curriculum', 'Inconsistent tool knowledge', 'No ethics guidelines'],
      aiOpportunity: 'high',
      automationPotential: 40,
      recommendedTools: ['LMS with AI modules', 'ChatGPT for Q&A', 'Internal wiki'],
      estimatedTimeSavings: '50% faster tool adoption',
      priority: 1
    },
    {
      id: 'project_management',
      name: 'Project & Resource Management',
      department: 'Operations',
      currentState: 'Productive recently launched, adoption varies',
      painPoints: ['Tool sprawl', 'Inconsistent usage', 'Manual resource allocation'],
      aiOpportunity: 'medium',
      automationPotential: 55,
      recommendedTools: ['Productive for PM', 'Motion for scheduling', 'N8N for automation'],
      estimatedTimeSavings: '20% efficiency gains',
      priority: 4
    },
    {
      id: 'business_development',
      name: 'Business Development & Proposals',
      department: 'Strategy',
      currentState: 'Manual proposal creation, limited personalization at scale',
      painPoints: ['Time-intensive proposals', 'Generic pitches', 'Research gaps'],
      aiOpportunity: 'high',
      automationPotential: 65,
      recommendedTools: ['Claude for proposals', 'Perplexity for research', 'Beautiful AI for decks'],
      estimatedTimeSavings: '35% faster proposal turnaround',
      priority: 2
    }
  ],

  // Department Analysis
  departmentAnalysis: [
    {
      name: 'Strategy',
      members: ['Matt Kujawa', 'Joey Wilson', 'Chiny Chewing'],
      avgMaturity: 0.33,
      strengths: ['Process awareness', 'Client focus', 'Some tool experimentation'],
      weaknesses: ['Ad-hoc approach', 'No standardization', 'Limited AI depth'],
      championCandidate: 'Matt Kujawa',
      priorityActions: ['Standardize research workflows', 'Create strategy AI playbook', 'Pilot Claude for frameworks']
    },
    {
      name: 'Creative',
      members: ['Noel Artiles', 'Dave Serrano'],
      avgMaturity: 0.0,
      strengths: ['Daily AI usage (Dave)', 'Visual tool adoption', 'Practical application'],
      weaknesses: ['Quality concerns', 'Resistance to automation', 'Limited LLM use'],
      championCandidate: 'Dave Serrano',
      priorityActions: ['Expand image gen capabilities', 'Introduce AI ideation workflows', 'Address authenticity concerns']
    },
    {
      name: 'Client Services',
      members: ['Maggy Conde'],
      avgMaturity: 0.0,
      strengths: ['Client relationship focus', 'Candid communication'],
      weaknesses: ['Tool frustration', 'Communication gaps', 'Standard usage only'],
      championCandidate: null,
      priorityActions: ['Improve internal communication', 'Involve in tool decisions', 'Automate status reporting']
    },
    {
      name: 'Technology',
      members: ['Boris Stojanovic'],
      avgMaturity: 0.0,
      strengths: ['N8N automation experience', 'Technical capability'],
      weaknesses: ['Engagement unclear', 'Short interview', 'Limited visibility'],
      championCandidate: 'Boris Stojanovic',
      priorityActions: ['Lead automation pilots', 'Define tech AI roadmap', 'Evaluate integration needs']
    },
    {
      name: 'Executive',
      members: ['Gaston Legorburu'],
      avgMaturity: 0.0,
      strengths: ['Vision', 'Personal tool exploration', 'Openness to change'],
      weaknesses: ['No formal strategy', 'Gap between vision and action', 'Playing vs implementing'],
      championCandidate: null,
      priorityActions: ['Document AI vision', 'Allocate AI budget', 'Lead from the front']
    },
    {
      name: 'People',
      members: ['Michele Conigliaro'],
      avgMaturity: 0.0,
      strengths: ['People-centric approach', 'Daily AI usage', 'Change awareness'],
      weaknesses: ['Limited tool range', 'Cultural change scope'],
      championCandidate: null,
      priorityActions: ['Design AI training program', 'Create psychological safety protocols', 'Partner on change management']
    }
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
  ],

  roiProjections: {
    currentAnnualCost: 2400000,
    avgHourlyRate: 150,
    hoursWastedWeekly: 320,
    projectedSavingsLevel3: 480000,
    projectedSavingsLevel5: 960000,
    investmentRequired: 75000,
    paybackMonths: 6,
    fiveYearROI: 3200000,
  },

  actionPlan: {
    phases: [
      {
        name: "Days 1-30: Foundation",
        theme: "Establish AI Leadership & Vision",
        tasks: [
          { id: 1, task: "Identify and formally appoint 2 AI Champions", owner: "CEO", priority: "critical" as const, status: "pending" as const },
          { id: 2, task: "Draft AI Vision Statement (1-page)", owner: "Leadership Team", priority: "critical" as const, status: "pending" as const },
          { id: 3, task: "Conduct AI tools audit - consolidate licenses", owner: "Operations", priority: "high" as const, status: "pending" as const },
          { id: 4, task: "Schedule AI Kickoff All-Hands meeting", owner: "People Ops", priority: "high" as const, status: "pending" as const },
          { id: 5, task: "Create psychological safety guidelines for AI experimentation", owner: "People Ops", priority: "medium" as const, status: "pending" as const },
        ]
      },
      {
        name: "Days 31-60: Pilot",
        theme: "Launch First AI Initiatives",
        tasks: [
          { id: 6, task: "Deploy Client Strategy Research automation pilot", owner: "Strategy Team", priority: "critical" as const, status: "pending" as const },
          { id: 7, task: "Launch basic AI training program (2 sessions)", owner: "AI Champions", priority: "high" as const, status: "pending" as const },
          { id: 8, task: "Establish AI governance framework", owner: "Leadership", priority: "high" as const, status: "pending" as const },
          { id: 9, task: "Create shared prompt library", owner: "AI Champions", priority: "medium" as const, status: "pending" as const },
          { id: 10, task: "Set up AI usage tracking metrics", owner: "Operations", priority: "medium" as const, status: "pending" as const },
        ]
      },
      {
        name: "Days 61-90: Scale",
        theme: "Expand & Measure",
        tasks: [
          { id: 11, task: "Roll out automation to 2 additional processes", owner: "Department Leads", priority: "critical" as const, status: "pending" as const },
          { id: 12, task: "Conduct first ROI measurement", owner: "Finance", priority: "high" as const, status: "pending" as const },
          { id: 13, task: "Expand champion network to each department", owner: "AI Champions", priority: "high" as const, status: "pending" as const },
          { id: 14, task: "Launch advanced AI training track", owner: "AI Champions", priority: "medium" as const, status: "pending" as const },
          { id: 15, task: "Plan Level 1 to Level 2 assessment", owner: "Leadership", priority: "medium" as const, status: "pending" as const },
        ]
      }
    ]
  }
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
  const [activeTab, setActiveTab] = useState<'overview' | 'dimensions' | 'people' | 'processes' | 'departments' | 'roadmap'>('overview')
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
  const [showEvidence, setShowEvidence] = useState(true)
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set())

  const toggleTaskComplete = (taskId: number) => {
    setCompletedTasks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  const getPhaseProgress = (phaseIndex: number) => {
    const phase = glueiqData.actionPlan.phases[phaseIndex]
    const completedCount = phase.tasks.filter(t => completedTasks.has(t.id)).length
    return Math.round((completedCount / phase.tasks.length) * 100)
  }

  const getOverallProgress = () => {
    const totalTasks = glueiqData.actionPlan.phases.reduce((acc, phase) => acc + phase.tasks.length, 0)
    return Math.round((completedTasks.size / totalTasks) * 100)
  }

  const getPriorityColor = (priority: 'critical' | 'high' | 'medium') => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
      case 'medium': return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const getPhaseGradient = (phaseIndex: number) => {
    switch (phaseIndex) {
      case 0: return 'from-cyan-500/10 to-blue-500/5 border-cyan-500/20'
      case 1: return 'from-purple-500/10 to-pink-500/5 border-purple-500/20'
      case 2: return 'from-green-500/10 to-emerald-500/5 border-green-500/20'
      default: return 'from-gray-500/10 to-gray-500/5 border-gray-500/20'
    }
  }

  const getPhaseAccent = (phaseIndex: number) => {
    switch (phaseIndex) {
      case 0: return 'text-cyan-400'
      case 1: return 'text-purple-400'
      case 2: return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  const handleScheduleCall = () => {
    window.open('https://calendly.com/humanglue/strategy-session', '_blank')
  }

  return (
    <div className="min-h-screen bg-black">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] pb-20 lg:pb-0 transition-all">
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
                  onClick={() => handleExportPDF(glueiqData)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold inline-flex items-center gap-2 font-diatype text-sm"
                >
                  <FileText className="w-4 h-4" />
                  Export PDF
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
                { id: 'processes', label: 'Business Processes', icon: Cog },
                { id: 'departments', label: 'Departments', icon: Building2 },
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

                {/* Change Readiness Matrix */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white font-gendy flex items-center gap-2">
                        <Brain className="w-5 h-5 text-cyan-400" />
                        Change Readiness Matrix
                      </h3>
                      <p className="text-sm text-gray-400 font-diatype mt-1">
                        Team members plotted by AI Anxiety (X) vs Change Readiness (Y)
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-diatype">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                        <span className="text-gray-400">Champions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                        <span className="text-gray-400">Cautious Supporters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-500/50" />
                        <span className="text-gray-400">Passive</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                        <span className="text-gray-400">Blockers</span>
                      </div>
                    </div>
                  </div>

                  {/* Matrix Container */}
                  <div className="relative aspect-square max-w-2xl mx-auto mb-8">
                    {/* Quadrant Backgrounds */}
                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 rounded-xl overflow-hidden border border-white/10">
                      {/* Top-Left: Champions (high readiness, low anxiety) */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-green-500/10 border-r border-b border-white/10 relative"
                      >
                        <span className="absolute top-3 left-3 text-xs font-diatype text-green-400/70 font-semibold">
                          Champions
                        </span>
                      </motion.div>
                      {/* Top-Right: Cautious Supporters (high readiness, high anxiety) */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-yellow-500/10 border-b border-white/10 relative"
                      >
                        <span className="absolute top-3 right-3 text-xs font-diatype text-yellow-400/70 font-semibold">
                          Cautious Supporters
                        </span>
                      </motion.div>
                      {/* Bottom-Left: Passive (low readiness, low anxiety) */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gray-500/10 border-r border-white/10 relative"
                      >
                        <span className="absolute bottom-3 left-3 text-xs font-diatype text-gray-400/70 font-semibold">
                          Passive
                        </span>
                      </motion.div>
                      {/* Bottom-Right: Blockers (low readiness, high anxiety) */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-red-500/10 relative"
                      >
                        <span className="absolute bottom-3 right-3 text-xs font-diatype text-red-400/70 font-semibold">
                          Blockers
                        </span>
                      </motion.div>
                    </div>

                    {/* Axis Lines */}
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Vertical center line */}
                      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20" />
                      {/* Horizontal center line */}
                      <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20" />
                    </div>

                    {/* Axis Labels */}
                    <div className="absolute -bottom-8 left-0 right-0 flex justify-between text-xs font-diatype text-gray-500 px-2">
                      <span>Low AI Anxiety</span>
                      <span>High AI Anxiety</span>
                    </div>
                    <div className="absolute top-0 bottom-0 -left-2 flex flex-col justify-between text-xs font-diatype text-gray-500 py-2 items-end pr-2" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                      <span>Low Readiness</span>
                      <span>High Readiness</span>
                    </div>

                    {/* Team Member Dots */}
                    {glueiqData.skillProfiles.map((profile, index) => {
                      // Convert aiAnxiety to numeric: 'low'=0, 'medium'=50, 'high'=100
                      const anxietyMap: Record<string, number> = { low: 0, medium: 50, high: 100 }
                      const aiAnxietyValue = anxietyMap[profile.psychology.aiAnxiety] ?? 50
                      const changeReadinessValue = profile.psychology.changeReadiness

                      // Calculate position (X: anxiety 0-100, Y: readiness 0-100, but Y is inverted for CSS)
                      // Add some padding to keep dots inside the chart (5-95% range)
                      const xPercent = 5 + (aiAnxietyValue / 100) * 90
                      const yPercent = 95 - (changeReadinessValue / 100) * 90 // Invert Y so high readiness is at top

                      // Get initials
                      const initials = profile.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)

                      // Determine quadrant color for the dot
                      const isHighReadiness = changeReadinessValue >= 50
                      const isLowAnxiety = aiAnxietyValue < 50
                      let dotColor = 'bg-gray-500'
                      let ringColor = 'ring-gray-400'
                      if (isHighReadiness && isLowAnxiety) {
                        dotColor = 'bg-green-500'
                        ringColor = 'ring-green-400'
                      } else if (isHighReadiness && !isLowAnxiety) {
                        dotColor = 'bg-yellow-500'
                        ringColor = 'ring-yellow-400'
                      } else if (!isHighReadiness && isLowAnxiety) {
                        dotColor = 'bg-gray-500'
                        ringColor = 'ring-gray-400'
                      } else {
                        dotColor = 'bg-red-500'
                        ringColor = 'ring-red-400'
                      }

                      return (
                        <motion.div
                          key={profile.name}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.5 + index * 0.08, type: 'spring', stiffness: 200 }}
                          className="absolute group z-10"
                          style={{
                            left: `${xPercent}%`,
                            top: `${yPercent}%`,
                            transform: 'translate(-50%, -50%)',
                          }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.3 }}
                            className={`w-10 h-10 rounded-full ${dotColor} flex items-center justify-center text-white text-xs font-bold font-diatype cursor-pointer ring-2 ${ringColor} ring-offset-2 ring-offset-black/50 shadow-lg backdrop-blur-sm relative`}
                          >
                            {initials}
                          </motion.div>

                          {/* Hover Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            <div className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                              <p className="text-sm font-semibold text-white font-diatype">{profile.name}</p>
                              <p className="text-xs text-gray-400 font-diatype">{profile.title}</p>
                              <div className="flex gap-3 mt-1.5 text-xs font-diatype">
                                <span className="text-cyan-400">
                                  Readiness: {changeReadinessValue}
                                </span>
                                <span className="text-orange-400">
                                  Anxiety: {profile.psychology.aiAnxiety}
                                </span>
                              </div>
                            </div>
                            {/* Tooltip Arrow */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900/95" />
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Matrix Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                    {[
                      {
                        label: 'Champions',
                        description: 'High readiness, low anxiety',
                        color: 'green',
                        count: glueiqData.skillProfiles.filter((p) => {
                          const anxiety = { low: 0, medium: 50, high: 100 }[p.psychology.aiAnxiety] ?? 50
                          return p.psychology.changeReadiness >= 50 && anxiety < 50
                        }).length,
                      },
                      {
                        label: 'Cautious Supporters',
                        description: 'High readiness, high anxiety',
                        color: 'yellow',
                        count: glueiqData.skillProfiles.filter((p) => {
                          const anxiety = { low: 0, medium: 50, high: 100 }[p.psychology.aiAnxiety] ?? 50
                          return p.psychology.changeReadiness >= 50 && anxiety >= 50
                        }).length,
                      },
                      {
                        label: 'Passive',
                        description: 'Low readiness, low anxiety',
                        color: 'gray',
                        count: glueiqData.skillProfiles.filter((p) => {
                          const anxiety = { low: 0, medium: 50, high: 100 }[p.psychology.aiAnxiety] ?? 50
                          return p.psychology.changeReadiness < 50 && anxiety < 50
                        }).length,
                      },
                      {
                        label: 'Blockers',
                        description: 'Low readiness, high anxiety',
                        color: 'red',
                        count: glueiqData.skillProfiles.filter((p) => {
                          const anxiety = { low: 0, medium: 50, high: 100 }[p.psychology.aiAnxiety] ?? 50
                          return p.psychology.changeReadiness < 50 && anxiety >= 50
                        }).length,
                      },
                    ].map((quadrant, idx) => {
                      const colorMap: Record<string, { bg: string; text: string; border: string }> = {
                        green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
                        yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
                        gray: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30' },
                        red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
                      }
                      const colors = colorMap[quadrant.color]

                      return (
                        <motion.div
                          key={quadrant.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 + idx * 0.1 }}
                          className={`${colors.bg} rounded-xl p-4 border ${colors.border}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-2xl font-bold font-gendy ${colors.text}`}>
                              {quadrant.count}
                            </span>
                            <span className="text-xs text-gray-500 font-diatype">
                              /{glueiqData.skillProfiles.length}
                            </span>
                          </div>
                          <p className={`text-sm font-semibold ${colors.text} font-diatype`}>
                            {quadrant.label}
                          </p>
                          <p className="text-xs text-gray-500 font-diatype mt-1">
                            {quadrant.description}
                          </p>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                {/* Maturity Level Scale */}
                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white font-gendy flex items-center gap-2">
                      <Award className="w-5 h-5 text-cyan-400" />
                      LVNG.ai Maturity Framework
                    </h3>
                    <p className="text-xs text-gray-400 font-diatype">Click any level to see full definition</p>
                  </div>
                  <div className="overflow-x-auto">
                    <div className="flex gap-2 min-w-max pb-2">
                      {glueiqData.maturityLevels.map((level, index) => (
                        <motion.div
                          key={level.level}
                          whileHover={{ y: -2, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedLevel(selectedLevel === level.level ? null : level.level)}
                          className={`cursor-pointer flex-shrink-0 w-32 p-3 rounded-xl border transition-all ${
                            selectedLevel === level.level
                              ? 'bg-cyan-500/20 border-cyan-500/50 ring-2 ring-cyan-500/30'
                              : level.current
                              ? 'bg-orange-500/20 border-orange-500/50 ring-2 ring-orange-500/30'
                              : level.level < 0
                              ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                              : level.level <= glueiqData.maturityLevel
                              ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/40'
                              : 'bg-white/5 border-white/10 hover:border-white/30'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-bold font-diatype ${
                              selectedLevel === level.level ? 'text-cyan-400' :
                              level.current ? 'text-orange-400' : 'text-gray-400'
                            }`}>
                              Level {level.level}
                            </span>
                            {level.current && (
                              <span className="text-[10px] bg-orange-500/30 text-orange-300 px-1.5 py-0.5 rounded font-diatype">YOU</span>
                            )}
                          </div>
                          <p className={`text-sm font-semibold font-gendy ${
                            selectedLevel === level.level ? 'text-cyan-300' :
                            level.current ? 'text-orange-300' : 'text-gray-300'
                          }`}>
                            {level.name}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-1 font-diatype">{level.description}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Expanded Level Detail */}
                  <AnimatePresence>
                    {selectedLevel !== null && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 overflow-hidden"
                      >
                        {(() => {
                          const level = glueiqData.maturityLevels.find(l => l.level === selectedLevel)
                          if (!level) return null

                          return (
                            <div className={`rounded-xl p-5 border ${
                              level.current
                                ? 'bg-orange-500/10 border-orange-500/30'
                                : level.level < 0
                                ? 'bg-red-500/10 border-red-500/30'
                                : 'bg-cyan-500/10 border-cyan-500/30'
                            }`}>
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className={`text-2xl font-bold font-gendy ${
                                      level.current ? 'text-orange-400' :
                                      level.level < 0 ? 'text-red-400' : 'text-cyan-400'
                                    }`}>
                                      Level {level.level}
                                    </span>
                                    <h4 className="text-xl font-semibold text-white font-gendy">{level.name}</h4>
                                    {level.current && (
                                      <span className="text-xs bg-orange-500/30 text-orange-300 px-2 py-1 rounded-full font-diatype">
                                        GlueIQ Current Position
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-gray-300 font-diatype">{level.fullDescription}</p>
                                </div>
                                <button
                                  onClick={() => setSelectedLevel(null)}
                                  className="text-gray-400 hover:text-white transition-colors p-1"
                                >
                                  <ChevronUp className="w-5 h-5" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                {/* Characteristics */}
                                <div className="bg-white/5 rounded-lg p-4">
                                  <h5 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3 font-diatype flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Key Characteristics
                                  </h5>
                                  <ul className="space-y-2">
                                    {level.characteristics.map((char, idx) => (
                                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-300 font-diatype">
                                        <span className="text-cyan-400 mt-1">•</span>
                                        {char}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Typical Behaviors */}
                                <div className="bg-white/5 rounded-lg p-4">
                                  <h5 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3 font-diatype flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Typical Behaviors
                                  </h5>
                                  <ul className="space-y-2">
                                    {level.typicalBehaviors.map((behavior, idx) => (
                                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-300 font-diatype">
                                        <span className="text-purple-400 mt-1">•</span>
                                        {behavior}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Time to Next Level */}
                                <div className="bg-white/5 rounded-lg p-4">
                                  <h5 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-3 font-diatype flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Time to Next Level
                                  </h5>
                                  <p className="text-lg font-semibold text-green-400 font-gendy mb-2">
                                    {level.timeToNext}
                                  </p>
                                  {level.level === glueiqData.maturityLevel && (
                                    <p className="text-xs text-gray-400 font-diatype">
                                      With focused effort, GlueIQ can reach Level 1 (AI Curious) within 1-3 months.
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Progress Indicator for current level */}
                              {level.current && (
                                <div className="mt-4 p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                                  <div className="flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-orange-400" />
                                    <div>
                                      <p className="text-sm font-semibold text-orange-300 font-diatype">This is GlueIQ's current maturity level</p>
                                      <p className="text-xs text-gray-400 font-diatype mt-1">
                                        Based on 9 C-suite interviews totaling 10.5 hours of assessment data
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Recommended AI Champions Section */}
                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white font-gendy flex items-center gap-2">
                    <Star className="w-5 h-5 text-cyan-400 fill-cyan-400/30" />
                    Recommended AI Champions
                  </h3>
                  <p className="text-xs text-gray-400 font-diatype">Based on change readiness & potential</p>
                </div>

                {/* Top 3 Champions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {(() => {
                    const getChampionScore = (profile: typeof glueiqData.skillProfiles[0]) => {
                      let score = profile.psychology.changeReadiness
                      if (profile.psychology.aiAnxiety === 'low') score += 20
                      else if (profile.psychology.aiAnxiety === 'medium') score += 10
                      if (profile.potential) score += 15
                      return score
                    }
                    const topChampions = [...glueiqData.skillProfiles]
                      .sort((a, b) => getChampionScore(b) - getChampionScore(a))
                      .slice(0, 3)

                    return topChampions.map((champion, index) => (
                      <motion.div
                        key={champion.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative bg-gradient-to-br from-cyan-500/10 to-blue-500/5 rounded-xl p-5 border border-cyan-500/30 hover:border-cyan-500/50 transition-all group"
                      >
                        <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                          <span className="text-white font-bold text-sm font-gendy">#{index + 1}</span>
                        </div>
                        <div className="flex items-start gap-3 mb-4 pt-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center font-gendy text-sm font-bold text-white">
                            {champion.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white font-diatype">{champion.name}</h4>
                            <p className="text-xs text-gray-400 font-diatype">{champion.title}</p>
                          </div>
                          {champion.potential && (
                            <Star className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                          )}
                        </div>
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-400 font-diatype">Change Readiness</span>
                            <span className="text-cyan-400 font-semibold font-diatype">{champion.psychology.changeReadiness}%</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${champion.psychology.changeReadiness}%` }}
                              transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                            />
                          </div>
                        </div>
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 font-diatype mb-1">Key Motivator</p>
                          <p className="text-sm text-gray-300 font-diatype line-clamp-2">{champion.psychology.keyMotivator}</p>
                        </div>
                        <div className="mb-4">
                          <p className="text-xs text-cyan-400 font-diatype mb-1">How to Engage</p>
                          <p className="text-xs text-gray-400 font-diatype line-clamp-2">
                            {champion.psychology.recommendedApproach.length > 100
                              ? champion.psychology.recommendedApproach.substring(0, 100) + '...'
                              : champion.psychology.recommendedApproach}
                          </p>
                        </div>
                        <div className="relative">
                          <div className="flex items-center gap-1 text-xs text-gray-500 font-diatype cursor-help group/tooltip">
                            <HelpCircle className="w-3 h-3" />
                            <span>Why them?</span>
                            <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 rounded-lg border border-cyan-500/30 shadow-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10">
                              <p className="text-xs text-cyan-400 font-semibold mb-2 font-diatype">Champion Strengths:</p>
                              <ul className="space-y-1 text-xs text-gray-300 font-diatype">
                                <li className="flex items-start gap-1">
                                  <span className="text-cyan-400">+</span>
                                  {champion.psychology.aiAnxiety === 'low' ? 'Low AI anxiety - ready to embrace change' : 'Manageable AI concerns'}
                                </li>
                                <li className="flex items-start gap-1">
                                  <span className="text-cyan-400">+</span>
                                  {champion.psychology.changeReadiness >= 70 ? 'High change readiness' : 'Good change readiness'}
                                </li>
                                <li className="flex items-start gap-1">
                                  <span className="text-cyan-400">+</span>
                                  {champion.psychology.thinkingStyle.split(' - ')[0]}
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  })()}
                </div>

                {/* Key Blockers Subsection */}
                <div className="border-t border-white/10 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                    <h4 className="text-md font-semibold text-white font-gendy">Key Blockers to Address</h4>
                  </div>
                  <p className="text-xs text-gray-400 font-diatype mb-4">
                    These team members may require additional support to successfully adopt AI initiatives.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(() => {
                      const getBlockerScore = (profile: typeof glueiqData.skillProfiles[0]) => {
                        let score = 100 - profile.psychology.changeReadiness
                        if (profile.psychology.aiAnxiety === 'high') score += 30
                        else if (profile.psychology.aiAnxiety === 'medium') score += 15
                        return score
                      }
                      const blockers = [...glueiqData.skillProfiles]
                        .sort((a, b) => getBlockerScore(b) - getBlockerScore(a))
                        .slice(0, 2)
                      return blockers.map((blocker, index) => (
                        <motion.div
                          key={blocker.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="bg-gradient-to-br from-orange-500/10 to-red-500/5 rounded-xl p-4 border border-orange-500/30"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center font-gendy text-sm font-bold text-orange-400">
                              {blocker.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-white font-diatype">{blocker.name}</h5>
                              <p className="text-xs text-gray-400 font-diatype">{blocker.title}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500 font-diatype">Readiness</p>
                              <p className={`text-sm font-semibold font-diatype ${
                                blocker.psychology.changeReadiness < 50 ? 'text-red-400' : 'text-yellow-400'
                              }`}>{blocker.psychology.changeReadiness}%</p>
                            </div>
                          </div>
                          <div className="bg-red-500/10 rounded-lg p-3 mb-3 border border-red-500/20">
                            <p className="text-xs text-red-400 font-semibold mb-1 font-diatype">Potential Blocker</p>
                            <p className="text-xs text-gray-300 font-diatype">{blocker.psychology.potentialBlocker}</p>
                          </div>
                          <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                            <p className="text-xs text-green-400 font-semibold mb-1 font-diatype">Suggested Mitigation</p>
                            <p className="text-xs text-gray-300 font-diatype">
                              {blocker.psychology.recommendedApproach.length > 120
                                ? blocker.psychology.recommendedApproach.substring(0, 120) + '...'
                                : blocker.psychology.recommendedApproach}
                            </p>
                          </div>
                        </motion.div>
                      ))
                    })()}
                  </div>
                </div>
                </div>

                {/* ROI Calculator Section */}
                <div className="bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-transparent rounded-2xl p-6 sm:p-8 border border-emerald-500/20">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500">
                      <Calculator className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white font-gendy">ROI Calculator</h3>
                      <p className="text-sm text-gray-400 font-diatype">The business case for AI transformation</p>
                    </div>
                  </div>

                {/* Main ROI Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {/* Current Cost of Inefficiency */}
                  <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-orange-400" />
                      <p className="text-xs text-orange-300 uppercase tracking-wider font-diatype">Current Cost of Inefficiency</p>
                    </div>
                    <div className="text-3xl font-bold text-orange-400 font-gendy">
                      <AnimatedCounter value={glueiqData.roiProjections.currentAnnualCost} prefix="$" duration={2.5} />
                    </div>
                    <p className="text-xs text-gray-500 font-diatype mt-1">Annual estimated loss</p>
                  </div>

                  {/* Projected Annual Savings */}
                  <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <PiggyBank className="w-4 h-4 text-green-400" />
                      <p className="text-xs text-green-300 uppercase tracking-wider font-diatype">Projected Annual Savings</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-green-400 font-gendy">
                          <AnimatedCounter value={glueiqData.roiProjections.projectedSavingsLevel3} prefix="$" duration={2} />
                        </span>
                        <span className="text-xs text-green-300/70 font-diatype">Level 3</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-emerald-400 font-gendy">
                          <AnimatedCounter value={glueiqData.roiProjections.projectedSavingsLevel5} prefix="$" duration={2.2} />
                        </span>
                        <span className="text-xs text-emerald-300/70 font-diatype">Level 5</span>
                      </div>
                    </div>
                  </div>

                  {/* Investment Required */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                      <p className="text-xs text-gray-300 uppercase tracking-wider font-diatype">Investment Required</p>
                    </div>
                    <div className="text-3xl font-bold text-cyan-400 font-gendy">
                      <AnimatedCounter value={glueiqData.roiProjections.investmentRequired} prefix="$" duration={1.8} />
                    </div>
                    <p className="text-xs text-gray-500 font-diatype mt-1">One-time cost</p>
                  </div>

                  {/* Payback Period */}
                  <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <p className="text-xs text-purple-300 uppercase tracking-wider font-diatype">Payback Period</p>
                    </div>
                    <div className="text-3xl font-bold text-purple-400 font-gendy">
                      <AnimatedCounter value={glueiqData.roiProjections.paybackMonths} duration={1.5} />
                      <span className="text-lg ml-1">months</span>
                    </div>
                    <p className="text-xs text-gray-500 font-diatype mt-1">To positive ROI</p>
                  </div>
                </div>

                {/* Bar Chart Comparison */}
                <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                  <h4 className="text-sm font-semibold text-white font-diatype mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                    Financial Impact Comparison
                  </h4>
                  <div className="space-y-4">
                    {/* Current Annual Cost */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400 font-diatype">Current Annual Cost</span>
                        <span className="text-orange-400 font-gendy font-semibold">$2.4M</span>
                      </div>
                      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '75%' }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Investment Required */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400 font-diatype">Investment Required</span>
                        <span className="text-cyan-400 font-gendy font-semibold">$75K</span>
                      </div>
                      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '2.3%' }}
                          transition={{ duration: 1, delay: 0.7 }}
                          className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Year 1 Savings (Level 3) */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400 font-diatype">Year 1 Savings (Level 3)</span>
                        <span className="text-green-400 font-gendy font-semibold">$480K</span>
                      </div>
                      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '15%' }}
                          transition={{ duration: 1, delay: 0.9 }}
                          className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                        />
                      </div>
                    </div>

                    {/* 5-Year ROI */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400 font-diatype">5-Year ROI</span>
                        <span className="text-emerald-400 font-gendy font-semibold">$3.2M</span>
                      </div>
                      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 1.2, delay: 1.1 }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Note */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-gray-500 font-diatype flex items-center gap-2">
                      <Info className="w-3 h-3 flex-shrink-0" />
                      Estimates based on industry benchmarks for agencies of similar size
                    </p>
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
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white font-gendy">Leadership Team AI Profiles</h2>
                  <p className="text-sm text-gray-400 font-diatype">Click a profile to view psychological insights</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {glueiqData.skillProfiles.map((profile, index) => (
                    <motion.div
                      key={profile.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                      onClick={() => setSelectedPerson(selectedPerson === profile.name ? null : profile.name)}
                      className={`cursor-pointer bg-white/5 rounded-xl p-5 border ${
                        selectedPerson === profile.name ? 'border-cyan-500/50 ring-2 ring-cyan-500/30' :
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

                      {/* Change Readiness Indicator */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-500 font-diatype">Change Readiness</span>
                          <span className={`font-semibold font-diatype ${
                            profile.psychology.changeReadiness >= 70 ? 'text-green-400' :
                            profile.psychology.changeReadiness >= 50 ? 'text-yellow-400' : 'text-red-400'
                          }`}>{profile.psychology.changeReadiness}%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              profile.psychology.changeReadiness >= 70 ? 'bg-green-500' :
                              profile.psychology.changeReadiness >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${profile.psychology.changeReadiness}%` }}
                          />
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

                      <div className="flex items-center justify-between">
                        <div className={`text-xs font-diatype px-2 py-1 rounded inline-flex items-center gap-1 ${
                          profile.growth === 'high' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          <TrendingUp className="w-3 h-3" />
                          {profile.growth.toUpperCase()} growth
                        </div>
                        <div className={`text-xs font-diatype px-2 py-1 rounded ${
                          profile.psychology.aiAnxiety === 'low' ? 'bg-green-500/10 text-green-400' :
                          profile.psychology.aiAnxiety === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                          'bg-red-500/10 text-red-400'
                        }`}>
                          {profile.psychology.aiAnxiety.toUpperCase()} anxiety
                        </div>
                      </div>

                      {/* Expanded Psychological Profile */}
                      <AnimatePresence>
                        {selectedPerson === profile.name && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-4 pt-4 border-t border-white/10 space-y-4"
                          >
                            {/* Thinking Style */}
                            <div className="bg-white/5 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Brain className="w-4 h-4 text-purple-400" />
                                <h5 className="text-xs font-semibold text-purple-400 font-diatype">Thinking Style</h5>
                              </div>
                              <p className="text-xs text-gray-300 font-diatype">{profile.psychology.thinkingStyle}</p>
                            </div>

                            {/* Communication Style */}
                            <div className="bg-white/5 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="w-4 h-4 text-cyan-400" />
                                <h5 className="text-xs font-semibold text-cyan-400 font-diatype">Communication Style</h5>
                              </div>
                              <p className="text-xs text-gray-300 font-diatype">{profile.psychology.communicationStyle}</p>
                            </div>

                            {/* Key Motivator & Blocker */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-green-500/5 rounded-lg p-3 border border-green-500/20">
                                <h5 className="text-[10px] font-semibold text-green-400 uppercase tracking-wider mb-1 font-diatype">Key Motivator</h5>
                                <p className="text-xs text-gray-300 font-diatype">{profile.psychology.keyMotivator}</p>
                              </div>
                              <div className="bg-red-500/5 rounded-lg p-3 border border-red-500/20">
                                <h5 className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-1 font-diatype">Potential Blocker</h5>
                                <p className="text-xs text-gray-300 font-diatype">{profile.psychology.potentialBlocker}</p>
                              </div>
                            </div>

                            {/* Recommended Approach */}
                            <div className="bg-cyan-500/5 rounded-lg p-3 border border-cyan-500/20">
                              <div className="flex items-center gap-2 mb-2">
                                <Lightbulb className="w-4 h-4 text-cyan-400" />
                                <h5 className="text-xs font-semibold text-cyan-400 font-diatype">Recommended Approach</h5>
                              </div>
                              <p className="text-xs text-gray-300 font-diatype">{profile.psychology.recommendedApproach}</p>
                            </div>

                            {/* Key Quotes */}
                            {profile.keyQuotes && profile.keyQuotes.length > 0 && (
                              <div>
                                <h5 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 font-diatype flex items-center gap-1">
                                  <Quote className="w-3 h-3" /> Key Quotes
                                </h5>
                                <div className="space-y-2">
                                  {profile.keyQuotes.map((quote, idx) => (
                                    <p key={idx} className="text-xs text-gray-400 font-diatype italic pl-3 border-l-2 border-gray-600">
                                      "{quote}"
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
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

            {activeTab === 'processes' && (
              <motion.div
                key="processes"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white font-gendy">Business Process AI Opportunities</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-400 font-diatype">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span> High
                    <span className="w-3 h-3 bg-yellow-500 rounded-full ml-2"></span> Medium
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {glueiqData.businessProcesses.sort((a, b) => a.priority - b.priority).map((process, index) => (
                    <motion.div
                      key={process.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`bg-white/5 rounded-2xl border ${
                        process.aiOpportunity === 'high' ? 'border-green-500/30' : 'border-yellow-500/30'
                      } p-6`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                            process.aiOpportunity === 'high' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {process.priority}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white font-gendy">{process.name}</h3>
                            <p className="text-xs text-gray-400 font-diatype">{process.department} Department</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold font-diatype ${
                          process.aiOpportunity === 'high' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {process.aiOpportunity.toUpperCase()} opportunity
                        </div>
                      </div>

                      <p className="text-sm text-gray-300 font-diatype mb-4">{process.currentState}</p>

                      {/* Automation Potential Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-gray-400 font-diatype">Automation Potential</span>
                          <span className="text-cyan-400 font-semibold font-diatype">{process.automationPotential}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${process.automationPotential}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                          />
                        </div>
                      </div>

                      {/* Pain Points */}
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2 font-diatype">Pain Points</h4>
                        <div className="flex flex-wrap gap-2">
                          {process.painPoints.map((point, idx) => (
                            <span key={idx} className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded-lg font-diatype">
                              {point}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Recommended Tools */}
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2 font-diatype">Recommended AI Tools</h4>
                        <div className="flex flex-wrap gap-2">
                          {process.recommendedTools.map((tool, idx) => (
                            <span key={idx} className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded-lg font-diatype">
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Estimated Savings */}
                      <div className="bg-green-500/5 rounded-lg p-3 border border-green-500/20">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-green-400" />
                          <span className="text-sm font-semibold text-green-400 font-diatype">{process.estimatedTimeSavings}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Process Automation Summary */}
                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl p-6 border border-cyan-500/20">
                  <h3 className="text-xl font-semibold text-white font-gendy mb-4">Automation Impact Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-cyan-400 font-gendy">6</p>
                      <p className="text-xs text-gray-400 font-diatype">Processes Mapped</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-400 font-gendy">4</p>
                      <p className="text-xs text-gray-400 font-diatype">High Opportunity</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-yellow-400 font-gendy">57%</p>
                      <p className="text-xs text-gray-400 font-diatype">Avg Automation Potential</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-400 font-gendy">35%</p>
                      <p className="text-xs text-gray-400 font-diatype">Est. Time Savings</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'departments' && (
              <motion.div
                key="departments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-white font-gendy">Department Analysis</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {glueiqData.departmentAnalysis.map((dept, index) => (
                    <motion.div
                      key={dept.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 rounded-2xl border border-white/10 p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-white font-gendy">{dept.name}</h3>
                            <p className="text-xs text-gray-400 font-diatype">{dept.members.length} team member{dept.members.length !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold font-gendy ${
                            dept.avgMaturity >= 0.5 ? 'text-yellow-400' : 'text-red-400'
                          }`}>{dept.avgMaturity.toFixed(1)}</p>
                          <p className="text-xs text-gray-500 font-diatype">Avg Maturity</p>
                        </div>
                      </div>

                      {/* Team Members */}
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 font-diatype">Team Members</h4>
                        <div className="flex flex-wrap gap-2">
                          {dept.members.map((member) => (
                            <span
                              key={member}
                              className={`px-3 py-1 rounded-full text-xs font-diatype ${
                                member === dept.championCandidate
                                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                  : 'bg-white/5 text-gray-400'
                              }`}
                            >
                              {member}
                              {member === dept.championCandidate && ' *'}
                            </span>
                          ))}
                        </div>
                        {dept.championCandidate && (
                          <p className="text-[10px] text-cyan-400 mt-2 font-diatype">* Recommended AI Champion</p>
                        )}
                      </div>

                      {/* Strengths & Weaknesses */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2 font-diatype">Strengths</h4>
                          <ul className="space-y-1">
                            {dept.strengths.map((str, idx) => (
                              <li key={idx} className="text-xs text-gray-400 font-diatype flex items-start gap-1">
                                <span className="text-green-400">+</span> {str}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2 font-diatype">Gaps</h4>
                          <ul className="space-y-1">
                            {dept.weaknesses.map((weak, idx) => (
                              <li key={idx} className="text-xs text-gray-400 font-diatype flex items-start gap-1">
                                <span className="text-red-400">-</span> {weak}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Priority Actions */}
                      <div className="bg-cyan-500/5 rounded-lg p-4 border border-cyan-500/20">
                        <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2 font-diatype">Priority Actions</h4>
                        <ol className="space-y-2">
                          {dept.priorityActions.map((action, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-300 font-diatype">
                              <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 text-xs text-cyan-400 font-bold">
                                {idx + 1}
                              </span>
                              {action}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Department Comparison Chart */}
                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white font-gendy mb-6">Department Maturity Comparison</h3>
                  <div className="space-y-4">
                    {glueiqData.departmentAnalysis.map((dept) => (
                      <div key={dept.name} className="flex items-center gap-4">
                        <span className="w-24 text-sm text-gray-400 font-diatype">{dept.name}</span>
                        <div className="flex-1 h-4 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(dept.avgMaturity / 10) * 100}%` }}
                            transition={{ duration: 0.8 }}
                            className={`h-full rounded-full ${
                              dept.avgMaturity >= 0.5 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-red-500 to-rose-500'
                            }`}
                          />
                        </div>
                        <span className={`w-12 text-sm font-bold text-right font-diatype ${
                          dept.avgMaturity >= 0.5 ? 'text-yellow-400' : 'text-red-400'
                        }`}>{dept.avgMaturity.toFixed(1)}</span>
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-2xl font-bold text-white font-gendy">30/60/90 Day Action Plan</h2>

                  {/* Overall Progress */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-diatype">Overall Progress</p>
                      <p className="text-lg font-bold text-white font-gendy">{getOverallProgress()}%</p>
                    </div>
                    <div className="w-32 h-3 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${getOverallProgress()}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Phase Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {glueiqData.actionPlan.phases.map((phase, phaseIndex) => (
                    <motion.div
                      key={phase.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: phaseIndex * 0.1 }}
                      className={`bg-gradient-to-br ${getPhaseGradient(phaseIndex)} rounded-2xl p-6 border`}
                    >
                      {/* Phase Header */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`text-lg font-semibold font-gendy ${getPhaseAccent(phaseIndex)}`}>
                            {phase.name}
                          </h3>
                          <span className={`text-sm font-bold font-diatype ${getPhaseAccent(phaseIndex)}`}>
                            {getPhaseProgress(phaseIndex)}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 font-diatype mb-3">{phase.theme}</p>

                        {/* Phase Progress Bar */}
                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${
                              phaseIndex === 0 ? 'bg-gradient-to-r from-cyan-500 to-blue-500' :
                              phaseIndex === 1 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                              'bg-gradient-to-r from-green-500 to-emerald-500'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${getPhaseProgress(phaseIndex)}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          />
                        </div>
                      </div>

                      {/* Tasks */}
                      <div className="space-y-2">
                        {phase.tasks.map((task) => {
                          const isCompleted = completedTasks.has(task.id)
                          return (
                            <motion.div
                              key={task.id}
                              layout
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`p-3 rounded-lg bg-black/20 border border-white/5 transition-all ${
                                isCompleted ? 'opacity-60' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {/* Checkbox */}
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => toggleTaskComplete(task.id)}
                                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                                    isCompleted
                                      ? 'bg-green-500 border-green-500'
                                      : 'border-gray-600 hover:border-gray-400'
                                  }`}
                                >
                                  <AnimatePresence>
                                    {isCompleted && (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                      >
                                        <CheckCircle className="w-3 h-3 text-white" />
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.button>

                                {/* Task Content */}
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium font-diatype ${
                                    isCompleted ? 'text-gray-500 line-through' : 'text-white'
                                  }`}>
                                    {task.task}
                                  </p>

                                  {/* Meta Row */}
                                  <div className="flex flex-wrap items-center gap-2 mt-2">
                                    {/* Owner Badge */}
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-xs text-gray-300 font-diatype">
                                      <User className="w-3 h-3" />
                                      {task.owner}
                                    </span>

                                    {/* Priority Indicator */}
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium font-diatype border ${getPriorityColor(task.priority)}`}>
                                      {task.priority}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl p-8 border border-cyan-500/20 text-center">
                  <h3 className="text-2xl font-bold text-white font-gendy mb-2">Need Help Executing Your Action Plan?</h3>
                  <p className="text-gray-400 font-diatype mb-6">
                    Schedule a strategy session to discuss implementation support and accelerate your AI transformation
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleScheduleCall}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-semibold inline-flex items-center gap-2 font-diatype"
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
    </div>
  )
}
