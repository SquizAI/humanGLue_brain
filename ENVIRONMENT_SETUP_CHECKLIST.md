# HumanGlue Platform - Environment Setup Checklist

**Date:** October 4, 2025
**Status:** ⚠️ **ACTION REQUIRED** - Credentials Needed

---

## 🔴 CRITICAL SECURITY ACTIONS

### 1. Rotate Exposed API Keys (IMMEDIATE)

The following API keys were previously exposed in code and **MUST be rotated immediately**:

- [ ] **VAPI API Key** - Found hardcoded in 9 script files (now fixed)
  - Old key: `0be862d8-7e91-4f40-b559-5a25b33525c0`
  - Action: Go to https://vapi.ai → Settings → API Keys → Revoke old key → Create new key

### 2. Files Fixed
- ✅ Removed hardcoded VAPI keys from 9 script files
- ✅ All scripts now use `process.env.VAPI_API_KEY`
- ✅ Added `.claudecode/` to `.gitignore`

---

## 📋 Environment Variables Status

### ✅ **CONFIGURED** (Already Set)

| Variable | Status | Provider |
|----------|--------|----------|
| `OPENAI_API_KEY` | ✅ Configured | OpenAI |
| `GOOGLE_AI_API_KEY` | ✅ Configured | Google AI |
| `GEMINI_API_KEY` | ✅ Configured | Google AI |
| `ANTHROPIC_API_KEY` | ✅ Configured | Anthropic |
| `FIRECRAWL_API_KEY` | ✅ Configured | Firecrawl |
| `NEXT_PUBLIC_ENV` | ✅ Configured | Application |
| `NODE_ENV` | ✅ Configured | Application |
| `NEXT_PUBLIC_SITE_URL` | ✅ Configured | Application |
| `NEXT_PUBLIC_APP_NAME` | ✅ Configured | Application |

### ⚠️ **REQUIRED** (Needs Your Input)

#### Supabase (Database & Auth)
**Priority:** 🔴 **CRITICAL** - Platform won't work without this

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - **Where to find:** https://app.supabase.com/project/_/settings/api
  - **Format:** `https://your-project-id.supabase.co`
  - **Current:** `YOUR_SUPABASE_URL_HERE` (placeholder)

- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - **Where to find:** https://app.supabase.com/project/_/settings/api
  - **Type:** Public Anonymous Key (safe for client-side)
  - **Format:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
  - **Current:** `YOUR_SUPABASE_ANON_KEY_HERE` (placeholder)

- [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - **Where to find:** https://app.supabase.com/project/_/settings/api
  - **Type:** Service Role Key (server-side only - bypasses RLS)
  - **⚠️ SECURITY:** Never expose to client, only for Netlify Functions
  - **Format:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
  - **Current:** `YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE` (placeholder)

- [ ] `NEXT_PUBLIC_SUPABASE_STORAGE_URL`
  - **Auto-generate from:** `{NEXT_PUBLIC_SUPABASE_URL}/storage/v1`
  - **Current:** `YOUR_SUPABASE_URL_HERE/storage/v1` (placeholder)

#### Stripe (Payment Processing)
**Priority:** 🟡 **HIGH** - Required for checkout/payments

- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - **Where to find:** https://dashboard.stripe.com/apikeys
  - **Use:** Test key for development (`pk_test_...`)
  - **Format:** `pk_test_51...`
  - **Current:** `YOUR_STRIPE_PUBLISHABLE_KEY_HERE` (placeholder)

- [ ] `STRIPE_SECRET_KEY`
  - **Where to find:** https://dashboard.stripe.com/apikeys
  - **Use:** Test key for development (`sk_test_...`)
  - **⚠️ SECURITY:** Server-side only
  - **Format:** `sk_test_51...`
  - **Current:** `YOUR_STRIPE_SECRET_KEY_HERE` (placeholder)

- [ ] `STRIPE_WEBHOOK_SECRET`
  - **Where to find:** https://dashboard.stripe.com/webhooks
  - **Setup:** Create webhook pointing to `/api/stripe-webhook`
  - **Format:** `whsec_...`
  - **Current:** `YOUR_STRIPE_WEBHOOK_SECRET_HERE` (placeholder)

#### VAPI (Voice AI)
**Priority:** 🟢 **MEDIUM** - Required for voice assessments

- [ ] `VAPI_API_KEY`
  - **Action:** Go to https://vapi.ai → Create new key (old one was exposed)
  - **⚠️ SECURITY:** Server-side only
  - **Current:** `YOUR_VAPI_API_KEY_HERE` (placeholder)

- [ ] `NEXT_PUBLIC_VAPI_PUBLIC_KEY`
  - **Where to find:** https://vapi.ai → Settings → Public Key
  - **Type:** Public key (safe for client-side)
  - **Current:** `YOUR_VAPI_PUBLIC_KEY_HERE` (placeholder)

- [ ] `VAPI_PHONE_NUMBER_ID`
  - **Where to find:** https://vapi.ai → Phone Numbers
  - **Optional:** Only needed for outbound calls
  - **Current:** `YOUR_VAPI_PHONE_NUMBER_ID_HERE` (placeholder)

- [ ] `VAPI_ASSISTANT_ID`
  - **Where to find:** https://vapi.ai → Assistants
  - **Optional:** Only needed if using pre-configured assistant
  - **Current:** `YOUR_VAPI_ASSISTANT_ID_HERE` (placeholder)

#### Upstash Redis (Rate Limiting)
**Priority:** 🟢 **LOW** - Optional but recommended

- [ ] `UPSTASH_REDIS_REST_URL`
  - **Where to find:** https://console.upstash.com → Redis → REST API
  - **Format:** `https://your-redis.upstash.io`
  - **Current:** `YOUR_UPSTASH_REDIS_URL_HERE` (placeholder)

- [ ] `UPSTASH_REDIS_REST_TOKEN`
  - **Where to find:** https://console.upstash.com → Redis → REST API
  - **Format:** `AYA...`
  - **Current:** `YOUR_UPSTASH_REDIS_TOKEN_HERE` (placeholder)

---

## 🚀 Quick Setup Guide

### Step 1: Get Supabase Credentials (REQUIRED)

1. Go to https://app.supabase.com
2. Select your project (or create new one)
3. Navigate to **Settings** → **API**
4. Copy the following and update `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SUPABASE_STORAGE_URL=https://xxxxx.supabase.co/storage/v1
```

### Step 2: Set Up Stripe (For Payments)

1. Go to https://dashboard.stripe.com/test/apikeys
2. Get your test keys:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_SECRET_KEY=sk_test_51...
```

3. Set up webhook:
   - Go to https://dashboard.stripe.com/test/webhooks
   - Add endpoint: `https://your-site.netlify.app/.netlify/functions/stripe-webhook`
   - Select events: `checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`
   - Copy webhook secret

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Step 3: Rotate & Configure VAPI (For Voice)

1. Go to https://vapi.ai
2. **REVOKE** old API key: `0be862d8-7e91-4f40-b559-5a25b33525c0`
3. Create new API key:

```bash
VAPI_API_KEY=your-new-api-key
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your-public-key
```

### Step 4: (Optional) Set Up Upstash Redis

1. Go to https://console.upstash.com
2. Create Redis database
3. Copy REST API credentials:

```bash
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AYA...
```

---

## 🔒 Security Checklist

- [x] Removed all hardcoded API keys from scripts
- [x] All scripts use environment variables
- [x] Added `.claudecode/` to `.gitignore`
- [ ] **Rotated exposed VAPI API key**
- [ ] Verified `.env.local` not in git
- [ ] Added Supabase credentials to `.env.local`
- [ ] Added Stripe credentials to `.env.local`
- [ ] Configured Netlify environment variables (for production)

---

## 📝 Next Steps After Credentials Are Added

1. **Test Supabase Connection**
   ```bash
   npm run dev
   # Visit http://localhost:5040/login
   # Try creating an account
   ```

2. **Test API Routes**
   ```bash
   # Test courses API
   curl http://localhost:5040/api/courses

   # Test users API (requires auth)
   curl http://localhost:5040/api/users
   ```

3. **Deploy to Netlify**
   - Add all environment variables in Netlify dashboard
   - Push to main branch
   - Monitor build logs

4. **Set Up Database**
   - Run Supabase migrations (see `SUPABASE_INTEGRATION.md`)
   - Set up Row Level Security policies
   - Create initial admin user

---

## 🆘 Troubleshooting

### "Supabase is not defined" Error
- **Cause:** Missing `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Fix:** Add credentials from Step 1

### Stripe Checkout Not Working
- **Cause:** Missing Stripe keys or webhook secret
- **Fix:** Complete Step 2

### Voice Assessment Fails
- **Cause:** Missing or expired VAPI keys
- **Fix:** Complete Step 3 (and rotate old key!)

### Rate Limiting Not Working
- **Cause:** Missing Upstash Redis credentials
- **Fix:** Complete Step 4 (optional)

---

## 📚 Related Documentation

- [SUPABASE_INTEGRATION.md](./SUPABASE_INTEGRATION.md) - Database setup and migrations
- [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md) - Security vulnerabilities and fixes
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Production deployment guide
- [.env.example](./.env.example) - Complete environment variable reference

---

## ✅ Completion Status

**Overall Progress:** 40% Complete (9/22 required variables)

- ✅ Application Config (4/4)
- ✅ AI Providers (5/5)
- ⚠️ Supabase (0/4) - **CRITICAL**
- ⚠️ Stripe (0/3) - **HIGH PRIORITY**
- ⚠️ VAPI (0/4) - **MEDIUM PRIORITY**
- ⚠️ Upstash Redis (0/2) - **LOW PRIORITY**

---

**Last Updated:** October 4, 2025
**Updated By:** Claude Code
