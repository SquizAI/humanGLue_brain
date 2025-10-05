# Writing Tests Guide

Quick reference for writing tests in the HumanGlue platform.

## Quick Start

### 1. Component Test Template

```typescript
/**
 * Component Tests: ComponentName
 *
 * Test Coverage:
 * - Rendering with different props
 * - User interactions
 * - Error states
 * - Accessibility
 */

import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/tests/setup/test-utils'
import { ComponentName } from './ComponentName'

describe('ComponentName', () => {
  it('renders with required props', () => {
    renderWithProviders(<ComponentName prop="value" />)

    expect(screen.getByText('value')).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    const { user } = renderWithProviders(<ComponentName />)

    const button = screen.getByRole('button', { name: /click me/i })
    await user.click(button)

    expect(screen.getByText('Clicked!')).toBeVisible()
  })

  it('shows error state', () => {
    renderWithProviders(<ComponentName error="Something went wrong" />)

    expect(screen.getByText('Something went wrong')).toBeVisible()
  })

  it('is accessible', () => {
    renderWithProviders(<ComponentName />)

    const element = screen.getByRole('button')
    expect(element).toHaveAccessibleName()
  })
})
```

### 2. API Integration Test Template

```typescript
/**
 * Integration Tests: API Name
 *
 * Test Coverage:
 * - CRUD operations
 * - Validation
 * - Error handling
 * - Authorization
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createMockSupabaseClient } from '@/tests/setup/test-utils'

describe('API Name', () => {
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient()
  })

  it('should fetch data successfully', async () => {
    const mockData = [{ id: '1', name: 'Test' }]

    mockSupabase.from.mockReturnValue({
      ...mockSupabase,
      select: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    })

    const result = await mockSupabase.from('table').select()

    expect(result.data).toEqual(mockData)
    expect(result.error).toBeNull()
  })

  it('should handle errors', async () => {
    const error = new Error('Database error')

    mockSupabase.from.mockReturnValue({
      ...mockSupabase,
      select: vi.fn().mockResolvedValue({ data: null, error }),
    })

    const result = await mockSupabase.from('table').select()

    expect(result.error).toBeTruthy()
    expect(result.data).toBeNull()
  })
})
```

### 3. E2E Test Template

```typescript
/**
 * E2E Tests: Feature Name
 *
 * Test Coverage:
 * - Happy path
 * - Error scenarios
 * - Mobile responsive
 * - Accessibility
 */

import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/feature')
  })

  test('should complete main user flow', async ({ page }) => {
    // Navigate
    await page.click('[data-testid="start-button"]')

    // Interact
    await page.fill('[data-testid="input-field"]', 'test value')
    await page.click('[data-testid="submit-button"]')

    // Verify
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
  })

  test('should handle errors gracefully', async ({ page }) => {
    await page.click('[data-testid="submit-button"]')

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
  })
})

test.describe('Mobile Feature', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('should work on mobile', async ({ page }) => {
    await page.goto('/feature')

    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
  })
})
```

## Testing Patterns

### Testing User Interactions

```typescript
it('should handle form submission', async () => {
  const { user } = renderWithProviders(<ContactForm />)

  // Fill form
  await user.type(screen.getByLabelText('Email'), 'test@example.com')
  await user.type(screen.getByLabelText('Message'), 'Hello!')

  // Submit
  await user.click(screen.getByRole('button', { name: /submit/i }))

  // Verify
  expect(screen.getByText('Message sent!')).toBeVisible()
})
```

### Testing Async Operations

```typescript
it('should load data', async () => {
  renderWithProviders(<DataComponent />)

  // Wait for loading to finish
  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })

  // Verify data displayed
  expect(screen.getByText('Data loaded')).toBeInTheDocument()
})
```

### Testing Error Boundaries

```typescript
it('should catch errors', () => {
  const ThrowError = () => {
    throw new Error('Test error')
  }

  renderWithProviders(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  )

  expect(screen.getByText(/something went wrong/i)).toBeVisible()
})
```

### Testing Custom Hooks

```typescript
it('should manage state', () => {
  const { result } = renderHook(() => useCounter())

  act(() => {
    result.current.increment()
  })

  expect(result.current.count).toBe(1)

  act(() => {
    result.current.decrement()
  })

  expect(result.current.count).toBe(0)
})
```

### Testing Context Providers

```typescript
it('should provide context value', () => {
  const TestComponent = () => {
    const value = useMyContext()
    return <div>{value}</div>
  }

  renderWithProviders(
    <MyContextProvider value="test">
      <TestComponent />
    </MyContextProvider>
  )

  expect(screen.getByText('test')).toBeInTheDocument()
})
```

## Common Queries

### Semantic Queries (Preferred)

```typescript
// By role (most preferred)
screen.getByRole('button', { name: /submit/i })
screen.getByRole('textbox', { name: /email/i })
screen.getByRole('heading', { level: 1 })

// By label
screen.getByLabelText('Email address')

// By placeholder
screen.getByPlaceholderText('Enter your email')

// By text
screen.getByText('Hello World')
screen.getByText(/hello/i) // Case insensitive

// By display value (for inputs)
screen.getByDisplayValue('Current value')
```

### Test ID Queries (Last Resort)

```typescript
// Use only when semantic queries don't work
screen.getByTestId('custom-element')
```

### Query Variants

```typescript
// getBy - Throws if not found (for assertions)
screen.getByRole('button')

// queryBy - Returns null if not found (for negative assertions)
expect(screen.queryByText('Not here')).not.toBeInTheDocument()

// findBy - Returns promise, waits for element (for async)
await screen.findByText('Loaded data')

// getAllBy - Returns array
const buttons = screen.getAllByRole('button')
```

## Assertions

### Visibility

```typescript
expect(element).toBeVisible()
expect(element).not.toBeVisible()
expect(element).toBeInTheDocument()
```

### Text Content

```typescript
expect(element).toHaveTextContent('Hello')
expect(element).toContainHTML('<span>Hello</span>')
```

### Form Elements

```typescript
expect(input).toHaveValue('test')
expect(input).toBeDisabled()
expect(input).toBeEnabled()
expect(checkbox).toBeChecked()
```

### Accessibility

```typescript
expect(element).toHaveAccessibleName('Submit form')
expect(element).toHaveAccessibleDescription('Click to submit')
expect(input).toBeRequired()
expect(input).toBeInvalid()
```

### Attributes

```typescript
expect(link).toHaveAttribute('href', '/home')
expect(element).toHaveClass('active')
expect(element).toHaveStyle({ color: 'red' })
```

## E2E Best Practices

### Wait for Elements

```typescript
// Good - Uses auto-waiting
await page.click('button')
await expect(page.locator('text=Success')).toBeVisible()

// Bad - Arbitrary timeout
await page.waitForTimeout(1000)
```

### Use Data-TestId

```typescript
// Component
<button data-testid="submit-btn">Submit</button>

// Test
await page.click('[data-testid="submit-btn"]')
```

### Page Object Model

```typescript
class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.page.fill('[data-testid="email"]', email)
    await this.page.fill('[data-testid="password"]', password)
    await this.page.click('[data-testid="submit"]')
  }
}

// In test
const loginPage = new LoginPage(page)
await loginPage.goto()
await loginPage.login('user@example.com', 'password')
```

### Handle Navigation

```typescript
// Wait for navigation
await Promise.all([
  page.waitForNavigation(),
  page.click('a[href="/next-page"]')
])

// Or use Playwright's auto-waiting
await page.click('a[href="/next-page"]')
await expect(page).toHaveURL('/next-page')
```

## Mock Data

### Create Fixtures

```typescript
// tests/fixtures/users.ts
export const mockUsers = [
  {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
  },
  {
    id: 'user-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
  },
]

export function getUserById(id: string) {
  return mockUsers.find(u => u.id === id)
}
```

### Mock API Calls

```typescript
// Mock fetch
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ data: mockUsers }),
})

// Mock Supabase
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => createMockSupabaseClient(),
}))
```

## Debugging Tests

### Debug Output

```typescript
// Print element tree
screen.debug()

// Print specific element
screen.debug(screen.getByRole('button'))

// Get all roles
screen.logTestingPlaygroundURL()
```

### Playwright Debugging

```bash
# Debug mode
npm run test:e2e:debug

# Headed mode
npm run test:e2e:headed

# UI mode
npm run test:e2e:ui
```

### Common Issues

**Element Not Found:**
```typescript
// Use waitFor for async elements
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})
```

**Test Timeout:**
```typescript
// Increase timeout
it('slow test', async () => {
  vi.setConfig({ testTimeout: 10000 })
  // ... test code
}, 10000)
```

**Flaky Tests:**
```typescript
// Use findBy instead of getBy for async
const element = await screen.findByText('Async content')

// Add explicit waits
await waitFor(() => {
  expect(screen.getByText('Content')).toBeVisible()
})
```

## Code Coverage

### View Coverage

```bash
npm run test:unit:coverage
open coverage/index.html
```

### Ignore Files

```javascript
// vitest.config.ts
coverage: {
  exclude: [
    '**/*.config.*',
    '**/*.d.ts',
    '**/mockData',
  ]
}
```

### Focus on Critical Paths

```typescript
// Mark critical tests
it.only('should process payment', () => {
  // This test must always pass
})

// Skip non-critical
it.skip('should show tooltip', () => {
  // Low priority
})
```

## Next Steps

1. Review [TESTING.md](../TESTING.md) for comprehensive guide
2. Explore existing tests in `tests/` directory
3. Use test templates above to write new tests
4. Run tests locally before committing
5. Check CI/CD results in GitHub Actions

## Questions?

- Check [TESTING.md](../TESTING.md) for detailed documentation
- Review test utilities in `tests/setup/test-utils.tsx`
- Ask in team Slack #testing channel
- Create GitHub issue with `testing` label
