-- ============================================================================
-- Migration: Data Privacy Infrastructure
-- Created: 2025-01-28
-- Phase: 1 (Weeks 3-4)
-- Purpose: PII anonymization, consent management, GDPR/CCPA compliance
-- ============================================================================

-- ============================================================================
-- 1. PII Field Mapping Table
-- ============================================================================
-- Tracks which fields contain PII and how they should be anonymized

CREATE TABLE IF NOT EXISTS pii_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  column_name TEXT NOT NULL,
  data_type TEXT NOT NULL,
  anonymization_strategy TEXT NOT NULL CHECK (
    anonymization_strategy IN (
      'hash',           -- One-way hash (emails, IDs)
      'mask',           -- Partial masking (phone: ***-***-1234)
      'redact',         -- Full redaction (replaced with [REDACTED])
      'generalize',     -- Generalization (age 34 -> 30-40)
      'pseudonymize',   -- Reversible pseudonym (for research)
      'delete'          -- Complete deletion
    )
  ),
  is_required BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(table_name, column_name)
);

-- Index for fast lookups
CREATE INDEX idx_pii_fields_table ON pii_fields(table_name);

-- Enable RLS
ALTER TABLE pii_fields ENABLE ROW LEVEL SECURITY;

-- Only admins can manage PII field definitions
CREATE POLICY "Admins can manage PII fields"
  ON pii_fields
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
        AND (expires_at IS NULL OR expires_at > now())
    )
  );

-- ============================================================================
-- 2. Anonymization Logs (Audit Trail)
-- ============================================================================
-- Track all anonymization operations for compliance

CREATE TABLE IF NOT EXISTS anonymization_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  fields_anonymized TEXT[] NOT NULL,
  reason TEXT NOT NULL CHECK (
    reason IN (
      'user_request',      -- User requested deletion (GDPR Right to be Forgotten)
      'data_retention',    -- Automatic retention policy
      'legal_requirement', -- Legal compliance
      'admin_action'       -- Manual admin action
    )
  ),
  reversible BOOLEAN DEFAULT false,
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for auditing and compliance
CREATE INDEX idx_anonymization_logs_user ON anonymization_logs(user_id);
CREATE INDEX idx_anonymization_logs_performed_at ON anonymization_logs(performed_at);
CREATE INDEX idx_anonymization_logs_table ON anonymization_logs(table_name);

-- Enable RLS
ALTER TABLE anonymization_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all logs
CREATE POLICY "Admins can view anonymization logs"
  ON anonymization_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
        AND (expires_at IS NULL OR expires_at > now())
    )
  );

-- Users can view their own anonymization logs
CREATE POLICY "Users can view their own anonymization logs"
  ON anonymization_logs
  FOR SELECT
  USING (user_id = auth.uid());

-- ============================================================================
-- 3. Consent Management
-- ============================================================================
-- Track user consent for different data processing purposes (GDPR/CCPA)

CREATE TABLE IF NOT EXISTS consent_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  is_required BOOLEAN DEFAULT false,
  category TEXT NOT NULL CHECK (
    category IN (
      'essential',      -- Required for service
      'functional',     -- Enhanced functionality
      'analytics',      -- Usage analytics
      'marketing',      -- Marketing communications
      'data_sharing'    -- Third-party data sharing
    )
  ),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Pre-populate consent types
INSERT INTO consent_types (code, name, description, is_required, category) VALUES
  ('terms_of_service', 'Terms of Service', 'Agreement to platform terms of service', true, 'essential'),
  ('privacy_policy', 'Privacy Policy', 'Agreement to privacy policy', true, 'essential'),
  ('analytics', 'Analytics & Performance', 'Allow collection of usage analytics to improve the platform', false, 'analytics'),
  ('marketing_email', 'Marketing Emails', 'Receive product updates and promotional emails', false, 'marketing'),
  ('data_enrichment', 'Data Enrichment', 'Allow enrichment of company data via third-party services (Clearbit, etc.)', false, 'data_sharing'),
  ('ai_training', 'AI Model Training', 'Allow anonymized data to be used for AI model improvement', false, 'functional')
ON CONFLICT (code) DO NOTHING;

-- User consents table
CREATE TABLE IF NOT EXISTS user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type_id UUID NOT NULL REFERENCES consent_types(id),
  granted BOOLEAN NOT NULL,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, consent_type_id)
);

-- Indexes
CREATE INDEX idx_user_consents_user ON user_consents(user_id);
CREATE INDEX idx_user_consents_type ON user_consents(consent_type_id);
CREATE INDEX idx_user_consents_granted ON user_consents(granted);

-- Enable RLS
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own consents
CREATE POLICY "Users can manage their own consents"
  ON user_consents
  FOR ALL
  USING (user_id = auth.uid());

-- Admins can view all consents (for compliance)
CREATE POLICY "Admins can view all consents"
  ON user_consents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
        AND (expires_at IS NULL OR expires_at > now())
    )
  );

-- ============================================================================
-- 4. Data Retention Policies
-- ============================================================================
-- Define retention periods for different data types

CREATE TABLE IF NOT EXISTS data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  retention_period INTERVAL NOT NULL,
  applies_to TEXT NOT NULL CHECK (
    applies_to IN (
      'all_records',
      'inactive_users',
      'completed_assessments',
      'expired_sessions',
      'deleted_users'
    )
  ),
  action TEXT NOT NULL CHECK (
    action IN ('anonymize', 'archive', 'delete')
  ),
  enabled BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Pre-populate retention policies
INSERT INTO data_retention_policies (table_name, retention_period, applies_to, action) VALUES
  ('users', INTERVAL '3 years', 'inactive_users', 'anonymize'),
  ('assessments', INTERVAL '5 years', 'completed_assessments', 'archive'),
  ('anonymization_logs', INTERVAL '7 years', 'all_records', 'archive'),
  ('user_consents', INTERVAL '7 years', 'all_records', 'archive')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;

-- Only admins can manage retention policies
CREATE POLICY "Admins can manage retention policies"
  ON data_retention_policies
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
        AND (expires_at IS NULL OR expires_at > now())
    )
  );

-- ============================================================================
-- 5. User Data Export Requests (GDPR Article 15)
-- ============================================================================
-- Track user requests for data export

CREATE TABLE IF NOT EXISTS data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'processing', 'completed', 'failed')
  ),
  requested_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  export_url TEXT,
  expires_at TIMESTAMPTZ,
  format TEXT DEFAULT 'json' CHECK (format IN ('json', 'csv')),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX idx_data_export_requests_user ON data_export_requests(user_id);
CREATE INDEX idx_data_export_requests_status ON data_export_requests(status);

-- Enable RLS
ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;

-- Users can view and create their own export requests
CREATE POLICY "Users can manage their own export requests"
  ON data_export_requests
  FOR ALL
  USING (user_id = auth.uid());

-- ============================================================================
-- 6. User Deletion Requests (GDPR Article 17 - Right to be Forgotten)
-- ============================================================================

CREATE TABLE IF NOT EXISTS deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'approved', 'processing', 'completed', 'rejected')
  ),
  reason TEXT,
  requested_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id, status) -- One active request per user
);

-- Indexes
CREATE INDEX idx_deletion_requests_user ON deletion_requests(user_id);
CREATE INDEX idx_deletion_requests_status ON deletion_requests(status);

-- Enable RLS
ALTER TABLE deletion_requests ENABLE ROW LEVEL SECURITY;

-- Users can view and create their own deletion requests
CREATE POLICY "Users can manage their own deletion requests"
  ON deletion_requests
  FOR ALL
  USING (user_id = auth.uid());

-- Admins can view and approve deletion requests
CREATE POLICY "Admins can manage deletion requests"
  ON deletion_requests
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
        AND (expires_at IS NULL OR expires_at > now())
    )
  );

-- ============================================================================
-- 7. PostgreSQL Functions for Anonymization
-- ============================================================================

-- Anonymize user data function
CREATE OR REPLACE FUNCTION anonymize_user_data(
  target_user_id UUID,
  anonymization_reason TEXT DEFAULT 'user_request'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_tables TEXT[];
  anonymized_fields TEXT[];
  result JSONB;
BEGIN
  -- Only allow admins or the user themselves to anonymize
  IF NOT (
    auth.uid() = target_user_id OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
        AND (expires_at IS NULL OR expires_at > now())
    )
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins or the user can anonymize data';
  END IF;

  -- Anonymize user profile
  UPDATE users
  SET
    email = 'anonymized_' || id || '@deleted.humanglue.com',
    full_name = 'Deleted User',
    avatar_url = NULL,
    phone = NULL,
    updated_at = now()
  WHERE id = target_user_id;

  affected_tables := ARRAY['users'];
  anonymized_fields := ARRAY['email', 'full_name', 'avatar_url', 'phone'];

  -- Log the anonymization
  INSERT INTO anonymization_logs (
    user_id,
    table_name,
    record_id,
    fields_anonymized,
    reason,
    performed_by,
    reversible,
    metadata
  ) VALUES (
    target_user_id,
    'users',
    target_user_id,
    anonymized_fields,
    anonymization_reason,
    auth.uid(),
    false,
    jsonb_build_object(
      'affected_tables', affected_tables,
      'timestamp', now()
    )
  );

  result := jsonb_build_object(
    'success', true,
    'user_id', target_user_id,
    'affected_tables', affected_tables,
    'anonymized_fields', anonymized_fields,
    'timestamp', now()
  );

  RETURN result;
END;
$$;

-- ============================================================================
-- 8. Updated Triggers
-- ============================================================================

-- Update timestamp trigger for pii_fields
CREATE TRIGGER update_pii_fields_updated_at
  BEFORE UPDATE ON pii_fields
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update timestamp trigger for consent_types
CREATE TRIGGER update_consent_types_updated_at
  BEFORE UPDATE ON consent_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update timestamp trigger for user_consents
CREATE TRIGGER update_user_consents_updated_at
  BEFORE UPDATE ON user_consents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update timestamp trigger for data_retention_policies
CREATE TRIGGER update_data_retention_policies_updated_at
  BEFORE UPDATE ON data_retention_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- To verify the migration:
-- SELECT * FROM pii_fields;
-- SELECT * FROM consent_types;
-- SELECT * FROM data_retention_policies;
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%consent%' OR table_name LIKE '%anonymization%' OR table_name LIKE '%retention%';
