'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { Message, ChatState } from '../types'
import { useAuth } from '../auth/hooks'

interface ChatContextType {
  messages: Message[]
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void
  userData: any
  setUserData: (data: any) => void
  chatState: ChatState
  setChatState: (state: ChatState) => void
  suggestions: any[]
  setSuggestions: (suggestions: any[]) => void
  onChatStateChange: (state: ChatState, data?: any) => void
  isChatOpen: boolean
  setIsChatOpen: (open: boolean) => void
  openChatWithMessage: (message?: string, context?: any) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [userData, setUserData] = useState<any>({})
  const [chatState, setChatState] = useState<ChatState>('initial')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)

  // Use real Supabase authentication
  const { user, profile, loading: authLoading } = useAuth()

  // Sync authenticated user data with chat context
  useEffect(() => {
    // Check for demo user first
    const demoUser = localStorage.getItem('demoUser')

    if (demoUser) {
      try {
        const parsedDemoUser = JSON.parse(demoUser)
        setUserData({
          userId: parsedDemoUser.id,
          email: parsedDemoUser.email,
          fullName: parsedDemoUser.name,
          role: parsedDemoUser.role,
          isInstructor: parsedDemoUser.role === 'instructor',
          isDemo: true,
          isAuthenticated: true,
          authenticated: true, // Add both for compatibility
        })
        return
      } catch (error) {
        console.error('Error parsing demo user:', error)
      }
    }

    if (!authLoading && user && profile) {
      setUserData((prev: any) => ({
        ...prev,
        userId: user.id,
        email: user.email,
        fullName: profile.full_name,
        role: profile.role,
        isInstructor: profile.is_instructor,
        organizationId: profile.organization_id,
        isAuthenticated: true,
        authenticated: true, // Add both for compatibility
      }))
    } else if (!authLoading && !user) {
      // User is not authenticated - clear sensitive data but preserve chat state
      setUserData((prev: any) => ({
        initialMessage: prev.initialMessage, // Keep any initial message
        isAuthenticated: false,
        authenticated: false,
      }))
    }
  }, [user, profile, authLoading])

  // Load persisted chat messages from localStorage (messages only, not auth data)
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('humanglue_messages')
      const savedChatState = localStorage.getItem('humanglue_chatState')

      if (savedMessages) {
        setMessages(JSON.parse(savedMessages))
      }
      if (savedChatState) {
        setChatState(JSON.parse(savedChatState) as ChatState)
      }
    } catch (error) {
      console.error('Error loading chat state:', error)
    }
    setIsLoaded(true)
  }, [])

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    if (isLoaded && messages.length > 0) {
      try {
        localStorage.setItem('humanglue_messages', JSON.stringify(messages))
      } catch (error) {
        console.error('Error saving messages:', error)
      }
    }
  }, [messages, isLoaded])

  // Persist chatState to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('humanglue_chatState', JSON.stringify(chatState))
      } catch (error) {
        console.error('Error saving chatState:', error)
      }
    }
  }, [chatState, isLoaded])

  const onChatStateChange = (state: ChatState, data?: any) => {
    setChatState(state)
    if (data) {
      setUserData((prev: any) => ({ ...prev, ...data }))
    }
  }

  const openChatWithMessage = (message?: string, context?: any) => {
    setIsChatOpen(true)
    if (context) {
      setUserData((prev: any) => ({ ...prev, ...context }))
    }
    if (message) {
      // Add the initial message to be sent when chat opens
      setUserData((prev: any) => ({ ...prev, initialMessage: message }))
    }
  }

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        userData,
        setUserData,
        chatState,
        setChatState,
        suggestions,
        setSuggestions,
        onChatStateChange,
        isChatOpen,
        setIsChatOpen,
        openChatWithMessage
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
} 