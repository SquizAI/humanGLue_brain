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
  Video,
  Edit,
  Plus,
  TrendingUp,
  Clock,
  Award,
  BookOpen,
  Calendar,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'

export default function InstructorDashboard() {
  const router = useRouter()
  const { userData, authLoading } = useChat()
  const [stats, setStats] = useState({
    totalStudents: 156,
    activeCourses: 3,
    upcomingWorkshops: 2,
    avgRating: 4.8,
    totalRevenue: 24500,
    completionRate: 89,
  })

  // Debug logging
  useEffect(() => {
    console.log('[InstructorPage] authLoading:', authLoading, 'userData:', userData)
  }, [authLoading, userData])

  // Timeout for authLoading - if it takes more than 3 seconds, assume middleware validated access
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // If auth loads quickly and user is instructor, show content
    if (!authLoading && userData?.isInstructor) {
      setShowContent(true)
      return
    }

    // If auth is still loading after 3 seconds, trust middleware and show content anyway
    // Middleware will have already blocked non-instructors from reaching this page
    const timeout = setTimeout(() => {
      console.log('[InstructorPage] Auth timeout - trusting middleware protection')
      setShowContent(true)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [authLoading, userData])

  // Check instructor access only if auth loaded and user is not instructor
  useEffect(() => {
    if (!authLoading && userData && !userData?.isInstructor) {
      console.log('[InstructorPage] Redirecting to login - no instructor access')
      router.push('/login')
    }
  }, [userData, router, authLoading])

  if (!showContent) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
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
      title: 'Create Course',
      description: 'Build a new course module',
      icon: PlayCircle,
      href: '/instructor/courses/new',
      color: 'purple',
    },
    {
      title: 'Schedule Workshop',
      description: 'Plan a live session',
      icon: Video,
      href: '/instructor/workshops/new',
      color: 'blue',
    },
    {
      title: 'View Students',
      description: 'Manage enrollments',
      icon: Users,
      href: '/instructor/students',
      color: 'green',
    },
    {
      title: 'Course Analytics',
      description: 'Track engagement',
      icon: BarChart3,
      href: '/instructor/analytics',
      color: 'amber',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        {/* Header */}
        <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 font-gendy">Instructor Dashboard</h1>
                <p className="text-gray-400 font-diatype">Manage your courses and students</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <span className="text-sm text-blue-400 font-diatype">Instructor Mode</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Total Students */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-purple-900/30 to-purple-900/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400 font-diatype">Total Students</p>
                  <p className="text-3xl font-bold text-white font-gendy">{stats.totalStudents}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-diatype">+12 this month</span>
              </div>
            </motion.div>

            {/* Active Courses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <PlayCircle className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400 font-diatype">Active Courses</p>
                  <p className="text-3xl font-bold text-white font-gendy">{stats.activeCourses}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-diatype">2 published</span>
              </div>
            </motion.div>

            {/* Upcoming Workshops */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-green-900/30 to-green-900/10 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <Calendar className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400 font-diatype">Upcoming Workshops</p>
                  <p className="text-3xl font-bold text-white font-gendy">{stats.upcomingWorkshops}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-diatype">Next in 3 days</span>
              </div>
            </motion.div>

            {/* Average Rating */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-amber-900/30 to-amber-900/10 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-500/20 rounded-xl">
                  <Award className="w-6 h-6 text-amber-400" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400 font-diatype">Average Rating</p>
                  <p className="text-3xl font-bold text-white font-gendy">{stats.avgRating}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-diatype">156 reviews</span>
              </div>
            </motion.div>

            {/* Completion Rate */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-cyan-900/30 to-cyan-900/10 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-cyan-500/20 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400 font-diatype">Completion Rate</p>
                  <p className="text-3xl font-bold text-white font-gendy">{stats.completionRate}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-diatype">+4% improvement</span>
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
                      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-blue-500/30 transition-all group cursor-pointer"
                    >
                      <div className={`p-3 bg-${action.color}-500/20 rounded-xl inline-flex mb-4`}>
                        <Icon className={`w-6 h-6 text-${action.color}-400`} />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2 font-gendy">{action.title}</h3>
                      <p className="text-sm text-gray-400 font-diatype">{action.description}</p>
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
