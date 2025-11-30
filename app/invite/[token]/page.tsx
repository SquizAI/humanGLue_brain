'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  Building2,
  Lock,
  User,
  Check,
  X,
  Loader2,
  AlertCircle,
  Mail,
  Users,
  Briefcase,
  ArrowRight,
} from 'lucide-react'

interface InvitationData {
  invitation: {
    id: string
    email: string
    role: string
    personalMessage?: string
    expiresAt: string
  }
  organization: {
    id: string
    name: string
    slug: string
  }
  team?: {
    id: string
    name: string
  }
  invitedBy?: {
    full_name: string
  }
  hasExistingAccount: boolean
}

export default function InviteAcceptPage() {
  const params = useParams()
  const router = useRouter()
  const token = params?.token as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [inviteData, setInviteData] = useState<InvitationData | null>(null)

  // Form fields
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [jobTitle, setJobTitle] = useState('')

  // Password validation
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)
  const passwordsMatch = password === confirmPassword && password.length > 0
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial

  // Fetch invitation data
  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/invitations/${token}`)
        const data = await res.json()

        if (!data.success) {
          setError(data.error?.message || 'Invalid invitation')
          return
        }

        setInviteData(data.data)
      } catch {
        setError('Failed to load invitation')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchInvitation()
    }
  }, [token])

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      // For existing users, just need to accept
      // For new users, need to create account
      const payload: Record<string, string> = {}

      if (!inviteData?.hasExistingAccount) {
        if (!isPasswordValid) {
          throw new Error('Please meet all password requirements')
        }
        if (!passwordsMatch) {
          throw new Error('Passwords do not match')
        }
        payload.fullName = fullName
        payload.password = password
        if (jobTitle) payload.jobTitle = jobTitle
      }

      const res = await fetch(`/api/invitations/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to accept invitation')
      }

      setSuccess(true)

      // Redirect to login/dashboard after 2 seconds
      setTimeout(() => {
        if (inviteData?.hasExistingAccount) {
          router.push('/login?message=Added to organization. Please log in.')
        } else {
          router.push('/login?message=Account created. Please log in.')
        }
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invitation')
    } finally {
      setSubmitting(false)
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'org_admin':
        return 'Organization Admin'
      case 'team_lead':
        return 'Team Lead'
      case 'member':
        return 'Team Member'
      default:
        return role
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg font-diatype">Loading invitation...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !inviteData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 font-gendy">
            Invalid Invitation
          </h1>
          <p className="text-gray-400 font-diatype mb-6">{error}</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all font-diatype"
          >
            Go to Login
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center"
        >
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 font-gendy">
            Welcome to {inviteData?.organization.name}!
          </h1>
          <p className="text-gray-400 font-diatype mb-4">
            {inviteData?.hasExistingAccount
              ? 'You have been added to the organization.'
              : 'Your account has been created successfully.'}
          </p>
          <p className="text-sm text-gray-500 font-diatype">
            Redirecting to login...
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.1),transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(59,130,246,0.08),transparent_50%)]" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          {/* Logo */}
          <Link href="/" className="flex justify-center mb-8">
            <Image
              src="/HumnaGlue_logo_white_blue.png"
              alt="HumanGlue"
              width={180}
              height={50}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Invitation Card */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-7 h-7 text-cyan-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2 font-gendy">
                You're Invited!
              </h1>
              <p className="text-gray-400 font-diatype">
                {inviteData?.invitedBy?.full_name || 'Someone'} has invited you to join
              </p>
              <p className="text-lg text-white font-semibold font-gendy mt-1">
                {inviteData?.organization.name}
              </p>
            </div>

            {/* Invitation Details */}
            <div className="space-y-3 mb-6 p-4 bg-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-400 font-diatype">
                  {inviteData?.invitation.email}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-400 font-diatype">
                  Role: {getRoleLabel(inviteData?.invitation.role || 'member')}
                </span>
              </div>
              {inviteData?.team && (
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-400 font-diatype">
                    Team: {inviteData.team.name}
                  </span>
                </div>
              )}
            </div>

            {/* Personal Message */}
            {inviteData?.invitation.personalMessage && (
              <div className="mb-6 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                <p className="text-sm text-gray-300 italic font-diatype">
                  "{inviteData.invitation.personalMessage}"
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-diatype">
                {error}
              </div>
            )}

            {/* Form for new users */}
            {!inviteData?.hasExistingAccount ? (
              <form onSubmit={handleAccept} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype"
                    />
                  </div>
                </div>

                {/* Job Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                    Job Title (optional)
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="Software Engineer"
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                    Create Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      required
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype"
                    />
                  </div>

                  {password && (
                    <div className="mt-3 space-y-1.5">
                      <PasswordRequirement met={hasMinLength} text="At least 8 characters" />
                      <PasswordRequirement met={hasUppercase} text="One uppercase letter" />
                      <PasswordRequirement met={hasLowercase} text="One lowercase letter" />
                      <PasswordRequirement met={hasNumber} text="One number" />
                      <PasswordRequirement met={hasSpecial} text="One special character" />
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype"
                    />
                  </div>
                  {confirmPassword && (
                    <div className="mt-2">
                      <PasswordRequirement met={passwordsMatch} text="Passwords match" />
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || !isPasswordValid || !passwordsMatch || !fullName}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-diatype"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Accept Invitation
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              // Existing user - just accept
              <div className="space-y-4">
                <p className="text-sm text-gray-400 font-diatype text-center">
                  You already have an account with this email. Click below to join the organization.
                </p>
                <button
                  onClick={handleAccept}
                  disabled={submitting}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-diatype"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      Join Organization
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Already have account link */}
            {!inviteData?.hasExistingAccount && (
              <p className="text-center text-sm text-gray-500 mt-6 font-diatype">
                Already have a different account?{' '}
                <Link href="/login" className="text-cyan-400 hover:text-cyan-300">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {met ? (
        <Check className="w-3.5 h-3.5 text-green-400" />
      ) : (
        <X className="w-3.5 h-3.5 text-gray-500" />
      )}
      <span className={met ? 'text-green-400 font-diatype' : 'text-gray-500 font-diatype'}>
        {text}
      </span>
    </div>
  )
}
