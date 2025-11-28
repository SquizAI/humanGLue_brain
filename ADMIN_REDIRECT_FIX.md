# Admin Redirect Fix - Summary

## Problem
Admin users were being automatically redirected to the client dashboard instead of the admin dashboard.

## Root Cause
The middleware and authentication hooks were querying a **non-existent table** for user roles, causing role detection to fail and all users to default to 'client' role.

### Detailed Investigation

1. **Initial Issue**: Middleware was querying `profiles` table which doesn't exist
2. **Second Issue**: After fixing table name to `users`, code was still trying to query `user_roles` junction table (which also doesn't exist in production)
3. **Actual Schema**: Production database uses `001_multi_tenant_schema.sql` which has:
   - Direct `role` column on `users` table
   - ENUM type: `user_role` with values: `'admin', 'org_admin', 'team_lead', 'member'`
   - NO `user_roles` junction table

## Solution

Updated both [middleware.ts](middleware.ts) and [lib/auth/hooks.ts](lib/auth/hooks.ts) to:

1. Query `users.role` column directly (not a junction table)
2. Map database roles to application roles:
   - `role === 'admin'` → `appRole = 'admin'` (admin dashboard)
   - Has `instructor_profiles` record → `appRole = 'instructor'` (instructor dashboard)
   - `role === 'org_admin' | 'team_lead' | 'member'` → `appRole = 'client'` (client dashboard)

## Changes Made

### [middleware.ts:140-170](middleware.ts#L140-L170)
```typescript
// Fetch user profile with role from users table
const { data: profile } = await supabase
  .from('users')
  .select('role')
  .eq('id', user.id)
  .single()

// Check if user has instructor profile
const { data: instructorProfile } = await supabase
  .from('instructor_profiles')
  .select('id')
  .eq('user_id', user.id)
  .single()

// Determine application role based on users.role column
let appRole: 'admin' | 'instructor' | 'client' = 'client'
if (profile?.role === 'admin') {
  appRole = 'admin'
} else if (instructorProfile) {
  appRole = 'instructor'
} else if (profile?.role === 'org_admin' || profile?.role === 'team_lead') {
  appRole = 'client'
}
```

### [lib/auth/hooks.ts:58-84](lib/auth/hooks.ts#L58-L84)
```typescript
const getProfile = async (userId: string) => {
  // Fetch user profile from users table (has role column)
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  // Check if user has instructor profile
  const { data: instructorProfile } = await supabase
    .from('instructor_profiles')
    .select('id')
    .eq('user_id', userId)
    .single()

  return {
    ...(profile as UserProfile),
    is_instructor: !!instructorProfile,
  }
}
```

## Next Steps for User

1. **Verify the fix works** by logging in as admin
2. **If still redirecting to client dashboard**, check that your user account has:
   - A record in the `users` table with `role = 'admin'`
   - Can be verified in Supabase dashboard → Table Editor → users table
3. **Check middleware logs** in browser console (opens with F12):
   - Look for `[Middleware Profile]` logs showing your role
   - Look for `[Middleware] User accessing:` logs showing the detected app role

## Database Schema Note

There are **TWO conflicting migration 001 files** in the project:
- ✅ `001_multi_tenant_schema.sql` - Used in production (has `users.role` column)
- ❌ `001_create_users_and_roles.sql` - NOT used (has `user_roles` junction table)

The production database uses the multi-tenant schema with direct role column.

## Commits
- `6e48a4b` - Initial attempt using user_roles table (incorrect)
- `687564d` - Reverted to correct users.role column schema
- `8ffb903` - Fixed TypeScript error in UnifiedChatSystem component

## Deployment
- Pushed to GitHub: ✅
- Built successfully: ✅
- Deployed to Netlify: ✅
- Live at: https://hmnglue.com
