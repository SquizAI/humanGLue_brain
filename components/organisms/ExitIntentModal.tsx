'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, ArrowRight } from 'lucide-react'
import { cn } from '../../utils/cn'

interface ExitIntentModalProps {
  isOpen: boolean
  onClose: () => void
  onStartAssessment: () => void
}

export function ExitIntentModal({ isOpen, onClose, onStartAssessment }: ExitIntentModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, type: 'spring', damping: 25 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div className="relative max-w-2xl w-full">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute -top-4 -right-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200 hover:scale-110"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Content */}
              <div className={cn(
                'relative overflow-hidden rounded-3xl border border-white/10',
                'bg-gradient-to-br from-gray-900 via-blue-900/30 to-cyan-900/30',
                'backdrop-blur-xl shadow-2xl'
              )}>
                {/* Animated gradient orbs */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

                {/* Content */}
                <div className="relative z-10 p-8 sm:p-12">
                  {/* Icon Badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6"
                  >
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-blue-300 font-medium font-diatype">Limited Time Offer</span>
                  </motion.div>

                  {/* Headline */}
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight font-gendy"
                  >
                    Wait! Don't miss out
                  </motion.h2>

                  {/* Subheading */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed font-diatype"
                  >
                    Discover your organization's transformation potential in just 5 minutes.
                    Get a personalized roadmap and ROI estimate completely free.
                  </motion.p>

                  {/* Benefits List */}
                  <motion.ul
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-3 mb-8"
                  >
                    {[
                      'AI-powered readiness assessment',
                      'Custom transformation roadmap',
                      'Estimated ROI calculations',
                      'No credit card required'
                    ].map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-200 font-diatype">{benefit}</span>
                      </li>
                    ))}
                  </motion.ul>

                  {/* CTA Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    {/* Primary CTA */}
                    <button
                      onClick={onStartAssessment}
                      className={cn(
                        'group flex-1 px-8 py-4 rounded-full font-semibold text-white',
                        'bg-gradient-to-r from-blue-600 to-cyan-600',
                        'hover:from-blue-500 hover:to-cyan-500',
                        'transition-all duration-300',
                        'hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30',
                        'flex items-center justify-center gap-2',
                        'font-diatype'
                      )}
                    >
                      Get My Free Assessment
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Secondary CTA */}
                    <button
                      onClick={onClose}
                      className={cn(
                        'px-8 py-4 rounded-full font-semibold',
                        'border-2 border-white/20 text-white',
                        'hover:bg-white/10 hover:border-white/30',
                        'transition-all duration-300',
                        'font-diatype'
                      )}
                    >
                      No thanks
                    </button>
                  </motion.div>

                  {/* Trust Indicators */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex items-center justify-center gap-6 mt-8 pt-8 border-t border-white/10"
                  >
                    <div className="flex items-center gap-2 text-sm text-gray-400 font-diatype">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Enterprise Secure
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 font-diatype">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      5 Minutes
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
