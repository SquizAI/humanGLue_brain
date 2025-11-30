'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Sparkles,
  Send,
  Users,
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
  MapPin,
  Video,
  Globe,
  Bell,
  Mail,
  Share2,
  Linkedin,
  Twitter,
  Facebook,
  CheckCircle,
  AlertCircle,
  Settings,
  Filter,
  Search,
  ChevronDown,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner'
import { useChat } from '@/lib/contexts/ChatContext'
import { signOut } from '@/lib/auth/hooks'

interface Workshop {
  id: string
  title: string
  description: string
  date: string
  time: string
  timezone: string
  duration: string
  type: 'virtual' | 'in-person' | 'hybrid'
  location?: string
  virtualLink?: string
  instructor: {
    name: string
    title: string
    avatar?: string
  }
  capacity: number
  registered: number
  status: 'draft' | 'published' | 'promoted' | 'completed' | 'cancelled'
  registrationUrl: string
  tags: string[]
  promotionPlan?: PromotionPlan
}

interface PromotionPlan {
  id: string
  workshopId: string
  status: 'pending' | 'active' | 'completed'
  scheduledPosts: ScheduledPost[]
  emailCampaigns: EmailCampaign[]
}

interface ScheduledPost {
  id: string
  platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram'
  content: string
  scheduledAt: string
  status: 'scheduled' | 'posted' | 'failed'
  daysBeforeEvent: number
}

interface EmailCampaign {
  id: string
  type: 'announcement' | 'reminder' | 'lastCall'
  subject: string
  scheduledAt: string
  status: 'scheduled' | 'sent'
  daysBeforeEvent: number
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  action?: 'generate' | 'schedule' | 'plan'
}

const WORKSHOP_STATUS_COLORS: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  draft: { bg: 'bg-gray-500/20', text: 'text-gray-400', icon: <FileText className="w-4 h-4" /> },
  published: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: <Globe className="w-4 h-4" /> },
  promoted: { bg: 'bg-green-500/20', text: 'text-green-400', icon: <TrendingUp className="w-4 h-4" /> },
  completed: { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: <CheckCircle className="w-4 h-4" /> },
  cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', icon: <X className="w-4 h-4" /> },
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  linkedin: <Linkedin className="w-4 h-4" />,
  twitter: <Twitter className="w-4 h-4" />,
  facebook: <Facebook className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
}

export default function WorkshopAnnouncementsPage() {
  const { userData, authLoading } = useChat()
  const [showContent, setShowContent] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  // View state
  const [activeView, setActiveView] = useState<'workshops' | 'promotions' | 'calendar'>('workshops')
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showPromotionModal, setShowPromotionModal] = useState(false)

  // Workshop data
  const [workshops, setWorkshops] = useState<Workshop[]>([])

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your workshop promotion assistant. I can help you create a complete promotion strategy for your workshops, including social media posts, email campaigns, and optimal timing. Select a workshop or tell me about a new one you'd like to promote!",
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
      fetchWorkshops()
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

  const fetchWorkshops = async () => {
    setLoading(true)
    try {
      // Mock data - would connect to real API
      setWorkshops([
        {
          id: '1',
          title: 'AI Strategy for Enterprise Leaders',
          description: 'A comprehensive workshop on developing and implementing AI strategies for Fortune 1000 companies. Learn from real-world case studies and hands-on exercises.',
          date: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
          time: '10:00',
          timezone: 'America/Los_Angeles',
          duration: '3 hours',
          type: 'virtual',
          virtualLink: 'https://zoom.us/j/123456789',
          instructor: {
            name: 'Dr. Sarah Chen',
            title: 'Chief AI Strategist',
          },
          capacity: 50,
          registered: 32,
          status: 'promoted',
          registrationUrl: 'https://humanglue.com/workshops/ai-strategy',
          tags: ['AI Strategy', 'Leadership', 'Enterprise'],
          promotionPlan: {
            id: 'pp1',
            workshopId: '1',
            status: 'active',
            scheduledPosts: [
              { id: 'sp1', platform: 'linkedin', content: 'Join us for...', scheduledAt: new Date(Date.now() + 86400000 * 7).toISOString(), status: 'scheduled', daysBeforeEvent: 7 },
              { id: 'sp2', platform: 'twitter', content: 'Last chance...', scheduledAt: new Date(Date.now() + 86400000 * 1).toISOString(), status: 'scheduled', daysBeforeEvent: 1 },
            ],
            emailCampaigns: [
              { id: 'ec1', type: 'announcement', subject: 'New Workshop: AI Strategy', scheduledAt: new Date(Date.now() - 86400000 * 7).toISOString(), status: 'sent', daysBeforeEvent: 21 },
              { id: 'ec2', type: 'reminder', subject: '1 Week Left to Register', scheduledAt: new Date(Date.now() + 86400000 * 7).toISOString(), status: 'scheduled', daysBeforeEvent: 7 },
            ],
          },
        },
        {
          id: '2',
          title: 'Change Management in AI Transformation',
          description: 'Master the human side of AI transformation. This workshop covers resistance patterns, adoption strategies, and building change-ready cultures.',
          date: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
          time: '14:00',
          timezone: 'America/New_York',
          duration: '4 hours',
          type: 'hybrid',
          location: 'Miami Convention Center',
          virtualLink: 'https://zoom.us/j/987654321',
          instructor: {
            name: 'Marcus Johnson',
            title: 'Head of Transformation',
          },
          capacity: 100,
          registered: 45,
          status: 'published',
          registrationUrl: 'https://humanglue.com/workshops/change-management',
          tags: ['Change Management', 'Culture', 'HR'],
        },
        {
          id: '3',
          title: 'Hands-On AI Tools Workshop',
          description: 'Get practical experience with the latest AI tools. From prompt engineering to AI-assisted workflows, learn to work smarter with AI.',
          date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
          time: '09:00',
          timezone: 'America/Chicago',
          duration: '2 hours',
          type: 'virtual',
          virtualLink: 'https://zoom.us/j/555555555',
          instructor: {
            name: 'Emily Rodriguez',
            title: 'AI Implementation Lead',
          },
          capacity: 30,
          registered: 28,
          status: 'promoted',
          registrationUrl: 'https://humanglue.com/workshops/ai-tools',
          tags: ['AI Tools', 'Practical', 'Hands-On'],
          promotionPlan: {
            id: 'pp2',
            workshopId: '3',
            status: 'active',
            scheduledPosts: [
              { id: 'sp3', platform: 'linkedin', content: 'Almost sold out!', scheduledAt: new Date(Date.now() + 86400000 * 1).toISOString(), status: 'scheduled', daysBeforeEvent: 6 },
            ],
            emailCampaigns: [
              { id: 'ec3', type: 'lastCall', subject: 'Only 2 Spots Left!', scheduledAt: new Date(Date.now() + 86400000 * 1).toISOString(), status: 'scheduled', daysBeforeEvent: 6 },
            ],
          },
        },
      ])
    } catch (error) {
      console.error('Failed to fetch workshops:', error)
    } finally {
      setLoading(false)
    }
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
      // Determine if we have a workshop selected or need to generate general content
      const workshopContext = selectedWorkshop
        ? `Workshop: ${selectedWorkshop.title}\nDate: ${selectedWorkshop.date}\nType: ${selectedWorkshop.type}\nDescription: ${selectedWorkshop.description}`
        : 'No specific workshop selected'

      const response = await fetch('/api/communications/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'workshop',
          organizationId: userData?.organizationId || 'default',
          topic: chatInput,
          relatedEventId: selectedWorkshop?.id,
          platforms: ['linkedin', 'twitter', 'email'],
          includeCTA: true,
          includeHashtags: true,
        }),
      })

      const data = await response.json()

      let assistantContent = ''
      if (data.success && data.content) {
        assistantContent = `Here's the promotional content I've generated:\n\n**Main Post:**\n${data.content.content}\n\n`

        if (data.content.variants && data.content.variants.length > 0) {
          assistantContent += '**Platform Variants:**\n'
          data.content.variants.forEach((v: { platform: string; content: string }) => {
            assistantContent += `\n*${v.platform.toUpperCase()}:*\n${v.content}\n`
          })
        }

        if (data.content.metadata?.hashtags) {
          assistantContent += `\n**Suggested Hashtags:** ${data.content.metadata.hashtags.map((h: string) => `#${h}`).join(' ')}`
        }

        if (data.suggestions?.length > 0) {
          assistantContent += `\n\n**Recommendations:**\n${data.suggestions.map((s: string) => `- ${s}`).join('\n')}`
        }
      } else {
        // Generate a helpful planning response
        assistantContent = selectedWorkshop
          ? `I'll help you create a promotion strategy for "${selectedWorkshop.title}".\n\n**Suggested Timeline:**\n- 3 weeks before: Announcement email + LinkedIn post\n- 2 weeks before: Twitter thread + reminder email\n- 1 week before: Social media push across all platforms\n- 1 day before: Last call email + urgent social posts\n\nWould you like me to generate content for any of these touchpoints?`
          : "I'd love to help you promote a workshop! Please select a workshop from the list, or tell me about the workshop you'd like to promote (title, date, target audience)."
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
          content: "I encountered an issue generating the content. Let me help you manually. What specific promotional content do you need - social posts, emails, or a full campaign?",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGeneratePromotionPlan = async (workshop: Workshop) => {
    setSelectedWorkshop(workshop)
    setIsGenerating(true)

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: `Generate a complete promotion plan for "${workshop.title}"`,
      timestamp: new Date(),
    }
    setChatMessages((prev) => [...prev, userMessage])

    try {
      const response = await fetch('/api/communications/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'workshop',
          organizationId: userData?.organizationId || 'default',
          topic: `Complete promotion plan for ${workshop.title}`,
          relatedEventId: workshop.id,
          platforms: ['linkedin', 'twitter', 'email'],
          includeCTA: true,
          includeHashtags: true,
        }),
      })

      const data = await response.json()

      const daysUntil = Math.ceil((new Date(workshop.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

      let planContent = `**Promotion Plan for "${workshop.title}"**\n\n`
      planContent += `**Event Details:**\n`
      planContent += `- Date: ${new Date(workshop.date).toLocaleDateString()}\n`
      planContent += `- Time: ${workshop.time} ${workshop.timezone}\n`
      planContent += `- Days until event: ${daysUntil}\n`
      planContent += `- Capacity: ${workshop.capacity} (${workshop.registered} registered)\n\n`

      planContent += `**Recommended Promotion Timeline:**\n\n`

      if (daysUntil >= 14) {
        planContent += `**Week 1 (Now):**\n`
        planContent += `- Initial announcement email to all subscribers\n`
        planContent += `- LinkedIn post introducing the workshop\n`
        planContent += `- Twitter announcement thread\n\n`
      }

      if (daysUntil >= 7) {
        planContent += `**1 Week Before:**\n`
        planContent += `- Reminder email to engaged contacts\n`
        planContent += `- "1 Week Left" social posts\n`
        planContent += `- Share instructor bio/credentials\n\n`
      }

      if (daysUntil >= 3) {
        planContent += `**3 Days Before:**\n`
        planContent += `- Urgency-focused social posts\n`
        planContent += `- Highlight limited capacity\n\n`
      }

      planContent += `**1 Day Before:**\n`
      planContent += `- "Last Call" email\n`
      planContent += `- Final push across all social channels\n`
      planContent += `- Reminder to existing registrants\n\n`

      if (data.success && data.content) {
        planContent += `**Generated Content:**\n${data.content.content}\n`
      }

      planContent += `\n**Next Steps:**\nWould you like me to:\n1. Generate specific content for any of these touchpoints?\n2. Schedule the entire campaign automatically?\n3. Preview the email templates?`

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: planContent,
        timestamp: new Date(),
      }

      setChatMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error generating plan:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getDaysUntil = (date: string): number => {
    return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  }

  const getCapacityStatus = (workshop: Workshop): { status: string; color: string } => {
    const percentage = (workshop.registered / workshop.capacity) * 100
    if (percentage >= 90) return { status: 'Almost Full', color: 'text-red-400' }
    if (percentage >= 70) return { status: 'Filling Up', color: 'text-orange-400' }
    if (percentage >= 40) return { status: 'Good Availability', color: 'text-green-400' }
    return { status: 'Open', color: 'text-blue-400' }
  }

  const filteredWorkshops = workshops.filter((workshop) => {
    const matchesSearch = workshop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workshop.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || workshop.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (!showContent) {
    return (
      <div className="min-h-screen bg-black">
        <DashboardSidebar onLogout={handleLogout} />
        <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 flex items-center justify-center min-h-screen">
          <LoadingSpinner variant="neural" size="xl" text="Loading workshop announcements..." />
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
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-xl">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white font-gendy">Workshop Announcements</h1>
                <p className="text-gray-400 font-diatype">AI-powered promotion with automated scheduling</p>
              </div>
            </div>

            {/* View Tabs */}
            <div className="flex gap-2 mt-4">
              {[
                { id: 'workshops', label: 'Workshops', icon: <Calendar className="w-4 h-4" /> },
                { id: 'promotions', label: 'Active Promotions', icon: <TrendingUp className="w-4 h-4" /> },
                { id: 'calendar', label: 'Promotion Calendar', icon: <Clock className="w-4 h-4" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as 'workshops' | 'promotions' | 'calendar')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeView === tab.id
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
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
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Workshops List / Left Panel */}
            <div className="xl:col-span-2">
              <AnimatePresence mode="wait">
                {activeView === 'workshops' && (
                  <motion.div
                    key="workshops"
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
                          placeholder="Search workshops..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                        />
                      </div>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                      >
                        <option value="all">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="promoted">Promoted</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    {/* Workshops Grid */}
                    {loading ? (
                      <div className="flex items-center justify-center py-20">
                        <LoadingSpinner variant="neural" size="lg" text="Loading workshops..." />
                      </div>
                    ) : filteredWorkshops.length === 0 ? (
                      <div className="text-center py-20">
                        <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No workshops found</h3>
                        <p className="text-gray-400">Create a workshop to start promoting</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredWorkshops.map((workshop) => {
                          const daysUntil = getDaysUntil(workshop.date)
                          const capacityStatus = getCapacityStatus(workshop)

                          return (
                            <motion.div
                              key={workshop.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`bg-white/5 backdrop-blur-xl border rounded-xl overflow-hidden transition-all cursor-pointer ${
                                selectedWorkshop?.id === workshop.id
                                  ? 'border-purple-500/50 ring-2 ring-purple-500/20'
                                  : 'border-white/10 hover:border-purple-500/30'
                              }`}
                              onClick={() => setSelectedWorkshop(workshop)}
                            >
                              <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${WORKSHOP_STATUS_COLORS[workshop.status].bg}`}>
                                      {WORKSHOP_STATUS_COLORS[workshop.status].icon}
                                      <span className={`text-sm font-medium capitalize ${WORKSHOP_STATUS_COLORS[workshop.status].text}`}>
                                        {workshop.status}
                                      </span>
                                    </div>
                                    {daysUntil <= 7 && daysUntil > 0 && (
                                      <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium">
                                        {daysUntil} days left
                                      </span>
                                    )}
                                    {daysUntil <= 0 && workshop.status !== 'completed' && (
                                      <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">
                                        Today!
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {workshop.type === 'virtual' && <Video className="w-4 h-4 text-blue-400" />}
                                    {workshop.type === 'in-person' && <MapPin className="w-4 h-4 text-green-400" />}
                                    {workshop.type === 'hybrid' && <Globe className="w-4 h-4 text-purple-400" />}
                                    <span className="text-xs text-gray-500 capitalize">{workshop.type}</span>
                                  </div>
                                </div>

                                <h3 className="text-lg font-semibold text-white mb-2">{workshop.title}</h3>
                                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{workshop.description}</p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div className="flex items-center gap-2 text-gray-400">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(workshop.date).toLocaleDateString()}
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-400">
                                    <Clock className="w-4 h-4" />
                                    {workshop.time} {workshop.timezone}
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-400">
                                    <Users className="w-4 h-4" />
                                    {workshop.registered}/{workshop.capacity}
                                  </div>
                                  <div className={`font-medium ${capacityStatus.color}`}>
                                    {capacityStatus.status}
                                  </div>
                                </div>

                                {workshop.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-4">
                                    {workshop.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="px-2 py-1 bg-white/5 text-gray-400 rounded text-xs"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleGeneratePromotionPlan(workshop)
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium shadow-lg shadow-purple-500/25"
                                  >
                                    <Wand2 className="w-4 h-4" />
                                    Generate Promotion Plan
                                  </motion.button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      window.open(workshop.registrationUrl, '_blank')
                                    }}
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                                  >
                                    <ExternalLink className="w-4 h-4 text-gray-400" />
                                  </button>
                                </div>
                              </div>

                              {/* Promotion Progress Bar */}
                              {workshop.promotionPlan && (
                                <div className="px-6 py-3 bg-purple-500/10 border-t border-purple-500/20">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-purple-400 font-medium">Promotion Progress</span>
                                    <span className="text-xs text-gray-400">
                                      {workshop.promotionPlan.scheduledPosts.filter(p => p.status === 'posted').length +
                                       workshop.promotionPlan.emailCampaigns.filter(e => e.status === 'sent').length}
                                      /{workshop.promotionPlan.scheduledPosts.length + workshop.promotionPlan.emailCampaigns.length} completed
                                    </span>
                                  </div>
                                  <div className="flex gap-1">
                                    {[...workshop.promotionPlan.scheduledPosts, ...workshop.promotionPlan.emailCampaigns].map((item, idx) => (
                                      <div
                                        key={idx}
                                        className={`h-2 flex-1 rounded-full ${
                                          'status' in item && (item.status === 'posted' || item.status === 'sent')
                                            ? 'bg-green-500'
                                            : 'bg-purple-500/50'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeView === 'promotions' && (
                  <motion.div
                    key="promotions"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="text-xl font-semibold text-white">Active Promotion Campaigns</h2>
                    {workshops.filter(w => w.promotionPlan).map((workshop) => (
                      <div
                        key={workshop.id}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-white">{workshop.title}</h3>
                          <span className="text-sm text-purple-400">{getDaysUntil(workshop.date)} days until event</span>
                        </div>

                        <div className="space-y-3">
                          {workshop.promotionPlan?.scheduledPosts.map((post) => (
                            <div
                              key={post.id}
                              className="flex items-center gap-4 p-3 bg-white/5 rounded-lg"
                            >
                              <div className={`p-2 rounded-lg ${
                                post.platform === 'linkedin' ? 'bg-blue-500/20 text-blue-400' :
                                post.platform === 'twitter' ? 'bg-sky-500/20 text-sky-400' :
                                'bg-indigo-500/20 text-indigo-400'
                              }`}>
                                {PLATFORM_ICONS[post.platform]}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-white line-clamp-1">{post.content}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(post.scheduledAt).toLocaleDateString()} at{' '}
                                  {new Date(post.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                post.status === 'posted' ? 'bg-green-500/20 text-green-400' :
                                post.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {post.status}
                              </span>
                            </div>
                          ))}

                          {workshop.promotionPlan?.emailCampaigns.map((campaign) => (
                            <div
                              key={campaign.id}
                              className="flex items-center gap-4 p-3 bg-white/5 rounded-lg"
                            >
                              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                                <Mail className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-white">{campaign.subject}</p>
                                <p className="text-xs text-gray-500">
                                  {campaign.type} email - {new Date(campaign.scheduledAt).toLocaleDateString()}
                                </p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                campaign.status === 'sent' ? 'bg-green-500/20 text-green-400' :
                                'bg-blue-500/20 text-blue-400'
                              }`}>
                                {campaign.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeView === 'calendar' && (
                  <motion.div
                    key="calendar"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
                  >
                    <h2 className="text-xl font-semibold text-white mb-6">Upcoming Promotions</h2>

                    <div className="space-y-4">
                      {/* Timeline view of all scheduled promotions */}
                      {workshops
                        .filter((w) => w.promotionPlan)
                        .flatMap((w) => [
                          ...w.promotionPlan!.scheduledPosts.map((p) => ({
                            ...p,
                            workshopTitle: w.title,
                            type: 'social' as const,
                          })),
                          ...w.promotionPlan!.emailCampaigns.map((e) => ({
                            ...e,
                            workshopTitle: w.title,
                            type: 'email' as const,
                            platform: 'email' as const,
                            content: e.subject,
                          })),
                        ])
                        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                        .slice(0, 10)
                        .map((item, idx) => (
                          <div
                            key={`${item.type}-${item.id}`}
                            className="flex items-start gap-4"
                          >
                            <div className="flex flex-col items-center">
                              <div className={`p-2 rounded-lg ${
                                item.type === 'email' ? 'bg-cyan-500/20 text-cyan-400' :
                                item.platform === 'linkedin' ? 'bg-blue-500/20 text-blue-400' :
                                item.platform === 'twitter' ? 'bg-sky-500/20 text-sky-400' :
                                'bg-indigo-500/20 text-indigo-400'
                              }`}>
                                {item.type === 'email' ? <Mail className="w-4 h-4" /> : PLATFORM_ICONS[item.platform]}
                              </div>
                              {idx < 9 && <div className="w-0.5 h-full bg-white/10 mt-2" />}
                            </div>
                            <div className="flex-1 pb-6">
                              <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                                <span>{new Date(item.scheduledAt).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>{new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p className="text-white font-medium">{item.workshopTitle}</p>
                              <p className="text-sm text-gray-400 line-clamp-2">{item.content}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* AI Chat Assistant - Right Panel */}
            <div className="xl:col-span-1">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden flex flex-col h-[calc(100vh-280px)] sticky top-32">
                <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Promotion Assistant</h3>
                    <p className="text-xs text-gray-400">
                      {selectedWorkshop ? `Planning for: ${selectedWorkshop.title}` : 'Select a workshop to start'}
                    </p>
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
                        className={`max-w-[90%] px-4 py-3 rounded-2xl ${
                          msg.role === 'user'
                            ? 'bg-purple-500/20 text-white rounded-br-none'
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
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
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
                      placeholder={selectedWorkshop ? "Ask about this workshop..." : "Select a workshop to start..."}
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                      disabled={isGenerating}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={isGenerating || !chatInput.trim()}
                      className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Quick Actions */}
                  {selectedWorkshop && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {[
                        'Generate LinkedIn post',
                        'Create email sequence',
                        'Urgency messaging',
                        'Last-minute promo',
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
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
