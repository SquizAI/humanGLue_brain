/**
 * Organization Diagrams API
 * GET - Generate Mermaid diagrams for various organizational visualizations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  generateOrgChart,
  generateInformationFlowDiagram,
  generateProcessFlowchart,
  getOrganizationProcesses,
} from '@/lib/services/process-mapping'

export type DiagramType = 'org' | 'flows' | 'process' | 'all'

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
    const type = (searchParams.get('type') || 'all') as DiagramType
    const processCode = searchParams.get('processCode')

    const diagrams: {
      organizationId: string
      orgChart?: string
      informationFlows?: string
      processDiagrams?: Record<string, string>
      specificProcess?: string
    } = {
      organizationId,
    }

    // Generate requested diagrams
    switch (type) {
      case 'org':
        diagrams.orgChart = await generateOrgChart(organizationId)
        break

      case 'flows':
        diagrams.informationFlows = await generateInformationFlowDiagram(organizationId)
        break

      case 'process':
        if (processCode) {
          // Get specific process by code
          const processes = await getOrganizationProcesses(organizationId)
          const process = processes.find(p => p.processCode === processCode)
          if (process) {
            diagrams.specificProcess = await generateProcessFlowchart(process.id)
          } else {
            return NextResponse.json({ error: `Process not found: ${processCode}` }, { status: 404 })
          }
        } else {
          // Get all process diagrams
          const allProcesses = await getOrganizationProcesses(organizationId)
          diagrams.processDiagrams = {}
          for (const proc of allProcesses) {
            diagrams.processDiagrams[proc.processCode] = await generateProcessFlowchart(proc.id)
          }
        }
        break

      case 'all':
      default:
        // Generate all diagram types
        const [orgChart, informationFlows, processes] = await Promise.all([
          generateOrgChart(organizationId),
          generateInformationFlowDiagram(organizationId),
          getOrganizationProcesses(organizationId),
        ])

        diagrams.orgChart = orgChart
        diagrams.informationFlows = informationFlows
        diagrams.processDiagrams = {}

        for (const proc of processes) {
          diagrams.processDiagrams[proc.processCode] = await generateProcessFlowchart(proc.id)
        }
        break
    }

    return NextResponse.json(diagrams)
  } catch (error) {
    console.error('Error generating diagrams:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
