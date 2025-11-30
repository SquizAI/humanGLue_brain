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
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner'
import { useChat } from '@/lib/contexts/ChatContext'
import { signOut } from '@/lib/auth/hooks'
import { usePermissions } from '@/lib/hooks/usePermissions'

export default function AdminDashboard() {
  const router = useRouter()
  const { userData, authLoading } = useChat()
  const {
    canAccessFinancials,
    canManageCourses,
    canManageExperts,
    canManageUsers,
    isSuperAdminCourses,
    loading: permissionsLoading
  } = usePermissions()

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
    // If auth loads quickly and user is admin, show content immediately
    if (!authLoading && userData?.isAdmin) {
      console.log('[AdminPage] Admin user confirmed, showing content')
      setShowContent(true)
      return
    }

    // If auth is still loading after 2 seconds, trust middleware and show content anyway
    // Middleware will have already blocked non-admins from reaching this page
    const timeout = setTimeout(() => {
      console.log('[AdminPage] Auth timeout - trusting middleware protection, showing content')
      setShowContent(true)
    }, 2000)

    return () => clearTimeout(timeout)
  }, [authLoading, userData])

  // NO CLIENT-SIDE REDIRECT - Trust middleware to handle access control
  // Middleware has already validated admin access before this page loads

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

  // Filter quick actions based on permissions
  const allQuickActions = [
    {
      title: 'Add New Course',
      description: 'Create a new course module',
      icon: PlayCircle,
      href: '/admin/courses/new',
      color: 'cyan',
      permission: 'canManageCourses',
    },
    {
      title: 'Add Expert',
      description: 'Add expert to network',
      icon: Users,
      href: '/admin/experts/new',
      color: 'blue',
      permission: 'canManageExperts',
    },
    {
      title: 'Upload Content',
      description: 'Upload videos & materials',
      icon: Upload,
      href: '/admin/content',
      color: 'purple',
      permission: 'canManageCourses',
    },
    {
      title: 'View Analytics',
      description: 'Platform performance',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'amber',
      permission: null, // Always visible - analytics available to all admins
    },
  ]

  // Filter actions based on user permissions
  const quickActions = allQuickActions.filter(action => {
    if (!action.permission) return true // No permission required
    if (action.permission === 'canManageCourses') return canManageCourses
    if (action.permission === 'canManageExperts') return canManageExperts
    if (action.permission === 'canManageUsers') return canManageUsers
    return false
  })

  const recentActivity = [
    { id: 1, action: 'New course enrolled', user: 'Sarah Mitchell', time: '5 min ago' },
    { id: 2, action: 'Expert profile updated', user: 'Dr. James Wilson', time: '1 hour ago' },
    { id: 3, action: 'Course completed', user: 'Michael Chen', time: '2 hours ago' },
    { id: 4, action: 'New consultation booked', user: 'Lisa Anderson', time: '3 hours ago' },
  ]

  return (
    <div className="min-h-screen hg-bg-primary">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        {!showContent ? (
          /* Loading state - sidebar stays visible, content area shows cool spinner */
          <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner variant="neural" size="xl" text="Loading dashboard..." />
          </div>
        ) : (
          <>
        {/* Header */}
        <div style={{ backgroundColor: 'var(--hg-bg-sidebar)', borderColor: 'var(--hg-border-color)' }} className="backdrop-blur-xl border-b sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold hg-text-primary font-gendy">Admin Dashboard</h1>
                  {!permissionsLoading && (
                    <>
                      {isSuperAdminCourses && (
                        <span style={{ backgroundColor: 'var(--hg-cyan-bg)', color: 'var(--hg-cyan-text)', borderColor: 'var(--hg-cyan-border)' }} className="px-3 py-1 rounded-full text-sm font-medium border">
                          Course Management Only
                        </span>
                      )}
                      {canAccessFinancials && !isSuperAdminCourses && (
                        <span style={{ backgroundColor: 'var(--hg-cyan-bg)', color: 'var(--hg-cyan-text)', borderColor: 'var(--hg-cyan-border)' }} className="px-3 py-1 rounded-full text-sm font-medium border">
                          Full Access
                        </span>
                      )}
                    </>
                  )}
                </div>
                <p className="hg-text-secondary font-diatype">Manage your platform content and users</p>
              </div>
              <div className="flex items-center gap-3">
                <div style={{ backgroundColor: 'var(--hg-cyan-bg)', borderColor: 'var(--hg-cyan-border)' }} className="px-4 py-2 border rounded-lg">
                  <span className="text-sm hg-text-cyan font-diatype">System Operational</span>
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
              style={{ backgroundColor: 'var(--hg-cyan-bg)', borderColor: 'var(--hg-cyan-border)' }}
              className="backdrop-blur-xl border rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div style={{ backgroundColor: 'var(--hg-cyan-bg)' }} className="p-3 rounded-xl">
                  <PlayCircle className="w-6 h-6 hg-text-cyan" />
                </div>
                <div className="text-right">
                  <p className="text-sm hg-text-secondary font-diatype">Total Courses</p>
                  <p className="text-3xl font-bold hg-text-primary font-gendy">{stats.totalCourses}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 hg-text-cyan" />
                <span className="hg-text-cyan font-diatype">+2 this month</span>
              </div>
            </motion.div>

            {/* Total Experts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-blue-500/10 dark:bg-blue-900/30 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Users className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                </div>
                <div className="text-right">
                  <p className="text-sm hg-text-secondary font-diatype">Expert Network</p>
                  <p className="text-3xl font-bold hg-text-primary font-gendy">{stats.totalExperts}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 hg-text-cyan" />
                <span className="hg-text-cyan font-diatype">+1 this month</span>
              </div>
            </motion.div>

            {/* Total Students */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-purple-500/10 dark:bg-purple-900/30 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Eye className="w-6 h-6 text-purple-500 dark:text-purple-400" />
                </div>
                <div className="text-right">
                  <p className="text-sm hg-text-secondary font-diatype">Total Students</p>
                  <p className="text-3xl font-bold hg-text-primary font-gendy">{stats.totalStudents.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 hg-text-cyan" />
                <span className="hg-text-cyan font-diatype">+127 this week</span>
              </div>
            </motion.div>

            {/* Revenue - Only visible to users with financial access */}
            {canAccessFinancials && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-amber-500/10 dark:bg-amber-900/30 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-amber-500/20 rounded-xl">
                    <DollarSign className="w-6 h-6 text-amber-500 dark:text-amber-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm hg-text-secondary font-diatype">Monthly Revenue</p>
                    <p className="text-3xl font-bold hg-text-primary font-gendy">${(stats.totalRevenue / 1000).toFixed(0)}k</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 hg-text-cyan" />
                  <span className="hg-text-cyan font-diatype">+18% vs last month</span>
                </div>
              </motion.div>
            )}

            {/* Active Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{ backgroundColor: 'var(--hg-cyan-bg)', borderColor: 'var(--hg-cyan-border)' }}
              className="backdrop-blur-xl border rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div style={{ backgroundColor: 'var(--hg-cyan-bg)' }} className="p-3 rounded-xl">
                  <Video className="w-6 h-6 hg-text-cyan" />
                </div>
                <div className="text-right">
                  <p className="text-sm hg-text-secondary font-diatype">Active Sessions</p>
                  <p className="text-3xl font-bold hg-text-primary font-gendy">{stats.activeSessions}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 hg-text-cyan" />
                <span className="hg-text-cyan font-diatype">Live now</span>
              </div>
            </motion.div>

            {/* Completion Rate */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-pink-500/10 dark:bg-pink-900/30 backdrop-blur-xl border border-pink-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-pink-500/20 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-pink-500 dark:text-pink-400" />
                </div>
                <div className="text-right">
                  <p className="text-sm hg-text-secondary font-diatype">Completion Rate</p>
                  <p className="text-3xl font-bold hg-text-primary font-gendy">{stats.completionRate}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 hg-text-cyan" />
                <span className="hg-text-cyan font-diatype">+5% improvement</span>
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-bold hg-text-primary mb-4 font-gendy">Quick Actions</h2>
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
                      style={{ backgroundColor: 'var(--hg-bg-card)', borderColor: 'var(--hg-border-color)' }}
                      className="backdrop-blur-xl border rounded-xl p-6 hover:border-[var(--hg-cyan-border)] transition-all group cursor-pointer"
                    >
                      <div className={`p-3 bg-${action.color}-500/20 rounded-xl inline-flex mb-4`}>
                        <Icon className={`w-6 h-6 text-${action.color}-500 dark:text-${action.color}-400`} />
                      </div>
                      <h3 className="text-lg font-semibold hg-text-primary mb-2 font-gendy">{action.title}</h3>
                      <p className="text-sm hg-text-secondary font-diatype">{action.description}</p>
                      <div className="mt-4 flex items-center gap-2 hg-text-cyan opacity-0 group-hover:opacity-100 transition-opacity">
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
            <div style={{ backgroundColor: 'var(--hg-bg-card)', borderColor: 'var(--hg-border-color)' }} className="backdrop-blur-xl border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold hg-text-primary font-gendy">Content Management</h2>
                <Settings className="w-5 h-5 hg-text-muted" />
              </div>

              <div className="space-y-4">
                {/* Manage Courses - Only visible to users who can manage courses */}
                {canManageCourses && (
                  <Link href="/admin/courses">
                    <div style={{ backgroundColor: 'var(--hg-bg-secondary)' }} className="flex items-center justify-between p-4 rounded-xl hover:opacity-80 transition-all group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div style={{ backgroundColor: 'var(--hg-cyan-bg)' }} className="p-2 rounded-lg">
                          <PlayCircle className="w-5 h-5 hg-text-cyan" />
                        </div>
                        <div>
                          <h3 className="hg-text-primary font-semibold font-diatype">Manage Courses</h3>
                          <p className="text-sm hg-text-muted font-diatype">{stats.totalCourses} active courses</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 hg-text-muted group-hover:hg-text-primary transition-colors" />
                    </div>
                  </Link>
                )}

                {/* Manage Experts - Only visible to users who can manage experts */}
                {canManageExperts && (
                  <Link href="/admin/experts">
                    <div style={{ backgroundColor: 'var(--hg-bg-secondary)' }} className="flex items-center justify-between p-4 rounded-xl hover:opacity-80 transition-all group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <Users className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="hg-text-primary font-semibold font-diatype">Manage Experts</h3>
                          <p className="text-sm hg-text-muted font-diatype">{stats.totalExperts} expert profiles</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 hg-text-muted group-hover:hg-text-primary transition-colors" />
                    </div>
                  </Link>
                )}

                {/* Upload Content - Only visible to users who can manage courses */}
                {canManageCourses && (
                  <Link href="/admin/content">
                    <div style={{ backgroundColor: 'var(--hg-bg-secondary)' }} className="flex items-center justify-between p-4 rounded-xl hover:opacity-80 transition-all group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div style={{ backgroundColor: 'var(--hg-cyan-bg)' }} className="p-2 rounded-lg">
                          <FileText className="w-5 h-5 hg-text-cyan" />
                        </div>
                        <div>
                          <h3 className="hg-text-primary font-semibold font-diatype">Upload Content</h3>
                          <p className="text-sm hg-text-muted font-diatype">Videos, documents & materials</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 hg-text-muted group-hover:hg-text-primary transition-colors" />
                    </div>
                  </Link>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{ backgroundColor: 'var(--hg-bg-card)', borderColor: 'var(--hg-border-color)' }} className="backdrop-blur-xl border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold hg-text-primary font-gendy">Recent Activity</h2>
                <Sparkles className="w-5 h-5 hg-text-muted" />
              </div>

              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} style={{ backgroundColor: 'var(--hg-bg-secondary)' }} className="flex items-start gap-4 p-4 rounded-xl">
                    <div style={{ backgroundColor: 'var(--hg-cyan-bg)' }} className="p-2 rounded-lg flex-shrink-0">
                      <Clock className="w-4 h-4 hg-text-cyan" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="hg-text-primary font-medium font-diatype">{activity.action}</p>
                      <p className="text-sm hg-text-muted font-diatype">{activity.user}</p>
                    </div>
                    <span className="text-xs hg-text-muted font-diatype whitespace-nowrap">{activity.time}</span>
                  </div>
                ))}
              </div>

              <Link href="/admin/activity">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  style={{ backgroundColor: 'var(--hg-bg-secondary)', borderColor: 'var(--hg-border-color)' }}
                  className="w-full mt-4 px-4 py-3 hover:opacity-80 border rounded-xl hg-text-primary font-semibold transition-all font-diatype"
                >
                  View All Activity
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  )
}
