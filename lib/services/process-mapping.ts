/**
 * Process & Communication Mapping Service
 *
 * Maps business processes, communication channels, and information flows
 * during assessments to identify automation and AI enhancement opportunities.
 */

import { createClient } from '@/lib/supabase/server'

// =====================================================
// TYPES
// =====================================================

export interface BusinessProcess {
  id: string
  organizationId: string
  processName: string
  processCode: string
  processCategory: ProcessCategory
  description?: string
  ownerRole?: string
  department?: string
  frequency?: Frequency
  averageDurationMinutes?: number
  manualEffortPercentage?: number
  automationScore?: number
  aiEnhancementScore?: number
  priorityRank?: number
  currentState: ProcessState
  targetState?: ProcessState
  steps?: ProcessStep[]
}

export interface ProcessStep {
  id: string
  processId: string
  stepNumber: number
  stepName: string
  stepCode: string
  description?: string
  responsibleRole?: string
  stepType: StepType
  isAutomatable: boolean
  automationComplexity?: 'simple' | 'moderate' | 'complex'
  requiresHumanJudgment: boolean
  aiCanAssist: boolean
  averageDurationMinutes?: number
  waitTimeMinutes?: number
  systemsInvolved?: string[]
  dataInputs?: string[]
  dataOutputs?: string[]
}

export interface CommunicationChannel {
  id: string
  organizationId: string
  channelName: string
  channelType: ChannelType
  channelProvider?: string
  primaryUseCase?: string
  departmentsUsing?: string[]
  userCount?: number
  dailyMessageVolume?: number
  responseTimeAvgMinutes?: number
  isIntegrated: boolean
  integrationType?: 'api' | 'webhook' | 'manual' | 'none'
  apiAvailable: boolean
  aiMonitoringPotential?: number
  automationPotential?: number
  humanglueEmbeddable: boolean
}

export interface InformationFlow {
  id: string
  organizationId: string
  flowName: string
  flowCode: string
  sourceType: FlowEndpointType
  sourceId?: string
  sourceName: string
  destinationType: FlowEndpointType
  destinationId?: string
  destinationName: string
  dataType: DataType
  informationSensitivity: SensitivityLevel
  frequency: Frequency
  volumePerPeriod?: number
  reliabilityScore?: number
  bottleneckScore?: number
  canBeAutomated: boolean
  aiEnhancementOpportunity?: string
}

export interface TeamStructure {
  id: string
  organizationId: string
  teamName: string
  teamCode: string
  department?: string
  parentTeamId?: string
  level: number
  description?: string
  teamSize?: number
  primaryFunction?: string
  aiLiteracyScore?: number
  changeReadinessScore?: number
  children?: TeamStructure[]
}

export interface RoleDefinition {
  id: string
  organizationId: string
  teamId: string
  roleName: string
  roleCode: string
  description?: string
  responsibilities?: string[]
  requiredSkills?: string[]
  aiImpactLevel: 'high' | 'medium' | 'low' | 'none'
  augmentationOpportunities?: string[]
  displacementRisk?: number
  upskillingPriority?: number
  processesInvolved?: string[]
}

export interface AutomationOpportunity {
  id: string
  organizationId: string
  opportunityName: string
  opportunityCode: string
  opportunityType: OpportunityType
  processId?: string
  channelId?: string
  flowId?: string
  description?: string
  currentPainPoints?: string[]
  proposedSolution?: string
  timeSavingsHoursWeekly?: number
  costSavingsMonthly?: number
  qualityImprovementScore?: number
  employeeSatisfactionImpact: 'positive' | 'neutral' | 'negative'
  implementationComplexity: 'simple' | 'moderate' | 'complex'
  estimatedImplementationWeeks?: number
  requiredTools?: string[]
  dependencies?: string[]
  priorityScore?: number
  quickWin: boolean
  strategicImportance: 'critical' | 'high' | 'medium' | 'low'
  status: OpportunityStatus
}

export type ProcessCategory =
  | 'sales'
  | 'marketing'
  | 'operations'
  | 'finance'
  | 'hr'
  | 'customer_service'
  | 'product'
  | 'engineering'
  | 'legal'
  | 'other'

export type ProcessState = 'manual' | 'partially_automated' | 'fully_automated' | 'ai_enhanced'

export type StepType =
  | 'decision'
  | 'action'
  | 'communication'
  | 'data_entry'
  | 'review'
  | 'approval'
  | 'notification'
  | 'integration'
  | 'wait'

export type ChannelType =
  | 'email'
  | 'instant_messaging'
  | 'video_conferencing'
  | 'phone'
  | 'project_management'
  | 'crm'
  | 'erp'
  | 'custom'
  | 'in_person'

export type FlowEndpointType = 'process' | 'channel' | 'system' | 'person' | 'external'

export type DataType =
  | 'document'
  | 'message'
  | 'notification'
  | 'data_record'
  | 'approval'
  | 'report'
  | 'request'
  | 'response'
  | 'other'

export type SensitivityLevel = 'public' | 'internal' | 'confidential' | 'restricted'

export type Frequency =
  | 'realtime'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'annually'
  | 'on_demand'

export type OpportunityType =
  | 'rpa'
  | 'ai_assistant'
  | 'workflow_automation'
  | 'chatbot'
  | 'data_pipeline'
  | 'document_processing'
  | 'decision_support'
  | 'other'

export type OpportunityStatus =
  | 'identified'
  | 'analyzed'
  | 'approved'
  | 'in_progress'
  | 'implemented'
  | 'deferred'
  | 'rejected'

// =====================================================
// PROCESS MAPPING
// =====================================================

/**
 * Create or update a business process from assessment responses
 */
export async function upsertBusinessProcess(
  organizationId: string,
  processData: Partial<BusinessProcess> & { processCode: string },
  assessmentId?: string
): Promise<BusinessProcess> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('business_processes')
    .upsert(
      {
        organization_id: organizationId,
        process_code: processData.processCode,
        process_name: processData.processName || processData.processCode,
        process_category: processData.processCategory || 'other',
        description: processData.description,
        owner_role: processData.ownerRole,
        department: processData.department,
        frequency: processData.frequency,
        average_duration_minutes: processData.averageDurationMinutes,
        manual_effort_percentage: processData.manualEffortPercentage,
        automation_score: processData.automationScore,
        ai_enhancement_score: processData.aiEnhancementScore,
        priority_rank: processData.priorityRank,
        current_state: processData.currentState || 'manual',
        target_state: processData.targetState,
        assessment_id: assessmentId,
        last_assessed_at: new Date().toISOString(),
      },
      { onConflict: 'organization_id,process_code' }
    )
    .select()
    .single()

  if (error) throw error

  return mapProcessFromDb(data)
}

/**
 * Add steps to a business process
 */
export async function addProcessSteps(
  processId: string,
  steps: Array<Omit<ProcessStep, 'id' | 'processId'>>
): Promise<ProcessStep[]> {
  const supabase = await createClient()

  const stepsToInsert = steps.map((step, index) => ({
    process_id: processId,
    step_number: step.stepNumber || index + 1,
    step_name: step.stepName,
    step_code: step.stepCode || `STEP_${String(index + 1).padStart(3, '0')}`,
    description: step.description,
    responsible_role: step.responsibleRole,
    step_type: step.stepType,
    is_automatable: step.isAutomatable,
    automation_complexity: step.automationComplexity,
    requires_human_judgment: step.requiresHumanJudgment,
    ai_can_assist: step.aiCanAssist,
    average_duration_minutes: step.averageDurationMinutes,
    wait_time_minutes: step.waitTimeMinutes,
    systems_involved: step.systemsInvolved,
    data_inputs: step.dataInputs,
    data_outputs: step.dataOutputs,
  }))

  const { data, error } = await supabase.from('process_steps').upsert(stepsToInsert, {
    onConflict: 'process_id,step_code',
  })

  if (error) throw error

  // Fetch the created steps
  const { data: createdSteps } = await supabase
    .from('process_steps')
    .select('*')
    .eq('process_id', processId)
    .order('step_number')

  return (createdSteps || []).map(mapStepFromDb)
}

/**
 * Get all processes for an organization
 */
export async function getOrganizationProcesses(
  organizationId: string,
  options?: {
    category?: ProcessCategory
    includeSteps?: boolean
    sortBy?: 'automation_score' | 'priority_rank' | 'name'
  }
): Promise<BusinessProcess[]> {
  const supabase = await createClient()

  let query = supabase.from('business_processes').select('*').eq('organization_id', organizationId)

  if (options?.category) {
    query = query.eq('process_category', options.category)
  }

  switch (options?.sortBy) {
    case 'automation_score':
      query = query.order('automation_score', { ascending: false })
      break
    case 'priority_rank':
      query = query.order('priority_rank', { ascending: true })
      break
    default:
      query = query.order('process_name')
  }

  const { data: processes, error } = await query

  if (error) throw error
  if (!processes) return []

  const mappedProcesses = processes.map(mapProcessFromDb)

  // Optionally include steps
  if (options?.includeSteps) {
    for (const process of mappedProcesses) {
      const { data: steps } = await supabase
        .from('process_steps')
        .select('*')
        .eq('process_id', process.id)
        .order('step_number')

      process.steps = (steps || []).map(mapStepFromDb)
    }
  }

  return mappedProcesses
}

// =====================================================
// COMMUNICATION CHANNEL MAPPING
// =====================================================

/**
 * Create or update a communication channel
 */
export async function upsertCommunicationChannel(
  organizationId: string,
  channelData: Partial<CommunicationChannel> & { channelName: string },
  assessmentId?: string
): Promise<CommunicationChannel> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('communication_channels')
    .upsert(
      {
        organization_id: organizationId,
        channel_name: channelData.channelName,
        channel_type: channelData.channelType || 'custom',
        channel_provider: channelData.channelProvider,
        primary_use_case: channelData.primaryUseCase,
        departments_using: channelData.departmentsUsing,
        user_count: channelData.userCount,
        daily_message_volume: channelData.dailyMessageVolume,
        response_time_avg_minutes: channelData.responseTimeAvgMinutes,
        is_integrated: channelData.isIntegrated || false,
        integration_type: channelData.integrationType,
        api_available: channelData.apiAvailable || false,
        ai_monitoring_potential: channelData.aiMonitoringPotential,
        automation_potential: channelData.automationPotential,
        humanglue_embeddable: channelData.humanglueEmbeddable || false,
        assessment_id: assessmentId,
      },
      { onConflict: 'organization_id,channel_name' }
    )
    .select()
    .single()

  if (error) throw error

  return mapChannelFromDb(data)
}

/**
 * Get all communication channels for an organization
 */
export async function getOrganizationChannels(
  organizationId: string,
  options?: {
    channelType?: ChannelType
    embeddableOnly?: boolean
  }
): Promise<CommunicationChannel[]> {
  const supabase = await createClient()

  let query = supabase
    .from('communication_channels')
    .select('*')
    .eq('organization_id', organizationId)

  if (options?.channelType) {
    query = query.eq('channel_type', options.channelType)
  }

  if (options?.embeddableOnly) {
    query = query.eq('humanglue_embeddable', true)
  }

  const { data, error } = await query.order('channel_name')

  if (error) throw error

  return (data || []).map(mapChannelFromDb)
}

// =====================================================
// INFORMATION FLOW MAPPING
// =====================================================

/**
 * Create or update an information flow
 */
export async function upsertInformationFlow(
  organizationId: string,
  flowData: Partial<InformationFlow> & { flowCode: string },
  assessmentId?: string
): Promise<InformationFlow> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('information_flows')
    .upsert(
      {
        organization_id: organizationId,
        flow_code: flowData.flowCode,
        flow_name: flowData.flowName || flowData.flowCode,
        source_type: flowData.sourceType,
        source_id: flowData.sourceId,
        source_name: flowData.sourceName || '',
        destination_type: flowData.destinationType,
        destination_id: flowData.destinationId,
        destination_name: flowData.destinationName || '',
        data_type: flowData.dataType,
        information_sensitivity: flowData.informationSensitivity,
        frequency: flowData.frequency,
        volume_per_period: flowData.volumePerPeriod,
        reliability_score: flowData.reliabilityScore,
        bottleneck_score: flowData.bottleneckScore,
        can_be_automated: flowData.canBeAutomated || false,
        ai_enhancement_opportunity: flowData.aiEnhancementOpportunity,
        assessment_id: assessmentId,
      },
      { onConflict: 'organization_id,flow_code' }
    )
    .select()
    .single()

  if (error) throw error

  return mapFlowFromDb(data)
}

/**
 * Get all information flows for an organization
 */
export async function getOrganizationFlows(
  organizationId: string,
  options?: {
    bottlenecksOnly?: boolean
    automatableOnly?: boolean
  }
): Promise<InformationFlow[]> {
  const supabase = await createClient()

  let query = supabase.from('information_flows').select('*').eq('organization_id', organizationId)

  if (options?.bottlenecksOnly) {
    query = query.gte('bottleneck_score', 60)
  }

  if (options?.automatableOnly) {
    query = query.eq('can_be_automated', true)
  }

  const { data, error } = await query.order('flow_name')

  if (error) throw error

  return (data || []).map(mapFlowFromDb)
}

// =====================================================
// TEAM STRUCTURE MAPPING
// =====================================================

/**
 * Create or update team structure
 */
export async function upsertTeamStructure(
  organizationId: string,
  teamData: Partial<TeamStructure> & { teamCode: string },
  assessmentId?: string
): Promise<TeamStructure> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('team_structures')
    .upsert(
      {
        organization_id: organizationId,
        team_code: teamData.teamCode,
        team_name: teamData.teamName || teamData.teamCode,
        department: teamData.department,
        parent_team_id: teamData.parentTeamId,
        level: teamData.level || 0,
        description: teamData.description,
        team_size: teamData.teamSize,
        primary_function: teamData.primaryFunction,
        ai_literacy_score: teamData.aiLiteracyScore,
        change_readiness_score: teamData.changeReadinessScore,
        assessment_id: assessmentId,
      },
      { onConflict: 'organization_id,team_code' }
    )
    .select()
    .single()

  if (error) throw error

  return mapTeamFromDb(data)
}

/**
 * Get organization team structure as hierarchy
 */
export async function getOrganizationTeamHierarchy(
  organizationId: string
): Promise<TeamStructure[]> {
  const supabase = await createClient()

  const { data: teams, error } = await supabase
    .from('team_structures')
    .select('*')
    .eq('organization_id', organizationId)
    .order('level')
    .order('team_name')

  if (error) throw error
  if (!teams) return []

  // Build hierarchy
  const teamMap = new Map<string, TeamStructure>()
  const rootTeams: TeamStructure[] = []

  // First pass: create all team objects
  for (const team of teams) {
    const mappedTeam = mapTeamFromDb(team)
    mappedTeam.children = []
    teamMap.set(team.id, mappedTeam)
  }

  // Second pass: build hierarchy
  for (const team of teams) {
    const mappedTeam = teamMap.get(team.id)!
    if (team.parent_team_id && teamMap.has(team.parent_team_id)) {
      teamMap.get(team.parent_team_id)!.children!.push(mappedTeam)
    } else {
      rootTeams.push(mappedTeam)
    }
  }

  return rootTeams
}

// =====================================================
// AUTOMATION OPPORTUNITIES
// =====================================================

/**
 * Create or update an automation opportunity
 */
export async function upsertAutomationOpportunity(
  organizationId: string,
  opportunityData: Partial<AutomationOpportunity> & { opportunityCode: string },
  assessmentId?: string
): Promise<AutomationOpportunity> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('automation_opportunities')
    .upsert(
      {
        organization_id: organizationId,
        opportunity_code: opportunityData.opportunityCode,
        opportunity_name: opportunityData.opportunityName || opportunityData.opportunityCode,
        opportunity_type: opportunityData.opportunityType || 'other',
        process_id: opportunityData.processId,
        channel_id: opportunityData.channelId,
        flow_id: opportunityData.flowId,
        description: opportunityData.description,
        current_pain_points: opportunityData.currentPainPoints,
        proposed_solution: opportunityData.proposedSolution,
        time_savings_hours_weekly: opportunityData.timeSavingsHoursWeekly,
        cost_savings_monthly: opportunityData.costSavingsMonthly,
        quality_improvement_score: opportunityData.qualityImprovementScore,
        employee_satisfaction_impact: opportunityData.employeeSatisfactionImpact || 'positive',
        implementation_complexity: opportunityData.implementationComplexity || 'moderate',
        estimated_implementation_weeks: opportunityData.estimatedImplementationWeeks,
        required_tools: opportunityData.requiredTools,
        dependencies: opportunityData.dependencies,
        priority_score: opportunityData.priorityScore,
        quick_win: opportunityData.quickWin || false,
        strategic_importance: opportunityData.strategicImportance || 'medium',
        status: opportunityData.status || 'identified',
        assessment_id: assessmentId,
      },
      { onConflict: 'organization_id,opportunity_code' }
    )
    .select()
    .single()

  if (error) throw error

  return mapOpportunityFromDb(data)
}

/**
 * Get automation opportunities for an organization
 */
export async function getAutomationOpportunities(
  organizationId: string,
  options?: {
    quickWinsOnly?: boolean
    status?: OpportunityStatus
    opportunityType?: OpportunityType
  }
): Promise<AutomationOpportunity[]> {
  const supabase = await createClient()

  let query = supabase
    .from('automation_opportunities')
    .select('*')
    .eq('organization_id', organizationId)

  if (options?.quickWinsOnly) {
    query = query.eq('quick_win', true)
  }

  if (options?.status) {
    query = query.eq('status', options.status)
  }

  if (options?.opportunityType) {
    query = query.eq('opportunity_type', options.opportunityType)
  }

  const { data, error } = await query.order('priority_score', { ascending: false })

  if (error) throw error

  return (data || []).map(mapOpportunityFromDb)
}

/**
 * Calculate and rank automation opportunities
 */
export async function analyzeAutomationPotential(organizationId: string): Promise<{
  totalOpportunities: number
  quickWins: AutomationOpportunity[]
  highImpact: AutomationOpportunity[]
  estimatedWeeklySavings: number
  topRecommendations: string[]
}> {
  const opportunities = await getAutomationOpportunities(organizationId)

  const quickWins = opportunities.filter((o) => o.quickWin)
  const highImpact = opportunities.filter((o) => o.strategicImportance === 'critical')

  const estimatedWeeklySavings = opportunities.reduce(
    (sum, o) => sum + (o.timeSavingsHoursWeekly || 0),
    0
  )

  // Generate top recommendations based on priority
  const topRecommendations = opportunities
    .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0))
    .slice(0, 5)
    .map((o) => `${o.opportunityName}: ${o.description || o.proposedSolution || 'No description'}`)

  return {
    totalOpportunities: opportunities.length,
    quickWins,
    highImpact,
    estimatedWeeklySavings,
    topRecommendations,
  }
}

// =====================================================
// MERMAID DIAGRAM GENERATION
// =====================================================

/**
 * Generate Mermaid flowchart for a business process
 */
export async function generateProcessFlowchart(processId: string): Promise<string> {
  const supabase = await createClient()

  // Try to use database function first
  const { data: mermaidCode } = await supabase.rpc('generate_process_mermaid', {
    p_process_id: processId,
  })

  if (mermaidCode) return mermaidCode

  // Fallback: Generate in code
  const { data: process } = await supabase
    .from('business_processes')
    .select('*, process_steps(*)')
    .eq('id', processId)
    .single()

  if (!process) throw new Error('Process not found')

  let mermaid = 'flowchart TD\n'

  const steps = (process.process_steps || []).sort(
    (a: Record<string, unknown>, b: Record<string, unknown>) =>
      (a.step_number as number) - (b.step_number as number)
  )

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]
    const code = step.step_code

    // Add node with appropriate shape
    switch (step.step_type) {
      case 'decision':
        mermaid += `    ${code}{${step.step_name}}\n`
        break
      case 'communication':
        mermaid += `    ${code}([${step.step_name}])\n`
        break
      default:
        mermaid += `    ${code}[${step.step_name}]\n`
    }

    // Style automatable steps
    if (step.is_automatable) {
      mermaid += `    style ${code} fill:#90EE90\n`
    } else if (step.ai_can_assist) {
      mermaid += `    style ${code} fill:#87CEEB\n`
    }

    // Connect to next step
    if (i > 0) {
      const prevCode = steps[i - 1].step_code
      mermaid += `    ${prevCode} --> ${code}\n`
    }
  }

  return mermaid
}

/**
 * Generate Mermaid diagram for organization structure
 */
export async function generateOrgChart(organizationId: string): Promise<string> {
  const supabase = await createClient()

  // Try database function first
  const { data: mermaidCode } = await supabase.rpc('generate_org_mermaid', {
    p_organization_id: organizationId,
  })

  if (mermaidCode) return mermaidCode

  // Fallback
  const teams = await getOrganizationTeamHierarchy(organizationId)

  let mermaid = 'flowchart TB\n'

  function addTeamToMermaid(team: TeamStructure, parentCode?: string) {
    mermaid += `    ${team.teamCode}["${team.teamName}"]\n`

    // Color code by AI literacy
    if (team.aiLiteracyScore !== undefined) {
      if (team.aiLiteracyScore >= 70) {
        mermaid += `    style ${team.teamCode} fill:#90EE90\n`
      } else if (team.aiLiteracyScore >= 40) {
        mermaid += `    style ${team.teamCode} fill:#FFD700\n`
      } else {
        mermaid += `    style ${team.teamCode} fill:#FFB6C1\n`
      }
    }

    // Connect to parent
    if (parentCode) {
      mermaid += `    ${parentCode} --> ${team.teamCode}\n`
    }

    // Recurse to children
    for (const child of team.children || []) {
      addTeamToMermaid(child, team.teamCode)
    }
  }

  for (const team of teams) {
    addTeamToMermaid(team)
  }

  return mermaid
}

/**
 * Generate Mermaid diagram for information flows
 */
export async function generateInformationFlowDiagram(organizationId: string): Promise<string> {
  const flows = await getOrganizationFlows(organizationId)

  let mermaid = 'flowchart LR\n'

  // Track unique nodes
  const nodes = new Set<string>()

  for (const flow of flows) {
    // Add source node if not exists
    if (!nodes.has(flow.sourceName)) {
      nodes.add(flow.sourceName)
      const nodeId = flow.sourceName.replace(/\s+/g, '_')
      mermaid += `    ${nodeId}["${flow.sourceName}"]\n`
    }

    // Add destination node if not exists
    if (!nodes.has(flow.destinationName)) {
      nodes.add(flow.destinationName)
      const nodeId = flow.destinationName.replace(/\s+/g, '_')
      mermaid += `    ${nodeId}["${flow.destinationName}"]\n`
    }

    // Add flow connection
    const sourceId = flow.sourceName.replace(/\s+/g, '_')
    const destId = flow.destinationName.replace(/\s+/g, '_')
    const label = flow.dataType || ''

    if (flow.canBeAutomated) {
      mermaid += `    ${sourceId} -->|${label}| ${destId}\n`
      mermaid += `    linkStyle ${flows.indexOf(flow)} stroke:#00ff00\n`
    } else if (flow.bottleneckScore && flow.bottleneckScore >= 60) {
      mermaid += `    ${sourceId} -.->|${label}| ${destId}\n`
      mermaid += `    linkStyle ${flows.indexOf(flow)} stroke:#ff0000\n`
    } else {
      mermaid += `    ${sourceId} -->|${label}| ${destId}\n`
    }
  }

  return mermaid
}

// =====================================================
// COMPREHENSIVE ORGANIZATION MAPPING
// =====================================================

export interface OrganizationMap {
  organizationId: string
  organizationName: string
  processes: BusinessProcess[]
  channels: CommunicationChannel[]
  flows: InformationFlow[]
  teamStructure: TeamStructure[]
  automationOpportunities: AutomationOpportunity[]
  diagrams: {
    orgChart: string
    informationFlows: string
    processDiagrams: Record<string, string>
  }
  summary: {
    totalProcesses: number
    manualProcesses: number
    automatedProcesses: number
    totalChannels: number
    embeddableChannels: number
    totalFlows: number
    bottleneckFlows: number
    totalOpportunities: number
    quickWinOpportunities: number
    estimatedWeeklySavingsHours: number
  }
}

/**
 * Generate comprehensive organization map
 */
export async function generateOrganizationMap(organizationId: string): Promise<OrganizationMap> {
  const supabase = await createClient()

  // Get organization
  const { data: org } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', organizationId)
    .single()

  // Get all data in parallel
  const [processes, channels, flows, teamStructure, opportunities] = await Promise.all([
    getOrganizationProcesses(organizationId, { includeSteps: true }),
    getOrganizationChannels(organizationId),
    getOrganizationFlows(organizationId),
    getOrganizationTeamHierarchy(organizationId),
    getAutomationOpportunities(organizationId),
  ])

  // Generate diagrams
  const orgChart = await generateOrgChart(organizationId)
  const informationFlows = await generateInformationFlowDiagram(organizationId)

  const processDiagrams: Record<string, string> = {}
  for (const process of processes) {
    processDiagrams[process.processCode] = await generateProcessFlowchart(process.id)
  }

  // Calculate summary
  const summary = {
    totalProcesses: processes.length,
    manualProcesses: processes.filter((p) => p.currentState === 'manual').length,
    automatedProcesses: processes.filter(
      (p) => p.currentState === 'fully_automated' || p.currentState === 'ai_enhanced'
    ).length,
    totalChannels: channels.length,
    embeddableChannels: channels.filter((c) => c.humanglueEmbeddable).length,
    totalFlows: flows.length,
    bottleneckFlows: flows.filter((f) => f.bottleneckScore && f.bottleneckScore >= 60).length,
    totalOpportunities: opportunities.length,
    quickWinOpportunities: opportunities.filter((o) => o.quickWin).length,
    estimatedWeeklySavingsHours: opportunities.reduce(
      (sum, o) => sum + (o.timeSavingsHoursWeekly || 0),
      0
    ),
  }

  return {
    organizationId,
    organizationName: org?.name || 'Unknown',
    processes,
    channels,
    flows,
    teamStructure,
    automationOpportunities: opportunities,
    diagrams: {
      orgChart,
      informationFlows,
      processDiagrams,
    },
    summary,
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function mapProcessFromDb(data: Record<string, unknown>): BusinessProcess {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    processName: data.process_name as string,
    processCode: data.process_code as string,
    processCategory: data.process_category as ProcessCategory,
    description: data.description as string | undefined,
    ownerRole: data.owner_role as string | undefined,
    department: data.department as string | undefined,
    frequency: data.frequency as Frequency | undefined,
    averageDurationMinutes: data.average_duration_minutes as number | undefined,
    manualEffortPercentage: data.manual_effort_percentage as number | undefined,
    automationScore: data.automation_score as number | undefined,
    aiEnhancementScore: data.ai_enhancement_score as number | undefined,
    priorityRank: data.priority_rank as number | undefined,
    currentState: data.current_state as ProcessState,
    targetState: data.target_state as ProcessState | undefined,
  }
}

function mapStepFromDb(data: Record<string, unknown>): ProcessStep {
  return {
    id: data.id as string,
    processId: data.process_id as string,
    stepNumber: data.step_number as number,
    stepName: data.step_name as string,
    stepCode: data.step_code as string,
    description: data.description as string | undefined,
    responsibleRole: data.responsible_role as string | undefined,
    stepType: data.step_type as StepType,
    isAutomatable: data.is_automatable as boolean,
    automationComplexity: data.automation_complexity as 'simple' | 'moderate' | 'complex' | undefined,
    requiresHumanJudgment: data.requires_human_judgment as boolean,
    aiCanAssist: data.ai_can_assist as boolean,
    averageDurationMinutes: data.average_duration_minutes as number | undefined,
    waitTimeMinutes: data.wait_time_minutes as number | undefined,
    systemsInvolved: data.systems_involved as string[] | undefined,
    dataInputs: data.data_inputs as string[] | undefined,
    dataOutputs: data.data_outputs as string[] | undefined,
  }
}

function mapChannelFromDb(data: Record<string, unknown>): CommunicationChannel {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    channelName: data.channel_name as string,
    channelType: data.channel_type as ChannelType,
    channelProvider: data.channel_provider as string | undefined,
    primaryUseCase: data.primary_use_case as string | undefined,
    departmentsUsing: data.departments_using as string[] | undefined,
    userCount: data.user_count as number | undefined,
    dailyMessageVolume: data.daily_message_volume as number | undefined,
    responseTimeAvgMinutes: data.response_time_avg_minutes as number | undefined,
    isIntegrated: data.is_integrated as boolean,
    integrationType: data.integration_type as 'api' | 'webhook' | 'manual' | 'none' | undefined,
    apiAvailable: data.api_available as boolean,
    aiMonitoringPotential: data.ai_monitoring_potential as number | undefined,
    automationPotential: data.automation_potential as number | undefined,
    humanglueEmbeddable: data.humanglue_embeddable as boolean,
  }
}

function mapFlowFromDb(data: Record<string, unknown>): InformationFlow {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    flowName: data.flow_name as string,
    flowCode: data.flow_code as string,
    sourceType: data.source_type as FlowEndpointType,
    sourceId: data.source_id as string | undefined,
    sourceName: data.source_name as string,
    destinationType: data.destination_type as FlowEndpointType,
    destinationId: data.destination_id as string | undefined,
    destinationName: data.destination_name as string,
    dataType: data.data_type as DataType,
    informationSensitivity: data.information_sensitivity as SensitivityLevel,
    frequency: data.frequency as Frequency,
    volumePerPeriod: data.volume_per_period as number | undefined,
    reliabilityScore: data.reliability_score as number | undefined,
    bottleneckScore: data.bottleneck_score as number | undefined,
    canBeAutomated: data.can_be_automated as boolean,
    aiEnhancementOpportunity: data.ai_enhancement_opportunity as string | undefined,
  }
}

function mapTeamFromDb(data: Record<string, unknown>): TeamStructure {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    teamName: data.team_name as string,
    teamCode: data.team_code as string,
    department: data.department as string | undefined,
    parentTeamId: data.parent_team_id as string | undefined,
    level: data.level as number,
    description: data.description as string | undefined,
    teamSize: data.team_size as number | undefined,
    primaryFunction: data.primary_function as string | undefined,
    aiLiteracyScore: data.ai_literacy_score as number | undefined,
    changeReadinessScore: data.change_readiness_score as number | undefined,
  }
}

function mapOpportunityFromDb(data: Record<string, unknown>): AutomationOpportunity {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    opportunityName: data.opportunity_name as string,
    opportunityCode: data.opportunity_code as string,
    opportunityType: data.opportunity_type as OpportunityType,
    processId: data.process_id as string | undefined,
    channelId: data.channel_id as string | undefined,
    flowId: data.flow_id as string | undefined,
    description: data.description as string | undefined,
    currentPainPoints: data.current_pain_points as string[] | undefined,
    proposedSolution: data.proposed_solution as string | undefined,
    timeSavingsHoursWeekly: data.time_savings_hours_weekly as number | undefined,
    costSavingsMonthly: data.cost_savings_monthly as number | undefined,
    qualityImprovementScore: data.quality_improvement_score as number | undefined,
    employeeSatisfactionImpact: data.employee_satisfaction_impact as 'positive' | 'neutral' | 'negative',
    implementationComplexity: data.implementation_complexity as 'simple' | 'moderate' | 'complex',
    estimatedImplementationWeeks: data.estimated_implementation_weeks as number | undefined,
    requiredTools: data.required_tools as string[] | undefined,
    dependencies: data.dependencies as string[] | undefined,
    priorityScore: data.priority_score as number | undefined,
    quickWin: data.quick_win as boolean,
    strategicImportance: data.strategic_importance as 'critical' | 'high' | 'medium' | 'low',
    status: data.status as OpportunityStatus,
  }
}
