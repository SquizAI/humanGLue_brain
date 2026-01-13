'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Target,
  Zap,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { TimelinePhase, Recommendation } from './types'

export interface RecommendationsTimelineProps {
  /** Timeline phases to display */
  phases: TimelinePhase[]
  /** Currently active phase ID */
  activePhaseId?: string
  /** Callback when a phase is selected */
  onPhaseSelect?: (phaseId: string) => void
  /** Whether to show compact view */
  compact?: boolean
  /** Custom className */
  className?: string
}

const getPriorityClasses = (priority: Recommendation['priority']) => {
  const classes = {
    critical: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      badge: 'bg-red-500/20 text-red-400',
    },
    high: {
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      text: 'text-orange-400',
      badge: 'bg-orange-500/20 text-orange-400',
    },
    medium: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      badge: 'bg-yellow-500/20 text-yellow-400',
    },
    low: {
      bg: 'bg-gray-500/10',
      border: 'border-gray-500/30',
      text: 'text-gray-400',
      badge: 'bg-gray-500/20 text-gray-400',
    },
  }
  return classes[priority]
}

const getEffortImpactClass = (level: 'low' | 'medium' | 'high') => {
  const classes = {
    low: 'text-green-400',
    medium: 'text-yellow-400',
    high: 'text-red-400',
  }
  return classes[level]
}

interface RecommendationCardProps {
  recommendation: Recommendation
  index: number
}

function RecommendationCard({ recommendation, index }: RecommendationCardProps) {
  const priorityClasses = getPriorityClasses(recommendation.priority)

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'p-4 rounded-xl border',
        priorityClasses.border,
        priorityClasses.bg
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h5 className="text-sm font-semibold text-white font-diatype">
              {recommendation.title}
            </h5>
            <span className={cn(
              'text-[10px] px-2 py-0.5 rounded-full uppercase font-diatype',
              priorityClasses.badge
            )}>
              {recommendation.priority}
            </span>
          </div>
          <p className="text-xs text-gray-400 font-diatype">
            {recommendation.description}
          </p>

          {/* Category & Related Dimensions */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-500 font-diatype">
              {recommendation.category}
            </span>
            {recommendation.relatedDimensions?.slice(0, 2).map((dim) => (
              <span
                key={dim}
                className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-diatype"
              >
                {dim}
              </span>
            ))}
          </div>
        </div>

        {/* Effort/Impact Indicators */}
        <div className="flex flex-col gap-1 text-right">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-gray-500" />
            <span className={cn(
              'text-[10px] font-diatype',
              getEffortImpactClass(recommendation.effort)
            )}>
              {recommendation.effort} effort
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-gray-500" />
            <span className={cn(
              'text-[10px] font-diatype',
              recommendation.impact === 'high' ? 'text-green-400' : getEffortImpactClass(recommendation.impact)
            )}>
              {recommendation.impact} impact
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

interface PhaseCardProps {
  phase: TimelinePhase
  isActive: boolean
  isExpanded: boolean
  onToggle: () => void
  index: number
}

function PhaseCard({ phase, isActive, isExpanded, onToggle, index }: PhaseCardProps) {
  const criticalCount = phase.recommendations.filter(r => r.priority === 'critical').length
  const highCount = phase.recommendations.filter(r => r.priority === 'high').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        'rounded-2xl border overflow-hidden transition-all',
        isActive
          ? 'border-cyan-500/50 ring-2 ring-cyan-500/20 bg-cyan-500/5'
          : 'border-white/10 bg-white/5 hover:border-white/20'
      )}
    >
      {/* Phase Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          {/* Timeline Node */}
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center font-bold font-gendy text-lg',
            isActive
              ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white'
              : 'bg-white/10 text-gray-400'
          )}>
            {phase.days}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className={cn(
                'text-lg font-semibold font-gendy',
                isActive ? 'text-cyan-400' : 'text-white'
              )}>
                {phase.label}
              </h3>
              {isActive && (
                <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-diatype">
                  CURRENT
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 font-diatype">{phase.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Priority Summary */}
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 rounded-lg text-xs font-diatype">
                <AlertCircle className="w-3 h-3" />
                {criticalCount}
              </span>
            )}
            {highCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 bg-orange-500/10 text-orange-400 rounded-lg text-xs font-diatype">
                <Zap className="w-3 h-3" />
                {highCount}
              </span>
            )}
            <span className="text-xs text-gray-500 font-diatype">
              {phase.recommendations.length} actions
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Phase Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/10"
          >
            <div className="p-4 sm:p-6 space-y-6">
              {/* Description */}
              <p className="text-sm text-gray-300 font-diatype">
                {phase.description}
              </p>

              {/* Milestones & Outcomes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Milestones */}
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3 font-diatype flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Key Milestones
                  </h4>
                  <ul className="space-y-2">
                    {phase.milestones.map((milestone, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-gray-300 font-diatype"
                      >
                        <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                        {milestone}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Expected Outcomes */}
                <div className="bg-green-500/5 rounded-xl p-4 border border-green-500/20">
                  <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-3 font-diatype flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Expected Outcomes
                  </h4>
                  <ul className="space-y-2">
                    {phase.outcomes.map((outcome, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-gray-300 font-diatype"
                      >
                        <span className="text-green-400">+</span>
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="text-sm font-semibold text-white font-diatype mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  Recommended Actions
                </h4>
                <div className="space-y-3">
                  {phase.recommendations.map((rec, idx) => (
                    <RecommendationCard
                      key={rec.id}
                      recommendation={rec}
                      index={idx}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function RecommendationsTimeline({
  phases,
  activePhaseId,
  onPhaseSelect,
  compact = false,
  className,
}: RecommendationsTimelineProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    activePhaseId ? new Set([activePhaseId]) : new Set()
  )

  const handleToggle = (phaseId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(phaseId)) {
        next.delete(phaseId)
      } else {
        if (!compact) {
          // In non-compact mode, allow multiple expansions
          next.add(phaseId)
        } else {
          // In compact mode, only one at a time
          return new Set([phaseId])
        }
      }
      return next
    })
    onPhaseSelect?.(phaseId)
  }

  // Calculate summary stats
  const totalRecommendations = phases.reduce(
    (sum, phase) => sum + phase.recommendations.length,
    0
  )
  const criticalCount = phases.reduce(
    (sum, phase) =>
      sum + phase.recommendations.filter((r) => r.priority === 'critical').length,
    0
  )

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white font-gendy flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            Implementation Roadmap
          </h3>
          <p className="text-xs text-gray-400 font-diatype mt-1">
            {phases.length} phases | {totalRecommendations} recommendations
          </p>
        </div>
        {criticalCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400 font-diatype">
              {criticalCount} critical
            </span>
          </div>
        )}
      </div>

      {/* Timeline Phases */}
      <div className="relative">
        {/* Connecting Line */}
        <div className="absolute left-6 top-12 bottom-12 w-0.5 bg-gradient-to-b from-cyan-500/50 via-purple-500/50 to-pink-500/50 hidden md:block" />

        <div className="space-y-4">
          {phases.map((phase, index) => (
            <PhaseCard
              key={phase.id}
              phase={phase}
              isActive={phase.id === activePhaseId}
              isExpanded={expandedIds.has(phase.id)}
              onToggle={() => handleToggle(phase.id)}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default RecommendationsTimeline
