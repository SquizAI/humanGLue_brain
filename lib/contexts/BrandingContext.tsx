'use client'

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react'

export interface BrandingColors {
  primary: string
  secondary: string
  accent?: string
}

export interface BrandingLogo {
  url: string
  favicon_url?: string
  width?: number
  height?: number
}

export interface BrandingEmail {
  sender_name: string
  sender_email: string
  support_email: string
  footer_text: string
}

export interface BrandingSocial {
  website?: string
  twitter?: string
  linkedin?: string
}

export interface OrgBranding {
  company_name: string
  tagline?: string
  colors: BrandingColors
  logo: BrandingLogo
  email: BrandingEmail
  social?: BrandingSocial
}

export interface BrandingContextType {
  // Branding Data
  branding: OrgBranding | null

  // State
  isLoading: boolean
  error: string | null

  // Actions
  loadBranding: (organizationId: string) => Promise<void>
  refreshBranding: () => Promise<void>
  clearBranding: () => void
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined)

// Default HumanGlue branding
const DEFAULT_BRANDING: OrgBranding = {
  company_name: 'HumanGlue',
  tagline: 'Guiding Fortune 1000 companies of tomorrow, today',
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#10b981'
  },
  logo: {
    url: '/HumnaGlue_logo_white_blue.png',
    favicon_url: '/favicon.ico',
    width: 200,
    height: 50
  },
  email: {
    sender_name: 'HumanGlue',
    sender_email: 'onboarding@humanglue.ai',
    support_email: 'support@humanglue.ai',
    footer_text: `© ${new Date().getFullYear()} HumanGlue. All rights reserved.`
  },
  social: {
    website: 'https://humanglue.ai',
    twitter: '@humanglueai',
    linkedin: 'company/humanglue'
  }
}

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<OrgBranding | null>(DEFAULT_BRANDING)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null)

  /**
   * Load branding for a specific organization
   */
  const loadBranding = useCallback(async (organizationId: string) => {
    if (!organizationId) {
      setBranding(DEFAULT_BRANDING)
      return
    }

    // Don't reload if already loaded for this org
    if (currentOrgId === organizationId && branding && !error) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/organizations/${organizationId}/branding`)

      if (!response.ok) {
        if (response.status === 404 || response.status === 403) {
          // Organization not found or no access - use defaults
          setBranding(DEFAULT_BRANDING)
          setCurrentOrgId(organizationId)
          return
        }
        throw new Error('Failed to load branding')
      }

      const result = await response.json()

      if (result.success && result.data) {
        setBranding(result.data)
        setCurrentOrgId(organizationId)
      } else {
        // API returned success but no data - use defaults
        setBranding(DEFAULT_BRANDING)
        setCurrentOrgId(organizationId)
      }
    } catch (err) {
      console.error('Error loading branding:', err)
      setError(err instanceof Error ? err.message : 'Failed to load branding')
      // Fall back to default branding on error
      setBranding(DEFAULT_BRANDING)
      setCurrentOrgId(organizationId)
    } finally {
      setIsLoading(false)
    }
  }, [currentOrgId, branding, error])

  /**
   * Refresh branding for the current organization
   */
  const refreshBranding = useCallback(async () => {
    if (currentOrgId) {
      // Force reload by clearing current org
      setCurrentOrgId(null)
      await loadBranding(currentOrgId)
    }
  }, [currentOrgId, loadBranding])

  /**
   * Clear branding and reset to defaults
   */
  const clearBranding = useCallback(() => {
    setBranding(DEFAULT_BRANDING)
    setCurrentOrgId(null)
    setError(null)
  }, [])

  return (
    <BrandingContext.Provider
      value={{
        branding,
        isLoading,
        error,
        loadBranding,
        refreshBranding,
        clearBranding
      }}
    >
      {children}
    </BrandingContext.Provider>
  )
}

/**
 * Hook to access branding context
 */
export function useBranding() {
  const context = useContext(BrandingContext)
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider')
  }
  return context
}

/**
 * Hook to get branding with automatic loading for an organization
 * This is a convenience hook that automatically loads branding when the org ID changes
 */
export function useOrgBranding(organizationId: string | null | undefined) {
  const { branding, isLoading, error, loadBranding } = useBranding()

  useEffect(() => {
    if (organizationId) {
      loadBranding(organizationId)
    }
  }, [organizationId, loadBranding])

  return { branding, isLoading, error }
}
