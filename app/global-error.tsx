'use client'

import { useEffect } from 'react'

// Prevent static generation of error page
export const dynamic = 'error'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console in development
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Error - Human Glue</title>
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          color: 'white',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '20px'
        }}>
          <div style={{ maxWidth: '600px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '24px' }}>⚠️</div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', margin: '0 0 16px 0' }}>
              Something went wrong!
            </h2>
            <p style={{ color: '#94a3b8', marginBottom: '24px', lineHeight: '1.6' }}>
              {error.message || 'An unexpected error occurred. Please try again.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => reset()}
                style={{
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                Try again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  backgroundColor: '#1e293b',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                Go home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
