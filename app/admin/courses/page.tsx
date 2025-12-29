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
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import { StatCard } from '@/components/atoms/StatCard'
import { Text, Heading } from '@/components/atoms/Text'
import { signOut } from '@/lib/auth/hooks'
import Image from 'next/image'
import { ImageGenerator } from '@/components/organisms/admin'

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

// Course interface matching database schema
interface Course {
  id: string
  title: string
  description?: string
  instructor_id?: string
  instructor?: {
    id: string
    full_name: string
    avatar_url?: string
  }
  pillar?: string
  difficulty_level?: string
  duration_weeks?: number
  estimated_hours?: number
  price_amount?: number
  price_currency?: string
  thumbnail_url?: string
  status: string
  category?: string
  tags?: string[]
  enrolled_count?: number
  completed_count?: number
  average_rating?: number
  review_count?: number
  created_at?: string
  updated_at?: string
}

// Transform DB course to display format
const transformCourse = (course: Course) => ({
  id: course.id,
  title: course.title,
  instructor: course.instructor?.full_name || 'Unknown Instructor',
  category: course.category || course.pillar || 'ai-adoption',
  level: course.difficulty_level || 'Intermediate',
  duration: course.estimated_hours ? `${course.estimated_hours} hours` : course.duration_weeks ? `${course.duration_weeks} weeks` : 'TBD',
  lessons: 0, // Not tracked in current schema
  students: course.enrolled_count || 0,
  rating: course.average_rating || 0,
  reviews: course.review_count || 0,
  price: course.price_amount || 0,
  image: course.thumbnail_url || 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop',
  status: course.status || 'draft',
  lastUpdated: course.updated_at ? new Date(course.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  description: course.description,
  tags: course.tags,
})

export default function CoursesAdmin() {
  const router = useRouter()
  const { userData, authLoading } = useChat()
  const [showContent, setShowContent] = useState(false)
  const [courses, setCourses] = useState<ReturnType<typeof transformCourse>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [editingCourse, setEditingCourse] = useState<any>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessageType, setSuccessMessageType] = useState<'create' | 'update'>('create')
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false)
  const [selectedCourseForAnalytics, setSelectedCourseForAnalytics] = useState<any>(null)
  const [showImageGenerator, setShowImageGenerator] = useState(false)

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

  // Fetch courses from database
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true)
        setLoadError(null)

        // Fetch all courses (including drafts for admin)
        const response = await fetch('/api/courses?status=all&limit=100')
        const result = await response.json()

        if (result.success && result.data) {
          const transformedCourses = result.data.map(transformCourse)
          setCourses(transformedCourses)
        } else if (result.error) {
          // If no courses found or permission issue, show empty state
          console.log('[CoursesAdmin] API response:', result)
          setCourses([])
        }
      } catch (error) {
        console.error('[CoursesAdmin] Failed to fetch courses:', error)
        setLoadError('Failed to load courses from database')
        setCourses([])
      } finally {
        setIsLoading(false)
      }
    }

    if (showContent) {
      fetchCourses()
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
          <LoadingSpinner variant="neural" size="xl" text="Loading courses..." />
        </div>
      </div>
    )
  }

  // Show error state if loading failed
  if (loadError) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--hg-bg-primary)' }}>
        <DashboardSidebar onLogout={handleLogout} />
        <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 flex flex-col items-center justify-center min-h-screen gap-4">
          <p className="text-red-400 font-diatype">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition-colors font-diatype"
          >
            Retry
          </button>
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

  const handleDeleteCourse = (courseId: string) => {
    setCourses(courses.filter((c) => c.id !== courseId))
    setShowDeleteConfirm(null)
  }

  const handleToggleStatus = (courseId: string) => {
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
  const handleSelectCourse = (courseId: string) => {
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
      id: `temp-${Date.now()}`, // Generate temporary string ID for local clone
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
        id: `temp-${Date.now()}`, // Generate temporary string ID for local course
        ...formData,
        students: 0,
        rating: 0,
        reviews: 0,
        tags: undefined,
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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--hg-bg-primary)' }}>
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        {/* Header */}
        <div className="border-b" style={{ backgroundColor: 'var(--hg-bg-sidebar)', borderColor: 'var(--hg-border-color)' }}>
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Link href="/admin">
                    <Text variant="muted" size="sm" className="hover:underline">← Back to Dashboard</Text>
                  </Link>
                </div>
                <Heading as="h1" size="3xl" className="mb-2">Course Management</Heading>
                <Text variant="muted">
                  Manage your learning platform content ({filteredCourses.length} courses)
                </Text>
              </div>
              <Button
                variant="primary"
                size="lg"
                icon={<Plus className="w-5 h-5" />}
                onClick={handleOpenCreateModal}
              >
                Add New Course
              </Button>
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
                className="rounded-2xl p-4 mb-6 border"
                style={{ backgroundColor: 'var(--hg-cyan-bg)', borderColor: 'var(--hg-cyan-border)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CheckSquare className="w-5 h-5" style={{ color: 'var(--hg-cyan-text)' }} />
                    <span className="font-semibold font-diatype" style={{ color: 'var(--hg-text-primary)' }}>
                      {selectedCourses.length} course{selectedCourses.length > 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBulkPublish}
                      className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 rounded-lg transition-all flex items-center gap-2 font-diatype"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Publish
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBulkExport}
                      className="px-4 py-2 rounded-lg transition-all flex items-center gap-2 font-diatype border"
                      style={{ backgroundColor: 'var(--hg-cyan-bg)', borderColor: 'var(--hg-cyan-border)', color: 'var(--hg-cyan-text)' }}
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
                      className="px-4 py-2 rounded-lg transition-all font-diatype border"
                      style={{ backgroundColor: 'var(--hg-bg-secondary)', borderColor: 'var(--hg-border-color)', color: 'var(--hg-text-primary)' }}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="border rounded-2xl p-6 mb-6" style={{ backgroundColor: 'var(--hg-bg-card)', borderColor: 'var(--hg-border-color)' }}>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Select All Checkbox */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSelectAll}
                className="px-4 py-3 rounded-xl transition-all flex items-center gap-2 border"
                style={{ backgroundColor: 'var(--hg-bg-secondary)', borderColor: 'var(--hg-border-color)' }}
              >
                {selectedCourses.length === filteredCourses.length ? (
                  <CheckSquare className="w-5 h-5" style={{ color: 'var(--hg-cyan-text)' }} />
                ) : (
                  <Square className="w-5 h-5" style={{ color: 'var(--hg-text-muted)' }} />
                )}
                <span className="font-diatype text-sm" style={{ color: 'var(--hg-text-primary)' }}>Select All</span>
              </motion.button>
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--hg-text-muted)' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search courses, instructors..."
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

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 rounded-xl transition-all font-diatype border focus:outline-none"
                style={{ backgroundColor: 'var(--hg-bg-secondary)', borderColor: 'var(--hg-border-color)', color: 'var(--hg-text-primary)' }}
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
                className="px-4 py-3 rounded-xl transition-all font-diatype border focus:outline-none"
                style={{ backgroundColor: 'var(--hg-bg-secondary)', borderColor: 'var(--hg-border-color)', color: 'var(--hg-text-primary)' }}
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
                className="border rounded-2xl overflow-hidden transition-all group hover:border-[var(--hg-cyan-border)]"
                style={{ backgroundColor: 'var(--hg-bg-card)', borderColor: 'var(--hg-border-color)' }}
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
                          ? 'bg-green-500/20 text-[var(--hg-cyan-text)] border border-green-500/30'
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
                  <h3 className="text-lg font-bold mb-2 font-gendy line-clamp-2" style={{ color: 'var(--hg-text-primary)' }}>
                    {course.title}
                  </h3>
                  <p className="text-sm mb-4 font-diatype" style={{ color: 'var(--hg-text-muted)' }}>By {course.instructor}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--hg-text-muted)' }}>
                      <Users className="w-4 h-4" />
                      <span className="font-diatype">{course.students.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--hg-text-muted)' }}>
                      <Clock className="w-4 h-4" />
                      <span className="font-diatype">{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--hg-text-muted)' }}>
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-diatype">
                        {course.rating} ({course.reviews})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--hg-text-muted)' }}>
                      <DollarSign className="w-4 h-4" />
                      <span className="font-diatype">${course.price}</span>
                    </div>
                  </div>

                  {/* Level & Lessons */}
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <span className="px-3 py-1 rounded-lg font-diatype" style={{ backgroundColor: 'var(--hg-bg-secondary)', color: 'var(--hg-text-secondary)' }}>
                      {course.level}
                    </span>
                    <span className="font-diatype" style={{ color: 'var(--hg-text-muted)' }}>{course.lessons} lessons</span>
                  </div>

                  {/* Last Updated */}
                  <p className="text-xs mb-4 font-diatype" style={{ color: 'var(--hg-text-muted)' }}>
                    Last updated: {new Date(course.lastUpdated).toLocaleDateString()}
                  </p>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => handleOpenEditModal(course)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 font-diatype border"
                        style={{ backgroundColor: 'var(--hg-cyan-bg)', borderColor: 'var(--hg-cyan-border)', color: 'var(--hg-cyan-text)' }}
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCloneCourse(course)}
                        className="px-4 py-2 rounded-lg transition-all font-diatype border"
                        style={{ backgroundColor: 'var(--hg-cyan-bg)', borderColor: 'var(--hg-cyan-border)', color: 'var(--hg-cyan-text)' }}
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
                      className="w-full px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 rounded-lg transition-all flex items-center justify-center gap-2 font-diatype"
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
              <PlayCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--hg-text-muted)' }} />
              <h3 className="text-xl font-semibold mb-2 font-gendy" style={{ color: 'var(--hg-text-primary)' }}>No courses found</h3>
              <p className="font-diatype" style={{ color: 'var(--hg-text-muted)' }}>Try adjusting your filters or create a new course</p>
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
                      Course Image <span className="text-red-400">*</span>
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
                      <button
                        type="button"
                        onClick={() => setShowImageGenerator(true)}
                        className="px-4 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl text-purple-300 hover:text-white hover:from-purple-500/30 hover:to-blue-500/30 transition-all flex items-center gap-2"
                        title="Generate with AI"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        <span className="font-diatype text-sm">AI Generate</span>
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
                          unoptimized={formData.image.startsWith('data:')}
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
                    <Users className="w-5 h-5 text-[var(--hg-cyan-text)] mb-2" />
                    <p className="text-2xl font-bold text-white mb-1 font-gendy">
                      {selectedCourseForAnalytics.students}
                    </p>
                    <p className="text-xs text-gray-400 font-diatype">Enrollments</p>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <CheckCircle className="w-5 h-5 text-[var(--hg-cyan-text)] mb-2" />
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
                    className="flex-1 px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-[var(--hg-cyan-text)] rounded-lg transition-all flex items-center justify-center gap-2 font-diatype"
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

      {/* Image Generator Modal */}
      <ImageGenerator
        mode="modal"
        isOpen={showImageGenerator}
        onClose={() => setShowImageGenerator(false)}
        currentImage={formData.image}
        contentTitle={formData.title}
        contentType="course"
        onImageSelect={(imageUrl) => {
          handleFormChange('image', imageUrl)
          setShowImageGenerator(false)
        }}
      />
    </div>
  )
}
