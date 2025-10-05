# 🚀 HumanGlue Completion Roadmap
## From 20% to 100% - Detailed Execution Plan

**Created:** October 4, 2025
**Estimated Completion:** 6-8 weeks
**Current Status:** 20% Complete
**Target:** Production-Ready MVP

---

## 📋 PHASE 1: FOUNDATION FIX (Week 1) - CRITICAL

### Priority: 🔴 BLOCKER - Nothing works without this

---

### **Task 1.1: Clean Up Development Environment**
**Agent:** None (Direct bash commands)
**Estimated Time:** 5 minutes
**Status:** Ready to execute

**Steps:**
```bash
# Kill all duplicate dev servers
pkill -9 node

# Wait 2 seconds
sleep 2

# Verify all killed
lsof -ti:5040

# Clean build artifacts
rm -rf .next
rm -rf node_modules/.cache

# Start ONE clean server
npm run dev
```

**Success Criteria:**
- ✅ Only ONE `npm run dev` process running
- ✅ Server starts on http://localhost:5040
- ✅ No port conflicts

---

### **Task 1.2: Fix Admin Content Page Runtime Error**
**Agent:** None (Direct fix)
**Estimated Time:** 2 minutes
**File:** `/app/admin/content/page.tsx`

**Problem:**
```typescript
<DashboardSidebar onLogout={handleLogout} />
// ReferenceError: handleLogout is not defined
```

**Fix:**
```typescript
// Add this function before the return statement (around line 410):
const handleLogout = () => {
  localStorage.removeItem('humanglue_user')
  router.push('/login')
}
```

**Success Criteria:**
- ✅ Admin content page loads without error
- ✅ Logout button works

---

### **Task 1.3: Set Up Supabase Database**
**Agent:** `database-schema-designer`
**Estimated Time:** 2-3 hours
**Dependencies:** Docker installed and running

**Subtasks:**

1. **Start Supabase locally**
```bash
# Start Docker Desktop first!
supabase start
```

2. **Apply ALL migrations**
```bash
# This runs all 13 migration files
supabase db reset

# OR push to remote
supabase db push --db-url postgresql://postgres:postgres@db.egqqdscvxvtwcdwknbnt.supabase.co:5432/postgres
```

3. **Verify migrations applied**
```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Should see:
-- users, organizations, teams, courses, workshops,
-- enrollments, instructor_profiles, notifications, etc.
```

4. **Enable Realtime on tables**
```sql
-- Already in migration 003, but verify:
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE student_activity;
ALTER PUBLICATION supabase_realtime ADD TABLE enrollments;
ALTER PUBLICATION supabase_realtime ADD TABLE student_progress;
```

5. **Create test data**
```bash
npm run seed:staging
```

**Agent Prompt for database-schema-designer:**
```
Review all migration files in supabase/migrations/ and create a comprehensive verification script that:
1. Checks all tables exist with correct columns
2. Verifies all indexes are created
3. Tests all RLS policies work correctly
4. Validates all triggers fire properly
5. Tests all helper functions return expected results
6. Creates comprehensive seed data for testing

Also identify any missing tables or columns that the API endpoints expect but don't exist in migrations.
```

**Success Criteria:**
- ✅ All 27 tables exist in database
- ✅ All RLS policies active
- ✅ All triggers working
- ✅ Test data seeded (5+ users, 3+ courses, 10+ enrollments)
- ✅ Realtime enabled on notification tables

---

### **Task 1.4: Generate TypeScript Types from Database**
**Agent:** None (Direct command)
**Estimated Time:** 5 minutes
**Dependencies:** Task 1.3 complete

```bash
# Generate types from local database
npx supabase gen types typescript --local > lib/types/database.types.ts

# OR from remote
npx supabase gen types typescript --project-id egqqdscvxvtwcdwknbnt > lib/types/database.types.ts
```

**Success Criteria:**
- ✅ File `lib/types/database.types.ts` created
- ✅ All table types exported
- ✅ No TypeScript errors when importing

---

## 📋 PHASE 2: AUTHENTICATION (Week 1-2) - CRITICAL

### Priority: 🔴 BLOCKER - Can't have users without auth

---

### **Task 2.1: Build Supabase Auth Integration**
**Agent:** `api-architect`
**Estimated Time:** 8-10 hours
**Dependencies:** Task 1.3, 1.4 complete

**Agent Prompt:**
```
Build a complete authentication system using Supabase Auth for the HumanGlue platform.

Requirements:
1. Email/password authentication
2. Magic link authentication
3. OAuth providers (Google, GitHub)
4. Email verification flow
5. Password reset flow
6. Session management with JWT
7. Role-based access (admin, instructor, client)
8. Multi-tenant support (organization-based + standalone users)

Create:
- Auth API routes in /app/api/auth/
- Auth helpers in /lib/auth/
- useAuth() hook for client components
- Auth middleware for protected routes
- Login/signup/reset password pages that actually work
- Proper error handling and validation

Current fake auth uses localStorage - replace completely with Supabase Auth.
Use the existing Supabase client helpers in lib/supabase/client.ts and lib/supabase/server.ts
```

**Files to Create:**
1. `/lib/auth/hooks.ts` - useAuth(), useUser(), useSession()
2. `/lib/auth/server.ts` - Server-side auth helpers
3. `/lib/auth/middleware.ts` - Auth middleware
4. `/app/api/auth/signup/route.ts` - Signup endpoint
5. `/app/api/auth/login/route.ts` - Login endpoint
6. `/app/api/auth/logout/route.ts` - Logout endpoint
7. `/app/api/auth/reset-password/route.ts` - Password reset
8. `/app/api/auth/verify-email/route.ts` - Email verification
9. `/app/(auth)/login/page.tsx` - Working login page
10. `/app/(auth)/signup/page.tsx` - Working signup page
11. `/app/(auth)/reset-password/page.tsx` - Password reset page

**Success Criteria:**
- ✅ Users can sign up with email/password
- ✅ Users receive verification email
- ✅ Users can log in and get JWT token
- ✅ Users can reset password
- ✅ Sessions persist across page reloads
- ✅ Role-based access works (admin, instructor, client)
- ✅ Organization membership enforced
- ✅ Logout clears session completely

---

### **Task 2.2: Build Auth Middleware & Security**
**Agent:** `security-posture-evaluator`
**Estimated Time:** 4-6 hours
**Dependencies:** Task 2.1 complete

**Agent Prompt:**
```
Review the authentication system built in Task 2.1 and add comprehensive security hardening:

1. Implement proper session validation middleware
2. Add CSRF protection
3. Implement rate limiting on auth endpoints (5 attempts per 15 min)
4. Add brute force protection
5. Implement secure cookie settings (httpOnly, secure, sameSite)
6. Add audit logging for auth events
7. Implement account lockout after failed attempts
8. Add 2FA/MFA support (optional but recommended)
9. Validate all auth flows for security vulnerabilities
10. Test RLS policies prevent unauthorized access

Review all existing API endpoints and add auth checks.
Ensure instructors can only access their own data.
Ensure admins have proper access controls.
```

**Success Criteria:**
- ✅ All API endpoints require authentication
- ✅ RLS policies prevent data leakage
- ✅ Rate limiting active on auth endpoints
- ✅ CSRF protection implemented
- ✅ Secure cookies configured
- ✅ Auth events logged
- ✅ Account lockout after 5 failed attempts
- ✅ Security audit passes with no critical issues

---

## 📋 PHASE 3: API IMPLEMENTATION (Week 2-3) - HIGH PRIORITY

### Priority: 🟡 HIGH - Frontend needs real data

---

### **Task 3.1: Implement Remaining 24 API Endpoints**
**Agent:** `api-architect`
**Estimated Time:** 16-20 hours
**Dependencies:** Task 1.3, 1.4, 2.1 complete

**Agent Prompt:**
```
Implement all 24 missing API endpoints based on the designs in:
- API_DESIGN_INSTRUCTOR_DASHBOARD.md
- INSTRUCTOR_API_ENDPOINTS.md

Use the existing 5 endpoints as templates:
- /app/api/instructor/students/route.ts
- /app/api/instructor/students/[studentId]/route.ts
- /app/api/instructor/analytics/revenue/route.ts
- /app/api/instructor/workshops/route.ts
- /app/api/instructor/notifications/route.ts

Missing endpoints to implement:

**Instructor APIs:**
1. POST /api/instructor/students/bulk-email
2. GET /api/instructor/profile
3. PUT /api/instructor/profile
4. POST /api/instructor/profile/upload-photo
5. GET /api/instructor/settings
6. PUT /api/instructor/settings
7. POST /api/instructor/settings/change-password
8. GET /api/instructor/courses
9. POST /api/instructor/courses
10. PUT /api/instructor/courses/[id]
11. DELETE /api/instructor/courses/[id]
12. GET /api/instructor/courses/[id]/analytics
13. POST /api/instructor/workshops
14. PUT /api/instructor/workshops/[id]
15. GET /api/instructor/analytics/enrollments
16. GET /api/instructor/analytics/engagement
17. GET /api/instructor/analytics/performance

**Admin APIs (Priority 2):**
18. GET /api/admin/users
19. POST /api/admin/users
20. PUT /api/admin/users/[id]
21. DELETE /api/admin/users/[id]
22. GET /api/admin/courses
23. POST /api/admin/courses
24. PUT /api/admin/courses/[id]

Requirements:
- Use Zod validation schemas from lib/validation/instructor-schemas.ts
- Use auth helpers from lib/api/instructor-auth.ts
- Use error handling from lib/api/instructor-errors.ts
- Implement proper pagination
- Add filtering and sorting
- Test with real database data
- Add proper TypeScript types
- Include API documentation comments
```

**Success Criteria:**
- ✅ All 24 endpoints implemented
- ✅ All endpoints return real database data
- ✅ Zod validation on all inputs
- ✅ Proper error handling
- ✅ Authentication required
- ✅ RLS policies enforced
- ✅ Pagination works
- ✅ Filtering/sorting works
- ✅ No TypeScript errors
- ✅ API documentation updated

---

### **Task 3.2: Build File Upload System**
**Agent:** `api-architect`
**Estimated Time:** 6-8 hours
**Dependencies:** Task 1.3 complete

**Agent Prompt:**
```
Implement comprehensive file upload system using Supabase Storage.

Features needed:
1. Profile photo upload (avatars, cover photos)
2. Course content upload (videos, PDFs, slides)
3. Document attachments
4. Progress indicators
5. File validation (type, size)
6. Storage bucket setup
7. CDN delivery
8. Secure signed URLs

Create:
- /app/api/upload/profile-photo/route.ts
- /app/api/upload/course-content/route.ts
- /app/api/upload/document/route.ts
- /lib/storage/client.ts (upload helpers)
- /lib/storage/server.ts (server-side helpers)
- /components/ui/FileUpload.tsx (reusable component)

Storage buckets needed:
- avatars (public)
- cover-photos (public)
- course-videos (private, signed URLs)
- course-documents (private, signed URLs)
- attachments (private)

Requirements:
- Max file size: 100MB for videos, 10MB for images, 25MB for docs
- Allowed types: jpg, png, gif, webp for images; mp4, webm for video; pdf, docx, pptx for docs
- Generate thumbnails for images
- Validate files server-side
- Show upload progress
- Handle upload errors gracefully
```

**Success Criteria:**
- ✅ Profile photo upload works
- ✅ Course video upload works
- ✅ Document upload works
- ✅ File validation prevents wrong types
- ✅ File size limits enforced
- ✅ Progress indicators show
- ✅ Thumbnails generated
- ✅ Signed URLs work for private files
- ✅ Files accessible via CDN

---

### **Task 3.3: Integrate Email Service (Resend)**
**Agent:** `api-architect`
**Estimated Time:** 4-6 hours
**Dependencies:** Task 2.1 complete

**Agent Prompt:**
```
Integrate Resend email service for all transactional emails.

Email types needed:
1. Welcome email (on signup)
2. Email verification
3. Password reset
4. Course enrollment confirmation
5. Course completion certificate
6. Instructor notification (new enrollment)
7. Bulk student emails
8. Workshop reminder (24h before)
9. Payment receipt

Create:
- /lib/email/client.ts (Resend client wrapper)
- /lib/email/templates/ (email templates)
  - welcome.tsx
  - verification.tsx
  - password-reset.tsx
  - enrollment-confirmation.tsx
  - completion-certificate.tsx
  - instructor-notification.tsx
  - workshop-reminder.tsx
  - payment-receipt.tsx
- /app/api/email/send/route.ts (send email endpoint)
- /app/api/email/bulk/route.ts (bulk email endpoint)

Requirements:
- Use React Email for templates
- Beautiful HTML emails with HumanGlue branding
- Plain text fallbacks
- Unsubscribe links
- Email tracking (opens, clicks)
- Queue system for bulk emails
- Error handling and retries
- Rate limiting (prevent spam)

Environment variables needed:
- RESEND_API_KEY (get from resend.com)
```

**Success Criteria:**
- ✅ Resend API key configured
- ✅ All 9 email templates created
- ✅ Welcome email sends on signup
- ✅ Verification email works
- ✅ Password reset email works
- ✅ Bulk emails can be sent to students
- ✅ Emails look good in all clients
- ✅ Unsubscribe links work
- ✅ Email tracking works

---

## 📋 PHASE 4: FRONTEND INTEGRATION (Week 3-4) - HIGH PRIORITY

### Priority: 🟡 HIGH - Remove all mock data

---

### **Task 4.1: Connect Instructor Pages to Real APIs**
**Agent:** `frontend-architect`
**Estimated Time:** 12-16 hours
**Dependencies:** Task 3.1 complete

**Agent Prompt:**
```
Replace ALL mock data in instructor portal pages with real API calls.

Pages to update:
1. /app/instructor/students/page.tsx
2. /app/instructor/courses/page.tsx
3. /app/instructor/workshops/page.tsx
4. /app/instructor/analytics/page.tsx
5. /app/instructor/profile/page.tsx
6. /app/instructor/settings/page.tsx
7. /app/instructor/page.tsx (dashboard overview)

For each page:
1. Remove hardcoded mock data arrays
2. Add React Query (useQuery, useMutation) for data fetching
3. Add loading states with skeletons
4. Add error states with retry buttons
5. Add empty states when no data
6. Implement pagination for lists
7. Add optimistic updates for mutations
8. Add success/error toast notifications
9. Implement data refetching after actions

Example pattern:
```typescript
// BEFORE (Mock):
const [students, setStudents] = useState([...fake data...])

// AFTER (Real):
const { data: students, isLoading, error } = useQuery({
  queryKey: ['instructor-students', filters],
  queryFn: () => fetch('/api/instructor/students?' + new URLSearchParams(filters))
    .then(r => r.json())
})

const { mutate: emailStudents } = useMutation({
  mutationFn: (data) => fetch('/api/instructor/students/bulk-email', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  onSuccess: () => {
    toast.success('Emails sent!')
    queryClient.invalidateQueries(['instructor-students'])
  }
})
```

Requirements:
- Install @tanstack/react-query
- Create QueryClient provider
- Add loading skeletons (not spinners)
- Add error boundaries
- Add retry logic
- Show toast notifications
- Optimistic updates where possible
- Proper TypeScript types from API
```

**Success Criteria:**
- ✅ Zero hardcoded data in instructor pages
- ✅ All data from API calls
- ✅ Loading states show skeletons
- ✅ Error states show retry button
- ✅ Empty states show helpful messages
- ✅ Pagination works
- ✅ Filters work with API
- ✅ Sorting works with API
- ✅ Create/update/delete operations work
- ✅ Toast notifications on success/error
- ✅ Data refetches after mutations

---

### **Task 4.2: Connect Admin Pages to Real APIs**
**Agent:** `frontend-architect`
**Estimated Time:** 10-12 hours
**Dependencies:** Task 3.1 complete

**Agent Prompt:**
```
Replace ALL mock data in admin portal pages with real API calls.

Pages to update:
1. /app/admin/users/page.tsx
2. /app/admin/courses/page.tsx
3. /app/admin/workshops/page.tsx
4. /app/admin/assessments/page.tsx
5. /app/admin/analytics/page.tsx
6. /app/admin/settings/page.tsx
7. /app/admin/content/page.tsx
8. /app/admin/page.tsx (dashboard overview)

Use same pattern as Task 4.1:
- React Query for data fetching
- Loading/error/empty states
- Toast notifications
- Optimistic updates
- Proper TypeScript types

Also:
- Admin can see ALL organizations' data
- Admin can switch between organizations
- Admin can impersonate users (for support)
```

**Success Criteria:**
- ✅ Zero hardcoded data in admin pages
- ✅ All data from API calls
- ✅ Organization filtering works
- ✅ User impersonation works
- ✅ All CRUD operations work
- ✅ Data refetches properly

---

### **Task 4.3: Add Comprehensive Error Handling**
**Agent:** `frontend-architect`
**Estimated Time:** 4-6 hours
**Dependencies:** Task 4.1, 4.2 complete

**Agent Prompt:**
```
Add comprehensive error handling and loading states to ALL pages.

Requirements:
1. Error boundaries for React errors
2. API error handling with user-friendly messages
3. Network error detection (offline mode)
4. Loading skeletons (not spinners) for all data
5. Retry logic with exponential backoff
6. Global error toast notifications
7. Error logging to Sentry
8. Fallback UI for errors

Create:
- /components/errors/ErrorBoundary.tsx
- /components/errors/ErrorFallback.tsx
- /components/loading/PageSkeleton.tsx
- /components/loading/TableSkeleton.tsx
- /components/loading/CardSkeleton.tsx
- /lib/errors/handler.ts

Implement:
- useErrorHandler() hook
- useRetry() hook
- Network status detection
- Offline banner
```

**Success Criteria:**
- ✅ All pages have error boundaries
- ✅ API errors show user-friendly messages
- ✅ Offline detection works
- ✅ Loading skeletons on all pages
- ✅ Retry buttons work
- ✅ Errors logged to Sentry
- ✅ No app crashes from errors

---

## 📋 PHASE 5: CLIENT PORTAL (Week 4-5) - MEDIUM PRIORITY

### Priority: 🟠 MEDIUM - Core user experience

---

### **Task 5.1: Build Client/Student Portal UI**
**Agent:** `frontend-architect`
**Estimated Time:** 20-24 hours
**Dependencies:** Task 2.1, 3.1 complete

**Agent Prompt:**
```
Build the complete client/student portal from scratch.

Pages to create:
1. /app/client/page.tsx - Dashboard (enrolled courses, progress)
2. /app/client/courses/page.tsx - Course catalog/browse
3. /app/client/courses/[id]/page.tsx - Course detail page
4. /app/client/learn/[courseId]/page.tsx - Course player (lessons, videos)
5. /app/client/learn/[courseId]/quiz/[quizId]/page.tsx - Quiz taking
6. /app/client/certificates/page.tsx - Earned certificates
7. /app/client/progress/page.tsx - Learning progress tracker
8. /app/client/profile/page.tsx - Student profile
9. /app/client/settings/page.tsx - Student settings

Features needed:
- Course enrollment
- Video player with progress tracking
- Lesson completion tracking
- Quiz taking interface
- Certificate viewing/download
- Progress visualization
- Notes taking
- Bookmarks
- Q&A with instructors
- Course reviews

Design system:
- Use same Tailwind theme as admin/instructor
- Use same components (DashboardSidebar pattern)
- Dark mode (gray-950 background)
- Purple/blue gradients
- Framer Motion animations
- Responsive design

Reference existing pages for design patterns.
```

**Success Criteria:**
- ✅ All 9 client pages created
- ✅ Students can browse courses
- ✅ Students can enroll in courses
- ✅ Course player works
- ✅ Video playback works
- ✅ Progress tracking works
- ✅ Quiz taking works
- ✅ Certificates viewable
- ✅ Profile editable
- ✅ Settings saveable

---

### **Task 5.2: Build Course Content Delivery System**
**Agent:** `frontend-architect`
**Estimated Time:** 12-16 hours
**Dependencies:** Task 5.1 complete

**Agent Prompt:**
```
Build comprehensive course content delivery system.

Components needed:
1. VideoPlayer - Video playback with controls
2. LessonRenderer - Renders lesson content (text, markdown, code)
3. PDFViewer - View PDF documents
4. SlideViewer - View presentation slides
5. CodePlayground - Interactive code editor (for coding courses)
6. DownloadableResources - File downloads
7. ProgressTracker - Track lesson/course completion

Features:
- Video playback with resume from last position
- Playback speed control
- Captions/subtitles support
- Picture-in-picture mode
- Keyboard shortcuts
- Progress saving (every 5 seconds)
- Markdown rendering for text lessons
- Syntax highlighting for code blocks
- Interactive code editor (Monaco/CodeMirror)
- PDF rendering (react-pdf)
- Download resources
- Mark lesson as complete
- Automatic progress calculation

Video hosting options:
- Cloudflare Stream (recommended)
- Mux
- YouTube (unlisted)
- Self-hosted with HLS

For MVP, use YouTube embed with custom player UI.
```

**Success Criteria:**
- ✅ Video player works
- ✅ Videos resume from last position
- ✅ Playback controls work
- ✅ Progress saves automatically
- ✅ Markdown lessons render
- ✅ PDFs viewable
- ✅ Code playground works (if needed)
- ✅ Resources downloadable
- ✅ Lesson completion tracked

---

### **Task 5.3: Build Quiz and Assessment Engine**
**Agent:** `api-architect` + `frontend-architect`
**Estimated Time:** 16-20 hours
**Dependencies:** Task 5.1 complete

**Agent Prompt (api-architect):**
```
Build the backend for quiz and assessment system.

Database tables (already in migrations):
- assessments
- assessment_questions
- assessment_attempts
- assessment_answers

API endpoints needed:
1. GET /api/client/courses/[id]/quizzes - List quizzes
2. GET /api/client/quizzes/[id] - Get quiz details
3. POST /api/client/quizzes/[id]/start - Start quiz attempt
4. POST /api/client/quizzes/[id]/submit - Submit quiz
5. GET /api/client/quizzes/[id]/results - Get quiz results
6. GET /api/client/certificates/[id] - Get certificate

Features:
- Multiple choice questions
- True/false questions
- Fill-in-the-blank
- Multiple select
- Essay questions (manual grading)
- Time limits
- Attempt limits
- Randomize questions
- Automatic grading
- Certificate generation on passing
- Scoring logic
```

**Agent Prompt (frontend-architect):**
```
Build the quiz taking interface.

Components:
1. QuizStart - Quiz intro with rules
2. QuizQuestion - Question display
3. QuizTimer - Countdown timer
4. QuizProgress - Question progress bar
5. QuizResults - Results display
6. Certificate - Certificate display

Features:
- Show quiz introduction
- Display questions one at a time
- Timer countdown
- Auto-submit on time limit
- Show progress (5/10 questions)
- Answer validation
- Results with correct/incorrect
- Score display
- Certificate download
- Retry logic (if allowed)
```

**Success Criteria:**
- ✅ Instructors can create quizzes
- ✅ Students can take quizzes
- ✅ Timer works
- ✅ Auto-submit on timeout
- ✅ Automatic grading works
- ✅ Results show correct answers
- ✅ Certificates generated on pass
- ✅ Attempt limits enforced
- ✅ Progress saved if abandoned

---

## 📋 PHASE 6: PAYMENTS (Week 5-6) - MEDIUM PRIORITY

### Priority: 🟠 MEDIUM - Monetization

---

### **Task 6.1: Integrate Stripe Payment Processing**
**Agent:** `api-architect`
**Estimated Time:** 12-16 hours
**Dependencies:** Task 2.1, 3.1 complete

**Agent Prompt:**
```
Integrate Stripe for payment processing.

Features needed:
1. One-time course purchases
2. Subscription plans (monthly access to all courses)
3. Workshop bookings with payment
4. Instructor payouts (Stripe Connect)
5. Refund handling
6. Invoice generation
7. Payment history

API endpoints:
1. POST /api/payments/create-checkout - Create checkout session
2. POST /api/payments/webhook - Stripe webhook handler
3. GET /api/payments/history - Payment history
4. POST /api/payments/refund - Process refund
5. GET /api/invoices/[id] - Get invoice
6. POST /api/payouts/instructor - Instructor payout

Create:
- /lib/stripe/client.ts (Stripe client wrapper)
- /lib/stripe/webhooks.ts (Webhook handlers)
- /app/api/payments/ (payment endpoints)
- /components/payments/CheckoutForm.tsx
- /components/payments/PaymentHistory.tsx

Requirements:
- Stripe Elements for card input
- Support credit cards, Apple Pay, Google Pay
- 3D Secure (SCA) support
- Webhook signature verification
- Idempotency for payments
- Proper error handling
- Test mode for development
- Production keys for deployment

Environment variables:
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET

Database tables to update:
- Add payment_status to enrollments
- Add stripe_customer_id to users
- Add stripe_price_id to courses
- Create transactions table
```

**Success Criteria:**
- ✅ Stripe keys configured
- ✅ Checkout flow works
- ✅ One-time payments work
- ✅ Subscriptions work
- ✅ Webhooks handle events
- ✅ Payment history viewable
- ✅ Refunds work
- ✅ Invoices generated
- ✅ Instructor payouts work
- ✅ Test mode works

---

## 📋 PHASE 7: INFRASTRUCTURE (Week 6) - LOW PRIORITY

### Priority: 🟢 LOW - Nice to have

---

### **Task 7.1: Set Up Redis for Rate Limiting**
**Agent:** `deployment-engineer`
**Estimated Time:** 4-6 hours

**Agent Prompt:**
```
Set up Upstash Redis for rate limiting.

Features:
1. Rate limit API endpoints (100 req/min per IP)
2. Auth endpoint limits (5 attempts per 15min)
3. Email sending limits (10 per hour per user)
4. File upload limits (20 per hour)
5. Cache frequently accessed data
6. Session storage

Create:
- /lib/redis/client.ts (Upstash Redis client)
- /lib/redis/rate-limit.ts (Rate limiting middleware)
- /middleware.ts (Next.js middleware with rate limiting)

Get Upstash Redis credentials:
- Sign up at upstash.com
- Create Redis database
- Get UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
```

**Success Criteria:**
- ✅ Upstash Redis configured
- ✅ Rate limiting works on API endpoints
- ✅ Auth attempts limited
- ✅ 429 errors returned when limit exceeded
- ✅ Cache working for frequently accessed data

---

### **Task 7.2: Configure Sentry Error Tracking**
**Agent:** `deployment-engineer`
**Estimated Time:** 2-4 hours

**Agent Prompt:**
```
Configure Sentry for production error tracking.

Setup:
1. Sign up at sentry.io
2. Create Next.js project
3. Get DSN
4. Install @sentry/nextjs
5. Configure sentry.client.config.ts
6. Configure sentry.server.config.ts
7. Test error capturing

Update lib/monitoring/sentry.ts with real DSN.
Add source maps upload to build process.
Configure release tracking.
Set up alerts for critical errors.
```

**Success Criteria:**
- ✅ Sentry DSN configured
- ✅ Client errors captured
- ✅ Server errors captured
- ✅ Source maps uploaded
- ✅ Alerts configured
- ✅ Dashboard accessible

---

### **Task 7.3: Enable Realtime Features**
**Agent:** `database-schema-designer`
**Estimated Time:** 2-4 hours

**Agent Prompt:**
```
Enable and test Supabase Realtime features.

Tasks:
1. Verify Realtime enabled on tables (migration 003)
2. Test notification subscriptions
3. Test presence tracking
4. Test student activity feed
5. Add Realtime to frontend pages
6. Test reconnection logic

Update pages to use real-time hooks:
- /app/instructor/page.tsx - Real-time notifications
- /app/instructor/students/page.tsx - Live activity feed
- /app/instructor/courses/page.tsx - Live enrollment count
```

**Success Criteria:**
- ✅ Realtime enabled on all tables
- ✅ Notifications appear instantly
- ✅ Presence tracking works
- ✅ Activity feed updates in real-time
- ✅ Reconnection works after disconnect
- ✅ No performance issues

---

## 📋 PHASE 8: TESTING & QA (Week 6) - CRITICAL

### Priority: 🔴 BLOCKER - Can't launch without tests

---

### **Task 8.1: Add data-testid to All Components**
**Agent:** None (Manual or find/replace)
**Estimated Time:** 2-4 hours

**Steps:**
```typescript
// Add to all interactive elements:
<button data-testid="create-course-btn">Create Course</button>
<div data-testid="student-card">...</div>
<input data-testid="course-title-input" />
<select data-testid="course-category-select">...</select>

// Pattern:
data-testid="{component-name}-{element-type}"
```

**Files to update:**
- All pages in /app/instructor/
- All pages in /app/admin/
- All pages in /app/client/
- All components in /components/

**Success Criteria:**
- ✅ All buttons have data-testid
- ✅ All inputs have data-testid
- ✅ All cards have data-testid
- ✅ All modals have data-testid

---

### **Task 8.2: Fix and Run Test Suite**
**Agent:** `testing-strategist`
**Estimated Time:** 8-12 hours
**Dependencies:** Task 8.1 complete

**Agent Prompt:**
```
Fix the test suite created earlier so all tests pass.

Issues to fix:
1. Update test fixtures to match actual database schema
2. Fix loginAsInstructor() to use real Supabase Auth
3. Update E2E tests to use real API endpoints
4. Fix hardcoded data in tests (use real seeded data)
5. Add proper cleanup after tests
6. Fix flaky tests with proper waits
7. Update assertions to match real data

Files to update:
- tests/utils/auth-helpers.ts
- tests/utils/db-helpers.ts
- tests/utils/fixtures.ts
- tests/e2e/*.spec.ts
- tests/components/*.test.tsx
- tests/api/*.test.ts

Run tests:
```bash
npm run test:unit
npm run test:e2e
```

Ensure 100% of tests pass.
Add new tests for features built in Phase 4-6.
```

**Success Criteria:**
- ✅ All unit tests pass
- ✅ All E2E tests pass
- ✅ All API tests pass
- ✅ No flaky tests
- ✅ Test coverage > 80%
- ✅ CI/CD pipeline runs tests automatically

---

### **Task 8.3: Security Audit**
**Agent:** `security-posture-evaluator`
**Estimated Time:** 4-6 hours

**Agent Prompt:**
```
Perform comprehensive security audit of the entire application.

Check:
1. All API endpoints require authentication
2. RLS policies prevent data leakage
3. No SQL injection vulnerabilities
4. No XSS vulnerabilities
5. CSRF protection in place
6. Rate limiting active
7. Secure cookies configured
8. No secrets in client code
9. File upload validation
10. Payment security (PCI compliance)
11. Audit logging for sensitive actions
12. Security headers configured

Run:
- npm audit (check dependencies)
- Security scanning tools
- Manual penetration testing

Create security report with findings and fixes.
```

**Success Criteria:**
- ✅ No critical vulnerabilities
- ✅ All high-priority issues fixed
- ✅ Security headers A+ rating
- ✅ No exposed secrets
- ✅ RLS policies tested
- ✅ Rate limiting verified
- ✅ Audit log working

---

### **Task 8.4: Performance Optimization**
**Agent:** `code-optimization-reviewer`
**Estimated Time:** 6-8 hours

**Agent Prompt:**
```
Review and optimize application performance.

Tasks:
1. Run Lighthouse audit on all pages
2. Optimize images (WebP, AVIF, lazy loading)
3. Implement code splitting
4. Add React.memo to expensive components
5. Optimize database queries (add indexes if needed)
6. Implement caching (Redis)
7. Optimize bundle size
8. Add service worker for offline support
9. Implement CDN for static assets
10. Database query optimization

Targets:
- Lighthouse Score > 90
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- TTFB < 500ms

Create performance report with before/after metrics.
```

**Success Criteria:**
- ✅ Lighthouse score > 90
- ✅ All Core Web Vitals green
- ✅ Bundle size < 500KB
- ✅ Images optimized
- ✅ Code splitting implemented
- ✅ Caching active
- ✅ Database queries optimized

---

## 📋 PHASE 9: DEPLOYMENT (Week 6-7) - FINAL

### Priority: 🔴 CRITICAL - Go live!

---

### **Task 9.1: Staging Deployment**
**Agent:** `deployment-engineer`
**Estimated Time:** 4-6 hours

**Steps:**
1. Create staging Supabase project
2. Run migrations on staging
3. Seed staging with test data
4. Deploy to Netlify staging
5. Configure environment variables
6. Test all features on staging
7. Run E2E tests against staging
8. Fix any issues

**Success Criteria:**
- ✅ Staging environment deployed
- ✅ All features work on staging
- ✅ Tests pass on staging
- ✅ No errors in logs

---

### **Task 9.2: Production Deployment**
**Agent:** `deployment-engineer`
**Estimated Time:** 2-4 hours
**Dependencies:** Task 9.1 complete

**Steps:**
1. Create production Supabase project
2. Run migrations on production
3. Deploy to Netlify production
4. Configure production env vars
5. Set up custom domain
6. Configure SSL
7. Set up monitoring
8. Create backups
9. Test all critical flows
10. Monitor for errors

**Success Criteria:**
- ✅ Production deployed
- ✅ Custom domain configured
- ✅ SSL working
- ✅ All features work
- ✅ Monitoring active
- ✅ Backups scheduled

---

## 📊 EXECUTION SUMMARY

### **Time Estimates:**

| Phase | Tasks | Estimated Time | Agent Chain |
|-------|-------|----------------|-------------|
| Phase 1: Foundation | 4 tasks | 1 week | database-schema-designer |
| Phase 2: Authentication | 2 tasks | 1-2 weeks | api-architect → security-posture-evaluator |
| Phase 3: API Implementation | 3 tasks | 1-2 weeks | api-architect (x3) |
| Phase 4: Frontend Integration | 3 tasks | 1-2 weeks | frontend-architect (x3) |
| Phase 5: Client Portal | 3 tasks | 2 weeks | frontend-architect → api-architect |
| Phase 6: Payments | 1 task | 1 week | api-architect |
| Phase 7: Infrastructure | 3 tasks | 1 week | deployment-engineer |
| Phase 8: Testing & QA | 4 tasks | 1 week | testing-strategist → security-posture-evaluator → code-optimization-reviewer |
| Phase 9: Deployment | 2 tasks | 1 week | deployment-engineer |

**Total: 6-8 weeks (full-time)**

---

### **Agent Usage Summary:**

1. **database-schema-designer** - Database setup, verification, Realtime
2. **api-architect** - Auth, APIs, file uploads, email, payments, quiz backend
3. **security-posture-evaluator** - Auth security, security audit
4. **frontend-architect** - Frontend integration, client portal, course player
5. **deployment-engineer** - Redis, Sentry, deployment
6. **testing-strategist** - Test fixes
7. **code-optimization-reviewer** - Performance optimization

---

### **Dependencies Flow:**

```
Phase 1 (Foundation)
  ↓
Phase 2 (Auth) ← MUST COMPLETE FIRST
  ↓
Phase 3 (APIs) + Phase 4 (Frontend) ← Can be parallel
  ↓
Phase 5 (Client Portal) + Phase 6 (Payments) ← Can be parallel
  ↓
Phase 7 (Infrastructure) ← Can start anytime
  ↓
Phase 8 (Testing) ← Must be last before deploy
  ↓
Phase 9 (Deployment)
```

---

## 🚀 READY TO START?

**Next Steps:**
1. Review this roadmap
2. Approve priority order
3. Start with Phase 1, Task 1.1 (Clean up dev servers)
4. Execute tasks sequentially using the specified agents
5. Mark tasks complete in todo list as you go
6. Test thoroughly after each phase
7. Deploy to production when Phase 8 complete

**Let's build! 💪**
