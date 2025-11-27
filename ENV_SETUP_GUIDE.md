# Environment Variables Setup Guide

**Last Updated:** November 26, 2025

This guide will help you configure all environment variables needed for the HumanGlue platform to run with all newly implemented features.

---

## 🚀 Quick Setup Checklist

- [ ] Supabase variables (already configured)
- [ ] Sentry error tracking
- [ ] Stripe payment processing
- [ ] Anthropic AI (for assessments)
- [ ] Email service (optional for now)

---

## 1. Supabase Configuration ✅

**Status:** Should already be configured

```bash
NEXT_PUBLIC_SUPABASE_URL=https://egqqdscvxvtwcdwknbnt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
```

**Where to find:**
- Supabase Dashboard → Project Settings → API
- URL: Listed as "Project URL"
- Anon Key: Listed as "anon public"
- Service Role Key: Listed as "service_role" (secret)

---

## 2. Sentry Error Tracking 🆕 REQUIRED

**Status:** Newly implemented, needs configuration

### Step 1: Create Sentry Account
1. Go to [sentry.io](https://sentry.io)
2. Sign up or log in
3. Create a new project:
   - Platform: **Next.js**
   - Project name: **humanglue** (or your choice)

### Step 2: Get Your DSN
1. After creating project, you'll see a DSN
2. Copy the DSN (format: `https://[key]@o[org-id].ingest.sentry.io/[project-id]`)

### Step 3: Generate Auth Token
1. Sentry Dashboard → Settings → Account → Auth Tokens
2. Click "Create New Token"
3. Name: "HumanGlue Source Maps"
4. Scopes needed:
   - `project:read`
   - `project:releases`
   - `org:read`
5. Copy the token (starts with `sntrys_`)

### Step 4: Get Organization Info
1. Settings → General Settings
2. Copy your "Organization Slug"

### Environment Variables:
```bash
# Required - Client-side error tracking
NEXT_PUBLIC_SENTRY_DSN=https://[key]@o[org-id].ingest.sentry.io/[project-id]

# Required - For source maps upload
SENTRY_AUTH_TOKEN=sntrys_[your-token]
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=humanglue

# Optional - Environment detection
SENTRY_ENVIRONMENT=production  # or staging, development
```

### Test After Setup:
1. Deploy to Netlify
2. Visit `https://your-site.netlify.app/test-sentry`
3. Click test error buttons
4. Check Sentry dashboard for captured errors
5. **Important:** Delete `/app/test-sentry/page.tsx` before production launch

---

## 3. Stripe Payment Processing 🆕 REQUIRED

**Status:** Newly implemented, needs configuration

### Step 1: Get Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Sign up or log in
3. Start in **Test Mode** (toggle in top left)

### Step 2: Get API Keys
1. Stripe Dashboard → Developers → API Keys
2. Copy both keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### Step 3: Configure Webhook
**Important:** Do this AFTER deploying to Netlify

1. Stripe Dashboard → Developers → Webhooks
2. Click "+ Add endpoint"
3. Endpoint URL: `https://your-site.netlify.app/.netlify/functions/stripe-webhook`
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)

### Environment Variables:
```bash
# Publishable Key - Safe for client-side
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_[your-key]

# Secret Key - Server-side only
STRIPE_SECRET_KEY=sk_test_[your-key]

# Webhook Secret - For signature verification
STRIPE_WEBHOOK_SECRET=whsec_[your-secret]
```

### Test Cards:
```
Success:        4242 4242 4242 4242
Decline:        4000 0000 0000 0002
Insufficient:   4000 0000 0000 9995
Auth Required:  4000 0025 0000 3155
```

### Going Live (Later):
1. Switch to "Live Mode" in Stripe
2. Get live keys (start with `pk_live_` and `sk_live_`)
3. Update environment variables
4. Update webhook endpoint
5. Test with real (small amount) transactions first

---

## 4. Anthropic AI (Claude) 🆕 OPTIONAL

**Status:** Used for assessment insights, has fallback

### Step 1: Get API Key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Click "Get API keys"
4. Create new key
5. Copy the key (starts with `sk-ant-`)

### Environment Variable:
```bash
# Optional - Assessment AI insights (has rule-based fallback)
ANTHROPIC_API_KEY=sk-ant-[your-key]
```

**Note:** If not configured, assessments will use rule-based insights instead of AI-powered ones. Both work well.

---

## 5. Email Service (Resend) - OPTIONAL FOR NOW

**Status:** Ready for implementation, not critical for beta

### Step 1: Get Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up (100 emails/day free)
3. Verify your email domain (or use test domain)

### Step 2: Get API Key
1. Dashboard → API Keys
2. Create new API key
3. Copy the key (starts with `re_`)

### Environment Variable:
```bash
# Optional - Email notifications
RESEND_API_KEY=re_[your-key]
```

**Note:** Email stubs are in place. Emails aren't critical for beta launch but should be added before full production.

---

## 📋 Complete Environment Variables List

### For Netlify Dashboard (Production)

Go to: Netlify Dashboard → Site Settings → Environment Variables

```bash
# ============================================================================
# SUPABASE - Already Configured ✅
# ============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://egqqdscvxvtwcdwknbnt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# ============================================================================
# SENTRY - NEW, REQUIRED 🆕
# ============================================================================
NEXT_PUBLIC_SENTRY_DSN=https://[key]@o[org-id].ingest.sentry.io/[project-id]
SENTRY_AUTH_TOKEN=sntrys_[your-token]
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=humanglue
SENTRY_ENVIRONMENT=production

# ============================================================================
# STRIPE - NEW, REQUIRED 🆕
# ============================================================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_[your-key]
STRIPE_SECRET_KEY=sk_test_[your-key]
STRIPE_WEBHOOK_SECRET=whsec_[your-secret]

# ============================================================================
# ANTHROPIC - NEW, OPTIONAL 🆕
# ============================================================================
ANTHROPIC_API_KEY=sk-ant-[your-key]

# ============================================================================
# EMAIL - OPTIONAL (for future)
# ============================================================================
# RESEND_API_KEY=re_[your-key]

# ============================================================================
# EXISTING - Should already be set
# ============================================================================
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app
NEXT_PUBLIC_APP_NAME=HumanGlue
NEXT_PUBLIC_ENV=production
```

### For Local Development (.env.local)

```bash
# Copy these to .env.local for local development
# Same values as above but for localhost

NEXT_PUBLIC_SITE_URL=http://localhost:5040

# Enable Sentry in dev (optional)
SENTRY_ENABLE_IN_DEV=true

# Use Stripe test mode
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Rest same as production
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SENTRY_DSN=...
ANTHROPIC_API_KEY=...
```

---

## 🧪 Testing After Configuration

### 1. Test Sentry
```bash
# Visit in browser
https://your-site.netlify.app/test-sentry

# Click test buttons, check Sentry dashboard
# Delete test page after verification
```

### 2. Test Stripe Payments
```bash
# Use provided test script
./scripts/test-stripe-payment.sh

# Or manually:
# 1. Browse workshops
# 2. Register for workshop
# 3. Use test card: 4242 4242 4242 4242
# 4. Check database for payment record
```

### 3. Test Assessments
```bash
# 1. Start new assessment
# 2. Answer questions
# 3. Submit assessment
# 4. View results with AI insights
```

### 4. Check Function Logs
```bash
# Netlify Dashboard → Functions → View logs
# Look for errors or warnings
```

---

## ⚠️ Security Best Practices

1. **Never commit secrets to git**
   - `.env.local` is in `.gitignore`
   - Never push actual keys to repository

2. **Use test mode first**
   - Test all Stripe features with test keys
   - Only switch to live keys when ready

3. **Rotate secrets regularly**
   - Change API keys every 90 days
   - Especially after team member changes

4. **Monitor usage**
   - Check Sentry for unusual error patterns
   - Check Stripe for suspicious payments
   - Check API usage for quota issues

5. **Separate environments**
   - Different keys for dev/staging/production
   - Test mode for development
   - Live mode only for production

---

## 🚨 Troubleshooting

### Sentry not capturing errors
- Check `NEXT_PUBLIC_SENTRY_DSN` is set
- Visit `/test-sentry` to verify
- Check Netlify build logs for Sentry config errors
- Verify auth token has correct permissions

### Stripe payments failing
- Verify all 3 Stripe env vars are set
- Check webhook is configured and active
- Use test cards from this guide
- Check function logs for webhook errors
- Verify webhook secret matches

### Assessments not generating insights
- Check if `ANTHROPIC_API_KEY` is set
- Verify API key is valid
- Check Netlify function logs
- Should fall back to rule-based if AI fails

### Functions not working
- Check all required env vars are set
- Verify Supabase keys are correct
- Check function logs in Netlify
- Test locally with `netlify dev`

---

## 📞 Getting Help

1. Check implementation docs:
   - [SENTRY_IMPLEMENTATION.md](SENTRY_IMPLEMENTATION.md)
   - [STRIPE_PAYMENT_IMPLEMENTATION.md](STRIPE_PAYMENT_IMPLEMENTATION.md)
   - [WORKSHOP_API.md](docs/WORKSHOP_API.md)

2. Check Netlify function logs

3. Check Sentry error dashboard

4. Review [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md)

---

## ✅ Configuration Complete Checklist

- [ ] Supabase variables confirmed working
- [ ] Sentry account created
- [ ] Sentry DSN configured
- [ ] Sentry auth token configured
- [ ] Stripe account created (test mode)
- [ ] Stripe API keys configured
- [ ] Stripe webhook endpoint created
- [ ] Stripe webhook secret configured
- [ ] Anthropic API key configured (optional)
- [ ] All variables added to Netlify
- [ ] All variables added to .env.local
- [ ] Tested error capture
- [ ] Tested payment flow
- [ ] Tested assessments
- [ ] Deleted test-sentry page (after testing)

---

**Ready to Deploy!** 🚀

Once all required variables are configured, your platform will have:
- ✅ Error tracking and monitoring
- ✅ Payment processing
- ✅ Workshop registration
- ✅ AI-powered assessments
- ✅ Full production readiness

---

*Last updated: November 26, 2025*
