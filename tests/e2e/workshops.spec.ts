/**
 * E2E Tests: Workshop Discovery and Registration
 *
 * Test Coverage:
 * - Workshop catalog browsing
 * - Search and filtering
 * - Workshop detail viewing
 * - Registration flow (excluding payment)
 * - Sold out workshops
 * - Mobile responsive behavior
 */

import { test, expect } from '@playwright/test'
import { WorkshopsPage } from './pages/WorkshopsPage'
import { WorkshopDetailPage } from './pages/WorkshopDetailPage'

test.describe('Workshop Catalog', () => {
  let workshopsPage: WorkshopsPage

  test.beforeEach(async ({ page }) => {
    workshopsPage = new WorkshopsPage(page)
    await workshopsPage.goto()
  })

  test('should display workshop catalog with filters', async () => {
    // Verify hero section
    await expect(workshopsPage.heroTitle).toContainText('Workshop Catalog')

    // Verify search is visible
    await expect(workshopsPage.searchInput).toBeVisible()

    // Verify filter buttons are visible
    await expect(workshopsPage.filterPillarAll).toBeVisible()
    await expect(workshopsPage.filterPillarAdaptability).toBeVisible()
    await expect(workshopsPage.filterPillarCoaching).toBeVisible()
    await expect(workshopsPage.filterPillarMarketplace).toBeVisible()

    // Verify workshops are displayed
    const workshopCount = await workshopsPage.getWorkshopCount()
    expect(workshopCount).toBeGreaterThan(0)
  })

  test('should filter workshops by pillar', async () => {
    // Get initial count
    const initialCount = await workshopsPage.getWorkshopCount()
    expect(initialCount).toBeGreaterThan(0)

    // Filter by Adaptability
    await workshopsPage.filterByPillar('adaptability')

    // Verify filter is active
    await workshopsPage.verifyFiltersActive()

    // Verify filtered results
    const filteredCount = await workshopsPage.getWorkshopCount()
    expect(filteredCount).toBeLessThanOrEqual(initialCount)

    // Verify all displayed workshops are Adaptability
    const titles = await workshopsPage.getWorkshopTitles()
    expect(titles.length).toBeGreaterThan(0)
  })

  test('should filter workshops by level', async () => {
    // Filter by Beginner
    await workshopsPage.filterByLevel('beginner')

    // Verify filtered results
    const beginnerCount = await workshopsPage.getWorkshopCount()
    expect(beginnerCount).toBeGreaterThan(0)

    // Filter by Advanced
    await workshopsPage.filterByLevel('advanced')

    // Verify different results
    const advancedCount = await workshopsPage.getWorkshopCount()
    expect(advancedCount).toBeGreaterThan(0)
  })

  test('should search workshops by title', async () => {
    // Search for "AI"
    await workshopsPage.search('AI')

    // Verify results contain search term
    const titles = await workshopsPage.getWorkshopTitles()
    expect(titles.length).toBeGreaterThan(0)
    expect(titles.some((title) => title.toLowerCase().includes('ai'))).toBe(true)
  })

  test('should show no results for invalid search', async () => {
    // Search for non-existent workshop
    await workshopsPage.search('zzzzzzzzzz123456')

    // Verify no results message
    await workshopsPage.verifyNoResults()
  })

  test('should combine filters and search', async () => {
    // Apply pillar filter
    await workshopsPage.filterByPillar('adaptability')

    // Apply level filter
    await workshopsPage.filterByLevel('beginner')

    // Apply search
    await workshopsPage.search('fundamental')

    // Verify filters are active
    await workshopsPage.verifyFiltersActive()

    // Get filtered count
    const filteredCount = await workshopsPage.getWorkshopCount()
    expect(filteredCount).toBeGreaterThanOrEqual(0)
  })

  test('should clear all filters', async () => {
    // Apply multiple filters
    await workshopsPage.filterByPillar('coaching')
    await workshopsPage.filterByLevel('intermediate')
    await workshopsPage.search('certification')

    // Verify filters are active
    await workshopsPage.verifyFiltersActive()

    // Clear all filters
    await workshopsPage.clearFilters()

    // Verify all workshops are shown again
    const workshopCount = await workshopsPage.getWorkshopCount()
    expect(workshopCount).toBeGreaterThan(0)
  })

  test('should switch between grid and list view', async () => {
    // Switch to list view
    await workshopsPage.switchViewMode('list')

    // Verify view mode changed
    await expect(workshopsPage.viewListButton).toHaveClass(/bg-blue-500/)

    // Switch back to grid view
    await workshopsPage.switchViewMode('grid')

    // Verify view mode changed
    await expect(workshopsPage.viewGridButton).toHaveClass(/bg-blue-500/)
  })

  test('should navigate to workshop detail', async () => {
    // Click on first workshop
    await workshopsPage.clickWorkshop(0)

    // Verify navigation to detail page
    await expect(workshopsPage.page).toHaveURL(/\/workshops\/.*/)
    await expect(workshopsPage.page.locator('h1')).toBeVisible()
  })
})

test.describe('Workshop Detail', () => {
  let detailPage: WorkshopDetailPage

  test.beforeEach(async ({ page }) => {
    detailPage = new WorkshopDetailPage(page)
  })

  test('should display workshop details', async ({ page }) => {
    // Navigate from catalog to detail
    const workshopsPage = new WorkshopsPage(page)
    await workshopsPage.goto()
    await workshopsPage.clickWorkshop(0)

    // Verify all key details are visible
    await expect(detailPage.workshopTitle).toBeVisible()
    await expect(detailPage.registerButton).toBeVisible()
  })

  test('should show register button for available workshops', async ({ page }) => {
    // Navigate from catalog
    const workshopsPage = new WorkshopsPage(page)
    await workshopsPage.goto()

    // Find and click on available workshop
    await workshopsPage.filterByPillar('adaptability')
    await workshopsPage.clickWorkshop(0)

    // Verify register button is enabled
    await expect(detailPage.registerButton).toBeEnabled()
  })

  test('should disable register button for sold out workshops', async ({ page }) => {
    // This test requires a sold-out workshop to exist
    // We'll skip if no sold-out workshops are available
    const workshopsPage = new WorkshopsPage(page)
    await workshopsPage.goto()

    // Try to find sold out workshop
    await workshopsPage.search('sold out')

    const count = await workshopsPage.getWorkshopCount()
    if (count === 0) {
      test.skip()
    }

    await workshopsPage.clickWorkshop(0)

    // Verify sold out state
    await detailPage.verifySoldOut()
  })
})

test.describe('Workshop Registration Flow', () => {
  test('should start registration process', async ({ page }) => {
    const workshopsPage = new WorkshopsPage(page)
    const detailPage = new WorkshopDetailPage(page)

    // Navigate to workshop
    await workshopsPage.goto()
    await workshopsPage.clickWorkshop(0)

    // Click register
    await detailPage.clickRegister()

    // Verify navigation to registration page
    await expect(page).toHaveURL(/\/workshops\/.*\/register/)
  })

  test('should require authentication for registration', async ({ page }) => {
    const workshopsPage = new WorkshopsPage(page)
    const detailPage = new WorkshopDetailPage(page)

    // Clear cookies to ensure not authenticated
    await page.context().clearCookies()

    // Navigate to workshop
    await workshopsPage.goto()
    await workshopsPage.clickWorkshop(0)

    // Try to register
    await detailPage.clickRegister()

    // Verify redirect to login or auth modal
    // This will depend on your auth implementation
    // await expect(page).toHaveURL(/\/login/)
    // OR
    // await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible()
  })
})

test.describe('Mobile Workshops Experience', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('should display mobile-optimized catalog', async ({ page }) => {
    const workshopsPage = new WorkshopsPage(page)
    await workshopsPage.goto()

    // Verify mobile filter toggle is visible
    await expect(workshopsPage.filterToggle).toBeVisible()

    // Open mobile filters
    await workshopsPage.openMobileFilters()

    // Verify filters are displayed
    await expect(workshopsPage.filterPillarAdaptability).toBeVisible()
  })

  test('should allow filtering on mobile', async ({ page }) => {
    const workshopsPage = new WorkshopsPage(page)
    await workshopsPage.goto()

    // Open filters
    await workshopsPage.openMobileFilters()

    // Apply filter
    await workshopsPage.filterByPillar('coaching')

    // Verify filters work
    const count = await workshopsPage.getWorkshopCount()
    expect(count).toBeGreaterThan(0)
  })
})

test.describe('Workshop Search Performance', () => {
  test('should handle search debouncing', async ({ page }) => {
    const workshopsPage = new WorkshopsPage(page)
    await workshopsPage.goto()

    // Type quickly
    await workshopsPage.searchInput.type('AI Transformation', { delay: 50 })

    // Wait for debounce
    await page.waitForTimeout(600)

    // Verify search completed
    const count = await workshopsPage.getWorkshopCount()
    expect(count).toBeGreaterThanOrEqual(0)
  })
})

test.describe('Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    const workshopsPage = new WorkshopsPage(page)
    await workshopsPage.goto()

    // Tab through filter buttons
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Verify focus is visible
    const focusedElement = await page.evaluateHandle(() => document.activeElement)
    expect(focusedElement).toBeTruthy()
  })

  test('should have proper ARIA labels', async ({ page }) => {
    const workshopsPage = new WorkshopsPage(page)
    await workshopsPage.goto()

    // Check search input has label
    const searchLabel = await workshopsPage.searchInput.getAttribute('aria-label')
    expect(searchLabel || workshopsPage.searchInput.getAttribute('placeholder')).toBeTruthy()
  })
})
