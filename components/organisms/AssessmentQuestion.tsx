'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Info } from 'lucide-react'
import { cn } from '../../utils/cn'
import { AssessmentQuestion as QuestionType } from '../../lib/assessment/dimensions'

interface AssessmentQuestionProps {
  question: QuestionType
  dimensionName: string
  onAnswer: (answer: any) => void
  currentAnswer?: any
}

export function AssessmentQuestion({
  question,
  dimensionName,
  onAnswer,
  currentAnswer
}: AssessmentQuestionProps) {
  const [localAnswer, setLocalAnswer] = useState(currentAnswer)
  const [showInfo, setShowInfo] = useState(false)

  const handleSubmit = () => {
    if (localAnswer !== undefined) {
      onAnswer(localAnswer)
    }
  }

  const renderQuestionInput = () => {
    switch (question.type) {
      case 'scale':
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Not at all</span>
              <span>Fully implemented</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={localAnswer || 5}
              onChange={(e) => setLocalAnswer(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(localAnswer || 5) * 10}%, #1F2937 ${(localAnswer || 5) * 10}%, #1F2937 100%)`
              }}
            />
            <div className="text-center">
              <span className="text-2xl font-bold text-white">{localAnswer || 5}</span>
              <span className="text-gray-400 text-sm ml-1">/ 10</span>
            </div>
          </div>
        )

      case 'yes_no':
        return (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setLocalAnswer(true)}
              className={cn(
                "p-4 rounded-xl border-2 transition-all",
                localAnswer === true
                  ? "border-blue-500 bg-blue-500/10 text-blue-400"
                  : "border-gray-700 hover:border-gray-600 text-gray-300"
              )}
            >
              <span className="text-2xl mb-2 block">✓</span>
              Yes
            </button>
            <button
              onClick={() => setLocalAnswer(false)}
              className={cn(
                "p-4 rounded-xl border-2 transition-all",
                localAnswer === false
                  ? "border-red-500 bg-red-500/10 text-red-400"
                  : "border-gray-700 hover:border-gray-600 text-gray-300"
              )}
            >
              <span className="text-2xl mb-2 block">✗</span>
              No
            </button>
          </div>
        )

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <button
                key={option}
                onClick={() => setLocalAnswer(option)}
                className={cn(
                  "w-full p-4 rounded-xl border-2 text-left transition-all",
                  localAnswer === option
                    ? "border-blue-500 bg-blue-500/10 text-white"
                    : "border-gray-700 hover:border-gray-600 text-gray-300"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                    localAnswer === option ? "border-blue-500" : "border-gray-600"
                  )}>
                    {localAnswer === option && (
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        )

      case 'text':
        return (
          <textarea
            value={localAnswer || ''}
            onChange={(e) => setLocalAnswer(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full p-4 bg-gray-800 rounded-xl border border-gray-700 focus:border-blue-500 focus:outline-none text-white placeholder-gray-500 min-h-[120px] resize-none"
          />
        )

      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <span className="text-sm text-blue-400 font-medium">{dimensionName}</span>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Info className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{question.text}</h3>
        
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20"
            >
              <p className="text-sm text-blue-300">
                This question helps us understand your organization's readiness in {dimensionName.toLowerCase()}.
                Your answer will contribute to your overall AI maturity assessment.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Question Input */}
      <div className="mb-8">
        {renderQuestionInput()}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={localAnswer === undefined}
          className={cn(
            "px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2",
            localAnswer !== undefined
              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/25"
              : "bg-gray-800 text-gray-500 cursor-not-allowed"
          )}
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

<style jsx>{`
  .slider::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
  }

  .slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
  }
`}</style>