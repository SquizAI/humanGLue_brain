// @ts-nocheck
/**
 * Real-time Instructor Hooks
 * React hooks for Supabase Realtime features in instructor dashboard
 */

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useChat } from '@/lib/contexts/ChatContext'
import {
  Notification,
  UseNotificationsReturn,
  UseStudentActivityReturn,
  UseCourseStatsReturn,
  UsePresenceReturn,
  UseWorkshopAttendanceReturn,
  EnrichedStudentActivity,
  LiveCourseStats,
  PresenceUser,
  PresenceStatus,
  WorkshopAttendance,
  NotificationFilters,
} from '@/lib/types/realtime'
import { RealtimeChannel } from '@supabase/supabase-js'

// =====================================================================================
// NOTIFICATIONS HOOK
// =====================================================================================

export function useInstructorNotifications(
  filters?: NotificationFilters
): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { userData } = useChat()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    if (!userData?.id) return

    try {
      setLoading(true)
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })
        .limit(50)

      // Apply filters
      if (filters?.type && filters.type.length > 0) {
        query = query.in('type', filters.type)
      }
      if (filters?.read !== undefined) {
        if (filters.read) {
          query = query.not('read_at', 'is', null)
        } else {
          query = query.is('read_at', null)
        }
      }
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom)
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      setNotifications(data || [])
      setError(null)
    } catch (err) {
      setError(err as Error)
      console.error('Error fetching notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [userData?.id, filters, supabase])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!userData?.id) return

    fetchNotifications()

    // Create real-time subscription
    const channel = supabase
      .channel(`notifications:${userData.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userData.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications((prev) => [newNotification, ...prev])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userData.id}`,
        },
        (payload) => {
          const updatedNotification = payload.new as Notification
          setNotifications((prev) =>
            prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n))
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userData.id}`,
        },
        (payload) => {
          const deletedId = payload.old.id
          setNotifications((prev) => prev.filter((n) => n.id !== deletedId))
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [userData?.id, fetchNotifications, supabase])

  // Mark notification as read
  const markAsRead = useCallback(
    async (id: string) => {
      try {
        const { error: updateError } = await (supabase as any)
          .from('notifications')
          .update({ read_at: new Date().toISOString() })
          .eq('id', id)
          .eq('user_id', userData?.id)

        if (updateError) throw updateError

        // Optimistic update
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, read_at: new Date().toISOString() } : n
          )
        )
      } catch (err) {
        console.error('Error marking notification as read:', err)
        throw err
      }
    },
    [userData?.id, supabase]
  )

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const { error: updateError } = await (supabase as any)
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', userData?.id)
        .is('read_at', null)

      if (updateError) throw updateError

      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      )
    } catch (err) {
      console.error('Error marking all as read:', err)
      throw err
    }
  }, [userData?.id, supabase])

  // Delete notification
  const deleteNotification = useCallback(
    async (id: string) => {
      try {
        const { error: deleteError } = await supabase
          .from('notifications')
          .delete()
          .eq('id', id)
          .eq('user_id', userData?.id)

        if (deleteError) throw deleteError

        // Optimistic update
        setNotifications((prev) => prev.filter((n) => n.id !== id))
      } catch (err) {
        console.error('Error deleting notification:', err)
        throw err
      }
    },
    [userData?.id, supabase]
  )

  const unreadCount = notifications.filter((n) => !n.read_at).length

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  }
}

// =====================================================================================
// STUDENT ACTIVITY HOOK
// =====================================================================================

export function useStudentActivity(courseId?: string): UseStudentActivityReturn {
  const [activities, setActivities] = useState<EnrichedStudentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { userData } = useChat()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()

  const fetchActivities = useCallback(async () => {
    if (!userData?.id) return

    try {
      setLoading(true)
      let query = supabase
        .from('instructor_recent_activity')
        .select('*')
        .eq('instructor_id', userData.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (courseId) {
        query = query.eq('course_id', courseId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      setActivities(data || [])
      setError(null)
    } catch (err) {
      setError(err as Error)
      console.error('Error fetching activities:', err)
    } finally {
      setLoading(false)
    }
  }, [userData?.id, courseId, supabase])

  useEffect(() => {
    if (!userData?.id) return

    fetchActivities()

    // Subscribe to student activity updates
    const channel = supabase
      .channel(`activity:instructor:${userData.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'student_activity',
        },
        async (payload) => {
          // Fetch enriched activity data
          const { data } = await supabase
            .from('instructor_recent_activity')
            .select('*')
            .eq('id', payload.new.id)
            .eq('instructor_id', userData.id)
            .single()

          if (data) {
            setActivities((prev) => [data, ...prev].slice(0, 20))
          }
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [userData?.id, courseId, fetchActivities, supabase])

  return {
    activities,
    loading,
    error,
    refetch: fetchActivities,
  }
}

// =====================================================================================
// COURSE STATS HOOK
// =====================================================================================

export function useCourseStats(courseId: string): UseCourseStatsReturn {
  const [stats, setStats] = useState<LiveCourseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { userData } = useChat()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()

  const fetchStats = useCallback(async () => {
    if (!userData?.id || !courseId) return

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('live_course_stats')
        .select('*')
        .eq('course_id', courseId)
        .eq('instructor_id', userData.id)
        .single()

      if (fetchError) throw fetchError

      setStats(data)
      setError(null)
    } catch (err) {
      setError(err as Error)
      console.error('Error fetching course stats:', err)
    } finally {
      setLoading(false)
    }
  }, [userData?.id, courseId, supabase])

  useEffect(() => {
    if (!userData?.id || !courseId) return

    fetchStats()

    // Subscribe to changes that affect stats
    const channel = supabase
      .channel(`course-stats:${courseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'enrollments',
          filter: `course_id=eq.${courseId}`,
        },
        () => {
          fetchStats()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'course_reviews',
          filter: `course_id=eq.${courseId}`,
        },
        () => {
          fetchStats()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_presence',
          filter: `course_id=eq.${courseId}`,
        },
        () => {
          fetchStats()
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [userData?.id, courseId, fetchStats, supabase])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  }
}

// =====================================================================================
// PRESENCE HOOK
// =====================================================================================

export function usePresence(
  courseId?: string,
  workshopId?: string
): UsePresenceReturn {
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { userData } = useChat()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!userData?.id || (!courseId && !workshopId)) return

    const channelName = courseId
      ? `presence:course:${courseId}`
      : `presence:workshop:${workshopId}`

    const channel = supabase
      .channel(channelName, {
        config: {
          presence: {
            key: userData.id,
          },
        },
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const users: PresenceUser[] = Object.values(state).flat() as any
        setOnlineUsers(users)
        setLoading(false)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        setOnlineUsers((prev) => [...prev, ...(newPresences as any)])
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        setOnlineUsers((prev) =>
          prev.filter((user) => !leftPresences.some((p: any) => p.user_id === user.user_id))
        )
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userData.id,
            name: userData.name,
            avatar: userData.avatar,
            status: 'online' as PresenceStatus,
            last_seen_at: new Date().toISOString(),
          })
        }
      })

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [userData?.id, courseId, workshopId, supabase])

  const updateStatus = useCallback(
    async (status: PresenceStatus) => {
      if (!channelRef.current) return

      await channelRef.current.track({
        user_id: userData?.id,
        name: userData?.name,
        avatar: userData?.avatar,
        status,
        last_seen_at: new Date().toISOString(),
      })
    },
    [userData]
  )

  return {
    onlineUsers,
    totalOnline: onlineUsers.length,
    loading,
    error,
    updateStatus,
  }
}

// =====================================================================================
// WORKSHOP ATTENDANCE HOOK
// =====================================================================================

export function useWorkshopAttendance(
  workshopId: string
): UseWorkshopAttendanceReturn {
  const [attendance, setAttendance] = useState<WorkshopAttendance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { userData } = useChat()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()

  const fetchAttendance = useCallback(async () => {
    if (!userData?.id || !workshopId) return

    try {
      setLoading(true)

      // Fetch registrations
      const { data: registrations, error: regError } = await supabase
        .from('workshop_registrations')
        .select(`
          id,
          user_id,
          status,
          users:user_id (
            id,
            name,
            avatar
          )
        `)
        .eq('workshop_id', workshopId)

      if (regError) throw regError

      // Fetch online presence
      const { data: presence, error: presError } = await supabase
        .from('student_presence')
        .select('*')
        .eq('workshop_id', workshopId)
        .eq('status', 'online')

      if (presError) throw presError

      const participants = registrations?.map((reg: any) => ({
        user_id: reg.user_id,
        name: reg.users.name,
        avatar: reg.users.avatar,
        status: reg.status,
        joined_at: (presence as any[])?.find((p: any) => p.user_id === reg.user_id)?.last_seen_at,
      })) || []

      setAttendance({
        workshop_id: workshopId,
        total_registered: registrations?.length || 0,
        checked_in_count: registrations?.filter((r: any) => r.status === 'checked_in').length || 0,
        online_count: presence?.length || 0,
        participants,
      })

      setError(null)
    } catch (err) {
      setError(err as Error)
      console.error('Error fetching attendance:', err)
    } finally {
      setLoading(false)
    }
  }, [userData?.id, workshopId, supabase])

  useEffect(() => {
    if (!userData?.id || !workshopId) return

    fetchAttendance()

    // Subscribe to registration updates
    const channel = supabase
      .channel(`workshop-attendance:${workshopId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workshop_registrations',
          filter: `workshop_id=eq.${workshopId}`,
        },
        () => {
          fetchAttendance()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_presence',
          filter: `workshop_id=eq.${workshopId}`,
        },
        () => {
          fetchAttendance()
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [userData?.id, workshopId, fetchAttendance, supabase])

  const checkIn = useCallback(
    async (userId: string) => {
      try {
        const { error: updateError } = await supabase
          .from('workshop_registrations')
          .update({ status: 'checked_in' })
          .eq('workshop_id', workshopId)
          .eq('user_id', userId)

        if (updateError) throw updateError

        await fetchAttendance()
      } catch (err) {
        console.error('Error checking in user:', err)
        throw err
      }
    },
    [workshopId, fetchAttendance, supabase]
  )

  return {
    attendance,
    loading,
    error,
    checkIn,
    refetch: fetchAttendance,
  }
}

// =====================================================================================
// COMPOSITE HOOK - All instructor real-time features
// =====================================================================================

export function useInstructorRealtime(courseId?: string) {
  const notifications = useInstructorNotifications()
  const activity = useStudentActivity(courseId)
  const stats = courseId ? useCourseStats(courseId) : null
  const presence = courseId ? usePresence(courseId) : null

  return {
    notifications,
    activity,
    stats,
    presence,
  }
}
