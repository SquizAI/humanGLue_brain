'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, Brain } from 'lucide-react'
import { Text } from '../atoms'
import { Card, QuickResponse, TypingIndicator } from '../molecules'
import { ChatMessage } from '../organisms'
import { Message, ChatState } from '../../lib/types'
import { EnhancedChatFlow } from '../../lib/enhancedChatFlow'
import { cn } from '../../utils/cn'

export interface HeroChatInterfaceProps {
  onStateChange: (state: ChatState, data?: any) => void
}

export function HeroChatInterface({ onStateChange }: HeroChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [currentState, setCurrentState] = useState<ChatState>('initial')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const hasStarted = useRef(false)
  const localUserData = useRef({})
  const chatFlow = useRef(new EnhancedChatFlow())

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  const saveProfile = async (userData: any, analysis: any) => {
    try {
      // Create the full profile object
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

      // Save to API
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

  useEffect(() => {
    if (!hasStarted.current && messages.length === 0) {
      setTimeout(() => {
        startConversation()
      }, 1500)
    }
  }, [])

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (!e.shiftKey || e.ctrlKey || e.metaKey) {
        e.preventDefault()
        handleSend()
      }
    }
  }

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
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
              <div>
                <h2 className="text-lg font-bold text-white">AI Assessment</h2>
                <p className="text-xs text-gray-400 font-medium">Professional transformation assessment</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">Online</span>
            </div>
          </div>
        </div>

        <div ref={messagesContainerRef} className="h-[400px] overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 flex items-center justify-center shadow-2xl">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">AI Assessment</h3>
              <p className="text-gray-400 mb-8 text-sm leading-relaxed">Professional transformation assessment. Let's start with your name.</p>
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
            <TypingIndicator 
              variant="chat" 
              className="mb-4"
              message="Analyzing your response..."
            />
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

        <div className="border-t border-gray-800 px-6 py-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Enter to send)"
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
    </motion.div>
  )
} 