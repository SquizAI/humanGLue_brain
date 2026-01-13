-- Migration: 020_ai_maturity_assessment_platform.sql
-- Description: Multi-tenant AI Maturity Assessment Platform schema
-- Purpose: Store organizational AI maturity scores, executive summaries, analysis results,
--          skills mapping, and recommendations from C-suite interview analysis
-- Dependencies: 001_multi_tenant_schema.sql, 015_organization_membership_system.sql
-- Created: 2025-12-29

-- ============================================================
-- OVERVIEW
-- ============================================================
-- This schema supports a multi-tenant AI maturity assessment platform that:
-- 1. Stores organizational maturity scores across 8 dimensions
-- 2. Captures executive summaries with key metrics and themes
-- 3. Records analysis results (entities, quotes, sentiment)
-- 4. Maps individual team member AI skills
-- 5. Generates and tracks recommendations
--
-- Multi-tenant isolation is achieved via organization_id foreign keys
-- and comprehensive Row Level Security policies

-- ============================================================
-- ENUMS
-- ============================================================

-- AI Skill Level enum
DO $$ BEGIN
  CREATE TYPE ai_skill_level AS ENUM (
    'none',
    'beginner',
    'intermediate',
    'advanced',
    'expert'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Maturity Dimension enum (8 dimensions)
DO $$ BEGIN
  CREATE TYPE maturity_dimension AS ENUM (
    'skills_talent',
    'ai_use_cases',
    'strategy_alignment',
    'process_optimization',
    'ai_governance',
    'leadership_vision',
    'culture_change',
    'integration_capability'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Gap Priority enum
DO $$ BEGIN
  CREATE TYPE gap_priority AS ENUM (
    'critical',
    'high',
    'medium',
    'low'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Effort Level enum
DO $$ BEGIN
  CREATE TYPE effort_level AS ENUM (
    'low',
    'medium',
    'high'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Risk Level enum
DO $$ BEGIN
  CREATE TYPE risk_level AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Recommendation Timeframe enum
DO $$ BEGIN
  CREATE TYPE recommendation_timeframe AS ENUM (
    'immediate',
    'short_term',
    'long_term'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Assessment Data Source enum
DO $$ BEGIN
  CREATE TYPE assessment_data_source AS ENUM (
    'c_suite_interview',
    'team_survey',
    'automated_analysis',
    'manual_assessment',
    'hybrid'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- PART 1: AI MATURITY ASSESSMENTS (Organization Level)
-- ============================================================

-- Main assessment table - stores overall organizational maturity assessment
CREATE TABLE IF NOT EXISTS public.ai_maturity_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Assessment identification
  assessment_name TEXT NOT NULL DEFAULT 'AI Maturity Assessment',
  version INTEGER NOT NULL DEFAULT 1,

  -- Overall scores
  overall_maturity DECIMAL(3,1) NOT NULL CHECK (overall_maturity >= 0 AND overall_maturity <= 10),
  confidence_level DECIMAL(3,2) NOT NULL CHECK (confidence_level >= 0 AND confidence_level <= 1),

  -- Category scores (aggregated from dimensions)
  technical_score DECIMAL(3,1) CHECK (technical_score >= 0 AND technical_score <= 10),
  human_score DECIMAL(3,1) CHECK (human_score >= 0 AND human_score <= 10),
  business_score DECIMAL(3,1) CHECK (business_score >= 0 AND business_score <= 10),
  ai_adoption_score DECIMAL(3,1) CHECK (ai_adoption_score >= 0 AND ai_adoption_score <= 10),

  -- Maturity profile (JSONB for flexibility)
  maturity_profile JSONB NOT NULL DEFAULT '{
    "strengths": [],
    "weaknesses": [],
    "opportunities": []
  }'::jsonb,

  -- Benchmark comparison
  industry_average DECIMAL(3,1),
  percentile INTEGER CHECK (percentile >= 0 AND percentile <= 100),
  benchmark_rank TEXT,
  top_performer_score DECIMAL(3,1),
  gap_to_top DECIMAL(3,1),

  -- Data source and methodology
  data_source assessment_data_source NOT NULL DEFAULT 'c_suite_interview',
  data_source_description TEXT,
  transcript_count INTEGER,
  total_interview_duration_minutes INTEGER,
  analysis_method TEXT,
  data_quality TEXT CHECK (data_quality IN ('low', 'medium', 'high', 'very_high')),

  -- Assessment dates
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.users(id),

  -- Constraints
  CONSTRAINT valid_maturity_range CHECK (overall_maturity >= 0 AND overall_maturity <= 10)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_maturity_org ON public.ai_maturity_assessments(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_maturity_date ON public.ai_maturity_assessments(assessment_date DESC);
CREATE INDEX IF NOT EXISTS idx_ai_maturity_score ON public.ai_maturity_assessments(overall_maturity);
CREATE INDEX IF NOT EXISTS idx_ai_maturity_source ON public.ai_maturity_assessments(data_source);

COMMENT ON TABLE public.ai_maturity_assessments IS 'Organizational AI maturity assessments from C-suite interview analysis';

-- ============================================================
-- PART 2: MATURITY DIMENSION SCORES
-- ============================================================

-- Individual dimension scores for each assessment
CREATE TABLE IF NOT EXISTS public.maturity_dimension_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.ai_maturity_assessments(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Dimension identification
  dimension maturity_dimension NOT NULL,

  -- Scores
  score DECIMAL(3,1) NOT NULL CHECK (score >= 0 AND score <= 10),
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  level_matches INTEGER DEFAULT 0,

  -- Evidence (array of supporting quotes/observations)
  evidence JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT unique_assessment_dimension UNIQUE (assessment_id, dimension)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dimension_scores_assessment ON public.maturity_dimension_scores(assessment_id);
CREATE INDEX IF NOT EXISTS idx_dimension_scores_org ON public.maturity_dimension_scores(organization_id);
CREATE INDEX IF NOT EXISTS idx_dimension_scores_dimension ON public.maturity_dimension_scores(dimension);
CREATE INDEX IF NOT EXISTS idx_dimension_scores_score ON public.maturity_dimension_scores(score);

COMMENT ON TABLE public.maturity_dimension_scores IS 'Individual dimension scores for each AI maturity assessment';

-- ============================================================
-- PART 3: GAP PRIORITIZATION
-- ============================================================

-- Track identified gaps and prioritization for remediation
CREATE TABLE IF NOT EXISTS public.maturity_gap_priorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.ai_maturity_assessments(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  dimension maturity_dimension NOT NULL,

  -- Gap analysis
  current_score DECIMAL(3,1) NOT NULL CHECK (current_score >= 0 AND current_score <= 10),
  target_score DECIMAL(3,1) NOT NULL CHECK (target_score >= 0 AND target_score <= 10),
  gap_size DECIMAL(3,1) GENERATED ALWAYS AS (target_score - current_score) STORED,

  -- Prioritization
  priority gap_priority NOT NULL,
  effort effort_level NOT NULL,

  -- Recommendation
  recommendation TEXT NOT NULL,

  -- Tracking
  status TEXT NOT NULL DEFAULT 'identified' CHECK (status IN ('identified', 'in_progress', 'completed', 'deferred')),
  due_date DATE,
  assigned_to UUID REFERENCES public.users(id),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_assessment_gap UNIQUE (assessment_id, dimension)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gap_priorities_assessment ON public.maturity_gap_priorities(assessment_id);
CREATE INDEX IF NOT EXISTS idx_gap_priorities_org ON public.maturity_gap_priorities(organization_id);
CREATE INDEX IF NOT EXISTS idx_gap_priorities_priority ON public.maturity_gap_priorities(priority);
CREATE INDEX IF NOT EXISTS idx_gap_priorities_status ON public.maturity_gap_priorities(status);

COMMENT ON TABLE public.maturity_gap_priorities IS 'Identified gaps and their prioritization for organizational AI transformation';

-- ============================================================
-- PART 4: EXECUTIVE SUMMARIES
-- ============================================================

-- Executive summaries with key insights from assessments
CREATE TABLE IF NOT EXISTS public.executive_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.ai_maturity_assessments(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Summary content
  executive_summary TEXT NOT NULL,

  -- Key metrics (structured data)
  key_metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Structure: [{ label, value, trend, benchmark }]

  -- Next steps by timeframe
  next_steps_30_days JSONB DEFAULT '[]'::jsonb,
  next_steps_60_days JSONB DEFAULT '[]'::jsonb,
  next_steps_90_days JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  generated_by TEXT, -- 'ai' or 'human'
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_assessment_summary UNIQUE (assessment_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_exec_summary_assessment ON public.executive_summaries(assessment_id);
CREATE INDEX IF NOT EXISTS idx_exec_summary_org ON public.executive_summaries(organization_id);

COMMENT ON TABLE public.executive_summaries IS 'Executive summaries generated from AI maturity assessments';

-- ============================================================
-- PART 5: CONSENSUS THEMES
-- ============================================================

-- Themes identified from interview analysis
CREATE TABLE IF NOT EXISTS public.consensus_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  executive_summary_id UUID NOT NULL REFERENCES public.executive_summaries(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Theme identification
  theme_name TEXT NOT NULL,
  description TEXT,

  -- Frequency and sentiment
  frequency INTEGER NOT NULL DEFAULT 1,
  sentiment DECIMAL(3,2) CHECK (sentiment >= -1 AND sentiment <= 1),

  -- Sources
  interviewees JSONB DEFAULT '[]'::jsonb, -- Array of names/roles
  quotes JSONB DEFAULT '[]'::jsonb, -- Array of supporting quotes

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_consensus_themes_summary ON public.consensus_themes(executive_summary_id);
CREATE INDEX IF NOT EXISTS idx_consensus_themes_org ON public.consensus_themes(organization_id);
CREATE INDEX IF NOT EXISTS idx_consensus_themes_frequency ON public.consensus_themes(frequency DESC);

COMMENT ON TABLE public.consensus_themes IS 'Consensus themes identified from C-suite interview analysis';

-- ============================================================
-- PART 6: REALITY GAPS
-- ============================================================

-- Track gaps between leadership perception and actual evidence
CREATE TABLE IF NOT EXISTS public.reality_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  executive_summary_id UUID NOT NULL REFERENCES public.executive_summaries(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Gap identification
  dimension TEXT NOT NULL, -- More flexible than enum for custom dimensions

  -- Perception vs Reality
  leadership_perception DECIMAL(3,1) CHECK (leadership_perception >= 0 AND leadership_perception <= 10),
  actual_evidence DECIMAL(3,1) CHECK (actual_evidence >= 0 AND actual_evidence <= 10),
  gap_size DECIMAL(3,1) GENERATED ALWAYS AS (leadership_perception - actual_evidence) STORED,

  -- Evidence
  supporting_evidence JSONB DEFAULT '[]'::jsonb,
  contradicting_evidence JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reality_gaps_summary ON public.reality_gaps(executive_summary_id);
CREATE INDEX IF NOT EXISTS idx_reality_gaps_org ON public.reality_gaps(organization_id);

COMMENT ON TABLE public.reality_gaps IS 'Gaps between leadership perception and actual evidence';

-- ============================================================
-- PART 7: RISK ANALYSIS
-- ============================================================

-- Identified risks from assessment
CREATE TABLE IF NOT EXISTS public.assessment_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  executive_summary_id UUID NOT NULL REFERENCES public.executive_summaries(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Risk details
  risk_level risk_level NOT NULL,
  risk_category TEXT NOT NULL CHECK (risk_category IN (
    'reputation', 'competitive', 'governance', 'talent',
    'adoption', 'client', 'tool', 'cost', 'security', 'other'
  )),
  description TEXT NOT NULL,

  -- Mitigation
  mitigation_strategy TEXT,
  owner UUID REFERENCES public.users(id),
  status TEXT DEFAULT 'identified' CHECK (status IN ('identified', 'mitigating', 'mitigated', 'accepted')),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assessment_risks_summary ON public.assessment_risks(executive_summary_id);
CREATE INDEX IF NOT EXISTS idx_assessment_risks_org ON public.assessment_risks(organization_id);
CREATE INDEX IF NOT EXISTS idx_assessment_risks_level ON public.assessment_risks(risk_level);

COMMENT ON TABLE public.assessment_risks IS 'Risks identified during AI maturity assessment';

-- ============================================================
-- PART 8: ANALYSIS RESULTS - ENTITIES/TOOLS EXTRACTED
-- ============================================================

-- AI tools and entities mentioned in interviews
CREATE TABLE IF NOT EXISTS public.analysis_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.ai_maturity_assessments(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Entity identification
  entity_type TEXT NOT NULL CHECK (entity_type IN ('tool', 'platform', 'person', 'company', 'concept', 'process')),
  entity_value TEXT NOT NULL,
  context TEXT,

  -- Frequency and sentiment
  frequency INTEGER NOT NULL DEFAULT 1,
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral', 'mixed')),

  -- Source quotes
  source_quotes JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  first_mentioned_by TEXT,
  categories JSONB DEFAULT '[]'::jsonb, -- e.g., ['AI/Technology', 'Productivity']

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_entity_per_assessment UNIQUE (assessment_id, entity_type, entity_value)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analysis_entities_assessment ON public.analysis_entities(assessment_id);
CREATE INDEX IF NOT EXISTS idx_analysis_entities_org ON public.analysis_entities(organization_id);
CREATE INDEX IF NOT EXISTS idx_analysis_entities_type ON public.analysis_entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_analysis_entities_value ON public.analysis_entities(entity_value);
CREATE INDEX IF NOT EXISTS idx_analysis_entities_frequency ON public.analysis_entities(frequency DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_entities_text_search ON public.analysis_entities USING gin(to_tsvector('english', entity_value || ' ' || COALESCE(context, '')));

COMMENT ON TABLE public.analysis_entities IS 'Entities (tools, people, concepts) extracted from interview analysis';

-- ============================================================
-- PART 9: ANALYSIS THEMES
-- ============================================================

-- Themes identified from transcript analysis
CREATE TABLE IF NOT EXISTS public.analysis_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.ai_maturity_assessments(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Theme identification
  theme_id TEXT NOT NULL, -- e.g., 'creative_team_leads', 'process_automation_need'
  theme_name TEXT NOT NULL,
  description TEXT,

  -- Keywords and frequency
  keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
  frequency INTEGER NOT NULL DEFAULT 1,
  sentiment INTEGER CHECK (sentiment >= -1 AND sentiment <= 1), -- -1 to 1

  -- Sources
  source_interviews JSONB DEFAULT '[]'::jsonb, -- Array of interviewee names
  representative_quotes JSONB DEFAULT '[]'::jsonb,

  -- Dimension mapping
  related_dimensions JSONB DEFAULT '[]'::jsonb, -- Array of maturity_dimension values

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_theme_per_assessment UNIQUE (assessment_id, theme_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analysis_themes_assessment ON public.analysis_themes(assessment_id);
CREATE INDEX IF NOT EXISTS idx_analysis_themes_org ON public.analysis_themes(organization_id);
CREATE INDEX IF NOT EXISTS idx_analysis_themes_frequency ON public.analysis_themes(frequency DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_themes_keywords ON public.analysis_themes USING gin(keywords);

COMMENT ON TABLE public.analysis_themes IS 'Themes identified from interview transcript analysis';

-- ============================================================
-- PART 10: SKILLS PROFILES (Team Members)
-- ============================================================

-- Individual team member AI skill profiles
CREATE TABLE IF NOT EXISTS public.skills_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.ai_maturity_assessments(id) ON DELETE SET NULL,

  -- Person identification (may or may not link to actual user)
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  person_name TEXT NOT NULL,
  title TEXT,
  department TEXT,

  -- AI Skill assessment
  ai_skill_level ai_skill_level NOT NULL DEFAULT 'beginner',
  ai_skill_score INTEGER CHECK (ai_skill_score >= 0 AND ai_skill_score <= 100),

  -- Tools and usage
  tools_used JSONB DEFAULT '[]'::jsonb, -- Array of tool names
  usage_frequency TEXT CHECK (usage_frequency IN ('never', 'occasionally', 'weekly', 'daily', 'multiple_daily')),

  -- Evidence and sources
  mentioned_by JSONB DEFAULT '[]'::jsonb, -- Who mentioned this person
  evidence JSONB DEFAULT '[]'::jsonb, -- Supporting quotes/observations

  -- Champion status
  is_champion BOOLEAN NOT NULL DEFAULT false,
  champion_reason TEXT,

  -- Growth potential
  growth_potential TEXT CHECK (growth_potential IN ('low', 'medium', 'high')),
  recommended_training JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_person_per_org_assessment UNIQUE (organization_id, assessment_id, person_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_skills_profiles_org ON public.skills_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_skills_profiles_assessment ON public.skills_profiles(assessment_id);
CREATE INDEX IF NOT EXISTS idx_skills_profiles_user ON public.skills_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_skills_profiles_skill_level ON public.skills_profiles(ai_skill_level);
CREATE INDEX IF NOT EXISTS idx_skills_profiles_champion ON public.skills_profiles(is_champion) WHERE is_champion = true;
CREATE INDEX IF NOT EXISTS idx_skills_profiles_tools ON public.skills_profiles USING gin(tools_used);

COMMENT ON TABLE public.skills_profiles IS 'Individual team member AI skills profiles from assessment';

-- ============================================================
-- PART 11: SKILL DISTRIBUTION & DEPARTMENT BREAKDOWN
-- ============================================================

-- Aggregated skill distribution per assessment
CREATE TABLE IF NOT EXISTS public.skill_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.ai_maturity_assessments(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Distribution counts
  expert_count INTEGER NOT NULL DEFAULT 0,
  advanced_count INTEGER NOT NULL DEFAULT 0,
  intermediate_count INTEGER NOT NULL DEFAULT 0,
  beginner_count INTEGER NOT NULL DEFAULT 0,
  none_count INTEGER NOT NULL DEFAULT 0,

  -- Total calculated
  total_assessed INTEGER GENERATED ALWAYS AS (
    expert_count + advanced_count + intermediate_count + beginner_count + none_count
  ) STORED,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_distribution_per_assessment UNIQUE (assessment_id)
);

-- Department breakdown
CREATE TABLE IF NOT EXISTS public.department_skill_breakdown (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.ai_maturity_assessments(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Department identification
  department_name TEXT NOT NULL,

  -- Metrics
  fluency_rate DECIMAL(4,3) CHECK (fluency_rate >= 0 AND fluency_rate <= 1),
  top_users JSONB DEFAULT '[]'::jsonb, -- Array of user names
  adoption_status TEXT CHECK (adoption_status IN ('Leading', 'Emerging', 'Lagging', 'Not Started')),

  -- Team size
  team_size INTEGER,
  ai_capable_count INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_dept_per_assessment UNIQUE (assessment_id, department_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dept_breakdown_assessment ON public.department_skill_breakdown(assessment_id);
CREATE INDEX IF NOT EXISTS idx_dept_breakdown_org ON public.department_skill_breakdown(organization_id);
CREATE INDEX IF NOT EXISTS idx_dept_breakdown_status ON public.department_skill_breakdown(adoption_status);

COMMENT ON TABLE public.skill_distributions IS 'Aggregated AI skill distribution across organization';
COMMENT ON TABLE public.department_skill_breakdown IS 'AI adoption breakdown by department';

-- ============================================================
-- PART 12: TRAINING COHORTS
-- ============================================================

-- Recommended training cohorts from assessment
CREATE TABLE IF NOT EXISTS public.training_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.ai_maturity_assessments(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Cohort details
  cohort_name TEXT NOT NULL,
  description TEXT,

  -- Members
  members JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of member names/ids

  -- Focus areas
  focus_areas JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of training topics

  -- Duration and objective
  duration TEXT,
  objective TEXT,

  -- Status tracking
  status TEXT DEFAULT 'recommended' CHECK (status IN ('recommended', 'planned', 'in_progress', 'completed')),
  start_date DATE,
  end_date DATE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_training_cohorts_assessment ON public.training_cohorts(assessment_id);
CREATE INDEX IF NOT EXISTS idx_training_cohorts_org ON public.training_cohorts(organization_id);
CREATE INDEX IF NOT EXISTS idx_training_cohorts_status ON public.training_cohorts(status);

COMMENT ON TABLE public.training_cohorts IS 'Recommended training cohorts from AI maturity assessment';

-- ============================================================
-- PART 13: AI RECOMMENDATIONS
-- ============================================================

-- Comprehensive recommendations from assessment
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.ai_maturity_assessments(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Recommendation details
  timeframe recommendation_timeframe NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,

  -- Content
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  rationale TEXT,

  -- Related dimension
  related_dimension maturity_dimension,

  -- Impact and effort
  expected_impact TEXT CHECK (expected_impact IN ('low', 'medium', 'high', 'transformational')),
  effort_required effort_level,
  estimated_cost_range TEXT,

  -- Tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'deferred', 'rejected')),
  owner UUID REFERENCES public.users(id),
  due_date DATE,
  completed_date DATE,
  completion_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_recommendations_assessment ON public.ai_recommendations(assessment_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_org ON public.ai_recommendations(organization_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_timeframe ON public.ai_recommendations(timeframe);
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON public.ai_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_recommendations_dimension ON public.ai_recommendations(related_dimension);

COMMENT ON TABLE public.ai_recommendations IS 'AI transformation recommendations from maturity assessment';

-- ============================================================
-- PART 14: AI CHAMPIONS
-- ============================================================

-- Identified AI champions who can drive transformation
CREATE TABLE IF NOT EXISTS public.ai_champions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.ai_maturity_assessments(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Champion identification
  skills_profile_id UUID REFERENCES public.skills_profiles(id) ON DELETE SET NULL,
  person_name TEXT NOT NULL,
  title TEXT,

  -- Why they're a champion
  ai_skill_level ai_skill_level NOT NULL,
  champion_reason TEXT NOT NULL,

  -- Their influence
  influence_areas JSONB DEFAULT '[]'::jsonb,
  mentee_capacity INTEGER,

  -- Activation status
  is_activated BOOLEAN DEFAULT false,
  activated_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_champions_assessment ON public.ai_champions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_ai_champions_org ON public.ai_champions(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_champions_activated ON public.ai_champions(is_activated);

COMMENT ON TABLE public.ai_champions IS 'Identified AI champions to drive organizational transformation';

-- ============================================================
-- PART 15: ORGANIZATION EXTENDED METADATA
-- ============================================================

-- Extended organization metadata for AI maturity context
CREATE TABLE IF NOT EXISTS public.organization_ai_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Industry and classification
  sub_industry TEXT,
  company_size_exact INTEGER,
  company_size_range TEXT,
  region TEXT,
  headquarters TEXT,
  founded_year INTEGER,

  -- Business structure
  business_lines JSONB DEFAULT '[]'::jsonb, -- Array of { name, lead, description }

  -- Current AI state
  enterprise_ai_tools JSONB DEFAULT '[]'::jsonb, -- Licensed enterprise tools
  estimated_ai_budget DECIMAL(12,2),
  has_ai_team BOOLEAN DEFAULT false,
  ai_team_size INTEGER,

  -- Assessment history summary
  total_assessments INTEGER DEFAULT 0,
  latest_assessment_id UUID REFERENCES public.ai_maturity_assessments(id) ON DELETE SET NULL,
  latest_overall_score DECIMAL(3,1),
  score_trend TEXT CHECK (score_trend IN ('improving', 'stable', 'declining')),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_org_ai_metadata UNIQUE (organization_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_org_ai_metadata_org ON public.organization_ai_metadata(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_ai_metadata_industry ON public.organization_ai_metadata(sub_industry);

COMMENT ON TABLE public.organization_ai_metadata IS 'Extended organization metadata for AI maturity context';

-- ============================================================
-- PART 16: TRIGGERS
-- ============================================================

-- Update timestamps triggers
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'ai_maturity_assessments',
    'maturity_dimension_scores',
    'maturity_gap_priorities',
    'executive_summaries',
    'consensus_themes',
    'reality_gaps',
    'assessment_risks',
    'analysis_entities',
    'analysis_themes',
    'skills_profiles',
    'skill_distributions',
    'department_skill_breakdown',
    'training_cohorts',
    'ai_recommendations',
    'ai_champions',
    'organization_ai_metadata'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trigger_%I_updated_at ON public.%I',
      tbl, tbl
    );
    EXECUTE format(
      'CREATE TRIGGER trigger_%I_updated_at
       BEFORE UPDATE ON public.%I
       FOR EACH ROW
       EXECUTE FUNCTION public.trigger_set_updated_at()',
      tbl, tbl
    );
  END LOOP;
END $$;

-- Auto-update organization metadata when assessment is created
CREATE OR REPLACE FUNCTION public.update_org_ai_metadata_on_assessment()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.organization_ai_metadata (
    organization_id,
    latest_assessment_id,
    latest_overall_score,
    total_assessments
  )
  VALUES (
    NEW.organization_id,
    NEW.id,
    NEW.overall_maturity,
    1
  )
  ON CONFLICT (organization_id) DO UPDATE SET
    latest_assessment_id = NEW.id,
    latest_overall_score = NEW.overall_maturity,
    total_assessments = public.organization_ai_metadata.total_assessments + 1,
    score_trend = CASE
      WHEN public.organization_ai_metadata.latest_overall_score IS NULL THEN 'stable'
      WHEN NEW.overall_maturity > public.organization_ai_metadata.latest_overall_score THEN 'improving'
      WHEN NEW.overall_maturity < public.organization_ai_metadata.latest_overall_score THEN 'declining'
      ELSE 'stable'
    END,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_org_metadata ON public.ai_maturity_assessments;
CREATE TRIGGER trigger_update_org_metadata
  AFTER INSERT ON public.ai_maturity_assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_org_ai_metadata_on_assessment();

-- ============================================================
-- PART 17: ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.ai_maturity_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maturity_dimension_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maturity_gap_priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consensus_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reality_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_skill_breakdown ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_champions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_ai_metadata ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS HELPER FUNCTION
-- ============================================================

-- Check if user belongs to organization
CREATE OR REPLACE FUNCTION public.user_belongs_to_org(p_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = auth.uid()
      AND organization_id = p_org_id
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is org admin
CREATE OR REPLACE FUNCTION public.user_is_org_admin(p_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = auth.uid()
      AND organization_id = p_org_id
      AND role IN ('owner', 'org_admin')
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is platform admin
CREATE OR REPLACE FUNCTION public.user_is_platform_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin_full')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- RLS POLICIES FOR AI_MATURITY_ASSESSMENTS
-- ============================================================

-- SELECT: Org members can view their org's assessments
CREATE POLICY "ai_maturity_select_org_member"
  ON public.ai_maturity_assessments
  FOR SELECT
  USING (
    public.user_belongs_to_org(organization_id)
    OR public.user_is_platform_admin()
  );

-- INSERT: Org admins can create assessments
CREATE POLICY "ai_maturity_insert_org_admin"
  ON public.ai_maturity_assessments
  FOR INSERT
  WITH CHECK (
    public.user_is_org_admin(organization_id)
    OR public.user_is_platform_admin()
  );

-- UPDATE: Org admins can update assessments
CREATE POLICY "ai_maturity_update_org_admin"
  ON public.ai_maturity_assessments
  FOR UPDATE
  USING (
    public.user_is_org_admin(organization_id)
    OR public.user_is_platform_admin()
  );

-- DELETE: Only platform admins can delete
CREATE POLICY "ai_maturity_delete_platform_admin"
  ON public.ai_maturity_assessments
  FOR DELETE
  USING (public.user_is_platform_admin());

-- ============================================================
-- RLS POLICIES FOR DIMENSION SCORES
-- ============================================================

CREATE POLICY "dimension_scores_select"
  ON public.maturity_dimension_scores
  FOR SELECT
  USING (
    public.user_belongs_to_org(organization_id)
    OR public.user_is_platform_admin()
  );

CREATE POLICY "dimension_scores_insert"
  ON public.maturity_dimension_scores
  FOR INSERT
  WITH CHECK (
    public.user_is_org_admin(organization_id)
    OR public.user_is_platform_admin()
  );

CREATE POLICY "dimension_scores_update"
  ON public.maturity_dimension_scores
  FOR UPDATE
  USING (
    public.user_is_org_admin(organization_id)
    OR public.user_is_platform_admin()
  );

CREATE POLICY "dimension_scores_delete"
  ON public.maturity_dimension_scores
  FOR DELETE
  USING (public.user_is_platform_admin());

-- ============================================================
-- RLS POLICIES FOR GAP PRIORITIES
-- ============================================================

CREATE POLICY "gap_priorities_select"
  ON public.maturity_gap_priorities
  FOR SELECT
  USING (
    public.user_belongs_to_org(organization_id)
    OR public.user_is_platform_admin()
  );

CREATE POLICY "gap_priorities_insert"
  ON public.maturity_gap_priorities
  FOR INSERT
  WITH CHECK (
    public.user_is_org_admin(organization_id)
    OR public.user_is_platform_admin()
  );

CREATE POLICY "gap_priorities_update"
  ON public.maturity_gap_priorities
  FOR UPDATE
  USING (
    public.user_is_org_admin(organization_id)
    OR public.user_is_platform_admin()
  );

CREATE POLICY "gap_priorities_delete"
  ON public.maturity_gap_priorities
  FOR DELETE
  USING (public.user_is_platform_admin());

-- ============================================================
-- RLS POLICIES FOR EXECUTIVE SUMMARIES
-- ============================================================

CREATE POLICY "exec_summaries_select"
  ON public.executive_summaries
  FOR SELECT
  USING (
    public.user_belongs_to_org(organization_id)
    OR public.user_is_platform_admin()
  );

CREATE POLICY "exec_summaries_insert"
  ON public.executive_summaries
  FOR INSERT
  WITH CHECK (
    public.user_is_org_admin(organization_id)
    OR public.user_is_platform_admin()
  );

CREATE POLICY "exec_summaries_update"
  ON public.executive_summaries
  FOR UPDATE
  USING (
    public.user_is_org_admin(organization_id)
    OR public.user_is_platform_admin()
  );

CREATE POLICY "exec_summaries_delete"
  ON public.executive_summaries
  FOR DELETE
  USING (public.user_is_platform_admin());

-- ============================================================
-- RLS POLICIES FOR CONSENSUS THEMES
-- ============================================================

CREATE POLICY "consensus_themes_select"
  ON public.consensus_themes
  FOR SELECT
  USING (
    public.user_belongs_to_org(organization_id)
    OR public.user_is_platform_admin()
  );

CREATE POLICY "consensus_themes_modify"
  ON public.consensus_themes
  FOR ALL
  USING (
    public.user_is_org_admin(organization_id)
    OR public.user_is_platform_admin()
  );

-- ============================================================
-- RLS POLICIES FOR REALITY GAPS
-- ============================================================

CREATE POLICY "reality_gaps_select"
  ON public.reality_gaps
  FOR SELECT
  USING (
    public.user_belongs_to_org(organization_id)
    OR public.user_is_platform_admin()
  );

CREATE POLICY "reality_gaps_modify"
  ON public.reality_gaps
  FOR ALL
  USING (
    public.user_is_org_admin(organization_id)
    OR public.user_is_platform_admin()
  );

-- ============================================================
-- RLS POLICIES FOR ASSESSMENT RISKS
-- ============================================================

CREATE POLICY "assessment_risks_select"
  ON public.assessment_risks
  FOR SELECT
  USING (
    public.user_belongs_to_org(organization_id)
    OR public.user_is_platform_admin()
  );

CREATE POLICY "assessment_risks_modify"
  ON public.assessment_risks
  FOR ALL
  USING (
    public.user_is_org_admin(organization_id)
    OR public.user_is_platform_admin()
  );

-- ============================================================
-- RLS POLICIES FOR ANALYSIS ENTITIES
-- ============================================================

CREATE POLICY "analysis_entities_select"
  ON public.analysis_entities
  FOR SELECT
  USING (
    public.user_belongs_to_org(organization_id)
    OR public.user_is_platform_admin()
  );

CREATE POLICY "analysis_entities_modify"
  ON public.analysis_entities
  FOR ALL
  USING (
    public.user_is_org_admin(organization_id)
    OR public.user_is_platform_admin()
  );

-- ============================================================
-- RLS POLICIES FOR ANALYSIS THEMES
-- ============================================================

CREATE POLICY "analysis_themes_select"
  ON public.analysis_themes
  FOR SELECT
  USING (
    public.user_belongs_to_org(organization_id)
    OR public.user_is_platform_admin()
  );

CREATE POLICY "analysis_themes_modify"
  ON public.analysis_themes
  FOR ALL
  USING (
    public.user_is_org_admin(organization_id)
    OR public.user_is_platform_admin()
  );

-- ============================================================
-- RLS POLICIES FOR SKILLS PROFILES
-- ============================================================

CREATE POLICY "skills_profiles_select"
  ON public.skills_profiles
  FOR SELECT
  USING (
    public.user_belongs_to_org(organization_id)
    OR public.user_is_platform_admin()
  );

CREATE POLICY "skills_profiles_modify"
  ON public.skills_profiles
  FOR ALL
  USING (
    public.user_is_org_admin(organization_id)
    OR public.user_is_platform_admin()
  );

-- ============================================================
-- RLS POLICIES FOR SKILL DISTRIBUTIONS
-- ============================================================

CREATE POLICY "skill_distributions_select"
  ON public.skill_distributions
  FOR SELECT
  USING (
    public.user_belongs_to_org(organization_id)
    OR public.user_is_platform_admin()
  );

CREATE POLICY "skill_distributions_modify"
  ON public.skill_distributions
  FOR ALL
  USING (
    public.user_is_org_admin(organization_id)
    OR public.user_is_platform_admin()
  );

-- ============================================================
-- RLS POLICIES FOR DEPARTMENT BREAKDOWN
-- ============================================================

CREATE POLICY "dept_breakdown_select"
  ON public.department_skill_breakdown
  FOR SELECT
  USING (
    public.user_belongs_to_org(organization_id)
    OR public.user_is_platform_admin()
  );

CREATE POLICY "dept_breakdown_modify"
  ON public.department_skill_breakdown
  FOR ALL
  USING (
    public.user_is_org_admin(organization_id)
    OR public.user_is_platform_admin()
  );

-- ============================================================
-- RLS POLICIES FOR TRAINING COHORTS
-- ============================================================

CREATE POLICY "training_cohorts_select"
  ON public.training_cohorts
  FOR SELECT
  USING (
    public.user_belongs_to_org(organization_id)
    OR public.user_is_platform_admin()
  );

CREATE POLICY "training_cohorts_modify"
  ON public.training_cohorts
  FOR ALL
  USING (
    public.user_is_org_admin(organization_id)
    OR public.user_is_platform_admin()
  );

-- ============================================================
-- RLS POLICIES FOR AI RECOMMENDATIONS
-- ============================================================

CREATE POLICY "ai_recommendations_select"
  ON public.ai_recommendations
  FOR SELECT
  USING (
    public.user_belongs_to_org(organization_id)
    OR public.user_is_platform_admin()
  );

CREATE POLICY "ai_recommendations_modify"
  ON public.ai_recommendations
  FOR ALL
  USING (
    public.user_is_org_admin(organization_id)
    OR public.user_is_platform_admin()
  );

-- ============================================================
-- RLS POLICIES FOR AI CHAMPIONS
-- ============================================================

CREATE POLICY "ai_champions_select"
  ON public.ai_champions
  FOR SELECT
  USING (
    public.user_belongs_to_org(organization_id)
    OR public.user_is_platform_admin()
  );

CREATE POLICY "ai_champions_modify"
  ON public.ai_champions
  FOR ALL
  USING (
    public.user_is_org_admin(organization_id)
    OR public.user_is_platform_admin()
  );

-- ============================================================
-- RLS POLICIES FOR ORG AI METADATA
-- ============================================================

CREATE POLICY "org_ai_metadata_select"
  ON public.organization_ai_metadata
  FOR SELECT
  USING (
    public.user_belongs_to_org(organization_id)
    OR public.user_is_platform_admin()
  );

CREATE POLICY "org_ai_metadata_modify"
  ON public.organization_ai_metadata
  FOR ALL
  USING (
    public.user_is_org_admin(organization_id)
    OR public.user_is_platform_admin()
  );

-- ============================================================
-- PART 18: VIEWS
-- ============================================================

-- Comprehensive assessment summary view
CREATE OR REPLACE VIEW public.assessment_summary_view AS
SELECT
  a.id AS assessment_id,
  a.organization_id,
  o.name AS organization_name,
  o.slug AS organization_slug,
  a.overall_maturity,
  a.confidence_level,
  a.technical_score,
  a.human_score,
  a.business_score,
  a.ai_adoption_score,
  a.percentile,
  a.benchmark_rank,
  a.data_source,
  a.transcript_count,
  a.assessment_date,
  a.created_at,
  es.executive_summary,
  (SELECT COUNT(*) FROM public.skills_profiles sp WHERE sp.assessment_id = a.id AND sp.is_champion = true) AS champion_count,
  (SELECT COUNT(*) FROM public.ai_recommendations ar WHERE ar.assessment_id = a.id) AS recommendation_count
FROM public.ai_maturity_assessments a
JOIN public.organizations o ON a.organization_id = o.id
LEFT JOIN public.executive_summaries es ON a.id = es.assessment_id;

-- Dimension scores pivot view
CREATE OR REPLACE VIEW public.dimension_scores_pivot_view AS
SELECT
  assessment_id,
  organization_id,
  MAX(CASE WHEN dimension = 'skills_talent' THEN score END) AS skills_talent,
  MAX(CASE WHEN dimension = 'ai_use_cases' THEN score END) AS ai_use_cases,
  MAX(CASE WHEN dimension = 'strategy_alignment' THEN score END) AS strategy_alignment,
  MAX(CASE WHEN dimension = 'process_optimization' THEN score END) AS process_optimization,
  MAX(CASE WHEN dimension = 'ai_governance' THEN score END) AS ai_governance,
  MAX(CASE WHEN dimension = 'leadership_vision' THEN score END) AS leadership_vision,
  MAX(CASE WHEN dimension = 'culture_change' THEN score END) AS culture_change,
  MAX(CASE WHEN dimension = 'integration_capability' THEN score END) AS integration_capability
FROM public.maturity_dimension_scores
GROUP BY assessment_id, organization_id;

-- Champions leaderboard view
CREATE OR REPLACE VIEW public.champions_leaderboard_view AS
SELECT
  sp.organization_id,
  sp.person_name,
  sp.title,
  sp.department,
  sp.ai_skill_level,
  sp.ai_skill_score,
  sp.tools_used,
  sp.is_champion,
  sp.growth_potential,
  o.name AS organization_name
FROM public.skills_profiles sp
JOIN public.organizations o ON sp.organization_id = o.id
WHERE sp.is_champion = true
ORDER BY sp.ai_skill_score DESC NULLS LAST;

-- ============================================================
-- PART 19: HELPER FUNCTIONS
-- ============================================================

-- Get organization's latest assessment
CREATE OR REPLACE FUNCTION public.get_org_latest_assessment(p_org_id UUID)
RETURNS TABLE(
  assessment_id UUID,
  overall_maturity DECIMAL,
  assessment_date DATE,
  data_source assessment_data_source,
  dimension_scores JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id AS assessment_id,
    a.overall_maturity,
    a.assessment_date,
    a.data_source,
    COALESCE(
      jsonb_object_agg(ds.dimension::text, ds.score),
      '{}'::jsonb
    ) AS dimension_scores
  FROM public.ai_maturity_assessments a
  LEFT JOIN public.maturity_dimension_scores ds ON a.id = ds.assessment_id
  WHERE a.organization_id = p_org_id
  GROUP BY a.id
  ORDER BY a.assessment_date DESC, a.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get organization's maturity trend over time
CREATE OR REPLACE FUNCTION public.get_org_maturity_trend(
  p_org_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
  assessment_id UUID,
  overall_maturity DECIMAL,
  assessment_date DATE,
  percentile INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id AS assessment_id,
    a.overall_maturity,
    a.assessment_date,
    a.percentile
  FROM public.ai_maturity_assessments a
  WHERE a.organization_id = p_org_id
  ORDER BY a.assessment_date DESC, a.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get organization's AI tool usage
CREATE OR REPLACE FUNCTION public.get_org_tool_usage(p_org_id UUID)
RETURNS TABLE(
  tool_name TEXT,
  frequency INTEGER,
  user_count BIGINT,
  sentiment TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ae.entity_value AS tool_name,
    ae.frequency,
    COUNT(DISTINCT sp.id) AS user_count,
    ae.sentiment
  FROM public.analysis_entities ae
  LEFT JOIN public.skills_profiles sp ON sp.organization_id = ae.organization_id
    AND sp.tools_used @> jsonb_build_array(ae.entity_value)
  WHERE ae.organization_id = p_org_id
    AND ae.entity_type = 'tool'
  GROUP BY ae.entity_value, ae.frequency, ae.sentiment
  ORDER BY ae.frequency DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get organization's skill distribution
CREATE OR REPLACE FUNCTION public.get_org_skill_distribution(p_org_id UUID)
RETURNS TABLE(
  skill_level ai_skill_level,
  count BIGINT,
  percentage DECIMAL
) AS $$
DECLARE
  total_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO total_count
  FROM public.skills_profiles
  WHERE organization_id = p_org_id;

  RETURN QUERY
  SELECT
    sp.ai_skill_level,
    COUNT(*) AS count,
    CASE
      WHEN total_count > 0 THEN ROUND((COUNT(*)::DECIMAL / total_count) * 100, 1)
      ELSE 0
    END AS percentage
  FROM public.skills_profiles sp
  WHERE sp.organization_id = p_org_id
  GROUP BY sp.ai_skill_level
  ORDER BY
    CASE sp.ai_skill_level
      WHEN 'expert' THEN 1
      WHEN 'advanced' THEN 2
      WHEN 'intermediate' THEN 3
      WHEN 'beginner' THEN 4
      WHEN 'none' THEN 5
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- VERIFICATION
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================================';
  RAISE NOTICE 'AI MATURITY ASSESSMENT PLATFORM MIGRATION COMPLETE';
  RAISE NOTICE '========================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  - ai_maturity_assessments (main assessment records)';
  RAISE NOTICE '  - maturity_dimension_scores (8 dimensions)';
  RAISE NOTICE '  - maturity_gap_priorities (gap analysis)';
  RAISE NOTICE '  - executive_summaries (key insights)';
  RAISE NOTICE '  - consensus_themes (interview themes)';
  RAISE NOTICE '  - reality_gaps (perception vs reality)';
  RAISE NOTICE '  - assessment_risks (risk analysis)';
  RAISE NOTICE '  - analysis_entities (tools/entities extracted)';
  RAISE NOTICE '  - analysis_themes (transcript themes)';
  RAISE NOTICE '  - skills_profiles (team member skills)';
  RAISE NOTICE '  - skill_distributions (aggregated stats)';
  RAISE NOTICE '  - department_skill_breakdown (by dept)';
  RAISE NOTICE '  - training_cohorts (recommended training)';
  RAISE NOTICE '  - ai_recommendations (action items)';
  RAISE NOTICE '  - ai_champions (transformation leaders)';
  RAISE NOTICE '  - organization_ai_metadata (extended org info)';
  RAISE NOTICE '';
  RAISE NOTICE 'Security:';
  RAISE NOTICE '  - RLS enabled on all tables';
  RAISE NOTICE '  - Organization-level isolation';
  RAISE NOTICE '  - Role-based access (member/admin/platform)';
  RAISE NOTICE '';
  RAISE NOTICE 'Views:';
  RAISE NOTICE '  - assessment_summary_view';
  RAISE NOTICE '  - dimension_scores_pivot_view';
  RAISE NOTICE '  - champions_leaderboard_view';
  RAISE NOTICE '';
  RAISE NOTICE 'Functions:';
  RAISE NOTICE '  - get_org_latest_assessment()';
  RAISE NOTICE '  - get_org_maturity_trend()';
  RAISE NOTICE '  - get_org_tool_usage()';
  RAISE NOTICE '  - get_org_skill_distribution()';
  RAISE NOTICE '';
  RAISE NOTICE '========================================================';
END $$;

-- ============================================================
-- ROLLBACK SCRIPT (uncomment to rollback)
-- ============================================================

/*
-- Drop views
DROP VIEW IF EXISTS public.champions_leaderboard_view;
DROP VIEW IF EXISTS public.dimension_scores_pivot_view;
DROP VIEW IF EXISTS public.assessment_summary_view;

-- Drop functions
DROP FUNCTION IF EXISTS public.get_org_skill_distribution(UUID);
DROP FUNCTION IF EXISTS public.get_org_tool_usage(UUID);
DROP FUNCTION IF EXISTS public.get_org_maturity_trend(UUID, INTEGER);
DROP FUNCTION IF EXISTS public.get_org_latest_assessment(UUID);
DROP FUNCTION IF EXISTS public.user_is_platform_admin();
DROP FUNCTION IF EXISTS public.user_is_org_admin(UUID);
DROP FUNCTION IF EXISTS public.user_belongs_to_org(UUID);
DROP FUNCTION IF EXISTS public.update_org_ai_metadata_on_assessment();

-- Drop tables
DROP TABLE IF EXISTS public.organization_ai_metadata CASCADE;
DROP TABLE IF EXISTS public.ai_champions CASCADE;
DROP TABLE IF EXISTS public.ai_recommendations CASCADE;
DROP TABLE IF EXISTS public.training_cohorts CASCADE;
DROP TABLE IF EXISTS public.department_skill_breakdown CASCADE;
DROP TABLE IF EXISTS public.skill_distributions CASCADE;
DROP TABLE IF EXISTS public.skills_profiles CASCADE;
DROP TABLE IF EXISTS public.analysis_themes CASCADE;
DROP TABLE IF EXISTS public.analysis_entities CASCADE;
DROP TABLE IF EXISTS public.assessment_risks CASCADE;
DROP TABLE IF EXISTS public.reality_gaps CASCADE;
DROP TABLE IF EXISTS public.consensus_themes CASCADE;
DROP TABLE IF EXISTS public.executive_summaries CASCADE;
DROP TABLE IF EXISTS public.maturity_gap_priorities CASCADE;
DROP TABLE IF EXISTS public.maturity_dimension_scores CASCADE;
DROP TABLE IF EXISTS public.ai_maturity_assessments CASCADE;

-- Drop enums
DROP TYPE IF EXISTS assessment_data_source;
DROP TYPE IF EXISTS recommendation_timeframe;
DROP TYPE IF EXISTS risk_level;
DROP TYPE IF EXISTS effort_level;
DROP TYPE IF EXISTS gap_priority;
DROP TYPE IF EXISTS maturity_dimension;
DROP TYPE IF EXISTS ai_skill_level;
*/
