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
      
      case 'booking':
        return this.handleBooking(input, userData)
      
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
        message: `As ${role}, you have a unique vantage point on organizational dynamics.\n\n**Key insight:** ${role}s who implement Human Glue report 35% improvement in strategic decision-making.\n\nWhat's the primary challenge you're looking to address?`,
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
        message: `"${challenge}" is a critical area many organizations face today.\n\n**Note:** 73% of enterprises struggle with ${challenge.toLowerCase()} without proper frameworks.\n\nHow many employees does ${userData.company} have?`,
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
    // Check if we're collecting email
    if (userData.awaitingEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (emailRegex.test(input)) {
        return {
          message: `Perfect! I've sent a personalized transformation roadmap to ${input}.\n\n**Your Next Steps:**\n1. Check your email for your custom ${userData.company} AI readiness report\n2. Review the 90-day quick wins specific to ${userData.challenge}\n3. Schedule a strategy session with our ${userData.role} specialist\n\n**Important:** Your organization profile indicates potential for 40% productivity gains within 6 months.\n\nWould you like me to schedule a 30-minute executive briefing this week?`,
          nextState: 'booking',
          data: { email: input, awaitingEmail: false },
          suggestions: [
            { text: "Yes, show me available times", icon: Briefcase },
            { text: "Tell me more about the process", icon: Target },
            { text: "What's included in the briefing?", icon: Brain }
          ]
        }
      } else {
        return {
          message: "Please provide a valid email address so I can send your personalized insights:",
          data: { awaitingEmail: true },
          suggestions: []
        }
      }
    }
    
    const isPositive = this.detectPositiveIntent(input)
    
    if (isPositive || input.toLowerCase().includes('book') || input.toLowerCase().includes('schedule')) {
      return {
        message: `Excellent! Let's create your ${userData.company} transformation roadmap.\n\n**Based on your profile:**\n• Organization: ${userData.company}\n• Your role: ${userData.role}\n• Focus area: ${userData.challenge}\n• Scale: ${userData.size}\n\nI'll prepare a comprehensive strategy with:\n✓ 5-dimension organizational assessment\n✓ Custom implementation timeline\n✓ ROI projections for your industry\n✓ Quick wins you can implement immediately\n\nWhat's the best email for your personalized insights?`,
        data: { awaitingEmail: true },
        suggestions: []
      }
    } else if (input.toLowerCase().includes('case') || input.toLowerCase().includes('roi')) {
      return {
        message: `**Human Glue Results for ${userData.companyType || 'Enterprise'} Organizations:**\n\n📈 **Performance Metrics:**\n• 40% improvement in decision-making speed\n• 35% increase in employee engagement\n• 60% faster AI adoption vs. industry average\n• 3.2x ROI within 18 months\n\n💡 **Example:** A ${userData.size} ${userData.companyType || 'company'} addressing ${userData.challenge} achieved:\n• $2.3M in productivity gains (Year 1)\n• 47% reduction in transformation timeline\n• 89% leadership buy-in rate\n\nWould you like to see your projected outcomes?`,
        suggestions: [
          { text: "Yes, calculate my ROI", icon: BarChart3 },
          { text: "Schedule executive briefing", icon: Target },
          { text: "Download detailed case study", icon: Briefcase }
        ]
      }
    } else if (input.toLowerCase().includes('timeline') || input.toLowerCase().includes('implement')) {
      return {
        message: `**${userData.company} Implementation Timeline:**\n\n**Phase 1 (Weeks 1-4): Discovery & Assessment**\n• AI-powered organizational analysis\n• Leadership alignment sessions\n• Current state documentation\n\n**Phase 2 (Weeks 5-12): Strategic Planning**\n• Custom transformation roadmap\n• Quick win identification\n• Change readiness assessment\n\n**Phase 3 (Weeks 13-24): Implementation**\n• Pilot program launch\n• Skills development workshops\n• Progress tracking & optimization\n\n**Phase 4 (Ongoing): Scale & Sustain**\n• Enterprise-wide rollout\n• Continuous improvement\n• ROI measurement\n\nReady to start your transformation?`,
        suggestions: [
          { text: "Yes, let's begin", icon: Zap },
          { text: "Discuss with my team first", icon: Users },
          { text: "See pricing options", icon: BarChart3 }
        ]
      }
    } else {
      return {
        message: `I understand you need more information about Human Glue's approach to ${userData.challenge}.\n\n**Our Unique Value:**\n• Only platform combining AI assessment + human expertise\n• Proven methodology across 500+ transformations\n• Industry-specific frameworks for ${userData.companyType || 'your sector'}\n• Guaranteed ROI or continued support at no cost\n\nWhat specific aspect would help you make a decision?`,
        suggestions: [
          { text: "Pricing & packages", icon: BarChart3 },
          { text: "Security & compliance", icon: Target },
          { text: "Integration with our systems", icon: Brain },
          { text: "Talk to a specialist", icon: Users }
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

  private handleBooking(input: string, userData: any): ChatResponse {
    if (input.toLowerCase().includes('yes') || input.toLowerCase().includes('show') || input.toLowerCase().includes('time')) {
      return {
        message: `**Available Executive Briefing Slots:**\n\n📅 **This Week:**\n• Tuesday 2:00 PM - 2:30 PM EST\n• Wednesday 10:00 AM - 10:30 AM EST\n• Thursday 3:00 PM - 3:30 PM EST\n\n📅 **Next Week:**\n• Monday 11:00 AM - 11:30 AM EST\n• Tuesday 1:00 PM - 1:30 PM EST\n• Wednesday 4:00 PM - 4:30 PM EST\n\n**Meeting Agenda:**\n1. Review your ${userData.company} assessment results\n2. Discuss quick wins for ${userData.challenge}\n3. Customize implementation roadmap\n4. Answer your questions\n\nWhich time works best for you?`,
        suggestions: [
          { text: "Tuesday 2:00 PM this week", icon: Briefcase },
          { text: "Wednesday 10:00 AM this week", icon: Briefcase },
          { text: "Monday 11:00 AM next week", icon: Briefcase },
          { text: "Different time", icon: Target }
        ]
      }
    } else if (input.toLowerCase().includes('process') || input.toLowerCase().includes('included')) {
      return {
        message: `**Executive Briefing Details:**\n\n**Duration:** 30 minutes via video call\n\n**Participants:**\n• You and up to 3 team members\n• Human Glue transformation specialist\n• Industry expert (when applicable)\n\n**What We'll Cover:**\n✓ Your personalized assessment results\n✓ Industry benchmarks & best practices\n✓ Custom transformation roadmap\n✓ Implementation timeline & milestones\n✓ Investment options & ROI projections\n✓ Q&A session\n\n**What You'll Receive:**\n• Executive summary document\n• Detailed transformation plan\n• ROI calculator access\n• 90-day quick wins guide\n\nNo preparation needed - just bring your questions!`,
        suggestions: [
          { text: "Schedule the briefing", icon: Briefcase },
          { text: "Invite my team", icon: Users },
          { text: "See sample agenda", icon: Target }
        ]
      }
    } else {
      // Time slot selected
      return {
        message: `Perfect! I've scheduled your executive briefing for ${input}.\n\n✅ **Confirmation sent to:** ${userData.email}\n📧 **Calendar invite:** Check your inbox\n🔗 **Video link:** Included in the invite\n\n**Before our call:**\n• Review the assessment summary I've emailed\n• Invite relevant team members\n• Prepare any specific questions\n\n**Your Human Glue specialist:** Sarah Chen, VP of Enterprise Transformation\n\nLooking forward to discussing ${userData.company}'s transformation journey!\n\nIs there anything specific you'd like us to focus on during the briefing?`,
        suggestions: [
          { text: "Focus on quick wins", icon: Zap },
          { text: "Discuss change management", icon: Users },
          { text: "Review technology integration", icon: Brain },
          { text: "All set, thank you!", icon: Target }
        ]
      }
    }
  }

  private detectPositiveIntent(input: string): boolean {
    const positive = ['yes', 'sure', 'absolutely', 'definitely', 'interested', 'please', 'ok', 'okay', 'book', 'schedule', 'roadmap', 'proposal']
    return positive.some(word => input.toLowerCase().includes(word))
  }
}

export const chatFlow = new ChatFlow()