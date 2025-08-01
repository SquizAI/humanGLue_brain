'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, Brain, X, Minimize2, Maximize2, Mic, MessageSquare } from 'lucide-react'
import { Text } from '../atoms'
import { Card, QuickResponse } from '../molecules'
import { ChatMessage, VoiceAssessment } from '../organisms'
import { Message, ChatState } from '../../lib/types'
import { EnhancedChatFlow } from '../../lib/enhancedChatFlow'
import { assessmentDimensions } from '../../lib/assessment/dimensions'
import { cn } from '../../utils/cn'

export interface UnifiedChatSystemProps {
  onStateChange: (state: ChatState, data?: any) => void
  isHeroVisible: boolean
  userData?: any
  className?: string
}

export function UnifiedChatSystem({ onStateChange, isHeroVisible, userData, className }: UnifiedChatSystemProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [currentState, setCurrentState] = useState<ChatState>('initial')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isMinimized, setIsMinimized] = useState(false)
  const [hasTransitioned, setHasTransitioned] = useState(false)
  const [showVoiceToggle, setShowVoiceToggle] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const hasStarted = useRef(false)
  const localUserData = useRef(userData || {})
  const chatFlow = useRef(new EnhancedChatFlow())
  
  // Update local userData when prop changes
  useEffect(() => {
    localUserData.current = userData || {}
  }, [userData])

  // Show voice toggle when reaching assessment state
  useEffect(() => {
    setShowVoiceToggle(currentState === 'assessment')
  }, [currentState])

  const handleVoiceAssessmentComplete = (responses: Map<string, any>) => {
    // Convert voice responses to assessment data
    const assessmentData: any = {}
    responses.forEach((value, key) => {
      assessmentData[key] = value
    })

    // Add a message about completing voice assessment
    const completionMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Thank you for completing the voice assessment! I\'m now analyzing your responses to provide personalized recommendations.',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, completionMessage])
    setCurrentState('performingAnalysis')
    
    // Update user data with assessment results
    const updatedUserData = { ...localUserData.current, voiceAssessmentData: assessmentData }
    localUserData.current = updatedUserData
    onStateChange('performingAnalysis', updatedUserData)
  }

  const handleVoiceAssessmentCancel = () => {
    setCurrentState('assessment')
  }

  const switchToVoiceAssessment = () => {
    setCurrentState('voiceAssessment')
    onStateChange('voiceAssessment', localUserData.current)
  }

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

  // Start conversation automatically
  useEffect(() => {
    if (!hasStarted.current && messages.length === 0) {
      setTimeout(() => {
        startConversation()
      }, 1500)
    }
  }, [])

  // Handle transition from hero to sidebar
  useEffect(() => {
    if (!isHeroVisible && !hasTransitioned && messages.length > 0) {
      setHasTransitioned(true)
      // Add a transition message when moving to sidebar
      const transitionMessage: Message = {
        id: 'transition-' + Date.now(),
        role: 'assistant',
        content: "I'm here in the sidebar if you need anything else! Feel free to ask questions or explore more options.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, transitionMessage])
    }
  }, [isHeroVisible, hasTransitioned, messages.length])

  const startConversation = () => {
    if (hasStarted.current) return
    hasStarted.current = true
    
    setIsTyping(true)
    setTimeout(() => {
      const greeting = chatFlow.current.getGreeting()
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

    try {
      const response = await chatFlow.current.processResponse(currentState, messageText, localUserData.current)
      
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
        }

        // Save profile when analysis is complete
        if (response.profileAnalysis && response.data?.analysis) {
          saveProfile(localUserData.current, response.profileAnalysis)
        }
      }, 1500)
    } catch (error) {
      console.error('Chat error:', error)
      setIsTyping(false)
    }
  }

  const saveProfile = async (userData: any, analysis: any) => {
    try {
      const profile = {
        ...userData,
        id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        firstContact: new Date(),
        lastContact: new Date(),
        totalInteractions: messages.length,
        pagesVisited: ['homepage'],
        leadScore: analysis.scoring.fitScore,
        leadStage: analysis.scoring.fitScore > 80 ? 'hot' : 
                   analysis.scoring.fitScore > 60 ? 'warm' : 'cold',
        estimatedDealSize: analysis.predictions.dealSize,
        probabilityToClose: analysis.predictions.successProbability
      }

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      })

      if (response.ok) {
        console.log('Profile saved and assessment email sent to:', profile.email)
      } else {
        console.error('Failed to save profile:', await response.text())
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)

  // Find the portal container when switching modes
  useEffect(() => {
    if (isHeroVisible) {
      const container = document.getElementById('hero-chat-container')
      setPortalContainer(container)
    } else {
      setPortalContainer(null)
    }
  }, [isHeroVisible])

  const heroChat = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("w-full max-w-4xl mx-auto", className)}
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
              <div className="flex items-center gap-4">
                {showVoiceToggle && (
                  <button
                    onClick={switchToVoiceAssessment}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors text-xs font-medium"
                  >
                    <Mic className="w-3 h-3" />
                    Voice Assessment
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-400 font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>

          <div ref={messagesContainerRef} className="h-[400px] overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {currentState === 'voiceAssessment' ? (
              <VoiceAssessment
                dimensions={assessmentDimensions}
                onComplete={handleVoiceAssessmentComplete}
                onCancel={handleVoiceAssessmentCancel}
                userData={{
                  name: localUserData.current.name,
                  company: localUserData.current.company,
                  email: localUserData.current.email
                }}
              />
            ) : (
              <>
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

            {suggestions.length > 0 && !isTyping && messages.length > 0 && (
              <QuickResponse
                suggestions={suggestions}
                onSelect={handleSend}
                className="mb-4"
              />
            )}
            
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {currentState !== 'voiceAssessment' && (
            <div className="border-t border-gray-800 px-6 py-4 bg-gray-900/50 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <input
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
          )}
        </div>
      </motion.div>
  )

  // Sidebar Chat Layout
  const sidebarChat = (
    <motion.div
      initial={{ x: 480 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 120 }}
      className={cn(
        "fixed right-0 top-0 h-full w-[480px] bg-gray-900/95 backdrop-blur-xl shadow-2xl z-[60] border-l border-gray-800",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/80">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
            <p className="text-xs text-gray-400">Always here to help</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4 text-gray-400" /> : <Minimize2 className="w-4 h-4 text-gray-400" />}
          </button>
        </div>
      </div>

      {/* Chat Content */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "calc(100% - 64px)", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-col"
          >
            {/* Messages */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ChatMessage message={message} />
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2"
                >
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/70 border border-gray-700/50">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <Text size="xs" className="text-gray-400">AI is thinking...</Text>
                  </div>
                </motion.div>
              )}

              {suggestions.length > 0 && !isTyping && (
                <QuickResponse
                  suggestions={suggestions}
                  onSelect={handleSend}
                  className="mt-4"
                />
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-800 bg-gray-900/80">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  disabled={isTyping}
                  className={cn(
                    'flex-1 px-3 py-2 rounded-lg text-sm',
                    'bg-gray-800/70 border border-gray-700/50',
                    'focus:outline-none focus:border-blue-500/50',
                    'placeholder:text-gray-500 text-white',
                    'transition-all duration-200',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                />
                <motion.button
                  onClick={() => handleSend()}
                  disabled={isTyping || !input.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'p-2 rounded-lg transition-all duration-200',
                    'bg-gradient-to-r from-blue-500 to-purple-500',
                    'hover:shadow-lg hover:shadow-blue-500/25',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  <Send className="w-3 h-3 text-white" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )

  // Return the appropriate chat based on visibility and portal availability
  if (isHeroVisible && portalContainer) {
    return createPortal(heroChat, portalContainer)
  } else if (!isHeroVisible) {
    return sidebarChat
  }
  
  // During transition or if portal not ready, return null
  return null
} 