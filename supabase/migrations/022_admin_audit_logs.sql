-- Migration: 022_admin_audit_logs.sql
-- Description: Creates audit_logs table for tracking admin actions
-- This is separate from auth_audit_log which tracks authentication events

-- ============================================================
-- AUDIT LOGS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who performed the action
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- What action was performed
  action TEXT NOT NULL,

  -- Target of the action (if applicable)
  target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  target_resource_type TEXT,
  target_resource_id UUID,

  -- Additional details as JSON
  details JSONB DEFAULT '{}'::jsonb,

  -- Request metadata
  ip_address TEXT,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_target_user ON audit_logs(target_user_id) WHERE target_user_id IS NOT NULL;
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(target_resource_type, target_resource_id)
  WHERE target_resource_type IS NOT NULL;

-- GIN index for JSONB details searches
CREATE INDEX idx_audit_logs_details ON audit_logs USING gin(details);

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE audit_logs IS 'Audit trail for admin actions and system operations';
COMMENT ON COLUMN audit_logs.user_id IS 'User who performed the action';
COMMENT ON COLUMN audit_logs.action IS 'Action type (e.g., user_created, role_assigned, user_deleted)';
COMMENT ON COLUMN audit_logs.target_user_id IS 'User affected by the action (if applicable)';
COMMENT ON COLUMN audit_logs.target_resource_type IS 'Type of resource affected (e.g., workshop, organization)';
COMMENT ON COLUMN audit_logs.target_resource_id IS 'ID of resource affected';
COMMENT ON COLUMN audit_logs.details IS 'Additional JSON data about the action';

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
      AND (expires_at IS NULL OR expires_at > now())
    )
  );

-- Org admins can view audit logs for their organization's users
CREATE POLICY "Org admins can view their org audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'org_admin'
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
      AND (
        -- Actions by users in their org
        audit_logs.user_id IN (
          SELECT id FROM users WHERE organization_id = ur.organization_id
        )
        OR
        -- Actions targeting users in their org
        audit_logs.target_user_id IN (
          SELECT id FROM users WHERE organization_id = ur.organization_id
        )
      )
    )
  );

-- Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs"
  ON audit_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Users can view audit logs where they are the target
CREATE POLICY "Users can view their own audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (target_user_id = auth.uid());

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to get audit logs for a user
CREATE OR REPLACE FUNCTION get_user_audit_logs(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  action TEXT,
  performed_by_id UUID,
  performed_by_email TEXT,
  details JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.id,
    al.action,
    al.user_id as performed_by_id,
    u.email as performed_by_email,
    al.details,
    al.created_at
  FROM audit_logs al
  LEFT JOIN users u ON u.id = al.user_id
  WHERE al.target_user_id = p_user_id
  ORDER BY al.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent admin actions
CREATE OR REPLACE FUNCTION get_recent_admin_actions(
  p_hours INTEGER DEFAULT 24,
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  action TEXT,
  user_id UUID,
  user_email TEXT,
  target_user_id UUID,
  target_email TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.id,
    al.action,
    al.user_id,
    u1.email as user_email,
    al.target_user_id,
    u2.email as target_email,
    al.details,
    al.ip_address,
    al.created_at
  FROM audit_logs al
  LEFT JOIN users u1 ON u1.id = al.user_id
  LEFT JOIN users u2 ON u2.id = al.target_user_id
  WHERE al.created_at > (now() - (p_hours || ' hours')::interval)
  ORDER BY al.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- GRANTS
-- ============================================================

GRANT SELECT ON audit_logs TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_audit_logs TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_admin_actions TO authenticated;

-- ============================================================
-- ROLLBACK
-- ============================================================
-- DROP FUNCTION IF EXISTS get_recent_admin_actions;
-- DROP FUNCTION IF EXISTS get_user_audit_logs;
-- DROP TABLE IF EXISTS audit_logs CASCADE;
