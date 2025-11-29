/**
 * API Route: Organization Custom Domain Management
 *
 * GET  - Retrieve organization's custom domain
 * POST - Update organization's custom domain
 *
 * Authorization: Requires org_admin or admin role
 */

import { NextRequest, NextResponse } from 'next/server'
import { updateCustomDomain } from '@/services/branding'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: orgId } = params
    const supabase = await createClient()

    // Get organization's custom domain
    const { data, error } = await supabase
      .from('organizations')
      .select('custom_domain')
      .eq('id', orgId)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      domain: data.custom_domain
    })
  } catch (error) {
    console.error('[domain API] GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: orgId } = params
    const body = await request.json()
    const { domain } = body

    // Validate and update custom domain
    await updateCustomDomain(orgId, domain)

    return NextResponse.json({
      success: true,
      domain: domain || null
    })
  } catch (error) {
    console.error('[domain API] POST error:', error)

    if (error instanceof Error) {
      // Handle specific error cases
      if (error.message.includes('already in use')) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        )
      }
      if (error.message.includes('Invalid domain')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
      if (error.message.includes('permission')) {
        return NextResponse.json(
          { error: 'Permission denied' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to update custom domain' },
      { status: 500 }
    )
  }
}
