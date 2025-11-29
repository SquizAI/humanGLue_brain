/**
 * API Route: Get Organization ID from Custom Domain
 *
 * Checks if the current domain is a custom domain for an organization
 * Returns the organization ID if found, null otherwise
 *
 * Used by BrandingInjector to auto-load branding on custom domains
 */

import { NextRequest, NextResponse } from 'next/server'
import { getOrgByDomain } from '@/services/branding'

export async function GET(request: NextRequest) {
  try {
    const host = request.headers.get('host') || ''

    // Get organization ID from domain
    const orgId = await getOrgByDomain(host)

    return NextResponse.json({
      organizationId: orgId,
      domain: host
    })
  } catch (error) {
    console.error('[domain-org API] Error:', error)
    return NextResponse.json({
      organizationId: null,
      error: 'Failed to detect organization from domain'
    }, { status: 500 })
  }
}
