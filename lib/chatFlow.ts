import { ChatState } from './types'
import { Building2, Users, Target, TrendingUp, Briefcase, BarChart3, Zap, Brain } from 'lucide-react'

interface ChatResponse {
  message: string
  nextState?: ChatState
  data?: any
  suggestions?: Array<{
    text: string
    icon?: any
    action?: string
  }>
}

class ChatFlow {
  getGreeting(): string {
    return "Welcome. I'm your AI transformation advisor.\n\n**Key Insight:** Organizations using Human Glue achieve 40% faster AI adoption and 3.2x ROI within 18 months.\n\nI can help you:\n• Calculate your potential ROI\n• Get a custom implementation timeline\n• Book a strategy session with our experts\n\nPlease provide your name to begin:"
  }

  getGreetingSuggestions() {
    return []
  }

  processResponse(currentState: ChatState, input: string, userData: any): ChatResponse {
    switch (currentState) {
      case 'greeting':
        return this.handleGreeting(input)
      
      case 'discovery':
        return this.handleDiscovery(input, userData)
      
      case 'assessment':
        return this.handleAssessment(input, userData)
      
      case 'solution':
        return this.handleSolution(input, userData)
      
      default:
        return { 
          message: "I'm here to help you navigate organizational transformation. What would you like to explore?",
          suggestions: [
            { text: "Assess our AI readiness", icon: Brain },
            { text: "Improve team collaboration", icon: Users },
            { text: "Transform our culture", icon: Zap }
          ]
        }
    }
  }

  private handleGreeting(name: string): ChatResponse {
    return {
      message: `Thank you, ${name}.\n\n**Organization Profile:** Please select your organization type to receive customized ROI projections and implementation timelines.`,
      nextState: 'discovery',
      data: { name },
      suggestions: [
        { text: "Enterprise (5000+ employees)", icon: Building2 },
        { text: "Mid-market (500-5000)", icon: TrendingUp },
        { text: "Growth company (<500)", icon: Briefcase },
        { text: "Evaluating options", icon: Target }
      ]
    }
  }

  private handleDiscovery(input: string, userData: any): ChatResponse {
    if (!userData.company) {
      const companyType = this.detectCompanyType(input)
      return {
        message: `${input} - excellent. Understanding your organization's context is crucial.\n\nWhat's your role in the organization?`,
        data: { company: input, companyType },
        suggestions: [
          { text: "Chief Executive Officer", icon: Target },
          { text: "Chief People Officer", icon: Users },
          { text: "Head of Transformation", icon: Zap },
          { text: "VP of Operations", icon: BarChart3 },
          { text: "Other (type your role)", icon: Building2 }
        ]
      }
    } else if (!userData.role) {
      // Store the role and continue
      const role = input.toLowerCase().includes('other') ? 
        input.replace(/other.*?type.*?role.*?/i, '').trim() || input : 
        input
      
      return {
        message: `As ${role}, you have a unique vantage point on organizational dynamics.\n\nWhat's the primary challenge you're looking to address?`,
        data: { role },
        suggestions: [
          { text: "AI adoption & integration", icon: Brain },
          { text: "Employee engagement", icon: Users },
          { text: "Digital transformation", icon: Zap },
          { text: "Organizational restructuring", icon: Building2 },
          { text: "Skills gap analysis", icon: Target },
          { text: "Other (describe your challenge)", icon: Zap }
        ]
      }
    } else if (!userData.challenge) {
      const challenge = input.toLowerCase().includes('other') ? 
        input.replace(/other.*?describe.*?challenge.*?/i, '').trim() || input : 
        input
        
      return {
        message: `"${challenge}" is a critical area many organizations face today.\n\nHow many employees does ${userData.company} have?`,
        nextState: 'assessment',
        data: { challenge },
        suggestions: [
          { text: "50-500 employees" },
          { text: "500-5,000 employees" },
          { text: "5,000-20,000 employees" },
          { text: "20,000+ employees" }
        ]
      }
    }
    
    return { message: "Tell me more about your organization." }
  }

  private handleAssessment(input: string, userData: any): ChatResponse {
    const size = parseInt(input.replace(/\D/g, '')) || this.parseSizeRange(input)
    
    if (size < 500) {
      return {
        message: `For a ${size}-person organization like ${userData.company}, agility is your superpower.\n\nBased on your focus on ${userData.challenge}, I recommend:\n\n• Rapid AI literacy programs\n• Agile transformation frameworks\n• Data-driven decision tools\n\nWould you like to explore a tailored solution?`,
        nextState: 'solution',
        data: { size: input },
        suggestions: [
          { text: "Show me a detailed roadmap", icon: Target },
          { text: "Schedule a consultation", icon: Users },
          { text: "See relevant case studies", icon: BarChart3 }
        ]
      }
    } else if (size < 5000) {
      return {
        message: `At ${userData.company}'s scale, you're perfectly positioned for transformative change.\n\nFor ${userData.challenge}, our approach includes:\n\n• Enterprise AI assessment\n• Change management playbooks\n• Skills gap analysis & training\n• Leadership alignment workshops\n\nWhat aspect interests you most?`,
        nextState: 'solution',
        data: { size: input },
        suggestions: [
          { text: "AI readiness assessment", icon: Brain },
          { text: "Leadership workshop details", icon: Users },
          { text: "ROI calculator", icon: BarChart3 },
          { text: "Implementation timeline", icon: Target }
        ]
      }
    } else {
      return {
        message: `Leading transformation at ${userData.company}'s scale requires sophisticated orchestration.\n\nFor enterprise-wide ${userData.challenge}, we offer:\n\n• Multi-phase transformation roadmap\n• AI-powered organizational analytics\n• Executive advisory services\n• Global change management\n\nShall we discuss your specific needs?`,
        nextState: 'solution',
        data: { size: input },
        suggestions: [
          { text: "Book executive briefing", icon: Briefcase },
          { text: "Request detailed proposal", icon: Target },
          { text: "View enterprise solutions", icon: Building2 },
          { text: "Connect with an expert", icon: Users }
        ]
      }
    }
  }

  private handleSolution(input: string, userData: any): ChatResponse {
    const isPositive = this.detectPositiveIntent(input)
    
    if (isPositive) {
      return {
        message: `Excellent. Let's create a transformative journey for ${userData.company}.\n\nOur team will prepare a comprehensive strategy addressing ${userData.challenge}.\n\nWhat's the best email for your personalized insights?`,
        nextState: 'booking',
        suggestions: []
      }
    } else if (input.toLowerCase().includes('case') || input.toLowerCase().includes('roi')) {
      return {
        message: `Here's what similar organizations achieved:\n\n📈 40% improvement in decision-making speed\n👥 35% increase in employee engagement\n🎯 60% faster AI adoption\n💰 3.2x ROI within 18 months\n\nWould you like specifics for your industry?`,
        suggestions: [
          { text: "Yes, show industry data", icon: BarChart3 },
          { text: "Schedule a demo", icon: Target },
          { text: "Download case study", icon: Briefcase }
        ]
      }
    } else {
      return {
        message: `I understand you'd like more information. What would be most valuable for you?`,
        suggestions: [
          { text: "Pricing information", icon: BarChart3 },
          { text: "Technical capabilities", icon: Brain },
          { text: "Client testimonials", icon: Users },
          { text: "Security & compliance", icon: Target }
        ]
      }
    }
  }

  private detectCompanyType(input: string): string {
    const lower = input.toLowerCase()
    if (lower.includes('fortune') || lower.includes('enterprise')) return 'enterprise'
    if (lower.includes('startup') || lower.includes('growth')) return 'startup'
    return 'midmarket'
  }

  private parseSizeRange(input: string): number {
    if (input.includes('50-500')) return 250
    if (input.includes('500-5')) return 2500
    if (input.includes('5,000-20') || input.includes('5000-20')) return 10000
    if (input.includes('20,000') || input.includes('20000')) return 30000
    return 1000
  }

  private detectPositiveIntent(input: string): boolean {
    const positive = ['yes', 'sure', 'absolutely', 'definitely', 'interested', 'please', 'ok', 'okay', 'book', 'schedule', 'roadmap', 'proposal']
    return positive.some(word => input.toLowerCase().includes(word))
  }
}

export const chatFlow = new ChatFlow()