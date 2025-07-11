import { ChatState } from './types'
import { UserProfileBuilder, ProfileAnalysis } from './userProfile'
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
}

export class EnhancedChatFlow {
  private profileBuilder: UserProfileBuilder
  
  constructor(initialData?: any) {
    this.profileBuilder = new UserProfileBuilder(initialData)
  }
  
  getGreeting(): string {
    return "Welcome to Human Glue! I'm your AI transformation advisor.\n\nI'll help you discover how AI can transform your organization with a personalized assessment.\n\nLet's start with your first name:"
  }
  
  processResponse(currentState: ChatState, input: string, userData: any): ChatResponse {
    // Update profile builder with any existing data
    if (userData) {
      this.profileBuilder = new UserProfileBuilder(userData)
    }
    
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
      message: `Nice to meet you, ${firstName}! To provide the most relevant insights, I'd like to learn about your professional background.\n\nWhat's your current job title?`,
      nextState: 'collectingBasicInfo',
      data: { name: firstName.trim(), stage: 'role' },
      suggestions: [
        { text: "Chief Executive Officer", icon: Target },
        { text: "Chief Technology Officer", icon: Brain },
        { text: "Chief People Officer", icon: Users },
        { text: "VP of Operations", icon: BarChart3 },
        { text: "Director of Innovation", icon: Zap }
      ]
    }
  }
  
  private collectBasicInfo(input: string, userData: any): ChatResponse {
    const stage = userData.stage
    
    switch (stage) {
      case 'role':
        this.profileBuilder.collectProfessionalInfo({ role: input })
        return {
          message: `${input} - that's a crucial role for organizational transformation!\n\nWhich department do you primarily work with?`,
          data: { ...userData, role: input, stage: 'department' },
          suggestions: [
            { text: "Executive Leadership", icon: Target },
            { text: "Technology/IT", icon: Brain },
            { text: "Human Resources", icon: Users },
            { text: "Operations", icon: BarChart3 },
            { text: "Innovation/Strategy", icon: Zap }
          ]
        }
      
      case 'department':
        this.profileBuilder.collectProfessionalInfo({ department: input })
        return {
          message: `Great! How many years have you been in your current role as ${userData.role}?`,
          data: { ...userData, department: input, stage: 'yearsInRole' },
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
        
        // Trigger website analysis
        if (url && url !== 'skip') {
          this.profileBuilder.enrichFromWebsite(url)
        }
        
        return {
          message: `Perfect! I'll analyze ${url} to provide tailored recommendations.\n\nHow many employees does ${userData.company} have?`,
          data: { ...userData, companyUrl: url, stage: 'companySize' },
          suggestions: [
            { text: "1-50 employees", icon: Briefcase },
            { text: "50-500 employees", icon: Building2 },
            { text: "500-5,000 employees", icon: TrendingUp },
            { text: "5,000-20,000 employees", icon: Target },
            { text: "20,000+ employees", icon: Globe }
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
        return {
          message: `Thank you for sharing. Where is ${userData.company} headquartered?`,
          data: { ...userData, companyRevenue: input, stage: 'location' },
          suggestions: []
        }
      
      case 'location':
        this.profileBuilder.collectCompanyInfo({ companyLocation: input })
        return {
          message: `${input} - excellent. Now let's discuss your transformation goals.\n\nWhat's the primary challenge you're looking to address with AI?`,
          nextState: 'collectingChallenges',
          data: { ...userData, companyLocation: input, stage: 'primaryChallenge' },
          suggestions: [
            { text: "AI adoption & integration", icon: Brain },
            { text: "Employee productivity", icon: Users },
            { text: "Digital transformation", icon: Zap },
            { text: "Data-driven decisions", icon: BarChart3 },
            { text: "Process automation", icon: Target },
            { text: "Customer experience", icon: Globe }
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