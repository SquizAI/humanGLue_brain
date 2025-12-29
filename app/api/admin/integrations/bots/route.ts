import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Types
interface BotCreateRequest {
  platform: 'discord' | 'slack' | 'telegram' | 'web'
  name: string
  description?: string
  credentials: Record<string, string>
  settings?: Record<string, any>
  agentType?: 'master' | 'user' | 'organization'
  agentPersona?: string
  agentInstructions?: string
  toolsEnabled?: string[]
}

// Helper to verify admin access
async function verifyAdminAccess(supabase: any) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized', status: 401 }
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('organization_id, role')
    .eq('id', user.id)
    .single()

  if (userError || !userData) {
    return { error: 'User not found', status: 404 }
  }

  if (!['admin', 'super_admin', 'org_admin'].includes(userData.role)) {
    return { error: 'Admin access required', status: 403 }
  }

  return { user, userData, orgId: userData.organization_id }
}

// GET - List all bots for organization
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const auth = await verifyAdminAccess(supabase)

    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
    }

    const { data: bots, error } = await supabase
      .from('bot_configurations')
      .select('*')
      .eq('organization_id', auth.orgId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bots:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch bots' }, { status: 500 })
    }

    // Mask sensitive credentials
    const maskedBots = bots?.map(bot => ({
      ...bot,
      credentials: Object.fromEntries(
        Object.entries(bot.credentials || {}).map(([key, value]) => [
          key,
          typeof value === 'string' && value.length > 8
            ? value.substring(0, 4) + '***' + value.substring(value.length - 4)
            : '***'
        ])
      )
    }))

    return NextResponse.json({ success: true, bots: maskedBots || [] })
  } catch (error) {
    console.error('Error in GET /api/admin/integrations/bots:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new bot
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const auth = await verifyAdminAccess(supabase)

    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
    }

    const body: BotCreateRequest = await request.json()

    // Validate required fields
    if (!body.platform || !body.name) {
      return NextResponse.json(
        { success: false, error: 'Platform and name are required' },
        { status: 400 }
      )
    }

    // Validate platform
    const validPlatforms = ['discord', 'slack', 'telegram', 'web']
    if (!validPlatforms.includes(body.platform)) {
      return NextResponse.json(
        { success: false, error: 'Invalid platform' },
        { status: 400 }
      )
    }

    // Check for duplicate name on same platform
    const { data: existing } = await supabase
      .from('bot_configurations')
      .select('id')
      .eq('organization_id', auth.orgId)
      .eq('platform', body.platform)
      .eq('name', body.name)
      .single()

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A bot with this name already exists for this platform' },
        { status: 409 }
      )
    }

    // Create bot
    const { data: bot, error } = await supabase
      .from('bot_configurations')
      .insert({
        organization_id: auth.orgId,
        platform: body.platform,
        name: body.name,
        description: body.description,
        credentials: body.credentials || {},
        settings: body.settings || {},
        agent_type: body.agentType || 'master',
        agent_persona: body.agentPersona,
        agent_instructions: body.agentInstructions,
        tools_enabled: body.toolsEnabled || ['courses', 'webSearch', 'knowledge'],
        status: 'configuring',
        created_by: auth.user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating bot:', error)
      return NextResponse.json({ success: false, error: 'Failed to create bot' }, { status: 500 })
    }

    return NextResponse.json({ success: true, bot }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/admin/integrations/bots:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update bot
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const auth = await verifyAdminAccess(supabase)

    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
    }

    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Bot ID is required' }, { status: 400 })
    }

    // Verify ownership
    const { data: existingBot } = await supabase
      .from('bot_configurations')
      .select('id')
      .eq('id', body.id)
      .eq('organization_id', auth.orgId)
      .single()

    if (!existingBot) {
      return NextResponse.json({ success: false, error: 'Bot not found' }, { status: 404 })
    }

    // Build update object
    const updates: Record<string, any> = {}
    if (body.name) updates.name = body.name
    if (body.description !== undefined) updates.description = body.description
    if (body.credentials) updates.credentials = body.credentials
    if (body.settings) updates.settings = body.settings
    if (body.status) updates.status = body.status
    if (body.agentType) updates.agent_type = body.agentType
    if (body.agentPersona !== undefined) updates.agent_persona = body.agentPersona
    if (body.agentInstructions !== undefined) updates.agent_instructions = body.agentInstructions
    if (body.toolsEnabled) updates.tools_enabled = body.toolsEnabled
    if (body.rateLimitPerUser) updates.rate_limit_per_user = body.rateLimitPerUser
    if (body.rateLimitPerOrg) updates.rate_limit_per_org = body.rateLimitPerOrg
    if (body.features) updates.features = body.features
    if (body.isDefault !== undefined) updates.is_default = body.isDefault

    const { data: bot, error } = await supabase
      .from('bot_configurations')
      .update(updates)
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating bot:', error)
      return NextResponse.json({ success: false, error: 'Failed to update bot' }, { status: 500 })
    }

    return NextResponse.json({ success: true, bot })
  } catch (error) {
    console.error('Error in PATCH /api/admin/integrations/bots:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete bot
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const auth = await verifyAdminAccess(supabase)

    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const botId = searchParams.get('id')

    if (!botId) {
      return NextResponse.json({ success: false, error: 'Bot ID is required' }, { status: 400 })
    }

    // Verify ownership
    const { data: existingBot } = await supabase
      .from('bot_configurations')
      .select('id, status')
      .eq('id', botId)
      .eq('organization_id', auth.orgId)
      .single()

    if (!existingBot) {
      return NextResponse.json({ success: false, error: 'Bot not found' }, { status: 404 })
    }

    // Don't allow deleting active bots
    if (existingBot.status === 'active') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete an active bot. Please stop it first.' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('bot_configurations')
      .delete()
      .eq('id', botId)

    if (error) {
      console.error('Error deleting bot:', error)
      return NextResponse.json({ success: false, error: 'Failed to delete bot' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Bot deleted' })
  } catch (error) {
    console.error('Error in DELETE /api/admin/integrations/bots:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
