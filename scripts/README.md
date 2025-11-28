# Database Management Scripts

## User Role Management

### Problem
The signup process (`/api/auth/signup`) only creates users with these roles:
- `member` - Regular clients
- `team_lead` - Instructors

Admin users **cannot** be created through signup. They must be created directly in the database.

### Solution: Set User Role Script

Use `set-user-role.ts` to grant admin privileges to existing users:

```bash
npx tsx scripts/set-user-role.ts <email> <role>
```

#### Examples

```bash
# Make a user an admin
npx tsx scripts/set-user-role.ts admin@humanglue.com admin

# Make a user an org admin
npx tsx scripts/set-user-role.ts manager@company.com org_admin

# Make a user a team lead (instructor)
npx tsx scripts/set-user-role.ts instructor@humanglue.com team_lead

# Make a user a regular member
npx tsx scripts/set-user-role.ts user@company.com member
```

#### Valid Roles

| Role | Description | Portal Access |
|------|-------------|---------------|
| `admin` | Platform administrator | Admin Portal - full platform management |
| `org_admin` | Organization administrator | Client Portal - organization management |
| `team_lead` | Team lead / Instructor | Instructor Portal - workshop and student management |
| `member` | Regular user | Client Portal - learning and assessments |

### How Roles Work

1. **Database**: User roles are stored in `users.role` column
2. **Authentication**: `lib/auth/hooks.ts` fetches user profile from database
3. **Context**: `lib/contexts/ChatContext.tsx` sets `userData.isAdmin` based on `profile.role === 'admin'`
4. **UI**: `components/organisms/DashboardSidebar.tsx` shows different navigation based on role:
   - Admin: `/admin/*` routes
   - Instructor: `/instructor/*` routes
   - Client: `/dashboard/*` routes

### Troubleshooting

If an admin user sees the client portal instead of admin portal:

1. Check the console logs (with debug logging enabled):
   ```
   [DashboardSidebar] userData: {...}
   [DashboardSidebar] isAdmin: false | userData.isAdmin: undefined | userData.role: member
   ```

2. Verify the user's role in the database:
   ```sql
   SELECT email, role FROM users WHERE email = 'admin@example.com';
   ```

3. Update the role using the script:
   ```bash
   npx tsx scripts/set-user-role.ts admin@example.com admin
   ```

4. Have the user logout and login again to refresh their session

### Legacy Script

`create-admin-user.ts` - Creates user records for auth users who don't have database profiles. **Warning**: Sets ALL users to admin role. Use `set-user-role.ts` for targeted role updates.
