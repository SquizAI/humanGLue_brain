import { Handler } from '@netlify/functions'

/**
 * Recent Activity API
 *
 * Returns mock recent activity data for social proof
 * Shows companies that recently completed assessments
 *
 * TODO: Replace with real data from Supabase assessment_responses table
 */

interface ActivityEntry {
  id: string
  company: string
  timeAgo: string
  timestamp: number
}

// Mock company names for realistic social proof
const MOCK_COMPANIES = [
  'TechCorp',
  'Global Solutions Inc',
  'Innovation Labs',
  'Digital Ventures',
  'Cloud Systems',
  'Data Dynamics',
  'Smart Industries',
  'Future Tech',
  'Apex Solutions',
  'Quantum Corp',
  'Nexus Group',
  'Stellar Enterprises',
  'Velocity Systems',
  'Catalyst Inc',
  'Paradigm Solutions',
  'Zenith Technologies',
  'Momentum Labs',
  'Horizon Group',
  'Summit Ventures',
  'Prime Innovations',
]

export const handler: Handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  }

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    // Generate random recent activities
    const activities = generateMockActivities(8)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        activities,
        meta: {
          count: activities.length,
          timestamp: new Date().toISOString(),
        },
      }),
    }
  } catch (error) {
    console.error('[RecentActivity] Error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to fetch recent activities',
      }),
    }
  }
}

/**
 * Generate mock activity entries
 */
function generateMockActivities(count: number): ActivityEntry[] {
  const now = Date.now()
  const activities: ActivityEntry[] = []

  // Shuffle companies for variety
  const shuffledCompanies = [...MOCK_COMPANIES].sort(() => Math.random() - 0.5)

  for (let i = 0; i < count; i++) {
    const company = shuffledCompanies[i % shuffledCompanies.length]

    // Generate realistic timestamps (within last 24 hours)
    const minutesAgo = Math.floor(Math.random() * 1440) // Random time in last 24 hours
    const timestamp = now - minutesAgo * 60 * 1000

    activities.push({
      id: `activity_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
      company,
      timeAgo: formatTimeAgo(minutesAgo),
      timestamp,
    })
  }

  // Sort by timestamp (most recent first)
  return activities.sort((a, b) => b.timestamp - a.timestamp)
}

/**
 * Format minutes ago into human-readable time
 */
function formatTimeAgo(minutesAgo: number): string {
  if (minutesAgo < 1) return 'just now'
  if (minutesAgo === 1) return '1 minute ago'
  if (minutesAgo < 60) return `${minutesAgo} minutes ago`

  const hoursAgo = Math.floor(minutesAgo / 60)
  if (hoursAgo === 1) return '1 hour ago'
  if (hoursAgo < 24) return `${hoursAgo} hours ago`

  const daysAgo = Math.floor(hoursAgo / 24)
  if (daysAgo === 1) return '1 day ago'
  return `${daysAgo} days ago`
}

/**
 * Real implementation with Supabase (for future use)
 *
 * Uncomment and configure when ready to use real data
 */

/*
import { createClient } from '@supabase/supabase-js'

async function fetchRealActivities(limit: number = 10): Promise<ActivityEntry[]> {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('assessment_responses')
    .select('id, company, created_at')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[RecentActivity] Supabase error:', error)
    throw error
  }

  if (!data || data.length === 0) {
    return []
  }

  return data.map(item => {
    const timestamp = new Date(item.created_at).getTime()
    const minutesAgo = Math.floor((Date.now() - timestamp) / (1000 * 60))

    return {
      id: item.id,
      company: item.company || 'A company',
      timeAgo: formatTimeAgo(minutesAgo),
      timestamp,
    }
  })
}
*/
