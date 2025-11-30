-- =====================================================
-- Migration: 016_expert_applications.sql
-- Description: Expert/Instructor Application System
-- Created: 2025-10-29
-- Dependencies: 001_multi_tenant_schema.sql, 002_instructor_schema.sql
--
-- This migration creates the infrastructure for experts/instructors
-- to apply to join the HumanGlue platform. Applications are reviewed
-- by platform admins before approval.
-- =====================================================

-- =====================================================
-- EXPERT APPLICATION STATUS ENUM
-- =====================================================
CREATE TYPE expert_application_status AS ENUM (
  'draft',
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'withdrawn'
);

-- =====================================================
-- EXPERT APPLICATIONS TABLE
-- =====================================================
-- Stores applications from prospective experts/instructors

CREATE TABLE expert_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Applicant (linked to user if they have an account)
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Personal Information
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  timezone TEXT,

  -- Professional Information
  professional_title TEXT NOT NULL,
  headline TEXT, -- Short tagline (e.g., "AI Strategy Consultant with 15+ years experience")
  bio TEXT NOT NULL CHECK (char_length(bio) >= 100 AND char_length(bio) <= 3000),

  -- Visual Assets
  profile_image_url TEXT,
  video_intro_url TEXT,

  -- Experience & Expertise
  years_experience INTEGER NOT NULL CHECK (years_experience >= 0),
  expertise_areas TEXT[] DEFAULT '{}', -- Array of expertise tags
  ai_pillars TEXT[] DEFAULT '{}', -- Which AI pillars they specialize in
  industries TEXT[] DEFAULT '{}', -- Industries they've worked with

  -- Credentials
  education JSONB DEFAULT '[]'::jsonb, -- [{degree, institution, year}]
  certifications JSONB DEFAULT '[]'::jsonb, -- [{name, issuer, year, url}]
  work_history JSONB DEFAULT '[]'::jsonb, -- [{title, company, start_year, end_year, description}]

  -- Social Links
  linkedin_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  github_url TEXT,
  portfolio_urls JSONB DEFAULT '[]'::jsonb, -- Array of portfolio/case study URLs

  -- Service Information
  desired_hourly_rate DECIMAL(10,2),
  availability TEXT, -- 'full_time', 'part_time', 'limited'
  services_offered TEXT[] DEFAULT '{}', -- ['courses', 'workshops', 'consulting', 'coaching']

  -- Application Details
  why_join TEXT, -- Why they want to join HumanGlue
  unique_value TEXT, -- What unique value they bring
  sample_topics JSONB DEFAULT '[]'::jsonb, -- Sample topics/courses they could teach
  references JSONB DEFAULT '[]'::jsonb, -- [{name, title, email, phone, relationship}]

  -- Legal & Agreements
  agreed_to_terms BOOLEAN NOT NULL DEFAULT false,
  agreed_to_terms_at TIMESTAMPTZ,
  background_check_consent BOOLEAN NOT NULL DEFAULT false,

  -- Application Status & Workflow
  status expert_application_status NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,

  -- Review Process
  reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT, -- Internal admin notes
  rejection_reason TEXT, -- If rejected, why

  -- Approval Details
  approved_at TIMESTAMPTZ,
  onboarding_completed_at TIMESTAMPTZ,
  instructor_profile_id UUID REFERENCES instructor_profiles(id) ON DELETE SET NULL,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  source TEXT, -- How they found us (e.g., 'website', 'referral', 'linkedin')
  referral_code TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_expert_applications_user ON expert_applications(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_expert_applications_email ON expert_applications(email);
CREATE INDEX idx_expert_applications_status ON expert_applications(status);
CREATE INDEX idx_expert_applications_submitted ON expert_applications(submitted_at DESC) WHERE submitted_at IS NOT NULL;
CREATE INDEX idx_expert_applications_reviewer ON expert_applications(reviewer_id) WHERE reviewer_id IS NOT NULL;
CREATE INDEX idx_expert_applications_expertise ON expert_applications USING GIN(expertise_areas);
CREATE INDEX idx_expert_applications_industries ON expert_applications USING GIN(industries);
CREATE INDEX idx_expert_applications_created ON expert_applications(created_at DESC);

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================
CREATE TRIGGER update_expert_applications_updated_at
  BEFORE UPDATE ON expert_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- APPLICATION REVIEW HISTORY TABLE
-- =====================================================
-- Tracks all status changes and reviews for audit trail

CREATE TABLE expert_application_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES expert_applications(id) ON DELETE CASCADE,

  -- Status Change
  old_status expert_application_status,
  new_status expert_application_status NOT NULL,

  -- Actor
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  changed_by_name TEXT,

  -- Details
  notes TEXT,

  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_application_history_application ON expert_application_history(application_id, created_at DESC);
CREATE INDEX idx_application_history_changed_by ON expert_application_history(changed_by) WHERE changed_by IS NOT NULL;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE expert_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_application_history ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- EXPERT APPLICATIONS POLICIES
-- =====================================================

-- Applicants can view their own applications
CREATE POLICY "Applicants can view their own applications"
  ON expert_applications FOR SELECT
  USING (
    user_id = auth.uid()
    OR email = (SELECT email FROM users WHERE id = auth.uid())
  );

-- Anyone can create an application (public form)
CREATE POLICY "Anyone can create an application"
  ON expert_applications FOR INSERT
  WITH CHECK (true);

-- Applicants can update their own draft applications
CREATE POLICY "Applicants can update their draft applications"
  ON expert_applications FOR UPDATE
  USING (
    (user_id = auth.uid() OR email = (SELECT email FROM users WHERE id = auth.uid()))
    AND status = 'draft'
  )
  WITH CHECK (
    (user_id = auth.uid() OR email = (SELECT email FROM users WHERE id = auth.uid()))
    AND status IN ('draft', 'submitted')
  );

-- Applicants can withdraw their own applications
CREATE POLICY "Applicants can withdraw their applications"
  ON expert_applications FOR UPDATE
  USING (
    (user_id = auth.uid() OR email = (SELECT email FROM users WHERE id = auth.uid()))
    AND status IN ('draft', 'submitted', 'under_review')
  )
  WITH CHECK (
    status = 'withdrawn'
  );

-- Platform admins can view all applications
CREATE POLICY "Platform admins can view all applications"
  ON expert_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin_full')
    )
  );

-- Platform admins can manage all applications
CREATE POLICY "Platform admins can manage applications"
  ON expert_applications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin_full')
    )
  );

-- =====================================================
-- APPLICATION HISTORY POLICIES
-- =====================================================

-- Applicants can view their own application history
CREATE POLICY "Applicants can view their application history"
  ON expert_application_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM expert_applications ea
      WHERE ea.id = expert_application_history.application_id
      AND (ea.user_id = auth.uid() OR ea.email = (SELECT email FROM users WHERE id = auth.uid()))
    )
  );

-- Platform admins can view all history
CREATE POLICY "Platform admins can view all application history"
  ON expert_application_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin_full')
    )
  );

-- Platform admins can create history entries
CREATE POLICY "Platform admins can create application history"
  ON expert_application_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin_full')
    )
  );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function: Log application status change
CREATE OR REPLACE FUNCTION log_expert_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO expert_application_history (
      application_id,
      old_status,
      new_status,
      changed_by,
      changed_by_name,
      notes
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid(),
      (SELECT full_name FROM users WHERE id = auth.uid()),
      CASE
        WHEN NEW.status = 'submitted' THEN 'Application submitted'
        WHEN NEW.status = 'under_review' THEN 'Application marked for review'
        WHEN NEW.status = 'approved' THEN 'Application approved'
        WHEN NEW.status = 'rejected' THEN COALESCE('Rejected: ' || NEW.rejection_reason, 'Application rejected')
        WHEN NEW.status = 'withdrawn' THEN 'Application withdrawn by applicant'
        ELSE 'Status changed'
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_application_status_change
  AFTER UPDATE ON expert_applications
  FOR EACH ROW
  EXECUTE FUNCTION log_expert_application_status_change();

-- Function: Get application statistics
CREATE OR REPLACE FUNCTION get_expert_application_stats()
RETURNS TABLE(
  total_applications BIGINT,
  pending_review BIGINT,
  approved_this_month BIGINT,
  rejected_this_month BIGINT,
  average_review_time INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_applications,
    COUNT(*) FILTER (WHERE status IN ('submitted', 'under_review'))::BIGINT AS pending_review,
    COUNT(*) FILTER (WHERE status = 'approved' AND approved_at >= date_trunc('month', now()))::BIGINT AS approved_this_month,
    COUNT(*) FILTER (WHERE status = 'rejected' AND reviewed_at >= date_trunc('month', now()))::BIGINT AS rejected_this_month,
    AVG(reviewed_at - submitted_at) FILTER (WHERE reviewed_at IS NOT NULL AND submitted_at IS NOT NULL) AS average_review_time
  FROM expert_applications;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Approve application and create instructor profile
CREATE OR REPLACE FUNCTION approve_expert_application(
  p_application_id UUID,
  p_review_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_application expert_applications;
  v_user_id UUID;
  v_instructor_profile_id UUID;
BEGIN
  -- Get application
  SELECT * INTO v_application
  FROM expert_applications
  WHERE id = p_application_id;

  IF v_application IS NULL THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  IF v_application.status NOT IN ('submitted', 'under_review') THEN
    RAISE EXCEPTION 'Application is not in reviewable status';
  END IF;

  -- Get or create user
  IF v_application.user_id IS NOT NULL THEN
    v_user_id := v_application.user_id;
  ELSE
    -- Check if user exists with this email
    SELECT id INTO v_user_id
    FROM users
    WHERE email = v_application.email;

    -- If no user exists, one will need to be created during onboarding
  END IF;

  -- If we have a user, create the instructor profile
  IF v_user_id IS NOT NULL THEN
    INSERT INTO instructor_profiles (
      user_id,
      bio,
      professional_title,
      tagline,
      cover_photo_url,
      video_intro_url,
      expertise_tags,
      education,
      certifications,
      work_experience,
      social_links,
      is_verified,
      is_accepting_students
    ) VALUES (
      v_user_id,
      v_application.bio,
      v_application.professional_title,
      v_application.headline,
      v_application.profile_image_url,
      v_application.video_intro_url,
      v_application.expertise_areas,
      v_application.education,
      v_application.certifications,
      v_application.work_history,
      jsonb_build_object(
        'linkedin', v_application.linkedin_url,
        'twitter', v_application.twitter_url,
        'website', v_application.website_url,
        'github', v_application.github_url
      ),
      true,
      true
    )
    RETURNING id INTO v_instructor_profile_id;

    -- Update user role to instructor
    UPDATE users
    SET role = CASE
      WHEN role = 'user' THEN 'instructor'
      ELSE role
    END
    WHERE id = v_user_id;

    -- Update profiles role
    UPDATE profiles
    SET role = CASE
      WHEN role = 'user' THEN 'instructor'
      ELSE role
    END
    WHERE id = v_user_id;
  END IF;

  -- Update application
  UPDATE expert_applications
  SET
    status = 'approved',
    reviewer_id = auth.uid(),
    reviewed_at = now(),
    review_notes = p_review_notes,
    approved_at = now(),
    instructor_profile_id = v_instructor_profile_id,
    updated_at = now()
  WHERE id = p_application_id;

  RETURN v_instructor_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Reject application
CREATE OR REPLACE FUNCTION reject_expert_application(
  p_application_id UUID,
  p_rejection_reason TEXT,
  p_review_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE expert_applications
  SET
    status = 'rejected',
    reviewer_id = auth.uid(),
    reviewed_at = now(),
    review_notes = p_review_notes,
    rejection_reason = p_rejection_reason,
    updated_at = now()
  WHERE id = p_application_id
  AND status IN ('submitted', 'under_review');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found or not in reviewable status';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SAMPLE DATA FOR DEVELOPMENT (commented out)
-- =====================================================
/*
INSERT INTO expert_applications (
  full_name, email, professional_title, headline, bio,
  years_experience, expertise_areas, industries,
  desired_hourly_rate, availability, services_offered,
  why_join, agreed_to_terms, status
) VALUES (
  'Dr. Emily Rodriguez',
  'emily.rodriguez@example.com',
  'AI Ethics Researcher & Consultant',
  'Helping organizations navigate AI ethics and responsible implementation',
  'Dr. Emily Rodriguez is a leading expert in AI ethics with over 12 years of experience advising Fortune 500 companies on responsible AI implementation. She holds a Ph.D. in Computer Science from MIT with a focus on fairness in machine learning systems. Her work has been published in top-tier journals and she has spoken at numerous international conferences on the topic of ethical AI.',
  12,
  ARRAY['AI Ethics', 'Machine Learning Fairness', 'AI Governance', 'Responsible AI'],
  ARRAY['Technology', 'Healthcare', 'Finance', 'Government'],
  650.00,
  'part_time',
  ARRAY['courses', 'workshops', 'consulting'],
  'I believe HumanGlue''s mission to help organizations adapt to AI aligns perfectly with my goal of promoting responsible AI adoption. I want to help businesses implement AI in ways that are ethical, fair, and beneficial to all stakeholders.',
  true,
  'submitted'
);
*/
