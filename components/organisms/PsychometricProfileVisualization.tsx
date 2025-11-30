'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  MessageCircle,
  Target,
  Lightbulb,
  Shield,
  Users,
  Zap,
  TrendingUp,
  Heart,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  BookOpen,
} from 'lucide-react'

// Types matching the mind-reasoner service
interface PsychometricProfile {
  mindId: string
  snapshotId?: string
  // Communication
  communicationStyle: 'direct' | 'diplomatic' | 'analytical' | 'expressive'
  listeningStyle: 'active' | 'reflective' | 'selective' | 'passive'
  feedbackPreference: 'direct' | 'indirect' | 'written' | 'verbal'
  conflictStyle: 'avoiding' | 'accommodating' | 'competing' | 'collaborating' | 'compromising'
  // Decision Making
  decisionMaking: 'intuitive' | 'analytical' | 'collaborative' | 'decisive'
  problemSolving: 'systematic' | 'creative' | 'pragmatic' | 'theoretical'
  informationProcessing: 'sequential' | 'global' | 'visual' | 'verbal'
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing'
  // Personality
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  changeReadiness: 'resistant' | 'cautious' | 'adaptable' | 'embracing'
  workStyle: 'independent' | 'collaborative' | 'flexible'
  motivationType: 'intrinsic' | 'extrinsic' | 'balanced'
  // Influence
  persuasionStyle: 'logical' | 'emotional' | 'authority' | 'social_proof'
  leadershipStyle: 'directive' | 'coaching' | 'supportive' | 'delegating'
  influenceApproach: 'assertive' | 'consultative' | 'inspirational' | 'tactical'
  // AI & Tech
  aiReadiness: 'skeptical' | 'curious' | 'enthusiastic' | 'expert'
  technologyAdoption: 'laggard' | 'late_majority' | 'early_majority' | 'early_adopter' | 'innovator'
  dataComfort: 'low' | 'moderate' | 'high'
  automationOpenness: 'resistant' | 'selective' | 'embracing'
  // Emotional Intelligence
  selfAwareness: 'developing' | 'moderate' | 'high'
  empathy: 'developing' | 'moderate' | 'high'
  emotionalRegulation: 'developing' | 'moderate' | 'high'
  socialSkills: 'developing' | 'moderate' | 'high'
  // Team
  teamRole: 'leader' | 'contributor' | 'specialist' | 'coordinator' | 'innovator'
  collaborationPreference: 'synchronous' | 'asynchronous' | 'hybrid'
  meetingStyle: 'structured' | 'free_form' | 'minimal'
  // Arrays
  motivators: string[]
  stressors: string[]
  strengths: string[]
  growthAreas: string[]
  values: string[]
  // Metadata
  analyzedAt?: string
  confidence?: number
}

interface LearningRecommendation {
  area: string
  recommendation: string
  priority: 'high' | 'medium' | 'low'
  resourceType: string
}

interface Props {
  profileId?: string
  profile?: PsychometricProfile
  userId?: string
  showRecommendations?: boolean
  className?: string
}

type DimensionCategory = 'communication' | 'cognition' | 'personality' | 'influence' | 'tech' | 'emotional' | 'team'

const categoryConfig: Record<DimensionCategory, {
  icon: any
  label: string
  color: string
  bgColor: string
  borderColor: string
}> = {
  communication: {
    icon: MessageCircle,
    label: 'Communication',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
  },
  cognition: {
    icon: Lightbulb,
    label: 'Decision & Cognition',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
  },
  personality: {
    icon: Heart,
    label: 'Personality & Values',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
  },
  influence: {
    icon: Target,
    label: 'Influence & Leadership',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  tech: {
    icon: Zap,
    label: 'AI & Technology',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
  emotional: {
    icon: Brain,
    label: 'Emotional Intelligence',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  team: {
    icon: Users,
    label: 'Team Dynamics',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
  },
}

export function PsychometricProfileVisualization({
  profileId,
  profile: initialProfile,
  userId,
  showRecommendations = true,
  className = '',
}: Props) {
  const [profile, setProfile] = useState<PsychometricProfile | null>(initialProfile || null)
  const [recommendations, setRecommendations] = useState<LearningRecommendation[]>([])
  const [loading, setLoading] = useState(!initialProfile)
  const [error, setError] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<DimensionCategory>>(
    new Set(['tech', 'communication'] as DimensionCategory[])
  )
  const [activeTab, setActiveTab] = useState<'profile' | 'recommendations' | 'radar'>('profile')

  const fetchProfile = useCallback(async () => {
    if (!profileId && !userId) return

    try {
      setLoading(true)
      setError(null)

      const endpoint = profileId
        ? `/api/profiles/${profileId}`
        : `/api/users/${userId}/profile`

      const res = await fetch(endpoint)

      if (!res.ok) {
        if (res.status === 404) {
          setProfile(null)
          return
        }
        throw new Error('Failed to fetch profile')
      }

      const data = await res.json()
      setProfile(data.profile)

      if (showRecommendations && data.recommendations) {
        setRecommendations(data.recommendations)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [profileId, userId, showRecommendations])

  useEffect(() => {
    if (!initialProfile) {
      fetchProfile()
    }
  }, [fetchProfile, initialProfile])

  const toggleCategory = (category: DimensionCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  if (loading) {
    return (
      <div className={`bg-gray-900/50 rounded-2xl border border-white/10 p-8 ${className}`}>
        <div className="flex items-center justify-center gap-3 text-gray-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading psychometric profile...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-gray-900/50 rounded-2xl border border-red-500/30 p-8 ${className}`}>
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button
            onClick={fetchProfile}
            className="ml-auto px-4 py-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className={`bg-gray-900/50 rounded-2xl border border-white/10 p-8 ${className}`}>
        <div className="text-center">
          <Brain className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Profile Available</h3>
          <p className="text-gray-400 text-sm">
            Complete an assessment or upload conversation data to generate your psychometric profile.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gray-900/50 rounded-2xl border border-white/10 ${className}`}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-gendy">
                Psychometric Profile
              </h2>
              <p className="text-sm text-gray-400 font-diatype">
                25+ dimensions analyzed
                {profile.confidence && ` • ${profile.confidence}% confidence`}
              </p>
            </div>
          </div>

          {profile.analyzedAt && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              Last analyzed: {new Date(profile.analyzedAt).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mt-4 p-1 bg-white/5 rounded-lg">
          {[
            { key: 'profile' as const, label: 'Full Profile' },
            { key: 'radar' as const, label: 'Radar View' },
            { key: 'recommendations' as const, label: 'Recommendations', badge: recommendations.length },
          ].map(({ key, label, badge }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-all ${
                activeTab === key
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {label}
              {badge !== undefined && badge > 0 && (
                <span className="px-1.5 py-0.5 text-xs bg-purple-500/30 rounded">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Quick Summary */}
              <QuickSummary profile={profile} />

              {/* Category Sections */}
              {Object.entries(categoryConfig).map(([key, config]) => (
                <CategorySection
                  key={key}
                  category={key as DimensionCategory}
                  config={config}
                  profile={profile}
                  isExpanded={expandedCategories.has(key as DimensionCategory)}
                  onToggle={() => toggleCategory(key as DimensionCategory)}
                />
              ))}

              {/* Dynamic Arrays */}
              <DynamicAttributes profile={profile} />
            </motion.div>
          )}

          {activeTab === 'radar' && (
            <motion.div
              key="radar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <RadarChart profile={profile} />
            </motion.div>
          )}

          {activeTab === 'recommendations' && (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <RecommendationsList recommendations={recommendations} profile={profile} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Quick Summary Component
function QuickSummary({ profile }: { profile: PsychometricProfile }) {
  const highlights = [
    {
      label: 'Communication',
      value: profile.communicationStyle,
      bgClass: 'bg-cyan-500/10 border-cyan-500/20',
      textClass: 'text-cyan-400',
    },
    {
      label: 'AI Readiness',
      value: profile.aiReadiness,
      bgClass: 'bg-green-500/10 border-green-500/20',
      textClass: 'text-green-400',
    },
    {
      label: 'Decision Style',
      value: profile.decisionMaking,
      bgClass: 'bg-yellow-500/10 border-yellow-500/20',
      textClass: 'text-yellow-400',
    },
    {
      label: 'Change Readiness',
      value: profile.changeReadiness,
      bgClass: 'bg-purple-500/10 border-purple-500/20',
      textClass: 'text-purple-400',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {highlights.map((h) => (
        <div
          key={h.label}
          className={`p-3 rounded-lg border ${h.bgClass}`}
        >
          <p className="text-xs text-gray-400 mb-1">{h.label}</p>
          <p className={`text-sm font-medium ${h.textClass} capitalize`}>
            {h.value.replace(/_/g, ' ')}
          </p>
        </div>
      ))}
    </div>
  )
}

// Category Section Component
function CategorySection({
  category,
  config,
  profile,
  isExpanded,
  onToggle,
}: {
  category: DimensionCategory
  config: typeof categoryConfig[DimensionCategory]
  profile: PsychometricProfile
  isExpanded: boolean
  onToggle: () => void
}) {
  const Icon = config.icon

  const dimensionsByCategory: Record<DimensionCategory, Array<{ key: keyof PsychometricProfile; label: string }>> = {
    communication: [
      { key: 'communicationStyle', label: 'Communication Style' },
      { key: 'listeningStyle', label: 'Listening Style' },
      { key: 'feedbackPreference', label: 'Feedback Preference' },
      { key: 'conflictStyle', label: 'Conflict Resolution' },
    ],
    cognition: [
      { key: 'decisionMaking', label: 'Decision Making' },
      { key: 'problemSolving', label: 'Problem Solving' },
      { key: 'informationProcessing', label: 'Information Processing' },
      { key: 'learningStyle', label: 'Learning Style' },
    ],
    personality: [
      { key: 'riskTolerance', label: 'Risk Tolerance' },
      { key: 'changeReadiness', label: 'Change Readiness' },
      { key: 'workStyle', label: 'Work Style' },
      { key: 'motivationType', label: 'Motivation Type' },
    ],
    influence: [
      { key: 'persuasionStyle', label: 'Persuasion Style' },
      { key: 'leadershipStyle', label: 'Leadership Style' },
      { key: 'influenceApproach', label: 'Influence Approach' },
    ],
    tech: [
      { key: 'aiReadiness', label: 'AI Readiness' },
      { key: 'technologyAdoption', label: 'Technology Adoption' },
      { key: 'dataComfort', label: 'Data Comfort' },
      { key: 'automationOpenness', label: 'Automation Openness' },
    ],
    emotional: [
      { key: 'selfAwareness', label: 'Self-Awareness' },
      { key: 'empathy', label: 'Empathy' },
      { key: 'emotionalRegulation', label: 'Emotional Regulation' },
      { key: 'socialSkills', label: 'Social Skills' },
    ],
    team: [
      { key: 'teamRole', label: 'Team Role' },
      { key: 'collaborationPreference', label: 'Collaboration Style' },
      { key: 'meetingStyle', label: 'Meeting Preference' },
    ],
  }

  const dimensions = dimensionsByCategory[category]

  return (
    <div className={`rounded-lg border ${config.borderColor} overflow-hidden`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-4 ${config.bgColor} transition-colors hover:bg-opacity-20`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${config.color}`} />
          <span className="font-medium text-white">{config.label}</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3 bg-black/20">
              {dimensions.map((dim) => {
                const value = profile[dim.key]
                if (value === undefined || typeof value === 'object') return null

                return (
                  <div
                    key={dim.key}
                    className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                  >
                    <span className="text-sm text-gray-400">{dim.label}</span>
                    <span className={`text-sm font-medium ${config.color} capitalize`}>
                      {String(value).replace(/_/g, ' ')}
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Dynamic Attributes Component
function DynamicAttributes({ profile }: { profile: PsychometricProfile }) {
  const attributes = [
    {
      key: 'motivators',
      label: 'Key Motivators',
      icon: TrendingUp,
      bgClass: 'bg-green-500/10 border-green-500/20',
      iconClass: 'text-green-400',
      labelClass: 'text-green-400',
      badgeClass: 'bg-green-500/20 text-green-300',
    },
    {
      key: 'stressors',
      label: 'Potential Stressors',
      icon: AlertCircle,
      bgClass: 'bg-red-500/10 border-red-500/20',
      iconClass: 'text-red-400',
      labelClass: 'text-red-400',
      badgeClass: 'bg-red-500/20 text-red-300',
    },
    {
      key: 'strengths',
      label: 'Core Strengths',
      icon: Shield,
      bgClass: 'bg-blue-500/10 border-blue-500/20',
      iconClass: 'text-blue-400',
      labelClass: 'text-blue-400',
      badgeClass: 'bg-blue-500/20 text-blue-300',
    },
    {
      key: 'growthAreas',
      label: 'Growth Areas',
      icon: Lightbulb,
      bgClass: 'bg-yellow-500/10 border-yellow-500/20',
      iconClass: 'text-yellow-400',
      labelClass: 'text-yellow-400',
      badgeClass: 'bg-yellow-500/20 text-yellow-300',
    },
    {
      key: 'values',
      label: 'Personal Values',
      icon: Heart,
      bgClass: 'bg-purple-500/10 border-purple-500/20',
      iconClass: 'text-purple-400',
      labelClass: 'text-purple-400',
      badgeClass: 'bg-purple-500/20 text-purple-300',
    },
  ]

  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-sm font-medium text-gray-400">Dynamic Attributes</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {attributes.map((attr) => {
          const values = profile[attr.key as keyof PsychometricProfile] as string[]
          if (!values || values.length === 0) return null

          const Icon = attr.icon

          return (
            <div
              key={attr.key}
              className={`p-4 rounded-lg border ${attr.bgClass}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${attr.iconClass}`} />
                <span className={`text-sm font-medium ${attr.labelClass}`}>
                  {attr.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {values.slice(0, 5).map((value, i) => (
                  <span
                    key={i}
                    className={`px-2 py-1 text-xs ${attr.badgeClass} rounded`}
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Radar Chart (Placeholder - would use real charting library)
function RadarChart({ profile }: { profile: PsychometricProfile }) {
  // Map dimensions to numeric scores for visualization
  const scores = {
    'AI Readiness': { skeptical: 25, curious: 50, enthusiastic: 75, expert: 100 }[profile.aiReadiness] || 50,
    'Change Readiness': { resistant: 25, cautious: 50, adaptable: 75, embracing: 100 }[profile.changeReadiness] || 50,
    'Risk Tolerance': { conservative: 33, moderate: 66, aggressive: 100 }[profile.riskTolerance] || 50,
    'Self-Awareness': { developing: 33, moderate: 66, high: 100 }[profile.selfAwareness] || 50,
    'Empathy': { developing: 33, moderate: 66, high: 100 }[profile.empathy] || 50,
    'Social Skills': { developing: 33, moderate: 66, high: 100 }[profile.socialSkills] || 50,
    'Data Comfort': { low: 33, moderate: 66, high: 100 }[profile.dataComfort] || 50,
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-400">
        Visual representation of key psychometric dimensions
      </p>

      {/* Simple bar representation */}
      <div className="space-y-4">
        {Object.entries(scores).map(([dimension, score]) => (
          <div key={dimension}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-300">{dimension}</span>
              <span className="text-sm font-medium text-cyan-400">{score}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 0.8, delay: 0.1 }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Scores are derived from psychometric analysis. Higher values indicate greater proficiency or readiness in each dimension.
      </p>
    </div>
  )
}

// Recommendations List Component
function RecommendationsList({
  recommendations,
  profile,
}: {
  recommendations: LearningRecommendation[]
  profile: PsychometricProfile
}) {
  const priorityColors = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
  }

  const resourceTypeIcons = {
    video: '🎬',
    course: '📚',
    workshop: '🎯',
    mentoring: '👥',
    case_study: '📋',
    documentation: '📄',
    hands_on: '🔧',
    pilot_project: '🚀',
    interactive_tutorial: '💻',
  }

  // Generate recommendations from profile if none provided
  const displayRecommendations = recommendations.length > 0
    ? recommendations
    : generateRecommendationsFromProfile(profile)

  if (displayRecommendations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No recommendations available</p>
        <p className="text-sm mt-1">Complete your profile for personalized learning paths</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400 mb-4">
        Personalized recommendations based on your psychometric profile
      </p>

      {displayRecommendations.map((rec, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg border ${priorityColors[rec.priority]}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">
                  {resourceTypeIcons[rec.resourceType as keyof typeof resourceTypeIcons] || '📘'}
                </span>
                <span className="font-medium text-white">{rec.area}</span>
                <span className={`px-2 py-0.5 text-xs rounded uppercase ${priorityColors[rec.priority]}`}>
                  {rec.priority}
                </span>
              </div>
              <p className="text-sm text-gray-300">{rec.recommendation}</p>
              <p className="text-xs text-gray-500 mt-2">
                Recommended format: {rec.resourceType.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Helper function to generate recommendations from profile
function generateRecommendationsFromProfile(profile: PsychometricProfile): LearningRecommendation[] {
  const recommendations: LearningRecommendation[] = []

  if (profile.aiReadiness === 'skeptical') {
    recommendations.push({
      area: 'AI Fundamentals',
      recommendation: 'Start with practical AI use cases that solve immediate problems',
      priority: 'high',
      resourceType: profile.learningStyle === 'visual' ? 'video' : 'hands_on',
    })
  }

  if (profile.changeReadiness === 'resistant' || profile.changeReadiness === 'cautious') {
    recommendations.push({
      area: 'Change Management',
      recommendation: 'Explore success stories and ROI data before adopting new processes',
      priority: 'high',
      resourceType: 'case_study',
    })
  }

  if (profile.dataComfort === 'low') {
    recommendations.push({
      area: 'Data Literacy',
      recommendation: 'Build foundational data analysis skills to support AI tool adoption',
      priority: 'medium',
      resourceType: 'interactive_tutorial',
    })
  }

  if (profile.automationOpenness === 'resistant') {
    recommendations.push({
      area: 'Automation Readiness',
      recommendation: 'Start with low-risk automation that augments rather than replaces',
      priority: 'high',
      resourceType: 'pilot_project',
    })
  }

  // Add recommendations for growth areas
  profile.growthAreas?.slice(0, 2).forEach((area) => {
    recommendations.push({
      area,
      recommendation: `Targeted development in ${area.toLowerCase()}`,
      priority: 'medium',
      resourceType: profile.learningStyle === 'kinesthetic' ? 'workshop' : 'course',
    })
  })

  return recommendations
}

export default PsychometricProfileVisualization
