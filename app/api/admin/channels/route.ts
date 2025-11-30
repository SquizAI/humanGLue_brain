/**
 * Channel Configuration API
 *
 * GET /api/admin/channels - Get all channel configurations
 * PUT /api/admin/channels - Update channel configurations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { socialOAuthService } from '@/lib/services/social-oauth'

// Tier hierarchy for permission checks
const TIER_LEVELS: Record<string, number> = {
  free: 0,
  starter: 1,
  professional: 2,
  enterprise: 3,
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's organization
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (!userData?.organization_id) {
      return NextResponse.json(
        { success: false, error: 'No organization' },
        { status: 400 }
      )
    }

    // Get organization details
    const { data: org } = await supabase
      .from('organizations')
      .select('id, name, subscription_tier, settings')
      .eq('id', userData.organization_id)
      .single()

    if (!org) {
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Get channel configurations
    const { data: channels } = await supabase
      .from('organization_channels')
      .select('*')
      .eq('organization_id', userData.organization_id)
      .order('channel_type')

    // Get social connections
    const connections = await socialOAuthService.getConnections(userData.organization_id)

    // Get social pages
    const pages = await socialOAuthService.getPages(userData.organization_id)

    // Get email configuration
    const { data: emailConfig } = await supabase
      .from('email_configurations')
      .select('*')
      .eq('organization_id', userData.organization_id)
      .single()

    // Get newsletter configuration
    const { data: newsletterConfig } = await supabase
      .from('newsletter_configurations')
      .select('*')
      .eq('organization_id', userData.organization_id)
      .single()

    // Get workshop settings
    const { data: workshopSettings } = await supabase
      .from('workshop_announcement_settings')
      .select('*')
      .eq('organization_id', userData.organization_id)
      .single()

    // Check what platforms are configured (have OAuth credentials)
    const configuredPlatforms = socialOAuthService.getConfiguredPlatforms()

    // Calculate which channels are available based on tier
    const orgTierLevel = TIER_LEVELS[org.subscription_tier] || 0
    const channelsWithAccess = (channels || []).map((channel: any) => {
      const requiredTierLevel = TIER_LEVELS[channel.tier_required] || 0
      return {
        ...channel,
        hasAccess: orgTierLevel >= requiredTierLevel,
        currentTier: org.subscription_tier,
        requiredTier: channel.tier_required,
      }
    })

    return NextResponse.json({
      success: true,
      organization: {
        id: org.id,
        name: org.name,
        subscriptionTier: org.subscription_tier,
      },
      channels: channelsWithAccess,
      social: {
        configuredPlatforms,
        connections,
        pages,
      },
      email: emailConfig ? {
        id: emailConfig.id,
        provider: emailConfig.provider,
        fromName: emailConfig.from_name,
        fromEmail: emailConfig.from_email,
        sendingDomain: emailConfig.sending_domain,
        domainVerified: emailConfig.domain_verified,
        isActive: emailConfig.is_active,
        dailySendLimit: emailConfig.daily_send_limit,
        monthlySendLimit: emailConfig.monthly_send_limit,
      } : null,
      newsletter: newsletterConfig ? {
        id: newsletterConfig.id,
        name: newsletterConfig.newsletter_name,
        description: newsletterConfig.newsletter_description,
        isActive: newsletterConfig.is_active,
        requireDoubleOptin: newsletterConfig.require_double_optin,
        trackOpens: newsletterConfig.track_opens,
        trackClicks: newsletterConfig.track_clicks,
      } : null,
      workshop: workshopSettings ? {
        id: workshopSettings.id,
        autoAnnounce: workshopSettings.auto_announce_new_workshops,
        announceDaysBefore: workshopSettings.announce_days_before,
        reminderDaysBefore: workshopSettings.reminder_days_before,
        announceOnSocial: workshopSettings.announce_on_social,
        announceViaEmail: workshopSettings.announce_via_email,
        announceInNewsletter: workshopSettings.announce_in_newsletter,
        isActive: workshopSettings.is_active,
      } : null,
    })
  } catch (error) {
    console.error('[Channels API] GET error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch channel configurations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's organization and verify admin role
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (!userData?.organization_id) {
      return NextResponse.json(
        { success: false, error: 'No organization' },
        { status: 400 }
      )
    }

    if (!['admin', 'org_admin'].includes(userData.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { channelType, action, data } = body

    switch (action) {
      case 'toggle_channel': {
        const { error } = await supabase
          .from('organization_channels')
          .update({ is_enabled: data.enabled })
          .eq('organization_id', userData.organization_id)
          .eq('channel_type', channelType)

        if (error) throw error
        break
      }

      case 'update_email_config': {
        const { error } = await supabase
          .from('email_configurations')
          .upsert({
            organization_id: userData.organization_id,
            provider: data.provider,
            from_name: data.fromName,
            from_email: data.fromEmail,
            reply_to_email: data.replyToEmail,
            sending_domain: data.sendingDomain,
            daily_send_limit: data.dailySendLimit,
            monthly_send_limit: data.monthlySendLimit,
            is_active: data.isActive,
          }, {
            onConflict: 'organization_id',
          })

        if (error) throw error
        break
      }

      case 'update_newsletter_config': {
        const { error } = await supabase
          .from('newsletter_configurations')
          .upsert({
            organization_id: userData.organization_id,
            newsletter_name: data.name,
            newsletter_description: data.description,
            newsletter_logo_url: data.logoUrl,
            newsletter_color_primary: data.primaryColor,
            newsletter_color_secondary: data.secondaryColor,
            require_double_optin: data.requireDoubleOptin,
            track_opens: data.trackOpens,
            track_clicks: data.trackClicks,
            default_send_day: data.defaultSendDay,
            default_send_time: data.defaultSendTime,
            timezone: data.timezone,
            is_active: data.isActive,
          }, {
            onConflict: 'organization_id',
          })

        if (error) throw error
        break
      }

      case 'update_workshop_settings': {
        const { error } = await supabase
          .from('workshop_announcement_settings')
          .upsert({
            organization_id: userData.organization_id,
            auto_announce_new_workshops: data.autoAnnounce,
            announce_days_before: data.announceDaysBefore,
            reminder_days_before: data.reminderDaysBefore,
            announce_on_social: data.announceOnSocial,
            announce_via_email: data.announceViaEmail,
            announce_in_newsletter: data.announceInNewsletter,
            social_template: data.socialTemplate,
            email_template: data.emailTemplate,
            default_image_url: data.defaultImageUrl,
            include_instructor_info: data.includeInstructorInfo,
            include_pricing: data.includePricing,
            is_active: data.isActive,
          }, {
            onConflict: 'organization_id',
          })

        if (error) throw error
        break
      }

      case 'set_default_page': {
        await socialOAuthService.setDefaultPage(
          data.pageId,
          userData.organization_id,
          data.platform
        )
        break
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: 'Configuration updated',
    })
  } catch (error) {
    console.error('[Channels API] PUT error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update configuration',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
