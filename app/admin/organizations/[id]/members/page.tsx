'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Users,
  UserPlus,
  Search,
  MoreVertical,
  Shield,
  ShieldCheck,
  Crown,
  Mail,
  Calendar,
  Briefcase,
  Loader2,
  AlertCircle,
  Check,
  X,
  ArrowLeft,
  Send,
  Clock,
  UserMinus,
  Settings,
} from 'lucide-react'

interface Member {
  id: string
  user_id: string
  role: string
  status: string
  title?: string
  department?: string
  joined_at: string
  user: {
    id: string
    email: string
    full_name: string
    avatar_url?: string
  }
}

interface Invitation {
  id: string
  email: string
  role: string
  status: string
  expires_at: string
  created_at: string
  invited_by_user?: {
    full_name: string
  }
}

interface Organization {
  id: string
  name: string
  slug: string
  max_users: number
}

export default function OrganizationMembersPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params?.id as string

  const [loading, setLoading] = useState(true)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'member' | 'team_lead' | 'org_admin'>('member')
  const [inviteMessage, setInviteMessage] = useState('')
  const [inviteSending, setInviteSending] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState(false)

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch organization
        const orgRes = await fetch(`/api/organizations/${orgId}`)
        const orgData = await orgRes.json()
        if (orgData.success) {
          setOrganization(orgData.data)
        }

        // Fetch members
        const membersRes = await fetch(`/api/organizations/${orgId}/members`)
        const membersData = await membersRes.json()
        if (membersData.success) {
          setMembers(membersData.data)
        }

        // Fetch invitations
        const invitesRes = await fetch(`/api/organizations/${orgId}/invitations`)
        const invitesData = await invitesRes.json()
        if (invitesData.success) {
          setInvitations(invitesData.data)
        }
      } catch {
        setError('Failed to load organization data')
      } finally {
        setLoading(false)
      }
    }

    if (orgId) {
      fetchData()
    }
  }, [orgId])

  const handleSendInvite = async () => {
    try {
      setInviteSending(true)
      setError(null)

      const res = await fetch(`/api/organizations/${orgId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          personalMessage: inviteMessage || undefined,
        }),
      })

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to send invitation')
      }

      // Add to invitations list
      setInvitations((prev) => [data.data.invitation, ...prev])
      setInviteSuccess(true)

      // Reset form after 2 seconds
      setTimeout(() => {
        setShowInviteModal(false)
        setInviteEmail('')
        setInviteRole('member')
        setInviteMessage('')
        setInviteSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation')
    } finally {
      setInviteSending(false)
    }
  }

  const handleRevokeInvite = async (inviteId: string) => {
    try {
      // TODO: Implement revoke API
      setInvitations((prev) =>
        prev.map((inv) => (inv.id === inviteId ? { ...inv, status: 'revoked' } : inv))
      )
    } catch (err) {
      console.error('Failed to revoke invite:', err)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      // TODO: Implement remove member API
      setMembers((prev) => prev.filter((m) => m.id !== memberId))
    } catch (err) {
      console.error('Failed to remove member:', err)
    }
  }

  const handleChangeRole = async (memberId: string, newRole: string) => {
    try {
      // TODO: Implement change role API
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      )
    } catch (err) {
      console.error('Failed to change role:', err)
    }
  }

  const filteredMembers = members.filter(
    (m) =>
      m.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pendingInvitations = invitations.filter((i) => i.status === 'pending')

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-400" />
      case 'org_admin':
        return <ShieldCheck className="w-4 h-4 text-cyan-400" />
      case 'team_lead':
        return <Shield className="w-4 h-4 text-[var(--hg-cyan-text)]" />
      default:
        return <Users className="w-4 h-4 text-gray-400" />
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Owner'
      case 'org_admin':
        return 'Admin'
      case 'team_lead':
        return 'Team Lead'
      default:
        return 'Member'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg font-diatype">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href={`/admin/organizations/${orgId}`}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white font-gendy">
                Team Members
              </h1>
              <p className="text-gray-400 font-diatype">
                {organization?.name} • {members.length} members
                {organization?.max_users !== -1 && ` / ${organization?.max_users} max`}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {/* Search */}
            <div className="relative w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search members..."
                className="w-full pl-12 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-diatype"
              />
            </div>

            {/* Invite Button */}
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-cyan-500/25 transition-all font-diatype"
            >
              <UserPlus className="w-5 h-5" />
              Invite Member
            </button>
          </div>
        </div>
      </header>

      <main className="p-8">
        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-diatype">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-5 h-5 text-red-400" />
            </button>
          </div>
        )}

        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4 font-gendy flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              Pending Invitations ({pendingInvitations.length})
            </h2>
            <div className="bg-white/5 rounded-xl border border-white/10 divide-y divide-white/10">
              {pendingInvitations.map((invite) => (
                <div
                  key={invite.id}
                  className="p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium font-diatype">
                        {invite.email}
                      </p>
                      <p className="text-sm text-gray-500 font-diatype">
                        {getRoleLabel(invite.role)} • Expires{' '}
                        {new Date(invite.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevokeInvite(invite.id)}
                    className="px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors font-diatype"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Members List */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 font-gendy flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Active Members ({filteredMembers.length})
          </h2>
          <div className="bg-white/5 rounded-xl border border-white/10">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 font-diatype">
                    Member
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 font-diatype">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 font-diatype">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 font-diatype">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-400 font-diatype">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--hg-cyan-text)] rounded-full flex items-center justify-center text-white font-semibold">
                          {member.user?.full_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-white font-medium font-diatype">
                            {member.user?.full_name || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-500 font-diatype">
                            {member.user?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(member.role)}
                        <span className="text-white font-diatype">
                          {getRoleLabel(member.role)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400 font-diatype">
                        {member.title || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400 font-diatype">
                        {new Date(member.joined_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {member.role !== 'owner' && (
                          <>
                            <select
                              value={member.role}
                              onChange={(e) =>
                                handleChangeRole(member.id, e.target.value)
                              }
                              className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-sm text-white font-diatype focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                            >
                              <option value="member">Member</option>
                              <option value="team_lead">Team Lead</option>
                              <option value="org_admin">Admin</option>
                            </select>
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Remove member"
                            >
                              <UserMinus className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredMembers.length === 0 && (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 font-diatype">No members found</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => !inviteSending && setShowInviteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-gray-900 rounded-2xl border border-white/10 p-6"
            >
              {inviteSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-[var(--hg-cyan-text)]" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 font-gendy">
                    Invitation Sent!
                  </h3>
                  <p className="text-gray-400 font-diatype">
                    An email has been sent to {inviteEmail}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white font-gendy">
                      Invite Team Member
                    </h3>
                    <button
                      onClick={() => setShowInviteModal(false)}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="colleague@company.com"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-diatype"
                      />
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                        Role
                      </label>
                      <select
                        value={inviteRole}
                        onChange={(e) =>
                          setInviteRole(e.target.value as 'member' | 'team_lead' | 'org_admin')
                        }
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-diatype"
                      >
                        <option value="member">Member</option>
                        <option value="team_lead">Team Lead</option>
                        <option value="org_admin">Organization Admin</option>
                      </select>
                    </div>

                    {/* Personal Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                        Personal Message (optional)
                      </label>
                      <textarea
                        value={inviteMessage}
                        onChange={(e) => setInviteMessage(e.target.value)}
                        placeholder="Add a personal note to the invitation..."
                        rows={3}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-diatype resize-none"
                      />
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-diatype">
                        {error}
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      onClick={handleSendInvite}
                      disabled={!inviteEmail || inviteSending}
                      className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-diatype"
                    >
                      {inviteSending ? (
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
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
