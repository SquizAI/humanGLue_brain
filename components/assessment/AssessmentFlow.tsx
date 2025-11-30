'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Brain, Users, Zap, Target, TrendingUp, ArrowRight, ArrowLeft } from 'lucide-react'
import { AdaptabilityScore } from '@/components/ui/AdaptabilityScore'
import { FearToConfidenceSlider } from '@/components/ui/FearToConfidenceSlider'

interface AssessmentStep {
  id: string
  dimension: 'individual' | 'leadership' | 'cultural' | 'embedding' | 'velocity'
  title: string
  subtitle: string
  icon: any
  questions: AssessmentQuestion[]
}

interface AssessmentQuestion {
  id: string
  text: string
  type: 'scale' | 'multiChoice' | 'fearToConfidence'
  options?: string[]
  weight: number
}

const ASSESSMENT_STEPS: AssessmentStep[] = [
  {
    id: 'individual',
    dimension: 'individual',
    title: 'Individual Adaptability',
    subtitle: 'How ready are your people for AI-driven change?',
    icon: Brain,
    questions: [
      {
        id: 'change-readiness',
        text: 'How comfortable are employees with trying new AI tools and workflows?',
        type: 'fearToConfidence',
        weight: 25,
      },
      {
        id: 'learning-agility',
        text: 'How quickly do employees typically learn and adopt new technologies?',
        type: 'scale',
        weight: 25,
      },
      {
        id: 'ai-confidence',
        text: 'What is the current level of AI confidence across your workforce?',
        type: 'fearToConfidence',
        weight: 20,
      },
      {
        id: 'growth-mindset',
        text: 'Do employees believe they can develop AI skills through effort?',
        type: 'scale',
        weight: 15,
      },
    ],
  },
  {
    id: 'leadership',
    dimension: 'leadership',
    title: 'Leadership Readiness',
    subtitle: 'Can your leaders champion AI transformation?',
    icon: Users,
    questions: [
      {
        id: 'ai-literacy',
        text: 'How well do leaders understand AI capabilities and limitations?',
        type: 'scale',
        weight: 25,
      },
      {
        id: 'change-championing',
        text: 'Are leaders visibly supporting and investing in AI transformation?',
        type: 'scale',
        weight: 25,
      },
      {
        id: 'vulnerability',
        text: 'Are leaders comfortable admitting AI knowledge gaps?',
        type: 'fearToConfidence',
        weight: 20,
      },
    ],
  },
  {
    id: 'cultural',
    dimension: 'cultural',
    title: 'Cultural Flexibility',
    subtitle: 'Is your culture built for experimentation and learning?',
    icon: Zap,
    questions: [
      {
        id: 'psychological-safety',
        text: 'Can employees safely experiment and learn from AI failures?',
        type: 'scale',
        weight: 25,
      },
      {
        id: 'experimentation',
        text: 'Is trying new AI approaches encouraged and rewarded?',
        type: 'scale',
        weight: 25,
      },
    ],
  },
  {
    id: 'embedding',
    dimension: 'embedding',
    title: 'Behavior Embedding',
    subtitle: 'Can new AI habits stick in your organization?',
    icon: Target,
    questions: [
      {
        id: 'habit-strength',
        text: 'How ingrained are existing workflows that AI will change?',
        type: 'scale',
        weight: 25,
      },
      {
        id: 'reinforcement',
        text: 'Do you have systems to nudge and reinforce new behaviors?',
        type: 'scale',
        weight: 25,
      },
    ],
  },
  {
    id: 'velocity',
    dimension: 'velocity',
    title: 'Transformation Velocity',
    subtitle: 'How fast can you move from awareness to action?',
    icon: TrendingUp,
    questions: [
      {
        id: 'decision-speed',
        text: 'How quickly does your organization move from insight to action?',
        type: 'scale',
        weight: 25,
      },
      {
        id: 'resource-flexibility',
        text: 'Can you easily reallocate resources to AI priorities?',
        type: 'scale',
        weight: 25,
      },
    ],
  },
]

export function AssessmentFlow() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [showResults, setShowResults] = useState(false)

  const step = ASSESSMENT_STEPS[currentStep]
  const progress = ((currentStep + 1) / ASSESSMENT_STEPS.length) * 100

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const canProceed = () => {
    return step.questions.every((q) => answers[q.id] !== undefined)
  }

  const handleNext = () => {
    if (currentStep < ASSESSMENT_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      setShowResults(true)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const calculateDimensionScore = (dimension: string) => {
    const relevantStep = ASSESSMENT_STEPS.find((s) => s.dimension === dimension)
    if (!relevantStep) return 0

    let totalWeight = 0
    let weightedScore = 0

    relevantStep.questions.forEach((q) => {
      const answer = answers[q.id] || 0
      weightedScore += answer * q.weight
      totalWeight += q.weight
    })

    return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0
  }

  const calculateOverallScore = () => {
    const scores = ASSESSMENT_STEPS.map((s) => calculateDimensionScore(s.dimension))
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }

  if (showResults) {
    return <AssessmentResults scores={ASSESSMENT_STEPS.map((s) => ({
      dimension: s.dimension,
      title: s.title,
      score: calculateDimensionScore(s.dimension),
    }))} overallScore={calculateOverallScore()} />
  }

  const Icon = step.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 py-12 px-6">
      <div className="container max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-400">
              Step {currentStep + 1} of {ASSESSMENT_STEPS.length}
            </span>
            <span className="text-sm font-medium text-gray-400">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="backdrop-blur-xl bg-white/5 border border-gray-700 rounded-3xl p-8 lg:p-12"
          >
            {/* Header */}
            <div className="flex items-start gap-6 mb-8">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{step.title}</h2>
                <p className="text-lg text-gray-300">{step.subtitle}</p>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-8">
              {step.questions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold text-white">
                    {index + 1}. {question.text}
                  </h3>

                  {question.type === 'fearToConfidence' ? (
                    <FearToConfidenceSlider
                      initialValue={answers[question.id] || 50}
                      onChange={(value) => handleAnswer(question.id, value)}
                      label=""
                      showLabels={true}
                    />
                  ) : (
                    <div className="space-y-3">
                      {[20, 40, 60, 80, 100].map((value) => (
                        <button
                          key={value}
                          onClick={() => handleAnswer(question.id, value)}
                          className={`
                            w-full p-4 rounded-xl text-left transition-all duration-200
                            ${
                              answers[question.id] === value
                                ? 'bg-blue-500/20 border-2 border-blue-500 text-white'
                                : 'bg-white/5 border border-gray-700 text-gray-300 hover:bg-white/10'
                            }
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <span>{value === 20 ? 'Very Low' : value === 40 ? 'Low' : value === 60 ? 'Medium' : value === 80 ? 'High' : 'Very High'}</span>
                            <span className="text-sm text-gray-400">{value}/100</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-700">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-full font-medium
                  transition-all duration-200
                  ${
                    currentStep === 0
                      ? 'opacity-50 cursor-not-allowed text-gray-500'
                      : 'text-white hover:bg-white/10'
                  }
                `}
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>

              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`
                  flex items-center gap-2 px-8 py-4 rounded-full font-semibold
                  transition-all duration-200
                  ${
                    canProceed()
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/50'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {currentStep === ASSESSMENT_STEPS.length - 1 ? 'See Results' : 'Next'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function AssessmentResults({
  scores,
  overallScore,
}: {
  scores: Array<{ dimension: string; title: string; score: number }>
  overallScore: number
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 py-12 px-6">
      <div className="container max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Your Adaptability Assessment Results
          </h1>
          <p className="text-xl text-gray-300">
            Here's how your organization scores across the five dimensions of adaptability
          </p>
        </motion.div>

        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-16"
        >
          <AdaptabilityScore
            score={overallScore}
            label="Overall Adaptability Score"
            size="lg"
          />
        </motion.div>

        {/* Dimension Scores */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {scores.map((s, index) => (
            <motion.div
              key={s.dimension}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <AdaptabilityScore
                score={s.score}
                label={s.title}
                dimension={s.dimension as any}
                showDetails={false}
                size="md"
              />
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <button className="px-12 py-5 rounded-full text-lg font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300">
            Get Your Personalized Transformation Plan
          </button>
        </motion.div>
      </div>
    </div>
  )
}
