/**
 * AI-Powered Recommendation Engine
 *
 * Generates personalized, actionable recommendations based on:
 * - Assessment scores and gaps
 * - Industry context
 * - Company size and maturity
 * - Historical improvement patterns
 */

import { createClient } from '@/lib/supabase/server'
import { getMaturityLevel } from './scoring-engine'
import { getIndustryBenchmark } from './industry-benchmarks'

export interface Recommendation {
  id: string
  category: 'training' | 'process' | 'technology' | 'culture' | 'leadership' | 'measurement'
  priority: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  rationale: string
  expectedImpact: {
    dimension: string
    potentialGain: number
    timeframe: string
  }
  actionItems: Array<{
    action: string
    owner: string
    deadline: string
  }>
  resources?: Array<{
    type: 'course' | 'article' | 'tool' | 'template' | 'service'
    title: string
    url?: string
    description: string
  }>
  relatedDimensions: string[]
  estimatedEffort: 'low' | 'medium' | 'high'
  estimatedCost: 'free' | 'low' | 'medium' | 'high'
}

export interface RecommendationPlan {
  assessmentId: string
  organizationId?: string
  generatedAt: string
  overallStrategy: string
  quickWins: Recommendation[]
  mediumTermGoals: Recommendation[]
  longTermInitiatives: Recommendation[]
  priorityMatrix: Array<{
    recommendation: string
    impact: number
    effort: number
    priority: number
  }>
  implementationRoadmap: Array<{
    phase: number
    name: string
    duration: string
    recommendations: string[]
    milestones: string[]
  }>
}

// Recommendation templates by dimension and maturity level
const RECOMMENDATION_TEMPLATES: Record<string, Record<string, Recommendation[]>> = {
  individual: {
    low: [
      {
        id: 'ind-low-1',
        category: 'training',
        priority: 'critical',
        title: 'Launch AI Literacy Program',
        description:
          'Implement a foundational AI literacy program for all employees to build basic understanding of AI concepts, capabilities, and limitations.',
        rationale:
          'Low individual scores indicate a fundamental gap in AI understanding that must be addressed before more advanced initiatives.',
        expectedImpact: {
          dimension: 'individual',
          potentialGain: 15,
          timeframe: '3 months',
        },
        actionItems: [
          { action: 'Select AI fundamentals course provider', owner: 'L&D Team', deadline: '2 weeks' },
          { action: 'Create learning path for all employees', owner: 'L&D Team', deadline: '1 month' },
          { action: 'Set participation targets and tracking', owner: 'HR', deadline: '1 month' },
        ],
        resources: [
          {
            type: 'course',
            title: 'AI Fundamentals for Everyone',
            description: 'Self-paced course covering basic AI concepts',
          },
        ],
        relatedDimensions: ['cultural', 'velocity'],
        estimatedEffort: 'medium',
        estimatedCost: 'medium',
      },
      {
        id: 'ind-low-2',
        category: 'culture',
        priority: 'high',
        title: 'Address AI Anxiety',
        description:
          'Create safe spaces for employees to discuss AI concerns and develop communication strategies to address fear and uncertainty.',
        rationale:
          'Fear of AI often prevents adoption. Addressing anxiety directly accelerates individual readiness.',
        expectedImpact: {
          dimension: 'individual',
          potentialGain: 10,
          timeframe: '2 months',
        },
        actionItems: [
          { action: 'Host town hall on AI and job security', owner: 'Leadership', deadline: '2 weeks' },
          { action: 'Create FAQ document addressing common concerns', owner: 'Comms Team', deadline: '3 weeks' },
          { action: 'Establish AI mentorship program', owner: 'HR', deadline: '1 month' },
        ],
        resources: [],
        relatedDimensions: ['cultural', 'leadership'],
        estimatedEffort: 'low',
        estimatedCost: 'free',
      },
    ],
    medium: [
      {
        id: 'ind-med-1',
        category: 'training',
        priority: 'high',
        title: 'Advanced AI Skills Development',
        description:
          'Provide role-specific AI training to help employees apply AI tools effectively in their daily work.',
        rationale:
          'Employees have basic awareness but need practical skills to integrate AI into their workflows.',
        expectedImpact: {
          dimension: 'individual',
          potentialGain: 12,
          timeframe: '4 months',
        },
        actionItems: [
          { action: 'Identify key use cases per role', owner: 'Department Heads', deadline: '2 weeks' },
          { action: 'Develop role-specific training modules', owner: 'L&D Team', deadline: '2 months' },
          { action: 'Create certification program', owner: 'L&D Team', deadline: '3 months' },
        ],
        resources: [
          {
            type: 'tool',
            title: 'AI Prompt Library',
            description: 'Curated prompts for common work tasks',
          },
        ],
        relatedDimensions: ['velocity', 'embedding'],
        estimatedEffort: 'medium',
        estimatedCost: 'medium',
      },
    ],
    high: [
      {
        id: 'ind-high-1',
        category: 'culture',
        priority: 'medium',
        title: 'AI Innovation Champions Program',
        description:
          'Identify and empower AI champions to drive peer learning and innovation across the organization.',
        rationale:
          'High individual scores indicate readiness for advanced initiatives. Champions can accelerate organization-wide adoption.',
        expectedImpact: {
          dimension: 'individual',
          potentialGain: 8,
          timeframe: '6 months',
        },
        actionItems: [
          { action: 'Identify top AI performers', owner: 'HR', deadline: '2 weeks' },
          { action: 'Create champion certification program', owner: 'L&D Team', deadline: '1 month' },
          { action: 'Establish peer mentoring system', owner: 'Champions', deadline: '2 months' },
        ],
        resources: [],
        relatedDimensions: ['cultural', 'leadership'],
        estimatedEffort: 'low',
        estimatedCost: 'low',
      },
    ],
  },
  leadership: {
    low: [
      {
        id: 'lead-low-1',
        category: 'leadership',
        priority: 'critical',
        title: 'Executive AI Immersion',
        description:
          'Conduct intensive AI education for executive team to build understanding and commitment to AI transformation.',
        rationale:
          'Leadership buy-in is essential for AI success. Low leadership scores indicate a critical gap that will block all other initiatives.',
        expectedImpact: {
          dimension: 'leadership',
          potentialGain: 20,
          timeframe: '2 months',
        },
        actionItems: [
          { action: 'Schedule executive AI workshop', owner: 'CEO', deadline: '2 weeks' },
          { action: 'Arrange industry peer visits', owner: 'Strategy Team', deadline: '1 month' },
          { action: 'Define leadership AI KPIs', owner: 'CEO', deadline: '6 weeks' },
        ],
        resources: [
          {
            type: 'service',
            title: 'Executive AI Coaching',
            description: 'One-on-one coaching for senior leaders',
          },
        ],
        relatedDimensions: ['cultural', 'embedding'],
        estimatedEffort: 'medium',
        estimatedCost: 'high',
      },
    ],
    medium: [
      {
        id: 'lead-med-1',
        category: 'leadership',
        priority: 'high',
        title: 'Visible AI Leadership',
        description:
          'Ensure leaders actively demonstrate AI usage and communicate AI strategy regularly.',
        rationale:
          'Employees follow leadership example. Visible AI use by leaders accelerates adoption.',
        expectedImpact: {
          dimension: 'leadership',
          potentialGain: 15,
          timeframe: '3 months',
        },
        actionItems: [
          { action: 'Leaders share AI wins in all-hands', owner: 'Executive Team', deadline: 'Ongoing' },
          { action: 'Create leadership AI usage dashboard', owner: 'IT', deadline: '1 month' },
          { action: 'Include AI in leadership communications', owner: 'Comms Team', deadline: 'Immediate' },
        ],
        resources: [],
        relatedDimensions: ['cultural', 'individual'],
        estimatedEffort: 'low',
        estimatedCost: 'free',
      },
    ],
    high: [
      {
        id: 'lead-high-1',
        category: 'leadership',
        priority: 'medium',
        title: 'AI Governance Board',
        description:
          'Establish cross-functional AI governance to guide strategic AI investments and manage risks.',
        rationale:
          'Strong leadership enables advanced governance structures that ensure sustainable AI growth.',
        expectedImpact: {
          dimension: 'leadership',
          potentialGain: 10,
          timeframe: '4 months',
        },
        actionItems: [
          { action: 'Define governance charter', owner: 'CTO', deadline: '1 month' },
          { action: 'Appoint board members', owner: 'CEO', deadline: '2 weeks' },
          { action: 'Establish meeting cadence', owner: 'Board Chair', deadline: '1 month' },
        ],
        resources: [],
        relatedDimensions: ['embedding', 'cultural'],
        estimatedEffort: 'medium',
        estimatedCost: 'low',
      },
    ],
  },
  cultural: {
    low: [
      {
        id: 'cult-low-1',
        category: 'culture',
        priority: 'critical',
        title: 'Build Psychological Safety for AI',
        description:
          'Create an environment where employees feel safe to experiment with AI without fear of failure or judgment.',
        rationale:
          'Low cultural scores indicate fear or resistance. Psychological safety is the foundation for AI adoption.',
        expectedImpact: {
          dimension: 'cultural',
          potentialGain: 18,
          timeframe: '3 months',
        },
        actionItems: [
          { action: 'Train managers on supporting AI experimentation', owner: 'HR', deadline: '1 month' },
          { action: 'Create "safe to fail" policy for AI', owner: 'Leadership', deadline: '2 weeks' },
          { action: 'Celebrate learning from AI failures', owner: 'All Managers', deadline: 'Ongoing' },
        ],
        resources: [],
        relatedDimensions: ['individual', 'leadership'],
        estimatedEffort: 'medium',
        estimatedCost: 'free',
      },
    ],
    medium: [
      {
        id: 'cult-med-1',
        category: 'culture',
        priority: 'high',
        title: 'AI Community of Practice',
        description:
          'Establish internal community for sharing AI experiments, learnings, and best practices.',
        rationale:
          'Peer learning accelerates cultural adoption. Communities create sustainable knowledge sharing.',
        expectedImpact: {
          dimension: 'cultural',
          potentialGain: 12,
          timeframe: '4 months',
        },
        actionItems: [
          { action: 'Launch Slack/Teams channel for AI', owner: 'IT', deadline: '1 week' },
          { action: 'Schedule monthly AI show-and-tell', owner: 'L&D Team', deadline: '2 weeks' },
          { action: 'Create AI wiki for best practices', owner: 'Community Lead', deadline: '1 month' },
        ],
        resources: [],
        relatedDimensions: ['individual', 'velocity'],
        estimatedEffort: 'low',
        estimatedCost: 'free',
      },
    ],
    high: [
      {
        id: 'cult-high-1',
        category: 'culture',
        priority: 'medium',
        title: 'AI Innovation Lab',
        description:
          'Create dedicated space and time for AI experimentation and innovation.',
        rationale:
          'Strong cultural readiness enables advanced innovation structures.',
        expectedImpact: {
          dimension: 'cultural',
          potentialGain: 10,
          timeframe: '6 months',
        },
        actionItems: [
          { action: 'Allocate innovation budget', owner: 'Finance', deadline: '1 month' },
          { action: 'Define innovation lab charter', owner: 'Innovation Lead', deadline: '2 months' },
          { action: 'Launch first cohort of projects', owner: 'Lab Team', deadline: '3 months' },
        ],
        resources: [],
        relatedDimensions: ['embedding', 'velocity'],
        estimatedEffort: 'high',
        estimatedCost: 'high',
      },
    ],
  },
  embedding: {
    low: [
      {
        id: 'emb-low-1',
        category: 'process',
        priority: 'critical',
        title: 'AI Process Assessment',
        description:
          'Conduct comprehensive review of business processes to identify highest-value AI integration opportunities.',
        rationale:
          'Low embedding scores indicate AI is not integrated into work. Process assessment identifies where to start.',
        expectedImpact: {
          dimension: 'embedding',
          potentialGain: 15,
          timeframe: '2 months',
        },
        actionItems: [
          { action: 'Map current business processes', owner: 'Process Team', deadline: '3 weeks' },
          { action: 'Score processes for AI potential', owner: 'AI Team', deadline: '1 month' },
          { action: 'Prioritize top 5 processes', owner: 'Leadership', deadline: '6 weeks' },
        ],
        resources: [
          {
            type: 'template',
            title: 'AI Process Assessment Framework',
            description: 'Structured framework for evaluating AI opportunities',
          },
        ],
        relatedDimensions: ['velocity', 'leadership'],
        estimatedEffort: 'medium',
        estimatedCost: 'low',
      },
    ],
    medium: [
      {
        id: 'emb-med-1',
        category: 'technology',
        priority: 'high',
        title: 'AI Integration Roadmap',
        description:
          'Develop phased plan to integrate AI into core systems and workflows.',
        rationale:
          'Systematic integration ensures sustainable AI embedding across the organization.',
        expectedImpact: {
          dimension: 'embedding',
          potentialGain: 18,
          timeframe: '6 months',
        },
        actionItems: [
          { action: 'Define integration architecture', owner: 'CTO', deadline: '1 month' },
          { action: 'Create integration standards', owner: 'Tech Lead', deadline: '2 months' },
          { action: 'Pilot first integration', owner: 'Dev Team', deadline: '3 months' },
        ],
        resources: [],
        relatedDimensions: ['velocity', 'measurement'],
        estimatedEffort: 'high',
        estimatedCost: 'medium',
      },
    ],
    high: [
      {
        id: 'emb-high-1',
        category: 'technology',
        priority: 'medium',
        title: 'AI-Native Processes',
        description:
          'Redesign core processes to be AI-native, not just AI-augmented.',
        rationale:
          'High embedding readiness enables fundamental process transformation.',
        expectedImpact: {
          dimension: 'embedding',
          potentialGain: 12,
          timeframe: '9 months',
        },
        actionItems: [
          { action: 'Identify processes for redesign', owner: 'Process Lead', deadline: '1 month' },
          { action: 'Design AI-native workflows', owner: 'Innovation Team', deadline: '3 months' },
          { action: 'Implement and measure', owner: 'Ops Team', deadline: '6 months' },
        ],
        resources: [],
        relatedDimensions: ['velocity', 'cultural'],
        estimatedEffort: 'high',
        estimatedCost: 'high',
      },
    ],
  },
  velocity: {
    low: [
      {
        id: 'vel-low-1',
        category: 'process',
        priority: 'high',
        title: 'Streamline AI Approval Process',
        description:
          'Simplify and accelerate the process for evaluating and approving AI tools and projects.',
        rationale:
          'Low velocity often indicates bureaucratic barriers. Streamlined approval enables faster experimentation.',
        expectedImpact: {
          dimension: 'velocity',
          potentialGain: 20,
          timeframe: '2 months',
        },
        actionItems: [
          { action: 'Document current approval process', owner: 'Process Team', deadline: '1 week' },
          { action: 'Identify bottlenecks', owner: 'Process Team', deadline: '2 weeks' },
          { action: 'Create fast-track approval tier', owner: 'Leadership', deadline: '1 month' },
        ],
        resources: [],
        relatedDimensions: ['leadership', 'embedding'],
        estimatedEffort: 'low',
        estimatedCost: 'free',
      },
    ],
    medium: [
      {
        id: 'vel-med-1',
        category: 'technology',
        priority: 'high',
        title: 'AI Sandbox Environment',
        description:
          'Create secure sandbox environment where teams can experiment with AI without risk.',
        rationale:
          'Sandboxes enable rapid experimentation while maintaining security and compliance.',
        expectedImpact: {
          dimension: 'velocity',
          potentialGain: 15,
          timeframe: '3 months',
        },
        actionItems: [
          { action: 'Define sandbox requirements', owner: 'Security Team', deadline: '2 weeks' },
          { action: 'Set up sandbox environment', owner: 'IT', deadline: '1 month' },
          { action: 'Create usage guidelines', owner: 'AI Team', deadline: '6 weeks' },
        ],
        resources: [],
        relatedDimensions: ['embedding', 'cultural'],
        estimatedEffort: 'medium',
        estimatedCost: 'medium',
      },
    ],
    high: [
      {
        id: 'vel-high-1',
        category: 'measurement',
        priority: 'medium',
        title: 'AI Acceleration Metrics',
        description:
          'Implement metrics to continuously measure and improve AI adoption velocity.',
        rationale:
          'High velocity organizations need metrics to maintain momentum and identify slowdowns.',
        expectedImpact: {
          dimension: 'velocity',
          potentialGain: 8,
          timeframe: '4 months',
        },
        actionItems: [
          { action: 'Define velocity KPIs', owner: 'Analytics Team', deadline: '2 weeks' },
          { action: 'Build velocity dashboard', owner: 'BI Team', deadline: '1 month' },
          { action: 'Establish review cadence', owner: 'Leadership', deadline: '6 weeks' },
        ],
        resources: [],
        relatedDimensions: ['leadership', 'embedding'],
        estimatedEffort: 'low',
        estimatedCost: 'low',
      },
    ],
  },
}

/**
 * Generate personalized recommendations for an assessment
 */
export async function generateRecommendations(
  assessmentId: string
): Promise<RecommendationPlan> {
  const supabase = await createClient()

  // Get assessment and scores
  const { data: assessment } = await supabase
    .from('assessments')
    .select('*, organizations(id, industry, employee_count)')
    .eq('id', assessmentId)
    .single()

  if (!assessment) {
    throw new Error('Assessment not found')
  }

  const dimensions = {
    individual: assessment.individual_score || 0,
    leadership: assessment.leadership_score || 0,
    cultural: assessment.cultural_score || 0,
    embedding: assessment.embedding_score || 0,
    velocity: assessment.velocity_score || 0,
  }

  // Get industry context
  let industryBenchmark = null
  if (assessment.organizations?.industry) {
    industryBenchmark = await getIndustryBenchmark(assessment.organizations.industry)
  }

  // Select recommendations based on scores
  const allRecommendations: Recommendation[] = []

  for (const [dimension, score] of Object.entries(dimensions)) {
    const level = score < 40 ? 'low' : score < 70 ? 'medium' : 'high'
    const templates = RECOMMENDATION_TEMPLATES[dimension]?.[level] || []

    // Adjust recommendations based on industry context
    const adjustedTemplates = templates.map((r) => ({
      ...r,
      // Increase priority if below industry benchmark
      priority:
        industryBenchmark &&
        score < (industryBenchmark.averageMaturityLevel * 10) - 10 &&
        r.priority !== 'critical'
          ? 'high'
          : r.priority,
    }))

    allRecommendations.push(...adjustedTemplates)
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  allRecommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  // Categorize recommendations
  const quickWins = allRecommendations.filter(
    (r) => r.estimatedEffort === 'low' && r.estimatedCost !== 'high'
  )
  const mediumTermGoals = allRecommendations.filter(
    (r) => r.estimatedEffort === 'medium' || (r.priority === 'high' && r.estimatedEffort !== 'low')
  )
  const longTermInitiatives = allRecommendations.filter(
    (r) => r.estimatedEffort === 'high' || r.estimatedCost === 'high'
  )

  // Create priority matrix
  const priorityMatrix = allRecommendations.slice(0, 10).map((r) => {
    const impact = r.expectedImpact.potentialGain
    const effort = r.estimatedEffort === 'low' ? 2 : r.estimatedEffort === 'medium' ? 5 : 8
    return {
      recommendation: r.title,
      impact,
      effort,
      priority: impact / effort,
    }
  })
  priorityMatrix.sort((a, b) => b.priority - a.priority)

  // Generate implementation roadmap
  const implementationRoadmap = [
    {
      phase: 1,
      name: 'Foundation',
      duration: '0-3 months',
      recommendations: quickWins.slice(0, 3).map((r) => r.title),
      milestones: [
        'Complete initial training programs',
        'Establish communication channels',
        'Launch pilot projects',
      ],
    },
    {
      phase: 2,
      name: 'Acceleration',
      duration: '3-6 months',
      recommendations: mediumTermGoals.slice(0, 3).map((r) => r.title),
      milestones: [
        'Achieve 50% participation in AI programs',
        'Complete process assessments',
        'Establish governance framework',
      ],
    },
    {
      phase: 3,
      name: 'Transformation',
      duration: '6-12 months',
      recommendations: longTermInitiatives.slice(0, 2).map((r) => r.title),
      milestones: [
        'AI integrated into core processes',
        'Achieve target maturity level',
        'Demonstrate measurable ROI',
      ],
    },
  ]

  // Generate overall strategy
  const overallScore = assessment.overall_score || 0
  const maturityLevel = getMaturityLevel(overallScore)

  let overallStrategy = ''
  if (maturityLevel.level < 3) {
    overallStrategy = `Focus on building foundational AI literacy and leadership buy-in. Your current ${maturityLevel.name} level indicates the organization is in early stages of AI readiness. Prioritize cultural change and basic skills development before investing in advanced technology.`
  } else if (maturityLevel.level < 6) {
    overallStrategy = `Balance quick wins with strategic investments. At the ${maturityLevel.name} level, your organization has basic AI awareness but needs to scale adoption. Focus on integrating AI into core processes while continuing to build capabilities.`
  } else {
    overallStrategy = `Drive innovation and optimization. Your ${maturityLevel.name} level indicates strong AI maturity. Focus on advanced use cases, continuous improvement, and becoming an industry leader in AI adoption.`
  }

  return {
    assessmentId,
    organizationId: assessment.organization_id,
    generatedAt: new Date().toISOString(),
    overallStrategy,
    quickWins,
    mediumTermGoals,
    longTermInitiatives,
    priorityMatrix,
    implementationRoadmap,
  }
}

/**
 * Get recommendations for a specific dimension
 */
export async function getDimensionRecommendations(
  assessmentId: string,
  dimension: string
): Promise<Recommendation[]> {
  const plan = await generateRecommendations(assessmentId)
  const allRecs = [...plan.quickWins, ...plan.mediumTermGoals, ...plan.longTermInitiatives]
  return allRecs.filter((r) => r.relatedDimensions.includes(dimension))
}
