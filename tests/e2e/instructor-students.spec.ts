/**
 * E2E Tests: Instructor Student Management
 * Tests student list, filtering, search, detail view, and bulk actions
 */

import { test, expect } from '../utils/fixtures'
import { loginAsInstructor } from '../utils/auth-helpers'
import { seedInstructorData, seedStudentEnrollments } from '../utils/db-helpers'

test.describe('Student Management Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsInstructor(page)
    await page.goto('/instructor/students')
  })

  test('should display student list', async ({ page }) => {
    // Wait for students to load
    await page.waitForSelector('[data-testid="student-card"]', { timeout: 10000 })

    // Should have at least one student card
    const studentCards = page.locator('[data-testid="student-card"]')
    await expect(studentCards.first()).toBeVisible()

    // Verify student count in stats
    const totalStudents = await page.locator('[data-testid="stat-total-students"]').textContent()
    expect(parseInt(totalStudents || '0')).toBeGreaterThan(0)
  })

  test('should display student stats correctly', async ({ page }) => {
    // Check all stat cards are visible
    await expect(page.locator('[data-testid="stat-total-students"]')).toBeVisible()
    await expect(page.locator('[data-testid="stat-active-students"]')).toBeVisible()
    await expect(page.locator('[data-testid="stat-avg-completion"]')).toBeVisible()
    await expect(page.locator('[data-testid="stat-avg-engagement"]')).toBeVisible()

    // Stats should have numeric values
    const totalText = await page.locator('[data-testid="stat-total-students"]').textContent()
    expect(totalText).toMatch(/\d+/)
  })

  test('should search students by name', async ({ page }) => {
    await page.waitForSelector('[data-testid="student-card"]')

    // Get first student name
    const firstName = await page
      .locator('[data-testid="student-card"]')
      .first()
      .locator('[data-testid="student-name"]')
      .textContent()

    if (!firstName) return

    // Search for that student
    await page.fill('[data-testid="search-input"]', firstName.trim())

    // Wait for filter to apply
    await page.waitForTimeout(500)

    // Should show only matching students
    const visibleCards = page.locator('[data-testid="student-card"]')
    const count = await visibleCards.count()

    // All visible students should match search
    for (let i = 0; i < count; i++) {
      const name = await visibleCards.nth(i).locator('[data-testid="student-name"]').textContent()
      expect(name?.toLowerCase()).toContain(firstName.trim().toLowerCase())
    }
  })

  test('should search students by email', async ({ page }) => {
    await page.waitForSelector('[data-testid="student-card"]')

    // Get first student email
    const firstEmail = await page
      .locator('[data-testid="student-card"]')
      .first()
      .locator('[data-testid="student-email"]')
      .textContent()

    if (!firstEmail) return

    // Search by email domain
    const emailDomain = firstEmail.split('@')[1]
    await page.fill('[data-testid="search-input"]', emailDomain)

    await page.waitForTimeout(500)

    // Should show students with that domain
    const visibleCards = page.locator('[data-testid="student-card"]')
    const firstVisible = await visibleCards
      .first()
      .locator('[data-testid="student-email"]')
      .textContent()
    expect(firstVisible?.toLowerCase()).toContain(emailDomain.toLowerCase())
  })

  test('should filter by status', async ({ page }) => {
    await page.waitForSelector('[data-testid="student-card"]')

    // Filter by active status
    await page.selectOption('[data-testid="filter-status"]', 'active')
    await page.waitForTimeout(500)

    // All visible students should be active
    const statusBadges = page.locator('[data-testid="student-status-badge"]')
    const count = await statusBadges.count()

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const statusText = await statusBadges.nth(i).textContent()
        expect(statusText?.toLowerCase()).toBe('active')
      }
    }
  })

  test('should filter by engagement level', async ({ page }) => {
    await page.waitForSelector('[data-testid="student-card"]')

    // Filter by high engagement
    await page.selectOption('[data-testid="filter-engagement"]', 'high')
    await page.waitForTimeout(500)

    // All visible students should have engagement >= 80
    const engagementScores = page.locator('[data-testid="engagement-score"]')
    const count = await engagementScores.count()

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const scoreText = await engagementScores.nth(i).textContent()
        const score = parseInt(scoreText || '0')
        expect(score).toBeGreaterThanOrEqual(80)
      }
    }
  })

  test('should sort students correctly', async ({ page }) => {
    await page.waitForSelector('[data-testid="student-card"]')

    // Sort by name
    await page.selectOption('[data-testid="sort-by"]', 'name')
    await page.waitForTimeout(500)

    const names = await page.locator('[data-testid="student-name"]').allTextContents()
    const sortedNames = [...names].sort((a, b) => a.localeCompare(b))
    expect(names).toEqual(sortedNames)

    // Sort by progress
    await page.selectOption('[data-testid="sort-by"]', 'progress')
    await page.waitForTimeout(500)

    const progressValues = await page
      .locator('[data-testid="progress-percentage"]')
      .allTextContents()
    const progressNumbers = progressValues.map((p) => parseInt(p))

    // Should be in descending order
    for (let i = 0; i < progressNumbers.length - 1; i++) {
      expect(progressNumbers[i]).toBeGreaterThanOrEqual(progressNumbers[i + 1])
    }
  })

  test('should open student detail modal', async ({ page }) => {
    await page.waitForSelector('[data-testid="student-card"]')

    // Click first student's detail button
    await page.click('[data-testid="student-card"] >> [data-testid="btn-view-details"]')

    // Modal should open
    await expect(page.locator('[data-testid="student-modal"]')).toBeVisible()

    // Should show student details
    await expect(page.locator('[data-testid="modal-student-name"]')).toBeVisible()
    await expect(page.locator('[data-testid="modal-student-email"]')).toBeVisible()
  })

  test('should display course progress in detail modal', async ({ page }) => {
    await page.waitForSelector('[data-testid="student-card"]')

    await page.click('[data-testid="student-card"] >> [data-testid="btn-view-details"]')

    await expect(page.locator('[data-testid="student-modal"]')).toBeVisible()

    // Should show course list
    const courseCards = page.locator('[data-testid="modal-course-card"]')
    if ((await courseCards.count()) > 0) {
      await expect(courseCards.first()).toBeVisible()

      // Each course should show progress bar
      await expect(
        courseCards.first().locator('[data-testid="course-progress-bar"]')
      ).toBeVisible()
    }
  })

  test('should display recent activity in detail modal', async ({ page }) => {
    await page.waitForSelector('[data-testid="student-card"]')

    await page.click('[data-testid="student-card"] >> [data-testid="btn-view-details"]')

    await expect(page.locator('[data-testid="student-modal"]')).toBeVisible()

    // Should show activity timeline
    const activityItems = page.locator('[data-testid="activity-item"]')
    if ((await activityItems.count()) > 0) {
      await expect(activityItems.first()).toBeVisible()

      // Activity should have timestamp
      await expect(
        activityItems.first().locator('[data-testid="activity-time"]')
      ).toBeVisible()
    }
  })

  test('should close modal on close button click', async ({ page }) => {
    await page.waitForSelector('[data-testid="student-card"]')

    await page.click('[data-testid="student-card"] >> [data-testid="btn-view-details"]')
    await expect(page.locator('[data-testid="student-modal"]')).toBeVisible()

    // Click close button
    await page.click('[data-testid="btn-close-modal"]')

    // Modal should close
    await expect(page.locator('[data-testid="student-modal"]')).not.toBeVisible()
  })

  test('should close modal on backdrop click', async ({ page }) => {
    await page.waitForSelector('[data-testid="student-card"]')

    await page.click('[data-testid="student-card"] >> [data-testid="btn-view-details"]')
    await expect(page.locator('[data-testid="student-modal"]')).toBeVisible()

    // Click backdrop
    await page.click('[data-testid="modal-backdrop"]')

    // Modal should close
    await expect(page.locator('[data-testid="student-modal"]')).not.toBeVisible()
  })
})

test.describe('Bulk Actions', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsInstructor(page)
    await page.goto('/instructor/students')
    await page.waitForSelector('[data-testid="student-card"]')
  })

  test('should select individual students', async ({ page }) => {
    // Click first student checkbox
    await page.click('[data-testid="student-card"]:first-child >> [data-testid="student-checkbox"]')

    // Checkbox should be checked
    await expect(
      page.locator('[data-testid="student-card"]:first-child >> [data-testid="student-checkbox"]')
    ).toBeChecked()

    // Bulk action buttons should be enabled
    await expect(page.locator('[data-testid="bulk-email-btn"]')).not.toBeDisabled()
  })

  test('should select all students', async ({ page }) => {
    // Click select all checkbox
    await page.click('[data-testid="select-all-checkbox"]')

    // All checkboxes should be checked
    const checkboxes = page.locator('[data-testid="student-checkbox"]')
    const count = await checkboxes.count()

    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).toBeChecked()
    }
  })

  test('should deselect all when clicking select all again', async ({ page }) => {
    // Select all
    await page.click('[data-testid="select-all-checkbox"]')

    // Deselect all
    await page.click('[data-testid="select-all-checkbox"]')

    // No checkboxes should be checked
    const checkboxes = page.locator('[data-testid="student-checkbox"]')
    const count = await checkboxes.count()

    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).not.toBeChecked()
    }
  })

  test('should open bulk email modal', async ({ page }) => {
    // Select a student
    await page.click('[data-testid="student-card"]:first-child >> [data-testid="student-checkbox"]')

    // Click bulk email button
    await page.click('[data-testid="bulk-email-btn"]')

    // Modal should open
    await expect(page.locator('[data-testid="bulk-email-modal"]')).toBeVisible()
    await expect(page.locator('[data-testid="email-subject-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="email-message-textarea"]')).toBeVisible()
  })

  test('should validate bulk email form', async ({ page }) => {
    await page.click('[data-testid="student-card"]:first-child >> [data-testid="student-checkbox"]')
    await page.click('[data-testid="bulk-email-btn"]')

    // Try to send without filling form
    await page.click('[data-testid="btn-send-email"]')

    // Send button should be disabled or show validation
    const sendBtn = page.locator('[data-testid="btn-send-email"]')
    const isDisabled = await sendBtn.isDisabled()
    expect(isDisabled).toBe(true)
  })

  test('should send bulk email with valid data', async ({ page }) => {
    await page.click('[data-testid="student-card"]:first-child >> [data-testid="student-checkbox"]')
    await page.click('[data-testid="bulk-email-btn"]')

    // Fill form
    await page.fill('[data-testid="email-subject-input"]', 'Test Email Subject')
    await page.fill(
      '[data-testid="email-message-textarea"]',
      'This is a test email message for all selected students.'
    )

    // Click send
    await page.click('[data-testid="btn-send-email"]')

    // Modal should close
    await expect(page.locator('[data-testid="bulk-email-modal"]')).not.toBeVisible()

    // Should show success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
  })

  test('should export student data', async ({ page }) => {
    // Setup download listener
    const downloadPromise = page.waitForEvent('download')

    // Click export button
    await page.click('[data-testid="export-btn"]')

    // Wait for download
    const download = await downloadPromise

    // Verify filename
    expect(download.suggestedFilename()).toContain('students-export')
    expect(download.suggestedFilename()).toContain('.csv')
  })
})

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await loginAsInstructor(page)
    await page.goto('/instructor/students')

    await page.waitForSelector('[data-testid="student-card"]')

    // Student cards should be visible
    await expect(page.locator('[data-testid="student-card"]')).toBeVisible()

    // Mobile menu should be accessible
    const mobileMenu = page.locator('[data-testid="mobile-menu-btn"]')
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click()
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible()
    }
  })

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })

    await loginAsInstructor(page)
    await page.goto('/instructor/students')

    await page.waitForSelector('[data-testid="student-card"]')

    // Should show 1 column on tablet
    const cards = page.locator('[data-testid="student-card"]')
    const firstCard = await cards.first().boundingBox()
    const secondCard = await cards.nth(1).boundingBox()

    // Cards should stack vertically on tablet
    if (firstCard && secondCard) {
      expect(secondCard.y).toBeGreaterThan(firstCard.y + firstCard.height)
    }
  })
})
