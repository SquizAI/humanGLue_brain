# HumanGlue Platform - Entity Relationship Diagram

## Visual ERD

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          SUPABASE AUTH & USER MANAGEMENT                        │
└─────────────────────────────────────────────────────────────────────────────────┘

                         ┌──────────────────────┐
                         │    auth.users        │  (Supabase Auth)
                         │──────────────────────│
                         │ id (PK)              │
                         │ email                │
                         │ encrypted_password   │
                         │ email_confirmed_at   │
                         └──────────┬───────────┘
                                   │
                         ┌─────────┴────────┐
                         │                  │
              ┌──────────▼──────────┐  ┌───▼────────────────┐
              │      users          │  │   user_roles       │
              │─────────────────────│  │────────────────────│
              │ id (PK, FK)         │  │ id (PK)            │
              │ email               │  │ user_id (FK)       │
              │ full_name           │  │ role (ENUM)        │
              │ avatar_url          │  │ organization_id    │
              │ company_name        │  │ granted_by         │
              │ job_title           │  │ expires_at         │
              │ metadata (JSONB)    │  └────────────────────┘
              │ status              │         │
              │ created_at          │         │
              │ updated_at          │         │
              └──────────┬──────────┘         │
                        │                     │
                        │           ┌─────────▼──────────┐
                        │           │  organizations     │
                        │           │────────────────────│
                        │           │ id (PK)            │
                        │           │ name               │
                        │           │ slug (UNIQUE)      │
                        │           │ subscription_tier  │
                        │           │ company_size       │
                        │           │ settings (JSONB)   │
                        │           │ created_at         │
                        │           └────────────────────┘
                        │
        ┌───────────────┼───────────────┬──────────────┬────────────┐
        │               │               │              │            │
        │               │               │              │            │

┌───────▼────────┐  ┌──▼─────────┐  ┌─▼──────────┐  ┌▼─────────┐  ┌▼──────────┐
│   workshops    │  │assessments │  │   talent   │  │engagements│  │ payments  │
│────────────────│  │────────────│  │  profiles  │  │───────────│  │───────────│
│ id (PK)        │  │ id (PK)    │  │ id (PK)    │  │ id (PK)   │  │ id (PK)   │
│ title          │  │ user_id    │  │ user_id    │  │ client_id │  │ user_id   │
│ instructor_id  │  │ org_id     │  │ (FK, UNQ)  │  │ expert_id │  │ amount    │
│ pillar         │  │ type       │  │ tagline    │  │ org_id    │  │ status    │
│ level          │  │ status     │  │ bio        │  │ title     │  │ type      │
│ format         │  │ individual │  │ expertise  │  │ hours     │  │ entity_id │
│ schedule       │  │ leadership │  │ metrics    │  │ status    │  │ invoice   │
│ capacity       │  │ cultural   │  │ rating     │  │ dates     │  │ metadata  │
│ price          │  │ embedding  │  │ hourly_rate│  │ outcomes  │  └───────────┘
│ outcomes[]     │  │ velocity   │  │ avail      │  │ metadata  │
│ tags[]         │  │ overall    │  │ is_public  │  └─────┬─────┘
│ status         │  │ (computed) │  │ metadata   │        │
│ is_featured    │  │ results    │  └────┬───────┘        │
│ metadata       │  │ (JSONB)    │       │                │
└────┬───────────┘  └─────┬──────┘       │                │
     │                    │               │                │
     │                    │               │                │
┌────▼──────────┐  ┌──────▼──────┐  ┌────▼────────┐  ┌───▼────────┐
│  workshop_    │  │ assessment_ │  │   talent_   │  │engagement_ │
│registrations  │  │   answers   │  │testimonials │  │  sessions  │
│───────────────│  │─────────────│  │─────────────│  │────────────│
│ id (PK)       │  │ id (PK)     │  │ id (PK)     │  │ id (PK)    │
│ workshop_id   │  │ assess_id   │  │ profile_id  │  │ engage_id  │
│ user_id       │  │ question_id │  │ client_name │  │ title      │
│ status        │  │ dimension   │  │ company     │  │ type       │
│ price_paid    │  │ answer_val  │  │ quote       │  │ scheduled  │
│ payment_id    │  │ answer_text │  │ metric      │  │ started    │
│ attended      │  │ weight      │  │ verified    │  │ ended      │
│ completed_at  │  │ answered_at │  │ featured    │  │ duration   │
│ certificate   │  └─────────────┘  └─────────────┘  │ notes      │
│ rating        │                                     │ action[]   │
│ review        │                                     │ status     │
│ metadata      │                                     └────────────┘
└───────────────┘


┌─────────────────────────────────────────────────────────────────────────────────┐
│                      CREDENTIALS, REVIEWS & TRANSACTIONS                        │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│  certificates    │         │     reviews      │
│──────────────────│         │──────────────────│
│ id (PK)          │         │ id (PK)          │
│ user_id (FK)     │         │ user_id (FK)     │
│ type             │         │ review_type      │
│ title            │         │ workshop_id (FK) │
│ workshop_id (FK) │         │ expert_id (FK)   │
│ assessment_id    │         │ engagement_id    │
│ cert_number      │         │ rating (1-5)     │
│ (auto-generated) │         │ title            │
│ issue_date       │         │ review_text      │
│ expiry_date      │         │ detailed_ratings │
│ skills[]         │         │ verified         │
│ competencies     │         │ status           │
│ certificate_url  │         │ helpful_count    │
│ verified         │         │ response_text    │
│ issued_by        │         │ response_by      │
│ metadata         │         │ metadata         │
└──────────────────┘         └──────────────────┘
```

---

## Table Relationships Summary

### Primary Relationships

| Parent Table | Child Table | Relationship | Foreign Key | Notes |
|--------------|-------------|--------------|-------------|-------|
| auth.users | users | 1:1 | users.id | Extends Supabase Auth |
| users | user_roles | 1:N | user_roles.user_id | RBAC system |
| organizations | user_roles | 1:N | user_roles.organization_id | Org membership |
| users | workshops | 1:N | workshops.instructor_id | As instructor |
| users | assessments | 1:N | assessments.user_id | User assessments |
| users | talent_profiles | 1:1 | talent_profiles.user_id | Expert profiles |
| users | engagements | 1:N | engagements.client_id | As client |
| users | engagements | 1:N | engagements.expert_id | As expert |
| workshops | workshop_registrations | 1:N | workshop_registrations.workshop_id | Enrollments |
| users | workshop_registrations | 1:N | workshop_registrations.user_id | User enrollments |
| assessments | assessment_answers | 1:N | assessment_answers.assessment_id | Question responses |
| talent_profiles | talent_testimonials | 1:N | talent_testimonials.talent_profile_id | Client testimonials |
| engagements | engagement_sessions | 1:N | engagement_sessions.engagement_id | Sessions |
| users | payments | 1:N | payments.user_id | Payment records |
| users | certificates | 1:N | certificates.user_id | Earned certificates |
| users | reviews | 1:N | reviews.user_id | Authored reviews |
| workshops | reviews | 1:N | reviews.workshop_id | Workshop reviews |

### Cardinality

```
users ──────< user_roles >────── organizations
  │
  ├──< workshops (as instructor)
  │     └──< workshop_registrations >──┐
  │                                     │
  ├──< assessments                      │
  │     └──< assessment_answers         │
  │                                     │
  ├──○ talent_profiles (1:1)            │
  │     └──< talent_testimonials        │
  │                                     │
  ├──< engagements (as client)          │
  │                                     │
  ├──< engagements (as expert)          │
  │     └──< engagement_sessions        │
  │                                     │
  ├──< payments ────────────────────────┘
  │
  ├──< certificates
  │
  └──< reviews

Legend:
──< : One to Many
──○ : One to One (optional)
>── : Many to One
```

---

## Data Flow Diagrams

### Workshop Registration Flow

```
User                    Workshop               Payment
  │                        │                      │
  ├─ Browse Workshops ────>│                      │
  │<─ Available Workshops ─┤                      │
  │                        │                      │
  ├─ Register ────────────>│                      │
  │                        ├─ Check Capacity      │
  │                        ├─ Decrement (Trigger) │
  │                        │                      │
  ├─ Process Payment ──────┼─────────────────────>│
  │                        │<─ Payment Success ───┤
  │                        │                      │
  │<─ Registration Conf. ──┤                      │
  │                        │                      │
  ├─ Attend Workshop ─────>│                      │
  │                        ├─ Mark Attended       │
  │                        │                      │
  ├─ Complete ────────────>│                      │
  │                        ├─ Issue Certificate   │
  │<─ Certificate ─────────┤                      │
  │                        │                      │
  ├─ Submit Review ───────>│                      │
  │                        ├─ Update Rating       │
  │<─ Review Posted ───────┤                      │
```

### Assessment Flow

```
User                    Assessment            Answers
  │                        │                     │
  ├─ Start Assessment ────>│                     │
  │                        ├─ Create (in_prog)   │
  │<─ Questions ───────────┤                     │
  │                        │                     │
  ├─ Submit Answer 1 ──────┼────────────────────>│
  │                        │<─ Save ─────────────┤
  │                        │<─ Calc Score (Trig) ┤
  │                        ├─ Update Dimension   │
  │                        │                     │
  ├─ Submit Answer 2 ──────┼────────────────────>│
  │                        │<─ Save ─────────────┤
  │                        │<─ Calc Score (Trig) ┤
  │                        ├─ Update Dimension   │
  │                        │                     │
  ├─ ... (all answers)     │                     │
  │                        │                     │
  ├─ Complete ────────────>│                     │
  │                        ├─ Status = completed │
  │                        ├─ Calc Overall Score │
  │                        ├─ Generate Results   │
  │<─ Results ─────────────┤                     │
```

### Expert Engagement Flow

```
Client              Expert             Engagement        Session
  │                    │                   │               │
  ├─ Search Talent ────┤                   │               │
  │<─ Expert List ─────┤                   │               │
  │                    │                   │               │
  ├─ Request Engage ───┼──────────────────>│               │
  │                    │<─ Notify ─────────┤               │
  │                    │                   │               │
  │                    ├─ Accept ──────────>│               │
  │<─ Engagement Start ┼───────────────────┤               │
  │                    │                   │               │
  ├─ Schedule Session ─┼───────────────────┼──────────────>│
  │                    │<─ Scheduled ──────┼───────────────┤
  │                    │                   │               │
  │  ... Session 1 ... │                   │               │
  │                    │                   │               ├─ Complete
  │                    │                   │<─ Update Hours┤
  │                    │                   │               │
  │  ... Session N ... │                   │               │
  │                    │                   │               │
  ├─ Mark Complete ────┼───────────────────>│               │
  │                    │                   ├─ Status = done│
  │                    │                   │               │
  ├─ Rate Expert ──────┼───────────────────>│               │
  │                    │<─ Update Rating ───┤               │
```

---

## Index Strategy

### Foreign Key Indexes (All Tables)
```sql
CREATE INDEX idx_{table}_{fk_column} ON {table}({fk_column});
```

### Status & Enum Indexes
```sql
CREATE INDEX idx_{table}_status ON {table}(status);
CREATE INDEX idx_workshops_pillar ON workshops(pillar);
CREATE INDEX idx_workshops_level ON workshops(level);
```

### Composite Indexes (Common Queries)
```sql
CREATE INDEX idx_workshops_pillar_level ON workshops(pillar, level);
CREATE INDEX idx_assessments_user_completed ON assessments(user_id, completed_at DESC);
CREATE INDEX idx_registrations_user_status ON workshop_registrations(user_id, status);
```

### Array & JSONB Indexes (GIN)
```sql
CREATE INDEX idx_workshops_tags ON workshops USING GIN(tags);
CREATE INDEX idx_workshops_outcomes ON workshops USING GIN(outcomes);
CREATE INDEX idx_talent_expertise ON talent_profiles USING GIN(expertise);
CREATE INDEX idx_assessments_results ON assessments USING GIN(results);
```

### Full-Text Search (GIN)
```sql
CREATE INDEX idx_workshops_search ON workshops
  USING GIN(to_tsvector('english', title || ' ' || description));
```

### Partial Indexes (Filtered)
```sql
CREATE INDEX idx_workshops_available ON workshops(id)
  WHERE capacity_remaining > 0;

CREATE INDEX idx_workshops_published ON workshops(status, published_at)
  WHERE status = 'published';
```

---

## Constraint Summary

### CHECK Constraints

| Table | Constraint | Rule |
|-------|------------|------|
| workshops | check_early_bird_price | price_early_bird < price_amount |
| workshops | check_capacity_valid | capacity_remaining <= capacity_total |
| assessments | score ranges | All scores 0-100 |
| talent_profiles | rating range | rating 0-5 |
| engagements | check_hours_valid | hours_used <= hours_total |
| engagements | check_dates_valid | end_date >= start_date |
| reviews | rating range | rating 1-5 |
| reviews | check_review_target | Only one target set |

### UNIQUE Constraints

| Table | Columns | Purpose |
|-------|---------|---------|
| users | email | One account per email |
| organizations | slug | Unique URL identifier |
| user_roles | (user_id, role, organization_id) | No duplicate role grants |
| workshops | slug | Unique workshop URLs |
| workshop_registrations | (workshop_id, user_id) | No duplicate enrollments |
| talent_profiles | user_id | One profile per expert |
| assessment_answers | (assessment_id, question_id) | One answer per question |
| certificates | certificate_number | Unique cert IDs |
| payments | transaction_id | Unique payment refs |

### Foreign Key CASCADE Rules

| Relationship | ON DELETE |
|--------------|-----------|
| users → workshops | RESTRICT (keep workshops) |
| workshops → registrations | CASCADE (delete registrations) |
| users → assessments | CASCADE (delete assessments) |
| assessments → answers | CASCADE (delete answers) |
| users → talent_profiles | CASCADE (delete profile) |
| engagements → sessions | CASCADE (delete sessions) |
| organizations → user_roles | CASCADE (remove org membership) |

---

## Trigger Summary

### Auto-Update Triggers

| Trigger | Table | Action |
|---------|-------|--------|
| update_{table}_updated_at | All tables | Sets updated_at = now() |

### Business Logic Triggers

| Trigger | Table | Purpose |
|---------|-------|---------|
| decrement_capacity | workshop_registrations | Auto-decrement workshop capacity |
| increment_capacity | workshop_registrations | Auto-increment on cancellation |
| calculate_dimension_score | assessment_answers | Update assessment scores |
| update_engagement_hours | engagement_sessions | Track billable hours |
| update_talent_rating | engagements | Update expert rating |
| update_workshop_rating | reviews | Update workshop rating |
| generate_cert_number | certificates | Auto-generate cert ID |

---

## RLS Policy Summary

### Public Access
- **workshops** (status='published')
- **talent_profiles** (is_public=true)
- **reviews** (status='approved')
- **certificates** (is_verified=true) - for verification

### User Access
- **Own data**: users, assessments, registrations, payments, certificates
- **Role-based**: org members can see org data
- **Engagement parties**: client + expert can see engagement

### Admin Access
- **Full access** to all tables via admin role check

---

## Schema Evolution Guidelines

### Adding Columns
1. Add column with DEFAULT or NULL
2. Backfill data if needed
3. Add NOT NULL constraint if required
4. Update TypeScript types
5. Update RLS policies if needed

### Adding Tables
1. Create migration file
2. Add foreign keys and indexes
3. Enable RLS
4. Create policies
5. Add to ERD
6. Update TypeScript types

### Deprecating Fields
1. Stop using in application
2. Add comment: "DEPRECATED: Use {new_field}"
3. Remove in future migration
4. Never drop columns with data without backup

### Breaking Changes
1. Create new migration
2. Add new structure alongside old
3. Migrate data
4. Update application
5. Remove old structure in separate migration
