'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Users,
  Video,
  MapPin,
  Save,
  Copy,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'

interface ClassSession {
  id: number
  title: string
  date: string
  startTime: string
  endTime: string
  type: 'live' | 'recorded' | 'hybrid'
  location: string
  maxParticipants: number
  module?: string
}

export default function CourseSchedulePage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string

  const [sessions, setSessions] = useState<ClassSession[]>([
    {
      id: 1,
      title: 'Module 1: Introduction to AI Transformation',
      date: '2025-11-10',
      startTime: '10:00',
      endTime: '11:30',
      type: 'live',
      location: 'Zoom',
      maxParticipants: 50,
      module: 'Module 1',
    },
    {
      id: 2,
      title: 'Module 2: Building Your AI Strategy',
      date: '2025-11-17',
      startTime: '10:00',
      endTime: '11:30',
      type: 'live',
      location: 'Zoom',
      maxParticipants: 50,
      module: 'Module 2',
    },
  ])

  const [newSession, setNewSession] = useState<Partial<ClassSession>>({
    title: '',
    date: '',
    startTime: '10:00',
    endTime: '11:30',
    type: 'live',
    location: 'Zoom',
    maxParticipants: 50,
  })

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  const handleAddSession = () => {
    if (!newSession.title || !newSession.date) {
      alert('Please fill in all required fields')
      return
    }

    const session: ClassSession = {
      id: Date.now(),
      title: newSession.title || '',
      date: newSession.date || '',
      startTime: newSession.startTime || '10:00',
      endTime: newSession.endTime || '11:30',
      type: newSession.type || 'live',
      location: newSession.location || 'Zoom',
      maxParticipants: newSession.maxParticipants || 50,
    }

    setSessions([...sessions, session])
    setNewSession({
      title: '',
      date: '',
      startTime: '10:00',
      endTime: '11:30',
      type: 'live',
      location: 'Zoom',
      maxParticipants: 50,
    })
  }

  const handleDeleteSession = (id: number) => {
    if (confirm('Delete this class session?')) {
      setSessions(sessions.filter((s) => s.id !== id))
    }
  }

  const handleDuplicateSession = (session: ClassSession) => {
    const duplicated: ClassSession = {
      ...session,
      id: Date.now(),
      title: `${session.title} (Copy)`,
    }
    setSessions([...sessions, duplicated])
  }

  const handleSave = async () => {
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 800))
    alert('Class schedule saved successfully!')
    router.push(`/instructor/courses/${courseId}`)
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        {/* Header */}
        <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => router.push(`/instructor/courses/${courseId}`)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-diatype">Back to Course</span>
              </button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg transition-all flex items-center gap-2 font-diatype"
              >
                <Save className="w-5 h-5" />
                Save Schedule
              </motion.button>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-white mb-2 font-gendy">
                Schedule Classes
              </h1>
              <p className="text-gray-400 font-diatype">
                Set up recurring or one-time class sessions for this course
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add New Session Form */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 sticky top-32">
                <h2 className="text-xl font-bold text-white mb-6 font-gendy">
                  Add New Session
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 font-diatype">
                      Session Title
                    </label>
                    <input
                      type="text"
                      value={newSession.title}
                      onChange={(e) =>
                        setNewSession({ ...newSession, title: e.target.value })
                      }
                      placeholder="e.g., Module 1: Introduction"
                      className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 transition-all font-diatype"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 font-diatype">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newSession.date}
                      onChange={(e) =>
                        setNewSession({ ...newSession, date: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-all font-diatype"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2 font-diatype">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={newSession.startTime}
                        onChange={(e) =>
                          setNewSession({ ...newSession, startTime: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-all font-diatype"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2 font-diatype">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={newSession.endTime}
                        onChange={(e) =>
                          setNewSession({ ...newSession, endTime: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-all font-diatype"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 font-diatype">
                      Session Type
                    </label>
                    <select
                      value={newSession.type}
                      onChange={(e) =>
                        setNewSession({
                          ...newSession,
                          type: e.target.value as 'live' | 'recorded' | 'hybrid',
                        })
                      }
                      className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-all font-diatype"
                    >
                      <option value="live">Live Session</option>
                      <option value="recorded">Recorded</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 font-diatype">
                      Location / Platform
                    </label>
                    <input
                      type="text"
                      value={newSession.location}
                      onChange={(e) =>
                        setNewSession({ ...newSession, location: e.target.value })
                      }
                      placeholder="e.g., Zoom, Teams, Classroom"
                      className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 transition-all font-diatype"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 font-diatype">
                      Max Participants
                    </label>
                    <input
                      type="number"
                      value={newSession.maxParticipants}
                      onChange={(e) =>
                        setNewSession({
                          ...newSession,
                          maxParticipants: parseInt(e.target.value),
                        })
                      }
                      min={1}
                      className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-all font-diatype"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddSession}
                    className="w-full py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 rounded-lg transition-all flex items-center justify-center gap-2 font-diatype"
                  >
                    <Plus className="w-5 h-5" />
                    Add Session
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Sessions List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white font-gendy">
                  Scheduled Sessions ({sessions.length})
                </h2>
              </div>

              {sessions.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 font-diatype">
                    No sessions scheduled yet. Add your first session to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((session, index) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-3 font-gendy">
                              {session.title}
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center gap-2 text-gray-400">
                                <Calendar className="w-4 h-4" />
                                <span className="font-diatype">
                                  {new Date(session.date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-gray-400">
                                <Clock className="w-4 h-4" />
                                <span className="font-diatype">
                                  {session.startTime} - {session.endTime}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-gray-400">
                                <MapPin className="w-4 h-4" />
                                <span className="font-diatype">{session.location}</span>
                              </div>

                              <div className="flex items-center gap-2 text-gray-400">
                                <Users className="w-4 h-4" />
                                <span className="font-diatype">
                                  Max {session.maxParticipants} participants
                                </span>
                              </div>
                            </div>

                            <div className="mt-3">
                              <span
                                className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                                  session.type === 'live'
                                    ? 'bg-green-500/20 text-green-300'
                                    : session.type === 'recorded'
                                    ? 'bg-blue-500/20 text-blue-300'
                                    : 'bg-purple-500/20 text-purple-300'
                                }`}
                              >
                                {session.type === 'live' && <Video className="w-3 h-3 mr-1" />}
                                {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleDuplicateSession(session)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                              title="Duplicate session"
                            >
                              <Copy className="w-4 h-4 text-gray-400" />
                            </button>
                            <button
                              onClick={() => handleDeleteSession(session.id)}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="Delete session"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
