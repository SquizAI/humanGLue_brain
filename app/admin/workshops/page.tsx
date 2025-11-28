'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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

const initialWorkshops: Workshop[] = [
  {
    id: 1,
    title: 'AI Strategy & Implementation',
    instructor: 'Sarah Chen',
    type: 'hybrid',
    status: 'upcoming',
    date: '2025-10-15',
    time: '14:00',
    duration: '3 hours',
    capacity: 30,
    enrolled: 24,
    waitlist: 5,
    location: 'Innovation Hub, NYC',
    meetingLink: 'https://meet.humanglue.ai/workshop-1',
    price: 499,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop',
  },
  {
    id: 2,
    title: 'Change Management Masterclass',
    instructor: 'Dr. Marcus Thompson',
    type: 'online',
    status: 'upcoming',
    date: '2025-10-20',
    time: '10:00',
    duration: '4 hours',
    capacity: 50,
    enrolled: 45,
    waitlist: 12,
    meetingLink: 'https://meet.humanglue.ai/workshop-2',
    price: 399,
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=500&fit=crop',
  },
  {
    id: 3,
    title: 'Leadership in AI Era',
    instructor: 'Jennifer Wu',
    type: 'in-person',
    status: 'in-progress',
    date: '2025-10-04',
    time: '09:00',
    duration: '6 hours',
    capacity: 25,
    enrolled: 25,
    waitlist: 8,
    location: 'Tech Center, San Francisco',
    price: 699,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop',
  },
  {
    id: 4,
    title: 'Data Ethics Workshop',
    instructor: 'Prof. David Kim',
    type: 'online',
    status: 'completed',
    date: '2025-09-28',
    time: '13:00',
    duration: '2 hours',
    capacity: 40,
    enrolled: 38,
    waitlist: 0,
    meetingLink: 'https://meet.humanglue.ai/workshop-4',
    price: 299,
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=500&fit=crop',
  },
]

export default function WorkshopsAdmin() {
  const router = useRouter()
  const { userData, authLoading } = useChat()
  const [showContent, setShowContent] = useState(false)
  const [workshops, setWorkshops] = useState<Workshop[]>(initialWorkshops)
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

  useEffect(() => {
    if (!authLoading && userData && !userData.isAdmin) {
      console.log('[WorkshopsAdmin] Redirecting to login - not admin')
      router.push('/login')
    }
  }, [userData, router, authLoading])

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
      upcoming: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'in-progress': 'bg-green-500/20 text-green-300 border-green-500/30',
      completed: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      draft: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    }
    return badges[status]
  }

  const getTypeBadge = (type: WorkshopType) => {
    const badges = {
      online: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'in-person': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      hybrid: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    }
    return badges[type]
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
                <div className="flex items-center gap-3 mb-2">
                  <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">
                    <span className="font-diatype">← Back to Dashboard</span>
                  </Link>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2 font-gendy">Workshop Management</h1>
                <p className="text-gray-400 font-diatype">
                  Manage live training sessions ({filteredWorkshops.length} workshops)
                </p>
              </div>
              <motion.button
                onClick={handleOpenCreateModal}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-diatype"
              >
                <Plus className="w-5 h-5" />
                Schedule Workshop
              </motion.button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search workshops, instructors..."
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-diatype"
                  />
                </div>
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-diatype"
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
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-diatype"
              >
                <option value="all">All Types</option>
                <option value="online">Online</option>
                <option value="in-person">In-Person</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {/* Workshops Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredWorkshops.map((workshop, index) => (
              <motion.div
                key={workshop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group"
              >
                {/* Workshop Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-900/30 to-cyan-900/30">
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
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2 border border-white/10">
                      <p className="text-white text-sm font-semibold font-diatype">
                        {new Date(workshop.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-gray-400 text-xs font-diatype">{workshop.time}</p>
                    </div>
                  </div>
                </div>

                {/* Workshop Info */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-2 font-gendy line-clamp-2">
                    {workshop.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4 font-diatype">By {workshop.instructor}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Users className="w-4 h-4" />
                      <span className="font-diatype">
                        {workshop.enrolled}/{workshop.capacity}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span className="font-diatype">{workshop.duration}</span>
                    </div>
                    {workshop.waitlist > 0 && (
                      <div className="flex items-center gap-2 text-sm text-amber-400">
                        <UserPlus className="w-4 h-4" />
                        <span className="font-diatype">{workshop.waitlist} waitlist</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-400">
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
                    <span className="text-2xl font-bold text-white font-gendy">${workshop.price}</span>
                    <span className="text-gray-400 text-sm font-diatype"> per person</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => handleOpenEditModal(workshop)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-lg transition-all flex items-center justify-center gap-2 font-diatype"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </motion.button>
                    {workshop.status !== 'draft' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedWorkshop(workshop)
                          setShowAttendanceModal(true)
                        }}
                        className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 rounded-lg transition-all font-diatype"
                      >
                        <Users className="w-4 h-4" />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowDeleteConfirm(workshop.id)}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-lg transition-all font-diatype"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredWorkshops.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2 font-gendy">No workshops found</h3>
              <p className="text-gray-400 font-diatype">Try adjusting your filters or schedule a new workshop</p>
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
              className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl my-8"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1 font-gendy">
                    {editingWorkshop ? 'Edit Workshop' : 'Schedule New Workshop'}
                  </h2>
                  <p className="text-sm text-gray-400 font-diatype">
                    Fill in the details for the workshop session
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Workshop Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleFormChange('title', e.target.value)}
                      placeholder="e.g., AI Strategy & Implementation"
                      className={`w-full px-4 py-3 bg-white/5 border ${
                        formErrors.title ? 'border-red-500' : 'border-white/10'
                      } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-diatype`}
                    />
                    {formErrors.title && (
                      <p className="text-red-400 text-sm mt-1 font-diatype">{formErrors.title}</p>
                    )}
                  </div>

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
                      } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-diatype`}
                    />
                    {formErrors.instructor && (
                      <p className="text-red-400 text-sm mt-1 font-diatype">{formErrors.instructor}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Workshop Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleFormChange('type', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-diatype"
                    >
                      <option value="online">Online</option>
                      <option value="in-person">In-Person</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Date <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleFormChange('date', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/5 border ${
                        formErrors.date ? 'border-red-500' : 'border-white/10'
                      } rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-diatype`}
                    />
                    {formErrors.date && (
                      <p className="text-red-400 text-sm mt-1 font-diatype">{formErrors.date}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Time <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleFormChange('time', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/5 border ${
                        formErrors.time ? 'border-red-500' : 'border-white/10'
                      } rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-diatype`}
                    />
                    {formErrors.time && (
                      <p className="text-red-400 text-sm mt-1 font-diatype">{formErrors.time}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Duration <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => handleFormChange('duration', e.target.value)}
                      placeholder="e.g., 3 hours"
                      className={`w-full px-4 py-3 bg-white/5 border ${
                        formErrors.duration ? 'border-red-500' : 'border-white/10'
                      } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-diatype`}
                    />
                    {formErrors.duration && (
                      <p className="text-red-400 text-sm mt-1 font-diatype">{formErrors.duration}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Capacity <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => handleFormChange('capacity', parseInt(e.target.value) || 0)}
                      placeholder="e.g., 30"
                      min="1"
                      className={`w-full px-4 py-3 bg-white/5 border ${
                        formErrors.capacity ? 'border-red-500' : 'border-white/10'
                      } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-diatype`}
                    />
                    {formErrors.capacity && (
                      <p className="text-red-400 text-sm mt-1 font-diatype">{formErrors.capacity}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">Price ($)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleFormChange('price', parseFloat(e.target.value) || 0)}
                      placeholder="e.g., 499"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-diatype"
                    />
                  </div>

                  {(formData.type === 'in-person' || formData.type === 'hybrid') && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleFormChange('location', e.target.value)}
                        placeholder="e.g., Innovation Hub, NYC"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-diatype"
                      />
                    </div>
                  )}

                  {(formData.type === 'online' || formData.type === 'hybrid') && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                        Meeting Link
                      </label>
                      <input
                        type="url"
                        value={formData.meetingLink}
                        onChange={(e) => handleFormChange('meetingLink', e.target.value)}
                        placeholder="https://meet.humanglue.ai/workshop-..."
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-diatype"
                      />
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Image URL <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => handleFormChange('image', e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className={`w-full px-4 py-3 bg-white/5 border ${
                        formErrors.image ? 'border-red-500' : 'border-white/10'
                      } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-diatype`}
                    />
                    {formErrors.image && (
                      <p className="text-red-400 text-sm mt-1 font-diatype">{formErrors.image}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      placeholder="Provide a detailed description of the workshop..."
                      rows={4}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-diatype resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t border-white/10">
                <button
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all font-semibold font-diatype disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveWorkshop}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all font-semibold flex items-center justify-center gap-2 font-diatype disabled:opacity-50"
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
                      {editingWorkshop ? 'Update Workshop' : 'Save Workshop'}
                    </>
                  )}
                </button>
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
                <h3 className="text-2xl font-bold text-white mb-2 font-gendy">Delete Workshop?</h3>
                <p className="text-gray-400 font-diatype">
                  This action cannot be undone. All participant data will be preserved.
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
                  onClick={() => handleDeleteWorkshop(showDeleteConfirm)}
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
