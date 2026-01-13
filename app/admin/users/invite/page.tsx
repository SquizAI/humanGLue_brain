'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, Mail, UserPlus, ArrowLeft } from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'
import { signOut } from '@/lib/auth/hooks'

export default function InviteUserPage() {
  const { userData } = useChat()
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'admin' | 'instructor' | 'expert' | 'client'>('client')
  const [organizationName, setOrganizationName] = useState('HMN')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invitedEmail, setInvitedEmail] = useState<string | null>(null)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/admin/users/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          fullName,
          role,
          organizationName,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to invite user')
      }

      setSuccess(true)
      setInvitedEmail(email)

      // Reset form
      setEmail('')
      setFullName('')
      setRole('client')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
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
                  <Link href="/admin/users" className="flex items-center gap-2 text-sm hover:underline" style={{ color: 'var(--hg-text-muted)' }}>
                    <ArrowLeft className="w-4 h-4" />
                    Back to Users
                  </Link>
                </div>
                <h1 className="text-3xl font-bold font-gendy" style={{ color: 'var(--hg-text-primary)' }}>Invite New User</h1>
                <p className="font-diatype" style={{ color: 'var(--hg-text-muted)' }}>
                  Send an invitation email with login credentials to a new user
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-2xl mx-auto">
          {/* Success Alert */}
          <AnimatePresence>
            {success && invitedEmail && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-start gap-3"
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-emerald-300 font-gendy">Invitation sent!</h4>
                  <p className="text-sm text-emerald-200 font-diatype">
                    An email with login credentials has been sent to <strong>{invitedEmail}</strong>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-300 font-gendy">Error</h4>
                  <p className="text-sm text-red-200 font-diatype">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Card */}
          <div className="border rounded-2xl" style={{ backgroundColor: 'var(--hg-bg-card)', borderColor: 'var(--hg-border-color)' }}>
            <div className="p-6 border-b" style={{ borderColor: 'var(--hg-border-color)' }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--hg-cyan-bg)' }}>
                  <UserPlus className="w-6 h-6" style={{ color: 'var(--hg-cyan-text)' }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-gendy" style={{ color: 'var(--hg-text-primary)' }}>User Information</h2>
                  <p className="text-sm font-diatype" style={{ color: 'var(--hg-text-muted)' }}>
                    Enter the new user's details and select their role
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold font-diatype" style={{ color: 'var(--hg-text-primary)' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl font-diatype disabled:opacity-50 border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--hg-bg-secondary)',
                    borderColor: 'var(--hg-border-color)',
                    color: 'var(--hg-text-primary)',
                    '--tw-ring-color': 'var(--hg-cyan-border)'
                  } as React.CSSProperties}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold font-diatype" style={{ color: 'var(--hg-text-primary)' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl font-diatype disabled:opacity-50 border focus:outline-none"
                  style={{ backgroundColor: 'var(--hg-bg-secondary)', borderColor: 'var(--hg-border-color)', color: 'var(--hg-text-primary)' }}
                />
                <p className="text-xs font-diatype" style={{ color: 'var(--hg-text-muted)' }}>
                  Optional - will default to email username if not provided
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold font-diatype" style={{ color: 'var(--hg-text-primary)' }}>
                  Role *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as typeof role)}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl font-diatype disabled:opacity-50 border focus:outline-none"
                  style={{ backgroundColor: 'var(--hg-bg-secondary)', borderColor: 'var(--hg-border-color)', color: 'var(--hg-text-primary)' }}
                >
                  <option value="client">Client - Access courses and track learning</option>
                  <option value="instructor">Instructor - Create and manage courses</option>
                  <option value="expert">Expert - Provide expert insights</option>
                  <option value="admin">Admin - Full platform administration</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold font-diatype" style={{ color: 'var(--hg-text-primary)' }}>
                  Organization Name
                </label>
                <input
                  type="text"
                  placeholder="HMN"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl font-diatype disabled:opacity-50 border focus:outline-none"
                  style={{ backgroundColor: 'var(--hg-bg-secondary)', borderColor: 'var(--hg-border-color)', color: 'var(--hg-text-primary)' }}
                />
                <p className="text-xs font-diatype" style={{ color: 'var(--hg-text-muted)' }}>
                  Will appear in the invitation email
                </p>
              </div>

              {/* Info Box */}
              <div
                className="rounded-xl p-4 border"
                style={{ backgroundColor: 'var(--hg-cyan-bg)', borderColor: 'var(--hg-cyan-border)' }}
              >
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--hg-cyan-text)' }} />
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1 font-gendy" style={{ color: 'var(--hg-text-primary)' }}>What happens next?</h4>
                    <ul className="text-sm space-y-1 font-diatype" style={{ color: 'var(--hg-text-secondary)' }}>
                      <li>• A temporary password will be generated automatically</li>
                      <li>• An invitation email will be sent to the user</li>
                      <li>• They can log in immediately using the provided credentials</li>
                      <li>• They'll be prompted to change their password on first login</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold font-diatype disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ boxShadow: '0 4px 14px rgba(97, 216, 254, 0.4)' }}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Sending Invitation...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Send Invitation
                    </>
                  )}
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setEmail('')
                    setFullName('')
                    setRole('client')
                    setOrganizationName('HMN')
                    setError(null)
                    setSuccess(false)
                  }}
                  disabled={loading}
                  className="px-6 py-3 rounded-xl font-semibold font-diatype disabled:opacity-50 border"
                  style={{ backgroundColor: 'var(--hg-bg-secondary)', borderColor: 'var(--hg-border-color)', color: 'var(--hg-text-primary)' }}
                >
                  Clear
                </motion.button>
              </div>
            </form>
          </div>

          {/* Role Descriptions */}
          <div
            className="mt-6 p-6 border rounded-2xl"
            style={{ backgroundColor: 'var(--hg-bg-card)', borderColor: 'var(--hg-border-color)' }}
          >
            <h3 className="font-semibold mb-4 font-gendy" style={{ color: 'var(--hg-text-primary)' }}>Role Descriptions</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-medium font-diatype" style={{ color: 'var(--hg-text-secondary)' }}>Client:</dt>
                <dd className="font-diatype" style={{ color: 'var(--hg-text-muted)' }}>Can access courses, track learning progress, and view their dashboard</dd>
              </div>
              <div>
                <dt className="font-medium font-diatype" style={{ color: 'var(--hg-text-secondary)' }}>Instructor:</dt>
                <dd className="font-diatype" style={{ color: 'var(--hg-text-muted)' }}>Can create courses, manage content, track student progress, plus all client permissions</dd>
              </div>
              <div>
                <dt className="font-medium font-diatype" style={{ color: 'var(--hg-text-secondary)' }}>Expert:</dt>
                <dd className="font-diatype" style={{ color: 'var(--hg-text-muted)' }}>Can provide expert consultations, insights, and guidance to clients</dd>
              </div>
              <div>
                <dt className="font-medium font-diatype" style={{ color: 'var(--hg-text-secondary)' }}>Admin:</dt>
                <dd className="font-diatype" style={{ color: 'var(--hg-text-muted)' }}>Full platform access including user management, settings, and all features</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
