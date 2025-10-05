/**
 * Assessment Test Fixtures
 * Mock data for assessment-related tests
 */

export interface AssessmentAnswer {
  questionId: string
  value: number
  timestamp: string
}

export interface AssessmentScores {
  overall: number
  dimensions: {
    individual: number
    leadership: number
    cultural: number
    embedding: number
    velocity: number
  }
  subdimensions: {
    changeReadiness: number
    learningAgility: number
    aiConfidence: number
    fearLevel: number
    growthMindset: number
    aiLiteracy: number
    changeChampioning: number
    vulnerabilityIndex: number
    visionClarity: number
    coachingCapability: number
    psychologicalSafety: number
    experimentationCulture: number
    failureResilience: number
    collaborationScore: number
    recognitionSystems: number
    habitStrength: number
    reinforcementInfra: number
    accountability: number
    socialProof: number
    environmentalDesign: number
    decisionSpeed: number
    resourceFlexibility: number
    communicationEfficiency: number
    learningInfrastructure: number
    changeFatigue: number
  }
}

export const mockAssessmentQuestions = {
  individual: [
    {
      id: 'change-readiness-1',
      dimension: 'individual',
      subdimension: 'changeReadiness',
      question: 'How comfortable are you with rapid change in your work environment?',
      weight: 0.25,
    },
    {
      id: 'learning-agility-1',
      dimension: 'individual',
      subdimension: 'learningAgility',
      question: 'How quickly can you learn and apply new AI tools?',
      weight: 0.25,
    },
    {
      id: 'ai-confidence-1',
      dimension: 'individual',
      subdimension: 'aiConfidence',
      question: 'How confident are you in your ability to work with AI?',
      weight: 0.2,
    },
    {
      id: 'fear-level-1',
      dimension: 'individual',
      subdimension: 'fearLevel',
      question: 'How anxious do you feel about AI replacing your role?',
      weight: 0.15,
    },
    {
      id: 'growth-mindset-1',
      dimension: 'individual',
      subdimension: 'growthMindset',
      question: 'Do you believe your abilities can be developed through effort?',
      weight: 0.15,
    },
  ],
  leadership: [
    {
      id: 'ai-literacy-1',
      dimension: 'leadership',
      subdimension: 'aiLiteracy',
      question: 'How well do you understand AI capabilities and limitations?',
      weight: 0.25,
    },
    {
      id: 'change-championing-1',
      dimension: 'leadership',
      subdimension: 'changeChampioning',
      question: 'How effectively do you champion change initiatives?',
      weight: 0.25,
    },
    {
      id: 'vulnerability-1',
      dimension: 'leadership',
      subdimension: 'vulnerabilityIndex',
      question: 'How comfortable are you admitting when you need to learn?',
      weight: 0.2,
    },
    {
      id: 'vision-clarity-1',
      dimension: 'leadership',
      subdimension: 'visionClarity',
      question: 'How clear is your vision for AI transformation?',
      weight: 0.15,
    },
    {
      id: 'coaching-capability-1',
      dimension: 'leadership',
      subdimension: 'coachingCapability',
      question: 'How well do you coach others through change?',
      weight: 0.15,
    },
  ],
}

export const mockCompletedAssessment = {
  id: 'assessment-completed',
  user_id: 'user-1',
  status: 'completed',
  current_dimension: 'velocity',
  answers: {
    'change-readiness-1': { value: 85, timestamp: '2025-03-01T10:00:00Z' },
    'learning-agility-1': { value: 75, timestamp: '2025-03-01T10:01:00Z' },
    'ai-confidence-1': { value: 65, timestamp: '2025-03-01T10:02:00Z' },
    'fear-level-1': { value: 30, timestamp: '2025-03-01T10:03:00Z' },
    'growth-mindset-1': { value: 90, timestamp: '2025-03-01T10:04:00Z' },
  },
  scores: {
    overall: 77,
    dimensions: {
      individual: 77,
      leadership: 72,
      cultural: 68,
      embedding: 65,
      velocity: 70,
    },
    subdimensions: {
      changeReadiness: 85,
      learningAgility: 75,
      aiConfidence: 65,
      fearLevel: 70, // Inverted
      growthMindset: 90,
      aiLiteracy: 75,
      changeChampioning: 80,
      vulnerabilityIndex: 70,
      visionClarity: 65,
      coachingCapability: 70,
      psychologicalSafety: 75,
      experimentationCulture: 65,
      failureResilience: 70,
      collaborationScore: 68,
      recognitionSystems: 62,
      habitStrength: 60,
      reinforcementInfra: 65,
      accountability: 70,
      socialProof: 62,
      environmentalDesign: 68,
      decisionSpeed: 72,
      resourceFlexibility: 70,
      communicationEfficiency: 75,
      learningInfrastructure: 65,
      changeFatigue: 70,
    },
  },
  created_at: '2025-03-01T09:00:00Z',
  updated_at: '2025-03-01T10:30:00Z',
  completed_at: '2025-03-01T10:30:00Z',
}

export const mockInProgressAssessment = {
  id: 'assessment-in-progress',
  user_id: 'user-1',
  status: 'in_progress',
  current_dimension: 'leadership',
  answers: {
    'change-readiness-1': { value: 85, timestamp: '2025-03-01T10:00:00Z' },
    'learning-agility-1': { value: 75, timestamp: '2025-03-01T10:01:00Z' },
  },
  scores: null,
  created_at: '2025-03-01T09:00:00Z',
  updated_at: '2025-03-01T10:01:00Z',
  completed_at: null,
}

/**
 * Calculate dimension score based on answers
 */
export function calculateDimensionScore(
  answers: Record<string, AssessmentAnswer>,
  dimension: string
): number {
  const questions = mockAssessmentQuestions[dimension as keyof typeof mockAssessmentQuestions]
  if (!questions) return 0

  let totalScore = 0
  let totalWeight = 0

  questions.forEach((q) => {
    const answer = answers[q.id]
    if (answer) {
      let value = answer.value
      // Invert fear level (lower fear = higher adaptability)
      if (q.subdimension === 'fearLevel') {
        value = 100 - value
      }
      totalScore += value * q.weight
      totalWeight += q.weight
    }
  })

  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0
}

/**
 * Calculate overall assessment score
 */
export function calculateOverallScore(dimensionScores: Record<string, number>): number {
  const scores = Object.values(dimensionScores)
  const total = scores.reduce((sum, score) => sum + score, 0)
  return Math.round(total / scores.length)
}
