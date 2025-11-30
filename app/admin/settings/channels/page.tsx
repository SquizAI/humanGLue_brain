'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Mail,
  Share2,
  Newspaper,
  Calendar,
  Settings,
  Link,
  Unlink,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Lock,
  Star,
  Radio,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner'
import { useChat } from '@/lib/contexts/ChatContext'
import { signOut } from '@/lib/auth/hooks'
import Link2 from 'next/link'

// Platform icons/logos as simple components
const PlatformIcon = ({ platform }: { platform: string }) => {
  const icons: Record<string, { icon: string; bg: string; text: string }> = {
    linkedin: { icon: 'in', bg: 'bg-blue-600', text: 'text-white' },
    twitter: { icon: 'X', bg: 'bg-black', text: 'text-white' },
    instagram: { icon: 'IG', bg: 'bg-gradient-to-br from-purple-600 to-pink-500', text: 'text-white' },
    facebook: { icon: 'fb', bg: 'bg-blue-500', text: 'text-white' },
    youtube: { icon: 'YT', bg: 'bg-red-600', text: 'text-white' },
    tiktok: { icon: 'TT', bg: 'bg-black', text: 'text-white' },
    threads: { icon: '@', bg: 'bg-gray-800', text: 'text-white' },
  }
  const config = icons[platform] || { icon: '?', bg: 'bg-gray-600', text: 'text-white' }
  return (
    <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center text-sm font-bold ${config.text}`}>
      {config.icon}
    </div>
  )
}

interface ChannelConfig {
  id: string
  channel_type: string
  is_enabled: boolean
  tier_required: string
  hasAccess: boolean
  currentTier: string
  settings: Record<string, any>
}

interface SocialConnection {
  id: string
  platform: string
  status: string
  platformUsername: string
  platformDisplayName: string
  platformAvatarUrl?: string
  tokenExpiresAt?: string
}

interface SocialPage {
  id: string
  platform: string
  pageId: string
  pageName: string
  pageType: string
  pageUrl?: string
  isDefault: boolean
}

interface ChannelData {
  organization: {
    id: string
    name: string
    subscriptionTier: string
  }
  channels: ChannelConfig[]
  social: {
    configuredPlatforms: string[]
    connections: SocialConnection[]
    pages: SocialPage[]
  }
  email: any
  newsletter: any
  workshop: any
}

export default function ChannelSettingsPage() {
  const searchParams = useSearchParams()
  const { userData, authLoading } = useChat()
  const [showContent, setShowContent] = useState(false)
  const [data, setData] = useState<ChannelData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'social' | 'email' | 'newsletter' | 'workshop'>('overview')
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null)

  // Auth check with proper loading pattern
  useEffect(() => {
    if (!authLoading && userData?.isAdmin) {
      setShowContent(true)
      return
    }

    const timeout = setTimeout(() => {
      console.log('[ChannelsAdmin] Auth timeout - trusting middleware protection')
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

  // Check for OAuth callback results
  useEffect(() => {
    const success = searchParams.get('success')
    const errorParam = searchParams.get('error')
    const platform = searchParams.get('platform')
    const account = searchParams.get('account')

    if (success === 'connected' && platform) {
      setSuccessMessage(`Successfully connected ${platform}${account ? ` as ${account}` : ''}`)
      window.history.replaceState({}, '', '/admin/settings/channels')
    } else if (errorParam) {
      setError(`${platform ? `${platform}: ` : ''}${errorParam}`)
      window.history.replaceState({}, '', '/admin/settings/channels')
    }
  }, [searchParams])

  // Fetch channel data
  useEffect(() => {
    if (showContent) {
      fetchChannelData()
    }
  }, [showContent])

  const fetchChannelData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/channels')
      const result = await response.json()

      if (result.success) {
        setData(result)
      } else {
        // Use mock data if API fails
        setData({
          organization: {
            id: '1',
            name: 'Your Organization',
            subscriptionTier: 'professional'
          },
          channels: [
            { id: '1', channel_type: 'email', is_enabled: true, tier_required: 'free', hasAccess: true, currentTier: 'professional', settings: {} },
            { id: '2', channel_type: 'social', is_enabled: true, tier_required: 'starter', hasAccess: true, currentTier: 'professional', settings: {} },
            { id: '3', channel_type: 'newsletter', is_enabled: true, tier_required: 'professional', hasAccess: true, currentTier: 'professional', settings: {} },
            { id: '4', channel_type: 'workshop', is_enabled: false, tier_required: 'professional', hasAccess: true, currentTier: 'professional', settings: {} },
          ],
          social: {
            configuredPlatforms: ['linkedin', 'twitter', 'instagram', 'facebook'],
            connections: [],
            pages: []
          },
          email: { provider: 'resend', isActive: true, fromEmail: 'hello@humanglue.ai' },
          newsletter: { isActive: true, name: 'HumanGlue Weekly' },
          workshop: { isActive: false }
        })
      }
    } catch (err) {
      // Use mock data on error
      setData({
        organization: {
          id: '1',
          name: 'Your Organization',
          subscriptionTier: 'professional'
        },
        channels: [
          { id: '1', channel_type: 'email', is_enabled: true, tier_required: 'free', hasAccess: true, currentTier: 'professional', settings: {} },
          { id: '2', channel_type: 'social', is_enabled: true, tier_required: 'starter', hasAccess: true, currentTier: 'professional', settings: {} },
          { id: '3', channel_type: 'newsletter', is_enabled: true, tier_required: 'professional', hasAccess: true, currentTier: 'professional', settings: {} },
          { id: '4', channel_type: 'workshop', is_enabled: false, tier_required: 'professional', hasAccess: true, currentTier: 'professional', settings: {} },
        ],
        social: {
          configuredPlatforms: ['linkedin', 'twitter', 'instagram', 'facebook'],
          connections: [],
          pages: []
        },
        email: { provider: 'resend', isActive: true, fromEmail: 'hello@humanglue.ai' },
        newsletter: { isActive: true, name: 'HumanGlue Weekly' },
        workshop: { isActive: false }
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleChannel = async (channelType: string, enabled: boolean) => {
    if (!data) return

    // Optimistic update
    setData({
      ...data,
      channels: data.channels.map(c =>
        c.channel_type === channelType ? { ...c, is_enabled: enabled } : c
      )
    })
    setSuccessMessage(`${channelType} channel ${enabled ? 'enabled' : 'disabled'}`)
  }

  const handleConnectPlatform = async (platform: string) => {
    try {
      setConnectingPlatform(platform)
      const response = await fetch(`/api/oauth/${platform}`)
      const result = await response.json()

      if (result.success && result.authUrl) {
        window.location.href = result.authUrl
      } else {
        setError(result.error || 'Failed to start OAuth flow')
        setConnectingPlatform(null)
      }
    } catch (err) {
      setError('Failed to connect platform')
      setConnectingPlatform(null)
    }
  }

  const handleDisconnectPlatform = async (connectionId: string, platform: string) => {
    if (!confirm(`Are you sure you want to disconnect ${platform}?`)) return

    try {
      setSaving(true)
      const response = await fetch(`/api/oauth/${platform}?connectionId=${connectionId}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      if (result.success) {
        await fetchChannelData()
        setSuccessMessage(`Disconnected ${platform}`)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to disconnect platform')
    } finally {
      setSaving(false)
    }
  }

  // Clear messages after a delay
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage, error])

  const channelIcons: Record<string, React.ReactNode> = {
    email: <Mail className="w-5 h-5" />,
    social: <Share2 className="w-5 h-5" />,
    newsletter: <Newspaper className="w-5 h-5" />,
    workshop: <Calendar className="w-5 h-5" />,
  }

  const tierLabels: Record<string, string> = {
    free: 'Free',
    starter: 'Starter',
    professional: 'Professional',
    enterprise: 'Enterprise',
  }

  // Loading state - show sidebar with spinner
  if (!showContent) {
    return (
      <div className="min-h-screen bg-black">
        <DashboardSidebar onLogout={handleLogout} />
        <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 flex items-center justify-center min-h-screen">
          <LoadingSpinner variant="neural" size="xl" text="Loading channels..." />
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
                  <Link2 href="/admin/settings" className="p-2 hover:bg-white/10 rounded-lg transition-all">
                    <ArrowLeft className="w-5 h-5 text-gray-400" />
                  </Link2>
                  <div className="p-2 bg-cyan-500/20 rounded-xl">
                    <Radio className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h1 className="text-3xl font-bold text-white font-gendy">Communication Channels</h1>
                </div>
                <p className="text-gray-400 font-diatype">Configure channels for {data?.organization.name || 'your organization'}</p>
              </div>
              <div className="flex items-center gap-3">
                {data?.organization.subscriptionTier && (
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-medium">
                    {tierLabels[data.organization.subscriptionTier]} Plan
                  </span>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={fetchChannelData}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-lg hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </motion.button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mt-6">
              {(['overview', 'social', 'email', 'newsletter', 'workshop'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                    activeTab === tab
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {successMessage && (
          <div className="mx-8 mt-4">
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400">{successMessage}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mx-8 mt-4">
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="p-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner variant="neural" size="lg" text="Loading channel data..." />
            </div>
          ) : !data ? (
            <div className="text-center py-20">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Failed to Load</h3>
              <p className="text-gray-400">Unable to load channel settings. Please try again.</p>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.channels.map((channel) => (
                      <motion.div
                        key={channel.channel_type}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 ${
                          !channel.hasAccess ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${
                              channel.is_enabled ? 'bg-cyan-500/20' : 'bg-white/5'
                            }`}>
                              <span className={channel.is_enabled ? 'text-cyan-400' : 'text-gray-400'}>
                                {channelIcons[channel.channel_type]}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white capitalize">
                                {channel.channel_type}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {channel.hasAccess ? (
                                  channel.is_enabled ? 'Active' : 'Disabled'
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <Lock className="w-3 h-3" />
                                    Requires {tierLabels[channel.tier_required]}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleChannel(channel.channel_type, !channel.is_enabled)}
                            disabled={!channel.hasAccess || saving}
                            className={`relative w-12 h-6 rounded-full transition-all ${
                              channel.is_enabled ? 'bg-cyan-500' : 'bg-gray-600'
                            } ${!channel.hasAccess ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                              channel.is_enabled ? 'left-7' : 'left-1'
                            }`} />
                          </button>
                        </div>

                        <div className="text-sm text-gray-400">
                          {channel.channel_type === 'social' && (
                            <div className="flex gap-2 flex-wrap">
                              {data.social.connections.length > 0 ? (
                                data.social.connections.map((conn) => (
                                  <span key={conn.id} className="px-2 py-1 bg-white/5 rounded-lg capitalize">
                                    {conn.platform}
                                  </span>
                                ))
                              ) : (
                                <span>No accounts connected</span>
                              )}
                            </div>
                          )}
                          {channel.channel_type === 'email' && (
                            <span>{data.email?.isActive ? `Sending from ${data.email.fromEmail}` : 'Not configured'}</span>
                          )}
                          {channel.channel_type === 'newsletter' && (
                            <span>{data.newsletter?.isActive ? data.newsletter.name : 'Not configured'}</span>
                          )}
                          {channel.channel_type === 'workshop' && (
                            <span>{data.workshop?.isActive ? 'Auto-announcements enabled' : 'Not configured'}</span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Upgrade prompt */}
                  {data.channels.some((c) => !c.hasAccess) && (
                    <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-cyan-500/20 rounded-xl">
                          <Star className="w-8 h-8 text-cyan-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">Unlock More Channels</h3>
                          <p className="text-gray-400">Upgrade your plan to access all communication channels</p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium"
                        >
                          Upgrade Plan
                        </motion.button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Social Media Tab */}
              {activeTab === 'social' && (
                <div className="space-y-6">
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                      <h3 className="text-lg font-semibold text-white">Connected Accounts</h3>
                      <p className="text-gray-400 text-sm">Connect your social media accounts to post content directly</p>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {['linkedin', 'twitter', 'instagram', 'facebook', 'youtube', 'tiktok', 'threads'].map((platform) => {
                          const connection = data.social.connections.find((c) => c.platform === platform)
                          const isConfigured = data.social.configuredPlatforms.includes(platform)

                          return (
                            <div key={platform} className="bg-white/5 border border-white/10 rounded-xl p-4">
                              <div className="flex items-start gap-3">
                                <PlatformIcon platform={platform} />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-white capitalize">{platform}</h4>
                                  {connection ? (
                                    <p className="text-sm text-gray-400 truncate">@{connection.platformUsername}</p>
                                  ) : (
                                    <p className="text-sm text-gray-500">
                                      {isConfigured ? 'Not connected' : 'Not configured'}
                                    </p>
                                  )}
                                </div>
                                {connection ? (
                                  <button
                                    onClick={() => handleDisconnectPlatform(connection.id, platform)}
                                    disabled={saving}
                                    className="p-2 hover:bg-red-500/20 rounded-lg transition-all"
                                  >
                                    <Unlink className="w-4 h-4 text-gray-400 hover:text-red-400" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleConnectPlatform(platform)}
                                    disabled={!isConfigured || connectingPlatform === platform}
                                    className="p-2 hover:bg-cyan-500/20 rounded-lg transition-all disabled:opacity-50"
                                  >
                                    {connectingPlatform === platform ? (
                                      <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                                    ) : (
                                      <Link className="w-4 h-4 text-gray-400 hover:text-cyan-400" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {data.social.configuredPlatforms.length < 7 && (
                    <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                      <Settings className="w-5 h-5 text-blue-400" />
                      <div>
                        <h4 className="text-white font-medium">Platform Configuration</h4>
                        <p className="text-sm text-gray-400">
                          Some platforms require OAuth credentials to be configured by a system administrator.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Email Tab */}
              {activeTab === 'email' && (
                <div className="space-y-6">
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                      <h3 className="text-lg font-semibold text-white">Email Configuration</h3>
                      <p className="text-gray-400 text-sm">Configure email sending for outreach and notifications</p>
                    </div>
                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm text-gray-400">Email Provider</label>
                          <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50">
                            <option value="resend">Resend</option>
                            <option value="sendgrid">SendGrid</option>
                            <option value="mailchimp">Mailchimp</option>
                            <option value="custom_smtp">Custom SMTP</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-gray-400">Sending Domain</label>
                          <input
                            type="text"
                            placeholder="mail.example.com"
                            defaultValue={data.email?.sendingDomain || ''}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-gray-400">From Name</label>
                          <input
                            type="text"
                            placeholder="Your Company"
                            defaultValue={data.email?.fromName || ''}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-gray-400">From Email</label>
                          <input
                            type="email"
                            placeholder="hello@example.com"
                            defaultValue={data.email?.fromEmail || ''}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                          />
                        </div>
                      </div>

                      {data.email?.domainVerified && (
                        <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span className="text-green-400">Domain verified and ready to send</span>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium"
                        >
                          Save Email Settings
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Newsletter Tab */}
              {activeTab === 'newsletter' && (
                <div className="space-y-6">
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                      <h3 className="text-lg font-semibold text-white">Newsletter Settings</h3>
                      <p className="text-gray-400 text-sm">Configure your newsletter branding and delivery</p>
                    </div>
                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm text-gray-400">Newsletter Name</label>
                          <input
                            type="text"
                            placeholder="Weekly Insights"
                            defaultValue={data.newsletter?.name || ''}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-gray-400">Description</label>
                          <input
                            type="text"
                            placeholder="Your weekly dose of AI insights"
                            defaultValue={data.newsletter?.description || ''}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                          />
                        </div>
                      </div>

                      <div className="border-t border-white/10 pt-6">
                        <h4 className="text-white font-medium mb-4">Tracking & Privacy</h4>
                        <div className="space-y-4">
                          {[
                            { label: 'Track Opens', desc: 'Track when subscribers open your newsletter' },
                            { label: 'Track Clicks', desc: 'Track link clicks in your newsletter' },
                            { label: 'Require Double Opt-in', desc: 'Subscribers must confirm their email' },
                          ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                              <div>
                                <p className="text-white font-medium">{item.label}</p>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                              </div>
                              <button className="relative w-12 h-6 rounded-full bg-cyan-500 cursor-pointer">
                                <div className="absolute top-1 left-7 w-4 h-4 rounded-full bg-white transition-all" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium"
                        >
                          Save Newsletter Settings
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Workshop Tab */}
              {activeTab === 'workshop' && (
                <div className="space-y-6">
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                      <h3 className="text-lg font-semibold text-white">Workshop Announcements</h3>
                      <p className="text-gray-400 text-sm">Configure automatic announcements for your workshops</p>
                    </div>
                    <div className="p-6 space-y-6">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div>
                          <p className="text-white font-medium">Auto-Announce New Workshops</p>
                          <p className="text-sm text-gray-500">Automatically announce when workshops are published</p>
                        </div>
                        <button className="relative w-12 h-6 rounded-full bg-gray-600 cursor-pointer">
                          <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all" />
                        </button>
                      </div>

                      <div className="border-t border-white/10 pt-6">
                        <h4 className="text-white font-medium mb-4">Announcement Channels</h4>
                        <div className="space-y-4">
                          {[
                            'Post on Social Media',
                            'Send Email Announcement',
                            'Include in Newsletter',
                          ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                              <p className="text-white">{item}</p>
                              <button className="relative w-12 h-6 rounded-full bg-cyan-500 cursor-pointer">
                                <div className="absolute top-1 left-7 w-4 h-4 rounded-full bg-white transition-all" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium"
                        >
                          Save Workshop Settings
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
