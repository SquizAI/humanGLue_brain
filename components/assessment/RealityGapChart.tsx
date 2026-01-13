'use client'

import { motion } from 'framer-motion'
import { Eye, AlertTriangle, TrendingUp, TrendingDown, Info } from 'lucide-react'
import { cn } from '@/utils/cn'
import { RealityGapData, PerceptionGap } from './types'

export interface RealityGapChartProps {
  /** Reality gap data to display */
  data: RealityGapData
  /** Title for the section */
  title?: string
  /** Whether to show insights section */
  showInsights?: boolean
  /** Custom className */
  className?: string
}

interface GapBarProps {
  gap: PerceptionGap
  index: number
  maxScore?: number
}

function GapBar({ gap, index, maxScore = 10 }: GapBarProps) {
  const perceivedPercent = (gap.perceivedScore / maxScore) * 100
  const actualPercent = (gap.actualScore / maxScore) * 100
  const gapIsPositive = gap.gapSize > 0 // Overestimating
  const gapIsNegative = gap.gapSize < 0 // Underestimating
  const absGap = Math.abs(gap.gapSize)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white font-diatype">
          {gap.dimension}
        </span>
        <div className="flex items-center gap-3">
          {/* Gap Indicator */}
          <div className={cn(
            'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-diatype',
            gapIsPositive
              ? 'bg-amber-500/10 text-amber-400'
              : gapIsNegative
              ? 'bg-green-500/10 text-green-400'
              : 'bg-gray-500/10 text-gray-400'
          )}>
            {gapIsPositive ? (
              <>
                <TrendingUp className="w-3 h-3" />
                +{gap.gapSize.toFixed(1)}
              </>
            ) : gapIsNegative ? (
              <>
                <TrendingDown className="w-3 h-3" />
                {gap.gapSize.toFixed(1)}
              </>
            ) : (
              <>
                = 0
              </>
            )}
          </div>
        </div>
      </div>

      {/* Dual Bar */}
      <div className="relative h-8 bg-white/5 rounded-lg overflow-hidden">
        {/* Perceived Score Bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${perceivedPercent}%` }}
          transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
          className="absolute top-0 left-0 h-1/2 bg-gradient-to-r from-purple-500/70 to-purple-400/70 rounded-tr-lg"
        />

        {/* Actual Score Bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${actualPercent}%` }}
          transition={{ duration: 0.8, delay: index * 0.1 + 0.4 }}
          className="absolute bottom-0 left-0 h-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-br-lg"
        />

        {/* Score Labels */}
        <div className="absolute inset-0 flex items-center">
          <div className="flex-1 flex justify-end items-center h-1/2 pr-2">
            <span className="text-[10px] text-purple-300 font-diatype font-medium">
              {gap.perceivedScore.toFixed(1)}
            </span>
          </div>
        </div>
        <div className="absolute inset-0 flex items-end">
          <div className="flex-1 flex justify-end items-center h-1/2 pr-2">
            <span className="text-[10px] text-cyan-300 font-diatype font-medium">
              {gap.actualScore.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Analysis (on hover or always visible) */}
      {gap.analysis && (
        <p className="text-xs text-gray-500 font-diatype mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {gap.analysis}
        </p>
      )}
    </motion.div>
  )
}

export function RealityGapChart({
  data,
  title = 'Perception vs Reality Gap',
  showInsights = true,
  className,
}: RealityGapChartProps) {
  const overallGap = data.overallPerceived - data.overallActual
  const hasSignificantGap = Math.abs(overallGap) > 1

  // Sort dimensions by gap size (largest gaps first)
  const sortedDimensions = [...data.dimensions].sort(
    (a, b) => Math.abs(b.gapSize) - Math.abs(a.gapSize)
  )

  return (
    <div className={cn(
      'bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6',
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white font-gendy flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-400" />
            {title}
          </h3>
          <p className="text-xs text-gray-400 font-diatype mt-1">
            Comparing self-reported perception vs assessed reality
          </p>
        </div>

        {/* Overall Gap Summary */}
        <div className={cn(
          'px-4 py-2 rounded-xl border',
          hasSignificantGap
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-green-500/10 border-green-500/30'
        )}>
          <div className="flex items-center gap-2">
            {hasSignificantGap ? (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            ) : (
              <TrendingUp className="w-4 h-4 text-green-400" />
            )}
            <div className="text-right">
              <p className={cn(
                'text-lg font-bold font-gendy',
                hasSignificantGap ? 'text-amber-400' : 'text-green-400'
              )}>
                {overallGap > 0 ? '+' : ''}{overallGap.toFixed(1)}
              </p>
              <p className="text-[10px] text-gray-400 font-diatype">Overall Gap</p>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-2 rounded bg-gradient-to-r from-purple-500/70 to-purple-400/70" />
          <span className="text-xs text-gray-400 font-diatype">
            Perceived ({data.overallPerceived.toFixed(1)})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-2 rounded bg-gradient-to-r from-cyan-500 to-blue-500" />
          <span className="text-xs text-gray-400 font-diatype">
            Actual ({data.overallActual.toFixed(1)})
          </span>
        </div>
      </div>

      {/* Gap Bars */}
      <div className="space-y-4">
        {sortedDimensions.map((gap, index) => (
          <GapBar key={gap.dimension} gap={gap} index={index} />
        ))}
      </div>

      {/* Insights Section */}
      {showInsights && data.insights && data.insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 pt-6 border-t border-white/10"
        >
          <h4 className="text-sm font-semibold text-cyan-400 font-diatype flex items-center gap-2 mb-3">
            <Info className="w-4 h-4" />
            Key Insights
          </h4>
          <ul className="space-y-2">
            {data.insights.map((insight, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-sm text-gray-300 font-diatype"
              >
                <span className="text-cyan-400 mt-1">-</span>
                {insight}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Interpretation Guide */}
      <div className="mt-6 p-4 bg-white/5 rounded-xl">
        <p className="text-xs text-gray-500 font-diatype">
          <span className="text-amber-400">Positive gap (+)</span> indicates overestimation of capabilities.
          <span className="text-green-400 ml-2">Negative gap (-)</span> indicates underestimation or realistic assessment.
          Significant gaps ({'>'}1.0) suggest areas where expectations may need alignment.
        </p>
      </div>
    </div>
  )
}

export default RealityGapChart
