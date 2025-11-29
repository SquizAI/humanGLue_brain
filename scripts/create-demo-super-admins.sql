-- Script to create demo super admin users
-- Run this via Supabase SQL Editor

-- ============================================================
-- Create Super Admin Full Access User
-- ============================================================

-- Insert into auth.users (Supabase Auth)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'demo.superadmin.full@humanglue.com',
  crypt('SuperFull123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'demo.superadmin.full@humanglue.com'
);

-- Create profile with super_admin_full role
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
)
SELECT
  id,
  'demo.superadmin.full@humanglue.com',
  'Demo Super Admin (Full Access)',
  'super_admin_full',
  now(),
  now()
FROM auth.users
WHERE email = 'demo.superadmin.full@humanglue.com'
ON CONFLICT (id) DO UPDATE
SET
  role = 'super_admin_full',
  full_name = 'Demo Super Admin (Full Access)',
  updated_at = now();

-- ============================================================
-- Create Super Admin Courses Only User
-- ============================================================

-- Insert into auth.users (Supabase Auth)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'demo.superadmin.courses@humanglue.com',
  crypt('SuperCourses123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'demo.superadmin.courses@humanglue.com'
);

-- Create profile with super_admin_courses role
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
)
SELECT
  id,
  'demo.superadmin.courses@humanglue.com',
  'Demo Super Admin (Courses Only)',
  'super_admin_courses',
  now(),
  now()
FROM auth.users
WHERE email = 'demo.superadmin.courses@humanglue.com'
ON CONFLICT (id) DO UPDATE
SET
  role = 'super_admin_courses',
  full_name = 'Demo Super Admin (Courses Only)',
  updated_at = now();

-- ============================================================
-- Verify users were created
-- ============================================================

SELECT
  u.email,
  p.full_name,
  p.role,
  up.can_access_financials,
  up.can_manage_courses
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_permissions up ON up.user_id = u.id
WHERE u.email IN (
  'demo.superadmin.full@humanglue.com',
  'demo.superadmin.courses@humanglue.com'
)
ORDER BY u.email;
