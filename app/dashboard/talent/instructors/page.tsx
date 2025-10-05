'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Users,
  Star,
  Award,
  BookOpen,
  MessageCircle,
  ArrowRight,
  Search,
  Filter,
  Sparkles,
  GraduationCap,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'

export default function InstructorsPage() {
  const router = useRouter()
  const { userData } = useChat()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedExpertise, setSelectedExpertise] = useState('all')

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

  const instructors = [
    {
      id: '1',
      name: 'Dr. Sarah Chen',
      role: 'AI Strategy Expert',
      bio: 'Former CTO at Fortune 500 companies with 15+ years leading AI transformations. Specializes in enterprise-scale implementations.',
      specialties: ['AI Transformation', 'Change Management', 'Executive Leadership'],
      expertise: 'Strategy',
      rating: 4.9,
      students: 247,
      courses: 12,
      reviews: 89,
      featured: true,
      available: true,
      credentials: ['PhD Computer Science, MIT', 'Certified Change Management Professional'],
    },
    {
      id: '2',
      name: 'Marcus Williams',
      role: 'ML Engineering Lead',
      bio: 'Leading machine learning engineer with expertise in deploying production ML systems at scale. Published author and conference speaker.',
      specialties: ['Machine Learning', 'Neural Networks', 'MLOps'],
      expertise: 'Technical',
      rating: 4.8,
      students: 189,
      courses: 8,
      reviews: 67,
      featured: true,
      available: true,
      credentials: ['MS Machine Learning, Stanford', 'AWS Certified ML Specialist'],
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      role: 'Ethics & Governance Expert',
      bio: 'Pioneer in AI ethics with experience advising governments and corporations on responsible AI deployment. Regular contributor to policy frameworks.',
      specialties: ['AI Ethics', 'Responsible AI', 'Governance Frameworks'],
      expertise: 'Ethics',
      rating: 5.0,
      students: 312,
      courses: 15,
      reviews: 124,
      featured: true,
      available: false,
      credentials: ['JD Harvard Law', 'AI Ethics Certification, Oxford'],
    },
    {
      id: '4',
      name: 'Michael Chen',
      role: 'Organizational Change Consultant',
      bio: 'Organizational psychologist specializing in large-scale transformations. Helped 50+ organizations successfully navigate digital change.',
      specialties: ['Change Management', 'Culture Transformation', 'Leadership Development'],
      expertise: 'Leadership',
      rating: 4.7,
      students: 428,
      courses: 11,
      reviews: 156,
      featured: false,
      available: true,
      credentials: ['PhD Organizational Psychology', 'Prosci Certified Change Practitioner'],
    },
    {
      id: '5',
      name: 'James Taylor',
      role: 'Data Architecture Lead',
      bio: 'Enterprise data architect with deep expertise in building scalable data platforms that enable AI initiatives. Former Principal at major tech companies.',
      specialties: ['Data Architecture', 'Cloud Platforms', 'Data Strategy'],
      expertise: 'Technical',
      rating: 4.9,
      students: 156,
      courses: 7,
      reviews: 78,
      featured: false,
      available: true,
      credentials: ['MS Data Science, Berkeley', 'GCP Professional Data Engineer'],
    },
    {
      id: '6',
      name: 'Lisa Anderson',
      role: 'AI Product Strategy',
      bio: 'Product leader with track record of launching successful AI products. Expert in user-centric design and go-to-market strategies for AI solutions.',
      specialties: ['Product Management', 'User Research', 'AI Product Strategy'],
      expertise: 'Product',
      rating: 4.8,
      students: 203,
      courses: 9,
      reviews: 91,
      featured: false,
      available: true,
      credentials: ['MBA Wharton', 'Certified Product Manager'],
    },
  ]

  const expertiseAreas = ['all', 'Strategy', 'Technical', 'Ethics', 'Leadership', 'Product']

  const filteredInstructors = instructors.filter((instructor) => {
    const matchesSearch = instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         instructor.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         instructor.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesExpertise = selectedExpertise === 'all' || instructor.expertise === selectedExpertise
    return matchesSearch && matchesExpertise
  })

  const featuredInstructors = filteredInstructors.filter(i => i.featured)
  const regularInstructors = filteredInstructors.filter(i => !i.featured)

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="ml-[280px]">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 backdrop-blur-sm border border-amber-500/20 mb-3">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-amber-300 font-semibold font-diatype">Faculty</span>
                </div>
                <h1 className="text-3xl font-bold text-white font-gendy mb-2">
                  Meet Our Instructors
                </h1>
                <p className="text-gray-400 font-diatype">
                  {filteredInstructors.length} world-class experts ready to guide your transformation
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/dashboard/talent">
                  <button className="px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 hover:border-amber-500/30 transition-all inline-flex items-center gap-2 font-diatype">
                    <ArrowRight className="w-5 h-5 rotate-180" />
                    Back to Academy
                  </button>
                </Link>
              </motion.div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search instructors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-500/50 transition-colors font-diatype"
                />
              </div>

              <select
                value={selectedExpertise}
                onChange={(e) => setSelectedExpertise(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 transition-colors font-diatype"
              >
                {expertiseAreas.map((area) => (
                  <option key={area} value={area}>
                    {area === 'all' ? 'All Expertise Areas' : area}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <main className="p-8 space-y-10">
          {/* Featured Faculty */}
          {featuredInstructors.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-6 h-6 text-amber-400" />
                <h2 className="text-2xl font-bold text-white font-gendy">Featured Faculty</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredInstructors.map((instructor, index) => (
                  <motion.div
                    key={instructor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -6 }}
                    className="group relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-amber-500/30 shadow-[0_0_40px_rgba(251,191,36,0.1)] hover:shadow-[0_0_60px_rgba(251,191,36,0.2)] transition-all"
                  >
                    {/* Featured Badge */}
                    <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 rounded-full flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-semibold text-amber-300 font-diatype">Featured</span>
                    </div>

                    {/* Avatar Section */}
                    <div className="relative h-56 bg-gradient-to-br from-amber-900/30 to-purple-900/20 overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.15),transparent_70%)]" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500/20 to-purple-500/20 border-2 border-white/10 flex items-center justify-center">
                          <GraduationCap className="w-16 h-16 text-amber-300/60" />
                        </div>
                      </div>

                      {/* Availability */}
                      {instructor.available && (
                        <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-green-500/20 backdrop-blur-sm rounded-full flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          <span className="text-xs font-semibold text-green-300 font-diatype">Available</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-amber-400 transition-colors font-gendy">
                        {instructor.name}
                      </h3>
                      <p className="text-amber-400 text-sm mb-3 font-diatype">{instructor.role}</p>

                      <p className="text-gray-400 text-sm mb-4 line-clamp-3 font-diatype">{instructor.bio}</p>

                      {/* Specialties */}
                      <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-white/10">
                        {instructor.specialties.map((specialty, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-amber-500/10 text-amber-300 text-xs rounded-md border border-amber-500/20 font-diatype"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span className="text-lg font-bold text-white font-gendy">{instructor.rating}</span>
                          </div>
                          <p className="text-xs text-gray-400 font-diatype">Rating</p>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-white font-gendy mb-1">{instructor.students}</div>
                          <p className="text-xs text-gray-400 font-diatype">Students</p>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-white font-gendy mb-1">{instructor.courses}</div>
                          <p className="text-xs text-gray-400 font-diatype">Courses</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 hover:border-amber-500/30 transition-all inline-flex items-center justify-center gap-2 font-diatype">
                          <MessageCircle className="w-4 h-4" />
                          Contact
                        </button>
                        <button className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-semibold hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg inline-flex items-center justify-center gap-2 font-diatype">
                          View Profile
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* All Instructors */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white font-gendy">All Instructors</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {regularInstructors.map((instructor, index) => (
                <motion.div
                  key={instructor.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="group relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]"
                >
                  <div className="p-6">
                    <div className="flex gap-5">
                      {/* Avatar */}
                      <div className="relative w-24 h-24 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="w-12 h-12 text-purple-300/60" />
                        {instructor.available && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-950" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-1 font-gendy group-hover:text-purple-400 transition-colors">
                              {instructor.name}
                            </h3>
                            <p className="text-purple-400 text-sm font-diatype">{instructor.role}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span className="text-sm font-semibold text-white font-gendy">{instructor.rating}</span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-400 mb-3 line-clamp-2 font-diatype">{instructor.bio}</p>

                        {/* Specialties */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {instructor.specialties.slice(0, 2).map((specialty, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-purple-500/10 text-purple-300 text-xs rounded-md border border-purple-500/20 font-diatype"
                            >
                              {specialty}
                            </span>
                          ))}
                          {instructor.specialties.length > 2 && (
                            <span className="px-2 py-0.5 bg-white/5 text-gray-400 text-xs rounded-md font-diatype">
                              +{instructor.specialties.length - 2}
                            </span>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs text-gray-400 mb-3 font-diatype">
                          <div className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {instructor.students} students
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            {instructor.courses} courses
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button className="px-3 py-1.5 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 text-xs font-semibold font-diatype">
                            Contact
                          </button>
                          <button className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs font-semibold inline-flex items-center gap-1 font-diatype">
                            View Profile
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
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
