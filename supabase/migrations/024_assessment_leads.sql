-- Migration: 024_assessment_leads.sql
-- Description: Create assessment_leads table for storing leads from chat assessments
-- This table stores contact info from public assessments (no auth required)

-- ============================================================
-- ASSESSMENT LEADS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.assessment_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Assessment reference
  assessment_id TEXT NOT NULL UNIQUE,

  -- Contact information
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  linkedin TEXT,

  -- Company information
  company TEXT,
  company_url TEXT,
  company_size TEXT,
  revenue TEXT,
  location TEXT,
  industry TEXT,

  -- Role information
  role TEXT,
  department TEXT,
  years_in_role TEXT,

  -- Challenge/needs
  primary_challenge TEXT,
  additional_challenges TEXT[],
  current_tools TEXT[],
  budget TEXT,
  timeframe TEXT,

  -- Enriched data (from Firecrawl)
  enriched_data JSONB DEFAULT '{}'::jsonb,

  -- Assessment results
  lead_score INTEGER CHECK (lead_score >= 0 AND lead_score <= 100),
  lead_stage TEXT CHECK (lead_stage IN ('cold', 'warm', 'hot', 'qualified')),
  ai_readiness_score INTEGER CHECK (ai_readiness_score >= 0 AND ai_readiness_score <= 100),

  -- Analysis results
  analysis JSONB DEFAULT '{}'::jsonb,

  -- Predictions
  estimated_deal_size DECIMAL(12,2),
  probability_to_close DECIMAL(3,2),

  -- Tracking
  source TEXT DEFAULT 'chat_assessment',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer TEXT,

  -- Email status
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  email_opened BOOLEAN DEFAULT false,
  email_opened_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Interaction count
  total_interactions INTEGER DEFAULT 0
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.assessment_leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_company ON public.assessment_leads(company);
CREATE INDEX IF NOT EXISTS idx_leads_score ON public.assessment_leads(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON public.assessment_leads(lead_stage);
CREATE INDEX IF NOT EXISTS idx_leads_created ON public.assessment_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.assessment_leads(source);

-- GIN index for JSONB fields
CREATE INDEX IF NOT EXISTS idx_leads_enriched ON public.assessment_leads USING GIN(enriched_data);
CREATE INDEX IF NOT EXISTS idx_leads_analysis ON public.assessment_leads USING GIN(analysis);

-- Update trigger
CREATE OR REPLACE FUNCTION update_lead_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_assessment_leads_updated_at
  BEFORE UPDATE ON public.assessment_leads
  FOR EACH ROW EXECUTE FUNCTION update_lead_updated_at();

-- RLS - Allow public insert (for anonymous users)
ALTER TABLE public.assessment_leads ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for public assessments)
CREATE POLICY "Allow public insert on assessment_leads"
  ON public.assessment_leads
  FOR INSERT
  WITH CHECK (true);

-- Only allow service role to select/update/delete
CREATE POLICY "Service role can manage assessment_leads"
  ON public.assessment_leads
  FOR ALL
  USING (auth.role() = 'service_role');

-- Admins can view all leads
CREATE POLICY "Admins can view assessment_leads"
  ON public.assessment_leads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

COMMENT ON TABLE public.assessment_leads IS 'Leads captured from public chat assessments';

-- ============================================================
-- ROLLBACK
-- ============================================================
-- DROP TRIGGER IF EXISTS update_assessment_leads_updated_at ON public.assessment_leads;
-- DROP FUNCTION IF EXISTS update_lead_updated_at();
-- DROP TABLE IF EXISTS public.assessment_leads CASCADE;
