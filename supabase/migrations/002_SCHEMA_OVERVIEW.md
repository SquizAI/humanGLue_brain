# Instructor Dashboard Database Schema Overview

## Migration: 002_instructor_schema.sql

This document provides a comprehensive overview of the instructor dashboard database schema, including design decisions, relationships, and usage patterns.

---

## Table of Contents

1. [Schema Design Philosophy](#schema-design-philosophy)
2. [Table Relationships](#table-relationships)
3. [New Tables](#new-tables)
4. [Enhanced Existing Tables](#enhanced-existing-tables)
5. [Row Level Security Strategy](#row-level-security-strategy)
6. [Triggers and Automation](#triggers-and-automation)
7. [Helper Functions](#helper-functions)
8. [Performance Optimization](#performance-optimization)
9. [Multi-Tenant Considerations](#multi-tenant-considerations)

---

## Schema Design Philosophy

### Core Principles

1. **Multi-Tenant Data Isolation**: All tables support both standalone instructors (no `organization_id`) and organization-linked instructors
2. **Automatic Stats Tracking**: Enrollment counts, ratings, revenue are auto-updated via triggers
3. **Comprehensive RLS**: Every table has row-level security policies for instructor isolation
4. **Audit Trail**: All activity is logged in `student_activity` table
5. **Performance-First**: Strategic indexing for common query patterns
6. **Data Integrity**: CHECK constraints, foreign keys, and triggers ensure data validity

### Design Decisions

- **UUID Primary Keys**: For distributed systems and better scalability
- **JSONB for Flexibility**: Used for settings, metadata, and dynamic fields (education, certifications)
- **Enum Types**: For status fields to ensure data consistency
- **Denormalization**: Stats fields (enrolled_count, average_rating) are denormalized for performance
- **Trigger-Based Updates**: Automatic recalculation of aggregates when source data changes

---

## Table Relationships

### Entity Relationship Diagram (ERD)

```
users (from 001_migration)
  |
  |-- instructor_profiles (1:1)
  |     |
  |     |-- courses (1:N) via instructor_id
  |     |     |
  |     |     |-- course_modules (1:N)
  |     |     |     |
  |     |     |     |-- course_lessons (1:N)
  |     |     |
  |     |     |-- course_enrollments (1:N)
  |     |     |     |
  |     |     |     |-- student_progress (1:1)
  |     |     |     |-- lesson_progress (1:N)
  |     |     |
  |     |     |-- course_reviews (1:N)
  |     |     |-- course_instructors (N:N) - co-teaching
  |     |
  |     |-- workshops (1:N) via instructor_id
  |     |     |
  |     |     |-- workshop_registrations (1:N)
  |     |     |-- workshop_feedback (1:N)
  |     |     |-- workshop_facilitators (N:N)
  |     |
  |     |-- revenue_transactions (1:N)
  |     |-- student_activity (1:N)
  |
  |-- instructor_settings (1:1)

organizations (from 001_migration)
  |
  |-- courses (1:N) via organization_id (optional)
  |-- workshops (1:N) via organization_id (optional)
```

---

## New Tables

### 1. instructor_profiles

**Purpose**: Extended instructor information beyond the basic `users` table.

**Key Fields**:
- `bio`: 50-2000 character biography (enforced via CHECK constraint)
- `expertise_tags[]`: Array of expertise areas
- `pillars[]`: Array of AI pillars (adaptability, coaching, marketplace)
- `education`, `certifications`, `work_experience`: JSONB arrays of objects
- `social_links`: JSONB object with social media URLs
- **Auto-updated stats**: `total_students`, `total_courses`, `total_workshops`, `average_rating`, `total_reviews`

**Design Notes**:
- Stats are updated via triggers when courses/workshops/reviews change
- GIN indexes on array fields for fast searching
- Supports instructor verification and featured status

**Example Usage**:
```sql
SELECT * FROM instructor_profiles WHERE 'AI Transformation' = ANY(expertise_tags);
SELECT * FROM instructor_profiles WHERE 'adaptability' = ANY(pillars) AND is_verified = true;
```

---

### 2. instructor_settings

**Purpose**: User preferences for notifications, teaching, privacy, and payment settings.

**Key Fields**:
- `email_notifications`, `push_notifications`: JSONB objects with granular preferences
- `auto_approve_enrollments`, `allow_student_questions`, `allow_course_reviews`: Boolean preferences
- `payment_method`, `payment_details`, `payout_schedule`: Payment configuration
- `calendar_sync_enabled`, `calendar_provider`: Calendar integration

**Design Notes**:
- All notification settings default to sensible values (ON for important events)
- Payment details should be encrypted at application layer before storage
- One row per instructor (1:1 relationship)

**Example Usage**:
```sql
UPDATE instructor_settings
SET email_notifications = email_notifications || '{"new_enrollment": false}'::jsonb
WHERE user_id = 'xxx';
```

---

### 3. student_progress

**Purpose**: Aggregated progress tracking per student per course.

**Key Fields**:
- `total_lessons`, `completed_lessons`, `progress_percentage`
- `total_watch_time_seconds`, `last_activity_at`
- `total_quizzes`, `passed_quizzes`, `average_quiz_score`
- `engagement_score`: 0-100 based on activity (comments, questions, watch time)
- `certificate_url`: Generated when course completed

**Design Notes**:
- Auto-created when enrollment is created (via trigger)
- Auto-updated when `lesson_progress` changes (via trigger)
- Unique constraint on `(user_id, course_id)`
- Separate from `course_enrollments` for cleaner separation of concerns

**Example Usage**:
```sql
-- Get all students struggling (< 30% progress after 7 days)
SELECT * FROM student_progress
WHERE course_id = 'xxx'
AND progress_percentage < 30
AND created_at < now() - INTERVAL '7 days';
```

---

### 4. student_activity

**Purpose**: Timeline of all student activities for the instructor dashboard.

**Key Fields**:
- `activity_type`: Enum (enrolled, lesson_started, lesson_completed, quiz_passed, etc.)
- `instructor_id`: For efficient filtering by instructor
- `student_id`: The student who performed the action
- `course_id`, `workshop_id`, `lesson_id`: Related entities (nullable)
- `metadata`: JSONB for additional context (quiz_score, assignment_grade, etc.)

**Design Notes**:
- Indexed on `(instructor_id, occurred_at DESC)` for fast timeline queries
- Activities are logged via triggers when enrollments/progress changes
- Can be partitioned by `occurred_at` for performance at scale

**Example Usage**:
```sql
-- Get recent activity for instructor
SELECT * FROM student_activity
WHERE instructor_id = 'xxx'
ORDER BY occurred_at DESC
LIMIT 50;
```

---

### 5. revenue_transactions

**Purpose**: Track all revenue transactions with platform fee calculations.

**Key Fields**:
- `amount`: Total transaction amount
- `platform_fee_percentage`, `platform_fee_amount`: Platform's cut (default 20%)
- `instructor_earnings`: Amount instructor receives after fees
- `course_id`, `workshop_id`, `enrollment_id`, `workshop_registration_id`: Related entities
- `payment_status`: Enum (pending, completed, failed, refunded)
- `payout_status`, `payout_date`: When instructor was paid

**Design Notes**:
- Auto-created via triggers when enrollments/registrations are paid
- Supports refunds (negative amounts)
- Indexed on `(instructor_id, transaction_date DESC)` for analytics
- Separate payout tracking for instructor payments

**Example Usage**:
```sql
-- Get monthly revenue breakdown
SELECT
  DATE_TRUNC('month', transaction_date) AS month,
  COUNT(*) AS transaction_count,
  SUM(amount) AS gross_revenue,
  SUM(instructor_earnings) AS net_revenue
FROM revenue_transactions
WHERE instructor_id = 'xxx'
AND payment_status = 'completed'
GROUP BY month
ORDER BY month DESC;
```

---

### 6. course_reviews

**Purpose**: Student reviews and ratings for courses.

**Key Fields**:
- `rating`: Overall rating (1-5 stars)
- `title`, `review_text`: Review content
- `content_quality_rating`, `instructor_rating`, `value_rating`: Breakdown ratings
- `instructor_response`, `instructor_responded_at`: Instructor can respond
- `helpful_count`: Community helpfulness votes
- `is_verified_purchase`: Always true (must have enrollment)

**Design Notes**:
- Unique constraint on `(course_id, user_id)` - one review per student per course
- Can only review completed courses (enforced in RLS policy)
- Average rating auto-updated on courses table via trigger
- Instructors can respond to reviews

**Example Usage**:
```sql
-- Get unanswered reviews for instructor
SELECT * FROM course_reviews cr
JOIN courses c ON cr.course_id = c.id
WHERE c.instructor_id = 'xxx'
AND cr.instructor_response IS NULL
ORDER BY cr.created_at DESC;
```

---

### 7. workshop_feedback

**Purpose**: Post-workshop satisfaction surveys.

**Key Fields**:
- `overall_satisfaction`: 1-5 stars
- `content_rating`, `delivery_rating`, `interaction_rating`: Breakdown ratings
- `what_went_well`, `what_could_improve`: Text feedback
- `nps_score`: Net Promoter Score (0-10)
- `would_recommend`: Boolean

**Design Notes**:
- Only attendees can submit feedback (enforced in RLS)
- Unique constraint on `(workshop_id, user_id)`
- Average satisfaction auto-updated on workshops table via trigger
- NPS score useful for tracking workshop quality over time

---

### 8. course_instructors (Junction Table)

**Purpose**: Support for co-teaching (multiple instructors per course).

**Key Fields**:
- `course_id`, `instructor_id`: Many-to-many relationship
- `role`: Enum (primary, co-instructor, assistant)
- `permissions`: JSONB with granular permissions (edit_content, manage_students, etc.)

**Design Notes**:
- Primary instructor is in `courses.instructor_id`
- Additional instructors are in this table
- RLS policies check both primary instructor and co-instructors
- Permissions control what co-instructors can do

---

### 9. workshop_facilitators (Junction Table)

**Purpose**: Support for multiple facilitators per workshop.

**Key Fields**:
- `workshop_id`, `facilitator_id`: Many-to-many relationship
- `role`: Enum (primary, co-facilitator, assistant)

**Design Notes**:
- Similar to `course_instructors` but for workshops
- Primary facilitator is in `workshops.instructor_id`

---

## Enhanced Existing Tables

### courses (from 001_migration)

**New Columns**:
- `instructor_id`: Link to instructor (replaces text fields)
- `organization_id`: Optional org link (NULL for standalone instructors)
- `status`: Enum (draft, published, archived)
- `category`, `tags[]`: Better categorization
- `what_you_will_learn[]`, `target_audience[]`: Marketing fields
- `enrolled_count`, `completed_count`, `average_rating`, `review_count`: Auto-updated stats
- `total_revenue`: Auto-updated when payments received
- `certificate_enabled`, `certificate_template_url`: Certificate settings
- `allow_comments`, `allow_qa`: Instructor preferences
- `drip_content`, `drip_schedule`: Content release scheduling

**Design Notes**:
- Stats columns are denormalized for performance (updated via triggers)
- Supports both free and paid courses (price_amount can be 0)
- RLS policies ensure instructors only see their own courses

---

### workshops (from 001_migration)

**New Columns**:
- `organization_id`: Optional org link
- `type`: Enum (online, in_person, hybrid)
- `tags[]`, `prerequisites[]`, `what_you_will_learn[]`: Better metadata
- `enrolled_count`, `attended_count`, `average_satisfaction`, `feedback_count`: Auto-updated stats
- `total_revenue`: Auto-updated when payments received
- `certificate_enabled`, `certificate_template_url`: Certificate settings

---

## Row Level Security Strategy

### Isolation Levels

1. **Instructor Isolation**: Instructors can only access their own data
2. **Student Isolation**: Students can only access their own enrollments/progress
3. **Organization Isolation**: Org admins can view data for their org (if applicable)
4. **Platform Admins**: Full access to all data

### Policy Patterns

**Instructor-Owned Resources** (courses, workshops):
```sql
-- Instructors can view their own courses
USING (instructor_id = auth.uid() OR ...)

-- Instructors can create courses
WITH CHECK (instructor_id = auth.uid())
```

**Student-Owned Resources** (enrollments, progress, reviews):
```sql
-- Students can view their own enrollments
USING (user_id = auth.uid())

-- Instructors can view enrollments for their courses
USING (course_id IN (SELECT id FROM courses WHERE instructor_id = auth.uid()))
```

**Public Resources** (published courses/workshops):
```sql
-- Anyone can view published courses
USING (is_published = true)
```

**Co-Teaching Support**:
```sql
-- Co-instructors can view courses based on permissions
USING (
  instructor_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM course_instructors
    WHERE course_id = courses.id
    AND instructor_id = auth.uid()
    AND (permissions->>'view_content')::boolean = true
  )
)
```

---

## Triggers and Automation

### Auto-Create Triggers

1. **create_student_progress_trigger**
   - When: `course_enrollments` INSERT
   - Action: Create `student_progress` record with initial stats

2. **log_enrollment_activity_trigger**
   - When: `course_enrollments` INSERT/UPDATE
   - Action: Log activity to `student_activity` table

### Auto-Update Triggers

3. **update_student_progress_from_lesson_trigger**
   - When: `lesson_progress` INSERT/UPDATE
   - Action: Recalculate `student_progress` stats (completed_lessons, progress_percentage, etc.)

4. **update_course_enrollment_stats_trigger**
   - When: `course_enrollments` INSERT/UPDATE/DELETE
   - Action: Update `courses` stats (enrolled_count, completed_count)

5. **update_workshop_registration_stats_trigger**
   - When: `workshop_registrations` INSERT/UPDATE/DELETE
   - Action: Update `workshops` stats (enrolled_count, attended_count)

6. **update_course_rating_trigger**
   - When: `course_reviews` INSERT/UPDATE/DELETE
   - Action: Recalculate `courses.average_rating` and `review_count`

7. **update_workshop_satisfaction_trigger**
   - When: `workshop_feedback` INSERT/UPDATE/DELETE
   - Action: Recalculate `workshops.average_satisfaction` and `feedback_count`

8. **update_instructor_stats_trigger** (3 triggers)
   - When: `courses`, `workshops`, `course_enrollments` INSERT/UPDATE/DELETE
   - Action: Recalculate `instructor_profiles` stats (total_students, total_courses, average_rating, etc.)

### Revenue Triggers

9. **create_revenue_transaction_from_enrollment_trigger**
   - When: `course_enrollments` status changes to 'enrolled'
   - Action: Create `revenue_transactions` record, update `courses.total_revenue`

10. **create_revenue_transaction_from_workshop_trigger**
    - When: `workshop_registrations` payment_status = 'completed'
    - Action: Create `revenue_transactions` record, update `workshops.total_revenue`

---

## Helper Functions

### 1. get_instructor_dashboard_stats(instructor_id)

Returns overview stats for instructor dashboard home page:
- Total students, courses, workshops
- Total revenue, pending revenue
- Average rating, total reviews
- Active enrollments, upcoming workshops

**Usage**:
```sql
SELECT * FROM get_instructor_dashboard_stats('xxx');
```

---

### 2. get_instructor_student_progress(instructor_id, course_id)

Returns student progress for all courses (or specific course):
- Student info (name, email, avatar)
- Course info
- Progress percentage, last activity
- Enrollment status

**Usage**:
```sql
-- All students for instructor
SELECT * FROM get_instructor_student_progress('xxx');

-- Students for specific course
SELECT * FROM get_instructor_student_progress('xxx', 'course-id');
```

---

### 3. get_instructor_revenue_breakdown(instructor_id, start_date, end_date)

Returns revenue breakdown by transaction type:
- Transaction type (course_enrollment, workshop_registration, etc.)
- Transaction count
- Total amount, fees, earnings

**Usage**:
```sql
-- Last 30 days
SELECT * FROM get_instructor_revenue_breakdown(
  'xxx',
  now() - INTERVAL '30 days',
  now()
);
```

---

### 4. get_instructor_recent_activity(instructor_id, limit)

Returns recent student activity timeline:
- Student info
- Activity type and description
- Related course/workshop
- Timestamp

**Usage**:
```sql
-- Last 50 activities
SELECT * FROM get_instructor_recent_activity('xxx', 50);
```

---

## Performance Optimization

### Indexing Strategy

**Single Column Indexes**:
- All foreign keys (instructor_id, course_id, user_id, etc.)
- Status fields (course.status, workshop.status, etc.)
- Timestamp fields (created_at, occurred_at, transaction_date)

**Composite Indexes** (for multi-column queries):
```sql
CREATE INDEX idx_student_progress_course_activity
  ON student_progress(course_id, last_activity_at DESC);

CREATE INDEX idx_revenue_instructor_date
  ON revenue_transactions(instructor_id, transaction_date DESC);

CREATE INDEX idx_student_activity_instructor_occurred
  ON student_activity(instructor_id, occurred_at DESC);
```

**Partial Indexes** (for filtered queries):
```sql
CREATE INDEX idx_courses_instructor_published
  ON courses(instructor_id) WHERE status = 'published';

CREATE INDEX idx_workshops_instructor_upcoming
  ON workshops(instructor_id, start_time)
  WHERE status = 'published' AND start_time > now();

CREATE INDEX idx_enrollments_active
  ON course_enrollments(course_id, user_id)
  WHERE status IN ('enrolled', 'in_progress');
```

**GIN Indexes** (for array/JSONB fields):
```sql
CREATE INDEX idx_instructor_profiles_expertise
  ON instructor_profiles USING GIN(expertise_tags);

CREATE INDEX idx_courses_tags
  ON courses USING GIN(tags);
```

### Query Performance Tips

1. **Use Materialized Views** for expensive aggregations:
   ```sql
   CREATE MATERIALIZED VIEW instructor_monthly_stats AS
   SELECT ...
   -- Refresh daily via cron job
   ```

2. **Partition Large Tables** by date:
   ```sql
   -- Partition student_activity by occurred_at
   -- Partition revenue_transactions by transaction_date
   ```

3. **Use EXPLAIN ANALYZE** to identify slow queries:
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM get_instructor_dashboard_stats('xxx');
   ```

---

## Multi-Tenant Considerations

### Standalone vs Organization-Linked Instructors

**Standalone Instructors**:
- `organization_id` is NULL on courses/workshops
- No org admin can view their data
- Full independence

**Organization-Linked Instructors**:
- `organization_id` is set on courses/workshops
- Org admins can view their data (via RLS policies)
- Can be part of teams
- May have org-level subscription benefits

### RLS Policies Handle Both Cases

Policies check both instructor ownership AND org admin access:

```sql
CREATE POLICY "Instructors can view their courses"
  ON courses FOR SELECT
  USING (
    -- Instructor owns the course
    instructor_id = auth.uid()
    -- OR org admin for this org
    OR organization_id IN (
      SELECT organization_id FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'org_admin')
    )
  );
```

### Data Isolation

- Instructors in different orgs cannot see each other's data
- Standalone instructors cannot see org data
- Students can only see their own enrollments
- Platform admins (role='admin') have full access

---

## API Endpoint Support

This schema supports all 29 API endpoints for the instructor portal:

### Dashboard Endpoints
- `GET /api/instructor/dashboard` → `get_instructor_dashboard_stats()`
- `GET /api/instructor/analytics/overview` → Aggregates from multiple tables

### Course Management
- `GET /api/instructor/courses` → `courses` table with filters
- `POST /api/instructor/courses` → Insert into `courses`
- `GET /api/instructor/courses/[id]` → Single course
- `PUT /api/instructor/courses/[id]` → Update course
- `DELETE /api/instructor/courses/[id]` → Delete course

### Workshop Management
- `GET /api/instructor/workshops` → `workshops` table
- `POST /api/instructor/workshops` → Insert workshop
- Similar CRUD operations...

### Student Management
- `GET /api/instructor/students` → `get_instructor_student_progress()`
- `GET /api/instructor/students/[id]` → Single student progress
- `GET /api/instructor/students/activity` → `get_instructor_recent_activity()`

### Revenue/Analytics
- `GET /api/instructor/analytics/revenue` → `get_instructor_revenue_breakdown()`
- `GET /api/instructor/analytics/students` → Aggregate from `student_progress`
- `GET /api/instructor/analytics/engagement` → `student_engagement_summary` view

### Profile/Settings
- `GET /api/instructor/profile` → `instructor_profiles` table
- `PUT /api/instructor/profile` → Update profile
- `GET /api/instructor/settings` → `instructor_settings` table
- `PUT /api/instructor/settings` → Update settings

---

## Next Steps

1. **Run Migration**: Execute `002_instructor_schema.sql` in Supabase
2. **Test RLS Policies**: Verify data isolation works correctly
3. **Generate TypeScript Types**: Use Supabase CLI to generate types
4. **Create API Routes**: Implement API endpoints using these tables
5. **Add Seed Data**: Create test instructors, courses, workshops
6. **Performance Testing**: Load test with realistic data volumes
7. **Setup Monitoring**: Track slow queries and index usage

---

## Support and Maintenance

### Common Maintenance Tasks

**Rebuild Instructor Stats**:
```sql
-- If stats get out of sync, rebuild them
UPDATE instructor_profiles ip
SET
  total_students = (SELECT COUNT(DISTINCT ce.user_id) FROM course_enrollments ce JOIN courses c ON ce.course_id = c.id WHERE c.instructor_id = ip.user_id),
  total_courses = (SELECT COUNT(*) FROM courses WHERE instructor_id = ip.user_id AND status = 'published'),
  -- ... etc
WHERE user_id = 'xxx';
```

**Archive Old Activity**:
```sql
-- Archive activity older than 1 year
DELETE FROM student_activity
WHERE occurred_at < now() - INTERVAL '1 year';
```

**Vacuum and Analyze**:
```sql
-- Run periodically for performance
VACUUM ANALYZE courses;
VACUUM ANALYZE student_progress;
VACUUM ANALYZE revenue_transactions;
```

---

## Schema Version

- **Version**: 002
- **Created**: 2025-10-04
- **Dependencies**: 001_multi_tenant_schema.sql
- **Compatible With**: Supabase PostgreSQL 15+

---

## Questions or Issues?

For schema questions or issues:
1. Check this documentation
2. Review RLS policies in the migration file
3. Test with EXPLAIN ANALYZE
4. Consult Supabase docs: https://supabase.com/docs
