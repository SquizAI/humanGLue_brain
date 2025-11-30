/**
 * POST /api/assessments/[id]/questions/skip - Skip a question
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getNextQuestion } from '@/lib/services/question-engine'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user owns this assessment
    const { data: assessment } = await supabase
      .from('assessments')
      .select('id, user_id, organization_id, status')
      .eq('id', assessmentId)
      .single()

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      )
    }

    // Check if user owns assessment or is in the organization
    if (assessment.user_id !== user.id) {
      const { data: membership } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', assessment.organization_id)
        .eq('user_id', user.id)
        .single()

      if (!membership) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        )
      }
    }

    // Check if assessment is already completed
    if (assessment.status === 'completed') {
      return NextResponse.json(
        { error: 'Assessment is already complete' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { questionCode, reason } = body

    if (!questionCode) {
      return NextResponse.json(
        { error: 'questionCode is required' },
        { status: 400 }
      )
    }

    // Get question details
    const { data: question } = await supabase
      .from('question_bank')
      .select('id, version')
      .eq('question_code', questionCode)
      .eq('is_active', true)
      .single()

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // Get current question count
    const { count } = await supabase
      .from('assessment_responses')
      .select('*', { count: 'exact', head: true })
      .eq('assessment_id', assessmentId)

    // Record skipped question
    await supabase.from('assessment_responses').insert({
      assessment_id: assessmentId,
      question_id: questionCode,
      question_bank_id: question.id,
      question_version: question.version,
      question_number: (count || 0) + 1,
      skipped: true,
      skip_reason: reason || 'User skipped',
    })

    // Update session skipped count if exists
    // First get current values
    const { data: session } = await supabase
      .from('assessment_sessions')
      .select('questions_skipped, current_question_index')
      .eq('assessment_id', assessmentId)
      .single()

    if (session) {
      await supabase
        .from('assessment_sessions')
        .update({
          questions_skipped: (session.questions_skipped || 0) + 1,
          current_question_index: (session.current_question_index || 0) + 1,
          last_activity_at: new Date().toISOString(),
        })
        .eq('assessment_id', assessmentId)
    }

    // Get next question
    const nextQuestion = await getNextQuestion(assessmentId)

    return NextResponse.json({
      success: true,
      nextQuestion,
    })
  } catch (error) {
    console.error('[Assessment Questions API] POST skip error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to skip question' },
      { status: 500 }
    )
  }
}
