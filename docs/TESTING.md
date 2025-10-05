# HumanGlue Instructor Portal - Testing Documentation

## Table of Contents

1. [Overview](#overview)
2. [Test Infrastructure](#test-infrastructure)
3. [Running Tests](#running-tests)
4. [Test Categories](#test-categories)
5. [Writing Tests](#writing-tests)
6. [CI/CD Integration](#cicd-integration)
7. [Test Coverage](#test-coverage)
8. [Debugging Tests](#debugging-tests)
9. [Best Practices](#best-practices)

## Overview

This document provides comprehensive guidance on the testing strategy for the HumanGlue Instructor Portal. Our test suite ensures reliability, performance, and maintainability across all features.

### Testing Philosophy

- **Test Pyramid**: 70% unit tests, 20% integration tests, 10% E2E tests
- **Coverage Goals**: Minimum 80% overall, 100% for critical paths
- **Speed**: Unit tests <1s, integration <5s, E2E <30s
- **Reliability**: Zero flaky tests policy
- **Maintainability**: Clear test names, DRY principles, page object pattern

## Test Infrastructure

### Tech Stack

- **E2E Testing**: Playwright (multi-browser support)
- **Unit/Component Testing**: Vitest + React Testing Library
- **API Testing**: Vitest with Supabase integration
- **Coverage**: V8 (built into Vitest)
- **CI/CD**: GitHub Actions

### Directory Structure

```
tests/
├── e2e/                          # End-to-end tests
│   ├── instructor-auth.spec.ts
│   ├── instructor-students.spec.ts
│   ├── instructor-courses.spec.ts
│   ├── instructor-analytics.spec.ts
│   ├── instructor-workshops.spec.ts
│   ├── instructor-profile.spec.ts
│   ├── instructor-settings.spec.ts
│   └── instructor-realtime.spec.ts
├── components/                   # Component unit tests
│   ├── InstructorNotifications.test.tsx
│   ├── DashboardSidebar.test.tsx
│   └── StudentCard.test.tsx
├── api/                         # API integration tests
│   ├── instructor-students.test.ts
│   ├── instructor-courses.test.ts
│   ├── instructor-analytics.test.ts
│   └── instructor-workshops.test.ts
├── utils/                       # Test utilities
│   ├── auth-helpers.ts          # Authentication helpers
│   ├── db-helpers.ts            # Database utilities
│   └── fixtures.ts              # Test fixtures and mocks
└── setup/
    └── vitest-setup.ts          # Test environment setup
```

## Running Tests

### Quick Start

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit              # Unit & component tests
npm run test:integration       # API integration tests
npm run test:e2e              # E2E tests (all browsers)

# Run E2E tests by browser
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit

# Run with coverage
npm run test:unit:coverage

# Watch mode for development
npm run test:unit:watch

# Debug mode
npm run test:e2e:debug
npm run test:e2e:ui           # Interactive UI mode
```

### Environment Variables

Create a `.env.test` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Base URL
BASE_URL=http://localhost:5040

# Test user credentials
TEST_INSTRUCTOR_EMAIL=instructor@test.humanglue.ai
TEST_INSTRUCTOR_PASSWORD=TestPassword123!
```

## Test Categories

### 1. E2E Tests (Playwright)

Test complete user journeys from the browser.

**What to test:**
- Critical user flows (login, course creation, student management)
- Multi-page workflows
- Real browser interactions
- Responsive design

**Example:**

```typescript
// tests/e2e/instructor-students.spec.ts
import { test, expect } from '../utils/fixtures'
import { loginAsInstructor } from '../utils/auth-helpers'

test.describe('Student Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsInstructor(page)
    await page.goto('/instructor/students')
  })

  test('should display student list', async ({ page }) => {
    await page.waitForSelector('[data-testid="student-card"]')
    await expect(page.locator('[data-testid="student-card"]').first()).toBeVisible()
  })

  test('should filter students by status', async ({ page }) => {
    await page.selectOption('[data-testid="filter-status"]', 'active')
    // Assertions...
  })
})
```

### 2. Component Tests (Vitest + RTL)

Test React components in isolation.

**What to test:**
- Component rendering
- User interactions
- State changes
- Props handling

**Example:**

```typescript
// tests/components/InstructorNotifications.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InstructorNotifications from '@/components/organisms/InstructorNotifications'

describe('InstructorNotifications', () => {
  it('shows unread count badge', () => {
    render(<InstructorNotifications />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('marks notification as read on click', async () => {
    const user = userEvent.setup()
    render(<InstructorNotifications />)

    await user.click(screen.getByText('New enrollment'))
    expect(markAsRead).toHaveBeenCalled()
  })
})
```

### 3. API Integration Tests

Test API endpoints with real database.

**What to test:**
- Request/response validation
- Authentication/authorization
- Error handling
- Database operations

**Example:**

```typescript
// tests/api/instructor-students.test.ts
import { describe, it, expect } from 'vitest'

describe('GET /api/instructor/students', () => {
  it('should return student list', async () => {
    const response = await fetch(`${API_URL}/api/instructor/students`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
  })

  it('should require authentication', async () => {
    const response = await fetch(`${API_URL}/api/instructor/students`)
    expect(response.status).toBe(401)
  })
})
```

### 4. Database Tests

Test RLS policies and database functions.

**What to test:**
- Row Level Security (RLS) policies
- Database triggers
- Helper functions
- Data constraints

## Writing Tests

### Test Structure

Follow the AAA pattern:

```typescript
test('should do something', async ({ page }) => {
  // Arrange: Setup test data
  await loginAsInstructor(page)
  await page.goto('/instructor/courses')

  // Act: Perform action
  await page.click('[data-testid="btn-create-course"]')

  // Assert: Verify outcome
  await expect(page).toHaveURL(/\/instructor\/courses\/new/)
})
```

### Using Test Fixtures

Leverage custom fixtures for common setups:

```typescript
import { test, expect } from '../utils/fixtures'

test('instructor can access dashboard', async ({ authenticatedInstructor }) => {
  await authenticatedInstructor.goto('/instructor')
  await expect(authenticatedInstructor).toHaveURL(/\/instructor/)
})
```

### Page Object Pattern

Organize E2E tests with page objects:

```typescript
// tests/pages/StudentsPage.ts
export class StudentsPage {
  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto('/instructor/students')
  }

  async searchStudent(name: string) {
    await this.page.fill('[data-testid="search-input"]', name)
  }

  async filterByStatus(status: string) {
    await this.page.selectOption('[data-testid="filter-status"]', status)
  }

  async getStudentCount() {
    return await this.page.locator('[data-testid="student-card"]').count()
  }
}

// Usage in test
test('should search students', async ({ page }) => {
  const studentsPage = new StudentsPage(page)
  await studentsPage.goto()
  await studentsPage.searchStudent('John')
  expect(await studentsPage.getStudentCount()).toBeGreaterThan(0)
})
```

### Data-TestId Conventions

Use consistent data-testid attributes:

```typescript
// Buttons
<button data-testid="btn-create-course">Create Course</button>

// Inputs
<input data-testid="input-title" />

// Containers
<div data-testid="student-card">...</div>

// Status indicators
<span data-testid="student-status-badge">Active</span>

// Modals
<div data-testid="student-modal">...</div>
```

## CI/CD Integration

### GitHub Actions Workflow

Tests run automatically on:
- Every push to `main` or `develop`
- Every pull request
- Manual trigger via GitHub UI

### Test Execution Flow

1. **Lint & Type Check** - Validates code quality
2. **Unit Tests** - Fast component and function tests
3. **Integration Tests** - API and database tests
4. **E2E Tests** - Full user journey tests (parallel across browsers)
5. **Accessibility Tests** - A11y validation
6. **Performance Tests** - Lighthouse CI

### Status Checks

Pull requests must pass:
- All lint checks
- All unit tests (80%+ coverage)
- All integration tests
- All E2E tests (chromium, firefox, webkit)
- Accessibility audit

## Test Coverage

### Coverage Reports

Generate coverage reports:

```bash
npm run test:unit:coverage
```

View HTML report:

```bash
open coverage/index.html
```

### Coverage Thresholds

```javascript
// vitest.config.ts
coverage: {
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80,
  },
}
```

### Critical Paths

These must have 100% coverage:
- Authentication flows
- Payment processing
- Data mutations (create/update/delete)
- RLS policy enforcement

## Debugging Tests

### Playwright Debugging

**Debug mode:**

```bash
npm run test:e2e:debug
```

**Interactive UI mode:**

```bash
npm run test:e2e:ui
```

**Run specific test:**

```bash
npx playwright test tests/e2e/instructor-auth.spec.ts --debug
```

**View trace:**

```bash
npx playwright show-trace test-results/trace.zip
```

### Vitest Debugging

**Run single test file:**

```bash
npx vitest tests/components/InstructorNotifications.test.tsx
```

**Debug in VS Code:**

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test:unit:watch"],
  "console": "integratedTerminal"
}
```

### Common Issues

**1. Timeout Errors**

Increase timeout for slow operations:

```typescript
test('slow operation', async ({ page }) => {
  await page.waitForSelector('[data-testid="loaded"]', { timeout: 30000 })
}, { timeout: 60000 })
```

**2. Flaky Tests**

Use proper wait strategies:

```typescript
// ❌ Bad: Fixed delays
await page.waitForTimeout(1000)

// ✅ Good: Wait for conditions
await page.waitForSelector('[data-testid="loaded"]')
await page.waitForLoadState('networkidle')
```

**3. Authentication Issues**

Clear auth state between tests:

```typescript
test.beforeEach(async ({ context }) => {
  await clearAuth(context)
})
```

## Best Practices

### General Guidelines

1. **Test Behavior, Not Implementation**
   ```typescript
   // ❌ Bad: Testing implementation details
   expect(component.state.isLoading).toBe(true)

   // ✅ Good: Testing user-visible behavior
   expect(screen.getByText('Loading...')).toBeInTheDocument()
   ```

2. **Use Meaningful Test Names**
   ```typescript
   // ❌ Bad
   test('test 1', async () => { ... })

   // ✅ Good
   test('should display error when login fails with invalid credentials', async () => { ... })
   ```

3. **Keep Tests Independent**
   ```typescript
   // Each test should setup its own data
   test.beforeEach(async () => {
     await seedTestData()
   })

   test.afterEach(async () => {
     await cleanupTestData()
   })
   ```

4. **Avoid Test Interdependence**
   ```typescript
   // ❌ Bad: Tests depend on order
   test('create user', () => { ... })
   test('update user', () => { ... })  // Depends on previous test

   // ✅ Good: Each test is independent
   test('create user', () => {
     const user = createUser()
     // ...
   })

   test('update user', () => {
     const user = createUser()  // Create its own user
     // ...
   })
   ```

### Performance Tips

1. **Parallel Execution**
   ```typescript
   // Playwright runs tests in parallel by default
   // Vitest also supports parallel execution
   ```

2. **Reuse Authentication**
   ```typescript
   // Setup auth session once, reuse across tests
   const page = await setupAuthSession(context, 'instructor')
   ```

3. **Mock External Services**
   ```typescript
   // Mock third-party APIs to avoid network calls
   await page.route('**/api/external/**', (route) => {
     route.fulfill({ body: mockResponse })
   })
   ```

### Security Testing

1. **Test Authorization**
   ```typescript
   test('should block unauthorized access', async () => {
     await page.goto('/instructor/students')
     await expect(page).toHaveURL(/\/login/)
   })
   ```

2. **Test RLS Policies**
   ```typescript
   test('should only show instructor own students', async () => {
     const students = await fetchStudents(instructorId)
     students.forEach(s => {
       expect(s.instructor_id).toBe(instructorId)
     })
   })
   ```

3. **Test Input Validation**
   ```typescript
   test('should reject XSS attempts', async () => {
     await page.fill('[data-testid="input-title"]', '<script>alert("xss")</script>')
     await page.click('[data-testid="btn-submit"]')
     await expect(page.locator('[data-testid="error"]')).toBeVisible()
   })
   ```

## Test Execution Time Estimates

| Test Suite | Duration | Tests |
|-----------|----------|-------|
| Lint & Type Check | ~30s | - |
| Unit Tests | ~15s | ~150 |
| Integration Tests | ~45s | ~50 |
| E2E Tests (per browser) | ~5min | ~80 |
| Accessibility Tests | ~2min | ~20 |
| **Total (all browsers)** | **~18min** | **~300** |

## Troubleshooting

### Common Errors

**Error: Test timeout exceeded**
- Increase timeout in test config
- Check for network issues
- Verify selectors are correct

**Error: Element not found**
- Use `waitForSelector` before interacting
- Check data-testid attributes
- Verify element is visible

**Error: Authentication failed**
- Check environment variables
- Verify test user exists in database
- Clear browser cache/cookies

### Getting Help

- Check test logs: `test-results/`
- View Playwright traces: `npx playwright show-trace`
- Review CI logs in GitHub Actions
- Contact: testing-support@humanglue.ai

## Contributing

### Adding New Tests

1. Create test file following naming convention
2. Use existing fixtures and utilities
3. Add data-testid to new components
4. Update this documentation
5. Ensure tests pass locally before PR

### Test Review Checklist

- [ ] Tests are independent and can run in any order
- [ ] Proper use of data-testid selectors
- [ ] Meaningful test names describe behavior
- [ ] Appropriate assertions (not too many, not too few)
- [ ] Cleanup after tests (no data leaks)
- [ ] No hardcoded delays (use proper waits)
- [ ] Edge cases covered
- [ ] Error scenarios tested

---

**Last Updated**: 2025-10-04
**Maintained By**: HumanGlue Engineering Team
