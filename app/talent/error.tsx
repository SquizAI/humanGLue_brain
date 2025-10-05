'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

export default function TalentError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">
          Something went wrong
        </h2>
        <p className="text-gray-400 mb-8">
          We couldn't load the talent marketplace. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
