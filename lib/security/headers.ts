/**
 * Security Headers Configuration
 *
 * Implements security best practices through HTTP headers
 * Protects against common web vulnerabilities
 */

import { NextResponse } from 'next/server'

/**
 * Security headers to apply to all responses
 */
export const SECURITY_HEADERS = {
  // Prevent clickjacking attacks
  'X-Frame-Options': 'DENY',

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Enable XSS filter in older browsers
  'X-XSS-Protection': '1; mode=block',

  // Restrict feature permissions
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), interest-cohort=()',

  // Force HTTPS in production (HSTS)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Content Security Policy - configure based on your needs
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://va.vercel-scripts.com https://vercel.live",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://va.vercel-scripts.com https://vercel.live https://vitals.vercel-insights.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join('; '),
}

/**
 * Apply security headers to a response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    // Skip HSTS in development
    if (key === 'Strict-Transport-Security' && process.env.NODE_ENV !== 'production') {
      return
    }
    response.headers.set(key, value)
  })

  return response
}

/**
 * Create a response with security headers
 */
export function createSecureResponse(
  body: any,
  init?: ResponseInit
): NextResponse {
  const response = NextResponse.json(body, init)
  return applySecurityHeaders(response)
}

/**
 * Middleware wrapper to apply security headers
 */
export function withSecurityHeaders(
  handler: (request: Request, context?: any) => Promise<NextResponse>
) {
  return async (request: Request, context?: any) => {
    const response = await handler(request, context)
    return applySecurityHeaders(response)
  }
}

/**
 * Get CSP nonce for inline scripts (if using nonce-based CSP)
 */
export function generateCspNonce(): string {
  if (typeof window === 'undefined') {
    // Server-side: generate random nonce
    return Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64')
  }
  return ''
}

/**
 * Configure Content Security Policy for specific pages
 */
export function getCustomCsp(options: {
  allowInlineScripts?: boolean
  allowInlineStyles?: boolean
  additionalScriptSources?: string[]
  additionalStyleSources?: string[]
}): string {
  const {
    allowInlineScripts = false,
    allowInlineStyles = false,
    additionalScriptSources = [],
    additionalStyleSources = [],
  } = options

  const scriptSrc = [
    "'self'",
    ...(allowInlineScripts ? ["'unsafe-inline'", "'unsafe-eval'"] : []),
    'https://cdn.jsdelivr.net',
    'https://va.vercel-scripts.com',
    'https://vercel.live',
    ...additionalScriptSources,
  ].join(' ')

  const styleSrc = [
    "'self'",
    ...(allowInlineStyles ? ["'unsafe-inline'"] : []),
    'https://fonts.googleapis.com',
    ...additionalStyleSources,
  ].join(' ')

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    `style-src ${styleSrc}`,
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://va.vercel-scripts.com https://vercel.live https://vitals.vercel-insights.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join('; ')
}

/**
 * Security headers for API routes (less restrictive CSP)
 */
export const API_SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
}

/**
 * Apply API-specific security headers
 */
export function applyApiSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(API_SECURITY_HEADERS).forEach(([key, value]) => {
    if (key === 'Strict-Transport-Security' && process.env.NODE_ENV !== 'production') {
      return
    }
    response.headers.set(key, value)
  })

  return response
}

/**
 * Security headers for static assets (more permissive)
 */
export const STATIC_ASSET_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'public, max-age=31536000, immutable',
}

/**
 * CORS headers for API endpoints (configure as needed)
 */
export function getCorsHeaders(origin?: string): Record<string, string> {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []

  // In development, allow all origins
  if (process.env.NODE_ENV === 'development') {
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
      'Access-Control-Max-Age': '86400',
    }
  }

  // In production, validate origin
  if (origin && allowedOrigins.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    }
  }

  return {}
}
