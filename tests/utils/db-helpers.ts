/**
 * Database Helper Functions for Testing
 * Handles database seeding, cleanup, and test data generation
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

/**
 * Seed test database with instructor data
 */
export async function seedInstructorData(instructorId: string) {
  // Create instructor profile
  const { data: profile } = await supabase
    .from('instructor_profiles')
    .insert({
      user_id: instructorId,
      bio: 'Experienced AI instructor with over 10 years of teaching experience in machine learning and AI transformation.',
      professional_title: 'Senior AI Transformation Specialist',
      tagline: 'Empowering organizations through AI education',
      expertise_tags: ['AI', 'Machine Learning', 'Leadership', 'Strategy'],
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
      is_verified: true,
      is_accepting_students: true,
    })
    .select()
    .single()

  // Create instructor settings
  await supabase.from('instructor_settings').insert({
    user_id: instructorId,
    auto_approve_enrollments: true,
    allow_student_questions: true,
    allow_course_reviews: true,
    show_student_count: true,
    payment_method: 'stripe',
    payout_schedule: 'monthly',
    currency: 'USD',
  })

  // Create test courses
  const courses = await Promise.all([
    supabase
      .from('courses')
      .insert({
        instructor_id: instructorId,
        title: 'AI Transformation for Executives',
        slug: 'ai-transformation-executives',
        description: 'Learn how to lead AI transformation in your organization',
        pillar: 'adaptability',
        difficulty: 'intermediate',
        status: 'published',
        price_amount: 299.99,
        price_currency: 'USD',
        is_published: true,
        published_at: new Date().toISOString(),
        category: 'AI & Leadership',
        tags: ['AI', 'Leadership', 'Strategy'],
        what_you_will_learn: [
          'Understand AI capabilities and limitations',
          'Develop AI transformation roadmap',
          'Build AI-ready organizational culture',
        ],
        certificate_enabled: true,
      })
      .select()
      .single(),

    supabase
      .from('courses')
      .insert({
        instructor_id: instructorId,
        title: 'Machine Learning Fundamentals',
        slug: 'ml-fundamentals',
        description: 'Master the fundamentals of machine learning',
        pillar: 'adaptability',
        difficulty: 'beginner',
        status: 'published',
        price_amount: 199.99,
        price_currency: 'USD',
        is_published: true,
        published_at: new Date().toISOString(),
        category: 'AI & Technology',
        tags: ['Machine Learning', 'Python', 'Data Science'],
        what_you_will_learn: [
          'Understand ML algorithms',
          'Build predictive models',
          'Deploy ML solutions',
        ],
        certificate_enabled: true,
      })
      .select()
      .single(),
  ])

  // Create test workshops
  const workshops = await Promise.all([
    supabase
      .from('workshops')
      .insert({
        instructor_id: instructorId,
        title: 'AI Strategy Workshop',
        slug: 'ai-strategy-workshop',
        description: 'Hands-on workshop for developing AI strategy',
        pillar: 'adaptability',
        level: 'intermediate',
        type: 'online',
        status: 'published',
        start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(), // +3 hours
        capacity_total: 20,
        capacity_remaining: 15,
        price_amount: 499.99,
        price_currency: 'USD',
        location_type: 'online',
        meeting_url: 'https://zoom.us/j/test123',
      })
      .select()
      .single(),
  ])

  return {
    profile: profile?.data,
    courses: courses.map((c) => c.data),
    workshops: workshops.map((w) => w.data),
  }
}

/**
 * Seed test students with enrollments
 */
export async function seedStudentEnrollments(
  courseId: string,
  count: number = 5
) {
  const students = []

  for (let i = 0; i < count; i++) {
    // Create student user
    const { data: user } = await supabase
      .from('users')
      .insert({
        email: `test-student-${i}@example.com`,
        full_name: `Test Student ${i}`,
        role: 'student',
        avatar_url: `https://i.pravatar.cc/150?img=${i}`,
      })
      .select()
      .single()

    if (!user) continue

    // Create enrollment
    const { data: enrollment } = await supabase
      .from('course_enrollments')
      .insert({
        course_id: courseId,
        user_id: user.id,
        status: i % 3 === 0 ? 'completed' : 'in_progress',
        enrolled_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        last_accessed_at: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    students.push({ user, enrollment })
  }

  return students
}

/**
 * Create test revenue transactions
 */
export async function seedRevenueTransactions(
  instructorId: string,
  count: number = 10
) {
  const transactions = []

  for (let i = 0; i < count; i++) {
    const amount = Math.random() * 500 + 100 // $100-$600
    const platformFee = amount * 0.2
    const earnings = amount - platformFee

    const { data } = await supabase
      .from('revenue_transactions')
      .insert({
        instructor_id: instructorId,
        student_id: `student-${i}`,
        transaction_type: i % 2 === 0 ? 'course_enrollment' : 'workshop_registration',
        amount,
        platform_fee_percentage: 20,
        platform_fee_amount: platformFee,
        instructor_earnings: earnings,
        currency: 'USD',
        payment_status: 'completed',
        transaction_date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    if (data) transactions.push(data)
  }

  return transactions
}

/**
 * Create student activity logs
 */
export async function seedStudentActivity(
  instructorId: string,
  studentId: string,
  courseId: string,
  count: number = 10
) {
  const activityTypes = [
    'enrolled',
    'lesson_started',
    'lesson_completed',
    'assignment_submitted',
    'quiz_passed',
  ] as const

  const activities = []

  for (let i = 0; i < count; i++) {
    const type = activityTypes[i % activityTypes.length]

    const { data } = await supabase
      .from('student_activity')
      .insert({
        instructor_id: instructorId,
        student_id: studentId,
        activity_type: type,
        activity_title: `${type.replace('_', ' ')} - Lesson ${i + 1}`,
        activity_description: `Student completed activity: ${type}`,
        course_id: courseId,
        occurred_at: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    if (data) activities.push(data)
  }

  return activities
}

/**
 * Cleanup all test data for an instructor
 */
export async function cleanupInstructorData(instructorId: string) {
  // Order matters due to foreign key constraints

  // Delete activity
  await supabase.from('student_activity').delete().eq('instructor_id', instructorId)

  // Delete transactions
  await supabase.from('revenue_transactions').delete().eq('instructor_id', instructorId)

  // Delete student progress
  await supabase
    .from('student_progress')
    .delete()
    .in('course_id', supabase.from('courses').select('id').eq('instructor_id', instructorId))

  // Delete enrollments
  await supabase
    .from('course_enrollments')
    .delete()
    .in('course_id', supabase.from('courses').select('id').eq('instructor_id', instructorId))

  // Delete reviews
  await supabase
    .from('course_reviews')
    .delete()
    .in('course_id', supabase.from('courses').select('id').eq('instructor_id', instructorId))

  // Delete workshop feedback
  await supabase
    .from('workshop_feedback')
    .delete()
    .in('workshop_id', supabase.from('workshops').select('id').eq('instructor_id', instructorId))

  // Delete workshop registrations
  await supabase
    .from('workshop_registrations')
    .delete()
    .in('workshop_id', supabase.from('workshops').select('id').eq('instructor_id', instructorId))

  // Delete workshops
  await supabase.from('workshops').delete().eq('instructor_id', instructorId)

  // Delete courses
  await supabase.from('courses').delete().eq('instructor_id', instructorId)

  // Delete instructor settings
  await supabase.from('instructor_settings').delete().eq('user_id', instructorId)

  // Delete instructor profile
  await supabase.from('instructor_profiles').delete().eq('user_id', instructorId)
}

/**
 * Reset database to clean state (for test isolation)
 */
export async function resetTestDatabase() {
  // Truncate all test data
  // WARNING: Only use in test environment
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('resetTestDatabase can only be called in test environment')
  }

  const tables = [
    'student_activity',
    'revenue_transactions',
    'student_progress',
    'course_enrollments',
    'course_reviews',
    'workshop_feedback',
    'workshop_registrations',
    'workshop_facilitators',
    'course_instructors',
    'workshops',
    'courses',
    'instructor_settings',
    'instructor_profiles',
  ]

  for (const table of tables) {
    await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
  }
}

/**
 * Get instructor dashboard stats for verification
 */
export async function getInstructorStats(instructorId: string) {
  const { data, error } = await supabase.rpc('get_instructor_dashboard_stats', {
    p_instructor_id: instructorId,
  })

  if (error) {
    throw new Error(`Failed to get instructor stats: ${error.message}`)
  }

  return data
}

/**
 * Verify RLS policies are working
 */
export async function verifyRLSPolicies(userId: string, role: string) {
  // Switch to user context (not service role)
  const userClient = createClient(
    SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Try to access data based on role
  if (role === 'instructor') {
    const { data: courses } = await userClient
      .from('courses')
      .select('*')
      .eq('instructor_id', userId)

    const { data: students } = await userClient
      .from('student_progress')
      .select('*')

    return {
      canAccessOwnCourses: (courses?.length ?? 0) > 0,
      canAccessStudentProgress: students !== null,
    }
  }

  return null
}
