/**
 * HMN Assessment Orchestrator
 * Coordinates multi-agent assessment process
 */

import { AssessmentDimension, DimensionCategory, calculateDimensionScore, calculateOverallMaturityLevel } from './dimensions'
import { MaturityLevel, getMaturityLevel } from './maturityModel'

export interface AssessmentAgent {
  id: string
  name: string
  description: string
  dimensions: string[] // dimension IDs this agent assesses
  analyze: (data: AssessmentData) => Promise<AgentAnalysis>
}

export interface AssessmentData {
  organizationId: string
  responses: Map<string, any> // questionId -> answer
  context: {
    industry: string
    size: string
    region: string
    currentChallenges: string[]
  }
}

export interface AgentAnalysis {
  agentId: string
  dimensionScores: Map<string, number>
  insights: string[]
  recommendations: string[]
  risks: string[]
  opportunities: string[]
  confidence: number // 0-1
}

export interface AssessmentResult {
  organizationId: string
  timestamp: Date
  overallMaturityLevel: number
  maturityDetails: MaturityLevel
  categoryScores: {
    technical: number
    human: number
    business: number
    ai_adoption: number
  }
  dimensionScores: Map<string, number>
  topStrengths: string[]
  criticalGaps: string[]
  recommendations: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
  }
  roadmap: RoadmapItem[]
  estimatedROI: {
    year1: number
    year3: number
    year5: number
  }
  riskAnalysis: {
    high: string[]
    medium: string[]
    low: string[]
  }
}

export interface RoadmapItem {
  phase: number
  name: string
  description: string
  duration: string
  dependencies: string[]
  outcomes: string[]
  investment: string
  priority: 'critical' | 'high' | 'medium' | 'low'
}

export class AssessmentOrchestrator {
  private agents: Map<string, AssessmentAgent> = new Map()
  private assessmentCache: Map<string, AssessmentResult> = new Map()

  constructor() {
    this.initializeAgents()
  }

  private initializeAgents() {
    // Initialize core assessment agents
    this.registerAgent({
      id: 'technical_infrastructure_agent',
      name: 'Technical Infrastructure Analyst',
      description: 'Analyzes technical readiness and infrastructure maturity',
      dimensions: ['tech_infrastructure', 'data_quality', 'security_compliance', 'integration_capability', 'scalability'],
      analyze: this.createTechnicalAnalyzer()
    })

    this.registerAgent({
      id: 'human_capital_agent',
      name: 'Human Capital Analyst',
      description: 'Evaluates organizational culture and human readiness',
      dimensions: ['leadership_vision', 'culture_change', 'skills_talent', 'collaboration', 'employee_experience'],
      analyze: this.createHumanAnalyzer()
    })

    this.registerAgent({
      id: 'business_strategy_agent',
      name: 'Business Strategy Analyst',
      description: 'Assesses business alignment and strategic readiness',
      dimensions: ['strategy_alignment', 'process_optimization', 'customer_centricity', 'innovation_capability', 'financial_performance', 'partner_ecosystem', 'risk_management'],
      analyze: this.createBusinessAnalyzer()
    })

    this.registerAgent({
      id: 'ai_adoption_agent',
      name: 'AI Adoption Specialist',
      description: 'Evaluates current AI adoption and future potential',
      dimensions: ['ai_use_cases', 'ml_operations', 'ai_governance', 'data_science_maturity', 'automation_level', 'ai_infrastructure'],
      analyze: this.createAIAnalyzer()
    })
  }

  registerAgent(agent: AssessmentAgent) {
    this.agents.set(agent.id, agent)
  }

  async orchestrateAssessment(data: AssessmentData): Promise<AssessmentResult> {
    // Check cache first
    const cacheKey = this.generateCacheKey(data)
    if (this.assessmentCache.has(cacheKey)) {
      return this.assessmentCache.get(cacheKey)!
    }

    // Run parallel agent analyses
    const agentPromises = Array.from(this.agents.values()).map(agent => 
      agent.analyze(data).catch(error => {
        console.error(`Agent ${agent.id} failed:`, error)
        return null
      })
    )

    const agentResults = await Promise.all(agentPromises)
    const validResults = agentResults.filter(r => r !== null) as AgentAnalysis[]

    // Aggregate results
    const aggregatedScores = this.aggregateScores(validResults)
    const overallMaturityLevel = calculateOverallMaturityLevel(aggregatedScores)
    const maturityDetails = getMaturityLevel(overallMaturityLevel)!

    // Calculate category scores
    const categoryScores = {
      technical: this.calculateCategoryAverage('technical', aggregatedScores),
      human: this.calculateCategoryAverage('human', aggregatedScores),
      business: this.calculateCategoryAverage('business', aggregatedScores),
      ai_adoption: this.calculateCategoryAverage('ai_adoption', aggregatedScores)
    }

    // Generate insights and recommendations
    const insights = this.generateInsights(validResults, aggregatedScores)
    const roadmap = this.generateRoadmap(overallMaturityLevel, aggregatedScores, data.context)
    const roi = this.estimateROI(overallMaturityLevel, data.context)
    const risks = this.analyzeRisks(aggregatedScores, validResults)

    const result: AssessmentResult = {
      organizationId: data.organizationId,
      timestamp: new Date(),
      overallMaturityLevel,
      maturityDetails,
      categoryScores,
      dimensionScores: aggregatedScores,
      topStrengths: insights.strengths,
      criticalGaps: insights.gaps,
      recommendations: insights.recommendations,
      roadmap,
      estimatedROI: roi,
      riskAnalysis: risks
    }

    // Cache the result
    this.assessmentCache.set(cacheKey, result)

    return result
  }

  private aggregateScores(results: AgentAnalysis[]): Map<string, number> {
    const aggregated = new Map<string, number>()
    const counts = new Map<string, number>()

    results.forEach(result => {
      result.dimensionScores.forEach((score, dimension) => {
        const currentTotal = aggregated.get(dimension) || 0
        const currentCount = counts.get(dimension) || 0
        
        // Weight by agent confidence
        aggregated.set(dimension, currentTotal + score * result.confidence)
        counts.set(dimension, currentCount + result.confidence)
      })
    })

    // Calculate weighted averages
    const finalScores = new Map<string, number>()
    aggregated.forEach((total, dimension) => {
      const count = counts.get(dimension) || 1
      finalScores.set(dimension, total / count)
    })

    return finalScores
  }

  private calculateCategoryAverage(category: DimensionCategory, scores: Map<string, number>): number {
    const dimensions = this.getDimensionsByCategory(category)
    let total = 0
    let count = 0

    dimensions.forEach(dimension => {
      const score = scores.get(dimension.id)
      if (score !== undefined) {
        total += score
        count++
      }
    })

    return count > 0 ? total / count : 0
  }

  private generateInsights(results: AgentAnalysis[], scores: Map<string, number>) {
    const allInsights = results.flatMap(r => r.insights)
    const allRecommendations = results.flatMap(r => r.recommendations)
    
    // Identify top strengths (scores > 0.7)
    const strengths: string[] = []
    scores.forEach((score, dimension) => {
      if (score > 0.7) {
        strengths.push(`Strong ${dimension.replace(/_/g, ' ')} capabilities`)
      }
    })

    // Identify critical gaps (scores < 0.3)
    const gaps: string[] = []
    scores.forEach((score, dimension) => {
      if (score < 0.3) {
        gaps.push(`Critical gap in ${dimension.replace(/_/g, ' ')}`)
      }
    })

    // Categorize recommendations by timeframe
    const recommendations = {
      immediate: allRecommendations.filter(r => r.includes('immediate') || r.includes('now')),
      shortTerm: allRecommendations.filter(r => r.includes('month') || r.includes('quarter')),
      longTerm: allRecommendations.filter(r => r.includes('year') || r.includes('long'))
    }

    return { strengths, gaps, recommendations }
  }

  private generateRoadmap(maturityLevel: number, scores: Map<string, number>, context: any): RoadmapItem[] {
    const roadmap: RoadmapItem[] = []

    // Phase 1: Foundation (0-3 months)
    if (maturityLevel < 3) {
      roadmap.push({
        phase: 1,
        name: 'AI Foundation',
        description: 'Establish basic AI readiness and governance',
        duration: '3 months',
        dependencies: [],
        outcomes: ['AI strategy defined', 'Leadership alignment', 'Initial skills assessment'],
        investment: '$50K-$200K',
        priority: 'critical'
      })
    }

    // Phase 2: Pilot (3-9 months)
    roadmap.push({
      phase: 2,
      name: 'AI Pilot Projects',
      description: 'Launch targeted AI pilots in high-impact areas',
      duration: '6 months',
      dependencies: ['AI Foundation'],
      outcomes: ['3-5 AI pilots launched', 'ROI validated', 'Team upskilled'],
      investment: '$200K-$500K',
      priority: 'high'
    })

    // Phase 3: Scale (9-18 months)
    roadmap.push({
      phase: 3,
      name: 'AI Scaling',
      description: 'Scale successful pilots across the organization',
      duration: '9 months',
      dependencies: ['AI Pilot Projects'],
      outcomes: ['Enterprise AI platform', '10+ use cases in production', 'Culture transformation'],
      investment: '$500K-$2M',
      priority: 'high'
    })

    // Phase 4: Transform (18-36 months)
    roadmap.push({
      phase: 4,
      name: 'AI Transformation',
      description: 'Achieve AI-driven business transformation',
      duration: '18 months',
      dependencies: ['AI Scaling'],
      outcomes: ['AI-first operations', 'New business models', 'Industry leadership'],
      investment: '$2M-$10M',
      priority: 'medium'
    })

    return roadmap
  }

  private estimateROI(maturityLevel: number, context: any) {
    // Simplified ROI calculation based on maturity progression
    const baselineEfficiency = 0.1 // 10% efficiency gain per level
    const revenueImpact = 0.05 // 5% revenue impact per level
    
    return {
      year1: Math.round(maturityLevel * baselineEfficiency * 1000000),
      year3: Math.round(maturityLevel * (baselineEfficiency + revenueImpact) * 3000000),
      year5: Math.round(maturityLevel * (baselineEfficiency + revenueImpact * 2) * 5000000)
    }
  }

  private analyzeRisks(scores: Map<string, number>, results: AgentAnalysis[]) {
    const allRisks = results.flatMap(r => r.risks)
    
    return {
      high: allRisks.filter(r => r.includes('critical') || r.includes('high')),
      medium: allRisks.filter(r => r.includes('medium') || r.includes('moderate')),
      low: allRisks.filter(r => r.includes('low') || r.includes('minor'))
    }
  }

  private generateCacheKey(data: AssessmentData): string {
    return `${data.organizationId}-${JSON.stringify(Array.from(data.responses.entries()))}`
  }

  private getDimensionsByCategory(category: DimensionCategory): AssessmentDimension[] {
    // This would be imported from dimensions.ts
    return []
  }

  // Agent analyzers
  private createTechnicalAnalyzer() {
    return async (data: AssessmentData): Promise<AgentAnalysis> => {
      // Simplified technical analysis logic
      const scores = new Map<string, number>()
      const insights: string[] = []
      const recommendations: string[] = []
      const risks: string[] = []
      const opportunities: string[] = []

      // Analyze each technical dimension
      const technicalDimensions = ['tech_infrastructure', 'data_quality', 'security_compliance', 'integration_capability', 'scalability']
      technicalDimensions.forEach(dim => {
        const score = Math.random() * 0.8 + 0.2 // Placeholder scoring
        scores.set(dim, score)
        
        if (score < 0.5) {
          risks.push(`Low ${dim} maturity poses operational risk`)
          recommendations.push(`Invest in ${dim} improvements`)
        } else if (score > 0.7) {
          insights.push(`Strong ${dim} provides competitive advantage`)
          opportunities.push(`Leverage ${dim} for AI initiatives`)
        }
      })

      return {
        agentId: 'technical_infrastructure_agent',
        dimensionScores: scores,
        insights,
        recommendations,
        risks,
        opportunities,
        confidence: 0.85
      }
    }
  }

  private createHumanAnalyzer() {
    return async (data: AssessmentData): Promise<AgentAnalysis> => {
      const scores = new Map<string, number>()
      const insights: string[] = []
      const recommendations: string[] = []
      const risks: string[] = []
      const opportunities: string[] = []

      const humanDimensions = ['leadership_vision', 'culture_change', 'skills_talent', 'collaboration', 'employee_experience']
      humanDimensions.forEach(dim => {
        const score = Math.random() * 0.8 + 0.2
        scores.set(dim, score)
        
        if (score < 0.5) {
          risks.push(`${dim} gaps may hinder AI adoption`)
          recommendations.push(`Develop ${dim} capabilities`)
        } else if (score > 0.7) {
          insights.push(`${dim} strength enables transformation`)
          opportunities.push(`Build on ${dim} for change leadership`)
        }
      })

      return {
        agentId: 'human_capital_agent',
        dimensionScores: scores,
        insights,
        recommendations,
        risks,
        opportunities,
        confidence: 0.80
      }
    }
  }

  private createBusinessAnalyzer() {
    return async (data: AssessmentData): Promise<AgentAnalysis> => {
      const scores = new Map<string, number>()
      const insights: string[] = []
      const recommendations: string[] = []
      const risks: string[] = []
      const opportunities: string[] = []

      const businessDimensions = ['strategy_alignment', 'process_optimization', 'customer_centricity', 'innovation_capability', 'financial_performance', 'partner_ecosystem', 'risk_management']
      businessDimensions.forEach(dim => {
        const score = Math.random() * 0.8 + 0.2
        scores.set(dim, score)
        
        if (score < 0.5) {
          risks.push(`Weak ${dim} limits AI value realization`)
          recommendations.push(`Strengthen ${dim} foundation`)
        } else if (score > 0.7) {
          insights.push(`${dim} excellence drives AI success`)
          opportunities.push(`Use ${dim} for competitive advantage`)
        }
      })

      return {
        agentId: 'business_strategy_agent',
        dimensionScores: scores,
        insights,
        recommendations,
        risks,
        opportunities,
        confidence: 0.82
      }
    }
  }

  private createAIAnalyzer() {
    return async (data: AssessmentData): Promise<AgentAnalysis> => {
      const scores = new Map<string, number>()
      const insights: string[] = []
      const recommendations: string[] = []
      const risks: string[] = []
      const opportunities: string[] = []

      const aiAdoptionDimensions = ['ai_use_cases', 'ml_operations', 'ai_governance', 'data_science_maturity', 'automation_level', 'ai_infrastructure']
      aiAdoptionDimensions.forEach(dim => {
        const score = Math.random() * 0.8 + 0.2
        scores.set(dim, score)
        
        if (score < 0.5) {
          risks.push(`Low ${dim} maturity delays AI benefits`)
          recommendations.push(`Accelerate ${dim} development`)
        } else if (score > 0.7) {
          insights.push(`Advanced ${dim} enables AI leadership`)
          opportunities.push(`Expand ${dim} for innovation`)
        }
      })

      return {
        agentId: 'ai_adoption_agent',
        dimensionScores: scores,
        insights,
        recommendations,
        risks,
        opportunities,
        confidence: 0.88
      }
    }
  }
}

// Export singleton instance
export const assessmentOrchestrator = new AssessmentOrchestrator()