'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Sparkles, Zap, Brain, ChevronDown, Trash2, RotateCcw, Maximize2, Minimize2, History, Clock } from 'lucide-react'
import { SharedChatInterface, SharedChatInterfaceRef } from './SharedChatInterface'
import { ChatState, Message } from '../../lib/types'
import { cn } from '../../utils/cn'
import { usePathname } from 'next/navigation'
import { useChat } from '../../lib/contexts/ChatContext'

interface ChatSession {
  id: string
  timestamp: number
  messages: Message[]
  title: string
}

interface GlobalAIChatProps {
  userData?: any
  onStateChange?: (state: ChatState, data?: any) => void
}

// Context-aware prompts for unauthenticated users (sales-focused)
const publicPagePrompts = {
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

// Context-aware prompts for authenticated users (AI transformation advisor)
const dashboardPagePrompts = {
  '/dashboard': [
    "Explain my latest assessment results",
    "What should I prioritize this quarter?",
    "Show me quick wins for my maturity level",
    "How do I compare to industry peers?"
  ],
  '/dashboard/assessments': [
    "Interpret my assessment scores",
    "Which gaps should I address first?",
    "Create an action plan from my recommendations",
    "How can I improve my governance score?"
  ],
  '/dashboard/learning': [
    "Recommend courses for my maturity level",
    "Build a learning path for my team",
    "What skills should we develop next?",
    "Find courses for our biggest gaps"
  ],
  '/dashboard/workshops': [
    "Which workshops address my critical gaps?",
    "Build a workshop schedule for my team",
    "Recommend workshops for governance",
    "What's the ROI of these workshops?"
  ],
  '/dashboard/resources': [
    "Find frameworks for my recommendations",
    "Get templates for governance policies",
    "What resources help with change management?",
    "Show me implementation guides"
  ],
  '/dashboard/analytics': [
    "Analyze my progress trends",
    "What metrics should I track?",
    "Explain my ROI projections",
    "Compare my progress to benchmarks"
  ],
  '/dashboard/talent': [
    "Find experts for my specific gaps",
    "What roles should I hire?",
    "Calculate talent ROI",
    "Build a team augmentation plan"
  ]
}

// Instructor dashboard prompts
const instructorPagePrompts = {
  '/instructor': [
    "How can I improve student engagement?",
    "Analyze my course completion rates",
    "Suggest improvements for my content",
    "What's the best way to structure my next course?"
  ],
  '/instructor/courses': [
    "Help me outline a new course",
    "How do I improve my course ratings?",
    "What topics are students asking about?",
    "Generate quiz questions for this module"
  ],
  '/instructor/workshops': [
    "Create a workshop agenda",
    "How do I make workshops more interactive?",
    "What exercises work best for this topic?",
    "Plan a follow-up workshop series"
  ],
  '/instructor/students': [
    "Identify students who need extra support",
    "Analyze student performance patterns",
    "Create personalized learning paths",
    "How do I improve student retention?"
  ],
  '/instructor/analytics': [
    "Interpret my course metrics",
    "What's driving my completion rates?",
    "Compare my performance to benchmarks",
    "Generate a performance report"
  ]
}

// Admin dashboard prompts
const adminPagePrompts = {
  '/admin': [
    "Show me platform health metrics",
    "Which courses need attention?",
    "Analyze user growth trends",
    "What should I prioritize this month?"
  ],
  '/admin/users': [
    "Identify inactive users to re-engage",
    "Analyze user behavior patterns",
    "Create a user segmentation report",
    "Find high-value users at risk"
  ],
  '/admin/organizations': [
    "Which organizations are thriving?",
    "Analyze enterprise account health",
    "Identify expansion opportunities",
    "Generate org performance report"
  ],
  '/admin/courses': [
    "Which courses have low completion?",
    "Recommend content improvements",
    "Analyze course effectiveness",
    "Create a content roadmap"
  ],
  '/admin/workshops': [
    "Optimize workshop scheduling",
    "Which workshops need more capacity?",
    "Analyze workshop ROI",
    "Identify trending topics"
  ],
  '/admin/analytics': [
    "Generate executive dashboard",
    "Analyze platform KPIs",
    "Compare month-over-month growth",
    "Forecast revenue trends"
  ],
  '/admin/database': [
    "Check database health",
    "Optimize query performance",
    "Review RLS policies",
    "Generate backup report"
  ]
}

export function GlobalAIChat({ userData: propsUserData, onStateChange: propsOnStateChange }: GlobalAIChatProps) {
  const pathname = usePathname()
  const {
    messages,
    setMessages,
    chatState,
    setChatState,
    suggestions,
    setSuggestions,
    isChatOpen,
    setIsChatOpen,
    userData: contextUserData,
    setUserData
  } = useChat()

  const [isMinimized, setIsMinimized] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(true) // Changed to true to prevent initial proactive message
  const [pulseAnimation, setPulseAnimation] = useState(false) // Changed to false to prevent initial pulse
  const [isExpanded, setIsExpanded] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>('')

  const chatRef = useRef<SharedChatInterfaceRef>(null)
  const userData = propsUserData || contextUserData

  // Get context-aware suggestions based on authentication, role, and current page
  const isAuthenticated = userData?.authenticated === true
  const isAdmin = userData?.isAdmin || userData?.role === 'admin' || userData?.userType === 'admin'
  const isInstructor = userData?.isInstructor || userData?.role === 'instructor' || userData?.userType === 'instructor'

  // Determine which prompt set to use based on role
  let pagePrompts: Record<string, string[]> = publicPagePrompts
  let defaultPrompts = publicPagePrompts['/']

  if (isAuthenticated) {
    if (isAdmin) {
      pagePrompts = adminPagePrompts
      defaultPrompts = adminPagePrompts['/admin']
    } else if (isInstructor) {
      pagePrompts = instructorPagePrompts
      defaultPrompts = instructorPagePrompts['/instructor']
    } else {
      pagePrompts = dashboardPagePrompts
      defaultPrompts = dashboardPagePrompts['/dashboard']
    }
  }

  const currentSuggestions = pagePrompts[pathname as keyof typeof pagePrompts] || defaultPrompts

  // Use props if provided, otherwise use context
  const onStateChange = propsOnStateChange || ((state: ChatState, data?: any) => {
    setChatState(state)
    if (data) {
      setUserData(data)
    }
  })

  // Load chat sessions and current messages from localStorage on mount
  useEffect(() => {
    if (pathname === '/') return

    // Load all chat sessions
    const savedSessions = localStorage.getItem('humanglue_chat_sessions')
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions)
        if (Array.isArray(parsed)) {
          setChatSessions(parsed)
        }
      } catch (error) {
        console.error('Failed to load chat sessions:', error)
      }
    }

    // Load current chat
    const savedMessages = localStorage.getItem('humanglue_chat_history')
    const savedSessionId = localStorage.getItem('humanglue_current_session_id')
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed)
          if (savedSessionId) {
            setCurrentSessionId(savedSessionId)
          }
        }
      } catch (error) {
        console.error('Failed to load chat history:', error)
      }
    }
  }, [pathname])

  // Save current chat to localStorage and update current session
  useEffect(() => {
    if (pathname === '/') return

    if (messages.length > 0) {
      localStorage.setItem('humanglue_chat_history', JSON.stringify(messages))

      // Update or create current session
      if (!currentSessionId) {
        const newSessionId = `session_${Date.now()}`
        setCurrentSessionId(newSessionId)
        localStorage.setItem('humanglue_current_session_id', newSessionId)
      } else {
        localStorage.setItem('humanglue_current_session_id', currentSessionId)
      }
    }
  }, [messages, currentSessionId, pathname])

  // Save current chat as a session
  const saveCurrentSession = () => {
    if (messages.length === 0) return

    const sessionTitle = messages[0]?.content?.substring(0, 50) || 'New Chat'
    const newSession: ChatSession = {
      id: currentSessionId || `session_${Date.now()}`,
      timestamp: Date.now(),
      messages: [...messages],
      title: sessionTitle
    }

    // Update sessions list
    const updatedSessions = chatSessions.filter(s => s.id !== newSession.id)
    updatedSessions.unshift(newSession)

    // Keep only last 20 sessions
    const limitedSessions = updatedSessions.slice(0, 20)
    setChatSessions(limitedSessions)
    localStorage.setItem('humanglue_chat_sessions', JSON.stringify(limitedSessions))
  }

  // Load a previous session
  const loadSession = (session: ChatSession) => {
    setMessages(session.messages)
    setCurrentSessionId(session.id)
    setShowHistory(false)
    localStorage.setItem('humanglue_chat_history', JSON.stringify(session.messages))
    localStorage.setItem('humanglue_current_session_id', session.id)
  }

  // Start a new chat session
  const startNewSession = () => {
    // Save current session before starting new one
    if (messages.length > 0) {
      saveCurrentSession()
    }

    // Clear current chat
    setMessages([])
    setCurrentSessionId('')
    localStorage.removeItem('humanglue_chat_history')
    localStorage.removeItem('humanglue_current_session_id')
    setShowHistory(false)

    // Reset suggestions
    setSuggestions(currentSuggestions.map(text => ({
      text,
      action: 'explore'
    })))

    // Restart conversation
    if (chatRef.current) {
      setTimeout(() => {
        chatRef.current?.startConversation()
      }, 300)
    }
  }

  // Clear chat function
  const handleClearChat = () => {
    if (confirm('Clear current chat? This will start a new session.')) {
      startNewSession()
    }
  }

  // Delete a session from history
  const deleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Delete this chat session?')) {
      const updatedSessions = chatSessions.filter(s => s.id !== sessionId)
      setChatSessions(updatedSessions)
      localStorage.setItem('humanglue_chat_sessions', JSON.stringify(updatedSessions))
    }
  }

  // Toggle expand/collapse
  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  // Sync context isChatOpen with local isOpen state
  useEffect(() => {
    if (pathname === '/') return

    if (isChatOpen) { // Changed from isOpen
      setIsMinimized(false)

      // Check if there's an initial message to send
      if (userData.initialMessage && chatRef.current) {
        setTimeout(() => {
          chatRef.current?.sendMessage(userData.initialMessage)
          // Clear the initial message after sending
          setUserData((prev: any) => {
            const { initialMessage, ...rest } = prev
            return rest
          })
        }, 500)
      }
    }
  }, [isChatOpen, pathname, userData]) // Changed from isOpen

  // Add effect to manage body padding when chat is open
  useEffect(() => {
    if (pathname === '/') return

    if (isChatOpen && !isMinimized) { // Changed from isOpen
      // Add padding to body to shift content - wider when expanded
      const chatWidth = isExpanded ? '720px' : '480px'
      document.documentElement.style.setProperty('--chat-width', chatWidth)
      document.body.classList.add('chat-open')
    } else {
      document.documentElement.style.setProperty('--chat-width', '0px')
      document.body.classList.remove('chat-open')
    }

    return () => {
      document.documentElement.style.setProperty('--chat-width', '0px')
      document.body.classList.remove('chat-open')
    }
  }, [isChatOpen, isMinimized, isExpanded, pathname]) // Changed from isOpen

  // Show proactive greeting after a delay
  useEffect(() => {
    if (pathname === '/') return

    if (!hasInteracted && !isChatOpen) { // Changed from isOpen
      const timer = setTimeout(() => {
        setPulseAnimation(true)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [hasInteracted, isChatOpen, pathname]) // Changed from isOpen

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
    setIsChatOpen(true)
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
    setIsChatOpen(false)
    setIsMinimized(false)
  }

  const handleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  // Determine if chat should be hidden
  const shouldHideChat = pathname === '/' || pathname === '/login' || pathname === '/signup' || pathname?.startsWith('/admin')

  if (shouldHideChat) {
    return null
  }

  return (
    <>
      {/* Floating AI Button - Always Visible */}
      <AnimatePresence>
        {!isChatOpen && (
          <motion.button
            onClick={handleOpen}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 group"
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
                      <p className="text-sm font-medium">
                        {isAdmin ? 'Platform Admin AI' : isInstructor ? 'Instructor AI' : 'AI Transformation Advisor'}
                      </p>
                      <p className="text-xs opacity-90 mt-1">
                        {isAdmin ? "Need help managing the platform?" :
                          isInstructor ? "Need help with your courses?" :
                            pathname === '/solutions' ? "Discover the right solution for your organization" :
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
        )}
      </AnimatePresence>

      {/* AI Chat Panel */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? 'auto' : (isExpanded ? '85vh' : '600px'),
              width: isMinimized ? 'auto' : (isExpanded ? '800px' : '400px')
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed z-50 shadow-2xl overflow-hidden flex flex-col border border-white/10 backdrop-blur-xl",
              isMinimized
                ? "bottom-6 right-6 rounded-2xl bg-gray-900"
                : "bottom-6 right-6 rounded-2xl bg-gray-900/95"
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
                    <h3 className="text-sm font-semibold text-white">
                      {isAdmin ? 'Admin AI Assistant' : isInstructor ? 'Instructor AI Assistant' : 'AI Assistant'}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {isAdmin ? 'Platform management helper' : isInstructor ? 'Teaching & content helper' : 'Always here to help'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {/* History Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (messages.length > 0) saveCurrentSession()
                      setShowHistory(!showHistory)
                    }}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors group relative",
                      showHistory ? "bg-blue-500/20" : "hover:bg-white/10"
                    )}
                    title="Chat history"
                  >
                    <History className={cn(
                      "w-4 h-4 transition-colors",
                      showHistory ? "text-blue-400" : "text-gray-400 group-hover:text-white"
                    )} />
                    {chatSessions.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full text-[8px] text-white flex items-center justify-center">
                        {chatSessions.length}
                      </span>
                    )}
                  </motion.button>

                  {/* Expand/Collapse Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleExpand}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors group"
                    title={isExpanded ? "Shrink" : "Expand"}
                  >
                    {isExpanded ? (
                      <Minimize2 className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                    ) : (
                      <Maximize2 className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                    )}
                  </motion.button>

                  {/* Clear Chat Button */}
                  {messages.length > 0 && (
                    <motion.button
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      onClick={handleClearChat}
                      className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors group"
                      title="New chat"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
                    </motion.button>
                  )}
                  <button
                    onClick={handleMinimize}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    title={isMinimized ? "Expand" : "Minimize"}
                  >
                    <ChevronDown className={cn(
                      "w-4 h-4 text-gray-400 transition-transform",
                      isMinimized ? "rotate-180" : ""
                    )} />
                  </button>
                  <button
                    onClick={handleClose}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    title="Close"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Chat History Panel */}
              {!isMinimized && showHistory && (
                <div className="flex-1 overflow-y-auto bg-slate-800/30 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Chat History</h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startNewSession}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      New Chat
                    </motion.button>
                  </div>

                  {chatSessions.length === 0 ? (
                    <div className="text-center py-12">
                      <History className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-400">No chat history yet</p>
                      <p className="text-xs text-gray-500 mt-1">Your conversations will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {chatSessions.map((session) => (
                        <motion.div
                          key={session.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => loadSession(session)}
                          className={cn(
                            "p-3 rounded-lg cursor-pointer transition-all group",
                            session.id === currentSessionId
                              ? "bg-blue-600/20 border border-blue-500/50"
                              : "bg-white/5 hover:bg-white/10 border border-white/5"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate font-medium">
                                {session.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="w-3 h-3 text-gray-500" />
                                <p className="text-xs text-gray-500">
                                  {new Date(session.timestamp).toLocaleDateString()} • {session.messages.length} messages
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={(e) => deleteSession(session.id, e)}
                              className="p-1 hover:bg-red-500/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete"
                            >
                              <X className="w-3 h-3 text-gray-400 hover:text-red-400" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Chat Content */}
              {!isMinimized && !showHistory && (
                <div className="flex-1 overflow-hidden">
                  <SharedChatInterface
                    ref={chatRef}
                    onStateChange={onStateChange || (() => { })}
                    userData={userData || {}}
                    chatState={chatState}
                    messages={messages}
                    setMessages={setMessages}
                    suggestions={suggestions}
                    setSuggestions={setSuggestions}
                    isCompact={true}
                  />
                </div>
              )}

              {/* Context indicator & Chat History */}
              {!isMinimized && !showHistory && (
                <div className="px-4 py-2 border-t border-white/10 bg-slate-800/30">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {isAdmin ? '⚙️ Admin Mode' : isInstructor ? '👨‍🏫 Instructor Mode' : '💼 Client Mode'} • {pathname === '/' ? 'Homepage' : (() => { const part = pathname.split('/').pop(); return part ? part.charAt(0).toUpperCase() + part.slice(1) : 'Dashboard' })()}
                      </span>
                    </p>
                    {messages.length > 0 && (
                      <p className="text-xs text-gray-500">
                        {messages.length} message{messages.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
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