'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Download, Calendar, AlertCircle, Check } from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { cn } from '@/utils/cn'

interface Invoice {
  id: string
  date: Date
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  description: string
  downloadUrl: string
}

export default function BillingPage() {
  const [currentPlan] = useState({
    name: 'Team',
    price: 499,
    billingCycle: 'monthly',
    users: 8,
    maxUsers: 10,
    nextBillingDate: new Date(2025, 11, 27),
  })

  const [paymentMethod] = useState({
    type: 'Visa',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2026,
  })

  const [invoices] = useState<Invoice[]>([
    {
      id: 'INV-2024-001',
      date: new Date(2024, 10, 27),
      amount: 499,
      status: 'paid',
      description: 'Team Plan - November 2024',
      downloadUrl: '#'
    },
    {
      id: 'INV-2024-002',
      date: new Date(2024, 9, 27),
      amount: 499,
      status: 'paid',
      description: 'Team Plan - October 2024',
      downloadUrl: '#'
    },
    {
      id: 'INV-2024-003',
      date: new Date(2024, 8, 27),
      amount: 499,
      status: 'paid',
      description: 'Team Plan - September 2024',
      downloadUrl: '#'
    },
  ])

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'text-green-400 bg-green-500/10'
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/10'
      case 'overdue':
        return 'text-red-400 bg-red-500/10'
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Billing & Subscription</h1>
          </div>
          <p className="text-gray-400">
            Manage your subscription, payment methods, and billing history
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Plan */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Current Plan</h2>

              <div className="bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-purple-500/20 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {currentPlan.name}
                    </h3>
                    <p className="text-gray-400">
                      {currentPlan.users} of {currentPlan.maxUsers} users
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-purple-400">
                      ${currentPlan.price}
                    </div>
                    <div className="text-sm text-gray-400">per month</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                  <Calendar className="w-4 h-4" />
                  <span>Next billing date: {formatDate(currentPlan.nextBillingDate)}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="gradient" size="sm">
                    Upgrade Plan
                  </Button>
                  <Button variant="secondary" size="sm">
                    Change Plan
                  </Button>
                </div>
              </div>

              {/* Plan Features */}
              <div className="space-y-3">
                <h3 className="font-semibold text-white mb-3">Your Plan Includes:</h3>
                {[
                  'Up to 10 users',
                  'Full course library access',
                  'Advanced AI advisor',
                  'Team analytics dashboard',
                  '4 assessments per quarter',
                  'Priority support'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-400" />
                    </div>
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Payment Method</h2>

              <div className="bg-gray-800/50 rounded-xl p-4 flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded flex items-center justify-center font-bold text-white text-xs">
                    {paymentMethod.type}
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      •••• •••• •••• {paymentMethod.last4}
                    </div>
                    <div className="text-sm text-gray-400">
                      Expires {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}
                    </div>
                  </div>
                </div>
                <Button variant="secondary" size="sm">
                  Update
                </Button>
              </div>

              <Button variant="ghost" size="sm" className="w-full">
                + Add New Payment Method
              </Button>
            </div>

            {/* Invoices */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Billing History</h2>

              <div className="space-y-3">
                {invoices.map((invoice, index) => (
                  <motion.div
                    key={invoice.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gray-800/30 rounded-lg p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-white">{invoice.id}</h3>
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                          getStatusColor(invoice.status)
                        )}>
                          {invoice.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-1">{invoice.description}</p>
                      <p className="text-xs text-gray-500">{formatDate(invoice.date)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right mr-4">
                        <div className="text-lg font-bold text-white">
                          ${invoice.amount}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => window.open(invoice.downloadUrl, '_blank')}
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Usage Stats */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
              <h3 className="font-bold text-white mb-4">Usage This Month</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Active Users</span>
                    <span className="text-white font-medium">
                      {currentPlan.users}/{currentPlan.maxUsers}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                      style={{ width: `${(currentPlan.users / currentPlan.maxUsers) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Assessments</span>
                    <span className="text-white font-medium">2/4</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full w-1/2" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Courses Completed</span>
                    <span className="text-white font-medium">28</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Alerts */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-300 mb-1">
                    Add More Users
                  </h3>
                  <p className="text-sm text-yellow-200/80">
                    You're using 8 of 10 user slots. Add more users at $50/user/month.
                  </p>
                  <Button variant="ghost" size="sm" className="mt-3 text-yellow-300">
                    Add Users
                  </Button>
                </div>
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
              <h3 className="font-bold text-white mb-3">Need Help?</h3>
              <p className="text-sm text-gray-400 mb-4">
                Have questions about billing or subscriptions?
              </p>
              <Button variant="secondary" size="sm" className="w-full">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
