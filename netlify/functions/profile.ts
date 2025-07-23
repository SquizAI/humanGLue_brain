import { Handler } from '@netlify/functions'
import { UserProfile, ProfileAnalysis } from '../../lib/userProfile'

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
        // Import the email sending logic
        const { handler: sendEmailHandler } = await import('./send-profile-email')
        
        const emailEvent = {
          httpMethod: 'POST',
          body: JSON.stringify({
            profile,
            analysis,
            type: 'assessment'
          }),
          headers: {},
          multiValueHeaders: {},
          isBase64Encoded: false,
          path: '',
          pathParameters: null,
          queryStringParameters: null,
          multiValueQueryStringParameters: null,
          stageVariables: null,
          requestContext: {} as any,
          resource: '',
          rawUrl: '',
          rawQuery: ''
        }
        
        const emailResult = await sendEmailHandler(emailEvent, context, () => {})
        
        if (emailResult && emailResult.statusCode === 200) {
          console.log('Assessment email sent successfully to:', profile.email)
        } else {
          console.error('Failed to send assessment email:', emailResult)
        }
      } catch (error) {
        console.error('Error sending assessment email:', error)
      }
      
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