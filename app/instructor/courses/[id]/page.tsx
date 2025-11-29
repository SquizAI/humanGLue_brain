'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft,
  Save,
  Eye,
  Upload,
  Plus,
  Trash2,
  GripVertical,
  Video,
  FileText,
  CheckCircle,
  Clock,
  Users,
  Star,
  Edit,
  Settings,
  BarChart3,
  Copy,
  Calendar,
  MoreVertical,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { LessonEditor } from '@/components/organisms/LessonEditor'
import Image from 'next/image'

// Mock course data
const mockCourseData = {
  1: {
    id: 1,
    title: 'AI Transformation for Executives',
    category: 'AI Adoption & Strategy',
    level: 'Executive',
    duration: '6 hours',
    price: 299,
    description: 'A comprehensive guide to AI transformation for business leaders.',
    learningOutcomes: [
      'Understand AI fundamentals and business applications',
      'Develop an AI transformation strategy',
      'Identify and prioritize AI use cases',
      'Build AI-ready teams and culture',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop',
    status: 'published',
    students: 2847,
    rating: 4.9,
    reviews: 384,
    curriculum: [
      {
        id: 1,
        type: 'section',
        title: 'Introduction to AI Transformation',
        lessons: [
          { id: 1, type: 'video', title: 'Welcome & Course Overview', duration: '5:30', completed: true },
          { id: 2, type: 'video', title: 'Why AI Matters for Business', duration: '12:45', completed: true },
          { id: 3, type: 'reading', title: 'AI Landscape Analysis', duration: '10 min read', completed: false },
          { id: 4, type: 'quiz', title: 'Knowledge Check', duration: '5 questions', completed: false },
        ],
      },
      {
        id: 2,
        type: 'section',
        title: 'Building Your AI Strategy',
        lessons: [
          { id: 5, type: 'video', title: 'Strategic Framework', duration: '18:20', completed: false },
          { id: 6, type: 'video', title: 'Use Case Identification', duration: '15:10', completed: false },
          { id: 7, type: 'reading', title: 'ROI Calculation Template', duration: '15 min read', completed: false },
        ],
      },
      {
        id: 3,
        type: 'section',
        title: 'Implementation & Change Management',
        lessons: [
          { id: 8, type: 'video', title: 'Building AI Teams', duration: '14:30', completed: false },
          { id: 9, type: 'video', title: 'Managing Resistance', duration: '16:45', completed: false },
          { id: 10, type: 'reading', title: 'Change Management Playbook', duration: '20 min read', completed: false },
        ],
      },
    ],
  },
  2: {
    id: 2,
    title: 'AI Strategy Workshop',
    category: 'AI Adoption & Strategy',
    level: 'Executive',
    duration: '4 hours',
    price: 199,
    description: 'Hands-on workshop for developing your AI strategy.',
    learningOutcomes: [
      'Create an AI roadmap for your organization',
      'Identify quick wins and long-term goals',
      'Build stakeholder buy-in',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=500&fit=crop',
    status: 'draft',
    students: 892,
    rating: 4.8,
    reviews: 124,
    curriculum: [
      {
        id: 1,
        type: 'section',
        title: 'Getting Started',
        lessons: [
          { id: 1, type: 'video', title: 'Workshop Introduction', duration: '5:00', completed: false },
        ],
      },
    ],
  },
}

type TabType = 'curriculum' | 'settings' | 'students' | 'analytics'

export default function CourseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string

  const [course, setCourse] = useState(mockCourseData[courseId as '1' | '2'])
  const [activeTab, setActiveTab] = useState<TabType>('curriculum')
  const [isSaving, setIsSaving] = useState(false)
  const [editingLesson, setEditingLesson] = useState<any>(null)
  const [isLessonEditorOpen, setIsLessonEditorOpen] = useState(false)
  const [showOptionsMenu, setShowOptionsMenu] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Course not found</h1>
          <button
            onClick={() => router.push('/instructor/courses')}
            className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Back to Courses
          </button>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  const handleDuplicateCourse = async () => {
    const confirmed = confirm(
      `Create a copy of "${course.title}"? This will duplicate all modules and lessons.`
    )
    if (confirmed) {
      // Simulate course duplication
      await new Promise((resolve) => setTimeout(resolve, 800))
      alert('Course duplicated successfully! Redirecting to new course...')
      // In real implementation, redirect to new course ID
      // router.push('/instructor/courses/[newId]')
    }
  }

  const handleScheduleClasses = () => {
    router.push(`/instructor/courses/${courseId}/schedule`)
  }

  const handleEditLesson = (lesson: any) => {
    setEditingLesson(lesson)
    setIsLessonEditorOpen(true)
  }

  const handleSaveLesson = (updatedLesson: any) => {
    // Update lesson in course data
    // In real implementation, this would call an API
    console.log('Saving lesson:', updatedLesson)
    setIsLessonEditorOpen(false)
    setEditingLesson(null)
  }

  const tabs = [
    { id: 'curriculum' as TabType, label: 'Curriculum', icon: FileText },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
    { id: 'students' as TabType, label: 'Students', icon: Users },
    { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        {/* Header */}
        <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => router.push('/instructor/courses')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-diatype">Back to Courses</span>
              </button>

              <div className="flex items-center gap-3">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    course.status === 'published'
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {course.status === 'published' ? 'Published' : 'Draft'}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all flex items-center gap-2 font-diatype"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg transition-all flex items-center gap-2 font-diatype disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </motion.button>

                {/* Options Menu */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                    className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </motion.button>

                  <AnimatePresence>
                    {showOptionsMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-56 bg-gray-800 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
                      >
                        <button
                          onClick={() => {
                            handleDuplicateCourse()
                            setShowOptionsMenu(false)
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center gap-3 text-white font-diatype"
                        >
                          <Copy className="w-4 h-4 text-purple-400" />
                          Duplicate Course
                        </button>
                        <button
                          onClick={() => {
                            handleScheduleClasses()
                            setShowOptionsMenu(false)
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center gap-3 text-white font-diatype"
                        >
                          <Calendar className="w-4 h-4 text-blue-400" />
                          Schedule Classes
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-white mb-2 font-gendy">{course.title}</h1>
              <p className="text-gray-400 font-diatype">{course.category}</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-6">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 font-diatype ${
                      activeTab === tab.id
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Curriculum Tab */}
          {activeTab === 'curriculum' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white font-gendy">Course Curriculum</h2>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 rounded-lg transition-all flex items-center gap-2 font-diatype"
                >
                  <Plus className="w-4 h-4" />
                  Add Section
                </motion.button>
              </div>

              {/* Curriculum Sections */}
              <div className="space-y-4">
                {course.curriculum.map((section, sectionIndex) => (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: sectionIndex * 0.1 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden"
                  >
                    {/* Section Header */}
                    <div className="flex items-center gap-3 p-4 bg-white/5 border-b border-white/10">
                      <GripVertical className="w-5 h-5 text-gray-500 cursor-move" />
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white font-gendy">{section.title}</h3>
                        <p className="text-sm text-gray-400 font-diatype">
                          {section.lessons.length} lessons
                        </p>
                      </div>
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <Edit className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>

                    {/* Lessons */}
                    <div className="divide-y divide-white/5">
                      {section.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors group"
                        >
                          <GripVertical className="w-4 h-4 text-gray-600 cursor-move opacity-0 group-hover:opacity-100 transition-opacity" />

                          {lesson.type === 'video' && (
                            <div className="p-2 rounded-lg bg-blue-500/20">
                              <Video className="w-4 h-4 text-blue-400" />
                            </div>
                          )}
                          {lesson.type === 'reading' && (
                            <div className="p-2 rounded-lg bg-purple-500/20">
                              <FileText className="w-4 h-4 text-purple-400" />
                            </div>
                          )}
                          {lesson.type === 'quiz' && (
                            <div className="p-2 rounded-lg bg-green-500/20">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            </div>
                          )}

                          <div className="flex-1">
                            <h4 className="text-white font-medium font-diatype">{lesson.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-3 h-3 text-gray-500" />
                              <span className="text-xs text-gray-500 font-diatype">{lesson.duration}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditLesson(lesson)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4 text-gray-400" />
                            </button>
                            <button className="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add Lesson Button */}
                      <button className="w-full p-4 text-left hover:bg-white/5 transition-colors flex items-center gap-2 text-gray-400 hover:text-white">
                        <Plus className="w-4 h-4" />
                        <span className="font-diatype">Add Lesson</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="max-w-4xl space-y-6">
              <h2 className="text-2xl font-bold text-white font-gendy">Course Settings</h2>

              {/* Basic Information */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-white font-gendy">Basic Information</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 font-diatype">
                    Course Title
                  </label>
                  <input
                    type="text"
                    defaultValue={course.title}
                    className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-all font-diatype"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 font-diatype">
                    Description
                  </label>
                  <textarea
                    defaultValue={course.description}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-all font-diatype"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 font-diatype">
                      Category
                    </label>
                    <select
                      defaultValue={course.category}
                      className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-all font-diatype"
                    >
                      <option>AI Adoption & Strategy</option>
                      <option>Technical AI</option>
                      <option>Leadership & Change</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 font-diatype">
                      Level
                    </label>
                    <select
                      defaultValue={course.level}
                      className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-all font-diatype"
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                      <option>Executive</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 font-diatype">
                      Price (USD)
                    </label>
                    <input
                      type="number"
                      defaultValue={course.price}
                      className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-all font-diatype"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 font-diatype">
                      Duration
                    </label>
                    <input
                      type="text"
                      defaultValue={course.duration}
                      className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-all font-diatype"
                    />
                  </div>
                </div>
              </div>

              {/* Course Thumbnail */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-white font-gendy">Course Thumbnail</h3>

                <div className="relative w-full h-64 rounded-xl overflow-hidden bg-gray-800">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <button className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 rounded-lg transition-all flex items-center gap-2 font-diatype">
                  <Upload className="w-4 h-4" />
                  Upload New Thumbnail
                </button>
              </div>
            </div>
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white font-gendy">Enrolled Students</h2>
                  <p className="text-gray-400 font-diatype">
                    {course.students.toLocaleString()} students enrolled
                  </p>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <p className="text-gray-400 text-center py-12 font-diatype">
                  Student management interface coming soon...
                </p>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white font-gendy">Course Analytics</h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                  <Users className="w-6 h-6 text-blue-400 mb-3" />
                  <h3 className="text-3xl font-bold text-white mb-1 font-gendy">
                    {course.students.toLocaleString()}
                  </h3>
                  <p className="text-sm text-gray-400 font-diatype">Total Students</p>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
                  <Star className="w-6 h-6 text-amber-400 mb-3" />
                  <h3 className="text-3xl font-bold text-white mb-1 font-gendy">{course.rating}</h3>
                  <p className="text-sm text-gray-400 font-diatype">Average Rating</p>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
                  <BarChart3 className="w-6 h-6 text-purple-400 mb-3" />
                  <h3 className="text-3xl font-bold text-white mb-1 font-gendy">
                    {course.reviews}
                  </h3>
                  <p className="text-sm text-gray-400 font-diatype">Reviews</p>
                </div>

                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
                  <CheckCircle className="w-6 h-6 text-green-400 mb-3" />
                  <h3 className="text-3xl font-bold text-white mb-1 font-gendy">87%</h3>
                  <p className="text-sm text-gray-400 font-diatype">Completion Rate</p>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4 font-gendy">
                  Enrollment Trend (Last 12 Weeks)
                </h3>
                <div className="h-64 flex items-end justify-between gap-2">
                  {[45, 52, 61, 58, 65, 78, 82, 95, 88, 92, 97, 100].map((height, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-gradient-to-t from-purple-500 to-blue-500 rounded-t-lg transition-all hover:opacity-80"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-xs text-gray-500 mt-2 font-diatype">W{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lesson Editor Modal */}
      <LessonEditor
        lesson={editingLesson}
        isOpen={isLessonEditorOpen}
        onClose={() => {
          setIsLessonEditorOpen(false)
          setEditingLesson(null)
        }}
        onSave={handleSaveLesson}
      />
    </div>
  )
}
