'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Users,
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderTree,
  Loader2,
  AlertCircle,
  X,
  ArrowLeft,
  Edit,
  Trash2,
  UserPlus,
  Crown,
  User,
} from 'lucide-react'

interface TeamMember {
  id: string
  full_name: string
  email: string
  avatar_url?: string
  job_title?: string
}

interface Team {
  id: string
  name: string
  description?: string | null
  parent_team_id?: string | null
  memberCount: number
  teamLead?: TeamMember | null
  is_active: boolean
  created_at: string
  children?: Team[]
}

interface Organization {
  id: string
  name: string
  slug: string
  max_teams: number
}

interface OrgMember {
  user_id: string
  role: string
  user: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }
}

export default function OrganizationTeamsPage() {
  const params = useParams()
  const orgId = params?.id as string

  const [loading, setLoading] = useState(true)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [orgMembers, setOrgMembers] = useState<OrgMember[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)

  // Form states
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formParentId, setFormParentId] = useState<string | null>(null)
  const [formSaving, setFormSaving] = useState(false)

  // Team members modal state
  const [teamMembers, setTeamMembers] = useState<{ user_id: string; role: string; user: TeamMember }[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [selectedMemberToAdd, setSelectedMemberToAdd] = useState('')
  const [memberRole, setMemberRole] = useState<'member' | 'team_lead'>('member')

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

        // Fetch teams
        const teamsRes = await fetch(`/api/organizations/${orgId}/teams/crud`)
        const teamsData = await teamsRes.json()
        if (teamsData.success) {
          setTeams(teamsData.data)
        }

        // Fetch org members for adding to teams
        const membersRes = await fetch(`/api/organizations/${orgId}/members`)
        const membersData = await membersRes.json()
        if (membersData.success) {
          setOrgMembers(membersData.data)
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

  // Build team hierarchy
  const buildHierarchy = (flatTeams: Team[]): Team[] => {
    const teamMap = new Map<string, Team>()
    const rootTeams: Team[] = []

    flatTeams.forEach((team) => {
      teamMap.set(team.id, { ...team, children: [] })
    })

    teamMap.forEach((team) => {
      if (team.parent_team_id && teamMap.has(team.parent_team_id)) {
        const parent = teamMap.get(team.parent_team_id)!
        if (!parent.children) parent.children = []
        parent.children.push(team)
      } else {
        rootTeams.push(team)
      }
    })

    return rootTeams
  }

  const hierarchicalTeams = buildHierarchy(teams)

  // Filter teams by search
  const filterTeams = (teamList: Team[], query: string): Team[] => {
    if (!query) return teamList

    return teamList
      .map((team) => ({
        ...team,
        children: team.children ? filterTeams(team.children, query) : [],
      }))
      .filter(
        (team) =>
          team.name.toLowerCase().includes(query.toLowerCase()) ||
          team.description?.toLowerCase().includes(query.toLowerCase()) ||
          (team.children && team.children.length > 0)
      )
  }

  const filteredTeams = filterTeams(hierarchicalTeams, searchQuery)

  const toggleExpand = (teamId: string) => {
    setExpandedTeams((prev) => {
      const next = new Set(prev)
      if (next.has(teamId)) {
        next.delete(teamId)
      } else {
        next.add(teamId)
      }
      return next
    })
  }

  const handleCreateTeam = async () => {
    try {
      setFormSaving(true)
      setError(null)

      const res = await fetch(`/api/organizations/${orgId}/teams/crud`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          description: formDescription || null,
          parentTeamId: formParentId,
        }),
      })

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to create team')
      }

      // Add to teams list
      setTeams((prev) => [...prev, { ...data.data, memberCount: 0, teamLead: null }])
      resetForm()
      setShowCreateModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team')
    } finally {
      setFormSaving(false)
    }
  }

  const handleEditTeam = async () => {
    if (!selectedTeam) return

    try {
      setFormSaving(true)
      setError(null)

      const res = await fetch(`/api/organizations/${orgId}/teams/${selectedTeam.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          description: formDescription || null,
          parentTeamId: formParentId,
        }),
      })

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to update team')
      }

      // Update in teams list
      setTeams((prev) =>
        prev.map((t) =>
          t.id === selectedTeam.id
            ? { ...t, ...data.data }
            : t
        )
      )
      resetForm()
      setShowEditModal(false)
      setSelectedTeam(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update team')
    } finally {
      setFormSaving(false)
    }
  }

  const handleDeleteTeam = async () => {
    if (!selectedTeam) return

    try {
      setFormSaving(true)
      setError(null)

      const res = await fetch(`/api/organizations/${orgId}/teams/${selectedTeam.id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to delete team')
      }

      // Remove from teams list
      setTeams((prev) => prev.filter((t) => t.id !== selectedTeam.id))
      setShowDeleteModal(false)
      setSelectedTeam(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete team')
    } finally {
      setFormSaving(false)
    }
  }

  const openEditModal = (team: Team) => {
    setSelectedTeam(team)
    setFormName(team.name)
    setFormDescription(team.description || '')
    setFormParentId(team.parent_team_id || null)
    setShowEditModal(true)
  }

  const openDeleteModal = (team: Team) => {
    setSelectedTeam(team)
    setShowDeleteModal(true)
  }

  const openMembersModal = async (team: Team) => {
    setSelectedTeam(team)
    setShowMembersModal(true)
    setLoadingMembers(true)

    try {
      const res = await fetch(`/api/organizations/${orgId}/teams/${team.id}/members`)
      const data = await res.json()
      if (data.success) {
        setTeamMembers(data.data)
      }
    } catch {
      setError('Failed to load team members')
    } finally {
      setLoadingMembers(false)
    }
  }

  const handleAddMember = async () => {
    if (!selectedTeam || !selectedMemberToAdd) return

    try {
      const res = await fetch(`/api/organizations/${orgId}/teams/${selectedTeam.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedMemberToAdd,
          role: memberRole,
        }),
      })

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to add member')
      }

      setTeamMembers((prev) => [...prev, data.data])
      setSelectedMemberToAdd('')
      setMemberRole('member')

      // Update member count
      setTeams((prev) =>
        prev.map((t) =>
          t.id === selectedTeam.id
            ? { ...t, memberCount: t.memberCount + 1 }
            : t
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member')
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!selectedTeam) return

    try {
      const res = await fetch(`/api/organizations/${orgId}/teams/${selectedTeam.id}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to remove member')
      }

      setTeamMembers((prev) => prev.filter((m) => m.user_id !== userId))

      // Update member count
      setTeams((prev) =>
        prev.map((t) =>
          t.id === selectedTeam.id
            ? { ...t, memberCount: Math.max(0, t.memberCount - 1) }
            : t
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member')
    }
  }

  const resetForm = () => {
    setFormName('')
    setFormDescription('')
    setFormParentId(null)
  }

  const countAllTeams = (teamList: Team[]): number => {
    return teamList.reduce((count, team) => {
      return count + 1 + (team.children ? countAllTeams(team.children) : 0)
    }, 0)
  }

  // Recursive team renderer
  const renderTeam = (team: Team, depth: number = 0) => {
    const hasChildren = team.children && team.children.length > 0
    const isExpanded = expandedTeams.has(team.id)

    return (
      <div key={team.id}>
        <div
          className={`flex items-center justify-between p-4 hover:bg-white/5 transition-colors ${
            depth > 0 ? 'border-l-2 border-cyan-500/30 ml-6' : ''
          }`}
          style={{ paddingLeft: `${depth * 24 + 16}px` }}
        >
          <div className="flex items-center gap-3 flex-1">
            {/* Expand/collapse button */}
            <button
              onClick={() => hasChildren && toggleExpand(team.id)}
              className={`p-1 rounded transition-colors ${
                hasChildren ? 'hover:bg-white/10 cursor-pointer' : 'cursor-default'
              }`}
            >
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )
              ) : (
                <div className="w-4 h-4" />
              )}
            </button>

            {/* Team icon */}
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
              {hasChildren ? (
                <FolderTree className="w-5 h-5 text-cyan-400" />
              ) : (
                <Folder className="w-5 h-5 text-cyan-400" />
              )}
            </div>

            {/* Team info */}
            <div className="flex-1">
              <h3 className="text-white font-medium font-diatype flex items-center gap-2">
                {team.name}
                {team.teamLead && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-yellow-400" />
                    {team.teamLead.full_name}
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-500 font-diatype">
                {team.memberCount} member{team.memberCount !== 1 ? 's' : ''}
                {team.description && ` • ${team.description}`}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => openMembersModal(team)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-cyan-400"
              title="Manage members"
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              onClick={() => openEditModal(team)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
              title="Edit team"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => openDeleteModal(team)}
              className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-gray-400 hover:text-red-400"
              title="Delete team"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>{team.children!.map((child) => renderTeam(child, depth + 1))}</div>
        )}
      </div>
    )
  }

  // Get members not in the selected team
  const availableMembers = orgMembers.filter(
    (m) => !teamMembers.some((tm) => tm.user_id === m.user_id)
  )

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
              <h1 className="text-2xl font-bold text-white font-gendy">Teams</h1>
              <p className="text-gray-400 font-diatype">
                {organization?.name} • {teams.length} team{teams.length !== 1 ? 's' : ''}
                {organization?.max_teams !== -1 && ` / ${organization?.max_teams} max`}
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
                placeholder="Search teams..."
                className="w-full pl-12 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-diatype"
              />
            </div>

            {/* Create Team Button */}
            <button
              onClick={() => {
                resetForm()
                setShowCreateModal(true)
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-cyan-500/25 transition-all font-diatype"
            >
              <Plus className="w-5 h-5" />
              Create Team
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

        {/* Teams List */}
        <div className="bg-white/5 rounded-xl border border-white/10">
          {filteredTeams.length > 0 ? (
            <div className="divide-y divide-white/10">
              {filteredTeams.map((team) => renderTeam(team))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <FolderTree className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2 font-gendy">
                {searchQuery ? 'No teams found' : 'No teams yet'}
              </h3>
              <p className="text-gray-400 font-diatype mb-6">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Create your first team to organize your members'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold inline-flex items-center gap-2 hover:shadow-lg hover:shadow-cyan-500/25 transition-all font-diatype"
                >
                  <Plus className="w-5 h-5" />
                  Create First Team
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Create Team Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => !formSaving && setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-gray-900 rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white font-gendy">Create Team</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., Engineering, Marketing"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-diatype"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                    Description
                  </label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="What does this team do?"
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-diatype resize-none"
                  />
                </div>

                {/* Parent Team */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                    Parent Team (optional)
                  </label>
                  <select
                    value={formParentId || ''}
                    onChange={(e) => setFormParentId(e.target.value || null)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-diatype"
                  >
                    <option value="">No parent (root level)</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit */}
                <button
                  onClick={handleCreateTeam}
                  disabled={!formName || formSaving}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-diatype"
                >
                  {formSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Create Team
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Team Modal */}
      <AnimatePresence>
        {showEditModal && selectedTeam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => !formSaving && setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-gray-900 rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white font-gendy">Edit Team</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-diatype"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                    Description
                  </label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-diatype resize-none"
                  />
                </div>

                {/* Parent Team */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                    Parent Team
                  </label>
                  <select
                    value={formParentId || ''}
                    onChange={(e) => setFormParentId(e.target.value || null)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-diatype"
                  >
                    <option value="">No parent (root level)</option>
                    {teams
                      .filter((t) => t.id !== selectedTeam.id)
                      .map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Submit */}
                <button
                  onClick={handleEditTeam}
                  disabled={!formName || formSaving}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-diatype"
                >
                  {formSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Edit className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedTeam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => !formSaving && setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-gray-900 rounded-2xl border border-white/10 p-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-white font-gendy mb-2">
                  Delete Team?
                </h3>
                <p className="text-gray-400 font-diatype">
                  Are you sure you want to delete <strong>{selectedTeam.name}</strong>? This will
                  remove all team members from this team.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold transition-colors font-diatype"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTeam}
                  disabled={formSaving}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors font-diatype"
                >
                  {formSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Team'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Team Members Modal */}
      <AnimatePresence>
        {showMembersModal && selectedTeam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMembersModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-gray-900 rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white font-gendy">
                  {selectedTeam.name} Members
                </h3>
                <button
                  onClick={() => setShowMembersModal(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Add Member */}
              {availableMembers.length > 0 && (
                <div className="mb-6 p-4 bg-white/5 rounded-xl">
                  <h4 className="text-sm font-medium text-gray-300 mb-3 font-diatype flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Add Member
                  </h4>
                  <div className="flex gap-2">
                    <select
                      value={selectedMemberToAdd}
                      onChange={(e) => setSelectedMemberToAdd(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-diatype"
                    >
                      <option value="">Select member...</option>
                      {availableMembers.map((m) => (
                        <option key={m.user_id} value={m.user_id}>
                          {m.user.full_name} ({m.user.email})
                        </option>
                      ))}
                    </select>
                    <select
                      value={memberRole}
                      onChange={(e) => setMemberRole(e.target.value as 'member' | 'team_lead')}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-diatype"
                    >
                      <option value="member">Member</option>
                      <option value="team_lead">Team Lead</option>
                    </select>
                    <button
                      onClick={handleAddMember}
                      disabled={!selectedMemberToAdd}
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-diatype"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {/* Members List */}
              <div>
                {loadingMembers ? (
                  <div className="py-8 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : teamMembers.length > 0 ? (
                  <div className="space-y-2">
                    {teamMembers.map((member) => (
                      <div
                        key={member.user_id}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[var(--hg-cyan-text)] rounded-full flex items-center justify-center text-white font-semibold">
                            {member.user?.full_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="text-white font-medium font-diatype flex items-center gap-2">
                              {member.user?.full_name || 'Unknown'}
                              {member.role === 'team_lead' && (
                                <Crown className="w-4 h-4 text-yellow-400" />
                              )}
                            </p>
                            <p className="text-sm text-gray-500 font-diatype">
                              {member.user?.email}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveMember(member.user_id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                          title="Remove from team"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <User className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 font-diatype">No members in this team yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
