/**
 * Rate Limiting Implementation
 *
 * Protects authentication endpoints from brute force attacks
 * Uses in-memory storage (consider Redis/Upstash for production clusters)
 */

import { NextRequest, NextResponse } from 'next/server'

interface RateLimitRule {
  windowMs: number // Time window in milliseconds
  maxAttempts: number // Max attempts per window
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

// Rate limit rules for different endpoints
export const RATE_LIMIT_RULES: Record<string, RateLimitRule> = {
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5,
  },
  signup: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxAttempts: 3,
  },
  'reset-password': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxAttempts: 3,
  },
  'update-password': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxAttempts: 5,
  },
}

// In-memory store for rate limiting
// WARNING: This is lost on server restart. Use Redis/Upstash for production.
class RateLimitStore {
  private store: Map<string, RateLimitEntry> = new Map()

  get(key: string): RateLimitEntry | undefined {
    const entry = this.store.get(key)
    if (entry && Date.now() > entry.resetTime) {
      // Entry has expired, remove it
      this.store.delete(key)
      return undefined
    }
    return entry
  }

  set(key: string, value: RateLimitEntry): void {
    this.store.set(key, value)
  }

  increment(key: string, windowMs: number): number {
    const entry = this.get(key)
    if (entry) {
      entry.count++
      this.set(key, entry)
      return entry.count
    } else {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: Date.now() + windowMs,
      }
      this.set(key, newEntry)
      return 1
    }
  }

  reset(key: string): void {
    this.store.delete(key)
  }

  // Cleanup expired entries every hour
  startCleanup(): void {
    setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of Array.from(this.store.entries())) {
        if (now > entry.resetTime) {
          this.store.delete(key)
        }
      }
    }, 60 * 60 * 1000) // 1 hour
  }
}

const rateLimitStore = new RateLimitStore()
rateLimitStore.startCleanup()

/**
 * Get client identifier (IP address or user ID)
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from headers (for proxies/load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  if (realIp) {
    return realIp
  }

  // Fallback when IP cannot be determined
  return 'unknown'
}

/**
 * Rate limit middleware for authentication endpoints
 */
export async function rateLimit(
  request: NextRequest,
  endpoint: keyof typeof RATE_LIMIT_RULES
): Promise<{ allowed: boolean; response?: NextResponse }> {
  const rule = RATE_LIMIT_RULES[endpoint]
  if (!rule) {
    // No rate limit configured for this endpoint
    return { allowed: true }
  }

  const clientId = getClientIdentifier(request)
  const key = `rate-limit:${endpoint}:${clientId}`

  const count = rateLimitStore.increment(key, rule.windowMs)

  if (count > rule.maxAttempts) {
    const entry = rateLimitStore.get(key)
    const retryAfter = entry ? Math.ceil((entry.resetTime - Date.now()) / 1000) : 60

    return {
      allowed: false,
      response: NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
            retryAfter,
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': rule.maxAttempts.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry ? new Date(entry.resetTime).toISOString() : '',
          },
        }
      ),
    }
  }

  return {
    allowed: true,
  }
}

/**
 * Reset rate limit for a specific client (e.g., after successful login)
 */
export function resetRateLimit(request: NextRequest, endpoint: keyof typeof RATE_LIMIT_RULES): void {
  const clientId = getClientIdentifier(request)
  const key = `rate-limit:${endpoint}:${clientId}`
  rateLimitStore.reset(key)
}

/**
 * Rate limit by email (for password reset, etc.)
 */
export async function rateLimitByEmail(
  email: string,
  endpoint: keyof typeof RATE_LIMIT_RULES
): Promise<{ allowed: boolean; response?: NextResponse }> {
  const rule = RATE_LIMIT_RULES[endpoint]
  if (!rule) {
    return { allowed: true }
  }

  const key = `rate-limit:${endpoint}:email:${email.toLowerCase()}`
  const count = rateLimitStore.increment(key, rule.windowMs)

  if (count > rule.maxAttempts) {
    const entry = rateLimitStore.get(key)
    const retryAfter = entry ? Math.ceil((entry.resetTime - Date.now()) / 1000) : 60

    return {
      allowed: false,
      response: NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests for this email. Please try again later.',
            retryAfter,
          },
        },
        { status: 429 }
      ),
    }
  }

  return { allowed: true }
}
