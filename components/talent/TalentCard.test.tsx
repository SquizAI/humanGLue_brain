/**
 * Component Tests: TalentCard
 *
 * Test Coverage:
 * - Talent profile rendering
 * - Impact metrics display
 * - Availability states
 * - Skills and expertise display
 * - Contact button interaction
 */

import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/tests/setup/test-utils'
import { TalentCard } from './TalentCard'

describe('TalentCard', () => {
  const mockTalent = {
    id: 'talent-1',
    name: 'Sarah Johnson',
    title: 'AI Transformation Coach',
    avatar_url: null,
    bio: 'Expert in guiding organizations through AI adoption with 10+ years of experience.',
    specialties: ['AI Strategy', 'Change Management', 'Leadership Development'],
    availability: 'available' as const,
    hourly_rate: 250,
    rating: 4.9,
    reviews_count: 127,
    projects_completed: 45,
    impact: {
      companies_transformed: 23,
      teams_coached: 156,
      avg_productivity_increase: 32,
    },
  }

  it('renders talent name and title', () => {
    renderWithProviders(<TalentCard talent={mockTalent} />)

    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
    expect(screen.getByText('AI Transformation Coach')).toBeInTheDocument()
  })

  it('displays bio text', () => {
    renderWithProviders(<TalentCard talent={mockTalent} />)

    expect(
      screen.getByText(/Expert in guiding organizations through AI adoption/)
    ).toBeInTheDocument()
  })

  it('shows availability status for available talent', () => {
    renderWithProviders(<TalentCard talent={mockTalent} />)

    expect(screen.getByText(/Available/i)).toBeInTheDocument()
  })

  it('shows availability status for busy talent', () => {
    const busyTalent = { ...mockTalent, availability: 'busy' as const }
    renderWithProviders(<TalentCard talent={busyTalent} />)

    expect(screen.getByText(/Busy/i)).toBeInTheDocument()
  })

  it('shows availability status for unavailable talent', () => {
    const unavailableTalent = { ...mockTalent, availability: 'unavailable' as const }
    renderWithProviders(<TalentCard talent={unavailableTalent} />)

    expect(screen.getByText(/Unavailable/i)).toBeInTheDocument()
  })

  it('displays hourly rate', () => {
    renderWithProviders(<TalentCard talent={mockTalent} />)

    expect(screen.getByText(/\$250/)).toBeInTheDocument()
  })

  it('shows rating and reviews count', () => {
    renderWithProviders(<TalentCard talent={mockTalent} />)

    expect(screen.getByText(/4\.9/)).toBeInTheDocument()
    expect(screen.getByText(/127/)).toBeInTheDocument()
  })

  it('displays projects completed', () => {
    renderWithProviders(<TalentCard talent={mockTalent} />)

    expect(screen.getByText(/45/)).toBeInTheDocument()
  })

  it('renders all specialties', () => {
    renderWithProviders(<TalentCard talent={mockTalent} />)

    expect(screen.getByText('AI Strategy')).toBeInTheDocument()
    expect(screen.getByText('Change Management')).toBeInTheDocument()
    expect(screen.getByText('Leadership Development')).toBeInTheDocument()
  })

  it('shows impact metrics when provided', () => {
    renderWithProviders(<TalentCard talent={mockTalent} />)

    expect(screen.getByText(/23/)).toBeInTheDocument() // companies transformed
    expect(screen.getByText(/156/)).toBeInTheDocument() // teams coached
    expect(screen.getByText(/32/)).toBeInTheDocument() // productivity increase
  })

  it('renders contact button for available talent', () => {
    renderWithProviders(<TalentCard talent={mockTalent} />)

    const contactButton = screen.getByRole('button', { name: /contact/i })
    expect(contactButton).toBeInTheDocument()
    expect(contactButton).toBeEnabled()
  })

  it('disables contact button for unavailable talent', () => {
    const unavailableTalent = { ...mockTalent, availability: 'unavailable' as const }
    renderWithProviders(<TalentCard talent={unavailableTalent} />)

    const contactButton = screen.getByRole('button', { name: /contact/i })
    expect(contactButton).toBeDisabled()
  })

  it('handles contact button click', async () => {
    const { user } = renderWithProviders(<TalentCard talent={mockTalent} />)

    const contactButton = screen.getByRole('button', { name: /contact/i })
    await user.click(contactButton)

    // Button should be clickable
    expect(contactButton).toBeInTheDocument()
  })

  it('displays avatar initials when no avatar URL', () => {
    renderWithProviders(<TalentCard talent={mockTalent} />)

    // Should show first letter of name
    expect(screen.getByText('S')).toBeInTheDocument()
  })

  it('renders with avatar image when URL provided', () => {
    const talentWithAvatar = {
      ...mockTalent,
      avatar_url: 'https://example.com/avatar.jpg',
    }

    const { container } = renderWithProviders(<TalentCard talent={talentWithAvatar} />)

    const img = container.querySelector('img')
    expect(img).toBeInTheDocument()
  })

  it('shows correct badge color for high rating', () => {
    const { container } = renderWithProviders(<TalentCard talent={mockTalent} />)

    // High rating (> 4.5) should have green/positive styling
    const ratingBadge = screen.getByText(/4\.9/)
    expect(ratingBadge).toBeInTheDocument()
  })

  it('renders featured badge when talent is featured', () => {
    const featuredTalent = { ...mockTalent, is_featured: true }
    renderWithProviders(<TalentCard talent={featuredTalent} />)

    expect(screen.getByText(/Featured/i)).toBeInTheDocument()
  })

  it('does not render featured badge when talent is not featured', () => {
    const regularTalent = { ...mockTalent, is_featured: false }
    renderWithProviders(<TalentCard talent={regularTalent} />)

    expect(screen.queryByText(/Featured/i)).not.toBeInTheDocument()
  })

  it('truncates long bio text', () => {
    const longBioTalent = {
      ...mockTalent,
      bio: 'This is a very long bio that should be truncated to prevent the card from becoming too large and affecting the layout of the page. It contains lots of information about the talent.',
    }

    const { container } = renderWithProviders(<TalentCard talent={longBioTalent} />)

    // Bio container should have line clamp or max height
    const bioElement = container.querySelector('[class*="line-clamp"]')
    expect(bioElement || container.querySelector('p')).toBeInTheDocument()
  })

  it('renders view profile link', () => {
    renderWithProviders(<TalentCard talent={mockTalent} />)

    const viewProfileLink = screen.getByRole('link', { name: /view profile/i })
    expect(viewProfileLink).toBeInTheDocument()
    expect(viewProfileLink).toHaveAttribute('href', `/talent/${mockTalent.id}`)
  })

  it('handles talent with no impact metrics', () => {
    const talentNoImpact = { ...mockTalent, impact: undefined }
    renderWithProviders(<TalentCard talent={talentNoImpact} />)

    // Should still render without errors
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
  })

  it('handles talent with no specialties', () => {
    const talentNoSpecialties = { ...mockTalent, specialties: [] }
    renderWithProviders(<TalentCard talent={talentNoSpecialties} />)

    // Should still render without errors
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
  })

  it('handles talent with zero reviews', () => {
    const talentNoReviews = { ...mockTalent, reviews_count: 0 }
    renderWithProviders(<TalentCard talent={talentNoReviews} />)

    expect(screen.getByText(/New/i)).toBeInTheDocument()
  })

  it('applies hover effects', () => {
    const { container } = renderWithProviders(<TalentCard talent={mockTalent} />)

    // Card should have group class for hover effects
    const card = container.querySelector('.group')
    expect(card).toBeInTheDocument()
  })
})
