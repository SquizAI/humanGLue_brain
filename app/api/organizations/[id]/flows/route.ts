/**
 * Organization Information Flows API
 * GET - List all information flows for an organization
 * POST - Create or update an information flow
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getOrganizationFlows,
  upsertInformationFlow,
  generateInformationFlowDiagram,
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
    const bottlenecksOnly = searchParams.get('bottlenecksOnly') === 'true'
    const automatableOnly = searchParams.get('automatableOnly') === 'true'
    const includeDiagram = searchParams.get('includeDiagram') === 'true'

    // Get flows
    const flows = await getOrganizationFlows(organizationId, {
      bottlenecksOnly,
      automatableOnly,
    })

    const response: {
      organizationId: string
      flows: typeof flows
      total: number
      bottlenecks: number
      automatable: number
      diagram?: string
    } = {
      organizationId,
      flows,
      total: flows.length,
      bottlenecks: flows.filter(f => f.bottleneckScore && f.bottleneckScore >= 60).length,
      automatable: flows.filter(f => f.canBeAutomated).length,
    }

    // Include Mermaid diagram if requested
    if (includeDiagram) {
      response.diagram = await generateInformationFlowDiagram(organizationId)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error getting organization flows:', error)
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
    const { flowCode, assessmentId, ...flowData } = body

    if (!flowCode) {
      return NextResponse.json({ error: 'flowCode is required' }, { status: 400 })
    }

    // Create/update flow
    const flow = await upsertInformationFlow(
      organizationId,
      { flowCode, ...flowData },
      assessmentId
    )

    return NextResponse.json({
      success: true,
      flow,
    })
  } catch (error) {
    console.error('Error creating/updating flow:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
