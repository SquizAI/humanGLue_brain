/**
 * API Error Handling
 * Consistent error responses across all API endpoints
 */

export class APIError extends Error {
  code: string
  statusCode: number
  details?: unknown

  constructor(code: string, message: string, statusCode: number, details?: unknown) {
    super(message)
    this.code = code
    this.statusCode = statusCode
    this.details = details
    this.name = 'APIError'
  }
}

export const APIErrors = {
  // 400 - Bad Request
  VALIDATION_ERROR: (details?: unknown) =>
    new APIError('VALIDATION_ERROR', 'Invalid request data', 400, details),

  INVALID_QUERY_PARAMS: (details?: unknown) =>
    new APIError('INVALID_QUERY_PARAMS', 'Invalid query parameters', 400, details),

  MISSING_REQUIRED_FIELDS: (fields: string[]) =>
    new APIError(
      'MISSING_REQUIRED_FIELDS',
      `Missing required fields: ${fields.join(', ')}`,
      400,
      { fields }
    ),

  BAD_REQUEST: (message: string, details?: unknown) =>
    new APIError('BAD_REQUEST', message, 400, details),

  INVALID_ID: (idType = 'ID') =>
    new APIError('INVALID_ID', `Invalid ${idType} format`, 400),

  // 401 - Unauthorized
  UNAUTHORIZED: (message = 'Authentication required') =>
    new APIError('UNAUTHORIZED', message, 401),

  INVALID_TOKEN: () =>
    new APIError('INVALID_TOKEN', 'Invalid or expired authentication token', 401),

  // 403 - Forbidden
  FORBIDDEN: (message = 'Insufficient permissions') =>
    new APIError('FORBIDDEN', message, 403),

  ROLE_REQUIRED: (role: string) =>
    new APIError('ROLE_REQUIRED', `Role required: ${role}`, 403, { role }),

  // 404 - Not Found
  NOT_FOUND: (resource: string) =>
    new APIError('NOT_FOUND', `${resource} not found`, 404, { resource }),

  // 409 - Conflict
  CONFLICT: (message: string, details?: unknown) =>
    new APIError('CONFLICT', message, 409, details),

  DUPLICATE_ENTRY: (field: string) =>
    new APIError('DUPLICATE_ENTRY', `Duplicate entry for ${field}`, 409, { field }),

  CAPACITY_EXCEEDED: () =>
    new APIError('CAPACITY_EXCEEDED', 'Workshop is at full capacity', 409),

  ALREADY_REGISTERED: () =>
    new APIError('ALREADY_REGISTERED', 'Already registered for this workshop', 409),

  // 429 - Too Many Requests
  RATE_LIMITED: (retryAfter?: number) =>
    new APIError('RATE_LIMITED', 'Too many requests', 429, { retryAfter }),

  // 500 - Internal Server Error
  INTERNAL_ERROR: (message = 'Internal server error') =>
    new APIError('INTERNAL_ERROR', message, 500),

  DATABASE_ERROR: (message = 'Database operation failed') =>
    new APIError('DATABASE_ERROR', message, 500),

  EXTERNAL_SERVICE_ERROR: (service: string) =>
    new APIError(
      'EXTERNAL_SERVICE_ERROR',
      `External service error: ${service}`,
      500,
      { service }
    ),
}

/**
 * Standard API response format
 */
export interface APIResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  meta?: {
    timestamp: string
    requestId?: string
    [key: string]: unknown
  }
}

/**
 * Create success response
 */
export function successResponse<T>(
  data: T,
  meta?: Record<string, unknown>
): APIResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  }
}

/**
 * Create error response from APIError
 */
export function errorResponse(error: APIError): APIResponse {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  }
}

/**
 * Handle unknown errors and convert to APIError
 */
export function handleUnknownError(error: unknown): APIError {
  console.error('Unexpected error:', error)

  if (error instanceof APIError) {
    return error
  }

  if (error instanceof Error) {
    // Handle Supabase errors
    if ('code' in error && 'details' in error) {
      const pgError = error as { code: string; details: string; message: string }

      // Handle common Postgres errors
      if (pgError.code === '23505') {
        return APIErrors.DUPLICATE_ENTRY('resource')
      }
      if (pgError.code === 'PGRST116') {
        return APIErrors.NOT_FOUND('Resource')
      }
      // Handle invalid UUID format error
      if (pgError.code === '22P02' && pgError.message.includes('uuid')) {
        return APIErrors.INVALID_ID('UUID')
      }

      return APIErrors.DATABASE_ERROR(pgError.message)
    }

    // Check for UUID validation errors by message pattern
    if (error.message.includes('invalid input syntax for type uuid')) {
      return APIErrors.INVALID_ID('UUID')
    }

    return APIErrors.INTERNAL_ERROR(error.message)
  }

  return APIErrors.INTERNAL_ERROR('An unexpected error occurred')
}

/**
 * Type guard for APIError
 */
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError
}
