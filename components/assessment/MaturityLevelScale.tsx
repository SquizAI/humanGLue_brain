'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, ChevronUp, CheckCircle, Users, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/utils/cn'
import { MaturityLevel, MaturityScore } from './types'

export interface MaturityLevelScaleProps {
  /** All maturity level definitions */
  levels: MaturityLevel[]
  /** Current organization level */
  currentLevel: MaturityScore
  /** Organization name for display */
  organizationName?: string
  /** Callback when a level is selected */
  onLevelSelect?: (level: MaturityLevel) => void
  /** Whether to show compact view */
  compact?: boolean
  /** Custom className */
  className?: string
}

const getLevelClasses = (level: MaturityScore, currentLevel: MaturityScore, isSelected: boolean) => {
  if (isSelected) {
    return 'bg-cyan-500/20 border-cyan-500/50 ring-2 ring-cyan-500/30'
  }
  if (level === currentLevel) {
    return 'bg-orange-500/20 border-orange-500/50 ring-2 ring-orange-500/30'
  }
  if (level < 0) {
    return 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
  }
  if (level <= currentLevel) {
    return 'bg-green-500/5 border-green-500/20 hover:border-green-500/40'
  }
  return 'bg-white/5 border-white/10 hover:border-white/30'
}

const getLevelTextClasses = (level: MaturityScore, currentLevel: MaturityScore, isSelected: boolean) => {
  if (isSelected) return 'text-cyan-400'
  if (level === currentLevel) return 'text-orange-400'
  return 'text-gray-400'
}

export function MaturityLevelScale({
  levels,
  currentLevel,
  organizationName = 'Your Organization',
  onLevelSelect,
  compact = false,
  className,
}: MaturityLevelScaleProps) {
  const [selectedLevel, setSelectedLevel] = useState<MaturityScore | null>(null)

  const handleLevelClick = (level: MaturityLevel) => {
    const newSelectedLevel = selectedLevel === level.level ? null : level.level
    setSelectedLevel(newSelectedLevel as MaturityScore | null)
    if (onLevelSelect && newSelectedLevel !== null) {
      onLevelSelect(level)
    }
  }

  const currentLevelData = levels.find(l => l.level === currentLevel)

  return (
    <div className={cn('bg-white/5 rounded-2xl border border-white/10 p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white font-gendy flex items-center gap-2">
          <Award className="w-5 h-5 text-cyan-400" />
          AI Maturity Framework
        </h3>
        <p className="text-xs text-gray-400 font-diatype">
          Click any level to see full definition
        </p>
      </div>

      {/* Level Scale */}
      <div className="overflow-x-auto">
        <div className={cn(
          'flex gap-2 pb-2',
          compact ? 'min-w-max' : 'flex-wrap'
        )}>
          {levels.map((level, index) => {
            const isSelected = selectedLevel === level.level
            const isCurrent = level.level === currentLevel

            return (
              <motion.div
                key={level.level}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLevelClick(level)}
                className={cn(
                  'cursor-pointer flex-shrink-0 p-3 rounded-xl border transition-all',
                  compact ? 'w-32' : 'w-32 sm:w-36',
                  getLevelClasses(level.level, currentLevel, isSelected)
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    'text-xs font-bold font-diatype',
                    getLevelTextClasses(level.level, currentLevel, isSelected)
                  )}>
                    Level {level.level}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] bg-orange-500/30 text-orange-300 px-1.5 py-0.5 rounded font-diatype">
                      YOU
                    </span>
                  )}
                </div>
                <p className={cn(
                  'text-sm font-semibold font-gendy',
                  isSelected ? 'text-cyan-300' : isCurrent ? 'text-orange-300' : 'text-gray-300'
                )}>
                  {level.name}
                </p>
                <p className="text-[10px] text-gray-500 mt-1 font-diatype line-clamp-2">
                  {level.description}
                </p>
              </motion.div>
            )
          })}
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
              const level = levels.find(l => l.level === selectedLevel)
              if (!level) return null

              const isCurrent = level.level === currentLevel

              return (
                <div className={cn(
                  'rounded-xl p-5 border',
                  isCurrent
                    ? 'bg-orange-500/10 border-orange-500/30'
                    : level.level < 0
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-cyan-500/10 border-cyan-500/30'
                )}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={cn(
                          'text-2xl font-bold font-gendy',
                          isCurrent ? 'text-orange-400' :
                          level.level < 0 ? 'text-red-400' : 'text-cyan-400'
                        )}>
                          Level {level.level}
                        </span>
                        <h4 className="text-xl font-semibold text-white font-gendy">
                          {level.name}
                        </h4>
                        {isCurrent && (
                          <span className="text-xs bg-orange-500/30 text-orange-300 px-2 py-1 rounded-full font-diatype">
                            {organizationName} Current Position
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
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm text-gray-300 font-diatype"
                          >
                            <span className="text-cyan-400 mt-1">-</span>
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
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm text-gray-300 font-diatype"
                          >
                            <span className="text-purple-400 mt-1">-</span>
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
                      {isCurrent && (
                        <p className="text-xs text-gray-400 font-diatype">
                          With focused effort, {organizationName} can reach the next level within this timeframe.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Progress Indicator for current level */}
                  {isCurrent && (
                    <div className="mt-4 p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-400" />
                        <div>
                          <p className="text-sm font-semibold text-orange-300 font-diatype">
                            This is {organizationName}&apos;s current maturity level
                          </p>
                          <p className="text-xs text-gray-400 font-diatype mt-1">
                            Based on comprehensive assessment data and interviews
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
  )
}

export default MaturityLevelScale
