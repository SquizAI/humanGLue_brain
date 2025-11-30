'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, Send } from 'lucide-react'
import { cn } from '../../utils/cn'

interface HeroChatProps {
  onStartAssessment: () => void
  className?: string
}

/**
 * Hero-Integrated Chat Component
 * Clean, minimal chat UI integrated into the hero section
 * Shows personalized greeting and quick action buttons
 */
export function HeroChat({ onStartAssessment, className }: HeroChatProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showInput, setShowInput] = useState(false)

  // Animate in after page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  const quickActions = [
    {
      id: 'start',
      label: 'Start Free Assessment',
      icon: Sparkles,
      action: onStartAssessment
    },
    {
      id: 'learn',
      label: 'Learn More',
      action: () => {
        // Scroll to content sections
        const element = document.getElementById('ai-transformation')
        element?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  ]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={cn(
            'relative max-w-md w-full',
            className
          )}
        >
          {/* Chat Bubble */}
          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header with AI badge */}
            <div className="px-6 pt-5 pb-3 border-b border-gray-800/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                <span className="text-xs font-medium text-gray-400 font-diatype">
                  AI Assessment
                </span>
              </div>
            </div>

            {/* Message Content */}
            <div className="px-6 py-5 space-y-4">
              {/* AI Message */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-3"
              >
                <div className="flex-1 space-y-2">
                  <p className="text-white text-base font-medium font-diatype leading-relaxed">
                    Hey there! 👋
                  </p>
                  <p className="text-gray-300 text-sm font-diatype leading-relaxed">
                    Let's see how ready your company is for AI transformation.
                    I'll guide you through a quick assessment.
                  </p>
                </div>
              </motion.div>

              {/* Quick Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2 pt-2"
              >
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    onClick={action.action}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl text-left',
                      'transition-all duration-300',
                      'flex items-center justify-between group',
                      action.id === 'start'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-[1.02]'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white border border-gray-700/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {action.icon && (
                        <action.icon className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium font-diatype">
                        {action.label}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                ))}
              </motion.div>

              {/* Typing indicator (optional - for future) */}
              {showInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-3 border-t border-gray-800/50"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 font-diatype"
                    />
                    <button className="px-4 py-2 bg-blue-600 rounded-xl hover:bg-blue-500 transition-colors">
                      <Send className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer Trust Indicators */}
            <div className="px-6 py-3 bg-gray-800/30 border-t border-gray-800/50">
              <div className="flex items-center justify-center gap-4 text-xs text-gray-400 font-diatype">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  <span>5 min to complete</span>
                </div>
                <span className="text-gray-600">•</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  <span>No credit card</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating particles effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-3xl blur-xl -z-10 animate-pulse" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
