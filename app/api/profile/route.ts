import { NextRequest, NextResponse } from 'next/server'
import { UserProfile, ProfileAnalysis } from '../../../lib/userProfile'

// In production, this would use a database
const profiles = new Map<string, UserProfile>()

export async function POST(request: NextRequest) {
  try {
    const profile: UserProfile = await request.json()
    
    if (!profile.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    
    // Generate ID if not provided
    if (!profile.id) {
      profile.id = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    
    // Store profile
    profiles.set(profile.email, profile)
    
    // Generate analysis for the profile
    const analysis: ProfileAnalysis = {
      profile: profile,
      scoring: {
        fitScore: profile.leadScore || 75,
        engagementScore: 85,
        urgencyScore: profile.timeframe === 'Immediate' ? 90 : 
                      profile.timeframe === '1-3 months' ? 70 : 50,
        budgetScore: 80,
        authorityScore: profile.role?.toLowerCase().includes('director') || 
                       profile.role?.toLowerCase().includes('vp') ||
                       profile.role?.toLowerCase().includes('chief') ? 90 : 70
      },
      insights: {
        summary: `${profile.name} from ${profile.company} is looking for AI transformation solutions to address ${profile.challenge || 'operational challenges'}.`,
        keyFindings: [
          `${profile.company} is experiencing ${profile.challenge || 'operational challenges'}`,
          `Current team size of ${profile.companySize || 'multiple employees'} indicates ${
            profile.companySize === 'Enterprise (1000+)' ? 'enterprise-scale' : 
            profile.companySize === 'Mid-Market (100-999)' ? 'mid-market' : 'growing'
          } transformation needs`,
          `${profile.role || 'Leadership'} involvement shows executive buy-in`,
          `Budget range suggests serious commitment to AI transformation`
        ],
        recommendations: [
          'Present enterprise-scale AI transformation framework',
          'Demonstrate ROI through industry-specific case studies',
          'Offer phased implementation approach to minimize disruption'
        ],
        nextBestActions: [
          'Schedule a 30-minute AI readiness assessment call',
          'Review our 5-dimension framework tailored to your industry',
          'Explore quick wins for immediate ROI demonstration',
          'Connect with similar organizations who achieved 3.2x ROI'
        ],
        personalizedContent: [
          `Case study: How a ${profile.companySize || 'similar-sized'} company achieved 40% faster AI adoption`,
          'Executive guide: Building AI-ready teams without disrupting operations',
          'ROI calculator: Projected savings from AI-powered workflow optimization'
        ]
      },
      predictions: {
        timeToClose: 21,
        dealSize: profile.estimatedDealSize || 150000,
        successProbability: 0.78,
        churnRisk: 0.22
      }
    }
    
    // Send assessment email
    try {
      const emailEndpoint = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5040/api/send-profile-email'
        : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://humanglue.netlify.app'}/.netlify/functions/send-profile-email`
      
      const emailResponse = await fetch(emailEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile,
          analysis,
          type: 'assessment'
        })
      })
      
      if (!emailResponse.ok) {
        console.error('Failed to send assessment email:', await emailResponse.text())
      } else {
        console.log('Assessment email sent successfully to:', profile.email)
      }
    } catch (error) {
      console.error('Error sending assessment email:', error)
    }
    
    // Log for monitoring
    console.log('Profile stored:', {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      company: profile.company,
      leadScore: profile.leadScore
    })
    
    return NextResponse.json({
      success: true,
      profileId: profile.id,
      message: 'Profile saved successfully'
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
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }
    
    const profile = profiles.get(email)
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Profile retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve profile' },
      { status: 500 }
    )
  }
} 