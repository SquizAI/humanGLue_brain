'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Plus, Trash2, Save } from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useRouter } from 'next/navigation'

// Trust middleware protection - no need for client-side auth checks
// Middleware already validates access before page loads

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
}

interface DaySchedule {
  enabled: boolean
  slots: TimeSlot[]
}

type WeekSchedule = {
  [key: string]: DaySchedule
}

export default function ExpertAvailabilityPage() {
  const router = useRouter()
  const [hasChanges, setHasChanges] = useState(false)
  const [schedule, setSchedule] = useState<WeekSchedule>({
    monday: {
      enabled: true,
      slots: [{ id: '1', startTime: '09:00', endTime: '17:00' }]
    },
    tuesday: {
      enabled: true,
      slots: [{ id: '2', startTime: '09:00', endTime: '17:00' }]
    },
    wednesday: {
      enabled: true,
      slots: [{ id: '3', startTime: '09:00', endTime: '17:00' }]
    },
    thursday: {
      enabled: true,
      slots: [{ id: '4', startTime: '09:00', endTime: '17:00' }]
    },
    friday: {
      enabled: true,
      slots: [{ id: '5', startTime: '09:00', endTime: '17:00' }]
    },
    saturday: {
      enabled: false,
      slots: []
    },
    sunday: {
      enabled: false,
      slots: []
    }
  })

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

  const toggleDay = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
        slots: !prev[day].enabled && prev[day].slots.length === 0
          ? [{ id: Date.now().toString(), startTime: '09:00', endTime: '17:00' }]
          : prev[day].slots
      }
    }))
    setHasChanges(true)
  }

  const addTimeSlot = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots, { id: Date.now().toString(), startTime: '09:00', endTime: '17:00' }]
      }
    }))
    setHasChanges(true)
  }

  const removeTimeSlot = (day: string, slotId: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter(slot => slot.id !== slotId)
      }
    }))
    setHasChanges(true)
  }

  const updateTimeSlot = (day: string, slotId: string, field: 'startTime' | 'endTime', value: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map(slot =>
          slot.id === slotId ? { ...slot, [field]: value } : slot
        )
      }
    }))
    setHasChanges(true)
  }

  const saveSchedule = () => {
    // TODO: API call to save schedule
    console.log('Saving schedule:', schedule)
    setHasChanges(false)
  }

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 font-gendy">Availability</h1>
              <p className="text-gray-400 font-diatype">Set your weekly working hours for client bookings</p>
            </div>
            {hasChanges && (
              <button
                onClick={saveSchedule}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all font-diatype flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            )}
          </div>

          {/* Settings */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                Session Duration
              </label>
              <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-diatype">
                <option value="30">30 minutes</option>
                <option value="60" selected>60 minutes</option>
                <option value="90">90 minutes</option>
                <option value="120">120 minutes</option>
              </select>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                Buffer Between Sessions
              </label>
              <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-diatype">
                <option value="0">No buffer</option>
                <option value="15" selected>15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                Booking Notice
              </label>
              <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-diatype">
                <option value="0">Same day</option>
                <option value="1" selected>1 day in advance</option>
                <option value="2">2 days in advance</option>
                <option value="7">1 week in advance</option>
              </select>
            </div>
          </div>

          {/* Weekly Schedule */}
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-6 font-gendy">Weekly Schedule</h2>

            <div className="space-y-4">
              {days.map(({ key, label }) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={schedule[key].enabled}
                        onChange={() => toggleDay(key)}
                        className="w-5 h-5 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/50"
                      />
                      <label className="text-lg font-semibold text-white font-gendy">{label}</label>
                    </div>
                    {schedule[key].enabled && (
                      <button
                        onClick={() => addTimeSlot(key)}
                        className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-all font-diatype text-sm flex items-center gap-1 border border-cyan-500/30"
                      >
                        <Plus className="w-4 h-4" />
                        Add Slot
                      </button>
                    )}
                  </div>

                  {schedule[key].enabled && (
                    <div className="space-y-2 ml-8">
                      {schedule[key].slots.map((slot) => (
                        <div key={slot.id} className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => updateTimeSlot(key, slot.id, 'startTime', e.target.value)}
                            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-diatype"
                          />
                          <span className="text-gray-400">to</span>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => updateTimeSlot(key, slot.id, 'endTime', e.target.value)}
                            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-diatype"
                          />
                          {schedule[key].slots.length > 1 && (
                            <button
                              onClick={() => removeTimeSlot(key, slot.id)}
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
