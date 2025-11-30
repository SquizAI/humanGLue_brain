/**
 * Question Flows API
 * GET /api/assessments/flows - List available question flows
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, handleUnknownError } from '@/lib/api/errors'
import { requireAuth } from '@/lib/api/auth'

/**
 * GET /api/assessments/flows
 * List available question flows, optionally filtered by industry
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const { searchParams } = new URL(request.url)

    const industry = searchParams.get('industry')
    const flowType = searchParams.get('type')

    const supabase = await createClient()

    let query = supabase
      .from('question_flows')
      .select(`
        id,
        flow_name,
        flow_description,
        flow_type,
        industries,
        question_selection_strategy,
        question_codes,
        created_at
      `)
      .eq('is_active', true)

    if (flowType) {
      query = query.eq('flow_type', flowType)
    }

    if (industry) {
      // Get flows that match the industry or are general (no industry restriction)
      query = query.or(`industries.cs.{${industry}},industries.eq.{}`)
    }

    const { data: flows, error } = await query.order('flow_name')

    if (error) throw error

    // Enrich with question counts
    const enrichedFlows = flows?.map(flow => ({
      ...flow,
      questionCount: (flow.question_codes as string[])?.length || 0,
    }))

    return NextResponse.json(successResponse({
      flows: enrichedFlows,
      totalFlows: enrichedFlows?.length || 0,
    }))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
