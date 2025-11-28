'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  GraduationCap,
  Search,
  Filter,
  Clock,
  Users,
  Star,
  Play,
  CheckCircle2,
  TrendingUp,
  Award,
  Calendar,
  BookOpen,
  Video,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useCart } from '@/lib/contexts/CartContext'
import { BookmarkButton } from '@/components/molecules/BookmarkButton'
import { LikeButton } from '@/components/molecules/LikeButton'
import { ShareButton } from '@/components/molecules/ShareButton'
import { cn } from '@/utils/cn'

// Course categories based on Trivera + HumanGlue focus
const categories = [
  { id: 'ai-adoption', name: 'AI Adoption & Strategy', color: 'purple', icon: '🎯' },
  { id: 'change-management', name: 'Change Management', color: 'blue', icon: '🔄' },
  { id: 'leadership', name: 'Leadership & Culture', color: 'green', icon: '👥' },
  { id: 'data-ai', name: 'Data & AI Technical', color: 'cyan', icon: '🤖' },
  { id: 'human-skills', name: 'Human Skills & Coaching', color: 'amber', icon: '💬' },
  { id: 'ethics', name: 'AI Ethics & Governance', color: 'red', icon: '⚖️' },
]

// Masterclass-quality courses
const courses = [
  {
    id: 1,
    title: 'AI Transformation for Executives',
    instructor: 'Sarah Chen',
    category: 'ai-adoption',
    level: 'Executive',
    duration: '6 hours',
    lessons: 12,
    students: 2847,
    rating: 4.9,
    reviews: 384,
    price: 299,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop',
    description: 'Lead your organization through AI transformation with proven frameworks and real-world case studies.',
    skills: ['AI Strategy', 'Change Leadership', 'ROI Planning', 'Stakeholder Management'],
    upcoming: '2025-11-15',
  },
  {
    id: 2,
    title: 'Building Psychologically Safe Teams for AI',
    instructor: 'Aisha Mohamed',
    category: 'leadership',
    level: 'All Levels',
    duration: '4 hours',
    lessons: 8,
    students: 1923,
    rating: 5.0,
    reviews: 267,
    price: 199,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop',
    description: 'Create environments where teams can experiment, fail safely, and embrace AI-driven change.',
    skills: ['Team Dynamics', 'Culture Building', 'Fear Management', 'Innovation'],
    upcoming: '2025-11-20',
  },
  {
    id: 3,
    title: 'Data-Driven Decision Making for Leaders',
    instructor: 'Marcus Thompson',
    category: 'data-ai',
    level: 'Intermediate',
    duration: '8 hours',
    lessons: 16,
    students: 3156,
    rating: 4.8,
    reviews: 441,
    price: 349,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
    description: 'Master data analytics and AI-powered insights to make better strategic decisions faster.',
    skills: ['Analytics', 'Data Literacy', 'AI Tools', 'Business Intelligence'],
    upcoming: '2025-11-18',
  },
  {
    id: 4,
    title: 'AI Ethics & Responsible Innovation',
    instructor: 'Priya Patel',
    category: 'ethics',
    level: 'All Levels',
    duration: '5 hours',
    lessons: 10,
    students: 1634,
    rating: 4.9,
    reviews: 198,
    price: 249,
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=500&fit=crop',
    description: 'Navigate ethical challenges in AI deployment while building trust with stakeholders.',
    skills: ['AI Ethics', 'Governance', 'Risk Management', 'Compliance'],
    upcoming: '2025-11-22',
  },
  {
    id: 5,
    title: 'Change Management Mastery',
    instructor: 'Kenji Yamamoto',
    category: 'change-management',
    level: 'Advanced',
    duration: '10 hours',
    lessons: 20,
    students: 4271,
    rating: 4.7,
    reviews: 592,
    price: 399,
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=500&fit=crop',
    description: 'Advanced frameworks for leading organizational transformation in the AI era.',
    skills: ['Change Strategy', 'Resistance Management', 'Communication', 'Measurement'],
    upcoming: '2025-11-25',
  },
  {
    id: 6,
    title: 'Coaching Teams Through AI Adoption',
    instructor: 'Carlos Rivera',
    category: 'human-skills',
    level: 'Intermediate',
    duration: '6 hours',
    lessons: 12,
    students: 1512,
    rating: 4.8,
    reviews: 223,
    price: 279,
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=500&fit=crop',
    description: 'Practical coaching techniques to help teams embrace AI tools and overcome adoption fears.',
    skills: ['Coaching', 'Team Development', 'Active Listening', 'Behavior Change'],
    upcoming: '2025-11-28',
  },
]

export default function LearningPlatform() {
  const router = useRouter()
    const { addToCart } = useCart()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      searchQuery === '' ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel

    return matchesSearch && matchesCategory && matchesLevel
  })

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  const handleQuickAddToCart = (course: typeof courses[0]) => {
    addToCart({
      id: course.id.toString(),
      type: 'course',
      name: course.title,
      description: course.description,
      price: course.price,
      image: course.image,
      metadata: {
        instructor: course.instructor,
        duration: course.duration,
        level: course.level,
      },
    })

    setToastMessage(`${course.title} added to cart!`)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      {/* Toast Notification */}
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-semibold">{toastMessage}</span>
        </motion.div>
      )}

      <div className="ml-0 lg:ml-[var(--sidebar-width,280px)] transition-all">
        <div className="px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white font-gendy">
                    Learning Platform
                  </h1>
                  <p className="text-sm sm:text-base text-gray-400 mt-1 font-diatype">
                    Masterclass-quality courses for AI transformation & human skills
                  </p>
                </div>
              </div>
              <Link href="/dashboard/learning/schedule">
                <button className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-all flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">View Schedule</span>
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{courses.length}</div>
                    <div className="text-xs text-gray-400">Courses</div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Video className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">78</div>
                    <div className="text-xs text-gray-400">Lessons</div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/20 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <Users className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">15K+</div>
                    <div className="text-xs text-gray-400">Students</div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/20 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <Award className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">4.8</div>
                    <div className="text-xs text-gray-400">Avg Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-white font-gendy">Browse by Category</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory('all')}
                className={cn(
                  "px-4 py-2 rounded-lg font-semibold text-sm transition-all",
                  selectedCategory === 'all'
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
                )}
              >
                All Courses
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2",
                    selectedCategory === cat.id
                      ? `bg-${cat.color}-500/20 text-${cat.color}-300 border border-${cat.color}-500/30`
                      : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
                  )}
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses, instructors, topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
                />
              </div>
              <div>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-all"
                >
                  <option value="all">All Levels</option>
                  <option value="Executive">Executive</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="All Levels">All Levels</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Showing <span className="text-white font-semibold">{filteredCourses.length}</span> course{filteredCourses.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/30 transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]"
              >
                {/* Course Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
                  <div className="absolute top-3 right-3 px-3 py-1 bg-purple-500/90 backdrop-blur-sm rounded-full">
                    <span className="text-white text-xs font-bold">${course.price}</span>
                  </div>
                  <div className="absolute top-3 left-3 px-3 py-1 bg-blue-500/90 backdrop-blur-sm rounded-full">
                    <span className="text-white text-xs font-semibold">{course.level}</span>
                  </div>

                  {/* Social Actions - Top Right Corner */}
                  <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <BookmarkButton
                      item={{
                        id: course.id.toString(),
                        type: 'course',
                        name: course.title,
                        image: course.image,
                        metadata: {
                          instructor: course.instructor,
                          duration: course.duration,
                          price: course.price,
                          level: course.level,
                        }
                      }}
                      variant="icon-only"
                    />
                    <LikeButton
                      id={course.id.toString()}
                      type="course"
                      variant="icon-only"
                      showCount={false}
                    />
                    <ShareButton
                      id={course.id.toString()}
                      type="course"
                      title={course.title}
                      description={course.description}
                      variant="icon-only"
                      showCount={false}
                    />
                  </div>
                </div>

                <div className="p-6">
                  {/* Title and Instructor */}
                  <h3 className="text-lg font-bold text-white mb-2 font-gendy line-clamp-2 group-hover:text-purple-400 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4 font-diatype">
                    by {course.instructor}
                  </p>

                  {/* Description */}
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2 font-diatype">
                    {course.description}
                  </p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {course.skills.slice(0, 3).map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-purple-500/10 text-purple-300 text-xs rounded-full border border-purple-500/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-bold text-white">{course.rating}</span>
                      <span className="text-xs text-gray-500">({course.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-300">{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-300">{course.students.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Upcoming Date */}
                  {course.upcoming && (
                    <div className="mb-4 flex items-center gap-2 text-xs text-amber-400">
                      <Calendar className="w-3 h-3" />
                      <span>Next session: {new Date(course.upcoming).toLocaleDateString()}</span>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={(e) => {
                        e.preventDefault()
                        handleQuickAddToCart(course)
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 text-white rounded-lg font-semibold text-sm border border-white/20 hover:bg-white/20 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Add to Cart
                    </motion.button>
                    <Link href={`/dashboard/learning/${course.id}`} className="flex-1">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold text-sm group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all"
                      >
                        <Play className="w-4 h-4" />
                        View
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredCourses.length === 0 && (
            <div className="text-center py-16">
              <GraduationCap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2 font-gendy">No courses found</h3>
              <p className="text-gray-400 font-diatype mb-6">
                Try adjusting your search or filters
              </p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                  setSelectedLevel('all')
                }}
                className="px-6 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-all"
              >
                Clear All Filters
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
