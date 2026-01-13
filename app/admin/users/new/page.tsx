'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  UserPlus,
  Mail,
  Phone,
  Building2,
  Briefcase,
  User,
  Shield,
  Send,
  CheckCircle,
  AlertTriangle,
  X,
  Copy,
  Plus,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner'
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import { Text, Heading } from '@/components/atoms/Text'
import { useChat } from '@/lib/contexts/ChatContext'
import { signOut } from '@/lib/auth/hooks'

interface Organization {
  id: string
  name: string
  slug?: string
}

interface CreatedUser {
  userId: string
  email: string
  role: string
  fullName?: string
  emailSent: boolean
  temporaryPassword?: string
}

const ALL_ROLES = [
  { value: 'client', label: 'Client', description: 'Access courses and track learning' },
  { value: 'member', label: 'Member', description: 'Basic organization member' },
  { value: 'team_lead', label: 'Team Lead', description: 'Manage team members and progress' },
  { value: 'org_admin', label: 'Org Admin', description: 'Manage organization settings and members' },
  { value: 'instructor', label: 'Instructor', description: 'Create and manage courses' },
  { value: 'expert', label: 'Expert', description: 'Provide expert insights and consultations' },
  { value: 'admin', label: 'Admin', description: 'Full platform administration' },
]

export default function CreateUserPage() {
  const router = useRouter()
  const { userData, authLoading } = useChat()

  const [showContent, setShowContent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null)
  const [copiedPassword, setCopiedPassword] = useState(false)

  // Organizations state
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loadingOrgs, setLoadingOrgs] = useState(false)
  const [canSelectOrg, setCanSelectOrg] = useState(false)

  // Form state
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('client')
  const [phone, setPhone] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [organizationId, setOrganizationId] = useState('')
  const [sendInvitation, setSendInvitation] = useState(true)

  // Check if user has org_admin or higher privileges
  useEffect(() => {
    if (!authLoading && userData) {
      const highPrivilegeRoles = ['admin', 'org_admin', 'instructor', 'expert']
      const userRoles = userData.roles || []
      const hasHighPrivilege = userRoles.some((r: string) => highPrivilegeRoles.includes(r)) || userData.isAdmin
      setCanSelectOrg(hasHighPrivilege)

      if (hasHighPrivilege) {
        fetchOrganizations()
      }

      setShowContent(true)
    }
  }, [authLoading, userData])

  // Fallback timeout for auth loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!showContent) {
        setShowContent(true)
        setCanSelectOrg(true)
        fetchOrganizations()
      }
    }, 3000)

    return () => clearTimeout(timeout)
  }, [showContent])

  const fetchOrganizations = async () => {
    try {
      setLoadingOrgs(true)
      const response = await fetch('/api/organizations')
      if (response.ok) {
        const result = await response.json()
        if (result.data && Array.isArray(result.data)) {
          setOrganizations(result.data)
        } else if (Array.isArray(result)) {
          setOrganizations(result)
        }
      }
    } catch (err) {
      console.error('Failed to fetch organizations:', err)
    } finally {
      setLoadingOrgs(false)
    }
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

  // Real-time email validation
  const validateEmail = (value: string): string | null => {
    if (!value) return 'Email is required'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) return 'Please enter a valid email address'
    return null
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    const emailError = validateEmail(value)
    setFieldErrors((prev) => ({
      ...prev,
      email: emailError || '',
    }))
  }

  const handleFullNameChange = (value: string) => {
    setFullName(value)
    if (!value.trim()) {
      setFieldErrors((prev) => ({ ...prev, fullName: 'Full name is required' }))
    } else {
      setFieldErrors((prev) => ({ ...prev, fullName: '' }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    const emailError = validateEmail(email)
    if (emailError) errors.email = emailError

    if (!fullName.trim()) errors.fullName = 'Full name is required'

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          fullName,
          role,
          phone: phone || undefined,
          jobTitle: jobTitle || undefined,
          companyName: companyName || undefined,
          organizationId: organizationId || undefined,
          sendInvite: sendInvitation,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to create user')
      }

      // User created successfully
      setCreatedUser({
        userId: result.data?.userId || result.data?.id,
        email: result.data?.email || email,
        role: result.data?.role || role,
        fullName: result.data?.fullName || fullName,
        emailSent: result.data?.emailSent ?? sendInvitation,
        temporaryPassword: result.data?.temporaryPassword,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyPassword = async () => {
    if (createdUser?.temporaryPassword) {
      await navigator.clipboard.writeText(createdUser.temporaryPassword)
      setCopiedPassword(true)
      setTimeout(() => setCopiedPassword(false), 2000)
    }
  }

  const handleCreateAnother = () => {
    setCreatedUser(null)
    setEmail('')
    setFullName('')
    setRole('client')
    setPhone('')
    setJobTitle('')
    setCompanyName('')
    setOrganizationId('')
    setSendInvitation(true)
    setError(null)
    setFieldErrors({})
  }

  const getRoleBadgeColor = (roleValue: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-500/20 text-red-300 border-red-500/30',
      instructor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      expert: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      client: 'bg-green-500/20 text-green-300 border-green-500/30',
      org_admin: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      team_lead: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      member: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    }
    return colors[roleValue] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }

  if (!showContent) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--hg-bg-primary)' }}>
        <DashboardSidebar onLogout={handleLogout} />
        <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 flex items-center justify-center min-h-screen">
          <LoadingSpinner variant="neural" size="xl" text="Loading..." />
        </div>
      </div>
    )
  }

  // Success state - show created user details
  if (createdUser) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--hg-bg-primary)' }}>
        <DashboardSidebar onLogout={handleLogout} />

        <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
          {/* Header */}
          <div
            className="border-b sticky top-0 z-30"
            style={{ backgroundColor: 'var(--hg-bg-sidebar)', borderColor: 'var(--hg-border-color)' }}
          >
            <div className="px-8 py-6">
              <Link
                href="/admin/users"
                className="flex items-center gap-2 mb-2 hg-text-muted hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <Text size="sm">Back to Users</Text>
              </Link>
              <Heading as="h1" size="3xl">User Created Successfully</Heading>
            </div>
          </div>

          <div className="p-8 max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <Heading as="h2" size="2xl" className="mb-2">
                    User Created!
                  </Heading>
                  <Text variant="muted">
                    {createdUser.emailSent
                      ? 'An invitation email has been sent with login credentials.'
                      : 'The user has been created. Share the credentials below.'}
                  </Text>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="p-4 rounded-xl hg-bg-secondary">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Text variant="muted" size="sm">Email</Text>
                        <Text weight="semibold">{createdUser.email}</Text>
                      </div>
                      <div>
                        <Text variant="muted" size="sm">Full Name</Text>
                        <Text weight="semibold">{createdUser.fullName || '-'}</Text>
                      </div>
                      <div>
                        <Text variant="muted" size="sm">Role</Text>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(createdUser.role)}`}
                        >
                          {createdUser.role}
                        </span>
                      </div>
                      <div>
                        <Text variant="muted" size="sm">Invitation</Text>
                        <Text weight="semibold">
                          {createdUser.emailSent ? 'Sent' : 'Not Sent'}
                        </Text>
                      </div>
                    </div>
                  </div>

                  {/* Show temporary password if invite was not sent */}
                  {!createdUser.emailSent && createdUser.temporaryPassword && (
                    <div className="p-4 bg-amber-500/20 border border-amber-500/30 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <Text className="text-amber-300 font-semibold mb-2">
                            Temporary Password
                          </Text>
                          <Text variant="muted" size="sm" className="mb-3">
                            Since the invitation email was not sent, please share this password with the user manually.
                          </Text>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 p-3 bg-black/30 rounded-lg font-mono text-lg text-center">
                              {createdUser.temporaryPassword}
                            </code>
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={<Copy className="w-4 h-4" />}
                              onClick={handleCopyPassword}
                            >
                              {copiedPassword ? 'Copied!' : 'Copy'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    size="lg"
                    fullWidth
                    icon={<Plus className="w-5 h-5" />}
                    onClick={handleCreateAnother}
                  >
                    Create Another User
                  </Button>
                  <Link href="/admin/users" className="flex-1">
                    <Button variant="primary" size="lg" fullWidth>
                      View All Users
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  // Main form
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--hg-bg-primary)' }}>
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        {/* Header */}
        <div
          className="border-b sticky top-0 z-30"
          style={{ backgroundColor: 'var(--hg-bg-sidebar)', borderColor: 'var(--hg-border-color)' }}
        >
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <Link
                  href="/admin/users"
                  className="flex items-center gap-2 mb-2 hg-text-muted hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <Text size="sm">Back to Users</Text>
                </Link>
                <Heading as="h1" size="3xl">Create New User</Heading>
                <Text variant="muted">Add a new user to the platform</Text>
              </div>
              <Button
                variant="primary"
                size="lg"
                icon={<UserPlus className="w-5 h-5" />}
                onClick={handleSubmit}
                isLoading={submitting}
                disabled={submitting}
              >
                Create User
              </Button>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <Text className="text-red-300 flex-1">{error}</Text>
                <button onClick={() => setError(null)}>
                  <X className="w-4 h-4 text-red-400" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Info */}
                <Card>
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: 'var(--hg-cyan-bg)' }}
                    >
                      <User className="w-6 h-6" style={{ color: 'var(--hg-cyan-text)' }} />
                    </div>
                    <div>
                      <Heading as="h2" size="xl">Basic Information</Heading>
                      <Text variant="muted" size="sm">Enter the user&apos;s details</Text>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Email */}
                    <div className="md:col-span-2">
                      <label className="block mb-2">
                        <Text size="sm" weight="semibold">
                          Email Address <span className="text-red-400">*</span>
                        </Text>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 hg-text-muted" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => handleEmailChange(e.target.value)}
                          placeholder="user@example.com"
                          disabled={submitting}
                          className={`w-full pl-12 pr-4 py-3 rounded-xl hg-bg-secondary border hg-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--hg-cyan-border)] disabled:opacity-50 ${
                            fieldErrors.email ? 'border-red-500' : 'hg-border'
                          }`}
                        />
                      </div>
                      {fieldErrors.email && (
                        <Text size="xs" className="text-red-400 mt-1">
                          {fieldErrors.email}
                        </Text>
                      )}
                    </div>

                    {/* Full Name */}
                    <div className="md:col-span-2">
                      <label className="block mb-2">
                        <Text size="sm" weight="semibold">
                          Full Name <span className="text-red-400">*</span>
                        </Text>
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 hg-text-muted" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => handleFullNameChange(e.target.value)}
                          placeholder="John Doe"
                          disabled={submitting}
                          className={`w-full pl-12 pr-4 py-3 rounded-xl hg-bg-secondary border hg-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--hg-cyan-border)] disabled:opacity-50 ${
                            fieldErrors.fullName ? 'border-red-500' : 'hg-border'
                          }`}
                        />
                      </div>
                      {fieldErrors.fullName && (
                        <Text size="xs" className="text-red-400 mt-1">
                          {fieldErrors.fullName}
                        </Text>
                      )}
                    </div>

                    {/* Phone */}
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
                          placeholder="+1 (555) 000-0000"
                          disabled={submitting}
                          className="w-full pl-12 pr-4 py-3 rounded-xl hg-bg-secondary hg-border border hg-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--hg-cyan-border)] disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {/* Job Title */}
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
                          placeholder="Software Engineer"
                          disabled={submitting}
                          className="w-full pl-12 pr-4 py-3 rounded-xl hg-bg-secondary hg-border border hg-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--hg-cyan-border)] disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {/* Company Name */}
                    <div className="md:col-span-2">
                      <label className="block mb-2">
                        <Text size="sm" weight="semibold">Company Name</Text>
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 hg-text-muted" />
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Acme Inc."
                          disabled={submitting}
                          className="w-full pl-12 pr-4 py-3 rounded-xl hg-bg-secondary hg-border border hg-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--hg-cyan-border)] disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Role Selection */}
                <Card>
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: 'var(--hg-cyan-bg)' }}
                    >
                      <Shield className="w-6 h-6" style={{ color: 'var(--hg-cyan-text)' }} />
                    </div>
                    <div>
                      <Heading as="h2" size="xl">Role & Permissions</Heading>
                      <Text variant="muted" size="sm">Select the user&apos;s role</Text>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {ALL_ROLES.map((roleOption) => (
                      <label
                        key={roleOption.value}
                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                          role === roleOption.value
                            ? 'border-[var(--hg-cyan-border)] bg-[var(--hg-cyan-bg)]'
                            : 'hg-border hg-bg-secondary hover:border-slate-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={roleOption.value}
                          checked={role === roleOption.value}
                          onChange={(e) => setRole(e.target.value)}
                          disabled={submitting}
                          className="w-4 h-4 text-cyan-500 bg-slate-700 border-slate-600 focus:ring-cyan-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Text weight="semibold">{roleOption.label}</Text>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadgeColor(roleOption.value)}`}
                            >
                              {roleOption.value}
                            </span>
                          </div>
                          <Text variant="muted" size="sm">
                            {roleOption.description}
                          </Text>
                        </div>
                      </label>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Organization */}
                {canSelectOrg && (
                  <Card>
                    <div className="flex items-center gap-3 mb-4">
                      <Building2 className="w-5 h-5" style={{ color: 'var(--hg-cyan-text)' }} />
                      <Heading as="h3" size="lg">Organization</Heading>
                    </div>
                    {loadingOrgs ? (
                      <div className="flex items-center justify-center py-4">
                        <LoadingSpinner variant="neural" size="sm" />
                      </div>
                    ) : (
                      <>
                        <select
                          value={organizationId}
                          onChange={(e) => setOrganizationId(e.target.value)}
                          disabled={submitting}
                          className="w-full px-4 py-3 rounded-xl hg-bg-secondary hg-border border hg-text-primary focus:outline-none disabled:opacity-50"
                        >
                          <option value="">No Organization</option>
                          {organizations.map((org) => (
                            <option key={org.id} value={org.id}>
                              {org.name}
                            </option>
                          ))}
                        </select>
                        <Text variant="muted" size="xs" className="mt-2">
                          Assign user to an organization (optional)
                        </Text>
                      </>
                    )}
                  </Card>
                )}

                {/* Invitation Settings */}
                <Card>
                  <div className="flex items-center gap-3 mb-4">
                    <Send className="w-5 h-5" style={{ color: 'var(--hg-cyan-text)' }} />
                    <Heading as="h3" size="lg">Invitation</Heading>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendInvitation}
                      onChange={(e) => setSendInvitation(e.target.checked)}
                      disabled={submitting}
                      className="w-5 h-5 mt-0.5 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500"
                    />
                    <div>
                      <Text weight="semibold">Send Invitation Email</Text>
                      <Text variant="muted" size="sm">
                        Send login credentials to the user via email
                      </Text>
                    </div>
                  </label>

                  <div
                    className="mt-4 p-4 rounded-xl border"
                    style={{ backgroundColor: 'var(--hg-cyan-bg)', borderColor: 'var(--hg-cyan-border)' }}
                  >
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--hg-cyan-text)' }} />
                      <div>
                        <Text weight="semibold" size="sm">What happens next?</Text>
                        <ul className="mt-2 space-y-1 text-sm hg-text-muted">
                          <li>- A temporary password is generated</li>
                          {sendInvitation ? (
                            <>
                              <li>- Invitation email is sent</li>
                              <li>- User logs in and sets password</li>
                            </>
                          ) : (
                            <>
                              <li>- Password shown after creation</li>
                              <li>- Share credentials manually</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Submit Button (Mobile) */}
                <div className="lg:hidden">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    icon={<UserPlus className="w-5 h-5" />}
                    onClick={handleSubmit}
                    isLoading={submitting}
                    disabled={submitting}
                  >
                    Create User
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
