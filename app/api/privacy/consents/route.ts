/**
 * GET  /api/privacy/consents - Get user's consents
 * POST /api/privacy/consents - Update user consent
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserConsents, updateConsent, getConsentTypes } from '@/lib/services/data-privacy'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const includeTypes = searchParams.get('includeTypes') === 'true'

    if (includeTypes) {
      // Get both consent types and user's current consents
      const [types, consents] = await Promise.all([
        getConsentTypes(),
        getUserConsents(user.id)
      ])

      return NextResponse.json({
        types,
        consents,
      })
    }

    // Get only user's consents
    const consents = await getUserConsents(user.id)

    return NextResponse.json({ consents })
  } catch (error) {
    console.error('[Privacy API] GET /consents error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch consents' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { consent_type_id, granted } = body

    if (!consent_type_id || typeof granted !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields: consent_type_id, granted' },
        { status: 400 }
      )
    }

    // Get IP and user agent for audit trail
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    const userAgent = request.headers.get('user-agent') || undefined

    const consent = await updateConsent(
      user.id,
      consent_type_id,
      granted,
      {
        ip_address: ip,
        user_agent: userAgent,
      }
    )

    return NextResponse.json({
      success: true,
      consent,
    })
  } catch (error) {
    console.error('[Privacy API] POST /consents error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update consent' },
      { status: 500 }
    )
  }
}
