'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary for the Chat System
 * Prevents chat crashes from taking down the entire page
 */
export class ChatErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console and analytics
    console.error('[ChatErrorBoundary] Error caught:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    })

    // Track error in analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: `Chat Error: ${error.message}`,
        fatal: false
      })
    }
  }

  handleReset = () => {
    // Clear chat data and reset error state
    if (typeof window !== 'undefined') {
      localStorage.removeItem('humanglue_chat_progress')
      localStorage.removeItem('humanglue_engagement_events')
    }

    this.setState({ hasError: false, error: null })

    // Reload page to fully reset
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-cyan-900/20 to-gray-900 p-4">
          <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-2xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">
              Oops! Something went wrong
            </h2>

            <p className="text-gray-300 mb-6">
              The chat encountered an unexpected error. Don't worry - your progress has been saved and we can start fresh.
            </p>

            {this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300 mb-2">
                  Technical Details
                </summary>
                <pre className="text-xs text-gray-500 bg-gray-900/50 p-3 rounded overflow-auto max-h-40">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            <button
              onClick={this.handleReset}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Restart Chat
            </button>

            <p className="text-xs text-gray-500 mt-4">
              If this problem persists, please contact support
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
