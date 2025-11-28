'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Star,
  MapPin,
  DollarSign,
  Clock,
  Eye,
  Award,
  CheckCircle,
  XCircle,
  Save,
  X,
  Image as ImageIcon,
  Briefcase,
  Mail,
  Phone,
  Linkedin,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'
import Image from 'next/image'

// Sample experts data
const initialExperts = [
  {
    id: 1,
    name: 'Sarah Chen',
    title: 'AI Strategy & Transformation',
    location: 'San Francisco, CA',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
    expertise: ['AI Strategy', 'Change Management', 'Executive Coaching'],
    industries: ['Technology', 'Finance', 'Healthcare'],
    rating: 4.9,
    reviews: 38,
    yearsExp: 15,
    hourlyRate: 650,
    availability: 'limited',
    status: 'active',
    projectsCompleted: 127,
    lastActive: '2025-10-02',
  },
  {
    id: 2,
    name: 'Dr. Marcus Thompson',
    title: 'Organizational Psychology & Change',
    location: 'New York, NY',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    expertise: ['Change Psychology', 'Team Dynamics', 'Cultural Transformation'],
    industries: ['Enterprise', 'Government', 'Non-Profit'],
    rating: 4.8,
    reviews: 42,
    yearsExp: 20,
    hourlyRate: 700,
    availability: 'available',
    status: 'active',
    projectsCompleted: 156,
    lastActive: '2025-10-01',
  },
  {
    id: 3,
    name: 'Jennifer Wu',
    title: 'Data Science & ML Engineering',
    location: 'Austin, TX',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
    expertise: ['Machine Learning', 'Data Architecture', 'AI Implementation'],
    industries: ['Technology', 'Manufacturing', 'Retail'],
    rating: 4.9,
    reviews: 51,
    yearsExp: 12,
    hourlyRate: 550,
    availability: 'available',
    status: 'active',
    projectsCompleted: 93,
    lastActive: '2025-10-03',
  },
  {
    id: 4,
    name: 'Prof. David Kim',
    title: 'AI Ethics & Governance',
    location: 'Boston, MA',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    expertise: ['AI Ethics', 'Regulatory Compliance', 'Risk Management'],
    industries: ['Finance', 'Healthcare', 'Legal'],
    rating: 4.7,
    reviews: 29,
    yearsExp: 18,
    hourlyRate: 750,
    availability: 'limited',
    status: 'active',
    projectsCompleted: 84,
    lastActive: '2025-09-30',
  },
  {
    id: 5,
    name: 'Michael Rodriguez',
    title: 'Enterprise AI Solutions',
    location: 'Chicago, IL',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    expertise: ['Enterprise Architecture', 'System Integration', 'Cloud Migration'],
    industries: ['Enterprise', 'Technology', 'Logistics'],
    rating: 4.8,
    reviews: 35,
    yearsExp: 16,
    hourlyRate: 600,
    availability: 'available',
    status: 'active',
    projectsCompleted: 112,
    lastActive: '2025-10-02',
  },
  {
    id: 6,
    name: 'Dr. Raj Patel',
    title: 'Machine Learning & AI Training',
    location: 'Seattle, WA',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
    expertise: ['Deep Learning', 'NLP', 'Computer Vision'],
    industries: ['Technology', 'Healthcare', 'Education'],
    rating: 4.9,
    reviews: 47,
    yearsExp: 14,
    hourlyRate: 580,
    availability: 'available',
    status: 'active',
    projectsCompleted: 98,
    lastActive: '2025-10-03',
  },
]

// Expert specialties
const specialties = [
  'AI Strategy',
  'Change Management',
  'Data Science',
  'Leadership',
  'Ethics',
  'Technical Implementation',
]

// Availability options
const availabilityOptions = [
  { value: 'available', label: 'Available' },
  { value: 'limited', label: 'Limited' },
  { value: 'unavailable', label: 'Unavailable' },
]

// Status options
const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export default function ExpertsAdmin() {
  const router = useRouter()
  const { userData, authLoading } = useChat()
  const [showContent, setShowContent] = useState(false)
  const [experts, setExperts] = useState(initialExperts)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [editingExpert, setEditingExpert] = useState<any>(null)
  const [showExpertModal, setShowExpertModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessageType, setSuccessMessageType] = useState<'create' | 'update'>('create')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    specialties: [] as string[],
    hourlyRate: 0,
    yearsExp: 0,
    bio: '',
    linkedinUrl: '',
    image: '',
    availability: 'available',
    status: 'active',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Check admin access with timeout pattern
  useEffect(() => {
    if (!authLoading && userData?.isAdmin) {
      setShowContent(true)
      return
    }

    const timeout = setTimeout(() => {
      console.log('[ExpertsAdmin] Auth timeout - trusting middleware protection')
      setShowContent(true)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [authLoading, userData])

  useEffect(() => {
    if (!authLoading && userData && !userData.isAdmin) {
      console.log('[ExpertsAdmin] Redirecting to login - not admin')
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

  const filteredExperts = experts.filter((expert) => {
    const matchesSearch =
      searchQuery === '' ||
      expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.expertise.some((exp) => exp.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesAvailability =
      selectedAvailability === 'all' || expert.availability === selectedAvailability
    const matchesStatus = selectedStatus === 'all' || expert.status === selectedStatus
    return matchesSearch && matchesAvailability && matchesStatus
  })

  const handleDeleteExpert = (expertId: number) => {
    setExperts(experts.filter((e) => e.id !== expertId))
    setShowDeleteConfirm(null)
  }

  const handleToggleStatus = (expertId: number) => {
    setExperts(
      experts.map((e) =>
        e.id === expertId ? { ...e, status: e.status === 'active' ? 'inactive' : 'active' } : e
      )
    )
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'green'
      case 'limited':
        return 'amber'
      case 'unavailable':
        return 'red'
      default:
        return 'gray'
    }
  }

  // Open modal for creating new expert
  const handleOpenCreateModal = () => {
    setEditingExpert(null)
    setFormData({
      name: '',
      title: '',
      company: '',
      email: '',
      phone: '',
      specialties: [],
      hourlyRate: 0,
      yearsExp: 0,
      bio: '',
      linkedinUrl: '',
      image: '',
      availability: 'available',
      status: 'active',
    })
    setFormErrors({})
    setShowExpertModal(true)
  }

  // Open modal for editing existing expert
  const handleOpenEditModal = (expert: any) => {
    setEditingExpert(expert)
    setFormData({
      name: expert.name,
      title: expert.title,
      company: expert.location || '',
      email: '',
      phone: '',
      specialties: expert.expertise || [],
      hourlyRate: expert.hourlyRate,
      yearsExp: expert.yearsExp,
      bio: '',
      linkedinUrl: '',
      image: expert.image,
      availability: expert.availability,
      status: expert.status,
    })
    setFormErrors({})
    setShowExpertModal(true)
  }

  // Close modal
  const handleCloseModal = () => {
    setShowExpertModal(false)
    setEditingExpert(null)
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

  // Toggle specialty selection
  const toggleSpecialty = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }))
  }

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    }
    if (!formData.title.trim()) {
      errors.title = 'Title/Role is required'
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format'
    }
    if (formData.hourlyRate <= 0) {
      errors.hourlyRate = 'Hourly rate must be greater than 0'
    }
    if (formData.yearsExp < 0) {
      errors.yearsExp = 'Years of experience cannot be negative'
    }
    if (!formData.bio.trim()) {
      errors.bio = 'Bio is required'
    }
    if (!formData.image.trim()) {
      errors.image = 'Profile image URL is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Save expert (create or update)
  const handleSaveExpert = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (editingExpert) {
      // Update existing expert
      setExperts(
        experts.map((e) =>
          e.id === editingExpert.id
            ? {
                ...e,
                name: formData.name,
                title: formData.title,
                location: formData.company,
                image: formData.image,
                expertise: formData.specialties,
                yearsExp: formData.yearsExp,
                hourlyRate: formData.hourlyRate,
                availability: formData.availability,
                status: formData.status,
                lastActive: new Date().toISOString().split('T')[0],
              }
            : e
        )
      )
    } else {
      // Create new expert
      const newExpert = {
        id: Math.max(...experts.map((e) => e.id)) + 1,
        name: formData.name,
        title: formData.title,
        location: formData.company,
        image: formData.image,
        expertise: formData.specialties,
        industries: [],
        rating: 0,
        reviews: 0,
        yearsExp: formData.yearsExp,
        hourlyRate: formData.hourlyRate,
        availability: formData.availability,
        status: formData.status,
        projectsCompleted: 0,
        lastActive: new Date().toISOString().split('T')[0],
      }
      setExperts([newExpert, ...experts])
    }

    setIsSubmitting(false)
    setShowExpertModal(false)
    setSuccessMessageType(editingExpert ? 'update' : 'create')
    setShowSuccessMessage(true)

    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false)
    }, 3000)
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
                <h1 className="text-3xl font-bold text-white mb-2 font-gendy">Expert Network</h1>
                <p className="text-gray-400 font-diatype">
                  Manage your expert talent pool ({filteredExperts.length} experts)
                </p>
              </div>
              <motion.button
                onClick={handleOpenCreateModal}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-diatype"
              >
                <Plus className="w-5 h-5" />
                Add New Expert
              </motion.button>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="p-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search experts, expertise..."
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-diatype"
                  />
                </div>
              </div>

              {/* Availability Filter */}
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-diatype"
              >
                <option value="all">All Availability</option>
                <option value="available">Available</option>
                <option value="limited">Limited</option>
                <option value="unavailable">Unavailable</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-diatype"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Experts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredExperts.map((expert, index) => (
              <motion.div
                key={expert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all group"
              >
                {/* Expert Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <Image
                        src={expert.image}
                        alt={expert.name}
                        fill
                        className="object-cover"
                      />
                      {/* Status Indicator */}
                      <div
                        className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-gray-900 ${
                          expert.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-1 font-gendy">{expert.name}</h3>
                      <p className="text-sm text-gray-400 mb-2 font-diatype">{expert.title}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span className="font-diatype">{expert.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Availability Badge */}
                  <div className="flex gap-2">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold bg-${getAvailabilityColor(
                        expert.availability
                      )}-500/20 text-${getAvailabilityColor(expert.availability)}-300 border border-${getAvailabilityColor(
                        expert.availability
                      )}-500/30`}
                    >
                      {expert.availability === 'available'
                        ? 'Available'
                        : expert.availability === 'limited'
                        ? 'Limited Availability'
                        : 'Unavailable'}
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        expert.status === 'active'
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                          : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                      }`}
                    >
                      {expert.status === 'active' ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>

                {/* Expert Stats */}
                <div className="p-6 border-b border-white/10">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-sm text-gray-400 font-diatype">Rating</span>
                      </div>
                      <p className="text-lg font-bold text-white font-gendy">
                        {expert.rating} <span className="text-sm text-gray-400">({expert.reviews})</span>
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-400 font-diatype">Rate</span>
                      </div>
                      <p className="text-lg font-bold text-white font-gendy">${expert.hourlyRate}/hr</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Award className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-gray-400 font-diatype">Experience</span>
                      </div>
                      <p className="text-lg font-bold text-white font-gendy">{expert.yearsExp} years</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-400 font-diatype">Projects</span>
                      </div>
                      <p className="text-lg font-bold text-white font-gendy">{expert.projectsCompleted}</p>
                    </div>
                  </div>
                </div>

                {/* Expertise Tags */}
                <div className="p-6 border-b border-white/10">
                  <p className="text-xs text-gray-500 mb-2 font-diatype">Expertise</p>
                  <div className="flex flex-wrap gap-2">
                    {expert.expertise.slice(0, 3).map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-purple-500/10 text-purple-300 rounded-lg text-xs font-diatype"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Last Active */}
                <div className="px-6 py-3 bg-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-diatype">Last active</span>
                    <span className="text-gray-400 font-diatype">
                      {new Date(expert.lastActive).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 flex gap-2">
                  <motion.button
                    onClick={() => handleOpenEditModal(expert)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 rounded-lg transition-all flex items-center justify-center gap-2 font-diatype"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleToggleStatus(expert.id)}
                    className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 rounded-lg transition-all font-diatype"
                  >
                    <Eye className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDeleteConfirm(expert.id)}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-lg transition-all font-diatype"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredExperts.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2 font-gendy">No experts found</h3>
              <p className="text-gray-400 font-diatype">Try adjusting your filters or add a new expert</p>
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
              {successMessageType === 'update' ? 'Expert updated successfully!' : 'Expert created successfully!'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expert Create/Edit Modal */}
      <AnimatePresence>
        {showExpertModal && (
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
                    {editingExpert ? 'Edit Expert' : 'Create New Expert'}
                  </h2>
                  <p className="text-sm text-gray-400 font-diatype">
                    {editingExpert
                      ? 'Update expert profile and details'
                      : 'Fill in the details to add a new expert to your network'}
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
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      placeholder="e.g., Sarah Chen"
                      className={`w-full px-4 py-3 bg-white/5 border ${
                        formErrors.name ? 'border-red-500' : 'border-white/10'
                      } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-diatype`}
                    />
                    {formErrors.name && (
                      <p className="text-red-400 text-sm mt-1 font-diatype">{formErrors.name}</p>
                    )}
                  </div>

                  {/* Title/Role */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Title/Role <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleFormChange('title', e.target.value)}
                      placeholder="e.g., AI Strategy & Transformation"
                      className={`w-full px-4 py-3 bg-white/5 border ${
                        formErrors.title ? 'border-red-500' : 'border-white/10'
                      } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-diatype`}
                    />
                    {formErrors.title && (
                      <p className="text-red-400 text-sm mt-1 font-diatype">{formErrors.title}</p>
                    )}
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Company/Location
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleFormChange('company', e.target.value)}
                      placeholder="e.g., San Francisco, CA"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-diatype"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      placeholder="expert@example.com"
                      className={`w-full px-4 py-3 bg-white/5 border ${
                        formErrors.email ? 'border-red-500' : 'border-white/10'
                      } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-diatype`}
                    />
                    {formErrors.email && (
                      <p className="text-red-400 text-sm mt-1 font-diatype">{formErrors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-diatype"
                    />
                  </div>

                  {/* LinkedIn URL */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      value={formData.linkedinUrl}
                      onChange={(e) => handleFormChange('linkedinUrl', e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-diatype"
                    />
                  </div>

                  {/* Hourly Rate */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Hourly Rate ($) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => handleFormChange('hourlyRate', parseFloat(e.target.value) || 0)}
                      placeholder="650"
                      min="0"
                      step="10"
                      className={`w-full px-4 py-3 bg-white/5 border ${
                        formErrors.hourlyRate ? 'border-red-500' : 'border-white/10'
                      } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-diatype`}
                    />
                    {formErrors.hourlyRate && (
                      <p className="text-red-400 text-sm mt-1 font-diatype">{formErrors.hourlyRate}</p>
                    )}
                  </div>

                  {/* Years of Experience */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Years of Experience <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.yearsExp}
                      onChange={(e) => handleFormChange('yearsExp', parseInt(e.target.value) || 0)}
                      placeholder="15"
                      min="0"
                      className={`w-full px-4 py-3 bg-white/5 border ${
                        formErrors.yearsExp ? 'border-red-500' : 'border-white/10'
                      } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-diatype`}
                    />
                    {formErrors.yearsExp && (
                      <p className="text-red-400 text-sm mt-1 font-diatype">{formErrors.yearsExp}</p>
                    )}
                  </div>

                  {/* Availability */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Availability
                    </label>
                    <select
                      value={formData.availability}
                      onChange={(e) => handleFormChange('availability', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-diatype"
                    >
                      {availabilityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleFormChange('status', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-diatype"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Specialties */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Specialties
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {specialties.map((specialty) => (
                        <button
                          key={specialty}
                          type="button"
                          onClick={() => toggleSpecialty(specialty)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all font-diatype ${
                            formData.specialties.includes(specialty)
                              ? 'bg-purple-500 text-white border-2 border-purple-400'
                              : 'bg-white/5 text-gray-300 border-2 border-white/10 hover:border-purple-500/50'
                          }`}
                        >
                          {specialty}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Profile Image URL */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Profile Image URL <span className="text-red-400">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) => handleFormChange('image', e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className={`flex-1 px-4 py-3 bg-white/5 border ${
                          formErrors.image ? 'border-red-500' : 'border-white/10'
                        } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-diatype`}
                      />
                      <button
                        type="button"
                        className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                      >
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

                  {/* Bio */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                      Bio <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleFormChange('bio', e.target.value)}
                      placeholder="Provide a detailed bio about the expert's background, expertise, and achievements..."
                      rows={4}
                      className={`w-full px-4 py-3 bg-white/5 border ${
                        formErrors.bio ? 'border-red-500' : 'border-white/10'
                      } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-diatype resize-none`}
                    />
                    {formErrors.bio && (
                      <p className="text-red-400 text-sm mt-1 font-diatype">{formErrors.bio}</p>
                    )}
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
                  onClick={handleSaveExpert}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl transition-all font-semibold flex items-center justify-center gap-2 font-diatype disabled:opacity-50 disabled:cursor-not-allowed"
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
                      {editingExpert ? 'Update Expert' : 'Save Expert'}
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
                <h3 className="text-2xl font-bold text-white mb-2 font-gendy">Remove Expert?</h3>
                <p className="text-gray-400 font-diatype">
                  Are you sure you want to remove this expert from your network? This action cannot be undone.
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
                  onClick={() => handleDeleteExpert(showDeleteConfirm)}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all font-diatype"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
