# Test Suite

Comprehensive test suite for the HumanGlue platform.

## Directory Structure

```
tests/
├── setup/                      # Test configuration
│   ├── vitest-setup.ts        # Global Vitest setup
│   └── test-utils.tsx         # Testing utilities and helpers
│
├── fixtures/                   # Mock data
│   ├── workshops.ts           # Workshop test data
│   ├── assessments.ts         # Assessment test data
│   └── users.ts               # User test data
│
├── integration/                # Integration tests
│   └── api/                   # API integration tests
│       ├── workshops.test.ts
│       ├── assessments.test.ts
│       ├── talent.test.ts
│       └── user.test.ts
│
├── e2e/                        # End-to-end tests
│   ├── pages/                 # Page Object Models
│   │   ├── WorkshopsPage.ts
│   │   ├── WorkshopDetailPage.ts
│   │   ├── AssessmentPage.ts
│   │   └── TalentPage.ts
│   ├── workshops.spec.ts      # Workshop E2E tests
│   ├── assessment.spec.ts     # Assessment E2E tests
│   └── talent-marketplace.spec.ts  # Talent marketplace E2E tests
│
└── README.md                   # This file
```

## Test Types

### 1. Unit Tests (Co-located)

Unit tests for components are co-located with their source files:

```
components/
└── ui/
    ├── AdaptabilityScore.tsx
    ├── AdaptabilityScore.test.tsx    ✓
    ├── FearToConfidenceSlider.tsx
    └── FearToConfidenceSlider.test.tsx ✓
```

**Coverage:**
- Component rendering
- User interactions
- Props validation
- State management
- Accessibility

### 2. Integration Tests

Test API endpoints and database operations:

**Location:** `tests/integration/api/`

**Coverage:**
- CRUD operations
- Request validation
- Authentication/authorization
- Error handling
- Database queries

### 3. E2E Tests

Test complete user journeys:

**Location:** `tests/e2e/`

**Coverage:**
- Workshop discovery and registration
- Assessment completion
- Talent marketplace search and contact
- Authentication flows
- Payment processing

## Running Tests

### All Tests

```bash
# Run complete test suite
npm run test:all
```

### Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Watch mode (for development)
npm run test:unit:watch

# With coverage
npm run test:unit:coverage

# Run specific test
npm run test:unit -- AdaptabilityScore.test.tsx
```

### Integration Tests

```bash
# Run all integration tests
npm run test:integration

# Run specific integration test
npm run test:integration -- workshops.test.ts
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with browser visible
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug

# Interactive UI
npm run test:e2e:ui

# Specific browser
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit

# Mobile tests
npm run test:e2e:mobile
```

## Test Utilities

### `renderWithProviders`

Renders components with necessary providers:

```typescript
import { renderWithProviders } from '@/tests/setup/test-utils'

const { user } = renderWithProviders(<MyComponent />)
```

### Mock Factories

Create test data easily:

```typescript
import { createMockWorkshop, createMockAssessment } from '@/tests/setup/test-utils'

const workshop = createMockWorkshop({
  title: 'Custom Title',
  capacity: { total: 50, remaining: 25 },
})
```

### Mock Supabase Client

Mock database operations:

```typescript
import { createMockSupabaseClient } from '@/tests/setup/test-utils'

const mockSupabase = createMockSupabaseClient()
mockSupabase.from.mockReturnValue({
  select: vi.fn().mockResolvedValue({ data: [], error: null }),
})
```

## Test Fixtures

Reusable mock data is available in `tests/fixtures/`:

```typescript
import { mockWorkshops, getWorkshopById } from '@/tests/fixtures/workshops'

// Use pre-defined workshops
const workshop = mockWorkshops[0]

// Find specific workshop
const specific = getWorkshopById('adapt-101')

// Filter workshops
const adaptabilityWorkshops = filterByPillar('adaptability')
```

## Page Object Models

E2E tests use Page Object Models for maintainability:

```typescript
import { WorkshopsPage } from './pages/WorkshopsPage'

const workshopsPage = new WorkshopsPage(page)
await workshopsPage.goto()
await workshopsPage.filterByPillar('adaptability')
const count = await workshopsPage.getWorkshopCount()
```

**Benefits:**
- Encapsulate page interactions
- Reuse selectors and methods
- Easy to update when UI changes
- More readable tests

## Coverage Goals

**Overall Coverage:**
- Lines: >80%
- Functions: >80%
- Branches: >80%
- Statements: >80%

**Critical Paths:**
- Workshop registration: 100%
- Assessment completion: 100%
- Payment processing: 100%

**By Category:**
- Components: >85%
- Business logic: >90%
- API routes: >85%

## Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// ✓ Good - Tests user-visible behavior
expect(screen.getByText('75')).toBeInTheDocument()

// ✗ Bad - Tests implementation detail
expect(component.state.score).toBe(75)
```

### 2. Use Semantic Queries

```typescript
// ✓ Good - Accessible queries
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText('Email')

// ✗ Bad - Brittle selectors
screen.getByClassName('btn-primary')
```

### 3. Descriptive Test Names

```typescript
// ✓ Good
it('should disable register button when workshop is sold out', () => {})

// ✗ Bad
it('button test', () => {})
```

### 4. Arrange-Act-Assert

```typescript
it('should calculate score', () => {
  // Arrange
  const answers = { 'change-readiness': 75 }

  // Act
  const score = calculateScore(answers)

  // Assert
  expect(score).toBe(75)
})
```

### 5. Avoid Test Interdependence

```typescript
// ✓ Good - Each test is independent
beforeEach(() => {
  // Set up fresh state for each test
})

// ✗ Bad - Tests depend on order
let sharedState = {}
```

## Common Patterns

### Testing Forms

```typescript
it('should validate form', async () => {
  const { user } = renderWithProviders(<ContactForm />)

  await user.type(screen.getByLabelText('Email'), 'invalid-email')
  await user.click(screen.getByRole('button', { name: /submit/i }))

  expect(screen.getByText(/valid email required/i)).toBeVisible()
})
```

### Testing Async Operations

```typescript
it('should load data', async () => {
  renderWithProviders(<DataComponent />)

  // Wait for loading to complete
  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })

  expect(screen.getByText('Data loaded')).toBeInTheDocument()
})
```

### Testing Error States

```typescript
it('should show error message', async () => {
  const onError = vi.fn()

  renderWithProviders(<Component onError={onError} />)

  // Trigger error
  await user.click(screen.getByRole('button'))

  expect(onError).toHaveBeenCalledWith(expect.any(Error))
  expect(screen.getByText(/error occurred/i)).toBeVisible()
})
```

## Debugging

### Vitest

```typescript
// Print DOM tree
screen.debug()

// Print specific element
screen.debug(screen.getByRole('button'))

// Get testing playground URL
screen.logTestingPlaygroundURL()
```

### Playwright

```bash
# Debug mode
npm run test:e2e:debug

# Headed mode
npm run test:e2e:headed

# UI mode
npm run test:e2e:ui

# View trace
npx playwright show-trace test-results/trace.zip
```

## CI/CD

Tests run automatically on:
- Push to `main` or `develop`
- Pull requests

**GitHub Actions:**
- Lint & Type Check
- Unit Tests (with coverage)
- Integration Tests
- E2E Tests (Chromium, Firefox, WebKit)
- Accessibility Tests

**View Results:**
- GitHub Actions tab
- Coverage reports in Codecov
- Test artifacts (screenshots, videos, reports)

## Adding New Tests

### 1. Component Test

1. Create test file next to component:
   ```
   components/ui/NewComponent.test.tsx
   ```

2. Use template from [WRITING_TESTS.md](../docs/WRITING_TESTS.md)

3. Run test:
   ```bash
   npm run test:unit -- NewComponent.test.tsx
   ```

### 2. Integration Test

1. Create test file in `tests/integration/api/`:
   ```
   tests/integration/api/new-feature.test.ts
   ```

2. Use integration test template

3. Run test:
   ```bash
   npm run test:integration -- new-feature.test.ts
   ```

### 3. E2E Test

1. Create Page Object Model:
   ```
   tests/e2e/pages/NewFeaturePage.ts
   ```

2. Create test file:
   ```
   tests/e2e/new-feature.spec.ts
   ```

3. Run test:
   ```bash
   npm run test:e2e -- new-feature.spec.ts
   ```

## Resources

- [Testing Guide](../TESTING.md) - Comprehensive testing documentation
- [Writing Tests Guide](../docs/WRITING_TESTS.md) - Quick reference and templates
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)

## Questions?

- Review documentation in `/docs` directory
- Check existing tests for examples
- Ask in team Slack #testing channel
- Create GitHub issue with `testing` label
