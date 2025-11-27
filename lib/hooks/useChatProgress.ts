/**
 * Chat Progress Hook - Saves and recovers chat state
 * Detects abandonment and offers recovery options
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { Message, ChatState } from '../types'

export interface ChatProgress {
  messages: Message[]
  userData: any
  currentState: ChatState
  timestamp: string
  url: string
}

export interface UseChatProgressReturn {
  saveProgress: () => void
  loadProgress: () => ChatProgress | null
  clearProgress: () => void
  abandonmentDetected: boolean
  resetAbandonmentFlag: () => void
}

const STORAGE_KEY = 'humanglue_chat_progress'
const ACTIVITY_TIMEOUT = 120000 // 120 seconds (increased from 60s)
const SAVE_INTERVAL = 30000 // 30 seconds
const PROGRESS_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Hook for managing chat progress and abandonment detection
 */
export function useChatProgress(
  messages: Message[],
  userData: any,
  currentState: ChatState
): UseChatProgressReturn {
  const [abandonmentDetected, setAbandonmentDetected] = useState(false)
  const lastActivityRef = useRef<number>(Date.now())
  const lastScrollPosRef = useRef<number>(0)
  const saveIntervalRef = useRef<NodeJS.Timeout>()
  const activityCheckRef = useRef<NodeJS.Timeout>()

  // Save progress to localStorage
  const saveProgress = useCallback(() => {
    if (typeof window === 'undefined') return

    // Only save if there are messages
    if (messages.length === 0) return

    const progress: ChatProgress = {
      messages,
      userData,
      currentState,
      timestamp: new Date().toISOString(),
      url: window.location.href
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
      console.log('[ChatProgress] Progress saved:', {
        messageCount: messages.length,
        state: currentState
      })
    } catch (error) {
      console.error('[ChatProgress] Failed to save progress:', error)
    }
  }, [messages, userData, currentState])

  // Load progress from localStorage
  const loadProgress = useCallback((): ChatProgress | null => {
    if (typeof window === 'undefined') return null

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return null

      const progress: ChatProgress = JSON.parse(stored)

      // Check if progress has expired
      const age = Date.now() - new Date(progress.timestamp).getTime()
      if (age > PROGRESS_EXPIRY) {
        localStorage.removeItem(STORAGE_KEY)
        return null
      }

      console.log('[ChatProgress] Progress loaded:', {
        messageCount: progress.messages.length,
        state: progress.currentState,
        age: Math.round(age / 1000) + 's'
      })

      return progress
    } catch (error) {
      console.error('[ChatProgress] Failed to load progress:', error)
      return null
    }
  }, [])

  // Clear progress from localStorage
  const clearProgress = useCallback(() => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
    console.log('[ChatProgress] Progress cleared')
  }, [])

  // Reset abandonment flag
  const resetAbandonmentFlag = useCallback(() => {
    setAbandonmentDetected(false)
    lastActivityRef.current = Date.now()
  }, [])

  // Track user activity
  const handleActivity = useCallback(() => {
    lastActivityRef.current = Date.now()
  }, [])

  // Check for abandonment
  const checkAbandonment = useCallback(() => {
    if (typeof window === 'undefined') return

    const timeSinceActivity = Date.now() - lastActivityRef.current
    const currentScrollPos = window.scrollY
    const scrollDelta = Math.abs(currentScrollPos - lastScrollPosRef.current)

    // Detect abandonment if:
    // 1. User has been inactive for ACTIVITY_TIMEOUT
    // 2. There are messages in the chat
    // 3. Chat is not completed
    // 4. User hasn't scrolled significantly (< 100px) - indicates they're not actively reading
    if (
      timeSinceActivity > ACTIVITY_TIMEOUT &&
      messages.length > 0 &&
      currentState !== 'completed' &&
      !abandonmentDetected &&
      scrollDelta < 100 // User hasn't scrolled much - truly inactive
    ) {
      console.log('[ChatProgress] Abandonment detected:', {
        inactiveFor: Math.round(timeSinceActivity / 1000) + 's',
        messageCount: messages.length,
        state: currentState,
        scrollDelta
      })
      setAbandonmentDetected(true)
    }

    // Update scroll position for next check
    lastScrollPosRef.current = currentScrollPos
  }, [messages.length, currentState, abandonmentDetected])

  // Set up activity tracking
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Activity events to track
    const events = ['mousemove', 'keypress', 'scroll', 'click', 'touchstart']

    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity)
      })
    }
  }, [handleActivity])

  // Set up periodic saving and abandonment checking
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Save progress periodically
    saveIntervalRef.current = setInterval(() => {
      saveProgress()
    }, SAVE_INTERVAL)

    // Check for abandonment periodically
    activityCheckRef.current = setInterval(() => {
      checkAbandonment()
    }, 10000) // Check every 10 seconds

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current)
      }
      if (activityCheckRef.current) {
        clearInterval(activityCheckRef.current)
      }
    }
  }, [saveProgress, checkAbandonment])

  // Save progress when component unmounts or messages change
  useEffect(() => {
    // Save on significant state changes
    if (messages.length > 0) {
      saveProgress()
    }
  }, [messages.length, currentState])

  // Save progress before page unload
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleBeforeUnload = () => {
      saveProgress()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [saveProgress])

  return {
    saveProgress,
    loadProgress,
    clearProgress,
    abandonmentDetected,
    resetAbandonmentFlag
  }
}
