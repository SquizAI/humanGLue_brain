'use client'

import { HTMLMotionProps, motion } from 'framer-motion'
import { cn } from '../../utils/cn'

export interface CardProps extends HTMLMotionProps<"div"> {
  variant?: 'default' | 'bordered' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  interactive?: boolean
}

export function Card({ 
  children, 
  className, 
  variant = 'default',
  padding = 'md',
  interactive = false,
  ...props 
}: CardProps) {
  const variants = {
    default: 'bg-white dark:bg-gray-900',
    bordered: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700',
    elevated: 'bg-white dark:bg-gray-900 shadow-lg'
  }

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  return (
    <motion.div
      whileHover={interactive ? { scale: 1.02, y: -2 } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      className={cn(
        'rounded-lg transition-all',
        variants[variant],
        paddings[padding],
        interactive && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}