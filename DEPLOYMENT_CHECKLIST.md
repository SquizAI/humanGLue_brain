# HumanGlue Platform - Deployment Checklist & Production Readiness Guide

Comprehensive checklist for deploying the HumanGlue platform to production on Netlify.

> Last Updated: October 4, 2025
> Version: 1.0.0
> Status: Production Ready

## Table of Contents

1. [Pre-Deployment Security Checklist](#1-pre-deployment-security-checklist)
2. [Environment Variables Setup](#2-environment-variables-setup)
3. [Database Setup](#3-database-setup)
4. [Netlify Configuration](#4-netlify-configuration)
5. [Domain & DNS](#5-domain--dns)
6. [Testing Checklist](#6-testing-checklist)
7. [Performance Optimization](#7-performance-optimization)
8. [Monitoring Setup](#8-monitoring-setup)
9. [Post-Deployment Verification](#9-post-deployment-verification)
10. [Rollback Plan](#10-rollback-plan)
11. [Ongoing Maintenance](#11-ongoing-maintenance)

---

## 1. Pre-Deployment Security Checklist

### Critical Security Checks

- [ ] **All API keys rotated and replaced**
  - [ ] Generate new production API keys for all services
  - [ ] Replace all development/test keys with production keys
  - [ ] Document key rotation schedule (every 90 days)
  - [ ] Store old keys in secure vault for 30 days before deletion

- [ ] **.env.local in .gitignore**
  - [ ] Verify `.env.local` is in `.gitignore`
  - [ ] Verify `.env*.local` is in `.gitignore`
  - [ ] Run: `git check-ignore .env.local` to confirm
  - [ ] Search repository history: `git log --all --full-history -- .env.local`
  - [ ] If exposed, rotate ALL secrets immediately

- [ ] **No secrets in frontend code**
  - [ ] Search for hardcoded API keys: `grep -r "sk_live" app/`
  - [ ] Search for hardcoded tokens: `grep -r "eyJ" app/`
  - [ ] Verify only `NEXT_PUBLIC_*` variables used in client code
  - [ ] Review all API route handlers for secret exposure
  - [ ] Run security audit: `npm audit --production`

- [ ] **Supabase RLS policies enabled**
  - [ ] Verify RLS enabled on all tables (see [Database Setup](#3-database-setup))
  - [ ] Test policies with different user roles
  - [ ] Verify service role key usage is server-side only
  - [ ] Test unauthenticated access returns 403
  - [ ] Document RLS policies in `supabase/SCHEMA.md`

- [ ] **Authentication middleware configured**
  - [ ] Verify `middleware.ts` protects all `/dashboard/*` routes
  - [ ] Verify `middleware.ts` protects all `/admin/*` routes
  - [ ] Test redirect to login when unauthenticated
  - [ ] Test admin role enforcement for `/admin/*`
  - [ ] Verify session refresh works correctly

- [ ] **CORS settings configured**
  - [ ] Review CORS_ALLOWED_ORIGINS in environment variables
  - [ ] Verify production domain in allowed origins
  - [ ] Test CORS headers in API responses
  - [ ] Verify preflight OPTIONS requests work
  - [ ] Remove development origins from production

- [ ] **Rate limiting enabled**
  - [ ] Verify Upstash Redis credentials configured
  - [ ] Test rate limiting on public endpoints
  - [ ] Verify rate limit headers in responses
  - [ ] Document rate limits in API documentation
  - [ ] Configure monitoring for rate limit hits

### Additional Security Measures

- [ ] **Security headers configured**
  - [ ] Verify `netlify.toml` includes all security headers
  - [ ] Test CSP policy doesn't break functionality
  - [ ] Verify HSTS header is set
  - [ ] Test X-Frame-Options prevents clickjacking
  - [ ] Run security headers check: https://securityheaders.com

- [ ] **Dependency security**
  - [ ] Run `npm audit` and fix all high/critical issues
  - [ ] Update all dependencies to latest secure versions
  - [ ] Review `package-lock.json` for known vulnerabilities
  - [ ] Configure Dependabot or Renovate for auto-updates
  - [ ] Document dependency update schedule

- [ ] **API endpoint protection**
  - [ ] All API routes have authentication checks
  - [ ] All API routes have input validation
  - [ ] All API routes have rate limiting
  - [ ] All API routes return proper error codes
  - [ ] API routes don't expose sensitive data

- [ ] **Code security review**
  - [ ] No SQL injection vulnerabilities (using Supabase queries)
  - [ ] No XSS vulnerabilities (React auto-escaping verified)
  - [ ] No CSRF vulnerabilities (SameSite cookies)
  - [ ] File upload validation (if applicable)
  - [ ] Proper error handling (no stack traces in production)

---

## 2. Environment Variables Setup

### Overview

The HumanGlue platform requires environment variables in three locations:
1. **Local Development**: `.env.local` file
2. **Netlify Production**: Netlify Dashboard > Site Settings > Environment Variables
3. **GitHub Actions**: Repository Secrets (for CI/CD)

### Critical Variables (Required for Basic Functionality)

#### Supabase Configuration

```bash
# Project URL - Safe to expose to client
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Anonymous Public Key - Safe to expose to client (RLS protected)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# Service Role Key - SERVER-SIDE ONLY, NEVER EXPOSE TO CLIENT
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Storage URL (optional, derived from SUPABASE_URL)
NEXT_PUBLIC_SUPABASE_STORAGE_URL=https://your-project.supabase.co/storage/v1
```

**Setup Instructions:**
1. Go to https://app.supabase.com/project/_/settings/api
2. Copy Project URL to `NEXT_PUBLIC_SUPABASE_URL`
3. Copy anon/public key to `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy service_role key to `SUPABASE_SERVICE_ROLE_KEY`

**Security Notes:**
- Service role key bypasses RLS - use only in server-side code
- Never log or expose service role key
- Rotate keys every 90 days

#### Application Configuration

```bash
# Environment type
NEXT_PUBLIC_ENV=production
NODE_ENV=production

# Site URL - Update for each environment
NEXT_PUBLIC_SITE_URL=https://humanglue.ai

# Application name
NEXT_PUBLIC_APP_NAME=HumanGlue
```

### Payment Processing (Stripe)

```bash
# Publishable Key - Safe to expose to client
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Secret Key - SERVER-SIDE ONLY
STRIPE_SECRET_KEY=sk_live_...

# Webhook Secret - For Stripe webhook signature verification
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Setup Instructions:**
1. Go to https://dashboard.stripe.com/apikeys
2. Use **live keys** for production (pk_live_*, sk_live_*)
3. Use **test keys** for development (pk_test_*, sk_test_*)
4. Create webhook at https://dashboard.stripe.com/webhooks
   - Endpoint: `https://humanglue.ai/.netlify/functions/webhook-stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### Rate Limiting & Caching (Upstash Redis)

```bash
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=AYA...
```

**Setup Instructions:**
1. Go to https://console.upstash.com
2. Create new Redis database
3. Select region closest to Netlify deployment
4. Copy REST URL and token

**Rate Limit Configuration:**

```bash
# Strict tier (public endpoints, no auth)
RATE_LIMIT_STRICT_MAX=10
RATE_LIMIT_STRICT_WINDOW=10s

# Standard tier (authenticated endpoints)
RATE_LIMIT_STANDARD_MAX=30
RATE_LIMIT_STANDARD_WINDOW=1m

# Lenient tier (premium users)
RATE_LIMIT_LENIENT_MAX=100
RATE_LIMIT_LENIENT_WINDOW=1m
```

### AI Provider API Keys

At least one AI provider required. Recommended: Configure all three for redundancy.

```bash
# Google AI (Gemini) - Best for multimodal, cost-effective
# Get from: https://makersuite.google.com/app/apikey
GOOGLE_AI_API_KEY=your-google-ai-api-key

# OpenAI (GPT-4) - Industry standard, reliable
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-...

# Anthropic (Claude) - Best for long-context, reasoning
# Get from: https://console.anthropic.com/api-keys
ANTHROPIC_API_KEY=sk-ant-...
```

**Setup Instructions:**
1. Create accounts with each provider
2. Generate API keys
3. Set up billing and usage limits
4. Monitor usage to prevent unexpected costs

### Email Service Configuration

```bash
# Resend (Recommended)
# Get from: https://resend.com/api-keys
RESEND_API_KEY=re_...

# Alternative: SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@humanglue.ai
SMTP_FROM_NAME=HumanGlue
```

### Error Tracking & Monitoring (Optional but Highly Recommended)

```bash
# Sentry - Error Tracking
# Get from: https://sentry.io
NEXT_PUBLIC_SENTRY_DSN=https://...@o....ingest.sentry.io/...
SENTRY_AUTH_TOKEN=sntrys_...
SENTRY_ORG=your-org
SENTRY_PROJECT=humanglue
SENTRY_ENVIRONMENT=production

# Google Analytics 4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# PostHog (Product Analytics)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### CORS Configuration

```bash
# Comma-separated list of allowed origins
CORS_ALLOWED_ORIGINS=https://humanglue.ai,https://www.humanglue.ai
```

### Feature Flags

```bash
# Core features
NEXT_PUBLIC_ENABLE_WORKSHOPS=true
NEXT_PUBLIC_ENABLE_ASSESSMENTS=true
NEXT_PUBLIC_ENABLE_TALENT_MARKETPLACE=true
NEXT_PUBLIC_ENABLE_PAYMENTS=true

# Optional features
NEXT_PUBLIC_ENABLE_VOICE_INPUT=false
NEXT_PUBLIC_ENABLE_AI_ASSISTANT=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ERROR_TRACKING=true
```

### Environment-Specific Setup

#### Development (.env.local)

```bash
cp .env.example .env.local
# Edit .env.local with development credentials
# Use test API keys (Stripe test mode, etc.)
```

#### Production (Netlify Dashboard)

**Via Netlify Dashboard:**
1. Go to: Site Settings > Environment Variables
2. Click "Add a variable"
3. Set key and value
4. Select "Same value for all deploy contexts" or set per-context

**Via Netlify CLI:**

```bash
# Login to Netlify
netlify login

# Link to your site
netlify link

# Set individual variables
netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://your-project.supabase.co"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "eyJhbGci..." --context production

# Import from file (create .env.production first)
netlify env:import .env.production --context production

# Verify variables
netlify env:list --context production
```

**GitHub Actions (Repository Secrets):**

1. Go to: Repository Settings > Secrets and variables > Actions
2. Click "New repository secret"
3. Required secrets:
   ```
   NETLIFY_AUTH_TOKEN
   NETLIFY_SITE_ID
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   ```

### Environment Variables Checklist

- [ ] All required Supabase variables set
- [ ] Production site URL configured correctly
- [ ] Stripe live keys configured (not test keys)
- [ ] Stripe webhook secret configured
- [ ] Upstash Redis credentials set
- [ ] At least one AI provider configured
- [ ] Email service configured and tested
- [ ] Sentry DSN configured (if using)
- [ ] Google Analytics ID configured (if using)
- [ ] CORS origins include production domain only
- [ ] Rate limiting configuration set
- [ ] Feature flags configured appropriately
- [ ] All `NEXT_PUBLIC_*` variables safe to expose
- [ ] No development/test credentials in production
- [ ] Environment variables documented
- [ ] Backup of environment variables stored securely

---

## 3. Database Setup

### Supabase Project Setup

- [ ] **Create Supabase Project**
  - [ ] Go to https://app.supabase.com
  - [ ] Create new project
  - [ ] Choose region closest to users
  - [ ] Use strong database password
  - [ ] Store credentials in password manager

- [ ] **Configure Project Settings**
  - [ ] Enable email confirmations (if required)
  - [ ] Configure email templates
  - [ ] Set up custom SMTP (optional)
  - [ ] Configure OAuth providers (if needed)
  - [ ] Enable/disable anonymous sign-ins

### Run Database Migrations

The platform includes comprehensive database migrations in `/supabase/migrations/`.

**Migration Files:**
1. `001_create_users_and_roles.sql` - User system and RBAC
2. `002_create_workshops.sql` - Workshop management
3. `003_create_assessments.sql` - Assessment system
4. `004_create_talent_and_engagements.sql` - Talent marketplace
5. `005_create_payments_certificates_reviews.sql` - Commerce features
6. `001_multi_tenant_schema.sql` - Multi-tenant support (if needed)

**Run Migrations:**

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run all migrations
supabase db push

# Verify migrations
supabase migration list
```

**Alternative: SQL Editor in Supabase Dashboard**

1. Go to Supabase Dashboard > SQL Editor
2. Copy contents of each migration file
3. Run migrations in order
4. Verify tables created successfully

### Database Setup Checklist

- [ ] **Tables Created**
  - [ ] `users` table
  - [ ] `user_roles` table with RLS policies
  - [ ] `workshops` table with RLS policies
  - [ ] `workshop_registrations` table
  - [ ] `assessments` table
  - [ ] `assessment_responses` table
  - [ ] `talent_profiles` table
  - [ ] `engagements` table
  - [ ] `payments` table
  - [ ] `certificates` table
  - [ ] `reviews` table

- [ ] **Verify Row Level Security (RLS)**
  - [ ] RLS enabled on ALL tables
  - [ ] Test user can only see their own data
  - [ ] Test admin can see all data
  - [ ] Test unauthenticated users see nothing
  - [ ] Document RLS policies

- [ ] **Create Storage Buckets**
  - [ ] Create `avatars` bucket for user profile pictures
  - [ ] Create `certificates` bucket for generated certificates
  - [ ] Create `uploads` bucket for user file uploads (if needed)
  - [ ] Configure storage policies for each bucket
  - [ ] Set appropriate file size limits
  - [ ] Configure allowed file types

- [ ] **Storage Policies**
  ```sql
  -- Avatar bucket: Users can upload their own avatar
  CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

  -- Avatar bucket: Anyone can view avatars
  CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

  -- Certificates bucket: Authenticated users can view own certificates
  CREATE POLICY "Users can view own certificates"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);
  ```

- [ ] **Seed Initial Data (if needed)**
  - [ ] Run `supabase/seed.sql` for development data
  - [ ] Create initial admin user
  - [ ] Import workshop catalog (if applicable)
  - [ ] Import talent profiles (if applicable)
  - [ ] Verify seeded data via SQL Editor

- [ ] **Database Indexes**
  - [ ] Verify indexes on frequently queried columns
  - [ ] Add composite indexes for common queries
  - [ ] Monitor query performance in Supabase Dashboard
  - [ ] Optimize slow queries

- [ ] **Database Backup**
  - [ ] Enable automatic backups (Supabase Pro plan)
  - [ ] Document manual backup procedure
  - [ ] Test database restore process
  - [ ] Schedule regular backup verification

### Testing Database Setup

```bash
# Test database connection
npm run check:env

# Test RLS policies (create test script)
npm run test:database

# Verify tables exist
supabase db status
```

**Manual Testing:**
1. Create test user via signup
2. Verify user appears in `users` table
3. Test user can access own data
4. Test user cannot access other user data
5. Test admin can access all data

---

## 4. Netlify Configuration

### Initial Netlify Setup

- [ ] **Create Netlify Account**
  - [ ] Sign up at https://netlify.com
  - [ ] Connect GitHub account
  - [ ] Verify email address

- [ ] **Import GitHub Repository**
  - [ ] Click "Add new site" > "Import an existing project"
  - [ ] Select GitHub provider
  - [ ] Authorize Netlify access to repositories
  - [ ] Select HumanGlue repository

### Build Configuration

- [ ] **Configure Build Settings**
  - [ ] Base directory: (leave empty or `humanGLue_brain`)
  - [ ] Build command: `npm run build`
  - [ ] Publish directory: `.next`
  - [ ] Functions directory: `netlify/functions`
  - [ ] Node version: `20` (set in `netlify.toml`)

- [ ] **Verify netlify.toml**
  - [ ] File exists at project root
  - [ ] Build command correct
  - [ ] Publish directory correct
  - [ ] Node version 20 specified
  - [ ] Security headers configured
  - [ ] Redirects configured
  - [ ] Plugins configured

**netlify.toml key sections verified:**

```toml
[build]
  command = "npm run build"
  publish = ".next"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "20"
  NPM_VERSION = "10"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Netlify Functions Setup

- [ ] **Verify Functions Directory**
  - [ ] Functions in `netlify/functions/` directory
  - [ ] TypeScript functions compile correctly
  - [ ] Function dependencies installed
  - [ ] Environment variables accessible in functions

- [ ] **Critical Functions Verified:**
  - [ ] `webhook-stripe.ts` - Stripe webhook handler
  - [ ] `process-payment.ts` - Payment processing
  - [ ] `create-payment-intent.ts` - Payment intent creation
  - [ ] `send-email.ts` - Email notifications
  - [ ] `assessment-completion.ts` - Assessment processing

- [ ] **Function Configuration**
  - [ ] Timeout set appropriately (26s for Pro, 10s for free)
  - [ ] Memory allocation sufficient
  - [ ] Error handling implemented
  - [ ] Logging configured

### Netlify Plugins

- [ ] **Install Required Plugins**
  - [ ] `@netlify/plugin-nextjs` - Next.js support
  - [ ] `netlify-plugin-submit-sitemap` - SEO
  - [ ] `netlify-plugin-image-optim` - Image optimization

```bash
# Install plugins via Netlify UI or netlify.toml
# Plugins are auto-installed from netlify.toml
```

### Deploy Configuration

- [ ] **Deploy Contexts**
  - [ ] Production branch: `main`
  - [ ] Branch deploys enabled for `develop`
  - [ ] Deploy previews enabled for pull requests
  - [ ] Context-specific environment variables set

- [ ] **Build Hooks**
  - [ ] Create build hook for manual deploys (optional)
  - [ ] Document build hook URL securely
  - [ ] Configure build hook triggers (if needed)

### Netlify CLI Setup (Optional)

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link to site
netlify link

# Test build locally
netlify build

# Test functions locally
netlify dev

# Deploy to preview
netlify deploy

# Deploy to production
netlify deploy --prod
```

### Netlify Configuration Checklist

- [ ] Build command configured correctly
- [ ] Publish directory set to `.next`
- [ ] Node version 20 specified
- [ ] Environment variables set (see Section 2)
- [ ] Netlify Functions configured
- [ ] Plugins installed and configured
- [ ] Build hooks created (if needed)
- [ ] Deploy notifications configured
- [ ] Build cache enabled
- [ ] Continuous deployment enabled
- [ ] Branch deploy settings configured
- [ ] Deploy preview settings configured

---

## 5. Domain & DNS

### Domain Setup

- [ ] **Register Domain** (if not already done)
  - [ ] Register `humanglue.ai` (or your domain)
  - [ ] Use reputable registrar (Namecheap, Google Domains, etc.)
  - [ ] Enable domain privacy/WHOIS protection
  - [ ] Enable domain lock
  - [ ] Set auto-renewal

- [ ] **Configure Custom Domain in Netlify**
  - [ ] Go to: Site Settings > Domain management
  - [ ] Click "Add custom domain"
  - [ ] Enter `humanglue.ai`
  - [ ] Add `www.humanglue.ai` (optional)
  - [ ] Set primary domain

### DNS Configuration

- [ ] **Update DNS Records**

**Option 1: Netlify DNS (Recommended)**
1. Go to Domain Settings > Netlify DNS > Add domain
2. Netlify provides nameservers
3. Update nameservers at your registrar
4. Wait for DNS propagation (24-48 hours)

**Option 2: External DNS**
1. Create A record:
   - Name: `@` (or leave blank)
   - Type: `A`
   - Value: Netlify load balancer IP (shown in dashboard)

2. Create CNAME for www:
   - Name: `www`
   - Type: `CNAME`
   - Value: `your-site.netlify.app`

3. Create CNAME for www redirect (if using):
   - Name: `www`
   - Type: `CNAME`
   - Value: `humanglue.ai`

- [ ] **Verify DNS Propagation**
  ```bash
  # Check A record
  dig humanglue.ai

  # Check CNAME record
  dig www.humanglue.ai

  # Check from multiple locations
  # Use: https://www.whatsmydns.net
  ```

### SSL/TLS Certificate

- [ ] **Enable HTTPS**
  - [ ] Netlify automatically provisions SSL via Let's Encrypt
  - [ ] Verify certificate active in Site Settings > Domain > HTTPS
  - [ ] Force HTTPS redirect enabled
  - [ ] HSTS enabled (configured in `netlify.toml`)

- [ ] **Verify SSL Certificate**
  ```bash
  # Test SSL certificate
  curl -I https://humanglue.ai

  # Check SSL rating
  # Visit: https://www.ssllabs.com/ssltest/
  ```

### Domain Configuration Checklist

- [ ] Custom domain added to Netlify
- [ ] DNS records configured correctly
- [ ] DNS propagation complete (verify with dig/nslookup)
- [ ] SSL certificate active and valid
- [ ] HTTPS redirect working
- [ ] WWW redirect configured (if applicable)
- [ ] Domain shows in browser without warnings
- [ ] SSL Labs rating A or higher
- [ ] CAA records configured (optional, advanced)

---

## 6. Testing Checklist

### Pre-Deployment Testing

Run comprehensive tests before deploying to production.

```bash
# Run all tests
npm run test:all

# Type checking
npm run type-check

# Linting
npm run lint

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests (Playwright)
npm run test:e2e

# Pre-deployment checks
npm run pre-deploy
```

### Manual Testing Checklist

#### Core Functionality

- [ ] **Authentication & Authorization**
  - [ ] User signup works
  - [ ] Email verification works (if enabled)
  - [ ] User login works
  - [ ] Password reset works
  - [ ] Session persistence works
  - [ ] Logout works
  - [ ] Protected routes redirect to login
  - [ ] Admin routes blocked for non-admins

- [ ] **User Dashboard**
  - [ ] Dashboard loads without errors
  - [ ] User profile displays correctly
  - [ ] User can edit profile
  - [ ] Avatar upload works (if implemented)
  - [ ] Enrolled workshops display
  - [ ] Assessment results display
  - [ ] Navigation works correctly

- [ ] **Workshops**
  - [ ] Workshop catalog loads
  - [ ] Workshop detail pages load
  - [ ] Workshop search/filter works
  - [ ] Workshop registration works
  - [ ] Payment processing works
  - [ ] Confirmation email sent
  - [ ] Workshop appears in user dashboard

- [ ] **Assessments**
  - [ ] Assessment listing loads
  - [ ] Assessment detail page loads
  - [ ] Assessment questions display correctly
  - [ ] Answer submission works
  - [ ] Progress tracking works
  - [ ] Assessment completion works
  - [ ] Results calculation accurate
  - [ ] Results display correctly
  - [ ] Certificate generation works (if applicable)

- [ ] **Talent Marketplace**
  - [ ] Talent profiles load
  - [ ] Search/filter functionality works
  - [ ] Profile detail pages load
  - [ ] Contact form works
  - [ ] Email notifications sent

- [ ] **Payment Processing**
  - [ ] Stripe checkout loads
  - [ ] Payment form validation works
  - [ ] Test payment succeeds (use test card)
  - [ ] Payment confirmation shown
  - [ ] Receipt email sent
  - [ ] Payment recorded in database
  - [ ] Webhook handler processes events

#### API Endpoints

- [ ] **Public Endpoints**
  - [ ] `/api/workshops` - GET returns workshop list
  - [ ] `/api/workshops/[id]` - GET returns workshop details
  - [ ] `/api/assessments` - GET returns assessment list
  - [ ] `/api/talent/contact` - POST sends contact email
  - [ ] Rate limiting works (429 after limit)

- [ ] **Protected Endpoints**
  - [ ] `/api/user/profile` - GET requires authentication
  - [ ] `/api/user/workshops` - GET returns user workshops
  - [ ] `/api/user/assessments` - GET returns user assessments
  - [ ] `/api/workshops/[id]/register` - POST requires auth
  - [ ] Returns 401 when unauthenticated

- [ ] **Admin Endpoints** (if applicable)
  - [ ] Admin endpoints require admin role
  - [ ] Returns 403 for non-admin users
  - [ ] Admin can manage workshops
  - [ ] Admin can view all users

### Cross-Browser Testing

- [ ] **Desktop Browsers**
  - [ ] Chrome (latest)
  - [ ] Firefox (latest)
  - [ ] Safari (latest)
  - [ ] Edge (latest)

- [ ] **Mobile Browsers**
  - [ ] Chrome Mobile (Android)
  - [ ] Safari Mobile (iOS)
  - [ ] Samsung Internet (Android)

### Responsive Design Testing

- [ ] **Mobile (320px - 767px)**
  - [ ] Homepage renders correctly
  - [ ] Navigation menu works (hamburger)
  - [ ] Forms are usable
  - [ ] Images scale properly
  - [ ] Text is readable
  - [ ] Buttons are tappable

- [ ] **Tablet (768px - 1023px)**
  - [ ] Layout adapts correctly
  - [ ] Navigation works
  - [ ] Dashboard is usable
  - [ ] Tables/data display correctly

- [ ] **Desktop (1024px+)**
  - [ ] Full layout displays
  - [ ] All features accessible
  - [ ] Optimal reading width
  - [ ] Images high quality

### Form Testing

- [ ] **All Forms Validated**
  - [ ] Client-side validation works
  - [ ] Server-side validation works
  - [ ] Error messages display correctly
  - [ ] Success messages display
  - [ ] Required fields enforced
  - [ ] Email format validated
  - [ ] Password strength enforced

### Error Handling

- [ ] **Error Pages**
  - [ ] 404 page displays for invalid URLs
  - [ ] 500 page displays for server errors
  - [ ] Error pages match design
  - [ ] Error pages have navigation back
  - [ ] Error tracking captures errors (Sentry)

- [ ] **API Error Handling**
  - [ ] API returns proper status codes
  - [ ] Error messages are user-friendly
  - [ ] Errors logged to monitoring service
  - [ ] No sensitive data in error messages

### Accessibility Testing

- [ ] **WCAG 2.1 AA Compliance**
  - [ ] All images have alt text
  - [ ] Color contrast meets standards
  - [ ] Keyboard navigation works
  - [ ] Screen reader compatible
  - [ ] Focus indicators visible
  - [ ] ARIA labels on interactive elements

- [ ] **Accessibility Tools**
  - [ ] Run Lighthouse accessibility audit (score >90)
  - [ ] Test with screen reader (VoiceOver/NVDA)
  - [ ] Test keyboard-only navigation
  - [ ] Use axe DevTools for automated checks

---

## 7. Performance Optimization

### Build Optimization

- [ ] **Code Splitting**
  - [ ] Next.js automatic code splitting enabled
  - [ ] Dynamic imports for large components
  - [ ] Route-based code splitting
  - [ ] Vendor bundle optimized

- [ ] **Bundle Analysis**
  ```bash
  # Analyze bundle size
  npm run analyze
  ```
  - [ ] Bundle size reasonable (<500KB initial)
  - [ ] No duplicate dependencies
  - [ ] Tree shaking working
  - [ ] Large libraries code-split

### Image Optimization

- [ ] **Next.js Image Component**
  - [ ] All images use Next.js Image component
  - [ ] Lazy loading enabled
  - [ ] Proper image sizes specified
  - [ ] WebP/AVIF formats enabled
  - [ ] Images compressed

- [ ] **Image Checklist**
  - [ ] All images optimized (<200KB each)
  - [ ] Responsive images for different viewports
  - [ ] Alt text on all images
  - [ ] Loading priority set correctly
  - [ ] Placeholder blur enabled

### Caching Strategy

- [ ] **Static Assets**
  - [ ] Long cache headers (1 year) for static files
  - [ ] Configured in `netlify.toml`
  - [ ] Verify cache headers in browser DevTools
  - [ ] CDN caching enabled (Netlify Edge)

- [ ] **API Responses**
  - [ ] Appropriate cache headers on API routes
  - [ ] Stale-while-revalidate where applicable
  - [ ] Cache invalidation strategy documented

### CDN & Edge

- [ ] **Netlify Edge**
  - [ ] Site deployed to Netlify Edge network
  - [ ] Verify global distribution
  - [ ] Test load times from different regions
  - [ ] Edge functions used where appropriate (optional)

### Performance Metrics

- [ ] **Lighthouse Audit**
  - [ ] Performance score >90
  - [ ] Accessibility score >90
  - [ ] Best Practices score >90
  - [ ] SEO score >90

- [ ] **Core Web Vitals**
  - [ ] LCP (Largest Contentful Paint) <2.5s
  - [ ] FID (First Input Delay) <100ms
  - [ ] CLS (Cumulative Layout Shift) <0.1

- [ ] **Page Load Times**
  - [ ] Homepage loads in <3s (3G)
  - [ ] Dashboard loads in <3s (authenticated)
  - [ ] API responses <500ms average

### Performance Testing Tools

```bash
# Run Lighthouse
npx lighthouse https://humanglue.ai --view

# Test Web Vitals
# Install Chrome extension: Web Vitals

# Test from multiple locations
# Use: https://www.webpagetest.org
```

### Performance Monitoring

- [ ] **Setup Real User Monitoring**
  - [ ] Google Analytics 4 configured
  - [ ] Web Vitals tracked in GA4
  - [ ] Custom events for key actions
  - [ ] Monitor performance over time

- [ ] **Netlify Analytics**
  - [ ] Enable Netlify Analytics (paid)
  - [ ] Review bandwidth usage
  - [ ] Monitor function execution times
  - [ ] Track popular pages

---

## 8. Monitoring Setup

### Error Tracking (Sentry)

- [ ] **Configure Sentry**
  - [ ] Create Sentry project at https://sentry.io
  - [ ] Install Sentry SDK: `npm install @sentry/nextjs`
  - [ ] Set SENTRY_DSN environment variable
  - [ ] Initialize Sentry in `app/layout.tsx`
  - [ ] Test error reporting

- [ ] **Sentry Configuration**
  ```typescript
  // Example Sentry init
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_ENV,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
  ```

- [ ] **Sentry Alerts**
  - [ ] Configure email alerts for errors
  - [ ] Set up Slack integration (optional)
  - [ ] Define error thresholds
  - [ ] Assign error ownership

### Analytics (Google Analytics 4)

- [ ] **Setup Google Analytics**
  - [ ] Create GA4 property
  - [ ] Get Measurement ID
  - [ ] Set NEXT_PUBLIC_GA_MEASUREMENT_ID
  - [ ] Install Google Tag Manager (optional)
  - [ ] Verify tracking in GA4 dashboard

- [ ] **Track Key Events**
  - [ ] Page views
  - [ ] Workshop registrations
  - [ ] Assessment completions
  - [ ] Payment events
  - [ ] User signups
  - [ ] Contact form submissions

### Uptime Monitoring

- [ ] **External Uptime Monitor**
  - [ ] Setup UptimeRobot (free) or Pingdom
  - [ ] Monitor main domain (https://humanglue.ai)
  - [ ] Monitor API endpoints
  - [ ] Set check interval (5 minutes)
  - [ ] Configure email/SMS alerts

- [ ] **Health Check Endpoint**
  ```typescript
  // Create /api/health route
  export async function GET() {
    return new Response(JSON.stringify({ status: 'ok' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  ```

### Log Aggregation

- [ ] **Netlify Functions Logs**
  - [ ] Access via Netlify Dashboard > Functions
  - [ ] Set up log retention
  - [ ] Monitor error patterns
  - [ ] Set up log alerts

- [ ] **Centralized Logging (Optional)**
  - [ ] Setup Logtail or Datadog
  - [ ] Aggregate logs from all sources
  - [ ] Set up log-based alerts
  - [ ] Create log dashboards

### Performance Monitoring

- [ ] **Web Vitals Monitoring**
  - [ ] Track Core Web Vitals in GA4
  - [ ] Setup alerts for degradation
  - [ ] Monitor mobile vs desktop performance
  - [ ] Track by page/route

- [ ] **API Performance**
  - [ ] Monitor API response times
  - [ ] Track slow queries
  - [ ] Monitor database performance (Supabase Dashboard)
  - [ ] Set up performance budgets

### Security Monitoring

- [ ] **Security Alerts**
  - [ ] Monitor for failed login attempts
  - [ ] Track API rate limit violations
  - [ ] Monitor for unusual traffic patterns
  - [ ] Set up security incident alerts

- [ ] **Dependency Scanning**
  - [ ] Enable Dependabot alerts
  - [ ] Configure Snyk or similar
  - [ ] Automate security patch PRs
  - [ ] Review security advisories weekly

### Monitoring Checklist

- [ ] Sentry error tracking configured and tested
- [ ] Google Analytics tracking verified
- [ ] Uptime monitoring active
- [ ] Health check endpoint created
- [ ] Function logs accessible
- [ ] Web Vitals tracked
- [ ] API performance monitored
- [ ] Security alerts configured
- [ ] Monitoring dashboard created
- [ ] Alert recipients configured
- [ ] Response procedures documented

---

## 9. Post-Deployment Verification

### Immediate Post-Deploy Checks (Within 15 minutes)

- [ ] **Site Accessibility**
  - [ ] Homepage loads: `https://humanglue.ai`
  - [ ] SSL certificate valid
  - [ ] No browser security warnings
  - [ ] Favicon displays correctly

- [ ] **Critical User Flows**
  - [ ] User can signup
  - [ ] User can login
  - [ ] User can access dashboard
  - [ ] User can view workshops
  - [ ] User can view assessments

- [ ] **API Endpoints**
  - [ ] Test public API endpoints
  - [ ] Test authenticated endpoints
  - [ ] Verify rate limiting works
  - [ ] Check error handling

- [ ] **Netlify Functions**
  - [ ] Functions deployed successfully
  - [ ] Check function logs for errors
  - [ ] Test payment webhook (Stripe CLI)
  - [ ] Test email sending

### Extended Verification (Within 1 hour)

- [ ] **Payment Processing**
  - [ ] Create test purchase (use Stripe test mode if available)
  - [ ] Verify payment intent created
  - [ ] Verify webhook received
  - [ ] Verify confirmation email sent
  - [ ] Verify database updated

- [ ] **Email Notifications**
  - [ ] Signup confirmation email sent
  - [ ] Workshop registration email sent
  - [ ] Payment confirmation email sent
  - [ ] Password reset email sent

- [ ] **Database Integrity**
  - [ ] New users being created
  - [ ] User sessions persisting
  - [ ] Workshop registrations saving
  - [ ] Assessment responses saving
  - [ ] RLS policies enforced

- [ ] **Mobile Responsiveness**
  - [ ] Test on real mobile device
  - [ ] Test on tablet
  - [ ] Verify responsive design works
  - [ ] Test touch interactions

### Full System Check (Within 24 hours)

- [ ] **Analytics Verification**
  - [ ] Google Analytics receiving data
  - [ ] Page views tracked correctly
  - [ ] Events firing properly
  - [ ] User demographics captured

- [ ] **Error Monitoring**
  - [ ] Sentry receiving errors (if any)
  - [ ] No critical errors in Sentry
  - [ ] Error rate acceptable (<1%)
  - [ ] Error alerts working

- [ ] **Performance Verification**
  - [ ] Run Lighthouse audit
  - [ ] Verify Core Web Vitals
  - [ ] Check page load times
  - [ ] Monitor API response times

- [ ] **SEO Verification**
  - [ ] Verify meta tags: `view-source:https://humanglue.ai`
  - [ ] Submit sitemap to Google Search Console
  - [ ] Submit sitemap to Bing Webmaster Tools
  - [ ] Verify robots.txt accessible
  - [ ] Check OpenGraph tags (Facebook debugger)
  - [ ] Check Twitter Card tags

- [ ] **Security Verification**
  - [ ] Run security headers check: https://securityheaders.com
  - [ ] Verify SSL Labs rating: https://www.ssllabs.com/ssltest/
  - [ ] Test CORS configuration
  - [ ] Verify rate limiting works
  - [ ] Check for exposed secrets (manual review)

### User Acceptance Testing

- [ ] **Stakeholder Review**
  - [ ] Demo to stakeholders
  - [ ] Collect feedback
  - [ ] Address critical issues
  - [ ] Document feature requests

- [ ] **Beta User Testing** (Optional)
  - [ ] Invite beta users
  - [ ] Monitor user behavior
  - [ ] Collect user feedback
  - [ ] Address usability issues

### Post-Deployment Checklist

- [ ] All critical user flows tested successfully
- [ ] No critical errors in monitoring
- [ ] Performance metrics meet targets
- [ ] Analytics tracking verified
- [ ] Email notifications working
- [ ] Payment processing tested (if applicable)
- [ ] Mobile experience verified
- [ ] SEO elements verified
- [ ] Security scan passed
- [ ] Stakeholders notified of deployment
- [ ] Documentation updated
- [ ] Team trained on new features

---

## 10. Rollback Plan

### When to Rollback

Rollback immediately if:
- Critical functionality broken (login, payments, etc.)
- Security vulnerability exposed
- Data corruption detected
- Site completely down
- Error rate >5%

### Quick Rollback (Netlify Dashboard)

**Time to rollback: ~2 minutes**

1. Go to Netlify Dashboard
2. Navigate to: Deploys tab
3. Find the last known good deployment
4. Click three-dot menu (...)
5. Select "Publish deploy"
6. Confirm publication
7. Verify site restored

```bash
# CLI Alternative
netlify deploys:list
netlify rollback --deploy-id <previous-deploy-id>
```

### Git-Based Rollback

**Time to rollback: ~5-10 minutes**

```bash
# Option 1: Revert last commit (safest)
git revert HEAD
git push origin main
# Wait for automatic deployment

# Option 2: Revert to specific commit
git revert <commit-hash>
git push origin main

# Option 3: Force rollback (use with caution)
git reset --hard <last-good-commit>
git push --force origin main
```

### Database Rollback

If deployment includes database migrations:

**Before Migration:**
```bash
# Always backup before migration
supabase db dump > backup-$(date +%Y%m%d-%H%M%S).sql
```

**Rollback Migration:**
```bash
# Rollback last migration
supabase migration down

# Restore from backup if needed
psql -h db.your-project.supabase.co -U postgres < backup-file.sql
```

**Important:** Test migration rollback in staging first!

### Environment Variables Rollback

If bad deployment due to env var changes:

1. Go to Netlify: Site Settings > Environment Variables
2. Review recent changes (check audit log)
3. Revert to previous values
4. Trigger redeploy: `netlify deploy --prod --trigger`

### Function Rollback

If specific function is broken:

1. Identify problematic function in logs
2. Rollback just that function file via Git
3. Push changes
4. Or rollback entire deployment (safer)

### Communication During Rollback

- [ ] **Notify Stakeholders**
  - [ ] Post status update on status page
  - [ ] Email key stakeholders
  - [ ] Post in team Slack/Discord
  - [ ] Update social media if needed

- [ ] **Status Page Template**
  ```
  [RESOLVED] HumanGlue Platform Issue - [Date/Time]

  We experienced an issue with our latest deployment that affected [feature].
  The issue has been resolved by rolling back to the previous version.

  Timeline:
  - [Time] Issue detected
  - [Time] Rollback initiated
  - [Time] Service restored

  We apologize for any inconvenience.
  ```

### Post-Rollback Actions

- [ ] **Immediate (0-1 hour)**
  - [ ] Verify rollback successful
  - [ ] Confirm all services operational
  - [ ] Monitor error rates
  - [ ] Update status page

- [ ] **Short-term (1-24 hours)**
  - [ ] Investigate root cause
  - [ ] Document incident
  - [ ] Create bug fix plan
  - [ ] Test fix in staging
  - [ ] Plan redeployment

- [ ] **Long-term (1-7 days)**
  - [ ] Conduct post-mortem
  - [ ] Update deployment procedures
  - [ ] Improve testing coverage
  - [ ] Update monitoring/alerts
  - [ ] Share learnings with team

### Rollback Checklist

- [ ] Deployment issue severity assessed
- [ ] Rollback method selected (Netlify vs Git)
- [ ] Stakeholders notified
- [ ] Rollback executed
- [ ] Service restoration verified
- [ ] Monitoring confirms stability
- [ ] Status page updated
- [ ] Root cause investigation started
- [ ] Incident documented
- [ ] Prevention plan created

---

## 11. Ongoing Maintenance

### Daily Checks

- [ ] **Monitor Error Rates**
  - [ ] Check Sentry for new errors
  - [ ] Review function logs in Netlify
  - [ ] Monitor uptime status
  - [ ] Check API response times

- [ ] **Review Analytics**
  - [ ] Check traffic levels
  - [ ] Review user signups
  - [ ] Monitor conversion rates
  - [ ] Check for anomalies

### Weekly Maintenance

- [ ] **Security Updates**
  - [ ] Review npm audit results
  - [ ] Check for Dependabot PRs
  - [ ] Update critical dependencies
  - [ ] Review Supabase security advisories

- [ ] **Performance Review**
  - [ ] Check Core Web Vitals trends
  - [ ] Review slow API endpoints
  - [ ] Monitor database performance
  - [ ] Check bundle size trends

- [ ] **Backup Verification**
  - [ ] Verify Supabase backups running
  - [ ] Test backup restoration (monthly)
  - [ ] Check backup storage limits

### Monthly Maintenance

- [ ] **Dependency Updates**
  - [ ] Update all minor/patch versions
  - [ ] Test thoroughly in staging
  - [ ] Update major versions cautiously
  - [ ] Review changelog for breaking changes

- [ ] **Security Audit**
  - [ ] Run full security scan
  - [ ] Review authentication logs
  - [ ] Check for unauthorized access attempts
  - [ ] Review RLS policies

- [ ] **Performance Optimization**
  - [ ] Run Lighthouse audit
  - [ ] Analyze bundle size
  - [ ] Optimize slow queries
  - [ ] Review and purge unused code

- [ ] **Content Review**
  - [ ] Update workshop catalog
  - [ ] Review and update documentation
  - [ ] Check for broken links
  - [ ] Update pricing (if changed)

### Quarterly Maintenance

- [ ] **Major Updates**
  - [ ] Update Next.js to latest stable
  - [ ] Update React to latest stable
  - [ ] Update all major dependencies
  - [ ] Test extensively

- [ ] **Secret Rotation**
  - [ ] Rotate Supabase service role key
  - [ ] Rotate Stripe API keys
  - [ ] Rotate other API keys
  - [ ] Update all environment variables

- [ ] **Infrastructure Review**
  - [ ] Review Netlify plan/usage
  - [ ] Review Supabase plan/usage
  - [ ] Optimize costs
  - [ ] Plan for scale

- [ ] **Compliance Check**
  - [ ] Review GDPR compliance
  - [ ] Update privacy policy
  - [ ] Update terms of service
  - [ ] Review data retention policies

### Annual Maintenance

- [ ] **Major Platform Upgrades**
  - [ ] Plan Next.js major version upgrade
  - [ ] Plan React major version upgrade
  - [ ] Review architecture decisions
  - [ ] Plan feature roadmap

- [ ] **Security Certifications**
  - [ ] Renew SSL certificates (auto with Netlify)
  - [ ] Conduct penetration testing
  - [ ] Review security policies
  - [ ] Update security documentation

- [ ] **Disaster Recovery Test**
  - [ ] Test full system restore from backup
  - [ ] Simulate major outage
  - [ ] Update disaster recovery plan
  - [ ] Train team on procedures

### Maintenance Checklist

- [ ] Daily monitoring procedures documented
- [ ] Weekly maintenance scheduled
- [ ] Monthly tasks assigned to team members
- [ ] Quarterly review calendar created
- [ ] Annual planning session scheduled
- [ ] Maintenance runbooks created
- [ ] On-call rotation defined (if applicable)
- [ ] Escalation procedures documented

---

## Final Pre-Deployment Checklist

Use this comprehensive checklist before going live:

### Security

- [ ] All secrets rotated and production-ready
- [ ] No credentials committed to Git
- [ ] RLS policies enabled and tested
- [ ] Authentication middleware active
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers verified
- [ ] SSL certificate active
- [ ] npm audit passing

### Configuration

- [ ] All environment variables set in Netlify
- [ ] Supabase project configured
- [ ] Database migrations run
- [ ] Storage buckets created
- [ ] Stripe webhooks configured
- [ ] Email service configured
- [ ] DNS records configured
- [ ] Domain verified

### Testing

- [ ] All tests passing (unit + integration + E2E)
- [ ] Manual testing completed
- [ ] Cross-browser testing done
- [ ] Mobile testing done
- [ ] Accessibility audit passed
- [ ] Performance audit passed (Lighthouse >90)
- [ ] SEO audit passed

### Monitoring

- [ ] Sentry error tracking configured
- [ ] Google Analytics configured
- [ ] Uptime monitoring active
- [ ] Alerts configured
- [ ] Health check endpoint created

### Documentation

- [ ] Deployment guide updated
- [ ] API documentation complete
- [ ] Environment variables documented
- [ ] Rollback procedures documented
- [ ] Runbooks created for common issues

### Team Readiness

- [ ] Team trained on new features
- [ ] On-call rotation defined (if applicable)
- [ ] Support procedures documented
- [ ] Stakeholders notified of go-live date

---

## Resources & Support

### Documentation Links

- [HumanGlue Deployment Guide](./DEPLOYMENT.md)
- [Environment Setup Guide](./.env.example)
- [Database Schema](./supabase/SCHEMA.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Security Audit Report](./SECURITY_AUDIT_REPORT.md)

### External Resources

- [Netlify Documentation](https://docs.netlify.com)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)

### Support Contacts

- **Technical Issues**: [Your support email]
- **Security Issues**: [Security team email]
- **Billing Issues**: [Billing team email]
- **General Questions**: [General contact email]

---

## Appendix: Environment Variables Quick Reference

### Required for Basic Operation

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Application
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_ENV
NODE_ENV
```

### Required for Payments

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

### Required for Rate Limiting

```bash
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

### Highly Recommended

```bash
# Error Tracking
NEXT_PUBLIC_SENTRY_DSN

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID

# Email
RESEND_API_KEY

# AI (at least one)
GOOGLE_AI_API_KEY
OPENAI_API_KEY
ANTHROPIC_API_KEY
```

---

## Version History

- **v1.0.0** (2025-10-04): Initial deployment checklist created
- Covers: Security, environment setup, database, Netlify, domain, testing, performance, monitoring, post-deploy, rollback, and maintenance

---

**Prepared by:** HumanGlue Engineering Team
**Last Review:** October 4, 2025
**Next Review:** January 4, 2026

For questions or updates to this checklist, please contact the technical team.
