/**
 * POST /api/privacy/export - Request data export (GDPR Article 15)
 * GET  /api/privacy/export - Get export requests status
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requestDataExport, getExportRequests, exportUserData } from '@/lib/services/data-privacy'

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

    const requests = await getExportRequests(user.id)

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('[Privacy API] GET /export error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch export requests' },
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
    const { format = 'json' } = body

    if (!['json', 'csv'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Must be json or csv' },
        { status: 400 }
      )
    }

    // Check if user has a pending export request
    const existingRequests = await getExportRequests(user.id)
    const pendingRequest = existingRequests.find(r => r.status === 'pending' || r.status === 'processing')

    if (pendingRequest) {
      return NextResponse.json(
        {
          error: 'You already have a pending export request',
          request: pendingRequest
        },
        { status: 409 }
      )
    }

    // Create export request
    const exportRequest = await requestDataExport(user.id, format)

    // TODO: Trigger background job to process export
    // For now, we'll export immediately for demo purposes
    const userData = await exportUserData(user.id)

    return NextResponse.json({
      success: true,
      request: exportRequest,
      message: 'Export request created. You will receive an email when your data is ready to download.',
      // In production, don't return data inline - send download link via email
      data: process.env.NODE_ENV === 'development' ? userData : undefined
    })
  } catch (error) {
    console.error('[Privacy API] POST /export error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create export request' },
      { status: 500 }
    )
  }
}
