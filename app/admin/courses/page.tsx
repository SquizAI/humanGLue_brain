'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  PlayCircle,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Upload,
  Eye,
  Users,
  Star,
  DollarSign,
  Clock,
  Save,
  X,
  Image as ImageIcon,
  FileText,
  Video,
  CheckCircle,
  Copy,
  Calendar,
  Download,
  BarChart3,
  CheckSquare,
  Square,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner'
import { signOut } from '@/lib/auth/hooks'
import Image from 'next/image'

// Course categories
const categories = [
  { id: 'ai-adoption', name: 'AI Adoption & Strategy', color: 'cyan' },
  { id: 'change-management', name: 'Change Management', color: 'blue' },
  { id: 'leadership', name: 'Leadership & Culture', color: 'green' },
  { id: 'data-ai', name: 'Data & AI Technical', color: 'cyan' },
  { id: 'human-skills', name: 'Human Skills & Coaching', color: 'amber' },
  { id: 'ethics', name: 'AI Ethics & Governance', color: 'red' },
]

const levels = ['Beginner', 'Intermediate', 'Advanced', 'Executive']

// Sample courses data (in production, this would come from a database)
const initialCourses = [
  {
    id: 1,
    title: 'AI Transformation for Executives',
    instructor: 'Sarah Chen',
    category: 'ai-adoption',
    level: 'Executive',
    duration: '6 hours',
    lessons: 12,
    students: 2847,
    rating: 4.9,
    reviews: 384,
    price: 299,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop',
    status: 'published',
    lastUpdated: '2025-10-01',
  },
  {
    id: 2,
    title: 'Change Management Masterclass',
    instructor: 'Dr. Marcus Thompson',
    category: 'change-management',
    level: 'Advanced',
    duration: '8 hours',
    lessons: 16,
    students: 1923,
    rating: 4.8,
    reviews: 267,
    price: 349,
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=500&fit=crop',
    status: 'published',
    lastUpdated: '2025-09-28',
  },
  {
    id: 3,
    title: 'Building AI-Ready Teams',
    instructor: 'Jennifer Wu',
    category: 'leadership',
    level: 'Intermediate',
    duration: '5 hours',
    lessons: 10,
    students: 3156,
    rating: 4.9,
    reviews: 421,
    price: 249,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop',
    status: 'published',
    lastUpdated: '2025-09-25',
  },
  {
    id: 4,
    title: 'Data Governance & AI Ethics',
    instructor: 'Prof. David Kim',
    category: 'ethics',
    level: 'Advanced',
    duration: '7 hours',
    lessons: 14,
    students: 1456,
    rating: 4.7,
    reviews: 198,
    price: 399,
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=500&fit=crop',
    status: 'published',
    lastUpdated: '2025-09-20',
  },
  {
    id: 5,
    title: 'AI Strategy Workshop',
    instructor: 'Sarah Chen',
    category: 'ai-adoption',
    level: 'Executive',
    duration: '4 hours',
    lessons: 8,
    students: 892,
    rating: 4.8,
    reviews: 124,
    price: 449,
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=500&fit=crop',
    status: 'draft',
    lastUpdated: '2025-10-02',
  },
  {
    id: 6,
    title: 'Machine Learning Fundamentals',
    instructor: 'Dr. Raj Patel',
    category: 'data-ai',
    level: 'Beginner',
    duration: '10 hours',
    lessons: 20,
    students: 4521,
    rating: 4.9,
    reviews: 587,
    price: 199,
    image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&h=500&fit=crop',
    status: 'published',
    lastUpdated: '2025-09-15',
  },
]

export default function CoursesAdmin() {
  const router = useRouter()
  const { userData, authLoading } = useChat()
  const [showContent, setShowContent] = useState(false)
  const [courses, setCourses] = useState(initialCourses)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [editingCourse, setEditingCourse] = useState<any>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessageType, setSuccessMessageType] = useState<'create' | 'update'>('create')
  const [selectedCourses, setSelectedCourses] = useState<number[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false)
  const [selectedCourseForAnalytics, setSelectedCourseForAnalytics] = useState<any>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    instructor: '',
    category: 'ai-adoption',
    level: 'Beginner',
    duration: '',
    lessons: 0,
    price: 0,
    description: '',
    image: '',
    status: 'draft',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Check admin access with timeout pattern
  useEffect(() => {
    if (!authLoading && userData?.isAdmin) {
      setShowContent(true)
      return
    }

    const timeout = setTimeout(() => {
      console.log('[CoursesAdmin] Auth timeout - trusting middleware protection')
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
      <div className="min-h-screen bg-black">
        <DashboardSidebar onLogout={handleLogout} />
        <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 flex items-center justify-center min-h-screen">
          <LoadingSpinner variant="neural" size="xl" text="Loading courses..." />
        </div>
      </div>
    )
  }

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      searchQuery === '' ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || course.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleDeleteCourse = (courseId: number) => {
    setCourses(courses.filter((c) => c.id !== courseId))
    setShowDeleteConfirm(null)
  }

  const handleToggleStatus = (courseId: number) => {
    setCourses(
      courses.map((c) =>
        c.id === courseId
          ? { ...c, status: c.status === 'published' ? 'draft' : 'published' }
          : c
      )
    )
  }

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category?.color || 'gray'
  }

  // Bulk Actions
  const handleSelectCourse = (courseId: number) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    )
  }

  const handleSelectAll = () => {
    if (selectedCourses.length === filteredCourses.length) {
      setSelectedCourses([])
    } else {
      setSelectedCourses(filteredCourses.map((c) => c.id))
    }
  }

  const handleBulkPublish = () => {
    setCourses(
      courses.map((c) =>
        selectedCourses.includes(c.id) ? { ...c, status: 'published' } : c
      )
    )
    setSelectedCourses([])
    setShowBulkActions(false)
  }

  const handleBulkArchive = () => {
    setCourses(courses.filter((c) => !selectedCourses.includes(c.id)))
    setSelectedCourses([])
    setShowBulkActions(false)
  }

  const handleBulkExport = () => {
    const selectedCoursesData = courses.filter((c) => selectedCourses.includes(c.id))
    console.log('Exporting courses:', selectedCoursesData)
    setSelectedCourses([])
    setShowBulkActions(false)
  }

  const handleCloneCourse = (course: any) => {
    const clonedCourse = {
      ...course,
      id: Math.max(...courses.map((c) => c.id)) + 1,
      title: `${course.title} (Copy)`,
      status: 'draft',
      students: 0,
      reviews: 0,
      lastUpdated: new Date().toISOString().split('T')[0],
    }
    setCourses([clonedCourse, ...courses])
  }

  // Open modal for creating new course
  const handleOpenCreateModal = () => {
    setEditingCourse(null)
    setFormData({
      title: '',
      instructor: '',
      category: 'ai-adoption',
      level: 'Beginner',
      duration: '',
      lessons: 0,
      price: 0,
      description: '',
      image: '',
      status: 'draft',
    })
    setFormErrors({})
    setShowCourseModal(true)
  }

  // Open modal for editing existing course
  const handleOpenEditModal = (course: any) => {
    setEditingCourse(course)
    setFormData({
      title: course.title,
      instructor: course.instructor,
      category: course.category,
      level: course.level,
      duration: course.duration,
      lessons: course.lessons,
      price: course.price,
      description: course.description || '',
      image: course.image,
      status: course.status,
    })
    setFormErrors({})
    setShowCourseModal(true)
  }

  // Close modal
  const handleCloseModal = () => {
    setShowCourseModal(false)
    setEditingCourse(null)
    setFormErrors({})
  }

  // Update form field
  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.title.trim()) {
      errors.title = 'Title is required'
    }
    if (!formData.instructor.trim()) {
      errors.instructor = 'Instructor is required'
    }
    if (!formData.duration.trim()) {
      errors.duration = 'Duration is required'
    }
    if (formData.lessons <= 0) {
      errors.lessons = 'Number of lessons must be greater than 0'
    }
    if (formData.price < 0) {
      errors.price = 'Price cannot be negative'
    }
    if (!formData.image.trim()) {
      errors.image = 'Image URL is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Save course (create or update)
  const handleSaveCourse = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (editingCourse) {
      // Update existing course
      setCourses(
        courses.map((c) =>
          c.id === editingCourse.id
            ? {
                ...c,
                ...formData,
                lastUpdated: new Date().toISOString().split('T')[0],
              }
            : c
        )
      )
    } else {
      // Create new course
      const newCourse = {
        id: Math.max(...courses.map((c) => c.id)) + 1,
        ...formData,
        students: 0,
        rating: 0,
        reviews: 0,
        lastUpdated: new Date().toISOString().split('T')[0],
      }
      setCourses([newCourse, ...courses])
    }

    setIsSubmitting(false)
    setShowCourseModal(false)
    setSuccessMessageType(editingCourse ? 'update' : 'create')
    setShowSuccessMessage(true)

    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-black">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        {/* Header */}
        <div className="bg-black/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">
                    <span className="font-diatype">← Back to Dashboard</span>
                  </Link>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2 font-gendy">Course Management</h1>
                <p className="text-gray-400 font-diatype">
                  Manage your learning platform content ({filteredCourses.length} courses)
                </p>
              </div>
              <motion.button
                onClick={handleOpenCreateModal}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-diatype"
              >
                <Plus className="w-5 h-5" />
                Add New Course
              </motion.button>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="p-8">
          {/* Bulk Actions Bar */}
          <AnimatePresence>
            {selectedCourses.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-cyan-500/20 border border-cyan-500/30 backdrop-blur-xl rounded-2xl p-4 mb-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CheckSquare className="w-5 h-5 text-cyan-400" />
                    <span className="text-white font-semibold font-diatype">
                      {selectedCourses.length} course{selectedCourses.length > 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBulkPublish}
                      className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 rounded-lg transition-all flex items-center gap-2 font-diatype"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Publish
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBulkExport}
                      className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-lg transition-all flex items-center gap-2 font-diatype"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBulkArchive}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-lg transition-all flex items-center gap-2 font-diatype"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedCourses([])}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all font-diatype"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Select All Checkbox */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSelectAll}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2"
              >
                {selectedCourses.length === filteredCourses.length ? (
                  <CheckSquare className="w-5 h-5 text-cyan-400" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-white font-diatype text-sm">Select All</span>
              </motion.button>
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search courses, instructors..."
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all group"
              >
                {/* Course Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Selection Checkbox */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelectCourse(course.id)
                    }}
                    className="absolute top-4 left-4 z-10"
                  >
                    {selectedCourses.includes(course.id) ? (
                      <CheckSquare className="w-6 h-6 text-cyan-400 bg-white rounded" />
                    ) : (
                      <Square className="w-6 h-6 text-white/60 hover:text-white transition-colors" />
                    )}
                  </motion.button>

                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                        course.status === 'published'
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {course.status === 'published' ? 'Published' : 'Draft'}
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute bottom-4 left-4">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm bg-${getCategoryColor(
                        course.category
                      )}-500/20 text-${getCategoryColor(course.category)}-300 border border-${getCategoryColor(
                        course.category
                      )}-500/30`}
                    >
                      {categories.find((c) => c.id === course.category)?.name}
                    </div>
                  </div>
                </div>

                {/* Course Info */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-2 font-gendy line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4 font-diatype">By {course.instructor}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Users className="w-4 h-4" />
                      <span className="font-diatype">{course.students.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span className="font-diatype">{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-diatype">
                        {course.rating} ({course.reviews})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-diatype">${course.price}</span>
                    </div>
                  </div>

                  {/* Level & Lessons */}
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <span className="px-3 py-1 bg-white/5 rounded-lg text-gray-300 font-diatype">
                      {course.level}
                    </span>
                    <span className="text-gray-400 font-diatype">{course.lessons} lessons</span>
                  </div>

                  {/* Last Updated */}
                  <p className="text-xs text-gray-500 mb-4 font-diatype">
                    Last updated: {new Date(course.lastUpdated).toLocaleDateString()}
                  </p>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => handleOpenEditModal(course)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 rounded-lg transition-all flex items-center justify-center gap-2 font-diatype"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCloneCourse(course)}
                        className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 rounded-lg transition-all font-diatype"
                        title="Clone course"
                      >
                        <Copy className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedCourseForAnalytics(course)
                          setShowAnalyticsModal(true)
                        }}
                        className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 rounded-lg transition-all font-diatype"
                        title="View analytics"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowDeleteConfirm(course.id)}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-lg transition-all font-diatype"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleToggleStatus(course.id)}
                      className="w-full px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 rounded-lg transition-all flex items-center justify-center gap-2 font-diatype"
                    >
                      <Eye className="w-4 h-4" />
                      {course.status === 'published' ? 'Preview' : 'Publish & Preview'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <PlayCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2 font-gendy">No courses found</h3>
              <p className="text-gray-400 font-diatype">Try adjusting your filters or create a new course</p>
            </div>
          )}
        </div>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-8 right-8 z-[60] bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3"
          >
            <CheckCircle className="w-6 h-6" />
            <span className="font-semibold font-diatype">
              {successMessageType === 'update' ? 'Course updated successfully!' : 'Course created successfully!'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Course Create/Edit Modal */}
      <AnimatePresence>
        {showCourseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl my-8"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1 font-gendy">
                    {editingCourse ? 'Edit Course' : 'Create New Course'}
                  </h2>
                  <p className="text-sm text-gray-400 font-diatype">
                    {editingCourse
                      ? 'Update course details and content'
                      : 'Fill in the details to create a new course'}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Course Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleFormChange('title', e.target.value)}
                      placeholder="e.g., AI Transformation for Executives"
                      className={`w-full px-4 py-3 bg-white/5 border ${
                        formErrors.title ? 'border-red-500' : 'border-white/10'
                      } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype`}
                    />
                    {formErrors.title && (
                      <p className="text-red-400 text-sm mt-1 font-diatype">{formErrors.title}</p>
                    )}
                  </div>

                  {/* Instructor */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Instructor <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.instructor}
                      onChange={(e) => handleFormChange('instructor', e.target.value)}
                      placeholder="e.g., Sarah Chen"
                      className={`w-full px-4 py-3 bg-white/5 border ${
                        formErrors.instructor ? 'border-red-500' : 'border-white/10'
                      } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype`}
                    />
                    {formErrors.instructor && (
                      <p className="text-red-400 text-sm mt-1 font-diatype">{formErrors.instructor}</p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleFormChange('category', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Level */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Level
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) => handleFormChange('level', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype"
                    >
                      {levels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Duration <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => handleFormChange('duration', e.target.value)}
                      placeholder="e.g., 6 hours"
                      className={`w-full px-4 py-3 bg-white/5 border ${
                        formErrors.duration ? 'border-red-500' : 'border-white/10'
                      } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype`}
                    />
                    {formErrors.duration && (
                      <p className="text-red-400 text-sm mt-1 font-diatype">{formErrors.duration}</p>
                    )}
                  </div>

                  {/* Lessons */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Number of Lessons <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.lessons}
                      onChange={(e) => handleFormChange('lessons', parseInt(e.target.value) || 0)}
                      placeholder="e.g., 12"
                      min="0"
                      className={`w-full px-4 py-3 bg-white/5 border ${
                        formErrors.lessons ? 'border-red-500' : 'border-white/10'
                      } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype`}
                    />
                    {formErrors.lessons && (
                      <p className="text-red-400 text-sm mt-1 font-diatype">{formErrors.lessons}</p>
                    )}
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleFormChange('price', parseFloat(e.target.value) || 0)}
                      placeholder="e.g., 299"
                      min="0"
                      step="0.01"
                      className={`w-full px-4 py-3 bg-white/5 border ${
                        formErrors.price ? 'border-red-500' : 'border-white/10'
                      } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype`}
                    />
                    {formErrors.price && (
                      <p className="text-red-400 text-sm mt-1 font-diatype">{formErrors.price}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleFormChange('status', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>

                  {/* Image URL */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Image URL <span className="text-red-400">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) => handleFormChange('image', e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className={`flex-1 px-4 py-3 bg-white/5 border ${
                          formErrors.image ? 'border-red-500' : 'border-white/10'
                        } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype`}
                      />
                      <button className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                        <ImageIcon className="w-5 h-5" />
                      </button>
                    </div>
                    {formErrors.image && (
                      <p className="text-red-400 text-sm mt-1 font-diatype">{formErrors.image}</p>
                    )}
                    {/* Image Preview */}
                    {formData.image && !formErrors.image && (
                      <div className="mt-4 relative h-48 rounded-xl overflow-hidden border border-white/10">
                        <Image
                          src={formData.image}
                          alt="Preview"
                          fill
                          className="object-cover"
                          onError={() => handleFormChange('image', '')}
                        />
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      placeholder="Provide a detailed description of the course content, learning outcomes, and target audience..."
                      rows={4}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 p-6 border-t border-white/10">
                <button
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all font-semibold font-diatype disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCourse}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl transition-all font-semibold flex items-center justify-center gap-2 font-diatype disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Save className="w-5 h-5" />
                      </motion.div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {editingCourse ? 'Update Course' : 'Save Course'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analytics Modal */}
      <AnimatePresence>
        {showAnalyticsModal && selectedCourseForAnalytics && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAnalyticsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                  <h2 className="text-2xl font-bold text-white font-gendy">Course Analytics</h2>
                  <p className="text-sm text-gray-400 font-diatype">{selectedCourseForAnalytics.title}</p>
                </div>
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <Users className="w-5 h-5 text-blue-400 mb-2" />
                    <p className="text-2xl font-bold text-white mb-1 font-gendy">
                      {selectedCourseForAnalytics.students}
                    </p>
                    <p className="text-xs text-gray-400 font-diatype">Enrollments</p>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <CheckCircle className="w-5 h-5 text-green-400 mb-2" />
                    <p className="text-2xl font-bold text-white mb-1 font-gendy">87%</p>
                    <p className="text-xs text-gray-400 font-diatype">Completion Rate</p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <Star className="w-5 h-5 text-amber-400 mb-2" />
                    <p className="text-2xl font-bold text-white mb-1 font-gendy">
                      {selectedCourseForAnalytics.rating}
                    </p>
                    <p className="text-xs text-gray-400 font-diatype">Avg Rating</p>
                  </div>
                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
                    <DollarSign className="w-5 h-5 text-cyan-400 mb-2" />
                    <p className="text-2xl font-bold text-white mb-1 font-gendy">
                      ${(selectedCourseForAnalytics.students * selectedCourseForAnalytics.price).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 font-diatype">Revenue</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 mb-4">
                  <h3 className="text-white font-semibold mb-3 font-gendy">Enrollment Trend</h3>
                  <div className="h-40 flex items-end justify-between gap-2">
                    {[65, 78, 82, 95, 88, 92, 100].map((height, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t-lg"
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-xs text-gray-500 mt-2 font-diatype">W{i + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-lg transition-all flex items-center justify-center gap-2 font-diatype"
                  >
                    <Download className="w-5 h-5" />
                    Export Data
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAnalyticsModal(false)}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all font-diatype"
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-white/10 rounded-2xl p-8 max-w-md w-full"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 font-gendy">Delete Course?</h3>
                <p className="text-gray-400 font-diatype">
                  Are you sure you want to delete this course? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all font-diatype"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteCourse(showDeleteConfirm)}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all font-diatype"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
