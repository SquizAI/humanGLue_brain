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
  enrichCompanyByDomain,
  enrichCompanyFromEmail,
  enrichFromEmail,
  extractAIReadinessSignals,
  type ClearbitCompany,
  type ClearbitPerson,
} from '@/lib/integrations/clearbit'
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

    // Run Clearbit and LangExtract in parallel
    const [clearbitData, websiteData] = await Promise.allSettled([
      enrichCompanyByDomain(domain),
      analyzeCompanyWebsite(`https://${domain}`).catch(() => null),
    ])

    const company = clearbitData.status === 'fulfilled' ? clearbitData.value : null
    const website = websiteData.status === 'fulfilled' ? websiteData.value : null

    if (!company && !website) {
      console.log(`[Enrichment] No data found for ${domain}`)
      return null
    }

    // Calculate AI readiness if we have tech data
    const aiSignals = company ? extractAIReadinessSignals(company) : null

    // Build enriched org object
    const enriched: EnrichedOrganization = {
      name: company?.name || website?.metadata.title || domain,
      domain,
      description: company?.description || website?.metadata.description,
      logo: company?.logo,

      industry: company?.category?.industry,
      sector: company?.category?.sector,
      naicsCode: company?.category?.naicsCode,
      sicCode: company?.category?.sicCode,

      employeeCount: company?.metrics?.employees,
      employeeRange: company?.metrics?.employeesRange,
      annualRevenue: company?.metrics?.annualRevenue,
      revenueEstimate: company?.metrics?.estimatedAnnualRevenue,
      foundedYear: company?.foundedYear,

      location: company?.geo ? {
        city: company.geo.city,
        state: company.geo.state,
        country: company.geo.country,
        countryCode: company.geo.countryCode,
      } : undefined,

      tech: company?.tech,
      techCategories: company?.techCategories,
      aiReadinessScore: aiSignals?.score,

      website: website ? {
        title: website.metadata.title,
        description: website.metadata.description,
        language: website.language.language,
        languages: website.language.languages,
        hasInternationalPresence: website.insights.hasInternationalPresence,
      } : undefined,

      social: {
        linkedin: company?.linkedin?.handle,
        twitter: company?.twitter?.handle,
        facebook: company?.facebook?.handle,
      },

      enrichedAt: new Date().toISOString(),
      sources: [
        company ? 'clearbit' : null,
        website ? 'langextract' : null,
      ].filter(Boolean) as string[],
      confidence: calculateConfidence(company, website),
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
  company: ClearbitCompany | null,
  website: any | null
): number {
  let score = 0

  if (company) {
    score += 50 // Clearbit data is highly reliable

    if (company.metrics?.employees) score += 10
    if (company.category?.industry) score += 10
    if (company.description) score += 5
    if (company.tech && company.tech.length > 0) score += 10
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
