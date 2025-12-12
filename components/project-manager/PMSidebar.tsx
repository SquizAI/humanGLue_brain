'use client'

import { useState } from 'react'
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
} from 'lucide-react'

export type ViewType = 'dashboard' | 'kanban' | 'mindmap' | 'chat' | 'roadmap' | 'gantt' | 'settings'

interface PMSidebarProps {
  activeView: ViewType
  onViewChange: (view: ViewType) => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

const navItems = [
  { id: 'dashboard' as ViewType, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'kanban' as ViewType, label: 'Kanban Board', icon: Kanban },
  { id: 'mindmap' as ViewType, label: 'Mind Map', icon: GitBranch },
  { id: 'chat' as ViewType, label: 'AI Assistant', icon: MessageSquare },
  { id: 'roadmap' as ViewType, label: 'Roadmap', icon: Calendar },
  { id: 'gantt' as ViewType, label: 'Gantt Chart', icon: BarChart3 },
]

export function PMSidebar({ activeView, onViewChange, collapsed = false, onToggleCollapse }: PMSidebarProps) {
  const [isDark, setIsDark] = useState(true)

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
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors">
            <Plus size={18} />
            <span className="text-sm">New Task</span>
          </button>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
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
          onClick={() => setIsDark(!isDark)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
            'text-slate-400 hover:text-white hover:bg-slate-800/50'
          )}
        >
          {isDark ? <Moon size={18} /> : <Sun size={18} />}
          {!collapsed && <span className="text-sm">Theme</span>}
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
