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
      <div className="min-h-screen" style={{ backgroundColor: 'var(--hg-bg-primary)' }}>
        <DashboardSidebar onLogout={handleLogout} />
        <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 flex items-center justify-center min-h-screen">
          <LoadingSpinner variant="neural" size="xl" text="Loading database..." />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--hg-bg-primary)' }}>
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        {/* Header */}
        <div className="border-b sticky top-0 z-30" style={{ backgroundColor: 'var(--hg-bg-sidebar)', borderColor: 'var(--hg-border-color)' }}>
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl" style={{ backgroundColor: 'var(--hg-cyan-bg)' }}>
                    <Database className="w-6 h-6" style={{ color: 'var(--hg-cyan-text)' }} />
                  </div>
                  <h1 className="text-3xl font-bold font-gendy" style={{ color: 'var(--hg-text-primary)' }}>Database Management</h1>
                </div>
                <p className="font-diatype" style={{ color: 'var(--hg-text-muted)' }}>Monitor and manage your database infrastructure</p>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all disabled:opacity-50 border"
                  style={{ backgroundColor: 'var(--hg-bg-secondary)', borderColor: 'var(--hg-border-color)', color: 'var(--hg-text-secondary)' }}
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium"
                  style={{ boxShadow: '0 4px 14px rgba(97, 216, 254, 0.4)' }}
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
                  className="px-4 py-2 rounded-lg font-medium transition-all capitalize border"
                  style={{
                    backgroundColor: activeTab === tab ? 'var(--hg-cyan-bg)' : 'transparent',
                    borderColor: activeTab === tab ? 'var(--hg-cyan-border)' : 'transparent',
                    color: activeTab === tab ? 'var(--hg-cyan-text)' : 'var(--hg-text-muted)'
                  }}
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
                  className="border rounded-xl p-6 transition-all hover:border-[var(--hg-cyan-border)]"
                  style={{ backgroundColor: 'var(--hg-bg-card)', borderColor: 'var(--hg-border-color)' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <HardDrive className="w-8 h-8" style={{ color: 'var(--hg-cyan-text)' }} />
                    <span className="text-xs text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-full">Healthy</span>
                  </div>
                  <p className="text-sm mb-1 font-diatype" style={{ color: 'var(--hg-text-muted)' }}>Storage Used</p>
                  <p className="text-2xl font-bold font-gendy" style={{ color: 'var(--hg-text-primary)' }}>{stats.usedSize} / {stats.totalSize}</p>
                  <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--hg-bg-secondary)' }}>
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: '32%' }} />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="border rounded-xl p-6 transition-all hover:border-[var(--hg-cyan-border)]"
                  style={{ backgroundColor: 'var(--hg-bg-card)', borderColor: 'var(--hg-border-color)' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Server className="w-8 h-8" style={{ color: 'var(--hg-cyan-text)' }} />
                    <span className="text-xs text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-full">Online</span>
                  </div>
                  <p className="text-sm mb-1 font-diatype" style={{ color: 'var(--hg-text-muted)' }}>Active Connections</p>
                  <p className="text-2xl font-bold font-gendy" style={{ color: 'var(--hg-text-primary)' }}>{stats.connections}</p>
                  <p className="text-sm mt-2 font-diatype" style={{ color: 'var(--hg-text-muted)' }}>Uptime: {stats.uptime}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="border rounded-xl p-6 transition-all hover:border-[var(--hg-cyan-border)]"
                  style={{ backgroundColor: 'var(--hg-bg-card)', borderColor: 'var(--hg-border-color)' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Activity className="w-8 h-8" style={{ color: 'var(--hg-cyan-text)' }} />
                  </div>
                  <p className="text-sm mb-1 font-diatype" style={{ color: 'var(--hg-text-muted)' }}>Tables / Indexes</p>
                  <p className="text-2xl font-bold font-gendy" style={{ color: 'var(--hg-text-primary)' }}>{stats.tables} / {stats.indexes}</p>
                  <p className="text-sm mt-2 font-diatype" style={{ color: 'var(--hg-text-muted)' }}>PostgreSQL 15.4</p>
                </motion.div>
              </div>

              {/* Quick Actions */}
              <div className="border rounded-xl p-6" style={{ backgroundColor: 'var(--hg-bg-card)', borderColor: 'var(--hg-border-color)' }}>
                <h3 className="text-lg font-semibold mb-4 font-gendy" style={{ color: 'var(--hg-text-primary)' }}>Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all" style={{ backgroundColor: 'var(--hg-bg-secondary)' }}>
                    <Terminal className="w-6 h-6" style={{ color: 'var(--hg-cyan-text)' }} />
                    <span className="text-sm font-diatype" style={{ color: 'var(--hg-text-secondary)' }}>SQL Console</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all" style={{ backgroundColor: 'var(--hg-bg-secondary)' }}>
                    <Upload className="w-6 h-6" style={{ color: 'var(--hg-cyan-text)' }} />
                    <span className="text-sm font-diatype" style={{ color: 'var(--hg-text-secondary)' }}>Import Data</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all" style={{ backgroundColor: 'var(--hg-bg-secondary)' }}>
                    <Shield className="w-6 h-6 text-emerald-400" />
                    <span className="text-sm font-diatype" style={{ color: 'var(--hg-text-secondary)' }}>Security Audit</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all" style={{ backgroundColor: 'var(--hg-bg-secondary)' }}>
                    <Settings className="w-6 h-6 text-amber-400" />
                    <span className="text-sm font-diatype" style={{ color: 'var(--hg-text-secondary)' }}>Configuration</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backups' && (
            <div className="space-y-6">
              <div className="border rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--hg-bg-card)', borderColor: 'var(--hg-border-color)' }}>
                <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--hg-border-color)' }}>
                  <h3 className="text-lg font-semibold font-gendy" style={{ color: 'var(--hg-text-primary)' }}>Backup History</h3>
                  <button className="text-sm transition-colors hover:underline font-diatype" style={{ color: 'var(--hg-cyan-text)' }}>
                    View All
                  </button>
                </div>
                <div className="divide-y" style={{ borderColor: 'var(--hg-border-color)' }}>
                  {backups.map((backup) => (
                    <div key={backup.id} className="p-4 flex items-center justify-between transition-all" style={{ backgroundColor: 'var(--hg-bg-card)' }}>
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          backup.status === 'completed' ? 'bg-emerald-500/20' :
                          backup.status === 'in_progress' ? 'bg-blue-500/20' : 'bg-red-500/20'
                        }`}>
                          {backup.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                          ) : backup.status === 'in_progress' ? (
                            <RefreshCw className="w-5 h-5 text-[var(--hg-cyan-text)] animate-spin" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium font-diatype" style={{ color: 'var(--hg-text-primary)' }}>{backup.name}</p>
                          <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--hg-text-muted)' }}>
                            <span>{backup.size}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(backup.createdAt).toLocaleDateString()}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              backup.type === 'auto' ? 'bg-blue-500/20 text-[var(--hg-cyan-text)]' : 'bg-cyan-500/20 text-cyan-400'
                            }`}>
                              {backup.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg transition-all" style={{ backgroundColor: 'var(--hg-bg-secondary)' }}>
                          <Download className="w-4 h-4" style={{ color: 'var(--hg-text-muted)' }} />
                        </button>
                        <button className="p-2 hover:bg-red-500/20 rounded-lg transition-all">
                          <Trash2 className="w-4 h-4" style={{ color: 'var(--hg-text-muted)' }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'queries' && (
            <div className="border rounded-xl p-8 text-center" style={{ backgroundColor: 'var(--hg-bg-card)', borderColor: 'var(--hg-border-color)' }}>
              <Terminal className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--hg-cyan-text)' }} />
              <h3 className="text-xl font-semibold mb-2 font-gendy" style={{ color: 'var(--hg-text-primary)' }}>SQL Query Console</h3>
              <p className="font-diatype mb-6" style={{ color: 'var(--hg-text-muted)' }}>
                Execute queries and manage your database directly
              </p>
              <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium" style={{ boxShadow: '0 4px 14px rgba(97, 216, 254, 0.4)' }}>
                Open Console
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
