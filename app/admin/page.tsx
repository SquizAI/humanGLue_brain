'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  PlayCircle,
  Users,
  BarChart3,
  Settings,
  FileText,
  Video,
  Upload,
  Edit,
  Trash2,
  Plus,
  TrendingUp,
  DollarSign,
  Eye,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'
import { signOut } from '@/lib/auth/hooks'

export default function AdminDashboard() {
  const router = useRouter()
  const { userData, authLoading } = useChat()
  const [stats, setStats] = useState({
    totalCourses: 6,
    totalExperts: 6,
    totalStudents: 2847,
    totalRevenue: 89750,
    activeSessions: 12,
    completionRate: 87,
  })

  // Debug logging
  useEffect(() => {
    console.log('[AdminPage] authLoading:', authLoading, 'userData:', userData)
  }, [authLoading, userData])

  // Timeout for authLoading - if it takes more than 3 seconds, assume middleware validated access
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // If auth loads quickly and user is admin, show content
    if (!authLoading && userData?.isAdmin) {
      setShowContent(true)
      return
    }

    // If auth is still loading after 3 seconds, trust middleware and show content anyway
    // Middleware will have already blocked non-admins from reaching this page
    const timeout = setTimeout(() => {
      console.log('[AdminPage] Auth timeout - trusting middleware protection')
      setShowContent(true)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [authLoading, userData])

  // Check admin access only if auth loaded and user is not admin
  useEffect(() => {
    if (!authLoading && userData && !userData?.isAdmin) {
      console.log('[AdminPage] Redirecting to login - no admin access')
      router.push('/login')
    }
  }, [userData, router, authLoading])

  if (!showContent) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  const handleLogout = async () => {
    try {
      // Call API logout endpoint to clear server-side session
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      // Call Supabase signOut to clear client-side auth
      await signOut()

      // Clear any localStorage items
      localStorage.removeItem('humanglue_user')
      localStorage.removeItem('demoUser')

      // Clear demo user cookie
      document.cookie = 'demoUser=; path=/; max-age=0'

      // Clear Supabase auth token from localStorage
      localStorage.removeItem('sb-egqqdscvxvtwcdwknbnt-auth-token')

      // Redirect to login and force a full refresh
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      // Even if there's an error, redirect to login
      window.location.href = '/login'
    }
  }

  const quickActions = [
    {
      title: 'Add New Course',
      description: 'Create a new course module',
      icon: PlayCircle,
      href: '/admin/courses/new',
      color: 'purple',
    },
    {
      title: 'Add Expert',
      description: 'Add expert to network',
      icon: Users,
      href: '/admin/experts/new',
      color: 'blue',
    },
    {
      title: 'Upload Content',
      description: 'Upload videos & materials',
      icon: Upload,
      href: '/admin/content',
      color: 'green',
    },
    {
      title: 'View Analytics',
      description: 'Platform performance',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'amber',
    },
  ]

  const recentActivity = [
    { id: 1, action: 'New course enrolled', user: 'Sarah Mitchell', time: '5 min ago' },
    { id: 2, action: 'Expert profile updated', user: 'Dr. James Wilson', time: '1 hour ago' },
    { id: 3, action: 'Course completed', user: 'Michael Chen', time: '2 hours ago' },
    { id: 4, action: 'New consultation booked', user: 'Lisa Anderson', time: '3 hours ago' },
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="ml-[280px] transition-all duration-300">
        {/* Header */}
        <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 font-gendy">Admin Dashboard</h1>
                <p className="text-gray-400 font-diatype">Manage your platform content and users</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <span className="text-sm text-green-400 font-diatype">System Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Total Courses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-purple-900/30 to-purple-900/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <PlayCircle className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400 font-diatype">Total Courses</p>
                  <p className="text-3xl font-bold text-white font-gendy">{stats.totalCourses}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-diatype">+2 this month</span>
              </div>
            </motion.div>

            {/* Total Experts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400 font-diatype">Expert Network</p>
                  <p className="text-3xl font-bold text-white font-gendy">{stats.totalExperts}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-diatype">+1 this month</span>
              </div>
            </motion.div>

            {/* Total Students */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-green-900/30 to-green-900/10 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <Eye className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400 font-diatype">Total Students</p>
                  <p className="text-3xl font-bold text-white font-gendy">{stats.totalStudents.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-diatype">+127 this week</span>
              </div>
            </motion.div>

            {/* Revenue */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-amber-900/30 to-amber-900/10 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-500/20 rounded-xl">
                  <DollarSign className="w-6 h-6 text-amber-400" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400 font-diatype">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-white font-gendy">${(stats.totalRevenue / 1000).toFixed(0)}k</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-diatype">+18% vs last month</span>
              </div>
            </motion.div>

            {/* Active Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-cyan-900/30 to-cyan-900/10 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-cyan-500/20 rounded-xl">
                  <Video className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400 font-diatype">Active Sessions</p>
                  <p className="text-3xl font-bold text-white font-gendy">{stats.activeSessions}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 font-diatype">Live now</span>
              </div>
            </motion.div>

            {/* Completion Rate */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-pink-900/30 to-pink-900/10 backdrop-blur-xl border border-pink-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-pink-500/20 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-pink-400" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400 font-diatype">Completion Rate</p>
                  <p className="text-3xl font-bold text-white font-gendy">{stats.completionRate}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-diatype">+5% improvement</span>
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 font-gendy">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Link key={index} href={action.href}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-purple-500/30 transition-all group cursor-pointer"
                    >
                      <div className={`p-3 bg-${action.color}-500/20 rounded-xl inline-flex mb-4`}>
                        <Icon className={`w-6 h-6 text-${action.color}-400`} />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2 font-gendy">{action.title}</h3>
                      <p className="text-sm text-gray-400 font-diatype">{action.description}</p>
                      <div className="mt-4 flex items-center gap-2 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-sm font-diatype">Get started</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Content Management & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Content Management */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white font-gendy">Content Management</h2>
                <Settings className="w-5 h-5 text-gray-400" />
              </div>

              <div className="space-y-4">
                <Link href="/admin/courses">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <PlayCircle className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold font-diatype">Manage Courses</h3>
                        <p className="text-sm text-gray-400 font-diatype">{stats.totalCourses} active courses</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                </Link>

                <Link href="/admin/experts">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Users className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold font-diatype">Manage Experts</h3>
                        <p className="text-sm text-gray-400 font-diatype">{stats.totalExperts} expert profiles</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                </Link>

                <Link href="/admin/content">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <FileText className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold font-diatype">Upload Content</h3>
                        <p className="text-sm text-gray-400 font-diatype">Videos, documents & materials</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white font-gendy">Recent Activity</h2>
                <Sparkles className="w-5 h-5 text-gray-400" />
              </div>

              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
                    <div className="p-2 bg-purple-500/20 rounded-lg flex-shrink-0">
                      <Clock className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium font-diatype">{activity.action}</p>
                      <p className="text-sm text-gray-400 font-diatype">{activity.user}</p>
                    </div>
                    <span className="text-xs text-gray-500 font-diatype whitespace-nowrap">{activity.time}</span>
                  </div>
                ))}
              </div>

              <Link href="/admin/activity">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="w-full mt-4 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold transition-all font-diatype"
                >
                  View All Activity
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
