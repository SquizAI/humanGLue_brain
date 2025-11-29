import { createClient } from '@/lib/supabase/server'

/**
 * Organization Branding Configuration
 * Stored in organizations.settings.branding JSONB field
 */
export interface OrgBranding {
  company_name: string
  tagline?: string

  colors: {
    primary: string
    secondary: string
    accent?: string
  }

  logo: {
    url: string
    favicon_url?: string
    width?: number
    height?: number
  }

  email: {
    sender_name: string
    sender_email: string
    support_email: string
    footer_text: string
  }

  social?: {
    website?: string
    twitter?: string
    linkedin?: string
  }

  custom_domain?: {
    domain?: string
    is_verified?: boolean
    ssl_enabled?: boolean
  }
}

/**
 * Default HumanGlue branding configuration
 * Used as fallback when organization hasn't configured custom branding
 */
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
    favicon_url: '/HG_icon.png',
    width: 200,
    height: 50
  },

  email: {
    sender_name: 'HumanGlue',
    sender_email: 'onboarding@humanglue.ai',
    support_email: 'support@humanglue.ai',
    footer_text: '© 2025 HumanGlue. All rights reserved.'
  },

  social: {
    website: 'https://humanglue.ai',
    twitter: '@humanglue',
    linkedin: 'company/humanglue'
  }
}

/**
 * Get organization branding configuration
 * Returns custom branding if configured, otherwise returns HumanGlue defaults
 *
 * @param orgId - UUID of the organization
 * @returns Organization branding configuration
 */
export async function getOrgBranding(orgId: string): Promise<OrgBranding> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('organizations')
      .select('settings, logo_url')
      .eq('id', orgId)
      .single()

    if (error) {
      console.warn(`Failed to fetch branding for org ${orgId}:`, error.message)
      return DEFAULT_BRANDING
    }

    // No custom branding configured
    if (!data?.settings?.branding) {
      return DEFAULT_BRANDING
    }

    const customBranding = data.settings.branding as Partial<OrgBranding>

    // Merge custom branding with defaults (deep merge for nested objects)
    return {
      company_name: customBranding.company_name || DEFAULT_BRANDING.company_name,
      tagline: customBranding.tagline || DEFAULT_BRANDING.tagline,

      colors: {
        ...DEFAULT_BRANDING.colors,
        ...customBranding.colors
      },

      logo: {
        ...DEFAULT_BRANDING.logo,
        ...customBranding.logo,
        // Allow logo_url column to override settings
        url: data.logo_url || customBranding.logo?.url || DEFAULT_BRANDING.logo.url
      },

      email: {
        ...DEFAULT_BRANDING.email,
        ...customBranding.email
      },

      social: {
        ...DEFAULT_BRANDING.social,
        ...customBranding.social
      },

      custom_domain: customBranding.custom_domain
    }
  } catch (error) {
    console.error('Error fetching organization branding:', error)
    return DEFAULT_BRANDING
  }
}

/**
 * Update organization branding configuration
 * Only org_admin and admin roles can update branding
 *
 * @param orgId - UUID of the organization
 * @param branding - Partial branding configuration to update
 * @throws Error if update fails or user lacks permissions
 */
export async function updateOrgBranding(
  orgId: string,
  branding: Partial<OrgBranding>
): Promise<void> {
  const supabase = await createClient()

  // Get current branding
  const currentBranding = await getOrgBranding(orgId)

  // Deep merge with current branding
  const updatedBranding: OrgBranding = {
    company_name: branding.company_name || currentBranding.company_name,
    tagline: branding.tagline ?? currentBranding.tagline,

    colors: {
      ...currentBranding.colors,
      ...branding.colors
    },

    logo: {
      ...currentBranding.logo,
      ...branding.logo
    },

    email: {
      ...currentBranding.email,
      ...branding.email
    },

    social: {
      ...currentBranding.social,
      ...branding.social
    },

    custom_domain: {
      ...currentBranding.custom_domain,
      ...branding.custom_domain
    }
  }

  // Update organization settings
  // Note: RLS policies enforce that only org_admin/admin can update
  const { error } = await supabase
    .from('organizations')
    .update({
      settings: {
        branding: updatedBranding
      },
      // Also update logo_url column for backward compatibility
      logo_url: updatedBranding.logo.url
    })
    .eq('id', orgId)

  if (error) {
    throw new Error(`Failed to update branding: ${error.message}`)
  }
}

/**
 * Validate branding configuration
 * Ensures required fields are present and values are valid
 *
 * @param branding - Branding configuration to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateBranding(branding: Partial<OrgBranding>): string[] {
  const errors: string[] = []

  // Validate email addresses
  if (branding.email?.sender_email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(branding.email.sender_email)) {
      errors.push('Invalid sender email address')
    }
  }

  if (branding.email?.support_email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(branding.email.support_email)) {
      errors.push('Invalid support email address')
    }
  }

  // Validate color hex codes
  const hexColorRegex = /^#[0-9A-Fa-f]{6}$/

  if (branding.colors?.primary && !hexColorRegex.test(branding.colors.primary)) {
    errors.push('Invalid primary color format (must be hex code like #3b82f6)')
  }

  if (branding.colors?.secondary && !hexColorRegex.test(branding.colors.secondary)) {
    errors.push('Invalid secondary color format (must be hex code like #8b5cf6)')
  }

  if (branding.colors?.accent && !hexColorRegex.test(branding.colors.accent)) {
    errors.push('Invalid accent color format')
  }

  // Validate URLs
  if (branding.logo?.url) {
    try {
      new URL(branding.logo.url)
    } catch {
      // Allow relative URLs for internal assets
      if (!branding.logo.url.startsWith('/')) {
        errors.push('Invalid logo URL')
      }
    }
  }

  if (branding.social?.website) {
    try {
      new URL(branding.social.website)
    } catch {
      errors.push('Invalid website URL')
    }
  }

  return errors
}

/**
 * Check if organization has configured custom branding
 *
 * @param orgId - UUID of the organization
 * @returns True if organization has custom branding configured
 */
export async function hasCustomBranding(orgId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('organizations')
    .select('settings')
    .eq('id', orgId)
    .single()

  return !!(data?.settings?.branding)
}

/**
 * Get organization ID by custom domain
 * Used by middleware to detect organization from domain
 *
 * @param domain - Custom domain (e.g., "platform.acme.com")
 * @returns Organization ID if found, null otherwise
 */
export async function getOrgByDomain(domain: string): Promise<string | null> {
  try {
    const supabase = await createClient()

    // Normalize domain (remove protocol, www, trailing slash)
    const normalizedDomain = domain
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .toLowerCase()

    const { data, error } = await supabase
      .from('organizations')
      .select('id')
      .eq('custom_domain', normalizedDomain)
      .single()

    if (error || !data) {
      return null
    }

    return data.id
  } catch (error) {
    console.error('Error fetching organization by domain:', error)
    return null
  }
}

/**
 * Update organization custom domain
 * Only org_admin and admin roles can update
 *
 * @param orgId - UUID of the organization
 * @param domain - Custom domain to set (e.g., "platform.acme.com")
 * @throws Error if update fails or domain is already in use
 */
export async function updateCustomDomain(
  orgId: string,
  domain: string | null
): Promise<void> {
  const supabase = await createClient()

  // Normalize domain if provided
  const normalizedDomain = domain
    ? domain
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/$/, '')
        .toLowerCase()
    : null

  // Validate domain format
  if (normalizedDomain) {
    const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i
    if (!domainRegex.test(normalizedDomain)) {
      throw new Error('Invalid domain format')
    }
  }

  // Update custom_domain column
  // Note: RLS policies enforce that only org_admin/admin can update
  const { error } = await supabase
    .from('organizations')
    .update({ custom_domain: normalizedDomain })
    .eq('id', orgId)

  if (error) {
    // Check if it's a unique constraint violation
    if (error.code === '23505') {
      throw new Error('This domain is already in use by another organization')
    }
    throw new Error(`Failed to update custom domain: ${error.message}`)
  }
}
