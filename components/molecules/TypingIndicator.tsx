'use client'

import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

interface TypingIndicatorProps {
  variant?: 'default' | 'professional' | 'minimal' | 'chat'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  message?: string
}

export function TypingIndicator({ 
  variant = 'default',
  size = 'md',
  className,
  message = 'AI is thinking...'
}: TypingIndicatorProps) {
  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  }

  const dotSize = dotSizes[size]

  const variants = {
    default: (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn("flex items-center gap-3", className)}
      >
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gray-800/70 backdrop-blur-sm border border-gray-700/50">
          <div className="flex gap-1">
            <motion.span 
              className={cn(dotSize, "bg-blue-400 rounded-full")}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            />
            <motion.span 
              className={cn(dotSize, "bg-blue-400 rounded-full")}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
            />
            <motion.span 
              className={cn(dotSize, "bg-blue-400 rounded-full")}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
            />
          </div>
          <span className="text-sm text-gray-400">{message}</span>
        </div>
      </motion.div>
    ),
    professional: (
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={cn("flex items-center gap-2", className)}
      >
        <div className="flex gap-1 p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-white/10">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={cn(dotSize, "bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full")}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </motion.div>
    ),
    minimal: (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn("text-sm text-gray-500 italic", className)}
      >
        {message}
      </motion.div>
    ),
    chat: (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className={cn("flex items-start gap-3", className)}
      >
        <div className="p-2 rounded-full bg-blue-500/10 border border-blue-500/20">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-blue-500">
            <path d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2Z" fill="currentColor" fillOpacity="0.2"/>
            <path d="M10 12C11.1046 12 12 11.1046 12 10C12 8.89543 11.1046 8 10 8C8.89543 8 8 8.89543 8 10C8 11.1046 8.89543 12 10 12Z" fill="currentColor"/>
            <motion.path
              d="M10 6C10.5523 6 11 5.55228 11 5C11 4.44772 10.5523 4 10 4C9.44772 4 9 4.44772 9 5C9 5.55228 9.44772 6 10 6Z"
              fill="currentColor"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.path
              d="M15 10C15 9.44772 14.5523 9 14 9C13.4477 9 13 9.44772 13 10C13 10.5523 13.4477 11 14 11C14.5523 11 15 10.5523 15 10Z"
              fill="currentColor"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
            <motion.path
              d="M10 16C10.5523 16 11 15.5523 11 15C11 14.4477 10.5523 14 10 14C9.44772 14 9 14.4477 9 15C9 15.5523 9.44772 16 10 16Z"
              fill="currentColor"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            />
            <motion.path
              d="M7 10C7 9.44772 6.55228 9 6 9C5.44772 9 5 9.44772 5 10C5 10.5523 5.44772 11 6 11C6.55228 11 7 10.5523 7 10Z"
              fill="currentColor"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
            />
          </svg>
        </div>
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gray-100 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className={cn(dotSize, "bg-gray-600 dark:bg-gray-400 rounded-full")}
                  animate={{
                    y: [0, -6, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </div>
          <motion.p 
            className="mt-1 text-xs text-gray-500 dark:text-gray-400 ml-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {message}
          </motion.p>
        </div>
      </motion.div>
    )
  }

  return variants[variant]
}