# HumanGlue Instructor Dashboard API Design Document

**Version:** 1.0
**Date:** 2025-10-04
**Author:** Claude (API Architecture Expert)

## Table of Contents
1. [Overview](#overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [API Endpoints](#api-endpoints)
   - [Students Management](#1-students-management)
   - [Analytics](#2-analytics)
   - [Profile Management](#3-profile-management)
   - [Settings](#4-settings)
   - [Courses](#5-courses)
   - [Workshops](#6-workshops)
4. [Data Schemas](#data-schemas)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Implementation Examples](#implementation-examples)

---

## Overview

This document outlines the REST API design for the HumanGlue instructor dashboard. All endpoints follow RESTful conventions and implement:

- **Multi-tenant architecture** with organization-level isolation
- **Row-level security** through Supabase RLS policies
- **Type-safe TypeScript** interfaces
- **Zod validation** for request payloads
- **Comprehensive error handling**
- **Pagination** for list endpoints
- **Rate limiting** to prevent abuse

### Base URL
```
https://app.humanglue.ai/api
```

### Technology Stack
- **Runtime:** Next.js 14 App Router
- **Database:** Supabase (PostgreSQL)
- **Validation:** Zod
- **Authentication:** Supabase Auth (JWT)
- **Rate Limiting:** Upstash Redis

---

## Authentication & Authorization

All instructor endpoints require authentication and instructor role verification.

### Authentication Flow
1. Client includes JWT token in `Authorization` header
2. API verifies token with Supabase Auth
3. RLS policies enforce data access at database level

### Authorization Headers
```typescript
headers: {
  'Authorization': 'Bearer <supabase_jwt_token>',
  'Content-Type': 'application/json'
}
```

### Role Requirements
- All endpoints require `instructor_id` to match authenticated user
- Instructors can only access data they created
- Platform admins can access all instructor data (not implemented in this doc)

---

## API Endpoints

## 1. Students Management

### 1.1 Get Students List

**Endpoint:** `GET /api/instructor/students`

**Description:** Retrieve paginated list of students enrolled in instructor's courses with filtering, sorting, and search capabilities.

**Query Parameters:**
```typescript
interface GetStudentsQuery {
  page?: number;           // Default: 1
  limit?: number;          // Default: 20, Max: 100
  search?: string;         // Search by name or email
  status?: 'all' | 'active' | 'inactive' | 'completed';
  engagement?: 'all' | 'high' | 'medium' | 'low'; // high: >=80, medium: 50-79, low: <50
  course?: string;         // Filter by course_id
  sortBy?: 'name' | 'progress' | 'engagement' | 'lastActive'; // Default: lastActive
  sortOrder?: 'asc' | 'desc'; // Default: desc
}
```

**Response Schema:**
```typescript
interface GetStudentsResponse {
  success: true;
  data: Student[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  enrolledCourses: number;
  completedCourses: number;
  averageProgress: number; // 0-100
  lastActive: string;      // ISO timestamp
  lastActivityDate: string; // ISO timestamp
  engagementScore: number;  // 0-100
  totalWatchTime: string;   // "24h 30m" format
  assignmentsCompleted: number;
  assignmentsTotal: number;
  status: 'active' | 'inactive' | 'completed';
  enrollmentDate: string;   // ISO date
  courses: EnrolledCourse[];
  recentActivity: ActivityItem[];
}

interface EnrolledCourse {
  id: string;
  name: string;
  progress: number;
  lastAccessed: string;
  grade: number;
  assignments: {
    completed: number;
    total: number;
  };
}

interface ActivityItem {
  type: 'assignment' | 'lesson' | 'discussion' | 'completion' | 'review';
  description: string;
  time: string; // Relative time: "2 hours ago"
  timestamp: string; // ISO timestamp
}
```

**Example Request:**
```bash
GET /api/instructor/students?page=1&limit=20&status=active&engagement=high&sortBy=engagement
Authorization: Bearer <token>
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Sarah Chen",
      "email": "sarah.chen@techcorp.com",
      "avatar": "https://storage.supabase.co/avatars/user123.jpg",
      "enrolledCourses": 3,
      "completedCourses": 1,
      "averageProgress": 78,
      "lastActive": "2 hours ago",
      "lastActivityDate": "2025-10-04T14:30:00Z",
      "engagementScore": 95,
      "totalWatchTime": "24h 30m",
      "assignmentsCompleted": 18,
      "assignmentsTotal": 22,
      "status": "active",
      "enrollmentDate": "2025-09-01",
      "courses": [
        {
          "id": "course-1",
          "name": "AI Transformation for Executives",
          "progress": 85,
          "lastAccessed": "2 hours ago",
          "grade": 92,
          "assignments": { "completed": 8, "total": 10 }
        }
      ],
      "recentActivity": [
        {
          "type": "assignment",
          "description": "Submitted 'AI Strategy Planning' assignment",
          "time": "2 hours ago",
          "timestamp": "2025-10-04T14:30:00Z"
        }
      ]
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

### 1.2 Get Student Detail

**Endpoint:** `GET /api/instructor/students/:studentId`

**Description:** Get detailed information about a specific student including all course enrollments and complete activity history.

**Response Schema:**
```typescript
interface GetStudentDetailResponse {
  success: true;
  data: StudentDetail;
}

interface StudentDetail extends Student {
  phone?: string;
  timezone: string;
  organization: {
    id: string;
    name: string;
  };
  courseDetails: CourseDetail[];
  activityTimeline: ActivityTimelineItem[];
  stats: {
    totalLessonsCompleted: number;
    totalLessonsTotal: number;
    totalQuizzesPassed: number;
    totalQuizzesTotal: number;
    averageQuizScore: number;
    certificatesEarned: number;
  };
}

interface CourseDetail extends EnrolledCourse {
  enrolledAt: string;
  completedAt?: string;
  certificateUrl?: string;
  modules: ModuleProgress[];
}

interface ModuleProgress {
  id: string;
  name: string;
  progress: number;
  lessons: LessonProgress[];
}

interface LessonProgress {
  id: string;
  name: string;
  type: 'video' | 'article' | 'quiz' | 'assignment';
  completed: boolean;
  timeSpent: number; // seconds
  lastAccessed?: string;
}

interface ActivityTimelineItem extends ActivityItem {
  courseId?: string;
  courseName?: string;
  metadata: Record<string, any>;
}
```

### 1.3 Send Bulk Email

**Endpoint:** `POST /api/instructor/students/bulk-email`

**Description:** Send email to multiple selected students.

**Request Schema:**
```typescript
interface BulkEmailRequest {
  studentIds: string[];
  subject: string;
  message: string;
  includeCourseLink?: boolean;
  courseId?: string;
}
```

**Response Schema:**
```typescript
interface BulkEmailResponse {
  success: true;
  data: {
    sent: number;
    failed: number;
    emailIds: string[];
  };
}
```

**Validation:**
```typescript
const bulkEmailSchema = z.object({
  studentIds: z.array(z.string().uuid()).min(1).max(100),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
  includeCourseLink: z.boolean().optional(),
  courseId: z.string().uuid().optional(),
});
```

### 1.4 Export Students Data

**Endpoint:** `POST /api/instructor/students/export`

**Description:** Generate CSV export of student data with applied filters.

**Request Schema:**
```typescript
interface ExportStudentsRequest {
  format: 'csv' | 'xlsx';
  filters?: {
    status?: 'all' | 'active' | 'inactive' | 'completed';
    engagement?: 'all' | 'high' | 'medium' | 'low';
    course?: string;
  };
  fields?: string[]; // Optional: specify which fields to include
}
```

**Response Schema:**
```typescript
interface ExportStudentsResponse {
  success: true;
  data: {
    downloadUrl: string;
    expiresAt: string;
    fileSize: number;
    recordCount: number;
  };
}
```

---

## 2. Analytics

### 2.1 Get Revenue Data

**Endpoint:** `GET /api/instructor/analytics/revenue`

**Description:** Get revenue time series data with granular breakdown.

**Query Parameters:**
```typescript
interface GetRevenueQuery {
  startDate?: string;     // ISO date, default: 90 days ago
  endDate?: string;       // ISO date, default: today
  granularity?: 'day' | 'week' | 'month'; // Default: day
  courseId?: string;      // Filter by specific course
}
```

**Response Schema:**
```typescript
interface GetRevenueResponse {
  success: true;
  data: {
    timeSeries: RevenueDataPoint[];
    summary: {
      totalRevenue: number;
      averageRevenue: number;
      growthRate: number; // Percentage
      previousPeriodRevenue: number;
    };
    breakdown: {
      courses: number;
      workshops: number;
      consultations: number;
    };
  };
}

interface RevenueDataPoint {
  date: string; // ISO date
  revenue: number;
  enrollments: number;
  courses: number;
  workshops: number;
}
```

### 2.2 Get Enrollment Statistics

**Endpoint:** `GET /api/instructor/analytics/enrollments`

**Description:** Get enrollment statistics across all instructor courses.

**Query Parameters:**
```typescript
interface GetEnrollmentsQuery {
  startDate?: string;
  endDate?: string;
  courseId?: string;
  groupBy?: 'course' | 'date' | 'pillar';
}
```

**Response Schema:**
```typescript
interface GetEnrollmentsResponse {
  success: true;
  data: {
    total: number;
    active: number;
    completed: number;
    dropped: number;
    trend: TrendDataPoint[];
    byCourse: CourseEnrollmentStats[];
    byPillar: PillarEnrollmentStats[];
  };
}

interface TrendDataPoint {
  date: string;
  enrollments: number;
  completions: number;
  dropouts: number;
}

interface CourseEnrollmentStats {
  courseId: string;
  courseName: string;
  enrollments: number;
  completions: number;
  completionRate: number;
  averageProgress: number;
}

interface PillarEnrollmentStats {
  pillar: 'adaptability' | 'coaching' | 'marketplace';
  enrollments: number;
  completions: number;
}
```

### 2.3 Get Student Engagement Metrics

**Endpoint:** `GET /api/instructor/analytics/engagement`

**Description:** Get student engagement metrics over time.

**Query Parameters:**
```typescript
interface GetEngagementQuery {
  startDate?: string;
  endDate?: string;
  courseId?: string;
  metric?: 'all' | 'watch_time' | 'completion_rate' | 'quiz_scores' | 'activity';
}
```

**Response Schema:**
```typescript
interface GetEngagementResponse {
  success: true;
  data: {
    overview: {
      activeStudents: number;
      averageWatchTime: number; // hours
      averageCompletionRate: number; // percentage
      averageQuizScore: number;
    };
    trends: {
      weekly: EngagementTrendPoint[];
      peakHours: PeakHourData[];
    };
    cohortAnalysis: CohortData[];
  };
}

interface EngagementTrendPoint {
  week: string;
  activeStudents: number;
  completedLessons: number;
  avgWatchTime: number;
}

interface PeakHourData {
  dayOfWeek: string;
  hour: number;
  studentCount: number;
}

interface CohortData {
  cohortMonth: string;
  totalStudents: number;
  retained: number;
  retentionRate: number;
}
```

### 2.4 Get Course Performance Data

**Endpoint:** `GET /api/instructor/analytics/course-performance`

**Description:** Detailed performance metrics for all instructor courses.

**Response Schema:**
```typescript
interface GetCoursePerformanceResponse {
  success: true;
  data: CoursePerformance[];
}

interface CoursePerformance {
  id: string;
  name: string;
  enrollments: number;
  completions: number;
  completionRate: number;
  revenue: number;
  rating: number;
  reviews: number;
  avgWatchTime: number; // hours
  modulePerformance: ModulePerformance[];
  lessonPerformance: LessonPerformance[];
}

interface ModulePerformance {
  id: string;
  name: string;
  completionRate: number;
  averageTimeSpent: number;
  dropoffRate: number;
}

interface LessonPerformance {
  id: string;
  name: string;
  type: 'video' | 'quiz' | 'article';
  views: number;
  completions: number;
  avgQuizScore?: number;
  rewatchRate: number;
}
```

### 2.5 Export Analytics Report

**Endpoint:** `POST /api/instructor/analytics/export`

**Description:** Generate comprehensive analytics report in PDF or CSV format.

**Request Schema:**
```typescript
interface ExportAnalyticsRequest {
  format: 'pdf' | 'csv';
  reportType: 'revenue' | 'enrollments' | 'engagement' | 'comprehensive';
  startDate: string;
  endDate: string;
  courseIds?: string[];
}
```

**Response Schema:**
```typescript
interface ExportAnalyticsResponse {
  success: true;
  data: {
    downloadUrl: string;
    expiresAt: string;
    fileSize: number;
  };
}
```

---

## 3. Profile Management

### 3.1 Get Instructor Profile

**Endpoint:** `GET /api/instructor/profile`

**Description:** Get complete instructor profile with all metadata.

**Response Schema:**
```typescript
interface GetInstructorProfileResponse {
  success: true;
  data: InstructorProfile;
}

interface InstructorProfile {
  id: string;
  userId: string;
  avatar: string | null;
  coverPhoto: string | null;
  name: string;
  title: string;
  bio: string;
  expertise: string[];
  yearsExperience: number;
  totalStudents: number;
  languages: string[];
  timezone: string;
  education: Education[];
  certifications: Certification[];
  workExperience: WorkExperience[];
  socialLinks: SocialLinks;
  stats: InstructorStats;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Education {
  degree: string;
  institution: string;
  year: string;
  fieldOfStudy?: string;
}

interface Certification {
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
  credentialUrl?: string;
}

interface WorkExperience {
  company: string;
  role: string;
  duration: string;
  description?: string;
}

interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  website?: string;
  youtube?: string;
  github?: string;
  custom?: { name: string; url: string; }[];
}

interface InstructorStats {
  totalCourses: number;
  totalStudents: number;
  averageRating: number;
  totalRevenue: string;
  totalReviews: number;
  completionRate: number;
}
```

### 3.2 Update Instructor Profile

**Endpoint:** `PUT /api/instructor/profile`

**Description:** Update instructor profile information.

**Request Schema:**
```typescript
interface UpdateInstructorProfileRequest {
  name?: string;
  title?: string;
  bio?: string;
  expertise?: string[];
  yearsExperience?: number;
  languages?: string[];
  timezone?: string;
  education?: Education[];
  certifications?: Certification[];
  workExperience?: WorkExperience[];
  socialLinks?: SocialLinks;
}
```

**Validation:**
```typescript
const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  title: z.string().min(5).max(200).optional(),
  bio: z.string().min(50).max(2000).optional(),
  expertise: z.array(z.string()).max(20).optional(),
  yearsExperience: z.number().int().min(0).max(70).optional(),
  languages: z.array(z.string()).max(10).optional(),
  timezone: z.string().optional(),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    year: z.string(),
    fieldOfStudy: z.string().optional(),
  })).max(10).optional(),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    date: z.string(),
    credentialId: z.string().optional(),
    credentialUrl: z.string().url().optional(),
  })).max(20).optional(),
  workExperience: z.array(z.object({
    company: z.string(),
    role: z.string(),
    duration: z.string(),
    description: z.string().optional(),
  })).max(15).optional(),
  socialLinks: z.object({
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional(),
    website: z.string().url().optional(),
    youtube: z.string().url().optional(),
    github: z.string().url().optional(),
    custom: z.array(z.object({
      name: z.string(),
      url: z.string().url(),
    })).max(5).optional(),
  }).optional(),
});
```

**Response Schema:**
```typescript
interface UpdateInstructorProfileResponse {
  success: true;
  data: InstructorProfile;
}
```

### 3.3 Upload Profile Images

**Endpoint:** `POST /api/instructor/profile/upload`

**Description:** Upload avatar or cover photo.

**Request:** Multipart form data
```typescript
interface UploadProfileImageRequest {
  type: 'avatar' | 'cover';
  file: File; // Max 5MB, formats: jpg, png, webp
}
```

**Response Schema:**
```typescript
interface UploadProfileImageResponse {
  success: true;
  data: {
    url: string;
    type: 'avatar' | 'cover';
    uploadedAt: string;
  };
}
```

### 3.4 Get Teaching Statistics

**Endpoint:** `GET /api/instructor/profile/stats`

**Description:** Get detailed teaching statistics for profile display.

**Response Schema:**
```typescript
interface GetTeachingStatsResponse {
  success: true;
  data: {
    lifetime: TeachingStats;
    last30Days: TeachingStats;
    last90Days: TeachingStats;
  };
}

interface TeachingStats {
  totalCourses: number;
  totalStudents: number;
  averageRating: number;
  totalRevenue: number;
  totalReviews: number;
  completionRate: number;
  totalWatchHours: number;
  certificatesIssued: number;
}
```

---

## 4. Settings

### 4.1 Get Instructor Settings

**Endpoint:** `GET /api/instructor/settings`

**Description:** Get all instructor settings.

**Response Schema:**
```typescript
interface GetInstructorSettingsResponse {
  success: true;
  data: InstructorSettings;
}

interface InstructorSettings {
  general: GeneralSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  payment: PaymentSettings;
  teaching: TeachingPreferences;
  security: SecuritySettings;
}

interface GeneralSettings {
  displayName: string;
  email: string;
  emailVerified: boolean;
  phone?: string;
  phoneVerified: boolean;
  language: string;
  timezone: string;
}

interface NotificationSettings {
  emailNotifications: {
    newEnrollments: boolean;
    comments: boolean;
    messages: boolean;
    reviews: boolean;
    courseUpdates: boolean;
  };
  smsNotifications: boolean;
  pushNotifications: boolean;
  frequency: 'instant' | 'daily' | 'weekly';
}

interface PrivacySettings {
  profileVisibility: 'public' | 'students' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  displayStudentCount: boolean;
}

interface PaymentSettings {
  paymentMethod: 'stripe' | 'paypal';
  payoutSchedule: 'weekly' | 'monthly';
  taxInfoCompleted: boolean;
  minimumPayout: number;
}

interface TeachingPreferences {
  autoApproveEnrollments: boolean;
  allowQA: boolean;
  allowReviews: boolean;
  requireCertificates: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  activeSessions: ActiveSession[];
}

interface ActiveSession {
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
  sessionId: string;
}
```

### 4.2 Update Settings

**Endpoint:** `PUT /api/instructor/settings`

**Description:** Update instructor settings (can update specific sections).

**Request Schema:**
```typescript
interface UpdateInstructorSettingsRequest {
  general?: Partial<GeneralSettings>;
  notifications?: Partial<NotificationSettings>;
  privacy?: Partial<PrivacySettings>;
  payment?: Partial<PaymentSettings>;
  teaching?: Partial<TeachingPreferences>;
}
```

**Response Schema:**
```typescript
interface UpdateInstructorSettingsResponse {
  success: true;
  data: InstructorSettings;
}
```

### 4.3 Change Password

**Endpoint:** `POST /api/instructor/settings/change-password`

**Description:** Change instructor password.

**Request Schema:**
```typescript
interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
```

**Validation:**
```typescript
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

**Response Schema:**
```typescript
interface ChangePasswordResponse {
  success: true;
  data: {
    message: string;
  };
}
```

### 4.4 Enable/Disable 2FA

**Endpoint:** `POST /api/instructor/settings/2fa`

**Description:** Enable or disable two-factor authentication.

**Request Schema:**
```typescript
interface Toggle2FARequest {
  enable: boolean;
  verificationCode?: string; // Required when enabling
}
```

**Response Schema:**
```typescript
interface Toggle2FAResponse {
  success: true;
  data: {
    enabled: boolean;
    qrCode?: string; // Only when enabling
    backupCodes?: string[]; // Only when enabling
  };
}
```

### 4.5 Get Active Sessions

**Endpoint:** `GET /api/instructor/settings/sessions`

**Description:** Get all active sessions for the instructor.

**Response Schema:**
```typescript
interface GetActiveSessionsResponse {
  success: true;
  data: {
    sessions: ActiveSession[];
    totalSessions: number;
  };
}
```

### 4.6 Revoke Session

**Endpoint:** `POST /api/instructor/settings/sessions/revoke`

**Description:** Revoke a specific session.

**Request Schema:**
```typescript
interface RevokeSessionRequest {
  sessionId: string;
}
```

**Response Schema:**
```typescript
interface RevokeSessionResponse {
  success: true;
  data: {
    message: string;
    revokedSessionId: string;
  };
}
```

### 4.7 Export Data

**Endpoint:** `POST /api/instructor/settings/export-data`

**Description:** Request GDPR data export.

**Request Schema:**
```typescript
interface ExportDataRequest {
  format: 'json' | 'csv';
  includeStudentData?: boolean; // Default: false
}
```

**Response Schema:**
```typescript
interface ExportDataResponse {
  success: true;
  data: {
    requestId: string;
    estimatedCompletionTime: string;
    message: string;
  };
}
```

---

## 5. Courses

### 5.1 Get Instructor Courses

**Endpoint:** `GET /api/instructor/courses`

**Description:** Get all courses created by the instructor.

**Query Parameters:**
```typescript
interface GetInstructorCoursesQuery {
  page?: number;
  limit?: number;
  status?: 'all' | 'published' | 'draft' | 'archived';
  sortBy?: 'title' | 'enrollments' | 'revenue' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
```

**Response Schema:**
```typescript
interface GetInstructorCoursesResponse {
  success: true;
  data: InstructorCourse[];
  meta: PaginationMeta;
}

interface InstructorCourse {
  id: string;
  title: string;
  slug: string;
  category: string;
  pillar: 'adaptability' | 'coaching' | 'marketplace';
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  lessonsCount: number;
  studentsCount: number;
  rating: number;
  reviewsCount: number;
  completionRate: number;
  revenue: number;
  thumbnailUrl: string;
  status: 'published' | 'draft' | 'archived';
  lastUpdated: string;
  createdAt: string;
}
```

### 5.2 Get Course Analytics Detail

**Endpoint:** `GET /api/instructor/courses/:courseId/analytics`

**Description:** Get detailed analytics for a specific course.

**Response Schema:**
```typescript
interface GetCourseAnalyticsResponse {
  success: true;
  data: {
    overview: CourseAnalyticsOverview;
    enrollmentTrend: EnrollmentTrendPoint[];
    modulePerformance: ModulePerformance[];
    studentSegments: StudentSegment[];
    revenueBreakdown: RevenueBreakdown;
  };
}

interface CourseAnalyticsOverview {
  totalEnrollments: number;
  activeStudents: number;
  completedStudents: number;
  averageProgress: number;
  completionRate: number;
  averageRating: number;
  totalReviews: number;
  totalRevenue: number;
  averageWatchTime: number;
}

interface EnrollmentTrendPoint {
  date: string;
  enrollments: number;
  completions: number;
  revenue: number;
}

interface StudentSegment {
  segment: 'beginners' | 'progressing' | 'advanced' | 'struggling';
  count: number;
  percentage: number;
  averageProgress: number;
}

interface RevenueBreakdown {
  directSales: number;
  organizationSales: number;
  bundleSales: number;
}
```

### 5.3 Create Course

**Endpoint:** `POST /api/instructor/courses`

**Description:** Create a new course (draft).

**Request Schema:**
```typescript
interface CreateCourseRequest {
  title: string;
  description: string;
  pillar: 'adaptability' | 'coaching' | 'marketplace';
  level: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];
  learningOutcomes: string[];
  priceAmount: number;
  currency?: string;
}
```

**Validation:**
```typescript
const createCourseSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(50).max(5000),
  pillar: z.enum(['adaptability', 'coaching', 'marketplace']),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  prerequisites: z.array(z.string()).max(10).optional(),
  learningOutcomes: z.array(z.string()).min(3).max(15),
  priceAmount: z.number().min(0).max(99999),
  currency: z.string().length(3).optional(),
});
```

**Response Schema:**
```typescript
interface CreateCourseResponse {
  success: true;
  data: {
    id: string;
    slug: string;
    status: 'draft';
    createdAt: string;
  };
}
```

### 5.4 Update Course

**Endpoint:** `PUT /api/instructor/courses/:courseId`

**Description:** Update course details.

**Request Schema:**
```typescript
interface UpdateCourseRequest {
  title?: string;
  description?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];
  learningOutcomes?: string[];
  priceAmount?: number;
  thumbnailUrl?: string;
  status?: 'published' | 'draft' | 'archived';
}
```

**Response Schema:**
```typescript
interface UpdateCourseResponse {
  success: true;
  data: InstructorCourse;
}
```

---

## 6. Workshops

### 6.1 Get Instructor Workshops

**Endpoint:** `GET /api/instructor/workshops`

**Description:** Get all workshops created by the instructor.

**Query Parameters:**
```typescript
interface GetInstructorWorkshopsQuery {
  page?: number;
  limit?: number;
  status?: 'all' | 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
  pillar?: 'adaptability' | 'coaching' | 'marketplace';
  startDate?: string;
  endDate?: string;
  sortBy?: 'startTime' | 'enrollments' | 'revenue';
  sortOrder?: 'asc' | 'desc';
}
```

**Response Schema:**
```typescript
interface GetInstructorWorkshopsResponse {
  success: true;
  data: InstructorWorkshop[];
  meta: PaginationMeta;
}

interface InstructorWorkshop {
  id: string;
  title: string;
  slug: string;
  description: string;
  pillar: 'adaptability' | 'coaching' | 'marketplace';
  level: 'beginner' | 'intermediate' | 'advanced';
  format: 'online' | 'in-person' | 'hybrid';
  location?: string;
  meetingUrl?: string;
  durationHours: number;
  capacityTotal: number;
  capacityRemaining: number;
  registrationsCount: number;
  attendedCount: number;
  priceAmount: number;
  priceEarlyBird?: number;
  earlyBirdDeadline?: string;
  startTime: string;
  endTime: string;
  timezone: string;
  status: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled';
  thumbnailUrl?: string;
  materialsUrl?: string;
  recordingUrl?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 6.2 Get Workshop Attendance

**Endpoint:** `GET /api/instructor/workshops/:workshopId/attendance`

**Description:** Get attendance details for a specific workshop.

**Response Schema:**
```typescript
interface GetWorkshopAttendanceResponse {
  success: true;
  data: {
    workshopId: string;
    workshopTitle: string;
    totalRegistrations: number;
    totalAttended: number;
    totalNoShow: number;
    totalCancelled: number;
    attendanceRate: number;
    registrations: WorkshopRegistration[];
  };
}

interface WorkshopRegistration {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    organization: string;
  };
  status: 'registered' | 'waitlisted' | 'attended' | 'cancelled' | 'no_show';
  attended: boolean;
  attendanceDuration?: number; // minutes
  rating?: number;
  feedback?: string;
  registeredAt: string;
}
```

### 6.3 Create Workshop

**Endpoint:** `POST /api/instructor/workshops`

**Description:** Create a new workshop.

**Request Schema:**
```typescript
interface CreateWorkshopRequest {
  title: string;
  description: string;
  pillar: 'adaptability' | 'coaching' | 'marketplace';
  level: 'beginner' | 'intermediate' | 'advanced';
  format: 'online' | 'in-person' | 'hybrid';
  location?: string;
  meetingUrl?: string;
  durationHours: number;
  capacityTotal: number;
  priceAmount: number;
  priceEarlyBird?: number;
  earlyBirdDeadline?: string;
  startTime: string; // ISO timestamp
  endTime: string;   // ISO timestamp
  timezone: string;
  waitlistEnabled?: boolean;
}
```

**Validation:**
```typescript
const createWorkshopSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(50).max(2000),
  pillar: z.enum(['adaptability', 'coaching', 'marketplace']),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  format: z.enum(['online', 'in-person', 'hybrid']),
  location: z.string().max(200).optional(),
  meetingUrl: z.string().url().optional(),
  durationHours: z.number().min(0.5).max(24),
  capacityTotal: z.number().int().min(1).max(1000),
  priceAmount: z.number().min(0).max(99999),
  priceEarlyBird: z.number().min(0).max(99999).optional(),
  earlyBirdDeadline: z.string().datetime().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  timezone: z.string(),
  waitlistEnabled: z.boolean().optional(),
}).refine(data => new Date(data.endTime) > new Date(data.startTime), {
  message: "End time must be after start time",
  path: ["endTime"],
}).refine(data => {
  if (data.priceEarlyBird && data.earlyBirdDeadline) {
    return new Date(data.earlyBirdDeadline) < new Date(data.startTime);
  }
  return true;
}, {
  message: "Early bird deadline must be before workshop start time",
  path: ["earlyBirdDeadline"],
});
```

**Response Schema:**
```typescript
interface CreateWorkshopResponse {
  success: true;
  data: {
    id: string;
    slug: string;
    status: 'draft';
    createdAt: string;
  };
}
```

### 6.4 Update Workshop Enrollment

**Endpoint:** `PUT /api/instructor/workshops/:workshopId/enrollment`

**Description:** Update workshop enrollment settings.

**Request Schema:**
```typescript
interface UpdateWorkshopEnrollmentRequest {
  capacityTotal?: number;
  priceAmount?: number;
  priceEarlyBird?: number;
  earlyBirdDeadline?: string;
  waitlistEnabled?: boolean;
  status?: 'published' | 'cancelled';
}
```

**Response Schema:**
```typescript
interface UpdateWorkshopEnrollmentResponse {
  success: true;
  data: InstructorWorkshop;
}
```

---

## Data Schemas

### Common Types

```typescript
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
  meta?: Record<string, any>;
}

interface APIError {
  code: string;
  message: string;
  details?: unknown;
  timestamp?: string;
}
```

### Error Codes

```typescript
enum ErrorCode {
  // Authentication
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Resources
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',

  // Business Logic
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  CAPACITY_EXCEEDED = 'CAPACITY_EXCEEDED',
  INVALID_STATUS = 'INVALID_STATUS',

  // Server
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}
```

---

## Error Handling

### Standard Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
    timestamp: string;
  };
}
```

### HTTP Status Codes

| Status Code | Description | Usage |
|------------|-------------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation errors, malformed requests |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (e.g., duplicate) |
| 422 | Unprocessable Entity | Valid syntax but semantic errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side errors |

### Example Error Responses

**Validation Error:**
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
        },
        {
          "field": "priceAmount",
          "message": "Must be a positive number"
        }
      ]
    },
    "timestamp": "2025-10-04T16:30:00Z"
  }
}
```

**Authorization Error:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to access this resource",
    "timestamp": "2025-10-04T16:30:00Z"
  }
}
```

**Not Found Error:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Student with ID 'abc123' not found",
    "timestamp": "2025-10-04T16:30:00Z"
  }
}
```

---

## Rate Limiting

### Rate Limit Rules

| Endpoint Category | Limit | Window |
|------------------|-------|--------|
| Read Operations (GET) | 100 requests | 1 minute |
| Write Operations (POST/PUT/PATCH) | 30 requests | 1 minute |
| Export Operations | 5 requests | 1 minute |
| Email Operations | 10 requests | 1 hour |

### Rate Limit Headers

All responses include rate limit information in headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1696435200
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retryAfter": 42,
      "limit": 100,
      "window": "1 minute"
    },
    "timestamp": "2025-10-04T16:30:00Z"
  }
}
```

---

## Implementation Examples

See separate implementation files:
- `/app/api/instructor/students/route.ts` - Students management endpoints
- `/app/api/instructor/analytics/route.ts` - Analytics endpoints
- `/app/api/instructor/profile/route.ts` - Profile management
- `/app/api/instructor/settings/route.ts` - Settings endpoints
- `/app/api/instructor/courses/route.ts` - Courses management
- `/app/api/instructor/workshops/route.ts` - Workshops management
- `/lib/validation/instructor-schemas.ts` - Zod validation schemas
- `/lib/api/instructor-errors.ts` - Error handling utilities

---

## Next Steps

1. **Implementation:** Create TypeScript route handlers for each endpoint
2. **Testing:** Write integration tests using Vitest
3. **Documentation:** Generate OpenAPI/Swagger spec
4. **Monitoring:** Set up logging and error tracking
5. **Performance:** Implement caching strategies
6. **Security:** Add request signing and CORS policies

---

**Document Version:** 1.0
**Last Updated:** 2025-10-04
**Maintained By:** HumanGlue Engineering Team
