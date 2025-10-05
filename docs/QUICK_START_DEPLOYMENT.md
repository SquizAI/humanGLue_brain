# Quick Start - Production Deployment

Get the HumanGlue platform deployed to production in under 30 minutes.

## Prerequisites (5 minutes)

### 1. Required Accounts
Sign up for these services (if you haven't already):

- [ ] **GitHub** - https://github.com (free)
- [ ] **Netlify** - https://netlify.com (free tier available)
- [ ] **Supabase** - https://supabase.com (free tier available)
- [ ] **Sentry** - https://sentry.io (optional, free tier)

### 2. Required Tools
Install these tools:

```bash
# Node.js 20+
brew install node@20  # macOS
# or download from https://nodejs.org

# Netlify CLI
npm install -g netlify-cli

# Supabase CLI
npm install -g supabase

# Verify installations
node --version    # Should be 20.x
netlify --version
supabase --version
```

## Part 1: Database Setup (5 minutes)

### 1. Create Supabase Projects

Create two projects (staging and production):

1. Go to https://app.supabase.com
2. Click "New Project"
3. Create **humanglue-staging**
4. Create **humanglue-production**

### 2. Get Credentials

For each project, go to **Settings** → **API**:

- Project URL: `https://xxx.supabase.co`
- Anon (public) key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Service role key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

Save these in a secure location.

### 3. Run Migrations

```bash
# Set environment variables
export SUPABASE_STAGING_DB_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# Run migrations
npm run migrate:staging
```

### 4. Seed Staging Data

```bash
# Create test data
npm run seed:staging
```

## Part 2: Netlify Setup (10 minutes)

### 1. Create Netlify Site

```bash
# Login to Netlify
netlify login

# Create new site
netlify sites:create --name humanglue-production

# Link site
netlify link
```

### 2. Configure Build Settings

In Netlify dashboard (**Site settings** → **Build & deploy**):

- Build command: `npm run build`
- Publish directory: `.next`
- Node version: `20`

### 3. Set Environment Variables

Go to **Site settings** → **Environment variables**:

#### Application
```
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app
NODE_ENV=production
```

#### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

#### Required Services
```
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
GOOGLE_AI_API_KEY=...
RESEND_API_KEY=re_...
```

**Quick tip**: Use `netlify env:set` command:

```bash
netlify env:set NEXT_PUBLIC_ENV "production"
netlify env:set NEXT_PUBLIC_SITE_URL "https://your-site.netlify.app"
# ... etc
```

## Part 3: GitHub Actions Setup (5 minutes)

### 1. Add GitHub Secrets

Go to your repo **Settings** → **Secrets and variables** → **Actions**:

```
NETLIFY_AUTH_TOKEN=your-netlify-token
NETLIFY_PRODUCTION_SITE_ID=your-site-id
SUPABASE_PRODUCTION_URL=https://xxx.supabase.co
SUPABASE_PRODUCTION_ANON_KEY=eyJ...
SUPABASE_PRODUCTION_SERVICE_KEY=eyJ...
SUPABASE_PRODUCTION_DB_URL=postgresql://...
```

**Get Netlify token**:
```bash
netlify login
# Copy token from browser
```

**Get Site ID**:
```bash
netlify sites:list
# Copy Site ID
```

### 2. Verify Workflows

Check that these files exist:
- `.github/workflows/pr-checks.yml` ✓
- `.github/workflows/deploy.yml` ✓

## Part 4: First Deployment (5 minutes)

### 1. Deploy to Production

```bash
# Make sure you're on main branch
git checkout main
git pull origin main

# Push to trigger deployment
git push origin main
```

### 2. Monitor Deployment

Watch deployment in:
- **GitHub Actions**: https://github.com/your-org/humanglue/actions
- **Netlify**: https://app.netlify.com

### 3. Verify Deployment

```bash
# Run health check
npm run health-check:production

# Or manually check
curl https://your-site.netlify.app/api/health
```

## Part 5: Post-Deployment (5 minutes)

### 1. Test Critical Paths

- [ ] Visit homepage: `https://your-site.netlify.app`
- [ ] Try authentication
- [ ] Access admin dashboard
- [ ] Access instructor dashboard
- [ ] Check real-time features

### 2. Configure Custom Domain (Optional)

In Netlify dashboard:

1. Go to **Domain settings**
2. Click **Add custom domain**
3. Enter `humanglue.ai`
4. Follow DNS setup instructions
5. Enable HTTPS (automatic)

### 3. Set Up Monitoring

#### Sentry (Optional)

1. Create project at https://sentry.io
2. Get DSN
3. Add to Netlify environment variables:
   ```
   NEXT_PUBLIC_SENTRY_DSN=https://...@o....ingest.sentry.io/...
   ```

#### Analytics (Optional)

Add Google Analytics:
```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Troubleshooting

### Build Fails

```bash
# Check build logs
netlify logs:deploy

# Common fixes:
# 1. Missing environment variables
netlify env:list

# 2. TypeScript errors
npm run type-check

# 3. Clear cache
netlify build --clear-cache
```

### Health Check Fails

```bash
# Check what's failing
npm run health-check:production

# Common issues:
# 1. Database not accessible - check Supabase dashboard
# 2. Environment variables not set - check Netlify dashboard
# 3. Rate limiting - check Upstash Redis
```

### Deployment Doesn't Update

```bash
# Force new deployment
netlify deploy --prod --force

# Or clear cache
netlify build --clear-cache
```

## Next Steps

### 1. Set Up Staging Environment

Repeat the process for staging:

```bash
netlify sites:create --name humanglue-staging
# Set environment variables
# Deploy develop branch
```

### 2. Configure Continuous Deployment

Already configured! Every push to `main` deploys to production.

### 3. Set Up Monitoring Alerts

- Configure uptime monitoring (e.g., UptimeRobot)
- Set up Sentry alerts
- Configure Netlify notifications

### 4. Review Documentation

Read these for deeper understanding:
- `docs/DEPLOYMENT.md` - Complete deployment guide
- `docs/RUNBOOK.md` - Operations and incident response
- `docs/DEPLOYMENT_CHECKLIST_FINAL.md` - Pre-deployment checklist

## Quick Reference

### Essential Commands

```bash
# Health check
npm run health-check:production

# Deploy manually
netlify deploy --prod

# View logs
netlify logs:deploy
netlify functions:logs

# Rollback
netlify rollback

# Database migrations
npm run migrate:production
```

### Important URLs

- **Production site**: https://your-site.netlify.app
- **Netlify dashboard**: https://app.netlify.com
- **Supabase dashboard**: https://app.supabase.com
- **GitHub Actions**: https://github.com/your-org/humanglue/actions
- **Sentry** (if configured): https://sentry.io

### Environment Variable Template

Save this as `.env.production` for reference:

```bash
# Application
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_SITE_URL=https://humanglue.ai
NODE_ENV=production

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Rate Limiting
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# AI
GOOGLE_AI_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Email
RESEND_API_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

## Success Checklist

- [ ] Supabase projects created (staging + production)
- [ ] Database migrations run successfully
- [ ] Staging data seeded
- [ ] Netlify sites created
- [ ] Environment variables configured
- [ ] GitHub secrets added
- [ ] First deployment successful
- [ ] Health check passes
- [ ] Critical paths tested
- [ ] Custom domain configured (if applicable)
- [ ] Monitoring set up

## Getting Help

- **Documentation**: See `docs/` directory
- **Issues**: GitHub Issues
- **Emergency**: See `docs/RUNBOOK.md`

---

**Congratulations! Your HumanGlue platform is now deployed to production!** 🎉

Next: Read `docs/DEPLOYMENT.md` for advanced configuration and best practices.
