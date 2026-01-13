'use client'

import { useState, useEffect, useCallback } from 'react'
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
  Key,
  Trash2,
  Edit,
  Upload,
  RefreshCw,
  Clock,
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

interface UserRole {
  id: string
  role: string
  organization_id?: string
  granted_at: string
}

interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  job_title?: string
  company_name?: string
  status: 'active' | 'inactive' | 'disabled'
  is_active: boolean
  created_at: string
  updated_at: string
  last_login_at?: string
  roles: UserRole[]
}

export default function UsersAdmin() {
  const { userData, authLoading } = useChat()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successText, setSuccessText] = useState('Invitation sent successfully!')
  const [showContent, setShowContent] = useState(false)
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const limit = 20

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteFullName, setInviteFullName] = useState('')
  const [inviteRole, setInviteRole] = useState<'client' | 'instructor' | 'expert' | 'admin'>('client')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (searchQuery) params.set('search', searchQuery)
      if (selectedRole !== 'all') params.set('role', selectedRole)
      if (selectedStatus !== 'all') params.set('status', selectedStatus)

      const response = await fetch(`/api/users?${params}`)
      const result = await response.json()

      if (result.success) {
        setUsers(result.data || [])
        setTotalUsers(result.meta?.pagination?.total || 0)
        setTotalPages(result.meta?.pagination?.totalPages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }, [page, searchQuery, selectedRole, selectedStatus])

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

  useEffect(() => {
    if (showContent) {
      fetchUsers()
    }
  }, [showContent, fetchUsers])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showContent) {
        setPage(1)
        fetchUsers()
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, selectedRole, selectedStatus])

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
          organizationName: 'HMN',
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to invite user')
      }

      setShowInviteModal(false)
      setSuccessText('Invitation sent successfully!')
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)

      setInviteEmail('')
      setInviteFullName('')
      setInviteRole('client')
      setInviteError(null)

      // Refresh user list
      fetchUsers()
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setInviting(false)
    }
  }

  const handleResetPassword = async (userId: string, email: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to reset password')
      }

      setSuccessText(`Password reset email sent to ${email}`)
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
    } catch (error) {
      console.error('Password reset error:', error)
      alert(error instanceof Error ? error.message : 'Failed to reset password')
    }
    setActionMenuOpen(null)
  }

  const handleDisableUser = async (userId: string) => {
    if (!confirm('Are you sure you want to disable this user?')) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to disable user')
      }

      setSuccessText('User disabled successfully')
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
      fetchUsers()
    } catch (error) {
      console.error('Disable user error:', error)
      alert(error instanceof Error ? error.message : 'Failed to disable user')
    }
    setActionMenuOpen(null)
  }

  const getRoleBadge = (role: string) => {
    const badges: Record<string, string> = {
      admin: 'bg-red-500/20 text-red-300 border-red-500/30',
      instructor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      expert: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      client: 'bg-green-500/20 text-green-300 border-green-500/30',
      org_admin: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      team_lead: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      member: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    }
    return badges[role] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      inactive: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      disabled: 'bg-red-500/20 text-red-300 border-red-500/30',
    }
    return badges[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }

  const activeUsers = users.filter(u => u.status === 'active' || u.is_active).length
  const instructorCount = users.filter(u => u.roles?.some(r => r.role === 'instructor')).length
  const recentUsers = users.filter(u => {
    const created = new Date(u.created_at)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    return created > thirtyDaysAgo
  }).length

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
                  Manage platform users and permissions ({totalUsers} users total)
                </Text>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/admin/users/import">
                  <Button variant="secondary" size="lg" icon={<Upload className="w-5 h-5" />}>
                    Bulk Import
                  </Button>
                </Link>
                <Button variant="secondary" size="lg" icon={<Download className="w-5 h-5" />}>
                  Export
                </Button>
                <Link href="/admin/users/new">
                  <Button
                    variant="primary"
                    size="lg"
                    icon={<UserPlus className="w-5 h-5" />}
                  >
                    Create User
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={totalUsers}
              subtitle="All time"
              icon={<Users className="w-5 h-5" />}
              variant="cyan"
            />

            <StatCard
              title="Active Users"
              value={activeUsers}
              subtitle="Currently active"
              icon={<Activity className="w-5 h-5" />}
              variant="cyan"
            />

            <StatCard
              title="Instructors"
              value={instructorCount}
              subtitle="Teaching"
              icon={<Shield className="w-5 h-5" />}
              variant="cyan"
            />

            <StatCard
              title="New (30 days)"
              value={recentUsers}
              icon={<UserPlus className="w-5 h-5" />}
              variant="cyan"
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
                    placeholder="Search users by name, email, or company..."
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
                <option value="expert">Expert</option>
                <option value="client">Client</option>
                <option value="org_admin">Org Admin</option>
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
              <Button
                variant="secondary"
                icon={<RefreshCw className="w-4 h-4" />}
                onClick={() => fetchUsers()}
                disabled={loading}
              >
                Refresh
              </Button>
            </div>
          </Card>

          {/* Users Table */}
          <Card padding="none" className="overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner variant="neural" size="lg" text="Loading users..." />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-4 hg-text-muted" />
                <Text variant="muted">No users found</Text>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="hg-border border-b">
                      <th className="text-left px-6 py-4"><Text variant="muted" size="sm" weight="semibold">User</Text></th>
                      <th className="text-left px-6 py-4"><Text variant="muted" size="sm" weight="semibold">Roles</Text></th>
                      <th className="text-left px-6 py-4"><Text variant="muted" size="sm" weight="semibold">Status</Text></th>
                      <th className="text-left px-6 py-4"><Text variant="muted" size="sm" weight="semibold">Company</Text></th>
                      <th className="text-left px-6 py-4"><Text variant="muted" size="sm" weight="semibold">Last Login</Text></th>
                      <th className="text-left px-6 py-4"><Text variant="muted" size="sm" weight="semibold">Joined</Text></th>
                      <th className="text-right px-6 py-4"><Text variant="muted" size="sm" weight="semibold">Actions</Text></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.03 }}
                        className="transition-colors hg-border border-b hover:bg-white/5"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                              <span className="text-white font-semibold font-gendy">
                                {(user.full_name || user.email).charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <Text weight="semibold">{user.full_name || 'No name'}</Text>
                              <Text variant="muted" size="sm">{user.email}</Text>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {user.roles?.slice(0, 3).map((role) => (
                              <span
                                key={role.id}
                                className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadge(role.role)}`}
                              >
                                {role.role}
                              </span>
                            ))}
                            {user.roles?.length > 3 && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-300">
                                +{user.roles.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Text variant="muted" size="sm">{user.company_name || '-'}</Text>
                        </td>
                        <td className="px-6 py-4">
                          {user.last_login_at ? (
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3 text-cyan-400" />
                              <Text variant="muted" size="sm">
                                {new Date(user.last_login_at).toLocaleDateString()}
                              </Text>
                            </div>
                          ) : (
                            <Text variant="muted" size="sm" className="italic">Never</Text>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Text variant="muted" size="sm">
                            {new Date(user.created_at).toLocaleDateString()}
                          </Text>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2 relative">
                            <Link href={`/admin/users/${user.id}`}>
                              <IconButton
                                icon={Edit}
                                variant="cyan"
                                size="sm"
                                label="Edit user"
                              />
                            </Link>
                            <IconButton
                              icon={Mail}
                              variant="cyan"
                              size="sm"
                              label="Email user"
                              onClick={() => window.open(`mailto:${user.email}`)}
                            />
                            <div className="relative">
                              <IconButton
                                icon={MoreVertical}
                                variant="ghost"
                                size="sm"
                                label="More options"
                                onClick={() => setActionMenuOpen(actionMenuOpen === user.id ? null : user.id)}
                              />
                              {actionMenuOpen === user.id && (
                                <div
                                  className="absolute right-0 top-full mt-1 w-48 hg-bg-card hg-border border rounded-xl shadow-xl z-50 py-2"
                                  onMouseLeave={() => setActionMenuOpen(null)}
                                >
                                  <button
                                    onClick={() => handleResetPassword(user.id, user.email)}
                                    className="w-full px-4 py-2 text-left text-sm hg-text-primary hover:bg-white/10 flex items-center gap-2"
                                  >
                                    <Key className="w-4 h-4" />
                                    Reset Password
                                  </button>
                                  <button
                                    onClick={() => handleDisableUser(user.id)}
                                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Disable User
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t hg-border">
                <Text variant="muted" size="sm">
                  Page {page} of {totalPages}
                </Text>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
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
            <span className="font-semibold font-diatype">{successText}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
