'use client'

import { useState, useEffect, useRef } from 'react'
import Vapi from '@vapi-ai/web'

interface UseVapiOptions {
  publicKey: string
  onCallStart?: () => void
  onCallEnd?: () => void
  onMessage?: (message: any) => void
  onError?: (error: any) => void
}

export function useVapi(publicKey: string, options?: Partial<UseVapiOptions>) {
  const [vapi, setVapi] = useState<Vapi | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const vapiRef = useRef<Vapi | null>(null)

  useEffect(() => {
    try {
      // Initialize Vapi instance
      const vapiInstance = new Vapi(publicKey)
      vapiRef.current = vapiInstance
      setVapi(vapiInstance)
      setIsLoading(false)

      // Set up event listeners
      if (options?.onCallStart) {
        vapiInstance.on('call-start', options.onCallStart)
      }

      if (options?.onCallEnd) {
        vapiInstance.on('call-end', options.onCallEnd)
      }

      if (options?.onMessage) {
        vapiInstance.on('message', options.onMessage)
      }

      if (options?.onError) {
        vapiInstance.on('error', options.onError)
      }

      // Default error handler
      vapiInstance.on('error', (err) => {
        console.error('Vapi error:', err)
        setError(err.message || 'An error occurred with Vapi')
      })

    } catch (err) {
      console.error('Failed to initialize Vapi:', err)
      setError('Failed to initialize voice assistant')
      setIsLoading(false)
    }

    // Cleanup function
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop()
        vapiRef.current = null
      }
    }
  }, [publicKey])

  return {
    vapi,
    isLoading,
    error
  }
}