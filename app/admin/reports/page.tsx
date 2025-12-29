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
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner'
import { signOut } from '@/lib/auth/hooks'

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
    color: 'cyan',
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      await signOut()
      localStorage.removeItem('humanglue_user')
      localStorage.removeItem('demoUser')
      document.cookie = 'demoUser=; path=/; max-age=0'
      localStorage.removeItem('sb-egqqdscvxvtwcdwknbnt-auth-token')
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      window.location.href = '/login'
    }
  }

  if (!showContent) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--hg-bg-primary)' }}>
        <DashboardSidebar onLogout={handleLogout} />
        <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 flex items-center justify-center min-h-screen">
          <LoadingSpinner variant="neural" size="xl" text="Loading reports..." />
        </div>
      </div>
    )
  }

  const handleGenerateReport = () => {
    console.log('Generating report:', selectedReport, dateRange)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--hg-bg-primary)' }}>
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        <div className="border-b sticky top-0 z-30" style={{ backgroundColor: 'var(--hg-bg-sidebar)', borderColor: 'var(--hg-border-color)' }}>
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/admin" className="text-sm hover:underline mb-2 inline-block" style={{ color: 'var(--hg-text-muted)' }}>
                  <span className="font-diatype">← Back to Dashboard</span>
                </Link>
                <h1 className="text-3xl font-bold mb-2 font-gendy" style={{ color: 'var(--hg-text-primary)' }}>Reports & Analytics</h1>
                <p className="font-diatype" style={{ color: 'var(--hg-text-muted)' }}>
                  Generate insights and export data reports
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Report Templates */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 font-gendy" style={{ color: 'var(--hg-text-primary)' }}>Report Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reportTemplates.map((report, index) => {
                const Icon = report.icon
                const isSelected = selectedReport === report.id
                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedReport(report.id)}
                    className={`border rounded-2xl p-6 cursor-pointer transition-all hover:border-[var(--hg-cyan-border)] ${
                      isSelected ? 'border-[var(--hg-cyan-border)]' : ''
                    }`}
                    style={{
                      backgroundColor: isSelected ? 'var(--hg-cyan-bg)' : 'var(--hg-bg-card)',
                      borderColor: isSelected ? 'var(--hg-cyan-border)' : 'var(--hg-border-color)'
                    }}
                  >
                    <div className="p-3 rounded-xl inline-flex mb-4" style={{ backgroundColor: 'var(--hg-cyan-bg)' }}>
                      <Icon className="w-6 h-6" style={{ color: 'var(--hg-cyan-text)' }} />
                    </div>
                    <h3 className="text-lg font-bold mb-2 font-gendy" style={{ color: 'var(--hg-text-primary)' }}>{report.name}</h3>
                    <p className="text-sm mb-4 font-diatype" style={{ color: 'var(--hg-text-muted)' }}>{report.description}</p>
                    <div className="space-y-1">
                      {report.metrics.map((metric) => (
                        <div key={metric} className="flex items-center gap-2 text-xs" style={{ color: 'var(--hg-text-muted)' }}>
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--hg-cyan-text)' }} />
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
            <div className="lg:col-span-2 border rounded-2xl p-6" style={{ backgroundColor: 'var(--hg-bg-card)', borderColor: 'var(--hg-border-color)' }}>
              <h2 className="text-xl font-bold mb-6 font-gendy" style={{ color: 'var(--hg-text-primary)' }}>Report Configuration</h2>

              <div className="space-y-6">
                {/* Date Range */}
                <div>
                  <label className="block text-sm font-semibold mb-3 font-diatype" style={{ color: 'var(--hg-text-primary)' }}>
                    Date Range
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['7days', '30days', '90days', 'custom'].map((range) => (
                      <button
                        key={range}
                        onClick={() => setDateRange(range)}
                        className="px-4 py-3 rounded-xl transition-all font-diatype border"
                        style={{
                          backgroundColor: dateRange === range ? 'var(--hg-cyan-bg)' : 'var(--hg-bg-secondary)',
                          borderColor: dateRange === range ? 'var(--hg-cyan-border)' : 'var(--hg-border-color)',
                          color: dateRange === range ? 'var(--hg-cyan-text)' : 'var(--hg-text-muted)'
                        }}
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
                      <label className="block text-sm font-semibold mb-2 font-diatype" style={{ color: 'var(--hg-text-primary)' }}>
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-diatype"
                        style={{
                          backgroundColor: 'var(--hg-bg-secondary)',
                          borderColor: 'var(--hg-border-color)',
                          color: 'var(--hg-text-primary)',
                          '--tw-ring-color': 'var(--hg-cyan-border)'
                        } as React.CSSProperties}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 font-diatype" style={{ color: 'var(--hg-text-primary)' }}>
                        End Date
                      </label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-diatype"
                        style={{
                          backgroundColor: 'var(--hg-bg-secondary)',
                          borderColor: 'var(--hg-border-color)',
                          color: 'var(--hg-text-primary)',
                          '--tw-ring-color': 'var(--hg-cyan-border)'
                        } as React.CSSProperties}
                      />
                    </div>
                  </div>
                )}

                {/* Export Format */}
                <div>
                  <label className="block text-sm font-semibold mb-3 font-diatype" style={{ color: 'var(--hg-text-primary)' }}>
                    Export Format
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['CSV', 'PDF', 'Excel'].map((format) => (
                      <button
                        key={format}
                        className="px-4 py-3 border rounded-xl hover:border-[var(--hg-cyan-border)] transition-all font-diatype"
                        style={{
                          backgroundColor: 'var(--hg-bg-secondary)',
                          borderColor: 'var(--hg-border-color)',
                          color: 'var(--hg-text-muted)'
                        }}
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
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl transition-all font-semibold flex items-center justify-center gap-2 font-diatype disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ boxShadow: '0 4px 14px rgba(97, 216, 254, 0.4)' }}
                  >
                    <Download className="w-5 h-5" />
                    Generate Report
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Scheduled Reports */}
            <div className="border rounded-2xl p-6" style={{ backgroundColor: 'var(--hg-bg-card)', borderColor: 'var(--hg-border-color)' }}>
              <h2 className="text-xl font-bold mb-6 font-gendy" style={{ color: 'var(--hg-text-primary)' }}>Scheduled Reports</h2>
              <div className="space-y-4">
                <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--hg-bg-secondary)' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-5 h-5" style={{ color: 'var(--hg-cyan-text)' }} />
                    <h3 className="font-semibold font-diatype" style={{ color: 'var(--hg-text-primary)' }}>Weekly Revenue</h3>
                  </div>
                  <p className="text-sm mb-2 font-diatype" style={{ color: 'var(--hg-text-muted)' }}>Every Monday at 9:00 AM</p>
                  <span className="text-xs font-diatype text-emerald-400">Active</span>
                </div>

                <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--hg-bg-secondary)' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-5 h-5" style={{ color: 'var(--hg-cyan-text)' }} />
                    <h3 className="font-semibold font-diatype" style={{ color: 'var(--hg-text-primary)' }}>Monthly Summary</h3>
                  </div>
                  <p className="text-sm mb-2 font-diatype" style={{ color: 'var(--hg-text-muted)' }}>1st of each month</p>
                  <span className="text-xs font-diatype text-emerald-400">Active</span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-diatype border"
                  style={{ backgroundColor: 'var(--hg-cyan-bg)', borderColor: 'var(--hg-cyan-border)', color: 'var(--hg-cyan-text)' }}
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
