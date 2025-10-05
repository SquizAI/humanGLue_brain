-- =====================================================
-- Migration: 006_fix_api_compatibility.sql
-- Description: Fix API compatibility issues
-- Created: 2025-10-04
-- Dependencies: 002_instructor_schema.sql
--
-- This migration addresses inconsistencies between:
-- - Database schema column/table names
-- - API endpoint expectations
--
-- Changes:
-- 1. Add missing user columns (full_name, avatar_url)
-- 2. Create quiz and assignment tracking tables
-- 3. Add time tracking to student_progress
-- 4. Create compatibility views
-- =====================================================

-- =====================================================
-- 1. FIX USER TABLE COLUMNS
-- =====================================================

-- Add full_name column (API expects this instead of 'name')
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Copy existing name data to full_name if empty
UPDATE users SET full_name = name WHERE full_name IS NULL;

-- Make full_name NOT NULL going forward
ALTER TABLE users ALTER COLUMN full_name SET NOT NULL;

-- Add avatar_url column if using 'avatar' instead
-- Check if avatar column exists first
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'users' AND column_name = 'avatar') THEN
    -- Rename avatar to avatar_url
    ALTER TABLE users RENAME COLUMN avatar TO avatar_url;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'users' AND column_name = 'avatar_url') THEN
    -- Add avatar_url if it doesn't exist
    ALTER TABLE users ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- =====================================================
-- 2. CREATE QUIZ ATTEMPTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,

  -- Quiz data
  quiz_data JSONB NOT NULL DEFAULT '{}'::jsonb, -- Questions and answers

  -- Scoring
  score DECIMAL(5,2) NOT NULL CHECK (score >= 0),
  max_score DECIMAL(5,2) NOT NULL CHECK (max_score > 0),
  percentage DECIMAL(5,2) GENERATED ALWAYS AS ((score / max_score) * 100) STORED,
  passed BOOLEAN NOT NULL DEFAULT false,

  -- Attempt tracking
  attempt_number INTEGER NOT NULL DEFAULT 1,
  time_spent_seconds INTEGER DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,

  CONSTRAINT valid_quiz_data CHECK (jsonb_typeof(quiz_data) = 'object')
);

-- Indexes for quiz_attempts
CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_course ON quiz_attempts(course_id);
CREATE INDEX idx_quiz_attempts_lesson ON quiz_attempts(lesson_id);
CREATE INDEX idx_quiz_attempts_created ON quiz_attempts(created_at DESC);
CREATE INDEX idx_quiz_attempts_user_course ON quiz_attempts(user_id, course_id);

-- Unique constraint: prevent duplicate attempts at same time
CREATE UNIQUE INDEX idx_quiz_attempts_unique ON quiz_attempts(user_id, lesson_id, attempt_number);

-- Trigger: Auto-update updated_at
CREATE TRIGGER update_quiz_attempts_updated_at
  BEFORE UPDATE ON quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. CREATE ASSIGNMENT SUBMISSIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,

  -- Submission content
  submission_text TEXT,
  submission_url TEXT, -- Link to uploaded file/document
  attachments JSONB DEFAULT '[]'::jsonb, -- Array of file URLs

  -- Grading
  feedback TEXT,
  grade DECIMAL(5,2) CHECK (grade >= 0 AND grade <= 100),
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN (
    'draft',
    'submitted',
    'under_review',
    'graded',
    'returned',
    'resubmitted'
  )),

  -- Instructor grading
  graded_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  graded_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  CONSTRAINT valid_attachments CHECK (jsonb_typeof(attachments) = 'array')
);

-- Indexes for assignment_submissions
CREATE INDEX idx_submissions_user ON assignment_submissions(user_id);
CREATE INDEX idx_submissions_course ON assignment_submissions(course_id);
CREATE INDEX idx_submissions_lesson ON assignment_submissions(lesson_id);
CREATE INDEX idx_submissions_status ON assignment_submissions(status);
CREATE INDEX idx_submissions_graded_by ON assignment_submissions(graded_by);
CREATE INDEX idx_submissions_created ON assignment_submissions(created_at DESC);
CREATE INDEX idx_submissions_submitted ON assignment_submissions(submitted_at DESC) WHERE submitted_at IS NOT NULL;

-- Trigger: Auto-update updated_at
CREATE TRIGGER update_assignment_submissions_updated_at
  BEFORE UPDATE ON assignment_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. ADD TIME TRACKING TO STUDENT_PROGRESS
-- =====================================================

-- Add time_spent_seconds column to track watch time
ALTER TABLE student_progress ADD COLUMN IF NOT EXISTS time_spent_seconds INTEGER DEFAULT 0 CHECK (time_spent_seconds >= 0);

-- Add index for analytics queries
CREATE INDEX IF NOT EXISTS idx_student_progress_time ON student_progress(time_spent_seconds) WHERE time_spent_seconds > 0;

-- =====================================================
-- 5. CREATE COMPATIBILITY VIEWS
-- =====================================================

-- View: course_enrollments (alias for enrollments)
-- Some API endpoints may expect 'course_enrollments' table name
CREATE OR REPLACE VIEW course_enrollments AS
SELECT
  id,
  user_id,
  course_id,
  status,
  completion_percentage,
  enrolled_at,
  last_accessed_at,
  completed_at,
  certificate_id,
  metadata,
  created_at,
  updated_at
FROM enrollments;

-- View: lesson_progress (compatibility with old naming)
-- Maps student_progress to lesson_progress for backward compatibility
CREATE OR REPLACE VIEW lesson_progress AS
SELECT
  sp.id,
  sp.enrollment_id,
  sp.lesson_id,
  sp.user_id,
  sp.course_id,
  sp.completed,
  sp.time_spent_seconds,
  sp.completion_percentage,
  sp.last_position,
  sp.created_at,
  sp.completed_at,
  sp.updated_at,
  cl.id as course_lesson_id,
  cl.title,
  cl.content_type,
  cl.section_id
FROM student_progress sp
LEFT JOIN course_lessons cl ON sp.lesson_id = cl.id;

-- =====================================================
-- 6. ADD HELPER FUNCTIONS FOR STUDENT STATS
-- =====================================================

-- Function: Get student quiz stats
CREATE OR REPLACE FUNCTION get_student_quiz_stats(
  p_user_id UUID,
  p_course_id UUID DEFAULT NULL
)
RETURNS TABLE(
  total_attempts INTEGER,
  passed_attempts INTEGER,
  failed_attempts INTEGER,
  average_score DECIMAL,
  highest_score DECIMAL,
  latest_attempt_date TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_attempts,
    COUNT(*) FILTER (WHERE passed = true)::INTEGER as passed_attempts,
    COUNT(*) FILTER (WHERE passed = false)::INTEGER as failed_attempts,
    ROUND(AVG(percentage), 2) as average_score,
    MAX(percentage) as highest_score,
    MAX(created_at) as latest_attempt_date
  FROM quiz_attempts
  WHERE user_id = p_user_id
    AND (p_course_id IS NULL OR course_id = p_course_id);
END;
$$;

-- Function: Get student assignment stats
CREATE OR REPLACE FUNCTION get_student_assignment_stats(
  p_user_id UUID,
  p_course_id UUID DEFAULT NULL
)
RETURNS TABLE(
  total_submissions INTEGER,
  graded_submissions INTEGER,
  pending_submissions INTEGER,
  average_grade DECIMAL,
  highest_grade DECIMAL,
  latest_submission_date TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_submissions,
    COUNT(*) FILTER (WHERE status = 'graded')::INTEGER as graded_submissions,
    COUNT(*) FILTER (WHERE status IN ('submitted', 'under_review'))::INTEGER as pending_submissions,
    ROUND(AVG(grade), 2) as average_grade,
    MAX(grade) as highest_grade,
    MAX(submitted_at) as latest_submission_date
  FROM assignment_submissions
  WHERE user_id = p_user_id
    AND (p_course_id IS NULL OR course_id = p_course_id)
    AND status != 'draft';
END;
$$;

-- Function: Get student total watch time (formatted)
CREATE OR REPLACE FUNCTION get_student_watch_time(
  p_user_id UUID,
  p_course_id UUID DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_seconds INTEGER;
  hours INTEGER;
  minutes INTEGER;
BEGIN
  SELECT COALESCE(SUM(time_spent_seconds), 0)
  INTO total_seconds
  FROM student_progress
  WHERE user_id = p_user_id
    AND (p_course_id IS NULL OR course_id = p_course_id);

  hours := total_seconds / 3600;
  minutes := (total_seconds % 3600) / 60;

  RETURN hours || 'h ' || minutes || 'm';
END;
$$;

-- =====================================================
-- 7. ROW LEVEL SECURITY FOR NEW TABLES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Quiz Attempts Policies
CREATE POLICY quiz_attempts_select_own
  ON quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY quiz_attempts_insert_own
  ON quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY quiz_attempts_select_instructor
  ON quiz_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = quiz_attempts.course_id
        AND courses.instructor_id = auth.uid()
    )
  );

-- Assignment Submissions Policies
CREATE POLICY submissions_select_own
  ON assignment_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY submissions_insert_own
  ON assignment_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY submissions_update_own
  ON assignment_submissions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY submissions_select_instructor
  ON assignment_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = assignment_submissions.course_id
        AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY submissions_update_instructor
  ON assignment_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = assignment_submissions.course_id
        AND courses.instructor_id = auth.uid()
    )
  );

-- =====================================================
-- 8. GRANT PERMISSIONS
-- =====================================================

GRANT SELECT, INSERT, UPDATE ON quiz_attempts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON assignment_submissions TO authenticated;

-- Grant permissions on views
GRANT SELECT ON course_enrollments TO authenticated;
GRANT SELECT ON lesson_progress TO authenticated;

-- =====================================================
-- 9. ADD COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE quiz_attempts IS 'Stores student quiz attempts with scoring and attempt tracking';
COMMENT ON TABLE assignment_submissions IS 'Stores student assignment submissions with grading workflow';
COMMENT ON COLUMN student_progress.time_spent_seconds IS 'Total time spent on lesson in seconds for watch time analytics';
COMMENT ON VIEW course_enrollments IS 'Compatibility view mapping to enrollments table';
COMMENT ON VIEW lesson_progress IS 'Enhanced view combining student_progress with course_lessons data';
COMMENT ON FUNCTION get_student_quiz_stats IS 'Get comprehensive quiz statistics for a student';
COMMENT ON FUNCTION get_student_assignment_stats IS 'Get comprehensive assignment statistics for a student';
COMMENT ON FUNCTION get_student_watch_time IS 'Get formatted total watch time for a student';

-- =====================================================
-- ROLLBACK SCRIPT (for reference)
-- =====================================================
/*
-- Drop new objects
DROP VIEW IF EXISTS lesson_progress;
DROP VIEW IF EXISTS course_enrollments;
DROP FUNCTION IF EXISTS get_student_watch_time;
DROP FUNCTION IF EXISTS get_student_assignment_stats;
DROP FUNCTION IF EXISTS get_student_quiz_stats;
ALTER TABLE student_progress DROP COLUMN IF EXISTS time_spent_seconds;
DROP TABLE IF EXISTS assignment_submissions;
DROP TABLE IF EXISTS quiz_attempts;

-- Revert user columns
ALTER TABLE users DROP COLUMN IF EXISTS full_name;
ALTER TABLE users RENAME COLUMN avatar_url TO avatar;
*/
