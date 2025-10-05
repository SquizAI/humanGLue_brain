/**
 * Real-time Types
 * TypeScript types for Supabase Realtime features
 */

import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

// =====================================================================================
// NOTIFICATION TYPES
// =====================================================================================

export type NotificationType =
  | 'enrollment'
  | 'workshop_registration'
  | 'completion'
  | 'review'
  | 'question'
  | 'payment'
  | 'announcement'
  | 'co_instructor_update'
  | 'workshop_checkin'

export interface NotificationData {
  enrollment_id?: string
  workshop_id?: string
  registration_id?: string
  course_id?: string
  student_id?: string
  student_name?: string
  course_title?: string
  workshop_title?: string
  rating?: number
  comment?: string
  completion_rate?: number
  payment_id?: string
  amount?: number
  item_title?: string
  question_id?: string
  question_text?: string
  announcement_id?: string
  update_type?: string
  [key: string]: any
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  data: NotificationData
  read_at: string | null
  created_at: string
  expires_at: string | null
}

export interface NotificationInsertPayload {
  user_id: string
  type: NotificationType
  title: string
  message: string
  data?: NotificationData
  expires_at?: string | null
}

// =====================================================================================
// PRESENCE TYPES
// =====================================================================================

export type PresenceStatus = 'online' | 'offline' | 'away'

export interface StudentPresence {
  id: string
  user_id: string
  course_id: string | null
  workshop_id: string | null
  status: PresenceStatus
  last_seen_at: string
  metadata: Record<string, any>
}

export interface PresenceUser {
  user_id: string
  name: string
  avatar?: string
  status: PresenceStatus
  last_seen_at: string
}

export interface PresenceState {
  [key: string]: PresenceUser[]
}

// =====================================================================================
// STUDENT ACTIVITY TYPES
// =====================================================================================

export type ActivityType =
  | 'lesson_started'
  | 'lesson_completed'
  | 'assignment_submitted'
  | 'quiz_completed'
  | 'question_asked'
  | 'comment_posted'

export interface StudentActivity {
  id: string
  user_id: string
  course_id: string
  lesson_id?: string
  activity_type: ActivityType
  metadata: Record<string, any>
  created_at: string
}

export interface EnrichedStudentActivity extends StudentActivity {
  student_name: string
  student_avatar?: string
  course_title: string
  instructor_id: string
}

// =====================================================================================
// COURSE STATISTICS TYPES
// =====================================================================================

export interface LiveCourseStats {
  course_id: string
  instructor_id: string
  total_enrollments: number
  completed_count: number
  average_rating: number | null
  review_count: number
  online_students: number
}

export interface CourseStatsUpdate {
  course_id: string
  enrollments?: number
  completions?: number
  rating?: number
  reviews?: number
  online?: number
}

// =====================================================================================
// WORKSHOP ATTENDANCE TYPES
// =====================================================================================

export interface WorkshopAttendance {
  workshop_id: string
  total_registered: number
  checked_in_count: number
  online_count: number
  participants: WorkshopParticipant[]
}

export interface WorkshopParticipant {
  user_id: string
  name: string
  avatar?: string
  status: 'registered' | 'checked_in' | 'online'
  joined_at?: string
}

// =====================================================================================
// REALTIME EVENT TYPES
// =====================================================================================

export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE'

export interface RealtimeNotificationEvent {
  type: 'notification'
  payload: RealtimePostgresChangesPayload<Notification>
}

export interface RealtimeEnrollmentEvent {
  type: 'enrollment'
  payload: RealtimePostgresChangesPayload<any>
}

export interface RealtimeActivityEvent {
  type: 'activity'
  payload: RealtimePostgresChangesPayload<StudentActivity>
}

export interface RealtimePresenceEvent {
  type: 'presence'
  action: 'join' | 'leave' | 'sync'
  user: PresenceUser
}

export type RealtimeEvent =
  | RealtimeNotificationEvent
  | RealtimeEnrollmentEvent
  | RealtimeActivityEvent
  | RealtimePresenceEvent

// =====================================================================================
// SUBSCRIPTION TYPES
// =====================================================================================

export interface SubscriptionConfig {
  enabled: boolean
  filter?: string
  event?: RealtimeEventType | '*'
}

export interface RealtimeSubscriptions {
  notifications?: SubscriptionConfig
  enrollments?: SubscriptionConfig
  activity?: SubscriptionConfig
  reviews?: SubscriptionConfig
  presence?: SubscriptionConfig
}

export interface RealtimeConnectionStatus {
  connected: boolean
  channel?: RealtimeChannel
  error?: Error
  reconnecting: boolean
  lastConnected?: Date
}

// =====================================================================================
// HOOK RETURN TYPES
// =====================================================================================

export interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: Error | null
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

export interface UseStudentActivityReturn {
  activities: EnrichedStudentActivity[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export interface UseCourseStatsReturn {
  stats: LiveCourseStats | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export interface UsePresenceReturn {
  onlineUsers: PresenceUser[]
  totalOnline: number
  loading: boolean
  error: Error | null
  updateStatus: (status: PresenceStatus) => Promise<void>
}

export interface UseWorkshopAttendanceReturn {
  attendance: WorkshopAttendance | null
  loading: boolean
  error: Error | null
  checkIn: (userId: string) => Promise<void>
  refetch: () => Promise<void>
}

// =====================================================================================
// REALTIME CONTEXT TYPES
// =====================================================================================

export interface RealtimeContextValue {
  isConnected: boolean
  connectionStatus: RealtimeConnectionStatus
  subscribe: (channelName: string, config: SubscriptionConfig) => RealtimeChannel | null
  unsubscribe: (channelName: string) => void
  unsubscribeAll: () => void
}

// =====================================================================================
// FILTER TYPES
// =====================================================================================

export interface NotificationFilters {
  type?: NotificationType[]
  read?: boolean
  dateFrom?: string
  dateTo?: string
}

export interface ActivityFilters {
  courseId?: string
  activityType?: ActivityType[]
  dateFrom?: string
  dateTo?: string
}

// =====================================================================================
// API RESPONSE TYPES
// =====================================================================================

export interface NotificationResponse {
  success: boolean
  data?: Notification[]
  meta?: {
    total: number
    unread: number
    page?: number
    limit?: number
  }
  error?: {
    code: string
    message: string
  }
}

export interface NotificationActionResponse {
  success: boolean
  data?: Notification
  error?: {
    code: string
    message: string
  }
}

// =====================================================================================
// BROADCAST MESSAGE TYPES (for ephemeral messages)
// =====================================================================================

export interface BroadcastMessage {
  type: string
  payload: any
  sender_id: string
  timestamp: string
}

export interface WorkshopBroadcast extends BroadcastMessage {
  type: 'workshop_message' | 'workshop_poll' | 'workshop_reaction'
  workshop_id: string
}

export interface CourseBroadcast extends BroadcastMessage {
  type: 'course_update' | 'live_qa' | 'announcement'
  course_id: string
}

// =====================================================================================
// UTILITY TYPES
// =====================================================================================

export type NotificationGroupedByDate = {
  date: string
  notifications: Notification[]
}

export type NotificationGroupedByType = {
  [K in NotificationType]?: Notification[]
}
