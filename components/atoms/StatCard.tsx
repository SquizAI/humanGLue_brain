'use client'

import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'
import { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: {
    value: number
    label?: string
    direction?: 'up' | 'down' | 'neutral'
  }
  variant?: 'default' | 'cyan' | 'success' | 'warning' | 'danger'
  className?: string
  animate?: boolean
  onClick?: () => void
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  className,
  animate = true,
  onClick
}: StatCardProps) {
  // Theme-aware card styling
  const cardClasses = cn(
    // Base styles
    'hg-bg-card',
    'hg-border border',
    'rounded-xl',
    'p-6',
    'transition-all duration-300',
    // Hover effects
    onClick && 'cursor-pointer hover:border-[var(--hg-cyan-border)] hover:-translate-y-1',
    className
  )

  // Icon background variants
  const iconVariants = {
    default: 'hg-bg-secondary hg-text-primary',
    cyan: 'bg-[var(--hg-cyan-bg)] text-[var(--hg-cyan-text)]',
    success: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400',
    warning: 'bg-amber-500/10 text-amber-500 dark:text-amber-400',
    danger: 'bg-red-500/10 text-red-500 dark:text-red-400'
  }

  // Trend color based on direction
  const getTrendColor = () => {
    if (!trend) return ''
    const direction = trend.direction || (trend.value >= 0 ? 'up' : 'down')
    switch (direction) {
      case 'up':
        return 'text-emerald-500 dark:text-emerald-400'
      case 'down':
        return 'text-red-500 dark:text-red-400'
      case 'neutral':
        return 'hg-text-muted'
      default:
        return 'hg-text-muted'
    }
  }

  const getTrendIcon = () => {
    if (!trend) return null
    const direction = trend.direction || (trend.value >= 0 ? 'up' : 'down')
    switch (direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />
      case 'down':
        return <TrendingDown className="w-4 h-4" />
      default:
        return <Minus className="w-4 h-4" />
    }
  }

  const content = (
    <>
      {/* Header: Icon and Title */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium hg-text-secondary">{title}</span>
        {icon && (
          <div
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              iconVariants[variant]
            )}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-2">
        <span className="text-3xl font-bold hg-text-primary">{value}</span>
      </div>

      {/* Subtitle and Trend */}
      <div className="flex items-center justify-between">
        {subtitle && (
          <span className="text-sm hg-text-muted">{subtitle}</span>
        )}
        {trend && (
          <div className={cn('flex items-center gap-1', getTrendColor())}>
            {getTrendIcon()}
            <span className="text-sm font-medium">
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </span>
            {trend.label && (
              <span className="text-xs hg-text-muted ml-1">{trend.label}</span>
            )}
          </div>
        )}
      </div>
    </>
  )

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={onClick ? { scale: 1.02 } : undefined}
        className={cardClasses}
        onClick={onClick}
      >
        {content}
      </motion.div>
    )
  }

  return (
    <div className={cardClasses} onClick={onClick}>
      {content}
    </div>
  )
}

// Mini stat for inline display
export interface MiniStatProps {
  label: string
  value: string | number
  icon?: ReactNode
  variant?: 'default' | 'cyan' | 'success' | 'warning' | 'danger'
  className?: string
}

export function MiniStat({
  label,
  value,
  icon,
  variant = 'default',
  className
}: MiniStatProps) {
  const textColors = {
    default: 'hg-text-primary',
    cyan: 'text-[var(--hg-cyan-text)]',
    success: 'text-emerald-500 dark:text-emerald-400',
    warning: 'text-amber-500 dark:text-amber-400',
    danger: 'text-red-500 dark:text-red-400'
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {icon && <span className={textColors[variant]}>{icon}</span>}
      <div className="flex flex-col">
        <span className={cn('text-lg font-semibold', textColors[variant])}>
          {value}
        </span>
        <span className="text-xs hg-text-muted">{label}</span>
      </div>
    </div>
  )
}
