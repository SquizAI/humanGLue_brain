'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Users,
  MessageCircle,
  Play,
  Sparkles,
  Building2,
  Target,
  Zap,
  Sunrise,
  Sun,
  Sunset,
  Moon
} from 'lucide-react'

interface MobileHomePageProps {
  onStartChat: () => void
}

/**
 * Get time-based CTA configuration based on current hour
 */
function getTimedCTA() {
  const hour = new Date().getHours()

  if (hour >= 6 && hour < 12) {
    // Morning (6am-12pm)
    return {
      text: 'Start Your Day with AI Readiness',
      icon: Sunrise,
      gradient: 'from-orange-500 to-yellow-500',
    }
  } else if (hour >= 12 && hour < 18) {
    // Afternoon (12pm-6pm)
    return {
      text: 'Quick 5-Minute Assessment',
      icon: Sun,
      gradient: 'from-yellow-500 to-orange-400',
    }
  } else if (hour >= 18 && hour < 24) {
    // Evening (6pm-12am)
    return {
      text: "Plan Tomorrow's Transformation",
      icon: Sunset,
      gradient: 'from-cyan-500 to-pink-500',
    }
  } else {
    // Night (12am-6am)
    return {
      text: 'Schedule a Morning Call',
      icon: Moon,
      gradient: 'from-indigo-600 to-cyan-600',
    }
  }
}

export function MobileHomePage({ onStartChat }: MobileHomePageProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [autoRotateEnabled, setAutoRotateEnabled] = useState(true)
  const [userHasInteracted, setUserHasInteracted] = useState(false)
  const lastInteractionTime = useRef<number>(Date.now())
  const autoRotateInterval = useRef<NodeJS.Timeout>()
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Check for prefers-reduced-motion and saved rotation preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if user previously disabled auto-rotation
      const rotationDisabled = sessionStorage.getItem('mobile_tab_auto_rotate_disabled')
      if (rotationDisabled === 'true') {
        setAutoRotateEnabled(false)
        setUserHasInteracted(true)
      }

      // Check for prefers-reduced-motion
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      setPrefersReducedMotion(mediaQuery.matches)

      // Listen for changes
      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches)
        // Disable auto-rotation if user prefers reduced motion
        if (e.matches) {
          setAutoRotateEnabled(false)
        }
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  // Disable auto-rotation if user prefers reduced motion
  useEffect(() => {
    if (prefersReducedMotion) {
      setAutoRotateEnabled(false)
    }
  }, [prefersReducedMotion])

  // Get time-based CTA configuration (memoized to prevent unnecessary recalculations)
  const timedCTA = useMemo(() => getTimedCTA(), [])
  const TimeIcon = timedCTA.icon

  /**
   * Handle manual tab switching
   * Permanently disables auto-rotation when user manually interacts (Phase 0 requirement)
   */
  const handleTabClick = (index: number) => {
    setActiveTab(index)
    setUserHasInteracted(true)
    lastInteractionTime.current = Date.now()

    // Permanently disable auto-rotation on first interaction
    setAutoRotateEnabled(false)

    // Store preference in sessionStorage to persist across re-renders
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('mobile_tab_auto_rotate_disabled', 'true')
    }
  }

  /**
   * Smart auto-rotation effect
   * - Pauses when user interacts with tabs
   * - Resumes after period of inactivity
   * - Tracks user preference (manual switching disables auto-rotation)
   */
  useEffect(() => {
    // Clear any existing interval
    if (autoRotateInterval.current) {
      clearInterval(autoRotateInterval.current)
    }

    // Only auto-rotate if enabled and user hasn't recently interacted
    if (autoRotateEnabled && !userHasInteracted) {
      autoRotateInterval.current = setInterval(() => {
        setActiveTab((prev) => (prev + 1) % 3)
      }, 4000)
    } else if (autoRotateEnabled && userHasInteracted) {
      // If user interacted but auto-rotate is re-enabled, check inactivity
      const checkInactivity = setInterval(() => {
        const timeSinceInteraction = Date.now() - lastInteractionTime.current
        if (timeSinceInteraction >= 10000) {
          // Resume auto-rotation after 10s of inactivity
          autoRotateInterval.current = setInterval(() => {
            setActiveTab((prev) => (prev + 1) % 3)
          }, 4000)
          clearInterval(checkInactivity)
        }
      }, 1000)

      return () => clearInterval(checkInactivity)
    }

    return () => {
      if (autoRotateInterval.current) {
        clearInterval(autoRotateInterval.current)
      }
    }
  }, [autoRotateEnabled, userHasInteracted])

  /**
   * Track tab engagement for analytics
   * (This would integrate with your analytics service)
   */
  useEffect(() => {
    // Log engagement event
    const engagementType = userHasInteracted ? 'manual' : 'auto-rotate'

    // Example: Send to analytics
    // trackEvent('tab_view', { tab: activeTab, type: engagementType })

  }, [activeTab, userHasInteracted])

  return (
    <div className="flex flex-col h-[calc(100vh-128px)]">
      {/* Hero Section - Compact */}
      <div className="px-4 pt-4 pb-3">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-2xl font-bold text-white mb-2">
            Transform Your Organization
          </h1>
          <p className="text-base text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-semibold">
            with AI-Powered Insights
          </p>
        </motion.div>
      </div>

      {/* Dynamic Content Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 mb-3 items-center">
          <div className="flex-1 flex gap-2">
            {['Solutions', 'Results', 'Process'].map((tab, i) => (
              <button
                key={tab}
                onClick={() => handleTabClick(i)}
                aria-selected={activeTab === i}
                aria-label={`${tab} tab${activeTab === i ? ', selected' : ''}`}
                role="tab"
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === i
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Pause/Resume Button for Accessibility */}
          {!prefersReducedMotion && (
            <button
              onClick={() => setAutoRotateEnabled(!autoRotateEnabled)}
              aria-label={autoRotateEnabled ? 'Pause tab rotation' : 'Resume tab rotation'}
              className="px-3 py-2 bg-gray-800 text-gray-400 rounded-lg text-xs hover:bg-gray-700 transition-colors"
              title={autoRotateEnabled ? 'Pause rotation' : 'Resume rotation'}
            >
              {autoRotateEnabled ? '⏸' : '▶'}
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: prefersReducedMotion ? 0 : -20 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: 'easeInOut' }}
            className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-4"
            role="tabpanel"
            aria-live="polite"
            aria-atomic="true"
          >
            {activeTab === 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">AI Assessment</h3>
                </div>
                <div className="space-y-2">
                  {['5-Dimension Analysis', 'Real-time Insights', 'Predictive Analytics'].map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-sm text-gray-200">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 1 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <motion.div
                    className="text-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="text-2xl font-bold text-blue-400">40%</div>
                    <div className="text-xs text-gray-400">Faster AI Adoption</div>
                  </motion.div>
                  <motion.div
                    className="text-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="text-2xl font-bold text-cyan-400">3.2x</div>
                    <div className="text-xs text-gray-400">ROI in 18 months</div>
                  </motion.div>
                </div>
                <div className="space-y-2">
                  {[
                    { metric: 'Employee Engagement', value: '+25%' },
                    { metric: 'Team Efficiency', value: '+35%' }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex justify-between items-center text-sm"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 + 0.3 }}
                    >
                      <span className="text-gray-300">{item.metric}</span>
                      <span className="text-green-400 font-medium">{item.value}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div className="space-y-3">
                <div className="space-y-2">
                  {[
                    { step: '1. AI Assessment', time: '1-2 weeks' },
                    { step: '2. Strategic Workshop', time: '1-2 days' },
                    { step: '3. Implementation', time: '3-6 months' }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-400">{i + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{item.step}</div>
                        <div className="text-xs text-gray-400">{item.time}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Trust Indicators */}
      <div className="px-4 mb-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3">
          <div className="grid grid-cols-3 gap-3 text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Building2 className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <div className="text-xs text-gray-400">Enterprise</div>
              <div className="text-sm font-semibold text-white">Ready</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Target className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <div className="text-xs text-gray-400">Success Rate</div>
              <div className="text-sm font-semibold text-white">94%</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Zap className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <div className="text-xs text-gray-400">Deploy Time</div>
              <div className="text-sm font-semibold text-white">&lt; 30 days</div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA Section - Fixed at bottom with time-based messaging */}
      <div className="mt-auto px-4 pb-4">
        <div className="bg-gray-900/90 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-gray-800">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartChat}
            className={`w-full px-4 py-3.5 bg-gradient-to-r ${timedCTA.gradient} text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg relative overflow-hidden group`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${timedCTA.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} style={{ filter: 'brightness(1.1)' }} />
            <TimeIcon className="w-5 h-5 relative z-10" />
            <span className="text-base relative z-10">{timedCTA.text}</span>
            <Sparkles className="w-4 h-4 relative z-10" />
          </motion.button>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <button className="px-3 py-2 bg-gray-800/80 hover:bg-gray-700/80 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1">
              <Play className="w-3 h-3" />
              Demo
            </button>
            <button className="px-3 py-2 bg-gray-800/80 hover:bg-gray-700/80 text-white rounded-lg text-sm font-medium transition-colors">
              Pricing
            </button>
          </div>

          <p className="text-center text-[11px] text-gray-500 mt-2">
            Free assessment • No credit card • 5 minutes
          </p>
        </div>
      </div>
    </div>
  )
}
