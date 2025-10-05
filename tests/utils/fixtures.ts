/**
 * Test Fixtures and Mock Data Generators
 * Provides reusable test data for E2E and integration tests
 */

import { test as base, expect } from '@playwright/test'
import { setupAuthSession, cleanupTestUser, testUsers } from './auth-helpers'
import { seedInstructorData, cleanupInstructorData } from './db-helpers'

/**
 * Extended test fixtures with authentication
 */
export const test = base.extend<{
  authenticatedInstructor: any
  authenticatedStudent: any
  authenticatedAdmin: any
}>({
  // Authenticated instructor fixture
  authenticatedInstructor: async ({ context }, use) => {
    const page = await setupAuthSession(context, 'instructor')
    await use(page)
    await page.close()
  },

  // Authenticated student fixture
  authenticatedStudent: async ({ context }, use) => {
    const page = await setupAuthSession(context, 'student')
    await use(page)
    await page.close()
  },

  // Authenticated admin fixture
  authenticatedAdmin: async ({ context }, use) => {
    const page = await setupAuthSession(context, 'admin')
    await use(page)
    await page.close()
  },
})

export { expect }

/**
 * Mock Course Data Generator
 */
export function generateMockCourse(overrides = {}) {
  return {
    title: 'Test Course Title',
    slug: `test-course-${Date.now()}`,
    description: 'This is a comprehensive test course description with detailed information about the course content and learning objectives.',
    pillar: 'adaptability',
    difficulty: 'intermediate',
    status: 'published',
    price_amount: 299.99,
    price_currency: 'USD',
    duration_hours: 10,
    category: 'AI & Leadership',
    tags: ['AI', 'Leadership', 'Strategy'],
    what_you_will_learn: [
      'Master AI transformation strategies',
      'Build AI-ready teams',
      'Implement AI governance',
    ],
    target_audience: [
      'C-level executives',
      'Senior managers',
      'Technology leaders',
    ],
    prerequisites: ['Basic understanding of AI concepts'],
    language: 'en',
    certificate_enabled: true,
    allow_comments: true,
    allow_qa: true,
    ...overrides,
  }
}

/**
 * Mock Workshop Data Generator
 */
export function generateMockWorkshop(overrides = {}) {
  const startTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  const endTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000) // +3 hours

  return {
    title: 'Test Workshop Title',
    slug: `test-workshop-${Date.now()}`,
    description: 'Interactive workshop for hands-on learning and practical application of AI concepts.',
    pillar: 'adaptability',
    level: 'intermediate',
    type: 'online',
    status: 'published',
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    capacity_total: 20,
    capacity_remaining: 15,
    price_amount: 499.99,
    price_currency: 'USD',
    location_type: 'online',
    meeting_url: 'https://zoom.us/j/test123',
    what_you_will_learn: [
      'Develop AI strategy',
      'Implement AI solutions',
      'Measure AI impact',
    ],
    prerequisites: ['Completed AI Fundamentals course'],
    certificate_enabled: true,
    ...overrides,
  }
}

/**
 * Mock Student Data Generator
 */
export function generateMockStudent(index = 0, overrides = {}) {
  return {
    email: `test-student-${index}@example.com`,
    full_name: `Test Student ${index}`,
    role: 'student',
    avatar_url: `https://i.pravatar.cc/150?img=${index}`,
    ...overrides,
  }
}

/**
 * Mock Enrollment Data Generator
 */
export function generateMockEnrollment(courseId: string, userId: string, overrides = {}) {
  return {
    course_id: courseId,
    user_id: userId,
    status: 'in_progress',
    enrolled_at: new Date().toISOString(),
    last_accessed_at: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Mock Student Progress Data
 */
export function generateMockProgress(overrides = {}) {
  return {
    total_lessons: 20,
    completed_lessons: 12,
    progress_percentage: 60,
    total_watch_time_seconds: 14400, // 4 hours
    last_activity_at: new Date().toISOString(),
    total_quizzes: 5,
    passed_quizzes: 4,
    average_quiz_score: 85.5,
    total_assignments: 3,
    submitted_assignments: 2,
    average_assignment_score: 90.0,
    engagement_score: 88.5,
    is_completed: false,
    ...overrides,
  }
}

/**
 * Mock Revenue Transaction Data
 */
export function generateMockTransaction(instructorId: string, overrides = {}) {
  const amount = 299.99
  const platformFee = amount * 0.2
  const earnings = amount - platformFee

  return {
    instructor_id: instructorId,
    student_id: `student-${Date.now()}`,
    transaction_type: 'course_enrollment',
    amount,
    currency: 'USD',
    platform_fee_percentage: 20,
    platform_fee_amount: platformFee,
    instructor_earnings: earnings,
    payment_status: 'completed',
    payment_provider: 'stripe',
    payment_provider_transaction_id: `tx_${Date.now()}`,
    transaction_date: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Mock Student Activity Data
 */
export function generateMockActivity(
  instructorId: string,
  studentId: string,
  courseId: string,
  overrides = {}
) {
  const activityTypes = [
    'enrolled',
    'lesson_started',
    'lesson_completed',
    'quiz_passed',
    'assignment_submitted',
  ] as const

  const type = activityTypes[Math.floor(Math.random() * activityTypes.length)]

  return {
    instructor_id: instructorId,
    student_id: studentId,
    course_id: courseId,
    activity_type: type,
    activity_title: `${type.replace('_', ' ')} - Test Activity`,
    activity_description: `Student performed: ${type}`,
    occurred_at: new Date().toISOString(),
    metadata: {},
    ...overrides,
  }
}

/**
 * Mock Course Review Data
 */
export function generateMockReview(courseId: string, userId: string, overrides = {}) {
  return {
    course_id: courseId,
    user_id: userId,
    rating: 5,
    title: 'Excellent Course!',
    review_text: 'This course exceeded my expectations. The content was well-structured and the instructor was very knowledgeable.',
    content_quality_rating: 5,
    instructor_rating: 5,
    value_rating: 5,
    is_published: true,
    is_verified_purchase: true,
    helpful_count: 0,
    ...overrides,
  }
}

/**
 * Mock Workshop Feedback Data
 */
export function generateMockWorkshopFeedback(workshopId: string, userId: string, overrides = {}) {
  return {
    workshop_id: workshopId,
    user_id: userId,
    overall_satisfaction: 5,
    content_rating: 5,
    delivery_rating: 5,
    interaction_rating: 5,
    what_went_well: 'The hands-on exercises were very practical and immediately applicable.',
    what_could_improve: 'More time for Q&A would be beneficial.',
    would_recommend: true,
    nps_score: 9,
    ...overrides,
  }
}

/**
 * Mock Instructor Profile Data
 */
export function generateMockInstructorProfile(userId: string, overrides = {}) {
  return {
    user_id: userId,
    bio: 'Experienced AI instructor with over 10 years of teaching experience in machine learning, AI transformation, and organizational change management.',
    professional_title: 'Senior AI Transformation Specialist',
    tagline: 'Empowering organizations through AI education and innovation',
    expertise_tags: ['AI', 'Machine Learning', 'Leadership', 'Strategy', 'Change Management'],
    pillars: ['adaptability', 'coaching'],
    education: [
      {
        degree: 'PhD in Computer Science',
        institution: 'Stanford University',
        year: 2010,
      },
      {
        degree: 'MS in Artificial Intelligence',
        institution: 'MIT',
        year: 2006,
      },
    ],
    certifications: [
      {
        name: 'AWS Certified Machine Learning - Specialty',
        issuer: 'Amazon Web Services',
        year: 2022,
        credential_url: 'https://example.com/cert1',
      },
    ],
    work_experience: [
      {
        title: 'AI Consultant',
        company: 'Tech Innovations Inc.',
        years: '2015-Present',
        description: 'Leading AI transformation initiatives for Fortune 500 companies',
      },
    ],
    social_links: {
      linkedin: 'https://linkedin.com/in/testinstructor',
      twitter: 'https://twitter.com/testinstructor',
      website: 'https://testinstructor.com',
    },
    is_verified: true,
    is_featured: false,
    is_accepting_students: true,
    ...overrides,
  }
}

/**
 * Mock Instructor Settings Data
 */
export function generateMockInstructorSettings(userId: string, overrides = {}) {
  return {
    user_id: userId,
    email_notifications: {
      new_enrollment: true,
      new_question: true,
      assignment_submitted: true,
      course_review: true,
      workshop_registration: true,
      payment_received: true,
      weekly_summary: true,
    },
    push_notifications: {
      new_enrollment: true,
      new_question: true,
      assignment_submitted: false,
      course_review: true,
      workshop_registration: true,
      payment_received: true,
    },
    auto_approve_enrollments: true,
    allow_student_questions: true,
    allow_course_reviews: true,
    require_enrollment_approval: false,
    show_email_to_students: false,
    show_phone_to_students: false,
    show_student_count: true,
    show_revenue_stats: false,
    payment_method: 'stripe',
    payout_schedule: 'monthly',
    minimum_payout_amount: 100.0,
    currency: 'USD',
    calendar_sync_enabled: false,
    ...overrides,
  }
}

/**
 * Wait for element with custom timeout
 */
export async function waitForElement(page: any, selector: string, timeout = 10000) {
  await page.waitForSelector(selector, { timeout })
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(page: any, urlPattern: string | RegExp) {
  return page.waitForResponse(
    (response: any) =>
      (typeof urlPattern === 'string'
        ? response.url().includes(urlPattern)
        : urlPattern.test(response.url())) && response.status() === 200
  )
}

/**
 * Fill form with data
 */
export async function fillForm(page: any, formData: Record<string, string>) {
  for (const [field, value] of Object.entries(formData)) {
    await page.fill(`[data-testid="${field}"], [name="${field}"]`, value)
  }
}

/**
 * Take screenshot with custom name
 */
export async function takeScreenshot(page: any, name: string) {
  await page.screenshot({
    path: `test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage: true,
  })
}
