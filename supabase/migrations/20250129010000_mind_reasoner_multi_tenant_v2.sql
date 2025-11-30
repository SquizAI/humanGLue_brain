-- Migration: 20250129010000_mind_reasoner_multi_tenant.sql
-- Description: Add Mind Reasoner multi-tenant support for enterprise clients
-- Each organization gets their own Mind Reasoner API credentials for data isolation
-- FIXED v2: Corrected view aggregation logic and RLS policies

-- =====================================================
-- ORGANIZATION MIND REASONER SETTINGS
-- =====================================================

-- Add Mind Reasoner credentials to organizations settings
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS mind_reasoner_api_key_encrypted TEXT,
ADD COLUMN IF NOT EXISTS mind_reasoner_workspace_id TEXT,
ADD COLUMN IF NOT EXISTS mind_reasoner_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mind_reasoner_configured_at TIMESTAMPTZ;

-- Index for Mind Reasoner enabled organizations
CREATE INDEX IF NOT EXISTS idx_organizations_mind_reasoner_enabled
ON organizations(mind_reasoner_enabled)
WHERE mind_reasoner_enabled = true;

-- =====================================================
-- ORGANIZATION MINDS TABLE
-- =====================================================

-- Store Mind Reasoner minds per organization
CREATE TABLE IF NOT EXISTS organization_minds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Mind Reasoner identifiers
  mind_reasoner_mind_id TEXT NOT NULL,
  mind_reasoner_digital_twin_id TEXT,

  -- Local references
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,

  -- Mind metadata
  name TEXT NOT NULL,
  description TEXT,
  mind_type TEXT DEFAULT 'individual' CHECK (mind_type IN ('individual', 'team', 'department', 'organization')),

  -- Snapshot status
  latest_snapshot_id TEXT,
  latest_snapshot_status TEXT DEFAULT 'pending' CHECK (latest_snapshot_status IN ('pending', 'processing', 'completed', 'failed')),
  latest_snapshot_at TIMESTAMPTZ,

  -- Psychometric profile cache (computed from Mind Reasoner)
  psychometric_profile JSONB DEFAULT '{}'::jsonb,
  profile_confidence INTEGER CHECK (profile_confidence >= 0 AND profile_confidence <= 100),

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  UNIQUE(organization_id, mind_reasoner_mind_id)
);

CREATE INDEX IF NOT EXISTS idx_org_minds_organization ON organization_minds(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_minds_user ON organization_minds(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_org_minds_team ON organization_minds(team_id) WHERE team_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_org_minds_type ON organization_minds(mind_type);
CREATE INDEX IF NOT EXISTS idx_org_minds_active ON organization_minds(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_org_minds_psychometric_profile ON organization_minds USING GIN(psychometric_profile);

CREATE TRIGGER update_organization_minds_updated_at
  BEFORE UPDATE ON organization_minds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MIND SIMULATIONS TABLE
-- =====================================================

-- Store simulation results for audit/history
CREATE TABLE IF NOT EXISTS mind_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  mind_id UUID NOT NULL REFERENCES organization_minds(id) ON DELETE CASCADE,

  -- Simulation details
  scenario TEXT NOT NULL,
  simulation_model TEXT DEFAULT 'mind-reasoner-pro',

  -- Results
  thinking TEXT,
  feeling TEXT,
  saying TEXT,
  acting TEXT,

  -- Context
  context_type TEXT,
  context_id UUID,

  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mind_simulations_organization ON mind_simulations(organization_id);
CREATE INDEX IF NOT EXISTS idx_mind_simulations_mind ON mind_simulations(mind_id);
CREATE INDEX IF NOT EXISTS idx_mind_simulations_context ON mind_simulations(context_type, context_id);
CREATE INDEX IF NOT EXISTS idx_mind_simulations_created ON mind_simulations(created_at DESC);

-- =====================================================
-- TEAM PSYCHOMETRIC AGGREGATES VIEW
-- =====================================================

-- View to aggregate psychometric profiles by team
-- FIXED: Proper aggregation without nesting
CREATE OR REPLACE VIEW team_psychometric_summary AS
SELECT
  t.id AS team_id,
  t.organization_id,
  t.name AS team_name,
  COUNT(DISTINCT om.id) AS mind_count,

  -- Aggregate communication styles as JSONB
  COALESCE(
    jsonb_object_agg(
      om.psychometric_profile->>'communicationStyle',
      1
    ) FILTER (WHERE om.psychometric_profile->>'communicationStyle' IS NOT NULL),
    '{}'::jsonb
  ) AS communication_styles,

  -- Aggregate AI readiness as JSONB
  COALESCE(
    jsonb_object_agg(
      om.psychometric_profile->>'aiReadiness',
      1
    ) FILTER (WHERE om.psychometric_profile->>'aiReadiness' IS NOT NULL),
    '{}'::jsonb
  ) AS ai_readiness_dist,

  -- Aggregate change readiness as JSONB
  COALESCE(
    jsonb_object_agg(
      om.psychometric_profile->>'changeReadiness',
      1
    ) FILTER (WHERE om.psychometric_profile->>'changeReadiness' IS NOT NULL),
    '{}'::jsonb
  ) AS change_readiness_dist,

  -- Average confidence score
  AVG(om.profile_confidence) AS avg_profile_confidence

FROM teams t
LEFT JOIN organization_minds om ON om.team_id = t.id AND om.is_active = true
WHERE t.is_active = true
GROUP BY t.id, t.organization_id, t.name;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE organization_minds ENABLE ROW LEVEL SECURITY;
ALTER TABLE mind_simulations ENABLE ROW LEVEL SECURITY;

-- Organization minds policies
CREATE POLICY "Users can view minds in their organization"
  ON organization_minds FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Org admins can manage minds"
  ON organization_minds FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'org_admin')
    )
  );

-- Mind simulations policies
CREATE POLICY "Users can view simulations in their organization"
  ON mind_simulations FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Org admins and team leads can create simulations"
  ON mind_simulations FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'org_admin', 'team_lead')
    )
  );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get org's Mind Reasoner API key
-- Note: In production, use Supabase Vault or pgsodium for encryption
CREATE OR REPLACE FUNCTION get_org_mind_reasoner_key(org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  api_key TEXT;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM users
    WHERE organization_id = org_id
    AND id = auth.uid()
    AND role IN ('admin', 'org_admin')
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT mind_reasoner_api_key_encrypted INTO api_key
  FROM organizations
  WHERE id = org_id AND mind_reasoner_enabled = true;

  RETURN api_key;
END;
$$;

-- Function to get mind statistics by type
CREATE OR REPLACE FUNCTION get_org_mind_stats(org_id UUID)
RETURNS TABLE (
  mind_type TEXT,
  total_count BIGINT,
  active_count BIGINT,
  avg_confidence NUMERIC
)
LANGUAGE SQL
STABLE
AS $$
  SELECT
    mind_type,
    COUNT(*) AS total_count,
    COUNT(*) FILTER (WHERE is_active = true) AS active_count,
    AVG(profile_confidence) AS avg_confidence
  FROM organization_minds
  WHERE organization_id = org_id
  GROUP BY mind_type;
$$;
