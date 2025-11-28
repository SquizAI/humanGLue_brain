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

interface Assessment {
  id: number
  title: string
  type: 'leadership' | 'technical' | 'culture' | 'strategy'
  status: 'active' | 'archived'
  questions: number
  assigned: number
  completed: number
  avgScore: number
  createdAt: string
}

const initialAssessments: Assessment[] = [
  {
    id: 1,
    title: 'Leadership Readiness Assessment',
    type: 'leadership',
    status: 'active',
    questions: 25,
    assigned: 45,
    completed: 32,
    avgScore: 78,
    createdAt: '2025-09-15',
  },
  {
    id: 2,
    title: 'AI Technical Skills Evaluation',
    type: 'technical',
    status: 'active',
    questions: 40,
    assigned: 68,
    completed: 54,
    avgScore: 72,
    createdAt: '2025-09-20',
  },
  {
    id: 3,
    title: 'Organizational Culture Survey',
    type: 'culture',
    status: 'active',
    questions: 30,
    assigned: 120,
    completed: 98,
    avgScore: 65,
    createdAt: '2025-09-10',
  },
]

export default function AssessmentsAdmin() {
  const router = useRouter()
  const { userData, authLoading } = useChat()
  const [showContent, setShowContent] = useState(false)
  const [assessments, setAssessments] = useState<Assessment[]>(initialAssessments)
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

  if (!showContent) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
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
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">
                    <span className="font-diatype">← Back to Dashboard</span>
                  </Link>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2 font-gendy">Assessment Management</h1>
                <p className="text-gray-400 font-diatype">
                  Create and manage skill assessments ({filteredAssessments.length} assessments)
                </p>
              </div>
              <motion.button
                onClick={() => setShowAssessmentModal(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-diatype"
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
              className="bg-gradient-to-br from-purple-900/30 to-purple-900/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <ClipboardList className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1 font-gendy">
                {assessments.filter((a) => a.status === 'active').length}
              </h3>
              <p className="text-sm text-gray-400 font-diatype">Active Assessments</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1 font-gendy">
                {assessments.reduce((sum, a) => sum + a.assigned, 0)}
              </h3>
              <p className="text-sm text-gray-400 font-diatype">Total Assigned</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-green-900/30 to-green-900/10 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1 font-gendy">
                {assessments.reduce((sum, a) => sum + a.completed, 0)}
              </h3>
              <p className="text-sm text-gray-400 font-diatype">Completed</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-amber-900/30 to-amber-900/10 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <Award className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1 font-gendy">
                {Math.round(
                  assessments.reduce((sum, a) => sum + a.avgScore, 0) / assessments.length
                )}
                %
              </h3>
              <p className="text-sm text-gray-400 font-diatype">Avg Score</p>
            </motion.div>
          </div>

          {/* Filters */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search assessments..."
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-diatype"
                  />
                </div>
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-diatype"
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
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 bg-${getTypeColor(assessment.type)}-500/20 rounded-xl`}>
                    <Target className={`w-6 h-6 text-${getTypeColor(assessment.type)}-400`} />
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      assessment.status === 'active'
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                    }`}
                  >
                    {assessment.status}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 font-gendy">{assessment.title}</h3>
                <p className="text-sm text-gray-400 mb-4 font-diatype capitalize">{assessment.type}</p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-2xl font-bold text-white mb-1 font-gendy">
                      {assessment.questions}
                    </p>
                    <p className="text-xs text-gray-400 font-diatype">Questions</p>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <p className="text-2xl font-bold text-blue-400 mb-1 font-gendy">
                      {assessment.assigned}
                    </p>
                    <p className="text-xs text-blue-400 font-diatype">Assigned</p>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <p className="text-2xl font-bold text-green-400 mb-1 font-gendy">
                      {assessment.completed}
                    </p>
                    <p className="text-xs text-green-400 font-diatype">Completed</p>
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
                    className="flex-1 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 rounded-lg transition-all flex items-center justify-center gap-2 font-diatype"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Results
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-lg transition-all font-diatype"
                  >
                    <Edit className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 rounded-lg transition-all font-diatype"
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
            className="fixed top-8 right-8 z-[60] bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3"
          >
            <CheckCircle className="w-6 h-6" />
            <span className="font-semibold font-diatype">Assessment saved successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
