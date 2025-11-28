'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Save,
  X,
  Image as ImageIcon,
  PlayCircle,
  CheckCircle,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'
import Image from 'next/image'

// Course categories
const categories = [
  { id: 'ai-adoption', name: 'AI Adoption & Strategy', color: 'purple' },
  { id: 'change-management', name: 'Change Management', color: 'blue' },
  { id: 'leadership', name: 'Leadership & Culture', color: 'green' },
  { id: 'data-ai', name: 'Data & AI Technical', color: 'cyan' },
  { id: 'human-skills', name: 'Human Skills & Coaching', color: 'amber' },
  { id: 'ethics', name: 'AI Ethics & Governance', color: 'red' },
]

const levels = ['Beginner', 'Intermediate', 'Advanced', 'Executive']

export default function NewCourse() {
  const router = useRouter()
  const { userData, authLoading } = useChat()
  const [showContent, setShowContent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

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
      console.log('[NewCourse] Auth timeout - trusting middleware protection')
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

  // Save course
  const handleSaveCourse = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In production, this would save to the database
    console.log('Creating new course:', formData)

    setIsSubmitting(false)
    setShowSuccessMessage(true)

    // Redirect after showing success message
    setTimeout(() => {
      router.push('/admin/courses')
    }, 2000)
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
                  <Link href="/admin/courses" className="text-gray-400 hover:text-white transition-colors">
                    <div className="flex items-center gap-2">
                      <ArrowLeft className="w-5 h-5" />
                      <span className="font-diatype">Back to Courses</span>
                    </div>
                  </Link>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2 font-gendy">Create New Course</h1>
                <p className="text-gray-400 font-diatype">
                  Fill in the details to create a new course
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/admin/courses">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all font-diatype"
                  >
                    Cancel
                  </motion.button>
                </Link>
                <motion.button
                  onClick={handleSaveCourse}
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl transition-all font-semibold flex items-center gap-2 font-diatype disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Save className="w-5 h-5" />
                      </motion.div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Create Course
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
                    } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-diatype`}
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
                    } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-diatype`}
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
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-diatype"
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
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-diatype"
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
                    } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-diatype`}
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
                    } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-diatype`}
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
                    } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-diatype`}
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
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-diatype"
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
                      } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-diatype`}
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
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-diatype resize-none"
                  />
                </div>
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <PlayCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-300 mb-1 font-diatype">
                      Next Steps
                    </h4>
                    <p className="text-sm text-blue-200/80 font-diatype">
                      After creating the course, you can add lessons, upload content, and configure
                      additional settings from the course management page.
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
          <span className="font-semibold font-diatype">Course created successfully!</span>
        </motion.div>
      )}
    </div>
  )
}
