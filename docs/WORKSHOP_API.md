# Workshop Registration API Documentation

Complete API documentation for the HumanGlue workshop registration system.

## Overview

The workshop registration API provides endpoints for:
- Browsing and searching workshops
- Viewing workshop details
- Registering for workshops
- Managing user registrations
- Tracking attendance (instructor/admin only)

## Base URL

```
/.netlify/functions
```

## Authentication

Most endpoints require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Rate Limiting

- Public endpoints: 100 requests/minute per IP
- Registration endpoint: 10 requests/minute per user
- Authenticated endpoints: Standard rate limiting applies

## Endpoints

### 1. List Workshops

Retrieve all published workshops with optional filtering.

**Endpoint:** `GET /workshops`

**Authentication:** Not required (public)

**Query Parameters:**
- `pillar` (optional): Filter by pillar - `adaptability`, `coaching`, or `marketplace`
- `level` (optional): Filter by level - `beginner`, `intermediate`, or `advanced`
- `format` (optional): Filter by format - `live`, `hybrid`, or `recorded`
- `is_featured` (optional): Filter featured workshops - `true` or `false`
- `search` (optional): Search in title, description, and tags
- `limit` (optional): Number of results (default: 20, max: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "AI Transformation Workshop",
      "description": "Learn to transform your organization with AI",
      "slug": "ai-transformation-workshop",
      "pillar": "adaptability",
      "level": "intermediate",
      "format": "live",
      "schedule_date": "2025-02-15",
      "schedule_time": "10:00:00",
      "duration_minutes": 180,
      "timezone": "UTC",
      "capacity_total": 30,
      "capacity_remaining": 12,
      "price_amount": 299.00,
      "price_early_bird": 249.00,
      "price_currency": "USD",
      "outcomes": ["Understand AI strategy", "Build transformation roadmap"],
      "tags": ["AI", "Strategy", "Leadership"],
      "thumbnail_url": "https://...",
      "is_featured": true,
      "instructor": {
        "full_name": "John Doe",
        "email": "john@example.com",
        "avatar_url": "https://..."
      }
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

**Status Codes:**
- `200`: Success
- `429`: Rate limit exceeded
- `500`: Server error

---

### 2. Get Workshop Details

Retrieve detailed information about a specific workshop.

**Endpoint:** `GET /workshops-detail?id={workshopId}`

**Authentication:** Not required for published workshops

**Query Parameters:**
- `id` (required): Workshop UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "AI Transformation Workshop",
    "description": "Comprehensive description...",
    "slug": "ai-transformation-workshop",
    "pillar": "adaptability",
    "level": "intermediate",
    "format": "live",
    "schedule_date": "2025-02-15",
    "schedule_time": "10:00:00",
    "duration_minutes": 180,
    "capacity_total": 30,
    "capacity_remaining": 12,
    "price_amount": 299.00,
    "syllabus": [
      {
        "module": "Introduction to AI",
        "duration": 60,
        "topics": ["AI Basics", "Use Cases"]
      }
    ],
    "instructor": {
      "id": "uuid",
      "full_name": "John Doe",
      "email": "john@example.com",
      "avatar_url": "https://...",
      "bio": "Expert in AI transformation..."
    },
    "stats": {
      "total_registered": 18,
      "completed": 12,
      "average_rating": 4.7,
      "spots_remaining": 12
    },
    "reviews": [
      {
        "id": "uuid",
        "rating": 5,
        "title": "Excellent workshop",
        "review_text": "Very informative and practical...",
        "created_at": "2025-01-15T10:00:00Z",
        "user_id": "uuid",
        "users": {
          "full_name": "Jane Smith",
          "avatar_url": "https://..."
        }
      }
    ]
  }
}
```

**Status Codes:**
- `200`: Success
- `404`: Workshop not found
- `500`: Server error

---

### 3. Register for Workshop

Create a workshop registration after successful payment.

**Endpoint:** `POST /workshops-register`

**Authentication:** Required

**Request Body:**
```json
{
  "workshopId": "uuid",
  "paymentId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully registered for workshop",
  "data": {
    "id": "uuid",
    "workshop_id": "uuid",
    "user_id": "uuid",
    "status": "registered",
    "price_paid": 299.00,
    "payment_id": "uuid",
    "attended": false,
    "registered_at": "2025-01-20T14:30:00Z",
    "workshop": {
      "id": "uuid",
      "title": "AI Transformation Workshop",
      "schedule_date": "2025-02-15",
      "instructor": {
        "full_name": "John Doe",
        "email": "john@example.com"
      }
    }
  }
}
```

**Status Codes:**
- `201`: Registration created
- `400`: Invalid request (workshop full, already registered, invalid payment)
- `401`: Unauthorized
- `403`: Payment doesn't belong to user
- `404`: Workshop or payment not found
- `429`: Rate limit exceeded
- `500`: Server error

**Validation:**
- Payment must exist and belong to the user
- Payment status must be "succeeded"
- Payment must be for the specified workshop
- Workshop must be published
- Workshop must have available capacity
- User must not be already registered

---

### 4. Get My Workshops

Retrieve all workshop registrations for the authenticated user.

**Endpoint:** `GET /workshops-my-workshops`

**Authentication:** Required

**Query Parameters:**
- `status` (optional): Filter by status - `registered`, `completed`, `cancelled`, or `no_show`
- `limit` (optional): Number of results (default: 50, max: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "workshop_id": "uuid",
      "user_id": "uuid",
      "status": "registered",
      "price_paid": 299.00,
      "payment_id": "uuid",
      "attended": false,
      "registered_at": "2025-01-20T14:30:00Z",
      "workshop": {
        "id": "uuid",
        "title": "AI Transformation Workshop",
        "schedule_date": "2025-02-15",
        "schedule_time": "10:00:00",
        "duration_minutes": 180,
        "instructor": {
          "full_name": "John Doe",
          "email": "john@example.com",
          "avatar_url": "https://..."
        }
      },
      "payment": {
        "id": "uuid",
        "amount": 299.00,
        "status": "succeeded",
        "transaction_id": "pi_xxx",
        "created_at": "2025-01-20T14:25:00Z"
      }
    }
  ],
  "categorized": {
    "upcoming": [...],
    "completed": [...],
    "cancelled": [...]
  },
  "pagination": {
    "total": 5,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `500`: Server error

---

### 5. Update Workshop Attendance

Mark attendance for a workshop registration (instructors and admins only).

**Endpoint:** `PATCH /workshops-attendance`

**Authentication:** Required (instructor or admin)

**Request Body:**
```json
{
  "registrationId": "uuid",
  "attended": true,
  "attendancePercentage": 95,
  "status": "completed"
}
```

**Fields:**
- `registrationId` (required): Registration UUID
- `attended` (optional): Boolean indicating if user attended
- `attendancePercentage` (optional): Number between 0-100
- `status` (optional): New status - `registered`, `completed`, `cancelled`, or `no_show`

**Response:**
```json
{
  "success": true,
  "message": "Attendance updated successfully",
  "data": {
    "id": "uuid",
    "workshop_id": "uuid",
    "user_id": "uuid",
    "status": "completed",
    "attended": true,
    "attendance_percentage": 95,
    "completed_at": "2025-02-15T13:00:00Z",
    "updated_at": "2025-02-15T13:00:00Z",
    "workshop": {
      "id": "uuid",
      "title": "AI Transformation Workshop",
      "instructor": {
        "full_name": "John Doe"
      }
    },
    "user": {
      "full_name": "Jane Smith",
      "email": "jane@example.com"
    }
  }
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid request
- `401`: Unauthorized
- `403`: Forbidden (not instructor or admin)
- `404`: Registration not found
- `500`: Server error

**Auto-completion:**
- If `attended = true` and `attendancePercentage >= 80`, status automatically becomes "completed"
- If `attended = false` and `attendancePercentage = 0`, status automatically becomes "no_show"

---

## Database Schema

### workshops table

```sql
- id: UUID (PK)
- title: TEXT
- description: TEXT
- slug: TEXT (unique)
- instructor_id: UUID (FK -> users)
- pillar: TEXT ('adaptability', 'coaching', 'marketplace')
- level: TEXT ('beginner', 'intermediate', 'advanced')
- format: TEXT ('live', 'hybrid', 'recorded')
- schedule_date: DATE
- schedule_time: TIME
- duration_minutes: INTEGER
- timezone: TEXT
- capacity_total: INTEGER
- capacity_remaining: INTEGER
- price_amount: DECIMAL(10,2)
- price_early_bird: DECIMAL(10,2)
- price_currency: TEXT
- outcomes: TEXT[]
- tags: TEXT[]
- syllabus: JSONB
- status: TEXT ('draft', 'published', 'archived', 'cancelled')
- is_featured: BOOLEAN
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### workshop_registrations table

```sql
- id: UUID (PK)
- workshop_id: UUID (FK -> workshops)
- user_id: UUID (FK -> users)
- status: TEXT ('registered', 'completed', 'cancelled', 'no_show')
- price_paid: DECIMAL(10,2)
- payment_id: UUID (FK -> payments)
- attended: BOOLEAN
- attendance_percentage: INTEGER (0-100)
- completed_at: TIMESTAMPTZ
- certificate_id: UUID (FK -> certificates)
- rating: INTEGER (1-5)
- review: TEXT
- registered_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
- UNIQUE(workshop_id, user_id)
```

## Database Triggers

### Auto-decrement capacity on registration
When a new registration is created with status 'registered', the workshop's `capacity_remaining` is automatically decremented.

### Auto-increment capacity on cancellation
When a registration status changes from 'registered' to 'cancelled', the workshop's `capacity_remaining` is automatically incremented.

## Row Level Security (RLS)

### Workshops
- Anyone can view published workshops
- Instructors can view their own workshops
- Instructors can create and update their own workshops
- Admins can manage all workshops

### Workshop Registrations
- Users can view their own registrations
- Instructors can view registrations for their workshops
- Users can register for workshops
- Users can cancel their own registrations
- Admins can manage all registrations

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error description",
  "message": "Additional details (optional)"
}
```

Common error scenarios:
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **400 Bad Request**: Invalid input or business rule violation
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Unexpected server error

## Integration with Payment System

The workshop registration flow integrates with the payment system:

1. User selects a workshop
2. User initiates payment via `/create-payment-intent`
3. Payment is processed via Stripe
4. On success, user calls `/workshops-register` with `paymentId`
5. System validates payment and creates registration
6. Workshop capacity is automatically decremented

## Future Enhancements

Planned features (marked with TODO in code):
- Email confirmation after registration
- Calendar integration (iCal/Google Calendar)
- Instructor notifications for new registrations
- Automated certificate generation
- Waitlist functionality
- Refund processing
- Workshop reminders
- Post-workshop surveys

## Testing

### Test Scenarios

1. **Browse workshops**
   - Filter by pillar, level, format
   - Search by keywords
   - Pagination

2. **View workshop details**
   - Published workshop (public)
   - Draft workshop (instructor only)
   - Non-existent workshop

3. **Register for workshop**
   - Successful registration
   - Already registered
   - Workshop full
   - Invalid payment
   - Workshop not published

4. **View my workshops**
   - All registrations
   - Filter by status
   - Categorized view

5. **Update attendance**
   - As instructor
   - As admin
   - As regular user (should fail)
   - Auto-completion scenarios

### Example cURL Commands

**List workshops:**
```bash
curl -X GET "https://yoursite.com/.netlify/functions/workshops?pillar=adaptability&limit=10"
```

**Get workshop details:**
```bash
curl -X GET "https://yoursite.com/.netlify/functions/workshops-detail?id=uuid"
```

**Register for workshop:**
```bash
curl -X POST "https://yoursite.com/.netlify/functions/workshops-register" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"workshopId":"uuid","paymentId":"uuid"}'
```

**Get my workshops:**
```bash
curl -X GET "https://yoursite.com/.netlify/functions/workshops-my-workshops" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Update attendance:**
```bash
curl -X PATCH "https://yoursite.com/.netlify/functions/workshops-attendance" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"registrationId":"uuid","attended":true,"attendancePercentage":95}'
```

## Notes

- All timestamps are in ISO 8601 format (UTC)
- All UUIDs are v4
- All prices are in the specified currency (default: USD)
- Rate limiting is implemented in-memory (consider Redis for production)
- CORS is enabled for all origins (configure for production)
