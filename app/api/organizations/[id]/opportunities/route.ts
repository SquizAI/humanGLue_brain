/**
 * Organization Automation Opportunities API
 * GET - List and analyze automation opportunities for an organization
 * POST - Create or update an automation opportunity
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getAutomationOpportunities,
  upsertAutomationOpportunity,
  analyzeAutomationPotential,
  OpportunityStatus,
  OpportunityType,
} from '@/lib/services/process-mapping'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check access
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const isAdmin = userRole?.role === 'admin' || userRole?.role === 'super_admin_full'
    const isOrgMember = profile?.organization_id === organizationId

    if (!isAdmin && !isOrgMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams
    const quickWinsOnly = searchParams.get('quickWinsOnly') === 'true'
    const status = searchParams.get('status') as OpportunityStatus | undefined
    const opportunityType = searchParams.get('type') as OpportunityType | undefined
    const includeAnalysis = searchParams.get('includeAnalysis') === 'true'

    // Get opportunities
    const opportunities = await getAutomationOpportunities(organizationId, {
      quickWinsOnly,
      status,
      opportunityType,
    })

    const response: {
      organizationId: string
      opportunities: typeof opportunities
      total: number
      quickWins: number
      analysis?: Awaited<ReturnType<typeof analyzeAutomationPotential>>
    } = {
      organizationId,
      opportunities,
      total: opportunities.length,
      quickWins: opportunities.filter(o => o.quickWin).length,
    }

    // Include full analysis if requested
    if (includeAnalysis) {
      response.analysis = await analyzeAutomationPotential(organizationId)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error getting automation opportunities:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin access
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const isAdmin = userRole?.role === 'admin' || userRole?.role === 'super_admin_full'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { opportunityCode, assessmentId, ...opportunityData } = body

    if (!opportunityCode) {
      return NextResponse.json({ error: 'opportunityCode is required' }, { status: 400 })
    }

    // Create/update opportunity
    const opportunity = await upsertAutomationOpportunity(
      organizationId,
      { opportunityCode, ...opportunityData },
      assessmentId
    )

    return NextResponse.json({
      success: true,
      opportunity,
    })
  } catch (error) {
    console.error('Error creating/updating opportunity:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
