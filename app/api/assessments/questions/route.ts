/**
 * Question Bank API
 * GET /api/assessments/questions - Get questions for an assessment
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, handleUnknownError, APIErrors } from '@/lib/api/errors'
import { requireAuth } from '@/lib/api/auth'

/**
 * GET /api/assessments/questions
 * Get questions based on industry and assessment type
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const { searchParams } = new URL(request.url)

    const industry = searchParams.get('industry')
    const flowName = searchParams.get('flow')
    const dimension = searchParams.get('dimension')

    const supabase = await createClient()

    // If a specific flow is requested, get questions from that flow
    if (flowName) {
      const { data: flow, error: flowError } = await supabase
        .from('question_flows')
        .select('*')
        .eq('flow_name', flowName)
        .eq('is_active', true)
        .single()

      if (flowError || !flow) {
        return NextResponse.json(
          errorResponse(APIErrors.NOT_FOUND('Question flow')),
          { status: 404 }
        )
      }

      // Get questions in flow order
      const questionCodes = flow.question_codes as string[]
      const { data: questions, error: questionsError } = await supabase
        .from('question_bank')
        .select('*')
        .in('question_code', questionCodes)
        .eq('is_active', true)

      if (questionsError) throw questionsError

      // Sort by flow order
      const sortedQuestions = questionCodes
        .map(code => questions?.find(q => q.question_code === code))
        .filter(Boolean)

      return NextResponse.json(successResponse({
        flow: {
          id: flow.id,
          name: flow.flow_name,
          description: flow.flow_description,
          type: flow.flow_type,
        },
        questions: sortedQuestions,
        totalQuestions: sortedQuestions.length,
      }))
    }

    // Otherwise, get questions by filters
    let query = supabase
      .from('question_bank')
      .select('*')
      .eq('is_active', true)

    if (dimension) {
      query = query.eq('dimension', dimension)
    }

    if (industry) {
      // Get questions that match the industry or have no industry restriction
      query = query.or(`industries.cs.{${industry}},industries.eq.{}`)
    }

    const { data: questions, error } = await query
      .order('dimension')
      .order('display_order')

    if (error) throw error

    return NextResponse.json(successResponse({
      questions,
      totalQuestions: questions?.length || 0,
    }))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
