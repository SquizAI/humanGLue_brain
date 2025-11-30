'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Users,
  Zap,
  Target,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Loader2,
  ChevronRight,
  SkipForward,
  RefreshCw,
} from 'lucide-react'
import { AdaptabilityScore } from '@/components/ui/AdaptabilityScore'
import { FearToConfidenceSlider } from '@/components/ui/FearToConfidenceSlider'

// Types matching the question-engine service
interface Question {
  id: string
  questionCode: string
  version: number
  questionText: string
  questionDescription?: string
  helpText?: string
  dimension: 'individual' | 'leadership' | 'cultural' | 'embedding' | 'velocity'
  subdimension?: string
  answerType: 'scale' | 'multiChoice' | 'fearToConfidence' | 'text' | 'boolean'
  weight: number
  answerOptions?: Array<{
    value: number
    label: string
    description?: string
  }>
  displayOrder: number
  questionGroup?: string
}

interface AssessmentProgress {
  totalQuestions: number
  answeredQuestions: number
  skippedQuestions: number
  completionPercentage: number
  dimensionProgress: Array<{
    dimension: string
    total: number
    answered: number
    percentage: number
  }>
}

interface Props {
  assessmentId: string
  onComplete?: (results: any) => void
  className?: string
}

const dimensionConfig = {
  individual: {
    icon: Brain,
    label: 'Individual Adaptability',
    color: 'cyan',
    gradient: 'from-cyan-500 to-cyan-600',
  },
  leadership: {
    icon: Users,
    label: 'Leadership Readiness',
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
  },
  cultural: {
    icon: Zap,
    label: 'Cultural Flexibility',
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
  },
  embedding: {
    icon: Target,
    label: 'AI Embedding',
    color: 'green',
    gradient: 'from-green-500 to-green-600',
  },
  velocity: {
    icon: TrendingUp,
    label: 'Change Velocity',
    color: 'orange',
    gradient: 'from-orange-500 to-orange-600',
  },
}

export function DynamicAssessmentFlow({
  assessmentId,
  onComplete,
  className = '',
}: Props) {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [progress, setProgress] = useState<AssessmentProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [answer, setAnswer] = useState<number | string | null>(null)
  const [startTime, setStartTime] = useState<number>(Date.now())

  // Fetch next question
  const fetchNextQuestion = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/assessments/${assessmentId}/questions/next`)

      if (!res.ok) {
        if (res.status === 404) {
          // Assessment complete
          if (onComplete) {
            onComplete({ assessmentId })
          }
          return
        }
        throw new Error('Failed to fetch question')
      }

      const data = await res.json()

      if (!data.question) {
        // Assessment complete
        if (onComplete) {
          onComplete({ assessmentId })
        }
        return
      }

      setCurrentQuestion(data.question)
      setAnswer(null)
      setStartTime(Date.now())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [assessmentId, onComplete])

  // Fetch progress
  const fetchProgress = useCallback(async () => {
    try {
      const res = await fetch(`/api/assessments/${assessmentId}/progress`)
      if (res.ok) {
        const data = await res.json()
        setProgress(data)
      }
    } catch (err) {
      console.error('Failed to fetch progress:', err)
    }
  }, [assessmentId])

  useEffect(() => {
    fetchNextQuestion()
    fetchProgress()
  }, [fetchNextQuestion, fetchProgress])

  // Submit answer
  const submitAnswer = async () => {
    if (!currentQuestion || answer === null) return

    try {
      setSubmitting(true)
      setError(null)

      const timeSpent = Math.round((Date.now() - startTime) / 1000)

      const res = await fetch(`/api/assessments/${assessmentId}/questions/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionCode: currentQuestion.questionCode,
          answer: {
            value: typeof answer === 'number' ? answer : undefined,
            text: typeof answer === 'string' ? answer : undefined,
            timeSpentSeconds: timeSpent,
          },
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to submit answer')
      }

      const data = await res.json()

      // Update progress and move to next question
      await fetchProgress()

      if (data.nextQuestion) {
        setCurrentQuestion(data.nextQuestion)
        setAnswer(null)
        setStartTime(Date.now())
      } else {
        await fetchNextQuestion()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer')
    } finally {
      setSubmitting(false)
    }
  }

  // Skip question
  const skipQuestion = async () => {
    if (!currentQuestion) return

    try {
      setSubmitting(true)

      const res = await fetch(`/api/assessments/${assessmentId}/questions/skip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionCode: currentQuestion.questionCode,
          reason: 'User skipped',
        }),
      })

      if (res.ok) {
        await fetchProgress()
        await fetchNextQuestion()
      }
    } catch (err) {
      console.error('Failed to skip question:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && !currentQuestion) {
    return (
      <div className={`min-h-[400px] flex items-center justify-center ${className}`}>
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading assessment...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`min-h-[400px] flex items-center justify-center ${className}`}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchNextQuestion}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className={`min-h-[400px] flex items-center justify-center ${className}`}>
        <div className="text-center">
          <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white font-gendy mb-2">
            Assessment Complete!
          </h2>
          <p className="text-gray-400">
            Your responses have been recorded. Analyzing results...
          </p>
        </div>
      </div>
    )
  }

  const config = dimensionConfig[currentQuestion.dimension]
  const DimensionIcon = config.icon

  return (
    <div className={`${className}`}>
      {/* Progress Header */}
      {progress && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              Question {progress.answeredQuestions + 1} of {progress.totalQuestions}
            </span>
            <span className="text-sm text-gray-400">
              {progress.completionPercentage}% complete
            </span>
          </div>

          {/* Overall Progress Bar */}
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress.completionPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Dimension Progress */}
          <div className="flex gap-1">
            {progress.dimensionProgress.map((dim) => {
              const dimConfig = dimensionConfig[dim.dimension as keyof typeof dimensionConfig]
              return (
                <div
                  key={dim.dimension}
                  className="flex-1 group relative"
                >
                  <div
                    className={`h-1.5 rounded-full transition-colors ${
                      dim.percentage === 100
                        ? 'bg-green-500'
                        : dim.percentage > 0
                        ? `bg-${dimConfig?.color || 'gray'}-500`
                        : 'bg-gray-700'
                    }`}
                  />
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {dimConfig?.label || dim.dimension}: {dim.percentage}%
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="bg-gray-900/50 rounded-2xl border border-white/10 overflow-hidden"
        >
          {/* Dimension Header */}
          <div className={`px-6 py-4 bg-gradient-to-r ${config.gradient} bg-opacity-20`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <DimensionIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">{config.label}</p>
                {currentQuestion.subdimension && (
                  <p className="text-white/70 text-sm">{currentQuestion.subdimension}</p>
                )}
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <h3 className="text-xl text-white font-medium leading-relaxed">
                {currentQuestion.questionText}
              </h3>
              {currentQuestion.helpText && (
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className={`p-2 rounded-lg transition-colors ${
                    showHelp ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Help Text */}
            <AnimatePresence>
              {showHelp && currentQuestion.helpText && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20"
                >
                  <p className="text-sm text-blue-300">{currentQuestion.helpText}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Description */}
            {currentQuestion.questionDescription && (
              <p className="text-gray-400 text-sm mb-6">
                {currentQuestion.questionDescription}
              </p>
            )}

            {/* Answer Input based on type */}
            <div className="mb-6">
              {currentQuestion.answerType === 'scale' && (
                <ScaleInput
                  value={answer as number}
                  onChange={setAnswer}
                  options={currentQuestion.answerOptions}
                />
              )}

              {currentQuestion.answerType === 'fearToConfidence' && (
                <FearToConfidenceSlider
                  initialValue={answer as number || 50}
                  onChange={(v) => setAnswer(v)}
                />
              )}

              {currentQuestion.answerType === 'multiChoice' && (
                <MultiChoiceInput
                  value={answer as number}
                  onChange={setAnswer}
                  options={currentQuestion.answerOptions || []}
                />
              )}

              {currentQuestion.answerType === 'text' && (
                <TextInput
                  value={answer as string || ''}
                  onChange={setAnswer}
                />
              )}

              {currentQuestion.answerType === 'boolean' && (
                <BooleanInput
                  value={answer as number}
                  onChange={setAnswer}
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={skipQuestion}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                <SkipForward className="w-4 h-4" />
                Skip
              </button>

              <button
                onClick={submitAnswer}
                disabled={answer === null || submitting}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// Scale Input Component
function ScaleInput({
  value,
  onChange,
  options,
}: {
  value: number | null
  onChange: (v: number) => void
  options?: Array<{ value: number; label: string; description?: string }>
}) {
  const defaultOptions = Array.from({ length: 10 }, (_, i) => ({
    value: i + 1,
    label: String(i + 1),
  }))

  const displayOptions = options || defaultOptions

  const firstOption = displayOptions[0] as { value: number; label: string; description?: string }
  const lastOption = displayOptions[displayOptions.length - 1] as { value: number; label: string; description?: string }

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-gray-500">
        <span>{firstOption?.description || 'Strongly Disagree'}</span>
        <span>{lastOption?.description || 'Strongly Agree'}</span>
      </div>
      <div className="flex gap-2">
        {displayOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              value === opt.value
                ? 'bg-cyan-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// Multi-choice Input Component
function MultiChoiceInput({
  value,
  onChange,
  options,
}: {
  value: number | null
  onChange: (v: number) => void
  options: Array<{ value: number; label: string; description?: string }>
}) {
  return (
    <div className="space-y-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`w-full text-left p-4 rounded-xl border transition-all ${
            value === opt.value
              ? 'bg-cyan-500/20 border-cyan-500/50 text-white'
              : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{opt.label}</span>
            {value === opt.value && <CheckCircle2 className="w-5 h-5 text-cyan-400" />}
          </div>
          {opt.description && (
            <p className="text-sm text-gray-400 mt-1">{opt.description}</p>
          )}
        </button>
      ))}
    </div>
  )
}

// Text Input Component
function TextInput({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter your response..."
      rows={4}
      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
    />
  )
}

// Boolean Input Component
function BooleanInput({
  value,
  onChange,
}: {
  value: number | null
  onChange: (v: number) => void
}) {
  return (
    <div className="flex gap-4">
      {[
        { value: 1, label: 'Yes' },
        { value: 0, label: 'No' },
      ].map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-4 rounded-xl font-medium transition-all ${
            value === opt.value
              ? 'bg-cyan-500 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export default DynamicAssessmentFlow
