-- Migration: 001_multi_tenant_schema.sql
-- Description: Multi-tenant database schema for HumanGlue AI transformation platform
-- Created: 2025-10-04

-- =====================================================
-- EXTENSIONS
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE user_role AS ENUM ('admin', 'org_admin', 'team_lead', 'member');
CREATE TYPE assessment_status AS ENUM ('not_started', 'in_progress', 'completed', 'archived');
CREATE TYPE enrollment_status AS ENUM ('enrolled', 'in_progress', 'completed', 'dropped');
CREATE TYPE workshop_status AS ENUM ('draft', 'published', 'in_progress', 'completed', 'cancelled');
CREATE TYPE registration_status AS ENUM ('registered', 'waitlisted', 'attended', 'cancelled', 'no_show');
CREATE TYPE consultation_status AS ENUM ('requested', 'scheduled', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE content_type AS ENUM ('video', 'article', 'quiz', 'assignment', 'resource');
CREATE TYPE ai_pillar AS ENUM ('adaptability', 'coaching', 'marketplace');

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CORE MULTI-TENANT TABLES
-- =====================================================

-- Organizations table (top-level tenant isolation)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  website TEXT,
  industry TEXT,
  size_range TEXT CHECK (size_range IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+')),
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'professional', 'enterprise')),
  subscription_expires_at TIMESTAMPTZ,
  max_users INTEGER NOT NULL DEFAULT 5,
  max_teams INTEGER NOT NULL DEFAULT 1,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_active ON organizations(is_active) WHERE is_active = true;
CREATE INDEX idx_organizations_subscription ON organizations(subscription_tier, subscription_expires_at);

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Teams table (departments/groups within organizations)
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  parent_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, name)
);

CREATE INDEX idx_teams_organization ON teams(organization_id);
CREATE INDEX idx_teams_parent ON teams(parent_team_id);
CREATE INDEX idx_teams_active ON teams(is_active) WHERE is_active = true;

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  job_title TEXT,
  department TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  role user_role NOT NULL DEFAULT 'member',
  preferences JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- User-Team membership (many-to-many)
CREATE TABLE team_members (
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (team_id, user_id)
);

CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_team_members_role ON team_members(role);

-- =====================================================
-- ASSESSMENT TABLES
-- =====================================================

-- Assessment templates/types
CREATE TABLE assessment_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  pillar ai_pillar NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  questions JSONB NOT NULL, -- Array of question objects
  scoring_config JSONB NOT NULL, -- Scoring rules and weights
  duration_minutes INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_assessment_templates_pillar ON assessment_templates(pillar);
CREATE INDEX idx_assessment_templates_active ON assessment_templates(is_active) WHERE is_active = true;

CREATE TRIGGER update_assessment_templates_updated_at
  BEFORE UPDATE ON assessment_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- User assessments (instances)
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES assessment_templates(id) ON DELETE RESTRICT,
  status assessment_status NOT NULL DEFAULT 'not_started',

  -- Scores (0-100)
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  individual_score INTEGER CHECK (individual_score >= 0 AND individual_score <= 100),
  leadership_score INTEGER CHECK (leadership_score >= 0 AND leadership_score <= 100),
  cultural_score INTEGER CHECK (cultural_score >= 0 AND cultural_score <= 100),
  embedding_score INTEGER CHECK (embedding_score >= 0 AND embedding_score <= 100),
  velocity_score INTEGER CHECK (velocity_score >= 0 AND velocity_score <= 100),

  -- AI analysis results
  ai_insights JSONB DEFAULT '{}'::jsonb,
  recommendations JSONB DEFAULT '{}'::jsonb,

  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT valid_completion CHECK (
    (status = 'completed' AND completed_at IS NOT NULL AND overall_score IS NOT NULL)
    OR status != 'completed'
  )
);

CREATE INDEX idx_assessments_organization ON assessments(organization_id);
CREATE INDEX idx_assessments_user ON assessments(user_id);
CREATE INDEX idx_assessments_template ON assessments(template_id);
CREATE INDEX idx_assessments_status ON assessments(status);
CREATE INDEX idx_assessments_completed ON assessments(completed_at) WHERE completed_at IS NOT NULL;
CREATE INDEX idx_assessments_scores ON assessments(overall_score) WHERE overall_score IS NOT NULL;

CREATE TRIGGER update_assessments_updated_at
  BEFORE UPDATE ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Assessment responses (individual question answers)
CREATE TABLE assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL, -- Reference to question in template JSON
  question_number INTEGER NOT NULL,

  -- Response data
  response_text TEXT,
  response_audio_url TEXT, -- Voice recording URL
  response_duration_seconds INTEGER,

  -- AI analysis
  ai_transcription TEXT,
  ai_sentiment_score DECIMAL(3,2), -- -1.0 to 1.0
  ai_confidence_score DECIMAL(3,2), -- 0.0 to 1.0
  ai_analysis JSONB DEFAULT '{}'::jsonb,

  answered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_assessment_responses_assessment ON assessment_responses(assessment_id);
CREATE INDEX idx_assessment_responses_question ON assessment_responses(assessment_id, question_number);
CREATE INDEX idx_assessment_responses_answered ON assessment_responses(answered_at);

-- Assessment history (track score changes over time)
CREATE TABLE assessment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL,
  individual_score INTEGER,
  leadership_score INTEGER,
  cultural_score INTEGER,
  embedding_score INTEGER,
  velocity_score INTEGER,
  snapshot_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_assessment_history_user ON assessment_history(user_id, snapshot_date);
CREATE INDEX idx_assessment_history_org ON assessment_history(organization_id, snapshot_date);

-- =====================================================
-- LEARNING CONTENT TABLES
-- =====================================================

-- Courses
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  pillar ai_pillar NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  thumbnail_url TEXT,
  trailer_url TEXT,

  -- Instructor info
  instructor_name TEXT,
  instructor_bio TEXT,
  instructor_avatar_url TEXT,

  -- Course metadata
  duration_hours DECIMAL(5,2),
  estimated_effort TEXT, -- e.g., "2-3 hours/week"
  prerequisites TEXT[],
  learning_outcomes TEXT[],

  -- Pricing
  price_amount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (price_amount >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Publishing
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,

  sort_order INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_pillar ON courses(pillar);
CREATE INDEX idx_courses_level ON courses(level);
CREATE INDEX idx_courses_published ON courses(is_published) WHERE is_published = true;
CREATE INDEX idx_courses_sort ON courses(sort_order);

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Course modules
CREATE TABLE course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_course_modules_course ON course_modules(course_id, sort_order);

CREATE TRIGGER update_course_modules_updated_at
  BEFORE UPDATE ON course_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Course lessons
CREATE TABLE course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_type content_type NOT NULL,

  -- Content URLs
  video_url TEXT,
  video_duration_seconds INTEGER,
  article_content TEXT,
  resource_url TEXT,

  -- Quiz data (for quiz lessons)
  quiz_questions JSONB,
  quiz_passing_score INTEGER,

  sort_order INTEGER NOT NULL DEFAULT 0,
  is_preview BOOLEAN NOT NULL DEFAULT false, -- Free preview lesson
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_course_lessons_module ON course_lessons(module_id, sort_order);
CREATE INDEX idx_course_lessons_type ON course_lessons(content_type);
CREATE INDEX idx_course_lessons_preview ON course_lessons(is_preview) WHERE is_preview = true;

CREATE TRIGGER update_course_lessons_updated_at
  BEFORE UPDATE ON course_lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Course enrollments
CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status enrollment_status NOT NULL DEFAULT 'enrolled',

  -- Progress tracking
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  last_accessed_lesson_id UUID REFERENCES course_lessons(id) ON DELETE SET NULL,
  last_accessed_at TIMESTAMPTZ,

  -- Completion
  completed_at TIMESTAMPTZ,
  certificate_url TEXT,

  -- Enrollment details
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,

  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_course_enrollments_organization ON course_enrollments(organization_id);
CREATE INDEX idx_course_enrollments_user ON course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_course ON course_enrollments(course_id);
CREATE INDEX idx_course_enrollments_status ON course_enrollments(status);
CREATE INDEX idx_course_enrollments_progress ON course_enrollments(progress_percentage);

CREATE TRIGGER update_course_enrollments_updated_at
  BEFORE UPDATE ON course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Lesson progress (granular tracking)
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,

  is_completed BOOLEAN NOT NULL DEFAULT false,
  completion_percentage INTEGER NOT NULL DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,

  -- Quiz results (if applicable)
  quiz_score INTEGER,
  quiz_attempts INTEGER DEFAULT 0,

  last_accessed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(enrollment_id, lesson_id)
);

CREATE INDEX idx_lesson_progress_enrollment ON lesson_progress(enrollment_id);
CREATE INDEX idx_lesson_progress_lesson ON lesson_progress(lesson_id);
CREATE INDEX idx_lesson_progress_completed ON lesson_progress(is_completed);

CREATE TRIGGER update_lesson_progress_updated_at
  BEFORE UPDATE ON lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- WORKSHOP TABLES
-- =====================================================

-- Workshops/Events
CREATE TABLE workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  pillar ai_pillar NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),

  -- Instructor/facilitator
  instructor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  instructor_name TEXT NOT NULL,
  instructor_bio TEXT,
  instructor_avatar_url TEXT,

  -- Workshop details
  format TEXT NOT NULL CHECK (format IN ('online', 'in-person', 'hybrid')),
  location TEXT,
  meeting_url TEXT,
  duration_hours DECIMAL(5,2) NOT NULL,

  -- Capacity
  capacity_total INTEGER NOT NULL CHECK (capacity_total > 0),
  capacity_remaining INTEGER NOT NULL CHECK (capacity_remaining >= 0),
  waitlist_enabled BOOLEAN NOT NULL DEFAULT false,

  -- Pricing
  price_amount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (price_amount >= 0),
  price_early_bird DECIMAL(10,2) CHECK (price_early_bird IS NULL OR price_early_bird < price_amount),
  early_bird_deadline TIMESTAMPTZ,
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Schedule
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',

  -- Status
  status workshop_status NOT NULL DEFAULT 'draft',

  -- Resources
  thumbnail_url TEXT,
  materials_url TEXT,
  recording_url TEXT,

  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT valid_times CHECK (end_time > start_time),
  CONSTRAINT valid_capacity CHECK (capacity_remaining <= capacity_total)
);

CREATE INDEX idx_workshops_slug ON workshops(slug);
CREATE INDEX idx_workshops_pillar ON workshops(pillar);
CREATE INDEX idx_workshops_instructor ON workshops(instructor_id);
CREATE INDEX idx_workshops_status ON workshops(status);
CREATE INDEX idx_workshops_start_time ON workshops(start_time);
CREATE INDEX idx_workshops_available ON workshops(id) WHERE capacity_remaining > 0 AND status = 'published';

CREATE TRIGGER update_workshops_updated_at
  BEFORE UPDATE ON workshops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Workshop registrations
CREATE TABLE workshop_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  status registration_status NOT NULL DEFAULT 'registered',

  -- Payment
  payment_id UUID, -- Reference to payment system
  amount_paid DECIMAL(10,2),
  payment_status payment_status,

  -- Attendance
  attended BOOLEAN DEFAULT false,
  attendance_duration_minutes INTEGER,

  -- Feedback
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  feedback_submitted_at TIMESTAMPTZ,

  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(workshop_id, user_id)
);

CREATE INDEX idx_workshop_registrations_organization ON workshop_registrations(organization_id);
CREATE INDEX idx_workshop_registrations_workshop ON workshop_registrations(workshop_id);
CREATE INDEX idx_workshop_registrations_user ON workshop_registrations(user_id);
CREATE INDEX idx_workshop_registrations_status ON workshop_registrations(status);
CREATE INDEX idx_workshop_registrations_payment ON workshop_registrations(payment_status);

CREATE TRIGGER update_workshop_registrations_updated_at
  BEFORE UPDATE ON workshop_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- EXPERT CONSULTATION TABLES
-- =====================================================

-- Experts/Consultants
CREATE TABLE experts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT NOT NULL,
  avatar_url TEXT,

  -- Expertise
  specialties TEXT[] NOT NULL,
  pillars ai_pillar[] NOT NULL,
  years_experience INTEGER,

  -- Availability
  is_available BOOLEAN NOT NULL DEFAULT true,
  hourly_rate DECIMAL(10,2) NOT NULL CHECK (hourly_rate >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  timezone TEXT NOT NULL DEFAULT 'UTC',

  -- Booking settings
  session_duration_minutes INTEGER NOT NULL DEFAULT 60,
  buffer_minutes INTEGER NOT NULL DEFAULT 15,
  booking_advance_days INTEGER NOT NULL DEFAULT 1,

  -- Rating
  average_rating DECIMAL(3,2) CHECK (average_rating >= 0 AND average_rating <= 5),
  total_sessions INTEGER NOT NULL DEFAULT 0,

  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_experts_user ON experts(user_id);
CREATE INDEX idx_experts_available ON experts(is_available) WHERE is_available = true;
CREATE INDEX idx_experts_specialties ON experts USING GIN(specialties);
CREATE INDEX idx_experts_pillars ON experts USING GIN(pillars);
CREATE INDEX idx_experts_rating ON experts(average_rating) WHERE average_rating IS NOT NULL;

CREATE TRIGGER update_experts_updated_at
  BEFORE UPDATE ON experts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Expert availability slots
CREATE TABLE expert_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID NOT NULL REFERENCES experts(id) ON DELETE CASCADE,

  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,

  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  UNIQUE(expert_id, day_of_week, start_time)
);

CREATE INDEX idx_expert_availability_expert ON expert_availability(expert_id);
CREATE INDEX idx_expert_availability_active ON expert_availability(is_active) WHERE is_active = true;

CREATE TRIGGER update_expert_availability_updated_at
  BEFORE UPDATE ON expert_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Consultations/Bookings
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  expert_id UUID NOT NULL REFERENCES experts(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  status consultation_status NOT NULL DEFAULT 'requested',

  -- Schedule
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  duration_minutes INTEGER,

  -- Meeting details
  meeting_url TEXT,
  meeting_notes TEXT,

  -- Topics
  topics TEXT[] NOT NULL,
  pillar ai_pillar NOT NULL,
  description TEXT,

  -- Payment
  payment_id UUID,
  amount DECIMAL(10,2) NOT NULL,
  payment_status payment_status,

  -- Feedback
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  user_feedback TEXT,
  expert_notes TEXT,

  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT valid_schedule CHECK (scheduled_end > scheduled_start)
);

CREATE INDEX idx_consultations_organization ON consultations(organization_id);
CREATE INDEX idx_consultations_expert ON consultations(expert_id);
CREATE INDEX idx_consultations_user ON consultations(user_id);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_consultations_scheduled ON consultations(scheduled_start);
CREATE INDEX idx_consultations_payment ON consultations(payment_status);

CREATE TRIGGER update_consultations_updated_at
  BEFORE UPDATE ON consultations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RESOURCE/CONTENT LIBRARY TABLES
-- =====================================================

-- Resources (documents, templates, guides)
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,

  -- Categorization
  resource_type TEXT NOT NULL CHECK (resource_type IN ('document', 'template', 'guide', 'tool', 'video', 'article')),
  pillar ai_pillar,
  tags TEXT[],

  -- Content
  content_url TEXT,
  thumbnail_url TEXT,
  file_size_bytes BIGINT,
  file_type TEXT, -- MIME type

  -- Access control
  is_public BOOLEAN NOT NULL DEFAULT false,
  required_subscription_tier TEXT, -- 'free', 'starter', 'professional', 'enterprise'

  -- Stats
  download_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,

  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_resources_slug ON resources(slug);
CREATE INDEX idx_resources_type ON resources(resource_type);
CREATE INDEX idx_resources_pillar ON resources(pillar);
CREATE INDEX idx_resources_tags ON resources USING GIN(tags);
CREATE INDEX idx_resources_public ON resources(is_public) WHERE is_public = true;
CREATE INDEX idx_resources_tier ON resources(required_subscription_tier);

CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Resource access tracking
CREATE TABLE resource_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  access_type TEXT NOT NULL CHECK (access_type IN ('view', 'download')),
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_resource_access_resource ON resource_access(resource_id);
CREATE INDEX idx_resource_access_user ON resource_access(user_id);
CREATE INDEX idx_resource_access_organization ON resource_access(organization_id);
CREATE INDEX idx_resource_access_date ON resource_access(accessed_at);

-- =====================================================
-- ANALYTICS TABLES
-- =====================================================

-- Analytics events (user activity tracking)
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,

  -- Event properties
  properties JSONB DEFAULT '{}'::jsonb,

  -- Session tracking
  session_id UUID,

  -- Device/browser info
  user_agent TEXT,
  ip_address INET,
  device_type TEXT,
  browser TEXT,
  os TEXT,

  -- Location
  country TEXT,
  region TEXT,
  city TEXT,

  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_events_organization ON analytics_events(organization_id, timestamp);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id, timestamp);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type, event_name);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_properties ON analytics_events USING GIN(properties);

-- User engagement metrics (aggregated)
CREATE TABLE user_engagement_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  date DATE NOT NULL,

  -- Activity counts
  sessions_count INTEGER NOT NULL DEFAULT 0,
  total_time_seconds INTEGER NOT NULL DEFAULT 0,
  page_views INTEGER NOT NULL DEFAULT 0,

  -- Feature usage
  assessments_started INTEGER NOT NULL DEFAULT 0,
  assessments_completed INTEGER NOT NULL DEFAULT 0,
  lessons_viewed INTEGER NOT NULL DEFAULT 0,
  lessons_completed INTEGER NOT NULL DEFAULT 0,
  workshops_attended INTEGER NOT NULL DEFAULT 0,
  consultations_booked INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(user_id, date)
);

CREATE INDEX idx_user_engagement_user ON user_engagement_metrics(user_id, date);
CREATE INDEX idx_user_engagement_organization ON user_engagement_metrics(organization_id, date);
CREATE INDEX idx_user_engagement_date ON user_engagement_metrics(date);

CREATE TRIGGER update_user_engagement_metrics_updated_at
  BEFORE UPDATE ON user_engagement_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_engagement_metrics ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ORGANIZATIONS POLICIES
-- =====================================================

CREATE POLICY "Platform admins can view all organizations"
  ON organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM users
      WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Org admins can update their organization"
  ON organizations FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'org_admin')
    )
  );

-- =====================================================
-- TEAMS POLICIES
-- =====================================================

CREATE POLICY "Platform admins can view all teams"
  ON teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can view teams in their organization"
  ON teams FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Org admins can manage teams"
  ON teams FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'org_admin')
    )
  );

-- =====================================================
-- USERS POLICIES
-- =====================================================

CREATE POLICY "Platform admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
  );

CREATE POLICY "Users can view users in their organization"
  ON users FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Org admins can manage users in their org"
  ON users FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'org_admin')
    )
  );

-- =====================================================
-- TEAM MEMBERS POLICIES
-- =====================================================

CREATE POLICY "Users can view team members in their organization"
  ON team_members FOR SELECT
  USING (
    team_id IN (
      SELECT id FROM teams
      WHERE organization_id IN (
        SELECT organization_id FROM users
        WHERE users.id = auth.uid()
      )
    )
  );

CREATE POLICY "Team leads can manage their team members"
  ON team_members FOR ALL
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
      AND role IN ('team_lead', 'org_admin', 'admin')
    )
  );

-- =====================================================
-- ASSESSMENT TEMPLATES POLICIES
-- =====================================================

CREATE POLICY "Anyone can view active assessment templates"
  ON assessment_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Platform admins can manage assessment templates"
  ON assessment_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- ASSESSMENTS POLICIES
-- =====================================================

CREATE POLICY "Platform admins can view all assessments"
  ON assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can view assessments in their organization"
  ON assessments FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own assessments"
  ON assessments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own assessments"
  ON assessments FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND organization_id IN (
      SELECT organization_id FROM users
      WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own in-progress assessments"
  ON assessments FOR UPDATE
  USING (user_id = auth.uid() AND status IN ('not_started', 'in_progress'))
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Org admins can view org assessments"
  ON assessments FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'org_admin')
    )
  );

CREATE POLICY "Team leads can view their team's assessments"
  ON assessments FOR SELECT
  USING (
    user_id IN (
      SELECT tm.user_id FROM team_members tm
      WHERE tm.team_id IN (
        SELECT team_id FROM team_members
        WHERE user_id = auth.uid()
        AND role = 'team_lead'
      )
    )
  );

-- =====================================================
-- ASSESSMENT RESPONSES POLICIES
-- =====================================================

CREATE POLICY "Users can view their own assessment responses"
  ON assessment_responses FOR SELECT
  USING (
    assessment_id IN (
      SELECT id FROM assessments
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create responses for their assessments"
  ON assessment_responses FOR INSERT
  WITH CHECK (
    assessment_id IN (
      SELECT id FROM assessments
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Platform admins can view all responses"
  ON assessment_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- ASSESSMENT HISTORY POLICIES
-- =====================================================

CREATE POLICY "Users can view their own assessment history"
  ON assessment_history FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Org admins can view org assessment history"
  ON assessment_history FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'org_admin')
    )
  );

-- =====================================================
-- COURSES POLICIES
-- =====================================================

CREATE POLICY "Anyone can view published courses"
  ON courses FOR SELECT
  USING (is_published = true);

CREATE POLICY "Platform admins can manage courses"
  ON courses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- COURSE MODULES & LESSONS POLICIES
-- =====================================================

CREATE POLICY "Anyone can view modules of published courses"
  ON course_modules FOR SELECT
  USING (
    course_id IN (
      SELECT id FROM courses WHERE is_published = true
    )
  );

CREATE POLICY "Anyone can view lessons of published courses"
  ON course_lessons FOR SELECT
  USING (
    module_id IN (
      SELECT id FROM course_modules
      WHERE course_id IN (
        SELECT id FROM courses WHERE is_published = true
      )
    )
  );

CREATE POLICY "Platform admins can manage modules"
  ON course_modules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Platform admins can manage lessons"
  ON course_lessons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- COURSE ENROLLMENTS POLICIES
-- =====================================================

CREATE POLICY "Users can view their own enrollments"
  ON course_enrollments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own enrollments"
  ON course_enrollments FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND organization_id IN (
      SELECT organization_id FROM users
      WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own enrollments"
  ON course_enrollments FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Org admins can view org enrollments"
  ON course_enrollments FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'org_admin')
    )
  );

-- =====================================================
-- LESSON PROGRESS POLICIES
-- =====================================================

CREATE POLICY "Users can view their own lesson progress"
  ON lesson_progress FOR SELECT
  USING (
    enrollment_id IN (
      SELECT id FROM course_enrollments
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own lesson progress"
  ON lesson_progress FOR ALL
  USING (
    enrollment_id IN (
      SELECT id FROM course_enrollments
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    enrollment_id IN (
      SELECT id FROM course_enrollments
      WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- WORKSHOPS POLICIES
-- =====================================================

CREATE POLICY "Anyone can view published workshops"
  ON workshops FOR SELECT
  USING (status = 'published');

CREATE POLICY "Platform admins can manage workshops"
  ON workshops FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Instructors can view their workshops"
  ON workshops FOR SELECT
  USING (instructor_id = auth.uid());

-- =====================================================
-- WORKSHOP REGISTRATIONS POLICIES
-- =====================================================

CREATE POLICY "Users can view their own registrations"
  ON workshop_registrations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own registrations"
  ON workshop_registrations FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND organization_id IN (
      SELECT organization_id FROM users
      WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own registrations"
  ON workshop_registrations FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Org admins can view org registrations"
  ON workshop_registrations FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'org_admin')
    )
  );

CREATE POLICY "Workshop instructors can view registrations"
  ON workshop_registrations FOR SELECT
  USING (
    workshop_id IN (
      SELECT id FROM workshops
      WHERE instructor_id = auth.uid()
    )
  );

-- =====================================================
-- EXPERTS POLICIES
-- =====================================================

CREATE POLICY "Anyone can view available experts"
  ON experts FOR SELECT
  USING (is_available = true);

CREATE POLICY "Platform admins can manage experts"
  ON experts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Experts can view their own profile"
  ON experts FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Experts can update their own profile"
  ON experts FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- EXPERT AVAILABILITY POLICIES
-- =====================================================

CREATE POLICY "Anyone can view expert availability"
  ON expert_availability FOR SELECT
  USING (is_active = true);

CREATE POLICY "Experts can manage their availability"
  ON expert_availability FOR ALL
  USING (
    expert_id IN (
      SELECT id FROM experts
      WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- CONSULTATIONS POLICIES
-- =====================================================

CREATE POLICY "Users can view their own consultations"
  ON consultations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Experts can view their consultations"
  ON consultations FOR SELECT
  USING (
    expert_id IN (
      SELECT id FROM experts
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create consultations"
  ON consultations FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND organization_id IN (
      SELECT organization_id FROM users
      WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own consultations"
  ON consultations FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Experts can update their consultations"
  ON consultations FOR UPDATE
  USING (
    expert_id IN (
      SELECT id FROM experts
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Org admins can view org consultations"
  ON consultations FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'org_admin')
    )
  );

-- =====================================================
-- RESOURCES POLICIES
-- =====================================================

CREATE POLICY "Anyone can view public resources"
  ON resources FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view resources matching their subscription tier"
  ON resources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN organizations o ON u.organization_id = o.id
      WHERE u.id = auth.uid()
      AND (
        resources.required_subscription_tier IS NULL
        OR resources.required_subscription_tier = 'free'
        OR (resources.required_subscription_tier = 'starter' AND o.subscription_tier IN ('starter', 'professional', 'enterprise'))
        OR (resources.required_subscription_tier = 'professional' AND o.subscription_tier IN ('professional', 'enterprise'))
        OR (resources.required_subscription_tier = 'enterprise' AND o.subscription_tier = 'enterprise')
      )
    )
  );

CREATE POLICY "Platform admins can manage resources"
  ON resources FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- RESOURCE ACCESS POLICIES
-- =====================================================

CREATE POLICY "Users can view their own resource access"
  ON resource_access FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create resource access records"
  ON resource_access FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND organization_id IN (
      SELECT organization_id FROM users
      WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Org admins can view org resource access"
  ON resource_access FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'org_admin')
    )
  );

-- =====================================================
-- ANALYTICS POLICIES
-- =====================================================

CREATE POLICY "Users can view their own analytics events"
  ON analytics_events FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR user_id IS NULL -- Allow anonymous events
  );

CREATE POLICY "Org admins can view org analytics"
  ON analytics_events FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'org_admin')
    )
  );

CREATE POLICY "Platform admins can view all analytics"
  ON analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- USER ENGAGEMENT METRICS POLICIES
-- =====================================================

CREATE POLICY "Users can view their own engagement metrics"
  ON user_engagement_metrics FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Org admins can view org engagement metrics"
  ON user_engagement_metrics FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'org_admin')
    )
  );

CREATE POLICY "Platform admins can view all engagement metrics"
  ON user_engagement_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- STORAGE BUCKETS CONFIGURATION
-- =====================================================

-- Note: Storage buckets are created via Supabase CLI or Dashboard
-- Below are the SQL policies for the buckets

-- Assessment voice recordings bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('assessment-recordings', 'assessment-recordings', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Users can upload their own assessment recordings
CREATE POLICY "Users can upload own assessment recordings"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'assessment-recordings'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can view their own assessment recordings
CREATE POLICY "Users can view own assessment recordings"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'assessment-recordings'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Platform admins can view all assessment recordings
CREATE POLICY "Admins can view all assessment recordings"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'assessment-recordings'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Course content bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-content', 'course-content', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Anyone can view course content
CREATE POLICY "Anyone can view course content"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'course-content');

-- Policy: Platform admins can manage course content
CREATE POLICY "Admins can manage course content"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'course-content'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- User avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Users can upload their own avatar
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can update their own avatar
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Anyone can view avatars
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Organization logos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('organization-logos', 'organization-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Org admins can upload their org logo
CREATE POLICY "Org admins can upload org logo"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'organization-logos'
    AND (storage.foldername(name))[1] IN (
      SELECT organization_id::text FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'org_admin')
    )
  );

-- Policy: Anyone can view org logos
CREATE POLICY "Anyone can view org logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'organization-logos');

-- Workshop materials bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('workshop-materials', 'workshop-materials', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Workshop registrants can view materials
CREATE POLICY "Registrants can view workshop materials"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'workshop-materials'
    AND (storage.foldername(name))[1] IN (
      SELECT workshop_id::text FROM workshop_registrations
      WHERE user_id = auth.uid()
      AND status IN ('registered', 'attended')
    )
  );

-- Policy: Platform admins can manage workshop materials
CREATE POLICY "Admins can manage workshop materials"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'workshop-materials'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Resources bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Users can view resources based on subscription tier
CREATE POLICY "Users can view resources by tier"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resources'
    AND (storage.foldername(name))[1] IN (
      SELECT r.id::text FROM resources r
      JOIN users u ON u.id = auth.uid()
      JOIN organizations o ON u.organization_id = o.id
      WHERE r.is_public = true
      OR (
        r.required_subscription_tier IS NULL
        OR r.required_subscription_tier = 'free'
        OR (r.required_subscription_tier = 'starter' AND o.subscription_tier IN ('starter', 'professional', 'enterprise'))
        OR (r.required_subscription_tier = 'professional' AND o.subscription_tier IN ('professional', 'enterprise'))
        OR (r.required_subscription_tier = 'enterprise' AND o.subscription_tier = 'enterprise')
      )
    )
  );

-- Policy: Platform admins can manage resources
CREATE POLICY "Admins can manage resources"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'resources'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get user's adaptability score breakdown
CREATE OR REPLACE FUNCTION get_user_adaptability_score(p_user_id UUID)
RETURNS TABLE(
  overall_score INTEGER,
  individual_score INTEGER,
  leadership_score INTEGER,
  cultural_score INTEGER,
  embedding_score INTEGER,
  velocity_score INTEGER,
  completed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.overall_score,
    a.individual_score,
    a.leadership_score,
    a.cultural_score,
    a.embedding_score,
    a.velocity_score,
    a.completed_at
  FROM assessments a
  WHERE a.user_id = p_user_id
  AND a.status = 'completed'
  ORDER BY a.completed_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get organization metrics
CREATE OR REPLACE FUNCTION get_organization_metrics(p_organization_id UUID)
RETURNS TABLE(
  total_users INTEGER,
  total_teams INTEGER,
  assessments_completed INTEGER,
  average_adaptability_score DECIMAL,
  active_enrollments INTEGER,
  workshops_attended INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM users WHERE organization_id = p_organization_id)::INTEGER,
    (SELECT COUNT(*) FROM teams WHERE organization_id = p_organization_id)::INTEGER,
    (SELECT COUNT(*) FROM assessments WHERE organization_id = p_organization_id AND status = 'completed')::INTEGER,
    (SELECT AVG(overall_score) FROM assessments WHERE organization_id = p_organization_id AND status = 'completed'),
    (SELECT COUNT(*) FROM course_enrollments WHERE organization_id = p_organization_id AND status IN ('enrolled', 'in_progress'))::INTEGER,
    (SELECT COUNT(*) FROM workshop_registrations WHERE organization_id = p_organization_id AND status = 'attended')::INTEGER;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update workshop capacity
CREATE OR REPLACE FUNCTION update_workshop_capacity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'registered' THEN
    UPDATE workshops
    SET capacity_remaining = capacity_remaining - 1
    WHERE id = NEW.workshop_id
    AND capacity_remaining > 0;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'registered' AND NEW.status = 'cancelled' THEN
    UPDATE workshops
    SET capacity_remaining = capacity_remaining + 1
    WHERE id = NEW.workshop_id
    AND capacity_remaining < capacity_total;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workshop_capacity_trigger
  AFTER INSERT OR UPDATE ON workshop_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_workshop_capacity();

-- Function to update enrollment progress
CREATE OR REPLACE FUNCTION update_enrollment_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_lessons INTEGER;
  completed_lessons INTEGER;
  new_progress INTEGER;
BEGIN
  -- Get total lessons for this course
  SELECT COUNT(*) INTO total_lessons
  FROM course_lessons cl
  JOIN course_modules cm ON cl.module_id = cm.id
  JOIN course_enrollments ce ON cm.course_id = ce.course_id
  WHERE ce.id = NEW.enrollment_id;

  -- Get completed lessons
  SELECT COUNT(*) INTO completed_lessons
  FROM lesson_progress
  WHERE enrollment_id = NEW.enrollment_id
  AND is_completed = true;

  -- Calculate progress
  IF total_lessons > 0 THEN
    new_progress := (completed_lessons * 100) / total_lessons;

    UPDATE course_enrollments
    SET progress_percentage = new_progress,
        last_accessed_lesson_id = NEW.lesson_id,
        last_accessed_at = now(),
        status = CASE
          WHEN new_progress = 100 THEN 'completed'::enrollment_status
          WHEN new_progress > 0 THEN 'in_progress'::enrollment_status
          ELSE status
        END,
        completed_at = CASE
          WHEN new_progress = 100 AND completed_at IS NULL THEN now()
          ELSE completed_at
        END
    WHERE id = NEW.enrollment_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_enrollment_progress_trigger
  AFTER INSERT OR UPDATE ON lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_enrollment_progress();

-- Function to archive old assessment history snapshots
CREATE OR REPLACE FUNCTION create_assessment_snapshot()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO assessment_history (
      user_id,
      organization_id,
      assessment_id,
      overall_score,
      individual_score,
      leadership_score,
      cultural_score,
      embedding_score,
      velocity_score,
      snapshot_date
    ) VALUES (
      NEW.user_id,
      NEW.organization_id,
      NEW.id,
      NEW.overall_score,
      NEW.individual_score,
      NEW.leadership_score,
      NEW.cultural_score,
      NEW.embedding_score,
      NEW.velocity_score,
      NEW.completed_at
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_assessment_snapshot_trigger
  AFTER UPDATE ON assessments
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION create_assessment_snapshot();

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Organization overview with stats
CREATE VIEW organization_overview AS
SELECT
  o.*,
  COUNT(DISTINCT u.id) AS total_users,
  COUNT(DISTINCT t.id) AS total_teams,
  COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'completed') AS completed_assessments,
  AVG(a.overall_score) FILTER (WHERE a.status = 'completed') AS avg_adaptability_score,
  COUNT(DISTINCT ce.id) FILTER (WHERE ce.status IN ('enrolled', 'in_progress')) AS active_enrollments,
  COUNT(DISTINCT wr.id) FILTER (WHERE wr.status = 'attended') AS workshops_attended
FROM organizations o
LEFT JOIN users u ON o.id = u.organization_id AND u.is_active = true
LEFT JOIN teams t ON o.id = t.organization_id AND t.is_active = true
LEFT JOIN assessments a ON o.id = a.organization_id
LEFT JOIN course_enrollments ce ON o.id = ce.organization_id
LEFT JOIN workshop_registrations wr ON o.id = wr.organization_id
GROUP BY o.id;

-- User learning progress summary
CREATE VIEW user_learning_progress AS
SELECT
  u.id AS user_id,
  u.full_name,
  u.organization_id,
  COUNT(DISTINCT ce.id) AS total_enrollments,
  COUNT(DISTINCT ce.id) FILTER (WHERE ce.status = 'completed') AS completed_courses,
  AVG(ce.progress_percentage) AS avg_progress,
  COUNT(DISTINCT wr.id) FILTER (WHERE wr.status = 'attended') AS workshops_attended,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'completed') AS consultations_completed,
  a.overall_score AS latest_adaptability_score
FROM users u
LEFT JOIN course_enrollments ce ON u.id = ce.user_id
LEFT JOIN workshop_registrations wr ON u.id = wr.user_id
LEFT JOIN consultations c ON u.id = c.user_id
LEFT JOIN LATERAL (
  SELECT overall_score
  FROM assessments
  WHERE user_id = u.id AND status = 'completed'
  ORDER BY completed_at DESC
  LIMIT 1
) a ON true
GROUP BY u.id, u.full_name, u.organization_id, a.overall_score;

-- =====================================================
-- ROLLBACK SCRIPT (for emergency use)
-- =====================================================

/*
-- WARNING: This will destroy all data! Use with extreme caution.

-- Drop all views
DROP VIEW IF EXISTS user_learning_progress;
DROP VIEW IF EXISTS organization_overview;

-- Drop all triggers
DROP TRIGGER IF EXISTS create_assessment_snapshot_trigger ON assessments;
DROP TRIGGER IF EXISTS update_enrollment_progress_trigger ON lesson_progress;
DROP TRIGGER IF EXISTS update_workshop_capacity_trigger ON workshop_registrations;
DROP TRIGGER IF EXISTS update_user_engagement_metrics_updated_at ON user_engagement_metrics;
DROP TRIGGER IF EXISTS update_expert_availability_updated_at ON expert_availability;
DROP TRIGGER IF EXISTS update_experts_updated_at ON experts;
DROP TRIGGER IF EXISTS update_consultations_updated_at ON consultations;
DROP TRIGGER IF EXISTS update_workshop_registrations_updated_at ON workshop_registrations;
DROP TRIGGER IF EXISTS update_workshops_updated_at ON workshops;
DROP TRIGGER IF EXISTS update_lesson_progress_updated_at ON lesson_progress;
DROP TRIGGER IF EXISTS update_course_enrollments_updated_at ON course_enrollments;
DROP TRIGGER IF EXISTS update_course_lessons_updated_at ON course_lessons;
DROP TRIGGER IF EXISTS update_course_modules_updated_at ON course_modules;
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
DROP TRIGGER IF EXISTS update_assessment_templates_updated_at ON assessment_templates;
DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
DROP TRIGGER IF EXISTS update_resources_updated_at ON resources;

-- Drop all functions
DROP FUNCTION IF EXISTS create_assessment_snapshot();
DROP FUNCTION IF EXISTS update_enrollment_progress();
DROP FUNCTION IF EXISTS update_workshop_capacity();
DROP FUNCTION IF EXISTS get_organization_metrics(UUID);
DROP FUNCTION IF EXISTS get_user_adaptability_score(UUID);
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop all tables (in reverse dependency order)
DROP TABLE IF EXISTS user_engagement_metrics CASCADE;
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS resource_access CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS consultations CASCADE;
DROP TABLE IF EXISTS expert_availability CASCADE;
DROP TABLE IF EXISTS experts CASCADE;
DROP TABLE IF EXISTS workshop_registrations CASCADE;
DROP TABLE IF EXISTS workshops CASCADE;
DROP TABLE IF EXISTS lesson_progress CASCADE;
DROP TABLE IF EXISTS course_enrollments CASCADE;
DROP TABLE IF EXISTS course_lessons CASCADE;
DROP TABLE IF EXISTS course_modules CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS assessment_history CASCADE;
DROP TABLE IF EXISTS assessment_responses CASCADE;
DROP TABLE IF EXISTS assessments CASCADE;
DROP TABLE IF EXISTS assessment_templates CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Drop all enums
DROP TYPE IF EXISTS ai_pillar;
DROP TYPE IF EXISTS content_type;
DROP TYPE IF EXISTS payment_status;
DROP TYPE IF EXISTS consultation_status;
DROP TYPE IF EXISTS registration_status;
DROP TYPE IF EXISTS workshop_status;
DROP TYPE IF EXISTS enrollment_status;
DROP TYPE IF EXISTS assessment_status;
DROP TYPE IF EXISTS user_role;

-- Drop storage buckets (via Dashboard or Supabase CLI)
-- DELETE FROM storage.buckets WHERE id IN (
--   'assessment-recordings',
--   'course-content',
--   'avatars',
--   'organization-logos',
--   'workshop-materials',
--   'resources'
-- );
*/
