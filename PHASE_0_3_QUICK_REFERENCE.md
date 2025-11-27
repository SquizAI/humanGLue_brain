# Phase 0.3: Quick Reference

## API Endpoints

### Enrich Company
```bash
GET /.netlify/functions/enrich-company?domain={domain}
```

**Response:**
```json
{
  "company": "Company Name",
  "industry": "Industry",
  "size": "100-500 employees",
  "found": true,
  "source": "clearbit"
}
```

### Recent Activity
```bash
GET /.netlify/functions/recent-activity
```

**Response:**
```json
{
  "success": true,
  "activities": [
    {
      "id": "activity_123",
      "company": "TechCorp",
      "timeAgo": "5 minutes ago",
      "timestamp": 1234567890000
    }
  ]
}
```

---

## React Hook

```typescript
import { useDataEnrichment } from '@/lib/hooks/useDataEnrichment'

const { enrich, loading, error, enrichedData } = useDataEnrichment()

// Enrich data
const result = await enrich('user@company.com')

if (result?.found) {
  console.log(result.company) // "Company Name"
  console.log(result.industry) // "Technology"
  console.log(result.size) // "100-500 employees"
}
```

---

## Component

```tsx
import { LiveSocialProof } from '@/components/molecules'

<LiveSocialProof className="my-4" />
```

---

## Files Created

1. `/netlify/functions/enrich-company.ts` - Company enrichment API
2. `/netlify/functions/recent-activity.ts` - Activity feed API
3. `/lib/hooks/useDataEnrichment.ts` - Data enrichment hook
4. `/components/molecules/LiveSocialProof.tsx` - Social proof component
5. `/components/molecules/index.ts` - Updated exports

## Files Modified

1. `/components/templates/UnifiedChatSystem.tsx` - Added enrichment logic

---

## Environment Variables (Optional)

```env
CLEARBIT_API_KEY=sk_xxxxxxxxxxxxxxxx
HUNTER_API_KEY=xxxxxxxxxxxxxxxx
```

---

## Rate Limits

- **Enrichment API:** 10 requests/minute per IP
- **Activity API:** Unlimited (mock data)

---

## Cache

- **Duration:** 24 hours
- **Storage:** In-memory (per function instance)
- **Headers:** `X-Cache: HIT|MISS`

---

## Testing

```bash
# Test enrichment
curl "/.netlify/functions/enrich-company?domain=microsoft.com"

# Test activity
curl "/.netlify/functions/recent-activity"

# Test rate limit (11+ rapid requests)
for i in {1..12}; do
  curl "/.netlify/functions/enrich-company?domain=test$i.com"
done
```

---

## Chat Integration Flow

1. User provides email → `john@acme.com`
2. System validates email format
3. Assistant asks for phone number
4. **Enrichment happens in background**
5. If data found:
   - Shows: "I found that you're with **Acme Corp** in the Technology industry (100-500 employees). Is that correct?"
   - Suggestions: "Yes, that's right" | "No, different company"
6. Data merged into user profile

---

## Common Issues

### No enrichment data
- Check if domain is from free email provider (gmail.com, etc.)
- Test API endpoint directly
- Check rate limits

### Rate limit errors
- Wait for rate limit window to reset
- Check `X-RateLimit-Reset` header
- Implement exponential backoff

### Component not showing
- Check browser console for errors
- Verify API endpoint is accessible
- Component auto-hides on error/loading

---

## TypeScript Types

```typescript
interface EnrichedData {
  company: string | null
  industry: string | null
  size: string | null
  found: boolean
  source?: string
}

interface ActivityEntry {
  id: string
  company: string
  timeAgo: string
  timestamp: number
}
```

---

## Key Features

✅ **Auto-enrichment:** Fills company data automatically
✅ **Rate limiting:** Prevents abuse (10 req/min)
✅ **Caching:** 24-hour cache reduces API calls
✅ **Fallback:** Works without API keys
✅ **Social proof:** Live activity feed builds trust
✅ **Mobile-ready:** Responsive design
✅ **TypeScript:** Full type safety
✅ **Error handling:** Graceful degradation

---

## Next Steps

1. **Deploy to Netlify** - Functions auto-deploy on push
2. **Add API keys** - Optional: CLEARBIT_API_KEY, HUNTER_API_KEY
3. **Test in production** - Try enrichment in live chat
4. **Monitor metrics** - Track enrichment success rate
5. **Migrate to real data** - Switch activity API to Supabase

---

## Documentation

📖 Full guide: `PHASE_0_3_INTEGRATION_GUIDE.md`
📁 Code: `/netlify/functions/`, `/lib/hooks/`, `/components/molecules/`
🔧 Integration: `/components/templates/UnifiedChatSystem.tsx`
