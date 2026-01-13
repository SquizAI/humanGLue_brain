'use client'

import { motion } from 'framer-motion'
import {
  Calendar,
  Download,
  Users,
  Clock,
  Award,
  TrendingUp,
  AlertCircle,
  Zap,
  BarChart3,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { ExecutiveSummary, MaturityScore, MATURITY_LEVELS } from './types'

export interface ExecutiveSummaryHeaderProps {
  /** Organization name */
  organizationName: string
  /** Assessment date */
  assessmentDate: string
  /** Executive summary data */
  summary: ExecutiveSummary
  /** Assessment type label (e.g., "C-Suite Assessment") */
  assessmentType?: string
  /** Framework name (e.g., "LVNG.ai Framework") */
  frameworkName?: string
  /** Callback for schedule call action */
  onScheduleCall?: () => void
  /** Callback for export action */
  onExport?: () => void
  /** Whether to show action buttons */
  showActions?: boolean
  /** Custom className */
  className?: string
}

interface StatCardProps {
  label: string
  value: string | number
  sublabel?: string
  icon: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'critical'
}

function StatCard({ label, value, sublabel, icon, variant = 'default' }: StatCardProps) {
  const variantClasses = {
    default: 'bg-white/5 border-white/10',
    success: 'bg-green-500/10 border-green-500/20',
    warning: 'bg-yellow-500/10 border-yellow-500/20',
    critical: 'bg-red-500/10 border-red-500/20',
  }

  const textClasses = {
    default: 'text-white',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    critical: 'text-red-400',
  }

  return (
    <div className={cn(
      'rounded-xl p-4 border',
      variantClasses[variant]
    )}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-xs text-gray-400 uppercase tracking-wider font-diatype">
          {label}
        </p>
      </div>
      <p className={cn(
        'text-lg font-semibold font-gendy',
        textClasses[variant]
      )}>
        {value}
      </p>
      {sublabel && (
        <p className="text-xs text-gray-500 font-diatype mt-1">{sublabel}</p>
      )}
    </div>
  )
}

export function ExecutiveSummaryHeader({
  organizationName,
  assessmentDate,
  summary,
  assessmentType = 'AI Maturity Assessment',
  frameworkName = 'LVNG.ai Framework',
  onScheduleCall,
  onExport,
  showActions = true,
  className,
}: ExecutiveSummaryHeaderProps) {
  const levelName = MATURITY_LEVELS[summary.maturityLevel] || summary.maturityName
  const targetLevelName = summary.targetLevel
    ? MATURITY_LEVELS[summary.targetLevel]
    : undefined

  // Calculate interview hours
  const interviewHours = Math.round((summary.totalInterviewMinutes / 60) * 10) / 10

  return (
    <div className={cn('space-y-6', className)}>
      {/* Main Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20"
            >
              <span className="text-xs text-cyan-300 font-diatype">
                {assessmentType}
              </span>
            </motion.div>
            <span className="text-xs text-gray-500 font-diatype">
              {assessmentDate}
            </span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl font-bold text-white font-gendy"
          >
            {organizationName} AI Maturity Assessment
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 font-diatype text-sm mt-1"
          >
            Based on {summary.interviewCount} interviews ({interviewHours} hours) | {frameworkName}
          </motion.p>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3"
          >
            {onScheduleCall && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onScheduleCall}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold inline-flex items-center gap-2 font-diatype text-sm"
              >
                <Calendar className="w-4 h-4" />
                Schedule Call
              </motion.button>
            )}
            {onExport && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onExport}
                className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl font-semibold inline-flex items-center gap-2 font-diatype text-sm hover:border-cyan-500/30"
              >
                <Download className="w-4 h-4" />
                Export
              </motion.button>
            )}
          </motion.div>
        )}
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Overall Score */}
        <StatCard
          label="Overall Score"
          value={`${summary.overallScore.toFixed(1)}/10`}
          sublabel={`Level ${summary.maturityLevel}: ${levelName}`}
          icon={<BarChart3 className="w-4 h-4 text-cyan-400" />}
          variant={summary.overallScore >= 4 ? 'success' : summary.overallScore >= 2 ? 'warning' : 'critical'}
        />

        {/* Confidence Level */}
        <StatCard
          label="Confidence"
          value={`${summary.confidenceLevel}%`}
          sublabel="Assessment reliability"
          icon={<Award className="w-4 h-4 text-purple-400" />}
          variant={summary.confidenceLevel >= 80 ? 'success' : 'warning'}
        />

        {/* Interview Count */}
        <StatCard
          label="Interviews"
          value={summary.interviewCount}
          sublabel={`${interviewHours} hours total`}
          icon={<Users className="w-4 h-4 text-blue-400" />}
        />

        {/* Champions Identified */}
        <StatCard
          label="Champions"
          value={summary.championsIdentified}
          sublabel="AI advocates identified"
          icon={<Zap className="w-4 h-4 text-yellow-400" />}
          variant={summary.championsIdentified > 0 ? 'success' : 'warning'}
        />

        {/* Target Level */}
        {targetLevelName && (
          <StatCard
            label="Target (12mo)"
            value={`Level ${summary.targetLevel}`}
            sublabel={targetLevelName}
            icon={<TrendingUp className="w-4 h-4 text-green-400" />}
            variant="success"
          />
        )}

        {/* Critical Gaps */}
        <StatCard
          label="Critical Gaps"
          value={summary.criticalGaps.length}
          sublabel="Needs attention"
          icon={<AlertCircle className="w-4 h-4 text-red-400" />}
          variant={summary.criticalGaps.length > 0 ? 'critical' : 'success'}
        />
      </div>

      {/* Quick Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Critical Gaps */}
        {summary.criticalGaps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-red-500/5 rounded-xl p-4 border border-red-500/20"
          >
            <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3 font-diatype flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Critical Gaps
            </h3>
            <ul className="space-y-1">
              {summary.criticalGaps.slice(0, 3).map((gap, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-gray-300 font-diatype"
                >
                  <span className="text-red-400">-</span>
                  {gap}
                </li>
              ))}
              {summary.criticalGaps.length > 3 && (
                <li className="text-xs text-gray-500 font-diatype">
                  +{summary.criticalGaps.length - 3} more gaps identified
                </li>
              )}
            </ul>
          </motion.div>
        )}

        {/* Quick Wins */}
        {summary.quickWins.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-green-500/5 rounded-xl p-4 border border-green-500/20"
          >
            <h3 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-3 font-diatype flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Quick Wins
            </h3>
            <ul className="space-y-1">
              {summary.quickWins.slice(0, 3).map((win, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-gray-300 font-diatype"
                >
                  <span className="text-green-400">+</span>
                  {win}
                </li>
              ))}
              {summary.quickWins.length > 3 && (
                <li className="text-xs text-gray-500 font-diatype">
                  +{summary.quickWins.length - 3} more opportunities
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </div>

      {/* Benchmark Comparisons (if available) */}
      {summary.benchmarks && summary.benchmarks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/5 rounded-xl p-4 border border-white/10"
        >
          <h3 className="text-sm font-semibold text-white font-diatype mb-4 flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-cyan-400" />
            Industry Benchmarks
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {summary.benchmarks.map((benchmark, idx) => (
              <div key={idx} className="text-center">
                <p className="text-xs text-gray-400 font-diatype mb-1">
                  {benchmark.metric}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className={cn(
                    'text-lg font-bold font-gendy',
                    benchmark.orgValue >= benchmark.industryBenchmark
                      ? 'text-green-400'
                      : 'text-yellow-400'
                  )}>
                    {benchmark.orgValue.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500 font-diatype">
                    vs {benchmark.industryBenchmark.toFixed(1)}
                  </span>
                </div>
                {benchmark.percentile && (
                  <p className="text-[10px] text-gray-500 font-diatype mt-0.5">
                    {benchmark.percentile}th percentile
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default ExecutiveSummaryHeader
