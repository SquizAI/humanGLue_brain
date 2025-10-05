/**
 * Rate Limiting
 * Protect API endpoints from abuse using Upstash Redis
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest } from 'next/server'
import { APIErrors } from './errors'

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL?.startsWith('https') && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

// Create rate limiters for different endpoints
const rateLimiters = {
  // Strict rate limit for public endpoints (10 requests per 10 seconds)
  strict: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '10 s'),
        analytics: true,
        prefix: 'ratelimit:strict',
      })
    : null,

  // Standard rate limit for authenticated endpoints (30 requests per minute)
  standard: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(30, '1 m'),
        analytics: true,
        prefix: 'ratelimit:standard',
      })
    : null,

  // Lenient rate limit for authenticated users (100 requests per minute)
  lenient: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, '1 m'),
        analytics: true,
        prefix: 'ratelimit:lenient',
      })
    : null,
}

export type RateLimitTier = 'strict' | 'standard' | 'lenient'

/**
 * Get identifier from request (IP or user ID)
 */
export function getIdentifier(request: NextRequest, userId?: string): string {
  if (userId) {
    return `user:${userId}`
  }

  // Get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded ? forwarded.split(',')[0] : realIp || 'unknown'

  return `ip:${ip}`
}

/**
 * Check rate limit
 */
export async function checkRateLimit(
  identifier: string,
  tier: RateLimitTier = 'standard'
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
  headers: Record<string, string>
}> {
  const limiter = rateLimiters[tier]

  // If rate limiting is not configured, allow all requests
  if (!limiter) {
    return {
      success: true,
      limit: 1000,
      remaining: 1000,
      reset: Date.now() + 60000,
      headers: {},
    }
  }

  const { success, limit, reset, remaining } = await limiter.limit(identifier)

  const headers = {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': reset.toString(),
  }

  return {
    success,
    limit,
    remaining,
    reset,
    headers,
  }
}

/**
 * Middleware to enforce rate limiting
 */
export async function enforceRateLimit(
  request: NextRequest,
  tier: RateLimitTier = 'standard',
  userId?: string
): Promise<void> {
  const identifier = getIdentifier(request, userId)
  const result = await checkRateLimit(identifier, tier)

  if (!result.success) {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000)
    throw APIErrors.RATE_LIMITED(retryAfter)
  }
}

/**
 * Get rate limit headers
 */
export async function getRateLimitHeaders(
  identifier: string,
  tier: RateLimitTier = 'standard'
): Promise<Record<string, string>> {
  const result = await checkRateLimit(identifier, tier)
  return result.headers
}
