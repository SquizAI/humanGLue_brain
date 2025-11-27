/**
 * Data Enrichment Hook
 *
 * Attempts to enrich user data based on email domain
 * Uses the /api/enrich-company endpoint to fetch company information
 */

import { useState, useCallback } from 'react'

export interface EnrichedData {
  company: string | null
  industry: string | null
  size: string | null
  found: boolean
  source?: string
}

export interface UseDataEnrichmentReturn {
  enrich: (email: string) => Promise<EnrichedData | null>
  loading: boolean
  error: string | null
  enrichedData: EnrichedData | null
  clearEnrichment: () => void
}

/**
 * Hook for enriching user data based on email domain
 *
 * @example
 * const { enrich, loading, error, enrichedData } = useDataEnrichment()
 *
 * // Attempt enrichment
 * const result = await enrich('john@example.com')
 * if (result?.found) {
 *   console.log('Found company:', result.company)
 * }
 */
export function useDataEnrichment(): UseDataEnrichmentReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enrichedData, setEnrichedData] = useState<EnrichedData | null>(null)

  /**
   * Extract domain from email address
   */
  const extractDomain = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/
    const match = email.match(emailRegex)

    if (!match || !match[1]) {
      return null
    }

    return match[1].toLowerCase()
  }

  /**
   * Attempt to enrich data based on email
   */
  const enrich = useCallback(async (email: string): Promise<EnrichedData | null> => {
    // Reset state
    setError(null)
    setLoading(true)

    try {
      // Extract domain from email
      const domain = extractDomain(email)

      if (!domain) {
        setError('Invalid email format')
        setLoading(false)
        return null
      }

      // Skip enrichment for common free email providers
      const freeProviders = [
        'gmail.com',
        'yahoo.com',
        'hotmail.com',
        'outlook.com',
        'icloud.com',
        'mail.com',
        'aol.com',
        'protonmail.com',
        'zoho.com',
      ]

      if (freeProviders.includes(domain)) {
        console.log('[Enrichment] Skipping free email provider:', domain)
        setLoading(false)
        return {
          company: null,
          industry: null,
          size: null,
          found: false,
        }
      }

      // Call enrichment API
      const response = await fetch(`/.netlify/functions/enrich-company?domain=${encodeURIComponent(domain)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429) {
          throw new Error('Too many requests. Please try again in a moment.')
        }

        throw new Error('Failed to enrich company data')
      }

      const data: EnrichedData = await response.json()

      // Save enriched data
      setEnrichedData(data)
      setLoading(false)

      console.log('[Enrichment] Success:', data)

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enrich data'
      console.error('[Enrichment] Error:', errorMessage)
      setError(errorMessage)
      setLoading(false)
      return null
    }
  }, [])

  /**
   * Clear enrichment state
   */
  const clearEnrichment = useCallback(() => {
    setEnrichedData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    enrich,
    loading,
    error,
    enrichedData,
    clearEnrichment,
  }
}

/**
 * Helper function to check if a domain is a business domain
 */
export function isBusinessDomain(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return false

  const freeProviders = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'icloud.com',
    'mail.com',
    'aol.com',
    'protonmail.com',
    'zoho.com',
  ]

  return !freeProviders.includes(domain)
}
