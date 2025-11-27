# Multi-Tenant Authentication & Routing Audit

**Generated:** 2025-01-27
**Purpose:** Complete audit of role hierarchy, RBAC, routes, and multi-tenant architecture

---

## 🔴 CRITICAL ISSUES FOUND

### 1. Schema Mismatch: Missing `profiles` Table
**Location:** [middleware.ts:140-144](middleware.ts#L140-L144)
**Severity:** CRITICAL
**Status:** 🔴 BLOCKING

**Problem:**
- Middleware queries `profiles` table which doesn't exist in schema migrations
- Actual table is `users` (from [001_multi_tenant_schema.sql](supabase/migrations/001_multi_tenant_schema.sql))
- Client-side `useAuth()` hook also references non-existent `profiles` table

**Impact:**
- Role-based access control is broken
- Middleware cannot determine user roles
- Database queries will fail in production

**Fix Required:**
```typescript
// Current (BROKEN):
const { data: profile } = await supabase
  .from('profiles')  // ❌ Table doesn't exist
  .select('role')
  .eq('id', user.id)
  .single()

// Should be:
const { data: user } = await supabase
  .from('users')     // ✅ Actual table name
  .select('role')
  .eq('id', user.id)
  .single()
```

### 2. Conflicting Role Systems
**Severity:** HIGH
**Status:** 🟡 NEEDS DECISION

**Two competing role systems exist:**

**System A: `users` table** ([001_multi_tenant_schema.sql](supabase/migrations/001_multi_tenant_schema.sql:103-108))
- Single `role` column per user
- Roles: `admin`, `org_admin`, `team_lead`, `member`
- Direct column on users table

**System B: `user_roles` table** ([001_create_users_and_roles.sql](supabase/migrations/001_create_users_and_roles.sql:45-66))
- Separate RBAC table
- Roles: `admin`, `instructor`, `expert`, `client`, `user`
- Supports multiple roles per user
- Organization context support

**Current Middleware Uses:** Neither correctly!
**Middleware Application Roles:** `admin`, `instructor`, `client`

**Decision Needed:**
1. Which system is the source of truth?
2. Migrate to single unified role system
3. Update middleware to use correct table

---

## 📊 DATABASE SCHEMA OVERVIEW

### Core Tables

#### users (from multi_tenant_schema)
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'member',  -- ⚠️ Hardcoded roles
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT now()
)
```

**Supported Roles:**
- `admin` - Platform superuser
- `org_admin` - Organization administrator
- `team_lead` - Team leader within organization
- `member` - Regular organization member

#### user_roles (from create_users_and_roles)
```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  role TEXT CHECK (role IN ('admin', 'instructor', 'expert', 'client', 'user')),
  organization_id UUID REFERENCES organizations(id),
  granted_by UUID REFERENCES users(id),
  expires_at TIMESTAMPTZ
)
```

**Supported Roles:**
- `admin` - System administrator
- `instructor` - Course/workshop instructor
- `expert` - Subject matter expert
- `client` - Paying customer
- `user` - Generic user

#### instructor_profiles
```sql
CREATE TABLE instructor_profiles (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES users(id),
  bio TEXT NOT NULL,
  professional_title TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false
)
```

**Purpose:** Extended instructor information
**Current Usage:** Middleware checks existence to determine instructor status

#### organizations
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  subscription_tier TEXT DEFAULT 'starter',
  subscription_status TEXT DEFAULT 'active'
)
```

**Subscription Tiers:**
- `starter` - Basic features
- `growth` - Enhanced features
- `enterprise` - Full platform access

---

## 🔐 CURRENT RBAC IMPLEMENTATION

### Middleware Logic
**File:** [middleware.ts](middleware.ts)
**Lines:** 160-191

```typescript
// Simplified flow:
1. Get user from Supabase auth
2. Query profiles table (❌ DOESN'T EXIST)
3. Check instructor_profiles table
4. Map to application role: admin | instructor | client
5. Enforce route access based on role
```

### Application Role Mapping

| Database State | Application Role |
|----------------|------------------|
| `profile.role === 'admin'` | `admin` |
| `instructor_profiles` exists | `instructor` |
| Neither of above | `client` |

**Issues:**
- ❌ `profiles` table doesn't exist
- ❌ No support for `org_admin`, `team_lead`, `member` roles
- ❌ No support for `expert`, `client`, `user` roles from user_roles table
- ❌ Instructor status only checks table existence, not role

---

## 🗺️ ROUTE MAPPING

### Admin Dashboard Routes
**Base:** `/admin`
**Total Routes:** 17
**Protection:** Middleware checks `appRole === 'admin'`

| Route | Purpose | Status |
|-------|---------|--------|
| `/admin` | Dashboard overview | ✅ Protected |
| `/admin/activity` | System activity logs | ✅ Protected |
| `/admin/analytics` | Platform analytics | ✅ Protected |
| `/admin/assessments` | AI assessment management | ✅ Protected |
| `/admin/content` | Content management | ✅ Protected |
| `/admin/courses` | Course catalog admin | ✅ Protected |
| `/admin/courses/new` | Create new course | ✅ Protected |
| `/admin/database` | Database management | ✅ Protected |
| `/admin/experts` | Expert directory admin | ✅ Protected |
| `/admin/experts/new` | Add new expert | ✅ Protected |
| `/admin/organizations` | Organization management | ✅ Protected |
| `/admin/payments` | Payment processing | ✅ Protected |
| `/admin/reports` | System reports | ✅ Protected |
| `/admin/services` | Service configuration | ✅ Protected |
| `/admin/settings` | Platform settings | ✅ Protected |
| `/admin/users` | User management | ✅ Protected |
| `/admin/workshops` | Workshop management | ✅ Protected |

**Breadcrumb Pattern:**
```
Admin Dashboard > [Section] > [Subsection]
```

### Instructor Dashboard Routes
**Base:** `/instructor`
**Total Routes:** 9
**Protection:** Middleware checks `appRole === 'instructor' || appRole === 'admin'`

| Route | Purpose | Status |
|-------|---------|--------|
| `/instructor` | Instructor overview | ✅ Protected |
| `/instructor/analytics` | Teaching analytics | ✅ Protected |
| `/instructor/courses` | Course management | ✅ Protected |
| `/instructor/courses/new` | Create course | ✅ Protected |
| `/instructor/profile` | Instructor profile | ✅ Protected |
| `/instructor/settings` | Instructor settings | ✅ Protected |
| `/instructor/students` | Student management | ✅ Protected |
| `/instructor/workshops` | Workshop management | ✅ Protected |
| `/instructor/workshops/new` | Create workshop | ✅ Protected |

**Breadcrumb Pattern:**
```
Instructor Dashboard > [Section]
```

### Client Dashboard Routes
**Base:** `/dashboard`
**Total Routes:** 29
**Protection:** Middleware allows any authenticated user

| Route | Purpose | Status |
|-------|---------|--------|
| `/dashboard` | Client overview | ✅ Protected |
| `/dashboard/account` | Account management | ✅ Protected |
| `/dashboard/analytics` | Personal analytics | ✅ Protected |
| `/dashboard/assessments` | AI assessments | ✅ Protected |
| `/dashboard/assessments/[id]` | View assessment | ✅ Protected |
| `/dashboard/assessments/new` | New assessment | ✅ Protected |
| `/dashboard/cbts` | Competency-based training | ✅ Protected |
| `/dashboard/cbts/[id]` | CBT details | ✅ Protected |
| `/dashboard/learning` | Learning path | ✅ Protected |
| `/dashboard/learning/[id]` | Course details | ✅ Protected |
| `/dashboard/meetings` | Scheduled meetings | ✅ Protected |
| `/dashboard/profile` | User profile | ✅ Protected |
| `/dashboard/resources` | Resource library | ✅ Protected |
| `/dashboard/resources/[id]` | Resource details | ✅ Protected |
| `/dashboard/saved` | Saved items | ✅ Protected |
| `/dashboard/settings` | User settings | ✅ Protected |
| `/dashboard/talent` | Talent marketplace | ✅ Protected |
| `/dashboard/talent/[id]` | Talent profile | ✅ Protected |
| `/dashboard/talent/courses` | Browse courses | ✅ Protected |
| `/dashboard/talent/instructors` | Browse instructors | ✅ Protected |
| `/dashboard/talent/library` | Content library | ✅ Protected |
| `/dashboard/team` | Team management | ✅ Protected |
| `/dashboard/workflows` | Workflow automation | ✅ Protected |
| `/dashboard/workflows/[id]` | Workflow details | ✅ Protected |
| `/dashboard/workshops` | Workshop enrollment | ✅ Protected |
| `/dashboard/workshops/[id]` | Workshop details | ✅ Protected |

**Breadcrumb Pattern:**
```
Dashboard > [Section] > [Item]
```

**⚠️ Issue:** No role-based restrictions within client dashboard - all routes accessible to any authenticated user

---

## 🏢 MULTI-TENANT ARCHITECTURE

### Organization Isolation

**Current Implementation:**
- `organization_id` column on users table
- `organization_id` column on courses, workshops, user_roles

**RLS Policies:**

```sql
-- Organization members can only view their org
CREATE POLICY "Organization members can view their org"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM user_roles
      WHERE user_id = auth.uid()
    )
  );
```

**Multi-Tenant Features:**
- ✅ Organization-scoped users
- ✅ Organization-scoped courses
- ✅ Organization-scoped workshops
- ✅ RLS policies enforce data isolation
- ❌ No tenant isolation in middleware
- ❌ No organization context in session
- ❌ Cross-organization data leakage possible

### Subscription Tiers

| Tier | Features | Pricing |
|------|----------|---------|
| Starter | Basic platform access | Entry-level |
| Growth | Enhanced features | Mid-tier |
| Enterprise | Full platform, custom features | Custom |

**Tier Enforcement:** ❌ Not implemented in middleware or client

---

## 🔄 AUTHENTICATION FLOW

### Current Flow

```
1. User visits protected route
   ↓
2. Middleware runs
   ↓
3. Check Supabase session (httpOnly cookies)
   ↓
4. If no session → Redirect to /login
   ↓
5. If session exists → Query profiles table (❌ FAILS)
   ↓
6. Query instructor_profiles table
   ↓
7. Determine app role
   ↓
8. Check route access
   ↓
9. Allow or redirect
```

### Login Flow
**Entry Points:**
- `/login` - Standard login
- `/signup` - New user registration
- `/reset-password` - Password reset

**Post-Login Redirects:**
```typescript
// Current middleware logic:
if (user && authPages.includes(pathname)) {
  return redirectToDashboard() // ❌ Always redirects to /dashboard
}
```

**Issues:**
- ❌ No role-based redirect (admin should go to /admin, instructor to /instructor)
- ❌ No return URL support after login
- ❌ No organization context established

### Logout Flow
**File:** [app/api/auth/logout/route.ts](app/api/auth/logout/route.ts)
**Status:** ✅ Fixed (uses cookie collection pattern)

```typescript
// Properly clears Supabase session cookies
await supabase.auth.signOut()
// Cookies cleared via collection pattern
```

---

## 🔍 CLIENT-SIDE AUTH

### useAuth Hook
**File:** [lib/auth/hooks.ts](lib/auth/hooks.ts)
**Lines:** 35-158

**Current Implementation:**
```typescript
// Tries to read httpOnly cookies (CAN'T ACCESS)
const { data: { session } } = await supabase.auth.getSession()

// Queries non-existent profiles table
const { data: profile } = await supabase
  .from('profiles')  // ❌ DOESN'T EXIST
  .select('*')
  .eq('id', userId)
  .single()
```

**Timeout Mechanism:**
- 5-second max timeout prevents infinite loading
- Trusts middleware protection
- Client-side state sync is "best effort"

**Issues:**
- ❌ Queries non-existent `profiles` table
- ❌ Can't read server-side httpOnly cookies
- ⚠️ Relies on timeout fallback

---

## 🚨 PRIORITY FIXES REQUIRED

### P0 - Blocking Issues

1. **Fix Schema Mismatch**
   - [ ] Rename `users` table to `profiles` OR
   - [ ] Update all queries from `profiles` to `users`
   - [ ] Update TypeScript types in [lib/auth/hooks.ts:12-21](lib/auth/hooks.ts#L12-L21)

2. **Choose Single Role System**
   - [ ] Decide: `users.role` vs `user_roles` table
   - [ ] Migrate to chosen system
   - [ ] Update middleware role checks
   - [ ] Update RLS policies

3. **Fix Middleware Role Detection**
   - [ ] Correct table name
   - [ ] Support all role types
   - [ ] Handle missing roles gracefully

### P1 - High Priority

4. **Implement Role-Based Redirects**
   - [ ] Admin users → `/admin` after login
   - [ ] Instructors → `/instructor` after login
   - [ ] Clients → `/dashboard` after login
   - [ ] Support return URL parameter

5. **Add Organization Context**
   - [ ] Store organization_id in session
   - [ ] Enforce organization isolation in middleware
   - [ ] Add organization switcher for multi-org users

6. **Fix Client Dashboard Access**
   - [ ] Add role checks for sensitive routes
   - [ ] Implement team management permissions
   - [ ] Add organization-admin only routes

### P2 - Medium Priority

7. **Add Breadcrumb Navigation**
   - [ ] Implement breadcrumb component
   - [ ] Add to all dashboard layouts
   - [ ] Support dynamic route segments

8. **Improve Error Handling**
   - [ ] Handle missing profiles gracefully
   - [ ] Better error messages for auth failures
   - [ ] Redirect to error page vs infinite spinner

9. **Add Audit Logging**
   - [ ] Log role changes
   - [ ] Log access denied events
   - [ ] Log organization switches

---

## 📝 RECOMMENDED ARCHITECTURE

### Unified Role System Proposal

```typescript
// Single source of truth
interface User {
  id: string
  email: string
  full_name: string

  // Primary role
  role: 'platform_admin' | 'org_admin' | 'instructor' | 'client'

  // Organization context
  organization_id?: string

  // Additional capabilities
  capabilities: string[] // ['manage_users', 'create_courses', etc.]
}

// Middleware role mapping
const ROLE_HIERARCHY = {
  platform_admin: ['admin', 'instructor', 'client'],  // Can access all
  org_admin: ['instructor', 'client'],                 // Can access org features
  instructor: ['client'],                               // Can access client features
  client: []                                            // Only client features
}
```

### Route Protection Strategy

```typescript
// Route configuration
const ROUTES = {
  '/admin/*': {
    allowedRoles: ['platform_admin'],
    requireOrg: false
  },
  '/instructor/*': {
    allowedRoles: ['platform_admin', 'instructor'],
    requireOrg: false
  },
  '/dashboard/team/*': {
    allowedRoles: ['platform_admin', 'org_admin'],
    requireOrg: true
  },
  '/dashboard/*': {
    allowedRoles: ['platform_admin', 'org_admin', 'instructor', 'client'],
    requireOrg: false
  }
}
```

---

## ✅ VALIDATION CHECKLIST

### Schema Validation
- [ ] All tables referenced in code exist in migrations
- [ ] All columns referenced in queries exist
- [ ] Enum types match between schema and code
- [ ] Foreign keys properly defined
- [ ] RLS policies cover all tables

### RBAC Validation
- [ ] All user roles defined in single location
- [ ] Middleware checks correct table/column
- [ ] Role hierarchy properly enforced
- [ ] No hardcoded role strings (use enums)
- [ ] Admin can access all features

### Route Validation
- [ ] All routes listed in middleware config
- [ ] Route protection matches requirements
- [ ] Breadcrumbs implemented on all pages
- [ ] Navigation works between all pages
- [ ] No orphaned routes

### Multi-Tenant Validation
- [ ] Organization isolation enforced in RLS
- [ ] Organization context in session
- [ ] No cross-organization data leakage
- [ ] Subscription tier enforcement
- [ ] Organization switcher for multi-org users

### Auth Flow Validation
- [ ] Login redirects to correct dashboard
- [ ] Logout clears all session data
- [ ] Session refresh works
- [ ] Auth errors handled gracefully
- [ ] Return URL support

---

## 📚 FILES REFERENCE

### Core Files
- [middleware.ts](middleware.ts) - Route protection and RBAC
- [lib/auth/hooks.ts](lib/auth/hooks.ts) - Client-side auth hooks
- [lib/auth/server.ts](lib/auth/server.ts) - Server-side auth helpers
- [lib/supabase/server.ts](lib/supabase/server.ts) - Supabase server client
- [lib/supabase/client.ts](lib/supabase/client.ts) - Supabase client

### Schema Files
- [supabase/migrations/001_multi_tenant_schema.sql](supabase/migrations/001_multi_tenant_schema.sql)
- [supabase/migrations/001_create_users_and_roles.sql](supabase/migrations/001_create_users_and_roles.sql)
- [supabase/migrations/002_instructor_schema.sql](supabase/migrations/002_instructor_schema.sql)

### Dashboard Pages
- [app/admin/page.tsx](app/admin/page.tsx)
- [app/instructor/page.tsx](app/instructor/page.tsx)
- [app/dashboard/page.tsx](app/dashboard/page.tsx)

---

**Last Updated:** 2025-01-27
**Next Review:** After P0 fixes implemented
