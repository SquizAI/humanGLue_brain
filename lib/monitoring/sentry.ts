/**
 * ============================================================================
 * Sentry Error Tracking Configuration
 * ============================================================================
 *
 * This module configures Sentry for error tracking and performance monitoring
 * across the HMN platform.
 *
 * Features:
 * - Error tracking and reporting
 * - Performance monitoring
 * - Session replay
 * - User feedback
 * - Breadcrumb tracking
 *
 * Usage:
 *   Import this file in your app layout or _app.tsx
 *   Sentry will automatically capture errors
 *
 * ============================================================================
 */

import * as Sentry from '@sentry/nextjs'

/**
 * Initialize Sentry with configuration
 *
 * This should be called once at application startup
 */
export function initSentry() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN

  // Only initialize if DSN is provided and not in development (unless explicitly enabled)
  const isProduction = process.env.NODE_ENV === 'production'
  const isDevelopment = process.env.NODE_ENV === 'development'
  const enableInDev = process.env.SENTRY_ENABLE_IN_DEV === 'true'

  if (!dsn) {
    console.warn('Sentry DSN not configured - error tracking disabled')
    return
  }

  if (isDevelopment && !enableInDev) {
    console.log('Sentry disabled in development - set SENTRY_ENABLE_IN_DEV=true to enable')
    return
  }

  const environment = process.env.SENTRY_ENVIRONMENT || process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || 'development'

  Sentry.init({
    dsn,
    environment,

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: getTracesSampleRate(environment),

    // Session Replay
    replaysSessionSampleRate: getReplaysSampleRate(environment),
    replaysOnErrorSampleRate: parseFloat(process.env.SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE || '1.0'),

    // Enable debug mode in non-production environments
    debug: !isProduction,

    // Release tracking
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || process.env.COMMIT_REF,

    // Automatically set user context from Supabase auth
    beforeSend(event, hint) {
      // Add custom logic here if needed
      return event
    },

    // Filter out known noise
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',
      // Network errors
      'NetworkError',
      'Failed to fetch',
      'Load failed',
      // Intentional aborts
      'AbortError',
      'The operation was aborted',
    ],

    // Set up breadcrumbs
    beforeBreadcrumb(breadcrumb) {
      // Filter or modify breadcrumbs if needed
      if (breadcrumb.category === 'console') {
        return null // Don't capture console logs as breadcrumbs
      }
      return breadcrumb
    },

    // Integration configuration
    integrations: [
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
        maskAllInputs: true, // Protect sensitive input data
      }),
    ],
  })

  console.log(`Sentry initialized in ${environment} environment`)
}

/**
 * Get traces sample rate based on environment
 */
function getTracesSampleRate(environment: string): number {
  const customRate = parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '')

  if (!isNaN(customRate)) {
    return Math.max(0, Math.min(1, customRate))
  }

  // Default rates by environment
  switch (environment) {
    case 'production':
      return 0.1 // 10% in production
    case 'staging':
      return 0.5 // 50% in staging
    default:
      return 1.0 // 100% in development/preview
  }
}

/**
 * Get replay sample rate based on environment
 */
function getReplaysSampleRate(environment: string): number {
  const customRate = parseFloat(process.env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE || '')

  if (!isNaN(customRate)) {
    return Math.max(0, Math.min(1, customRate))
  }

  // Default rates by environment
  switch (environment) {
    case 'production':
      return 0.1 // 10% in production
    case 'staging':
      return 0.2 // 20% in staging
    default:
      return 0.5 // 50% in development/preview
  }
}

/**
 * Get current user for context (implement based on your auth system)
 */
function getCurrentUser(): { id: string; email: string } | null {
  // TODO: Implement based on your authentication system
  // Example: get from Supabase session, NextAuth, etc.

  if (typeof window === 'undefined') {
    return null
  }

  // Example implementation (adjust for your auth system):
  // const session = getSession()
  // return session?.user ? { id: session.user.id, email: session.user.email } : null

  return null
}

/**
 * Manually capture an exception
 *
 * @example
 * ```ts
 * try {
 *   // risky operation
 * } catch (error) {
 *   captureException(error, { tags: { component: 'PaymentForm' } })
 * }
 * ```
 */
export function captureException(
  error: Error,
  context?: any
) {
  if (typeof Sentry !== 'undefined' && Sentry.captureException) {
    Sentry.captureException(error, context)
  } else {
    console.error('Error captured (Sentry not initialized):', error, context)
  }
}

/**
 * Manually capture a message
 *
 * @example
 * ```ts
 * captureMessage('User attempted invalid action', 'warning')
 * ```
 */
export function captureMessage(
  message: string,
  level?: Sentry.SeverityLevel
) {
  if (typeof Sentry !== 'undefined' && Sentry.captureMessage) {
    Sentry.captureMessage(message, level)
  } else {
    console.log(`[${level || 'info'}] ${message}`)
  }
}

/**
 * Add breadcrumb for debugging context
 *
 * @example
 * ```ts
 * addBreadcrumb({
 *   category: 'payment',
 *   message: 'Processing Stripe payment',
 *   level: 'info',
 *   data: { amount: 99.99, currency: 'USD' }
 * })
 * ```
 */
export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
  if (typeof Sentry !== 'undefined' && Sentry.addBreadcrumb) {
    Sentry.addBreadcrumb(breadcrumb)
  } else {
    console.log('Breadcrumb:', breadcrumb)
  }
}

/**
 * Set user context
 *
 * @example
 * ```ts
 * setUser({ id: '123', email: 'user@example.com' })
 * ```
 */
export function setUser(user: Sentry.User | null) {
  if (typeof Sentry !== 'undefined' && Sentry.setUser) {
    Sentry.setUser(user)
  } else {
    console.log('User context:', user)
  }
}

/**
 * Set custom context
 *
 * @example
 * ```ts
 * setContext('payment', {
 *   method: 'stripe',
 *   amount: 99.99,
 *   currency: 'USD'
 * })
 * ```
 */
export function setContext(key: string, context: Record<string, any> | null) {
  if (typeof Sentry !== 'undefined' && Sentry.setContext) {
    Sentry.setContext(key, context)
  } else {
    console.log(`Context ${key}:`, context)
  }
}

/**
 * Set custom tag
 *
 * @example
 * ```ts
 * setTag('feature_flag', 'new_checkout_enabled')
 * ```
 */
export function setTag(key: string, value: string | number | boolean) {
  if (typeof Sentry !== 'undefined' && Sentry.setTag) {
    Sentry.setTag(key, value)
  } else {
    console.log(`Tag ${key}:`, value)
  }
}

/**
 * Wrap an async function to automatically capture errors
 *
 * @example
 * ```ts
 * const safeAsyncFunction = withSentry(async () => {
 *   // your async code
 * })
 * ```
 */
export function withSentry<T extends (...args: any[]) => Promise<any>>(
  fn: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      captureException(error as Error)
      throw error
    }
  }) as T
}

/**
 * Create a Sentry transaction for performance monitoring
 *
 * @example
 * ```ts
 * const transaction = startTransaction({
 *   name: 'Checkout Process',
 *   op: 'checkout'
 * })
 *
 * try {
 *   // your code
 *   transaction.finish()
 * } catch (error) {
 *   transaction.setStatus('internal_error')
 *   transaction.finish()
 *   throw error
 * }
 * ```
 */
export function startTransaction(
  context: { name: string; op: string }
): any | null {
  if (typeof Sentry !== 'undefined' && Sentry.startSpan) {
    return Sentry.startSpan(context, (span) => span)
  } else {
    console.log('Transaction started:', context)
    return null
  }
}

/**
 * Export Sentry for direct access to advanced features
 */
export { Sentry }

// Auto-initialize if running in browser
if (typeof window !== 'undefined') {
  initSentry()
}
