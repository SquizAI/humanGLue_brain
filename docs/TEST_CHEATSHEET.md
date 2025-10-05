# Testing Cheat Sheet

Quick reference for common testing patterns and commands.

## Commands

### Unit Tests (Vitest)

```bash
npm run test:unit              # Run all unit tests
npm run test:unit:watch        # Watch mode
npm run test:unit:coverage     # With coverage
npm run test:unit -- <file>    # Run specific file
```

### E2E Tests (Playwright)

```bash
npm run test:e2e               # Run all E2E tests
npm run test:e2e:headed        # With browser visible
npm run test:e2e:debug         # Debug mode
npm run test:e2e:ui            # Interactive UI
npm run test:e2e:chromium      # Chromium only
npm run playwright:report      # View last report
```

### All Tests

```bash
npm run test:all               # Run everything
CI=true npm run test:all       # Simulate CI
```

## Common Queries

```typescript
// By role (preferred)
screen.getByRole('button', { name: /submit/i })
screen.getByRole('textbox', { name: /email/i })
screen.getByRole('heading', { level: 1 })

// By label
screen.getByLabelText('Email address')

// By text
screen.getByText('Hello World')
screen.getByText(/hello/i)  // Case insensitive

// By test ID (last resort)
screen.getByTestId('custom-element')

// Async queries
await screen.findByText('Loaded')  // Waits for element

// Multiple elements
screen.getAllByRole('listitem')

// Negative queries
expect(screen.queryByText('Not here')).not.toBeInTheDocument()
```

## Common Assertions

```typescript
// Visibility
expect(element).toBeVisible()
expect(element).toBeInTheDocument()
expect(element).not.toBeInTheDocument()

// Text
expect(element).toHaveTextContent('Hello')
expect(element).toContainHTML('<span>')

// Form elements
expect(input).toHaveValue('test')
expect(input).toBeDisabled()
expect(checkbox).toBeChecked()
expect(input).toBeRequired()

// Attributes
expect(link).toHaveAttribute('href', '/home')
expect(element).toHaveClass('active')

// Accessibility
expect(element).toHaveAccessibleName('Submit')
```

## User Interactions

```typescript
const { user } = renderWithProviders(<Component />)

// Click
await user.click(element)
await user.dblClick(element)

// Type
await user.type(input, 'Hello')
await user.clear(input)

// Keyboard
await user.keyboard('{Enter}')
await user.keyboard('{Shift>}A{/Shift}')

// Select
await user.selectOptions(select, 'value')

// Upload
await user.upload(input, file)

// Hover
await user.hover(element)
```

## Async Testing

```typescript
// Wait for element
await screen.findByText('Loaded')

// Wait for assertion
await waitFor(() => {
  expect(screen.getByText('Data')).toBeInTheDocument()
})

// Wait for callback
await waitFor(() => {
  expect(mockFn).toHaveBeenCalled()
}, { timeout: 3000 })

// Manual wait (avoid if possible)
await new Promise(r => setTimeout(r, 1000))
```

## Mocking

```typescript
// Mock function
const mockFn = vi.fn()
mockFn.mockReturnValue('value')
mockFn.mockResolvedValue(Promise.resolve('value'))

// Mock module
vi.mock('./module', () => ({
  default: vi.fn(),
  namedExport: vi.fn(),
}))

// Mock API
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ data: [] }),
})

// Reset mocks
beforeEach(() => {
  vi.clearAllMocks()
})
```

## E2E Patterns

```typescript
// Navigate
await page.goto('/workshops')

// Click
await page.click('[data-testid="button"]')

// Fill
await page.fill('[data-testid="input"]', 'value')

// Select
await page.selectOption('select', 'value')

// Wait for navigation
await page.click('a[href="/next"]')
await expect(page).toHaveURL('/next')

// Wait for element
await expect(page.locator('text=Success')).toBeVisible()

// Take screenshot
await page.screenshot({ path: 'screenshot.png' })

// Get text
const text = await page.textContent('[data-testid="element"]')
```

## Page Object Model

```typescript
export class WorkshopsPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/workshops')
  }

  async filterByPillar(pillar: string) {
    await this.page.click(`[data-testid="filter-${pillar}"]`)
  }

  async getWorkshopCount() {
    return await this.page.locator('[data-testid="workshop-card"]').count()
  }
}

// Usage
const workshopsPage = new WorkshopsPage(page)
await workshopsPage.goto()
await workshopsPage.filterByPillar('adaptability')
```

## Test Structure

```typescript
describe('Feature', () => {
  beforeEach(() => {
    // Setup
  })

  afterEach(() => {
    // Cleanup
  })

  it('should do something', () => {
    // Arrange
    const data = createMockData()

    // Act
    const result = doSomething(data)

    // Assert
    expect(result).toBe(expected)
  })
})
```

## Custom Hooks Testing

```typescript
import { renderHook, act } from '@testing-library/react'

const { result } = renderHook(() => useCounter())

act(() => {
  result.current.increment()
})

expect(result.current.count).toBe(1)
```

## Debugging

```typescript
// Vitest
screen.debug()                           // Print DOM
screen.debug(element)                    // Print element
screen.logTestingPlaygroundURL()         // Get query suggestions

// Playwright
await page.pause()                       // Pause execution
await page.screenshot()                  // Take screenshot
console.log(await page.content())        // Print HTML
```

## Coverage

```bash
# Generate coverage
npm run test:unit:coverage

# View HTML report
open coverage/index.html

# Check coverage thresholds
vitest run --coverage --coverage.thresholds.lines=80
```

## Common Issues

**Element not found:**
```typescript
// Use findBy for async elements
await screen.findByText('Loaded')

// Or waitFor
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})
```

**Test timeout:**
```typescript
// Increase timeout
it('slow test', async () => {
  vi.setConfig({ testTimeout: 10000 })
}, 10000)
```

**Flaky tests:**
```typescript
// Use Playwright's auto-waiting
await page.click('button')  // Automatically waits for button

// Not arbitrary timeouts
await page.waitForTimeout(1000)  // Avoid
```

## Test Data

```typescript
// Create mock data
import { createMockWorkshop } from '@/tests/setup/test-utils'

const workshop = createMockWorkshop({
  title: 'Custom Title',
  capacity: { total: 50 },
})

// Use fixtures
import { mockWorkshops } from '@/tests/fixtures/workshops'

const workshop = mockWorkshops[0]
```

## Environment

```typescript
// Set env vars
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000'

// Check test environment
if (process.env.NODE_ENV === 'test') {
  // Test-specific code
}
```

## Quick Links

- [Full Testing Guide](../TESTING.md)
- [Writing Tests Guide](./WRITING_TESTS.md)
- [Test Suite README](../tests/README.md)
- [Vitest Docs](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Docs](https://playwright.dev/)
