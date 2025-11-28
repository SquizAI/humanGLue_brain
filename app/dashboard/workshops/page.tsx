'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  Video,
  Calendar,
  Clock,
  Users,
  ArrowRight,
  Filter,
  Search,
  Star,
  BookmarkPlus,
  Play,
  CheckCircle2,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'

interface Workshop {
  id: string
  title: string
  description: string
  instructor: string
  duration: string
  date: string
  time: string
  participants: number
  maxParticipants: number
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  category: string
  status: 'upcoming' | 'in-progress' | 'completed'
  rating: number
  image: string
}

export default function WorkshopsPage() {
  const router = useRouter()
  const { userData, authLoading } = useChat()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [showContent, setShowContent] = useState(false)

  // Timeout for authLoading - if it takes more than 3 seconds, assume middleware validated access
  useEffect(() => {
    // If auth loads quickly and user is authenticated, show content
    if (!authLoading && userData?.authenticated) {
      setShowContent(true)
      return
    }

    // If auth is still loading after 3 seconds, trust middleware and show content anyway
    const timeout = setTimeout(() => {
      console.log('[WorkshopsPage] Auth timeout - trusting middleware protection')
      setShowContent(true)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [authLoading, userData])

  // Only redirect if we're certain user is not authenticated
  // Don't redirect on empty userData - trust middleware protection
  useEffect(() => {
    if (!authLoading && userData?.authenticated === false) {
      console.log('[WorkshopsPage] Redirecting to login - explicitly not authenticated')
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

  const workshops: Workshop[] = [
    {
      id: '1',
      title: 'AI Strategy Fundamentals',
      description: 'Learn to develop and implement effective AI strategies for your organization',
      instructor: 'Dr. Sarah Chen',
      duration: '2h 30m',
      date: 'Nov 15, 2025',
      time: '2:00 PM EST',
      participants: 24,
      maxParticipants: 30,
      level: 'Beginner',
      category: 'Strategy',
      status: 'upcoming',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
    },
    {
      id: '2',
      title: 'Building AI-Ready Teams',
      description: 'Transform your workforce to embrace AI capabilities and drive innovation',
      instructor: 'Marcus Williams',
      duration: '3h',
      date: 'Nov 18, 2025',
      time: '10:00 AM EST',
      participants: 18,
      maxParticipants: 25,
      level: 'Intermediate',
      category: 'Leadership',
      status: 'upcoming',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop',
    },
    {
      id: '3',
      title: 'AI Ethics & Governance',
      description: 'Navigate the ethical considerations and governance frameworks for AI implementation',
      instructor: 'Dr. Emily Rodriguez',
      duration: '2h',
      date: 'Dec 5, 2025',
      time: '1:00 PM EST',
      participants: 30,
      maxParticipants: 30,
      level: 'Advanced',
      category: 'Ethics',
      status: 'upcoming',
      rating: 5.0,
      image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&h=400&fit=crop',
    },
    {
      id: '4',
      title: 'Machine Learning for Business Leaders',
      description: 'Understand ML concepts and applications without the technical jargon',
      instructor: 'James Taylor',
      duration: '2h 45m',
      date: 'Dec 12, 2025',
      time: '3:00 PM EST',
      participants: 15,
      maxParticipants: 20,
      level: 'Beginner',
      category: 'Technical',
      status: 'upcoming',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop',
    },
    {
      id: '5',
      title: 'AI-Driven Process Automation',
      description: 'Identify and automate business processes using AI technologies',
      instructor: 'Lisa Anderson',
      duration: '3h 30m',
      date: 'Jan 8, 2026',
      time: '11:00 AM EST',
      participants: 12,
      maxParticipants: 25,
      level: 'Intermediate',
      category: 'Operations',
      status: 'upcoming',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop',
    },
    {
      id: '6',
      title: 'Change Management for AI Transformation',
      description: 'Lead successful AI transformations through effective change management',
      instructor: 'Michael Chen',
      duration: '2h 15m',
      date: 'Jan 15, 2026',
      time: '2:30 PM EST',
      participants: 20,
      maxParticipants: 30,
      level: 'Intermediate',
      category: 'Leadership',
      status: 'upcoming',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop',
    },
  ]

  const categories = ['all', 'Strategy', 'Leadership', 'Ethics', 'Technical', 'Operations']
  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced']

  const filteredWorkshops = workshops.filter((workshop) => {
    const matchesSearch = workshop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workshop.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || workshop.category === selectedCategory
    const matchesLevel = selectedLevel === 'all' || workshop.level === selectedLevel
    return matchesSearch && matchesCategory && matchesLevel
  })

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] pb-20 lg:pb-0 transition-all">
        <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white font-gendy mb-2">
                  AI Workshops
                </h1>
                <p className="text-gray-400 font-diatype">
                  Interactive sessions to build AI capabilities across your organization
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/dashboard">
                  <button className="px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 hover:border-purple-500/30 transition-all inline-flex items-center gap-2 font-diatype">
                    <ArrowRight className="w-5 h-5 rotate-180" />
                    Back to Dashboard
                  </button>
                </Link>
              </motion.div>
            </div>
          </div>
        </header>

        <main className="p-8 space-y-8">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search workshops..."
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
                <option value="all">All Categories</option>
                {categories.slice(1).map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-colors font-diatype"
              >
                <option value="all">All Levels</option>
                {levels.slice(1).map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkshops.map((workshop, index) => (
              <Link key={workshop.id} href={`/dashboard/workshops/${workshop.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="group relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] h-full flex flex-col"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={workshop.image}
                      alt={workshop.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <span className="px-2 py-1 rounded-full bg-purple-500/10 backdrop-blur-xl border border-purple-500/20 text-purple-400 text-xs font-semibold font-diatype">
                        {workshop.category}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 text-blue-400 text-xs font-semibold font-diatype">
                        {workshop.level}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4 flex flex-col flex-1">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2 font-gendy group-hover:text-purple-400 transition-colors">
                        {workshop.title}
                      </h3>
                      <p className="text-gray-400 text-sm font-diatype leading-relaxed line-clamp-2 mb-3">
                        {workshop.description}
                      </p>
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                        <Video className="w-4 h-4" />
                        <span className="font-diatype">{workshop.instructor}</span>
                      </div>
                    </div>

                    <div className="mt-auto space-y-3 pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span className="font-diatype">{workshop.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span className="font-diatype">{workshop.duration}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="w-4 h-4 fill-yellow-400" />
                          <span className="text-sm font-semibold font-diatype">{workshop.rating}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Users className="w-4 h-4" />
                          <span className="font-diatype">{workshop.participants}/{workshop.maxParticipants}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 opacity-0 group-hover:opacity-5 transition-opacity" />
                </motion.div>
              </Link>
            ))}
          </div>

          {filteredWorkshops.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 font-diatype">No workshops found matching your criteria</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
