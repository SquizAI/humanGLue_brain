/**
 * Admin Utilities Library
 *
 * Shared utilities for admin operations including:
 * - Cryptographically secure password generation
 * - Admin verification helpers
 * - Role hierarchy management
 * - Email validation
 *
 * @module lib/admin/utils
 */

import crypto from 'crypto'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { APIErrors } from '@/lib/api/errors'

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Result of organization admin verification
 */
export interface OrgAdminVerificationResult {
  /** The authenticated user */
  user: User
  /** The user's organization ID, if any */
  organizationId: string | null
}

/**
 * Valid role names in the system
 */
export type RoleName =
  | 'humanglue_admin'
  | 'super_admin_full'
  | 'super_admin_courses'
  | 'admin'
  | 'org_admin'
  | 'instructor'
  | 'expert'
  | 'team_lead'
  | 'client'
  | 'member'

/**
 * Password generation options
 */
export interface PasswordOptions {
  /** Include uppercase letters (default: true) */
  includeUppercase?: boolean
  /** Include lowercase letters (default: true) */
  includeLowercase?: boolean
  /** Include numbers (default: true) */
  includeNumbers?: boolean
  /** Include special characters (default: true) */
  includeSpecial?: boolean
  /** Custom character set to use (overrides other options) */
  customCharset?: string
}

// =============================================================================
// ROLE HIERARCHY
// =============================================================================

/**
 * Role hierarchy with numeric values indicating permission levels.
 * Higher values indicate more privileges.
 *
 * @example
 * ```typescript
 * // Check if a role has higher privileges
 * if (ROLE_HIERARCHY['super_admin_full'] > ROLE_HIERARCHY['org_admin']) {
 *   console.log('Super admin has higher privileges')
 * }
 * ```
 */
export const ROLE_HIERARCHY: Record<string, number> = {
  humanglue_admin: 100,      // Platform owner - full control
  super_admin_full: 90,      // Full super admin access including financials
  admin: 85,                 // Legacy admin role - broad access
  super_admin_courses: 80,   // Super admin for course management only
  org_admin: 70,             // Organization administrator
  instructor: 60,            // Course instructor
  expert: 50,                // Subject matter expert
  team_lead: 40,             // Team leader within organization
  client: 30,                // External client with limited access
  member: 20,                // Basic member access
} as const

/**
 * List of all admin-level roles that can manage users
 */
export const ADMIN_ROLES: RoleName[] = [
  'humanglue_admin',
  'super_admin_full',
  'super_admin_courses',
  'admin',
  'org_admin',
]

/**
 * Roles that have full platform access (can bypass most restrictions)
 */
export const PLATFORM_ADMIN_ROLES: RoleName[] = [
  'humanglue_admin',
  'super_admin_full',
  'admin',
]

// =============================================================================
// CRYPTO-SECURE PASSWORD GENERATION
// =============================================================================

/**
 * Character sets for password generation
 */
const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  special: '!@#$%^&*',
} as const

/**
 * Generates a cryptographically secure random password.
 *
 * Uses Node.js crypto.randomBytes() for true cryptographic randomness,
 * replacing the insecure Math.random() approach.
 *
 * @param length - Password length (default: 12, minimum: 8, maximum: 128)
 * @param options - Password generation options
 * @returns A cryptographically secure random password
 *
 * @example
 * ```typescript
 * // Generate a 12-character password with default settings
 * const password = generateSecurePassword()
 *
 * // Generate a 16-character password
 * const strongPassword = generateSecurePassword(16)
 *
 * // Generate a password without special characters
 * const simplePassword = generateSecurePassword(12, { includeSpecial: false })
 *
 * // Generate a password with custom charset
 * const customPassword = generateSecurePassword(8, { customCharset: 'ABC123' })
 * ```
 *
 * @throws Error if length is less than 8 or greater than 128
 */
export function generateSecurePassword(
  length: number = 12,
  options: PasswordOptions = {}
): string {
  // Validate length
  if (length < 8) {
    throw new Error('Password length must be at least 8 characters for security')
  }
  if (length > 128) {
    throw new Error('Password length must not exceed 128 characters')
  }

  const {
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSpecial = true,
    customCharset,
  } = options

  // Build character set
  let charset = customCharset
  if (!charset) {
    charset = ''
    if (includeUppercase) charset += CHAR_SETS.uppercase
    if (includeLowercase) charset += CHAR_SETS.lowercase
    if (includeNumbers) charset += CHAR_SETS.numbers
    if (includeSpecial) charset += CHAR_SETS.special

    if (charset.length === 0) {
      throw new Error('At least one character type must be enabled')
    }
  }

  const charsetLength = charset.length

  // Generate cryptographically secure random bytes
  // We need more bytes than the password length to ensure uniform distribution
  // Using rejection sampling to avoid modulo bias
  const randomBytes = crypto.randomBytes(length * 2)
  let password = ''
  let byteIndex = 0

  while (password.length < length) {
    if (byteIndex >= randomBytes.length) {
      // If we run out of bytes (unlikely), generate more
      const moreBytes = crypto.randomBytes(length)
      for (let i = 0; i < moreBytes.length && password.length < length; i++) {
        const randomValue = moreBytes[i]
        // Rejection sampling: only use values that don't cause modulo bias
        if (randomValue < Math.floor(256 / charsetLength) * charsetLength) {
          password += charset[randomValue % charsetLength]
        }
      }
    } else {
      const randomValue = randomBytes[byteIndex++]
      // Rejection sampling to avoid modulo bias
      if (randomValue < Math.floor(256 / charsetLength) * charsetLength) {
        password += charset[randomValue % charsetLength]
      }
    }
  }

  // Ensure password meets complexity requirements if using default charset
  if (!customCharset && includeUppercase && includeLowercase && includeNumbers && includeSpecial) {
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[!@#$%^&*]/.test(password)

    // If missing any required character type, regenerate
    // This is a simple approach; for production, consider inserting required chars
    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      return generateSecurePassword(length, options)
    }
  }

  return password
}

// =============================================================================
// ADMIN VERIFICATION HELPERS
// =============================================================================

/**
 * Verifies that the current user is an authenticated admin.
 *
 * Checks user_roles table for any admin role (admin, super_admin_full,
 * super_admin_courses, org_admin, humanglue_admin) that is not expired.
 *
 * @param supabase - Supabase client instance
 * @returns The authenticated user if they have admin privileges
 *
 * @throws APIError with code UNAUTHORIZED if user is not logged in
 * @throws APIError with code FORBIDDEN if user is not an admin
 *
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const supabase = await createClient()
 *   try {
 *     const adminUser = await verifyAdmin(supabase)
 *     // User is verified as admin, proceed with operation
 *     console.log('Admin verified:', adminUser.id)
 *   } catch (error) {
 *     // Handle auth/permission error
 *   }
 * }
 * ```
 */
export async function verifyAdmin(supabase: SupabaseClient): Promise<User> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw APIErrors.UNAUTHORIZED('You must be logged in')
  }

  // Check for any admin role that is not expired
  const { data: adminRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .in('role', ADMIN_ROLES)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

  if (rolesError) {
    console.error('[Admin Utils] Error checking admin roles:', rolesError)
    throw APIErrors.INTERNAL_ERROR('Failed to verify admin status')
  }

  if (!adminRoles || adminRoles.length === 0) {
    throw APIErrors.FORBIDDEN('Admin access required')
  }

  return user
}

/**
 * Verifies that the current user is an admin and retrieves their organization context.
 *
 * This is useful for org-scoped operations where you need both admin verification
 * and the user's organization ID for filtering data.
 *
 * @param supabase - Supabase client instance
 * @returns Object containing the user and their organization ID
 *
 * @throws APIError with code UNAUTHORIZED if user is not logged in
 * @throws APIError with code FORBIDDEN if user is not an admin
 * @throws APIError with code NOT_FOUND if user profile doesn't exist
 *
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const supabase = await createClient()
 *   try {
 *     const { user, organizationId } = await verifyOrgAdmin(supabase)
 *
 *     // Fetch organization-scoped data
 *     const { data } = await supabase
 *       .from('resources')
 *       .select('*')
 *       .eq('organization_id', organizationId)
 *   } catch (error) {
 *     // Handle auth/permission error
 *   }
 * }
 * ```
 */
export async function verifyOrgAdmin(
  supabase: SupabaseClient
): Promise<OrgAdminVerificationResult> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw APIErrors.UNAUTHORIZED('You must be logged in')
  }

  // Get user profile with organization and role info
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('organization_id, role')
    .eq('id', user.id)
    .single()

  if (userError || !userData) {
    throw APIErrors.NOT_FOUND('User profile')
  }

  // Check for any admin role in user_roles table
  const { data: adminRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .in('role', ADMIN_ROLES)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)

  if (rolesError) {
    console.error('[Admin Utils] Error checking admin roles:', rolesError)
    throw APIErrors.INTERNAL_ERROR('Failed to verify admin status')
  }

  // Also check legacy role field in users table
  const hasLegacyAdminRole = ADMIN_ROLES.includes(userData.role as RoleName)

  if ((!adminRoles || adminRoles.length === 0) && !hasLegacyAdminRole) {
    throw APIErrors.FORBIDDEN('Admin access required')
  }

  return {
    user,
    organizationId: userData.organization_id,
  }
}

// =============================================================================
// ROLE HIERARCHY HELPERS
// =============================================================================

/**
 * Determines if a user with the given roles can assign a target role to another user.
 *
 * A user can only assign roles that are lower in the hierarchy than their highest role.
 * This prevents privilege escalation attacks.
 *
 * @param assignerRoles - Array of role names the assigner has
 * @param targetRole - The role to be assigned
 * @returns true if the assigner can assign the target role
 *
 * @example
 * ```typescript
 * // Super admin can assign org_admin role
 * canAssignRole(['super_admin_full'], 'org_admin') // true
 *
 * // Org admin cannot assign super_admin role
 * canAssignRole(['org_admin'], 'super_admin_full') // false
 *
 * // User with multiple roles uses highest for comparison
 * canAssignRole(['instructor', 'org_admin'], 'expert') // true (org_admin is highest)
 *
 * // Cannot assign role equal to own level
 * canAssignRole(['org_admin'], 'org_admin') // false
 * ```
 */
export function canAssignRole(assignerRoles: string[], targetRole: string): boolean {
  if (!assignerRoles || assignerRoles.length === 0) {
    return false
  }

  if (!targetRole || !(targetRole in ROLE_HIERARCHY)) {
    return false
  }

  const highestAssignerRole = getHighestRole(assignerRoles)
  if (!highestAssignerRole) {
    return false
  }

  const assignerLevel = ROLE_HIERARCHY[highestAssignerRole]
  const targetLevel = ROLE_HIERARCHY[targetRole]

  // Assigner must have strictly higher level than target role
  return assignerLevel > targetLevel
}

/**
 * Gets the highest-privileged role from an array of role names.
 *
 * @param roles - Array of role names to evaluate
 * @returns The role name with the highest privilege level, or null if no valid roles
 *
 * @example
 * ```typescript
 * // Returns the highest role
 * getHighestRole(['member', 'instructor', 'org_admin']) // 'org_admin'
 *
 * // Single role
 * getHighestRole(['expert']) // 'expert'
 *
 * // Invalid or empty input
 * getHighestRole([]) // null
 * getHighestRole(['unknown_role']) // null
 * ```
 */
export function getHighestRole(roles: string[]): string | null {
  if (!roles || roles.length === 0) {
    return null
  }

  let highestRole: string | null = null
  let highestLevel = -1

  for (const role of roles) {
    if (role in ROLE_HIERARCHY) {
      const level = ROLE_HIERARCHY[role]
      if (level > highestLevel) {
        highestLevel = level
        highestRole = role
      }
    }
  }

  return highestRole
}

/**
 * Gets the privilege level of a role.
 *
 * @param role - The role name to check
 * @returns The numeric privilege level, or 0 if role is not recognized
 *
 * @example
 * ```typescript
 * getRoleLevel('super_admin_full') // 90
 * getRoleLevel('member') // 20
 * getRoleLevel('unknown') // 0
 * ```
 */
export function getRoleLevel(role: string): number {
  return ROLE_HIERARCHY[role] ?? 0
}

/**
 * Checks if a user has at least one of the specified roles.
 *
 * @param userRoles - Array of roles the user has
 * @param requiredRoles - Array of roles to check for
 * @returns true if user has at least one of the required roles
 *
 * @example
 * ```typescript
 * hasAnyRole(['instructor', 'expert'], ['admin', 'instructor']) // true
 * hasAnyRole(['member'], ['admin', 'org_admin']) // false
 * ```
 */
export function hasAnyRole(userRoles: string[], requiredRoles: string[]): boolean {
  if (!userRoles || !requiredRoles) {
    return false
  }
  return userRoles.some(role => requiredRoles.includes(role))
}

/**
 * Checks if a user has all of the specified roles.
 *
 * @param userRoles - Array of roles the user has
 * @param requiredRoles - Array of roles to check for
 * @returns true if user has all of the required roles
 *
 * @example
 * ```typescript
 * hasAllRoles(['instructor', 'expert', 'team_lead'], ['instructor', 'expert']) // true
 * hasAllRoles(['instructor'], ['instructor', 'expert']) // false
 * ```
 */
export function hasAllRoles(userRoles: string[], requiredRoles: string[]): boolean {
  if (!userRoles || !requiredRoles) {
    return false
  }
  return requiredRoles.every(role => userRoles.includes(role))
}

/**
 * Checks if a user's highest role meets a minimum level requirement.
 *
 * @param userRoles - Array of roles the user has
 * @param minimumRole - The minimum role level required
 * @returns true if user's highest role is >= the minimum level
 *
 * @example
 * ```typescript
 * hasMinimumRoleLevel(['org_admin', 'instructor'], 'instructor') // true (org_admin >= instructor)
 * hasMinimumRoleLevel(['member'], 'instructor') // false (member < instructor)
 * ```
 */
export function hasMinimumRoleLevel(userRoles: string[], minimumRole: string): boolean {
  const highestRole = getHighestRole(userRoles)
  if (!highestRole || !(minimumRole in ROLE_HIERARCHY)) {
    return false
  }

  return ROLE_HIERARCHY[highestRole] >= ROLE_HIERARCHY[minimumRole]
}

// =============================================================================
// EMAIL VALIDATION
// =============================================================================

/**
 * Validates an email address using a comprehensive regex pattern.
 *
 * This validation is more robust than a simple pattern, checking for:
 * - Valid local part (before @)
 * - Valid domain with proper TLD
 * - Reasonable length constraints
 * - Common edge cases
 *
 * Note: For complete validation, consider also checking MX records
 * or using a verification service.
 *
 * @param email - The email address to validate
 * @returns true if the email appears to be valid
 *
 * @example
 * ```typescript
 * isValidEmail('user@example.com') // true
 * isValidEmail('user.name+tag@example.co.uk') // true
 * isValidEmail('invalid') // false
 * isValidEmail('user@') // false
 * isValidEmail('@example.com') // false
 * isValidEmail('user@example') // false (no TLD)
 * isValidEmail('user @example.com') // false (contains space)
 * ```
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }

  // Trim and check length
  const trimmed = email.trim()
  if (trimmed.length === 0 || trimmed.length > 254) {
    return false
  }

  // Check for spaces
  if (/\s/.test(trimmed)) {
    return false
  }

  // Comprehensive email regex pattern
  // Based on RFC 5322 with practical modifications
  const emailRegex = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i

  if (!emailRegex.test(trimmed)) {
    return false
  }

  // Additional checks
  const [localPart, domain] = trimmed.split('@')

  // Local part should not exceed 64 characters
  if (!localPart || localPart.length > 64) {
    return false
  }

  // Domain should have at least one dot (for TLD)
  if (!domain || !domain.includes('.')) {
    return false
  }

  // TLD should be at least 2 characters
  const tld = domain.split('.').pop()
  if (!tld || tld.length < 2) {
    return false
  }

  // Domain parts should not start or end with hyphens
  const domainParts = domain.split('.')
  for (const part of domainParts) {
    if (part.startsWith('-') || part.endsWith('-')) {
      return false
    }
    // Each domain part should be at most 63 characters
    if (part.length > 63) {
      return false
    }
  }

  return true
}

/**
 * Normalizes an email address for comparison.
 *
 * - Converts to lowercase
 * - Trims whitespace
 * - For Gmail addresses, removes dots from local part and +tags
 *
 * @param email - The email address to normalize
 * @returns The normalized email address
 *
 * @example
 * ```typescript
 * normalizeEmail('User@Example.COM') // 'user@example.com'
 * normalizeEmail('  user@example.com  ') // 'user@example.com'
 * normalizeEmail('user.name+tag@gmail.com') // 'username@gmail.com'
 * ```
 */
export function normalizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return ''
  }

  let normalized = email.trim().toLowerCase()

  // Handle Gmail-specific normalization
  const atIndex = normalized.indexOf('@')
  if (atIndex === -1) return normalized

  const localPart = normalized.substring(0, atIndex)
  const domain = normalized.substring(atIndex + 1)

  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    // Remove dots and +tags from Gmail addresses
    let cleanLocal = localPart.replace(/\./g, '')
    const plusIndex = cleanLocal.indexOf('+')
    if (plusIndex > 0) {
      cleanLocal = cleanLocal.substring(0, plusIndex)
    }
    normalized = `${cleanLocal}@gmail.com`
  }

  return normalized
}

// =============================================================================
// ADDITIONAL TYPE DEFINITIONS
// =============================================================================

/**
 * Union type for all valid user roles
 */
export type UserRole = RoleName

/**
 * Admin user context returned from verification
 */
export interface AdminUser {
  id: string
  email: string
  role: UserRole
  organizationId?: string | null
}

// =============================================================================
// ADDITIONAL UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if a role string is a valid role
 */
export function isValidRole(role: string): role is UserRole {
  return role in ROLE_HIERARCHY
}

/**
 * Sanitize a string by trimming and limiting length
 */
export function sanitizeString(
  input: string | undefined | null,
  maxLength: number = 255
): string {
  if (!input || typeof input !== 'string') {
    return ''
  }
  return input.trim().slice(0, maxLength)
}

// =============================================================================
// AUDIT LOGGING
// =============================================================================

/**
 * Audit log entry structure
 */
export interface AuditLogEntry {
  userId: string
  action: string
  targetType?: string      // 'user', 'role', 'organization', 'course', etc.
  targetId?: string        // UUID of the target entity
  targetUserId?: string    // Backwards compatibility - maps to targetId with targetType='user'
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

/**
 * Log an admin action to the audit log
 * Supports both new schema (targetType/targetId) and legacy (targetUserId)
 */
export async function logAuditAction(entry: AuditLogEntry): Promise<void> {
  try {
    // Dynamic import to avoid circular dependency
    const { createAdminClient } = await import('@/lib/supabase/server')
    const supabaseAdmin = await createAdminClient()

    // Support backwards compatibility: targetUserId maps to targetId with targetType='user'
    const targetType = entry.targetType || (entry.targetUserId ? 'user' : null)
    const targetId = entry.targetId || entry.targetUserId || null

    const { error } = await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: entry.userId,
        action: entry.action,
        target_type: targetType,
        target_id: targetId,
        details: entry.details ?? {},
        ip_address: entry.ipAddress,
        user_agent: entry.userAgent,
        created_at: new Date().toISOString(),
      })

    if (error) {
      // Log error but don't throw - audit logging should not block operations
      console.error('[Audit Log] Failed to log action:', error)
    }
  } catch (error) {
    console.error('[Audit Log] Error:', error)
  }
}

/**
 * Log a role change event
 */
export async function logRoleChange(entry: {
  userId: string
  changedBy: string
  previousRole?: string
  newRole: string
  organizationId?: string
  reason?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
}): Promise<void> {
  try {
    const { createAdminClient } = await import('@/lib/supabase/server')
    const supabaseAdmin = await createAdminClient()

    const { error } = await supabaseAdmin
      .from('role_change_history')
      .insert({
        user_id: entry.userId,
        changed_by: entry.changedBy,
        previous_role: entry.previousRole || null,
        new_role: entry.newRole,
        organization_id: entry.organizationId || null,
        reason: entry.reason || null,
        metadata: entry.metadata || {},
        ip_address: entry.ipAddress || null,
      })

    if (error) {
      console.error('[Audit Log] Failed to log role change:', error)
    }

    // Also log to main audit_logs table
    await logAuditAction({
      userId: entry.changedBy,
      action: 'role.change',
      targetType: 'user',
      targetId: entry.userId,
      details: {
        previous_role: entry.previousRole,
        new_role: entry.newRole,
        organization_id: entry.organizationId,
        reason: entry.reason,
      },
      ipAddress: entry.ipAddress,
    })
  } catch (error) {
    console.error('[Audit Log] Error logging role change:', error)
  }
}

/**
 * Log a login attempt
 */
export async function logLoginAttempt(entry: {
  userId: string
  success: boolean
  ipAddress?: string
  userAgent?: string
  failureReason?: string
  location?: Record<string, unknown>
  deviceInfo?: Record<string, unknown>
}): Promise<void> {
  try {
    const { createAdminClient } = await import('@/lib/supabase/server')
    const supabaseAdmin = await createAdminClient()

    const { error } = await supabaseAdmin
      .from('login_history')
      .insert({
        user_id: entry.userId,
        success: entry.success,
        ip_address: entry.ipAddress || null,
        user_agent: entry.userAgent || null,
        failure_reason: entry.failureReason || null,
        location: entry.location || {},
        device_info: entry.deviceInfo || {},
      })

    if (error) {
      console.error('[Audit Log] Failed to log login attempt:', error)
    }

    // Log failed attempts to main audit_logs too
    if (!entry.success) {
      await logAuditAction({
        userId: entry.userId,
        action: 'auth.login_failed',
        targetType: 'user',
        targetId: entry.userId,
        details: {
          reason: entry.failureReason,
          ip_address: entry.ipAddress,
        },
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
      })
    }
  } catch (error) {
    console.error('[Audit Log] Error logging login attempt:', error)
  }
}
