'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '../../utils/cn'

export interface BadgeProps extends HTMLMotionProps<"span"> {
  variant?: 'default' | 'cyan' | 'success' | 'warning' | 'danger' | 'info' | 'outline'
  size?: 'xs' | 'sm' | 'md'
  animate?: boolean
  dot?: boolean
}

export function Badge({
  children,
  className,
  variant = 'default',
  size = 'sm',
  animate = true,
  dot = false,
  ...props
}: BadgeProps) {
  // Use CSS variables for theme-aware colors
  const variants = {
    // Default uses theme secondary background
    default: 'hg-bg-secondary hg-text-primary hg-border border',
    // Cyan accent - our brand color
    cyan: 'hg-cyan-badge border',
    // Status colors - these are semantic and stay consistent
    success: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20',
    danger: 'bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20',
    info: 'bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20',
    // Outline variant
    outline: 'bg-transparent hg-text-secondary hg-border border'
  }

  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1'
  }

  const dotSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5'
  }

  const dotColors = {
    default: 'hg-bg-primary',
    cyan: 'bg-[var(--hg-cyan-text)]',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    outline: 'hg-bg-secondary'
  }

  const content = (
    <>
      {dot && (
        <span
          className={cn(
            'rounded-full mr-1.5',
            dotSizes[size],
            dotColors[variant]
          )}
        />
      )}
      {children}
    </>
  )

  if (animate) {
    return (
      <motion.span
        whileHover={{ scale: 1.05 }}
        className={cn(
          'inline-flex items-center rounded-full font-medium',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {content}
      </motion.span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {content}
    </span>
  )
}
