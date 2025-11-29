-- Migration: 010_create_demo_super_admin_users.sql
-- Description: Create demo users for testing super admin roles
-- Dependencies: 008_admin_role_hierarchy.sql

-- ============================================================
-- STEP 1: Create demo super admin users in auth.users
-- ============================================================

-- Note: These are created using Supabase's SQL INSERT into auth.users
-- In production, use Supabase Auth API or Dashboard to create users

-- Super Admin Full Access (demo.superadmin.full@humanglue.com)
-- Password: SuperFull123!

-- Super Admin Courses Only (demo.superadmin.courses@humanglue.com)
-- Password: SuperCourses123!

-- ============================================================
-- STEP 2: Create corresponding profiles
-- ============================================================

-- Note: The actual user creation with passwords must be done via:
-- 1. Supabase Dashboard (recommended for demo users)
-- 2. Supabase Auth API
-- 3. supabase.auth.signUp() in client code

-- This migration will ONLY update existing users' roles
-- You must manually create these users first via Supabase Dashboard

-- Update super_admin_full user role (if exists)
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Find user by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'demo.superadmin.full@humanglue.com';

  IF v_user_id IS NOT NULL THEN
    -- Update profile role
    UPDATE public.profiles
    SET
      role = 'super_admin_full',
      updated_at = now()
    WHERE id = v_user_id;

    -- Permissions will be auto-assigned by trigger
    RAISE NOTICE 'Updated demo.superadmin.full@humanglue.com to super_admin_full role';
  ELSE
    RAISE NOTICE 'User demo.superadmin.full@humanglue.com does not exist yet - create via Supabase Dashboard';
  END IF;
END $$;

-- Update super_admin_courses user role (if exists)
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Find user by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'demo.superadmin.courses@humanglue.com';

  IF v_user_id IS NOT NULL THEN
    -- Update profile role
    UPDATE public.profiles
    SET
      role = 'super_admin_courses',
      updated_at = now()
    WHERE id = v_user_id;

    -- Permissions will be auto-assigned by trigger
    RAISE NOTICE 'Updated demo.superadmin.courses@humanglue.com to super_admin_courses role';
  ELSE
    RAISE NOTICE 'User demo.superadmin.courses@humanglue.com does not exist yet - create via Supabase Dashboard';
  END IF;
END $$;

-- ============================================================
-- STEP 3: Verify permissions were created
-- ============================================================

-- Check super_admin_full permissions
DO $$
DECLARE
  v_user_id UUID;
  v_has_financial_access BOOLEAN;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'demo.superadmin.full@humanglue.com';

  IF v_user_id IS NOT NULL THEN
    SELECT can_access_financials INTO v_has_financial_access
    FROM public.user_permissions
    WHERE user_id = v_user_id;

    IF v_has_financial_access THEN
      RAISE NOTICE 'demo.superadmin.full@humanglue.com has financial access ✓';
    ELSE
      RAISE WARNING 'demo.superadmin.full@humanglue.com does NOT have financial access';
    END IF;
  END IF;
END $$;

-- Check super_admin_courses permissions
DO $$
DECLARE
  v_user_id UUID;
  v_has_financial_access BOOLEAN;
  v_can_manage_courses BOOLEAN;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'demo.superadmin.courses@humanglue.com';

  IF v_user_id IS NOT NULL THEN
    SELECT can_access_financials, can_manage_courses
    INTO v_has_financial_access, v_can_manage_courses
    FROM public.user_permissions
    WHERE user_id = v_user_id;

    IF NOT v_has_financial_access AND v_can_manage_courses THEN
      RAISE NOTICE 'demo.superadmin.courses@humanglue.com has correct permissions (courses yes, financials no) ✓';
    ELSE
      RAISE WARNING 'demo.superadmin.courses@humanglue.com has incorrect permissions';
    END IF;
  END IF;
END $$;

-- ============================================================
-- MANUAL STEPS REQUIRED
-- ============================================================
--
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User" (or "Invite User")
-- 3. Create user: demo.superadmin.full@humanglue.com
--    Password: SuperFull123!
--    Auto-confirm: Yes
-- 4. Create user: demo.superadmin.courses@humanglue.com
--    Password: SuperCourses123!
--    Auto-confirm: Yes
-- 5. Run this migration to assign roles and permissions
--
-- OR use SQL (requires extension):
-- SELECT auth.create_user('demo.superadmin.full@humanglue.com', 'SuperFull123!');
-- SELECT auth.create_user('demo.superadmin.courses@humanglue.com', 'SuperCourses123!');
