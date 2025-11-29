/**
 * Industry Benchmark Service
 *
 * Provides industry-specific benchmarks and peer comparisons for AI maturity assessments.
 * Benchmarks are calculated from aggregated assessment data and industry research.
 */

import { createClient } from '@/lib/supabase/server'

export interface IndustryBenchmark {
  industry: string
  sector?: string

  // Maturity metrics
  averageMaturityLevel: number
  medianMaturityLevel: number
  maturityDistribution: {
    level: number
    percentage: number
    count: number
  }[]

  // Technology adoption
  avgAIToolsAdopted: number
  commonAITools: Array<{
    name: string
    adoptionRate: number
  }>

  // Investment patterns
  avgAIBudgetPercentage: number
  avgAITeamSize: number

  // Readiness indicators
  avgDataMaturity: number
  avgTechStackSize: number
  cloudAdoptionRate: number

  // Sample size
  organizationCount: number
  lastUpdated: string
}

export interface PeerComparison {
  organization: {
    id: string
    name: string
    maturityLevel: number
  }

  industry: string

  // Rankings
  industryRank: number
  percentile: number

  // Comparisons (organization value vs industry average)
  maturityComparison: {
    organizationValue: number
    industryAverage: number
    difference: number
    betterThanPeers: boolean
  }

  aiToolsComparison: {
    organizationValue: number
    industryAverage: number
    difference: number
    betterThanPeers: boolean
  }

  dataMaturityComparison: {
    organizationValue: number
    industryAverage: number
    difference: number
    betterThanPeers: boolean
  }

  // Recommendations
  recommendations: string[]
  topPerformers: Array<{
    name: string
    maturityLevel: number
    keyStrengths: string[]
  }>
}

/**
 * Get industry benchmark data
 */
export async function getIndustryBenchmark(
  industry: string,
  sector?: string
): Promise<IndustryBenchmark | null> {
  const supabase = await createClient()

  try {
    // Build query for organizations in this industry
    let query = supabase
      .from('organizations')
      .select(`
        id,
        industry,
        employee_count,
        metadata
      `)
      .eq('industry', industry)

    if (sector) {
      query = query.eq('metadata->>sector', sector)
    }

    const { data: orgs, error } = await query

    if (error || !orgs || orgs.length === 0) {
      console.log(`[Benchmarks] No data found for industry: ${industry}`)
      return null
    }

    // Calculate maturity levels from assessment scores
    const maturityLevels = orgs
      .map(org => org.metadata?.latest_maturity_level)
      .filter((level): level is number => typeof level === 'number')

    if (maturityLevels.length === 0) {
      return null
    }

    // Calculate statistics
    const avgMaturity = maturityLevels.reduce((sum, level) => sum + level, 0) / maturityLevels.length
    const sortedLevels = [...maturityLevels].sort((a, b) => a - b)
    const medianMaturity = sortedLevels[Math.floor(sortedLevels.length / 2)]

    // Maturity distribution
    const distribution = Array.from({ length: 10 }, (_, level) => {
      const count = maturityLevels.filter(l => l === level).length
      return {
        level,
        percentage: (count / maturityLevels.length) * 100,
        count,
      }
    })

    // Technology metrics
    const techData = orgs
      .map(org => ({
        aiTools: org.metadata?.enriched?.tech?.length || 0,
        techStackSize: org.metadata?.enriched?.techStackSize || 0,
        hasCloud: org.metadata?.enriched?.cloudInfrastructure || false,
      }))

    const avgAITools = techData.reduce((sum, d) => sum + d.aiTools, 0) / techData.length
    const avgTechStack = techData.reduce((sum, d) => sum + d.techStackSize, 0) / techData.length
    const cloudAdoption = (techData.filter(d => d.hasCloud).length / techData.length) * 100

    // Extract common AI tools
    const allTools = orgs
      .flatMap(org => org.metadata?.enriched?.tech || [])
      .filter(tool => typeof tool === 'string')

    const toolCounts = allTools.reduce((acc, tool) => {
      acc[tool] = (acc[tool] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const commonTools = Object.entries(toolCounts)
      .map(([name, count]) => ({
        name,
        adoptionRate: (count / orgs.length) * 100,
      }))
      .sort((a, b) => b.adoptionRate - a.adoptionRate)
      .slice(0, 10)

    return {
      industry,
      sector,

      averageMaturityLevel: Math.round(avgMaturity * 10) / 10,
      medianMaturityLevel: medianMaturity,
      maturityDistribution: distribution,

      avgAIToolsAdopted: Math.round(avgAITools * 10) / 10,
      commonAITools: commonTools,

      avgAIBudgetPercentage: 0, // TODO: Add when budget data available
      avgAITeamSize: 0, // TODO: Add when team size data available

      avgDataMaturity: Math.round(avgMaturity * 10) / 10, // Simplified for now
      avgTechStackSize: Math.round(avgTechStack),
      cloudAdoptionRate: Math.round(cloudAdoption * 10) / 10,

      organizationCount: orgs.length,
      lastUpdated: new Date().toISOString(),
    }
  } catch (error) {
    console.error(`[Benchmarks] Failed to calculate benchmark for ${industry}:`, error)
    return null
  }
}

/**
 * Get peer comparison for an organization
 */
export async function getPeerComparison(
  organizationId: string
): Promise<PeerComparison | null> {
  const supabase = await createClient()

  try {
    // Get organization data
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, industry, metadata')
      .eq('id', organizationId)
      .single()

    if (orgError || !org || !org.industry) {
      console.log(`[Benchmarks] Organization not found or missing industry: ${organizationId}`)
      return null
    }

    const orgMaturity = org.metadata?.latest_maturity_level
    if (typeof orgMaturity !== 'number') {
      console.log(`[Benchmarks] No maturity level for org: ${organizationId}`)
      return null
    }

    // Get industry benchmark
    const benchmark = await getIndustryBenchmark(org.industry)
    if (!benchmark) {
      return null
    }

    // Get all orgs in industry for ranking
    const { data: industryOrgs } = await supabase
      .from('organizations')
      .select('id, name, metadata')
      .eq('industry', org.industry)

    if (!industryOrgs) {
      return null
    }

    // Calculate rankings
    const rankedOrgs = industryOrgs
      .map(o => ({
        id: o.id,
        name: o.name,
        maturityLevel: o.metadata?.latest_maturity_level || 0,
      }))
      .sort((a, b) => b.maturityLevel - a.maturityLevel)

    const rank = rankedOrgs.findIndex(o => o.id === organizationId) + 1
    const percentile = ((rankedOrgs.length - rank) / rankedOrgs.length) * 100

    // Organization metrics
    const orgAITools = org.metadata?.enriched?.tech?.length || 0
    const orgDataMaturity = orgMaturity // Simplified

    // Generate recommendations
    const recommendations: string[] = []

    if (orgMaturity < benchmark.averageMaturityLevel) {
      recommendations.push(
        `Your maturity level (${orgMaturity}) is below industry average (${benchmark.averageMaturityLevel}). Focus on foundational AI capabilities.`
      )
    }

    if (orgAITools < benchmark.avgAIToolsAdopted) {
      recommendations.push(
        `Consider adopting more AI tools. Industry average is ${Math.round(benchmark.avgAIToolsAdopted)} tools.`
      )
    }

    if (benchmark.cloudAdoptionRate > 70 && !org.metadata?.enriched?.cloudInfrastructure) {
      recommendations.push(
        `${Math.round(benchmark.cloudAdoptionRate)}% of peers use cloud infrastructure. Consider cloud migration.`
      )
    }

    // Top performers (top 3)
    const topPerformers = rankedOrgs.slice(0, 3).map(o => ({
      name: o.name,
      maturityLevel: o.maturityLevel,
      keyStrengths: ['Advanced AI implementation', 'Strong data infrastructure'], // TODO: Add real strength analysis
    }))

    return {
      organization: {
        id: org.id,
        name: org.name,
        maturityLevel: orgMaturity,
      },

      industry: org.industry,

      industryRank: rank,
      percentile: Math.round(percentile * 10) / 10,

      maturityComparison: {
        organizationValue: orgMaturity,
        industryAverage: benchmark.averageMaturityLevel,
        difference: Math.round((orgMaturity - benchmark.averageMaturityLevel) * 10) / 10,
        betterThanPeers: orgMaturity > benchmark.averageMaturityLevel,
      },

      aiToolsComparison: {
        organizationValue: orgAITools,
        industryAverage: benchmark.avgAIToolsAdopted,
        difference: Math.round((orgAITools - benchmark.avgAIToolsAdopted) * 10) / 10,
        betterThanPeers: orgAITools > benchmark.avgAIToolsAdopted,
      },

      dataMaturityComparison: {
        organizationValue: orgDataMaturity,
        industryAverage: benchmark.avgDataMaturity,
        difference: Math.round((orgDataMaturity - benchmark.avgDataMaturity) * 10) / 10,
        betterThanPeers: orgDataMaturity > benchmark.avgDataMaturity,
      },

      recommendations,
      topPerformers,
    }
  } catch (error) {
    console.error(`[Benchmarks] Failed to generate peer comparison:`, error)
    return null
  }
}

/**
 * Get list of all industries with benchmark data
 */
export async function getAvailableIndustries(): Promise<Array<{
  industry: string
  organizationCount: number
}>> {
  const supabase = await createClient()

  try {
    const { data: industries, error } = await supabase
      .from('organizations')
      .select('industry')
      .not('industry', 'is', null)

    if (error || !industries) {
      return []
    }

    // Count organizations per industry
    const counts = industries.reduce((acc, { industry }) => {
      if (industry) {
        acc[industry] = (acc[industry] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    return Object.entries(counts)
      .map(([industry, count]) => ({
        industry,
        organizationCount: count,
      }))
      .sort((a, b) => b.organizationCount - a.organizationCount)
  } catch (error) {
    console.error('[Benchmarks] Failed to get available industries:', error)
    return []
  }
}

/**
 * Calculate maturity level from assessment score (0-100 to 0-9)
 */
export function calculateMaturityLevel(assessmentScore: number): number {
  // 0-100 score maps to 0-9 maturity levels
  // 0-10: Level 0, 11-20: Level 1, etc.
  return Math.min(Math.floor(assessmentScore / 10), 9)
}

/**
 * Update organization's latest maturity level in metadata
 */
export async function updateOrganizationMaturityLevel(
  organizationId: string,
  assessmentScore: number
): Promise<void> {
  const supabase = await createClient()
  const maturityLevel = calculateMaturityLevel(assessmentScore)

  const { error } = await supabase
    .from('organizations')
    .update({
      metadata: supabase.raw(`
        COALESCE(metadata, '{}'::jsonb) ||
        jsonb_build_object('latest_maturity_level', ${maturityLevel})
      `),
      updated_at: new Date().toISOString(),
    })
    .eq('id', organizationId)

  if (error) {
    throw new Error(`Failed to update maturity level: ${error.message}`)
  }

  console.log(`[Benchmarks] Updated org ${organizationId} maturity level to ${maturityLevel}`)
}
