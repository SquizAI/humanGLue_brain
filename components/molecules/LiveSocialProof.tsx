'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * Live Social Proof Component
 *
 * Displays rotating activity feed showing recent company assessments
 * Features:
 * - Auto-refreshes every 30 seconds
 * - Smooth animations with Framer Motion
 * - Live indicator (pulsing green dot)
 * - Mobile-responsive design
 */

interface ActivityEntry {
  id: string
  company: string
  timeAgo: string
  timestamp: number
}

interface LiveSocialProofProps {
  className?: string
}

export function LiveSocialProof({ className }: LiveSocialProofProps) {
  const [activities, setActivities] = useState<ActivityEntry[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch recent activities from API
   */
  const fetchActivities = async () => {
    try {
      const response = await fetch('/.netlify/functions/recent-activity')

      if (!response.ok) {
        throw new Error('Failed to fetch activities')
      }

      const data = await response.json()

      if (data.success && data.activities) {
        setActivities(data.activities)
        setError(null)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      console.error('[LiveSocialProof] Error fetching activities:', err)
      setError('Unable to load recent activities')
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchActivities()
  }, [])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchActivities()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Rotate through activities every 5 seconds
  useEffect(() => {
    if (activities.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length)
    }, 5000) // 5 seconds per activity

    return () => clearInterval(interval)
  }, [activities.length])

  // Don't render if loading or error
  if (loading || error || activities.length === 0) {
    return null
  }

  const currentActivity = activities[currentIndex]

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        'bg-gradient-to-r from-gray-900/50 to-gray-800/50',
        'backdrop-blur-sm border border-gray-700/50 rounded-xl',
        'px-4 py-3',
        className
      )}
    >
      {/* Live indicator */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <div className="relative flex items-center justify-center">
          {/* Pulsing ring */}
          <motion.div
            className="absolute w-3 h-3 rounded-full bg-green-500/30"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.7, 0, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          {/* Solid dot */}
          <div className="w-2 h-2 rounded-full bg-green-500" />
        </div>
        <span className="text-xs text-gray-400 font-medium font-diatype">Live</span>
      </div>

      {/* Activity feed */}
      <div className="pr-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentActivity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex items-start gap-3"
          >
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              <div className="p-1.5 rounded-lg bg-brand-cyan/10">
                <CheckCircle2 className="w-4 h-4 text-brand-cyan" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium font-diatype leading-snug">
                <span className="font-semibold">{currentActivity.company}</span>
                {' '}
                just completed their assessment
              </p>
              <p className="text-xs text-gray-400 font-diatype mt-0.5">
                {currentActivity.timeAgo}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress indicator dots */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {activities.slice(0, 5).map((_, index) => (
          <div
            key={index}
            className={cn(
              'w-1.5 h-1.5 rounded-full transition-all duration-300',
              index === currentIndex % 5
                ? 'bg-brand-cyan w-3'
                : 'bg-gray-600'
            )}
          />
        ))}
      </div>
    </div>
  )
}
