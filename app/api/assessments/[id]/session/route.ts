/**
 * Assessment Session API
 * GET /api/assessments/[id]/session - Get or create session for assessment
 * POST /api/assessments/[id]/session - Initialize session with flow
 * PATCH /api/assessments/[id]/session - Update session state
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, handleUnknownError, APIErrors } from '@/lib/api/errors'
import { requireAuth } from '@/lib/api/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/assessments/[id]/session
 * Get current session state for an assessment
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: assessmentId } = await params

    const supabase = await createClient()

    // Verify user owns this assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('id, user_id, status')
      .eq('id', assessmentId)
      .single()

    if (assessmentError || !assessment) {
      return NextResponse.json(
        errorResponse(APIErrors.NOT_FOUND('Assessment')),
        { status: 404 }
      )
    }

    if (assessment.user_id !== user.id) {
      return NextResponse.json(
        errorResponse(APIErrors.FORBIDDEN()),
        { status: 403 }
      )
    }

    // Get session
    const { data: session, error: sessionError } = await supabase
      .from('assessment_sessions')
      .select(`
        *,
        question_flows(
          id,
          flow_name,
          flow_description,
          flow_type
        )
      `)
      .eq('assessment_id', assessmentId)
      .single()

    if (sessionError && sessionError.code !== 'PGRST116') {
      throw sessionError
    }

    if (!session) {
      return NextResponse.json(successResponse({
        session: null,
        message: 'No session exists. POST to initialize.',
      }))
    }

    // Get current question if in progress
    let currentQuestion = null
    if (session.question_sequence && session.current_question_index < session.total_questions) {
      const currentCode = session.question_sequence[session.current_question_index]
      const { data: question } = await supabase
        .from('question_bank')
        .select('*')
        .eq('question_code', currentCode)
        .eq('is_active', true)
        .single()

      currentQuestion = question
    }

    return NextResponse.json(successResponse({
      session: {
        id: session.id,
        assessmentId: session.assessment_id,
        flowId: session.flow_id,
        flow: session.question_flows,
        currentQuestionIndex: session.current_question_index,
        totalQuestions: session.total_questions,
        questionsAnswered: session.questions_answered,
        questionsSkipped: session.questions_skipped,
        questionSequence: session.question_sequence,
        sessionState: session.session_state,
        startedAt: session.started_at,
        lastActivityAt: session.last_activity_at,
      },
      currentQuestion,
      progress: {
        percentage: session.total_questions > 0
          ? Math.round((session.questions_answered / session.total_questions) * 100)
          : 0,
        remaining: session.total_questions - session.questions_answered - session.questions_skipped,
      },
    }))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}

/**
 * POST /api/assessments/[id]/session
 * Initialize a new session for an assessment
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: assessmentId } = await params

    const body = await request.json()
    const { flowName, industry, companySize } = body

    const supabase = await createClient()

    // Verify user owns this assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('id, user_id, status')
      .eq('id', assessmentId)
      .single()

    if (assessmentError || !assessment) {
      return NextResponse.json(
        errorResponse(APIErrors.NOT_FOUND('Assessment')),
        { status: 404 }
      )
    }

    if (assessment.user_id !== user.id) {
      return NextResponse.json(
        errorResponse(APIErrors.FORBIDDEN()),
        { status: 403 }
      )
    }

    // Check if session already exists
    const { data: existingSession } = await supabase
      .from('assessment_sessions')
      .select('id')
      .eq('assessment_id', assessmentId)
      .single()

    if (existingSession) {
      return NextResponse.json(
        errorResponse({
          code: 'SESSION_EXISTS',
          message: 'Session already exists for this assessment. Use PATCH to update.',
          statusCode: 409,
        }),
        { status: 409 }
      )
    }

    // Select appropriate flow
    let flowQuery = supabase
      .from('question_flows')
      .select('*')
      .eq('is_active', true)

    if (flowName) {
      flowQuery = flowQuery.eq('flow_name', flowName)
    } else if (industry) {
      flowQuery = flowQuery.contains('industries', [industry])
    }

    const { data: flows } = await flowQuery.order('created_at', { ascending: false }).limit(1)

    // Fallback to standard flow if no match
    let selectedFlow = flows?.[0]
    if (!selectedFlow) {
      const { data: standardFlow } = await supabase
        .from('question_flows')
        .select('*')
        .eq('flow_name', 'full_assessment_standard')
        .single()

      selectedFlow = standardFlow
    }

    if (!selectedFlow) {
      return NextResponse.json(
        errorResponse(APIErrors.NOT_FOUND('Question flow')),
        { status: 404 }
      )
    }

    const questionSequence = selectedFlow.question_codes as string[]

    // Create session
    const { data: session, error: sessionError } = await supabase
      .from('assessment_sessions')
      .insert({
        assessment_id: assessmentId,
        flow_id: selectedFlow.id,
        total_questions: questionSequence.length,
        question_sequence: questionSequence,
        session_state: {
          industry,
          companySize,
          flowName: selectedFlow.flow_name,
        },
      })
      .select(`
        *,
        question_flows(
          id,
          flow_name,
          flow_description,
          flow_type
        )
      `)
      .single()

    if (sessionError) throw sessionError

    // Get first question
    const firstQuestionCode = questionSequence[0]
    const { data: firstQuestion } = await supabase
      .from('question_bank')
      .select('*')
      .eq('question_code', firstQuestionCode)
      .eq('is_active', true)
      .single()

    return NextResponse.json(successResponse({
      session: {
        id: session.id,
        assessmentId: session.assessment_id,
        flowId: session.flow_id,
        flow: session.question_flows,
        currentQuestionIndex: 0,
        totalQuestions: session.total_questions,
        questionsAnswered: 0,
        questionsSkipped: 0,
        questionSequence: session.question_sequence,
        sessionState: session.session_state,
      },
      currentQuestion: firstQuestion,
    }), { status: 201 })
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}

/**
 * PATCH /api/assessments/[id]/session
 * Update session (advance to next question, update state)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: assessmentId } = await params

    const body = await request.json()
    const { action, questionIndex, sessionState } = body

    const supabase = await createClient()

    // Verify user owns this assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('id, user_id')
      .eq('id', assessmentId)
      .single()

    if (assessmentError || !assessment) {
      return NextResponse.json(
        errorResponse(APIErrors.NOT_FOUND('Assessment')),
        { status: 404 }
      )
    }

    if (assessment.user_id !== user.id) {
      return NextResponse.json(
        errorResponse(APIErrors.FORBIDDEN()),
        { status: 403 }
      )
    }

    // Get current session
    const { data: session, error: sessionError } = await supabase
      .from('assessment_sessions')
      .select('*')
      .eq('assessment_id', assessmentId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        errorResponse(APIErrors.NOT_FOUND('Session')),
        { status: 404 }
      )
    }

    const updates: Record<string, unknown> = {
      last_activity_at: new Date().toISOString(),
    }

    if (action === 'next') {
      updates.current_question_index = Math.min(
        session.current_question_index + 1,
        session.total_questions
      )
    } else if (action === 'prev') {
      updates.current_question_index = Math.max(session.current_question_index - 1, 0)
    } else if (typeof questionIndex === 'number') {
      updates.current_question_index = Math.max(
        0,
        Math.min(questionIndex, session.total_questions - 1)
      )
    }

    if (sessionState) {
      updates.session_state = {
        ...session.session_state,
        ...sessionState,
      }
    }

    const { data: updatedSession, error: updateError } = await supabase
      .from('assessment_sessions')
      .update(updates)
      .eq('id', session.id)
      .select()
      .single()

    if (updateError) throw updateError

    // Get current question after update
    const currentIndex = updatedSession.current_question_index
    const questionSequence = updatedSession.question_sequence as string[]
    let currentQuestion = null

    if (currentIndex < questionSequence.length) {
      const { data: question } = await supabase
        .from('question_bank')
        .select('*')
        .eq('question_code', questionSequence[currentIndex])
        .eq('is_active', true)
        .single()

      currentQuestion = question
    }

    return NextResponse.json(successResponse({
      session: updatedSession,
      currentQuestion,
      progress: {
        percentage: updatedSession.total_questions > 0
          ? Math.round((updatedSession.questions_answered / updatedSession.total_questions) * 100)
          : 0,
        remaining: updatedSession.total_questions - updatedSession.questions_answered - updatedSession.questions_skipped,
      },
    }))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
