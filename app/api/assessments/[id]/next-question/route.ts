/**
 * Next Question API
 * GET /api/assessments/[id]/next-question - Get next unanswered question
 * POST /api/assessments/[id]/next-question - Submit answer and get next question
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, handleUnknownError, APIErrors } from '@/lib/api/errors'
import { requireAuth } from '@/lib/api/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/assessments/[id]/next-question
 * Get the next unanswered question using adaptive logic
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

    // Use database function to get next question
    const { data: nextQuestions, error: questionError } = await supabase.rpc('get_next_question', {
      p_assessment_id: assessmentId,
    })

    if (questionError) throw questionError

    if (!nextQuestions || nextQuestions.length === 0) {
      // No more questions - assessment complete
      return NextResponse.json(successResponse({
        question: null,
        isComplete: true,
        message: 'All questions have been answered.',
      }))
    }

    const question = nextQuestions[0]

    // Check if this question should be skipped
    const { data: shouldSkip } = await supabase.rpc('should_skip_question', {
      p_assessment_id: assessmentId,
      p_question_code: question.question_code,
    })

    if (shouldSkip) {
      // Skip this question and record it
      await supabase.from('assessment_responses').insert({
        assessment_id: assessmentId,
        question_id: question.question_code,
        question_bank_id: question.question_id,
        question_version: 1,
        dimension: question.dimension,
        answer_type: question.answer_type,
        question_text: question.question_text,
        question_weight: question.weight,
        skipped: true,
        skip_reason: 'Skip logic condition met',
        answer_value: 0,
      })

      // Recursively get next question
      const { data: nextAfterSkip } = await supabase.rpc('get_next_question', {
        p_assessment_id: assessmentId,
      })

      if (!nextAfterSkip || nextAfterSkip.length === 0) {
        return NextResponse.json(successResponse({
          question: null,
          isComplete: true,
          message: 'All questions have been answered.',
        }))
      }

      return NextResponse.json(successResponse({
        question: nextAfterSkip[0],
        isComplete: false,
        skippedQuestion: question.question_code,
      }))
    }

    // Get session progress
    const { data: session } = await supabase
      .from('assessment_sessions')
      .select('questions_answered, total_questions')
      .eq('assessment_id', assessmentId)
      .single()

    return NextResponse.json(successResponse({
      question: {
        id: question.question_id,
        questionCode: question.question_code,
        questionText: question.question_text,
        questionDescription: question.question_description,
        helpText: question.help_text,
        dimension: question.dimension,
        subdimension: question.subdimension,
        answerType: question.answer_type,
        answerOptions: question.answer_options,
        weight: question.weight,
        displayOrder: question.display_order,
      },
      isComplete: false,
      progress: session ? {
        answered: session.questions_answered,
        total: session.total_questions,
        percentage: Math.round((session.questions_answered / session.total_questions) * 100),
      } : null,
    }))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}

/**
 * POST /api/assessments/[id]/next-question
 * Submit an answer and get the next question
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth()
    const { id: assessmentId } = await params

    const body = await request.json()
    const { questionCode, answerValue, answerText, timeSpentSeconds } = body

    if (!questionCode) {
      return NextResponse.json(
        errorResponse(APIErrors.VALIDATION_ERROR(['questionCode is required'])),
        { status: 400 }
      )
    }

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

    // Get question details
    const { data: question, error: questionError } = await supabase
      .from('question_bank')
      .select('*')
      .eq('question_code', questionCode)
      .eq('is_active', true)
      .single()

    if (questionError || !question) {
      return NextResponse.json(
        errorResponse(APIErrors.NOT_FOUND('Question')),
        { status: 404 }
      )
    }

    // Check if already answered
    const { data: existingAnswer } = await supabase
      .from('assessment_responses')
      .select('id')
      .eq('assessment_id', assessmentId)
      .eq('question_id', questionCode)
      .single()

    if (existingAnswer) {
      // Update existing answer
      const { error: updateError } = await supabase
        .from('assessment_responses')
        .update({
          answer_value: answerValue,
          answer_text: answerText,
          time_spent_seconds: timeSpentSeconds,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingAnswer.id)

      if (updateError) throw updateError
    } else {
      // Insert new answer
      const { error: insertError } = await supabase
        .from('assessment_responses')
        .insert({
          assessment_id: assessmentId,
          question_id: questionCode,
          question_bank_id: question.id,
          question_version: question.version,
          dimension: question.dimension,
          answer_type: question.answer_type,
          answer_value: answerValue,
          answer_text: answerText,
          question_text: question.question_text,
          question_weight: question.weight,
          time_spent_seconds: timeSpentSeconds,
          skipped: false,
        })

      if (insertError) throw insertError
    }

    // Check for branching rules and apply them
    const { data: session } = await supabase
      .from('assessment_sessions')
      .select('*, question_flows(*)')
      .eq('assessment_id', assessmentId)
      .single()

    if (session?.question_flows?.branching_rules) {
      const branchingRules = session.question_flows.branching_rules as Array<{
        from_question: string
        condition: { operator: string; value: number }
        to_questions: string[]
      }>

      const matchingRule = branchingRules.find((rule) => {
        if (rule.from_question !== questionCode) return false
        const condition = rule.condition
        switch (condition.operator) {
          case 'eq': return answerValue === condition.value
          case 'lt': return answerValue < condition.value
          case 'lte': return answerValue <= condition.value
          case 'gt': return answerValue > condition.value
          case 'gte': return answerValue >= condition.value
          default: return false
        }
      })

      if (matchingRule) {
        // Insert branched questions into sequence
        const currentSequence = session.question_sequence as string[]
        const currentIndex = currentSequence.indexOf(questionCode)
        const newQuestions = matchingRule.to_questions

        const updatedSequence = [
          ...currentSequence.slice(0, currentIndex + 1),
          ...newQuestions.filter(q => !currentSequence.includes(q)),
          ...currentSequence.slice(currentIndex + 1),
        ]

        await supabase
          .from('assessment_sessions')
          .update({
            question_sequence: updatedSequence,
            total_questions: updatedSequence.length,
          })
          .eq('id', session.id)
      }
    }

    // Get next question
    const { data: nextQuestions } = await supabase.rpc('get_next_question', {
      p_assessment_id: assessmentId,
    })

    const isComplete = !nextQuestions || nextQuestions.length === 0

    // If complete, update assessment status
    if (isComplete) {
      await supabase
        .from('assessments')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', assessmentId)
    }

    // Get updated session for progress
    const { data: updatedSession } = await supabase
      .from('assessment_sessions')
      .select('questions_answered, total_questions')
      .eq('assessment_id', assessmentId)
      .single()

    return NextResponse.json(successResponse({
      success: true,
      nextQuestion: isComplete ? null : {
        id: nextQuestions[0].question_id,
        questionCode: nextQuestions[0].question_code,
        questionText: nextQuestions[0].question_text,
        questionDescription: nextQuestions[0].question_description,
        helpText: nextQuestions[0].help_text,
        dimension: nextQuestions[0].dimension,
        subdimension: nextQuestions[0].subdimension,
        answerType: nextQuestions[0].answer_type,
        answerOptions: nextQuestions[0].answer_options,
        weight: nextQuestions[0].weight,
      },
      isComplete,
      progress: updatedSession ? {
        answered: updatedSession.questions_answered,
        total: updatedSession.total_questions,
        percentage: Math.round((updatedSession.questions_answered / updatedSession.total_questions) * 100),
      } : null,
    }))
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
