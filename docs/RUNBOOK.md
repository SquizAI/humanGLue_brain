# HumanGlue Platform - Operations Runbook

This runbook provides step-by-step procedures for common operational tasks, incident response, and troubleshooting.

## Table of Contents

- [Emergency Contacts](#emergency-contacts)
- [Incident Response](#incident-response)
- [Common Issues](#common-issues)
- [Routine Maintenance](#routine-maintenance)
- [Monitoring Dashboards](#monitoring-dashboards)
- [Recovery Procedures](#recovery-procedures)

## Emergency Contacts

### On-Call Schedule

| Role | Contact | Escalation |
|------|---------|------------|
| Primary On-Call | See PagerDuty | Engineering Manager |
| Database Admin | See internal docs | CTO |
| DevOps Lead | See internal docs | VP Engineering |

### External Vendors

| Service | Status Page | Support |
|---------|-------------|---------|
| **Netlify** | https://netlifystatus.com | support@netlify.com |
| **Supabase** | https://status.supabase.com | support@supabase.io |
| **Stripe** | https://status.stripe.com | https://support.stripe.com |
| **Sentry** | https://status.sentry.io | support@sentry.io |

## Incident Response

### Severity Levels

**SEV-1: Critical** - Complete service outage
- Response time: Immediate
- Examples: Site down, database offline, payment processing broken

**SEV-2: High** - Major feature broken
- Response time: 15 minutes
- Examples: Authentication failing, admin portal inaccessible

**SEV-3: Medium** - Minor feature degradation
- Response time: 2 hours
- Examples: Slow load times, non-critical API errors

**SEV-4: Low** - Cosmetic or minor issues
- Response time: Next business day
- Examples: UI glitches, typos, minor analytics issues

### Incident Response Procedure

#### 1. Acknowledge (0-5 minutes)

```bash
# Immediate actions
1. Acknowledge the alert
2. Post in #incidents Slack channel
3. Create incident ticket
4. Notify relevant stakeholders
```

#### 2. Assess (5-15 minutes)

```bash
# Check health status
npm run health-check:production

# Check error tracking
open https://sentry.io/organizations/humanglue/issues/

# Check monitoring
- Netlify dashboard: https://app.netlify.com
- Supabase dashboard: https://app.supabase.com
- Uptime monitor: Check configured monitor

# Check recent deploys
netlify deploys:list

# Review recent changes
git log --oneline -10
```

#### 3. Mitigate (15-30 minutes)

```bash
# If recent deployment caused issue
netlify rollback

# If database issue
# Check Supabase dashboard for alerts
# Review recent migrations

# If external service issue
# Check status pages for Netlify, Supabase, Stripe
# Enable maintenance mode if needed
```

#### 4. Resolve (30+ minutes)

```bash
# Create hotfix branch
git checkout -b hotfix/incident-TICKET

# Make fix
# Test locally
npm run build
npm run test

# Deploy to staging
git push origin hotfix/incident-TICKET

# Test on staging
npm run health-check:staging

# Deploy to production (after approval)
git checkout main
git merge hotfix/incident-TICKET
git push origin main
```

#### 5. Post-Incident (within 24 hours)

- [ ] Write post-mortem
- [ ] Identify root cause
- [ ] Document preventive measures
- [ ] Update runbook
- [ ] Create follow-up tickets
- [ ] Schedule team review

## Common Issues

### Issue: Site is Down (504 Gateway Timeout)

**Symptoms**: Users cannot access the site, 504 errors

**Diagnosis**:
```bash
# Check if Netlify is serving the site
curl -I https://humanglue.ai

# Check function logs
netlify functions:logs

# Check build status
netlify status
```

**Resolution**:
```bash
# If build failed, check build logs
netlify logs:deploy

# If functions timing out, check function execution time
# in Netlify dashboard

# Quick fix: Rollback to last working deployment
netlify rollback

# Long-term fix: Optimize slow functions
# Increase timeout in netlify.toml if needed
```

**Prevention**:
- Set up deployment previews
- Add E2E tests
- Monitor function execution time

---

### Issue: Database Connection Errors

**Symptoms**: "Failed to connect to database", API returning 500 errors

**Diagnosis**:
```bash
# Test database connection
psql $SUPABASE_PRODUCTION_DB_URL

# Check Supabase dashboard
open https://app.supabase.com

# Check environment variables
netlify env:list | grep SUPABASE
```

**Resolution**:
```bash
# If connection string is wrong
netlify env:set SUPABASE_SERVICE_ROLE_KEY "correct-key" --context production

# If Supabase is down, check status page
open https://status.supabase.com

# If connection pool exhausted, restart Supabase pooler
# (via Supabase dashboard)
```

**Prevention**:
- Monitor connection pool usage
- Implement connection pooling
- Set up database alerts

---

### Issue: High Error Rate (Sentry Alerts)

**Symptoms**: Spike in error rate, Sentry alert triggered

**Diagnosis**:
```bash
# Check Sentry dashboard
open https://sentry.io/organizations/humanglue/issues/

# Identify error pattern
# - Is it a new error?
# - Which endpoint?
# - Which users are affected?

# Check recent deployments
git log --oneline --since="1 hour ago"
```

**Resolution**:
```bash
# If error is from recent deployment
netlify rollback

# If error is environmental
# - Check external service status
# - Verify environment variables
# - Check rate limits

# If error is code-related
# - Create hotfix
# - Deploy to staging
# - Test and deploy to production
```

**Prevention**:
- Add error monitoring tests
- Implement better error handling
- Add retry logic for external APIs

---

### Issue: Slow Page Load Times

**Symptoms**: Pages loading slowly, high TTFB, poor Web Vitals

**Diagnosis**:
```bash
# Check Web Vitals
# View in analytics dashboard or browser DevTools

# Run Lighthouse
npm install -g lighthouse
lighthouse https://humanglue.ai --view

# Check CDN cache hit rate
# Netlify analytics dashboard

# Profile API endpoints
# Use browser Network tab
```

**Resolution**:
```bash
# Quick fixes
1. Check if recent deployment added large bundles
2. Verify CDN caching is working
3. Check database query performance

# Long-term fixes
1. Optimize images (use Next.js Image)
2. Implement code splitting
3. Add database indexes
4. Optimize API queries
5. Enable static generation where possible
```

**Prevention**:
- Set performance budgets
- Run Lighthouse CI on every deployment
- Monitor Web Vitals
- Implement caching strategies

---

### Issue: Authentication Failures

**Symptoms**: Users cannot log in, "Invalid credentials" errors

**Diagnosis**:
```bash
# Check Supabase Auth dashboard
open https://app.supabase.com

# Check auth-related environment variables
netlify env:list | grep -E "(SUPABASE|JWT)"

# Check Sentry for auth errors
# Filter by error type: "AuthError"

# Test authentication flow manually
```

**Resolution**:
```bash
# If Supabase Auth is down
# Check status: https://status.supabase.com

# If JWT secret is wrong
netlify env:set SUPABASE_SERVICE_ROLE_KEY "correct-key" --context production

# If rate limiting is triggered
# Check Upstash Redis dashboard
# Temporarily increase rate limits if needed

# If session storage is full
# Clear old sessions in Supabase dashboard
```

**Prevention**:
- Monitor auth success rate
- Implement session cleanup job
- Add auth E2E tests

---

### Issue: Payment Processing Failures

**Symptoms**: Stripe webhooks failing, payment not completing

**Diagnosis**:
```bash
# Check Stripe dashboard
open https://dashboard.stripe.com

# Check webhook delivery
# Stripe > Developers > Webhooks > View logs

# Check Netlify function logs
netlify functions:logs webhook-stripe

# Verify webhook secret
netlify env:list | grep STRIPE_WEBHOOK_SECRET
```

**Resolution**:
```bash
# If webhook secret is wrong
# Get new secret from Stripe dashboard
netlify env:set STRIPE_WEBHOOK_SECRET "whsec_..." --context production

# If webhook function is failing
# Check function logs for errors
# Fix code and redeploy

# If Stripe is down
# Check status: https://status.stripe.com
# Payments will be queued and retried automatically
```

**Prevention**:
- Monitor webhook success rate
- Add webhook retry logic
- Set up Stripe alerts
- Test webhook handling in staging

## Routine Maintenance

### Daily Tasks

- [ ] Review error rates in Sentry
- [ ] Check deployment status
- [ ] Review performance metrics
- [ ] Check uptime monitoring

### Weekly Tasks

- [ ] Review security audit reports
- [ ] Check dependency updates
- [ ] Review and triage open issues
- [ ] Backup production database
- [ ] Review and optimize slow queries

### Monthly Tasks

- [ ] Review and update documentation
- [ ] Security patches and updates
- [ ] Performance optimization review
- [ ] Capacity planning review
- [ ] Review and update runbook

### Quarterly Tasks

- [ ] Full security audit
- [ ] Disaster recovery drill
- [ ] Review and update incident procedures
- [ ] Team training on new procedures
- [ ] Review SLA compliance

## Monitoring Dashboards

### Primary Dashboards

1. **Netlify Dashboard**
   - URL: https://app.netlify.com
   - Metrics: Deployments, bandwidth, function errors

2. **Sentry Dashboard**
   - URL: https://sentry.io/organizations/humanglue
   - Metrics: Error rate, affected users, performance

3. **Supabase Dashboard**
   - URL: https://app.supabase.com
   - Metrics: Database performance, auth metrics, storage

4. **Analytics Dashboard**
   - URL: Configure your analytics platform
   - Metrics: User traffic, conversions, Web Vitals

### Key Metrics to Monitor

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Uptime | 99.9% | < 99.5% |
| Error Rate | < 0.1% | > 1% |
| Response Time (p95) | < 500ms | > 1000ms |
| LCP | < 2.5s | > 4s |
| CLS | < 0.1 | > 0.25 |
| Database CPU | < 70% | > 85% |
| Function Execution | < 10s | > 25s |

## Recovery Procedures

### Database Recovery

#### Restore from Backup

```bash
# List available backups
supabase db dump --db-url $SUPABASE_PRODUCTION_DB_URL

# Restore from backup
# 1. Download backup from Supabase dashboard
# 2. Create new database
# 3. Restore backup
psql $NEW_DB_URL < backup.sql

# 4. Update environment variables
netlify env:set DATABASE_URL $NEW_DB_URL --context production

# 5. Verify data integrity
npm run health-check:production
```

#### Point-in-Time Recovery

```bash
# Use Supabase dashboard for PITR
# 1. Go to Database > Backups
# 2. Select point in time
# 3. Create recovery instance
# 4. Verify data
# 5. Switch production to recovery instance
```

### Application Recovery

#### Full Site Recovery

```bash
# If entire site needs to be rebuilt

# 1. Clone repository
git clone https://github.com/your-org/humanglue.git
cd humanglue

# 2. Install dependencies
npm ci

# 3. Build application
npm run build

# 4. Create new Netlify site
netlify sites:create --name humanglue-recovery

# 5. Set environment variables
netlify env:import .env.production

# 6. Deploy
netlify deploy --prod

# 7. Update DNS to point to new site
```

### Data Recovery

#### Recover Deleted Data

```bash
# If using Supabase soft deletes
# Restore from deleted_at timestamp

# If hard deleted, restore from backup
# See Database Recovery section
```

## Escalation Procedures

### Level 1: On-Call Engineer
- Initial response to all incidents
- Can resolve most common issues
- Escalates if unable to resolve within 30 minutes

### Level 2: Engineering Manager
- Coordinates complex incidents
- Allocates additional resources
- Makes deployment decisions

### Level 3: CTO / VP Engineering
- Major incidents affecting all users
- Business-critical decisions
- External communications

## Communication Templates

### Incident Notification

```
Subject: [SEV-X] Brief description of incident

Impact: What is affected
Started: Timestamp
Status: Investigating / Mitigating / Resolved
ETA: Estimated time to resolution

Details: Brief description of what happened
Next Update: When to expect next update
```

### Resolution Notification

```
Subject: [RESOLVED] Brief description of incident

The incident has been resolved.

Root Cause: What caused the issue
Resolution: What was done to fix it
Prevention: Steps to prevent recurrence
Post-Mortem: Link to detailed analysis
```

---

**Last Updated**: October 2025
**Version**: 1.0.0
**Owner**: DevOps Team
