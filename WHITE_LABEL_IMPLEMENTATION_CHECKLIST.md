# White-Label Implementation Checklist

> Step-by-step guide for implementing each phase of white-label functionality

---

## ✅ Phase 1: Backend Infrastructure (COMPLETED)

### Service Layer
- [x] Create `services/branding.ts`
- [x] Implement `getOrgBranding(orgId)` with fallback
- [x] Implement `updateOrgBranding(orgId, branding)`
- [x] Implement `validateBranding(branding)`
- [x] Implement `hasCustomBranding(orgId)`
- [x] Add TypeScript interfaces for `OrgBranding`
- [x] Add deep merge logic for partial updates
- [x] Add validation for emails, colors, URLs

### API Routes
- [x] Create `app/api/organizations/[id]/branding/route.ts`
- [x] Implement `GET /api/organizations/:id/branding`
- [x] Implement `POST /api/organizations/:id/branding`
- [x] Implement `PATCH /api/organizations/:id/branding`
- [x] Add authorization checks (org member, admin)
- [x] Add validation error responses
- [x] Add RLS policy verification
- [x] Test with Postman/curl

### Testing
- [x] Unit tests for branding service
- [x] API integration tests
- [x] Test fallback to defaults
- [x] Test partial updates (deep merge)
- [x] Test validation errors
- [x] Test authorization (member, org_admin, admin)

---

## ✅ Phase 2: Email & PDF White-Labeling (COMPLETED)

### Email Functions
- [x] Update `send-assessment-email.ts`
- [x] Update `send-email.ts`
- [x] Update `send-profile-email.ts`
- [x] Add `getOrgBranding()` to each function
- [x] Update email templates with dynamic colors
- [x] Update sender name and email
- [x] Update footer text and support links
- [x] Add `organizationId` parameter validation

### PDF Generation
- [x] Update `generate-assessment-pdf.ts`
- [x] Add `getOrgBranding()` function
- [x] Update PDF styles with dynamic colors
- [x] Add company name to header
- [x] Add tagline support
- [x] Update footer with org info
- [x] Add branded filename generation

### Testing
- [x] Send test emails to Gmail, Outlook, Apple Mail
- [x] Verify colors render correctly
- [x] Check sender name/email
- [x] Verify footer text and links
- [x] Generate test PDFs
- [x] Verify PDF colors and styling
- [x] Check PDF filename format

---

## ✅ Phase 3: Frontend Branding (COMPLETED)

### React Context
- [x] Create `lib/contexts/BrandingContext.tsx`
- [x] Implement `BrandingProvider`
- [x] Create `useBranding()` hook
- [x] Create `useOrgBranding(orgId)` auto-loading hook
- [x] Add caching logic (prevent redundant calls)
- [x] Add loading state
- [x] Add error handling
- [x] Add fallback to defaults

### Admin UI Component
- [x] Create `components/admin/BrandingSettings.tsx`
- [x] Add color picker with hex input
- [x] Add logo URL input
- [x] Add email configuration fields
- [x] Add social links inputs
- [x] Add live preview section
- [x] Add validation (client-side)
- [x] Add save functionality
- [x] Add success/error feedback
- [x] Make responsive (mobile/tablet/desktop)

### Admin Page
- [x] Create `app/admin/organizations/[id]/branding/page.tsx`
- [x] Wrap with `BrandingProvider`
- [x] Add auth check (admin only)
- [x] Add back navigation
- [x] Test with real organization data

### Testing
- [x] Test context loading
- [x] Test auto-loading hook
- [x] Test caching behavior
- [x] Test admin UI rendering
- [x] Test color picker
- [x] Test validation
- [x] Test save success
- [x] Test responsive layout

---

## ✅ Phase 4: Platform UI White-Labeling (COMPLETE)

### Layout Integration
- [x] Modified `components/Providers.tsx` with `BrandingProvider`
- [x] Created `components/BrandingInjector.tsx` for auto-loading
- [x] Auto-loads branding on user login (zero configuration)
- [x] Fallback to HumanGlue defaults built-in

### Dynamic Metadata
- [x] Dynamic favicon updates via `BrandingInjector`
- [x] Dynamic page title updates with organization name
- [x] Automatic updates without page reload
- [x] Works in all modern browsers

### CSS Variables
- [x] Created `lib/hooks/useBrandingStyles.ts`
- [x] Injected CSS variables to `:root`:
  - [x] `--color-primary`, `--color-secondary`, `--color-accent`
  - [x] RGB variants for transparency support
- [x] Updated `tailwind.config.ts`:
  - [x] Added `org-primary`, `org-secondary`, `org-accent` colors
  - [x] Works with all Tailwind utilities (hover, opacity, etc.)
- [x] Created comprehensive [Platform UI Guide](WHITE_LABEL_PLATFORM_UI_GUIDE.md)
- [x] Real-time color updates when branding changes
- [x] Verified fallback colors work

### Documentation
- [x] Created [WHITE_LABEL_PLATFORM_UI_GUIDE.md](WHITE_LABEL_PLATFORM_UI_GUIDE.md)
  - [x] Usage examples with Tailwind classes
  - [x] CSS variable reference
  - [x] Real-world component examples
  - [x] Migration guide
  - [x] Best practices
  - [x] Troubleshooting guide

### Testing
- [x] Auto-loading works on user login
- [x] Dynamic colors apply throughout app
- [x] Favicon updates dynamically
- [x] Page titles update with org name
- [x] Fallbacks work when branding not configured
- [x] Performance: minimal overhead (<100ms)

**Actual Time:** ~3.5 hours (vs. estimated 6-9 hours)

**Key Features:**
- Zero configuration auto-loading
- Simple Tailwind classes (`bg-org-primary`, etc.)
- Real-time updates
- Comprehensive developer guide

---

## ✅ Phase 5: Custom Domain Support (COMPLETE)

### Database Schema
- [x] Add `custom_domain` column to `organizations`
  - Created [migration 012](supabase/migrations/012_add_custom_domain_to_organizations.sql)
  - Added UNIQUE constraint
  - Added index for fast lookups
  - Added column comments
- [x] Add service functions for domain management
  - `getOrgByDomain(domain)` - Lookup org by domain
  - `updateCustomDomain(orgId, domain)` - Save custom domain
  - Domain normalization (remove protocol, www, trailing slash)
  - Domain format validation (regex)
- [x] Test uniqueness constraint (handled in migration)

### Middleware
- [x] Modified [middleware.ts](middleware.ts)
- [x] Detect domain from `request.headers.get('host')`
- [x] Query organization by `custom_domain` using `getOrgByDomain()`
- [x] Inject `x-organization-id` header when org found
- [x] Added logging for domain detection
- [x] Gracefully handle domain not found (returns null)

### API Routes
- [x] Created [app/api/domain-org/route.ts](app/api/domain-org/route.ts)
  - GET - Returns organizationId for current domain
- [x] Created [app/api/organizations/[id]/domain/route.ts](app/api/organizations/[id]/domain/route.ts)
  - GET - Fetch organization's custom domain
  - POST - Update organization's custom domain
  - Error handling for duplicates, validation, permissions

### Auto-Load Branding
- [x] Modified [BrandingInjector](components/BrandingInjector.tsx)
- [x] Check for custom domain organization on mount
- [x] Auto-load branding from domain (priority over user org)
- [x] Fallback to user organization if no domain org found
- [x] Added state management for domain check

### Admin UI
- [x] Added "Custom Domain" tab to [BrandingSettings](components/admin/BrandingSettings.tsx)
- [x] Domain input field with validation
- [x] Save button with loading states
- [x] Success/error feedback messages
- [x] DNS setup instructions with CNAME details
- [x] Integrated with domain API routes

### DNS Configuration
- [x] Documented DNS setup in admin UI
- [x] Added CNAME record instructions (point to hmnglue.com)
- [x] Added propagation time estimate (5-30 minutes)
- [x] Added SSL certificate note (auto-provisioned)
- [x] Added step-by-step setup guide

**Actual Time:** ~4 hours (vs. estimated 5-7 hours)

**Key Features:**
- Automatic organization detection from domain
- Zero-configuration auto-loading of branding
- Admin UI for easy domain management
- Domain normalization and validation
- DNS setup guidance

**Files Created:**
- `supabase/migrations/012_add_custom_domain_to_organizations.sql`
- `app/api/domain-org/route.ts`
- `app/api/organizations/[id]/domain/route.ts`

**Files Modified:**
- `services/branding.ts` - Added domain functions
- `middleware.ts` - Added domain detection
- `components/BrandingInjector.tsx` - Added domain auto-loading
- `components/admin/BrandingSettings.tsx` - Added domain UI

---

## ⏳ Phase 6: Email Template Builder (Optional)

### Database Schema
- [ ] Create `email_templates` table
  ```sql
  CREATE TABLE email_templates (
    id UUID PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id),
    template_type TEXT NOT NULL,
    name TEXT NOT NULL,
    subject_template TEXT,
    html_template TEXT NOT NULL,
    variables JSONB,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
  );
  ```
- [ ] Add indexes

### Template Editor UI
- [ ] Install `react-email` or `@blocknote/core`
- [ ] Create `components/admin/EmailTemplateEditor.tsx`
- [ ] Add WYSIWYG editor
- [ ] Add variable insertion ({{user.name}}, etc.)
- [ ] Add preview pane
- [ ] Add save functionality
- [ ] Add template selector

### Template Rendering
- [ ] Create template rendering service
- [ ] Parse template variables
- [ ] Replace variables with actual data
- [ ] Fallback to default template if custom not found
- [ ] Update email functions to use custom templates

### Testing
- [ ] Test template creation
- [ ] Test variable replacement
- [ ] Test email rendering
- [ ] Test with different email clients
- [ ] Test fallback to defaults

**Estimated Time:** 20-30 hours

---

## ⏳ Phase 7: Multi-Language Support

### Database Schema
- [ ] Add `branding_i18n` column to organizations
  ```sql
  ALTER TABLE organizations ADD COLUMN branding_i18n JSONB DEFAULT '{}'::jsonb;
  ```
- [ ] Design i18n structure (per-locale branding)

### Backend Service
- [ ] Add `getOrgBrandingLocalized(orgId, locale)` function
- [ ] Merge base branding with locale strings
- [ ] Add locale detection from user profile
- [ ] Update email functions to accept `locale` parameter

### Admin UI
- [ ] Add locale selector to branding settings
- [ ] Show fields for each supported locale
- [ ] Add "copy from default" button
- [ ] Add locale preview

### Email Localization
- [ ] Update email templates with i18n strings
- [ ] Add locale-specific subject lines
- [ ] Test with multiple locales (en, es, fr, de)

### Testing
- [ ] Test locale detection
- [ ] Test branding merge logic
- [ ] Test emails in different languages
- [ ] Test fallback to default locale
- [ ] Test admin UI locale switcher

**Estimated Time:** 16-23 hours

---

## ⏳ Phase 8: Branded Analytics Dashboard

### Dashboard Components
- [ ] Create `components/analytics/BrandedChart.tsx`
- [ ] Apply dynamic colors to charts
- [ ] Add org logo to dashboard header
- [ ] Update KPI cards with brand colors

### Branded Exports
- [ ] Add "Export PDF" with org branding
- [ ] Add "Export CSV" with org header
- [ ] Add branded email reports
- [ ] Test export formatting

### Custom KPIs
- [ ] Allow orgs to define custom KPIs
- [ ] Store in `organizations.settings.kpis`
- [ ] Render custom KPIs in dashboard
- [ ] Add admin UI for KPI configuration

### Testing
- [ ] Test chart colors with different brands
- [ ] Test PDF exports
- [ ] Test CSV exports
- [ ] Test email reports
- [ ] Test custom KPIs

**Estimated Time:** 15-20 hours

---

## ⏳ Phase 9: Security & Compliance

### Audit Logging
- [ ] Create `branding_audit_log` table
- [ ] Log all branding changes
- [ ] Store previous and new values
- [ ] Add admin UI to view audit log
- [ ] Add filtering and search
- [ ] Test logging triggers

### Approval Workflow
- [ ] Add `branding_status` field (draft, pending, approved)
- [ ] Create approval UI for super admins
- [ ] Add email notifications for approvals
- [ ] Implement rollback functionality
- [ ] Test approval flow
- [ ] Test rejection flow

### Compliance Features
- [ ] Add GDPR-compliant data export
- [ ] Add data retention policies
- [ ] Add branding deletion (soft delete)
- [ ] Add compliance reports

### Testing
- [ ] Test audit log creation
- [ ] Test approval workflow
- [ ] Test rollback functionality
- [ ] Test compliance exports

**Estimated Time:** 12-16 hours

---

## ⏳ Phase 10: Advanced Asset Management

### Database Schema
- [ ] Create `brand_assets` table
- [ ] Add asset types (logo, icon, template)
- [ ] Add metadata storage
- [ ] Add indexes

### Asset Upload UI
- [ ] Create `components/admin/AssetLibrary.tsx`
- [ ] Add drag-and-drop upload
- [ ] Add asset preview
- [ ] Add metadata editor
- [ ] Add asset organization (folders)
- [ ] Test upload flow

### CDN Integration
- [ ] Choose CDN (Cloudflare, AWS, Netlify)
- [ ] Configure CDN integration
- [ ] Add automatic image optimization
- [ ] Add WebP conversion
- [ ] Add responsive images
- [ ] Test CDN performance

### Asset Management
- [ ] Add asset versioning
- [ ] Add asset search
- [ ] Add asset deletion
- [ ] Add asset usage tracking
- [ ] Test asset lifecycle

### Testing
- [ ] Test asset upload
- [ ] Test CDN delivery
- [ ] Test image optimization
- [ ] Test versioning
- [ ] Performance benchmarks

**Estimated Time:** 16-20 hours

---

## Quick Wins (< 4 hours each)

### Branding Preview in Org List
- [ ] Modify `app/admin/organizations/page.tsx`
- [ ] Add logo thumbnail column
- [ ] Add primary color indicator
- [ ] Add link to branding settings
- [ ] Test rendering

**Estimated Time:** 2 hours

---

### Import/Export Branding
- [ ] Add "Export Branding" button to settings
- [ ] Generate JSON download
- [ ] Add "Import Branding" file upload
- [ ] Parse and validate imported JSON
- [ ] Apply imported branding
- [ ] Test import/export cycle

**Estimated Time:** 3 hours

---

### Default Branding Templates
- [ ] Create `lib/brandingTemplates.ts`
- [ ] Define 5-10 pre-built color schemes
  - Professional Blue
  - Modern Purple
  - Corporate Gray
  - Vibrant Green
  - Tech Orange
- [ ] Add "Apply Template" button in admin UI
- [ ] Test template application

**Estimated Time:** 2 hours

---

### Branding Health Check
- [ ] Create `services/brandingHealthCheck.ts`
- [ ] Check logo URL accessibility
- [ ] Check color contrast ratios
- [ ] Check email deliverability (sender domain)
- [ ] Add health check UI in admin
- [ ] Show warnings and recommendations
- [ ] Test health check logic

**Estimated Time:** 3 hours

---

## Testing Checklist (All Phases)

### Unit Tests
- [ ] Service layer functions
- [ ] Validation logic
- [ ] Template rendering
- [ ] Variable replacement

### Integration Tests
- [ ] API endpoints
- [ ] Database queries
- [ ] Email sending
- [ ] PDF generation

### E2E Tests
- [ ] Admin branding configuration
- [ ] Email sending flow
- [ ] PDF generation flow
- [ ] Frontend branding display

### Cross-Browser
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Email Clients
- [ ] Gmail
- [ ] Outlook
- [ ] Apple Mail
- [ ] Yahoo Mail
- [ ] Mobile clients

### Performance
- [ ] Page load time
- [ ] API response time
- [ ] Email send time
- [ ] PDF generation time

### Security
- [ ] SQL injection tests
- [ ] XSS tests
- [ ] CSRF tests
- [ ] Authorization tests
- [ ] RLS policy tests

### Accessibility
- [ ] Color contrast ratios
- [ ] Screen reader compatibility
- [ ] Keyboard navigation
- [ ] WCAG 2.1 AA compliance

---

## Documentation Checklist

### Technical Docs
- [x] Usage guide ([WHITE_LABEL_USAGE_GUIDE.md](WHITE_LABEL_USAGE_GUIDE.md))
- [x] Summary ([WHITE_LABEL_SUMMARY.md](WHITE_LABEL_SUMMARY.md))
- [x] Roadmap ([WHITE_LABEL_NEXT_STEPS.md](WHITE_LABEL_NEXT_STEPS.md))
- [x] README ([WHITE_LABEL_README.md](WHITE_LABEL_README.md))
- [x] This checklist

### Code Documentation
- [x] Service layer JSDoc comments
- [x] API route documentation
- [x] Component prop types
- [x] TypeScript interfaces

### User Documentation
- [ ] Admin user guide
- [ ] Video tutorials
- [ ] FAQ document
- [ ] Troubleshooting guide

### Developer Documentation
- [ ] Setup instructions
- [ ] API examples
- [ ] Integration guide
- [ ] Migration guide

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Performance benchmarked
- [ ] Security audit completed

### Database Migration
- [ ] Backup current database
- [ ] Run migration scripts
- [ ] Verify data integrity
- [ ] Rollback plan ready

### Deployment
- [ ] Deploy to staging
- [ ] Test on staging
- [ ] Deploy to production
- [ ] Monitor for errors
- [ ] Verify functionality

### Post-Deployment
- [ ] Monitor performance
- [ ] Monitor error logs
- [ ] Check user feedback
- [ ] Address any issues
- [ ] Update status page

---

**Last Updated:** 2025-01-28
**Maintained By:** Development Team
