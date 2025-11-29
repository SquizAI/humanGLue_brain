'use client'

import { useEffect } from 'react'
import { useChat } from '@/lib/contexts/ChatContext'
import { useBranding } from '@/lib/contexts/BrandingContext'
import { useBrandingStyles } from '@/lib/hooks/useBrandingStyles'

/**
 * BrandingInjector Component
 *
 * Automatically loads organization branding based on logged-in user
 * and injects branding CSS variables into the document
 *
 * Place this component at the root of your application (in Providers)
 * to enable automatic white-label theming
 *
 * Features:
 * - Auto-loads branding when user logs in
 * - Injects CSS variables for dynamic theming
 * - Updates favicon dynamically
 * - Handles branding refresh on organization change
 */
export function BrandingInjector() {
  const { userData, authLoading } = useChat()
  const { branding, loadBranding } = useBranding()

  // Inject CSS variables
  useBrandingStyles()

  // Auto-load branding when user's organization is known
  useEffect(() => {
    if (!authLoading && userData?.organizationId) {
      loadBranding(userData.organizationId)
    }
  }, [authLoading, userData?.organizationId, loadBranding])

  // Update favicon dynamically
  useEffect(() => {
    if (!branding?.logo?.favicon_url) return

    // Update all favicon links
    const faviconLinks = document.querySelectorAll("link[rel*='icon']")
    faviconLinks.forEach((link) => {
      ;(link as HTMLLinkElement).href = branding.logo.favicon_url!
    })

    console.log('[BrandingInjector] Updated favicon:', branding.logo.favicon_url)
  }, [branding?.logo?.favicon_url])

  // Update document title with company name
  useEffect(() => {
    if (!branding?.company_name) return

    // Only update if title still has "Human Glue"
    if (document.title.includes('Human Glue')) {
      document.title = document.title.replace('Human Glue', branding.company_name)
    }

    console.log('[BrandingInjector] Updated document title with:', branding.company_name)
  }, [branding?.company_name])

  // This component doesn't render anything visible
  return null
}
