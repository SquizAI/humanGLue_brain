'use client'

import { ReactNode, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Home,
  Brain,
  Users,
  TrendingUp,
  Menu,
  X,
  MessageCircle,
  Send,
  ChevronUp,
  ChevronDown,
  Sparkles
} from 'lucide-react'
import DynamicBackground from '../DynamicBackground'
import { MobileHomePage } from './MobileHomePage'
import { SharedChatInterface, SharedChatInterfaceRef } from './SharedChatInterface'
import { useChat } from '../../lib/contexts/ChatContext'
import { ChatState } from '../../lib/types'

interface MobileLayoutProps {
  children: ReactNode
  backgroundState?: 'default' | 'welcoming' | 'exploring' | 'analyzing' | 'presenting'
}

export function MobileLayout({ children, backgroundState = 'default' }: MobileLayoutProps) {
  const pathname = usePathname() as string
  const chatRef = useRef<SharedChatInterfaceRef>(null)
  const [viewportHeight, setViewportHeight] = useState('100vh')
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  // Use shared context
  const {
    messages,
    setMessages,
    userData,
    setUserData,
    chatState,
    setChatState,
    suggestions,
    setSuggestions,
    isChatOpen,
    setIsChatOpen,
    onChatStateChange
  } = useChat()

  // Detect iOS and standalone mode
  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase()
    const ios = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(ios)

    // Check if running as PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');
    setIsStandalone(standalone)

    // Prevent bounce scrolling on iOS
    if (ios) {
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.height = '100%'
      document.body.style.overflow = 'hidden'
    }

    return () => {
      if (ios) {
        document.body.style.position = ''
        document.body.style.width = ''
        document.body.style.height = ''
        document.body.style.overflow = ''
      }
    }
  }, [])

  // Handle viewport height changes (for mobile browsers)
  useEffect(() => {
    const updateViewportHeight = () => {
      // Use visualViewport API if available (better for mobile)
      if (window.visualViewport) {
        const vh = window.visualViewport.height
        setViewportHeight(`${vh}px`)
        // Update CSS variable for use in styles
        document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`)
      } else {
        const vh = window.innerHeight
        setViewportHeight(`${vh}px`)
        document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`)
      }
    }

    // Initial set
    updateViewportHeight()

    // Listen for viewport changes
    window.visualViewport?.addEventListener('resize', updateViewportHeight)
    window.visualViewport?.addEventListener('scroll', updateViewportHeight)
    window.addEventListener('resize', updateViewportHeight)
    window.addEventListener('orientationchange', updateViewportHeight)

    return () => {
      window.visualViewport?.removeEventListener('resize', updateViewportHeight)
      window.visualViewport?.removeEventListener('scroll', updateViewportHeight)
      window.removeEventListener('resize', updateViewportHeight)
      window.removeEventListener('orientationchange', updateViewportHeight)
    }
  }, [])

  // Detect keyboard height for better input handling
  useEffect(() => {
    const handleViewportChange = () => {
      if (window.visualViewport) {
        const keyboardHeight = window.innerHeight - window.visualViewport.height
        setKeyboardHeight(keyboardHeight)
      }
    }

    window.visualViewport?.addEventListener('resize', handleViewportChange)
    return () => window.visualViewport?.removeEventListener('resize', handleViewportChange)
  }, [])

  // Mobile navigation items
  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/solutions', icon: Brain, label: 'Solutions' },
    { href: '/process', icon: Users, label: 'Process' },
    { href: '/results', icon: TrendingUp, label: 'Results' }
  ]

  // Handle chat state changes
  const handleChatStateChange = (newState: ChatState, data?: any) => {
    setChatState(newState)
    if (data) {
      setUserData(data)
    }
  }

  // Show mobile home page for root path
  if (pathname === '/') {
    return (
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          minHeight: viewportHeight,
          height: viewportHeight,
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <DynamicBackground
          state={backgroundState}
          showImage={true}
          overlayOpacity={0.7}
        />

        {/* Mobile Header - iOS-optimized */}
        <header
          className={`fixed top-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 ${isIOS && !isStandalone ? 'pt-safe' : ''
            }`}
        >
          <div className="flex items-center justify-between px-4 py-2">
            <Link href="/" className="flex items-center">
              <Image
                src="/HumanGlue_nobackground.png"
                alt="Human Glue"
                width={90}
                height={36}
                className="w-20 h-auto"
                priority
              />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-gray-400">AI Ready</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main
          className={`flex-grow overflow-hidden ${isIOS && !isStandalone ? 'pt-14' : 'pt-12'
            }`}
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'none'
          }}
        >
          <MobileHomePage onStartChat={() => setIsChatOpen(true)} />
        </main>

        {/* Full-Screen Chat Interface */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed inset-0 z-50 bg-gray-900 flex flex-col"
              style={{
                height: viewportHeight,
                paddingBottom: keyboardHeight > 0 ? `${keyboardHeight}px` : '0'
              }}
            >
              {/* Chat Header */}
              <div className={`flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm ${isIOS && !isStandalone ? 'pt-safe' : ''
                }`}>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-white font-medium">AI Assistant</span>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-3 -mr-2 text-gray-400 hover:text-white transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Interface - Full height */}
              <div className="flex-grow overflow-hidden">
                <SharedChatInterface
                  ref={chatRef}
                  onStateChange={onChatStateChange}
                  userData={userData}
                  chatState={chatState}
                  messages={messages}
                  setMessages={setMessages}
                  suggestions={suggestions}
                  setSuggestions={setSuggestions}
                  isCompact={false}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Navigation with Prominent Chat Button */}
        {!isChatOpen && (
          <nav className={`fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 z-30 ${isIOS ? 'pb-safe' : ''
            }`}>
            <div className="grid grid-cols-5 items-end h-16">
              {/* Home */}
              <Link
                href="/"
                className="flex flex-col items-center justify-center h-full gap-0.5 transition-all active:bg-gray-800/50 text-blue-400"
              >
                <Home className="w-5 h-5" />
                <span className="text-[10px] font-medium">Home</span>
              </Link>

              {/* Solutions */}
              <Link
                href="/solutions"
                className="flex flex-col items-center justify-center h-full gap-0.5 transition-all active:bg-gray-800/50 text-gray-400 active:text-white"
              >
                <Brain className="w-5 h-5" />
                <span className="text-[10px] font-medium">Solutions</span>
              </Link>

              {/* AI Chat - Center Button */}
              <div className="relative flex items-center justify-center">
                <motion.button
                  onClick={() => setIsChatOpen(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute -top-5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full p-3 shadow-lg active:shadow-xl transition-all"
                  aria-label="Open AI chat assistant"
                >
                  <MessageCircle className="w-6 h-6 text-white" />
                  <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 opacity-30"
                  />
                </motion.button>
              </div>

              {/* Process */}
              <Link
                href="/process"
                className="flex flex-col items-center justify-center h-full gap-0.5 transition-all active:bg-gray-800/50 text-gray-400 active:text-white"
              >
                <Users className="w-5 h-5" />
                <span className="text-[10px] font-medium">Process</span>
              </Link>

              {/* Results */}
              <Link
                href="/results"
                className="flex flex-col items-center justify-center h-full gap-0.5 transition-all active:bg-gray-800/50 text-gray-400 active:text-white"
              >
                <TrendingUp className="w-5 h-5" />
                <span className="text-[10px] font-medium">Results</span>
              </Link>
            </div>
          </nav>
        )}
      </div>
    )
  }

  // For other pages, show regular content with mobile navigation
  return (
    <div
      className="relative flex flex-col overflow-hidden"
      style={{
        minHeight: viewportHeight,
        height: viewportHeight,
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <DynamicBackground
        state={backgroundState}
        showImage={true}
        overlayOpacity={0.7}
      />

      {/* Mobile Header - iOS-optimized */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 ${isIOS && !isStandalone ? 'pt-safe' : ''
          }`}
      >
        <div className="flex items-center justify-center px-4 py-3">
          <Link href="/">
            <Image
              src="/HumanGlue_nobackground.png"
              alt="Human Glue"
              width={100}
              height={40}
              className="w-24 h-auto"
              priority
            />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={`flex-grow overflow-y-auto overflow-x-hidden ${isIOS && !isStandalone ? 'pt-20' : 'pt-16'
          } pb-20`}
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'none'
        }}
      >
        {children}
      </main>

      {/* Bottom Navigation with Prominent Chat Button */}
      <nav className={`fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-30 ${isIOS ? 'pb-safe' : 'pb-2'
        }`}>
        <div className="grid grid-cols-5 items-end">
          {/* Home */}
          <Link
            href="/"
            className={`
              flex flex-col items-center gap-1 py-3 transition-all active:bg-gray-800/50
              ${pathname === '/'
                ? 'text-blue-400'
                : 'text-gray-400 active:text-white'
              }
            `}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs font-medium">Home</span>
          </Link>

          {/* Solutions */}
          <Link
            href="/solutions"
            className={`
              flex flex-col items-center gap-1 py-3 transition-all active:bg-gray-800/50
              ${pathname === '/solutions'
                ? 'text-blue-400'
                : 'text-gray-400 active:text-white'
              }
            `}
          >
            <Brain className="w-5 h-5" />
            <span className="text-xs font-medium">Solutions</span>
          </Link>

          {/* AI Chat - Center Button */}
          <div className="relative -mt-6">
            <motion.button
              onClick={() => setIsChatOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full p-4 shadow-lg active:shadow-xl transition-all"
              aria-label="Open AI chat assistant"
            >
              <MessageCircle className="w-7 h-7 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <Sparkles className="absolute -bottom-1 -left-1 w-4 h-4 text-yellow-300" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 opacity-30"
              />
            </motion.button>
            <span className="text-xs font-medium text-blue-400 mt-1 block text-center">AI Chat</span>
          </div>

          {/* Process */}
          <Link
            href="/process"
            className={`
              flex flex-col items-center gap-1 py-3 transition-all active:bg-gray-800/50
              ${pathname === '/process'
                ? 'text-blue-400'
                : 'text-gray-400 active:text-white'
              }
            `}
          >
            <Users className="w-5 h-5" />
            <span className="text-xs font-medium">Process</span>
          </Link>

          {/* Results */}
          <Link
            href="/results"
            className={`
              flex flex-col items-center gap-1 py-3 transition-all active:bg-gray-800/50
              ${pathname === '/results'
                ? 'text-blue-400'
                : 'text-gray-400 active:text-white'
              }
            `}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs font-medium">Results</span>
          </Link>
        </div>
      </nav>

      {/* Full-Screen Chat Interface */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-0 z-50 bg-gray-900 flex flex-col"
            style={{
              height: viewportHeight,
              paddingBottom: keyboardHeight > 0 ? `${keyboardHeight}px` : '0'
            }}
          >
            {/* Chat Header */}
            <div className={`flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm ${isIOS && !isStandalone ? 'pt-safe' : ''
              }`}>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white font-medium">AI Assistant</span>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-3 -mr-2 text-gray-400 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Interface - Full height */}
            <div className="flex-grow overflow-hidden">
              <SharedChatInterface
                ref={chatRef}
                onStateChange={onChatStateChange}
                userData={userData}
                chatState={chatState}
                messages={messages}
                setMessages={setMessages}
                suggestions={suggestions}
                setSuggestions={setSuggestions}
                isCompact={false}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 