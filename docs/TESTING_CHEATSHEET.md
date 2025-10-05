# HumanGlue Testing Cheat Sheet

Quick reference for running tests and common patterns.

## 🚀 Quick Commands

### Run Tests

```bash
# All tests
npm test

# Unit tests only (fast!)
npm run test:unit                 # Run once
npm run test:unit:watch          # Watch mode (TDD)
npm run test:unit:coverage       # With coverage

# E2E tests
npm run test:e2e                 # All browsers
npm run test:e2e:chromium        # Chromium only
npm run test:e2e:firefox         # Firefox only
npm run test:e2e:webkit          # WebKit only
npm run test:e2e:debug          # Debug mode
npm run test:e2e:ui             # Interactive UI

# Integration tests
npm run test:integration

# All tests
npm run test:all
```

### Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run playwright:install

# Check environment
npm run check:env
```

## 📝 Common Test Patterns

### E2E Tests (Playwright)

```typescript
import { test, expect } from '../utils/fixtures'
import { loginAsInstructor } from '../utils/auth-helpers'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsInstructor(page)
    await page.goto('/instructor/feature')
  })

  test('should do something', async ({ page }) => {
    // Arrange
    await page.waitForSelector('[data-testid="element"]')

    // Act
    await page.click('[data-testid="button"]')

    // Assert
    await expect(page.locator('[data-testid="result"]')).toBeVisible()
  })
})
```

### Component Tests (Vitest + RTL)

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Component from '@/components/Component'

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component prop="value" />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('should handle click', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<Component onClick={onClick} />)
    await user.click(screen.getByRole('button'))

    expect(onClick).toHaveBeenCalled()
  })
})
```

### API Tests

```typescript
import { describe, it, expect } from 'vitest'

describe('GET /api/endpoint', () => {
  it('should return data', async () => {
    const response = await fetch(`${API_URL}/api/endpoint`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
  })
})
```

## 🎯 Selectors

### data-testid Convention

```typescript
// Buttons
data-testid="btn-create"
data-testid="btn-submit"
data-testid="btn-cancel"

// Inputs
data-testid="input-email"
data-testid="input-password"

// Containers
data-testid="student-card"
data-testid="course-card"

// Status
data-testid="status-active"
data-testid="status-inactive"

// Modals
data-testid="modal-confirm"
data-testid="modal-delete"
```

### Finding Elements

```typescript
// Playwright
await page.locator('[data-testid="button"]').click()
await page.locator('button:has-text("Submit")').click()
await page.locator('[aria-label="Close"]').click()

// Testing Library
screen.getByTestId('button')
screen.getByRole('button', { name: 'Submit' })
screen.getByLabelText('Email')
screen.getByText('Welcome')
```

## 🔧 Common Utilities

### Authentication

```typescript
// Login helpers
await loginAsInstructor(page)
await loginAsStudent(page)
await loginAsAdmin(page)

// Fast auth setup
const page = await setupAuthSession(context, 'instructor')

// Verify access
await verifyInstructorAccess(page)

// Logout
await logout(page)
```

### Database

```typescript
// Seed data
await seedInstructorData(instructorId)
await seedStudentEnrollments(courseId, 5)

// Cleanup
await cleanupInstructorData(instructorId)
await resetTestDatabase()
```

### Mock Data

```typescript
const course = generateMockCourse()
const workshop = generateMockWorkshop()
const student = generateMockStudent()
```

## ⏱️ Waits & Timing

### Playwright Waits

```typescript
// Wait for selector
await page.waitForSelector('[data-testid="loaded"]')

// Wait for load state
await page.waitForLoadState('networkidle')
await page.waitForLoadState('domcontentloaded')

// Wait for response
await page.waitForResponse(response =>
  response.url().includes('/api/data') && response.status() === 200
)

// Wait for function
await page.waitForFunction(() =>
  document.querySelector('[data-testid="loaded"]') !== null
)

// ❌ Avoid fixed timeouts
await page.waitForTimeout(1000)  // Bad!
```

### Testing Library Waits

```typescript
// Wait for element
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})

// Find async
const element = await screen.findByText('Async Content')
```

## 🐛 Debugging

### Playwright

```bash
# Debug mode
npm run test:e2e:debug

# Interactive UI
npm run test:e2e:ui

# View trace
npx playwright show-trace test-results/trace.zip

# Run single test
npx playwright test tests/e2e/specific.spec.ts

# Run with headed browser
npx playwright test --headed

# Slow motion
npx playwright test --slow-mo=1000
```

### Vitest

```bash
# Run single file
npx vitest tests/components/Component.test.tsx

# Debug in terminal
npx vitest --inspect-brk

# Update snapshots
npx vitest -u
```

### Common Issues

```typescript
// Timeout issue → Increase timeout
test('slow test', async () => {
  // ...
}, { timeout: 60000 })

// Flaky test → Add proper wait
await page.waitForSelector('[data-testid="loaded"]')

// Element not found → Check visibility
await expect(page.locator('[data-testid="item"]')).toBeVisible()
```

## 📊 Coverage

```bash
# Generate coverage
npm run test:unit:coverage

# View HTML report
open coverage/index.html

# View in terminal
npx vitest --coverage
```

## 🔐 Environment Variables

```bash
# .env.test
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
BASE_URL=http://localhost:5040
```

## 🎨 Best Practices

### DO ✅

```typescript
// Use data-testid
<button data-testid="btn-submit">Submit</button>

// Wait for conditions
await page.waitForSelector('[data-testid="loaded"]')

// Test behavior
expect(screen.getByText('Success')).toBeInTheDocument()

// Clean up
test.afterEach(async () => {
  await cleanupTestData()
})
```

### DON'T ❌

```typescript
// Don't use arbitrary waits
await page.waitForTimeout(5000)  // Bad!

// Don't test implementation
expect(component.state.count).toBe(5)  // Bad!

// Don't use brittle selectors
await page.click('.css-class-xyz')  // Bad!

// Don't create dependencies
test('test 1', () => { createUser() })
test('test 2', () => { updateUser() })  // Depends on test 1!
```

## 📈 CI/CD

### GitHub Actions Status

Check PR for test results:
```
✅ Lint & Type Check
✅ Unit Tests (80% coverage)
✅ Integration Tests
✅ E2E Tests (chromium, firefox, webkit)
✅ Accessibility Tests
```

### Artifacts

Failed tests auto-upload:
- Screenshots
- Videos
- Trace files
- HTML reports

## 🆘 Quick Troubleshooting

### Test Fails Locally

```bash
# Clear cache
rm -rf node_modules/.vite
npm run test:unit

# Rebuild
npm run build
npm run test:e2e
```

### Test Fails in CI Only

1. Check environment variables
2. Verify browser versions
3. Check database state
4. Review CI logs

### Flaky Test

1. Add proper waits
2. Isolate test data
3. Clear state between tests
4. Check for race conditions

## 📚 Resources

- [Full Testing Guide](./TESTING.md)
- [Testing Summary](./TESTING_SUMMARY.md)
- [Playwright Docs](https://playwright.dev)
- [Vitest Docs](https://vitest.dev)
- [Testing Library](https://testing-library.com)

## 💡 Tips

### Speed Up Tests

```typescript
// Reuse authentication
const page = await setupAuthSession(context, 'instructor')

// Parallel execution (Playwright default)
test.describe.configure({ mode: 'parallel' })

// Skip slow tests during development
test.skip('slow integration test', async () => {})
```

### Write Better Tests

```typescript
// Descriptive names
test('should display error when login fails with invalid password', ...)

// Arrange-Act-Assert
test('...', async ({ page }) => {
  // Arrange
  await setup()

  // Act
  await performAction()

  // Assert
  await expectResult()
})

// One assertion per test (when possible)
test('should show success message', ...)
test('should redirect to dashboard', ...)
```

---

**Quick Reference Version**: 1.0
**Last Updated**: 2025-10-04
