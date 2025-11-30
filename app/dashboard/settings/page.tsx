'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Mail,
  Bell,
  Shield,
  CreditCard,
  Users,
  Camera,
  Save,
  Lock,
  Key,
  Smartphone,
  Globe,
  Clock,
  Moon,
  Sun,
  LayoutGrid,
  AlignLeft,
  Check,
  X,
  LogOut,
  Upload,
  UserPlus,
  Crown,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useBilling } from '@/lib/contexts/BillingContext'
import { SubscriptionManager } from '@/components/organisms/SubscriptionManager'
import { PaymentMethodManager } from '@/components/organisms/PaymentMethodManager'
import { PlanChangeModal } from '@/components/organisms/PlanChangeModal'

type TabType = 'profile' | 'preferences' | 'security' | 'billing' | 'team'

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'pending' | 'inactive'
  avatar?: string
  joinedDate: string
}

interface ActiveSession {
  id: string
  device: string
  location: string
  lastActive: string
  current: boolean
}

interface BillingHistory {
  id: string
  date: string
  description: string
  amount: number
  status: 'paid' | 'pending' | 'failed'
}

export default function SettingsPage() {
  const router = useRouter()
  const { setUserData } = useChat()
  const billing = useBilling()
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Profile state
  const [profileData, setProfileData] = useState({
    name: userData?.name || '',
    email: userData?.email || '',
    role: 'Product Manager',
    department: 'Engineering',
    company: 'Acme Corp',
    bio: 'Passionate about digital transformation and AI innovation.',
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('/default-avatar.png')

  // Preferences state
  const [preferences, setPreferences] = useState({
    emailNotifications: {
      assessmentReminders: true,
      courseUpdates: true,
      workshopInvites: true,
    },
    dashboardLayout: 'comfortable' as 'compact' | 'comfortable',
    language: 'en' as 'en' | 'es' | 'fr',
    timezone: 'America/New_York',
    theme: 'dark' as 'dark' | 'light',
  })

  // Security state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [activeSessions] = useState<ActiveSession[]>([
    {
      id: '1',
      device: 'Chrome on MacBook Pro',
      location: 'San Francisco, CA',
      lastActive: '2 minutes ago',
      current: true,
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      location: 'San Francisco, CA',
      lastActive: '3 hours ago',
      current: false,
    },
  ])

  // Billing data now comes from BillingContext

  // Team state
  const [teamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@acme.com',
      role: 'Admin',
      status: 'active',
      joinedDate: '2025-01-15',
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael@acme.com',
      role: 'Member',
      status: 'active',
      joinedDate: '2025-02-20',
    },
    {
      id: '3',
      name: 'Emily Davis',
      email: 'emily@acme.com',
      role: 'Member',
      status: 'pending',
      joinedDate: '2025-10-01',
    },
  ])
  const [inviteEmail, setInviteEmail] = useState('')

  // Authentication check

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  const showSuccessToast = (message: string) => {
    setToastMessage(message)
    setToastType('success')
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const showErrorToast = (message: string) => {
    setToastMessage(message)
    setToastType('error')
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast('Image size must be less than 5MB')
        return
      }
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update user data in context
      setUserData({
        ...userData,
        name: profileData.name,
        email: profileData.email,
        role: profileData.role,
        department: profileData.department,
        company: profileData.company,
        bio: profileData.bio
      })

      // In a real app, this would be an API call like:
      // await fetch('/api/user/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(profileData)
      // })

      showSuccessToast('Profile updated successfully!')
    } catch (error) {
      showErrorToast('Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePreferences = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Save preferences to localStorage
      localStorage.setItem('humanglue_preferences', JSON.stringify(preferences))

      // In a real app:
      // await fetch('/api/user/preferences', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(preferences)
      // })

      showSuccessToast('Preferences saved successfully!')
    } catch (error) {
      showErrorToast('Failed to save preferences. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    const errors: Record<string, string> = {}

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required'
    }
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required'
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters'
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setPasswordErrors(errors)

    if (Object.keys(errors).length === 0) {
      setIsLoading(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // In a real app:
        // await fetch('/api/user/password', {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     currentPassword: passwordData.currentPassword,
        //     newPassword: passwordData.newPassword
        //   })
        // })

        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
        showSuccessToast('Password changed successfully!')
      } catch (error) {
        showErrorToast('Failed to change password. Please verify your current password.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleTerminateSession = async (sessionId: string) => {
    showSuccessToast('Session terminated successfully')
  }

  const handleInviteTeamMember = async () => {
    if (!inviteEmail) {
      showErrorToast('Please enter an email address')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(inviteEmail)) {
      showErrorToast('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real app:
      // await fetch('/api/team/invite', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email: inviteEmail, role: 'member' })
      // })

      setInviteEmail('')
      showSuccessToast('Invitation sent successfully!')
    } catch (error) {
      showErrorToast('Failed to send invitation. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'preferences' as TabType, label: 'Preferences', icon: Bell },
    { id: 'security' as TabType, label: 'Security', icon: Shield },
    { id: 'billing' as TabType, label: 'Billing', icon: CreditCard },
    { id: 'team' as TabType, label: 'Team', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 right-6 z-50"
          >
            <div
              className={`flex items-center gap-3 px-6 py-4 rounded-xl backdrop-blur-xl border shadow-lg ${
                toastType === 'success'
                  ? 'bg-green-500/10 border-green-500/30 text-green-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              {toastType === 'success' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-medium font-diatype">{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - offset by sidebar */}
      <div className="lg:ml-[var(--sidebar-width,280px)] pb-20 lg:pb-0 transition-all">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-8 py-6">
            <h1 className="text-3xl font-bold text-white mb-1 font-gendy">Settings</h1>
            <p className="text-gray-400 font-diatype">
              Manage your account preferences and security
            </p>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Tab Navigation */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id

                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      whileHover={{ x: 4 }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 text-white'
                          : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium font-diatype">{tab.label}</span>
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Profile Tab */}
                  {activeTab === 'profile' && (
                    <div className="space-y-6">
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                        <h2 className="text-xl font-semibold text-white mb-6 font-gendy">
                          Profile Information
                        </h2>

                        {/* Avatar */}
                        <div className="flex items-center gap-6 mb-8">
                          <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold font-gendy overflow-hidden">
                              {avatarPreview ? (
                                <img
                                  src={avatarPreview}
                                  alt="Avatar"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                profileData.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <label
                              htmlFor="avatar-upload"
                              className="absolute bottom-0 right-0 p-2 bg-cyan-600 rounded-full cursor-pointer hover:bg-cyan-700 transition-colors"
                            >
                              <Camera className="w-4 h-4 text-white" />
                              <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                              />
                            </label>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-1 font-gendy">
                              Profile Photo
                            </h3>
                            <p className="text-sm text-gray-400 font-diatype">
                              Upload a new avatar. Max size 5MB.
                            </p>
                          </div>
                        </div>

                        {/* Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={profileData.name}
                              onChange={(e) =>
                                setProfileData({ ...profileData, name: e.target.value })
                              }
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/30 transition-all font-diatype"
                              placeholder="John Doe"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                              Email
                            </label>
                            <input
                              type="email"
                              value={profileData.email}
                              onChange={(e) =>
                                setProfileData({ ...profileData, email: e.target.value })
                              }
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/30 transition-all font-diatype"
                              placeholder="john@example.com"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                              Role
                            </label>
                            <input
                              type="text"
                              value={profileData.role}
                              onChange={(e) =>
                                setProfileData({ ...profileData, role: e.target.value })
                              }
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/30 transition-all font-diatype"
                              placeholder="Product Manager"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                              Department
                            </label>
                            <input
                              type="text"
                              value={profileData.department}
                              onChange={(e) =>
                                setProfileData({ ...profileData, department: e.target.value })
                              }
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/30 transition-all font-diatype"
                              placeholder="Engineering"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                              Company
                            </label>
                            <input
                              type="text"
                              value={profileData.company}
                              onChange={(e) =>
                                setProfileData({ ...profileData, company: e.target.value })
                              }
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/30 transition-all font-diatype"
                              placeholder="Acme Corp"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                              Bio
                            </label>
                            <textarea
                              value={profileData.bio}
                              onChange={(e) =>
                                setProfileData({ ...profileData, bio: e.target.value })
                              }
                              rows={4}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/30 transition-all font-diatype resize-none"
                              placeholder="Tell us about yourself..."
                            />
                          </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end mt-6">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSaveProfile}
                            disabled={isLoading}
                            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all inline-flex items-center gap-2 shadow-lg shadow-cyan-500/50 font-diatype disabled:opacity-50"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-5 h-5" />
                                Save Changes
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preferences Tab */}
                  {activeTab === 'preferences' && (
                    <div className="space-y-6">
                      {/* Email Notifications */}
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                        <h2 className="text-xl font-semibold text-white mb-6 font-gendy">
                          Email Notifications
                        </h2>
                        <div className="space-y-4">
                          {Object.entries(preferences.emailNotifications).map(([key, value]) => (
                            <div
                              key={key}
                              className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                            >
                              <div>
                                <h3 className="text-white font-medium font-diatype">
                                  {key
                                    .replace(/([A-Z])/g, ' $1')
                                    .replace(/^./, (str) => str.toUpperCase())}
                                </h3>
                                <p className="text-sm text-gray-400 font-diatype">
                                  Receive notifications for {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  setPreferences({
                                    ...preferences,
                                    emailNotifications: {
                                      ...preferences.emailNotifications,
                                      [key]: !value,
                                    },
                                  })
                                }
                                className={`relative w-12 h-6 rounded-full transition-colors ${
                                  value ? 'bg-cyan-600' : 'bg-gray-700'
                                }`}
                              >
                                <motion.div
                                  animate={{ x: value ? 24 : 0 }}
                                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                  className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                                />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Dashboard Layout */}
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                        <h2 className="text-xl font-semibold text-white mb-6 font-gendy">
                          Dashboard Layout
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                          {(['compact', 'comfortable'] as const).map((layout) => (
                            <button
                              key={layout}
                              onClick={() =>
                                setPreferences({ ...preferences, dashboardLayout: layout })
                              }
                              className={`p-4 rounded-xl border-2 transition-all ${
                                preferences.dashboardLayout === layout
                                  ? 'border-cyan-500/50 bg-cyan-500/10'
                                  : 'border-white/10 bg-white/5 hover:border-white/20'
                              }`}
                            >
                              <div className="flex items-center gap-3 mb-2">
                                {layout === 'compact' ? (
                                  <LayoutGrid className="w-5 h-5 text-white" />
                                ) : (
                                  <AlignLeft className="w-5 h-5 text-white" />
                                )}
                                <span className="text-white font-medium font-diatype capitalize">
                                  {layout}
                                </span>
                              </div>
                              <p className="text-sm text-gray-400 font-diatype">
                                {layout === 'compact'
                                  ? 'Dense information display'
                                  : 'More spacing and breathing room'}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Language & Timezone */}
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                        <h2 className="text-xl font-semibold text-white mb-6 font-gendy">
                          Localization
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                              <Globe className="w-4 h-4 inline mr-2" />
                              Language
                            </label>
                            <select
                              value={preferences.language}
                              onChange={(e) =>
                                setPreferences({
                                  ...preferences,
                                  language: e.target.value as 'en' | 'es' | 'fr',
                                })
                              }
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/30 transition-all font-diatype"
                            >
                              <option value="en">English</option>
                              <option value="es">Spanish</option>
                              <option value="fr">French</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                              <Clock className="w-4 h-4 inline mr-2" />
                              Timezone
                            </label>
                            <select
                              value={preferences.timezone}
                              onChange={(e) =>
                                setPreferences({ ...preferences, timezone: e.target.value })
                              }
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/30 transition-all font-diatype"
                            >
                              <option value="America/New_York">Eastern Time</option>
                              <option value="America/Chicago">Central Time</option>
                              <option value="America/Denver">Mountain Time</option>
                              <option value="America/Los_Angeles">Pacific Time</option>
                              <option value="Europe/London">London</option>
                              <option value="Europe/Paris">Paris</option>
                              <option value="Asia/Tokyo">Tokyo</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Theme */}
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                        <h2 className="text-xl font-semibold text-white mb-6 font-gendy">Theme</h2>
                        <div className="grid grid-cols-2 gap-4">
                          {(['dark', 'light'] as const).map((theme) => (
                            <button
                              key={theme}
                              onClick={() => setPreferences({ ...preferences, theme })}
                              disabled={theme === 'light'}
                              className={`p-4 rounded-xl border-2 transition-all ${
                                preferences.theme === theme
                                  ? 'border-cyan-500/50 bg-cyan-500/10'
                                  : 'border-white/10 bg-white/5 hover:border-white/20'
                              } ${theme === 'light' && 'opacity-50 cursor-not-allowed'}`}
                            >
                              <div className="flex items-center gap-3 mb-2">
                                {theme === 'dark' ? (
                                  <Moon className="w-5 h-5 text-white" />
                                ) : (
                                  <Sun className="w-5 h-5 text-white" />
                                )}
                                <span className="text-white font-medium font-diatype capitalize">
                                  {theme}
                                </span>
                                {theme === 'light' && (
                                  <span className="ml-auto text-xs text-gray-500 font-diatype">
                                    Coming Soon
                                  </span>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Save Button */}
                      <div className="flex justify-end">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSavePreferences}
                          disabled={isLoading}
                          className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all inline-flex items-center gap-2 shadow-lg shadow-cyan-500/50 font-diatype disabled:opacity-50"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-5 h-5" />
                              Save Preferences
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  )}

                  {/* Security Tab */}
                  {activeTab === 'security' && (
                    <div className="space-y-6">
                      {/* Change Password */}
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                        <h2 className="text-xl font-semibold text-white mb-6 font-gendy">
                          Change Password
                        </h2>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                              Current Password
                            </label>
                            <input
                              type="password"
                              value={passwordData.currentPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  currentPassword: e.target.value,
                                })
                              }
                              className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all font-diatype ${
                                passwordErrors.currentPassword
                                  ? 'border-red-500/30 focus:border-red-500/50'
                                  : 'border-white/10 focus:border-cyan-500/30'
                              }`}
                            />
                            {passwordErrors.currentPassword && (
                              <p className="text-red-400 text-sm mt-1 font-diatype">
                                {passwordErrors.currentPassword}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                              New Password
                            </label>
                            <input
                              type="password"
                              value={passwordData.newPassword}
                              onChange={(e) =>
                                setPasswordData({ ...passwordData, newPassword: e.target.value })
                              }
                              className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all font-diatype ${
                                passwordErrors.newPassword
                                  ? 'border-red-500/30 focus:border-red-500/50'
                                  : 'border-white/10 focus:border-cyan-500/30'
                              }`}
                            />
                            {passwordErrors.newPassword && (
                              <p className="text-red-400 text-sm mt-1 font-diatype">
                                {passwordErrors.newPassword}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              value={passwordData.confirmPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  confirmPassword: e.target.value,
                                })
                              }
                              className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all font-diatype ${
                                passwordErrors.confirmPassword
                                  ? 'border-red-500/30 focus:border-red-500/50'
                                  : 'border-white/10 focus:border-cyan-500/30'
                              }`}
                            />
                            {passwordErrors.confirmPassword && (
                              <p className="text-red-400 text-sm mt-1 font-diatype">
                                {passwordErrors.confirmPassword}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end mt-6">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleChangePassword}
                            disabled={isLoading}
                            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all inline-flex items-center gap-2 shadow-lg shadow-cyan-500/50 font-diatype disabled:opacity-50"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <Key className="w-5 h-5" />
                                Update Password
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>

                      {/* Two-Factor Authentication */}
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h2 className="text-xl font-semibold text-white mb-2 font-gendy">
                              Two-Factor Authentication
                            </h2>
                            <p className="text-gray-400 mb-4 font-diatype">
                              Add an extra layer of security to your account
                            </p>
                          </div>
                          <button
                            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              twoFactorEnabled ? 'bg-cyan-600' : 'bg-gray-700'
                            }`}
                          >
                            <motion.div
                              animate={{ x: twoFactorEnabled ? 24 : 0 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                              className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                            />
                          </button>
                        </div>
                        {twoFactorEnabled && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl"
                          >
                            <div className="flex items-center gap-2 text-green-400">
                              <CheckCircle2 className="w-5 h-5" />
                              <span className="font-medium font-diatype">
                                Two-factor authentication is enabled
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Active Sessions */}
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                        <h2 className="text-xl font-semibold text-white mb-6 font-gendy">
                          Active Sessions
                        </h2>
                        <div className="space-y-4">
                          {activeSessions.map((session) => (
                            <div
                              key={session.id}
                              className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                            >
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-cyan-500/10 rounded-lg">
                                  <Smartphone className="w-5 h-5 text-cyan-400" />
                                </div>
                                <div>
                                  <h3 className="text-white font-medium font-diatype">
                                    {session.device}
                                  </h3>
                                  <p className="text-sm text-gray-400 font-diatype">
                                    {session.location}
                                  </p>
                                  <p className="text-xs text-gray-500 font-diatype">
                                    Last active: {session.lastActive}
                                  </p>
                                </div>
                              </div>
                              {session.current ? (
                                <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold rounded-full font-diatype">
                                  Current
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleTerminateSession(session.id)}
                                  className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-full hover:bg-red-500/20 transition-all font-diatype"
                                >
                                  Terminate
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Connected Accounts */}
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                        <h2 className="text-xl font-semibold text-white mb-6 font-gendy">
                          Connected Accounts
                        </h2>
                        <div className="space-y-4">
                          {['Google', 'Microsoft'].map((provider) => (
                            <div
                              key={provider}
                              className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/10 rounded-lg">
                                  <Mail className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-white font-medium font-diatype">
                                  {provider}
                                </span>
                              </div>
                              <button className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all font-diatype text-sm">
                                Connect
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Billing Tab */}
                  {activeTab === 'billing' && (
                    <SubscriptionManager
                      onUpgradeClick={() => setShowUpgradeModal(true)}
                      onManagePayment={() => {
                        // Could open a payment management modal or navigate to separate page
                        router.push('/dashboard/account')
                      }}
                    />
                  )}

                  {/* Team Tab */}
                  {activeTab === 'team' && (
                    <div className="space-y-6">
                      {/* Invite Member */}
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                        <h2 className="text-xl font-semibold text-white mb-6 font-gendy">
                          Invite Team Member
                        </h2>
                        <div className="flex gap-4">
                          <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="colleague@company.com"
                            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/30 transition-all font-diatype"
                          />
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleInviteTeamMember}
                            disabled={isLoading}
                            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all inline-flex items-center gap-2 shadow-lg shadow-cyan-500/50 font-diatype disabled:opacity-50"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-5 h-5" />
                                Send Invite
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>

                      {/* Team Members List */}
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                        <h2 className="text-xl font-semibold text-white mb-6 font-gendy">
                          Team Members ({teamMembers.length})
                        </h2>
                        <div className="space-y-4">
                          {teamMembers.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold font-gendy">
                                  {member.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="text-white font-medium font-diatype">
                                    {member.name}
                                  </div>
                                  <div className="text-sm text-gray-400 font-diatype">
                                    {member.email}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold rounded-full font-diatype">
                                  {member.role}
                                </span>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold font-diatype ${
                                    member.status === 'active'
                                      ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                                      : member.status === 'pending'
                                      ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                                      : 'bg-gray-500/10 border border-gray-500/20 text-gray-400'
                                  }`}
                                >
                                  {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pending Invitations */}
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                        <h2 className="text-xl font-semibold text-white mb-6 font-gendy">
                          Pending Invitations
                        </h2>
                        <div className="text-center py-8">
                          <Mail className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                          <p className="text-gray-400 font-diatype">No pending invitations</p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Change Modal */}
      <PlanChangeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  )
}
