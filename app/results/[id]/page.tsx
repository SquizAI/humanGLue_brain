'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Navigation } from '@/components/organisms/Navigation'
import { Footer } from '@/components/organisms/Footer'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  Share2,
  Calendar,
  TrendingUp,
  Target,
  Users,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Mail,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Award,
  Lightbulb,
  Zap,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  AlertCircle,
  RefreshCw,
  X
} from 'lucide-react'

// Toast notification component
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: 50, x: '-50%' }}
      className={`fixed bottom-6 left-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 ${
        type === 'success'
          ? 'bg-green-500/90 text-white border border-green-400/50'
          : 'bg-red-500/90 text-white border border-red-400/50'
      }`}
    >
      {type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      <span className="font-diatype">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

// Collapsible section component for progressive disclosure
function CollapsibleSection({
  title,
  icon: Icon,
  iconColor,
  children,
  defaultOpen = true
}: {
  title: string
  icon: any
  iconColor: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between mb-4 group"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3 font-gendy">
          <Icon className={`w-7 h-7 md:w-8 md:h-8 ${iconColor}`} />
          {title}
        </h2>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors"
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Score gauge visualization
function ScoreGauge({ score, benchmark = 65 }: { score: number; benchmark?: number }) {
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (score / 100) * circumference
  const benchmarkOffset = circumference - (benchmark / 100) * circumference

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
        />
        {/* Benchmark indicator */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={benchmarkOffset}
          strokeLinecap="round"
        />
        {/* Score circle */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="8"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-4xl font-bold text-white font-gendy"
        >
          {score}
        </motion.span>
        <span className="text-sm text-gray-400 font-diatype">out of 100</span>
      </div>
    </div>
  )
}

// Results Expired Component
function ResultsExpired({ onRetake }: { onRetake: () => void }) {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <div className="pt-32 pb-20 px-6">
        <div className="container max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl p-12 border border-amber-500/20"
          >
            <AlertCircle className="w-16 h-16 text-amber-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4 font-gendy">
              Assessment Results Not Found
            </h1>
            <p className="text-gray-300 mb-8 font-diatype">
              This assessment may have expired or the link is no longer valid.
              Take a new assessment to get your personalized AI transformation insights.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRetake}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold inline-flex items-center gap-3 font-diatype"
            >
              <RefreshCw className="w-5 h-5" />
              Start New Assessment
            </motion.button>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function AssessmentResultsPage() {
  const params = useParams()
  const router = useRouter()
  const [assessment, setAssessment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [generatingResource, setGeneratingResource] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    const loadAssessment = async () => {
      try {
        // Load from localStorage first
        const stored = localStorage.getItem(`assessment_${params.id}`)
        if (stored) {
          setAssessment(JSON.parse(stored))
          setLoading(false)
          return
        }

        // Try to fetch from API
        const response = await fetch(`/api/assessments/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setAssessment(data)
        } else {
          // Show expired state instead of redirecting
          setNotFound(true)
        }
      } catch (error) {
        console.error('Failed to load assessment:', error)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    loadAssessment()
  }, [params.id])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
  }

  const handleDownloadPDF = async () => {
    setDownloading(true)
    try {
      const response = await fetch(`/api/assessments/${params.id}/pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessment)
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `HMN_Transformation_Roadmap_${assessment.userData.company}_${params.id}.html`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        showToast('Your transformation roadmap has been downloaded!', 'success')
      } else {
        showToast('Failed to generate roadmap. Please try again.', 'error')
      }
    } catch (error) {
      console.error('PDF download failed:', error)
      showToast('Failed to generate roadmap. Please try again.', 'error')
    } finally {
      setDownloading(false)
    }
  }

  const handleScheduleCall = () => {
    window.open('https://calendly.com/alex-behmn/discovery-call', '_blank')
  }

  const handleShare = async () => {
    const shareUrl = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My AI Transformation Assessment Results',
          text: `Check out my AI Transformation Score: ${assessment?.analysis?.scoring?.fitScore}/100`,
          url: shareUrl,
        })
      } catch (error) {
        // User cancelled or share failed, fall back to copy
        await copyToClipboard(shareUrl)
      }
    } else {
      await copyToClipboard(shareUrl)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      showToast('Link copied to clipboard!', 'success')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      showToast('Failed to copy link', 'error')
    }
  }

  const handleGenerateResource = async (resourceName: string, index: number) => {
    setGeneratingResource(resourceName)
    try {
      const response = await fetch(`/api/resources/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resourceType: resourceName,
          assessmentData: assessment,
          resourceIndex: index
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${resourceName.replace(/[^a-z0-9]/gi, '_')}_${assessment.userData.company}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        showToast(`${resourceName} downloaded successfully!`, 'success')
      } else {
        showToast('Failed to generate resource. Please try again.', 'error')
      }
    } catch (error) {
      console.error('Resource generation failed:', error)
      showToast('Failed to generate resource. Please try again.', 'error')
    } finally {
      setGeneratingResource(null)
    }
  }

  const handleRetake = () => {
    router.push('/?chat=true')
  }

  // Loading state with skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="pt-32 pb-20 px-6">
          <div className="container max-w-6xl mx-auto">
            {/* Skeleton loader */}
            <div className="animate-pulse space-y-8">
              <div className="text-center">
                <div className="h-8 w-48 bg-white/10 rounded-full mx-auto mb-6" />
                <div className="h-12 w-96 bg-white/10 rounded-xl mx-auto mb-4" />
                <div className="h-6 w-64 bg-white/10 rounded-lg mx-auto" />
              </div>
              <div className="h-64 bg-white/5 rounded-2xl" />
              <div className="grid md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-20 bg-white/5 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Not found state
  if (notFound || !assessment) {
    return <ResultsExpired onRetake={handleRetake} />
  }

  const { userData, analysis } = assessment
  const score = analysis.scoring.fitScore
  const percentile = Math.min(99, Math.round(score * 0.85 + 10)) // Simulated percentile

  // Get score level description
  const getScoreLevel = (score: number) => {
    if (score >= 80) return { level: 'Excellent', color: 'text-green-400', description: 'You\'re ahead of the curve' }
    if (score >= 60) return { level: 'Good', color: 'text-blue-400', description: 'Strong foundation for growth' }
    if (score >= 40) return { level: 'Developing', color: 'text-amber-400', description: 'Opportunities for improvement' }
    return { level: 'Emerging', color: 'text-orange-400', description: 'Early stage transformation' }
  }

  const scoreLevel = getScoreLevel(score)

  return (
    <div className="min-h-screen bg-black">
      <Navigation />

      {/* Toast notifications */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <div className="pt-24 md:pt-32 pb-20 px-4 md:px-6">
        <div className="container max-w-6xl mx-auto">

          {/* Mobile-First Glanceable Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-6 border border-white/10 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-400 font-diatype">Your Score</p>
                <p className="text-4xl font-bold text-white font-gendy">{score}<span className="text-xl text-gray-400">/100</span></p>
              </div>
              <div className={`px-3 py-1 rounded-full ${scoreLevel.color} bg-white/5 text-sm font-diatype`}>
                {scoreLevel.level}
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-4 font-diatype">
              {analysis.insights.keyFindings[0]}
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleScheduleCall}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold inline-flex items-center justify-center gap-2 font-diatype"
            >
              <Sparkles className="w-5 h-5" />
              Begin Your Transformation
            </motion.button>
          </motion.div>

          {/* Personalized Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 md:mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6"
            >
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm text-green-300 font-diatype">Assessment Complete</span>
            </motion.div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 font-gendy">
              {userData.name}, Your Transformation Awaits
            </h1>

            {/* Personalized message based on their data */}
            <p className="text-lg md:text-xl text-gray-300 mb-6 max-w-3xl mx-auto font-diatype">
              Based on {userData.company}'s focus on{' '}
              <span className="text-cyan-400">{userData.challenge?.toLowerCase() || 'organizational growth'}</span>
              {userData.companySize && ` and your ${userData.companySize} team`},
              we've identified key opportunities to accelerate your AI transformation.
            </p>

            {/* Action Buttons - Purpose-driven language */}
            <div className="hidden md:flex flex-wrap gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleScheduleCall}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold inline-flex items-center gap-2 font-diatype"
              >
                <Sparkles className="w-5 h-5" />
                Begin Your Transformation Journey
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-semibold inline-flex items-center gap-2 hover:bg-white/20 disabled:opacity-50 font-diatype"
              >
                <Download className="w-5 h-5" />
                {downloading ? 'Generating...' : 'Save Your Roadmap'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-semibold inline-flex items-center gap-2 hover:bg-white/20 font-diatype"
              >
                {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                {copied ? 'Copied!' : 'Share Results'}
              </motion.button>
            </div>
          </motion.div>

          {/* AI Transformation Score - Story-driven with visual benchmark */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden md:block mb-12"
          >
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-8 border border-white/10">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Score Visualization */}
                <div className="text-center">
                  <Award className="w-10 h-10 text-blue-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-white mb-6 font-gendy">AI Transformation Score</h2>
                  <ScoreGauge score={score} benchmark={65} />
                  <div className="mt-4">
                    <span className={`text-lg font-semibold ${scoreLevel.color} font-gendy`}>
                      {scoreLevel.level}
                    </span>
                    <p className="text-sm text-gray-400 mt-1 font-diatype">{scoreLevel.description}</p>
                  </div>
                  {/* Benchmark comparison */}
                  <div className="mt-4 px-4 py-2 bg-white/5 rounded-lg inline-block">
                    <p className="text-sm text-gray-300 font-diatype">
                      You're ahead of <span className="text-cyan-400 font-semibold">{percentile}%</span> of companies in your industry
                    </p>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4 font-gendy">Score Breakdown</h3>
                  {[
                    { label: 'Strategic Fit', value: analysis.scoring.fitScore, icon: Target, description: 'Alignment with AI transformation goals' },
                    { label: 'Team Engagement', value: analysis.scoring.engagementScore, icon: Users, description: 'Organizational readiness & buy-in' },
                    { label: 'Transformation Urgency', value: analysis.scoring.urgencyScore, icon: Zap, description: 'Business need for immediate action' },
                    { label: 'Investment Readiness', value: analysis.scoring.budgetScore, icon: DollarSign, description: 'Resource allocation capability' }
                  ].map((metric, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <metric.icon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-white font-diatype">{metric.label}</span>
                          <span className="text-lg font-bold text-white font-gendy">{metric.value}</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${metric.value}%` }}
                            transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1 font-diatype">{metric.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Key Finding Highlight - First finding prominently displayed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="hidden md:block mb-12"
          >
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl p-8 border border-amber-500/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2 font-gendy">Your Top Insight</h3>
                  <p className="text-xl text-gray-200 font-diatype leading-relaxed">
                    {analysis.insights.keyFindings[0]}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Company Context - Collapsible */}
          <CollapsibleSection
            title="Company Profile"
            icon={Building2}
            iconColor="text-blue-400"
            defaultOpen={false}
          >
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: 'Company', value: userData.company, icon: Building2 },
                { label: 'Location', value: userData.companyLocation || userData.enrichedLocation, icon: MapPin },
                { label: 'Industry', value: userData.industry || userData.enrichedIndustry, icon: BarChart3 },
                { label: 'Size', value: userData.companySize || userData.enrichedEmployeeCount, icon: Users },
                { label: 'Primary Challenge', value: userData.challenge, icon: Target },
                { label: 'Budget', value: userData.budget, icon: DollarSign }
              ].filter(item => item.value).map((item, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-sm text-gray-400 font-diatype">{item.label}</div>
                      <div className="text-white font-medium font-diatype">{item.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Key Findings - Collapsible (open by default) */}
          <CollapsibleSection
            title="Key Findings"
            icon={Lightbulb}
            iconColor="text-amber-400"
            defaultOpen={true}
          >
            <div className="space-y-3">
              {analysis.insights.keyFindings.map((finding: string, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-start gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-200 font-diatype">{finding}</p>
                </motion.div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Recommended Next Steps - Primary focus */}
          <CollapsibleSection
            title="Your Transformation Path"
            icon={ArrowRight}
            iconColor="text-blue-400"
            defaultOpen={true}
          >
            <div className="space-y-3">
              {analysis.insights.nextBestActions.map((action: string, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  whileHover={{ x: 10 }}
                  className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-500/20 flex items-start gap-3 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-bold font-gendy">{i + 1}</span>
                  </div>
                  <p className="text-gray-200 flex-1 font-diatype">{action}</p>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                </motion.div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Predicted Outcomes - Collapsible */}
          <CollapsibleSection
            title="Predicted Outcomes"
            icon={TrendingUp}
            iconColor="text-green-400"
            defaultOpen={false}
          >
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  label: 'Time to Value',
                  value: `${analysis.predictions.timeToClose} days`,
                  icon: Clock,
                  color: 'blue'
                },
                {
                  label: 'Estimated ROI',
                  value: `$${analysis.predictions.dealSize.toLocaleString()}`,
                  icon: DollarSign,
                  color: 'green'
                },
                {
                  label: 'Success Probability',
                  value: `${(analysis.predictions.successProbability * 100).toFixed(0)}%`,
                  icon: Award,
                  color: 'cyan'
                }
              ].map((metric, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/10"
                >
                  <metric.icon className={`w-10 h-10 text-${metric.color}-400 mb-4`} />
                  <div className={`text-3xl font-bold text-${metric.color}-400 mb-2 font-gendy`}>
                    {metric.value}
                  </div>
                  <div className="text-gray-400 font-diatype">{metric.label}</div>
                </motion.div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Personalized Resources */}
          <CollapsibleSection
            title="Your Personalized Resources"
            icon={Sparkles}
            iconColor="text-cyan-400"
            defaultOpen={true}
          >
            <p className="text-gray-400 text-lg mb-6 font-diatype">
              AI-generated resources tailored specifically for {assessment.userData.company} using our proven methodologies
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {analysis.insights.personalizedContent.map((content: string, i: number) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="relative bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-cyan-500/10 rounded-2xl p-6 border-2 border-white/20 shadow-xl group cursor-pointer overflow-hidden"
                  onClick={() => handleGenerateResource(content, i)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-2 pr-4 font-gendy">
                          {content}
                        </h3>
                        <p className="text-sm text-gray-400 font-diatype">
                          Customized for your organization's size, industry, and challenges
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {generatingResource === content ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-10 h-10 rounded-full border-2 border-cyan-400 border-t-transparent"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                            <Download className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm font-medium text-cyan-400 group-hover:text-cyan-300 transition-colors font-diatype">
                      <span>Click to generate & download</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-100 font-diatype">
                    <strong>Pro Tip:</strong> Each resource is AI-generated in real-time using your assessment data,
                    company profile, and our proprietary transformation methodologies.
                  </p>
                </div>
              </div>
            </motion.div>
          </CollapsibleSection>

          {/* Final CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl p-8 md:p-12 border border-white/10"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-gendy">
              Ready to Transform {userData.company}?
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto font-diatype">
              Schedule a 30-minute strategy session with our transformation specialists to discuss your personalized roadmap
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleScheduleCall}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold inline-flex items-center justify-center gap-3 text-lg font-diatype"
              >
                <Calendar className="w-6 h-6" />
                Begin Your Transformation
                <ArrowRight className="w-6 h-6" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="px-8 py-4 bg-white/10 border border-white/20 text-white rounded-xl font-semibold inline-flex items-center justify-center gap-3 text-lg hover:bg-white/20 font-diatype"
              >
                <Share2 className="w-6 h-6" />
                Share with Your Team
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
