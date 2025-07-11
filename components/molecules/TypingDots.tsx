'use client'

import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

export interface TypingDotsProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function TypingDots({ size = 'md', className }: TypingDotsProps) {
  const sizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  }

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const dotVariants = {
    initial: { y: 0 },
    animate: {
      y: [-5, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <motion.div
      className={cn('flex items-center gap-1', className)}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className={cn('bg-gray-400 rounded-full', sizes[size])}
          variants={dotVariants}
        />
      ))}
    </motion.div>
  )
}