import { NextRequest, NextResponse } from 'next/server'
import { UserProfile } from '../../../lib/userProfile'

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
    
    // In production, you would:
    // 1. Store in database
    // 2. Send to CRM (HubSpot, Salesforce, etc.)
    // 3. Trigger email automation
    // 4. Update analytics
    
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