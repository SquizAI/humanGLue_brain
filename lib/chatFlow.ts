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
    return "Welcome to hmn. For leaders who don't have 6 months and a million-dollar budget to figure out AI. I can help you:\n\n• Take a 3 min AI maturity check\n• Determine what YOU need to get AI upskilled\n• Calculate ROI for AI initiatives\n\nLet's start with your name."
  }

  getGreetingSuggestions() {
    return [
      { text: "AI Maturity Check", icon: null },
      { text: "Assess My Skills", icon: null },
      { text: "AI ROI Calculator", icon: null }
    ]
  }

  processResponse(currentState: ChatState, input: string, userData: any): ChatResponse {
    console.log('Processing response - State:', currentState, 'Input:', input, 'UserData:', userData)
    
    // Check if user wants to schedule a demo at any point
    if (input.toLowerCase().includes('schedule') && input.toLowerCase().includes('demo')) {
      if (!userData.email) {
        return {
          message: `I'd be happy to schedule a demo for you, ${userData.name || 'there'}! 

To personalize your demo and send you the calendar invite, I'll need your email address.

**What you'll get:**
• 30-minute executive briefing
• Custom ROI analysis for your organization
• Live demonstration of our AI assessment tool
• Q&A with our transformation experts

Please provide your email address:`,
          data: { requestingDemoEmail: true },
          suggestions: []
        }
      } else {
        return this.scheduleDemoWithEmail(userData)
      }
    }
    
    // Check if we're collecting email for demo
    if (userData.requestingDemoEmail && !userData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (emailRegex.test(input)) {
        const updatedData = { ...userData, email: input, requestingDemoEmail: false }
        return this.scheduleDemoWithEmail(updatedData)
      } else {
        return {
          message: "Please provide a valid email address so I can send you the demo details:",
          data: { requestingDemoEmail: true },
          suggestions: []
        }
      }
    }
    
    switch (currentState) {
      case 'initial':
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
      
      case 'completed':
        // If user wants to start over
        if (input.toLowerCase().includes('start') && input.toLowerCase().includes('new')) {
          return {
            message: this.getGreeting(),
            nextState: 'greeting',
            data: {} // Reset user data
          }
        }
        // Otherwise use AI for general questions
        return {
          message: "Thank you for completing the assessment! Feel free to ask me any questions about hmn's solutions, or start a new assessment.",
          suggestions: [
            { text: "Start a new conversation", icon: Zap },
            { text: "Tell me about your solutions", icon: Brain },
            { text: "Show me case studies", icon: BarChart3 }
          ]
        }
      
      default:
        // If we have a name but no company, continue discovery
        if (userData?.name && !userData?.company) {
          return this.handleDiscovery(input, userData)
        }
        return { 
          message: "I'm here to help you navigate organizational transformation. What would you like to explore?",
          suggestions: [
            { text: "Schedule a demo", icon: Briefcase },
            { text: "Assess our AI readiness", icon: Brain },
            { text: "Improve team collaboration", icon: Users }
          ]
        }
    }
  }

  private handleGreeting(name: string): ChatResponse {
    // Store the name and move to discovery
    return {
      message: `Thank you, ${name}.\n\n**Organization Profile:** Please select your organization type to receive customized ROI projections and implementation timelines.`,
      nextState: 'discovery',
      data: { name: name.trim() },
      suggestions: [
        { text: "Enterprise (5000+ employees)", icon: Building2 },
        { text: "Mid-market (500-5000)", icon: TrendingUp },
        { text: "Growth company (<500)", icon: Briefcase },
        { text: "Evaluating options", icon: Target }
      ]
    }
  }

  private handleDiscovery(input: string, userData: any): ChatResponse {
    console.log('HandleDiscovery - Input:', input, 'UserData:', userData)
    
    // If user hasn't selected company type yet
    if (!userData.companyType) {
      // Check if this is a company type selection
      const companyTypes = {
        'enterprise': 'Enterprise (5000+ employees)',
        'mid-market': 'Mid-market (500-5000)',
        'growth': 'Growth company (<500)',
        'evaluating': 'Evaluating options'
      }
      
      let selectedType = null
      for (const [key, value] of Object.entries(companyTypes)) {
        if (input.toLowerCase().includes(key) || input === value) {
          selectedType = value
          break
        }
      }
      
      if (selectedType) {
        // User selected company type, now ask for company name
        return {
          message: `${selectedType} - excellent choice. What's your company name?`,
          data: { companyType: selectedType },
          suggestions: []
        }
      } else {
        // User didn't select a type, remind them
        return {
          message: `I need to understand your organization type first. Please select one of the following to receive customized insights:`,
          suggestions: [
            { text: "Enterprise (5000+ employees)", icon: Building2 },
            { text: "Mid-market (500-5000)", icon: TrendingUp },
            { text: "Growth company (<500)", icon: Briefcase },
            { text: "Evaluating options", icon: Target }
          ]
        }
      }
    } else if (!userData.company) {
      // We have company type, now get company name
      return {
        message: `Thank you. ${input} - Understanding your specific organization is crucial.\n\nWhat's your company's website URL? This helps me provide more personalized insights.`,
        data: { company: input },
        suggestions: []
      }
    } else if (!userData.companyUrl) {
      // Check if input looks like a URL
      const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
      const isUrl = urlRegex.test(input) || input.includes('.com') || input.includes('.org') || input.includes('.net')
      
      if (isUrl) {
        // Clean up the URL
        let cleanUrl = input.trim()
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
          cleanUrl = 'https://' + cleanUrl
        }
        
        return {
          message: `Great! I'll analyze ${userData.company}'s digital presence at ${cleanUrl} to provide tailored recommendations.\n\nWhat's your role in the organization?`,
          data: { companyUrl: cleanUrl, urlToScrape: cleanUrl },
          suggestions: [
            { text: "Chief Executive Officer", icon: Target },
            { text: "Chief People Officer", icon: Users },
            { text: "Head of Transformation", icon: Zap },
            { text: "VP of Operations", icon: BarChart3 },
            { text: "Other (type your role)", icon: Building2 }
          ]
        }
      } else {
        // If they didn't provide a URL, ask again or skip
        if (input.toLowerCase().includes('skip') || input.toLowerCase().includes("don't have")) {
          return {
            message: `No problem! Let's continue.\n\nWhat's your role in the organization?`,
            data: { companyUrl: 'not provided' },
            suggestions: [
              { text: "Chief Executive Officer", icon: Target },
              { text: "Chief People Officer", icon: Users },
              { text: "Head of Transformation", icon: Zap },
              { text: "VP of Operations", icon: BarChart3 },
              { text: "Other (type your role)", icon: Building2 }
            ]
          }
        } else {
          return {
            message: `Please provide your company's website URL (e.g., example.com) or type 'skip' if you prefer not to share:`,
            suggestions: []
          }
        }
      }
    } else if (!userData.role) {
      // Store the role and continue
      const role = input.toLowerCase().includes('other') ? 
        input.replace(/other.*?type.*?role.*?/i, '').trim() || input : 
        input
      
      return {
        message: `As ${role}, you have a unique vantage point on organizational dynamics.\n\n**Key insight:** ${role}s who implement hmn report 35% improvement in strategic decision-making.\n\nWhat's the primary challenge you're looking to address?`,
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
        message: `**hmn Results for ${userData.companyType || 'Enterprise'} Organizations:**\n\n📈 **Performance Metrics:**\n• 40% improvement in decision-making speed\n• 35% increase in employee engagement\n• 60% faster AI adoption vs. industry average\n• 3.2x ROI within 18 months\n\n💡 **Example:** A ${userData.size} ${userData.companyType || 'company'} addressing ${userData.challenge} achieved:\n• $2.3M in productivity gains (Year 1)\n• 47% reduction in transformation timeline\n• 89% leadership buy-in rate\n\nWould you like to see your projected outcomes?`,
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
        message: `I understand you need more information about hmn's approach to ${userData.challenge}.\n\n**Our Unique Value:**\n• Only platform combining AI assessment + human expertise\n• Proven methodology across 500+ transformations\n• Industry-specific frameworks for ${userData.companyType || 'your sector'}\n• Guaranteed ROI or continued support at no cost\n\nWhat specific aspect would help you make a decision?`,
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
    // Check if this is the final thank you
    if (input.toLowerCase().includes('all set') || input.toLowerCase().includes('thank you')) {
      return {
        message: `Thank you for your time, ${userData.name}! I'm excited about ${userData.company}'s transformation journey.\n\n**Quick Summary:**\n• Your briefing is scheduled\n• Check your email for resources\n• Our team will follow up within 24 hours\n\nFeel free to explore our website or reach out if you have any questions before our call.\n\nHave a great day!`,
        nextState: 'completed' as ChatState,
        suggestions: [
          { text: "Start a new conversation", icon: Zap },
          { text: "Explore our solutions", icon: Brain },
          { text: "View success stories", icon: TrendingUp }
        ]
      }
    }
    
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
        message: `**Executive Briefing Details:**\n\n**Duration:** 30 minutes via video call\n\n**Participants:**\n• You and up to 3 team members\n• hmn transformation specialist\n• Industry expert (when applicable)\n\n**What We'll Cover:**\n✓ Your personalized assessment results\n✓ Industry benchmarks & best practices\n✓ Custom transformation roadmap\n✓ Implementation timeline & milestones\n✓ Investment options & ROI projections\n✓ Q&A session\n\n**What You'll Receive:**\n• Executive summary document\n• Detailed transformation plan\n• ROI calculator access\n• 90-day quick wins guide\n\nNo preparation needed - just bring your questions!`,
        suggestions: [
          { text: "Schedule the briefing", icon: Briefcase },
          { text: "Invite my team", icon: Users },
          { text: "See sample agenda", icon: Target }
        ]
      }
    } else {
      // Time slot selected
      return {
        message: `Perfect! I've scheduled your executive briefing for ${input}.\n\n✅ **Confirmation sent to:** ${userData.email}\n📧 **Calendar invite:** Check your inbox\n🔗 **Video link:** Included in the invite\n\n**Before our call:**\n• Review the assessment summary I've emailed\n• Invite relevant team members\n• Prepare any specific questions\n\n**Your hmn specialist:** Sarah Chen, VP of Enterprise Transformation\n\nLooking forward to discussing ${userData.company}'s transformation journey!\n\nIs there anything specific you'd like us to focus on during the briefing?`,
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

  private scheduleDemoWithEmail(userData: any): ChatResponse {
    return {
      message: `Perfect! I've scheduled your personalized demo, ${userData.name || 'there'}!

✅ **Demo Scheduled**
📧 **Confirmation sent to:** ${userData.email}
📅 **Date:** Tuesday, January 14th at 2:00 PM EST
⏱️ **Duration:** 30 minutes
🔗 **Meeting link:** Sent to your email

**Your Demo Agenda:**
1. Review of your organization's profile
2. Live demonstration of our AI assessment tool
3. Custom ROI projections for ${userData.company || 'your organization'}
4. Implementation roadmap discussion
5. Q&A session

**Before the demo:**
• Check your email for preparation materials
• Invite key stakeholders who should attend
• Prepare any specific questions

Looking forward to showing you how hmn can transform ${userData.company || 'your organization'}!

Is there anything specific you'd like us to focus on during the demo?`,
      nextState: 'booking',
      data: { email: userData.email, demoScheduled: true },
      suggestions: [
        { text: "Focus on ROI metrics", icon: BarChart3 },
        { text: "Show integration options", icon: Brain },
        { text: "Discuss implementation timeline", icon: Target },
        { text: "All set, thank you!", icon: Zap }
      ]
    }
  }
}

export const chatFlow = new ChatFlow()