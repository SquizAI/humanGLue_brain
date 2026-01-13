'use client'

import { useState, useMemo, useRef, useCallback, memo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { RoadmapItem, useRoadmapItems } from '@/lib/hooks/useProjectManager'
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertCircle,
} from 'lucide-react'

type ViewMode = 'day' | 'week' | 'month'

const statusColors: Record<string, string> = {
  planned: 'bg-slate-500',
  in_progress: 'bg-blue-500',
  progress: 'bg-blue-500',
  completed: 'bg-green-500',
  done: 'bg-green-500',
  blocked: 'bg-red-500',
  active: 'bg-cyan-500',
  review: 'bg-yellow-500',
}

const categoryColors: Record<string, string> = {
  feature: 'from-cyan-500 to-blue-500',
  integration: 'from-purple-500 to-pink-500',
  infrastructure: 'from-orange-500 to-red-500',
  design: 'from-pink-500 to-rose-500',
  other: 'from-slate-500 to-slate-600',
}

// Constants for virtualization
const ITEM_HEIGHT = 40
const OVERSCAN_COUNT = 5

interface GanttBarProps {
  item: RoadmapItem
  dayWidth: number
  chartStartDate: Date
}

/**
 * Memoized GanttBar component to prevent unnecessary re-renders.
 * Only re-renders when item data, dayWidth, or chartStartDate changes.
 */
const GanttBar = memo(function GanttBar({
  item,
  dayWidth,
  chartStartDate
}: GanttBarProps) {
  // Normalize dates to midnight UTC to avoid timezone issues
  const normalizeToMidnight = useCallback((date: Date): Date => {
    const normalized = new Date(date)
    normalized.setHours(0, 0, 0, 0)
    return normalized
  }, [])

  const itemStart = useMemo(() => {
    return normalizeToMidnight(item.start_date ? new Date(item.start_date) : new Date())
  }, [item.start_date, normalizeToMidnight])

  const itemEnd = useMemo(() => {
    return normalizeToMidnight(
      item.end_date
        ? new Date(item.end_date)
        : new Date(itemStart.getTime() + 7 * 24 * 60 * 60 * 1000)
    )
  }, [item.end_date, itemStart, normalizeToMidnight])

  const { left, width } = useMemo(() => {
    const normalizedChartStart = normalizeToMidnight(chartStartDate)
    const startOffset = Math.max(
      0,
      Math.floor((itemStart.getTime() - normalizedChartStart.getTime()) / (24 * 60 * 60 * 1000))
    )
    const duration = Math.max(
      1,
      Math.ceil((itemEnd.getTime() - itemStart.getTime()) / (24 * 60 * 60 * 1000))
    )
    return {
      left: startOffset * dayWidth,
      width: duration * dayWidth,
    }
  }, [itemStart, itemEnd, chartStartDate, dayWidth, normalizeToMidnight])

  const colors = categoryColors[item.category] || categoryColors.other

  // Memoize tooltip content to prevent recalculation
  const tooltipContent = useMemo(() => (
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
  ), [item.title, item.description, item.progress, item.status])

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
        {tooltipContent}
      </div>
    </motion.div>
  )
})

/**
 * Debounce hook for preventing rapid function calls
 */
function useDebounce<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  ) as T

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}

/**
 * Custom hook for simple list virtualization
 */
function useVirtualization(
  containerRef: React.RefObject<HTMLDivElement | null>,
  itemCount: number,
  itemHeight: number,
  overscan: number = OVERSCAN_COUNT
) {
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      setScrollTop(container.scrollTop)
    }

    const handleResize = () => {
      setContainerHeight(container.clientHeight)
    }

    // Initial measurement
    handleResize()

    container.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)

    return () => {
      container.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [containerRef])

  const virtualItems = useMemo(() => {
    if (containerHeight === 0) {
      // Return all items if container hasn't been measured yet
      return {
        startIndex: 0,
        endIndex: itemCount,
        offsetTop: 0,
        visibleItems: Array.from({ length: itemCount }, (_, i) => i),
      }
    }

    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const endIndex = Math.min(itemCount, startIndex + visibleCount + overscan * 2)

    return {
      startIndex,
      endIndex,
      offsetTop: startIndex * itemHeight,
      visibleItems: Array.from(
        { length: endIndex - startIndex },
        (_, i) => startIndex + i
      ),
    }
  }, [scrollTop, containerHeight, itemCount, itemHeight, overscan])

  const totalHeight = itemCount * itemHeight

  return { virtualItems, totalHeight }
}

/**
 * Normalize a date to midnight to avoid timezone inconsistencies
 */
function normalizeDate(date: Date): Date {
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}

export function GanttChart() {
  const { items, loading, error } = useRoadmapItems()
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [currentDate, setCurrentDate] = useState(() => normalizeDate(new Date()))
  const containerRef = useRef<HTMLDivElement>(null)
  const leftPanelRef = useRef<HTMLDivElement>(null)
  const rightPanelRef = useRef<HTMLDivElement>(null)

  // Use virtualization for the items list
  const { virtualItems, totalHeight } = useVirtualization(
    leftPanelRef,
    items.length,
    ITEM_HEIGHT
  )

  // Sync scroll between left and right panels
  useEffect(() => {
    const leftPanel = leftPanelRef.current
    const rightPanel = rightPanelRef.current
    if (!leftPanel || !rightPanel) return

    let isSyncing = false

    const syncLeftToRight = () => {
      if (isSyncing) return
      isSyncing = true
      rightPanel.scrollTop = leftPanel.scrollTop
      requestAnimationFrame(() => {
        isSyncing = false
      })
    }

    const syncRightToLeft = () => {
      if (isSyncing) return
      isSyncing = true
      leftPanel.scrollTop = rightPanel.scrollTop
      requestAnimationFrame(() => {
        isSyncing = false
      })
    }

    leftPanel.addEventListener('scroll', syncLeftToRight, { passive: true })
    rightPanel.addEventListener('scroll', syncRightToLeft, { passive: true })

    return () => {
      leftPanel.removeEventListener('scroll', syncLeftToRight)
      rightPanel.removeEventListener('scroll', syncRightToLeft)
    }
  }, [])

  // Calculate date range with stable date references
  const { startDate, days, dayWidth } = useMemo(() => {
    const today = normalizeDate(currentDate)
    let start: Date
    let end: Date
    let width: number

    if (viewMode === 'day') {
      start = new Date(today)
      start.setDate(start.getDate() - 3)
      end = new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000)
      width = 80
    } else if (viewMode === 'week') {
      const dayOfWeek = today.getDay()
      start = new Date(today)
      start.setDate(start.getDate() - dayOfWeek - 7)
      end = new Date(start.getTime() + 42 * 24 * 60 * 60 * 1000)
      width = 40
    } else {
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      end = new Date(today.getFullYear(), today.getMonth() + 3, 0)
      width = 15
    }

    // Normalize start date
    start = normalizeDate(start)

    const dayCount = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))

    // Create days array with normalized dates
    const daysArray = Array.from({ length: dayCount }, (_, i) => {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      return normalizeDate(d)
    })

    return { startDate: start, endDate: end, days: daysArray, dayWidth: width }
  }, [currentDate, viewMode])

  // Memoize today's index calculation - single computation instead of multiple findIndex calls
  const todayIndex = useMemo(() => {
    const today = normalizeDate(new Date()).toDateString()
    return days.findIndex(d => d.toDateString() === today)
  }, [days])

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

  // Debounced navigation handlers to prevent rapid clicking issues
  const navigatePrevRaw = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = normalizeDate(prev)
      if (viewMode === 'day') newDate.setDate(newDate.getDate() - 7)
      else if (viewMode === 'week') newDate.setDate(newDate.getDate() - 14)
      else newDate.setMonth(newDate.getMonth() - 1)
      return newDate
    })
  }, [viewMode])

  const navigateNextRaw = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = normalizeDate(prev)
      if (viewMode === 'day') newDate.setDate(newDate.getDate() + 7)
      else if (viewMode === 'week') newDate.setDate(newDate.getDate() + 14)
      else newDate.setMonth(newDate.getMonth() + 1)
      return newDate
    })
  }, [viewMode])

  // Apply debounce to navigation (150ms delay)
  const navigatePrev = useDebounce(navigatePrevRaw, 150)
  const navigateNext = useDebounce(navigateNextRaw, 150)

  const goToToday = useCallback(() => {
    setCurrentDate(normalizeDate(new Date()))
  }, [])

  // Memoize the chart width calculation
  const chartWidth = useMemo(() => days.length * dayWidth, [days.length, dayWidth])

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
              aria-label="Navigate to previous period"
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
              aria-label="Navigate to next period"
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
          {/* Left Panel - Item Labels (Virtualized) */}
          <div className="w-64 flex-shrink-0 border-r border-slate-700/50">
            {/* Header */}
            <div className="h-12 border-b border-slate-700/50 flex items-center px-4">
              <span className="text-sm font-medium text-slate-400">Task</span>
            </div>
            {/* Virtualized Items */}
            <div
              ref={leftPanelRef}
              className="overflow-y-auto"
              style={{ height: 'calc(100% - 48px)' }}
            >
              <div style={{ height: totalHeight, position: 'relative' }}>
                {virtualItems.visibleItems.map((index) => {
                  const item = items[index]
                  if (!item) return null
                  return (
                    <div
                      key={item.id}
                      className="absolute w-full h-10 border-b border-slate-700/30 flex items-center px-4 hover:bg-slate-800/50"
                      style={{ top: index * ITEM_HEIGHT }}
                    >
                      <span className="text-sm text-white truncate">{item.title}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Panel - Timeline */}
          <div className="flex-1 overflow-x-auto" ref={containerRef}>
            {/* Timeline Header */}
            <div className="h-12 border-b border-slate-700/50 sticky top-0 bg-slate-900/90 backdrop-blur">
              <div className="relative h-full" style={{ width: chartWidth }}>
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

                {/* Today Marker - uses memoized todayIndex */}
                {todayIndex >= 0 && (
                  <div
                    className="absolute top-0 h-full w-0.5 bg-cyan-500"
                    style={{ left: todayIndex * dayWidth }}
                  />
                )}
              </div>
            </div>

            {/* Timeline Body (Virtualized) */}
            <div
              ref={rightPanelRef}
              className="overflow-y-auto"
              style={{ height: 'calc(100% - 48px)' }}
            >
              <div className="relative" style={{ width: chartWidth, height: totalHeight }}>
                {/* Grid Lines */}
                {weekMarkers.map(({ x }, i) => (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 border-l border-slate-700/30"
                    style={{ left: x, height: totalHeight }}
                  />
                ))}

                {/* Today Line - uses memoized todayIndex */}
                {todayIndex >= 0 && (
                  <div
                    className="absolute top-0 w-0.5 bg-cyan-500/30"
                    style={{
                      left: todayIndex * dayWidth,
                      height: totalHeight,
                    }}
                  />
                )}

                {/* Virtualized Gantt Bars */}
                {virtualItems.visibleItems.map((index) => {
                  const item = items[index]
                  if (!item) return null
                  return (
                    <div
                      key={item.id}
                      className="absolute w-full h-10 border-b border-slate-700/30"
                      style={{ top: index * ITEM_HEIGHT }}
                    >
                      <GanttBar
                        item={item}
                        dayWidth={dayWidth}
                        chartStartDate={startDate}
                      />
                    </div>
                  )
                })}
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
