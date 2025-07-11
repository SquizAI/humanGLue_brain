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

export interface SharedChatInterfaceProps {
  onStateChange: (state: ChatState, data?: any) => void
  userData: any
  messages: Message[]
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void
  suggestions: any[]
  setSuggestions: (suggestions: any[]) => void
  isCompact?: boolean
}

export interface SharedChatInterfaceRef {
  startConversation: () => void
}

export const SharedChatInterface = forwardRef<SharedChatInterfaceRef, SharedChatInterfaceProps>(({
  onStateChange,
  userData,
  messages,
  setMessages,
  suggestions,
  setSuggestions,
  isCompact = false
}, ref) => {
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [currentState, setCurrentState] = useState<ChatState>('initial')
  const [selectedModel, setSelectedModel] = useState<AIModel>('claude-sonnet-4')
  const [error, setError] = useState<{ message: string; code?: string } | null>(null)
  const [companyInsights, setCompanyInsights] = useState<CompanyInsights | null>(null)
  const [isAnalyzingWebsite, setIsAnalyzingWebsite] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const hasStarted = useRef(false)
  const localUserData = useRef(userData)

  useEffect(() => {
    localUserData.current = userData
  }, [userData])

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
      const greeting = chatFlow.getGreeting()
      setMessages([{
        id: '1',
        role: 'assistant',
        content: greeting,
        timestamp: new Date()
      }])
      setIsTyping(false)
      setCurrentState('greeting')
      onStateChange('greeting')
      setSuggestions([])
    }, 2000)
  }

  useImperativeHandle(ref, () => ({
    startConversation
  }))

  useEffect(() => {
    if (!hasStarted.current && messages.length === 0) {
      setTimeout(() => {
        startConversation()
      }, 1500)
    } else if (messages.length > 0) {
      hasStarted.current = true
      if (currentState === 'initial' && userData.name) {
        setCurrentState('greeting')
      }
    }
  }, [messages.length])

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
      if (currentState === 'initial' || currentState === 'greeting' || currentState === 'discovery' || currentState === 'assessment' || currentState === 'solution' || currentState === 'booking' || currentState === 'completed') {
        const response = chatFlow.processResponse(currentState, messageText, localUserData.current)
        
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
            setCurrentState(response.nextState)
            const updatedUserData = { ...localUserData.current, ...response.data }
            localUserData.current = updatedUserData
            onStateChange(response.nextState, updatedUserData)
          } else if (response.data) {
            const updatedUserData = { ...localUserData.current, ...response.data }
            localUserData.current = updatedUserData
            onStateChange(currentState, updatedUserData)
            
            // Check if we have a URL to scrape
            if (response.data.urlToScrape && !companyInsights) {
              analyzeCompanyWebsite(response.data.urlToScrape, response.data.company || userData.company)
            }
          }
        }, 1500)
      } else {
        const systemPrompt = `You are a Human Glue AI consultant specializing exclusively in organizational transformation using the Human Glue platform and methodology.

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

Provide helpful, personalized advice about organizational transformation.`

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

        const contextualSuggestions = [
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
          
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-800 px-4 py-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isTyping}
              className={cn(
                'flex-1 px-4 py-3 rounded-xl text-sm font-medium',
                'bg-gray-800/70 backdrop-blur-sm border border-gray-700/50',
                'focus:outline-none focus:border-blue-500/50 focus:bg-gray-800',
                'placeholder:text-gray-500 text-white',
                'transition-all duration-300',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            />
            <motion.button
              onClick={() => handleSend()}
              disabled={isTyping || !input.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'p-3 rounded-xl transition-all duration-200',
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