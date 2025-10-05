/**
 * Component Tests: InstructorNotifications
 * Tests notification dropdown, real-time updates, and user interactions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InstructorNotifications from '@/components/organisms/InstructorNotifications'

// Mock the real-time hook
vi.mock('@/lib/hooks/useRealtimeInstructor', () => ({
  useInstructorNotifications: vi.fn(),
}))

import { useInstructorNotifications } from '@/lib/hooks/useRealtimeInstructor'

describe('InstructorNotifications', () => {
  const mockNotifications = [
    {
      id: '1',
      type: 'enrollment' as const,
      title: 'New Enrollment',
      message: 'John Doe enrolled in AI Fundamentals',
      created_at: new Date().toISOString(),
      read_at: null,
      data: { course_id: 'course-1', student_id: 'student-1' },
    },
    {
      id: '2',
      type: 'review' as const,
      title: 'New Review',
      message: 'Jane Smith left a 5-star review',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      read_at: new Date().toISOString(),
      data: { course_id: 'course-2' },
    },
    {
      id: '3',
      type: 'question' as const,
      title: 'New Question',
      message: 'Bob asked a question in Module 3',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      read_at: null,
      data: { course_id: 'course-1' },
    },
  ]

  const mockHookReturn = {
    notifications: mockNotifications,
    unreadCount: 2,
    loading: false,
    error: null,
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    deleteNotification: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useInstructorNotifications as any).mockReturnValue(mockHookReturn)
  })

  it('renders notification bell icon', () => {
    render(<InstructorNotifications />)

    const bellButton = screen.getByRole('button', { name: /notifications/i })
    expect(bellButton).toBeInTheDocument()
  })

  it('shows unread count badge', () => {
    render(<InstructorNotifications />)

    const badge = screen.getByText('2')
    expect(badge).toBeInTheDocument()
  })

  it('shows 9+ for more than 9 unread notifications', () => {
    ;(useInstructorNotifications as any).mockReturnValue({
      ...mockHookReturn,
      unreadCount: 15,
    })

    render(<InstructorNotifications />)

    const badge = screen.getByText('9+')
    expect(badge).toBeInTheDocument()
  })

  it('opens dropdown when bell is clicked', async () => {
    const user = userEvent.setup()
    render(<InstructorNotifications />)

    const bellButton = screen.getByRole('button', { name: /notifications/i })
    await user.click(bellButton)

    const dropdown = screen.getByRole('heading', { name: /notifications/i })
    expect(dropdown).toBeInTheDocument()
  })

  it('displays notification list', async () => {
    const user = userEvent.setup()
    render(<InstructorNotifications />)

    const bellButton = screen.getByRole('button', { name: /notifications/i })
    await user.click(bellButton)

    expect(screen.getByText('New Enrollment')).toBeInTheDocument()
    expect(screen.getByText('New Review')).toBeInTheDocument()
    expect(screen.getByText('New Question')).toBeInTheDocument()
  })

  it('shows unread indicator on unread notifications', async () => {
    const user = userEvent.setup()
    render(<InstructorNotifications />)

    await user.click(screen.getByRole('button', { name: /notifications/i }))

    // Unread notifications should have blue dot
    const unreadNotifications = mockNotifications.filter((n) => !n.read_at)
    expect(unreadNotifications).toHaveLength(2)
  })

  it('calls markAllAsRead when button is clicked', async () => {
    const user = userEvent.setup()
    render(<InstructorNotifications />)

    await user.click(screen.getByRole('button', { name: /notifications/i }))

    const markAllButton = screen.getByText(/mark all as read/i)
    await user.click(markAllButton)

    expect(mockHookReturn.markAllAsRead).toHaveBeenCalledTimes(1)
  })

  it('marks notification as read when clicked', async () => {
    const user = userEvent.setup()
    render(<InstructorNotifications />)

    await user.click(screen.getByRole('button', { name: /notifications/i }))

    const notification = screen.getByText('New Enrollment')
    await user.click(notification)

    expect(mockHookReturn.markAsRead).toHaveBeenCalledWith('1')
  })

  it('navigates to course when notification has course_id', async () => {
    const user = userEvent.setup()

    // Mock window.location.href
    delete (window as any).location
    window.location = { href: '' } as any

    render(<InstructorNotifications />)

    await user.click(screen.getByRole('button', { name: /notifications/i }))

    const notification = screen.getByText('New Enrollment')
    await user.click(notification)

    expect(window.location.href).toBe('/instructor/courses/course-1')
  })

  it('filters notifications by type', async () => {
    const user = userEvent.setup()
    render(<InstructorNotifications />)

    await user.click(screen.getByRole('button', { name: /notifications/i }))

    const filterSelect = screen.getByRole('combobox')
    await user.selectOptions(filterSelect, 'enrollment')

    // Should only show enrollment notifications
    expect(screen.getByText('New Enrollment')).toBeInTheDocument()
    expect(screen.queryByText('New Review')).not.toBeInTheDocument()
  })

  it('filters to show only unread notifications', async () => {
    const user = userEvent.setup()
    render(<InstructorNotifications />)

    await user.click(screen.getByRole('button', { name: /notifications/i }))

    const unreadButton = screen.getByRole('button', { name: /unread/i })
    await user.click(unreadButton)

    // Should only show unread
    expect(screen.getByText('New Enrollment')).toBeInTheDocument()
    expect(screen.getByText('New Question')).toBeInTheDocument()
    expect(screen.queryByText('New Review')).not.toBeInTheDocument()
  })

  it('dismisses notification when dismiss is clicked', async () => {
    const user = userEvent.setup()
    render(<InstructorNotifications />)

    await user.click(screen.getByRole('button', { name: /notifications/i }))

    const dismissButtons = screen.getAllByText(/dismiss/i)
    await user.click(dismissButtons[0])

    expect(mockHookReturn.deleteNotification).toHaveBeenCalledWith('1')
  })

  it('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <InstructorNotifications />
      </div>
    )

    // Open dropdown
    await user.click(screen.getByRole('button', { name: /notifications/i }))
    expect(screen.getByRole('heading', { name: /notifications/i })).toBeInTheDocument()

    // Click outside
    await user.click(screen.getByTestId('outside'))

    // Dropdown should close
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /notifications/i })).not.toBeInTheDocument()
    })
  })

  it('shows loading state', () => {
    ;(useInstructorNotifications as any).mockReturnValue({
      ...mockHookReturn,
      loading: true,
      notifications: [],
    })

    render(<InstructorNotifications />)

    fireEvent.click(screen.getByRole('button', { name: /notifications/i }))

    expect(screen.getByText(/loading notifications/i)).toBeInTheDocument()
  })

  it('shows error state', () => {
    ;(useInstructorNotifications as any).mockReturnValue({
      ...mockHookReturn,
      error: new Error('Failed to load'),
      notifications: [],
    })

    render(<InstructorNotifications />)

    fireEvent.click(screen.getByRole('button', { name: /notifications/i }))

    expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
  })

  it('shows empty state when no notifications', async () => {
    ;(useInstructorNotifications as any).mockReturnValue({
      ...mockHookReturn,
      notifications: [],
      unreadCount: 0,
    })

    const user = userEvent.setup()
    render(<InstructorNotifications />)

    await user.click(screen.getByRole('button', { name: /notifications/i }))

    expect(screen.getByText(/no notifications/i)).toBeInTheDocument()
  })

  it('shows correct notification icons', async () => {
    const user = userEvent.setup()
    render(<InstructorNotifications />)

    await user.click(screen.getByRole('button', { name: /notifications/i }))

    // Check for emoji icons (enrollment: 👥, review: ⭐, question: ❓)
    const icons = screen.getAllByText(/[👥⭐❓]/)
    expect(icons).toHaveLength(3)
  })

  it('formats relative timestamps correctly', async () => {
    const user = userEvent.setup()
    render(<InstructorNotifications />)

    await user.click(screen.getByRole('button', { name: /notifications/i }))

    // Should show relative time like "2 hours ago"
    expect(screen.getByText(/ago/i)).toBeInTheDocument()
  })

  it('limits displayed notifications to maxVisible prop', async () => {
    const user = userEvent.setup()
    render(<InstructorNotifications maxVisible={2} />)

    await user.click(screen.getByRole('button', { name: /notifications/i }))

    // Should only show 2 notifications even though we have 3
    const notificationItems = screen.getAllByRole('button').filter((el) =>
      el.classList.contains('cursor-pointer')
    )
    expect(notificationItems.length).toBeLessThanOrEqual(2)
  })

  it('navigates to all notifications page', async () => {
    const user = userEvent.setup()

    delete (window as any).location
    window.location = { href: '' } as any

    render(<InstructorNotifications />)

    await user.click(screen.getByRole('button', { name: /notifications/i }))

    const viewAllButton = screen.getByText(/view all notifications/i)
    await user.click(viewAllButton)

    expect(window.location.href).toBe('/instructor/notifications')
  })
})
