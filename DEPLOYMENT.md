# HumanGlue Platform - Deployment Guide

Complete guide for deploying the HumanGlue platform to Netlify.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Environment Configuration](#environment-configuration)
- [First Deployment](#first-deployment)
- [Continuous Deployment](#continuous-deployment)
- [Environment Management](#environment-management)
- [Troubleshooting](#troubleshooting)
- [Rollback Procedures](#rollback-procedures)
- [Performance Optimization](#performance-optimization)

## Prerequisites

### Required Accounts

1. **Netlify Account**
   - Sign up at [netlify.com](https://netlify.com)
   - Have admin access to the HumanGlue site

2. **GitHub Account**
   - Repository access with push permissions
   - Ability to configure GitHub Actions secrets

3. **Third-Party Services**
   - Supabase project created
   - Stripe account configured
   - Upstash Redis database created
   - Sentry project created (optional but recommended)

### Local Development

1. **Node.js** version 20 or higher
2. **npm** version 10 or higher
3. **Netlify CLI** installed globally: `npm install -g netlify-cli`
4. **Git** configured with SSH keys

## Initial Setup

### 1. Clone the Repository

```bash
git clone git@github.com:your-org/humanglue.git
cd humanglue/humanGLue_brain
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Local Environment

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your actual values
# See ENVIRONMENT_SETUP.md for detailed variable documentation
```

### 4. Verify Local Setup

```bash
# Check environment variables
npm run check:env

# Run tests
npm run test:unit

# Build the application
npm run build

# Start development server
npm run dev
```

Visit `http://localhost:5040` to verify everything works.

## Environment Configuration

### Netlify Dashboard Setup

1. **Login to Netlify**
   ```bash
   netlify login
   ```

2. **Link to Your Site**
   ```bash
   netlify link
   ```

   Select your site or create a new one.

3. **Set Environment Variables**

   Navigate to: Site Settings > Environment Variables

   **Critical Variables (Required):**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
   ```

   **Production Variables:**
   ```bash
   NEXT_PUBLIC_SITE_URL=https://humanglue.ai
   NEXT_PUBLIC_ENV=production
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   UPSTASH_REDIS_REST_URL=https://...
   UPSTASH_REDIS_REST_TOKEN=...
   ```

   **Optional but Recommended:**
   ```bash
   NEXT_PUBLIC_SENTRY_DSN=https://...
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...
   RESEND_API_KEY=re_...
   ```

   **Using Netlify CLI:**
   ```bash
   # Set individual variables
   netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://your-project.supabase.co"

   # Import from .env file
   netlify env:import .env.production

   # Set for specific context
   netlify env:set STRIPE_SECRET_KEY "sk_live_..." --context production
   netlify env:set STRIPE_SECRET_KEY "sk_test_..." --context deploy-preview
   ```

### GitHub Actions Setup

1. **Navigate to Repository Settings**
   - Go to: Settings > Secrets and variables > Actions

2. **Add Repository Secrets**
   ```
   NETLIFY_AUTH_TOKEN=<your-netlify-token>
   NETLIFY_SITE_ID=<your-site-id>

   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

   # Test database for CI/CD
   SUPABASE_TEST_URL=https://test-project.supabase.co
   SUPABASE_TEST_ANON_KEY=eyJhbGci...
   SUPABASE_TEST_SERVICE_KEY=eyJhbGci...
   ```

3. **Get Netlify Credentials**
   ```bash
   # Get your auth token
   netlify login
   # Token is stored in ~/.netlify/config.json

   # Get your site ID
   netlify sites:list
   # Or from: Site Settings > General > Site details
   ```

## First Deployment

### Pre-Deployment Checklist

Run the comprehensive pre-deployment check:

```bash
npm run pre-deploy
```

This will verify:
- ✓ Node.js version
- ✓ Dependencies installed
- ✓ TypeScript compiles
- ✓ ESLint passes
- ✓ Tests pass
- ✓ Security audit passes
- ✓ Production build succeeds

### Deploy to Preview

Test deployment with a preview URL:

```bash
npm run deploy:preview
```

This creates a preview deployment without affecting production.

### Deploy to Production

Once preview looks good:

```bash
npm run deploy:production
```

Or push to main branch to trigger automatic deployment via GitHub Actions.

### Verify Deployment

1. **Check Deployment Status**
   ```bash
   netlify status
   ```

2. **View Recent Deploys**
   ```bash
   netlify deploys:list
   ```

3. **Open Deployed Site**
   ```bash
   netlify open:site
   ```

4. **Check Build Logs**
   ```bash
   netlify logs:deploy
   ```

5. **Smoke Test**
   ```bash
   curl -I https://humanglue.ai
   # Should return 200 OK
   ```

## Continuous Deployment

### Branch Strategy

- **main** → Production (https://humanglue.ai)
- **develop** → Staging (https://staging--humanglue.netlify.app)
- **feature/*** → Preview (https://deploy-preview-{pr-number}--humanglue.netlify.app)

### Automatic Deployments

GitHub Actions automatically deploys:

1. **Pull Request** → Deploy Preview
   - Runs: Lint, Type Check, Unit Tests
   - Creates preview deployment
   - Comments PR with preview URL

2. **Push to develop** → Staging
   - Runs: All tests + Integration tests
   - Deploys to staging environment

3. **Push to main** → Production
   - Runs: All tests + E2E tests
   - Requires all checks to pass
   - Deploys to production
   - Creates deployment tag

### Manual Deploy

Deploy specific branch:

```bash
# Deploy current branch to preview
netlify deploy

# Deploy specific branch to production
git checkout main
git pull origin main
netlify deploy --prod
```

## Environment Management

### View Environment Variables

```bash
# List all variables
netlify env:list

# List for specific context
netlify env:list --context production
```

### Update Environment Variables

```bash
# Update a variable
netlify env:set VARIABLE_NAME "new-value"

# Update for specific context
netlify env:set VARIABLE_NAME "value" --context production

# Delete a variable
netlify env:unset VARIABLE_NAME
```

### Clone Environment Variables

```bash
# Clone from production to staging
netlify env:clone --from production --to deploy-preview
```

### Rotate Secrets

Regular secret rotation (recommended every 90 days):

```bash
# 1. Generate new secret (e.g., Stripe key)
# 2. Update in Netlify
netlify env:set STRIPE_SECRET_KEY "sk_live_NEW_KEY" --context production

# 3. Trigger redeploy
netlify deploy --prod --trigger

# 4. Verify new key works
# 5. Revoke old key in service dashboard
```

## Troubleshooting

### Build Failures

**Check build logs:**
```bash
netlify logs:deploy --site-id <site-id>
```

**Common issues:**

1. **Missing environment variables**
   ```bash
   # Verify variables are set
   netlify env:list

   # Run local environment check
   npm run check:env
   ```

2. **TypeScript errors**
   ```bash
   # Run type check locally
   npm run type-check
   ```

3. **Dependency issues**
   ```bash
   # Clear cache and reinstall
   npm run clean:all
   npm install
   ```

4. **Build timeout**
   - Optimize build by removing unnecessary files from build
   - Check `next.config.js` for performance settings
   - Consider upgrading Netlify plan

### Runtime Errors

**Check function logs:**
```bash
netlify logs:function --name=function-name
```

**Common issues:**

1. **API endpoints returning 500**
   - Check Netlify function logs
   - Verify environment variables are set
   - Check Sentry for error details

2. **Database connection issues**
   - Verify Supabase credentials
   - Check Supabase connection limits
   - Review RLS policies

3. **Rate limiting issues**
   - Check Upstash Redis connection
   - Verify Redis credentials
   - Review rate limit configuration

### Performance Issues

**Analyze bundle size:**
```bash
npm run analyze
```

**Check Web Vitals:**
- Open browser DevTools
- Navigate to Lighthouse tab
- Run performance audit

**Review Netlify Analytics:**
- Log into Netlify dashboard
- Navigate to Analytics tab
- Review Core Web Vitals

## Rollback Procedures

### Quick Rollback (Netlify Dashboard)

1. Go to: Deploys tab
2. Find the last working deployment
3. Click "Publish deploy" dropdown
4. Select "Publish" to make it live

### CLI Rollback

```bash
# List recent deploys
netlify deploys:list

# Rollback to specific deploy
netlify rollback --deploy-id <deploy-id>
```

### Git-based Rollback

```bash
# Revert last commit
git revert HEAD
git push origin main

# Revert to specific commit
git revert <commit-hash>
git push origin main

# Force rollback (use with caution)
git reset --hard <commit-hash>
git push --force origin main
```

### Database Rollback

If deployment includes database migrations:

1. **Check Supabase migration history**
   ```bash
   supabase migration list
   ```

2. **Rollback migration**
   ```bash
   supabase migration down
   ```

3. **Redeploy application**

## Performance Optimization

### Build Performance

1. **Enable build cache:**
   - Netlify automatically caches `node_modules`
   - Use `NPM_FLAGS="--prefer-offline"` in `netlify.toml`

2. **Optimize dependencies:**
   ```bash
   # Audit bundle size
   npm run analyze

   # Remove unused dependencies
   npm prune
   ```

3. **Parallel builds:**
   - Split large builds into multiple jobs in GitHub Actions
   - Use dependency caching

### Runtime Performance

1. **Enable CDN caching:**
   - Static assets cached for 1 year (configured in `netlify.toml`)
   - API responses cached appropriately

2. **Image optimization:**
   - Use Next.js Image component
   - Enable AVIF/WebP formats
   - Configure proper image sizes

3. **Edge Functions (if needed):**
   - Move compute-heavy operations to edge
   - Reduce latency for global users

### Monitoring

1. **Set up alerts:**
   - Configure Netlify notifications
   - Set up Sentry alerts for errors
   - Monitor uptime with external service

2. **Track Web Vitals:**
   - Configure Google Analytics
   - Review Core Web Vitals regularly
   - Use RUM (Real User Monitoring)

3. **Performance budgets:**
   - Set Lighthouse CI thresholds
   - Monitor bundle size
   - Track API response times

## Security Checklist

- [ ] All secrets stored in environment variables (never in code)
- [ ] HTTPS enforced (automatic with Netlify)
- [ ] Security headers configured (`netlify.toml`)
- [ ] CSP policy configured
- [ ] Dependencies regularly updated
- [ ] Security audit passing (`npm audit`)
- [ ] Sentry configured for error tracking
- [ ] Rate limiting enabled
- [ ] CORS properly configured

## Production Readiness Checklist

Before going live:

- [ ] All environment variables set in Netlify
- [ ] DNS configured and pointing to Netlify
- [ ] SSL certificate active
- [ ] Google Analytics configured
- [ ] Sentry error tracking enabled
- [ ] All tests passing
- [ ] Security audit passed
- [ ] Performance audit passed (Lighthouse score >90)
- [ ] Stripe webhooks configured
- [ ] Email service configured
- [ ] Backup strategy in place
- [ ] Monitoring and alerts configured
- [ ] Documentation up to date

## Support

For deployment issues:

1. Check this documentation
2. Review [Netlify documentation](https://docs.netlify.com)
3. Check GitHub Actions logs
4. Review Sentry errors
5. Contact the team lead

## Additional Resources

- [Netlify Documentation](https://docs.netlify.com)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
- [Environment Setup Guide](./docs/ENVIRONMENT_SETUP.md)
- [Production Checklist](./docs/PRODUCTION_CHECKLIST.md)
