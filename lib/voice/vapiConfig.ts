/**
 * Vapi Configuration for HumanGlue AI Maturity Assessment
 */

import { assessmentDimensions, getDimensionsByCategory } from '../assessment/dimensions'

export const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || ''

export const createAssessmentConfig = () => {
  const technicalDimensions = getDimensionsByCategory('technical')
  const humanDimensions = getDimensionsByCategory('human') 
  const businessDimensions = getDimensionsByCategory('business')
  const aiAdoptionDimensions = getDimensionsByCategory('ai_adoption')

  const allQuestions = assessmentDimensions.flatMap(d => 
    d.questions.map(q => ({
      id: q.id,
      text: q.text,
      type: q.type,
      options: q.options,
      dimensionId: d.id,
      dimensionName: d.name,
      category: d.category,
      weight: q.weight
    }))
  )

  return {
    model: {
      provider: "openai",
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are HumanGlue's AI Maturity Assessment Assistant conducting a comprehensive voice-based assessment.

ASSESSMENT OVERVIEW:
You will guide users through a 23-dimension assessment across 4 categories:
1. TECHNICAL (5 dimensions): ${technicalDimensions.map(d => d.name).join(', ')}
2. HUMAN (5 dimensions): ${humanDimensions.map(d => d.name).join(', ')}
3. BUSINESS (8 dimensions): ${businessDimensions.map(d => d.name).join(', ')}
4. AI ADOPTION (5 dimensions): ${aiAdoptionDimensions.map(d => d.name).join(', ')}

CONVERSATION STRUCTURE:
1. Welcome & Personal Info (2-3 minutes)
   - Get name, company, role
   - Understand their AI challenges/goals
   - Set expectations for assessment

2. Technical Foundation (3-4 minutes)
   - Infrastructure readiness
   - Data quality and governance
   - Security and compliance
   - Integration capabilities
   - Scalability

3. Human Capital (3-4 minutes)  
   - Leadership vision and commitment
   - Organizational culture
   - Skills and talent
   - Collaboration effectiveness
   - Employee experience

4. Business Alignment (4-5 minutes)
   - Strategic alignment
   - Process optimization
   - Customer centricity
   - Innovation capability
   - Financial performance
   - Partner ecosystem
   - Risk management

5. AI Adoption (3-4 minutes)
   - Current AI use cases
   - ML operations maturity
   - AI governance
   - Data science capabilities
   - Automation level

6. Results & Recommendations (2-3 minutes)
   - Calculate maturity level (0-9)
   - Provide key insights
   - Suggest next steps

QUESTION TYPES & HANDLING:
- Scale questions (0-10): Accept numbers, verbal descriptions ("pretty good" = 7, "excellent" = 9)
- Yes/No: Accept variations ("absolutely", "not really", "somewhat")
- Multiple choice: Read options, accept partial matches
- Text: Capture and categorize responses

CONVERSATION GUIDELINES:
- Ask ONE question at a time
- Provide context for why each question matters
- Use encouraging, professional tone
- Acknowledge responses positively
- Transition smoothly between categories
- Give progress updates ("We're about halfway through...")
- Handle unclear answers by asking for clarification

PROGRESS TRACKING:
Call process_assessment_response() after each answer with:
- questionId: The specific question identifier
- response: User's processed answer
- dimensionId: Which dimension this belongs to
- category: Which category (technical/human/business/ai_adoption)

Call advance_assessment() when moving to:
- Next question: action: "next_question"
- Next dimension: action: "next_dimension" 
- Complete assessment: action: "complete"

FINAL REPORT:
When assessment is complete, call generate_maturity_report() with all responses and organization info to trigger report generation.

SAMPLE QUESTION FLOWS:
"Now let's explore your technical foundation. This helps us understand if your systems can support AI initiatives. First, what's your current cloud adoption level - are you primarily on-premise, using hybrid cloud, cloud-first, multi-cloud, or fully cloud-native?"

"Great! That gives us good insight into your infrastructure. Now, thinking about your data - the fuel that powers AI - how would you rate your data architecture maturity on a scale of 1 to 10, where 1 is very basic and 10 is highly sophisticated?"

Start the assessment with a warm, professional welcome.`
        }
      ]
    },
    voice: {
      provider: "playht",
      voiceId: "jennifer",
      speed: 1.0,
      stability: 0.8,
      similarityBoost: 0.8
    },
    firstMessage: "Hello! I'm your AI Maturity Assessment guide from HumanGlue. I'm here to help you understand your organization's AI readiness and create a personalized transformation roadmap. This comprehensive assessment takes about 15-20 minutes and covers four key areas of AI maturity. Before we begin, could you tell me your name and what company you're with?",
    functions: [
      {
        name: "process_assessment_response",
        description: "Process and store user's assessment response",
        parameters: {
          type: "object",
          properties: {
            questionId: { 
              type: "string",
              description: "Unique identifier for the question"
            },
            response: { 
              type: "string",
              description: "User's processed response"
            },
            dimensionId: { 
              type: "string",
              description: "Which assessment dimension this belongs to"
            },
            category: { 
              type: "string",
              enum: ["technical", "human", "business", "ai_adoption"],
              description: "Assessment category"
            },
            rawAnswer: {
              type: "string", 
              description: "User's original verbal response"
            },
            questionType: {
              type: "string",
              enum: ["scale", "yes_no", "multiple_choice", "text"],
              description: "Type of question answered"
            }
          },
          required: ["questionId", "response", "dimensionId", "category"]
        }
      },
      {
        name: "advance_assessment",
        description: "Move assessment forward to next stage",
        parameters: {
          type: "object",
          properties: {
            action: { 
              type: "string",
              enum: ["next_question", "next_dimension", "next_category", "complete"],
              description: "How to advance the assessment"
            },
            currentProgress: {
              type: "object",
              properties: {
                currentDimension: { type: "number" },
                currentQuestion: { type: "number" },
                currentCategory: { type: "string" },
                totalCompleted: { type: "number" },
                totalQuestions: { type: "number" }
              }
            },
            nextQuestion: {
              type: "object",
              properties: {
                id: { type: "string" },
                text: { type: "string" },
                type: { type: "string" },
                options: { type: "array", items: { type: "string" } },
                dimensionName: { type: "string" },
                category: { type: "string" }
              }
            }
          },
          required: ["action"]
        }
      },
      {
        name: "store_organization_info",
        description: "Store user and organization information collected during assessment",
        parameters: {
          type: "object",
          properties: {
            userName: { type: "string" },
            company: { type: "string" },
            role: { type: "string" },
            industry: { type: "string" },
            companySize: { type: "string" },
            primaryChallenges: { 
              type: "array",
              items: { type: "string" }
            },
            aiGoals: {
              type: "array", 
              items: { type: "string" }
            }
          }
        }
      },
      {
        name: "generate_maturity_report",
        description: "Generate final AI maturity assessment report",
        parameters: {
          type: "object",
          properties: {
            assessmentId: { type: "string" },
            responses: { 
              type: "object",
              description: "All assessment responses keyed by questionId"
            },
            organizationInfo: {
              type: "object",
              description: "Organization details collected during assessment"
            },
            maturityLevel: {
              type: "number",
              description: "Overall maturity level 0-9"
            },
            categoryScores: {
              type: "object",
              properties: {
                technical: { type: "number" },
                human: { type: "number" },
                business: { type: "number" },
                ai_adoption: { type: "number" }
              }
            },
            keyInsights: {
              type: "array",
              items: { type: "string" },
              description: "Key insights from assessment"
            },
            recommendations: {
              type: "array", 
              items: { type: "string" },
              description: "Priority recommendations"
            }
          },
          required: ["assessmentId", "responses", "organizationInfo"]
        }
      }
    ],
    endCallFunctionEnabled: false,
    recordingEnabled: true,
    silenceTimeoutSeconds: 30,
    maxDurationSeconds: 1800, // 30 minutes max
    backgroundSound: "off"
  }
}