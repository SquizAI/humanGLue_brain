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
      className={cn('space-y-3', className)}
    >
      {/* Section Header */}
      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
        <Sparkles className="w-3 h-3" />
        <span>Suggested responses</span>
      </div>
      
      {/* Suggestions Grid */}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(suggestion.text)}
            className={cn(
              'group flex items-center gap-2 px-4 py-2.5 rounded-xl',
              'bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm',
              'border border-gray-700/50 hover:border-blue-500/50',
              'hover:from-blue-500/10 hover:to-purple-500/10',
              'transition-all duration-300',
              'text-sm font-medium text-gray-200 hover:text-white',
              'shadow-sm hover:shadow-lg hover:shadow-blue-500/10'
            )}
          >
            {suggestion.icon && (
              <suggestion.icon className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
            )}
            <span>{suggestion.text}</span>
            <motion.div
              className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}