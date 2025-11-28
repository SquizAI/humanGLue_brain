'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Filter,
  Search,
  ArrowRight,
  GraduationCap,
  Award,
  TrendingUp,
  CheckCircle2,
  PlayCircle,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'

export default function CoursesPage() {
  const router = useRouter()
  const { userData } = useChat()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')

  useEffect(() => {
    if (!userData || !userData.authenticated) {
      router.push('/login')
    }
  }, [userData, router])

  if (!userData || !userData.authenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  const courses = [
    {
      id: '1',
      title: 'AI Transformation Fundamentals',
      instructor: 'Dr. Sarah Chen',
      description: 'Master the core principles of organizational AI transformation and change management.',
      category: 'Strategy',
      level: 'Intermediate',
      duration: '12 hours',
      modules: 8,
      students: 247,
      rating: 4.9,
      reviews: 89,
      progress: 65,
      enrolled: true,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
      gradient: 'from-purple-500 to-blue-500',
    },
    {
      id: '2',
      title: 'Machine Learning Implementation',
      instructor: 'Marcus Williams',
      description: 'Deep dive into practical ML implementation strategies for enterprise environments.',
      category: 'Technical',
      level: 'Advanced',
      duration: '16 hours',
      modules: 10,
      students: 189,
      rating: 4.8,
      reviews: 67,
      progress: 40,
      enrolled: true,
      image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: '3',
      title: 'Responsible AI Practices',
      instructor: 'Emily Rodriguez',
      description: 'Build ethical AI frameworks and ensure compliance with governance standards.',
      category: 'Ethics',
      level: 'Intermediate',
      duration: '8 hours',
      modules: 6,
      students: 312,
      rating: 5.0,
      reviews: 124,
      progress: 85,
      enrolled: true,
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
      gradient: 'from-cyan-500 to-green-500',
    },
    {
      id: '4',
      title: 'Change Management Essentials',
      instructor: 'Michael Chen',
      description: 'Learn proven strategies for leading successful organizational transformations.',
      category: 'Leadership',
      level: 'Beginner',
      duration: '10 hours',
      modules: 7,
      students: 428,
      rating: 4.7,
      reviews: 156,
      progress: 0,
      enrolled: false,
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
      gradient: 'from-green-500 to-amber-500',
    },
    {
      id: '5',
      title: 'Data Strategy & Architecture',
      instructor: 'James Taylor',
      description: 'Design robust data architectures that enable AI-driven decision making.',
      category: 'Technical',
      level: 'Advanced',
      duration: '14 hours',
      modules: 9,
      students: 156,
      rating: 4.9,
      reviews: 78,
      progress: 0,
      enrolled: false,
      image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      id: '6',
      title: 'AI Product Management',
      instructor: 'Lisa Anderson',
      description: 'Develop and launch successful AI-powered products with user-centric approaches.',
      category: 'Product',
      level: 'Intermediate',
      duration: '11 hours',
      modules: 8,
      students: 203,
      rating: 4.8,
      reviews: 91,
      progress: 0,
      enrolled: false,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
      gradient: 'from-orange-500 to-red-500',
    },
  ]

  const categories = ['all', 'Strategy', 'Technical', 'Ethics', 'Leadership', 'Product']
  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced']

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel
    return matchesSearch && matchesCategory && matchesLevel
  })

  const enrolledCourses = filteredCourses.filter(c => c.enrolled)
  const availableCourses = filteredCourses.filter(c => !c.enrolled)

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] pb-20 lg:pb-0 transition-all">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 backdrop-blur-sm border border-purple-500/20 mb-3">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-300 font-semibold font-diatype">Course Catalog</span>
                </div>
                <h1 className="text-3xl font-bold text-white font-gendy mb-2">
                  All Courses
                </h1>
                <p className="text-gray-400 font-diatype">
                  {filteredCourses.length} courses • {enrolledCourses.length} enrolled
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/dashboard/talent">
                  <button className="px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 hover:border-purple-500/30 transition-all inline-flex items-center gap-2 font-diatype">
                    <ArrowRight className="w-5 h-5 rotate-180" />
                    Back to Academy
                  </button>
                </Link>
              </motion.div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors font-diatype"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-colors font-diatype"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-colors font-diatype"
              >
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level === 'all' ? 'All Levels' : level}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <main className="p-8 space-y-10">
          {/* Continue Learning */}
          {enrolledCourses.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white font-gendy">Continue Learning</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {enrolledCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="group relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]"
                  >
                    <div className="flex gap-5 p-6">
                      {/* Course Image */}
                      <div className="relative w-48 h-32 rounded-xl overflow-hidden flex-shrink-0">
                        <Image
                          src={course.image}
                          alt={course.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <PlayCircle className="w-12 h-12 text-white" />
                        </div>
                      </div>

                      {/* Course Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-1 font-gendy group-hover:text-purple-400 transition-colors">
                              {course.title}
                            </h3>
                            <p className="text-sm text-gray-400 font-diatype">by {course.instructor}</p>
                          </div>
                          <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-md border border-purple-500/20 font-semibold font-diatype">
                            {course.level}
                          </span>
                        </div>

                        {/* Progress */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400 font-diatype">{course.progress}% Complete</span>
                            <span className="text-xs text-purple-400 font-diatype font-semibold">Continue</span>
                          </div>
                          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${course.gradient}`}
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-4 mt-4 text-xs text-gray-400 font-diatype">
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            {course.modules} modules
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {course.duration}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Available Courses */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <GraduationCap className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white font-gendy">Explore Courses</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  whileHover={{ y: -6 }}
                  className="group relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]"
                >
                  {/* Course Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />

                    {/* Level Badge */}
                    <div className="absolute top-3 right-3 px-3 py-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full">
                      <span className="text-xs font-semibold text-white font-diatype">{course.level}</span>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 px-3 py-1 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-full">
                      <span className="text-xs font-semibold text-blue-300 font-diatype">{course.category}</span>
                    </div>
                  </div>

                  {/* Course Details */}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white mb-2 font-gendy group-hover:text-blue-400 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-1 font-diatype">by {course.instructor}</p>
                    <p className="text-xs text-gray-500 mb-4 line-clamp-2 font-diatype">{course.description}</p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-semibold text-white font-gendy">{course.rating}</span>
                        <span className="text-xs text-gray-500 font-diatype">({course.reviews})</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-diatype">{course.students}</span>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs text-gray-400 font-diatype mb-4">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{course.modules} modules</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{course.duration}</span>
                      </div>
                    </div>

                    {/* Enroll Button */}
                    <button className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg inline-flex items-center justify-center gap-2 font-diatype">
                      <Award className="w-4 h-4" />
                      Enroll Now
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
