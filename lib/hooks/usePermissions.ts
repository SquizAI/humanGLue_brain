/**
 * usePermissions Hook
 *
 * Client-side hook for checking user permissions.
 * Fetches permissions from API and caches them.
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

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

interface UserPermissions {
  can_access_financials: boolean
  can_manage_courses: boolean
  can_manage_users: boolean
  can_manage_organizations: boolean
  can_manage_experts: boolean
  can_manage_instructors: boolean
  can_view_analytics: boolean
  can_manage_payments: boolean
  can_manage_platform_settings: boolean
  role: UserRole | null
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchPermissions() {
      try {
        const supabase = createClient()

        // Get current user
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setPermissions(null)
          setLoading(false)
          return
        }

        // Get user's role from profiles
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError

        // Get user's permissions
        const { data: permData, error: permError } = await supabase
          .from('user_permissions')
          .select('*')
          .eq('user_id', user.id)
          .single()

        // If no permissions record exists (for non-admin users), use defaults
        const perms: UserPermissions = {
          can_access_financials: permData?.can_access_financials ?? false,
          can_manage_courses: permData?.can_manage_courses ?? false,
          can_manage_users: permData?.can_manage_users ?? false,
          can_manage_organizations: permData?.can_manage_organizations ?? false,
          can_manage_experts: permData?.can_manage_experts ?? false,
          can_manage_instructors: permData?.can_manage_instructors ?? false,
          can_view_analytics: permData?.can_view_analytics ?? false,
          can_manage_payments: permData?.can_manage_payments ?? false,
          can_manage_platform_settings: permData?.can_manage_platform_settings ?? false,
          role: profile?.role as UserRole || null,
        }

        setPermissions(perms)
        setLoading(false)
      } catch (err) {
        console.error('[usePermissions] Error fetching permissions:', err)
        setError(err instanceof Error ? err : new Error('Unknown error'))
        setLoading(false)
      }
    }

    fetchPermissions()
  }, [])

  return {
    permissions,
    loading,
    error,
    // Convenience methods
    canAccessFinancials: permissions?.can_access_financials ?? false,
    canManageCourses: permissions?.can_manage_courses ?? false,
    canManageUsers: permissions?.can_manage_users ?? false,
    canManageOrganizations: permissions?.can_manage_organizations ?? false,
    canManageExperts: permissions?.can_manage_experts ?? false,
    canManageInstructors: permissions?.can_manage_instructors ?? false,
    canViewAnalytics: permissions?.can_view_analytics ?? false,
    canManagePayments: permissions?.can_manage_payments ?? false,
    canManagePlatformSettings: permissions?.can_manage_platform_settings ?? false,
    isAdmin: permissions?.role === 'admin',
    isSuperAdmin: permissions?.role === 'super_admin_full' || permissions?.role === 'super_admin_courses',
    isSuperAdminFull: permissions?.role === 'super_admin_full',
    isSuperAdminCourses: permissions?.role === 'super_admin_courses',
    isOrgAdmin: permissions?.role === 'org_admin',
    role: permissions?.role,
  }
}

/**
 * Hook to check a specific permission
 */
export function useHasPermission(permission: Permission): boolean {
  const { permissions, loading } = usePermissions()

  if (loading || !permissions) return false

  const permissionMap: Record<Permission, keyof Omit<UserPermissions, 'role'>> = {
    financials: 'can_access_financials',
    courses: 'can_manage_courses',
    users: 'can_manage_users',
    organizations: 'can_manage_organizations',
    experts: 'can_manage_experts',
    instructors: 'can_manage_instructors',
    analytics: 'can_view_analytics',
    payments: 'can_manage_payments',
    platform_settings: 'can_manage_platform_settings',
  }

  return permissions[permissionMap[permission]] as boolean
}
