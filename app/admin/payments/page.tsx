'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
  Search,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Users,
  Building,
  Receipt,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner'
import { useChat } from '@/lib/contexts/ChatContext'
import { signOut } from '@/lib/auth/hooks'

interface Transaction {
  id: string
  customer: string
  company: string
  amount: number
  type: 'subscription' | 'one-time' | 'refund'
  status: 'completed' | 'pending' | 'failed'
  date: string
  plan?: string
}

interface RevenueStats {
  mrr: number
  arr: number
  growth: number
  churnRate: number
}

export default function AdminPaymentsPage() {
  const { userData, authLoading } = useChat()
  const [showContent, setShowContent] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'subscriptions'>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [stats] = useState<RevenueStats>({
    mrr: 47500,
    arr: 570000,
    growth: 12.5,
    churnRate: 2.3,
  })
  const [transactions] = useState<Transaction[]>([
    {
      id: 'txn_001',
      customer: 'Sarah Mitchell',
      company: 'TechCorp Inc',
      amount: 299,
      type: 'subscription',
      status: 'completed',
      date: '2025-01-28T10:30:00Z',
      plan: 'Professional',
    },
    {
      id: 'txn_002',
      customer: 'James Wilson',
      company: 'InnovateCo',
      amount: 599,
      type: 'subscription',
      status: 'completed',
      date: '2025-01-27T14:15:00Z',
      plan: 'Enterprise',
    },
    {
      id: 'txn_003',
      customer: 'Michael Chen',
      company: 'StartupXYZ',
      amount: 99,
      type: 'one-time',
      status: 'pending',
      date: '2025-01-27T09:45:00Z',
    },
    {
      id: 'txn_004',
      customer: 'Emily Davis',
      company: 'ConsultPro',
      amount: -150,
      type: 'refund',
      status: 'completed',
      date: '2025-01-26T16:20:00Z',
    },
  ])

  useEffect(() => {
    if (!authLoading && userData?.isAdmin) {
      setShowContent(true)
      return
    }

    const timeout = setTimeout(() => {
      console.log('[PaymentsAdmin] Auth timeout - trusting middleware protection')
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (!showContent) {
    return (
      <div className="min-h-screen bg-black">
        <DashboardSidebar onLogout={handleLogout} />
        <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 flex items-center justify-center min-h-screen">
          <LoadingSpinner variant="neural" size="xl" text="Loading payments..." />
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
                  <div className="p-2 bg-green-500/20 rounded-xl">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                  <h1 className="text-3xl font-bold text-white font-gendy">Payments & Billing</h1>
                </div>
                <p className="text-gray-400 font-diatype">Manage transactions, subscriptions, and revenue</p>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-lg hover:bg-white/10 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Export
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium shadow-lg shadow-green-500/25"
                >
                  <Receipt className="w-4 h-4" />
                  Create Invoice
                </motion.button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mt-6">
              {(['overview', 'transactions', 'subscriptions'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                    activeTab === tab
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
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
              {/* Revenue Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="w-8 h-8 text-green-400" />
                    <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                      <ArrowUpRight className="w-3 h-3" />
                      +{stats.growth}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">Monthly Recurring Revenue</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(stats.mrr)}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-sm text-gray-400 mb-1">Annual Recurring Revenue</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(stats.arr)}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 text-cyan-400" />
                  </div>
                  <p className="text-sm text-gray-400 mb-1">Active Subscribers</p>
                  <p className="text-2xl font-bold text-white">156</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <TrendingDown className="w-8 h-8 text-amber-400" />
                    <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/20 px-2 py-1 rounded-full">
                      <ArrowDownRight className="w-3 h-3" />
                      {stats.churnRate}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">Churn Rate</p>
                  <p className="text-2xl font-bold text-white">{stats.churnRate}%</p>
                </motion.div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
                  <button
                    onClick={() => setActiveTab('transactions')}
                    className="text-sm text-green-400 hover:text-green-300 transition-colors"
                  >
                    View All
                  </button>
                </div>
                <div className="divide-y divide-white/5">
                  {transactions.slice(0, 3).map((txn) => (
                    <div key={txn.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          txn.type === 'refund' ? 'bg-red-500/20' :
                          txn.type === 'subscription' ? 'bg-green-500/20' : 'bg-blue-500/20'
                        }`}>
                          {txn.type === 'refund' ? (
                            <RefreshCw className="w-5 h-5 text-red-400" />
                          ) : txn.type === 'subscription' ? (
                            <CreditCard className="w-5 h-5 text-green-400" />
                          ) : (
                            <DollarSign className="w-5 h-5 text-blue-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{txn.customer}</p>
                          <p className="text-sm text-gray-500">{txn.company}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${txn.amount < 0 ? 'text-red-400' : 'text-white'}`}>
                          {txn.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(txn.amount))}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          txn.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          txn.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {txn.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <button className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                  <Calendar className="w-4 h-4" />
                  Date Range
                </button>
              </div>

              {/* Transactions Table */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Transaction</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Customer</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn) => (
                      <tr key={txn.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-6 py-4 text-white font-mono text-sm">{txn.id}</td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white">{txn.customer}</p>
                            <p className="text-sm text-gray-500">{txn.company}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            txn.type === 'subscription' ? 'bg-green-500/20 text-green-400' :
                            txn.type === 'one-time' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {txn.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {txn.status === 'completed' ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : txn.status === 'pending' ? (
                              <Clock className="w-4 h-4 text-amber-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400" />
                            )}
                            <span className="text-gray-300 capitalize">{txn.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {new Date(txn.date).toLocaleDateString()}
                        </td>
                        <td className={`px-6 py-4 text-right font-bold ${txn.amount < 0 ? 'text-red-400' : 'text-white'}`}>
                          {txn.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(txn.amount))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 text-center">
              <Building className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2 font-gendy">Subscription Management</h3>
              <p className="text-gray-400 font-diatype mb-6">
                View and manage all active subscriptions, plans, and billing cycles
              </p>
              <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium">
                View Subscriptions
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
