'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Plus,
  PlayCircle,
  Calendar,
  Users,
  FileText,
  Bell,
  Settings,
  X,
  ChevronUp,
} from 'lucide-react'

interface QuickAction {
  id: string
  label: string
  icon: any
  href: string
  color: string
  description: string
}

const quickActions: QuickAction[] = [
  {
    id: 'course',
    label: 'Create Course',
    icon: PlayCircle,
    href: '/admin/courses',
    color: 'purple',
    description: 'Add new learning content',
  },
  {
    id: 'workshop',
    label: 'Schedule Workshop',
    icon: Calendar,
    href: '/admin/workshops',
    color: 'blue',
    description: 'Plan a training session',
  },
  {
    id: 'user',
    label: 'Invite User',
    icon: Users,
    href: '/admin/users',
    color: 'green',
    description: 'Add platform member',
  },
  {
    id: 'announcement',
    label: 'Send Announcement',
    icon: Bell,
    href: '/admin/announcements',
    color: 'amber',
    description: 'Notify all users',
  },
  {
    id: 'report',
    label: 'View Reports',
    icon: FileText,
    href: '/admin/reports',
    color: 'cyan',
    description: 'Access analytics',
  },
  {
    id: 'settings',
    label: 'System Health',
    icon: Settings,
    href: '/admin/settings',
    color: 'pink',
    description: 'Check system status',
  },
]

export function QuickActions() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Quick Actions Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-20 right-0 w-80"
          >
            <div className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-lg font-bold text-white font-gendy">Quick Actions</h3>
                <p className="text-sm text-gray-400 font-diatype">Common admin tasks</p>
              </div>
              <div className="p-2 max-h-96 overflow-y-auto">
                {quickActions.map((action, index) => {
                  const Icon = action.icon
                  return (
                    <Link key={action.id} href={action.href}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all cursor-pointer group"
                      >
                        <div className={`p-2 bg-${action.color}-500/20 rounded-lg group-hover:bg-${action.color}-500/30 transition-all`}>
                          <Icon className={`w-5 h-5 text-${action.color}-400`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-semibold font-diatype">{action.label}</p>
                          <p className="text-xs text-gray-400 font-diatype">{action.description}</p>
                        </div>
                      </motion.div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-purple-500/50 transition-shadow"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Plus className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute bottom-20 right-0 px-3 py-2 bg-gray-900 border border-white/10 rounded-lg shadow-xl whitespace-nowrap"
          >
            <p className="text-sm text-white font-diatype">Quick Actions</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
