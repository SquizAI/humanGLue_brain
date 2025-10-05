/**
 * E2E Tests: Instructor Authentication & Authorization
 * Tests login, logout, role-based access control, and session management
 */

import { test, expect } from '../utils/fixtures'
import { loginAsInstructor, logout, isAuthenticated, assertUserRole } from '../utils/auth-helpers'

test.describe('Instructor Authentication', () => {
  test('should allow instructor to login with valid credentials', async ({ page }) => {
    await page.goto('/login')

    // Fill login form
    await page.fill('[data-testid="input-email"]', 'instructor@test.humanglue.ai')
    await page.fill('[data-testid="input-password"]', 'TestPassword123!')

    // Submit
    await page.click('[data-testid="btn-login"]')

    // Should redirect to instructor dashboard
    await expect(page).toHaveURL(/\/instructor/, { timeout: 10000 })

    // Verify authenticated state
    const authenticated = await isAuthenticated(page)
    expect(authenticated).toBe(true)
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[data-testid="input-email"]', 'instructor@test.humanglue.ai')
    await page.fill('[data-testid="input-password"]', 'WrongPassword123!')

    await page.click('[data-testid="btn-login"]')

    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText(/invalid/i)
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/login')

    // Try to submit without filling form
    await page.click('[data-testid="btn-login"]')

    // Should show validation errors
    await expect(page.locator('[data-testid="error-email"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-password"]')).toBeVisible()
  })

  test('should logout successfully', async ({ page }) => {
    await loginAsInstructor(page)

    // Open user menu
    await page.click('[data-testid="user-menu-trigger"]')

    // Click logout
    await page.click('[data-testid="btn-logout"]')

    // Should redirect to login or home
    await expect(page).toHaveURL(/\/(login|$)/, { timeout: 5000 })

    // Verify not authenticated
    const authenticated = await isAuthenticated(page)
    expect(authenticated).toBe(false)
  })

  test('should persist session on page reload', async ({ page }) => {
    await loginAsInstructor(page)

    // Reload page
    await page.reload()

    // Should still be on instructor dashboard
    await expect(page).toHaveURL(/\/instructor/)

    // Verify still authenticated
    const authenticated = await isAuthenticated(page)
    expect(authenticated).toBe(true)
  })
})

test.describe('Instructor Authorization', () => {
  test('should redirect non-instructor users from instructor portal', async ({ page }) => {
    // Try to access instructor portal without authentication
    await page.goto('/instructor')

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })

  test('should allow instructor to access all instructor pages', async ({ page }) => {
    await loginAsInstructor(page)

    const instructorPages = [
      '/instructor',
      '/instructor/courses',
      '/instructor/workshops',
      '/instructor/students',
      '/instructor/analytics',
      '/instructor/profile',
      '/instructor/settings',
    ]

    for (const pagePath of instructorPages) {
      await page.goto(pagePath)

      // Should not redirect to login
      await expect(page).not.toHaveURL(/\/login/)

      // Should display page content
      await expect(page.locator('main, [data-testid="page-content"]')).toBeVisible()
    }
  })

  test('should show correct user info in dashboard', async ({ page }) => {
    await loginAsInstructor(page)

    // Check user name is displayed
    await expect(page.locator('[data-testid="user-name"]')).toContainText('Test Instructor')

    // Check instructor role badge if present
    const roleBadge = page.locator('[data-testid="user-role-badge"]')
    if (await roleBadge.isVisible()) {
      await expect(roleBadge).toContainText(/instructor/i)
    }
  })

  test('should verify instructor role permissions', async ({ page }) => {
    await loginAsInstructor(page)

    // Navigate to students page
    await page.goto('/instructor/students')

    // Should be able to see student management features
    await expect(page.locator('[data-testid="student-card"]')).toBeVisible()

    // Should have bulk actions available
    await expect(page.locator('[data-testid="bulk-email-btn"]')).toBeVisible()
    await expect(page.locator('[data-testid="export-btn"]')).toBeVisible()
  })
})

test.describe('Session Management', () => {
  test('should handle concurrent sessions correctly', async ({ context }) => {
    // Create two pages with same session
    const page1 = await context.newPage()
    const page2 = await context.newPage()

    await loginAsInstructor(page1)

    // Second page should also be authenticated
    await page2.goto('/instructor')
    await expect(page2).toHaveURL(/\/instructor/)

    // Logout from first page
    await page1.click('[data-testid="user-menu-trigger"]')
    await page1.click('[data-testid="btn-logout"]')

    // Second page should also be logged out after reload
    await page2.reload()
    await expect(page2).toHaveURL(/\/login/, { timeout: 5000 })

    await page1.close()
    await page2.close()
  })

  test('should handle expired session gracefully', async ({ page }) => {
    await loginAsInstructor(page)

    // Manually expire session by clearing auth tokens
    await page.evaluate(() => {
      document.cookie.split(';').forEach((c) => {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)
      })
      localStorage.removeItem('humanglue_user')
    })

    // Try to access protected page
    await page.goto('/instructor/students')

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })
})

test.describe('Password Reset', () => {
  test('should show password reset link on login page', async ({ page }) => {
    await page.goto('/login')

    const resetLink = page.locator('[data-testid="forgot-password-link"]')
    await expect(resetLink).toBeVisible()
    await expect(resetLink).toContainText(/forgot.*password/i)
  })

  test('should navigate to password reset page', async ({ page }) => {
    await page.goto('/login')

    await page.click('[data-testid="forgot-password-link"]')

    await expect(page).toHaveURL(/\/reset-password/)
    await expect(page.locator('h1')).toContainText(/reset.*password/i)
  })

  test('should validate email on password reset', async ({ page }) => {
    await page.goto('/reset-password')

    // Try to submit without email
    await page.click('[data-testid="btn-reset-password"]')

    await expect(page.locator('[data-testid="error-email"]')).toBeVisible()

    // Enter invalid email
    await page.fill('[data-testid="input-email"]', 'invalid-email')
    await page.click('[data-testid="btn-reset-password"]')

    await expect(page.locator('[data-testid="error-email"]')).toContainText(/valid email/i)
  })
})

test.describe('Accessibility', () => {
  test('login form should be keyboard navigable', async ({ page }) => {
    await page.goto('/login')

    // Tab through form fields
    await page.keyboard.press('Tab')
    const emailFocused = await page.evaluate(
      () => document.activeElement?.getAttribute('data-testid') === 'input-email'
    )
    expect(emailFocused).toBe(true)

    await page.keyboard.press('Tab')
    const passwordFocused = await page.evaluate(
      () => document.activeElement?.getAttribute('data-testid') === 'input-password'
    )
    expect(passwordFocused).toBe(true)

    await page.keyboard.press('Tab')
    const loginFocused = await page.evaluate(
      () => document.activeElement?.getAttribute('data-testid') === 'btn-login'
    )
    expect(loginFocused).toBe(true)
  })

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/login')

    // Check form has label
    await expect(page.locator('form')).toHaveAttribute('aria-label', /login/i)

    // Check inputs have labels
    const emailInput = page.locator('[data-testid="input-email"]')
    const emailLabel = await emailInput.getAttribute('aria-label')
    expect(emailLabel).toBeTruthy()

    const passwordInput = page.locator('[data-testid="input-password"]')
    const passwordLabel = await passwordInput.getAttribute('aria-label')
    expect(passwordLabel).toBeTruthy()
  })
})
