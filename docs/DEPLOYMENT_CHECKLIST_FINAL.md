# Production Deployment Checklist - HumanGlue Platform

Use this checklist before every production deployment to ensure all critical items are verified.

## Pre-Deployment Checklist

### Code Quality
- [ ] All PR checks passing (lint, type-check, tests)
- [ ] Code review completed and approved
- [ ] No merge conflicts with main branch
- [ ] Branch is up to date with main
- [ ] All TypeScript errors resolved
- [ ] No ESLint warnings in critical code
- [ ] Prettier formatting applied

### Testing
- [ ] Unit tests passing (100% of critical code)
- [ ] Integration tests passing
- [ ] E2E tests passing on staging
- [ ] Manual testing completed on staging
- [ ] Cross-browser testing completed (Chrome, Firefox, Safari)
- [ ] Mobile responsiveness verified
- [ ] Accessibility tests passing (WCAG AA)

### Database
- [ ] Database migrations tested on staging
- [ ] Migration rollback procedure documented
- [ ] Database backup created (production)
- [ ] RLS policies reviewed and tested
- [ ] No breaking schema changes without migration path
- [ ] Database indexes optimized for new queries

### Security
- [ ] No secrets committed to git
- [ ] Environment variables configured correctly
- [ ] API rate limiting tested
- [ ] CORS configuration verified
- [ ] Authentication flows tested
- [ ] Authorization rules verified
- [ ] Security headers configured
- [ ] SSL certificate valid
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Dependency vulnerabilities resolved (critical + high)

### Performance
- [ ] Lighthouse score > 90 (all categories)
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] TTFB < 500ms
- [ ] Bundle size analyzed and optimized
- [ ] Images optimized (WebP/AVIF)
- [ ] Critical CSS inlined
- [ ] Unnecessary dependencies removed

### Configuration
- [ ] All environment variables set in Netlify
- [ ] Correct Supabase project selected (production)
- [ ] Correct Stripe keys configured (live mode)
- [ ] Email service configured
- [ ] Error tracking enabled (Sentry)
- [ ] Analytics enabled
- [ ] CDN caching configured
- [ ] Function timeout settings verified

### Documentation
- [ ] API documentation updated
- [ ] README updated with new features
- [ ] CHANGELOG updated
- [ ] Migration guide written (if breaking changes)
- [ ] User-facing documentation updated
- [ ] Runbook updated (if new procedures)

## Deployment Process

### 1. Final Verification
- [ ] Merge develop into main (or feature into main for hotfix)
- [ ] Tag release: `git tag v1.x.x`
- [ ] Push tag: `git push origin v1.x.x`

### 2. Monitor Deployment
- [ ] GitHub Actions workflow started
- [ ] All CI checks passing
- [ ] Database migrations completed successfully
- [ ] Netlify build succeeded
- [ ] Deployment published

### 3. Smoke Testing (within 5 minutes of deployment)
- [ ] Homepage loads without errors
- [ ] Authentication works (login/logout)
- [ ] Admin dashboard accessible
- [ ] Instructor dashboard accessible
- [ ] API health endpoint responds
- [ ] Database queries working
- [ ] Real-time features working
- [ ] Payment processing works (test transaction)
- [ ] Critical user flows tested

### 4. Performance Verification
- [ ] Response times < baseline
- [ ] Error rate < 0.1%
- [ ] No console errors in production
- [ ] CDN serving assets correctly
- [ ] Database queries performing well

### 5. Monitoring
- [ ] No errors in Sentry (first 15 minutes)
- [ ] Web Vitals metrics acceptable
- [ ] Netlify analytics showing traffic
- [ ] User sessions active
- [ ] No spike in error rate

## Post-Deployment Checklist

### Immediate (0-15 minutes)
- [ ] Verify deployment succeeded
- [ ] Run health check script
- [ ] Check error tracking dashboard
- [ ] Monitor user sessions
- [ ] Verify no spike in errors
- [ ] Test critical user paths manually
- [ ] Check real-time features
- [ ] Verify database connectivity

### Short-term (15-60 minutes)
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Review user feedback channels
- [ ] Check support tickets for issues
- [ ] Verify analytics tracking
- [ ] Monitor server resources
- [ ] Check API rate limits
- [ ] Review CDN cache hit rates

### Long-term (1-24 hours)
- [ ] Review error trends
- [ ] Analyze performance data
- [ ] Check Web Vitals trends
- [ ] Review user feedback
- [ ] Monitor conversion rates
- [ ] Check database performance
- [ ] Review function execution times
- [ ] Analyze traffic patterns

### Follow-up (within 1 week)
- [ ] Write deployment retrospective
- [ ] Update documentation
- [ ] Create follow-up tickets
- [ ] Share learnings with team
- [ ] Update deployment procedures
- [ ] Plan next deployment

## Rollback Checklist

If issues are detected, follow this rollback procedure:

### Immediate Rollback (within 5 minutes of issue)
- [ ] Identify the issue severity (SEV-1, SEV-2, etc.)
- [ ] Notify team in #incidents channel
- [ ] Access Netlify dashboard
- [ ] Click "Rollback" on previous deployment
- [ ] Verify rollback succeeded
- [ ] Test critical paths work again
- [ ] Notify stakeholders

### Investigation
- [ ] Identify root cause
- [ ] Document issue in post-mortem
- [ ] Create hotfix branch
- [ ] Write fix and tests
- [ ] Deploy to staging
- [ ] Test fix thoroughly
- [ ] Deploy hotfix to production

## Emergency Hotfix Checklist

For critical production issues:

### 1. Assess Severity
- [ ] SEV-1: Complete outage → Immediate action
- [ ] SEV-2: Major feature broken → 15-minute response
- [ ] SEV-3: Minor degradation → 2-hour response

### 2. Create Hotfix
- [ ] Create hotfix branch from main
- [ ] Make minimal necessary changes
- [ ] Write test for the bug
- [ ] Verify fix locally
- [ ] Get fast-track code review

### 3. Deploy Hotfix
- [ ] Deploy to staging first (if time permits)
- [ ] Test on staging
- [ ] Merge to main
- [ ] Monitor deployment
- [ ] Verify fix in production

### 4. Post-Hotfix
- [ ] Backport fix to develop
- [ ] Write post-mortem
- [ ] Update tests to catch regression
- [ ] Document in CHANGELOG

## Feature Flag Checklist

For gradual rollouts:

- [ ] Feature flag created
- [ ] Default state: off
- [ ] Tested with flag on/off
- [ ] Rollout plan documented
- [ ] Monitoring in place
- [ ] Rollback procedure ready

### Rollout Phases
- [ ] Phase 1: Internal team (1%)
- [ ] Phase 2: Beta users (10%)
- [ ] Phase 3: Subset of users (25%)
- [ ] Phase 4: Half of users (50%)
- [ ] Phase 5: All users (100%)
- [ ] Remove feature flag code

## Database Migration Checklist

For deployments with schema changes:

### Before Migration
- [ ] Migration tested on staging
- [ ] Backup created
- [ ] Rollback plan documented
- [ ] Migration is idempotent (can run multiple times)
- [ ] Migration is backwards compatible
- [ ] Estimated downtime < 5 minutes (or zero-downtime)

### During Migration
- [ ] Enable maintenance mode (if needed)
- [ ] Run migration
- [ ] Verify migration success
- [ ] Run data validation queries
- [ ] Disable maintenance mode

### After Migration
- [ ] Verify application works with new schema
- [ ] Check for migration errors in logs
- [ ] Monitor database performance
- [ ] Document schema changes

## Third-Party Service Checklist

Before relying on new external services:

- [ ] Service status page monitored
- [ ] API rate limits understood
- [ ] Error handling implemented
- [ ] Retry logic in place
- [ ] Fallback behavior defined
- [ ] Service credentials secured
- [ ] Service SLA reviewed
- [ ] Cost monitoring enabled

## Compliance Checklist

For production deployments:

- [ ] GDPR compliance verified
- [ ] User data handling reviewed
- [ ] Privacy policy updated
- [ ] Terms of service updated
- [ ] Cookie consent implemented
- [ ] Data retention policies followed
- [ ] Security audit completed
- [ ] Accessibility compliance (WCAG AA)

## Communication Checklist

### Before Deployment
- [ ] Notify stakeholders of planned deployment
- [ ] Announce maintenance window (if needed)
- [ ] Prepare status page update

### During Deployment
- [ ] Update status page (if user-facing)
- [ ] Monitor support channels
- [ ] Keep team informed

### After Deployment
- [ ] Announce successful deployment
- [ ] Update release notes
- [ ] Notify users of new features
- [ ] Close deployment ticket

## Sign-off

**Deployment Date**: _______________

**Release Version**: _______________

**Deployed By**: _______________

**Approved By**: _______________

**Checklist Completed**: _______________

**Notes**:
_______________________________________________________
_______________________________________________________
_______________________________________________________

---

## Quick Reference Commands

```bash
# Health check
npm run health-check:production

# Rollback
netlify rollback

# View logs
netlify functions:logs

# Check deployment status
netlify status

# Run migrations
npm run migrate:production

# Emergency: Disable feature
netlify env:set NEXT_PUBLIC_ENABLE_FEATURE "false" --context production
```

---

**Last Updated**: October 2025
**Version**: 1.0.0
**Template Version**: 1.0
