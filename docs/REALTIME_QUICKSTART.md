# Real-Time Features - Quick Start Guide

## 🚀 What's Been Built

A comprehensive real-time notification and presence system for the HumanGlue instructor dashboard using Supabase Realtime.

## 📦 Files Created

### Database Layer
- **`supabase/migrations/003_realtime_setup.sql`**
  - `notifications` table with automatic triggers
  - `student_presence` table for online/offline tracking
  - Automatic notification creation for: enrollments, completions, reviews, payments
  - Helper views for statistics and activity feeds
  - RLS policies for security
  - Cleanup functions for old data

### TypeScript Types
- **`lib/types/realtime.ts`**
  - All notification, presence, and activity types
  - Hook return types
  - API response types

### React Hooks
- **`lib/hooks/useRealtimeInstructor.ts`**
  - `useInstructorNotifications()` - Real-time notifications with filtering
  - `useStudentActivity()` - Live student activity feed
  - `useCourseStats()` - Real-time course metrics
  - `usePresence()` - Online/offline presence tracking
  - `useWorkshopAttendance()` - Live workshop participant tracking
  - `useInstructorRealtime()` - Composite hook for all features

### Context Provider
- **`lib/contexts/RealtimeContext.tsx`**
  - Central subscription management
  - Connection status monitoring
  - Automatic reconnection with exponential backoff
  - Channel lifecycle management

### UI Components
- **`components/organisms/InstructorNotifications.tsx`**
  - Bell icon with unread badge
  - Animated dropdown panel
  - Filter by type and read status
  - Mark as read/unread
  - Delete notifications
  - Real-time updates

### API Routes
- **`app/api/instructor/notifications/route.ts`**
  - GET - Fetch notifications with filters/pagination
  - POST - Create notification

- **`app/api/instructor/notifications/[id]/route.ts`**
  - PUT - Mark as read/unread
  - DELETE - Remove notification

- **`app/api/instructor/notifications/mark-all-read/route.ts`**
  - POST - Mark all as read

### Documentation
- **`docs/REALTIME_INTEGRATION.md`** - Comprehensive integration guide
- **`docs/REALTIME_QUICKSTART.md`** - This quick start guide

---

## ⚡ Quick Setup (5 minutes)

### Step 1: Run Database Migration

```bash
# Using Supabase CLI
supabase db push

# Or copy/paste the SQL file in Supabase SQL Editor
# File: supabase/migrations/003_realtime_setup.sql
```

### Step 2: Add RealtimeProvider to Layout

```tsx
// app/instructor/layout.tsx
import { RealtimeProvider } from '@/lib/contexts/RealtimeContext'
import InstructorNotifications from '@/components/organisms/InstructorNotifications'

export default function InstructorLayout({ children }) {
  return (
    <RealtimeProvider autoConnect={true}>
      <div className="layout">
        <header>
          <nav>
            {/* Your existing nav */}
            <InstructorNotifications /> {/* Add this */}
          </nav>
        </header>
        <main>{children}</main>
      </div>
    </RealtimeProvider>
  )
}
```

### Step 3: Use Real-Time Hooks in Your Pages

```tsx
// app/instructor/dashboard/page.tsx
'use client'

import { useInstructorNotifications, useStudentActivity } from '@/lib/hooks/useRealtimeInstructor'

export default function DashboardPage() {
  const { notifications, unreadCount } = useInstructorNotifications()
  const { activities } = useStudentActivity()

  return (
    <div>
      <h1>Dashboard ({unreadCount} new notifications)</h1>

      <div className="activity-feed">
        {activities.map(activity => (
          <div key={activity.id}>
            {activity.student_name} {activity.activity_type}
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 🎯 Features Overview

### 1. Real-Time Notifications
Instructors receive instant notifications for:
- ✅ New student enrollments
- ✅ Workshop registrations
- ✅ Course completions
- ✅ Student reviews/ratings
- ✅ Payment confirmations
- ✅ Student questions
- ✅ Co-instructor updates

### 2. Live Dashboard Updates
Auto-refresh without page reload:
- ✅ Student activity timeline
- ✅ Enrollment counts
- ✅ Revenue metrics
- ✅ Course ratings
- ✅ Workshop attendance

### 3. Presence Tracking
- ✅ Online/offline student status
- ✅ Active session counts
- ✅ Live concurrent users in workshops

### 4. Live Collaboration
- ✅ Co-instructor change notifications
- ✅ Workshop participant join/leave events
- ✅ Real-time Q&A updates

---

## 📊 Usage Examples

### Example 1: Show Unread Count in Sidebar

```tsx
import { useInstructorNotifications } from '@/lib/hooks/useRealtimeInstructor'

export default function Sidebar() {
  const { unreadCount } = useInstructorNotifications()

  return (
    <nav>
      <a href="/instructor/notifications">
        Notifications
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </a>
    </nav>
  )
}
```

### Example 2: Live Course Statistics

```tsx
import { useCourseStats } from '@/lib/hooks/useRealtimeInstructor'

export default function CourseCard({ courseId }) {
  const { stats } = useCourseStats(courseId)

  return (
    <div className="course-card">
      <h3>Course Stats</h3>
      <p>👥 {stats?.total_enrollments} students</p>
      <p>🎓 {stats?.completed_count} completed</p>
      <p>⭐ {stats?.average_rating} rating</p>
      <p>🟢 {stats?.online_students} online now</p>
    </div>
  )
}
```

### Example 3: Live Activity Feed

```tsx
import { useStudentActivity } from '@/lib/hooks/useRealtimeInstructor'

export default function ActivityFeed({ courseId }) {
  const { activities } = useStudentActivity(courseId)

  return (
    <div className="activity-feed">
      <h3>Recent Activity</h3>
      {activities.map(activity => (
        <div key={activity.id} className="activity-item">
          <img src={activity.student_avatar} alt={activity.student_name} />
          <div>
            <strong>{activity.student_name}</strong>
            <span>{activity.activity_type}</span>
            <small>{activity.created_at}</small>
          </div>
        </div>
      ))}
    </div>
  )
}
```

### Example 4: Workshop Presence

```tsx
import { usePresence } from '@/lib/hooks/useRealtimeInstructor'

export default function WorkshopLive({ workshopId }) {
  const { onlineUsers, totalOnline } = usePresence(undefined, workshopId)

  return (
    <div>
      <h3>🟢 {totalOnline} participants online</h3>
      <div className="avatars">
        {onlineUsers.map(user => (
          <img
            key={user.user_id}
            src={user.avatar}
            alt={user.name}
            title={user.name}
          />
        ))}
      </div>
    </div>
  )
}
```

---

## 🧪 Testing

### Test Database Triggers

```sql
-- Create a test enrollment (triggers notification)
INSERT INTO enrollments (user_id, course_id, status)
VALUES (
  'student-user-id',
  'course-id-where-you-are-instructor',
  'active'
);

-- Check if notification was created
SELECT * FROM notifications
WHERE user_id = 'your-instructor-user-id'
ORDER BY created_at DESC
LIMIT 1;
```

### Test Real-Time in Browser Console

```javascript
// Monitor all notifications
const channel = supabase
  .channel('test')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
  }, (payload) => {
    console.log('New notification:', payload)
  })
  .subscribe()
```

---

## 🔧 Configuration

### Enable Debug Mode

```tsx
<RealtimeProvider autoConnect={true} debug={true}>
  {children}
</RealtimeProvider>
```

This shows connection status indicator and logs to console.

### Filter Notifications by Type

```tsx
const { notifications } = useInstructorNotifications({
  type: ['enrollment', 'payment'], // Only enrollments and payments
  read: false, // Only unread
  dateFrom: '2025-10-01T00:00:00Z' // From Oct 1st
})
```

### Custom Notification Creation

```tsx
// POST /api/instructor/notifications
await fetch('/api/instructor/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'announcement',
    title: 'System Maintenance',
    message: 'Platform will be down for 1 hour',
    data: { maintenance_window: '2025-10-05 02:00-03:00' },
    expires_at: '2025-10-05T03:00:00Z'
  })
})
```

---

## 🔒 Security Features

- ✅ **Row Level Security (RLS)** - Users only see their own notifications
- ✅ **Ownership Verification** - Cannot modify/delete other users' notifications
- ✅ **Filtered Subscriptions** - Database-level filters reduce payload size
- ✅ **Automatic Cleanup** - Old notifications auto-deleted after 30 days
- ✅ **Presence Privacy** - Instructors only see presence for their courses/workshops

---

## 📈 Performance Optimizations

1. **Database Indexes** - Fast queries on user_id, created_at, read_at
2. **Filtered Subscriptions** - Only subscribe to relevant data
3. **Automatic Reconnection** - Exponential backoff for dropped connections
4. **View-Based Queries** - Pre-joined data via database views
5. **Pagination Support** - API supports limit/offset for large datasets
6. **Cleanup Jobs** - Scheduled removal of stale data

---

## 🐛 Common Issues

### Notifications not appearing?
1. Check RLS policies allow SELECT
2. Verify Realtime is enabled on table
3. Confirm user is authenticated

### Connection keeps dropping?
1. Enable debug mode to see logs
2. Check WebSocket isn't blocked by firewall
3. Verify Supabase project allows Realtime

### High database load?
1. Add filters to subscriptions
2. Limit concurrent channels
3. Run cleanup functions regularly

See full troubleshooting guide in `docs/REALTIME_INTEGRATION.md`

---

## 📚 API Reference

### Hooks

| Hook | Purpose | Returns |
|------|---------|---------|
| `useInstructorNotifications()` | Get real-time notifications | `{ notifications, unreadCount, markAsRead, ... }` |
| `useStudentActivity(courseId?)` | Get live student activity | `{ activities, loading, error, refetch }` |
| `useCourseStats(courseId)` | Get live course metrics | `{ stats, loading, error, refetch }` |
| `usePresence(courseId?, workshopId?)` | Track online users | `{ onlineUsers, totalOnline, updateStatus }` |
| `useWorkshopAttendance(workshopId)` | Track workshop attendance | `{ attendance, checkIn, refetch }` |

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/instructor/notifications` | GET | Fetch notifications with filters |
| `/api/instructor/notifications` | POST | Create notification |
| `/api/instructor/notifications/[id]` | PUT | Mark as read/unread |
| `/api/instructor/notifications/[id]` | DELETE | Delete notification |
| `/api/instructor/notifications/mark-all-read` | POST | Mark all as read |

---

## ✅ Production Checklist

- [ ] Database migration executed
- [ ] RLS policies verified
- [ ] RealtimeProvider added to layout
- [ ] InstructorNotifications component in header
- [ ] Error boundaries around real-time components
- [ ] Cleanup jobs scheduled (optional, requires pg_cron)
- [ ] Connection status UI implemented
- [ ] Offline fallback tested
- [ ] Performance testing completed
- [ ] Security audit done

---

## 🎉 Next Steps

1. **Add to existing pages** - Import hooks into your current instructor pages
2. **Customize notifications** - Modify triggers in migration file for custom events
3. **Style components** - Update InstructorNotifications.tsx to match your design system
4. **Add analytics** - Track notification engagement with your analytics tool
5. **Extend features** - Add broadcast channels for live messaging

---

## 📖 Full Documentation

See `docs/REALTIME_INTEGRATION.md` for:
- Complete integration guide
- Advanced examples
- Testing strategies
- Troubleshooting
- Best practices
- Production deployment guide

---

## 🆘 Support

If you encounter issues:
1. Check the full documentation
2. Review Supabase Realtime logs in dashboard
3. Enable debug mode to see connection status
4. Verify RLS policies in SQL editor

Happy coding! 🚀
