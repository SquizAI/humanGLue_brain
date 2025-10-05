-- Migration: Authentication Audit Log
-- Version: 007
-- Description: Creates audit logging infrastructure for authentication events

-- Create auth_audit_log table
CREATE TABLE IF NOT EXISTS auth_audit_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Add indexes for efficient querying
CREATE INDEX idx_auth_audit_user ON auth_audit_log(user_id);
CREATE INDEX idx_auth_audit_event_type ON auth_audit_log(event_type);
CREATE INDEX idx_auth_audit_created ON auth_audit_log(created_at DESC);
CREATE INDEX idx_auth_audit_ip ON auth_audit_log(ip_address);

-- Add GIN index for JSONB metadata searches
CREATE INDEX idx_auth_audit_metadata ON auth_audit_log USING gin(metadata);

-- Add comment for documentation
COMMENT ON TABLE auth_audit_log IS 'Audit trail for all authentication and security events';
COMMENT ON COLUMN auth_audit_log.user_id IS 'User involved in the event (null for anonymous events)';
COMMENT ON COLUMN auth_audit_log.event_type IS 'Type of auth event (login_success, login_failed, etc.)';
COMMENT ON COLUMN auth_audit_log.ip_address IS 'Client IP address';
COMMENT ON COLUMN auth_audit_log.user_agent IS 'Client user agent string';
COMMENT ON COLUMN auth_audit_log.metadata IS 'Additional event-specific data (email, reason, etc.)';

-- Enable Row-Level Security
ALTER TABLE auth_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs"
  ON auth_audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policy: Users can view their own audit logs
CREATE POLICY "Users can view their own audit logs"
  ON auth_audit_log
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policy: Service role can insert audit logs (for backend operations)
CREATE POLICY "Service role can insert audit logs"
  ON auth_audit_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- RLS Policy: Authenticated users cannot modify or delete audit logs
-- (Audit logs should be append-only)

-- Create function to clean up old audit logs (optional, for data retention)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(retention_days integer DEFAULT 90)
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Delete audit logs older than retention period
  DELETE FROM auth_audit_log
  WHERE created_at < (now() - (retention_days || ' days')::interval);

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_old_audit_logs IS 'Removes audit logs older than specified retention period (default 90 days)';

-- Create function to get failed login attempts for an email
CREATE OR REPLACE FUNCTION get_failed_login_attempts(
  p_email text,
  p_minutes integer DEFAULT 30
)
RETURNS TABLE (
  attempt_time timestamptz,
  ip_address text,
  user_agent text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    created_at as attempt_time,
    auth_audit_log.ip_address,
    auth_audit_log.user_agent
  FROM auth_audit_log
  WHERE event_type = 'login_failed'
    AND metadata->>'email' = p_email
    AND created_at > (now() - (p_minutes || ' minutes')::interval)
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_failed_login_attempts IS 'Returns recent failed login attempts for a specific email address';

-- Create function to get suspicious activity
CREATE OR REPLACE FUNCTION get_suspicious_activity(
  p_hours integer DEFAULT 24,
  p_limit integer DEFAULT 100
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  event_type text,
  ip_address text,
  metadata jsonb,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    auth_audit_log.id,
    auth_audit_log.user_id,
    auth_audit_log.event_type,
    auth_audit_log.ip_address,
    auth_audit_log.metadata,
    auth_audit_log.created_at
  FROM auth_audit_log
  WHERE (
    event_type IN ('login_failed', 'account_locked', 'suspicious_activity', 'rate_limit_exceeded')
    AND created_at > (now() - (p_hours || ' hours')::interval)
  )
  ORDER BY created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_suspicious_activity IS 'Returns recent suspicious authentication activity';

-- Create view for security dashboard (admins only)
CREATE OR REPLACE VIEW auth_security_summary AS
SELECT
  DATE_TRUNC('hour', created_at) as hour,
  event_type,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT ip_address) as unique_ips
FROM auth_audit_log
WHERE created_at > (now() - interval '7 days')
GROUP BY DATE_TRUNC('hour', created_at), event_type
ORDER BY hour DESC, event_count DESC;

COMMENT ON VIEW auth_security_summary IS 'Hourly summary of authentication events for security monitoring';

-- Grant appropriate permissions
GRANT SELECT ON auth_security_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_failed_login_attempts TO authenticated;
GRANT EXECUTE ON FUNCTION get_suspicious_activity TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_audit_logs TO postgres;
