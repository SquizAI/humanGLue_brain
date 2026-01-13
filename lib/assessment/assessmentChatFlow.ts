/**
 * Enhanced Chat Flow with AI Maturity Assessment Integration
 */

import { ChatState } from '../types'
import { assessmentDimensions, AssessmentDimension, DimensionCategory } from './dimensions'
import { assessmentOrchestrator, AssessmentData } from './orchestrator'
import { maturityLevels } from './maturityModel'

interface AssessmentChatResponse {
  message: string
  nextState: ChatState
  suggestions?: string[]
  data?: any
  showAssessmentUI?: boolean
  assessmentData?: {
    type: 'question' | 'progress' | 'result'
    dimension?: AssessmentDimension
    questionIndex?: number
    progress?: {
      currentCategory: number
      totalCategories: number
      completedDimensions: number
      totalDimensions: number
    }
    result?: any
  }
}

export class AssessmentChatFlow {
  private currentDimensionIndex = 0
  private currentQuestionIndex = 0
  private responses = new Map<string, any>()
  private organizationContext: any = {}
  private assessmentStarted = false
  private categories: DimensionCategory[] = ['technical', 'human', 'business', 'ai_adoption']
  private currentCategoryIndex = 0

  async processResponse(state: ChatState, input: string, userData: any): Promise<AssessmentChatResponse> {
    // Store organization context
    if (userData.company) {
      this.organizationContext = {
        ...this.organizationContext,
        company: userData.company,
        industry: userData.industry || 'General',
        size: userData.size || 'Medium',
        region: userData.region || 'Global'
      }
    }

    switch (state) {
      case 'initial':
      case 'greeting':
        return this.handleGreeting()
      
      case 'collectingBasicInfo':
        return this.handleBasicInfo(input, userData)
      
      case 'collectingCompanyInfo':
        return this.handleCompanyInfo(input, userData)
      
      case 'collectingChallenges':
        return this.handleChallenges(input, userData)
      
      case 'assessment':
        return this.handleAssessment(input)
      
      case 'performingAnalysis':
        return await this.performAnalysis()
      
      default:
        return this.handleDefault(input)
    }
  }

  private handleGreeting(): AssessmentChatResponse {
    return {
      message: "👋 Welcome to HMN's AI Maturity Assessment! I'm here to help you understand your organization's AI readiness and create a personalized transformation roadmap. Let's start with your name.",
      nextState: 'collectingBasicInfo',
      suggestions: ['Get Started', 'Learn More', 'Skip to Assessment']
    }
  }

  private handleBasicInfo(input: string, userData: any): AssessmentChatResponse {
    const name = this.extractName(input)
    
    return {
      message: `Great to meet you, ${name}! To provide the most relevant AI transformation insights, could you tell me about your organization?`,
      nextState: 'collectingCompanyInfo',
      data: { name },
      suggestions: ['Small Business', 'Enterprise', 'Startup', 'Non-Profit']
    }
  }

  private handleCompanyInfo(input: string, userData: any): AssessmentChatResponse {
    const companyInfo = this.extractCompanyInfo(input)
    
    return {
      message: `Thank you! ${companyInfo.company} sounds like an exciting organization. What are your main challenges or goals regarding AI adoption?`,
      nextState: 'collectingChallenges',
      data: companyInfo,
      suggestions: [
        'Improving efficiency',
        'Reducing costs',
        'Enhancing customer experience',
        'Staying competitive'
      ]
    }
  }

  private handleChallenges(input: string, userData: any): AssessmentChatResponse {
    const challenges = this.extractChallenges(input)
    this.organizationContext.currentChallenges = challenges
    
    return {
      message: `I understand. To help ${userData.company} ${challenges[0]?.toLowerCase() || 'achieve your goals'}, I'll guide you through our comprehensive AI maturity assessment. This will take about 10-15 minutes and cover 4 key areas. Ready to begin?`,
      nextState: 'assessment',
      data: { challenges },
      suggestions: ["Let's start!", "Tell me more", "What areas?"],
      showAssessmentUI: true,
      assessmentData: {
        type: 'progress',
        progress: {
          currentCategory: 0,
          totalCategories: 4,
          completedDimensions: 0,
          totalDimensions: assessmentDimensions.length
        }
      }
    }
  }

  private handleAssessment(input: string): AssessmentChatResponse {
    // Handle assessment answer
    if (this.assessmentStarted) {
      const currentDimension = assessmentDimensions[this.currentDimensionIndex]
      const currentQuestion = currentDimension.questions[this.currentQuestionIndex]
      
      // Store the response
      this.responses.set(currentQuestion.id, this.parseAnswer(input, currentQuestion.type))
      
      // Move to next question
      this.currentQuestionIndex++
      
      // Check if dimension is complete
      if (this.currentQuestionIndex >= currentDimension.questions.length) {
        this.currentDimensionIndex++
        this.currentQuestionIndex = 0
        
        // Check if category is complete
        const currentCategoryDimensions = assessmentDimensions.filter(d => d.category === this.categories[this.currentCategoryIndex])
        const completedInCategory = currentCategoryDimensions.filter(d => 
          d.questions.every(q => this.responses.has(q.id))
        ).length
        
        if (completedInCategory === currentCategoryDimensions.length) {
          this.currentCategoryIndex++
        }
      }
      
      // Check if assessment is complete
      if (this.currentDimensionIndex >= assessmentDimensions.length) {
        return {
          message: "Excellent! I've completed gathering all the information needed. Let me analyze your responses and generate your personalized AI maturity report...",
          nextState: 'performingAnalysis',
          showAssessmentUI: false
        }
      }
      
      // Get next question
      const nextDimension = assessmentDimensions[this.currentDimensionIndex]
      const nextQuestion = nextDimension.questions[this.currentQuestionIndex]
      
      return {
        message: this.getQuestionContext(nextDimension, nextQuestion),
        nextState: 'assessment',
        showAssessmentUI: true,
        assessmentData: {
          type: 'question',
          dimension: nextDimension,
          questionIndex: this.currentQuestionIndex,
          progress: {
            currentCategory: this.currentCategoryIndex,
            totalCategories: 4,
            completedDimensions: this.currentDimensionIndex,
            totalDimensions: assessmentDimensions.length
          }
        }
      }
    } else {
      // Start assessment
      this.assessmentStarted = true
      const firstDimension = assessmentDimensions[0]
      const firstQuestion = firstDimension.questions[0]
      
      return {
        message: "Great! Let's begin with understanding your technical foundation. " + this.getQuestionContext(firstDimension, firstQuestion),
        nextState: 'assessment',
        showAssessmentUI: true,
        assessmentData: {
          type: 'question',
          dimension: firstDimension,
          questionIndex: 0,
          progress: {
            currentCategory: 0,
            totalCategories: 4,
            completedDimensions: 0,
            totalDimensions: assessmentDimensions.length
          }
        }
      }
    }
  }

  private async performAnalysis(): Promise<AssessmentChatResponse> {
    const assessmentData: AssessmentData = {
      organizationId: `org_${Date.now()}`,
      responses: this.responses,
      context: this.organizationContext
    }
    
    try {
      const result = await assessmentOrchestrator.orchestrateAssessment(assessmentData)
      
      return {
        message: `🎉 Assessment complete! Your organization is at **Level ${result.overallMaturityLevel}: ${result.maturityDetails.name}**. This places you ${this.getMaturityContext(result.overallMaturityLevel)}. Would you like to see your detailed results and personalized roadmap?`,
        nextState: 'completed',
        suggestions: ['Show Full Report', 'Key Recommendations', 'Next Steps', 'Book Consultation'],
        showAssessmentUI: true,
        assessmentData: {
          type: 'result',
          result
        }
      }
    } catch (error) {
      console.error('Assessment analysis failed:', error)
      return {
        message: "I've completed the assessment analysis. Your organization shows strong potential for AI transformation. Would you like to discuss your results with our team?",
        nextState: 'booking',
        suggestions: ['Book Consultation', 'Email Results', 'Download Report']
      }
    }
  }

  private handleDefault(input: string): AssessmentChatResponse {
    return {
      message: "I'm here to help you assess your AI maturity and create a transformation roadmap. Would you like to start the assessment?",
      nextState: 'greeting',
      suggestions: ['Start Assessment', 'Learn More', 'Contact Us']
    }
  }

  // Helper methods
  private extractName(input: string): string {
    const words = input.trim().split(' ')
    return words[0] || 'there'
  }

  private extractCompanyInfo(input: string): any {
    // Simple extraction - in production, use NLP
    return {
      company: input.split(' ')[0] || 'Your organization',
      size: this.detectCompanySize(input),
      industry: this.detectIndustry(input)
    }
  }

  private extractChallenges(input: string): string[] {
    const challengeKeywords = [
      'efficiency', 'costs', 'customer experience', 'competition',
      'automation', 'data', 'innovation', 'transformation'
    ]
    
    const found = challengeKeywords.filter(keyword => 
      input.toLowerCase().includes(keyword)
    )
    
    return found.length > 0 ? found : ['achieving AI transformation']
  }

  private detectCompanySize(input: string): string {
    if (input.match(/small|startup|smb/i)) return 'Small'
    if (input.match(/enterprise|large|global/i)) return 'Enterprise'
    return 'Medium'
  }

  private detectIndustry(input: string): string {
    const industries = [
      'Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing',
      'Education', 'Government', 'Services'
    ]
    
    for (const industry of industries) {
      if (input.toLowerCase().includes(industry.toLowerCase())) {
        return industry
      }
    }
    
    return 'General'
  }

  private parseAnswer(input: string, questionType: string): any {
    switch (questionType) {
      case 'scale':
        const num = parseInt(input)
        return isNaN(num) ? 5 : Math.min(10, Math.max(0, num))
      
      case 'yes_no':
        return input.toLowerCase().includes('yes')
      
      case 'multiple_choice':
      case 'text':
        return input
      
      default:
        return input
    }
  }

  private getQuestionContext(dimension: AssessmentDimension, question: any): string {
    const contexts = {
      'tech_infrastructure': "This helps us understand your technical foundation.",
      'data_quality': "Data is the fuel for AI - let's assess your data readiness.",
      'leadership_vision': "Leadership commitment is crucial for AI success.",
      'skills_talent': "Having the right skills is key to AI adoption."
    }
    
    return contexts[dimension.id as keyof typeof contexts] || ""
  }

  private getMaturityContext(level: number): string {
    if (level <= 2) return "in the early stages of AI adoption, with significant growth potential"
    if (level <= 5) return "on a solid AI journey, ahead of many organizations"
    if (level <= 7) return "among the AI leaders in your industry"
    return "at the forefront of AI innovation globally"
  }

  // Public method to get current assessment state
  getAssessmentState() {
    return {
      started: this.assessmentStarted,
      currentDimension: this.currentDimensionIndex,
      currentQuestion: this.currentQuestionIndex,
      totalDimensions: assessmentDimensions.length,
      responses: this.responses.size,
      categories: this.categories.map((cat, index) => ({
        name: cat,
        completed: index < this.currentCategoryIndex,
        current: index === this.currentCategoryIndex,
        locked: index > this.currentCategoryIndex
      }))
    }
  }
}