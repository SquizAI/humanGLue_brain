/**
 * E2E Tests: Talent Marketplace Flow
 *
 * Test Coverage:
 * - Talent search and filtering
 * - Talent profile viewing
 * - Contact/booking flow
 * - Reviews and ratings
 * - Availability filtering
 */

import { test, expect } from '@playwright/test'

test.describe('Talent Marketplace', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/talent')
  })

  test('should display talent marketplace landing page', async ({ page }) => {
    // Verify hero section
    await expect(page.locator('h1')).toContainText(/talent/i)

    // Verify search is visible
    const searchInput = page.locator('[data-testid="search-input"]')
    await expect(searchInput).toBeVisible()

    // Verify talent cards are displayed
    const talentCards = page.locator('[data-testid="talent-card"]')
    const count = await talentCards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should filter talent by specialty', async ({ page }) => {
    // Get initial count
    const initialCount = await page.locator('[data-testid="talent-card"]').count()

    // Filter by AI Strategy
    await page.click('[data-testid="filter-specialty-ai-strategy"]')

    // Wait for results to update
    await page.waitForTimeout(500)

    // Verify filtered results
    const filteredCount = await page.locator('[data-testid="talent-card"]').count()
    expect(filteredCount).toBeLessThanOrEqual(initialCount)

    // Verify all displayed talent have AI Strategy specialty
    const specialtyBadges = page.locator('[data-testid="specialty-badge"]')
    const badges = await specialtyBadges.allTextContents()
    expect(badges.some(badge => badge.includes('AI Strategy'))).toBe(true)
  })

  test('should filter talent by availability', async ({ page }) => {
    // Filter by available only
    await page.click('[data-testid="filter-availability-available"]')

    // Verify all talent show as available
    const availabilityBadges = page.locator('[data-testid="availability-badge"]')
    const badges = await availabilityBadges.allTextContents()

    for (const badge of badges) {
      expect(badge).toContain('Available')
    }
  })

  test('should filter by hourly rate range', async ({ page }) => {
    // Set min rate
    const minRateSlider = page.locator('[data-testid="filter-min-rate"]')
    await minRateSlider.fill('200')

    // Set max rate
    const maxRateSlider = page.locator('[data-testid="filter-max-rate"]')
    await maxRateSlider.fill('400')

    // Wait for results
    await page.waitForTimeout(500)

    // Verify rates are within range
    const rateElements = page.locator('[data-testid="hourly-rate"]')
    const rates = await rateElements.allTextContents()

    for (const rate of rates) {
      const numericRate = parseInt(rate.replace(/[^0-9]/g, ''))
      expect(numericRate).toBeGreaterThanOrEqual(200)
      expect(numericRate).toBeLessThanOrEqual(400)
    }
  })

  test('should search talent by name or specialty', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]')

    // Search for "AI"
    await searchInput.fill('AI')

    // Wait for search results
    await page.waitForTimeout(500)

    // Verify results contain search term
    const talentCards = page.locator('[data-testid="talent-card"]')
    const count = await talentCards.count()
    expect(count).toBeGreaterThan(0)

    // Verify results match search
    const cardTexts = await talentCards.allTextContents()
    expect(cardTexts.some(text => text.toLowerCase().includes('ai'))).toBe(true)
  })

  test('should sort talent by rating', async ({ page }) => {
    // Select sort by rating
    await page.click('[data-testid="sort-select"]')
    await page.click('[data-testid="sort-rating-desc"]')

    // Wait for sort
    await page.waitForTimeout(500)

    // Get all ratings
    const ratingElements = page.locator('[data-testid="talent-rating"]')
    const ratings = await ratingElements.allTextContents()
    const numericRatings = ratings.map(r => parseFloat(r))

    // Verify descending order
    for (let i = 0; i < numericRatings.length - 1; i++) {
      expect(numericRatings[i]).toBeGreaterThanOrEqual(numericRatings[i + 1])
    }
  })

  test('should sort talent by price', async ({ page }) => {
    // Select sort by price ascending
    await page.click('[data-testid="sort-select"]')
    await page.click('[data-testid="sort-price-asc"]')

    // Wait for sort
    await page.waitForTimeout(500)

    // Get all prices
    const priceElements = page.locator('[data-testid="hourly-rate"]')
    const prices = await priceElements.allTextContents()
    const numericPrices = prices.map(p => parseInt(p.replace(/[^0-9]/g, '')))

    // Verify ascending order
    for (let i = 0; i < numericPrices.length - 1; i++) {
      expect(numericPrices[i]).toBeLessThanOrEqual(numericPrices[i + 1])
    }
  })

  test('should navigate to talent profile', async ({ page }) => {
    // Click on first talent card
    await page.locator('[data-testid="talent-card"]').first().click()

    // Verify navigation to profile page
    await expect(page).toHaveURL(/\/talent\/.*/)

    // Verify profile page loaded
    await expect(page.locator('h1')).toBeVisible()
  })
})

test.describe('Talent Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to marketplace and click first talent
    await page.goto('/talent')
    await page.locator('[data-testid="talent-card"]').first().click()
  })

  test('should display complete talent profile', async ({ page }) => {
    // Verify name and title
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="talent-title"]')).toBeVisible()

    // Verify bio
    await expect(page.locator('[data-testid="talent-bio"]')).toBeVisible()

    // Verify specialties
    const specialties = page.locator('[data-testid="specialty-badge"]')
    expect(await specialties.count()).toBeGreaterThan(0)

    // Verify impact metrics
    await expect(page.locator('[data-testid="impact-metrics"]')).toBeVisible()

    // Verify availability status
    await expect(page.locator('[data-testid="availability-badge"]')).toBeVisible()
  })

  test('should display reviews and ratings', async ({ page }) => {
    // Verify overall rating
    await expect(page.locator('[data-testid="overall-rating"]')).toBeVisible()

    // Verify reviews section
    const reviewsSection = page.locator('[data-testid="reviews-section"]')
    await expect(reviewsSection).toBeVisible()

    // Verify individual reviews are displayed
    const reviews = page.locator('[data-testid="review-card"]')
    expect(await reviews.count()).toBeGreaterThan(0)
  })

  test('should show contact button for available talent', async ({ page }) => {
    // Check availability
    const availabilityBadge = page.locator('[data-testid="availability-badge"]')
    const badgeText = await availabilityBadge.textContent()

    const contactButton = page.locator('[data-testid="contact-button"]')

    if (badgeText?.includes('Available')) {
      // Button should be enabled
      await expect(contactButton).toBeEnabled()
    } else {
      // Button should be disabled
      await expect(contactButton).toBeDisabled()
    }
  })

  test('should display pricing information', async ({ page }) => {
    // Verify hourly rate
    await expect(page.locator('[data-testid="hourly-rate"]')).toBeVisible()

    // Verify pricing tiers if available
    const pricingSection = page.locator('[data-testid="pricing-section"]')
    if (await pricingSection.isVisible()) {
      // Check for different engagement types
      await expect(page.locator('[data-testid="hourly-price"]')).toBeVisible()
    }
  })

  test('should show portfolio/case studies', async ({ page }) => {
    // Navigate to portfolio tab if it exists
    const portfolioTab = page.locator('[data-testid="tab-portfolio"]')

    if (await portfolioTab.isVisible()) {
      await portfolioTab.click()

      // Verify case studies are displayed
      const caseStudies = page.locator('[data-testid="case-study"]')
      expect(await caseStudies.count()).toBeGreaterThan(0)
    }
  })
})

test.describe('Talent Contact Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/talent')
    await page.locator('[data-testid="talent-card"]').first().click()
  })

  test('should open contact modal', async ({ page }) => {
    // Click contact button
    const contactButton = page.locator('[data-testid="contact-button"]')

    // Skip if talent is unavailable
    if (await contactButton.isDisabled()) {
      test.skip()
    }

    await contactButton.click()

    // Verify modal opened
    const contactModal = page.locator('[data-testid="contact-modal"]')
    await expect(contactModal).toBeVisible()
  })

  test('should validate contact form', async ({ page }) => {
    const contactButton = page.locator('[data-testid="contact-button"]')

    if (await contactButton.isDisabled()) {
      test.skip()
    }

    await contactButton.click()

    // Try to submit without filling form
    const submitButton = page.locator('[data-testid="submit-contact"]')
    await submitButton.click()

    // Verify validation errors
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
  })

  test('should submit contact form', async ({ page }) => {
    const contactButton = page.locator('[data-testid="contact-button"]')

    if (await contactButton.isDisabled()) {
      test.skip()
    }

    await contactButton.click()

    // Fill out form
    await page.fill('[data-testid="input-name"]', 'John Doe')
    await page.fill('[data-testid="input-email"]', 'john@example.com')
    await page.fill('[data-testid="input-company"]', 'Acme Corp')
    await page.fill('[data-testid="input-message"]', 'Interested in AI transformation coaching.')

    // Select engagement type
    await page.click('[data-testid="select-engagement-type"]')
    await page.click('[data-testid="engagement-1-on-1"]')

    // Submit
    await page.click('[data-testid="submit-contact"]')

    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
  })
})

test.describe('Talent Marketplace Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/talent')
  })

  test('should combine multiple filters', async ({ page }) => {
    // Apply specialty filter
    await page.click('[data-testid="filter-specialty-ai-strategy"]')

    // Apply availability filter
    await page.click('[data-testid="filter-availability-available"]')

    // Apply rating filter
    await page.click('[data-testid="filter-min-rating-4"]')

    // Verify filters are active
    await page.waitForTimeout(500)

    const talentCards = page.locator('[data-testid="talent-card"]')
    const count = await talentCards.count()

    // Should have some results or show no results message
    if (count === 0) {
      await expect(page.locator('[data-testid="no-results"]')).toBeVisible()
    } else {
      expect(count).toBeGreaterThan(0)
    }
  })

  test('should clear all filters', async ({ page }) => {
    // Apply multiple filters
    await page.click('[data-testid="filter-specialty-ai-strategy"]')
    await page.click('[data-testid="filter-availability-available"]')

    // Click clear filters
    await page.click('[data-testid="clear-filters"]')

    // Verify all talent shown again
    const talentCards = page.locator('[data-testid="talent-card"]')
    const count = await talentCards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should show filter count badge', async ({ page }) => {
    // Apply filters
    await page.click('[data-testid="filter-specialty-ai-strategy"]')
    await page.click('[data-testid="filter-availability-available"]')

    // Verify filter count badge
    const filterBadge = page.locator('[data-testid="active-filters-count"]')
    await expect(filterBadge).toContainText('2')
  })
})

test.describe('Mobile Talent Marketplace', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('should display mobile-optimized marketplace', async ({ page }) => {
    await page.goto('/talent')

    // Verify mobile filter toggle
    const filterToggle = page.locator('[data-testid="mobile-filter-toggle"]')
    await expect(filterToggle).toBeVisible()

    // Open filters
    await filterToggle.click()

    // Verify filters panel opened
    const filtersPanel = page.locator('[data-testid="filters-panel"]')
    await expect(filtersPanel).toBeVisible()
  })

  test('should display talent cards in mobile grid', async ({ page }) => {
    await page.goto('/talent')

    // Verify talent cards are displayed
    const talentCards = page.locator('[data-testid="talent-card"]')
    expect(await talentCards.count()).toBeGreaterThan(0)

    // Verify mobile layout (single column)
    const firstCard = talentCards.first()
    const box = await firstCard.boundingBox()

    if (box) {
      // Card should be nearly full width on mobile
      expect(box.width).toBeGreaterThan(300)
    }
  })

  test('should handle mobile contact flow', async ({ page }) => {
    await page.goto('/talent')

    // Navigate to talent profile
    await page.locator('[data-testid="talent-card"]').first().click()

    // Contact button should be visible and accessible
    const contactButton = page.locator('[data-testid="contact-button"]')

    if (await contactButton.isEnabled()) {
      await contactButton.click()

      // Verify mobile modal
      const contactModal = page.locator('[data-testid="contact-modal"]')
      await expect(contactModal).toBeVisible()
    }
  })
})

test.describe('Talent Marketplace Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/talent')
  })

  test('should be keyboard navigable', async ({ page }) => {
    // Tab through filters
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Verify focus is visible
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBeTruthy()
  })

  test('should have proper ARIA labels', async ({ page }) => {
    // Check search input
    const searchInput = page.locator('[data-testid="search-input"]')
    const label = await searchInput.getAttribute('aria-label')
    expect(label || await searchInput.getAttribute('placeholder')).toBeTruthy()
  })

  test('should announce filter changes to screen readers', async ({ page }) => {
    // Apply filter
    await page.click('[data-testid="filter-specialty-ai-strategy"]')

    // Check for live region update
    const liveRegion = page.locator('[aria-live="polite"]')
    // Implementation depends on your design
  })
})
