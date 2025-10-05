-- Migration: 002_create_workshops.sql
-- Description: Create workshops and workshop registration tables
-- Dependencies: 001_create_users_and_roles.sql

-- ============================================================
-- WORKSHOPS TABLE
-- ============================================================

CREATE TABLE public.workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,

  -- Instructor
  instructor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,

  -- Categorization
  pillar TEXT NOT NULL CHECK (pillar IN ('adaptability', 'coaching', 'marketplace')),
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),

  -- Format & Schedule
  format TEXT NOT NULL CHECK (format IN ('live', 'hybrid', 'recorded')),
  schedule_date DATE,
  schedule_time TIME,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  timezone TEXT DEFAULT 'UTC',

  -- Capacity
  capacity_total INTEGER NOT NULL CHECK (capacity_total > 0),
  capacity_remaining INTEGER NOT NULL CHECK (capacity_remaining >= 0),

  -- Pricing
  price_amount DECIMAL(10,2) NOT NULL CHECK (price_amount >= 0),
  price_early_bird DECIMAL(10,2) CHECK (price_early_bird >= 0),
  price_currency TEXT DEFAULT 'USD',

  -- Content
  outcomes TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  syllabus JSONB DEFAULT '[]'::jsonb,

  -- Media
  thumbnail_url TEXT,
  video_url TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'cancelled')),
  is_featured BOOLEAN DEFAULT false,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT check_early_bird_price CHECK (
    price_early_bird IS NULL OR price_early_bird < price_amount
  ),
  CONSTRAINT check_capacity_valid CHECK (
    capacity_remaining <= capacity_total
  )
);

-- Add indexes
CREATE INDEX idx_workshops_instructor ON public.workshops(instructor_id);
CREATE INDEX idx_workshops_pillar ON public.workshops(pillar);
CREATE INDEX idx_workshops_level ON public.workshops(level);
CREATE INDEX idx_workshops_status ON public.workshops(status);
CREATE INDEX idx_workshops_slug ON public.workshops(slug);
CREATE INDEX idx_workshops_featured ON public.workshops(is_featured) WHERE is_featured = true;
CREATE INDEX idx_workshops_schedule ON public.workshops(schedule_date, schedule_time) WHERE schedule_date IS NOT NULL;

-- Composite indexes for common queries
CREATE INDEX idx_workshops_pillar_level ON public.workshops(pillar, level);
CREATE INDEX idx_workshops_status_published ON public.workshops(status, published_at) WHERE status = 'published';

-- GIN indexes for arrays and JSONB
CREATE INDEX idx_workshops_tags ON public.workshops USING GIN(tags);
CREATE INDEX idx_workshops_outcomes ON public.workshops USING GIN(outcomes);
CREATE INDEX idx_workshops_metadata ON public.workshops USING GIN(metadata);

-- Full-text search
CREATE INDEX idx_workshops_search ON public.workshops
  USING GIN(to_tsvector('english', title || ' ' || description));

COMMENT ON TABLE public.workshops IS 'Workshop and masterclass catalog';
COMMENT ON COLUMN public.workshops.outcomes IS 'Array of learning outcomes';
COMMENT ON COLUMN public.workshops.tags IS 'Array of topic tags';
COMMENT ON COLUMN public.workshops.syllabus IS 'Structured syllabus content';

-- ============================================================
-- WORKSHOP REGISTRATIONS TABLE
-- ============================================================

CREATE TABLE public.workshop_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Registration details
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'completed', 'cancelled', 'no_show')),
  price_paid DECIMAL(10,2) NOT NULL CHECK (price_paid >= 0),
  payment_id UUID REFERENCES public.payments(id),

  -- Attendance
  attended BOOLEAN DEFAULT false,
  attendance_percentage INTEGER CHECK (attendance_percentage >= 0 AND attendance_percentage <= 100),

  -- Completion
  completed_at TIMESTAMPTZ,
  certificate_id UUID REFERENCES public.certificates(id),

  -- Feedback
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT unique_user_workshop UNIQUE (workshop_id, user_id)
);

-- Add indexes
CREATE INDEX idx_registrations_workshop ON public.workshop_registrations(workshop_id);
CREATE INDEX idx_registrations_user ON public.workshop_registrations(user_id);
CREATE INDEX idx_registrations_status ON public.workshop_registrations(status);
CREATE INDEX idx_registrations_payment ON public.workshop_registrations(payment_id) WHERE payment_id IS NOT NULL;
CREATE INDEX idx_registrations_certificate ON public.workshop_registrations(certificate_id) WHERE certificate_id IS NOT NULL;
CREATE INDEX idx_registrations_completed ON public.workshop_registrations(completed_at) WHERE completed_at IS NOT NULL;

-- Composite indexes
CREATE INDEX idx_registrations_user_status ON public.workshop_registrations(user_id, status);

COMMENT ON TABLE public.workshop_registrations IS 'User workshop enrollments and attendance';

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER update_workshops_updated_at
  BEFORE UPDATE ON public.workshops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON public.workshop_registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-decrement capacity on registration
CREATE OR REPLACE FUNCTION decrement_workshop_capacity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.workshops
  SET capacity_remaining = capacity_remaining - 1
  WHERE id = NEW.workshop_id
  AND capacity_remaining > 0;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Workshop is at full capacity';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER decrement_capacity_on_registration
  BEFORE INSERT ON public.workshop_registrations
  FOR EACH ROW
  WHEN (NEW.status = 'registered')
  EXECUTE FUNCTION decrement_workshop_capacity();

-- Auto-increment capacity on cancellation
CREATE OR REPLACE FUNCTION increment_workshop_capacity()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'registered' AND NEW.status = 'cancelled' THEN
    UPDATE public.workshops
    SET capacity_remaining = capacity_remaining + 1
    WHERE id = NEW.workshop_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_capacity_on_cancellation
  AFTER UPDATE ON public.workshop_registrations
  FOR EACH ROW
  EXECUTE FUNCTION increment_workshop_capacity();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_registrations ENABLE ROW LEVEL SECURITY;

-- Workshops policies
CREATE POLICY "Anyone can view published workshops"
  ON public.workshops
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "Instructors can view their own workshops"
  ON public.workshops
  FOR SELECT
  USING (instructor_id = auth.uid());

CREATE POLICY "Instructors can create workshops"
  ON public.workshops
  FOR INSERT
  WITH CHECK (
    instructor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'instructor'
    )
  );

CREATE POLICY "Instructors can update their own workshops"
  ON public.workshops
  FOR UPDATE
  USING (instructor_id = auth.uid())
  WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "Admins can manage all workshops"
  ON public.workshops
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Registrations policies
CREATE POLICY "Users can view their own registrations"
  ON public.workshop_registrations
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Instructors can view registrations for their workshops"
  ON public.workshop_registrations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workshops
      WHERE id = workshop_id
      AND instructor_id = auth.uid()
    )
  );

CREATE POLICY "Users can register for workshops"
  ON public.workshop_registrations
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can cancel their own registrations"
  ON public.workshop_registrations
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all registrations"
  ON public.workshop_registrations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Get available workshops
CREATE OR REPLACE FUNCTION get_available_workshops(
  p_pillar TEXT DEFAULT NULL,
  p_level TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  description TEXT,
  pillar TEXT,
  level TEXT,
  format TEXT,
  schedule_date DATE,
  schedule_time TIME,
  capacity_remaining INTEGER,
  price_amount DECIMAL,
  price_early_bird DECIMAL,
  instructor_name TEXT,
  is_featured BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    w.id,
    w.title,
    w.description,
    w.pillar,
    w.level,
    w.format,
    w.schedule_date,
    w.schedule_time,
    w.capacity_remaining,
    w.price_amount,
    w.price_early_bird,
    u.full_name AS instructor_name,
    w.is_featured
  FROM public.workshops w
  JOIN public.users u ON w.instructor_id = u.id
  WHERE w.status = 'published'
    AND w.capacity_remaining > 0
    AND (p_pillar IS NULL OR w.pillar = p_pillar)
    AND (p_level IS NULL OR w.level = p_level)
  ORDER BY w.is_featured DESC, w.schedule_date ASC NULLS LAST
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's workshop history
CREATE OR REPLACE FUNCTION get_user_workshop_history(p_user_id UUID)
RETURNS TABLE(
  workshop_id UUID,
  workshop_title TEXT,
  status TEXT,
  registered_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  rating INTEGER,
  certificate_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    w.id AS workshop_id,
    w.title AS workshop_title,
    wr.status,
    wr.registered_at,
    wr.completed_at,
    wr.rating,
    wr.certificate_id
  FROM public.workshop_registrations wr
  JOIN public.workshops w ON wr.workshop_id = w.id
  WHERE wr.user_id = p_user_id
  ORDER BY wr.registered_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ROLLBACK
-- ============================================================
-- DROP FUNCTION IF EXISTS get_user_workshop_history(UUID);
-- DROP FUNCTION IF EXISTS get_available_workshops(TEXT, TEXT, INTEGER, INTEGER);
-- DROP TRIGGER IF EXISTS increment_capacity_on_cancellation ON public.workshop_registrations;
-- DROP TRIGGER IF EXISTS decrement_capacity_on_registration ON public.workshop_registrations;
-- DROP TRIGGER IF EXISTS update_registrations_updated_at ON public.workshop_registrations;
-- DROP TRIGGER IF EXISTS update_workshops_updated_at ON public.workshops;
-- DROP FUNCTION IF EXISTS increment_workshop_capacity();
-- DROP FUNCTION IF EXISTS decrement_workshop_capacity();
-- DROP TABLE IF EXISTS public.workshop_registrations CASCADE;
-- DROP TABLE IF EXISTS public.workshops CASCADE;
