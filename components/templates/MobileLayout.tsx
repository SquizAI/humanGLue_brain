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
  ChevronDown
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
  const [isChatOpen, setIsChatOpen] = useState(false)
  const pathname = usePathname()
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
    setSuggestions 
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
          className={`fixed top-0 left-0 right-0 z-40 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 ${
            isIOS && !isStandalone ? 'pt-safe' : ''
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
          className={`flex-grow overflow-y-auto overflow-x-hidden ${
            isIOS && !isStandalone ? 'pt-20' : 'pt-16'
          } pb-32`}
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
              <div className={`flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm ${
                isIOS && !isStandalone ? 'pt-safe' : ''
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
                  onStateChange={handleChatStateChange}
                  userData={userData}
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

        {/* Sticky Chat Bar - Only show when chat is closed */}
        {!isChatOpen && (
          <div className={`fixed bottom-0 left-0 right-0 z-30 ${
            isIOS ? 'pb-safe' : ''
          }`}>
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="bg-gray-900/95 backdrop-blur-md border-t border-gray-800"
            >
              <button
                onClick={() => setIsChatOpen(true)}
                className="w-full px-4 py-4 flex items-center justify-between group active:bg-gray-800/50 transition-colors"
                aria-label="Open AI chat assistant"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <MessageCircle className="w-6 h-6 text-blue-400" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium">Chat with AI Assistant</p>
                    <p className="text-xs text-gray-400">Get instant answers about Human Glue</p>
                  </div>
                </div>
                <ChevronUp className="w-5 h-5 text-gray-400 group-active:text-white transition-colors" />
              </button>
            </motion.div>

            {/* Bottom Navigation */}
            <nav className={`bg-gray-900 border-t border-gray-800 ${
              isIOS ? 'pb-safe' : 'pb-2'
            }`}>
              <div className="grid grid-cols-4 gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex flex-col items-center gap-1 py-3 transition-all active:bg-gray-800/50
                      ${pathname === item.href 
                        ? 'text-blue-400' 
                        : 'text-gray-400 active:text-white'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </nav>
          </div>
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
        className={`fixed top-0 left-0 right-0 z-40 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 ${
          isIOS && !isStandalone ? 'pt-safe' : ''
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
        className={`flex-grow overflow-y-auto overflow-x-hidden ${
          isIOS && !isStandalone ? 'pt-20' : 'pt-16'
        } pb-20`}
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'none'
        }}
      >
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-30 ${
        isIOS ? 'pb-safe' : 'pb-2'
      }`}>
        <div className="grid grid-cols-4 gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center gap-1 py-3 transition-all active:bg-gray-800/50
                ${pathname === item.href 
                  ? 'text-blue-400' 
                  : 'text-gray-400 active:text-white'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
} 