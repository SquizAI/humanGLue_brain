'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { useProjectNotes, useRoadmapItems } from '@/lib/hooks/useProjectManager'
import {
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Target,
  Users,
  Calendar,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

interface StatCardProps {
  title: string
  value: number | string
  change?: number
  icon: React.ElementType
  color: string
}

function StatCard({ title, value, change, icon: Icon, color }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {change !== undefined && (
            <div className={cn(
              'flex items-center gap-1 text-xs mt-2',
              change >= 0 ? 'text-green-400' : 'text-red-400'
            )}>
              {change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              <span>{Math.abs(change)}% from last week</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', color)}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </motion.div>
  )
}

interface RecentActivityItem {
  id: string
  title: string
  type: 'completed' | 'created' | 'updated' | 'blocked'
  timestamp: string
}

function RecentActivity({ items }: { items: RecentActivityItem[] }) {
  const typeIcons = {
    completed: CheckCircle,
    created: Zap,
    updated: Clock,
    blocked: AlertCircle,
  }

  const typeColors = {
    completed: 'text-green-400',
    created: 'text-cyan-400',
    updated: 'text-blue-400',
    blocked: 'text-red-400',
  }

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
      <h3 className="text-sm font-medium text-white mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {items.map((item) => {
          const Icon = typeIcons[item.type]
          return (
            <div key={item.id} className="flex items-start gap-3">
              <Icon size={16} className={cn('mt-0.5', typeColors[item.type])} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{item.title}</p>
                <p className="text-xs text-slate-500">{item.timestamp}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ProgressRing({ value, size = 80, strokeWidth = 8 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-700"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ strokeDasharray: circumference }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-white">{value}%</span>
      </div>
    </div>
  )
}

export function Dashboard() {
  const { notes, loading: notesLoading } = useProjectNotes()
  const { items: roadmapItems, loading: roadmapLoading } = useRoadmapItems()

  const stats = useMemo(() => {
    const completed = notes.filter(n => n.status === 'done' || n.status === 'completed').length
    const inProgress = notes.filter(n => n.status === 'in_progress' || n.status === 'progress' || n.status === 'active').length
    const blocked = notes.filter(n => n.status === 'blocked').length
    const total = notes.length

    const avgProgress = roadmapItems.length > 0
      ? Math.round(roadmapItems.reduce((sum, item) => sum + item.progress, 0) / roadmapItems.length)
      : 0

    return {
      completed,
      inProgress,
      blocked,
      total,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      avgProgress,
    }
  }, [notes, roadmapItems])

  const recentActivity: RecentActivityItem[] = useMemo(() => {
    return notes
      .slice(0, 5)
      .map(note => ({
        id: note.id,
        title: note.title,
        type: note.status === 'done' || note.status === 'completed' ? 'completed' as const :
          note.status === 'blocked' ? 'blocked' as const : 'updated' as const,
        timestamp: new Date(note.updated_at).toLocaleDateString(),
      }))
  }, [notes])

  const loading = notesLoading || roadmapLoading

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Dashboard</h2>
        <p className="text-sm text-slate-400">Overview of your project status</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Tasks"
          value={stats.total}
          icon={Target}
          color="bg-cyan-500/20"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          change={12}
          icon={CheckCircle}
          color="bg-green-500/20"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={Clock}
          color="bg-blue-500/20"
        />
        <StatCard
          title="Blocked"
          value={stats.blocked}
          change={-5}
          icon={AlertCircle}
          color="bg-red-500/20"
        />
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Overall Progress */}
        <div className="lg:col-span-2 bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-sm font-medium text-white mb-4">Overall Progress</h3>
          <div className="flex items-center gap-8">
            <ProgressRing value={stats.completionRate} size={100} />
            <div className="flex-1 space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-400">Tasks Completed</span>
                  <span className="text-white">{stats.completed}/{stats.total}</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.completionRate}%` }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-400">Avg. Roadmap Progress</span>
                  <span className="text-white">{stats.avgProgress}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.avgProgress}%` }}
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <RecentActivity items={recentActivity} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Calendar size={16} />
            <span className="text-xs">Roadmap Items</span>
          </div>
          <p className="text-2xl font-bold text-white">{roadmapItems.length}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <TrendingUp size={16} />
            <span className="text-xs">This Week</span>
          </div>
          <p className="text-2xl font-bold text-white">+{Math.min(5, stats.completed)}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Users size={16} />
            <span className="text-xs">Team Members</span>
          </div>
          <p className="text-2xl font-bold text-white">4</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Zap size={16} />
            <span className="text-xs">Velocity</span>
          </div>
          <p className="text-2xl font-bold text-white">12</p>
          <p className="text-xs text-slate-500">pts/sprint</p>
        </div>
      </div>
    </div>
  )
}
