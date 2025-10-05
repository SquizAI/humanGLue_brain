'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { AlertTriangle, TrendingUp } from 'lucide-react'

interface FearToConfidenceSliderProps {
  initialValue?: number // 0 (max fear) to 100 (max confidence)
  onChange?: (value: number) => void
  label?: string
  showLabels?: boolean
}

export function FearToConfidenceSlider({
  initialValue = 50,
  onChange,
  label = 'Current State',
  showLabels = true,
}: FearToConfidenceSliderProps) {
  const [value, setValue] = useState(initialValue)

  const handleChange = (newValue: number) => {
    setValue(newValue)
    onChange?.(newValue)
  }

  // Interpolate color from red (fear) to green (confidence)
  const getColor = (val: number) => {
    const r = Math.round(239 - (val / 100) * 223) // 239 (red) to 16 (green)
    const g = Math.round(68 + (val / 100) * 117) // 68 to 185
    const b = 68 // Constant
    return `rgb(${r}, ${g}, ${b})`
  }

  const getStateLabel = (val: number) => {
    if (val < 20) return 'High Fear'
    if (val < 40) return 'Concerned'
    if (val < 60) return 'Uncertain'
    if (val < 80) return 'Cautiously Confident'
    return 'Highly Confident'
  }

  const getRecommendation = (val: number) => {
    if (val < 40)
      return 'Focus on reframing messaging and building early wins'
    if (val < 70)
      return 'Provide clear support systems and success stories'
    return 'Leverage as change champions and early adopters'
  }

  return (
    <div className="space-y-6">
      {/* Label */}
      {label && (
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-white">{label}</h4>
          <div
            className="px-4 py-2 rounded-full text-sm font-medium"
            style={{
              backgroundColor: `${getColor(value)}20`,
              color: getColor(value),
              border: `1px solid ${getColor(value)}40`,
            }}
          >
            {getStateLabel(value)}
          </div>
        </div>
      )}

      {/* Slider Container */}
      <div className="relative">
        {/* Background Track with Gradient */}
        <div className="relative h-4 rounded-full overflow-hidden bg-gradient-to-r from-red-500/20 via-amber-500/20 to-green-500/20 border border-gray-700">
          {/* Fill */}
          <motion.div
            className="absolute h-full rounded-full"
            style={{
              width: `${value}%`,
              background: `linear-gradient(to right, #EF4444, ${getColor(value)})`,
            }}
            initial={false}
            animate={{ width: `${value}%` }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          />
        </div>

        {/* Slider Input */}
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {/* Thumb */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: `${value}%` }}
          initial={false}
          animate={{ left: `${value}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        >
          <div
            className="w-8 h-8 rounded-full shadow-xl border-4 border-white/20 -ml-4"
            style={{ backgroundColor: getColor(value) }}
          />
        </motion.div>
      </div>

      {/* Labels */}
      {showLabels && (
        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Fear</span>
          </div>
          <div className="flex items-center gap-2 text-green-400">
            <span>Confidence</span>
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Score Display */}
      <div className="text-center">
        <div className="text-4xl font-bold" style={{ color: getColor(value) }}>
          {value}
          <span className="text-lg text-gray-400">/100</span>
        </div>
      </div>

      {/* Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-white/5 border border-gray-700 backdrop-blur-sm"
      >
        <div className="text-sm font-semibold text-gray-400 mb-2">
          Recommended Intervention:
        </div>
        <div className="text-gray-300">{getRecommendation(value)}</div>
      </motion.div>
    </div>
  )
}
