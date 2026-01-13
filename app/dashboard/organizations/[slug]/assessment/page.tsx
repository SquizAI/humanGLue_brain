'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
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
  ExternalLink,
  Share2,
  FileText,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'

// Types for organization assessment data
interface MaturityScore {
  dimension: string
  score: number
  evidence: string[]
  confidence: number
  gaps?: string[]
  nextSteps?: string[]
}

interface ConsensusTheme {
  name: string
  frequency: number
  sentiment: number
  quotes: string[]
  interviewees: string[]
}

interface RealityGap {
  dimension: string
  leadershipPerception: number
  actualEvidence: number
  gap: number
  evidence: {
    supporting: string[]
    contradicting: string[]
  }
}

interface TeamMember {
  name: string
  title: string
  department?: string
  aiSkillLevel: string
  isChampion?: boolean
}

interface KeyMetric {
  label: string
  value: string
  trend: 'up' | 'down' | 'stable'
  benchmark?: string
}

interface Recommendations {
  immediate: string[]
  shortTerm: string[]
  longTerm: string[]
}

interface OrganizationAssessment {
  organization: {
    id: string
    name: string
    slug: string
    industry: string
    size: string
    logo?: string
  }
  summary: {
    executiveSummary: string
    assessmentDate: string
    interviewCount: number
    totalMinutes: number
    confidenceLevel: number
    keyMetrics: KeyMetric[]
  }
  maturity: {
    overallScore: number
    levelName: string
    levelDescription: string
    dimensionScores: MaturityScore[]
    benchmarkComparison: {
      industryAverage: number
      percentile: number
      rank: string
    }
  }
  themes: ConsensusTheme[]
  gaps: RealityGap[]
  recommendations: Recommendations
  team: TeamMember[]
  riskAnalysis?: {
    high: string[]
    medium: string[]
    low: string[]
  }
}

// Maturity level definitions
const maturityLevels = [
  { level: -2, name: 'Resistant', color: 'red' },
  { level: -1, name: 'Skeptical', color: 'orange' },
  { level: 0, name: 'Unaware', color: 'yellow' },
  { level: 1, name: 'Curious', color: 'lime' },
  { level: 2, name: 'Experimenting', color: 'green' },
  { level: 3, name: 'Connecting', color: 'teal' },
  { level: 4, name: 'Collaborating', color: 'cyan' },
  { level: 5, name: 'Integrating', color: 'blue' },
  { level: 6, name: 'Orchestrating', color: 'indigo' },
  { level: 7, name: 'Leading', color: 'violet' },
  { level: 8, name: 'Innovating', color: 'purple' },
  { level: 9, name: 'Transforming', color: 'fuchsia' },
  { level: 10, name: 'Transcending', color: 'pink' },
]

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  skills_talent: <Users className="w-5 h-5" />,
  ai_use_cases: <Zap className="w-5 h-5" />,
  strategy_alignment: <Target className="w-5 h-5" />,
  process_optimization: <Cog className="w-5 h-5" />,
  ai_governance: <Shield className="w-5 h-5" />,
  leadership_vision: <Lightbulb className="w-5 h-5" />,
  culture_change: <Users className="w-5 h-5" />,
  integration_capability: <Database className="w-5 h-5" />,
}

export default function OrganizationAssessmentPage() {
  const router = useRouter()
  const params = useParams()
  const orgSlug = params?.slug as string

  const [assessment, setAssessment] = useState<OrganizationAssessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'dimensions' | 'themes' | 'gaps' | 'recommendations' | 'team'>('overview')
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null)

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  // Fetch organization assessment data
  const fetchAssessment = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [summaryRes, maturityRes, themesRes, gapsRes, recommendationsRes, teamRes] = await Promise.all([
        fetch(`/api/organizations/${orgSlug}/assessment-summary`),
        fetch(`/api/organizations/${orgSlug}/maturity-scores`),
        fetch(`/api/organizations/${orgSlug}/consensus-themes`),
        fetch(`/api/organizations/${orgSlug}/reality-gaps`),
        fetch(`/api/organizations/${orgSlug}/recommendations`),
        fetch(`/api/organizations/${orgSlug}/team-skills`),
      ])

      // Check for errors
      if (!summaryRes.ok) {
        if (summaryRes.status === 404) {
          throw new Error('Organization not found')
        }
        throw new Error('Failed to load assessment')
      }

      const [summaryData, maturityData, themesData, gapsData, recommendationsData, teamData] = await Promise.all([
        summaryRes.json(),
        maturityRes.json(),
        themesRes.json(),
        gapsRes.json(),
        recommendationsRes.json(),
        teamRes.json(),
      ])

      // Combine all data into assessment object
      setAssessment({
        organization: summaryData.data?.organization || {},
        summary: summaryData.data?.summary || {},
        maturity: maturityData.data || {},
        themes: themesData.data || [],
        gaps: gapsData.data || [],
        recommendations: recommendationsData.data || {},
        team: teamData.data || [],
      })
    } catch (err) {
      console.error('Error fetching assessment:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [orgSlug])

  useEffect(() => {
    if (orgSlug) {
      fetchAssessment()
    }
  }, [orgSlug, fetchAssessment])

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'from-green-500 to-emerald-500'
    if (score >= 5) return 'from-cyan-500 to-blue-500'
    if (score >= 3) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-pink-500'
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-400" />
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-400" />
    return <span className="w-4 h-4 text-gray-400">—</span>
  }

  const formatDimensionName = (dimension: string) => {
    return dimension
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <DashboardSidebar onLogout={handleLogout} />
        <div className="lg:ml-[var(--sidebar-width,280px)] transition-all">
          <main className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-screen">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading assessment data...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <DashboardSidebar onLogout={handleLogout} />
        <div className="lg:ml-[var(--sidebar-width,280px)] transition-all">
          <main className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-screen">
            <div className="text-center max-w-md">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Unable to Load Assessment</h2>
              <p className="text-gray-400 mb-4">{error}</p>
              <button
                onClick={fetchAssessment}
                className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!assessment) return null

  return (
    <div className="min-h-screen bg-black">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all">
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 pb-20 lg:pb-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-xl p-6 border border-cyan-500/20"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white font-gendy">
                    {assessment.organization.name}
                  </h1>
                  <p className="text-gray-400 text-sm">
                    {assessment.organization.industry} • {assessment.organization.size} employees
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Assessment: {assessment.summary.assessmentDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
              </div>
            </div>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
              {assessment.summary.keyMetrics?.map((metric, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-500 text-xs">{metric.label}</span>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <p className="text-white font-bold text-lg">{metric.value}</p>
                  {metric.benchmark && (
                    <p className="text-gray-500 text-xs">{metric.benchmark}</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'dimensions', label: 'Dimensions', icon: Target },
              { id: 'themes', label: 'Themes', icon: MessageSquare },
              { id: 'gaps', label: 'Reality Gaps', icon: AlertCircle },
              { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
              { id: 'team', label: 'Team', icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Overall Maturity Score */}
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 bg-white/5 rounded-xl p-6 border border-white/10">
                    <h3 className="text-gray-400 text-sm mb-4">Overall AI Maturity</h3>
                    <div className="relative w-40 h-40 mx-auto">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          fill="none"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="12"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          fill="none"
                          stroke="url(#scoreGradient)"
                          strokeWidth="12"
                          strokeDasharray={`${(assessment.maturity.overallScore / 10) * 440} 440`}
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#06b6d4" />
                            <stop offset="100%" stopColor="#3b82f6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-white">
                          {assessment.maturity.overallScore.toFixed(1)}
                        </span>
                        <span className="text-gray-400 text-sm">/10</span>
                      </div>
                    </div>
                    <div className="text-center mt-4">
                      <p className="text-xl font-bold text-white">{assessment.maturity.levelName}</p>
                      <p className="text-gray-500 text-sm mt-1">{assessment.maturity.levelDescription}</p>
                    </div>
                  </div>

                  {/* Benchmark Comparison */}
                  <div className="lg:col-span-1 bg-white/5 rounded-xl p-6 border border-white/10">
                    <h3 className="text-gray-400 text-sm mb-4">Industry Benchmark</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Your Score</span>
                          <span className="text-cyan-400">{assessment.maturity.overallScore.toFixed(1)}</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                            style={{ width: `${(assessment.maturity.overallScore / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Industry Average</span>
                          <span className="text-gray-300">{assessment.maturity.benchmarkComparison?.industryAverage?.toFixed(1) || 'N/A'}</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gray-500 rounded-full"
                            style={{ width: `${((assessment.maturity.benchmarkComparison?.industryAverage || 0) / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/10">
                        <p className="text-gray-400 text-sm">Percentile Rank</p>
                        <p className="text-2xl font-bold text-white">
                          {assessment.maturity.benchmarkComparison?.percentile || 'N/A'}
                          <span className="text-gray-500 text-base">th</span>
                        </p>
                        <p className="text-gray-500 text-xs">{assessment.maturity.benchmarkComparison?.rank}</p>
                      </div>
                    </div>
                  </div>

                  {/* Executive Summary */}
                  <div className="lg:col-span-1 bg-white/5 rounded-xl p-6 border border-white/10">
                    <h3 className="text-gray-400 text-sm mb-4">Executive Summary</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {assessment.summary.executiveSummary}
                    </p>
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {assessment.summary.interviewCount} interviews
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {Math.round(assessment.summary.totalMinutes / 60)}+ hours
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dimension Scores Preview */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">Dimension Scores</h3>
                    <button
                      onClick={() => setActiveTab('dimensions')}
                      className="text-cyan-400 text-sm hover:underline flex items-center gap-1"
                    >
                      View Details <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {assessment.maturity.dimensionScores?.slice(0, 8).map((dim) => (
                      <div key={dim.dimension} className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {categoryIcons[dim.dimension] || <Brain className="w-5 h-5 text-gray-400" />}
                          <span className="text-gray-300 text-sm">{formatDimensionName(dim.dimension)}</span>
                        </div>
                        <div className="flex items-end gap-2">
                          <span className={`text-2xl font-bold bg-gradient-to-r ${getScoreColor(dim.score)} bg-clip-text text-transparent`}>
                            {dim.score.toFixed(1)}
                          </span>
                          <span className="text-gray-500 text-sm">/10</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${getScoreColor(dim.score)} rounded-full`}
                            style={{ width: `${(dim.score / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
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
                className="space-y-4"
              >
                {assessment.maturity.dimensionScores?.map((dim) => (
                  <div
                    key={dim.dimension}
                    className="bg-white/5 rounded-xl border border-white/10 overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedDimension(expandedDimension === dim.dimension ? null : dim.dimension)}
                      className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getScoreColor(dim.score)} flex items-center justify-center`}>
                          {categoryIcons[dim.dimension] || <Brain className="w-5 h-5 text-white" />}
                        </div>
                        <div className="text-left">
                          <h4 className="text-white font-semibold">{formatDimensionName(dim.dimension)}</h4>
                          <p className="text-gray-500 text-sm">Confidence: {(dim.confidence * 100).toFixed(0)}%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-2xl font-bold bg-gradient-to-r ${getScoreColor(dim.score)} bg-clip-text text-transparent`}>
                          {dim.score.toFixed(1)}/10
                        </span>
                        {expandedDimension === dim.dimension ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>

                    <AnimatePresence>
                      {expandedDimension === dim.dimension && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-white/10"
                        >
                          <div className="p-4 space-y-4">
                            {/* Evidence */}
                            <div>
                              <h5 className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                                <Eye className="w-4 h-4" /> Evidence
                              </h5>
                              <ul className="space-y-1">
                                {dim.evidence?.map((ev, idx) => (
                                  <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                                    <span className="text-cyan-400 mt-1">•</span>
                                    {ev}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Gaps */}
                            {dim.gaps && dim.gaps.length > 0 && (
                              <div>
                                <h5 className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4" /> Gaps Identified
                                </h5>
                                <ul className="space-y-1">
                                  {dim.gaps.map((gap, idx) => (
                                    <li key={idx} className="text-red-300 text-sm flex items-start gap-2">
                                      <span className="text-red-400 mt-1">•</span>
                                      {gap}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Next Steps */}
                            {dim.nextSteps && dim.nextSteps.length > 0 && (
                              <div>
                                <h5 className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                                  <ArrowRight className="w-4 h-4" /> Next Steps
                                </h5>
                                <ul className="space-y-1">
                                  {dim.nextSteps.map((step, idx) => (
                                    <li key={idx} className="text-green-300 text-sm flex items-start gap-2">
                                      <span className="text-green-400 mt-1">•</span>
                                      {step}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'themes' && (
              <motion.div
                key="themes"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid md:grid-cols-2 gap-4"
              >
                {assessment.themes?.map((theme, idx) => (
                  <div key={idx} className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-white font-semibold">{theme.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${
                        theme.sentiment > 0 ? 'bg-green-500/20 text-green-400' :
                        theme.sentiment < 0 ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {theme.sentiment > 0 ? 'Positive' : theme.sentiment < 0 ? 'Negative' : 'Neutral'}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-3">
                      Mentioned by {theme.frequency} interviewees
                    </p>
                    {theme.quotes?.slice(0, 2).map((quote, qIdx) => (
                      <div key={qIdx} className="bg-white/5 rounded-lg p-3 mb-2">
                        <Quote className="w-4 h-4 text-cyan-400 mb-1" />
                        <p className="text-gray-300 text-sm italic">"{quote}"</p>
                      </div>
                    ))}
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'gaps' && (
              <motion.div
                key="gaps"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {assessment.gaps?.map((gap, idx) => (
                  <div key={idx} className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-semibold">{formatDimensionName(gap.dimension)}</h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        gap.gap >= 3 ? 'bg-red-500/20 text-red-400' :
                        gap.gap >= 2 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        Gap: {gap.gap.toFixed(1)} points
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Leadership Perception</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${(gap.leadershipPerception / 10) * 100}%` }}
                            />
                          </div>
                          <span className="text-blue-400 font-medium">{gap.leadershipPerception.toFixed(1)}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Actual Evidence</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-cyan-500 rounded-full"
                              style={{ width: `${(gap.actualEvidence / 10) * 100}%` }}
                            />
                          </div>
                          <span className="text-cyan-400 font-medium">{gap.actualEvidence.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-green-400 text-xs mb-2">Supporting Evidence</p>
                        <ul className="space-y-1">
                          {gap.evidence?.supporting?.map((ev, evIdx) => (
                            <li key={evIdx} className="text-gray-300 text-sm">• {ev}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-red-400 text-xs mb-2">Contradicting Evidence</p>
                        <ul className="space-y-1">
                          {gap.evidence?.contradicting?.map((ev, evIdx) => (
                            <li key={evIdx} className="text-gray-300 text-sm">• {ev}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'recommendations' && (
              <motion.div
                key="recommendations"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Immediate */}
                <div className="bg-red-500/10 rounded-xl p-5 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-red-400" />
                    <h3 className="text-white font-semibold">Immediate (0-30 days)</h3>
                  </div>
                  <ul className="space-y-3">
                    {assessment.recommendations?.immediate?.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Short Term */}
                <div className="bg-yellow-500/10 rounded-xl p-5 border border-yellow-500/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-white font-semibold">Short Term (30-90 days)</h3>
                  </div>
                  <ul className="space-y-3">
                    {assessment.recommendations?.shortTerm?.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Long Term */}
                <div className="bg-green-500/10 rounded-xl p-5 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-green-400" />
                    <h3 className="text-white font-semibold">Long Term (90+ days)</h3>
                  </div>
                  <ul className="space-y-3">
                    {assessment.recommendations?.longTerm?.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {activeTab === 'team' && (
              <motion.div
                key="team"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/5 rounded-xl border border-white/10 overflow-hidden"
              >
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-gray-400 font-medium">Name</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Title</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Department</th>
                      <th className="text-left p-4 text-gray-400 font-medium">AI Skill Level</th>
                      <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessment.team?.map((member, idx) => (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-white">{member.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300">{member.title}</td>
                        <td className="p-4 text-gray-400">{member.department || '-'}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            member.aiSkillLevel === 'expert' ? 'bg-green-500/20 text-green-400' :
                            member.aiSkillLevel === 'advanced' ? 'bg-cyan-500/20 text-cyan-400' :
                            member.aiSkillLevel === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {member.aiSkillLevel}
                          </span>
                        </td>
                        <td className="p-4">
                          {member.isChampion && (
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs flex items-center gap-1 w-fit">
                              <Sparkles className="w-3 h-3" />
                              Champion
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
