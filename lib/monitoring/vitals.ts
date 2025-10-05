/**
 * ============================================================================
 * Web Vitals Tracking
 * ============================================================================
 *
 * Tracks Core Web Vitals and sends them to analytics platforms
 *
 * Core Web Vitals tracked:
 * - LCP (Largest Contentful Paint): Loading performance
 * - FID (First Input Delay): Interactivity
 * - CLS (Cumulative Layout Shift): Visual stability
 *
 * Additional metrics:
 * - FCP (First Contentful Paint): Loading
 * - TTFB (Time to First Byte): Server response time
 * - INP (Interaction to Next Paint): Responsiveness
 *
 * Usage:
 * ```tsx
 * // In your root layout or _app.tsx
 * import { reportWebVitals } from '@/lib/monitoring/vitals'
 *
 * export function reportWebVitalsHandler(metric) {
 *   reportWebVitals(metric)
 * }
 * ```
 * ============================================================================
 */

import { onCLS, onFCP, onLCP, onTTFB, onINP, type Metric } from 'web-vitals'
import { logger } from './logger'

/**
 * Web Vitals thresholds (Google's recommended values)
 */
const THRESHOLDS = {
  LCP: {
    good: 2500,
    needsImprovement: 4000,
  },
  FID: {
    good: 100,
    needsImprovement: 300,
  },
  CLS: {
    good: 0.1,
    needsImprovement: 0.25,
  },
  FCP: {
    good: 1800,
    needsImprovement: 3000,
  },
  TTFB: {
    good: 800,
    needsImprovement: 1800,
  },
  INP: {
    good: 200,
    needsImprovement: 500,
  },
}

/**
 * Get rating for a metric value
 */
function getRating(
  name: keyof typeof THRESHOLDS,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name]

  if (value <= threshold.good) {
    return 'good'
  } else if (value <= threshold.needsImprovement) {
    return 'needs-improvement'
  } else {
    return 'poor'
  }
}

/**
 * Send metric to Google Analytics 4
 */
function sendToGoogleAnalytics(metric: Metric): void {
  const { name, value, id, rating } = metric

  // Check if GA is loaded
  if (typeof window === 'undefined' || !(window as any).gtag) {
    return
  }

  // Send to GA4
  ;(window as any).gtag('event', name, {
    value: Math.round(name === 'CLS' ? value * 1000 : value),
    metric_id: id,
    metric_value: value,
    metric_rating: rating,
    event_category: 'Web Vitals',
    event_label: id,
    non_interaction: true,
  })
}

/**
 * Send metric to custom analytics endpoint
 */
async function sendToAnalyticsAPI(metric: Metric): Promise<void> {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
    navigationType: metric.navigationType,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
  })

  try {
    // Use sendBeacon if available (doesn't block page unload)
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/vitals', body)
    } else {
      // Fallback to fetch with keepalive
      await fetch('/api/analytics/vitals', {
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
        },
        keepalive: true,
      })
    }
  } catch (error) {
    // Don't throw - analytics failures shouldn't break the app
    logger.debug('Failed to send web vitals', { error, metric: metric.name })
  }
}

/**
 * Send metric to PostHog
 */
function sendToPostHog(metric: Metric): void {
  if (typeof window === 'undefined' || !(window as any).posthog) {
    return
  }

  ;(window as any).posthog.capture('web_vital', {
    metric_name: metric.name,
    metric_value: metric.value,
    metric_rating: metric.rating,
    metric_id: metric.id,
  })
}

/**
 * Log metric to console in development
 */
function logMetric(metric: Metric): void {
  const { name, value, rating } = metric

  const formattedValue =
    name === 'CLS' ? value.toFixed(4) : `${Math.round(value)}ms`

  const emoji = rating === 'good' ? '✓' : rating === 'needs-improvement' ? '⚠' : '✗'

  logger.info(`${emoji} ${name}: ${formattedValue} (${rating})`, {
    metric: name,
    value,
    rating,
  })
}

/**
 * Main function to report web vitals
 */
export function reportWebVitals(metric: Metric): void {
  // Always log in development
  if (process.env.NODE_ENV === 'development') {
    logMetric(metric)
  }

  // Don't send to analytics in development unless explicitly enabled
  if (
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'true'
  ) {
    return
  }

  // Send to configured analytics platforms
  if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
    sendToGoogleAnalytics(metric)
  }

  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    sendToPostHog(metric)
  }

  // Send to custom analytics endpoint
  if (process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true') {
    sendToAnalyticsAPI(metric)
  }
}

/**
 * Initialize web vitals tracking
 *
 * Call this once in your app initialization
 */
export function initWebVitals(): void {
  // Track Core Web Vitals
  onCLS(reportWebVitals)
  onLCP(reportWebVitals)

  // Track additional metrics
  onFCP(reportWebVitals)
  onTTFB(reportWebVitals)
  onINP(reportWebVitals)

  logger.debug('Web Vitals tracking initialized')
}

/**
 * Get web vitals summary for debugging
 */
export async function getWebVitalsSummary(): Promise<Record<string, any>> {
  return new Promise((resolve) => {
    const vitals: Record<string, any> = {}

    const checkComplete = () => {
      const expectedMetrics = ['CLS', 'LCP', 'FCP', 'TTFB', 'INP']
      const collectedMetrics = Object.keys(vitals)

      // Resolve after collecting all metrics or 5 seconds timeout
      if (
        expectedMetrics.every((m) => collectedMetrics.includes(m)) ||
        collectedMetrics.length >= 4
      ) {
        resolve(vitals)
      }
    }

    const collectMetric = (metric: Metric) => {
      vitals[metric.name] = {
        value: metric.value,
        rating: metric.rating,
        id: metric.id,
      }
      checkComplete()
    }

    onCLS(collectMetric)
    onLCP(collectMetric)
    onFCP(collectMetric)
    onTTFB(collectMetric)
    onINP(collectMetric)

    // Timeout after 5 seconds
    setTimeout(() => {
      resolve(vitals)
    }, 5000)
  })
}

/**
 * Performance observer for custom metrics
 */
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map()

  /**
   * Mark the start of a performance measurement
   */
  mark(name: string): void {
    this.marks.set(name, performance.now())

    if (typeof window !== 'undefined' && window.performance && typeof window.performance.mark === 'function') {
      performance.mark(`${name}-start`)
    }
  }

  /**
   * Measure and report the duration since mark
   */
  measure(name: string): number | null {
    const start = this.marks.get(name)

    if (!start) {
      logger.warn(`Performance mark "${name}" not found`)
      return null
    }

    const duration = performance.now() - start
    this.marks.delete(name)

    // Create performance measure
    if (typeof window !== 'undefined' && window.performance && typeof window.performance.measure === 'function') {
      try {
        performance.measure(name, `${name}-start`)
      } catch (error) {
        // Ignore errors
      }
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`Performance: ${name} took ${duration.toFixed(2)}ms`)
    }

    // Send to analytics
    if (process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true') {
      this.reportCustomMetric(name, duration)
    }

    return duration
  }

  /**
   * Report a custom metric to analytics
   */
  private reportCustomMetric(name: string, value: number): void {
    if (typeof window === 'undefined') return

    // Send to GA4
    if ((window as any).gtag) {
      ;(window as any).gtag('event', 'timing_complete', {
        name,
        value: Math.round(value),
        event_category: 'Performance',
      })
    }

    // Send to PostHog
    if ((window as any).posthog) {
      ;(window as any).posthog.capture('custom_performance_metric', {
        metric_name: name,
        duration_ms: value,
      })
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor()

/**
 * Convenience function to measure async operations
 *
 * @example
 * ```ts
 * const data = await measureAsync('fetchUserData', async () => {
 *   return await fetchUser()
 * })
 * ```
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  performanceMonitor.mark(name)

  try {
    const result = await fn()
    performanceMonitor.measure(name)
    return result
  } catch (error) {
    performanceMonitor.measure(name)
    throw error
  }
}

/**
 * Export for use in Next.js app
 *
 * Add to app/layout.tsx:
 * ```tsx
 * export { reportWebVitals } from '@/lib/monitoring/vitals'
 * ```
 */
export { onCLS, onFCP, onLCP, onTTFB, onINP }
