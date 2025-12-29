'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '../../utils/cn'

export interface BadgeProps extends HTMLMotionProps<"span"> {
  variant?: 'default' | 'cyan' | 'success' | 'warning' | 'danger' | 'info' | 'outline'
  size?: 'xs' | 'sm' | 'md'
  animate?: boolean
  dot?: boolean
}

/**
 * Badge Component
 *
 * WHITE-LABEL READY: Uses CSS variables for all colors.
 * Semantic colors (success, warning, danger, info) can be customized
 * via CSS variables: --hg-success, --hg-warning, --hg-danger, --hg-info
 */
export function Badge({
  children,
  className,
  variant = 'default',
  size = 'sm',
  animate = true,
  dot = false,
  ...props
}: BadgeProps) {
  // Use CSS variables for theme-aware and white-label-ready colors
  const variants = {
    // Default uses theme secondary background
    default: 'hg-bg-secondary hg-text-primary hg-border border',
    // Cyan/Primary accent - brand color (uses org-primary when set)
    cyan: 'hg-cyan-badge border',
    // Status colors - use CSS variables for white-label customization
    success: 'hg-success-badge border',
    warning: 'hg-warning-badge border',
    danger: 'hg-danger-badge border',
    info: 'hg-info-badge border',
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
    success: 'bg-[var(--hg-success)]',
    warning: 'bg-[var(--hg-warning)]',
    danger: 'bg-[var(--hg-danger)]',
    info: 'bg-[var(--hg-info)]',
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
