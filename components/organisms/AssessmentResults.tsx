'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Download, 
  Share2, 
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Lightbulb,
  Target,
  Rocket,
  Users,
  Brain,
  Zap,
  Building2
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { MaturityLevelDisplay } from './MaturityLevelDisplay'
import { AssessmentResult } from '../../lib/assessment/orchestrator'
import { maturityLevels } from '../../lib/assessment/maturityModel'

interface AssessmentResultsProps {
  result: AssessmentResult
  onBookConsultation: () => void
  onDownloadReport: () => void
  onShareResults: () => void
}

export function AssessmentResults({
  result,
  onBookConsultation,
  onDownloadReport,
  onShareResults
}: AssessmentResultsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'roadmap'>('overview')

  const categoryIcons = {
    technical: Building2,
    human: Users,
    business: TrendingUp,
    ai: Brain
  }

  const maturityDetails = maturityLevels[result.overallMaturityLevel]

  // Calculate category scores
  const categoryScores = Array.from(result.dimensionScores.entries()).reduce((acc, [dimensionId, score]) => {
    const category = dimensionId.split('_')[0] as keyof typeof categoryIcons
    if (!acc[category]) {
      acc[category] = { total: 0, count: 0 }
    }
    acc[category].total += score
    acc[category].count++
    return acc
  }, {} as Record<string, { total: number; count: number }>)

  const getCategoryAverage = (category: string) => {
    const data = categoryScores[category]
    return data ? Math.round(data.total / data.count) : 0
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full border border-blue-500/30"
        >
          <Brain className="w-6 h-6 text-blue-400" />
          <span className="text-lg font-semibold text-white">Assessment Complete</span>
        </motion.div>
        <h1 className="text-4xl font-bold text-white">Your AI Maturity Report</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Based on our comprehensive analysis, here's your organization's AI readiness assessment
          and personalized transformation roadmap.
        </p>
      </div>

      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-800 p-8"
      >
        <MaturityLevelDisplay
          level={result.overallMaturityLevel}
          maturityDetails={maturityDetails}
          animate={true}
        />
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap justify-center gap-4"
      >
        <button
          onClick={onDownloadReport}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30 hover:bg-blue-500/30 transition-all"
        >
          <Download className="w-4 h-4" />
          Download Report
        </button>
        <button
          onClick={onShareResults}
          className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-gray-300 rounded-xl border border-gray-700 hover:bg-gray-700 transition-all"
        >
          <Share2 className="w-4 h-4" />
          Share Results
        </button>
        <button
          onClick={onBookConsultation}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all"
        >
          <Calendar className="w-4 h-4" />
          Book Consultation
        </button>
      </motion.div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-1 border border-gray-800">
          {(['overview', 'insights', 'roadmap'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-6 py-2 rounded-lg font-medium transition-all capitalize',
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                  : 'text-gray-400 hover:text-white'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Category Scores */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-400" />
                Category Breakdown
              </h3>
              <div className="space-y-4">
                {Object.entries(categoryIcons).map(([category, Icon]) => {
                  const score = getCategoryAverage(category)
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-white capitalize">{category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${score * 10}%` }}
                            transition={{ delay: 0.5, duration: 1 }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-300 w-8">{score}/10</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Key Recommendations */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-yellow-400" />
                Key Recommendations
              </h3>
              <div className="space-y-4">
                {result.recommendations.immediate.slice(0, 3).map((recommendation, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-1">{recommendation}</h4>
                      <p className="text-sm text-gray-400">
                        Immediate priority recommendation
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Strategic Insights */}
            <div className="space-y-4">
              {result.recommendations.shortTerm.slice(0, 3).map((recommendation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-white">Strategic Recommendation</h3>
                      <p className="text-sm text-gray-400">{recommendation}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'roadmap' && (
          <motion.div
            key="roadmap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Roadmap Items */}
            <div className="space-y-4">
              {result.roadmap.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                      {item.phase}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-2">{item.name}</h3>
                      <p className="text-gray-400 mb-2">{item.description}</p>
                      <span className="text-sm text-blue-400 bg-blue-500/20 px-2 py-1 rounded">
                        {item.duration}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}