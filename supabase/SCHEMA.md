# HumanGlue Platform - Database Schema Documentation

## Overview

This document provides a comprehensive overview of the HumanGlue Supabase PostgreSQL database schema, designed to support a platform for AI transformation coaching, workshops, assessments, and expert marketplace.

## Table of Contents

1. [Entity Relationship Diagram](#entity-relationship-diagram)
2. [Core Entities](#core-entities)
3. [Relationships](#relationships)
4. [Security Model](#security-model)
5. [Performance Optimizations](#performance-optimizations)
6. [Usage Examples](#usage-examples)

---

## Entity Relationship Diagram

```
┌─────────────────┐
│   auth.users    │ (Supabase Auth)
└────────┬────────┘
         │
         ├──────────────────────────────────────────┐
         │                                          │
┌────────▼────────┐                    ┌────────────▼──────────┐
│     users       │                    │    user_roles         │
│  (profiles)     │                    │     (RBAC)            │
└────────┬────────┘                    └───────────────────────┘
         │                                          │
         │                              ┌───────────▼───────────┐
         │                              │   organizations       │
         │                              └───────────────────────┘
         │
    ┌────┼────┬────────────────┬────────────┬─────────────┐
    │    │    │                │            │             │
┌───▼────▼┐  │         ┌──────▼──────┐ ┌───▼──────┐  ┌──▼─────────┐
│workshops│  │         │assessments  │ │  talent  │  │engagements │
│         │  │         │             │ │ profiles │  │            │
└────┬────┘  │         └──────┬──────┘ └────┬─────┘  └─────┬──────┘
     │       │                │             │              │
┌────▼───────▼──┐      ┌──────▼──────┐ ┌───▼──────┐  ┌────▼────────┐
│workshop_      │      │assessment_  │ │  talent  │  │engagement_  │
│registrations  │      │answers      │ │testimon. │  │sessions     │
└───────────────┘      └─────────────┘ └──────────┘  └─────────────┘
     │
     ├──────────────┬──────────────┬─────────────┐
┌────▼────┐  ┌──────▼──────┐ ┌────▼──────┐  ┌──▼──────┐
│payments │  │certificates │ │  reviews  │  │  ...    │
└─────────┘  └─────────────┘ └───────────┘  └─────────┘
```

---

## Core Entities

### 1. Users & Authentication

#### **users**
Extends Supabase Auth with profile information.

**Key Fields:**
- `id` (UUID, PK) - References auth.users
- `email` - User email address
- `full_name` - Display name
- `company_name` - Organization affiliation
- `metadata` (JSONB) - Flexible profile data
- `status` - Account status (active/inactive/suspended)

**Relationships:**
- One user → Many roles (user_roles)
- One user → Many workshops as instructor
- One user → Many assessments
- One user → One talent profile (optional)
- One user → Many engagements (as client or expert)

---

#### **user_roles**
Role-based access control (RBAC).

**Roles:**
- `admin` - Platform administrators
- `instructor` - Workshop creators/facilitators
- `expert` - Marketplace consultants
- `client` - Organization decision-makers
- `user` - Standard users

**Key Fields:**
- `user_id` - References users
- `role` - Role type
- `organization_id` - Optional org context
- `expires_at` - Optional role expiration

---

#### **organizations**
Client companies using the platform.

**Key Fields:**
- `name` - Company name
- `slug` - URL-friendly identifier
- `subscription_tier` - starter/growth/enterprise
- `subscription_status` - Billing status
- `company_size` - Employee count range
- `settings` (JSONB) - Org-specific configuration

---

### 2. Workshops

#### **workshops**
Learning experiences and masterclasses.

**Key Fields:**
- `title`, `description` - Content
- `instructor_id` - References users
- `pillar` - adaptability/coaching/marketplace
- `level` - beginner/intermediate/advanced
- `format` - live/hybrid/recorded
- `schedule_date`, `schedule_time` - When it runs
- `capacity_total`, `capacity_remaining` - Seats
- `price_amount`, `price_early_bird` - Pricing
- `outcomes` (TEXT[]) - Learning outcomes
- `tags` (TEXT[]) - Topic tags
- `status` - draft/published/archived/cancelled
- `is_featured` - Highlight on homepage

**Indexes:**
- Composite: `(pillar, level)` for filtering
- GIN: `tags`, `outcomes` for array search
- Full-text: `title || description` for search

---

#### **workshop_registrations**
User enrollment and completion tracking.

**Key Fields:**
- `workshop_id`, `user_id` (Composite PK)
- `status` - registered/completed/cancelled/no_show
- `price_paid` - Amount charged
- `payment_id` - References payments
- `attended` - Attendance flag
- `completed_at` - Completion timestamp
- `certificate_id` - Award reference
- `rating`, `review` - Feedback

**Business Logic:**
- Trigger: Auto-decrements `workshop.capacity_remaining` on INSERT
- Trigger: Auto-increments capacity on cancellation
- Constraint: Unique (workshop_id, user_id) - no duplicate enrollments

---

### 3. Assessments

#### **assessments**
Adaptability transformation assessments.

**Key Fields:**
- `user_id` - Who took it
- `organization_id` - Org context (optional)
- `assessment_type` - full/quick/follow_up
- `status` - in_progress/completed/abandoned
- **Dimension Scores (0-100):**
  - `individual_score` - Personal readiness
  - `leadership_score` - Leader capability
  - `cultural_score` - Org culture
  - `embedding_score` - Behavior sustainability
  - `velocity_score` - Speed of change
- `overall_score` - Computed average (GENERATED column)
- `results` (JSONB) - Detailed analysis
- `recommendations` (JSONB) - Suggested actions

---

#### **assessment_answers**
Individual question responses.

**Key Fields:**
- `assessment_id` - Parent assessment
- `question_id` - Question identifier
- `dimension` - Which dimension (individual/leadership/etc)
- `answer_type` - scale/multiChoice/fearToConfidence/text
- `answer_value` (0-100) - Numeric response
- `question_weight` - Scoring weight

**Business Logic:**
- Trigger: Auto-calculates dimension scores when answers change
- Weighted averaging based on `question_weight`
- Updates parent `assessments` table dimension scores

---

### 4. Talent Marketplace

#### **talent_profiles**
Expert consultant profiles.

**Key Fields:**
- `user_id` (UNIQUE) - One profile per user
- `tagline`, `bio` - Marketing content
- `expertise` (TEXT[]) - Skills
- **Adaptability Impact Metrics:**
  - `transformation_success_rate` (0-100)
  - `behavior_change_score` (0-100)
  - `client_retention_rate` (0-100)
  - `cultures_transformed` - Count
- `years_experience` - Industry tenure
- `industries` (TEXT[]) - Specializations
- `transformation_stages` (TEXT[]) - assess/reframe/embed/scale
- `coaching_style` - directive/facilitative/hybrid
- `rating` (0-5) - Average client rating
- `review_count` - Number of reviews
- `availability` - available/limited/booked
- `hourly_rate` - Consulting fee
- `is_public` - Visible in marketplace

---

#### **talent_testimonials**
Client endorsements for experts.

**Key Fields:**
- `talent_profile_id` - Expert profile
- `client_name`, `client_company` - Attribution
- `quote` - Testimonial text
- `metric` - Quantified result (e.g., "78% adoption")
- `verified` - Verification status
- `is_featured` - Highlight on profile

---

#### **engagements**
Client-expert consulting relationships.

**Key Fields:**
- `client_id`, `expert_id` - Parties
- `organization_id` - Company context
- `focus_area` - Engagement goal
- `hours_total`, `hours_used` - Time budget
- `hourly_rate` - Billing rate
- `status` - pending/active/paused/completed/cancelled
- `deliverables` (JSONB) - Expected outputs
- `milestones` (JSONB) - Progress tracking
- `client_satisfaction_score` (1-5) - Rating

**Business Logic:**
- Trigger: Updates expert `rating` when `client_satisfaction_score` is added
- Constraint: `hours_used <= hours_total`

---

#### **engagement_sessions**
Individual coaching/consulting sessions.

**Key Fields:**
- `engagement_id` - Parent engagement
- `session_type` - coaching/workshop/consultation/follow_up
- `scheduled_at`, `started_at`, `ended_at` - Timing
- `duration_hours` - Billable time
- `session_notes` - Documentation
- `action_items` (JSONB) - Next steps
- `status` - scheduled/completed/cancelled/no_show

**Business Logic:**
- Trigger: Auto-updates `engagement.hours_used` when session completes

---

### 5. Transactions & Credentials

#### **payments**
Payment transaction records.

**Key Fields:**
- `user_id` - Payer
- `organization_id` - Org context (optional)
- `amount`, `currency` - Transaction value
- `provider` - stripe/paypal/manual
- `transaction_id` - External reference
- `status` - pending/succeeded/failed/refunded
- `payment_type` - workshop/engagement/subscription/other
- `related_entity_id` - Link to workshop/engagement
- `invoice_number`, `invoice_url` - Receipts
- `refund_amount`, `refunded_at` - Refund tracking

---

#### **certificates**
Completion certificates and credentials.

**Key Fields:**
- `user_id` - Recipient
- `certificate_type` - workshop/program/assessment
- `workshop_id`, `assessment_id` - Source
- `certificate_number` - Unique identifier (auto-generated)
- `issue_date`, `expiry_date` - Validity period
- `skills_demonstrated` (TEXT[]) - Competencies
- `certificate_url` - PDF/image URL
- `verification_url` - Public verification link
- `issued_by` - Instructor/admin
- `is_verified` - Authenticity flag

**Business Logic:**
- Trigger: Auto-generates `certificate_number` on INSERT
- Format: `CERT-{TYPE}-{DATE}-{UUID}`

---

#### **reviews**
User feedback on workshops/experts/engagements.

**Key Fields:**
- `user_id` - Reviewer
- `review_type` - workshop/expert/engagement
- `workshop_id`, `expert_id`, `engagement_id` - Target
- `rating` (1-5) - Overall rating
- `review_text` - Written feedback
- **Detailed Ratings (1-5, optional):**
  - `content_quality_rating`
  - `delivery_rating`
  - `value_rating`
  - `impact_rating`
- `verified_purchase` - Confirmed enrollment
- `status` - pending/approved/rejected/flagged
- `helpful_count`, `not_helpful_count` - Community voting
- `response_text`, `response_by` - Expert/instructor response

**Business Logic:**
- Trigger: Updates workshop/expert average rating on approval
- Constraint: Only one of workshop_id/expert_id/engagement_id can be set

---

## Relationships

### One-to-Many
- **users → workshops** (as instructor)
- **users → assessments**
- **users → workshop_registrations**
- **organizations → users** (via user_roles)
- **workshops → workshop_registrations**
- **assessments → assessment_answers**
- **talent_profiles → talent_testimonials**
- **engagements → engagement_sessions**

### One-to-One
- **users ↔ talent_profiles** (optional, only for experts)

### Many-to-Many
- **users ↔ workshops** (via workshop_registrations)
- **users ↔ organizations** (via user_roles)

---

## Security Model

### Row Level Security (RLS)

All tables have RLS enabled with policies:

#### **Read Policies**
- **users**: Users see own profile; admins see all
- **workshops**: Public sees published; instructors see own
- **assessments**: Users see own; org admins see org's
- **talent_profiles**: Public sees `is_public=true`
- **engagements**: Parties (client/expert) see their engagements
- **payments**: Users see own; org members see org's
- **certificates**: Users see own; anyone can verify
- **reviews**: Everyone sees approved; users see own

#### **Write Policies**
- **workshops**: Instructors create/update own; admins manage all
- **assessments**: Users create/update own in_progress assessments
- **talent_profiles**: Experts create/update own profile
- **engagements**: Clients create; both parties update
- **reviews**: Users create for verified purchases; experts respond

#### **Admin Override**
All tables have admin policy: Users with `role='admin'` can perform all operations.

### Helper Functions

```sql
-- Check if user has role
has_role(p_user_id UUID, p_role TEXT) → BOOLEAN

-- Get user's active roles
get_user_roles(p_user_id UUID) → TABLE(role TEXT, organization_id UUID)
```

---

## Performance Optimizations

### Indexes

#### **Single Column Indexes**
- Foreign keys: `user_id`, `workshop_id`, `assessment_id`, etc.
- Status fields: `status`, `availability`, `subscription_tier`
- Unique fields: `email`, `slug`, `certificate_number`

#### **Composite Indexes**
- `workshops(pillar, level)` - Filter by category
- `assessments(user_id, completed_at DESC)` - User history
- `workshop_registrations(user_id, status)` - User enrollments
- `engagements(client_id, status)` - Active engagements

#### **GIN Indexes (Arrays & JSONB)**
- `workshops.tags`, `workshops.outcomes`
- `talent_profiles.expertise`, `talent_profiles.industries`
- `assessments.results`, `assessments.recommendations`
- `payments.metadata`, `engagements.deliverables`

#### **Full-Text Search**
```sql
-- Workshops
CREATE INDEX idx_workshops_search ON workshops
  USING GIN(to_tsvector('english', title || ' ' || description));

-- Reviews
CREATE INDEX idx_reviews_search ON reviews
  USING GIN(to_tsvector('english', COALESCE(title, '') || ' ' || review_text));
```

### Computed Columns

```sql
-- Assessments: overall_score
overall_score INTEGER GENERATED ALWAYS AS (
  (individual_score + leadership_score + cultural_score +
   embedding_score + velocity_score) / 5
) STORED;
```

---

## Usage Examples

### Query: Get Available Workshops by Pillar

```sql
SELECT
  w.*,
  u.full_name AS instructor_name,
  COUNT(wr.id) AS registrations
FROM workshops w
JOIN users u ON w.instructor_id = u.id
LEFT JOIN workshop_registrations wr ON w.id = wr.workshop_id
WHERE w.status = 'published'
  AND w.pillar = 'adaptability'
  AND w.capacity_remaining > 0
GROUP BY w.id, u.full_name
ORDER BY w.is_featured DESC, w.schedule_date ASC
LIMIT 10;
```

### Query: User's Assessment History

```sql
SELECT
  a.id,
  a.overall_score,
  a.individual_score,
  a.leadership_score,
  a.cultural_score,
  a.embedding_score,
  a.velocity_score,
  a.completed_at
FROM assessments a
WHERE a.user_id = 'user-uuid'
  AND a.status = 'completed'
ORDER BY a.completed_at DESC;
```

### Query: Search Talent by Expertise

```sql
SELECT
  tp.*,
  u.full_name,
  u.avatar_url
FROM talent_profiles tp
JOIN users u ON tp.user_id = u.id
WHERE tp.is_public = true
  AND tp.accepting_clients = true
  AND tp.expertise && ARRAY['AI Adoption', 'Change Management']
  AND tp.rating >= 4.5
ORDER BY tp.rating DESC, tp.review_count DESC
LIMIT 20;
```

### Query: Organization Adaptability Trend

```sql
SELECT * FROM get_org_adaptability_trend(
  'org-uuid',
  6 -- months
);
```

Returns:
```
month       | avg_overall | avg_individual | avg_leadership | ...
------------|-------------|----------------|----------------|----
2025-10-01  | 72.5        | 75.0           | 68.0           | ...
2025-09-01  | 68.2        | 70.5           | 65.0           | ...
...
```

---

## Migration Strategy

### Running Migrations

```bash
# Apply all migrations in order
psql $DATABASE_URL -f supabase/migrations/001_create_users_and_roles.sql
psql $DATABASE_URL -f supabase/migrations/002_create_workshops.sql
psql $DATABASE_URL -f supabase/migrations/003_create_assessments.sql
psql $DATABASE_URL -f supabase/migrations/004_create_talent_and_engagements.sql
psql $DATABASE_URL -f supabase/migrations/005_create_payments_certificates_reviews.sql

# Or use Supabase CLI
supabase db push
```

### Rollback

Each migration file includes rollback SQL at the bottom (commented out).

To rollback:
```sql
-- Uncomment and run rollback section from migration file
-- DROP TABLE IF EXISTS ...
```

---

## TypeScript Integration

### Supabase Client Setup

```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from './types/database.types'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### Type-Safe Queries

```typescript
// Get workshops
const { data: workshops } = await supabase
  .from('workshops')
  .select('*, instructor:users(full_name)')
  .eq('status', 'published')
  .eq('pillar', 'adaptability')
  .order('schedule_date', { ascending: true })

// Get user assessments
const { data: assessments } = await supabase
  .from('assessments')
  .select('*')
  .eq('user_id', userId)
  .eq('status', 'completed')
  .order('completed_at', { ascending: false })

// Search talent
const { data: talent } = await supabase
  .rpc('search_talent', {
    p_expertise: ['AI Adoption'],
    p_min_rating: 4.5,
    p_limit: 20
  })
```

---

## Best Practices

### Data Integrity
1. **Always use foreign keys** with appropriate CASCADE/RESTRICT
2. **Add CHECK constraints** for business rules (e.g., capacity_remaining <= capacity_total)
3. **Use JSONB for flexible data** but validate structure in application
4. **Generated columns** for derived data (e.g., overall_score)

### Security
1. **Enable RLS on all tables**
2. **One policy per operation** (SELECT, INSERT, UPDATE, DELETE)
3. **Use security definer functions** for admin operations
4. **Never expose sensitive data** through public policies

### Performance
1. **Index foreign keys** and frequently queried columns
2. **Composite indexes** for multi-column filters
3. **GIN indexes** for array/JSONB search
4. **Partial indexes** for filtered queries (e.g., WHERE status = 'published')
5. **Full-text search** for text-heavy columns

### Scalability
1. **Use UUIDs** for primary keys (distributed systems)
2. **Partition large tables** by date if needed (e.g., payments by created_at)
3. **Archive old data** (e.g., completed assessments > 1 year)
4. **Monitor query performance** with pg_stat_statements

---

## Support

For questions or issues:
- Schema Documentation: `/supabase/SCHEMA.md`
- Migration Files: `/supabase/migrations/`
- TypeScript Types: `/supabase/types/database.types.ts`
- Seed Data: `/supabase/seed.sql`
