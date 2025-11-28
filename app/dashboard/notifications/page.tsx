'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Check, Trash2, Settings, Filter } from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { cn } from '@/utils/cn'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'update'
  timestamp: Date
  read: boolean
  actionUrl?: string
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Course Available',
      message: 'Check out "AI Ethics and Governance" - a new course tailored to your learning path.',
      type: 'info',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      actionUrl: '/dashboard/courses'
    },
    {
      id: '2',
      title: 'Assessment Complete',
      message: 'Your Q1 2024 AI Maturity Assessment results are ready to view.',
      type: 'success',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      read: false,
      actionUrl: '/dashboard/assessments'
    },
    {
      id: '3',
      title: 'Team Progress Update',
      message: 'Your team completed 5 new courses this week. Great progress!',
      type: 'success',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true,
    },
    {
      id: '4',
      title: 'Upcoming Workshop',
      message: 'Reminder: "AI Strategy for Leaders" workshop starts in 2 days.',
      type: 'warning',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      read: true,
      actionUrl: '/dashboard/workshops'
    },
    {
      id: '5',
      title: 'Platform Update',
      message: 'We\'ve added new AI advisor capabilities. Try asking about your transformation roadmap!',
      type: 'update',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      read: true,
    }
  ])

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications

  const unreadCount = notifications.filter(n => !n.read).length

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-400 bg-green-500/10'
      case 'warning':
        return 'text-yellow-400 bg-yellow-500/10'
      case 'update':
        return 'text-purple-400 bg-purple-500/10'
      default:
        return 'text-blue-400 bg-blue-500/10'
    }
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl font-bold text-white">Notifications</h1>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>

          <p className="text-gray-400">
            Stay updated with your learning progress and platform updates
          </p>
        </div>

        {/* Stats and Actions */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <div className="text-2xl font-bold text-white">
                  {notifications.length}
                </div>
                <div className="text-sm text-gray-400">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {unreadCount}
                </div>
                <div className="text-sm text-gray-400">Unread</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="gap-2"
              >
                <Check className="w-4 h-4" />
                Mark All Read
              </Button>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'px-4 py-2 rounded-lg font-medium text-sm transition-all',
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            )}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={cn(
              'px-4 py-2 rounded-lg font-medium text-sm transition-all',
              filter === 'unread'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            )}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No notifications
              </h3>
              <p className="text-gray-500">
                {filter === 'unread'
                  ? "You're all caught up!"
                  : "You don't have any notifications yet"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'bg-gray-900/50 backdrop-blur-xl rounded-xl border transition-all duration-200',
                  notification.read
                    ? 'border-gray-800'
                    : 'border-purple-500/30 bg-purple-500/5'
                )}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Type Icon */}
                    <div className={cn(
                      'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                      getTypeColor(notification.type)
                    )}>
                      <Bell className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className={cn(
                          'font-semibold',
                          notification.read ? 'text-gray-300' : 'text-white'
                        )}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                      </div>

                      <p className="text-gray-400 text-sm mb-4">
                        {notification.message}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {notification.actionUrl && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              markAsRead(notification.id)
                              window.location.href = notification.actionUrl!
                            }}
                          >
                            View
                          </Button>
                        )}
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="ml-auto p-2 text-gray-500 hover:text-red-400 transition-colors"
                          aria-label="Delete notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
