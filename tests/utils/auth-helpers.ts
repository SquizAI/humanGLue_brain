/**
 * Authentication Helper Functions for E2E Tests
 * Handles login, logout, and session management for different user roles
 */

import { Page, BrowserContext } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export interface TestUser {
  id: string
  email: string
  password: string
  role: 'admin' | 'instructor' | 'student' | 'org_admin'
  full_name: string
  organization_id?: string
}

export const testUsers: Record<string, TestUser> = {
  instructor: {
    id: 'test-instructor-1',
    email: 'instructor@test.humanglue.ai',
    password: 'TestPassword123!',
    role: 'instructor',
    full_name: 'Test Instructor',
  },
  student: {
    id: 'test-student-1',
    email: 'student@test.humanglue.ai',
    password: 'TestPassword123!',
    role: 'student',
    full_name: 'Test Student',
  },
  admin: {
    id: 'test-admin-1',
    email: 'admin@test.humanglue.ai',
    password: 'TestPassword123!',
    role: 'admin',
    full_name: 'Test Admin',
  },
  orgAdmin: {
    id: 'test-org-admin-1',
    email: 'orgadmin@test.humanglue.ai',
    password: 'TestPassword123!',
    role: 'org_admin',
    full_name: 'Test Org Admin',
    organization_id: 'test-org-1',
  },
}

/**
 * Login as a specific user role
 */
export async function loginAs(page: Page, userType: keyof typeof testUsers) {
  const user = testUsers[userType]

  await page.goto('/login')

  await page.fill('[data-testid="input-email"]', user.email)
  await page.fill('[data-testid="input-password"]', user.password)

  await page.click('[data-testid="btn-login"]')

  // Wait for navigation to complete
  await page.waitForURL(/\/(instructor|student|admin|dashboard)/, { timeout: 10000 })
}

/**
 * Login as instructor specifically
 */
export async function loginAsInstructor(page: Page) {
  await loginAs(page, 'instructor')
}

/**
 * Login as student specifically
 */
export async function loginAsStudent(page: Page) {
  await loginAs(page, 'student')
}

/**
 * Login as admin specifically
 */
export async function loginAsAdmin(page: Page) {
  await loginAs(page, 'admin')
}

/**
 * Logout current user
 */
export async function logout(page: Page) {
  // Click on user menu/avatar
  await page.click('[data-testid="user-menu-trigger"]')

  // Click logout button
  await page.click('[data-testid="btn-logout"]')

  // Wait for redirect to login/home
  await page.waitForURL(/\/(login|$)/, { timeout: 5000 })
}

/**
 * Setup authenticated session using Supabase directly (faster than UI login)
 */
export async function setupAuthSession(
  context: BrowserContext,
  userType: keyof typeof testUsers
) {
  const user = testUsers[userType]
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  // Sign in with Supabase
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: user.password,
  })

  if (error || !authData.session) {
    throw new Error(`Failed to authenticate user: ${error?.message}`)
  }

  // Set auth cookies in browser context
  await context.addCookies([
    {
      name: 'sb-access-token',
      value: authData.session.access_token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
    {
      name: 'sb-refresh-token',
      value: authData.session.refresh_token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
  ])

  // Also set localStorage for client-side auth
  const page = await context.newPage()
  await page.goto('/')

  await page.evaluate((userData) => {
    localStorage.setItem('humanglue_user', JSON.stringify({
      id: userData.id,
      email: userData.email,
      role: userData.role,
      full_name: userData.full_name,
      isInstructor: userData.role === 'instructor',
      isAdmin: userData.role === 'admin' || userData.role === 'org_admin',
    }))
  }, user)

  return page
}

/**
 * Clear all authentication (cookies + localStorage)
 */
export async function clearAuth(context: BrowserContext) {
  await context.clearCookies()

  const pages = context.pages()
  for (const page of pages) {
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const userData = await page.evaluate(() => {
    return localStorage.getItem('humanglue_user')
  })

  return userData !== null
}

/**
 * Get current user data from localStorage
 */
export async function getCurrentUser(page: Page) {
  return await page.evaluate(() => {
    const userData = localStorage.getItem('humanglue_user')
    return userData ? JSON.parse(userData) : null
  })
}

/**
 * Assert user has specific role
 */
export async function assertUserRole(page: Page, expectedRole: string) {
  const user = await getCurrentUser(page)

  if (!user) {
    throw new Error('No user is logged in')
  }

  if (user.role !== expectedRole) {
    throw new Error(`Expected user role to be ${expectedRole}, but got ${user.role}`)
  }
}

/**
 * Verify instructor access to instructor portal
 */
export async function verifyInstructorAccess(page: Page) {
  const user = await getCurrentUser(page)

  if (!user?.isInstructor) {
    throw new Error('User does not have instructor access')
  }

  // Try to access instructor dashboard
  await page.goto('/instructor')

  // Should not redirect to login
  const url = page.url()
  if (url.includes('/login')) {
    throw new Error('Instructor was redirected to login page')
  }
}

/**
 * Create test instructor profile
 */
export async function createTestInstructorProfile(userId: string) {
  const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const { data, error } = await supabase
    .from('instructor_profiles')
    .insert({
      user_id: userId,
      bio: 'Test instructor bio for automated testing. This is a comprehensive bio that meets the minimum character requirements.',
      professional_title: 'Senior AI Instructor',
      tagline: 'Teaching the future of AI and technology',
      expertise_tags: ['AI', 'Machine Learning', 'Leadership'],
      pillars: ['adaptability', 'coaching'],
      is_verified: true,
      is_accepting_students: true,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create instructor profile: ${error.message}`)
  }

  return data
}

/**
 * Cleanup test user data
 */
export async function cleanupTestUser(userId: string) {
  const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  // Delete in correct order due to foreign keys
  await supabase.from('instructor_profiles').delete().eq('user_id', userId)
  await supabase.from('instructor_settings').delete().eq('user_id', userId)
  await supabase.from('student_progress').delete().eq('user_id', userId)
  await supabase.from('course_enrollments').delete().eq('user_id', userId)
  await supabase.from('users').delete().eq('id', userId)
}
