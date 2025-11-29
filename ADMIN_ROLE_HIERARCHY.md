# Admin Role Hierarchy Documentation

## Overview

The HumanGlue platform implements a multi-tier admin role hierarchy with granular permissions to support different levels of administrative access and control.

## Role Structure

### 1. HumanGlue Admin (`admin`)
**Platform Administrator - Full Access**

- Complete platform-wide access
- Can manage all resources and settings
- Full financial access
- Can manage platform settings
- Can assign permissions to other admins

**Default Permissions:**
```typescript
{
  can_access_financials: true,
  can_manage_courses: true,
  can_manage_users: true,
  can_manage_organizations: true,
  can_manage_experts: true,
  can_manage_instructors: true,
  can_view_analytics: true,
  can_manage_payments: true,
  can_manage_platform_settings: true,
  organization_id: null  // Platform-wide
}
```

### 2. Super Admin Full (`super_admin_full`)
**Full Administrative Access (No Platform Settings)**

- Platform-wide access to all features
- Full financial access
- Can manage courses, users, experts, instructors
- Can manage organizations and analytics
- **Cannot** manage platform settings (reserved for HumanGlue admin)

**Default Permissions:**
```typescript
{
  can_access_financials: true,
  can_manage_courses: true,
  can_manage_users: true,
  can_manage_organizations: true,
  can_manage_experts: true,
  can_manage_instructors: true,
  can_view_analytics: true,
  can_manage_payments: true,
  can_manage_platform_settings: false,  // Reserved for HumanGlue admin
  organization_id: null  // Platform-wide
}
```

### 3. Super Admin Courses (`super_admin_courses`)
**Course Management Only - NO Financial Access**

- Can manage courses and curriculum
- Can manage experts and instructors
- Can manage users
- Can view non-financial analytics
- **NO** access to financial data, payments, or revenue reports
- **NO** access to organization management
- **NO** access to platform settings

**Default Permissions:**
```typescript
{
  can_access_financials: false,  // ❌ NO financial access
  can_manage_courses: true,
  can_manage_users: true,
  can_manage_organizations: false,
  can_manage_experts: true,
  can_manage_instructors: true,
  can_view_analytics: true,  // Non-financial only
  can_manage_payments: false,  // ❌ NO payment access
  can_manage_platform_settings: false,
  organization_id: null  // Platform-wide
}
```

### 4. Organization Admin (`org_admin`)
**Organization-Level Administrator**

- Scoped to specific organization
- Can manage users within their organization
- Can access financial data for their organization
- Can manage payments for their organization
- Can view analytics for their organization
- **Cannot** manage courses (platform-level feature)
- **Cannot** manage other organizations
- **Cannot** manage platform settings

**Default Permissions:**
```typescript
{
  can_access_financials: true,  // Org-scoped
  can_manage_courses: false,
  can_manage_users: true,  // Org-scoped
  can_manage_organizations: false,
  can_manage_experts: false,
  can_manage_instructors: false,
  can_view_analytics: true,  // Org-scoped
  can_manage_payments: true,  // Org-scoped
  can_manage_platform_settings: false,
  organization_id: '<org_id>'  // Specific organization
}
```

## User Types Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│                    HumanGlue Admin                      │
│              (Platform Administrator)                    │
│  ✓ Full Access  ✓ Financials  ✓ Platform Settings     │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
┌───────┴────────────┐              ┌────────┴────────────┐
│ Super Admin Full   │              │ Super Admin Courses │
│  ✓ Full Access     │              │  ✓ Course Mgmt      │
│  ✓ Financials      │              │  ❌ NO Financials   │
│  ❌ No Platform    │              │  ❌ No Platform     │
│     Settings       │              │     Settings        │
└────────────────────┘              └─────────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
┌───────┴────────────┐              ┌────────┴────────────┐
│  Organization      │              │   Enterprise        │
│  Admin             │              │   Users             │
│  (Org-scoped)      │              │   (Dashboard +      │
│  ✓ Org Financials  │              │    Role-based       │
│  ✓ Org Users       │              │    Views)           │
└────────────────────┘              └─────────────────────┘
        │                                     │
        └──────────────────┬──────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                  │                  │
┌───────┴────────┐  ┌──────┴──────┐  ┌───────┴────────┐
│  Instructor    │  │   Expert    │  │   B2C Client   │
│  (Portal)      │  │   (Portal)  │  │   (Dashboard)  │
└────────────────┘  └─────────────┘  └────────────────┘
```

## Permission System

### Database Schema

**`user_permissions` Table:**
```sql
CREATE TABLE public.user_permissions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),

  -- Permission flags
  can_access_financials BOOLEAN DEFAULT false,
  can_manage_courses BOOLEAN DEFAULT false,
  can_manage_users BOOLEAN DEFAULT false,
  can_manage_organizations BOOLEAN DEFAULT false,
  can_manage_experts BOOLEAN DEFAULT false,
  can_manage_instructors BOOLEAN DEFAULT false,
  can_view_analytics BOOLEAN DEFAULT false,
  can_manage_payments BOOLEAN DEFAULT false,
  can_manage_platform_settings BOOLEAN DEFAULT false,

  -- Organization context
  organization_id UUID REFERENCES organizations(id),

  -- Audit fields
  granted_by UUID,
  granted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  UNIQUE(user_id, organization_id)
);
```

### Permission Helper Functions

**Database Functions:**
```sql
-- Check if user has specific permission
has_permission(p_user_id UUID, p_permission TEXT, p_organization_id UUID)

-- Get all permissions for a user
get_user_permissions(p_user_id UUID)
```

**TypeScript Utilities (`lib/permissions.ts`):**
```typescript
// Check specific permission
await hasPermission(userId, 'financials')

// Check admin status
await isAdmin(userId)  // Any admin type
await isPlatformAdmin(userId)  // HumanGlue admin only
await hasFullAdminAccess(userId)  // Admin or super_admin_full

// Check specific capabilities
await canAccessFinancials(userId, organizationId?)
await canManageCourses(userId)
await canManageResource(userId, 'users' | 'organizations' | 'experts' | 'instructors')

// Get all permissions
const permissions = await getUserPermissions(userId)
```

## Authentication Flow

### Login Redirect Logic

```typescript
// app/api/auth/login/route.ts
if (profile.role === 'admin') {
  role = 'admin'
  redirectPath = '/admin'
}
else if (profile.role === 'super_admin_full' || profile.role === 'super_admin_courses') {
  role = 'super_admin'
  redirectPath = '/admin'
}
else if (instructorProfile) {
  role = 'instructor'
  redirectPath = '/instructor'
}
else if (expertProfile || profile.role === 'expert') {
  role = 'expert'
  redirectPath = '/expert'
}
else if (profile.role === 'org_admin') {
  role = 'org_admin'
  redirectPath = '/dashboard'  // Dashboard with elevated permissions
}
else {
  role = 'client'
  redirectPath = '/dashboard'
}
```

## Middleware Protection

### Route Access Rules

```typescript
// middleware.ts
const ROUTE_RULES = {
  public: ['/', '/login', '/signup', ...],
  admin: ['/admin'],  // Admin and Super Admin only
  instructor: ['/instructor'],
  expert: ['/expert'],
  authenticated: ['/dashboard', ...]  // Any authenticated user
}
```

### Access Control

1. **Admin Routes** (`/admin`)
   - Accessible by: `admin`, `super_admin_full`, `super_admin_courses`
   - Middleware checks `appRole === 'admin' || appRole === 'super_admin'`

2. **Instructor Routes** (`/instructor`)
   - Accessible by: Users with `instructor_profiles` entry

3. **Expert Routes** (`/expert`)
   - Accessible by: Users with `expert_profiles` entry

4. **Dashboard Routes** (`/dashboard`)
   - Accessible by: All authenticated users
   - **Enterprise users** see role-based views
   - **Org admins** see elevated features

## Implementation Examples

### Creating a Super Admin (Courses Only)

```sql
-- 1. Update user role
UPDATE profiles
SET role = 'super_admin_courses'
WHERE email = 'courseadmin@example.com';

-- 2. Permissions are auto-assigned via trigger
-- Verify permissions:
SELECT * FROM get_user_permissions(
  (SELECT id FROM profiles WHERE email = 'courseadmin@example.com')
);
```

### Checking Financial Access in Code

```typescript
import { canAccessFinancials } from '@/lib/permissions'

// In a server component or API route
const userId = 'user-uuid-here'
const canViewFinancials = await canAccessFinancials(userId)

if (!canViewFinancials) {
  // Hide financial sections
  return <div>Access Denied</div>
}
```

### Conditional UI Rendering

```typescript
import { getUserPermissions } from '@/lib/permissions'

export default async function AdminDashboard() {
  const userId = 'current-user-id'
  const permissions = await getUserPermissions(userId)

  const canViewFinancials = permissions.find(
    p => p.permission_name === 'financials'
  )?.has_access

  return (
    <div>
      {canViewFinancials && (
        <FinancialReports />
      )}
      <CourseManagement />
    </div>
  )
}
```

## Security Considerations

### Row Level Security (RLS)

```sql
-- Only HumanGlue admins can modify permissions
CREATE POLICY "Only HumanGlue admins can manage permissions"
  ON user_permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can view their own permissions
CREATE POLICY "Users can view own permissions"
  ON user_permissions FOR SELECT
  USING (user_id = auth.uid());
```

### Best Practices

1. **Always check permissions server-side**
   - Never trust client-side permission checks alone
   - Use middleware + database RLS for defense in depth

2. **Use permission helpers**
   - Prefer `canAccessFinancials()` over direct role checks
   - Makes permission logic consistent across the app

3. **Audit permission changes**
   - `granted_by` and `granted_at` fields track who granted permissions
   - Review permission changes regularly

4. **Expire temporary permissions**
   - Use `expires_at` for time-limited elevated access
   - Automatically enforced by permission check functions

## Migration Notes

### Updating Existing Admins

The migration automatically triggers permission assignment for existing admins:

```sql
-- In migration 008_admin_role_hierarchy.sql
UPDATE public.profiles
SET updated_at = now()
WHERE role = 'admin';
-- This triggers assign_default_permissions() function
```

### Adding New Admin Roles

To promote a user to super admin:

```sql
UPDATE profiles
SET role = 'super_admin_full'  -- or 'super_admin_courses'
WHERE id = 'user-uuid';
-- Permissions auto-assigned via trigger
```

## Testing

### Test User Accounts

Create test users for each role:

```sql
-- Super Admin Full
INSERT INTO auth.users (email, ...) VALUES ('superadmin.full@test.com', ...);
UPDATE profiles SET role = 'super_admin_full' WHERE email = 'superadmin.full@test.com';

-- Super Admin Courses
INSERT INTO auth.users (email, ...) VALUES ('superadmin.courses@test.com', ...);
UPDATE profiles SET role = 'super_admin_courses' WHERE email = 'superadmin.courses@test.com';

-- Org Admin
INSERT INTO auth.users (email, ...) VALUES ('orgadmin@test.com', ...);
UPDATE profiles SET role = 'org_admin' WHERE email = 'orgadmin@test.com';
UPDATE user_permissions
SET organization_id = '<test-org-id>'
WHERE user_id = (SELECT id FROM profiles WHERE email = 'orgadmin@test.com');
```

### Verification Queries

```sql
-- Check user's role and permissions
SELECT
  p.email,
  p.role,
  up.can_access_financials,
  up.can_manage_courses,
  up.can_manage_platform_settings
FROM profiles p
LEFT JOIN user_permissions up ON up.user_id = p.id
WHERE p.email = 'user@example.com';

-- List all admins and their permissions
SELECT
  p.email,
  p.role,
  up.can_access_financials,
  up.can_manage_courses
FROM profiles p
LEFT JOIN user_permissions up ON up.user_id = p.id
WHERE p.role IN ('admin', 'super_admin_full', 'super_admin_courses', 'org_admin')
ORDER BY
  CASE p.role
    WHEN 'admin' THEN 1
    WHEN 'super_admin_full' THEN 2
    WHEN 'super_admin_courses' THEN 3
    WHEN 'org_admin' THEN 4
  END;
```

## Future Enhancements

1. **Custom Permission Sets**
   - Use `custom_permissions` JSONB field for additional granular controls

2. **Time-based Access**
   - Leverage `expires_at` for temporary elevated permissions
   - Auto-revoke via scheduled job

3. **Delegation**
   - Allow super admins to delegate specific permissions
   - Track delegation chain via `granted_by`

4. **Audit Logging**
   - Log all permission checks and changes
   - Create separate audit table for compliance

5. **Role Templates**
   - Pre-defined permission sets for common roles
   - Quick assignment for new admin users
