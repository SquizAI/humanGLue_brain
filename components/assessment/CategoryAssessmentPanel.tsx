'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/utils/cn'
import { AssessmentCategory, ColorTheme } from './types'
import { DimensionScoresGrid } from './DimensionScoresGrid'

export interface CategoryAssessmentPanelProps {
  /** Category data to display */
  category: AssessmentCategory
  /** Whether the panel is expanded by default */
  defaultExpanded?: boolean
  /** Whether to show evidence in dimension details */
  showEvidence?: boolean
  /** Callback when panel is expanded/collapsed */
  onToggle?: (categoryId: string, isExpanded: boolean) => void
  /** Custom className */
  className?: string
  /** Animation delay */
  animationDelay?: number
}

const getColorClasses = (color: ColorTheme) => {
  const colors: Record<ColorTheme, {
    gradient: string
    bg: string
    text: string
    border: string
    bgHover: string
  }> = {
    cyan: {
      gradient: 'from-cyan-500 to-blue-500',
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-400',
      border: 'border-cyan-500/20',
      bgHover: 'hover:bg-cyan-500/20',
    },
    blue: {
      gradient: 'from-blue-500 to-indigo-500',
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/20',
      bgHover: 'hover:bg-blue-500/20',
    },
    purple: {
      gradient: 'from-purple-500 to-pink-500',
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/20',
      bgHover: 'hover:bg-purple-500/20',
    },
    green: {
      gradient: 'from-green-500 to-emerald-500',
      bg: 'bg-green-500/10',
      text: 'text-green-400',
      border: 'border-green-500/20',
      bgHover: 'hover:bg-green-500/20',
    },
    orange: {
      gradient: 'from-orange-500 to-amber-500',
      bg: 'bg-orange-500/10',
      text: 'text-orange-400',
      border: 'border-orange-500/20',
      bgHover: 'hover:bg-orange-500/20',
    },
    red: {
      gradient: 'from-red-500 to-rose-500',
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      border: 'border-red-500/20',
      bgHover: 'hover:bg-red-500/20',
    },
    amber: {
      gradient: 'from-amber-500 to-yellow-500',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/20',
      bgHover: 'hover:bg-amber-500/20',
    },
  }
  return colors[color]
}

const getScoreBarWidth = (score: number): number => {
  const normalized = ((score + 2) / 12) * 100
  return Math.max(0, Math.min(100, normalized))
}

const getScoreBarColor = (score: number): string => {
  if (score >= 5) return 'from-green-500 to-emerald-500'
  if (score >= 2) return 'from-cyan-500 to-blue-500'
  if (score >= 0) return 'from-yellow-500 to-orange-500'
  return 'from-red-500 to-rose-500'
}

export function CategoryAssessmentPanel({
  category,
  defaultExpanded = false,
  showEvidence = true,
  onToggle,
  className,
  animationDelay = 0,
}: CategoryAssessmentPanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const colorClasses = getColorClasses(category.color)
  const Icon = category.icon

  const handleToggle = () => {
    const newExpandedState = !isExpanded
    setIsExpanded(newExpandedState)
    onToggle?.(category.id, newExpandedState)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay }}
      className={cn(
        'bg-white/5 backdrop-blur-xl rounded-2xl border overflow-hidden',
        category.critical ? 'border-red-500/30' : 'border-white/10',
        className
      )}
    >
      {/* Category Header */}
      <button
        onClick={handleToggle}
        className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            'p-3 rounded-xl bg-gradient-to-br',
            colorClasses.gradient
          )}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-semibold text-white font-gendy">
                {category.name}
              </h3>
              {category.critical && (
                <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-diatype">
                  CRITICAL
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-400 font-diatype">
              {category.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className={cn(
              'text-2xl font-bold font-gendy',
              category.critical ? 'text-red-400' : colorClasses.text
            )}>
              {category.average.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 font-diatype">/10</p>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Category Score Bar */}
      <div className="px-4 sm:px-6 pb-4">
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${getScoreBarWidth(category.average)}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={cn(
              'h-full bg-gradient-to-r rounded-full',
              getScoreBarColor(category.average)
            )}
          />
        </div>
      </div>

      {/* Dimensions */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/10"
          >
            <div className="p-4 sm:p-6">
              <DimensionScoresGrid
                dimensions={category.dimensions}
                showEvidence={showEvidence}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export interface CategoryAssessmentListProps {
  /** Array of categories to display */
  categories: AssessmentCategory[]
  /** Default expanded category ID */
  defaultExpandedId?: string
  /** Whether to show evidence in dimension details */
  showEvidence?: boolean
  /** Whether to allow multiple panels to be expanded */
  allowMultiple?: boolean
  /** Custom className */
  className?: string
}

export function CategoryAssessmentList({
  categories,
  defaultExpandedId,
  showEvidence = true,
  allowMultiple = false,
  className,
}: CategoryAssessmentListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    defaultExpandedId ? new Set([defaultExpandedId]) : new Set()
  )

  const handleToggle = (categoryId: string, isExpanded: boolean) => {
    setExpandedIds((prev) => {
      const next = new Set(allowMultiple ? prev : [])
      if (isExpanded) {
        next.add(categoryId)
      } else {
        next.delete(categoryId)
      }
      return next
    })
  }

  return (
    <div className={cn('space-y-4', className)}>
      {categories.map((category, index) => (
        <CategoryAssessmentPanel
          key={category.id}
          category={category}
          defaultExpanded={expandedIds.has(category.id)}
          showEvidence={showEvidence}
          onToggle={handleToggle}
          animationDelay={index * 0.1}
        />
      ))}
    </div>
  )
}

export default CategoryAssessmentPanel
