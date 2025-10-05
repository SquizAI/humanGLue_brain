/**
 * Error Handling Utilities for Instructor Dashboard API
 * @module lib/api/instructor-errors
 */

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

// ============================================================================
// ERROR CODES
// ============================================================================

export enum ErrorCode {
  // Authentication
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  NOT_INSTRUCTOR = 'NOT_INSTRUCTOR',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Resources
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',

  // Business Logic
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  CAPACITY_EXCEEDED = 'CAPACITY_EXCEEDED',
  INVALID_STATUS = 'INVALID_STATUS',
  WORKSHOP_FULL = 'WORKSHOP_FULL',
  COURSE_NOT_PUBLISHED = 'COURSE_NOT_PUBLISHED',

  // Server
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // File Operations
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
}

// ============================================================================
// API ERROR CLASS
// ============================================================================

export class APIError extends Error {
  code: ErrorCode
  statusCode: number
  details?: unknown

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number,
    details?: unknown
  ) {
    super(message)
    this.code = code
    this.statusCode = statusCode
    this.details = details
    this.name = 'APIError'
  }
}

// ============================================================================
// PREDEFINED ERRORS
// ============================================================================

export const APIErrors = {
  // Authentication Errors
  UNAUTHORIZED: () =>
    new APIError(
      ErrorCode.UNAUTHORIZED,
      'Authentication required',
      401
    ),

  FORBIDDEN: () =>
    new APIError(
      ErrorCode.FORBIDDEN,
      'You do not have permission to access this resource',
      403
    ),

  INVALID_TOKEN: () =>
    new APIError(
      ErrorCode.INVALID_TOKEN,
      'Invalid or expired authentication token',
      401
    ),

  NOT_INSTRUCTOR: () =>
    new APIError(
      ErrorCode.NOT_INSTRUCTOR,
      'This endpoint requires instructor permissions',
      403
    ),

  // Validation Errors
  VALIDATION_ERROR: (details?: unknown) =>
    new APIError(
      ErrorCode.VALIDATION_ERROR,
      'Invalid request data',
      400,
      details
    ),

  INVALID_INPUT: (message: string) =>
    new APIError(
      ErrorCode.INVALID_INPUT,
      message,
      400
    ),

  // Resource Errors
  NOT_FOUND: (resource: string, id?: string) =>
    new APIError(
      ErrorCode.NOT_FOUND,
      id
        ? `${resource} with ID '${id}' not found`
        : `${resource} not found`,
      404
    ),

  ALREADY_EXISTS: (resource: string, identifier: string) =>
    new APIError(
      ErrorCode.ALREADY_EXISTS,
      `${resource} with ${identifier} already exists`,
      409
    ),

  // Business Logic Errors
  INSUFFICIENT_PERMISSIONS: (action: string) =>
    new APIError(
      ErrorCode.INSUFFICIENT_PERMISSIONS,
      `You do not have permission to ${action}`,
      403
    ),

  CAPACITY_EXCEEDED: (resource: string, limit: number) =>
    new APIError(
      ErrorCode.CAPACITY_EXCEEDED,
      `${resource} capacity exceeded. Maximum: ${limit}`,
      400
    ),

  INVALID_STATUS: (current: string, required: string) =>
    new APIError(
      ErrorCode.INVALID_STATUS,
      `Invalid status. Current: ${current}, Required: ${required}`,
      400
    ),

  WORKSHOP_FULL: (workshopTitle: string) =>
    new APIError(
      ErrorCode.WORKSHOP_FULL,
      `Workshop "${workshopTitle}" is at full capacity`,
      400
    ),

  COURSE_NOT_PUBLISHED: (courseTitle: string) =>
    new APIError(
      ErrorCode.COURSE_NOT_PUBLISHED,
      `Course "${courseTitle}" is not published`,
      400
    ),

  // Server Errors
  INTERNAL_ERROR: (message?: string) =>
    new APIError(
      ErrorCode.INTERNAL_ERROR,
      message || 'An unexpected error occurred',
      500
    ),

  DATABASE_ERROR: (operation: string) =>
    new APIError(
      ErrorCode.DATABASE_ERROR,
      `Database error during ${operation}`,
      500
    ),

  EXTERNAL_SERVICE_ERROR: (service: string) =>
    new APIError(
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      `Error communicating with ${service}`,
      502
    ),

  // Rate Limiting
  RATE_LIMITED: (retryAfter: number) =>
    new APIError(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      'Too many requests. Please try again later.',
      429,
      { retryAfter }
    ),

  // File Errors
  FILE_TOO_LARGE: (maxSize: string) =>
    new APIError(
      ErrorCode.FILE_TOO_LARGE,
      `File size exceeds maximum of ${maxSize}`,
      400
    ),

  INVALID_FILE_TYPE: (allowedTypes: string[]) =>
    new APIError(
      ErrorCode.INVALID_FILE_TYPE,
      `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
      400
    ),

  UPLOAD_FAILED: (reason?: string) =>
    new APIError(
      ErrorCode.UPLOAD_FAILED,
      reason || 'File upload failed',
      500
    ),
}

// ============================================================================
// ERROR RESPONSE INTERFACES
// ============================================================================

export interface ErrorResponse {
  success: false
  error: {
    code: ErrorCode
    message: string
    details?: unknown
    timestamp: string
  }
}

export interface ValidationErrorDetail {
  field: string
  message: string
}

// ============================================================================
// ERROR HANDLER FUNCTIONS
// ============================================================================

/**
 * Handle Zod validation errors
 */
export function handleZodError(error: ZodError): ErrorResponse {
  const details = {
    fields: error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    })),
  }

  return {
    success: false,
    error: {
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Invalid request data',
      details,
      timestamp: new Date().toISOString(),
    },
  }
}

/**
 * Handle API errors and return formatted response
 */
export function handleAPIError(error: unknown): NextResponse<ErrorResponse> {
  // Handle APIError instances
  if (error instanceof APIError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          timestamp: new Date().toISOString(),
        },
      },
      { status: error.statusCode }
    )
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      handleZodError(error),
      { status: 400 }
    )
  }

  // Handle Supabase errors
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as { code: string; message: string; details?: string }

    // Map common Supabase error codes
    if (supabaseError.code === 'PGRST116') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.NOT_FOUND,
            message: 'Resource not found',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 404 }
      )
    }

    if (supabaseError.code === '23505') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.ALREADY_EXISTS,
            message: 'Resource already exists',
            details: supabaseError.details,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 409 }
      )
    }
  }

  // Handle unknown errors
  console.error('Unexpected error:', error)
  return NextResponse.json(
    {
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      },
    },
    { status: 500 }
  )
}

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  meta?: Record<string, any>,
  status: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta && { meta }),
    },
    { status }
  )
}

/**
 * Create a paginated success response
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number
    limit: number
    total: number
  }
): NextResponse {
  const totalPages = Math.ceil(pagination.total / pagination.limit)

  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrevious: pagination.page > 1,
      },
    },
    { status: 200 }
  )
}

// ============================================================================
// ERROR LOGGING
// ============================================================================

/**
 * Log error for monitoring/debugging
 */
export function logError(error: unknown, context?: Record<string, any>) {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error,
    context,
  }

  // In production, send to monitoring service (e.g., Sentry, DataDog)
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to monitoring service
    console.error('[ERROR]', JSON.stringify(errorInfo, null, 2))
  } else {
    console.error('[ERROR]', errorInfo)
  }
}
