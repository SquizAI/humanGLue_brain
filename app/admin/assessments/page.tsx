'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ClipboardList,
  Plus,
  Edit,
  Trash2,
  Search,
  Users,
  BarChart3,
  Download,
  X,
  Save,
  CheckCircle,
  FileText,
  Target,
  Award,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner'
import { signOut } from '@/lib/auth/hooks'

interface Assessment {
  id: string | number
  title: string
  type: 'leadership' | 'technical' | 'culture' | 'strategy'
  status: 'active' | 'archived'
  questions: number
  assigned: number
  completed: number
  avgScore: number
  createdAt: string
}

export default function AssessmentsAdmin() {
  const router = useRouter()
  const { userData, authLoading } = useChat()
  const [showContent, setShowContent] = useState(false)
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showAssessmentModal, setShowAssessmentModal] = useState(false)
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // Check admin access with timeout pattern
  useEffect(() => {
    if (!authLoading && userData?.isAdmin) {
      setShowContent(true)
      return
    }

    const timeout = setTimeout(() => {
      console.log('[AssessmentsAdmin] Auth timeout - trusting middleware protection')
      setShowContent(true)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [authLoading, userData])

  // Fetch assessments from database
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setIsLoading(true)
        setLoadError(null)

        // Fetch all assessment templates (admin view)
        const response = await fetch('/api/admin/assessments')
        const result = await response.json()

        if (result.success && result.data?.assessments) {
          setAssessments(result.data.assessments)
        } else if (result.error) {
          console.log('[AssessmentsAdmin] API response:', result)
          setAssessments([])
        }
      } catch (error) {
        console.error('[AssessmentsAdmin] Failed to fetch assessments:', error)
        setLoadError('Failed to load assessments from database')
        setAssessments([])
      } finally {
        setIsLoading(false)
      }
    }

    if (showContent) {
      fetchAssessments()
    }
  }, [showContent])

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

  if (!showContent || isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--hg-bg-primary)' }}>
        <DashboardSidebar onLogout={handleLogout} />
        <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 flex items-center justify-center min-h-screen">
          <LoadingSpinner variant="neural" size="xl" text="Loading assessments..." />
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--hg-bg-primary)' }}>
        <DashboardSidebar onLogout={handleLogout} />
        <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-400 text-xl mb-4">{loadError}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg transition-all border"
              style={{ backgroundColor: 'var(--hg-cyan-bg)', borderColor: 'var(--hg-cyan-border)', color: 'var(--hg-cyan-text)' }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch =
      searchQuery === '' ||
      assessment.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || assessment.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getTypeColor = (type: string) => {
    const colors = {
      leadership: 'purple',
      technical: 'blue',
      culture: 'green',
      strategy: 'amber',
    }
    return colors[type as keyof typeof colors] || 'gray'
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--hg-bg-primary)' }}>
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        <div className="border-b sticky top-0 z-30" style={{ backgroundColor: 'var(--hg-bg-sidebar)', borderColor: 'var(--hg-border-color)' }}>
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Link href="/admin" className="text-sm hover:underline" style={{ color: 'var(--hg-text-muted)' }}>
                    <span className="font-diatype">← Back to Dashboard</span>
                  </Link>
                </div>
                <h1 className="text-3xl font-bold mb-2 font-gendy" style={{ color: 'var(--hg-text-primary)' }}>Assessment Management</h1>
                <p className="font-diatype" style={{ color: 'var(--hg-text-muted)' }}>
                  Create and manage skill assessments ({filteredAssessments.length} assessments)
                </p>
              </div>
              <motion.button
                onClick={() => setShowAssessmentModal(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-diatype"
                style={{ boxShadow: '0 4px 14px rgba(97, 216, 254, 0.4)' }}
              >
                <Plus className="w-5 h-5" />
                Create Assessment
              </motion.button>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-2xl p-6 transition-all hover:border-[var(--hg-cyan-border)]"
              style={{ backgroundColor: 'var(--hg-bg-card)', borderColor: 'var(--hg-border-color)', boxShadow: 'var(--hg-shadow)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--hg-cyan-bg)' }}>
                  <ClipboardList className="w-6 h-6" style={{ color: 'var(--hg-cyan-text)' }} />
                </div>
              </div>
              <h3 className="text-sm mb-1 font-diatype" style={{ color: 'var(--hg-text-muted)' }}>Active Assessments</h3>
              <p className="text-3xl font-bold font-gendy" style={{ color: 'var(--hg-text-primary)' }}>
                {assessments.filter((a) => a.status === 'active').length}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="border rounded-2xl p-6 transition-all hover:border-[var(--hg-cyan-border)]"
              style={{ backgroundColor: 'var(--hg-bg-card)', borderColor: 'var(--hg-border-color)', boxShadow: 'var(--hg-shadow)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--hg-cyan-bg)' }}>
                  <Users className="w-6 h-6" style={{ color: 'var(--hg-cyan-text)' }} />
                </div>
              </div>
              <h3 className="text-sm mb-1 font-diatype" style={{ color: 'var(--hg-text-muted)' }}>Total Assigned</h3>
              <p className="text-3xl font-bold font-gendy" style={{ color: 'var(--hg-text-primary)' }}>
                {assessments.reduce((sum, a) => sum + a.assigned, 0)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="border rounded-2xl p-6 transition-all hover:border-[var(--hg-cyan-border)]"
              style={{ backgroundColor: 'var(--hg-bg-card)', borderColor: 'var(--hg-border-color)', boxShadow: 'var(--hg-shadow)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500/10">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="text-sm font-medium text-emerald-500">Complete</span>
              </div>
              <h3 className="text-sm mb-1 font-diatype" style={{ color: 'var(--hg-text-muted)' }}>Completed</h3>
              <p className="text-3xl font-bold font-gendy" style={{ color: 'var(--hg-text-primary)' }}>
                {assessments.reduce((sum, a) => sum + a.completed, 0)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="border rounded-2xl p-6 transition-all hover:border-[var(--hg-cyan-border)]"
              style={{ backgroundColor: 'var(--hg-bg-card)', borderColor: 'var(--hg-border-color)', boxShadow: 'var(--hg-shadow)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-500/10">
                  <Award className="w-6 h-6 text-amber-400" />
                </div>
              </div>
              <h3 className="text-sm mb-1 font-diatype" style={{ color: 'var(--hg-text-muted)' }}>Avg Score</h3>
              <p className="text-3xl font-bold font-gendy" style={{ color: 'var(--hg-text-primary)' }}>
                {assessments.length > 0
                  ? Math.round(
                      assessments.reduce((sum, a) => sum + a.avgScore, 0) / assessments.length
                    )
                  : 0}
                %
              </p>
            </motion.div>
          </div>

          {/* Filters */}
          <div className="border rounded-2xl p-6 mb-6" style={{ backgroundColor: 'var(--hg-bg-card)', borderColor: 'var(--hg-border-color)' }}>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--hg-text-muted)' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search assessments..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl transition-all font-diatype border focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--hg-bg-secondary)',
                      borderColor: 'var(--hg-border-color)',
                      color: 'var(--hg-text-primary)',
                      '--tw-ring-color': 'var(--hg-cyan-border)'
                    } as React.CSSProperties}
                  />
                </div>
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 rounded-xl transition-all font-diatype border focus:outline-none"
                style={{ backgroundColor: 'var(--hg-bg-secondary)', borderColor: 'var(--hg-border-color)', color: 'var(--hg-text-primary)' }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Assessments Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAssessments.map((assessment, index) => (
              <motion.div
                key={assessment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border rounded-2xl p-6 hover:border-[var(--hg-cyan-border)] transition-all"
                style={{ backgroundColor: 'var(--hg-bg-card)', borderColor: 'var(--hg-border-color)' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--hg-cyan-bg)' }}>
                    <Target className="w-6 h-6" style={{ color: 'var(--hg-cyan-text)' }} />
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      assessment.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                    }`}
                  >
                    {assessment.status}
                  </div>
                </div>

                <h3 className="text-lg font-bold mb-2 font-gendy" style={{ color: 'var(--hg-text-primary)' }}>{assessment.title}</h3>
                <p className="text-sm mb-4 font-diatype capitalize" style={{ color: 'var(--hg-text-muted)' }}>{assessment.type}</p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--hg-bg-secondary)' }}>
                    <p className="text-2xl font-bold mb-1 font-gendy" style={{ color: 'var(--hg-text-primary)' }}>
                      {assessment.questions}
                    </p>
                    <p className="text-xs font-diatype" style={{ color: 'var(--hg-text-muted)' }}>Questions</p>
                  </div>
                  <div className="rounded-lg p-3 border" style={{ backgroundColor: 'var(--hg-cyan-bg)', borderColor: 'var(--hg-cyan-border)' }}>
                    <p className="text-2xl font-bold mb-1 font-gendy" style={{ color: 'var(--hg-cyan-text)' }}>
                      {assessment.assigned}
                    </p>
                    <p className="text-xs font-diatype" style={{ color: 'var(--hg-cyan-text)' }}>Assigned</p>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                    <p className="text-2xl font-bold text-emerald-400 mb-1 font-gendy">
                      {assessment.completed}
                    </p>
                    <p className="text-xs text-emerald-400 font-diatype">Completed</p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                    <p className="text-2xl font-bold text-amber-400 mb-1 font-gendy">
                      {assessment.avgScore}%
                    </p>
                    <p className="text-xs text-amber-400 font-diatype">Avg Score</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 font-diatype border"
                    style={{ backgroundColor: 'var(--hg-cyan-bg)', borderColor: 'var(--hg-cyan-border)', color: 'var(--hg-cyan-text)' }}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Results
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 rounded-lg transition-all font-diatype border"
                    style={{ backgroundColor: 'var(--hg-bg-secondary)', borderColor: 'var(--hg-border-color)', color: 'var(--hg-text-muted)' }}
                  >
                    <Edit className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 rounded-lg transition-all font-diatype"
                  >
                    <Download className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-8 right-8 z-[60] bg-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3"
          >
            <CheckCircle className="w-6 h-6" />
            <span className="font-semibold font-diatype">Assessment saved successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
