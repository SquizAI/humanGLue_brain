# HumanGlue API - Complete Index

## Quick Navigation

### 📚 Documentation
- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference with all endpoints
- **[Quick Start Guide](./API_QUICK_START.md)** - Get started in 5 minutes
- **[Implementation Summary](./API_IMPLEMENTATION_SUMMARY.md)** - Technical overview and status
- **[Database Schema](./humanGLue_brain/supabase/SCHEMA.md)** - Database structure and relationships

### 🛠️ Core Utilities
- **[Error Handling](./lib/api/errors.ts)** - Consistent error responses
- **[Validation](./lib/api/validation.ts)** - Zod schemas for all inputs
- **[Authentication](./lib/api/auth.ts)** - JWT auth and RBAC
- **[Rate Limiting](./lib/api/rate-limit.ts)** - Upstash Redis rate limiting
- **[Unified Exports](./lib/api/index.ts)** - Import everything from one place

### 🔌 API Endpoints

#### Workshops (6 endpoints)
- `GET /api/workshops` - [List workshops](./app/api/workshops/route.ts)
- `POST /api/workshops` - [Create workshop](./app/api/workshops/route.ts)
- `GET /api/workshops/{id}` - [Get workshop](./app/api/workshops/[id]/route.ts)
- `PATCH /api/workshops/{id}` - [Update workshop](./app/api/workshops/[id]/route.ts)
- `DELETE /api/workshops/{id}` - [Delete workshop](./app/api/workshops/[id]/route.ts)
- `POST /api/workshops/{id}/register` - [Register for workshop](./app/api/workshops/[id]/register/route.ts)

#### Assessments (6 endpoints)
- `GET /api/assessments` - [List assessments](./app/api/assessments/route.ts)
- `POST /api/assessments` - [Create assessment](./app/api/assessments/route.ts)
- `GET /api/assessments/{id}` - [Get assessment](./app/api/assessments/[id]/route.ts)
- `PATCH /api/assessments/{id}` - [Update assessment](./app/api/assessments/[id]/route.ts)
- `POST /api/assessments/{id}/answers` - [Submit answers](./app/api/assessments/[id]/answers/route.ts)
- `GET /api/assessments/{id}/results` - [Get results](./app/api/assessments/[id]/results/route.ts)

#### Talent Marketplace (4 endpoints)
- `GET /api/talent` - [Browse talent](./app/api/talent/route.ts)
- `GET /api/talent/{id}` - [Get profile](./app/api/talent/[id]/route.ts)
- `POST /api/talent/contact` - [Contact expert](./app/api/talent/contact/route.ts)
- `GET /api/talent/search` - [Search talent](./app/api/talent/search/route.ts)

#### User (5 endpoints)
- `GET /api/user/profile` - [Get profile](./app/api/user/profile/route.ts)
- `PATCH /api/user/profile` - [Update profile](./app/api/user/profile/route.ts)
- `GET /api/user/dashboard` - [Dashboard](./app/api/user/dashboard/route.ts)
- `GET /api/user/workshops` - [User's workshops](./app/api/user/workshops/route.ts)
- `GET /api/user/assessments` - [User's assessments](./app/api/user/assessments/route.ts)

### 💳 Payment Functions (Netlify)
- `POST /.netlify/functions/create-payment-intent` - [Create payment](./netlify/functions/create-payment-intent.ts)
- `POST /.netlify/functions/process-payment` - [Process payment](./netlify/functions/process-payment.ts)
- `POST /.netlify/functions/stripe-webhook` - [Stripe webhooks](./netlify/functions/stripe-webhook.ts)

---

## Project Statistics

- **Total API Routes:** 21
- **Total Netlify Functions:** 11 (3 payment-related + 8 existing)
- **Core Utilities:** 4 files (errors, validation, auth, rate-limit)
- **Lines of Code:** ~3,500+ (API only)
- **Documentation Pages:** 4

---

## Getting Started

1. **Setup Environment**
   ```bash
   cp .env.example .env.local
   # Fill in your Supabase, Stripe, and Upstash credentials
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run Migrations**
   ```bash
   # Using Supabase CLI
   supabase db push
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Test an Endpoint**
   ```bash
   curl http://localhost:5040/api/workshops
   ```

---

## Common Tasks

### Create a Workshop
```typescript
const response = await fetch('/api/workshops', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'AI Fundamentals',
    description: 'Learn AI basics...',
    pillar: 'adaptability',
    level: 'beginner',
    format: 'live',
    schedule: {
      date: '2025-11-01T00:00:00Z',
      time: '14:00',
      duration: '2 hours'
    },
    capacity: { total: 50 },
    price: { amount: 299, earlyBird: 249 },
    outcomes: ['Learn AI', 'Apply tools', 'Lead teams'],
    tags: ['AI', 'Leadership']
  })
})
```

### Take an Assessment
```typescript
// 1. Create
const { data: assessment } = await fetch('/api/assessments', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ assessmentType: 'full' })
}).then(r => r.json())

// 2. Submit answers
await fetch(`/api/assessments/${assessment.id}/answers`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    answers: [
      { questionId: 'q1', dimension: 'individual', answerType: 'scale', answerValue: 75, questionWeight: 1.0 }
    ]
  })
})

// 3. Complete
await fetch(`/api/assessments/${assessment.id}`, {
  method: 'PATCH',
  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'completed' })
})

// 4. Get results
const { data: results } = await fetch(`/api/assessments/${assessment.id}/results`, {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json())
```

### Find and Contact Expert
```typescript
// 1. Search
const { data: experts } = await fetch('/api/talent?expertise=AI+Adoption&minRating=4.5')
  .then(r => r.json())

// 2. View profile
const { data: profile } = await fetch(`/api/talent/${experts[0].id}`)
  .then(r => r.json())

// 3. Request engagement
await fetch('/api/talent/contact', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    talentId: experts[0].id,
    focusArea: 'AI adoption for customer service',
    estimatedHours: 40,
    timeline: '3 months',
    message: 'We need help with...'
  })
})
```

---

## Architecture Decisions

### Why Next.js App Router?
- Server-side rendering for better SEO
- API routes co-located with frontend
- Built-in TypeScript support
- Excellent developer experience

### Why Netlify Functions for Payments?
- Secure server-side processing
- Automatic scaling
- Easy Stripe integration
- Webhook handling

### Why Supabase?
- PostgreSQL database with RLS
- Built-in authentication
- Real-time capabilities
- Excellent TypeScript support

### Why Zod for Validation?
- Type-safe schema validation
- Automatic TypeScript type inference
- Composable schemas
- Great error messages

### Why Upstash Redis?
- Serverless-friendly rate limiting
- Global edge network
- Simple REST API
- No connection management needed

---

## Security Checklist

- ✅ All sensitive endpoints require authentication
- ✅ Role-based access control implemented
- ✅ Resource ownership verified
- ✅ All inputs validated with Zod
- ✅ SQL injection prevented (Supabase RLS)
- ✅ Rate limiting on all endpoints
- ✅ CORS configured
- ✅ Stripe webhooks verified
- ✅ Service role key never exposed to client
- ✅ Passwords never logged
- ✅ Error messages don't leak sensitive data

---

## Performance Optimizations

- ✅ Database queries use proper JOINs
- ✅ Pagination on all list endpoints
- ✅ Redis caching for rate limits
- ✅ Efficient Supabase selects
- ✅ Response times <200ms for simple queries
- ✅ Proper database indexes (see SCHEMA.md)

---

## Deployment

### Environment Variables (Production)
Update these in your deployment platform:
- Supabase URLs and keys
- Stripe keys and webhook secret
- Upstash Redis credentials
- CORS allowed origins
- Email service credentials (optional)
- Analytics keys (optional)

### Database
- Run all migrations in order
- Verify RLS policies are active
- Seed initial data if needed

### Stripe Webhooks
1. Deploy to production
2. Add webhook endpoint in Stripe Dashboard
3. Copy webhook secret to env vars
4. Test webhook delivery

---

## Support

- **Documentation:** Read the full [API Documentation](./API_DOCUMENTATION.md)
- **Quick Start:** Follow the [Quick Start Guide](./API_QUICK_START.md)
- **Issues:** Report bugs via GitHub Issues
- **Email:** api-support@humanglue.com

---

## License

Proprietary - All rights reserved by HumanGlue
