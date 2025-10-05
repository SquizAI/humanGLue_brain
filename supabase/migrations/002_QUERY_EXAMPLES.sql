-- =====================================================
-- INSTRUCTOR DASHBOARD - SQL QUERY EXAMPLES
-- =====================================================
-- Common queries for the instructor dashboard API endpoints
-- Use these as reference when implementing API routes
-- =====================================================

-- =====================================================
-- INSTRUCTOR PROFILE QUERIES
-- =====================================================

-- Get instructor profile with stats
SELECT
  ip.*,
  u.full_name,
  u.email,
  u.avatar_url,
  u.timezone
FROM instructor_profiles ip
JOIN users u ON ip.user_id = u.id
WHERE u.id = 'instructor-user-id';

-- Create new instructor profile
INSERT INTO instructor_profiles (
  user_id,
  bio,
  professional_title,
  expertise_tags,
  pillars
) VALUES (
  'user-id',
  'A passionate AI transformation expert...',
  'AI Transformation Consultant',
  ARRAY['AI Strategy', 'Change Management', 'Leadership'],
  ARRAY['adaptability', 'coaching']::ai_pillar[]
);

-- Update instructor profile
UPDATE instructor_profiles
SET
  bio = 'Updated bio...',
  expertise_tags = ARRAY['New', 'Tags'],
  social_links = social_links || '{"linkedin": "https://linkedin.com/in/xxx"}'::jsonb
WHERE user_id = 'instructor-user-id';

-- Search instructors by expertise
SELECT *
FROM instructor_profiles
WHERE 'AI Transformation' = ANY(expertise_tags)
AND is_verified = true
ORDER BY average_rating DESC NULLS LAST
LIMIT 20;

-- =====================================================
-- DASHBOARD OVERVIEW QUERIES
-- =====================================================

-- Get complete dashboard overview (use helper function)
SELECT * FROM get_instructor_dashboard_stats('instructor-user-id');

-- Manual dashboard stats (if you need custom fields)
SELECT
  -- Student stats
  (SELECT COUNT(DISTINCT ce.user_id)
   FROM course_enrollments ce
   JOIN courses c ON ce.course_id = c.id
   WHERE c.instructor_id = 'instructor-user-id') AS total_students,

  -- Course stats
  (SELECT COUNT(*) FROM courses
   WHERE instructor_id = 'instructor-user-id'
   AND status = 'published') AS published_courses,

  (SELECT COUNT(*) FROM courses
   WHERE instructor_id = 'instructor-user-id'
   AND status = 'draft') AS draft_courses,

  -- Revenue stats
  (SELECT COALESCE(SUM(instructor_earnings), 0)
   FROM revenue_transactions
   WHERE instructor_id = 'instructor-user-id'
   AND payment_status = 'completed') AS total_earnings,

  (SELECT COALESCE(SUM(instructor_earnings), 0)
   FROM revenue_transactions
   WHERE instructor_id = 'instructor-user-id'
   AND payment_status = 'completed'
   AND transaction_date >= DATE_TRUNC('month', CURRENT_DATE)) AS monthly_earnings,

  -- Engagement stats
  (SELECT COUNT(*)
   FROM course_enrollments ce
   JOIN courses c ON ce.course_id = c.id
   WHERE c.instructor_id = 'instructor-user-id'
   AND ce.status IN ('enrolled', 'in_progress')) AS active_enrollments,

  (SELECT COUNT(*)
   FROM workshops
   WHERE instructor_id = 'instructor-user-id'
   AND status = 'published'
   AND start_time > NOW()) AS upcoming_workshops;

-- =====================================================
-- COURSE MANAGEMENT QUERIES
-- =====================================================

-- List instructor's courses with stats
SELECT
  c.*,
  ROUND((c.completed_count::DECIMAL / NULLIF(c.enrolled_count, 0)::DECIMAL) * 100, 2) AS completion_rate,
  (SELECT COUNT(*) FROM course_reviews WHERE course_id = c.id AND is_published = true) AS review_count
FROM courses c
WHERE c.instructor_id = 'instructor-user-id'
ORDER BY c.created_at DESC;

-- Get single course with detailed stats
SELECT
  c.*,
  -- Enrollment stats
  (SELECT COUNT(*) FROM course_enrollments WHERE course_id = c.id AND status = 'enrolled') AS active_students,
  (SELECT COUNT(*) FROM course_enrollments WHERE course_id = c.id AND status = 'completed') AS completed_students,

  -- Progress stats
  (SELECT AVG(progress_percentage) FROM student_progress WHERE course_id = c.id) AS avg_progress,

  -- Recent activity
  (SELECT COUNT(*)
   FROM course_enrollments
   WHERE course_id = c.id
   AND enrolled_at > NOW() - INTERVAL '7 days') AS new_enrollments_7d,

  -- Module and lesson count
  (SELECT COUNT(*) FROM course_modules WHERE course_id = c.id) AS module_count,
  (SELECT COUNT(*)
   FROM course_lessons cl
   JOIN course_modules cm ON cl.module_id = cm.id
   WHERE cm.course_id = c.id) AS lesson_count

FROM courses c
WHERE c.id = 'course-id'
AND c.instructor_id = 'instructor-user-id';

-- Create new course
INSERT INTO courses (
  instructor_id,
  title,
  slug,
  description,
  pillar,
  level,
  price_amount,
  status,
  category,
  tags,
  what_you_will_learn
) VALUES (
  'instructor-user-id',
  'AI Transformation Fundamentals',
  'ai-transformation-fundamentals',
  'Learn the fundamentals...',
  'adaptability',
  'beginner',
  99.00,
  'draft',
  'AI Strategy',
  ARRAY['AI', 'Digital Transformation', 'Strategy'],
  ARRAY[
    'Understand AI transformation principles',
    'Build an AI roadmap',
    'Lead AI initiatives'
  ]
)
RETURNING *;

-- Update course
UPDATE courses
SET
  title = 'Updated Title',
  description = 'Updated description',
  status = 'published',
  published_at = CASE WHEN status = 'draft' THEN NOW() ELSE published_at END
WHERE id = 'course-id'
AND instructor_id = 'instructor-user-id'
RETURNING *;

-- Delete course (only if no enrollments)
DELETE FROM courses
WHERE id = 'course-id'
AND instructor_id = 'instructor-user-id'
AND enrolled_count = 0;

-- Publish course
UPDATE courses
SET
  status = 'published',
  is_published = true,
  published_at = NOW()
WHERE id = 'course-id'
AND instructor_id = 'instructor-user-id'
AND status = 'draft';

-- Archive course
UPDATE courses
SET status = 'archived'
WHERE id = 'course-id'
AND instructor_id = 'instructor-user-id';

-- =====================================================
-- COURSE CONTENT QUERIES (Modules & Lessons)
-- =====================================================

-- Get course structure with modules and lessons
SELECT
  c.id AS course_id,
  c.title AS course_title,
  jsonb_agg(
    jsonb_build_object(
      'id', cm.id,
      'title', cm.title,
      'sort_order', cm.sort_order,
      'lessons', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', cl.id,
            'title', cl.title,
            'content_type', cl.content_type,
            'sort_order', cl.sort_order,
            'is_preview', cl.is_preview
          )
          ORDER BY cl.sort_order
        )
        FROM course_lessons cl
        WHERE cl.module_id = cm.id
      )
    )
    ORDER BY cm.sort_order
  ) AS modules
FROM courses c
JOIN course_modules cm ON c.id = cm.course_id
WHERE c.id = 'course-id'
AND c.instructor_id = 'instructor-user-id'
GROUP BY c.id, c.title;

-- Create course module
INSERT INTO course_modules (
  course_id,
  title,
  description,
  sort_order
) VALUES (
  'course-id',
  'Module 1: Introduction',
  'Get started with the basics',
  1
)
RETURNING *;

-- Create course lesson
INSERT INTO course_lessons (
  module_id,
  title,
  description,
  content_type,
  video_url,
  video_duration_seconds,
  sort_order
) VALUES (
  'module-id',
  'Lesson 1: Welcome',
  'Welcome to the course',
  'video',
  'https://storage.supabase.co/course-content/xxx.mp4',
  600,
  1
)
RETURNING *;

-- =====================================================
-- STUDENT MANAGEMENT QUERIES
-- =====================================================

-- List all students for instructor (across all courses)
SELECT
  u.id,
  u.full_name,
  u.email,
  u.avatar_url,
  COUNT(DISTINCT sp.course_id) AS enrolled_courses,
  AVG(sp.progress_percentage) AS avg_progress,
  MAX(sp.last_activity_at) AS last_activity,
  SUM(sp.completed_lessons) AS total_lessons_completed
FROM users u
JOIN student_progress sp ON u.id = sp.user_id
JOIN courses c ON sp.course_id = c.id
WHERE c.instructor_id = 'instructor-user-id'
GROUP BY u.id, u.full_name, u.email, u.avatar_url
ORDER BY MAX(sp.last_activity_at) DESC NULLS LAST;

-- Get students for specific course
SELECT * FROM get_instructor_student_progress('instructor-user-id', 'course-id')
ORDER BY last_activity_at DESC NULLS LAST;

-- Get single student details
SELECT
  u.id,
  u.full_name,
  u.email,
  u.avatar_url,
  sp.course_id,
  c.title AS course_title,
  sp.progress_percentage,
  sp.completed_lessons,
  sp.total_lessons,
  sp.total_watch_time_seconds,
  sp.last_activity_at,
  ce.enrolled_at,
  ce.status,
  ce.completed_at
FROM users u
JOIN student_progress sp ON u.id = sp.user_id
JOIN courses c ON sp.course_id = c.id
JOIN course_enrollments ce ON sp.enrollment_id = ce.id
WHERE u.id = 'student-user-id'
AND c.instructor_id = 'instructor-user-id';

-- Get student's lesson-by-lesson progress
SELECT
  cm.title AS module_title,
  cl.title AS lesson_title,
  cl.content_type,
  lp.is_completed,
  lp.completion_percentage,
  lp.time_spent_seconds,
  lp.quiz_score,
  lp.last_accessed_at
FROM lesson_progress lp
JOIN course_lessons cl ON lp.lesson_id = cl.id
JOIN course_modules cm ON cl.module_id = cm.id
JOIN course_enrollments ce ON lp.enrollment_id = ce.id
WHERE ce.user_id = 'student-user-id'
AND ce.course_id = 'course-id'
ORDER BY cm.sort_order, cl.sort_order;

-- Find struggling students (< 30% progress after 7+ days)
SELECT
  u.full_name,
  u.email,
  c.title AS course_title,
  sp.progress_percentage,
  sp.last_activity_at,
  ce.enrolled_at,
  EXTRACT(DAY FROM NOW() - ce.enrolled_at) AS days_enrolled
FROM student_progress sp
JOIN course_enrollments ce ON sp.enrollment_id = ce.id
JOIN users u ON sp.user_id = u.id
JOIN courses c ON sp.course_id = c.id
WHERE c.instructor_id = 'instructor-user-id'
AND sp.progress_percentage < 30
AND ce.enrolled_at < NOW() - INTERVAL '7 days'
AND ce.status IN ('enrolled', 'in_progress')
ORDER BY ce.enrolled_at ASC;

-- =====================================================
-- STUDENT ACTIVITY QUERIES
-- =====================================================

-- Get recent activity timeline
SELECT * FROM get_instructor_recent_activity('instructor-user-id', 50);

-- Manual activity query with filters
SELECT
  sa.*,
  u.full_name AS student_name,
  u.avatar_url AS student_avatar,
  c.title AS course_title,
  w.title AS workshop_title
FROM student_activity sa
JOIN users u ON sa.student_id = u.id
LEFT JOIN courses c ON sa.course_id = c.id
LEFT JOIN workshops w ON sa.workshop_id = w.id
WHERE sa.instructor_id = 'instructor-user-id'
AND sa.activity_type IN ('enrolled', 'course_completed', 'quiz_passed')
AND sa.occurred_at > NOW() - INTERVAL '30 days'
ORDER BY sa.occurred_at DESC
LIMIT 100;

-- Activity by course
SELECT
  c.title,
  sa.activity_type,
  COUNT(*) AS activity_count
FROM student_activity sa
JOIN courses c ON sa.course_id = c.id
WHERE c.instructor_id = 'instructor-user-id'
AND sa.occurred_at > NOW() - INTERVAL '7 days'
GROUP BY c.title, sa.activity_type
ORDER BY activity_count DESC;

-- =====================================================
-- WORKSHOP MANAGEMENT QUERIES
-- =====================================================

-- List instructor's workshops
SELECT
  w.*,
  ROUND((w.enrolled_count::DECIMAL / w.capacity_total::DECIMAL) * 100, 2) AS capacity_filled_pct,
  ROUND((w.attended_count::DECIMAL / NULLIF(w.enrolled_count, 0)::DECIMAL) * 100, 2) AS attendance_rate
FROM workshops w
WHERE w.instructor_id = 'instructor-user-id'
ORDER BY w.start_time DESC;

-- Get upcoming workshops
SELECT *
FROM workshops
WHERE instructor_id = 'instructor-user-id'
AND status = 'published'
AND start_time > NOW()
ORDER BY start_time ASC;

-- Create new workshop
INSERT INTO workshops (
  instructor_id,
  title,
  slug,
  description,
  pillar,
  level,
  type,
  start_time,
  end_time,
  duration_hours,
  capacity_total,
  capacity_remaining,
  price_amount,
  meeting_url
) VALUES (
  'instructor-user-id',
  'AI Strategy Workshop',
  'ai-strategy-workshop-2025-10',
  'Learn to build an AI strategy...',
  'adaptability',
  'intermediate',
  'online',
  '2025-10-15 14:00:00+00',
  '2025-10-15 17:00:00+00',
  3.0,
  50,
  50,
  199.00,
  'https://zoom.us/j/xxx'
)
RETURNING *;

-- Get workshop registrations
SELECT
  wr.*,
  u.full_name,
  u.email,
  u.avatar_url
FROM workshop_registrations wr
JOIN users u ON wr.user_id = u.id
WHERE wr.workshop_id = 'workshop-id'
ORDER BY wr.registered_at DESC;

-- Get workshop feedback
SELECT
  wf.*,
  u.full_name,
  u.email
FROM workshop_feedback wf
JOIN users u ON wf.user_id = u.id
WHERE wf.workshop_id = 'workshop-id'
ORDER BY wf.submitted_at DESC;

-- =====================================================
-- REVENUE & ANALYTICS QUERIES
-- =====================================================

-- Get revenue breakdown (use helper function)
SELECT * FROM get_instructor_revenue_breakdown(
  'instructor-user-id',
  '2025-01-01'::timestamptz,
  '2025-12-31'::timestamptz
);

-- Monthly revenue trend
SELECT
  DATE_TRUNC('month', transaction_date) AS month,
  COUNT(*) AS transaction_count,
  SUM(amount) AS gross_revenue,
  SUM(platform_fee_amount) AS platform_fees,
  SUM(instructor_earnings) AS net_earnings
FROM revenue_transactions
WHERE instructor_id = 'instructor-user-id'
AND payment_status = 'completed'
AND transaction_date >= NOW() - INTERVAL '12 months'
GROUP BY month
ORDER BY month DESC;

-- Revenue by course
SELECT
  c.title,
  COUNT(rt.id) AS sales_count,
  SUM(rt.amount) AS total_revenue,
  SUM(rt.instructor_earnings) AS instructor_earnings
FROM revenue_transactions rt
JOIN courses c ON rt.course_id = c.id
WHERE rt.instructor_id = 'instructor-user-id'
AND rt.payment_status = 'completed'
GROUP BY c.title
ORDER BY total_revenue DESC;

-- Top performing courses (by revenue)
SELECT
  c.id,
  c.title,
  c.enrolled_count,
  c.total_revenue,
  c.average_rating,
  c.review_count,
  ROUND(c.total_revenue / NULLIF(c.enrolled_count, 0), 2) AS revenue_per_student
FROM courses c
WHERE c.instructor_id = 'instructor-user-id'
AND c.enrolled_count > 0
ORDER BY c.total_revenue DESC
LIMIT 10;

-- Pending payouts
SELECT
  DATE_TRUNC('week', transaction_date) AS week,
  SUM(instructor_earnings) AS pending_amount
FROM revenue_transactions
WHERE instructor_id = 'instructor-user-id'
AND payment_status = 'completed'
AND payout_status = 'pending'
GROUP BY week
ORDER BY week DESC;

-- =====================================================
-- COURSE REVIEWS QUERIES
-- =====================================================

-- Get all reviews for instructor's courses
SELECT
  cr.*,
  u.full_name AS student_name,
  u.avatar_url AS student_avatar,
  c.title AS course_title
FROM course_reviews cr
JOIN courses c ON cr.course_id = c.id
JOIN users u ON cr.user_id = u.id
WHERE c.instructor_id = 'instructor-user-id'
AND cr.is_published = true
ORDER BY cr.created_at DESC;

-- Get reviews needing response
SELECT
  cr.*,
  c.title AS course_title,
  u.full_name AS student_name
FROM course_reviews cr
JOIN courses c ON cr.course_id = c.id
JOIN users u ON cr.user_id = u.id
WHERE c.instructor_id = 'instructor-user-id'
AND cr.instructor_response IS NULL
AND cr.is_published = true
ORDER BY cr.created_at ASC;

-- Respond to review
UPDATE course_reviews
SET
  instructor_response = 'Thank you for your feedback...',
  instructor_responded_at = NOW()
WHERE id = 'review-id'
AND course_id IN (
  SELECT id FROM courses WHERE instructor_id = 'instructor-user-id'
);

-- Rating distribution for course
SELECT
  rating,
  COUNT(*) AS count
FROM course_reviews
WHERE course_id = 'course-id'
AND is_published = true
GROUP BY rating
ORDER BY rating DESC;

-- =====================================================
-- ANALYTICS QUERIES
-- =====================================================

-- Student enrollment trend (last 30 days)
SELECT
  DATE(enrolled_at) AS date,
  COUNT(*) AS new_enrollments
FROM course_enrollments ce
JOIN courses c ON ce.course_id = c.id
WHERE c.instructor_id = 'instructor-user-id'
AND ce.enrolled_at > NOW() - INTERVAL '30 days'
GROUP BY date
ORDER BY date DESC;

-- Course completion rates
SELECT
  c.title,
  c.enrolled_count,
  c.completed_count,
  ROUND((c.completed_count::DECIMAL / NULLIF(c.enrolled_count, 0)::DECIMAL) * 100, 2) AS completion_rate
FROM courses c
WHERE c.instructor_id = 'instructor-user-id'
AND c.enrolled_count > 0
ORDER BY completion_rate DESC;

-- Student engagement metrics
SELECT
  AVG(sp.progress_percentage) AS avg_progress,
  AVG(sp.engagement_score) AS avg_engagement,
  AVG(sp.total_watch_time_seconds / 3600.0) AS avg_watch_hours,
  COUNT(*) FILTER (WHERE sp.last_activity_at > NOW() - INTERVAL '7 days') AS active_last_7_days,
  COUNT(*) FILTER (WHERE sp.progress_percentage = 0) AS not_started
FROM student_progress sp
JOIN courses c ON sp.course_id = c.id
WHERE c.instructor_id = 'instructor-user-id';

-- Lesson completion heatmap
SELECT
  cl.id AS lesson_id,
  cl.title AS lesson_title,
  COUNT(lp.id) FILTER (WHERE lp.is_completed = true) AS completed_count,
  COUNT(lp.id) AS total_students,
  ROUND(
    (COUNT(lp.id) FILTER (WHERE lp.is_completed = true)::DECIMAL / NULLIF(COUNT(lp.id), 0)::DECIMAL) * 100,
    2
  ) AS completion_rate
FROM course_lessons cl
JOIN course_modules cm ON cl.module_id = cm.id
JOIN courses c ON cm.course_id = c.id
LEFT JOIN lesson_progress lp ON cl.id = lp.lesson_id
WHERE c.instructor_id = 'instructor-user-id'
AND c.id = 'course-id'
GROUP BY cl.id, cl.title, cl.sort_order, cm.sort_order
ORDER BY cm.sort_order, cl.sort_order;

-- =====================================================
-- SETTINGS QUERIES
-- =====================================================

-- Get instructor settings
SELECT * FROM instructor_settings
WHERE user_id = 'instructor-user-id';

-- Update notification settings
UPDATE instructor_settings
SET email_notifications = email_notifications || '{"new_enrollment": false}'::jsonb
WHERE user_id = 'instructor-user-id';

-- Update payment settings
UPDATE instructor_settings
SET
  payment_method = 'stripe',
  payout_schedule = 'monthly',
  minimum_payout_amount = 100.00
WHERE user_id = 'instructor-user-id';

-- =====================================================
-- PERFORMANCE TIPS
-- =====================================================

/*
1. Use helper functions when available:
   - get_instructor_dashboard_stats()
   - get_instructor_student_progress()
   - get_instructor_revenue_breakdown()
   - get_instructor_recent_activity()

2. Always filter by instructor_id first for best performance

3. Use indexes effectively:
   - Filter on indexed columns (status, created_at, etc.)
   - Use composite indexes for multi-column queries

4. Limit result sets:
   - Add LIMIT clause for pagination
   - Use OFFSET for page navigation

5. Aggregate at database level:
   - Use COUNT, SUM, AVG instead of fetching all rows
   - Let triggers maintain denormalized stats

6. Cache expensive queries:
   - Dashboard overview (refresh every 5 min)
   - Course stats (refresh on enrollment changes)
   - Revenue stats (refresh on payment changes)
*/

-- Example pagination query
SELECT *
FROM courses
WHERE instructor_id = 'instructor-user-id'
ORDER BY created_at DESC
LIMIT 20 OFFSET 0; -- Page 1

-- Example with full-text search
SELECT *
FROM courses
WHERE instructor_id = 'instructor-user-id'
AND (
  title ILIKE '%search term%'
  OR description ILIKE '%search term%'
  OR 'search term' = ANY(tags)
)
ORDER BY created_at DESC;
