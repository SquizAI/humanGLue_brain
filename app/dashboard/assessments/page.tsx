'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  ClipboardList,
  Calendar,
  TrendingUp,
  FileText,
  Download,
  Eye,
  Filter,
  SortAsc,
  SortDesc,
  Search,
  Users,
  User,
  Award,
  Target,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  BarChart3,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'

type AssessmentType = 'individual' | 'company'
type AssessmentStatus = 'completed' | 'in-progress' | 'pending'

interface Assessment {
  id: string
  title: string
  type: AssessmentType
  status: AssessmentStatus
  score?: number
  completedDate?: string
  createdDate: string
  department?: string
  participant?: string
  maturityLevel?: string
  insights: number
  recommendations: number
}

export default function AssessmentsPage() {
  const router = useRouter()
  const { userData } = useChat()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<AssessmentType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<AssessmentStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'title'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showFilters, setShowFilters] = useState(false)

  // Authentication check
  useEffect(() => {
    if (!userData || !userData.authenticated) {
      router.push('/login')
    }
  }, [userData, router])

  if (!userData || !userData.authenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  // Mock assessment data
  const mockAssessments: Assessment[] = [
    {
      id: '1',
      title: 'AI Maturity Assessment',
      type: 'company',
      status: 'completed',
      score: 72,
      completedDate: '2025-10-01',
      createdDate: '2025-09-28',
      department: 'Engineering',
      maturityLevel: 'Level 6 - Adaptable',
      insights: 12,
      recommendations: 8,
    },
    {
      id: '2',
      title: 'Personal Adaptability Score',
      type: 'individual',
      status: 'completed',
      score: 85,
      completedDate: '2025-09-25',
      createdDate: '2025-09-25',
      participant: userData.name || 'You',
      maturityLevel: 'Level 8 - Advanced',
      insights: 8,
      recommendations: 5,
    },
    {
      id: '3',
      title: 'Team Readiness Assessment',
      type: 'company',
      status: 'in-progress',
      createdDate: '2025-10-02',
      department: 'Product Team',
      insights: 0,
      recommendations: 0,
    },
    {
      id: '4',
      title: 'Leadership Digital Fluency',
      type: 'individual',
      status: 'completed',
      score: 68,
      completedDate: '2025-09-15',
      createdDate: '2025-09-15',
      participant: userData.name || 'You',
      maturityLevel: 'Level 5 - Proficient',
      insights: 6,
      recommendations: 4,
    },
  ]

  // Filter and sort assessments
  const filteredAssessments = mockAssessments
    .filter((assessment) => {
      const matchesSearch =
        assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assessment.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assessment.participant?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = filterType === 'all' || assessment.type === filterType
      const matchesStatus = filterStatus === 'all' || assessment.status === filterStatus

      return matchesSearch && matchesType && matchesStatus
    })
    .sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime()
          break
        case 'score':
          comparison = (a.score || 0) - (b.score || 0)
          break
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

  const stats = [
    {
      label: 'Total Assessments',
      value: mockAssessments.length.toString(),
      icon: <ClipboardList className="w-6 h-6" />,
      gradient: 'from-purple-500 to-blue-500',
    },
    {
      label: 'Completed',
      value: mockAssessments.filter((a) => a.status === 'completed').length.toString(),
      icon: <CheckCircle2 className="w-6 h-6" />,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Average Score',
      value: `${Math.round(
        mockAssessments
          .filter((a) => a.score)
          .reduce((acc, a) => acc + (a.score || 0), 0) /
          mockAssessments.filter((a) => a.score).length
      )}%`,
      icon: <TrendingUp className="w-6 h-6" />,
      gradient: 'from-cyan-500 to-green-500',
    },
    {
      label: 'Total Insights',
      value: mockAssessments.reduce((acc, a) => acc + a.insights, 0).toString(),
      icon: <Sparkles className="w-6 h-6" />,
      gradient: 'from-green-500 to-emerald-500',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      {/* Main Content - offset by sidebar */}
      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all">
        {/* Header with glassmorphic effect */}
        <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1 font-gendy">
                  Assessment History
                </h1>
                <p className="text-gray-400 font-diatype">
                  Track your transformation journey and insights
                </p>
              </div>

              <Link href="/dashboard/assessments/new">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all inline-flex items-center gap-2 shadow-lg shadow-purple-500/50 font-diatype"
                >
                  <Sparkles className="w-5 h-5" />
                  Start New Assessment
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:border-purple-500/30 transition-all hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />

                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} bg-opacity-10 backdrop-blur-sm`}
                    >
                      <div className="text-white">{stat.icon}</div>
                    </div>
                  </div>

                  <div className="text-4xl font-bold text-white mb-2 font-gendy">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400 font-diatype">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Filters and Search */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assessments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/30 transition-all font-diatype"
                />
              </div>

              {/* Filter Toggle */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all inline-flex items-center gap-2 font-diatype ${
                  showFilters
                    ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300'
                    : 'bg-white/5 backdrop-blur-xl border border-white/10 text-gray-300 hover:border-purple-500/30'
                }`}
              >
                <Filter className="w-5 h-5" />
                Filters
              </motion.button>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Type Filter */}
                      <div>
                        <label className="text-sm font-semibold text-gray-300 mb-2 block font-gendy">
                          Assessment Type
                        </label>
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value as AssessmentType | 'all')}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/30 transition-all font-diatype"
                        >
                          <option value="all">All Types</option>
                          <option value="individual">Individual</option>
                          <option value="company">Company</option>
                        </select>
                      </div>

                      {/* Status Filter */}
                      <div>
                        <label className="text-sm font-semibold text-gray-300 mb-2 block font-gendy">
                          Status
                        </label>
                        <select
                          value={filterStatus}
                          onChange={(e) =>
                            setFilterStatus(e.target.value as AssessmentStatus | 'all')
                          }
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/30 transition-all font-diatype"
                        >
                          <option value="all">All Statuses</option>
                          <option value="completed">Completed</option>
                          <option value="in-progress">In Progress</option>
                          <option value="pending">Pending</option>
                        </select>
                      </div>

                      {/* Sort By */}
                      <div>
                        <label className="text-sm font-semibold text-gray-300 mb-2 block font-gendy">
                          Sort By
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'date' | 'score' | 'title')}
                            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/30 transition-all font-diatype"
                          >
                            <option value="date">Date</option>
                            <option value="score">Score</option>
                            <option value="title">Title</option>
                          </select>
                          <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:border-purple-500/30 transition-all"
                          >
                            {sortOrder === 'asc' ? (
                              <SortAsc className="w-5 h-5" />
                            ) : (
                              <SortDesc className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Assessments List */}
          <div className="space-y-4">
            {filteredAssessments.length === 0 ? (
              <div className="text-center py-12 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                <ClipboardList className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2 font-gendy">
                  No assessments found
                </h3>
                <p className="text-gray-400 font-diatype">
                  Try adjusting your filters or start a new assessment
                </p>
              </div>
            ) : (
              filteredAssessments.map((assessment, i) => (
                <motion.div
                  key={assessment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  whileHover={{ y: -2 }}
                  className="group relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-purple-500/30 transition-all hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div
                          className={`p-3 rounded-xl ${
                            assessment.type === 'individual'
                              ? 'bg-gradient-to-br from-blue-500 to-cyan-500 bg-opacity-10'
                              : 'bg-gradient-to-br from-purple-500 to-pink-500 bg-opacity-10'
                          }`}
                        >
                          {assessment.type === 'individual' ? (
                            <User className="w-6 h-6 text-blue-400" />
                          ) : (
                            <Users className="w-6 h-6 text-purple-400" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-white font-gendy">
                              {assessment.title}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold font-diatype ${
                                assessment.status === 'completed'
                                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                  : assessment.status === 'in-progress'
                                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                  : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                              }`}
                            >
                              {assessment.status === 'completed'
                                ? 'Completed'
                                : assessment.status === 'in-progress'
                                ? 'In Progress'
                                : 'Pending'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4 font-diatype">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(
                                assessment.completedDate || assessment.createdDate
                              ).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </div>
                            {assessment.department && (
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                {assessment.department}
                              </div>
                            )}
                            {assessment.participant && (
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                {assessment.participant}
                              </div>
                            )}
                          </div>

                          {assessment.status === 'completed' && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <div className="text-2xl font-bold text-white mb-1 font-gendy">
                                  {assessment.score}%
                                </div>
                                <div className="text-xs text-gray-500 font-diatype">Score</div>
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-purple-400 mb-1 font-gendy">
                                  {assessment.maturityLevel?.split(' - ')[0]}
                                </div>
                                <div className="text-xs text-gray-500 font-diatype">
                                  {assessment.maturityLevel?.split(' - ')[1]}
                                </div>
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-blue-400 mb-1 font-gendy">
                                  {assessment.insights}
                                </div>
                                <div className="text-xs text-gray-500 font-diatype">Insights</div>
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-cyan-400 mb-1 font-gendy">
                                  {assessment.recommendations}
                                </div>
                                <div className="text-xs text-gray-500 font-diatype">
                                  Recommendations
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {assessment.status === 'completed' && (
                      <div className="flex flex-col gap-2">
                        <Link href={`/dashboard/assessments/${assessment.id}`}>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all inline-flex items-center gap-2 shadow-lg shadow-purple-500/50 font-diatype text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            View Report
                          </motion.button>
                        </Link>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-lg font-semibold hover:bg-white/10 hover:border-purple-500/30 transition-all inline-flex items-center gap-2 font-diatype text-sm"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </motion.button>
                      </div>
                    )}

                    {assessment.status === 'in-progress' && (
                      <Link href={`/dashboard/assessments/${assessment.id}`}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all inline-flex items-center gap-2 font-diatype text-sm"
                        >
                          <Clock className="w-4 h-4" />
                          Continue
                        </motion.button>
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
