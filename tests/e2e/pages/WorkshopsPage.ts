/**
 * Page Object Model for Workshops Catalog
 * Encapsulates all workshop listing and filtering interactions
 */

import { Page, Locator, expect } from '@playwright/test'

export class WorkshopsPage {
  readonly page: Page

  // Search & Filters
  readonly searchInput: Locator
  readonly filterToggle: Locator
  readonly clearFiltersButton: Locator

  // Pillar Filters
  readonly filterPillarAll: Locator
  readonly filterPillarAdaptability: Locator
  readonly filterPillarCoaching: Locator
  readonly filterPillarMarketplace: Locator

  // Level Filters
  readonly filterLevelAll: Locator
  readonly filterLevelBeginner: Locator
  readonly filterLevelIntermediate: Locator
  readonly filterLevelAdvanced: Locator

  // View Mode
  readonly viewGridButton: Locator
  readonly viewListButton: Locator

  // Workshop Grid
  readonly workshopsGrid: Locator
  readonly workshopCards: Locator

  // Hero Section
  readonly heroTitle: Locator
  readonly heroDescription: Locator

  constructor(page: Page) {
    this.page = page

    // Search & Filters
    this.searchInput = page.getByTestId('workshop-search')
    this.filterToggle = page.getByTestId('filter-toggle')
    this.clearFiltersButton = page.getByTestId('clear-filters')

    // Pillar Filters
    this.filterPillarAll = page.getByTestId('filter-pillar-all')
    this.filterPillarAdaptability = page.getByTestId('filter-pillar-adaptability')
    this.filterPillarCoaching = page.getByTestId('filter-pillar-coaching')
    this.filterPillarMarketplace = page.getByTestId('filter-pillar-marketplace')

    // Level Filters
    this.filterLevelAll = page.getByTestId('filter-level-all')
    this.filterLevelBeginner = page.getByTestId('filter-level-beginner')
    this.filterLevelIntermediate = page.getByTestId('filter-level-intermediate')
    this.filterLevelAdvanced = page.getByTestId('filter-level-advanced')

    // View Mode
    this.viewGridButton = page.getByTestId('view-grid')
    this.viewListButton = page.getByTestId('view-list')

    // Workshop Grid
    this.workshopsGrid = page.getByTestId('workshops-grid')
    this.workshopCards = page.locator('[data-testid="workshop-card"]')

    // Hero Section
    this.heroTitle = page.locator('h1')
    this.heroDescription = page.locator('p').first()
  }

  /**
   * Navigate to workshops page
   */
  async goto() {
    await this.page.goto('/workshops')
    await expect(this.heroTitle).toBeVisible()
  }

  /**
   * Search for workshops
   */
  async search(query: string) {
    await this.searchInput.fill(query)
    await this.page.waitForTimeout(500) // Debounce
  }

  /**
   * Clear search
   */
  async clearSearch() {
    await this.searchInput.fill('')
  }

  /**
   * Filter by pillar
   */
  async filterByPillar(pillar: 'all' | 'adaptability' | 'coaching' | 'marketplace') {
    const filterMap = {
      all: this.filterPillarAll,
      adaptability: this.filterPillarAdaptability,
      coaching: this.filterPillarCoaching,
      marketplace: this.filterPillarMarketplace,
    }
    await filterMap[pillar].click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Filter by level
   */
  async filterByLevel(level: 'all' | 'beginner' | 'intermediate' | 'advanced') {
    const filterMap = {
      all: this.filterLevelAll,
      beginner: this.filterLevelBeginner,
      intermediate: this.filterLevelIntermediate,
      advanced: this.filterLevelAdvanced,
    }
    await filterMap[level].click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Clear all filters
   */
  async clearFilters() {
    await this.clearFiltersButton.click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Switch view mode
   */
  async switchViewMode(mode: 'grid' | 'list') {
    if (mode === 'grid') {
      await this.viewGridButton.click()
    } else {
      await this.viewListButton.click()
    }
  }

  /**
   * Get workshop count
   */
  async getWorkshopCount(): Promise<number> {
    return await this.workshopCards.count()
  }

  /**
   * Click on workshop by index
   */
  async clickWorkshop(index: number) {
    await this.workshopCards.nth(index).click()
  }

  /**
   * Click on workshop by title
   */
  async clickWorkshopByTitle(title: string) {
    await this.page.getByText(title).first().click()
  }

  /**
   * Verify workshop is displayed
   */
  async verifyWorkshopDisplayed(title: string) {
    await expect(this.page.getByText(title)).toBeVisible()
  }

  /**
   * Verify no results message
   */
  async verifyNoResults() {
    await expect(this.page.getByText('No workshops found')).toBeVisible()
  }

  /**
   * Get displayed workshop titles
   */
  async getWorkshopTitles(): Promise<string[]> {
    const titles: string[] = []
    const count = await this.getWorkshopCount()

    for (let i = 0; i < count; i++) {
      const title = await this.workshopCards.nth(i).locator('h3').textContent()
      if (title) titles.push(title)
    }

    return titles
  }

  /**
   * Verify filters are active
   */
  async verifyFiltersActive() {
    await expect(this.clearFiltersButton).toBeVisible()
  }

  /**
   * Mobile: Open filter panel
   */
  async openMobileFilters() {
    await this.filterToggle.click()
  }
}
