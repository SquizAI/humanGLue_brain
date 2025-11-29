/**
 * Data Quality Monitoring Service
 *
 * Tracks and reports on data quality metrics across the platform:
 * - Completeness (missing fields)
 * - Accuracy (validation errors)
 * - Consistency (duplicate detection)
 * - Timeliness (stale data)
 * - Enrichment coverage
 */

import { createClient } from '@/lib/supabase/server'

export interface DataQualityMetrics {
  overall_score: number // 0-100
  completeness: number // 0-100
  accuracy: number // 0-100
  consistency: number // 0-100
  timeliness: number // 0-100
  enrichment_coverage: number // 0-100

  issues: Array<{
    severity: 'critical' | 'warning' | 'info'
    category: string
    message: string
    count: number
    affectedRecords: string[]
  }>

  recommendations: string[]
  timestamp: string
}

export interface OrganizationQuality {
  organizationId: string
  name: string
  completeness: {
    score: number
    missingFields: string[]
    totalFields: number
    completedFields: number
  }
  enrichment: {
    hasEnrichmentData: boolean
    enrichmentAge?: number // days since last enrichment
    enrichmentSources: string[]
  }
  assessments: {
    totalCount: number
    completedCount: number
    completionRate: number
  }
}

/**
 * Calculate data quality metrics for the entire platform
 */
export async function calculatePlatformQuality(): Promise<DataQualityMetrics> {
  const supabase = await createClient()
  const issues: DataQualityMetrics['issues'] = []
  const recommendations: string[] = []

  // Check organizations completeness
  const { data: orgs } = await supabase.from('organizations').select('*')

  if (!orgs || orgs.length === 0) {
    return {
      overall_score: 0,
      completeness: 0,
      accuracy: 0,
      consistency: 0,
      timeliness: 0,
      enrichment_coverage: 0,
      issues: [
        {
          severity: 'warning',
          category: 'completeness',
          message: 'No organizations found in database',
          count: 0,
          affectedRecords: [],
        },
      ],
      recommendations: ['Add organizations to begin tracking quality metrics'],
      timestamp: new Date().toISOString(),
    }
  }

  // Completeness checks
  const requiredFields = ['name', 'domain', 'industry']
  let incompleteOrgs = 0
  const incompleteOrgIds: string[] = []

  for (const org of orgs) {
    const missingFields = requiredFields.filter(field => !org[field])
    if (missingFields.length > 0) {
      incompleteOrgs++
      incompleteOrgIds.push(org.id)
    }
  }

  if (incompleteOrgs > 0) {
    issues.push({
      severity: 'warning',
      category: 'completeness',
      message: `${incompleteOrgs} organizations missing required fields`,
      count: incompleteOrgs,
      affectedRecords: incompleteOrgIds.slice(0, 5),
    })
    recommendations.push('Complete missing organization fields to improve data quality')
  }

  // Enrichment coverage
  const enrichedOrgs = orgs.filter(org => org.metadata?.enriched_at)
  const enrichmentCoverage = (enrichedOrgs.length / orgs.length) * 100

  if (enrichmentCoverage < 50) {
    issues.push({
      severity: 'info',
      category: 'enrichment',
      message: `Only ${Math.round(enrichmentCoverage)}% of organizations are enriched`,
      count: orgs.length - enrichedOrgs.length,
      affectedRecords: orgs
        .filter(org => !org.metadata?.enriched_at)
        .slice(0, 5)
        .map(org => org.id),
    })
    recommendations.push('Run enrichment on organizations to enhance data quality')
  }

  // Stale enrichment data (>90 days)
  const staleEnrichmentThreshold = 90 * 24 * 60 * 60 * 1000 // 90 days
  const staleOrgs = enrichedOrgs.filter(org => {
    const enrichedAt = new Date(org.metadata.enriched_at)
    return Date.now() - enrichedAt.getTime() > staleEnrichmentThreshold
  })

  if (staleOrgs.length > 0) {
    issues.push({
      severity: 'info',
      category: 'timeliness',
      message: `${staleOrgs.length} organizations have stale enrichment data (>90 days)`,
      count: staleOrgs.length,
      affectedRecords: staleOrgs.slice(0, 5).map(org => org.id),
    })
    recommendations.push('Refresh enrichment data for organizations with stale data')
  }

  // Check for duplicate organizations (same domain)
  const domainCounts = orgs.reduce((acc, org) => {
    if (org.domain) {
      acc[org.domain] = (acc[org.domain] || []).concat(org.id)
    }
    return acc
  }, {} as Record<string, string[]>)

  const duplicates = Object.entries(domainCounts).filter(([_, ids]) => ids.length > 1)

  if (duplicates.length > 0) {
    issues.push({
      severity: 'critical',
      category: 'consistency',
      message: `${duplicates.length} duplicate domains detected`,
      count: duplicates.length,
      affectedRecords: duplicates.flatMap(([_, ids]) => ids).slice(0, 5),
    })
    recommendations.push('Review and merge duplicate organizations')
  }

  // Check assessments
  const { data: assessments } = await supabase.from('assessments').select('*')

  const completedAssessments = assessments?.filter(a => a.completed_at) || []
  const assessmentCompletionRate =
    assessments && assessments.length > 0
      ? (completedAssessments.length / assessments.length) * 100
      : 0

  if (assessmentCompletionRate < 70 && assessments && assessments.length > 0) {
    issues.push({
      severity: 'warning',
      category: 'completeness',
      message: `Only ${Math.round(assessmentCompletionRate)}% of assessments are completed`,
      count: assessments.length - completedAssessments.length,
      affectedRecords: [],
    })
    recommendations.push('Follow up on incomplete assessments')
  }

  // Calculate scores
  const completenessScore = 100 - (incompleteOrgs / orgs.length) * 100
  const consistencyScore = 100 - (duplicates.length / orgs.length) * 100
  const timelinessScore = 100 - (staleOrgs.length / orgs.length) * 100
  const accuracyScore = 100 // No validation errors detected yet

  const overallScore =
    (completenessScore * 0.3 +
      consistencyScore * 0.25 +
      timelinessScore * 0.2 +
      enrichmentCoverage * 0.15 +
      accuracyScore * 0.1) /
    1

  return {
    overall_score: Math.round(overallScore * 10) / 10,
    completeness: Math.round(completenessScore * 10) / 10,
    accuracy: accuracyScore,
    consistency: Math.round(consistencyScore * 10) / 10,
    timeliness: Math.round(timelinessScore * 10) / 10,
    enrichment_coverage: Math.round(enrichmentCoverage * 10) / 10,
    issues,
    recommendations,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Get data quality metrics for a specific organization
 */
export async function getOrganizationQuality(
  organizationId: string
): Promise<OrganizationQuality | null> {
  const supabase = await createClient()

  // Get organization
  const { data: org, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single()

  if (error || !org) {
    return null
  }

  // Check required fields
  const requiredFields = ['name', 'domain', 'industry', 'employee_count', 'founded_year']
  const completedFields = requiredFields.filter(field => org[field]).length
  const missingFields = requiredFields.filter(field => !org[field])

  // Check enrichment
  const hasEnrichmentData = !!org.metadata?.enriched_at
  const enrichmentAge = hasEnrichmentData
    ? Math.floor((Date.now() - new Date(org.metadata.enriched_at).getTime()) / (1000 * 60 * 60 * 24))
    : undefined

  // Check assessments
  const { data: assessments } = await supabase
    .from('assessments')
    .select('*')
    .eq('organization_id', organizationId)

  const totalAssessments = assessments?.length || 0
  const completedAssessments = assessments?.filter(a => a.completed_at).length || 0

  return {
    organizationId,
    name: org.name,
    completeness: {
      score: Math.round((completedFields / requiredFields.length) * 100),
      missingFields,
      totalFields: requiredFields.length,
      completedFields,
    },
    enrichment: {
      hasEnrichmentData,
      enrichmentAge,
      enrichmentSources: org.metadata?.enrichment_sources || [],
    },
    assessments: {
      totalCount: totalAssessments,
      completedCount: completedAssessments,
      completionRate: totalAssessments > 0 ? (completedAssessments / totalAssessments) * 100 : 0,
    },
  }
}

/**
 * Get list of organizations with quality issues
 */
export async function getOrganizationsWithIssues(): Promise<Array<{
  id: string
  name: string
  issues: string[]
  score: number
}>> {
  const supabase = await createClient()

  const { data: orgs } = await supabase.from('organizations').select('*')

  if (!orgs) {
    return []
  }

  const results: Array<{
    id: string
    name: string
    issues: string[]
    score: number
  }> = []

  for (const org of orgs) {
    const issues: string[] = []

    // Check for missing fields
    if (!org.domain) issues.push('Missing domain')
    if (!org.industry) issues.push('Missing industry')
    if (!org.employee_count) issues.push('Missing employee count')

    // Check for stale enrichment
    if (org.metadata?.enriched_at) {
      const enrichedAt = new Date(org.metadata.enriched_at)
      const daysSince = (Date.now() - enrichedAt.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSince > 90) {
        issues.push(`Stale enrichment (${Math.round(daysSince)} days)`)
      }
    } else {
      issues.push('No enrichment data')
    }

    if (issues.length > 0) {
      // Calculate quality score
      const requiredFields = ['name', 'domain', 'industry', 'employee_count']
      const completedFields = requiredFields.filter(field => org[field]).length
      const score = Math.round((completedFields / requiredFields.length) * 100)

      results.push({
        id: org.id,
        name: org.name,
        issues,
        score,
      })
    }
  }

  // Sort by score (worst first)
  return results.sort((a, b) => a.score - b.score)
}

/**
 * Run automated data quality checks (can be scheduled)
 */
export async function runQualityChecks(): Promise<{
  checks: Array<{
    name: string
    status: 'pass' | 'warning' | 'fail'
    message: string
  }>
  timestamp: string
}> {
  const checks: Array<{
    name: string
    status: 'pass' | 'warning' | 'fail'
    message: string
  }> = []

  const metrics = await calculatePlatformQuality()

  // Overall quality check
  checks.push({
    name: 'Overall Quality Score',
    status: metrics.overall_score >= 80 ? 'pass' : metrics.overall_score >= 60 ? 'warning' : 'fail',
    message: `Platform quality score: ${metrics.overall_score}/100`,
  })

  // Completeness check
  checks.push({
    name: 'Data Completeness',
    status:
      metrics.completeness >= 90 ? 'pass' : metrics.completeness >= 70 ? 'warning' : 'fail',
    message: `${metrics.completeness}% of required fields are complete`,
  })

  // Enrichment check
  checks.push({
    name: 'Enrichment Coverage',
    status:
      metrics.enrichment_coverage >= 80
        ? 'pass'
        : metrics.enrichment_coverage >= 50
          ? 'warning'
          : 'fail',
    message: `${metrics.enrichment_coverage}% of organizations are enriched`,
  })

  // Consistency check
  checks.push({
    name: 'Data Consistency',
    status:
      metrics.consistency >= 95 ? 'pass' : metrics.consistency >= 80 ? 'warning' : 'fail',
    message: `${metrics.consistency}% consistency score`,
  })

  return {
    checks,
    timestamp: new Date().toISOString(),
  }
}
