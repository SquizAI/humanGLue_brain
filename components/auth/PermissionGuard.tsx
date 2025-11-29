/**
 * PermissionGuard Component
 *
 * Conditionally renders children based on user permissions.
 * Server-side component that checks permissions from database.
 */

import { createClient } from '@/lib/supabase/server'
import { hasPermission, getUserRole, type Permission } from '@/lib/permissions'

interface PermissionGuardProps {
  children: React.ReactNode
  /** Required permission to view content */
  permission?: Permission
  /** Required role(s) to view content */
  role?: string | string[]
  /** Fallback content when permission is denied */
  fallback?: React.ReactNode
  /** Show loading state */
  showLoading?: boolean
  /** Organization ID for org-scoped permissions */
  organizationId?: string
}

export async function PermissionGuard({
  children,
  permission,
  role,
  fallback = null,
  showLoading = false,
  organizationId,
}: PermissionGuardProps) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <>{fallback}</>
  }

  // Check role-based access
  if (role) {
    const userRole = await getUserRole(user.id)
    const requiredRoles = Array.isArray(role) ? role : [role]

    if (!userRole || !requiredRoles.includes(userRole)) {
      return <>{fallback}</>
    }
  }

  // Check permission-based access
  if (permission) {
    const hasAccess = await hasPermission(user.id, permission, organizationId)

    if (!hasAccess) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}

/**
 * Client-side permission check using session data
 * Use this for performance when permission data is already loaded
 */
export function ClientPermissionGuard({
  children,
  hasPermission: hasAccess,
  fallback = null,
}: {
  children: React.ReactNode
  hasPermission: boolean
  fallback?: React.ReactNode
}) {
  if (!hasAccess) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
