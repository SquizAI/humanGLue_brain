/**
 * Page Object Model for Workshop Detail Page
 * Encapsulates workshop detail view and registration flow
 */

import { Page, Locator, expect } from '@playwright/test'

export class WorkshopDetailPage {
  readonly page: Page

  // Workshop Details
  readonly workshopTitle: Locator
  readonly workshopDescription: Locator
  readonly instructorName: Locator
  readonly scheduleDate: Locator
  readonly scheduleTime: Locator
  readonly duration: Locator
  readonly price: Locator
  readonly earlyBirdPrice: Locator
  readonly capacity: Locator

  // Badges & Tags
  readonly pillarBadge: Locator
  readonly levelBadge: Locator
  readonly formatBadge: Locator
  readonly soldOutBadge: Locator
  readonly tags: Locator

  // Learning Outcomes
  readonly outcomes: Locator

  // Actions
  readonly registerButton: Locator
  readonly backButton: Locator
  readonly shareButton: Locator

  constructor(page: Page) {
    this.page = page

    // Workshop Details
    this.workshopTitle = page.locator('h1')
    this.workshopDescription = page.locator('[data-testid="workshop-description"]')
    this.instructorName = page.locator('[data-testid="instructor-name"]')
    this.scheduleDate = page.locator('[data-testid="schedule-date"]')
    this.scheduleTime = page.locator('[data-testid="schedule-time"]')
    this.duration = page.locator('[data-testid="duration"]')
    this.price = page.locator('[data-testid="price"]')
    this.earlyBirdPrice = page.locator('[data-testid="early-bird-price"]')
    this.capacity = page.locator('[data-testid="capacity"]')

    // Badges & Tags
    this.pillarBadge = page.locator('[data-testid="pillar-badge"]')
    this.levelBadge = page.locator('[data-testid="level-badge"]')
    this.formatBadge = page.locator('[data-testid="format-badge"]')
    this.soldOutBadge = page.locator('[data-testid="sold-out-badge"]')
    this.tags = page.locator('[data-testid="tag"]')

    // Learning Outcomes
    this.outcomes = page.locator('[data-testid="outcome"]')

    // Actions
    this.registerButton = page.getByRole('button', { name: /register|enroll/i })
    this.backButton = page.getByRole('button', { name: /back/i })
    this.shareButton = page.getByRole('button', { name: /share/i })
  }

  /**
   * Navigate to workshop detail page
   */
  async goto(workshopId: string) {
    await this.page.goto(`/workshops/${workshopId}`)
    await expect(this.workshopTitle).toBeVisible()
  }

  /**
   * Verify workshop details
   */
  async verifyWorkshopDetails(expectedTitle: string) {
    await expect(this.workshopTitle).toContainText(expectedTitle)
    await expect(this.workshopDescription).toBeVisible()
    await expect(this.instructorName).toBeVisible()
  }

  /**
   * Verify workshop is sold out
   */
  async verifySoldOut() {
    await expect(this.soldOutBadge).toBeVisible()
    await expect(this.registerButton).toBeDisabled()
  }

  /**
   * Verify workshop is available
   */
  async verifyAvailable() {
    await expect(this.soldOutBadge).not.toBeVisible()
    await expect(this.registerButton).toBeEnabled()
  }

  /**
   * Click register button
   */
  async clickRegister() {
    await this.registerButton.click()
  }

  /**
   * Get number of outcomes
   */
  async getOutcomesCount(): Promise<number> {
    return await this.outcomes.count()
  }

  /**
   * Get number of tags
   */
  async getTagsCount(): Promise<number> {
    return await this.tags.count()
  }

  /**
   * Verify pricing display
   */
  async verifyPricing(regularPrice: string, earlyBirdPrice?: string) {
    await expect(this.price).toContainText(regularPrice)
    if (earlyBirdPrice) {
      await expect(this.earlyBirdPrice).toContainText(earlyBirdPrice)
    }
  }

  /**
   * Go back to workshops
   */
  async goBack() {
    await this.backButton.click()
  }

  /**
   * Share workshop
   */
  async share() {
    await this.shareButton.click()
  }
}
