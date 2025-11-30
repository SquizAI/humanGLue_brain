/**
 * Dynamic Question Engine Service
 *
 * Provides adaptive questioning with:
 * - Industry-specific question selection
 * - Skip logic based on previous answers
 * - Question versioning and A/B testing
 * - Branching flows
 */

import { createClient } from '@/lib/supabase/server'

export interface Question {
  id: string
  questionCode: string
  version: number
  questionText: string
  questionDescription?: string
  helpText?: string
  dimension: 'individual' | 'leadership' | 'cultural' | 'embedding' | 'velocity'
  subdimension?: string
  answerType: 'scale' | 'multiChoice' | 'fearToConfidence' | 'text' | 'boolean'
  weight: number
  answerOptions?: Array<{
    value: number
    label: string
    description?: string
  }>
  displayOrder: number
  questionGroup?: string
}

export interface QuestionFlow {
  id: string
  flowName: string
  flowDescription?: string
  flowType: 'standard' | 'quick' | 'industry_specific' | 'follow_up'
  questionCodes: string[]
  branchingRules: Array<{
    fromQuestion: string
    condition: {
      operator: 'eq' | 'lt' | 'lte' | 'gt' | 'gte'
      value: number
    }
    toQuestions: string[]
  }>
}

export interface AssessmentSession {
  id: string
  assessmentId: string
  flowId?: string
  currentQuestionIndex: number
  totalQuestions: number
  questionsAnswered: number
  questionsSkipped: number
  questionSequence: string[]
  sessionState: Record<string, any>
}

/**
 * Initialize an assessment session with appropriate question flow
 */
export async function initializeAssessmentSession(
  assessmentId: string,
  options?: {
    industry?: string
    companySize?: string
    assessmentType?: 'full' | 'quick' | 'follow_up'
  }
): Promise<AssessmentSession> {
  const supabase = await createClient()

  // Select appropriate flow based on context
  const flowQuery = supabase
    .from('question_flows')
    .select('*')
    .eq('is_active', true)

  if (options?.assessmentType) {
    flowQuery.eq('assessment_type', options.assessmentType)
  }

  if (options?.industry) {
    flowQuery.contains('industries', [options.industry])
  }

  const { data: flows } = await flowQuery.order('created_at', { ascending: false }).limit(1)

  const selectedFlow = flows?.[0]

  // Build initial question sequence
  const questionSequence = selectedFlow?.question_codes || []

  // Create session
  const { data: session, error } = await supabase
    .from('assessment_sessions')
    .insert({
      assessment_id: assessmentId,
      flow_id: selectedFlow?.id,
      total_questions: questionSequence.length,
      question_sequence: questionSequence,
      session_state: {
        industry: options?.industry,
        companySize: options?.companySize,
        assessmentType: options?.assessmentType,
      },
    })
    .select()
    .single()

  if (error) throw error

  return {
    id: session.id,
    assessmentId: session.assessment_id,
    flowId: session.flow_id,
    currentQuestionIndex: session.current_question_index,
    totalQuestions: session.total_questions,
    questionsAnswered: session.questions_answered,
    questionsSkipped: session.questions_skipped,
    questionSequence: session.question_sequence,
    sessionState: session.session_state,
  }
}

/**
 * Get the next question for an assessment
 * Applies skip logic and branching rules
 */
export async function getNextQuestion(assessmentId: string): Promise<Question | null> {
  const supabase = await createClient()

  // Use the database function for initial logic
  const { data: nextQuestions } = await supabase.rpc('get_next_question', {
    p_assessment_id: assessmentId,
  })

  if (!nextQuestions || nextQuestions.length === 0) {
    return null
  }

  const question = nextQuestions[0]

  // Check if question should be skipped
  const { data: shouldSkip } = await supabase.rpc('should_skip_question', {
    p_assessment_id: assessmentId,
    p_question_code: question.question_code,
  })

  if (shouldSkip) {
    // Mark question as skipped
    await supabase.from('assessment_responses').insert({
      assessment_id: assessmentId,
      question_id: question.question_code,
      question_bank_id: question.question_id,
      question_version: question.version || 1,
      question_number: 0,
      skipped: true,
      skip_reason: 'Skip logic condition met',
    })

    // Recursively get next question
    return getNextQuestion(assessmentId)
  }

  return {
    id: question.question_id,
    questionCode: question.question_code,
    version: 1,
    questionText: question.question_text,
    questionDescription: question.question_description,
    helpText: question.help_text,
    dimension: question.dimension,
    subdimension: question.subdimension,
    answerType: question.answer_type,
    weight: question.weight,
    answerOptions: question.answer_options,
    displayOrder: question.display_order,
  }
}

/**
 * Submit an answer and optionally get next question
 */
export async function submitAnswer(
  assessmentId: string,
  questionCode: string,
  answer: {
    value?: number
    text?: string
    timeSpentSeconds?: number
  }
): Promise<{ success: boolean; nextQuestion?: Question | null }> {
  const supabase = await createClient()

  // Get question details
  const { data: question } = await supabase
    .from('question_bank')
    .select('*')
    .eq('question_code', questionCode)
    .eq('is_active', true)
    .single()

  if (!question) {
    throw new Error(`Question ${questionCode} not found`)
  }

  // Get current question number
  const { count } = await supabase
    .from('assessment_responses')
    .select('*', { count: 'exact', head: true })
    .eq('assessment_id', assessmentId)

  // Insert answer
  const { error } = await supabase.from('assessment_responses').insert({
    assessment_id: assessmentId,
    question_id: questionCode,
    question_bank_id: question.id,
    question_version: question.version,
    question_number: (count || 0) + 1,
    response_text: answer.text,
    ai_confidence_score: answer.value, // Store numeric value in confidence score
    time_spent_seconds: answer.timeSpentSeconds,
    metadata: { answer_value: answer.value },
  })

  if (error) throw error

  // Check for branching rules
  const nextQuestion = await applyBranchingLogic(assessmentId, questionCode, answer.value || 0)

  return {
    success: true,
    nextQuestion: nextQuestion || (await getNextQuestion(assessmentId)),
  }
}

/**
 * Apply branching logic based on answer
 */
async function applyBranchingLogic(
  assessmentId: string,
  questionCode: string,
  answerValue: number
): Promise<Question | null> {
  const supabase = await createClient()

  // Get session to find flow
  const { data: session } = await supabase
    .from('assessment_sessions')
    .select('*, question_flows(*)')
    .eq('assessment_id', assessmentId)
    .single()

  if (!session?.question_flows?.branching_rules) {
    return null
  }

  const branchingRules = session.question_flows.branching_rules as any[]

  // Find matching branching rule
  const matchingRule = branchingRules.find((rule) => {
    if (rule.from_question !== questionCode) return false

    const condition = rule.condition
    switch (condition.operator) {
      case 'eq':
        return answerValue === condition.value
      case 'lt':
        return answerValue < condition.value
      case 'lte':
        return answerValue <= condition.value
      case 'gt':
        return answerValue > condition.value
      case 'gte':
        return answerValue >= condition.value
      default:
        return false
    }
  })

  if (!matchingRule) {
    return null
  }

  // Update session sequence to include branched questions
  const newQuestions = matchingRule.to_questions as string[]
  const currentSequence = session.question_sequence as string[]

  // Insert branched questions after current position
  const updatedSequence = [
    ...currentSequence.slice(0, session.current_question_index + 1),
    ...newQuestions,
    ...currentSequence.slice(session.current_question_index + 1),
  ]

  await supabase
    .from('assessment_sessions')
    .update({
      question_sequence: updatedSequence,
      total_questions: updatedSequence.length,
    })
    .eq('id', session.id)

  // Return first branched question
  const { data: branchedQuestion } = await supabase
    .from('question_bank')
    .select('*')
    .eq('question_code', newQuestions[0])
    .eq('is_active', true)
    .single()

  if (!branchedQuestion) return null

  return {
    id: branchedQuestion.id,
    questionCode: branchedQuestion.question_code,
    version: branchedQuestion.version,
    questionText: branchedQuestion.question_text,
    questionDescription: branchedQuestion.question_description,
    helpText: branchedQuestion.help_text,
    dimension: branchedQuestion.dimension,
    subdimension: branchedQuestion.subdimension,
    answerType: branchedQuestion.answer_type,
    weight: branchedQuestion.weight,
    answerOptions: branchedQuestion.answer_options,
    displayOrder: branchedQuestion.display_order,
  }
}

/**
 * Get questions for a specific industry
 */
export async function getIndustryQuestions(industry: string): Promise<Question[]> {
  const supabase = await createClient()

  const { data: questions } = await supabase
    .from('question_bank')
    .select('*')
    .eq('is_active', true)
    .or(`industries.cs.{${industry}},industries.eq.{}`) // Match industry or empty array (all industries)
    .order('dimension')
    .order('display_order')

  if (!questions) return []

  return questions.map((q) => ({
    id: q.id,
    questionCode: q.question_code,
    version: q.version,
    questionText: q.question_text,
    questionDescription: q.question_description,
    helpText: q.help_text,
    dimension: q.dimension,
    subdimension: q.subdimension,
    answerType: q.answer_type,
    weight: q.weight,
    answerOptions: q.answer_options,
    displayOrder: q.display_order,
    questionGroup: q.question_group,
  }))
}

/**
 * Get assessment progress
 */
export async function getAssessmentProgress(assessmentId: string): Promise<{
  totalQuestions: number
  answeredQuestions: number
  skippedQuestions: number
  completionPercentage: number
  dimensionProgress: Array<{
    dimension: string
    total: number
    answered: number
    percentage: number
  }>
}> {
  const supabase = await createClient()

  const { data: session } = await supabase
    .from('assessment_sessions')
    .select('*')
    .eq('assessment_id', assessmentId)
    .single()

  if (!session) {
    throw new Error('Assessment session not found')
  }

  // Get dimension breakdown - join with question_bank to get dimension
  const { data: responses } = await supabase
    .from('assessment_responses')
    .select('question_bank_id, skipped, question_bank(dimension)')
    .eq('assessment_id', assessmentId)

  const dimensionStats = responses?.map((r) => ({
    dimension: (r.question_bank as any)?.dimension,
    skipped: r.skipped,
  }))

  const dimensionProgress = ['individual', 'leadership', 'cultural', 'embedding', 'velocity'].map(
    (dim) => {
      const dimAnswers = dimensionStats?.filter((a) => a.dimension === dim) || []
      const answered = dimAnswers.filter((a) => !a.skipped).length
      const total = dimAnswers.length

      return {
        dimension: dim,
        total,
        answered,
        percentage: total > 0 ? Math.round((answered / total) * 100) : 0,
      }
    }
  )

  const totalAnswered = session.questions_answered || 0
  const totalQuestions = session.total_questions || 0

  return {
    totalQuestions,
    answeredQuestions: totalAnswered,
    skippedQuestions: session.questions_skipped || 0,
    completionPercentage: totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0,
    dimensionProgress,
  }
}

/**
 * Create or update a question in the bank
 */
export async function upsertQuestion(question: Partial<Question> & { questionCode: string }) {
  const supabase = await createClient()

  // Check if question exists
  const { data: existing } = await supabase
    .from('question_bank')
    .select('*')
    .eq('question_code', question.questionCode)
    .order('version', { ascending: false })
    .limit(1)
    .single()

  const nextVersion = existing ? existing.version + 1 : 1

  const { data, error } = await supabase
    .from('question_bank')
    .insert({
      question_code: question.questionCode,
      version: nextVersion,
      question_text: question.questionText,
      question_description: question.questionDescription,
      help_text: question.helpText,
      dimension: question.dimension,
      subdimension: question.subdimension,
      answer_type: question.answerType,
      weight: question.weight || 1,
      answer_options: question.answerOptions,
      display_order: question.displayOrder || 0,
      is_active: true,
    })
    .select()
    .single()

  if (error) throw error

  // Deprecate old version if creating new version
  if (existing) {
    await supabase
      .from('question_bank')
      .update({ is_active: false, deprecated_at: new Date().toISOString() })
      .eq('id', existing.id)
  }

  return data
}
