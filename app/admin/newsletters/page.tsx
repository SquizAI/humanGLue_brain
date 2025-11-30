'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Mail,
  Users,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Edit,
  Eye,
  UserPlus,
  Download,
  Upload,
  Filter,
  ArrowUpDown,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'
import { signOut } from '@/lib/auth/hooks'

interface NewsletterList {
  id: string
  name: string
  description: string
  subscriber_count: number
  created_at: string
  status: 'active' | 'archived'
}

interface Subscriber {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  status: 'subscribed' | 'unsubscribed' | 'bounced'
  subscribed_at: string
  lists: string[]
}

export default function NewslettersPage() {
  const { userData, authLoading } = useChat()
  const [showContent, setShowContent] = useState(false)
  const [activeTab, setActiveTab] = useState<'lists' | 'subscribers'>('lists')
  const [lists, setLists] = useState<NewsletterList[]>([])
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    if (!authLoading && userData?.isAdmin) {
      setShowContent(true)
      return
    }
    const timeout = setTimeout(() => {
      setShowContent(true)
    }, 2000)
    return () => clearTimeout(timeout)
  }, [authLoading, userData])

  useEffect(() => {
    if (showContent) {
      fetchData()
    }
  }, [showContent, activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'lists') {
        const res = await fetch('/api/newsletters/lists')
        const data = await res.json()
        if (data.success) {
          setLists(data.lists || [])
        }
      } else {
        const res = await fetch('/api/newsletters/subscribers')
        const data = await res.json()
        if (data.success) {
          setSubscribers(data.subscribers || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      await signOut()
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

  if (!showContent) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
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
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white font-gendy">Newsletter Management</h1>
                </div>
                <p className="text-gray-400 font-diatype">Manage email lists and subscribers</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium shadow-lg shadow-cyan-500/25"
              >
                <Plus className="w-5 h-5" />
                {activeTab === 'lists' ? 'Create List' : 'Add Subscriber'}
              </motion.button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setActiveTab('lists')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'lists'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Lists
                </span>
              </button>
              <button
                onClick={() => setActiveTab('subscribers')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'subscribers'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Subscribers
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Search & Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder={activeTab === 'lists' ? 'Search lists...' : 'Search subscribers...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all">
              <Download className="w-4 h-4" />
              Export
            </button>
            {activeTab === 'subscribers' && (
              <button className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                <Upload className="w-4 h-4" />
                Import
              </button>
            )}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
          ) : activeTab === 'lists' ? (
            /* Lists View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lists.length === 0 ? (
                <div className="col-span-full text-center py-20">
                  <Mail className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No email lists yet</h3>
                  <p className="text-gray-400 mb-6">Create your first email list to start collecting subscribers</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium"
                  >
                    Create Your First List
                  </button>
                </div>
              ) : (
                lists.map((list) => (
                  <motion.div
                    key={list.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-cyan-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-cyan-500/20 rounded-xl">
                        <Mail className="w-6 h-6 text-cyan-400" />
                      </div>
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{list.name}</h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">{list.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        {list.subscriber_count} subscribers
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        list.status === 'active'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {list.status}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          ) : (
            /* Subscribers View */
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                      <button className="flex items-center gap-2 hover:text-white">
                        Email <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Lists</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Subscribed</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No subscribers yet</h3>
                        <p className="text-gray-400">Add your first subscriber or import a list</p>
                      </td>
                    </tr>
                  ) : (
                    subscribers.map((subscriber) => (
                      <tr key={subscriber.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-6 py-4 text-white">{subscriber.email}</td>
                        <td className="px-6 py-4 text-gray-400">
                          {subscriber.first_name || subscriber.last_name
                            ? `${subscriber.first_name || ''} ${subscriber.last_name || ''}`.trim()
                            : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            subscriber.status === 'subscribed'
                              ? 'bg-green-500/20 text-green-400'
                              : subscriber.status === 'unsubscribed'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {subscriber.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400">{subscriber.lists.length} lists</td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {new Date(subscriber.subscribed_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                              <Eye className="w-4 h-4 text-gray-400" />
                            </button>
                            <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                              <Edit className="w-4 h-4 text-gray-400" />
                            </button>
                            <button className="p-2 hover:bg-red-500/20 rounded-lg transition-all">
                              <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
