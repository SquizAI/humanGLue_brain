# Workshop Catalog Quick Reference

## Key Files & Their Purpose

### Data Layer
**`/lib/data/mock-workshops.ts`**
- Contains 15 realistic workshop entries
- Helper functions: `getWorkshopById()`, `getWorkshopsByPillar()`, `getWorkshopsByLevel()`, `searchWorkshops()`
- Ready to be replaced with database calls

### Pages
**`/app/workshops/page.tsx`**
- Main catalog entry point
- Server Component with SEO metadata
- Renders `<WorkshopsCatalog />`

**`/app/workshops/[id]/page.tsx`**
- Individual workshop details
- Dynamic route with static generation
- Renders `<WorkshopDetail />`

**`/app/workshops/[id]/register/page.tsx`**
- Registration/checkout flow
- Renders `<WorkshopRegistration />`

### Components
**`/components/workshops/WorkshopsCatalog.tsx`** (Client Component)
- Search input with real-time filtering
- Pillar filters (adaptability, coaching, marketplace)
- Level filters (beginner, intermediate, advanced)
- Grid/List view toggle
- Featured workshop display
- Responsive filter panel for mobile

**`/components/workshops/WorkshopDetail.tsx`** (Client Component)
- Workshop hero section
- Instructor card
- Schedule information
- Learning outcomes
- Share & bookmark functionality
- Sticky registration sidebar
- Related workshops section

**`/components/workshops/WorkshopRegistration.tsx`** (Client Component)
- Multi-step form (Personal Details → Payment)
- Form validation with real-time feedback
- Order summary sidebar
- Success confirmation screen
- Demo payment processing

**`/components/workshops/WorkshopCard.tsx`** (Client Component - Existing)
- Reusable workshop card
- Used in catalog and related workshops
- Pillar-specific styling
- Capacity warnings and sold-out states

## Workshop Data Structure

```typescript
interface Workshop {
  id: string                    // Unique identifier
  title: string                 // Workshop title
  description: string           // Brief description
  instructor: {
    name: string
    title: string
    avatar: string
  }
  schedule: {
    date: string               // "Nov 15, 2025"
    time: string               // "10:00 AM PST"
    duration: string           // "2 hours"
  }
  format: 'live' | 'hybrid' | 'recorded'
  capacity: {
    total: number
    remaining: number
  }
  price: {
    amount: number
    earlyBird?: number
  }
  outcomes: string[]           // Learning outcomes
  pillar: 'adaptability' | 'coaching' | 'marketplace'
  level: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]              // Topic tags
}
```

## URLs & Routes

```
/workshops                                    → Catalog page
/workshops?search=AI                          → Filtered by search
/workshops?pillar=adaptability                → Filtered by pillar
/workshops?level=beginner                     → Filtered by level
/workshops?search=AI&pillar=coaching          → Combined filters

/workshops/adapt-101                          → Workshop detail
/workshops/adapt-101/register                 → Registration form
```

## Testing Identifiers

```typescript
// Catalog
data-testid="workshop-search"              // Search input
data-testid="filter-toggle"                // Mobile filter toggle
data-testid="filter-pillar-all"            // Pillar filter: All
data-testid="filter-pillar-adaptability"   // Pillar filter: Adaptability
data-testid="filter-pillar-coaching"       // Pillar filter: Coaching
data-testid="filter-pillar-marketplace"    // Pillar filter: Marketplace
data-testid="filter-level-all"             // Level filter: All
data-testid="filter-level-beginner"        // Level filter: Beginner
data-testid="filter-level-intermediate"    // Level filter: Intermediate
data-testid="filter-level-advanced"        // Level filter: Advanced
data-testid="view-grid"                    // Grid view button
data-testid="view-list"                    // List view button
data-testid="clear-filters"                // Clear filters button
data-testid="workshops-grid"               // Workshop grid container

// Detail Page
data-testid="back-to-catalog"              // Back navigation
data-testid="share-button"                 // Share button
data-testid="bookmark-button"              // Bookmark button
data-testid="register-button"              // Main CTA

// Registration
data-testid="back-to-workshop"             // Back navigation
data-testid="first-name"                   // First name input
data-testid="last-name"                    // Last name input
data-testid="email"                        // Email input
data-testid="phone"                        // Phone input
data-testid="company"                      // Company input
data-testid="job-title"                    // Job title input
data-testid="hear-about"                   // How did you hear dropdown
data-testid="special-requirements"         // Special requirements textarea
data-testid="newsletter"                   // Newsletter checkbox
data-testid="card-number"                  // Card number input
data-testid="expiry-date"                  // Expiry date input
data-testid="cvv"                          // CVV input
data-testid="billing-zip"                  // Billing ZIP input
data-testid="next-step"                    // Next step button
data-testid="prev-step"                    // Previous step button
data-testid="submit-payment"               // Submit button
```

## Color System (Three Pillars)

```typescript
// Adaptability (Blue)
gradient: 'from-blue-500 to-blue-600'
badgeBg: 'bg-blue-500/10'
badgeBorder: 'border-blue-500/20'
badgeText: 'text-blue-300'

// Coaching (Amber/Orange)
gradient: 'from-amber-500 to-orange-600'
badgeBg: 'bg-amber-500/10'
badgeBorder: 'border-amber-500/20'
badgeText: 'text-amber-300'

// Marketplace (Purple)
gradient: 'from-purple-500 to-purple-600'
badgeBg: 'bg-purple-500/10'
badgeBorder: 'border-purple-500/20'
badgeText: 'text-purple-300'
```

## Key Functions

```typescript
// Get all workshops
import { mockWorkshops } from '@/lib/data/mock-workshops'

// Get specific workshop
import { getWorkshopById } from '@/lib/data/mock-workshops'
const workshop = getWorkshopById('adapt-101')

// Filter by pillar
import { getWorkshopsByPillar } from '@/lib/data/mock-workshops'
const adaptabilityWorkshops = getWorkshopsByPillar('adaptability')

// Filter by level
import { getWorkshopsByLevel } from '@/lib/data/mock-workshops'
const beginnerWorkshops = getWorkshopsByLevel('beginner')

// Search workshops
import { searchWorkshops } from '@/lib/data/mock-workshops'
const results = searchWorkshops('AI')
```

## Sample Workshops (IDs for Testing)

```typescript
// Adaptability
'adapt-101'         // Beginner - AI Adaptability Fundamentals
'adapt-201'         // Intermediate - Leading AI-Driven Teams
'adapt-301'         // Advanced - AI Strategy & Organizational Design
'adapt-skill-building'  // Intermediate - AI Skills for Non-Technical Leaders

// Coaching
'coach-101'         // Beginner - Foundations of AI-Era Coaching
'coach-102'         // Beginner - Building High-Performance Coaching Cultures (FEATURED)
'coach-201'         // Intermediate - Advanced Coaching Techniques (SOLD OUT)
'coach-assessment'  // Intermediate - AI-Powered Assessment & Coaching
'coach-emotional-intelligence'  // Intermediate - Emotional Intelligence

// Marketplace
'market-101'        // Beginner - Personal Branding in the AI Economy
'market-201'        // Intermediate - Talent Marketplace Mastery
'market-301'        // Advanced - Building Internal Talent Marketplaces
'market-skills-portfolio'  // Beginner - Building Your Skills Portfolio
'market-future-skills'     // Beginner - Future-Proofing Your Career

// Cross-Pillar
'transform-101'     // Beginner - The Complete AI Transformation Journey
```

## Common Customizations

**To add a new workshop:**
1. Add to `mockWorkshops` array in `/lib/data/mock-workshops.ts`
2. Follow the Workshop interface structure
3. Include all required fields

**To change filter options:**
- Modify the filter buttons in `WorkshopsCatalog.tsx`
- Update TypeScript types if adding new categories

**To customize the registration flow:**
- Edit steps in `WorkshopRegistration.tsx`
- Update FormData interface for new fields
- Add validation in `validateStep()` function

**To integrate with a real database:**
- Replace `mockWorkshops` import with API call
- Update `getWorkshopById` to fetch from database
- Add mutation handlers in registration component
