# Testing Guide

Comprehensive testing documentation for the HumanGlue platform.

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Coverage Requirements](#coverage-requirements)
- [Best Practices](#best-practices)

## Overview

The HumanGlue platform uses a comprehensive testing strategy covering:

- **Unit Tests**: Component and function testing with Vitest
- **Integration Tests**: API and database integration tests
- **E2E Tests**: Full user journey tests with Playwright
- **Accessibility Tests**: WCAG compliance validation
- **Visual Regression**: Screenshot comparison tests

### Test Pyramid

```
        /\
       /  \  E2E Tests (10%)
      /____\  Critical user flows
     /      \
    / Integ- \ Integration Tests (20%)
   /   ration \  Feature interactions
  /___________\
 /             \
/  Unit Tests   \ Unit Tests (70%)
/_________________\ Components, hooks, utils
```

## Test Structure

```
humanGLue_brain/
├── tests/
│   ├── setup/                    # Test configuration
│   │   ├── vitest-setup.ts      # Vitest global setup
│   │   └── test-utils.tsx       # Testing utilities
│   ├── fixtures/                 # Mock data
│   │   ├── workshops.ts
│   │   └── assessments.ts
│   ├── integration/              # Integration tests
│   │   └── api/
│   │       ├── workshops.test.ts
│   │       └── assessments.test.ts
│   └── e2e/                      # E2E tests
│       ├── pages/                # Page Object Models
│       │   ├── WorkshopsPage.ts
│       │   ├── WorkshopDetailPage.ts
│       │   └── AssessmentPage.ts
│       ├── workshops.spec.ts
│       ├── assessment.spec.ts
│       └── talent-marketplace.spec.ts
├── components/                   # Component tests co-located
│   └── ui/
│       ├── AdaptabilityScore.tsx
│       └── AdaptabilityScore.test.tsx
├── vitest.config.ts             # Vitest configuration
├── playwright.config.ts         # Playwright configuration
└── .github/
    └── workflows/
        └── test.yml             # CI/CD workflow
```

## Running Tests

### Unit & Component Tests

```bash
# Run all unit tests
npm run test:unit

# Watch mode (for development)
npm run test:unit:watch

# With coverage
npm run test:unit:coverage

# Run specific test file
npm run test:unit -- components/ui/AdaptabilityScore.test.tsx

# Run tests matching pattern
npm run test:unit -- --grep="AdaptabilityScore"
```

### Integration Tests

```bash
# Run all integration tests
npm run test:integration

# Run specific integration test
npm run test:integration -- tests/integration/api/workshops.test.ts
```

### E2E Tests

```bash
# Install Playwright browsers (first time only)
npm run playwright:install

# Run all E2E tests
npm run test:e2e

# Run with browser visible
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug

# Interactive UI mode
npm run test:e2e:ui

# Run on specific browser
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit

# Run mobile tests
npm run test:e2e:mobile

# View test report
npm run playwright:report
```

### All Tests

```bash
# Run complete test suite
npm run test:all

# In CI environment
CI=true npm run test:all
```

## Writing Tests

### Unit Tests (Vitest + Testing Library)

**Component Test Example:**

```typescript
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/tests/setup/test-utils'
import { AdaptabilityScore } from './AdaptabilityScore'

describe('AdaptabilityScore', () => {
  it('renders score correctly', () => {
    renderWithProviders(<AdaptabilityScore score={75} label="Individual" />)

    expect(screen.getByText('75')).toBeInTheDocument()
    expect(screen.getByText('Individual')).toBeInTheDocument()
  })

  it('shows correct color based on score range', () => {
    const { rerender } = renderWithProviders(
      <AdaptabilityScore score={35} label="Low" />
    )

    // Test low score (< 40)
    expect(screen.getByText('Low')).toBeInTheDocument()

    // Test high score (70+)
    rerender(<AdaptabilityScore score={85} label="High" />)
    expect(screen.getByText('High')).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    const { user } = renderWithProviders(
      <AdaptabilityScore score={75} label="Test" showDetails={true} />
    )

    const detailsButton = screen.getByRole('button', { name: /show details/i })
    await user.click(detailsButton)

    expect(screen.getByText('Dimension Breakdown')).toBeVisible()
  })
})
```

**Custom Hook Test Example:**

```typescript
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAdaptabilityAssessment } from './useAdaptabilityAssessment'

describe('useAdaptabilityAssessment', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useAdaptabilityAssessment())

    expect(result.current.currentStep).toBe(0)
    expect(result.current.answers).toEqual({})
    expect(result.current.isComplete).toBe(false)
  })

  it('saves answer and calculates score', () => {
    const { result } = renderHook(() => useAdaptabilityAssessment())

    act(() => {
      result.current.answerQuestion('change-readiness', 75)
    })

    expect(result.current.answers['change-readiness']).toBe(75)
  })
})
```

### Integration Tests

**API Integration Test Example:**

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { createMockSupabaseClient } from '@/tests/setup/test-utils'

describe('Workshops API', () => {
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient()
  })

  it('should filter workshops by pillar', async () => {
    const mockWorkshops = [
      { id: '1', title: 'AI Fundamentals', pillar: 'adaptability' },
    ]

    mockSupabase.from.mockReturnValue({
      ...mockSupabase,
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue({ data: mockWorkshops, error: null }),
    })

    const result = await mockSupabase.from('workshops').eq('pillar', 'adaptability').select()

    expect(result.data[0].pillar).toBe('adaptability')
  })
})
```

### E2E Tests (Playwright)

**Page Object Model Pattern:**

```typescript
// tests/e2e/pages/WorkshopsPage.ts
import { Page, Locator } from '@playwright/test'

export class WorkshopsPage {
  readonly page: Page
  readonly searchInput: Locator
  readonly filterAdaptability: Locator
  readonly workshopCards: Locator

  constructor(page: Page) {
    this.page = page
    this.searchInput = page.locator('[data-testid="search-input"]')
    this.filterAdaptability = page.locator('[data-testid="filter-adaptability"]')
    this.workshopCards = page.locator('[data-testid="workshop-card"]')
  }

  async goto() {
    await this.page.goto('/workshops')
  }

  async filterByPillar(pillar: 'adaptability' | 'coaching' | 'marketplace') {
    await this.page.click(`[data-testid="filter-${pillar}"]`)
  }

  async getWorkshopCount() {
    return await this.workshopCards.count()
  }
}
```

**E2E Test Example:**

```typescript
import { test, expect } from '@playwright/test'
import { WorkshopsPage } from './pages/WorkshopsPage'

test.describe('Workshop Discovery', () => {
  let workshopsPage: WorkshopsPage

  test.beforeEach(async ({ page }) => {
    workshopsPage = new WorkshopsPage(page)
    await workshopsPage.goto()
  })

  test('should filter workshops by pillar', async () => {
    await workshopsPage.filterByPillar('adaptability')

    const count = await workshopsPage.getWorkshopCount()
    expect(count).toBeGreaterThan(0)

    // Verify all workshops are Adaptability
    const titles = await workshopsPage.page
      .locator('[data-testid="workshop-card"]')
      .allTextContents()

    titles.forEach(title => {
      expect(title).toBeTruthy()
    })
  })
})
```

### Test Data Fixtures

Create reusable mock data:

```typescript
// tests/fixtures/workshops.ts
export const mockWorkshops = [
  {
    id: 'adapt-101',
    title: 'AI Adaptability Fundamentals',
    pillar: 'adaptability',
    level: 'beginner',
    capacity: { total: 25, remaining: 12 },
    price: { amount: 299, earlyBird: 249 },
  },
  // ... more workshops
]

export function getWorkshopById(id: string) {
  return mockWorkshops.find(w => w.id === id)
}
```

## CI/CD Integration

### GitHub Actions Workflow

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Workflow Jobs:**

1. **Lint & Type Check**: ESLint and TypeScript validation
2. **Unit Tests**: Vitest tests with coverage
3. **Integration Tests**: API integration tests
4. **E2E Tests**: Playwright tests on multiple browsers
5. **Accessibility Tests**: WCAG compliance validation

**View Results:**

- Check the Actions tab in GitHub
- Download test artifacts (reports, screenshots, videos)
- View coverage reports in Codecov

### Local CI Simulation

```bash
# Run tests as they would in CI
CI=true npm run test:all
```

## Coverage Requirements

**Overall Project:**
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

**Critical Paths:**
- Workshop registration flow: 100%
- Assessment completion: 100%
- Payment processing: 100%

**Component Coverage:**
- UI components: >85%
- Business logic: >90%
- API routes: >85%

**View Coverage:**

```bash
# Generate coverage report
npm run test:unit:coverage

# Open HTML report
open coverage/index.html
```

## Best Practices

### General Guidelines

1. **Test Behavior, Not Implementation**
   - Focus on what the user sees and does
   - Avoid testing internal implementation details
   - Use semantic queries (`getByRole`, `getByLabelText`)

2. **Arrange-Act-Assert Pattern**
   ```typescript
   it('should do something', () => {
     // Arrange: Set up test data
     const props = { score: 75 }

     // Act: Perform action
     renderWithProviders(<Component {...props} />)

     // Assert: Verify outcome
     expect(screen.getByText('75')).toBeInTheDocument()
   })
   ```

3. **Descriptive Test Names**
   ```typescript
   // Good
   it('should disable register button when workshop is sold out', () => {})

   // Bad
   it('button test', () => {})
   ```

4. **One Assertion Per Concept**
   - Test one behavior per test
   - Group related assertions
   - Keep tests focused and readable

5. **Use Data-Testid Wisely**
   - Prefer semantic queries (role, label, text)
   - Use `data-testid` for elements without accessible names
   - Keep test IDs consistent and meaningful

### Component Testing

1. **Test User Interactions**
   ```typescript
   it('should update slider value on drag', async () => {
     const { user } = renderWithProviders(<Slider />)

     const slider = screen.getByRole('slider')
     await user.click(slider)
     await user.keyboard('[ArrowRight]')

     expect(slider).toHaveValue('55')
   })
   ```

2. **Test Accessibility**
   ```typescript
   it('should have accessible label', () => {
     renderWithProviders(<Input label="Email" />)

     const input = screen.getByLabelText('Email')
     expect(input).toBeInTheDocument()
   })
   ```

3. **Test Error States**
   ```typescript
   it('should show validation error', async () => {
     const { user } = renderWithProviders(<Form />)

     await user.click(screen.getByRole('button', { name: /submit/i }))

     expect(screen.getByText(/email is required/i)).toBeVisible()
   })
   ```

### E2E Testing

1. **Use Page Object Models**
   - Encapsulate page interactions
   - Reuse selectors and methods
   - Make tests more maintainable

2. **Test Critical User Journeys**
   - Complete registration flow
   - Assessment completion
   - Payment processing
   - Authentication flows

3. **Handle Flaky Tests**
   - Use `waitFor` for async operations
   - Avoid arbitrary timeouts
   - Use Playwright's auto-waiting

4. **Mobile Testing**
   - Test responsive layouts
   - Verify touch interactions
   - Check mobile-specific features

### Performance

1. **Fast Tests**
   - Unit tests: < 1 second
   - Integration tests: < 5 seconds
   - E2E tests: < 30 seconds per test

2. **Parallel Execution**
   - Run independent tests in parallel
   - Use test isolation
   - Avoid shared state

3. **Test Data Management**
   - Use factories for test data
   - Clean up after tests
   - Avoid test interdependencies

## Debugging Tests

### Vitest

```bash
# Run tests with verbose output
npm run test:unit -- --reporter=verbose

# Run specific test file
npm run test:unit -- path/to/test.test.tsx

# Debug in VS Code
# Add breakpoint and use "Debug Test" code lens
```

### Playwright

```bash
# Debug mode (opens browser inspector)
npm run test:e2e:debug

# Headed mode (see browser)
npm run test:e2e:headed

# UI mode (interactive test explorer)
npm run test:e2e:ui

# View trace on failure
npx playwright show-trace test-results/trace.zip
```

### Common Issues

**Test Timeout:**
```typescript
// Increase timeout for slow test
test('slow operation', async () => {
  test.setTimeout(60000) // 60 seconds
  // ... test code
})
```

**Async Issues:**
```typescript
// Use waitFor for async assertions
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})
```

**Mock Not Working:**
```typescript
// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
})
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Test Coverage Best Practices](https://testing-library.com/docs/queries/about/#priority)

## Getting Help

- Check existing tests in `tests/` directory
- Review test utilities in `tests/setup/test-utils.tsx`
- Ask in team Slack channel #testing
- Create issue in GitHub with `testing` label
