'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  PlayCircle,
  BarChart3,
  Clock,
  Mail,
  Save,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'

interface Report {
  id: string
  name: string
  description: string
  icon: any
  color: string
  metrics: string[]
}

const reportTemplates: Report[] = [
  {
    id: 'revenue',
    name: 'Revenue Report',
    description: 'Financial performance and revenue analytics',
    icon: DollarSign,
    color: 'green',
    metrics: ['Total Revenue', 'MRR', 'Growth Rate', 'Revenue by Service'],
  },
  {
    id: 'engagement',
    name: 'User Engagement',
    description: 'User activity and engagement metrics',
    icon: Users,
    color: 'blue',
    metrics: ['Active Users', 'Session Duration', 'Retention Rate', 'User Activity'],
  },
  {
    id: 'course-performance',
    name: 'Course Performance',
    description: 'Course enrollments and completion rates',
    icon: PlayCircle,
    color: 'purple',
    metrics: ['Enrollments', 'Completion Rate', 'Student Feedback', 'Top Courses'],
  },
  {
    id: 'assessment-results',
    name: 'Assessment Results',
    description: 'Skills assessment scores and insights',
    icon: BarChart3,
    color: 'amber',
    metrics: ['Average Scores', 'Pass Rate', 'Skill Gaps', 'Progress Tracking'],
  },
  {
    id: 'workshop-attendance',
    name: 'Workshop Attendance',
    description: 'Workshop participation and feedback',
    icon: Calendar,
    color: 'cyan',
    metrics: ['Attendance Rate', 'Feedback Scores', 'Popular Topics', 'Instructor Ratings'],
  },
]

export default function ReportsAdmin() {
  const router = useRouter()
  const { userData, authLoading } = useChat()
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState('30days')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (!authLoading && userData?.isAdmin) {
      setShowContent(true)
      return
    }

    const timeout = setTimeout(() => {
      console.log('[ReportsAdmin] Auth timeout - trusting middleware protection')
      setShowContent(true)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [authLoading, userData])

  if (!showContent) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  const handleGenerateReport = () => {
    console.log('Generating report:', selectedReport, dateRange)
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/admin" className="text-gray-400 hover:text-white transition-colors mb-2 inline-block">
                  <span className="font-diatype">← Back to Dashboard</span>
                </Link>
                <h1 className="text-3xl font-bold text-white mb-2 font-gendy">Reports & Analytics</h1>
                <p className="text-gray-400 font-diatype">
                  Generate insights and export data reports
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Report Templates */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 font-gendy">Report Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reportTemplates.map((report, index) => {
                const Icon = report.icon
                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedReport(report.id)}
                    className={`bg-white/5 backdrop-blur-xl border rounded-2xl p-6 cursor-pointer transition-all ${
                      selectedReport === report.id
                        ? `border-${report.color}-500/50 bg-${report.color}-500/10`
                        : 'border-white/10 hover:border-purple-500/30'
                    }`}
                  >
                    <div className={`p-3 bg-${report.color}-500/20 rounded-xl inline-flex mb-4`}>
                      <Icon className={`w-6 h-6 text-${report.color}-400`} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 font-gendy">{report.name}</h3>
                    <p className="text-sm text-gray-400 mb-4 font-diatype">{report.description}</p>
                    <div className="space-y-1">
                      {report.metrics.map((metric) => (
                        <div key={metric} className="flex items-center gap-2 text-xs text-gray-500">
                          <div className={`w-1.5 h-1.5 rounded-full bg-${report.color}-400`} />
                          <span className="font-diatype">{metric}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Report Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 font-gendy">Report Configuration</h2>

              <div className="space-y-6">
                {/* Date Range */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-3 font-diatype">
                    Date Range
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['7days', '30days', '90days', 'custom'].map((range) => (
                      <button
                        key={range}
                        onClick={() => setDateRange(range)}
                        className={`px-4 py-3 rounded-xl transition-all font-diatype ${
                          dateRange === range
                            ? 'bg-purple-500/20 border-2 border-purple-500/50 text-purple-300'
                            : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {range === '7days'
                          ? 'Last 7 Days'
                          : range === '30days'
                          ? 'Last 30 Days'
                          : range === '90days'
                          ? 'Last 90 Days'
                          : 'Custom'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Date Range */}
                {dateRange === 'custom' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-diatype"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-diatype"
                      />
                    </div>
                  </div>
                )}

                {/* Export Format */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-3 font-diatype">
                    Export Format
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['CSV', 'PDF', 'Excel'].map((format) => (
                      <button
                        key={format}
                        className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:bg-white/10 hover:text-white transition-all font-diatype"
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerateReport}
                    disabled={!selectedReport}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl transition-all font-semibold flex items-center justify-center gap-2 font-diatype disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-5 h-5" />
                    Generate Report
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Scheduled Reports */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 font-gendy">Scheduled Reports</h2>
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-5 h-5 text-blue-400" />
                    <h3 className="text-white font-semibold font-diatype">Weekly Revenue</h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-2 font-diatype">Every Monday at 9:00 AM</p>
                  <span className="text-xs text-green-400 font-diatype">Active</span>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-5 h-5 text-purple-400" />
                    <h3 className="text-white font-semibold font-diatype">Monthly Summary</h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-2 font-diatype">1st of each month</p>
                  <span className="text-xs text-green-400 font-diatype">Active</span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-xl transition-all flex items-center justify-center gap-2 font-diatype"
                >
                  <Clock className="w-5 h-5" />
                  Schedule New Report
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
