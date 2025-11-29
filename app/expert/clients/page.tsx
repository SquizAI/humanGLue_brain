'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Calendar, Clock, Star, MessageSquare, Phone, Video, Mail } from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useRouter } from 'next/navigation'

// Trust middleware protection - no need for client-side auth checks
// Middleware already validates access before page loads

export default function ExpertClientsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'active' | 'past' | 'pending'>('active')

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

  // Mock data - replace with real data from API
  const mockClients = {
    active: [
      {
        id: 1,
        name: 'Sarah Johnson',
        company: 'TechCorp Inc.',
        avatar: null,
        nextSession: '2025-12-02T14:00:00',
        totalSessions: 8,
        rating: 5,
        focus: 'AI Strategy & Implementation'
      },
      {
        id: 2,
        name: 'Michael Chen',
        company: 'InnovateLabs',
        avatar: null,
        nextSession: '2025-12-05T10:00:00',
        totalSessions: 5,
        rating: 5,
        focus: 'Team AI Coaching'
      }
    ],
    past: [
      {
        id: 3,
        name: 'Emily Rodriguez',
        company: 'DataFlow Systems',
        avatar: null,
        lastSession: '2025-10-15T16:00:00',
        totalSessions: 12,
        rating: 4,
        focus: 'Change Management'
      }
    ],
    pending: [
      {
        id: 4,
        name: 'David Kim',
        company: 'StartupHub',
        avatar: null,
        requestedDate: '2025-12-03T11:00:00',
        focus: 'AI Transformation Roadmap'
      }
    ]
  }

  const clients = mockClients[activeTab]

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 font-gendy">Client Engagements</h1>
            <p className="text-gray-400 font-diatype">Manage your client relationships and upcoming sessions</p>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-2 border-b border-white/10">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-6 py-3 font-medium transition-all font-diatype ${
                activeTab === 'active'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Active Clients ({mockClients.active.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 font-medium transition-all font-diatype ${
                activeTab === 'pending'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Pending ({mockClients.pending.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-6 py-3 font-medium transition-all font-diatype ${
                activeTab === 'past'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Past Clients ({mockClients.past.length})
            </button>
          </div>

          {/* Client List */}
          <div className="grid gap-4">
            {clients.map((client: any, index: number) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold font-gendy">
                      {client.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>

                    {/* Client Info */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1 font-gendy">{client.name}</h3>
                      <p className="text-gray-400 text-sm mb-2 font-diatype">{client.company}</p>
                      <p className="text-gray-300 text-sm mb-3 font-diatype">Focus: {client.focus}</p>

                      <div className="flex items-center gap-6 text-sm">
                        {activeTab === 'active' && (
                          <>
                            <div className="flex items-center gap-2 text-gray-400">
                              <Calendar className="w-4 h-4" />
                              <span className="font-diatype">Next: {new Date(client.nextSession).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                              <Clock className="w-4 h-4" />
                              <span className="font-diatype">{client.totalSessions} sessions</span>
                            </div>
                          </>
                        )}
                        {activeTab === 'past' && (
                          <>
                            <div className="flex items-center gap-2 text-gray-400">
                              <Calendar className="w-4 h-4" />
                              <span className="font-diatype">Last: {new Date(client.lastSession).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                              <Clock className="w-4 h-4" />
                              <span className="font-diatype">{client.totalSessions} sessions</span>
                            </div>
                          </>
                        )}
                        {activeTab === 'pending' && (
                          <div className="flex items-center gap-2 text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span className="font-diatype">Requested: {new Date(client.requestedDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {(activeTab === 'active' || activeTab === 'past') && (
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="font-diatype">{client.rating}.0</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {activeTab === 'active' && (
                      <>
                        <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10">
                          <MessageSquare className="w-5 h-5 text-gray-400" />
                        </button>
                        <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10">
                          <Mail className="w-5 h-5 text-gray-400" />
                        </button>
                        <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg transition-all font-diatype">
                          <Video className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    {activeTab === 'pending' && (
                      <>
                        <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all font-diatype border border-green-500/30">
                          Accept
                        </button>
                        <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all font-diatype border border-red-500/30">
                          Decline
                        </button>
                      </>
                    )}
                    {activeTab === 'past' && (
                      <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all font-diatype border border-white/10 text-gray-300">
                        View History
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {clients.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2 font-gendy">No {activeTab} clients</h3>
                <p className="text-gray-500 font-diatype">
                  {activeTab === 'active' && "You don't have any active client engagements yet."}
                  {activeTab === 'pending' && "No pending client requests at the moment."}
                  {activeTab === 'past' && "No past client engagements to display."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
