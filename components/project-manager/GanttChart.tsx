'use client'

import { useState, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { RoadmapItem, useRoadmapItems } from '@/lib/hooks/useProjectManager'
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Calendar,
  AlertCircle,
} from 'lucide-react'

type ViewMode = 'day' | 'week' | 'month'

const statusColors = {
  planned: 'bg-slate-500',
  in_progress: 'bg-blue-500',
  progress: 'bg-blue-500',
  completed: 'bg-green-500',
  done: 'bg-green-500',
  blocked: 'bg-red-500',
  active: 'bg-cyan-500',
  review: 'bg-yellow-500',
}

const categoryColors = {
  feature: 'from-cyan-500 to-blue-500',
  integration: 'from-purple-500 to-pink-500',
  infrastructure: 'from-orange-500 to-red-500',
  design: 'from-pink-500 to-rose-500',
  other: 'from-slate-500 to-slate-600',
}

interface GanttBarProps {
  item: RoadmapItem
  startDate: Date
  endDate: Date
  dayWidth: number
  chartStartDate: Date
}

function GanttBar({ item, startDate, endDate, dayWidth, chartStartDate }: GanttBarProps) {
  const itemStart = item.start_date ? new Date(item.start_date) : new Date()
  const itemEnd = item.end_date ? new Date(item.end_date) : new Date(itemStart.getTime() + 7 * 24 * 60 * 60 * 1000)

  const startOffset = Math.max(0, Math.floor((itemStart.getTime() - chartStartDate.getTime()) / (24 * 60 * 60 * 1000)))
  const duration = Math.max(1, Math.ceil((itemEnd.getTime() - itemStart.getTime()) / (24 * 60 * 60 * 1000)))

  const left = startOffset * dayWidth
  const width = duration * dayWidth

  const colors = categoryColors[item.category] || categoryColors.other

  return (
    <motion.div
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1 }}
      className={cn(
        'absolute h-8 rounded-lg cursor-pointer group',
        'bg-gradient-to-r',
        colors,
        item.status === 'blocked' && 'opacity-60'
      )}
      style={{
        left: `${left}px`,
        width: `${width}px`,
        top: '4px',
        transformOrigin: 'left',
      }}
      whileHover={{ scale: 1.02, zIndex: 10 }}
    >
      <div className="h-full flex items-center px-2 overflow-hidden">
        <span className="text-xs text-white font-medium truncate">
          {item.title}
        </span>
      </div>

      {/* Progress Overlay */}
      <div
        className="absolute inset-0 bg-white/20 rounded-lg"
        style={{ width: `${item.progress}%` }}
      />

      {/* Tooltip */}
      <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl min-w-[200px]">
          <h4 className="font-medium text-white text-sm">{item.title}</h4>
          {item.description && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
            <span>{item.progress}% complete</span>
            <span className={cn('px-1.5 py-0.5 rounded', statusColors[item.status], 'text-white')}>
              {item.status.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function GanttChart() {
  const { items, loading, error } = useRoadmapItems()
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate date range
  const { startDate, endDate, days, dayWidth } = useMemo(() => {
    const today = new Date(currentDate)
    let start: Date
    let end: Date
    let width: number

    if (viewMode === 'day') {
      start = new Date(today.setDate(today.getDate() - 3))
      end = new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000)
      width = 80
    } else if (viewMode === 'week') {
      const dayOfWeek = today.getDay()
      start = new Date(today.setDate(today.getDate() - dayOfWeek - 7))
      end = new Date(start.getTime() + 42 * 24 * 60 * 60 * 1000)
      width = 40
    } else {
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      end = new Date(today.getFullYear(), today.getMonth() + 3, 0)
      width = 15
    }

    const dayCount = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
    const daysArray = Array.from({ length: dayCount }, (_, i) => {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      return d
    })

    return { startDate: start, endDate: end, days: daysArray, dayWidth: width }
  }, [currentDate, viewMode])

  // Generate week markers
  const weekMarkers = useMemo(() => {
    const markers: { date: Date; x: number }[] = []
    days.forEach((day, i) => {
      if (day.getDay() === 0) { // Sunday
        markers.push({ date: day, x: i * dayWidth })
      }
    })
    return markers
  }, [days, dayWidth])

  // Navigation
  const navigatePrev = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'day') newDate.setDate(newDate.getDate() - 7)
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() - 14)
    else newDate.setMonth(newDate.getMonth() - 1)
    setCurrentDate(newDate)
  }

  const navigateNext = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'day') newDate.setDate(newDate.getDate() + 7)
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() + 14)
    else newDate.setMonth(newDate.getMonth() + 1)
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Gantt Chart</h2>
          <p className="text-sm text-slate-400">Timeline view of your roadmap</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode */}
          <div className="flex items-center bg-slate-800 rounded-lg p-1">
            {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm capitalize transition-colors',
                  viewMode === mode
                    ? 'bg-cyan-500 text-white'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={navigatePrev}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 text-sm transition-colors"
            >
              Today
            </button>
            <button
              onClick={navigateNext}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 rounded-lg p-3">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Chart */}
      <div className="flex-1 bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="flex h-full">
          {/* Left Panel - Item Labels */}
          <div className="w-64 flex-shrink-0 border-r border-slate-700/50">
            {/* Header */}
            <div className="h-12 border-b border-slate-700/50 flex items-center px-4">
              <span className="text-sm font-medium text-slate-400">Task</span>
            </div>
            {/* Items */}
            <div className="overflow-y-auto" style={{ height: 'calc(100% - 48px)' }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="h-10 border-b border-slate-700/30 flex items-center px-4 hover:bg-slate-800/50"
                >
                  <span className="text-sm text-white truncate">{item.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Timeline */}
          <div className="flex-1 overflow-x-auto" ref={containerRef}>
            {/* Timeline Header */}
            <div className="h-12 border-b border-slate-700/50 sticky top-0 bg-slate-900/90 backdrop-blur">
              <div className="relative h-full" style={{ width: days.length * dayWidth }}>
                {/* Month/Week Labels */}
                {weekMarkers.map(({ date, x }, i) => (
                  <div
                    key={i}
                    className="absolute top-0 h-full border-l border-slate-700/50 flex items-center pl-2"
                    style={{ left: x }}
                  >
                    <span className="text-xs text-slate-500">
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}

                {/* Today Marker */}
                {days.findIndex(d => d.toDateString() === new Date().toDateString()) >= 0 && (
                  <div
                    className="absolute top-0 h-full w-0.5 bg-cyan-500"
                    style={{
                      left: days.findIndex(d => d.toDateString() === new Date().toDateString()) * dayWidth,
                    }}
                  />
                )}
              </div>
            </div>

            {/* Timeline Body */}
            <div className="overflow-y-auto" style={{ height: 'calc(100% - 48px)' }}>
              <div className="relative" style={{ width: days.length * dayWidth }}>
                {/* Grid Lines */}
                {weekMarkers.map(({ x }, i) => (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 border-l border-slate-700/30"
                    style={{ left: x, height: items.length * 40 }}
                  />
                ))}

                {/* Today Line */}
                {days.findIndex(d => d.toDateString() === new Date().toDateString()) >= 0 && (
                  <div
                    className="absolute top-0 w-0.5 bg-cyan-500/30"
                    style={{
                      left: days.findIndex(d => d.toDateString() === new Date().toDateString()) * dayWidth,
                      height: items.length * 40,
                    }}
                  />
                )}

                {/* Gantt Bars */}
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="h-10 relative border-b border-slate-700/30"
                    style={{ top: 0 }}
                  >
                    <GanttBar
                      item={item}
                      startDate={startDate}
                      endDate={endDate}
                      dayWidth={dayWidth}
                      chartStartDate={startDate}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-slate-400">
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p>No roadmap items to display</p>
            <p className="text-sm mt-1">Add items in the Roadmap view to see them here</p>
          </div>
        </div>
      )}
    </div>
  )
}
