'use client'

import { useState, useEffect } from 'react'
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
  Zap
} from 'lucide-react'

interface MobileHomePageProps {
  onStartChat: () => void
}

export function MobileHomePage({ onStartChat }: MobileHomePageProps) {
  const [activeTab, setActiveTab] = useState(0)

  // Auto-rotate tabs
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % 3)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

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
          <p className="text-base text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-semibold">
            with AI-Powered Insights
          </p>
        </motion.div>
      </div>

      {/* Dynamic Content Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 mb-3">
          {['Solutions', 'Results', 'Process'].map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === i 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-4"
          >
            {activeTab === 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">AI Assessment</h3>
                </div>
                <div className="space-y-2">
                  {['5-Dimension Analysis', 'Real-time Insights', 'Predictive Analytics'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-sm text-gray-200">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 1 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">40%</div>
                    <div className="text-xs text-gray-400">Faster AI Adoption</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">3.2x</div>
                    <div className="text-xs text-gray-400">ROI in 18 months</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { metric: 'Employee Engagement', value: '+25%' },
                    { metric: 'Team Efficiency', value: '+35%' }
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">{item.metric}</span>
                      <span className="text-green-400 font-medium">{item.value}</span>
                    </div>
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
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-400">{i + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{item.step}</div>
                        <div className="text-xs text-gray-400">{item.time}</div>
                      </div>
                    </div>
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
            <div>
              <Building2 className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <div className="text-xs text-gray-400">Enterprise</div>
              <div className="text-sm font-semibold text-white">Ready</div>
            </div>
            <div>
              <Target className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <div className="text-xs text-gray-400">Success Rate</div>
              <div className="text-sm font-semibold text-white">94%</div>
            </div>
            <div>
              <Zap className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <div className="text-xs text-gray-400">Deploy Time</div>
              <div className="text-sm font-semibold text-white">< 30 days</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section - Fixed at bottom */}
      <div className="mt-auto px-4 pb-4">
        <div className="bg-gray-900/90 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-gray-800">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartChat}
            className="w-full px-4 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <MessageCircle className="w-5 h-5 relative z-10" />
            <span className="text-base relative z-10">Start AI Assessment</span>
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