-- Migration: 005_create_payments_certificates_reviews.sql
-- Description: Create payments, certificates, and reviews tables
-- Dependencies: 001_create_users_and_roles.sql, 002_create_workshops.sql, 004_create_talent_and_engagements.sql

-- ============================================================
-- PAYMENTS TABLE
-- ============================================================

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Payer
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Payment details
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_method TEXT CHECK (payment_method IN ('credit_card', 'debit_card', 'bank_transfer', 'paypal', 'stripe')),

  -- Transaction
  transaction_id TEXT UNIQUE,
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'paypal', 'manual')),
  provider_customer_id TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded', 'cancelled')),

  -- Related entities
  payment_type TEXT NOT NULL CHECK (payment_type IN ('workshop', 'engagement', 'subscription', 'other')),
  related_entity_id UUID,

  -- Invoice
  invoice_number TEXT UNIQUE,
  invoice_url TEXT,

  -- Refund
  refund_amount DECIMAL(10,2) CHECK (refund_amount >= 0 AND refund_amount <= amount),
  refund_reason TEXT,
  refunded_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- Add indexes
CREATE INDEX idx_payments_user ON public.payments(user_id);
CREATE INDEX idx_payments_org ON public.payments(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_type ON public.payments(payment_type);
CREATE INDEX idx_payments_transaction ON public.payments(transaction_id) WHERE transaction_id IS NOT NULL;
CREATE INDEX idx_payments_provider ON public.payments(provider);
CREATE INDEX idx_payments_created ON public.payments(created_at DESC);

-- Composite indexes
CREATE INDEX idx_payments_user_status ON public.payments(user_id, status);

-- GIN index
CREATE INDEX idx_payments_metadata ON public.payments USING GIN(metadata);

COMMENT ON TABLE public.payments IS 'Payment transactions for workshops, engagements, and subscriptions';

-- ============================================================
-- CERTIFICATES TABLE
-- ============================================================

CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Certificate details
  certificate_type TEXT NOT NULL CHECK (certificate_type IN ('workshop', 'program', 'assessment')),
  title TEXT NOT NULL,
  description TEXT,

  -- Related entity
  workshop_id UUID REFERENCES public.workshops(id) ON DELETE SET NULL,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE SET NULL,

  -- Certificate data
  certificate_number TEXT NOT NULL UNIQUE,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,

  -- Skills & competencies
  skills_demonstrated TEXT[] DEFAULT '{}',
  competencies JSONB DEFAULT '[]'::jsonb,

  -- Files
  certificate_url TEXT,
  badge_url TEXT,

  -- Verification
  verification_url TEXT,
  is_verified BOOLEAN DEFAULT false,

  -- Instructor/issuer
  issued_by UUID REFERENCES public.users(id),
  issuer_name TEXT NOT NULL,
  issuer_title TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_certificates_user ON public.certificates(user_id);
CREATE INDEX idx_certificates_type ON public.certificates(certificate_type);
CREATE INDEX idx_certificates_workshop ON public.certificates(workshop_id) WHERE workshop_id IS NOT NULL;
CREATE INDEX idx_certificates_number ON public.certificates(certificate_number);
CREATE INDEX idx_certificates_issue_date ON public.certificates(issue_date DESC);

-- GIN indexes
CREATE INDEX idx_certificates_skills ON public.certificates USING GIN(skills_demonstrated);
CREATE INDEX idx_certificates_competencies ON public.certificates USING GIN(competencies);

COMMENT ON TABLE public.certificates IS 'Completion certificates for workshops and assessments';

-- ============================================================
-- REVIEWS TABLE
-- ============================================================

CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Review target
  review_type TEXT NOT NULL CHECK (review_type IN ('workshop', 'expert', 'engagement')),
  workshop_id UUID REFERENCES public.workshops(id) ON DELETE CASCADE,
  expert_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  engagement_id UUID REFERENCES public.engagements(id) ON DELETE CASCADE,

  -- Rating & review
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  review_text TEXT NOT NULL,

  -- Detailed ratings (optional)
  content_quality_rating INTEGER CHECK (content_quality_rating >= 1 AND content_quality_rating <= 5),
  delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  impact_rating INTEGER CHECK (impact_rating >= 1 AND impact_rating <= 5),

  -- Verification
  verified_purchase BOOLEAN DEFAULT false,

  -- Moderation
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
  moderation_notes TEXT,

  -- Helpfulness
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,

  -- Response
  response_text TEXT,
  response_by UUID REFERENCES public.users(id),
  responded_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT check_review_target CHECK (
    (review_type = 'workshop' AND workshop_id IS NOT NULL AND expert_id IS NULL AND engagement_id IS NULL) OR
    (review_type = 'expert' AND expert_id IS NOT NULL AND workshop_id IS NULL AND engagement_id IS NULL) OR
    (review_type = 'engagement' AND engagement_id IS NOT NULL AND workshop_id IS NULL AND expert_id IS NULL)
  )
);

-- Add indexes
CREATE INDEX idx_reviews_user ON public.reviews(user_id);
CREATE INDEX idx_reviews_type ON public.reviews(review_type);
CREATE INDEX idx_reviews_workshop ON public.reviews(workshop_id) WHERE workshop_id IS NOT NULL;
CREATE INDEX idx_reviews_expert ON public.reviews(expert_id) WHERE expert_id IS NOT NULL;
CREATE INDEX idx_reviews_engagement ON public.reviews(engagement_id) WHERE engagement_id IS NOT NULL;
CREATE INDEX idx_reviews_status ON public.reviews(status);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);
CREATE INDEX idx_reviews_created ON public.reviews(created_at DESC);

-- Composite indexes
CREATE INDEX idx_reviews_workshop_status ON public.reviews(workshop_id, status) WHERE workshop_id IS NOT NULL;
CREATE INDEX idx_reviews_expert_status ON public.reviews(expert_id, status) WHERE expert_id IS NOT NULL;

-- Full-text search
CREATE INDEX idx_reviews_search ON public.reviews
  USING GIN(to_tsvector('english', COALESCE(title, '') || ' ' || review_text));

COMMENT ON TABLE public.reviews IS 'User reviews for workshops, experts, and engagements';

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update workshop rating when review is created/updated
CREATE OR REPLACE FUNCTION update_workshop_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_avg_rating NUMERIC;
BEGIN
  IF NEW.review_type = 'workshop' AND NEW.status = 'approved' THEN
    -- Calculate average rating
    SELECT AVG(rating)
    INTO v_avg_rating
    FROM public.reviews
    WHERE workshop_id = NEW.workshop_id
      AND status = 'approved';

    -- Note: This would require adding a rating column to workshops table
    -- UPDATE public.workshops
    -- SET rating = v_avg_rating
    -- WHERE id = NEW.workshop_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_on_review
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_workshop_rating();

-- Auto-generate certificate number
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.certificate_number IS NULL THEN
    NEW.certificate_number := 'CERT-' ||
      UPPER(SUBSTRING(NEW.certificate_type FROM 1 FOR 3)) || '-' ||
      TO_CHAR(NEW.issue_date, 'YYYYMMDD') || '-' ||
      SUBSTRING(NEW.id::TEXT FROM 1 FOR 8);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_cert_number
  BEFORE INSERT ON public.certificates
  FOR EACH ROW
  EXECUTE FUNCTION generate_certificate_number();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Payments policies
CREATE POLICY "Users can view their own payments"
  ON public.payments
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Organization members can view org payments"
  ON public.payments
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'client'
    )
  );

CREATE POLICY "Users can create payments"
  ON public.payments
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all payments"
  ON public.payments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Certificates policies
CREATE POLICY "Users can view their own certificates"
  ON public.certificates
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can verify certificates"
  ON public.certificates
  FOR SELECT
  USING (is_verified = true);

CREATE POLICY "Instructors can issue certificates"
  ON public.certificates
  FOR INSERT
  WITH CHECK (
    issued_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('instructor', 'admin')
    )
  );

CREATE POLICY "Admins can manage all certificates"
  ON public.certificates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Reviews policies
CREATE POLICY "Users can view approved reviews"
  ON public.reviews
  FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can view their own reviews"
  ON public.reviews
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Workshop instructors can view reviews"
  ON public.reviews
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workshops
      WHERE id = workshop_id
      AND instructor_id = auth.uid()
    )
  );

CREATE POLICY "Experts can view their reviews"
  ON public.reviews
  FOR SELECT
  USING (expert_id = auth.uid());

CREATE POLICY "Users can create reviews"
  ON public.reviews
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own pending reviews"
  ON public.reviews
  FOR UPDATE
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Experts can respond to reviews"
  ON public.reviews
  FOR UPDATE
  USING (expert_id = auth.uid() OR workshop_id IN (
    SELECT id FROM public.workshops WHERE instructor_id = auth.uid()
  ))
  WITH CHECK (response_by = auth.uid());

CREATE POLICY "Admins can manage all reviews"
  ON public.reviews
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

-- Get payment history for user
CREATE OR REPLACE FUNCTION get_user_payment_history(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  payment_id UUID,
  amount DECIMAL,
  currency TEXT,
  payment_type TEXT,
  status TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    id AS payment_id,
    amount,
    currency,
    payment_type,
    status,
    created_at
  FROM public.payments
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user certificates
CREATE OR REPLACE FUNCTION get_user_certificates(p_user_id UUID)
RETURNS TABLE(
  certificate_id UUID,
  title TEXT,
  certificate_type TEXT,
  certificate_number TEXT,
  issue_date DATE,
  certificate_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    id AS certificate_id,
    title,
    certificate_type,
    certificate_number,
    issue_date,
    certificate_url
  FROM public.certificates
  WHERE user_id = p_user_id
  ORDER BY issue_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get workshop reviews summary
CREATE OR REPLACE FUNCTION get_workshop_reviews_summary(p_workshop_id UUID)
RETURNS TABLE(
  average_rating NUMERIC,
  total_reviews INTEGER,
  rating_distribution JSONB
) AS $$
DECLARE
  v_distribution JSONB;
BEGIN
  -- Calculate rating distribution
  SELECT jsonb_object_agg(rating::TEXT, count)
  INTO v_distribution
  FROM (
    SELECT rating, COUNT(*)::INTEGER AS count
    FROM public.reviews
    WHERE workshop_id = p_workshop_id
      AND status = 'approved'
    GROUP BY rating
  ) sub;

  RETURN QUERY
  SELECT
    ROUND(AVG(rating), 2) AS average_rating,
    COUNT(*)::INTEGER AS total_reviews,
    COALESCE(v_distribution, '{}'::jsonb) AS rating_distribution
  FROM public.reviews
  WHERE workshop_id = p_workshop_id
    AND status = 'approved';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ROLLBACK
-- ============================================================
-- DROP FUNCTION IF EXISTS get_workshop_reviews_summary(UUID);
-- DROP FUNCTION IF EXISTS get_user_certificates(UUID);
-- DROP FUNCTION IF EXISTS get_user_payment_history(UUID, INTEGER, INTEGER);
-- DROP TRIGGER IF EXISTS generate_cert_number ON public.certificates;
-- DROP TRIGGER IF EXISTS update_rating_on_review ON public.reviews;
-- DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
-- DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
-- DROP FUNCTION IF EXISTS generate_certificate_number();
-- DROP FUNCTION IF EXISTS update_workshop_rating();
-- DROP TABLE IF EXISTS public.reviews CASCADE;
-- DROP TABLE IF EXISTS public.certificates CASCADE;
-- DROP TABLE IF EXISTS public.payments CASCADE;
