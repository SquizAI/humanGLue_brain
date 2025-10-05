# Instructor Dashboard API - Endpoints Quick Reference

## Base URL
```
https://app.humanglue.ai/api
```

## Authentication
All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

---

## Students Management

### List Students
```http
GET /api/instructor/students
```

**Query Parameters:**
- `page` (number) - Page number, default: 1
- `limit` (number) - Items per page, default: 20, max: 100
- `search` (string) - Search by name or email
- `status` (enum) - Filter: all | active | inactive | completed
- `engagement` (enum) - Filter: all | high | medium | low
- `course` (uuid) - Filter by course ID
- `sortBy` (enum) - Sort: name | progress | engagement | lastActive
- `sortOrder` (enum) - Order: asc | desc

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [Student],
  "meta": PaginationMeta
}
```

### Get Student Detail
```http
GET /api/instructor/students/:studentId
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": StudentDetail
}
```

### Send Bulk Email
```http
POST /api/instructor/students/bulk-email
```

**Request Body:**
```json
{
  "studentIds": ["uuid"],
  "subject": "string",
  "message": "string",
  "includeCourseLink": boolean,
  "courseId": "uuid"
}
```

**Response:** `200 OK`

### Export Students
```http
POST /api/instructor/students/export
```

**Request Body:**
```json
{
  "format": "csv" | "xlsx",
  "filters": {
    "status": "all" | "active" | "inactive" | "completed",
    "engagement": "all" | "high" | "medium" | "low",
    "course": "uuid"
  },
  "fields": ["string"]
}
```

**Response:** `200 OK`

---

## Analytics

### Get Revenue Data
```http
GET /api/instructor/analytics/revenue
```

**Query Parameters:**
- `startDate` (ISO datetime) - Start date, default: 90 days ago
- `endDate` (ISO datetime) - End date, default: today
- `granularity` (enum) - day | week | month, default: day
- `courseId` (uuid) - Filter by course

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "timeSeries": [RevenueDataPoint],
    "summary": RevenueSummary,
    "breakdown": RevenueBreakdown
  }
}
```

### Get Enrollment Statistics
```http
GET /api/instructor/analytics/enrollments
```

**Query Parameters:**
- `startDate` (ISO datetime)
- `endDate` (ISO datetime)
- `courseId` (uuid)
- `groupBy` (enum) - course | date | pillar

**Response:** `200 OK`

### Get Engagement Metrics
```http
GET /api/instructor/analytics/engagement
```

**Query Parameters:**
- `startDate` (ISO datetime)
- `endDate` (ISO datetime)
- `courseId` (uuid)
- `metric` (enum) - all | watch_time | completion_rate | quiz_scores | activity

**Response:** `200 OK`

### Get Course Performance
```http
GET /api/instructor/analytics/course-performance
```

**Response:** `200 OK`

### Export Analytics
```http
POST /api/instructor/analytics/export
```

**Request Body:**
```json
{
  "format": "pdf" | "csv",
  "reportType": "revenue" | "enrollments" | "engagement" | "comprehensive",
  "startDate": "ISO datetime",
  "endDate": "ISO datetime",
  "courseIds": ["uuid"]
}
```

**Response:** `200 OK`

---

## Profile Management

### Get Profile
```http
GET /api/instructor/profile
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": InstructorProfile
}
```

### Update Profile
```http
PUT /api/instructor/profile
```

**Request Body:**
```json
{
  "name": "string",
  "title": "string",
  "bio": "string",
  "expertise": ["string"],
  "yearsExperience": number,
  "languages": ["string"],
  "timezone": "string",
  "education": [Education],
  "certifications": [Certification],
  "workExperience": [WorkExperience],
  "socialLinks": SocialLinks
}
```

**Response:** `200 OK`

### Upload Profile Image
```http
POST /api/instructor/profile/upload
```

**Request:** `multipart/form-data`
- `type`: "avatar" | "cover"
- `file`: File (max 5MB, jpg/png/webp)

**Response:** `200 OK`

### Get Teaching Stats
```http
GET /api/instructor/profile/stats
```

**Response:** `200 OK`

---

## Settings

### Get Settings
```http
GET /api/instructor/settings
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": InstructorSettings
}
```

### Update Settings
```http
PUT /api/instructor/settings
```

**Request Body:**
```json
{
  "general": GeneralSettings,
  "notifications": NotificationSettings,
  "privacy": PrivacySettings,
  "payment": PaymentSettings,
  "teaching": TeachingPreferences
}
```

**Response:** `200 OK`

### Change Password
```http
POST /api/instructor/settings/change-password
```

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string",
  "confirmPassword": "string"
}
```

**Response:** `200 OK`

### Toggle 2FA
```http
POST /api/instructor/settings/2fa
```

**Request Body:**
```json
{
  "enable": boolean,
  "verificationCode": "string"
}
```

**Response:** `200 OK`

### Get Active Sessions
```http
GET /api/instructor/settings/sessions
```

**Response:** `200 OK`

### Revoke Session
```http
POST /api/instructor/settings/sessions/revoke
```

**Request Body:**
```json
{
  "sessionId": "uuid"
}
```

**Response:** `200 OK`

### Export Data (GDPR)
```http
POST /api/instructor/settings/export-data
```

**Request Body:**
```json
{
  "format": "json" | "csv",
  "includeStudentData": boolean
}
```

**Response:** `200 OK`

---

## Courses

### List Courses
```http
GET /api/instructor/courses
```

**Query Parameters:**
- `page` (number)
- `limit` (number)
- `status` (enum) - all | published | draft | archived
- `sortBy` (enum) - title | enrollments | revenue | rating | createdAt
- `sortOrder` (enum) - asc | desc

**Response:** `200 OK`

### Create Course
```http
POST /api/instructor/courses
```

**Request Body:**
```json
{
  "title": "string (10-200)",
  "description": "string (50-5000)",
  "pillar": "adaptability" | "coaching" | "marketplace",
  "level": "beginner" | "intermediate" | "advanced",
  "prerequisites": ["string"],
  "learningOutcomes": ["string"],
  "priceAmount": number,
  "currency": "string"
}
```

**Response:** `201 Created`

### Get Course Detail
```http
GET /api/instructor/courses/:courseId
```

**Response:** `200 OK`

### Update Course
```http
PUT /api/instructor/courses/:courseId
```

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "level": "beginner" | "intermediate" | "advanced",
  "prerequisites": ["string"],
  "learningOutcomes": ["string"],
  "priceAmount": number,
  "thumbnailUrl": "string",
  "status": "published" | "draft" | "archived"
}
```

**Response:** `200 OK`

### Get Course Analytics
```http
GET /api/instructor/courses/:courseId/analytics
```

**Response:** `200 OK`

---

## Workshops

### List Workshops
```http
GET /api/instructor/workshops
```

**Query Parameters:**
- `page` (number)
- `limit` (number)
- `status` (enum) - all | upcoming | in-progress | completed | cancelled
- `pillar` (enum) - adaptability | coaching | marketplace
- `startDate` (ISO datetime)
- `endDate` (ISO datetime)
- `sortBy` (enum) - startTime | enrollments | revenue
- `sortOrder` (enum) - asc | desc

**Response:** `200 OK`

### Create Workshop
```http
POST /api/instructor/workshops
```

**Request Body:**
```json
{
  "title": "string (10-200)",
  "description": "string (50-2000)",
  "pillar": "adaptability" | "coaching" | "marketplace",
  "level": "beginner" | "intermediate" | "advanced",
  "format": "online" | "in-person" | "hybrid",
  "location": "string",
  "meetingUrl": "string",
  "durationHours": number,
  "capacityTotal": number,
  "priceAmount": number,
  "priceEarlyBird": number,
  "earlyBirdDeadline": "ISO datetime",
  "startTime": "ISO datetime",
  "endTime": "ISO datetime",
  "timezone": "string",
  "waitlistEnabled": boolean
}
```

**Response:** `201 Created`

### Get Workshop Detail
```http
GET /api/instructor/workshops/:workshopId
```

**Response:** `200 OK`

### Update Workshop
```http
PUT /api/instructor/workshops/:workshopId
```

**Response:** `200 OK`

### Get Workshop Attendance
```http
GET /api/instructor/workshops/:workshopId/attendance
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "workshopId": "uuid",
    "workshopTitle": "string",
    "totalRegistrations": number,
    "totalAttended": number,
    "attendanceRate": number,
    "registrations": [WorkshopRegistration]
  }
}
```

### Update Workshop Enrollment
```http
PUT /api/instructor/workshops/:workshopId/enrollment
```

**Request Body:**
```json
{
  "capacityTotal": number,
  "priceAmount": number,
  "priceEarlyBird": number,
  "earlyBirdDeadline": "ISO datetime",
  "waitlistEnabled": boolean,
  "status": "published" | "cancelled"
}
```

**Response:** `200 OK`

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {},
    "timestamp": "ISO datetime"
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_INSTRUCTOR` | 403 | User is not an instructor |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `NOT_FOUND` | 404 | Resource not found |
| `ALREADY_EXISTS` | 409 | Resource conflict |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limits

| Endpoint Category | Limit | Window |
|------------------|-------|--------|
| Read (GET) | 100 requests | 1 minute |
| Write (POST/PUT/PATCH) | 30 requests | 1 minute |
| Export | 5 requests | 1 minute |
| Email | 10 requests | 1 hour |

### Rate Limit Headers

All responses include:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1696435200
```

---

## Implementation Status

✅ **Fully Implemented** (5 endpoints)
- GET /api/instructor/students
- GET /api/instructor/students/:studentId
- GET /api/instructor/analytics/revenue
- GET /api/instructor/workshops
- POST /api/instructor/workshops

📋 **Designed & Ready** (24 endpoints)
- All other endpoints have complete schemas and documentation

---

## Quick Start

### 1. Get JWT Token
```typescript
const { data: { session } } = await supabase.auth.getSession()
const token = session?.access_token
```

### 2. Make Request
```typescript
const response = await fetch('/api/instructor/students', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})

const result = await response.json()
```

### 3. Handle Response
```typescript
if (result.success) {
  console.log(result.data)
  console.log(result.meta) // pagination info
} else {
  console.error(result.error.code, result.error.message)
}
```

---

## Related Documentation

- [API Design Document](./API_DESIGN_INSTRUCTOR_DASHBOARD.md) - Complete API specification
- [Implementation Guide](./INSTRUCTOR_API_IMPLEMENTATION.md) - Usage examples and troubleshooting
- [API Summary](./INSTRUCTOR_API_SUMMARY.md) - High-level overview

---

**Last Updated**: 2025-10-04
**Version**: 1.0
