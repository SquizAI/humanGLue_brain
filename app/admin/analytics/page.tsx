'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Award,
  Clock,
  Target,
  BarChart3,
  Calendar,
  Download,
  Printer,
  ChevronDown,
  PlayCircle,
  Star,
  Video,
  BookOpen,
  Activity,
  CheckCircle2,
  UserCheck,
  Eye,
  MessageSquare,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import { cn } from '@/utils/cn'

// Mock data for charts
const revenueData = [
  { month: 'Jan', revenue: 45000, courses: 25000, workshops: 15000, consultations: 5000 },
  { month: 'Feb', revenue: 52000, courses: 28000, workshops: 18000, consultations: 6000 },
  { month: 'Mar', revenue: 61000, courses: 32000, workshops: 21000, consultations: 8000 },
  { month: 'Apr', revenue: 58000, courses: 30000, workshops: 20000, consultations: 8000 },
  { month: 'May', revenue: 67000, courses: 35000, workshops: 23000, consultations: 9000 },
  { month: 'Jun', revenue: 75000, courses: 40000, workshops: 25000, consultations: 10000 },
  { month: 'Jul', revenue: 82000, courses: 45000, workshops: 27000, consultations: 10000 },
  { month: 'Aug', revenue: 89750, courses: 48000, workshops: 30000, consultations: 11750 },
]

const userGrowthData = [
  { month: 'Jan', users: 1200, active: 980 },
  { month: 'Feb', users: 1450, active: 1180 },
  { month: 'Mar', users: 1680, active: 1360 },
  { month: 'Apr', users: 1920, active: 1550 },
  { month: 'May', users: 2180, active: 1780 },
  { month: 'Jun', users: 2450, active: 2020 },
  { month: 'Jul', users: 2680, active: 2210 },
  { month: 'Aug', users: 2847, active: 2380 },
]

const coursePerformanceData = [
  { name: 'AI Strategy Fundamentals', enrollments: 487, completions: 423, rating: 4.8, revenue: 24350 },
  { name: 'Digital Transformation Leadership', enrollments: 412, completions: 356, rating: 4.7, revenue: 20600 },
  { name: 'Change Management Mastery', enrollments: 389, completions: 342, rating: 4.9, revenue: 19450 },
  { name: 'Innovation & AI Integration', enrollments: 356, completions: 298, rating: 4.6, revenue: 17800 },
  { name: 'Data-Driven Decision Making', enrollments: 298, completions: 267, rating: 4.8, revenue: 14900 },
]

const workshopData = [
  { name: 'AI Implementation Workshop', registered: 45, attended: 42, satisfaction: 4.9, status: 'completed' },
  { name: 'Leadership in Digital Age', registered: 38, attended: 35, satisfaction: 4.7, status: 'completed' },
  { name: 'Change Management Strategies', registered: 52, attended: 0, satisfaction: 0, status: 'upcoming' },
  { name: 'Innovation Frameworks', registered: 41, attended: 0, satisfaction: 0, status: 'upcoming' },
]

const expertPerformanceData = [
  { name: 'Dr. Sarah Chen', consultations: 48, rating: 4.9, hours: 96, utilization: 92 },
  { name: 'James Wilson', consultations: 42, rating: 4.8, hours: 84, utilization: 88 },
  { name: 'Maya Rodriguez', consultations: 39, rating: 4.9, hours: 78, utilization: 85 },
  { name: 'Alex Thompson', consultations: 35, rating: 4.7, hours: 70, utilization: 82 },
  { name: 'Lisa Anderson', consultations: 32, rating: 4.8, hours: 64, utilization: 78 },
]

const assessmentData = [
  { week: 'Week 1', completed: 45 },
  { week: 'Week 2', completed: 52 },
  { week: 'Week 3', completed: 61 },
  { week: 'Week 4', completed: 58 },
  { week: 'Week 5', completed: 67 },
  { week: 'Week 6', completed: 72 },
  { week: 'Week 7', completed: 78 },
  { week: 'Week 8', completed: 84 },
]

const maturityScoresData = [
  { dimension: 'Strategy', score: 72 },
  { dimension: 'Culture', score: 68 },
  { dimension: 'Technology', score: 75 },
  { dimension: 'Data', score: 70 },
  { dimension: 'Processes', score: 65 },
  { dimension: 'Talent', score: 73 },
]

const scoreDistributionData = [
  { level: 'Beginner', count: 342, color: '#EF4444' },
  { level: 'Intermediate', count: 856, color: '#F59E0B' },
  { level: 'Advanced', count: 1124, color: '#10B981' },
  { level: 'Expert', count: 525, color: '#8B5CF6' },
]

const revenueBreakdownData = [
  { name: 'Courses', value: 48000, color: '#8B5CF6' },
  { name: 'Workshops', value: 30000, color: '#3B82F6' },
  { name: 'Consultations', value: 11750, color: '#F59E0B' },
]

const activityHeatmapData = [
  { day: 'Mon', hours: [12, 15, 18, 25, 32, 28, 22, 18, 15, 12, 8, 5] },
  { day: 'Tue', hours: [10, 14, 20, 28, 35, 30, 25, 20, 16, 11, 7, 4] },
  { day: 'Wed', hours: [11, 16, 22, 30, 38, 33, 27, 21, 17, 12, 9, 6] },
  { day: 'Thu', hours: [13, 18, 24, 32, 40, 35, 29, 23, 19, 14, 10, 7] },
  { day: 'Fri', hours: [14, 19, 26, 34, 42, 37, 31, 25, 20, 15, 11, 8] },
  { day: 'Sat', hours: [8, 10, 14, 18, 22, 20, 16, 12, 9, 6, 4, 2] },
  { day: 'Sun', hours: [5, 7, 10, 13, 16, 14, 11, 8, 6, 4, 2, 1] },
]

type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all'

export default function AnalyticsPage() {
  const router = useRouter()
  const { userData } = useChat()
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily')

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

  const handleExport = () => {
    console.log('Exporting data...')
  }

  const handlePrint = () => {
    window.print()
  }

  // Animated counter component
  const AnimatedCounter = ({ value, prefix = '', suffix = '', decimals = 0 }: {
    value: number
    prefix?: string
    suffix?: string
    decimals?: number
  }) => {
    const [count, setCount] = useState(0)

    useEffect(() => {
      const duration = 1000
      const steps = 60
      const increment = value / steps
      let current = 0
      const timer = setInterval(() => {
        current += increment
        if (current >= value) {
          setCount(value)
          clearInterval(timer)
        } else {
          setCount(current)
        }
      }, duration / steps)

      return () => clearInterval(timer)
    }, [value])

    return (
      <span>
        {prefix}
        {count.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        {suffix}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        {/* Header */}
        <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 font-gendy">Platform Analytics</h1>
                <p className="text-gray-400 font-diatype">Comprehensive insights and performance metrics</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Time Range Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center gap-2 text-white transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-diatype">
                      {timeRange === '7d' && 'Last 7 Days'}
                      {timeRange === '30d' && 'Last 30 Days'}
                      {timeRange === '90d' && 'Last 90 Days'}
                      {timeRange === '1y' && 'Last Year'}
                      {timeRange === 'all' && 'All Time'}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showDatePicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 mt-2 w-48 bg-gray-900 border border-white/10 rounded-lg shadow-xl overflow-hidden"
                    >
                      {(['7d', '30d', '90d', '1y', 'all'] as TimeRange[]).map((range) => (
                        <button
                          key={range}
                          onClick={() => {
                            setTimeRange(range)
                            setShowDatePicker(false)
                          }}
                          className={cn(
                            'w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-all font-diatype',
                            timeRange === range ? 'bg-purple-500/10 text-purple-400' : 'text-gray-300'
                          )}
                        >
                          {range === '7d' && 'Last 7 Days'}
                          {range === '30d' && 'Last 30 Days'}
                          {range === '90d' && 'Last 90 Days'}
                          {range === '1y' && 'Last Year'}
                          {range === 'all' && 'All Time'}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* Export Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExport}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center gap-2 text-white transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-diatype">Export</span>
                </motion.button>

                {/* Print Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePrint}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center gap-2 text-white transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span className="text-sm font-diatype">Print</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 space-y-8">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Revenue */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-green-900/30 to-emerald-900/10 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6 group hover:border-green-500/40 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl group-hover:scale-110 transition-transform">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex items-center gap-1 text-green-400 text-sm font-diatype">
                  <TrendingUp className="w-4 h-4" />
                  <span>+18%</span>
                </div>
              </div>
              <h3 className="text-sm text-gray-400 font-diatype mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold text-white font-gendy mb-2">
                <AnimatedCounter value={89750} prefix="$" />
              </p>
              <div className="h-12 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData.slice(-5)}>
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Active Users */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-900/30 to-cyan-900/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 group hover:border-blue-500/40 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex items-center gap-1 text-green-400 text-sm font-diatype">
                  <TrendingUp className="w-4 h-4" />
                  <span>+8.3%</span>
                </div>
              </div>
              <h3 className="text-sm text-gray-400 font-diatype mb-2">Active Users</h3>
              <p className="text-3xl font-bold text-white font-gendy mb-2">
                <AnimatedCounter value={2380} />
              </p>
              <p className="text-sm text-gray-500 font-diatype">of 2,847 total users</p>
            </motion.div>

            {/* Course Completions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-900/30 to-pink-900/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 group hover:border-purple-500/40 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl group-hover:scale-110 transition-transform">
                  <Award className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex items-center gap-1 text-green-400 text-sm font-diatype">
                  <TrendingUp className="w-4 h-4" />
                  <span>+12%</span>
                </div>
              </div>
              <h3 className="text-sm text-gray-400 font-diatype mb-2">Course Completions</h3>
              <p className="text-3xl font-bold text-white font-gendy mb-2">
                <AnimatedCounter value={1686} />
              </p>
              <div className="w-full bg-gray-800 rounded-full h-2 mt-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '87%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                />
              </div>
              <p className="text-sm text-gray-500 font-diatype mt-2">87% of target</p>
            </motion.div>

            {/* Avg Session Duration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-amber-900/30 to-orange-900/10 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6 group hover:border-amber-500/40 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-500/20 rounded-xl group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-amber-400" />
                </div>
                <div className="flex items-center gap-1 text-green-400 text-sm font-diatype">
                  <TrendingUp className="w-4 h-4" />
                  <span>+5 min</span>
                </div>
              </div>
              <h3 className="text-sm text-gray-400 font-diatype mb-2">Avg. Session Duration</h3>
              <p className="text-3xl font-bold text-white font-gendy mb-2">
                <AnimatedCounter value={42} /> min
              </p>
              <p className="text-sm text-gray-500 font-diatype">vs. 37 min last month</p>
            </motion.div>

            {/* Assessment Completion Rate */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-cyan-900/30 to-teal-900/10 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 group hover:border-cyan-500/40 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-cyan-500/20 rounded-xl group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="flex items-center gap-1 text-green-400 text-sm font-diatype">
                  <TrendingUp className="w-4 h-4" />
                  <span>+3%</span>
                </div>
              </div>
              <h3 className="text-sm text-gray-400 font-diatype mb-2">Assessment Completion</h3>
              <p className="text-3xl font-bold text-white font-gendy mb-2">
                <AnimatedCounter value={73} />%
              </p>
              <p className="text-sm text-gray-500 font-diatype">528 completed this month</p>
            </motion.div>

            {/* Expert Consultations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-pink-900/30 to-rose-900/10 backdrop-blur-xl border border-pink-500/20 rounded-2xl p-6 group hover:border-pink-500/40 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-pink-500/20 rounded-xl group-hover:scale-110 transition-transform">
                  <UserCheck className="w-6 h-6 text-pink-400" />
                </div>
                <div className="flex items-center gap-1 text-green-400 text-sm font-diatype">
                  <TrendingUp className="w-4 h-4" />
                  <span>+15%</span>
                </div>
              </div>
              <h3 className="text-sm text-gray-400 font-diatype mb-2">Expert Consultations</h3>
              <p className="text-3xl font-bold text-white font-gendy mb-2">
                <AnimatedCounter value={196} />
              </p>
              <p className="text-sm text-gray-500 font-diatype">392 hours this month</p>
            </motion.div>
          </div>

          {/* Revenue Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Over Time */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6 font-gendy">Revenue Over Time</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: '#F3F4F6' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Revenue Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6 font-gendy">Revenue Breakdown</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueBreakdownData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                {revenueBreakdownData.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-gray-400 font-diatype">{item.name}</span>
                    </div>
                    <p className="text-lg font-bold text-white font-gendy">
                      ${(item.value / 1000).toFixed(0)}k
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Top Revenue Courses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6 font-gendy">Top Revenue Generating Courses</h2>
            <div className="space-y-4">
              {coursePerformanceData.map((course, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-xl">
                    <PlayCircle className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold font-diatype">{course.name}</h3>
                    <p className="text-sm text-gray-400 font-diatype">
                      {course.enrollments} enrollments • {course.completions} completions
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-400 font-gendy">
                      ${course.revenue.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span className="text-sm font-diatype">{course.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* User Engagement Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Users Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white font-gendy">User Growth</h2>
                <div className="flex gap-2">
                  {(['daily', 'weekly', 'monthly'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        'px-3 py-1 rounded-lg text-xs font-diatype transition-all',
                        activeTab === tab
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      )}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      name="Total Users"
                    />
                    <Line
                      type="monotone"
                      dataKey="active"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Active Users"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* User Activity Heatmap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6 font-gendy">Activity Heatmap</h2>
              <div className="space-y-2">
                {activityHeatmapData.map((day, dayIndex) => (
                  <div key={dayIndex} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-12 font-diatype">{day.day}</span>
                    <div className="flex-1 grid grid-cols-12 gap-1">
                      {day.hours.map((value, hourIndex) => {
                        const intensity = Math.min(value / 40, 1)
                        return (
                          <div
                            key={hourIndex}
                            className="aspect-square rounded"
                            style={{
                              backgroundColor: `rgba(139, 92, 246, ${intensity * 0.8})`,
                            }}
                            title={`${value} active users`}
                          />
                        )
                      })}
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                  <span className="text-xs text-gray-500 font-diatype">12 AM</span>
                  <span className="text-xs text-gray-500 font-diatype">6 AM</span>
                  <span className="text-xs text-gray-500 font-diatype">12 PM</span>
                  <span className="text-xs text-gray-500 font-diatype">6 PM</span>
                  <span className="text-xs text-gray-500 font-diatype">12 AM</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Top Engaged Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6 font-gendy">Top Engaged Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-white/10">
                    <th className="pb-3 text-sm font-semibold text-gray-400 font-diatype">Rank</th>
                    <th className="pb-3 text-sm font-semibold text-gray-400 font-diatype">User</th>
                    <th className="pb-3 text-sm font-semibold text-gray-400 font-diatype">Courses</th>
                    <th className="pb-3 text-sm font-semibold text-gray-400 font-diatype">Hours</th>
                    <th className="pb-3 text-sm font-semibold text-gray-400 font-diatype">Assessments</th>
                    <th className="pb-3 text-sm font-semibold text-gray-400 font-diatype">Engagement</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Sarah Mitchell', courses: 8, hours: 156, assessments: 12, engagement: 98 },
                    { name: 'Michael Chen', courses: 7, hours: 142, assessments: 10, engagement: 95 },
                    { name: 'Emily Rodriguez', courses: 6, hours: 128, assessments: 9, engagement: 92 },
                    { name: 'David Kim', courses: 6, hours: 118, assessments: 8, engagement: 88 },
                    { name: 'Lisa Anderson', courses: 5, hours: 105, assessments: 7, engagement: 85 },
                  ].map((user, index) => (
                    <tr
                      key={index}
                      className="border-b border-white/5 hover:bg-white/5 transition-all"
                    >
                      <td className="py-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full text-white text-sm font-bold font-gendy">
                          {index + 1}
                        </div>
                      </td>
                      <td className="py-4 text-white font-diatype">{user.name}</td>
                      <td className="py-4 text-gray-300 font-diatype">{user.courses}</td>
                      <td className="py-4 text-gray-300 font-diatype">{user.hours}h</td>
                      <td className="py-4 text-gray-300 font-diatype">{user.assessments}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-800 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                              style={{ width: `${user.engagement}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-300 font-diatype w-12">{user.engagement}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Course Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6 font-gendy">Course Performance Analytics</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coursePerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" style={{ fontSize: '10px' }} angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="enrollments" fill="#8B5CF6" name="Enrollments" />
                  <Bar dataKey="completions" fill="#10B981" name="Completions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Workshop Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6 font-gendy">Workshop Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workshopData.map((workshop, index) => (
                <div
                  key={index}
                  className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Video className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold font-diatype">{workshop.name}</h3>
                        <span
                          className={cn(
                            'inline-block px-2 py-0.5 text-xs rounded-full font-diatype mt-1',
                            workshop.status === 'completed'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-blue-500/20 text-blue-400'
                          )}
                        >
                          {workshop.status === 'completed' ? 'Completed' : 'Upcoming'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-gray-400 font-diatype">Registered</p>
                      <p className="text-xl font-bold text-white font-gendy">{workshop.registered}</p>
                    </div>
                    {workshop.status === 'completed' && (
                      <>
                        <div>
                          <p className="text-xs text-gray-400 font-diatype">Attended</p>
                          <p className="text-xl font-bold text-white font-gendy">{workshop.attended}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-400 font-diatype mb-2">Satisfaction Score</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-800 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full"
                                style={{ width: `${(workshop.satisfaction / 5) * 100}%` }}
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                              <span className="text-sm text-white font-diatype">{workshop.satisfaction}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Expert Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6 font-gendy">Expert Performance</h2>
            <div className="space-y-4">
              {expertPerformanceData.map((expert, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full text-white text-lg font-bold font-gendy">
                    {expert.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold font-diatype">{expert.name}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-400 font-diatype">
                        {expert.consultations} consultations
                      </span>
                      <span className="text-sm text-gray-400 font-diatype">
                        {expert.hours}h logged
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-amber-400 mb-1">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span className="font-semibold font-diatype">{expert.rating}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                          style={{ width: `${expert.utilization}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 font-diatype">{expert.utilization}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Assessment Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assessments Completed Over Time */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6 font-gendy">Assessments Completed</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={assessmentData}>
                    <defs>
                      <linearGradient id="assessmentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="week" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      fill="url(#assessmentGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Average Maturity Scores */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6 font-gendy">Avg. Maturity Scores</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={maturityScoresData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="dimension" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9CA3AF" />
                    <Radar
                      name="Maturity Score"
                      dataKey="score"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.3}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Score Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6 font-gendy">Score Distribution</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {scoreDistributionData.map((level, index) => (
                <div
                  key={index}
                  className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                  style={{ borderLeft: `4px solid ${level.color}` }}
                >
                  <h3 className="text-sm text-gray-400 font-diatype mb-2">{level.level}</h3>
                  <p className="text-3xl font-bold text-white font-gendy mb-2">{level.count}</p>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${(level.count / 2847) * 100}%`,
                        backgroundColor: level.color,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 font-diatype mt-2">
                    {((level.count / 2847) * 100).toFixed(1)}% of users
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
