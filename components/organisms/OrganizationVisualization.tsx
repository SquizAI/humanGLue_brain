'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Users,
  Network,
  GitBranch,
  Workflow,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Target,
  Brain,
  Zap,
} from 'lucide-react'

// Types
interface TeamMember {
  id: string
  name: string
  role: string
  department: string
  aiLiteracyScore?: number
  adaptabilityScore?: number
}

interface Team {
  id: string
  name: string
  department?: string
  parentTeamId?: string | null
  memberCount: number
  aiLiteracyAvg?: number
  children?: Team[]
  members?: TeamMember[]
}

interface ProcessFlow {
  id: string
  name: string
  sourceTeam: string
  targetTeam: string
  flowType: 'data' | 'approval' | 'reporting' | 'collaboration'
  frequency: 'daily' | 'weekly' | 'monthly' | 'ad-hoc'
  automationPotential?: number
  bottleneckScore?: number
}

interface AutomationOpportunity {
  id: string
  processName: string
  department?: string
  currentEffort: 'low' | 'medium' | 'high'
  automationPotential: number
  estimatedSavings?: number
  complexity: 'simple' | 'moderate' | 'complex'
  priority: 'low' | 'medium' | 'high' | 'critical'
}

interface OrganizationData {
  teams: Team[]
  flows: ProcessFlow[]
  opportunities: AutomationOpportunity[]
  summary: {
    totalTeams: number
    totalMembers: number
    avgAiLiteracy: number
    avgAdaptability?: number
  }
}

interface Props {
  organizationId: string
  className?: string
}

type ViewMode = 'hierarchy' | 'flows' | 'opportunities' | 'mermaid'

export function OrganizationVisualization({ organizationId, className = '' }: Props) {
  const [data, setData] = useState<OrganizationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('hierarchy')
  const [mermaidDiagram, setMermaidDiagram] = useState<string>('')
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set())
  const [syncing, setSyncing] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch teams, flows, and opportunities in parallel
      const [teamsRes, flowsRes, oppsRes] = await Promise.all([
        fetch(`/api/organizations/${organizationId}/teams`),
        fetch(`/api/organizations/${organizationId}/flows?includeDiagram=true`),
        fetch(`/api/organizations/${organizationId}/opportunities?includeAnalysis=true`),
      ])

      if (!teamsRes.ok || !flowsRes.ok || !oppsRes.ok) {
        throw new Error('Failed to fetch organization data')
      }

      const [teamsData, flowsData, oppsData] = await Promise.all([
        teamsRes.json(),
        flowsRes.json(),
        oppsRes.json(),
      ])

      setData({
        teams: teamsData.teams || [],
        flows: flowsData.flows || [],
        opportunities: oppsData.opportunities || [],
        summary: teamsData.summary || {
          totalTeams: 0,
          totalMembers: 0,
          avgAiLiteracy: 0,
        },
      })

      if (flowsData.diagram) {
        setMermaidDiagram(flowsData.diagram)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [organizationId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const syncToDigitalTwin = async () => {
    try {
      setSyncing(true)
      const res = await fetch(`/api/organizations/${organizationId}/digital-twin`, {
        method: 'POST',
      })

      if (!res.ok) {
        throw new Error('Failed to sync to digital twin')
      }

      // Refresh data after sync
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  const fetchDiagram = async (type: 'org' | 'flows' | 'process' | 'all') => {
    try {
      const res = await fetch(
        `/api/organizations/${organizationId}/diagrams?type=${type}`
      )
      if (res.ok) {
        const data = await res.json()
        setMermaidDiagram(data.diagram)
      }
    } catch (err) {
      console.error('Failed to fetch diagram:', err)
    }
  }

  const toggleTeam = (teamId: string) => {
    setExpandedTeams((prev) => {
      const next = new Set(prev)
      if (next.has(teamId)) {
        next.delete(teamId)
      } else {
        next.add(teamId)
      }
      return next
    })
  }

  const expandAllTeams = () => {
    if (data?.teams) {
      const allTeamIds = new Set(data.teams.map((t) => t.id))
      setExpandedTeams(allTeamIds)
    }
  }

  const collapseAllTeams = () => {
    setExpandedTeams(new Set())
  }

  if (loading) {
    return (
      <div className={`bg-gray-900/50 rounded-2xl border border-white/10 p-8 ${className}`}>
        <div className="flex items-center justify-center gap-3 text-gray-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading organization data...</span>
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
            onClick={fetchData}
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
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
              <Building2 className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-gendy">
                Organization Structure
              </h2>
              <p className="text-sm text-gray-400 font-diatype">
                {data?.summary.totalTeams || 0} teams &bull; {data?.summary.totalMembers || 0} members
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={syncToDigitalTwin}
              disabled={syncing}
              className="flex items-center gap-2 px-3 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
            >
              {syncing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Sync Digital Twin</span>
            </button>
            <button
              onClick={fetchData}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        {data?.summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <StatCard
              icon={<Users className="w-4 h-4" />}
              label="Teams"
              value={data.summary.totalTeams}
              color="cyan"
            />
            <StatCard
              icon={<Users className="w-4 h-4" />}
              label="Members"
              value={data.summary.totalMembers}
              color="blue"
            />
            <StatCard
              icon={<Brain className="w-4 h-4" />}
              label="AI Literacy"
              value={`${Math.round(data.summary.avgAiLiteracy * 10)}%`}
              color="purple"
            />
            <StatCard
              icon={<Zap className="w-4 h-4" />}
              label="Opportunities"
              value={data.opportunities?.length || 0}
              color="green"
            />
          </div>
        )}

        {/* View Mode Tabs */}
        <div className="flex gap-1 mt-4 p-1 bg-white/5 rounded-lg">
          {[
            { mode: 'hierarchy' as ViewMode, label: 'Hierarchy', icon: GitBranch },
            { mode: 'flows' as ViewMode, label: 'Flows', icon: Network },
            { mode: 'opportunities' as ViewMode, label: 'Opportunities', icon: Target },
            { mode: 'mermaid' as ViewMode, label: 'Diagram', icon: Workflow },
          ].map(({ mode, label, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => {
                setViewMode(mode)
                if (mode === 'mermaid') fetchDiagram('all')
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-all ${
                viewMode === mode
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        <AnimatePresence mode="wait">
          {viewMode === 'hierarchy' && (
            <motion.div
              key="hierarchy"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex justify-end gap-2 mb-4">
                <button
                  onClick={expandAllTeams}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Expand All
                </button>
                <span className="text-gray-600">|</span>
                <button
                  onClick={collapseAllTeams}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Collapse All
                </button>
              </div>
              <TeamHierarchy
                teams={data?.teams || []}
                expandedTeams={expandedTeams}
                onToggle={toggleTeam}
              />
            </motion.div>
          )}

          {viewMode === 'flows' && (
            <motion.div
              key="flows"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ProcessFlowList flows={data?.flows || []} />
            </motion.div>
          )}

          {viewMode === 'opportunities' && (
            <motion.div
              key="opportunities"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <OpportunitiesList opportunities={data?.opportunities || []} />
            </motion.div>
          )}

          {viewMode === 'mermaid' && (
            <motion.div
              key="mermaid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex gap-2 mb-4">
                {['org', 'flows', 'process', 'all'].map((type) => (
                  <button
                    key={type}
                    onClick={() => fetchDiagram(type as any)}
                    className="px-3 py-1.5 text-xs bg-white/5 text-gray-400 rounded-md hover:bg-white/10 hover:text-white transition-colors capitalize"
                  >
                    {type}
                  </button>
                ))}
              </div>
              <MermaidDiagram diagram={mermaidDiagram} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Sub-components

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  color: 'cyan' | 'blue' | 'purple' | 'green'
}) {
  const colorClasses = {
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
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

function TeamHierarchy({
  teams,
  expandedTeams,
  onToggle,
  depth = 0,
}: {
  teams: Team[]
  expandedTeams: Set<string>
  onToggle: (id: string) => void
  depth?: number
}) {
  // Build hierarchy
  const rootTeams = teams.filter((t) => !t.parentTeamId)
  const getChildren = (parentId: string) => teams.filter((t) => t.parentTeamId === parentId)

  const renderTeam = (team: Team, level: number) => {
    const isExpanded = expandedTeams.has(team.id)
    const children = getChildren(team.id)
    const hasChildren = children.length > 0

    return (
      <div key={team.id} className="mb-2">
        <div
          className={`flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer`}
          style={{ marginLeft: level * 24 }}
          onClick={() => hasChildren && onToggle(team.id)}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )
          ) : (
            <div className="w-4" />
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">{team.name}</span>
              {team.department && (
                <span className="px-2 py-0.5 text-xs bg-cyan-500/20 text-cyan-400 rounded">
                  {team.department}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
              <span>{team.memberCount} members</span>
              {team.aiLiteracyAvg !== undefined && (
                <span className="flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  {Math.round(team.aiLiteracyAvg * 10)}% AI Literacy
                </span>
              )}
            </div>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="mt-1">
            {children.map((child) => renderTeam(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (rootTeams.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No team data available</p>
        <p className="text-sm mt-1">Import team structure to visualize organization</p>
      </div>
    )
  }

  return <div>{rootTeams.map((team) => renderTeam(team, 0))}</div>
}

function ProcessFlowList({ flows }: { flows: ProcessFlow[] }) {
  const flowTypeColors = {
    data: 'bg-cyan-500/20 text-cyan-400',
    approval: 'bg-yellow-500/20 text-yellow-400',
    reporting: 'bg-blue-500/20 text-blue-400',
    collaboration: 'bg-green-500/20 text-green-400',
  }

  if (flows.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Network className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No process flows mapped</p>
        <p className="text-sm mt-1">Define information flows between teams</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {flows.map((flow) => (
        <div
          key={flow.id}
          className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-white font-medium">{flow.sourceTeam}</span>
              <div className="flex items-center gap-1 text-gray-400">
                <div className="w-8 h-px bg-gradient-to-r from-cyan-500/50 to-blue-500/50" />
                <Network className="w-4 h-4" />
                <div className="w-8 h-px bg-gradient-to-r from-blue-500/50 to-cyan-500/50" />
              </div>
              <span className="text-white font-medium">{flow.targetTeam}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-xs rounded ${flowTypeColors[flow.flowType]}`}>
                {flow.flowType}
              </span>
              <span className="text-xs text-gray-500">{flow.frequency}</span>
            </div>
          </div>

          {(flow.automationPotential || flow.bottleneckScore) && (
            <div className="flex gap-4 mt-3 pt-3 border-t border-white/5">
              {flow.automationPotential !== undefined && (
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-gray-400">
                    {Math.round(flow.automationPotential * 100)}% automation potential
                  </span>
                </div>
              )}
              {flow.bottleneckScore !== undefined && flow.bottleneckScore > 0.5 && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs text-yellow-400">Potential bottleneck</span>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function OpportunitiesList({ opportunities }: { opportunities: AutomationOpportunity[] }) {
  const priorityColors = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
  }

  const complexityIcons = {
    simple: <CheckCircle2 className="w-4 h-4 text-green-400" />,
    moderate: <Target className="w-4 h-4 text-yellow-400" />,
    complex: <AlertCircle className="w-4 h-4 text-orange-400" />,
  }

  if (opportunities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No automation opportunities identified</p>
        <p className="text-sm mt-1">Complete process mapping to discover opportunities</p>
      </div>
    )
  }

  // Sort by priority
  const sortedOpps = [...opportunities].sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  return (
    <div className="space-y-3">
      {sortedOpps.map((opp) => (
        <div
          key={opp.id}
          className={`p-4 rounded-lg border ${priorityColors[opp.priority]}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {complexityIcons[opp.complexity]}
                <span className="text-white font-medium">{opp.processName}</span>
              </div>
              {opp.department && (
                <span className="text-xs text-gray-400">{opp.department}</span>
              )}
            </div>

            <div className="text-right">
              <span className={`px-2 py-0.5 text-xs rounded uppercase ${priorityColors[opp.priority]}`}>
                {opp.priority}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-white/10">
            <div>
              <span className="text-xs text-gray-500">Current Effort</span>
              <p className="text-sm text-white capitalize">{opp.currentEffort}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Automation Potential</span>
              <p className="text-sm text-green-400">
                {Math.round(opp.automationPotential * 100)}%
              </p>
            </div>
            {opp.estimatedSavings !== undefined && (
              <div>
                <span className="text-xs text-gray-500">Est. Savings</span>
                <p className="text-sm text-cyan-400">
                  ${opp.estimatedSavings.toLocaleString()}/yr
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function MermaidDiagram({ diagram }: { diagram: string }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(diagram)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!diagram) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Workflow className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No diagram generated</p>
        <p className="text-sm mt-1">Select a diagram type above</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="absolute top-2 right-2 flex gap-2">
        <button
          onClick={copyToClipboard}
          className="px-3 py-1.5 text-xs bg-white/10 text-gray-400 rounded hover:bg-white/20 hover:text-white transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <a
          href={`https://mermaid.live/edit#pako:${btoa(diagram)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 text-xs bg-cyan-500/20 text-cyan-400 rounded hover:bg-cyan-500/30 transition-colors"
        >
          Open in Mermaid Live
        </a>
      </div>

      <pre className="p-4 bg-black rounded-lg border border-white/10 overflow-x-auto">
        <code className="text-sm text-gray-300 font-mono">{diagram}</code>
      </pre>

      <p className="text-xs text-gray-500 mt-2">
        Paste this code into any Mermaid-compatible viewer to render the diagram
      </p>
    </div>
  )
}

export default OrganizationVisualization
