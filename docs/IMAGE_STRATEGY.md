# HumanGlue Image Strategy Document

## Brand Vision
HumanGlue bridges AI technology with human organizational dynamics. Our imagery should reflect **technology-forward, data-driven transformation** - NOT traditional consulting with sticky notes and whiteboards.

**Core Principles:**
- Modern, digital-first aesthetic
- AI/ML visualization and interfaces
- Data dashboards and analytics
- Clean, professional technology environments
- Human + AI collaboration (not just humans in meetings)

---

## Image Inventory & Specifications

### 1. HERO SECTION (Homepage)

**Location:** `components/templates/EnhancedHomepage.tsx`

| Asset | Current | Should Be |
|-------|---------|-----------|
| **Hero Video** | Abstract particles/motion | **AI neural network visualization**, data flowing through connected nodes, or abstract representation of organizational intelligence being mapped |
| **Hero Background (fallback)** | `/optimized/herobackground-*.webp` | Same concept as video - dark, sophisticated, tech-forward with subtle purple/blue gradients and data visualization elements |
| **Hero Logo** | `/HumnaGlue_logo_hero.png` | ✅ Keep as-is |

**Creative Direction for Hero:**
- Dark background with glowing data nodes/connections
- Subtle animation suggesting AI analysis in progress
- Colors: Deep purple (#8B5CF6), Electric blue (#3B82F6), Dark slate (#0F172A)
- NO stock photos of people - pure abstract tech visualization

---

### 2. SOLUTIONS PAGE IMAGES

**Location:** `app/solutions/page.tsx` (lines 56, 88, 120)

#### 2A. AI Assessment Tool Image
**Current:** `photo-1551288049-bebda4e38f71` (generic collaboration)

**Should Be:**
- AI-powered dashboard showing organizational health metrics
- Heat maps of employee sentiment across departments
- Predictive analytics graphs with trend lines
- Real-time data visualization with glowing nodes
- **Example concepts:**
  - Split screen: raw survey data on left → AI-processed insights on right
  - Organizational network map with highlighted connection strengths
  - Sentiment analysis visualization with NLP word clouds

**Alt Text:** "AI Assessment Dashboard showing organizational health metrics and predictive analytics"

#### 2B. Strategic Workshops Image
**Current:** `photo-1552664730-d307ca884978` (people with sticky notes)

**Should Be:**
- Modern conference room with large screens displaying data visualizations
- Participants looking at **digital dashboards** on screens, not paper
- Tablet/laptop screens showing collaborative assessment results
- **Key elements:**
  - Large wall-mounted display with organizational data
  - People interacting with digital tools, NOT post-its
  - Clean, modern meeting space with technology integration
  - Screen showing AI-generated insights being discussed

**Alt Text:** "Strategic workshop session with team analyzing AI-generated insights on digital displays"

#### 2C. Human Glue Toolbox Image
**Current:** `photo-1454165804606-c3d57bc86b40` (person at desk)

**Should Be:**
- Software interface showcase - the actual toolbox UI
- Grid of tool icons with clean, modern design
- Dashboard showing multiple integrated tools working together
- **Key elements:**
  - Clean UI/UX design aesthetic
  - Multiple tool categories visible
  - Progress tracking and implementation dashboards
  - Integration visualization (tools connecting to each other)

**Alt Text:** "Human Glue Toolbox interface showing 60+ organizational transformation tools"

---

### 3. TEAM/ABOUT IMAGES

**Location:** `components/templates/EnhancedHomepage.tsx` (lines 674-753)

| Asset | Current | Should Be |
|-------|---------|-----------|
| `professional-leader.jpg` | Generic stock | Real team member OR AI-generated professional with tech/consulting background aesthetic |
| `business-executive.jpg` | Generic stock | Real team member OR professional in modern tech office environment |
| `innovation-leader.jpg` | Generic stock | Real team member OR professional with visible tech elements (screens, devices) |
| `strategic-advisor.jpg` | Generic stock | Real team member OR professional in contemporary setting |

**Creative Direction for Team:**
- If using real photos: Professional headshots with consistent lighting/background
- If using generated/stock: Modern tech office environments, NOT traditional corporate
- Background options: Glass offices, modern workspaces with screens visible, clean gradient backdrops
- Diverse representation required

---

### 4. DYNAMIC BACKGROUND COMPONENT

**Location:** `components/DynamicBackground.tsx`

These backgrounds change based on assessment context. Each should feel **industry-appropriate but technology-forward**.

| Context | Current Unsplash | Should Be |
|---------|------------------|-----------|
| **Default** | Generic office | Modern tech workspace with screens/dashboards |
| **Technology** | `photo-1451187580459-43490279c0fa` | ✅ Good - keep futuristic tech aesthetic |
| **Healthcare** | `photo-1576091160399-112ba8d25d1d` | Medical facility with digital health monitoring screens |
| **Finance** | `photo-1454165804606-c3d57bc86b40` | Trading floor with multiple screens OR fintech dashboard |
| **Manufacturing** | `photo-1565043666747-69f6646db940` | Smart factory with IoT sensors and monitoring displays |
| **Retail** | `photo-1441986300917-64674bd600d8` | Modern retail analytics dashboard or smart store |
| **Analyzing** | `photo-1551288049-bebda4e38f71` | Data processing visualization, AI at work |
| **Presenting** | `photo-1531482615713-2afd69097998` | Modern presentation with digital displays (not projector slides) |
| **Welcoming** | `photo-1522071820081-009f0129c71c` | Modern team in tech environment |
| **Exploring** | `photo-1552664730-d307ca884978` | Replace: Digital collaboration, not sticky notes |

---

### 5. DASHBOARD/ADMIN IMAGES

**Location:** Various files in `app/dashboard/` and `app/admin/`

#### Course/Workshop Thumbnails (800x500px)
**Should Be:**
- Screenshots of actual course content/platform
- Abstract representations of course topics with data viz
- Modern illustration style (NOT stock photos of people in meetings)

#### Instructor/Expert Avatars (400x400px)
**Should Be:**
- Professional headshots
- Consistent style across all avatars
- Modern, clean backgrounds

#### Participant Avatars (100x100px)
**Should Be:**
- Default to stylized initials or abstract avatars
- Optional: Allow user uploads

---

### 6. PROCESS PAGE

**Location:** `app/process/page.tsx`

**Current:** `photo-1551288049-bebda4e38f71` (generic)

**Should Be:**
- Visual representation of the AI analysis process
- Data flow diagram aesthetic
- Steps shown as connected digital nodes
- Clean infographic style showing: Input → AI Processing → Insights → Action

---

## Image Generation Guidelines

### For AI-Generated Images (Midjourney/DALL-E/Gemini):

**Style Prompt Elements:**
```
--style: Modern, clean, professional, tech-forward
--colors: Deep purple (#8B5CF6), Electric blue (#3B82F6), Cyan accents, Dark backgrounds
--avoid: Clip art, cartoons, stock photo aesthetic, sticky notes, whiteboards, traditional office settings
--include: Screens, dashboards, data visualization, modern glass offices, subtle glow effects
```

**Example Prompts:**

1. **AI Assessment:**
   "Futuristic organizational health dashboard displayed on large curved monitor, showing heat maps, sentiment analysis graphs, and AI-powered insights, dark interface with purple and blue glowing elements, professional office setting, photorealistic, 8k"

2. **Strategic Workshop:**
   "Modern executive meeting room, diverse professionals gathered around table looking at wall-mounted 85-inch display showing organizational data visualization, tablets on table, no papers or sticky notes, glass walls, contemporary design, natural lighting, photorealistic"

3. **Toolbox Interface:**
   "Clean software dashboard UI design, grid of tool icons for organizational development, progress bars, integration flows, dark mode interface with purple accent colors, modern SaaS aesthetic, Figma/Dribbble quality"

---

## File Naming Convention

```
/public/images/
├── hero/
│   ├── hero-bg-desktop.webp
│   ├── hero-bg-tablet.webp
│   └── hero-bg-mobile.webp
├── solutions/
│   ├── ai-assessment-dashboard.webp
│   ├── strategic-workshop-digital.webp
│   └── toolbox-interface.webp
├── team/
│   ├── [name]-headshot.webp
│   └── ...
├── backgrounds/
│   ├── industry-healthcare.webp
│   ├── industry-finance.webp
│   ├── industry-tech.webp
│   └── ...
└── icons/
    └── ...
```

---

## Priority Order for Replacement

1. **HIGH PRIORITY** - Public-facing, brand-defining:
   - Solutions page images (ai-assessment, workshops, toolbox)
   - Hero video/background
   - Process page background

2. **MEDIUM PRIORITY** - Supporting brand:
   - Team photos (if not using real photos)
   - Dynamic background images
   - Dashboard thumbnails

3. **LOW PRIORITY** - Admin/internal:
   - Admin page placeholder images
   - User avatar defaults

---

## Technical Specifications

| Use Case | Format | Dimensions | Max Size |
|----------|--------|------------|----------|
| Hero Background | WebP + AVIF | 1920x1080 (desktop), 1280x720 (tablet), 640x360 (mobile) | 500KB |
| Solution Images | WebP | 2070x1380 (retina) | 300KB |
| Team Headshots | WebP | 800x800 | 100KB |
| Dashboard Thumbnails | WebP | 800x500 | 150KB |
| Background Images | WebP | 2560x1440 | 400KB |

---

## Summary: What We're Moving Away From

❌ **NO MORE:**
- Sticky notes and whiteboards
- Traditional meeting rooms with paper
- Generic corporate stock photos
- People pointing at flip charts
- Handwritten notes and markers

✅ **YES TO:**
- Digital dashboards and screens
- AI/data visualization
- Modern tech environments
- Clean, sophisticated interfaces
- Human + technology collaboration
