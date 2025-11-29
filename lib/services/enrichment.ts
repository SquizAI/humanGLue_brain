/**
 * Data Enrichment Service
 *
 * Orchestrates data enrichment from multiple sources:
 * - Clearbit (company & person data)
 * - LangExtract (website content & language)
 * - Industry benchmarks
 *
 * Provides unified enrichment API with caching and fallbacks.
 */

import { createClient } from '@/lib/supabase/server'
import {
  enrichOrganizationByDomain as apolloEnrichOrg,
  enrichOrganizationFromEmail as apolloEnrichFromEmail,
  enrichFromEmail,
  extractAIReadinessSignals,
  type ApolloOrganization,
  type ApolloPerson,
} from '@/lib/integrations/apollo'
import {
  analyzeCompanyWebsite,
  type PageMetadata,
  type LanguageDetectionResult,
} from '@/lib/integrations/langextract'

export interface EnrichedOrganization {
  // Basic info
  name: string
  domain: string
  description?: string
  logo?: string

  // Classification
  industry?: string
  sector?: string
  naicsCode?: string
  sicCode?: string

  // Firmographics
  employeeCount?: number
  employeeRange?: string
  annualRevenue?: number
  revenueEstimate?: string
  foundedYear?: number
  location?: {
    city?: string
    state?: string
    country?: string
    countryCode?: string
  }

  // Technology
  tech?: string[]
  techCategories?: string[]
  aiReadinessScore?: number

  // Web presence
  website?: {
    title?: string
    description?: string
    language?: string
    languages?: Array<{ code: string, name: string, confidence: number }>
    hasInternationalPresence?: boolean
  }

  // Social
  social?: {
    linkedin?: string
    twitter?: string
    facebook?: string
  }

  // Enrichment metadata
  enrichedAt: string
  sources: string[]
  confidence: number
}

/**
 * Enrich organization from domain
 */
export async function enrichOrganizationByDomain(
  domain: string
): Promise<EnrichedOrganization | null> {
  try {
    console.log(`[Enrichment] Starting enrichment for domain: ${domain}`)

    // Run Apollo and LangExtract in parallel
    const [apolloData, websiteData] = await Promise.allSettled([
      apolloEnrichOrg(domain),
      analyzeCompanyWebsite(`https://${domain}`).catch(() => null),
    ])

    const org = apolloData.status === 'fulfilled' ? apolloData.value : null
    const website = websiteData.status === 'fulfilled' ? websiteData.value : null

    if (!org && !website) {
      console.log(`[Enrichment] No data found for ${domain}`)
      return null
    }

    // Calculate AI readiness if we have tech data
    const aiSignals = org ? extractAIReadinessSignals(org) : null

    // Build enriched org object
    const enriched: EnrichedOrganization = {
      name: org?.name || website?.metadata.title || domain,
      domain,
      description: org?.short_description || org?.seo_description || website?.metadata.description,
      logo: org?.logo_url,

      industry: org?.industry,
      sector: undefined, // Apollo doesn't provide sector separately
      naicsCode: undefined, // Apollo doesn't provide NAICS
      sicCode: undefined, // Apollo doesn't provide SIC

      employeeCount: org?.estimated_num_employees,
      employeeRange: undefined, // Apollo doesn't provide employee range
      annualRevenue: org?.annual_revenue,
      revenueEstimate: org?.annual_revenue_printed,
      foundedYear: org?.founded_year,

      location: org ? {
        city: org.city,
        state: org.state,
        country: org.country,
        countryCode: undefined, // Apollo doesn't provide country code
      } : undefined,

      tech: org?.technologies?.map(t => t.name),
      techCategories: org?.technologies?.map(t => t.category),
      aiReadinessScore: aiSignals?.score,

      website: website ? {
        title: website.metadata.title,
        description: website.metadata.description,
        language: website.language.language,
        languages: website.language.languages,
        hasInternationalPresence: website.insights.hasInternationalPresence,
      } : undefined,

      social: {
        linkedin: org?.linkedin_url,
        twitter: org?.twitter_url,
        facebook: org?.facebook_url,
      },

      enrichedAt: new Date().toISOString(),
      sources: [
        org ? 'apollo' : null,
        website ? 'langextract' : null,
      ].filter(Boolean) as string[],
      confidence: calculateConfidence(org, website),
    }

    console.log(`[Enrichment] Successfully enriched ${domain} from ${enriched.sources.join(', ')}`)

    return enriched
  } catch (error) {
    console.error(`[Enrichment] Failed to enrich ${domain}:`, error)
    return null
  }
}

/**
 * Enrich organization from email address
 */
export async function enrichOrganizationFromEmail(
  email: string
): Promise<EnrichedOrganization | null> {
  const domain = email.split('@')[1]
  if (!domain) {
    return null
  }

  return enrichOrganizationByDomain(domain)
}

/**
 * Save enriched data to database
 */
export async function saveEnrichedOrganization(
  organizationId: string,
  enrichedData: EnrichedOrganization
): Promise<void> {
  const supabase = await createClient()

  // Update organization with enriched data
  const { error } = await supabase
    .from('organizations')
    .update({
      domain: enrichedData.domain,
      industry: enrichedData.industry,
      employee_count: enrichedData.employeeCount,
      founded_year: enrichedData.foundedYear,
      location_city: enrichedData.location?.city,
      location_state: enrichedData.location?.state,
      location_country: enrichedData.location?.country,
      logo_url: enrichedData.logo,
      metadata: {
        enriched: enrichedData,
        enriched_at: enrichedData.enrichedAt,
        enrichment_sources: enrichedData.sources,
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', organizationId)

  if (error) {
    throw new Error(`Failed to save enriched data: ${error.message}`)
  }

  console.log(`[Enrichment] Saved enriched data for org ${organizationId}`)
}

/**
 * Calculate confidence score based on data sources
 */
function calculateConfidence(
  org: ApolloOrganization | null,
  website: any | null
): number {
  let score = 0

  if (org) {
    score += 50 // Apollo data is highly reliable

    if (org.estimated_num_employees) score += 10
    if (org.industry) score += 10
    if (org.short_description || org.seo_description) score += 5
    if (org.technologies && org.technologies.length > 0) score += 10
  }

  if (website) {
    score += 15 // Website data adds confidence

    if (website.metadata?.description) score += 5
    if (website.language?.confidence > 0.8) score += 5
  }

  return Math.min(score, 100)
}

/**
 * Get enrichment suggestions for an organization
 * Returns fields that could be enriched
 */
export async function getEnrichmentSuggestions(
  organizationId: string
): Promise<{
  canEnrich: boolean
  missingFields: string[]
  estimatedConfidence: number
}> {
  const supabase = await createClient()

  const { data: org, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single()

  if (error || !org) {
    return {
      canEnrich: false,
      missingFields: [],
      estimatedConfidence: 0,
    }
  }

  const missingFields: string[] = []

  if (!org.domain) missingFields.push('domain')
  if (!org.industry) missingFields.push('industry')
  if (!org.employee_count) missingFields.push('employee_count')
  if (!org.founded_year) missingFields.push('founded_year')
  if (!org.logo_url) missingFields.push('logo')

  // Can enrich if we have a domain or if we can infer it from user emails
  const canEnrich = !!org.domain || missingFields.includes('domain')

  // Estimate confidence based on what we can likely get
  const estimatedConfidence = canEnrich ? 70 : 0

  return {
    canEnrich,
    missingFields,
    estimatedConfidence,
  }
}

/**
 * Auto-enrich organization if it hasn't been enriched recently
 */
export async function autoEnrichOrganization(
  organizationId: string,
  force: boolean = false
): Promise<{
  enriched: boolean
  data?: EnrichedOrganization
  message: string
}> {
  const supabase = await createClient()

  // Check if org exists and needs enrichment
  const { data: org } = await supabase
    .from('organizations')
    .select('domain, metadata')
    .eq('id', organizationId)
    .single()

  if (!org) {
    return {
      enriched: false,
      message: 'Organization not found',
    }
  }

  if (!org.domain) {
    return {
      enriched: false,
      message: 'No domain available for enrichment',
    }
  }

  // Check if recently enriched (skip if enriched in last 30 days)
  if (!force && org.metadata?.enriched_at) {
    const enrichedAt = new Date(org.metadata.enriched_at)
    const daysSince = (Date.now() - enrichedAt.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSince < 30) {
      return {
        enriched: false,
        message: `Already enriched ${Math.round(daysSince)} days ago`,
      }
    }
  }

  // Perform enrichment
  const enrichedData = await enrichOrganizationByDomain(org.domain)

  if (!enrichedData) {
    return {
      enriched: false,
      message: 'No enrichment data available',
    }
  }

  // Save to database
  await saveEnrichedOrganization(organizationId, enrichedData)

  return {
    enriched: true,
    data: enrichedData,
    message: 'Organization enriched successfully',
  }
}
