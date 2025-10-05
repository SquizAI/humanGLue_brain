# Instructor Dashboard API - Implementation Checklist

## Overview

This checklist tracks the implementation status of all 29 instructor dashboard API endpoints.

**Progress**: 5/29 endpoints implemented (17%)

---

## ✅ Completed Endpoints (5)

- [x] **GET /api/instructor/students** - List students with filtering
- [x] **GET /api/instructor/students/:studentId** - Student detail view
- [x] **GET /api/instructor/analytics/revenue** - Revenue analytics
- [x] **GET /api/instructor/workshops** - List workshops
- [x] **POST /api/instructor/workshops** - Create workshop

---

## 📋 Students Management (2 remaining)

- [x] ~~GET /api/instructor/students~~ ✅
- [x] ~~GET /api/instructor/students/:studentId~~ ✅
- [ ] **POST /api/instructor/students/bulk-email**
  - Dependencies: Email service (Resend)
  - Schema: ✅ `bulkEmailSchema`
  - Implementation file: `app/api/instructor/students/bulk-email/route.ts`
  - Complexity: Medium
  - Estimated time: 3 hours

- [ ] **POST /api/instructor/students/export**
  - Dependencies: CSV/XLSX generation library
  - Schema: ✅ `exportStudentsSchema`
  - Implementation file: `app/api/instructor/students/export/route.ts`
  - Complexity: Medium
  - Estimated time: 4 hours

---

## 📊 Analytics (4 remaining)

- [x] ~~GET /api/instructor/analytics/revenue~~ ✅
- [ ] **GET /api/instructor/analytics/enrollments**
  - Dependencies: None
  - Schema: ✅ `getEnrollmentsQuerySchema`
  - Implementation file: `app/api/instructor/analytics/enrollments/route.ts`
  - Complexity: Medium
  - Estimated time: 3 hours

- [ ] **GET /api/instructor/analytics/engagement**
  - Dependencies: None
  - Schema: ✅ `getEngagementQuerySchema`
  - Implementation file: `app/api/instructor/analytics/engagement/route.ts`
  - Complexity: Medium
  - Estimated time: 3 hours

- [ ] **GET /api/instructor/analytics/course-performance**
  - Dependencies: None
  - Schema: ✅ (no query params)
  - Implementation file: `app/api/instructor/analytics/course-performance/route.ts`
  - Complexity: High (complex aggregations)
  - Estimated time: 5 hours

- [ ] **POST /api/instructor/analytics/export**
  - Dependencies: PDF generation (jsPDF), CSV library
  - Schema: ✅ `exportAnalyticsSchema`
  - Implementation file: `app/api/instructor/analytics/export/route.ts`
  - Complexity: High
  - Estimated time: 6 hours

---

## 👤 Profile Management (4 remaining)

- [ ] **GET /api/instructor/profile**
  - Dependencies: Need `instructor_profiles` table
  - Schema: ✅ (no input)
  - Implementation file: `app/api/instructor/profile/route.ts`
  - Complexity: Low
  - Estimated time: 2 hours
  - **Blocker**: Database schema update needed

- [ ] **PUT /api/instructor/profile**
  - Dependencies: `instructor_profiles` table
  - Schema: ✅ `updateInstructorProfileSchema`
  - Implementation file: `app/api/instructor/profile/route.ts` (same file as GET)
  - Complexity: Medium
  - Estimated time: 3 hours
  - **Blocker**: Database schema update needed

- [ ] **POST /api/instructor/profile/upload**
  - Dependencies: Supabase Storage bucket setup
  - Schema: ✅ `uploadProfileImageSchema`
  - Implementation file: `app/api/instructor/profile/upload/route.ts`
  - Complexity: Medium
  - Estimated time: 4 hours

- [ ] **GET /api/instructor/profile/stats**
  - Dependencies: None
  - Schema: ✅ (no input)
  - Implementation file: `app/api/instructor/profile/stats/route.ts`
  - Complexity: Medium
  - Estimated time: 3 hours

---

## ⚙️ Settings Management (7 remaining)

- [ ] **GET /api/instructor/settings**
  - Dependencies: Settings schema in user metadata or separate table
  - Schema: ✅ (no input)
  - Implementation file: `app/api/instructor/settings/route.ts`
  - Complexity: Medium
  - Estimated time: 3 hours

- [ ] **PUT /api/instructor/settings**
  - Dependencies: Same as GET
  - Schema: ✅ `updateSettingsSchema`
  - Implementation file: `app/api/instructor/settings/route.ts` (same file as GET)
  - Complexity: Medium
  - Estimated time: 3 hours

- [ ] **POST /api/instructor/settings/change-password**
  - Dependencies: Supabase Auth API
  - Schema: ✅ `changePasswordSchema`
  - Implementation file: `app/api/instructor/settings/change-password/route.ts`
  - Complexity: Low
  - Estimated time: 2 hours

- [ ] **POST /api/instructor/settings/2fa**
  - Dependencies: 2FA service (Supabase Auth supports this)
  - Schema: ✅ `toggle2FASchema`
  - Implementation file: `app/api/instructor/settings/2fa/route.ts`
  - Complexity: Medium
  - Estimated time: 4 hours

- [ ] **GET /api/instructor/settings/sessions**
  - Dependencies: Session tracking (Supabase Auth)
  - Schema: ✅ (no input)
  - Implementation file: `app/api/instructor/settings/sessions/route.ts`
  - Complexity: Low
  - Estimated time: 2 hours

- [ ] **POST /api/instructor/settings/sessions/revoke**
  - Dependencies: Session management (Supabase Auth)
  - Schema: ✅ `revokeSessionSchema`
  - Implementation file: `app/api/instructor/settings/sessions/revoke/route.ts`
  - Complexity: Low
  - Estimated time: 2 hours

- [ ] **POST /api/instructor/settings/export-data**
  - Dependencies: GDPR export logic, background job queue
  - Schema: ✅ `exportDataSchema`
  - Implementation file: `app/api/instructor/settings/export-data/route.ts`
  - Complexity: High
  - Estimated time: 6 hours

---

## 📚 Courses Management (4 remaining)

- [ ] **GET /api/instructor/courses**
  - Dependencies: Need `instructor_id` in courses table
  - Schema: ✅ `getInstructorCoursesQuerySchema`
  - Implementation file: `app/api/instructor/courses/route.ts`
  - Complexity: Medium
  - Estimated time: 3 hours
  - **Blocker**: Database schema update needed

- [ ] **POST /api/instructor/courses**
  - Dependencies: `instructor_id` in courses table
  - Schema: ✅ `createCourseSchema`
  - Implementation file: `app/api/instructor/courses/route.ts` (same file as GET)
  - Complexity: Medium
  - Estimated time: 3 hours
  - **Blocker**: Database schema update needed

- [ ] **PUT /api/instructor/courses/:courseId**
  - Dependencies: Same as above
  - Schema: ✅ `updateCourseSchema`
  - Implementation file: `app/api/instructor/courses/[courseId]/route.ts`
  - Complexity: Medium
  - Estimated time: 3 hours
  - **Blocker**: Database schema update needed

- [ ] **GET /api/instructor/courses/:courseId/analytics**
  - Dependencies: Same as above
  - Schema: ✅ (no input)
  - Implementation file: `app/api/instructor/courses/[courseId]/analytics/route.ts`
  - Complexity: High (complex aggregations)
  - Estimated time: 5 hours

---

## 🎓 Workshops Management (3 remaining)

- [x] ~~GET /api/instructor/workshops~~ ✅
- [x] ~~POST /api/instructor/workshops~~ ✅
- [ ] **GET /api/instructor/workshops/:workshopId/attendance**
  - Dependencies: None
  - Schema: ✅ (no input)
  - Implementation file: `app/api/instructor/workshops/[workshopId]/attendance/route.ts`
  - Complexity: Low
  - Estimated time: 2 hours

- [ ] **PUT /api/instructor/workshops/:workshopId/enrollment**
  - Dependencies: None
  - Schema: ✅ `updateWorkshopEnrollmentSchema`
  - Implementation file: `app/api/instructor/workshops/[workshopId]/enrollment/route.ts`
  - Complexity: Medium
  - Estimated time: 3 hours

- [ ] **PUT /api/instructor/workshops/:workshopId** (general update)
  - Dependencies: None
  - Schema: Similar to create schema
  - Implementation file: `app/api/instructor/workshops/[workshopId]/route.ts`
  - Complexity: Medium
  - Estimated time: 3 hours

---

## 🗄️ Database Schema Updates Required

### High Priority

1. **Add `instructor_id` to `courses` table**:
```sql
ALTER TABLE courses ADD COLUMN instructor_id UUID REFERENCES users(id);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);

-- Update existing courses (if needed)
UPDATE courses SET instructor_id = 'default-instructor-uuid';
```

2. **Create `instructor_profiles` table**:
```sql
CREATE TABLE instructor_profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  expertise TEXT[],
  years_experience INTEGER,
  education JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  work_experience JSONB DEFAULT '[]'::jsonb,
  social_links JSONB DEFAULT '{}'::jsonb,
  cover_photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_instructor_profiles_user ON instructor_profiles(id);

CREATE TRIGGER update_instructor_profiles_updated_at
  BEFORE UPDATE ON instructor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

3. **Create `instructor_settings` table**:
```sql
CREATE TABLE instructor_settings (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  general_settings JSONB DEFAULT '{}'::jsonb,
  notification_settings JSONB DEFAULT '{}'::jsonb,
  privacy_settings JSONB DEFAULT '{}'::jsonb,
  payment_settings JSONB DEFAULT '{}'::jsonb,
  teaching_preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_instructor_settings_updated_at
  BEFORE UPDATE ON instructor_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 📦 External Services Integration

### Required Services

1. **Email Service** (for bulk emails)
   - [ ] Set up Resend account
   - [ ] Configure API key in env
   - [ ] Create email templates
   - [ ] Test email delivery

2. **File Storage** (for uploads)
   - [ ] Create Supabase Storage bucket: `instructor-uploads`
   - [ ] Configure CORS policies
   - [ ] Set up RLS policies
   - [ ] Test upload/download

3. **Rate Limiting** (for API protection)
   - [ ] Set up Upstash Redis account
   - [ ] Configure Redis connection
   - [ ] Implement rate limit middleware
   - [ ] Test rate limits

4. **PDF Generation** (for analytics export)
   - [ ] Install jsPDF or similar
   - [ ] Create PDF templates
   - [ ] Test PDF generation

5. **CSV Export** (for data export)
   - [ ] Install csv-writer or similar
   - [ ] Implement export logic
   - [ ] Test CSV generation

---

## ⏱️ Time Estimates

### By Category

| Category | Remaining | Est. Hours | Status |
|----------|-----------|------------|--------|
| Students | 2 | 7h | Schema ready |
| Analytics | 4 | 17h | Schema ready |
| Profile | 4 | 12h | **Blocked: DB schema** |
| Settings | 7 | 22h | Schema ready |
| Courses | 4 | 14h | **Blocked: DB schema** |
| Workshops | 3 | 8h | Schema ready |
| **TOTAL** | **24** | **80h** | - |

### By Priority

| Priority | Count | Est. Hours |
|----------|-------|------------|
| High (no blockers) | 16 | 54h |
| Medium (minor blockers) | 4 | 14h |
| Low (major blockers) | 4 | 12h |

### Sprint Planning

**Sprint 1 (Week 1)**: Database schema updates + High priority endpoints
- Database migrations (4h)
- Students exports (7h)
- Analytics (17h)
- Workshops attendance (8h)
- **Total: 36h**

**Sprint 2 (Week 2)**: Profile & Settings
- Profile endpoints (12h)
- Settings endpoints (22h)
- **Total: 34h**

**Sprint 3 (Week 3)**: Courses & Polish
- Courses management (14h)
- Testing & bug fixes (10h)
- Documentation updates (6h)
- **Total: 30h**

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] All validation schemas tested
- [ ] Error handling tested
- [ ] Auth helpers tested
- [ ] Each endpoint has tests

### Integration Tests
- [ ] End-to-end flows tested
- [ ] Database interactions tested
- [ ] External service mocks tested
- [ ] Error scenarios tested

### Load Tests
- [ ] Rate limiting verified
- [ ] Performance benchmarks met
- [ ] Concurrent request handling
- [ ] Database query optimization

---

## 📚 Documentation Checklist

- [x] API Design Document
- [x] Implementation Guide
- [x] Endpoints Quick Reference
- [x] API Summary
- [x] README Index
- [ ] OpenAPI/Swagger spec
- [ ] Postman collection
- [ ] SDK documentation
- [ ] Video tutorials

---

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] All environment variables documented
- [ ] Database migrations tested
- [ ] RLS policies verified
- [ ] All endpoints tested locally
- [ ] Error handling verified
- [ ] Rate limiting configured

### Staging Deployment
- [ ] Deploy to staging environment
- [ ] Run smoke tests
- [ ] Integration test suite passes
- [ ] Load test critical endpoints
- [ ] Security audit completed

### Production Deployment
- [ ] Final code review
- [ ] Deploy to production
- [ ] Monitor error rates
- [ ] Verify health checks
- [ ] Update documentation
- [ ] Notify team

---

## 🎯 Success Metrics

### Performance
- Response time p95 < 200ms
- Response time p99 < 500ms
- Error rate < 0.1%
- Uptime > 99.9%

### Coverage
- Unit test coverage > 80%
- Integration test coverage > 70%
- Documentation coverage: 100%

### Usage
- API adoption by instructors > 90%
- Student satisfaction score > 4.5/5
- Support tickets < 5 per week

---

## 📞 Support & Questions

For implementation questions:
- **Technical Lead**: engineering@humanglue.ai
- **Slack**: #api-development
- **Documentation**: See `/docs` folder

---

**Last Updated**: 2025-10-04
**Next Review**: Weekly during implementation sprints
