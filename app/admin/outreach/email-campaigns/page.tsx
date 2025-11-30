'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Sparkles,
  Send,
  Users,
  Calendar,
  Clock,
  Eye,
  Copy,
  RefreshCw,
  ChevronRight,
  Wand2,
  Check,
  X,
  ArrowLeft,
  Target,
  TrendingUp,
  Zap,
  FileText,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  BarChart3,
  MousePointerClick,
  MailOpen,
  AlertCircle,
  CheckCircle,
  Settings,
  Filter,
  Search,
} from 'lucide-react'
import Link from 'next/link'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner'
import { useChat } from '@/lib/contexts/ChatContext'
import { signOut } from '@/lib/auth/hooks'

interface EmailCampaign {
  id: string
  name: string
  subject: string
  preheader: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused'
  type: 'promotional' | 'newsletter' | 'transactional' | 'automated'
  audienceSegment?: string
  scheduledAt?: string
  sentAt?: string
  stats?: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    bounced: number
    unsubscribed: number
    openRate: number
    clickRate: number
  }
  createdAt: string
  updatedAt: string
}

interface AudienceSegment {
  id: string
  name: string
  count: number
  description: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  action?: 'generate' | 'refine' | 'schedule' | 'segment'
}

const CAMPAIGN_STATUS_COLORS: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  draft: { bg: 'bg-gray-500/20', text: 'text-gray-400', icon: <FileText className="w-4 h-4" /> },
  scheduled: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: <Calendar className="w-4 h-4" /> },
  sending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: <Send className="w-4 h-4" /> },
  sent: { bg: 'bg-green-500/20', text: 'text-green-400', icon: <CheckCircle className="w-4 h-4" /> },
  paused: { bg: 'bg-orange-500/20', text: 'text-orange-400', icon: <Pause className="w-4 h-4" /> },
}

export default function EmailCampaignsPage() {
  const { userData, authLoading } = useChat()
  const [showContent, setShowContent] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  // View state
  const [activeView, setActiveView] = useState<'campaigns' | 'create' | 'analytics'>('campaigns')
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Campaign data
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [audienceSegments, setAudienceSegments] = useState<AudienceSegment[]>([])

  // Create form state
  const [campaignName, setCampaignName] = useState('')
  const [campaignType, setCampaignType] = useState<'promotional' | 'newsletter' | 'automated'>('promotional')
  const [subject, setSubject] = useState('')
  const [preheader, setPreheader] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [ctaText, setCtaText] = useState('')
  const [ctaUrl, setCtaUrl] = useState('')
  const [selectedSegment, setSelectedSegment] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your email campaign assistant. Tell me about the campaign you want to create - the topic, target audience, and goals - and I'll help you craft compelling email content. I can also suggest optimal send times based on your audience engagement patterns.",
      timestamp: new Date(),
    },
  ])
  const [chatInput, setChatInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!authLoading && userData?.isAdmin) {
      setShowContent(true)
      return
    }
    const timeout = setTimeout(() => setShowContent(true), 2000)
    return () => clearTimeout(timeout)
  }, [authLoading, userData])

  useEffect(() => {
    if (showContent) {
      fetchCampaigns()
      fetchAudienceSegments()
    }
  }, [showContent])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

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

  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      // Mock data for now - would connect to real API
      setCampaigns([
        {
          id: '1',
          name: 'Workshop Promotion - AI Strategy',
          subject: 'Join Our AI Strategy Workshop - Limited Seats!',
          preheader: 'Transform your business with actionable AI insights',
          status: 'scheduled',
          type: 'promotional',
          audienceSegment: 'C-Suite Executives',
          scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(),
          stats: { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0, openRate: 0, clickRate: 0 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Monthly Newsletter - December',
          subject: 'AI Transformation Insights - December Edition',
          preheader: 'Your monthly dose of AI transformation tips',
          status: 'sent',
          type: 'newsletter',
          sentAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          stats: { sent: 2500, delivered: 2450, opened: 892, clicked: 234, bounced: 50, unsubscribed: 12, openRate: 36.4, clickRate: 9.5 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'New Assessment Feature Launch',
          subject: 'New Feature: Real-Time AI Maturity Tracking',
          preheader: 'Track your AI transformation progress like never before',
          status: 'draft',
          type: 'promotional',
          stats: { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0, openRate: 0, clickRate: 0 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ])
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAudienceSegments = async () => {
    setAudienceSegments([
      { id: '1', name: 'All Subscribers', count: 5234, description: 'Everyone on your mailing list' },
      { id: '2', name: 'C-Suite Executives', count: 892, description: 'CEOs, CTOs, CFOs, CHROs' },
      { id: '3', name: 'HR Professionals', count: 1456, description: 'HR Directors and Managers' },
      { id: '4', name: 'Workshop Attendees', count: 634, description: 'Past workshop participants' },
      { id: '5', name: 'Assessment Completers', count: 412, description: 'Users who completed an assessment' },
      { id: '6', name: 'Engaged (Last 30 Days)', count: 1823, description: 'Opened or clicked recently' },
    ])
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date(),
    }

    setChatMessages((prev) => [...prev, userMessage])
    setChatInput('')
    setIsGenerating(true)

    try {
      // Call AI to generate email content
      const response = await fetch('/api/communications/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'email',
          organizationId: userData?.organizationId || 'default',
          topic: chatInput,
          tone: 'professional',
          includeCTA: true,
        }),
      })

      const data = await response.json()

      let assistantContent = ''
      if (data.success && data.content) {
        // Update form with generated content
        if (data.content.emailMetadata) {
          setSubject(data.content.emailMetadata.subject)
          setPreheader(data.content.emailMetadata.preheader)
          setCtaText(data.content.emailMetadata.ctaText)
          setCtaUrl(data.content.emailMetadata.ctaUrl)
        }
        setEmailBody(data.content.content)

        assistantContent = `I've crafted an email for you:\n\n**Subject:** ${data.content.emailMetadata?.subject || 'Generated subject'}\n\n**Preheader:** ${data.content.emailMetadata?.preheader || ''}\n\nI've populated the email builder with the content. You can preview and edit it in the form on the right.\n\n${data.suggestions?.length > 0 ? `**Suggestions:**\n${data.suggestions.map((s: string) => `- ${s}`).join('\n')}` : ''}`
      } else {
        assistantContent = "I'll help you create that email. Could you tell me more about:\n1. Who is the target audience?\n2. What's the main goal of this email?\n3. Any specific call-to-action you'd like to include?"
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      }

      setChatMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error generating content:', error)
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I encountered an issue generating the content. Let me help you manually. What's the main message you want to convey in this email?",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleQuickGenerate = async (type: 'subject' | 'body' | 'cta') => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/communications/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'email',
          organizationId: userData?.organizationId || 'default',
          topic: `Generate ${type} for: ${campaignName || subject || 'email campaign'}`,
          tone: 'professional',
        }),
      })

      const data = await response.json()
      if (data.success && data.content) {
        if (type === 'subject' && data.content.emailMetadata?.subject) {
          setSubject(data.content.emailMetadata.subject)
        } else if (type === 'body' && data.content.content) {
          setEmailBody(data.content.content)
        } else if (type === 'cta' && data.content.emailMetadata?.ctaText) {
          setCtaText(data.content.emailMetadata.ctaText)
        }
      }
    } catch (error) {
      console.error('Error generating:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveDraft = async () => {
    // Save campaign as draft
    console.log('Saving draft...')
  }

  const handleSchedule = async () => {
    // Schedule campaign
    console.log('Scheduling campaign...')
  }

  const handleSendTest = async () => {
    // Send test email
    console.log('Sending test email...')
  }

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.subject.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (!showContent) {
    return (
      <div className="min-h-screen bg-black">
        <DashboardSidebar onLogout={handleLogout} />
        <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 flex items-center justify-center min-h-screen">
          <LoadingSpinner variant="neural" size="xl" text="Loading email campaigns..." />
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
            <div className="flex items-center gap-4 mb-2">
              <Link
                href="/admin/outreach"
                className="p-2 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl">
                <Mail className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white font-gendy">Email Campaigns</h1>
                <p className="text-gray-400 font-diatype">AI-powered email marketing with smart automation</p>
              </div>
            </div>

            {/* View Tabs */}
            <div className="flex gap-2 mt-4">
              {[
                { id: 'campaigns', label: 'Campaigns', icon: <Mail className="w-4 h-4" /> },
                { id: 'create', label: 'Create Campaign', icon: <Plus className="w-4 h-4" /> },
                { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as 'campaigns' | 'create' | 'analytics')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeView === tab.id
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeView === 'campaigns' && (
              <motion.div
                key="campaigns"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Search & Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-[300px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search campaigns..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="sending">Sending</option>
                    <option value="sent">Sent</option>
                    <option value="paused">Paused</option>
                  </select>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveView('create')}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium shadow-lg shadow-cyan-500/25"
                  >
                    <Plus className="w-5 h-5" />
                    New Campaign
                  </motion.button>
                </div>

                {/* Campaigns Grid */}
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <LoadingSpinner variant="neural" size="lg" text="Loading campaigns..." />
                  </div>
                ) : filteredCampaigns.length === 0 ? (
                  <div className="text-center py-20">
                    <Mail className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No campaigns found</h3>
                    <p className="text-gray-400 mb-6">Create your first email campaign to get started</p>
                    <button
                      onClick={() => setActiveView('create')}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium"
                    >
                      Create Campaign
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCampaigns.map((campaign) => (
                      <motion.div
                        key={campaign.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:border-cyan-500/30 transition-all group"
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${CAMPAIGN_STATUS_COLORS[campaign.status].bg}`}>
                              {CAMPAIGN_STATUS_COLORS[campaign.status].icon}
                              <span className={`text-sm font-medium capitalize ${CAMPAIGN_STATUS_COLORS[campaign.status].text}`}>
                                {campaign.status}
                              </span>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                                <Edit className="w-4 h-4 text-gray-400 hover:text-white" />
                              </button>
                              <button className="p-2 hover:bg-red-500/20 rounded-lg transition-all">
                                <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                              </button>
                            </div>
                          </div>

                          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">{campaign.name}</h3>
                          <p className="text-sm text-cyan-400 mb-1 line-clamp-1">{campaign.subject}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{campaign.preheader}</p>

                          {campaign.audienceSegment && (
                            <div className="flex items-center gap-2 mt-4 text-sm text-gray-400">
                              <Target className="w-4 h-4" />
                              {campaign.audienceSegment}
                            </div>
                          )}

                          {campaign.scheduledAt && (
                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                              <Calendar className="w-4 h-4" />
                              {new Date(campaign.scheduledAt).toLocaleDateString()} at{' '}
                              {new Date(campaign.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}

                          {campaign.stats && campaign.stats.sent > 0 && (
                            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-green-400">
                                  <MailOpen className="w-4 h-4" />
                                  <span className="font-semibold">{campaign.stats.openRate}%</span>
                                </div>
                                <p className="text-xs text-gray-500">Open Rate</p>
                              </div>
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-blue-400">
                                  <MousePointerClick className="w-4 h-4" />
                                  <span className="font-semibold">{campaign.stats.clickRate}%</span>
                                </div>
                                <p className="text-xs text-gray-500">Click Rate</p>
                              </div>
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-cyan-400">
                                  <Send className="w-4 h-4" />
                                  <span className="font-semibold">{campaign.stats.sent.toLocaleString()}</span>
                                </div>
                                <p className="text-xs text-gray-500">Sent</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeView === 'create' && (
              <motion.div
                key="create"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 xl:grid-cols-2 gap-8"
              >
                {/* AI Chat Assistant */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden flex flex-col h-[calc(100vh-280px)]">
                  <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">AI Campaign Assistant</h3>
                      <p className="text-xs text-gray-400">Tell me about your campaign and I'll help create it</p>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatMessages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                            msg.role === 'user'
                              ? 'bg-cyan-500/20 text-white rounded-br-none'
                              : 'bg-white/10 text-gray-200 rounded-bl-none'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    {isGenerating && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-bl-none">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Input */}
                  <form onSubmit={handleChatSubmit} className="p-4 border-t border-white/10">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Describe your email campaign..."
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                        disabled={isGenerating}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={isGenerating || !chatInput.trim()}
                        className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl disabled:opacity-50"
                      >
                        <Send className="w-5 h-5" />
                      </motion.button>
                    </div>

                    {/* Quick prompts */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {[
                        'Workshop promotion email',
                        'Monthly newsletter',
                        'Feature announcement',
                        'Re-engagement campaign',
                      ].map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => setChatInput(prompt)}
                          className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-gray-400 hover:text-white transition-all"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </form>
                </div>

                {/* Email Builder Form */}
                <div className="space-y-6">
                  {/* Campaign Settings */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-cyan-400" />
                      Campaign Settings
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Campaign Name</label>
                        <input
                          type="text"
                          value={campaignName}
                          onChange={(e) => setCampaignName(e.target.value)}
                          placeholder="e.g., December Newsletter"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Campaign Type</label>
                        <div className="flex gap-2">
                          {(['promotional', 'newsletter', 'automated'] as const).map((type) => (
                            <button
                              key={type}
                              onClick={() => setCampaignType(type)}
                              className={`flex-1 px-4 py-2 rounded-lg capitalize transition-all ${
                                campaignType === type
                                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                  : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Target Audience</label>
                        <select
                          value={selectedSegment}
                          onChange={(e) => setSelectedSegment(e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
                        >
                          <option value="">Select audience segment</option>
                          {audienceSegments.map((seg) => (
                            <option key={seg.id} value={seg.id}>
                              {seg.name} ({seg.count.toLocaleString()} contacts)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Email Content */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-cyan-400" />
                      Email Content
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-400">Subject Line</label>
                          <button
                            onClick={() => handleQuickGenerate('subject')}
                            disabled={isGenerating}
                            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                          >
                            <Wand2 className="w-3 h-3" />
                            Generate
                          </button>
                        </div>
                        <input
                          type="text"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="Enter a compelling subject line"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                        />
                        <p className="text-xs text-gray-500 mt-1">{subject.length}/60 characters (recommended)</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Preheader Text</label>
                        <input
                          type="text"
                          value={preheader}
                          onChange={(e) => setPreheader(e.target.value)}
                          placeholder="Preview text shown in email clients"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-400">Email Body</label>
                          <button
                            onClick={() => handleQuickGenerate('body')}
                            disabled={isGenerating}
                            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                          >
                            <Wand2 className="w-3 h-3" />
                            Generate
                          </button>
                        </div>
                        <textarea
                          value={emailBody}
                          onChange={(e) => setEmailBody(e.target.value)}
                          placeholder="Write your email content here... Supports HTML"
                          rows={8}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">CTA Button Text</label>
                          <input
                            type="text"
                            value={ctaText}
                            onChange={(e) => setCtaText(e.target.value)}
                            placeholder="e.g., Register Now"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">CTA URL</label>
                          <input
                            type="url"
                            value={ctaUrl}
                            onChange={(e) => setCtaUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scheduling */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-cyan-400" />
                      Schedule
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Date</label>
                        <input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Time</label>
                        <input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                      <div className="flex items-center gap-2 text-cyan-400 mb-1">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm font-medium">AI Recommendation</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Based on your audience's engagement patterns, the optimal send time is <strong className="text-white">Tuesday at 10:00 AM PST</strong>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveDraft}
                      className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-all"
                    >
                      Save Draft
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSendTest}
                      className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Send Test
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSchedule}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium shadow-lg shadow-cyan-500/25"
                    >
                      Schedule Campaign
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {[
                    { label: 'Total Sent', value: '12,456', change: '+8.2%', icon: <Send className="w-5 h-5" />, color: 'cyan' },
                    { label: 'Avg Open Rate', value: '34.2%', change: '+2.1%', icon: <MailOpen className="w-5 h-5" />, color: 'green' },
                    { label: 'Avg Click Rate', value: '8.7%', change: '+1.3%', icon: <MousePointerClick className="w-5 h-5" />, color: 'blue' },
                    { label: 'Unsubscribe Rate', value: '0.4%', change: '-0.1%', icon: <X className="w-5 h-5" />, color: 'orange' },
                  ].map((stat, idx) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 bg-${stat.color}-500/20 rounded-lg text-${stat.color}-400`}>
                          {stat.icon}
                        </div>
                        <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-400' : stat.change.startsWith('-') && stat.label === 'Unsubscribe Rate' ? 'text-green-400' : 'text-red-400'}`}>
                          {stat.change}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-sm text-gray-400">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Recent Campaign Performance */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/10">
                    <h3 className="font-semibold text-white">Recent Campaign Performance</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Campaign</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Sent</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Open Rate</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Click Rate</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaigns.filter(c => c.stats && c.stats.sent > 0).map((campaign) => (
                          <tr key={campaign.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="px-6 py-4">
                              <p className="text-white font-medium">{campaign.name}</p>
                              <p className="text-xs text-gray-500">{campaign.subject}</p>
                            </td>
                            <td className="px-6 py-4 text-gray-400">{campaign.stats?.sent.toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <span className="text-green-400 font-medium">{campaign.stats?.openRate}%</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-blue-400 font-medium">{campaign.stats?.clickRate}%</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${CAMPAIGN_STATUS_COLORS[campaign.status].bg} ${CAMPAIGN_STATUS_COLORS[campaign.status].text}`}>
                                {campaign.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
