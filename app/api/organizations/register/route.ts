/**
 * POST /api/organizations/register
 * Register a new organization with admin user
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schema
const registerSchema = z.object({
  // Organization
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
  industry: z.string().min(1, 'Industry is required'),
  companySize: z.string().optional(),
  website: z.string().url('Invalid website URL').nullable().optional(),

  // Admin user
  adminFullName: z.string().min(2, 'Full name must be at least 2 characters'),
  adminEmail: z.string().email('Invalid email address'),
  adminPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain a special character'),
  adminJobTitle: z.string().nullable().optional(),

  // Plan
  planSlug: z.enum(['free', 'starter', 'professional', 'enterprise']),
  billingCycle: z.enum(['monthly', 'yearly']).default('monthly'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid registration data',
            details: validation.error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        },
        { status: 400 }
      )
    }

    const data = validation.data
    const supabaseAdmin = await createAdminClient()

    // Check if email already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
    const emailExists = existingUser?.users?.some(
      (u) => u.email?.toLowerCase() === data.adminEmail.toLowerCase()
    )

    if (emailExists) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'An account with this email already exists',
          },
        },
        { status: 409 }
      )
    }

    // Generate organization slug
    const slug = data.organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Check if slug exists
    const { data: existingOrg } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .single()

    const finalSlug = existingOrg ? `${slug}-${Date.now().toString(36)}` : slug

    // Create the auth user first
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.adminEmail,
      password: data.adminPassword,
      email_confirm: false, // Require email verification
      user_metadata: {
        full_name: data.adminFullName,
        role: 'org_admin',
      },
    })

    if (authError || !authData.user) {
      console.error('Auth user creation error:', authError)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_CREATION_FAILED',
            message: authError?.message || 'Failed to create user account',
          },
        },
        { status: 500 }
      )
    }

    const userId = authData.user.id

    try {
      // Create user profile in users table
      const { error: userError } = await supabaseAdmin.from('users').insert({
        id: userId,
        email: data.adminEmail,
        full_name: data.adminFullName,
        role: 'org_admin',
        status: 'active',
        email_verified: false,
      })

      if (userError) {
        console.error('User profile creation error:', userError)
        // Rollback: delete auth user
        await supabaseAdmin.auth.admin.deleteUser(userId)
        throw userError
      }

      // Create organization
      const { data: org, error: orgError } = await supabaseAdmin
        .from('organizations')
        .insert({
          name: data.organizationName,
          slug: finalSlug,
          industry: data.industry,
          company_size: data.companySize || null,
          website: data.website || null,
          owner_id: userId,
          subscription_tier: data.planSlug,
          max_users: getMaxUsers(data.planSlug),
          max_teams: getMaxTeams(data.planSlug),
          settings: {
            created_via: 'organization_signup',
            billing_cycle: data.billingCycle,
          },
        })
        .select()
        .single()

      if (orgError || !org) {
        console.error('Organization creation error:', orgError)
        // Rollback: delete user and auth
        await supabaseAdmin.from('users').delete().eq('id', userId)
        await supabaseAdmin.auth.admin.deleteUser(userId)
        throw orgError
      }

      // Update user with organization_id
      await supabaseAdmin
        .from('users')
        .update({ organization_id: org.id })
        .eq('id', userId)

      // Create organization member record
      const { error: memberError } = await supabaseAdmin
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: userId,
          role: 'owner',
          status: 'active',
          title: data.adminJobTitle || 'Administrator',
          joined_at: new Date().toISOString(),
        })

      if (memberError) {
        console.error('Member creation error:', memberError)
        // Non-critical, continue
      }

      // Get subscription plan
      const { data: plan } = await supabaseAdmin
        .from('subscription_plans')
        .select('id, price_monthly, price_yearly, stripe_price_id_monthly, stripe_price_id_yearly')
        .eq('slug', data.planSlug)
        .single()

      // Create subscription record
      if (plan) {
        await supabaseAdmin.from('organization_subscriptions').insert({
          organization_id: org.id,
          plan_id: plan.id,
          billing_cycle: data.billingCycle,
          status: data.planSlug === 'free' ? 'active' : 'pending',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(
            Date.now() +
              (data.billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000
          ).toISOString(),
          current_user_count: 1,
        })
      }

      // Send verification email
      await supabaseAdmin.auth.admin.generateLink({
        type: 'signup',
        email: data.adminEmail,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/dashboard`,
        },
      })

      // Handle paid plans - create Stripe checkout session
      let checkoutUrl: string | null = null

      if (data.planSlug !== 'free' && data.planSlug !== 'enterprise' && plan) {
        // For paid plans, we would create a Stripe checkout session here
        // For now, we'll just return success and handle payment separately
        // TODO: Implement Stripe checkout session creation

        // Placeholder for Stripe integration
        // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
        // const session = await stripe.checkout.sessions.create({...})
        // checkoutUrl = session.url
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            organization: {
              id: org.id,
              name: org.name,
              slug: org.slug,
            },
            user: {
              id: userId,
              email: data.adminEmail,
            },
            plan: data.planSlug,
            checkoutUrl,
            message:
              data.planSlug === 'enterprise'
                ? 'Enterprise request submitted. Our team will contact you shortly.'
                : 'Organization created successfully. Please check your email to verify your account.',
          },
        },
        { status: 201 }
      )
    } catch (innerError) {
      // Cleanup on any inner error
      console.error('Registration inner error:', innerError)
      await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {})
      throw innerError
    }
  } catch (error) {
    console.error('Organization registration error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'REGISTRATION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to register organization',
        },
      },
      { status: 500 }
    )
  }
}

// Helper functions for plan limits
function getMaxUsers(planSlug: string): number {
  switch (planSlug) {
    case 'free':
      return 5
    case 'starter':
      return 25
    case 'professional':
      return 100
    case 'enterprise':
      return -1 // Unlimited
    default:
      return 5
  }
}

function getMaxTeams(planSlug: string): number {
  switch (planSlug) {
    case 'free':
      return 1
    case 'starter':
      return 3
    case 'professional':
      return 10
    case 'enterprise':
      return -1 // Unlimited
    default:
      return 1
  }
}
