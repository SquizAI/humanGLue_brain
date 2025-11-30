'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner'
import { NewCommunicationModal } from '@/components/organisms/NewCommunicationModal'
import { Toast, NewsletterPreviewModal, AnalysisModal, ReportsModal } from '@/components/organisms/AIInsightsModals'
import { useChat } from '@/lib/contexts/ChatContext'
import { signOut } from '@/lib/auth/hooks'
import {
  Send,
  Mail,
  Users,
  Building2,
  Sparkles,
  Search,
  Filter,
  SortAsc,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Brain,
  Zap,
  Target,
  BarChart3,
  TrendingUp,
  Eye,
  MousePointerClick,
  ArrowRight,
  Plus,
  Newspaper,
  Globe,
  Star,
  Settings,
  ChevronDown,
  ChevronRight,
  Layers,
  Network,
  Wand2,
  RefreshCw,
  Play,
  Pause,
  Bot,
  MessageSquare,
  Share2,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  X,
  Edit,
  Copy,
  Archive,
  Trash2,
  ExternalLink,
  FileText,
  Timer,
  Check,
  Download,
} from 'lucide-react'

// =============================================================================
// TYPES
// =============================================================================

type CommunicationType = 'all' | 'newsletter' | 'email' | 'social' | 'workshop'
type NewsletterTier = 'master' | 'tailored' | 'organization'
type CommunicationStatus = 'draft' | 'scheduled' | 'sent' | 'paused'
type SortOption = 'date' | 'engagement' | 'tier' | 'status'

interface Communication {
  id: string
  type: CommunicationType
  tier?: NewsletterTier
  title: string
  subject?: string
  preview: string
  status: CommunicationStatus
  scheduledAt?: Date
  sentAt?: Date
  createdAt: Date
  audience: {
    type: 'all' | 'segment' | 'organization' | 'individual'
    count: number
    name?: string
    organizationId?: string
  }
  metrics?: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    unsubscribed: number
  }
  tags: string[]
  aiGenerated?: boolean
  parentId?: string // For newsletter hierarchy
  children?: Communication[]
}

interface AudienceSegment {
  id: string
  name: string
  description: string
  count: number
  criteria: string[]
  icon: React.ReactNode
}

interface AIGeneratedContent {
  type: 'newsletter' | 'analysis' | 'reports'
  content: any
}

// =============================================================================
// MOCK DATA
// =============================================================================

const mockCommunications: Communication[] = [
  {
    id: 'master-1',
    type: 'newsletter',
    tier: 'master',
    title: 'Q1 2025 AI Transformation Insights',
    subject: 'The State of Enterprise AI: What Leaders Need to Know',
    preview: 'This quarter\'s deep dive into AI adoption patterns, emerging technologies, and strategic recommendations for C-suite executives...',
    status: 'sent',
    sentAt: new Date('2025-01-15'),
    createdAt: new Date('2025-01-10'),
    audience: { type: 'all', count: 12450 },
    metrics: { sent: 12450, delivered: 12100, opened: 4840, clicked: 1694, unsubscribed: 12 },
    tags: ['quarterly', 'ai-trends', 'leadership'],
    aiGenerated: false,
    children: [
      {
        id: 'tailored-1a',
        type: 'newsletter',
        tier: 'tailored',
        title: 'AI for Healthcare: Q1 Insights',
        subject: 'Healthcare AI Transformation: Compliance & Innovation',
        preview: 'Tailored insights for healthcare organizations navigating AI adoption while maintaining HIPAA compliance...',
        status: 'sent',
        sentAt: new Date('2025-01-16'),
        createdAt: new Date('2025-01-11'),
        audience: { type: 'segment', count: 2340, name: 'Healthcare' },
        metrics: { sent: 2340, delivered: 2280, opened: 1140, clicked: 456, unsubscribed: 2 },
        tags: ['healthcare', 'hipaa', 'compliance'],
        aiGenerated: true,
        parentId: 'master-1',
      },
      {
        id: 'tailored-1b',
        type: 'newsletter',
        tier: 'tailored',
        title: 'AI for Financial Services: Q1 Insights',
        subject: 'Financial AI Transformation: Risk & Opportunity',
        preview: 'Tailored insights for financial institutions leveraging AI for fraud detection, trading, and customer service...',
        status: 'sent',
        sentAt: new Date('2025-01-16'),
        createdAt: new Date('2025-01-11'),
        audience: { type: 'segment', count: 3120, name: 'Financial Services' },
        metrics: { sent: 3120, delivered: 3050, opened: 1525, clicked: 610, unsubscribed: 3 },
        tags: ['finance', 'risk', 'trading'],
        aiGenerated: true,
        parentId: 'master-1',
      },
    ],
  },
  {
    id: 'org-1',
    type: 'newsletter',
    tier: 'organization',
    title: 'Acme Corp: AI Implementation Update',
    subject: 'Your Q1 Progress Report: AI Maturity Score +15 Points',
    preview: 'Dear Acme Corp team, here\'s your personalized AI transformation progress report with specific recommendations...',
    status: 'sent',
    sentAt: new Date('2025-01-20'),
    createdAt: new Date('2025-01-18'),
    audience: { type: 'organization', count: 45, name: 'Acme Corp', organizationId: 'org-acme' },
    metrics: { sent: 45, delivered: 45, opened: 38, clicked: 22, unsubscribed: 0 },
    tags: ['client-specific', 'progress-report'],
    aiGenerated: true,
    parentId: 'master-1',
  },
  {
    id: 'master-2',
    type: 'newsletter',
    tier: 'master',
    title: 'February Innovation Roundup',
    subject: 'New Features, Success Stories, and AI Best Practices',
    preview: 'Discover the latest platform enhancements, hear from organizations achieving breakthrough results...',
    status: 'scheduled',
    scheduledAt: new Date('2025-02-01'),
    createdAt: new Date('2025-01-25'),
    audience: { type: 'all', count: 12680 },
    tags: ['monthly', 'product-updates', 'success-stories'],
    aiGenerated: false,
  },
  {
    id: 'email-1',
    type: 'email',
    title: 'Expert Recruitment: Dr. Sarah Chen',
    subject: 'Invitation to Join HumanGlue\'s Expert Advisory Network',
    preview: 'Personalized outreach to AI ethics researcher at Stanford, focusing on her recent work on responsible AI...',
    status: 'sent',
    sentAt: new Date('2025-01-22'),
    createdAt: new Date('2025-01-22'),
    audience: { type: 'individual', count: 1, name: 'Dr. Sarah Chen' },
    metrics: { sent: 1, delivered: 1, opened: 1, clicked: 1, unsubscribed: 0 },
    tags: ['recruitment', 'expert', 'ai-ethics'],
    aiGenerated: true,
  },
  {
    id: 'social-1',
    type: 'social',
    title: 'LinkedIn: AI Maturity Framework Launch',
    preview: 'Announcing our new AI Maturity Framework - the definitive guide for organizations embarking on AI transformation...',
    status: 'sent',
    sentAt: new Date('2025-01-18'),
    createdAt: new Date('2025-01-17'),
    audience: { type: 'all', count: 8500 },
    metrics: { sent: 1, delivered: 1, opened: 8500, clicked: 420, unsubscribed: 0 },
    tags: ['linkedin', 'product-launch', 'framework'],
    aiGenerated: false,
  },
  {
    id: 'workshop-1',
    type: 'workshop',
    title: 'AI Strategy Workshop - March Cohort',
    subject: 'Exclusive: AI Strategy Workshop - Limited Seats Available',
    preview: 'Join our hands-on workshop to develop your organization\'s AI transformation roadmap with expert guidance...',
    status: 'scheduled',
    scheduledAt: new Date('2025-03-15'),
    createdAt: new Date('2025-01-20'),
    audience: { type: 'segment', count: 2450, name: 'CTOs & CIOs' },
    tags: ['workshop', 'strategy', 'hands-on'],
    aiGenerated: false,
  },
]

const audienceSegments: AudienceSegment[] = [
  { id: 'all', name: 'All Subscribers', description: 'Complete subscriber base', count: 12680, criteria: ['Active subscription'], icon: <Users className="w-4 h-4" /> },
  { id: 'healthcare', name: 'Healthcare', description: 'Healthcare industry professionals', count: 2340, criteria: ['Industry: Healthcare', 'Role: Executive'], icon: <Building2 className="w-4 h-4" /> },
  { id: 'finance', name: 'Financial Services', description: 'Banking and financial professionals', count: 3120, criteria: ['Industry: Finance', 'Company Size: Enterprise'], icon: <Building2 className="w-4 h-4" /> },
  { id: 'tech', name: 'Technology', description: 'Tech industry leaders', count: 4500, criteria: ['Industry: Technology', 'AI Interest: High'], icon: <Building2 className="w-4 h-4" /> },
  { id: 'cxo', name: 'C-Suite Executives', description: 'CTOs, CIOs, CEOs', count: 1850, criteria: ['Role: C-Suite', 'Decision Maker'], icon: <Star className="w-4 h-4" /> },
]

// =============================================================================
// MOCK AI CONTENT GENERATORS
// =============================================================================

const generateHealthcareNewsletter = () => {
  return {
    title: 'Healthcare AI Innovation: February 2025',
    subject: 'HIPAA-Compliant AI: Your Competitive Advantage',
    preview: 'Discover how leading healthcare organizations are leveraging AI while maintaining compliance...',
    sections: [
      {
        heading: 'Healthcare AI Transformation Update',
        content: 'Leading healthcare organizations are experiencing a 48% increase in operational efficiency through HIPAA-compliant AI implementations. This month, we explore practical strategies for integrating AI into clinical workflows, patient care, and administrative processes.',
      },
      {
        heading: 'Compliance-First AI Solutions',
        content: 'Our latest framework ensures all AI implementations meet HIPAA, HITECH, and state-specific healthcare regulations. Learn how Johns Hopkins and Mayo Clinic are setting new standards in AI-powered diagnostics while maintaining patient privacy.',
      },
      {
        heading: 'Featured Case Study',
        content: 'Regional Health Network reduced patient wait times by 35% using AI-powered scheduling and triage systems. Their approach to change management and staff training provides a blueprint for mid-sized healthcare providers.',
      },
      {
        heading: 'Upcoming Healthcare AI Workshop',
        content: 'Join our exclusive workshop on March 20th: "AI for Healthcare Leaders: From Strategy to Implementation". Limited to 30 participants. Early bird pricing ends February 15th.',
      },
    ],
    callToAction: 'Register for Workshop',
    estimatedEngagement: {
      openRate: '52%',
      clickRate: '24%',
      expectedConversions: 47,
    },
  }
}

const generateFinanceAnalysis = () => {
  return {
    segment: 'Financial Services',
    currentMetrics: {
      openRate: 38,
      clickRate: 12,
      trend: 'declining',
      changePercent: -15,
    },
    rootCauses: [
      {
        issue: 'Content Fatigue',
        impact: 'high' as const,
        description: 'Subscribers receiving similar regulatory compliance content for 3 consecutive months.',
        solution: 'Diversify content mix with innovation stories and practical implementation guides.',
      },
      {
        issue: 'Timing Misalignment',
        impact: 'medium' as const,
        description: 'Emails sent during peak trading hours when target audience is least likely to engage.',
        solution: 'Shift send time to 7:00 AM EST (before market open) based on engagement data.',
      },
      {
        issue: 'Missing Personalization',
        impact: 'high' as const,
        description: 'Generic content not addressing specific roles (Risk Officers vs. Trading Desks vs. Retail Banking).',
        solution: 'Implement role-based content segmentation with personalized subject lines.',
      },
    ],
    recommendations: [
      {
        action: 'Create Role-Specific Variants',
        priority: 'critical' as const,
        expectedImpact: '+22% engagement',
        effort: '3 days',
        details: 'Develop 3 variants: Risk Management AI, Trading Desk Automation, and Customer Service AI.',
      },
      {
        action: 'Optimize Send Schedule',
        priority: 'high' as const,
        expectedImpact: '+8% open rate',
        effort: '1 hour',
        details: 'Reschedule from 2:00 PM to 7:00 AM EST based on timezone analysis.',
      },
      {
        action: 'Add Interactive Elements',
        priority: 'medium' as const,
        expectedImpact: '+15% click rate',
        effort: '2 days',
        details: 'Include AI ROI calculator and fraud detection assessment quiz.',
      },
    ],
    competitorBenchmark: {
      industryAverage: {
        openRate: 42,
        clickRate: 18,
      },
      topPerformer: {
        openRate: 58,
        clickRate: 26,
      },
    },
  }
}

const generateOrganizationReports = () => {
  return [
    {
      organizationId: 'org-acme',
      name: 'Acme Corp',
      reportTitle: 'Q1 2025 AI Maturity Progress Report',
      summary: 'Acme Corp has advanced from Level 2 to Level 3 on the AI Maturity Scale, demonstrating strong leadership commitment and successful pilot implementations.',
      highlights: [
        'AI Maturity Score increased from 62 to 78 (+16 points)',
        'Successfully deployed 3 AI pilot projects across Sales, HR, and Customer Support',
        'Employee AI literacy improved by 45% through training programs',
        '87% executive alignment on AI strategy roadmap',
      ],
      recommendations: [
        'Expand customer support chatbot to handle 70% of Tier 1 inquiries',
        'Initiate data governance framework for enterprise-wide AI deployment',
        'Consider AI ethics committee to guide responsible implementation',
      ],
      nextSteps: [
        'Schedule executive workshop for Q2 strategy alignment',
        'Deploy AI maturity assessment to department heads',
        'Plan organization-specific use case development session',
      ],
    },
    {
      organizationId: 'org-techstart',
      name: 'TechStart Industries',
      reportTitle: 'AI Transformation Readiness Assessment',
      summary: 'TechStart shows high potential for AI adoption with strong technical foundation but needs strategic alignment and change management focus.',
      highlights: [
        'Technical infrastructure rated 9/10 for AI readiness',
        'Data quality and governance scored 7/10',
        'Cultural readiness assessment: 6/10 (improvement area identified)',
        'Budget allocation for AI initiatives increased by 40%',
      ],
      recommendations: [
        'Establish cross-functional AI steering committee',
        'Invest in change management and communication strategy',
        'Prioritize quick-win projects to build organizational momentum',
      ],
      nextSteps: [
        'Executive briefing on AI strategy framework',
        'Department-level opportunity assessment workshops',
        'Baseline metric establishment for ROI tracking',
      ],
    },
    {
      organizationId: 'org-globalbank',
      name: 'Global Bank Holdings',
      reportTitle: 'Regulatory-Compliant AI Roadmap',
      summary: 'Global Bank is positioned to lead in financial services AI with exemplary compliance posture and clear use case prioritization.',
      highlights: [
        'All 5 identified AI projects cleared regulatory review',
        'Fraud detection AI reduced false positives by 34%',
        'Customer service AI handling 62% of inquiries autonomously',
        'Risk assessment models improved prediction accuracy by 28%',
      ],
      recommendations: [
        'Scale fraud detection AI to international operations',
        'Develop AI-powered credit scoring for underserved markets',
        'Implement real-time risk monitoring dashboard for C-suite',
      ],
      nextSteps: [
        'Regulatory technology (RegTech) integration planning',
        'International expansion strategy session',
        'Advanced AI training for risk management team',
      ],
    },
  ]
}

// Alternative insights for refresh functionality
const alternativeInsights = [
  [
    {
      type: 'opportunity',
      icon: <TrendingUp className="w-4 h-4" />,
      title: 'Technology segment showing momentum',
      description: 'Tech industry newsletters have 42% higher click-through rates this week. Consider developing advanced technical content.',
      action: 'Generate Tailored Newsletter',
      actionType: 'newsletter' as const,
    },
    {
      type: 'alert',
      icon: <AlertCircle className="w-4 h-4" />,
      title: 'Workshop registration plateau',
      description: 'March workshop signups flat for 5 days. AI suggests optimizing landing page and adding social proof elements.',
      action: 'Analyze & Suggest',
      actionType: 'analysis' as const,
    },
    {
      type: 'automation',
      icon: <Zap className="w-4 h-4" />,
      title: 'Content repurposing opportunity',
      description: '2 high-performing newsletters can be repurposed into LinkedIn carousel posts with minimal editing.',
      action: 'Generate Reports',
      actionType: 'reports' as const,
    },
  ],
  [
    {
      type: 'opportunity',
      icon: <TrendingUp className="w-4 h-4" />,
      title: 'C-Suite engagement spike detected',
      description: 'Executive-focused content showing 55% increase in saves and shares. Opportunity to create leadership-specific series.',
      action: 'Generate Tailored Newsletter',
      actionType: 'newsletter' as const,
    },
    {
      type: 'alert',
      icon: <AlertCircle className="w-4 h-4" />,
      title: 'Unsubscribe trend in retail sector',
      description: 'Retail industry contacts showing 12% higher unsubscribe rate. Content relevance review recommended.',
      action: 'Analyze & Suggest',
      actionType: 'analysis' as const,
    },
    {
      type: 'automation',
      icon: <Zap className="w-4 h-4" />,
      title: 'Email sequence optimization ready',
      description: '4 organizations completed AI assessments. Automated nurture sequences ready for deployment.',
      action: 'Generate Reports',
      actionType: 'reports' as const,
    },
  ],
]

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const getTierColor = (tier?: NewsletterTier) => {
  switch (tier) {
    case 'master': return { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' }
    case 'tailored': return { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' }
    case 'organization': return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' }
    default: return { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' }
  }
}

const getStatusColor = (status: CommunicationStatus) => {
  switch (status) {
    case 'draft': return { bg: 'bg-gray-500/20', text: 'text-gray-400' }
    case 'scheduled': return { bg: 'bg-blue-500/20', text: 'text-blue-400' }
    case 'sent': return { bg: 'bg-green-500/20', text: 'text-green-400' }
    case 'paused': return { bg: 'bg-amber-500/20', text: 'text-amber-400' }
  }
}

const getTypeIcon = (type: CommunicationType) => {
  switch (type) {
    case 'newsletter': return <Newspaper className="w-4 h-4" />
    case 'email': return <Mail className="w-4 h-4" />
    case 'social': return <Share2 className="w-4 h-4" />
    case 'workshop': return <Calendar className="w-4 h-4" />
    default: return <MessageSquare className="w-4 h-4" />
  }
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const calculateEngagementRate = (metrics?: Communication['metrics']) => {
  if (!metrics || metrics.delivered === 0) return 0
  return Math.round((metrics.opened / metrics.delivered) * 100)
}

// =============================================================================
// COMPONENTS
// =============================================================================

function NewsletterHierarchyCard({ communication, level = 0, onSelect }: {
  communication: Communication
  level?: number
  onSelect: (c: Communication) => void
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const tierColors = getTierColor(communication.tier)
  const statusColors = getStatusColor(communication.status)
  const hasChildren = communication.children && communication.children.length > 0

  return (
    <div className={`${level > 0 ? 'ml-6 border-l border-white/10 pl-4' : ''}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:bg-white/8 transition-all cursor-pointer group"
        onClick={() => onSelect(communication)}
      >
        <div className="flex items-start gap-4">
          {/* Expand/Collapse for hierarchy */}
          {hasChildren && (
            <button
              onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded) }}
              className="p-1 hover:bg-white/10 rounded transition-all mt-1"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
            </button>
          )}

          {/* Type Icon */}
          <div className={`p-2 rounded-lg ${tierColors.bg}`}>
            {communication.tier ? <Layers className={`w-5 h-5 ${tierColors.text}`} /> : getTypeIcon(communication.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {communication.tier && (
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${tierColors.bg} ${tierColors.text} ${tierColors.border} border`}>
                  {communication.tier === 'master' ? 'Master' : communication.tier === 'tailored' ? 'Hyper-Tailored' : 'Org-Specific'}
                </span>
              )}
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                {communication.status}
              </span>
              {communication.aiGenerated && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-cyan-500/20 text-cyan-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI
                </span>
              )}
            </div>

            <h3 className="text-white font-semibold truncate group-hover:text-cyan-400 transition-colors">
              {communication.title}
            </h3>

            {communication.subject && (
              <p className="text-sm text-gray-400 truncate mt-1">{communication.subject}</p>
            )}

            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {communication.audience.count.toLocaleString()} {communication.audience.name || 'recipients'}
              </span>
              <span className="flex items-center gap-1">
                {communication.sentAt ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    Sent {formatDate(communication.sentAt)}
                  </>
                ) : communication.scheduledAt ? (
                  <>
                    <Clock className="w-3 h-3 text-blue-400" />
                    Scheduled {formatDate(communication.scheduledAt)}
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3" />
                    Created {formatDate(communication.createdAt)}
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Metrics */}
          {communication.metrics && (
            <div className="hidden lg:flex items-center gap-4 text-sm">
              <div className="text-center">
                <p className="text-cyan-400 font-semibold">{calculateEngagementRate(communication.metrics)}%</p>
                <p className="text-xs text-gray-500">Open Rate</p>
              </div>
              <div className="text-center">
                <p className="text-green-400 font-semibold">
                  {communication.metrics.delivered > 0
                    ? Math.round((communication.metrics.clicked / communication.metrics.delivered) * 100)
                    : 0}%
                </p>
                <p className="text-xs text-gray-500">Click Rate</p>
              </div>
            </div>
          )}

          {/* Action Arrow */}
          <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
        </div>
      </motion.div>

      {/* Render children */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 space-y-2"
          >
            {communication.children!.map((child) => (
              <NewsletterHierarchyCard
                key={child.id}
                communication={child}
                level={level + 1}
                onSelect={onSelect}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function AgenticInsightsPanel() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentInsightSet, setCurrentInsightSet] = useState(0)
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [generatedContent, setGeneratedContent] = useState<AIGeneratedContent | null>(null)

  const insightSets = [
    [
      {
        type: 'opportunity',
        icon: <TrendingUp className="w-4 h-4" />,
        title: 'High engagement in Healthcare segment',
        description: 'Healthcare newsletters show 48% higher open rates. Consider creating more tailored content for this segment.',
        action: 'Generate Tailored Newsletter',
        actionType: 'newsletter' as const,
      },
      {
        type: 'alert',
        icon: <AlertCircle className="w-4 h-4" />,
        title: 'Declining engagement in Finance',
        description: 'Financial Services segment shows 15% drop in clicks. AI suggests refreshing content strategy.',
        action: 'Analyze & Suggest',
        actionType: 'analysis' as const,
      },
      {
        type: 'automation',
        icon: <Zap className="w-4 h-4" />,
        title: 'Ready for automation',
        description: '3 organizations ready for personalized progress reports based on their AI maturity scores.',
        action: 'Generate Reports',
        actionType: 'reports' as const,
      },
    ],
    ...alternativeInsights,
  ]

  const currentInsights = insightSets[currentInsightSet]

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setCurrentInsightSet((prev) => (prev + 1) % insightSets.length)
    setIsRefreshing(false)
    setShowToast({ message: 'Insights refreshed successfully', type: 'success' })
  }

  const handleGenerate = async (actionType: 'newsletter' | 'analysis' | 'reports') => {
    setIsGenerating(actionType)

    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2500))

    let content: AIGeneratedContent

    switch (actionType) {
      case 'newsletter':
        content = { type: 'newsletter', content: generateHealthcareNewsletter() }
        setShowToast({ message: 'Newsletter generated successfully!', type: 'success' })
        break
      case 'analysis':
        content = { type: 'analysis', content: generateFinanceAnalysis() }
        setShowToast({ message: 'Analysis complete!', type: 'success' })
        break
      case 'reports':
        content = { type: 'reports', content: generateOrganizationReports() }
        setShowToast({ message: '3 reports generated successfully!', type: 'success' })
        break
    }

    setGeneratedContent(content)
    setIsGenerating(null)
  }

  const handleUseContent = () => {
    setShowToast({ message: 'Content saved to drafts!', type: 'success' })
    setGeneratedContent(null)
  }

  const handleRegenerate = async () => {
    if (!generatedContent) return

    const currentType = generatedContent.type
    setGeneratedContent(null)
    await handleGenerate(currentType)
  }

  const handleDownloadReport = (reportId: string) => {
    setShowToast({ message: 'Report downloaded successfully!', type: 'success' })
  }

  return (
    <>
      <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            <h3 className="text-white font-semibold">Agentic Insights</h3>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-all disabled:opacity-50"
            title="Refresh insights"
          >
            <RefreshCw className={`w-4 h-4 text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {currentInsights.map((insight, i) => (
              <motion.div
                key={`${currentInsightSet}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 rounded-lg p-3"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-lg ${
                    insight.type === 'opportunity' ? 'bg-green-500/20 text-green-400' :
                    insight.type === 'alert' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-cyan-500/20 text-cyan-400'
                  }`}>
                    {insight.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">{insight.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{insight.description}</p>
                    <button
                      onClick={() => handleGenerate(insight.actionType)}
                      disabled={isGenerating !== null}
                      className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      {isGenerating === insight.actionType ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3 h-3" />
                          {insight.action}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Toast Notifications */}
      <AnimatePresence>
        {showToast && (
          <Toast
            message={showToast.message}
            type={showToast.type}
            onClose={() => setShowToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Generated Content Modals */}
      <AnimatePresence>
        {generatedContent?.type === 'newsletter' && (
          <NewsletterPreviewModal
            content={generatedContent.content}
            onClose={() => setGeneratedContent(null)}
            onUse={handleUseContent}
            onRegenerate={handleRegenerate}
          />
        )}
        {generatedContent?.type === 'analysis' && (
          <AnalysisModal
            content={generatedContent.content}
            onClose={() => setGeneratedContent(null)}
            onUse={handleUseContent}
          />
        )}
        {generatedContent?.type === 'reports' && (
          <ReportsModal
            reports={generatedContent.content}
            onClose={() => setGeneratedContent(null)}
            onDownload={handleDownloadReport}
          />
        )}
      </AnimatePresence>
    </>
  )
}

function QuickStats({ communications }: { communications: Communication[] }) {
  const stats = useMemo(() => {
    const sent = communications.filter(c => c.status === 'sent')
    const totalSent = sent.reduce((sum, c) => sum + (c.metrics?.sent || 0), 0)
    const totalDelivered = sent.reduce((sum, c) => sum + (c.metrics?.delivered || 0), 0)
    const totalOpened = sent.reduce((sum, c) => sum + (c.metrics?.opened || 0), 0)
    const totalClicked = sent.reduce((sum, c) => sum + (c.metrics?.clicked || 0), 0)

    return {
      totalCommunications: communications.length,
      sentCount: sent.length,
      avgOpenRate: totalDelivered > 0 ? Math.round((totalOpened / totalDelivered) * 100) : 0,
      avgClickRate: totalDelivered > 0 ? Math.round((totalClicked / totalDelivered) * 100) : 0,
      scheduled: communications.filter(c => c.status === 'scheduled').length,
      drafts: communications.filter(c => c.status === 'draft').length,
    }
  }, [communications])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-2 text-gray-400 mb-2">
          <Send className="w-4 h-4" />
          <span className="text-xs">Total Sent</span>
        </div>
        <p className="text-2xl font-bold text-white">{stats.sentCount}</p>
      </div>
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-2 text-gray-400 mb-2">
          <Eye className="w-4 h-4" />
          <span className="text-xs">Avg Open Rate</span>
        </div>
        <p className="text-2xl font-bold text-cyan-400">{stats.avgOpenRate}%</p>
      </div>
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-2 text-gray-400 mb-2">
          <MousePointerClick className="w-4 h-4" />
          <span className="text-xs">Avg Click Rate</span>
        </div>
        <p className="text-2xl font-bold text-green-400">{stats.avgClickRate}%</p>
      </div>
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-2 text-gray-400 mb-2">
          <Clock className="w-4 h-4" />
          <span className="text-xs">Scheduled</span>
        </div>
        <p className="text-2xl font-bold text-blue-400">{stats.scheduled}</p>
      </div>
    </div>
  )
}

function CommunicationDetailSlideout({
  communication,
  onClose,
  allCommunications,
}: {
  communication: Communication
  onClose: () => void
  allCommunications: Communication[]
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(communication.preview)
  const [timeUntilSend, setTimeUntilSend] = useState('')

  // Countdown timer for scheduled communications
  useEffect(() => {
    if (communication.status === 'scheduled' && communication.scheduledAt) {
      const updateTimer = () => {
        const now = new Date().getTime()
        const target = communication.scheduledAt!.getTime()
        const diff = target - now

        if (diff <= 0) {
          setTimeUntilSend('Sending now...')
          return
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        if (days > 0) {
          setTimeUntilSend(`${days}d ${hours}h ${minutes}m`)
        } else if (hours > 0) {
          setTimeUntilSend(`${hours}h ${minutes}m ${seconds}s`)
        } else {
          setTimeUntilSend(`${minutes}m ${seconds}s`)
        }
      }

      updateTimer()
      const interval = setInterval(updateTimer, 1000)
      return () => clearInterval(interval)
    }
  }, [communication.status, communication.scheduledAt])

  // Find parent and children in hierarchy
  const parent = communication.parentId
    ? allCommunications.find(c => c.id === communication.parentId)
    : null
  const children = communication.children || []

  // Mock data for analytics (opens over time)
  const mockOpenRateData = [
    { hour: '0h', opens: 0 },
    { hour: '2h', opens: 120 },
    { hour: '4h', opens: 450 },
    { hour: '6h', opens: 980 },
    { hour: '8h', opens: 1420 },
    { hour: '12h', opens: 2340 },
    { hour: '24h', opens: 3200 },
    { hour: '48h', opens: 4100 },
    { hour: '72h', opens: communication.metrics?.opened || 4840 },
  ]

  const canEdit = communication.status === 'draft' || communication.status === 'scheduled'

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
      />

      {/* Slideout Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-full md:w-[600px] lg:w-[700px] bg-gray-900 border-l border-white/10 z-50 overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-xl border-b border-white/10 p-4 z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={`p-2 rounded-lg ${getTierColor(communication.tier).bg} flex-shrink-0`}>
                {getTypeIcon(communication.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-white truncate">{communication.title}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {communication.tier && (
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTierColor(communication.tier).bg} ${getTierColor(communication.tier).text} ${getTierColor(communication.tier).border} border`}>
                      {communication.tier === 'master' ? 'Master' : communication.tier === 'tailored' ? 'Hyper-Tailored' : 'Org-Specific'}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(communication.status).bg} ${getStatusColor(communication.status).text}`}>
                    {communication.status}
                  </span>
                  {communication.aiGenerated && (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-cyan-500/20 text-cyan-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Generated
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-all flex-shrink-0 ml-2"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Countdown Timer for Scheduled */}
          {communication.status === 'scheduled' && communication.scheduledAt && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Timer className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-400">Scheduled to send in</p>
                  <p className="text-2xl font-bold text-blue-400 font-mono">{timeUntilSend}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(communication.scheduledAt)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Subject */}
          {communication.subject && (
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Subject Line</label>
              {canEdit && isEditing ? (
                <input
                  type="text"
                  defaultValue={communication.subject}
                  className="w-full mt-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              ) : (
                <p className="text-white font-medium mt-2 leading-relaxed">{communication.subject}</p>
              )}
            </div>
          )}

          {/* Content */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
              {communication.status === 'draft' ? 'Draft Content' : 'Message Content'}
            </label>
            {canEdit && isEditing ? (
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={8}
                className="w-full mt-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
              />
            ) : (
              <div className="mt-2 p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-gray-300 leading-relaxed">{communication.preview}</p>
              </div>
            )}
          </div>

          {/* Newsletter Hierarchy */}
          {(parent || children.length > 0) && (
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" />
                Newsletter Hierarchy
              </label>
              <div className="mt-3 space-y-2">
                {/* Parent */}
                {parent && (
                  <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <div className="flex items-center gap-2 text-xs text-purple-400 mb-1">
                      <ChevronRight className="w-3 h-3" />
                      Parent Newsletter
                    </div>
                    <p className="text-white font-medium text-sm">{parent.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{parent.tier === 'master' ? 'Master Template' : 'Parent'}</p>
                  </div>
                )}

                {/* Current */}
                {parent && (
                  <div className="pl-4 border-l-2 border-cyan-500/30">
                    <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                      <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1">
                        <ChevronRight className="w-3 h-3" />
                        Current Newsletter
                      </div>
                      <p className="text-white font-medium text-sm">{communication.title}</p>
                    </div>
                  </div>
                )}

                {/* Children */}
                {children.length > 0 && (
                  <div className="pl-4 border-l-2 border-amber-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-amber-400">
                      <ChevronRight className="w-3 h-3" />
                      {children.length} Derived Variant{children.length > 1 ? 's' : ''}
                    </div>
                    {children.map((child) => (
                      <div key={child.id} className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <p className="text-white font-medium text-sm">{child.title}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {child.audience.name || 'Audience'} • {child.audience.count.toLocaleString()} recipients
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Audience Info */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Target Audience</label>
            <div className="mt-2 p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{communication.audience.name || 'All Subscribers'}</p>
                  <p className="text-sm text-gray-400">{communication.audience.count.toLocaleString()} recipients</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="text-sm text-cyan-400 capitalize">{communication.audience.type.replace('-', ' ')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics - Only for Sent */}
          {communication.status === 'sent' && communication.metrics && (
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5" />
                Performance Analytics
              </label>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-gray-400">Open Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-cyan-400">{calculateEngagementRate(communication.metrics)}%</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {communication.metrics.opened.toLocaleString()} / {communication.metrics.delivered.toLocaleString()} opened
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MousePointerClick className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-gray-400">Click Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-green-400">
                    {Math.round((communication.metrics.clicked / communication.metrics.delivered) * 100)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {communication.metrics.clicked.toLocaleString()} clicks
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Send className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-gray-400">Delivery Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {Math.round((communication.metrics.delivered / communication.metrics.sent) * 100)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {communication.metrics.delivered.toLocaleString()} delivered
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-gray-400">Unsubscribes</span>
                  </div>
                  <p className="text-2xl font-bold text-red-400">{communication.metrics.unsubscribed}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {((communication.metrics.unsubscribed / communication.metrics.sent) * 100).toFixed(2)}% rate
                  </p>
                </div>
              </div>

              {/* Opens Over Time Chart (Mock) */}
              <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  Opens Over Time
                </h4>
                <div className="h-40 flex items-end justify-between gap-2">
                  {mockOpenRateData.map((point, i) => {
                    const maxOpens = Math.max(...mockOpenRateData.map(p => p.opens))
                    const height = (point.opens / maxOpens) * 100
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t transition-all hover:opacity-80" style={{ height: `${height}%` }} />
                        <span className="text-[10px] text-gray-500">{point.hour}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Click Heatmap Mock */}
              <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4 text-green-400" />
                  Click Heatmap
                </h4>
                <div className="space-y-2">
                  {['CTA Button - Learn More', 'Workshop Registration Link', 'Case Study Download', 'Footer - Social Links'].map((item, i) => {
                    const clicks = [456, 234, 123, 67][i]
                    const percent = Math.round((clicks / communication.metrics!.clicked) * 100)
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-400">{item}</span>
                          <span className="text-green-400 font-semibold">{clicks} clicks</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Recipient Breakdown */}
              <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  Recipient Breakdown
                </h4>
                <div className="space-y-2">
                  {[
                    { label: 'Engaged', count: communication.metrics.opened, color: 'cyan' },
                    { label: 'Clicked', count: communication.metrics.clicked, color: 'green' },
                    { label: 'Unopened', count: communication.metrics.delivered - communication.metrics.opened, color: 'gray' },
                    { label: 'Bounced', count: communication.metrics.sent - communication.metrics.delivered, color: 'amber' },
                  ].map((segment) => (
                    <div key={segment.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full bg-${segment.color}-400`} />
                        <span className="text-sm text-gray-300">{segment.label}</span>
                      </div>
                      <span className="text-sm text-white font-semibold">{segment.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Tags</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {communication.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-xs font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Metadata */}
          <div className="pt-4 border-t border-white/10">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs">Created</p>
                <p className="text-white">{formatDate(communication.createdAt)}</p>
              </div>
              {communication.sentAt && (
                <div>
                  <p className="text-gray-500 text-xs">Sent</p>
                  <p className="text-white">{formatDate(communication.sentAt)}</p>
                </div>
              )}
              {communication.scheduledAt && !communication.sentAt && (
                <div>
                  <p className="text-gray-500 text-xs">Scheduled</p>
                  <p className="text-white">{formatDate(communication.scheduledAt)}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500 text-xs">Communication Type</p>
                <p className="text-white capitalize">{communication.type}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Sticky Footer */}
        <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-xl border-t border-white/10 p-4">
          {isEditing ? (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditedContent(communication.preview)
                }}
                className="flex-1 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Save logic here
                  setIsEditing(false)
                }}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition-all"
              >
                Save Changes
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {canEdit && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                )}
                <button className="py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium transition-all flex items-center justify-center gap-2">
                  <Copy className="w-4 h-4" />
                  Duplicate
                </button>
                <button className="py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium transition-all flex items-center justify-center gap-2">
                  <Archive className="w-4 h-4" />
                  Archive
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>

              {/* Special Actions */}
              {communication.tier === 'master' && (
                <button className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  <Wand2 className="w-4 h-4" />
                  Generate Tailored Variants
                </button>
              )}

              {communication.status === 'sent' && (
                <button className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium transition-all flex items-center justify-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  View Full Report
                </button>
              )}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-20"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-800 border border-white/10 rounded-xl p-6 max-w-md w-full"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-red-500/20 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">Delete Communication?</h3>
                    <p className="text-sm text-gray-400">
                      Are you sure you want to delete "{communication.title}"? This action cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Delete logic here
                      setShowDeleteConfirm(false)
                      onClose()
                    }}
                    className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 rounded-lg text-white font-medium transition-all"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function CommunicationsHubPage() {
  const { userData, authLoading } = useChat()
  const [showContent, setShowContent] = useState(false)

  // Filter & Sort state
  const [typeFilter, setTypeFilter] = useState<CommunicationType>('all')
  const [tierFilter, setTierFilter] = useState<NewsletterTier | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<CommunicationStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('date')
  const [showFilters, setShowFilters] = useState(false)

  // View state
  const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null)
  const [isAutoPilot, setIsAutoPilot] = useState(false)
  const [showNewCommunicationModal, setShowNewCommunicationModal] = useState(false)

  // Auth check
  useEffect(() => {
    if (!authLoading && userData?.isAdmin) {
      setShowContent(true)
      return
    }
    const timeout = setTimeout(() => {
      console.log('[CommunicationsHub] Auth timeout - trusting middleware protection')
      setShowContent(true)
    }, 3000)
    return () => clearTimeout(timeout)
  }, [authLoading, userData])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      await signOut()
      localStorage.removeItem('humanglue_user')
      localStorage.removeItem('demoUser')
      document.cookie = 'demoUser=; path=/; max-age=0'
      localStorage.removeItem('sb-egqqdscvxvtwcdwknbnt-auth-token')
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      window.location.href = '/login'
    }
  }

  // Flatten communications for filtering (include children)
  const allCommunications = useMemo(() => {
    const flattened: Communication[] = []
    mockCommunications.forEach(c => {
      flattened.push(c)
      if (c.children) {
        c.children.forEach(child => flattened.push(child))
      }
    })
    return flattened
  }, [])

  // Filter and sort communications
  const filteredCommunications = useMemo(() => {
    let filtered = typeFilter === 'all'
      ? mockCommunications
      : mockCommunications.filter(c => c.type === typeFilter)

    if (tierFilter !== 'all') {
      filtered = filtered.filter(c => c.tier === tierFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.preview.toLowerCase().includes(query) ||
        c.tags.some(t => t.toLowerCase().includes(query))
      )
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return (b.sentAt || b.scheduledAt || b.createdAt).getTime() -
                 (a.sentAt || a.scheduledAt || a.createdAt).getTime()
        case 'engagement':
          return calculateEngagementRate(b.metrics) - calculateEngagementRate(a.metrics)
        case 'tier':
          const tierOrder = { master: 0, tailored: 1, organization: 2 }
          return (tierOrder[a.tier || 'organization'] || 3) - (tierOrder[b.tier || 'organization'] || 3)
        case 'status':
          const statusOrder = { scheduled: 0, draft: 1, sent: 2, paused: 3 }
          return statusOrder[a.status] - statusOrder[b.status]
        default:
          return 0
      }
    })

    return filtered
  }, [typeFilter, tierFilter, statusFilter, searchQuery, sortBy])

  if (!showContent) {
    return (
      <div className="min-h-screen bg-black">
        <DashboardSidebar onLogout={handleLogout} />
        <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 flex items-center justify-center min-h-screen">
          <LoadingSpinner variant="neural" size="xl" text="Loading communications hub..." />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        {/* Header */}
        <div className="bg-black/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl">
                  <Network className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white font-gendy">Communications Hub</h1>
                  <p className="text-sm text-gray-400 font-diatype">
                    Multi-level AI-powered communication management
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAutoPilot(!isAutoPilot)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                    isAutoPilot
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30'
                  }`}
                >
                  {isAutoPilot ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isAutoPilot ? 'Auto-Pilot On' : 'Auto-Pilot'}</span>
                </button>
                <button
                  onClick={() => setShowNewCommunicationModal(true)}
                  className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 hover:opacity-90 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Communication</span>
                </button>
              </div>
            </div>

            {/* Type Tabs */}
            <div className="flex items-center gap-1 mt-4 overflow-x-auto">
              {[
                { type: 'all' as const, label: 'All', icon: <Layers className="w-4 h-4" /> },
                { type: 'newsletter' as const, label: 'Newsletters', icon: <Newspaper className="w-4 h-4" /> },
                { type: 'email' as const, label: 'Emails', icon: <Mail className="w-4 h-4" /> },
                { type: 'social' as const, label: 'Social', icon: <Share2 className="w-4 h-4" /> },
                { type: 'workshop' as const, label: 'Workshops', icon: <Calendar className="w-4 h-4" /> },
              ].map((tab) => (
                <button
                  key={tab.type}
                  onClick={() => setTypeFilter(tab.type)}
                  className={`px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 rounded-lg whitespace-nowrap ${
                    typeFilter === tab.type
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Stats */}
          <QuickStats communications={allCommunications} />

          {/* Filter Bar */}
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search communications, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                showFilters ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {(tierFilter !== 'all' || statusFilter !== 'all') && (
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
              )}
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="date">Sort by Date</option>
              <option value="engagement">Sort by Engagement</option>
              <option value="tier">Sort by Tier</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xl"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Tier Filter */}
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Newsletter Tier</label>
                    <div className="flex flex-wrap gap-2">
                      {['all', 'master', 'tailored', 'organization'].map((tier) => (
                        <button
                          key={tier}
                          onClick={() => setTierFilter(tier as NewsletterTier | 'all')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            tierFilter === tier
                              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                              : 'bg-white/5 text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          {tier === 'all' ? 'All Tiers' : tier === 'master' ? 'Master' : tier === 'tailored' ? 'Hyper-Tailored' : 'Org-Specific'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Status</label>
                    <div className="flex flex-wrap gap-2">
                      {['all', 'draft', 'scheduled', 'sent', 'paused'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setStatusFilter(status as CommunicationStatus | 'all')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            statusFilter === status
                              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                              : 'bg-white/5 text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setTierFilter('all')
                        setStatusFilter('all')
                        setSearchQuery('')
                      }}
                      className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content Grid */}
          <div className="mt-6 grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Communications List */}
            <div className="xl:col-span-3 space-y-4">
              {typeFilter === 'newsletter' && tierFilter === 'all' ? (
                // Show hierarchical view for newsletters
                <>
                  <div className="flex items-center gap-2 text-gray-400 mb-4">
                    <Layers className="w-4 h-4" />
                    <span className="text-sm">Newsletter Hierarchy View</span>
                  </div>
                  {filteredCommunications
                    .filter(c => c.tier === 'master')
                    .map((communication) => (
                      <NewsletterHierarchyCard
                        key={communication.id}
                        communication={communication}
                        onSelect={setSelectedCommunication}
                      />
                    ))}
                  {/* Organization-specific newsletters without master */}
                  {filteredCommunications
                    .filter(c => c.tier === 'organization' && !c.parentId)
                    .map((communication) => (
                      <NewsletterHierarchyCard
                        key={communication.id}
                        communication={communication}
                        onSelect={setSelectedCommunication}
                      />
                    ))}
                </>
              ) : (
                // Flat list view
                filteredCommunications.map((communication) => (
                  <motion.div
                    key={communication.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:bg-white/8 transition-all cursor-pointer group"
                    onClick={() => setSelectedCommunication(communication)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${getTierColor(communication.tier).bg}`}>
                        {getTypeIcon(communication.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(communication.status).bg} ${getStatusColor(communication.status).text}`}>
                            {communication.status}
                          </span>
                          {communication.aiGenerated && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-cyan-500/20 text-cyan-400 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              AI
                            </span>
                          )}
                        </div>

                        <h3 className="text-white font-semibold truncate group-hover:text-cyan-400 transition-colors">
                          {communication.title}
                        </h3>

                        <p className="text-sm text-gray-400 truncate mt-1">{communication.preview}</p>

                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {communication.audience.count.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(communication.sentAt || communication.scheduledAt || communication.createdAt)}
                          </span>
                        </div>
                      </div>

                      {communication.metrics && (
                        <div className="hidden lg:flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <p className="text-cyan-400 font-semibold">{calculateEngagementRate(communication.metrics)}%</p>
                            <p className="text-xs text-gray-500">Open</p>
                          </div>
                        </div>
                      )}

                      <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </motion.div>
                ))
              )}

              {filteredCommunications.length === 0 && (
                <div className="text-center py-12">
                  <Mail className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No communications found</h3>
                  <p className="text-gray-400">Try adjusting your filters or create a new communication</p>
                </div>
              )}
            </div>

            {/* Sidebar - Agentic Insights */}
            <div className="xl:col-span-1 space-y-6">
              <AgenticInsightsPanel />

              {/* Audience Segments */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyan-400" />
                  Audience Segments
                </h3>
                <div className="space-y-2">
                  {audienceSegments.slice(0, 5).map((segment) => (
                    <div
                      key={segment.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                    >
                      <div className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded">
                        {segment.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{segment.name}</p>
                        <p className="text-xs text-gray-500">{segment.count.toLocaleString()} subscribers</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Channels */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-cyan-400" />
                  Social Channels
                </h3>
                <div className="space-y-2">
                  {[
                    { icon: <Linkedin className="w-4 h-4" />, name: 'LinkedIn', followers: '8.5K' },
                    { icon: <Twitter className="w-4 h-4" />, name: 'Twitter', followers: '4.2K' },
                    { icon: <Instagram className="w-4 h-4" />, name: 'Instagram', followers: '2.1K' },
                    { icon: <Youtube className="w-4 h-4" />, name: 'YouTube', followers: '1.8K' },
                  ].map((channel) => (
                    <div
                      key={channel.name}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                    >
                      <div className="p-1.5 bg-white/10 text-gray-300 rounded">
                        {channel.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white">{channel.name}</p>
                      </div>
                      <span className="text-xs text-gray-500">{channel.followers}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Communication Detail Slideout */}
      <AnimatePresence>
        {selectedCommunication && (
          <CommunicationDetailSlideout
            communication={selectedCommunication}
            onClose={() => setSelectedCommunication(null)}
            allCommunications={allCommunications}
          />
        )}
      </AnimatePresence>

      {/* New Communication Modal */}
      <NewCommunicationModal
        isOpen={showNewCommunicationModal}
        onClose={() => setShowNewCommunicationModal(false)}
        audienceSegments={audienceSegments}
      />
    </div>
  )
}
