'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  X,
  Check,
  RefreshCw,
  Mail,
  Eye,
  BarChart3,
  TrendingUp,
  Clock,
  AlertCircle,
  Wand2,
  ArrowRight,
  Download,
  Send,
  CheckCircle,
  FileText,
  Sparkles,
} from 'lucide-react'

// =============================================================================
// TOAST NOTIFICATION
// =============================================================================

export function Toast({ message, type = 'success', onClose }: {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  const colors = {
    success: 'bg-green-500/20 border-green-500/30 text-green-400',
    error: 'bg-red-500/20 border-red-500/30 text-red-400',
    info: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
  }

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Sparkles className="w-5 h-5" />,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl ${colors[type]}`}
    >
      {icons[type]}
      <p className="font-medium">{message}</p>
      <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

// =============================================================================
// NEWSLETTER PREVIEW MODAL
// =============================================================================

export function NewsletterPreviewModal({ content, onClose, onUse, onRegenerate }: {
  content: any
  onClose: () => void
  onUse: () => void
  onRegenerate: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-white/10 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI-Generated Newsletter</h2>
              <p className="text-sm text-gray-400">Tailored for Healthcare Segment</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-all">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Subject Line */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <label className="text-xs text-cyan-400 uppercase tracking-wide font-semibold flex items-center gap-2">
              <Mail className="w-3 h-3" />
              Subject Line
            </label>
            <p className="text-white font-semibold text-lg mt-2">{content.subject}</p>
          </div>

          {/* Preview Text */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <label className="text-xs text-cyan-400 uppercase tracking-wide font-semibold flex items-center gap-2">
              <Eye className="w-3 h-3" />
              Preview Text
            </label>
            <p className="text-gray-300 mt-2">{content.preview}</p>
          </div>

          {/* Newsletter Content */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
            <h3 className="text-2xl font-bold text-white border-b border-white/10 pb-4">
              {content.title}
            </h3>

            {content.sections.map((section: any, idx: number) => (
              <div key={idx} className="space-y-2">
                <h4 className="text-lg font-semibold text-cyan-400">{section.heading}</h4>
                <p className="text-gray-300 leading-relaxed">{section.content}</p>
              </div>
            ))}

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <button className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all">
                {content.callToAction}
              </button>
            </div>
          </div>

          {/* Estimated Performance */}
          <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl p-4">
            <label className="text-xs text-cyan-400 uppercase tracking-wide font-semibold flex items-center gap-2 mb-3">
              <BarChart3 className="w-3 h-3" />
              Estimated Performance
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-cyan-400">{content.estimatedEngagement.openRate}</p>
                <p className="text-xs text-gray-400">Open Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">{content.estimatedEngagement.clickRate}</p>
                <p className="text-xs text-gray-400">Click Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">{content.estimatedEngagement.expectedConversions}</p>
                <p className="text-xs text-gray-400">Expected Conversions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-gray-900 border-t border-white/10 p-4 flex gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all"
          >
            Dismiss
          </button>
          <button
            onClick={onRegenerate}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </button>
          <button
            onClick={onUse}
            className="flex-1 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Use This Content
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// =============================================================================
// ANALYSIS MODAL
// =============================================================================

export function AnalysisModal({ content, onClose, onUse }: {
  content: any
  onClose: () => void
  onUse: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-white/10 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg">
              <BarChart3 className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Segment Analysis & Recommendations</h2>
              <p className="text-sm text-gray-400">{content.segment}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-all">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Performance */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              Current Performance Metrics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/20 rounded-lg p-4">
                <p className="text-sm text-gray-400">Open Rate</p>
                <p className="text-3xl font-bold text-amber-400 mt-1">{content.currentMetrics.openRate}%</p>
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 rotate-90" />
                  {content.currentMetrics.changePercent}% vs last month
                </p>
              </div>
              <div className="bg-black/20 rounded-lg p-4">
                <p className="text-sm text-gray-400">Click Rate</p>
                <p className="text-3xl font-bold text-amber-400 mt-1">{content.currentMetrics.clickRate}%</p>
                <p className="text-xs text-gray-500 mt-1">Below industry average (18%)</p>
              </div>
            </div>
          </div>

          {/* Root Causes */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              Identified Issues
            </h3>
            {content.rootCauses.map((cause: any, idx: number) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-white">{cause.issue}</h4>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    cause.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                    cause.impact === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {cause.impact.toUpperCase()} IMPACT
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-2">{cause.description}</p>
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3 mt-3">
                  <p className="text-xs text-cyan-400 font-semibold mb-1">RECOMMENDED SOLUTION:</p>
                  <p className="text-sm text-gray-300">{cause.solution}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-cyan-400" />
              AI-Powered Recommendations
            </h3>
            {content.recommendations.map((rec: any, idx: number) => (
              <div key={idx} className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-white">{rec.action}</h4>
                    <p className="text-sm text-gray-400 mt-1">{rec.details}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                    rec.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                    rec.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {rec.priority.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Impact: <span className="text-green-400 font-semibold">{rec.expectedImpact}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span className="text-gray-300">Effort: <span className="text-cyan-400 font-semibold">{rec.effort}</span></span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Benchmark */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Industry Benchmark</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase">Current</p>
                <p className="text-2xl font-bold text-amber-400 mt-1">{content.currentMetrics.openRate}%</p>
                <p className="text-xs text-gray-500">Open Rate</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase">Industry Avg</p>
                <p className="text-2xl font-bold text-gray-300 mt-1">{content.competitorBenchmark.industryAverage.openRate}%</p>
                <p className="text-xs text-gray-500">Open Rate</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase">Top Performer</p>
                <p className="text-2xl font-bold text-green-400 mt-1">{content.competitorBenchmark.topPerformer.openRate}%</p>
                <p className="text-xs text-gray-500">Open Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-gray-900 border-t border-white/10 p-4 flex gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all"
          >
            Dismiss
          </button>
          <button
            onClick={onUse}
            className="flex-1 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Implement Recommendations
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// =============================================================================
// REPORTS MODAL
// =============================================================================

export function ReportsModal({ reports, onClose, onDownload }: {
  reports: any[]
  onClose: () => void
  onDownload: (reportId: string) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 border border-white/10 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-white/10 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg">
              <FileText className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Generated Organization Reports</h2>
              <p className="text-sm text-gray-400">{reports.length} reports ready for review</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-all">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Reports List */}
        <div className="p-6 space-y-4">
          {reports.map((report: any, idx: number) => (
            <motion.div
              key={report.organizationId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-cyan-500/30 transition-all"
            >
              {/* Report Header */}
              <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{report.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{report.reportTitle}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    READY
                  </span>
                </div>
              </div>

              {/* Report Content */}
              <div className="p-4 space-y-4">
                {/* Summary */}
                <div>
                  <p className="text-gray-300">{report.summary}</p>
                </div>

                {/* Highlights */}
                <div>
                  <h4 className="text-sm font-semibold text-cyan-400 mb-2">Key Highlights</h4>
                  <ul className="space-y-1">
                    {report.highlights.map((highlight: string, i: number) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="text-sm font-semibold text-purple-400 mb-2">Recommendations</h4>
                  <ul className="space-y-1">
                    {report.recommendations.map((rec: string, i: number) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-white/10">
                  <button
                    onClick={() => onDownload(report.organizationId)}
                    className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                  <button className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm font-medium">
                    <Mail className="w-4 h-4" />
                    Send to Client
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-900 border-t border-white/10 p-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all"
          >
            Close
          </button>
          <button className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all flex items-center gap-2">
            <Send className="w-4 h-4" />
            Send All Reports
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
