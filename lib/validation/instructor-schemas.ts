/**
 * Zod Validation Schemas for Instructor Dashboard API
 * @module lib/validation/instructor-schemas
 */

import { z } from 'zod'

// ============================================================================
// COMMON SCHEMAS
// ============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc')

// ============================================================================
// STUDENTS MANAGEMENT SCHEMAS
// ============================================================================

export const getStudentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(200).optional(),
  status: z.enum(['all', 'active', 'inactive', 'completed']).default('all'),
  engagement: z.enum(['all', 'high', 'medium', 'low']).default('all'),
  course: z.string().uuid().optional(),
  sortBy: z.enum(['name', 'progress', 'engagement', 'lastActive']).default('lastActive'),
  sortOrder: sortOrderSchema,
})

export const bulkEmailSchema = z.object({
  studentIds: z.array(z.string().uuid()).min(1).max(100),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
  includeCourseLink: z.boolean().optional(),
  courseId: z.string().uuid().optional(),
})

export const exportStudentsSchema = z.object({
  format: z.enum(['csv', 'xlsx']),
  filters: z.object({
    status: z.enum(['all', 'active', 'inactive', 'completed']).optional(),
    engagement: z.enum(['all', 'high', 'medium', 'low']).optional(),
    course: z.string().uuid().optional(),
  }).optional(),
  fields: z.array(z.string()).optional(),
})

// ============================================================================
// ANALYTICS SCHEMAS
// ============================================================================

export const getRevenueQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  granularity: z.enum(['day', 'week', 'month']).default('day'),
  courseId: z.string().uuid().optional(),
})

export const getEnrollmentsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  courseId: z.string().uuid().optional(),
  groupBy: z.enum(['course', 'date', 'pillar']).optional(),
})

export const getEngagementQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  courseId: z.string().uuid().optional(),
  metric: z.enum(['all', 'watch_time', 'completion_rate', 'quiz_scores', 'activity']).default('all'),
})

export const exportAnalyticsSchema = z.object({
  format: z.enum(['pdf', 'csv']),
  reportType: z.enum(['revenue', 'enrollments', 'engagement', 'comprehensive']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  courseIds: z.array(z.string().uuid()).optional(),
})

// ============================================================================
// PROFILE MANAGEMENT SCHEMAS
// ============================================================================

export const updateInstructorProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  title: z.string().min(5).max(200).optional(),
  bio: z.string().min(50).max(2000).optional(),
  expertise: z.array(z.string()).max(20).optional(),
  yearsExperience: z.number().int().min(0).max(70).optional(),
  languages: z.array(z.string()).max(10).optional(),
  timezone: z.string().optional(),
  education: z.array(z.object({
    degree: z.string().min(1).max(200),
    institution: z.string().min(1).max(200),
    year: z.string().regex(/^\d{4}$/),
    fieldOfStudy: z.string().max(200).optional(),
  })).max(10).optional(),
  certifications: z.array(z.object({
    name: z.string().min(1).max(200),
    issuer: z.string().min(1).max(200),
    date: z.string().regex(/^\d{4}(-\d{2})?(-\d{2})?$/), // YYYY or YYYY-MM or YYYY-MM-DD
    credentialId: z.string().max(100).optional(),
    credentialUrl: z.string().url().optional(),
  })).max(20).optional(),
  workExperience: z.array(z.object({
    company: z.string().min(1).max(200),
    role: z.string().min(1).max(200),
    duration: z.string().max(100),
    description: z.string().max(1000).optional(),
  })).max(15).optional(),
  socialLinks: z.object({
    linkedin: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal('')),
    youtube: z.string().url().optional().or(z.literal('')),
    github: z.string().url().optional().or(z.literal('')),
    custom: z.array(z.object({
      name: z.string().min(1).max(50),
      url: z.string().url(),
    })).max(5).optional(),
  }).optional(),
})

export const uploadProfileImageSchema = z.object({
  type: z.enum(['avatar', 'cover']),
  file: z.custom<File>((file) => {
    if (!(file instanceof File)) return false
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) return false
    if (file.size > 5 * 1024 * 1024) return false // 5MB max
    return true
  }, {
    message: 'File must be JPG, PNG, or WebP and less than 5MB',
  }),
})

// ============================================================================
// SETTINGS SCHEMAS
// ============================================================================

export const updateSettingsSchema = z.object({
  general: z.object({
    displayName: z.string().min(2).max(100).optional(),
    phone: z.string().max(20).optional(),
    language: z.string().length(2).optional(),
    timezone: z.string().optional(),
  }).optional(),
  notifications: z.object({
    emailNotifications: z.object({
      newEnrollments: z.boolean().optional(),
      comments: z.boolean().optional(),
      messages: z.boolean().optional(),
      reviews: z.boolean().optional(),
      courseUpdates: z.boolean().optional(),
    }).optional(),
    smsNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
    frequency: z.enum(['instant', 'daily', 'weekly']).optional(),
  }).optional(),
  privacy: z.object({
    profileVisibility: z.enum(['public', 'students', 'private']).optional(),
    showEmail: z.boolean().optional(),
    showPhone: z.boolean().optional(),
    displayStudentCount: z.boolean().optional(),
  }).optional(),
  payment: z.object({
    paymentMethod: z.enum(['stripe', 'paypal']).optional(),
    payoutSchedule: z.enum(['weekly', 'monthly']).optional(),
    minimumPayout: z.number().int().min(50).max(1000).optional(),
  }).optional(),
  teaching: z.object({
    autoApproveEnrollments: z.boolean().optional(),
    allowQA: z.boolean().optional(),
    allowReviews: z.boolean().optional(),
    requireCertificates: z.boolean().optional(),
  }).optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const toggle2FASchema = z.object({
  enable: z.boolean(),
  verificationCode: z.string().length(6).regex(/^\d{6}$/).optional(),
}).refine(data => !data.enable || data.verificationCode, {
  message: 'Verification code required when enabling 2FA',
  path: ['verificationCode'],
})

export const revokeSessionSchema = z.object({
  sessionId: z.string().uuid(),
})

export const exportDataSchema = z.object({
  format: z.enum(['json', 'csv']),
  includeStudentData: z.boolean().default(false),
})

// ============================================================================
// COURSES SCHEMAS
// ============================================================================

export const getInstructorCoursesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['all', 'published', 'draft', 'archived']).default('all'),
  sortBy: z.enum(['title', 'enrollments', 'revenue', 'rating', 'createdAt']).default('createdAt'),
  sortOrder: sortOrderSchema,
})

export const createCourseSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(50).max(5000),
  pillar: z.enum(['adaptability', 'coaching', 'marketplace']),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  prerequisites: z.array(z.string()).max(10).optional(),
  learningOutcomes: z.array(z.string().min(10).max(200)).min(3).max(15),
  priceAmount: z.number().min(0).max(99999),
  currency: z.string().length(3).default('USD'),
})

export const updateCourseSchema = z.object({
  title: z.string().min(10).max(200).optional(),
  description: z.string().min(50).max(5000).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  prerequisites: z.array(z.string()).max(10).optional(),
  learningOutcomes: z.array(z.string().min(10).max(200)).min(3).max(15).optional(),
  priceAmount: z.number().min(0).max(99999).optional(),
  thumbnailUrl: z.string().url().optional(),
  status: z.enum(['published', 'draft', 'archived']).optional(),
})

// ============================================================================
// WORKSHOPS SCHEMAS
// ============================================================================

export const getInstructorWorkshopsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['all', 'upcoming', 'in-progress', 'completed', 'cancelled']).default('all'),
  pillar: z.enum(['adaptability', 'coaching', 'marketplace']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(['startTime', 'enrollments', 'revenue']).default('startTime'),
  sortOrder: sortOrderSchema,
})

export const createWorkshopSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(50).max(2000),
  pillar: z.enum(['adaptability', 'coaching', 'marketplace']),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  format: z.enum(['online', 'in-person', 'hybrid']),
  location: z.string().max(200).optional(),
  meetingUrl: z.string().url().optional(),
  durationHours: z.number().min(0.5).max(24),
  capacityTotal: z.number().int().min(1).max(1000),
  priceAmount: z.number().min(0).max(99999),
  priceEarlyBird: z.number().min(0).max(99999).optional(),
  earlyBirdDeadline: z.string().datetime().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  timezone: z.string(),
  waitlistEnabled: z.boolean().default(false),
})
  .refine(data => new Date(data.endTime) > new Date(data.startTime), {
    message: 'End time must be after start time',
    path: ['endTime'],
  })
  .refine(data => {
    if (data.priceEarlyBird && data.earlyBirdDeadline) {
      return new Date(data.earlyBirdDeadline) < new Date(data.startTime)
    }
    return true
  }, {
    message: 'Early bird deadline must be before workshop start time',
    path: ['earlyBirdDeadline'],
  })
  .refine(data => {
    if (data.priceEarlyBird) {
      return data.priceEarlyBird < data.priceAmount
    }
    return true
  }, {
    message: 'Early bird price must be less than regular price',
    path: ['priceEarlyBird'],
  })

export const updateWorkshopEnrollmentSchema = z.object({
  capacityTotal: z.number().int().min(1).max(1000).optional(),
  priceAmount: z.number().min(0).max(99999).optional(),
  priceEarlyBird: z.number().min(0).max(99999).optional(),
  earlyBirdDeadline: z.string().datetime().optional(),
  waitlistEnabled: z.boolean().optional(),
  status: z.enum(['published', 'cancelled']).optional(),
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Infer TypeScript types from schemas
export type GetStudentsQuery = z.infer<typeof getStudentsQuerySchema>
export type BulkEmailRequest = z.infer<typeof bulkEmailSchema>
export type ExportStudentsRequest = z.infer<typeof exportStudentsSchema>

export type GetRevenueQuery = z.infer<typeof getRevenueQuerySchema>
export type GetEnrollmentsQuery = z.infer<typeof getEnrollmentsQuerySchema>
export type GetEngagementQuery = z.infer<typeof getEngagementQuerySchema>
export type ExportAnalyticsRequest = z.infer<typeof exportAnalyticsSchema>

export type UpdateInstructorProfileRequest = z.infer<typeof updateInstructorProfileSchema>
export type UploadProfileImageRequest = z.infer<typeof uploadProfileImageSchema>

export type UpdateSettingsRequest = z.infer<typeof updateSettingsSchema>
export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>
export type Toggle2FARequest = z.infer<typeof toggle2FASchema>
export type RevokeSessionRequest = z.infer<typeof revokeSessionSchema>
export type ExportDataRequest = z.infer<typeof exportDataSchema>

export type GetInstructorCoursesQuery = z.infer<typeof getInstructorCoursesQuerySchema>
export type CreateCourseRequest = z.infer<typeof createCourseSchema>
export type UpdateCourseRequest = z.infer<typeof updateCourseSchema>

export type GetInstructorWorkshopsQuery = z.infer<typeof getInstructorWorkshopsQuerySchema>
export type CreateWorkshopRequest = z.infer<typeof createWorkshopSchema>
export type UpdateWorkshopEnrollmentRequest = z.infer<typeof updateWorkshopEnrollmentSchema>
