'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Settings,
  Save,
  Mail,
  Bell,
  Database,
  Zap,
  Shield,
  CheckCircle,
  Palette,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useChat } from '@/lib/contexts/ChatContext'
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner'
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import { Text, Heading } from '@/components/atoms/Text'
import { signOut } from '@/lib/auth/hooks'
import { useTheme } from 'next-themes'

export default function SettingsAdmin() {
  const { userData, authLoading } = useChat()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [showSuccess, setShowSuccess] = useState(false)

  // Prevent hydration mismatch for theme
  useEffect(() => {
    setMounted(true)
  }, [])

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

  if (!showContent) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--hg-bg-primary)' }}>
        <DashboardSidebar onLogout={handleLogout} />
        <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 flex items-center justify-center min-h-screen">
          <LoadingSpinner variant="neural" size="xl" text="Loading settings..." />
        </div>
      </div>
    )
  }

  const handleSave = () => {
    console.log('Saving settings:', settings)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'integrations', name: 'Integrations', icon: Zap },
    { id: 'backup', name: 'Backup', icon: Database },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--hg-bg-primary)' }}>
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        <div className="border-b hg-bg-sidebar hg-border">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/admin">
                  <Text variant="muted" size="sm" className="hover:underline mb-2 inline-block">← Back to Dashboard</Text>
                </Link>
                <Heading as="h1" size="3xl" className="mb-2">System Settings</Heading>
                <Text variant="muted">Configure platform settings and integrations</Text>
              </div>
              <Button variant="primary" size="lg" onClick={handleSave} icon={<Save className="w-5 h-5" />}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Tabs Sidebar */}
            <div className="lg:col-span-1">
              <Card padding="md">
                <div className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                      <Button
                        key={tab.id}
                        variant={isActive ? 'cyan' : 'ghost'}
                        onClick={() => setActiveTab(tab.id)}
                        fullWidth
                        className={`justify-start gap-3 ${!isActive ? 'hg-text-muted' : ''}`}
                      >
                        <Icon className="w-5 h-5" />
                        {tab.name}
                      </Button>
                    )
                  })}
                </div>
              </Card>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-3">
              <Card padding="lg">
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <Heading as="h2" size="xl" className="mb-4">General Settings</Heading>
                    <div>
                      <Text weight="semibold" size="sm" className="block mb-2">
                        Platform Name
                      </Text>
                      <input
                        type="text"
                        value={settings.platformName}
                        onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl transition-all hg-border border focus:outline-none focus:ring-2 hg-bg-secondary hg-text-primary"
                        style={{ '--tw-ring-color': 'var(--hg-cyan-border)' } as React.CSSProperties}
                      />
                    </div>
                    <div>
                      <Text weight="semibold" size="sm" className="block mb-2">
                        Platform URL
                      </Text>
                      <input
                        type="url"
                        value={settings.platformUrl}
                        onChange={(e) => setSettings({ ...settings, platformUrl: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl transition-all hg-border border focus:outline-none focus:ring-2 hg-bg-secondary hg-text-primary"
                        style={{ '--tw-ring-color': 'var(--hg-cyan-border)' } as React.CSSProperties}
                      />
                    </div>
                    <div>
                      <Text weight="semibold" size="sm" className="block mb-2">
                        Support Email
                      </Text>
                      <input
                        type="email"
                        value={settings.supportEmail}
                        onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl transition-all hg-border border focus:outline-none focus:ring-2 hg-bg-secondary hg-text-primary"
                        style={{ '--tw-ring-color': 'var(--hg-cyan-border)' } as React.CSSProperties}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <Heading as="h2" size="xl" className="mb-4">Appearance Settings</Heading>
                    <div>
                      <Text weight="semibold" size="sm" className="block mb-4">
                        Theme
                      </Text>
                      <div className="grid grid-cols-3 gap-4">
                        {/* Light Mode */}
                        <button
                          onClick={() => setTheme('light')}
                          className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                            mounted && theme === 'light' ? 'hg-cyan-bg hg-cyan-border' : 'hg-bg-secondary hg-border'
                          }`}
                        >
                          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                            <Sun className="w-6 h-6 text-yellow-500" />
                          </div>
                          <Text weight="medium">Light</Text>
                        </button>

                        {/* Dark Mode */}
                        <button
                          onClick={() => setTheme('dark')}
                          className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                            mounted && theme === 'dark' ? 'hg-cyan-bg hg-cyan-border' : 'hg-bg-secondary hg-border'
                          }`}
                        >
                          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                            <Moon className="w-6 h-6 hg-cyan-text" />
                          </div>
                          <Text weight="medium">Dark</Text>
                        </button>

                        {/* System */}
                        <button
                          onClick={() => setTheme('system')}
                          className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                            mounted && theme === 'system' ? 'hg-cyan-bg hg-cyan-border' : 'hg-bg-secondary hg-border'
                          }`}
                        >
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white to-gray-800 flex items-center justify-center">
                            <Monitor className="w-6 h-6 text-gray-600" />
                          </div>
                          <Text weight="medium">System</Text>
                        </button>
                      </div>
                      <Text variant="muted" size="sm" className="mt-4">
                        Choose how the dashboard appears to you. Select &quot;System&quot; to automatically match your device settings.
                      </Text>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <Heading as="h2" size="xl" className="mb-4">Notification Settings</Heading>
                    <div className="flex items-center justify-between p-4 rounded-xl hg-bg-secondary">
                      <div>
                        <Text weight="semibold">Email Notifications</Text>
                        <Text variant="muted" size="sm">Receive email alerts for important events</Text>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                        className={`relative w-14 h-7 rounded-full transition-colors ${
                          settings.emailNotifications ? 'bg-emerald-500' : 'bg-gray-600'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                            settings.emailNotifications ? 'translate-x-7' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl hg-bg-secondary">
                      <div>
                        <Text weight="semibold">Slack Notifications</Text>
                        <Text variant="muted" size="sm">Send notifications to Slack channel</Text>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, slackNotifications: !settings.slackNotifications })}
                        className={`relative w-14 h-7 rounded-full transition-colors ${
                          settings.slackNotifications ? 'bg-emerald-500' : 'bg-gray-600'
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
                    <Heading as="h2" size="xl" className="mb-4">Security Settings</Heading>
                    <div className="flex items-center justify-between p-4 rounded-xl hg-bg-secondary">
                      <div>
                        <Text weight="semibold">Two-Factor Authentication</Text>
                        <Text variant="muted" size="sm">Require 2FA for admin accounts</Text>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, twoFactorAuth: !settings.twoFactorAuth })}
                        className={`relative w-14 h-7 rounded-full transition-colors ${
                          settings.twoFactorAuth ? 'bg-emerald-500' : 'bg-gray-600'
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
                      <Text weight="semibold" size="sm" className="block mb-2">
                        API Rate Limit (requests/hour)
                      </Text>
                      <input
                        type="number"
                        value={settings.apiRateLimit}
                        onChange={(e) => setSettings({ ...settings, apiRateLimit: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl transition-all hg-border border focus:outline-none focus:ring-2 hg-bg-secondary hg-text-primary"
                        style={{ '--tw-ring-color': 'var(--hg-cyan-border)' } as React.CSSProperties}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'integrations' && (
                  <div className="space-y-6">
                    <Heading as="h2" size="xl" className="mb-4">Integrations</Heading>
                    <Text variant="muted">
                      Configure bots, webhooks, voice assistants, CRM connections, and more.
                    </Text>

                    {/* Integration Categories */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Bots & Agents */}
                      <Link href="/admin/settings/integrations">
                        <Card hover animate className="p-6 cursor-pointer" variant="flat">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 rounded-xl hg-cyan-bg">
                              <Zap className="w-6 h-6 hg-cyan-text" />
                            </div>
                            <div>
                              <Text weight="semibold" className="font-gendy">Bots & Agents</Text>
                              <Text variant="muted" size="sm">Discord, Slack, Telegram, Web</Text>
                            </div>
                          </div>
                          <Text variant="muted" size="sm">
                            Manage AI bots and agents across platforms
                          </Text>
                        </Card>
                      </Link>

                      {/* Communication Channels */}
                      <Link href="/admin/settings/channels">
                        <Card hover animate className="p-6 cursor-pointer" variant="flat">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 rounded-xl hg-cyan-bg">
                              <Bell className="w-6 h-6 hg-cyan-text" />
                            </div>
                            <div>
                              <Text weight="semibold" className="font-gendy">Communication Channels</Text>
                              <Text variant="muted" size="sm">Email, Social, Newsletter</Text>
                            </div>
                          </div>
                          <Text variant="muted" size="sm">
                            Configure email, social media, and newsletters
                          </Text>
                        </Card>
                      </Link>
                    </div>

                    {/* API Keys */}
                    <div className="mt-6">
                      <Text weight="semibold" className="mb-4 font-gendy block">API Configuration</Text>
                      <div className="space-y-4">
                        <div>
                          <Text weight="semibold" size="sm" className="block mb-2">
                            Supabase URL
                          </Text>
                          <input
                            type="url"
                            value={settings.supabaseUrl}
                            onChange={(e) => setSettings({ ...settings, supabaseUrl: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl transition-all hg-border border focus:outline-none focus:ring-2 hg-bg-secondary hg-text-primary"
                            style={{ '--tw-ring-color': 'var(--hg-cyan-border)' } as React.CSSProperties}
                          />
                        </div>
                        <div>
                          <Text weight="semibold" size="sm" className="block mb-2">
                            Stripe Public Key
                          </Text>
                          <input
                            type="text"
                            value={settings.stripePublicKey}
                            onChange={(e) => setSettings({ ...settings, stripePublicKey: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl transition-all hg-border border focus:outline-none focus:ring-2 hg-bg-secondary hg-text-primary"
                            style={{ '--tw-ring-color': 'var(--hg-cyan-border)' } as React.CSSProperties}
                          />
                        </div>
                        <div>
                          <Text weight="semibold" size="sm" className="block mb-2">
                            OpenAI API Key
                          </Text>
                          <input
                            type="password"
                            value={settings.openaiApiKey}
                            onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl transition-all hg-border border focus:outline-none focus:ring-2 hg-bg-secondary hg-text-primary"
                            style={{ '--tw-ring-color': 'var(--hg-cyan-border)' } as React.CSSProperties}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'backup' && (
                  <div className="space-y-6">
                    <Heading as="h2" size="xl" className="mb-4">Backup & Restore</Heading>
                    <div className="rounded-xl p-6 border hg-cyan-bg hg-cyan-border">
                      <Text weight="semibold" className="mb-2">Automatic Backups</Text>
                      <Text variant="muted" size="sm" className="mb-4">
                        Database backups run daily at 2:00 AM UTC
                      </Text>
                      <div className="flex gap-3">
                        <Button variant="cyan" size="sm">
                          Backup Now
                        </Button>
                        <Button variant="secondary" size="sm">
                          View Backups
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-8 right-8 z-[60] bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3"
          >
            <CheckCircle className="w-6 h-6" />
            <Text weight="semibold" className="text-white">Settings saved successfully!</Text>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
