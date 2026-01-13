/**
 * Expert Application Review API (Admin Only)
 * POST - Approve or reject an application
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/api/auth'
import { z } from 'zod'
import {
  sendApprovalEmail,
  sendRejectionEmail,
  sendRequestInfoEmail,
} from '@/lib/services/expert-application-emails'

interface RouteParams {
  params: Promise<{ id: string }>
}

const reviewSchema = z.object({
  action: z.enum(['approve', 'reject', 'request_changes', 'mark_under_review']),
  reviewNotes: z.string().max(2000).optional().nullable(),
  rejectionReason: z.string().max(1000).optional(),
})

/**
 * POST /api/expert-applications/[id]/review
 * Admin action to review an application
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const body = await request.json()

    // Validate input
    const validation = reviewSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid data',
            details: validation.error.errors,
          },
        },
        { status: 400 }
      )
    }

    const { action, reviewNotes, rejectionReason } = validation.data
    const supabase = await createClient()

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile?.role || !['admin', 'super_admin_full'].includes(profile.role)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Admin access required' },
        },
        { status: 403 }
      )
    }

    // Fetch application
    const { data: application, error: fetchError } = await supabase
      .from('expert_applications')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !application) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Application not found' },
        },
        { status: 404 }
      )
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      submitted: ['under_review', 'approved', 'rejected'],
      under_review: ['approved', 'rejected', 'submitted'], // submitted = request changes
      draft: [], // Admins can't act on drafts
      approved: [],
      rejected: ['submitted'], // Allow re-review
      withdrawn: [],
    }

    const targetStatus = {
      approve: 'approved',
      reject: 'rejected',
      mark_under_review: 'under_review',
      request_changes: 'submitted', // Send back to applicant
    }[action]

    if (!validTransitions[application.status]?.includes(targetStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TRANSITION',
            message: `Cannot ${action} an application with status "${application.status}"`,
          },
        },
        { status: 400 }
      )
    }

    // Rejection requires a reason
    if (action === 'reject' && !rejectionReason) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'REASON_REQUIRED', message: 'Rejection reason is required' },
        },
        { status: 400 }
      )
    }

    // Handle different actions
    switch (action) {
      case 'approve': {
        // Use the database function to approve and create instructor profile
        const { data: instructorProfileId, error: approveError } = await supabase
          .rpc('approve_expert_application', {
            p_application_id: id,
            p_review_notes: reviewNotes || null,
          })

        if (approveError) {
          console.error('Approve error:', approveError)

          // Fallback: manual update if function doesn't exist
          if (approveError.message?.includes('function') || approveError.code === '42883') {
            const { error: updateError } = await supabase
              .from('expert_applications')
              .update({
                status: 'approved',
                reviewer_id: user.id,
                reviewed_at: new Date().toISOString(),
                review_notes: reviewNotes,
                approved_at: new Date().toISOString(),
              })
              .eq('id', id)

            if (updateError) throw updateError

            return NextResponse.json({
              success: true,
              message: 'Application approved (manual fallback - instructor profile needs to be created separately)',
              data: { applicationId: id },
            })
          }

          throw approveError
        }

        // Send approval email to applicant
        try {
          await sendApprovalEmail(
            {
              id: application.id,
              full_name: application.full_name,
              email: application.email,
              professional_title: application.professional_title,
              headline: application.headline,
              expertise_areas: application.expertise_areas,
            },
            {
              reviewer_name: user.email || 'HMN Team',
              review_notes: reviewNotes || undefined,
            }
          )
        } catch (emailError) {
          console.error('Failed to send approval email:', emailError)
        }

        return NextResponse.json({
          success: true,
          message: 'Application approved successfully',
          data: {
            applicationId: id,
            instructorProfileId,
          },
        })
      }

      case 'reject': {
        // Use database function or manual update
        const { error: rejectError } = await supabase
          .rpc('reject_expert_application', {
            p_application_id: id,
            p_rejection_reason: rejectionReason,
            p_review_notes: reviewNotes || null,
          })

        if (rejectError) {
          console.error('Reject error:', rejectError)

          // Fallback: manual update
          if (rejectError.message?.includes('function') || rejectError.code === '42883') {
            const { error: updateError } = await supabase
              .from('expert_applications')
              .update({
                status: 'rejected',
                reviewer_id: user.id,
                reviewed_at: new Date().toISOString(),
                review_notes: reviewNotes,
                rejection_reason: rejectionReason,
              })
              .eq('id', id)

            if (updateError) throw updateError

            return NextResponse.json({
              success: true,
              message: 'Application rejected',
            })
          }

          throw rejectError
        }

        // Send rejection email to applicant
        try {
          await sendRejectionEmail(
            {
              id: application.id,
              full_name: application.full_name,
              email: application.email,
              professional_title: application.professional_title,
              headline: application.headline,
              expertise_areas: application.expertise_areas,
            },
            {
              reviewer_name: user.email || 'HMN Team',
              review_notes: reviewNotes || undefined,
              rejection_reason: rejectionReason,
            }
          )
        } catch (emailError) {
          console.error('Failed to send rejection email:', emailError)
        }

        return NextResponse.json({
          success: true,
          message: 'Application rejected',
        })
      }

      case 'mark_under_review': {
        const { error } = await supabase
          .from('expert_applications')
          .update({
            status: 'under_review',
            reviewer_id: user.id,
            review_notes: reviewNotes,
          })
          .eq('id', id)

        if (error) throw error

        return NextResponse.json({
          success: true,
          message: 'Application marked as under review',
        })
      }

      case 'request_changes': {
        // Reset to submitted status with notes about required changes
        const { error } = await supabase
          .from('expert_applications')
          .update({
            status: 'submitted',
            reviewer_id: user.id,
            review_notes: reviewNotes,
            metadata: {
              ...application.metadata,
              changesRequested: true,
              changesRequestedAt: new Date().toISOString(),
              changesRequestedBy: user.id,
              changesRequestedNotes: reviewNotes,
            },
          })
          .eq('id', id)

        if (error) throw error

        // Send email to applicant with requested changes
        if (reviewNotes) {
          try {
            await sendRequestInfoEmail(
              {
                id: application.id,
                full_name: application.full_name,
                email: application.email,
                professional_title: application.professional_title,
                headline: application.headline,
                expertise_areas: application.expertise_areas,
              },
              reviewNotes
            )
          } catch (emailError) {
            console.error('Failed to send request changes email:', emailError)
          }
        }

        return NextResponse.json({
          success: true,
          message: 'Changes requested from applicant',
        })
      }
    }
  } catch (error) {
    console.error('Review application error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'REVIEW_ERROR',
          message: error instanceof Error ? error.message : 'Failed to process review',
        },
      },
      { status: 500 }
    )
  }
}
