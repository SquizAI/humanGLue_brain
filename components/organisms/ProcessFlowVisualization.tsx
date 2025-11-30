'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Network,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Zap,
  Clock,
  AlertCircle,
  ChevronDown,
  Play,
  Pause,
  Settings,
  Download,
  ExternalLink,
  Filter,
  Eye,
  EyeOff,
} from 'lucide-react'

// Types
interface ProcessStep {
  id: string
  name: string
  department?: string
  owner?: string
  duration?: number // minutes
  automationScore?: number
  humanTouchpoints?: number
  systemIntegrations?: string[]
}

interface ProcessConnection {
  from: string
  to: string
  type: 'sequential' | 'conditional' | 'parallel'
  condition?: string
  dataFlow?: string[]
}

interface Process {
  id: string
  name: string
  description?: string
  category?: string
  steps: ProcessStep[]
  connections: ProcessConnection[]
  metrics?: {
    avgDuration: number
    bottleneckSteps: string[]
    automationOpportunities: number
    errorRate?: number
  }
}

interface Props {
  organizationId: string
  processId?: string
  className?: string
}

export function ProcessFlowVisualization({ organizationId, processId, className = '' }: Props) {
  const [processes, setProcesses] = useState<Process[]>([])
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mermaidCode, setMermaidCode] = useState<string>('')
  const [viewMode, setViewMode] = useState<'list' | 'diagram' | 'analysis'>('diagram')
  const [showBottlenecks, setShowBottlenecks] = useState(true)
  const [showAutomation, setShowAutomation] = useState(true)
  const [animating, setAnimating] = useState(false)

  const fetchProcesses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(
        `/api/organizations/${organizationId}/flows?includeDiagram=true`
      )

      if (!res.ok) {
        throw new Error('Failed to fetch process data')
      }

      const data = await res.json()

      // Transform flows into processes for visualization
      const processData = transformFlowsToProcesses(data.flows || [])
      setProcesses(processData)

      if (processData.length > 0) {
        setSelectedProcess(processData[0])
        generateMermaidCode(processData[0])
      }

      if (data.diagram) {
        setMermaidCode(data.diagram)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [organizationId])

  useEffect(() => {
    fetchProcesses()
  }, [fetchProcesses])

  const transformFlowsToProcesses = (flows: any[]): Process[] => {
    // Group flows into logical processes
    const processMap = new Map<string, Process>()

    flows.forEach((flow) => {
      const processKey = flow.processName || 'General Information Flow'

      if (!processMap.has(processKey)) {
        processMap.set(processKey, {
          id: `process-${processMap.size + 1}`,
          name: processKey,
          description: flow.description,
          category: flow.category,
          steps: [],
          connections: [],
          metrics: {
            avgDuration: 0,
            bottleneckSteps: [],
            automationOpportunities: 0,
          },
        })
      }

      const process = processMap.get(processKey)!

      // Add source step if not exists
      if (!process.steps.find((s) => s.name === flow.sourceTeam)) {
        process.steps.push({
          id: `step-${flow.sourceTeam}`,
          name: flow.sourceTeam,
          department: flow.sourceDepartment,
          automationScore: flow.automationPotential,
        })
      }

      // Add target step if not exists
      if (!process.steps.find((s) => s.name === flow.targetTeam)) {
        process.steps.push({
          id: `step-${flow.targetTeam}`,
          name: flow.targetTeam,
          department: flow.targetDepartment,
          automationScore: flow.automationPotential,
        })
      }

      // Add connection
      process.connections.push({
        from: flow.sourceTeam,
        to: flow.targetTeam,
        type: flow.flowType === 'approval' ? 'conditional' : 'sequential',
        dataFlow: flow.dataTypes,
      })

      // Update metrics
      if (flow.bottleneckScore && flow.bottleneckScore > 0.6) {
        process.metrics!.bottleneckSteps.push(flow.sourceTeam)
      }
      if (flow.automationPotential && flow.automationPotential > 0.5) {
        process.metrics!.automationOpportunities++
      }
    })

    return Array.from(processMap.values())
  }

  const generateMermaidCode = (process: Process) => {
    const lines: string[] = ['flowchart TD']

    // Generate step definitions with styling
    process.steps.forEach((step, index) => {
      const isBottleneck = process.metrics?.bottleneckSteps.includes(step.name)
      const hasAutomation = step.automationScore && step.automationScore > 0.5

      let nodeStyle = ''
      if (showBottlenecks && isBottleneck) {
        nodeStyle = ':::bottleneck'
      } else if (showAutomation && hasAutomation) {
        nodeStyle = ':::automation'
      }

      const nodeId = step.id.replace(/[^a-zA-Z0-9]/g, '_')
      const label = step.department ? `${step.name}<br/><small>${step.department}</small>` : step.name
      lines.push(`    ${nodeId}["${label}"]${nodeStyle}`)
    })

    // Generate connections
    process.connections.forEach((conn) => {
      const fromId = `step-${conn.from}`.replace(/[^a-zA-Z0-9]/g, '_')
      const toId = `step-${conn.to}`.replace(/[^a-zA-Z0-9]/g, '_')

      let arrow = '-->'
      if (conn.type === 'conditional') {
        arrow = '-.->|approval|'
      } else if (conn.type === 'parallel') {
        arrow = '==>'
      } else if (conn.dataFlow && conn.dataFlow.length > 0) {
        arrow = `-->|${conn.dataFlow[0]}|`
      }

      lines.push(`    ${fromId} ${arrow} ${toId}`)
    })

    // Add style definitions
    lines.push('')
    lines.push('    classDef bottleneck fill:#ef4444,stroke:#dc2626,color:#fff')
    lines.push('    classDef automation fill:#22c55e,stroke:#16a34a,color:#fff')
    lines.push('    classDef default fill:#06b6d4,stroke:#0891b2,color:#fff')

    setMermaidCode(lines.join('\n'))
  }

  const selectProcess = (process: Process) => {
    setSelectedProcess(process)
    generateMermaidCode(process)
  }

  const copyMermaidCode = () => {
    navigator.clipboard.writeText(mermaidCode)
  }

  const openInMermaidLive = () => {
    const encoded = btoa(encodeURIComponent(mermaidCode))
    window.open(`https://mermaid.live/edit#pako:${encoded}`, '_blank')
  }

  if (loading) {
    return (
      <div className={`bg-gray-900/50 rounded-2xl border border-white/10 p-8 ${className}`}>
        <div className="flex items-center justify-center gap-3 text-gray-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading process flows...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-gray-900/50 rounded-2xl border border-red-500/30 p-8 ${className}`}>
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button
            onClick={fetchProcesses}
            className="ml-auto px-4 py-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gray-900/50 rounded-2xl border border-white/10 ${className}`}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
              <Network className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-gendy">
                Process Flow Visualization
              </h2>
              <p className="text-sm text-gray-400 font-diatype">
                {processes.length} processes mapped
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBottlenecks(!showBottlenecks)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                showBottlenecks
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bottlenecks</span>
            </button>
            <button
              onClick={() => setShowAutomation(!showAutomation)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                showAutomation
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Automation</span>
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-1 mt-4 p-1 bg-white/5 rounded-lg">
          {[
            { mode: 'diagram' as const, label: 'Diagram' },
            { mode: 'list' as const, label: 'Process List' },
            { mode: 'analysis' as const, label: 'Analysis' },
          ].map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex-1 px-3 py-2 rounded-md text-sm transition-all ${
                viewMode === mode
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Process Selector Sidebar */}
        <div className="lg:w-64 border-b lg:border-b-0 lg:border-r border-white/10 p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Processes</h3>
          <div className="space-y-2 max-h-[300px] lg:max-h-[500px] overflow-y-auto">
            {processes.map((process) => (
              <button
                key={process.id}
                onClick={() => selectProcess(process)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedProcess?.id === process.id
                    ? 'bg-blue-500/20 border-blue-500/30 text-white'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                }`}
              >
                <div className="font-medium text-sm">{process.name}</div>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                  <span>{process.steps.length} steps</span>
                  {process.metrics?.automationOpportunities && process.metrics.automationOpportunities > 0 && (
                    <span className="flex items-center gap-1 text-green-400">
                      <Zap className="w-3 h-3" />
                      {process.metrics.automationOpportunities}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {viewMode === 'diagram' && selectedProcess && (
              <motion.div
                key="diagram"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white font-gendy">
                    {selectedProcess.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyMermaidCode}
                      className="px-3 py-1.5 text-xs bg-white/10 text-gray-400 rounded hover:bg-white/20 hover:text-white transition-colors"
                    >
                      Copy Code
                    </button>
                    <button
                      onClick={openInMermaidLive}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open in Mermaid
                    </button>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mb-4 p-3 bg-white/5 rounded-lg">
                  <span className="text-xs text-gray-400">Legend:</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-cyan-500" />
                    <span className="text-xs text-gray-300">Normal Step</span>
                  </div>
                  {showBottlenecks && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-red-500" />
                      <span className="text-xs text-gray-300">Bottleneck</span>
                    </div>
                  )}
                  {showAutomation && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-green-500" />
                      <span className="text-xs text-gray-300">Automation Ready</span>
                    </div>
                  )}
                </div>

                {/* Mermaid Code Display */}
                <div className="relative">
                  <pre className="p-4 bg-black rounded-lg border border-white/10 overflow-x-auto max-h-[400px]">
                    <code className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                      {mermaidCode}
                    </code>
                  </pre>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Copy and paste into{' '}
                  <a
                    href="https://mermaid.live"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    mermaid.live
                  </a>{' '}
                  to render the interactive diagram
                </p>
              </motion.div>
            )}

            {viewMode === 'list' && (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ProcessStepsList process={selectedProcess} />
              </motion.div>
            )}

            {viewMode === 'analysis' && (
              <motion.div
                key="analysis"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ProcessAnalysis process={selectedProcess} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function ProcessStepsList({ process }: { process: Process | null }) {
  if (!process) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Network className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Select a process to view steps</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white font-gendy">{process.name}</h3>
      {process.description && (
        <p className="text-sm text-gray-400">{process.description}</p>
      )}

      <div className="space-y-3">
        {process.steps.map((step, index) => (
          <div
            key={step.id}
            className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm font-bold">
              {index + 1}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{step.name}</span>
                {step.department && (
                  <span className="px-2 py-0.5 text-xs bg-white/10 text-gray-400 rounded">
                    {step.department}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 mt-2">
                {step.automationScore !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <Zap
                      className={`w-3.5 h-3.5 ${
                        step.automationScore > 0.5 ? 'text-green-400' : 'text-gray-500'
                      }`}
                    />
                    <span className="text-xs text-gray-400">
                      {Math.round(step.automationScore * 100)}% automatable
                    </span>
                  </div>
                )}
                {step.duration && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-xs text-gray-400">{step.duration} min</span>
                  </div>
                )}
                {step.humanTouchpoints && (
                  <div className="flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-xs text-gray-400">
                      {step.humanTouchpoints} touchpoints
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Connections */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Connections</h4>
        <div className="space-y-2">
          {process.connections.map((conn, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm text-gray-300"
            >
              <span>{conn.from}</span>
              <div className="flex items-center gap-1 text-gray-500">
                <div className="w-4 h-px bg-gradient-to-r from-cyan-500/50 to-blue-500/50" />
                <span className="text-xs capitalize">{conn.type}</span>
                <div className="w-4 h-px bg-gradient-to-r from-blue-500/50 to-cyan-500/50" />
              </div>
              <span>{conn.to}</span>
              {conn.dataFlow && conn.dataFlow.length > 0 && (
                <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">
                  {conn.dataFlow[0]}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ProcessAnalysis({ process }: { process: Process | null }) {
  if (!process) {
    return (
      <div className="text-center py-8 text-gray-400">
        <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Select a process to view analysis</p>
      </div>
    )
  }

  const metrics = process.metrics || {
    avgDuration: 0,
    bottleneckSteps: [],
    automationOpportunities: 0,
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-white font-gendy">
        Process Analysis: {process.name}
      </h3>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          icon={<Clock className="w-4 h-4" />}
          label="Avg Duration"
          value={metrics.avgDuration ? `${metrics.avgDuration}m` : 'N/A'}
          color="cyan"
        />
        <MetricCard
          icon={<AlertTriangle className="w-4 h-4" />}
          label="Bottlenecks"
          value={metrics.bottleneckSteps.length}
          color="red"
        />
        <MetricCard
          icon={<Zap className="w-4 h-4" />}
          label="Automation Opps"
          value={metrics.automationOpportunities}
          color="green"
        />
        <MetricCard
          icon={<Settings className="w-4 h-4" />}
          label="Total Steps"
          value={process.steps.length}
          color="blue"
        />
      </div>

      {/* Bottleneck Details */}
      {metrics.bottleneckSteps.length > 0 && (
        <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
          <h4 className="flex items-center gap-2 text-sm font-medium text-red-400 mb-3">
            <AlertTriangle className="w-4 h-4" />
            Identified Bottlenecks
          </h4>
          <ul className="space-y-2">
            {metrics.bottleneckSteps.map((step, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                {step}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-gray-400">
            These steps may be causing delays in your process flow. Consider reviewing capacity,
            automation potential, or process redesign.
          </p>
        </div>
      )}

      {/* Automation Recommendations */}
      {metrics.automationOpportunities > 0 && (
        <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
          <h4 className="flex items-center gap-2 text-sm font-medium text-green-400 mb-3">
            <Zap className="w-4 h-4" />
            Automation Opportunities
          </h4>
          <div className="space-y-2">
            {process.steps
              .filter((s) => s.automationScore && s.automationScore > 0.5)
              .map((step) => (
                <div key={step.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">{step.name}</span>
                  <span className="text-green-400">
                    {Math.round((step.automationScore || 0) * 100)}% potential
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Process Health Score */}
      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Process Health Score</h4>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-green-500 rounded-full"
                style={{
                  width: `${Math.max(
                    20,
                    100 -
                      metrics.bottleneckSteps.length * 15 +
                      metrics.automationOpportunities * 5
                  )}%`,
                }}
              />
            </div>
          </div>
          <span className="text-lg font-bold text-white">
            {Math.max(
              20,
              100 - metrics.bottleneckSteps.length * 15 + metrics.automationOpportunities * 5
            )}
            /100
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Based on bottleneck analysis and automation potential
        </p>
      </div>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  color: 'cyan' | 'red' | 'green' | 'blue'
}) {
  const colorClasses = {
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  }

  return (
    <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <p className={`text-lg font-bold font-gendy ${colorClasses[color].split(' ')[0]}`}>
        {value}
      </p>
    </div>
  )
}

export default ProcessFlowVisualization
