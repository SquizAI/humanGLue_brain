'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  PlayCircle,
  Users,
  Calendar,
  ClipboardList,
  BookOpen,
  TrendingUp,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Play,
  Pause,
  Settings,
  ArrowRight,
  BarChart3,
  FileText,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner'
import { signOut } from '@/lib/auth/hooks'

// Service status types
type ServiceStatus = 'active' | 'scheduled' | 'draft' | 'completed' | 'archived'

interface ServiceMetrics {
  total: number
  active: number
  scheduled: number
  draft: number
  completed: number
  archived: number
}

export default function ServicesOverview() {
  const router = useRouter()
  const { userData, authLoading } = useChat()
  const [showContent, setShowContent] = useState(false)

  // Service metrics
  const [courseMetrics] = useState<ServiceMetrics>({
    total: 24,
    active: 18,
    scheduled: 3,
    draft: 3,
    completed: 0,
    archived: 0,
  })

  const [workshopMetrics] = useState<ServiceMetrics>({
    total: 15,
    active: 5,
    scheduled: 8,
    draft: 2,
    completed: 12,
    archived: 3,
  })

  const [consultationMetrics] = useState({
    total: 48,
    scheduled: 12,
    completed: 32,
    canceled: 4,
  })

  const [assessmentMetrics] = useState({
    total: 8,
    active: 5,
    archived: 3,
  })

  const [contentMetrics] = useState({
    total: 156,
    published: 142,
    pending: 14,
  })

  // Recent service activity
  const [recentActivity] = useState([
    {
      id: 1,
      type: 'course',
      action: 'Course published',
      title: 'AI Ethics & Governance',
      user: 'Admin',
      time: '5 min ago',
      status: 'success',
    },
    {
      id: 2,
      type: 'workshop',
      action: 'Workshop scheduled',
      title: 'Change Management Workshop',
      user: 'Sarah Chen',
      time: '15 min ago',
      status: 'info',
    },
    {
      id: 3,
      type: 'consultation',
      action: 'Consultation completed',
      title: 'Strategy Session with Tech Corp',
      user: 'Dr. Wilson',
      time: '1 hour ago',
      status: 'success',
    },
    {
      id: 4,
      type: 'assessment',
      action: 'Assessment assigned',
      title: 'Leadership Assessment',
      user: 'Jennifer Wu',
      time: '2 hours ago',
      status: 'info',
    },
    {
      id: 5,
      type: 'content',
      action: 'Content uploaded',
      title: 'Q3 AI Trends Report',
      user: 'Admin',
      time: '3 hours ago',
      status: 'success',
    },
  ])

  // System health
  const [systemHealth] = useState({
    status: 'operational',
    uptime: 99.9,
    activeUsers: 142,
    apiCalls: 15234,
  })

  useEffect(() => {
    if (!authLoading && userData?.isAdmin) {
      setShowContent(true)
      return
    }

    const timeout = setTimeout(() => {
      console.log('[ServicesOverview] Auth timeout - trusting middleware protection')
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
          <LoadingSpinner variant="neural" size="xl" text="Loading services..." />
        </div>
      </div>
    )
  }

  const serviceCards = [
    {
      title: 'Courses',
      icon: PlayCircle,
      color: 'cyan',
      metrics: courseMetrics,
      href: '/admin/courses',
      description: 'Manage learning content',
    },
    {
      title: 'Workshops',
      icon: Calendar,
      color: 'blue',
      metrics: workshopMetrics,
      href: '/admin/workshops',
      description: 'Live training sessions',
    },
    {
      title: 'Consultations',
      icon: Users,
      color: 'green',
      metrics: consultationMetrics,
      href: '/admin/consultations',
      description: 'Expert consultations',
    },
    {
      title: 'Assessments',
      icon: ClipboardList,
      color: 'amber',
      metrics: assessmentMetrics,
      href: '/admin/assessments',
      description: 'Skills evaluation',
    },
    {
      title: 'Content Library',
      icon: BookOpen,
      color: 'cyan',
      metrics: contentMetrics,
      href: '/admin/content',
      description: 'Resources & materials',
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30'
      case 'info':
        return 'text-[var(--hg-cyan-text)] bg-blue-500/20 border-blue-500/30'
      case 'warning':
        return 'text-amber-400 bg-amber-500/20 border-amber-500/30'
      case 'error':
        return 'text-red-400 bg-red-500/20 border-red-500/30'
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course':
        return PlayCircle
      case 'workshop':
        return Calendar
      case 'consultation':
        return Users
      case 'assessment':
        return ClipboardList
      case 'content':
        return BookOpen
      default:
        return Activity
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--hg-bg-primary)' }}>
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        {/* Header */}
        <div className="border-b sticky top-0 z-30" style={{ backgroundColor: 'var(--hg-bg-sidebar)', borderColor: 'var(--hg-border-color)' }}>
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Link href="/admin" className="text-sm hover:underline" style={{ color: 'var(--hg-text-muted)' }}>
                    <span className="font-diatype">← Back to Dashboard</span>
                  </Link>
                </div>
                <h1 className="text-3xl font-bold mb-2 font-gendy" style={{ color: 'var(--hg-text-primary)' }}>Service Management</h1>
                <p className="font-diatype" style={{ color: 'var(--hg-text-muted)' }}>
                  Monitor and manage all platform services
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`px-4 py-2 rounded-lg border ${
                    systemHealth.status === 'operational'
                      ? 'bg-emerald-500/10 border-emerald-500/20'
                      : 'bg-red-500/10 border-red-500/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        systemHealth.status === 'operational' ? 'bg-emerald-400' : 'bg-red-400'
                      } animate-pulse`}
                    />
                    <span
                      className={`text-sm font-diatype ${
                        systemHealth.status === 'operational' ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {systemHealth.status === 'operational' ? 'All Systems Operational' : 'System Issues'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* System Health */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-2xl p-6 transition-all hover:border-[var(--hg-cyan-border)]"
              style={{ backgroundColor: 'var(--hg-bg-card)', borderColor: 'var(--hg-border-color)', boxShadow: 'var(--hg-shadow)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-6 h-6" style={{ color: 'var(--hg-cyan-text)' }} />
                <span className="text-sm font-diatype" style={{ color: 'var(--hg-cyan-text)' }}>{systemHealth.uptime}%</span>
              </div>
              <h3 className="text-2xl font-bold mb-1 font-gendy" style={{ color: 'var(--hg-text-primary)' }}>Uptime</h3>
              <p className="text-sm font-diatype" style={{ color: 'var(--hg-text-muted)' }}>Last 30 days</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="border rounded-2xl p-6 transition-all hover:border-[var(--hg-cyan-border)]"
              style={{ backgroundColor: 'var(--hg-bg-card)', borderColor: 'var(--hg-border-color)', boxShadow: 'var(--hg-shadow)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <Users className="w-6 h-6" style={{ color: 'var(--hg-cyan-text)' }} />
                <Activity className="w-5 h-5" style={{ color: 'var(--hg-cyan-text)' }} />
              </div>
              <h3 className="text-2xl font-bold mb-1 font-gendy" style={{ color: 'var(--hg-text-primary)' }}>
                {systemHealth.activeUsers}
              </h3>
              <p className="text-sm font-diatype" style={{ color: 'var(--hg-text-muted)' }}>Active users</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="border rounded-2xl p-6 transition-all hover:border-[var(--hg-cyan-border)]"
              style={{ backgroundColor: 'var(--hg-bg-card)', borderColor: 'var(--hg-border-color)', boxShadow: 'var(--hg-shadow)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-6 h-6" style={{ color: 'var(--hg-cyan-text)' }} />
                <TrendingUp className="w-5 h-5" style={{ color: 'var(--hg-cyan-text)' }} />
              </div>
              <h3 className="text-2xl font-bold mb-1 font-gendy" style={{ color: 'var(--hg-text-primary)' }}>
                {systemHealth.apiCalls.toLocaleString()}
              </h3>
              <p className="text-sm font-diatype" style={{ color: 'var(--hg-text-muted)' }}>API calls today</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="border rounded-2xl p-6 transition-all hover:border-[var(--hg-cyan-border)]"
              style={{ backgroundColor: 'var(--hg-bg-card)', borderColor: 'var(--hg-border-color)', boxShadow: 'var(--hg-shadow)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-6 h-6 text-amber-400" />
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold mb-1 font-gendy" style={{ color: 'var(--hg-text-primary)' }}>98.5%</h3>
              <p className="text-sm font-diatype" style={{ color: 'var(--hg-text-muted)' }}>Service availability</p>
            </motion.div>
          </div>

          {/* Service Cards */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 font-gendy" style={{ color: 'var(--hg-text-primary)' }}>Services Overview</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {serviceCards.map((service, index) => {
                const Icon = service.icon
                const metrics = service.metrics as any
                return (
                  <motion.div
                    key={service.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-2xl p-6 hover:border-[var(--hg-cyan-border)] transition-all group"
                    style={{ backgroundColor: 'var(--hg-bg-card)', borderColor: 'var(--hg-border-color)' }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--hg-cyan-bg)' }}>
                        <Icon className="w-6 h-6" style={{ color: 'var(--hg-cyan-text)' }} />
                      </div>
                      <Link href={service.href}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 rounded-lg transition-all"
                          style={{ backgroundColor: 'var(--hg-bg-secondary)' }}
                        >
                          <Settings className="w-5 h-5" style={{ color: 'var(--hg-text-muted)' }} />
                        </motion.button>
                      </Link>
                    </div>

                    <h3 className="text-xl font-bold mb-1 font-gendy" style={{ color: 'var(--hg-text-primary)' }}>
                      {service.title}
                    </h3>
                    <p className="text-sm mb-4 font-diatype" style={{ color: 'var(--hg-text-muted)' }}>
                      {service.description}
                    </p>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {metrics.total && (
                        <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--hg-bg-secondary)' }}>
                          <p className="text-2xl font-bold mb-1 font-gendy" style={{ color: 'var(--hg-text-primary)' }}>
                            {metrics.total}
                          </p>
                          <p className="text-xs font-diatype" style={{ color: 'var(--hg-text-muted)' }}>Total</p>
                        </div>
                      )}
                      {metrics.active !== undefined && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                          <p className="text-2xl font-bold text-emerald-400 mb-1 font-gendy">
                            {metrics.active}
                          </p>
                          <p className="text-xs text-emerald-400 font-diatype">Active</p>
                        </div>
                      )}
                      {metrics.scheduled !== undefined && (
                        <div className="rounded-lg p-3 border" style={{ backgroundColor: 'var(--hg-cyan-bg)', borderColor: 'var(--hg-cyan-border)' }}>
                          <p className="text-2xl font-bold mb-1 font-gendy" style={{ color: 'var(--hg-cyan-text)' }}>
                            {metrics.scheduled}
                          </p>
                          <p className="text-xs font-diatype" style={{ color: 'var(--hg-cyan-text)' }}>Scheduled</p>
                        </div>
                      )}
                      {metrics.published !== undefined && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                          <p className="text-2xl font-bold text-emerald-400 mb-1 font-gendy">
                            {metrics.published}
                          </p>
                          <p className="text-xs text-emerald-400 font-diatype">Published</p>
                        </div>
                      )}
                      {metrics.draft !== undefined && metrics.draft > 0 && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                          <p className="text-2xl font-bold text-amber-400 mb-1 font-gendy">
                            {metrics.draft}
                          </p>
                          <p className="text-xs text-amber-400 font-diatype">Draft</p>
                        </div>
                      )}
                      {metrics.pending !== undefined && metrics.pending > 0 && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                          <p className="text-2xl font-bold text-amber-400 mb-1 font-gendy">
                            {metrics.pending}
                          </p>
                          <p className="text-xs text-amber-400 font-diatype">Pending</p>
                        </div>
                      )}
                    </div>

                    <Link href={service.href}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full px-4 py-3 rounded-lg transition-all flex items-center justify-center gap-2 font-diatype border"
                        style={{ backgroundColor: 'var(--hg-cyan-bg)', borderColor: 'var(--hg-cyan-border)', color: 'var(--hg-cyan-text)' }}
                      >
                        <span>Manage {service.title}</span>
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2 border rounded-2xl p-6" style={{ backgroundColor: 'var(--hg-bg-card)', borderColor: 'var(--hg-border-color)' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold font-gendy" style={{ color: 'var(--hg-text-primary)' }}>Recent Activity</h2>
                <Link
                  href="/admin/activity"
                  className="text-sm hover:underline transition-colors font-diatype"
                  style={{ color: 'var(--hg-cyan-text)' }}
                >
                  View all
                </Link>
              </div>

              <div className="space-y-3">
                {recentActivity.map((activity) => {
                  const Icon = getTypeIcon(activity.type)
                  return (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 p-4 rounded-xl transition-all"
                      style={{ backgroundColor: 'var(--hg-bg-secondary)' }}
                    >
                      <div className={`p-2 rounded-lg border ${getStatusColor(activity.status)}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium font-diatype" style={{ color: 'var(--hg-text-primary)' }}>{activity.action}</p>
                        <p className="text-sm font-diatype truncate" style={{ color: 'var(--hg-text-muted)' }}>
                          {activity.title}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-diatype" style={{ color: 'var(--hg-text-muted)' }}>{activity.time}</p>
                        <p className="text-xs font-diatype" style={{ color: 'var(--hg-text-secondary)' }}>{activity.user}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border rounded-2xl p-6" style={{ backgroundColor: 'var(--hg-bg-card)', borderColor: 'var(--hg-border-color)' }}>
              <h2 className="text-xl font-bold mb-6 font-gendy" style={{ color: 'var(--hg-text-primary)' }}>Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/admin/courses">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-4 py-3 rounded-lg transition-all flex items-center gap-3 font-diatype border"
                    style={{ backgroundColor: 'var(--hg-cyan-bg)', borderColor: 'var(--hg-cyan-border)', color: 'var(--hg-cyan-text)' }}
                  >
                    <PlayCircle className="w-5 h-5" />
                    <span>Create Course</span>
                  </motion.button>
                </Link>

                <Link href="/admin/workshops">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-4 py-3 rounded-lg transition-all flex items-center gap-3 font-diatype border"
                    style={{ backgroundColor: 'var(--hg-cyan-bg)', borderColor: 'var(--hg-cyan-border)', color: 'var(--hg-cyan-text)' }}
                  >
                    <Calendar className="w-5 h-5" />
                    <span>Schedule Workshop</span>
                  </motion.button>
                </Link>

                <Link href="/admin/users">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-4 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 rounded-lg transition-all flex items-center gap-3 font-diatype"
                  >
                    <Users className="w-5 h-5" />
                    <span>Invite User</span>
                  </motion.button>
                </Link>

                <Link href="/admin/reports">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-4 py-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 rounded-lg transition-all flex items-center gap-3 font-diatype"
                  >
                    <FileText className="w-5 h-5" />
                    <span>Generate Report</span>
                  </motion.button>
                </Link>

                <Link href="/admin/settings">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-4 py-3 rounded-lg transition-all flex items-center gap-3 font-diatype border"
                    style={{ backgroundColor: 'var(--hg-bg-secondary)', borderColor: 'var(--hg-border-color)', color: 'var(--hg-text-secondary)' }}
                  >
                    <Settings className="w-5 h-5" />
                    <span>System Settings</span>
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
