# 🔌 White-Label Platform API Documentation

> Complete API reference for developers integrating with the HumanGlue white-label system

**Version:** 1.5.0 | **Last Updated:** 2025-01-28 | **Status:** Production Ready

---

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [REST API Endpoints](#rest-api-endpoints)
  - [Branding API](#branding-api)
  - [Custom Domain API](#custom-domain-api)
  - [Domain Detection API](#domain-detection-api)
- [Service Layer API](#service-layer-api)
- [React Hooks & Context](#react-hooks--context)
- [Email Functions](#email-functions)
- [PDF Generation](#pdf-generation)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Rate Limits & Quotas](#rate-limits--quotas)
- [Code Examples](#code-examples)
- [Testing](#testing)

---

## Overview

The HumanGlue white-label API enables organizations to customize:
- **Visual Identity:** Colors, logos, company name, tagline
- **Email Communications:** Sender details, footer text, support contact
- **PDF Documents:** Branded assessment reports
- **Platform UI:** Dynamic theming, favicon, page titles
- **Custom Domains:** Subdomain mapping (e.g., platform.acme.com)

### Base URLs
- **Production:** `https://hmnglue.com`
- **Staging:** `https://staging.hmnglue.com`
- **Development:** `http://localhost:3000`

### API Versions
- **Current:** v1.0
- **Supported:** v1.0

---

## Authentication

All API requests require authentication via Supabase JWT tokens.

### Getting an Access Token

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data: { session } } = await supabase.auth.getSession()
const accessToken = session?.access_token
```

### Using the Token

```bash
curl https://hmnglue.com/api/organizations/{orgId}/branding \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Authorization Levels

| Action | Required Role | Notes |
|--------|---------------|-------|
| **View Branding** | `member`, `org_admin`, `admin` | Any org member |
| **Update Branding** | `org_admin`, `admin` | Org admins only |
| **Custom Domain** | `org_admin`, `admin` | Org admins only |
| **Cross-Org Access** | `admin` | Platform admins only |

---

## REST API Endpoints

### Branding API

#### GET /api/organizations/:id/branding

Retrieve branding configuration for an organization.

**Authorization:** User must belong to the organization or be a platform admin.

**Request:**
```bash
GET /api/organizations/{orgId}/branding
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "company_name": "Acme Corporation",
    "tagline": "Innovation Through AI",
    "colors": {
      "primary": "#ff6b35",
      "secondary": "#004e89",
      "accent": "#10b981"
    },
    "logo": {
      "url": "https://cdn.acme.ai/logo.png",
      "favicon_url": "https://cdn.acme.ai/favicon.ico",
      "width": 200,
      "height": 50
    },
    "email": {
      "sender_name": "Acme AI Platform",
      "sender_email": "noreply@acme.ai",
      "support_email": "support@acme.ai",
      "footer_text": "© 2025 Acme Corporation. All rights reserved."
    },
    "social": {
      "website": "https://acme.ai",
      "twitter": "@acmecorp",
      "linkedin": "company/acme"
    }
  }
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| `401` | `Unauthorized` | Missing or invalid access token |
| `403` | `Forbidden` | User doesn't have access to this organization |
| `404` | `Not Found` | Organization doesn't exist |
| `500` | `Internal Server Error` | Server-side error |

---

#### POST /api/organizations/:id/branding

Create or completely replace branding configuration.

**Authorization:** User must be `org_admin` or platform `admin`.

**Request:**
```bash
POST /api/organizations/{orgId}/branding
Authorization: Bearer {token}
Content-Type: application/json

{
  "company_name": "Acme Corporation",
  "tagline": "Innovation Through AI",
  "colors": {
    "primary": "#ff6b35",
    "secondary": "#004e89",
    "accent": "#10b981"
  },
  "logo": {
    "url": "https://cdn.acme.ai/logo.png",
    "favicon_url": "https://cdn.acme.ai/favicon.ico"
  },
  "email": {
    "sender_name": "Acme AI Platform",
    "sender_email": "noreply@acme.ai",
    "support_email": "support@acme.ai",
    "footer_text": "© 2025 Acme Corporation"
  },
  "social": {
    "website": "https://acme.ai",
    "twitter": "@acmecorp"
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Branding updated successfully",
  "data": { /* full branding object */ }
}
```

**Validation Errors:** `400 Bad Request`
```json
{
  "error": "Invalid branding configuration",
  "validation_errors": [
    "Invalid sender email address",
    "Invalid primary color format (must be #RRGGBB)"
  ]
}
```

---

#### PATCH /api/organizations/:id/branding

Partially update branding configuration.

**Authorization:** User must be `org_admin` or platform `admin`.

**Request:**
```bash
PATCH /api/organizations/{orgId}/branding
Authorization: Bearer {token}
Content-Type: application/json

{
  "colors": {
    "primary": "#ff0000"
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Branding updated successfully",
  "data": { /* full branding object with merged changes */ }
}
```

---

### Custom Domain API

#### GET /api/organizations/:id/domain

Retrieve custom domain configuration for an organization.

**Authorization:** User must belong to the organization or be a platform admin.

**Request:**
```bash
GET /api/organizations/{orgId}/domain
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "domain": "platform.acme.com"
}
```

**Response (No Domain):** `200 OK`
```json
{
  "domain": null
}
```

---

#### POST /api/organizations/:id/domain

Set or update custom domain for an organization.

**Authorization:** User must be `org_admin` or platform `admin`.

**Request:**
```bash
POST /api/organizations/{orgId}/domain
Authorization: Bearer {token}
Content-Type: application/json

{
  "domain": "platform.acme.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "domain": "platform.acme.com"
}
```

**Remove Domain:**
```bash
POST /api/organizations/{orgId}/domain
Authorization: Bearer {token}
Content-Type: application/json

{
  "domain": null
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| `400` | `Invalid domain format` | Domain doesn't match validation regex |
| `403` | `Permission denied` | User doesn't have org_admin role |
| `409` | `Domain already in use` | Another organization is using this domain |
| `500` | `Failed to update custom domain` | Server-side error |

**Domain Validation Rules:**
- Must be lowercase alphanumeric with hyphens
- No protocol (`http://`, `https://`)
- No `www.` prefix
- No trailing slash
- Valid format: `[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*`

---

### Domain Detection API

#### GET /api/domain-org

Detect organization ID from the current request domain.

**Authorization:** None (public endpoint)

**Request:**
```bash
GET /api/domain-org
```

**Response:** `200 OK`
```json
{
  "organizationId": "550e8400-e29b-41d4-a716-446655440000",
  "domain": "platform.acme.com"
}
```

**Response (No Custom Domain):** `200 OK`
```json
{
  "organizationId": null,
  "domain": "hmnglue.com"
}
```

**Use Case:**
Used by `BrandingInjector` component to auto-load organization branding when accessing the platform via custom domain.

---

## Service Layer API

### TypeScript Service Functions

Located in: [services/branding.ts](services/branding.ts)

#### getOrgBranding(orgId: string)

Fetch organization branding with fallback to defaults.

```typescript
import { getOrgBranding } from '@/services/branding'

const branding = await getOrgBranding('org-uuid')

console.log(branding.company_name) // "Acme Corporation"
console.log(branding.colors.primary) // "#ff6b35"
```

**Returns:** `Promise<OrgBranding>`

**Fallback Behavior:**
If organization has no custom branding, returns HumanGlue defaults:
```typescript
{
  company_name: 'HumanGlue',
  colors: { primary: '#3b82f6', secondary: '#8b5cf6' },
  logo: { url: '/HumnaGlue_logo_white_blue.png' },
  email: {
    sender_name: 'HumanGlue',
    sender_email: 'onboarding@humanglue.ai',
    support_email: 'support@humanglue.ai',
    footer_text: '© 2025 HumanGlue. All rights reserved.'
  }
}
```

---

#### updateOrgBranding(orgId: string, branding: Partial<OrgBranding>)

Update organization branding.

```typescript
import { updateOrgBranding } from '@/services/branding'

await updateOrgBranding('org-uuid', {
  colors: {
    primary: '#ff0000',
    secondary: '#0000ff'
  }
})
```

**Returns:** `Promise<OrgBranding>`

**Throws:**
- `Error('Invalid branding configuration')` - Validation failed
- `Error('Permission denied')` - User lacks authorization

---

#### validateBranding(branding: Partial<OrgBranding>)

Validate branding configuration.

```typescript
import { validateBranding } from '@/services/branding'

const errors = validateBranding({
  colors: {
    primary: 'not-a-hex-color' // Invalid!
  },
  email: {
    sender_email: 'invalid-email' // Invalid!
  }
})

console.log(errors)
// [
//   'Invalid primary color format. Use #RRGGBB format.',
//   'Invalid sender email address'
// ]
```

**Returns:** `string[]` (array of error messages)

**Validation Rules:**
- **Colors:** Must be 6-character hex codes (`#RRGGBB`)
- **Emails:** Must contain `@` and valid domain
- **URLs:** Must be absolute URLs or relative paths starting with `/`

---

#### hasCustomBranding(orgId: string)

Check if organization has custom branding configured.

```typescript
import { hasCustomBranding } from '@/services/branding'

const hasCustom = await hasCustomBranding('org-uuid')
if (hasCustom) {
  console.log('Organization has custom branding')
}
```

**Returns:** `Promise<boolean>`

---

#### getOrgByDomain(domain: string)

Get organization ID from custom domain.

```typescript
import { getOrgByDomain } from '@/services/branding'

const orgId = await getOrgByDomain('platform.acme.com')
if (orgId) {
  console.log('Found organization:', orgId)
}
```

**Returns:** `Promise<string | null>`

**Domain Normalization:**
Automatically removes protocol, `www.`, and trailing slashes.

---

#### updateCustomDomain(orgId: string, domain: string | null)

Update organization custom domain.

```typescript
import { updateCustomDomain } from '@/services/branding'

// Set custom domain
await updateCustomDomain('org-uuid', 'platform.acme.com')

// Remove custom domain
await updateCustomDomain('org-uuid', null)
```

**Returns:** `Promise<void>`

**Throws:**
- `Error('Invalid domain format')` - Domain validation failed
- `Error('This domain is already in use by another organization')` - Duplicate domain

---

## React Hooks & Context

### useBranding()

Manual branding loading with imperative control.

```typescript
import { useBranding } from '@/lib/contexts/BrandingContext'

function MyComponent() {
  const { branding, loadBranding, isLoading, error } = useBranding()

  useEffect(() => {
    loadBranding('org-uuid')
  }, [loadBranding])

  if (isLoading) return <Spinner />
  if (error) return <Error message={error} />

  return (
    <div style={{ color: branding.colors.primary }}>
      {branding.company_name}
    </div>
  )
}
```

**Returns:**
```typescript
{
  branding: OrgBranding | null
  loadBranding: (orgId: string) => Promise<void>
  isLoading: boolean
  error: string | null
}
```

---

### useOrgBranding(organizationId)

Auto-loading branding for declarative usage.

```typescript
import { useOrgBranding } from '@/lib/contexts/BrandingContext'

function MyComponent({ organizationId }: { organizationId: string }) {
  const { branding, isLoading, error } = useOrgBranding(organizationId)

  if (isLoading) return <Spinner />
  if (error) return <Error message={error} />

  return (
    <div style={{ color: branding.colors.primary }}>
      <img src={branding.logo.url} alt={branding.company_name} />
      <h1>{branding.company_name}</h1>
    </div>
  )
}
```

**Returns:**
```typescript
{
  branding: OrgBranding
  isLoading: boolean
  error: string | null
}
```

---

### useBrandingStyles()

Injects CSS variables for dynamic theming.

```typescript
import { useBrandingStyles } from '@/lib/hooks/useBrandingStyles'

function MyApp() {
  useBrandingStyles() // Auto-injects CSS variables

  return <div className="bg-org-primary text-white">Branded UI</div>
}
```

**CSS Variables Injected:**
```css
:root {
  --org-primary: #ff6b35;
  --org-secondary: #004e89;
  --org-accent: #10b981;
}
```

**Tailwind Classes Available:**
- `bg-org-primary`, `text-org-primary`, `border-org-primary`
- `bg-org-secondary`, `text-org-secondary`, `border-org-secondary`
- `bg-org-accent`, `text-org-accent`, `border-org-accent`

---

## Email Functions

### send-assessment-email

Send branded assessment result email.

**Endpoint:** `/.netlify/functions/send-assessment-email`

**Request:**
```typescript
await fetch('/.netlify/functions/send-assessment-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'user@example.com',
    name: 'John Doe',
    company: 'Acme Corp',
    organizationId: 'org-uuid', // ⚠️ Required!
    assessmentId: 'assessment-uuid',
    score: 85,
    resultsUrl: 'https://hmnglue.com/results/123'
  })
})
```

**Branding Applied:**
- ✅ Dynamic sender email and name
- ✅ Organization colors (primary, secondary)
- ✅ Custom footer text
- ✅ Support email link
- ✅ Company name in header

---

### send-profile-email

Send branded profile-based emails (assessment invites, demo confirmations, follow-ups).

**Endpoint:** `/.netlify/functions/send-profile-email`

**Request:**
```typescript
await fetch('/.netlify/functions/send-profile-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    profileId: 'profile-uuid',
    organizationId: 'org-uuid', // ⚠️ Required!
    emailType: 'assessment' | 'follow_up' | 'demo_confirmation',
    additionalData: { /* type-specific data */ }
  })
})
```

---

### send-email

Send generic branded email.

**Endpoint:** `/.netlify/functions/send-email`

**Request:**
```typescript
await fetch('/.netlify/functions/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'user@example.com',
    subject: 'Welcome to Acme',
    html: '<p>Email body HTML</p>',
    organizationId: 'org-uuid' // ⚠️ Required for branding!
  })
})
```

---

## PDF Generation

### generate-assessment-pdf

Generate branded assessment PDF report.

**Endpoint:** `/.netlify/functions/generate-assessment-pdf`

**Request:**
```typescript
await fetch('/.netlify/functions/generate-assessment-pdf', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    assessmentId: 'assessment-uuid',
    organizationId: 'org-uuid' // ⚠️ Required!
  })
})
```

**Response:** PDF file download

**Branding Applied:**
- ✅ Dynamic colors throughout styling
- ✅ Company name in header and footer
- ✅ Custom tagline
- ✅ Custom footer text
- ✅ Organization website links
- ✅ Branded filename: `{company_name}_Assessment_Report.pdf`

---

## Data Models

### OrgBranding

```typescript
interface OrgBranding {
  company_name: string
  tagline?: string
  colors: {
    primary: string    // Hex color (#RRGGBB)
    secondary: string  // Hex color (#RRGGBB)
    accent?: string    // Hex color (#RRGGBB)
  }
  logo?: {
    url: string
    favicon_url?: string
    width?: number
    height?: number
  }
  email: {
    sender_name: string
    sender_email: string      // Valid email
    support_email: string     // Valid email
    footer_text: string
  }
  social?: {
    website?: string          // URL
    twitter?: string          // Handle or URL
    linkedin?: string         // Handle or URL
  }
}
```

### Database Schema

Branding is stored in `organizations.settings.branding` (JSONB column):

```sql
-- organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  custom_domain TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast domain lookups
CREATE INDEX idx_organizations_custom_domain
ON organizations(custom_domain);

-- Example settings.branding structure
{
  "branding": {
    "company_name": "Acme Corp",
    "colors": {
      "primary": "#ff6b35",
      "secondary": "#004e89"
    },
    "email": {
      "sender_name": "Acme AI",
      "sender_email": "noreply@acme.ai",
      "support_email": "support@acme.ai",
      "footer_text": "© 2025 Acme Corporation"
    }
  }
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| `200` | OK | Success |
| `400` | Bad Request | Validation errors, invalid JSON |
| `401` | Unauthorized | Missing or invalid auth token |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Organization doesn't exist |
| `409` | Conflict | Duplicate custom domain |
| `500` | Internal Server Error | Server-side error |

### Error Response Format

```json
{
  "error": "Human-readable error message",
  "validation_errors": [
    "Specific validation error 1",
    "Specific validation error 2"
  ]
}
```

### Validation Errors

Common validation errors:

```typescript
// Invalid hex color
{
  "error": "Invalid branding configuration",
  "validation_errors": [
    "Invalid primary color format. Use #RRGGBB format."
  ]
}

// Invalid email
{
  "error": "Invalid branding configuration",
  "validation_errors": [
    "Invalid sender email address"
  ]
}

// Invalid URL
{
  "error": "Invalid branding configuration",
  "validation_errors": [
    "Invalid website URL"
  ]
}
```

---

## Rate Limits & Quotas

### API Rate Limits

| Endpoint | Rate Limit | Window |
|----------|------------|--------|
| `GET /api/organizations/:id/branding` | 100 requests | 1 minute |
| `POST /api/organizations/:id/branding` | 10 requests | 1 minute |
| `PATCH /api/organizations/:id/branding` | 10 requests | 1 minute |
| `POST /api/organizations/:id/domain` | 5 requests | 1 minute |

### Exceeded Rate Limit

**Response:** `429 Too Many Requests`
```json
{
  "error": "Rate limit exceeded. Please try again later.",
  "retry_after": 60
}
```

---

## Code Examples

### Complete Integration Example

```typescript
// 1. Fetch organization branding
import { getOrgBranding } from '@/services/branding'

async function setupBranding(orgId: string) {
  try {
    const branding = await getOrgBranding(orgId)

    // 2. Apply to UI
    document.documentElement.style.setProperty('--org-primary', branding.colors.primary)
    document.documentElement.style.setProperty('--org-secondary', branding.colors.secondary)

    // 3. Update page title
    document.title = `${branding.company_name} - AI Platform`

    // 4. Update favicon
    const faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement
    if (faviconLink && branding.logo?.favicon_url) {
      faviconLink.href = branding.logo.favicon_url
    }

    console.log('Branding applied:', branding.company_name)
  } catch (error) {
    console.error('Failed to load branding:', error)
  }
}
```

### React Component with Dynamic Branding

```typescript
import { useOrgBranding } from '@/lib/contexts/BrandingContext'

function BrandedHeader({ organizationId }: { organizationId: string }) {
  const { branding, isLoading } = useOrgBranding(organizationId)

  if (isLoading) {
    return <div className="h-16 bg-gray-200 animate-pulse" />
  }

  return (
    <header className="bg-org-primary text-white px-6 py-4">
      <div className="flex items-center gap-4">
        <img
          src={branding.logo.url}
          alt={branding.company_name}
          className="h-10"
        />
        <div>
          <h1 className="text-xl font-bold">{branding.company_name}</h1>
          {branding.tagline && (
            <p className="text-sm opacity-80">{branding.tagline}</p>
          )}
        </div>
      </div>
    </header>
  )
}
```

### Admin UI for Branding Management

```typescript
import { useState } from 'react'

function BrandingConfigPanel({ organizationId }: { organizationId: string }) {
  const [primaryColor, setPrimaryColor] = useState('#3b82f6')
  const [saving, setSaving] = useState(false)

  async function saveBranding() {
    setSaving(true)
    try {
      const response = await fetch(`/api/organizations/${organizationId}/branding`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          colors: { primary: primaryColor }
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save branding')
      }

      alert('Branding updated successfully!')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save branding')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Primary Color
        </label>
        <input
          type="color"
          value={primaryColor}
          onChange={(e) => setPrimaryColor(e.target.value)}
          className="w-full h-12 rounded border"
        />
      </div>

      <button
        onClick={saveBranding}
        disabled={saving}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  )
}
```

---

## Testing

### Unit Testing Service Layer

```typescript
import { validateBranding } from '@/services/branding'

describe('validateBranding', () => {
  it('should reject invalid hex colors', () => {
    const errors = validateBranding({
      colors: { primary: 'not-a-color' }
    })
    expect(errors).toContain('Invalid primary color format')
  })

  it('should reject invalid email addresses', () => {
    const errors = validateBranding({
      email: { sender_email: 'invalid-email' }
    })
    expect(errors).toContain('Invalid sender email address')
  })

  it('should accept valid branding', () => {
    const errors = validateBranding({
      company_name: 'Acme Corp',
      colors: { primary: '#ff6b35', secondary: '#004e89' },
      email: {
        sender_name: 'Acme',
        sender_email: 'noreply@acme.ai',
        support_email: 'support@acme.ai',
        footer_text: '© 2025 Acme'
      }
    })
    expect(errors).toEqual([])
  })
})
```

### Integration Testing API Endpoints

```typescript
describe('POST /api/organizations/:id/branding', () => {
  it('should update branding for authorized user', async () => {
    const response = await fetch('/api/organizations/test-org/branding', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        company_name: 'Test Corp',
        colors: { primary: '#ff0000' }
      })
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.company_name).toBe('Test Corp')
  })

  it('should reject invalid color format', async () => {
    const response = await fetch('/api/organizations/test-org/branding', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        colors: { primary: 'invalid' }
      })
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.validation_errors).toContain('Invalid primary color format')
  })
})
```

### E2E Testing Branding Flow

```typescript
import { test, expect } from '@playwright/test'

test('Admin can update organization branding', async ({ page }) => {
  // 1. Login as admin
  await page.goto('/login')
  await page.fill('[name="email"]', 'admin@example.com')
  await page.fill('[name="password"]', 'password')
  await page.click('button[type="submit"]')

  // 2. Navigate to branding settings
  await page.goto('/admin/organizations/test-org/branding')

  // 3. Update primary color
  await page.fill('[name="primary-color"]', '#ff0000')
  await page.click('button:has-text("Save Changes")')

  // 4. Verify success message
  await expect(page.locator('text=Branding updated successfully')).toBeVisible()

  // 5. Verify color was applied
  const primaryColor = await page.evaluate(() => {
    return getComputedStyle(document.documentElement).getPropertyValue('--org-primary')
  })
  expect(primaryColor.trim()).toBe('#ff0000')
})
```

---

## Additional Resources

### Documentation
- [Usage Guide](WHITE_LABEL_USAGE_GUIDE.md) - Complete usage examples
- [Platform UI Guide](WHITE_LABEL_PLATFORM_UI_GUIDE.md) - Dynamic theming guide
- [Summary](WHITE_LABEL_SUMMARY.md) - Project overview
- [Roadmap](WHITE_LABEL_NEXT_STEPS.md) - Future enhancements

### Code References
- [services/branding.ts](services/branding.ts) - Service layer implementation
- [app/api/organizations/[id]/branding/route.ts](app/api/organizations/[id]/branding/route.ts) - API routes
- [lib/contexts/BrandingContext.tsx](lib/contexts/BrandingContext.tsx) - React context
- [components/admin/BrandingSettings.tsx](components/admin/BrandingSettings.tsx) - Admin UI

### External Links
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Tailwind CSS Theming](https://tailwindcss.com/docs/customizing-colors)

---

## Support

**Questions?**
- Review this API documentation first
- Check [Usage Guide](WHITE_LABEL_USAGE_GUIDE.md) for examples
- Inspect code in [services/branding.ts](services/branding.ts)
- Test with admin UI: `/admin/organizations/{id}/branding`

**Found a Bug?**
1. Check validation errors in API response
2. Review [Troubleshooting Guide](WHITE_LABEL_USAGE_GUIDE.md#troubleshooting)
3. Inspect browser console and network tab
4. Check Netlify function logs (for email/PDF issues)

---

**Version:** 1.5.0
**Last Updated:** 2025-01-28
**Status:** ✅ Production Ready
**Maintained By:** Development Team
