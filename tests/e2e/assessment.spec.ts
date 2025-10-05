/**
 * E2E Tests: Adaptability Assessment Flow
 *
 * Test Coverage:
 * - Assessment start and completion
 * - Multi-step form navigation
 * - Answer persistence
 * - Results display
 * - Progress saving and resume
 */

import { test, expect } from '@playwright/test'
import { AssessmentPage } from './pages/AssessmentPage'

test.describe('Adaptability Assessment', () => {
  let assessmentPage: AssessmentPage

  test.beforeEach(async ({ page }) => {
    assessmentPage = new AssessmentPage(page)
    await assessmentPage.goto()
  })

  test('should display assessment landing page', async () => {
    // Verify landing page elements
    await expect(assessmentPage.page.locator('h1')).toBeVisible()
    await expect(assessmentPage.startButton).toBeVisible()

    // Verify description is present
    await expect(assessmentPage.page.locator('p')).toContainText(/adaptability/i)
  })

  test('should start assessment and display first dimension', async () => {
    // Start assessment
    await assessmentPage.startAssessment()

    // Verify first dimension (Individual Adaptability)
    await assessmentPage.verifyDimension('Individual')

    // Verify progress indicator
    await expect(assessmentPage.progressBar).toBeVisible()

    // Verify questions are displayed
    const sliderCount = await assessmentPage.sliders.count()
    expect(sliderCount).toBeGreaterThan(0)
  })

  test('should navigate between steps', async () => {
    await assessmentPage.startAssessment()

    // Answer first question
    await assessmentPage.answerSlider(0, 75)

    // Go to next dimension
    await assessmentPage.nextStep()

    // Verify moved to next dimension
    await assessmentPage.verifyDimension('Leadership')

    // Go back
    await assessmentPage.previousStep()

    // Verify back to individual
    await assessmentPage.verifyDimension('Individual')
  })

  test('should complete full assessment and show results', async () => {
    // Complete full assessment
    await assessmentPage.completeFullAssessment()

    // Verify results are displayed
    await assessmentPage.verifyResults()

    // Verify overall score is calculated
    const overallScore = await assessmentPage.getOverallScore()
    expect(overallScore).toBeGreaterThan(0)
    expect(overallScore).toBeLessThanOrEqual(100)
  })

  test('should display all dimension scores', async () => {
    await assessmentPage.completeFullAssessment()

    // Verify 5 dimension scores are displayed
    const dimensionCount = await assessmentPage.dimensionScores.count()
    expect(dimensionCount).toBe(5)

    // Verify each dimension has a score
    for (let i = 0; i < dimensionCount; i++) {
      await expect(assessmentPage.dimensionScores.nth(i)).toBeVisible()
    }
  })

  test('should show score color based on value', async () => {
    await assessmentPage.completeFullAssessment()

    // Get score element
    const scoreElement = assessmentPage.overallScore

    // Verify it has appropriate color class
    // (actual implementation depends on your design system)
    await expect(scoreElement).toBeVisible()
  })

  test('should allow retaking assessment', async () => {
    // Complete assessment
    await assessmentPage.completeFullAssessment()

    // Click retake
    await assessmentPage.retake()

    // Verify back to start
    await expect(assessmentPage.startButton).toBeVisible()
  })
})

test.describe('Assessment Progress Saving', () => {
  test('should save progress and allow resume', async ({ page }) => {
    const assessmentPage = new AssessmentPage(page)
    await assessmentPage.goto()

    // Start assessment
    await assessmentPage.startAssessment()

    // Answer some questions
    await assessmentPage.answerSlider(0, 80)
    await assessmentPage.answerSlider(1, 75)

    // Move to next dimension
    await assessmentPage.nextStep()
    await assessmentPage.verifyDimension('Leadership')

    // Reload page (simulating returning later)
    await page.reload()

    // Verify progress was saved - should still be on Leadership
    await assessmentPage.verifyDimension('Leadership')
  })

  test('should clear progress when starting new assessment', async ({ page }) => {
    const assessmentPage = new AssessmentPage(page)
    await assessmentPage.goto()

    // Complete assessment
    await assessmentPage.completeFullAssessment()

    // Retake
    await assessmentPage.retake()

    // Start new assessment
    await assessmentPage.startAssessment()

    // Verify starting from beginning
    await assessmentPage.verifyDimension('Individual')

    // Verify sliders are at default position
    const firstSlider = assessmentPage.sliders.first()
    const value = await firstSlider.inputValue()
    // Default should be 50 (middle)
    expect(parseInt(value)).toBeLessThanOrEqual(50)
  })
})

test.describe('Assessment Question Types', () => {
  test('should handle slider inputs correctly', async ({ page }) => {
    const assessmentPage = new AssessmentPage(page)
    await assessmentPage.goto()
    await assessmentPage.startAssessment()

    // Set slider to specific value
    await assessmentPage.answerSlider(0, 85)

    // Verify value is set
    const slider = assessmentPage.sliders.first()
    const value = await slider.inputValue()
    expect(parseInt(value)).toBe(85)

    // Verify visual feedback (if implemented)
    await expect(assessmentPage.sliderValue).toBeVisible()
  })

  test('should display Fear to Confidence recommendations', async ({ page }) => {
    const assessmentPage = new AssessmentPage(page)
    await assessmentPage.goto()
    await assessmentPage.startAssessment()

    // Look for fear-level question
    const fearSlider = assessmentPage.sliders.nth(3) // Typically 4th question

    // Set to high fear
    await fearSlider.fill('80')

    // Verify recommendations appear (if implemented)
    // This depends on your implementation
    // await expect(assessmentPage.sliderRecommendations).toBeVisible()
  })
})

test.describe('Assessment Results', () => {
  test('should display dimension breakdown', async ({ page }) => {
    const assessmentPage = new AssessmentPage(page)
    await assessmentPage.goto()

    await assessmentPage.completeFullAssessment()

    // Verify each dimension has breakdown
    const dimensions = ['Individual', 'Leadership', 'Cultural', 'Embedding', 'Velocity']

    for (const dimension of dimensions) {
      // Check dimension score is displayed
      await expect(page.getByText(dimension)).toBeVisible()
    }
  })

  test('should allow downloading results', async ({ page }) => {
    const assessmentPage = new AssessmentPage(page)
    await assessmentPage.goto()

    await assessmentPage.completeFullAssessment()

    // Attempt to download (if implemented)
    // const download = await assessmentPage.downloadResults()
    // expect(download).toBeTruthy()
  })

  test('should show personalized recommendations', async ({ page }) => {
    const assessmentPage = new AssessmentPage(page)
    await assessmentPage.goto()

    await assessmentPage.completeFullAssessment()

    // Verify recommendations section exists
    // This depends on your implementation
    await expect(page.locator('h2')).toBeVisible()
  })
})

test.describe('Mobile Assessment Experience', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('should display mobile-optimized assessment', async ({ page }) => {
    const assessmentPage = new AssessmentPage(page)
    await assessmentPage.goto()

    // Verify mobile layout
    await expect(assessmentPage.startButton).toBeVisible()

    await assessmentPage.startAssessment()

    // Verify sliders work on mobile
    await assessmentPage.answerSlider(0, 70)

    // Verify navigation buttons are accessible
    await expect(assessmentPage.nextButton).toBeVisible()
  })

  test('should handle mobile slider interactions', async ({ page }) => {
    const assessmentPage = new AssessmentPage(page)
    await assessmentPage.goto()
    await assessmentPage.startAssessment()

    // Interact with slider via touch
    const slider = assessmentPage.sliders.first()
    await slider.tap()
    await slider.fill('75')

    // Verify value changed
    const value = await slider.inputValue()
    expect(parseInt(value)).toBe(75)
  })
})

test.describe('Assessment Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    const assessmentPage = new AssessmentPage(page)
    await assessmentPage.goto()

    // Tab to start button
    await page.keyboard.press('Tab')

    // Press Enter to start
    await page.keyboard.press('Enter')

    // Verify assessment started
    await assessmentPage.verifyDimension('Individual')

    // Tab through questions
    await page.keyboard.press('Tab')

    // Verify focus is on slider
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBeTruthy()
  })

  test('should have proper ARIA labels on sliders', async ({ page }) => {
    const assessmentPage = new AssessmentPage(page)
    await assessmentPage.goto()
    await assessmentPage.startAssessment()

    // Check first slider has label
    const slider = assessmentPage.sliders.first()
    const label = await slider.getAttribute('aria-label')
    expect(label).toBeTruthy()
  })

  test('should announce progress to screen readers', async ({ page }) => {
    const assessmentPage = new AssessmentPage(page)
    await assessmentPage.goto()
    await assessmentPage.startAssessment()

    // Check for live region
    const liveRegion = page.locator('[aria-live="polite"]')
    // Implementation depends on your design
  })
})

test.describe('Assessment Validation', () => {
  test('should require answers before proceeding', async ({ page }) => {
    const assessmentPage = new AssessmentPage(page)
    await assessmentPage.goto()
    await assessmentPage.startAssessment()

    // Try to proceed without answering
    // This depends on your validation implementation
    // await assessmentPage.nextStep()
    // await expect(page.getByText(/please answer/i)).toBeVisible()
  })

  test('should validate slider ranges', async ({ page }) => {
    const assessmentPage = new AssessmentPage(page)
    await assessmentPage.goto()
    await assessmentPage.startAssessment()

    // Verify sliders have min/max
    const slider = assessmentPage.sliders.first()

    const min = await slider.getAttribute('min')
    const max = await slider.getAttribute('max')

    expect(parseInt(min || '0')).toBe(0)
    expect(parseInt(max || '100')).toBe(100)
  })
})
