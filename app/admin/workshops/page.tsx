'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Search,
  Users,
  Clock,
  MapPin,
  Video,
  X,
  Save,
  Upload,
  Mail,
  CheckCircle,
  AlertCircle,
  UserPlus,
  FileText,
  Download,
  BarChart3,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner'
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import { Text, Heading } from '@/components/atoms/Text'
import { signOut } from '@/lib/auth/hooks'
import Image from 'next/image'
import { ImageGenerator } from '@/components/organisms/admin'

// Workshop types
type WorkshopStatus = 'upcoming' | 'in-progress' | 'completed' | 'draft'
type WorkshopType = 'online' | 'in-person' | 'hybrid'

interface Workshop {
  id: number
  title: string
  instructor: string
  type: WorkshopType
  status: WorkshopStatus
  date: string
  time: string
  duration: string
  capacity: number
  enrolled: number
  waitlist: number
  location?: string
  meetingLink?: string
  description?: string
  materials?: string[]
  price: number
  image: string
}

// DB Workshop interface
interface DBWorkshop {
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
  level?: string
  format?: string
  schedule_date?: string
  schedule_time?: string
  duration_minutes?: number
  capacity_total?: number
  capacity_remaining?: number
  price_amount?: number
  price_currency?: string
  thumbnail_url?: string
  video_url?: string
  status: string
  is_featured?: boolean
  enrolled_count?: number
  registrations?: { count: number }[]
  created_at?: string
  updated_at?: string
}

// Transform DB workshop to display format
const transformWorkshop = (workshop: DBWorkshop): Workshop => ({
  id: parseInt(workshop.id) || 0, // Map UUID to number for compatibility
  title: workshop.title,
  instructor: workshop.instructor?.full_name || 'Unknown Instructor',
  type: (workshop.format || 'online') as WorkshopType,
  status: mapDBStatusToUIStatus(workshop.status, workshop.schedule_date),
  date: workshop.schedule_date || '',
  time: workshop.schedule_time || '',
  duration: workshop.duration_minutes ? `${Math.round(workshop.duration_minutes / 60)} hours` : 'TBD',
  capacity: workshop.capacity_total || 30,
  enrolled: workshop.enrolled_count || workshop.registrations?.[0]?.count || 0,
  waitlist: 0, // Not tracked in current schema
  location: workshop.format === 'in_person' || workshop.format === 'hybrid' ? 'Location TBD' : undefined,
  meetingLink: workshop.video_url,
  description: workshop.description,
  price: workshop.price_amount || 0,
  image: workshop.thumbnail_url || 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop',
})

// Map DB status to UI status
const mapDBStatusToUIStatus = (dbStatus: string, scheduleDate?: string): WorkshopStatus => {
  if (dbStatus === 'draft') return 'draft'
  if (dbStatus === 'archived' || dbStatus === 'cancelled') return 'completed'
  if (dbStatus === 'published' && scheduleDate) {
    const workshopDate = new Date(scheduleDate)
    const now = new Date()
    if (workshopDate < now) return 'completed'
    return 'upcoming'
  }
  return 'draft'
}

export default function WorkshopsAdmin() {
  const { userData, authLoading } = useChat()
  const [showContent, setShowContent] = useState(false)
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showWorkshopModal, setShowWorkshopModal] = useState(false)
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [showImageGenerator, setShowImageGenerator] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    instructor: '',
    type: 'online' as WorkshopType,
    status: 'draft' as WorkshopStatus,
    date: '',
    time: '',
    duration: '',
    capacity: 30,
    location: '',
    meetingLink: '',
    price: 0,
    description: '',
    image: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Check admin access with timeout pattern
  useEffect(() => {
    if (!authLoading && userData?.isAdmin) {
      setShowContent(true)
      return
    }

    const timeout = setTimeout(() => {
      console.log('[WorkshopsAdmin] Auth timeout - trusting middleware protection')
      setShowContent(true)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [authLoading, userData])

  // Fetch workshops from database
  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        setIsLoading(true)
        setLoadError(null)

        // Fetch all workshops (including drafts for admin)
        const response = await fetch('/api/workshops?status=all&limit=100')
        const result = await response.json()

        if (result.success && result.data) {
          const transformedWorkshops = result.data.map(transformWorkshop)
          setWorkshops(transformedWorkshops)
        } else if (result.error) {
          console.log('[WorkshopsAdmin] API response:', result)
          setWorkshops([])
        }
      } catch (error) {
        console.error('[WorkshopsAdmin] Failed to fetch workshops:', error)
        setLoadError('Failed to load workshops from database')
        setWorkshops([])
      } finally {
        setIsLoading(false)
      }
    }

    if (showContent) {
      fetchWorkshops()
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
          <LoadingSpinner variant="neural" size="xl" text="Loading workshops..." />
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
          <Text className="text-red-400">{loadError}</Text>
          <Button variant="cyan" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const filteredWorkshops = workshops.filter((workshop) => {
    const matchesSearch =
      searchQuery === '' ||
      workshop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workshop.instructor.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || workshop.status === selectedStatus
    const matchesType = selectedType === 'all' || workshop.type === selectedType
    return matchesSearch && matchesStatus && matchesType
  })

  const handleOpenCreateModal = () => {
    setEditingWorkshop(null)
    setFormData({
      title: '',
      instructor: '',
      type: 'online',
      status: 'draft',
      date: '',
      time: '',
      duration: '',
      capacity: 30,
      location: '',
      meetingLink: '',
      price: 0,
      description: '',
      image: '',
    })
    setFormErrors({})
    setShowWorkshopModal(true)
  }

  const handleOpenEditModal = (workshop: Workshop) => {
    setEditingWorkshop(workshop)
    setFormData({
      title: workshop.title,
      instructor: workshop.instructor,
      type: workshop.type,
      status: workshop.status,
      date: workshop.date,
      time: workshop.time,
      duration: workshop.duration,
      capacity: workshop.capacity,
      location: workshop.location || '',
      meetingLink: workshop.meetingLink || '',
      price: workshop.price,
      description: workshop.description || '',
      image: workshop.image,
    })
    setFormErrors({})
    setShowWorkshopModal(true)
  }

  const handleCloseModal = () => {
    setShowWorkshopModal(false)
    setEditingWorkshop(null)
    setFormErrors({})
  }

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.title.trim()) errors.title = 'Title is required'
    if (!formData.instructor.trim()) errors.instructor = 'Instructor is required'
    if (!formData.date) errors.date = 'Date is required'
    if (!formData.time) errors.time = 'Time is required'
    if (!formData.duration.trim()) errors.duration = 'Duration is required'
    if (formData.capacity <= 0) errors.capacity = 'Capacity must be greater than 0'
    if (!formData.image.trim()) errors.image = 'Image URL is required'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveWorkshop = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (editingWorkshop) {
      setWorkshops(
        workshops.map((w) =>
          w.id === editingWorkshop.id
            ? {
                ...w,
                ...formData,
                enrolled: w.enrolled,
                waitlist: w.waitlist,
              }
            : w
        )
      )
    } else {
      const newWorkshop: Workshop = {
        id: Math.max(...workshops.map((w) => w.id)) + 1,
        ...formData,
        enrolled: 0,
        waitlist: 0,
      }
      setWorkshops([newWorkshop, ...workshops])
    }

    setIsSubmitting(false)
    setShowWorkshopModal(false)
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 3000)
  }

  const handleDeleteWorkshop = (workshopId: number) => {
    setWorkshops(workshops.filter((w) => w.id !== workshopId))
    setShowDeleteConfirm(null)
  }

  const getStatusBadge = (status: WorkshopStatus) => {
    const badges = {
      upcoming: 'bg-blue-500/20 text-[var(--hg-cyan-text)] border-blue-500/30',
      'in-progress': 'bg-green-500/20 text-[var(--hg-cyan-text)] border-green-500/30',
      completed: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      draft: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    }
    return badges[status]
  }

  const getTypeBadge = (type: WorkshopType) => {
    const badges = {
      online: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      'in-person': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      hybrid: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    }
    return badges[type]
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
                <div className="flex items-center gap-3 mb-2">
                  <Link href="/admin" className="transition-colors hover:underline hg-text-muted">
                    <Text size="sm">← Back to Dashboard</Text>
                  </Link>
                </div>
                <Heading as="h1" size="3xl" className="mb-2">Workshop Management</Heading>
                <Text variant="muted">
                  Manage live training sessions ({filteredWorkshops.length} workshops)
                </Text>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={handleOpenCreateModal}
                icon={<Plus className="w-5 h-5" />}
              >
                Schedule Workshop
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-8">
          <Card padding="lg" className="mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 hg-text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search workshops, instructors..."
                    className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-diatype hg-bg-secondary hg-border hg-text-primary"
                    style={{ '--tw-ring-color': 'var(--hg-cyan-border)' } as React.CSSProperties}
                  />
                </div>
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-diatype hg-bg-secondary hg-border hg-text-primary"
                style={{ '--tw-ring-color': 'var(--hg-cyan-border)' } as React.CSSProperties}
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="draft">Draft</option>
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-diatype hg-bg-secondary hg-border hg-text-primary"
                style={{ '--tw-ring-color': 'var(--hg-cyan-border)' } as React.CSSProperties}
              >
                <option value="all">All Types</option>
                <option value="online">Online</option>
                <option value="in-person">In-Person</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </Card>

          {/* Workshops Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredWorkshops.map((workshop, index) => (
              <motion.div
                key={workshop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border rounded-2xl overflow-hidden hover:border-[var(--hg-cyan-border)] transition-all group"
                style={{ backgroundColor: 'var(--hg-bg-card)', borderColor: 'var(--hg-border-color)' }}
              >
                {/* Workshop Image */}
                <div className="relative h-48" style={{ backgroundColor: 'var(--hg-bg-secondary)' }}>
                  <img
                    src={workshop.image}
                    alt={workshop.title}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border ${getStatusBadge(workshop.status)}`}>
                      {workshop.status}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border ${getTypeBadge(workshop.type)}`}>
                      {workshop.type}
                    </div>
                  </div>

                  {/* Date Badge */}
                  <div className="absolute bottom-4 left-4">
                    <div className="backdrop-blur-sm rounded-lg p-2 border" style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderColor: 'var(--hg-border-color)' }}>
                      <p className="text-sm font-semibold font-diatype" style={{ color: 'var(--hg-text-primary)' }}>
                        {new Date(workshop.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-xs font-diatype" style={{ color: 'var(--hg-text-muted)' }}>{workshop.time}</p>
                    </div>
                  </div>
                </div>

                {/* Workshop Info */}
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2 font-gendy line-clamp-2" style={{ color: 'var(--hg-text-primary)' }}>
                    {workshop.title}
                  </h3>
                  <p className="text-sm mb-4 font-diatype" style={{ color: 'var(--hg-text-muted)' }}>By {workshop.instructor}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--hg-text-muted)' }}>
                      <Users className="w-4 h-4" />
                      <span className="font-diatype">
                        {workshop.enrolled}/{workshop.capacity}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--hg-text-muted)' }}>
                      <Clock className="w-4 h-4" />
                      <span className="font-diatype">{workshop.duration}</span>
                    </div>
                    {workshop.waitlist > 0 && (
                      <div className="flex items-center gap-2 text-sm text-amber-400">
                        <UserPlus className="w-4 h-4" />
                        <span className="font-diatype">{workshop.waitlist} waitlist</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--hg-text-muted)' }}>
                      {workshop.type === 'online' ? (
                        <Video className="w-4 h-4" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                      <span className="font-diatype text-xs">
                        {workshop.type === 'online' ? 'Online' : workshop.location}
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-2xl font-bold font-gendy" style={{ color: 'var(--hg-text-primary)' }}>${workshop.price}</span>
                    <span className="text-sm font-diatype" style={{ color: 'var(--hg-text-muted)' }}> per person</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="cyan"
                      size="sm"
                      onClick={() => handleOpenEditModal(workshop)}
                      icon={<Edit className="w-4 h-4" />}
                      fullWidth
                    >
                      Edit
                    </Button>
                    {workshop.status !== 'draft' && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => {
                          setSelectedWorkshop(workshop)
                          setShowAttendanceModal(true)
                        }}
                        icon={<Users className="w-4 h-4" />}
                      />
                    )}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(workshop.id)}
                      icon={<Trash2 className="w-4 h-4" />}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredWorkshops.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto mb-4 hg-text-muted" />
              <Heading as="h3" size="xl" className="mb-2">No workshops found</Heading>
              <Text variant="muted">Try adjusting your filters or schedule a new workshop</Text>
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
            <span className="font-semibold font-diatype">Workshop saved successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workshop Modal */}
      <AnimatePresence>
        {showWorkshopModal && (
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
              className="border rounded-2xl w-full max-w-4xl my-8"
              style={{ backgroundColor: 'var(--hg-bg-card)', borderColor: 'var(--hg-border-color)' }}
            >
              <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--hg-border-color)' }}>
                <div>
                  <h2 className="text-2xl font-bold mb-1 font-gendy" style={{ color: 'var(--hg-text-primary)' }}>
                    {editingWorkshop ? 'Edit Workshop' : 'Schedule New Workshop'}
                  </h2>
                  <p className="text-sm font-diatype" style={{ color: 'var(--hg-text-muted)' }}>
                    Fill in the details for the workshop session
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: 'var(--hg-text-muted)' }}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2 font-diatype" style={{ color: 'var(--hg-text-primary)' }}>
                      Workshop Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleFormChange('title', e.target.value)}
                      placeholder="e.g., AI Strategy & Implementation"
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-diatype"
                      style={{
                        backgroundColor: 'var(--hg-bg-secondary)',
                        borderColor: formErrors.title ? 'var(--hg-danger)' : 'var(--hg-border-color)',
                        color: 'var(--hg-text-primary)',
                        '--tw-ring-color': 'var(--hg-cyan-border)'
                      } as React.CSSProperties}
                    />
                    {formErrors.title && (
                      <p className="text-red-400 text-sm mt-1 font-diatype">{formErrors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 font-diatype" style={{ color: 'var(--hg-text-primary)' }}>
                      Instructor <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.instructor}
                      onChange={(e) => handleFormChange('instructor', e.target.value)}
                      placeholder="e.g., Sarah Chen"
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-diatype"
                      style={{
                        backgroundColor: 'var(--hg-bg-secondary)',
                        borderColor: formErrors.instructor ? 'var(--hg-danger)' : 'var(--hg-border-color)',
                        color: 'var(--hg-text-primary)',
                        '--tw-ring-color': 'var(--hg-cyan-border)'
                      } as React.CSSProperties}
                    />
                    {formErrors.instructor && (
                      <p className="text-red-400 text-sm mt-1 font-diatype">{formErrors.instructor}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 font-diatype" style={{ color: 'var(--hg-text-primary)' }}>
                      Workshop Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleFormChange('type', e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-diatype"
                      style={{
                        backgroundColor: 'var(--hg-bg-secondary)',
                        borderColor: 'var(--hg-border-color)',
                        color: 'var(--hg-text-primary)',
                        '--tw-ring-color': 'var(--hg-cyan-border)'
                      } as React.CSSProperties}
                    >
                      <option value="online">Online</option>
                      <option value="in-person">In-Person</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 font-diatype" style={{ color: 'var(--hg-text-primary)' }}>
                      Date <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleFormChange('date', e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-diatype"
                      style={{
                        backgroundColor: 'var(--hg-bg-secondary)',
                        borderColor: formErrors.date ? 'var(--hg-danger)' : 'var(--hg-border-color)',
                        color: 'var(--hg-text-primary)',
                        '--tw-ring-color': 'var(--hg-cyan-border)'
                      } as React.CSSProperties}
                    />
                    {formErrors.date && (
                      <p className="text-red-400 text-sm mt-1 font-diatype">{formErrors.date}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 font-diatype" style={{ color: 'var(--hg-text-primary)' }}>
                      Time <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleFormChange('time', e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-diatype"
                      style={{
                        backgroundColor: 'var(--hg-bg-secondary)',
                        borderColor: formErrors.time ? 'var(--hg-danger)' : 'var(--hg-border-color)',
                        color: 'var(--hg-text-primary)',
                        '--tw-ring-color': 'var(--hg-cyan-border)'
                      } as React.CSSProperties}
                    />
                    {formErrors.time && (
                      <p className="text-red-400 text-sm mt-1 font-diatype">{formErrors.time}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 font-diatype" style={{ color: 'var(--hg-text-primary)' }}>
                      Duration <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => handleFormChange('duration', e.target.value)}
                      placeholder="e.g., 3 hours"
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-diatype"
                      style={{
                        backgroundColor: 'var(--hg-bg-secondary)',
                        borderColor: formErrors.duration ? 'var(--hg-danger)' : 'var(--hg-border-color)',
                        color: 'var(--hg-text-primary)',
                        '--tw-ring-color': 'var(--hg-cyan-border)'
                      } as React.CSSProperties}
                    />
                    {formErrors.duration && (
                      <p className="text-red-400 text-sm mt-1 font-diatype">{formErrors.duration}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 font-diatype" style={{ color: 'var(--hg-text-primary)' }}>
                      Capacity <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => handleFormChange('capacity', parseInt(e.target.value) || 0)}
                      placeholder="e.g., 30"
                      min="1"
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-diatype"
                      style={{
                        backgroundColor: 'var(--hg-bg-secondary)',
                        borderColor: formErrors.capacity ? 'var(--hg-danger)' : 'var(--hg-border-color)',
                        color: 'var(--hg-text-primary)',
                        '--tw-ring-color': 'var(--hg-cyan-border)'
                      } as React.CSSProperties}
                    />
                    {formErrors.capacity && (
                      <p className="text-red-400 text-sm mt-1 font-diatype">{formErrors.capacity}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 font-diatype" style={{ color: 'var(--hg-text-primary)' }}>Price ($)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleFormChange('price', parseFloat(e.target.value) || 0)}
                      placeholder="e.g., 499"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-diatype"
                      style={{
                        backgroundColor: 'var(--hg-bg-secondary)',
                        borderColor: 'var(--hg-border-color)',
                        color: 'var(--hg-text-primary)',
                        '--tw-ring-color': 'var(--hg-cyan-border)'
                      } as React.CSSProperties}
                    />
                  </div>

                  {(formData.type === 'in-person' || formData.type === 'hybrid') && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2 font-diatype" style={{ color: 'var(--hg-text-primary)' }}>
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleFormChange('location', e.target.value)}
                        placeholder="e.g., Innovation Hub, NYC"
                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-diatype"
                        style={{
                          backgroundColor: 'var(--hg-bg-secondary)',
                          borderColor: 'var(--hg-border-color)',
                          color: 'var(--hg-text-primary)',
                          '--tw-ring-color': 'var(--hg-cyan-border)'
                        } as React.CSSProperties}
                      />
                    </div>
                  )}

                  {(formData.type === 'online' || formData.type === 'hybrid') && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2 font-diatype" style={{ color: 'var(--hg-text-primary)' }}>
                        Meeting Link
                      </label>
                      <input
                        type="url"
                        value={formData.meetingLink}
                        onChange={(e) => handleFormChange('meetingLink', e.target.value)}
                        placeholder="https://meet.humanglue.ai/workshop-..."
                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-diatype"
                        style={{
                          backgroundColor: 'var(--hg-bg-secondary)',
                          borderColor: 'var(--hg-border-color)',
                          color: 'var(--hg-text-primary)',
                          '--tw-ring-color': 'var(--hg-cyan-border)'
                        } as React.CSSProperties}
                      />
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2 font-diatype" style={{ color: 'var(--hg-text-primary)' }}>
                      Image URL <span className="text-red-400">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) => handleFormChange('image', e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-diatype"
                        style={{
                          backgroundColor: 'var(--hg-bg-secondary)',
                          borderColor: formErrors.image ? 'var(--hg-danger)' : 'var(--hg-border-color)',
                          color: 'var(--hg-text-primary)',
                          '--tw-ring-color': 'var(--hg-cyan-border)'
                        } as React.CSSProperties}
                      />
                      <button
                        type="button"
                        onClick={() => setShowImageGenerator(true)}
                        className="px-4 py-3 rounded-xl font-semibold font-diatype transition-all flex items-center gap-2"
                        style={{
                          background: 'linear-gradient(135deg, var(--hg-cyan), var(--hg-magenta))',
                          color: 'white'
                        }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        AI Generate
                      </button>
                    </div>
                    {formErrors.image && (
                      <p className="text-red-400 text-sm mt-1 font-diatype">{formErrors.image}</p>
                    )}
                    {formData.image && (
                      <div className="mt-3 relative rounded-xl overflow-hidden border" style={{ borderColor: 'var(--hg-border-color)' }}>
                        <Image
                          src={formData.image}
                          alt="Workshop preview"
                          width={400}
                          height={200}
                          className="w-full h-48 object-cover"
                          unoptimized={formData.image.startsWith('data:')}
                        />
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2 font-diatype" style={{ color: 'var(--hg-text-primary)' }}>
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      placeholder="Provide a detailed description of the workshop..."
                      rows={4}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-diatype resize-none"
                      style={{
                        backgroundColor: 'var(--hg-bg-secondary)',
                        borderColor: 'var(--hg-border-color)',
                        color: 'var(--hg-text-primary)',
                        '--tw-ring-color': 'var(--hg-cyan-border)'
                      } as React.CSSProperties}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t hg-border">
                <Button
                  variant="secondary"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  fullWidth
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveWorkshop}
                  disabled={isSubmitting}
                  icon={<Save className={`w-5 h-5 ${isSubmitting ? 'animate-spin' : ''}`} />}
                  fullWidth
                >
                  {isSubmitting ? 'Saving...' : (editingWorkshop ? 'Update Workshop' : 'Save Workshop')}
                </Button>
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
              className="max-w-md w-full"
            >
              <Card padding="xl">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-red-400" />
                  </div>
                  <Heading as="h3" size="2xl" className="mb-2">Delete Workshop?</Heading>
                  <Text variant="muted">
                    This action cannot be undone. All participant data will be preserved.
                  </Text>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowDeleteConfirm(null)}
                    fullWidth
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteWorkshop(showDeleteConfirm)}
                    fullWidth
                  >
                    Delete
                  </Button>
                </div>
              </Card>
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
        contentType="workshop"
        onImageSelect={(imageUrl) => {
          handleFormChange('image', imageUrl)
          setShowImageGenerator(false)
        }}
      />
    </div>
  )
}
