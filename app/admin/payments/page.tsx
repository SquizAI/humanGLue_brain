'use client'

import { useState, useEffect } from 'react'
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
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
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import { StatCard } from '@/components/atoms/StatCard'
import { Text, Heading } from '@/components/atoms/Text'
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
      <div className="min-h-screen" style={{ backgroundColor: 'var(--hg-bg-primary)' }}>
        <DashboardSidebar onLogout={handleLogout} />
        <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 flex items-center justify-center min-h-screen">
          <LoadingSpinner variant="neural" size="xl" text="Loading payments..." />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--hg-bg-primary)' }}>
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all duration-300 pb-20 lg:pb-0">
        {/* Header */}
        <div className="border-b sticky top-0 z-30 hg-bg-sidebar hg-border">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl hg-cyan-bg">
                    <DollarSign className="w-6 h-6 hg-cyan-text" />
                  </div>
                  <Heading as="h1" size="3xl">Payments & Billing</Heading>
                </div>
                <Text variant="muted">Manage transactions, subscriptions, and revenue</Text>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />}>
                  Export
                </Button>
                <Button variant="primary" size="sm" icon={<Receipt className="w-4 h-4" />}>
                  Create Invoice
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mt-6">
              {(['overview', 'transactions', 'subscriptions'] as const).map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? 'cyan' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab(tab)}
                  className="capitalize"
                >
                  {tab}
                </Button>
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
                <StatCard
                  title="Monthly Recurring Revenue"
                  value={formatCurrency(stats.mrr)}
                  icon={<TrendingUp className="w-5 h-5" />}
                  trend={{ value: stats.growth, direction: 'up' }}
                  variant="cyan"
                />
                <StatCard
                  title="Annual Recurring Revenue"
                  value={formatCurrency(stats.arr)}
                  icon={<DollarSign className="w-5 h-5" />}
                  variant="cyan"
                />
                <StatCard
                  title="Active Subscribers"
                  value="156"
                  icon={<Users className="w-5 h-5" />}
                  variant="success"
                />
                <StatCard
                  title="Churn Rate"
                  value={`${stats.churnRate}%`}
                  icon={<TrendingDown className="w-5 h-5" />}
                  trend={{ value: stats.churnRate, direction: 'down' }}
                  variant="warning"
                />
              </div>

              {/* Recent Transactions */}
              <Card padding="none" className="overflow-hidden">
                <div className="p-4 border-b hg-border flex items-center justify-between">
                  <Heading as="h3" size="lg">Recent Transactions</Heading>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab('transactions')}
                    className="hg-cyan-text"
                  >
                    View All
                  </Button>
                </div>
                <div className="divide-y hg-border">
                  {transactions.slice(0, 3).map((txn) => (
                    <div key={txn.id} className="p-4 flex items-center justify-between hover:hg-bg-secondary transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          txn.type === 'refund' ? 'bg-red-500/20' :
                          txn.type === 'subscription' ? 'bg-emerald-500/20' : 'bg-blue-500/20'
                        }`}>
                          {txn.type === 'refund' ? (
                            <RefreshCw className="w-5 h-5 text-red-400" />
                          ) : txn.type === 'subscription' ? (
                            <CreditCard className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <DollarSign className="w-5 h-5 hg-cyan-text" />
                          )}
                        </div>
                        <div>
                          <Text className="font-medium">{txn.customer}</Text>
                          <Text variant="muted" size="sm">{txn.company}</Text>
                        </div>
                      </div>
                      <div className="text-right">
                        <Text className={`font-bold ${txn.amount < 0 ? 'text-red-400' : 'hg-text-primary'}`}>
                          {txn.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(txn.amount))}
                        </Text>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          txn.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                          txn.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {txn.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 hg-text-muted" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all font-diatype hg-bg-secondary hg-border hg-text-primary"
                    style={{ '--tw-ring-color': 'var(--hg-cyan-border)' } as React.CSSProperties}
                  />
                </div>
                <Button variant="secondary" icon={<Filter className="w-4 h-4" />}>
                  Filter
                </Button>
                <Button variant="secondary" icon={<Calendar className="w-4 h-4" />}>
                  Date Range
                </Button>
              </div>

              {/* Transactions Table */}
              <Card padding="none" className="overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b hg-border">
                      <th className="px-6 py-4 text-left text-sm font-medium font-diatype hg-text-muted">Transaction</th>
                      <th className="px-6 py-4 text-left text-sm font-medium font-diatype hg-text-muted">Customer</th>
                      <th className="px-6 py-4 text-left text-sm font-medium font-diatype hg-text-muted">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-medium font-diatype hg-text-muted">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium font-diatype hg-text-muted">Date</th>
                      <th className="px-6 py-4 text-right text-sm font-medium font-diatype hg-text-muted">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn) => (
                      <tr key={txn.id} className="border-b hg-border hover:hg-bg-secondary">
                        <td className="px-6 py-4 font-mono text-sm hg-text-primary">{txn.id}</td>
                        <td className="px-6 py-4">
                          <div>
                            <Text>{txn.customer}</Text>
                            <Text variant="muted" size="sm">{txn.company}</Text>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            txn.type === 'subscription' ? 'bg-emerald-500/20 text-emerald-400' :
                            txn.type === 'one-time' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {txn.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {txn.status === 'completed' ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400" />
                            ) : txn.status === 'pending' ? (
                              <Clock className="w-4 h-4 text-amber-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400" />
                            )}
                            <Text variant="secondary" className="capitalize">{txn.status}</Text>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Text variant="muted" size="sm">{new Date(txn.date).toLocaleDateString()}</Text>
                        </td>
                        <td className={`px-6 py-4 text-right font-bold ${txn.amount < 0 ? 'text-red-400' : 'hg-text-primary'}`}>
                          {txn.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(txn.amount))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <Card padding="xl" className="text-center">
              <Building className="w-16 h-16 mx-auto mb-4 hg-cyan-text" />
              <Heading as="h3" size="xl" className="mb-2">Subscription Management</Heading>
              <Text variant="muted" className="mb-6">
                View and manage all active subscriptions, plans, and billing cycles
              </Text>
              <Button variant="primary" size="lg">
                View Subscriptions
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
