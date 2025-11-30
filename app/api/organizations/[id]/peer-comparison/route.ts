/**
 * GET /api/organizations/[id]/peer-comparison - Get peer comparison for organization
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPeerComparison } from '@/lib/services/industry-benchmarks'

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

    const comparison = await getPeerComparison(orgId)

    if (!comparison) {
      return NextResponse.json(
        { error: 'Unable to generate peer comparison. Ensure organization has industry data and maturity assessment.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ comparison })
  } catch (error) {
    console.error('[Benchmarks API] GET /peer-comparison error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate peer comparison' },
      { status: 500 }
    )
  }
}
