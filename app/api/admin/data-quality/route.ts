/**
 * GET /api/admin/data-quality - Get platform-wide data quality metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  calculatePlatformQuality,
  getOrganizationsWithIssues,
  runQualityChecks,
} from '@/lib/services/data-quality'

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

    // Check if user is admin
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'super_admin_full'])
      .single()

    if (!roles) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams
    const view = searchParams.get('view') || 'metrics' // metrics | issues | checks

    if (view === 'issues') {
      const issues = await getOrganizationsWithIssues()
      return NextResponse.json({ issues })
    }

    if (view === 'checks') {
      const checks = await runQualityChecks()
      return NextResponse.json(checks)
    }

    // Default: return full metrics
    const metrics = await calculatePlatformQuality()
    return NextResponse.json({ metrics })
  } catch (error) {
    console.error('[Data Quality API] GET error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get data quality metrics' },
      { status: 500 }
    )
  }
}
