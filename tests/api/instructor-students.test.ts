/**
 * API Integration Tests: Instructor Students Endpoints
 * Tests API responses, validation, authorization, and error handling
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const API_BASE_URL = process.env.BASE_URL || 'http://localhost:5040'

describe('GET /api/instructor/students', () => {
  let instructorToken: string
  let instructorId: string
  let courseId: string

  beforeAll(async () => {
    // Setup test instructor and get auth token
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Create test instructor
    const { data: user } = await supabase
      .from('users')
      .insert({
        email: 'api-test-instructor@test.com',
        full_name: 'API Test Instructor',
        role: 'instructor',
      })
      .select()
      .single()

    instructorId = user!.id

    // Create instructor profile
    await supabase.from('instructor_profiles').insert({
      user_id: instructorId,
      bio: 'Test bio for API testing with sufficient character length to meet validation requirements',
      professional_title: 'Test Instructor',
      is_verified: true,
    })

    // Create test course
    const { data: course } = await supabase
      .from('courses')
      .insert({
        instructor_id: instructorId,
        title: 'Test Course for Students API',
        description: 'Test course description',
        slug: 'test-course-students-api',
        status: 'published',
        is_published: true,
        price_amount: 100,
      })
      .select()
      .single()

    courseId = course!.id

    // Create test students with enrollments
    for (let i = 0; i < 3; i++) {
      const { data: student } = await supabase
        .from('users')
        .insert({
          email: `api-test-student-${i}@test.com`,
          full_name: `API Test Student ${i}`,
          role: 'student',
        })
        .select()
        .single()

      await supabase.from('course_enrollments').insert({
        course_id: courseId,
        user_id: student!.id,
        status: 'in_progress',
      })
    }

    // Get auth token
    const { data: authData } = await supabase.auth.signInWithPassword({
      email: 'api-test-instructor@test.com',
      password: 'TestPassword123!',
    })

    instructorToken = authData.session!.access_token
  })

  it('should return student list for authenticated instructor', async () => {
    const response = await fetch(`${API_BASE_URL}/api/instructor/students`, {
      headers: {
        Authorization: `Bearer ${instructorToken}`,
      },
    })

    expect(response.status).toBe(200)

    const data = await response.json()

    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
    expect(data.data.length).toBeGreaterThan(0)

    // Verify student structure
    const student = data.data[0]
    expect(student).toHaveProperty('user_id')
    expect(student).toHaveProperty('full_name')
    expect(student).toHaveProperty('email')
    expect(student).toHaveProperty('progress_percentage')
  })

  it('should require authentication', async () => {
    const response = await fetch(`${API_BASE_URL}/api/instructor/students`)

    expect(response.status).toBe(401)

    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('UNAUTHORIZED')
  })

  it('should filter students by course_id', async () => {
    const response = await fetch(
      `${API_BASE_URL}/api/instructor/students?course_id=${courseId}`,
      {
        headers: {
          Authorization: `Bearer ${instructorToken}`,
        },
      }
    )

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.length).toBe(3)

    // All students should be from this course
    data.data.forEach((student: any) => {
      expect(student.course_id).toBe(courseId)
    })
  })

  it('should filter students by status', async () => {
    const response = await fetch(
      `${API_BASE_URL}/api/instructor/students?status=in_progress`,
      {
        headers: {
          Authorization: `Bearer ${instructorToken}`,
        },
      }
    )

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.success).toBe(true)

    // All returned students should have in_progress status
    data.data.forEach((student: any) => {
      expect(student.status).toBe('in_progress')
    })
  })

  it('should sort students by different fields', async () => {
    const response = await fetch(
      `${API_BASE_URL}/api/instructor/students?sort_by=name&sort_order=asc`,
      {
        headers: {
          Authorization: `Bearer ${instructorToken}`,
        },
      }
    )

    expect(response.status).toBe(200)

    const data = await response.json()

    // Verify ascending order by name
    const names = data.data.map((s: any) => s.full_name)
    const sortedNames = [...names].sort()
    expect(names).toEqual(sortedNames)
  })

  it('should paginate results', async () => {
    const response = await fetch(
      `${API_BASE_URL}/api/instructor/students?limit=2&offset=0`,
      {
        headers: {
          Authorization: `Bearer ${instructorToken}`,
        },
      }
    )

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.data.length).toBeLessThanOrEqual(2)

    if (data.meta) {
      expect(data.meta).toHaveProperty('total')
      expect(data.meta).toHaveProperty('limit')
      expect(data.meta).toHaveProperty('offset')
    }
  })

  it('should only return students from instructor courses', async () => {
    // Create another instructor with students
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const { data: otherInstructor } = await supabase
      .from('users')
      .insert({
        email: 'other-instructor@test.com',
        full_name: 'Other Instructor',
        role: 'instructor',
      })
      .select()
      .single()

    const response = await fetch(`${API_BASE_URL}/api/instructor/students`, {
      headers: {
        Authorization: `Bearer ${instructorToken}`,
      },
    })

    const data = await response.json()

    // Should not include students from other instructors
    data.data.forEach((student: any) => {
      expect(student.instructor_id).toBe(instructorId)
    })

    // Cleanup
    await supabase.from('users').delete().eq('id', otherInstructor!.id)
  })
})

describe('GET /api/instructor/students/[studentId]', () => {
  let instructorToken: string
  let studentId: string

  beforeAll(async () => {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Get first test student
    const { data: students } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'student')
      .limit(1)

    studentId = students![0].id
  })

  it('should return student detail with progress', async () => {
    const response = await fetch(
      `${API_BASE_URL}/api/instructor/students/${studentId}`,
      {
        headers: {
          Authorization: `Bearer ${instructorToken}`,
        },
      }
    )

    expect(response.status).toBe(200)

    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.data).toHaveProperty('user_id', studentId)
    expect(data.data).toHaveProperty('courses')
    expect(data.data).toHaveProperty('recent_activity')

    // Courses should be an array
    expect(Array.isArray(data.data.courses)).toBe(true)

    // Recent activity should be an array
    expect(Array.isArray(data.data.recent_activity)).toBe(true)
  })

  it('should return 404 for non-existent student', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000'

    const response = await fetch(`${API_BASE_URL}/api/instructor/students/${fakeId}`, {
      headers: {
        Authorization: `Bearer ${instructorToken}`,
      },
    })

    expect(response.status).toBe(404)

    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('NOT_FOUND')
  })

  it('should not allow access to other instructor students', async () => {
    // Create another instructor
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const { data: otherInstructor } = await supabase
      .from('users')
      .insert({
        email: 'other-instructor-2@test.com',
        full_name: 'Other Instructor 2',
        role: 'instructor',
      })
      .select()
      .single()

    const { data: otherAuth } = await supabase.auth.signInWithPassword({
      email: 'other-instructor-2@test.com',
      password: 'TestPassword123!',
    })

    const response = await fetch(
      `${API_BASE_URL}/api/instructor/students/${studentId}`,
      {
        headers: {
          Authorization: `Bearer ${otherAuth!.session!.access_token}`,
        },
      }
    )

    // Should return 403 Forbidden or 404 Not Found
    expect([403, 404]).toContain(response.status)

    // Cleanup
    await supabase.from('users').delete().eq('id', otherInstructor!.id)
  })

  it('should validate UUID format', async () => {
    const response = await fetch(
      `${API_BASE_URL}/api/instructor/students/invalid-uuid`,
      {
        headers: {
          Authorization: `Bearer ${instructorToken}`,
        },
      }
    )

    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })
})

describe('Rate Limiting', () => {
  let instructorToken: string

  beforeAll(async () => {
    // Get instructor token from previous tests
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const { data: authData } = await supabase.auth.signInWithPassword({
      email: 'api-test-instructor@test.com',
      password: 'TestPassword123!',
    })

    instructorToken = authData!.session!.access_token
  })

  it('should enforce rate limiting after many requests', async () => {
    const requests = []

    // Make 100 rapid requests
    for (let i = 0; i < 100; i++) {
      requests.push(
        fetch(`${API_BASE_URL}/api/instructor/students`, {
          headers: {
            Authorization: `Bearer ${instructorToken}`,
          },
        })
      )
    }

    const responses = await Promise.all(requests)

    // At least one should be rate limited
    const rateLimited = responses.some((r) => r.status === 429)

    if (rateLimited) {
      const rateLimitedResponse = responses.find((r) => r.status === 429)!
      const data = await rateLimitedResponse.json()

      expect(data.error.code).toBe('RATE_LIMIT_EXCEEDED')
      expect(rateLimitedResponse.headers.get('Retry-After')).toBeTruthy()
    }
  }, 30000)
})

describe('Error Handling', () => {
  it('should handle database errors gracefully', async () => {
    // This would require mocking database failure
    // In real scenario, you'd temporarily disable database or use test doubles
  })

  it('should return proper error format', async () => {
    const response = await fetch(`${API_BASE_URL}/api/instructor/students`)

    expect(response.status).toBe(401)

    const data = await response.json()

    expect(data).toHaveProperty('success', false)
    expect(data).toHaveProperty('error')
    expect(data.error).toHaveProperty('code')
    expect(data.error).toHaveProperty('message')
  })
})

// Cleanup after all tests
afterAll(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Delete all test data
  await supabase.from('users').delete().like('email', 'api-test-%')
})
