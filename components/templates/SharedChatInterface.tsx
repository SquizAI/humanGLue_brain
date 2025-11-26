'use client'

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, Mic, Paperclip, AlertCircle, WifiOff, RefreshCw, Brain } from 'lucide-react'
import { Text } from '../atoms'
import { Card, QuickResponse } from '../molecules'
import { ChatMessage, ModelSelector } from '../organisms'
import { Message, ChatState } from '../../lib/types'
import { AIModel } from '../../lib/mcp/types'
import { chatFlow } from '../../lib/chatFlow'
import { api } from '../../services/api'
import { modelConfigs } from '../../lib/mcp/models'
import { cn } from '../../utils/cn'
import { firecrawlService, CompanyInsights } from '../../services/firecrawl'
import { APIError } from '../../services/api'
import { retrieveContext, initializeRAG } from '../../lib/rag'

export interface SharedChatInterfaceProps {
  onStateChange: (state: ChatState, data?: any) => void
  userData: any
  chatState: ChatState
  messages: Message[]
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void
  suggestions: any[]
  setSuggestions: (suggestions: any[]) => void
  isCompact?: boolean
}

export interface SharedChatInterfaceRef {
  startConversation: () => void
  sendMessage: (message: string) => void
}

export const SharedChatInterface = forwardRef<SharedChatInterfaceRef, SharedChatInterfaceProps>(({
  onStateChange,
  userData,
  chatState,
  messages,
  setMessages,
  suggestions,
  setSuggestions,
  isCompact = false
}, ref) => {
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [selectedModel, setSelectedModel] = useState<AIModel>('claude-sonnet-4')
  const [error, setError] = useState<{ message: string; code?: string } | null>(null)
  const [companyInsights, setCompanyInsights] = useState<CompanyInsights | null>(null)
  const [isAnalyzingWebsite, setIsAnalyzingWebsite] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [citations, setCitations] = useState<Array<{ title: string; type: string; url: string }>>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const hasStarted = useRef(false)
  const localUserData = useRef(userData)
  const ragInitialized = useRef(false)

  useEffect(() => {
    localUserData.current = userData
  }, [userData])

  // Initialize RAG system
  useEffect(() => {
    if (!ragInitialized.current) {
      try {
        initializeRAG()
        ragInitialized.current = true
        console.log('RAG system initialized')
      } catch (error) {
        console.error('Failed to initialize RAG:', error)
      }
    }
  }, [])

  // Detect mobile and iOS
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    const userAgent = window.navigator.userAgent.toLowerCase()
    setIsIOS(/iphone|ipad|ipod/.test(userAgent))

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    if (hasStarted.current && messages.length > 0) {
      scrollToBottom()
    }
  }, [messages, suggestions])

  const startConversation = () => {
    if (hasStarted.current) return
    hasStarted.current = true

    setIsTyping(true)
    setTimeout(() => {
      const isAuthenticated = localUserData.current.authenticated === true

      const greeting = isAuthenticated
        ? `👋 Hi ${localUserData.current.name || 'there'}! I'm your AI Transformation Advisor.

I have access to your assessment results${localUserData.current.maturityScore ? ` (${localUserData.current.maturityScore}% maturity)` : ''} and can help you:

• Interpret your scores and identify priority actions
• Create implementation roadmaps
• Recommend specific platform resources
• Calculate ROI for initiatives
• Navigate your transformation journey

What would you like to work on today?`
        : chatFlow.getGreeting()

      setMessages([{
        id: '1',
        role: 'assistant',
        content: greeting,
        timestamp: new Date()
      }])
      setIsTyping(false)
      onStateChange('greeting')
      setSuggestions([])
    }, 2000)
  }

  useImperativeHandle(ref, () => ({
    startConversation,
    sendMessage: (message: string) => handleSend(message)
  }))

  useEffect(() => {
    if (!hasStarted.current && messages.length === 0) {
      setTimeout(() => {
        startConversation()
      }, 1500)
    } else if (messages.length > 0) {
      hasStarted.current = true
      if (chatState === 'initial' && userData.name) {
        onStateChange('greeting')
      }
    }
  }, [messages.length, chatState, userData.name])

  const analyzeCompanyWebsite = async (url: string, companyName: string) => {
    setIsAnalyzingWebsite(true)

    try {
      const insights = await firecrawlService.analyzeCompanyWebsite(url, companyName)
      setCompanyInsights(insights)

      const analysisMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `🔍 I've analyzed ${companyName}'s website and gathered some insights:

**Industry:** ${insights.industry}
**AI Readiness Score:** ${insights.aiReadiness?.score}/100

**Key Findings:**
${insights.keyInsights?.map(insight => `• ${insight}`).join('\n')}

**Recommended Next Steps:**
${insights.recommendations?.slice(0, 3).map(rec => `• ${rec}`).join('\n')}

This analysis helps me provide more personalized recommendations for your transformation journey.`,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, analysisMessage])
    } catch (error) {
      console.error('Website analysis error:', error)
    } finally {
      setIsAnalyzingWebsite(false)
    }
  }

  const handleSend = async (inputText?: string) => {
    const messageText = inputText || input
    if (!messageText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)
    setSuggestions([])
    setError(null)

    try {
      if (chatState === 'initial' || chatState === 'greeting' || chatState === 'discovery' || chatState === 'assessment' || chatState === 'solution' || chatState === 'booking' || chatState === 'completed') {
        const response = chatFlow.processResponse(chatState, messageText, localUserData.current)

        setTimeout(() => {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response.message,
            timestamp: new Date()
          }

          setMessages(prev => [...prev, assistantMessage])
          setIsTyping(false)

          if (response.suggestions) {
            setSuggestions(response.suggestions)
          }

          if (response.nextState) {
            const updatedUserData = { ...localUserData.current, ...response.data }
            localUserData.current = updatedUserData
            onStateChange(response.nextState, updatedUserData)
          } else if (response.data) {
            const updatedUserData = { ...localUserData.current, ...response.data }
            localUserData.current = updatedUserData
            onStateChange(chatState, updatedUserData)

            // Check if we have a URL to scrape
            if (response.data.urlToScrape && !companyInsights) {
              analyzeCompanyWebsite(response.data.urlToScrape, response.data.company || userData.company)
            }
          }
        }, 1500)
      } else {
        // Different system prompts for authenticated vs unauthenticated users
        const isAuthenticated = localUserData.current.authenticated === true

        // Retrieve relevant context from knowledge base
        let knowledgeContext = ''
        let retrievedCitations: Array<{ title: string; type: string; url: string }> = []

        try {
          const { context, citations } = retrieveContext(messageText, 5)
          knowledgeContext = context
          retrievedCitations = citations
          setCitations(citations)
        } catch (error) {
          console.error('Failed to retrieve context:', error)
        }

        const authenticatedSystemPrompt = `You are an AI Transformation Advisor with deep expertise in AI maturity assessment, organizational change management, and strategic AI implementation. You have access to the user's assessment data and can provide highly personalized, actionable guidance.

USER CONTEXT:
- Name: ${localUserData.current.name || 'User'}
- Company: ${localUserData.current.company || 'Organization'}
- Role: ${localUserData.current.role || 'Not specified'}
- Department: ${localUserData.current.department || 'Not specified'}

ASSESSMENT DATA (if available):
- Overall AI Maturity Score: ${localUserData.current.maturityScore || 'Not yet assessed'}
- Maturity Level: ${localUserData.current.maturityLevel || 'Not yet determined'}
- Strategy Alignment: ${localUserData.current.strategyScore || 'N/A'}/100
- Data Infrastructure: ${localUserData.current.dataScore || 'N/A'}/100
- Technical Capability: ${localUserData.current.technicalScore || 'N/A'}/100
- People & Culture: ${localUserData.current.cultureScore || 'N/A'}/100
- Governance & Ethics: ${localUserData.current.governanceScore || 'N/A'}/100

KEY CAPABILITIES:
1. Interpret assessment results and explain what scores mean in practical terms
2. Prioritize recommendations based on their assessment gaps
3. Create concrete action plans with timelines and resource requirements
4. Recommend specific courses, workshops, and resources from the platform
5. Connect gaps to industry benchmarks and best practices
6. Provide change management strategies tailored to their culture score
7. Calculate ROI for suggested initiatives
8. Help navigate the platform and find relevant content

COMMUNICATION STYLE:
- Be direct and actionable - they're here to transform, not explore
- Reference their specific scores and gaps when making recommendations
- Prioritize quick wins that build momentum
- Use their maturity level to calibrate advice (don't overwhelm Level 2 with Level 8 strategies)
- Connect every recommendation to business outcomes
- Be strategic - you're advising on multi-million dollar transformations

When users ask questions:
- Always ground answers in their specific assessment data when available
- Recommend specific platform resources (courses, workshops, frameworks)
- Create prioritized action plans, not generic advice
- Quantify impact where possible (time saved, efficiency gains, risk reduction)
- Identify dependencies and prerequisites for recommendations

You have access to their full platform - assessments, learning content, workshops, resources, analytics, and talent network. Help them maximize value from their investment.

${knowledgeContext ? `
RELEVANT PLATFORM CONTENT FOR THIS QUERY:
${knowledgeContext}

Use the above content to provide specific, actionable recommendations. Reference specific courses, workshops, experts, or resources by name when relevant.
` : ''}`

        const publicSystemPrompt = `You are a Human Glue AI consultant specializing exclusively in organizational transformation using the Human Glue platform and methodology.

CONTEXT:
- User: ${localUserData.current.name || 'Guest'}
- Company: ${localUserData.current.company || 'Not specified'}
- Role: ${localUserData.current.role || 'Not specified'}
- Organization Size: ${localUserData.current.size || 'Not specified'}
- Primary Challenge: ${localUserData.current.challenge || 'Not specified'}
${companyInsights ? `
Company Insights from website analysis:
- Industry: ${companyInsights.industry}
- AI Readiness Score: ${companyInsights.aiReadiness?.score}/100
- Tech Stack: ${companyInsights.techStack?.join(', ')}
- Key Insights: ${companyInsights.keyInsights?.join('; ')}
` : ''}

${knowledgeContext ? `
RELEVANT PLATFORM CONTENT FOR THIS QUERY:
${knowledgeContext}

Use the above content to provide specific, helpful recommendations from our platform.
` : ''}

Provide helpful, personalized advice about organizational transformation.`

        const systemPrompt = isAuthenticated ? authenticatedSystemPrompt : publicSystemPrompt

        const response = await api.sendChatMessage({
          model: selectedModel,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: messageText }
          ],
          temperature: 0.7
        })

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.content,
          timestamp: new Date()
        }

        setMessages(prev => [...prev, assistantMessage])
        setIsTyping(false)

        // Different suggestions for authenticated vs unauthenticated users
        const contextualSuggestions = isAuthenticated ? [
          { text: "Explain my assessment scores" },
          { text: "What should I prioritize?" },
          { text: "Create an action plan" },
          { text: "Show relevant resources" }
        ] : [
          { text: "Calculate ROI for our organization" },
          { text: "Show implementation timeline" },
          { text: "Schedule executive briefing" },
          { text: "View case studies" }
        ]
        setSuggestions(contextualSuggestions)
      }
    } catch (error) {
      console.error('Chat error:', error)
      setIsTyping(false)

      if (error instanceof APIError) {
        setError({
          message: error.message,
          code: error.code
        })

        if (error.code === 'NETWORK_ERROR' || error.code === 'SERVICE_UNAVAILABLE') {
          return
        }
      } else {
        setError({
          message: 'Something went wrong. Please try again.',
          code: 'UNKNOWN_ERROR'
        })
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error instanceof APIError && error.code === 'AUTH_ERROR'
          ? 'I\'m having trouble connecting to the AI service. Please ensure the API keys are properly configured.'
          : 'I apologize for the technical issue. Please try again in a moment, or rephrase your question.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
    }
  }

  const handleRetry = () => {
    setError(null)
    if (messages.length > 0 && messages[messages.length - 1].role === 'user') {
      const lastUserMessage = messages[messages.length - 1].content
      setMessages(prev => prev.slice(0, -1))
      handleSend(lastUserMessage)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (isCompact) {
    // Compact view for sticky sidebar and mobile
    return (
      <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-3 bg-red-500/10 border-b border-red-500/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {error.code === 'NETWORK_ERROR' ? (
                  <WifiOff className="w-4 h-4 text-red-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                )}
                <Text size="xs" className="text-red-300">{error.message}</Text>
              </div>
              {error.code === 'NETWORK_ERROR' && (
                <button
                  onClick={handleRetry}
                  className="p-1 hover:bg-red-500/20 rounded transition-colors"
                >
                  <RefreshCw className="w-3 h-3 text-red-400" />
                </button>
              )}
            </div>
          </motion.div>
        )}

        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-2xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Welcome to Human Glue AI</h3>
              <p className="text-gray-400 mb-8 text-sm leading-relaxed">I'm here to help transform your organization. Let's start with your name.</p>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="mb-6"
              >
                <ChatMessage message={message} />
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gray-800/70 backdrop-blur-sm border border-gray-700/50">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <Text size="sm" className="text-gray-400 font-medium">AI is thinking...</Text>
              </div>
            </motion.div>
          )}

          {isAnalyzingWebsite && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-purple-800/50 backdrop-blur-sm border border-purple-700/50">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
                <Text size="sm" className="text-purple-300">Analyzing website for insights...</Text>
              </div>
            </motion.div>
          )}

          {suggestions.length > 0 && !isTyping && messages.length > 0 && (
            <QuickResponse
              suggestions={suggestions}
              onSelect={handleSend}
              className="mb-4"
            />
          )}

          {citations.length > 0 && !isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-blue-400" />
                <Text size="xs" className="text-blue-300 font-semibold">Based on platform content:</Text>
              </div>
              <div className="flex flex-wrap gap-2">
                {citations.map((citation, i) => (
                  <a
                    key={i}
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-200 text-xs hover:bg-blue-500/30 transition-colors border border-blue-500/30"
                  >
                    {citation.title}
                  </a>
                ))}
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-800 px-4 py-4 pb-safe bg-gray-900/50 backdrop-blur-sm safe-area-bottom">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isTyping}
              inputMode="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="sentences"
              className={cn(
                'flex-1 px-4 py-3 rounded-xl font-medium',
                'text-base sm:text-sm',
                'bg-gray-800/70 backdrop-blur-sm border border-gray-700/50',
                'focus:outline-none focus:border-blue-500/50 focus:bg-gray-800',
                'placeholder:text-gray-500 text-white',
                'transition-all duration-300',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              style={{ fontSize: '16px' }}
            />
            <motion.button
              onClick={() => handleSend()}
              disabled={isTyping || !input.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Send message"
              className={cn(
                'p-3 rounded-xl transition-all duration-200',
                'min-w-[48px] min-h-[48px] flex items-center justify-center',
                'bg-gradient-to-r from-blue-500 to-purple-500',
                'hover:shadow-lg hover:shadow-blue-500/25',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <Send className="w-4 h-4 text-white" />
            </motion.button>
          </div>
        </div>
      </div>
    )
  }

  // Full view for hero section
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="relative rounded-3xl overflow-hidden border border-white/10 backdrop-blur-2xl bg-gray-900/30 shadow-2xl">
        <div className="border-b border-white/10 px-6 py-4 bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg"
                whileHover={{ scale: 1.1, rotate: 180 }}
                transition={{ duration: 0.5 }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <h2 className="text-lg font-bold text-white">Human Glue AI Assistant</h2>
                <p className="text-xs text-gray-400 font-medium">Organizational Transformation Expert</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-gray-400 font-medium">Online</span>
            </div>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 py-3 bg-red-500/10 border-b border-red-500/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {error.code === 'NETWORK_ERROR' ? (
                  <WifiOff className="w-4 h-4 text-red-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                )}
                <Text size="sm" className="text-red-300">{error.message}</Text>
              </div>
              {error.code === 'NETWORK_ERROR' && (
                <button
                  onClick={handleRetry}
                  className="px-3 py-1 text-sm hover:bg-red-500/20 rounded transition-colors text-red-400"
                >
                  Retry
                </button>
              )}
            </div>
          </motion.div>
        )}

        <div ref={messagesContainerRef} className="h-[400px] sm:h-[500px] overflow-y-auto px-4 sm:px-6 py-3 sm:py-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="mb-4"
              >
                <ChatMessage message={message} />
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 backdrop-blur-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <Text size="xs" className="text-gray-400">AI is thinking...</Text>
              </div>
            </motion.div>
          )}

          {isAnalyzingWebsite && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 backdrop-blur-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
                <Text size="xs" className="text-purple-400">Analyzing ${localUserData.current.company || 'company'} website...</Text>
              </div>
            </motion.div>
          )}

          {suggestions.length > 0 && !isTyping && (
            <QuickResponse
              suggestions={suggestions}
              onSelect={handleSend}
              className="mb-4"
            />
          )}

          {citations.length > 0 && !isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-blue-400" />
                <Text size="sm" className="text-blue-300 font-semibold">Based on platform content:</Text>
              </div>
              <div className="flex flex-wrap gap-2">
                {citations.map((citation, i) => (
                  <a
                    key={i}
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-200 text-xs hover:bg-blue-500/30 transition-colors border border-blue-500/30"
                  >
                    {citation.title}
                  </a>
                ))}
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-white/10 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-end gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={isTyping}
                className={cn(
                  'w-full px-4 py-3 pr-12 rounded-xl',
                  'bg-gray-900/50 backdrop-blur-sm border border-white/10',
                  'focus:outline-none focus:border-blue-500/50 focus:bg-gray-900/70 focus:shadow-lg',
                  'placeholder:text-gray-400 text-white',
                  'transition-all duration-300',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              />
              <button
                onClick={() => handleSend()}
                disabled={isTyping || !input.trim()}
                className={cn(
                  'absolute right-2 top-1/2 -translate-y-1/2',
                  'p-2 rounded-lg transition-all duration-200',
                  'hover:bg-white/10',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                <Send className="w-4 h-4 text-blue-400" />
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.9 }}
              className="hidden sm:block p-3 rounded-xl bg-white/5 border border-white/10 transition-all backdrop-blur-sm"
              title="Voice input (coming soon)"
            >
              <Mic className="w-4 h-4 text-gray-400 hover:text-blue-400 transition-colors" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.9 }}
              className="hidden sm:block p-3 rounded-xl bg-white/5 border border-white/10 transition-all backdrop-blur-sm"
              title="Attach file (coming soon)"
            >
              <Paperclip className="w-4 h-4 text-gray-400 hover:text-purple-400 transition-colors" />
            </motion.button>
          </div>

          <div className="flex items-center justify-center mt-3 text-xs text-gray-400">
            <span>Powered by Human Glue AI</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
})

SharedChatInterface.displayName = 'SharedChatInterface' 