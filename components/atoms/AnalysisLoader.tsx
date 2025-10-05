'use client'

import { motion } from 'framer-motion'
import { Brain, Database, TrendingUp, Target } from 'lucide-react'

interface AnalysisLoaderProps {
  companyName?: string
}

export function AnalysisLoader({ companyName }: AnalysisLoaderProps) {
  const steps = [
    { icon: Database, text: `Analyzing ${companyName || 'company'}'s digital presence...`, delay: 0 },
    { icon: Brain, text: 'Assessing AI readiness and maturity...', delay: 0.5 },
    { icon: TrendingUp, text: 'Calculating ROI potential and impact...', delay: 1 },
    { icon: Target, text: 'Creating personalized transformation roadmap...', delay: 1.5 }
  ]

  return (
    <div className="py-6 space-y-4">
      {steps.map((step, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: step.delay,
            duration: 0.5,
            ease: "easeOut"
          }}
          className="flex items-center gap-3"
        >
          <motion.div
            animate={{
              rotate: 360
            }}
            transition={{
              delay: step.delay,
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
            className="flex-shrink-0"
          >
            <step.icon className="w-5 h-5 text-blue-500" />
          </motion.div>

          <div className="flex-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{
                delay: step.delay + 0.2,
                duration: 2,
                ease: "easeInOut"
              }}
              className="text-sm text-gray-300 font-diatype"
            >
              {step.text}
            </motion.div>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{
                delay: step.delay + 0.3,
                duration: 1.5,
                ease: "easeOut"
              }}
              className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2"
            />
          </div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: step.delay + 2,
              duration: 0.3,
              ease: "backOut"
            }}
            className="text-green-500 text-sm font-bold"
          >
            ✓
          </motion.div>
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5, duration: 0.5 }}
        className="pt-4 text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-2 h-2 bg-blue-500 rounded-full"
          />
          <span className="text-sm text-blue-400 font-diatype">
            Finalizing your personalized assessment...
          </span>
        </div>
      </motion.div>
    </div>
  )
}
