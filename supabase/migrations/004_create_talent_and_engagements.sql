-- Migration: 004_create_talent_and_engagements.sql
-- Description: Create talent profiles and client engagements tables
-- Dependencies: 001_create_users_and_roles.sql

-- ============================================================
-- TALENT PROFILES TABLE
-- ============================================================

CREATE TABLE public.talent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,

  -- Profile basics
  tagline TEXT NOT NULL,
  bio TEXT NOT NULL,
  location TEXT,

  -- Expertise
  expertise TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',

  -- Adaptability Impact Metrics (0-100)
  transformation_success_rate INTEGER CHECK (transformation_success_rate >= 0 AND transformation_success_rate <= 100),
  behavior_change_score INTEGER CHECK (behavior_change_score >= 0 AND behavior_change_score <= 100),
  client_retention_rate INTEGER CHECK (client_retention_rate >= 0 AND client_retention_rate <= 100),
  cultures_transformed INTEGER DEFAULT 0,

  -- Experience
  years_experience INTEGER NOT NULL CHECK (years_experience >= 0),
  clients_transformed INTEGER DEFAULT 0,
  employees_reframed INTEGER DEFAULT 0,

  -- Specializations
  industries TEXT[] DEFAULT '{}',
  transformation_stages TEXT[] DEFAULT '{}',
  coaching_style TEXT CHECK (coaching_style IN ('directive', 'facilitative', 'hybrid')),

  -- Social proof
  rating NUMERIC(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,

  -- Availability
  availability TEXT NOT NULL DEFAULT 'available' CHECK (availability IN ('available', 'limited', 'booked')),
  hourly_rate DECIMAL(10,2) NOT NULL CHECK (hourly_rate >= 0),
  min_engagement_hours INTEGER,
  max_hours_per_week INTEGER,

  -- Media
  avatar_url TEXT,
  video_intro_url TEXT,

  -- Profile settings
  is_public BOOLEAN DEFAULT true,
  accepting_clients BOOLEAN DEFAULT true,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_talent_user ON public.talent_profiles(user_id);
CREATE INDEX idx_talent_availability ON public.talent_profiles(availability);
CREATE INDEX idx_talent_rating ON public.talent_profiles(rating DESC);
CREATE INDEX idx_talent_public ON public.talent_profiles(is_public) WHERE is_public = true;
CREATE INDEX idx_talent_accepting ON public.talent_profiles(accepting_clients) WHERE accepting_clients = true;

-- GIN indexes for arrays
CREATE INDEX idx_talent_expertise ON public.talent_profiles USING GIN(expertise);
CREATE INDEX idx_talent_industries ON public.talent_profiles USING GIN(industries);
CREATE INDEX idx_talent_stages ON public.talent_profiles USING GIN(transformation_stages);

COMMENT ON TABLE public.talent_profiles IS 'Expert marketplace profiles for coaches and consultants';

-- ============================================================
-- TALENT TESTIMONIALS TABLE
-- ============================================================

CREATE TABLE public.talent_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_profile_id UUID NOT NULL REFERENCES public.talent_profiles(id) ON DELETE CASCADE,

  -- Testimonial content
  client_name TEXT NOT NULL,
  client_company TEXT NOT NULL,
  client_title TEXT,
  quote TEXT NOT NULL,
  metric TEXT,

  -- Verification
  verified BOOLEAN DEFAULT false,

  -- Display
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_testimonials_talent ON public.talent_testimonials(talent_profile_id);
CREATE INDEX idx_testimonials_featured ON public.talent_testimonials(is_featured) WHERE is_featured = true;

COMMENT ON TABLE public.talent_testimonials IS 'Client testimonials for talent profiles';

-- ============================================================
-- ENGAGEMENTS TABLE
-- ============================================================

CREATE TABLE public.engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parties
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  expert_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Engagement details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  focus_area TEXT NOT NULL,

  -- Scope
  hours_total DECIMAL(10,2) NOT NULL CHECK (hours_total > 0),
  hours_used DECIMAL(10,2) DEFAULT 0 CHECK (hours_used >= 0),
  hourly_rate DECIMAL(10,2) NOT NULL CHECK (hourly_rate >= 0),

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'completed', 'cancelled')),

  -- Timeline
  start_date DATE,
  end_date DATE,
  estimated_completion_date DATE,

  -- Deliverables
  deliverables JSONB DEFAULT '[]'::jsonb,
  milestones JSONB DEFAULT '[]'::jsonb,

  -- Outcomes
  outcomes JSONB DEFAULT '{}'::jsonb,
  client_satisfaction_score INTEGER CHECK (client_satisfaction_score >= 1 AND client_satisfaction_score <= 5),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT check_hours_valid CHECK (hours_used <= hours_total),
  CONSTRAINT check_dates_valid CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

-- Add indexes
CREATE INDEX idx_engagements_client ON public.engagements(client_id);
CREATE INDEX idx_engagements_expert ON public.engagements(expert_id);
CREATE INDEX idx_engagements_org ON public.engagements(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX idx_engagements_status ON public.engagements(status);
CREATE INDEX idx_engagements_dates ON public.engagements(start_date, end_date);

-- Composite indexes
CREATE INDEX idx_engagements_client_status ON public.engagements(client_id, status);
CREATE INDEX idx_engagements_expert_status ON public.engagements(expert_id, status);

-- GIN indexes
CREATE INDEX idx_engagements_deliverables ON public.engagements USING GIN(deliverables);
CREATE INDEX idx_engagements_milestones ON public.engagements USING GIN(milestones);

COMMENT ON TABLE public.engagements IS 'Client-expert consulting engagements';

-- ============================================================
-- ENGAGEMENT SESSIONS TABLE
-- ============================================================

CREATE TABLE public.engagement_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID NOT NULL REFERENCES public.engagements(id) ON DELETE CASCADE,

  -- Session details
  title TEXT NOT NULL,
  description TEXT,
  session_type TEXT CHECK (session_type IN ('coaching', 'workshop', 'consultation', 'follow_up')),

  -- Time tracking
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_hours DECIMAL(5,2),

  -- Notes
  session_notes TEXT,
  action_items JSONB DEFAULT '[]'::jsonb,

  -- Status
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_sessions_engagement ON public.engagement_sessions(engagement_id);
CREATE INDEX idx_sessions_scheduled ON public.engagement_sessions(scheduled_at);
CREATE INDEX idx_sessions_status ON public.engagement_sessions(status);

COMMENT ON TABLE public.engagement_sessions IS 'Individual sessions within an engagement';

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER update_talent_profiles_updated_at
  BEFORE UPDATE ON public.talent_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_engagements_updated_at
  BEFORE UPDATE ON public.engagements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON public.engagement_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update engagement hours when session is completed
CREATE OR REPLACE FUNCTION update_engagement_hours()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND NEW.duration_hours IS NOT NULL THEN
    UPDATE public.engagements
    SET hours_used = hours_used + NEW.duration_hours
    WHERE id = NEW.engagement_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_hours_on_session_complete
  AFTER UPDATE ON public.engagement_sessions
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION update_engagement_hours();

-- Auto-update talent profile rating
CREATE OR REPLACE FUNCTION update_talent_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_avg_rating NUMERIC;
  v_review_count INTEGER;
  v_expert_id UUID;
BEGIN
  -- Get expert user ID from engagement
  SELECT expert_id INTO v_expert_id
  FROM public.engagements
  WHERE id = NEW.id;

  -- Calculate average rating
  SELECT
    AVG(client_satisfaction_score),
    COUNT(*)
  INTO v_avg_rating, v_review_count
  FROM public.engagements
  WHERE expert_id = v_expert_id
    AND client_satisfaction_score IS NOT NULL;

  -- Update talent profile
  UPDATE public.talent_profiles
  SET
    rating = v_avg_rating,
    review_count = v_review_count
  WHERE user_id = v_expert_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_on_engagement_review
  AFTER UPDATE ON public.engagements
  FOR EACH ROW
  WHEN (NEW.client_satisfaction_score IS NOT NULL AND OLD.client_satisfaction_score IS NULL)
  EXECUTE FUNCTION update_talent_rating();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.talent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_sessions ENABLE ROW LEVEL SECURITY;

-- Talent profiles policies
CREATE POLICY "Anyone can view public talent profiles"
  ON public.talent_profiles
  FOR SELECT
  USING (is_public = true);

CREATE POLICY "Experts can view their own profile"
  ON public.talent_profiles
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Experts can create their own profile"
  ON public.talent_profiles
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'expert'
    )
  );

CREATE POLICY "Experts can update their own profile"
  ON public.talent_profiles
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all talent profiles"
  ON public.talent_profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Testimonials policies
CREATE POLICY "Anyone can view testimonials for public profiles"
  ON public.talent_testimonials
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.talent_profiles
      WHERE id = talent_profile_id
      AND is_public = true
    )
  );

CREATE POLICY "Experts can manage their own testimonials"
  ON public.talent_testimonials
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.talent_profiles
      WHERE id = talent_profile_id
      AND user_id = auth.uid()
    )
  );

-- Engagements policies
CREATE POLICY "Clients can view their own engagements"
  ON public.engagements
  FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Experts can view their engagements"
  ON public.engagements
  FOR SELECT
  USING (expert_id = auth.uid());

CREATE POLICY "Clients can create engagements"
  ON public.engagements
  FOR INSERT
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can update their engagements"
  ON public.engagements
  FOR UPDATE
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Experts can update their engagements"
  ON public.engagements
  FOR UPDATE
  USING (expert_id = auth.uid());

CREATE POLICY "Admins can manage all engagements"
  ON public.engagements
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Engagement sessions policies
CREATE POLICY "Engagement parties can view sessions"
  ON public.engagement_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.engagements
      WHERE id = engagement_id
      AND (client_id = auth.uid() OR expert_id = auth.uid())
    )
  );

CREATE POLICY "Experts can manage sessions"
  ON public.engagement_sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.engagements
      WHERE id = engagement_id
      AND expert_id = auth.uid()
    )
  );

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Search talent profiles
CREATE OR REPLACE FUNCTION search_talent(
  p_expertise TEXT[] DEFAULT NULL,
  p_industries TEXT[] DEFAULT NULL,
  p_min_rating NUMERIC DEFAULT NULL,
  p_availability TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  profile_id UUID,
  user_name TEXT,
  tagline TEXT,
  expertise TEXT[],
  rating NUMERIC,
  review_count INTEGER,
  hourly_rate DECIMAL,
  availability TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tp.id AS profile_id,
    u.full_name AS user_name,
    tp.tagline,
    tp.expertise,
    tp.rating,
    tp.review_count,
    tp.hourly_rate,
    tp.availability
  FROM public.talent_profiles tp
  JOIN public.users u ON tp.user_id = u.id
  WHERE tp.is_public = true
    AND tp.accepting_clients = true
    AND (p_expertise IS NULL OR tp.expertise && p_expertise)
    AND (p_industries IS NULL OR tp.industries && p_industries)
    AND (p_min_rating IS NULL OR tp.rating >= p_min_rating)
    AND (p_availability IS NULL OR tp.availability = p_availability)
  ORDER BY tp.rating DESC, tp.review_count DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get engagement summary for client
CREATE OR REPLACE FUNCTION get_client_engagement_summary(p_client_id UUID)
RETURNS TABLE(
  total_engagements INTEGER,
  active_engagements INTEGER,
  total_hours_purchased NUMERIC,
  total_hours_used NUMERIC,
  total_spent NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER AS total_engagements,
    COUNT(*) FILTER (WHERE status = 'active')::INTEGER AS active_engagements,
    SUM(hours_total)::NUMERIC AS total_hours_purchased,
    SUM(hours_used)::NUMERIC AS total_hours_used,
    SUM(hours_used * hourly_rate)::NUMERIC AS total_spent
  FROM public.engagements
  WHERE client_id = p_client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ROLLBACK
-- ============================================================
-- DROP FUNCTION IF EXISTS get_client_engagement_summary(UUID);
-- DROP FUNCTION IF EXISTS search_talent(TEXT[], TEXT[], NUMERIC, TEXT, INTEGER, INTEGER);
-- DROP TRIGGER IF EXISTS update_rating_on_engagement_review ON public.engagements;
-- DROP TRIGGER IF EXISTS update_hours_on_session_complete ON public.engagement_sessions;
-- DROP TRIGGER IF EXISTS update_sessions_updated_at ON public.engagement_sessions;
-- DROP TRIGGER IF EXISTS update_engagements_updated_at ON public.engagements;
-- DROP TRIGGER IF EXISTS update_talent_profiles_updated_at ON public.talent_profiles;
-- DROP FUNCTION IF EXISTS update_talent_rating();
-- DROP FUNCTION IF EXISTS update_engagement_hours();
-- DROP TABLE IF EXISTS public.engagement_sessions CASCADE;
-- DROP TABLE IF EXISTS public.engagements CASCADE;
-- DROP TABLE IF EXISTS public.talent_testimonials CASCADE;
-- DROP TABLE IF EXISTS public.talent_profiles CASCADE;
