# API Quick Start Guide

Get started with the HumanGlue API in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- Supabase account and project
- Stripe account (for payments)
- Upstash account (for rate limiting)

## Setup Steps

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr zod stripe @upstash/ratelimit @upstash/redis
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in required values:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Required for payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional (but recommended for rate limiting)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

### 3. Set Up Database

Run the database migrations in order:

```bash
# Connect to your Supabase database
psql $DATABASE_URL

# Run migrations
\i supabase/migrations/001_create_users_and_roles.sql
\i supabase/migrations/002_create_workshops.sql
\i supabase/migrations/003_create_assessments.sql
\i supabase/migrations/004_create_talent_and_engagements.sql
\i supabase/migrations/005_create_payments_certificates_reviews.sql
```

Or use Supabase CLI:

```bash
supabase db push
```

### 4. Test the API

Start the development server:

```bash
npm run dev
```

Test an endpoint:

```bash
# Get workshops (public endpoint)
curl http://localhost:5040/api/workshops

# Expected response:
# {
#   "success": true,
#   "data": [...],
#   "meta": { ... }
# }
```

## Authentication

### Sign Up a User

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
})

console.log('User created:', data.user)
```

### Sign In

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password',
})

const token = data.session?.access_token
console.log('Auth token:', token)
```

### Make Authenticated Request

```typescript
const response = await fetch('http://localhost:5040/api/user/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
})

const { data } = await response.json()
console.log('User profile:', data)
```

## Common API Calls

### List Workshops

```typescript
const response = await fetch(
  'http://localhost:5040/api/workshops?pillar=adaptability&level=beginner'
)
const { data: workshops } = await response.json()
console.log('Workshops:', workshops)
```

### Create Assessment

```typescript
const response = await fetch('http://localhost:5040/api/assessments', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    assessmentType: 'full',
  }),
})

const { data: assessment } = await response.json()
console.log('Assessment created:', assessment)
```

### Browse Talent

```typescript
const response = await fetch(
  'http://localhost:5040/api/talent?minRating=4.5&availability=available'
)
const { data: experts } = await response.json()
console.log('Available experts:', experts)
```

### Get User Dashboard

```typescript
const response = await fetch('http://localhost:5040/api/user/dashboard', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
})

const { data: dashboard } = await response.json()
console.log('Dashboard:', dashboard)
```

## Error Handling

All API responses follow this format:

```typescript
// Success
{
  "success": true,
  "data": { ... },
  "meta": { "timestamp": "..." }
}

// Error
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { ... }
  },
  "meta": { "timestamp": "..." }
}
```

Handle errors:

```typescript
const response = await fetch('http://localhost:5040/api/workshops')
const result = await response.json()

if (!result.success) {
  console.error('API Error:', result.error.code)
  console.error('Message:', result.error.message)

  // Handle specific errors
  if (result.error.code === 'UNAUTHORIZED') {
    // Redirect to login
  } else if (result.error.code === 'VALIDATION_ERROR') {
    // Show validation errors
    console.error('Validation errors:', result.error.details)
  }
}
```

## Rate Limiting

Check rate limit headers:

```typescript
const response = await fetch('http://localhost:5040/api/workshops')

console.log('Rate limit:', response.headers.get('X-RateLimit-Limit'))
console.log('Remaining:', response.headers.get('X-RateLimit-Remaining'))
console.log('Reset:', response.headers.get('X-RateLimit-Reset'))
```

Handle rate limit errors:

```typescript
if (response.status === 429) {
  const result = await response.json()
  const retryAfter = result.error.details.retryAfter

  console.log(`Rate limited. Retry after ${retryAfter} seconds`)

  // Wait and retry
  await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
  // ... retry request
}
```

## Webhooks (Stripe)

### Set Up Webhook Endpoint

1. Deploy your Netlify functions
2. Go to Stripe Dashboard > Webhooks
3. Add endpoint: `https://your-site.netlify.app/.netlify/functions/stripe-webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### Test Webhook Locally

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:8888/.netlify/functions/stripe-webhook

# Trigger test event
stripe trigger payment_intent.succeeded
```

## TypeScript Types

Generate TypeScript types from your Supabase database:

```bash
npx supabase gen types typescript --project-id your-project-id > lib/supabase/database.types.ts
```

Use types in your code:

```typescript
import { Database } from '@/lib/supabase/database.types'

type Workshop = Database['public']['Tables']['workshops']['Row']
type Assessment = Database['public']['Tables']['assessments']['Row']
```

## Next Steps

1. Read the full [API Documentation](./API_DOCUMENTATION.md)
2. Review the [Database Schema](./humanGLue_brain/supabase/SCHEMA.md)
3. Explore example implementations in `/app/api/`
4. Set up monitoring and logging
5. Configure production environment variables
6. Test payment flows in Stripe test mode
7. Set up error tracking (Sentry)

## Troubleshooting

### "PGRST116" Error (Not Found)

This Postgres error code means the resource doesn't exist. Check:
- ID is valid UUID
- Resource exists in database
- RLS policies allow access

### "Invalid Token" Error

Check:
- Token is not expired (Supabase tokens expire after 1 hour by default)
- Token format: `Bearer <token>`
- Using correct Supabase project URL and keys

### Rate Limit Issues

If rate limiting isn't working:
- Check Upstash credentials
- Verify Redis connection
- Rate limiting fails gracefully (allows requests if Redis is down)

### CORS Errors

Add your domain to `CORS_ALLOWED_ORIGINS`:

```bash
CORS_ALLOWED_ORIGINS=http://localhost:5040,https://yourdomain.com
```

## Support

- API Documentation: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- Database Schema: [SCHEMA.md](./humanGLue_brain/supabase/SCHEMA.md)
- GitHub Issues: https://github.com/your-org/humanglue/issues
- Email: api-support@humanglue.com
