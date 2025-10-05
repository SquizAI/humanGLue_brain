# HumanGlue Authentication System

Production-ready authentication using Supabase Auth with role-based access control.

## Architecture Overview

### Database Schema
- **users table**: Extends Supabase `auth.users` with custom fields
  - `role`: Enum ('admin', 'org_admin', 'team_lead', 'member')
  - `organization_id`: Optional foreign key to organizations
  - `is_instructor`: Determined by existence of record in `instructor_profiles`

- **instructor_profiles table**: Additional data for instructors
  - Links to users via `user_id`
  - Contains instructor-specific fields (bio, title, stats, etc.)

### Application Roles
The system maps database roles to simplified application roles:
- **admin**: Users with `role = 'admin'`
- **instructor**: Users with entry in `instructor_profiles` table
- **client**: All other authenticated users

## File Structure

```
lib/
├── auth/
│   ├── hooks.ts              # Client-side auth hooks
│   ├── server.ts             # Server-side auth helpers
│   ├── middleware.ts         # API route middleware
│   └── README.md             # This file
├── validation/
│   └── auth-schemas.ts       # Zod validation schemas
└── supabase/
    ├── client.ts             # Supabase client helper
    └── server.ts             # Supabase server helper

app/api/auth/
├── signup/route.ts           # POST /api/auth/signup
├── login/route.ts            # POST /api/auth/login
├── logout/route.ts           # POST /api/auth/logout
├── session/route.ts          # GET /api/auth/session
├── reset-password/route.ts   # POST /api/auth/reset-password
└── update-password/route.ts  # POST /api/auth/update-password

app/
├── login/page.tsx            # Login page
├── signup/page.tsx           # Signup page
├── reset-password/page.tsx   # Password reset request page
└── update-password/page.tsx  # Password update page
```

## Usage Guide

### Client-Side (in Client Components)

```typescript
'use client'

import { useAuth, useRole, signOut } from '@/lib/auth/hooks'

export default function MyComponent() {
  const { user, profile, session, loading, error } = useAuth()
  const { role, isAdmin, isInstructor, isClient } = useRole()

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not authenticated</div>

  return (
    <div>
      <h1>Welcome {profile?.full_name}</h1>
      <p>Role: {role}</p>
      <button onClick={() => signOut()}>Logout</button>
    </div>
  )
}
```

### Server-Side (in Server Components)

```typescript
import { getCurrentUser, requireAuth, requireRole } from '@/lib/auth/server'

export default async function ServerPage() {
  // Option 1: Get user (returns null if not authenticated)
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/login')
  }

  // Option 2: Require auth (throws AuthError if not authenticated)
  const { user, profile } = await requireAuth()

  // Option 3: Require specific role
  const { user, profile, role } = await requireRole(['admin', 'instructor'])

  return <div>Welcome {profile.full_name}</div>
}
```

### API Routes (with Middleware)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { withAuth, withRole } from '@/lib/auth/middleware'

// Require any authenticated user
export const GET = withAuth(async (request: NextRequest) => {
  return NextResponse.json({ message: 'Authenticated!' })
})

// Require specific role
export const POST = withRole(['admin'], async (request: NextRequest) => {
  return NextResponse.json({ message: 'Admin only!' })
})
```

## Authentication Flow

### 1. Signup
```
User → /signup page
↓
POST /api/auth/signup
↓
Supabase creates auth user
↓
Create profile in users table
↓
If instructor: create instructor_profiles entry
↓
Send verification email
↓
Redirect to login
```

### 2. Login
```
User → /login page
↓
POST /api/auth/login
↓
Supabase authenticates credentials
↓
Fetch user profile from database
↓
Set session cookie
↓
Redirect based on role:
  - admin → /admin
  - instructor → /instructor
  - client → /client
```

### 3. Password Reset
```
User → /reset-password page
↓
POST /api/auth/reset-password
↓
Supabase sends reset email
↓
User clicks link in email
↓
/update-password page
↓
POST /api/auth/update-password
↓
Password updated
```

## Environment Variables

Required in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Security Features

- Passwords hashed by Supabase (bcrypt)
- JWT tokens stored in httpOnly cookies
- CSRF protection via Supabase
- Email verification required
- Password strength validation (min 8 chars, uppercase, lowercase, number)
- Rate limiting on auth endpoints
- Role-based access control
- Row-level security (RLS) policies in database

## API Reference

### POST /api/auth/signup
Create new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "fullName": "John Doe",
  "role": "client" | "instructor",
  "organizationId": "uuid" (optional)
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "emailConfirmed": false
    },
    "message": "Account created! Please check your email to verify your account."
  }
}
```

### POST /api/auth/login
Authenticate user with email/password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "avatar_url": null,
      "role": "client" | "instructor" | "admin"
    },
    "redirectPath": "/client" | "/instructor" | "/admin"
  }
}
```

### POST /api/auth/logout
Sign out current user.

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /api/auth/session
Get current session and user.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "client"
    },
    "session": {
      "authenticated": true
    }
  }
}
```

### POST /api/auth/reset-password
Send password reset email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "If an account exists with this email, a password reset link has been sent."
}
```

### POST /api/auth/update-password
Update user password (requires authentication).

**Request:**
```json
{
  "password": "NewSecurePass123",
  "confirmPassword": "NewSecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

## Error Handling

All API routes return consistent error format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [] (optional, for validation errors)
  }
}
```

Common error codes:
- `VALIDATION_ERROR` (400): Invalid input data
- `UNAUTHORIZED` (401): Not authenticated
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Resource already exists (e.g., email taken)
- `INTERNAL_ERROR` (500): Server error

## Testing

### Create Test Accounts

Use Supabase Studio or run this SQL:

```sql
-- Create admin user (requires manual setup in auth.users first)
INSERT INTO users (id, email, full_name, role)
VALUES ('uuid', 'admin@humanglue.ai', 'Admin User', 'admin');

-- Create instructor user
INSERT INTO users (id, email, full_name, role)
VALUES ('uuid', 'instructor@humanglue.ai', 'Sarah Instructor', 'member');

INSERT INTO instructor_profiles (user_id, bio, professional_title)
VALUES ('uuid', 'Experienced instructor', 'Senior Instructor');

-- Create client user
INSERT INTO users (id, email, full_name, role)
VALUES ('uuid', 'client@humanglue.ai', 'John Client', 'member');
```

## Troubleshooting

### Session not persisting
- Ensure cookies are enabled
- Check that `NEXT_PUBLIC_APP_URL` matches your domain
- Verify Supabase URL settings

### Email not sending
- Check Supabase email settings
- Verify email templates are configured
- Check spam folder

### Role-based access not working
- Verify user has correct role in database
- Check if instructor has `instructor_profiles` entry
- Review RLS policies in Supabase

## Migration from localStorage Auth

The old system used localStorage. To migrate:

1. Remove all `localStorage.setItem('humanglue_user', ...)` calls
2. Replace `useChat().userData` with `useAuth().profile`
3. Update login/signup handlers to use API routes
4. Add authentication checks to protected routes

## Next Steps

- [ ] Add OAuth providers (Google, GitHub)
- [ ] Implement refresh token rotation
- [ ] Add 2FA support
- [ ] Set up email templates in Supabase
- [ ] Configure rate limiting
- [ ] Add audit logging
- [ ] Implement session management dashboard
