'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Sparkles,
  MessageSquare,
  Image as ImageIcon,
  Link2,
  Calendar,
  Clock,
  Hash,
  AtSign,
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Eye,
  Copy,
  RefreshCw,
  ChevronRight,
  Mic,
  MicOff,
  Wand2,
  Check,
  X,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner'
import { useChat } from '@/lib/contexts/ChatContext'
import { signOut } from '@/lib/auth/hooks'

interface SocialPost {
  platform: string
  content: string
  hashtags: string[]
  mentions: string[]
  mediaUrl?: string
  linkUrl?: string
  linkTitle?: string
  scheduledAt?: string
  characterCount: number
  characterLimit: number
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  action?: 'generate' | 'refine' | 'schedule'
}

const PLATFORM_LIMITS: Record<string, number> = {
  twitter: 280,
  linkedin: 3000,
  facebook: 63206,
  instagram: 2200,
  threads: 500,
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  twitter: <Twitter className="w-5 h-5" />,
  linkedin: <Linkedin className="w-5 h-5" />,
  facebook: <Facebook className="w-5 h-5" />,
  instagram: <Instagram className="w-5 h-5" />,
  threads: <Globe className="w-5 h-5" />,
}

export default function SocialMediaPage() {
  const { userData, authLoading } = useChat()
  const [showContent, setShowContent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Form state
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['linkedin', 'twitter'])
  const [postContent, setPostContent] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [mentions, setMentions] = useState<string[]>([])
  const [mediaUrl, setMediaUrl] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [newHashtag, setNewHashtag] = useState('')
  const [newMention, setNewMention] = useState('')

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your social media assistant. Tell me what you'd like to post about, and I'll help craft engaging content for your selected platforms. I can also suggest hashtags, optimal posting times, and help refine your message.",
      timestamp: new Date(),
    },
  ])
  const [chatInput, setChatInput] = useState('')
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Preview state
  const [previewPlatform, setPreviewPlatform] = useState('linkedin')

  useEffect(() => {
    if (!authLoading && userData?.isAdmin) {
      setShowContent(true)
      return
    }
    const timeout = setTimeout(() => setShowContent(true), 2000)
    return () => clearTimeout(timeout)
  }, [authLoading, userData])

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

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    )
  }

  const addHashtag = () => {
    if (newHashtag && !hashtags.includes(newHashtag)) {
      setHashtags([...hashtags, newHashtag.replace(/^#/, '')])
      setNewHashtag('')
    }
  }

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter((t) => t !== tag))
  }

  const addMention = () => {
    if (newMention && !mentions.includes(newMention)) {
      setMentions([...mentions, newMention.replace(/^@/, '')])
      setNewMention('')
    }
  }

  const removeMention = (mention: string) => {
    setMentions(mentions.filter((m) => m !== mention))
  }

  const getCharacterCount = (platform: string) => {
    const baseCount = postContent.length
    const hashtagsCount = hashtags.map((h) => `#${h}`).join(' ').length
    const mentionsCount = mentions.map((m) => `@${m}`).join(' ').length
    const totalCount = baseCount + (hashtagsCount > 0 ? hashtagsCount + 1 : 0) + (mentionsCount > 0 ? mentionsCount + 1 : 0)
    return totalCount
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
      // Call AI to generate content
      const response = await fetch('/api/ai/social-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: chatInput,
          platforms: selectedPlatforms,
          currentContent: postContent,
          hashtags,
          mentions,
        }),
      })

      const data = await response.json()

      if (data.success && data.content) {
        // Update form fields with AI-generated content
        if (data.content.post) {
          setPostContent(data.content.post)
        }
        if (data.content.hashtags) {
          setHashtags(data.content.hashtags)
        }
        if (data.content.mentions) {
          setMentions(data.content.mentions)
        }

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message || "I've updated your post content. You can see the changes in the form fields. Feel free to edit or ask me to refine it further!",
          timestamp: new Date(),
          action: 'generate',
        }
        setChatMessages((prev) => [...prev, assistantMessage])
      } else {
        // Fallback response
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I understand you want to create a social post. Let me help you craft something engaging. What's the main message or topic you'd like to share?",
          timestamp: new Date(),
        }
        setChatMessages((prev) => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Error generating content:', error)
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again or manually enter your content in the form fields.",
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, assistantMessage])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleQuickAction = async (action: string) => {
    setIsGenerating(true)
    let prompt = ''

    switch (action) {
      case 'generate':
        prompt = `Generate a professional social media post for ${selectedPlatforms.join(' and ')}. Topic: ${postContent || 'AI transformation and business growth'}`
        break
      case 'hashtags':
        prompt = `Suggest relevant hashtags for this post: "${postContent}"`
        break
      case 'shorten':
        prompt = `Make this post more concise while keeping the key message: "${postContent}"`
        break
      case 'expand':
        prompt = `Expand this post with more detail and engagement: "${postContent}"`
        break
      case 'cta':
        prompt = `Add a compelling call-to-action to this post: "${postContent}"`
        break
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    }
    setChatMessages((prev) => [...prev, userMessage])

    try {
      const response = await fetch('/api/ai/social-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          platforms: selectedPlatforms,
          currentContent: postContent,
          hashtags,
          action,
        }),
      })

      const data = await response.json()

      if (data.success && data.content) {
        if (data.content.post) setPostContent(data.content.post)
        if (data.content.hashtags) setHashtags(data.content.hashtags)

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message || "Done! I've updated your content.",
          timestamp: new Date(),
          action: 'generate',
        }
        setChatMessages((prev) => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Quick action error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSchedulePost = async () => {
    if (!postContent || selectedPlatforms.length === 0) {
      alert('Please add content and select at least one platform')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/social/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: postContent,
          platforms: selectedPlatforms,
          hashtags,
          mentions,
          mediaUrl,
          linkUrl,
          linkTitle,
          scheduledAt: scheduledDate && scheduledTime
            ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
            : null,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: scheduledDate
            ? `Your post has been scheduled for ${new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()}. It will be published to: ${selectedPlatforms.join(', ')}.`
            : `Your post has been queued for immediate publishing to: ${selectedPlatforms.join(', ')}.`,
          timestamp: new Date(),
          action: 'schedule',
        }
        setChatMessages((prev) => [...prev, assistantMessage])

        // Clear form
        setPostContent('')
        setHashtags([])
        setMentions([])
        setMediaUrl('')
        setLinkUrl('')
        setLinkTitle('')
        setScheduledDate('')
        setScheduledTime('')
      }
    } catch (error) {
      console.error('Schedule error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!showContent) {
    return (
      <div className="min-h-screen bg-black">
        <DashboardSidebar onLogout={handleLogout} />
        <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 flex items-center justify-center min-h-screen">
          <LoadingSpinner variant="neural" size="xl" text="Loading Social Media..." />
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
              <Link href="/admin/outreach" className="p-2 hover:bg-white/10 rounded-lg transition-all">
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-white font-gendy">Social Media Composer</h1>
                  <span className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-400 rounded-full">AI-Powered</span>
                </div>
                <p className="text-gray-400 font-diatype">Create and schedule posts across platforms</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Split View */}
        <div className="flex h-[calc(100vh-120px)]">
          {/* Left Side - Form Fields */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {/* Platform Selection */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                Select Platforms
              </h3>
              <div className="flex flex-wrap gap-3">
                {Object.entries(PLATFORM_ICONS).map(([platform, icon]) => (
                  <button
                    key={platform}
                    onClick={() => togglePlatform(platform)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                      selectedPlatforms.includes(platform)
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {icon}
                    <span className="capitalize">{platform}</span>
                    {selectedPlatforms.includes(platform) && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Post Content */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-cyan-400" />
                  Post Content
                </h3>
                <div className="flex items-center gap-2">
                  {selectedPlatforms.map((platform) => {
                    const count = getCharacterCount(platform)
                    const limit = PLATFORM_LIMITS[platform]
                    const isOver = count > limit
                    return (
                      <span
                        key={platform}
                        className={`text-xs px-2 py-1 rounded ${
                          isOver ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-gray-400'
                        }`}
                      >
                        {platform}: {count}/{limit}
                      </span>
                    )
                  })}
                </div>
              </div>
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="What would you like to share? Ask the AI assistant to help you write engaging content..."
                className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
              />

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => handleQuickAction('generate')}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 text-sm hover:bg-cyan-500/30 transition-all disabled:opacity-50"
                >
                  <Wand2 className="w-4 h-4" />
                  Generate
                </button>
                <button
                  onClick={() => handleQuickAction('hashtags')}
                  disabled={isGenerating || !postContent}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 text-sm hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  <Hash className="w-4 h-4" />
                  Suggest Hashtags
                </button>
                <button
                  onClick={() => handleQuickAction('shorten')}
                  disabled={isGenerating || !postContent}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 text-sm hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  Shorten
                </button>
                <button
                  onClick={() => handleQuickAction('expand')}
                  disabled={isGenerating || !postContent}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 text-sm hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                  Expand
                </button>
                <button
                  onClick={() => handleQuickAction('cta')}
                  disabled={isGenerating || !postContent}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 text-sm hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  Add CTA
                </button>
              </div>
            </div>

            {/* Hashtags & Mentions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hashtags */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Hash className="w-5 h-5 text-cyan-400" />
                  Hashtags
                </h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newHashtag}
                    onChange={(e) => setNewHashtag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addHashtag()}
                    placeholder="Add hashtag..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                  />
                  <button
                    onClick={addHashtag}
                    className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-all"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-sm"
                    >
                      #{tag}
                      <button onClick={() => removeHashtag(tag)} className="hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Mentions */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <AtSign className="w-5 h-5 text-cyan-400" />
                  Mentions
                </h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newMention}
                    onChange={(e) => setNewMention(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addMention()}
                    placeholder="Add mention..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                  />
                  <button
                    onClick={addMention}
                    className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-all"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {mentions.map((mention) => (
                    <span
                      key={mention}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-500/10 text-[var(--hg-cyan-text)] rounded-full text-sm"
                    >
                      @{mention}
                      <button onClick={() => removeMention(mention)} className="hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Media & Link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Media */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-cyan-400" />
                  Media
                </h3>
                <input
                  type="text"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="Image or video URL..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
                {mediaUrl && (
                  <div className="mt-3 relative rounded-lg overflow-hidden aspect-video bg-gray-800">
                    <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Link */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-cyan-400" />
                  Link Preview
                </h3>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="URL to include..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 mb-3"
                />
                <input
                  type="text"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="Link title (optional)..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                Schedule
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Time</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Leave empty to post immediately, or select a date and time to schedule.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all">
                <Eye className="w-5 h-5" />
                Preview
              </button>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all">
                  <Copy className="w-5 h-5" />
                  Save Draft
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSchedulePost}
                  disabled={loading || !postContent || selectedPlatforms.length === 0}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" variant="pulse" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {scheduledDate ? 'Schedule Post' : 'Post Now'}
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Right Side - AI Chat Assistant */}
          <div className="w-96 border-l border-white/10 bg-black/50 flex flex-col">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                AI Assistant
              </h3>
              <p className="text-sm text-gray-400">Chat to generate and refine content</p>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {chatMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-cyan-500/20 text-white'
                          : 'bg-white/5 text-gray-300'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      {message.action === 'generate' && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-cyan-400">
                          <Check className="w-3 h-3" />
                          Content updated in form
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/5 rounded-2xl px-4 py-3">
                    <LoadingSpinner size="sm" variant="dna" />
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleChatSubmit} className="p-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsVoiceActive(!isVoiceActive)}
                  className={`p-2 rounded-lg transition-all ${
                    isVoiceActive
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {isVoiceActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask AI to help write your post..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isGenerating}
                  className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-all disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
