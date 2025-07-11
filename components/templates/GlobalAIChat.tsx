'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Sparkles, Zap, Brain, ChevronDown } from 'lucide-react'
import { SharedChatInterface, SharedChatInterfaceRef } from './SharedChatInterface'
import { ChatState } from '../../lib/types'
import { cn } from '../../utils/cn'
import { usePathname } from 'next/navigation'

interface GlobalAIChatProps {
  userData?: any
  onStateChange?: (state: ChatState, data?: any) => void
}

// Context-aware prompts based on current page - more sales-focused
const pageContextPrompts = {
  '/': [
    "Schedule a demo",
    "Get pricing information",
    "See ROI calculator",
    "Start free assessment"
  ],
  '/solutions': [
    "Which solution is right for me?",
    "Compare pricing tiers",
    "Book a consultation",
    "Request custom demo"
  ],
  '/process': [
    "Fast-track implementation",
    "Get timeline estimate",
    "Talk to an expert",
    "Download case studies"
  ],
  '/results': [
    "Calculate my ROI",
    "See my industry benchmarks",
    "Get success guarantee",
    "Schedule strategy call"
  ]
}

export function GlobalAIChat({ userData, onStateChange }: GlobalAIChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [hasInteracted, setHasInteracted] = useState(false)
  const [pulseAnimation, setPulseAnimation] = useState(true)
  const chatRef = useRef<SharedChatInterfaceRef>(null)
  const pathname = usePathname()
  
  // Don't show on homepage - it has its own chat
  if (pathname === '/') {
    return null
  }

  // Add effect to manage body padding when chat is open
  useEffect(() => {
    if (isOpen && !isMinimized) {
      // Add padding to body to shift content
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
  }, [isOpen, isMinimized])

  // Get context-aware suggestions based on current page
  const currentSuggestions = pageContextPrompts[pathname as keyof typeof pageContextPrompts] || pageContextPrompts['/']

  // Show proactive greeting after a delay
  useEffect(() => {
    if (!hasInteracted && !isOpen) {
      const timer = setTimeout(() => {
        setPulseAnimation(true)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [hasInteracted, isOpen])

  // Update suggestions when page changes
  useEffect(() => {
    if (messages.length === 0) {
      setSuggestions(currentSuggestions.map(text => ({
        text,
        action: 'explore'
      })))
    }
  }, [pathname])

  const handleOpen = () => {
    setIsOpen(true)
    setIsMinimized(false)
    setHasInteracted(true)
    setPulseAnimation(false)
    
    // Start conversation if not already started
    if (messages.length === 0 && chatRef.current) {
      setTimeout(() => {
        chatRef.current?.startConversation()
      }, 300)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setIsMinimized(false)
  }

  const handleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  return (
    <>
      {/* Floating AI Button - Always Visible */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-[9998]"
          >
            {/* Proactive message bubble */}
            {pulseAnimation && !hasInteracted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full right-0 mb-3 w-64"
              >
                <div className="bg-blue-600 text-white rounded-lg p-4 shadow-xl relative">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">AI Transformation Advisor</p>
                      <p className="text-xs opacity-90 mt-1">
                        {pathname === '/solutions' ? "Discover the right solution for your organization" :
                         pathname === '/process' ? "Get your custom implementation timeline" :
                         pathname === '/results' ? "Calculate your potential ROI" :
                         "Schedule a strategic consultation"}
                      </p>
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-6 w-3 h-3 bg-blue-600 rotate-45 translate-y-1.5" />
                </div>
              </motion.div>
            )}

            <motion.button
              onClick={handleOpen}
              className="relative group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Subtle pulse animation */}
              {pulseAnimation && (
                <span className="absolute inset-0 rounded-full bg-blue-600 animate-pulse opacity-30" />
              )}
              
              {/* Button */}
              <div className="relative w-16 h-16 bg-blue-600 rounded-full shadow-xl flex items-center justify-center group-hover:bg-blue-700 transition-all">
                <MessageCircle className="w-7 h-7 text-white relative z-10" />
                
                {/* AI indicator */}
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Zap className="w-3 h-3 text-white" />
                </motion.div>
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 480, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 480, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed right-0 top-0 bottom-0 w-[480px] z-[9999]",
              "bg-gray-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl",
              isMinimized && "hidden"
            )}
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="p-2 rounded-lg bg-blue-600/20"
                  >
                    <Brain className="w-5 h-5 text-blue-400" />
                  </motion.div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
                    <p className="text-xs text-gray-400">Always here to help</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleMinimize}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ChevronDown className={cn(
                      "w-4 h-4 text-gray-400 transition-transform",
                      isMinimized ? "rotate-180" : ""
                    )} />
                  </button>
                  <button
                    onClick={handleClose}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Chat Content */}
              {!isMinimized && (
                <div className="flex-1 overflow-hidden">
                  <SharedChatInterface
                    ref={chatRef}
                    onStateChange={onStateChange || (() => {})}
                    userData={userData || {}}
                    messages={messages}
                    setMessages={setMessages}
                    suggestions={suggestions}
                    setSuggestions={setSuggestions}
                    isCompact={true}
                  />
                </div>
              )}

              {/* Context indicator */}
              {!isMinimized && (
                <div className="px-4 py-2 border-t border-white/10 bg-slate-800/30">
                  <p className="text-xs text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Context: {pathname === '/' ? 'Homepage' : pathname.slice(1).charAt(0).toUpperCase() + pathname.slice(2)}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
      `}</style>
    </>
  )
} 