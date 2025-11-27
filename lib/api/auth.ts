/**
 * Authentication & Authorization
 * Middleware for protected routes and role-based access control
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { APIErrors } from './errors'
import type { User } from '@supabase/supabase-js'

/**
 * Get authenticated user from request
 */
export async function getAuthUser(): Promise<User> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw APIErrors.UNAUTHORIZED()
  }

  return user
}

/**
 * Check if user has specific role
 */
export async function checkUserRole(
  userId: string,
  allowedRoles: string[]
): Promise<{ hasRole: boolean; role?: string }> {
  const supabase = await createClient()

  const { data: userRole, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .is('expires_at', null)
    .or(`expires_at.gt.${new Date().toISOString()}`)
    .single()

  if (error || !userRole) {
    return { hasRole: false }
  }

  const hasRole = allowedRoles.includes(userRole.role)
  return { hasRole, role: userRole.role }
}

/**
 * Require authentication
 */
export async function requireAuth(): Promise<User> {
  return getAuthUser()
}

/**
 * Require specific role(s)
 */
export async function requireRole(
  allowedRoles: string[]
): Promise<{ user: User; role: string }> {
  const user = await getAuthUser()
  const { hasRole, role } = await checkUserRole(user.id, allowedRoles)

  if (!hasRole) {
    throw APIErrors.FORBIDDEN(
      `Required role: ${allowedRoles.join(' or ')}`
    )
  }

  return { user, role: role! }
}

/**
 * Check if user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const { hasRole } = await checkUserRole(userId, ['admin'])
  return hasRole
}

/**
 * Check if user owns resource
 */
export async function checkResourceOwnership(
  userId: string,
  resourceUserId: string
): Promise<boolean> {
  // Check if user is owner
  if (userId === resourceUserId) {
    return true
  }

  // Check if user is admin
  const adminCheck = await isAdmin(userId)
  return adminCheck
}

/**
 * Require resource ownership
 */
export async function requireOwnership(
  user: User,
  resourceUserId: string
): Promise<void> {
  const isOwner = await checkResourceOwnership(user.id, resourceUserId)

  if (!isOwner) {
    throw APIErrors.FORBIDDEN('You do not have permission to access this resource')
  }
}

/**
 * Extract bearer token from request
 */
export function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  return authHeader.substring(7)
}

/**
 * Verify Supabase auth token
 */
export async function verifyAuthToken(token: string): Promise<User> {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    throw APIErrors.INVALID_TOKEN()
  }

  return user
}
