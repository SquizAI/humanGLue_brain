# Workshop API Quick Start Guide

Quick reference for developers working with the workshop registration API.

## Quick Links

- [Full API Documentation](./WORKSHOP_API.md)
- [Implementation Summary](./WORKSHOP_IMPLEMENTATION_SUMMARY.md)
- [Database Schema](../supabase/migrations/002_create_workshops.sql)

## Common Use Cases

### 1. Display Workshop Catalog

```typescript
// Fetch all published workshops
const response = await fetch('/.netlify/functions/workshops?limit=20')
const { data, pagination } = await response.json()

// Filter by pillar
const response = await fetch('/.netlify/functions/workshops?pillar=adaptability')

// Search workshops
const response = await fetch('/.netlify/functions/workshops?search=AI')

// Get featured workshops
const response = await fetch('/.netlify/functions/workshops?is_featured=true')
```

### 2. Show Workshop Details

```typescript
const workshopId = 'uuid-here'
const response = await fetch(`/.netlify/functions/workshops-detail?id=${workshopId}`)
const { data } = await response.json()

// data includes: workshop info, instructor, stats, reviews
console.log(data.title)
console.log(data.instructor.full_name)
console.log(data.stats.average_rating)
console.log(data.reviews) // Approved reviews
```

### 3. Register for Workshop

```typescript
// Step 1: Create payment intent
const paymentResponse = await fetch('/.netlify/functions/create-payment-intent', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ workshopId: 'uuid' })
})
const { paymentIntentId, clientSecret } = await paymentResponse.json()

// Step 2: Process payment with Stripe (client-side)
// ... Stripe payment processing ...

// Step 3: Register after successful payment
const registrationResponse = await fetch('/.netlify/functions/workshops-register', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    workshopId: 'uuid',
    paymentId: 'payment-uuid'
  })
})
const { data: registration } = await registrationResponse.json()
```

### 4. View User's Workshops

```typescript
// Get all user's workshops
const response = await fetch('/.netlify/functions/workshops-my-workshops', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
const { data, categorized } = await response.json()

// Use categorized data for UI
console.log(categorized.upcoming) // Future workshops
console.log(categorized.completed) // Past workshops
console.log(categorized.cancelled) // Cancelled registrations
```

### 5. Mark Attendance (Instructor/Admin)

```typescript
const response = await fetch('/.netlify/functions/workshops-attendance', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    registrationId: 'uuid',
    attended: true,
    attendancePercentage: 95
  })
})
const { data } = await response.json()
// Status automatically becomes 'completed' if attendance >= 80%
```

## Using the Workshop Service

The service layer provides a cleaner API for server-side code:

```typescript
import { workshopService } from '@/services/workshop'

// Get workshops with filters
const { workshops, total } = await workshopService.getWorkshops({
  pillar: 'adaptability',
  level: 'intermediate',
  limit: 20
})

// Get workshop by ID
const workshop = await workshopService.getWorkshopById('uuid')

// Register for workshop
const registration = await workshopService.registerForWorkshop({
  workshopId: 'uuid',
  userId: 'uuid',
  paymentId: 'uuid',
  pricePaid: 299.00
})

// Get user's workshops
const registrations = await workshopService.getUserWorkshops('user-uuid')

// Update attendance
const updated = await workshopService.updateWorkshopAttendance(
  'registration-uuid',
  true,
  95
)

// Cancel registration
const cancelled = await workshopService.cancelRegistration(
  'registration-uuid',
  'user-uuid'
)

// Check availability
const { available, capacity_remaining } = await workshopService.checkAvailability('workshop-uuid')

// Get statistics
const stats = await workshopService.getWorkshopStats('workshop-uuid')
```

## React Component Examples

### Workshop Card Component

```typescript
interface WorkshopCardProps {
  workshop: Workshop
}

export function WorkshopCard({ workshop }: WorkshopCardProps) {
  return (
    <div className="workshop-card">
      <img src={workshop.thumbnail_url} alt={workshop.title} />
      <h3>{workshop.title}</h3>
      <p>{workshop.description}</p>
      <div className="meta">
        <span>{workshop.level}</span>
        <span>{workshop.pillar}</span>
        <span>{workshop.duration_minutes} min</span>
      </div>
      <div className="instructor">
        <img src={workshop.instructor?.avatar_url} />
        <span>{workshop.instructor?.full_name}</span>
      </div>
      <div className="pricing">
        {workshop.price_early_bird && (
          <span className="early-bird">${workshop.price_early_bird}</span>
        )}
        <span className="regular">${workshop.price_amount}</span>
      </div>
      <div className="capacity">
        {workshop.capacity_remaining} spots left
      </div>
      <button onClick={() => handleRegister(workshop.id)}>
        Register Now
      </button>
    </div>
  )
}
```

### My Workshops Component

```typescript
export function MyWorkshops() {
  const [workshops, setWorkshops] = useState<any>(null)
  const { session } = useSession()

  useEffect(() => {
    async function fetchWorkshops() {
      const response = await fetch('/.netlify/functions/workshops-my-workshops', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })
      const data = await response.json()
      setWorkshops(data)
    }
    fetchWorkshops()
  }, [session])

  if (!workshops) return <Loading />

  return (
    <div className="my-workshops">
      <section>
        <h2>Upcoming Workshops</h2>
        {workshops.categorized.upcoming.map(reg => (
          <WorkshopRegistrationCard key={reg.id} registration={reg} />
        ))}
      </section>

      <section>
        <h2>Completed Workshops</h2>
        {workshops.categorized.completed.map(reg => (
          <WorkshopRegistrationCard key={reg.id} registration={reg} />
        ))}
      </section>
    </div>
  )
}
```

## Error Handling

```typescript
async function registerForWorkshop(workshopId: string, paymentId: string) {
  try {
    const response = await fetch('/.netlify/functions/workshops-register', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ workshopId, paymentId })
    })

    if (!response.ok) {
      const error = await response.json()

      switch (response.status) {
        case 400:
          // Workshop full, already registered, or invalid payment
          alert(error.error)
          break
        case 401:
          // Not authenticated
          router.push('/login')
          break
        case 403:
          // Payment doesn't belong to user
          alert('Payment verification failed')
          break
        case 404:
          // Workshop or payment not found
          alert('Workshop not found')
          break
        case 429:
          // Rate limited
          alert('Too many attempts. Please try again later.')
          break
        default:
          alert('Registration failed. Please try again.')
      }
      return
    }

    const { data } = await response.json()
    // Success - redirect to confirmation page
    router.push(`/workshops/${workshopId}/confirmation`)
  } catch (error) {
    console.error('Registration error:', error)
    alert('Network error. Please check your connection.')
  }
}
```

## TypeScript Types

All types are exported from the service:

```typescript
import type {
  Workshop,
  WorkshopRegistration,
  WorkshopFilters,
  RegisterWorkshopData
} from '@/services/workshop'

// Use in your components
const [workshops, setWorkshops] = useState<Workshop[]>([])
const [registration, setRegistration] = useState<WorkshopRegistration | null>(null)
```

## Environment Variables

Required in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx (server-side only)
STRIPE_SECRET_KEY=xxx (server-side only)
```

## Testing Tips

### Test Registration Flow

1. Create a test workshop in Supabase
2. Set capacity_remaining to a small number (e.g., 2)
3. Try registering multiple times
4. Verify capacity decrements correctly
5. Try registering when full

### Test Attendance

1. Create a test registration
2. Login as the instructor
3. Call attendance endpoint with various percentages
4. Verify auto-completion at 80%
5. Try as regular user (should fail)

### Test Authorization

1. Try accessing my-workshops without token (should fail)
2. Try updating attendance as regular user (should fail)
3. Try viewing draft workshop without permission (should fail)

## Common Issues

### "Workshop is fully booked"
- Check capacity_remaining in database
- Verify trigger is working: `SELECT * FROM pg_trigger WHERE tgname LIKE '%workshop%'`

### "Invalid authentication token"
- Check token expiration
- Verify token is in format: `Bearer xxx`
- Check Supabase connection

### "Payment not found"
- Ensure payment was created via create-payment-intent
- Verify payment status is "succeeded"
- Check payment.related_entity_id matches workshopId

### Rate limit errors
- Wait 60 seconds and try again
- In development, clear rate limiter or restart function

## Deployment Checklist

- [ ] Environment variables configured in Netlify
- [ ] Database migrations applied
- [ ] RLS policies enabled
- [ ] Test all endpoints in staging
- [ ] Monitor error rates after deployment
- [ ] Set up alerting for failed registrations

## Support

For issues or questions:
1. Check the [Full API Documentation](./WORKSHOP_API.md)
2. Review [Implementation Summary](./WORKSHOP_IMPLEMENTATION_SUMMARY.md)
3. Check database logs in Supabase dashboard
4. Check Netlify function logs

## Next Steps

After basic implementation:
1. Add email notifications
2. Implement calendar integration
3. Set up certificate generation
4. Add waitlist functionality
5. Create instructor dashboard
6. Add analytics tracking
