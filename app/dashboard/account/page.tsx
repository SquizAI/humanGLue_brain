'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Crown,
  CreditCard,
  Shield,
  Users,
  TrendingUp,
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
  FileText,
  Key,
  Smartphone,
  LogOut,
  ChevronRight,
  Zap,
  Database,
  Sparkles
} from 'lucide-react'
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar'
import { useBilling } from '@/lib/contexts/BillingContext'
import { SubscriptionManager } from '@/components/organisms/SubscriptionManager'
import { PaymentMethodManager } from '@/components/organisms/PaymentMethodManager'
import { PlanChangeModal } from '@/components/organisms/PlanChangeModal'

type ViewType = 'overview' | 'subscription' | 'payment'

export default function AccountPage() {
  const router = useRouter()
    const {
    currentTier,
    subscriptionStatus,
    usage,
    invoices,
    paymentMethods,
    nextBillingDate
  } = useBilling()

  const [activeView, setActiveView] = useState<ViewType>('overview')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Authentication check

  const handleLogout = () => {
    localStorage.removeItem('humanglue_user')
    router.push('/login')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'trialing':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      case 'past_due':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      case 'canceled':
        return 'text-red-400 bg-red-500/10 border-red-500/20'
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
    }
  }

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0
    return Math.min((used / limit) * 100, 100)
  }

  const recentActivity = [
    {
      id: '1',
      type: 'assessment',
      description: 'Completed Digital Transformation Readiness assessment',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      type: 'payment',
      description: 'Payment processed successfully',
      timestamp: '1 day ago'
    },
    {
      id: '3',
      type: 'team',
      description: 'Invited new team member',
      timestamp: '3 days ago'
    },
    {
      id: '4',
      type: 'security',
      description: 'Password changed',
      timestamp: '1 week ago'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      <DashboardSidebar onLogout={handleLogout} />

      {/* Main Content - offset by sidebar */}
      <div className="lg:ml-[var(--sidebar-width,280px)] pb-20 lg:pb-0 transition-all">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-8 py-6">
            <h1 className="text-3xl font-bold text-white mb-1 font-gendy">Account</h1>
            <p className="text-gray-400 font-diatype">
              Manage your subscription, billing, and account settings
            </p>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {/* View Toggle */}
          <div className="flex gap-4 mb-8">
            {[
              { id: 'overview' as ViewType, label: 'Overview' },
              { id: 'subscription' as ViewType, label: 'Subscription' },
              { id: 'payment' as ViewType, label: 'Payment Methods' }
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all font-diatype ${
                  activeView === view.id
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-white'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>

          {/* Overview View */}
          {activeView === 'overview' && (
            <div className="space-y-6">
              {/* Account Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Current Plan */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 cursor-pointer"
                  onClick={() => setActiveView('subscription')}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-cyan-500/10 rounded-lg">
                      <Crown className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 font-diatype">Current Plan</div>
                      <div className="text-xl font-bold text-white font-gendy capitalize">
                        {currentTier}
                      </div>
                    </div>
                  </div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border font-diatype ${getStatusColor(subscriptionStatus)}`}>
                    <CheckCircle2 className="w-3 h-3" />
                    {subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1)}
                  </div>
                </motion.div>

                {/* Next Billing */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <Calendar className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 font-diatype">Next Billing</div>
                      <div className="text-xl font-bold text-white font-gendy">
                        {new Date(nextBillingDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 font-diatype">
                    {Math.ceil((new Date(nextBillingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                  </div>
                </motion.div>

                {/* Team Members */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 cursor-pointer"
                  onClick={() => router.push('/dashboard/team')}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <Users className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 font-diatype">Team Members</div>
                      <div className="text-xl font-bold text-white font-gendy">
                        {usage.users.used}/{usage.users.limit === -1 ? '∞' : usage.users.limit}
                      </div>
                    </div>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getUsagePercentage(usage.users.used, usage.users.limit)}%` }}
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    />
                  </div>
                </motion.div>

                {/* Payment Method */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 cursor-pointer"
                  onClick={() => setActiveView('payment')}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-amber-500/10 rounded-lg">
                      <CreditCard className="w-6 h-6 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 font-diatype">Payment Method</div>
                      <div className="text-xl font-bold text-white font-gendy">
                        {paymentMethods.length > 0 ? `••• ${paymentMethods.find(pm => pm.isDefault)?.last4}` : 'None'}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 font-diatype">
                    {paymentMethods.length} method{paymentMethods.length !== 1 ? 's' : ''} on file
                  </div>
                </motion.div>
              </div>

              {/* Usage Overview */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white font-gendy">Usage Overview</h2>
                  <button
                    onClick={() => setActiveView('subscription')}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors font-diatype text-sm flex items-center gap-2"
                  >
                    View Details
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <UsageCard
                    icon={Zap}
                    label="Assessments"
                    used={usage.assessments.used}
                    limit={usage.assessments.limit}
                    color="cyan"
                  />
                  <UsageCard
                    icon={Database}
                    label="Storage"
                    used={usage.storage.used}
                    limit={usage.storage.limit}
                    unit="GB"
                    color="blue"
                  />
                  <UsageCard
                    icon={Sparkles}
                    label="AI Interactions"
                    used={usage.aiInteractions.used}
                    limit={usage.aiInteractions.limit}
                    color="amber"
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <h2 className="text-xl font-semibold text-white mb-6 font-gendy">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <QuickActionButton
                    icon={TrendingUp}
                    label="Upgrade Plan"
                    description="Get more features"
                    onClick={() => setShowUpgradeModal(true)}
                  />
                  <QuickActionButton
                    icon={CreditCard}
                    label="Add Payment Method"
                    description="Manage billing"
                    onClick={() => setActiveView('payment')}
                  />
                  <QuickActionButton
                    icon={Download}
                    label="Download Invoices"
                    description="View billing history"
                    onClick={() => setActiveView('subscription')}
                  />
                  <QuickActionButton
                    icon={Users}
                    label="Invite Team Members"
                    description="Collaborate together"
                    onClick={() => router.push('/dashboard/team')}
                  />
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <h2 className="text-xl font-semibold text-white mb-6 font-gendy">Recent Activity</h2>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                    >
                      <div className="p-2 bg-cyan-500/10 rounded-lg">
                        {activity.type === 'assessment' && <Activity className="w-5 h-5 text-cyan-400" />}
                        {activity.type === 'payment' && <CreditCard className="w-5 h-5 text-green-400" />}
                        {activity.type === 'team' && <Users className="w-5 h-5 text-blue-400" />}
                        {activity.type === 'security' && <Shield className="w-5 h-5 text-amber-400" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium font-diatype">
                          {activity.description}
                        </div>
                        <div className="text-sm text-gray-400 font-diatype flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {activity.timestamp}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Status */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <h2 className="text-xl font-semibold text-white mb-6 font-gendy">Security Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <SecurityItem
                    icon={Key}
                    label="Password"
                    status="Strong"
                    statusColor="text-green-400"
                    lastUpdated="2 weeks ago"
                  />
                  <SecurityItem
                    icon={Smartphone}
                    label="Two-Factor Auth"
                    status="Enabled"
                    statusColor="text-green-400"
                    lastUpdated="Active"
                  />
                  <SecurityItem
                    icon={Shield}
                    label="Active Sessions"
                    status="2 devices"
                    statusColor="text-blue-400"
                    lastUpdated="View all"
                    onClick={() => router.push('/dashboard/settings')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Subscription View */}
          {activeView === 'subscription' && (
            <SubscriptionManager
              onUpgradeClick={() => setShowUpgradeModal(true)}
              onManagePayment={() => setActiveView('payment')}
            />
          )}

          {/* Payment View */}
          {activeView === 'payment' && <PaymentMethodManager />}
        </div>
      </div>

      {/* Plan Change Modal */}
      <PlanChangeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
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
  color: 'cyan' | 'blue' | 'amber'
}

function UsageCard({ icon: Icon, label, used, limit, unit = '', color }: UsageCardProps) {
  const percentage = limit === -1 ? 0 : Math.min((used / limit) * 100, 100)
  const isUnlimited = limit === -1

  const colorClasses = {
    purple: 'from-cyan-500 to-blue-500',
    blue: 'from-blue-500 to-cyan-500',
    amber: 'from-amber-500 to-orange-500'
  }

  return (
    <div className="p-6 bg-white/5 rounded-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 bg-${color}-500/10 rounded-lg`}>
          <Icon className={`w-5 h-5 text-${color}-400`} />
        </div>
        <div className="text-sm text-gray-400 font-diatype">{label}</div>
      </div>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-bold text-white font-gendy">
          {used}
          {unit}
        </span>
        <span className="text-gray-500 font-diatype">
          / {isUnlimited ? '∞' : `${limit}${unit}`}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className={`h-full bg-gradient-to-r ${colorClasses[color]}`}
          />
        </div>
      )}
    </div>
  )
}

// Quick Action Button
interface QuickActionButtonProps {
  icon: any
  label: string
  description: string
  onClick: () => void
}

function QuickActionButton({ icon: Icon, label, description, onClick }: QuickActionButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-cyan-500/30 transition-all text-left"
    >
      <div className="p-3 bg-cyan-500/10 rounded-lg">
        <Icon className="w-6 h-6 text-cyan-400" />
      </div>
      <div className="flex-1">
        <div className="text-white font-semibold font-diatype">{label}</div>
        <div className="text-sm text-gray-400 font-diatype">{description}</div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </motion.button>
  )
}

// Security Item
interface SecurityItemProps {
  icon: any
  label: string
  status: string
  statusColor: string
  lastUpdated: string
  onClick?: () => void
}

function SecurityItem({ icon: Icon, label, status, statusColor, lastUpdated, onClick }: SecurityItemProps) {
  return (
    <div
      className={`p-4 bg-white/5 rounded-xl ${onClick ? 'cursor-pointer hover:bg-white/10 transition-all' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-3">
        <Icon className="w-5 h-5 text-cyan-400" />
        <div className="text-sm text-gray-400 font-diatype">{label}</div>
      </div>
      <div className={`text-lg font-semibold font-gendy ${statusColor}`}>{status}</div>
      <div className="text-xs text-gray-500 font-diatype mt-1">{lastUpdated}</div>
    </div>
  )
}
