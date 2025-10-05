'use client'

import { useState, useEffect } from 'react'
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
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'
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
  },
]

export default function InstructorCoursesPage() {
  const router = useRouter()
  const { userData } = useChat()
  const [courses] = useState(instructorCourses)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false)

  useEffect(() => {
    if (!userData?.isInstructor) {
      router.push('/login')
    }
  }, [userData, router])

  if (!userData?.isInstructor) {
    return null
  }

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  const totalStudents = courses.reduce((sum, course) => sum + course.students, 0)
  const totalRevenue = courses.reduce((sum, course) => sum + course.revenue, 0)
  const avgRating = courses.reduce((sum, course) => sum + course.rating, 0) / courses.length

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="ml-[280px] transition-all duration-300">
        {/* Header */}
        <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 font-gendy">My Courses</h1>
                <p className="text-gray-400 font-diatype">
                  Manage your courses and track student progress ({courses.length} courses)
                </p>
              </div>
              <Link href="/instructor/courses/new">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-diatype"
                >
                  <Plus className="w-5 h-5" />
                  New Course
                </motion.button>
              </Link>
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
              className="bg-gradient-to-br from-purple-900/30 to-purple-900/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <Users className="w-6 h-6 text-purple-400" />
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

          {/* Courses Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all group"
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
                  <h3 className="text-xl font-bold text-white mb-2 font-gendy line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4 font-diatype">{course.category}</p>

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

                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <BarChart3 className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-purple-400 font-diatype">Revenue</span>
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
                      className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 rounded-lg transition-all flex items-center justify-center gap-2 font-diatype"
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
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                    <BarChart3 className="w-5 h-5 text-purple-400 mb-2" />
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
                          className="w-full bg-gradient-to-t from-purple-500 to-blue-500 rounded-t-lg"
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
