/**
 * Authentication Audit Logging
 *
 * Logs all authentication events for security monitoring and compliance
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export type AuthEventType =
  | 'login_success'
  | 'login_failed'
  | 'login_locked'
  | 'signup_success'
  | 'signup_failed'
  | 'logout'
  | 'password_reset_requested'
  | 'password_reset_success'
  | 'password_reset_failed'
  | 'password_changed'
  | 'email_verified'
  | 'session_expired'
  | 'account_locked'
  | 'account_unlocked'
  | 'suspicious_activity'
  | 'rate_limit_exceeded'

interface AuditLogEntry {
  userId?: string
  eventType: AuthEventType
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, any>
}

/**
 * Extract client information from request
 */
function extractClientInfo(request: NextRequest | Request): {
  ipAddress: string
  userAgent: string
} {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const userAgent = request.headers.get('user-agent') || 'Unknown'

  let ipAddress = 'unknown'
  if (forwardedFor) {
    ipAddress = forwardedFor.split(',')[0].trim()
  } else if (realIp) {
    ipAddress = realIp
  }

  return { ipAddress, userAgent }
}

/**
 * Log an authentication event
 */
export async function logAuthEvent(
  entry: AuditLogEntry,
  request?: NextRequest | Request
): Promise<void> {
  try {
    const supabase = await createClient()

    // Extract client info if request is provided
    let clientInfo = { ipAddress: 'unknown', userAgent: 'unknown' }
    if (request) {
      clientInfo = extractClientInfo(request)
    }

    // Merge client info with entry
    const logEntry = {
      user_id: entry.userId || null,
      event_type: entry.eventType,
      ip_address: entry.ipAddress || clientInfo.ipAddress,
      user_agent: entry.userAgent || clientInfo.userAgent,
      metadata: entry.metadata || {},
      created_at: new Date().toISOString(),
    }

    // Insert into audit log table
    const { error } = await supabase.from('auth_audit_log').insert(logEntry)

    if (error) {
      console.error('Failed to log auth event:', error)
      // Don't throw - logging failures shouldn't break auth flow
    }
  } catch (error) {
    console.error('Error in audit logging:', error)
    // Don't throw - logging failures shouldn't break auth flow
  }
}

/**
 * Log successful login
 */
export async function logLoginSuccess(
  userId: string,
  email: string,
  request?: NextRequest | Request
): Promise<void> {
  await logAuthEvent(
    {
      userId,
      eventType: 'login_success',
      metadata: { email },
    },
    request
  )
}

/**
 * Log failed login attempt
 */
export async function logLoginFailed(
  email: string,
  reason: string,
  request?: NextRequest | Request
): Promise<void> {
  await logAuthEvent(
    {
      eventType: 'login_failed',
      metadata: { email, reason },
    },
    request
  )
}

/**
 * Log account lockout
 */
export async function logAccountLocked(
  email: string,
  lockedUntil: number,
  request?: NextRequest | Request
): Promise<void> {
  await logAuthEvent(
    {
      eventType: 'account_locked',
      metadata: {
        email,
        lockedUntil: new Date(lockedUntil).toISOString(),
        reason: 'Too many failed login attempts',
      },
    },
    request
  )
}

/**
 * Log successful signup
 */
export async function logSignupSuccess(
  userId: string,
  email: string,
  role: string,
  request?: NextRequest | Request
): Promise<void> {
  await logAuthEvent(
    {
      userId,
      eventType: 'signup_success',
      metadata: { email, role },
    },
    request
  )
}

/**
 * Log failed signup attempt
 */
export async function logSignupFailed(
  email: string,
  reason: string,
  request?: NextRequest | Request
): Promise<void> {
  await logAuthEvent(
    {
      eventType: 'signup_failed',
      metadata: { email, reason },
    },
    request
  )
}

/**
 * Log logout
 */
export async function logLogout(userId: string, request?: NextRequest | Request): Promise<void> {
  await logAuthEvent(
    {
      userId,
      eventType: 'logout',
    },
    request
  )
}

/**
 * Log password reset request
 */
export async function logPasswordResetRequested(
  email: string,
  request?: NextRequest | Request
): Promise<void> {
  await logAuthEvent(
    {
      eventType: 'password_reset_requested',
      metadata: { email },
    },
    request
  )
}

/**
 * Log successful password reset
 */
export async function logPasswordResetSuccess(
  userId: string,
  email: string,
  request?: NextRequest | Request
): Promise<void> {
  await logAuthEvent(
    {
      userId,
      eventType: 'password_reset_success',
      metadata: { email },
    },
    request
  )
}

/**
 * Log password change
 */
export async function logPasswordChanged(
  userId: string,
  request?: NextRequest | Request
): Promise<void> {
  await logAuthEvent(
    {
      userId,
      eventType: 'password_changed',
    },
    request
  )
}

/**
 * Log email verification
 */
export async function logEmailVerified(
  userId: string,
  email: string,
  request?: NextRequest | Request
): Promise<void> {
  await logAuthEvent(
    {
      userId,
      eventType: 'email_verified',
      metadata: { email },
    },
    request
  )
}

/**
 * Log suspicious activity
 */
export async function logSuspiciousActivity(
  userId: string | undefined,
  description: string,
  metadata?: Record<string, any>,
  request?: NextRequest | Request
): Promise<void> {
  await logAuthEvent(
    {
      userId,
      eventType: 'suspicious_activity',
      metadata: { description, ...metadata },
    },
    request
  )
}

/**
 * Log rate limit exceeded
 */
export async function logRateLimitExceeded(
  endpoint: string,
  identifier: string,
  request?: NextRequest | Request
): Promise<void> {
  await logAuthEvent(
    {
      eventType: 'rate_limit_exceeded',
      metadata: { endpoint, identifier },
    },
    request
  )
}

/**
 * Query audit logs for a specific user
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 100
): Promise<any[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('auth_audit_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error querying audit logs:', error)
    return []
  }
}

/**
 * Query audit logs by event type
 */
export async function getAuditLogsByEventType(
  eventType: AuthEventType,
  limit: number = 100
): Promise<any[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('auth_audit_log')
      .select('*')
      .eq('event_type', eventType)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error querying audit logs:', error)
    return []
  }
}

/**
 * Get recent failed login attempts for security monitoring
 */
export async function getRecentFailedLogins(minutes: number = 60): Promise<any[]> {
  try {
    const supabase = await createClient()
    const since = new Date(Date.now() - minutes * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('auth_audit_log')
      .select('*')
      .eq('event_type', 'login_failed')
      .gte('created_at', since)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error querying failed logins:', error)
    return []
  }
}
