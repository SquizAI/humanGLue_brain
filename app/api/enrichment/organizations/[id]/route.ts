/**
 * POST /api/enrichment/organizations/[id] - Enrich organization data
 * GET  /api/enrichment/organizations/[id] - Get enrichment suggestions
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  autoEnrichOrganization,
  getEnrichmentSuggestions,
} from '@/lib/services/enrichment'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: orgId } = params
    const supabase = await createClient()

    // Verify user has access to this organization
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get enrichment suggestions
    const suggestions = await getEnrichmentSuggestions(orgId)

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('[Enrichment API] GET error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get enrichment suggestions' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: orgId } = params
    const supabase = await createClient()

    // Verify user has access to this organization
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { force = false } = body

    // Auto-enrich the organization
    const result = await autoEnrichOrganization(orgId, force)

    if (!result.enriched) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.data,
    })
  } catch (error) {
    console.error('[Enrichment API] POST error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to enrich organization' },
      { status: 500 }
    )
  }
}
