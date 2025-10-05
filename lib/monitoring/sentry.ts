/**
 * ============================================================================
 * Sentry Error Tracking Configuration
 * ============================================================================
 *
 * This module configures Sentry for error tracking and performance monitoring
 * across the HumanGlue platform.
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

// import * as Sentry from '@sentry/nextjs'
// NOTE: Sentry is currently not installed. These are stub implementations.
// To enable Sentry, install @sentry/nextjs and uncomment the import above.

/**
 * Initialize Sentry with configuration
 *
 * This should be called once at application startup
 */
export function initSentry() {
  // Stub implementation - Sentry not installed
  console.log('Sentry not configured - error tracking disabled')
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
  // Stub implementation - Sentry not installed
  console.error('Error captured:', error, context)
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
  level?: string
) {
  // Stub implementation - Sentry not installed
  console.log(`[${level || 'info'}] ${message}`)
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
export function addBreadcrumb(breadcrumb: any) {
  // Stub implementation - Sentry not installed
  console.log('Breadcrumb:', breadcrumb)
}

/**
 * Set user context
 *
 * @example
 * ```ts
 * setUser({ id: '123', email: 'user@example.com' })
 * ```
 */
export function setUser(user: any) {
  // Stub implementation - Sentry not installed
  console.log('User context:', user)
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
export function setContext(key: string, context: Record<string, any>) {
  // Stub implementation - Sentry not installed
  console.log(`Context ${key}:`, context)
}

/**
 * Set custom tag
 *
 * @example
 * ```ts
 * setTag('feature_flag', 'new_checkout_enabled')
 * ```
 */
export function setTag(key: string, value: string) {
  // Stub implementation - Sentry not installed
  console.log(`Tag ${key}:`, value)
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
  context: any
): any {
  // Stub implementation - Sentry not installed
  console.log('Transaction started:', context)
  return {
    finish: () => console.log('Transaction finished'),
    setStatus: (status: string) => console.log('Transaction status:', status)
  }
}

// Auto-initialize if running in browser
if (typeof window !== 'undefined') {
  initSentry()
}
