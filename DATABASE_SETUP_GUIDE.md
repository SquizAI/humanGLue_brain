# HumanGlue Database Setup Guide

Complete guide for setting up and verifying the HumanGlue Supabase database.

---

## 🚀 Quick Start

### Prerequisites

1. **Docker Desktop** - Must be running
   - Download: https://www.docker.com/products/docker-desktop
   - Verify: `docker ps` should work without errors

2. **Supabase CLI** - Install globally
   ```bash
   npm install -g supabase
   # or
   brew install supabase/tap/supabase
   ```

3. **Node.js** - v18 or higher
   ```bash
   node --version
   ```

### One-Command Setup

```bash
npm run db:setup
```

This automated script will:
- ✅ Check Docker status
- ✅ Start Supabase locally
- ✅ Apply all 14 migrations
- ✅ Verify database setup
- ✅ Seed test data (optional)
- ✅ Run health check

---

## 📋 Manual Setup Steps

If you prefer manual control:

### 1. Start Docker Desktop

Open Docker Desktop and wait for it to fully start (whale icon should be steady).

### 2. Start Supabase

```bash
cd /path/to/humanGLue_brain
supabase start
```

This will:
- Start PostgreSQL, Auth, Storage, and other services
- Auto-apply all migrations in `/supabase/migrations/`
- Display connection details

**Output example:**
```
API URL: http://localhost:54321
GraphQL URL: http://localhost:54321/graphql/v1
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
Anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Service role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Verify Migrations

```bash
npm run db:verify
```

Checks:
- All 27+ tables exist
- RLS policies active
- Triggers working
- Indexes created
- Functions callable

### 4. Seed Test Data

```bash
npm run db:seed
```

Creates:
- 2 organizations
- 3 teams
- 16 users (admin, org admins, instructors, students)
- 3 instructor profiles
- 5 courses
- 5 workshops
- 30+ enrollments
- 50+ activity records
- 20+ notifications

### 5. Health Check

```bash
npm run db:health
```

Quick verification:
- Connection status
- Table counts
- RLS verification
- Sample query performance

---

## 📊 Migration Files

### Applied in Order:

1. **001_create_users_and_roles.sql** - Basic user management
2. **001_multi_tenant_schema.sql** - Organizations, teams, multi-tenancy (64 KB)
3. **002_create_workshops.sql** - Workshop system
4. **002_instructor_schema.sql** - Instructor portal (61 KB, 9 tables)
5. **003_create_assessments.sql** - Assessment system
6. **003_realtime_setup.sql** - Notifications, realtime (16 KB)
7. **004_create_talent_and_engagements.sql** - Talent marketplace
8. **005_create_payments_certificates_reviews.sql** - Payments, certificates
9. **006_fix_api_compatibility.sql** - API compatibility fixes

**Documentation files** (not executed):
- `002_ERD.md` - Entity Relationship Diagram
- `002_SCHEMA_OVERVIEW.md` - Schema documentation
- `002_QUERY_EXAMPLES.sql` - Query examples
- `002_TESTING.sql` - Test queries
- `README.md` - Migration guide

---

## 🗄️ Database Schema

### Tables (27 total):

**Multi-Tenant Core:**
- `organizations` - Top-level tenant isolation
- `teams` - Departments/groups
- `users` - User profiles
- `team_members` - Team membership

**Instructor System:**
- `instructor_profiles` - Bio, credentials, stats
- `instructor_settings` - Preferences
- `courses` - Course catalog
- `course_lessons` - Lesson content
- `course_sections` - Course structure
- `enrollments` - Student enrollments
- `student_progress` - Lesson completion
- `student_activity` - Activity timeline
- `revenue_transactions` - Revenue tracking
- `course_reviews` - Ratings and reviews

**Workshops:**
- `workshops` - Workshop events
- `workshop_registrations` - Student registrations
- `workshop_feedback` - Post-workshop reviews

**Assessments:**
- `assessments` - User assessments
- `assessment_responses` - Question responses

**Talent Marketplace:**
- `talent_profiles` - Professional profiles
- `engagement_requests` - Project requests
- `consultations` - 1-on-1 sessions

**Payments & Certificates:**
- `payments` - Payment transactions
- `certificates` - Completion certificates

**Realtime Features:**
- `notifications` - User notifications
- `student_presence` - Online/offline tracking

**Compatibility (Migration 006):**
- `quiz_attempts` - Quiz tracking
- `assignment_submissions` - Assignment tracking

---

## 🔐 Security Features

### Row Level Security (RLS)

**All user data tables have RLS enabled:**

1. **Organization Isolation**
   - Users can only access data from their organization
   - Admins can access all organizations

2. **Instructor-Student Separation**
   - Instructors can only see their own courses and students
   - Students can only see their own enrollments and progress

3. **Multi-Tenant Policies**
   - Every query is automatically filtered by organization/user
   - No manual filtering needed in application code

**Example Policy:**
```sql
CREATE POLICY "Instructors can view their students"
  ON enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = enrollments.course_id
        AND courses.instructor_id = auth.uid()
    )
  );
```

---

## ⚡ Performance Features

### Indexes (50+)

**Foreign Key Indexes:**
- All foreign keys indexed for join performance

**Composite Indexes:**
- `(user_id, course_id)` for student progress queries
- `(instructor_id, status)` for course filtering
- `(organization_id, created_at)` for tenant queries

**Partial Indexes:**
- Published courses only
- Active users only
- Unread notifications

**GIN Indexes:**
- JSONB columns (metadata, settings)
- Full-text search on course titles/descriptions

### Query Optimization

**Helper Functions:**
- `get_instructor_dashboard_stats()` - Pre-aggregated metrics
- `get_instructor_student_progress()` - Optimized progress queries
- `get_instructor_recent_activity()` - Paginated activity feed

**Materialized Views:**
- `live_course_stats` - Real-time course statistics
- `instructor_recent_activity` - Activity feed
- `user_unread_notifications` - Notification counts

---

## 🔄 Real-time Features

### Realtime-Enabled Tables:

- `notifications` - Live notification updates
- `enrollments` - Live enrollment tracking
- `workshop_registrations` - Live workshop signups
- `student_activity` - Live activity feed
- `course_reviews` - Live review updates
- `student_presence` - Online/offline status
- `payments` - Payment confirmations

### Usage Example:

```typescript
const supabase = createClient(url, anonKey)

// Subscribe to new notifications
supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    console.log('New notification:', payload.new)
  })
  .subscribe()
```

---

## 🧪 Testing

### Test Data Credentials

After seeding (`npm run db:seed`), you can log in as:

**Platform Admin:**
- Email: `admin@humanglue.ai`

**Instructors:**
- Email: `dr.emily@humanglue.ai` (standalone)
- Email: `james@techcorp.com` (org-linked)
- Email: `maria@humanglue.ai` (standalone)

**Students:**
- Email: `student1@test.com` through `student10@test.com`

**Organization Admins:**
- Email: `admin@techcorp.com`
- Email: `admin@globalinnovations.com`

### Test Queries

```sql
-- Get all courses by instructor
SELECT * FROM courses WHERE instructor_id = 'instructor-uuid';

-- Get student enrollments with progress
SELECT
  u.name,
  c.title,
  e.completion_percentage,
  e.status
FROM enrollments e
JOIN users u ON e.user_id = u.id
JOIN courses c ON e.course_id = c.id
WHERE c.instructor_id = 'instructor-uuid';

-- Get instructor dashboard stats
SELECT * FROM get_instructor_dashboard_stats('instructor-uuid');

-- Get unread notifications
SELECT * FROM notifications
WHERE user_id = 'user-uuid'
  AND read_at IS NULL
ORDER BY created_at DESC;
```

---

## 🛠️ Available Commands

### Database Management

```bash
# Setup (full automated setup)
npm run db:setup

# Start/Stop Supabase
npm run db:start
npm run db:stop
npm run db:status

# Reset database (drop all data, re-run migrations)
npm run db:reset

# Verification and Health
npm run db:verify    # Full verification
npm run db:health    # Quick health check
npm run db:seed      # Seed test data
```

### Supabase CLI Commands

```bash
# Start Supabase
supabase start

# Stop Supabase
supabase stop

# Check status
supabase status

# Reset database
supabase db reset

# Open Studio (web UI)
open http://localhost:54323

# Generate TypeScript types
supabase gen types typescript --local > types/supabase.ts

# Create new migration
supabase migration new migration_name

# Push to remote
supabase db push --db-url postgresql://...
```

---

## 🐛 Troubleshooting

### Docker Not Running

**Error:** `Cannot connect to the Docker daemon`

**Solution:**
1. Open Docker Desktop
2. Wait for it to fully start
3. Run `docker ps` to verify

### Supabase Already Running

**Error:** `Project already running`

**Solution:**
```bash
supabase stop
supabase start
```

### Migrations Failed

**Error:** Migration errors during `supabase start`

**Solution:**
```bash
# View migration errors
supabase db reset --debug

# Check migration file syntax
cat supabase/migrations/006_fix_api_compatibility.sql

# Try applying individual migration
psql -h localhost -p 54322 -U postgres -d postgres -f supabase/migrations/006_fix_api_compatibility.sql
```

### Port Conflicts

**Error:** `Port 54321 already in use`

**Solution:**
```bash
# Find and kill process using port
lsof -ti:54321 | xargs kill -9

# Or change Supabase ports in config.toml
```

### RLS Blocking Queries

**Error:** `Permission denied` or empty results

**Solution:**
- Use service role key for admin operations
- Check RLS policies in Supabase Studio
- Verify `auth.uid()` matches expected user

### Missing tsx Command

**Error:** `tsx: command not found`

**Solution:**
```bash
npm install -g tsx
# or use npx
npx tsx scripts/verify-database.ts
```

---

## 📈 Monitoring & Maintenance

### Regular Checks

```bash
# Daily health check
npm run db:health

# Weekly verification
npm run db:verify

# Monitor database size
SELECT pg_size_pretty(pg_database_size('postgres'));

# Check active connections
SELECT count(*) FROM pg_stat_activity;
```

### Cleanup Functions

```sql
-- Delete old notifications (30+ days)
SELECT cleanup_old_notifications();

-- Delete stale presence records
SELECT cleanup_stale_presence();
```

### Performance Monitoring

```sql
-- Slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

---

## 🚀 Production Deployment

### Before Deploying

1. **Backup existing database:**
   ```bash
   supabase db dump -f backup.sql
   ```

2. **Test migrations locally:**
   ```bash
   supabase db reset
   npm run db:verify
   ```

3. **Review migration report:**
   ```bash
   cat scripts/migration-report.md
   ```

### Deploy to Remote

```bash
# Push to staging
supabase link --project-ref your-staging-project
supabase db push

# Verify
npm run health-check:staging

# Push to production
supabase link --project-ref your-production-project
supabase db push

# Verify
npm run health-check:production
```

### Post-Deployment

1. Run verification: `npm run db:verify`
2. Check error logs in Supabase Dashboard
3. Monitor query performance
4. Verify realtime subscriptions working
5. Test critical user flows

---

## 📚 Additional Resources

### Supabase Documentation
- Local Development: https://supabase.com/docs/guides/cli/local-development
- Row Level Security: https://supabase.com/docs/guides/auth/row-level-security
- Realtime: https://supabase.com/docs/guides/realtime

### Project Documentation
- `/supabase/migrations/README.md` - Migration guide
- `/supabase/migrations/002_SCHEMA_OVERVIEW.md` - Schema details
- `/supabase/migrations/002_ERD.md` - Entity relationships
- `/scripts/migration-report.md` - Migration status report

### Scripts Reference
- `/scripts/setup-database.sh` - Automated setup
- `/scripts/verify-database.ts` - Comprehensive verification
- `/scripts/seed-test-data.ts` - Test data seeding
- `/scripts/db-health-check.ts` - Quick health check

---

## ✅ Success Checklist

After setup, verify:

- [ ] Docker Desktop running
- [ ] Supabase started successfully
- [ ] All 14 migrations applied
- [ ] 27+ tables exist
- [ ] RLS enabled on all user tables
- [ ] Triggers working (updated_at auto-updates)
- [ ] Functions callable
- [ ] Realtime enabled on required tables
- [ ] Test data seeded
- [ ] Health check passes
- [ ] API endpoints functional
- [ ] Supabase Studio accessible (http://localhost:54323)

---

**Questions or Issues?**

Check:
1. This guide's Troubleshooting section
2. `/scripts/migration-report.md` for detailed status
3. Supabase logs: `supabase logs`
4. Project repository issues

**Happy coding! 🚀**
