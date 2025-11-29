'use client'

import { useEffect, useState } from 'react'
import { useChat } from '@/lib/contexts/ChatContext'
import { useBranding } from '@/lib/contexts/BrandingContext'
import { useBrandingStyles } from '@/lib/hooks/useBrandingStyles'

/**
 * BrandingInjector Component
 *
 * Automatically loads organization branding based on:
 * 1. Custom domain (if accessing via org's custom domain)
 * 2. Logged-in user's organization
 *
 * Place this component at the root of your application (in Providers)
 * to enable automatic white-label theming
 *
 * Features:
 * - Auto-loads branding from custom domain (Phase 5)
 * - Auto-loads branding when user logs in
 * - Injects CSS variables for dynamic theming
 * - Updates favicon dynamically
 * - Handles branding refresh on organization change
 */
export function BrandingInjector() {
  const { userData, authLoading } = useChat()
  const { branding, loadBranding } = useBranding()
  const [domainOrgChecked, setDomainOrgChecked] = useState(false)

  // Inject CSS variables
  useBrandingStyles()

  // Check for custom domain organization (Phase 5)
  useEffect(() => {
    async function checkDomainOrg() {
      try {
        const response = await fetch('/api/domain-org')
        const data = await response.json()

        if (data.organizationId) {
          console.log('[BrandingInjector] Custom domain detected:', data.domain, '-> Loading branding for org:', data.organizationId)
          loadBranding(data.organizationId)
        }
      } catch (error) {
        console.error('[BrandingInjector] Failed to check domain org:', error)
      } finally {
        setDomainOrgChecked(true)
      }
    }

    checkDomainOrg()
  }, [loadBranding])

  // Auto-load branding when user's organization is known
  // Only run if custom domain check is done and no branding loaded yet
  useEffect(() => {
    if (!authLoading && userData?.organizationId && domainOrgChecked && !branding) {
      console.log('[BrandingInjector] Loading branding for user org:', userData.organizationId)
      loadBranding(userData.organizationId)
    }
  }, [authLoading, userData?.organizationId, loadBranding, domainOrgChecked, branding])

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
