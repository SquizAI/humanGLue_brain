/**
 * POST /api/assessments/[id]/questions/answer - Submit answer for a question
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { submitAnswer } from '@/lib/services/question-engine'

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
    const { questionCode, answer } = body

    if (!questionCode || !answer) {
      return NextResponse.json(
        { error: 'questionCode and answer are required' },
        { status: 400 }
      )
    }

    // Submit answer using question engine
    const result = await submitAnswer(assessmentId, questionCode, answer)

    return NextResponse.json({
      success: result.success,
      nextQuestion: result.nextQuestion,
    })
  } catch (error) {
    console.error('[Assessment Questions API] POST answer error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit answer' },
      { status: 500 }
    )
  }
}
