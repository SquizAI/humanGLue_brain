# Expert Application System

## Overview
The Expert Application System allows prospective experts/instructors to apply to join the HumanGlue platform, with a complete admin review workflow.

## Architecture

### Database Schema
**Location:** `supabase/migrations/016_expert_applications.sql`

#### Tables

1. **expert_applications**
   - Stores all expert/instructor applications
   - Statuses: `draft`, `submitted`, `under_review`, `approved`, `rejected`, `withdrawn`
   - Comprehensive fields for professional information, credentials, social links, etc.
   - Links to `users` table (optional - allows unauthenticated applications)
   - Links to `instructor_profiles` upon approval

2. **expert_application_history**
   - Audit trail for all status changes
   - Tracks who changed the status and when
   - Stores review notes for each transition

#### Key Database Functions

- `approve_expert_application(application_id, review_notes)`: Approves application and creates instructor profile
- `reject_expert_application(application_id, rejection_reason, review_notes)`: Rejects application with reason
- `log_expert_application_status_change()`: Automatic trigger for audit trail
- `get_expert_application_stats()`: Statistics for admin dashboard

### API Endpoints

#### Public Endpoints

**POST /api/expert-applications**
- Create new application (draft or submit immediately)
- No authentication required
- Validates email uniqueness for submitted applications
- Returns application ID

**GET /api/expert-applications**
- List applications
- Authenticated users see only their applications
- Admins see all applications
- Supports filtering and pagination

#### Application Management

**GET /api/expert-applications/[id]**
- Get single application details
- Applicant can view their own
- Admins can view any application
- Includes history for admins

**PATCH /api/expert-applications/[id]**
- Update application (only drafts for applicants)
- Supports partial updates
- Can submit draft by setting `submitNow: true`
- Admins can update any application

**DELETE /api/expert-applications/[id]**
- Withdraw application (soft delete)
- Applicants can only withdraw pending applications
- Admins can hard delete

#### Admin Review Actions

**POST /api/expert-applications/[id]/review**
- Admin-only endpoint
- Actions:
  - `approve`: Creates instructor profile and updates user role
  - `reject`: Marks as rejected with reason
  - `mark_under_review`: Changes status to under review
  - `request_changes`: Sends back to applicant with feedback

### Frontend Pages

#### Public Pages

**`/apply/expert`** - Application Form
- Multi-section form with validation
- Save as draft functionality
- Client-side validation
- Progress indicators
- Character counts for text fields

**`/apply/expert/success`** - Success Page
- Confirmation message
- Confetti animation
- Next steps timeline
- Contact information

#### Admin Pages

**`/admin/applications`** - Applications List
- Dashboard with statistics cards
- Search and filter functionality
- Status-based filtering
- Sortable table
- Batch operations support

**`/admin/applications/[id]`** - Individual Review
- Complete application details
- Review action buttons (Approve/Reject/Mark Under Review)
- Review dialogs with notes
- Application history timeline
- Social links and contact info
- Professional credentials display

## Key Features

### Application Workflow

1. **Draft Creation** (Optional)
   - Applicants can save work in progress
   - No email uniqueness check for drafts
   - Can be edited multiple times

2. **Submission**
   - Validates required fields
   - Checks for duplicate email
   - Records submission timestamp
   - Terms agreement required

3. **Admin Review**
   - Admin marks as "Under Review"
   - Can request changes (sends back to submitted)
   - Can approve or reject

4. **Approval**
   - Creates `instructor_profile` record
   - Updates user role to `instructor`
   - Links application to profile
   - Records approval timestamp and reviewer

5. **Rejection**
   - Records rejection reason
   - Updates status and timestamps
   - Notifies applicant (TODO: email)

### Data Validation

#### Client-Side
- Full name: min 2, max 100 characters
- Email: valid email format
- Professional title: min 5, max 200 characters
- Bio: min 100, max 3000 characters
- Years experience: >= 0
- Terms agreement: required for submission

#### Server-Side
- Zod schema validation
- Duplicate email check (for submitted applications)
- Status transition validation
- Admin role verification

### Security

#### RLS Policies
- Applicants can view/edit their own applications
- Admins can view/edit all applications
- Public can create applications (no auth required)
- Draft applications are private

#### Authorization
- Review actions require admin role
- Users can only withdraw their own applications
- Admins can hard delete any application

## UI Components Created

### Shadcn/UI Components
- **Textarea** - Multi-line text input
- **Checkbox** - Boolean input with Radix UI
- **Dialog** - Modal dialogs for review actions
- **Table** - Data table for applications list

### Custom Hook
- **useToast** - Simple toast notification hook (fallback implementation)

## Usage Examples

### Creating an Application (Client)
```typescript
const response = await fetch('/api/expert-applications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName: 'John Doe',
    email: 'john@example.com',
    professionalTitle: 'AI Strategy Consultant',
    bio: 'Experienced AI strategist...',
    yearsExperience: 10,
    agreedToTerms: true,
    submitNow: true, // false for draft
  }),
})
```

### Approving an Application (Admin)
```typescript
const response = await fetch(`/api/expert-applications/${id}/review`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'approve',
    reviewNotes: 'Excellent credentials and experience',
  }),
})
```

### Rejecting an Application (Admin)
```typescript
const response = await fetch(`/api/expert-applications/${id}/review`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'reject',
    rejectionReason: 'Insufficient experience in AI domain',
    reviewNotes: 'Suggest reapplying after 2 years',
  }),
})
```

## Future Enhancements

### Email Notifications
- [ ] Send confirmation email on submission
- [ ] Notify admins of new applications
- [ ] Send approval/rejection emails to applicants
- [ ] Notify applicants when changes are requested

### Enhanced Features
- [ ] Video introduction upload
- [ ] Document upload (resume, certifications)
- [ ] Portfolio showcase
- [ ] Reference checking system
- [ ] Interview scheduling
- [ ] Batch approval/rejection
- [ ] Advanced filtering and search
- [ ] Export to CSV/PDF

### Analytics
- [ ] Application conversion funnel
- [ ] Average review time
- [ ] Approval/rejection rates
- [ ] Source tracking
- [ ] Expert profile completion rates

### Integration
- [ ] Background check integration
- [ ] Calendar integration for interviews
- [ ] Slack/Discord notifications
- [ ] CRM integration
- [ ] Payment processing for application fees (if needed)

## Testing Checklist

### Unit Tests Needed
- [ ] API validation schemas
- [ ] Database functions
- [ ] RLS policies
- [ ] Status transition logic

### Integration Tests Needed
- [ ] Full application submission flow
- [ ] Admin review workflow
- [ ] Draft save and resume
- [ ] Email uniqueness validation
- [ ] Authorization checks

### E2E Tests Needed
- [ ] Complete applicant journey
- [ ] Admin review and approval
- [ ] Edge cases (duplicate submissions, expired sessions)
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

## Deployment Notes

### Database Migration
1. Ensure `supabase/migrations/016_expert_applications.sql` is applied
2. Verify all functions and triggers are created
3. Test RLS policies with different user roles
4. Check indexes are created for performance

### Environment Variables
No additional environment variables required for core functionality.

### Dependencies
- `canvas-confetti`: Celebration animation on success page
- `@radix-ui/react-checkbox`: Checkbox component
- `@radix-ui/react-dialog`: Dialog component
- `date-fns`: Date formatting

### Post-Deployment
1. Test application submission with real data
2. Verify email notifications (when implemented)
3. Monitor application conversion rates
4. Review admin dashboard performance
5. Gather feedback from first applicants

## Troubleshooting

### Common Issues

**Applications not appearing for admin**
- Check RLS policies are enabled
- Verify admin role in `profiles` table
- Check `role` field includes 'admin' or 'super_admin_full'

**Cannot submit application**
- Verify all required fields are filled
- Check terms agreement is checked
- Ensure bio is at least 100 characters
- Check for duplicate email

**Approval fails**
- Verify `approve_expert_application` function exists
- Check `instructor_profiles` table exists
- Verify user exists in `users` table
- Check for foreign key constraints

**TypeScript errors**
- Ensure all UI components are created
- Check `use-toast` hook is available
- Verify import paths are correct

## File Structure
```
app/
├── apply/
│   └── expert/
│       ├── page.tsx (Application form)
│       └── success/
│           └── page.tsx (Success page)
├── admin/
│   └── applications/
│       ├── page.tsx (Applications list)
│       └── [id]/
│           └── page.tsx (Individual review)
└── api/
    └── expert-applications/
        ├── route.ts (List & Create)
        └── [id]/
            ├── route.ts (Get, Update, Delete)
            └── review/
                └── route.ts (Admin review actions)

components/ui/
├── textarea.tsx
├── checkbox.tsx
├── dialog.tsx
└── table.tsx

hooks/
└── use-toast.ts

supabase/migrations/
└── 016_expert_applications.sql
```

## Support

For issues or questions:
- Check this documentation
- Review API response error messages
- Check browser console for client-side errors
- Review Supabase logs for database errors
- Contact development team

---

**Last Updated:** 2024-11-30
**Version:** 1.0.0
**Status:** Production Ready (pending migration conflicts resolution)
