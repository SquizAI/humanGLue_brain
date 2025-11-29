-- Migration: 008_admin_role_hierarchy.sql
-- Description: Implement multi-tier admin role hierarchy with permissions
-- Dependencies: 001_create_users_and_roles.sql
--
-- Requirements:
-- 1. HumanGlue Admin (platform admin) - uses existing 'admin' role
-- 2. Org/Client Admin - organization-level administrator
-- 3. Super Admin Level 1 - Can manage courses but NO financials
-- 4. Super Admin Level 2 - Full access including financials

-- ============================================================
-- STEP 1: Update profiles role constraint to include new roles
-- ============================================================

-- Drop existing constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add new constraint with expanded roles
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN (
    'client',           -- Regular B2C client
    'instructor',       -- Course instructor
    'expert',           -- Talent pool expert
    'admin',            -- HumanGlue platform admin
    'org_admin',        -- Organization/client administrator
    'super_admin_courses',  -- Super admin - courses only (no financials)
    'super_admin_full'      -- Super admin - full access with financials
  ));

COMMENT ON CONSTRAINT profiles_role_check ON public.profiles IS
  'Valid user roles: client, instructor, expert, admin (HumanGlue), org_admin, super_admin_courses, super_admin_full';

-- ============================================================
-- STEP 2: Create permissions table for granular access control
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Permission flags
  can_access_financials BOOLEAN NOT NULL DEFAULT false,
  can_manage_courses BOOLEAN NOT NULL DEFAULT false,
  can_manage_users BOOLEAN NOT NULL DEFAULT false,
  can_manage_organizations BOOLEAN NOT NULL DEFAULT false,
  can_manage_experts BOOLEAN NOT NULL DEFAULT false,
  can_manage_instructors BOOLEAN NOT NULL DEFAULT false,
  can_view_analytics BOOLEAN NOT NULL DEFAULT false,
  can_manage_payments BOOLEAN NOT NULL DEFAULT false,
  can_manage_platform_settings BOOLEAN NOT NULL DEFAULT false,

  -- Organization context (NULL for platform-wide permissions)
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Metadata for custom permissions
  custom_permissions JSONB DEFAULT '{}'::jsonb,

  -- Audit fields
  granted_by UUID REFERENCES public.profiles(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Ensure unique permissions per user per organization
  CONSTRAINT unique_user_org_permissions UNIQUE (user_id, organization_id)
);

-- Add indexes
CREATE INDEX idx_user_permissions_user ON public.user_permissions(user_id);
CREATE INDEX idx_user_permissions_org ON public.user_permissions(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX idx_user_permissions_expires ON public.user_permissions(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_user_permissions_financials ON public.user_permissions(can_access_financials) WHERE can_access_financials = true;

-- Add comments
COMMENT ON TABLE public.user_permissions IS 'Granular permissions for admin and super admin users';
COMMENT ON COLUMN public.user_permissions.can_access_financials IS 'Access to financial data, payments, revenue reports';
COMMENT ON COLUMN public.user_permissions.can_manage_courses IS 'Manage courses, curriculum, and educational content';
COMMENT ON COLUMN public.user_permissions.organization_id IS 'NULL for platform-wide permissions, or specific org for org-scoped permissions';

-- ============================================================
-- STEP 3: Create function to auto-assign permissions based on role
-- ============================================================

CREATE OR REPLACE FUNCTION assign_default_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if role is admin-related
  IF NEW.role IN ('admin', 'org_admin', 'super_admin_courses', 'super_admin_full') THEN

    -- Delete existing permissions to avoid conflicts
    DELETE FROM public.user_permissions WHERE user_id = NEW.id;

    -- HumanGlue Platform Admin - full platform access
    IF NEW.role = 'admin' THEN
      INSERT INTO public.user_permissions (
        user_id,
        can_access_financials,
        can_manage_courses,
        can_manage_users,
        can_manage_organizations,
        can_manage_experts,
        can_manage_instructors,
        can_view_analytics,
        can_manage_payments,
        can_manage_platform_settings,
        organization_id
      ) VALUES (
        NEW.id,
        true,  -- Full financial access
        true,  -- Can manage courses
        true,  -- Can manage users
        true,  -- Can manage organizations
        true,  -- Can manage experts
        true,  -- Can manage instructors
        true,  -- Can view analytics
        true,  -- Can manage payments
        true,  -- Can manage platform settings
        NULL   -- Platform-wide
      );

    -- Super Admin Full - all access including financials
    ELSIF NEW.role = 'super_admin_full' THEN
      INSERT INTO public.user_permissions (
        user_id,
        can_access_financials,
        can_manage_courses,
        can_manage_users,
        can_manage_organizations,
        can_manage_experts,
        can_manage_instructors,
        can_view_analytics,
        can_manage_payments,
        can_manage_platform_settings,
        organization_id
      ) VALUES (
        NEW.id,
        true,  -- Full financial access
        true,  -- Can manage courses
        true,  -- Can manage users
        true,  -- Can manage organizations
        true,  -- Can manage experts
        true,  -- Can manage instructors
        true,  -- Can view analytics
        true,  -- Can manage payments
        false, -- Cannot manage platform settings (reserved for HumanGlue admin)
        NULL   -- Platform-wide
      );

    -- Super Admin Courses - courses only, NO financials
    ELSIF NEW.role = 'super_admin_courses' THEN
      INSERT INTO public.user_permissions (
        user_id,
        can_access_financials,
        can_manage_courses,
        can_manage_users,
        can_manage_organizations,
        can_manage_experts,
        can_manage_instructors,
        can_view_analytics,
        can_manage_payments,
        can_manage_platform_settings,
        organization_id
      ) VALUES (
        NEW.id,
        false, -- NO financial access
        true,  -- Can manage courses
        true,  -- Can manage users
        false, -- Cannot manage organizations
        true,  -- Can manage experts
        true,  -- Can manage instructors
        true,  -- Can view analytics (non-financial)
        false, -- Cannot manage payments
        false, -- Cannot manage platform settings
        NULL   -- Platform-wide
      );

    -- Organization Admin - organization-scoped access
    ELSIF NEW.role = 'org_admin' THEN
      -- Note: This requires organization_id to be set separately
      -- We'll insert a placeholder that needs to be updated with actual org_id
      INSERT INTO public.user_permissions (
        user_id,
        can_access_financials,
        can_manage_courses,
        can_manage_users,
        can_manage_organizations,
        can_manage_experts,
        can_manage_instructors,
        can_view_analytics,
        can_manage_payments,
        can_manage_platform_settings,
        organization_id
      ) VALUES (
        NEW.id,
        true,  -- Org financial access
        false, -- Cannot manage courses
        true,  -- Can manage org users
        false, -- Cannot manage other organizations
        false, -- Cannot manage experts
        false, -- Cannot manage instructors
        true,  -- Can view org analytics
        true,  -- Can manage org payments
        false, -- Cannot manage platform settings
        NULL   -- Will be updated with specific org_id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-assign permissions on role change
DROP TRIGGER IF EXISTS trigger_assign_permissions ON public.profiles;
CREATE TRIGGER trigger_assign_permissions
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_default_permissions();

COMMENT ON FUNCTION assign_default_permissions() IS 'Automatically assigns default permissions based on user role';

-- ============================================================
-- STEP 4: Create helper functions for permission checks
-- ============================================================

-- Check if user has specific permission
CREATE OR REPLACE FUNCTION has_permission(
  p_user_id UUID,
  p_permission TEXT,
  p_organization_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_permission BOOLEAN := false;
BEGIN
  -- Check permission based on permission type
  CASE p_permission
    WHEN 'financials' THEN
      SELECT can_access_financials INTO v_has_permission
      FROM public.user_permissions
      WHERE user_id = p_user_id
      AND (organization_id = p_organization_id OR organization_id IS NULL)
      AND (expires_at IS NULL OR expires_at > now())
      LIMIT 1;

    WHEN 'courses' THEN
      SELECT can_manage_courses INTO v_has_permission
      FROM public.user_permissions
      WHERE user_id = p_user_id
      AND (organization_id = p_organization_id OR organization_id IS NULL)
      AND (expires_at IS NULL OR expires_at > now())
      LIMIT 1;

    WHEN 'users' THEN
      SELECT can_manage_users INTO v_has_permission
      FROM public.user_permissions
      WHERE user_id = p_user_id
      AND (organization_id = p_organization_id OR organization_id IS NULL)
      AND (expires_at IS NULL OR expires_at > now())
      LIMIT 1;

    WHEN 'organizations' THEN
      SELECT can_manage_organizations INTO v_has_permission
      FROM public.user_permissions
      WHERE user_id = p_user_id
      AND (organization_id = p_organization_id OR organization_id IS NULL)
      AND (expires_at IS NULL OR expires_at > now())
      LIMIT 1;

    WHEN 'experts' THEN
      SELECT can_manage_experts INTO v_has_permission
      FROM public.user_permissions
      WHERE user_id = p_user_id
      AND (organization_id = p_organization_id OR organization_id IS NULL)
      AND (expires_at IS NULL OR expires_at > now())
      LIMIT 1;

    WHEN 'instructors' THEN
      SELECT can_manage_instructors INTO v_has_permission
      FROM public.user_permissions
      WHERE user_id = p_user_id
      AND (organization_id = p_organization_id OR organization_id IS NULL)
      AND (expires_at IS NULL OR expires_at > now())
      LIMIT 1;

    WHEN 'analytics' THEN
      SELECT can_view_analytics INTO v_has_permission
      FROM public.user_permissions
      WHERE user_id = p_user_id
      AND (organization_id = p_organization_id OR organization_id IS NULL)
      AND (expires_at IS NULL OR expires_at > now())
      LIMIT 1;

    WHEN 'payments' THEN
      SELECT can_manage_payments INTO v_has_permission
      FROM public.user_permissions
      WHERE user_id = p_user_id
      AND (organization_id = p_organization_id OR organization_id IS NULL)
      AND (expires_at IS NULL OR expires_at > now())
      LIMIT 1;

    WHEN 'platform_settings' THEN
      SELECT can_manage_platform_settings INTO v_has_permission
      FROM public.user_permissions
      WHERE user_id = p_user_id
      AND (organization_id = p_organization_id OR organization_id IS NULL)
      AND (expires_at IS NULL OR expires_at > now())
      LIMIT 1;

    ELSE
      v_has_permission := false;
  END CASE;

  RETURN COALESCE(v_has_permission, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION has_permission(UUID, TEXT, UUID) IS 'Check if user has specific permission, optionally scoped to organization';

-- Get all permissions for a user
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TABLE(
  permission_name TEXT,
  has_access BOOLEAN,
  organization_id UUID,
  organization_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    'financials' as permission_name,
    up.can_access_financials as has_access,
    up.organization_id,
    o.name as organization_name
  FROM public.user_permissions up
  LEFT JOIN public.organizations o ON o.id = up.organization_id
  WHERE up.user_id = p_user_id
  AND (up.expires_at IS NULL OR up.expires_at > now())

  UNION ALL

  SELECT
    'courses' as permission_name,
    up.can_manage_courses as has_access,
    up.organization_id,
    o.name as organization_name
  FROM public.user_permissions up
  LEFT JOIN public.organizations o ON o.id = up.organization_id
  WHERE up.user_id = p_user_id
  AND (up.expires_at IS NULL OR up.expires_at > now())

  UNION ALL

  SELECT
    'users' as permission_name,
    up.can_manage_users as has_access,
    up.organization_id,
    o.name as organization_name
  FROM public.user_permissions up
  LEFT JOIN public.organizations o ON o.id = up.organization_id
  WHERE up.user_id = p_user_id
  AND (up.expires_at IS NULL OR up.expires_at > now())

  UNION ALL

  SELECT
    'organizations' as permission_name,
    up.can_manage_organizations as has_access,
    up.organization_id,
    o.name as organization_name
  FROM public.user_permissions up
  LEFT JOIN public.organizations o ON o.id = up.organization_id
  WHERE up.user_id = p_user_id
  AND (up.expires_at IS NULL OR up.expires_at > now())

  UNION ALL

  SELECT
    'experts' as permission_name,
    up.can_manage_experts as has_access,
    up.organization_id,
    o.name as organization_name
  FROM public.user_permissions up
  LEFT JOIN public.organizations o ON o.id = up.organization_id
  WHERE up.user_id = p_user_id
  AND (up.expires_at IS NULL OR up.expires_at > now())

  UNION ALL

  SELECT
    'instructors' as permission_name,
    up.can_manage_instructors as has_access,
    up.organization_id,
    o.name as organization_name
  FROM public.user_permissions up
  LEFT JOIN public.organizations o ON o.id = up.organization_id
  WHERE up.user_id = p_user_id
  AND (up.expires_at IS NULL OR up.expires_at > now())

  UNION ALL

  SELECT
    'analytics' as permission_name,
    up.can_view_analytics as has_access,
    up.organization_id,
    o.name as organization_name
  FROM public.user_permissions up
  LEFT JOIN public.organizations o ON o.id = up.organization_id
  WHERE up.user_id = p_user_id
  AND (up.expires_at IS NULL OR up.expires_at > now())

  UNION ALL

  SELECT
    'payments' as permission_name,
    up.can_manage_payments as has_access,
    up.organization_id,
    o.name as organization_name
  FROM public.user_permissions up
  LEFT JOIN public.organizations o ON o.id = up.organization_id
  WHERE up.user_id = p_user_id
  AND (up.expires_at IS NULL OR up.expires_at > now())

  UNION ALL

  SELECT
    'platform_settings' as permission_name,
    up.can_manage_platform_settings as has_access,
    up.organization_id,
    o.name as organization_name
  FROM public.user_permissions up
  LEFT JOIN public.organizations o ON o.id = up.organization_id
  WHERE up.user_id = p_user_id
  AND (up.expires_at IS NULL OR up.expires_at > now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_permissions(UUID) IS 'Get all permissions for a user with organization context';

-- ============================================================
-- STEP 5: Enable RLS on user_permissions table
-- ============================================================

ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Users can view their own permissions
CREATE POLICY "Users can view own permissions"
  ON public.user_permissions
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all permissions
CREATE POLICY "Admins can view all permissions"
  ON public.user_permissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin_full')
    )
  );

-- Only HumanGlue admins can modify permissions
CREATE POLICY "Only HumanGlue admins can manage permissions"
  ON public.user_permissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============================================================
-- STEP 6: Update existing admin users (if any)
-- ============================================================

-- This will trigger the assign_default_permissions function for existing admins
UPDATE public.profiles
SET updated_at = now()
WHERE role = 'admin';

-- ============================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================
--
-- To rollback this migration:
--
-- DROP POLICY IF EXISTS "Only HumanGlue admins can manage permissions" ON public.user_permissions;
-- DROP POLICY IF EXISTS "Admins can view all permissions" ON public.user_permissions;
-- DROP POLICY IF EXISTS "Users can view own permissions" ON public.user_permissions;
-- DROP FUNCTION IF EXISTS get_user_permissions(UUID);
-- DROP FUNCTION IF EXISTS has_permission(UUID, TEXT, UUID);
-- DROP TRIGGER IF EXISTS trigger_assign_permissions ON public.profiles;
-- DROP FUNCTION IF EXISTS assign_default_permissions();
-- DROP TABLE IF EXISTS public.user_permissions CASCADE;
--
-- ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
-- ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
--   CHECK (role IN ('client', 'instructor', 'admin'));
