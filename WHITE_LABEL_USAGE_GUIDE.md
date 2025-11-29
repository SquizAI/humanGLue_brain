# White-Label Implementation Guide

## Overview

The HumanGlue platform now supports white-label branding, allowing each organization to customize:
- Email sender address and branding
- Colors and logos
- Company name and footer text
- Support contact information

## What's Been Implemented

✅ **Branding Service Layer** ([services/branding.ts](services/branding.ts))
- `getOrgBranding(orgId)` - Fetch org branding with fallback to defaults
- `updateOrgBranding(orgId, branding)` - Update org branding
- `validateBranding(branding)` - Validate branding configuration
- `hasCustomBranding(orgId)` - Check if org has custom branding

✅ **Branding API Routes** ([app/api/organizations/[id]/branding/route.ts](app/api/organizations/[id]/branding/route.ts))
- `GET /api/organizations/:id/branding` - Retrieve branding
- `POST /api/organizations/:id/branding` - Update branding
- `PATCH /api/organizations/:id/branding` - Partial update

✅ **White-Label Email Template** ([netlify/functions/send-assessment-email.ts](netlify/functions/send-assessment-email.ts))
- Dynamic sender email and name
- Org-specific colors and branding
- Custom footer text and support email

---

## Quick Start

### 1. Configure Organization Branding

Use the API to set up branding for an organization:

```bash
curl -X POST https://your-domain.com/api/organizations/{orgId}/branding \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Acme Corporation",
    "tagline": "Innovation Through AI",
    "colors": {
      "primary": "#ff6b35",
      "secondary": "#004e89",
      "accent": "#10b981"
    },
    "logo": {
      "url": "https://your-cdn.com/logos/acme.png",
      "favicon_url": "https://your-cdn.com/favicons/acme.ico"
    },
    "email": {
      "sender_name": "Acme AI Platform",
      "sender_email": "noreply@acme.ai",
      "support_email": "support@acme.ai",
      "footer_text": "© 2025 Acme Corporation. All rights reserved."
    },
    "social": {
      "website": "https://acme.ai",
      "twitter": "@acmecorp"
    }
  }'
```

### 2. Retrieve Organization Branding

```bash
curl https://your-domain.com/api/organizations/{orgId}/branding \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "company_name": "Acme Corporation",
    "colors": {
      "primary": "#ff6b35",
      "secondary": "#004e89"
    },
    "logo": {
      "url": "https://your-cdn.com/logos/acme.png"
    },
    "email": {
      "sender_name": "Acme AI Platform",
      "sender_email": "noreply@acme.ai",
      "support_email": "support@acme.ai",
      "footer_text": "© 2025 Acme Corporation. All rights reserved."
    }
  }
}
```

---

## Usage in Code

### Backend: Fetching Branding

```typescript
import { getOrgBranding } from '@/services/branding'

// In any server-side function
const branding = await getOrgBranding(organizationId)

console.log(branding.company_name) // "Acme Corporation"
console.log(branding.colors.primary) // "#ff6b35"
```

### Sending White-Label Emails

When calling the email function, include the `organizationId`:

```typescript
// Example: Sending assessment email
const response = await fetch('/.netlify/functions/send-assessment-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'user@example.com',
    name: 'John Doe',
    company: 'Example Corp',
    organizationId: 'uuid-of-organization', // ⚠️ Required!
    assessmentId: 'assessment-uuid',
    score: 85,
    resultsUrl: 'https://platform.com/results/123'
  })
})
```

The email will automatically use the organization's branding:
- ✅ Sender: `Acme AI Platform <noreply@acme.ai>`
- ✅ Colors: `#ff6b35` and `#004e89`
- ✅ Footer: Custom footer text
- ✅ Support link: `support@acme.ai`

---

## Database Schema

Branding is stored in the `organizations` table:

```sql
-- organizations.settings column (JSONB)
{
  "branding": {
    "company_name": "Acme Corp",
    "colors": {
      "primary": "#ff6b35",
      "secondary": "#004e89"
    },
    "logo": {
      "url": "https://...",
      "favicon_url": "https://..."
    },
    "email": {
      "sender_name": "Acme AI",
      "sender_email": "noreply@acme.ai",
      "support_email": "support@acme.ai",
      "footer_text": "© 2025 Acme Corp"
    },
    "social": {
      "website": "https://acme.ai"
    }
  }
}
```

---

## Default Branding

If an organization hasn't configured custom branding, the system falls back to HumanGlue defaults:

```typescript
{
  company_name: 'HumanGlue',
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6'
  },
  logo: {
    url: '/HumnaGlue_logo_white_blue.png'
  },
  email: {
    sender_name: 'HumanGlue',
    sender_email: 'onboarding@humanglue.ai',
    support_email: 'support@humanglue.ai',
    footer_text: '© 2025 HumanGlue. All rights reserved.'
  }
}
```

---

## Validation

The branding service validates all configuration:

### Email Validation
```typescript
// ✅ Valid
"noreply@acme.ai"

// ❌ Invalid
"not-an-email"
```

### Color Validation
```typescript
// ✅ Valid hex codes
"#3b82f6"
"#ff6b35"

// ❌ Invalid
"blue"
"rgb(255, 0, 0)"
```

### URL Validation
```typescript
// ✅ Valid
"https://acme.ai"
"/logo.png" // Relative paths allowed

// ❌ Invalid
"not-a-url"
```

---

## Security

### Authorization

**GET branding:**
- User must belong to the organization OR be a platform admin

**POST/PATCH branding:**
- User must be `org_admin` or platform `admin`

### Row-Level Security (RLS)

The database already has RLS policies that enforce organization isolation. See [001_multi_tenant_schema.sql:865-873](supabase/migrations/001_multi_tenant_schema.sql:865-873).

---

## Testing

### Manual Testing

1. **Create test organization:**
```sql
INSERT INTO organizations (id, name, slug)
VALUES ('test-org-id', 'Test Org', 'test-org');
```

2. **Configure branding via API:**
```bash
curl -X POST localhost:5040/api/organizations/test-org-id/branding \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"company_name": "Test Corp", "colors": {"primary": "#ff0000"}}'
```

3. **Send test email:**
```bash
curl -X POST localhost:5040/.netlify/functions/send-assessment-email \
  -d '{
    "to": "test@example.com",
    "name": "Test User",
    "company": "Test Co",
    "organizationId": "test-org-id",
    "assessmentId": "test-123",
    "score": 85,
    "resultsUrl": "https://example.com"
  }'
```

4. **Verify email has custom branding**

---

## Migration Path

### For Existing Organizations

Run this SQL to backfill default branding:

```sql
UPDATE organizations
SET settings = jsonb_set(
  COALESCE(settings, '{}'::jsonb),
  '{branding}',
  '{
    "company_name": "HumanGlue",
    "colors": {"primary": "#3b82f6", "secondary": "#8b5cf6"},
    "email": {
      "sender_name": "HumanGlue",
      "sender_email": "onboarding@humanglue.ai",
      "support_email": "support@humanglue.ai",
      "footer_text": "© 2025 HumanGlue. All rights reserved."
    }
  }'::jsonb
)
WHERE settings->'branding' IS NULL;
```

---

## Next Steps

### Phase 2: PDF White-Labeling
Update [netlify/functions/generate-assessment-pdf.ts](netlify/functions/generate-assessment-pdf.ts) to use org branding:

```typescript
const branding = await getOrgBranding(organizationId)
const html = generatePDFHTML(assessment, branding)
```

### Phase 3: Frontend Branding Context
Create React context to load org branding:

```typescript
// contexts/BrandingContext.tsx
export function useBranding() {
  // Fetch and cache org branding
  const branding = useOrgBranding(user.organizationId)
  return branding
}

// Use in components
const branding = useBranding()
return <div style={{ color: branding.colors.primary }}>...</div>
```

### Phase 4: Custom Domains
Add domain routing in middleware:

```typescript
// middleware.ts
const domain = request.headers.get('host')
const org = await getOrgByDomain(domain)
request.orgId = org.id
```

---

## Troubleshooting

### Email not using custom branding

**Check:**
1. Is `organizationId` included in the request?
2. Does the org have branding configured?
3. Check Netlify function logs for errors

```bash
# Debug branding fetch
const branding = await getOrgBranding(orgId)
console.log('Branding:', JSON.stringify(branding, null, 2))
```

### Validation errors

Common issues:
- **Invalid email format:** Ensure email contains `@` and domain
- **Invalid hex color:** Must be 6-character hex code with `#`
- **Invalid URL:** Must be absolute URL or start with `/`

### Permission denied

**Error:** `Forbidden: Only organization admins can update branding`

**Solution:** User must have `org_admin` or `admin` role:
```sql
UPDATE users
SET role = 'org_admin'
WHERE id = 'user-uuid' AND organization_id = 'org-uuid';
```

---

## API Reference

### GET /api/organizations/:id/branding

**Authorization:** User must belong to org or be platform admin

**Response:**
```json
{
  "success": true,
  "data": {
    "company_name": "string",
    "tagline": "string",
    "colors": {
      "primary": "#xxxxxx",
      "secondary": "#xxxxxx",
      "accent": "#xxxxxx"
    },
    "logo": {
      "url": "string",
      "favicon_url": "string",
      "width": 200,
      "height": 50
    },
    "email": {
      "sender_name": "string",
      "sender_email": "string",
      "support_email": "string",
      "footer_text": "string"
    },
    "social": {
      "website": "string",
      "twitter": "string",
      "linkedin": "string"
    }
  }
}
```

### POST /api/organizations/:id/branding

**Authorization:** User must be org_admin or platform admin

**Request Body:**
```json
{
  "company_name": "Acme Corp",
  "colors": {
    "primary": "#ff6b35"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Branding updated successfully",
  "data": { /* full branding object */ }
}
```

**Validation Errors:**
```json
{
  "error": "Invalid branding configuration",
  "validation_errors": [
    "Invalid sender email address",
    "Invalid primary color format"
  ]
}
```

---

## Support

For questions or issues:
- **Documentation:** [WHITE_LABEL_IMPLEMENTATION_PLAN.md](WHITE_LABEL_IMPLEMENTATION_PLAN.md)
- **Code:** [services/branding.ts](services/branding.ts)
- **API:** [app/api/organizations/[id]/branding/route.ts](app/api/organizations/[id]/branding/route.ts)
