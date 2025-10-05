-- Migration: 003_create_assessments.sql
-- Description: Create assessment and assessment answers tables
-- Dependencies: 001_create_users_and_roles.sql

-- ============================================================
-- ASSESSMENTS TABLE
-- ============================================================

CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Organization context (optional)
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Assessment type
  assessment_type TEXT NOT NULL DEFAULT 'full' CHECK (assessment_type IN ('full', 'quick', 'follow_up')),

  -- Status
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),

  -- Dimension scores (0-100)
  individual_score INTEGER CHECK (individual_score >= 0 AND individual_score <= 100),
  leadership_score INTEGER CHECK (leadership_score >= 0 AND leadership_score <= 100),
  cultural_score INTEGER CHECK (cultural_score >= 0 AND cultural_score <= 100),
  embedding_score INTEGER CHECK (embedding_score >= 0 AND embedding_score <= 100),
  velocity_score INTEGER CHECK (velocity_score >= 0 AND velocity_score <= 100),

  -- Overall score (calculated)
  overall_score INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN individual_score IS NOT NULL
        AND leadership_score IS NOT NULL
        AND cultural_score IS NOT NULL
        AND embedding_score IS NOT NULL
        AND velocity_score IS NOT NULL
      THEN (individual_score + leadership_score + cultural_score + embedding_score + velocity_score) / 5
      ELSE NULL
    END
  ) STORED,

  -- Results and recommendations
  results JSONB DEFAULT '{}'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_assessments_user ON public.assessments(user_id);
CREATE INDEX idx_assessments_org ON public.assessments(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX idx_assessments_status ON public.assessments(status);
CREATE INDEX idx_assessments_type ON public.assessments(assessment_type);
CREATE INDEX idx_assessments_completed ON public.assessments(completed_at) WHERE completed_at IS NOT NULL;

-- Composite indexes
CREATE INDEX idx_assessments_user_status ON public.assessments(user_id, status);
CREATE INDEX idx_assessments_user_completed ON public.assessments(user_id, completed_at DESC) WHERE status = 'completed';

-- GIN index for JSONB
CREATE INDEX idx_assessments_results ON public.assessments USING GIN(results);
CREATE INDEX idx_assessments_recommendations ON public.assessments USING GIN(recommendations);

COMMENT ON TABLE public.assessments IS 'Adaptability assessments tracking transformation readiness';
COMMENT ON COLUMN public.assessments.overall_score IS 'Automatically calculated average of all dimension scores';

-- ============================================================
-- ASSESSMENT ANSWERS TABLE
-- ============================================================

CREATE TABLE public.assessment_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,

  -- Question identification
  question_id TEXT NOT NULL,
  dimension TEXT NOT NULL CHECK (dimension IN ('individual', 'leadership', 'cultural', 'embedding', 'velocity')),

  -- Answer
  answer_type TEXT NOT NULL CHECK (answer_type IN ('scale', 'multiChoice', 'fearToConfidence', 'text')),
  answer_value INTEGER CHECK (answer_value >= 0 AND answer_value <= 100),
  answer_text TEXT,

  -- Question metadata (for reference)
  question_text TEXT NOT NULL,
  question_weight INTEGER NOT NULL CHECK (question_weight > 0),

  -- Timestamps
  answered_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT unique_assessment_question UNIQUE (assessment_id, question_id)
);

-- Add indexes
CREATE INDEX idx_answers_assessment ON public.assessment_answers(assessment_id);
CREATE INDEX idx_answers_dimension ON public.assessment_answers(dimension);
CREATE INDEX idx_answers_question ON public.assessment_answers(question_id);

COMMENT ON TABLE public.assessment_answers IS 'Individual question responses for each assessment';

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER update_assessments_updated_at
  BEFORE UPDATE ON public.assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-calculate dimension scores when answers are added/updated
CREATE OR REPLACE FUNCTION calculate_dimension_score()
RETURNS TRIGGER AS $$
DECLARE
  v_total_weight INTEGER;
  v_weighted_score NUMERIC;
  v_final_score INTEGER;
BEGIN
  -- Calculate weighted average for the dimension
  SELECT
    SUM(question_weight),
    SUM(answer_value * question_weight)
  INTO v_total_weight, v_weighted_score
  FROM public.assessment_answers
  WHERE assessment_id = COALESCE(NEW.assessment_id, OLD.assessment_id)
    AND dimension = COALESCE(NEW.dimension, OLD.dimension);

  IF v_total_weight > 0 THEN
    v_final_score := ROUND(v_weighted_score / v_total_weight);

    -- Update the appropriate dimension score
    CASE COALESCE(NEW.dimension, OLD.dimension)
      WHEN 'individual' THEN
        UPDATE public.assessments
        SET individual_score = v_final_score
        WHERE id = COALESCE(NEW.assessment_id, OLD.assessment_id);
      WHEN 'leadership' THEN
        UPDATE public.assessments
        SET leadership_score = v_final_score
        WHERE id = COALESCE(NEW.assessment_id, OLD.assessment_id);
      WHEN 'cultural' THEN
        UPDATE public.assessments
        SET cultural_score = v_final_score
        WHERE id = COALESCE(NEW.assessment_id, OLD.assessment_id);
      WHEN 'embedding' THEN
        UPDATE public.assessments
        SET embedding_score = v_final_score
        WHERE id = COALESCE(NEW.assessment_id, OLD.assessment_id);
      WHEN 'velocity' THEN
        UPDATE public.assessments
        SET velocity_score = v_final_score
        WHERE id = COALESCE(NEW.assessment_id, OLD.assessment_id);
    END CASE;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_score_on_answer_insert
  AFTER INSERT ON public.assessment_answers
  FOR EACH ROW EXECUTE FUNCTION calculate_dimension_score();

CREATE TRIGGER calculate_score_on_answer_update
  AFTER UPDATE ON public.assessment_answers
  FOR EACH ROW EXECUTE FUNCTION calculate_dimension_score();

CREATE TRIGGER calculate_score_on_answer_delete
  AFTER DELETE ON public.assessment_answers
  FOR EACH ROW EXECUTE FUNCTION calculate_dimension_score();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_answers ENABLE ROW LEVEL SECURITY;

-- Assessments policies
CREATE POLICY "Users can view their own assessments"
  ON public.assessments
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own assessments"
  ON public.assessments
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own assessments"
  ON public.assessments
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Organization admins can view org assessments"
  ON public.assessments
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'client'
    )
  );

CREATE POLICY "Admins can view all assessments"
  ON public.assessments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Assessment answers policies
CREATE POLICY "Users can view their own assessment answers"
  ON public.assessment_answers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments
      WHERE id = assessment_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own assessment answers"
  ON public.assessment_answers
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assessments
      WHERE id = assessment_id
      AND user_id = auth.uid()
      AND status = 'in_progress'
    )
  );

CREATE POLICY "Users can update their own assessment answers"
  ON public.assessment_answers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments
      WHERE id = assessment_id
      AND user_id = auth.uid()
      AND status = 'in_progress'
    )
  );

CREATE POLICY "Admins can view all assessment answers"
  ON public.assessment_answers
  FOR SELECT
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

-- Get user's latest assessment
CREATE OR REPLACE FUNCTION get_user_latest_assessment(p_user_id UUID)
RETURNS TABLE(
  assessment_id UUID,
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
    id AS assessment_id,
    overall_score,
    individual_score,
    leadership_score,
    cultural_score,
    embedding_score,
    velocity_score,
    completed_at
  FROM public.assessments
  WHERE user_id = p_user_id
    AND status = 'completed'
  ORDER BY completed_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get assessment progress
CREATE OR REPLACE FUNCTION get_assessment_progress(p_assessment_id UUID)
RETURNS TABLE(
  dimension TEXT,
  total_questions INTEGER,
  answered_questions INTEGER,
  completion_percentage INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dimension,
    COUNT(*)::INTEGER AS total_questions,
    COUNT(answer_value)::INTEGER AS answered_questions,
    (COUNT(answer_value)::NUMERIC / COUNT(*)::NUMERIC * 100)::INTEGER AS completion_percentage
  FROM public.assessment_answers
  WHERE assessment_id = p_assessment_id
  GROUP BY dimension;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get organization adaptability trend
CREATE OR REPLACE FUNCTION get_org_adaptability_trend(
  p_organization_id UUID,
  p_months INTEGER DEFAULT 6
)
RETURNS TABLE(
  month DATE,
  avg_overall_score NUMERIC,
  avg_individual_score NUMERIC,
  avg_leadership_score NUMERIC,
  avg_cultural_score NUMERIC,
  avg_embedding_score NUMERIC,
  avg_velocity_score NUMERIC,
  assessment_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE_TRUNC('month', completed_at)::DATE AS month,
    ROUND(AVG(overall_score), 1) AS avg_overall_score,
    ROUND(AVG(individual_score), 1) AS avg_individual_score,
    ROUND(AVG(leadership_score), 1) AS avg_leadership_score,
    ROUND(AVG(cultural_score), 1) AS avg_cultural_score,
    ROUND(AVG(embedding_score), 1) AS avg_embedding_score,
    ROUND(AVG(velocity_score), 1) AS avg_velocity_score,
    COUNT(*)::INTEGER AS assessment_count
  FROM public.assessments
  WHERE organization_id = p_organization_id
    AND status = 'completed'
    AND completed_at >= NOW() - (p_months || ' months')::INTERVAL
  GROUP BY DATE_TRUNC('month', completed_at)
  ORDER BY month DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ROLLBACK
-- ============================================================
-- DROP FUNCTION IF EXISTS get_org_adaptability_trend(UUID, INTEGER);
-- DROP FUNCTION IF EXISTS get_assessment_progress(UUID);
-- DROP FUNCTION IF EXISTS get_user_latest_assessment(UUID);
-- DROP TRIGGER IF EXISTS calculate_score_on_answer_delete ON public.assessment_answers;
-- DROP TRIGGER IF EXISTS calculate_score_on_answer_update ON public.assessment_answers;
-- DROP TRIGGER IF EXISTS calculate_score_on_answer_insert ON public.assessment_answers;
-- DROP TRIGGER IF EXISTS update_assessments_updated_at ON public.assessments;
-- DROP FUNCTION IF EXISTS calculate_dimension_score();
-- DROP TABLE IF EXISTS public.assessment_answers CASCADE;
-- DROP TABLE IF EXISTS public.assessments CASCADE;
