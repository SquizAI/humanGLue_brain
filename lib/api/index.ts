/**
 * HMN API - Unified Exports
 *
 * Central export point for all API utilities.
 * Import everything you need from this single file.
 *
 * @example
 * ```typescript
 * import {
 *   requireAuth,
 *   APIErrors,
 *   successResponse,
 *   validateRequest,
 *   workshopFilterSchema,
 *   enforceRateLimit
 * } from '@/lib/api'
 * ```
 */

// Error Handling
export {
  APIError,
  APIErrors,
  successResponse,
  errorResponse,
  handleUnknownError,
  isAPIError,
  type APIResponse,
} from './errors'

// Validation
export {
  // Schemas
  paginationSchema,
  sortOrderSchema,
  workshopPillarSchema,
  workshopLevelSchema,
  workshopFormatSchema,
  workshopStatusSchema,
  workshopFilterSchema,
  createWorkshopSchema,
  updateWorkshopSchema,
  workshopRegistrationSchema,
  assessmentTypeSchema,
  assessmentStatusSchema,
  assessmentDimensionSchema,
  answerTypeSchema,
  createAssessmentSchema,
  submitAnswerSchema,
  submitAnswersSchema,
  assessmentFilterSchema,
  coachingStyleSchema,
  availabilitySchema,
  transformationStageSchema,
  talentFilterSchema,
  contactTalentSchema,
  updateProfileSchema,
  createPaymentIntentSchema,
  processPaymentSchema,

  // Types
  type WorkshopFilter,
  type CreateWorkshopInput,
  type UpdateWorkshopInput,
  type WorkshopRegistrationInput,
  type CreateAssessmentInput,
  type SubmitAnswerInput,
  type SubmitAnswersInput,
  type AssessmentFilter,
  type TalentFilter,
  type ContactTalentInput,
  type UpdateProfileInput,
  type CreatePaymentIntentInput,
  type ProcessPaymentInput,

  // Functions
  validateRequest,
  validateQueryParams,
} from './validation'

// Authentication & Authorization
export {
  getAuthUser,
  checkUserRole,
  requireAuth,
  requireRole,
  isAdmin,
  checkResourceOwnership,
  requireOwnership,
  extractBearerToken,
  verifyAuthToken,
} from './auth'

// Rate Limiting
export {
  getIdentifier,
  checkRateLimit,
  enforceRateLimit,
  getRateLimitHeaders,
  type RateLimitTier,
} from './rate-limit'
