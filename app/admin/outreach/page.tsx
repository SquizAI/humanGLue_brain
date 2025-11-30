'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { signOut } from '@/lib/auth/hooks'
import {
  Send,
  Mic,
  MicOff,
  User,
  Bot,
  Sparkles,
  Search,
  Mail,
  Globe,
  Linkedin,
  Building,
  CheckCircle,
  AlertCircle,
  Loader2,
  Volume2,
  VolumeX,
  Database,
  Network,
  X,
  ChevronRight,
  Clock,
  UserPlus,
  GraduationCap,
  Briefcase,
  Handshake,
  Phone,
  MessageSquare,
  Share2,
  Newspaper,
  Calendar,
  Twitter,
  Instagram,
  Brain,
  Zap,
} from 'lucide-react'
import Vapi from '@vapi-ai/web'

// Communication channel types
type CommunicationChannel = 'email' | 'social' | 'newsletter' | 'workshop'

const channelInfo: Record<CommunicationChannel, { label: string; icon: React.ReactNode; description: string }> = {
  email: {
    label: 'Email Outreach',
    icon: <Mail className="w-5 h-5" />,
    description: 'Research prospects and send personalized emails'
  },
  social: {
    label: 'Social Media',
    icon: <Share2 className="w-5 h-5" />,
    description: 'Create and schedule social media content'
  },
  newsletter: {
    label: 'Newsletter',
    icon: <Newspaper className="w-5 h-5" />,
    description: 'Generate and send newsletters to subscribers'
  },
  workshop: {
    label: 'Workshops',
    icon: <Calendar className="w-5 h-5" />,
    description: 'Announce and promote upcoming workshops'
  },
}

// Types
interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    type?: 'research' | 'email' | 'profile' | 'action'
    prospectData?: ProspectProfile
    emailDraft?: EmailDraft
    graphNode?: any
  }
}

interface ProspectProfile {
  id?: string
  name: string
  title?: string
  company?: string
  email?: string
  phone?: string
  linkedinUrl?: string
  websiteUrl?: string
  bio?: string
  achievements: string[]
  expertise: string[]
  publications?: string[]
  socialProof: string[]
  sourceUrls: string[]
  researchedAt?: Date
  storedInGraph?: boolean
}

interface EmailDraft {
  subject: string
  personalizedIntro: string
  discoveredFacts: string[]
  whyTheyFit: string
  opportunity: string[]
  recipientName: string
  recipientEmail?: string
  senderName: string
  senderTitle: string
  senderEmail: string
  prospectType: string
}

type ProspectType = 'expert' | 'instructor' | 'student' | 'partner'

const prospectTypeInfo: Record<ProspectType, { label: string; icon: React.ReactNode; color: string }> = {
  expert: { label: 'Expert Advisor', icon: <Sparkles className="w-4 h-4" />, color: 'cyan' },
  instructor: { label: 'Instructor', icon: <GraduationCap className="w-4 h-4" />, color: 'blue' },
  student: { label: 'Beta Student', icon: <UserPlus className="w-4 h-4" />, color: 'green' },
  partner: { label: 'Strategic Partner', icon: <Handshake className="w-4 h-4" />, color: 'amber' },
}

export default function CommunicationsHubPage() {
  // Channel state
  const [activeChannel, setActiveChannel] = useState<CommunicationChannel>('email')

  // Get initial message based on channel
  const getChannelWelcomeMessage = (channel: CommunicationChannel): string => {
    switch (channel) {
      case 'email':
        return `Hi! I'm your AI Outreach Assistant. I can help you research prospects, build detailed profiles, and craft personalized recruitment emails.

Just tell me who you'd like to reach out to. You can say something like:
- "Research Dr. Sarah Chen, AI researcher at Stanford"
- "Find information about John Smith from TechCorp"
- "I want to recruit an expert in machine learning"

You can also use voice - just click the microphone button!`
      case 'social':
        return `Welcome to Social Media Management! I can help you:

- **Create posts** for LinkedIn, Twitter, and Instagram
- **Schedule content** for optimal engagement times
- **Generate hashtags** and optimize captions
- **Repurpose content** across platforms

Try: "Write a LinkedIn post about AI transformation" or "Schedule a thread about HumanGlue"`
      case 'newsletter':
        return `Newsletter Generator ready! I can help you:

- **Draft newsletters** with engaging content
- **Curate topics** based on recent industry news
- **Personalize sections** for different audience segments
- **Preview and send** to your subscriber list

Try: "Create a newsletter about our latest AI features" or "Draft a weekly update for clients"`
      case 'workshop':
        return `Workshop Announcement System! I can help you:

- **Create announcements** for upcoming workshops
- **Generate registration pages** with details
- **Send reminders** to registered participants
- **Track RSVPs** and manage capacity

Try: "Announce our AI Maturity Workshop on Dec 15th" or "Send reminder for tomorrow's session"`
    }
  }

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: getChannelWelcomeMessage('email'),
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Voice state
  const [vapi, setVapi] = useState<Vapi | null>(null)
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceTranscript, setVoiceTranscript] = useState('')

  // Research state
  const [currentProspect, setCurrentProspect] = useState<ProspectProfile | null>(null)
  const [currentEmail, setCurrentEmail] = useState<EmailDraft | null>(null)
  const [prospectType, setProspectType] = useState<ProspectType>('expert')
  const [recentProspects, setRecentProspects] = useState<ProspectProfile[]>([])

  // UI state
  const [showProspectPanel, setShowProspectPanel] = useState(false)
  const [showEmailPreview, setShowEmailPreview] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Handle channel switching
  const switchChannel = (channel: CommunicationChannel) => {
    setActiveChannel(channel)
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: getChannelWelcomeMessage(channel),
        timestamp: new Date(),
      },
    ])
    setCurrentProspect(null)
    setCurrentEmail(null)
    setShowProspectPanel(false)
  }

  // Initialize VAPI
  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY
    if (publicKey) {
      try {
        const vapiInstance = new Vapi(publicKey)
        setVapi(vapiInstance)

        vapiInstance.on('call-start', () => {
          setIsVoiceActive(true)
          setIsListening(true)
        })

        vapiInstance.on('call-end', () => {
          setIsVoiceActive(false)
          setIsListening(false)
          setIsSpeaking(false)
        })

        vapiInstance.on('speech-start', () => {
          setIsSpeaking(true)
        })

        vapiInstance.on('speech-end', () => {
          setIsSpeaking(false)
        })

        vapiInstance.on('message', (message: any) => {
          console.log('[VAPI Message]', message)

          if (message.type === 'transcript' && message.transcriptType === 'final') {
            setVoiceTranscript(message.transcript)
            // Process voice input as chat message
            if (message.transcript.trim()) {
              handleSendMessage(message.transcript)
            }
          }

          if (message.type === 'function-call') {
            handleVoiceFunctionCall(message.functionCall)
          }
        })

        vapiInstance.on('error', (error: any) => {
          console.error('[VAPI Error]', error)
          addSystemMessage(`Voice error: ${error.message || 'Unknown error'}`)
        })

      } catch (err) {
        console.error('[VAPI] Failed to initialize:', err)
      }
    }

    return () => {
      if (vapi) {
        vapi.stop()
      }
    }
  }, [])

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      await signOut()
      localStorage.removeItem('humanglue_user')
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      window.location.href = '/login'
    }
  }

  const addMessage = (role: ChatMessage['role'], content: string, metadata?: ChatMessage['metadata']) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      metadata,
    }
    setMessages(prev => [...prev, newMessage])
    return newMessage
  }

  const addSystemMessage = (content: string) => {
    addMessage('system', content)
  }

  const handleVoiceFunctionCall = async (functionCall: any) => {
    const { name, parameters } = functionCall

    switch (name) {
      case 'research_prospect':
        await performResearch(parameters.name, parameters.context)
        break
      case 'send_email':
        await sendEmail()
        break
      case 'change_prospect_type':
        setProspectType(parameters.type)
        addMessage('assistant', `Got it! I'll focus on recruiting them as a ${prospectTypeInfo[parameters.type as ProspectType].label}.`)
        break
    }
  }

  const performResearch = async (name: string, context?: string) => {
    setIsProcessing(true)
    addMessage('assistant', `Researching ${name}... I'll gather information from multiple sources and build a comprehensive profile.`, {
      type: 'research',
    })

    try {
      // Call the research API with deep research flag
      const response = await fetch('/api/outreach/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          context: context || '',
          prospectType,
          deepResearch: true,
          storeInGraph: true,
          senderName: 'Matty Squarzoni',
          senderTitle: 'Co-Founder & CTO, HumanGlue',
          senderEmail: 'matty@humanglue.ai',
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Research failed')
      }

      // Update prospect state
      const prospect: ProspectProfile = {
        ...data.prospect,
        storedInGraph: data.storedInGraph || false,
      }
      setCurrentProspect(prospect)
      setCurrentEmail(data.suggestedEmail)
      setRecentProspects(prev => [prospect, ...prev.slice(0, 4)])
      setShowProspectPanel(true)

      // Build research summary
      const summaryParts = []
      if (prospect.title) summaryParts.push(`**${prospect.title}**`)
      if (prospect.company) summaryParts.push(`at ${prospect.company}`)
      if (prospect.bio) summaryParts.push(`\n\n${prospect.bio}`)

      if (prospect.achievements.length > 0) {
        summaryParts.push(`\n\n**Key Achievements:**\n${prospect.achievements.map(a => `- ${a}`).join('\n')}`)
      }

      if (prospect.expertise.length > 0) {
        summaryParts.push(`\n\n**Expertise:** ${prospect.expertise.join(', ')}`)
      }

      const graphNote = prospect.storedInGraph
        ? '\n\n*Profile saved to knowledge graph for future reference.*'
        : ''

      addMessage('assistant',
        `I've completed my research on **${prospect.name}**!\n\n${summaryParts.join('')}${graphNote}\n\nI've also drafted a personalized email. Would you like to review it?`,
        { type: 'profile', prospectData: prospect }
      )

    } catch (error) {
      console.error('Research error:', error)
      addMessage('assistant', `I encountered an issue while researching: ${error instanceof Error ? error.message : 'Unknown error'}. Would you like me to try again?`)
    } finally {
      setIsProcessing(false)
    }
  }

  const sendEmail = async () => {
    if (!currentEmail || !currentProspect) {
      addMessage('assistant', "I don't have an email ready to send. Would you like me to research someone first?")
      return
    }

    if (!currentProspect.email) {
      addMessage('assistant', `I couldn't find an email address for ${currentProspect.name}. Could you provide their email?`)
      return
    }

    setIsProcessing(true)
    addMessage('assistant', `Sending personalized email to ${currentProspect.name}...`)

    try {
      const response = await fetch('/api/outreach/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentEmail,
          recipientEmail: currentProspect.email,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to send email')
      }

      addMessage('assistant', `Email sent successfully to ${currentProspect.email}! The message was personalized based on the research I gathered. Would you like to research another prospect?`, {
        type: 'action',
      })

      // Clear current prospect after successful send
      setCurrentProspect(null)
      setCurrentEmail(null)
      setShowProspectPanel(false)

    } catch (error) {
      console.error('Send error:', error)
      addMessage('assistant', `Failed to send the email: ${error instanceof Error ? error.message : 'Unknown error'}. Would you like me to try again?`)
    } finally {
      setIsProcessing(false)
    }
  }

  const parseUserIntent = (message: string) => {
    const lowerMessage = message.toLowerCase()

    // Research intent
    if (
      lowerMessage.includes('research') ||
      lowerMessage.includes('find') ||
      lowerMessage.includes('look up') ||
      lowerMessage.includes('who is') ||
      lowerMessage.includes('tell me about') ||
      lowerMessage.includes('information on') ||
      lowerMessage.includes('recruit')
    ) {
      // Extract name (simple extraction - could be enhanced with NLP)
      const nameMatch = message.match(/(?:research|find|look up|who is|tell me about|information on|recruit)\s+(.+?)(?:\s+from|\s+at|\s+who|\s*$)/i)
      if (nameMatch) {
        return { intent: 'research', name: nameMatch[1].trim() }
      }
      return { intent: 'research_prompt' }
    }

    // Send email intent
    if (
      lowerMessage.includes('send') ||
      lowerMessage.includes('email') ||
      lowerMessage.includes('reach out')
    ) {
      if (currentEmail && currentProspect) {
        return { intent: 'send_email' }
      }
      return { intent: 'no_email_ready' }
    }

    // Review email intent
    if (lowerMessage.includes('review') || lowerMessage.includes('preview') || lowerMessage.includes('show')) {
      if (currentEmail) {
        return { intent: 'show_email' }
      }
    }

    // Change prospect type
    for (const [type, info] of Object.entries(prospectTypeInfo)) {
      if (lowerMessage.includes(type) || lowerMessage.includes(info.label.toLowerCase())) {
        return { intent: 'change_type', type: type as ProspectType }
      }
    }

    // Provide email address
    const emailMatch = message.match(/[\w.-]+@[\w.-]+\.\w+/)
    if (emailMatch && currentProspect && !currentProspect.email) {
      return { intent: 'provide_email', email: emailMatch[0] }
    }

    return { intent: 'unknown' }
  }

  const handleSendMessage = async (message?: string) => {
    const text = message || inputValue.trim()
    if (!text) return

    setInputValue('')
    addMessage('user', text)

    const intent = parseUserIntent(text)

    switch (intent.intent) {
      case 'research':
        await performResearch(intent.name!)
        break

      case 'research_prompt':
        addMessage('assistant', "I'd be happy to research someone for you! Just give me a name. You can also include their company or role for better results.\n\nFor example: 'Research Sarah Chen, AI researcher at Stanford'")
        break

      case 'send_email':
        await sendEmail()
        break

      case 'no_email_ready':
        addMessage('assistant', "I haven't prepared an email yet. Would you like me to research someone first? Just give me a name and I'll create a personalized outreach.")
        break

      case 'show_email':
        setShowEmailPreview(true)
        addMessage('assistant', "Here's the email I've drafted. You can see it in the preview panel on the right. Let me know if you'd like any changes!")
        break

      case 'change_type':
        setProspectType(intent.type!)
        addMessage('assistant', `Got it! I'll now focus on recruiting prospects as ${prospectTypeInfo[intent.type!].label}s. This will adjust how I frame the opportunity in emails.`)
        break

      case 'provide_email':
        if (currentProspect) {
          setCurrentProspect({ ...currentProspect, email: intent.email })
          addMessage('assistant', `Thanks! I've added ${intent.email} for ${currentProspect.name}. Would you like me to send the email now?`)
        }
        break

      default:
        // Use AI to respond conversationally
        addMessage('assistant', `I understand you said: "${text}"\n\nI'm best at:\n- **Researching** prospects (try "Research [name]")\n- **Drafting** personalized emails\n- **Sending** outreach messages\n\nHow can I help you today?`)
    }
  }

  const startVoiceSession = async () => {
    if (!vapi) {
      addSystemMessage('Voice assistant not available. Please check your VAPI configuration.')
      return
    }

    try {
      await vapi.start({
        model: {
          provider: 'openai' as const,
          model: 'gpt-4' as const,
          messages: [
            {
              role: 'system' as const,
              content: `You are HumanGlue's AI Outreach Assistant. Help users research prospects and send personalized recruitment emails.

Available functions:
- research_prospect(name, context): Research a person and build their profile
- send_email(): Send the drafted email to the current prospect
- change_prospect_type(type): Change the recruitment type (expert, instructor, student, partner)

Current recruitment type: ${prospectType}
${currentProspect ? `Current prospect: ${currentProspect.name}` : 'No current prospect'}

Be conversational and helpful. Ask clarifying questions when needed.`,
            },
          ],
        },
        voice: {
          provider: 'playht' as const,
          voiceId: 'jennifer',
        },
        firstMessage: "Hi! I'm ready to help you with prospect research. Who would you like me to look up?",
        functions: [
          {
            name: 'research_prospect',
            description: 'Research a prospect and build their profile',
            parameters: {
              type: 'object' as const,
              properties: {
                name: { type: 'string' as const, description: 'Name of the person to research' },
                context: { type: 'string' as const, description: 'Additional context like company or role' },
              },
              required: ['name'],
            },
          },
          {
            name: 'send_email',
            description: 'Send the drafted email to the current prospect',
            parameters: {
              type: 'object' as const,
              properties: {},
            },
          },
          {
            name: 'change_prospect_type',
            description: 'Change the recruitment type',
            parameters: {
              type: 'object' as const,
              properties: {
                type: { type: 'string' as const, enum: ['expert', 'instructor', 'student', 'partner'] },
              },
              required: ['type'],
            },
          },
        ],
      } as any)
    } catch (error) {
      console.error('Failed to start voice session:', error)
      addSystemMessage('Failed to start voice session. Please try again.')
    }
  }

  const stopVoiceSession = () => {
    if (vapi) {
      vapi.stop()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        {/* Header */}
        <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-xl">
                  <MessageSquare className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white font-gendy">Communications Hub</h1>
                  <p className="text-sm text-gray-400 font-diatype">Multi-channel AI-powered communications</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-sm font-medium flex items-center gap-1.5 hover:bg-cyan-500/30 transition-all">
                  <Brain className="w-4 h-4" />
                  <span className="hidden sm:inline">Mind Reasoner</span>
                </button>
                <button className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-sm font-medium flex items-center gap-1.5 hover:bg-cyan-500/30 transition-all">
                  <Zap className="w-4 h-4" />
                  <span className="hidden sm:inline">Auto-Pilot</span>
                </button>
              </div>
            </div>

            {/* Channel Tabs */}
            <div className="flex items-center gap-1 mt-4 border-b border-white/5 -mb-4 pb-0">
              {Object.entries(channelInfo).map(([channel, info]) => (
                <button
                  key={channel}
                  onClick={() => switchChannel(channel as CommunicationChannel)}
                  className={`px-4 py-2.5 text-sm font-medium transition-all flex items-center gap-2 rounded-t-lg border-b-2 ${
                    activeChannel === channel
                      ? 'bg-white/5 text-cyan-400 border-cyan-400'
                      : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
                  }`}
                >
                  {info.icon}
                  <span className="hidden md:inline">{info.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prospect Type Selector (only show for email channel) */}
          {activeChannel === 'email' && (
            <div className="px-6 py-2 bg-gray-900/30 border-t border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 mr-2">Recruiting for:</span>
                {Object.entries(prospectTypeInfo).map(([type, info]) => (
                  <button
                    key={type}
                    onClick={() => setProspectType(type as ProspectType)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                      prospectType === type
                        ? `bg-${info.color}-500/20 text-${info.color}-400 border border-${info.color}-500/30`
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {info.icon}
                    <span className="hidden sm:inline">{info.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex h-[calc(100vh-80px)]">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : message.role === 'system'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {message.role === 'user' ? <User className="w-4 h-4" /> :
                       message.role === 'system' ? <AlertCircle className="w-4 h-4" /> :
                       <Bot className="w-4 h-4" />}
                    </div>

                    {/* Message Content */}
                    <div className={`max-w-[70%] ${message.role === 'user' ? 'text-right' : ''}`}>
                      <div className={`inline-block px-4 py-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-cyan-500/20 text-white'
                          : message.role === 'system'
                          ? 'bg-amber-500/10 text-amber-200 border border-amber-500/20'
                          : 'bg-white/5 text-gray-200'
                      }`}>
                        <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
                          {message.content.split('**').map((part, i) =>
                            i % 2 === 1 ? <strong key={i} className="text-white">{part}</strong> : part
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Processing Indicator */}
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  </div>
                  <div className="bg-white/5 px-4 py-3 rounded-2xl">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Search className="w-4 h-4 animate-pulse" />
                      <span className="text-sm">Researching...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-white/10 p-4 bg-gray-900/50">
              {/* Voice Status */}
              {isVoiceActive && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3 flex items-center gap-3 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg"
                >
                  <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                  <span className="text-sm text-cyan-300">
                    {isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Voice active'}
                  </span>
                  {voiceTranscript && (
                    <span className="text-sm text-gray-400 italic">&quot;{voiceTranscript}&quot;</span>
                  )}
                </motion.div>
              )}

              <div className="flex items-end gap-3">
                {/* Voice Button */}
                <button
                  onClick={isVoiceActive ? stopVoiceSession : startVoiceSession}
                  className={`p-3 rounded-xl transition-all ${
                    isVoiceActive
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                  }`}
                  title={isVoiceActive ? 'Stop voice' : 'Start voice'}
                >
                  {isVoiceActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* Text Input */}
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message or use voice..."
                    rows={1}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                  />
                </div>

                {/* Send Button */}
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isProcessing}
                  className="p-3 bg-gradient-to-r from-cyan-500 to-cyan-500 text-white rounded-xl hover:from-cyan-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Prospect Panel (Slide-out) */}
          <AnimatePresence>
            {(showProspectPanel || currentProspect) && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 400, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="border-l border-white/10 bg-gray-900/50 overflow-hidden"
              >
                <div className="w-[400px] h-full overflow-y-auto">
                  {/* Panel Header */}
                  <div className="sticky top-0 bg-gray-900/90 backdrop-blur-xl p-4 border-b border-white/10 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white font-gendy">Prospect Profile</h2>
                    <button
                      onClick={() => setShowProspectPanel(false)}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  {currentProspect ? (
                    <div className="p-4 space-y-4">
                      {/* Profile Header */}
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                          {currentProspect.name.charAt(0)}
                        </div>
                        <h3 className="mt-3 text-xl font-bold text-white">{currentProspect.name}</h3>
                        {currentProspect.title && (
                          <p className="text-gray-400">{currentProspect.title}</p>
                        )}
                        {currentProspect.company && (
                          <p className="text-cyan-400">{currentProspect.company}</p>
                        )}
                      </div>

                      {/* Graph Storage Badge */}
                      {currentProspect.storedInGraph && (
                        <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <Database className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-green-400">Stored in Knowledge Graph</span>
                        </div>
                      )}

                      {/* Contact Info */}
                      <div className="space-y-2">
                        {currentProspect.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Mail className="w-4 h-4 text-gray-500" />
                            {currentProspect.email}
                          </div>
                        )}
                        {currentProspect.linkedinUrl && (
                          <a
                            href={currentProspect.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                          >
                            <Linkedin className="w-4 h-4" />
                            LinkedIn Profile
                          </a>
                        )}
                        {currentProspect.websiteUrl && (
                          <a
                            href={currentProspect.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300"
                          >
                            <Globe className="w-4 h-4" />
                            Website
                          </a>
                        )}
                      </div>

                      {/* Bio */}
                      {currentProspect.bio && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-400 mb-2">About</h4>
                          <p className="text-sm text-gray-300">{currentProspect.bio}</p>
                        </div>
                      )}

                      {/* Achievements */}
                      {currentProspect.achievements.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-400 mb-2">Achievements</h4>
                          <ul className="space-y-1">
                            {currentProspect.achievements.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Expertise */}
                      {currentProspect.expertise.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-400 mb-2">Expertise</h4>
                          <div className="flex flex-wrap gap-2">
                            {currentProspect.expertise.map((item, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded text-xs"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="pt-4 space-y-2">
                        {currentEmail && (
                          <>
                            <button
                              onClick={() => setShowEmailPreview(true)}
                              className="w-full py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all flex items-center justify-center gap-2"
                            >
                              <Mail className="w-4 h-4" />
                              Preview Email
                            </button>
                            <button
                              onClick={sendEmail}
                              disabled={!currentProspect.email || isProcessing}
                              className="w-full py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                              <Send className="w-4 h-4" />
                              {currentProspect.email ? 'Send Email' : 'Need Email Address'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-gray-500" />
                      </div>
                      <p className="text-gray-400">
                        Research a prospect to see their profile here
                      </p>
                    </div>
                  )}

                  {/* Recent Prospects */}
                  {recentProspects.length > 0 && (
                    <div className="border-t border-white/10 p-4">
                      <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Recent Prospects
                      </h4>
                      <div className="space-y-2">
                        {recentProspects.map((prospect, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setCurrentProspect(prospect)
                              setShowProspectPanel(true)
                            }}
                            className="w-full p-2 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-all flex items-center gap-3"
                          >
                            <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400 text-sm font-bold">
                              {prospect.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{prospect.name}</p>
                              <p className="text-xs text-gray-500 truncate">
                                {prospect.title || prospect.company || 'No details'}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Email Preview Modal */}
        <AnimatePresence>
          {showEmailPreview && currentEmail && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowEmailPreview(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-900 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              >
                <div className="sticky top-0 bg-gray-900 border-b border-white/10 p-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Email Preview</h2>
                  <button
                    onClick={() => setShowEmailPreview(false)}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">To</label>
                    <p className="text-white">
                      {currentEmail.recipientName} {currentProspect?.email ? `<${currentProspect.email}>` : '(email needed)'}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Subject</label>
                    <p className="text-white font-medium">{currentEmail.subject}</p>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <div className="prose prose-invert prose-sm max-w-none">
                      <p>Dear {currentEmail.recipientName},</p>
                      <p>{currentEmail.personalizedIntro}</p>

                      {currentEmail.discoveredFacts.length > 0 && (
                        <>
                          <p>I was particularly impressed by:</p>
                          <ul>
                            {currentEmail.discoveredFacts.map((fact, i) => (
                              <li key={i} dangerouslySetInnerHTML={{ __html: fact }} />
                            ))}
                          </ul>
                        </>
                      )}

                      <p>{currentEmail.whyTheyFit}</p>

                      {currentEmail.opportunity.length > 0 && (
                        <>
                          <p>The opportunity includes:</p>
                          <ul>
                            {currentEmail.opportunity.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </>
                      )}

                      <p>Best regards,</p>
                      <p>
                        {currentEmail.senderName}<br />
                        {currentEmail.senderTitle}<br />
                        {currentEmail.senderEmail}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 bg-gray-900 border-t border-white/10 p-4 flex gap-3">
                  <button
                    onClick={() => setShowEmailPreview(false)}
                    className="flex-1 py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowEmailPreview(false)
                      sendEmail()
                    }}
                    disabled={!currentProspect?.email || isProcessing}
                    className="flex-1 py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send Now
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
