/**
 * Organization Minds API
 * GET /api/organizations/[id]/minds - List all minds for organization
 * POST /api/organizations/[id]/minds - Create a new mind for organization
 *
 * Manages Mind Reasoner digital minds at the organization level
 * for multi-tenant psychometric profiling.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, handleUnknownError, APIErrors } from '@/lib/api/errors'
import { requireAuth } from '@/lib/api/auth'
import { analyzeTeamDynamics, PsychometricProfile } from '@/lib/services/mind-reasoner'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Type for organization mind record
interface OrganizationMind {
  id: string
  mind_reasoner_mind_id: string
  mind_reasoner_digital_twin_id: string | null
  user_id: string | null
  team_id: string | null
  name: string
  description: string | null
  mind_type: string
  latest_snapshot_id: string | null
  latest_snapshot_status: string | null
  latest_snapshot_at: string | null
  psychometric_profile: Record<string, unknown> | null
  profile_confidence: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * GET /api/organizations/[id]/minds
 * List all minds in an organization with optional filtering
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: organizationId } = await params

    const searchParams = request.nextUrl.searchParams
    const mindType = searchParams.get('type') // individual, team, department, organization
    const teamId = searchParams.get('teamId')
    const includeProfiles = searchParams.get('profiles') !== 'false'
    const includeDynamics = searchParams.get('dynamics') === 'true'

    const supabase = await createClient()

    // Verify organization membership
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json(
        errorResponse(APIErrors.FORBIDDEN()),
        { status: 403 }
      )
    }

    // Build select fields
    const selectFields = [
      'id',
      'mind_reasoner_mind_id',
      'mind_reasoner_digital_twin_id',
      'user_id',
      'team_id',
      'name',
      'description',
      'mind_type',
      'latest_snapshot_id',
      'latest_snapshot_status',
      'latest_snapshot_at',
      includeProfiles ? 'psychometric_profile' : null,
      'profile_confidence',
      'is_active',
      'created_at',
      'updated_at',
    ].filter(Boolean).join(', ')

    // Build query with optional filters
    let queryBuilder = supabase
      .from('organization_minds')
      .select(selectFields)
      .eq('organization_id', organizationId)
      .eq('is_active', true)

    if (mindType) {
      queryBuilder = queryBuilder.eq('mind_type', mindType)
    }

    if (teamId) {
      queryBuilder = queryBuilder.eq('team_id', teamId)
    }

    const { data: minds, error: mindsError } = await queryBuilder.order('created_at', { ascending: false })

    if (mindsError) throw mindsError

    // Cast to typed array (via unknown for stricter TypeScript)
    const typedMinds = (minds || []) as unknown as OrganizationMind[]

    // Calculate team dynamics if requested
    let teamDynamics = null
    if (includeDynamics && typedMinds.length > 1) {
      const profiles = typedMinds
        .filter(m => m.psychometric_profile)
        .map(m => m.psychometric_profile as unknown as PsychometricProfile)

      if (profiles.length > 1) {
        teamDynamics = analyzeTeamDynamics(profiles)
      }
    }

    // Get summary statistics
    const stats = {
      total: typedMinds.length,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      avgConfidence: 0,
    }

    if (typedMinds.length > 0) {
      let totalConfidence = 0
      let confidenceCount = 0

      for (const mind of typedMinds) {
        // Count by type
        stats.byType[mind.mind_type] = (stats.byType[mind.mind_type] || 0) + 1

        // Count by status
        const status = mind.latest_snapshot_status || 'pending'
        stats.byStatus[status] = (stats.byStatus[status] || 0) + 1

        // Sum confidence
        if (mind.profile_confidence) {
          totalConfidence += mind.profile_confidence
          confidenceCount++
        }
      }

      stats.avgConfidence = confidenceCount > 0 ? Math.round(totalConfidence / confidenceCount) : 0
    }

    return NextResponse.json(successResponse({
      organizationId,
      minds: typedMinds.map(m => ({
        id: m.id,
        mindReasonerId: m.mind_reasoner_mind_id,
        digitalTwinId: m.mind_reasoner_digital_twin_id,
        userId: m.user_id,
        teamId: m.team_id,
        name: m.name,
        description: m.description,
        type: m.mind_type,
        snapshotStatus: m.latest_snapshot_status,
        snapshotAt: m.latest_snapshot_at,
        profile: includeProfiles ? m.psychometric_profile : undefined,
        confidence: m.profile_confidence,
        isActive: m.is_active,
        createdAt: m.created_at,
        updatedAt: m.updated_at,
      })),
      stats,
      teamDynamics,
    }))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}

/**
 * POST /api/organizations/[id]/minds
 * Create a new mind for the organization
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: organizationId } = await params

    const body = await request.json()
    const {
      name,
      description,
      mindType = 'individual',
      userId,
      teamId,
      initialProfile,
    } = body

    if (!name) {
      return NextResponse.json(
        errorResponse(APIErrors.BAD_REQUEST('Name is required')),
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify admin access to organization
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json(
        errorResponse(APIErrors.FORBIDDEN()),
        { status: 403 }
      )
    }

    // Only admins can create organization/team minds
    const isAdmin = ['admin', 'org_admin'].includes(membership.role)
    if (!isAdmin && (mindType !== 'individual' || userId !== user.id)) {
      return NextResponse.json(
        errorResponse(APIErrors.FORBIDDEN()),
        { status: 403 }
      )
    }

    // Check organization has Mind Reasoner enabled
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('mind_reasoner_enabled')
      .eq('id', organizationId)
      .single()

    if (orgError || !org) {
      return NextResponse.json(
        errorResponse(APIErrors.NOT_FOUND('Organization')),
        { status: 404 }
      )
    }

    // Generate a unique mind ID (will be replaced with Mind Reasoner ID if integrated)
    const mindReasonerId = `org-${organizationId}-${Date.now()}`

    // Create the mind
    const { data: mind, error: createError } = await supabase
      .from('organization_minds')
      .insert({
        organization_id: organizationId,
        mind_reasoner_mind_id: mindReasonerId,
        user_id: userId || (mindType === 'individual' ? user.id : null),
        team_id: teamId || null,
        name,
        description,
        mind_type: mindType,
        psychometric_profile: initialProfile || {},
        profile_confidence: initialProfile ? 50 : 0, // Lower confidence for initial profile
        latest_snapshot_status: 'pending',
      })
      .select('*')
      .single()

    if (createError) {
      if (createError.code === '23505') {
        return NextResponse.json(
          errorResponse(APIErrors.CONFLICT('A mind with this ID already exists')),
          { status: 409 }
        )
      }
      throw createError
    }

    return NextResponse.json(successResponse({
      message: 'Mind created successfully',
      mind: {
        id: mind.id,
        mindReasonerId: mind.mind_reasoner_mind_id,
        name: mind.name,
        description: mind.description,
        type: mind.mind_type,
        userId: mind.user_id,
        teamId: mind.team_id,
        snapshotStatus: mind.latest_snapshot_status,
        confidence: mind.profile_confidence,
        createdAt: mind.created_at,
      },
      mindReasonerEnabled: org.mind_reasoner_enabled,
    }), { status: 201 })
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
