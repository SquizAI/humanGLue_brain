'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Clock, TrendingUp, Sparkles, ArrowRight, Target } from 'lucide-react'
import { cn } from '../../utils/cn'
import { ChatState } from '../../lib/types'

interface DynamicAssessmentCardsProps {
  chatState: ChatState
  userData?: any
  className?: string
}

/**
 * Dynamic Assessment Cards Component
 * Shows progressive content sections as user completes assessment
 * Cards appear based on chat state progression
 */
export function DynamicAssessmentCards({ chatState, className }: DynamicAssessmentCardsProps) {
  // Determine which sections to show based on chat state
  const showReadinessCard = ['collectingCompanyInfo', 'collectingBasicInfo', 'collectingChallenges', 'collectingContactInfo'].includes(chatState)
  const showStrategyCard = ['collectingChallenges', 'performingAnalysis'].includes(chatState)
  const showTimelineCard = chatState === 'performingAnalysis'

  // Calculate progress percentage based on chat state
  const getProgress = () => {
    const stateOrder: ChatState[] = ['initial', 'greeting', 'collectingBasicInfo', 'collectingCompanyInfo', 'collectingChallenges', 'collectingContactInfo', 'performingAnalysis', 'completed']
    const currentIndex = stateOrder.indexOf(chatState)
    return Math.round((currentIndex / (stateOrder.length - 1)) * 100)
  }

  const progress = getProgress()

  return (
    <div className={cn('w-full', className)}>
      <AnimatePresence mode="sync">
        {/* Progress Indicator */}
        {progress > 0 && chatState !== 'initial' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-semibold text-white font-diatype">
                    Assessment Progress
                  </h3>
                </div>
                <span className="text-xs text-gray-400 font-diatype">
                  {progress}% Complete
                </span>
              </div>
              <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* AI Readiness Assessment Card */}
          <AnimatePresence>
            {showReadinessCard && (
              <motion.div
                key="readiness"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 h-full">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Target className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1 font-gendy">
                        AI Readiness Assessment
                      </h3>
                      <p className="text-xs text-gray-400 font-diatype">
                        Analyzing your organization
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300 font-diatype">5-minute assessment</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300 font-diatype">50+ data points</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-blue-400 flex-shrink-0 animate-pulse" />
                      <span className="text-gray-300 font-diatype">In progress...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Custom Strategy Card */}
          <AnimatePresence>
            {showStrategyCard && (
              <motion.div
                key="strategy"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
              >
                <div className="bg-gradient-to-br from-cyan-900/30 to-pink-900/20 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6 h-full">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1 font-gendy">
                        Custom Strategy Development
                      </h3>
                      <p className="text-xs text-gray-400 font-diatype">
                        Tailored to your needs
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300 font-diatype">3.2x avg ROI projection</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300 font-diatype">90 days to value</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-cyan-400 flex-shrink-0 animate-pulse" />
                      <span className="text-gray-300 font-diatype">Building your plan...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Implementation Timeline Card */}
          <AnimatePresence>
            {showTimelineCard && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.4 }}
              >
                <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6 h-full">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <ArrowRight className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1 font-gendy">
                        Implementation Timeline
                      </h3>
                      <p className="text-xs text-gray-400 font-diatype">
                        Your path to success
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-gray-400 font-diatype">
                      <div className="flex justify-between mb-1">
                        <span>Week 1</span>
                        <span className="text-green-400">Discovery</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Week 2-3</span>
                        <span className="text-blue-400">Planning</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Month 1-3</span>
                        <span className="text-cyan-400">Implementation</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Month 2-4</span>
                        <span className="text-yellow-400">Optimization</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </AnimatePresence>
    </div>
  )
}
