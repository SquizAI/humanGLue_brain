'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  PlayCircle,
  Plus,
  Edit,
  Users,
  Star,
  Clock,
  CheckCircle,
  BarChart3,
  MessageSquare,
  FileText,
  X,
  Sparkles,
  Filter,
  Search,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import Image from 'next/image'

// Mock courses data for instructor
const instructorCourses = [
  {
    id: 1,
    title: 'AI Transformation for Executives',
    category: 'AI Adoption & Strategy',
    level: 'Executive',
    duration: '6 hours',
    lessons: 12,
    students: 2847,
    rating: 4.9,
    reviews: 384,
    completion: 87,
    revenue: 850530,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop',
    status: 'published',
    lastUpdated: '2025-10-01',
    instructorName: 'Dr. Sarah Chen',
    instructorType: 'AI Strategy Expert',
    contentType: 'course',
  },
  {
    id: 2,
    title: 'AI Strategy Workshop',
    category: 'AI Adoption & Strategy',
    level: 'Executive',
    duration: '4 hours',
    lessons: 8,
    students: 892,
    rating: 4.8,
    reviews: 124,
    completion: 92,
    revenue: 400308,
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=500&fit=crop',
    status: 'draft',
    lastUpdated: '2025-10-02',
    instructorName: 'Dr. Sarah Chen',
    instructorType: 'AI Strategy Expert',
    contentType: 'workshop',
  },
  {
    id: 3,
    title: 'Change Management Fundamentals',
    category: 'Leadership & Change',
    level: 'Intermediate',
    duration: '5 hours',
    lessons: 10,
    students: 1523,
    rating: 4.7,
    reviews: 212,
    completion: 85,
    revenue: 456900,
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=500&fit=crop',
    status: 'published',
    lastUpdated: '2025-09-15',
    instructorName: 'Michael Rodriguez',
    instructorType: 'Change Management Specialist',
    contentType: 'course',
  },
  {
    id: 4,
    title: 'Data-Driven Decision Making Pathway',
    category: 'Analytics & Data',
    level: 'Advanced',
    duration: '12 weeks',
    lessons: 24,
    students: 645,
    rating: 4.9,
    reviews: 89,
    completion: 78,
    revenue: 322500,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop',
    status: 'published',
    lastUpdated: '2025-10-05',
    instructorName: 'Dr. Emily Watson',
    instructorType: 'Data Science Lead',
    contentType: 'pathway',
  },
]

export default function InstructorCoursesPage() {
  const router = useRouter()

  // Trust middleware protection - no need for client-side auth checks
  // Middleware already validates access before page loads
  const [courses] = useState(instructorCourses)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false)

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedInstructor, setSelectedInstructor] = useState<string>('all')
  const [selectedInstructorType, setSelectedInstructorType] = useState<string>('all')
  const [selectedContentType, setSelectedContentType] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  // Get unique instructors and types for filters
  const uniqueInstructors = Array.from(new Set(courses.map((c) => c.instructorName)))
  const uniqueInstructorTypes = Array.from(new Set(courses.map((c) => c.instructorType)))
  const contentTypes = ['course', 'workshop', 'pathway']

  // Apply filters
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesInstructor =
      selectedInstructor === 'all' || course.instructorName === selectedInstructor

    const matchesInstructorType =
      selectedInstructorType === 'all' || course.instructorType === selectedInstructorType

    const matchesContentType =
      selectedContentType === 'all' || course.contentType === selectedContentType

    return matchesSearch && matchesInstructor && matchesInstructorType && matchesContentType
  })

  const totalStudents = filteredCourses.reduce((sum, course) => sum + course.students, 0)
  const totalRevenue = filteredCourses.reduce((sum, course) => sum + course.revenue, 0)
  const avgRating = filteredCourses.length > 0
    ? filteredCourses.reduce((sum, course) => sum + course.rating, 0) / filteredCourses.length
    : 0

  return (
    <div className="min-h-screen bg-black">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        {/* Header */}
        <div className="bg-black/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 font-gendy">My Courses</h1>
                <p className="text-gray-400 font-diatype">
                  Manage your courses and track student progress ({filteredCourses.length} of {courses.length} courses)
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/instructor/courses/ai-builder">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 via-pink-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-diatype"
                  >
                    <Sparkles className="w-5 h-5" />
                    AI Course Builder
                  </motion.button>
                </Link>

                <Link href="/instructor/courses/new">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-diatype"
                  >
                    <Plus className="w-5 h-5" />
                    New Course
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <PlayCircle className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1 font-gendy">{courses.length}</h3>
              <p className="text-sm text-gray-400 font-diatype">Total Courses</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-cyan-900/30 to-cyan-900/10 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <Users className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1 font-gendy">
                {totalStudents.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-400 font-diatype">Total Students</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-amber-900/30 to-amber-900/10 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <Star className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1 font-gendy">
                {avgRating.toFixed(1)}
              </h3>
              <p className="text-sm text-gray-400 font-diatype">Average Rating</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-green-900/30 to-green-900/10 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1 font-gendy">
                ${(totalRevenue / 1000).toFixed(0)}k
              </h3>
              <p className="text-sm text-gray-400 font-diatype">Total Revenue</p>
            </motion.div>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses by title or category..."
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all font-diatype"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-3 rounded-xl transition-all flex items-center gap-2 font-diatype ${
                  showFilters || selectedInstructor !== 'all' || selectedInstructorType !== 'all' || selectedContentType !== 'all'
                    ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300'
                    : 'bg-gray-800 border border-white/10 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Filter className="w-5 h-5" />
                Filters
                {(selectedInstructor !== 'all' || selectedInstructorType !== 'all' || selectedContentType !== 'all') && (
                  <span className="px-2 py-0.5 bg-cyan-500 text-white text-xs rounded-full">
                    {[selectedInstructor !== 'all', selectedInstructorType !== 'all', selectedContentType !== 'all'].filter(Boolean).length}
                  </span>
                )}
              </motion.button>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Instructor Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-3 font-diatype">
                          Instructor Name
                        </label>
                        <select
                          value={selectedInstructor}
                          onChange={(e) => setSelectedInstructor(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 transition-all font-diatype"
                        >
                          <option value="all">All Instructors</option>
                          {uniqueInstructors.map((instructor) => (
                            <option key={instructor} value={instructor}>
                              {instructor}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Instructor Type Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-3 font-diatype">
                          Instructor Type
                        </label>
                        <select
                          value={selectedInstructorType}
                          onChange={(e) => setSelectedInstructorType(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 transition-all font-diatype"
                        >
                          <option value="all">All Types</option>
                          {uniqueInstructorTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Content Type Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-3 font-diatype">
                          Content Type
                        </label>
                        <select
                          value={selectedContentType}
                          onChange={(e) => setSelectedContentType(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 transition-all font-diatype"
                        >
                          <option value="all">All Types</option>
                          {contentTypes.map((type) => (
                            <option key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Reset Filters Button */}
                    {(selectedInstructor !== 'all' || selectedInstructorType !== 'all' || selectedContentType !== 'all') && (
                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={() => {
                            setSelectedInstructor('all')
                            setSelectedInstructorType('all')
                            setSelectedContentType('all')
                            setSearchQuery('')
                          }}
                          className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-all font-diatype"
                        >
                          Reset All Filters
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
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
                </div>

                {/* Course Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1 font-gendy line-clamp-1">
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-400 font-diatype">{course.category}</span>
                        <span className="text-gray-600">•</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            course.contentType === 'course'
                              ? 'bg-blue-500/20 text-blue-300'
                              : course.contentType === 'workshop'
                              ? 'bg-cyan-500/20 text-cyan-300'
                              : 'bg-green-500/20 text-green-300'
                          }`}
                        >
                          {course.contentType}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                          {course.instructorName.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-white font-medium font-diatype">{course.instructorName}</p>
                          <p className="text-xs text-gray-500 font-diatype">{course.instructorType}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-blue-400 font-diatype">Students</span>
                      </div>
                      <p className="text-xl font-bold text-white font-gendy">
                        {course.students.toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-sm text-amber-400 font-diatype">Rating</span>
                      </div>
                      <p className="text-xl font-bold text-white font-gendy">
                        {course.rating} <span className="text-sm text-gray-400">({course.reviews})</span>
                      </p>
                    </div>

                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400 font-diatype">Completion</span>
                      </div>
                      <p className="text-xl font-bold text-white font-gendy">{course.completion}%</p>
                    </div>

                    <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <BarChart3 className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm text-cyan-400 font-diatype">Revenue</span>
                      </div>
                      <p className="text-xl font-bold text-white font-gendy">
                        ${(course.revenue / 1000).toFixed(0)}k
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedCourse(course)
                        setShowAnalyticsModal(true)
                      }}
                      className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 rounded-lg transition-all flex items-center justify-center gap-2 font-diatype"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Analytics
                    </motion.button>
                    <Link href={`/instructor/courses/${course.id}`}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-lg transition-all flex items-center justify-center gap-2 font-diatype"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </motion.button>
                    </Link>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 rounded-lg transition-all flex items-center justify-center gap-2 font-diatype"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Q&A
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 rounded-lg transition-all flex items-center justify-center gap-2 font-diatype"
                    >
                      <FileText className="w-4 h-4" />
                      Content
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredCourses.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-16 text-center"
            >
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Filter className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 font-gendy">No courses found</h3>
                <p className="text-gray-400 font-diatype mb-8">
                  No courses match your current filters. Try adjusting your search or filter criteria.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedInstructor('all')
                    setSelectedInstructorType('all')
                    setSelectedContentType('all')
                    setSearchQuery('')
                  }}
                  className="px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 rounded-lg transition-all font-diatype inline-flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Reset All Filters
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Analytics Modal */}
      <AnimatePresence>
        {showAnalyticsModal && selectedCourse && (
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
                  <p className="text-sm text-gray-400 font-diatype">{selectedCourse.title}</p>
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
                      {selectedCourse.students}
                    </p>
                    <p className="text-xs text-gray-400 font-diatype">Total Enrollments</p>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <CheckCircle className="w-5 h-5 text-green-400 mb-2" />
                    <p className="text-2xl font-bold text-white mb-1 font-gendy">{selectedCourse.completion}%</p>
                    <p className="text-xs text-gray-400 font-diatype">Completion Rate</p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <Star className="w-5 h-5 text-amber-400 mb-2" />
                    <p className="text-2xl font-bold text-white mb-1 font-gendy">
                      {selectedCourse.rating}
                    </p>
                    <p className="text-xs text-gray-400 font-diatype">Average Rating</p>
                  </div>
                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
                    <BarChart3 className="w-5 h-5 text-cyan-400 mb-2" />
                    <p className="text-2xl font-bold text-white mb-1 font-gendy">
                      ${(selectedCourse.revenue / 1000).toFixed(0)}k
                    </p>
                    <p className="text-xs text-gray-400 font-diatype">Total Revenue</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-3 font-gendy">Enrollment Trend (Last 7 Weeks)</h3>
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
