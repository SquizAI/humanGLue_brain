'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Info, Quote, AlertCircle } from 'lucide-react'
import { cn } from '@/utils/cn'
import { AssessmentDimension, InterviewQuote } from './types'

export interface DimensionScoresGridProps {
  /** Array of dimensions to display */
  dimensions: AssessmentDimension[]
  /** Number of columns (responsive) */
  columns?: 1 | 2 | 3 | 4
  /** Whether to show evidence by default */
  showEvidence?: boolean
  /** Callback when a dimension is clicked */
  onDimensionClick?: (dimension: AssessmentDimension) => void
  /** Custom className */
  className?: string
}

const getScoreColor = (score: number): string => {
  if (score >= 5) return 'text-green-400'
  if (score >= 2) return 'text-cyan-400'
  if (score >= 0) return 'text-yellow-400'
  return 'text-red-400'
}

const getScoreBarWidth = (score: number): number => {
  // Normalize score from -2 to 10 scale to 0-100%
  const normalized = ((score + 2) / 12) * 100
  return Math.max(0, Math.min(100, normalized))
}

const getScoreBarColor = (score: number): string => {
  if (score >= 5) return 'from-green-500 to-emerald-500'
  if (score >= 2) return 'from-cyan-500 to-blue-500'
  if (score >= 0) return 'from-yellow-500 to-orange-500'
  return 'from-red-500 to-rose-500'
}

const getSentimentClass = (sentiment: InterviewQuote['sentiment']): string => {
  const classes = {
    positive: 'bg-green-500/5 border-green-500',
    negative: 'bg-red-500/5 border-red-500',
    neutral: 'bg-white/5 border-gray-500',
  }
  return classes[sentiment]
}

interface DimensionCardProps {
  dimension: AssessmentDimension
  showEvidence: boolean
  index: number
  onDimensionClick?: (dimension: AssessmentDimension) => void
}

function DimensionCard({ dimension, showEvidence, index, onDimensionClick }: DimensionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleClick = () => {
    if (onDimensionClick) {
      onDimensionClick(dimension)
    }
    setIsExpanded(!isExpanded)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'rounded-xl border overflow-hidden',
        dimension.critical
          ? 'border-red-500/30 bg-red-500/5'
          : 'border-white/10 bg-white/5'
      )}
    >
      {/* Dimension Header */}
      <button
        onClick={handleClick}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-white font-diatype">
                {dimension.name}
              </h4>
              {dimension.critical && (
                <AlertCircle className="w-4 h-4 text-red-400" />
              )}
            </div>
            <p className="text-xs text-gray-500 font-diatype">
              {dimension.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-24 hidden sm:block">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getScoreBarWidth(dimension.score)}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={cn(
                  'h-full bg-gradient-to-r rounded-full',
                  getScoreBarColor(dimension.score)
                )}
              />
            </div>
          </div>
          <span className={cn(
            'text-lg font-bold font-gendy min-w-[50px] text-right',
            getScoreColor(dimension.score)
          )}>
            {dimension.score.toFixed(1)}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/10"
          >
            <div className="p-4 space-y-4">
              {/* Reasoning */}
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-2">
                  <Info className="w-4 h-4 text-cyan-400 mt-0.5" />
                  <h5 className="text-sm font-semibold text-cyan-400 font-diatype">
                    Why this score?
                  </h5>
                </div>
                <p className="text-sm text-gray-300 font-diatype">
                  {dimension.reasoning}
                </p>
              </div>

              {/* Evidence */}
              {showEvidence && dimension.evidence && dimension.evidence.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 font-diatype flex items-center gap-2">
                    <Quote className="w-4 h-4" />
                    Evidence from Interviews
                  </h5>
                  <div className="space-y-2">
                    {dimension.evidence.map((ev, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          'p-3 rounded-lg border-l-2',
                          getSentimentClass(ev.sentiment)
                        )}
                      >
                        <p className="text-sm text-gray-300 font-diatype italic">
                          &ldquo;{ev.quote}&rdquo;
                        </p>
                        <p className="text-xs text-gray-500 font-diatype mt-1">
                          - {ev.speaker}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gaps & Next Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2 font-diatype">
                    Gaps Identified
                  </h5>
                  <ul className="space-y-1">
                    {dimension.gaps.map((gap, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-gray-400 font-diatype"
                      >
                        <span className="text-red-400">-</span>
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2 font-diatype">
                    Recommended Actions
                  </h5>
                  <ul className="space-y-1">
                    {dimension.nextSteps.map((step, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-gray-400 font-diatype"
                      >
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
    </motion.div>
  )
}

export function DimensionScoresGrid({
  dimensions,
  columns = 1,
  showEvidence = true,
  onDimensionClick,
  className,
}: DimensionScoresGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={cn('grid gap-4', gridClasses[columns], className)}>
      {dimensions.map((dimension, index) => (
        <DimensionCard
          key={dimension.id}
          dimension={dimension}
          showEvidence={showEvidence}
          index={index}
          onDimensionClick={onDimensionClick}
        />
      ))}
    </div>
  )
}

export default DimensionScoresGrid
