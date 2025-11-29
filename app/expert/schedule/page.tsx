'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Video, Users, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useRouter } from 'next/navigation'

// Trust middleware protection - no need for client-side auth checks
// Middleware already validates access before page loads

export default function ExpertSchedulePage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'week' | 'month'>('week')

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      localStorage.removeItem('humanglue_user')
      localStorage.removeItem('demoUser')
      document.cookie = 'demoUser=; path=/; max-age=0'
      localStorage.removeItem('sb-egqqdscvxvtwcdwknbnt-auth-token')
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      window.location.href = '/login'
    }
  }

  // Mock upcoming sessions
  const upcomingSessions = [
    {
      id: 1,
      client: 'Sarah Johnson',
      company: 'TechCorp Inc.',
      date: '2025-12-02',
      time: '14:00',
      duration: 60,
      type: 'video',
      topic: 'AI Strategy Review'
    },
    {
      id: 2,
      client: 'Michael Chen',
      company: 'InnovateLabs',
      date: '2025-12-05',
      time: '10:00',
      duration: 60,
      type: 'video',
      topic: 'Team Coaching Session'
    },
    {
      id: 3,
      client: 'Emily Rodriguez',
      company: 'DataFlow Systems',
      date: '2025-12-07',
      time: '15:30',
      duration: 90,
      type: 'video',
      topic: 'Transformation Roadmap'
    }
  ]

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentDate(newDate)
  }

  const getWeekDays = () => {
    const days = []
    const start = new Date(currentDate)
    start.setDate(start.getDate() - start.getDay()) // Start from Sunday

    for (let i = 0; i < 7; i++) {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      days.push(day)
    }
    return days
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 font-gendy">Schedule</h1>
              <p className="text-gray-400 font-diatype">Manage your upcoming sessions and availability</p>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all font-diatype">
              Block Time Off
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Calendar View */}
            <div className="lg:col-span-2">
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white font-gendy">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigateWeek('prev')}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-400" />
                    </button>
                    <button
                      onClick={() => setCurrentDate(new Date())}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10 text-gray-300 font-diatype"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => navigateWeek('next')}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Week View */}
                <div className="grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-sm font-semibold text-gray-400 pb-2 font-diatype">
                      {day}
                    </div>
                  ))}
                  {getWeekDays().map((day, index) => {
                    const isToday = day.toDateString() === new Date().toDateString()
                    const hasSession = upcomingSessions.some(s =>
                      new Date(s.date).toDateString() === day.toDateString()
                    )

                    return (
                      <div
                        key={index}
                        className={`aspect-square p-2 rounded-lg border transition-all cursor-pointer ${
                          isToday
                            ? 'bg-purple-500/20 border-purple-500/50'
                            : hasSession
                            ? 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center h-full">
                          <span className={`text-sm font-medium font-diatype ${
                            isToday ? 'text-purple-400' : 'text-gray-300'
                          }`}>
                            {day.getDate()}
                          </span>
                          {hasSession && (
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Upcoming Sessions */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <h2 className="text-xl font-bold text-white mb-4 font-gendy">Upcoming Sessions</h2>
                <div className="space-y-4">
                  {upcomingSessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-white mb-1 font-diatype">{session.client}</h3>
                          <p className="text-xs text-gray-400 font-diatype">{session.company}</p>
                        </div>
                        <Video className="w-5 h-5 text-purple-400" />
                      </div>
                      <p className="text-sm text-gray-300 mb-3 font-diatype">{session.topic}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="font-diatype">{new Date(session.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="font-diatype">{session.time} ({session.duration}m)</span>
                        </div>
                      </div>
                      <button className="w-full mt-3 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all font-diatype text-sm border border-purple-500/30">
                        Join Session
                      </button>
                    </motion.div>
                  ))}

                  {upcomingSessions.length === 0 && (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm font-diatype">No upcoming sessions</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
