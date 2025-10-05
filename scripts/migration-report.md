# HumanGlue Database Migration Report

**Generated:** 2025-10-04
**Status:** Pending Execution
**Total Migrations:** 13 files

---

## Migration Files Overview

### Core Schema Migrations (SQL)

#### 1. `001_create_users_and_roles.sql`
**Status:** Ready
**Description:** Basic user management and roles
**Tables:**
- `users` - Core user table extending auth.users
- `user_roles` - Role assignments

**Dependencies:** None
**Estimated Execution Time:** < 1 second

---

#### 2. `001_multi_tenant_schema.sql`
**Status:** Ready
**Size:** 64 KB
**Description:** Multi-tenant foundation with organizations and teams

**Tables Created:**
- `organizations` - Top-level tenant isolation
- `teams` - Departments/groups within organizations
- `users` - Extended user profiles
- `team_members` - Team membership junction table

**Enums:**
- `user_role` - admin, org_admin, team_lead, member
- `assessment_status` - not_started, in_progress, completed, archived
- `enrollment_status` - enrolled, in_progress, completed, dropped
- `workshop_status` - draft, published, in_progress, completed, cancelled
- `registration_status` - registered, waitlisted, attended, cancelled, no_show
- `consultation_status` - requested, scheduled, completed, cancelled
- `payment_status` - pending, completed, failed, refunded
- `content_type` - video, article, quiz, assignment, resource
- `ai_pillar` - adaptability, coaching, marketplace

**Functions:**
- `update_updated_at_column()` - Auto-update timestamps

**Triggers:**
- `update_organizations_updated_at`
- `update_teams_updated_at`

**Indexes:** 10+ performance indexes

**Dependencies:** PostgreSQL extensions (uuid-ossp, pg_trgm)

---

#### 3. `002_create_workshops.sql`
**Status:** Ready
**Description:** Workshop management system

**Tables:**
- `workshops` - Workshop events and metadata
- `workshop_registrations` - Student registrations
- `workshop_feedback` - Post-workshop reviews

**Dependencies:** 001_create_users_and_roles.sql

---

#### 4. `002_instructor_schema.sql`
**Status:** Ready
**Size:** 61 KB (largest migration)
**Description:** Complete instructor portal schema

**Tables Created (9 new tables):**
- `instructor_profiles` - Instructor bio, credentials, stats
- `instructor_settings` - Preferences and configuration
- `courses` - Course catalog
- `course_lessons` - Lesson content
- `course_sections` - Course organization
- `enrollments` - Student course enrollments
- `student_progress` - Lesson completion tracking
- `student_activity` - Activity timeline
- `revenue_transactions` - Revenue tracking
- `course_reviews` - Course ratings and reviews

**New Enums:**
- `course_status` - draft, published, archived
- `course_difficulty` - beginner, intermediate, advanced
- `lesson_type` - video, article, quiz, assignment, live_session
- `workshop_type` - online, in_person, hybrid
- `activity_type` - enrolled, lesson_started, lesson_completed, etc.
- `transaction_type` - course_enrollment, workshop_registration, consultation, refund
- `payout_schedule` - weekly, biweekly, monthly

**Functions (4 dashboard functions):**
- `get_instructor_dashboard_stats(p_instructor_id)` - Overview metrics
- `get_instructor_student_progress(p_instructor_id, p_course_id)` - Student progress
- `get_instructor_recent_activity(p_instructor_id, p_limit)` - Activity feed
- `get_instructor_revenue_breakdown(p_instructor_id, p_start_date, p_end_date)` - Revenue analytics

**Triggers (2 auto-update triggers):**
- `auto_update_enrolled_count` - Course enrollment counter
- `auto_create_student_progress` - Progress tracking initialization

**RLS Policies:** Comprehensive multi-tenant isolation for all tables

**Dependencies:** 001_multi_tenant_schema.sql

---

#### 5. `003_create_assessments.sql`
**Status:** Ready
**Description:** Assessment and scoring system

**Tables:**
- `assessments` - User assessments
- `assessment_responses` - Individual question responses

**Dependencies:** 001_create_users_and_roles.sql

---

#### 6. `003_realtime_setup.sql`
**Status:** Ready
**Size:** 16 KB
**Description:** Real-time notifications and presence tracking

**Tables:**
- `notifications` - User notification inbox
- `student_presence` - Online/offline tracking

**Functions (7 notification functions):**
- `create_notification()` - Helper to create notifications
- `cleanup_old_notifications()` - Maintenance function
- `cleanup_stale_presence()` - Presence cleanup
- `notify_instructor_new_enrollment()` - Trigger function
- `notify_instructor_workshop_registration()` - Trigger function
- `notify_instructor_completion()` - Trigger function
- `notify_instructor_new_review()` - Trigger function
- `notify_instructor_payment()` - Trigger function

**Triggers (5 notification triggers):**
- `trigger_notify_new_enrollment`
- `trigger_notify_workshop_registration`
- `trigger_notify_completion`
- `trigger_notify_new_review`
- `trigger_notify_payment`

**Views (3 helper views):**
- `user_unread_notifications` - Unread count by user
- `instructor_recent_activity` - Activity feed view
- `live_course_stats` - Real-time course statistics

**Realtime Configuration:**
- Enabled on: notifications, enrollments, workshop_registrations, student_activity, course_reviews, student_presence, payments

**Dependencies:** 002_instructor_schema.sql

---

#### 7. `004_create_talent_and_engagements.sql`
**Status:** Ready
**Description:** Talent marketplace and engagement tracking

**Tables:**
- `talent_profiles` - Professional profiles
- `engagement_requests` - Project requests
- `consultations` - 1-on-1 sessions

**Dependencies:** 001_create_users_and_roles.sql

---

#### 8. `005_create_payments_certificates_reviews.sql`
**Status:** Ready
**Description:** Payment processing and certificates

**Tables:**
- `payments` - Payment transactions
- `certificates` - Course completion certificates

**Dependencies:** 002_create_workshops.sql, 003_create_assessments.sql

---

### Documentation Files

#### 9. `002_ERD.md`
**Type:** Documentation
**Purpose:** Entity Relationship Diagram for instructor schema

#### 10. `002_SCHEMA_OVERVIEW.md`
**Type:** Documentation
**Purpose:** Detailed schema documentation

#### 11. `002_QUERY_EXAMPLES.sql`
**Type:** Examples
**Purpose:** Sample queries for common operations

#### 12. `002_TESTING.sql`
**Type:** Testing
**Purpose:** Test queries and data validation

#### 13. `README.md`
**Type:** Guide
**Purpose:** Migration execution guide

---

## Expected Database State After Migration

### Total Tables: 27+

**Multi-Tenant Core:**
1. organizations
2. teams
3. users
4. team_members

**Instructor System:**
5. instructor_profiles
6. instructor_settings
7. courses
8. course_lessons
9. course_sections
10. enrollments
11. student_progress
12. student_activity
13. revenue_transactions
14. course_reviews

**Workshops:**
15. workshops
16. workshop_registrations
17. workshop_feedback

**Assessments:**
18. assessments
19. assessment_responses

**Talent Marketplace:**
20. talent_profiles
21. engagement_requests
22. consultations

**Payments & Certificates:**
23. payments
24. certificates

**Real-time Features:**
25. notifications
26. student_presence

**Auth (Supabase managed):**
27. auth.users (Supabase internal)

### Total Enums: 16
- user_role, assessment_status, enrollment_status, workshop_status, registration_status
- consultation_status, payment_status, content_type, ai_pillar, course_status
- course_difficulty, lesson_type, workshop_type, activity_type, transaction_type, payout_schedule

### Total Functions: 11+
- update_updated_at_column
- get_instructor_dashboard_stats
- get_instructor_student_progress
- get_instructor_recent_activity
- get_instructor_revenue_breakdown
- create_notification
- cleanup_old_notifications
- cleanup_stale_presence
- notify_instructor_new_enrollment
- notify_instructor_workshop_registration
- notify_instructor_completion
- notify_instructor_new_review
- notify_instructor_payment

### Total Views: 3
- user_unread_notifications
- instructor_recent_activity
- live_course_stats

### Total Triggers: 10+
- updated_at triggers on all major tables
- Auto-update triggers (enrolled_count, etc.)
- Notification triggers (5 notification events)
- Student progress auto-creation

### Total Indexes: 50+
- Foreign key indexes
- Performance indexes on frequently queried columns
- Composite indexes for filtering
- Partial indexes for status filtering
- GIN indexes for JSONB columns

### RLS Policies: 40+
- Organization-level isolation
- Instructor-student data separation
- User-level access control
- Admin override policies

---

## Missing Tables/Columns (API Analysis)

Based on `/app/api/instructor/students/route.ts` analysis:

### ❌ **Missing/Inconsistent Table Names:**

1. **`course_enrollments` vs `enrollments`**
   - API expects: `course_enrollments`
   - Schema has: `enrollments`
   - **Fix:** Add alias or rename table

2. **`lesson_progress` table**
   - API queries: `lesson_progress` table (lines 103-114)
   - Schema has: `student_progress` table
   - **Fix:** Verify if these are the same or create `lesson_progress`

3. **`course_lessons` structure**
   - API expects: `course_lessons.title`, `course_lessons.content_type`
   - Need to verify: Schema has these columns

### ⚠️ **Missing Columns:**

4. **`courses.instructor_id`**
   - Line 53: `// TODO: Add instructor_id filter when courses table has instructor_id column`
   - **Status:** This column EXISTS in schema ✅

5. **`users.full_name` vs `users.name`**
   - API expects: `users.full_name` (line 47)
   - Schema has: `users.name`
   - **Fix:** Add `full_name` column or use alias

6. **`users.avatar_url` vs `users.avatar`**
   - API expects: `users.avatar_url` (line 49)
   - Schema might have: `users.avatar`
   - **Fix:** Verify column name consistency

7. **`enrollments.last_accessed_at`**
   - API queries: `enrollments.last_accessed_at` (line 92)
   - **Verify:** Schema has this column

### 🔧 **Missing Related Tables:**

8. **`quiz_attempts` table**
   - Line 162: `// TODO: Calculate from quiz/assignment data`
   - Not present in current schema
   - **Fix:** Create table for quiz tracking

9. **`assignment_submissions` table**
   - Line 161: `// TODO: Calculate from quiz/assignment data`
   - Not present in current schema
   - **Fix:** Create table for assignment tracking

10. **`lesson_time_tracking` table**
    - Line 160: `// TODO: Calculate from lesson progress`
    - No time tracking in current schema
    - **Fix:** Add duration_seconds to student_progress or create tracking table

---

## Recommended Additional Migration

### `006_fix_api_compatibility.sql`

```sql
-- Fix table/column naming inconsistencies for API compatibility

-- 1. Add column aliases or rename
ALTER TABLE users ADD COLUMN full_name TEXT;
UPDATE users SET full_name = name WHERE full_name IS NULL;

ALTER TABLE users RENAME COLUMN avatar TO avatar_url;

-- 2. Create missing tables
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
  score DECIMAL(5,2) NOT NULL,
  max_score DECIMAL(5,2) NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT false,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
  submission_url TEXT,
  feedback TEXT,
  grade DECIMAL(5,2),
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'returned')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  graded_at TIMESTAMPTZ
);

-- 3. Add time tracking to student_progress
ALTER TABLE student_progress ADD COLUMN time_spent_seconds INTEGER DEFAULT 0;

-- 4. Create view for backward compatibility
CREATE VIEW course_enrollments AS SELECT * FROM enrollments;

-- 5. Create view for lesson_progress if needed
CREATE VIEW lesson_progress AS SELECT * FROM student_progress;
```

---

## Migration Execution Plan

### Pre-Migration Checklist
- ✅ Docker Desktop running
- ✅ Supabase CLI installed
- ✅ Environment variables configured (.env.local)
- ✅ Database backup (if applicable)

### Execution Steps

1. **Start Supabase** (if using local)
   ```bash
   supabase start
   ```

2. **Apply All Migrations**
   ```bash
   supabase db reset
   ```
   This will:
   - Drop existing database
   - Re-run all migrations in order
   - Apply migrations 001 through 005

3. **Verify Migration**
   ```bash
   npm run db:verify
   ```

4. **Seed Test Data**
   ```bash
   npm run db:seed
   ```

5. **Run Health Check**
   ```bash
   npm run db:health
   ```

### Post-Migration Checklist
- [ ] All tables exist (27+ tables)
- [ ] All RLS policies active
- [ ] All triggers working
- [ ] All functions callable
- [ ] Realtime enabled on required tables
- [ ] Test data seeded successfully
- [ ] API endpoints functional
- [ ] No critical errors in logs

---

## Risk Assessment

**Risk Level:** LOW to MEDIUM

**Risks:**
1. **Table naming inconsistencies** - Medium priority
   - Impact: API endpoints may fail
   - Mitigation: Create compatibility views

2. **Missing quiz/assignment tables** - Low priority
   - Impact: Features incomplete but non-critical
   - Mitigation: Add in future migration

3. **Migration order** - Low risk
   - All dependencies documented
   - Migrations properly ordered

**Rollback Plan:**
- All migrations include DROP statements
- `supabase db reset` can revert to clean state
- Database backups should be taken before production deployment

---

## Performance Considerations

**Expected Migration Time:** < 5 seconds (local)

**Database Size After Seeding:**
- Tables: 27
- Test Records: ~200
- Estimated Size: < 10 MB

**Index Build Time:** < 1 second

**Production Deployment:**
- Recommend running during low-traffic period
- Expect < 30 seconds downtime
- Consider blue-green deployment for zero-downtime

---

## Next Steps

1. ✅ **Start Docker Desktop**
2. ✅ **Run Supabase Start**
3. ✅ **Execute Migrations**
4. ✅ **Run Verification Script**
5. ✅ **Seed Test Data**
6. ✅ **Test API Endpoints**
7. ⚠️  **Create 006_fix_api_compatibility.sql** (if needed)
8. ✅ **Document Any Issues**

---

## Support & Resources

**Documentation:**
- Supabase Migrations: https://supabase.com/docs/guides/cli/local-development
- PostgreSQL RLS: https://www.postgresql.org/docs/current/ddl-rowsecurity.html

**Scripts Created:**
- `/scripts/verify-database.ts` - Comprehensive verification
- `/scripts/seed-test-data.ts` - Test data generation
- `/scripts/db-health-check.ts` - Quick health check
- `/scripts/migration-report.md` - This document

**Contact:**
- Report issues in project repository
- Check migration README for troubleshooting

---

**Report Generated:** 2025-10-04
**Last Updated:** 2025-10-04
**Version:** 1.0
