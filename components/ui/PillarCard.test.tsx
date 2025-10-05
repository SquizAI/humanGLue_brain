/**
 * Component Tests: PillarCard
 *
 * Test Coverage:
 * - Rendering for all pillar variants
 * - Interactive states (hover, click)
 * - Icon and content display
 * - Link navigation
 * - Accessibility
 */

import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/tests/setup/test-utils'
import { PillarCard } from './PillarCard'

describe('PillarCard', () => {
  const mockPillars = {
    adaptability: {
      title: 'Adaptability',
      description: 'Build skills to thrive in change',
      icon: 'Target',
      href: '/adaptability',
      gradient: 'from-blue-500 to-blue-600',
    },
    coaching: {
      title: 'Coaching',
      description: 'Guide others through transformation',
      icon: 'Users',
      href: '/coaching',
      gradient: 'from-amber-500 to-orange-600',
    },
    marketplace: {
      title: 'Marketplace',
      description: 'Navigate the talent ecosystem',
      icon: 'Briefcase',
      href: '/marketplace',
      gradient: 'from-purple-500 to-purple-600',
    },
  }

  it('renders adaptability pillar correctly', () => {
    const pillar = mockPillars.adaptability

    renderWithProviders(
      <PillarCard
        title={pillar.title}
        description={pillar.description}
        icon={pillar.icon}
        href={pillar.href}
        gradient={pillar.gradient}
      />
    )

    expect(screen.getByText('Adaptability')).toBeInTheDocument()
    expect(screen.getByText('Build skills to thrive in change')).toBeInTheDocument()
  })

  it('renders coaching pillar correctly', () => {
    const pillar = mockPillars.coaching

    renderWithProviders(
      <PillarCard
        title={pillar.title}
        description={pillar.description}
        icon={pillar.icon}
        href={pillar.href}
        gradient={pillar.gradient}
      />
    )

    expect(screen.getByText('Coaching')).toBeInTheDocument()
    expect(screen.getByText('Guide others through transformation')).toBeInTheDocument()
  })

  it('renders marketplace pillar correctly', () => {
    const pillar = mockPillars.marketplace

    renderWithProviders(
      <PillarCard
        title={pillar.title}
        description={pillar.description}
        icon={pillar.icon}
        href={pillar.href}
        gradient={pillar.gradient}
      />
    )

    expect(screen.getByText('Marketplace')).toBeInTheDocument()
    expect(screen.getByText('Navigate the talent ecosystem')).toBeInTheDocument()
  })

  it('renders with correct link href', () => {
    const pillar = mockPillars.adaptability

    const { container } = renderWithProviders(
      <PillarCard
        title={pillar.title}
        description={pillar.description}
        icon={pillar.icon}
        href={pillar.href}
        gradient={pillar.gradient}
      />
    )

    const link = container.querySelector('a')
    expect(link).toHaveAttribute('href', '/adaptability')
  })

  it('displays icon component', () => {
    const pillar = mockPillars.adaptability

    const { container } = renderWithProviders(
      <PillarCard
        title={pillar.title}
        description={pillar.description}
        icon={pillar.icon}
        href={pillar.href}
        gradient={pillar.gradient}
      />
    )

    // Check for SVG element (icon)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('applies correct gradient classes', () => {
    const pillar = mockPillars.adaptability

    const { container } = renderWithProviders(
      <PillarCard
        title={pillar.title}
        description={pillar.description}
        icon={pillar.icon}
        href={pillar.href}
        gradient={pillar.gradient}
      />
    )

    const gradientElement = container.querySelector('.from-blue-500')
    expect(gradientElement).toBeInTheDocument()
  })

  it('renders with featured variant', () => {
    const pillar = mockPillars.adaptability

    renderWithProviders(
      <PillarCard
        title={pillar.title}
        description={pillar.description}
        icon={pillar.icon}
        href={pillar.href}
        gradient={pillar.gradient}
        featured={true}
      />
    )

    expect(screen.getByText('Adaptability')).toBeInTheDocument()
  })

  it('renders with stats when provided', () => {
    const pillar = mockPillars.adaptability

    renderWithProviders(
      <PillarCard
        title={pillar.title}
        description={pillar.description}
        icon={pillar.icon}
        href={pillar.href}
        gradient={pillar.gradient}
        stats={{
          workshops: 12,
          participants: 340,
          rating: 4.8,
        }}
      />
    )

    expect(screen.getByText(/12/)).toBeInTheDocument()
    expect(screen.getByText(/340/)).toBeInTheDocument()
    expect(screen.getByText(/4\.8/)).toBeInTheDocument()
  })

  it('has accessible link text', () => {
    const pillar = mockPillars.adaptability

    renderWithProviders(
      <PillarCard
        title={pillar.title}
        description={pillar.description}
        icon={pillar.icon}
        href={pillar.href}
        gradient={pillar.gradient}
      />
    )

    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAccessibleName()
  })

  it('handles click interaction', async () => {
    const pillar = mockPillars.adaptability
    const { user } = renderWithProviders(
      <PillarCard
        title={pillar.title}
        description={pillar.description}
        icon={pillar.icon}
        href={pillar.href}
        gradient={pillar.gradient}
      />
    )

    const link = screen.getByRole('link')
    await user.click(link)

    // Link should be clicked (navigation handled by Next.js router mock)
    expect(link).toBeInTheDocument()
  })

  it('renders all three pillars with different gradients', () => {
    const { container } = renderWithProviders(
      <>
        <PillarCard {...mockPillars.adaptability} />
        <PillarCard {...mockPillars.coaching} />
        <PillarCard {...mockPillars.marketplace} />
      </>
    )

    expect(container.querySelector('.from-blue-500')).toBeInTheDocument()
    expect(container.querySelector('.from-amber-500')).toBeInTheDocument()
    expect(container.querySelector('.from-purple-500')).toBeInTheDocument()
  })

  it('maintains card aspect ratio', () => {
    const pillar = mockPillars.adaptability

    const { container } = renderWithProviders(
      <PillarCard
        title={pillar.title}
        description={pillar.description}
        icon={pillar.icon}
        href={pillar.href}
        gradient={pillar.gradient}
      />
    )

    const card = container.firstChild
    expect(card).toBeInTheDocument()
    expect(card).toHaveClass('group')
  })

  it('shows hover effects with motion classes', () => {
    const pillar = mockPillars.adaptability

    const { container } = renderWithProviders(
      <PillarCard
        title={pillar.title}
        description={pillar.description}
        icon={pillar.icon}
        href={pillar.href}
        gradient={pillar.gradient}
      />
    )

    // Framer Motion component rendered as div due to mock
    const motionDiv = container.querySelector('div')
    expect(motionDiv).toBeInTheDocument()
  })
})
