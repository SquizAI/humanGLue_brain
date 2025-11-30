'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Crown,
  TrendingUp,
  Users,
  Database,
  Calendar,
  CreditCard,
  Download,
  AlertCircle,
  CheckCircle2,
  Zap,
  RefreshCw,
  Pause,
  XCircle,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { useBilling, SubscriptionTier, BillingCycle } from '@/lib/contexts/BillingContext'

interface SubscriptionManagerProps {
  onUpgradeClick?: () => void
  onManagePayment?: () => void
}

export function SubscriptionManager({ onUpgradeClick, onManagePayment }: SubscriptionManagerProps) {
  const {
    currentTier,
    billingCycle,
    subscriptionStatus,
    nextBillingDate,
    usage,
    invoices,
    changeBillingCycle,
    cancelSubscription,
    pauseSubscription,
    resumeSubscription,
    downloadInvoice,
    refreshUsage,
    isLoading,
    availablePlans
  } = useBilling()

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [isChangingCycle, setIsChangingCycle] = useState(false)

  const currentPlan = availablePlans.find(plan => plan.name.toLowerCase() === currentTier)

  const handleChangeCycle = async (cycle: BillingCycle) => {
    setIsChangingCycle(true)
    try {
      await changeBillingCycle(cycle)
    } finally {
      setIsChangingCycle(false)
    }
  }

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription(cancelReason)
      setShowCancelModal(false)
      setCancelReason('')
    } catch (error) {
      console.error('Cancel failed:', error)
    }
  }

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0 // unlimited
    return Math.min((used / limit) * 100, 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'from-red-500 to-red-600'
    if (percentage >= 70) return 'from-amber-500 to-orange-500'
    return 'from-cyan-500 to-blue-500'
  }

  const formatLimit = (limit: number) => {
    return limit === -1 ? 'Unlimited' : limit.toString()
  }

  const getStatusBadge = () => {
    const statusConfig = {
      active: { color: 'bg-green-500/10 border-green-500/20 text-green-400', icon: CheckCircle2, text: 'Active' },
      trialing: { color: 'bg-blue-500/10 border-blue-500/20 text-blue-400', icon: Sparkles, text: 'Trial' },
      canceled: { color: 'bg-red-500/10 border-red-500/20 text-red-400', icon: XCircle, text: 'Canceled' },
      past_due: { color: 'bg-amber-500/10 border-amber-500/20 text-amber-400', icon: AlertCircle, text: 'Past Due' },
      paused: { color: 'bg-gray-500/10 border-gray-500/20 text-gray-400', icon: Pause, text: 'Paused' }
    }

    const config = statusConfig[subscriptionStatus]
    const Icon = config.icon

    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border font-diatype ${config.color}`}>
        <Icon className="w-4 h-4" />
        {config.text}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Header */}
      <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white font-gendy">
                {currentPlan?.name || 'Current Plan'}
              </h2>
              {getStatusBadge()}
            </div>
            <p className="text-gray-400 font-diatype">
              ${currentPlan?.price || 0}/{billingCycle}
            </p>
          </div>

          {subscriptionStatus === 'active' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onUpgradeClick}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/50 font-diatype flex items-center gap-2"
            >
              <TrendingUp className="w-5 h-5" />
              Upgrade Plan
            </motion.button>
          )}
        </div>

        {/* Billing Cycle Toggle */}
        {subscriptionStatus === 'active' && currentTier !== 'free' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3 font-diatype">
              Billing Cycle
            </label>
            <div className="flex gap-3">
              {(['monthly', 'annual'] as BillingCycle[]).map((cycle) => (
                <button
                  key={cycle}
                  onClick={() => handleChangeCycle(cycle)}
                  disabled={isChangingCycle || billingCycle === cycle}
                  className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all font-diatype ${
                    billingCycle === cycle
                      ? 'bg-cyan-500/20 border-2 border-cyan-500/50 text-white'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                  } disabled:opacity-50`}
                >
                  <div className="text-center">
                    <div className="font-semibold capitalize">{cycle}</div>
                    {cycle === 'annual' && (
                      <div className="text-xs text-green-400 mt-1">Save 20%</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Usage Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <UsageCard
            icon={Zap}
            label="Assessments"
            used={usage.assessments.used}
            limit={usage.assessments.limit}
            getPercentage={getUsagePercentage}
            getColor={getUsageColor}
            formatLimit={formatLimit}
          />
          <UsageCard
            icon={Users}
            label="Team Members"
            used={usage.users.used}
            limit={usage.users.limit}
            getPercentage={getUsagePercentage}
            getColor={getUsageColor}
            formatLimit={formatLimit}
          />
          <UsageCard
            icon={Database}
            label="Storage"
            used={usage.storage.used}
            limit={usage.storage.limit}
            unit="GB"
            getPercentage={getUsagePercentage}
            getColor={getUsageColor}
            formatLimit={formatLimit}
          />
          <UsageCard
            icon={Calendar}
            label="Workshops"
            used={usage.workshops.used}
            limit={usage.workshops.limit}
            getPercentage={getUsagePercentage}
            getColor={getUsageColor}
            formatLimit={formatLimit}
          />
          <UsageCard
            icon={Sparkles}
            label="AI Interactions"
            used={usage.aiInteractions.used}
            limit={usage.aiInteractions.limit}
            getPercentage={getUsagePercentage}
            getColor={getUsageColor}
            formatLimit={formatLimit}
          />
          <div className="p-4 bg-white/5 rounded-xl flex items-center justify-center">
            <button
              onClick={refreshUsage}
              disabled={isLoading}
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-medium font-diatype disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Usage
            </button>
          </div>
        </div>

        {/* Next Billing Date */}
        {subscriptionStatus === 'active' && (
          <div className="mt-6 p-4 bg-white/5 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-diatype">Next billing date</span>
              <span className="text-white font-semibold font-diatype">
                {new Date(nextBillingDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Payment Method */}
      {currentTier !== 'free' && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white font-gendy">Payment Method</h2>
            <button
              onClick={onManagePayment}
              className="text-cyan-400 hover:text-cyan-300 transition-colors font-diatype text-sm flex items-center gap-2"
            >
              Manage
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
            <div className="p-3 bg-cyan-500/10 rounded-lg">
              <CreditCard className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="flex-1">
              <div className="text-white font-medium font-diatype">Credit Card</div>
              <div className="text-sm text-gray-400 font-diatype">Ending in 4242 • Expires 12/25</div>
            </div>
          </div>
        </div>
      )}

      {/* Billing History */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
        <h2 className="text-xl font-semibold text-white mb-6 font-gendy">Billing History</h2>
        <div className="space-y-4">
          {invoices.slice(0, 5).map((invoice) => (
            <motion.div
              key={invoice.id}
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              className="flex items-center justify-between p-4 bg-white/5 rounded-xl transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <CreditCard className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="text-white font-medium font-diatype">{invoice.description}</div>
                  <div className="text-sm text-gray-400 font-diatype">
                    {new Date(invoice.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white font-semibold font-diatype">${invoice.amount}</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold font-diatype ${
                    invoice.status === 'paid'
                      ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                      : invoice.status === 'pending'
                      ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}
                >
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
                <button
                  onClick={() => downloadInvoice(invoice.id)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <Download className="w-4 h-4 text-gray-400 hover:text-white" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Subscription Actions */}
      {subscriptionStatus === 'active' && currentTier !== 'free' && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6 font-gendy">Subscription Actions</h2>
          <div className="flex flex-wrap gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={pauseSubscription}
              disabled={isLoading}
              className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all font-diatype disabled:opacity-50 flex items-center gap-2"
            >
              <Pause className="w-5 h-5" />
              Pause Subscription
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCancelModal(true)}
              className="px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-semibold hover:bg-red-500/20 transition-all font-diatype flex items-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              Cancel Subscription
            </motion.button>
          </div>
        </div>
      )}

      {subscriptionStatus === 'paused' && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-400 mb-2 font-gendy">
                Subscription Paused
              </h3>
              <p className="text-amber-300/80 mb-4 font-diatype">
                Your subscription is currently paused. You can resume it at any time.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resumeSubscription}
                disabled={isLoading}
                className="px-6 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-all font-diatype disabled:opacity-50"
              >
                Resume Subscription
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-red-500/30 rounded-2xl p-8 max-w-md w-full"
            >
              <h3 className="text-2xl font-bold text-white mb-4 font-gendy">
                Cancel Subscription?
              </h3>
              <p className="text-gray-400 mb-6 font-diatype">
                We're sorry to see you go. Your subscription will remain active until the end of
                your current billing period.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                  Tell us why you're leaving (optional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Your feedback helps us improve..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500/30 transition-all font-diatype resize-none"
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all font-diatype"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancelSubscription}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all font-diatype disabled:opacity-50"
                >
                  {isLoading ? 'Canceling...' : 'Cancel Subscription'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Usage Card Component
interface UsageCardProps {
  icon: any
  label: string
  used: number
  limit: number
  unit?: string
  getPercentage: (used: number, limit: number) => number
  getColor: (percentage: number) => string
  formatLimit: (limit: number) => string
}

function UsageCard({ icon: Icon, label, used, limit, unit = '', getPercentage, getColor, formatLimit }: UsageCardProps) {
  const percentage = getPercentage(used, limit)
  const color = getColor(percentage)
  const isUnlimited = limit === -1

  return (
    <div className="p-4 bg-white/5 rounded-xl">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2 font-diatype">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl font-bold text-white font-gendy">
          {used}
          {unit}
        </span>
        <span className="text-gray-500 font-diatype">
          / {formatLimit(limit)}
          {unit}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className={`h-full bg-gradient-to-r ${color}`}
          />
        </div>
      )}
      {isUnlimited && (
        <div className="text-xs text-cyan-400 font-semibold font-diatype">Unlimited</div>
      )}
    </div>
  )
}
