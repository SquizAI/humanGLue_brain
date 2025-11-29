# Phase 0: UX Foundation - Status Report

## 🎯 Goal
Increase conversion from 8.4% → 40.5% (4.8x improvement)

## ✅ What Already EXISTS

### Hooks (lib/hooks/)
- ✅ `useExitIntent.ts` - Exit intent detection with scroll depth tracking
- ✅ `useScrollTriggers.ts` - Scroll-based trigger system
- ✅ `useChatProgress.ts` - Chat progress saving and recovery
- ✅ `useDataEnrichment.ts` - Company data enrichment
- ✅ `usePermissions.ts` - Permission system

### Components
- ✅ `ExitIntentModal.tsx` - Exit intent modal with CTAs
- ✅ `LiveSocialProof.tsx` - Live social proof component
- ✅ `UnifiedChatSystem.tsx` - Chat system (may need updates)
- ✅ `EnhancedHomepage.tsx` - Homepage template
- ✅ `MobileHomePage.tsx` - Mobile homepage
- ✅ `Navigation.tsx` - Main navigation

### Utilities
- ✅ `lib/utils/personalization.ts` - Likely exists (need to verify)

---

## 🔧 What Needs INTEGRATION/UPDATES

### 1. Enhanced Homepage - Add Exit Intent & Scroll Triggers
**File:** `components/templates/EnhancedHomepage.tsx`

**Tasks:**
- [ ] Import and implement `useExitIntent` hook
- [ ] Import and implement `useScrollTriggers` hook
- [ ] Add `ExitIntentModal` component
- [ ] Add scroll-triggered notifications (25%, 50%, 75%, 100%)
- [ ] Enhanced hero CTAs (primary + secondary)

---

### 2. Mobile Homepage - Fix Tab Rotation + Add Triggers
**File:** `components/templates/MobileHomePage.tsx`

**Tasks:**
- [ ] Fix tab auto-rotation (stop on user interaction)
- [ ] Add time-of-day personalized CTAs
- [ ] Add mobile-optimized exit intent
- [ ] Integrate scroll triggers for mobile

---

### 3. Navigation - Smart Hide/Show on Scroll
**File:** `components/organisms/Navigation.tsx`

**Tasks:**
- [ ] Implement scroll direction detection
- [ ] Hide navbar on scroll down
- [ ] Show navbar on scroll up
- [ ] Add smooth transitions

---

### 4. Chat System - Auto-Start & Progress Saving
**File:** `components/templates/UnifiedChatSystem.tsx`

**Tasks:**
- [ ] Integrate `useChatProgress` for auto-save
- [ ] Add smart auto-start logic (engagement-based timing)
- [ ] Add context-aware greetings (referral source, time-of-day)
- [ ] Add chat discovery prompt component
- [ ] Recovery prompt for abandoned chats

---

### 5. Create ChatPrompt Component
**File:** `components/molecules/ChatPrompt.tsx` (MISSING)

**Tasks:**
- [ ] Create pulsing animation component
- [ ] Add contextual tooltip
- [ ] Auto-dismiss after 8 seconds
- [ ] Track "has seen chat" state

---

### 6. Data Enrichment API
**File:** `netlify/functions/enrich-company.ts` (MISSING)

**Tasks:**
- [ ] Create Netlify Function for company enrichment
- [ ] Integrate with Clearbit or similar API
- [ ] Email domain → company lookup
- [ ] Return company name, industry, size
- [ ] Fallback to manual entry

---

### 7. Personalization Utility
**File:** `lib/utils/personalization.ts`

**Tasks:**
- [ ] Verify file exists
- [ ] Add referral source detection
- [ ] Add time-of-day logic
- [ ] Add returning visitor recognition
- [ ] Add quick action suggestions

---

## 🚀 PRIORITY ORDER

### Week 1 (High Priority)
1. **Exit Intent Integration** - Add to EnhancedHomepage
2. **Scroll Triggers Integration** - Add notifications at 25%/50%/75%/100%
3. **Hero CTA Enhancement** - Primary + secondary CTAs
4. **Mobile Tab Fix** - Stop rotation on interaction

### Week 2 (Medium Priority)
5. **Chat Auto-Start** - Smart timing based on engagement
6. **Chat Progress Saving** - Auto-save + recovery
7. **Smart Navigation** - Hide/show on scroll
8. **ChatPrompt Component** - Discovery animation

### As Needed (Low Priority)
9. **Data Enrichment API** - Company lookup (requires API key)
10. **Personalization** - Time-of-day, referral source

---

## 📝 NOTES

**Good News:**
- Most infrastructure already exists from previous work
- Hooks are well-implemented with smart logic
- Components have good UX patterns
- Just need integration, not creation

**Next Steps:**
1. Start with EnhancedHomepage integration
2. Test conversion impact
3. Move to mobile optimization
4. Iterate based on analytics

---

## 📊 Success Metrics

Track these after implementation:
- Exit-intent modal conversion rate
- Scroll depth before engagement
- Chat auto-start acceptance rate
- Chat completion rate (with progress saving)
- Overall conversion: 8.4% → 40.5%

---

**Last Updated:** 2025-01-28
**Branch:** `feature/phase-0-ux-foundation`
