'use client'

import { useState, useEffect, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Save,
  Shield,
  Mail,
  Phone,
  Building2,
  Briefcase,
  User,
  Key,
  Trash2,
  AlertTriangle,
  CheckCircle,
  X,
  Plus,
  Minus,
  Clock,
  History,
  ChevronRight,
  Globe,
  Monitor,
  FileText,
  UserPlus,
  UserMinus,
  Lock,
  Edit3,
  RefreshCw,
  Activity,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner'
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import { Text, Heading } from '@/components/atoms/Text'
import { useChat } from '@/lib/contexts/ChatContext'
import { signOut } from '@/lib/auth/hooks'

interface UserRole {
  id: string
  role: string
  organization_id?: string
  granted_at: string
  expires_at?: string
}

interface UserData {
  id: string
  email: string
  full_name: string
  phone?: string
  job_title?: string
  company_name?: string
  organization_id?: string
  status: 'active' | 'inactive' | 'disabled'
  is_active: boolean
  created_at: string
  updated_at: string
  last_login_at?: string
  roles: UserRole[]
}

interface LoginHistoryEntry {
  id: string
  loginAt: string
  ipAddress: string | null
  userAgent: string | null
  deviceType: string | null
  browser: string | null
  os: string | null
  location: string | null
  loginMethod: string | null
}

interface LoginStats {
  totalLogins: number
  firstLogin: string | null
  lastLogin: string | null
  loginsLast30Days: number
  loginsLast7Days: number
}

interface ChangeHistoryEntry {
  id: string
  action: string
  actorId: string | null
  actorName: string | null
  actorEmail: string | null
  details: Record<string, unknown> | null
  ipAddress: string | null
  timestamp: string
}

// Helper function to format relative time
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60)
    return `${mins} minute${mins > 1 ? 's' : ''} ago`
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  }
  if (diffInSeconds < 172800) return 'Yesterday'
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800)
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  }
  return date.toLocaleDateString()
}

// Helper function to get action icon and color
function getActionIcon(action: string): { icon: React.ReactNode; color: string; bgColor: string } {
  const iconProps = { className: 'w-4 h-4' }

  // User creation/deletion
  if (action.includes('create') || action.includes('signup') || action === 'user_created') {
    return { icon: <UserPlus {...iconProps} />, color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' }
  }
  if (action.includes('delete') || action.includes('remove') || action === 'user_deleted') {
    return { icon: <UserMinus {...iconProps} />, color: 'text-red-400', bgColor: 'bg-red-500/20' }
  }

  // Role changes
  if (action.includes('role') || action.includes('assign') || action === 'role_assigned' || action === 'role.change') {
    return { icon: <Shield {...iconProps} />, color: 'text-purple-400', bgColor: 'bg-purple-500/20' }
  }

  // Password/security
  if (action.includes('password') || action.includes('reset') || action === 'password_reset' || action === 'password_changed') {
    return { icon: <Lock {...iconProps} />, color: 'text-amber-400', bgColor: 'bg-amber-500/20' }
  }

  // Profile updates
  if (action.includes('update') || action.includes('edit') || action === 'profile_updated' || action.includes('change')) {
    return { icon: <Edit3 {...iconProps} />, color: 'text-blue-400', bgColor: 'bg-blue-500/20' }
  }

  // Login events
  if (action.includes('login') || action.includes('logout') || action === 'login_success') {
    return { icon: <RefreshCw {...iconProps} />, color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' }
  }

  // Default
  return { icon: <Activity {...iconProps} />, color: 'text-slate-400', bgColor: 'bg-slate-500/20' }
}

// Helper function to format action label
function formatActionLabel(action: string): string {
  const actionLabels: Record<string, string> = {
    'user_created': 'User Created',
    'user_deleted': 'User Deleted',
    'user_updated': 'Profile Updated',
    'profile_updated': 'Profile Updated',
    'role_assigned': 'Role Assigned',
    'role_removed': 'Role Removed',
    'role.change': 'Role Changed',
    'password_reset': 'Password Reset',
    'password_changed': 'Password Changed',
    'password_reset_requested': 'Password Reset Requested',
    'password_reset_success': 'Password Reset Complete',
    'login_success': 'Logged In',
    'login_failed': 'Login Failed',
    'logout': 'Logged Out',
    'signup_success': 'Account Created',
    'email_verified': 'Email Verified',
    'account_locked': 'Account Locked',
    'account_unlocked': 'Account Unlocked',
    'status_changed': 'Status Changed',
    'user.create': 'User Created',
    'user.update': 'User Updated',
    'user.delete': 'User Deleted',
  }

  return actionLabels[action] || action.replace(/_/g, ' ').replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

const ALL_ROLES = ['admin', 'instructor', 'expert', 'client', 'org_admin', 'team_lead', 'member']

export default function UserEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { userData: adminData, authLoading } = useChat()

  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showContent, setShowContent] = useState(false)

  // Form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive' | 'disabled'>('active')
  const [userRoles, setUserRoles] = useState<string[]>([])

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
  const [showLoginHistoryModal, setShowLoginHistoryModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [resettingPassword, setResettingPassword] = useState(false)
  const [tempPassword, setTempPassword] = useState<string | null>(null)

  // Login history state
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([])
  const [loginStats, setLoginStats] = useState<LoginStats | null>(null)
  const [loginHistoryLoading, setLoginHistoryLoading] = useState(false)
  const [allLoginHistory, setAllLoginHistory] = useState<LoginHistoryEntry[]>([])
  const [loginHistoryPagination, setLoginHistoryPagination] = useState({
    total: 0,
    hasMore: false,
  })

  // Change history state
  const [changeHistory, setChangeHistory] = useState<ChangeHistoryEntry[]>([])
  const [allChangeHistory, setAllChangeHistory] = useState<ChangeHistoryEntry[]>([])
  const [changeHistoryLoading, setChangeHistoryLoading] = useState(false)
  const [showChangeHistoryModal, setShowChangeHistoryModal] = useState(false)
  const [changeHistoryPagination, setChangeHistoryPagination] = useState({
    total: 0,
    hasMore: false,
  })

  useEffect(() => {
    if (!authLoading && adminData?.isAdmin) {
      setShowContent(true)
      fetchUser()
      return
    }

    const timeout = setTimeout(() => {
      setShowContent(true)
      fetchUser()
    }, 3000)

    return () => clearTimeout(timeout)
  }, [authLoading, adminData, id])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/users/${id}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to fetch user')
      }

      const userData = result.data
      setUser(userData)
      setFullName(userData.full_name || '')
      setEmail(userData.email || '')
      setPhone(userData.phone || '')
      setJobTitle(userData.job_title || '')
      setCompanyName(userData.company_name || '')
      setStatus(userData.status || 'active')
      setUserRoles(userData.roles?.map((r: UserRole) => r.role) || [])

      // Fetch recent login history (last 10)
      fetchLoginHistory(10)
      // Fetch recent change history (last 10)
      fetchChangeHistory(10)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user')
    } finally {
      setLoading(false)
    }
  }

  const fetchChangeHistory = async (limit: number = 10, forModal: boolean = false) => {
    try {
      setChangeHistoryLoading(true)
      const response = await fetch(
        `/api/admin/users/${id}/activity?limit=${limit}&include_auth_events=true`
      )
      const result = await response.json()

      if (response.ok && result.success) {
        if (forModal) {
          setAllChangeHistory(result.data.activities || [])
        } else {
          setChangeHistory(result.data.activities || [])
        }
        setChangeHistoryPagination({
          total: result.data.pagination?.total || 0,
          hasMore: result.data.pagination?.hasMore || false,
        })
      }
    } catch (err) {
      console.error('Failed to fetch change history:', err)
    } finally {
      setChangeHistoryLoading(false)
    }
  }

  const handleViewAllChangeHistory = () => {
    fetchChangeHistory(100, true)
    setShowChangeHistoryModal(true)
  }

  const fetchLoginHistory = async (limit: number = 10, forModal: boolean = false) => {
    try {
      setLoginHistoryLoading(true)
      const response = await fetch(
        `/api/admin/users/${id}/login-history?limit=${limit}&include_stats=true`
      )
      const result = await response.json()

      if (response.ok && result.success) {
        if (forModal) {
          setAllLoginHistory(result.data.logins || [])
        } else {
          setLoginHistory(result.data.logins || [])
        }
        setLoginStats(result.data.stats || null)
        setLoginHistoryPagination({
          total: result.data.pagination?.total || 0,
          hasMore: result.data.pagination?.hasMore || false,
        })
      }
    } catch (err) {
      console.error('Failed to fetch login history:', err)
    } finally {
      setLoginHistoryLoading(false)
    }
  }

  const handleViewAllLoginHistory = () => {
    fetchLoginHistory(50, true)
    setShowLoginHistoryModal(true)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      await signOut()
      localStorage.removeItem('humanglue_user')
      localStorage.removeItem('demoUser')
      document.cookie = 'demoUser=; path=/; max-age=0'
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      window.location.href = '/login'
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      const currentRoles = user?.roles?.map(r => r.role) || []
      const rolesToAdd = userRoles.filter(r => !currentRoles.includes(r))
      const rolesToRemove = currentRoles.filter(r => !userRoles.includes(r))

      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          jobTitle,
          companyName,
          status,
          roles: rolesToAdd.length > 0 ? rolesToAdd : undefined,
          removeRoles: rolesToRemove.length > 0 ? rolesToRemove : undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to update user')
      }

      setUser(result.data)
      setSuccessMessage('User updated successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleResetPassword = async () => {
    try {
      setResettingPassword(true)
      setError(null)

      const response = await fetch(`/api/admin/users/${id}/reset-password`, {
        method: 'POST',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to reset password')
      }

      if (result.data.temporaryPassword) {
        setTempPassword(result.data.temporaryPassword)
      } else {
        setSuccessMessage('Password reset email sent successfully!')
        setShowResetPasswordModal(false)
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password')
    } finally {
      setResettingPassword(false)
    }
  }

  const handleDelete = async (hard = false) => {
    try {
      setDeleting(true)
      setError(null)

      const url = hard ? `/api/admin/users/${id}?hard=true` : `/api/admin/users/${id}`
      const response = await fetch(url, { method: 'DELETE' })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to delete user')
      }

      router.push('/admin/users')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user')
      setDeleting(false)
    }
  }

  const toggleRole = (role: string) => {
    if (userRoles.includes(role)) {
      setUserRoles(userRoles.filter(r => r !== role))
    } else {
      setUserRoles([...userRoles, role])
    }
  }

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-500/20 text-red-300 border-red-500/30',
      instructor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      expert: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      client: 'bg-green-500/20 text-green-300 border-green-500/30',
      org_admin: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      team_lead: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      member: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    }
    return colors[role] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }

  if (!showContent || loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--hg-bg-primary)' }}>
        <DashboardSidebar onLogout={handleLogout} />
        <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 flex items-center justify-center min-h-screen">
          <LoadingSpinner variant="neural" size="xl" text="Loading User..." />
        </div>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--hg-bg-primary)' }}>
        <DashboardSidebar onLogout={handleLogout} />
        <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 flex items-center justify-center min-h-screen">
          <Card className="max-w-md text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <Heading as="h2" size="xl" className="mb-2">Error Loading User</Heading>
            <Text variant="muted" className="mb-4">{error}</Text>
            <Link href="/admin/users">
              <Button variant="secondary">Back to Users</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
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
                <Link href="/admin/users" className="flex items-center gap-2 mb-2 hg-text-muted hover:text-white transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  <Text size="sm">Back to Users</Text>
                </Link>
                <Heading as="h1" size="3xl">Edit User</Heading>
                <Text variant="muted">{user?.email}</Text>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="lg"
                  icon={<Key className="w-5 h-5" />}
                  onClick={() => setShowResetPasswordModal(true)}
                >
                  Reset Password
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Save className="w-5 h-5" />}
                  onClick={handleSave}
                  isLoading={saving}
                  disabled={saving}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Success/Error Messages */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <Text className="text-emerald-300">{successMessage}</Text>
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <Text className="text-red-300">{error}</Text>
                <button onClick={() => setError(null)} className="ml-auto">
                  <X className="w-4 h-4 text-red-400" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <Card>
                <Heading as="h2" size="xl" className="mb-6">Basic Information</Heading>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-2">
                      <Text size="sm" weight="semibold">Full Name</Text>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 hg-text-muted" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl hg-bg-secondary hg-border border hg-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--hg-cyan-border)]"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2">
                      <Text size="sm" weight="semibold">Email</Text>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 hg-text-muted" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl hg-bg-secondary hg-border border hg-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--hg-cyan-border)]"
                        placeholder="user@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2">
                      <Text size="sm" weight="semibold">Phone</Text>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 hg-text-muted" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl hg-bg-secondary hg-border border hg-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--hg-cyan-border)]"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2">
                      <Text size="sm" weight="semibold">Job Title</Text>
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 hg-text-muted" />
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl hg-bg-secondary hg-border border hg-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--hg-cyan-border)]"
                        placeholder="Software Engineer"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-2">
                      <Text size="sm" weight="semibold">Company</Text>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 hg-text-muted" />
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl hg-bg-secondary hg-border border hg-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--hg-cyan-border)]"
                        placeholder="Acme Inc."
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Roles */}
              <Card>
                <Heading as="h2" size="xl" className="mb-6">Roles & Permissions</Heading>
                <div className="flex flex-wrap gap-3">
                  {ALL_ROLES.map((role) => {
                    const isActive = userRoles.includes(role)
                    return (
                      <button
                        key={role}
                        onClick={() => toggleRole(role)}
                        className={`
                          px-4 py-2 rounded-xl border text-sm font-semibold transition-all flex items-center gap-2
                          ${isActive
                            ? getRoleBadgeColor(role)
                            : 'bg-gray-800/50 text-gray-400 border-gray-700/50 hover:border-gray-600'
                          }
                        `}
                      >
                        {isActive ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {role}
                      </button>
                    )
                  })}
                </div>
                <Text variant="muted" size="sm" className="mt-4">
                  Click to add or remove roles. Changes are saved when you click "Save Changes".
                </Text>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status */}
              <Card>
                <Heading as="h3" size="lg" className="mb-4">Account Status</Heading>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as typeof status)}
                  className="w-full px-4 py-3 rounded-xl hg-bg-secondary hg-border border hg-text-primary focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="disabled">Disabled</option>
                </select>
                <Text variant="muted" size="xs" className="mt-2">
                  Disabled accounts cannot log in.
                </Text>
              </Card>

              {/* Meta Info */}
              <Card>
                <Heading as="h3" size="lg" className="mb-4">Account Details</Heading>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Text variant="muted" size="sm">User ID</Text>
                    <Text size="sm" className="font-mono text-xs">{user?.id.slice(0, 8)}...</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text variant="muted" size="sm">Created</Text>
                    <Text size="sm">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text variant="muted" size="sm">Updated</Text>
                    <Text size="sm">{user?.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text variant="muted" size="sm">Last Login</Text>
                    <Text size="sm">
                      {user?.last_login_at
                        ? new Date(user.last_login_at).toLocaleString()
                        : loginStats?.lastLogin
                          ? new Date(loginStats.lastLogin).toLocaleString()
                          : 'Never'}
                    </Text>
                  </div>
                </div>
              </Card>

              {/* Login History */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-cyan-400" />
                    <Heading as="h3" size="lg">Login History</Heading>
                  </div>
                  {loginStats && (
                    <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {loginStats.totalLogins} total
                    </span>
                  )}
                </div>

                {loginHistoryLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <LoadingSpinner size="sm" />
                  </div>
                ) : loginHistory.length === 0 ? (
                  <div className="text-center py-6">
                    <Clock className="w-8 h-8 mx-auto mb-2 hg-text-muted" />
                    <Text variant="muted" size="sm">No login history yet</Text>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {loginHistory.slice(0, 5).map((login) => (
                      <div
                        key={login.id}
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                            <Monitor className="w-4 h-4 text-cyan-400" />
                          </div>
                          <div>
                            <Text size="sm" weight="medium">
                              {new Date(login.loginAt).toLocaleDateString()}
                            </Text>
                            <Text variant="muted" size="xs">
                              {new Date(login.loginAt).toLocaleTimeString()}
                            </Text>
                          </div>
                        </div>
                        {login.location && (
                          <div className="flex items-center gap-1 text-xs hg-text-muted">
                            <Globe className="w-3 h-3" />
                            <span>{login.location}</span>
                          </div>
                        )}
                      </div>
                    ))}

                    {loginHistoryPagination.total > 5 && (
                      <button
                        onClick={handleViewAllLoginHistory}
                        className="w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                      >
                        <span className="text-sm font-medium">View All ({loginHistoryPagination.total})</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                {loginStats && loginStats.totalLogins > 0 && (
                  <div className="mt-4 pt-4 border-t hg-border">
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-2 rounded-lg bg-white/5">
                        <Text size="lg" weight="bold" className="text-cyan-400">
                          {loginStats.loginsLast7Days}
                        </Text>
                        <Text variant="muted" size="xs">Last 7 days</Text>
                      </div>
                      <div className="p-2 rounded-lg bg-white/5">
                        <Text size="lg" weight="bold" className="text-cyan-400">
                          {loginStats.loginsLast30Days}
                        </Text>
                        <Text variant="muted" size="xs">Last 30 days</Text>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Change History */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    <Heading as="h3" size="lg">Change History</Heading>
                  </div>
                  {changeHistoryPagination.total > 0 && (
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {changeHistoryPagination.total} events
                    </span>
                  )}
                </div>

                {changeHistoryLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <LoadingSpinner size="sm" />
                  </div>
                ) : changeHistory.length === 0 ? (
                  <div className="text-center py-6">
                    <FileText className="w-8 h-8 mx-auto mb-2 hg-text-muted" />
                    <Text variant="muted" size="sm">No change history yet</Text>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Timeline */}
                    <div className="relative">
                      {/* Vertical line */}
                      <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-700" />

                      {changeHistory.slice(0, 5).map((change, index) => {
                        const { icon, color, bgColor } = getActionIcon(change.action)
                        return (
                          <motion.div
                            key={change.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="relative flex items-start gap-3 pb-3 last:pb-0"
                          >
                            {/* Icon */}
                            <div className={`relative z-10 w-8 h-8 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0`}>
                              <span className={color}>{icon}</span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pt-0.5">
                              <div className="flex items-center justify-between gap-2">
                                <Text size="sm" weight="medium" className="truncate">
                                  {formatActionLabel(change.action)}
                                </Text>
                                <Text variant="muted" size="xs" className="flex-shrink-0">
                                  {getRelativeTime(change.timestamp)}
                                </Text>
                              </div>
                              {change.actorName && (
                                <Text variant="muted" size="xs" className="truncate">
                                  by {change.actorName}
                                </Text>
                              )}
                              {change.details && Object.keys(change.details).length > 0 && (
                                <div className="mt-1 text-xs text-slate-500">
                                  {'new_role' in change.details && change.details.new_role ? (
                                    <span className="inline-flex items-center gap-1">
                                      <span>Role:</span>
                                      <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                                        {String(change.details.new_role)}
                                      </span>
                                    </span>
                                  ) : null}
                                  {'previous_role' in change.details && 'new_role' in change.details && change.details.previous_role && change.details.new_role ? (
                                    <span className="mx-1">from</span>
                                  ) : null}
                                  {'previous_role' in change.details && change.details.previous_role ? (
                                    <span className="px-1.5 py-0.5 rounded bg-slate-500/20 text-slate-400">
                                      {String(change.details.previous_role)}
                                    </span>
                                  ) : null}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>

                    {changeHistoryPagination.total > 5 && (
                      <button
                        onClick={handleViewAllChangeHistory}
                        className="w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-lg border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition-colors"
                      >
                        <span className="text-sm font-medium">View All ({changeHistoryPagination.total})</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </Card>

              {/* Danger Zone */}
              <Card className="border-red-500/30">
                <Heading as="h3" size="lg" className="mb-4 text-red-400">Danger Zone</Heading>
                <Button
                  variant="secondary"
                  fullWidth
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={() => setShowDeleteModal(true)}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  Delete User
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {showResetPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => { setShowResetPasswordModal(false); setTempPassword(null) }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="hg-bg-card hg-border border rounded-2xl w-full max-w-md"
            >
              <div className="flex items-center justify-between p-6 border-b hg-border">
                <Heading as="h2" size="2xl">Reset Password</Heading>
                <button onClick={() => { setShowResetPasswordModal(false); setTempPassword(null) }} className="p-2 rounded-lg hover:bg-white/10">
                  <X className="w-6 h-6 hg-text-muted" />
                </button>
              </div>
              <div className="p-6">
                {tempPassword ? (
                  <div>
                    <div className="p-4 bg-amber-500/20 border border-amber-500/30 rounded-xl mb-4">
                      <Text className="text-amber-300 mb-2">Email failed to send. Share this password manually:</Text>
                      <code className="block p-3 bg-black/30 rounded-lg font-mono text-lg text-center">{tempPassword}</code>
                    </div>
                    <Button variant="primary" fullWidth onClick={() => { setShowResetPasswordModal(false); setTempPassword(null) }}>
                      Done
                    </Button>
                  </div>
                ) : (
                  <>
                    <Text variant="muted" className="mb-6">
                      This will generate a new temporary password and send it to the user's email address ({user?.email}).
                    </Text>
                    <div className="flex gap-3">
                      <Button variant="secondary" fullWidth onClick={() => setShowResetPasswordModal(false)}>
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        fullWidth
                        onClick={handleResetPassword}
                        isLoading={resettingPassword}
                        disabled={resettingPassword}
                      >
                        Reset Password
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete User Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="hg-bg-card hg-border border rounded-2xl w-full max-w-md"
            >
              <div className="flex items-center justify-between p-6 border-b hg-border">
                <Heading as="h2" size="2xl" className="text-red-400">Delete User</Heading>
                <button onClick={() => setShowDeleteModal(false)} className="p-2 rounded-lg hover:bg-white/10">
                  <X className="w-6 h-6 hg-text-muted" />
                </button>
              </div>
              <div className="p-6">
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                    <div>
                      <Text className="text-red-300 font-semibold">Warning</Text>
                      <Text variant="muted" size="sm">
                        Disabling will prevent the user from logging in. Permanent deletion cannot be undone.
                      </Text>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => handleDelete(false)}
                    isLoading={deleting}
                    disabled={deleting}
                  >
                    Disable Account (Soft Delete)
                  </Button>
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => handleDelete(true)}
                    isLoading={deleting}
                    disabled={deleting}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    Permanently Delete
                  </Button>
                  <Button variant="secondary" fullWidth onClick={() => setShowDeleteModal(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login History Modal */}
      <AnimatePresence>
        {showLoginHistoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowLoginHistoryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="hg-bg-card hg-border border rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b hg-border">
                <div className="flex items-center gap-3">
                  <History className="w-6 h-6 text-cyan-400" />
                  <div>
                    <Heading as="h2" size="2xl">Login History</Heading>
                    <Text variant="muted" size="sm">{user?.full_name || user?.email}</Text>
                  </div>
                </div>
                <button onClick={() => setShowLoginHistoryModal(false)} className="p-2 rounded-lg hover:bg-white/10">
                  <X className="w-6 h-6 hg-text-muted" />
                </button>
              </div>

              {/* Stats Summary */}
              {loginStats && (
                <div className="px-6 py-4 border-b hg-border bg-white/5">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <Text size="xl" weight="bold" className="text-cyan-400">{loginStats.totalLogins}</Text>
                      <Text variant="muted" size="xs">Total Logins</Text>
                    </div>
                    <div>
                      <Text size="xl" weight="bold" className="text-cyan-400">{loginStats.loginsLast7Days}</Text>
                      <Text variant="muted" size="xs">Last 7 Days</Text>
                    </div>
                    <div>
                      <Text size="xl" weight="bold" className="text-cyan-400">{loginStats.loginsLast30Days}</Text>
                      <Text variant="muted" size="xs">Last 30 Days</Text>
                    </div>
                    <div>
                      <Text size="sm" weight="bold" className="text-cyan-400">
                        {loginStats.firstLogin ? new Date(loginStats.firstLogin).toLocaleDateString() : 'N/A'}
                      </Text>
                      <Text variant="muted" size="xs">First Login</Text>
                    </div>
                  </div>
                </div>
              )}

              {/* Login History List */}
              <div className="flex-1 overflow-y-auto p-6">
                {loginHistoryLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : allLoginHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 mx-auto mb-4 hg-text-muted" />
                    <Text variant="muted">No login history available</Text>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allLoginHistory.map((login) => (
                      <div
                        key={login.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                            <Monitor className="w-5 h-5 text-cyan-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Text weight="semibold">
                                {new Date(login.loginAt).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </Text>
                              <Text variant="muted" size="sm">
                                {new Date(login.loginAt).toLocaleTimeString()}
                              </Text>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              {login.location && (
                                <div className="flex items-center gap-1 text-xs hg-text-muted">
                                  <Globe className="w-3 h-3" />
                                  <span>{login.location}</span>
                                </div>
                              )}
                              {login.ipAddress && (
                                <Text variant="muted" size="xs" className="font-mono">
                                  {login.ipAddress}
                                </Text>
                              )}
                              {login.loginMethod && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                                  {login.loginMethod}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {(login.browser || login.os) && (
                          <div className="text-right">
                            {login.browser && (
                              <Text size="sm" variant="muted">{login.browser}</Text>
                            )}
                            {login.os && (
                              <Text size="xs" variant="muted">{login.os}</Text>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t hg-border">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowLoginHistoryModal(false)}
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change History Modal */}
      <AnimatePresence>
        {showChangeHistoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowChangeHistoryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="hg-bg-card hg-border border rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b hg-border">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-purple-400" />
                  <div>
                    <Heading as="h2" size="2xl">Change History</Heading>
                    <Text variant="muted" size="sm">{user?.full_name || user?.email}</Text>
                  </div>
                </div>
                <button onClick={() => setShowChangeHistoryModal(false)} className="p-2 rounded-lg hover:bg-white/10">
                  <X className="w-6 h-6 hg-text-muted" />
                </button>
              </div>

              {/* Summary Stats */}
              <div className="px-6 py-4 border-b hg-border bg-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-400" />
                    <Text weight="semibold">Activity Timeline</Text>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
                    {changeHistoryPagination.total} total events
                  </span>
                </div>
              </div>

              {/* Change History List */}
              <div className="flex-1 overflow-y-auto p-6">
                {changeHistoryLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : allChangeHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto mb-4 hg-text-muted" />
                    <Text variant="muted">No change history available</Text>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Vertical timeline line */}
                    <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-700" />

                    <div className="space-y-4">
                      {allChangeHistory.map((change, index) => {
                        const { icon, color, bgColor } = getActionIcon(change.action)
                        return (
                          <motion.div
                            key={change.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="relative flex items-start gap-4"
                          >
                            {/* Icon */}
                            <div className={`relative z-10 w-10 h-10 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0 border-4 border-slate-800`}>
                              <span className={color}>{icon}</span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <Text weight="semibold" className="mb-1">
                                    {formatActionLabel(change.action)}
                                  </Text>
                                  {change.actorName && (
                                    <div className="flex items-center gap-2 mb-2">
                                      <User className="w-3 h-3 hg-text-muted" />
                                      <Text variant="muted" size="sm">
                                        {change.actorName}
                                        {change.actorEmail && (
                                          <span className="text-xs ml-1">({change.actorEmail})</span>
                                        )}
                                      </Text>
                                    </div>
                                  )}

                                  {/* Details */}
                                  {change.details && Object.keys(change.details).length > 0 ? (
                                    <div className="mt-2 p-2 rounded-lg bg-black/20">
                                      {change.details.new_role ? (
                                        <div className="flex items-center gap-2 text-sm">
                                          <span className="hg-text-muted">Role:</span>
                                          {change.details.previous_role ? (
                                            <>
                                              <span className="px-2 py-0.5 rounded bg-slate-500/20 text-slate-400 line-through">
                                                {String(change.details.previous_role)}
                                              </span>
                                              <ChevronRight className="w-4 h-4 hg-text-muted" />
                                            </>
                                          ) : null}
                                          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                                            {String(change.details.new_role)}
                                          </span>
                                        </div>
                                      ) : null}
                                      {change.details.email && !change.details.new_role ? (
                                        <div className="text-sm hg-text-muted">
                                          Email: {String(change.details.email)}
                                        </div>
                                      ) : null}
                                      {change.details.reason ? (
                                        <div className="text-sm hg-text-muted mt-1">
                                          Reason: {String(change.details.reason)}
                                        </div>
                                      ) : null}
                                    </div>
                                  ) : null}

                                  {/* IP Address */}
                                  {change.ipAddress && (
                                    <div className="flex items-center gap-1 mt-2 text-xs hg-text-muted">
                                      <Globe className="w-3 h-3" />
                                      <span className="font-mono">{change.ipAddress}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Timestamp */}
                                <div className="text-right flex-shrink-0">
                                  <Text variant="muted" size="sm">
                                    {getRelativeTime(change.timestamp)}
                                  </Text>
                                  <Text variant="muted" size="xs">
                                    {new Date(change.timestamp).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </Text>
                                  <Text variant="muted" size="xs">
                                    {new Date(change.timestamp).toLocaleTimeString()}
                                  </Text>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t hg-border">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowChangeHistoryModal(false)}
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
