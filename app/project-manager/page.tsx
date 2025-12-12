'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/cn'
import {
  PMSidebar,
  ViewType,
  KanbanBoard,
  MindMap,
  AIChat,
  RoadmapTimeline,
  GanttChart,
  Dashboard,
} from '@/components/project-manager'
import { useChat } from '@/lib/contexts/ChatContext'
import { Settings, LogOut, User } from 'lucide-react'

function SettingsView() {
  return (
    <div className="h-full">
      <h2 className="text-xl font-semibold text-white mb-4">Settings</h2>
      <div className="space-y-6">
        {/* Mind Reasoner Configuration */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-sm font-medium text-white mb-4">Mind Reasoner Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Mind ID</label>
              <input
                type="text"
                placeholder="Enter your Mind Reasoner Mind ID"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                Get your Mind ID from <a href="https://mindreasoner.com" target="_blank" rel="noopener" className="text-cyan-400 hover:underline">mindreasoner.com</a>
              </p>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Simulation Model</label>
              <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500">
                <option value="mind-reasoner-pro">Mind Reasoner Pro (Recommended)</option>
                <option value="mind-reasoner-standard">Mind Reasoner Standard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-sm font-medium text-white mb-4">Display Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Dark Mode</p>
                <p className="text-xs text-slate-500">Use dark theme</p>
              </div>
              <button className="relative w-12 h-6 bg-cyan-500 rounded-full transition-colors">
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Compact View</p>
                <p className="text-xs text-slate-500">Show more items in less space</p>
              </div>
              <button className="relative w-12 h-6 bg-slate-700 rounded-full transition-colors">
                <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-sm font-medium text-white mb-4">Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Email Notifications</p>
                <p className="text-xs text-slate-500">Receive updates via email</p>
              </div>
              <button className="relative w-12 h-6 bg-slate-700 rounded-full transition-colors">
                <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Push Notifications</p>
                <p className="text-xs text-slate-500">Receive browser notifications</p>
              </div>
              <button className="relative w-12 h-6 bg-cyan-500 rounded-full transition-colors">
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProjectManagerPage() {
  const [activeView, setActiveView] = useState<ViewType>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { userData } = useChat()

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />
      case 'kanban':
        return <KanbanBoard />
      case 'mindmap':
        return <MindMap />
      case 'chat':
        return <AIChat />
      case 'roadmap':
        return <RoadmapTimeline />
      case 'gantt':
        return <GanttChart />
      case 'settings':
        return <SettingsView />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <PMSidebar
        activeView={activeView}
        onViewChange={setActiveView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 flex flex-col transition-all duration-300',
          sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'
        )}
      >
        {/* Top Bar */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6">
          <div>
            <h1 className="text-lg font-semibold text-white capitalize">
              {activeView === 'mindmap' ? 'Mind Map' : activeView.replace('_', ' ')}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                {userData?.name ? (
                  <span className="text-white text-sm font-medium">
                    {userData.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User size={16} className="text-white" />
                )}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm text-white">{userData?.name || 'Guest'}</p>
                <p className="text-xs text-slate-500">{userData?.email || 'Not signed in'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 p-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
