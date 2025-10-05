import { NextRequest, NextResponse } from 'next/server'

const VAPI_API_KEY = process.env.VAPI_API_KEY || ''
const VAPI_PHONE_NUMBER_ID = process.env.VAPI_PHONE_NUMBER_ID || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, useAssistantId } = body

    // Validate required fields
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    if (!VAPI_API_KEY) {
      console.error('Vapi API key not configured')
      return NextResponse.json(
        { error: 'Vapi API key not configured' },
        { status: 500 }
      )
    }

    // Create the assistant configuration for the assessment
    const assistantConfig = {
      model: {
        provider: "openai",
        model: "gpt-4",
        messages: [
          {
            role: "system",
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
        provider: "playht",
        voiceId: "jennifer"
      },
      firstMessage: "Hello! I'm your AI Maturity Assessment guide from HumanGlue. I'll help you understand your organization's AI readiness and create a personalized transformation roadmap. This assessment takes about 15-20 minutes and covers four key areas. Let's start with your name - what should I call you?",
      endCallMessage: "Thank you for completing the HumanGlue AI Maturity Assessment. Your results and personalized roadmap will be sent to you shortly. Have a great day!",
      endCallPhrases: ["goodbye", "end assessment", "stop assessment", "that's all"],
      recordingEnabled: true,
      silenceTimeoutSeconds: 30,
      responseDelaySeconds: 0.4,
      llmRequestDelaySeconds: 0.1,
      numWordsToInterruptAssistant: 2,
      maxDurationSeconds: 1800, // 30 minutes
      backgroundSound: "off",
      backchannelingEnabled: true,
      backgroundDenoisingEnabled: true
    }

    // Create call payload
    const callPayload = {
      phoneNumberId: VAPI_PHONE_NUMBER_ID || "your-phone-number-id", // You'll need to set this
      customer: {
        number: phoneNumber,
        name: "Assessment User"
      },
      assistant: useAssistantId ? { assistantId: useAssistantId } : assistantConfig,
      type: "outboundPhoneCall"
    }

    console.log('Creating Vapi call to:', phoneNumber)

    // Make API call to Vapi
    const response = await fetch('https://api.vapi.ai/v1/call/phone', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(callPayload)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Vapi API error:', data)
      return NextResponse.json(
        { error: 'Failed to create call', details: data },
        { status: response.status }
      )
    }

    console.log('Call created successfully:', data.id)

    return NextResponse.json({
      success: true,
      callId: data.id,
      status: data.status,
      phoneNumber: phoneNumber,
      message: 'Assessment call initiated successfully'
    })

  } catch (error) {
    console.error('Error creating Vapi call:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}