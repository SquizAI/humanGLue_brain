'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { DynamicAssessmentFlow } from '@/components/assessment/DynamicAssessmentFlow'
import { useAuth } from '@/lib/auth/hooks'
import {
  ArrowRight,
  Check,
  Target,
  Users,
  Brain,
  Zap,
  TrendingUp,
  Loader2,
  AlertCircle,
} from 'lucide-react'

// Default template ID for the AI Adaptability Assessment
const DEFAULT_TEMPLATE_ID = '2dfb928e-6101-42cd-820f-2e20db341d27'
// Default organization for users without one
const DEFAULT_ORGANIZATION_ID = '11111111-1111-1111-1111-111111111111'

function NewAssessmentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const continueId = searchParams.get('continue')
  const { profile } = useAuth()

  const [assessmentStarted, setAssessmentStarted] = useState(false)
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingContinue, setIsLoadingContinue] = useState(false)

  // Handle continue assessment from URL parameter
  useEffect(() => {
    if (continueId) {
      setIsLoadingContinue(true)
      // Verify the assessment exists and is in progress
      fetch(`/api/assessments/${continueId}`)
        .then(res => {
          if (!res.ok) throw new Error('Assessment not found')
          return res.json()
        })
        .then(data => {
          if (data.data?.status === 'in_progress') {
            setAssessmentId(continueId)
            setAssessmentStarted(true)
          } else {
            // Assessment is already completed, redirect to results
            router.push(`/dashboard/assessments/${continueId}`)
          }
        })
        .catch(() => {
          setError('Could not continue assessment. It may have been deleted.')
        })
        .finally(() => {
          setIsLoadingContinue(false)
        })
    }
  }, [continueId, router])

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  const startAssessment = async () => {
    try {
      setIsCreating(true)
      setError(null)

      // Create a new assessment via API
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: DEFAULT_TEMPLATE_ID,
          organizationId: profile?.organization_id || DEFAULT_ORGANIZATION_ID,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error?.message || 'Failed to create assessment')
      }

      const data = await res.json()
      setAssessmentId(data.data.id)
      setAssessmentStarted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsCreating(false)
    }
  }

  const handleAssessmentComplete = async (results: { assessmentId: string }) => {
    // Complete the assessment
    try {
      const res = await fetch(`/api/assessments/${results.assessmentId}/complete`, {
        method: 'POST',
      })

      if (res.ok) {
        // Redirect to results page
        router.push(`/dashboard/assessments/${results.assessmentId}`)
      } else {
        // Still redirect, the results page will handle loading
        router.push(`/dashboard/assessments/${results.assessmentId}`)
      }
    } catch {
      // Redirect anyway
      router.push(`/dashboard/assessments/${results.assessmentId}`)
    }
  }

  const dimensions = [
    {
      name: 'Individual Adaptability',
      icon: Brain,
      description: 'Personal AI readiness and learning agility',
      weight: '25%',
    },
    {
      name: 'Leadership Readiness',
      icon: Users,
      description: 'Executive support and change management',
      weight: '20%',
    },
    {
      name: 'Cultural Flexibility',
      icon: Zap,
      description: 'Organizational openness to AI transformation',
      weight: '20%',
    },
    {
      name: 'AI Embedding',
      icon: Target,
      description: 'Current AI integration and infrastructure',
      weight: '20%',
    },
    {
      name: 'Change Velocity',
      icon: TrendingUp,
      description: 'Speed of adoption and implementation',
      weight: '15%',
    },
  ]

  // Show loading state when continuing an assessment
  if (isLoadingContinue) {
    return (
      <div className="min-h-screen bg-black">
        <DashboardSidebar onLogout={handleLogout} />
        <div className="lg:ml-[var(--sidebar-width,280px)] pb-20 lg:pb-0 transition-all min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-lg font-diatype">Loading your assessment...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!assessmentStarted) {
    return (
      <div className="min-h-screen bg-black">
        <DashboardSidebar onLogout={handleLogout} />

        <div className="lg:ml-[var(--sidebar-width,280px)] pb-20 lg:pb-0 transition-all min-h-screen flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl w-full bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-4xl font-bold text-white mb-4 font-gendy">
              AI Maturity Assessment
            </h1>

            <p className="text-xl text-gray-300 mb-8 font-diatype">
              Comprehensive evaluation of your organization's AI readiness across 5 key dimensions
            </p>

            {/* Dimension Overview */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              {dimensions.map((dimension, index) => {
                const Icon = dimension.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-cyan-500/30 transition-all group"
                  >
                    <Icon className="w-6 h-6 text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-xs text-white font-semibold font-diatype mb-1">{dimension.name}</p>
                    <p className="text-xs text-gray-400 font-diatype">{dimension.weight}</p>
                  </motion.div>
                )
              })}
            </div>

            {/* What to Expect */}
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-6 mb-8 text-left">
              <h3 className="text-lg font-semibold text-white mb-3 font-gendy">What to Expect:</h3>
              <ul className="space-y-2 text-sm text-gray-300 font-diatype">
                <li className="flex gap-2">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span><strong>Dynamic questions</strong> that adapt based on your responses</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span><strong>Multiple formats:</strong> Scales, multiple choice, text responses, and fear-to-confidence assessments</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span><strong>15-25 minutes</strong> to complete (quality answers = better insights)</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span><strong>Comprehensive report</strong> with maturity level, dimension scores, and actionable recommendations</span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span><strong>Psychometric profiling</strong> to understand change readiness and communication preferences</span>
                </li>
              </ul>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400 font-diatype">{error}</p>
              </motion.div>
            )}

            <div className="flex gap-4 justify-center">
              <motion.button
                onClick={() => router.push('/dashboard/assessments')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all font-diatype"
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={startAssessment}
                disabled={isCreating}
                whileHover={!isCreating ? { scale: 1.05 } : {}}
                whileTap={!isCreating ? { scale: 0.95 } : {}}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2 font-diatype disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Assessment...
                  </>
                ) : (
                  <>
                    Start Assessment
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Assessment in progress - show dynamic flow
  return (
    <div className="min-h-screen bg-black">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] pb-20 lg:pb-0 transition-all">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white font-gendy">AI Maturity Assessment</h2>
                  <p className="text-sm text-gray-400 font-diatype">
                    Answer thoughtfully for accurate results
                  </p>
                </div>
              </div>
              <motion.button
                onClick={() => router.push('/dashboard/assessments')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors font-diatype"
              >
                Save & Exit
              </motion.button>
            </div>
          </div>
        </header>

        {/* Assessment Flow */}
        <main className="p-8 max-w-4xl mx-auto">
          {assessmentId && (
            <DynamicAssessmentFlow
              assessmentId={assessmentId}
              onComplete={handleAssessmentComplete}
            />
          )}
        </main>
      </div>
    </div>
  )
}

// Wrap with Suspense for useSearchParams
export default function NewAssessmentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg font-diatype">Loading...</span>
        </div>
      </div>
    }>
      <NewAssessmentContent />
    </Suspense>
  )
}
