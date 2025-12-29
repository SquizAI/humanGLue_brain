'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Users,
  Search,
  Mail,
  Shield,
  Eye,
  MoreVertical,
  Download,
  CheckCircle,
  X,
  UserPlus,
  Activity,
  AlertCircle,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner'
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import { StatCard } from '@/components/atoms/StatCard'
import { Text, Heading } from '@/components/atoms/Text'
import { IconButton } from '@/components/molecules/IconButton'
import { useChat } from '@/lib/contexts/ChatContext'
import { signOut } from '@/lib/auth/hooks'

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'instructor' | 'user'
  status: 'active' | 'inactive' | 'disabled'
  enrollments: number
  lastActive: string
  joined: string
  avatar?: string
}

const initialUsers: User[] = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@example.com',
    role: 'user',
    status: 'active',
    enrollments: 5,
    lastActive: '2025-10-04',
    joined: '2025-08-15',
  },
  {
    id: 2,
    name: 'Dr. James Wilson',
    email: 'james.wilson@example.com',
    role: 'instructor',
    status: 'active',
    enrollments: 0,
    lastActive: '2025-10-03',
    joined: '2025-07-10',
  },
  {
    id: 3,
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    role: 'user',
    status: 'active',
    enrollments: 8,
    lastActive: '2025-10-04',
    joined: '2025-09-01',
  },
]

export default function UsersAdmin() {
  const { userData, authLoading } = useChat()
  const [users] = useState<User[]>(initialUsers)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showContent, setShowContent] = useState(false)

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteFullName, setInviteFullName] = useState('')
  const [inviteRole, setInviteRole] = useState<'client' | 'instructor' | 'expert' | 'admin'>('client')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && userData?.isAdmin) {
      setShowContent(true)
      return
    }

    const timeout = setTimeout(() => {
      console.log('[UsersAdmin] Auth timeout - trusting middleware protection')
      setShowContent(true)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [authLoading, userData])

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

  // Show loading state with sidebar visible
  if (!showContent) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--hg-bg-primary)' }}>
        <DashboardSidebar onLogout={handleLogout} />
        <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 flex items-center justify-center min-h-screen">
          <LoadingSpinner variant="neural" size="xl" text="Loading Users..." />
        </div>
      </div>
    )
  }

  const handleSendInvite = async () => {
    if (!inviteEmail) {
      setInviteError('Email address is required')
      return
    }

    setInviting(true)
    setInviteError(null)

    try {
      const response = await fetch('/api/admin/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          fullName: inviteFullName,
          role: inviteRole,
          organizationName: 'HumanGlue',
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to invite user')
      }

      setShowInviteModal(false)
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)

      setInviteEmail('')
      setInviteFullName('')
      setInviteRole('client')
      setInviteError(null)
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setInviting(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === '' ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      instructor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      user: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    }
    return badges[role as keyof typeof badges] || 'bg-gray-500/20 text-gray-300'
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      inactive: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      disabled: 'bg-red-500/20 text-red-300 border-red-500/30',
    }
    return badges[status as keyof typeof badges] || 'bg-gray-500/20 text-gray-300'
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--hg-bg-primary)' }}>
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        {/* Header */}
        <div className="border-b sticky top-0 z-30" style={{ backgroundColor: 'var(--hg-bg-sidebar)', borderColor: 'var(--hg-border-color)' }}>
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Link href="/admin">
                    <Text variant="muted" size="sm" className="hover:underline">← Back to Dashboard</Text>
                  </Link>
                </div>
                <Heading as="h1" size="3xl">User Management</Heading>
                <Text variant="muted">
                  Manage platform users and permissions ({filteredUsers.length} users)
                </Text>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="secondary" size="lg" icon={<Download className="w-5 h-5" />}>
                  Export
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  icon={<UserPlus className="w-5 h-5" />}
                  onClick={() => setShowInviteModal(true)}
                >
                  Invite User
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Stats Grid - Using atomic StatCard components */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={users.length}
              subtitle="All time"
              icon={<Users className="w-5 h-5" />}
              variant="cyan"
            />

            <StatCard
              title="Active Users"
              value={users.filter((u) => u.status === 'active').length}
              subtitle="Online"
              icon={<Activity className="w-5 h-5" />}
              variant="cyan"
            />

            <StatCard
              title="Instructors"
              value={users.filter((u) => u.role === 'instructor').length}
              subtitle="Verified"
              icon={<Shield className="w-5 h-5" />}
              variant="cyan"
            />

            <StatCard
              title="New (30 days)"
              value={users.filter((u) => new Date(u.joined) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
              icon={<UserPlus className="w-5 h-5" />}
              variant="cyan"
              trend={{ value: 3, label: 'this week', direction: 'up' }}
            />
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 hg-text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users by name or email..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl transition-all hg-bg-secondary hg-border border hg-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--hg-cyan-border)]"
                  />
                </div>
              </div>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-3 rounded-xl transition-all hg-bg-secondary hg-border border hg-text-primary focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="instructor">Instructor</option>
                <option value="user">User</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 rounded-xl transition-all hg-bg-secondary hg-border border hg-text-primary focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </Card>

          {/* Users Table */}
          <Card padding="none" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="hg-border border-b">
                    <th className="text-left px-6 py-4"><Text variant="muted" size="sm" weight="semibold">User</Text></th>
                    <th className="text-left px-6 py-4"><Text variant="muted" size="sm" weight="semibold">Role</Text></th>
                    <th className="text-left px-6 py-4"><Text variant="muted" size="sm" weight="semibold">Status</Text></th>
                    <th className="text-left px-6 py-4"><Text variant="muted" size="sm" weight="semibold">Enrollments</Text></th>
                    <th className="text-left px-6 py-4"><Text variant="muted" size="sm" weight="semibold">Last Active</Text></th>
                    <th className="text-right px-6 py-4"><Text variant="muted" size="sm" weight="semibold">Actions</Text></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="transition-colors hg-border border-b"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                            <span className="text-white font-semibold font-gendy">{user.name.charAt(0)}</span>
                          </div>
                          <div>
                            <Text weight="semibold">{user.name}</Text>
                            <Text variant="muted" size="sm">{user.email}</Text>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Text>{user.enrollments}</Text>
                      </td>
                      <td className="px-6 py-4">
                        <Text variant="muted" size="sm">
                          {new Date(user.lastActive).toLocaleDateString()}
                        </Text>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <IconButton
                            icon={Eye}
                            variant="cyan"
                            size="sm"
                            label="View user"
                          />
                          <IconButton
                            icon={Mail}
                            variant="cyan"
                            size="sm"
                            label="Email user"
                          />
                          <IconButton
                            icon={MoreVertical}
                            variant="ghost"
                            size="sm"
                            label="More options"
                          />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* Invite User Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="hg-bg-card hg-border border rounded-2xl w-full max-w-md"
            >
              <div className="flex items-center justify-between p-6 border-b hg-border">
                <Heading as="h2" size="2xl">Invite User</Heading>
                <button onClick={() => setShowInviteModal(false)} className="p-2 rounded-lg transition-colors hover:bg-white/10">
                  <X className="w-6 h-6 hg-text-muted" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {inviteError && (
                  <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <Text variant="error" size="sm">{inviteError}</Text>
                  </div>
                )}

                <div>
                  <Text as="label" size="sm" weight="semibold" className="block mb-2">
                    Email Address *
                  </Text>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    disabled={inviting}
                    className="w-full px-4 py-3 rounded-xl disabled:opacity-50 hg-bg-secondary hg-border border hg-text-primary focus:outline-none"
                  />
                </div>

                <div>
                  <Text as="label" size="sm" weight="semibold" className="block mb-2">
                    Full Name
                  </Text>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={inviteFullName}
                    onChange={(e) => setInviteFullName(e.target.value)}
                    disabled={inviting}
                    className="w-full px-4 py-3 rounded-xl disabled:opacity-50 hg-bg-secondary hg-border border hg-text-primary focus:outline-none"
                  />
                  <Text variant="muted" size="xs" className="mt-1">
                    Optional - will default to email username
                  </Text>
                </div>

                <div>
                  <Text as="label" size="sm" weight="semibold" className="block mb-2">
                    Role *
                  </Text>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as typeof inviteRole)}
                    disabled={inviting}
                    className="w-full px-4 py-3 rounded-xl disabled:opacity-50 hg-bg-secondary hg-border border hg-text-primary focus:outline-none"
                  >
                    <option value="client">Client - Access courses and track learning</option>
                    <option value="instructor">Instructor - Create and manage courses</option>
                    <option value="expert">Expert - Provide expert insights</option>
                    <option value="admin">Admin - Full platform administration</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t hg-border">
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  disabled={inviting}
                  onClick={() => {
                    setShowInviteModal(false)
                    setInviteEmail('')
                    setInviteFullName('')
                    setInviteRole('client')
                    setInviteError(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={inviting}
                  isLoading={inviting}
                  icon={!inviting ? <Mail className="w-4 h-4" /> : undefined}
                  onClick={handleSendInvite}
                >
                  {inviting ? 'Sending...' : 'Send Invite'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-8 right-8 z-[60] bg-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3"
          >
            <CheckCircle className="w-6 h-6" />
            <span className="font-semibold font-diatype">Invitation sent successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
