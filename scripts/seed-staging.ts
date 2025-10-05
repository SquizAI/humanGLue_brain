#!/usr/bin/env tsx
/**
 * ============================================================================
 * Staging Data Seeder for HumanGlue Platform
 * ============================================================================
 * This script seeds the staging database with realistic test data including:
 * - Admin, instructor, and client users
 * - Organizations
 * - Courses and workshops
 * - Assessments
 * - Enrollments
 *
 * Usage:
 *   npm run seed:staging
 *   or
 *   tsx scripts/seed-staging.ts
 *
 * Prerequisites:
 *   - SUPABASE_URL environment variable
 *   - SUPABASE_SERVICE_ROLE_KEY environment variable (for staging)
 * ============================================================================
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// ============================================================================
// Configuration
// ============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// ============================================================================
// Seed Data
// ============================================================================

const SEED_DATA = {
  organizations: [
    {
      name: 'Tech Innovators Inc',
      slug: 'tech-innovators',
      description: 'Leading technology consulting firm',
      website: 'https://techinnovators.example.com',
      industry: 'Technology',
      size: 'medium',
      status: 'active',
    },
    {
      name: 'Global Healthcare Solutions',
      slug: 'global-healthcare',
      description: 'Healthcare technology and services',
      website: 'https://globalhealthcare.example.com',
      industry: 'Healthcare',
      size: 'large',
      status: 'active',
    },
    {
      name: 'Startup Accelerator',
      slug: 'startup-accelerator',
      description: 'Helping startups scale',
      website: 'https://startupaccel.example.com',
      industry: 'Venture Capital',
      size: 'small',
      status: 'active',
    },
  ],

  users: [
    // Admin users
    {
      email: 'admin@humanglue.ai',
      full_name: 'Admin User',
      role: 'admin',
      status: 'active',
      organization_id: null,
    },
    {
      email: 'super-admin@humanglue.ai',
      full_name: 'Super Admin',
      role: 'admin',
      status: 'active',
      organization_id: null,
    },

    // Instructor users
    {
      email: 'instructor1@humanglue.ai',
      full_name: 'Sarah Johnson',
      role: 'instructor',
      status: 'active',
      bio: 'Leadership and communication expert with 15+ years of experience',
      avatar_url: 'https://i.pravatar.cc/150?img=1',
      organization_id: null,
    },
    {
      email: 'instructor2@humanglue.ai',
      full_name: 'Michael Chen',
      role: 'instructor',
      status: 'active',
      bio: 'AI and technology transformation specialist',
      avatar_url: 'https://i.pravatar.cc/150?img=2',
      organization_id: null,
    },
    {
      email: 'instructor3@humanglue.ai',
      full_name: 'Emily Rodriguez',
      role: 'instructor',
      status: 'active',
      bio: 'Change management and organizational development consultant',
      avatar_url: 'https://i.pravatar.cc/150?img=3',
      organization_id: null,
    },

    // Client users (will be assigned to organizations)
    {
      email: 'john.smith@techinnovators.example.com',
      full_name: 'John Smith',
      role: 'client',
      status: 'active',
      avatar_url: 'https://i.pravatar.cc/150?img=11',
    },
    {
      email: 'jane.doe@techinnovators.example.com',
      full_name: 'Jane Doe',
      role: 'client',
      status: 'active',
      avatar_url: 'https://i.pravatar.cc/150?img=12',
    },
    {
      email: 'dr.wilson@globalhealthcare.example.com',
      full_name: 'Dr. Robert Wilson',
      role: 'client',
      status: 'active',
      avatar_url: 'https://i.pravatar.cc/150?img=13',
    },
    {
      email: 'sarah.kim@startupaccel.example.com',
      full_name: 'Sarah Kim',
      role: 'client',
      status: 'active',
      avatar_url: 'https://i.pravatar.cc/150?img=14',
    },
  ],

  courses: [
    {
      title: 'AI Leadership Fundamentals',
      slug: 'ai-leadership-fundamentals',
      description: 'Learn to lead AI transformation initiatives in your organization',
      status: 'published',
      duration_weeks: 8,
      level: 'intermediate',
      category: 'Leadership',
      objectives: [
        'Understand AI capabilities and limitations',
        'Develop AI strategy for your organization',
        'Lead AI transformation initiatives',
        'Build AI-ready teams',
      ],
    },
    {
      title: 'Executive Communication Mastery',
      slug: 'executive-communication',
      description: 'Master the art of executive-level communication',
      status: 'published',
      duration_weeks: 6,
      level: 'advanced',
      category: 'Communication',
      objectives: [
        'Deliver compelling presentations',
        'Navigate difficult conversations',
        'Build executive presence',
        'Influence stakeholders effectively',
      ],
    },
    {
      title: 'Change Management Excellence',
      slug: 'change-management',
      description: 'Drive organizational change with confidence',
      status: 'published',
      duration_weeks: 10,
      level: 'intermediate',
      category: 'Change Management',
      objectives: [
        'Understand change psychology',
        'Develop change strategies',
        'Overcome resistance',
        'Measure change impact',
      ],
    },
  ],

  workshops: [
    {
      title: 'AI Bootcamp 2025',
      slug: 'ai-bootcamp-2025',
      description: 'Intensive 3-day workshop on AI implementation',
      status: 'scheduled',
      start_date: '2025-01-15',
      end_date: '2025-01-17',
      capacity: 50,
      price: 1999,
      location: 'Virtual',
      format: 'hybrid',
    },
    {
      title: 'Leadership Offsite',
      slug: 'leadership-offsite-q1',
      description: 'Quarterly leadership development offsite',
      status: 'scheduled',
      start_date: '2025-02-20',
      end_date: '2025-02-22',
      capacity: 30,
      price: 2999,
      location: 'San Francisco, CA',
      format: 'in-person',
    },
    {
      title: 'Communication Skills Workshop',
      slug: 'communication-skills-jan',
      description: 'Hands-on communication skills workshop',
      status: 'published',
      start_date: '2025-01-25',
      end_date: '2025-01-25',
      capacity: 40,
      price: 499,
      location: 'Virtual',
      format: 'virtual',
    },
  ],

  assessments: [
    {
      title: 'AI Readiness Assessment',
      slug: 'ai-readiness',
      description: 'Evaluate your organization\'s AI readiness',
      type: 'organizational',
      status: 'published',
      duration_minutes: 30,
      questions_count: 23,
    },
    {
      title: 'Leadership Competency Assessment',
      slug: 'leadership-competency',
      description: 'Assess your leadership capabilities',
      type: 'individual',
      status: 'published',
      duration_minutes: 45,
      questions_count: 50,
    },
    {
      title: '360 Feedback Assessment',
      slug: '360-feedback',
      description: 'Comprehensive 360-degree feedback',
      type: 'individual',
      status: 'published',
      duration_minutes: 60,
      questions_count: 75,
    },
  ],
}

// ============================================================================
// Seeding Functions
// ============================================================================

async function clearExistingData() {
  console.log('🗑️  Clearing existing staging data...')

  try {
    // Delete in correct order to respect foreign key constraints
    await supabase.from('enrollments').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('assessments').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('workshops').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('organizations').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    console.log('✅ Existing data cleared')
  } catch (error) {
    console.error('❌ Error clearing data:', error)
    throw error
  }
}

async function seedOrganizations() {
  console.log('🏢 Seeding organizations...')

  const { data, error } = await supabase
    .from('organizations')
    .insert(SEED_DATA.organizations as any)
    .select()

  if (error) {
    console.error('❌ Error seeding organizations:', error)
    throw error
  }

  console.log(`✅ Seeded ${data.length} organizations`)
  return data
}

async function seedUsers(organizations: any[]) {
  console.log('👥 Seeding users...')

  // Assign organization IDs to client users
  const usersWithOrgs = SEED_DATA.users.map((user, index) => {
    if (user.role === 'client' && organizations.length > 0) {
      const orgIndex = index % organizations.length
      return { ...user, organization_id: organizations[orgIndex].id }
    }
    return user
  })

  const { data, error } = await supabase
    .from('users')
    .insert(usersWithOrgs as any)
    .select()

  if (error) {
    console.error('❌ Error seeding users:', error)
    throw error
  }

  console.log(`✅ Seeded ${data.length} users`)
  return data
}

async function seedCourses(instructors: any[]) {
  console.log('📚 Seeding courses...')

  const coursesWithInstructors = SEED_DATA.courses.map((course, index) => ({
    ...course,
    instructor_id: instructors[index % instructors.length]?.id,
  }))

  const { data, error } = await supabase
    .from('courses')
    .insert(coursesWithInstructors as any)
    .select()

  if (error) {
    console.error('❌ Error seeding courses:', error)
    throw error
  }

  console.log(`✅ Seeded ${data.length} courses`)
  return data
}

async function seedWorkshops(instructors: any[]) {
  console.log('🎓 Seeding workshops...')

  const workshopsWithInstructors = SEED_DATA.workshops.map((workshop, index) => ({
    ...workshop,
    instructor_id: instructors[index % instructors.length]?.id,
  }))

  const { data, error } = await supabase
    .from('workshops')
    .insert(workshopsWithInstructors as any)
    .select()

  if (error) {
    console.error('❌ Error seeding workshops:', error)
    throw error
  }

  console.log(`✅ Seeded ${data.length} workshops`)
  return data
}

async function seedAssessments() {
  console.log('📝 Seeding assessments...')

  const { data, error } = await supabase
    .from('assessments')
    .insert(SEED_DATA.assessments as any)
    .select()

  if (error) {
    console.error('❌ Error seeding assessments:', error)
    throw error
  }

  console.log(`✅ Seeded ${data.length} assessments`)
  return data
}

async function seedEnrollments(users: any[], courses: any[], workshops: any[]) {
  console.log('📋 Seeding enrollments...')

  const clients = users.filter((u) => u.role === 'client')
  const enrollments = []

  // Enroll some clients in courses
  for (let i = 0; i < Math.min(clients.length, courses.length); i++) {
    enrollments.push({
      user_id: clients[i].id,
      course_id: courses[i % courses.length].id,
      status: 'active',
      progress: Math.floor(Math.random() * 100),
    })
  }

  // Enroll some clients in workshops
  for (let i = 0; i < Math.min(clients.length, workshops.length); i++) {
    enrollments.push({
      user_id: clients[i].id,
      workshop_id: workshops[i % workshops.length].id,
      status: 'confirmed',
    })
  }

  if (enrollments.length > 0) {
    const { data, error } = await supabase.from('enrollments').insert(enrollments as any).select()

    if (error) {
      console.error('❌ Error seeding enrollments:', error)
      throw error
    }

    console.log(`✅ Seeded ${data.length} enrollments`)
    return data
  }

  return []
}

// ============================================================================
// Main Function
// ============================================================================

async function main() {
  console.log('============================================================')
  console.log('🌱 HumanGlue Staging Data Seeder')
  console.log('============================================================')
  console.log(`Supabase URL: ${SUPABASE_URL}`)
  console.log('============================================================\n')

  try {
    // Step 1: Clear existing data
    await clearExistingData()

    // Step 2: Seed organizations
    const organizations = await seedOrganizations()

    // Step 3: Seed users
    const users = await seedUsers(organizations)
    const instructors = users.filter((u) => u.role === 'instructor')

    // Step 4: Seed courses
    const courses = await seedCourses(instructors)

    // Step 5: Seed workshops
    const workshops = await seedWorkshops(instructors)

    // Step 6: Seed assessments
    await seedAssessments()

    // Step 7: Seed enrollments
    await seedEnrollments(users, courses, workshops)

    console.log('\n============================================================')
    console.log('✅ Seeding completed successfully!')
    console.log('============================================================')
    console.log(`Organizations: ${organizations.length}`)
    console.log(`Users: ${users.length}`)
    console.log(`  - Admins: ${users.filter((u) => u.role === 'admin').length}`)
    console.log(`  - Instructors: ${instructors.length}`)
    console.log(`  - Clients: ${users.filter((u) => u.role === 'client').length}`)
    console.log(`Courses: ${courses.length}`)
    console.log(`Workshops: ${workshops.length}`)
    console.log('============================================================\n')
    console.log('🔐 Test Accounts:')
    console.log('   Admin: admin@humanglue.ai')
    console.log('   Instructor: instructor1@humanglue.ai')
    console.log('   Client: john.smith@techinnovators.example.com')
    console.log('============================================================')
  } catch (error) {
    console.error('\n❌ Seeding failed:', error)
    process.exit(1)
  }
}

// Run the seeder
main()
