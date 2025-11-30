/**
 * GET /api/benchmarks/[industry] - Get benchmark data for an industry
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getIndustryBenchmark } from '@/lib/services/industry-benchmarks'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ industry: string }> }
) {
  try {
    const { industry } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get sector from query params if provided
    const searchParams = request.nextUrl.searchParams
    const sector = searchParams.get('sector') || undefined

    const benchmark = await getIndustryBenchmark(
      decodeURIComponent(industry),
      sector
    )

    if (!benchmark) {
      return NextResponse.json(
        { error: 'No benchmark data available for this industry' },
        { status: 404 }
      )
    }

    return NextResponse.json({ benchmark })
  } catch (error) {
    console.error('[Benchmarks API] GET /[industry] error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch benchmark' },
      { status: 500 }
    )
  }
}
