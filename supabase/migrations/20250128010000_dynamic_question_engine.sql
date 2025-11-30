-- Migration: Dynamic Question Engine
-- Description: Add question bank, versioning, skip logic, and industry-specific questions
-- Phase: 2 (Assessment Engine Enhancement)

-- ============================================================
-- QUESTION BANK TABLE
-- ============================================================

CREATE TABLE public.question_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Question identification
  question_code TEXT NOT NULL UNIQUE, -- e.g., "IND_001", "LEAD_002"
  version INTEGER NOT NULL DEFAULT 1,

  -- Question content
  question_text TEXT NOT NULL,
  question_description TEXT,
  help_text TEXT,

  -- Categorization
  dimension TEXT NOT NULL CHECK (dimension IN ('individual', 'leadership', 'cultural', 'embedding', 'velocity')),
  subdimension TEXT, -- e.g., "learning_agility", "change_leadership", "innovation_culture"

  -- Question type and scoring
  answer_type TEXT NOT NULL CHECK (answer_type IN ('scale', 'multiChoice', 'fearToConfidence', 'text', 'boolean')),
  weight INTEGER NOT NULL DEFAULT 1 CHECK (weight > 0),

  -- Answer options (for multiChoice questions)
  answer_options JSONB DEFAULT '[]'::jsonb,

  -- Targeting
  industries TEXT[] DEFAULT '{}', -- Empty array = all industries
  company_sizes TEXT[] DEFAULT '{}', -- e.g., ['startup', 'small', 'medium', 'enterprise']
  maturity_levels INTEGER[] DEFAULT '{}', -- Target specific maturity levels (0-9)

  -- Skip logic
  skip_conditions JSONB DEFAULT '[]'::jsonb, -- Conditions to skip this question
  dependency_questions TEXT[], -- Questions that must be answered first

  -- Display order and grouping
  display_order INTEGER NOT NULL DEFAULT 0,
  question_group TEXT, -- Logical grouping for UI

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  requires_followup BOOLEAN DEFAULT false, -- If true, may trigger follow-up questions

  -- A/B testing
  ab_test_variant TEXT, -- e.g., "variant_a", "variant_b"
  ab_test_weight NUMERIC DEFAULT 1.0 CHECK (ab_test_weight >= 0 AND ab_test_weight <= 1.0),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deprecated_at TIMESTAMPTZ,

  -- Version constraint: each question_code can have multiple versions
  UNIQUE (question_code, version)
);

-- Indexes
CREATE INDEX idx_question_bank_dimension ON public.question_bank(dimension);
CREATE INDEX idx_question_bank_subdimension ON public.question_bank(subdimension);
CREATE INDEX idx_question_bank_active ON public.question_bank(is_active) WHERE is_active = true;
CREATE INDEX idx_question_bank_code ON public.question_bank(question_code);
CREATE INDEX idx_question_bank_industries ON public.question_bank USING GIN(industries);
CREATE INDEX idx_question_bank_company_sizes ON public.question_bank USING GIN(company_sizes);
CREATE INDEX idx_question_bank_display_order ON public.question_bank(dimension, display_order);

COMMENT ON TABLE public.question_bank IS 'Central repository for all assessment questions with versioning and targeting';
COMMENT ON COLUMN public.question_bank.skip_conditions IS 'Array of conditions that cause this question to be skipped. Example: [{"if_answer": {"question_code": "IND_001", "operator": "lt", "value": 30}}]';
COMMENT ON COLUMN public.question_bank.answer_options IS 'For multiChoice questions. Example: [{"value": 1, "label": "Never"}, {"value": 50, "label": "Sometimes"}, {"value": 100, "label": "Always"}]';

-- ============================================================
-- QUESTION FLOW TABLE (for adaptive questioning)
-- ============================================================

CREATE TABLE public.question_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Flow identification
  flow_name TEXT NOT NULL UNIQUE,
  flow_description TEXT,

  -- Flow type
  flow_type TEXT NOT NULL DEFAULT 'standard' CHECK (flow_type IN ('standard', 'quick', 'industry_specific', 'follow_up')),

  -- Targeting (similar to question_bank)
  industries TEXT[] DEFAULT '{}',
  company_sizes TEXT[] DEFAULT '{}',
  assessment_type TEXT DEFAULT 'full', -- 'full', 'quick', 'follow_up'

  -- Question selection strategy
  question_selection_strategy TEXT NOT NULL DEFAULT 'sequential' CHECK (
    question_selection_strategy IN ('sequential', 'adaptive', 'random', 'weighted')
  ),

  -- Questions in this flow (ordered)
  question_codes TEXT[] NOT NULL DEFAULT '{}',

  -- Branching rules
  branching_rules JSONB DEFAULT '[]'::jsonb,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_question_flows_active ON public.question_flows(is_active) WHERE is_active = true;
CREATE INDEX idx_question_flows_type ON public.question_flows(flow_type);
CREATE INDEX idx_question_flows_industries ON public.question_flows USING GIN(industries);

COMMENT ON TABLE public.question_flows IS 'Defines different question flows for adaptive assessments';
COMMENT ON COLUMN public.question_flows.branching_rules IS 'Rules for branching to different questions based on answers. Example: [{"from_question": "IND_001", "condition": {"operator": "gte", "value": 70}, "to_questions": ["IND_005", "IND_006"]}]';

-- ============================================================
-- UPDATE ASSESSMENT_ANSWERS TO TRACK QUESTION VERSION
-- ============================================================

ALTER TABLE public.assessment_answers
  ADD COLUMN question_version INTEGER DEFAULT 1,
  ADD COLUMN question_bank_id UUID REFERENCES public.question_bank(id),
  ADD COLUMN skipped BOOLEAN DEFAULT false,
  ADD COLUMN skip_reason TEXT,
  ADD COLUMN time_spent_seconds INTEGER; -- Time user spent on this question

CREATE INDEX idx_answers_question_bank ON public.assessment_answers(question_bank_id);
CREATE INDEX idx_answers_skipped ON public.assessment_answers(skipped) WHERE skipped = true;

COMMENT ON COLUMN public.assessment_answers.question_version IS 'Version of the question from question_bank at time of answer';
COMMENT ON COLUMN public.assessment_answers.skipped IS 'Whether this question was skipped due to skip logic';

-- ============================================================
-- ASSESSMENT SESSIONS (for tracking question flow)
-- ============================================================

CREATE TABLE public.assessment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,

  -- Flow tracking
  flow_id UUID REFERENCES public.question_flows(id),
  current_question_index INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,

  -- Progress
  questions_answered INTEGER NOT NULL DEFAULT 0,
  questions_skipped INTEGER NOT NULL DEFAULT 0,

  -- Session state
  session_state JSONB DEFAULT '{}'::jsonb, -- Store any session-specific state
  question_sequence TEXT[] DEFAULT '{}', -- Actual sequence shown to user

  -- Timing
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (assessment_id)
);

CREATE INDEX idx_assessment_sessions_assessment ON public.assessment_sessions(assessment_id);
CREATE INDEX idx_assessment_sessions_flow ON public.assessment_sessions(flow_id);

COMMENT ON TABLE public.assessment_sessions IS 'Tracks the question flow and progress for each assessment';
COMMENT ON COLUMN public.assessment_sessions.session_state IS 'Stores context needed for adaptive questioning (previous answers, branching decisions, etc.)';

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER update_question_bank_updated_at
  BEFORE UPDATE ON public.question_bank
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_question_flows_updated_at
  BEFORE UPDATE ON public.question_flows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update session activity
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.assessment_sessions
  SET
    last_activity_at = now(),
    questions_answered = questions_answered + CASE WHEN NOT NEW.skipped THEN 1 ELSE 0 END,
    questions_skipped = questions_skipped + CASE WHEN NEW.skipped THEN 1 ELSE 0 END
  WHERE assessment_id = NEW.assessment_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_session_on_answer
  AFTER INSERT ON public.assessment_answers
  FOR EACH ROW EXECUTE FUNCTION update_session_activity();

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Get next question for an assessment (adaptive logic)
CREATE OR REPLACE FUNCTION get_next_question(
  p_assessment_id UUID
)
RETURNS TABLE(
  question_id UUID,
  question_code TEXT,
  question_text TEXT,
  question_description TEXT,
  help_text TEXT,
  dimension TEXT,
  subdimension TEXT,
  answer_type TEXT,
  answer_options JSONB,
  weight INTEGER,
  display_order INTEGER
) AS $$
DECLARE
  v_session RECORD;
  v_answered_codes TEXT[];
BEGIN
  -- Get session info
  SELECT * INTO v_session
  FROM public.assessment_sessions
  WHERE assessment_id = p_assessment_id;

  -- Get already answered question codes
  SELECT array_agg(question_id) INTO v_answered_codes
  FROM public.assessment_answers
  WHERE assessment_id = p_assessment_id;

  -- Return next unanswered question from the sequence
  -- This is a simplified version - real implementation would include skip logic
  RETURN QUERY
  SELECT
    qb.id,
    qb.question_code,
    qb.question_text,
    qb.question_description,
    qb.help_text,
    qb.dimension,
    qb.subdimension,
    qb.answer_type,
    qb.answer_options,
    qb.weight,
    qb.display_order
  FROM public.question_bank qb
  WHERE qb.is_active = true
    AND qb.question_code = ANY(v_session.question_sequence)
    AND qb.question_code != ALL(COALESCE(v_answered_codes, ARRAY[]::TEXT[]))
  ORDER BY array_position(v_session.question_sequence, qb.question_code)
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if question should be skipped based on skip conditions
CREATE OR REPLACE FUNCTION should_skip_question(
  p_assessment_id UUID,
  p_question_code TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_question RECORD;
  v_condition JSONB;
  v_target_answer RECORD;
  v_should_skip BOOLEAN := false;
BEGIN
  -- Get question with skip conditions
  SELECT * INTO v_question
  FROM public.question_bank
  WHERE question_code = p_question_code
    AND is_active = true;

  -- If no skip conditions, don't skip
  IF v_question.skip_conditions IS NULL OR jsonb_array_length(v_question.skip_conditions) = 0 THEN
    RETURN false;
  END IF;

  -- Check each skip condition
  FOR v_condition IN SELECT * FROM jsonb_array_elements(v_question.skip_conditions)
  LOOP
    -- Get the answer to the referenced question
    SELECT * INTO v_target_answer
    FROM public.assessment_answers
    WHERE assessment_id = p_assessment_id
      AND question_id = v_condition->>'question_code';

    -- Evaluate condition
    IF v_target_answer IS NOT NULL THEN
      CASE v_condition->>'operator'
        WHEN 'eq' THEN
          v_should_skip := v_target_answer.answer_value = (v_condition->>'value')::INTEGER;
        WHEN 'lt' THEN
          v_should_skip := v_target_answer.answer_value < (v_condition->>'value')::INTEGER;
        WHEN 'lte' THEN
          v_should_skip := v_target_answer.answer_value <= (v_condition->>'value')::INTEGER;
        WHEN 'gt' THEN
          v_should_skip := v_target_answer.answer_value > (v_condition->>'value')::INTEGER;
        WHEN 'gte' THEN
          v_should_skip := v_target_answer.answer_value >= (v_condition->>'value')::INTEGER;
      END CASE;

      -- If any condition matches, skip the question
      IF v_should_skip THEN
        EXIT;
      END IF;
    END IF;
  END LOOP;

  RETURN v_should_skip;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_sessions ENABLE ROW LEVEL SECURITY;

-- Question bank: everyone can read active questions
CREATE POLICY "Anyone can view active questions"
  ON public.question_bank
  FOR SELECT
  USING (is_active = true);

-- Only admins can modify questions
CREATE POLICY "Admins can manage questions"
  ON public.question_bank
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin_full')
    )
  );

-- Question flows: everyone can read active flows
CREATE POLICY "Anyone can view active flows"
  ON public.question_flows
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage flows"
  ON public.question_flows
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin_full')
    )
  );

-- Assessment sessions: users can view/update their own sessions
CREATE POLICY "Users can view their own assessment sessions"
  ON public.assessment_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments
      WHERE id = assessment_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own assessment sessions"
  ON public.assessment_sessions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments
      WHERE id = assessment_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can create assessment sessions"
  ON public.assessment_sessions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assessments
      WHERE id = assessment_id
      AND user_id = auth.uid()
    )
  );

-- ============================================================
-- ROLLBACK
-- ============================================================
-- DROP FUNCTION IF EXISTS should_skip_question(UUID, TEXT);
-- DROP FUNCTION IF EXISTS get_next_question(UUID);
-- DROP TRIGGER IF EXISTS update_session_on_answer ON public.assessment_answers;
-- DROP FUNCTION IF EXISTS update_session_activity();
-- DROP TRIGGER IF EXISTS update_question_flows_updated_at ON public.question_flows;
-- DROP TRIGGER IF EXISTS update_question_bank_updated_at ON public.question_bank;
-- DROP TABLE IF EXISTS public.assessment_sessions CASCADE;
-- DROP TABLE IF EXISTS public.question_flows CASCADE;
-- DROP TABLE IF EXISTS public.question_bank CASCADE;
-- ALTER TABLE public.assessment_answers DROP COLUMN IF EXISTS time_spent_seconds;
-- ALTER TABLE public.assessment_answers DROP COLUMN IF EXISTS skip_reason;
-- ALTER TABLE public.assessment_answers DROP COLUMN IF EXISTS skipped;
-- ALTER TABLE public.assessment_answers DROP COLUMN IF EXISTS question_bank_id;
-- ALTER TABLE public.assessment_answers DROP COLUMN IF EXISTS question_version;
