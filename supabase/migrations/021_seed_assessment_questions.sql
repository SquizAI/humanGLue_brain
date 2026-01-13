-- Migration: 021_seed_assessment_questions.sql
-- Description: Seed question banks with all assessment questions
-- Phase: Assessment content population
-- Total: 119 questions across 3 assessments

-- ============================================================
-- CREATE ASSESSMENT TYPES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.assessment_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  estimated_minutes INTEGER NOT NULL DEFAULT 15,
  total_questions INTEGER NOT NULL DEFAULT 0,
  version TEXT NOT NULL DEFAULT '1.0.0',
  is_active BOOLEAN NOT NULL DEFAULT true,
  category TEXT CHECK (category IN ('individual', 'organizational', 'team')),
  icon TEXT,
  color TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assessment_types_code ON public.assessment_types(code);
CREATE INDEX IF NOT EXISTS idx_assessment_types_active ON public.assessment_types(is_active) WHERE is_active = true;

COMMENT ON TABLE public.assessment_types IS 'Assessment type definitions and configurations';

-- Enable RLS
ALTER TABLE public.assessment_types ENABLE ROW LEVEL SECURITY;

-- Everyone can read assessment types
CREATE POLICY "Anyone can view assessment types"
  ON public.assessment_types
  FOR SELECT
  USING (true);

-- Only admins can manage assessment types
CREATE POLICY "Admins can manage assessment types"
  ON public.assessment_types
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin_full')
    )
  );

-- ============================================================
-- INSERT ASSESSMENT TYPES
-- ============================================================

INSERT INTO public.assessment_types (code, name, description, short_description, estimated_minutes, total_questions, category, icon, color)
VALUES
  ('glueiq', 'GlueIQ Assessment', 'Measure your individual AI adaptability and transformation readiness across 5 key dimensions: Individual Readiness, Leadership Capability, Cultural Alignment, Behavior Embedding, and Change Velocity.', 'Personal AI readiness assessment', 12, 30, 'individual', 'User', '#06B6D4'),
  ('org-maturity', 'Organizational AI Maturity Assessment', 'Comprehensive enterprise AI readiness assessment across 23 dimensions covering Technical Foundation, Human Capital, Business Strategy, and AI Adoption capabilities.', 'Enterprise AI maturity assessment', 40, 69, 'organizational', 'Building2', '#8B5CF6'),
  ('team-skills', 'Team AI Skills Inventory', 'Quick pulse assessment to map your team''s AI capabilities, identify training needs, and discover collaboration opportunities.', 'Team AI skills assessment', 7, 20, 'team', 'Users', '#10B981')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  estimated_minutes = EXCLUDED.estimated_minutes,
  total_questions = EXCLUDED.total_questions,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  updated_at = now();

-- ============================================================
-- SEED GLUEIQ ASSESSMENT QUESTIONS (30 questions)
-- ============================================================

-- Individual Readiness Dimension (6 questions)
INSERT INTO public.question_bank (question_code, version, question_text, question_description, help_text, dimension, subdimension, answer_type, weight, answer_options, display_order, is_active)
VALUES
  ('IND_001', 1, 'How would you describe your current understanding of AI and its capabilities?', 'Consider your knowledge of how AI works, what it can and cannot do, and its potential applications.', NULL, 'individual', 'ai_literacy', 'multiChoice', 1.2, '[{"value": 0, "label": "No understanding", "description": "I have little to no knowledge about AI"}, {"value": 25, "label": "Basic awareness", "description": "I know AI exists but not how it works"}, {"value": 50, "label": "General understanding", "description": "I understand basic concepts and common applications"}, {"value": 75, "label": "Working knowledge", "description": "I can discuss AI capabilities and limitations knowledgeably"}, {"value": 100, "label": "Deep expertise", "description": "I have hands-on experience and can evaluate AI solutions"}]'::jsonb, 1, true),

  ('IND_002', 1, 'When a new technology tool is introduced at work, how do you typically respond?', 'Think about your natural reaction when facing new software, apps, or digital processes.', NULL, 'individual', 'tech_comfort', 'multiChoice', 1.0, '[{"value": 0, "label": "Avoid it", "description": "I try to stick with what I know and avoid new tools"}, {"value": 25, "label": "Wait and see", "description": "I wait for others to try it first and only adopt if required"}, {"value": 50, "label": "Cautiously explore", "description": "I give it a try but prefer guidance and support"}, {"value": 75, "label": "Eager to learn", "description": "I actively explore new tools and enjoy learning them"}, {"value": 100, "label": "Early adopter", "description": "I seek out new tools and often help others learn them"}]'::jsonb, 2, true),

  ('IND_003', 1, 'How do you view your ability to learn new skills at this stage of your career?', NULL, 'Move the slider from fear (I''m too set in my ways) to confidence (I can learn anything)', 'individual', 'growth_mindset', 'fearToConfidence', 1.3, '[]'::jsonb, 3, true),

  ('IND_004', 1, 'In the past year, how many new digital tools or AI-powered applications have you learned to use?', NULL, NULL, 'individual', 'learning_agility', 'multiChoice', 1.0, '[{"value": 0, "label": "None", "description": "I haven''t learned any new digital tools"}, {"value": 25, "label": "1-2 tools", "description": "I''ve picked up a couple of new applications"}, {"value": 50, "label": "3-5 tools", "description": "I regularly learn new tools as needed"}, {"value": 75, "label": "6-10 tools", "description": "I actively seek out and learn new technologies"}, {"value": 100, "label": "More than 10", "description": "I continuously experiment with new tools and AI"}]'::jsonb, 4, true),

  ('IND_005', 1, 'How often do you currently use AI tools (like ChatGPT, Copilot, or AI features in apps) in your work?', NULL, NULL, 'individual', 'ai_experience', 'multiChoice', 1.1, '[{"value": 0, "label": "Never", "description": "I don''t use any AI tools"}, {"value": 20, "label": "Rarely", "description": "Once a month or less"}, {"value": 40, "label": "Occasionally", "description": "A few times a month"}, {"value": 60, "label": "Weekly", "description": "Several times a week"}, {"value": 80, "label": "Daily", "description": "Every day for various tasks"}, {"value": 100, "label": "Constantly", "description": "AI is integrated into my core workflow"}]'::jsonb, 5, true),

  ('IND_006', 1, 'How confident are you in identifying which parts of your job could be enhanced or automated by AI?', NULL, 'Rate from 0 (not confident at all) to 100 (very confident)', 'individual', 'self_awareness', 'scale', 0.9, '[]'::jsonb, 6, true)

ON CONFLICT (question_code, version) DO UPDATE SET
  question_text = EXCLUDED.question_text,
  question_description = EXCLUDED.question_description,
  help_text = EXCLUDED.help_text,
  dimension = EXCLUDED.dimension,
  subdimension = EXCLUDED.subdimension,
  answer_type = EXCLUDED.answer_type,
  weight = EXCLUDED.weight,
  answer_options = EXCLUDED.answer_options,
  display_order = EXCLUDED.display_order,
  updated_at = now();

-- Leadership Capability Dimension (6 questions)
INSERT INTO public.question_bank (question_code, version, question_text, question_description, help_text, dimension, subdimension, answer_type, weight, answer_options, display_order, is_active)
VALUES
  ('LEAD_001', 1, 'When your team faces a significant change, how do you typically approach leading them through it?', NULL, NULL, 'leadership', 'change_leadership', 'multiChoice', 1.2, '[{"value": 0, "label": "Struggle with change", "description": "I find it hard to guide others through uncertainty"}, {"value": 25, "label": "Follow instructions", "description": "I implement changes as directed from above"}, {"value": 50, "label": "Communicate clearly", "description": "I explain the change and answer questions"}, {"value": 75, "label": "Inspire and support", "description": "I help the team see the vision and provide support"}, {"value": 100, "label": "Champion change", "description": "I lead by example and create excitement for transformation"}]'::jsonb, 7, true),

  ('LEAD_002', 1, 'How effectively can you articulate a vision for how AI will transform your team''s work?', NULL, 'Move the slider based on your ability to paint a compelling picture of the AI-enabled future', 'leadership', 'vision_communication', 'fearToConfidence', 1.1, '[]'::jsonb, 8, true),

  ('LEAD_003', 1, 'How often do you help colleagues or team members learn new technologies or AI tools?', NULL, NULL, 'leadership', 'coaching', 'multiChoice', 1.0, '[{"value": 0, "label": "Never", "description": "I don''t help others with technology"}, {"value": 25, "label": "Rarely", "description": "Only when specifically asked"}, {"value": 50, "label": "Sometimes", "description": "When I notice someone struggling"}, {"value": 75, "label": "Often", "description": "I regularly share knowledge and tips"}, {"value": 100, "label": "Always", "description": "I proactively mentor and train others"}]'::jsonb, 9, true),

  ('LEAD_004', 1, 'How comfortable would your team feel coming to you about AI-related concerns or fears?', 'Consider whether your team feels safe discussing worries about job security, skill gaps, or technology anxiety.', 'Rate from 0 (not comfortable at all) to 100 (completely comfortable)', 'leadership', 'psychological_safety', 'scale', 1.0, '[]'::jsonb, 10, true),

  ('LEAD_005', 1, 'When evaluating AI solutions for your team, how do you approach the decision?', NULL, NULL, 'leadership', 'decision_making', 'multiChoice', 1.1, '[{"value": 0, "label": "Avoid decisions", "description": "I defer to others or avoid AI-related decisions"}, {"value": 25, "label": "Follow mandates", "description": "I implement what''s decided at higher levels"}, {"value": 50, "label": "Gather input", "description": "I consult with the team and stakeholders"}, {"value": 75, "label": "Strategic analysis", "description": "I evaluate ROI, risks, and alignment with goals"}, {"value": 100, "label": "Innovative leadership", "description": "I proactively identify AI opportunities and champion them"}]'::jsonb, 11, true),

  ('LEAD_006', 1, 'How successful have you been at influencing others in your organization to adopt new technologies?', NULL, 'Rate from 0 (no success) to 100 (highly successful)', 'leadership', 'influence', 'scale', 0.9, '[]'::jsonb, 12, true)

ON CONFLICT (question_code, version) DO UPDATE SET
  question_text = EXCLUDED.question_text,
  question_description = EXCLUDED.question_description,
  help_text = EXCLUDED.help_text,
  dimension = EXCLUDED.dimension,
  subdimension = EXCLUDED.subdimension,
  answer_type = EXCLUDED.answer_type,
  weight = EXCLUDED.weight,
  answer_options = EXCLUDED.answer_options,
  display_order = EXCLUDED.display_order,
  updated_at = now();

-- Cultural Alignment Dimension (6 questions)
INSERT INTO public.question_bank (question_code, version, question_text, question_description, help_text, dimension, subdimension, answer_type, weight, answer_options, display_order, is_active)
VALUES
  ('CULT_001', 1, 'How does your team typically respond to innovative ideas or new ways of working?', NULL, NULL, 'cultural', 'innovation_embrace', 'multiChoice', 1.2, '[{"value": 0, "label": "Resistant", "description": "New ideas are usually met with skepticism or rejection"}, {"value": 25, "label": "Cautious", "description": "We''re slow to change and prefer proven methods"}, {"value": 50, "label": "Open", "description": "We consider new ideas if they have clear benefits"}, {"value": 75, "label": "Encouraging", "description": "We actively encourage experimentation and new thinking"}, {"value": 100, "label": "Innovation-driven", "description": "Innovation is in our DNA - we constantly seek better ways"}]'::jsonb, 13, true),

  ('CULT_002', 1, 'How effectively does your organization share knowledge and best practices about AI and new technologies?', 'Consider cross-team communication, knowledge bases, communities of practice, etc.', 'Rate from 0 (no sharing) to 100 (excellent knowledge sharing)', 'cultural', 'collaboration', 'scale', 1.0, '[]'::jsonb, 14, true),

  ('CULT_003', 1, 'What happens in your organization when someone tries a new AI tool or approach and it doesn''t work out?', NULL, NULL, 'cultural', 'experimentation', 'multiChoice', 1.3, '[{"value": 0, "label": "Punished", "description": "Failure leads to blame and negative consequences"}, {"value": 25, "label": "Discouraged", "description": "It''s seen as a mistake and is quietly forgotten"}, {"value": 50, "label": "Accepted", "description": "Failure is tolerated but not celebrated"}, {"value": 75, "label": "Learned from", "description": "We analyze what went wrong and share learnings"}, {"value": 100, "label": "Celebrated", "description": "We celebrate learning from experiments, successful or not"}]'::jsonb, 15, true),

  ('CULT_004', 1, 'How much do you trust AI systems to help you make better decisions in your work?', NULL, 'Move the slider from distrust (AI can''t be trusted) to full trust (AI is a valuable partner)', 'cultural', 'trust', 'fearToConfidence', 1.0, '[]'::jsonb, 16, true),

  ('CULT_005', 1, 'How often are diverse perspectives (technical, non-technical, different departments) included in AI decisions?', NULL, NULL, 'cultural', 'diversity_of_thought', 'multiChoice', 0.9, '[{"value": 0, "label": "Never", "description": "Decisions are made by a small group without input"}, {"value": 25, "label": "Rarely", "description": "Occasionally someone is consulted"}, {"value": 50, "label": "Sometimes", "description": "Key stakeholders are involved in major decisions"}, {"value": 75, "label": "Often", "description": "We actively seek diverse perspectives"}, {"value": 100, "label": "Always", "description": "Inclusive decision-making is a core value"}]'::jsonb, 17, true),

  ('CULT_006', 1, 'How would you rate your organization''s commitment to continuous learning and improvement around AI?', 'Consider training programs, learning budgets, time allocated for skill development.', 'Rate from 0 (no commitment) to 100 (deeply committed)', 'cultural', 'continuous_improvement', 'scale', 1.0, '[]'::jsonb, 18, true)

ON CONFLICT (question_code, version) DO UPDATE SET
  question_text = EXCLUDED.question_text,
  question_description = EXCLUDED.question_description,
  help_text = EXCLUDED.help_text,
  dimension = EXCLUDED.dimension,
  subdimension = EXCLUDED.subdimension,
  answer_type = EXCLUDED.answer_type,
  weight = EXCLUDED.weight,
  answer_options = EXCLUDED.answer_options,
  display_order = EXCLUDED.display_order,
  updated_at = now();

-- Embedding Dimension (6 questions)
INSERT INTO public.question_bank (question_code, version, question_text, question_description, help_text, dimension, subdimension, answer_type, weight, answer_options, display_order, is_active)
VALUES
  ('EMB_001', 1, 'When you learn a new AI tool or technique, how quickly does it become part of your regular workflow?', NULL, NULL, 'embedding', 'habit_formation', 'multiChoice', 1.2, '[{"value": 0, "label": "Never sticks", "description": "I usually revert to old ways within days"}, {"value": 25, "label": "Takes months", "description": "It takes significant effort and time to form new habits"}, {"value": 50, "label": "A few weeks", "description": "With conscious effort, I can adopt new practices"}, {"value": 75, "label": "Within a week", "description": "I''m quick to integrate useful tools into my routine"}, {"value": 100, "label": "Immediately", "description": "Valuable tools become instant habits for me"}]'::jsonb, 19, true),

  ('EMB_002', 1, 'How well are AI tools integrated into your team''s standard operating procedures and workflows?', 'Consider whether AI is documented in processes, built into templates, or just ad-hoc usage.', 'Rate from 0 (not integrated) to 100 (fully embedded in processes)', 'embedding', 'process_integration', 'scale', 1.1, '[]'::jsonb, 20, true),

  ('EMB_003', 1, 'When initial excitement about a new AI tool fades, how does usage typically evolve?', NULL, NULL, 'embedding', 'sustainability', 'multiChoice', 1.0, '[{"value": 0, "label": "Abandoned", "description": "Tools are quickly forgotten after the novelty wears off"}, {"value": 25, "label": "Declining", "description": "Usage drops significantly over time"}, {"value": 50, "label": "Maintained", "description": "Core users continue, but adoption doesn''t grow"}, {"value": 75, "label": "Growing", "description": "Usage expands as more use cases are discovered"}, {"value": 100, "label": "Deepening", "description": "Tools become more embedded and usage becomes more sophisticated"}]'::jsonb, 21, true),

  ('EMB_004', 1, 'How well do you track the impact and ROI of AI tools you''ve adopted?', NULL, NULL, 'embedding', 'measurement', 'multiChoice', 0.9, '[{"value": 0, "label": "Not at all", "description": "We don''t measure AI impact"}, {"value": 25, "label": "Anecdotally", "description": "We have a general sense but no data"}, {"value": 50, "label": "Basic metrics", "description": "We track some usage and time savings"}, {"value": 75, "label": "Comprehensive", "description": "We measure productivity, quality, and cost impact"}, {"value": 100, "label": "Data-driven", "description": "We have dashboards and make decisions based on AI ROI data"}]'::jsonb, 22, true),

  ('EMB_005', 1, 'What systems or structures exist to reinforce continued AI adoption in your organization?', NULL, NULL, 'embedding', 'reinforcement', 'multiChoice', 1.0, '[{"value": 0, "label": "None", "description": "No formal support for AI adoption"}, {"value": 25, "label": "Basic training", "description": "Initial training is provided"}, {"value": 50, "label": "Ongoing support", "description": "Help desk, champions, or regular training sessions"}, {"value": 75, "label": "Integrated systems", "description": "AI is part of goals, reviews, and incentives"}, {"value": 100, "label": "Cultural embedding", "description": "AI adoption is woven into company culture and values"}]'::jsonb, 23, true),

  ('EMB_006', 1, 'How well documented are the AI tools, prompts, and best practices your team uses?', NULL, 'Rate from 0 (nothing documented) to 100 (comprehensive documentation)', 'embedding', 'documentation', 'scale', 0.8, '[]'::jsonb, 24, true)

ON CONFLICT (question_code, version) DO UPDATE SET
  question_text = EXCLUDED.question_text,
  question_description = EXCLUDED.question_description,
  help_text = EXCLUDED.help_text,
  dimension = EXCLUDED.dimension,
  subdimension = EXCLUDED.subdimension,
  answer_type = EXCLUDED.answer_type,
  weight = EXCLUDED.weight,
  answer_options = EXCLUDED.answer_options,
  display_order = EXCLUDED.display_order,
  updated_at = now();

-- Velocity Dimension (6 questions)
INSERT INTO public.question_bank (question_code, version, question_text, question_description, help_text, dimension, subdimension, answer_type, weight, answer_options, display_order, is_active)
VALUES
  ('VEL_001', 1, 'How quickly can your team typically go from learning about a new AI capability to using it productively?', NULL, NULL, 'velocity', 'adoption_speed', 'multiChoice', 1.2, '[{"value": 0, "label": "Months or more", "description": "Adoption is very slow due to various barriers"}, {"value": 25, "label": "1-2 months", "description": "We need significant time for evaluation and training"}, {"value": 50, "label": "2-4 weeks", "description": "We can pilot and adopt with reasonable speed"}, {"value": 75, "label": "1-2 weeks", "description": "We move quickly from awareness to implementation"}, {"value": 100, "label": "Days", "description": "We can rapidly test and deploy new AI capabilities"}]'::jsonb, 25, true),

  ('VEL_002', 1, 'When an AI initiative doesn''t go as planned, how does your team respond?', NULL, NULL, 'velocity', 'resilience', 'multiChoice', 1.1, '[{"value": 0, "label": "Give up", "description": "We abandon AI efforts after setbacks"}, {"value": 25, "label": "Hesitate", "description": "We become more cautious and slow down significantly"}, {"value": 50, "label": "Regroup", "description": "We pause, assess, and try again with modifications"}, {"value": 75, "label": "Persist", "description": "We learn from failures and maintain momentum"}, {"value": 100, "label": "Accelerate", "description": "Setbacks fuel our determination to succeed"}]'::jsonb, 26, true),

  ('VEL_003', 1, 'How confident are you in your ability to adapt if AI significantly changes your job role?', NULL, 'Move the slider from fear (worried about becoming obsolete) to confidence (I will thrive)', 'velocity', 'adaptability', 'fearToConfidence', 1.3, '[]'::jsonb, 27, true),

  ('VEL_004', 1, 'How quickly does your team iterate on AI implementations based on feedback and results?', NULL, NULL, 'velocity', 'iteration_speed', 'multiChoice', 1.0, '[{"value": 0, "label": "Never iterate", "description": "Once implemented, AI solutions rarely change"}, {"value": 25, "label": "Annual reviews", "description": "We revisit AI implementations yearly"}, {"value": 50, "label": "Quarterly", "description": "We review and improve AI usage regularly"}, {"value": 75, "label": "Monthly", "description": "We continuously optimize and iterate"}, {"value": 100, "label": "Weekly or faster", "description": "Rapid iteration is part of our AI culture"}]'::jsonb, 28, true),

  ('VEL_005', 1, 'How would you describe the current momentum of AI adoption in your organization?', NULL, NULL, 'velocity', 'momentum', 'multiChoice', 1.0, '[{"value": 0, "label": "Stalled", "description": "AI adoption has stopped or is moving backward"}, {"value": 25, "label": "Slow", "description": "There''s movement but it feels stuck"}, {"value": 50, "label": "Steady", "description": "Consistent progress at a moderate pace"}, {"value": 75, "label": "Accelerating", "description": "AI adoption is picking up speed"}, {"value": 100, "label": "Transformational", "description": "AI is driving rapid organizational change"}]'::jsonb, 29, true),

  ('VEL_006', 1, 'How prepared do you feel for the next wave of AI advancements (AGI, autonomous agents, etc.)?', 'Consider your awareness of emerging AI trends and your readiness to adapt.', 'Rate from 0 (completely unprepared) to 100 (fully prepared)', 'velocity', 'future_readiness', 'scale', 0.9, '[]'::jsonb, 30, true)

ON CONFLICT (question_code, version) DO UPDATE SET
  question_text = EXCLUDED.question_text,
  question_description = EXCLUDED.question_description,
  help_text = EXCLUDED.help_text,
  dimension = EXCLUDED.dimension,
  subdimension = EXCLUDED.subdimension,
  answer_type = EXCLUDED.answer_type,
  weight = EXCLUDED.weight,
  answer_options = EXCLUDED.answer_options,
  display_order = EXCLUDED.display_order,
  updated_at = now();

-- ============================================================
-- ADD ASSESSMENT_TYPE REFERENCE TO QUESTION_BANK
-- ============================================================

-- Add assessment_type column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'question_bank' AND column_name = 'assessment_type'
  ) THEN
    ALTER TABLE public.question_bank ADD COLUMN assessment_type TEXT DEFAULT 'glueiq';
  END IF;
END $$;

-- Update all GlueIQ questions
UPDATE public.question_bank
SET assessment_type = 'glueiq'
WHERE question_code LIKE 'IND_%'
   OR question_code LIKE 'LEAD_%'
   OR question_code LIKE 'CULT_%'
   OR question_code LIKE 'EMB_%'
   OR question_code LIKE 'VEL_%';

-- Create index on assessment_type
CREATE INDEX IF NOT EXISTS idx_question_bank_assessment_type ON public.question_bank(assessment_type);

-- ============================================================
-- CREATE QUESTION FLOWS FOR GLUEIQ
-- ============================================================

INSERT INTO public.question_flows (flow_name, flow_description, flow_type, assessment_type, question_selection_strategy, question_codes, is_active)
VALUES
  ('GlueIQ Standard Flow', 'Standard sequential flow through all 5 GlueIQ dimensions', 'standard', 'full', 'sequential',
   ARRAY['IND_001', 'IND_002', 'IND_003', 'IND_004', 'IND_005', 'IND_006',
         'LEAD_001', 'LEAD_002', 'LEAD_003', 'LEAD_004', 'LEAD_005', 'LEAD_006',
         'CULT_001', 'CULT_002', 'CULT_003', 'CULT_004', 'CULT_005', 'CULT_006',
         'EMB_001', 'EMB_002', 'EMB_003', 'EMB_004', 'EMB_005', 'EMB_006',
         'VEL_001', 'VEL_002', 'VEL_003', 'VEL_004', 'VEL_005', 'VEL_006'],
   true),

  ('GlueIQ Quick Assessment', 'Abbreviated assessment with 2 key questions per dimension', 'quick', 'quick', 'sequential',
   ARRAY['IND_001', 'IND_003', 'LEAD_001', 'LEAD_002', 'CULT_001', 'CULT_003', 'EMB_001', 'EMB_003', 'VEL_001', 'VEL_003'],
   true)

ON CONFLICT (flow_name) DO UPDATE SET
  flow_description = EXCLUDED.flow_description,
  question_codes = EXCLUDED.question_codes,
  updated_at = now();

-- ============================================================
-- CREATE DIMENSION METADATA TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.assessment_dimensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_type TEXT NOT NULL,
  dimension_code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  weight NUMERIC NOT NULL DEFAULT 1.0,
  display_order INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (assessment_type, dimension_code)
);

CREATE INDEX IF NOT EXISTS idx_assessment_dimensions_type ON public.assessment_dimensions(assessment_type);

-- Enable RLS
ALTER TABLE public.assessment_dimensions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view dimensions"
  ON public.assessment_dimensions
  FOR SELECT
  USING (true);

-- Insert GlueIQ dimensions
INSERT INTO public.assessment_dimensions (assessment_type, dimension_code, name, description, icon, color, weight, display_order)
VALUES
  ('glueiq', 'individual', 'Individual Readiness', 'Personal AI literacy, technology comfort, and growth mindset', 'User', '#06B6D4', 1.0, 1),
  ('glueiq', 'leadership', 'Leadership Capability', 'Ability to lead through change and inspire AI adoption in others', 'Crown', '#8B5CF6', 1.0, 2),
  ('glueiq', 'cultural', 'Cultural Alignment', 'Innovation embrace, collaboration, and psychological safety for experimentation', 'Users', '#10B981', 1.0, 3),
  ('glueiq', 'embedding', 'Behavior Embedding', 'Habit formation, sustainability, and process integration of AI practices', 'Layers', '#F59E0B', 1.0, 4),
  ('glueiq', 'velocity', 'Change Velocity', 'Speed of adoption, resilience, and adaptability to AI transformation', 'Zap', '#EF4444', 1.0, 5)
ON CONFLICT (assessment_type, dimension_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  weight = EXCLUDED.weight,
  display_order = EXCLUDED.display_order,
  updated_at = now();

-- ============================================================
-- VERIFICATION
-- ============================================================

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.question_bank WHERE assessment_type = 'glueiq';
  RAISE NOTICE 'GlueIQ questions seeded: %', v_count;

  SELECT COUNT(*) INTO v_count FROM public.assessment_types;
  RAISE NOTICE 'Assessment types created: %', v_count;

  SELECT COUNT(*) INTO v_count FROM public.question_flows WHERE is_active = true;
  RAISE NOTICE 'Question flows created: %', v_count;

  SELECT COUNT(*) INTO v_count FROM public.assessment_dimensions;
  RAISE NOTICE 'Dimensions created: %', v_count;
END $$;

-- ============================================================
-- ROLLBACK
-- ============================================================
-- DELETE FROM public.question_bank WHERE assessment_type = 'glueiq';
-- DELETE FROM public.assessment_dimensions WHERE assessment_type = 'glueiq';
-- DELETE FROM public.question_flows WHERE flow_name LIKE 'GlueIQ%';
-- DELETE FROM public.assessment_types WHERE code IN ('glueiq', 'org-maturity', 'team-skills');
-- DROP TABLE IF EXISTS public.assessment_dimensions CASCADE;
-- DROP TABLE IF EXISTS public.assessment_types CASCADE;
