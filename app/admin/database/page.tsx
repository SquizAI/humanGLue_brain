'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Database,
  Server,
  HardDrive,
  RefreshCw,
  Download,
  Upload,
  Shield,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Settings,
  Terminal,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner'
import { useChat } from '@/lib/contexts/ChatContext'
import { signOut } from '@/lib/auth/hooks'

interface DatabaseStats {
  totalSize: string
  usedSize: string
  tables: number
  indexes: number
  connections: number
  uptime: string
}

interface BackupRecord {
  id: string
  name: string
  size: string
  createdAt: string
  status: 'completed' | 'in_progress' | 'failed'
  type: 'auto' | 'manual'
}

export default function AdminDatabasePage() {
  const { userData, authLoading } = useChat()
  const [showContent, setShowContent] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'backups' | 'queries'>('overview')
  const [stats] = useState<DatabaseStats>({
    totalSize: '10 GB',
    usedSize: '3.2 GB',
    tables: 24,
    indexes: 48,
    connections: 12,
    uptime: '99.99%',
  })
  const [backups] = useState<BackupRecord[]>([
    {
      id: '1',
      name: 'daily-backup-2025-01-28',
      size: '2.8 GB',
      createdAt: '2025-01-28T03:00:00Z',
      status: 'completed',
      type: 'auto',
    },
    {
      id: '2',
      name: 'daily-backup-2025-01-27',
      size: '2.7 GB',
      createdAt: '2025-01-27T03:00:00Z',
      status: 'completed',
      type: 'auto',
    },
    {
      id: '3',
      name: 'manual-backup-pre-migration',
      size: '2.7 GB',
      createdAt: '2025-01-25T14:30:00Z',
      status: 'completed',
      type: 'manual',
    },
  ])
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (!authLoading && userData?.isAdmin) {
      setShowContent(true)
      return
    }

    const timeout = setTimeout(() => {
      console.log('[DatabaseAdmin] Auth timeout - trusting middleware protection')
      setShowContent(true)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [authLoading, userData])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      await signOut()
      localStorage.removeItem('humanglue_user')
      localStorage.removeItem('demoUser')
      document.cookie = 'demoUser=; path=/; max-age=0'
      localStorage.removeItem('sb-egqqdscvxvtwcdwknbnt-auth-token')
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      window.location.href = '/login'
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsRefreshing(false)
  }

  if (!showContent) {
    return (
      <div className="min-h-screen bg-black">
        <DashboardSidebar onLogout={handleLogout} />
        <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 flex items-center justify-center min-h-screen">
          <LoadingSpinner variant="neural" size="xl" text="Loading database..." />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        {/* Header */}
        <div className="bg-black/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-cyan-500/20 rounded-xl">
                    <Database className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h1 className="text-3xl font-bold text-white font-gendy">Database Management</h1>
                </div>
                <p className="text-gray-400 font-diatype">Monitor and manage your database infrastructure</p>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-lg hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium shadow-lg shadow-cyan-500/25"
                >
                  <Download className="w-4 h-4" />
                  Create Backup
                </motion.button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mt-6">
              {(['overview', 'backups', 'queries'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                    activeTab === tab
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <HardDrive className="w-8 h-8 text-cyan-400" />
                    <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">Healthy</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">Storage Used</p>
                  <p className="text-2xl font-bold text-white">{stats.usedSize} / {stats.totalSize}</p>
                  <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: '32%' }} />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Server className="w-8 h-8 text-blue-400" />
                    <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">Online</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">Active Connections</p>
                  <p className="text-2xl font-bold text-white">{stats.connections}</p>
                  <p className="text-sm text-gray-500 mt-2">Uptime: {stats.uptime}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Activity className="w-8 h-8 text-green-400" />
                  </div>
                  <p className="text-sm text-gray-400 mb-1">Tables / Indexes</p>
                  <p className="text-2xl font-bold text-white">{stats.tables} / {stats.indexes}</p>
                  <p className="text-sm text-gray-500 mt-2">PostgreSQL 15.4</p>
                </motion.div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                    <Terminal className="w-6 h-6 text-cyan-400" />
                    <span className="text-sm text-gray-300">SQL Console</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                    <Upload className="w-6 h-6 text-blue-400" />
                    <span className="text-sm text-gray-300">Import Data</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                    <Shield className="w-6 h-6 text-green-400" />
                    <span className="text-sm text-gray-300">Security Audit</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                    <Settings className="w-6 h-6 text-amber-400" />
                    <span className="text-sm text-gray-300">Configuration</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backups' && (
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Backup History</h3>
                  <button className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                    View All
                  </button>
                </div>
                <div className="divide-y divide-white/5">
                  {backups.map((backup) => (
                    <div key={backup.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          backup.status === 'completed' ? 'bg-green-500/20' :
                          backup.status === 'in_progress' ? 'bg-blue-500/20' : 'bg-red-500/20'
                        }`}>
                          {backup.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : backup.status === 'in_progress' ? (
                            <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{backup.name}</p>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>{backup.size}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(backup.createdAt).toLocaleDateString()}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              backup.type === 'auto' ? 'bg-blue-500/20 text-blue-400' : 'bg-cyan-500/20 text-cyan-400'
                            }`}>
                              {backup.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                          <Download className="w-4 h-4 text-gray-400 hover:text-white" />
                        </button>
                        <button className="p-2 hover:bg-red-500/20 rounded-lg transition-all">
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'queries' && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 text-center">
              <Terminal className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2 font-gendy">SQL Query Console</h3>
              <p className="text-gray-400 font-diatype mb-6">
                Execute queries and manage your database directly
              </p>
              <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium">
                Open Console
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
