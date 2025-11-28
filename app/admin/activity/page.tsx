'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardSidebar } from '../../../components/organisms/DashboardSidebar'
import { cn } from '../../../utils/cn'
import {
  UserPlus,
  PlayCircle,
  FileText,
  Calendar,
  Users,
  DollarSign,
  Settings,
  Activity,
  Search,
  Filter,
  Download,
  RefreshCw,
  Volume2,
  VolumeX,
  X,
  Clock,
  MapPin,
  Monitor,
  CheckCircle2,
  Award,
  CreditCard,
  UserCircle,
  Mail,
  Shield,
  Upload,
  MessageSquare,
  Bell,
  ChevronDown,
  ChevronRight,
  Eye,
} from 'lucide-react'

// Activity type definitions
type ActivityType =
  | 'user_registered'
  | 'course_enrolled'
  | 'assessment_completed'
  | 'workshop_booked'
  | 'expert_consultation'
  | 'content_uploaded'
  | 'course_completed'
  | 'payment_transaction'
  | 'profile_updated'
  | 'team_invitation'
  | 'password_reset'

interface Activity {
  id: string
  type: ActivityType
  user: {
    name: string
    email: string
    avatar?: string
  }
  title: string
  description: string
  timestamp: Date
  metadata?: {
    courseName?: string
    score?: number
    workshopName?: string
    expertName?: string
    contentType?: string
    amount?: number
    certificateId?: string
    ipAddress?: string
    device?: string
    location?: string
    transactionType?: string
  }
}

// Activity type configurations
const activityConfig: Record<ActivityType, {
  icon: any
  color: string
  bgColor: string
  category: string
}> = {
  user_registered: {
    icon: UserPlus,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    category: 'Users'
  },
  course_enrolled: {
    icon: PlayCircle,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    category: 'Courses'
  },
  assessment_completed: {
    icon: FileText,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    category: 'Assessments'
  },
  workshop_booked: {
    icon: Calendar,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    category: 'Workshops'
  },
  expert_consultation: {
    icon: Users,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    category: 'Experts'
  },
  content_uploaded: {
    icon: Upload,
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/20',
    category: 'System'
  },
  course_completed: {
    icon: Award,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    category: 'Courses'
  },
  payment_transaction: {
    icon: DollarSign,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    category: 'Payments'
  },
  profile_updated: {
    icon: UserCircle,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    category: 'Users'
  },
  team_invitation: {
    icon: Mail,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/20',
    category: 'Users'
  },
  password_reset: {
    icon: Shield,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    category: 'System'
  }
}

// Mock activity data
const generateMockActivities = (): Activity[] => {
  const now = new Date()

  return [
    {
      id: '1',
      type: 'user_registered',
      user: {
        name: 'Sarah Chen',
        email: 'sarah.chen@techcorp.com',
        avatar: 'SC'
      },
      title: 'New User Registration',
      description: 'Sarah Chen registered for an account',
      timestamp: new Date(now.getTime() - 5 * 60 * 1000), // 5 min ago
      metadata: {
        ipAddress: '192.168.1.100',
        device: 'Chrome on MacOS',
        location: 'San Francisco, CA'
      }
    },
    {
      id: '2',
      type: 'course_enrolled',
      user: {
        name: 'Michael Rodriguez',
        email: 'michael.r@startup.io',
        avatar: 'MR'
      },
      title: 'Course Enrollment',
      description: 'Michael Rodriguez enrolled in AI Leadership Fundamentals',
      timestamp: new Date(now.getTime() - 15 * 60 * 1000), // 15 min ago
      metadata: {
        courseName: 'AI Leadership Fundamentals'
      }
    },
    {
      id: '3',
      type: 'assessment_completed',
      user: {
        name: 'Emily Watson',
        email: 'emily.w@innovation.com',
        avatar: 'EW'
      },
      title: 'Assessment Completed',
      description: 'Emily Watson completed the AI Readiness Assessment',
      timestamp: new Date(now.getTime() - 32 * 60 * 1000), // 32 min ago
      metadata: {
        score: 87,
      }
    },
    {
      id: '4',
      type: 'workshop_booked',
      user: {
        name: 'James Lee',
        email: 'james.lee@corp.com',
        avatar: 'JL'
      },
      title: 'Workshop Booking',
      description: 'James Lee booked a seat for Building AI-First Teams',
      timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
      metadata: {
        workshopName: 'Building AI-First Teams',
      }
    },
    {
      id: '5',
      type: 'expert_consultation',
      user: {
        name: 'Priya Sharma',
        email: 'priya.s@enterprise.com',
        avatar: 'PS'
      },
      title: 'Expert Consultation Scheduled',
      description: 'Priya Sharma scheduled a consultation with Dr. Alex Morgan',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      metadata: {
        expertName: 'Dr. Alex Morgan - AI Strategy',
      }
    },
    {
      id: '6',
      type: 'payment_transaction',
      user: {
        name: 'David Kim',
        email: 'david.kim@company.com',
        avatar: 'DK'
      },
      title: 'Payment Processed',
      description: 'David Kim completed payment for Enterprise Plan',
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
      metadata: {
        amount: 999,
        transactionType: 'Subscription',
      }
    },
    {
      id: '7',
      type: 'course_completed',
      user: {
        name: 'Lisa Anderson',
        email: 'lisa.a@tech.com',
        avatar: 'LA'
      },
      title: 'Course Completed',
      description: 'Lisa Anderson completed AI Ethics & Governance and earned a certificate',
      timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
      metadata: {
        courseName: 'AI Ethics & Governance',
        certificateId: 'CERT-2024-001234',
      }
    },
    {
      id: '8',
      type: 'content_uploaded',
      user: {
        name: 'Admin User',
        email: 'admin@humanglue.ai',
        avatar: 'AD'
      },
      title: 'Content Upload',
      description: 'Admin User uploaded new course materials for Machine Learning Basics',
      timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
      metadata: {
        contentType: 'Video Course',
      }
    },
    {
      id: '9',
      type: 'profile_updated',
      user: {
        name: 'Robert Taylor',
        email: 'robert.t@biztech.com',
        avatar: 'RT'
      },
      title: 'Profile Updated',
      description: 'Robert Taylor updated their profile information',
      timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000), // 8 hours ago
      metadata: {
        device: 'Safari on iPhone',
      }
    },
    {
      id: '10',
      type: 'team_invitation',
      user: {
        name: 'Jennifer Lopez',
        email: 'jennifer.l@startup.ai',
        avatar: 'JL'
      },
      title: 'Team Invitation Sent',
      description: 'Jennifer Lopez invited 3 team members to join the platform',
      timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
    },
    {
      id: '11',
      type: 'password_reset',
      user: {
        name: 'Thomas Wright',
        email: 'thomas.w@company.io',
        avatar: 'TW'
      },
      title: 'Password Reset Requested',
      description: 'Thomas Wright requested a password reset',
      timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      metadata: {
        ipAddress: '203.45.67.89',
        device: 'Firefox on Windows',
        location: 'New York, NY'
      }
    },
    {
      id: '12',
      type: 'workshop_booked',
      user: {
        name: 'Amanda Miller',
        email: 'amanda.m@tech.org',
        avatar: 'AM'
      },
      title: 'Workshop Booking',
      description: 'Amanda Miller booked a seat for AI Product Management Workshop',
      timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      metadata: {
        workshopName: 'AI Product Management Workshop',
      }
    },
  ]
}

// Time formatting helper
const formatTimestamp = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Group activities by date
const groupActivitiesByDate = (activities: Activity[]) => {
  const groups: Record<string, Activity[]> = {}

  activities.forEach(activity => {
    const date = activity.timestamp
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)

    let label: string
    if (diffDays === 0) label = 'Today'
    else if (diffDays === 1) label = 'Yesterday'
    else if (diffDays < 7) label = 'This Week'
    else if (diffDays < 30) label = 'This Month'
    else label = 'Older'

    if (!groups[label]) groups[label] = []
    groups[label].push(activity)
  })

  return groups
}

export default function ActivityFeedPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [newActivityCount, setNewActivityCount] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set())

  // Initialize activities
  useEffect(() => {
    setActivities(generateMockActivities())
  }, [])

  // Auto-refresh simulation
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      // Simulate new activity
      const shouldAddNew = Math.random() > 0.7
      if (shouldAddNew) {
        setNewActivityCount(prev => prev + 1)
        if (soundEnabled) {
          // Play notification sound
          const audio = new Audio('/notification.mp3')
          audio.play().catch(() => {}) // Ignore if sound fails
        }
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, soundEnabled])

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      // Search filter
      const matchesSearch =
        activity.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.user.email.toLowerCase().includes(searchQuery.toLowerCase())

      // Category filter
      const config = activityConfig[activity.type]
      const matchesCategory =
        selectedCategory === 'All' ||
        config.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [activities, searchQuery, selectedCategory])

  // Group filtered activities
  const groupedActivities = useMemo(() => {
    return groupActivitiesByDate(filteredActivities)
  }, [filteredActivities])

  const categories = ['All', 'Users', 'Courses', 'Assessments', 'Workshops', 'Experts', 'Payments', 'System']

  const handleLoadNewActivities = () => {
    setActivities(generateMockActivities())
    setNewActivityCount(0)
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredActivities, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `activity-feed-${new Date().toISOString()}.json`
    link.click()
  }

  const toggleActivitySelection = (id: string) => {
    const newSet = new Set(selectedActivities)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedActivities(newSet)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <DashboardSidebar />

      <div className="lg:ml-[var(--sidebar-width,280px)] min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-white/10 bg-gray-950/95 backdrop-blur-xl">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white font-gendy">Activity Feed</h1>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 bg-green-400 rounded-full"
                    />
                    <span className="text-xs font-semibold text-green-400 font-diatype">Live</span>
                  </div>
                </div>
                <p className="text-gray-400 font-diatype">
                  Real-time activity monitoring across your platform
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Auto Refresh Toggle */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-diatype text-sm font-medium',
                    autoRefresh
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  )}
                >
                  <RefreshCw className={cn('w-4 h-4', autoRefresh && 'animate-spin')} />
                  Auto Refresh
                </motion.button>

                {/* Sound Toggle */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={cn(
                    'p-2 rounded-lg transition-all',
                    soundEnabled
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  )}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </motion.button>

                {/* Export Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 transition-all font-diatype text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Export
                </motion.button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search activities, users, or actions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all font-diatype"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2 p-1 bg-white/5 rounded-lg border border-white/10">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      'px-4 py-2 rounded-md text-sm font-medium transition-all font-diatype',
                      selectedCategory === category
                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* New Activity Banner */}
            <AnimatePresence>
              {newActivityCount > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-500/30">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-purple-400" />
                      <span className="text-sm font-medium text-white font-diatype">
                        {newActivityCount} new {newActivityCount === 1 ? 'activity' : 'activities'} available
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLoadNewActivities}
                      className="px-4 py-2 bg-purple-500 text-white text-sm font-medium rounded-lg font-diatype"
                    >
                      Load New Activities
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Activity Timeline */}
        <main className="p-8">
          <div className="max-w-5xl mx-auto">
            {Object.entries(groupedActivities).map(([dateLabel, dateActivities]) => (
              <div key={dateLabel} className="mb-8">
                {/* Date Header */}
                <div className="sticky top-[180px] z-20 mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-lg">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-semibold text-white font-diatype">{dateLabel}</span>
                    <span className="text-xs text-gray-500 font-diatype">({dateActivities.length})</span>
                  </div>
                </div>

                {/* Activities */}
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-[21px] top-0 bottom-0 w-px bg-gradient-to-b from-purple-500/50 via-blue-500/30 to-transparent" />

                  <div className="space-y-4">
                    {dateActivities.map((activity, index) => {
                      const config = activityConfig[activity.type]
                      const Icon = config.icon
                      const isSelected = selectedActivities.has(activity.id)

                      return (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="relative"
                        >
                          {/* Activity Card */}
                          <motion.div
                            whileHover={{ scale: 1.01, x: 8 }}
                            className={cn(
                              'relative pl-16 pr-6 py-4 rounded-xl border transition-all cursor-pointer group',
                              isSelected
                                ? 'bg-purple-500/10 border-purple-500/30'
                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/30'
                            )}
                            onClick={() => setSelectedActivity(activity)}
                          >
                            {/* Icon */}
                            <div className="absolute left-4 top-4">
                              <div className={cn(
                                'w-10 h-10 rounded-lg flex items-center justify-center border',
                                config.bgColor,
                                config.color,
                                'border-white/10'
                              )}>
                                <Icon className="w-5 h-5" />
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  {/* User Avatar */}
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold font-diatype">
                                    {activity.user.avatar}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-white font-diatype truncate">
                                      {activity.title}
                                    </h3>
                                  </div>

                                  <span className="text-xs text-gray-500 font-diatype whitespace-nowrap">
                                    {formatTimestamp(activity.timestamp)}
                                  </span>
                                </div>

                                <p className="text-sm text-gray-400 font-diatype">
                                  <span className="font-medium text-gray-300">{activity.user.name}</span>
                                  {' '}
                                  {activity.description.replace(activity.user.name, '')}
                                </p>

                                {/* Metadata */}
                                {activity.metadata && (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {activity.metadata.courseName && (
                                      <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/10 rounded text-xs text-purple-400 font-diatype">
                                        <PlayCircle className="w-3 h-3" />
                                        {activity.metadata.courseName}
                                      </div>
                                    )}
                                    {activity.metadata.workshopName && (
                                      <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/10 rounded text-xs text-orange-400 font-diatype">
                                        <Calendar className="w-3 h-3" />
                                        {activity.metadata.workshopName}
                                      </div>
                                    )}
                                    {activity.metadata.expertName && (
                                      <div className="flex items-center gap-1 px-2 py-1 bg-cyan-500/10 rounded text-xs text-cyan-400 font-diatype">
                                        <Users className="w-3 h-3" />
                                        {activity.metadata.expertName}
                                      </div>
                                    )}
                                    {activity.metadata.score !== undefined && (
                                      <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 rounded text-xs text-green-400 font-diatype font-semibold">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Score: {activity.metadata.score}%
                                      </div>
                                    )}
                                    {activity.metadata.amount !== undefined && (
                                      <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 rounded text-xs text-emerald-400 font-diatype font-semibold">
                                        <DollarSign className="w-3 h-3" />
                                        ${activity.metadata.amount}
                                      </div>
                                    )}
                                    {activity.metadata.certificateId && (
                                      <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 rounded text-xs text-yellow-400 font-diatype">
                                        <Award className="w-3 h-3" />
                                        {activity.metadata.certificateId}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* View Details Icon */}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Eye className="w-4 h-4 text-gray-500" />
                              </div>
                            </div>
                          </motion.div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {filteredActivities.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                  <Activity className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 font-gendy">No Activities Found</h3>
                <p className="text-gray-500 font-diatype">
                  Try adjusting your search or filters to see more results
                </p>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* Activity Details Modal */}
      <AnimatePresence>
        {selectedActivity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedActivity(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl border border-white/10 max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    activityConfig[selectedActivity.type].bgColor,
                    activityConfig[selectedActivity.type].color
                  )}>
                    {(() => {
                      const Icon = activityConfig[selectedActivity.type].icon
                      return <Icon className="w-5 h-5" />
                    })()}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white font-gendy">Activity Details</h2>
                    <p className="text-xs text-gray-500 font-diatype">
                      {formatTimestamp(selectedActivity.timestamp)}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedActivity(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </motion.button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                {/* User Info */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 font-diatype">
                    User Information
                  </h3>
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold font-diatype">
                      {selectedActivity.user.avatar}
                    </div>
                    <div>
                      <p className="text-white font-medium font-diatype">{selectedActivity.user.name}</p>
                      <p className="text-sm text-gray-500 font-diatype">{selectedActivity.user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Activity Description */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 font-diatype">
                    Description
                  </h3>
                  <p className="text-gray-300 font-diatype">{selectedActivity.description}</p>
                </div>

                {/* Metadata */}
                {selectedActivity.metadata && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 font-diatype">
                      Additional Information
                    </h3>
                    <div className="space-y-3">
                      {selectedActivity.metadata.ipAddress && (
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500 font-diatype">IP Address</p>
                            <p className="text-sm text-white font-diatype">{selectedActivity.metadata.ipAddress}</p>
                          </div>
                        </div>
                      )}
                      {selectedActivity.metadata.device && (
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                          <Monitor className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500 font-diatype">Device</p>
                            <p className="text-sm text-white font-diatype">{selectedActivity.metadata.device}</p>
                          </div>
                        </div>
                      )}
                      {selectedActivity.metadata.location && (
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500 font-diatype">Location</p>
                            <p className="text-sm text-white font-diatype">{selectedActivity.metadata.location}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-lg font-medium font-diatype"
                  >
                    View User Profile
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-3 bg-white/5 text-gray-300 rounded-lg font-medium font-diatype border border-white/10"
                  >
                    Related Activities
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
