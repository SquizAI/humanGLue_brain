/**
 * Seed Test Data Script
 *
 * Creates comprehensive test data for HumanGlue platform:
 * - Users (admin, org admins, instructors, students)
 * - Organizations and teams
 * - Instructor profiles
 * - Courses and lessons
 * - Workshops
 * - Enrollments and progress
 * - Student activity
 * - Notifications
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../supabase/types/database.types'

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Test data IDs (for consistency)
const IDS = {
  // Organizations
  org1: '00000000-0000-0000-0000-000000000001',
  org2: '00000000-0000-0000-0000-000000000002',

  // Teams
  team1: '00000000-0000-0000-0000-000000000011',
  team2: '00000000-0000-0000-0000-000000000012',
  team3: '00000000-0000-0000-0000-000000000013',

  // Users
  admin: '00000000-0000-0000-0000-000000000101',
  orgAdmin1: '00000000-0000-0000-0000-000000000102',
  orgAdmin2: '00000000-0000-0000-0000-000000000103',
  instructor1: '00000000-0000-0000-0000-000000000201',
  instructor2: '00000000-0000-0000-0000-000000000202',
  instructor3: '00000000-0000-0000-0000-000000000203',
  student1: '00000000-0000-0000-0000-000000000301',
  student2: '00000000-0000-0000-0000-000000000302',
  student3: '00000000-0000-0000-0000-000000000303',
  student4: '00000000-0000-0000-0000-000000000304',
  student5: '00000000-0000-0000-0000-000000000305',
  student6: '00000000-0000-0000-0000-000000000306',
  student7: '00000000-0000-0000-0000-000000000307',
  student8: '00000000-0000-0000-0000-000000000308',
  student9: '00000000-0000-0000-0000-000000000309',
  student10: '00000000-0000-0000-0000-000000000310',

  // Courses
  course1: '00000000-0000-0000-0000-000000000401',
  course2: '00000000-0000-0000-0000-000000000402',
  course3: '00000000-0000-0000-0000-000000000403',
  course4: '00000000-0000-0000-0000-000000000404',
  course5: '00000000-0000-0000-0000-000000000405',

  // Workshops
  workshop1: '00000000-0000-0000-0000-000000000501',
  workshop2: '00000000-0000-0000-0000-000000000502',
  workshop3: '00000000-0000-0000-0000-000000000503',
  workshop4: '00000000-0000-0000-0000-000000000504',
  workshop5: '00000000-0000-0000-0000-000000000505',
}

async function seedOrganizations() {
  console.log('🏢 Seeding Organizations...')

  const organizations = [
    {
      id: IDS.org1,
      name: 'TechCorp Solutions',
      slug: 'techcorp-solutions',
      industry: 'Technology',
      size_range: '201-500',
      subscription_tier: 'enterprise',
      subscription_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      max_users: 100,
      max_teams: 10,
      is_active: true,
    },
    {
      id: IDS.org2,
      name: 'Global Innovations Inc',
      slug: 'global-innovations',
      industry: 'Consulting',
      size_range: '51-200',
      subscription_tier: 'professional',
      subscription_expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      max_users: 50,
      max_teams: 5,
      is_active: true,
    },
  ]

  const { error } = await supabase.from('organizations').insert(organizations as any as any as any)
  if (error) console.error('Error seeding organizations:', error)
  else console.log(`✅ Created ${organizations.length} organizations`)
}

async function seedTeams() {
  console.log('👥 Seeding Teams...')

  const teams = [
    {
      id: IDS.team1,
      organization_id: IDS.org1,
      name: 'Engineering',
      description: 'Software development team',
      is_active: true,
    },
    {
      id: IDS.team2,
      organization_id: IDS.org1,
      name: 'Product Management',
      description: 'Product strategy and planning',
      is_active: true,
    },
    {
      id: IDS.team3,
      organization_id: IDS.org2,
      name: 'Consulting Team',
      description: 'Client-facing consultants',
      is_active: true,
    },
  ]

  const { error } = await supabase.from('teams').insert(teams as any as any)
  if (error) console.error('Error seeding teams:', error)
  else console.log(`✅ Created ${teams.length} teams`)
}

async function seedUsers() {
  console.log('👤 Seeding Users...')

  const users = [
    // Platform Admin
    {
      id: IDS.admin,
      email: 'admin@humanglue.ai',
      name: 'Platform Admin',
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      is_active: true,
    },

    // Organization Admins
    {
      id: IDS.orgAdmin1,
      organization_id: IDS.org1,
      email: 'admin@techcorp.com',
      name: 'Sarah Johnson',
      role: 'org_admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      is_active: true,
    },
    {
      id: IDS.orgAdmin2,
      organization_id: IDS.org2,
      email: 'admin@globalinnovations.com',
      name: 'Michael Chen',
      role: 'org_admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
      is_active: true,
    },

    // Instructors
    {
      id: IDS.instructor1,
      email: 'dr.emily@humanglue.ai',
      name: 'Dr. Emily Rodriguez',
      role: 'member',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
      is_active: true,
    },
    {
      id: IDS.instructor2,
      organization_id: IDS.org1,
      email: 'james@techcorp.com',
      name: 'James Patterson',
      role: 'member',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
      is_active: true,
    },
    {
      id: IDS.instructor3,
      email: 'maria@humanglue.ai',
      name: 'Maria Garcia',
      role: 'member',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
      is_active: true,
    },

    // Students
    ...Array.from({ length: 10 }, (_, i) => ({
      id: IDS[`student${i + 1}` as keyof typeof IDS],
      organization_id: i < 5 ? IDS.org1 : IDS.org2,
      email: `student${i + 1}@test.com`,
      name: `Student ${i + 1}`,
      role: 'member',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=student${i + 1}`,
      is_active: true,
    })),
  ]

  const { error } = await supabase.from('users').insert(users as any as any)
  if (error) console.error('Error seeding users:', error)
  else console.log(`✅ Created ${users.length} users`)
}

async function seedInstructorProfiles() {
  console.log('👨‍🏫 Seeding Instructor Profiles...')

  const profiles = [
    {
      user_id: IDS.instructor1,
      bio: 'Dr. Emily Rodriguez is a renowned expert in AI transformation with over 15 years of experience helping organizations adapt to technological change. She holds a PhD in Organizational Psychology and has consulted for Fortune 500 companies worldwide.',
      professional_title: 'AI Transformation Consultant',
      tagline: 'Empowering teams to thrive in the age of AI',
      expertise_tags: ['AI Transformation', 'Change Management', 'Leadership Development', 'Organizational Psychology'],
      pillars: ['adaptability', 'coaching'],
      education: [
        {
          degree: 'PhD in Organizational Psychology',
          institution: 'Stanford University',
          year: 2008
        },
        {
          degree: 'MS in Computer Science',
          institution: 'MIT',
          year: 2003
        }
      ],
      certifications: [
        {
          name: 'Certified AI Coach',
          issuer: 'International Coaching Federation',
          year: 2020,
          credential_url: 'https://example.com/cert1'
        }
      ],
      work_experience: [
        {
          title: 'Senior Consultant',
          company: 'McKinsey & Company',
          years: '2010-2018',
          description: 'Led AI transformation initiatives for global enterprises'
        }
      ],
      social_links: {
        linkedin: 'https://linkedin.com/in/emilyrodriguez',
        twitter: 'https://twitter.com/dremilyAI',
        website: 'https://emilyrodriguez.com'
      },
      is_verified: true,
      is_featured: true,
      is_accepting_students: true,
    },
    {
      user_id: IDS.instructor2,
      bio: 'James Patterson specializes in coaching engineering teams through AI adoption. With a background in software engineering and agile methodologies, he helps technical teams leverage AI tools effectively while maintaining quality and velocity.',
      professional_title: 'Engineering Coach & AI Specialist',
      tagline: 'Bridging the gap between engineering excellence and AI innovation',
      expertise_tags: ['Software Engineering', 'AI Tools', 'Agile Coaching', 'Team Leadership'],
      pillars: ['coaching', 'marketplace'],
      education: [
        {
          degree: 'BS in Computer Science',
          institution: 'UC Berkeley',
          year: 2012
        }
      ],
      certifications: [
        {
          name: 'Certified Scrum Master',
          issuer: 'Scrum Alliance',
          year: 2015,
          credential_url: 'https://example.com/cert2'
        }
      ],
      is_verified: true,
      is_featured: false,
      is_accepting_students: true,
    },
    {
      user_id: IDS.instructor3,
      bio: 'Maria Garcia is a marketplace expert who helps freelancers and consultants build successful AI-enhanced service businesses. She has personally built three successful consulting practices and mentored hundreds of independent professionals.',
      professional_title: 'Marketplace Strategy Consultant',
      tagline: 'Building thriving careers in the AI marketplace',
      expertise_tags: ['Freelancing', 'Business Development', 'Personal Branding', 'AI Services'],
      pillars: ['marketplace'],
      education: [
        {
          degree: 'MBA',
          institution: 'Harvard Business School',
          year: 2015
        }
      ],
      is_verified: true,
      is_featured: false,
      is_accepting_students: true,
    },
  ]

  const { error } = await supabase.from('instructor_profiles').insert(profiles as any as any)
  if (error) console.error('Error seeding instructor profiles:', error)
  else console.log(`✅ Created ${profiles.length} instructor profiles`)
}

async function seedCourses() {
  console.log('📚 Seeding Courses...')

  const courses = [
    {
      id: IDS.course1,
      instructor_id: IDS.instructor1,
      title: 'AI Adaptability Fundamentals',
      description: 'Learn the core principles of adapting to AI in your workplace. This comprehensive course covers mindset shifts, tool adoption strategies, and change management techniques.',
      thumbnail_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e',
      category: 'AI Transformation',
      difficulty: 'beginner',
      status: 'published',
      price_amount: 49900, // $499
      duration_hours: 8,
      max_students: 100,
      enrolled_count: 45,
      pillars: ['adaptability'],
      learning_objectives: [
        'Understand the impact of AI on workplace dynamics',
        'Develop strategies for continuous learning',
        'Build resilience during technological change'
      ],
      prerequisites: ['Basic computer literacy'],
      target_audience: 'Professionals experiencing AI transformation in their workplace',
      is_featured: true,
    },
    {
      id: IDS.course2,
      instructor_id: IDS.instructor1,
      title: 'Leadership in the Age of AI',
      description: 'Advanced course for leaders navigating AI transformation. Learn to lead teams through change, make strategic AI adoption decisions, and build an adaptive organizational culture.',
      thumbnail_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978',
      category: 'Leadership',
      difficulty: 'advanced',
      status: 'published',
      price_amount: 79900, // $799
      duration_hours: 12,
      max_students: 50,
      enrolled_count: 23,
      pillars: ['adaptability', 'coaching'],
      learning_objectives: [
        'Lead AI transformation initiatives',
        'Coach teams through technological change',
        'Build adaptive organizational cultures'
      ],
      prerequisites: ['Management experience', 'Completed AI Fundamentals or equivalent'],
      target_audience: 'Team leads, managers, and executives',
      is_featured: true,
    },
    {
      id: IDS.course3,
      instructor_id: IDS.instructor2,
      title: 'AI Tools for Engineers',
      description: 'Hands-on course teaching software engineers how to leverage AI coding assistants, testing tools, and automation to boost productivity without sacrificing code quality.',
      thumbnail_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
      category: 'Engineering',
      difficulty: 'intermediate',
      status: 'published',
      price_amount: 59900, // $599
      duration_hours: 10,
      max_students: 75,
      enrolled_count: 58,
      pillars: ['coaching'],
      learning_objectives: [
        'Master AI coding assistants (GitHub Copilot, Cursor, etc.)',
        'Implement AI-powered testing workflows',
        'Automate repetitive engineering tasks'
      ],
      prerequisites: ['2+ years programming experience'],
      target_audience: 'Software engineers and developers',
      is_featured: false,
    },
    {
      id: IDS.course4,
      instructor_id: IDS.instructor3,
      title: 'Building Your AI Consulting Practice',
      description: 'Complete guide to launching and growing a successful AI consulting business. Learn positioning, pricing, client acquisition, and service delivery strategies.',
      thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
      category: 'Business',
      difficulty: 'intermediate',
      status: 'published',
      price_amount: 69900, // $699
      duration_hours: 15,
      max_students: 60,
      enrolled_count: 34,
      pillars: ['marketplace'],
      learning_objectives: [
        'Define your consulting niche and positioning',
        'Price your services profitably',
        'Build a client acquisition system',
        'Deliver high-value AI consulting services'
      ],
      prerequisites: ['AI knowledge or relevant experience'],
      target_audience: 'Aspiring and early-stage AI consultants',
      is_featured: true,
    },
    {
      id: IDS.course5,
      instructor_id: IDS.instructor1,
      title: 'Personal AI Transformation Journey',
      description: 'Self-paced course for individuals wanting to future-proof their careers. Learn to identify AI opportunities in your field, develop in-demand skills, and stay relevant.',
      thumbnail_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
      category: 'Career Development',
      difficulty: 'beginner',
      status: 'draft',
      price_amount: 29900, // $299
      duration_hours: 6,
      max_students: 200,
      enrolled_count: 0,
      pillars: ['adaptability'],
      learning_objectives: [
        'Assess AI impact on your career',
        'Create a personal upskilling plan',
        'Build AI literacy and competency'
      ],
      prerequisites: [],
      target_audience: 'Anyone looking to adapt to AI in their career',
      is_featured: false,
    },
  ]

  const { error } = await supabase.from('courses').insert(courses as any as any)
  if (error) console.error('Error seeding courses:', error)
  else console.log(`✅ Created ${courses.length} courses`)
}

async function seedWorkshops() {
  console.log('🎯 Seeding Workshops...')

  const now = new Date()
  const workshops = [
    {
      id: IDS.workshop1,
      instructor_id: IDS.instructor1,
      title: 'AI Readiness Bootcamp',
      description: 'Intensive 2-day workshop preparing teams for AI transformation. Hands-on exercises, group discussions, and personalized action planning.',
      pillar: 'adaptability',
      workshop_type: 'hybrid',
      status: 'published',
      start_date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(now.getTime() + 32 * 24 * 60 * 60 * 1000).toISOString(),
      price_amount: 149900, // $1,499
      price_early_bird: 119900, // $1,199
      capacity_total: 30,
      capacity_remaining: 18,
      location: 'San Francisco, CA + Virtual',
      is_featured: true,
    },
    {
      id: IDS.workshop2,
      instructor_id: IDS.instructor2,
      title: 'AI Pair Programming Masterclass',
      description: 'Learn advanced techniques for collaborating with AI coding assistants. Live coding sessions, best practices, and real-world scenarios.',
      pillar: 'coaching',
      workshop_type: 'online',
      status: 'published',
      start_date: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      price_amount: 49900, // $499
      capacity_total: 50,
      capacity_remaining: 12,
      is_featured: false,
    },
    {
      id: IDS.workshop3,
      instructor_id: IDS.instructor3,
      title: 'Freelance AI Services Workshop',
      description: 'One-day intensive on packaging and selling AI services as a freelancer. Includes pricing strategies, proposal templates, and sales techniques.',
      pillar: 'marketplace',
      workshop_type: 'online',
      status: 'published',
      start_date: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      price_amount: 39900, // $399
      price_early_bird: 29900, // $299
      capacity_total: 40,
      capacity_remaining: 35,
      is_featured: false,
    },
    {
      id: IDS.workshop4,
      instructor_id: IDS.instructor1,
      title: 'Executive AI Strategy Session',
      description: 'Completed workshop - helped C-suite executives develop comprehensive AI adoption strategies for their organizations.',
      pillar: 'adaptability',
      workshop_type: 'in_person',
      status: 'completed',
      start_date: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(now.getTime() - 58 * 24 * 60 * 60 * 1000).toISOString(),
      price_amount: 299900, // $2,999
      capacity_total: 15,
      capacity_remaining: 0,
      location: 'New York, NY',
      is_featured: false,
    },
    {
      id: IDS.workshop5,
      instructor_id: IDS.instructor2,
      title: 'Team AI Integration Workshop',
      description: 'Past workshop - worked with engineering teams to integrate AI tools into their development workflow.',
      pillar: 'coaching',
      workshop_type: 'in_person',
      status: 'completed',
      start_date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000).toISOString(),
      price_amount: 89900, // $899
      capacity_total: 25,
      capacity_remaining: 0,
      location: 'Austin, TX',
      is_featured: false,
    },
  ]

  const { error } = await supabase.from('workshops').insert(workshops as any as any)
  if (error) console.error('Error seeding workshops:', error)
  else console.log(`✅ Created ${workshops.length} workshops`)
}

async function seedEnrollments() {
  console.log('📝 Seeding Enrollments...')

  const enrollments: any[] = []
  const students = [
    IDS.student1, IDS.student2, IDS.student3, IDS.student4, IDS.student5,
    IDS.student6, IDS.student7, IDS.student8, IDS.student9, IDS.student10
  ]

  // Enroll students in various courses with different progress levels
  const enrollmentPatterns = [
    { course: IDS.course1, students: [0, 1, 2, 3, 4, 5, 6, 7], progress: [100, 85, 70, 55, 40, 25, 10, 5] },
    { course: IDS.course2, students: [1, 2, 4, 6, 8], progress: [95, 80, 60, 30, 15] },
    { course: IDS.course3, students: [0, 2, 3, 5, 7, 9], progress: [100, 90, 75, 50, 35, 20] },
    { course: IDS.course4, students: [1, 3, 5, 7, 9], progress: [88, 72, 55, 40, 22] },
  ]

  enrollmentPatterns.forEach(pattern => {
    pattern.students.forEach((studentIdx, idx) => {
      const progress = pattern.progress[idx]
      const enrolledDate = new Date(Date.now() - (90 - studentIdx * 5) * 24 * 60 * 60 * 1000)
      const lastAccessed = new Date(Date.now() - (studentIdx + 1) * 2 * 24 * 60 * 60 * 1000)

      enrollments.push({
        user_id: students[studentIdx],
        course_id: pattern.course,
        status: progress === 100 ? 'completed' : progress > 50 ? 'in_progress' : 'enrolled',
        completion_percentage: progress,
        enrolled_at: enrolledDate.toISOString(),
        last_accessed_at: lastAccessed.toISOString(),
        completed_at: progress === 100 ? lastAccessed.toISOString() : null,
      })
    })
  })

  const { error } = await supabase.from('enrollments').insert(enrollments as any as any)
  if (error) console.error('Error seeding enrollments:', error)
  else console.log(`✅ Created ${enrollments.length} enrollments`)
}

async function seedStudentActivity() {
  console.log('⚡ Seeding Student Activity...')

  const activities = []
  const activityTypes = [
    'enrolled',
    'lesson_started',
    'lesson_completed',
    'quiz_passed',
    'assignment_submitted',
  ]

  // Create 50 activity records
  for (let i = 0; i < 50; i++) {
    const studentIdx = i % 10
    const courseIds = [IDS.course1, IDS.course2, IDS.course3, IDS.course4]
    const courseId = courseIds[i % courseIds.length]

    activities.push({
      user_id: IDS[`student${studentIdx + 1}` as keyof typeof IDS],
      course_id: courseId,
      activity_type: activityTypes[i % activityTypes.length],
      metadata: {
        lesson_title: `Lesson ${(i % 10) + 1}`,
        progress: Math.floor(Math.random() * 100),
      },
      created_at: new Date(Date.now() - (50 - i) * 60 * 60 * 1000).toISOString(),
    })
  }

  const { error } = await supabase.from('student_activity').insert(activities as any as any)
  if (error) console.error('Error seeding student activity:', error)
  else console.log(`✅ Created ${activities.length} activity records`)
}

async function seedNotifications() {
  console.log('🔔 Seeding Notifications...')

  const notifications = [
    {
      user_id: IDS.instructor1,
      type: 'enrollment',
      title: 'New Student Enrollment',
      message: 'Student 1 enrolled in AI Adaptability Fundamentals',
      data: {
        course_id: IDS.course1,
        student_id: IDS.student1,
      },
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      user_id: IDS.instructor1,
      type: 'completion',
      title: 'Course Completed',
      message: 'Student 2 completed AI Adaptability Fundamentals',
      data: {
        course_id: IDS.course1,
        student_id: IDS.student2,
      },
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      user_id: IDS.instructor2,
      type: 'review',
      title: 'New Course Review',
      message: 'Student 3 left a 5-star review for AI Tools for Engineers',
      data: {
        course_id: IDS.course3,
        student_id: IDS.student3,
        rating: 5,
      },
      created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    },
    {
      user_id: IDS.instructor1,
      type: 'workshop_registration',
      title: 'New Workshop Registration',
      message: 'Student 4 registered for AI Readiness Bootcamp',
      data: {
        workshop_id: IDS.workshop1,
        student_id: IDS.student4,
      },
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
  ]

  const { error } = await supabase.from('notifications').insert(notifications as any as any)
  if (error) console.error('Error seeding notifications:', error)
  else console.log(`✅ Created ${notifications.length} notifications`)
}

async function seedWorkshopRegistrations() {
  console.log('🎫 Seeding Workshop Registrations...')

  const registrations = [
    { workshop_id: IDS.workshop1, user_id: IDS.student1, status: 'registered' },
    { workshop_id: IDS.workshop1, user_id: IDS.student2, status: 'registered' },
    { workshop_id: IDS.workshop2, user_id: IDS.student3, status: 'registered' },
    { workshop_id: IDS.workshop2, user_id: IDS.student4, status: 'registered' },
    { workshop_id: IDS.workshop4, user_id: IDS.student5, status: 'attended' },
    { workshop_id: IDS.workshop4, user_id: IDS.student6, status: 'attended' },
    { workshop_id: IDS.workshop5, user_id: IDS.student7, status: 'attended' },
  ]

  const { error } = await supabase.from('workshop_registrations').insert(registrations as any as any)
  if (error) console.error('Error seeding workshop registrations:', error)
  else console.log(`✅ Created ${registrations.length} workshop registrations`)
}

async function runSeed() {
  console.log('\n🌱 HumanGlue Database Seeding\n')
  console.log('='.repeat(50))

  try {
    await seedOrganizations()
    await seedTeams()
    await seedUsers()
    await seedInstructorProfiles()
    await seedCourses()
    await seedWorkshops()
    await seedEnrollments()
    await seedStudentActivity()
    await seedNotifications()
    await seedWorkshopRegistrations()

    console.log('\n' + '='.repeat(50))
    console.log('\n✅ Database seeding completed successfully!\n')
    console.log('Test Credentials:')
    console.log('  Platform Admin: admin@humanglue.ai')
    console.log('  Instructor 1: dr.emily@humanglue.ai')
    console.log('  Instructor 2: james@techcorp.com')
    console.log('  Student: student1@test.com')
    console.log('\nNote: You can use any of these emails to test the system.\n')

  } catch (error) {
    console.error('\n❌ Seeding failed:', error)
    process.exit(1)
  }
}

// Run seeding
runSeed().catch(error => {
  console.error('\n❌ Seed script failed:', error)
  process.exit(1)
})
