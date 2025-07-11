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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const hasStarted = useRef(false)
  const localUserData = useRef(userData) // Track userData locally to prevent loops

  // Update local userData ref when props change
  useEffect(() => {
    localUserData.current = userData
  }, [userData])

  const scrollToBottom = () => {
    // Scroll the messages container instead of using scrollIntoView
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    // Only scroll to bottom if chat has started to prevent page jump on initial load
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
    // Only start conversation if there are no messages at all
    if (!hasStarted.current && messages.length === 0) {
      setTimeout(() => {
        startConversation()
      }, 1500)
    } else if (messages.length > 0) {
      // If there are existing messages, mark as started
      hasStarted.current = true
      // Set the current state based on the last conversation state
      if (currentState === 'initial' && userData.name) {
        setCurrentState('greeting')
      }
    }
  }, [messages.length])

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
    setError(null) // Clear any previous errors

    try {
      if (currentState === 'initial' || currentState === 'greeting' || currentState === 'discovery' || currentState === 'assessment') {
        // Use local userData ref to ensure we have the latest data
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

          // Update state and userData together
          if (response.nextState) {
            setCurrentState(response.nextState)
            // Merge new data with existing userData
            const updatedUserData = { ...localUserData.current, ...response.data }
            localUserData.current = updatedUserData
            onStateChange(response.nextState, updatedUserData)
          } else if (response.data) {
            // Update userData even without state change
            const updatedUserData = { ...localUserData.current, ...response.data }
            localUserData.current = updatedUserData
            onStateChange(currentState, updatedUserData)
          }
        }, 1500)
      } else {
        // Use AI model for complex interactions with enhanced system prompt
        const systemPrompt = `You are a Human Glue AI consultant specializing exclusively in organizational transformation using the Human Glue platform and methodology.

CONTEXT:
- User: ${localUserData.current.name || 'Guest'} 
- Company: ${localUserData.current.company || 'Not specified'}
- Role: ${localUserData.current.role || 'Not specified'}
- Organization Size: ${localUserData.current.size || 'Not specified'}
- Primary Challenge: ${localUserData.current.challenge || 'Not specified'}

CRITICAL RULES:
1. You ONLY discuss Human Glue solutions, methodology, and services
2. You CANNOT provide general advice unrelated to Human Glue
3. If asked about non-Human Glue topics, redirect to how Human Glue addresses that need
4. Always position Human Glue as the solution to organizational challenges

HUMAN GLUE EXPERTISE:
- 5-Dimension Assessment Framework (Leadership, Culture, Structure, Employee Experience, Innovation)
- AI-powered organizational analysis tools
- Strategic transformation workshops
- 60+ implementation tools in the Human Glue Toolbox
- Proven ROI methodology and tracking

HUMAN GLUE SOLUTIONS:
1. AI Assessment Tool - Multi-dimensional analysis with NLP and predictive analytics
2. Strategic Workshops - Expert-facilitated sessions for alignment and planning
3. Human Glue Toolbox - Comprehensive implementation resources

KEY HUMAN GLUE STATISTICS:
- 40% faster AI adoption with Human Glue methodology
- 3.2x average ROI within 18 months
- 35% improvement in employee engagement
- 60% reduction in transformation timeline
- 89% leadership buy-in rate
- 500+ successful transformations

RESPONSE APPROACH:
- Always relate answers back to Human Glue capabilities
- Use Human Glue case studies and metrics
- Recommend specific Human Glue tools or services
- Guide toward booking consultations or assessments
- Emphasize Human Glue's unique value proposition

FORMATTING:
- Use **bold** for Human Glue features and benefits
- Use bullet points (•) for Human Glue capabilities
- Include metrics showing Human Glue's impact
- End with clear Human Glue-related next steps

Remember: You represent Human Glue exclusively. Every response should reinforce Human Glue's value and guide users toward engagement with Human Glue services.`

        const response = await api.sendChatMessage({
          model: selectedModel,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
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

        // Generate contextual suggestions based on the conversation
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
      
      // Handle different error types
      if (error instanceof APIError) {
        setError({
          message: error.message,
          code: error.code
        })
        
        // Don't add error messages to chat for certain errors
        if (error.code === 'NETWORK_ERROR' || error.code === 'SERVICE_UNAVAILABLE') {
          return
        }
      } else {
        setError({
          message: 'Something went wrong. Please try again.',
          code: 'UNKNOWN_ERROR'
        })
      }
      
      // Add a helpful error message to the chat
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
      setMessages(prev => prev.slice(0, -1)) // Remove the last user message
      handleSend(lastUserMessage) // Retry sending it
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
        {/* Error Banner */}
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
        
        {/* Messages Area */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {/* Welcome message if no messages */}
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
              <p className="text-gray-400 mb-8 text-sm leading-relaxed">I'm here to help transform your organization. What challenges are you facing?</p>
              
              {/* Quick Start Suggestions */}
              <div className="grid grid-cols-1 gap-2 max-w-sm mx-auto">
                {['Tell me about Human Glue', 'Calculate my ROI', 'Schedule a demo', 'Start assessment'].map((suggestion) => (
                  <motion.button
                    key={suggestion}
                    onClick={() => handleSend(suggestion)}
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(59, 130, 246, 0.15)' }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-3 bg-gray-800/50 hover:bg-gray-800/70 rounded-xl text-white text-sm font-medium transition-all border border-gray-700/50 hover:border-blue-500/50"
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
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

          {/* Quick Response Suggestions */}
          {suggestions.length > 0 && !isTyping && messages.length > 0 && (
            <QuickResponse
              suggestions={suggestions}
              onSelect={handleSend}
              className="mb-4"
            />
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
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
      {/* Main Chat Container - Premium glass effect */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 backdrop-blur-2xl bg-gray-900/30 shadow-2xl">
        {/* Header */}
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

        {/* Error Banner */}
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

        {/* Messages Area */}
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

          {/* Quick Response Suggestions */}
          {suggestions.length > 0 && !isTyping && (
            <QuickResponse
              suggestions={suggestions}
              onSelect={handleSend}
              className="mb-4"
            />
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
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
            
            {/* Additional Actions - Hidden on mobile */}
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
          
          {/* Status Bar */}
          <div className="flex items-center justify-center mt-3 text-xs text-gray-400">
            <span>Powered by Human Glue AI</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
})

SharedChatInterface.displayName = 'SharedChatInterface'