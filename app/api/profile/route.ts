import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with service role for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase credentials not configured')
    return null
  }
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function POST(request: NextRequest) {
  try {
    const profile = await request.json()

    if (!profile.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Generate assessment ID if not provided
    const assessmentId = profile.assessmentId || `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Prepare lead data for Supabase
    const leadData = {
      assessment_id: assessmentId,
      name: profile.name || 'Unknown',
      email: profile.email,
      phone: profile.phone || null,
      linkedin: profile.linkedIn || null,
      company: profile.company || null,
      company_url: profile.companyUrl || null,
      company_size: profile.companySize || null,
      revenue: profile.revenue || null,
      location: profile.location || profile.enrichedLocation || null,
      industry: profile.industry || profile.enrichedIndustry || null,
      role: profile.role || null,
      department: profile.department || null,
      years_in_role: profile.yearsInRole || null,
      primary_challenge: profile.challenge || null,
      additional_challenges: profile.additionalChallenges || null,
      current_tools: profile.currentTools || null,
      budget: profile.budget || null,
      timeframe: profile.timeframe || null,
      enriched_data: {
        enrichedLocation: profile.enrichedLocation,
        enrichedIndustry: profile.enrichedIndustry,
        enrichedEmployeeCount: profile.enrichedEmployeeCount,
        websiteAnalysis: profile.websiteAnalysis
      },
      lead_score: profile.leadScore || 50,
      lead_stage: profile.leadScore > 80 ? 'hot' : profile.leadScore > 60 ? 'warm' : 'cold',
      ai_readiness_score: profile.aiReadinessScore || null,
      analysis: profile.analysis || {},
      estimated_deal_size: profile.estimatedDealSize || null,
      probability_to_close: profile.probabilityToClose || null,
      source: 'chat_assessment',
      total_interactions: profile.totalInteractions || 0
    }

    // Try to save to Supabase
    const supabase = getSupabase()
    let savedToDb = false

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('assessment_leads')
          .upsert(leadData, { onConflict: 'assessment_id' })
          .select()
          .single()

        if (error) {
          console.error('Supabase error:', error)
          // Continue even if DB fails - we'll still try to send email
        } else {
          savedToDb = true
          console.log('Lead saved to Supabase:', data?.id)
        }
      } catch (dbError) {
        console.error('Database error:', dbError)
      }
    } else {
      console.warn('Supabase not configured - lead not persisted to database')
    }

    // Send assessment email notification
    let emailSent = false
    if (profile.email) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hmnglue.com'
        const resultsUrl = `${baseUrl}/results/${assessmentId}`

        const emailEndpoint = process.env.NODE_ENV === 'development'
          ? 'http://localhost:8888/.netlify/functions/send-assessment-email'
          : `${baseUrl}/.netlify/functions/send-assessment-email`

        const emailResponse = await fetch(emailEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: profile.email,
            name: profile.name || 'there',
            company: profile.company || 'your organization',
            assessmentId,
            score: profile.leadScore || 50,
            resultsUrl
          })
        })

        if (emailResponse.ok) {
          emailSent = true
          console.log('Assessment email sent to:', profile.email)

          // Update email_sent status in DB
          if (supabase && savedToDb) {
            await supabase
              .from('assessment_leads')
              .update({ email_sent: true, email_sent_at: new Date().toISOString() })
              .eq('assessment_id', assessmentId)
          }
        } else {
          console.error('Failed to send email:', await emailResponse.text())
        }
      } catch (emailError) {
        console.error('Error sending assessment email:', emailError)
      }
    }

    // Log for monitoring
    console.log('Profile processed:', {
      assessmentId,
      name: profile.name,
      email: profile.email,
      company: profile.company,
      leadScore: profile.leadScore,
      savedToDb,
      emailSent
    })

    return NextResponse.json({
      success: true,
      assessmentId,
      savedToDb,
      emailSent,
      message: savedToDb ? 'Profile saved successfully' : 'Profile processed (database not configured)'
    })
  } catch (error) {
    console.error('Profile storage error:', error)
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const assessmentId = searchParams.get('assessmentId')

    if (!email && !assessmentId) {
      return NextResponse.json(
        { error: 'Email or assessmentId parameter is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    let query = supabase.from('assessment_leads').select('*')

    if (assessmentId) {
      query = query.eq('assessment_id', assessmentId)
    } else if (email) {
      query = query.eq('email', email).order('created_at', { ascending: false }).limit(1)
    }

    const { data, error } = await query.single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Profile retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve profile' },
      { status: 500 }
    )
  }
}
