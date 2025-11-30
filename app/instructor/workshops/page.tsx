'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  Plus,
  Users,
  Star,
  Clock,
  Video,
  MapPin,
  Edit,
  CheckCircle,
  UserCheck,
  Mail,
  X,
  TrendingUp,
  BarChart3,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'

type WorkshopStatus = 'upcoming' | 'in-progress' | 'completed'
type WorkshopType = 'online' | 'in-person' | 'hybrid'

interface Workshop {
  id: number
  title: string
  type: WorkshopType
  status: WorkshopStatus
  date: string
  time: string
  duration: string
  capacity: number
  enrolled: number
  attended?: number
  waitlist: number
  location?: string
  meetingLink?: string
  satisfaction?: number
  price: number
  revenue: number
}

const instructorWorkshops: Workshop[] = [
  {
    id: 1,
    title: 'AI Strategy & Implementation',
    type: 'hybrid',
    status: 'upcoming',
    date: '2025-10-15',
    time: '14:00',
    duration: '3 hours',
    capacity: 30,
    enrolled: 24,
    waitlist: 5,
    location: 'Innovation Hub, NYC',
    meetingLink: 'https://meet.humanglue.ai/workshop-1',
    price: 499,
    revenue: 11976,
  },
  {
    id: 2,
    title: 'Change Management Masterclass',
    type: 'online',
    status: 'completed',
    date: '2025-09-28',
    time: '10:00',
    duration: '4 hours',
    capacity: 50,
    enrolled: 45,
    attended: 42,
    waitlist: 12,
    meetingLink: 'https://meet.humanglue.ai/workshop-2',
    satisfaction: 4.8,
    price: 399,
    revenue: 17955,
  },
  {
    id: 3,
    title: 'Leadership in AI Era',
    type: 'in-person',
    status: 'completed',
    date: '2025-09-20',
    time: '09:00',
    duration: '6 hours',
    capacity: 25,
    enrolled: 25,
    attended: 23,
    waitlist: 8,
    location: 'Tech Center, San Francisco',
    satisfaction: 4.9,
    price: 699,
    revenue: 17475,
  },
]

export default function InstructorWorkshopsPage() {
  const router = useRouter()

  // Trust middleware protection - no need for client-side auth checks
  // Middleware already validates access before page loads
  const [workshops] = useState<Workshop[]>(instructorWorkshops)
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'all' | 'upcoming' | 'completed'>('all')
  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  const filteredWorkshops = workshops.filter((workshop) => {
    if (selectedTab === 'all') return true
    if (selectedTab === 'upcoming') return workshop.status === 'upcoming'
    if (selectedTab === 'completed') return workshop.status === 'completed'
    return true
  })

  const totalAttendees = workshops.reduce((sum, w) => sum + w.enrolled, 0)
  const totalRevenue = workshops.reduce((sum, w) => sum + w.revenue, 0)
  const avgSatisfaction =
    workshops.filter((w) => w.satisfaction).reduce((sum, w) => sum + (w.satisfaction || 0), 0) /
    workshops.filter((w) => w.satisfaction).length

  const getStatusColor = (status: WorkshopStatus) => {
    const colors = {
      upcoming: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'in-progress': 'bg-green-500/20 text-green-300 border-green-500/30',
      completed: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    }
    return colors[status]
  }

  const getTypeIcon = (type: WorkshopType) => {
    if (type === 'online') return <Video className="w-4 h-4" />
    if (type === 'in-person') return <MapPin className="w-4 h-4" />
    return <Video className="w-4 h-4" />
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
                <h1 className="text-3xl font-bold text-white mb-2 font-gendy">My Workshops</h1>
                <p className="text-gray-400 font-diatype">
                  Schedule and manage live learning sessions ({workshops.length} workshops)
                </p>
              </div>
              <Link href="/instructor/workshops/new">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-diatype"
                >
                  <Plus className="w-5 h-5" />
                  Schedule Workshop
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
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1 font-gendy">{workshops.length}</h3>
              <p className="text-sm text-gray-400 font-diatype">Total Workshops</p>
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
                {totalAttendees}
              </h3>
              <p className="text-sm text-gray-400 font-diatype">Total Attendees</p>
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
                {avgSatisfaction.toFixed(1)}
              </h3>
              <p className="text-sm text-gray-400 font-diatype">Avg Satisfaction</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-green-900/30 to-green-900/10 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1 font-gendy">
                ${(totalRevenue / 1000).toFixed(1)}k
              </h3>
              <p className="text-sm text-gray-400 font-diatype">Total Revenue</p>
            </motion.div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            {(['all', 'upcoming', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-2 rounded-lg font-diatype transition-all ${
                  selectedTab === tab
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Workshops Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredWorkshops.map((workshop, index) => (
              <motion.div
                key={workshop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group"
              >
                {/* Workshop Header */}
                <div className="relative bg-gradient-to-br from-blue-900/30 to-cyan-900/30 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(workshop.status)}`}>
                      {workshop.status}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300 bg-black/20 px-2 py-1 rounded-lg">
                      {getTypeIcon(workshop.type)}
                      <span className="font-diatype capitalize">{workshop.type}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 font-gendy">{workshop.title}</h3>

                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span className="font-diatype">
                        {new Date(workshop.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span className="font-diatype">{workshop.duration}</span>
                    </div>
                  </div>
                </div>

                {/* Workshop Stats */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-blue-400 font-diatype">Enrolled</span>
                      </div>
                      <p className="text-xl font-bold text-white font-gendy">
                        {workshop.enrolled}/{workshop.capacity}
                      </p>
                    </div>

                    {workshop.status === 'completed' && workshop.attended !== undefined && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <UserCheck className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-green-400 font-diatype">Attended</span>
                        </div>
                        <p className="text-xl font-bold text-white font-gendy">{workshop.attended}</p>
                      </div>
                    )}

                    {workshop.waitlist > 0 && (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-amber-400" />
                          <span className="text-sm text-amber-400 font-diatype">Waitlist</span>
                        </div>
                        <p className="text-xl font-bold text-white font-gendy">{workshop.waitlist}</p>
                      </div>
                    )}

                    {workshop.satisfaction && (
                      <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                          <span className="text-sm text-cyan-400 font-diatype">Rating</span>
                        </div>
                        <p className="text-xl font-bold text-white font-gendy">{workshop.satisfaction}</p>
                      </div>
                    )}
                  </div>

                  {/* Revenue */}
                  <div className="mb-4 p-3 bg-white/5 rounded-xl">
                    <p className="text-sm text-gray-400 mb-1 font-diatype">Revenue</p>
                    <p className="text-2xl font-bold text-green-400 font-gendy">
                      ${workshop.revenue.toLocaleString()}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedWorkshop(workshop)
                        setShowDetailsModal(true)
                      }}
                      className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-lg transition-all flex items-center justify-center gap-2 font-diatype"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Details
                    </motion.button>
                    <Link href={`/instructor/workshops/${workshop.id}`}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 rounded-lg transition-all flex items-center justify-center gap-2 font-diatype"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </motion.button>
                    </Link>
                    {workshop.status === 'upcoming' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 rounded-lg transition-all flex items-center justify-center gap-2 font-diatype"
                      >
                        <Mail className="w-4 h-4" />
                        Email
                      </motion.button>
                    )}
                    {workshop.status === 'completed' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 rounded-lg transition-all flex items-center justify-center gap-2 font-diatype"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Report
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Workshop Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedWorkshop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailsModal(false)}
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
                  <h2 className="text-2xl font-bold text-white font-gendy">Workshop Details</h2>
                  <p className="text-sm text-gray-400 font-diatype">{selectedWorkshop.title}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
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
                      {selectedWorkshop.enrolled}
                    </p>
                    <p className="text-xs text-gray-400 font-diatype">Enrolled</p>
                  </div>
                  {selectedWorkshop.attended !== undefined && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                      <CheckCircle className="w-5 h-5 text-green-400 mb-2" />
                      <p className="text-2xl font-bold text-white mb-1 font-gendy">
                        {selectedWorkshop.attended}
                      </p>
                      <p className="text-xs text-gray-400 font-diatype">Attended</p>
                    </div>
                  )}
                  {selectedWorkshop.satisfaction && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                      <Star className="w-5 h-5 text-amber-400 mb-2" />
                      <p className="text-2xl font-bold text-white mb-1 font-gendy">
                        {selectedWorkshop.satisfaction}
                      </p>
                      <p className="text-xs text-gray-400 font-diatype">Satisfaction</p>
                    </div>
                  )}
                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
                    <TrendingUp className="w-5 h-5 text-cyan-400 mb-2" />
                    <p className="text-2xl font-bold text-white mb-1 font-gendy">
                      ${selectedWorkshop.revenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 font-diatype">Revenue</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="text-white font-semibold mb-2 font-gendy">Workshop Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400 font-diatype">Date & Time</p>
                        <p className="text-white font-diatype">
                          {new Date(selectedWorkshop.date).toLocaleDateString()} at {selectedWorkshop.time}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 font-diatype">Duration</p>
                        <p className="text-white font-diatype">{selectedWorkshop.duration}</p>
                      </div>
                      {selectedWorkshop.location && (
                        <div>
                          <p className="text-gray-400 font-diatype">Location</p>
                          <p className="text-white font-diatype">{selectedWorkshop.location}</p>
                        </div>
                      )}
                      {selectedWorkshop.meetingLink && (
                        <div>
                          <p className="text-gray-400 font-diatype">Meeting Link</p>
                          <a
                            href={selectedWorkshop.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 font-diatype underline"
                          >
                            Join Workshop
                          </a>
                        </div>
                      )}
                    </div>
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
