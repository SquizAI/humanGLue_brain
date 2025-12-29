import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Get all integrations for the organization
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Check admin access
    if (!['admin', 'super_admin', 'org_admin'].includes(userData.role)) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    const orgId = userData.organization_id

    // Fetch all integrations in parallel
    const [botsResult, webhooksResult, voiceResult, crmResult, apiKeysResult] = await Promise.all([
      supabase
        .from('bot_configurations')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false }),

      supabase
        .from('webhook_endpoints')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false }),

      supabase
        .from('voice_configurations')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false }),

      supabase
        .from('crm_integrations')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false }),

      supabase
        .from('api_keys')
        .select('id, name, key_prefix, scopes, is_active, last_used_at, usage_count, expires_at, created_at')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false }),
    ])

    return NextResponse.json({
      success: true,
      bots: botsResult.data || [],
      webhooks: webhooksResult.data || [],
      voice: voiceResult.data || [],
      crm: crmResult.data || [],
      apiKeys: apiKeysResult.data || [],
    })
  } catch (error) {
    console.error('Error fetching integrations:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
