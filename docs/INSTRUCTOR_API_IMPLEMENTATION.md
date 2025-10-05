# Instructor Dashboard API - Implementation Guide

## Overview

This document provides implementation details and usage examples for the HumanGlue Instructor Dashboard API.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Setup & Configuration](#setup--configuration)
3. [Authentication Flow](#authentication-flow)
4. [API Usage Examples](#api-usage-examples)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

---

## Project Structure

```
humanGLue_brain/
├── app/api/instructor/
│   ├── students/
│   │   ├── route.ts              # GET students list, POST bulk email
│   │   ├── [studentId]/route.ts  # GET student detail
│   │   └── export/route.ts       # POST export students
│   ├── analytics/
│   │   ├── revenue/route.ts      # GET revenue data
│   │   ├── enrollments/route.ts  # GET enrollment stats
│   │   ├── engagement/route.ts   # GET engagement metrics
│   │   └── export/route.ts       # POST export analytics
│   ├── profile/
│   │   ├── route.ts              # GET/PUT profile
│   │   ├── upload/route.ts       # POST upload images
│   │   └── stats/route.ts        # GET teaching stats
│   ├── settings/
│   │   ├── route.ts              # GET/PUT settings
│   │   ├── change-password/route.ts
│   │   ├── 2fa/route.ts
│   │   └── sessions/
│   │       ├── route.ts          # GET sessions
│   │       └── revoke/route.ts   # POST revoke session
│   ├── courses/
│   │   ├── route.ts              # GET/POST courses
│   │   ├── [courseId]/
│   │   │   ├── route.ts          # GET/PUT/DELETE course
│   │   │   └── analytics/route.ts
│   └── workshops/
│       ├── route.ts              # GET/POST workshops
│       ├── [workshopId]/
│       │   ├── route.ts          # GET/PUT/DELETE workshop
│       │   ├── attendance/route.ts
│       │   └── enrollment/route.ts
│
├── lib/
│   ├── api/
│   │   ├── instructor-auth.ts    # Auth helpers
│   │   └── instructor-errors.ts  # Error handling
│   └── validation/
│       └── instructor-schemas.ts # Zod schemas
│
└── docs/
    ├── API_DESIGN_INSTRUCTOR_DASHBOARD.md
    └── INSTRUCTOR_API_IMPLEMENTATION.md
```

---

## Setup & Configuration

### 1. Environment Variables

Create or update `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Upstash Redis (for rate limiting)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Email Service (for bulk emails)
RESEND_API_KEY=your_resend_key

# File Storage
NEXT_PUBLIC_STORAGE_BUCKET=instructor-uploads
```

### 2. Database Setup

Ensure the multi-tenant schema is applied:

```bash
cd supabase
supabase db reset
supabase db push
```

### 3. Add Instructor Role to Users

Update user metadata to mark as instructor:

```sql
-- Mark a user as instructor
UPDATE users
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{isInstructor}',
  'true'::jsonb
)
WHERE id = 'user-uuid-here';
```

Or use Supabase client:

```typescript
const { error } = await supabase
  .from('users')
  .update({
    metadata: {
      ...user.metadata,
      isInstructor: true
    }
  })
  .eq('id', userId)
```

### 4. Install Dependencies

```bash
npm install zod @upstash/redis @upstash/ratelimit resend
```

---

## Authentication Flow

### Client-Side Authentication

```typescript
// Login and get JWT token
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'instructor@example.com',
  password: 'password123'
})

// Get session token
const { data: { session } } = await supabase.auth.getSession()
const token = session?.access_token
```

### Making Authenticated Requests

```typescript
// Client-side API call
async function getStudents() {
  const { data: { session } } = await supabase.auth.getSession()

  const response = await fetch('/api/instructor/students?page=1&limit=20', {
    headers: {
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json'
    }
  })

  const data = await response.json()
  return data
}
```

### Server-Side Authentication Check

The API automatically handles authentication:

```typescript
// In route.ts
import { requireInstructor } from '@/lib/api/instructor-auth'

export async function GET(request: NextRequest) {
  // This will throw if user is not authenticated or not an instructor
  const { instructorId, user } = await requireInstructor(request)

  // Proceed with authenticated logic
}
```

---

## API Usage Examples

### 1. Students Management

#### Get Students List

```typescript
// Fetch students with filters
const response = await fetch(
  '/api/instructor/students?' + new URLSearchParams({
    page: '1',
    limit: '20',
    status: 'active',
    engagement: 'high',
    search: 'john',
    sortBy: 'engagement',
    sortOrder: 'desc'
  }),
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
)

const { success, data, meta } = await response.json()

// Response structure:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "enrolledCourses": 3,
      "averageProgress": 75,
      "engagementScore": 92,
      "status": "active",
      // ... more fields
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

#### Get Student Detail

```typescript
const response = await fetch(
  `/api/instructor/students/${studentId}`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
)

const { success, data } = await response.json()

// Includes detailed course progress, activity timeline, stats
```

#### Send Bulk Email

```typescript
const response = await fetch('/api/instructor/students/bulk-email', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    studentIds: ['uuid1', 'uuid2', 'uuid3'],
    subject: 'Important Course Update',
    message: 'Hello students, ...',
    includeCourseLink: true,
    courseId: 'course-uuid'
  })
})

const { success, data } = await response.json()
// data: { sent: 3, failed: 0, emailIds: [...] }
```

### 2. Analytics

#### Get Revenue Data

```typescript
const response = await fetch(
  '/api/instructor/analytics/revenue?' + new URLSearchParams({
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2025-03-31T23:59:59Z',
    granularity: 'week',
    courseId: 'course-uuid' // optional
  }),
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
)

const { success, data } = await response.json()

// Response:
{
  "success": true,
  "data": {
    "timeSeries": [
      {
        "date": "2025-01-01",
        "revenue": 1250.00,
        "enrollments": 15,
        "courses": 1000.00,
        "workshops": 250.00
      },
      // ... more data points
    ],
    "summary": {
      "totalRevenue": 45000.00,
      "averageRevenue": 2500.00,
      "growthRate": 15.5,
      "previousPeriodRevenue": 38000.00
    },
    "breakdown": {
      "courses": 35000.00,
      "workshops": 10000.00,
      "consultations": 0
    }
  }
}
```

#### Get Enrollment Statistics

```typescript
const response = await fetch(
  '/api/instructor/analytics/enrollments?' + new URLSearchParams({
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2025-03-31T23:59:59Z',
    groupBy: 'course'
  }),
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
)

// Response includes total, active, completed, dropped counts
// Plus trends and breakdowns by course/pillar
```

### 3. Profile Management

#### Get Profile

```typescript
const response = await fetch('/api/instructor/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

const { success, data } = await response.json()
// data: InstructorProfile with all fields
```

#### Update Profile

```typescript
const response = await fetch('/api/instructor/profile', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Dr. Jane Smith',
    title: 'AI Transformation Expert',
    bio: 'Experienced AI strategist with 15+ years...',
    expertise: ['AI Strategy', 'Digital Transformation', 'Change Management'],
    yearsExperience: 15,
    languages: ['en', 'es', 'fr'],
    education: [
      {
        degree: 'PhD Computer Science',
        institution: 'MIT',
        year: '2010',
        fieldOfStudy: 'Artificial Intelligence'
      }
    ],
    certifications: [
      {
        name: 'Certified AI Practitioner',
        issuer: 'AI Institute',
        date: '2023-06',
        credentialUrl: 'https://credentials.ai/...'
      }
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/janesmith',
      twitter: 'https://twitter.com/janesmith',
      website: 'https://janesmith.com'
    }
  })
})
```

#### Upload Profile Image

```typescript
const formData = new FormData()
formData.append('type', 'avatar') // or 'cover'
formData.append('file', imageFile) // File object

const response = await fetch('/api/instructor/profile/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})

const { success, data } = await response.json()
// data: { url: 'https://...', type: 'avatar', uploadedAt: '...' }
```

### 4. Settings

#### Update Settings

```typescript
const response = await fetch('/api/instructor/settings', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    notifications: {
      emailNotifications: {
        newEnrollments: true,
        comments: true,
        reviews: true
      },
      frequency: 'daily'
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      displayStudentCount: true
    },
    teaching: {
      autoApproveEnrollments: true,
      allowQA: true,
      allowReviews: true
    }
  })
})
```

#### Change Password

```typescript
const response = await fetch('/api/instructor/settings/change-password', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    currentPassword: 'oldPassword123',
    newPassword: 'NewSecure@Pass123',
    confirmPassword: 'NewSecure@Pass123'
  })
})
```

### 5. Courses

#### Get Courses

```typescript
const response = await fetch(
  '/api/instructor/courses?' + new URLSearchParams({
    page: '1',
    limit: '10',
    status: 'published',
    sortBy: 'enrollments',
    sortOrder: 'desc'
  }),
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
)
```

#### Create Course

```typescript
const response = await fetch('/api/instructor/courses', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Advanced AI Strategy for Leaders',
    description: 'A comprehensive course on AI transformation...',
    pillar: 'adaptability',
    level: 'advanced',
    prerequisites: ['Basic AI knowledge', 'Leadership experience'],
    learningOutcomes: [
      'Develop AI transformation roadmap',
      'Lead AI adoption initiatives',
      'Measure AI impact on business'
    ],
    priceAmount: 299.99,
    currency: 'USD'
  })
})

const { success, data } = await response.json()
// data: { id, slug, status: 'draft', createdAt }
```

### 6. Workshops

#### Get Workshops

```typescript
const response = await fetch(
  '/api/instructor/workshops?' + new URLSearchParams({
    page: '1',
    status: 'upcoming',
    pillar: 'coaching',
    sortBy: 'startTime'
  }),
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
)
```

#### Create Workshop

```typescript
const response = await fetch('/api/instructor/workshops', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'AI Leadership Workshop',
    description: 'Interactive workshop on leading AI teams...',
    pillar: 'coaching',
    level: 'intermediate',
    format: 'online',
    meetingUrl: 'https://zoom.us/j/...',
    durationHours: 3,
    capacityTotal: 50,
    priceAmount: 149.99,
    priceEarlyBird: 99.99,
    earlyBirdDeadline: '2025-10-15T00:00:00Z',
    startTime: '2025-10-20T14:00:00Z',
    endTime: '2025-10-20T17:00:00Z',
    timezone: 'America/New_York',
    waitlistEnabled: true
  })
})
```

---

## Error Handling

### Standard Error Response

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "fields": [
        {
          "field": "email",
          "message": "Invalid email format"
        }
      ]
    },
    "timestamp": "2025-10-04T16:30:00Z"
  }
}
```

### Error Code Reference

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_INSTRUCTOR` | 403 | User is not an instructor |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

### Client-Side Error Handling

```typescript
async function apiCall() {
  try {
    const response = await fetch('/api/instructor/students', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    const result = await response.json()

    if (!result.success) {
      // Handle API error
      console.error(`Error ${result.error.code}: ${result.error.message}`)

      if (result.error.code === 'VALIDATION_ERROR') {
        // Show validation errors to user
        result.error.details?.fields?.forEach(field => {
          console.log(`${field.field}: ${field.message}`)
        })
      }

      return null
    }

    return result.data

  } catch (error) {
    // Handle network error
    console.error('Network error:', error)
    return null
  }
}
```

---

## Testing

### Manual Testing with cURL

```bash
# Get students
curl -X GET "http://localhost:3000/api/instructor/students?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create workshop
curl -X POST "http://localhost:3000/api/instructor/workshops" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Workshop",
    "description": "A test workshop for API validation...",
    "pillar": "adaptability",
    "level": "beginner",
    "format": "online",
    "durationHours": 2,
    "capacityTotal": 30,
    "priceAmount": 99,
    "startTime": "2025-11-01T14:00:00Z",
    "endTime": "2025-11-01T16:00:00Z",
    "timezone": "UTC"
  }'
```

### Integration Testing

Create test file: `__tests__/api/instructor/students.test.ts`

```typescript
import { createMocks } from 'node-mocks-http'
import { GET } from '@/app/api/instructor/students/route'

describe('GET /api/instructor/students', () => {
  it('returns students list for authenticated instructor', async () => {
    const { req } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer test-token'
      },
    })

    const response = await GET(req as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
  })

  it('returns 401 for unauthenticated request', async () => {
    const { req } = createMocks({
      method: 'GET',
    })

    const response = await GET(req as any)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('UNAUTHORIZED')
  })
})
```

---

## Deployment

### Vercel Deployment

1. **Environment Variables**: Set all required env vars in Vercel dashboard

2. **Deploy**:
```bash
vercel --prod
```

3. **Verify Deployment**:
```bash
curl https://your-domain.vercel.app/api/instructor/students \
  -H "Authorization: Bearer TOKEN"
```

### Netlify Deployment

1. **Configure netlify.toml**:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

2. **Deploy**:
```bash
netlify deploy --prod
```

---

## Troubleshooting

### Common Issues

#### 1. 401 Unauthorized

**Problem**: All requests return 401
**Solution**:
- Verify JWT token is valid
- Check Supabase auth configuration
- Ensure user has `isInstructor: true` in metadata

```typescript
// Check user metadata
const { data: user } = await supabase
  .from('users')
  .select('metadata')
  .eq('id', userId)
  .single()

console.log(user.metadata.isInstructor) // Should be true
```

#### 2. Empty Students List

**Problem**: API returns empty array
**Solution**:
- Ensure courses have `instructor_id` set (TODO: add to schema)
- Verify course enrollments exist
- Check RLS policies allow instructor to see enrollments

#### 3. Validation Errors

**Problem**: Requests fail with VALIDATION_ERROR
**Solution**:
- Check request payload matches schema exactly
- Review error details for specific field issues
- Ensure data types match (numbers vs strings)

#### 4. Rate Limit Issues

**Problem**: 429 Too Many Requests
**Solution**:
- Implement request debouncing on frontend
- Add exponential backoff for retries
- Contact admin to increase limits

```typescript
// Exponential backoff example
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, options)

    if (response.status !== 429) {
      return response
    }

    const retryAfter = response.headers.get('Retry-After') || Math.pow(2, i)
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
  }

  throw new Error('Max retries exceeded')
}
```

---

## Next Steps

1. **Rate Limiting**: Implement Upstash Redis rate limiting
2. **Caching**: Add Redis caching for frequently accessed data
3. **Webhooks**: Set up webhooks for real-time notifications
4. **Analytics Enhancement**: Add more detailed metrics and charts
5. **Email Service**: Integrate Resend for bulk emails
6. **File Uploads**: Implement Supabase Storage for images/documents
7. **OpenAPI Spec**: Generate Swagger documentation
8. **SDK**: Create TypeScript SDK for easier integration

---

## Support

For issues or questions:
- Check the [API Design Document](./API_DESIGN_INSTRUCTOR_DASHBOARD.md)
- Review error codes and messages
- Contact: engineering@humanglue.ai
