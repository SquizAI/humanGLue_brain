'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Circle, Lock } from 'lucide-react'
import { cn } from '../../utils/cn'

interface AssessmentProgressProps {
  currentCategory: number
  totalCategories: number
  completedDimensions: number
  totalDimensions: number
  categories: {
    name: string
    completed: boolean
    current: boolean
    locked: boolean
  }[]
}

export function AssessmentProgress({
  currentCategory,
  totalCategories,
  completedDimensions,
  totalDimensions,
  categories
}: AssessmentProgressProps) {
  const progress = (completedDimensions / totalDimensions) * 100

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-white">Assessment Progress</h3>
          <span className="text-sm text-gray-400">
            {completedDimensions} of {totalDimensions} dimensions
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Category Steps */}
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-800" />
        
        <div className="space-y-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "flex items-center gap-4 relative",
                category.current && "scale-105"
              )}
            >
              {/* Step Icon */}
              <div className="relative z-10">
                {category.completed ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center"
                  >
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </motion.div>
                ) : category.current ? (
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-blue-500 animate-ping absolute" />
                    <Circle className="w-6 h-6 text-blue-400 relative z-10" />
                  </div>
                ) : category.locked ? (
                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-gray-600" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                    <Circle className="w-6 h-6 text-gray-600" />
                  </div>
                )}
              </div>

              {/* Category Info */}
              <div className="flex-1">
                <h4 className={cn(
                  "font-medium transition-colors",
                  category.completed && "text-green-400",
                  category.current && "text-white",
                  !category.completed && !category.current && "text-gray-500"
                )}>
                  {category.name}
                </h4>
                {category.current && (
                  <p className="text-xs text-gray-400 mt-1">In Progress</p>
                )}
              </div>

              {/* Status Badge */}
              {category.completed && (
                <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-full">
                  Complete
                </span>
              )}
              {category.current && (
                <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full animate-pulse">
                  Active
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Estimated Time */}
      <div className="mt-6 pt-6 border-t border-gray-800">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">Estimated time remaining</span>
          <span className="text-white font-medium">
            ~{Math.max(5, (totalDimensions - completedDimensions) * 2)} minutes
          </span>
        </div>
      </div>
    </div>
  )
}