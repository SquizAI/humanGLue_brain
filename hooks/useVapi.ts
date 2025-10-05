'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Vapi from '@vapi-ai/web'
import { AssessmentChatFlow } from '../lib/assessment/assessmentChatFlow'
import { assessmentDimensions } from '../lib/assessment/dimensions'

interface UseVapiOptions {
  publicKey: string
  onCallStart?: () => void
  onCallEnd?: () => void
  onMessage?: (message: any) => void
  onError?: (error: any) => void
  onAssessmentUpdate?: (data: any) => void
}

interface AssessmentState {
  isActive: boolean
  currentDimension: number
  currentQuestion: number
  responses: Map<string, any>
  progress: {
    completed: number
    total: number
    currentCategory: string
  }
}

export function useVapi(publicKey: string, options?: Partial<UseVapiOptions>) {
  const [vapi, setVapi] = useState<Vapi | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assessmentState, setAssessmentState] = useState<AssessmentState>({
    isActive: false,
    currentDimension: 0,
    currentQuestion: 0,
    responses: new Map(),
    progress: {
      completed: 0,
      total: assessmentDimensions.length,
      currentCategory: 'technical'
    }
  })
  
  const vapiRef = useRef<Vapi | null>(null)
  const assessmentFlowRef = useRef<AssessmentChatFlow>(new AssessmentChatFlow())

  const startAssessment = useCallback(async () => {
    if (!vapi) return

    const assistantConfig = {
      model: {
        provider: "openai" as const,
        model: "gpt-4" as const,
        messages: [
          {
            role: "system" as const,
            content: `You are HumanGlue's AI Maturity Assessment Assistant. Your role is to guide users through a comprehensive AI maturity assessment.

ASSESSMENT STRUCTURE:
- 23 dimensions across 4 categories: Technical, Human, Business, AI Adoption
- Each dimension has specific questions with different types: scale (0-10), yes/no, multiple choice

CONVERSATION FLOW:
1. Welcome and collect basic info (name, company)
2. Understand their AI challenges/goals
3. Guide through assessment questions systematically
4. Provide encouragement and context for each section
5. Generate personalized maturity report

ASSESSMENT CATEGORIES:
1. Technical (5 dimensions): Infrastructure, Data Quality, Security, Integration, Scalability
2. Human (5 dimensions): Leadership, Culture, Skills, Collaboration, Employee Experience  
3. Business (8 dimensions): Strategy, Process, Customer Focus, Innovation, Financial, Partners, Risk
4. AI Adoption (5 dimensions): Use Cases, MLOps, Governance, Data Science, Automation

KEY INSTRUCTIONS:
- Ask ONE question at a time
- Provide context for why each question matters
- Use encouraging tone throughout
- Explain progress between categories
- Handle various answer formats naturally
- Store responses in structured format
- Generate final maturity level (0-9) with detailed insights

Start with a warm welcome and begin the assessment flow.`
          }
        ]
      },
      voice: {
        provider: "playht" as const,
        voiceId: "jennifer"
      },
      firstMessage: "Hello! I'm your AI Maturity Assessment guide. I'll help you understand your organization's AI readiness and create a personalized transformation roadmap. This assessment takes about 10-15 minutes and covers four key areas. Let's start with your name - what should I call you?",
      functions: [
        {
          name: "process_assessment_response",
          description: "Process and store assessment responses",
          parameters: {
            type: "object" as const,
            properties: {
              questionId: { type: "string" as const },
              response: { type: "string" as const },
              dimensionId: { type: "string" as const },
              category: { type: "string" as const }
            },
            required: ["questionId", "response", "dimensionId", "category"]
          }
        },
        {
          name: "advance_assessment",
          description: "Move to next question or complete assessment",
          parameters: {
            type: "object" as const,
            properties: {
              action: { type: "string" as const, enum: ["next_question", "next_dimension", "complete"] },
              currentProgress: { type: "object" as const }
            }
          }
        },
        {
          name: "generate_maturity_report",
          description: "Generate final AI maturity assessment report",
          parameters: {
            type: "object" as const, 
            properties: {
              responses: { type: "object" as const },
              organizationInfo: { type: "object" as const }
            }
          }
        }
      ]
    } as any // Temporary type assertion to bypass strict typing

    try {
      await vapi.start(assistantConfig)
      setAssessmentState(prev => ({ ...prev, isActive: true }))
    } catch (err) {
      console.error('Failed to start assessment:', err)
      setError('Failed to start voice assessment')
    }
  }, [vapi])

  const stopAssessment = useCallback(() => {
    if (vapi) {
      vapi.stop()
      setAssessmentState(prev => ({ ...prev, isActive: false }))
    }
  }, [vapi])

  useEffect(() => {
    try {
      const vapiInstance = new Vapi(publicKey)
      vapiRef.current = vapiInstance
      setVapi(vapiInstance)
      setIsLoading(false)

      // Enhanced message handler for assessment
      vapiInstance.on('message', (message) => {
        console.log('Vapi message:', message)
        
        if (message.type === 'function-call') {
          handleAssessmentFunction(message)
        }
        
        if (options?.onMessage) {
          options.onMessage(message)
        }
      })

      // Set up other event listeners
      if (options?.onCallStart) {
        vapiInstance.on('call-start', options.onCallStart)
      }

      if (options?.onCallEnd) {
        vapiInstance.on('call-end', () => {
          setAssessmentState(prev => ({ ...prev, isActive: false }))
          if (options.onCallEnd) options.onCallEnd()
        })
      }

      if (options?.onError) {
        vapiInstance.on('error', options.onError)
      }

      vapiInstance.on('error', (err) => {
        console.error('Vapi error:', err)
        setError(err.message || 'An error occurred with Vapi')
      })

    } catch (err) {
      console.error('Failed to initialize Vapi:', err)
      setError('Failed to initialize voice assistant')
      setIsLoading(false)
    }

    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop()
        vapiRef.current = null
      }
    }
  }, [publicKey])

  const handleAssessmentFunction = useCallback((message: any) => {
    const { functionCall } = message
    
    switch (functionCall.name) {
      case 'process_assessment_response':
        const { questionId, response, dimensionId, category } = functionCall.parameters
        
        setAssessmentState(prev => {
          const newResponses = new Map(prev.responses)
          newResponses.set(questionId, response)
          
          return {
            ...prev,
            responses: newResponses,
            progress: {
              ...prev.progress,
              completed: newResponses.size,
              currentCategory: category
            }
          }
        })
        
        if (options?.onAssessmentUpdate) {
          options.onAssessmentUpdate({
            questionId,
            response,
            dimensionId,
            category,
            progress: assessmentState.progress
          })
        }
        break
        
      case 'advance_assessment':
        const { action, currentProgress } = functionCall.parameters
        
        setAssessmentState(prev => ({
          ...prev,
          currentDimension: action === 'next_dimension' ? prev.currentDimension + 1 : prev.currentDimension,
          currentQuestion: action === 'next_question' ? prev.currentQuestion + 1 : 0,
          progress: currentProgress || prev.progress
        }))
        break
        
      case 'generate_maturity_report':
        // Assessment completed - trigger report generation
        if (options?.onAssessmentUpdate) {
          options.onAssessmentUpdate({
            type: 'assessment_complete',
            responses: Object.fromEntries(assessmentState.responses),
            organizationInfo: functionCall.parameters.organizationInfo
          })
        }
        break
    }
  }, [assessmentState.progress, options])

  return {
    vapi,
    isLoading,
    error,
    assessmentState,
    startAssessment,
    stopAssessment
  }
}