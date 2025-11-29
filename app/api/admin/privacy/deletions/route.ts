/**
 * GET  /api/admin/privacy/deletions - Get all deletion requests
 * POST /api/admin/privacy/deletions/[id]/approve - Approve deletion
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPendingDeletions, approveDeletion, anonymizeUserData } from '@/lib/services/data-privacy'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'super_admin_full'])
      .single()

    if (!roles) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    const requests = await getPendingDeletions()

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('[Admin Privacy API] GET /deletions error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch deletion requests' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'super_admin_full'])
      .single()

    if (!roles) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { request_id, action, user_id } = body

    if (action === 'approve' && request_id) {
      // Approve deletion request
      const deletionRequest = await approveDeletion(request_id, user.id)

      // Immediately anonymize user data
      const result = await anonymizeUserData(deletionRequest.user_id, 'admin_action')

      return NextResponse.json({
        success: true,
        request: deletionRequest,
        anonymization: result,
        message: 'Deletion request approved and user data anonymized'
      })
    }

    if (action === 'anonymize' && user_id) {
      // Direct anonymization (admin override)
      const result = await anonymizeUserData(user_id, 'admin_action')

      return NextResponse.json({
        success: true,
        anonymization: result,
        message: 'User data anonymized successfully'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action or missing parameters' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[Admin Privacy API] POST /deletions error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process deletion' },
      { status: 500 }
    )
  }
}
