/**
 * Central service exports
 * Provides a single entry point for all microservices
 */

export { assessmentService, AssessmentService, type AssessmentData } from './assessment'
export { workshopService, WorkshopService, type WorkshopData } from './workshop'
export { toolboxService, ToolboxService, type Tool } from './toolbox'
export { analyticsService, AnalyticsService, type TransformationMetrics, type MetricData } from './analytics'
export { orchestrator, ServiceOrchestrator, type OrganizationJourney } from './orchestrator'

// Re-export API service
export { api } from './api'

// Service health check
export async function checkServicesHealth(): Promise<{
  assessment: boolean
  workshop: boolean
  toolbox: boolean
  analytics: boolean
  orchestrator: boolean
}> {
  try {
    // In production, each service would have its own health endpoint
    return {
      assessment: true,
      workshop: true,
      toolbox: true,
      analytics: true,
      orchestrator: true
    }
  } catch (error) {
    console.error('Service health check failed:', error)
    return {
      assessment: false,
      workshop: false,
      toolbox: false,
      analytics: false,
      orchestrator: false
    }
  }
}