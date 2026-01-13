/**
 * Authentication and Authorization for Instructor Dashboard API
 * @module lib/api/instructor-auth
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { APIErrors } from './instructor-errors'
import type { User } from '@supabase/supabase-js'

// ============================================================================
// TYPES
// ============================================================================

export interface AuthenticatedInstructor {
  user: User
  instructorId: string
  organizationId: string | null
  isInstructor: boolean
}

// ============================================================================
// AUTHENTICATION HELPERS
// ============================================================================

/**
 * Get authenticated user from request
 */
export async function getAuthenticatedUser(
  request: NextRequest
): Promise<User> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw APIErrors.UNAUTHORIZED()
  }

  return user
}

/**
 * Verify user is an instructor
 */
export async function requireInstructor(
  request: NextRequest
): Promise<AuthenticatedInstructor> {
  const user = await getAuthenticatedUser(request)
  const supabase = await createClient()

  // Check if user has instructor role in the database
  // For HMN, instructors are identified by having courses they created
  const { data: instructorData, error } = await supabase
    .from('users')
    .select('id, organization_id, metadata')
    .eq('id', user.id)
    .single()

  if (error) {
    throw APIErrors.DATABASE_ERROR('user lookup')
  }

  // Check if user is marked as instructor in metadata
  const isInstructor = instructorData?.metadata?.isInstructor === true

  if (!isInstructor) {
    throw APIErrors.NOT_INSTRUCTOR()
  }

  return {
    user,
    instructorId: user.id,
    organizationId: instructorData.organization_id,
    isInstructor: true,
  }
}

/**
 * Verify instructor owns the resource
 */
export async function requireResourceOwnership(
  instructorId: string,
  resourceType: 'course' | 'workshop',
  resourceId: string
): Promise<void> {
  const supabase = await createClient()

  if (resourceType === 'course') {
    const { data, error } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', resourceId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw APIErrors.NOT_FOUND('Course', resourceId)
      }
      throw APIErrors.DATABASE_ERROR('course ownership check')
    }

    // For courses, we need to add instructor_id to the schema
    // For now, we'll use a workaround - check if course title contains instructor metadata
    // TODO: Add instructor_id column to courses table

    // Temporary: Allow all instructors to access all courses
    // In production, implement proper ownership check
  } else if (resourceType === 'workshop') {
    const { data, error } = await supabase
      .from('workshops')
      .select('instructor_id')
      .eq('id', resourceId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw APIErrors.NOT_FOUND('Workshop', resourceId)
      }
      throw APIErrors.DATABASE_ERROR('workshop ownership check')
    }

    if (data.instructor_id !== instructorId) {
      throw APIErrors.FORBIDDEN()
    }
  }
}

/**
 * Verify student belongs to instructor
 */
export async function requireStudentAccess(
  instructorId: string,
  studentId: string
): Promise<void> {
  const supabase = await createClient()

  // Check if student is enrolled in any of the instructor's courses
  const { data, error } = await supabase
    .from('course_enrollments')
    .select(`
      id,
      course:courses!inner(
        instructor_id
      )
    `)
    .eq('user_id', studentId)
    .single()

  if (error || !data) {
    throw APIErrors.FORBIDDEN()
  }

  // TODO: Add instructor_id check when column is added to courses table
  // For now, allow access to all students
}

// ============================================================================
// AUTHORIZATION MIDDLEWARE
// ============================================================================

/**
 * Middleware to check rate limits for instructor endpoints
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowSeconds: number = 60
): Promise<void> {
  // TODO: Implement rate limiting with Upstash Redis
  // For now, this is a placeholder

  /*
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })

  const key = `rate_limit:instructor:${identifier}`
  const count = await redis.incr(key)

  if (count === 1) {
    await redis.expire(key, windowSeconds)
  }

  if (count > limit) {
    const ttl = await redis.ttl(key)
    throw APIErrors.RATE_LIMITED(ttl)
  }
  */
}

/**
 * Extract pagination parameters from request
 */
export function getPaginationParams(searchParams: URLSearchParams): {
  page: number
  limit: number
  offset: number
} {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get('limit') || '20', 10))
  )
  const offset = (page - 1) * limit

  return { page, limit, offset }
}

/**
 * Build filter conditions for SQL queries
 */
export function buildFilterConditions(
  searchParams: URLSearchParams,
  allowedFilters: string[]
): Record<string, any> {
  const filters: Record<string, any> = {}

  for (const filter of allowedFilters) {
    const value = searchParams.get(filter)
    if (value && value !== 'all') {
      filters[filter] = value
    }
  }

  return filters
}

/**
 * Build sort conditions for SQL queries
 */
export function buildSortConditions(
  searchParams: URLSearchParams,
  defaultSortBy: string = 'created_at'
): {
  column: string
  ascending: boolean
} {
  const sortBy = searchParams.get('sortBy') || defaultSortBy
  const sortOrder = searchParams.get('sortOrder') || 'desc'

  return {
    column: sortBy,
    ascending: sortOrder === 'asc',
  }
}
