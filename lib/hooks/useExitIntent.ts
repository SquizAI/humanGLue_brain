'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * Exit Intent Hook
 * Detects when user's mouse leaves the viewport from the top
 * Only triggers once per session to prevent annoyance
 * Respects user engagement state
 */
export function useExitIntent(enabled: boolean = true) {
  const [showExitIntent, setShowExitIntent] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)

  useEffect(() => {
    if (!enabled) return

    // Check if we've already shown the exit intent in this session
    const sessionTriggered = sessionStorage.getItem('humanglue_exit_intent_shown')
    if (sessionTriggered === 'true') {
      setHasTriggered(true)
      return
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse is leaving from the top of the viewport
      // and moving upwards (negative clientY with low value)
      if (e.clientY <= 10 && !hasTriggered) {
        setShowExitIntent(true)
        setHasTriggered(true)
        // Store in sessionStorage to prevent repeated triggers
        sessionStorage.setItem('humanglue_exit_intent_shown', 'true')
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
