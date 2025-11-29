-- Migration: 011_setup_matty_super_admin.sql
-- Description: Set up matty@lhumanglue.ai as real super admin with all roles
-- Dependencies: 001_create_users_and_roles.sql, 008_admin_role_hierarchy.sql

-- ============================================================
-- SETUP MATTY AS SUPER ADMIN WITH ALL ROLES
-- ============================================================

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Find matty's user ID by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'matty@lhumanglue.ai';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User matty@lhumanglue.ai does not exist. Please create the account first via Supabase Dashboard.';
  END IF;

  RAISE NOTICE 'Found user matty@lhumanglue.ai with ID: %', v_user_id;

  -- ============================================================
  -- STEP 1: Ensure user profile exists in users table
  -- ============================================================

  INSERT INTO public.users (
    id,
    email,
    full_name,
    status,
    email_verified,
    created_at,
    updated_at
  )
  VALUES (
    v_user_id,
    'matty@lhumanglue.ai',
    'Matty Squarzoni',
    'active',
    true,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = 'Matty Squarzoni',
    email = 'matty@lhumanglue.ai',
    status = 'active',
    email_verified = true,
    updated_at = now();

  RAISE NOTICE 'Created/updated user profile for matty@lhumanglue.ai';

  -- ============================================================
  -- STEP 2: Assign ALL roles (admin, expert, instructor, client)
  -- ============================================================

  -- Clear existing roles first
  DELETE FROM public.user_roles WHERE user_id = v_user_id;

  -- Assign admin role
  INSERT INTO public.user_roles (user_id, role, granted_at)
  VALUES (v_user_id, 'admin', now());
  RAISE NOTICE 'Assigned admin role';

  -- Assign expert role
  INSERT INTO public.user_roles (user_id, role, granted_at)
  VALUES (v_user_id, 'expert', now());
  RAISE NOTICE 'Assigned expert role';

  -- Assign instructor role
  INSERT INTO public.user_roles (user_id, role, granted_at)
  VALUES (v_user_id, 'instructor', now());
  RAISE NOTICE 'Assigned instructor role';

  -- Assign client role
  INSERT INTO public.user_roles (user_id, role, granted_at)
  VALUES (v_user_id, 'client', now());
  RAISE NOTICE 'Assigned client role';

  -- ============================================================
  -- STEP 3: Create instructor profile (if needed for instructor portal)
  -- ============================================================

  INSERT INTO public.instructor_profiles (
    user_id,
    bio,
    specialties,
    created_at,
    updated_at
  )
  VALUES (
    v_user_id,
    'Super Admin - Full platform access',
    ARRAY['Platform Administration', 'All Features'],
    now(),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    bio = 'Super Admin - Full platform access',
    specialties = ARRAY['Platform Administration', 'All Features'],
    updated_at = now();

  RAISE NOTICE 'Created/updated instructor profile';

  -- ============================================================
  -- STEP 4: Create expert profile (if needed for expert portal)
  -- ============================================================

  INSERT INTO public.expert_profiles (
    user_id,
    tagline,
    bio,
    specialties,
    created_at,
    updated_at
  )
  VALUES (
    v_user_id,
    'Platform Super Administrator',
    'Full administrative access to all platform features and data',
    ARRAY['Platform Administration', 'All Features'],
    now(),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    tagline = 'Platform Super Administrator',
    bio = 'Full administrative access to all platform features and data',
    specialties = ARRAY['Platform Administration', 'All Features'],
    updated_at = now();

  RAISE NOTICE 'Created/updated expert profile';

  -- ============================================================
  -- STEP 5: Set up user permissions (if user_permissions table exists)
  -- ============================================================

  -- Check if user_permissions table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_permissions') THEN
    INSERT INTO public.user_permissions (
      user_id,
      can_access_financials,
      can_manage_courses,
      can_manage_users,
      can_manage_content,
      created_at,
      updated_at
    )
    VALUES (
      v_user_id,
      true,  -- Full financial access
      true,  -- Full course management
      true,  -- Full user management
      true,  -- Full content management
      now(),
      now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      can_access_financials = true,
      can_manage_courses = true,
      can_manage_users = true,
      can_manage_content = true,
      updated_at = now();

    RAISE NOTICE 'Created/updated user permissions with full access';
  END IF;

  -- ============================================================
  -- VERIFICATION
  -- ============================================================

  RAISE NOTICE '✅ Successfully set up matty@lhumanglue.ai as super admin';
  RAISE NOTICE '✅ Roles assigned: admin, expert, instructor, client';
  RAISE NOTICE '✅ Can access all portals and features';
  RAISE NOTICE '✅ Has full permissions for real data management';

END $$;

-- ============================================================
-- VERIFY ROLE ASSIGNMENTS
-- ============================================================

SELECT
  u.email,
  u.full_name,
  array_agg(ur.role ORDER BY ur.role) as roles
FROM public.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'matty@lhumanglue.ai'
GROUP BY u.email, u.full_name;
