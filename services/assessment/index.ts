/**
 * Assessment Microservice
 * Handles AI-powered organizational assessments
 */

export interface QuestionResponse {
  questionId: string
  dimension: 'individual' | 'leadership' | 'cultural' | 'embedding' | 'velocity'
  answerType: 'scale' | 'multiChoice' | 'fearToConfidence' | 'text'
  answerValue?: number // 0-100
  answerText?: string
  questionText: string
  questionWeight: number
}

export interface AssessmentData {
  organizationId?: string
  assessmentType?: 'full' | 'quick' | 'follow_up'
  metadata?: Record<string, any>
}

export interface DimensionScores {
  individual: number
  leadership: number
  cultural: number
  embedding: number
  velocity: number
}

export interface AssessmentResult {
  id: string
  userId: string
  status: 'in_progress' | 'completed' | 'abandoned'
  overallScore?: number
  dimensionScores?: Partial<DimensionScores>
  results?: {
    insights: string[]
    strengths: string[]
    gaps: string[]
  }
  recommendations?: Array<{
    type: 'immediate' | 'short-term' | 'long-term'
    title: string
    description: string
    priority: 'low' | 'medium' | 'high' | 'critical'
  }>
  startedAt: string
  completedAt?: string
  metadata?: Record<string, any>
}

export interface AssessmentProgress {
  totalQuestions: number
  answeredQuestions: number
  percentComplete: number
  dimensionProgress: Array<{
    dimension: string
    total: number
    answered: number
    percentComplete: number
  }>
}

export class AssessmentService {
  private readonly baseUrl = '/.netlify/functions'

  /**
   * Start a new assessment for the current user
   */
  async startAssessment(userId: string, data?: AssessmentData): Promise<{ assessmentId: string }> {
    const response = await fetch(`${this.baseUrl}/assessment-start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        userId,
        organizationId: data?.organizationId,
        assessmentType: data?.assessmentType || 'full',
        metadata: data?.metadata || {}
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to start assessment')
    }

    const result = await response.json()
    return { assessmentId: result.assessmentId }
  }

  /**
   * Save a single response to an assessment
   */
  async saveResponse(assessmentId: string, response: QuestionResponse): Promise<void> {
    const apiResponse = await fetch(`${this.baseUrl}/assessment-save-response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        assessmentId,
        ...response
      })
    })

    if (!apiResponse.ok) {
      const error = await apiResponse.json()
      throw new Error(error.error || 'Failed to save response')
    }
  }

  /**
   * Save multiple responses at once
   */
  async saveResponses(assessmentId: string, responses: QuestionResponse[]): Promise<void> {
    const apiResponse = await fetch(`${this.baseUrl}/assessment-save-responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        assessmentId,
        responses
      })
    })

    if (!apiResponse.ok) {
      const error = await apiResponse.json()
      throw new Error(error.error || 'Failed to save responses')
    }
  }

  /**
   * Submit and finalize an assessment for scoring
   */
  async submitAssessment(assessmentId: string): Promise<AssessmentResult> {
    const response = await fetch(`${this.baseUrl}/assessment-completion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        assessmentId
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to submit assessment')
    }

    return await response.json()
  }

  /**
   * Get the current status and progress of an assessment
   */
  async getAssessmentStatus(assessmentId: string): Promise<{
    status: 'in_progress' | 'completed' | 'abandoned'
    progress: AssessmentProgress
  }> {
    const response = await fetch(`${this.baseUrl}/assessment-status?assessmentId=${assessmentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get assessment status')
    }

    return await response.json()
  }

  /**
   * Get the completed assessment results with insights
   */
  async getAssessmentResults(assessmentId: string): Promise<AssessmentResult> {
    const response = await fetch(`${this.baseUrl}/assessment-results?assessmentId=${assessmentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get assessment results')
    }

    return await response.json()
  }

  /**
   * Get all assessments for a user
   */
  async getUserAssessments(userId: string): Promise<AssessmentResult[]> {
    const response = await fetch(`${this.baseUrl}/user-assessments?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get user assessments')
    }

    const data = await response.json()
    return data.assessments
  }

  /**
   * Calculate maturity scores for an assessment
   */
  async calculateMaturity(assessmentId: string): Promise<{
    overallScore: number
    dimensionScores: DimensionScores
    insights: string[]
  }> {
    const response = await fetch(`${this.baseUrl}/maturity-calculator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        assessmentId
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to calculate maturity')
    }

    return await response.json()
  }

  /**
   * Compare assessment results to industry benchmarks
   */
  async compareToBenchmark(assessmentId: string): Promise<{
    yourScore: number
    industryAverage: number
    percentile: number
    comparison: string
  }> {
    const response = await fetch(`${this.baseUrl}/assessment-benchmark?assessmentId=${assessmentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get benchmark comparison')
    }

    return await response.json()
  }
}

export const assessmentService = new AssessmentService()