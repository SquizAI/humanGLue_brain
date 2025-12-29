'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  Bot,
  MessageSquare,
  Webhook,
  Phone,
  Users,
  Key,
  Plus,
  Settings,
  Trash2,
  Edit,
  Power,
  PowerOff,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  Zap,
  Activity,
  Clock,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner'
import { useChat } from '@/lib/contexts/ChatContext'
import { signOut } from '@/lib/auth/hooks'

// Types
interface BotConfig {
  id: string
  platform: 'discord' | 'slack' | 'telegram' | 'web'
  name: string
  description?: string
  status: 'active' | 'inactive' | 'error' | 'configuring'
  credentials: Record<string, string>
  settings: Record<string, any>
  totalMessages: number
  totalUsers: number
  lastActiveAt?: string
  lastError?: string
}

interface WebhookConfig {
  id: string
  name: string
  url: string
  events: string[]
  status: 'active' | 'inactive'
  totalDeliveries: number
  successfulDeliveries: number
  lastDeliveryAt?: string
}

interface VoiceConfig {
  id: string
  provider: 'vapi' | 'twilio'
  name: string
  phoneNumber?: string
  status: 'active' | 'inactive'
  totalCalls: number
  totalMinutes: number
}

interface CrmConfig {
  id: string
  provider: 'hubspot' | 'salesforce' | 'pipedrive'
  name: string
  status: 'active' | 'inactive' | 'error'
  lastSyncAt?: string
  contactsSynced: number
}

interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  scopes: string[]
  isActive: boolean
  lastUsedAt?: string
  usageCount: number
  expiresAt?: string
}

// Platform icons/logos
const PlatformIcon = ({ platform, size = 'md' }: { platform: string; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  }

  const icons: Record<string, { icon: string; bg: string; text: string }> = {
    discord: { icon: 'DC', bg: 'bg-indigo-600', text: 'text-white' },
    slack: { icon: 'SL', bg: 'bg-purple-600', text: 'text-white' },
    telegram: { icon: 'TG', bg: 'bg-blue-500', text: 'text-white' },
    web: { icon: 'WB', bg: 'bg-gray-600', text: 'text-white' },
    vapi: { icon: 'VA', bg: 'bg-emerald-600', text: 'text-white' },
    twilio: { icon: 'TW', bg: 'bg-red-600', text: 'text-white' },
    hubspot: { icon: 'HS', bg: 'bg-orange-500', text: 'text-white' },
    salesforce: { icon: 'SF', bg: 'bg-blue-600', text: 'text-white' },
    pipedrive: { icon: 'PD', bg: 'bg-green-600', text: 'text-white' },
  }

  const config = icons[platform] || { icon: '?', bg: 'bg-gray-600', text: 'text-white' }
  return (
    <div className={`${sizeClasses[size]} rounded-lg ${config.bg} flex items-center justify-center font-bold ${config.text}`}>
      {config.icon}
    </div>
  )
}

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
    active: { bg: 'bg-green-500/10', text: 'text-green-400', dot: 'bg-green-400' },
    inactive: { bg: 'bg-gray-500/10', text: 'text-gray-400', dot: 'bg-gray-400' },
    error: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400' },
    configuring: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  }

  const config = statusConfig[status] || statusConfig.inactive

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export default function IntegrationsSettingsPage() {
  const { userData, authLoading } = useChat()
  const [showContent, setShowContent] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'bots' | 'webhooks' | 'voice' | 'crm' | 'api-keys'>('bots')
  const [showModal, setShowModal] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})

  // Data states
  const [bots, setBots] = useState<BotConfig[]>([])
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([])
  const [voiceConfigs, setVoiceConfigs] = useState<VoiceConfig[]>([])
  const [crmConfigs, setCrmConfigs] = useState<CrmConfig[]>([])
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])

  // Form states for Add Bot modal
  const [newBotForm, setNewBotForm] = useState({
    platform: 'discord' as 'discord' | 'slack' | 'telegram' | 'web',
    name: '',
    description: '',
    botToken: '',
    applicationId: '',
    clientId: '',
  })
  const [saving, setSaving] = useState(false)

  // Auth check
  useEffect(() => {
    if (!authLoading && userData?.isAdmin) {
      setShowContent(true)
      return
    }

    const timeout = setTimeout(() => {
      console.log('[IntegrationsAdmin] Auth timeout - trusting middleware protection')
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

  // Load data
  useEffect(() => {
    if (showContent) {
      loadData()
    }
  }, [showContent])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load from API
      const response = await fetch('/api/admin/integrations')
      const data = await response.json()

      if (data.success) {
        // Transform bots data
        const transformedBots: BotConfig[] = (data.bots || []).map((bot: any) => ({
          id: bot.id,
          platform: bot.platform,
          name: bot.name,
          description: bot.description,
          status: bot.status,
          credentials: bot.credentials || {},
          settings: bot.settings || {},
          totalMessages: bot.total_messages || 0,
          totalUsers: bot.total_users || 0,
          lastActiveAt: bot.last_active_at,
          lastError: bot.last_error,
        }))
        setBots(transformedBots)

        // Transform webhooks data
        const transformedWebhooks: WebhookConfig[] = (data.webhooks || []).map((wh: any) => ({
          id: wh.id,
          name: wh.name,
          url: wh.url,
          events: wh.events || [],
          status: wh.status,
          totalDeliveries: wh.total_deliveries || 0,
          successfulDeliveries: wh.successful_deliveries || 0,
          lastDeliveryAt: wh.last_delivery_at,
        }))
        setWebhooks(transformedWebhooks)

        // Transform voice data
        const transformedVoice: VoiceConfig[] = (data.voice || []).map((v: any) => ({
          id: v.id,
          provider: v.provider,
          name: v.name,
          phoneNumber: v.phone_number,
          status: v.status,
          totalCalls: v.total_calls || 0,
          totalMinutes: v.total_minutes || 0,
        }))
        setVoiceConfigs(transformedVoice)

        // Transform CRM data
        const transformedCrm: CrmConfig[] = (data.crm || []).map((c: any) => ({
          id: c.id,
          provider: c.provider,
          name: c.name,
          status: c.status,
          lastSyncAt: c.last_sync_at,
          contactsSynced: c.contacts_synced || 0,
        }))
        setCrmConfigs(transformedCrm)

        // Transform API keys data
        const transformedApiKeys: ApiKey[] = (data.apiKeys || []).map((k: any) => ({
          id: k.id,
          name: k.name,
          keyPrefix: k.key_prefix,
          scopes: k.scopes || [],
          isActive: k.is_active,
          lastUsedAt: k.last_used_at,
          usageCount: k.usage_count || 0,
          expiresAt: k.expires_at,
        }))
        setApiKeys(transformedApiKeys)
      } else {
        console.error('API returned error:', data.error)
        // Fall back to empty arrays if tables don't exist yet
        setBots([])
        setWebhooks([])
        setVoiceConfigs([])
        setCrmConfigs([])
        setApiKeys([])
      }
    } catch (error) {
      console.error('Failed to load integrations:', error)
      // Tables may not exist yet - show empty state
      setBots([])
      setWebhooks([])
      setVoiceConfigs([])
      setCrmConfigs([])
      setApiKeys([])
    } finally {
      setLoading(false)
    }
  }

  // Toggle bot status
  const toggleBotStatus = async (bot: BotConfig) => {
    const newStatus = bot.status === 'active' ? 'inactive' : 'active'
    try {
      const response = await fetch('/api/admin/integrations/bots', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bot.id, status: newStatus }),
      })
      const data = await response.json()
      if (data.success) {
        setBots(bots.map(b => b.id === bot.id ? { ...b, status: newStatus } : b))
        setSuccessMessage(`${bot.name} is now ${newStatus}`)
      } else {
        setErrorMessage(data.error || 'Failed to update bot status')
      }
    } catch (error) {
      console.error('Error toggling bot status:', error)
      setErrorMessage('Failed to update bot status')
    }
  }

  // Create new bot
  const createBot = async () => {
    if (!newBotForm.name || !newBotForm.botToken) {
      setErrorMessage('Bot name and token are required')
      return
    }

    setSaving(true)
    try {
      const credentials: Record<string, string> = {}
      if (newBotForm.botToken) credentials.bot_token = newBotForm.botToken
      if (newBotForm.applicationId) credentials.application_id = newBotForm.applicationId
      if (newBotForm.clientId) credentials.client_id = newBotForm.clientId

      const response = await fetch('/api/admin/integrations/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: newBotForm.platform,
          name: newBotForm.name,
          description: newBotForm.description,
          credentials,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setSuccessMessage('Bot created successfully!')
        setShowModal(null)
        setNewBotForm({
          platform: 'discord',
          name: '',
          description: '',
          botToken: '',
          applicationId: '',
          clientId: '',
        })
        loadData() // Refresh the list
      } else {
        setErrorMessage(data.error || 'Failed to create bot')
      }
    } catch (error) {
      console.error('Error creating bot:', error)
      setErrorMessage('Failed to create bot')
    } finally {
      setSaving(false)
    }
  }

  // Delete bot
  const deleteBot = async (bot: BotConfig) => {
    if (!confirm(`Are you sure you want to delete ${bot.name}?`)) return

    try {
      const response = await fetch(`/api/admin/integrations/bots?id=${bot.id}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (data.success) {
        setSuccessMessage('Bot deleted successfully')
        setBots(bots.filter(b => b.id !== bot.id))
      } else {
        setErrorMessage(data.error || 'Failed to delete bot')
      }
    } catch (error) {
      console.error('Error deleting bot:', error)
      setErrorMessage('Failed to delete bot')
    }
  }

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setSuccessMessage('Copied to clipboard')
  }

  // Clear messages
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
        setErrorMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage, errorMessage])

  const tabs = [
    { id: 'bots', name: 'Bots', icon: Bot, count: bots.length },
    { id: 'webhooks', name: 'Webhooks', icon: Webhook, count: webhooks.length },
    { id: 'voice', name: 'Voice', icon: Phone, count: voiceConfigs.length },
    { id: 'crm', name: 'CRM', icon: Users, count: crmConfigs.length },
    { id: 'api-keys', name: 'API Keys', icon: Key, count: apiKeys.length },
  ]

  if (!showContent) {
    return (
      <div className="min-h-screen bg-black">
        <DashboardSidebar onLogout={handleLogout} />
        <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 flex items-center justify-center min-h-screen">
          <LoadingSpinner variant="neural" size="xl" text="Loading integrations..." />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        {/* Header */}
        <div className="bg-black/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Link href="/admin/settings" className="p-2 hover:bg-white/10 rounded-lg transition-all">
                    <ArrowLeft className="w-5 h-5 text-gray-400" />
                  </Link>
                  <div className="p-2 bg-cyan-500/20 rounded-xl">
                    <Zap className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h1 className="text-3xl font-bold text-white font-gendy">Integrations</h1>
                </div>
                <p className="text-gray-400 font-diatype">Manage bots, webhooks, voice, CRM, and API keys</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={loadData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-lg hover:bg-white/10 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </motion.button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.name}
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id ? 'bg-cyan-500/30' : 'bg-white/10'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Alerts */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-8 mt-4"
            >
              <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400">{successMessage}</span>
              </div>
            </motion.div>
          )}

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-8 mt-4"
            >
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400">{errorMessage}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="p-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner variant="neural" size="lg" text="Loading integrations..." />
            </div>
          ) : (
            <>
              {/* Bots Tab */}
              {activeTab === 'bots' && (
                <div className="space-y-6">
                  {/* Add Bot Button */}
                  <div className="flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowModal('add-bot')}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add Bot
                    </motion.button>
                  </div>

                  {/* Bot Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {bots.map((bot) => (
                      <motion.div
                        key={bot.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <PlatformIcon platform={bot.platform} size="lg" />
                              <div>
                                <h3 className="text-lg font-semibold text-white">{bot.name}</h3>
                                <p className="text-sm text-gray-400 capitalize">{bot.platform} Bot</p>
                              </div>
                            </div>
                            <StatusBadge status={bot.status} />
                          </div>

                          {bot.description && (
                            <p className="text-gray-400 text-sm mb-4">{bot.description}</p>
                          )}

                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="bg-white/5 rounded-lg p-3">
                              <p className="text-xs text-gray-500 mb-1">Messages</p>
                              <p className="text-lg font-semibold text-white">{bot.totalMessages.toLocaleString()}</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3">
                              <p className="text-xs text-gray-500 mb-1">Users</p>
                              <p className="text-lg font-semibold text-white">{bot.totalUsers.toLocaleString()}</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3">
                              <p className="text-xs text-gray-500 mb-1">Last Active</p>
                              <p className="text-sm font-medium text-white">
                                {bot.lastActiveAt ? 'Just now' : 'Never'}
                              </p>
                            </div>
                          </div>

                          {/* Error message */}
                          {bot.lastError && (
                            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
                              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                              <p className="text-sm text-red-400 truncate">{bot.lastError}</p>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => toggleBotStatus(bot)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                bot.status === 'active'
                                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                  : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                              }`}
                            >
                              {bot.status === 'active' ? (
                                <>
                                  <PowerOff className="w-4 h-4" />
                                  Stop
                                </>
                              ) : (
                                <>
                                  <Power className="w-4 h-4" />
                                  Start
                                </>
                              )}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setSelectedItem(bot)
                                setShowModal('edit-bot')
                              }}
                              className="flex items-center gap-2 px-3 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10"
                            >
                              <Settings className="w-4 h-4" />
                              Configure
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => deleteBot(bot)}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Empty state */}
                    {bots.length === 0 && (
                      <div className="col-span-2 text-center py-20 bg-white/5 rounded-xl border border-white/10">
                        <Bot className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No Bots Configured</h3>
                        <p className="text-gray-400 mb-6">Create your first bot to start engaging with users</p>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowModal('add-bot')}
                          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium"
                        >
                          Create Bot
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Webhooks Tab */}
              {activeTab === 'webhooks' && (
                <div className="space-y-6">
                  <div className="flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowModal('add-webhook')}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add Webhook
                    </motion.button>
                  </div>

                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Name</th>
                          <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">URL</th>
                          <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Events</th>
                          <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Status</th>
                          <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Deliveries</th>
                          <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {webhooks.map((webhook) => (
                          <tr key={webhook.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="px-6 py-4">
                              <p className="text-white font-medium">{webhook.name}</p>
                            </td>
                            <td className="px-6 py-4">
                              <code className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                                {webhook.url.substring(0, 40)}...
                              </code>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {webhook.events.slice(0, 2).map((event) => (
                                  <span key={event} className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded text-xs">
                                    {event}
                                  </span>
                                ))}
                                {webhook.events.length > 2 && (
                                  <span className="px-2 py-0.5 bg-white/5 text-gray-400 rounded text-xs">
                                    +{webhook.events.length - 2}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={webhook.status} />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="text-green-400">{webhook.successfulDeliveries}</span>
                                <span className="text-gray-500">/</span>
                                <span className="text-gray-400">{webhook.totalDeliveries}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg">
                                  <Settings className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Webhook events reference */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                    <h4 className="text-white font-medium mb-3">Available Webhook Events</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {['assessment.started', 'assessment.completed', 'user.created', 'user.updated', 'workshop.registered', 'workshop.completed', 'lesson.completed', 'engagement.created'].map((event) => (
                        <code key={event} className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">
                          {event}
                        </code>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Voice Tab */}
              {activeTab === 'voice' && (
                <div className="space-y-6">
                  <div className="flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowModal('add-voice')}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add Voice Assistant
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {voiceConfigs.map((voice) => (
                      <motion.div
                        key={voice.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <PlatformIcon platform={voice.provider} size="lg" />
                            <div>
                              <h3 className="text-lg font-semibold text-white">{voice.name}</h3>
                              <p className="text-sm text-gray-400 capitalize">{voice.provider}</p>
                            </div>
                          </div>
                          <StatusBadge status={voice.status} />
                        </div>

                        {voice.phoneNumber && (
                          <div className="flex items-center gap-2 mb-4 p-3 bg-white/5 rounded-lg">
                            <Phone className="w-4 h-4 text-cyan-400" />
                            <span className="text-white font-mono">{voice.phoneNumber}</span>
                            <button
                              onClick={() => copyToClipboard(voice.phoneNumber!)}
                              className="ml-auto p-1 hover:bg-white/10 rounded"
                            >
                              <Copy className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-white/5 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Total Calls</p>
                            <p className="text-lg font-semibold text-white">{voice.totalCalls}</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Minutes Used</p>
                            <p className="text-lg font-semibold text-white">{voice.totalMinutes}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button className="flex items-center gap-2 px-3 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10">
                            <Settings className="w-4 h-4" />
                            Configure
                          </button>
                          <button className="flex items-center gap-2 px-3 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10">
                            <Activity className="w-4 h-4" />
                            View Logs
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* CRM Tab */}
              {activeTab === 'crm' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['hubspot', 'salesforce', 'pipedrive'].map((provider) => {
                      const existing = crmConfigs.find(c => c.provider === provider)
                      return (
                        <motion.div
                          key={provider}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <PlatformIcon platform={provider} size="lg" />
                            <div>
                              <h3 className="text-lg font-semibold text-white capitalize">{provider}</h3>
                              {existing ? (
                                <StatusBadge status={existing.status} />
                              ) : (
                                <span className="text-sm text-gray-500">Not connected</span>
                              )}
                            </div>
                          </div>

                          {existing ? (
                            <>
                              <div className="space-y-3 mb-4">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">Contacts Synced</span>
                                  <span className="text-white">{existing.contactsSynced.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">Last Sync</span>
                                  <span className="text-white flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Just now
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button className="flex-1 px-3 py-2 bg-white/5 text-gray-300 rounded-lg text-sm hover:bg-white/10">
                                  Settings
                                </button>
                                <button className="px-3 py-2 bg-cyan-500/10 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/20">
                                  Sync Now
                                </button>
                              </div>
                            </>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium"
                            >
                              Connect {provider.charAt(0).toUpperCase() + provider.slice(1)}
                            </motion.button>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* API Keys Tab */}
              {activeTab === 'api-keys' && (
                <div className="space-y-6">
                  <div className="flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowModal('add-api-key')}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Create API Key
                    </motion.button>
                  </div>

                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Name</th>
                          <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Key</th>
                          <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Scopes</th>
                          <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Usage</th>
                          <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Status</th>
                          <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {apiKeys.map((key) => (
                          <tr key={key.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="px-6 py-4">
                              <p className="text-white font-medium">{key.name}</p>
                              <p className="text-xs text-gray-500">
                                {key.lastUsedAt ? `Last used ${new Date(key.lastUsedAt).toLocaleDateString()}` : 'Never used'}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <code className="text-sm text-gray-400 font-mono">
                                  {key.keyPrefix}{'*'.repeat(24)}
                                </code>
                                <button
                                  onClick={() => copyToClipboard(`${key.keyPrefix}${'*'.repeat(24)}`)}
                                  className="p-1 hover:bg-white/10 rounded"
                                >
                                  <Copy className="w-4 h-4 text-gray-400" />
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {key.scopes.map((scope) => (
                                  <span key={scope} className="px-2 py-0.5 bg-white/5 text-gray-400 rounded text-xs">
                                    {scope}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-white">{key.usageCount.toLocaleString()}</span>
                              <span className="text-gray-500 text-sm"> requests</span>
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={key.isActive ? 'active' : 'inactive'} />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* API Documentation Link */}
                  <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <ExternalLink className="w-5 h-5 text-blue-400" />
                    <div>
                      <h4 className="text-white font-medium">API Documentation</h4>
                      <p className="text-sm text-gray-400">
                        Learn how to use the HumanGlue API to integrate with your applications
                      </p>
                    </div>
                    <Link
                      href="/docs/api"
                      className="ml-auto px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30"
                    >
                      View Docs
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Bot Modal */}
      <AnimatePresence>
        {showModal === 'add-bot' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto"
            >
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">Add New Bot</h2>
                <p className="text-gray-400 text-sm">Configure a new bot for your organization</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Platform Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Select Platform</label>
                  <div className="grid grid-cols-4 gap-3">
                    {(['discord', 'slack', 'telegram', 'web'] as const).map((platform) => (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => setNewBotForm(prev => ({ ...prev, platform }))}
                        className={`flex flex-col items-center gap-2 p-4 border rounded-xl transition-all ${
                          newBotForm.platform === platform
                            ? 'bg-cyan-500/10 border-cyan-500/50'
                            : 'bg-white/5 border-white/10 hover:border-cyan-500/30'
                        }`}
                      >
                        <PlatformIcon platform={platform} />
                        <span className={`text-sm capitalize ${newBotForm.platform === platform ? 'text-cyan-400' : 'text-gray-400'}`}>
                          {platform}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bot Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bot Name</label>
                  <input
                    type="text"
                    placeholder="My AI Assistant"
                    value={newBotForm.name}
                    onChange={(e) => setNewBotForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    placeholder="Describe what this bot does..."
                    rows={3}
                    value={newBotForm.description}
                    onChange={(e) => setNewBotForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                  />
                </div>

                {/* Credentials */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-300">Credentials</label>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Bot Token *</label>
                      <input
                        type="password"
                        placeholder="Enter bot token..."
                        value={newBotForm.botToken}
                        onChange={(e) => setNewBotForm(prev => ({ ...prev, botToken: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Application ID</label>
                      <input
                        type="text"
                        placeholder="Enter application ID..."
                        value={newBotForm.applicationId}
                        onChange={(e) => setNewBotForm(prev => ({ ...prev, applicationId: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Client ID</label>
                      <input
                        type="text"
                        placeholder="Enter client ID..."
                        value={newBotForm.clientId}
                        onChange={(e) => setNewBotForm(prev => ({ ...prev, clientId: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(null)}
                  disabled={saving}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={createBot}
                  disabled={saving || !newBotForm.name || !newBotForm.botToken}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Bot'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
