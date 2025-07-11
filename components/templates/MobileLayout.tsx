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

interface MobileLayoutProps {
  children: ReactNode
  backgroundState?: 'default' | 'welcoming' | 'exploring' | 'analyzing' | 'presenting'
}

export function MobileLayout({ children, backgroundState = 'default' }: MobileLayoutProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const pathname = usePathname()
  const [messages, setMessages] = useState<any[]>([])
  const [suggestions, setSuggestions] = useState<any[]>([])
  const chatRef = useRef<SharedChatInterfaceRef>(null)
  const [viewportHeight, setViewportHeight] = useState('100vh')
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  // Handle viewport height changes (for mobile browsers)
  useEffect(() => {
    const updateViewportHeight = () => {
      // Use visualViewport API if available (better for mobile)
      if (window.visualViewport) {
        setViewportHeight(`${window.visualViewport.height}px`)
      } else {
        setViewportHeight(`${window.innerHeight}px`)
      }
    }

    // Initial set
    updateViewportHeight()

    // Listen for viewport changes
    window.visualViewport?.addEventListener('resize', updateViewportHeight)
    window.addEventListener('resize', updateViewportHeight)
    
    return () => {
      window.visualViewport?.removeEventListener('resize', updateViewportHeight)
      window.removeEventListener('resize', updateViewportHeight)
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



  // Show mobile home page for root path
  if (pathname === '/') {
    return (
      <div className="relative flex flex-col" style={{ minHeight: viewportHeight }}>
        <DynamicBackground 
          state={backgroundState} 
          showImage={true}
          overlayOpacity={0.7}
          videoSrc="/HumanGlue.mp4"
        />
        
        {/* Mobile Header - Just the logo */}
        <header className="fixed top-0 left-0 right-0 z-40 bg-gray-900/90 backdrop-blur-md border-b border-gray-800">
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
        <main className="flex-grow pt-16 pb-32">
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
              style={{ height: viewportHeight }}
            >
              {/* Chat Header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-white font-medium">AI Assistant</span>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Interface - Full height */}
              <div className="flex-grow overflow-hidden">
                <SharedChatInterface 
                  ref={chatRef}
                  onStateChange={() => {}}
                  userData={{}}
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
          <div className="fixed bottom-0 left-0 right-0 z-30">
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="bg-gray-900/95 backdrop-blur-md border-t border-gray-800"
            >
              <button
                onClick={() => setIsChatOpen(true)}
                className="w-full px-4 py-4 flex items-center justify-between group"
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
                <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </button>
            </motion.div>

            {/* Bottom Navigation */}
            <nav className="bg-gray-900 border-t border-gray-800 safe-bottom">
              <div className="grid grid-cols-4 gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex flex-col items-center gap-1 py-2 transition-all
                      ${pathname === item.href 
                        ? 'text-blue-400' 
                        : 'text-gray-400 hover:text-white'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-xs">{item.label}</span>
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
    <div className="relative flex flex-col" style={{ minHeight: viewportHeight }}>
      <DynamicBackground 
        state={backgroundState} 
        showImage={true}
        overlayOpacity={0.7}
        videoSrc="/HumanGlue.mp4"
      />
      
      {/* Mobile Header - Just the logo */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-gray-900/90 backdrop-blur-md border-b border-gray-800">
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
      <main className="flex-grow pt-16 pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-30 safe-bottom">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center gap-1 py-2 transition-all
                ${pathname === item.href 
                  ? 'text-blue-400' 
                  : 'text-gray-400 hover:text-white'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
} 