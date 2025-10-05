'use client'

import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'
import { LucideIcon, Sparkles } from 'lucide-react'

export interface QuickResponseProps {
  suggestions: Array<{
    text: string
    icon?: LucideIcon
    action?: string
  }>
  onSelect: (text: string) => void
  className?: string
}

export function QuickResponse({ suggestions, onSelect, className }: QuickResponseProps) {
  if (!suggestions.length) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{
        type: "tween",
        duration: 0.3,
        ease: "easeOut"
      }}
      className={cn('', className)}
    >
      {/* Section Header */}
      <div className="text-xs text-gray-500 font-medium font-diatype mb-2">
        Suggested responses
      </div>

      {/* Suggestions as wrapping pills */}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "tween",
              delay: index * 0.04,
              duration: 0.25,
              ease: "easeOut"
            }}
            whileHover={{
              scale: 1.05,
              transition: { type: "tween", duration: 0.15, ease: "easeOut" }
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(suggestion.text)}
            className={cn(
              'px-3 py-1.5 rounded-full',
              'bg-gradient-to-r from-blue-600 to-purple-600',
              'hover:from-blue-500 hover:to-purple-500',
              'transition-colors duration-200',
              'text-xs font-medium text-white font-diatype',
              'shadow-sm hover:shadow-md',
              'whitespace-nowrap'
            )}
          >
            {suggestion.text}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}