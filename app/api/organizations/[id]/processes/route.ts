/**
 * Organization Processes API
 * GET - List all business processes for an organization
 * POST - Create or update a business process
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getOrganizationProcesses,
  upsertBusinessProcess,
  addProcessSteps,
  generateProcessFlowchart,
  ProcessCategory,
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
    const category = searchParams.get('category') as ProcessCategory | undefined
    const includeSteps = searchParams.get('includeSteps') === 'true'
    const sortBy = (searchParams.get('sortBy') as 'automation_score' | 'priority_rank' | 'name') || 'name'

    // Get processes
    const processes = await getOrganizationProcesses(organizationId, {
      category,
      includeSteps,
      sortBy,
    })

    return NextResponse.json({
      organizationId,
      processes,
      total: processes.length,
    })
  } catch (error) {
    console.error('Error getting organization processes:', error)
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
    const { processCode, steps, assessmentId, ...processData } = body

    if (!processCode) {
      return NextResponse.json({ error: 'processCode is required' }, { status: 400 })
    }

    // Create/update process
    const process = await upsertBusinessProcess(
      organizationId,
      { processCode, ...processData },
      assessmentId
    )

    // Add steps if provided
    if (steps && Array.isArray(steps) && steps.length > 0) {
      process.steps = await addProcessSteps(process.id, steps)
    }

    // Generate Mermaid diagram
    const mermaidDiagram = await generateProcessFlowchart(process.id)

    return NextResponse.json({
      success: true,
      process,
      diagram: mermaidDiagram,
    })
  } catch (error) {
    console.error('Error creating/updating process:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
