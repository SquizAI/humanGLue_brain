/**
 * Personalization utilities for context-aware user experiences
 */

export interface PersonalizedGreeting {
  greeting: string
  context: string
  suggestions: string[]
}

/**
 * Get personalized greeting based on user context
 * Detects referral source, previous visits, and other context
 */
export function getPersonalizedGreeting(): PersonalizedGreeting {
  // Check if user has visited before
  const hasVisitedBefore = typeof window !== 'undefined'
    ? localStorage.getItem('humanglue_first_visit') !== null
    : false

  // Get URL parameters for referral tracking
  const urlParams = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams()

  const referralSource = urlParams.get('ref') || urlParams.get('utm_source') || ''
  const utmMedium = urlParams.get('utm_medium') || ''
  const utmCampaign = urlParams.get('utm_campaign') || ''

  // Mark first visit
  if (typeof window !== 'undefined' && !hasVisitedBefore) {
    localStorage.setItem('humanglue_first_visit', new Date().toISOString())
  }

  // Returning visitor
  if (hasVisitedBefore) {
    return {
      greeting: "Welcome back to HumanGlue!",
      context: "I remember our last conversation. Ready to continue your transformation journey?",
      suggestions: [
        "Continue where we left off",
        "Start fresh assessment",
        "See ROI calculator"
      ]
    }
  }

  // LinkedIn referral
  if (referralSource.toLowerCase().includes('linkedin') || utmMedium.toLowerCase().includes('social')) {
    return {
      greeting: "Welcome from LinkedIn!",
      context: "I see you're exploring how Fortune 1000 companies transform their teams. Let's discover your path to peak performance.",
      suggestions: [
        "Show me success stories",
        "Calculate potential ROI",
        "Start quick assessment"
      ]
    }
  }

  // Blog referral
  if (referralSource.toLowerCase().includes('blog') || utmMedium.toLowerCase().includes('content')) {
    return {
      greeting: "Great to see you here!",
      context: "Ready to turn insights into action? Let's explore how HumanGlue can transform your organization.",
      suggestions: [
        "See real client results",
        "Get personalized roadmap",
        "Schedule expert call"
      ]
    }
  }

  // Partner or campaign referral
  if (utmCampaign || referralSource) {
    return {
      greeting: "Welcome to HumanGlue!",
      context: "You're joining leading organizations on their transformation journey. Let me show you what's possible.",
      suggestions: [
        "Explore solutions",
        "See pricing options",
        "Start assessment"
      ]
    }
  }

  // Default first-time visitor - Start with proper assessment flow
  return {
    greeting: "Welcome. I'm your AI transformation advisor. I can help you:",
    context: "• Calculate ROI for AI initiatives\n• Get timeline for implementation\n• Book a strategy session\n\nLet's start with your first name:",
    suggestions: []
  }
}

/**
 * Track user engagement metrics
 */
export function trackEngagement(eventName: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return

  const engagementData = {
    event: eventName,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    referrer: document.referrer,
    ...properties
  }

  // Store engagement event
  const existingEvents = localStorage.getItem('humanglue_engagement_events')
  const events = existingEvents ? JSON.parse(existingEvents) : []
  events.push(engagementData)

  // Keep last 50 events
  if (events.length > 50) {
    events.shift()
  }

  localStorage.setItem('humanglue_engagement_events', JSON.stringify(events))
}

/**
 * Get user context for personalized experiences
 */
export function getUserContext(): {
  isReturning: boolean
  visitCount: number
  lastVisit: string | null
  referralSource: string | null
  hasCompletedAssessment: boolean
} {
  if (typeof window === 'undefined') {
    return {
      isReturning: false,
      visitCount: 0,
      lastVisit: null,
      referralSource: null,
      hasCompletedAssessment: false
    }
  }

  const firstVisit = localStorage.getItem('humanglue_first_visit')
  const visitCountStr = localStorage.getItem('humanglue_visit_count') || '0'
  const visitCount = parseInt(visitCountStr, 10)
  const lastVisit = localStorage.getItem('humanglue_last_visit')
  const urlParams = new URLSearchParams(window.location.search)
  const referralSource = urlParams.get('ref') || urlParams.get('utm_source')

  // Check if user has completed assessment
  const hasCompletedAssessment = Object.keys(localStorage)
    .some(key => key.startsWith('assessment_'))

  // Increment visit count
  localStorage.setItem('humanglue_visit_count', (visitCount + 1).toString())
  localStorage.setItem('humanglue_last_visit', new Date().toISOString())

  return {
    isReturning: !!firstVisit,
    visitCount: visitCount + 1,
    lastVisit,
    referralSource,
    hasCompletedAssessment
  }
}
