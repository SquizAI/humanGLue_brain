# HumanGlue Database Migrations

This directory contains all database migrations for the HumanGlue AI transformation platform.

## Migration Files

### 001_multi_tenant_schema.sql
**Created**: 2025-10-04
**Description**: Foundation multi-tenant database schema

**Contains**:
- Core multi-tenant tables (organizations, teams, users)
- Assessment system (templates, assessments, responses)
- Learning content (courses, modules, lessons, enrollments)
- Workshop system (workshops, registrations)
- Expert consultation system
- Resource library
- Analytics tracking
- Row Level Security policies
- Storage bucket configuration

**Features**:
- Multi-tenant data isolation
- User role-based access (admin, org_admin, team_lead, member)
- Assessment scoring and AI analysis
- Course progress tracking
- Workshop capacity management
- Expert availability scheduling

---

### 002_instructor_schema.sql
**Created**: 2025-10-04
**Description**: Comprehensive instructor dashboard database schema
**Dependencies**: 001_multi_tenant_schema.sql

**Contains**:
- 9 new tables for instructor-specific features
- Enhanced existing tables (courses, workshops)
- 10+ triggers for automatic stat updates
- 4 helper functions for complex queries
- 30+ indexes for query performance
- Comprehensive RLS policies for data isolation

**New Tables**:
1. `instructor_profiles` - Extended instructor information
2. `instructor_settings` - User preferences and payment settings
3. `student_progress` - Aggregated progress tracking per student per course
4. `student_activity` - Timeline of all student activities
5. `revenue_transactions` - Revenue tracking with platform fee calculations
6. `course_reviews` - Student reviews and ratings for courses
7. `workshop_feedback` - Post-workshop satisfaction surveys
8. `course_instructors` - Junction table for co-teaching support
9. `workshop_facilitators` - Junction table for co-facilitating

**Key Features**:
- Multi-tenant support (standalone + org-linked instructors)
- Co-teaching capabilities (multiple instructors per course)
- Automatic stat tracking (enrollments, revenue, ratings)
- Revenue transactions with platform fee calculations
- Student activity timeline
- Comprehensive analytics and reporting
- Granular RLS policies for instructor isolation

---

## Supporting Documentation

### 002_SCHEMA_OVERVIEW.md
Comprehensive documentation of the instructor schema including:
- Schema design philosophy
- Table relationships and ERD
- Detailed table descriptions
- RLS security strategy
- Trigger and automation documentation
- Helper function documentation
- Performance optimization strategies
- Multi-tenant considerations

### 002_ERD.md
Visual entity relationship diagrams showing:
- Core entity relationships (Mermaid diagrams)
- Detailed table relationships
- Data flow diagrams
- Multi-tenant architecture patterns
- Index strategy overview
- Performance considerations

### 002_QUERY_EXAMPLES.sql
SQL query examples for common operations:
- Instructor profile queries
- Dashboard overview queries
- Course management CRUD
- Student management queries
- Workshop management queries
- Revenue and analytics queries
- Course review queries
- Performance tips and best practices

### 002_TESTING.sql
Comprehensive testing and validation script:
- Pre-flight checks (tables, indexes, triggers, functions, RLS)
- Seed data for testing
- Trigger tests (17 automated tests)
- Function tests
- RLS policy tests
- Constraint tests
- Performance tests (EXPLAIN ANALYZE)
- Data integrity tests
- Summary report

---

## How to Apply Migrations

### Option 1: Supabase Dashboard

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy the contents of `001_multi_tenant_schema.sql`
4. Execute the migration
5. Repeat for `002_instructor_schema.sql`

### Option 2: Supabase CLI

```bash
# Link your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push

# Or run specific migration
supabase db execute -f supabase/migrations/001_multi_tenant_schema.sql
supabase db execute -f supabase/migrations/002_instructor_schema.sql
```

### Option 3: Direct PostgreSQL Connection

```bash
# Connect to your database
psql "postgresql://postgres:[password]@[host]:5432/postgres"

# Run migrations
\i supabase/migrations/001_multi_tenant_schema.sql
\i supabase/migrations/002_instructor_schema.sql
```

---

## Testing the Migration

After applying the migrations, run the test script:

```bash
supabase db execute -f supabase/migrations/002_TESTING.sql
```

Or via psql:
```bash
psql "postgresql://..." -f supabase/migrations/002_TESTING.sql
```

The test script will:
- ✅ Verify all tables, indexes, triggers, and functions exist
- ✅ Create test data (instructor, students, courses, enrollments)
- ✅ Test triggers (auto-updates, activity logging, revenue tracking)
- ✅ Test helper functions
- ✅ Test RLS policies
- ✅ Verify constraints and data integrity
- ✅ Check query performance with EXPLAIN ANALYZE
- ✅ Generate summary report

Expected output: All tests should show "PASS" status.

---

## Generate TypeScript Types

After applying migrations, generate TypeScript types for your application:

```bash
# Generate types
supabase gen types typescript --local > lib/database.types.ts

# Or for remote database
supabase gen types typescript --project-ref your-project-ref > lib/database.types.ts
```

This creates type-safe TypeScript interfaces for all database tables.

---

## Database Schema Statistics

### Migration 001 (Multi-Tenant Foundation)
- **Tables**: 18 core tables
- **Enums**: 8 custom types
- **Indexes**: 50+ indexes
- **RLS Policies**: 60+ policies
- **Triggers**: 15 triggers
- **Functions**: 5 helper functions
- **Views**: 2 materialized views
- **Storage Buckets**: 6 buckets

### Migration 002 (Instructor Dashboard)
- **New Tables**: 9 tables
- **Enhanced Tables**: 2 tables (courses, workshops)
- **New Enums**: 6 types
- **New Indexes**: 30+ indexes
- **New RLS Policies**: 25+ policies
- **New Triggers**: 10 triggers
- **New Functions**: 4 helper functions
- **New Views**: 3 views

### Total Database
- **Tables**: 27 tables
- **Enums**: 14 custom types
- **Indexes**: 80+ indexes
- **RLS Policies**: 85+ policies
- **Triggers**: 25+ triggers
- **Functions**: 9 helper functions
- **Views**: 5 views
- **Storage Buckets**: 6 buckets

---

## Architecture Highlights

### Multi-Tenant Isolation

The schema supports three tenant types:
1. **Platform-wide**: Platform admins (role='admin') have full access
2. **Organization-based**: Org admins can view data for their org
3. **Standalone**: Independent instructors with no org affiliation

Data isolation is enforced at the database level via Row Level Security (RLS).

### Performance Optimization

- **Denormalized Stats**: Enrollment counts, ratings, revenue are pre-computed
- **Strategic Indexing**: Composite indexes for common query patterns
- **Partial Indexes**: For status-based and date-based filters
- **GIN Indexes**: For array and JSONB fields
- **Trigger-Based Updates**: Stats auto-update when source data changes
- **Helper Functions**: Pre-optimized queries for complex operations

### Security Model

- **RLS Enabled**: Every table with user data has RLS enabled
- **Instructor Isolation**: Instructors can only access their own data
- **Student Isolation**: Students can only access their own enrollments
- **Organization Isolation**: Org admins can view data for their org
- **Co-Teaching Support**: Granular permissions for co-instructors

### Data Integrity

- **Foreign Keys**: All relationships enforced with proper CASCADE rules
- **Check Constraints**: Data validation at database level (ratings 1-5, progress 0-100)
- **Unique Constraints**: Prevent duplicate enrollments, reviews, etc.
- **Triggers**: Ensure data consistency (stats, activity logs, revenue)

---

## Common Operations

### Get Instructor Dashboard Stats
```sql
SELECT * FROM get_instructor_dashboard_stats('instructor-user-id');
```

### Get Student Progress
```sql
SELECT * FROM get_instructor_student_progress('instructor-user-id', 'course-id');
```

### Get Revenue Breakdown
```sql
SELECT * FROM get_instructor_revenue_breakdown(
  'instructor-user-id',
  '2025-01-01'::timestamptz,
  '2025-12-31'::timestamptz
);
```

### Get Recent Activity
```sql
SELECT * FROM get_instructor_recent_activity('instructor-user-id', 50);
```

See `002_QUERY_EXAMPLES.sql` for more examples.

---

## Troubleshooting

### Migration Fails with Permission Error
```
ERROR: permission denied for schema public
```
**Solution**: Ensure you're connected as the `postgres` user or have sufficient privileges.

### RLS Policies Block Queries
```
ERROR: new row violates row-level security policy
```
**Solution**: Check that `auth.uid()` is set correctly. In Supabase, this is automatic for authenticated requests.

### Triggers Not Firing
```
Stats not updating after enrollment
```
**Solution**: Verify triggers exist:
```sql
SELECT * FROM pg_trigger WHERE tgname LIKE '%enrollment%';
```

### Slow Queries
```
Query taking > 1 second
```
**Solution**:
1. Check index usage: `EXPLAIN ANALYZE SELECT ...`
2. Verify indexes exist: `\d table_name`
3. Consider adding composite indexes for multi-column queries

### Test Script Fails
```
Test X: FAIL
```
**Solution**:
1. Review error messages in psql output
2. Check that seed data was created correctly
3. Verify RLS is not blocking test user queries

---

## Maintenance

### Weekly Tasks
- Review slow query logs
- Check index usage: `SELECT * FROM pg_stat_user_indexes WHERE idx_scan = 0;`
- Monitor table bloat: `SELECT * FROM pg_stat_user_tables;`

### Monthly Tasks
- Vacuum and analyze tables: `VACUUM ANALYZE;`
- Review RLS policies for performance
- Archive old student activity (> 1 year)
- Review and optimize materialized views

### Quarterly Tasks
- Review and update indexes based on query patterns
- Performance testing with realistic data volumes
- Security audit of RLS policies
- Backup and disaster recovery testing

---

## Rollback Instructions

### Rollback Migration 002
```sql
-- See rollback script at bottom of 002_instructor_schema.sql
-- WARNING: This will delete all instructor data!
```

### Rollback Migration 001
```sql
-- See rollback script at bottom of 001_multi_tenant_schema.sql
-- WARNING: This will delete all data!
```

**Important**: Always backup your database before running rollback scripts!

---

## Next Steps

1. ✅ Apply migrations to Supabase
2. ✅ Run test script to verify
3. ✅ Generate TypeScript types
4. 🔲 Create API routes using these tables
5. 🔲 Implement frontend components
6. 🔲 Add seed data for development
7. 🔲 Performance testing with realistic data
8. 🔲 Security audit of RLS policies

---

## Support

For issues or questions:
1. Check documentation in this directory
2. Review query examples in `002_QUERY_EXAMPLES.sql`
3. Run test script in `002_TESTING.sql`
4. Consult Supabase docs: https://supabase.com/docs
5. Review PostgreSQL docs: https://www.postgresql.org/docs/

---

## Version History

| Version | Date | Description | Files |
|---------|------|-------------|-------|
| 001 | 2025-10-04 | Multi-tenant foundation | `001_multi_tenant_schema.sql` |
| 002 | 2025-10-04 | Instructor dashboard | `002_instructor_schema.sql`, `002_SCHEMA_OVERVIEW.md`, `002_ERD.md`, `002_QUERY_EXAMPLES.sql`, `002_TESTING.sql` |

---

## License

Copyright 2025 HumanGlue. All rights reserved.
