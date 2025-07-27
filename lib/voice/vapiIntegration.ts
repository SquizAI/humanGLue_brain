/**
 * Vapi Voice Agent Integration for AI Maturity Assessment
 */

import { AssessmentDimension } from '../assessment/dimensions'
import { AssessmentQuestion } from '../assessment/dimensions'

export interface VapiConfig {
  publicKey: string
  privateKey: string
  assistantId?: string
}

export interface VapiAssessmentAgent {
  id: string
  name: string
  systemPrompt: string
  firstMessage: string
  voice: {
    provider: 'elevenlabs' | 'openai' | 'playht'
    voiceId: string
    settings?: {
      stability?: number
      similarityBoost?: number
      speed?: number
    }
  }
  model: {
    provider: 'openai' | 'anthropic'
    model: string
    temperature?: number
  }
  endCallFunctions?: string[]
  recordingEnabled?: boolean
  hipaaEnabled?: boolean
}

export const VAPI_CONFIG: VapiConfig = {
  publicKey: '3ed5bd67-496a-42c8-955c-d7ac483a7d34',
  privateKey: '0be862d8-7e91-4f40-b559-5a25b33525c0',
  assistantId: 'bc8faa11-a790-4e06-8cbd-4083edd460d4' // MCP-created assistant
}

export const ASSESSMENT_VOICE_AGENT: VapiAssessmentAgent = {
  id: 'humanglue-assessment-agent',
  name: 'HumanGlue AI Maturity Assessment Assistant',
  systemPrompt: `You are an expert AI transformation consultant conducting an AI maturity assessment for HumanGlue. 
  
Your role is to:
1. Guide users through the assessment in a conversational, friendly manner
2. Ask one question at a time and wait for their response
3. Provide context for why each question matters
4. Clarify answers if needed
5. Keep the conversation flowing naturally
6. Be encouraging and highlight strengths when appropriate
7. Maintain a professional yet warm tone

Important guidelines:
- Never skip questions or rush the user
- If they need clarification, explain in simple terms
- If they seem uncertain, help them think through their answer
- Keep responses concise (under 30 seconds of speech)
- Use the user's name when you have it
- Acknowledge their industry/company context in your responses`,

  firstMessage: "Hello! I'm your AI transformation guide from HumanGlue. I'm here to help assess your organization's AI readiness through a quick conversation. This typically takes about 10 to 15 minutes. Before we begin, could you tell me your name and a bit about your organization?",

  voice: {
    provider: 'elevenlabs',
    voiceId: 'rachel', // Professional female voice
    settings: {
      stability: 0.8,
      similarityBoost: 0.9,
      speed: 1.0
    }
  },

  model: {
    provider: 'openai',
    model: 'gpt-4-turbo',
    temperature: 0.7
  },

  recordingEnabled: true,
  hipaaEnabled: false,
  
  endCallFunctions: ['completeAssessment', 'scheduleFollowUp']
}

// Question templates for voice interaction
export const VOICE_QUESTION_TEMPLATES = {
  scale: (question: AssessmentQuestion, dimension: string) => `
    For ${dimension}, I'd like to understand: ${question.text}
    On a scale of 0 to 10, where 0 means "not at all" and 10 means "fully implemented",
    how would you rate your organization?
  `,
  
  yes_no: (question: AssessmentQuestion, dimension: string) => `
    Let me ask about ${dimension}: ${question.text}
    Is this something your organization currently has in place?
  `,
  
  multiple_choice: (question: AssessmentQuestion, dimension: string) => `
    Regarding ${dimension}: ${question.text}
    Your options are: ${question.options?.join(', ')}
    Which best describes your organization?
  `,
  
  text: (question: AssessmentQuestion, dimension: string) => `
    I'd like to hear your thoughts on ${dimension}: ${question.text}
    Please share your experience or current approach.
  `
}

// Voice response handlers
export const VOICE_RESPONSE_HANDLERS = {
  handleScaleResponse: (response: string): number => {
    // Extract number from voice response
    const match = response.match(/\b([0-9]|10)\b/)
    if (match) {
      return parseInt(match[1])
    }
    
    // Handle word descriptions
    const wordToNumber: Record<string, number> = {
      'zero': 0, 'none': 0, 'nothing': 0,
      'one': 1, 'very little': 1, 'minimal': 1,
      'two': 2, 'little': 2,
      'three': 3, 'some': 3, 'a bit': 3,
      'four': 4, 'moderate': 4,
      'five': 5, 'half': 5, 'halfway': 5, 'middle': 5,
      'six': 6, 'above average': 6,
      'seven': 7, 'good': 7, 'well': 7,
      'eight': 8, 'very good': 8, 'strong': 8,
      'nine': 9, 'excellent': 9, 'almost complete': 9,
      'ten': 10, 'perfect': 10, 'fully': 10, 'complete': 10
    }
    
    const lowerResponse = response.toLowerCase()
    for (const [word, value] of Object.entries(wordToNumber)) {
      if (lowerResponse.includes(word)) {
        return value
      }
    }
    
    return 5 // Default middle value
  },
  
  handleYesNoResponse: (response: string): boolean => {
    const lowerResponse = response.toLowerCase()
    const yesIndicators = ['yes', 'yeah', 'yep', 'absolutely', 'definitely', 'certainly', 'of course', 'we do', 'we have', 'correct', 'that\'s right', 'affirmative']
    const noIndicators = ['no', 'nope', 'not really', 'not yet', 'we don\'t', 'we haven\'t', 'negative', 'not at all']
    
    for (const indicator of yesIndicators) {
      if (lowerResponse.includes(indicator)) return true
    }
    
    for (const indicator of noIndicators) {
      if (lowerResponse.includes(indicator)) return false
    }
    
    // If unclear, return null to prompt clarification
    return null as any
  },
  
  handleMultipleChoiceResponse: (response: string, options: string[]): string | null => {
    const lowerResponse = response.toLowerCase()
    
    // First try exact match
    for (const option of options) {
      if (lowerResponse.includes(option.toLowerCase())) {
        return option
      }
    }
    
    // Try partial matches
    for (const option of options) {
      const words = option.toLowerCase().split(' ')
      if (words.some(word => lowerResponse.includes(word))) {
        return option
      }
    }
    
    return null
  }
}

// Vapi function definitions for the assistant
export const VAPI_FUNCTIONS = [
  {
    name: 'saveAssessmentResponse',
    description: 'Save the user response to an assessment question',
    parameters: {
      type: 'object',
      properties: {
        questionId: { type: 'string' },
        dimensionId: { type: 'string' },
        response: { type: 'any' },
        responseType: { type: 'string', enum: ['scale', 'yes_no', 'multiple_choice', 'text'] }
      },
      required: ['questionId', 'dimensionId', 'response', 'responseType']
    }
  },
  {
    name: 'completeAssessment',
    description: 'Mark the assessment as complete and generate results',
    parameters: {
      type: 'object',
      properties: {
        organizationId: { type: 'string' }
      },
      required: ['organizationId']
    }
  },
  {
    name: 'scheduleFollowUp',
    description: 'Schedule a follow-up consultation',
    parameters: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        preferredTime: { type: 'string' },
        timezone: { type: 'string' }
      },
      required: ['email']
    }
  }
]

// Helper to create Vapi-compatible assessment configuration
export function createVapiAssessmentConfig(dimensions: AssessmentDimension[]) {
  const questions = dimensions.flatMap(dimension => 
    dimension.questions.map(question => ({
      dimensionId: dimension.id,
      dimensionName: dimension.name,
      question
    }))
  )
  
  return {
    assistant: ASSESSMENT_VOICE_AGENT,
    functions: VAPI_FUNCTIONS,
    metadata: {
      totalQuestions: questions.length,
      estimatedDuration: questions.length * 45, // 45 seconds per question average
      dimensions: dimensions.map(d => ({ id: d.id, name: d.name }))
    }
  }
}