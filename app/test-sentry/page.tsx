'use client'

import { useState } from 'react'
import { captureException, captureMessage, addBreadcrumb } from '@/lib/monitoring/sentry'
import { AlertCircle, Bug, MessageSquare, Send } from 'lucide-react'

/**
 * Test page for Sentry error tracking
 *
 * This page provides controls to test various Sentry features.
 * Remove this page before production deployment.
 */
export default function TestSentryPage() {
  const [status, setStatus] = useState<string>('')

  const testUncaughtError = () => {
    setStatus('Throwing uncaught error...')
    // This will be caught by ErrorBoundary
    throw new Error('Test Uncaught Error - This is a test from the Sentry test page')
  }

  const testCaughtError = () => {
    setStatus('Testing caught error...')
    try {
      throw new Error('Test Caught Error - This is a test error that was caught')
    } catch (error) {
      captureException(error as Error, {
        tags: { test: 'true', component: 'SentryTestPage' },
        extra: { testType: 'caught-error' },
      })
      setStatus('Error captured and sent to Sentry!')
    }
  }

  const testMessage = () => {
    setStatus('Sending test message...')
    captureMessage('Test message from Sentry test page', 'info')
    setStatus('Message sent to Sentry!')
  }

  const testBreadcrumb = () => {
    setStatus('Adding breadcrumb...')
    addBreadcrumb({
      category: 'test',
      message: 'User clicked test breadcrumb button',
      level: 'info',
      data: { timestamp: new Date().toISOString() },
    })
    setStatus('Breadcrumb added! (Check in next error)')
  }

  const testAsyncError = async () => {
    setStatus('Testing async error...')
    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Test Async Error - This is an async test error'))
        }, 100)
      })
    } catch (error) {
      captureException(error as Error, {
        tags: { test: 'true', type: 'async' },
      })
      setStatus('Async error captured!')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <h3 className="text-yellow-400 font-semibold mb-1">
                Development Only - Remove Before Production
              </h3>
              <p className="text-yellow-200/80 text-sm">
                This page is for testing Sentry integration. Delete this file before deploying to production.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Sentry Error Tracking Test
          </h1>
          <p className="text-gray-400 mb-8">
            Use these buttons to test different Sentry features. Check your Sentry dashboard to verify errors are being captured.
          </p>

          {status && (
            <div className="mb-6 p-4 bg-blue-900/20 border border-blue-600 rounded-lg">
              <p className="text-blue-300 text-sm">{status}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={testCaughtError}
                className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Bug className="w-5 h-5" />
                Test Caught Error
              </button>

              <button
                onClick={testMessage}
                className="px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                Test Message
              </button>

              <button
                onClick={testBreadcrumb}
                className="px-6 py-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Test Breadcrumb
              </button>

              <button
                onClick={testAsyncError}
                className="px-6 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Bug className="w-5 h-5" />
                Test Async Error
              </button>
            </div>

            <button
              onClick={testUncaughtError}
              className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-5 h-5" />
              Test Uncaught Error (Will show error boundary)
            </button>
          </div>

          <div className="mt-8 p-6 bg-gray-900/50 rounded-lg">
            <h2 className="text-lg font-semibold text-white mb-3">
              Test Instructions
            </h2>
            <ol className="space-y-2 text-gray-300 text-sm">
              <li className="flex gap-2">
                <span className="text-blue-400">1.</span>
                <span>Click each button to test different Sentry features</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400">2.</span>
                <span>Check your browser console for confirmation messages</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400">3.</span>
                <span>Go to your Sentry dashboard to verify errors are appearing</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400">4.</span>
                <span>Test the "Uncaught Error" button to see the error boundary in action</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-400">5.</span>
                <span className="font-semibold">Delete this file before production deployment</span>
              </li>
            </ol>
          </div>

          <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
            <h3 className="text-sm font-semibold text-white mb-2">
              Environment Status
            </h3>
            <div className="space-y-1 text-xs text-gray-400">
              <p>
                DSN Configured:{' '}
                <span className={process.env.NEXT_PUBLIC_SENTRY_DSN ? 'text-green-400' : 'text-red-400'}>
                  {process.env.NEXT_PUBLIC_SENTRY_DSN ? 'Yes' : 'No'}
                </span>
              </p>
              <p>
                Environment:{' '}
                <span className="text-blue-400">
                  {process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
