'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ResponsiveLayout } from '@/components/templates/ResponsiveLayout'
import { motion } from 'framer-motion'
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
  Zap
} from 'lucide-react'
import { ProfileAnalysis } from '@/lib/userProfile'

export default function AssessmentResultsPage() {
  const params = useParams()
  const router = useRouter()
  const [assessment, setAssessment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [generatingResource, setGeneratingResource] = useState<string | null>(null)

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
          // Redirect to home if not found
          router.push('/')
        }
      } catch (error) {
        console.error('Failed to load assessment:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    loadAssessment()
  }, [params.id, router])

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
        a.download = `HumanGlue_Assessment_${assessment.userData.company}_${params.id}.html`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('PDF download failed:', error)
    } finally {
      setDownloading(false)
    }
  }

  const handleScheduleCall = () => {
    window.open('https://calendly.com/humanglue/strategy-session', '_blank')
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
      }
    } catch (error) {
      console.error('Resource generation failed:', error)
    } finally {
      setGeneratingResource(null)
    }
  }

  if (loading) {
    return (
      <ResponsiveLayout backgroundState="analyzing">
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      </ResponsiveLayout>
    )
  }

  if (!assessment) return null

  const { userData, analysis } = assessment

  return (
    <ResponsiveLayout backgroundState="presenting">
      <div className="min-h-screen py-20 px-6">
        <div className="container max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6"
            >
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm text-green-300">Assessment Complete</span>
            </motion.div>

            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-4">
              Your AI Transformation Assessment
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              {userData.name} at {userData.company}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold inline-flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                {downloading ? 'Generating...' : 'Download PDF'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleScheduleCall}
                className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-semibold inline-flex items-center gap-2 hover:bg-white/20"
              >
                <Calendar className="w-5 h-5" />
                Schedule Strategy Call
              </motion.button>
            </div>
          </motion.div>

          {/* AI Transformation Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-8 border border-white/10">
              <div className="text-center">
                <Award className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-white mb-2">AI Transformation Score</h2>
                <div className="text-7xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                  {analysis.scoring.fitScore}
                  <span className="text-3xl">/100</span>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  {[
                    { label: 'Fit Score', value: analysis.scoring.fitScore, icon: Target },
                    { label: 'Engagement', value: analysis.scoring.engagementScore, icon: Users },
                    { label: 'Urgency', value: analysis.scoring.urgencyScore, icon: Zap },
                    { label: 'Budget Alignment', value: analysis.scoring.budgetScore, icon: DollarSign }
                  ].map((metric, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-4">
                      <metric.icon className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{metric.value}</div>
                      <div className="text-sm text-gray-400">{metric.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Company Context */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-400" />
              Company Profile
            </h2>
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
                      <div className="text-sm text-gray-400">{item.label}</div>
                      <div className="text-white font-medium">{item.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Key Findings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <Lightbulb className="w-8 h-8 text-amber-400" />
              Key Findings
            </h2>
            <div className="space-y-3">
              {analysis.insights.keyFindings.map((finding: string, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-start gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-200">{finding}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recommended Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <ArrowRight className="w-8 h-8 text-blue-400" />
              Recommended Next Steps
            </h2>
            <div className="space-y-3">
              {analysis.insights.nextBestActions.map((action: string, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  whileHover={{ x: 10 }}
                  className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-500/20 flex items-start gap-3 cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-bold">{i + 1}</span>
                  </div>
                  <p className="text-gray-200 flex-1">{action}</p>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Predicted Outcomes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-400" />
              Predicted Outcomes
            </h2>
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
                  <div className={`text-3xl font-bold text-${metric.color}-400 mb-2`}>
                    {metric.value}
                  </div>
                  <div className="text-gray-400">{metric.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Personalized Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-12"
          >
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-cyan-400" />
                Your Personalized Resources
              </h2>
              <p className="text-gray-400 text-lg">
                AI-generated resources tailored specifically for {assessment.userData.company} using our proven methodologies
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {analysis.insights.personalizedContent.map((content: string, i: number) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="relative bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-cyan-500/10 rounded-2xl p-6 border-2 border-white/20 shadow-xl group cursor-pointer overflow-hidden"
                  onClick={() => handleGenerateResource(content, i)}
                >
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-2 pr-4">
                          {content}
                        </h3>
                        <p className="text-sm text-gray-400">
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

                    {/* Download CTA */}
                    <div className="flex items-center gap-2 text-sm font-medium text-cyan-400 group-hover:text-cyan-300 transition-colors">
                      <span>Click to generate & download</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Info banner */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-100">
                    <strong>Pro Tip:</strong> Each resource is AI-generated in real-time using your assessment data,
                    company profile, and our proprietary transformation methodologies. Resources include actionable
                    insights, ROI calculations, and implementation roadmaps tailored to your specific context.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl p-12 border border-white/10"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Organization?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Schedule a 30-minute strategy session with our transformation specialists to discuss your personalized roadmap
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleScheduleCall}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold inline-flex items-center gap-3 text-lg"
            >
              <Calendar className="w-6 h-6" />
              Schedule Your Strategy Session
              <ArrowRight className="w-6 h-6" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </ResponsiveLayout>
  )
}
