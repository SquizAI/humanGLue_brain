/**
 * E2E Tests: Instructor Course Management
 * Tests course list, creation, editing, deletion, and publishing
 */

import { test, expect } from '../utils/fixtures'
import { loginAsInstructor } from '../utils/auth-helpers'
import { generateMockCourse } from '../utils/fixtures'

test.describe('Course Management Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsInstructor(page)
    await page.goto('/instructor/courses')
  })

  test('should display course list', async ({ page }) => {
    // Wait for courses to load
    await page.waitForSelector('[data-testid="course-card"], [data-testid="empty-state"]', {
      timeout: 10000,
    })

    // Should show either courses or empty state
    const hasCourses = await page.locator('[data-testid="course-card"]').count()
    const hasEmptyState = await page.locator('[data-testid="empty-state"]').isVisible()

    expect(hasCourses > 0 || hasEmptyState).toBe(true)
  })

  test('should show course statistics', async ({ page }) => {
    await page.waitForSelector('[data-testid="course-stats"]', { timeout: 10000 })

    // Verify stat cards
    await expect(page.locator('[data-testid="stat-total-courses"]')).toBeVisible()
    await expect(page.locator('[data-testid="stat-total-students"]')).toBeVisible()
    await expect(page.locator('[data-testid="stat-total-revenue"]')).toBeVisible()
  })

  test('should navigate to create course page', async ({ page }) => {
    await page.click('[data-testid="btn-create-course"]')

    await expect(page).toHaveURL(/\/instructor\/courses\/new/)
    await expect(page.locator('h1')).toContainText(/create.*course/i)
  })

  test('should filter courses by status', async ({ page }) => {
    await page.waitForSelector('[data-testid="course-card"]', { timeout: 10000 })

    // Filter by published
    await page.selectOption('[data-testid="filter-status"]', 'published')
    await page.waitForTimeout(500)

    const statusBadges = page.locator('[data-testid="course-status"]')
    const count = await statusBadges.count()

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const status = await statusBadges.nth(i).textContent()
        expect(status?.toLowerCase()).toBe('published')
      }
    }
  })

  test('should search courses by title', async ({ page }) => {
    await page.waitForSelector('[data-testid="course-card"]', { timeout: 10000 })

    const firstTitle = await page
      .locator('[data-testid="course-card"]')
      .first()
      .locator('[data-testid="course-title"]')
      .textContent()

    if (firstTitle) {
      await page.fill('[data-testid="search-input"]', firstTitle.trim())
      await page.waitForTimeout(500)

      const visibleTitles = await page
        .locator('[data-testid="course-title"]')
        .allTextContents()
      visibleTitles.forEach((title) => {
        expect(title.toLowerCase()).toContain(firstTitle.trim().toLowerCase())
      })
    }
  })

  test('should display course card information', async ({ page }) => {
    await page.waitForSelector('[data-testid="course-card"]', { timeout: 10000 })

    const firstCard = page.locator('[data-testid="course-card"]').first()

    // Card should have key information
    await expect(firstCard.locator('[data-testid="course-title"]')).toBeVisible()
    await expect(firstCard.locator('[data-testid="course-status"]')).toBeVisible()
    await expect(firstCard.locator('[data-testid="enrolled-count"]')).toBeVisible()
    await expect(firstCard.locator('[data-testid="course-rating"]')).toBeVisible()
  })

  test('should navigate to course detail page', async ({ page }) => {
    await page.waitForSelector('[data-testid="course-card"]', { timeout: 10000 })

    await page.click('[data-testid="course-card"]:first-child >> [data-testid="btn-view-course"]')

    await expect(page).toHaveURL(/\/instructor\/courses\/[a-zA-Z0-9-]+/)
  })
})

test.describe('Create Course Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsInstructor(page)
    await page.goto('/instructor/courses/new')
  })

  test('should display course creation form', async ({ page }) => {
    await expect(page.locator('[data-testid="course-form"]')).toBeVisible()

    // Check required fields
    await expect(page.locator('[data-testid="input-title"]')).toBeVisible()
    await expect(page.locator('[data-testid="input-description"]')).toBeVisible()
    await expect(page.locator('[data-testid="select-pillar"]')).toBeVisible()
    await expect(page.locator('[data-testid="select-difficulty"]')).toBeVisible()
    await expect(page.locator('[data-testid="input-price"]')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    // Try to submit empty form
    await page.click('[data-testid="btn-create-course"]')

    // Should show validation errors
    await expect(page.locator('[data-testid="error-title"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-description"]')).toBeVisible()
  })

  test('should create course successfully', async ({ page }) => {
    const courseData = generateMockCourse()

    // Fill form
    await page.fill('[data-testid="input-title"]', courseData.title)
    await page.fill('[data-testid="input-description"]', courseData.description)
    await page.selectOption('[data-testid="select-pillar"]', courseData.pillar)
    await page.selectOption('[data-testid="select-difficulty"]', courseData.difficulty)
    await page.fill('[data-testid="input-price"]', courseData.price_amount.toString())
    await page.fill('[data-testid="input-duration"]', courseData.duration_hours.toString())

    // Add learning objectives
    for (const objective of courseData.what_you_will_learn.slice(0, 2)) {
      await page.fill('[data-testid="input-learning-objective"]', objective)
      await page.click('[data-testid="btn-add-objective"]')
    }

    // Submit form
    await page.click('[data-testid="btn-create-course"]')

    // Should redirect to course list or detail page
    await expect(page).toHaveURL(/\/instructor\/courses/)

    // Should show success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
  })

  test('should save course as draft', async ({ page }) => {
    const courseData = generateMockCourse({ status: 'draft' })

    await page.fill('[data-testid="input-title"]', courseData.title)
    await page.fill('[data-testid="input-description"]', courseData.description)

    // Click save as draft button
    await page.click('[data-testid="btn-save-draft"]')

    await expect(page).toHaveURL(/\/instructor\/courses/)
    await expect(page.locator('[data-testid="success-toast"]')).toContainText(/draft/i)
  })

  test('should handle image upload', async ({ page }) => {
    // Create a test file
    const buffer = Buffer.from('test image data')
    await page.setInputFiles('[data-testid="input-course-image"]', {
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer,
    })

    // Should show preview
    await expect(page.locator('[data-testid="image-preview"]')).toBeVisible()
  })
})

test.describe('Edit Course Flow', () => {
  test('should update course information', async ({ page }) => {
    await loginAsInstructor(page)
    await page.goto('/instructor/courses')

    await page.waitForSelector('[data-testid="course-card"]', { timeout: 10000 })

    // Click edit button on first course
    await page.click('[data-testid="course-card"]:first-child >> [data-testid="btn-edit-course"]')

    // Should navigate to edit page
    await expect(page).toHaveURL(/\/instructor\/courses\/[a-zA-Z0-9-]+\/edit/)

    // Update title
    const newTitle = `Updated Course ${Date.now()}`
    await page.fill('[data-testid="input-title"]', newTitle)

    // Save changes
    await page.click('[data-testid="btn-save-changes"]')

    // Should redirect back
    await expect(page).toHaveURL(/\/instructor\/courses/)

    // Should show success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
  })
})

test.describe('Publish/Unpublish Course', () => {
  test('should publish draft course', async ({ page }) => {
    await loginAsInstructor(page)
    await page.goto('/instructor/courses')

    await page.waitForSelector('[data-testid="course-card"]', { timeout: 10000 })

    // Find a draft course
    const draftCourse = page.locator('[data-testid="course-card"]').filter({
      has: page.locator('[data-testid="course-status"]:text("draft")'),
    })

    if ((await draftCourse.count()) > 0) {
      // Click publish button
      await draftCourse.first().locator('[data-testid="btn-publish"]').click()

      // Confirm publication
      await page.click('[data-testid="btn-confirm-publish"]')

      // Should show success message
      await expect(page.locator('[data-testid="success-toast"]')).toContainText(/published/i)

      // Status should update
      await expect(
        draftCourse.first().locator('[data-testid="course-status"]')
      ).toContainText(/published/i)
    }
  })

  test('should unpublish course', async ({ page }) => {
    await loginAsInstructor(page)
    await page.goto('/instructor/courses')

    await page.waitForSelector('[data-testid="course-card"]', { timeout: 10000 })

    // Find a published course
    const publishedCourse = page.locator('[data-testid="course-card"]').filter({
      has: page.locator('[data-testid="course-status"]:text("published")'),
    })

    if ((await publishedCourse.count()) > 0) {
      // Click unpublish button
      await publishedCourse.first().locator('[data-testid="btn-unpublish"]').click()

      // Confirm unpublication
      await page.click('[data-testid="btn-confirm-unpublish"]')

      // Should show success message
      await expect(page.locator('[data-testid="success-toast"]')).toContainText(/unpublished/i)
    }
  })
})

test.describe('Delete Course', () => {
  test('should delete course with confirmation', async ({ page }) => {
    await loginAsInstructor(page)
    await page.goto('/instructor/courses')

    await page.waitForSelector('[data-testid="course-card"]', { timeout: 10000 })

    const initialCount = await page.locator('[data-testid="course-card"]').count()

    // Click delete button on first course
    await page.click('[data-testid="course-card"]:first-child >> [data-testid="btn-delete-course"]')

    // Should show confirmation dialog
    await expect(page.locator('[data-testid="delete-confirmation-modal"]')).toBeVisible()
    await expect(page.locator('[data-testid="delete-confirmation-modal"]')).toContainText(
      /permanently delete/i
    )

    // Confirm deletion
    await page.click('[data-testid="btn-confirm-delete"]')

    // Should show success message
    await expect(page.locator('[data-testid="success-toast"]')).toContainText(/deleted/i)

    // Course count should decrease
    await page.waitForTimeout(500)
    const newCount = await page.locator('[data-testid="course-card"]').count()
    expect(newCount).toBe(initialCount - 1)
  })

  test('should cancel course deletion', async ({ page }) => {
    await loginAsInstructor(page)
    await page.goto('/instructor/courses')

    await page.waitForSelector('[data-testid="course-card"]', { timeout: 10000 })

    const initialCount = await page.locator('[data-testid="course-card"]').count()

    // Click delete button
    await page.click('[data-testid="course-card"]:first-child >> [data-testid="btn-delete-course"]')

    // Cancel deletion
    await page.click('[data-testid="btn-cancel-delete"]')

    // Modal should close
    await expect(page.locator('[data-testid="delete-confirmation-modal"]')).not.toBeVisible()

    // Course count should remain same
    const newCount = await page.locator('[data-testid="course-card"]').count()
    expect(newCount).toBe(initialCount)
  })
})
