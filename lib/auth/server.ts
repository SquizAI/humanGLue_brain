/**
 * Server-side Authentication Helpers
 * For use in API routes, Server Components, and Server Actions
 */

import { createClient } from '@/lib/supabase/server'
import { User } from '@supabase/supabase-js'

export class AuthError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.name = 'AuthError'
  }
}

export interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  role: 'admin' | 'org_admin' | 'team_lead' | 'member'
  organization_id?: string
  is_instructor: boolean
  created_at: string
}

/**
 * Get current session server-side
 * Returns null if no session
 */
export async function getSession() {
  const supabase = createClient()
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    throw new AuthError('Failed to get session', 500)
  }

  return session
}

/**
 * Get current user server-side
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<{ user: User; profile: UserProfile } | null> {
  const supabase = createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return null
  }

  // Fetch user profile from database
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) {
    throw new AuthError('Failed to fetch user profile', 500)
  }

  // Check if user has instructor profile
  const { data: instructorProfile } = await supabase
    .from('instructor_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const userProfile: UserProfile = {
    ...profile,
    is_instructor: !!instructorProfile,
  }

  return { user, profile: userProfile }
}

/**
 * Require authenticated user
 * Throws AuthError if not authenticated
 */
export async function requireAuth(): Promise<{ user: User; profile: UserProfile }> {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    throw new AuthError('Authentication required', 401)
  }

  return currentUser
}

/**
 * Require specific role
 * Throws AuthError if not authenticated or doesn't have required role
 */
export async function requireRole(
  allowedRoles: Array<'admin' | 'instructor' | 'client'>
): Promise<{ user: User; profile: UserProfile; role: 'admin' | 'instructor' | 'client' }> {
  const { user, profile } = await requireAuth()

  // Map database role to application role
  let appRole: 'admin' | 'instructor' | 'client'
  if (profile.role === 'admin') {
    appRole = 'admin'
  } else if (profile.is_instructor) {
    appRole = 'instructor'
  } else {
    appRole = 'client'
  }

  if (!allowedRoles.includes(appRole)) {
    throw new AuthError('Insufficient permissions', 403)
  }

  return { user, profile, role: appRole }
}

/**
 * Require admin role
 */
export async function requireAdmin() {
  return requireRole(['admin'])
}

/**
 * Require instructor role (or admin)
 */
export async function requireInstructor() {
  return requireRole(['admin', 'instructor'])
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const currentUser = await getCurrentUser()
  return currentUser?.profile.role === 'admin'
}

/**
 * Check if user is instructor
 */
export async function isInstructor(): Promise<boolean> {
  const currentUser = await getCurrentUser()
  return currentUser?.profile.is_instructor === true
}

/**
 * Check if user is client
 */
export async function isClient(): Promise<boolean> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return false
  return currentUser.profile.role !== 'admin' && !currentUser.profile.is_instructor
}
