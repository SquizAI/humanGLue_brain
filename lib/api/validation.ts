/**
 * Request Validation Schemas
 * Zod schemas for all API endpoint inputs
 */

import { z } from 'zod'

// ============================================================================
// Common Schemas
// ============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const sortOrderSchema = z.enum(['asc', 'desc']).default('asc')

// ============================================================================
// Workshop Schemas
// ============================================================================

export const workshopPillarSchema = z.enum([
  'adaptability',
  'coaching',
  'marketplace',
])

export const workshopLevelSchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
])

export const workshopFormatSchema = z.enum(['live', 'hybrid', 'recorded'])

export const workshopStatusSchema = z.enum([
  'draft',
  'published',
  'archived',
  'cancelled',
])

export const workshopFilterSchema = z.object({
  pillar: workshopPillarSchema.optional(),
  level: workshopLevelSchema.optional(),
  format: workshopFormatSchema.optional(),
  status: workshopStatusSchema.optional(),
  isFeatured: z.coerce.boolean().optional(),
  search: z.string().min(1).max(200).optional(),
  tags: z.string().optional(), // Comma-separated tags
  ...paginationSchema.shape,
})

export const createWorkshopSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(50).max(2000),
  pillar: workshopPillarSchema,
  level: workshopLevelSchema,
  format: workshopFormatSchema,
  schedule: z.object({
    date: z.string().datetime(),
    time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    duration: z.string(),
    timezone: z.string().default('UTC'),
  }),
  capacity: z.object({
    total: z.number().int().min(1).max(1000),
  }),
  price: z.object({
    amount: z.number().min(0),
    earlyBird: z.number().min(0).optional(),
    currency: z.string().length(3).default('USD'),
  }),
  outcomes: z.array(z.string().min(10).max(200)).min(3).max(10),
  tags: z.array(z.string().min(2).max(50)).max(10),
  prerequisites: z.array(z.string()).optional(),
  materials: z.array(z.string()).optional(),
})

export const updateWorkshopSchema = createWorkshopSchema.partial()

export const workshopRegistrationSchema = z.object({
  workshopId: z.string().uuid(),
  paymentMethodId: z.string().optional(), // Stripe payment method ID
})

export type WorkshopFilter = z.infer<typeof workshopFilterSchema>
export type CreateWorkshopInput = z.infer<typeof createWorkshopSchema>
export type UpdateWorkshopInput = z.infer<typeof updateWorkshopSchema>
export type WorkshopRegistrationInput = z.infer<typeof workshopRegistrationSchema>

// ============================================================================
// Assessment Schemas
// ============================================================================

export const assessmentTypeSchema = z.enum(['full', 'quick', 'follow_up'])

export const assessmentStatusSchema = z.enum([
  'in_progress',
  'completed',
  'abandoned',
])

export const assessmentDimensionSchema = z.enum([
  'individual',
  'leadership',
  'cultural',
  'embedding',
  'velocity',
])

export const answerTypeSchema = z.enum([
  'scale',
  'multiChoice',
  'fearToConfidence',
  'text',
])

export const createAssessmentSchema = z.object({
  assessmentType: assessmentTypeSchema,
  organizationId: z.string().uuid().optional(),
})

export const submitAnswerSchema = z.object({
  questionId: z.string(),
  dimension: assessmentDimensionSchema,
  answerType: answerTypeSchema,
  answerValue: z.number().min(0).max(100),
  answerText: z.string().optional(),
  questionWeight: z.number().min(0).max(1).default(1),
})

export const submitAnswersSchema = z.object({
  answers: z.array(submitAnswerSchema),
})

export const assessmentFilterSchema = z.object({
  status: assessmentStatusSchema.optional(),
  assessmentType: assessmentTypeSchema.optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  ...paginationSchema.shape,
})

export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>
export type SubmitAnswersInput = z.infer<typeof submitAnswersSchema>
export type AssessmentFilter = z.infer<typeof assessmentFilterSchema>

// ============================================================================
// Talent Schemas
// ============================================================================

export const coachingStyleSchema = z.enum(['directive', 'facilitative', 'hybrid'])

export const availabilitySchema = z.enum(['available', 'limited', 'booked'])

export const transformationStageSchema = z.enum([
  'assess',
  'reframe',
  'embed',
  'scale',
])

export const talentFilterSchema = z.object({
  expertise: z.string().optional(), // Comma-separated expertise
  industries: z.string().optional(), // Comma-separated industries
  transformationStages: z.string().optional(), // Comma-separated stages
  coachingStyle: coachingStyleSchema.optional(),
  availability: availabilitySchema.optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  minExperience: z.coerce.number().int().min(0).optional(),
  maxHourlyRate: z.coerce.number().min(0).optional(),
  search: z.string().min(1).max(200).optional(),
  ...paginationSchema.shape,
})

export const contactTalentSchema = z.object({
  talentId: z.string().uuid(),
  organizationId: z.string().uuid().optional(),
  focusArea: z.string().min(10).max(500),
  estimatedHours: z.number().int().min(1).max(1000),
  timeline: z.string().min(5).max(100),
  message: z.string().min(20).max(1000),
})

export type TalentFilter = z.infer<typeof talentFilterSchema>
export type ContactTalentInput = z.infer<typeof contactTalentSchema>

// ============================================================================
// User Schemas
// ============================================================================

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  companyName: z.string().min(2).max(200).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

// ============================================================================
// Course Schemas
// ============================================================================

export const courseStatusSchema = z.enum(['draft', 'published', 'archived'])

export const courseDifficultySchema = z.enum(['beginner', 'intermediate', 'advanced'])

export const courseFilterSchema = z.object({
  pillar: workshopPillarSchema.optional(),
  difficulty: courseDifficultySchema.optional(),
  status: courseStatusSchema.optional(),
  search: z.string().min(1).max(200).optional(),
  tags: z.string().optional(), // Comma-separated tags
  ...paginationSchema.shape,
})

export const createCourseSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(50).max(5000),
  pillar: workshopPillarSchema,
  difficulty: courseDifficultySchema,
  duration: z.string().min(2).max(50), // e.g., "4 weeks", "2 hours"
  price: z.object({
    amount: z.number().min(0),
    currency: z.string().length(3).default('USD'),
  }),
  learningOutcomes: z.array(z.string().min(10).max(200)).min(3).max(15),
  syllabus: z.array(z.object({
    title: z.string().min(5).max(200),
    description: z.string().min(10).max(1000),
    duration: z.string().optional(),
  })).min(1),
  tags: z.array(z.string().min(2).max(50)).max(10),
  prerequisites: z.array(z.string()).optional(),
  thumbnailUrl: z.string().url().optional(),
})

export const updateCourseSchema = createCourseSchema.partial()

export type CourseFilter = z.infer<typeof courseFilterSchema>
export type CreateCourseInput = z.infer<typeof createCourseSchema>
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>

// ============================================================================
// User Management Schemas
// ============================================================================

export const userStatusSchema = z.enum(['active', 'inactive', 'suspended'])

export const userRoleSchema = z.enum(['admin', 'instructor', 'expert', 'client', 'user'])

export const userFilterSchema = z.object({
  status: userStatusSchema.optional(),
  role: userRoleSchema.optional(),
  search: z.string().min(1).max(200).optional(),
  ...paginationSchema.shape,
})

export const createUserSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(100),
  role: userRoleSchema.default('user'),
  companyName: z.string().min(2).max(200).optional(),
  jobTitle: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
})

export const updateUserSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  companyName: z.string().min(2).max(200).optional(),
  jobTitle: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  status: userStatusSchema.optional(),
  avatarUrl: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
})

export type UserFilter = z.infer<typeof userFilterSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>

// ============================================================================
// Expert/Talent Profile Schemas
// ============================================================================

export const createTalentProfileSchema = z.object({
  tagline: z.string().min(10).max(200),
  bio: z.string().min(50).max(2000),
  location: z.string().min(2).max(100).optional(),
  expertise: z.array(z.string().min(2).max(100)).min(1).max(20),
  certifications: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  yearsExperience: z.number().int().min(0).max(100),
  industries: z.array(z.string()).optional(),
  transformationStages: z.array(z.string()).optional(),
  coachingStyle: coachingStyleSchema.optional(),
  hourlyRate: z.number().min(0),
  minEngagementHours: z.number().int().min(1).optional(),
  maxHoursPerWeek: z.number().int().min(1).max(168).optional(),
  avatarUrl: z.string().url().optional(),
  videoIntroUrl: z.string().url().optional(),
  isPublic: z.boolean().default(true),
  acceptingClients: z.boolean().default(true),
})

export const updateTalentProfileSchema = createTalentProfileSchema.partial()

export type CreateTalentProfileInput = z.infer<typeof createTalentProfileSchema>
export type UpdateTalentProfileInput = z.infer<typeof updateTalentProfileSchema>

// ============================================================================
// Payment Schemas
// ============================================================================

export const createPaymentIntentSchema = z.object({
  workshopId: z.string().uuid().optional(),
  engagementId: z.string().uuid().optional(),
  amount: z.number().min(0),
  currency: z.string().length(3).default('USD'),
  metadata: z.record(z.unknown()).optional(),
})

export const processPaymentSchema = z.object({
  paymentIntentId: z.string(),
  workshopId: z.string().uuid().optional(),
  engagementId: z.string().uuid().optional(),
})

export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>
export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>

// ============================================================================
// Validation Helper Functions
// ============================================================================

/**
 * Validate request data against a schema
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Array<{ field: string; message: string }> } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      }
    }
    return {
      success: false,
      errors: [{ field: 'unknown', message: 'Validation failed' }],
    }
  }
}

/**
 * Validate query parameters
 */
export function validateQueryParams<T>(
  schema: z.ZodSchema<T>,
  searchParams: URLSearchParams
): { success: true; data: T } | { success: false; errors: Array<{ field: string; message: string }> } {
  const params = Object.fromEntries(searchParams.entries())
  return validateRequest(schema, params)
}
