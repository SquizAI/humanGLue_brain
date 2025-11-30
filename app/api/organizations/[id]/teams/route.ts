/**
 * Organization Teams API
 * GET - Get team structure hierarchy for an organization
 * POST - Create or update a team
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getOrganizationTeamHierarchy,
  upsertTeamStructure,
  generateOrgChart,
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
    const includeDiagram = searchParams.get('includeDiagram') === 'true'

    // Get team hierarchy
    const teams = await getOrganizationTeamHierarchy(organizationId)

    // Count teams recursively
    function countTeams(teamList: typeof teams): number {
      return teamList.reduce((count, team) => {
        return count + 1 + (team.children ? countTeams(team.children) : 0)
      }, 0)
    }

    // Calculate total team members
    function countMembers(teamList: typeof teams): number {
      return teamList.reduce((count, team) => {
        return count + (team.teamSize || 0) + (team.children ? countMembers(team.children) : 0)
      }, 0)
    }

    // Calculate average AI literacy
    function calculateAvgAiLiteracy(teamList: typeof teams): { total: number; count: number } {
      return teamList.reduce(
        (acc, team) => {
          const childStats = team.children ? calculateAvgAiLiteracy(team.children) : { total: 0, count: 0 }
          return {
            total: acc.total + (team.aiLiteracyScore || 0) + childStats.total,
            count: acc.count + (team.aiLiteracyScore !== undefined ? 1 : 0) + childStats.count,
          }
        },
        { total: 0, count: 0 }
      )
    }

    const aiLiteracyStats = calculateAvgAiLiteracy(teams)

    const response: {
      organizationId: string
      teams: typeof teams
      summary: {
        totalTeams: number
        totalMembers: number
        avgAiLiteracy: number | null
      }
      diagram?: string
    } = {
      organizationId,
      teams,
      summary: {
        totalTeams: countTeams(teams),
        totalMembers: countMembers(teams),
        avgAiLiteracy: aiLiteracyStats.count > 0
          ? Math.round(aiLiteracyStats.total / aiLiteracyStats.count)
          : null,
      },
    }

    // Include Mermaid diagram if requested
    if (includeDiagram) {
      response.diagram = await generateOrgChart(organizationId)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error getting organization teams:', error)
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
    const { teamCode, assessmentId, ...teamData } = body

    if (!teamCode) {
      return NextResponse.json({ error: 'teamCode is required' }, { status: 400 })
    }

    // Create/update team
    const team = await upsertTeamStructure(
      organizationId,
      { teamCode, ...teamData },
      assessmentId
    )

    return NextResponse.json({
      success: true,
      team,
    })
  } catch (error) {
    console.error('Error creating/updating team:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
