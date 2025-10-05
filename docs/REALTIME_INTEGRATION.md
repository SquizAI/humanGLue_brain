# Real-Time Features Integration Guide

## Overview

This guide explains how to integrate Supabase Realtime features into the HumanGlue instructor dashboard for instant notifications, live updates, and presence tracking.

## Table of Contents

1. [Setup](#setup)
2. [Database Migration](#database-migration)
3. [React Integration](#react-integration)
4. [API Endpoints](#api-endpoints)
5. [Component Examples](#component-examples)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Setup

### 1. Run Database Migration

Execute the migration to create notification tables, triggers, and enable Realtime:

```bash
# Using Supabase CLI
supabase db push

# Or manually in SQL editor
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/003_realtime_setup.sql
```

### 2. Verify Realtime Publications

Ensure tables are published for Realtime:

```sql
-- Check what's published
SELECT tablename FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';
```

Should include:
- `notifications`
- `enrollments`
- `workshop_registrations`
- `student_activity`
- `course_reviews`
- `student_presence`
- `payments`

---

## Database Migration

### Tables Created

#### 1. `notifications` Table
Stores all user notifications with metadata.

```sql
CREATE TABLE notifications (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  type text, -- notification type
  title text,
  message text,
  data jsonb, -- flexible payload
  read_at timestamptz,
  created_at timestamptz,
  expires_at timestamptz
);
```

#### 2. `student_presence` Table
Tracks online/offline status of students.

```sql
CREATE TABLE student_presence (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  course_id uuid REFERENCES courses(id),
  workshop_id uuid REFERENCES workshops(id),
  status text, -- 'online', 'offline', 'away'
  last_seen_at timestamptz,
  metadata jsonb
);
```

### Triggers Configured

**Automatic notifications are created for:**

1. **New Enrollments** - When a student enrolls in a course
2. **Workshop Registrations** - When a student registers for a workshop
3. **Course Completions** - When a student completes a course
4. **New Reviews** - When a student leaves a review/rating
5. **Payments** - When a payment is successfully processed

### Helper Functions

**`create_notification()`** - Create a notification programmatically:

```sql
SELECT create_notification(
  'instructor-user-id',
  'enrollment',
  'New Student Enrolled',
  'John Doe enrolled in your course',
  '{"course_id": "123", "student_name": "John Doe"}'::jsonb
);
```

**`cleanup_old_notifications()`** - Remove old notifications (run daily):

```sql
SELECT cleanup_old_notifications(); -- Returns count of deleted notifications
```

---

## React Integration

### 1. Wrap App with RealtimeProvider

In your root layout or instructor dashboard layout:

```tsx
// app/instructor/layout.tsx
import { RealtimeProvider } from '@/lib/contexts/RealtimeContext'

export default function InstructorLayout({ children }) {
  return (
    <RealtimeProvider autoConnect={true} debug={false}>
      {children}
    </RealtimeProvider>
  )
}
```

### 2. Use Real-Time Hooks

#### Notifications Hook

```tsx
import { useInstructorNotifications } from '@/lib/hooks/useRealtimeInstructor'

export default function DashboardPage() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useInstructorNotifications()

  return (
    <div>
      <h2>Notifications ({unreadCount} unread)</h2>
      {notifications.map(notif => (
        <div key={notif.id} onClick={() => markAsRead(notif.id)}>
          {notif.title}
        </div>
      ))}
    </div>
  )
}
```

#### Student Activity Hook

```tsx
import { useStudentActivity } from '@/lib/hooks/useRealtimeInstructor'

export default function ActivityFeed({ courseId }) {
  const { activities, loading, error } = useStudentActivity(courseId)

  return (
    <div>
      <h3>Recent Activity</h3>
      {activities.map(activity => (
        <div key={activity.id}>
          {activity.student_name} {activity.activity_type}
        </div>
      ))}
    </div>
  )
}
```

#### Live Course Stats Hook

```tsx
import { useCourseStats } from '@/lib/hooks/useRealtimeInstructor'

export default function CourseMetrics({ courseId }) {
  const { stats, loading } = useCourseStats(courseId)

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <p>Total Enrollments: {stats?.total_enrollments}</p>
      <p>Completed: {stats?.completed_count}</p>
      <p>Average Rating: {stats?.average_rating}</p>
      <p>Online Now: {stats?.online_students}</p>
    </div>
  )
}
```

#### Presence Hook

```tsx
import { usePresence } from '@/lib/hooks/useRealtimeInstructor'

export default function OnlineStudents({ courseId }) {
  const { onlineUsers, totalOnline, updateStatus } = usePresence(courseId)

  return (
    <div>
      <h3>{totalOnline} students online</h3>
      {onlineUsers.map(user => (
        <div key={user.user_id}>
          <img src={user.avatar} alt={user.name} />
          {user.name} - {user.status}
        </div>
      ))}
    </div>
  )
}
```

#### Workshop Attendance Hook

```tsx
import { useWorkshopAttendance } from '@/lib/hooks/useRealtimeInstructor'

export default function WorkshopPanel({ workshopId }) {
  const { attendance, checkIn } = useWorkshopAttendance(workshopId)

  return (
    <div>
      <p>Registered: {attendance?.total_registered}</p>
      <p>Checked In: {attendance?.checked_in_count}</p>
      <p>Online: {attendance?.online_count}</p>

      {attendance?.participants.map(p => (
        <div key={p.user_id}>
          {p.name} - {p.status}
          {p.status === 'registered' && (
            <button onClick={() => checkIn(p.user_id)}>
              Check In
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
```

### 3. Add Notification Component to Header

```tsx
// app/instructor/layout.tsx
import InstructorNotifications from '@/components/organisms/InstructorNotifications'

export default function InstructorLayout({ children }) {
  return (
    <div>
      <header>
        <nav>
          {/* Other nav items */}
          <InstructorNotifications />
        </nav>
      </header>
      <main>{children}</main>
    </div>
  )
}
```

---

## API Endpoints

### GET /api/instructor/notifications

Fetch notifications with filtering and pagination.

**Query Parameters:**
- `type` - Filter by notification type (enrollment, review, payment, etc.)
- `read` - Filter by read status (true/false)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `dateFrom` - ISO datetime for start range
- `dateTo` - ISO datetime for end range

**Example:**
```typescript
const response = await fetch(
  '/api/instructor/notifications?type=enrollment&read=false&limit=10'
)
const { data, meta } = await response.json()
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "type": "enrollment",
      "title": "New Student Enrolled",
      "message": "John Doe enrolled in your course",
      "data": {
        "course_id": "123",
        "student_name": "John Doe"
      },
      "read_at": null,
      "created_at": "2025-10-04T12:00:00Z"
    }
  ],
  "meta": {
    "total": 45,
    "unread": 12,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

### PUT /api/instructor/notifications/[id]

Mark notification as read or unread.

**Body:**
```json
{
  "action": "read" // or "unread"
}
```

**Example:**
```typescript
await fetch('/api/instructor/notifications/123', {
  method: 'PUT',
  body: JSON.stringify({ action: 'read' })
})
```

### DELETE /api/instructor/notifications/[id]

Delete a notification.

**Example:**
```typescript
await fetch('/api/instructor/notifications/123', {
  method: 'DELETE'
})
```

### POST /api/instructor/notifications/mark-all-read

Mark all notifications as read.

**Example:**
```typescript
const response = await fetch('/api/instructor/notifications/mark-all-read', {
  method: 'POST'
})
const { data } = await response.json()
console.log(`Marked ${data.updated_count} notifications as read`)
```

---

## Component Examples

### Example 1: Real-Time Dashboard

```tsx
'use client'

import { useInstructorRealtime } from '@/lib/hooks/useRealtimeInstructor'
import InstructorNotifications from '@/components/organisms/InstructorNotifications'

export default function InstructorDashboard({ courseId }) {
  const { notifications, activity, stats, presence } = useInstructorRealtime(courseId)

  return (
    <div className="dashboard">
      {/* Header with notifications */}
      <header>
        <h1>Dashboard</h1>
        <InstructorNotifications />
      </header>

      {/* Live Stats */}
      <div className="stats-grid">
        <StatCard
          title="Total Students"
          value={stats?.stats?.total_enrollments || 0}
        />
        <StatCard
          title="Online Now"
          value={presence?.totalOnline || 0}
        />
        <StatCard
          title="Avg Rating"
          value={stats?.stats?.average_rating || 0}
        />
      </div>

      {/* Activity Feed */}
      <div className="activity-feed">
        <h2>Recent Activity</h2>
        {activity.activities.map(a => (
          <ActivityItem key={a.id} activity={a} />
        ))}
      </div>
    </div>
  )
}
```

### Example 2: Live Workshop View

```tsx
'use client'

import { useWorkshopAttendance, usePresence } from '@/lib/hooks/useRealtimeInstructor'

export default function LiveWorkshop({ workshopId }) {
  const { attendance, checkIn } = useWorkshopAttendance(workshopId)
  const { onlineUsers } = usePresence(undefined, workshopId)

  return (
    <div>
      <div className="metrics">
        <h2>Workshop Attendance</h2>
        <p>Registered: {attendance?.total_registered}</p>
        <p>Checked In: {attendance?.checked_in_count}</p>
        <p>Live: {onlineUsers.length}</p>
      </div>

      <div className="participants">
        <h3>Participants</h3>
        {attendance?.participants.map(p => (
          <div key={p.user_id} className="participant">
            <img src={p.avatar} alt={p.name} />
            <span>{p.name}</span>
            <span className={`status ${p.status}`}>{p.status}</span>
            {p.status === 'registered' && (
              <button onClick={() => checkIn(p.user_id)}>
                Check In
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="online-now">
        <h3>Active Now</h3>
        {onlineUsers.map(u => (
          <div key={u.user_id}>
            {u.name} - Last seen: {u.last_seen_at}
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Example 3: Custom Notification Filter

```tsx
'use client'

import { useState } from 'react'
import { useInstructorNotifications } from '@/lib/hooks/useRealtimeInstructor'

export default function NotificationCenter() {
  const [filters, setFilters] = useState({
    type: undefined,
    read: undefined,
    dateFrom: undefined,
  })

  const { notifications, unreadCount, markAsRead } = useInstructorNotifications(filters)

  return (
    <div>
      <h1>Notification Center ({unreadCount} unread)</h1>

      {/* Filters */}
      <div className="filters">
        <select
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">All Types</option>
          <option value="enrollment">Enrollments</option>
          <option value="review">Reviews</option>
          <option value="payment">Payments</option>
        </select>

        <select
          onChange={(e) => setFilters({
            ...filters,
            read: e.target.value === 'all' ? undefined : e.target.value === 'true'
          })}
        >
          <option value="all">All</option>
          <option value="false">Unread</option>
          <option value="true">Read</option>
        </select>
      </div>

      {/* Notifications List */}
      <div className="notifications">
        {notifications.map(notif => (
          <div
            key={notif.id}
            className={notif.read_at ? 'read' : 'unread'}
            onClick={() => markAsRead(notif.id)}
          >
            <h3>{notif.title}</h3>
            <p>{notif.message}</p>
            <span>{new Date(notif.created_at).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## Testing

### 1. Test Database Triggers

Create a test enrollment to trigger notification:

```sql
-- Insert test enrollment (will trigger notification)
INSERT INTO enrollments (user_id, course_id, status)
VALUES (
  'student-uuid',
  'course-uuid',
  'active'
);

-- Check if notification was created
SELECT * FROM notifications
WHERE user_id = 'instructor-uuid'
ORDER BY created_at DESC
LIMIT 1;
```

### 2. Test Real-Time Subscription

Open browser console and monitor:

```javascript
// In browser console
const { createClient } = supabaseClient
const supabase = createClient(url, anonKey)

const channel = supabase
  .channel('test-notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
  }, (payload) => {
    console.log('New notification:', payload)
  })
  .subscribe()
```

Then insert a notification in another tab/SQL editor and watch it appear.

### 3. Test Presence

```javascript
// Join presence channel
const presenceChannel = supabase
  .channel('presence-test', {
    config: { presence: { key: 'user-123' } }
  })
  .on('presence', { event: 'sync' }, () => {
    const state = presenceChannel.presenceState()
    console.log('Presence state:', state)
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await presenceChannel.track({
        user_id: 'user-123',
        name: 'Test User',
        status: 'online'
      })
    }
  })
```

---

## Troubleshooting

### Issue: Notifications not appearing in real-time

**Solution:**
1. Verify Realtime is enabled on the table:
```sql
SELECT * FROM pg_publication_tables
WHERE pubname = 'supabase_realtime' AND tablename = 'notifications';
```

2. Check RLS policies allow user to SELECT their notifications:
```sql
SELECT * FROM pg_policies WHERE tablename = 'notifications';
```

3. Ensure user is authenticated in the subscription:
```typescript
const { data: { user } } = await supabase.auth.getUser()
console.log('Authenticated user:', user)
```

### Issue: Connection keeps dropping

**Solution:**
1. Enable debug mode in RealtimeProvider:
```tsx
<RealtimeProvider debug={true}>
```

2. Check network tab for WebSocket errors
3. Verify Supabase project settings allow Realtime connections
4. Check for ad-blockers or firewall blocking WebSocket

### Issue: Presence not syncing

**Solution:**
1. Ensure presence key is unique per user
2. Check that tracking is called AFTER channel is subscribed:
```typescript
channel.subscribe(async (status) => {
  if (status === 'SUBSCRIBED') {
    await channel.track({ user_id: 'xyz' })
  }
})
```

### Issue: High database load from Realtime

**Solution:**
1. Use filters in subscriptions:
```typescript
.on('postgres_changes', {
  filter: `user_id=eq.${userId}` // Filter at DB level
})
```

2. Limit number of concurrent subscriptions
3. Use debouncing for high-frequency updates
4. Run cleanup functions regularly:
```sql
SELECT cron.schedule(
  'cleanup-notifications',
  '0 2 * * *',
  'SELECT cleanup_old_notifications();'
);
```

---

## Best Practices

1. **Always filter subscriptions** - Use RLS filters to reduce payload size
2. **Cleanup old data** - Run cleanup functions regularly
3. **Handle reconnections** - Use RealtimeProvider for automatic reconnection
4. **Optimize queries** - Use views for complex joins instead of client-side joins
5. **Monitor performance** - Check Supabase dashboard for Realtime metrics
6. **Test offline** - Ensure app works when Realtime is unavailable
7. **Rate limit notifications** - Prevent notification spam with triggers
8. **Use presence wisely** - Don't track presence for large groups (>100 users)

---

## Production Checklist

- [ ] Database migration executed successfully
- [ ] RLS policies tested and verified
- [ ] Realtime publications configured
- [ ] Cleanup jobs scheduled (pg_cron)
- [ ] RealtimeProvider added to layout
- [ ] Error boundaries added around real-time components
- [ ] Connection status indicator implemented
- [ ] Offline fallback UI created
- [ ] Performance testing completed
- [ ] Security audit of notification triggers
- [ ] Rate limiting implemented
- [ ] Monitoring/alerting configured

---

## Additional Resources

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Presence Documentation](https://supabase.com/docs/guides/realtime/presence)
- [Broadcast Channels](https://supabase.com/docs/guides/realtime/broadcast)
- [Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes)
