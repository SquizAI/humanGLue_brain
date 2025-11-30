'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, Calendar, Download, CreditCard, Clock } from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useRouter } from 'next/navigation'

// Trust middleware protection - no need for client-side auth checks
// Middleware already validates access before page loads

export default function ExpertEarningsPage() {
  const router = useRouter()
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
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

  // Mock data
  const stats = {
    totalEarnings: 12450,
    pendingPayouts: 2340,
    completedSessions: 38,
    averageRate: 150
  }

  const recentPayments = [
    {
      id: 1,
      date: '2025-11-25',
      amount: 600,
      client: 'Sarah Johnson',
      sessions: 4,
      status: 'paid'
    },
    {
      id: 2,
      date: '2025-11-20',
      amount: 450,
      client: 'Michael Chen',
      sessions: 3,
      status: 'paid'
    },
    {
      id: 3,
      date: '2025-11-15',
      amount: 750,
      client: 'Emily Rodriguez',
      sessions: 5,
      status: 'paid'
    },
    {
      id: 4,
      date: '2025-12-01',
      amount: 300,
      client: 'David Kim',
      sessions: 2,
      status: 'pending'
    }
  ]

  return (
    <div className="min-h-screen bg-black">
      <DashboardSidebar onLogout={handleLogout} />

      <div className="lg:ml-[var(--sidebar-width,280px)] transition-all">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 font-gendy">Earnings</h1>
              <p className="text-gray-400 font-diatype">Track your payments and session revenue</p>
            </div>
            <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all font-diatype flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Report
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl rounded-xl border border-cyan-500/20 p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-cyan-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1 font-gendy">
                ${stats.totalEarnings.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-400 font-diatype">Total Earnings</p>
              <div className="mt-2 text-xs text-green-400 font-diatype">+12% from last month</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1 font-gendy">
                ${stats.pendingPayouts.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-400 font-diatype">Pending Payouts</p>
              <div className="mt-2 text-xs text-gray-400 font-diatype">Next payout Dec 15</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1 font-gendy">
                {stats.completedSessions}
              </h3>
              <p className="text-sm text-gray-400 font-diatype">Completed Sessions</p>
              <div className="mt-2 text-xs text-gray-400 font-diatype">This month</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1 font-gendy">
                ${stats.averageRate}/hr
              </h3>
              <p className="text-sm text-gray-400 font-diatype">Average Hourly Rate</p>
            </motion.div>
          </div>

          {/* Recent Payments */}
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white font-gendy">Recent Payments</h2>
              <div className="flex gap-2">
                {['week', 'month', 'year'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range as any)}
                    className={`px-4 py-2 rounded-lg transition-all font-diatype text-sm ${
                      timeRange === range
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400 font-diatype">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400 font-diatype">Client</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400 font-diatype">Sessions</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400 font-diatype">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400 font-diatype">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((payment, index) => (
                    <motion.tr
                      key={payment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-all"
                    >
                      <td className="py-4 px-4 text-gray-300 font-diatype">
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-white font-medium font-diatype">{payment.client}</td>
                      <td className="py-4 px-4 text-gray-300 font-diatype">{payment.sessions}</td>
                      <td className="py-4 px-4 text-white font-semibold font-diatype">
                        ${payment.amount.toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium font-diatype ${
                          payment.status === 'paid'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {payment.status === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mt-6 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4 font-gendy">Payout Method</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium font-diatype">Bank Account ****4567</p>
                  <p className="text-sm text-gray-400 font-diatype">Monthly automatic transfers</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all font-diatype">
                Update Method
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
