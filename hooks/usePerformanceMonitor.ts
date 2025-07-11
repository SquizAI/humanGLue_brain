'use client'

import { useEffect } from 'react'

export interface PerformanceMetrics {
  FCP?: number // First Contentful Paint
  LCP?: number // Largest Contentful Paint
  FID?: number // First Input Delay
  CLS?: number // Cumulative Layout Shift
  TTFB?: number // Time to First Byte
}

export function usePerformanceMonitor(onMetric?: (metric: PerformanceMetrics) => void) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const metrics: PerformanceMetrics = {}

    // Report Web Vitals
    const reportWebVitals = async () => {
      if ('web-vital' in window) return

      try {
        const { onCLS, onINP, onLCP, onFCP, onTTFB } = await import('web-vitals')

        onCLS((metric: any) => {
          metrics.CLS = metric.value
          onMetric?.(metrics)
          console.log('CLS:', metric.value)
        })

        onINP((metric: any) => {
          metrics.FID = metric.value
          onMetric?.(metrics)
          console.log('INP:', metric.value)
        })

        onLCP((metric: any) => {
          metrics.LCP = metric.value
          onMetric?.(metrics)
          console.log('LCP:', metric.value)
        })

        onFCP((metric: any) => {
          metrics.FCP = metric.value
          onMetric?.(metrics)
          console.log('FCP:', metric.value)
        })

        onTTFB((metric: any) => {
          metrics.TTFB = metric.value
          onMetric?.(metrics)
          console.log('TTFB:', metric.value)
        })
      } catch (error) {
        console.error('Failed to load web-vitals:', error)
      }
    }

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn('Long task detected:', {
                duration: entry.duration,
                startTime: entry.startTime,
                name: entry.name
              })
            }
          }
        })

        observer.observe({ entryTypes: ['longtask'] })

        return () => observer.disconnect()
      } catch (error) {
        console.error('Failed to observe long tasks:', error)
      }
    }

    reportWebVitals()
  }, [onMetric])

  // Return a function to manually trigger performance marks
  const mark = (name: string) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(name)
    }
  }

  const measure = (name: string, startMark: string, endMark: string) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      try {
        performance.measure(name, startMark, endMark)
        const measure = performance.getEntriesByName(name, 'measure')[0]
        console.log(`Performance measure "${name}":`, measure.duration, 'ms')
      } catch (error) {
        console.error('Failed to measure performance:', error)
      }
    }
  }

  return { mark, measure }
} 