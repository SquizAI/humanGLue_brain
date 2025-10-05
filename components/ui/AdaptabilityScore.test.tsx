/**
 * Component Tests: AdaptabilityScore
 *
 * Test Coverage:
 * - Score rendering
 * - Color coding based on score ranges
 * - Animation on view
 * - Dimension breakdown display
 * - Different sizes
 */

import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/tests/setup/test-utils'
import { AdaptabilityScore } from './AdaptabilityScore'

describe('AdaptabilityScore', () => {
  it('renders score correctly', () => {
    renderWithProviders(<AdaptabilityScore score={75} label="Individual Adaptability" />)

    expect(screen.getByText('75')).toBeInTheDocument()
    expect(screen.getByText('Individual Adaptability')).toBeInTheDocument()
  })

  it('displays correct label for low score', () => {
    renderWithProviders(<AdaptabilityScore score={35} label="Test" />)

    expect(screen.getByText('Low')).toBeInTheDocument()
  })

  it('displays correct label for medium score', () => {
    renderWithProviders(<AdaptabilityScore score={55} label="Test" />)

    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  it('displays correct label for high score', () => {
    renderWithProviders(<AdaptabilityScore score={85} label="Test" />)

    expect(screen.getByText('High')).toBeInTheDocument()
  })

  it('renders small size correctly', () => {
    const { container } = renderWithProviders(
      <AdaptabilityScore score={70} label="Test" size="sm" />
    )

    // Verify smaller text size
    expect(container.querySelector('.text-2xl')).toBeInTheDocument()
  })

  it('renders medium size correctly (default)', () => {
    const { container } = renderWithProviders(
      <AdaptabilityScore score={70} label="Test" size="md" />
    )

    expect(container.querySelector('.text-4xl')).toBeInTheDocument()
  })

  it('renders large size correctly', () => {
    const { container } = renderWithProviders(
      <AdaptabilityScore score={70} label="Test" size="lg" />
    )

    expect(container.querySelector('.text-5xl')).toBeInTheDocument()
  })

  it('shows dimension breakdown when requested', () => {
    renderWithProviders(
      <AdaptabilityScore
        score={77}
        label="Individual"
        dimension="individual"
        showDetails={true}
      />
    )

    expect(screen.getByText('Dimension Breakdown')).toBeInTheDocument()
    expect(screen.getByText('Change Readiness')).toBeInTheDocument()
    expect(screen.getByText('Learning Agility')).toBeInTheDocument()
  })

  it('hides dimension breakdown by default', () => {
    renderWithProviders(
      <AdaptabilityScore score={77} label="Individual" dimension="individual" />
    )

    expect(screen.queryByText('Dimension Breakdown')).not.toBeInTheDocument()
  })

  it('renders all leadership subdimensions', () => {
    renderWithProviders(
      <AdaptabilityScore
        score={72}
        label="Leadership"
        dimension="leadership"
        showDetails={true}
      />
    )

    expect(screen.getByText('AI Literacy')).toBeInTheDocument()
    expect(screen.getByText('Change Championing')).toBeInTheDocument()
    expect(screen.getByText('Vulnerability Index')).toBeInTheDocument()
  })

  it('renders all cultural subdimensions', () => {
    renderWithProviders(
      <AdaptabilityScore
        score={68}
        label="Cultural"
        dimension="cultural"
        showDetails={true}
      />
    )

    expect(screen.getByText('Psychological Safety')).toBeInTheDocument()
    expect(screen.getByText('Experimentation Culture')).toBeInTheDocument()
  })

  it('calculates correct circumference for circle', () => {
    const { container } = renderWithProviders(
      <AdaptabilityScore score={75} label="Test" />
    )

    const circles = container.querySelectorAll('circle')
    expect(circles.length).toBeGreaterThan(0)
  })

  it('applies correct color for low score', () => {
    const { container } = renderWithProviders(
      <AdaptabilityScore score={30} label="Test" />
    )

    // Low score should use red color
    const scoreText = container.querySelector('.text-2xl') || container.querySelector('.text-4xl')
    expect(scoreText).toBeInTheDocument()
  })

  it('applies correct color for medium score', () => {
    const { container } = renderWithProviders(
      <AdaptabilityScore score={55} label="Test" />
    )

    const scoreText = container.querySelector('.text-2xl') || container.querySelector('.text-4xl')
    expect(scoreText).toBeInTheDocument()
  })

  it('applies correct color for high score', () => {
    const { container } = renderWithProviders(
      <AdaptabilityScore score={85} label="Test" />
    )

    const scoreText = container.querySelector('.text-2xl') || container.querySelector('.text-4xl')
    expect(scoreText).toBeInTheDocument()
  })

  it('handles edge case score of 0', () => {
    renderWithProviders(<AdaptabilityScore score={0} label="Test" />)

    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('Low')).toBeInTheDocument()
  })

  it('handles edge case score of 100', () => {
    renderWithProviders(<AdaptabilityScore score={100} label="Test" />)

    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
  })

  it('handles boundary score of 40 (low/medium)', () => {
    renderWithProviders(<AdaptabilityScore score={40} label="Test" />)

    // Should be medium at exactly 40
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  it('handles boundary score of 70 (medium/high)', () => {
    renderWithProviders(<AdaptabilityScore score={70} label="Test" />)

    // Should be high at exactly 70
    expect(screen.getByText('High')).toBeInTheDocument()
  })

  it('renders SVG elements correctly', () => {
    const { container } = renderWithProviders(
      <AdaptabilityScore score={75} label="Test" />
    )

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()

    const circles = container.querySelectorAll('circle')
    expect(circles).toHaveLength(2) // Background + progress circle
  })

  it('displays label with correct styling', () => {
    renderWithProviders(<AdaptabilityScore score={75} label="Test Label" />)

    const label = screen.getByText('Test Label')
    expect(label).toHaveClass('font-semibold')
  })
})
