'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings,
  User,
  Bell,
  Shield,
  CreditCard,
  BookOpen,
  Lock,
  Mail,
  Phone,
  Globe,
  MapPin,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Download,
  Trash2,
  Save,
  X,
  Monitor,
  Smartphone,
  ChevronRight,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'
import { cn } from '@/utils/cn'

// Mock initial settings
const MOCK_SETTINGS = {
  general: {
    displayName: 'Dr. Sarah Mitchell',
    email: 'sarah.mitchell@example.com',
    emailVerified: true,
    phone: '+1 (555) 123-4567',
    phoneVerified: false,
    language: 'en',
    timezone: 'America/New_York',
  },
  notifications: {
    emailNotifications: {
      newEnrollments: true,
      comments: true,
      messages: true,
      reviews: true,
      courseUpdates: false,
    },
    smsNotifications: false,
    pushNotifications: true,
    frequency: 'instant' as 'instant' | 'daily' | 'weekly',
  },
  privacy: {
    profileVisibility: 'public' as 'public' | 'students' | 'private',
    showEmail: false,
    showPhone: false,
    displayStudentCount: true,
  },
  payment: {
    paymentMethod: 'stripe' as 'stripe' | 'paypal',
    payoutSchedule: 'monthly' as 'weekly' | 'monthly',
    taxInfoCompleted: true,
    minimumPayout: 100,
  },
  teaching: {
    autoApproveEnrollments: true,
    allowQA: true,
    allowReviews: true,
    requireCertificates: true,
  },
  security: {
    twoFactorEnabled: false,
    activeSessions: [
      { device: 'MacBook Pro', location: 'New York, US', lastActive: '2 minutes ago', current: true },
      { device: 'iPhone 14', location: 'New York, US', lastActive: '1 hour ago', current: false },
    ],
  },
}

type TabType = 'general' | 'notifications' | 'privacy' | 'payment' | 'teaching' | 'security'

export default function InstructorSettingsPage() {
  const router = useRouter()
  const { userData } = useChat()
  const [activeTab, setActiveTab] = useState<TabType>('general')
  const [settings, setSettings] = useState(MOCK_SETTINGS)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  })

  useEffect(() => {
    if (!userData?.isInstructor) {
      router.push('/login')
    }
  }, [userData, router])

  if (!userData?.isInstructor) {
    return null
  }

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  const updateSettings = (section: keyof typeof settings, updates: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates },
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSaving(false)
    setHasChanges(false)
    showSuccessToast('Settings saved successfully!')
  }

  const handleCancel = () => {
    setSettings(MOCK_SETTINGS)
    setHasChanges(false)
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

  const handleChangePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      showErrorToast('New passwords do not match')
      return
    }
    if (passwordForm.new.length < 8) {
      showErrorToast('Password must be at least 8 characters')
      return
    }
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setPasswordForm({ current: '', new: '', confirm: '' })
    showSuccessToast('Password changed successfully!')
  }

  const handleDownloadData = () => {
    showSuccessToast('Preparing your data download...')
  }

  const handleTerminateSession = (device: string) => {
    showSuccessToast(`Session on ${device} terminated`)
  }

  const tabs = [
    { id: 'general' as TabType, label: 'General', icon: User },
    { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
    { id: 'privacy' as TabType, label: 'Privacy', icon: Shield },
    { id: 'payment' as TabType, label: 'Payment', icon: CreditCard },
    { id: 'teaching' as TabType, label: 'Teaching', icon: BookOpen },
    { id: 'security' as TabType, label: 'Security', icon: Lock },
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="ml-[280px] transition-all duration-300">
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2 font-gendy">Instructor Settings</h1>
              <p className="text-gray-400 font-diatype">Manage your account preferences and settings</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 rounded-xl font-medium font-diatype transition-all whitespace-nowrap",
                      isActive
                        ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-white"
                        : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </motion.button>
                )
              })}
            </div>

            {/* Tab Content */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <AnimatePresence mode="wait">
                {activeTab === 'general' && (
                  <motion.div
                    key="general"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-6 font-gendy">General Settings</h3>

                      {/* Display Name */}
                      <div className="mb-6">
                        <label className="text-sm text-gray-400 mb-2 block font-diatype">Display Name</label>
                        <input
                          type="text"
                          value={settings.general.displayName}
                          onChange={(e) => updateSettings('general', { displayName: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white font-diatype"
                        />
                      </div>

                      {/* Email */}
                      <div className="mb-6">
                        <label className="text-sm text-gray-400 mb-2 block font-diatype">Email Address</label>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="email"
                              value={settings.general.email}
                              onChange={(e) => updateSettings('general', { email: e.target.value })}
                              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white font-diatype"
                            />
                          </div>
                          {settings.general.emailVerified ? (
                            <div className="flex items-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-300">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-diatype">Verified</span>
                            </div>
                          ) : (
                            <button className="px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-300 hover:bg-blue-500/20 transition-all font-diatype">
                              Verify Email
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="mb-6">
                        <label className="text-sm text-gray-400 mb-2 block font-diatype">Phone Number</label>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="tel"
                              value={settings.general.phone}
                              onChange={(e) => updateSettings('general', { phone: e.target.value })}
                              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white font-diatype"
                            />
                          </div>
                          {settings.general.phoneVerified ? (
                            <div className="flex items-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-300">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-diatype">Verified</span>
                            </div>
                          ) : (
                            <button className="px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-300 hover:bg-blue-500/20 transition-all font-diatype">
                              Verify Phone
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Language */}
                      <div className="mb-6">
                        <label className="text-sm text-gray-400 mb-2 block font-diatype">Preferred Language</label>
                        <div className="relative">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <select
                            value={settings.general.language}
                            onChange={(e) => updateSettings('general', { language: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white font-diatype appearance-none"
                          >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                            <option value="zh">Chinese</option>
                          </select>
                          <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rotate-90" />
                        </div>
                      </div>

                      {/* Timezone */}
                      <div className="mb-6">
                        <label className="text-sm text-gray-400 mb-2 block font-diatype">Time Zone</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <select
                            value={settings.general.timezone}
                            onChange={(e) => updateSettings('general', { timezone: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white font-diatype appearance-none"
                          >
                            <option value="America/New_York">Eastern Time (ET)</option>
                            <option value="America/Chicago">Central Time (CT)</option>
                            <option value="America/Denver">Mountain Time (MT)</option>
                            <option value="America/Los_Angeles">Pacific Time (PT)</option>
                            <option value="Europe/London">London (GMT)</option>
                            <option value="Europe/Paris">Paris (CET)</option>
                            <option value="Asia/Tokyo">Tokyo (JST)</option>
                          </select>
                          <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rotate-90" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'notifications' && (
                  <motion.div
                    key="notifications"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-6 font-gendy">Notification Preferences</h3>

                      {/* Email Notifications */}
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold text-white mb-4 font-diatype">Email Notifications</h4>
                        <div className="space-y-3">
                          {Object.entries({
                            newEnrollments: 'New student enrollments',
                            comments: 'New comments on courses',
                            messages: 'Direct messages from students',
                            reviews: 'New course reviews',
                            courseUpdates: 'Course update reminders',
                          }).map(([key, label]) => (
                            <label key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                              <span className="text-gray-300 font-diatype">{label}</span>
                              <div
                                onClick={() => updateSettings('notifications', {
                                  emailNotifications: {
                                    ...settings.notifications.emailNotifications,
                                    [key]: !settings.notifications.emailNotifications[key as keyof typeof settings.notifications.emailNotifications],
                                  },
                                })}
                                className={cn(
                                  "relative w-12 h-6 rounded-full transition-all cursor-pointer",
                                  settings.notifications.emailNotifications[key as keyof typeof settings.notifications.emailNotifications]
                                    ? "bg-purple-500"
                                    : "bg-gray-700"
                                )}
                              >
                                <div
                                  className={cn(
                                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                    settings.notifications.emailNotifications[key as keyof typeof settings.notifications.emailNotifications]
                                      ? "left-7"
                                      : "left-1"
                                  )}
                                />
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* SMS Notifications */}
                      <div className="mb-8">
                        <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                          <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-purple-400" />
                            <div>
                              <span className="text-white font-semibold block font-diatype">SMS Notifications</span>
                              <span className="text-sm text-gray-400 font-diatype">Receive text messages for important updates</span>
                            </div>
                          </div>
                          <div
                            onClick={() => updateSettings('notifications', {
                              smsNotifications: !settings.notifications.smsNotifications,
                            })}
                            className={cn(
                              "relative w-12 h-6 rounded-full transition-all cursor-pointer",
                              settings.notifications.smsNotifications ? "bg-purple-500" : "bg-gray-700"
                            )}
                          >
                            <div
                              className={cn(
                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                settings.notifications.smsNotifications ? "left-7" : "left-1"
                              )}
                            />
                          </div>
                        </label>
                      </div>

                      {/* Push Notifications */}
                      <div className="mb-8">
                        <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                          <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-blue-400" />
                            <div>
                              <span className="text-white font-semibold block font-diatype">Push Notifications</span>
                              <span className="text-sm text-gray-400 font-diatype">Receive browser notifications</span>
                            </div>
                          </div>
                          <div
                            onClick={() => updateSettings('notifications', {
                              pushNotifications: !settings.notifications.pushNotifications,
                            })}
                            className={cn(
                              "relative w-12 h-6 rounded-full transition-all cursor-pointer",
                              settings.notifications.pushNotifications ? "bg-purple-500" : "bg-gray-700"
                            )}
                          >
                            <div
                              className={cn(
                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                settings.notifications.pushNotifications ? "left-7" : "left-1"
                              )}
                            />
                          </div>
                        </label>
                      </div>

                      {/* Notification Frequency */}
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block font-diatype">Notification Frequency</label>
                        <div className="grid grid-cols-3 gap-3">
                          {(['instant', 'daily', 'weekly'] as const).map((freq) => (
                            <button
                              key={freq}
                              onClick={() => updateSettings('notifications', { frequency: freq })}
                              className={cn(
                                "px-6 py-3 rounded-lg font-medium font-diatype transition-all",
                                settings.notifications.frequency === freq
                                  ? "bg-purple-500 text-white"
                                  : "bg-white/5 text-gray-400 hover:bg-white/10"
                              )}
                            >
                              {freq.charAt(0).toUpperCase() + freq.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'privacy' && (
                  <motion.div
                    key="privacy"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-6 font-gendy">Privacy Settings</h3>

                      {/* Profile Visibility */}
                      <div className="mb-8">
                        <label className="text-sm text-gray-400 mb-2 block font-diatype">Profile Visibility</label>
                        <div className="grid grid-cols-3 gap-3">
                          {([
                            { value: 'public', label: 'Public', desc: 'Anyone can see' },
                            { value: 'students', label: 'Students Only', desc: 'Only enrolled students' },
                            { value: 'private', label: 'Private', desc: 'Hidden profile' },
                          ] as const).map((option) => (
                            <button
                              key={option.value}
                              onClick={() => updateSettings('privacy', { profileVisibility: option.value })}
                              className={cn(
                                "p-4 rounded-xl font-medium font-diatype transition-all text-left",
                                settings.privacy.profileVisibility === option.value
                                  ? "bg-purple-500/20 border-2 border-purple-500 text-white"
                                  : "bg-white/5 border-2 border-white/10 text-gray-400 hover:bg-white/10"
                              )}
                            >
                              <div className="font-semibold mb-1">{option.label}</div>
                              <div className="text-xs opacity-70">{option.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Privacy Toggles */}
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                          <span className="text-gray-300 font-diatype">Show email address to students</span>
                          <div
                            onClick={() => updateSettings('privacy', { showEmail: !settings.privacy.showEmail })}
                            className={cn(
                              "relative w-12 h-6 rounded-full transition-all cursor-pointer",
                              settings.privacy.showEmail ? "bg-purple-500" : "bg-gray-700"
                            )}
                          >
                            <div
                              className={cn(
                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                settings.privacy.showEmail ? "left-7" : "left-1"
                              )}
                            />
                          </div>
                        </label>

                        <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                          <span className="text-gray-300 font-diatype">Show phone number to students</span>
                          <div
                            onClick={() => updateSettings('privacy', { showPhone: !settings.privacy.showPhone })}
                            className={cn(
                              "relative w-12 h-6 rounded-full transition-all cursor-pointer",
                              settings.privacy.showPhone ? "bg-purple-500" : "bg-gray-700"
                            )}
                          >
                            <div
                              className={cn(
                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                settings.privacy.showPhone ? "left-7" : "left-1"
                              )}
                            />
                          </div>
                        </label>

                        <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                          <span className="text-gray-300 font-diatype">Display student count publicly</span>
                          <div
                            onClick={() => updateSettings('privacy', { displayStudentCount: !settings.privacy.displayStudentCount })}
                            className={cn(
                              "relative w-12 h-6 rounded-full transition-all cursor-pointer",
                              settings.privacy.displayStudentCount ? "bg-purple-500" : "bg-gray-700"
                            )}
                          >
                            <div
                              className={cn(
                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                settings.privacy.displayStudentCount ? "left-7" : "left-1"
                              )}
                            />
                          </div>
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'payment' && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-6 font-gendy">Payment Settings</h3>

                      {/* Payment Method */}
                      <div className="mb-8">
                        <label className="text-sm text-gray-400 mb-2 block font-diatype">Payment Method</label>
                        <div className="grid grid-cols-2 gap-3">
                          {(['stripe', 'paypal'] as const).map((method) => (
                            <button
                              key={method}
                              onClick={() => updateSettings('payment', { paymentMethod: method })}
                              className={cn(
                                "p-4 rounded-xl font-medium font-diatype transition-all",
                                settings.payment.paymentMethod === method
                                  ? "bg-purple-500/20 border-2 border-purple-500 text-white"
                                  : "bg-white/5 border-2 border-white/10 text-gray-400 hover:bg-white/10"
                              )}
                            >
                              {method.charAt(0).toUpperCase() + method.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Payout Schedule */}
                      <div className="mb-8">
                        <label className="text-sm text-gray-400 mb-2 block font-diatype">Payout Schedule</label>
                        <div className="grid grid-cols-2 gap-3">
                          {(['weekly', 'monthly'] as const).map((schedule) => (
                            <button
                              key={schedule}
                              onClick={() => updateSettings('payment', { payoutSchedule: schedule })}
                              className={cn(
                                "p-4 rounded-xl font-medium font-diatype transition-all",
                                settings.payment.payoutSchedule === schedule
                                  ? "bg-purple-500/20 border-2 border-purple-500 text-white"
                                  : "bg-white/5 border-2 border-white/10 text-gray-400 hover:bg-white/10"
                              )}
                            >
                              {schedule.charAt(0).toUpperCase() + schedule.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Tax Information */}
                      <div className="mb-8 p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-semibold mb-1 font-diatype">Tax Information</h4>
                            <p className="text-sm text-gray-400 font-diatype">Required for payouts</p>
                          </div>
                          {settings.payment.taxInfoCompleted ? (
                            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-300">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-diatype">Completed</span>
                            </div>
                          ) : (
                            <button className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-300 hover:bg-amber-500/20 transition-all font-diatype">
                              Complete Now
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Minimum Payout */}
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block font-diatype">Minimum Payout Threshold</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-diatype">$</span>
                          <input
                            type="number"
                            value={settings.payment.minimumPayout}
                            onChange={(e) => updateSettings('payment', { minimumPayout: parseInt(e.target.value) })}
                            className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white font-diatype"
                            min="50"
                            max="1000"
                            step="50"
                          />
                        </div>
                        <p className="text-sm text-gray-500 mt-2 font-diatype">Payouts will be processed when your balance reaches this amount</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'teaching' && (
                  <motion.div
                    key="teaching"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-6 font-gendy">Teaching Preferences</h3>

                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                          <div>
                            <span className="text-white font-semibold block font-diatype">Auto-approve student enrollments</span>
                            <span className="text-sm text-gray-400 font-diatype">Students can enroll without approval</span>
                          </div>
                          <div
                            onClick={() => updateSettings('teaching', { autoApproveEnrollments: !settings.teaching.autoApproveEnrollments })}
                            className={cn(
                              "relative w-12 h-6 rounded-full transition-all cursor-pointer",
                              settings.teaching.autoApproveEnrollments ? "bg-purple-500" : "bg-gray-700"
                            )}
                          >
                            <div
                              className={cn(
                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                settings.teaching.autoApproveEnrollments ? "left-7" : "left-1"
                              )}
                            />
                          </div>
                        </label>

                        <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                          <div>
                            <span className="text-white font-semibold block font-diatype">Allow Q&A in courses</span>
                            <span className="text-sm text-gray-400 font-diatype">Students can ask questions on lessons</span>
                          </div>
                          <div
                            onClick={() => updateSettings('teaching', { allowQA: !settings.teaching.allowQA })}
                            className={cn(
                              "relative w-12 h-6 rounded-full transition-all cursor-pointer",
                              settings.teaching.allowQA ? "bg-purple-500" : "bg-gray-700"
                            )}
                          >
                            <div
                              className={cn(
                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                settings.teaching.allowQA ? "left-7" : "left-1"
                              )}
                            />
                          </div>
                        </label>

                        <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                          <div>
                            <span className="text-white font-semibold block font-diatype">Allow course reviews</span>
                            <span className="text-sm text-gray-400 font-diatype">Students can leave ratings and reviews</span>
                          </div>
                          <div
                            onClick={() => updateSettings('teaching', { allowReviews: !settings.teaching.allowReviews })}
                            className={cn(
                              "relative w-12 h-6 rounded-full transition-all cursor-pointer",
                              settings.teaching.allowReviews ? "bg-purple-500" : "bg-gray-700"
                            )}
                          >
                            <div
                              className={cn(
                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                settings.teaching.allowReviews ? "left-7" : "left-1"
                              )}
                            />
                          </div>
                        </label>

                        <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                          <div>
                            <span className="text-white font-semibold block font-diatype">Require completion certificates</span>
                            <span className="text-sm text-gray-400 font-diatype">Issue certificates when students complete courses</span>
                          </div>
                          <div
                            onClick={() => updateSettings('teaching', { requireCertificates: !settings.teaching.requireCertificates })}
                            className={cn(
                              "relative w-12 h-6 rounded-full transition-all cursor-pointer",
                              settings.teaching.requireCertificates ? "bg-purple-500" : "bg-gray-700"
                            )}
                          >
                            <div
                              className={cn(
                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                settings.teaching.requireCertificates ? "left-7" : "left-1"
                              )}
                            />
                          </div>
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'security' && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-6 font-gendy">Account Security</h3>

                      {/* Change Password */}
                      <div className="mb-8 p-6 bg-white/5 rounded-xl">
                        <h4 className="text-lg font-semibold text-white mb-4 font-diatype">Change Password</h4>
                        <div className="space-y-4">
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={passwordForm.current}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, current: e.target.value }))}
                              placeholder="Current password"
                              className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/20 rounded-lg text-white font-diatype"
                            />
                            <button
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={passwordForm.new}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, new: e.target.value }))}
                              placeholder="New password"
                              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white font-diatype"
                            />
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={passwordForm.confirm}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
                              placeholder="Confirm new password"
                              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white font-diatype"
                            />
                          </div>
                          <button
                            onClick={handleChangePassword}
                            className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all font-semibold font-diatype"
                          >
                            Update Password
                          </button>
                        </div>
                      </div>

                      {/* Two-Factor Authentication */}
                      <div className="mb-8 p-6 bg-white/5 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-white font-diatype">Two-Factor Authentication</h4>
                            <p className="text-sm text-gray-400 font-diatype">Add an extra layer of security</p>
                          </div>
                          <div
                            onClick={() => updateSettings('security', { twoFactorEnabled: !settings.security.twoFactorEnabled })}
                            className={cn(
                              "relative w-12 h-6 rounded-full transition-all cursor-pointer",
                              settings.security.twoFactorEnabled ? "bg-green-500" : "bg-gray-700"
                            )}
                          >
                            <div
                              className={cn(
                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                settings.security.twoFactorEnabled ? "left-7" : "left-1"
                              )}
                            />
                          </div>
                        </div>
                        {settings.security.twoFactorEnabled && (
                          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <div className="flex items-center gap-2 text-green-300">
                              <CheckCircle className="w-5 h-5" />
                              <span className="font-medium font-diatype">Two-factor authentication is enabled</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Active Sessions */}
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold text-white mb-4 font-diatype">Active Sessions</h4>
                        <div className="space-y-3">
                          {settings.security.activeSessions.map((session, index) => (
                            <div key={index} className="p-4 bg-white/5 rounded-xl flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-500/10 rounded-lg">
                                  {session.device.includes('Mac') || session.device.includes('Windows') ? (
                                    <Monitor className="w-5 h-5 text-purple-400" />
                                  ) : (
                                    <Smartphone className="w-5 h-5 text-purple-400" />
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-white font-semibold font-diatype">{session.device}</span>
                                    {session.current && (
                                      <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full text-xs text-green-300 font-diatype">
                                        Current
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-400 font-diatype">{session.location}</p>
                                  <p className="text-xs text-gray-500 font-diatype">Last active: {session.lastActive}</p>
                                </div>
                              </div>
                              {!session.current && (
                                <button
                                  onClick={() => handleTerminateSession(session.device)}
                                  className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 hover:bg-red-500/20 transition-all text-sm font-diatype"
                                >
                                  Terminate
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Data Download */}
                      <div className="p-6 bg-white/5 rounded-xl">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-white mb-1 font-diatype">Download Your Data</h4>
                            <p className="text-sm text-gray-400 font-diatype">Get a copy of all your account data</p>
                          </div>
                          <button
                            onClick={handleDownloadData}
                            className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-300 hover:bg-blue-500/20 transition-all flex items-center gap-2 font-diatype"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Save/Cancel Bar */}
            <AnimatePresence>
              {hasChanges && (
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
                >
                  <div className="bg-gray-900 border border-white/20 rounded-2xl shadow-2xl p-4 flex items-center gap-4">
                    <div className="flex items-center gap-2 text-amber-400">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                      <span className="font-medium font-diatype">Unsaved changes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCancel}
                        className="px-6 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 font-diatype"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold flex items-center gap-2 font-diatype disabled:opacity-50"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Changes
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toast Notification */}
            <AnimatePresence>
              {showToast && (
                <motion.div
                  initial={{ x: 400, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 400, opacity: 0 }}
                  className="fixed top-8 right-8 z-50"
                >
                  <div className={cn(
                    "px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3",
                    toastType === 'success' ? "bg-green-500 text-white" : "bg-red-500 text-white"
                  )}>
                    {toastType === 'success' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    <span className="font-medium font-diatype">{toastMessage}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
