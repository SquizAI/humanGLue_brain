'use client'

import { useState, useEffect } from 'react'
import { EnhancedHomepage } from '../components/templates/EnhancedHomepage'
import { MobileHomePage } from '../components/templates/MobileHomePage'
import { MobileLayout } from '../components/templates/MobileLayout'
import { ChatState } from '../lib/types'
import { ChatProvider } from '../lib/contexts/ChatContext'

export default function HomePage() {
  const [userData, setUserData] = useState({})
  const [chatState, setChatState] = useState<ChatState>('initial')
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)

  // Detect mobile on client side only
  useEffect(() => {
    const checkMobile = () => {
      // Check multiple conditions for mobile detection
      const width = window.innerWidth
      const touch = 'ontouchstart' in window
      const userAgent = navigator.userAgent.toLowerCase()
      const mobileKeywords = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
      
      // Consider mobile if width < 768 OR has touch AND matches mobile user agent
      const isMobileDevice = width < 768 || (touch && mobileKeywords.test(userAgent))
      setIsMobile(isMobileDevice)
    }
    
    // Initial check
    checkMobile()
    
    // Listen for resize events
    window.addEventListener('resize', checkMobile)
    window.addEventListener('orientationchange', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('orientationchange', checkMobile)
    }
  }, [])

  const handleChatStateChange = (state: ChatState, data?: any) => {
    setChatState(state)
    if (data) {
      setUserData(prev => ({ ...prev, ...data }))
    }
  }

  const handleStartChat = () => {
    setIsChatOpen(true)
    setChatState('greeting')
  }

  // Loading state while detecting device
  if (isMobile === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 animate-pulse">Loading HumanGlue...</p>
        </div>
      </div>
    )
  }

  // Mobile experience
  if (isMobile) {
    return (
      <ChatProvider>
        <MobileLayout backgroundState="default">
          <MobileHomePage onStartChat={handleStartChat} />
        </MobileLayout>
      </ChatProvider>
    )
  }

  // Desktop experience
  return (
    <EnhancedHomepage 
      userData={userData}
      chatState={chatState}
      onChatStateChange={handleChatStateChange}
    />
  )
}