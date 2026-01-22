import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

/**
 * OAuth Callback Handler for Discord Bot Calendar Integration
 *
 * This function handles OAuth callbacks from Google/Microsoft, exchanges
 * the authorization code for tokens, and stores them in Supabase.
 *
 * Routes:
 * - GET /auth/google/callback - Google Calendar OAuth callback
 * - GET /auth/microsoft/callback - Microsoft Calendar OAuth callback
 */

// Environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Initialize Supabase client
const getSupabaseClient = () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('Supabase configuration missing')
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
}

interface OAuthState {
  userId: string
  guildId: string
  provider: 'google' | 'microsoft'
}

interface GoogleTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  scope: string
}

interface GoogleUserInfo {
  id: string
  email: string
  name?: string
  picture?: string
}

// HTML response helper
const htmlResponse = (statusCode: number, title: string, body: string, isSuccess: boolean) => ({
  statusCode,
  headers: { 'Content-Type': 'text/html' },
  body: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - HumanGlue</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .card {
      background: white;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
      max-width: 400px;
    }
    h1 { color: ${isSuccess ? '#10b981' : '#ef4444'}; margin-bottom: 20px; }
    p { color: #666; line-height: 1.6; }
    .logo { font-size: 48px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">${isSuccess ? '✅' : '❌'}</div>
    <h1>${title}</h1>
    ${body}
  </div>
</body>
</html>`
})

export const handler: Handler = async (event) => {
  const path = event.path
  const query = event.queryStringParameters || {}

  // Handle Google OAuth callback
  if (path.includes('/auth/google/callback')) {
    return handleGoogleCallback(query)
  }

  // Handle Microsoft OAuth callback
  if (path.includes('/auth/microsoft/callback')) {
    return handleMicrosoftCallback(query)
  }

  // Unknown callback path
  return htmlResponse(404, 'Not Found', '<p>The requested OAuth callback path was not found.</p>', false)
}

async function handleGoogleCallback(query: Record<string, string | undefined>): Promise<ReturnType<Handler>> {
  const code = query.code
  const stateStr = query.state
  const error = query.error

  // Handle OAuth errors
  if (error) {
    console.error('Google OAuth error:', error)
    return htmlResponse(400, 'Authorization Failed',
      `<p>Google authorization failed: ${error}</p><p>You can close this window and try again.</p>`,
      false
    )
  }

  // Validate required parameters
  if (!code || !stateStr) {
    return htmlResponse(400, 'Invalid Request',
      '<p>Missing authorization code or state.</p><p>Please try again from Discord.</p>',
      false
    )
  }

  // Check configuration
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.error('Google OAuth not configured')
    return htmlResponse(500, 'Configuration Error',
      '<p>Google Calendar integration is not configured.</p><p>Please contact support.</p>',
      false
    )
  }

  try {
    // Parse state
    const state: OAuthState = JSON.parse(stateStr)

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.URL || 'https://behmn.com'}/auth/google/callback`,
        grant_type: 'authorization_code'
      })
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Token exchange failed:', errorData)
      return htmlResponse(500, 'Token Exchange Failed',
        '<p>Failed to exchange authorization code for tokens.</p><p>Please try again.</p>',
        false
      )
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json()

    // Get user info
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    })

    let userEmail = 'unknown'
    if (userInfoResponse.ok) {
      const userInfo: GoogleUserInfo = await userInfoResponse.json()
      userEmail = userInfo.email
    }

    // Store tokens in Supabase
    const supabase = getSupabaseClient()

    // Calculate expiration timestamp
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

    // Upsert the calendar connection
    const { error: upsertError } = await supabase
      .from('discord_calendar_connections')
      .upsert({
        discord_user_id: state.userId,
        discord_guild_id: state.guildId,
        provider: 'google',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt,
        email: userEmail,
        calendar_id: 'primary',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'discord_user_id,discord_guild_id,provider'
      })

    if (upsertError) {
      console.error('Supabase upsert error:', upsertError)
      return htmlResponse(500, 'Storage Error',
        '<p>Failed to save your calendar connection.</p><p>Please try again or contact support.</p>',
        false
      )
    }

    console.log(`Google Calendar connected for user ${state.userId} (${userEmail})`)

    return htmlResponse(200, 'Google Calendar Connected!',
      `<p>Your Google Calendar (<strong>${userEmail}</strong>) has been connected successfully.</p>
       <p>You can now use calendar commands in Discord.</p>
       <p><strong>You can close this window.</strong></p>`,
      true
    )

  } catch (err) {
    console.error('Google callback error:', err)
    return htmlResponse(500, 'Error',
      '<p>An unexpected error occurred while connecting your calendar.</p><p>Please try again.</p>',
      false
    )
  }
}

async function handleMicrosoftCallback(query: Record<string, string | undefined>): Promise<ReturnType<Handler>> {
  const code = query.code
  const stateStr = query.state
  const error = query.error

  // Handle OAuth errors
  if (error) {
    console.error('Microsoft OAuth error:', error)
    return htmlResponse(400, 'Authorization Failed',
      `<p>Microsoft authorization failed: ${error}</p><p>You can close this window and try again.</p>`,
      false
    )
  }

  // Validate required parameters
  if (!code || !stateStr) {
    return htmlResponse(400, 'Invalid Request',
      '<p>Missing authorization code or state.</p><p>Please try again from Discord.</p>',
      false
    )
  }

  const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID
  const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET

  // Check configuration
  if (!MICROSOFT_CLIENT_ID || !MICROSOFT_CLIENT_SECRET) {
    console.error('Microsoft OAuth not configured')
    return htmlResponse(500, 'Configuration Error',
      '<p>Microsoft Calendar integration is not configured.</p><p>Please contact support.</p>',
      false
    )
  }

  try {
    // Parse state
    const state: OAuthState = JSON.parse(stateStr)

    // Exchange code for tokens
    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: MICROSOFT_CLIENT_ID,
        client_secret: MICROSOFT_CLIENT_SECRET,
        redirect_uri: `${process.env.URL || 'https://behmn.com'}/auth/microsoft/callback`,
        grant_type: 'authorization_code'
      })
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Microsoft token exchange failed:', errorData)
      return htmlResponse(500, 'Token Exchange Failed',
        '<p>Failed to exchange authorization code for tokens.</p><p>Please try again.</p>',
        false
      )
    }

    const tokens = await tokenResponse.json()

    // Get user info
    const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    })

    let userEmail = 'unknown'
    if (userInfoResponse.ok) {
      const userInfo = await userInfoResponse.json()
      userEmail = userInfo.mail || userInfo.userPrincipalName || 'unknown'
    }

    // Store tokens in Supabase
    const supabase = getSupabaseClient()

    // Calculate expiration timestamp
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

    // Upsert the calendar connection
    const { error: upsertError } = await supabase
      .from('discord_calendar_connections')
      .upsert({
        discord_user_id: state.userId,
        discord_guild_id: state.guildId,
        provider: 'microsoft',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt,
        email: userEmail,
        calendar_id: 'primary',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'discord_user_id,discord_guild_id,provider'
      })

    if (upsertError) {
      console.error('Supabase upsert error:', upsertError)
      return htmlResponse(500, 'Storage Error',
        '<p>Failed to save your calendar connection.</p><p>Please try again or contact support.</p>',
        false
      )
    }

    console.log(`Microsoft Calendar connected for user ${state.userId} (${userEmail})`)

    return htmlResponse(200, 'Microsoft Calendar Connected!',
      `<p>Your Microsoft Calendar (<strong>${userEmail}</strong>) has been connected successfully.</p>
       <p>You can now use calendar commands in Discord.</p>
       <p><strong>You can close this window.</strong></p>`,
      true
    )

  } catch (err) {
    console.error('Microsoft callback error:', err)
    return htmlResponse(500, 'Error',
      '<p>An unexpected error occurred while connecting your calendar.</p><p>Please try again.</p>',
      false
    )
  }
}
