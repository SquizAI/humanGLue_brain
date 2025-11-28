'use client'

import { motion } from 'framer-motion'
import { Users, Calendar, DollarSign, Clock, TrendingUp, Star, CheckCircle, ArrowRight, Video, FileText } from 'lucide-react'
import Link from 'next/link'

interface ExpertDashboardData {
  expert: {
    name: string
    title: string
    rating: number
    totalReviews: number
  }
  engagements: {
    active: Array<{
      id: string
      clientName: string
      companyName: string
      focusArea: string
      hoursUsed: number
      hoursTotal: number
      nextSession: string
      status: 'active' | 'paused' | 'completed'
    }>
    totalActive: number
    totalCompleted: number
  }
  availability: {
    nextAvailable: string
    hoursThisWeek: number
    hoursThisMonth: number
    availableHours: number
  }
  earnings: {
    thisMonth: number
    lastMonth: number
    pending: number
    hourlyRate: number
  }
  upcomingSessions: Array<{
    id: string
    clientName: string
    scheduledTime: string
    duration: number
    topic: string
  }>
}

const MOCK_DATA: ExpertDashboardData = {
  expert: {
    name: 'Dr. Sarah Chen',
    title: 'AI Strategy & Implementation Expert',
    rating: 4.9,
    totalReviews: 47,
  },
  engagements: {
    active: [
      {
        id: '1',
        clientName: 'Michael Rodriguez',
        companyName: 'Tech Innovations Inc',
        focusArea: 'AI Implementation Strategy',
        hoursUsed: 8,
        hoursTotal: 20,
        nextSession: '2025-11-30T14:00:00',
        status: 'active',
      },
      {
        id: '2',
        clientName: 'Jennifer Park',
        companyName: 'Global Solutions Ltd',
        focusArea: 'Team AI Transformation',
        hoursUsed: 15,
        hoursTotal: 30,
        nextSession: '2025-12-02T10:00:00',
        status: 'active',
      },
    ],
    totalActive: 5,
    totalCompleted: 32,
  },
  availability: {
    nextAvailable: '2025-11-29T09:00:00',
    hoursThisWeek: 12,
    hoursThisMonth: 48,
    availableHours: 20,
  },
  earnings: {
    thisMonth: 14400,
    lastMonth: 12800,
    pending: 4800,
    hourlyRate: 300,
  },
  upcomingSessions: [
    {
      id: '1',
      clientName: 'Michael Rodriguez',
      scheduledTime: '2025-11-30T14:00:00',
      duration: 60,
      topic: 'AI Tool Selection Workshop',
    },
    {
      id: '2',
      clientName: 'Jennifer Park',
      scheduledTime: '2025-12-02T10:00:00',
      duration: 90,
      topic: 'Leadership Buy-in Strategy',
    },
  ],
}

export function ExpertDashboard({ data = MOCK_DATA }: { data?: ExpertDashboardData }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(dateString))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 py-12 px-6">
      <div className="container max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome back, {data.expert.name.split(' ')[0]}
              </h1>
              <p className="text-lg text-gray-300">
                {data.expert.title}
              </p>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold">
              <Star className="w-5 h-5 fill-current" />
              <span>{data.expert.rating}</span>
              <span className="text-sm text-amber-100">({data.expert.totalReviews} reviews)</span>
            </div>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <MetricCard
            icon={Users}
            label="Active Clients"
            value={data.engagements.totalActive}
            color="purple"
          />
          <MetricCard
            icon={Clock}
            label="Hours This Month"
            value={data.availability.hoursThisMonth}
            color="blue"
          />
          <MetricCard
            icon={DollarSign}
            label="Earnings This Month"
            value={formatCurrency(data.earnings.thisMonth)}
            trend={data.earnings.thisMonth > data.earnings.lastMonth ? 'up' : 'down'}
            color="green"
          />
          <MetricCard
            icon={Calendar}
            label="Available Hours"
            value={data.availability.availableHours}
            color="amber"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Active Engagements */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Client Engagements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-xl bg-white/5 border border-gray-700 rounded-3xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Active Engagements</h2>
                <Link href="/expert/clients">
                  <button className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1">
                    View All <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>

              <div className="space-y-4">
                {data.engagements.active.map((engagement) => (
                  <div key={engagement.id} className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-semibold text-lg">{engagement.clientName}</h3>
                        <p className="text-gray-400 text-sm">{engagement.companyName}</p>
                        <p className="text-purple-300 text-sm mt-1">{engagement.focusArea}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-semibold">
                        Active
                      </span>
                    </div>

                    {/* Hours Progress */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Hours Used</span>
                        <span className="text-purple-300 font-medium">
                          {engagement.hoursUsed} / {engagement.hoursTotal}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                          style={{ width: `${(engagement.hoursUsed / engagement.hoursTotal) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-400">
                      <Calendar className="w-4 h-4 mr-2" />
                      Next session: {formatDateTime(engagement.nextSession)}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Earnings Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="backdrop-blur-xl bg-white/5 border border-gray-700 rounded-3xl p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Earnings Overview</h2>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                  <div className="text-gray-400 text-sm mb-1">This Month</div>
                  <div className="text-white font-bold text-2xl">{formatCurrency(data.earnings.thisMonth)}</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                  <div className="text-gray-400 text-sm mb-1">Last Month</div>
                  <div className="text-white font-bold text-2xl">{formatCurrency(data.earnings.lastMonth)}</div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                  <div className="text-gray-400 text-sm mb-1">Pending</div>
                  <div className="text-white font-bold text-2xl">{formatCurrency(data.earnings.pending)}</div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-white/5 border border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Your hourly rate</span>
                  <span className="text-white font-bold text-xl">{formatCurrency(data.earnings.hourlyRate)}/hr</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Upcoming & Quick Actions */}
          <div className="space-y-8">
            {/* Upcoming Sessions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="backdrop-blur-xl bg-white/5 border border-gray-700 rounded-3xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Upcoming Sessions</h3>
                <Link href="/expert/schedule">
                  <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                    View Calendar
                  </button>
                </Link>
              </div>

              <div className="space-y-4">
                {data.upcomingSessions.map((session) => (
                  <div key={session.id} className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                    <div className="flex items-start gap-2 mb-2">
                      <Video className="w-4 h-4 text-blue-400 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">{session.clientName}</h4>
                        <p className="text-sm text-gray-400 mt-1">{session.topic}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                      <span className="text-sm text-blue-300">{formatDateTime(session.scheduledTime)}</span>
                      <span className="text-sm text-gray-400">{session.duration} min</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="backdrop-blur-xl bg-white/5 border border-gray-700 rounded-3xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>

              <div className="space-y-3">
                <Link href="/expert/availability">
                  <button className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-gray-700 hover:border-purple-500/50 text-left transition-all duration-200 group">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">Update Availability</span>
                      <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </Link>

                <Link href="/expert/profile">
                  <button className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-gray-700 hover:border-blue-500/50 text-left transition-all duration-200 group">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">Edit Profile</span>
                      <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </Link>

                <Link href="/expert/resources">
                  <button className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-gray-700 hover:border-green-500/50 text-left transition-all duration-200 group">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">Manage Resources</span>
                      <ArrowRight className="w-5 h-5 text-green-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  trend,
  color,
}: {
  icon: any
  label: string
  value: number | string
  trend?: 'up' | 'down'
  color: 'purple' | 'blue' | 'green' | 'amber'
}) {
  const colorConfig = {
    purple: 'from-purple-500/10 to-purple-600/10 border-purple-500/20 text-purple-400',
    blue: 'from-blue-500/10 to-blue-600/10 border-blue-500/20 text-blue-400',
    green: 'from-green-500/10 to-green-600/10 border-green-500/20 text-green-400',
    amber: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`p-6 rounded-2xl bg-gradient-to-br ${colorConfig[color]} border backdrop-blur-xl`}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className={`w-8 h-8 ${colorConfig[color].split(' ')[3]}`} />
        {trend && (
          <div className={`text-sm font-medium ${
            trend === 'up' ? 'text-green-400' : 'text-red-400'
          }`}>
            {trend === 'up' ? '↑' : '↓'}
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-1">
        {value}
      </div>
      <div className="text-sm text-gray-400">{label}</div>
    </motion.div>
  )
}
