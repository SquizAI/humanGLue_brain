'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, Mic, Paperclip } from 'lucide-react'
import { Text } from '../atoms'
import { Card, QuickResponse } from '../molecules'
import { ChatMessage, ModelSelector } from '../organisms'
import { Message, ChatState } from '../../lib/types'
import { AIModel } from '../../lib/mcp/types'
import { chatFlow } from '../../lib/chatFlow'
import { api } from '../../services/api'
import { modelConfigs } from '../../lib/mcp/models'
import { cn } from '../../utils/cn'

export interface ProfessionalChatInterfaceProps {
  onStateChange: (state: ChatState, data?: any) => void
  userData: any
}

export function ProfessionalChatInterface({ onStateChange, userData }: ProfessionalChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [currentState, setCurrentState] = useState<ChatState>('initial')
  const [selectedModel, setSelectedModel] = useState<AIModel>('claude-sonnet-4')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, suggestions])

  useEffect(() => {
    setTimeout(() => {
      startConversation()
    }, 1500)
  }, [])

  const startConversation = () => {
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
      if (currentState === 'initial' || currentState === 'greeting' || currentState === 'discovery' || currentState === 'assessment') {
        const response = chatFlow.processResponse(currentState, messageText, userData)
        
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
            onStateChange(response.nextState, response.data)
          } else if (response.data) {
            // Update userData even without state change
            onStateChange(currentState, response.data)
          }
        }, 1500)
      } else {
        const response = await api.sendChatMessage({
          model: selectedModel,
          messages: [
            {
              role: 'system',
              content: `You are a professional Human Glue AI consultant helping ${userData.name} from ${userData.company}. 
                       They are a ${userData.role} dealing with ${userData.challenge}. 
                       Company size: ${userData.size} employees.
                       Provide concise, actionable insights focused on organizational transformation.
                       Be professional, strategic, and results-oriented.`
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
      }
    } catch (error) {
      console.error('Chat error:', error)
      setIsTyping(false)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize for the technical issue. Please ensure your connection is stable and try again.',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const modelName = modelConfigs[selectedModel]?.name

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      {/* Main Chat Container - Transparent with dark background */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 backdrop-blur-xl bg-gray-900/40">
        {/* Header */}
        <div className="border-b border-white/10 px-6 py-4 bg-gray-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
              <div>
                <h2 className="text-lg font-semibold text-white">AI Assessment</h2>
                <p className="text-xs text-gray-400">Professional transformation assessment</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="h-[500px] overflow-y-auto px-6 py-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="mb-4"
              >
                <ChatMessage 
                  message={message}
                />
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
        <div className="border-t border-white/10 px-6 py-4">
          <div className="flex items-end gap-3">
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
            
            {/* Additional Actions */}
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-xl bg-white/5 border border-white/10 transition-all backdrop-blur-sm"
              title="Voice input (coming soon)"
            >
              <Mic className="w-4 h-4 text-gray-400 hover:text-blue-400 transition-colors" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-xl bg-white/5 border border-white/10 transition-all backdrop-blur-sm"
              title="Attach file (coming soon)"
            >
              <Paperclip className="w-4 h-4 text-gray-400 hover:text-cyan-400 transition-colors" />
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
}