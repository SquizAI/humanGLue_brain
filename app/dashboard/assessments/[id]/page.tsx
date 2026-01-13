'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { AssessmentResults } from '@/components/assessment/AssessmentResults'
import {
  ArrowRight,
  Download,
  Share2,
  Calendar,
  Users,
  BarChart3,
  Loader2,
  AlertCircle,
  RefreshCw,
  Brain,
} from 'lucide-react'

interface AssessmentData {
  id: string
  status: 'in_progress' | 'completed' | 'abandoned'
  assessment_type: string
  overall_score?: number
  created_at: string
  completed_at?: string
  organization?: {
    id: string
    name: string
    slug: string
  }
}

export default function AssessmentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const assessmentId = params?.id as string

  const [assessment, setAssessment] = useState<AssessmentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`/api/assessments/${assessmentId}`)
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Assessment not found')
          }
          throw new Error('Failed to load assessment')
        }

        const data = await res.json()
        setAssessment(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (assessmentId) {
      fetchAssessment()
    }
  }, [assessmentId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500'
    if (score >= 60) return 'from-cyan-500 to-blue-500'
    if (score >= 40) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-pink-500'
  }

  const getMaturityLevel = (score: number): string => {
    const levels = [
      { min: 0, max: 10, name: 'Unaware' },
      { min: 11, max: 20, name: 'Aware' },
      { min: 21, max: 30, name: 'Exploring' },
      { min: 31, max: 40, name: 'Experimenting' },
      { min: 41, max: 50, name: 'Adopting' },
      { min: 51, max: 60, name: 'Scaling' },
      { min: 61, max: 70, name: 'Optimizing' },
      { min: 71, max: 80, name: 'Innovating' },
      { min: 81, max: 90, name: 'Leading' },
      { min: 91, max: 100, name: 'Transforming' },
    ]
    const level = levels.find(l => score >= l.min && score <= l.max)
    return level?.name || 'Unknown'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <DashboardSidebar onLogout={handleLogout} />
        <div className="lg:ml-[var(--sidebar-width,280px)] pb-20 lg:pb-0 transition-all min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-lg font-diatype">Loading assessment...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen bg-black">
        <DashboardSidebar onLogout={handleLogout} />
        <div className="lg:ml-[var(--sidebar-width,280px)] pb-20 lg:pb-0 transition-all min-h-screen flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2 font-gendy">
              {error || 'Assessment Not Found'}
            </h2>
            <p className="text-gray-400 mb-6 font-diatype">
              We couldn't load this assessment. It may have been deleted or you may not have access.
            </p>
            <div className="flex gap-4 justify-center">
              <motion.button
                onClick={() => router.refresh()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all flex items-center gap-2 font-diatype"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </motion.button>
              <Link href="/dashboard/assessments">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2 font-diatype"
                >
                  Back to Assessments
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // If assessment is still in progress, show continue option
  if (assessment.status === 'in_progress') {
    return (
      <div className="min-h-screen bg-black">
        <DashboardSidebar onLogout={handleLogout} />
        <div className="lg:ml-[var(--sidebar-width,280px)] pb-20 lg:pb-0 transition-all min-h-screen flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg w-full bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-6">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 font-gendy">
              Assessment In Progress
            </h2>
            <p className="text-gray-400 mb-6 font-diatype">
              This assessment hasn't been completed yet. Continue where you left off to see your results.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/dashboard/assessments">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all font-diatype"
                >
                  Back
                </motion.button>
              </Link>
              <Link href={`/dashboard/assessments/new?continue=${assessmentId}`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2 font-diatype"
                >
                  Continue Assessment
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Show completed assessment results
  return (
    <div className="min-h-screen bg-black">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] pb-20 lg:pb-0 transition-all">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white font-gendy">
                    AI Maturity Assessment Results
                  </h1>
                  {assessment.overall_score !== undefined && (
                    <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${getScoreColor(assessment.overall_score)} text-white text-sm font-semibold font-diatype`}>
                      {getMaturityLevel(assessment.overall_score)} (Level {Math.floor(assessment.overall_score / 10)}/10)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-400 font-diatype">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(assessment.completed_at || assessment.created_at)}</span>
                  </div>
                  {assessment.organization && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{assessment.organization.name}</span>
                    </div>
                  )}
                  {assessment.assessment_type && (
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      <span className="capitalize">{assessment.assessment_type.replace('_', ' ')}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 hover:border-cyan-500/30 transition-all inline-flex items-center gap-2 font-diatype"
                >
                  <Share2 className="w-5 h-5" />
                  Share Report
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all inline-flex items-center gap-2 font-diatype"
                >
                  <Download className="w-5 h-5" />
                  Download PDF
                </motion.button>
                <Link href="/dashboard/assessments">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 hover:border-cyan-500/30 transition-all inline-flex items-center gap-2 font-diatype"
                  >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                    Back to Assessments
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Assessment Results Component */}
        <main className="p-8">
          <AssessmentResults assessmentId={assessmentId} />
        </main>
      </div>
    </div>
  )
}
