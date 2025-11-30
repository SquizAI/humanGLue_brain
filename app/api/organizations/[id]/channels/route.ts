/**
 * Organization Communication Channels API
 * GET - List all communication channels for an organization
 * POST - Create or update a communication channel
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getOrganizationChannels,
  upsertCommunicationChannel,
  ChannelType,
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
    const channelType = searchParams.get('channelType') as ChannelType | undefined
    const embeddableOnly = searchParams.get('embeddableOnly') === 'true'

    // Get channels
    const channels = await getOrganizationChannels(organizationId, {
      channelType,
      embeddableOnly,
    })

    return NextResponse.json({
      organizationId,
      channels,
      total: channels.length,
      embeddable: channels.filter(c => c.humanglueEmbeddable).length,
    })
  } catch (error) {
    console.error('Error getting organization channels:', error)
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
    const { channelName, assessmentId, ...channelData } = body

    if (!channelName) {
      return NextResponse.json({ error: 'channelName is required' }, { status: 400 })
    }

    // Create/update channel
    const channel = await upsertCommunicationChannel(
      organizationId,
      { channelName, ...channelData },
      assessmentId
    )

    return NextResponse.json({
      success: true,
      channel,
    })
  } catch (error) {
    console.error('Error creating/updating channel:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
