# White-Label Platform UI - Developer Guide

## Overview

Phase 4 of the white-label implementation adds **dynamic platform UI theming** based on organization branding. When users log in, the platform automatically:

- ✅ Loads their organization's branding
- ✅ Injects CSS variables for colors
- ✅ Updates favicon dynamically
- ✅ Updates page title with organization name
- ✅ Makes branding available to all components

---

## How It Works

### Architecture

```
User Logs In
     ↓
ChatContext detects organizationId
     ↓
BrandingInjector auto-loads branding
     ↓
useBrandingStyles() injects CSS variables
     ↓
All components can now use:
  - CSS variables (--color-primary, etc.)
  - Tailwind classes (bg-org-primary, text-org-secondary)
  - useBranding() hook for logo URLs, company name, etc.
```

### Files Created

1. **[lib/hooks/useBrandingStyles.ts](lib/hooks/useBrandingStyles.ts)** - CSS variable injection hook
2. **[components/BrandingInjector.tsx](components/BrandingInjector.tsx)** - Auto-loading and injection component
3. Updated **[components/Providers.tsx](components/Providers.tsx)** - Added BrandingProvider and BrandingInjector
4. Updated **[tailwind.config.ts](tailwind.config.ts)** - Added dynamic color classes

---

## Using Dynamic Colors in Your Components

### Method 1: Tailwind Classes (Recommended)

Use the new `org-primary`, `org-secondary`, and `org-accent` color classes:

```tsx
// Button with organization primary color
<button className="bg-org-primary text-white hover:bg-org-primary/90">
  Get Started
</button>

// Card with organization secondary color accent
<div className="border-l-4 border-org-secondary bg-white/5">
  <h3 className="text-org-secondary">Featured Content</h3>
</div>

// Badge with organization accent color
<span className="bg-org-accent/20 text-org-accent px-3 py-1 rounded-full">
  New
</span>
```

### Method 2: CSS Variables (For Custom Styles)

Access the injected CSS variables directly:

```tsx
<div
  style={{
    background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
    color: 'white'
  }}
>
  Dynamic Gradient Background
</div>

// With RGB for transparency
<div
  style={{
    backgroundColor: `rgba(var(--color-primary-rgb), 0.1)`,
    borderColor: `var(--color-primary)`
  }}
>
  Transparent background with solid border
</div>
```

Available CSS variables:
- `--color-primary` - Primary brand color (hex)
- `--color-secondary` - Secondary brand color (hex)
- `--color-accent` - Accent brand color (hex)
- `--color-primary-rgb` - Primary color as RGB (e.g., "59, 130, 246")
- `--color-secondary-rgb` - Secondary color as RGB
- `--color-accent-rgb` - Accent color as RGB

### Method 3: useBranding Hook (For Complex Logic)

Access branding data programmatically in your components:

```tsx
import { useBranding } from '@/lib/contexts/BrandingContext'

export function MyComponent() {
  const { branding, isLoading } = useBranding()

  if (isLoading) {
    return <div>Loading branding...</div>
  }

  return (
    <div>
      {/* Display organization logo */}
      <img
        src={branding?.logo?.url || '/default-logo.png'}
        alt={branding?.company_name || 'Company'}
        style={{
          width: branding?.logo?.width || 200,
          height: branding?.logo?.height || 60
        }}
      />

      {/* Use company name */}
      <h1>{branding?.company_name}'s Dashboard</h1>

      {/* Dynamic color-coded sections */}
      <div style={{ backgroundColor: branding?.colors.primary }}>
        Primary Section
      </div>
    </div>
  )
}
```

---

## Real-World Examples

### Example 1: Dashboard Header

```tsx
'use client'

import { useBranding } from '@/lib/contexts/BrandingContext'

export function DashboardHeader() {
  const { branding, isLoading } = useBranding()

  return (
    <header className="bg-white/5 backdrop-blur-xl border-b border-org-primary/20">
      <div className="flex items-center gap-4 px-6 py-4">
        {/* Organization logo */}
        {!isLoading && branding?.logo?.url && (
          <img
            src={branding.logo.url}
            alt={branding.company_name}
            className="h-10 w-auto"
          />
        )}

        {/* Company name with dynamic color */}
        <h1 className="text-2xl font-bold text-org-primary">
          {branding?.company_name || 'HumanGlue'}
        </h1>
      </div>
    </header>
  )
}
```

### Example 2: Call-to-Action Button

```tsx
export function CTAButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="
      px-6 py-3 rounded-xl font-semibold
      bg-gradient-to-r from-org-primary to-org-secondary
      hover:from-org-primary/90 hover:to-org-secondary/90
      text-white shadow-lg hover:shadow-xl
      transition-all
    ">
      {children}
    </button>
  )
}
```

### Example 3: Status Badge

```tsx
type BadgeProps = {
  variant: 'primary' | 'secondary' | 'accent'
  children: React.ReactNode
}

export function StatusBadge({ variant, children }: BadgeProps) {
  const colorClass = {
    primary: 'bg-org-primary/20 text-org-primary border-org-primary/30',
    secondary: 'bg-org-secondary/20 text-org-secondary border-org-secondary/30',
    accent: 'bg-org-accent/20 text-org-accent border-org-accent/30'
  }[variant]

  return (
    <span className={`px-3 py-1 rounded-full border text-sm font-semibold ${colorClass}`}>
      {children}
    </span>
  )
}
```

### Example 4: Branded Card

```tsx
export function BrandedCard({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="
      bg-white/5 backdrop-blur-xl
      border-l-4 border-org-primary
      rounded-xl p-6
      hover:bg-white/10 transition-all
    ">
      <h3 className="text-xl font-bold text-org-primary mb-4">
        {title}
      </h3>
      <div className="text-gray-300">
        {children}
      </div>
    </div>
  )
}
```

---

## When to Use Each Color

### `org-primary` (Primary Brand Color)
**Use for:**
- Main action buttons
- Primary navigation highlights
- Section headers
- Key branding elements
- Links and interactive elements

**Examples:**
```tsx
<button className="bg-org-primary">Primary Action</button>
<h1 className="text-org-primary">Section Title</h1>
<a className="text-org-primary hover:underline">Learn More</a>
```

### `org-secondary` (Secondary Brand Color)
**Use for:**
- Secondary actions
- Accents and highlights
- Gradients with primary
- Alternative sections
- Supporting UI elements

**Examples:**
```tsx
<button className="bg-org-secondary">Secondary Action</button>
<div className="bg-gradient-to-r from-org-primary to-org-secondary">
  Gradient Banner
</div>
```

### `org-accent` (Accent Color)
**Use for:**
- Success states
- Badges and tags
- Highlights and notifications
- Call-out sections
- Micro-interactions

**Examples:**
```tsx
<span className="bg-org-accent/20 text-org-accent">New Feature</span>
<div className="border-org-accent">Featured Item</div>
```

---

## Automatic Features

### 1. Favicon Updates
The favicon automatically updates when organization branding is loaded:

```typescript
// No action needed - automatic!
// BrandingInjector handles this
```

Organization must configure `branding.logo.favicon_url` in admin settings.

### 2. Page Title Updates
Page titles automatically update with organization name:

```typescript
// Before: "Dashboard | Human Glue"
// After:  "Dashboard | Acme Corp"
```

This happens automatically when branding loads.

### 3. Auto-Loading on Login
Branding automatically loads when a user logs in:

```typescript
// No action needed - automatic!
// BrandingInjector detects user's organizationId and loads branding
```

---

## Testing Your White-Label Components

### 1. Test with Different Organizations

```typescript
// In your component or dev environment:
import { useBranding } from '@/lib/contexts/BrandingContext'

export function TestComponent() {
  const { loadBranding } = useBranding()

  return (
    <div>
      <button onClick={() => loadBranding('org-1')}>Load Org 1</button>
      <button onClick={() => loadBranding('org-2')}>Load Org 2</button>
      {/* Your component here */}
    </div>
  )
}
```

### 2. Test Fallback Behavior

Ensure your components work when branding is not configured:

```tsx
const { branding } = useBranding()

// Always provide fallbacks
<img
  src={branding?.logo?.url || '/default-logo.png'}
  alt={branding?.company_name || 'Company'}
/>
```

### 3. Test Loading States

```tsx
const { branding, isLoading } = useBranding()

if (isLoading) {
  return <div>Loading...</div>
}

return <div>{/* Your component */}</div>
```

---

## Migration Guide

### Migrating Existing Components

**Before (Hard-coded colors):**
```tsx
<button className="bg-blue-500 text-white">
  Click Me
</button>
```

**After (Dynamic branding):**
```tsx
<button className="bg-org-primary text-white">
  Click Me
</button>
```

**Before (Hard-coded logo):**
```tsx
<img src="/HumanGlue_logo.png" alt="HumanGlue" />
```

**After (Dynamic logo):**
```tsx
import { useBranding } from '@/lib/contexts/BrandingContext'

const { branding } = useBranding()

<img
  src={branding?.logo?.url || '/HumanGlue_logo.png'}
  alt={branding?.company_name || 'HumanGlue'}
/>
```

---

## Best Practices

### ✅ Do

- Use `org-primary`, `org-secondary`, `org-accent` Tailwind classes for consistency
- Always provide fallback values when accessing branding data
- Check `isLoading` before rendering branding-dependent UI
- Use CSS variables for gradients and complex styles
- Test your components with multiple organizations
- Use semantic color names (primary for main actions, secondary for supporting)

### ❌ Don't

- Don't hard-code "HumanGlue" or specific brand colors in components
- Don't assume branding is always loaded (check `isLoading`)
- Don't forget fallback values (`|| defaultValue`)
- Don't override branding colors with hard-coded values
- Don't call `loadBranding()` multiple times unnecessarily (it's cached)

---

## Troubleshooting

### Colors not updating?

1. Check browser console for CSS variable values:
   ```javascript
   getComputedStyle(document.documentElement).getPropertyValue('--color-primary')
   ```

2. Verify branding is loaded:
   ```tsx
   const { branding, isLoading, error } = useBranding()
   console.log({ branding, isLoading, error })
   ```

3. Check that user has an organizationId:
   ```tsx
   const { userData } = useChat()
   console.log('Organization ID:', userData?.organizationId)
   ```

### Favicon not changing?

1. Verify `branding.logo.favicon_url` is set in organization settings
2. Check browser console for BrandingInjector logs
3. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+F5)
4. Clear browser cache

### Branding not loading automatically?

1. Ensure user is logged in and has `organizationId`
2. Check that BrandingInjector is in the provider tree
3. Verify API route `/api/organizations/[id]/branding` is accessible
4. Check network tab for failed requests

---

## Performance Notes

- **CSS Variables**: Injected once on load, minimal performance impact
- **Branding API Call**: Cached per organization, won't re-fetch unnecessarily
- **useBranding() Hook**: Uses React Context, no prop drilling needed
- **Automatic Loading**: Only happens once per session

---

## Support

For questions or issues:
1. Check [WHITE_LABEL_USAGE_GUIDE.md](WHITE_LABEL_USAGE_GUIDE.md) for API reference
2. Review [WHITE_LABEL_README.md](WHITE_LABEL_README.md) for quick start
3. See [components/BrandingInjector.tsx](components/BrandingInjector.tsx) for implementation details

---

**Last Updated:** 2025-01-28
**Phase:** 4 (Platform UI White-Labeling) ✅ Complete
