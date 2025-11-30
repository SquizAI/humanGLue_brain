'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  Users,
  CheckCircle,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner'
import { signOut } from '@/lib/auth/hooks'
import Image from 'next/image'

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

export default function NewExpert() {
  const router = useRouter()
  const { userData, authLoading } = useChat()
  const [showContent, setShowContent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

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
      console.log('[NewExpert] Auth timeout - trusting middleware protection')
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
          <LoadingSpinner variant="neural" size="xl" text="Loading..." />
        </div>
      </div>
    )
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

  // Save expert
  const handleSaveExpert = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In production, this would save to the database
    console.log('Creating new expert:', formData)

    setIsSubmitting(false)
    setShowSuccessMessage(true)

    // Redirect after showing success message
    setTimeout(() => {
      router.push('/admin/experts')
    }, 2000)
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
                  <Link href="/admin/experts" className="text-gray-400 hover:text-white transition-colors">
                    <div className="flex items-center gap-2">
                      <ArrowLeft className="w-5 h-5" />
                      <span className="font-diatype">Back to Expert Network</span>
                    </div>
                  </Link>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2 font-gendy">Add New Expert</h1>
                <p className="text-gray-400 font-diatype">
                  Fill in the details to add a new expert to your network
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/admin/experts">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all font-diatype"
                  >
                    Cancel
                  </motion.button>
                </Link>
                <motion.button
                  onClick={handleSaveExpert}
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl transition-all font-semibold flex items-center gap-2 font-diatype disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Save className="w-5 h-5" />
                      </motion.div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Add Expert
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
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
                    } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype`}
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
                    } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype`}
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
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype"
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
                    } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype`}
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
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype"
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
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype"
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
                    } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype`}
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
                    } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype`}
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
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype"
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
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype"
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
                            ? 'bg-cyan-500 text-white border-2 border-cyan-400'
                            : 'bg-white/5 text-gray-300 border-2 border-white/10 hover:border-cyan-500/50'
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
                      } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype`}
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
                    } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype resize-none`}
                  />
                  {formErrors.bio && (
                    <p className="text-red-400 text-sm mt-1 font-diatype">{formErrors.bio}</p>
                  )}
                </div>
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-300 mb-1 font-diatype">
                      Expert Profile
                    </h4>
                    <p className="text-sm text-blue-200/80 font-diatype">
                      After adding the expert, you can assign them to courses, manage their
                      availability, and track their performance from the expert management page.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-8 right-8 z-[60] bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3"
        >
          <CheckCircle className="w-6 h-6" />
          <span className="font-semibold font-diatype">Expert added successfully!</span>
        </motion.div>
      )}
    </div>
  )
}
