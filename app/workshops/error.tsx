'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/utils/cn'
import { typography, spacing } from '@/lib/design-system'

export default function WorkshopsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Workshops error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className={cn(spacing.container.narrow, 'text-center')}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Error Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
            className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6"
          >
            <AlertCircle className="w-10 h-10 text-red-400" />
          </motion.div>

          {/* Error Message */}
          <h1 className={cn(typography.heading.h2, 'text-white mb-4')}>
            Something went wrong
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            We encountered an error while loading the workshops.
          </p>

          {/* Error Details (in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-left mb-8">
              <p className="text-sm text-red-300 font-mono break-all">
                {error.message}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-800 text-white font-semibold hover:bg-gray-700 transition-all"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
