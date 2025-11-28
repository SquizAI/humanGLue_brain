'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Users,
  Search,
  Filter,
  Mail,
  Download,
  X,
  Clock,
  TrendingUp,
  Award,
  Activity,
  CheckCircle,
  BarChart3,
  MessageSquare,
  Calendar,
  FileText,
  Star,
  ChevronDown,
  UserCheck,
  AlertCircle,
  BookOpen,
  Target,
  Send,
  PlayCircle,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'
import { cn } from '@/utils/cn'
import Image from 'next/image'

// Mock student data
const mockStudents = [
  {
    id: 1,
    name: 'Sarah Chen',
    email: 'sarah.chen@techcorp.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    enrolledCourses: 3,
    completedCourses: 1,
    averageProgress: 78,
    lastActive: '2 hours ago',
    lastActivityDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
    engagementScore: 95,
    totalWatchTime: '24h 30m',
    assignmentsCompleted: 18,
    assignmentsTotal: 22,
    status: 'active',
    enrollmentDate: '2025-09-01',
    courses: [
      {
        id: 1,
        name: 'AI Transformation for Executives',
        progress: 85,
        lastAccessed: '2 hours ago',
        grade: 92,
        assignments: { completed: 8, total: 10 },
      },
      {
        id: 2,
        name: 'AI Strategy Workshop',
        progress: 70,
        lastAccessed: '1 day ago',
        grade: 88,
        assignments: { completed: 6, total: 8 },
      },
      {
        id: 3,
        name: 'Machine Learning Fundamentals',
        progress: 80,
        lastAccessed: '3 hours ago',
        grade: 95,
        assignments: { completed: 4, total: 4 },
      },
    ],
    recentActivity: [
      { type: 'assignment', description: 'Submitted "AI Strategy Planning" assignment', time: '2 hours ago' },
      { type: 'lesson', description: 'Completed "Introduction to Transformers"', time: '5 hours ago' },
      { type: 'discussion', description: 'Posted in "AI Ethics Discussion"', time: '1 day ago' },
    ],
  },
  {
    id: 2,
    name: 'Marcus Johnson',
    email: 'marcus.j@innovate.io',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    enrolledCourses: 2,
    completedCourses: 2,
    averageProgress: 100,
    lastActive: '5 hours ago',
    lastActivityDate: new Date(Date.now() - 5 * 60 * 60 * 1000),
    engagementScore: 88,
    totalWatchTime: '18h 15m',
    assignmentsCompleted: 16,
    assignmentsTotal: 16,
    status: 'completed',
    enrollmentDate: '2025-08-15',
    courses: [
      {
        id: 1,
        name: 'AI Transformation for Executives',
        progress: 100,
        lastAccessed: '5 hours ago',
        grade: 96,
        assignments: { completed: 10, total: 10 },
      },
      {
        id: 2,
        name: 'AI Strategy Workshop',
        progress: 100,
        lastAccessed: '2 days ago',
        grade: 91,
        assignments: { completed: 6, total: 6 },
      },
    ],
    recentActivity: [
      { type: 'completion', description: 'Completed "AI Strategy Workshop"', time: '2 days ago' },
      { type: 'review', description: 'Left a 5-star review', time: '3 days ago' },
    ],
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    email: 'emily.r@startup.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    enrolledCourses: 4,
    completedCourses: 0,
    averageProgress: 45,
    lastActive: '1 day ago',
    lastActivityDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    engagementScore: 72,
    totalWatchTime: '12h 45m',
    assignmentsCompleted: 8,
    assignmentsTotal: 20,
    status: 'active',
    enrollmentDate: '2025-09-15',
    courses: [
      {
        id: 1,
        name: 'AI Transformation for Executives',
        progress: 45,
        lastAccessed: '1 day ago',
        grade: 85,
        assignments: { completed: 5, total: 10 },
      },
      {
        id: 2,
        name: 'AI Strategy Workshop',
        progress: 40,
        lastAccessed: '2 days ago',
        grade: 82,
        assignments: { completed: 2, total: 8 },
      },
      {
        id: 3,
        name: 'Machine Learning Fundamentals',
        progress: 50,
        lastAccessed: '1 day ago',
        grade: 88,
        assignments: { completed: 1, total: 2 },
      },
    ],
    recentActivity: [
      { type: 'lesson', description: 'Watched "Neural Networks Basics"', time: '1 day ago' },
      { type: 'assignment', description: 'Started "ML Project Assignment"', time: '2 days ago' },
    ],
  },
  {
    id: 4,
    name: 'David Kim',
    email: 'david.kim@enterprise.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    enrolledCourses: 1,
    completedCourses: 0,
    averageProgress: 25,
    lastActive: '5 days ago',
    lastActivityDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    engagementScore: 45,
    totalWatchTime: '3h 20m',
    assignmentsCompleted: 2,
    assignmentsTotal: 10,
    status: 'inactive',
    enrollmentDate: '2025-09-20',
    courses: [
      {
        id: 1,
        name: 'AI Transformation for Executives',
        progress: 25,
        lastAccessed: '5 days ago',
        grade: 75,
        assignments: { completed: 2, total: 10 },
      },
    ],
    recentActivity: [
      { type: 'lesson', description: 'Started "Introduction to AI"', time: '5 days ago' },
    ],
  },
  {
    id: 5,
    name: 'Aisha Patel',
    email: 'aisha.p@global.org',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
    enrolledCourses: 3,
    completedCourses: 1,
    averageProgress: 82,
    lastActive: '30 minutes ago',
    lastActivityDate: new Date(Date.now() - 30 * 60 * 1000),
    engagementScore: 98,
    totalWatchTime: '28h 10m',
    assignmentsCompleted: 20,
    assignmentsTotal: 22,
    status: 'active',
    enrollmentDate: '2025-08-20',
    courses: [
      {
        id: 1,
        name: 'AI Transformation for Executives',
        progress: 90,
        lastAccessed: '30 minutes ago',
        grade: 97,
        assignments: { completed: 9, total: 10 },
      },
      {
        id: 2,
        name: 'AI Strategy Workshop',
        progress: 100,
        lastAccessed: '1 day ago',
        grade: 94,
        assignments: { completed: 8, total: 8 },
      },
      {
        id: 3,
        name: 'Machine Learning Fundamentals',
        progress: 75,
        lastAccessed: '2 hours ago',
        grade: 92,
        assignments: { completed: 3, total: 4 },
      },
    ],
    recentActivity: [
      { type: 'lesson', description: 'Completed "Advanced AI Strategies"', time: '30 minutes ago' },
      { type: 'discussion', description: 'Replied to instructor question', time: '2 hours ago' },
      { type: 'assignment', description: 'Submitted "Final Project Proposal"', time: '3 hours ago' },
    ],
  },
  {
    id: 6,
    name: 'James Wilson',
    email: 'james.w@consulting.co',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    enrolledCourses: 2,
    completedCourses: 0,
    averageProgress: 60,
    lastActive: '3 hours ago',
    lastActivityDate: new Date(Date.now() - 3 * 60 * 60 * 1000),
    engagementScore: 78,
    totalWatchTime: '15h 30m',
    assignmentsCompleted: 10,
    assignmentsTotal: 16,
    status: 'active',
    enrollmentDate: '2025-09-10',
    courses: [
      {
        id: 1,
        name: 'AI Transformation for Executives',
        progress: 65,
        lastAccessed: '3 hours ago',
        grade: 86,
        assignments: { completed: 6, total: 10 },
      },
      {
        id: 2,
        name: 'AI Strategy Workshop',
        progress: 55,
        lastAccessed: '1 day ago',
        grade: 84,
        assignments: { completed: 4, total: 6 },
      },
    ],
    recentActivity: [
      { type: 'lesson', description: 'Watched "AI Implementation Strategies"', time: '3 hours ago' },
      { type: 'assignment', description: 'Submitted "Case Study Analysis"', time: '1 day ago' },
    ],
  },
]

type FilterStatus = 'all' | 'active' | 'inactive' | 'completed'
type EngagementFilter = 'all' | 'high' | 'medium' | 'low'
type SortBy = 'name' | 'progress' | 'engagement' | 'lastActive'

export default function InstructorStudentsPage() {
  const router = useRouter()
  const { userData } = useChat()

  // State management
  const [students] = useState(mockStudents)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [engagementFilter, setEngagementFilter] = useState<EngagementFilter>('all')
  const [selectedCourse, setSelectedCourse] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortBy>('lastActive')
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false)
  const [bulkEmailSubject, setBulkEmailSubject] = useState('')
  const [bulkEmailMessage, setBulkEmailMessage] = useState('')

  // Auth check
  useEffect(() => {
    if (!userData?.isInstructor) {
      router.push('/login')
    }
  }, [userData, router])

  if (!userData?.isInstructor) {
    return null
  }

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  // Get unique courses for filter
  const allCourses = useMemo(() => {
    const coursesSet = new Set<string>()
    students.forEach((student) => {
      student.courses.forEach((course) => {
        coursesSet.add(course.name)
      })
    })
    return Array.from(coursesSet)
  }, [students])

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    let filtered = students.filter((student) => {
      // Search filter
      const searchMatch =
        searchQuery === '' ||
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())

      // Status filter
      const statusMatch = statusFilter === 'all' || student.status === statusFilter

      // Engagement filter
      let engagementMatch = true
      if (engagementFilter === 'high') engagementMatch = student.engagementScore >= 80
      else if (engagementFilter === 'medium')
        engagementMatch = student.engagementScore >= 50 && student.engagementScore < 80
      else if (engagementFilter === 'low') engagementMatch = student.engagementScore < 50

      // Course filter
      const courseMatch =
        selectedCourse === 'all' ||
        student.courses.some((c) => c.name === selectedCourse)

      return searchMatch && statusMatch && engagementMatch && courseMatch
    })

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'progress':
          return b.averageProgress - a.averageProgress
        case 'engagement':
          return b.engagementScore - a.engagementScore
        case 'lastActive':
          return b.lastActivityDate.getTime() - a.lastActivityDate.getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [students, searchQuery, statusFilter, engagementFilter, selectedCourse, sortBy])

  // Calculate stats
  const stats = useMemo(() => {
    const totalStudents = students.length
    const activeStudents = students.filter(
      (s) => s.lastActivityDate.getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    ).length
    const avgCompletion =
      students.reduce((sum, s) => sum + s.averageProgress, 0) / students.length
    const avgEngagement =
      students.reduce((sum, s) => sum + s.engagementScore, 0) / students.length

    return {
      totalStudents,
      activeStudents,
      avgCompletion,
      avgEngagement,
    }
  }, [students])

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'green'
    if (score >= 50) return 'amber'
    return 'red'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'green', label: 'Active', icon: UserCheck }
      case 'completed':
        return { color: 'blue', label: 'Completed', icon: CheckCircle }
      case 'inactive':
        return { color: 'amber', label: 'Inactive', icon: AlertCircle }
      default:
        return { color: 'gray', label: status, icon: Users }
    }
  }

  const toggleStudentSelection = (id: number) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(filteredStudents.map((s) => s.id))
    }
  }

  const handleBulkEmail = () => {
    console.log('Sending bulk email to:', selectedStudents)
    console.log('Subject:', bulkEmailSubject)
    console.log('Message:', bulkEmailMessage)
    setShowBulkEmailModal(false)
    setBulkEmailSubject('')
    setBulkEmailMessage('')
    setSelectedStudents([])
  }

  const handleExportData = () => {
    const csvContent = [
      ['Name', 'Email', 'Enrolled Courses', 'Progress', 'Engagement', 'Status', 'Last Active'],
      ...filteredStudents.map((s) => [
        s.name,
        s.email,
        s.enrolledCourses,
        `${s.averageProgress}%`,
        s.engagementScore,
        s.status,
        s.lastActive,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `students-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        {/* Header */}
        <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 font-gendy">
                  Student Management
                </h1>
                <p className="text-gray-400 font-diatype">
                  Track and manage student enrollments, progress, and engagement
                </p>
              </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 backdrop-blur-xl border border-blue-500/20 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-xs text-blue-400 font-diatype">Total</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1 font-gendy">
                  {stats.totalStudents}
                </h3>
                <p className="text-xs text-gray-400 font-diatype">Total Students</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-green-900/30 to-green-900/10 backdrop-blur-xl border border-green-500/20 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  <span className="text-xs text-green-400 font-diatype">Last 7 days</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1 font-gendy">
                  {stats.activeStudents}
                </h3>
                <p className="text-xs text-gray-400 font-diatype">Active Students</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-purple-900/30 to-purple-900/10 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-5 h-5 text-purple-400" />
                  <span className="text-xs text-purple-400 font-diatype">Average</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1 font-gendy">
                  {stats.avgCompletion.toFixed(0)}%
                </h3>
                <p className="text-xs text-gray-400 font-diatype">Course Completion</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-amber-900/30 to-amber-900/10 backdrop-blur-xl border border-amber-500/20 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  <span className="text-xs text-amber-400 font-diatype">Average</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1 font-gendy">
                  {stats.avgEngagement.toFixed(0)}
                </h3>
                <p className="text-xs text-gray-400 font-diatype">Engagement Score</p>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Filters and Search */}
          <div className="mb-6 space-y-4">
            {/* Search and Actions */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 font-diatype"
                />
              </div>

              {/* Bulk Actions */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowBulkEmailModal(true)}
                  disabled={selectedStudents.length === 0}
                  className={cn(
                    'px-4 py-3 rounded-xl font-diatype font-semibold flex items-center gap-2 transition-all',
                    selectedStudents.length > 0
                      ? 'bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300'
                      : 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed'
                  )}
                >
                  <Mail className="w-4 h-4" />
                  Email ({selectedStudents.length})
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExportData}
                  className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-xl font-diatype font-semibold flex items-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Export
                </motion.button>
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-3">
              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                  className="appearance-none pl-4 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-diatype text-sm focus:outline-none focus:border-purple-500/50 cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="completed">Completed</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Engagement Filter */}
              <div className="relative">
                <select
                  value={engagementFilter}
                  onChange={(e) => setEngagementFilter(e.target.value as EngagementFilter)}
                  className="appearance-none pl-4 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-diatype text-sm focus:outline-none focus:border-purple-500/50 cursor-pointer"
                >
                  <option value="all">All Engagement</option>
                  <option value="high">High (80+)</option>
                  <option value="medium">Medium (50-79)</option>
                  <option value="low">Low (&lt;50)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Course Filter */}
              <div className="relative">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-diatype text-sm focus:outline-none focus:border-purple-500/50 cursor-pointer"
                >
                  <option value="all">All Courses</option>
                  {allCourses.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Sort By */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="appearance-none pl-4 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-diatype text-sm focus:outline-none focus:border-purple-500/50 cursor-pointer"
                >
                  <option value="lastActive">Sort: Last Active</option>
                  <option value="name">Sort: Name</option>
                  <option value="progress">Sort: Progress</option>
                  <option value="engagement">Sort: Engagement</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Select All Checkbox */}
              <label className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                <input
                  type="checkbox"
                  checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500/50"
                />
                <span className="text-sm text-white font-diatype">Select All</span>
              </label>
            </div>

            {/* Active Filters Display */}
            {(searchQuery || statusFilter !== 'all' || engagementFilter !== 'all' || selectedCourse !== 'all') && (
              <div className="flex items-center gap-2 text-sm text-gray-400 font-diatype">
                <Filter className="w-4 h-4" />
                <span>
                  Showing {filteredStudents.length} of {students.length} students
                </span>
              </div>
            )}
          </div>

          {/* Student Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredStudents.map((student, index) => {
              const statusBadge = getStatusBadge(student.status)
              const engagementColor = getEngagementColor(student.engagementScore)
              const StatusIcon = statusBadge.icon

              return (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'bg-white/5 backdrop-blur-xl border rounded-2xl p-6 hover:border-purple-500/30 transition-all group',
                    selectedStudents.includes(student.id)
                      ? 'border-purple-500/50 bg-purple-500/5'
                      : 'border-white/10'
                  )}
                >
                  {/* Header with Avatar and Selection */}
                  <div className="flex items-start gap-4 mb-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => toggleStudentSelection(student.id)}
                      className="mt-1 w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500/50"
                    />

                    {/* Avatar */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-white/10">
                      <Image
                        src={student.avatar}
                        alt={student.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-1 font-gendy truncate">
                        {student.name}
                      </h3>
                      <p className="text-sm text-gray-400 font-diatype truncate mb-2">
                        {student.email}
                      </p>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1',
                            statusBadge.color === 'green' &&
                              'bg-green-500/20 text-green-300 border border-green-500/30',
                            statusBadge.color === 'blue' &&
                              'bg-blue-500/20 text-blue-300 border border-blue-500/30',
                            statusBadge.color === 'amber' &&
                              'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          )}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-blue-400 font-diatype">Courses</span>
                      </div>
                      <p className="text-lg font-bold text-white font-gendy">
                        {student.enrolledCourses}
                        <span className="text-xs text-gray-400 ml-1">enrolled</span>
                      </p>
                    </div>

                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-purple-400 font-diatype">Progress</span>
                      </div>
                      <p className="text-lg font-bold text-white font-gendy">
                        {student.averageProgress}%
                      </p>
                    </div>

                    <div
                      className={cn(
                        'border rounded-lg p-3',
                        engagementColor === 'green' &&
                          'bg-green-500/10 border-green-500/20',
                        engagementColor === 'amber' &&
                          'bg-amber-500/10 border-amber-500/20',
                        engagementColor === 'red' && 'bg-red-500/10 border-red-500/20'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp
                          className={cn(
                            'w-4 h-4',
                            engagementColor === 'green' && 'text-green-400',
                            engagementColor === 'amber' && 'text-amber-400',
                            engagementColor === 'red' && 'text-red-400'
                          )}
                        />
                        <span
                          className={cn(
                            'text-xs font-diatype',
                            engagementColor === 'green' && 'text-green-400',
                            engagementColor === 'amber' && 'text-amber-400',
                            engagementColor === 'red' && 'text-red-400'
                          )}
                        >
                          Engagement
                        </span>
                      </div>
                      <p className="text-lg font-bold text-white font-gendy">
                        {student.engagementScore}
                        <span className="text-xs text-gray-400 ml-1">/100</span>
                      </p>
                    </div>

                    <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs text-cyan-400 font-diatype">Last Active</span>
                      </div>
                      <p className="text-sm font-semibold text-white font-diatype">
                        {student.lastActive}
                      </p>
                    </div>
                  </div>

                  {/* Assignments Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400 font-diatype">
                        Assignments Completed
                      </span>
                      <span className="text-xs text-white font-diatype font-semibold">
                        {student.assignmentsCompleted}/{student.assignmentsTotal}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all"
                        style={{
                          width: `${(student.assignmentsCompleted / student.assignmentsTotal) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedStudent(student)
                        setShowDetailModal(true)
                      }}
                      className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 rounded-lg transition-all flex items-center justify-center gap-2 font-diatype text-sm"
                    >
                      <BarChart3 className="w-4 h-4" />
                      View Details
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-lg transition-all flex items-center justify-center gap-2 font-diatype text-sm"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </motion.button>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Empty State */}
          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2 font-gendy">
                No students found
              </h3>
              <p className="text-gray-400 font-diatype">
                Try adjusting your filters or search criteria
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Student Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-start gap-4 p-6 border-b border-white/10">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-white/10">
                  <Image
                    src={selectedStudent.avatar}
                    alt={selectedStudent.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white font-gendy mb-1">
                    {selectedStudent.name}
                  </h2>
                  <p className="text-sm text-gray-400 font-diatype mb-2">
                    {selectedStudent.email}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-diatype">
                    <Calendar className="w-4 h-4" />
                    Enrolled since {new Date(selectedStudent.enrollmentDate).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <BookOpen className="w-5 h-5 text-blue-400 mb-2" />
                    <p className="text-2xl font-bold text-white mb-1 font-gendy">
                      {selectedStudent.enrolledCourses}
                    </p>
                    <p className="text-xs text-gray-400 font-diatype">Enrolled Courses</p>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <CheckCircle className="w-5 h-5 text-green-400 mb-2" />
                    <p className="text-2xl font-bold text-white mb-1 font-gendy">
                      {selectedStudent.completedCourses}
                    </p>
                    <p className="text-xs text-gray-400 font-diatype">Completed</p>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                    <Target className="w-5 h-5 text-purple-400 mb-2" />
                    <p className="text-2xl font-bold text-white mb-1 font-gendy">
                      {selectedStudent.averageProgress}%
                    </p>
                    <p className="text-xs text-gray-400 font-diatype">Avg Progress</p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <TrendingUp className="w-5 h-5 text-amber-400 mb-2" />
                    <p className="text-2xl font-bold text-white mb-1 font-gendy">
                      {selectedStudent.engagementScore}
                    </p>
                    <p className="text-xs text-gray-400 font-diatype">Engagement</p>
                  </div>
                </div>

                {/* Course Progress */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-4 font-gendy flex items-center gap-2">
                    <PlayCircle className="w-5 h-5 text-purple-400" />
                    Course Progress
                  </h3>
                  <div className="space-y-3">
                    {selectedStudent.courses.map((course: any) => (
                      <div
                        key={course.id}
                        className="bg-white/5 border border-white/10 rounded-xl p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-white font-semibold mb-1 font-diatype">
                              {course.name}
                            </h4>
                            <p className="text-xs text-gray-400 font-diatype">
                              Last accessed: {course.lastAccessed}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-amber-400 mb-1">
                              <Star className="w-4 h-4 fill-amber-400" />
                              <span className="text-sm font-bold font-diatype">
                                {course.grade}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 font-diatype">Grade</p>
                          </div>
                        </div>

                        <div className="mb-2">
                          <div className="flex items-center justify-between text-xs text-gray-400 mb-1 font-diatype">
                            <span>Progress</span>
                            <span className="font-semibold text-white">{course.progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400 font-diatype">Assignments</span>
                          <span className="text-white font-semibold font-diatype">
                            {course.assignments.completed}/{course.assignments.total} completed
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity Timeline */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 font-gendy flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {selectedStudent.recentActivity.map((activity: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4"
                      >
                        <div
                          className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center',
                            activity.type === 'assignment' &&
                              'bg-purple-500/20 border border-purple-500/30',
                            activity.type === 'lesson' &&
                              'bg-blue-500/20 border border-blue-500/30',
                            activity.type === 'discussion' &&
                              'bg-green-500/20 border border-green-500/30',
                            activity.type === 'completion' &&
                              'bg-amber-500/20 border border-amber-500/30',
                            activity.type === 'review' &&
                              'bg-pink-500/20 border border-pink-500/30'
                          )}
                        >
                          {activity.type === 'assignment' && (
                            <FileText className="w-5 h-5 text-purple-400" />
                          )}
                          {activity.type === 'lesson' && (
                            <BookOpen className="w-5 h-5 text-blue-400" />
                          )}
                          {activity.type === 'discussion' && (
                            <MessageSquare className="w-5 h-5 text-green-400" />
                          )}
                          {activity.type === 'completion' && (
                            <CheckCircle className="w-5 h-5 text-amber-400" />
                          )}
                          {activity.type === 'review' && (
                            <Star className="w-5 h-5 text-pink-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-diatype text-sm mb-1">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500 font-diatype flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-white/10 p-6 flex items-center justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all font-diatype"
                >
                  Close
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold flex items-center gap-2 font-diatype shadow-lg shadow-purple-500/50"
                >
                  <MessageSquare className="w-4 h-4" />
                  Send Message
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Email Modal */}
      <AnimatePresence>
        {showBulkEmailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowBulkEmailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                  <h2 className="text-2xl font-bold text-white font-gendy">Send Bulk Email</h2>
                  <p className="text-sm text-gray-400 font-diatype">
                    Sending to {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => setShowBulkEmailModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Subject */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={bulkEmailSubject}
                    onChange={(e) => setBulkEmailSubject(e.target.value)}
                    placeholder="Enter email subject..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 font-diatype"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                    Message
                  </label>
                  <textarea
                    value={bulkEmailMessage}
                    onChange={(e) => setBulkEmailMessage(e.target.value)}
                    placeholder="Enter your message..."
                    rows={8}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 font-diatype resize-none"
                  />
                </div>
              </div>

              <div className="border-t border-white/10 p-6 flex items-center justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowBulkEmailModal(false)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all font-diatype"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBulkEmail}
                  disabled={!bulkEmailSubject || !bulkEmailMessage}
                  className={cn(
                    'px-6 py-3 rounded-xl font-semibold flex items-center gap-2 font-diatype',
                    bulkEmailSubject && bulkEmailMessage
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/50'
                      : 'bg-white/5 text-gray-500 cursor-not-allowed'
                  )}
                >
                  <Send className="w-4 h-4" />
                  Send Email
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
