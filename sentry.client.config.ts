/**
 * ============================================================================
 * Sentry Client-Side Configuration
 * ============================================================================
 *
 * This file configures Sentry for client-side error tracking in the browser.
 * It is automatically imported by Next.js.
 *
 * ============================================================================
 */

import * as Sentry from '@sentry/nextjs'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  const environment = process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || 'development'
  const isProduction = process.env.NODE_ENV === 'production'
  const isDevelopment = process.env.NODE_ENV === 'development'
  const enableInDev = process.env.SENTRY_ENABLE_IN_DEV === 'true'

  // Skip initialization in development unless explicitly enabled
  if (isDevelopment && !enableInDev) {
    console.log('Sentry client disabled in development')
  } else {
    Sentry.init({
      dsn,
      environment,

      // Performance Monitoring
      tracesSampleRate: parseFloat(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || '0.1'),

      // Session Replay
      replaysSessionSampleRate: parseFloat(process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE || '0.1'),
      replaysOnErrorSampleRate: parseFloat(process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE || '1.0'),

      // Debug mode
      debug: !isProduction && enableInDev,

      // Release tracking
      release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || process.env.COMMIT_REF,

      // Filter out known noise
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        'chrome-extension://',
        'moz-extension://',
        'safari-extension://',
        // Network errors
        'NetworkError',
        'Failed to fetch',
        'Load failed',
        'Network request failed',
        // Intentional aborts
        'AbortError',
        'The operation was aborted',
        'cancelled',
        // ResizeObserver errors (common browser noise)
        'ResizeObserver loop',
        // Common React errors that are usually caught
        'Minified React error',
      ],

      // Breadcrumb filtering
      beforeBreadcrumb(breadcrumb, hint) {
        // Filter console logs
        if (breadcrumb.category === 'console') {
          return null
        }
        return breadcrumb
      },

      // Event filtering
      beforeSend(event, hint) {
        // Filter out errors from browser extensions
        if (event.request?.url?.includes('chrome-extension://') ||
            event.request?.url?.includes('moz-extension://')) {
          return null
        }
        return event
      },

      // Integration configuration
      integrations: [
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
          maskAllInputs: true, // Protect sensitive input data
        }),
        Sentry.browserTracingIntegration(),
      ],
    })

    console.log(`Sentry client initialized in ${environment} environment`)
  }
} else {
  console.warn('Sentry DSN not configured - client-side error tracking disabled')
}
