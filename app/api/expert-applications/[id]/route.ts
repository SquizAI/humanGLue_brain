/**
 * Single Expert Application API
 * GET - Get application details
 * PATCH - Update application (draft) or submit
 * DELETE - Withdraw application
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Validation schema for updating an application
const updateApplicationSchema = z.object({
  // Personal Information
  fullName: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  timezone: z.string().optional().nullable(),

  // Professional Information
  professionalTitle: z.string().min(5).max(200).optional(),
  headline: z.string().max(200).optional().nullable(),
  bio: z.string().min(100).max(3000).optional(),

  // Visual Assets
  profileImageUrl: z.string().url().optional().nullable(),
  videoIntroUrl: z.string().url().optional().nullable(),

  // Experience & Expertise
  yearsExperience: z.number().int().min(0).optional(),
  expertiseAreas: z.array(z.string()).optional(),
  aiPillars: z.array(z.string()).optional(),
  industries: z.array(z.string()).optional(),

  // Credentials
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    year: z.number().optional(),
  })).optional(),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    year: z.number().optional(),
    url: z.string().optional(),
  })).optional(),
  workHistory: z.array(z.object({
    title: z.string(),
    company: z.string(),
    startYear: z.number().optional(),
    endYear: z.number().optional().nullable(),
    description: z.string().optional(),
  })).optional(),

  // Social Links
  linkedinUrl: z.string().url().optional().nullable(),
  twitterUrl: z.string().url().optional().nullable(),
  websiteUrl: z.string().url().optional().nullable(),
  githubUrl: z.string().url().optional().nullable(),
  portfolioUrls: z.array(z.string().url()).optional(),

  // Service Information
  desiredHourlyRate: z.number().min(0).optional().nullable(),
  availability: z.enum(['full_time', 'part_time', 'limited']).optional().nullable(),
  servicesOffered: z.array(z.string()).optional(),

  // Application Details
  whyJoin: z.string().max(2000).optional().nullable(),
  uniqueValue: z.string().max(2000).optional().nullable(),
  sampleTopics: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    format: z.string().optional(),
  })).optional(),
  references: z.array(z.object({
    name: z.string(),
    title: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional(),
  })).optional(),

  // Legal
  agreedToTerms: z.boolean().optional(),
  backgroundCheckConsent: z.boolean().optional(),

  // Action
  submitNow: z.boolean().optional(),
})

/**
 * GET /api/expert-applications/[id]
 * Get a single application
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

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

    // Fetch application
    const { data: application, error } = await supabase
      .from('expert_applications')
      .select(`
        *,
        reviewer:users!expert_applications_reviewer_id_fkey(id, full_name, email)
      `)
      .eq('id', id)
      .single()

    if (error || !application) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Application not found' },
        },
        { status: 404 }
      )
    }

    // Check authorization
    const isOwner = (user && (application.user_id === user.id || application.email === user.email))

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Not authorized to view this application' },
        },
        { status: 403 }
      )
    }

    // Get application history for admins
    let history = null
    if (isAdmin) {
      const { data: historyData } = await supabase
        .from('expert_application_history')
        .select('*')
        .eq('application_id', id)
        .order('created_at', { ascending: false })

      history = historyData
    }

    return NextResponse.json({
      success: true,
      data: {
        ...application,
        history: history,
      },
    })
  } catch (error) {
    console.error('Get application error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch application',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/expert-applications/[id]
 * Update an application (only drafts can be updated by applicants)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    const validation = updateApplicationSchema.safeParse(body)
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

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

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

    // Fetch existing application
    const { data: application, error: fetchError } = await supabase
      .from('expert_applications')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !application) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Application not found' },
        },
        { status: 404 }
      )
    }

    // Check authorization
    const isOwner = (user && (application.user_id === user.id || application.email === user.email))

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Not authorized to update this application' },
        },
        { status: 403 }
      )
    }

    // Applicants can only update draft applications
    if (!isAdmin && application.status !== 'draft') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_STATUS', message: 'Only draft applications can be edited' },
        },
        { status: 400 }
      )
    }

    // Build update object
    const updates: Record<string, unknown> = {}

    // Map fields from camelCase to snake_case
    if (data.fullName !== undefined) updates.full_name = data.fullName
    if (data.email !== undefined) updates.email = data.email
    if (data.phone !== undefined) updates.phone = data.phone
    if (data.location !== undefined) updates.location = data.location
    if (data.timezone !== undefined) updates.timezone = data.timezone
    if (data.professionalTitle !== undefined) updates.professional_title = data.professionalTitle
    if (data.headline !== undefined) updates.headline = data.headline
    if (data.bio !== undefined) updates.bio = data.bio
    if (data.profileImageUrl !== undefined) updates.profile_image_url = data.profileImageUrl
    if (data.videoIntroUrl !== undefined) updates.video_intro_url = data.videoIntroUrl
    if (data.yearsExperience !== undefined) updates.years_experience = data.yearsExperience
    if (data.expertiseAreas !== undefined) updates.expertise_areas = data.expertiseAreas
    if (data.aiPillars !== undefined) updates.ai_pillars = data.aiPillars
    if (data.industries !== undefined) updates.industries = data.industries
    if (data.education !== undefined) updates.education = data.education
    if (data.certifications !== undefined) updates.certifications = data.certifications
    if (data.workHistory !== undefined) updates.work_history = data.workHistory
    if (data.linkedinUrl !== undefined) updates.linkedin_url = data.linkedinUrl
    if (data.twitterUrl !== undefined) updates.twitter_url = data.twitterUrl
    if (data.websiteUrl !== undefined) updates.website_url = data.websiteUrl
    if (data.githubUrl !== undefined) updates.github_url = data.githubUrl
    if (data.portfolioUrls !== undefined) updates.portfolio_urls = data.portfolioUrls
    if (data.desiredHourlyRate !== undefined) updates.desired_hourly_rate = data.desiredHourlyRate
    if (data.availability !== undefined) updates.availability = data.availability
    if (data.servicesOffered !== undefined) updates.services_offered = data.servicesOffered
    if (data.whyJoin !== undefined) updates.why_join = data.whyJoin
    if (data.uniqueValue !== undefined) updates.unique_value = data.uniqueValue
    if (data.sampleTopics !== undefined) updates.sample_topics = data.sampleTopics
    if (data.references !== undefined) updates.references = data.references
    if (data.agreedToTerms !== undefined) {
      updates.agreed_to_terms = data.agreedToTerms
      if (data.agreedToTerms && !application.agreed_to_terms_at) {
        updates.agreed_to_terms_at = new Date().toISOString()
      }
    }
    if (data.backgroundCheckConsent !== undefined) updates.background_check_consent = data.backgroundCheckConsent

    // Handle submission
    if (data.submitNow && application.status === 'draft') {
      // Validate required fields for submission
      const currentBio = data.bio ?? application.bio
      const currentTitle = data.professionalTitle ?? application.professional_title
      const termsAgreed = data.agreedToTerms ?? application.agreed_to_terms

      if (!termsAgreed) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'TERMS_REQUIRED', message: 'You must agree to the terms to submit' },
          },
          { status: 400 }
        )
      }

      if (!currentBio || currentBio.length < 100) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'BIO_REQUIRED', message: 'Bio must be at least 100 characters' },
          },
          { status: 400 }
        )
      }

      if (!currentTitle || currentTitle.length < 5) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'TITLE_REQUIRED', message: 'Professional title is required' },
          },
          { status: 400 }
        )
      }

      updates.status = 'submitted'
      updates.submitted_at = new Date().toISOString()
    }

    // Perform update
    const { data: updated, error: updateError } = await supabase
      .from('expert_applications')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      data: updated,
      message: data.submitNow
        ? 'Your application has been submitted successfully!'
        : 'Application saved',
    })
  } catch (error) {
    console.error('Update application error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update application',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/expert-applications/[id]
 * Withdraw an application
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        },
        { status: 401 }
      )
    }

    // Check if admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role && ['admin', 'super_admin_full'].includes(profile.role)

    // Fetch application
    const { data: application, error: fetchError } = await supabase
      .from('expert_applications')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !application) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Application not found' },
        },
        { status: 404 }
      )
    }

    // Check authorization
    const isOwner = (application.user_id === user.id || application.email === user.email)

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Not authorized' },
        },
        { status: 403 }
      )
    }

    // Applicants can only withdraw pending applications
    if (!isAdmin && !['draft', 'submitted', 'under_review'].includes(application.status)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_STATUS', message: 'This application cannot be withdrawn' },
        },
        { status: 400 }
      )
    }

    // Admins can hard delete, applicants can only withdraw (soft delete)
    if (isAdmin) {
      const { error } = await supabase
        .from('expert_applications')
        .delete()
        .eq('id', id)

      if (error) throw error

      return NextResponse.json({
        success: true,
        message: 'Application deleted',
      })
    } else {
      const { error } = await supabase
        .from('expert_applications')
        .update({ status: 'withdrawn' })
        .eq('id', id)

      if (error) throw error

      return NextResponse.json({
        success: true,
        message: 'Application withdrawn',
      })
    }
  } catch (error) {
    console.error('Delete application error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to process request',
        },
      },
      { status: 500 }
    )
  }
}
