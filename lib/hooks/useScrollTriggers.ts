'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

/**
 * Scroll Trigger Event Types
 */
export type ScrollTriggerType =
  | 'scroll-25'
  | 'scroll-50'
  | 'scroll-75'
  | 'scroll-100'
  | 'fast-scroll'
  | 'slow-scroll'
  | 'bounce'
  | 'viewport-section'

export interface ScrollTriggerEvent {
  type: ScrollTriggerType
  timestamp: number
  scrollDepth: number
  scrollVelocity: number
  viewportSection?: string
}

export interface ScrollMetrics {
  scrollDepth: number
  scrollVelocity: number
  isFastScrolling: boolean
  isSlowScrolling: boolean
  bounceDetected: boolean
  currentSection: string | null
  timeInSection: number
}

interface UseScrollTriggersOptions {
  enabled?: boolean
  fastScrollThreshold?: number // pixels per frame
  slowScrollThreshold?: number // pixels per frame
  bounceThreshold?: number // rapid direction changes
  sectionElements?: string[] // CSS selectors for viewport sections
  persistTriggers?: boolean // Store in localStorage to avoid repetition
}

const DEFAULT_OPTIONS: Required<UseScrollTriggersOptions> = {
  enabled: true,
  fastScrollThreshold: 20,
  slowScrollThreshold: 2,
  bounceThreshold: 3,
  sectionElements: [],
  persistTriggers: true,
}

/**
 * useScrollTriggers Hook
 *
 * Detects scroll-based engagement patterns:
 * - Scroll depth milestones (25%, 50%, 75%, 100%)
 * - Scroll velocity (fast vs slow scrolling)
 * - Bounce detection (rapid up/down movement)
 * - Time spent in viewport sections
 *
 * @example
 * ```tsx
 * const { metrics, triggers, resetTriggers } = useScrollTriggers({
 *   enabled: true,
 *   sectionElements: ['#hero', '#features', '#pricing']
 * })
 * ```
 */
export function useScrollTriggers(options: UseScrollTriggersOptions = {}) {
  // Memoize opts to prevent infinite re-renders
  const opts = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [
    options.enabled,
    options.fastScrollThreshold,
    options.slowScrollThreshold,
    options.bounceThreshold,
    options.persistTriggers,
    // sectionElements is intentionally omitted as it's typically a new array each render
    // We'll handle it separately in detectCurrentSection
  ])

  const [metrics, setMetrics] = useState<ScrollMetrics>({
    scrollDepth: 0,
    scrollVelocity: 0,
    isFastScrolling: false,
    isSlowScrolling: false,
    bounceDetected: false,
    currentSection: null,
    timeInSection: 0,
  })

  const [triggers, setTriggers] = useState<ScrollTriggerEvent[]>([])

  // Track previous scroll position and direction changes
  const prevScrollY = useRef(0)
  const prevTimestamp = useRef(Date.now())
  const directionChanges = useRef(0)
  const lastDirection = useRef<'up' | 'down' | null>(null)
  const sectionStartTime = useRef<number>(Date.now())
  const currentSection = useRef<string | null>(null)

  // Track which depth milestones have been triggered
  const triggeredDepths = useRef<Set<number>>(new Set())

  // Track which trigger types have been fired (to avoid dependency on triggers state)
  const firedTriggers = useRef<Set<ScrollTriggerType>>(new Set())

  // Animation frame ID
  const rafId = useRef<number>()

  /**
   * Add a trigger event (with optional localStorage persistence)
   */
  const addTrigger = useCallback((type: ScrollTriggerType, depth: number, velocity: number) => {
    if (opts.persistTriggers) {
      const storageKey = `humanglue_scroll_trigger_${type}`
      const hasTriggered = localStorage.getItem(storageKey)

      if (hasTriggered === 'true') {
        return // Don't trigger again
      }

      localStorage.setItem(storageKey, 'true')
    }

    const event: ScrollTriggerEvent = {
      type,
      timestamp: Date.now(),
      scrollDepth: depth,
      scrollVelocity: velocity,
    }

    // Mark as fired in ref to avoid re-triggering
    firedTriggers.current.add(type)
    setTriggers((prev) => [...prev, event])
  }, [opts.persistTriggers])

  /**
   * Detect which viewport section is currently visible
   */
  const detectCurrentSection = useCallback(() => {
    const sectionElements = options.sectionElements || []
    if (sectionElements.length === 0) return null

    const viewportCenter = window.innerHeight / 2

    for (const selector of sectionElements) {
      const element = document.querySelector(selector)
      if (!element) continue

      const rect = element.getBoundingClientRect()

      // Check if section center is in viewport
      if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
        return selector
      }
    }

    return null
  }, [options.sectionElements])

  /**
   * Main scroll handler using requestAnimationFrame for performance
   */
  const handleScroll = useCallback(() => {
    if (!opts.enabled) return

    const now = Date.now()
    const scrollY = window.scrollY
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight

    // Calculate scroll depth percentage
    const depth = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0

    // Calculate scroll velocity (pixels per millisecond, then per frame)
    const timeDelta = now - prevTimestamp.current
    const scrollDelta = scrollY - prevScrollY.current
    const velocity = timeDelta > 0 ? Math.abs(scrollDelta / timeDelta) * 16 : 0 // Normalize to ~60fps

    // Detect direction changes (for bounce detection)
    const currentDirection = scrollDelta > 0 ? 'down' : scrollDelta < 0 ? 'up' : null
    if (currentDirection && currentDirection !== lastDirection.current && lastDirection.current !== null) {
      directionChanges.current += 1

      // Reset direction change counter after a delay
      setTimeout(() => {
        directionChanges.current = Math.max(0, directionChanges.current - 1)
      }, 1000)
    }
    lastDirection.current = currentDirection

    // Detect bounce (rapid direction changes)
    const bounceDetected = directionChanges.current >= opts.bounceThreshold
    if (bounceDetected && !firedTriggers.current.has('bounce')) {
      addTrigger('bounce', depth, velocity)
    }

    // Detect fast/slow scrolling
    const isFastScrolling = velocity > opts.fastScrollThreshold
    const isSlowScrolling = velocity > 0 && velocity < opts.slowScrollThreshold

    if (isFastScrolling && !firedTriggers.current.has('fast-scroll')) {
      addTrigger('fast-scroll', depth, velocity)
    }

    if (isSlowScrolling && scrollY > 100) {
      // Only trigger slow scroll after some engagement
      if (!firedTriggers.current.has('slow-scroll')) {
        addTrigger('slow-scroll', depth, velocity)
      }
    }

    // Check depth milestones
    const milestones = [
      { threshold: 25, type: 'scroll-25' as ScrollTriggerType },
      { threshold: 50, type: 'scroll-50' as ScrollTriggerType },
      { threshold: 75, type: 'scroll-75' as ScrollTriggerType },
      { threshold: 100, type: 'scroll-100' as ScrollTriggerType },
    ]

    milestones.forEach(({ threshold, type }) => {
      if (depth >= threshold && !triggeredDepths.current.has(threshold)) {
        triggeredDepths.current.add(threshold)
        addTrigger(type, depth, velocity)
      }
    })

    // Detect current viewport section
    const newSection = detectCurrentSection()
    let timeInSection = 0

    if (newSection !== currentSection.current) {
      currentSection.current = newSection
      sectionStartTime.current = now
    } else if (newSection) {
      timeInSection = now - sectionStartTime.current
    }

    // Update metrics
    setMetrics({
      scrollDepth: depth,
      scrollVelocity: velocity,
      isFastScrolling,
      isSlowScrolling,
      bounceDetected,
      currentSection: newSection,
      timeInSection,
    })

    // Update refs for next frame
    prevScrollY.current = scrollY
    prevTimestamp.current = now
  }, [opts, addTrigger, detectCurrentSection])

  /**
   * Throttled scroll handler using requestAnimationFrame
   */
  const onScroll = useCallback(() => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current)
    }

    rafId.current = requestAnimationFrame(handleScroll)
  }, [handleScroll])

  /**
   * Reset all triggers (useful for testing or user re-engagement)
   */
  const resetTriggers = useCallback(() => {
    setTriggers([])
    triggeredDepths.current.clear()
    firedTriggers.current.clear()
    directionChanges.current = 0
    lastDirection.current = null

    if (opts.persistTriggers) {
      const types: ScrollTriggerType[] = [
        'scroll-25', 'scroll-50', 'scroll-75', 'scroll-100',
        'fast-scroll', 'slow-scroll', 'bounce'
      ]
      types.forEach(type => {
        localStorage.removeItem(`humanglue_scroll_trigger_${type}`)
      })
    }
  }, [opts.persistTriggers])

  /**
   * Check if a specific trigger has fired
   */
  const hasTrigger = useCallback((type: ScrollTriggerType) => {
    return triggers.some(t => t.type === type)
  }, [triggers])

  /**
   * Get the latest trigger of a specific type
   */
  const getLatestTrigger = useCallback((type: ScrollTriggerType) => {
    return triggers.filter(t => t.type === type).pop()
  }, [triggers])

  // Setup scroll listener
  useEffect(() => {
    if (!opts.enabled) return

    window.addEventListener('scroll', onScroll, { passive: true })

    // Initial measurement
    handleScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId.current) {
        cancelAnimationFrame(rafId.current)
      }
    }
  }, [opts.enabled, onScroll, handleScroll])

  return {
    metrics,
    triggers,
    hasTrigger,
    getLatestTrigger,
    resetTriggers,
  }
}
