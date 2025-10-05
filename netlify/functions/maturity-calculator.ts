import { Handler } from '@netlify/functions'

// Assessment dimensions mapping
const dimensionCategories = {
  technical: ['tech_infrastructure', 'data_quality', 'security_compliance', 'integration_capability', 'scalability'],
  human: ['leadership_vision', 'culture_change', 'skills_talent', 'collaboration', 'employee_experience'],
  business: ['strategy_alignment', 'process_optimization', 'customer_centricity', 'innovation_capability', 'financial_performance', 'partner_ecosystem', 'risk_management'],
  ai_adoption: ['ai_use_cases', 'ml_operations', 'ai_governance', 'data_science_maturity', 'automation_level', 'ai_infrastructure']
}

interface MaturityResults {
  organizationId: string
  overallMaturityLevel: number
  categoryScores: {
    technical: number
    human: number
    business: number
    ai_adoption: number
  }
  dimensionScores: Record<string, number>
  topStrengths: string[]
  criticalGaps: string[]
  recommendations: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
  }
  roadmap: Array<{
    phase: number
    name: string
    description: string
    duration: string
    priority: string
    investment: string
  }>
  estimatedROI: {
    year1: number
    year3: number
    year5: number
  }
}

// Mock assessment data access (replace with actual database)
const assessmentData = new Map<string, any[]>()

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { organizationId, includeRecommendations = true, includeRoadmap = true } = JSON.parse(event.body || '{}')

    if (!organizationId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'organizationId is required' })
      }
    }

    // Get assessment data for organization
    const orgData = assessmentData.get(organizationId) || []
    
    if (orgData.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'No assessment data found for organization' })
      }
    }

    // Calculate dimension scores
    const dimensionScores: Record<string, number> = {}
    const dimensionCounts: Record<string, number> = {}

    orgData.forEach(dataPoint => {
      const { dimensionId, scoreValue } = dataPoint
      if (!dimensionScores[dimensionId]) {
        dimensionScores[dimensionId] = 0
        dimensionCounts[dimensionId] = 0
      }
      dimensionScores[dimensionId] += scoreValue
      dimensionCounts[dimensionId]++
    })

    // Average scores per dimension
    Object.keys(dimensionScores).forEach(dim => {
      dimensionScores[dim] = dimensionScores[dim] / dimensionCounts[dim]
    })

    // Calculate category scores
    const categoryScores = {
      technical: calculateCategoryAverage('technical', dimensionScores),
      human: calculateCategoryAverage('human', dimensionScores),
      business: calculateCategoryAverage('business', dimensionScores),
      ai_adoption: calculateCategoryAverage('ai_adoption', dimensionScores)
    }

    // Calculate overall maturity level (0-9)
    const overallMaturityLevel = Math.round(
      (categoryScores.technical + categoryScores.human + categoryScores.business + categoryScores.ai_adoption) / 4
    )

    // Identify strengths and gaps
    const topStrengths = Object.entries(dimensionScores)
      .filter(([_, score]) => score >= 7)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([dim, score]) => `${dim.replace(/_/g, ' ')} (${score.toFixed(1)}/10)`)

    const criticalGaps = Object.entries(dimensionScores)
      .filter(([_, score]) => score <= 4)
      .sort(([,a], [,b]) => a - b)
      .slice(0, 3)
      .map(([dim, score]) => `${dim.replace(/_/g, ' ')} (${score.toFixed(1)}/10)`)

    // Generate recommendations
    const recommendations = generateRecommendations(overallMaturityLevel, dimensionScores)
    
    // Generate roadmap
    const roadmap = includeRoadmap ? generateRoadmap(overallMaturityLevel) : []

    // Estimate ROI
    const estimatedROI = calculateROI(overallMaturityLevel)

    const results: MaturityResults = {
      organizationId,
      overallMaturityLevel,
      categoryScores,
      dimensionScores,
      topStrengths,
      criticalGaps,
      recommendations,
      roadmap,
      estimatedROI
    }

    console.log(`Maturity calculated for ${organizationId}:`, {
      overallLevel: overallMaturityLevel,
      categoryScores,
      dataPointsAnalyzed: orgData.length
    })

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(results)
    }

  } catch (error) {
    console.error('Error calculating maturity scores:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to calculate maturity scores',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}

function calculateCategoryAverage(category: keyof typeof dimensionCategories, dimensionScores: Record<string, number>): number {
  const categoryDimensions = dimensionCategories[category]
  const scores = categoryDimensions
    .map(dim => dimensionScores[dim])
    .filter(score => score !== undefined)
  
  return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
}

function generateRecommendations(maturityLevel: number, dimensionScores: Record<string, number>) {
  const immediate: string[] = []
  const shortTerm: string[] = []
  const longTerm: string[] = []

  // Immediate actions (0-3 months)
  if (maturityLevel < 3) {
    immediate.push('Establish AI governance framework and leadership commitment')
    immediate.push('Conduct comprehensive skills gap analysis')
    immediate.push('Define AI strategy aligned with business objectives')
  }

  Object.entries(dimensionScores).forEach(([dim, score]) => {
    if (score < 3) {
      immediate.push(`Address critical gaps in ${dim.replace(/_/g, ' ')}`)
    }
  })

  // Short-term actions (3-12 months)
  shortTerm.push('Launch AI pilot projects in high-impact areas')
  shortTerm.push('Implement data governance and quality improvements')
  shortTerm.push('Build AI training and upskilling programs')

  // Long-term actions (1-3 years)
  longTerm.push('Scale successful AI initiatives across organization')
  longTerm.push('Develop advanced AI capabilities and infrastructure')
  longTerm.push('Achieve AI-driven business transformation')

  return { immediate, shortTerm, longTerm }
}

function generateRoadmap(maturityLevel: number) {
  const roadmap = []

  // Phase 1: Foundation
  if (maturityLevel < 4) {
    roadmap.push({
      phase: 1,
      name: 'AI Foundation',
      description: 'Establish AI readiness and governance',
      duration: '3-6 months',
      priority: 'critical',
      investment: '$50K-$200K'
    })
  }

  // Phase 2: Pilot
  roadmap.push({
    phase: 2,
    name: 'AI Pilot Projects',
    description: 'Launch targeted AI initiatives',
    duration: '6-12 months',
    priority: 'high',
    investment: '$200K-$500K'
  })

  // Phase 3: Scale
  roadmap.push({
    phase: 3,
    name: 'AI Scaling',
    description: 'Scale successful pilots enterprise-wide',
    duration: '12-18 months',
    priority: 'high',
    investment: '$500K-$2M'
  })

  // Phase 4: Transform
  roadmap.push({
    phase: 4,
    name: 'AI Transformation',
    description: 'Achieve AI-native operations',
    duration: '18-36 months',
    priority: 'medium',
    investment: '$2M-$10M'
  })

  return roadmap
}

function calculateROI(maturityLevel: number) {
  const baseEfficiency = 0.1 // 10% efficiency gain per level
  const revenueImpact = 0.05 // 5% revenue impact per level
  
  return {
    year1: Math.round(maturityLevel * baseEfficiency * 1000000),
    year3: Math.round(maturityLevel * (baseEfficiency + revenueImpact) * 3000000),
    year5: Math.round(maturityLevel * (baseEfficiency + revenueImpact * 2) * 5000000)
  }
}