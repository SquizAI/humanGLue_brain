'use client'

import { motion } from 'framer-motion'
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  Sparkles, 
  Crown,
  Rocket,
  Star,
  Award,
  Diamond,
  Infinity
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { MaturityLevel } from '../../lib/assessment/maturityModel'

interface MaturityLevelDisplayProps {
  level: number
  maturityDetails: MaturityLevel
  animate?: boolean
  compact?: boolean
}

const levelIcons = [
  Brain,     // 0 - AI Unaware
  Zap,       // 1 - AI Aware
  TrendingUp, // 2 - AI Exploring
  Sparkles,  // 3 - AI Adopting
  Crown,     // 4 - AI Proficient
  Rocket,    // 5 - AI Optimizing
  Star,      // 6 - AI Transforming
  Award,     // 7 - AI Pioneering
  Diamond,   // 8 - Augmented Intelligence
  Infinity   // 9 - Living Intelligence
]

const levelColors = [
  'from-gray-500 to-gray-600',      // 0
  'from-yellow-500 to-orange-500',  // 1
  'from-orange-500 to-red-500',     // 2
  'from-red-500 to-pink-500',       // 3
  'from-pink-500 to-purple-500',    // 4
  'from-purple-500 to-indigo-500',  // 5
  'from-indigo-500 to-blue-500',    // 6
  'from-blue-500 to-cyan-500',      // 7
  'from-cyan-500 to-teal-500',      // 8
  'from-teal-500 to-green-500'      // 9
]

export function MaturityLevelDisplay({
  level,
  maturityDetails,
  animate = true,
  compact = false
}: MaturityLevelDisplayProps) {
  const Icon = levelIcons[level]
  const gradientColor = levelColors[level]

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
          gradientColor
        )}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-white">Level {level}</h4>
          <p className="text-sm text-gray-400">{maturityDetails.name}</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={animate ? { opacity: 0, scale: 0.9 } : false}
      animate={animate ? { opacity: 1, scale: 1 } : false}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* Background Glow */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br rounded-3xl blur-3xl opacity-20",
        gradientColor
      )} />

      {/* Main Card */}
      <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-800">
        {/* Level Badge */}
        <div className="flex items-center justify-between mb-6">
          <motion.div
            initial={animate ? { scale: 0 } : false}
            animate={animate ? { scale: 1 } : false}
            transition={{ delay: 0.2, type: "spring" }}
            className={cn(
              "w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg",
              gradientColor
            )}
          >
            <Icon className="w-10 h-10 text-white" />
          </motion.div>

          <div className="text-right">
            <motion.div
              initial={animate ? { opacity: 0, x: 20 } : false}
              animate={animate ? { opacity: 1, x: 0 } : false}
              transition={{ delay: 0.3 }}
              className="text-5xl font-bold text-white"
            >
              {level}
            </motion.div>
            <p className="text-sm text-gray-400 uppercase tracking-wider">Level</p>
          </div>
        </div>

        {/* Level Name & Description */}
        <motion.div
          initial={animate ? { opacity: 0, y: 20 } : false}
          animate={animate ? { opacity: 1, y: 0 } : false}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-white mb-3">{maturityDetails.name}</h2>
          <p className="text-gray-300 leading-relaxed mb-6">{maturityDetails.description}</p>
        </motion.div>

        {/* Key Characteristics */}
        <motion.div
          initial={animate ? { opacity: 0, y: 20 } : false}
          animate={animate ? { opacity: 1, y: 0 } : false}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-white mb-3">Key Characteristics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {maturityDetails.characteristics.slice(0, 4).map((characteristic, index) => (
              <motion.div
                key={characteristic}
                initial={animate ? { opacity: 0, x: -20 } : false}
                animate={animate ? { opacity: 1, x: 0 } : false}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className={cn(
                  "w-2 h-2 rounded-full bg-gradient-to-r mt-1.5",
                  gradientColor
                )} />
                <p className="text-sm text-gray-300">{characteristic}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Progress to Next Level */}
        <motion.div
          initial={animate ? { opacity: 0, y: 20 } : false}
          animate={animate ? { opacity: 1, y: 0 } : false}
          transition={{ delay: 0.8 }}
          className="mt-8 p-4 bg-gray-800/50 rounded-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Next Level Timeline</span>
            <span className="text-sm font-medium text-white">{maturityDetails.estimatedTimeToNext}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Investment Required</span>
            <span className="text-sm font-medium text-white">{maturityDetails.requiredInvestment}</span>
          </div>
        </motion.div>

        {/* Visual Progress Bar */}
        <motion.div
          initial={animate ? { opacity: 0 } : false}
          animate={animate ? { opacity: 1 } : false}
          transition={{ delay: 1 }}
          className="mt-6"
        >
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 h-2 rounded-full transition-all duration-500",
                  i <= level
                    ? `bg-gradient-to-r ${levelColors[i]}`
                    : "bg-gray-800"
                )}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-500">AI Unaware</span>
            <span className="text-xs text-gray-500">Living Intelligence</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}