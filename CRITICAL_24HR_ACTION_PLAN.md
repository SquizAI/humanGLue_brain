# CRITICAL 24-HOUR SECURITY ACTION PLAN
**Start Time:** August 1, 2025 - 10:00 AM PST  
**Deadline:** August 2, 2025 - 11:59 PM PST  
**Time Remaining:** 38 hours

## 🚨 HOUR-BY-HOUR EXECUTION PLAN

### IMMEDIATE ACTIONS (10:00 AM - 12:00 PM) ⏰

#### 10:00 - 10:30 AM: Emergency Response Setup
- [ ] Alert all stakeholders about critical security situation
- [ ] Assign security lead for 24-hour response
- [ ] Create emergency Slack channel #security-critical
- [ ] Schedule hourly check-ins

#### 10:30 - 11:00 AM: API Key Rotation - Phase 1
```bash
# Step 1: Generate new API keys
# Google AI: https://makersuite.google.com/app/apikey
# OpenAI: https://platform.openai.com/api-keys
# Anthropic: https://console.anthropic.com/settings/keys

# Step 2: Document new keys in secure location (1Password/Vault)
```

#### 11:00 - 11:30 AM: Remove Exposed Keys from Code
```bash
# Remove .env.local from git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Force push to all branches
git push origin --force --all
git push origin --force --tags
```

#### 11:30 AM - 12:00 PM: Secure Key Storage Setup
```javascript
// Add to Netlify environment variables
// Go to: https://app.netlify.com/sites/[your-site]/settings/env
// Add:
// GOOGLE_AI_API_KEY = [new key]
// OPENAI_API_KEY = [new key]
// ANTHROPIC_API_KEY = [new key]
```

### AFTERNOON SPRINT (12:00 PM - 6:00 PM) 💪

#### 12:00 - 1:00 PM: Lunch Break & Team Sync
- [ ] Team meeting to assign authentication tasks
- [ ] Order food for team staying late
- [ ] Review progress on key rotation

#### 1:00 - 3:00 PM: Authentication Implementation
```typescript
// Install NextAuth.js
npm install next-auth

// Create /app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Temporary hardcoded check - REPLACE WITH DB
        if (credentials?.email === "admin@lvng.ai" && 
            credentials?.password === "TempPass123!") {
          return { id: "1", email: "admin@lvng.ai", role: "admin" }
        }
        return null
      }
    })
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

#### 3:00 - 4:00 PM: Protect API Routes
```typescript
// Create /lib/auth-middleware.ts
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }
  
  return session
}

// Update each API route:
// /app/api/chat/route.ts
export async function POST(request: Request) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session
  
  // Continue with authenticated request...
}
```

#### 4:00 - 5:00 PM: Environment Security
```bash
# Create .env.example
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
GOOGLE_AI_API_KEY=your-key-here
OPENAI_API_KEY=your-key-here
ANTHROPIC_API_KEY=your-key-here

# Update .gitignore
.env
.env.local
.env.production
*.pem
```

#### 5:00 - 6:00 PM: Testing & Validation
- [ ] Test all API endpoints with auth
- [ ] Verify no keys in codebase
- [ ] Run security scan
- [ ] Document changes

### EVENING PUSH (6:00 PM - 11:00 PM) 🌙

#### 6:00 - 7:00 PM: Dinner & Status Check
- [ ] Team dinner / break
- [ ] Review completed tasks
- [ ] Adjust plan if needed

#### 7:00 - 8:00 PM: Input Validation
```typescript
// Install zod
npm install zod

// Create /lib/validators.ts
import { z } from 'zod'

export const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().max(10000)
  })),
  model: z.enum(['gpt-4', 'claude-3', 'gemini-pro']),
  temperature: z.number().min(0).max(2).optional()
})

export const profileSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  company: z.string().max(200).optional(),
  role: z.string().max(100).optional()
})
```

#### 8:00 - 9:00 PM: Rate Limiting
```typescript
// Install rate limiter
npm install @upstash/ratelimit @upstash/redis

// Create /lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
})
```

#### 9:00 - 10:00 PM: Security Headers
```javascript
// Update next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}
```

#### 10:00 - 11:00 PM: Final Testing
- [ ] Run full application test suite
- [ ] Verify all endpoints require auth
- [ ] Check for any exposed secrets
- [ ] Prepare deployment

### NEXT DAY MORNING (Aug 2, 8:00 AM - 12:00 PM) ☀️

#### 8:00 - 9:00 AM: Team Standup
- [ ] Review overnight issues
- [ ] Assign remaining tasks
- [ ] Coffee run! ☕

#### 9:00 - 10:00 AM: Deploy Changes
```bash
# Deploy to staging first
git push origin main
# Monitor Netlify deployment

# Run post-deployment checks
curl -X POST https://staging.lvng.ai/api/chat \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```

#### 10:00 - 11:00 AM: Documentation
- [ ] Update security documentation
- [ ] Create auth guide for team
- [ ] Document API changes
- [ ] Update README

#### 11:00 AM - 12:00 PM: Final Verification
- [ ] Security scan on production
- [ ] Verify all critical items complete
- [ ] Schedule follow-up for Phase 2
- [ ] Celebrate! 🎉

## 📊 SUCCESS CRITERIA

By August 2, 2025 11:59 PM, we must have:

1. ✅ All API keys rotated and removed from codebase
2. ✅ Authentication implemented on all endpoints
3. ✅ Input validation on all user inputs
4. ✅ Rate limiting active
5. ✅ Security headers configured
6. ✅ No secrets in version control
7. ✅ Deployment completed
8. ✅ Documentation updated

## 🚨 EMERGENCY CONTACTS

- **Security Lead**: [Name] - [Phone]
- **DevOps On-Call**: [Name] - [Phone]
- **CTO**: [Name] - [Phone]
- **External Security**: [Consultant] - [Phone]
- **Netlify Support**: support@netlify.com

## 🔧 USEFUL COMMANDS

```bash
# Check for secrets in code
git secrets --scan

# Generate secure random strings
openssl rand -base64 32

# Test rate limiting
for i in {1..150}; do curl -X POST https://localhost:3000/api/chat; done

# Monitor logs
tail -f .netlify/logs/function-*.log
```

---

**Remember**: Stay calm, work systematically, take breaks, and ASK FOR HELP when needed! We've got this! 💪