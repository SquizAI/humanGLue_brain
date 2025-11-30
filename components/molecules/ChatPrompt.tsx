/**
 * ChatPrompt Component
 *
 * Pulsing animation prompt to discover chat feature.
 * Auto-dismisses after 8 seconds.
 * Tracks "has seen chat" state to prevent repeated prompts.
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'

interface ChatPromptProps {
  /** Show the prompt */
  show: boolean
  /** Callback when user clicks the prompt */
  onClick: () => void
  /** Callback when dismissed */
  onDismiss: () => void
  /** Auto-dismiss delay in ms (default: 8000) */
  autoDismissDelay?: number
  /** Position of the prompt */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}

export function ChatPrompt({
  show,
  onClick,
  onDismiss,
  autoDismissDelay = 8000,
  position = 'bottom-right',
}: ChatPromptProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      // Small delay before showing for better UX
      const showTimeout = setTimeout(() => {
        setIsVisible(true)
      }, 500)

      // Auto-dismiss after delay
      const dismissTimeout = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onDismiss, 300) // Wait for exit animation
      }, autoDismissDelay)

      return () => {
        clearTimeout(showTimeout)
        clearTimeout(dismissTimeout)
      }
    } else {
      setIsVisible(false)
    }
  }, [show, autoDismissDelay, onDismiss])

  const handleClick = () => {
    setIsVisible(false)
    onClick()
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsVisible(false)
    setTimeout(onDismiss, 300)
  }

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-24 right-6',
    'bottom-left': 'bottom-24 left-6',
    'top-right': 'top-24 right-6',
    'top-left': 'top-24 left-6',
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className={`fixed ${positionClasses[position]} z-50`}
        >
          <div
            onClick={handleClick}
            className="relative cursor-pointer group"
          >
            {/* Pulsing rings */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              }}
            />

            {/* Main prompt card */}
            <div className="relative bg-gradient-to-br from-gray-900 via-blue-900/30 to-cyan-900/30 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 group-hover:scale-105">
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute -top-2 -right-2 w-6 h-6 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all"
                aria-label="Dismiss prompt"
              >
                <X className="w-3 h-3 text-white" />
              </button>

              {/* Content */}
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div className="relative">
                  <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-white/20">
                    <MessageCircle className="w-6 h-6 text-blue-400" />
                  </div>
                  {/* Notification dot */}
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                    }}
                  />
                </div>

                {/* Text */}
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white font-diatype">
                    Get personalized insights
                  </span>
                  <span className="text-xs text-gray-400 font-diatype">
                    Start your free AI assessment →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
