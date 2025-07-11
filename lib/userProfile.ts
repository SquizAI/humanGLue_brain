export interface UserProfile {
  // Basic Information
  id?: string
  name: string
  email: string
  phone?: string
  linkedIn?: string
  
  // Professional Information
  role: string
  department?: string
  yearsInRole?: number
  previousRoles?: string[]
  
  // Company Information
  company: string
  companyUrl?: string
  companyType?: string
  companySize?: string
  industry?: string
  companyRevenue?: string
  companyLocation?: string
  
  // Organizational Context
  challenge: string
  additionalChallenges?: string[]
  currentTools?: string[]
  budget?: string
  timeframe?: string
  decisionMakers?: string[]
  
  // Engagement Data
  firstContact: Date
  lastContact: Date
  totalInteractions: number
  pagesVisited: string[]
  contentDownloaded?: string[]
  emailsOpened?: number
  
  // AI Analysis Results
  aiReadinessScore?: number
  organizationalMaturity?: number
  transformationPotential?: number
  riskFactors?: string[]
  opportunities?: string[]
  
  // Behavioral Insights
  communicationStyle?: string
  decisionMakingSpeed?: string
  primaryMotivations?: string[]
  concerns?: string[]
  
  // Lead Scoring
  leadScore?: number
  leadStage?: 'cold' | 'warm' | 'hot' | 'qualified' | 'opportunity' | 'customer'
  estimatedDealSize?: number
  probabilityToClose?: number
  
  // CRM Integration
  crmId?: string
  crmSystem?: string
  lastCrmSync?: Date
  
  // Custom Fields
  customFields?: Record<string, any>
}

export interface ProfileAnalysis {
  profile: UserProfile
  insights: {
    summary: string
    keyFindings: string[]
    recommendations: string[]
    nextBestActions: string[]
    personalizedContent: string[]
  }
  scoring: {
    fitScore: number // How well they fit our ICP
    engagementScore: number // How engaged they are
    urgencyScore: number // How urgent their need is
    budgetScore: number // Budget alignment
    authorityScore: number // Decision-making authority
  }
  predictions: {
    timeToClose: number // Days
    dealSize: number
    successProbability: number
    churnRisk: number
  }
}

export class UserProfileBuilder {
  private profile: Partial<UserProfile> = {}
  
  constructor(initialData?: Partial<UserProfile>) {
    if (initialData) {
      this.profile = { ...initialData }
    }
    this.profile.firstContact = new Date()
    this.profile.lastContact = new Date()
    this.profile.totalInteractions = 1
    this.profile.pagesVisited = []
  }
  
  // Progressive data collection methods
  collectBasicInfo(data: { name?: string; email?: string; phone?: string }) {
    if (data.name) this.profile.name = data.name
    if (data.email) this.profile.email = data.email
    if (data.phone) this.profile.phone = data.phone
    return this
  }
  
  collectProfessionalInfo(data: { 
    role?: string; 
    department?: string; 
    yearsInRole?: number;
    linkedIn?: string 
  }) {
    if (data.role) this.profile.role = data.role
    if (data.department) this.profile.department = data.department
    if (data.yearsInRole) this.profile.yearsInRole = data.yearsInRole
    if (data.linkedIn) this.profile.linkedIn = data.linkedIn
    return this
  }
  
  collectCompanyInfo(data: {
    company?: string;
    companyUrl?: string;
    companyType?: string;
    companySize?: string;
    industry?: string;
    companyRevenue?: string;
    companyLocation?: string;
  }) {
    Object.assign(this.profile, data)
    return this
  }
  
  collectChallenges(data: {
    challenge?: string;
    additionalChallenges?: string[];
    currentTools?: string[];
    budget?: string;
    timeframe?: string;
  }) {
    Object.assign(this.profile, data)
    return this
  }
  
  // Enrichment methods
  async enrichFromWebsite(url: string): Promise<void> {
    // This would call the analyze-website API
    try {
      const response = await fetch('/api/analyze-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, companyName: this.profile.company })
      })
      
      if (response.ok) {
        const analysis = await response.json()
        this.profile.industry = analysis.industry
        this.profile.aiReadinessScore = analysis.aiReadiness?.score
        this.profile.customFields = {
          ...this.profile.customFields,
          websiteAnalysis: analysis
        }
      }
    } catch (error) {
      console.error('Failed to enrich from website:', error)
    }
  }
  
  async enrichFromLinkedIn(linkedInUrl: string): Promise<void> {
    // This would integrate with LinkedIn API or scraping service
    // For now, we'll store the URL for manual enrichment
    this.profile.linkedIn = linkedInUrl
    this.profile.customFields = {
      ...this.profile.customFields,
      linkedInEnrichmentPending: true
    }
  }
  
  // Analysis methods
  analyzeProfile(): ProfileAnalysis {
    const profile = this.profile as UserProfile
    
    // Calculate scores
    const fitScore = this.calculateFitScore()
    const engagementScore = this.calculateEngagementScore()
    const urgencyScore = this.calculateUrgencyScore()
    const budgetScore = this.calculateBudgetScore()
    const authorityScore = this.calculateAuthorityScore()
    
    // Generate insights
    const insights = this.generateInsights()
    
    // Make predictions
    const predictions = this.makePredictions(fitScore, engagementScore, urgencyScore)
    
    return {
      profile,
      insights,
      scoring: {
        fitScore,
        engagementScore,
        urgencyScore,
        budgetScore,
        authorityScore
      },
      predictions
    }
  }
  
  private calculateFitScore(): number {
    let score = 50 // Base score
    
    // Company size fit
    if (this.profile.companySize?.includes('500-5000')) score += 20
    else if (this.profile.companySize?.includes('5000+')) score += 15
    
    // Role fit
    const idealRoles = ['CEO', 'CTO', 'CPO', 'VP', 'Director', 'Head']
    if (idealRoles.some(role => this.profile.role?.toLowerCase().includes(role.toLowerCase()))) {
      score += 15
    }
    
    // Challenge fit
    const highValueChallenges = ['AI adoption', 'digital transformation', 'organizational change']
    if (highValueChallenges.some(challenge => 
      this.profile.challenge?.toLowerCase().includes(challenge.toLowerCase())
    )) {
      score += 15
    }
    
    return Math.min(score, 100)
  }
  
  private calculateEngagementScore(): number {
    let score = 0
    
    // Interaction frequency
    const daysSinceFirst = (Date.now() - this.profile.firstContact!.getTime()) / (1000 * 60 * 60 * 24)
    const interactionRate = this.profile.totalInteractions! / Math.max(daysSinceFirst, 1)
    score += Math.min(interactionRate * 20, 30)
    
    // Data completeness
    const fields = ['name', 'email', 'phone', 'company', 'role', 'challenge']
    const filledFields = fields.filter(field => this.profile[field as keyof UserProfile])
    score += (filledFields.length / fields.length) * 30
    
    // Content engagement
    if (this.profile.pagesVisited!.length > 3) score += 20
    if (this.profile.contentDownloaded?.length) score += 20
    
    return Math.min(score, 100)
  }
  
  private calculateUrgencyScore(): number {
    let score = 30 // Base score
    
    // Timeframe
    if (this.profile.timeframe?.toLowerCase().includes('immediate')) score += 30
    else if (this.profile.timeframe?.toLowerCase().includes('quarter')) score += 20
    else if (this.profile.timeframe?.toLowerCase().includes('year')) score += 10
    
    // Challenge severity
    if (this.profile.additionalChallenges && this.profile.additionalChallenges.length > 2) {
      score += 20
    }
    
    // Recent engagement
    const hoursSinceLastContact = (Date.now() - this.profile.lastContact!.getTime()) / (1000 * 60 * 60)
    if (hoursSinceLastContact < 24) score += 20
    else if (hoursSinceLastContact < 72) score += 10
    
    return Math.min(score, 100)
  }
  
  private calculateBudgetScore(): number {
    if (!this.profile.budget) return 50 // Unknown budget
    
    const budget = this.profile.budget.toLowerCase()
    if (budget.includes('100k') || budget.includes('100,000')) return 70
    if (budget.includes('250k') || budget.includes('250,000')) return 85
    if (budget.includes('500k') || budget.includes('500,000')) return 95
    if (budget.includes('1m') || budget.includes('million')) return 100
    
    return 50
  }
  
  private calculateAuthorityScore(): number {
    let score = 0
    
    // Title-based authority
    const titles = ['chief', 'president', 'vp', 'vice president', 'director', 'head']
    const lowerRole = this.profile.role?.toLowerCase() || ''
    
    if (lowerRole.includes('ceo') || lowerRole.includes('chief executive')) score = 100
    else if (lowerRole.includes('cto') || lowerRole.includes('cpo')) score = 90
    else if (titles.some(title => lowerRole.includes(title))) score = 80
    else if (lowerRole.includes('manager')) score = 60
    else score = 40
    
    return score
  }
  
  private generateInsights(): ProfileAnalysis['insights'] {
    const insights: ProfileAnalysis['insights'] = {
      summary: '',
      keyFindings: [],
      recommendations: [],
      nextBestActions: [],
      personalizedContent: []
    }
    
    // Generate summary
    insights.summary = `${this.profile.name} is a ${this.profile.role} at ${this.profile.company}, 
    a ${this.profile.companyType || 'company'} with ${this.profile.companySize || 'unknown'} employees. 
    They are focused on ${this.profile.challenge} and have shown 
    ${this.calculateEngagementScore() > 70 ? 'high' : 'moderate'} engagement.`
    
    // Key findings
    if (this.profile.aiReadinessScore && this.profile.aiReadinessScore < 50) {
      insights.keyFindings.push('Low AI readiness score indicates significant transformation opportunity')
    }
    
    if (this.calculateAuthorityScore() > 80) {
      insights.keyFindings.push('High decision-making authority - direct path to purchase')
    }
    
    // Recommendations
    insights.recommendations.push(`Focus on ${this.profile.challenge} solutions`)
    insights.recommendations.push(`Highlight ROI for ${this.profile.companyType} organizations`)
    
    // Next best actions
    if (!this.profile.phone) {
      insights.nextBestActions.push('Collect phone number for direct outreach')
    }
    
    if (!this.profile.budget) {
      insights.nextBestActions.push('Qualify budget in next conversation')
    }
    
    insights.nextBestActions.push('Schedule executive briefing')
    
    // Personalized content
    insights.personalizedContent.push(`${this.profile.industry || 'Industry'} transformation guide`)
    insights.personalizedContent.push(`${this.profile.challenge} solution brief`)
    insights.personalizedContent.push(`ROI calculator for ${this.profile.companySize} companies`)
    
    return insights
  }
  
  private makePredictions(fitScore: number, engagementScore: number, urgencyScore: number): ProfileAnalysis['predictions'] {
    const avgScore = (fitScore + engagementScore + urgencyScore) / 3
    
    return {
      timeToClose: Math.round(120 - avgScore), // Days
      dealSize: this.estimateDealSize(),
      successProbability: avgScore / 100,
      churnRisk: avgScore < 50 ? 0.7 : 0.3
    }
  }
  
  private estimateDealSize(): number {
    let baseSize = 50000
    
    // Company size multiplier
    if (this.profile.companySize?.includes('5000+')) baseSize *= 4
    else if (this.profile.companySize?.includes('500-5000')) baseSize *= 2.5
    else if (this.profile.companySize?.includes('100-500')) baseSize *= 1.5
    
    // Challenge complexity multiplier
    if (this.profile.additionalChallenges && this.profile.additionalChallenges.length > 2) {
      baseSize *= 1.5
    }
    
    return Math.round(baseSize)
  }
  
  // Export methods
  toJSON(): UserProfile {
    return this.profile as UserProfile
  }
  
  toCRM(): Record<string, any> {
    // Format for CRM integration
    return {
      ...this.profile,
      leadScore: this.analyzeProfile().scoring.fitScore,
      lastUpdated: new Date().toISOString()
    }
  }
} 