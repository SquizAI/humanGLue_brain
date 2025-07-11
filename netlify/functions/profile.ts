import { Handler } from '@netlify/functions'
import { UserProfile } from '../../lib/userProfile'

// In production, this would use a database
const profiles = new Map<string, UserProfile>()

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': process.env.CORS_ALLOWED_ORIGINS || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  }

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  // Handle POST - save profile
  if (event.httpMethod === 'POST') {
    try {
      if (!event.body) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Request body is required' })
        }
      }

      const profile: UserProfile = JSON.parse(event.body)
      
      if (!profile.email) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Email is required' })
        }
      }
      
      // Generate ID if not provided
      if (!profile.id) {
        profile.id = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
      
      // Store profile
      profiles.set(profile.email, profile)
      
      // In production, integrate with:
      // 1. Database (Supabase, MongoDB, etc.)
      // 2. CRM (HubSpot, Salesforce, etc.)
      // 3. Email automation (SendGrid, Mailchimp, etc.)
      // 4. Analytics (Segment, Mixpanel, etc.)
      
      // Send to CRM webhook (example)
      if (process.env.CRM_WEBHOOK_URL) {
        try {
          await fetch(process.env.CRM_WEBHOOK_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.CRM_API_KEY}`
            },
            body: JSON.stringify({
              email: profile.email,
              firstName: profile.name,
              company: profile.company,
              jobTitle: profile.role,
              phone: profile.phone,
              leadScore: profile.leadScore,
              customProperties: {
                aiReadinessScore: profile.aiReadinessScore,
                challenge: profile.challenge,
                budget: profile.budget,
                timeframe: profile.timeframe,
                companySize: profile.companySize,
                estimatedDealSize: profile.estimatedDealSize
              }
            })
          })
        } catch (error) {
          console.error('CRM webhook error:', error)
        }
      }
      
      // Log for monitoring
      console.log('Profile stored:', {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        company: profile.company,
        leadScore: profile.leadScore
      })
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          profileId: profile.id,
          message: 'Profile saved successfully'
        })
      }
    } catch (error) {
      console.error('Profile storage error:', error)
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: error instanceof Error ? error.message : 'Failed to save profile' 
        })
      }
    }
  }

  // Handle GET - retrieve profile
  if (event.httpMethod === 'GET') {
    try {
      const email = event.queryStringParameters?.email
      
      if (!email) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Email parameter is required' })
        }
      }
      
      const profile = profiles.get(email)
      
      if (!profile) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Profile not found' })
        }
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(profile)
      }
    } catch (error) {
      console.error('Profile retrieval error:', error)
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: error instanceof Error ? error.message : 'Failed to retrieve profile' 
        })
      }
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  }
} 