# Setup Matty as Super Admin

This guide will set up `matty@lhumanglue.ai` as a **real super admin** with full access to all portals and real live data (not demo data).

## 🎯 What This Does

Sets up matty@lhumanglue.ai with:
- ✅ **Admin role** - Full platform administration
- ✅ **Expert role** - Access to expert portal
- ✅ **Instructor role** - Access to instructor portal
- ✅ **Client role** - Access to student portal
- ✅ **Full permissions** - Access to real data, not demo data
- ✅ **Role switcher** - Switch between all 4 portals seamlessly

---

## 🚀 Quick Setup (Recommended)

### Option 1: Using Supabase CLI

```bash
# From project root
./scripts/setup-matty-admin.sh
```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the entire content of [supabase/migrations/011_setup_matty_super_admin.sql](supabase/migrations/011_setup_matty_super_admin.sql)
4. Click **Run**
5. Look for success messages in the output

---

## 📋 Manual SQL Setup (Alternative)

If you prefer to run SQL commands directly:

```sql
-- 1. Find matty's user ID
SELECT id, email FROM auth.users WHERE email = 'matty@lhumanglue.ai';

-- 2. Assign all roles (replace YOUR_USER_ID with the ID from step 1)
INSERT INTO public.user_roles (user_id, role, granted_at)
VALUES
  ('YOUR_USER_ID', 'admin', now()),
  ('YOUR_USER_ID', 'expert', now()),
  ('YOUR_USER_ID', 'instructor', now()),
  ('YOUR_USER_ID', 'client', now())
ON CONFLICT (user_id, role, organization_id) DO NOTHING;

-- 3. Verify roles were assigned
SELECT
  u.email,
  array_agg(ur.role ORDER BY ur.role) as roles
FROM public.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'matty@lhumanglue.ai'
GROUP BY u.email;
```

---

## ✅ Verification

After running the setup, verify it worked:

### 1. Check Database Roles
```sql
SELECT
  u.email,
  u.full_name,
  array_agg(ur.role ORDER BY ur.role) as roles
FROM public.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'matty@lhumanglue.ai'
GROUP BY u.email, u.full_name;
```

Expected output:
```
email               | full_name        | roles
--------------------|------------------|----------------------------------
matty@lhumanglue.ai | Matty Squarzoni | {admin,client,expert,instructor}
```

### 2. Test Login

1. **Login** to the platform as matty@lhumanglue.ai
2. **Look for role switcher** in the sidebar (between logo and profile)
3. **Click the dropdown** - you should see all 4 portals:
   - ✅ Admin Portal
   - ✅ Expert Portal
   - ✅ Instructor Portal
   - ✅ Student Portal
4. **Switch between portals** - each should show different navigation and features
5. **Verify real data** - You should see actual data, not demo data

---

## 🔐 What Changed from Demo Mode

| Feature | Before (Demo) | After (Real Admin) |
|---------|--------------|-------------------|
| **Data Source** | Hardcoded demo data | Real database data |
| **Roles** | Client-side simulation | Database-backed roles |
| **Permissions** | UI-only checks | Server-side enforcement |
| **Portal Access** | Anyone can access | Role-based restrictions |
| **Role Management** | N/A | Can assign roles to other users |
| **Middleware** | Allows all access | Enforces role requirements |

---

## 🎯 Next Steps - Managing Other Users

Now that you're a super admin, you can assign roles to other users:

### Via SQL (Quick)
```sql
-- Example: Make someone an instructor
INSERT INTO public.user_roles (user_id, role)
VALUES ('their-user-id', 'instructor');

-- Example: Make someone both instructor and client
INSERT INTO public.user_roles (user_id, role)
VALUES
  ('their-user-id', 'instructor'),
  ('their-user-id', 'client');
```

### Via Admin UI (Recommended - Coming Soon)
Create an admin page at `/admin/users` to:
- List all users
- View their current roles
- Add/remove roles with buttons
- See role assignment history

Example admin UI code:
```typescript
// app/admin/users/page.tsx
export default async function AdminUsersPage() {
  const users = await fetchAllUsers()

  return (
    <div>
      <h1>User Management</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Roles</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.roles.join(', ')}</td>
              <td>
                <button onClick={() => addRole(user.id, 'instructor')}>
                  Add Instructor
                </button>
                <button onClick={() => removeRole(user.id, 'instructor')}>
                  Remove Instructor
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

---

## 🐛 Troubleshooting

### "User matty@lhumanglue.ai does not exist"
- Create the account via Supabase Dashboard first
- Or use Supabase Auth API to create the user
- Then run the migration again

### Role switcher not showing
- Clear browser cache (Cmd+Shift+R)
- Check browser console for logs: `[DashboardSidebar] availableRoles`
- Verify API response from `/api/user/profile` includes role flags

### Can't access a portal
- Check middleware logs: `[Middleware] Active roles:`
- Verify roles in database with SQL query above
- Make sure you're logged in as matty@lhumanglue.ai

### Still seeing demo data
- Check that you're not in demo mode
- Verify API endpoints are hitting real database
- Clear localStorage and login again

---

## 📚 Related Documentation

- [MULTI_ROLE_SYSTEM.md](MULTI_ROLE_SYSTEM.md) - Technical documentation
- [MULTI_ROLE_PRODUCTION_SETUP.md](MULTI_ROLE_PRODUCTION_SETUP.md) - Production deployment guide
- [scripts/test-multi-role.js](scripts/test-multi-role.js) - Browser testing helper

---

## ✨ Summary

You're now set up as a **real super admin** with:
- ✅ Access to all 4 portals (Admin, Expert, Instructor, Student)
- ✅ Full permissions for real data management
- ✅ Ability to assign roles to other users
- ✅ Role switcher in the sidebar
- ✅ Server-side role enforcement via middleware

Welcome to full platform access! 🎉
