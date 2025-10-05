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
  const { userData } = useChat()

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

  // Check admin access
  useEffect(() => {
    if (!userData?.isAdmin) {
      router.push('/login')
    }
  }, [userData, router])

  if (!userData?.isAdmin) {
    return null
  }

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  const serviceCards = [
    {
      title: 'Courses',
      icon: PlayCircle,
      color: 'purple',
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
        return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'info':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
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
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="ml-[280px] transition-all duration-300">
        {/* Header */}
        <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">
                    <span className="font-diatype">← Back to Dashboard</span>
                  </Link>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2 font-gendy">Service Management</h1>
                <p className="text-gray-400 font-diatype">
                  Monitor and manage all platform services
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`px-4 py-2 rounded-lg border ${
                    systemHealth.status === 'operational'
                      ? 'bg-green-500/10 border-green-500/20'
                      : 'bg-red-500/10 border-red-500/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        systemHealth.status === 'operational' ? 'bg-green-400' : 'bg-red-400'
                      } animate-pulse`}
                    />
                    <span
                      className={`text-sm font-diatype ${
                        systemHealth.status === 'operational' ? 'text-green-400' : 'text-red-400'
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
              className="bg-gradient-to-br from-green-900/30 to-green-900/10 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <span className="text-green-400 text-sm font-diatype">{systemHealth.uptime}%</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1 font-gendy">Uptime</h3>
              <p className="text-sm text-gray-400 font-diatype">Last 30 days</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <Users className="w-6 h-6 text-blue-400" />
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1 font-gendy">
                {systemHealth.activeUsers}
              </h3>
              <p className="text-sm text-gray-400 font-diatype">Active users</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-900/30 to-purple-900/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-6 h-6 text-purple-400" />
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1 font-gendy">
                {systemHealth.apiCalls.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-400 font-diatype">API calls today</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-amber-900/30 to-amber-900/10 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-6 h-6 text-amber-400" />
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1 font-gendy">98.5%</h3>
              <p className="text-sm text-gray-400 font-diatype">Service availability</p>
            </motion.div>
          </div>

          {/* Service Cards */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 font-gendy">Services Overview</h2>
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
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 bg-${service.color}-500/20 rounded-xl`}>
                        <Icon className={`w-6 h-6 text-${service.color}-400`} />
                      </div>
                      <Link href={service.href}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                        >
                          <Settings className="w-5 h-5 text-gray-400" />
                        </motion.button>
                      </Link>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-1 font-gendy">
                      {service.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4 font-diatype">
                      {service.description}
                    </p>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {metrics.total && (
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-2xl font-bold text-white mb-1 font-gendy">
                            {metrics.total}
                          </p>
                          <p className="text-xs text-gray-400 font-diatype">Total</p>
                        </div>
                      )}
                      {metrics.active !== undefined && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                          <p className="text-2xl font-bold text-green-400 mb-1 font-gendy">
                            {metrics.active}
                          </p>
                          <p className="text-xs text-green-400 font-diatype">Active</p>
                        </div>
                      )}
                      {metrics.scheduled !== undefined && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                          <p className="text-2xl font-bold text-blue-400 mb-1 font-gendy">
                            {metrics.scheduled}
                          </p>
                          <p className="text-xs text-blue-400 font-diatype">Scheduled</p>
                        </div>
                      )}
                      {metrics.published !== undefined && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                          <p className="text-2xl font-bold text-green-400 mb-1 font-gendy">
                            {metrics.published}
                          </p>
                          <p className="text-xs text-green-400 font-diatype">Published</p>
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
                        className={`w-full px-4 py-3 bg-${service.color}-500/20 hover:bg-${service.color}-500/30 border border-${service.color}-500/30 text-${service.color}-300 rounded-lg transition-all flex items-center justify-center gap-2 font-diatype`}
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
            <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white font-gendy">Recent Activity</h2>
                <Link
                  href="/admin/activity"
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors font-diatype"
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
                      className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                    >
                      <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium font-diatype">{activity.action}</p>
                        <p className="text-sm text-gray-400 font-diatype truncate">
                          {activity.title}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 font-diatype">{activity.time}</p>
                        <p className="text-xs text-gray-400 font-diatype">{activity.user}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 font-gendy">Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/admin/courses">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 rounded-lg transition-all flex items-center gap-3 font-diatype"
                  >
                    <PlayCircle className="w-5 h-5" />
                    <span>Create Course</span>
                  </motion.button>
                </Link>

                <Link href="/admin/workshops">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-lg transition-all flex items-center gap-3 font-diatype"
                  >
                    <Calendar className="w-5 h-5" />
                    <span>Schedule Workshop</span>
                  </motion.button>
                </Link>

                <Link href="/admin/users">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-4 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 rounded-lg transition-all flex items-center gap-3 font-diatype"
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
                    className="w-full px-4 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 rounded-lg transition-all flex items-center gap-3 font-diatype"
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
