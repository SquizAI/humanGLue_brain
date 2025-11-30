/**
 * Real-Time Dashboard Example
 *
 * This is a complete example showing how to integrate all real-time features
 * into an instructor dashboard page.
 *
 * Copy this to: app/instructor/dashboard/page.tsx
 */

'use client'

import { useState } from 'react'
import {
  useInstructorNotifications,
  useStudentActivity,
  useCourseStats,
  usePresence,
} from '@/lib/hooks/useRealtimeInstructor'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'

export default function InstructorDashboard() {
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>()

  // Real-time hooks
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useInstructorNotifications()

  const {
    activities,
    loading: activitiesLoading,
  } = useStudentActivity(selectedCourseId)

  const {
    stats,
    loading: statsLoading,
  } = useCourseStats(selectedCourseId || '')

  const {
    onlineUsers,
    totalOnline,
  } = usePresence(selectedCourseId)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Real-Time Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Monitor your courses and students in real-time
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Students"
          value={stats?.total_enrollments || 0}
          icon="👥"
          color="blue"
          loading={statsLoading}
          trend="+12%"
        />
        <StatCard
          title="Online Now"
          value={totalOnline}
          icon="🟢"
          color="green"
          subtitle={`${onlineUsers.length} active users`}
        />
        <StatCard
          title="Completions"
          value={stats?.completed_count || 0}
          icon="🎓"
          color="cyan"
          loading={statsLoading}
        />
        <StatCard
          title="Avg Rating"
          value={stats?.average_rating?.toFixed(1) || '0.0'}
          icon="⭐"
          color="yellow"
          loading={statsLoading}
          subtitle={`${stats?.review_count || 0} reviews`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Activity
              </h2>
              <button
                onClick={() => {}}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                View All
              </button>
            </div>

            {activitiesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse flex gap-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No recent activity
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.slice(0, 10).map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <img
                      src={activity.student_avatar || '/default-avatar.png'}
                      alt={activity.student_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <strong>{activity.student_name}</strong>
                        {' '}
                        {formatActivityType(activity.activity_type)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {activity.course_title} •{' '}
                        {formatDistanceToNow(new Date(activity.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Online Students */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Online Students
            </h3>

            {onlineUsers.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No students online
              </p>
            ) : (
              <div className="space-y-3">
                {onlineUsers.slice(0, 5).map(user => (
                  <div key={user.user_id} className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={user.avatar || '/default-avatar.png'}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.status}
                      </p>
                    </div>
                  </div>
                ))}

                {onlineUsers.length > 5 && (
                  <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                    +{onlineUsers.length - 5} more
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Recent Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No notifications
              </p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 5).map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      !notif.read_at ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(notif.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                ))}

                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="w-full text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 py-2"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper Components

interface StatCardProps {
  title: string
  value: string | number
  icon: string
  color: 'blue' | 'green' | 'cyan' | 'yellow'
  loading?: boolean
  trend?: string
  subtitle?: string
}

function StatCard({
  title,
  value,
  icon,
  color,
  loading,
  trend,
  subtitle,
}: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    cyan: 'bg-cyan-500',
    yellow: 'bg-yellow-500',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          {loading ? (
            <div className="mt-2 h-8 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
          ) : (
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
          )}
          {subtitle && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
          {trend && (
            <p className="mt-1 text-xs text-green-600 dark:text-green-400">
              {trend}
            </p>
          )}
        </div>
        <div
          className={`${colorClasses[color]} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

// Helper Functions

function formatActivityType(type: string): string {
  const formats: Record<string, string> = {
    lesson_started: 'started a lesson',
    lesson_completed: 'completed a lesson',
    assignment_submitted: 'submitted an assignment',
    quiz_completed: 'completed a quiz',
    question_asked: 'asked a question',
    comment_posted: 'posted a comment',
  }
  return formats[type] || type
}
