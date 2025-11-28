'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  PlayCircle,
  Clock,
  BookOpen,
  Award,
  Filter,
  Search,
  Star,
  TrendingUp,
  Users,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Target,
  Brain,
  Zap,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'

type CourseCategory = 'leadership' | 'technical' | 'culture' | 'strategy' | 'all'
type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'all'

interface Course {
  id: string
  title: string
  description: string
  category: CourseCategory
  difficulty: CourseDifficulty
  duration: string
  modules: number
  enrolled: number
  rating: number
  progress?: number
  thumbnail: string
  instructor: string
  skills: string[]
  isNew?: boolean
  isFeatured?: boolean
}

export default function CBTsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<CourseCategory>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<CourseDifficulty>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Trust middleware protection - no need for client-side auth checks
  // Middleware already validates access before page loads

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  // Mock course data
  const mockCourses: Course[] = [
    {
      id: 'ai-fundamentals',
      title: 'AI Fundamentals for Leaders',
      description:
        'Master the essentials of AI transformation and learn how to lead your organization through change.',
      category: 'leadership',
      difficulty: 'beginner',
      duration: '6 hours',
      modules: 5,
      enrolled: 1247,
      rating: 4.8,
      progress: 60,
      thumbnail: 'from-purple-500 to-blue-500',
      instructor: 'Dr. Sarah Chen',
      skills: ['AI Strategy', 'Change Management', 'Leadership'],
      isFeatured: true,
    },
    {
      id: 'data-literacy',
      title: 'Data Literacy & AI Decision Making',
      description:
        'Build data literacy skills and learn to make informed decisions using AI-powered insights.',
      category: 'technical',
      difficulty: 'intermediate',
      duration: '8 hours',
      modules: 6,
      enrolled: 892,
      rating: 4.9,
      thumbnail: 'from-blue-500 to-cyan-500',
      instructor: 'Prof. Michael Torres',
      skills: ['Data Analysis', 'AI Tools', 'Decision Making'],
      isNew: true,
    },
    {
      id: 'culture-transformation',
      title: 'Building an AI-Ready Culture',
      description:
        'Transform organizational culture to embrace AI and foster continuous innovation.',
      category: 'culture',
      difficulty: 'intermediate',
      duration: '5 hours',
      modules: 4,
      enrolled: 654,
      rating: 4.7,
      thumbnail: 'from-cyan-500 to-green-500',
      instructor: 'Dr. Emily Rodriguez',
      skills: ['Culture Change', 'Innovation', 'Team Building'],
    },
    {
      id: 'ai-strategy',
      title: 'AI Strategy & Implementation',
      description:
        'Develop comprehensive AI strategies and learn proven frameworks for successful implementation.',
      category: 'strategy',
      difficulty: 'advanced',
      duration: '10 hours',
      modules: 8,
      enrolled: 423,
      rating: 4.9,
      thumbnail: 'from-green-500 to-emerald-500',
      instructor: 'James Williams',
      skills: ['Strategic Planning', 'Implementation', 'ROI Optimization'],
      isFeatured: true,
    },
    {
      id: 'prompt-engineering',
      title: 'Prompt Engineering Mastery',
      description:
        'Master the art of crafting effective AI prompts to maximize productivity and output quality.',
      category: 'technical',
      difficulty: 'beginner',
      duration: '4 hours',
      modules: 3,
      enrolled: 1523,
      rating: 4.6,
      thumbnail: 'from-emerald-500 to-teal-500',
      instructor: 'Alex Kim',
      skills: ['Prompt Engineering', 'AI Tools', 'Productivity'],
      isNew: true,
    },
    {
      id: 'ethical-ai',
      title: 'Ethical AI & Responsible Innovation',
      description:
        'Navigate the ethical considerations of AI and build responsible innovation practices.',
      category: 'leadership',
      difficulty: 'intermediate',
      duration: '6 hours',
      modules: 5,
      enrolled: 734,
      rating: 4.8,
      thumbnail: 'from-teal-500 to-blue-500',
      instructor: 'Dr. Lisa Anderson',
      skills: ['Ethics', 'Compliance', 'Risk Management'],
    },
  ]

  // Filter courses
  const filteredCourses = mockCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = filterCategory === 'all' || course.category === filterCategory
    const matchesDifficulty = filterDifficulty === 'all' || course.difficulty === filterDifficulty

    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const stats = [
    {
      label: 'Available Courses',
      value: mockCourses.length.toString(),
      icon: <BookOpen className="w-6 h-6" />,
      gradient: 'from-purple-500 to-blue-500',
    },
    {
      label: 'In Progress',
      value: mockCourses.filter((c) => c.progress && c.progress > 0).length.toString(),
      icon: <PlayCircle className="w-6 h-6" />,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Completed',
      value: mockCourses.filter((c) => c.progress === 100).length.toString(),
      icon: <CheckCircle2 className="w-6 h-6" />,
      gradient: 'from-cyan-500 to-green-500',
    },
    {
      label: 'Total Hours',
      value: mockCourses.reduce((acc, c) => acc + parseInt(c.duration), 0).toString(),
      icon: <Clock className="w-6 h-6" />,
      gradient: 'from-green-500 to-emerald-500',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      {/* Main Content - offset by sidebar */}
      <div className="lg:ml-[var(--sidebar-width,280px)] pb-20 lg:pb-0 transition-all">
        {/* Header with glassmorphic effect */}
        <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-8 py-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1 font-gendy">
                Computer-Based Training
              </h1>
              <p className="text-gray-400 font-diatype">
                Self-paced courses with AI-reinforced learning pathways
              </p>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:border-purple-500/30 transition-all hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />

                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} bg-opacity-10 backdrop-blur-sm`}
                    >
                      <div className="text-white">{stat.icon}</div>
                    </div>
                  </div>

                  <div className="text-4xl font-bold text-white mb-2 font-gendy">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400 font-diatype">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Filters and Search */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses, skills, or instructors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/30 transition-all font-diatype"
                />
              </div>

              {/* Filter Toggle */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all inline-flex items-center gap-2 font-diatype ${
                  showFilters
                    ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300'
                    : 'bg-white/5 backdrop-blur-xl border border-white/10 text-gray-300 hover:border-purple-500/30'
                }`}
              >
                <Filter className="w-5 h-5" />
                Filters
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
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Category Filter */}
                      <div>
                        <label className="text-sm font-semibold text-gray-300 mb-2 block font-gendy">
                          Category
                        </label>
                        <select
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value as CourseCategory)}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/30 transition-all font-diatype"
                        >
                          <option value="all">All Categories</option>
                          <option value="leadership">Leadership</option>
                          <option value="technical">Technical</option>
                          <option value="culture">Culture</option>
                          <option value="strategy">Strategy</option>
                        </select>
                      </div>

                      {/* Difficulty Filter */}
                      <div>
                        <label className="text-sm font-semibold text-gray-300 mb-2 block font-gendy">
                          Difficulty
                        </label>
                        <select
                          value={filterDifficulty}
                          onChange={(e) => setFilterDifficulty(e.target.value as CourseDifficulty)}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/30 transition-all font-diatype"
                        >
                          <option value="all">All Levels</option>
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Courses Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2 font-gendy">
                  No courses found
                </h3>
                <p className="text-gray-400 font-diatype">
                  Try adjusting your filters or search query
                </p>
              </div>
            ) : (
              filteredCourses.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                >
                  <Link href={`/dashboard/cbts/${course.id}`}>
                    <motion.div
                      whileHover={{ y: -6, scale: 1.02 }}
                      className="group relative overflow-hidden h-full bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 transition-all duration-300 hover:border-purple-500/30 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]"
                    >
                      {/* Animated gradient background */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${course.thumbnail} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                      />

                      <div className="relative p-6">
                        {/* Thumbnail with gradient */}
                        <div
                          className={`h-40 rounded-xl bg-gradient-to-br ${course.thumbnail} mb-4 flex items-center justify-center relative overflow-hidden`}
                        >
                          <PlayCircle className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />

                          {/* Badges */}
                          <div className="absolute top-3 left-3 flex gap-2">
                            {course.isNew && (
                              <span className="px-3 py-1 bg-green-500/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full font-diatype">
                                New
                              </span>
                            )}
                            {course.isFeatured && (
                              <span className="px-3 py-1 bg-purple-500/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full font-diatype flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                Featured
                              </span>
                            )}
                          </div>

                          {/* Progress Bar */}
                          {course.progress !== undefined && course.progress > 0 && (
                            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/30">
                              <div
                                className="h-full bg-white/90 transition-all duration-300"
                                style={{ width: `${course.progress}%` }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text group-hover:text-transparent transition-all font-gendy">
                            {course.title}
                          </h3>
                          <p className="text-gray-400 text-sm mb-4 font-diatype leading-relaxed line-clamp-2">
                            {course.description}
                          </p>

                          {/* Meta Info */}
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-4 font-diatype">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {course.duration}
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              {course.modules} modules
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              {course.rating}
                            </div>
                          </div>

                          {/* Skills */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {course.skills.slice(0, 3).map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded-full font-diatype"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>

                          {/* Instructor */}
                          <div className="flex items-center gap-2 text-sm text-gray-400 font-diatype">
                            <Award className="w-4 h-4" />
                            {course.instructor}
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                          <div className="flex items-center gap-1 text-sm text-gray-500 font-diatype">
                            <Users className="w-4 h-4" />
                            {course.enrolled.toLocaleString()} enrolled
                          </div>
                          <div className="flex items-center gap-2 text-purple-400 group-hover:text-purple-300 group-hover:gap-3 transition-all">
                            <span className="text-sm font-semibold font-diatype">
                              {course.progress !== undefined && course.progress > 0
                                ? 'Continue'
                                : 'Start Course'}
                            </span>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
