'use client'

import { useState, useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/cn'
import {
  LayoutDashboard,
  Kanban,
  GitBranch,
  MessageSquare,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Bell,
  Moon,
  Sun,
  X,
  Loader2,
} from 'lucide-react'
import { useGlobalSearch, SearchResult } from '@/lib/hooks/useProjectManager'
import { SearchResults } from './SearchResults'
import { useSearchContext } from '@/lib/contexts/SearchContext'

export type ViewType = 'dashboard' | 'kanban' | 'mindmap' | 'chat' | 'roadmap' | 'gantt' | 'settings'

interface PMSidebarProps {
  activeView: ViewType
  onViewChange: (view: ViewType) => void
  collapsed?: boolean
  onToggleCollapse?: () => void
  onNewTask?: () => void
}

const navItems = [
  { id: 'dashboard' as ViewType, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'kanban' as ViewType, label: 'Kanban Board', icon: Kanban },
  { id: 'mindmap' as ViewType, label: 'Mind Map', icon: GitBranch },
  { id: 'chat' as ViewType, label: 'AI Assistant', icon: MessageSquare },
  { id: 'roadmap' as ViewType, label: 'Roadmap', icon: Calendar },
  { id: 'gantt' as ViewType, label: 'Gantt Chart', icon: BarChart3 },
]

export function PMSidebar({ activeView, onViewChange, collapsed = false, onToggleCollapse, onNewTask }: PMSidebarProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Global search hook
  const {
    query,
    setQuery,
    results,
    loading: searchLoading,
    error: searchError,
    isOpen: searchIsOpen,
    setIsOpen: setSearchIsOpen,
    clearSearch,
  } = useGlobalSearch()

  // Search context for navigation
  const { requestNavigation } = useSearchContext()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted ? theme === 'dark' : true

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  // Handle search result selection
  const handleSelectResult = (result: SearchResult) => {
    // Determine which view to navigate to
    const targetView = result.type === 'task' ? 'kanban' : 'roadmap'

    // Request navigation through context
    requestNavigation(targetView, result.id)

    // Change to the appropriate view
    onViewChange(targetView)

    // Clear the search
    clearSearch()
  }

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  // Handle clearing search
  const handleClearSearch = () => {
    clearSearch()
    searchInputRef.current?.focus()
  }

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      className={cn(
        'h-screen bg-slate-900 border-r border-slate-700/50 flex flex-col',
        'fixed left-0 top-0 z-40'
      )}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-700/50">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">PM</span>
              </div>
              <span className="font-semibold text-white">Project Manager</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Quick Actions */}
      {!collapsed && (
        <div className="p-4 space-y-2">
          <button
            onClick={onNewTask}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
          >
            <Plus size={18} />
            <span className="text-sm">New Task</span>
          </button>

          {/* Search Input with Dropdown */}
          <div className="relative" ref={searchContainerRef}>
            <div className="relative">
              {searchLoading ? (
                <Loader2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 animate-spin" />
              ) : (
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              )}
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={handleSearchChange}
                placeholder="Search... (Cmd+K)"
                className={cn(
                  'w-full pl-9 pr-8 py-2 rounded-lg bg-slate-800/50 border text-sm text-white placeholder-slate-500',
                  'focus:outline-none focus:border-cyan-500/50 transition-colors',
                  searchIsOpen ? 'border-cyan-500/50' : 'border-slate-700'
                )}
                data-testid="global-search-input"
              />
              {query && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            <SearchResults
              results={results}
              loading={searchLoading}
              error={searchError}
              isOpen={searchIsOpen}
              onClose={() => setSearchIsOpen(false)}
              onSelectResult={handleSelectResult}
              query={query}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          return (
            <motion.button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              )}
            >
              <Icon size={20} />
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-sm font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50 space-y-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
            isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          )}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Moon size={18} /> : <Sun size={18} className="text-yellow-500" />}
          {!collapsed && <span className="text-sm">{isDark ? 'Dark Mode' : 'Light Mode'}</span>}
        </button>

        {/* Notifications */}
        <button
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
            'text-slate-400 hover:text-white hover:bg-slate-800/50'
          )}
        >
          <div className="relative">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-500 rounded-full" />
          </div>
          {!collapsed && <span className="text-sm">Notifications</span>}
        </button>

        {/* Settings */}
        <button
          onClick={() => onViewChange('settings')}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
            activeView === 'settings'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          )}
        >
          <Settings size={18} />
          {!collapsed && <span className="text-sm">Settings</span>}
        </button>
      </div>
    </motion.aside>
  )
}
