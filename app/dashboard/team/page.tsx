'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  UserPlus,
  Mail,
  MoreVertical,
  Crown,
  Shield,
  Eye,
  Trash2,
  Edit,
  Send,
  X,
  Check,
  Search,
  Filter,
  Download,
  Upload,
  LogOut,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'
import { useBilling } from '@/lib/contexts/BillingContext'

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'member' | 'viewer'
  status: 'active' | 'pending' | 'inactive'
  avatar?: string
  joinedDate: string
  lastActive?: string
  assessmentsCompleted?: number
}

interface PendingInvite {
  id: string
  email: string
  role: 'admin' | 'member' | 'viewer'
  sentDate: string
  expiresDate: string
}

export default function TeamPage() {
  const router = useRouter()
  const { userData } = useChat()
  const { usage, currentTier } = useBilling()

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@acme.com',
      role: 'admin',
      status: 'active',
      joinedDate: '2025-01-15',
      lastActive: '2 hours ago',
      assessmentsCompleted: 12
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael@acme.com',
      role: 'member',
      status: 'active',
      joinedDate: '2025-02-20',
      lastActive: '1 day ago',
      assessmentsCompleted: 8
    },
    {
      id: '3',
      name: 'Emily Davis',
      email: 'emily@acme.com',
      role: 'member',
      status: 'active',
      joinedDate: '2025-03-10',
      lastActive: '3 hours ago',
      assessmentsCompleted: 15
    },
    {
      id: '4',
      name: 'James Wilson',
      email: 'james@acme.com',
      role: 'viewer',
      status: 'active',
      joinedDate: '2025-04-05',
      lastActive: '5 days ago',
      assessmentsCompleted: 3
    }
  ])

  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([
    {
      id: 'inv_1',
      email: 'alex@acme.com',
      role: 'member',
      sentDate: '2025-10-01',
      expiresDate: '2025-10-08'
    }
  ])

  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState<TeamMember | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<TeamMember | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])

  // Authentication check
  useEffect(() => {
    if (!userData || !userData.authenticated) {
      router.push('/login')
    }
  }, [userData, router])

  if (!userData || !userData.authenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  const handleRemoveMember = (member: TeamMember) => {
    setTeamMembers(teamMembers.filter(m => m.id !== member.id))
    setShowDeleteConfirm(null)
  }

  const handleUpdateRole = (memberId: string, newRole: 'admin' | 'member' | 'viewer') => {
    setTeamMembers(teamMembers.map(m =>
      m.id === memberId ? { ...m, role: newRole } : m
    ))
    setShowEditModal(null)
  }

  const handleResendInvite = (inviteId: string) => {
    // Simulate resending invite
    console.log('Resending invite:', inviteId)
  }

  const handleCancelInvite = (inviteId: string) => {
    setPendingInvites(pendingInvites.filter(inv => inv.id !== inviteId))
  }

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || member.role === roleFilter
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4" />
      case 'member':
        return <Shield className="w-4 h-4" />
      case 'viewer':
        return <Eye className="w-4 h-4" />
      default:
        return null
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/10 border-purple-500/20 text-purple-400'
      case 'member':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400'
      case 'viewer':
        return 'bg-gray-500/10 border-gray-500/20 text-gray-400'
      default:
        return 'bg-white/10 border-white/20 text-white'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 border-green-500/20 text-green-400'
      case 'pending':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-400'
      case 'inactive':
        return 'bg-red-500/10 border-red-500/20 text-red-400'
      default:
        return 'bg-gray-500/10 border-gray-500/20 text-gray-400'
    }
  }

  const canAddMoreMembers = usage.users.limit === -1 || usage.users.used < usage.users.limit

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      {/* Main Content - offset by sidebar */}
      <div className="lg:ml-[var(--sidebar-width,280px)] pb-20 lg:pb-0 transition-all">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1 font-gendy">Team</h1>
                <p className="text-gray-400 font-diatype">
                  Manage your team members and invitations
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowInviteModal(true)}
                disabled={!canAddMoreMembers}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/50 font-diatype flex items-center gap-2 disabled:opacity-50"
              >
                <UserPlus className="w-5 h-5" />
                Invite Team Member
              </motion.button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {/* Team Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-purple-400" />
                <div className="text-sm text-gray-400 font-diatype">Total Members</div>
              </div>
              <div className="text-3xl font-bold text-white font-gendy">
                {teamMembers.length}
              </div>
              <div className="text-xs text-gray-500 font-diatype mt-1">
                {usage.users.limit === -1 ? 'Unlimited' : `${usage.users.used}/${usage.users.limit} used`}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <div className="text-sm text-gray-400 font-diatype">Active</div>
              </div>
              <div className="text-3xl font-bold text-white font-gendy">
                {teamMembers.filter(m => m.status === 'active').length}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <div className="text-sm text-gray-400 font-diatype">Pending Invites</div>
              </div>
              <div className="text-3xl font-bold text-white font-gendy">
                {pendingInvites.length}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <div className="text-sm text-gray-400 font-diatype">Total Assessments</div>
              </div>
              <div className="text-3xl font-bold text-white font-gendy">
                {teamMembers.reduce((sum, m) => sum + (m.assessmentsCompleted || 0), 0)}
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search members..."
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/30 transition-all font-diatype"
                  />
                </div>
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/30 transition-all font-diatype"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/30 transition-all font-diatype"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Team Members List */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-6">
            <h2 className="text-xl font-semibold text-white mb-6 font-gendy">
              Team Members ({filteredMembers.length})
            </h2>
            <div className="space-y-4">
              {filteredMembers.map((member) => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  onEdit={() => setShowEditModal(member)}
                  onDelete={() => setShowDeleteConfirm(member)}
                  getRoleIcon={getRoleIcon}
                  getRoleColor={getRoleColor}
                  getStatusColor={getStatusColor}
                />
              ))}

              {filteredMembers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 font-diatype">No team members found</p>
                </div>
              )}
            </div>
          </div>

          {/* Pending Invitations */}
          {pendingInvites.length > 0 && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <h2 className="text-xl font-semibold text-white mb-6 font-gendy">
                Pending Invitations ({pendingInvites.length})
              </h2>
              <div className="space-y-4">
                {pendingInvites.map((invite) => (
                  <PendingInviteCard
                    key={invite.id}
                    invite={invite}
                    onResend={() => handleResendInvite(invite.id)}
                    onCancel={() => handleCancelInvite(invite.id)}
                    getRoleIcon={getRoleIcon}
                    getRoleColor={getRoleColor}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      <InviteTeamMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={(email, role) => {
          setPendingInvites([
            ...pendingInvites,
            {
              id: `inv_${Date.now()}`,
              email,
              role,
              sentDate: new Date().toISOString().split('T')[0],
              expiresDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }
          ])
          setShowInviteModal(false)
        }}
      />

      {/* Edit Role Modal */}
      <AnimatePresence>
        {showEditModal && (
          <EditRoleModal
            member={showEditModal}
            onClose={() => setShowEditModal(null)}
            onSave={(role) => handleUpdateRole(showEditModal.id, role)}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <DeleteConfirmModal
            member={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(null)}
            onConfirm={() => handleRemoveMember(showDeleteConfirm)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Team Member Card Component
interface TeamMemberCardProps {
  member: TeamMember
  onEdit: () => void
  onDelete: () => void
  getRoleIcon: (role: string) => React.ReactNode
  getRoleColor: (role: string) => string
  getStatusColor: (status: string) => string
}

function TeamMemberCard({ member, onEdit, onDelete, getRoleIcon, getRoleColor, getStatusColor }: TeamMemberCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <motion.div
      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
      className="flex items-center justify-between p-4 bg-white/5 rounded-xl transition-all"
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold font-gendy text-lg">
          {member.name.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="text-white font-medium font-diatype">{member.name}</div>
          <div className="text-sm text-gray-400 font-diatype">{member.email}</div>
        </div>
        <div className="hidden md:block">
          <div className="text-sm text-gray-400 font-diatype">Joined</div>
          <div className="text-white font-medium font-diatype">
            {new Date(member.joinedDate).toLocaleDateString()}
          </div>
        </div>
        <div className="hidden lg:block">
          <div className="text-sm text-gray-400 font-diatype">Last Active</div>
          <div className="text-white font-medium font-diatype">{member.lastActive || 'Never'}</div>
        </div>
        <div className="hidden xl:block">
          <div className="text-sm text-gray-400 font-diatype">Assessments</div>
          <div className="text-white font-medium font-diatype">{member.assessmentsCompleted || 0}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border font-diatype flex items-center gap-1 ${getRoleColor(member.role)}`}>
          {getRoleIcon(member.role)}
          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border font-diatype ${getStatusColor(member.status)}`}>
          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
        </span>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-white/10 rounded-xl shadow-xl z-10">
              <button
                onClick={() => {
                  onEdit()
                  setShowMenu(false)
                }}
                className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-all font-diatype flex items-center gap-2 rounded-t-xl"
              >
                <Edit className="w-4 h-4" />
                Edit Role
              </button>
              <button
                onClick={() => {
                  onDelete()
                  setShowMenu(false)
                }}
                className="w-full px-4 py-3 text-left text-red-400 hover:bg-white/10 transition-all font-diatype flex items-center gap-2 rounded-b-xl"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Pending Invite Card
interface PendingInviteCardProps {
  invite: PendingInvite
  onResend: () => void
  onCancel: () => void
  getRoleIcon: (role: string) => React.ReactNode
  getRoleColor: (role: string) => string
}

function PendingInviteCard({ invite, onResend, onCancel, getRoleIcon, getRoleColor }: PendingInviteCardProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
      <div className="flex items-center gap-4 flex-1">
        <div className="p-3 bg-amber-500/20 rounded-lg">
          <Mail className="w-6 h-6 text-amber-400" />
        </div>
        <div className="flex-1">
          <div className="text-white font-medium font-diatype">{invite.email}</div>
          <div className="text-sm text-amber-300/80 font-diatype">
            Sent {new Date(invite.sentDate).toLocaleDateString()} • Expires {new Date(invite.expiresDate).toLocaleDateString()}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border font-diatype flex items-center gap-1 ${getRoleColor(invite.role)}`}>
          {getRoleIcon(invite.role)}
          {invite.role.charAt(0).toUpperCase() + invite.role.slice(1)}
        </span>
        <button
          onClick={onResend}
          className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all font-diatype text-sm"
        >
          Resend
        </button>
        <button
          onClick={onCancel}
          className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

// Invite Team Member Modal
interface InviteTeamMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onInvite: (email: string, role: 'admin' | 'member' | 'viewer') => void
}

function InviteTeamMemberModal({ isOpen, onClose, onInvite }: InviteTeamMemberModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'member' | 'viewer'>('member')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!email) {
      setError('Email is required')
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      onInvite(email, role)
      setEmail('')
      setRole('member')
      setError('')
      setIsSubmitting(false)
    }, 1000)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-900 border border-purple-500/30 rounded-2xl p-8 max-w-md w-full"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white font-gendy">Invite Team Member</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-all">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/30 transition-all font-diatype"
              />
              {error && <p className="text-red-400 text-sm mt-1 font-diatype">{error}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'member' | 'viewer')}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/30 transition-all font-diatype"
              >
                <option value="viewer">Viewer - Can view content only</option>
                <option value="member">Member - Can view and create content</option>
                <option value="admin">Admin - Full access and management</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all font-diatype"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all font-diatype disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Invitation
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Edit Role Modal
interface EditRoleModalProps {
  member: TeamMember
  onClose: () => void
  onSave: (role: 'admin' | 'member' | 'viewer') => void
}

function EditRoleModal({ member, onClose, onSave }: EditRoleModalProps) {
  const [role, setRole] = useState<'admin' | 'member' | 'viewer'>(member.role)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 border border-purple-500/30 rounded-2xl p-8 max-w-md w-full"
      >
        <h3 className="text-2xl font-bold text-white mb-4 font-gendy">Edit Role</h3>
        <p className="text-gray-400 mb-6 font-diatype">Change the role for {member.name}</p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'admin' | 'member' | 'viewer')}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/30 transition-all font-diatype"
          >
            <option value="viewer">Viewer</option>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all font-diatype"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(role)}
            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all font-diatype"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Delete Confirm Modal
interface DeleteConfirmModalProps {
  member: TeamMember
  onClose: () => void
  onConfirm: () => void
}

function DeleteConfirmModal({ member, onClose, onConfirm }: DeleteConfirmModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 border border-red-500/30 rounded-2xl p-8 max-w-md w-full"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-red-500/10 rounded-full">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-white font-gendy">Remove Team Member?</h3>
        </div>

        <p className="text-gray-400 mb-6 font-diatype">
          Are you sure you want to remove <strong>{member.name}</strong> from the team? This action cannot be undone.
        </p>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all font-diatype"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all font-diatype"
          >
            Remove Member
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
