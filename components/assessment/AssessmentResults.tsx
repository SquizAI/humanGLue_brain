'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Brain,
  Users,
  Zap,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Loader2,
  BarChart3,
  Award,
  Lightbulb,
  BookOpen,
} from 'lucide-react'

// Types matching the API response
interface DimensionScore {
  dimension: string
  score: number
  percentage: number
  weight: number
  weightedScore: number
  questionsAnswered: number
  questionsSkipped: number
  subdimensions?: Array<{
    name: string
    score: number
    percentage: number
    questionCount: number
  }>
}

interface MaturityLevel {
  level: number
  name: string
  description: string
  characteristics?: string[]
  capabilities?: string[]
  typicalChallenges?: string[]
}

interface GapAnalysis {
  currentLevel: { level: number; name: string; minScore: number; maxScore: number }
  nextLevel: { level: number; name: string; minScore: number; maxScore: number } | null
  pointsToNextLevel: number
  percentageToNextLevel: number
  dimensionGaps: Array<{
    dimension: string
    currentScore: number
    targetScore: number
    gap: number
    priority: 'high' | 'medium' | 'low'
  }>
  recommendations: string[]
}

interface PeerComparison {
  industryAverage: number
  percentile: number
  rank: string
}

interface PsychometricProfile {
  communicationStyle?: string
  changeReadiness?: string
  leadershipStyle?: string
  aiReadiness?: string
  technologyAdoption?: string
  automationOpenness?: string
  confidence: number
  analyzedAt: string
}

interface LearningRecommendation {
  area: string
  recommendation: string
  priority: 'high' | 'medium' | 'low'
  resources?: string[]
}

interface AssessmentResultsData {
  overallScore: number
  overallPercentage: number
  maturityLevel: MaturityLevel
  nextLevel: {
    level: number
    name: string
    description: string
    estimatedTimeToNext?: string
    requiredInvestment?: string
    nextSteps?: string[]
  } | null
  dimensions: DimensionScore[]
  gapAnalysis: GapAnalysis
  peerComparison?: PeerComparison | null
  psychometricProfile: PsychometricProfile
  recommendations: string[]
  learningRecommendations: LearningRecommendation[]
  completedAt: string
  completionPercentage: number
  questionsAnswered: number
  questionsSkipped: number
  totalQuestions: number
}

interface Props {
  assessmentId: string
  className?: string
}

const dimensionConfig: Record<string, { icon: typeof Brain; label: string; color: string; gradient: string }> = {
  individual: {
    icon: Brain,
    label: 'Individual Adaptability',
    color: 'cyan',
    gradient: 'from-cyan-500 to-cyan-600',
  },
  leadership: {
    icon: Users,
    label: 'Leadership Readiness',
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
  },
  cultural: {
    icon: Zap,
    label: 'Cultural Flexibility',
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
  },
  embedding: {
    icon: Target,
    label: 'AI Embedding',
    color: 'green',
    gradient: 'from-green-500 to-green-600',
  },
  velocity: {
    icon: TrendingUp,
    label: 'Change Velocity',
    color: 'orange',
    gradient: 'from-orange-500 to-orange-600',
  },
}

export function AssessmentResults({ assessmentId, className = '' }: Props) {
  const [results, setResults] = useState<AssessmentResultsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`/api/assessments/${assessmentId}`)
        if (!res.ok) {
          throw new Error('Failed to fetch assessment results')
        }

        const data = await res.json()

        // Check if assessment has results
        if (data.data?.results) {
          setResults(data.data.results)
        } else if (data.data?.status === 'completed') {
          // Try to get results from the assessment data directly
          setResults({
            overallScore: data.data.overall_score || 0,
            overallPercentage: data.data.overall_score || 0,
            maturityLevel: {
              level: Math.floor((data.data.overall_score || 0) / 10),
              name: getMaturityName(data.data.overall_score || 0),
              description: 'Assessment completed',
            },
            nextLevel: null,
            dimensions: [
              { dimension: 'individual', score: data.data.individual_score || 0, percentage: data.data.individual_score || 0, weight: 0.25, weightedScore: 0, questionsAnswered: 0, questionsSkipped: 0 },
              { dimension: 'leadership', score: data.data.leadership_score || 0, percentage: data.data.leadership_score || 0, weight: 0.2, weightedScore: 0, questionsAnswered: 0, questionsSkipped: 0 },
              { dimension: 'cultural', score: data.data.cultural_score || 0, percentage: data.data.cultural_score || 0, weight: 0.2, weightedScore: 0, questionsAnswered: 0, questionsSkipped: 0 },
              { dimension: 'embedding', score: data.data.embedding_score || 0, percentage: data.data.embedding_score || 0, weight: 0.2, weightedScore: 0, questionsAnswered: 0, questionsSkipped: 0 },
              { dimension: 'velocity', score: data.data.velocity_score || 0, percentage: data.data.velocity_score || 0, weight: 0.15, weightedScore: 0, questionsAnswered: 0, questionsSkipped: 0 },
            ],
            gapAnalysis: {
              currentLevel: { level: 0, name: '', minScore: 0, maxScore: 0 },
              nextLevel: null,
              pointsToNextLevel: 0,
              percentageToNextLevel: 0,
              dimensionGaps: [],
              recommendations: [],
            },
            peerComparison: null,
            psychometricProfile: { confidence: 0, analyzedAt: new Date().toISOString() },
            recommendations: [],
            learningRecommendations: [],
            completedAt: data.data.completed_at || new Date().toISOString(),
            completionPercentage: 100,
            questionsAnswered: 0,
            questionsSkipped: 0,
            totalQuestions: 0,
          })
        } else {
          throw new Error('Assessment not yet completed')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [assessmentId])

  if (loading) {
    return (
      <div className={`min-h-[400px] flex items-center justify-center ${className}`}>
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading results...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`min-h-[400px] flex items-center justify-center ${className}`}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className={`min-h-[400px] flex items-center justify-center ${className}`}>
        <p className="text-gray-400">No results available</p>
      </div>
    )
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Hero Section - Overall Score */}
      <MaturityLevelVisualization
        score={results.overallScore}
        maturityLevel={results.maturityLevel}
        nextLevel={results.nextLevel}
        peerComparison={results.peerComparison}
      />

      {/* Dimension Scores */}
      <DimensionScoresChart dimensions={results.dimensions} />

      {/* Gap Analysis */}
      <GapAnalysisDisplay gapAnalysis={results.gapAnalysis} />

      {/* Recommendations */}
      <RecommendationsSection
        recommendations={results.recommendations}
        learningRecommendations={results.learningRecommendations}
        nextLevel={results.nextLevel}
      />

      {/* Psychometric Profile Summary */}
      {results.psychometricProfile.confidence > 0 && (
        <PsychometricSummary profile={results.psychometricProfile} />
      )}
    </div>
  )
}

// Maturity Level Visualization Component
function MaturityLevelVisualization({
  score,
  maturityLevel,
  nextLevel,
  peerComparison,
}: {
  score: number
  maturityLevel: MaturityLevel
  nextLevel: AssessmentResultsData['nextLevel']
  peerComparison?: PeerComparison | null
}) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'from-green-500 to-emerald-500'
    if (s >= 60) return 'from-cyan-500 to-blue-500'
    if (s >= 40) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-pink-500'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
    >
      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Score Circle */}
        <div className="relative w-48 h-48 flex-shrink-0">
          <svg className="transform -rotate-90 w-48 h-48">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-white/10"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="url(#scoreGradient)"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - score / 100)}`}
              className="transition-all duration-1000"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#61D8FE" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold text-white font-gendy">{score}</span>
            <span className="text-gray-400 text-sm font-diatype">out of 100</span>
          </div>
        </div>

        {/* Maturity Info */}
        <div className="flex-1 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
            <Award className="w-8 h-8 text-cyan-400" />
            <div>
              <p className="text-sm text-gray-400 uppercase tracking-wider font-diatype">
                Maturity Level {maturityLevel.level}
              </p>
              <h2 className={`text-3xl font-bold bg-gradient-to-r ${getScoreColor(score)} bg-clip-text text-transparent font-gendy`}>
                {maturityLevel.name}
              </h2>
            </div>
          </div>
          <p className="text-gray-300 font-diatype mb-4">{maturityLevel.description}</p>

          {/* Characteristics */}
          {maturityLevel.characteristics && maturityLevel.characteristics.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {maturityLevel.characteristics.slice(0, 4).map((char, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm rounded-full font-diatype"
                >
                  {char}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Next Level / Peer Comparison */}
        <div className="flex flex-col gap-4 w-64">
          {nextLevel && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-diatype">Next Level</p>
              <p className="text-lg font-semibold text-white font-gendy">{nextLevel.name}</p>
              <p className="text-sm text-gray-400 font-diatype">{nextLevel.estimatedTimeToNext}</p>
            </div>
          )}

          {peerComparison && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-diatype">Industry Comparison</p>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-semibold font-gendy ${
                  peerComparison.percentile >= 50 ? 'text-green-400' : 'text-orange-400'
                }`}>
                  {peerComparison.rank}
                </span>
              </div>
              <p className="text-sm text-gray-400 font-diatype">
                Industry avg: {peerComparison.industryAverage}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Dimension Scores Chart Component
function DimensionScoresChart({ dimensions }: { dimensions: DimensionScore[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6 text-cyan-400" />
        <h3 className="text-xl font-semibold text-white font-gendy">Dimension Scores</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {dimensions.map((dim, index) => {
          const config = dimensionConfig[dim.dimension] || {
            icon: Brain,
            label: dim.dimension,
            color: 'gray',
            gradient: 'from-gray-500 to-gray-600',
          }
          const Icon = config.icon

          return (
            <motion.div
              key={dim.dimension}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-2 bg-gradient-to-br ${config.gradient} rounded-lg`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm text-gray-300 font-diatype">{config.label}</p>
              </div>

              <div className="relative h-24 flex items-end justify-center">
                <div className="w-16 bg-white/10 rounded-t-lg relative overflow-hidden" style={{ height: '100%' }}>
                  <motion.div
                    className={`absolute bottom-0 w-full bg-gradient-to-t ${config.gradient} rounded-t-lg`}
                    initial={{ height: 0 }}
                    animate={{ height: `${dim.percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                  />
                </div>
              </div>

              <div className="text-center mt-2">
                <span className="text-2xl font-bold text-white font-gendy">{dim.score}</span>
                <span className="text-gray-400 text-sm font-diatype">/100</span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Radar Chart Placeholder - Simple bar comparison */}
      <div className="space-y-3">
        {dimensions.map((dim) => {
          const config = dimensionConfig[dim.dimension]
          return (
            <div key={dim.dimension} className="flex items-center gap-4">
              <span className="text-sm text-gray-400 w-32 font-diatype">{config?.label || dim.dimension}</span>
              <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${config?.gradient || 'from-gray-500 to-gray-600'} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${dim.percentage}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
              <span className="text-sm text-white font-semibold w-12 text-right font-diatype">{dim.score}%</span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

// Gap Analysis Display Component
function GapAnalysisDisplay({ gapAnalysis }: { gapAnalysis: GapAnalysis }) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-400 bg-red-500/10 border-red-500/20'
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      case 'low':
        return 'text-green-400 bg-green-500/10 border-green-500/20'
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-4 h-4" />
      case 'medium':
        return <Minus className="w-4 h-4" />
      case 'low':
        return <CheckCircle2 className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Target className="w-6 h-6 text-cyan-400" />
        <h3 className="text-xl font-semibold text-white font-gendy">Gap Analysis</h3>
      </div>

      {/* Progress to Next Level */}
      {gapAnalysis.nextLevel && (
        <div className="mb-6 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-400 font-diatype">Progress to Next Level</p>
              <p className="text-lg font-semibold text-white font-gendy">
                {gapAnalysis.currentLevel.name} → {gapAnalysis.nextLevel.name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-cyan-400 font-gendy">{gapAnalysis.pointsToNextLevel}</p>
              <p className="text-xs text-gray-400 font-diatype">points needed</p>
            </div>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${gapAnalysis.percentageToNextLevel}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-right font-diatype">
            {gapAnalysis.percentageToNextLevel}% complete
          </p>
        </div>
      )}

      {/* Dimension Gaps */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider font-diatype">
          Dimension Gaps by Priority
        </h4>
        {gapAnalysis.dimensionGaps.map((gap, index) => {
          const config = dimensionConfig[gap.dimension]
          return (
            <motion.div
              key={gap.dimension}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/10"
            >
              <div className={`px-2 py-1 rounded-full ${getPriorityColor(gap.priority)} flex items-center gap-1`}>
                {getPriorityIcon(gap.priority)}
                <span className="text-xs font-semibold uppercase font-diatype">{gap.priority}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white font-diatype">{config?.label || gap.dimension}</p>
                <p className="text-xs text-gray-400 font-diatype">
                  Current: {gap.currentScore} → Target: {gap.targetScore}
                </p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-white font-gendy">-{gap.gap}</span>
                <p className="text-xs text-gray-400 font-diatype">points gap</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

// Recommendations Section Component
function RecommendationsSection({
  recommendations,
  learningRecommendations,
  nextLevel,
}: {
  recommendations: string[]
  learningRecommendations: LearningRecommendation[]
  nextLevel: AssessmentResultsData['nextLevel']
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb className="w-6 h-6 text-cyan-400" />
        <h3 className="text-xl font-semibold text-white font-gendy">Recommendations</h3>
      </div>

      {/* Next Steps from Next Level */}
      {nextLevel?.nextSteps && nextLevel.nextSteps.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl">
          <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-3 font-diatype">
            Path to {nextLevel.name}
          </h4>
          <ul className="space-y-2">
            {nextLevel.nextSteps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <ArrowRight className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-300 font-diatype">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* General Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 font-diatype">
            Strategic Recommendations
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-300 font-diatype">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Recommendations */}
      {learningRecommendations.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2 font-diatype">
            <BookOpen className="w-4 h-4" />
            Learning Path
          </h4>
          <div className="space-y-3">
            {learningRecommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white font-diatype">{rec.area}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    rec.priority === 'high'
                      ? 'text-red-400 bg-red-500/10'
                      : rec.priority === 'medium'
                      ? 'text-yellow-400 bg-yellow-500/10'
                      : 'text-green-400 bg-green-500/10'
                  } font-diatype`}>
                    {rec.priority} priority
                  </span>
                </div>
                <p className="text-sm text-gray-400 font-diatype">{rec.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// Psychometric Summary Component
function PsychometricSummary({ profile }: { profile: PsychometricProfile }) {
  const traits = [
    { label: 'Communication Style', value: profile.communicationStyle },
    { label: 'Change Readiness', value: profile.changeReadiness },
    { label: 'Leadership Style', value: profile.leadershipStyle },
    { label: 'AI Readiness', value: profile.aiReadiness },
    { label: 'Technology Adoption', value: profile.technologyAdoption },
    { label: 'Automation Openness', value: profile.automationOpenness },
  ].filter(t => t.value)

  if (traits.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-cyan-400" />
          <h3 className="text-xl font-semibold text-white font-gendy">Psychometric Profile</h3>
        </div>
        <span className="text-xs text-gray-400 font-diatype">
          {profile.confidence}% confidence
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {traits.map((trait, idx) => (
          <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/10">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-diatype">{trait.label}</p>
            <p className="text-sm font-semibold text-white capitalize font-diatype">
              {trait.value?.replace(/_/g, ' ')}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// Helper function
function getMaturityName(score: number): string {
  const levels = [
    { min: 0, max: 10, name: 'Unaware' },
    { min: 11, max: 20, name: 'Aware' },
    { min: 21, max: 30, name: 'Exploring' },
    { min: 31, max: 40, name: 'Experimenting' },
    { min: 41, max: 50, name: 'Adopting' },
    { min: 51, max: 60, name: 'Scaling' },
    { min: 61, max: 70, name: 'Optimizing' },
    { min: 71, max: 80, name: 'Innovating' },
    { min: 81, max: 90, name: 'Leading' },
    { min: 91, max: 100, name: 'Transforming' },
  ]
  const level = levels.find(l => score >= l.min && score <= l.max)
  return level?.name || 'Unknown'
}

export default AssessmentResults
