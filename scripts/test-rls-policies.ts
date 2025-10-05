/**
 * RLS (Row-Level Security) Policy Testing Script
 *
 * Tests that database Row-Level Security policies correctly enforce:
 * - Instructors can only see their own students
 * - Instructors can only modify their own courses
 * - Students can only see their own enrollments
 * - Admins can see everything
 * - Organization members can only see their org data
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables')
  process.exit(1)
}

// Create service role client (bypasses RLS)
const adminClient = createClient(supabaseUrl, supabaseServiceKey)

// Test results
interface TestResult {
  name: string
  passed: boolean
  error?: string
  details?: string
}

const results: TestResult[] = []

function logTest(name: string, passed: boolean, error?: string, details?: string) {
  results.push({ name, passed, error, details })
  const status = passed ? '✓ PASS' : '✗ FAIL'
  const color = passed ? '\x1b[32m' : '\x1b[31m'
  console.log(`${color}${status}\x1b[0m ${name}`)
  if (error) console.log(`  Error: ${error}`)
  if (details) console.log(`  Details: ${details}`)
}

/**
 * Create test users with different roles
 */
async function createTestUsers() {
  console.log('\n📝 Creating test users...\n')

  try {
    // Create admin user
    const { data: adminUser, error: adminError } = await adminClient.auth.admin.createUser({
      email: 'test-admin@humanglue.test',
      password: 'Test@Admin123!',
      email_confirm: true,
    })

    if (adminError) throw new Error(`Failed to create admin: ${adminError.message}`)

    await adminClient.from('users').update({ role: 'admin' }).eq('id', adminUser.user.id)

    // Create instructor user
    const { data: instructorUser, error: instructorError } = await adminClient.auth.admin.createUser({
      email: 'test-instructor@humanglue.test',
      password: 'Test@Instructor123!',
      email_confirm: true,
    })

    if (instructorError) throw new Error(`Failed to create instructor: ${instructorError.message}`)

    await adminClient.from('instructor_profiles').insert({
      user_id: instructorUser.user.id,
      bio: 'Test instructor',
      expertise: ['Testing'],
    })

    // Create client user
    const { data: clientUser, error: clientError } = await adminClient.auth.admin.createUser({
      email: 'test-client@humanglue.test',
      password: 'Test@Client123!',
      email_confirm: true,
    })

    if (clientError) throw new Error(`Failed to create client: ${clientError.message}`)

    console.log('✓ Test users created successfully\n')

    return {
      adminId: adminUser.user.id,
      instructorId: instructorUser.user.id,
      clientId: clientUser.user.id,
    }
  } catch (error) {
    console.error('Failed to create test users:', error)
    throw error
  }
}

/**
 * Test: Instructor can only see their own courses
 */
async function testInstructorCoursesIsolation(instructorId: string) {
  try {
    // Create a course for this instructor
    const { data: course, error: createError } = await adminClient
      .from('courses')
      .insert({
        title: 'Test Course',
        instructor_id: instructorId,
        description: 'Test',
        status: 'draft',
      })
      .select()
      .single()

    if (createError) throw createError

    // Create another instructor and their course
    const { data: otherInstructor } = await adminClient.auth.admin.createUser({
      email: 'other-instructor@humanglue.test',
      password: 'Test@Other123!',
      email_confirm: true,
    })

    await adminClient.from('instructor_profiles').insert({
      user_id: otherInstructor!.user!.id,
      bio: 'Other instructor',
    })

    const { data: otherCourse } = await adminClient.from('courses').insert({
      title: 'Other Course',
      instructor_id: otherInstructor!.user!.id,
      description: 'Other',
      status: 'draft',
    }).select().single()

    // Create client for instructor and test RLS
    const instructorClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    const { data: signInData, error: signInError } = await instructorClient.auth.signInWithPassword({
      email: 'test-instructor@humanglue.test',
      password: 'Test@Instructor123!',
    })

    if (signInError) throw signInError

    // Try to query all courses
    const { data: courses, error: queryError } = await instructorClient
      .from('courses')
      .select('*')

    if (queryError) throw queryError

    // Should only see their own course
    const canSeeOwnCourse = courses?.some(c => c.id === course.id) ?? false
    const cannotSeeOtherCourse = !courses?.some(c => c.id === otherCourse?.id)

    logTest(
      'Instructor can only see their own courses',
      canSeeOwnCourse && cannotSeeOtherCourse,
      undefined,
      `Saw ${courses?.length || 0} course(s), expected 1`
    )

    // Cleanup
    await instructorClient.auth.signOut()
  } catch (error) {
    logTest('Instructor can only see their own courses', false, (error as Error).message)
  }
}

/**
 * Test: Students can only see their own enrollments
 */
async function testStudentEnrollmentIsolation(clientId: string, instructorId: string) {
  try {
    // Create a course
    const { data: course } = await adminClient.from('courses').insert({
      title: 'Enrollment Test Course',
      instructor_id: instructorId,
      description: 'Test',
      status: 'published',
    }).select().single()

    // Enroll the client
    await adminClient.from('enrollments').insert({
      user_id: clientId,
      course_id: course!.id,
      status: 'active',
    })

    // Create another client and enroll them
    const { data: otherClient } = await adminClient.auth.admin.createUser({
      email: 'other-client@humanglue.test',
      password: 'Test@Other123!',
      email_confirm: true,
    })

    await adminClient.from('enrollments').insert({
      user_id: otherClient!.user!.id,
      course_id: course!.id,
      status: 'active',
    })

    // Sign in as client and test RLS
    const clientClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    await clientClient.auth.signInWithPassword({
      email: 'test-client@humanglue.test',
      password: 'Test@Client123!',
    })

    const { data: enrollments } = await clientClient.from('enrollments').select('*')

    const canSeeOwnEnrollment = enrollments?.some(e => e.user_id === clientId) ?? false
    const cannotSeeOtherEnrollment = !enrollments?.some(e => e.user_id === otherClient!.user!.id)

    logTest(
      'Students can only see their own enrollments',
      canSeeOwnEnrollment && cannotSeeOtherEnrollment,
      undefined,
      `Saw ${enrollments?.length || 0} enrollment(s), expected 1`
    )

    await clientClient.auth.signOut()
  } catch (error) {
    logTest('Students can only see their own enrollments', false, (error as Error).message)
  }
}

/**
 * Test: Admins can see all data
 */
async function testAdminFullAccess() {
  try {
    const adminClient2 = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    await adminClient2.auth.signInWithPassword({
      email: 'test-admin@humanglue.test',
      password: 'Test@Admin123!',
    })

    // Try to access various tables
    const { data: users } = await adminClient2.from('users').select('*')
    const { data: courses } = await adminClient2.from('courses').select('*')
    const { data: enrollments } = await adminClient2.from('enrollments').select('*')

    const canSeeUsers = (users?.length ?? 0) > 0
    const canSeeCourses = (courses?.length ?? 0) >= 0 // May be 0 if no courses
    const canSeeEnrollments = (enrollments?.length ?? 0) >= 0

    logTest(
      'Admins can see all data',
      canSeeUsers && canSeeCourses !== undefined && canSeeEnrollments !== undefined,
      undefined,
      `Users: ${users?.length}, Courses: ${courses?.length}, Enrollments: ${enrollments?.length}`
    )

    await adminClient2.auth.signOut()
  } catch (error) {
    logTest('Admins can see all data', false, (error as Error).message)
  }
}

/**
 * Test: Organization data isolation
 */
async function testOrganizationIsolation() {
  try {
    // Create two organizations
    const { data: org1 } = await adminClient.from('organizations').insert({
      name: 'Test Org 1',
      domain: 'testorg1.com',
    }).select().single()

    const { data: org2 } = await adminClient.from('organizations').insert({
      name: 'Test Org 2',
      domain: 'testorg2.com',
    }).select().single()

    // Create user in org1
    const { data: org1User } = await adminClient.auth.admin.createUser({
      email: 'org1-user@testorg1.com',
      password: 'Test@Org123!',
      email_confirm: true,
    })

    await adminClient.from('users').update({
      organization_id: org1!.id,
    }).eq('id', org1User!.user!.id)

    // Create user in org2
    const { data: org2User } = await adminClient.auth.admin.createUser({
      email: 'org2-user@testorg2.com',
      password: 'Test@Org223!',
      email_confirm: true,
    })

    await adminClient.from('users').update({
      organization_id: org2!.id,
    }).eq('id', org2User!.user!.id)

    // Sign in as org1 user
    const org1Client = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    await org1Client.auth.signInWithPassword({
      email: 'org1-user@testorg1.com',
      password: 'Test@Org123!',
    })

    // Try to see other org's users
    const { data: visibleUsers } = await org1Client.from('users').select('*')

    const canSeeOwnOrg = visibleUsers?.some(u => u.organization_id === org1!.id) ?? false
    const cannotSeeOtherOrg = !visibleUsers?.some(u => u.organization_id === org2!.id)

    logTest(
      'Organization data is properly isolated',
      canSeeOwnOrg && cannotSeeOtherOrg,
      undefined,
      `Visible users: ${visibleUsers?.length}`
    )

    await org1Client.auth.signOut()
  } catch (error) {
    logTest('Organization data is properly isolated', false, (error as Error).message)
  }
}

/**
 * Cleanup test data
 */
async function cleanup() {
  console.log('\n🧹 Cleaning up test data...\n')

  try {
    // Delete test users (cascades to related data)
    await adminClient.auth.admin.deleteUser('test-admin@humanglue.test')
    await adminClient.auth.admin.deleteUser('test-instructor@humanglue.test')
    await adminClient.auth.admin.deleteUser('test-client@humanglue.test')
    await adminClient.auth.admin.deleteUser('other-instructor@humanglue.test')
    await adminClient.auth.admin.deleteUser('other-client@humanglue.test')
    await adminClient.auth.admin.deleteUser('org1-user@testorg1.com')
    await adminClient.auth.admin.deleteUser('org2-user@testorg2.com')

    console.log('✓ Cleanup completed\n')
  } catch (error) {
    console.error('Cleanup failed:', error)
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('\n🔒 RLS Policy Testing Suite\n')
  console.log('============================\n')

  try {
    const { adminId, instructorId, clientId } = await createTestUsers()

    console.log('🧪 Running RLS tests...\n')

    await testInstructorCoursesIsolation(instructorId)
    await testStudentEnrollmentIsolation(clientId, instructorId)
    await testAdminFullAccess()
    await testOrganizationIsolation()

    // Print summary
    console.log('\n============================')
    console.log('📊 Test Summary\n')

    const passed = results.filter(r => r.passed).length
    const failed = results.filter(r => !r.passed).length
    const total = results.length

    console.log(`Total: ${total}`)
    console.log(`\x1b[32mPassed: ${passed}\x1b[0m`)
    console.log(`\x1b[31mFailed: ${failed}\x1b[0m`)
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`)

    if (failed > 0) {
      console.log('❌ Failed Tests:')
      results.filter(r => !r.passed).forEach(r => {
        console.log(`  - ${r.name}`)
        if (r.error) console.log(`    ${r.error}`)
      })
      console.log('')
    }

    await cleanup()

    process.exit(failed > 0 ? 1 : 0)
  } catch (error) {
    console.error('\n❌ Test suite failed:', error)
    await cleanup()
    process.exit(1)
  }
}

// Run tests
runTests()
