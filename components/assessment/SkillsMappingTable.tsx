'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Brain,
  MessageSquare,
  Lightbulb,
  Quote,
  Zap,
  Clock,
  Award,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { TeamMemberProfile, MaturityScore, MATURITY_LEVELS, GrowthPotential, AnxietyLevel } from './types'

export interface SkillsMappingTableProps {
  /** Array of team member profiles */
  profiles: TeamMemberProfile[]
  /** Whether to show detailed psychological profiles on expansion */
  showPsychology?: boolean
  /** Whether to show tool usage */
  showTools?: boolean
  /** Callback when a profile is selected */
  onProfileSelect?: (profile: TeamMemberProfile) => void
  /** Custom className */
  className?: string
}

const getLevelClasses = (level: MaturityScore) => {
  if (level >= 5) {
    return {
      bg: 'bg-green-500/20',
      text: 'text-green-400',
      ring: 'ring-green-500/30',
    }
  }
  if (level >= 2) {
    return {
      bg: 'bg-cyan-500/20',
      text: 'text-cyan-400',
      ring: 'ring-cyan-500/30',
    }
  }
  if (level >= 0) {
    return {
      bg: 'bg-yellow-500/20',
      text: 'text-yellow-400',
      ring: 'ring-yellow-500/30',
    }
  }
  return {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    ring: 'ring-red-500/30',
  }
}

const getGrowthClasses = (growth: GrowthPotential) => {
  const classes = {
    high: 'bg-green-500/10 text-green-400',
    medium: 'bg-yellow-500/10 text-yellow-400',
    low: 'bg-gray-500/10 text-gray-400',
  }
  return classes[growth]
}

const getAnxietyClasses = (anxiety: AnxietyLevel) => {
  const classes = {
    low: 'bg-green-500/10 text-green-400',
    medium: 'bg-yellow-500/10 text-yellow-400',
    high: 'bg-red-500/10 text-red-400',
  }
  return classes[anxiety]
}

const getReadinessColor = (readiness: number) => {
  if (readiness >= 70) return 'text-green-400'
  if (readiness >= 50) return 'text-yellow-400'
  return 'text-red-400'
}

const getReadinessBarColor = (readiness: number) => {
  if (readiness >= 70) return 'bg-green-500'
  if (readiness >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}

interface ProfileCardProps {
  profile: TeamMemberProfile
  showPsychology: boolean
  showTools: boolean
  isExpanded: boolean
  onToggle: () => void
  index: number
}

function ProfileCard({
  profile,
  showPsychology,
  showTools,
  isExpanded,
  onToggle,
  index,
}: ProfileCardProps) {
  const levelClasses = getLevelClasses(profile.level)
  const levelName = MATURITY_LEVELS[profile.level] || profile.levelName

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'bg-white/5 rounded-xl border overflow-hidden transition-all',
        isExpanded
          ? 'border-cyan-500/50 ring-2 ring-cyan-500/30'
          : profile.potential
          ? 'border-cyan-500/30 ring-1 ring-cyan-500/20'
          : 'border-white/10 hover:border-white/20'
      )}
    >
      {/* Profile Header */}
      <button
        onClick={onToggle}
        className="w-full p-5 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center font-gendy text-lg font-bold',
              profile.level >= 1
                ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white'
                : 'bg-white/10 text-gray-400'
            )}>
              {profile.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-white font-diatype">
                {profile.name}
              </h4>
              <p className="text-xs text-gray-400 font-diatype">
                {profile.title}
              </p>
            </div>
          </div>
          {profile.potential && (
            <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full font-diatype flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Champion Potential
            </span>
          )}
        </div>

        {/* Level & Department Row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className={cn(
              'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold font-diatype',
              levelClasses.bg,
              levelClasses.text
            )}>
              Level {profile.level}
            </div>
            <p className={cn(
              'text-sm font-medium font-diatype mt-1',
              levelClasses.text
            )}>
              {levelName}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 font-diatype">{profile.department}</p>
            <p className="text-xs text-gray-600 font-diatype flex items-center gap-1 justify-end">
              <Clock className="w-3 h-3" />
              {profile.interviewDuration} min
            </p>
          </div>
        </div>

        {/* Change Readiness Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-500 font-diatype">Change Readiness</span>
            <span className={cn(
              'font-semibold font-diatype',
              getReadinessColor(profile.psychology.changeReadiness)
            )}>
              {profile.psychology.changeReadiness}%
            </span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${profile.psychology.changeReadiness}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={cn(
                'h-full rounded-full',
                getReadinessBarColor(profile.psychology.changeReadiness)
              )}
            />
          </div>
        </div>

        {/* Tools */}
        {showTools && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2 font-diatype">Tools Used</p>
            <div className="flex flex-wrap gap-1">
              {profile.tools.slice(0, 4).map(tool => (
                <span
                  key={tool}
                  className="px-2 py-0.5 bg-white/5 text-gray-400 text-xs rounded font-diatype"
                >
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
        )}

        {/* Quick Stats Row */}
        <div className="flex items-center justify-between">
          <div className={cn(
            'text-xs font-diatype px-2 py-1 rounded inline-flex items-center gap-1',
            getGrowthClasses(profile.growth)
          )}>
            <TrendingUp className="w-3 h-3" />
            {profile.growth.toUpperCase()} growth
          </div>
          <div className={cn(
            'text-xs font-diatype px-2 py-1 rounded',
            getAnxietyClasses(profile.psychology.aiAnxiety)
          )}>
            {profile.psychology.aiAnxiety.toUpperCase()} anxiety
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Psychological Profile */}
      <AnimatePresence>
        {isExpanded && showPsychology && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10"
          >
            <div className="p-5 space-y-4">
              {/* Thinking Style */}
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <h5 className="text-xs font-semibold text-purple-400 font-diatype">
                    Thinking Style
                  </h5>
                </div>
                <p className="text-xs text-gray-300 font-diatype">
                  {profile.psychology.thinkingStyle}
                </p>
              </div>

              {/* Communication Style */}
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <h5 className="text-xs font-semibold text-cyan-400 font-diatype">
                    Communication Style
                  </h5>
                </div>
                <p className="text-xs text-gray-300 font-diatype">
                  {profile.psychology.communicationStyle}
                </p>
              </div>

              {/* Key Motivator & Blocker Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-500/5 rounded-lg p-3 border border-green-500/20">
                  <h5 className="text-[10px] font-semibold text-green-400 uppercase tracking-wider mb-1 font-diatype">
                    Key Motivator
                  </h5>
                  <p className="text-xs text-gray-300 font-diatype">
                    {profile.psychology.keyMotivator}
                  </p>
                </div>
                <div className="bg-red-500/5 rounded-lg p-3 border border-red-500/20">
                  <h5 className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-1 font-diatype">
                    Potential Blocker
                  </h5>
                  <p className="text-xs text-gray-300 font-diatype">
                    {profile.psychology.potentialBlocker}
                  </p>
                </div>
              </div>

              {/* Recommended Approach */}
              <div className="bg-cyan-500/5 rounded-lg p-3 border border-cyan-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-cyan-400" />
                  <h5 className="text-xs font-semibold text-cyan-400 font-diatype">
                    Recommended Approach
                  </h5>
                </div>
                <p className="text-xs text-gray-300 font-diatype">
                  {profile.psychology.recommendedApproach}
                </p>
              </div>

              {/* Key Quotes */}
              {profile.keyQuotes && profile.keyQuotes.length > 0 && (
                <div>
                  <h5 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 font-diatype flex items-center gap-1">
                    <Quote className="w-3 h-3" /> Key Quotes
                  </h5>
                  <div className="space-y-2">
                    {profile.keyQuotes.map((quote, idx) => (
                      <p
                        key={idx}
                        className="text-xs text-gray-400 font-diatype italic pl-3 border-l-2 border-gray-600"
                      >
                        &ldquo;{quote}&rdquo;
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function SkillsMappingTable({
  profiles,
  showPsychology = true,
  showTools = true,
  onProfileSelect,
  className,
}: SkillsMappingTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleToggle = (profile: TeamMemberProfile) => {
    const newExpandedId = expandedId === profile.name ? null : profile.name
    setExpandedId(newExpandedId)
    if (newExpandedId && onProfileSelect) {
      onProfileSelect(profile)
    }
  }

  // Calculate summary stats
  const avgLevel = profiles.reduce((sum, p) => sum + p.level, 0) / profiles.length
  const championsCount = profiles.filter(p => p.potential).length
  const avgReadiness = profiles.reduce((sum, p) => sum + p.psychology.changeReadiness, 0) / profiles.length

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white font-gendy flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Team AI Profiles
          </h3>
          <p className="text-xs text-gray-400 font-diatype mt-1">
            Click a profile to view psychological insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-gray-500 font-diatype">Avg Level</p>
            <p className="text-sm font-semibold text-cyan-400 font-gendy">
              {avgLevel.toFixed(1)}
            </p>
          </div>
          <div className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-gray-500 font-diatype">Champions</p>
            <p className="text-sm font-semibold text-yellow-400 font-gendy">
              {championsCount}
            </p>
          </div>
          <div className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-gray-500 font-diatype">Avg Readiness</p>
            <p className={cn(
              'text-sm font-semibold font-gendy',
              getReadinessColor(avgReadiness)
            )}>
              {avgReadiness.toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      {/* Profile Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map((profile, index) => (
          <ProfileCard
            key={profile.name}
            profile={profile}
            showPsychology={showPsychology}
            showTools={showTools}
            isExpanded={expandedId === profile.name}
            onToggle={() => handleToggle(profile)}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}

export default SkillsMappingTable
