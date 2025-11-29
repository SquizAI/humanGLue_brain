'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Mail, Video, Calendar, DollarSign, Save } from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useRouter } from 'next/navigation'

// Trust middleware protection - no need for client-side auth checks
// Middleware already validates access before page loads

export default function ExpertSettingsPage() {
  const router = useRouter()
  const [hasChanges, setHasChanges] = useState(false)
  const [settings, setSettings] = useState({
    notifications: {
      email: {
        newBooking: true,
        sessionReminder: true,
        paymentReceived: true,
        clientMessage: true,
        weeklyReport: false
      },
      push: {
        newBooking: true,
        sessionReminder: true,
        paymentReceived: false,
        clientMessage: true
      }
    },
    session: {
      autoApproveBookings: true,
      requireBookingApproval: false,
      allowSameDayBooking: false,
      maxBookingsPerDay: 4,
      sessionBuffer: 15,
      defaultDuration: 60
    },
    payments: {
      currency: 'USD',
      payoutSchedule: 'monthly',
      minimumPayout: 100,
      taxId: '***-**-1234'
    },
    privacy: {
      showOnMarketplace: true,
      allowClientReviews: true,
      showSessionCount: true,
      showRating: true,
      profileVisibility: 'public'
    }
  })

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
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

  const updateSetting = (category: string, subcategory: string | null, field: string, value: any) => {
    setSettings(prev => {
      if (subcategory) {
        return {
          ...prev,
          [category]: {
            ...prev[category as keyof typeof prev],
            [subcategory]: {
              ...(prev[category as keyof typeof prev] as any)[subcategory],
              [field]: value
            }
          }
        }
      } else {
        return {
          ...prev,
          [category]: {
            ...prev[category as keyof typeof prev],
            [field]: value
          }
        }
      }
    })
    setHasChanges(true)
  }

  const saveSettings = () => {
    // TODO: API call to save settings
    console.log('Saving settings:', settings)
    setHasChanges(false)
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 font-gendy">Settings</h1>
              <p className="text-gray-400 font-diatype">Manage your expert portal preferences</p>
            </div>
            {hasChanges && (
              <button
                onClick={saveSettings}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all font-diatype flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* Notifications */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-6 font-gendy flex items-center gap-2">
                <Bell className="w-6 h-6" />
                Notifications
              </h2>

              <div className="space-y-6">
                {/* Email Notifications */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 font-gendy flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Email Notifications
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(settings.notifications.email).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                        <span className="text-gray-300 font-diatype">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => updateSetting('notifications', 'email', key, e.target.checked)}
                          className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500/50"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Push Notifications */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 font-gendy flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Push Notifications
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(settings.notifications.push).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                        <span className="text-gray-300 font-diatype">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => updateSetting('notifications', 'push', key, e.target.checked)}
                          className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500/50"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Session Settings */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-6 font-gendy flex items-center gap-2">
                <Video className="w-6 h-6" />
                Session Settings
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                    Default Session Duration
                  </label>
                  <select
                    value={settings.session.defaultDuration}
                    onChange={(e) => updateSetting('session', null, 'defaultDuration', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-diatype"
                  >
                    <option value="30">30 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="90">90 minutes</option>
                    <option value="120">120 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                    Buffer Between Sessions
                  </label>
                  <select
                    value={settings.session.sessionBuffer}
                    onChange={(e) => updateSetting('session', null, 'sessionBuffer', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-diatype"
                  >
                    <option value="0">No buffer</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">60 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                    Max Bookings Per Day
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.session.maxBookingsPerDay}
                    onChange={(e) => updateSetting('session', null, 'maxBookingsPerDay', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-diatype"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-gray-300 font-diatype">Auto-approve bookings</span>
                  <input
                    type="checkbox"
                    checked={settings.session.autoApproveBookings}
                    onChange={(e) => updateSetting('session', null, 'autoApproveBookings', e.target.checked)}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500/50"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-gray-300 font-diatype">Allow same-day booking</span>
                  <input
                    type="checkbox"
                    checked={settings.session.allowSameDayBooking}
                    onChange={(e) => updateSetting('session', null, 'allowSameDayBooking', e.target.checked)}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Payment Settings */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-6 font-gendy flex items-center gap-2">
                <DollarSign className="w-6 h-6" />
                Payment Settings
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                    Currency
                  </label>
                  <select
                    value={settings.payments.currency}
                    onChange={(e) => updateSetting('payments', null, 'currency', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-diatype"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                    Payout Schedule
                  </label>
                  <select
                    value={settings.payments.payoutSchedule}
                    onChange={(e) => updateSetting('payments', null, 'payoutSchedule', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-diatype"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                    Minimum Payout Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={settings.payments.minimumPayout}
                    onChange={(e) => updateSetting('payments', null, 'minimumPayout', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-diatype"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                    Tax ID
                  </label>
                  <input
                    type="text"
                    value={settings.payments.taxId}
                    onChange={(e) => updateSetting('payments', null, 'taxId', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-diatype"
                  />
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-6 font-gendy">Privacy & Visibility</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                    Profile Visibility
                  </label>
                  <select
                    value={settings.privacy.profileVisibility}
                    onChange={(e) => updateSetting('privacy', null, 'profileVisibility', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-diatype"
                  >
                    <option value="public">Public - Anyone can find you</option>
                    <option value="clients">Clients Only - Only your clients can see your profile</option>
                    <option value="private">Private - Hidden from search</option>
                  </select>
                </div>

                <div className="space-y-3 mt-6">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-gray-300 font-diatype">Show on marketplace</span>
                    <input
                      type="checkbox"
                      checked={settings.privacy.showOnMarketplace}
                      onChange={(e) => updateSetting('privacy', null, 'showOnMarketplace', e.target.checked)}
                      className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500/50"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-gray-300 font-diatype">Allow client reviews</span>
                    <input
                      type="checkbox"
                      checked={settings.privacy.allowClientReviews}
                      onChange={(e) => updateSetting('privacy', null, 'allowClientReviews', e.target.checked)}
                      className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500/50"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-gray-300 font-diatype">Show session count</span>
                    <input
                      type="checkbox"
                      checked={settings.privacy.showSessionCount}
                      onChange={(e) => updateSetting('privacy', null, 'showSessionCount', e.target.checked)}
                      className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500/50"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-gray-300 font-diatype">Show rating</span>
                    <input
                      type="checkbox"
                      checked={settings.privacy.showRating}
                      onChange={(e) => updateSetting('privacy', null, 'showRating', e.target.checked)}
                      className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
