/**
 * Authentication Middleware for API Routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireRole, AuthError } from './server'

type RouteHandler = (
  request: NextRequest,
  context?: any
) => Promise<NextResponse> | NextResponse

/**
 * Wrap API route with authentication check
 * Ensures user is authenticated before allowing access
 */
export function withAuth(handler: RouteHandler): RouteHandler {
  return async (request: NextRequest, context?: any) => {
    try {
      // Verify authentication
      await requireAuth()

      // Proceed with the route handler
      return await handler(request, context)
    } catch (error) {
      if (error instanceof AuthError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: error.statusCode === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
              message: error.message,
            },
          },
          { status: error.statusCode }
        )
      }

      // Unknown error
      console.error('Unexpected auth error:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
          },
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Wrap API route with role-based access control
 * Ensures user has required role before allowing access
 */
export function withRole(
  allowedRoles: Array<'admin' | 'instructor' | 'client'>,
  handler: RouteHandler
): RouteHandler {
  return async (request: NextRequest, context?: any) => {
    try {
      // Verify authentication and role
      await requireRole(allowedRoles)

      // Proceed with the route handler
      return await handler(request, context)
    } catch (error) {
      if (error instanceof AuthError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: error.statusCode === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
              message: error.message,
            },
          },
          { status: error.statusCode }
        )
      }

      // Unknown error
      console.error('Unexpected auth error:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
          },
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Require admin access
 */
export function withAdmin(handler: RouteHandler): RouteHandler {
  return withRole(['admin'], handler)
}

/**
 * Require instructor access (admins also allowed)
 */
export function withInstructor(handler: RouteHandler): RouteHandler {
  return withRole(['admin', 'instructor'], handler)
}
