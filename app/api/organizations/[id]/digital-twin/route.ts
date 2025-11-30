/**
 * GET  /api/organizations/[id]/digital-twin - Get organization's digital twin network
 * POST /api/organizations/[id]/digital-twin - Sync organization to knowledge graph
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  syncOrganizationToGraph,
  getOrganizationNetwork,
} from '@/lib/neo4j/digital-twin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orgId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user has access to this organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have access to this organization' },
        { status: 403 }
      )
    }

    // Get digital twin network
    const network = await getOrganizationNetwork(orgId)

    return NextResponse.json({ network })
  } catch (error) {
    console.error('[Digital Twin API] GET error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get digital twin' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orgId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user has access to this organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have access to this organization' },
        { status: 403 }
      )
    }

    // Sync organization to graph
    const digitalTwin = await syncOrganizationToGraph(orgId)

    return NextResponse.json({
      success: true,
      digitalTwin,
      message: 'Organization synced to knowledge graph',
    })
  } catch (error) {
    console.error('[Digital Twin API] POST error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync digital twin' },
      { status: 500 }
    )
  }
}
