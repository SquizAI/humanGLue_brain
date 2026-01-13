'use client'

import { motion } from 'framer-motion'
import { AlertCircle, TrendingUp, Award } from 'lucide-react'
import { cn } from '@/utils/cn'
import { MaturityScore, MATURITY_LEVELS } from './types'

export interface MaturityScoreCardProps {
  /** Overall maturity score (0-10 scale) */
  score: number
  /** Current maturity level (-2 to 10) */
  maturityLevel: MaturityScore
  /** Maturity level name (optional - will be derived from level if not provided) */
  maturityName?: string
  /** Organization name for display */
  organizationName?: string
  /** Description text to show below the level */
  description?: string
  /** Target maturity level for reference */
  targetLevel?: MaturityScore
  /** Status tags to display */
  statusTags?: Array<{
    label: string
    variant: 'critical' | 'warning' | 'info' | 'success'
  }>
  /** Custom className */
  className?: string
  /** Animation delay */
  animationDelay?: number
}

const getScoreGradient = (score: number): string => {
  if (score >= 7) return 'from-green-500 to-emerald-500'
  if (score >= 4) return 'from-cyan-500 to-blue-500'
  if (score >= 2) return 'from-yellow-500 to-amber-500'
  return 'from-orange-500 to-red-500'
}

const getScoreBorderClass = (score: number): string => {
  if (score >= 7) return 'border-green-500/20'
  if (score >= 4) return 'border-cyan-500/20'
  if (score >= 2) return 'border-yellow-500/20'
  return 'border-red-500/20'
}

const getScoreTextClass = (score: number): string => {
  if (score >= 7) return 'from-green-400 to-emerald-400'
  if (score >= 4) return 'from-cyan-400 to-blue-400'
  if (score >= 2) return 'from-yellow-400 to-amber-400'
  return 'from-orange-400 to-red-400'
}

const getScoreBgClass = (score: number): string => {
  if (score >= 7) return 'from-green-500/10 via-emerald-500/5 to-transparent'
  if (score >= 4) return 'from-cyan-500/10 via-blue-500/5 to-transparent'
  if (score >= 2) return 'from-yellow-500/10 via-amber-500/5 to-transparent'
  return 'from-red-500/10 via-orange-500/5 to-transparent'
}

const getTagClasses = (variant: 'critical' | 'warning' | 'info' | 'success'): string => {
  const variants = {
    critical: 'bg-red-500/10 border-red-500/20 text-red-400',
    warning: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
    info: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    success: 'bg-green-500/10 border-green-500/20 text-green-400',
  }
  return variants[variant]
}

const getIconByScore = (score: number) => {
  if (score >= 7) return Award
  if (score >= 4) return TrendingUp
  return AlertCircle
}

export function MaturityScoreCard({
  score,
  maturityLevel,
  maturityName,
  organizationName,
  description,
  targetLevel,
  statusTags = [],
  className,
  animationDelay = 0,
}: MaturityScoreCardProps) {
  const levelName = maturityName || MATURITY_LEVELS[maturityLevel]
  const Icon = getIconByScore(score)

  // Calculate progress for the circular indicator (normalize -2 to 10 scale to 0-100%)
  const normalizedProgress = ((score + 2) / 12) * 100
  const circumference = 2 * Math.PI * 45 // radius is 45%

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.5 }}
      className={cn(
        'bg-gradient-to-br rounded-2xl p-6 sm:p-8 border',
        getScoreBgClass(score),
        getScoreBorderClass(score),
        className
      )}
    >
      <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
        {/* Circular Score Indicator */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex-shrink-0">
          <svg className="transform -rotate-90 w-full h-full">
            {/* Background circle */}
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-white/10"
            />
            {/* Progress circle */}
            <motion.circle
              cx="50%"
              cy="50%"
              r="45%"
              stroke={`url(#scoreGradient-${maturityLevel})`}
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference * (1 - normalizedProgress / 100) }}
              transition={{ duration: 1.5, delay: animationDelay + 0.3, ease: 'easeOut' }}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient
                id={`scoreGradient-${maturityLevel}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                {score >= 7 ? (
                  <>
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </>
                ) : score >= 4 ? (
                  <>
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </>
                ) : score >= 2 ? (
                  <>
                    <stop offset="0%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </>
                )}
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: animationDelay + 0.5, duration: 0.3 }}
              className="text-4xl sm:text-5xl font-bold text-white font-gendy"
            >
              {score.toFixed(1)}
            </motion.span>
            <span className="text-gray-400 text-sm font-diatype">out of 10</span>
          </div>
        </div>

        {/* Score Details */}
        <div className="flex-1 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
            <Icon className={cn(
              'w-6 h-6 sm:w-8 sm:h-8',
              score >= 7 ? 'text-green-400' :
              score >= 4 ? 'text-cyan-400' :
              score >= 2 ? 'text-yellow-400' :
              'text-orange-400'
            )} />
            <div>
              <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider font-diatype">
                Maturity Level {maturityLevel}
              </p>
              <h2 className={cn(
                'text-2xl sm:text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent font-gendy',
                getScoreTextClass(score)
              )}>
                {levelName}
              </h2>
            </div>
          </div>

          {description && (
            <p className="text-gray-300 font-diatype text-sm mb-4">
              {description}
            </p>
          )}

          {/* Status Tags */}
          {statusTags.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              {statusTags.map((tag, index) => (
                <motion.span
                  key={tag.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: animationDelay + 0.6 + index * 0.1 }}
                  className={cn(
                    'px-3 py-1 border text-xs rounded-full font-diatype',
                    getTagClasses(tag.variant)
                  )}
                >
                  {tag.label}
                </motion.span>
              ))}
            </div>
          )}

          {/* Target Level Indicator */}
          {targetLevel !== undefined && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: animationDelay + 0.8 }}
              className="mt-4 flex items-center gap-2 justify-center lg:justify-start"
            >
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-gray-400 font-diatype">
                Target: Level {targetLevel} ({MATURITY_LEVELS[targetLevel]})
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default MaturityScoreCard
