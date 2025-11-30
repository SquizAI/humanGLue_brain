/**
 * GET /api/assessments/[id]/questions/next - Get next question for assessment
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getNextQuestion } from '@/lib/services/question-engine'

export async function GET(
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
        { question: null, message: 'Assessment is complete' }
      )
    }

    // Get next question from question engine
    const question = await getNextQuestion(assessmentId)

    if (!question) {
      // Mark assessment as completed
      await supabase
        .from('assessments')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', assessmentId)

      return NextResponse.json(
        { question: null, message: 'Assessment is complete' }
      )
    }

    return NextResponse.json({ question })
  } catch (error) {
    console.error('[Assessment Questions API] GET next error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get next question' },
      { status: 500 }
    )
  }
}
