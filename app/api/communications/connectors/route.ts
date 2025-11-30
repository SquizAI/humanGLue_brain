/**
 * Bird Connectors API Routes
 * Manage channel connectors and their status
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import BirdService from '@/lib/services/bird-communications'

/**
 * GET /api/communications/connectors
 * List all connectors (channel configurations)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const templateRef = searchParams.get('templateRef') || undefined

    const connectors = await BirdService.listConnectors(templateRef)

    return NextResponse.json({
      connectors: connectors.results,
      count: connectors.results.length,
    })
  } catch (error) {
    console.error('List connectors error:', error)
    return NextResponse.json(
      { error: 'Failed to list connectors' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/communications/connectors
 * Delete a connector (and its channel)
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const connectorId = searchParams.get('id')

    if (!connectorId) {
      return NextResponse.json(
        { error: 'Missing connector ID' },
        { status: 400 }
      )
    }

    await BirdService.deleteChannel(connectorId)

    return NextResponse.json({
      success: true,
      message: 'Connector deleted successfully',
    })
  } catch (error) {
    console.error('Delete connector error:', error)
    return NextResponse.json(
      { error: 'Failed to delete connector' },
      { status: 500 }
    )
  }
}
