/**
 * GET /api/organizations/[id]/maturity-progression - Get maturity level progression over time
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMaturityProgression } from '@/lib/neo4j/digital-twin'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: orgId } = params
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

    const progression = await getMaturityProgression(orgId)

    return NextResponse.json({ progression })
  } catch (error) {
    console.error('[Maturity Progression API] GET error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get maturity progression' },
      { status: 500 }
    )
  }
}
