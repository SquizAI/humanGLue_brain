/**
 * ============================================================================
 * Sentry Edge Runtime Configuration
 * ============================================================================
 *
 * This file configures Sentry for Edge runtime functions (middleware, edge API routes).
 * It is automatically imported by Next.js for edge functions.
 *
 * ============================================================================
 */

import * as Sentry from '@sentry/nextjs'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN

if (dsn) {
  const environment = process.env.SENTRY_ENVIRONMENT || process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || 'development'
  const isProduction = process.env.NODE_ENV === 'production'
  const isDevelopment = process.env.NODE_ENV === 'development'
  const enableInDev = process.env.SENTRY_ENABLE_IN_DEV === 'true'

  // Skip initialization in development unless explicitly enabled
  if (isDevelopment && !enableInDev) {
    console.log('Sentry edge disabled in development')
  } else {
    Sentry.init({
      dsn,
      environment,

      // Performance Monitoring
      tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),

      // Debug mode
      debug: !isProduction && enableInDev,

      // Release tracking
      release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || process.env.COMMIT_REF,

      // Filter out known noise
      ignoreErrors: [
        'NetworkError',
        'AbortError',
        'The operation was aborted',
      ],

      // Event filtering
      beforeSend(event, hint) {
        // Add edge runtime context
        event.tags = {
          ...event.tags,
          runtime: 'edge',
        }
        return event
      },
    })

    console.log(`Sentry edge initialized in ${environment} environment`)
  }
} else {
  console.warn('Sentry DSN not configured - edge runtime error tracking disabled')
}
