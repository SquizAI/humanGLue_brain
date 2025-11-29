'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Star,
  Clock,
  PlayCircle,
  Calendar,
  Download,
  Printer,
  ChevronDown,
  BookOpen,
  Award,
  Activity,
  Eye,
  CheckCircle2,
  BarChart3,
  Video,
  MessageSquare,
  Target,
  TrendingDown as ArrowDown,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
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

// Mock data for instructor-specific analytics
const revenueData = [
  { month: 'Apr', revenue: 12500, enrollments: 145 },
  { month: 'May', revenue: 15800, enrollments: 178 },
  { month: 'Jun', revenue: 18200, enrollments: 203 },
  { month: 'Jul', revenue: 21600, enrollments: 248 },
  { month: 'Aug', revenue: 24300, enrollments: 287 },
  { month: 'Sep', revenue: 28750, enrollments: 325 },
]

const courseEnrollmentData = [
  { course: 'AI Strategy', enrollments: 487, completions: 423, active: 64 },
  { course: 'Digital Transform', enrollments: 412, completions: 356, active: 56 },
  { course: 'Change Mgmt', enrollments: 389, completions: 342, active: 47 },
  { course: 'Innovation AI', enrollments: 356, completions: 298, active: 58 },
  { course: 'Data Driven', enrollments: 298, completions: 267, active: 31 },
]

const studentEngagementData = [
  { week: 'Week 1', active: 245, completed: 189, watching: 312 },
  { week: 'Week 2', active: 268, completed: 212, watching: 356 },
  { week: 'Week 3', active: 289, completed: 234, watching: 378 },
  { week: 'Week 4', active: 312, completed: 267, watching: 402 },
  { week: 'Week 5', active: 325, completed: 289, watching: 425 },
  { week: 'Week 6', active: 342, completed: 312, watching: 448 },
]

const revenueBreakdownData = [
  { name: 'Course Sales', value: 18500, color: '#8B5CF6' },
  { name: 'Workshop Fees', value: 7200, color: '#3B82F6' },
  { name: 'Consultation', value: 3050, color: '#F59E0B' },
]

const coursePerformanceData = [
  {
    name: 'AI Strategy Fundamentals',
    enrollments: 487,
    completions: 423,
    completionRate: 86.9,
    revenue: 24350,
    rating: 4.8,
    reviews: 156,
    avgWatchTime: 18.5,
  },
  {
    name: 'Digital Transformation Leadership',
    enrollments: 412,
    completions: 356,
    completionRate: 86.4,
    revenue: 20600,
    rating: 4.7,
    reviews: 134,
    avgWatchTime: 16.2,
  },
  {
    name: 'Change Management Mastery',
    enrollments: 389,
    completions: 342,
    completionRate: 87.9,
    revenue: 19450,
    rating: 4.9,
    reviews: 142,
    avgWatchTime: 17.8,
  },
  {
    name: 'Innovation & AI Integration',
    enrollments: 356,
    completions: 298,
    completionRate: 83.7,
    revenue: 17800,
    rating: 4.6,
    reviews: 118,
    avgWatchTime: 15.4,
  },
  {
    name: 'Data-Driven Decision Making',
    enrollments: 298,
    completions: 267,
    completionRate: 89.6,
    revenue: 14900,
    rating: 4.8,
    reviews: 98,
    avgWatchTime: 14.2,
  },
]

const engagementMetricsData = [
  { metric: 'Content Quality', score: 92 },
  { metric: 'Student Support', score: 88 },
  { metric: 'Course Structure', score: 90 },
  { metric: 'Engagement', score: 85 },
  { metric: 'Practical Value', score: 94 },
  { metric: 'Communication', score: 87 },
]

const activityHeatmapData = [
  { day: 'Mon', hours: [8, 12, 18, 25, 32, 28, 22, 18, 15, 12, 10, 6] },
  { day: 'Tue', hours: [7, 14, 20, 28, 35, 30, 25, 20, 16, 11, 9, 5] },
  { day: 'Wed', hours: [9, 16, 22, 30, 38, 33, 27, 21, 17, 12, 11, 7] },
  { day: 'Thu', hours: [10, 18, 24, 32, 40, 35, 29, 23, 19, 14, 12, 8] },
  { day: 'Fri', hours: [11, 19, 26, 34, 42, 37, 31, 25, 20, 15, 13, 9] },
  { day: 'Sat', hours: [6, 10, 14, 18, 22, 20, 16, 12, 9, 6, 5, 3] },
  { day: 'Sun', hours: [4, 7, 10, 13, 16, 14, 11, 8, 6, 4, 3, 2] },
]

type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all'

export default function InstructorAnalyticsPage() {
  const router = useRouter()

  // Trust middleware protection - no need for client-side auth checks
  // Middleware already validates access before page loads  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null)
  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  const handleExportPDF = () => {
    console.log('Exporting report as PDF...')
    // In production, implement PDF generation
    alert('PDF export functionality will be available soon')
  }

  const handleExportCSV = () => {
    console.log('Downloading data as CSV...')
    // In production, implement CSV download
    const csvContent = coursePerformanceData.map(course =>
      `${course.name},${course.enrollments},${course.completionRate},${course.revenue},${course.rating}`
    ).join('\n')

    const blob = new Blob([`Course,Enrollments,Completion Rate,Revenue,Rating\n${csvContent}`], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'instructor-analytics.csv'
    a.click()
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
                <h1 className="text-3xl font-bold text-white mb-2 font-gendy">Instructor Analytics</h1>
                <p className="text-gray-400 font-diatype">Track your courses, revenue, and student engagement</p>
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
                      className="absolute right-0 mt-2 w-48 bg-gray-900 border border-white/10 rounded-lg shadow-xl overflow-hidden z-50"
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
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center gap-2 text-white transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-diatype">CSV</span>
                </motion.button>

                {/* Print Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExportPDF}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center gap-2 text-white transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span className="text-sm font-diatype">PDF</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 space-y-8">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <span>+18.3%</span>
                </div>
              </div>
              <h3 className="text-sm text-gray-400 font-diatype mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold text-white font-gendy mb-2">
                <AnimatedCounter value={28750} prefix="$" />
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

            {/* Total Enrollments */}
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
                  <span>+14.2%</span>
                </div>
              </div>
              <h3 className="text-sm text-gray-400 font-diatype mb-2">Total Enrollments</h3>
              <p className="text-3xl font-bold text-white font-gendy mb-2">
                <AnimatedCounter value={1942} />
              </p>
              <p className="text-sm text-gray-500 font-diatype">across 5 courses</p>
            </motion.div>

            {/* Average Course Rating */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-amber-900/30 to-orange-900/10 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6 group hover:border-amber-500/40 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-500/20 rounded-xl group-hover:scale-110 transition-transform">
                  <Star className="w-6 h-6 text-amber-400" />
                </div>
                <div className="flex items-center gap-1 text-green-400 text-sm font-diatype">
                  <TrendingUp className="w-4 h-4" />
                  <span>+0.2</span>
                </div>
              </div>
              <h3 className="text-sm text-gray-400 font-diatype mb-2">Avg. Course Rating</h3>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-3xl font-bold text-white font-gendy">
                  <AnimatedCounter value={4.8} decimals={1} />
                </p>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'w-4 h-4',
                        star <= 4.8 ? 'fill-amber-400 text-amber-400' : 'text-gray-600'
                      )}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-500 font-diatype">648 total reviews</p>
            </motion.div>

            {/* Total Watch Hours */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-purple-900/30 to-pink-900/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 group hover:border-purple-500/40 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex items-center gap-1 text-green-400 text-sm font-diatype">
                  <TrendingUp className="w-4 h-4" />
                  <span>+22%</span>
                </div>
              </div>
              <h3 className="text-sm text-gray-400 font-diatype mb-2">Total Watch Hours</h3>
              <p className="text-3xl font-bold text-white font-gendy mb-2">
                <AnimatedCounter value={8456} />h
              </p>
              <p className="text-sm text-gray-500 font-diatype">avg. 16.2h per student</p>
            </motion.div>
          </div>

          {/* Revenue and Enrollment Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6 font-gendy">Revenue Trend</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
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
                      stroke="#10B981"
                      strokeWidth={3}
                      fill="url(#revenueGradient)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Revenue Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
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
                      <span className="text-xs text-gray-400 font-diatype">{item.name.split(' ')[0]}</span>
                    </div>
                    <p className="text-lg font-bold text-white font-gendy">
                      ${(item.value / 1000).toFixed(1)}k
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Course Enrollment Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6 font-gendy">Course Enrollment & Completion</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseEnrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="course" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="enrollments" fill="#8B5CF6" name="Enrollments" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="completions" fill="#10B981" name="Completions" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="active" fill="#3B82F6" name="Active" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Student Engagement Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6 font-gendy">Student Engagement Trends</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={studentEngagementData}>
                  <defs>
                    <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="watchingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
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
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="watching"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    fill="url(#watchingGradient)"
                    name="Currently Watching"
                  />
                  <Area
                    type="monotone"
                    dataKey="active"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill="url(#activeGradient)"
                    name="Active Students"
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="#10B981"
                    strokeWidth={2}
                    fill="url(#completedGradient)"
                    name="Completed Lessons"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Student Engagement Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Score Radar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6 font-gendy">Teaching Performance Metrics</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={engagementMetricsData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="metric" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9CA3AF" />
                    <Radar
                      name="Performance"
                      dataKey="score"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.3}
                      strokeWidth={2}
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

            {/* Peak Learning Hours Heatmap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6 font-gendy">Peak Learning Hours</h2>
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
                            className="aspect-square rounded cursor-pointer hover:scale-110 transition-transform"
                            style={{
                              backgroundColor: `rgba(139, 92, 246, ${intensity * 0.8})`,
                            }}
                            title={`${day.day} ${hourIndex * 2}:00 - ${value} students`}
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

          {/* Course Performance Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6 font-gendy">Detailed Course Performance</h2>
            <div className="space-y-3">
              {coursePerformanceData.map((course, index) => (
                <div key={index} className="bg-white/5 rounded-xl overflow-hidden">
                  <div
                    onClick={() => setExpandedCourse(expandedCourse === course.name ? null : course.name)}
                    className="flex items-center gap-4 p-4 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-xl">
                      <PlayCircle className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold font-diatype">{course.name}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-400 font-diatype">
                          {course.enrollments} students
                        </span>
                        <span className="text-sm text-gray-400 font-diatype">
                          {course.completionRate.toFixed(1)}% completion
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-400 font-gendy">
                        ${course.revenue.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-1 text-amber-400 justify-end">
                        <Star className="w-4 h-4 fill-amber-400" />
                        <span className="text-sm font-diatype">{course.rating}</span>
                        <span className="text-xs text-gray-500 font-diatype">({course.reviews})</span>
                      </div>
                    </div>
                    <ChevronDown
                      className={cn(
                        'w-5 h-5 text-gray-400 transition-transform',
                        expandedCourse === course.name && 'rotate-180'
                      )}
                    />
                  </div>

                  {/* Expanded Details */}
                  {expandedCourse === course.name && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-white/10 p-4 bg-black/20"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-blue-400" />
                            <span className="text-xs text-gray-400 font-diatype">Enrollments</span>
                          </div>
                          <p className="text-2xl font-bold text-white font-gendy">{course.enrollments}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            <span className="text-xs text-gray-400 font-diatype">Completions</span>
                          </div>
                          <p className="text-2xl font-bold text-white font-gendy">{course.completions}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-purple-400" />
                            <span className="text-xs text-gray-400 font-diatype">Avg. Watch Time</span>
                          </div>
                          <p className="text-2xl font-bold text-white font-gendy">{course.avgWatchTime}h</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-amber-400" />
                            <span className="text-xs text-gray-400 font-diatype">Completion Rate</span>
                          </div>
                          <p className="text-2xl font-bold text-white font-gendy">{course.completionRate.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-400 font-diatype">{course.reviews} reviews</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={cn(
                                  'w-4 h-4',
                                  star <= course.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-600'
                                )}
                              />
                            ))}
                            <span className="text-sm text-white font-diatype ml-2">{course.rating}/5.0</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Active vs Inactive Students */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6 font-gendy">Student Activity Distribution</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/10 rounded-xl p-6 border border-green-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <Activity className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white font-gendy">Active Students</h3>
                </div>
                <p className="text-4xl font-bold text-white font-gendy mb-2">
                  <AnimatedCounter value={1256} />
                </p>
                <p className="text-sm text-gray-400 font-diatype">64.7% of total enrollments</p>
                <div className="mt-4 bg-gray-800 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '64.7%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                  />
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/10 rounded-xl p-6 border border-amber-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-amber-500/20 rounded-xl">
                    <Eye className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white font-gendy">Recently Active</h3>
                </div>
                <p className="text-4xl font-bold text-white font-gendy mb-2">
                  <AnimatedCounter value={448} />
                </p>
                <p className="text-sm text-gray-400 font-diatype">23.1% logged in last 7 days</p>
                <div className="mt-4 bg-gray-800 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '23.1%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full"
                  />
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/10 rounded-xl p-6 border border-gray-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gray-500/20 rounded-xl">
                    <Users className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white font-gendy">Inactive</h3>
                </div>
                <p className="text-4xl font-bold text-white font-gendy mb-2">
                  <AnimatedCounter value={238} />
                </p>
                <p className="text-sm text-gray-400 font-diatype">12.3% no activity 30+ days</p>
                <div className="mt-4 bg-gray-800 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '12.3%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 h-2 rounded-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
