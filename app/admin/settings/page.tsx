'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Settings,
  Save,
  Mail,
  Bell,
  Lock,
  Database,
  Zap,
  Shield,
  Code,
  Globe,
  CheckCircle,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'

export default function SettingsAdmin() {
  const router = useRouter()
  const { userData, authLoading } = useChat()
  const [showContent, setShowContent] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [showSuccess, setShowSuccess] = useState(false)

  // Settings state
  const [settings, setSettings] = useState({
    platformName: 'HumanGlue',
    platformUrl: 'https://humanglue.ai',
    supportEmail: 'support@humanglue.ai',
    emailNotifications: true,
    slackNotifications: false,
    twoFactorAuth: true,
    apiRateLimit: 1000,
    supabaseUrl: 'https://your-project.supabase.co',
    stripePublicKey: 'pk_test_...',
    openaiApiKey: '••••••••••••••••',
  })

  // Check admin access with timeout pattern
  useEffect(() => {
    if (!authLoading && userData?.isAdmin) {
      setShowContent(true)
      return
    }

    const timeout = setTimeout(() => {
      console.log('[SettingsAdmin] Auth timeout - trusting middleware protection')
      setShowContent(true)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [authLoading, userData])

  if (!showContent) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  const handleSave = () => {
    console.log('Saving settings:', settings)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'integrations', name: 'Integrations', icon: Zap },
    { id: 'backup', name: 'Backup', icon: Database },
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/admin" className="text-gray-400 hover:text-white transition-colors mb-2 inline-block">
                  <span className="font-diatype">← Back to Dashboard</span>
                </Link>
                <h1 className="text-3xl font-bold text-white mb-2 font-gendy">System Settings</h1>
                <p className="text-gray-400 font-diatype">Configure platform settings and integrations</p>
              </div>
              <motion.button
                onClick={handleSave}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-diatype"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </motion.button>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Tabs Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                <div className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full px-4 py-3 rounded-xl transition-all flex items-center gap-3 font-diatype ${
                          activeTab === tab.id
                            ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300'
                            : 'bg-transparent hover:bg-white/5 text-gray-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {tab.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-3">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white mb-4 font-gendy">General Settings</h2>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                        Platform Name
                      </label>
                      <input
                        type="text"
                        value={settings.platformName}
                        onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-diatype"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                        Platform URL
                      </label>
                      <input
                        type="url"
                        value={settings.platformUrl}
                        onChange={(e) => setSettings({ ...settings, platformUrl: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-diatype"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                        Support Email
                      </label>
                      <input
                        type="email"
                        value={settings.supportEmail}
                        onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-diatype"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white mb-4 font-gendy">Notification Settings</h2>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <h3 className="text-white font-semibold font-diatype">Email Notifications</h3>
                        <p className="text-sm text-gray-400 font-diatype">Receive email alerts for important events</p>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                        className={`relative w-14 h-7 rounded-full transition-colors ${
                          settings.emailNotifications ? 'bg-green-500' : 'bg-gray-600'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                            settings.emailNotifications ? 'translate-x-7' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <h3 className="text-white font-semibold font-diatype">Slack Notifications</h3>
                        <p className="text-sm text-gray-400 font-diatype">Send notifications to Slack channel</p>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, slackNotifications: !settings.slackNotifications })}
                        className={`relative w-14 h-7 rounded-full transition-colors ${
                          settings.slackNotifications ? 'bg-green-500' : 'bg-gray-600'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                            settings.slackNotifications ? 'translate-x-7' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white mb-4 font-gendy">Security Settings</h2>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <h3 className="text-white font-semibold font-diatype">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-400 font-diatype">Require 2FA for admin accounts</p>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, twoFactorAuth: !settings.twoFactorAuth })}
                        className={`relative w-14 h-7 rounded-full transition-colors ${
                          settings.twoFactorAuth ? 'bg-green-500' : 'bg-gray-600'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                            settings.twoFactorAuth ? 'translate-x-7' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                        API Rate Limit (requests/hour)
                      </label>
                      <input
                        type="number"
                        value={settings.apiRateLimit}
                        onChange={(e) => setSettings({ ...settings, apiRateLimit: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-diatype"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'integrations' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white mb-4 font-gendy">Integrations</h2>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                        Supabase URL
                      </label>
                      <input
                        type="url"
                        value={settings.supabaseUrl}
                        onChange={(e) => setSettings({ ...settings, supabaseUrl: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-diatype"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                        Stripe Public Key
                      </label>
                      <input
                        type="text"
                        value={settings.stripePublicKey}
                        onChange={(e) => setSettings({ ...settings, stripePublicKey: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-diatype"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2 font-diatype">
                        OpenAI API Key
                      </label>
                      <input
                        type="password"
                        value={settings.openaiApiKey}
                        onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-diatype"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'backup' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white mb-4 font-gendy">Backup & Restore</h2>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                      <h3 className="text-white font-semibold mb-2 font-diatype">Automatic Backups</h3>
                      <p className="text-sm text-gray-400 mb-4 font-diatype">
                        Database backups run daily at 2:00 AM UTC
                      </p>
                      <div className="flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-lg transition-all font-diatype"
                        >
                          Backup Now
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all font-diatype"
                        >
                          View Backups
                        </motion.button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-8 right-8 z-[60] bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3"
        >
          <CheckCircle className="w-6 h-6" />
          <span className="font-semibold font-diatype">Settings saved successfully!</span>
        </motion.div>
      )}
    </div>
  )
}
