/**
 * POST /api/privacy/delete - Request account deletion (GDPR Article 17)
 * GET  /api/privacy/delete - Get deletion request status
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requestDeletion, getDeletionRequests } from '@/lib/services/data-privacy'

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

    const requests = await getDeletionRequests(user.id)

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('[Privacy API] GET /delete error:', error)
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

    const body = await request.json()
    const { reason } = body

    // Check if user has a pending deletion request
    const existingRequests = await getDeletionRequests(user.id)
    const pendingRequest = existingRequests.find(
      r => r.status === 'pending' || r.status === 'approved' || r.status === 'processing'
    )

    if (pendingRequest) {
      return NextResponse.json(
        {
          error: 'You already have a pending deletion request',
          request: pendingRequest
        },
        { status: 409 }
      )
    }

    // Create deletion request
    const deletionRequest = await requestDeletion(user.id, reason)

    return NextResponse.json({
      success: true,
      request: deletionRequest,
      message: 'Deletion request created. An administrator will review your request within 30 days as required by GDPR.'
    })
  } catch (error) {
    console.error('[Privacy API] POST /delete error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create deletion request' },
      { status: 500 }
    )
  }
}
