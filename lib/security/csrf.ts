/**
 * CSRF Protection Implementation
 *
 * Protects against Cross-Site Request Forgery attacks
 * Uses double-submit cookie pattern
 */

import { NextRequest, NextResponse } from 'next/server'
import { randomBytes, createHash } from 'crypto'

const CSRF_TOKEN_HEADER = 'x-csrf-token'
const CSRF_COOKIE_NAME = 'csrf_token'
const CSRF_SECRET_COOKIE_NAME = 'csrf_secret'
const TOKEN_LENGTH = 32

/**
 * Generate a cryptographically secure random token
 */
function generateToken(): string {
  return randomBytes(TOKEN_LENGTH).toString('hex')
}

/**
 * Hash a token for comparison
 */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/**
 * Generate CSRF token pair (token + secret)
 */
export function generateCsrfToken(): { token: string; secret: string } {
  const secret = generateToken()
  const token = hashToken(secret)
  return { token, secret }
}

/**
 * Validate CSRF token from request
 */
export function validateCsrfToken(request: NextRequest): boolean {
  // Get token from header
  const tokenFromHeader = request.headers.get(CSRF_TOKEN_HEADER)
  if (!tokenFromHeader) {
    return false
  }

  // Get secret from cookie
  const secretFromCookie = request.cookies.get(CSRF_SECRET_COOKIE_NAME)?.value
  if (!secretFromCookie) {
    return false
  }

  // Get expected token from cookie
  const expectedToken = request.cookies.get(CSRF_COOKIE_NAME)?.value
  if (!expectedToken) {
    return false
  }

  // Verify token matches
  const computedToken = hashToken(secretFromCookie)
  return computedToken === expectedToken && tokenFromHeader === expectedToken
}

/**
 * Add CSRF token to response cookies
 */
export function setCsrfCookies(response: NextResponse): NextResponse {
  const { token, secret } = generateCsrfToken()

  // Set token cookie (readable by JavaScript for sending in headers)
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Must be readable by JS
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  })

  // Set secret cookie (httpOnly, not accessible by JS)
  response.cookies.set(CSRF_SECRET_COOKIE_NAME, secret, {
    httpOnly: true, // Cannot be read by JavaScript
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  })

  // Also add token to response header for convenience
  response.headers.set(CSRF_TOKEN_HEADER, token)

  return response
}

/**
 * CSRF protection middleware
 * Use for POST, PUT, PATCH, DELETE requests
 */
export function withCsrfProtection(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any) => {
    // Only validate CSRF for state-changing methods
    const methodsToProtect = ['POST', 'PUT', 'PATCH', 'DELETE']
    if (methodsToProtect.includes(request.method)) {
      const isValid = validateCsrfToken(request)
      if (!isValid) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'CSRF_TOKEN_INVALID',
              message: 'Invalid or missing CSRF token',
            },
          },
          { status: 403 }
        )
      }
    }

    // Proceed with handler
    const response = await handler(request, context)

    // Refresh CSRF token on every response
    return setCsrfCookies(response)
  }
}

/**
 * Initialize CSRF tokens for a new session
 * Call this when user logs in or visits the site
 */
export function initializeCsrfProtection(response: NextResponse): NextResponse {
  return setCsrfCookies(response)
}

/**
 * Clear CSRF tokens (e.g., on logout)
 */
export function clearCsrfTokens(response: NextResponse): NextResponse {
  response.cookies.delete(CSRF_COOKIE_NAME)
  response.cookies.delete(CSRF_SECRET_COOKIE_NAME)
  return response
}

/**
 * Get CSRF token from cookies (for use in client-side requests)
 */
export function getCsrfToken(request: NextRequest): string | undefined {
  return request.cookies.get(CSRF_COOKIE_NAME)?.value
}
