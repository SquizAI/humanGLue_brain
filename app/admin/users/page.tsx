'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Users,
  Plus,
  Search,
  Filter,
  Mail,
  Shield,
  Ban,
  Eye,
  MoreVertical,
  Download,
  CheckCircle,
  X,
  UserPlus,
  Key,
  Activity,
  AlertCircle,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'

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
  const router = useRouter()
  const { userData, authLoading } = useChat()
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
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

  if (!showContent) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
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
        headers: {
          'Content-Type': 'application/json',
        },
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

      // Success!
      setShowInviteModal(false)
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)

      // Reset form
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
      instructor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      user: 'bg-green-500/20 text-green-300 border-green-500/30',
    }
    return badges[role as keyof typeof badges] || 'bg-gray-500/20 text-gray-300'
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-500/20 text-green-300 border-green-500/30',
      inactive: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      disabled: 'bg-red-500/20 text-red-300 border-red-500/30',
    }
    return badges[status as keyof typeof badges] || 'bg-gray-500/20 text-gray-300'
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">
                    <span className="font-diatype">← Back to Dashboard</span>
                  </Link>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2 font-gendy">User Management</h1>
                <p className="text-gray-400 font-diatype">
                  Manage platform users and permissions ({filteredUsers.length} users)
                </p>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all flex items-center gap-2 font-diatype"
                >
                  <Download className="w-5 h-5" />
                  Export
                </motion.button>
                <motion.button
                  onClick={() => setShowInviteModal(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-diatype"
                >
                  <UserPlus className="w-5 h-5" />
                  Invite User
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-green-900/30 to-green-900/10 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6"
            >
              <Users className="w-6 h-6 text-green-400 mb-2" />
              <h3 className="text-2xl font-bold text-white mb-1 font-gendy">{users.length}</h3>
              <p className="text-sm text-gray-400 font-diatype">Total Users</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6"
            >
              <Activity className="w-6 h-6 text-blue-400 mb-2" />
              <h3 className="text-2xl font-bold text-white mb-1 font-gendy">
                {users.filter((u) => u.status === 'active').length}
              </h3>
              <p className="text-sm text-gray-400 font-diatype">Active Users</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-cyan-900/30 to-cyan-900/10 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6"
            >
              <Shield className="w-6 h-6 text-cyan-400 mb-2" />
              <h3 className="text-2xl font-bold text-white mb-1 font-gendy">
                {users.filter((u) => u.role === 'instructor').length}
              </h3>
              <p className="text-sm text-gray-400 font-diatype">Instructors</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-amber-900/30 to-amber-900/10 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6"
            >
              <UserPlus className="w-6 h-6 text-amber-400 mb-2" />
              <h3 className="text-2xl font-bold text-white mb-1 font-gendy">
                {users.filter((u) => new Date(u.joined) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
              </h3>
              <p className="text-sm text-gray-400 font-diatype">New (30 days)</p>
            </motion.div>
          </div>

          {/* Filters */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users by name or email..."
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-diatype"
                  />
                </div>
              </div>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-diatype"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="instructor">Instructor</option>
                <option value="user">User</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-diatype"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400 font-diatype">
                      User
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400 font-diatype">
                      Role
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400 font-diatype">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400 font-diatype">
                      Enrollments
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400 font-diatype">
                      Last Active
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-gray-400 font-diatype">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center">
                            <span className="text-white font-semibold font-gendy">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-semibold font-diatype">{user.name}</p>
                            <p className="text-sm text-gray-400 font-diatype">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                            user.status
                          )}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-diatype">{user.enrollments}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-400 text-sm font-diatype">
                          {new Date(user.lastActive).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-lg transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 rounded-lg transition-all"
                          >
                            <Mail className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 rounded-lg transition-all"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white font-gendy">Invite User</h2>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {inviteError && (
                  <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-300 font-diatype">{inviteError}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    disabled={inviting}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-diatype disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={inviteFullName}
                    onChange={(e) => setInviteFullName(e.target.value)}
                    disabled={inviting}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-diatype disabled:opacity-50"
                  />
                  <p className="text-xs text-gray-400 mt-1 font-diatype">
                    Optional - will default to email username
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                    Role *
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    disabled={inviting}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-diatype disabled:opacity-50"
                  >
                    <option value="client">Client - Access courses and track learning</option>
                    <option value="instructor">Instructor - Create and manage courses</option>
                    <option value="expert">Expert - Provide expert insights</option>
                    <option value="admin">Admin - Full platform administration</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t border-white/10">
                <button
                  onClick={() => {
                    setShowInviteModal(false)
                    setInviteEmail('')
                    setInviteFullName('')
                    setInviteRole('client')
                    setInviteError(null)
                  }}
                  disabled={inviting}
                  className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all font-semibold font-diatype disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendInvite}
                  disabled={inviting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-cyan-500 text-white rounded-xl transition-all font-semibold font-diatype disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {inviting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Send Invite
                    </>
                  )}
                </button>
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
            className="fixed top-8 right-8 z-[60] bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3"
          >
            <CheckCircle className="w-6 h-6" />
            <span className="font-semibold font-diatype">Invitation sent successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
