'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send } from 'lucide-react'
import { cn } from '../../utils/cn'

interface MobileChatFooterProps {
  onSendMessage: (message: string) => void
  isTyping: boolean
  isVisible: boolean
}

export function MobileChatFooter({ onSendMessage, isTyping, isVisible }: MobileChatFooterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  
  // Only show on mobile
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSend = () => {
    if (input.trim() && !isTyping) {
      onSendMessage(input)
      setInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isMobile || !isVisible) return null

  return (
    <>
      {/* Floating Action Button - Clean glassmorphic design */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gray-900/80 backdrop-blur-xl border border-white/10 text-white shadow-lg"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile Chat Footer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Chat Input Panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
            >
              <div className="bg-gray-900/95 backdrop-blur-xl border-t border-white/10 p-4 pb-safe">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Quick Message</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Input Area */}
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    disabled={isTyping}
                    className={cn(
                      'flex-1 px-4 py-3 rounded-xl',
                      'bg-gray-800/50 backdrop-blur-sm border border-white/10',
                      'focus:outline-none focus:border-blue-500/50 focus:bg-gray-800/70',
                      'placeholder:text-gray-400 text-white',
                      'transition-all duration-300',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSend}
                    disabled={isTyping || !input.trim()}
                    className={cn(
                      'px-4 py-3 rounded-xl',
                      'bg-gradient-to-r from-blue-500 to-purple-500',
                      'text-white font-medium',
                      'transition-all duration-200',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'flex items-center justify-center'
                    )}
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    AI is thinking...
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
} 