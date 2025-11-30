/**
 * Organization Subscription API
 * GET - Get subscription details
 * PATCH - Update subscription (upgrade/downgrade)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/api/auth'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

const updateSubscriptionSchema = z.object({
  planSlug: z.enum(['free', 'starter', 'professional', 'enterprise']).optional(),
  billingCycle: z.enum(['monthly', 'yearly']).optional(),
})

/**
 * GET /api/organizations/[id]/subscription
 * Get subscription details including plan, usage, and billing history
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: orgId } = await params

    const supabase = await createClient()

    // Check membership
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single()

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isPlatformAdmin = profile?.role && ['admin', 'super_admin_full'].includes(profile.role)

    if (!membership && !isPlatformAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Not authorized' },
        },
        { status: 403 }
      )
    }

    // Only owners and org_admins can see full subscription details
    const canViewBilling =
      isPlatformAdmin ||
      (membership?.role && ['owner', 'org_admin'].includes(membership.role))

    if (!canViewBilling) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Not authorized to view billing' },
        },
        { status: 403 }
      )
    }

    // Get organization with subscription
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select(`
        id,
        name,
        subscription_tier,
        max_users,
        max_teams
      `)
      .eq('id', orgId)
      .single()

    if (orgError || !org) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Organization not found' },
        },
        { status: 404 }
      )
    }

    // Get subscription details
    const { data: subscription } = await supabase
      .from('organization_subscriptions')
      .select(`
        id,
        status,
        billing_cycle,
        current_period_start,
        current_period_end,
        current_user_count,
        current_team_count,
        stripe_subscription_id,
        stripe_customer_id,
        plan:subscription_plans(
          id,
          name,
          slug,
          description,
          price_monthly,
          price_yearly,
          max_users,
          max_teams,
          features
        )
      `)
      .eq('organization_id', orgId)
      .single()

    // Get all available plans for upgrade/downgrade options
    const { data: availablePlans } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly')

    // Get current usage
    const { count: memberCount } = await supabase
      .from('organization_members')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'active')

    const { count: teamCount } = await supabase
      .from('teams')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('is_active', true)

    // Calculate usage percentages
    const userUsagePercent = org.max_users === -1 ? 0 : Math.round(((memberCount || 0) / org.max_users) * 100)
    const teamUsagePercent = org.max_teams === -1 ? 0 : Math.round(((teamCount || 0) / org.max_teams) * 100)

    return NextResponse.json({
      success: true,
      data: {
        organization: org,
        subscription: subscription || {
          status: 'none',
          billing_cycle: 'monthly',
          plan: null,
        },
        usage: {
          users: {
            current: memberCount || 0,
            max: org.max_users,
            percent: userUsagePercent,
            unlimited: org.max_users === -1,
          },
          teams: {
            current: teamCount || 0,
            max: org.max_teams,
            percent: teamUsagePercent,
            unlimited: org.max_teams === -1,
          },
        },
        availablePlans: availablePlans || [],
      },
    })
  } catch (error) {
    console.error('Get subscription error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch subscription',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/organizations/[id]/subscription
 * Update subscription (change plan or billing cycle)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: orgId } = await params
    const body = await request.json()

    const validation = updateSubscriptionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid data',
            details: validation.error.errors,
          },
        },
        { status: 400 }
      )
    }

    const data = validation.data
    const supabase = await createClient()

    // Check if user is owner (only owners can change billing)
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single()

    if (!membership || membership.role !== 'owner') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Only organization owners can manage billing' },
        },
        { status: 403 }
      )
    }

    // Get current subscription
    const { data: currentSub } = await supabase
      .from('organization_subscriptions')
      .select('id, plan_id')
      .eq('organization_id', orgId)
      .single()

    const updates: Record<string, unknown> = {}

    if (data.planSlug) {
      // Get the new plan
      const { data: newPlan } = await supabase
        .from('subscription_plans')
        .select('id, max_users, max_teams')
        .eq('slug', data.planSlug)
        .single()

      if (!newPlan) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'INVALID_PLAN', message: 'Plan not found' },
          },
          { status: 400 }
        )
      }

      // Check if organization would exceed new plan limits
      const { count: memberCount } = await supabase
        .from('organization_members')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('status', 'active')

      const { count: teamCount } = await supabase
        .from('teams')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('is_active', true)

      if (newPlan.max_users !== -1 && (memberCount || 0) > newPlan.max_users) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'EXCEEDS_LIMIT',
              message: `Cannot downgrade: You have ${memberCount} users but the ${data.planSlug} plan only allows ${newPlan.max_users}`,
            },
          },
          { status: 400 }
        )
      }

      if (newPlan.max_teams !== -1 && (teamCount || 0) > newPlan.max_teams) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'EXCEEDS_LIMIT',
              message: `Cannot downgrade: You have ${teamCount} teams but the ${data.planSlug} plan only allows ${newPlan.max_teams}`,
            },
          },
          { status: 400 }
        )
      }

      updates.plan_id = newPlan.id

      // Update organization limits
      await supabase
        .from('organizations')
        .update({
          subscription_tier: data.planSlug,
          max_users: newPlan.max_users,
          max_teams: newPlan.max_teams,
        })
        .eq('id', orgId)
    }

    if (data.billingCycle) {
      updates.billing_cycle = data.billingCycle
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No changes to apply',
      })
    }

    // Update subscription
    if (currentSub) {
      await supabase
        .from('organization_subscriptions')
        .update(updates)
        .eq('id', currentSub.id)
    }

    // TODO: Integrate with Stripe for actual payment changes
    // For now, we just update the database

    return NextResponse.json({
      success: true,
      message: 'Subscription updated. Payment changes will be reflected in your next billing cycle.',
      // In production, this would return a Stripe checkout URL for upgrades
      // checkoutUrl: null
    })
  } catch (error) {
    console.error('Update subscription error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update subscription',
        },
      },
      { status: 500 }
    )
  }
}
