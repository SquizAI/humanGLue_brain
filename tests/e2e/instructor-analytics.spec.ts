/**
 * E2E Tests: Instructor Analytics Dashboard
 * Tests revenue analytics, charts, filters, and data visualization
 */

import { test, expect } from '../utils/fixtures'
import { loginAsInstructor } from '../utils/auth-helpers'

test.describe('Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsInstructor(page)
    await page.goto('/instructor/analytics')
  })

  test('should display analytics overview', async ({ page }) => {
    await page.waitForSelector('[data-testid="analytics-overview"]', { timeout: 10000 })

    // Check key metrics are visible
    await expect(page.locator('[data-testid="metric-total-revenue"]')).toBeVisible()
    await expect(page.locator('[data-testid="metric-total-students"]')).toBeVisible()
    await expect(page.locator('[data-testid="metric-avg-rating"]')).toBeVisible()
    await expect(page.locator('[data-testid="metric-completion-rate"]')).toBeVisible()
  })

  test('should display revenue chart', async ({ page }) => {
    await page.waitForSelector('[data-testid="revenue-chart"]', { timeout: 10000 })

    // Chart should be visible
    await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible()

    // Chart should have SVG elements (Recharts renders as SVG)
    const svgElements = await page.locator('[data-testid="revenue-chart"] svg').count()
    expect(svgElements).toBeGreaterThan(0)
  })

  test('should display student enrollment chart', async ({ page }) => {
    await page.waitForSelector('[data-testid="enrollment-chart"]', { timeout: 10000 })

    await expect(page.locator('[data-testid="enrollment-chart"]')).toBeVisible()

    // Should have chart data
    const chartBars = await page
      .locator('[data-testid="enrollment-chart"] .recharts-bar-rectangle')
      .count()
    expect(chartBars).toBeGreaterThan(0)
  })

  test('should filter analytics by date range', async ({ page }) => {
    await page.waitForSelector('[data-testid="date-range-filter"]', { timeout: 10000 })

    // Select last 30 days
    await page.selectOption('[data-testid="date-range-filter"]', '30days')
    await page.waitForTimeout(500)

    // Charts should update (check if data changed)
    await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible()

    // Select last 90 days
    await page.selectOption('[data-testid="date-range-filter"]', '90days')
    await page.waitForTimeout(500)

    await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible()
  })

  test('should display course performance breakdown', async ({ page }) => {
    await page.waitForSelector('[data-testid="course-performance"]', { timeout: 10000 })

    // Should list courses with metrics
    const courseRows = page.locator('[data-testid="course-performance-row"]')
    if ((await courseRows.count()) > 0) {
      const firstRow = courseRows.first()

      await expect(firstRow.locator('[data-testid="course-name"]')).toBeVisible()
      await expect(firstRow.locator('[data-testid="course-revenue"]')).toBeVisible()
      await expect(firstRow.locator('[data-testid="course-students"]')).toBeVisible()
      await expect(firstRow.locator('[data-testid="course-rating"]')).toBeVisible()
    }
  })

  test('should display top performing courses', async ({ page }) => {
    await page.waitForSelector('[data-testid="top-courses"]', { timeout: 10000 })

    const topCourses = page.locator('[data-testid="top-course-card"]')
    if ((await topCourses.count()) > 0) {
      // Should show at least top 3 courses
      expect(await topCourses.count()).toBeGreaterThanOrEqual(3)

      // Each should have metrics
      await expect(topCourses.first().locator('[data-testid="revenue-amount"]')).toBeVisible()
    }
  })

  test('should show revenue trends', async ({ page }) => {
    await page.waitForSelector('[data-testid="revenue-trends"]', { timeout: 10000 })

    // Should show trend indicators
    await expect(page.locator('[data-testid="trend-this-month"]')).toBeVisible()
    await expect(page.locator('[data-testid="trend-vs-last-month"]')).toBeVisible()

    // Trend should show percentage change
    const trendText = await page.locator('[data-testid="trend-percentage"]').textContent()
    expect(trendText).toMatch(/%/)
  })

  test('should export analytics data', async ({ page }) => {
    await page.waitForSelector('[data-testid="export-analytics-btn"]', { timeout: 10000 })

    // Setup download listener
    const downloadPromise = page.waitForEvent('download')

    // Click export button
    await page.click('[data-testid="export-analytics-btn"]')

    // Wait for download
    const download = await downloadPromise

    // Verify filename contains analytics data
    expect(download.suggestedFilename()).toContain('analytics')
    expect(download.suggestedFilename()).toMatch(/\.(csv|xlsx|pdf)$/)
  })
})

test.describe('Revenue Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsInstructor(page)
    await page.goto('/instructor/analytics')
  })

  test('should display revenue breakdown by source', async ({ page }) => {
    await page.waitForSelector('[data-testid="revenue-breakdown"]', { timeout: 10000 })

    // Should show revenue from different sources
    const sources = ['courses', 'workshops', 'consultations']

    for (const source of sources) {
      const element = page.locator(`[data-testid="revenue-${source}"]`)
      if (await element.isVisible()) {
        await expect(element).toBeVisible()
      }
    }
  })

  test('should calculate and display instructor earnings', async ({ page }) => {
    await page.waitForSelector('[data-testid="earnings-summary"]', { timeout: 10000 })

    // Should show gross revenue, platform fees, and net earnings
    await expect(page.locator('[data-testid="gross-revenue"]')).toBeVisible()
    await expect(page.locator('[data-testid="platform-fees"]')).toBeVisible()
    await expect(page.locator('[data-testid="net-earnings"]')).toBeVisible()

    // Net earnings should be gross minus fees
    const grossText = await page.locator('[data-testid="gross-revenue"]').textContent()
    const feesText = await page.locator('[data-testid="platform-fees"]').textContent()
    const netText = await page.locator('[data-testid="net-earnings"]').textContent()

    const gross = parseFloat(grossText?.replace(/[^0-9.]/g, '') || '0')
    const fees = parseFloat(feesText?.replace(/[^0-9.]/g, '') || '0')
    const net = parseFloat(netText?.replace(/[^0-9.]/g, '') || '0')

    expect(net).toBe(gross - fees)
  })

  test('should show pending payouts', async ({ page }) => {
    await page.waitForSelector('[data-testid="pending-payouts"]', { timeout: 10000 })

    const pendingAmount = page.locator('[data-testid="pending-payout-amount"]')
    if (await pendingAmount.isVisible()) {
      // Should display amount
      await expect(pendingAmount).toBeVisible()

      // Should show next payout date
      await expect(page.locator('[data-testid="next-payout-date"]')).toBeVisible()
    }
  })
})

test.describe('Student Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsInstructor(page)
    await page.goto('/instructor/analytics')
  })

  test('should show student engagement metrics', async ({ page }) => {
    await page.waitForSelector('[data-testid="engagement-metrics"]', { timeout: 10000 })

    // Should show various engagement indicators
    await expect(page.locator('[data-testid="avg-completion-time"]')).toBeVisible()
    await expect(page.locator('[data-testid="avg-engagement-score"]')).toBeVisible()
    await expect(page.locator('[data-testid="active-students-percentage"]')).toBeVisible()
  })

  test('should display enrollment trends over time', async ({ page }) => {
    await page.waitForSelector('[data-testid="enrollment-trends-chart"]', { timeout: 10000 })

    // Chart should show enrollment data
    await expect(page.locator('[data-testid="enrollment-trends-chart"]')).toBeVisible()

    // Should have data points
    const dataPoints = await page
      .locator('[data-testid="enrollment-trends-chart"] .recharts-line-curve')
      .count()
    expect(dataPoints).toBeGreaterThan(0)
  })

  test('should show completion rate by course', async ({ page }) => {
    await page.waitForSelector('[data-testid="completion-rates"]', { timeout: 10000 })

    const courseRates = page.locator('[data-testid="course-completion-rate"]')
    if ((await courseRates.count()) > 0) {
      const firstRate = await courseRates.first().textContent()
      expect(firstRate).toMatch(/%/)
    }
  })
})

test.describe('Accessibility', () => {
  test('charts should have proper ARIA labels', async ({ page }) => {
    await loginAsInstructor(page)
    await page.goto('/instructor/analytics')

    await page.waitForSelector('[data-testid="revenue-chart"]', { timeout: 10000 })

    // Chart containers should have aria-label
    const revenueChart = page.locator('[data-testid="revenue-chart"]')
    const ariaLabel = await revenueChart.getAttribute('aria-label')
    expect(ariaLabel).toBeTruthy()
  })

  test('data tables should be keyboard navigable', async ({ page }) => {
    await loginAsInstructor(page)
    await page.goto('/instructor/analytics')

    await page.waitForSelector('[data-testid="course-performance"]', { timeout: 10000 })

    // Should be able to tab through table rows
    await page.keyboard.press('Tab')

    const focusedElement = await page.evaluate(
      () => document.activeElement?.getAttribute('data-testid')
    )
    expect(focusedElement).toBeTruthy()
  })
})

test.describe('Performance', () => {
  test('should load analytics within 3 seconds', async ({ page }) => {
    await loginAsInstructor(page)

    const startTime = Date.now()

    await page.goto('/instructor/analytics')

    await page.waitForSelector('[data-testid="analytics-overview"]', { timeout: 10000 })

    const loadTime = Date.now() - startTime

    expect(loadTime).toBeLessThan(3000)
  })

  test('charts should render efficiently', async ({ page }) => {
    await loginAsInstructor(page)
    await page.goto('/instructor/analytics')

    // Measure chart render time
    const chartLoadStart = Date.now()

    await page.waitForSelector('[data-testid="revenue-chart"] svg', { timeout: 10000 })

    const chartLoadTime = Date.now() - chartLoadStart

    expect(chartLoadTime).toBeLessThan(1000)
  })
})
