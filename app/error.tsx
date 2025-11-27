'use client'

import React, { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

/**
 * Global Error Handler for Next.js App Router
 *
 * This component catches errors in the app directory and reports them to Sentry.
 * It's automatically used by Next.js when an error occurs.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [eventId, setEventId] = React.useState<string | undefined>()

  useEffect(() => {
    // Report error to Sentry
    const id = Sentry.captureException(error, {
      tags: {
        digest: error.digest,
      },
    })
    setEventId(id)

    console.error('Global error handler caught:', error)
  }, [error])

  const handleFeedback = () => {
    if (eventId) {
      Sentry.showReportDialog({ eventId })
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">
            Something went wrong
          </h1>

          <p className="text-gray-400 mb-6">
            We encountered an unexpected error. Our team has been automatically notified.
          </p>

          {eventId && (
            <p className="text-sm text-gray-500 mb-6">
              Error ID: <code className="text-gray-400 font-mono text-xs">{eventId}</code>
            </p>
          )}

          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-gray-900/50 rounded-lg text-left">
              <p className="text-xs text-gray-500 mb-2">Error details (dev only):</p>
              <p className="text-sm text-red-400 font-mono break-all">
                {error.message || error.toString()}
              </p>
              {error.digest && (
                <p className="text-xs text-gray-500 mt-2">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>

            <Link
              href="/"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>

            {eventId && (
              <button
                onClick={handleFeedback}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Report Feedback
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
