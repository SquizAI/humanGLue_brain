# Supabase Integration Documentation

## Overview

This document provides a comprehensive guide to the Supabase integration for the HumanGlue platform. Supabase serves as our backend-as-a-service, providing PostgreSQL database, authentication, storage, and real-time capabilities.

---

## Table of Contents

1. [Integration Status](#integration-status)
2. [Configuration](#configuration)
3. [Database Schema](#database-schema)
4. [Authentication Flow](#authentication-flow)
5. [Client Usage](#client-usage)
6. [Server-Side Usage](#server-side-usage)
7. [Migrations](#migrations)
8. [Security (RLS)](#security-rls)
9. [Next Steps](#next-steps)
10. [Troubleshooting](#troubleshooting)

---

## Integration Status

### Configured Components

- **Supabase Client** (`/lib/supabase/client.ts`)
  - Browser client for client-side operations
  - Uses `@supabase/ssr` for Next.js App Router compatibility
  - Configured with environment variables

- **Supabase Server** (`/lib/supabase/server.ts`)
  - Server client for API routes, Server Components, Server Actions
  - Includes admin client with service role key (bypasses RLS)
  - Cookie-based session management

- **Middleware** (`/middleware.ts`)
  - Automatic session refresh
  - Protected route authentication
  - Admin role verification
  - Redirects unauthenticated users to login

- **Environment Configuration** (`.env.example`)
  - Complete Supabase configuration template
  - Public URL, anon key, service role key
  - Storage URL for file uploads

- **Database Migrations** (`/supabase/migrations/`)
  - `001_multi_tenant_schema.sql` - Multi-tenant core schema
  - `001_create_users_and_roles.sql` - User management
  - `002_create_workshops.sql` - Workshop system
  - `003_create_assessments.sql` - Assessment system
  - `004_create_talent_and_engagements.sql` - Talent marketplace
  - `005_create_payments_certificates_reviews.sql` - Payments & reviews

### Required Packages

Both packages are installed in `package.json`:

```json
"@supabase/ssr": "^0.7.0",
"@supabase/supabase-js": "^2.58.0"
```

---

## Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Required - Get from Supabase Dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional - For file storage
NEXT_PUBLIC_SUPABASE_STORAGE_URL=https://your-project.supabase.co/storage/v1
```

### Getting Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to Settings > API
4. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

**Security Note**: The service role key bypasses Row Level Security (RLS). Only use it in server-side code, never expose to the client.

---

## Database Schema

### Core Tables

The platform uses a multi-tenant architecture with the following main entities:

#### Organizations
- Top-level tenant isolation
- Organization settings and branding
- Subscription management

#### Users & Roles
- User profiles with authentication
- Role-based access control (admin, org_admin, team_lead, member)
- Organization membership

#### Workshops
- AI transformation workshops
- Three pillars: Adaptability, Coaching, Marketplace
- Capacity management and pricing

#### Assessments
- AI readiness assessments
- Five dimensions scoring
- Progress tracking

#### Talent Marketplace
- Talent profiles and skills
- Job postings and applications
- Engagement management

#### Payments & Certificates
- Stripe payment integration
- Digital certificates
- Course reviews and ratings

### Key Features

- **UUID Primary Keys**: For distributed systems and scalability
- **Timestamps**: All tables have `created_at` and `updated_at`
- **Soft Deletes**: Many tables support soft deletion
- **JSONB Fields**: Flexible metadata storage
- **Foreign Keys**: Proper referential integrity
- **Check Constraints**: Data validation at database level
- **Indexes**: Optimized for common queries

---

## Authentication Flow

### Protected Routes

The middleware automatically protects these routes:

- `/dashboard/*` - Requires authentication
- `/admin/*` - Requires admin or org_admin role

### Session Management

```typescript
// middleware.ts handles:
1. Session refresh on every request
2. Cookie management (set/get/remove)
3. User authentication check
4. Role-based authorization
5. Redirects for unauthenticated users
```

### Login Flow

```typescript
// Example login (implement in your auth pages)
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}
```

### Signup Flow

```typescript
async function signup(email: string, password: string, userData: any) {
  const supabase = createClient()

  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) throw authError

  // 2. Create user profile (via RLS-protected insert)
  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: authData.user!.id,
      email,
      ...userData,
    })

  if (profileError) throw profileError
}
```

### Logout

```typescript
async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
}
```

---

## Client Usage

### Client Components

Use the browser client in Client Components:

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function WorkshopsList() {
  const [workshops, setWorkshops] = useState([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchWorkshops() {
      const { data, error } = await supabase
        .from('workshops')
        .select('*')
        .eq('status', 'published')
        .order('start_date', { ascending: true })

      if (error) console.error(error)
      else setWorkshops(data)
    }

    fetchWorkshops()
  }, [])

  return (
    <div>
      {workshops.map(workshop => (
        <div key={workshop.id}>{workshop.title}</div>
      ))}
    </div>
  )
}
```

### Real-time Subscriptions

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

export default function LiveWorkshops() {
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('workshops_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workshops',
        },
        (payload) => {
          console.log('Workshop changed:', payload)
          // Update UI accordingly
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return <div>Live workshop updates...</div>
}
```

---

## Server-Side Usage

### Server Components

Use the server client in Server Components:

```typescript
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's workshops
  const { data: workshops } = await supabase
    .from('workshop_registrations')
    .select('*, workshop:workshops(*)')
    .eq('user_id', user.id)

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <div>Your workshops: {workshops?.length}</div>
    </div>
  )
}
```

### Server Actions

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function registerForWorkshop(workshopId: string) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('workshop_registrations')
    .insert({
      workshop_id: workshopId,
      user_id: user.id,
      status: 'registered',
    })

  if (error) throw error

  revalidatePath('/dashboard/workshops')
  return { success: true }
}
```

### Admin Operations (Service Role)

For operations that need to bypass RLS:

```typescript
import { createAdminClient } from '@/lib/supabase/server'

export async function adminCreateOrganization(orgData: any) {
  const supabase = createAdminClient() // Uses service role key

  // This bypasses RLS - use with caution
  const { data, error } = await supabase
    .from('organizations')
    .insert(orgData)

  if (error) throw error
  return data
}
```

### API Routes

```typescript
// app/api/workshops/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()

  const { data: workshops, error } = await supabase
    .from('workshops')
    .select('*')
    .eq('status', 'published')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ workshops })
}
```

---

## Migrations

### Running Migrations

Migrations are SQL files in `/supabase/migrations/` that define your database schema.

#### Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations to remote
supabase db push

# Pull remote schema changes
supabase db pull
```

#### Manual Migration via Dashboard

1. Go to Supabase Dashboard > SQL Editor
2. Copy migration file contents
3. Execute SQL
4. Repeat for each migration in order

### Migration Order

Execute migrations in this order:

1. `001_multi_tenant_schema.sql` - Core schema
2. `001_create_users_and_roles.sql` - User management
3. `002_create_workshops.sql` - Workshops
4. `003_create_assessments.sql` - Assessments
5. `004_create_talent_and_engagements.sql` - Talent marketplace
6. `005_create_payments_certificates_reviews.sql` - Payments

### Creating New Migrations

```bash
# Create new migration file
supabase migration new your_migration_name

# Edit the file in /supabase/migrations/
# Add your SQL changes

# Test locally (requires local Supabase)
supabase db reset

# Push to remote
supabase db push
```

---

## Security (RLS)

### Row Level Security (RLS)

All tables have RLS enabled. RLS policies ensure users can only access data they're authorized to see.

#### Common Policy Patterns

**User can view own data:**
```sql
CREATE POLICY "Users can view own assessments"
  ON assessments
  FOR SELECT
  USING (auth.uid() = user_id);
```

**Public read access:**
```sql
CREATE POLICY "Anyone can view published workshops"
  ON workshops
  FOR SELECT
  USING (status = 'published');
```

**Admin access:**
```sql
CREATE POLICY "Admins can view all"
  ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'org_admin')
    )
  );
```

**Organization isolation:**
```sql
CREATE POLICY "Users see org data only"
  ON workshops
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );
```

### Testing RLS Policies

```typescript
// Test as authenticated user (respects RLS)
const supabase = createClient()
const { data } = await supabase.from('workshops').select('*')

// Test as admin (bypasses RLS - use carefully)
const adminSupabase = createAdminClient()
const { data } = await adminSupabase.from('workshops').select('*')
```

---

## Next Steps

### Backend Integration Tasks

#### 1. Complete Authentication Pages

**Required pages:**
- `/app/login/page.tsx` - Login form
- `/app/signup/page.tsx` - Signup form
- `/app/forgot-password/page.tsx` - Password reset
- `/app/reset-password/page.tsx` - New password form

**Implementation:**
```typescript
// Example: app/login/page.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <form onSubmit={handleLogin}>
      {/* Add form fields */}
    </form>
  )
}
```

#### 2. Create Dashboard Components

**User dashboard:**
- Profile settings
- Enrolled workshops
- Assessment results
- Certificates

**Admin dashboard:**
- User management
- Workshop management
- Analytics
- System settings

#### 3. Implement Workshop Features

**Frontend integration:**
- Workshop listing page
- Workshop detail page
- Registration flow
- Payment integration (Stripe)
- Attendance tracking

**Server actions:**
```typescript
// app/actions/workshops.ts
'use server'

export async function enrollInWorkshop(workshopId: string) {
  // Implementation
}

export async function cancelWorkshopRegistration(workshopId: string) {
  // Implementation
}
```

#### 4. Assessment System

**Features to implement:**
- Start assessment flow
- Save progress (auto-save)
- Submit assessment
- View results
- PDF report generation

#### 5. File Storage

**Setup Supabase Storage:**

```typescript
// Upload user avatar
import { createClient } from '@/lib/supabase/client'

async function uploadAvatar(file: File, userId: string) {
  const supabase = createClient()

  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Date.now()}.${fileExt}`
  const filePath = `avatars/${fileName}`

  const { error } = await supabase.storage
    .from('user-uploads')
    .upload(filePath, file)

  if (error) throw error

  const { data } = supabase.storage
    .from('user-uploads')
    .getPublicUrl(filePath)

  return data.publicUrl
}
```

**Storage buckets to create:**
- `user-uploads` - User avatars, documents
- `certificates` - Generated certificates (PDF)
- `workshop-materials` - Workshop resources

#### 6. Real-time Features

**Implement live updates:**
- Workshop capacity updates
- Live assessment progress
- Admin notifications
- Chat/messaging (optional)

#### 7. Email Integration

**Setup email templates:**
- Welcome email
- Workshop confirmation
- Assessment completion
- Certificate delivery
- Payment receipts

**Use with Supabase Auth:**
```typescript
// Trigger password reset email
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'https://yourapp.com/reset-password',
})
```

#### 8. Payment Integration (Stripe)

**Webhook handler:**
```typescript
// app/api/webhooks/stripe/route.ts
import { createAdminClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  const supabase = createAdminClient()

  // Verify webhook signature
  // Process payment
  // Update database

  return new Response(JSON.stringify({ received: true }))
}
```

#### 9. Analytics & Monitoring

**Track key metrics:**
- User signups
- Workshop enrollments
- Assessment completions
- Payment success rate
- Error rates

**Supabase metrics queries:**
```typescript
const { count } = await supabase
  .from('users')
  .select('*', { count: 'exact', head: true })
  .gte('created_at', '2025-01-01')
```

#### 10. Testing

**Test coverage needed:**
- Authentication flows
- Protected routes
- RLS policies
- Database operations
- Real-time subscriptions

**Example test:**
```typescript
// tests/auth.test.ts
import { createClient } from '@/lib/supabase/client'

describe('Authentication', () => {
  it('should login user', async () => {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password123',
    })
    expect(error).toBeNull()
    expect(data.user).toBeDefined()
  })
})
```

---

## Troubleshooting

### Common Issues

#### 1. "Invalid API key" Error

**Solution:**
- Verify `.env.local` has correct keys
- Restart dev server after changing env vars
- Check keys don't have extra spaces/newlines

#### 2. RLS Policies Blocking Queries

**Debug:**
```typescript
// Check current user
const { data: { user } } = await supabase.auth.getUser()
console.log('Current user:', user)

// Use admin client to bypass RLS temporarily
const adminSupabase = createAdminClient()
const { data } = await adminSupabase.from('table').select('*')
```

**Solution:**
- Review RLS policies in Supabase Dashboard
- Ensure user is authenticated
- Check policy conditions match your use case

#### 3. Middleware Not Running

**Check:**
- Middleware file is in project root
- Matcher config is correct
- No syntax errors in middleware.ts

#### 4. Session Not Persisting

**Solution:**
- Ensure middleware is refreshing sessions
- Check cookie settings
- Verify domain matches in production

#### 5. CORS Errors

**Solution:**
- Add domain to Supabase Dashboard > Authentication > URL Configuration
- Check `CORS_ALLOWED_ORIGINS` in `.env.local`

#### 6. Slow Queries

**Optimize:**
- Add indexes to frequently queried columns
- Use `.select()` to only fetch needed columns
- Implement pagination
- Check query execution plan in Supabase

### Debugging Tips

**Enable verbose logging:**
```typescript
const { data, error } = await supabase
  .from('table')
  .select('*')

console.log('Data:', data)
console.log('Error:', error)
```

**Check Supabase logs:**
1. Supabase Dashboard > Logs
2. Filter by severity
3. Look for SQL errors, auth issues

**Test RLS in SQL Editor:**
```sql
-- Set user context
SELECT auth.uid(); -- Should return user ID

-- Test policy
SELECT * FROM workshops; -- Should respect RLS
```

---

## Additional Resources

### Documentation

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Database](https://supabase.com/docs/guides/database)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Integration](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

### Tools

- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Supabase Studio](https://supabase.com/dashboard)
- [Database Schema Visualizer](https://supabase.com/docs/guides/database/overview#database-schema-visualizer)

### Community

- [Supabase Discord](https://discord.supabase.com)
- [GitHub Discussions](https://github.com/supabase/supabase/discussions)
- [Twitter @supabase](https://twitter.com/supabase)

---

## Summary Checklist

### Completed

- Supabase client setup (browser & server)
- Middleware for auth and protected routes
- Environment configuration
- Database migrations (6 migration files)
- Admin client with service role
- RLS policies in migrations

### In Progress / Next Steps

- Create authentication pages (login, signup, password reset)
- Build dashboard components
- Implement workshop enrollment flow
- Setup Supabase Storage buckets
- Configure email templates
- Integrate Stripe webhooks
- Add real-time subscriptions
- Create comprehensive tests
- Deploy migrations to production
- Monitor performance and optimize

---

**Last Updated:** 2025-10-04
**Version:** 1.0.0
**Maintainer:** HumanGlue Development Team
