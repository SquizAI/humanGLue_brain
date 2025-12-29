'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner'
import { Button } from '@/components/atoms/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card'
import { Text, Heading } from '@/components/atoms/Text'
import { signOut } from '@/lib/auth/hooks'
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
import { chartColors, chartSemanticColors, chartTooltipStyle } from '@/lib/chart-colors'

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
  { level: 'Beginner', count: 342, color: chartSemanticColors.beginner },
  { level: 'Intermediate', count: 856, color: chartSemanticColors.intermediate },
  { level: 'Advanced', count: 1124, color: chartSemanticColors.advanced },
  { level: 'Expert', count: 525, color: chartSemanticColors.expert },
]

const revenueBreakdownData = [
  { name: 'Courses', value: 48000, color: chartSemanticColors.courses },
  { name: 'Workshops', value: 30000, color: chartSemanticColors.workshops },
  { name: 'Consultations', value: 11750, color: chartSemanticColors.consultations },
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
  const { userData, authLoading } = useChat()
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (!authLoading && userData?.isAdmin) {
      setShowContent(true)
      return
    }

    const timeout = setTimeout(() => {
      console.log('[AnalyticsPage] Auth timeout - trusting middleware protection')
      setShowContent(true)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [authLoading, userData])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      await signOut()
      localStorage.removeItem('humanglue_user')
      localStorage.removeItem('demoUser')
      document.cookie = 'demoUser=; path=/; max-age=0'
      localStorage.removeItem('sb-egqqdscvxvtwcdwknbnt-auth-token')
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      window.location.href = '/login'
    }
  }

  if (!showContent) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--hg-bg-primary)' }}>
        <DashboardSidebar onLogout={handleLogout} />
        <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 flex items-center justify-center min-h-screen">
          <LoadingSpinner variant="neural" size="xl" text="Loading analytics..." />
        </div>
      </div>
    )
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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--hg-bg-primary)' }}>
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        {/* Header */}
        <div className="border-b sticky top-0 z-30 hg-bg-sidebar hg-border">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <Heading as="h1" size="3xl" className="mb-2">Platform Analytics</Heading>
                <Text variant="muted">Comprehensive insights and performance metrics</Text>
              </div>
              <div className="flex items-center gap-3">
                {/* Time Range Selector */}
                <div className="relative">
                  <Button
                    variant="secondary"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    icon={<Calendar className="w-4 h-4" />}
                  >
                    {timeRange === '7d' && 'Last 7 Days'}
                    {timeRange === '30d' && 'Last 30 Days'}
                    {timeRange === '90d' && 'Last 90 Days'}
                    {timeRange === '1y' && 'Last Year'}
                    {timeRange === 'all' && 'All Time'}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>

                  {showDatePicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 mt-2 w-48 hg-border border rounded-lg shadow-xl overflow-hidden hg-bg-card z-50"
                    >
                      {(['7d', '30d', '90d', '1y', 'all'] as TimeRange[]).map((range) => (
                        <button
                          key={range}
                          onClick={() => {
                            setTimeRange(range)
                            setShowDatePicker(false)
                          }}
                          className={cn(
                            'w-full px-4 py-2 text-left text-sm transition-all',
                            timeRange === range ? 'bg-[var(--hg-cyan-bg)] text-[var(--hg-cyan-text)]' : 'hg-text-secondary hover:hg-bg-secondary'
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
                <Button
                  variant="secondary"
                  onClick={handleExport}
                  icon={<Download className="w-4 h-4" />}
                >
                  Export
                </Button>

                {/* Print Button */}
                <Button
                  variant="secondary"
                  onClick={handlePrint}
                  icon={<Printer className="w-4 h-4" />}
                >
                  Print
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 space-y-8">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Revenue */}
            <Card animate hover variant="glass" padding="lg" className="group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl group-hover:scale-110 transition-transform bg-[var(--hg-cyan-bg)]">
                  <DollarSign className="w-6 h-6 text-[var(--hg-cyan-text)]" />
                </div>
                <Text variant="cyan" size="sm" className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>+18%</span>
                </Text>
              </div>
              <Text variant="muted" size="sm" className="mb-2">Total Revenue</Text>
              <Heading as="h3" size="3xl" className="mb-2">
                <AnimatedCounter value={89750} prefix="$" />
              </Heading>
              <div className="h-12 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData.slice(-5)}>
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke={chartColors.tertiary}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Active Users */}
            <Card animate hover variant="glass" padding="lg" className="group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl group-hover:scale-110 transition-transform bg-[var(--hg-cyan-bg)]">
                  <Users className="w-6 h-6 text-[var(--hg-cyan-text)]" />
                </div>
                <Text variant="cyan" size="sm" className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>+8.3%</span>
                </Text>
              </div>
              <Text variant="muted" size="sm" className="mb-2">Active Users</Text>
              <Heading as="h3" size="3xl" className="mb-2">
                <AnimatedCounter value={2380} />
              </Heading>
              <Text variant="muted" size="sm">of 2,847 total users</Text>
            </Card>

            {/* Course Completions */}
            <Card animate hover variant="glass" padding="lg" className="group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl group-hover:scale-110 transition-transform bg-[var(--hg-cyan-bg)]">
                  <Award className="w-6 h-6 text-[var(--hg-cyan-text)]" />
                </div>
                <Text variant="cyan" size="sm" className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>+12%</span>
                </Text>
              </div>
              <Text variant="muted" size="sm" className="mb-2">Course Completions</Text>
              <Heading as="h3" size="3xl" className="mb-2">
                <AnimatedCounter value={1686} />
              </Heading>
              <div className="w-full rounded-full h-2 mt-4 hg-bg-secondary">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '87%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                />
              </div>
              <Text variant="muted" size="sm" className="mt-2">87% of target</Text>
            </Card>

            {/* Avg Session Duration */}
            <Card animate hover variant="glass" padding="lg" className="group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl group-hover:scale-110 transition-transform bg-amber-500/10">
                  <Clock className="w-6 h-6 text-amber-400" />
                </div>
                <Text variant="cyan" size="sm" className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>+5 min</span>
                </Text>
              </div>
              <Text variant="muted" size="sm" className="mb-2">Avg. Session Duration</Text>
              <Heading as="h3" size="3xl" className="mb-2">
                <AnimatedCounter value={42} /> min
              </Heading>
              <Text variant="muted" size="sm">vs. 37 min last month</Text>
            </Card>

            {/* Assessment Completion Rate */}
            <Card animate hover variant="glass" padding="lg" className="group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl group-hover:scale-110 transition-transform bg-[var(--hg-cyan-bg)]">
                  <CheckCircle2 className="w-6 h-6 text-[var(--hg-cyan-text)]" />
                </div>
                <Text variant="cyan" size="sm" className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>+3%</span>
                </Text>
              </div>
              <Text variant="muted" size="sm" className="mb-2">Assessment Completion</Text>
              <Heading as="h3" size="3xl" className="mb-2">
                <AnimatedCounter value={73} />%
              </Heading>
              <Text variant="muted" size="sm">528 completed this month</Text>
            </Card>

            {/* Expert Consultations */}
            <Card animate hover variant="glass" padding="lg" className="group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl group-hover:scale-110 transition-transform bg-[var(--hg-cyan-bg)]">
                  <UserCheck className="w-6 h-6 text-[var(--hg-cyan-text)]" />
                </div>
                <Text variant="cyan" size="sm" className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>+15%</span>
                </Text>
              </div>
              <Text variant="muted" size="sm" className="mb-2">Expert Consultations</Text>
              <Heading as="h3" size="3xl" className="mb-2">
                <AnimatedCounter value={196} />
              </Heading>
              <Text variant="muted" size="sm">392 hours this month</Text>
            </Card>
          </div>

          {/* Revenue Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Over Time */}
            <Card animate variant="glass" padding="lg">
              <Heading as="h2" size="xl" className="mb-6">Revenue Over Time</Heading>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis dataKey="month" stroke={chartColors.axis} style={{ fontSize: '12px' }} />
                    <YAxis stroke={chartColors.axis} style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      labelStyle={{ color: chartColors.tooltipText }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke={chartColors.primary}
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Revenue Breakdown */}
            <Card animate variant="glass" padding="lg">
              <Heading as="h2" size="xl" className="mb-6">Revenue Breakdown</Heading>
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
                      fill={chartColors.primary}
                      dataKey="value"
                    >
                      {revenueBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle} />
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
                      <Text variant="muted" size="xs">{item.name}</Text>
                    </div>
                    <Heading as="h4" size="lg">
                      ${(item.value / 1000).toFixed(0)}k
                    </Heading>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Top Revenue Courses */}
          <Card animate variant="glass" padding="lg">
            <Heading as="h2" size="xl" className="mb-6">Top Revenue Generating Courses</Heading>
            <div className="space-y-4">
              {coursePerformanceData.map((course, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl transition-all hg-bg-secondary"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--hg-cyan-bg)]">
                    <PlayCircle className="w-6 h-6 text-[var(--hg-cyan-text)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Text weight="semibold">{course.name}</Text>
                    <Text variant="muted" size="sm">
                      {course.enrollments} enrollments • {course.completions} completions
                    </Text>
                  </div>
                  <div className="text-right">
                    <Text variant="cyan" size="lg" weight="bold">
                      ${course.revenue.toLocaleString()}
                    </Text>
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <Text size="sm" className="text-amber-400">{course.rating}</Text>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* User Engagement Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Users Chart */}
            <Card animate variant="glass" padding="lg">
              <div className="flex items-center justify-between mb-6">
                <Heading as="h2" size="xl">User Growth</Heading>
                <div className="flex gap-2">
                  {(['daily', 'weekly', 'monthly'] as const).map((tab) => (
                    <Button
                      key={tab}
                      variant={activeTab === tab ? 'cyan' : 'secondary'}
                      size="sm"
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis dataKey="month" stroke={chartColors.axis} style={{ fontSize: '12px' }} />
                    <YAxis stroke={chartColors.axis} style={{ fontSize: '12px' }} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke={chartSemanticColors.total}
                      strokeWidth={2}
                      name="Total Users"
                    />
                    <Line
                      type="monotone"
                      dataKey="active"
                      stroke={chartSemanticColors.active}
                      strokeWidth={2}
                      name="Active Users"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* User Activity Heatmap */}
            <Card animate variant="glass" padding="lg">
              <Heading as="h2" size="xl" className="mb-6">Activity Heatmap</Heading>
              <div className="space-y-2">
                {activityHeatmapData.map((day, dayIndex) => (
                  <div key={dayIndex} className="flex items-center gap-2">
                    <Text variant="muted" size="xs" className="w-12">{day.day}</Text>
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
                <div className="flex items-center justify-between mt-4 pt-4 border-t hg-border">
                  <Text variant="muted" size="xs">12 AM</Text>
                  <Text variant="muted" size="xs">6 AM</Text>
                  <Text variant="muted" size="xs">12 PM</Text>
                  <Text variant="muted" size="xs">6 PM</Text>
                  <Text variant="muted" size="xs">12 AM</Text>
                </div>
              </div>
            </Card>
          </div>

          {/* Top Engaged Users */}
          <Card animate variant="glass" padding="lg">
            <Heading as="h2" size="xl" className="mb-6">Top Engaged Users</Heading>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b hg-border">
                    <th className="pb-3"><Text variant="muted" size="sm" weight="semibold">Rank</Text></th>
                    <th className="pb-3"><Text variant="muted" size="sm" weight="semibold">User</Text></th>
                    <th className="pb-3"><Text variant="muted" size="sm" weight="semibold">Courses</Text></th>
                    <th className="pb-3"><Text variant="muted" size="sm" weight="semibold">Hours</Text></th>
                    <th className="pb-3"><Text variant="muted" size="sm" weight="semibold">Assessments</Text></th>
                    <th className="pb-3"><Text variant="muted" size="sm" weight="semibold">Engagement</Text></th>
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
                      className="border-b transition-all hg-border"
                    >
                      <td className="py-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-white text-sm font-bold">
                          {index + 1}
                        </div>
                      </td>
                      <td className="py-4"><Text>{user.name}</Text></td>
                      <td className="py-4"><Text variant="secondary">{user.courses}</Text></td>
                      <td className="py-4"><Text variant="secondary">{user.hours}h</Text></td>
                      <td className="py-4"><Text variant="secondary">{user.assessments}</Text></td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 rounded-full h-2 hg-bg-secondary">
                            <div
                              className="bg-emerald-500 h-2 rounded-full"
                              style={{ width: `${user.engagement}%` }}
                            />
                          </div>
                          <Text variant="secondary" size="sm" className="w-12">{user.engagement}%</Text>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Course Analytics */}
          <Card animate variant="glass" padding="lg">
            <Heading as="h2" size="xl" className="mb-6">Course Performance Analytics</Heading>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coursePerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis dataKey="name" stroke={chartColors.axis} style={{ fontSize: '10px' }} angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke={chartColors.axis} style={{ fontSize: '12px' }} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend />
                  <Bar dataKey="enrollments" fill={chartColors.primary} name="Enrollments" />
                  <Bar dataKey="completions" fill={chartSemanticColors.completed} name="Completions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Workshop Analytics */}
          <Card animate variant="glass" padding="lg">
            <Heading as="h2" size="xl" className="mb-6">Workshop Analytics</Heading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workshopData.map((workshop, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl transition-all hg-bg-secondary"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[var(--hg-cyan-bg)]">
                        <Video className="w-5 h-5 text-[var(--hg-cyan-text)]" />
                      </div>
                      <div>
                        <Text weight="semibold">{workshop.name}</Text>
                        <span
                          className={cn(
                            'inline-block px-2 py-0.5 text-xs rounded-full mt-1',
                            workshop.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-[var(--hg-cyan-bg)] text-[var(--hg-cyan-text)]'
                          )}
                        >
                          {workshop.status === 'completed' ? 'Completed' : 'Upcoming'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Text variant="muted" size="xs">Registered</Text>
                      <Heading as="h4" size="xl">{workshop.registered}</Heading>
                    </div>
                    {workshop.status === 'completed' && (
                      <>
                        <div>
                          <Text variant="muted" size="xs">Attended</Text>
                          <Heading as="h4" size="xl">{workshop.attended}</Heading>
                        </div>
                        <div className="col-span-2">
                          <Text variant="muted" size="xs" className="mb-2">Satisfaction Score</Text>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 rounded-full h-2 hg-bg-primary">
                              <div
                                className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full"
                                style={{ width: `${(workshop.satisfaction / 5) * 100}%` }}
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                              <Text size="sm">{workshop.satisfaction}</Text>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Expert Performance */}
          <Card animate variant="glass" padding="lg">
            <Heading as="h2" size="xl" className="mb-6">Expert Performance</Heading>
            <div className="space-y-4">
              {expertPerformanceData.map((expert, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl transition-all hg-bg-secondary"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-white text-lg font-bold">
                    {expert.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Text weight="semibold">{expert.name}</Text>
                    <div className="flex items-center gap-4 mt-1">
                      <Text variant="muted" size="sm">
                        {expert.consultations} consultations
                      </Text>
                      <Text variant="muted" size="sm">
                        {expert.hours}h logged
                      </Text>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-amber-400 mb-1">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <Text weight="semibold" className="text-amber-400">{expert.rating}</Text>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 rounded-full h-2 hg-bg-primary">
                        <div
                          className="bg-emerald-500 h-2 rounded-full"
                          style={{ width: `${expert.utilization}%` }}
                        />
                      </div>
                      <Text variant="muted" size="xs">{expert.utilization}%</Text>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Assessment Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assessments Completed Over Time */}
            <Card animate variant="glass" padding="lg">
              <Heading as="h2" size="xl" className="mb-6">Assessments Completed</Heading>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={assessmentData}>
                    <defs>
                      <linearGradient id="assessmentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.secondary} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={chartColors.secondary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis dataKey="week" stroke={chartColors.axis} style={{ fontSize: '12px' }} />
                    <YAxis stroke={chartColors.axis} style={{ fontSize: '12px' }} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      stroke={chartColors.secondary}
                      strokeWidth={2}
                      fill="url(#assessmentGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Average Maturity Scores */}
            <Card animate variant="glass" padding="lg">
              <Heading as="h2" size="xl" className="mb-6">Avg. Maturity Scores</Heading>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={maturityScoresData}>
                    <PolarGrid stroke={chartColors.grid} />
                    <PolarAngleAxis dataKey="dimension" stroke={chartColors.axis} style={{ fontSize: '12px' }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke={chartColors.axis} />
                    <Radar
                      name="Maturity Score"
                      dataKey="score"
                      stroke={chartColors.primary}
                      fill={chartColors.primary}
                      fillOpacity={0.3}
                    />
                    <Tooltip contentStyle={chartTooltipStyle} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Score Distribution */}
          <Card animate variant="glass" padding="lg">
            <Heading as="h2" size="xl" className="mb-6">Score Distribution</Heading>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {scoreDistributionData.map((level, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl transition-all hg-bg-secondary"
                  style={{ borderLeft: `4px solid ${level.color}` }}
                >
                  <Text variant="muted" size="sm" className="mb-2">{level.level}</Text>
                  <Heading as="h3" size="3xl" className="mb-2">{level.count}</Heading>
                  <div className="w-full rounded-full h-2 hg-bg-primary">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${(level.count / 2847) * 100}%`,
                        backgroundColor: level.color,
                      }}
                    />
                  </div>
                  <Text variant="muted" size="xs" className="mt-2">
                    {((level.count / 2847) * 100).toFixed(1)}% of users
                  </Text>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
