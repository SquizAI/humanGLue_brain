/**
 * ============================================================================
 * Sentry Server-Side Configuration
 * ============================================================================
 *
 * This file configures Sentry for server-side error tracking in Next.js
 * server components, API routes, and server-side rendering.
 * It is automatically imported by Next.js.
 *
 * ============================================================================
 */

import * as Sentry from '@sentry/nextjs'

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  const environment = process.env.SENTRY_ENVIRONMENT || process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || 'development'
  const isProduction = process.env.NODE_ENV === 'production'
  const isDevelopment = process.env.NODE_ENV === 'development'
  const enableInDev = process.env.SENTRY_ENABLE_IN_DEV === 'true'

  // Skip initialization in development unless explicitly enabled
  if (isDevelopment && !enableInDev) {
    console.log('Sentry server disabled in development')
  } else {
    Sentry.init({
      dsn,
      environment,

      // Performance Monitoring
      tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),

      // Debug mode
      debug: !isProduction && enableInDev,

      // Release tracking
      release: process.env.VERCEL_GIT_COMMIT_SHA || process.env.COMMIT_REF,

      // Filter out known noise
      ignoreErrors: [
        // Network errors
        'ECONNRESET',
        'ENOTFOUND',
        'ETIMEDOUT',
        'NetworkError',
        // Intentional aborts
        'AbortError',
        'The operation was aborted',
      ],

      // Breadcrumb filtering
      beforeBreadcrumb(breadcrumb, hint) {
        // Filter console logs in production
        if (isProduction && breadcrumb.category === 'console') {
          return null
        }
        return breadcrumb
      },

      // Event filtering
      beforeSend(event, hint) {
        // Add server-side context
        event.tags = {
          ...event.tags,
          runtime: 'node',
        }
        return event
      },

      // Integration configuration
      integrations: [
        // HTTP integration for tracing
        Sentry.httpIntegration(),
      ],
    })

    console.log(`Sentry server initialized in ${environment} environment`)
  }
} else {
  console.warn('Sentry DSN not configured - server-side error tracking disabled')
}
