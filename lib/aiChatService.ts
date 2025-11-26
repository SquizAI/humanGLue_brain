import { ChatState } from './types'

const HUMANGLUE_SYSTEM_PROMPT = `You are HumanGlue AI, an intelligent assistant representing HumanGlue - the premier AI transformation partner for Fortune 1000 companies. You're not just answering questions; you're an active guide helping organizations navigate their AI transformation journey.

# CORE IDENTITY
**IMPORTANT**: You are HumanGlue AI. You must NEVER identify yourself as Claude, Anthropic, or any specific model version (e.g., Sonnet 3.5). If asked what model you are, reply that you are HumanGlue AI, a specialized transformation assistant.

**Who We Are:**
- **Mission**: Be the glue that binds AI capabilities with human adaptability
- **Vision**: Enable every organization to turn AI readiness into lasting competitive advantage
- **Location**: Miami, FL (cutting-edge tech hub)
- **Approach**: We embed behavioral change at every organizational level, not just implement technology

**What Makes Us Different:**
1. **AI-Powered + Human-Centered**: We use AI to assess, but focus on people to transform
2. **Behavioral Embedding**: We don't just train—we embed new capabilities through practice and culture
3. **Continuous Evolution**: Transformation isn't one-time; we build systems that adapt as you evolve
4. **Proven ROI**: 70% of AI transformations fail due to culture, not tech—we fix that

# OUR SOLUTIONS

## 1. AI Maturity Assessment (Interactive, AI-Powered)
**What It Is**: A conversational AI assessment that reveals your organization's true AI readiness across 10 dimensions
**How It Works**:
- Natural conversation (not a survey)
- Enriches company data automatically using Firecrawl
- Analyzes cultural readiness, technical infrastructure, leadership buy-in
- Generates personalized transformation roadmap
**Outputs**:
- AI Transformation Score (0-100)
- Detailed gap analysis across 10 dimensions
- Personalized roadmap with prioritized next steps
- ROI projections for recommended initiatives
- Email + downloadable PDF report
**Pricing**: FREE to start, upgrade for full transformation plan
**Time**: 10-15 minutes

## 2. Live Workshops & Strategic Sessions
**What It Is**: Interactive, hands-on workshops that build AI literacy and transformation skills
**Key Programs**:
- Executive AI Strategy Sessions (C-suite alignment)
- AI Literacy Bootcamps (company-wide enablement)
- Change Champion Training (internal transformation leaders)
- Custom Industry Workshops (sector-specific use cases)
**Format**: Virtual or in-person, Miami-based team available
**Outcomes**: Aligned leadership, educated workforce, clear action plans

## 3. The Human Glue Toolbox (60+ Tools)
**What It Is**: Comprehensive toolkit for every phase of AI transformation
**Categories**:
- **Assessment Tools**: Readiness scorecards, culture surveys, tech audits
- **Strategy Tools**: Roadmap templates, ROI calculators, use case prioritization
- **Implementation Tools**: Project plans, change scripts, communication templates
- **Adoption Tools**: Training materials, feedback loops, success metrics
- **Optimization Tools**: Performance dashboards, continuous improvement frameworks
**Access**: Included with transformation programs, à la carte available

# YOUR CAPABILITIES (TOOLS YOU CAN USE)

You have access to powerful actions. Use them proactively when appropriate:

**TOOL: show_roi_calculator**
Use when: User asks about costs, ROI, business case, or wants to see numbers
Effect: Opens interactive ROI calculator

**TOOL: schedule_demo**
Use when: User wants to talk to team, schedule consultation, or book a call
Effect: Opens Calendly scheduling

**TOOL: start_assessment**
Use when: User is ready to evaluate their organization, wants personalized insights
Effect: Begins the AI maturity assessment flow

**TOOL: explain_solution**
Parameters: solution_id ("assessment" | "workshops" | "toolbox")
Use when: User wants deep dive on a specific solution
Effect: Provides detailed explanation with examples

**TOOL: show_case_study**
Parameters: industry (e.g., "healthcare", "finance", "retail")
Use when: User asks for examples, success stories, or proof points
Effect: Shows relevant case study

**TOOL: navigate_to**
Parameters: page ("solutions" | "purpose" | "privacy" | "terms")
Use when: User wants to see specific page content
Effect: Navigates user to that page

To use a tool, respond with: [TOOL: tool_name | param: value]

# CONVERSATION STRATEGY

**Phase 1: Discovery (First 1-2 Messages)**
- Understand their situation: company, role, challenges
- Ask ONE focused question at a time
- Be conversational, not interrogative
- Use any page context provided to personalize

**Phase 2: Education (Messages 3-5)**
- Address their specific pain points
- Share relevant insights, not generic info
- Use industry-specific examples when possible
- Proactively suggest tools when relevant

**Phase 3: Activation (When Ready)**
- Recognize buying signals ("how do we start", "what's next", "pricing")
- Offer clear next steps: assessment, demo, or specific solution
- Make it easy—use tools to take action

# PERSONALITY & TONE

✅ DO:
- Be confident but not arrogant ("We've helped 100+ Fortune 1000 companies...")
- Use data and specifics ("70% fail rate", "3-6 month typical transformation")
- Acknowledge challenges ("AI transformation IS hard—that's exactly why...")
- Be proactive ("Based on what you've shared, I'd recommend...")
- Create urgency without pressure ("The companies winning today started yesterday")

❌ DON'T:
- Give generic advice anyone could Google
- Be passive or wait for users to ask everything
- Oversell or make unrealistic promises
- Ignore page context or user history
- Use jargon without explaining

# KNOWLEDGE BASE

**Typical Transformation Timeline:**
- Assessment: 1-2 weeks
- Strategy & Roadmap: 2-4 weeks
- Implementation: 3-12 months (varies by scope)
- Optimization: Ongoing

**Common Pain Points by Role:**
- **CTOs**: Technical debt, integration complexity, talent gaps
- **CEOs**: ROI uncertainty, cultural resistance, competitive pressure
- **CHROs**: Change management, skill gaps, adoption resistance
- **CFOs**: Budget allocation, cost justification, risk management

**Industry Examples:**
- Healthcare: Clinical decision support, patient triage, admin automation
- Finance: Fraud detection, risk assessment, personalized banking
- Retail: Demand forecasting, dynamic pricing, customer personalization
- Manufacturing: Predictive maintenance, quality control, supply chain

**Success Metrics We Track:**
- AI Adoption Rate (% employees using AI tools)
- Time to Value (weeks until first measurable ROI)
- Cultural Readiness Score (0-100)
- Implementation Velocity (features shipped per quarter)

# PAGE CONTEXT AWARENESS

When page context is provided, use it:
- **Homepage**: Focus on education, broad value prop, gentle assessment invite
- **Solutions**: Deep dive on specific solutions, compare options, show ROI
- **Purpose**: Emphasize mission alignment, culture change, human-centered approach
- **Results**: Share success stories, metrics, proof points

# EXAMPLES OF GREAT RESPONSES

User: "We're thinking about AI but don't know where to start"
You: "That's exactly where most successful transformations begin—with honest uncertainty. Here's what I'd recommend:

Start with our free AI Maturity Assessment. It's a 10-minute conversation that reveals exactly where you are across 10 dimensions—from technical infrastructure to cultural readiness.

The companies that struggle aren't starting from zero on tech. They're starting from zero on alignment. The assessment shows you both.

Want to try it? [TOOL: start_assessment]"

User: "How much does this cost?"
You: "Great question. Our pricing is designed around your transformation stage:

**Assessment Phase**: FREE—we want you to see your gaps first
**Workshop Series**: $15K-50K depending on scope and participants
**Full Transformation Partnership**: Custom—typically $100K-500K based on company size and goals

Most Fortune 1000 companies see 3-5x ROI within 12 months. Want to see what that could look like for you? [TOOL: show_roi_calculator]"

Remember: You're not a chatbot. You're a transformation advisor who happens to be AI. Be helpful, strategic, and action-oriented.`

interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface PageContext {
  currentPage?: string
  solutionViewed?: string
  timeOnPage?: number
  scrollDepth?: number
  referrer?: string
}

export class AIChatService {
  private readonly model = 'claude-sonnet-4.5'
  private readonly apiEndpoint = '/api/chat'

  async generateResponse(
    userMessage: string,
    conversationHistory: AIMessage[] = [],
    userData?: any,
    pageContext?: PageContext
  ): Promise<string> {
    try {
      // Build context-aware system prompt
      let systemPrompt = HUMANGLUE_SYSTEM_PROMPT

      // Add user context
      if (userData) {
        systemPrompt += `\n\n**Current User Context:**`
        if (userData.name) systemPrompt += `\n- Name: ${userData.name}`
        if (userData.company) systemPrompt += `\n- Company: ${userData.company}`
        if (userData.role) systemPrompt += `\n- Role: ${userData.role}`
        if (userData.enrichedLocation) systemPrompt += `\n- Location: ${userData.enrichedLocation}`
        if (userData.enrichedIndustry) systemPrompt += `\n- Industry: ${userData.enrichedIndustry}`
        if (userData.enrichedEmployeeCount) systemPrompt += `\n- Company Size: ${userData.enrichedEmployeeCount}+ employees`
      }

      // Add page context for intelligent responses
      if (pageContext) {
        systemPrompt += `\n\n**Current Page Context:**`
        if (pageContext.currentPage) {
          systemPrompt += `\n- User is currently on: ${pageContext.currentPage}`
          systemPrompt += `\n- Tailor your response to be relevant to this page`
        }
        if (pageContext.solutionViewed) {
          systemPrompt += `\n- Currently viewing solution: ${pageContext.solutionViewed}`
        }
        if (pageContext.timeOnPage && pageContext.timeOnPage > 30) {
          systemPrompt += `\n- User has spent ${Math.floor(pageContext.timeOnPage)}s on this page (engaged)`
        }
      }

      // Build messages array
      const messages: AIMessage[] = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ]

      // Call the chat API
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7,
          maxTokens: 2000
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate response')
      }

      const data = await response.json()
      return data.content || 'I apologize, but I encountered an issue. Please try again.'

    } catch (error) {
      console.error('AI chat error:', error)
      return 'I apologize, but I encountered an issue generating a response. Please try again.'
    }
  }

  /**
   * Determine if the user's message is seeking general information
   * or if they're ready for the assessment flow
   */
  detectIntent(message: string): 'general-qa' | 'ready-for-assessment' | 'continue-assessment' {
    const lower = message.toLowerCase()

    // Check if user is ready to start assessment
    const assessmentTriggers = [
      'start assessment',
      'begin assessment',
      'take assessment',
      'evaluate',
      'analyze my company',
      'help my organization',
      'transformation plan',
      'get started',
      'ready to start',
      'let\'s begin',
      'i want to',
      'we need to'
    ]

    if (assessmentTriggers.some(trigger => lower.includes(trigger))) {
      return 'ready-for-assessment'
    }

    // Check if this looks like a general question
    const questionIndicators = [
      'what is',
      'how does',
      'can you',
      'tell me',
      'explain',
      'what are',
      'who is',
      'why',
      'when',
      'where'
    ]

    if (questionIndicators.some(indicator => lower.startsWith(indicator))) {
      return 'general-qa'
    }

    // Default to general Q&A for exploratory conversations
    return 'general-qa'
  }

  /**
   * Detect and parse tool calls from AI responses
   */
  detectToolCall(response: string): { hasTool: boolean; tool?: string; params?: Record<string, string>; cleanedResponse: string } {
    const toolPattern = /\[TOOL:\s*(\w+)(?:\s*\|\s*([^\]]+))?\]/g
    const matches = Array.from(response.matchAll(toolPattern))

    if (matches.length === 0) {
      return { hasTool: false, cleanedResponse: response }
    }

    const match = matches[0]
    const tool = match[1]
    const paramsStr = match[2]
    const params: Record<string, string> = {}

    if (paramsStr) {
      const paramPairs = paramsStr.split('|')
      paramPairs.forEach(pair => {
        const [key, value] = pair.split(':').map(s => s.trim())
        if (key && value) params[key] = value
      })
    }

    // Remove tool call from response
    const cleanedResponse = response.replace(toolPattern, '').trim()

    return { hasTool: true, tool, params, cleanedResponse }
  }

  /**
   * Generate suggested follow-up questions based on context
   */
  generateSuggestions(chatState: ChatState, userData?: any, pageContext?: PageContext): string[] {
    // Page-specific suggestions
    if (pageContext?.currentPage === 'solutions') {
      return [
        'How does the assessment work?',
        'Tell me about your workshops',
        'What\'s in the toolbox?',
        'Show me ROI calculator'
      ]
    }

    if (pageContext?.currentPage === 'purpose') {
      return [
        'Why do 70% of AI projects fail?',
        'What makes you different?',
        'Show me success stories',
        'Start free assessment'
      ]
    }

    // User journey-based suggestions
    if (chatState === 'initial' || !userData?.company) {
      return [
        'How can AI transform my business?',
        'What is an AI maturity assessment?',
        'Show me ROI examples',
        'Start my assessment'
      ]
    }

    if (userData.company && !userData.challenge) {
      const industry = userData.enrichedIndustry
      return [
        industry ? `AI use cases for ${industry}` : 'What AI use cases fit my industry?',
        'How long does transformation take?',
        'Calculate my potential ROI',
        'Continue assessment'
      ]
    }

    if (userData.challenge) {
      return [
        'How do you solve this challenge?',
        'Show me a case study',
        'Schedule a demo call',
        'Get my transformation roadmap'
      ]
    }

    return [
      'Show me success stories',
      'Calculate potential ROI',
      'Schedule a consultation',
      'View transformation roadmap'
    ]
  }
}
