'use client'

import { useEffect } from 'react'
import { useBranding } from '@/lib/contexts/BrandingContext'

/**
 * Hook to inject organization branding as CSS variables
 * This allows dynamic theming throughout the application
 *
 * CSS Variables set:
 * - --color-primary: Primary brand color
 * - --color-secondary: Secondary brand color
 * - --color-accent: Accent/highlight color
 * - --color-primary-rgb: RGB values for primary color (for transparency)
 * - --color-secondary-rgb: RGB values for secondary color
 *
 * Usage:
 * ```tsx
 * import { useBrandingStyles } from '@/lib/hooks/useBrandingStyles'
 *
 * export default function Layout() {
 *   useBrandingStyles() // Call once at root layout
 *   return <div>...</div>
 * }
 * ```
 *
 * Then in your CSS/Tailwind:
 * ```css
 * .button {
 *   background-color: var(--color-primary);
 * }
 *
 * .card {
 *   background-color: rgba(var(--color-primary-rgb), 0.1);
 * }
 * ```
 */
export function useBrandingStyles() {
  const { branding } = useBranding()

  useEffect(() => {
    if (!branding) return

    const root = document.documentElement

    // Set color CSS variables
    root.style.setProperty('--color-primary', branding.colors.primary)
    root.style.setProperty('--color-secondary', branding.colors.secondary)
    root.style.setProperty('--color-accent', branding.colors.accent || '#10b981')

    // Convert hex to RGB for use with opacity
    const hexToRgb = (hex: string): string => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : '59, 130, 246' // default blue
    }

    root.style.setProperty('--color-primary-rgb', hexToRgb(branding.colors.primary))
    root.style.setProperty('--color-secondary-rgb', hexToRgb(branding.colors.secondary))
    root.style.setProperty('--color-accent-rgb', hexToRgb(branding.colors.accent || '#10b981'))

    // Set company name for use in title templates
    root.setAttribute('data-company-name', branding.company_name)

    console.log('[useBrandingStyles] Applied branding CSS variables:', {
      primary: branding.colors.primary,
      secondary: branding.colors.secondary,
      accent: branding.colors.accent,
      company: branding.company_name
    })
  }, [branding])
}
