import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getOrgBranding,
  updateOrgBranding,
  validateBranding,
  type OrgBranding
} from '@/services/branding'

/**
 * GET /api/organizations/[id]/branding
 * Retrieve organization branding configuration
 *
 * Authentication: Required
 * Authorization: User must belong to the organization or be a platform admin
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check authorization: user must belong to org or be admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (userError) {
      return NextResponse.json(
        { error: 'Failed to verify user permissions' },
        { status: 500 }
      )
    }

    // Platform admins can access any org's branding
    const isPlatformAdmin = userData?.role === 'admin'
    const belongsToOrg = userData?.organization_id === params.id

    if (!isPlatformAdmin && !belongsToOrg) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have access to this organization' },
        { status: 403 }
      )
    }

    // Fetch branding configuration
    const branding = await getOrgBranding(params.id)

    return NextResponse.json({
      success: true,
      data: branding
    })

  } catch (error) {
    console.error('Error fetching organization branding:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch branding configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/organizations/[id]/branding
 * Update organization branding configuration
 *
 * Authentication: Required
 * Authorization: User must be org_admin or platform admin
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check authorization: user must be org_admin or admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (userError) {
      return NextResponse.json(
        { error: 'Failed to verify user permissions' },
        { status: 500 }
      )
    }

    const isPlatformAdmin = userData?.role === 'admin'
    const isOrgAdmin = userData?.role === 'org_admin' && userData?.organization_id === params.id

    if (!isPlatformAdmin && !isOrgAdmin) {
      return NextResponse.json(
        {
          error: 'Forbidden: Only organization admins can update branding',
          required_role: ['admin', 'org_admin']
        },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const branding = await request.json() as Partial<OrgBranding>

    // Validate branding configuration
    const validationErrors = validateBranding(branding)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: 'Invalid branding configuration',
          validation_errors: validationErrors
        },
        { status: 400 }
      )
    }

    // Update branding
    await updateOrgBranding(params.id, branding)

    // Fetch updated branding to return
    const updatedBranding = await getOrgBranding(params.id)

    return NextResponse.json({
      success: true,
      message: 'Branding updated successfully',
      data: updatedBranding
    })

  } catch (error) {
    console.error('Error updating organization branding:', error)
    return NextResponse.json(
      {
        error: 'Failed to update branding configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/organizations/[id]/branding
 * Partially update organization branding configuration
 * Alias for POST - both do the same thing (merge with existing)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return POST(request, { params })
}
