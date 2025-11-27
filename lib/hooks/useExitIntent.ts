'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Exit Intent Hook
 * Detects when user's mouse leaves the viewport from the top
 * Only triggers once per session to prevent annoyance
 * Respects user engagement state, time on page, and scroll behavior
 */
export function useExitIntent(enabled: boolean = true) {
  const [showExitIntent, setShowExitIntent] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const mountTimeRef = useRef<number>(Date.now())
  const maxScrollDepthRef = useRef<number>(0)

  // No need for timeOnPage or maxScrollDepth as state since they don't trigger UI updates
  // We'll calculate timeOnPage on-demand when checking exit intent

  // Track scroll depth using ref (no state updates needed)
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const currentDepth = (window.scrollY / scrollHeight) * 100

      maxScrollDepthRef.current = Math.max(maxScrollDepthRef.current, currentDepth)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!enabled) return

    // Check if we've already shown the exit intent in this session
    const sessionTriggered = sessionStorage.getItem('humanglue_exit_intent_shown')
    if (sessionTriggered === 'true') {
      setHasTriggered(true)
      return
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Calculate timeOnPage on-demand (no need to update state every second)
      const currentTimeOnPage = (Date.now() - mountTimeRef.current) / 1000

      // Improved triggering logic:
      // 1. Mouse must be leaving from top (clientY <= 50px or 5% of viewport)
      // 2. User must have been on page for at least 15 seconds
      // 3. User must not have scrolled significantly (< 25% = browsing, not committed)
      const viewportThreshold = Math.min(50, window.innerHeight * 0.05)
      const isLeavingFromTop = e.clientY <= viewportThreshold
      const hasMinimumTimeOnPage = currentTimeOnPage >= 15
      const isNotDeepScrolling = maxScrollDepthRef.current < 25

      if (isLeavingFromTop && hasMinimumTimeOnPage && isNotDeepScrolling && !hasTriggered) {
        setShowExitIntent(true)
        setHasTriggered(true)
        // Store in sessionStorage to prevent repeated triggers
        sessionStorage.setItem('humanglue_exit_intent_shown', 'true')

        // Log for debugging
        console.log('[ExitIntent] Triggered', {
          timeOnPage: Math.round(currentTimeOnPage) + 's',
          maxScrollDepth: Math.round(maxScrollDepthRef.current) + '%'
        })
      }
    }

    // Add event listener to document
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [enabled, hasTriggered])

  // Allow manual control to close the modal
  const closeExitIntent = useCallback(() => {
    setShowExitIntent(false)
  }, [])

  return {
    showExitIntent,
    closeExitIntent,
    hasTriggered,
  }
}
