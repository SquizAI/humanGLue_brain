'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Video,
  Calendar,
  Clock,
  Users,
  Mic,
  MicOff,
  Download,
  Share2,
  FileText,
  CheckCircle,
  Sparkles,
  Play,
  Square,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Edit,
  ExternalLink,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'

// Sample meetings data
const meetingsData = [
  {
    id: 1,
    title: 'AI Strategy Planning Session',
    date: '2025-10-03',
    time: '2:00 PM - 3:30 PM',
    duration: '1h 30m',
    participants: ['Sarah Chen', 'Michael Rodriguez', 'You'],
    platform: 'Zoom',
    status: 'upcoming',
    meetingLink: 'https://zoom.us/j/123456789',
    aiAssistantEnabled: true,
  },
  {
    id: 2,
    title: 'Q4 Transformation Review',
    date: '2025-10-02',
    time: '10:00 AM - 11:00 AM',
    duration: '1h 0m',
    participants: ['Dr. Marcus Thompson', 'Jennifer Wu', 'You'],
    platform: 'Google Meet',
    status: 'completed',
    recording: true,
    transcript: true,
    summary: true,
    actionItems: 5,
    aiInsights: true,
  },
  {
    id: 3,
    title: 'Team Sync - Change Management',
    date: '2025-10-01',
    time: '3:00 PM - 3:45 PM',
    duration: '45m',
    participants: ['Sarah Chen', 'David Kim', 'Lisa Anderson', 'You'],
    platform: 'Microsoft Teams',
    status: 'completed',
    recording: true,
    transcript: true,
    summary: true,
    actionItems: 8,
    aiInsights: true,
  },
  {
    id: 4,
    title: 'Client Onboarding - Acme Corp',
    date: '2025-09-30',
    time: '1:00 PM - 2:00 PM',
    duration: '1h 0m',
    participants: ['John Smith (Acme)', 'Sarah Chen', 'You'],
    platform: 'Zoom',
    status: 'completed',
    recording: true,
    transcript: true,
    summary: true,
    actionItems: 12,
    aiInsights: true,
  },
  {
    id: 5,
    title: 'Weekly Leadership Check-in',
    date: '2025-10-04',
    time: '9:00 AM - 9:30 AM',
    duration: '30m',
    participants: ['Jennifer Wu', 'You'],
    platform: 'Google Meet',
    status: 'upcoming',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    aiAssistantEnabled: true,
  },
]

export default function MeetingsPage() {
  const router = useRouter()
  const { userData } = useChat()
  const [meetings, setMeetings] = useState(meetingsData)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null)

  useEffect(() => {
    if (!userData?.authenticated) {
      router.push('/login')
    }
  }, [userData, router])

  if (!userData?.authenticated) {
    return null
  }

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  const filteredMeetings = meetings.filter((meeting) => {
    const matchesSearch =
      searchQuery === '' ||
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.participants.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesFilter =
      selectedFilter === 'all' ||
      (selectedFilter === 'upcoming' && meeting.status === 'upcoming') ||
      (selectedFilter === 'completed' && meeting.status === 'completed')
    return matchesSearch && matchesFilter
  })

  const upcomingMeetings = meetings.filter((m) => m.status === 'upcoming')
  const completedMeetings = meetings.filter((m) => m.status === 'completed')

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all transition-all duration-300">
        {/* Header */}
        <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 font-gendy">AI Meeting Assistant</h1>
                <p className="text-gray-400 font-diatype">
                  Record, transcribe, and extract insights from your meetings
                </p>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-diatype"
                >
                  <Plus className="w-5 h-5" />
                  Schedule Meeting
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-purple-900/30 to-purple-900/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Calendar className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400 font-diatype">Upcoming</p>
                  <p className="text-3xl font-bold text-white font-gendy">{upcomingMeetings.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Video className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400 font-diatype">Recorded</p>
                  <p className="text-3xl font-bold text-white font-gendy">{completedMeetings.length}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-green-900/30 to-green-900/10 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <Sparkles className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400 font-diatype">AI Insights</p>
                  <p className="text-3xl font-bold text-white font-gendy">
                    {completedMeetings.filter((m) => m.aiInsights).length}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-amber-900/30 to-amber-900/10 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-500/20 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-amber-400" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400 font-diatype">Action Items</p>
                  <p className="text-3xl font-bold text-white font-gendy">
                    {completedMeetings.reduce((acc, m) => acc + (m.actionItems || 0), 0)}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search meetings..."
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-diatype"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                {['all', 'upcoming', 'completed'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all font-diatype ${
                      selectedFilter === filter
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Meetings List */}
          <div className="space-y-4">
            {filteredMeetings.map((meeting, index) => (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white font-gendy">{meeting.title}</h3>
                        {meeting.status === 'upcoming' && (
                          <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-semibold border border-green-500/30">
                            Upcoming
                          </span>
                        )}
                        {meeting.aiAssistantEnabled && (
                          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-semibold border border-purple-500/30 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            AI Assistant
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span className="font-diatype">{meeting.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span className="font-diatype">{meeting.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span className="font-diatype">{meeting.participants.length} participants</span>
                        </div>
                      </div>
                    </div>

                    {meeting.status === 'upcoming' && meeting.meetingLink && (
                      <Link href={meeting.meetingLink} target="_blank">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-diatype"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Join Meeting
                        </motion.button>
                      </Link>
                    )}
                  </div>

                  {/* Participants */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {meeting.participants.map((participant, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-white/5 rounded-lg text-sm text-gray-300 font-diatype"
                        >
                          {participant}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Completed Meeting Features */}
                  {meeting.status === 'completed' && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-white/10">
                      {meeting.recording && (
                        <Link href={`/dashboard/meetings/${meeting.id}/recording`}>
                          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                            <Video className="w-5 h-5 text-purple-400" />
                            <div>
                              <p className="text-sm font-semibold text-white font-diatype">Recording</p>
                              <p className="text-xs text-gray-400 font-diatype">{meeting.duration}</p>
                            </div>
                          </div>
                        </Link>
                      )}
                      {meeting.transcript && (
                        <Link href={`/dashboard/meetings/${meeting.id}/transcript`}>
                          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                            <FileText className="w-5 h-5 text-blue-400" />
                            <div>
                              <p className="text-sm font-semibold text-white font-diatype">Transcript</p>
                              <p className="text-xs text-gray-400 font-diatype">Full text</p>
                            </div>
                          </div>
                        </Link>
                      )}
                      {meeting.summary && (
                        <Link href={`/dashboard/meetings/${meeting.id}/summary`}>
                          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                            <Sparkles className="w-5 h-5 text-green-400" />
                            <div>
                              <p className="text-sm font-semibold text-white font-diatype">AI Summary</p>
                              <p className="text-xs text-gray-400 font-diatype">Key points</p>
                            </div>
                          </div>
                        </Link>
                      )}
                      {meeting.actionItems && (
                        <Link href={`/dashboard/meetings/${meeting.id}/actions`}>
                          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                            <CheckCircle className="w-5 h-5 text-amber-400" />
                            <div>
                              <p className="text-sm font-semibold text-white font-diatype">Action Items</p>
                              <p className="text-xs text-gray-400 font-diatype">{meeting.actionItems} items</p>
                            </div>
                          </div>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {filteredMeetings.length === 0 && (
            <div className="text-center py-12">
              <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2 font-gendy">No meetings found</h3>
              <p className="text-gray-400 font-diatype">Try adjusting your filters or schedule a new meeting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
