'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Mic, 
  Paperclip, 
  ChevronDown,
  X,
  Sparkles,
  User,
  Bot,
  MoreHorizontal,
  Plus
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isTyping?: boolean
}

interface MobileChatInterfaceProps {
  isOpen: boolean
  onClose?: () => void
  messages?: Message[]
  onSendMessage?: (message: string) => void
  suggestions?: string[]
  isTyping?: boolean
}

export function MobileChatInterface({
  isOpen,
  onClose,
  messages = [],
  onSendMessage,
  suggestions = [],
  isTyping = false
}: MobileChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle keyboard height for iOS
  useEffect(() => {
    const handleViewportChange = () => {
      if (window.visualViewport) {
        const kbHeight = window.innerHeight - window.visualViewport.height
        setKeyboardHeight(kbHeight)
      }
    }

    window.visualViewport?.addEventListener('resize', handleViewportChange)
    return () => window.visualViewport?.removeEventListener('resize', handleViewportChange)
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`
    }
  }, [inputValue])

  const handleSend = () => {
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue)
      setInputValue('')
      if (inputRef.current) {
        inputRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Default messages if none provided
  const displayMessages = messages.length > 0 ? messages : [
    {
      id: '1',
      role: 'assistant' as const,
      content: 'Hi! I\'m your AI assistant. How can I help you transform your organization today?',
      timestamp: new Date()
    }
  ]

  return (
    <>
      {/* Expanded Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-0 z-50 bg-gray-950 flex flex-col"
            style={{ paddingBottom: keyboardHeight }}
          >
            {/* Compact Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">HumanGlue AI</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs text-gray-400">Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area - Optimized for Mobile */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-2">
              {/* Date separator */}
              <div className="text-center my-3">
                <span className="text-xs text-gray-500 bg-gray-900 px-3 py-1 rounded-full">
                  Today
                </span>
              </div>

              {/* Messages */}
              <div className="space-y-3">
                {displayMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user' 
                          ? 'bg-blue-500' 
                          : 'bg-gradient-to-br from-blue-500 to-purple-500'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-white" />
                        )}
                      </div>
                      
                      {/* Message Bubble */}
                      <div className={`px-4 py-2.5 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white rounded-br-sm'
                          : 'bg-gray-800 text-gray-100 rounded-bl-sm'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <span className="text-[10px] opacity-70 mt-1 block">
                          {new Date(message.timestamp).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex gap-2 items-center">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-sm">
                        <div className="flex gap-1">
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                            className="w-2 h-2 bg-gray-500 rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                            className="w-2 h-2 bg-gray-500 rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                            className="w-2 h-2 bg-gray-500 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Quick Suggestions - Horizontal Scroll */}
            {suggestions.length > 0 && (
              <div className="px-3 py-2 border-t border-gray-800">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setInputValue(suggestion)}
                      className="flex-shrink-0 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-xs text-gray-300 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area - Sticky Footer */}
            <div className="border-t border-gray-800 bg-gray-900 px-3 py-2">
              <div className="flex items-end gap-2">
                {/* Attachment Button */}
                <button className="p-2.5 text-gray-400 hover:text-gray-300 transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>

                {/* Input Field */}
                <div className="flex-1 bg-gray-800 rounded-2xl px-4 py-2">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message HumanGlue AI..."
                    className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none text-sm leading-relaxed"
                    rows={1}
                    style={{ maxHeight: '120px' }}
                  />
                </div>

                {/* Send/Voice Button */}
                {inputValue.trim() ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSend}
                    className="p-2.5 bg-blue-500 hover:bg-blue-600 rounded-full text-white transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                ) : (
                  <button className="p-2.5 text-gray-400 hover:text-gray-300 transition-colors">
                    <Mic className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              {/* Safe area padding for iOS */}
              <div className="h-safe-area-inset-bottom" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}