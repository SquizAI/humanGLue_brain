import { Handler } from '@netlify/functions'

/**
 * Company Enrichment API
 *
 * Attempts to enrich company data from email domain using various sources:
 * - Clearbit (if API key available)
 * - Hunter.io Company API
 * - Fallback to basic data extraction
 *
 * Features:
 * - Rate limiting (10 requests per minute per IP)
 * - 24-hour caching for results
 * - Graceful fallback on errors
 */

// In-memory cache for enrichment results (24 hours)
interface CachedEnrichment {
  data: CompanyEnrichmentData
  timestamp: number
}

interface CompanyEnrichmentData {
  company: string | null
  industry: string | null
  size: string | null
  found: boolean
  source?: string
}

const enrichmentCache = new Map<string, CachedEnrichment>()
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

// Rate limiting (in-memory, per instance)
interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimits = new Map<string, RateLimitEntry>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 10 // 10 requests per minute

export const handler: Handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  }

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    // Get IP for rate limiting
    const ip = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown'

    // Check rate limit
    const rateLimitResult = checkRateLimit(ip)
    if (!rateLimitResult.allowed) {
      return {
        statusCode: 429,
        headers: {
          ...headers,
          'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
        },
        body: JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
        }),
      }
    }

    // Extract domain from query parameters
    const domain = event.queryStringParameters?.domain

    if (!domain) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing domain parameter',
          message: 'Please provide a domain query parameter',
        }),
      }
    }

    // Validate domain format
    if (!isValidDomain(domain)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid domain',
          message: 'Please provide a valid email domain',
        }),
      }
    }

    // Check cache first
    const cached = enrichmentCache.get(domain)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('[Enrich] Cache hit for domain:', domain)
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'X-Cache': 'HIT',
          'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        },
        body: JSON.stringify(cached.data),
      }
    }

    // Attempt enrichment from various sources
    let enrichedData: CompanyEnrichmentData | null = null

    // Try Clearbit first (if API key available)
    if (process.env.CLEARBIT_API_KEY) {
      enrichedData = await enrichFromClearbit(domain)
    }

    // Try Hunter.io if Clearbit failed (if API key available)
    if (!enrichedData?.found && process.env.HUNTER_API_KEY) {
      enrichedData = await enrichFromHunter(domain)
    }

    // Fallback to basic data
    if (!enrichedData?.found) {
      enrichedData = getFallbackData(domain)
    }

    // Cache the result
    enrichmentCache.set(domain, {
      data: enrichedData,
      timestamp: Date.now(),
    })

    // Clean up old cache entries (keep cache size manageable)
    cleanupCache()

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'X-Cache': 'MISS',
        'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
      },
      body: JSON.stringify(enrichedData),
    }
  } catch (error) {
    console.error('[Enrich] Error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to enrich company data',
      }),
    }
  }
}

/**
 * Check rate limit for IP address
 */
function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const existing = rateLimits.get(ip)

  // Clean up expired entries
  if (existing && now > existing.resetTime) {
    rateLimits.delete(ip)
  }

  const current = rateLimits.get(ip)

  if (!current) {
    // First request from this IP
    rateLimits.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    })
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX - 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    }
  }

  if (current.count >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime,
    }
  }

  current.count++
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX - current.count,
    resetTime: current.resetTime,
  }
}

/**
 * Validate domain format
 */
function isValidDomain(domain: string): boolean {
  // Basic domain validation
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/
  return domainRegex.test(domain)
}

/**
 * Enrich company data from Clearbit
 */
async function enrichFromClearbit(domain: string): Promise<CompanyEnrichmentData> {
  try {
    const apiKey = process.env.CLEARBIT_API_KEY
    if (!apiKey) {
      return { company: null, industry: null, size: null, found: false }
    }

    console.log('[Enrich] Attempting Clearbit enrichment for:', domain)

    const response = await fetch(`https://company.clearbit.com/v2/companies/find?domain=${domain}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })

    if (!response.ok) {
      console.log('[Enrich] Clearbit returned:', response.status)
      return { company: null, industry: null, size: null, found: false }
    }

    const data = await response.json()

    return {
      company: data.name || null,
      industry: data.category?.industry || data.category?.sector || null,
      size: formatCompanySize(data.metrics?.employees),
      found: true,
      source: 'clearbit',
    }
  } catch (error) {
    console.error('[Enrich] Clearbit error:', error)
    return { company: null, industry: null, size: null, found: false }
  }
}

/**
 * Enrich company data from Hunter.io
 */
async function enrichFromHunter(domain: string): Promise<CompanyEnrichmentData> {
  try {
    const apiKey = process.env.HUNTER_API_KEY
    if (!apiKey) {
      return { company: null, industry: null, size: null, found: false }
    }

    console.log('[Enrich] Attempting Hunter.io enrichment for:', domain)

    const response = await fetch(
      `https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${apiKey}&limit=1`,
      {
        signal: AbortSignal.timeout(5000), // 5 second timeout
      }
    )

    if (!response.ok) {
      console.log('[Enrich] Hunter.io returned:', response.status)
      return { company: null, industry: null, size: null, found: false }
    }

    const data = await response.json()

    if (data.data && data.data.organization) {
      return {
        company: data.data.organization || null,
        industry: data.data.industry || null,
        size: null, // Hunter doesn't provide size
        found: true,
        source: 'hunter',
      }
    }

    return { company: null, industry: null, size: null, found: false }
  } catch (error) {
    console.error('[Enrich] Hunter.io error:', error)
    return { company: null, industry: null, size: null, found: false }
  }
}

/**
 * Get fallback data based on domain
 */
function getFallbackData(domain: string): CompanyEnrichmentData {
  // Extract potential company name from domain
  const parts = domain.split('.')
  const companyPart = parts[0]

  // Capitalize first letter
  const companyName = companyPart.charAt(0).toUpperCase() + companyPart.slice(1)

  return {
    company: companyName,
    industry: null,
    size: null,
    found: false,
    source: 'fallback',
  }
}

/**
 * Format company size from employee count
 */
function formatCompanySize(employees: number | undefined | null): string | null {
  if (!employees) return null

  if (employees < 10) return '1-10 employees'
  if (employees < 50) return '10-50 employees'
  if (employees < 200) return '50-200 employees'
  if (employees < 500) return '200-500 employees'
  if (employees < 1000) return '500-1,000 employees'
  if (employees < 5000) return '1,000-5,000 employees'
  return '5,000+ employees'
}

/**
 * Clean up old cache entries
 */
function cleanupCache() {
  const now = Date.now()
  const entriesToDelete: string[] = []

  enrichmentCache.forEach((value, key) => {
    if (now - value.timestamp > CACHE_DURATION) {
      entriesToDelete.push(key)
    }
  })

  entriesToDelete.forEach(key => enrichmentCache.delete(key))

  if (entriesToDelete.length > 0) {
    console.log('[Enrich] Cleaned up', entriesToDelete.length, 'expired cache entries')
  }
}
