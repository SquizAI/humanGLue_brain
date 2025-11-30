/**
 * GET /api/organizations/[id]/quality - Get organization-specific data quality metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrganizationQuality } from '@/lib/services/data-quality'

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

    const quality = await getOrganizationQuality(orgId)

    if (!quality) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ quality })
  } catch (error) {
    console.error('[Organization Quality API] GET error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get organization quality' },
      { status: 500 }
    )
  }
}
