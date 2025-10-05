# HumanGlue Platform API Documentation

Complete API reference for the HumanGlue AI transformation platform.

## Table of Contents

1. [Authentication](#authentication)
2. [Workshops API](#workshops-api)
3. [Assessments API](#assessments-api)
4. [Talent Marketplace API](#talent-marketplace-api)
5. [User API](#user-api)
6. [Payment API](#payment-api)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)

---

## Authentication

All authenticated endpoints require a valid Supabase authentication token.

### Headers

```
Authorization: Bearer <supabase-jwt-token>
```

### Getting an Auth Token

Use Supabase Auth to sign in users and obtain a JWT token:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
})

const token = data.session?.access_token
```

---

## Workshops API

### List Workshops

Get a paginated list of workshops with filtering.

**Endpoint:** `GET /api/workshops`

**Query Parameters:**
- `pillar` (optional): adaptability | coaching | marketplace
- `level` (optional): beginner | intermediate | advanced
- `format` (optional): live | hybrid | recorded
- `status` (optional): draft | published | archived | cancelled
- `isFeatured` (optional): true | false
- `search` (optional): Search in title and description
- `tags` (optional): Comma-separated tags
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20): Items per page

**Example Request:**

```bash
curl "https://api.humanglue.com/api/workshops?pillar=adaptability&level=beginner&page=1&limit=10"
```

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "AI Fundamentals for Leaders",
      "description": "Learn the basics...",
      "pillar": "adaptability",
      "level": "beginner",
      "format": "live",
      "schedule_date": "2025-11-01T00:00:00Z",
      "schedule_time": "14:00",
      "schedule_duration": "2 hours",
      "capacity_total": 50,
      "capacity_remaining": 30,
      "price_amount": 299,
      "price_early_bird": 249,
      "instructor": {
        "id": "uuid",
        "full_name": "John Doe",
        "avatar_url": "https://..."
      },
      "registrations": [{ "count": 20 }]
    }
  ],
  "meta": {
    "timestamp": "2025-10-02T...",
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

### Get Workshop Details

**Endpoint:** `GET /api/workshops/{id}`

**Example Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "AI Fundamentals for Leaders",
    "description": "Complete description...",
    "outcomes": ["Understand AI basics", "Apply AI tools"],
    "tags": ["AI", "Leadership"],
    "instructor": {
      "id": "uuid",
      "full_name": "John Doe",
      "bio": "Expert in..."
    }
  }
}
```

### Create Workshop

**Endpoint:** `POST /api/workshops`

**Authentication:** Required (instructor or admin role)

**Request Body:**

```json
{
  "title": "AI Fundamentals for Leaders",
  "description": "Learn the basics of AI transformation...",
  "pillar": "adaptability",
  "level": "beginner",
  "format": "live",
  "schedule": {
    "date": "2025-11-01T00:00:00Z",
    "time": "14:00",
    "duration": "2 hours",
    "timezone": "UTC"
  },
  "capacity": {
    "total": 50
  },
  "price": {
    "amount": 299,
    "earlyBird": 249,
    "currency": "USD"
  },
  "outcomes": [
    "Understand AI fundamentals",
    "Apply AI tools effectively",
    "Lead AI transformation"
  ],
  "tags": ["AI", "Leadership", "Transformation"]
}
```

### Update Workshop

**Endpoint:** `PATCH /api/workshops/{id}`

**Authentication:** Required (owner or admin)

**Request Body:** (all fields optional)

```json
{
  "title": "Updated Title",
  "capacity": {
    "total": 75
  }
}
```

### Delete Workshop

**Endpoint:** `DELETE /api/workshops/{id}`

**Authentication:** Required (owner or admin)

**Note:** If workshop has registrations, it will be cancelled instead of deleted.

### Register for Workshop

**Endpoint:** `POST /api/workshops/{id}/register`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "registration-uuid",
    "workshop_id": "uuid",
    "user_id": "uuid",
    "status": "pending_payment",
    "price_paid": 249,
    "requiresPayment": true,
    "amount": 249
  },
  "meta": {
    "message": "Registration created. Payment required to complete enrollment."
  }
}
```

---

## Assessments API

### List Assessments

**Endpoint:** `GET /api/assessments`

**Authentication:** Required

**Query Parameters:**
- `status` (optional): in_progress | completed | abandoned
- `assessmentType` (optional): full | quick | follow_up
- `fromDate` (optional): ISO date string
- `toDate` (optional): ISO date string
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

### Create Assessment

**Endpoint:** `POST /api/assessments`

**Authentication:** Required

**Request Body:**

```json
{
  "assessmentType": "full",
  "organizationId": "uuid" // optional
}
```

### Get Assessment

**Endpoint:** `GET /api/assessments/{id}`

**Authentication:** Required (owner only)

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "assessment_type": "full",
    "status": "in_progress",
    "individual_score": 75,
    "leadership_score": 68,
    "cultural_score": 82,
    "embedding_score": 70,
    "velocity_score": 65,
    "overall_score": 72,
    "answers": [
      {
        "question_id": "q1",
        "dimension": "individual",
        "answer_value": 80,
        "answer_text": "..."
      }
    ]
  }
}
```

### Submit Answers

**Endpoint:** `POST /api/assessments/{id}/answers`

**Authentication:** Required (owner only)

**Request Body:**

```json
{
  "answers": [
    {
      "questionId": "q1",
      "dimension": "individual",
      "answerType": "scale",
      "answerValue": 75,
      "questionWeight": 1.0
    },
    {
      "questionId": "q2",
      "dimension": "leadership",
      "answerType": "fearToConfidence",
      "answerValue": 60,
      "answerText": "Additional context...",
      "questionWeight": 1.0
    }
  ]
}
```

### Complete Assessment

**Endpoint:** `PATCH /api/assessments/{id}`

**Authentication:** Required (owner only)

**Request Body:**

```json
{
  "status": "completed"
}
```

### Get Assessment Results

**Endpoint:** `GET /api/assessments/{id}/results`

**Authentication:** Required (owner only)

**Response:**

```json
{
  "success": true,
  "data": {
    "assessment": {
      "id": "uuid",
      "type": "full",
      "completed_at": "2025-10-02T...",
      "overall_score": 72
    },
    "scores": {
      "individual": 75,
      "leadership": 68,
      "cultural": 82,
      "embedding": 70,
      "velocity": 65,
      "overall": 72
    },
    "readinessLevel": "intermediate",
    "recommendations": [
      {
        "dimension": "Leadership Capability",
        "priority": "high",
        "score": 68,
        "action": "Develop leadership skills for guiding AI transformation",
        "resources": ["AI Leadership Masterclass", "Change Leadership Coaching"]
      }
    ],
    "suggestedWorkshops": [...],
    "insights": {
      "strengths": ["Organizational Culture"],
      "areasForGrowth": ["Leadership Capability"]
    }
  }
}
```

---

## Talent Marketplace API

### Browse Talent

**Endpoint:** `GET /api/talent`

**Query Parameters:**
- `expertise` (optional): Comma-separated expertise areas
- `industries` (optional): Comma-separated industries
- `transformationStages` (optional): assess | reframe | embed | scale
- `coachingStyle` (optional): directive | facilitative | hybrid
- `availability` (optional): available | limited | booked
- `minRating` (optional): 0-5
- `minExperience` (optional): Years of experience
- `maxHourlyRate` (optional): Maximum hourly rate
- `search` (optional): Search query
- `page`, `limit` (optional)

**Example Request:**

```bash
curl "https://api.humanglue.com/api/talent?expertise=AI+Adoption&minRating=4.5&availability=available"
```

### Get Talent Profile

**Endpoint:** `GET /api/talent/{id}`

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tagline": "AI Transformation Expert",
    "bio": "Full biography...",
    "expertise": ["AI Adoption", "Change Management"],
    "industries": ["Technology", "Finance"],
    "transformation_stages": ["assess", "reframe", "embed"],
    "coaching_style": "facilitative",
    "years_experience": 15,
    "rating": 4.8,
    "review_count": 42,
    "availability": "available",
    "hourly_rate": 500,
    "user": {
      "full_name": "Jane Smith",
      "avatar_url": "https://..."
    },
    "testimonials": [...],
    "stats": {
      "activeEngagements": 3,
      "completedEngagements": 28,
      "testimonialCount": 15
    }
  }
}
```

### Contact Talent

**Endpoint:** `POST /api/talent/contact`

**Authentication:** Required

**Request Body:**

```json
{
  "talentId": "uuid",
  "organizationId": "uuid", // optional
  "focusArea": "AI adoption for customer service team",
  "estimatedHours": 40,
  "timeline": "3 months",
  "message": "We are looking for an expert to help us..."
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "engagement-uuid",
    "client_id": "uuid",
    "expert_id": "uuid",
    "status": "pending",
    "focus_area": "AI adoption...",
    "hours_total": 40,
    "hourly_rate": 500,
    "estimatedBudget": 20000
  },
  "meta": {
    "message": "Engagement request sent successfully..."
  }
}
```

### Search Talent

**Endpoint:** `GET /api/talent/search?search=AI+transformation`

**Query Parameters:** Same as Browse Talent, but `search` is required

---

## User API

### Get Profile

**Endpoint:** `GET /api/user/profile`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "company_name": "Acme Corp",
    "bio": "...",
    "avatar_url": "https://...",
    "roles": [
      {
        "role": "client",
        "organization_id": "uuid"
      }
    ],
    "talent_profile": null
  }
}
```

### Update Profile

**Endpoint:** `PATCH /api/user/profile`

**Authentication:** Required

**Request Body:**

```json
{
  "fullName": "John Doe",
  "companyName": "Acme Corp",
  "bio": "Updated bio...",
  "avatarUrl": "https://..."
}
```

### Get Dashboard

**Endpoint:** `GET /api/user/dashboard`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe"
    },
    "stats": {
      "completedWorkshops": 5,
      "completedAssessments": 3,
      "certificatesEarned": 2,
      "activeEngagements": 1
    },
    "upcomingWorkshops": [...],
    "recentAssessments": [...],
    "latestAssessment": {...},
    "activeEngagements": [...],
    "certificates": [...]
  }
}
```

### Get User's Workshops

**Endpoint:** `GET /api/user/workshops`

**Authentication:** Required

**Query Parameters:**
- `status` (optional): Filter by registration status

**Response:**

```json
{
  "success": true,
  "data": {
    "all": [...],
    "upcoming": [...],
    "past": [...],
    "stats": {
      "total": 10,
      "upcoming": 2,
      "completed": 5,
      "cancelled": 1
    }
  }
}
```

### Get User's Assessments

**Endpoint:** `GET /api/user/assessments`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": {
    "assessments": [...],
    "stats": {
      "total": 5,
      "completed": 3,
      "inProgress": 1
    },
    "trends": {
      "overall": 5,
      "individual": 3,
      "leadership": 8
    },
    "averages": {
      "overall": 72,
      "individual": 75,
      "leadership": 68
    }
  }
}
```

---

## Payment API

### Create Payment Intent

**Endpoint:** `POST /.netlify/functions/create-payment-intent`

**Authentication:** Required

**Request Body:**

```json
{
  "workshopId": "uuid",
  // OR
  "engagementId": "uuid",
  "metadata": {
    "customField": "value"
  }
}
```

**Response:**

```json
{
  "success": true,
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "amount": 249
}
```

### Process Payment

**Endpoint:** `POST /.netlify/functions/process-payment`

**Authentication:** Required

**Request Body:**

```json
{
  "paymentIntentId": "pi_xxx",
  "workshopId": "uuid"
  // OR engagementId
}
```

**Response:**

```json
{
  "success": true,
  "message": "Payment successful and registration confirmed",
  "registration": {...},
  "payment": {...}
}
```

### Stripe Webhook

**Endpoint:** `POST /.netlify/functions/stripe-webhook`

**Headers:**
- `stripe-signature`: Stripe webhook signature

**Handles Events:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`

---

## Error Handling

All API endpoints return consistent error responses:

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Optional additional context
    }
  },
  "meta": {
    "timestamp": "2025-10-02T..."
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `INVALID_QUERY_PARAMS` | 400 | Invalid query parameters |
| `MISSING_REQUIRED_FIELDS` | 400 | Required fields missing |
| `UNAUTHORIZED` | 401 | Authentication required |
| `INVALID_TOKEN` | 401 | Invalid auth token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `ROLE_REQUIRED` | 403 | Specific role required |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict |
| `DUPLICATE_ENTRY` | 409 | Duplicate entry |
| `CAPACITY_EXCEEDED` | 409 | Workshop full |
| `ALREADY_REGISTERED` | 409 | Already registered |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `DATABASE_ERROR` | 500 | Database operation failed |

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse.

### Rate Limit Tiers

- **Strict:** 10 requests per 10 seconds (public endpoints)
- **Standard:** 30 requests per minute (authenticated endpoints)
- **Lenient:** 100 requests per minute (authenticated users)

### Rate Limit Headers

```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
X-RateLimit-Reset: 1696262400
```

### Rate Limit Error

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests",
    "details": {
      "retryAfter": 45
    }
  }
}
```

---

## Usage Examples

### Complete Workshop Registration Flow

```typescript
import { createClient } from '@supabase/supabase-js'

// 1. Authenticate user
const supabase = createClient(url, key)
const { data: { session } } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

const token = session.access_token

// 2. Browse workshops
const workshopsRes = await fetch(
  'https://api.humanglue.com/api/workshops?pillar=adaptability&level=beginner'
)
const { data: workshops } = await workshopsRes.json()

// 3. Register for workshop
const registrationRes = await fetch(
  `https://api.humanglue.com/api/workshops/${workshopId}/register`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
)

const { data: registration } = await registrationRes.json()

// 4. Create payment intent if payment required
if (registration.requiresPayment) {
  const paymentRes = await fetch(
    'https://api.humanglue.com/.netlify/functions/create-payment-intent',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ workshopId })
    }
  )

  const { clientSecret } = await paymentRes.json()

  // 5. Complete payment with Stripe
  // (Use Stripe.js on frontend)

  // 6. Process payment on backend
  await fetch(
    'https://api.humanglue.com/.netlify/functions/process-payment',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        paymentIntentId: 'pi_xxx',
        workshopId
      })
    }
  )
}
```

### Complete Assessment Flow

```typescript
// 1. Create assessment
const assessmentRes = await fetch('https://api.humanglue.com/api/assessments', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    assessmentType: 'full'
  })
})

const { data: assessment } = await assessmentRes.json()

// 2. Submit answers
await fetch(
  `https://api.humanglue.com/api/assessments/${assessment.id}/answers`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      answers: [
        {
          questionId: 'q1',
          dimension: 'individual',
          answerType: 'scale',
          answerValue: 75,
          questionWeight: 1.0
        }
        // ... more answers
      ]
    })
  }
)

// 3. Complete assessment
await fetch(`https://api.humanglue.com/api/assessments/${assessment.id}`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ status: 'completed' })
})

// 4. Get results
const resultsRes = await fetch(
  `https://api.humanglue.com/api/assessments/${assessment.id}/results`,
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
)

const { data: results } = await resultsRes.json()
console.log('Overall Score:', results.scores.overall)
console.log('Readiness Level:', results.readinessLevel)
console.log('Recommendations:', results.recommendations)
```

---

## Support

For API support, contact: api-support@humanglue.com

For bugs or feature requests, open an issue on GitHub.
