/**
 * Apollo.io Integration
 *
 * Provides company and contact data enrichment via the Apollo.io API.
 * Best Clearbit alternative with similar features and better pricing.
 *
 * API Docs: https://apolloio.github.io/apollo-api-docs/
 */

export interface ApolloOrganization {
  id: string
  name: string
  website_url?: string
  blog_url?: string
  angellist_url?: string
  linkedin_url?: string
  twitter_url?: string
  facebook_url?: string

  // Classification
  primary_domain?: string
  domains?: string[]
  industry?: string
  keywords?: string[]

  // Firmographics
  estimated_num_employees?: number
  retail_location_count?: number
  raw_address?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string

  // Technology
  technologies?: Array<{
    uid: string
    name: string
    category: string
  }>

  // Social
  linkedin_uid?: string
  facebook_uid?: string
  twitter_uid?: string

  // Company info
  logo_url?: string
  publicly_traded_symbol?: string
  publicly_traded_exchange?: string
  founded_year?: number
  phone?: string

  // SEO
  seo_description?: string
  short_description?: string
  annual_revenue_printed?: string
  annual_revenue?: number
  total_funding?: number
  latest_funding_round_date?: string
  latest_funding_stage?: string
}

export interface ApolloPerson {
  id: string
  first_name?: string
  last_name?: string
  name?: string
  linkedin_url?: string
  title?: string
  email?: string
  email_status?: string
  photo_url?: string
  twitter_url?: string
  github_url?: string
  facebook_url?: string

  // Employment
  employment_history?: Array<{
    _id: string
    created_at: string
    current: boolean
    degree?: string
    description?: string
    emails?: string[]
    end_date?: string
    grade_level?: string
    kind?: string
    major?: string
    organization_id?: string
    organization_name?: string
    raw_address?: string
    start_date?: string
    title?: string
    updated_at: string
    id: number
    key: string
  }>

  // Location
  city?: string
  state?: string
  country?: string

  // Contact
  personal_emails?: string[]
  departments?: string[]
  subdepartments?: string[]
  seniority?: string
  functions?: string[]

  // Social
  extrapolated_email_confidence?: number
  organization_id?: string
  organization?: ApolloOrganization
}

export interface EnrichmentResult {
  organization?: ApolloOrganization
  person?: ApolloPerson
  source: 'apollo'
  cached: boolean
  enrichedAt: string
}

/**
 * Get Apollo API key from environment
 */
function getApiKey(): string {
  const apiKey = process.env.APOLLO_API_KEY

  if (!apiKey) {
    throw new Error('APOLLO_API_KEY environment variable is not set')
  }

  return apiKey
}

/**
 * Make authenticated request to Apollo API
 */
async function apolloRequest<T>(
  endpoint: string,
  body: Record<string, any>
): Promise<T | null> {
  const apiKey = getApiKey()
  const baseUrl = 'https://api.apollo.io/v1'

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify({
        api_key: apiKey,
        ...body,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Apollo API error (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('[Apollo] API request failed:', error)
    throw error
  }
}

/**
 * Enrich company data by domain
 */
export async function enrichOrganizationByDomain(domain: string): Promise<ApolloOrganization | null> {
  try {
    console.log(`[Apollo] Enriching organization: ${domain}`)

    const response = await apolloRequest<{ organization: ApolloOrganization }>('/organizations/enrich', {
      domain,
    })

    if (response?.organization) {
      console.log(`[Apollo] Found organization: ${response.organization.name}`)
      return response.organization
    }

    console.log(`[Apollo] No organization found for domain: ${domain}`)
    return null
  } catch (error) {
    console.error(`[Apollo] Failed to enrich organization ${domain}:`, error)
    return null
  }
}

/**
 * Search for organizations
 */
export async function searchOrganizations(params: {
  organization_names?: string[]
  website_urls?: string[]
  q_organization_keyword_tags?: string[]
  industries?: string[]
  page?: number
  per_page?: number
}): Promise<ApolloOrganization[]> {
  try {
    const response = await apolloRequest<{
      organizations: ApolloOrganization[]
      breadcrumbs: any[]
      partial_results_only: boolean
      disable_eu_prospecting: boolean
      partial_results_limit: number
      pagination: {
        page: number
        per_page: number
        total_entries: number
        total_pages: number
      }
    }>('/mixed_companies/search', {
      ...params,
      page: params.page || 1,
      per_page: params.per_page || 10,
    })

    return response?.organizations || []
  } catch (error) {
    console.error('[Apollo] Organization search failed:', error)
    return []
  }
}

/**
 * Enrich person data by email
 */
export async function enrichPersonByEmail(email: string): Promise<ApolloPerson | null> {
  try {
    console.log(`[Apollo] Enriching person: ${email}`)

    const response = await apolloRequest<{ person: ApolloPerson }>('/people/match', {
      email,
      reveal_personal_emails: true,
    })

    if (response?.person) {
      console.log(`[Apollo] Found person: ${response.person.name}`)
      return response.person
    }

    console.log(`[Apollo] No person found for email: ${email}`)
    return null
  } catch (error) {
    console.error(`[Apollo] Failed to enrich person ${email}:`, error)
    return null
  }
}

/**
 * Search for people
 */
export async function searchPeople(params: {
  person_titles?: string[]
  person_seniorities?: string[]
  organization_ids?: string[]
  q_keywords?: string
  page?: number
  per_page?: number
}): Promise<ApolloPerson[]> {
  try {
    const response = await apolloRequest<{
      people: ApolloPerson[]
      breadcrumbs: any[]
      partial_results_only: boolean
      disable_eu_prospecting: boolean
      partial_results_limit: number
      pagination: {
        page: number
        per_page: number
        total_entries: number
        total_pages: number
      }
    }>('/mixed_people/search', {
      ...params,
      page: params.page || 1,
      per_page: params.per_page || 10,
    })

    return response?.people || []
  } catch (error) {
    console.error('[Apollo] People search failed:', error)
    return []
  }
}

/**
 * Extract domain from email address
 */
export function extractDomainFromEmail(email: string): string | null {
  const match = email.match(/@(.+)$/)
  return match ? match[1].toLowerCase() : null
}

/**
 * Enrich organization from email address
 */
export async function enrichOrganizationFromEmail(email: string): Promise<ApolloOrganization | null> {
  const domain = extractDomainFromEmail(email)

  if (!domain) {
    return null
  }

  // Skip common free email providers
  const freeEmailProviders = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'aol.com',
    'icloud.com',
    'protonmail.com',
    'mail.com',
    'hey.com',
  ]

  if (freeEmailProviders.includes(domain)) {
    console.log(`[Apollo] Skipping free email provider: ${domain}`)
    return null
  }

  return enrichOrganizationByDomain(domain)
}

/**
 * Full enrichment - get both person and organization data
 */
export async function enrichFromEmail(email: string): Promise<EnrichmentResult> {
  const person = await enrichPersonByEmail(email)

  return {
    person: person || undefined,
    organization: person?.organization,
    source: 'apollo',
    cached: false,
    enrichedAt: new Date().toISOString(),
  }
}

/**
 * Batch enrich multiple organizations
 */
export async function batchEnrichOrganizations(domains: string[]): Promise<Array<{
  domain: string
  organization?: ApolloOrganization
  error?: string
}>> {
  const results = await Promise.allSettled(
    domains.map(async domain => {
      const organization = await enrichOrganizationByDomain(domain)
      return { domain, organization: organization || undefined }
    })
  )

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value
    }

    return {
      domain: domains[index],
      error: result.reason instanceof Error ? result.reason.message : 'Unknown error'
    }
  })
}

/**
 * Get AI readiness indicators from organization data
 */
export function extractAIReadinessSignals(org: ApolloOrganization): {
  hasAITools: boolean
  techStackSize: number
  cloudInfrastructure: boolean
  dataTools: boolean
  score: number
} {
  const tech = org.technologies || []

  const aiTools = tech.filter(t =>
    t.name.toLowerCase().includes('ai') ||
    t.name.toLowerCase().includes('machine learning') ||
    t.name.toLowerCase().includes('analytics') ||
    t.category.toLowerCase().includes('analytics') ||
    t.category.toLowerCase().includes('artificial intelligence')
  )

  const cloudTools = tech.filter(t =>
    t.name.toLowerCase().includes('aws') ||
    t.name.toLowerCase().includes('azure') ||
    t.name.toLowerCase().includes('gcp') ||
    t.name.toLowerCase().includes('google cloud') ||
    t.category.toLowerCase().includes('cloud')
  )

  const dataTools = tech.filter(t =>
    t.category.toLowerCase().includes('data') ||
    t.category.toLowerCase().includes('analytics') ||
    t.category.toLowerCase().includes('business intelligence')
  )

  // Simple AI readiness score (0-100)
  let score = 0
  if (aiTools.length > 0) score += 40
  if (cloudTools.length > 0) score += 30
  if (dataTools.length > 0) score += 20
  if (tech.length > 10) score += 10

  return {
    hasAITools: aiTools.length > 0,
    techStackSize: tech.length,
    cloudInfrastructure: cloudTools.length > 0,
    dataTools: dataTools.length > 0,
    score: Math.min(score, 100),
  }
}

/**
 * Get account credits remaining
 */
export async function getCreditsRemaining(): Promise<number> {
  try {
    const apiKey = getApiKey()
    const response = await fetch('https://api.apollo.io/v1/auth/health', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get credits: ${response.status}`)
    }

    const data = await response.json()
    return data.credits_remaining || 0
  } catch (error) {
    console.error('[Apollo] Failed to get credits:', error)
    return 0
  }
}
