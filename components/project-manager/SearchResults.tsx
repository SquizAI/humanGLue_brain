'use client'

import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/cn'
import {
  SearchResult,
  GroupedSearchResults,
  SearchResultType,
} from '@/lib/hooks/useProjectManager'
import {
  Kanban,
  Calendar,
  Search,
  Loader2,
  AlertCircle,
  FileText,
  X,
} from 'lucide-react'

// Status color mappings
const statusColors: Record<string, string> = {
  todo: 'bg-slate-500/20 text-slate-400',
  in_progress: 'bg-blue-500/20 text-blue-400',
  progress: 'bg-blue-500/20 text-blue-400',
  active: 'bg-blue-500/20 text-blue-400',
  review: 'bg-yellow-500/20 text-yellow-400',
  done: 'bg-green-500/20 text-green-400',
  completed: 'bg-green-500/20 text-green-400',
  blocked: 'bg-red-500/20 text-red-400',
  planned: 'bg-purple-500/20 text-purple-400',
  backlog: 'bg-slate-500/20 text-slate-400',
}

// Priority color mappings
const priorityColors: Record<string, string> = {
  low: 'text-slate-400',
  medium: 'text-blue-400',
  high: 'text-orange-400',
  critical: 'text-red-400',
}

interface SearchResultItemProps {
  result: SearchResult
  onSelect: (result: SearchResult) => void
  isHighlighted?: boolean
}

function SearchResultItem({ result, onSelect, isHighlighted }: SearchResultItemProps) {
  const Icon = result.type === 'task' ? Kanban : Calendar
  const typeLabel = result.type === 'task' ? 'Task' : 'Roadmap'
  const statusClass = statusColors[result.status] || statusColors.todo
  const priorityClass = priorityColors[result.priority] || priorityColors.medium

  return (
    <motion.button
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      onClick={() => onSelect(result)}
      className={cn(
        'w-full flex items-start gap-3 p-3 text-left rounded-lg transition-colors',
        'hover:bg-slate-700/50',
        isHighlighted && 'bg-slate-700/50'
      )}
    >
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
        result.type === 'task' ? 'bg-cyan-500/20' : 'bg-purple-500/20'
      )}>
        <Icon size={16} className={result.type === 'task' ? 'text-cyan-400' : 'text-purple-400'} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white truncate">
            {result.title}
          </span>
        </div>
        {result.description && (
          <p className="text-xs text-slate-400 truncate mt-0.5">
            {result.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <span className={cn('text-xs px-1.5 py-0.5 rounded', statusClass)}>
            {result.status.replace('_', ' ')}
          </span>
          <span className={cn('text-xs', priorityClass)}>
            {result.priority}
          </span>
          <span className="text-xs text-slate-500">
            {typeLabel}
          </span>
          {result.category && (
            <span className="text-xs text-slate-500">
              {result.category}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  )
}

interface SearchResultsProps {
  results: GroupedSearchResults
  loading: boolean
  error: string | null
  isOpen: boolean
  onClose: () => void
  onSelectResult: (result: SearchResult) => void
  query: string
}

export function SearchResults({
  results,
  loading,
  error,
  isOpen,
  onClose,
  onSelectResult,
  query,
}: SearchResultsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const hasResults = results.total > 0
  const showNoResults = !loading && query.trim() && !hasResults && !error

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className={cn(
          'absolute top-full left-0 right-0 mt-2 z-50',
          'bg-slate-800 border border-slate-700 rounded-xl shadow-2xl',
          'max-h-[400px] overflow-hidden flex flex-col'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-700/50">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Search size={14} />
            <span>
              {loading ? 'Searching...' : hasResults ? `${results.total} results` : 'Search'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="text-cyan-400 animate-spin" />
              <span className="ml-2 text-sm text-slate-400">Searching...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center gap-2 p-4 text-red-400">
              <AlertCircle size={16} />
              <span className="text-sm">Error: {error}</span>
            </div>
          )}

          {/* No Results */}
          {showNoResults && (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <FileText size={32} className="mb-2 opacity-50" />
              <span className="text-sm">No results found for "{query}"</span>
              <span className="text-xs mt-1 text-slate-500">
                Try different keywords or check your spelling
              </span>
            </div>
          )}

          {/* Results */}
          {!loading && !error && hasResults && (
            <div className="space-y-4">
              {/* Tasks Section */}
              {results.tasks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
                    <Kanban size={12} />
                    Tasks ({results.tasks.length})
                  </div>
                  <div className="space-y-1">
                    <AnimatePresence>
                      {results.tasks.map((result) => (
                        <SearchResultItem
                          key={result.id}
                          result={result}
                          onSelect={onSelectResult}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Roadmap Section */}
              {results.roadmap.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
                    <Calendar size={12} />
                    Roadmap Items ({results.roadmap.length})
                  </div>
                  <div className="space-y-1">
                    <AnimatePresence>
                      {results.roadmap.map((result) => (
                        <SearchResultItem
                          key={result.id}
                          result={result}
                          onSelect={onSelectResult}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with keyboard hints */}
        {hasResults && (
          <div className="px-4 py-2 border-t border-slate-700/50 bg-slate-800/50">
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">Esc</kbd>
                to close
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">Click</kbd>
                to navigate
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
