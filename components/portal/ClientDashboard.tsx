'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Calendar, Users, BookOpen, DollarSign, Target, Award, ArrowRight, CheckCircle, Clock } from 'lucide-react'
import { AdaptabilityScore } from '@/components/ui/AdaptabilityScore'
import Link from 'next/link'

interface DashboardData {
  client: {
    companyName: string
    subscriptionTier: 'starter' | 'growth' | 'enterprise'
  }
  adaptability: {
    overallScore: number
    lastAssessment: string
    trend: 'up' | 'down' | 'stable'
    employeesAssessed: number
    dimensions: Array<{
      name: string
      score: number
      change: number
    }>
  }
  workshops: {
    upcoming: Array<{
      id: string
      title: string
      date: string
      instructor: string
    }>
    completed: number
    certificates: number
  }
  engagements: {
    active: Array<{
      id: string
      expertName: string
      focusArea: string
      hoursUsed: number
      hoursTotal: number
      status: 'active' | 'paused' | 'completed'
    }>
    totalHoursUsed: number
    totalHoursBudget: number
  }
  transformation: {
    employeesAssessed: number
    behaviorsEmbedded: string[]
    roi: {
      projected: number
      actual: number
    }
    milestones: Array<{
      title: string
      status: 'completed' | 'inProgress' | 'upcoming'
      dueDate: string
    }>
  }
}

const MOCK_DATA: DashboardData = {
  client: {
    companyName: 'Acme Corporation',
    subscriptionTier: 'growth',
  },
  adaptability: {
    overallScore: 72,
    lastAssessment: '2 weeks ago',
    trend: 'up',
    employeesAssessed: 45,
    dimensions: [
      { name: 'Individual', score: 75, change: +5 },
      { name: 'Leadership', score: 68, change: +8 },
      { name: 'Cultural', score: 70, change: +3 },
      { name: 'Embedding', score: 73, change: +4 },
      { name: 'Velocity', score: 74, change: +2 },
    ],
  },
  workshops: {
    upcoming: [
      {
        id: '1',
        title: 'From Fear to Confidence: AI Transformation Mindset',
        date: '2025-10-15',
        instructor: 'Dr. Sarah Chen',
      },
      {
        id: '2',
        title: 'Embedding AI Behaviors That Stick',
        date: '2025-10-22',
        instructor: 'Marcus Johnson',
      },
    ],
    completed: 8,
    certificates: 6,
  },
  engagements: {
    active: [
      {
        id: '1',
        expertName: 'Dr. Alex Thompson',
        focusArea: 'AI Strategy Implementation',
        hoursUsed: 45,
        hoursTotal: 80,
        status: 'active',
      },
    ],
    totalHoursUsed: 120,
    totalHoursBudget: 200,
  },
  transformation: {
    employeesAssessed: 245,
    behaviorsEmbedded: ['Daily AI tool usage', 'Weekly knowledge sharing', 'Peer coaching'],
    roi: {
      projected: 3.5,
      actual: 2.8,
    },
    milestones: [
      { title: 'Complete organization-wide assessment', status: 'completed', dueDate: '2025-09-01' },
      { title: 'Launch reframing workshops', status: 'completed', dueDate: '2025-09-15' },
      { title: 'Implement AI coaching nudges', status: 'inProgress', dueDate: '2025-10-15' },
      { title: 'Achieve 80% behavior adoption', status: 'upcoming', dueDate: '2025-11-30' },
    ],
  },
}

export function ClientDashboard({ data = MOCK_DATA }: { data?: DashboardData }) {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return 'from-purple-500 to-pink-500'
      case 'growth':
        return 'from-blue-500 to-purple-500'
      default:
        return 'from-blue-500 to-cyan-500'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/10 to-gray-900 py-12 px-6">
      <div className="container max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome back, {data.client.companyName}
              </h1>
              <p className="text-lg text-gray-300">
                Your transformation journey at a glance
              </p>
            </div>
            <div className={`px-6 py-3 rounded-full bg-gradient-to-r ${getTierColor(data.client.subscriptionTier)} text-white font-semibold`}>
              {data.client.subscriptionTier.charAt(0).toUpperCase() + data.client.subscriptionTier.slice(1)} Plan
            </div>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <MetricCard
            icon={TrendingUp}
            label="Adaptability Score"
            value={data.adaptability.overallScore}
            suffix="/100"
            trend={data.adaptability.trend}
            color="blue"
          />
          <MetricCard
            icon={Users}
            label="Employees Assessed"
            value={data.adaptability.employeesAssessed}
            color="purple"
          />
          <MetricCard
            icon={BookOpen}
            label="Workshops Completed"
            value={data.workshops.completed}
            color="amber"
          />
          <MetricCard
            icon={DollarSign}
            label="Actual ROI"
            value={data.transformation.roi.actual}
            suffix="x"
            color="green"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Adaptability & Transformation */}
          <div className="lg:col-span-2 space-y-8">
            {/* Adaptability Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-xl bg-white/5 border border-gray-700 rounded-3xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Adaptability Dimensions</h2>
                <Link href="/dashboard/assessments">
                  <button className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1">
                    View Details <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>

              <div className="grid md:grid-cols-5 gap-6">
                {data.adaptability.dimensions.map((dim, index) => (
                  <div key={index} className="text-center">
                    <AdaptabilityScore score={dim.score} label={dim.name} size="sm" />
                    <div className={`text-sm mt-2 ${dim.change > 0 ? 'text-green-400' : dim.change < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {dim.change > 0 ? '+' : ''}{dim.change}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Transformation Milestones */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="backdrop-blur-xl bg-white/5 border border-gray-700 rounded-3xl p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Transformation Roadmap</h2>

              <div className="space-y-4">
                {data.transformation.milestones.map((milestone, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-gray-700">
                    <div className="flex-shrink-0 mt-1">
                      {milestone.status === 'completed' ? (
                        <CheckCircle className="w-6 h-6 text-green-400 fill-current" />
                      ) : milestone.status === 'inProgress' ? (
                        <Clock className="w-6 h-6 text-amber-400" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-white">{milestone.title}</h3>
                        <span className="text-sm text-gray-400">{milestone.dueDate}</span>
                      </div>
                      <div className={`text-sm ${
                        milestone.status === 'completed' ? 'text-green-400' :
                        milestone.status === 'inProgress' ? 'text-amber-400' :
                        'text-gray-400'
                      }`}>
                        {milestone.status === 'completed' ? 'Completed' :
                         milestone.status === 'inProgress' ? 'In Progress' :
                         'Upcoming'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Behaviors Embedded */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="backdrop-blur-xl bg-white/5 border border-gray-700 rounded-3xl p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Behaviors Being Embedded</h2>

              <div className="grid md:grid-cols-3 gap-4">
                {data.transformation.behaviorsEmbedded.map((behavior, index) => (
                  <div key={index} className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                    <CheckCircle className="w-6 h-6 text-blue-400 mb-3" />
                    <div className="text-white font-medium">{behavior}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Upcoming & Active */}
          <div className="space-y-8">
            {/* Upcoming Workshops */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="backdrop-blur-xl bg-white/5 border border-gray-700 rounded-3xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Upcoming Workshops</h3>
                <Link href="/dashboard/workshops">
                  <button className="text-amber-400 hover:text-amber-300 text-sm font-medium">
                    View All
                  </button>
                </Link>
              </div>

              <div className="space-y-4">
                {data.workshops.upcoming.map((workshop) => (
                  <div key={workshop.id} className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                    <div className="flex items-start gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-amber-400 mt-0.5" />
                      <span className="text-sm text-amber-300">{workshop.date}</span>
                    </div>
                    <h4 className="text-white font-semibold mb-1">{workshop.title}</h4>
                    <p className="text-sm text-gray-400">with {workshop.instructor}</p>
                  </div>
                ))}
              </div>

              <Link href="/workshops">
                <button className="w-full mt-4 px-6 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-lg hover:shadow-amber-500/50 transition-all duration-300">
                  Browse More Workshops
                </button>
              </Link>
            </motion.div>

            {/* Active Engagements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="backdrop-blur-xl bg-white/5 border border-gray-700 rounded-3xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Active Engagements</h3>
                <Link href="/dashboard/talent">
                  <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                    View All
                  </button>
                </Link>
              </div>

              <div className="space-y-4">
                {data.engagements.active.map((engagement) => (
                  <div key={engagement.id} className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                    <h4 className="text-white font-semibold mb-2">{engagement.expertName}</h4>
                    <p className="text-sm text-gray-400 mb-3">{engagement.focusArea}</p>

                    {/* Hours Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Hours Used</span>
                        <span className="text-purple-300 font-medium">
                          {engagement.hoursUsed} / {engagement.hoursTotal}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          style={{ width: `${(engagement.hoursUsed / engagement.hoursTotal) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/talent">
                <button className="w-full mt-4 px-6 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300">
                  Find More Experts
                </button>
              </Link>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="backdrop-blur-xl bg-white/5 border border-gray-700 rounded-3xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>

              <div className="space-y-3">
                <Link href="/dashboard/assessments/new">
                  <button className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-gray-700 hover:border-blue-500/50 text-left transition-all duration-200 group">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">Take New Assessment</span>
                      <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </Link>

                <Link href="/dashboard/team">
                  <button className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-gray-700 hover:border-purple-500/50 text-left transition-all duration-200 group">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">Manage Team</span>
                      <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </Link>

                <Link href="/dashboard/billing">
                  <button className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-gray-700 hover:border-green-500/50 text-left transition-all duration-200 group">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">View Billing</span>
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
  suffix = '',
  trend,
  color,
}: {
  icon: any
  label: string
  value: number
  suffix?: string
  trend?: 'up' | 'down' | 'stable'
  color: 'blue' | 'purple' | 'amber' | 'green'
}) {
  const colorConfig = {
    blue: 'from-blue-500/10 to-blue-600/10 border-blue-500/20 text-blue-400',
    purple: 'from-purple-500/10 to-purple-600/10 border-purple-500/20 text-purple-400',
    amber: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-400',
    green: 'from-green-500/10 to-green-600/10 border-green-500/20 text-green-400',
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
            trend === 'up' ? 'text-green-400' :
            trend === 'down' ? 'text-red-400' :
            'text-gray-400'
          }`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-1">
        {value}{suffix}
      </div>
      <div className="text-sm text-gray-400">{label}</div>
    </motion.div>
  )
}
