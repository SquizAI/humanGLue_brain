// Analytics tracking utility for Human Glue

interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
  timestamp?: Date
}

interface ConversionEvent {
  type: 'chat_started' | 'demo_requested' | 'contact_form' | 'assessment_completed'
  value?: number
  properties?: Record<string, any>
}

class Analytics {
  private isInitialized = false
  private userId: string | null = null
  private sessionId: string

  constructor() {
    this.sessionId = this.generateSessionId()
    this.initializeAnalytics()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeAnalytics() {
    if (typeof window === 'undefined') return

    // Initialize Google Analytics 4
    if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`
      document.head.appendChild(script)

      window.dataLayer = window.dataLayer || []
      function gtag(...args: any[]) {
        window.dataLayer.push(args)
      }
      gtag('js', new Date())
      gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        send_page_view: false // We'll send manually
      })
    }

    this.isInitialized = true
  }

  // Track page views
  trackPageView(path: string, title?: string) {
    if (!this.isInitialized || typeof window === 'undefined') return

    // Google Analytics
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: path,
        page_title: title || document.title,
        session_id: this.sessionId,
        user_id: this.userId
      })
    }

    // Custom tracking endpoint
    this.sendToEndpoint({
      type: 'page_view',
      path,
      title: title || document.title,
      referrer: document.referrer,
      timestamp: new Date()
    })
  }

  // Track custom events
  trackEvent(event: AnalyticsEvent) {
    if (!this.isInitialized || typeof window === 'undefined') return

    // Google Analytics
    if (window.gtag) {
      window.gtag('event', event.name, {
        ...event.properties,
        session_id: this.sessionId,
        user_id: this.userId
      })
    }

    // Custom tracking
    this.sendToEndpoint({
      type: 'event',
      ...event,
      session_id: this.sessionId,
      user_id: this.userId,
      timestamp: event.timestamp || new Date()
    })
  }

  // Track conversions
  trackConversion(conversion: ConversionEvent) {
    if (!this.isInitialized || typeof window === 'undefined') return

    // Google Analytics conversion
    if (window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: process.env.NEXT_PUBLIC_GA_CONVERSION_ID,
        value: conversion.value || 0,
        currency: 'USD',
        transaction_id: `${this.sessionId}_${Date.now()}`,
        ...conversion.properties
      })
    }

    // Track as custom event
    this.trackEvent({
      name: `conversion_${conversion.type}`,
      properties: {
        value: conversion.value,
        ...conversion.properties
      }
    })
  }

  // Track chat interactions
  trackChatInteraction(action: string, metadata?: Record<string, any>) {
    this.trackEvent({
      name: 'chat_interaction',
      properties: {
        action,
        ...metadata
      }
    })
  }

  // Track CTA clicks
  trackCTAClick(ctaName: string, location: string, destination?: string) {
    this.trackEvent({
      name: 'cta_click',
      properties: {
        cta_name: ctaName,
        location,
        destination
      }
    })
  }

  // Track form interactions
  trackFormInteraction(formName: string, action: 'start' | 'submit' | 'error', fields?: Record<string, any>) {
    this.trackEvent({
      name: 'form_interaction',
      properties: {
        form_name: formName,
        action,
        fields
      }
    })
  }

  // Set user ID for tracking
  setUserId(userId: string) {
    this.userId = userId
    
    if (window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        user_id: userId
      })
    }
  }

  // Track timing (performance)
  trackTiming(category: string, variable: string, value: number) {
    if (!this.isInitialized || typeof window === 'undefined') return

    if (window.gtag) {
      window.gtag('event', 'timing_complete', {
        name: variable,
        value: Math.round(value),
        event_category: category
      })
    }
  }

  // Track errors
  trackError(error: Error, context?: Record<string, any>) {
    this.trackEvent({
      name: 'error',
      properties: {
        error_message: error.message,
        error_stack: error.stack,
        ...context
      }
    })
  }

  // Send to custom endpoint
  private async sendToEndpoint(data: any) {
    if (!process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) return

    try {
      await fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          client_timestamp: new Date().toISOString(),
          page_url: window.location.href,
          user_agent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        })
      })
    } catch (error) {
      console.error('Analytics error:', error)
    }
  }
}

// Create singleton instance
export const analytics = new Analytics()

// React hook for analytics
export function useAnalytics() {
  return analytics
}

// Declare global types
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}