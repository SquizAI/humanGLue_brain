/**
 * Assessment Answers API
 * POST /api/assessments/[id]/answers - Submit assessment answers
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateRequest, submitAnswersSchema } from '@/lib/api/validation'
import {
  APIErrors,
  successResponse,
  errorResponse,
  handleUnknownError,
} from '@/lib/api/errors'
import { requireAuth, requireOwnership } from '@/lib/api/auth'
import { enforceRateLimit } from '@/lib/api/rate-limit'

/**
 * Calculate dimension scores from answers
 */
function calculateDimensionScores(answers: Array<{
  dimension: string
  answer_value: number
  question_weight: number
}>) {
  const dimensions = ['individual', 'leadership', 'cultural', 'embedding', 'velocity']
  const scores: Record<string, number> = {}

  for (const dimension of dimensions) {
    const dimensionAnswers = answers.filter(a => a.dimension === dimension)

    if (dimensionAnswers.length === 0) {
      scores[`${dimension}_score`] = 0
      continue
    }

    const totalWeight = dimensionAnswers.reduce((sum, a) => sum + a.question_weight, 0)
    const weightedSum = dimensionAnswers.reduce(
      (sum, a) => sum + a.answer_value * a.question_weight,
      0
    )

    scores[`${dimension}_score`] = Math.round(weightedSum / totalWeight)
  }

  return scores
}

/**
 * POST /api/assessments/[id]/answers
 * Submit or update answers for an assessment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params
    const user = await requireAuth()

    // Enforce rate limit
    await enforceRateLimit(request, 'lenient', user.id)

    // Parse and validate request body
    const body = await request.json()
    const validation = validateRequest(submitAnswersSchema, body)

    if (!validation.success) {
      return NextResponse.json(
        errorResponse(APIErrors.VALIDATION_ERROR(validation.errors)),
        { status: 400 }
      )
    }

    const { answers } = validation.data
    const supabase = await createClient()

    // Get assessment to verify ownership and status
    const { data: assessment, error: fetchError } = await supabase
      .from('assessments')
      .select('user_id, status')
      .eq('id', assessmentId)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse(APIErrors.NOT_FOUND('Assessment')),
          { status: 404 }
        )
      }
      throw fetchError
    }

    // Check ownership
    await requireOwnership(user, assessment.user_id)

    // Only allow updating in_progress assessments
    if (assessment.status !== 'in_progress') {
      return NextResponse.json(
        errorResponse(APIErrors.CONFLICT('Cannot update completed or abandoned assessment')),
        { status: 409 }
      )
    }

    // Insert or update answers
    const answerRecords = answers.map(answer => ({
      assessment_id: assessmentId,
      question_id: answer.questionId,
      dimension: answer.dimension,
      answer_type: answer.answerType,
      answer_value: answer.answerValue,
      answer_text: answer.answerText,
      question_weight: answer.questionWeight,
    }))

    const { error: answersError } = await supabase
      .from('assessment_answers')
      .upsert(answerRecords, {
        onConflict: 'assessment_id,question_id',
      })

    if (answersError) throw answersError

    // Get all answers for this assessment
    const { data: allAnswers, error: allAnswersError } = await supabase
      .from('assessment_answers')
      .select('dimension, answer_value, question_weight')
      .eq('assessment_id', assessmentId)

    if (allAnswersError) throw allAnswersError

    // Calculate dimension scores
    const dimensionScores = calculateDimensionScores(allAnswers)

    // Update assessment with new scores
    const { data: updatedAssessment, error: updateError } = await supabase
      .from('assessments')
      .update({
        ...dimensionScores,
        updated_at: new Date().toISOString(),
      })
      .eq('id', assessmentId)
      .select(`
        *,
        organization:organizations(
          id,
          name,
          slug
        ),
        answers:assessment_answers(
          id,
          question_id,
          dimension,
          answer_type,
          answer_value,
          answer_text,
          question_weight
        )
      `)
      .single()

    if (updateError) throw updateError

    return NextResponse.json(
      successResponse(updatedAssessment, {
        message: `Submitted ${answers.length} answer(s)`,
        scoresUpdated: dimensionScores,
      })
    )
  } catch (error) {
    const apiError = handleUnknownError(error)
    return NextResponse.json(errorResponse(apiError), { status: apiError.statusCode })
  }
}
