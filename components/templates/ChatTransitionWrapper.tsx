'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SharedChatInterface, SharedChatInterfaceRef } from './SharedChatInterface'
import { ChatState, Message } from '../../lib/types'
import { X, MessageCircle } from 'lucide-react'

interface ChatTransitionWrapperProps {
  onStateChange: (state: ChatState, data?: any) => void
  chatState: ChatState
  userData: any
  isHeroVisible: boolean
  messages: Message[]
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void
  suggestions: any[]
  setSuggestions: (suggestions: any[]) => void
}

export function ChatTransitionWrapper({
  onStateChange,
  chatState,
  userData,
  isHeroVisible,
  messages,
  setMessages,
  suggestions,
  setSuggestions
}: ChatTransitionWrapperProps) {
  const chatRef = useRef<SharedChatInterfaceRef>(null)
  const [isChatOpen, setIsChatOpen] = useState(true)

  // Add effect to manage body padding when chat is open (desktop only)
  useEffect(() => {
    // Only apply padding on desktop (lg breakpoint and above)
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches

    if (!isHeroVisible && isChatOpen && isDesktop) {
      document.documentElement.style.setProperty('--chat-width', '480px')
      document.body.classList.add('chat-open')
    } else {
      document.documentElement.style.setProperty('--chat-width', '0px')
      document.body.classList.remove('chat-open')
    }

    return () => {
      document.documentElement.style.setProperty('--chat-width', '0px')
      document.body.classList.remove('chat-open')
    }
  }, [isHeroVisible, isChatOpen])

  return (
    <>
      {/* Sticky Chat - Full height right sidebar (only when not in hero) */}
      <AnimatePresence>
        {!isHeroVisible && isChatOpen && (
          <motion.div
            initial={{ x: 480, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 480, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full lg:w-[480px] z-[9999] bg-gray-900/95 backdrop-blur-xl lg:border-l border-white/10 shadow-2xl"
            style={{ isolation: 'isolate' }}
          >
            <div className="h-full flex flex-col">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-3 hover:bg-white/10 rounded-lg transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
                  aria-label="Close chat"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Chat Content - Full height */}
              <div className="flex-1 overflow-hidden">
                <SharedChatInterface
                  ref={chatRef}
                  onStateChange={onStateChange}
                  chatState={chatState}
                  userData={userData}
                  messages={messages}
                  setMessages={setMessages}
                  suggestions={suggestions}
                  setSuggestions={setSuggestions}
                  isCompact={true}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating toggle button when chat is closed - Clean glassmorphic design */}
      {!isHeroVisible && !isChatOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 p-4 rounded-full bg-gray-900/80 backdrop-blur-xl border border-white/10 text-white shadow-lg z-[9998]"
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>
      )}
    </>
  )
}