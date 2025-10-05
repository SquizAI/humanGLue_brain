/**
 * Test Utilities
 * Helper functions and custom render methods for testing
 */

import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/**
 * Custom render function that wraps components with common providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  // Add providers here as needed (e.g., ThemeProvider, QueryClientProvider)
  return {
    user: userEvent.setup(),
    ...render(ui, options),
  }
}

/**
 * Wait for specified milliseconds
 */
export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Create mock workshop data
 */
export function createMockWorkshop(overrides = {}) {
  return {
    id: 'test-workshop-1',
    title: 'Test Workshop',
    description: 'Test workshop description',
    pillar: 'adaptability',
    level: 'beginner',
    format: 'virtual',
    schedule: {
      date: '2025-03-15',
      time: '10:00',
      duration: 120,
      timezone: 'America/New_York',
    },
    capacity: {
      total: 20,
      remaining: 15,
    },
    price: {
      amount: 299,
      currency: 'USD',
      earlyBird: 249,
    },
    instructor: {
      id: 'instructor-1',
      full_name: 'Test Instructor',
      avatar_url: null,
    },
    tags: ['ai', 'transformation'],
    outcomes: ['Learn AI fundamentals', 'Build adaptability skills'],
    status: 'published',
    is_featured: false,
    ...overrides,
  }
}

/**
 * Create mock assessment data
 */
export function createMockAssessment(overrides = {}) {
  return {
    id: 'assessment-1',
    user_id: 'user-1',
    status: 'in_progress',
    current_dimension: 'individual',
    answers: {},
    scores: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Create mock user data
 */
export function createMockUser(overrides = {}) {
  return {
    id: 'user-1',
    email: 'test@example.com',
    full_name: 'Test User',
    role: 'user',
    avatar_url: null,
    created_at: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Mock Supabase client
 */
export function createMockSupabaseClient() {
  return {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn(),
    auth: {
      getUser: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
    },
  }
}

/**
 * Mock fetch responses
 */
export function mockFetchResponse(data: any, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as Response)
}

/**
 * Create mock API error response
 */
export function createMockApiError(code: string, message: string, statusCode = 400) {
  return {
    success: false,
    error: {
      code,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    },
  }
}

/**
 * Create mock API success response
 */
export function createMockApiSuccess(data: any, meta = {}) {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  }
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react'
