'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  PlayCircle,
  Users,
  BarChart3,
  Settings,
  FileText,
  Video,
  Upload,
  DollarSign,
  Eye,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner'
import { Button } from '@/components/atoms/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card'
import { StatCard } from '@/components/atoms/StatCard'
import { Text, Heading } from '@/components/atoms/Text'
import { useChat } from '@/lib/contexts/ChatContext'
import { signOut } from '@/lib/auth/hooks'
import { usePermissions } from '@/lib/hooks/usePermissions'

export default function AdminDashboard() {
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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--hg-bg-primary)' }}>
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        {!showContent ? (
          /* Loading state - sidebar stays visible, content area shows cool spinner */
          <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner variant="neural" size="xl" text="Loading dashboard..." />
          </div>
        ) : (
          <>
        {/* Main Content */}
        <div className="p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <Heading as="h1" size="3xl" className="mb-2">
              Welcome back, <Text as="span" variant="cyan" size="3xl" weight="bold">{userData?.name?.split(' ')[0] || 'Admin'}</Text>
            </Heading>
            <Text variant="muted">Here's your platform overview</Text>
          </div>

          {/* Stats Grid - Using atomic StatCard components */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Courses"
              value={stats.totalCourses}
              icon={<PlayCircle className="w-5 h-5" />}
              variant="cyan"
              trend={{ value: 2, label: 'this month', direction: 'up' }}
            />

            <StatCard
              title="Expert Network"
              value={stats.totalExperts}
              icon={<Users className="w-5 h-5" />}
              variant="cyan"
              trend={{ value: 1, label: 'this month', direction: 'up' }}
            />

            <StatCard
              title="Total Students"
              value={stats.totalStudents.toLocaleString()}
              icon={<Eye className="w-5 h-5" />}
              variant="cyan"
              trend={{ value: 127, label: 'this week', direction: 'up' }}
            />

            {canAccessFinancials && (
              <StatCard
                title="Monthly Revenue"
                value={`$${(stats.totalRevenue / 1000).toFixed(0)}k`}
                icon={<DollarSign className="w-5 h-5" />}
                variant="cyan"
                trend={{ value: 18, label: 'vs last month', direction: 'up' }}
              />
            )}

            <StatCard
              title="Active Sessions"
              value={stats.activeSessions}
              subtitle="Live now"
              icon={<Video className="w-5 h-5" />}
              variant="cyan"
            />

            <StatCard
              title="Completion Rate"
              value={`${stats.completionRate}%`}
              subtitle="+5% improvement"
              icon={<BarChart3 className="w-5 h-5" />}
              variant="cyan"
            />
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <Heading as="h2" size="xl" className="mb-4">Quick Actions</Heading>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Link key={index} href={action.href}>
                    <Card hover animate className="group cursor-pointer">
                      <div className="p-3 rounded-xl inline-flex mb-4 bg-[var(--hg-cyan-bg)]">
                        <Icon className="w-6 h-6 text-[var(--hg-cyan-text)]" />
                      </div>
                      <Heading as="h3" size="lg" className="mb-2">{action.title}</Heading>
                      <Text variant="secondary" size="sm">{action.description}</Text>
                      <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--hg-cyan-text)]">
                        <Text variant="cyan" size="sm">Get started</Text>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Content Management & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Content Management */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
                <Settings className="w-5 h-5 hg-text-muted" />
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Manage Courses - Only visible to users who can manage courses */}
                {canManageCourses && (
                  <Link href="/admin/courses">
                    <div className="flex items-center justify-between p-4 rounded-xl hg-bg-secondary hover:opacity-80 transition-all group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-[var(--hg-cyan-bg)]">
                          <PlayCircle className="w-5 h-5 text-[var(--hg-cyan-text)]" />
                        </div>
                        <div>
                          <Text weight="semibold">Manage Courses</Text>
                          <Text variant="muted" size="sm">{stats.totalCourses} active courses</Text>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 hg-text-muted" />
                    </div>
                  </Link>
                )}

                {/* Manage Experts - Only visible to users who can manage experts */}
                {canManageExperts && (
                  <Link href="/admin/experts">
                    <div className="flex items-center justify-between p-4 rounded-xl hg-bg-secondary hover:opacity-80 transition-all group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-[var(--hg-cyan-bg)]">
                          <Users className="w-5 h-5 text-[var(--hg-cyan-text)]" />
                        </div>
                        <div>
                          <Text weight="semibold">Manage Experts</Text>
                          <Text variant="muted" size="sm">{stats.totalExperts} expert profiles</Text>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 hg-text-muted" />
                    </div>
                  </Link>
                )}

                {/* Upload Content - Only visible to users who can manage courses */}
                {canManageCourses && (
                  <Link href="/admin/content">
                    <div className="flex items-center justify-between p-4 rounded-xl hg-bg-secondary hover:opacity-80 transition-all group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-[var(--hg-cyan-bg)]">
                          <FileText className="w-5 h-5 text-[var(--hg-cyan-text)]" />
                        </div>
                        <div>
                          <Text weight="semibold">Upload Content</Text>
                          <Text variant="muted" size="sm">Videos, documents & materials</Text>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 hg-text-muted" />
                    </div>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <Sparkles className="w-5 h-5 hg-text-muted" />
              </CardHeader>

              <CardContent className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 rounded-xl hg-bg-secondary">
                    <div className="p-2 rounded-lg flex-shrink-0 bg-[var(--hg-cyan-bg)]">
                      <Clock className="w-4 h-4 text-[var(--hg-cyan-text)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Text weight="medium">{activity.action}</Text>
                      <Text variant="muted" size="sm">{activity.user}</Text>
                    </div>
                    <Text variant="muted" size="xs" className="whitespace-nowrap">{activity.time}</Text>
                  </div>
                ))}

                <Link href="/admin/activity">
                  <Button variant="secondary" fullWidth className="mt-4">
                    View All Activity
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  )
}
 
