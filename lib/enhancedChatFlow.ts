import { ChatState } from './types'
import { UserProfileBuilder, ProfileAnalysis } from './userProfile'
import { AIChatService } from './aiChatService'
import { Building2, Users, Target, TrendingUp, Briefcase, BarChart3, Zap, Brain, Phone, Mail, Globe, Calendar } from 'lucide-react'

interface ChatResponse {
  message: string
  nextState?: ChatState
  data?: any
  suggestions?: Array<{
    text: string
    icon?: any
    action?: string
  }>
  profileAnalysis?: ProfileAnalysis
  isAIResponse?: boolean
}

export class EnhancedChatFlow {
  private profileBuilder: UserProfileBuilder
  private aiService: AIChatService
  private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []

  constructor(initialData?: any) {
    this.profileBuilder = new UserProfileBuilder(initialData)
    this.aiService = new AIChatService()
  }

  getGreeting(): string {
    return "Welcome. I'm your AI transformation advisor. I can help you:\n\n• Assess your AI Capability\n• Determine Your AI Upskilling Needs\n• Calculate ROI for AI initiatives\n\nLet's start with your first name:"
  }

  /**
   * Detect if the input is a question/general query vs a direct answer to assessment
   */
  private isGeneralQuestion(input: string, currentState: ChatState): boolean {
    const lower = input.toLowerCase().trim()

    // Always treat question marks as questions
    if (input.includes('?')) {
      return true
    }

    // Question starters - these indicate informational queries
    const questionStarters = ['what', 'how', 'why', 'when', 'where', 'who', 'can', 'could', 'would', 'should', 'tell me', 'explain', 'show me', 'describe', 'is there', 'are there', 'do you', 'does']
    if (questionStarters.some(start => lower.startsWith(start))) {
      return true
    }

    // Check for assessment-specific response patterns
    // If the user is clearly answering with expected formats, it's NOT a question
    const assessmentPatterns = [
      /^\d+[-\+]?\s*(employees?|people|staff)?$/i, // "500 employees", "1000+", etc.
      /^(under|over|less than|more than)?\s*\$?\d+[km]?/i, // "$10M", "Under $100K", etc.
      /^\d+\s*(years?|months?)/i, // "5 years", "2 months"
      /^(yes|no|skip|none|prefer not to)/i, // Common short answers
      /^https?:\/\//i, // URLs
      /@.+\..+/, // Email addresses
      /^\+?\d[\d\s\-\(\)]+$/, // Phone numbers
    ]

    if (assessmentPatterns.some(pattern => pattern.test(input.trim()))) {
      return false // It's an assessment answer
    }

    // Short responses (< 4 words) during assessment are likely answers, not questions
    const wordCount = input.split(/\s+/).length
    if (wordCount <= 3 && currentState !== 'initial' && currentState !== 'greeting') {
      // However, check if it looks like a question anyway
      if (!questionStarters.some(start => lower.startsWith(start))) {
        return false // Likely an answer
      }
    }

    // During initial/greeting, most inputs are names (answers)
    if ((currentState === 'initial' || currentState === 'greeting') && wordCount <= 3) {
      // Unless they're explicitly asking a question
      if (!questionStarters.some(start => lower.startsWith(start))) {
        return false
      }
    }

    // Long conversational responses (> 15 words) that don't match assessment patterns
    // are likely questions or discussions
    if (wordCount > 15) {
      return true
    }

    return false
  }

  async processResponse(currentState: ChatState, input: string, userData: any): Promise<ChatResponse> {
    // Update profile builder with any existing data
    if (userData) {
      this.profileBuilder = new UserProfileBuilder(userData)
    }

    // Detect if this is a general question vs an assessment answer
    // Allow general questions during initial states or when explicitly asking
    if (this.isGeneralQuestion(input, currentState)) {
      // Add user message to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: input
      })

      // Generate AI response with user context
      const aiResponse = await this.aiService.generateResponse(
        input,
        this.conversationHistory,
        userData
      )

      // Add AI response to conversation history
      this.conversationHistory.push({
        role: 'assistant',
        content: aiResponse
      })

      // Generate contextual suggestions based on the conversation
      const suggestions = this.aiService.generateSuggestions(currentState, userData)

      return {
        message: aiResponse,
        data: userData, // Keep current state
        suggestions: suggestions.map(text => ({ text })),
        isAIResponse: true
      }
    }

    // Otherwise, continue with hardcoded assessment flow
    switch (currentState) {
      case 'initial':
      case 'greeting':
        return this.collectName(input)

      case 'collectingBasicInfo':
        return this.collectBasicInfo(input, userData)

      case 'collectingCompanyInfo':
        return this.collectCompanyInfo(input, userData)

      case 'collectingChallenges':
        return this.collectChallenges(input, userData)

      case 'collectingContactInfo':
        return this.collectContactInfo(input, userData)

      case 'performingAnalysis':
        return this.performAnalysis(input, userData)

      default:
        return this.handleGeneralQuery(input, userData)
    }
  }
  
  private collectName(firstName: string): ChatResponse {
    this.profileBuilder.collectBasicInfo({ name: firstName.trim() })

    return {
      message: `${firstName} - that's a crucial role for organizational adaptation.\n\nWhich department do you primarily work with?`,
      nextState: 'collectingBasicInfo',
      data: { name: firstName.trim(), stage: 'department' },
      suggestions: [
        { text: "Executive Leadership" },
        { text: "Human Resources" },
        { text: "Technology/IT" },
        { text: "Innovation/Strategy" }
      ]
    }
  }
  
  private collectBasicInfo(input: string, userData: any): ChatResponse {
    const stage = userData.stage

    switch (stage) {
      case 'department':
        this.profileBuilder.collectProfessionalInfo({ department: input })
        return {
          message: `Perfect. ${input} is essential for modern organizational transformation.\n\nWhat's your current role or job title?`,
          data: { ...userData, department: input, stage: 'role' },
          suggestions: [
            { text: "Chief Executive Officer" },
            { text: "Chief Technology Officer" },
            { text: "Chief People Officer" },
            { text: "VP of Operations" },
            { text: "Director of Innovation" }
          ]
        }

      case 'role':
        this.profileBuilder.collectProfessionalInfo({ role: input })
        return {
          message: `Great. How many years have you been in ${input} or similar leadership roles?`,
          data: { ...userData, role: input, stage: 'yearsInRole' },
          suggestions: [
            { text: "Less than 1 year" },
            { text: "1-2 years" },
            { text: "3-5 years" },
            { text: "5-10 years" },
            { text: "10+ years" }
          ]
        }

      case 'yearsInRole':
        const years = this.parseYears(input)
        this.profileBuilder.collectProfessionalInfo({ yearsInRole: years })
        return {
          message: `${years} years of experience - that's valuable perspective!\n\nNow, let's talk about your organization. What's your company name?`,
          nextState: 'collectingCompanyInfo',
          data: { ...userData, yearsInRole: years, stage: 'company' },
          suggestions: []
        }
      
      default:
        return this.collectCompanyInfo(input, userData)
    }
  }
  
  private collectCompanyInfo(input: string, userData: any): ChatResponse {
    const stage = userData.stage || 'company'

    switch (stage) {
      case 'company':
        this.profileBuilder.collectCompanyInfo({ company: input })

        return {
          message: `${input} - I'd love to learn more about your organization.\n\nWhat's your company's website? This helps me provide industry-specific insights.`,
          data: { ...userData, company: input, stage: 'companyUrl' },
          suggestions: []
        }

      case 'companyUrl':
        const url = this.cleanUrl(input)
        this.profileBuilder.collectCompanyInfo({ companyUrl: url })

        // Trigger enrichment and website analysis
        if (url && url !== 'skip') {
          this.profileBuilder.enrichFromWebsite(url)

          // Trigger background enrichment via API
          fetch('/api/enrich-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              companyName: userData.company,
              personName: userData.name,
              companyUrl: url
            })
          })
            .then(res => res.json())
            .then(enrichedData => {
              if (enrichedData && enrichedData.enriched) {
                console.log('Company enriched:', enrichedData)
                // Store enriched data for later use
                this.profileBuilder.collectCompanyInfo({
                  enrichedLocation: enrichedData.location,
                  enrichedIndustry: enrichedData.industry,
                  enrichedEmployeeCount: enrichedData.employeeCount,
                  enrichedInsights: enrichedData.insights
                })
              }
            })
            .catch(err => console.error('Enrichment failed:', err))
        }

        // Build contextual message - Note: enriched data will be available later
        let message = `Perfect! I'm analyzing ${url} to provide tailored recommendations.`

        return {
          message: message + `\n\nHow many employees does ${userData.company} have?`,
          data: { ...userData, companyUrl: url, stage: 'companySize' },
          suggestions: [
            { text: "1-50 employees" },
            { text: "50-500 employees" },
            { text: "500-5,000 employees" },
            { text: "5,000-20,000 employees" },
            { text: "20,000+ employees" }
          ]
        }
      
      case 'companySize':
        this.profileBuilder.collectCompanyInfo({ companySize: input })
        return {
          message: `A ${input} organization - that's great context.\n\nWhat's your approximate annual revenue? This helps me recommend appropriately scaled solutions.`,
          data: { ...userData, companySize: input, stage: 'revenue' },
          suggestions: [
            { text: "Under $10M" },
            { text: "$10M - $50M" },
            { text: "$50M - $250M" },
            { text: "$250M - $1B" },
            { text: "Over $1B" },
            { text: "Prefer not to say" }
          ]
        }
      
      case 'revenue':
        this.profileBuilder.collectCompanyInfo({ companyRevenue: input })

        // Check if we have enriched location data to confirm
        let locationQuestion = `Thank you for sharing. Where is ${userData.company} headquartered?`
        const enrichedLocation = userData.enrichedLocation

        if (enrichedLocation) {
          locationQuestion = `Thank you for sharing. I found that ${userData.company} is based in ${enrichedLocation}. Is that correct?`
        }

        return {
          message: locationQuestion,
          data: { ...userData, companyRevenue: input, stage: 'location' },
          suggestions: enrichedLocation ? [
            { text: `Yes, ${enrichedLocation}` },
            { text: "No, different location" }
          ] : []
        }
      
      case 'location':
        this.profileBuilder.collectCompanyInfo({ companyLocation: input })

        // Build contextual message based on enriched data if available
        let locationMessage = `${input} - excellent.`

        // Add industry-specific context if we have it
        const enrichedIndustry = userData.enrichedIndustry
        if (enrichedIndustry && !userData.confirmedIndustry) {
          locationMessage += ` I see ${userData.company} is in the ${enrichedIndustry} sector.`
        }

        locationMessage += ` Now let's discuss your transformation goals.\n\nWhat's the primary challenge you're looking to address with AI?`

        return {
          message: locationMessage,
          nextState: 'collectingChallenges',
          data: { ...userData, companyLocation: input, stage: 'primaryChallenge' },
          suggestions: [
            { text: "AI adoption & integration" },
            { text: "Employee productivity" },
            { text: "Digital transformation" },
            { text: "Data-driven decisions" },
            { text: "Process automation" },
            { text: "Customer experience" }
          ]
        }
      
      default:
        return this.collectChallenges(input, userData)
    }
  }
  
  private collectChallenges(input: string, userData: any): ChatResponse {
    const stage = userData.stage || 'primaryChallenge'
    
    switch (stage) {
      case 'primaryChallenge':
        this.profileBuilder.collectChallenges({ challenge: input })
        return {
          message: `${input} is a critical area. Many ${userData.companySize} organizations face similar challenges.\n\nAre there any additional challenges you're dealing with? (Select all that apply or type 'none')`,
          data: { ...userData, challenge: input, stage: 'additionalChallenges' },
          suggestions: [
            { text: "Change management", icon: Users },
            { text: "Skills gaps", icon: Brain },
            { text: "Legacy systems", icon: Building2 },
            { text: "Budget constraints", icon: BarChart3 },
            { text: "Regulatory compliance", icon: Target },
            { text: "None - just the primary", icon: Zap }
          ]
        }
      
      case 'additionalChallenges':
        const additionalChallenges = input.toLowerCase() === 'none' ? [] : [input]
        this.profileBuilder.collectChallenges({ additionalChallenges })
        return {
          message: `I understand. What tools or platforms are you currently using for ${userData.challenge}?`,
          data: { ...userData, additionalChallenges, stage: 'currentTools' },
          suggestions: [
            { text: "Microsoft 365", icon: Building2 },
            { text: "Salesforce", icon: Users },
            { text: "SAP", icon: Target },
            { text: "Custom solutions", icon: Brain },
            { text: "None yet", icon: Zap }
          ]
        }
      
      case 'currentTools':
        const tools = input.toLowerCase() === 'none' ? [] : input.split(',').map(t => t.trim())
        this.profileBuilder.collectChallenges({ currentTools: tools })
        return {
          message: `What's your budget range for addressing ${userData.challenge}?`,
          data: { ...userData, currentTools: tools, stage: 'budget' },
          suggestions: [
            { text: "Under $100K" },
            { text: "$100K - $250K" },
            { text: "$250K - $500K" },
            { text: "$500K - $1M" },
            { text: "Over $1M" },
            { text: "Not determined yet" }
          ]
        }
      
      case 'budget':
        this.profileBuilder.collectChallenges({ budget: input })
        return {
          message: `When are you looking to implement a solution?`,
          data: { ...userData, budget: input, stage: 'timeframe' },
          suggestions: [
            { text: "Immediately", icon: Zap },
            { text: "This quarter", icon: Calendar },
            { text: "Next quarter", icon: Target },
            { text: "This year", icon: TrendingUp },
            { text: "Next year", icon: Building2 },
            { text: "Just exploring", icon: Brain }
          ]
        }
      
      case 'timeframe':
        this.profileBuilder.collectChallenges({ timeframe: input })
        return {
          message: `Perfect! I have enough context about your challenges. Now I need your contact information to send you a personalized assessment.\n\nWhat's your business email address?`,
          nextState: 'collectingContactInfo',
          data: { ...userData, timeframe: input, stage: 'email' },
          suggestions: []
        }
      
      default:
        return this.collectContactInfo(input, userData)
    }
  }
  
  private collectContactInfo(input: string, userData: any): ChatResponse {
    const stage = userData.stage || 'email'
    
    switch (stage) {
      case 'email':
        if (!this.isValidEmail(input)) {
          return {
            message: "Please provide a valid business email address:",
            data: userData,
            suggestions: []
          }
        }
        
        this.profileBuilder.collectBasicInfo({ email: input })
        return {
          message: `Great! I'll send your personalized assessment to ${input}.\n\nWhat's the best phone number to reach you for a follow-up discussion?`,
          data: { ...userData, email: input, stage: 'phone' },
          suggestions: []
        }
      
      case 'phone':
        this.profileBuilder.collectBasicInfo({ phone: input })
        return {
          message: `Thank you! One last thing - do you have a LinkedIn profile? This helps me provide more personalized recommendations.`,
          data: { ...userData, phone: input, stage: 'linkedin' },
          suggestions: [
            { text: "Skip this step", icon: Zap }
          ]
        }
      
      case 'linkedin':
        if (input.toLowerCase() !== 'skip') {
          this.profileBuilder.collectProfessionalInfo({ linkedIn: input })
          this.profileBuilder.enrichFromLinkedIn(input)
        }
        
        return {
          message: `Excellent! I'm now analyzing your profile and generating personalized insights...\n\n🔄 Analyzing ${userData.company}'s digital presence...\n🔄 Assessing AI readiness...\n🔄 Calculating ROI potential...\n🔄 Creating transformation roadmap...`,
          nextState: 'performingAnalysis',
          data: { ...userData, linkedIn: input, stage: 'analysis' },
          suggestions: []
        }
      
      default:
        return this.performAnalysis(input, userData)
    }
  }
  
  private performAnalysis(input: string, userData: any): ChatResponse {
    // Perform comprehensive analysis
    const analysis = this.profileBuilder.analyzeProfile()
    
    const message = `✅ **Analysis Complete for ${userData.name} at ${userData.company}**\n\n` +
      `**Your AI Transformation Score: ${analysis.scoring.fitScore}/100**\n\n` +
      `**Key Findings:**\n` +
      analysis.insights.keyFindings.map(f => `• ${f}`).join('\n') + '\n\n' +
      `**Recommended Next Steps:**\n` +
      analysis.insights.nextBestActions.map(a => `• ${a}`).join('\n') + '\n\n' +
      `**Predicted Outcomes:**\n` +
      `• Time to value: ${analysis.predictions.timeToClose} days\n` +
      `• Estimated ROI: $${analysis.predictions.dealSize.toLocaleString()}\n` +
      `• Success probability: ${(analysis.predictions.successProbability * 100).toFixed(0)}%\n\n` +
      `I've sent a detailed report to ${userData.email} with:\n` +
      `✓ Complete assessment results\n` +
      `✓ Industry benchmarks\n` +
      `✓ Custom implementation roadmap\n` +
      `✓ ROI calculator access\n\n` +
      `Would you like to schedule a 30-minute strategy session to discuss your results?`
    
    return {
      message,
      nextState: 'booking',
      data: { ...userData, analysis: analysis },
      profileAnalysis: analysis,
      suggestions: [
        { text: "Yes, schedule a call", icon: Calendar },
        { text: "View detailed report", icon: BarChart3 },
        { text: "Calculate specific ROI", icon: Target },
        { text: "See similar success stories", icon: TrendingUp }
      ]
    }
  }
  
  private handleGeneralQuery(input: string, userData: any): ChatResponse {
    // Handle general queries or restart
    if (input.toLowerCase().includes('start over') || input.toLowerCase().includes('restart')) {
      this.profileBuilder = new UserProfileBuilder()
      return {
        message: this.getGreeting(),
        nextState: 'greeting',
        data: {},
        suggestions: []
      }
    }
    
    return {
      message: "I'm here to help you with your AI transformation journey. What would you like to know?",
      suggestions: [
        { text: "Start assessment", icon: Zap },
        { text: "Learn about our solutions", icon: Brain },
        { text: "See case studies", icon: BarChart3 },
        { text: "Talk to an expert", icon: Users }
      ]
    }
  }
  
  // Helper methods
  private parseYears(input: string): number {
    const match = input.match(/\d+/)
    if (match) return parseInt(match[0])
    if (input.includes('less than 1')) return 0.5
    return 2 // Default
  }
  
  private cleanUrl(input: string): string {
    if (input.toLowerCase() === 'skip' || input.toLowerCase().includes('not')) return 'skip'
    let url = input.trim()
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }
    return url
  }
  
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  // Export the current profile for CRM integration
  exportProfile() {
    return this.profileBuilder.toCRM()
  }
  
  // Get current analysis
  getCurrentAnalysis() {
    return this.profileBuilder.analyzeProfile()
  }
} 