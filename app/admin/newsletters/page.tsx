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
  Download,
  Upload,
  Filter,
  ArrowUpDown,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner'
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import { Text, Heading } from '@/components/atoms/Text'
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
      <div className="min-h-screen" style={{ backgroundColor: 'var(--hg-bg-primary)' }}>
        <DashboardSidebar onLogout={handleLogout} />
        <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 flex items-center justify-center min-h-screen">
          <LoadingSpinner variant="neural" size="xl" text="Loading newsletters..." />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--hg-bg-primary)' }}>
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        {/* Header */}
        <div className="border-b sticky top-0 z-30 hg-bg-sidebar hg-border">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <Heading as="h1" size="3xl" className="mb-2">Newsletter Management</Heading>
                <Text variant="muted">Manage email lists and subscribers</Text>
              </div>
              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
                icon={<Plus className="w-5 h-5" />}
              >
                {activeTab === 'lists' ? 'Create List' : 'Add Subscriber'}
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mt-6">
              <Button
                variant={activeTab === 'lists' ? 'cyan' : 'ghost'}
                onClick={() => setActiveTab('lists')}
                icon={<Mail className="w-4 h-4" />}
              >
                Email Lists
              </Button>
              <Button
                variant={activeTab === 'subscribers' ? 'cyan' : 'ghost'}
                onClick={() => setActiveTab('subscribers')}
                icon={<Users className="w-4 h-4" />}
              >
                Subscribers
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Search & Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 hg-text-muted" />
              <input
                type="text"
                placeholder={activeTab === 'lists' ? 'Search lists...' : 'Search subscribers...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-diatype hg-bg-secondary hg-border hg-text-primary"
                style={{ '--tw-ring-color': 'var(--hg-cyan-border)' } as React.CSSProperties}
              />
            </div>
            <Button variant="secondary" icon={<Filter className="w-4 h-4" />}>
              Filter
            </Button>
            <Button variant="secondary" icon={<Download className="w-4 h-4" />}>
              Export
            </Button>
            {activeTab === 'subscribers' && (
              <Button variant="secondary" icon={<Upload className="w-4 h-4" />}>
                Import
              </Button>
            )}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner variant="neural" size="lg" text="Loading data..." />
            </div>
          ) : activeTab === 'lists' ? (
            /* Lists View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lists.length === 0 ? (
                <div className="col-span-full text-center py-20">
                  <Mail className="w-16 h-16 mx-auto mb-4 hg-text-muted" />
                  <Heading as="h3" size="xl" className="mb-2">No email lists yet</Heading>
                  <Text variant="muted" className="mb-6">Create your first email list to start collecting subscribers</Text>
                  <Button variant="primary" size="lg" onClick={() => setShowCreateModal(true)}>
                    Create Your First List
                  </Button>
                </div>
              ) : (
                lists.map((list) => (
                  <motion.div
                    key={list.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card padding="lg" className="hover:border-[var(--hg-cyan-border)] transition-all h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl hg-cyan-bg">
                          <Mail className="w-6 h-6 hg-cyan-text" />
                        </div>
                        <Button variant="ghost" size="sm" icon={<MoreVertical className="w-4 h-4" />} />
                      </div>
                      <Heading as="h3" size="lg" className="mb-2">{list.name}</Heading>
                      <Text variant="muted" size="sm" className="mb-4 line-clamp-2">{list.description}</Text>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 hg-text-muted" />
                          <Text variant="muted" size="sm">{list.subscriber_count} subscribers</Text>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          list.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {list.status}
                        </span>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          ) : (
            /* Subscribers View */
            <Card padding="none" className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b hg-border">
                    <th className="px-6 py-4 text-left text-sm font-medium font-diatype hg-text-muted">
                      <button className="flex items-center gap-2 hover:hg-text-primary">
                        Email <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium font-diatype hg-text-muted">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-medium font-diatype hg-text-muted">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium font-diatype hg-text-muted">Lists</th>
                    <th className="px-6 py-4 text-left text-sm font-medium font-diatype hg-text-muted">Subscribed</th>
                    <th className="px-6 py-4 text-right text-sm font-medium font-diatype hg-text-muted">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <Users className="w-16 h-16 mx-auto mb-4 hg-text-muted" />
                        <Heading as="h3" size="xl" className="mb-2">No subscribers yet</Heading>
                        <Text variant="muted">Add your first subscriber or import a list</Text>
                      </td>
                    </tr>
                  ) : (
                    subscribers.map((subscriber) => (
                      <tr key={subscriber.id} className="border-b hg-border hover:hg-bg-secondary">
                        <td className="px-6 py-4">
                          <Text>{subscriber.email}</Text>
                        </td>
                        <td className="px-6 py-4">
                          <Text variant="muted">
                            {subscriber.first_name || subscriber.last_name
                              ? `${subscriber.first_name || ''} ${subscriber.last_name || ''}`.trim()
                              : '-'}
                          </Text>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            subscriber.status === 'subscribed'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : subscriber.status === 'unsubscribed'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {subscriber.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Text variant="muted">{subscriber.lists.length} lists</Text>
                        </td>
                        <td className="px-6 py-4">
                          <Text variant="muted" size="sm">{new Date(subscriber.subscribed_at).toLocaleDateString()}</Text>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />} />
                            <Button variant="ghost" size="sm" icon={<Edit className="w-4 h-4" />} />
                            <Button variant="ghost" size="sm" icon={<Trash2 className="w-4 h-4" />} className="hover:text-red-400" />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
