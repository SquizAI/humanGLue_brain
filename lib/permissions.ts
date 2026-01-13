/**
 * Permission Utilities
 *
 * Helper functions for checking user permissions based on the admin role hierarchy.
 * Supports granular permission checks for financial access, course management, etc.
 */

import { createClient } from '@/lib/supabase/server'

export type Permission =
  | 'financials'
  | 'courses'
  | 'users'
  | 'organizations'
  | 'experts'
  | 'instructors'
  | 'analytics'
  | 'payments'
  | 'platform_settings'

export type UserRole =
  | 'client'
  | 'instructor'
  | 'expert'
  | 'org_admin'
  | 'super_admin_courses'
  | 'super_admin_full'
  | 'admin'

export interface UserPermissions {
  can_access_financials: boolean
  can_manage_courses: boolean
  can_manage_users: boolean
  can_manage_organizations: boolean
  can_manage_experts: boolean
  can_manage_instructors: boolean
  can_view_analytics: boolean
  can_manage_payments: boolean
  can_manage_platform_settings: boolean
  organization_id: string | null
}

/**
 * Check if a user has a specific permission
 * @param userId - The user's ID
 * @param permission - The permission to check
 * @param organizationId - Optional organization context
 * @returns Boolean indicating if user has the permission
 */
export async function hasPermission(
  userId: string,
  permission: Permission,
  organizationId?: string
): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('has_permission', {
    p_user_id: userId,
    p_permission: permission,
    p_organization_id: organizationId || null,
  })

  if (error) {
    console.error('[Permissions] Error checking permission:', error)
    return false
  }

  return data === true
}

/**
 * Get all permissions for a user
 * @param userId - The user's ID
 * @returns Array of permissions with their access status
 */
export async function getUserPermissions(userId: string): Promise<
  Array<{
    permission_name: string
    has_access: boolean
    organization_id: string | null
    organization_name: string | null
  }>
> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_user_permissions', {
    p_user_id: userId,
  })

  if (error) {
    console.error('[Permissions] Error fetching user permissions:', error)
    return []
  }

  return data || []
}

/**
 * Get user's role from profiles table
 * @param userId - The user's ID
 * @returns User's role or null
 */
export async function getUserRole(userId: string): Promise<UserRole | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('[Permissions] Error fetching user role:', error)
    return null
  }

  return (data?.role as UserRole) || null
}

/**
 * Check if user is any type of admin (including super admins)
 * @param userId - The user's ID
 * @returns Boolean indicating if user is an admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId)
  return role === 'admin' || role === 'super_admin_full' || role === 'super_admin_courses'
}

/**
 * Check if user is a platform admin (HMN admin only)
 * @param userId - The user's ID
 * @returns Boolean indicating if user is a platform admin
 */
export async function isPlatformAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId)
  return role === 'admin'
}

/**
 * Check if user has full admin access (including financials)
 * @param userId - The user's ID
 * @returns Boolean indicating if user has full admin access
 */
export async function hasFullAdminAccess(userId: string): Promise<boolean> {
  const role = await getUserRole(userId)
  return role === 'admin' || role === 'super_admin_full'
}

/**
 * Check if user can manage courses
 * @param userId - The user's ID
 * @returns Boolean indicating if user can manage courses
 */
export async function canManageCourses(userId: string): Promise<boolean> {
  const role = await getUserRole(userId)
  if (role === 'admin' || role === 'super_admin_full' || role === 'super_admin_courses') {
    return true
  }
  return hasPermission(userId, 'courses')
}

/**
 * Check if user can access financials
 * @param userId - The user's ID
 * @param organizationId - Optional organization context
 * @returns Boolean indicating if user can access financials
 */
export async function canAccessFinancials(
  userId: string,
  organizationId?: string
): Promise<boolean> {
  const role = await getUserRole(userId)
  // Super admin courses explicitly cannot access financials
  if (role === 'super_admin_courses') {
    return false
  }
  // Platform admin and super admin full have financial access
  if (role === 'admin' || role === 'super_admin_full') {
    return true
  }
  // Check granular permissions for org admins
  return hasPermission(userId, 'financials', organizationId)
}

/**
 * Get display name for user role
 * @param role - The user's role
 * @returns Human-readable role name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    client: 'Client',
    instructor: 'Instructor',
    expert: 'Expert',
    org_admin: 'Organization Admin',
    super_admin_courses: 'Super Admin (Courses)',
    super_admin_full: 'Super Admin (Full Access)',
    admin: 'HMN Admin',
  }
  return roleNames[role] || role
}

/**
 * Check if user can manage a specific resource type
 * @param userId - The user's ID
 * @param resourceType - The type of resource (users, experts, instructors, etc.)
 * @returns Boolean indicating if user can manage the resource
 */
export async function canManageResource(
  userId: string,
  resourceType: 'users' | 'organizations' | 'experts' | 'instructors'
): Promise<boolean> {
  const role = await getUserRole(userId)

  // Platform admin can manage everything
  if (role === 'admin') {
    return true
  }

  // Super admin full can manage most things (except platform settings)
  if (role === 'super_admin_full') {
    return true
  }

  // Super admin courses can manage experts and instructors
  if (role === 'super_admin_courses') {
    return resourceType === 'experts' || resourceType === 'instructors' || resourceType === 'users'
  }

  // Check granular permissions
  return hasPermission(userId, resourceType)
}
