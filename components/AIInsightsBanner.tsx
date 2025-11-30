'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, TrendingUp, Target, X, ChevronRight } from 'lucide-react'
import { usePathname } from 'next/navigation'

// AI-generated insights based on page context
const pageInsights = {
  '/': [
    {
      icon: TrendingUp,
      title: "Industry Insight",
      content: "Organizations using AI-powered assessments see 47% faster transformation timelines",
      action: "Learn more",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Target,
      title: "Success Tip",
      content: "Start with a quick assessment to identify your top 3 transformation opportunities",
      action: "Start now",
      color: "from-cyan-500 to-pink-500"
    }
  ],
  '/solutions': [
    {
      icon: Lightbulb,
      title: "Did you know?",
      content: "Companies using all three solutions see 3x better outcomes than single-solution approaches",
      action: "View case study",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: TrendingUp,
      title: "ROI Insight",
      content: "Average ROI from our toolbox implementation: 312% in the first year",
      action: "Calculate yours",
      color: "from-orange-500 to-red-500"
    }
  ],
  '/process': [
    {
      icon: Target,
      title: "Timeline Tip",
      content: "Most organizations see measurable results within 90 days of starting",
      action: "View timeline",
      color: "from-indigo-500 to-cyan-500"
    },
    {
      icon: Lightbulb,
      title: "Best Practice",
      content: "Involve cross-functional teams early for 2x faster adoption",
      action: "Download guide",
      color: "from-teal-500 to-cyan-500"
    }
  ],
  '/results': [
    {
      icon: TrendingUp,
      title: "Benchmark",
      content: "Your industry peers see average engagement increases of 68%",
      action: "Compare",
      color: "from-rose-500 to-pink-500"
    },
    {
      icon: Target,
      title: "Success Pattern",
      content: "Organizations like yours typically achieve ROI within 6 months",
      action: "See examples",
      color: "from-amber-500 to-orange-500"
    }
  ]
}

export function AIInsightsBanner() {
  const pathname = usePathname()
  const [currentInsight, setCurrentInsight] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  const insights = pageInsights[pathname as keyof typeof pageInsights] || pageInsights['/']

  useEffect(() => {
    // Show banner after a delay
    const showTimer = setTimeout(() => {
      if (!isDismissed) {
        setIsVisible(true)
      }
    }, 3000)

    // Rotate insights
    const rotateTimer = setInterval(() => {
      setCurrentInsight((prev) => (prev + 1) % insights.length)
    }, 8000)

    return () => {
      clearTimeout(showTimer)
      clearInterval(rotateTimer)
    }
  }, [pathname, isDismissed, insights.length])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    // Remember dismissal for this session
    sessionStorage.setItem('ai-insights-dismissed', 'true')
  }

  useEffect(() => {
    // Check if previously dismissed in this session
    const dismissed = sessionStorage.getItem('ai-insights-dismissed')
    if (dismissed) {
      setIsDismissed(true)
    }
  }, [])

  const insight = insights[currentInsight]
  const Icon = insight.icon

  return (
    <AnimatePresence>
      {isVisible && !isDismissed && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 left-0 right-0 z-30 px-4"
        >
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl bg-gray-900/90 backdrop-blur-xl border border-white/10 shadow-2xl">
              {/* Gradient background */}
              <div className={`absolute inset-0 opacity-10 bg-gradient-to-r ${insight.color}`} />
              
              <div className="relative px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <motion.div
                      key={currentInsight}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", duration: 0.5 }}
                      className={`p-3 rounded-xl bg-gradient-to-br ${insight.color} shadow-lg`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </motion.div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <motion.h3
                        key={`title-${currentInsight}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-sm font-semibold text-white mb-1"
                      >
                        {insight.title}
                      </motion.h3>
                      <motion.p
                        key={`content-${currentInsight}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-sm text-gray-300"
                      >
                        {insight.content}
                      </motion.p>
                    </div>
                    
                    {/* Action button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <span className="text-sm text-white">{insight.action}</span>
                      <ChevronRight className="w-4 h-4 text-white" />
                    </motion.button>
                  </div>
                  
                  {/* Close button */}
                  <button
                    onClick={handleDismiss}
                    className="ml-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                
                {/* Progress dots */}
                <div className="flex gap-1 mt-3">
                  {insights.map((_, index) => (
                    <motion.div
                      key={index}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        index === currentInsight 
                          ? 'w-8 bg-white/60' 
                          : 'w-1 bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 