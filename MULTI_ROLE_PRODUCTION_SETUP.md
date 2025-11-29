# Multi-Role System - Production Setup Guide

## ✅ What's Already Done

The multi-role system is **fully implemented** and ready for production! Here's what has been completed:

### 1. Database Schema ✅
The database already supports multi-role functionality:
- **`user_roles` table** - Supports multiple roles per user with proper constraints
- **Database functions** - `has_role()` and `get_user_roles()` already exist
- **No migration needed** - The schema was designed for multi-role from the start!

### 2. Backend API ✅
All auth and profile APIs support multi-role:
- **[lib/api/auth.ts](lib/api/auth.ts)** - Updated with multi-role support:
  - `getUserRoles(userId)` - Returns all active roles for a user
  - `checkUserRole(userId, allowedRoles)` - Returns all roles + matching role
  - `getUserProfile(userId)` - Returns profile with role flags (`isAdmin`, `isInstructor`, etc.)
  - `hasAllRoles(userId, requiredRoles)` - Check if user has ALL specified roles
  - `hasAnyRole(userId, allowedRoles)` - Check if user has ANY of the roles

- **[app/api/user/profile/route.ts](app/api/user/profile/route.ts)** - Enhanced to return:
  - `activeRoles` - Array of all active role strings
  - `isAdmin` - Boolean flag
  - `isInstructor` - Boolean flag
  - `isExpert` - Boolean flag
  - `isClient` - Boolean flag

### 3. Middleware ✅
Route protection now supports multi-role:
- **[middleware.ts](middleware.ts)** - Fetches all active roles from `user_roles` table
- Checks role-based access for each portal
- Admins can access all portals
- Users can access any portal they have a role for

### 4. Frontend ✅
The UI adapts to multi-role users:
- **[components/organisms/DashboardSidebar.tsx](components/organisms/DashboardSidebar.tsx)** - Role switcher dropdown
- Automatic role detection from pathname
- Shows only relevant navigation for active role
- Displays role switcher when user has 2+ roles

---

## 🚀 Production Deployment Steps

### Step 1: Database - Assign Roles to Users

The `user_roles` table is already set up. You just need to add role records for your users.

**Option A: Using SQL (Supabase Dashboard)**

```sql
-- Example: Make a user both an instructor and a client
INSERT INTO public.user_roles (user_id, role)
VALUES
  ('user-uuid-here', 'instructor'),
  ('user-uuid-here', 'client')
ON CONFLICT (user_id, role, organization_id) DO NOTHING;

-- Example: Make a user an admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('user-uuid-here', 'admin')
ON CONFLICT (user_id, role, organization_id) DO NOTHING;

-- Example: Make a user have all roles (for testing)
INSERT INTO public.user_roles (user_id, role)
VALUES
  ('user-uuid-here', 'admin'),
  ('user-uuid-here', 'expert'),
  ('user-uuid-here', 'instructor'),
  ('user-uuid-here', 'client')
ON CONFLICT (user_id, role, organization_id) DO NOTHING;
```

**Option B: Using the API (programmatically)**

Create an admin endpoint to assign roles (recommended for production):

```typescript
// app/api/admin/users/[userId]/roles/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/api/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  // Only admins can assign roles
  await requireRole(['admin'])

  const { role } = await request.json()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_roles')
    .insert({
      user_id: params.userId,
      role: role,
    })
    .select()

  if (error) throw error

  return NextResponse.json({ success: true, data })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  // Only admins can remove roles
  await requireRole(['admin'])

  const { role } = await request.json()
  const supabase = await createClient()

  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', params.userId)
    .eq('role', role)

  if (error) throw error

  return NextResponse.json({ success: true })
}
```

### Step 2: Test Multi-Role Functionality

1. **Assign multiple roles to a test user**:
   ```sql
   -- Make yourself an instructor + client
   INSERT INTO public.user_roles (user_id, role)
   VALUES
     ('your-user-id', 'instructor'),
     ('your-user-id', 'client');
   ```

2. **Login and test the role switcher**:
   - You should see a dropdown between the logo and profile in the sidebar
   - The dropdown should show "Instructor Portal" and "Student Portal"
   - Click each to switch between portals
   - Verify the navigation changes for each role

3. **Test middleware protection**:
   - Try accessing `/admin` without admin role → Should redirect to `/dashboard`
   - Try accessing `/instructor/courses` without instructor role → Should redirect to `/dashboard`
   - Assign the role, then try again → Should work

### Step 3: Update Frontend to Use API

If you're currently using localStorage for user data, update to use the API:

**Before** (localStorage):
```typescript
const userData = JSON.parse(localStorage.getItem('humanglue_user') || '{}')
```

**After** (API):
```typescript
// Fetch user profile on app load
useEffect(() => {
  async function loadUser() {
    const response = await fetch('/api/user/profile')
    const { data } = await response.json()

    // data includes:
    // - activeRoles: string[]
    // - isAdmin: boolean
    // - isInstructor: boolean
    // - isExpert: boolean
    // - isClient: boolean

    setUserData(data)
  }
  loadUser()
}, [])
```

The `DashboardSidebar` component will automatically detect roles and show the role switcher!

### Step 4: Deploy to Production

1. **Commit all changes**:
   ```bash
   git add .
   git commit -m "Enable multi-role system in production"
   git push
   ```

2. **Deploy** (Netlify will auto-deploy on push)

3. **Verify in production**:
   - Login to your production site
   - Check the sidebar for role switcher
   - Test switching between portals
   - Verify middleware is protecting routes correctly

---

## 🧪 Testing Checklist

- [ ] Database has roles assigned to test users
- [ ] API endpoint `/api/user/profile` returns `activeRoles` and role flags
- [ ] Middleware logs show `Active roles:` array in console
- [ ] Sidebar shows role switcher dropdown for multi-role users
- [ ] Clicking role switcher navigates to correct portal
- [ ] Navigation items update based on active role
- [ ] Cart only shows in Student Portal (not in other portals)
- [ ] Middleware blocks unauthorized access to role-specific routes
- [ ] Admins can access all portals

---

## 📊 Example User Configurations

### Regular Student
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('user-id', 'client');
```
**Result**: No role switcher, just normal student dashboard

### Instructor who is also a Student
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES
  ('user-id', 'instructor'),
  ('user-id', 'client');
```
**Result**: Role switcher with 2 options (Instructor Portal, Student Portal)

### Expert Instructor
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES
  ('user-id', 'expert'),
  ('user-id', 'instructor'),
  ('user-id', 'client');
```
**Result**: Role switcher with 3 options

### Super Admin
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES
  ('user-id', 'admin'),
  ('user-id', 'expert'),
  ('user-id', 'instructor'),
  ('user-id', 'client');
```
**Result**: Role switcher with all 4 portals available

---

## 🔒 Security Notes

### Row Level Security (RLS)
The `user_roles` table already has RLS policies:
- ✅ Users can view their own roles
- ✅ Admins can view and manage all roles
- ✅ Role checks happen server-side in middleware

### Important Reminders
1. **Never trust client-side role flags** - Always verify on the server
2. **Middleware is your security layer** - It runs before page loads
3. **API endpoints use `requireRole()`** - Always check roles in API routes
4. **Role expiration is supported** - Use `expires_at` for temporary roles

---

## 🎯 Next Steps (Optional Enhancements)

### 1. Admin UI for Role Management
Create an admin page to assign/remove roles:
- List all users
- Show current roles for each user
- Add/remove roles with buttons
- View role assignment history

### 2. Role Assignment Audit Log
Track who assigned roles and when:
```sql
CREATE TABLE public.role_assignment_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  role TEXT NOT NULL,
  action TEXT CHECK (action IN ('assigned', 'removed')),
  assigned_by UUID REFERENCES public.users(id),
  assigned_at TIMESTAMPTZ DEFAULT now()
);
```

### 3. Temporary Role Assignments
Use the `expires_at` column to assign temporary roles:
```sql
-- Give instructor access for 30 days
INSERT INTO public.user_roles (user_id, role, expires_at)
VALUES (
  'user-id',
  'instructor',
  now() + interval '30 days'
);
```

### 4. Organization-Specific Roles
Use the `organization_id` column for org-scoped roles:
```sql
-- Make user an admin for specific organization
INSERT INTO public.user_roles (user_id, role, organization_id)
VALUES ('user-id', 'admin', 'org-id');
```

---

## 🆘 Troubleshooting

### Role switcher not showing
- Check browser console for logs: `[DashboardSidebar] availableRoles`
- Verify user has multiple roles in database
- Check API response from `/api/user/profile`

### Can't access a portal
- Check middleware logs: `[Middleware] Active roles:`
- Verify user has the required role in `user_roles` table
- Check role hasn't expired (`expires_at` column)

### Cart showing in wrong portal
- Verify `portalConfig.showCart` in console logs
- Check `currentActiveRole` matches the pathname
- Clear browser cache and hard refresh

---

## ✨ Summary

The multi-role system is **fully production-ready**! You just need to:

1. ✅ Assign roles in the `user_roles` table
2. ✅ Test with a multi-role user
3. ✅ Deploy to production
4. ✅ Enjoy seamless portal switching! 🚀

The system automatically handles:
- ✅ Multi-role detection
- ✅ Role-based navigation
- ✅ Secure route protection
- ✅ Smooth portal switching
- ✅ Role-specific features (cart, upgrade, etc.)
