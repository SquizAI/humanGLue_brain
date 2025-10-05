-- =====================================================
-- Migration: 002_instructor_schema.sql
-- Description: Instructor Dashboard Database Schema
-- Created: 2025-10-04
-- Dependencies: 001_multi_tenant_schema.sql
--
-- This migration creates all tables, indexes, RLS policies, triggers,
-- and functions needed for the HumanGlue instructor portal.
--
-- Features supported:
-- - Instructor profiles and settings
-- - Course management (standalone instructors + org-linked)
-- - Workshop management
-- - Student enrollment and progress tracking
-- - Revenue tracking and analytics
-- - Student activity timeline
-- - Multi-tenant data isolation
-- =====================================================

-- =====================================================
-- NEW ENUMS
-- =====================================================

CREATE TYPE course_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE course_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE lesson_type AS ENUM ('video', 'article', 'quiz', 'assignment', 'live_session');
CREATE TYPE workshop_type AS ENUM ('online', 'in_person', 'hybrid');
CREATE TYPE activity_type AS ENUM (
  'enrolled',
  'lesson_started',
  'lesson_completed',
  'quiz_passed',
  'quiz_failed',
  'assignment_submitted',
  'course_completed',
  'workshop_registered',
  'workshop_attended',
  'certificate_earned',
  'comment_posted',
  'question_asked'
);
CREATE TYPE transaction_type AS ENUM ('course_enrollment', 'workshop_registration', 'consultation', 'refund');
CREATE TYPE payout_schedule AS ENUM ('weekly', 'biweekly', 'monthly');

-- =====================================================
-- INSTRUCTOR PROFILES TABLE
-- =====================================================
-- Extends the users table with instructor-specific information
-- Supports both standalone instructors (no org) and org-linked instructors

CREATE TABLE instructor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Professional Information
  bio TEXT NOT NULL CHECK (char_length(bio) >= 50 AND char_length(bio) <= 2000),
  professional_title TEXT NOT NULL,
  tagline TEXT CHECK (char_length(tagline) <= 200),

  -- Visual Assets
  cover_photo_url TEXT,
  video_intro_url TEXT,

  -- Expertise (stored as JSONB for flexibility)
  expertise_tags TEXT[] DEFAULT '{}',
  pillars ai_pillar[] DEFAULT '{}',

  -- Education (array of objects: {degree, institution, year})
  education JSONB DEFAULT '[]'::jsonb,

  -- Certifications (array of objects: {name, issuer, year, credential_url})
  certifications JSONB DEFAULT '[]'::jsonb,

  -- Work Experience (array of objects: {title, company, years, description})
  work_experience JSONB DEFAULT '[]'::jsonb,

  -- Social Links
  social_links JSONB DEFAULT '{}'::jsonb, -- {linkedin, twitter, website, youtube, etc}

  -- Teaching Stats (auto-updated via triggers)
  total_students INTEGER NOT NULL DEFAULT 0,
  total_courses INTEGER NOT NULL DEFAULT 0,
  total_workshops INTEGER NOT NULL DEFAULT 0,
  average_rating DECIMAL(3,2) CHECK (average_rating >= 0 AND average_rating <= 5),
  total_reviews INTEGER NOT NULL DEFAULT 0,

  -- Status
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_accepting_students BOOLEAN NOT NULL DEFAULT true,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_instructor_profiles_user ON instructor_profiles(user_id);
CREATE INDEX idx_instructor_profiles_verified ON instructor_profiles(is_verified) WHERE is_verified = true;
CREATE INDEX idx_instructor_profiles_featured ON instructor_profiles(is_featured) WHERE is_featured = true;
CREATE INDEX idx_instructor_profiles_accepting ON instructor_profiles(is_accepting_students) WHERE is_accepting_students = true;
CREATE INDEX idx_instructor_profiles_expertise ON instructor_profiles USING GIN(expertise_tags);
CREATE INDEX idx_instructor_profiles_pillars ON instructor_profiles USING GIN(pillars);
CREATE INDEX idx_instructor_profiles_rating ON instructor_profiles(average_rating) WHERE average_rating IS NOT NULL;

CREATE TRIGGER update_instructor_profiles_updated_at
  BEFORE UPDATE ON instructor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INSTRUCTOR SETTINGS TABLE
-- =====================================================
-- User preferences, notification settings, payment settings

CREATE TABLE instructor_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Notification Preferences
  email_notifications JSONB DEFAULT '{
    "new_enrollment": true,
    "new_question": true,
    "assignment_submitted": true,
    "course_review": true,
    "workshop_registration": true,
    "payment_received": true,
    "weekly_summary": true
  }'::jsonb,

  push_notifications JSONB DEFAULT '{
    "new_enrollment": true,
    "new_question": true,
    "assignment_submitted": false,
    "course_review": true,
    "workshop_registration": true,
    "payment_received": true
  }'::jsonb,

  -- Teaching Preferences
  auto_approve_enrollments BOOLEAN NOT NULL DEFAULT true,
  allow_student_questions BOOLEAN NOT NULL DEFAULT true,
  allow_course_reviews BOOLEAN NOT NULL DEFAULT true,
  require_enrollment_approval BOOLEAN NOT NULL DEFAULT false,

  -- Privacy Settings
  show_email_to_students BOOLEAN NOT NULL DEFAULT false,
  show_phone_to_students BOOLEAN NOT NULL DEFAULT false,
  show_student_count BOOLEAN NOT NULL DEFAULT true,
  show_revenue_stats BOOLEAN NOT NULL DEFAULT false,

  -- Payment Settings
  payment_method TEXT, -- 'stripe', 'paypal', 'bank_transfer'
  payment_details JSONB DEFAULT '{}'::jsonb, -- Encrypted payment info
  payout_schedule payout_schedule DEFAULT 'monthly',
  minimum_payout_amount DECIMAL(10,2) DEFAULT 100.00,
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Calendar Integration
  calendar_sync_enabled BOOLEAN NOT NULL DEFAULT false,
  calendar_provider TEXT, -- 'google', 'outlook', 'ical'
  calendar_sync_token TEXT, -- Encrypted token

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_instructor_settings_user ON instructor_settings(user_id);

CREATE TRIGGER update_instructor_settings_updated_at
  BEFORE UPDATE ON instructor_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ENHANCED COURSES TABLE
-- =====================================================
-- Extends the existing courses table structure with instructor-specific fields
-- Note: This replaces the basic courses table from 001_migration with more fields

ALTER TABLE courses DROP COLUMN IF EXISTS instructor_name;
ALTER TABLE courses DROP COLUMN IF EXISTS instructor_bio;
ALTER TABLE courses DROP COLUMN IF EXISTS instructor_avatar_url;

ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS status course_status NOT NULL DEFAULT 'draft';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS what_you_will_learn TEXT[];
ALTER TABLE courses ADD COLUMN IF NOT EXISTS target_audience TEXT[];
ALTER TABLE courses ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'en';

-- Enrollment stats (updated via triggers)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS enrolled_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS completed_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) CHECK (average_rating >= 0 AND average_rating <= 5);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS review_count INTEGER NOT NULL DEFAULT 0;

-- Revenue tracking
ALTER TABLE courses ADD COLUMN IF NOT EXISTS total_revenue DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (total_revenue >= 0);

-- Certificate settings
ALTER TABLE courses ADD COLUMN IF NOT EXISTS certificate_enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS certificate_template_url TEXT;

-- Course settings
ALTER TABLE courses ADD COLUMN IF NOT EXISTS allow_comments BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS allow_qa BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS drip_content BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS drip_schedule JSONB DEFAULT '{}'::jsonb; -- {lesson_id: unlock_date}

CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_organization ON courses(organization_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_tags ON courses USING GIN(tags);
CREATE INDEX idx_courses_rating ON courses(average_rating) WHERE average_rating IS NOT NULL;
CREATE INDEX idx_courses_enrolled ON courses(enrolled_count);

-- =====================================================
-- ENHANCED WORKSHOPS TABLE
-- =====================================================
-- Updates to the existing workshops table

ALTER TABLE workshops DROP COLUMN IF EXISTS instructor_name;
ALTER TABLE workshops DROP COLUMN IF EXISTS instructor_bio;
ALTER TABLE workshops DROP COLUMN IF EXISTS instructor_avatar_url;

ALTER TABLE workshops ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE workshops ADD COLUMN IF NOT EXISTS type workshop_type NOT NULL DEFAULT 'online';
ALTER TABLE workshops ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE workshops ADD COLUMN IF NOT EXISTS prerequisites TEXT[];
ALTER TABLE workshops ADD COLUMN IF NOT EXISTS what_you_will_learn TEXT[];

-- Registration stats (updated via triggers)
ALTER TABLE workshops ADD COLUMN IF NOT EXISTS enrolled_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE workshops ADD COLUMN IF NOT EXISTS attended_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE workshops ADD COLUMN IF NOT EXISTS average_satisfaction DECIMAL(3,2) CHECK (average_satisfaction >= 0 AND average_satisfaction <= 5);
ALTER TABLE workshops ADD COLUMN IF NOT EXISTS feedback_count INTEGER NOT NULL DEFAULT 0;

-- Revenue tracking
ALTER TABLE workshops ADD COLUMN IF NOT EXISTS total_revenue DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (total_revenue >= 0);

-- Certificate settings
ALTER TABLE workshops ADD COLUMN IF NOT EXISTS certificate_enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE workshops ADD COLUMN IF NOT EXISTS certificate_template_url TEXT;

CREATE INDEX idx_workshops_organization ON workshops(organization_id);
CREATE INDEX idx_workshops_type ON workshops(type);
CREATE INDEX idx_workshops_tags ON workshops USING GIN(tags);
CREATE INDEX idx_workshops_satisfaction ON workshops(average_satisfaction) WHERE average_satisfaction IS NOT NULL;

-- =====================================================
-- STUDENT PROGRESS TABLE
-- =====================================================
-- Detailed progress tracking per student per course
-- Aggregates data from lesson_progress and course_enrollments

CREATE TABLE student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

  -- Progress Metrics
  total_lessons INTEGER NOT NULL DEFAULT 0,
  completed_lessons INTEGER NOT NULL DEFAULT 0,
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),

  -- Time Tracking
  total_watch_time_seconds INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMPTZ,

  -- Quiz Performance
  total_quizzes INTEGER NOT NULL DEFAULT 0,
  passed_quizzes INTEGER NOT NULL DEFAULT 0,
  average_quiz_score DECIMAL(5,2),

  -- Assignment Performance
  total_assignments INTEGER NOT NULL DEFAULT 0,
  submitted_assignments INTEGER NOT NULL DEFAULT 0,
  average_assignment_score DECIMAL(5,2),

  -- Engagement Metrics
  comments_count INTEGER NOT NULL DEFAULT 0,
  questions_count INTEGER NOT NULL DEFAULT 0,
  engagement_score DECIMAL(5,2), -- 0-100 based on activity

  -- Completion
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  certificate_issued_at TIMESTAMPTZ,
  certificate_url TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(enrollment_id),
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_student_progress_enrollment ON student_progress(enrollment_id);
CREATE INDEX idx_student_progress_user ON student_progress(user_id);
CREATE INDEX idx_student_progress_course ON student_progress(course_id);
CREATE INDEX idx_student_progress_completed ON student_progress(is_completed);
CREATE INDEX idx_student_progress_activity ON student_progress(last_activity_at);
CREATE INDEX idx_student_progress_percentage ON student_progress(progress_percentage);

CREATE TRIGGER update_student_progress_updated_at
  BEFORE UPDATE ON student_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STUDENT ACTIVITY TABLE
-- =====================================================
-- Timeline of all student activities for instructor dashboard

CREATE TABLE student_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Activity Details
  activity_type activity_type NOT NULL,
  activity_title TEXT NOT NULL,
  activity_description TEXT,

  -- Related Entities (optional, depending on activity type)
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,

  -- Activity Metadata
  metadata JSONB DEFAULT '{}'::jsonb, -- quiz_score, assignment_grade, etc.

  -- Timestamp
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_student_activity_instructor ON student_activity(instructor_id, occurred_at DESC);
CREATE INDEX idx_student_activity_student ON student_activity(student_id, occurred_at DESC);
CREATE INDEX idx_student_activity_type ON student_activity(activity_type);
CREATE INDEX idx_student_activity_course ON student_activity(course_id) WHERE course_id IS NOT NULL;
CREATE INDEX idx_student_activity_workshop ON student_activity(workshop_id) WHERE workshop_id IS NOT NULL;
CREATE INDEX idx_student_activity_occurred ON student_activity(occurred_at DESC);

-- =====================================================
-- REVENUE TRANSACTIONS TABLE
-- =====================================================
-- Tracks all revenue transactions for instructors

CREATE TABLE revenue_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Transaction Details
  transaction_type transaction_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Platform Fee
  platform_fee_percentage DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  platform_fee_amount DECIMAL(10,2) NOT NULL CHECK (platform_fee_amount >= 0),
  instructor_earnings DECIMAL(10,2) NOT NULL CHECK (instructor_earnings >= 0),

  -- Related Entities
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  workshop_id UUID REFERENCES workshops(id) ON DELETE SET NULL,
  enrollment_id UUID REFERENCES course_enrollments(id) ON DELETE SET NULL,
  workshop_registration_id UUID REFERENCES workshop_registrations(id) ON DELETE SET NULL,

  -- Payment Details
  payment_provider TEXT, -- 'stripe', 'paypal', etc.
  payment_provider_transaction_id TEXT,
  payment_status payment_status NOT NULL DEFAULT 'pending',

  -- Payout Details
  payout_id UUID, -- Reference to payout batch
  payout_status TEXT, -- 'pending', 'processing', 'paid', 'failed'
  payout_date TIMESTAMPTZ,

  -- Timestamps
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_revenue_transactions_instructor ON revenue_transactions(instructor_id, transaction_date DESC);
CREATE INDEX idx_revenue_transactions_student ON revenue_transactions(student_id);
CREATE INDEX idx_revenue_transactions_type ON revenue_transactions(transaction_type);
CREATE INDEX idx_revenue_transactions_status ON revenue_transactions(payment_status);
CREATE INDEX idx_revenue_transactions_course ON revenue_transactions(course_id) WHERE course_id IS NOT NULL;
CREATE INDEX idx_revenue_transactions_workshop ON revenue_transactions(workshop_id) WHERE workshop_id IS NOT NULL;
CREATE INDEX idx_revenue_transactions_date ON revenue_transactions(transaction_date DESC);
CREATE INDEX idx_revenue_transactions_payout ON revenue_transactions(payout_status, payout_date);

CREATE TRIGGER update_revenue_transactions_updated_at
  BEFORE UPDATE ON revenue_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COURSE REVIEWS TABLE
-- =====================================================
-- Student reviews and ratings for courses

CREATE TABLE course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,

  -- Review Content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  review_text TEXT CHECK (char_length(review_text) <= 5000),

  -- Breakdown Ratings (optional)
  content_quality_rating INTEGER CHECK (content_quality_rating >= 1 AND content_quality_rating <= 5),
  instructor_rating INTEGER CHECK (instructor_rating >= 1 AND instructor_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),

  -- Status
  is_published BOOLEAN NOT NULL DEFAULT true,
  is_verified_purchase BOOLEAN NOT NULL DEFAULT true,

  -- Instructor Response
  instructor_response TEXT,
  instructor_responded_at TIMESTAMPTZ,

  -- Helpful Votes
  helpful_count INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(course_id, user_id)
);

CREATE INDEX idx_course_reviews_course ON course_reviews(course_id, created_at DESC);
CREATE INDEX idx_course_reviews_user ON course_reviews(user_id);
CREATE INDEX idx_course_reviews_rating ON course_reviews(rating);
CREATE INDEX idx_course_reviews_published ON course_reviews(is_published) WHERE is_published = true;

CREATE TRIGGER update_course_reviews_updated_at
  BEFORE UPDATE ON course_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- WORKSHOP FEEDBACK TABLE
-- =====================================================
-- Post-workshop feedback from attendees

CREATE TABLE workshop_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  registration_id UUID NOT NULL REFERENCES workshop_registrations(id) ON DELETE CASCADE,

  -- Satisfaction Rating
  overall_satisfaction INTEGER NOT NULL CHECK (overall_satisfaction >= 1 AND overall_satisfaction <= 5),
  content_rating INTEGER CHECK (content_rating >= 1 AND content_rating <= 5),
  delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  interaction_rating INTEGER CHECK (interaction_rating >= 1 AND interaction_rating <= 5),

  -- Feedback
  what_went_well TEXT,
  what_could_improve TEXT,
  would_recommend BOOLEAN,

  -- NPS Score
  nps_score INTEGER CHECK (nps_score >= 0 AND nps_score <= 10),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(workshop_id, user_id)
);

CREATE INDEX idx_workshop_feedback_workshop ON workshop_feedback(workshop_id, submitted_at DESC);
CREATE INDEX idx_workshop_feedback_user ON workshop_feedback(user_id);
CREATE INDEX idx_workshop_feedback_satisfaction ON workshop_feedback(overall_satisfaction);
CREATE INDEX idx_workshop_feedback_nps ON workshop_feedback(nps_score);

-- =====================================================
-- COURSE CO-INSTRUCTORS TABLE (Many-to-Many)
-- =====================================================
-- Support for multiple instructors teaching the same course

CREATE TABLE course_instructors (
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'co-instructor' CHECK (role IN ('primary', 'co-instructor', 'assistant')),
  permissions JSONB DEFAULT '{
    "edit_content": false,
    "manage_students": true,
    "view_analytics": true,
    "manage_reviews": false
  }'::jsonb,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (course_id, instructor_id)
);

CREATE INDEX idx_course_instructors_instructor ON course_instructors(instructor_id);
CREATE INDEX idx_course_instructors_role ON course_instructors(role);

-- =====================================================
-- WORKSHOP CO-FACILITATORS TABLE (Many-to-Many)
-- =====================================================
-- Support for multiple facilitators for workshops

CREATE TABLE workshop_facilitators (
  workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  facilitator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'co-facilitator' CHECK (role IN ('primary', 'co-facilitator', 'assistant')),
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (workshop_id, facilitator_id)
);

CREATE INDEX idx_workshop_facilitators_facilitator ON workshop_facilitators(facilitator_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE instructor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructor_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_facilitators ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- INSTRUCTOR PROFILES POLICIES
-- =====================================================

CREATE POLICY "Anyone can view verified instructor profiles"
  ON instructor_profiles FOR SELECT
  USING (is_verified = true OR is_featured = true);

CREATE POLICY "Instructors can view their own profile"
  ON instructor_profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Instructors can update their own profile"
  ON instructor_profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Instructors can insert their own profile"
  ON instructor_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Platform admins can manage all profiles"
  ON instructor_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- INSTRUCTOR SETTINGS POLICIES
-- =====================================================

CREATE POLICY "Instructors can view their own settings"
  ON instructor_settings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Instructors can manage their own settings"
  ON instructor_settings FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- COURSES POLICIES (UPDATE)
-- =====================================================
-- Add policies for instructor-owned courses

CREATE POLICY "Instructors can view their own courses"
  ON courses FOR SELECT
  USING (
    instructor_id = auth.uid()
    OR instructor_id IN (
      SELECT instructor_id FROM course_instructors
      WHERE course_id = courses.id AND instructor_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can create courses"
  ON courses FOR INSERT
  WITH CHECK (
    instructor_id = auth.uid()
  );

CREATE POLICY "Instructors can update their own courses"
  ON courses FOR UPDATE
  USING (
    instructor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM course_instructors
      WHERE course_id = courses.id
      AND instructor_id = auth.uid()
      AND (permissions->>'edit_content')::boolean = true
    )
  )
  WITH CHECK (
    instructor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM course_instructors
      WHERE course_id = courses.id
      AND instructor_id = auth.uid()
      AND (permissions->>'edit_content')::boolean = true
    )
  );

CREATE POLICY "Instructors can delete their own courses"
  ON courses FOR DELETE
  USING (instructor_id = auth.uid());

CREATE POLICY "Org admins can view org courses"
  ON courses FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'org_admin')
    )
  );

-- =====================================================
-- WORKSHOPS POLICIES (UPDATE)
-- =====================================================

CREATE POLICY "Instructors can view their own workshops"
  ON workshops FOR SELECT
  USING (
    instructor_id = auth.uid()
    OR instructor_id IN (
      SELECT facilitator_id FROM workshop_facilitators
      WHERE workshop_id = workshops.id AND facilitator_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can create workshops"
  ON workshops FOR INSERT
  WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "Instructors can update their own workshops"
  ON workshops FOR UPDATE
  USING (
    instructor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM workshop_facilitators
      WHERE workshop_id = workshops.id AND facilitator_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can delete their own workshops"
  ON workshops FOR DELETE
  USING (instructor_id = auth.uid());

CREATE POLICY "Org admins can view org workshops"
  ON workshops FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'org_admin')
    )
  );

-- =====================================================
-- COURSE ENROLLMENTS POLICIES (UPDATE)
-- =====================================================

CREATE POLICY "Instructors can view enrollments for their courses"
  ON course_enrollments FOR SELECT
  USING (
    course_id IN (
      SELECT id FROM courses
      WHERE instructor_id = auth.uid()
    )
    OR course_id IN (
      SELECT course_id FROM course_instructors
      WHERE instructor_id = auth.uid()
      AND (permissions->>'manage_students')::boolean = true
    )
  );

CREATE POLICY "Instructors can update enrollments for their courses"
  ON course_enrollments FOR UPDATE
  USING (
    course_id IN (
      SELECT id FROM courses
      WHERE instructor_id = auth.uid()
    )
    OR course_id IN (
      SELECT course_id FROM course_instructors
      WHERE instructor_id = auth.uid()
      AND (permissions->>'manage_students')::boolean = true
    )
  );

-- =====================================================
-- WORKSHOP REGISTRATIONS POLICIES (UPDATE)
-- =====================================================

CREATE POLICY "Instructors can view registrations for their workshops"
  ON workshop_registrations FOR SELECT
  USING (
    workshop_id IN (
      SELECT id FROM workshops
      WHERE instructor_id = auth.uid()
    )
    OR workshop_id IN (
      SELECT workshop_id FROM workshop_facilitators
      WHERE facilitator_id = auth.uid()
    )
  );

-- =====================================================
-- STUDENT PROGRESS POLICIES
-- =====================================================

CREATE POLICY "Instructors can view progress for their students"
  ON student_progress FOR SELECT
  USING (
    course_id IN (
      SELECT id FROM courses
      WHERE instructor_id = auth.uid()
    )
    OR course_id IN (
      SELECT course_id FROM course_instructors
      WHERE instructor_id = auth.uid()
      AND (permissions->>'view_analytics')::boolean = true
    )
  );

CREATE POLICY "Students can view their own progress"
  ON student_progress FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Platform admins can view all progress"
  ON student_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- STUDENT ACTIVITY POLICIES
-- =====================================================

CREATE POLICY "Instructors can view their students' activity"
  ON student_activity FOR SELECT
  USING (instructor_id = auth.uid());

CREATE POLICY "Students can view their own activity"
  ON student_activity FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Platform admins can view all activity"
  ON student_activity FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- REVENUE TRANSACTIONS POLICIES
-- =====================================================

CREATE POLICY "Instructors can view their own transactions"
  ON revenue_transactions FOR SELECT
  USING (instructor_id = auth.uid());

CREATE POLICY "Platform admins can view all transactions"
  ON revenue_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Platform admins can manage transactions"
  ON revenue_transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- COURSE REVIEWS POLICIES
-- =====================================================

CREATE POLICY "Anyone can view published reviews"
  ON course_reviews FOR SELECT
  USING (is_published = true);

CREATE POLICY "Students can create reviews for enrolled courses"
  ON course_reviews FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM course_enrollments
      WHERE user_id = auth.uid()
      AND course_id = course_reviews.course_id
      AND status = 'completed'
    )
  );

CREATE POLICY "Students can update their own reviews"
  ON course_reviews FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Instructors can view reviews for their courses"
  ON course_reviews FOR SELECT
  USING (
    course_id IN (
      SELECT id FROM courses
      WHERE instructor_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can respond to reviews"
  ON course_reviews FOR UPDATE
  USING (
    course_id IN (
      SELECT id FROM courses
      WHERE instructor_id = auth.uid()
    )
  )
  WITH CHECK (
    course_id IN (
      SELECT id FROM courses
      WHERE instructor_id = auth.uid()
    )
  );

-- =====================================================
-- WORKSHOP FEEDBACK POLICIES
-- =====================================================

CREATE POLICY "Students can create feedback for attended workshops"
  ON workshop_feedback FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM workshop_registrations
      WHERE user_id = auth.uid()
      AND workshop_id = workshop_feedback.workshop_id
      AND status = 'attended'
    )
  );

CREATE POLICY "Students can view their own feedback"
  ON workshop_feedback FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Instructors can view feedback for their workshops"
  ON workshop_feedback FOR SELECT
  USING (
    workshop_id IN (
      SELECT id FROM workshops
      WHERE instructor_id = auth.uid()
    )
  );

-- =====================================================
-- COURSE INSTRUCTORS POLICIES
-- =====================================================

CREATE POLICY "Anyone can view course instructors for published courses"
  ON course_instructors FOR SELECT
  USING (
    course_id IN (
      SELECT id FROM courses WHERE is_published = true
    )
  );

CREATE POLICY "Primary instructors can manage co-instructors"
  ON course_instructors FOR ALL
  USING (
    course_id IN (
      SELECT id FROM courses WHERE instructor_id = auth.uid()
    )
  );

-- =====================================================
-- WORKSHOP FACILITATORS POLICIES
-- =====================================================

CREATE POLICY "Anyone can view facilitators for published workshops"
  ON workshop_facilitators FOR SELECT
  USING (
    workshop_id IN (
      SELECT id FROM workshops WHERE status = 'published'
    )
  );

CREATE POLICY "Primary instructors can manage facilitators"
  ON workshop_facilitators FOR ALL
  USING (
    workshop_id IN (
      SELECT id FROM workshops WHERE instructor_id = auth.uid()
    )
  );

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Auto-create student_progress when enrollment is created
CREATE OR REPLACE FUNCTION create_student_progress()
RETURNS TRIGGER AS $$
DECLARE
  lesson_count INTEGER;
BEGIN
  -- Get total lessons for the course
  SELECT COUNT(*) INTO lesson_count
  FROM course_lessons cl
  JOIN course_modules cm ON cl.module_id = cm.id
  WHERE cm.course_id = NEW.course_id;

  -- Create student_progress record
  INSERT INTO student_progress (
    enrollment_id,
    user_id,
    course_id,
    total_lessons
  ) VALUES (
    NEW.id,
    NEW.user_id,
    NEW.course_id,
    lesson_count
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_student_progress_trigger
  AFTER INSERT ON course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION create_student_progress();

-- Trigger: Update student_progress when lesson_progress changes
CREATE OR REPLACE FUNCTION update_student_progress_from_lesson()
RETURNS TRIGGER AS $$
DECLARE
  enrollment_record RECORD;
BEGIN
  -- Get enrollment details
  SELECT * INTO enrollment_record
  FROM course_enrollments
  WHERE id = NEW.enrollment_id;

  -- Update student_progress
  UPDATE student_progress
  SET
    completed_lessons = (
      SELECT COUNT(*)
      FROM lesson_progress
      WHERE enrollment_id = NEW.enrollment_id
      AND is_completed = true
    ),
    progress_percentage = (
      SELECT LEAST(100, GREATEST(0,
        CASE
          WHEN total_lessons > 0
          THEN (COUNT(*) FILTER (WHERE is_completed = true) * 100) / total_lessons
          ELSE 0
        END
      ))
      FROM lesson_progress
      WHERE enrollment_id = NEW.enrollment_id
    ),
    total_watch_time_seconds = (
      SELECT COALESCE(SUM(time_spent_seconds), 0)
      FROM lesson_progress
      WHERE enrollment_id = NEW.enrollment_id
    ),
    last_activity_at = NEW.last_accessed_at,
    updated_at = now()
  WHERE enrollment_id = NEW.enrollment_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_student_progress_from_lesson_trigger
  AFTER INSERT OR UPDATE ON lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_student_progress_from_lesson();

-- Trigger: Update course stats when enrollment created/updated
CREATE OR REPLACE FUNCTION update_course_enrollment_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE courses
    SET
      enrolled_count = enrolled_count + 1,
      updated_at = now()
    WHERE id = NEW.course_id;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Update completed count
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
      UPDATE courses
      SET
        completed_count = completed_count + 1,
        updated_at = now()
      WHERE id = NEW.course_id;
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    UPDATE courses
    SET
      enrolled_count = GREATEST(0, enrolled_count - 1),
      completed_count = CASE
        WHEN OLD.status = 'completed'
        THEN GREATEST(0, completed_count - 1)
        ELSE completed_count
      END,
      updated_at = now()
    WHERE id = OLD.course_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_course_enrollment_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_course_enrollment_stats();

-- Trigger: Update workshop stats when registration created/updated
CREATE OR REPLACE FUNCTION update_workshop_registration_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE workshops
    SET
      enrolled_count = enrolled_count + 1,
      updated_at = now()
    WHERE id = NEW.workshop_id;

  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'attended' AND OLD.status != 'attended' THEN
      UPDATE workshops
      SET
        attended_count = attended_count + 1,
        updated_at = now()
      WHERE id = NEW.workshop_id;
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    UPDATE workshops
    SET
      enrolled_count = GREATEST(0, enrolled_count - 1),
      attended_count = CASE
        WHEN OLD.status = 'attended'
        THEN GREATEST(0, attended_count - 1)
        ELSE attended_count
      END,
      updated_at = now()
    WHERE id = OLD.workshop_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workshop_registration_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON workshop_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_workshop_registration_stats();

-- Trigger: Update course rating when review created/updated/deleted
CREATE OR REPLACE FUNCTION update_course_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE courses
    SET
      average_rating = (
        SELECT AVG(rating)
        FROM course_reviews
        WHERE course_id = OLD.course_id
        AND is_published = true
      ),
      review_count = (
        SELECT COUNT(*)
        FROM course_reviews
        WHERE course_id = OLD.course_id
        AND is_published = true
      ),
      updated_at = now()
    WHERE id = OLD.course_id;
    RETURN OLD;
  ELSE
    UPDATE courses
    SET
      average_rating = (
        SELECT AVG(rating)
        FROM course_reviews
        WHERE course_id = NEW.course_id
        AND is_published = true
      ),
      review_count = (
        SELECT COUNT(*)
        FROM course_reviews
        WHERE course_id = NEW.course_id
        AND is_published = true
      ),
      updated_at = now()
    WHERE id = NEW.course_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_course_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON course_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_course_rating();

-- Trigger: Update workshop satisfaction when feedback created/updated/deleted
CREATE OR REPLACE FUNCTION update_workshop_satisfaction()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE workshops
    SET
      average_satisfaction = (
        SELECT AVG(overall_satisfaction)
        FROM workshop_feedback
        WHERE workshop_id = OLD.workshop_id
      ),
      feedback_count = (
        SELECT COUNT(*)
        FROM workshop_feedback
        WHERE workshop_id = OLD.workshop_id
      ),
      updated_at = now()
    WHERE id = OLD.workshop_id;
    RETURN OLD;
  ELSE
    UPDATE workshops
    SET
      average_satisfaction = (
        SELECT AVG(overall_satisfaction)
        FROM workshop_feedback
        WHERE workshop_id = NEW.workshop_id
      ),
      feedback_count = (
        SELECT COUNT(*)
        FROM workshop_feedback
        WHERE workshop_id = NEW.workshop_id
      ),
      updated_at = now()
    WHERE id = NEW.workshop_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workshop_satisfaction_trigger
  AFTER INSERT OR UPDATE OR DELETE ON workshop_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_workshop_satisfaction();

-- Trigger: Update instructor profile stats
CREATE OR REPLACE FUNCTION update_instructor_stats()
RETURNS TRIGGER AS $$
DECLARE
  instructor_user_id UUID;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    instructor_user_id := NEW.instructor_id;
  ELSE
    instructor_user_id := OLD.instructor_id;
  END IF;

  UPDATE instructor_profiles
  SET
    total_students = (
      SELECT COUNT(DISTINCT ce.user_id)
      FROM course_enrollments ce
      JOIN courses c ON ce.course_id = c.id
      WHERE c.instructor_id = instructor_user_id
    ),
    total_courses = (
      SELECT COUNT(*)
      FROM courses
      WHERE instructor_id = instructor_user_id
      AND status = 'published'
    ),
    total_workshops = (
      SELECT COUNT(*)
      FROM workshops
      WHERE instructor_id = instructor_user_id
      AND status IN ('published', 'in_progress', 'completed')
    ),
    average_rating = (
      SELECT AVG(cr.rating)
      FROM course_reviews cr
      JOIN courses c ON cr.course_id = c.id
      WHERE c.instructor_id = instructor_user_id
      AND cr.is_published = true
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM course_reviews cr
      JOIN courses c ON cr.course_id = c.id
      WHERE c.instructor_id = instructor_user_id
      AND cr.is_published = true
    ),
    updated_at = now()
  WHERE user_id = instructor_user_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_instructor_stats_from_courses_trigger
  AFTER INSERT OR UPDATE OR DELETE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_instructor_stats();

CREATE TRIGGER update_instructor_stats_from_workshops_trigger
  AFTER INSERT OR UPDATE OR DELETE ON workshops
  FOR EACH ROW
  EXECUTE FUNCTION update_instructor_stats();

CREATE TRIGGER update_instructor_stats_from_enrollments_trigger
  AFTER INSERT OR DELETE ON course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_instructor_stats();

-- Trigger: Log student activity when enrollments/progress changes
CREATE OR REPLACE FUNCTION log_student_activity()
RETURNS TRIGGER AS $$
DECLARE
  instructor_user_id UUID;
  activity_msg TEXT;
  activity_kind activity_type;
BEGIN
  -- Get instructor for this course
  SELECT instructor_id INTO instructor_user_id
  FROM courses
  WHERE id = NEW.course_id;

  -- Determine activity type and message
  IF TG_TABLE_NAME = 'course_enrollments' THEN
    IF TG_OP = 'INSERT' THEN
      activity_kind := 'enrolled';
      SELECT title INTO activity_msg FROM courses WHERE id = NEW.course_id;
      activity_msg := 'Enrolled in ' || activity_msg;
    ELSIF NEW.status = 'completed' AND OLD.status != 'completed' THEN
      activity_kind := 'course_completed';
      SELECT title INTO activity_msg FROM courses WHERE id = NEW.course_id;
      activity_msg := 'Completed ' || activity_msg;
    END IF;
  END IF;

  -- Insert activity log
  IF activity_kind IS NOT NULL AND instructor_user_id IS NOT NULL THEN
    INSERT INTO student_activity (
      instructor_id,
      student_id,
      activity_type,
      activity_title,
      course_id,
      occurred_at
    ) VALUES (
      instructor_user_id,
      NEW.user_id,
      activity_kind,
      activity_msg,
      NEW.course_id,
      now()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_enrollment_activity_trigger
  AFTER INSERT OR UPDATE ON course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION log_student_activity();

-- Trigger: Create revenue transaction when enrollment is paid
CREATE OR REPLACE FUNCTION create_revenue_transaction_from_enrollment()
RETURNS TRIGGER AS $$
DECLARE
  course_price DECIMAL(10,2);
  instructor_user_id UUID;
  platform_fee DECIMAL(5,2) := 20.00; -- 20% platform fee
  fee_amount DECIMAL(10,2);
  earnings DECIMAL(10,2);
BEGIN
  -- Only create transaction for paid enrollments
  IF NEW.status = 'enrolled' AND OLD.status IS DISTINCT FROM 'enrolled' THEN
    -- Get course price and instructor
    SELECT price_amount, instructor_id INTO course_price, instructor_user_id
    FROM courses
    WHERE id = NEW.course_id;

    -- Calculate fees
    fee_amount := (course_price * platform_fee) / 100;
    earnings := course_price - fee_amount;

    -- Create transaction
    INSERT INTO revenue_transactions (
      instructor_id,
      student_id,
      transaction_type,
      amount,
      platform_fee_percentage,
      platform_fee_amount,
      instructor_earnings,
      course_id,
      enrollment_id,
      payment_status,
      transaction_date
    ) VALUES (
      instructor_user_id,
      NEW.user_id,
      'course_enrollment',
      course_price,
      platform_fee,
      fee_amount,
      earnings,
      NEW.course_id,
      NEW.id,
      'completed',
      now()
    );

    -- Update course total revenue
    UPDATE courses
    SET total_revenue = total_revenue + course_price
    WHERE id = NEW.course_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_revenue_transaction_from_enrollment_trigger
  AFTER INSERT OR UPDATE ON course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION create_revenue_transaction_from_enrollment();

-- Trigger: Create revenue transaction when workshop registration is paid
CREATE OR REPLACE FUNCTION create_revenue_transaction_from_workshop()
RETURNS TRIGGER AS $$
DECLARE
  workshop_price DECIMAL(10,2);
  instructor_user_id UUID;
  platform_fee DECIMAL(5,2) := 20.00;
  fee_amount DECIMAL(10,2);
  earnings DECIMAL(10,2);
BEGIN
  IF NEW.payment_status = 'completed' AND OLD.payment_status IS DISTINCT FROM 'completed' THEN
    -- Get workshop price and instructor
    SELECT price_amount, instructor_id INTO workshop_price, instructor_user_id
    FROM workshops
    WHERE id = NEW.workshop_id;

    -- Calculate fees
    fee_amount := (workshop_price * platform_fee) / 100;
    earnings := workshop_price - fee_amount;

    -- Create transaction
    INSERT INTO revenue_transactions (
      instructor_id,
      student_id,
      transaction_type,
      amount,
      platform_fee_percentage,
      platform_fee_amount,
      instructor_earnings,
      workshop_id,
      workshop_registration_id,
      payment_status,
      transaction_date
    ) VALUES (
      instructor_user_id,
      NEW.user_id,
      'workshop_registration',
      workshop_price,
      platform_fee,
      fee_amount,
      earnings,
      NEW.workshop_id,
      NEW.id,
      'completed',
      now()
    );

    -- Update workshop total revenue
    UPDATE workshops
    SET total_revenue = total_revenue + workshop_price
    WHERE id = NEW.workshop_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_revenue_transaction_from_workshop_trigger
  AFTER INSERT OR UPDATE ON workshop_registrations
  FOR EACH ROW
  EXECUTE FUNCTION create_revenue_transaction_from_workshop();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function: Get instructor dashboard overview
CREATE OR REPLACE FUNCTION get_instructor_dashboard_stats(p_instructor_id UUID)
RETURNS TABLE(
  total_students INTEGER,
  total_courses INTEGER,
  total_workshops INTEGER,
  total_revenue DECIMAL(12,2),
  pending_revenue DECIMAL(12,2),
  average_rating DECIMAL(3,2),
  total_reviews INTEGER,
  active_enrollments INTEGER,
  upcoming_workshops INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(DISTINCT ce.user_id)
     FROM course_enrollments ce
     JOIN courses c ON ce.course_id = c.id
     WHERE c.instructor_id = p_instructor_id)::INTEGER,

    (SELECT COUNT(*)
     FROM courses
     WHERE instructor_id = p_instructor_id
     AND status = 'published')::INTEGER,

    (SELECT COUNT(*)
     FROM workshops
     WHERE instructor_id = p_instructor_id
     AND status IN ('published', 'in_progress', 'completed'))::INTEGER,

    (SELECT COALESCE(SUM(instructor_earnings), 0)
     FROM revenue_transactions
     WHERE instructor_id = p_instructor_id
     AND payment_status = 'completed'),

    (SELECT COALESCE(SUM(instructor_earnings), 0)
     FROM revenue_transactions
     WHERE instructor_id = p_instructor_id
     AND payment_status = 'pending'),

    (SELECT AVG(cr.rating)
     FROM course_reviews cr
     JOIN courses c ON cr.course_id = c.id
     WHERE c.instructor_id = p_instructor_id
     AND cr.is_published = true),

    (SELECT COUNT(*)
     FROM course_reviews cr
     JOIN courses c ON cr.course_id = c.id
     WHERE c.instructor_id = p_instructor_id
     AND cr.is_published = true)::INTEGER,

    (SELECT COUNT(*)
     FROM course_enrollments ce
     JOIN courses c ON ce.course_id = c.id
     WHERE c.instructor_id = p_instructor_id
     AND ce.status IN ('enrolled', 'in_progress'))::INTEGER,

    (SELECT COUNT(*)
     FROM workshops
     WHERE instructor_id = p_instructor_id
     AND status = 'published'
     AND start_time > now())::INTEGER;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get student progress for instructor
CREATE OR REPLACE FUNCTION get_instructor_student_progress(
  p_instructor_id UUID,
  p_course_id UUID DEFAULT NULL
)
RETURNS TABLE(
  student_id UUID,
  student_name TEXT,
  student_email TEXT,
  student_avatar TEXT,
  course_id UUID,
  course_title TEXT,
  progress_percentage INTEGER,
  last_activity_at TIMESTAMPTZ,
  enrollment_date TIMESTAMPTZ,
  status enrollment_status
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.full_name,
    u.email,
    u.avatar_url,
    c.id,
    c.title,
    sp.progress_percentage,
    sp.last_activity_at,
    ce.enrolled_at,
    ce.status
  FROM student_progress sp
  JOIN course_enrollments ce ON sp.enrollment_id = ce.id
  JOIN courses c ON sp.course_id = c.id
  JOIN users u ON sp.user_id = u.id
  WHERE c.instructor_id = p_instructor_id
  AND (p_course_id IS NULL OR c.id = p_course_id)
  ORDER BY sp.last_activity_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get instructor revenue breakdown
CREATE OR REPLACE FUNCTION get_instructor_revenue_breakdown(
  p_instructor_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE(
  transaction_type transaction_type,
  transaction_count INTEGER,
  total_amount DECIMAL(12,2),
  total_fees DECIMAL(12,2),
  total_earnings DECIMAL(12,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rt.transaction_type,
    COUNT(*)::INTEGER,
    SUM(rt.amount),
    SUM(rt.platform_fee_amount),
    SUM(rt.instructor_earnings)
  FROM revenue_transactions rt
  WHERE rt.instructor_id = p_instructor_id
  AND rt.payment_status = 'completed'
  AND (p_start_date IS NULL OR rt.transaction_date >= p_start_date)
  AND (p_end_date IS NULL OR rt.transaction_date <= p_end_date)
  GROUP BY rt.transaction_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get recent student activity for instructor
CREATE OR REPLACE FUNCTION get_instructor_recent_activity(
  p_instructor_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE(
  id UUID,
  student_id UUID,
  student_name TEXT,
  student_avatar TEXT,
  activity_type activity_type,
  activity_title TEXT,
  activity_description TEXT,
  course_title TEXT,
  workshop_title TEXT,
  occurred_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sa.id,
    sa.student_id,
    u.full_name,
    u.avatar_url,
    sa.activity_type,
    sa.activity_title,
    sa.activity_description,
    c.title,
    w.title,
    sa.occurred_at
  FROM student_activity sa
  JOIN users u ON sa.student_id = u.id
  LEFT JOIN courses c ON sa.course_id = c.id
  LEFT JOIN workshops w ON sa.workshop_id = w.id
  WHERE sa.instructor_id = p_instructor_id
  ORDER BY sa.occurred_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View: Instructor course performance
CREATE VIEW instructor_course_performance AS
SELECT
  c.id AS course_id,
  c.instructor_id,
  c.title AS course_title,
  c.status,
  c.enrolled_count,
  c.completed_count,
  c.average_rating,
  c.review_count,
  c.total_revenue,
  CASE
    WHEN c.enrolled_count > 0
    THEN ROUND((c.completed_count::DECIMAL / c.enrolled_count::DECIMAL) * 100, 2)
    ELSE 0
  END AS completion_rate,
  (
    SELECT COUNT(DISTINCT ce.user_id)
    FROM course_enrollments ce
    WHERE ce.course_id = c.id
    AND ce.last_accessed_at > now() - INTERVAL '7 days'
  ) AS active_students_last_7_days,
  c.created_at,
  c.published_at
FROM courses c;

-- View: Instructor workshop performance
CREATE VIEW instructor_workshop_performance AS
SELECT
  w.id AS workshop_id,
  w.instructor_id,
  w.title AS workshop_title,
  w.status,
  w.start_time,
  w.end_time,
  w.enrolled_count,
  w.attended_count,
  w.capacity_total,
  w.average_satisfaction,
  w.feedback_count,
  w.total_revenue,
  CASE
    WHEN w.enrolled_count > 0
    THEN ROUND((w.attended_count::DECIMAL / w.enrolled_count::DECIMAL) * 100, 2)
    ELSE 0
  END AS attendance_rate,
  ROUND(((w.capacity_total - w.capacity_remaining)::DECIMAL / w.capacity_total::DECIMAL) * 100, 2) AS capacity_filled_percentage,
  w.created_at
FROM workshops w;

-- View: Student engagement summary
CREATE VIEW student_engagement_summary AS
SELECT
  sp.user_id,
  u.full_name,
  u.email,
  u.avatar_url,
  COUNT(DISTINCT sp.course_id) AS total_courses,
  AVG(sp.progress_percentage) AS avg_progress,
  SUM(sp.total_watch_time_seconds) AS total_watch_time,
  MAX(sp.last_activity_at) AS last_activity,
  SUM(sp.completed_lessons) AS total_lessons_completed,
  SUM(sp.comments_count) AS total_comments,
  SUM(sp.questions_count) AS total_questions,
  AVG(sp.engagement_score) AS avg_engagement_score
FROM student_progress sp
JOIN users u ON sp.user_id = u.id
GROUP BY sp.user_id, u.full_name, u.email, u.avatar_url;

-- =====================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================

-- Composite indexes for common query patterns
CREATE INDEX idx_student_progress_course_activity ON student_progress(course_id, last_activity_at DESC);
CREATE INDEX idx_student_progress_user_course ON student_progress(user_id, course_id);
CREATE INDEX idx_revenue_instructor_date ON revenue_transactions(instructor_id, transaction_date DESC);
CREATE INDEX idx_student_activity_instructor_occurred ON student_activity(instructor_id, occurred_at DESC);

-- Partial indexes for active/recent data
CREATE INDEX idx_courses_instructor_published ON courses(instructor_id) WHERE status = 'published';
CREATE INDEX idx_workshops_instructor_upcoming ON workshops(instructor_id, start_time) WHERE status = 'published' AND start_time > now();
CREATE INDEX idx_enrollments_active ON course_enrollments(course_id, user_id) WHERE status IN ('enrolled', 'in_progress');

-- =====================================================
-- ROLLBACK SCRIPT (for emergency use)
-- =====================================================

/*
-- WARNING: This will destroy all instructor data! Use with extreme caution.

-- Drop all views
DROP VIEW IF EXISTS student_engagement_summary;
DROP VIEW IF EXISTS instructor_workshop_performance;
DROP VIEW IF EXISTS instructor_course_performance;

-- Drop all triggers
DROP TRIGGER IF EXISTS create_revenue_transaction_from_workshop_trigger ON workshop_registrations;
DROP TRIGGER IF EXISTS create_revenue_transaction_from_enrollment_trigger ON course_enrollments;
DROP TRIGGER IF EXISTS log_enrollment_activity_trigger ON course_enrollments;
DROP TRIGGER IF EXISTS update_instructor_stats_from_enrollments_trigger ON course_enrollments;
DROP TRIGGER IF EXISTS update_instructor_stats_from_workshops_trigger ON workshops;
DROP TRIGGER IF EXISTS update_instructor_stats_from_courses_trigger ON courses;
DROP TRIGGER IF EXISTS update_workshop_satisfaction_trigger ON workshop_feedback;
DROP TRIGGER IF EXISTS update_course_rating_trigger ON course_reviews;
DROP TRIGGER IF EXISTS update_workshop_registration_stats_trigger ON workshop_registrations;
DROP TRIGGER IF EXISTS update_course_enrollment_stats_trigger ON course_enrollments;
DROP TRIGGER IF EXISTS update_student_progress_from_lesson_trigger ON lesson_progress;
DROP TRIGGER IF EXISTS create_student_progress_trigger ON course_enrollments;
DROP TRIGGER IF EXISTS update_instructor_settings_updated_at ON instructor_settings;
DROP TRIGGER IF EXISTS update_instructor_profiles_updated_at ON instructor_profiles;

-- Drop all functions
DROP FUNCTION IF EXISTS get_instructor_recent_activity(UUID, INTEGER);
DROP FUNCTION IF EXISTS get_instructor_revenue_breakdown(UUID, TIMESTAMPTZ, TIMESTAMPTZ);
DROP FUNCTION IF EXISTS get_instructor_student_progress(UUID, UUID);
DROP FUNCTION IF EXISTS get_instructor_dashboard_stats(UUID);
DROP FUNCTION IF EXISTS create_revenue_transaction_from_workshop();
DROP FUNCTION IF EXISTS create_revenue_transaction_from_enrollment();
DROP FUNCTION IF EXISTS log_student_activity();
DROP FUNCTION IF EXISTS update_instructor_stats();
DROP FUNCTION IF EXISTS update_workshop_satisfaction();
DROP FUNCTION IF EXISTS update_course_rating();
DROP FUNCTION IF EXISTS update_workshop_registration_stats();
DROP FUNCTION IF EXISTS update_course_enrollment_stats();
DROP FUNCTION IF EXISTS update_student_progress_from_lesson();
DROP FUNCTION IF EXISTS create_student_progress();

-- Drop all tables
DROP TABLE IF EXISTS workshop_facilitators CASCADE;
DROP TABLE IF EXISTS course_instructors CASCADE;
DROP TABLE IF EXISTS workshop_feedback CASCADE;
DROP TABLE IF EXISTS course_reviews CASCADE;
DROP TABLE IF EXISTS revenue_transactions CASCADE;
DROP TABLE IF EXISTS student_activity CASCADE;
DROP TABLE IF EXISTS student_progress CASCADE;
DROP TABLE IF EXISTS instructor_settings CASCADE;
DROP TABLE IF EXISTS instructor_profiles CASCADE;

-- Revert courses table changes
ALTER TABLE courses DROP COLUMN IF EXISTS allow_comments;
ALTER TABLE courses DROP COLUMN IF EXISTS allow_qa;
ALTER TABLE courses DROP COLUMN IF EXISTS drip_content;
ALTER TABLE courses DROP COLUMN IF EXISTS drip_schedule;
ALTER TABLE courses DROP COLUMN IF EXISTS certificate_enabled;
ALTER TABLE courses DROP COLUMN IF EXISTS certificate_template_url;
ALTER TABLE courses DROP COLUMN IF EXISTS total_revenue;
ALTER TABLE courses DROP COLUMN IF EXISTS review_count;
ALTER TABLE courses DROP COLUMN IF EXISTS average_rating;
ALTER TABLE courses DROP COLUMN IF EXISTS completed_count;
ALTER TABLE courses DROP COLUMN IF EXISTS enrolled_count;
ALTER TABLE courses DROP COLUMN IF EXISTS language;
ALTER TABLE courses DROP COLUMN IF EXISTS target_audience;
ALTER TABLE courses DROP COLUMN IF EXISTS what_you_will_learn;
ALTER TABLE courses DROP COLUMN IF EXISTS tags;
ALTER TABLE courses DROP COLUMN IF EXISTS category;
ALTER TABLE courses DROP COLUMN IF EXISTS status;
ALTER TABLE courses DROP COLUMN IF EXISTS organization_id;
ALTER TABLE courses DROP COLUMN IF EXISTS instructor_id;

-- Revert workshops table changes
ALTER TABLE workshops DROP COLUMN IF EXISTS certificate_template_url;
ALTER TABLE workshops DROP COLUMN IF EXISTS certificate_enabled;
ALTER TABLE workshops DROP COLUMN IF EXISTS total_revenue;
ALTER TABLE workshops DROP COLUMN IF EXISTS feedback_count;
ALTER TABLE workshops DROP COLUMN IF EXISTS average_satisfaction;
ALTER TABLE workshops DROP COLUMN IF EXISTS attended_count;
ALTER TABLE workshops DROP COLUMN IF EXISTS enrolled_count;
ALTER TABLE workshops DROP COLUMN IF EXISTS what_you_will_learn;
ALTER TABLE workshops DROP COLUMN IF EXISTS prerequisites;
ALTER TABLE workshops DROP COLUMN IF EXISTS tags;
ALTER TABLE workshops DROP COLUMN IF EXISTS type;
ALTER TABLE workshops DROP COLUMN IF EXISTS organization_id;

-- Drop enums
DROP TYPE IF EXISTS payout_schedule;
DROP TYPE IF EXISTS transaction_type;
DROP TYPE IF EXISTS activity_type;
DROP TYPE IF EXISTS workshop_type;
DROP TYPE IF EXISTS lesson_type;
DROP TYPE IF EXISTS course_difficulty;
DROP TYPE IF EXISTS course_status;
*/
