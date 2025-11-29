# Email Invitation Feature

## Overview

The email invitation system allows admins to invite new users to the platform by sending them an automated email with login credentials.

## Features

✅ **Automated User Creation** - Creates user accounts in Supabase Auth
✅ **Role Assignment** - Assigns appropriate role (admin, instructor, expert, or client)
✅ **Email Delivery** - Sends professional HTML invitation email via Resend API
✅ **Temporary Passwords** - Generates secure random passwords
✅ **Role-Specific Instructions** - Customizes email content based on user role
✅ **Admin-Only Access** - Only users with admin role can invite new users

---

## Components

### 1. Email Service Method

**File**: [services/email.ts](services/email.ts) (lines 188-327)

**Method**: `emailService.sendUserInvitation()`

**Purpose**: Sends a professionally formatted HTML email with:
- Welcome message
- User's email and temporary password
- Login button/link
- Role-specific next steps
- Security reminder to change password

**Example Usage**:
```typescript
await emailService.sendUserInvitation('newuser@example.com', {
  inviterName: 'Admin User',
  role: 'instructor',
  temporaryPassword: 'TempPass123!',
  loginUrl: 'https://hmnglue.com/login',
  organizationName: 'HumanGlue'
})
```

### 2. API Endpoint

**File**: [app/api/admin/users/invite/route.ts](app/api/admin/users/invite/route.ts)

**Endpoint**: `POST /api/admin/users/invite`

**Authentication**: Requires admin role

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "fullName": "John Doe", // Optional
  "role": "instructor", // admin | instructor | expert | client
  "organizationName": "HumanGlue" // Optional
}
```

**Response** (Success):
```json
{
  "success": true,
  "data": {
    "userId": "uuid-here",
    "email": "newuser@example.com",
    "role": "instructor",
    "emailSent": true
  }
}
```

**Response** (Email Failed):
```json
{
  "success": true,
  "data": {
    "userId": "uuid-here",
    "email": "newuser@example.com",
    "role": "instructor",
    "emailSent": false,
    "temporaryPassword": "TempPass123!" // Returned if email fails
  },
  "warning": "User created but invitation email failed to send"
}
```

### 3. Admin UI

**File**: [app/admin/users/invite/page.tsx](app/admin/users/invite/page.tsx)

**URL**: `/admin/users/invite`

**Features**:
- Form to enter user details
- Role selection dropdown with descriptions
- Success/error alerts
- Clear form button
- Role descriptions reference

**Screenshot**: *Coming soon*

---

## Setup Instructions

### 1. Configure Environment Variables

Make sure these are set in your `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Required for creating users

# Email (Resend)
RESEND_API_KEY=re_your_api_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:5040  # or your production URL
```

### 2. Get Service Role Key

1. Go to Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (NOT the anon key)
4. Add it to `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **Security Warning**: Never expose the service role key to the client! It bypasses Row Level Security.

### 3. Configure Resend API

1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Add it to `.env.local` as `RESEND_API_KEY`

---

## Usage Flow

### For Admins:

1. **Login** as an admin user
2. **Navigate** to `/admin/users/invite`
3. **Fill out the form**:
   - Email address (required)
   - Full name (optional, defaults to email username)
   - Role (required)
   - Organization name (optional, defaults to "HumanGlue")
4. **Click** "Send Invitation"
5. **Confirmation** appears with success message

### For New Users:

1. **Receive email** with subject "Welcome to HumanGlue - Your [role] account is ready"
2. **Open email** and copy temporary password
3. **Click** "Log In Now" button
4. **Login** with email and temporary password
5. **Redirected** to appropriate portal based on role
6. **Prompted** to change password on first login (recommended)

---

## Email Template Preview

The invitation email includes:

- **Header**: Gradient purple header with organization name
- **Welcome Message**: Personalized greeting with inviter's name
- **Role Description**: Explanation of what the role can do
- **Credentials Box**: Highlighted section with email and password
- **Login Button**: Prominent call-to-action button
- **Next Steps**: Role-specific checklist of what to do after login
- **Footer**: Organization branding

---

## Security Considerations

### Password Generation
- 12 characters minimum
- Mix of uppercase, lowercase, numbers, and special characters
- Cryptographically random using `Math.random()` (consider upgrading to `crypto.randomBytes()` for production)

### Email Security
- Credentials sent only via email (not SMS or other channels)
- Email prompts user to change password immediately
- No password reset link needed (user can login immediately)

### Admin Authorization
- Only users with `admin` role can access `/api/admin/users/invite`
- Verified server-side using Supabase Auth and user_roles table
- Middleware blocks non-admin access to `/admin/*` routes

### Service Role Key
- Stored server-side only (`SUPABASE_SERVICE_ROLE_KEY`)
- Never exposed to client
- Used only to create users via Supabase Admin API
- Bypasses RLS for user creation only

---

## Error Handling

### User Already Exists
- API returns 500 error with message from Supabase
- Email is not sent
- User sees error alert in UI

### Email Delivery Fails
- User account is still created
- API returns success but with `emailSent: false`
- Temporary password is returned in response for manual sharing
- Warning message shown in UI

### Missing Service Role Key
- Falls back to anon key (will fail for user creation)
- API returns error: "User creation failed"
- Admin should check environment variables

### Missing Resend API Key
- Email sending fails
- User account still created
- Warning returned with temporary password for manual sharing

---

## Testing

### Test the Email Service

```typescript
import { emailService } from '@/services/email'

await emailService.sendUserInvitation('test@example.com', {
  inviterName: 'Test Admin',
  role: 'client',
  temporaryPassword: 'TestPass123!',
  loginUrl: 'http://localhost:5040/login',
  organizationName: 'Test Org'
})
```

### Test the API Endpoint

```bash
curl -X POST http://localhost:5040/api/admin/users/invite \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "email": "test@example.com",
    "fullName": "Test User",
    "role": "client",
    "organizationName": "Test Org"
  }'
```

### Test the UI

1. Login as admin (e.g., `demo.admin@humanglue.com`)
2. Navigate to `/admin/users/invite`
3. Fill out form and submit
4. Check for success message
5. Check test email inbox for invitation

---

## Troubleshooting

### Email Not Received

**Check**:
- Resend API key is correct in `.env.local`
- Email is not in spam folder
- Resend account has verified sender domain
- Check API logs for email errors

**Solution**:
- Verify Resend API key
- Add your domain to Resend
- Check Resend dashboard for delivery status

### User Creation Fails

**Check**:
- Service role key is set in `.env.local`
- Service role key is correct (from Supabase dashboard)
- User email doesn't already exist

**Solution**:
- Copy service role key from Supabase Dashboard → Settings → API
- Check if user already exists in Supabase Auth

### 403 Forbidden Error

**Check**:
- Current user has admin role in `user_roles` table
- Middleware is allowing access to `/admin/*` routes

**Solution**:
- Verify admin role: `SELECT * FROM user_roles WHERE user_id = 'your-id' AND role = 'admin'`
- Check middleware logs for role verification

---

## Future Enhancements

### Phase 1 (Current)
✅ Basic email invitation with temporary password
✅ Role assignment
✅ Admin-only access

### Phase 2 (Planned)
- [ ] Password reset link instead of temporary password
- [ ] Custom email templates per organization
- [ ] Bulk user import via CSV
- [ ] Resend invitation button for failed emails
- [ ] Email delivery status tracking

### Phase 3 (Future)
- [ ] User onboarding flow after first login
- [ ] Multi-role assignment in single invitation
- [ ] Custom welcome videos per role
- [ ] SMS invitation option
- [ ] Invitation expiration and revocation

---

## Related Files

- [services/email.ts](services/email.ts) - Email service with sendUserInvitation method
- [app/api/admin/users/invite/route.ts](app/api/admin/users/invite/route.ts) - API endpoint
- [app/admin/users/invite/page.tsx](app/admin/users/invite/page.tsx) - Admin UI
- [.env.example](.env.example) - Environment variable template
- [MULTI_ROLE_SYSTEM.md](MULTI_ROLE_SYSTEM.md) - Multi-role authentication docs

---

## Support

For questions or issues:
- Check this documentation first
- Review error messages in browser console and server logs
- Verify environment variables are set correctly
- Contact platform administrator
