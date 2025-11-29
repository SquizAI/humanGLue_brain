# White-Label Next Steps & Roadmap

## Current Status: Phase 4 Complete ✅

All core white-label functionality is implemented:
- ✅ Backend branding service & API
- ✅ White-label emails (all templates)
- ✅ White-label PDFs
- ✅ Frontend branding context
- ✅ Admin UI for branding management
- ✅ **Platform UI white-labeling** (Phase 4 - NEW!)
  - ✅ Auto-loading branding on user login
  - ✅ CSS variable injection for dynamic theming
  - ✅ Dynamic favicon updates
  - ✅ Dynamic page title updates
  - ✅ Tailwind color classes (org-primary, org-secondary, org-accent)

---

## Phase 4: Platform UI White-Labeling ✅ COMPLETE

### 4.1 Layout Provider Integration ✅
**Goal:** Apply organization branding to the main application layout

**Status:** COMPLETED
**Actual Effort:** 1 hour

**Files Created/Modified:**
- ✅ `components/Providers.tsx` - Added BrandingProvider and BrandingInjector
- ✅ `components/BrandingInjector.tsx` - Auto-loading component

**Implementation:**
```typescript
// components/Providers.tsx
import { BrandingProvider } from '../lib/contexts/BrandingContext'
import { BrandingInjector } from './BrandingInjector'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      <BillingProvider>
        <BrandingProvider>
          <BrandingInjector /> {/* Auto-loads branding on login */}
          <CartProvider>
            {children}
          </CartProvider>
        </BrandingProvider>
      </BillingProvider>
    </ChatProvider>
  )
}
```

---

### 4.2 Dynamic Favicon & Document Title ✅
**Goal:** Update favicon and page titles based on organization

**Status:** COMPLETED
**Actual Effort:** 30 minutes

**Implementation:**
Handled automatically by `BrandingInjector.tsx`:
- Updates `<link rel="icon">` elements when branding loads
- Replaces "Human Glue" in document title with organization name
- All updates happen dynamically without page reload

---

### 4.3 CSS Variable Injection ✅
**Goal:** Dynamic color themes throughout the app

**Status:** COMPLETED
**Actual Effort:** 2 hours

**Files Created:**
- ✅ `lib/hooks/useBrandingStyles.ts` - CSS variable injection hook
- ✅ `WHITE_LABEL_PLATFORM_UI_GUIDE.md` - Complete developer guide

**Files Modified:**
- ✅ `tailwind.config.ts` - Added dynamic color classes

**Implementation:**
```typescript
// lib/hooks/useBrandingStyles.ts
export function useBrandingStyles() {
  const { branding } = useBranding()

  useEffect(() => {
    if (!branding) return

    const root = document.documentElement
    root.style.setProperty('--color-primary', branding.colors.primary)
    root.style.setProperty('--color-secondary', branding.colors.secondary)
    root.style.setProperty('--color-accent', branding.colors.accent || '#10b981')

    // RGB values for transparency support
    root.style.setProperty('--color-primary-rgb', hexToRgb(branding.colors.primary))
    root.style.setProperty('--color-secondary-rgb', hexToRgb(branding.colors.secondary))
    root.style.setProperty('--color-accent-rgb', hexToRgb(branding.colors.accent || '#10b981'))
  }, [branding])
}
```

**Tailwind config updated:**
```typescript
// tailwind.config.ts
colors: {
  // Dynamic branding colors
  'org-primary': 'var(--color-primary, #3b82f6)',
  'org-secondary': 'var(--color-secondary, #8b5cf6)',
  'org-accent': 'var(--color-accent, #10b981)',
}
```

**Usage in components:**
```tsx
// Use Tailwind classes
<button className="bg-org-primary text-white">Click Me</button>

// Or CSS variables
<div style={{ background: `var(--color-primary)` }}>Content</div>
```

---

### Phase 4 Summary

**Total Actual Effort:** ~3.5 hours (vs. estimated 6-9 hours)

**What Was Completed:**
1. ✅ Automatic branding loading on user login
2. ✅ CSS variable injection for dynamic theming
3. ✅ Dynamic favicon updates
4. ✅ Dynamic document title updates
5. ✅ Tailwind integration with org-primary/secondary/accent classes
6. ✅ RGB color variables for transparency support
7. ✅ Comprehensive developer guide (WHITE_LABEL_PLATFORM_UI_GUIDE.md)

**Key Features:**
- **Zero Configuration:** Developers don't need to manually load branding
- **Automatic Updates:** Colors, favicon, title update when user logs in
- **Easy to Use:** Simple Tailwind classes like `bg-org-primary`
- **Fallback Safe:** Always falls back to HumanGlue defaults
- **Performance:** Cached branding, minimal re-renders

**See:** [WHITE_LABEL_PLATFORM_UI_GUIDE.md](WHITE_LABEL_PLATFORM_UI_GUIDE.md) for complete usage documentation

---

## Phase 5: Custom Domain Support

### 5.1 Domain-to-Organization Mapping
**Goal:** Route custom domains to specific organizations

**Database Schema:**
```sql
-- Add custom_domain to organizations table
ALTER TABLE organizations
ADD COLUMN custom_domain TEXT UNIQUE;

-- Add index for fast lookups
CREATE INDEX idx_organizations_custom_domain
ON organizations(custom_domain);

-- Example data
UPDATE organizations
SET custom_domain = 'acme.platform.com'
WHERE id = 'acme-org-uuid';
```

**Estimated Effort:** 1 hour

---

### 5.2 Middleware Domain Detection
**Goal:** Automatically detect organization from domain

**Files to Create:**
- `middleware.ts` (or modify existing)

**Implementation:**
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(request: NextRequest) {
  const domain = request.headers.get('host')

  // Skip for default domain
  if (domain?.includes('humanglue.ai') || domain?.includes('localhost')) {
    return NextResponse.next()
  }

  // Look up organization by custom domain
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('custom_domain', domain)
    .single()

  if (org) {
    // Inject org ID into request headers
    const response = NextResponse.next()
    response.headers.set('x-organization-id', org.id)
    response.headers.set('x-organization-name', org.name)
    return response
  }

  // Domain not found - show 404 or redirect
  return NextResponse.redirect(new URL('/domain-not-found', request.url))
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
```

**Estimated Effort:** 3-4 hours

---

### 5.3 Auto-Load Branding from Domain
**Goal:** BrandingContext automatically loads based on domain

**Modify BrandingContext:**
```typescript
// lib/contexts/BrandingContext.tsx
export function BrandingProvider({ children }: { children: ReactNode }) {
  // ... existing state ...

  useEffect(() => {
    // Try to get org ID from request headers (set by middleware)
    const orgIdFromDomain = document.querySelector('meta[name="x-organization-id"]')?.getAttribute('content')

    if (orgIdFromDomain) {
      loadBranding(orgIdFromDomain)
    }
  }, [])

  // ... rest of provider ...
}
```

**Estimated Effort:** 1-2 hours

---

## Phase 6: Email Template Builder (Optional Advanced Feature)

### 6.1 Visual Email Editor
**Goal:** WYSIWYG editor for custom email templates

**Libraries to Use:**
- `react-email` - Email component library
- `@blocknote/core` - Rich text editor
- `mjml` - Responsive email markup

**Implementation Outline:**
1. Create email template schema in database
2. Build visual editor UI component
3. Store templates as MJML/HTML
4. Modify email functions to use custom templates

**Estimated Effort:** 20-30 hours (large feature)

---

### 6.2 Email Template Variables
**Goal:** Allow dynamic content in email templates

**Variables to Support:**
```typescript
// Available in all email templates
{
  user: {
    name: string
    email: string
    company: string
  },
  organization: {
    company_name: string
    website: string
    support_email: string
  },
  assessment: {
    score: number
    results_url: string
    key_findings: string[]
  }
}
```

**Template Example:**
```html
<p>Hello {{user.name}},</p>
<p>Thank you for completing your assessment at {{organization.company_name}}.</p>
<p>Your score: {{assessment.score}}/100</p>
```

**Estimated Effort:** 8-12 hours

---

## Phase 7: Multi-Language Support

### 7.1 Branding Localization
**Goal:** Support multiple languages per organization

**Database Schema:**
```sql
-- Add localization to branding settings
ALTER TABLE organizations
ADD COLUMN branding_i18n JSONB DEFAULT '{}'::jsonb;

-- Example structure:
{
  "en": {
    "company_name": "Acme Corp",
    "tagline": "Innovation Through AI",
    "email": {
      "footer_text": "© 2025 Acme Corp. All rights reserved."
    }
  },
  "es": {
    "company_name": "Acme Corp",
    "tagline": "Innovación a través de IA",
    "email": {
      "footer_text": "© 2025 Acme Corp. Todos los derechos reservados."
    }
  }
}
```

**Estimated Effort:** 10-15 hours

---

### 7.2 Email Language Detection
**Goal:** Send emails in recipient's preferred language

**Implementation:**
```typescript
// netlify/functions/send-profile-email.ts
async function getOrgBrandingLocalized(
  orgId: string,
  locale: string = 'en'
): Promise<OrgBranding> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const { data } = await supabase
    .from('organizations')
    .select('settings, branding_i18n')
    .eq('id', orgId)
    .single()

  const i18n = data?.branding_i18n?.[locale] || {}
  const base = data?.settings?.branding || {}

  // Merge base branding with localized strings
  return {
    company_name: i18n.company_name || base.company_name || 'HumanGlue',
    tagline: i18n.tagline || base.tagline,
    // ... merge other fields
  }
}
```

**Estimated Effort:** 6-8 hours

---

## Phase 8: White-Label Analytics Dashboard

### 8.1 Branded Analytics Pages
**Goal:** Organization-specific analytics with custom branding

**Files to Create:**
- `app/[orgSlug]/analytics/page.tsx`
- `components/analytics/BrandedDashboard.tsx`

**Features:**
- Custom color schemes for charts
- Organization logo in reports
- Branded export (PDF/CSV)
- Custom KPI definitions per org

**Estimated Effort:** 15-20 hours

---

## Phase 9: Security & Compliance Enhancements

### 9.1 Branding Audit Log
**Goal:** Track all branding changes for compliance

**Database Schema:**
```sql
CREATE TABLE branding_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT NOW(),
  changes JSONB NOT NULL,
  previous_values JSONB,
  new_values JSONB
);

CREATE INDEX idx_branding_audit_org ON branding_audit_log(organization_id);
CREATE INDEX idx_branding_audit_date ON branding_audit_log(changed_at DESC);
```

**Estimated Effort:** 4-6 hours

---

### 9.2 Branding Approval Workflow
**Goal:** Require approval for branding changes (enterprise feature)

**Implementation:**
1. Add `branding_status` field: `draft | pending_approval | approved | rejected`
2. Create approval UI for super admins
3. Email notifications for approval requests
4. Version history with rollback capability

**Estimated Effort:** 12-16 hours

---

## Phase 10: Advanced Asset Management

### 10.1 Brand Asset Library
**Goal:** Centralized storage for all brand assets

**Features:**
- Logo variations (light/dark, different sizes)
- Email header/footer templates
- Social media images
- Document templates
- Font files
- Color palette presets

**Database Schema:**
```sql
CREATE TABLE brand_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  asset_type TEXT NOT NULL, -- 'logo', 'icon', 'template', etc.
  asset_url TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_brand_assets_org_type ON brand_assets(organization_id, asset_type);
```

**Estimated Effort:** 10-12 hours

---

### 10.2 CDN Integration for Assets
**Goal:** Fast, global delivery of brand assets

**Implementation:**
- Integrate with Cloudflare, AWS CloudFront, or Netlify CDN
- Automatic image optimization
- WebP conversion
- Responsive image serving
- Asset versioning & cache busting

**Estimated Effort:** 6-8 hours

---

## Priority Recommendations

### High Priority (Do Next)
1. **Phase 5.1-5.3:** Custom Domain Support (5-7 hours total) 👈 **RECOMMENDED NEXT**
   - Major differentiator for enterprise customers
   - Enables true multi-tenant architecture
   - Allows orgs to use their own domain (e.g., platform.acme.com)

### Medium Priority
3. **Phase 9.1:** Branding Audit Log (4-6 hours)
   - Important for compliance and enterprise sales
   - Relatively quick to implement

4. **Phase 7.1-7.2:** Multi-Language Support (16-23 hours)
   - Unlocks international markets
   - Can be rolled out incrementally

### Low Priority (Nice to Have)
5. **Phase 6:** Email Template Builder (20-30 hours)
   - Advanced feature for power users
   - Significant development time required

6. **Phase 10:** Advanced Asset Management (16-20 hours)
   - Useful for agencies managing multiple brands
   - Can be deferred until customer demand exists

---

## Quick Wins (< 4 hours each)

1. **Add branding preview to organization list**
   - Show logo thumbnail and primary color in admin table
   - 2 hours

2. **Branding import/export**
   - Download branding as JSON
   - Upload JSON to clone branding
   - 3 hours

3. **Default branding templates**
   - Pre-built color schemes (Professional Blue, Modern Purple, etc.)
   - One-click apply
   - 2 hours

4. **Branding health check**
   - Validate logo URLs are accessible
   - Check color contrast ratios
   - Test email deliverability
   - 3 hours

---

## Testing & QA Checklist

Before each phase release:

- [ ] Unit tests for new service functions
- [ ] Integration tests for API endpoints
- [ ] E2E tests for UI workflows
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile responsiveness
- [ ] Email client testing (Gmail, Outlook, Apple Mail)
- [ ] PDF rendering validation
- [ ] Performance benchmarking
- [ ] Security audit (SQL injection, XSS, CSRF)
- [ ] Accessibility compliance (WCAG 2.1 AA)
- [ ] Documentation updates

---

## Success Metrics

Track these KPIs to measure white-label adoption:

1. **Adoption Rate**
   - % of organizations with custom branding configured
   - Target: 60% within 3 months

2. **Email Engagement**
   - Open rate comparison: branded vs. default emails
   - Target: +15% for branded emails

3. **Support Tickets**
   - Branding-related support requests
   - Target: < 5% of total tickets

4. **Customer Satisfaction**
   - NPS score for white-label feature
   - Target: 8+ out of 10

5. **Performance**
   - Page load time with dynamic branding
   - Target: < 100ms overhead

---

## Resources & Documentation

**Internal Docs:**
- [WHITE_LABEL_USAGE_GUIDE.md](WHITE_LABEL_USAGE_GUIDE.md) - Current implementation guide
- [WHITE_LABEL_IMPLEMENTATION_PLAN.md](WHITE_LABEL_IMPLEMENTATION_PLAN.md) - Original planning doc
- [services/branding.ts](services/branding.ts) - Core branding service
- [components/admin/BrandingSettings.tsx](components/admin/BrandingSettings.tsx) - Admin UI

**External Resources:**
- [Resend Email Best Practices](https://resend.com/docs/send-with-nodejs)
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Tailwind CSS Theming](https://tailwindcss.com/docs/customizing-colors)
- [MJML Email Framework](https://mjml.io/)

---

## Support & Questions

For implementation questions:
- **Technical Lead:** Review this document
- **Backend Issues:** Check [services/branding.ts](services/branding.ts)
- **Frontend Issues:** Check [components/admin/BrandingSettings.tsx](components/admin/BrandingSettings.tsx)
- **API Issues:** Check [app/api/organizations/[id]/branding/route.ts](app/api/organizations/[id]/branding/route.ts)

Last Updated: 2025-01-28
