/**
 * GET /api/benchmarks/industries - Get list of industries with benchmark data
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAvailableIndustries } from '@/lib/services/industry-benchmarks'

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

    const industries = await getAvailableIndustries()

    return NextResponse.json({ industries })
  } catch (error) {
    console.error('[Benchmarks API] GET /industries error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch industries' },
      { status: 500 }
    )
  }
}
