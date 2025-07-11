'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { Message, ChatState } from '../types'

interface ChatContextType {
  messages: Message[]
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void
  userData: any
  setUserData: (data: any) => void
  chatState: ChatState
  setChatState: (state: ChatState) => void
  suggestions: any[]
  setSuggestions: (suggestions: any[]) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [userData, setUserData] = useState<any>({})
  const [chatState, setChatState] = useState<ChatState>('initial')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load persisted state from localStorage on mount
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('humanglue_messages')
      const savedUserData = localStorage.getItem('humanglue_userData')
      const savedChatState = localStorage.getItem('humanglue_chatState')
      
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages))
      }
      if (savedUserData) {
        setUserData(JSON.parse(savedUserData))
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

  // Persist userData to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded && Object.keys(userData).length > 0) {
      try {
        localStorage.setItem('humanglue_userData', JSON.stringify(userData))
      } catch (error) {
        console.error('Error saving userData:', error)
      }
    }
  }, [userData, isLoaded])

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
        setSuggestions
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