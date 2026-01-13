/**
 * ============================================================================
 * Web Vitals Tracking for HMN Platform
 * ============================================================================
 * Track Core Web Vitals and send to analytics for performance monitoring.
 *
 * Metrics tracked:
 * - CLS (Cumulative Layout Shift)
 * - FID (First Input Delay)
 * - FCP (First Contentful Paint)
 * - LCP (Largest Contentful Paint)
 * - TTFB (Time to First Byte)
 * - INP (Interaction to Next Paint)
 *
 * Setup:
 * 1. Install: npm install web-vitals
 * 2. Import in app/layout.tsx
 * 3. Configure analytics endpoint
 * ============================================================================
 */

import { onCLS, onFCP, onLCP, onTTFB, onINP, type Metric } from 'web-vitals'

const IS_PRODUCTION = process.env.NEXT_PUBLIC_ENV === 'production'
const ANALYTICS_ENABLED = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || ''

/**
 * Web Vitals thresholds (Google recommendations)
 */
const THRESHOLDS = {
  CLS: {
    good: 0.1,
    needs_improvement: 0.25,
  },
  FID: {
    good: 100,
    needs_improvement: 300,
  },
  FCP: {
    good: 1800,
    needs_improvement: 3000,
  },
  LCP: {
    good: 2500,
    needs_improvement: 4000,
  },
  TTFB: {
    good: 800,
    needs_improvement: 1800,
  },
  INP: {
    good: 200,
    needs_improvement: 500,
  },
}

/**
 * Get rating for a metric
 */
function getRating(metric: Metric): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[metric.name as keyof typeof THRESHOLDS]
  if (!threshold) return 'good'

  if (metric.value <= threshold.good) return 'good'
  if (metric.value <= threshold.needs_improvement) return 'needs-improvement'
  return 'poor'
}

/**
 * Send metric to analytics
 */
function sendToAnalytics(metric: Metric) {
  const body = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating || getRating(metric),
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
  }

  // Log in development
  if (!IS_PRODUCTION) {
    console.log('[Web Vitals]', body)
  }

  // Send to analytics endpoint
  if (ANALYTICS_ENABLED) {
    // Use sendBeacon if available (doesn't block page unload)
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(body)], { type: 'application/json' })
      navigator.sendBeacon('/api/analytics/web-vitals', blob)
    } else {
      // Fallback to fetch with keepalive
      fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        keepalive: true,
      }).catch((error) => {
        console.error('Failed to send web vitals:', error)
      })
    }
  }

  // Send to Google Analytics (if configured)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
      metric_rating: metric.rating || getRating(metric),
    })
  }

  // Send to Vercel Analytics (if using Vercel)
  if (typeof window !== 'undefined' && (window as any).va) {
    ;(window as any).va('track', metric.name, {
      value: metric.value,
      rating: metric.rating || getRating(metric),
    })
  }
}

/**
 * Initialize Web Vitals tracking
 */
export function initWebVitals() {
  if (typeof window === 'undefined') {
    return
  }

  // Track all Core Web Vitals
  onCLS(sendToAnalytics)
  onFCP(sendToAnalytics)
  onLCP(sendToAnalytics)
  onTTFB(sendToAnalytics)
  onINP(sendToAnalytics)

  // Log initialization
  if (!IS_PRODUCTION) {
    console.log('[Web Vitals] Tracking initialized')
  }
}

/**
 * Get current Web Vitals values
 */
export function getCurrentWebVitals(): Promise<Record<string, number>> {
  return new Promise((resolve) => {
    const vitals: Record<string, number> = {}

    const checkComplete = () => {
      if (Object.keys(vitals).length >= 6) {
        resolve(vitals)
      }
    }

    onCLS((metric) => {
      vitals.CLS = metric.value
      checkComplete()
    })

    onFCP((metric) => {
      vitals.FCP = metric.value
      checkComplete()
    })

    onLCP((metric) => {
      vitals.LCP = metric.value
      checkComplete()
    })

    onTTFB((metric) => {
      vitals.TTFB = metric.value
      checkComplete()
    })

    onINP((metric) => {
      vitals.INP = metric.value
      checkComplete()
    })

    // Timeout after 5 seconds
    setTimeout(() => resolve(vitals), 5000)
  })
}

/**
 * Report custom performance metric
 */
export function reportCustomMetric(name: string, value: number, context?: Record<string, any>) {
  const body = {
    name: `custom.${name}`,
    value,
    context,
    url: window.location.href,
    timestamp: Date.now(),
  }

  if (!IS_PRODUCTION) {
    console.log('[Custom Metric]', body)
  }

  if (ANALYTICS_ENABLED) {
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(body)], { type: 'application/json' })
      navigator.sendBeacon('/api/analytics/custom-metrics', blob)
    } else {
      fetch('/api/analytics/custom-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        keepalive: true,
      }).catch((error) => {
        console.error('Failed to send custom metric:', error)
      })
    }
  }
}

/**
 * Performance observer for long tasks
 */
export function observeLongTasks(callback?: (duration: number) => void) {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return
  }

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const duration = entry.duration
        if (duration > 50) {
          // Tasks longer than 50ms
          if (!IS_PRODUCTION) {
            console.warn('[Long Task]', {
              duration: `${duration.toFixed(2)}ms`,
              startTime: entry.startTime,
            })
          }

          reportCustomMetric('long_task', duration, {
            startTime: entry.startTime,
          })

          callback?.(duration)
        }
      }
    })

    observer.observe({ entryTypes: ['longtask'] })

    return () => observer.disconnect()
  } catch (error) {
    console.error('Failed to observe long tasks:', error)
  }
}

/**
 * Performance observer for layout shifts
 */
export function observeLayoutShifts(callback?: (shift: number) => void) {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return
  }

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if ((entry as any).hadRecentInput) {
          // Ignore shifts caused by user input
          continue
        }

        const shift = (entry as any).value
        if (shift > 0.1) {
          // Significant layout shift
          if (!IS_PRODUCTION) {
            console.warn('[Layout Shift]', {
              value: shift.toFixed(4),
              sources: (entry as any).sources,
            })
          }

          reportCustomMetric('layout_shift', shift, {
            sources: (entry as any).sources?.length || 0,
          })

          callback?.(shift)
        }
      }
    })

    observer.observe({ entryTypes: ['layout-shift'] })

    return () => observer.disconnect()
  } catch (error) {
    console.error('Failed to observe layout shifts:', error)
  }
}

/**
 * Measure and report navigation timing
 */
export function reportNavigationTiming() {
  if (typeof window === 'undefined' || !window.performance) {
    return
  }

  // Wait for page to fully load
  window.addEventListener('load', () => {
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

      if (!navigation) return

      const metrics = {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        ttfb: navigation.responseStart - navigation.requestStart,
        download: navigation.responseEnd - navigation.responseStart,
        domInteractive: navigation.domInteractive - navigation.fetchStart,
        domComplete: navigation.domComplete - navigation.fetchStart,
        loadComplete: navigation.loadEventEnd - navigation.fetchStart,
      }

      if (!IS_PRODUCTION) {
        console.log('[Navigation Timing]', metrics)
      }

      Object.entries(metrics).forEach(([name, value]) => {
        reportCustomMetric(`navigation.${name}`, value)
      })
    }, 0)
  })
}

/**
 * Measure and report resource timing
 */
export function reportResourceTiming() {
  if (typeof window === 'undefined' || !window.performance) {
    return
  }

  window.addEventListener('load', () => {
    setTimeout(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]

      const summary = {
        total: resources.length,
        scripts: 0,
        stylesheets: 0,
        images: 0,
        fonts: 0,
        other: 0,
        totalSize: 0,
        totalDuration: 0,
      }

      resources.forEach((resource) => {
        // Categorize resource
        if (resource.name.endsWith('.js')) {
          summary.scripts++
        } else if (resource.name.endsWith('.css')) {
          summary.stylesheets++
        } else if (resource.name.match(/\.(png|jpg|jpeg|gif|svg|webp|avif)$/)) {
          summary.images++
        } else if (resource.name.match(/\.(woff|woff2|ttf|otf)$/)) {
          summary.fonts++
        } else {
          summary.other++
        }

        summary.totalSize += resource.transferSize || 0
        summary.totalDuration += resource.duration
      })

      if (!IS_PRODUCTION) {
        console.log('[Resource Timing]', summary)
      }

      Object.entries(summary).forEach(([name, value]) => {
        reportCustomMetric(`resources.${name}`, value)
      })
    }, 0)
  })
}

/**
 * Initialize all performance tracking
 */
export function initPerformanceTracking() {
  initWebVitals()
  observeLongTasks()
  observeLayoutShifts()
  reportNavigationTiming()
  reportResourceTiming()
}
