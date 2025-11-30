/**
 * Assessment Questions API
 * GET - Get next question for assessment
 * POST - Submit answer and get next question
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getNextQuestion,
  submitAnswer,
  initializeAssessmentSession,
} from '@/lib/services/question-engine'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: assessmentId } = await params
    const supabase = await createClient()

    // Check if user owns this assessment
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: assessment } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .eq('user_id', user.id)
      .single()

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    // Check if session exists, if not initialize it
    const { data: session } = await supabase
      .from('assessment_sessions')
      .select('*')
      .eq('assessment_id', assessmentId)
      .single()

    if (!session) {
      // Get organization info for industry context
      let industry: string | undefined
      if (assessment.organization_id) {
        const { data: org } = await supabase
          .from('organizations')
          .select('industry')
          .eq('id', assessment.organization_id)
          .single()
        industry = org?.industry
      }

      await initializeAssessmentSession(assessmentId, {
        industry,
        assessmentType: assessment.assessment_type,
      })
    }

    // Get next question
    const nextQuestion = await getNextQuestion(assessmentId)

    if (!nextQuestion) {
      return NextResponse.json({
        complete: true,
        message: 'All questions answered',
      })
    }

    return NextResponse.json({
      question: nextQuestion,
      complete: false,
    })
  } catch (error) {
    console.error('Error getting next question:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: assessmentId } = await params
    const body = await request.json()
    const { questionCode, value, text, timeSpentSeconds } = body

    if (!questionCode) {
      return NextResponse.json({ error: 'questionCode is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if user owns this assessment
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: assessment } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .eq('user_id', user.id)
      .single()

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    if (assessment.status !== 'in_progress') {
      return NextResponse.json({ error: 'Assessment is not in progress' }, { status: 400 })
    }

    // Submit answer
    const result = await submitAnswer(assessmentId, questionCode, {
      value,
      text,
      timeSpentSeconds,
    })

    // Check if assessment is complete
    const { data: session } = await supabase
      .from('assessment_sessions')
      .select('*')
      .eq('assessment_id', assessmentId)
      .single()

    const isComplete =
      !result.nextQuestion && session?.questions_answered >= session?.total_questions

    if (isComplete) {
      // Mark assessment as complete
      await supabase
        .from('assessments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', assessmentId)
    }

    return NextResponse.json({
      success: result.success,
      nextQuestion: result.nextQuestion,
      complete: isComplete,
    })
  } catch (error) {
    console.error('Error submitting answer:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
