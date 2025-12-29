/**
 * Expert Applications API
 * GET - List applications (admin only, or own applications)
 * POST - Create a new application (public)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'
import {
  sendApplicationConfirmation,
  notifyAdminsOfNewApplication,
} from '@/lib/services/expert-application-emails'

// Validation schema for creating an application
const createApplicationSchema = z.object({
  // Personal Information
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  timezone: z.string().optional().nullable(),

  // Professional Information
  professionalTitle: z.string().min(5, 'Title must be at least 5 characters').max(200),
  headline: z.string().max(200).optional().nullable(),
  bio: z.string().min(100, 'Bio must be at least 100 characters').max(3000, 'Bio cannot exceed 3000 characters'),

  // Visual Assets
  profileImageUrl: z.string().url().optional().nullable(),
  videoIntroUrl: z.string().url().optional().nullable(),

  // Experience & Expertise
  yearsExperience: z.number().int().min(0, 'Years must be 0 or greater'),
  expertiseAreas: z.array(z.string()).default([]),
  aiPillars: z.array(z.string()).default([]),
  industries: z.array(z.string()).default([]),

  // Credentials
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    year: z.number().optional(),
  })).default([]),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    year: z.number().optional(),
    url: z.string().optional(),
  })).default([]),
  workHistory: z.array(z.object({
    title: z.string(),
    company: z.string(),
    startYear: z.number().optional(),
    endYear: z.number().optional().nullable(),
    description: z.string().optional(),
  })).default([]),

  // Social Links
  linkedinUrl: z.string().url().optional().nullable(),
  twitterUrl: z.string().url().optional().nullable(),
  websiteUrl: z.string().url().optional().nullable(),
  githubUrl: z.string().url().optional().nullable(),
  portfolioUrls: z.array(z.string().url()).default([]),

  // Service Information
  desiredHourlyRate: z.number().min(0).optional().nullable(),
  availability: z.enum(['full_time', 'part_time', 'limited']).optional().nullable(),
  servicesOffered: z.array(z.string()).default([]),

  // Application Details
  whyJoin: z.string().max(2000).optional().nullable(),
  uniqueValue: z.string().max(2000).optional().nullable(),
  sampleTopics: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    format: z.string().optional(),
  })).default([]),
  references: z.array(z.object({
    name: z.string(),
    title: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional(),
  })).default([]),

  // Legal
  agreedToTerms: z.boolean(),
  backgroundCheckConsent: z.boolean().default(false),

  // Submission options
  submitNow: z.boolean().default(false), // If true, submit immediately; otherwise save as draft
  source: z.string().optional().nullable(),
  referralCode: z.string().optional().nullable(),
})

/**
 * GET /api/expert-applications
 * List applications - admins see all, users see their own
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user (optional)
    const { data: { user } } = await supabase.auth.getUser()

    // Get query params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Check if admin
    let isAdmin = false
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      isAdmin = profile?.role && ['admin', 'super_admin_full'].includes(profile.role)
    }

    // Build query
    let query = supabase
      .from('expert_applications')
      .select('*', { count: 'exact' })

    // Filter by user if not admin
    if (!isAdmin) {
      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
          },
          { status: 401 }
        )
      }
      query = query.or(`user_id.eq.${user.id},email.eq.${user.email}`)
    }

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status)
    }

    // Pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: applications, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: applications || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    })
  } catch (error) {
    console.error('List applications error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch applications',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/expert-applications
 * Create a new application
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = createApplicationSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid application data',
            details: validation.error.errors,
          },
        },
        { status: 400 }
      )
    }

    const data = validation.data
    const supabase = await createClient()
    const adminSupabase = await createAdminClient()

    // Get current user (optional)
    const { data: { user } } = await supabase.auth.getUser()

    // Check if an application already exists for this email
    const { data: existing } = await supabase
      .from('expert_applications')
      .select('id, status')
      .eq('email', data.email)
      .neq('status', 'rejected')
      .neq('status', 'withdrawn')
      .single()

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'APPLICATION_EXISTS',
            message: 'An application already exists for this email address',
            applicationId: existing.id,
            status: existing.status,
          },
        },
        { status: 409 }
      )
    }

    // Validate terms agreement if submitting
    if (data.submitNow && !data.agreedToTerms) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TERMS_REQUIRED',
            message: 'You must agree to the terms and conditions to submit your application',
          },
        },
        { status: 400 }
      )
    }

    // Get IP and user agent for tracking
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Create application using admin client (bypasses RLS for public form submissions)
    const { data: application, error } = await adminSupabase
      .from('expert_applications')
      .insert({
        user_id: user?.id || null,
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        location: data.location,
        timezone: data.timezone,
        professional_title: data.professionalTitle,
        headline: data.headline,
        bio: data.bio,
        profile_image_url: data.profileImageUrl,
        video_intro_url: data.videoIntroUrl,
        years_experience: data.yearsExperience,
        expertise_areas: data.expertiseAreas,
        ai_pillars: data.aiPillars,
        industries: data.industries,
        education: data.education,
        certifications: data.certifications,
        work_history: data.workHistory,
        linkedin_url: data.linkedinUrl,
        twitter_url: data.twitterUrl,
        website_url: data.websiteUrl,
        github_url: data.githubUrl,
        portfolio_urls: data.portfolioUrls,
        desired_hourly_rate: data.desiredHourlyRate,
        availability: data.availability,
        services_offered: data.servicesOffered,
        why_join: data.whyJoin,
        unique_value: data.uniqueValue,
        sample_topics: data.sampleTopics,
        references: data.references,
        agreed_to_terms: data.agreedToTerms,
        agreed_to_terms_at: data.agreedToTerms ? new Date().toISOString() : null,
        background_check_consent: data.backgroundCheckConsent,
        status: data.submitNow ? 'submitted' : 'draft',
        submitted_at: data.submitNow ? new Date().toISOString() : null,
        ip_address: ip,
        user_agent: userAgent,
        source: data.source,
        referral_code: data.referralCode,
      })
      .select()
      .single()

    if (error) throw error

    // Send email notifications if application was submitted (not just saved as draft)
    if (data.submitNow && application) {
      try {
        const applicationData = {
          id: application.id,
          full_name: application.full_name,
          email: application.email,
          professional_title: application.professional_title,
          headline: application.headline,
          expertise_areas: application.expertise_areas,
        }

        // Send confirmation to applicant
        await sendApplicationConfirmation(applicationData)

        // Notify admins of new submission
        await notifyAdminsOfNewApplication(applicationData)
      } catch (emailError) {
        // Log but don't fail the request - application was still created
        console.error('Failed to send email notifications:', emailError)
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: application,
        message: data.submitNow
          ? 'Your application has been submitted successfully. We will review it and get back to you soon.'
          : 'Your application has been saved as a draft. You can continue editing it anytime.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create application error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create application',
        },
      },
      { status: 500 }
    )
  }
}
