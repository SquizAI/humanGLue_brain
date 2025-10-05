/**
 * Page Object Model for Adaptability Assessment
 * Encapsulates assessment flow interactions
 */

import { Page, Locator, expect } from '@playwright/test'

export class AssessmentPage {
  readonly page: Page

  // Navigation
  readonly startButton: Locator
  readonly nextButton: Locator
  readonly previousButton: Locator
  readonly submitButton: Locator

  // Progress
  readonly progressBar: Locator
  readonly stepIndicator: Locator
  readonly dimensionTitle: Locator

  // Questions
  readonly questionText: Locator
  readonly sliders: Locator
  readonly radioButtons: Locator

  // Results
  readonly overallScore: Locator
  readonly dimensionScores: Locator
  readonly downloadButton: Locator
  readonly shareButton: Locator
  readonly retakeButton: Locator

  // Fear to Confidence Slider
  readonly fearToConfidenceSlider: Locator
  readonly sliderValue: Locator
  readonly sliderRecommendations: Locator

  constructor(page: Page) {
    this.page = page

    // Navigation
    this.startButton = page.getByRole('button', { name: /start|begin/i })
    this.nextButton = page.getByRole('button', { name: /next|continue/i })
    this.previousButton = page.getByRole('button', { name: /back|previous/i })
    this.submitButton = page.getByRole('button', { name: /submit|finish|complete/i })

    // Progress
    this.progressBar = page.locator('[data-testid="progress-bar"]')
    this.stepIndicator = page.locator('[data-testid="step-indicator"]')
    this.dimensionTitle = page.locator('h2')

    // Questions
    this.questionText = page.locator('[data-testid="question-text"]')
    this.sliders = page.locator('input[type="range"]')
    this.radioButtons = page.locator('input[type="radio"]')

    // Results
    this.overallScore = page.locator('[data-testid="overall-score"]')
    this.dimensionScores = page.locator('[data-testid="dimension-score"]')
    this.downloadButton = page.getByRole('button', { name: /download/i })
    this.shareButton = page.getByRole('button', { name: /share/i })
    this.retakeButton = page.getByRole('button', { name: /retake|start again/i })

    // Fear to Confidence Slider
    this.fearToConfidenceSlider = page.locator('[data-testid="fear-confidence-slider"]')
    this.sliderValue = page.locator('[data-testid="slider-value"]')
    this.sliderRecommendations = page.locator('[data-testid="recommendations"]')
  }

  /**
   * Navigate to assessment page
   */
  async goto() {
    await this.page.goto('/assessment')
    await expect(this.page.locator('h1')).toBeVisible()
  }

  /**
   * Start assessment
   */
  async startAssessment() {
    await this.startButton.click()
    await expect(this.dimensionTitle).toBeVisible()
  }

  /**
   * Answer a slider question
   */
  async answerSlider(index: number, value: number) {
    const slider = this.sliders.nth(index)
    await slider.fill(value.toString())
  }

  /**
   * Answer a radio question
   */
  async answerRadio(index: number) {
    await this.radioButtons.nth(index).click()
  }

  /**
   * Go to next step
   */
  async nextStep() {
    await this.nextButton.click()
    await this.page.waitForTimeout(500)
  }

  /**
   * Go to previous step
   */
  async previousStep() {
    await this.previousButton.click()
    await this.page.waitForTimeout(500)
  }

  /**
   * Submit assessment
   */
  async submitAssessment() {
    await this.submitButton.click()
    await expect(this.overallScore).toBeVisible({ timeout: 10000 })
  }

  /**
   * Verify current dimension
   */
  async verifyDimension(expectedDimension: string) {
    await expect(this.dimensionTitle).toContainText(expectedDimension, { ignoreCase: true })
  }

  /**
   * Verify progress
   */
  async verifyProgress(expectedProgress: string) {
    await expect(this.stepIndicator).toContainText(expectedProgress)
  }

  /**
   * Complete Individual Adaptability dimension
   */
  async completeIndividualDimension(scores: {
    changeReadiness: number
    learningAgility: number
    aiConfidence: number
    fearLevel: number
    growthMindset: number
  }) {
    await this.verifyDimension('Individual')

    await this.answerSlider(0, scores.changeReadiness)
    await this.answerSlider(1, scores.learningAgility)
    await this.answerSlider(2, scores.aiConfidence)
    await this.answerSlider(3, scores.fearLevel)
    await this.answerSlider(4, scores.growthMindset)

    await this.nextStep()
  }

  /**
   * Complete Leadership Adaptability dimension
   */
  async completeLeadershipDimension(scores: {
    aiLiteracy: number
    changeChampioning: number
    vulnerability: number
    visionClarity: number
    coachingCapability: number
  }) {
    await this.verifyDimension('Leadership')

    await this.answerSlider(0, scores.aiLiteracy)
    await this.answerSlider(1, scores.changeChampioning)
    await this.answerSlider(2, scores.vulnerability)
    await this.answerSlider(3, scores.visionClarity)
    await this.answerSlider(4, scores.coachingCapability)

    await this.nextStep()
  }

  /**
   * Complete full assessment with default values
   */
  async completeFullAssessment() {
    await this.startAssessment()

    // Individual (Step 1)
    await this.completeIndividualDimension({
      changeReadiness: 75,
      learningAgility: 70,
      aiConfidence: 65,
      fearLevel: 35,
      growthMindset: 80,
    })

    // Leadership (Step 2)
    await this.completeLeadershipDimension({
      aiLiteracy: 70,
      changeChampioning: 75,
      vulnerability: 65,
      visionClarity: 60,
      coachingCapability: 70,
    })

    // Cultural (Step 3) - simplified
    await this.verifyDimension('Cultural')
    for (let i = 0; i < 5; i++) {
      await this.answerSlider(i, 70)
    }
    await this.nextStep()

    // Embedding (Step 4) - simplified
    await this.verifyDimension('Embedding')
    for (let i = 0; i < 5; i++) {
      await this.answerSlider(i, 65)
    }
    await this.nextStep()

    // Velocity (Step 5) - simplified
    await this.verifyDimension('Velocity')
    for (let i = 0; i < 5; i++) {
      await this.answerSlider(i, 70)
    }

    await this.submitAssessment()
  }

  /**
   * Verify results displayed
   */
  async verifyResults() {
    await expect(this.overallScore).toBeVisible()
    const dimensionCount = await this.dimensionScores.count()
    expect(dimensionCount).toBe(5)
  }

  /**
   * Get overall score value
   */
  async getOverallScore(): Promise<number> {
    const text = await this.overallScore.textContent()
    return parseInt(text?.replace(/\D/g, '') || '0')
  }

  /**
   * Download results
   */
  async downloadResults() {
    const downloadPromise = this.page.waitForEvent('download')
    await this.downloadButton.click()
    return await downloadPromise
  }

  /**
   * Retake assessment
   */
  async retake() {
    await this.retakeButton.click()
    await expect(this.startButton).toBeVisible()
  }

  /**
   * Verify progress is saved
   */
  async verifyProgressSaved(expectedDimension: string) {
    await this.page.reload()
    await this.verifyDimension(expectedDimension)
  }
}
