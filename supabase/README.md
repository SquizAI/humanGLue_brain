# HumanGlue Platform - Supabase Database

Production-ready PostgreSQL database schema for the HumanGlue AI transformation platform.

## Quick Start

### Prerequisites

- Supabase account ([supabase.com](https://supabase.com))
- Supabase CLI installed: `npm install -g supabase`
- PostgreSQL client (optional, for manual migrations)

### 1. Initialize Supabase Project

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Or initialize a new project
supabase init
```

### 2. Apply Migrations

```bash
# Apply all migrations in order
supabase db push

# Or apply manually with psql
psql $DATABASE_URL -f migrations/001_create_users_and_roles.sql
psql $DATABASE_URL -f migrations/002_create_workshops.sql
psql $DATABASE_URL -f migrations/003_create_assessments.sql
psql $DATABASE_URL -f migrations/004_create_talent_and_engagements.sql
psql $DATABASE_URL -f migrations/005_create_payments_certificates_reviews.sql
```

### 3. Seed Development Data (Optional)

```bash
# Load sample data for development
psql $DATABASE_URL -f seed.sql
```

### 4. Generate TypeScript Types

```bash
# Generate types from database schema
supabase gen types typescript --local > types/database.types.ts

# Or for remote project
supabase gen types typescript --project-ref your-project-ref > types/database.types.ts
```

## File Structure

```
supabase/
├── migrations/
│   ├── 001_create_users_and_roles.sql       # Users, roles, orgs
│   ├── 002_create_workshops.sql             # Workshops & registrations
│   ├── 003_create_assessments.sql           # Assessments & answers
│   ├── 004_create_talent_and_engagements.sql # Marketplace & engagements
│   └── 005_create_payments_certificates_reviews.sql # Transactions
├── types/
│   └── database.types.ts                     # TypeScript definitions
├── seed.sql                                  # Sample data for testing
├── SCHEMA.md                                 # Detailed schema documentation
└── README.md                                 # This file
```

## Core Tables

### Users & Authentication
- `users` - User profiles (extends auth.users)
- `user_roles` - RBAC (admin, instructor, expert, client, user)
- `organizations` - Client companies

### Workshops & Learning
- `workshops` - Workshop catalog
- `workshop_registrations` - Enrollments and completions

### Assessments
- `assessments` - Adaptability assessments
- `assessment_answers` - Question responses

### Talent Marketplace
- `talent_profiles` - Expert consultant profiles
- `talent_testimonials` - Client testimonials
- `engagements` - Client-expert relationships
- `engagement_sessions` - Individual sessions

### Transactions & Credentials
- `payments` - Payment records
- `certificates` - Completion certificates
- `reviews` - Workshop/expert reviews

## Key Features

### Row Level Security (RLS)
All tables have RLS enabled with comprehensive policies:
- Users can only see/modify their own data
- Organization members can access org data
- Public can view published workshops and talent profiles
- Admins have full access

### Automatic Triggers
- `updated_at` auto-updates on all tables
- Workshop capacity management (auto-decrement/increment)
- Assessment score calculation from answers
- Expert rating updates from reviews
- Certificate number generation

### Performance Optimizations
- Foreign key indexes
- Composite indexes for common queries
- GIN indexes for JSONB and array fields
- Full-text search indexes
- Partial indexes for filtered queries

## Usage Examples

### TypeScript/Supabase Client

```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from './types/database.types'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Get available workshops
const { data: workshops } = await supabase
  .from('workshops')
  .select(`
    *,
    instructor:users(full_name, avatar_url),
    registrations:workshop_registrations(count)
  `)
  .eq('status', 'published')
  .eq('pillar', 'adaptability')
  .gt('capacity_remaining', 0)
  .order('schedule_date', { ascending: true })

// Get user's latest assessment
const { data: assessment } = await supabase
  .rpc('get_user_latest_assessment', { p_user_id: userId })
  .single()

// Search talent by expertise
const { data: experts } = await supabase
  .rpc('search_talent', {
    p_expertise: ['AI Adoption', 'Change Management'],
    p_min_rating: 4.5,
    p_limit: 20
  })
```

### Direct SQL

```sql
-- Get workshop summary
SELECT
  w.title,
  u.full_name AS instructor,
  w.capacity_remaining,
  COUNT(wr.id) AS registrations
FROM workshops w
JOIN users u ON w.instructor_id = u.id
LEFT JOIN workshop_registrations wr ON w.id = wr.workshop_id
WHERE w.status = 'published'
GROUP BY w.id, u.full_name
ORDER BY w.schedule_date;

-- Get organization adaptability trend
SELECT * FROM get_org_adaptability_trend(
  'organization-uuid',
  6 -- months
);
```

## Database Functions

### User & Roles
- `has_role(user_id, role)` - Check if user has specific role
- `get_user_roles(user_id)` - Get all active roles for user

### Workshops
- `get_available_workshops(pillar, level, limit, offset)` - Get published workshops
- `get_user_workshop_history(user_id)` - Get user's workshop history

### Assessments
- `get_user_latest_assessment(user_id)` - Get most recent completed assessment
- `get_assessment_progress(assessment_id)` - Get completion percentage per dimension
- `get_org_adaptability_trend(org_id, months)` - Get trend over time

### Talent
- `search_talent(expertise, industries, min_rating, availability, limit, offset)` - Search experts
- `get_client_engagement_summary(client_id)` - Get engagement metrics

### Transactions
- `get_user_payment_history(user_id, limit, offset)` - Get payment records
- `get_user_certificates(user_id)` - Get earned certificates
- `get_workshop_reviews_summary(workshop_id)` - Get review statistics

## Environment Variables

Create a `.env.local` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key # Server-side only

# Database (for direct connections)
DATABASE_URL=postgresql://user:password@host:5432/database
```

## Migration Management

### Creating New Migrations

```bash
# Create new migration
supabase migration new migration_name

# Edit the file in migrations/
# Add your SQL changes
# Add rollback SQL in comments at bottom
```

### Rolling Back

Each migration includes rollback SQL at the bottom (commented out).

To rollback:
```sql
-- Uncomment rollback section and run
-- DROP TABLE IF EXISTS table_name CASCADE;
```

### Best Practices
1. **Never modify existing migrations** - Create new ones
2. **Always test migrations locally first**
3. **Include rollback SQL** in comments
4. **Add descriptive comments** explaining changes
5. **Run in transaction** when possible

## Security Checklist

Before going to production:

- [ ] Enable RLS on all tables
- [ ] Review all RLS policies
- [ ] Remove development-only seed data
- [ ] Rotate all API keys
- [ ] Enable database backups
- [ ] Set up monitoring/alerts
- [ ] Review user permissions
- [ ] Enable SSL/TLS for connections
- [ ] Audit SECURITY DEFINER functions
- [ ] Test all RLS policies thoroughly

## Performance Monitoring

### Supabase Dashboard
- Monitor query performance
- Track slow queries
- Review index usage
- Check table sizes

### SQL Queries

```sql
-- View slow queries
SELECT * FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Troubleshooting

### Common Issues

**Issue: Migrations fail with "relation already exists"**
```bash
# Reset local database
supabase db reset

# Or manually drop and recreate
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

**Issue: RLS prevents data access**
```sql
-- Check current user's roles
SELECT * FROM get_user_roles(auth.uid());

-- Temporarily disable RLS (development only!)
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

**Issue: Slow queries**
```sql
-- Analyze table
ANALYZE table_name;

-- Explain query
EXPLAIN ANALYZE
SELECT ...
```

## Resources

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Schema Documentation**: [SCHEMA.md](./SCHEMA.md)
- **Type Definitions**: [types/database.types.ts](./types/database.types.ts)

## Support

For issues or questions:
1. Check [SCHEMA.md](./SCHEMA.md) for detailed documentation
2. Review migration files for implementation details
3. Test queries in Supabase SQL Editor
4. Check RLS policies if access denied

## License

Proprietary - HumanGlue Platform
