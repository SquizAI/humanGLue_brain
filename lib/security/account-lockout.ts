/**
 * Account Lockout Protection
 *
 * Prevents brute force attacks by locking accounts after repeated failed login attempts
 * Stores lockout state in memory (consider Redis/database for production clusters)
 */

import { NextResponse } from 'next/server'

interface LockoutEntry {
  attempts: number
  lockedUntil: number | null
  lastAttempt: number
}

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes
const ATTEMPT_WINDOW_MS = 30 * 60 * 1000 // 30 minutes - reset counter if no attempts in this time

// In-memory store for lockout tracking
// WARNING: This is lost on server restart. Use Redis/database for production.
class LockoutStore {
  private store: Map<string, LockoutEntry> = new Map()

  get(email: string): LockoutEntry | undefined {
    const key = email.toLowerCase()
    const entry = this.store.get(key)

    // Check if attempt window has expired (no attempts in 30 mins = reset)
    if (entry && entry.lockedUntil === null) {
      const timeSinceLastAttempt = Date.now() - entry.lastAttempt
      if (timeSinceLastAttempt > ATTEMPT_WINDOW_MS) {
        this.store.delete(key)
        return undefined
      }
    }

    return entry
  }

  set(email: string, entry: LockoutEntry): void {
    const key = email.toLowerCase()
    this.store.set(key, entry)
  }

  delete(email: string): void {
    const key = email.toLowerCase()
    this.store.delete(key)
  }

  // Cleanup expired lockouts every 5 minutes
  startCleanup(): void {
    setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of Array.from(this.store.entries())) {
        // Remove if lockout has expired
        if (entry.lockedUntil && now > entry.lockedUntil) {
          this.store.delete(key)
        }
        // Remove if no recent attempts
        if (!entry.lockedUntil && now - entry.lastAttempt > ATTEMPT_WINDOW_MS) {
          this.store.delete(key)
        }
      }
    }, 5 * 60 * 1000) // 5 minutes
  }
}

const lockoutStore = new LockoutStore()
lockoutStore.startCleanup()

/**
 * Check if account is currently locked
 */
export function isAccountLocked(email: string): { locked: boolean; remainingTime?: number } {
  const entry = lockoutStore.get(email)
  if (!entry || !entry.lockedUntil) {
    return { locked: false }
  }

  const now = Date.now()
  if (now < entry.lockedUntil) {
    const remainingTime = Math.ceil((entry.lockedUntil - now) / 1000) // seconds
    return { locked: true, remainingTime }
  }

  // Lock has expired, reset entry
  lockoutStore.delete(email)
  return { locked: false }
}

/**
 * Record a failed login attempt
 */
export function recordFailedAttempt(email: string): {
  locked: boolean
  attemptsRemaining: number
  lockedUntil?: number
} {
  const entry = lockoutStore.get(email)
  const now = Date.now()

  if (!entry) {
    // First failed attempt
    lockoutStore.set(email, {
      attempts: 1,
      lockedUntil: null,
      lastAttempt: now,
    })
    return {
      locked: false,
      attemptsRemaining: MAX_FAILED_ATTEMPTS - 1,
    }
  }

  // Increment attempt counter
  entry.attempts++
  entry.lastAttempt = now

  // Check if we should lock the account
  if (entry.attempts >= MAX_FAILED_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_DURATION_MS
    lockoutStore.set(email, entry)

    return {
      locked: true,
      attemptsRemaining: 0,
      lockedUntil: entry.lockedUntil,
    }
  }

  lockoutStore.set(email, entry)
  return {
    locked: false,
    attemptsRemaining: MAX_FAILED_ATTEMPTS - entry.attempts,
  }
}

/**
 * Reset failed attempt counter (call on successful login)
 */
export function resetFailedAttempts(email: string): void {
  lockoutStore.delete(email)
}

/**
 * Get current attempt count for an account
 */
export function getAttemptCount(email: string): number {
  const entry = lockoutStore.get(email)
  return entry?.attempts || 0
}

/**
 * Manually lock an account (e.g., for admin action)
 */
export function lockAccount(email: string, durationMs: number = LOCKOUT_DURATION_MS): void {
  const now = Date.now()
  lockoutStore.set(email, {
    attempts: MAX_FAILED_ATTEMPTS,
    lockedUntil: now + durationMs,
    lastAttempt: now,
  })
}

/**
 * Manually unlock an account (e.g., for admin action)
 */
export function unlockAccount(email: string): void {
  lockoutStore.delete(email)
}

/**
 * Check account lockout and return appropriate response if locked
 */
export function checkAccountLockout(email: string): { allowed: boolean; response?: NextResponse } {
  const { locked, remainingTime } = isAccountLocked(email)

  if (locked && remainingTime) {
    const minutes = Math.ceil(remainingTime / 60)
    return {
      allowed: false,
      response: NextResponse.json(
        {
          success: false,
          error: {
            code: 'ACCOUNT_LOCKED',
            message: `Account is temporarily locked due to too many failed login attempts. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`,
            lockedUntil: Date.now() + (remainingTime * 1000),
          },
        },
        { status: 423 } // 423 Locked
      ),
    }
  }

  return { allowed: true }
}

/**
 * Send account lockout notification email (placeholder - implement with your email service)
 */
export async function sendLockoutNotification(email: string, lockedUntil: number): Promise<void> {
  // TODO: Implement email notification
  console.warn(`Account locked: ${email} until ${new Date(lockedUntil).toISOString()}`)

  // Example implementation:
  // await sendEmail({
  //   to: email,
  //   subject: 'Account Security Alert - Account Locked',
  //   body: `Your account has been temporarily locked due to multiple failed login attempts...`
  // })
}
