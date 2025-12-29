'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '../../utils/cn'
import { ReactNode } from 'react'

export interface CardProps extends Omit<HTMLMotionProps<"div">, 'children'> {
  children?: ReactNode
  variant?: 'default' | 'glass' | 'outline' | 'flat'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  hover?: boolean
  animate?: boolean
}

export function Card({
  children,
  className,
  variant = 'default',
  padding = 'md',
  hover = false,
  animate = false,
  ...props
}: CardProps) {
  // Theme-aware card variants using CSS variables
  const variants = {
    // Default card with solid background
    default: cn(
      'hg-bg-card',
      'hg-border border',
      'rounded-xl'
    ),
    // Glass effect card
    glass: cn(
      'bg-[var(--hg-bg-secondary)]',
      'backdrop-blur-xl',
      'hg-border border',
      'rounded-xl'
    ),
    // Outline only
    outline: cn(
      'bg-transparent',
      'hg-border border',
      'rounded-xl'
    ),
    // Flat - no border, subtle background
    flat: cn(
      'hg-bg-secondary',
      'rounded-xl'
    )
  }

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-10'
  }

  const hoverClasses = hover
    ? 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-[var(--hg-cyan-border)]'
    : ''

  const Component = animate ? motion.div : 'div'

  const baseProps = {
    className: cn(
      variants[variant],
      paddings[padding],
      hoverClasses,
      className
    )
  }

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        {...baseProps}
        {...props}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div {...baseProps}>
      {children}
    </div>
  )
}

// Specialized Card components
export function CardHeader({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center justify-between',
        'pb-4 mb-4',
        'border-b border-[var(--hg-border-color)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardTitle({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'text-lg font-semibold',
        'hg-text-primary',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardContent({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3',
        'pt-4 mt-4',
        'border-t border-[var(--hg-border-color)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
