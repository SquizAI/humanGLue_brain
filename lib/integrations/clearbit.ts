/**
 * Clearbit Integration
 *
 * Provides company data enrichment via the Clearbit API.
 * Used to automatically fill company information from email domains,
 * enrich organization profiles, and gather firmographic data.
 *
 * API Docs: https://clearbit.com/docs
 */

export interface ClearbitCompany {
  id: string
  name: string
  legalName?: string
  domain: string
  domainAliases?: string[]

  // Classification
  category?: {
    sector?: string
    industryGroup?: string
    industry?: string
    subIndustry?: string
    sicCode?: string
    naicsCode?: string
  }

  // Firmographics
  tags?: string[]
  description?: string
  foundedYear?: number
  location?: string
  timeZone?: string
  utcOffset?: number
  geo?: {
    streetNumber?: string
    streetName?: string
    subPremise?: string
    city?: string
    postalCode?: string
    state?: string
    stateCode?: string
    country?: string
    countryCode?: string
    lat?: number
    lng?: number
  }

  // Company metrics
  metrics?: {
    alexaUsRank?: number
    alexaGlobalRank?: number
    employees?: number
    employeesRange?: string
    marketCap?: number
    raised?: number
    annualRevenue?: number
    estimatedAnnualRevenue?: string
    fiscalYearEnd?: number
  }

  // Social/Web presence
  logo?: string
  facebook?: { handle?: string }
  linkedin?: { handle?: string }
  twitter?: { handle?: string, id?: string, bio?: string, followers?: number, following?: number }
  crunchbase?: { handle?: string }
  emailProvider?: boolean
  type?: string
  ticker?: string
  identifiers?: {
    usEIN?: string
  }
  phone?: string
  site?: {
    phoneNumbers?: string[]
    emailAddresses?: string[]
  }

  // Technology
  tech?: string[]
  techCategories?: string[]

  // Parent/Ultimate parent
  parent?: {
    domain?: string
  }
  ultimateParent?: {
    domain?: string
  }
}

export interface ClearbitPerson {
  id: string
  name?: {
    fullName?: string
    givenName?: string
    familyName?: string
  }
  email?: string
  location?: string
  timeZone?: string
  utcOffset?: number
  geo?: {
    city?: string
    state?: string
    stateCode?: string
    country?: string
    countryCode?: string
    lat?: number
    lng?: number
  }
  bio?: string
  site?: string
  avatar?: string
  employment?: {
    domain?: string
    name?: string
    title?: string
    role?: string
    subRole?: string
    seniority?: string
  }
  facebook?: { handle?: string }
  github?: { handle?: string, avatar?: string, company?: string, blog?: string, followers?: number, following?: number }
  twitter?: { handle?: string, id?: string, bio?: string, followers?: number, following?: number, location?: string, site?: string, avatar?: string }
  linkedin?: { handle?: string }
  googleplus?: { handle?: string }
  aboutme?: { handle?: string, bio?: string, avatar?: string }
  gravatar?: { handle?: string, urls?: any[], avatar?: string, avatars?: any[] }
}

export interface EnrichmentResult {
  company?: ClearbitCompany
  person?: ClearbitPerson
  source: 'clearbit'
  cached: boolean
  enrichedAt: string
}

/**
 * Get Clearbit API key from environment
 */
function getApiKey(): string {
  const apiKey = process.env.CLEARBIT_API_KEY

  if (!apiKey) {
    throw new Error('CLEARBIT_API_KEY environment variable is not set')
  }

  return apiKey
}

/**
 * Make authenticated request to Clearbit API
 */
async function clearbitRequest<T>(
  endpoint: string,
  params?: Record<string, string>
): Promise<T | null> {
  const apiKey = getApiKey()
  const baseUrl = 'https://company.clearbit.com/v2'

  const url = new URL(`${baseUrl}${endpoint}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })
  }

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.status === 404) {
      // Not found - valid response, just no data
      return null
    }

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Clearbit API error (${response.status}): ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('[Clearbit] API request failed:', error)
    throw error
  }
}

/**
 * Enrich company data by domain
 */
export async function enrichCompanyByDomain(domain: string): Promise<ClearbitCompany | null> {
  try {
    console.log(`[Clearbit] Enriching company: ${domain}`)

    const company = await clearbitRequest<ClearbitCompany>('/companies/find', { domain })

    if (company) {
      console.log(`[Clearbit] Found company: ${company.name}`)
    } else {
      console.log(`[Clearbit] No company found for domain: ${domain}`)
    }

    return company
  } catch (error) {
    console.error(`[Clearbit] Failed to enrich company ${domain}:`, error)
    return null
  }
}

/**
 * Enrich person data by email
 */
export async function enrichPersonByEmail(email: string): Promise<{ person: ClearbitPerson | null, company: ClearbitCompany | null }> {
  try {
    console.log(`[Clearbit] Enriching person: ${email}`)

    const baseUrl = 'https://person.clearbit.com/v2'
    const apiKey = getApiKey()

    const url = new URL(`${baseUrl}/combined/find`)
    url.searchParams.append('email', email)

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.status === 404) {
      return { person: null, company: null }
    }

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Clearbit API error (${response.status}): ${errorText}`)
    }

    const data = await response.json()

    return {
      person: data.person || null,
      company: data.company || null,
    }
  } catch (error) {
    console.error(`[Clearbit] Failed to enrich person ${email}:`, error)
    return { person: null, company: null }
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
 * Enrich company from email address
 */
export async function enrichCompanyFromEmail(email: string): Promise<ClearbitCompany | null> {
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
  ]

  if (freeEmailProviders.includes(domain)) {
    console.log(`[Clearbit] Skipping free email provider: ${domain}`)
    return null
  }

  return enrichCompanyByDomain(domain)
}

/**
 * Full enrichment - get both person and company data
 */
export async function enrichFromEmail(email: string): Promise<EnrichmentResult> {
  const { person, company } = await enrichPersonByEmail(email)

  return {
    person: person || undefined,
    company: company || undefined,
    source: 'clearbit',
    cached: false,
    enrichedAt: new Date().toISOString(),
  }
}

/**
 * Batch enrich multiple companies
 */
export async function batchEnrichCompanies(domains: string[]): Promise<Array<{
  domain: string
  company?: ClearbitCompany
  error?: string
}>> {
  const results = await Promise.allSettled(
    domains.map(async domain => {
      const company = await enrichCompanyByDomain(domain)
      return { domain, company: company || undefined }
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
 * Get AI readiness indicators from company data
 */
export function extractAIReadinessSignals(company: ClearbitCompany): {
  hasAITools: boolean
  techStackSize: number
  cloudInfrastructure: boolean
  dataTools: boolean
  score: number
} {
  const tech = company.tech || []
  const techCategories = company.techCategories || []

  const aiTools = tech.filter(t =>
    t.toLowerCase().includes('ai') ||
    t.toLowerCase().includes('machine learning') ||
    t.toLowerCase().includes('analytics')
  )

  const cloudTools = tech.filter(t =>
    t.toLowerCase().includes('aws') ||
    t.toLowerCase().includes('azure') ||
    t.toLowerCase().includes('gcp') ||
    t.toLowerCase().includes('google cloud')
  )

  const dataTools = tech.filter(t =>
    t.toLowerCase().includes('data') ||
    t.toLowerCase().includes('analytics') ||
    t.toLowerCase().includes('warehouse')
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
