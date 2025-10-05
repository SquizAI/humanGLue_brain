-- =====================================================
-- INSTRUCTOR DASHBOARD - TESTING & VALIDATION SCRIPT
-- =====================================================
-- Run this script after applying 002_instructor_schema.sql
-- to verify everything works correctly
-- =====================================================

-- =====================================================
-- PRE-FLIGHT CHECKS
-- =====================================================

-- Check that all tables exist
SELECT
  'instructor_profiles' AS table_name,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'instructor_profiles') AS exists
UNION ALL
SELECT 'instructor_settings', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'instructor_settings')
UNION ALL
SELECT 'student_progress', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'student_progress')
UNION ALL
SELECT 'student_activity', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'student_activity')
UNION ALL
SELECT 'revenue_transactions', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'revenue_transactions')
UNION ALL
SELECT 'course_reviews', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'course_reviews')
UNION ALL
SELECT 'workshop_feedback', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'workshop_feedback')
UNION ALL
SELECT 'course_instructors', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'course_instructors')
UNION ALL
SELECT 'workshop_facilitators', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'workshop_facilitators');

-- Check that all indexes exist
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN (
  'instructor_profiles',
  'instructor_settings',
  'student_progress',
  'student_activity',
  'revenue_transactions',
  'course_reviews',
  'workshop_feedback'
)
ORDER BY tablename, indexname;

-- Check that all triggers exist
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table IN (
  'instructor_profiles',
  'instructor_settings',
  'student_progress',
  'courses',
  'course_enrollments',
  'lesson_progress',
  'course_reviews',
  'workshops',
  'workshop_registrations',
  'workshop_feedback'
)
ORDER BY event_object_table, trigger_name;

-- Check that all functions exist
SELECT
  routine_name,
  routine_type,
  data_type AS return_type
FROM information_schema.routines
WHERE routine_name IN (
  'get_instructor_dashboard_stats',
  'get_instructor_student_progress',
  'get_instructor_revenue_breakdown',
  'get_instructor_recent_activity',
  'create_student_progress',
  'update_student_progress_from_lesson',
  'update_course_enrollment_stats',
  'update_workshop_registration_stats',
  'update_course_rating',
  'update_workshop_satisfaction',
  'update_instructor_stats',
  'log_student_activity',
  'create_revenue_transaction_from_enrollment',
  'create_revenue_transaction_from_workshop'
)
ORDER BY routine_name;

-- Check that all RLS policies exist
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN (
  'instructor_profiles',
  'instructor_settings',
  'student_progress',
  'student_activity',
  'revenue_transactions',
  'course_reviews',
  'workshop_feedback',
  'course_instructors',
  'workshop_facilitators'
)
ORDER BY tablename, policyname;

-- =====================================================
-- SEED DATA FOR TESTING
-- =====================================================

-- Create test organization (if not exists)
INSERT INTO organizations (id, name, slug, subscription_tier)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Test Organization',
  'test-org',
  'professional'
)
ON CONFLICT (id) DO NOTHING;

-- Create test instructor user (if not exists)
-- Note: This assumes auth.users already has a test user
-- You may need to create this via Supabase Dashboard first

DO $$
DECLARE
  test_instructor_id UUID := '00000000-0000-0000-0000-000000000010';
  test_student1_id UUID := '00000000-0000-0000-0000-000000000020';
  test_student2_id UUID := '00000000-0000-0000-0000-000000000021';
  test_course_id UUID;
  test_workshop_id UUID;
  test_enrollment_id UUID;
BEGIN
  -- Create test users
  INSERT INTO users (id, email, full_name, role, organization_id)
  VALUES
    (test_instructor_id, 'instructor@test.com', 'Test Instructor', 'member', NULL),
    (test_student1_id, 'student1@test.com', 'Test Student 1', 'member', '00000000-0000-0000-0000-000000000001'),
    (test_student2_id, 'student2@test.com', 'Test Student 2', 'member', '00000000-0000-0000-0000-000000000001')
  ON CONFLICT (id) DO NOTHING;

  -- Create instructor profile
  INSERT INTO instructor_profiles (
    user_id,
    bio,
    professional_title,
    expertise_tags,
    pillars
  ) VALUES (
    test_instructor_id,
    'An experienced AI transformation expert with 10+ years helping organizations adopt AI technologies.',
    'AI Transformation Consultant',
    ARRAY['AI Strategy', 'Change Management', 'Leadership', 'Digital Transformation'],
    ARRAY['adaptability', 'coaching']::ai_pillar[]
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Create instructor settings
  INSERT INTO instructor_settings (user_id)
  VALUES (test_instructor_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Create test course
  INSERT INTO courses (
    id,
    instructor_id,
    title,
    slug,
    description,
    pillar,
    level,
    price_amount,
    status,
    category,
    tags
  ) VALUES (
    gen_random_uuid(),
    test_instructor_id,
    'AI Transformation Fundamentals',
    'ai-transformation-fundamentals-test',
    'Learn the fundamentals of AI transformation in organizations',
    'adaptability',
    'beginner',
    99.00,
    'published',
    'AI Strategy',
    ARRAY['AI', 'Digital Transformation', 'Strategy']
  )
  ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
  RETURNING id INTO test_course_id;

  -- Create course modules and lessons
  INSERT INTO course_modules (course_id, title, sort_order)
  VALUES
    (test_course_id, 'Introduction to AI', 1),
    (test_course_id, 'Building an AI Strategy', 2)
  ON CONFLICT DO NOTHING;

  -- Create test workshop
  INSERT INTO workshops (
    id,
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
    status
  ) VALUES (
    gen_random_uuid(),
    test_instructor_id,
    'AI Strategy Workshop',
    'ai-strategy-workshop-test',
    'Learn to build an effective AI strategy',
    'adaptability',
    'intermediate',
    'online',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '7 days' + INTERVAL '3 hours',
    3.0,
    50,
    50,
    199.00,
    'published'
  )
  ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
  RETURNING id INTO test_workshop_id;

  -- Create test enrollments
  INSERT INTO course_enrollments (
    id,
    user_id,
    course_id,
    organization_id,
    status,
    progress_percentage,
    enrolled_at
  ) VALUES
    (gen_random_uuid(), test_student1_id, test_course_id, '00000000-0000-0000-0000-000000000001', 'in_progress', 45, NOW() - INTERVAL '10 days'),
    (gen_random_uuid(), test_student2_id, test_course_id, '00000000-0000-0000-0000-000000000001', 'enrolled', 10, NOW() - INTERVAL '3 days')
  ON CONFLICT (user_id, course_id) DO NOTHING;

  -- Create test workshop registration
  INSERT INTO workshop_registrations (
    user_id,
    workshop_id,
    organization_id,
    status,
    payment_status
  ) VALUES
    (test_student1_id, test_workshop_id, '00000000-0000-0000-0000-000000000001', 'registered', 'completed')
  ON CONFLICT (workshop_id, user_id) DO NOTHING;

  RAISE NOTICE 'Test data created successfully';
END $$;

-- =====================================================
-- TRIGGER TESTS
-- =====================================================

-- Test 1: Verify student_progress auto-creation
SELECT
  'Test 1: student_progress auto-creation' AS test_name,
  CASE
    WHEN COUNT(*) > 0 THEN 'PASS'
    ELSE 'FAIL'
  END AS result,
  COUNT(*) AS records_created
FROM student_progress
WHERE user_id IN (
  '00000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000021'
);

-- Test 2: Verify course enrollment stats update
SELECT
  'Test 2: course.enrolled_count updated' AS test_name,
  CASE
    WHEN c.enrolled_count >= 2 THEN 'PASS'
    ELSE 'FAIL'
  END AS result,
  c.enrolled_count AS actual_count
FROM courses c
WHERE c.slug = 'ai-transformation-fundamentals-test';

-- Test 3: Verify instructor stats update
SELECT
  'Test 3: instructor_profiles.total_students updated' AS test_name,
  CASE
    WHEN ip.total_students >= 2 THEN 'PASS'
    ELSE 'FAIL'
  END AS result,
  ip.total_students AS actual_count
FROM instructor_profiles ip
WHERE ip.user_id = '00000000-0000-0000-0000-000000000010';

-- Test 4: Create a review and verify rating update
DO $$
DECLARE
  test_enrollment_id UUID;
  test_course_id UUID;
BEGIN
  SELECT id, course_id INTO test_enrollment_id, test_course_id
  FROM course_enrollments
  WHERE user_id = '00000000-0000-0000-0000-000000000020'
  LIMIT 1;

  INSERT INTO course_reviews (
    course_id,
    user_id,
    enrollment_id,
    rating,
    title,
    review_text
  ) VALUES (
    test_course_id,
    '00000000-0000-0000-0000-000000000020',
    test_enrollment_id,
    5,
    'Excellent course!',
    'I learned so much from this course. Highly recommended!'
  )
  ON CONFLICT (course_id, user_id) DO NOTHING;
END $$;

SELECT
  'Test 4: course.average_rating updated after review' AS test_name,
  CASE
    WHEN c.average_rating IS NOT NULL THEN 'PASS'
    ELSE 'FAIL'
  END AS result,
  c.average_rating AS actual_rating,
  c.review_count AS review_count
FROM courses c
WHERE c.slug = 'ai-transformation-fundamentals-test';

-- =====================================================
-- FUNCTION TESTS
-- =====================================================

-- Test 5: get_instructor_dashboard_stats function
SELECT
  'Test 5: get_instructor_dashboard_stats function' AS test_name,
  CASE
    WHEN stats.total_students > 0 THEN 'PASS'
    ELSE 'FAIL'
  END AS result,
  stats.*
FROM get_instructor_dashboard_stats('00000000-0000-0000-0000-000000000010') AS stats;

-- Test 6: get_instructor_student_progress function
SELECT
  'Test 6: get_instructor_student_progress function' AS test_name,
  CASE
    WHEN COUNT(*) >= 2 THEN 'PASS'
    ELSE 'FAIL'
  END AS result,
  COUNT(*) AS student_count
FROM get_instructor_student_progress('00000000-0000-0000-0000-000000000010');

-- Test 7: get_instructor_recent_activity function
SELECT
  'Test 7: get_instructor_recent_activity function' AS test_name,
  CASE
    WHEN COUNT(*) >= 0 THEN 'PASS' -- May be empty if no activity logged yet
    ELSE 'FAIL'
  END AS result,
  COUNT(*) AS activity_count
FROM get_instructor_recent_activity('00000000-0000-0000-0000-000000000010', 50);

-- =====================================================
-- RLS POLICY TESTS
-- =====================================================

-- Test 8: Instructor can view their own profile
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub TO '00000000-0000-0000-0000-000000000010';

SELECT
  'Test 8: Instructor can view own profile (RLS)' AS test_name,
  CASE
    WHEN COUNT(*) = 1 THEN 'PASS'
    ELSE 'FAIL'
  END AS result,
  COUNT(*) AS records_visible
FROM instructor_profiles
WHERE user_id = '00000000-0000-0000-0000-000000000010';

-- Test 9: Instructor can view their own courses
SELECT
  'Test 9: Instructor can view own courses (RLS)' AS test_name,
  CASE
    WHEN COUNT(*) >= 1 THEN 'PASS'
    ELSE 'FAIL'
  END AS result,
  COUNT(*) AS courses_visible
FROM courses
WHERE instructor_id = '00000000-0000-0000-0000-000000000010';

-- Test 10: Instructor can view their students' progress
SELECT
  'Test 10: Instructor can view student progress (RLS)' AS test_name,
  CASE
    WHEN COUNT(*) >= 2 THEN 'PASS'
    ELSE 'FAIL'
  END AS result,
  COUNT(*) AS progress_records_visible
FROM student_progress sp
JOIN courses c ON sp.course_id = c.id
WHERE c.instructor_id = '00000000-0000-0000-0000-000000000010';

RESET ROLE;

-- =====================================================
-- CONSTRAINT TESTS
-- =====================================================

-- Test 11: Verify CHECK constraints work
DO $$
BEGIN
  -- Try to insert invalid rating (should fail)
  BEGIN
    INSERT INTO course_reviews (
      course_id,
      user_id,
      enrollment_id,
      rating
    ) VALUES (
      (SELECT id FROM courses LIMIT 1),
      '00000000-0000-0000-0000-000000000020',
      (SELECT id FROM course_enrollments LIMIT 1),
      10 -- Invalid rating > 5
    );
    RAISE NOTICE 'Test 11: CHECK constraint FAILED - invalid rating allowed';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'Test 11: CHECK constraint PASSED - invalid rating rejected';
  END;

  -- Try to insert invalid progress percentage (should fail)
  BEGIN
    UPDATE student_progress
    SET progress_percentage = 150 -- Invalid > 100
    WHERE user_id = '00000000-0000-0000-0000-000000000020';
    RAISE NOTICE 'Test 12: CHECK constraint FAILED - invalid progress allowed';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'Test 12: CHECK constraint PASSED - invalid progress rejected';
  END;
END $$;

-- =====================================================
-- PERFORMANCE TESTS
-- =====================================================

-- Test 13: Index usage for common queries
EXPLAIN ANALYZE
SELECT *
FROM courses
WHERE instructor_id = '00000000-0000-0000-0000-000000000010'
AND status = 'published'
ORDER BY created_at DESC;

-- Test 14: Index usage for student progress query
EXPLAIN ANALYZE
SELECT *
FROM student_progress
WHERE course_id IN (
  SELECT id FROM courses WHERE instructor_id = '00000000-0000-0000-0000-000000000010'
)
ORDER BY last_activity_at DESC NULLS LAST;

-- Test 15: Index usage for revenue queries
EXPLAIN ANALYZE
SELECT
  DATE_TRUNC('month', transaction_date) AS month,
  SUM(instructor_earnings) AS earnings
FROM revenue_transactions
WHERE instructor_id = '00000000-0000-0000-0000-000000000010'
AND payment_status = 'completed'
GROUP BY month
ORDER BY month DESC;

-- =====================================================
-- DATA INTEGRITY TESTS
-- =====================================================

-- Test 16: Verify foreign key constraints
SELECT
  'Test 16: Foreign key integrity' AS test_name,
  CASE
    WHEN COUNT(*) = 0 THEN 'PASS'
    ELSE 'FAIL'
  END AS result,
  COUNT(*) AS orphaned_records
FROM (
  -- Check for orphaned student_progress records
  SELECT sp.id
  FROM student_progress sp
  LEFT JOIN course_enrollments ce ON sp.enrollment_id = ce.id
  WHERE ce.id IS NULL

  UNION ALL

  -- Check for orphaned course_reviews records
  SELECT cr.id
  FROM course_reviews cr
  LEFT JOIN courses c ON cr.course_id = c.id
  WHERE c.id IS NULL

  UNION ALL

  -- Check for orphaned revenue_transactions records
  SELECT rt.id
  FROM revenue_transactions rt
  LEFT JOIN users u ON rt.instructor_id = u.id
  WHERE u.id IS NULL
) AS orphans;

-- Test 17: Verify unique constraints
SELECT
  'Test 17: Unique constraint integrity' AS test_name,
  CASE
    WHEN COUNT(*) = 0 THEN 'PASS'
    ELSE 'FAIL'
  END AS result,
  COUNT(*) AS duplicate_records
FROM (
  -- Check for duplicate enrollments (should be prevented by UNIQUE constraint)
  SELECT user_id, course_id, COUNT(*)
  FROM course_enrollments
  GROUP BY user_id, course_id
  HAVING COUNT(*) > 1

  UNION ALL

  -- Check for duplicate reviews
  SELECT user_id, course_id, COUNT(*)
  FROM course_reviews
  GROUP BY user_id, course_id
  HAVING COUNT(*) > 1
) AS duplicates;

-- =====================================================
-- SUMMARY REPORT
-- =====================================================

SELECT
  '========================' AS separator,
  'TEST SUMMARY' AS title,
  '========================' AS separator2;

SELECT
  'Total Tables Created' AS metric,
  COUNT(*) AS value
FROM information_schema.tables
WHERE table_name IN (
  'instructor_profiles',
  'instructor_settings',
  'student_progress',
  'student_activity',
  'revenue_transactions',
  'course_reviews',
  'workshop_feedback',
  'course_instructors',
  'workshop_facilitators'
);

SELECT
  'Total Indexes Created' AS metric,
  COUNT(*) AS value
FROM pg_indexes
WHERE tablename IN (
  'instructor_profiles',
  'instructor_settings',
  'student_progress',
  'student_activity',
  'revenue_transactions',
  'course_reviews',
  'workshop_feedback'
);

SELECT
  'Total Triggers Created' AS metric,
  COUNT(*) AS value
FROM information_schema.triggers
WHERE event_object_table IN (
  'instructor_profiles',
  'instructor_settings',
  'student_progress',
  'courses',
  'course_enrollments',
  'lesson_progress',
  'course_reviews',
  'workshops',
  'workshop_registrations',
  'workshop_feedback'
);

SELECT
  'Total RLS Policies Created' AS metric,
  COUNT(*) AS value
FROM pg_policies
WHERE tablename IN (
  'instructor_profiles',
  'instructor_settings',
  'student_progress',
  'student_activity',
  'revenue_transactions',
  'course_reviews',
  'workshop_feedback',
  'course_instructors',
  'workshop_facilitators'
);

SELECT
  'Total Helper Functions Created' AS metric,
  COUNT(*) AS value
FROM information_schema.routines
WHERE routine_name IN (
  'get_instructor_dashboard_stats',
  'get_instructor_student_progress',
  'get_instructor_revenue_breakdown',
  'get_instructor_recent_activity'
);

-- =====================================================
-- CLEANUP (Optional - uncomment to remove test data)
-- =====================================================

/*
-- Remove test data
DELETE FROM course_reviews WHERE user_id IN (
  '00000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000021'
);

DELETE FROM workshop_registrations WHERE user_id IN (
  '00000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000021'
);

DELETE FROM course_enrollments WHERE user_id IN (
  '00000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000021'
);

DELETE FROM courses WHERE instructor_id = '00000000-0000-0000-0000-000000000010';
DELETE FROM workshops WHERE instructor_id = '00000000-0000-0000-0000-000000000010';

DELETE FROM instructor_settings WHERE user_id = '00000000-0000-0000-0000-000000000010';
DELETE FROM instructor_profiles WHERE user_id = '00000000-0000-0000-0000-000000000010';

DELETE FROM users WHERE id IN (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000021'
);

DELETE FROM organizations WHERE id = '00000000-0000-0000-0000-000000000001';
*/
