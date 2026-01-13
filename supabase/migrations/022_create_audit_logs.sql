-- Migration: 022_create_audit_logs.sql
-- Description: Create comprehensive audit logging infrastructure for admin system
-- Dependencies: user_roles table, auth.users
-- Version: 022

-- ============================================================
-- SECTION 1: AUDIT LOGS TABLE
-- Main table for tracking all admin actions
-- ============================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),  -- 'user', 'role', 'organization', 'course', 'assessment', etc.
  target_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add table comment
COMMENT ON TABLE public.audit_logs IS 'Comprehensive audit trail for all admin actions in the HumanGlue platform';
COMMENT ON COLUMN public.audit_logs.user_id IS 'The admin user who performed the action';
COMMENT ON COLUMN public.audit_logs.action IS 'Type of action performed (e.g., user.create, role.assign, user.delete)';
COMMENT ON COLUMN public.audit_logs.target_type IS 'Type of entity affected (user, role, organization, course, etc.)';
COMMENT ON COLUMN public.audit_logs.target_id IS 'ID of the affected entity';
COMMENT ON COLUMN public.audit_logs.details IS 'Additional context about the action (changes made, old/new values, etc.)';
COMMENT ON COLUMN public.audit_logs.ip_address IS 'IP address of the client making the request';
COMMENT ON COLUMN public.audit_logs.user_agent IS 'User agent string of the client browser';

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON public.audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_details ON public.audit_logs USING GIN(details);

-- RLS policies for audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'humanglue_admin', 'super_admin_full')
      AND (user_roles.expires_at IS NULL OR user_roles.expires_at > NOW())
    )
  );

-- Policy: Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs" ON public.audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Policy: No one can update or delete audit logs (append-only)
-- (No UPDATE or DELETE policies created intentionally)

-- ============================================================
-- SECTION 2: LOGIN HISTORY TABLE
-- Track all login attempts for security monitoring
-- ============================================================

CREATE TABLE IF NOT EXISTS public.login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  failure_reason TEXT,
  location JSONB DEFAULT '{}'::jsonb,  -- For geo-location data if available
  device_info JSONB DEFAULT '{}'::jsonb  -- For device fingerprinting
);

-- Add table comment
COMMENT ON TABLE public.login_history IS 'Track all login attempts for security monitoring and analysis';
COMMENT ON COLUMN public.login_history.user_id IS 'User who attempted to login';
COMMENT ON COLUMN public.login_history.login_at IS 'Timestamp of the login attempt';
COMMENT ON COLUMN public.login_history.success IS 'Whether the login was successful';
COMMENT ON COLUMN public.login_history.failure_reason IS 'Reason for login failure if applicable';
COMMENT ON COLUMN public.login_history.location IS 'Geolocation data derived from IP';
COMMENT ON COLUMN public.login_history.device_info IS 'Device fingerprinting information';

-- Indexes for login_history
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON public.login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_login_at ON public.login_history(login_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_history_success ON public.login_history(success);
CREATE INDEX IF NOT EXISTS idx_login_history_ip ON public.login_history(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_history_user_recent ON public.login_history(user_id, login_at DESC);

-- RLS policies for login_history
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own login history
CREATE POLICY "Users can view own login history" ON public.login_history
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Admins can view all login history
CREATE POLICY "Admins can view all login history" ON public.login_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'humanglue_admin', 'super_admin_full')
      AND (user_roles.expires_at IS NULL OR user_roles.expires_at > NOW())
    )
  );

-- Policy: Service role can insert login history
CREATE POLICY "Service role can insert login history" ON public.login_history
  FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- SECTION 3: ROLE CHANGE HISTORY TABLE
-- Specialized tracking for role assignments and changes
-- ============================================================

CREATE TABLE IF NOT EXISTS public.role_change_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  previous_role TEXT,
  new_role TEXT NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add table comment
COMMENT ON TABLE public.role_change_history IS 'Specialized audit trail for all role assignments and changes';
COMMENT ON COLUMN public.role_change_history.user_id IS 'User whose role was changed';
COMMENT ON COLUMN public.role_change_history.changed_by IS 'Admin who made the change';
COMMENT ON COLUMN public.role_change_history.previous_role IS 'Role before the change (null for new assignments)';
COMMENT ON COLUMN public.role_change_history.new_role IS 'Role after the change';
COMMENT ON COLUMN public.role_change_history.organization_id IS 'Organization context for org-scoped roles';
COMMENT ON COLUMN public.role_change_history.reason IS 'Reason for the role change';
COMMENT ON COLUMN public.role_change_history.metadata IS 'Additional context (expiry date, permissions granted, etc.)';

-- Indexes for role_change_history
CREATE INDEX IF NOT EXISTS idx_role_change_user_id ON public.role_change_history(user_id);
CREATE INDEX IF NOT EXISTS idx_role_change_changed_by ON public.role_change_history(changed_by);
CREATE INDEX IF NOT EXISTS idx_role_change_changed_at ON public.role_change_history(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_role_change_new_role ON public.role_change_history(new_role);
CREATE INDEX IF NOT EXISTS idx_role_change_org ON public.role_change_history(organization_id) WHERE organization_id IS NOT NULL;

-- RLS policies for role_change_history
ALTER TABLE public.role_change_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own role change history
CREATE POLICY "Users can view own role changes" ON public.role_change_history
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Admins can view all role change history
CREATE POLICY "Admins can view all role changes" ON public.role_change_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'humanglue_admin', 'super_admin_full')
      AND (user_roles.expires_at IS NULL OR user_roles.expires_at > NOW())
    )
  );

-- Policy: Service role can insert role change history
CREATE POLICY "Service role can insert role changes" ON public.role_change_history
  FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- SECTION 4: HELPER FUNCTIONS
-- Utility functions for audit logging
-- ============================================================

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID,
  p_action VARCHAR(100),
  p_target_type VARCHAR(50) DEFAULT NULL,
  p_target_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::jsonb,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    target_type,
    target_id,
    details,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_action,
    p_target_type,
    p_target_id,
    p_details,
    p_ip_address,
    p_user_agent
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION log_audit_event IS 'Helper function to create audit log entries';

-- Function to log role changes with automatic previous role detection
CREATE OR REPLACE FUNCTION log_role_change(
  p_user_id UUID,
  p_changed_by UUID,
  p_new_role TEXT,
  p_organization_id UUID DEFAULT NULL,
  p_reason TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_ip_address INET DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
  v_previous_role TEXT;
BEGIN
  -- Get the current role before the change
  SELECT role INTO v_previous_role
  FROM public.user_roles
  WHERE user_id = p_user_id
  AND (organization_id = p_organization_id OR (organization_id IS NULL AND p_organization_id IS NULL))
  ORDER BY created_at DESC
  LIMIT 1;

  INSERT INTO public.role_change_history (
    user_id,
    changed_by,
    previous_role,
    new_role,
    organization_id,
    reason,
    metadata,
    ip_address
  ) VALUES (
    p_user_id,
    p_changed_by,
    v_previous_role,
    p_new_role,
    p_organization_id,
    p_reason,
    p_metadata,
    p_ip_address
  )
  RETURNING id INTO v_log_id;

  -- Also log to main audit_logs
  PERFORM log_audit_event(
    p_changed_by,
    'role.change',
    'user',
    p_user_id,
    jsonb_build_object(
      'previous_role', v_previous_role,
      'new_role', p_new_role,
      'organization_id', p_organization_id,
      'reason', p_reason
    ),
    p_ip_address,
    NULL
  );

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION log_role_change IS 'Helper function to log role changes with automatic previous role detection';

-- Function to log login attempts
CREATE OR REPLACE FUNCTION log_login_attempt(
  p_user_id UUID,
  p_success BOOLEAN,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_failure_reason TEXT DEFAULT NULL,
  p_location JSONB DEFAULT '{}'::jsonb,
  p_device_info JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.login_history (
    user_id,
    success,
    ip_address,
    user_agent,
    failure_reason,
    location,
    device_info
  ) VALUES (
    p_user_id,
    p_success,
    p_ip_address,
    p_user_agent,
    p_failure_reason,
    p_location,
    p_device_info
  )
  RETURNING id INTO v_log_id;

  -- Also log to main audit_logs for failed attempts
  IF NOT p_success THEN
    PERFORM log_audit_event(
      p_user_id,
      'auth.login_failed',
      'user',
      p_user_id,
      jsonb_build_object(
        'reason', p_failure_reason,
        'ip_address', p_ip_address::text
      ),
      p_ip_address,
      p_user_agent
    );
  END IF;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION log_login_attempt IS 'Helper function to log login attempts';

-- Function to get recent suspicious activity
CREATE OR REPLACE FUNCTION get_recent_suspicious_activity(
  p_hours INTEGER DEFAULT 24,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  log_id UUID,
  user_id UUID,
  action VARCHAR(100),
  target_type VARCHAR(50),
  target_id UUID,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.id as log_id,
    al.user_id,
    al.action,
    al.target_type,
    al.target_id,
    al.details,
    al.ip_address,
    al.created_at
  FROM public.audit_logs al
  WHERE al.created_at > (NOW() - (p_hours || ' hours')::interval)
  AND al.action IN (
    'auth.login_failed',
    'user.delete',
    'role.change',
    'user.suspend',
    'permission.revoke',
    'data.export',
    'bulk.delete'
  )
  ORDER BY al.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_recent_suspicious_activity IS 'Returns recent potentially suspicious admin activity';

-- Function to get user activity summary
CREATE OR REPLACE FUNCTION get_user_activity_summary(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  action VARCHAR(100),
  action_count BIGINT,
  last_occurrence TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.action,
    COUNT(*) as action_count,
    MAX(al.created_at) as last_occurrence
  FROM public.audit_logs al
  WHERE al.user_id = p_user_id
  AND al.created_at > (NOW() - (p_days || ' days')::interval)
  GROUP BY al.action
  ORDER BY action_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_activity_summary IS 'Returns summary of user activity over specified period';

-- ============================================================
-- SECTION 5: VIEWS FOR ADMIN DASHBOARD
-- Pre-built views for common queries
-- ============================================================

-- View: Recent admin activity
CREATE OR REPLACE VIEW public.recent_admin_activity AS
SELECT
  al.id,
  al.user_id,
  p.full_name as user_name,
  p.email as user_email,
  al.action,
  al.target_type,
  al.target_id,
  al.details,
  al.ip_address,
  al.created_at
FROM public.audit_logs al
LEFT JOIN public.profiles p ON al.user_id = p.id
WHERE al.created_at > (NOW() - interval '7 days')
ORDER BY al.created_at DESC;

COMMENT ON VIEW public.recent_admin_activity IS 'Recent admin activity with user details for dashboard';

-- View: Failed login attempts
CREATE OR REPLACE VIEW public.failed_login_attempts AS
SELECT
  lh.id,
  lh.user_id,
  p.full_name as user_name,
  p.email as user_email,
  lh.login_at,
  lh.ip_address,
  lh.user_agent,
  lh.failure_reason
FROM public.login_history lh
LEFT JOIN public.profiles p ON lh.user_id = p.id
WHERE lh.success = false
AND lh.login_at > (NOW() - interval '7 days')
ORDER BY lh.login_at DESC;

COMMENT ON VIEW public.failed_login_attempts IS 'Recent failed login attempts for security monitoring';

-- View: Role change summary
CREATE OR REPLACE VIEW public.role_changes_summary AS
SELECT
  rch.id,
  rch.user_id,
  p1.full_name as user_name,
  p1.email as user_email,
  rch.changed_by,
  p2.full_name as changed_by_name,
  rch.previous_role,
  rch.new_role,
  o.name as organization_name,
  rch.reason,
  rch.changed_at
FROM public.role_change_history rch
LEFT JOIN public.profiles p1 ON rch.user_id = p1.id
LEFT JOIN public.profiles p2 ON rch.changed_by = p2.id
LEFT JOIN public.organizations o ON rch.organization_id = o.id
ORDER BY rch.changed_at DESC;

COMMENT ON VIEW public.role_changes_summary IS 'Role changes with full user and organization details';

-- ============================================================
-- SECTION 6: TRIGGER FOR AUTOMATIC ROLE CHANGE LOGGING
-- Automatically log role changes when user_roles is modified
-- ============================================================

CREATE OR REPLACE FUNCTION trigger_log_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.role_change_history (
      user_id,
      changed_by,
      previous_role,
      new_role,
      organization_id,
      metadata
    ) VALUES (
      NEW.user_id,
      NEW.granted_by,
      NULL,
      NEW.role,
      NEW.organization_id,
      NEW.metadata
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO public.role_change_history (
      user_id,
      changed_by,
      previous_role,
      new_role,
      organization_id,
      metadata
    ) VALUES (
      NEW.user_id,
      NEW.granted_by,
      OLD.role,
      NEW.role,
      NEW.organization_id,
      jsonb_build_object('old_metadata', OLD.metadata, 'new_metadata', NEW.metadata)
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.role_change_history (
      user_id,
      changed_by,
      previous_role,
      new_role,
      organization_id,
      reason
    ) VALUES (
      OLD.user_id,
      auth.uid(),
      OLD.role,
      'removed',
      OLD.organization_id,
      'Role assignment deleted'
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on user_roles table
DROP TRIGGER IF EXISTS trigger_user_roles_audit ON public.user_roles;
CREATE TRIGGER trigger_user_roles_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_log_role_change();

COMMENT ON FUNCTION trigger_log_role_change() IS 'Automatically logs role changes when user_roles is modified';

-- ============================================================
-- SECTION 7: CLEANUP FUNCTIONS
-- Data retention management
-- ============================================================

-- Function to cleanup old audit logs (configurable retention)
CREATE OR REPLACE FUNCTION cleanup_audit_logs(
  p_retention_days INTEGER DEFAULT 365
)
RETURNS TABLE (
  table_name TEXT,
  deleted_count BIGINT
) AS $$
DECLARE
  v_audit_deleted BIGINT;
  v_login_deleted BIGINT;
  v_role_deleted BIGINT;
BEGIN
  -- Delete old audit logs
  DELETE FROM public.audit_logs
  WHERE created_at < (NOW() - (p_retention_days || ' days')::interval);
  GET DIAGNOSTICS v_audit_deleted = ROW_COUNT;

  -- Delete old login history (shorter retention - 90 days by default)
  DELETE FROM public.login_history
  WHERE login_at < (NOW() - (LEAST(p_retention_days, 90) || ' days')::interval);
  GET DIAGNOSTICS v_login_deleted = ROW_COUNT;

  -- Keep role change history longer (never auto-delete, but could be configured)
  v_role_deleted := 0;

  RETURN QUERY
  SELECT 'audit_logs'::TEXT, v_audit_deleted
  UNION ALL
  SELECT 'login_history'::TEXT, v_login_deleted
  UNION ALL
  SELECT 'role_change_history'::TEXT, v_role_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_audit_logs IS 'Removes old audit data based on retention policy';

-- Grant appropriate permissions
GRANT EXECUTE ON FUNCTION log_audit_event TO authenticated;
GRANT EXECUTE ON FUNCTION log_role_change TO authenticated;
GRANT EXECUTE ON FUNCTION log_login_attempt TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_suspicious_activity TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_activity_summary TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_audit_logs TO postgres;

-- ============================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================
--
-- To rollback this migration:
--
-- DROP TRIGGER IF EXISTS trigger_user_roles_audit ON public.user_roles;
-- DROP FUNCTION IF EXISTS trigger_log_role_change();
-- DROP FUNCTION IF EXISTS cleanup_audit_logs(INTEGER);
-- DROP FUNCTION IF EXISTS get_user_activity_summary(UUID, INTEGER);
-- DROP FUNCTION IF EXISTS get_recent_suspicious_activity(INTEGER, INTEGER);
-- DROP FUNCTION IF EXISTS log_login_attempt(UUID, BOOLEAN, INET, TEXT, TEXT, JSONB, JSONB);
-- DROP FUNCTION IF EXISTS log_role_change(UUID, UUID, TEXT, UUID, TEXT, JSONB, INET);
-- DROP FUNCTION IF EXISTS log_audit_event(UUID, VARCHAR, VARCHAR, UUID, JSONB, INET, TEXT);
-- DROP VIEW IF EXISTS public.role_changes_summary;
-- DROP VIEW IF EXISTS public.failed_login_attempts;
-- DROP VIEW IF EXISTS public.recent_admin_activity;
-- DROP TABLE IF EXISTS public.role_change_history CASCADE;
-- DROP TABLE IF EXISTS public.login_history CASCADE;
-- DROP TABLE IF EXISTS public.audit_logs CASCADE;
--
