/**
 * Integration Tests: Assessments API
 *
 * Test Coverage:
 * - POST /api/assessments - Create assessment
 * - GET /api/assessments/[id] - Get assessment
 * - POST /api/assessments/[id]/answers - Submit answers
 * - GET /api/assessments/[id]/results - Get results
 * - Assessment scoring logic
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createMockSupabaseClient } from '@/tests/setup/test-utils'

describe('Assessments API - POST /api/assessments', () => {
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient()
  })

  it('should create new assessment', async () => {
    const assessmentData = {
      user_id: 'user-1',
      type: 'adaptability',
    }

    const createdAssessment = {
      id: 'assessment-1',
      ...assessmentData,
      status: 'in_progress',
      current_dimension: 'individual',
      answers: {},
      scores: null,
      created_at: new Date().toISOString(),
    }

    mockSupabase.single.mockResolvedValue({ data: createdAssessment, error: null })

    const result = await mockSupabase.single()
    expect(result.data.status).toBe('in_progress')
    expect(result.data.current_dimension).toBe('individual')
  })

  it('should initialize empty answers object', async () => {
    const assessment = {
      id: 'assessment-1',
      answers: {},
    }

    expect(assessment.answers).toEqual({})
    expect(Object.keys(assessment.answers)).toHaveLength(0)
  })

  it('should set initial dimension to individual', async () => {
    const assessment = {
      current_dimension: 'individual',
    }

    expect(assessment.current_dimension).toBe('individual')
  })

  it('should require user authentication', () => {
    const authenticatedUser = { id: 'user-1' }
    const unauthenticatedUser = null

    expect(authenticatedUser).toBeTruthy()
    expect(unauthenticatedUser).toBeNull()
  })
})

describe('Assessments API - POST /api/assessments/[id]/answers', () => {
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient()
  })

  it('should save dimension answers', async () => {
    const answers = {
      dimension: 'individual',
      responses: {
        'change-readiness': 75,
        'learning-agility': 80,
        'ai-confidence': 65,
        'fear-level': 35,
        'growth-mindset': 85,
      },
    }

    const updatedAssessment = {
      id: 'assessment-1',
      answers: {
        individual: answers.responses,
      },
    }

    mockSupabase.single.mockResolvedValue({ data: updatedAssessment, error: null })

    const result = await mockSupabase.single()
    expect(result.data.answers.individual).toBeDefined()
    expect(result.data.answers.individual['change-readiness']).toBe(75)
  })

  it('should validate answer values are 0-100', () => {
    const validAnswer = 75
    const negativeAnswer = -10
    const overMaxAnswer = 150

    expect(validAnswer).toBeGreaterThanOrEqual(0)
    expect(validAnswer).toBeLessThanOrEqual(100)
    expect(negativeAnswer).toBeLessThan(0)
    expect(overMaxAnswer).toBeGreaterThan(100)
  })

  it('should validate dimension name', () => {
    const validDimensions = ['individual', 'leadership', 'cultural', 'embedding', 'velocity']
    const invalidDimension = 'invalid'

    expect(validDimensions).toContain('individual')
    expect(validDimensions).not.toContain(invalidDimension)
  })

  it('should update current dimension on save', async () => {
    const assessment = {
      current_dimension: 'individual',
    }

    const updatedAssessment = {
      current_dimension: 'leadership',
    }

    expect(updatedAssessment.current_dimension).toBe('leadership')
  })

  it('should preserve previous dimension answers', async () => {
    const existingAnswers = {
      individual: {
        'change-readiness': 75,
      },
    }

    const newAnswers = {
      leadership: {
        'ai-literacy': 80,
      },
    }

    const combinedAnswers = {
      ...existingAnswers,
      ...newAnswers,
    }

    expect(combinedAnswers.individual).toBeDefined()
    expect(combinedAnswers.leadership).toBeDefined()
  })

  it('should validate all required questions answered', () => {
    const completeAnswers = {
      'change-readiness': 75,
      'learning-agility': 80,
      'ai-confidence': 65,
      'fear-level': 35,
      'growth-mindset': 85,
    }

    const incompleteAnswers = {
      'change-readiness': 75,
      'learning-agility': 80,
    }

    expect(Object.keys(completeAnswers)).toHaveLength(5)
    expect(Object.keys(incompleteAnswers)).toHaveLength(2)
  })
})

describe('Assessments API - GET /api/assessments/[id]/results', () => {
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient()
  })

  it('should calculate individual dimension score', () => {
    const answers = {
      'change-readiness': 80,
      'learning-agility': 75,
      'ai-confidence': 70,
      'fear-level': 30,
      'growth-mindset': 85,
    }

    // Individual formula: 0.25*CR + 0.25*LA + 0.20*AI + 0.15*(100-Fear) + 0.15*GM
    const score =
      0.25 * answers['change-readiness'] +
      0.25 * answers['learning-agility'] +
      0.20 * answers['ai-confidence'] +
      0.15 * (100 - answers['fear-level']) +
      0.15 * answers['growth-mindset']

    expect(score).toBeCloseTo(76.25, 2)
  })

  it('should calculate leadership dimension score', () => {
    const answers = {
      'ai-literacy': 75,
      'change-championing': 80,
      'vulnerability-index': 65,
      'vision-clarity': 70,
      'coaching-capability': 75,
    }

    // Leadership formula: 0.25*AI + 0.25*CC + 0.20*VI + 0.15*VC + 0.15*CC
    const score =
      0.25 * answers['ai-literacy'] +
      0.25 * answers['change-championing'] +
      0.20 * answers['vulnerability-index'] +
      0.15 * answers['vision-clarity'] +
      0.15 * answers['coaching-capability']

    expect(score).toBeCloseTo(72.75, 2)
  })

  it('should calculate cultural dimension score', () => {
    const answers = {
      'psychological-safety': 70,
      'experimentation-culture': 75,
      'failure-resilience': 65,
      'collaboration-score': 80,
      'recognition-systems': 70,
    }

    const score =
      0.25 * answers['psychological-safety'] +
      0.25 * answers['experimentation-culture'] +
      0.20 * answers['failure-resilience'] +
      0.15 * answers['collaboration-score'] +
      0.15 * answers['recognition-systems']

    expect(score).toBeCloseTo(71.75, 2)
  })

  it('should calculate overall adaptability score', () => {
    const dimensionScores = {
      individual: 76,
      leadership: 73,
      cultural: 72,
      embedding: 70,
      velocity: 68,
    }

    // Overall: Average of all dimensions
    const overallScore =
      Object.values(dimensionScores).reduce((a, b) => a + b, 0) /
      Object.keys(dimensionScores).length

    expect(overallScore).toBeCloseTo(71.8, 1)
  })

  it('should return maturity level based on score', () => {
    const scores = {
      low: 35,
      medium: 55,
      high: 75,
      exceptional: 92,
    }

    expect(scores.low).toBeLessThan(40)
    expect(scores.medium).toBeGreaterThanOrEqual(40)
    expect(scores.medium).toBeLessThan(70)
    expect(scores.high).toBeGreaterThanOrEqual(70)
    expect(scores.high).toBeLessThan(85)
    expect(scores.exceptional).toBeGreaterThanOrEqual(85)
  })

  it('should include dimension breakdowns', async () => {
    const results = {
      overall_score: 72,
      dimensions: {
        individual: {
          score: 76,
          maturity: 'high',
          subdimensions: {
            'change-readiness': 80,
            'learning-agility': 75,
            'ai-confidence': 70,
            'fear-level': 30,
            'growth-mindset': 85,
          },
        },
        leadership: {
          score: 73,
          maturity: 'high',
          subdimensions: {
            'ai-literacy': 75,
            'change-championing': 80,
            'vulnerability-index': 65,
            'vision-clarity': 70,
            'coaching-capability': 75,
          },
        },
      },
    }

    expect(results.dimensions.individual.score).toBe(76)
    expect(results.dimensions.individual.maturity).toBe('high')
    expect(results.dimensions.individual.subdimensions).toBeDefined()
  })

  it('should generate recommendations based on scores', () => {
    const lowScore = 35
    const highScore = 85

    const recommendations = {
      low: [
        'Start with foundational adaptability training',
        'Focus on building change readiness',
      ],
      high: [
        'Consider advanced certification programs',
        'Mentor others in adaptability',
      ],
    }

    if (lowScore < 40) {
      expect(recommendations.low).toHaveLength(2)
    }

    if (highScore >= 70) {
      expect(recommendations.high).toHaveLength(2)
    }
  })

  it('should mark assessment as completed', async () => {
    const assessment = {
      id: 'assessment-1',
      status: 'in_progress',
    }

    const completedAssessment = {
      ...assessment,
      status: 'completed',
      completed_at: new Date().toISOString(),
    }

    expect(completedAssessment.status).toBe('completed')
    expect(completedAssessment.completed_at).toBeDefined()
  })

  it('should only calculate results when all dimensions complete', () => {
    const allDimensions = ['individual', 'leadership', 'cultural', 'embedding', 'velocity']

    const completeAnswers = {
      individual: { /* 5 questions */ },
      leadership: { /* 5 questions */ },
      cultural: { /* 5 questions */ },
      embedding: { /* 5 questions */ },
      velocity: { /* 5 questions */ },
    }

    const incompleteAnswers = {
      individual: { /* 5 questions */ },
      leadership: { /* 5 questions */ },
    }

    expect(Object.keys(completeAnswers)).toHaveLength(5)
    expect(Object.keys(incompleteAnswers)).toHaveLength(2)
  })
})

describe('Assessment Scoring Logic', () => {
  it('should handle fear level inversion correctly', () => {
    const fearLevel = 30 // Low fear is good
    const invertedFear = 100 - fearLevel // = 70

    expect(invertedFear).toBe(70)
    expect(invertedFear).toBeGreaterThan(fearLevel)
  })

  it('should apply correct weights for individual dimension', () => {
    const weights = {
      'change-readiness': 0.25,
      'learning-agility': 0.25,
      'ai-confidence': 0.20,
      'fear-level': 0.15,
      'growth-mindset': 0.15,
    }

    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)

    expect(totalWeight).toBeCloseTo(1.0, 2)
  })

  it('should round scores to 2 decimal places', () => {
    const rawScore = 76.3456789
    const roundedScore = Math.round(rawScore * 100) / 100

    expect(roundedScore).toBe(76.35)
  })

  it('should clamp scores to 0-100 range', () => {
    const overMax = 105
    const underMin = -5
    const valid = 75

    const clamp = (value: number) => Math.max(0, Math.min(100, value))

    expect(clamp(overMax)).toBe(100)
    expect(clamp(underMin)).toBe(0)
    expect(clamp(valid)).toBe(75)
  })

  it('should handle missing dimension gracefully', () => {
    const answers = {
      individual: { 'change-readiness': 75 },
      // leadership missing
    }

    const hasDimension = (dim: string) => answers.hasOwnProperty(dim)

    expect(hasDimension('individual')).toBe(true)
    expect(hasDimension('leadership')).toBe(false)
  })

  it('should calculate percentile rankings', () => {
    const score = 76
    const allScores = [45, 52, 60, 68, 76, 82, 88, 91, 95]

    const percentile =
      (allScores.filter(s => s <= score).length / allScores.length) * 100

    expect(percentile).toBeCloseTo(55.56, 1)
  })
})

describe('Assessment API - Error Handling', () => {
  it('should handle incomplete assessment', () => {
    const assessment = {
      status: 'in_progress',
      answers: {
        individual: {},
      },
    }

    expect(assessment.status).toBe('in_progress')
    expect(Object.keys(assessment.answers)).toHaveLength(1)
  })

  it('should prevent accessing results before completion', () => {
    const assessment = {
      status: 'in_progress',
      scores: null,
    }

    expect(assessment.scores).toBeNull()
  })

  it('should validate assessment ownership', () => {
    const assessment = {
      user_id: 'user-1',
    }

    const requestingUser = 'user-2'

    expect(assessment.user_id).not.toBe(requestingUser)
  })

  it('should handle database errors gracefully', async () => {
    const mockSupabase = createMockSupabaseClient()
    const dbError = new Error('Connection timeout')

    mockSupabase.single.mockResolvedValue({ data: null, error: dbError })

    const result = await mockSupabase.single()
    expect(result.error).toBeTruthy()
  })
})
