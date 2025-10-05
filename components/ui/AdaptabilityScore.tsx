'use client'

import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { metrics } from '@/lib/design-system'

interface AdaptabilityScoreProps {
  score: number // 0-100
  label: string
  dimension?: 'individual' | 'leadership' | 'cultural' | 'embedding' | 'velocity'
  showDetails?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function AdaptabilityScore({
  score,
  label,
  dimension,
  showDetails = false,
  size = 'md',
}: AdaptabilityScoreProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  })

  useEffect(() => {
    if (isInView) {
      motionValue.set(score)
    }
  }, [isInView, score, motionValue])

  const getScoreLabel = (value: number) => {
    if (value < 40) return 'Low'
    if (value < 70) return 'Medium'
    return 'High'
  }

  const getScoreColor = (value: number) => {
    const color = metrics.getAdaptabilityColor(value)
    return color
  }

  const sizeConfig = {
    sm: {
      circle: 120,
      stroke: 8,
      text: 'text-2xl',
      label: 'text-sm',
    },
    md: {
      circle: 160,
      stroke: 10,
      text: 'text-4xl',
      label: 'text-base',
    },
    lg: {
      circle: 200,
      stroke: 12,
      text: 'text-5xl',
      label: 'text-lg',
    },
  }

  const config = sizeConfig[size]
  const radius = (config.circle - config.stroke) / 2
  const circumference = radius * 2 * Math.PI

  return (
    <div ref={ref} className="flex flex-col items-center">
      {/* Circular Progress */}
      <div className="relative" style={{ width: config.circle, height: config.circle }}>
        {/* Background Circle */}
        <svg
          className="transform -rotate-90"
          width={config.circle}
          height={config.circle}
        >
          <circle
            cx={config.circle / 2}
            cy={config.circle / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={config.stroke}
            fill="none"
            className="text-gray-700"
          />
          <motion.circle
            cx={config.circle / 2}
            cy={config.circle / 2}
            r={radius}
            stroke={getScoreColor(score)}
            strokeWidth={config.stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            animate={
              isInView
                ? { strokeDashoffset: circumference - (score / 100) * circumference }
                : {}
            }
            transition={{ duration: 2, ease: 'easeOut' }}
          />
        </svg>

        {/* Score Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            className={`${config.text} font-bold`}
            style={{ color: getScoreColor(score) }}
          >
            {springValue.get().toFixed(0)}
          </motion.div>
          <div className="text-gray-400 text-sm font-medium">
            {getScoreLabel(score)}
          </div>
        </div>
      </div>

      {/* Label */}
      <div className={`mt-4 ${config.label} font-semibold text-gray-300 text-center max-w-xs`}>
        {label}
      </div>

      {/* Details (optional) */}
      {showDetails && dimension && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 rounded-xl bg-white/5 border border-gray-700 backdrop-blur-sm max-w-sm"
        >
          <DimensionBreakdown dimension={dimension} score={score} />
        </motion.div>
      )}
    </div>
  )
}

function DimensionBreakdown({
  dimension,
  score,
}: {
  dimension: string
  score: number
}) {
  const breakdowns = {
    individual: [
      { label: 'Change Readiness', weight: 25 },
      { label: 'Learning Agility', weight: 25 },
      { label: 'AI Confidence', weight: 20 },
      { label: 'Fear Level (inv)', weight: 15 },
      { label: 'Growth Mindset', weight: 15 },
    ],
    leadership: [
      { label: 'AI Literacy', weight: 25 },
      { label: 'Change Championing', weight: 25 },
      { label: 'Vulnerability Index', weight: 20 },
      { label: 'Vision Clarity', weight: 15 },
      { label: 'Coaching Capability', weight: 15 },
    ],
    cultural: [
      { label: 'Psychological Safety', weight: 25 },
      { label: 'Experimentation Culture', weight: 25 },
      { label: 'Failure Resilience', weight: 20 },
      { label: 'Collaboration Score', weight: 15 },
      { label: 'Recognition Systems', weight: 15 },
    ],
    embedding: [
      { label: 'Habit Strength', weight: 25 },
      { label: 'Reinforcement Infra', weight: 25 },
      { label: 'Accountability', weight: 20 },
      { label: 'Social Proof', weight: 15 },
      { label: 'Environmental Design', weight: 15 },
    ],
    velocity: [
      { label: 'Decision Speed', weight: 25 },
      { label: 'Resource Flexibility', weight: 25 },
      { label: 'Communication Efficiency', weight: 20 },
      { label: 'Learning Infrastructure', weight: 15 },
      { label: 'Change Fatigue', weight: 15 },
    ],
  }

  const items = breakdowns[dimension as keyof typeof breakdowns] || []

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Dimension Breakdown
      </div>
      {items.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">{item.label}</span>
            <span className="text-gray-400">{item.weight}%</span>
          </div>
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(score * item.weight) / 100}%` }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              className="h-full rounded-full"
              style={{ backgroundColor: metrics.getAdaptabilityColor(score) }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
