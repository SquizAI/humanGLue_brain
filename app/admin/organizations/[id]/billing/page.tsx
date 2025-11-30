'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  CreditCard,
  ArrowLeft,
  Check,
  Loader2,
  AlertCircle,
  X,
  Calendar,
  Users,
  Folder,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  Zap,
} from 'lucide-react'

interface SubscriptionPlan {
  id: string
  name: string
  slug: string
  description?: string
  price_monthly: number
  price_yearly: number
  max_users: number
  max_teams: number
  features: Record<string, boolean>
}

interface Subscription {
  id?: string
  status: string
  billing_cycle: 'monthly' | 'yearly'
  current_period_start?: string
  current_period_end?: string
  plan?: SubscriptionPlan
}

interface Usage {
  users: { current: number; max: number; percent: number; unlimited: boolean }
  teams: { current: number; max: number; percent: number; unlimited: boolean }
}

interface Organization {
  id: string
  name: string
  subscription_tier: string
  max_users: number
  max_teams: number
}

export default function OrganizationBillingPage() {
  const params = useParams()
  const orgId = params?.id as string

  const [loading, setLoading] = useState(true)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [usage, setUsage] = useState<Usage | null>(null)
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([])
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [upgrading, setUpgrading] = useState(false)

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const res = await fetch(`/api/organizations/${orgId}/subscription`)
        const data = await res.json()

        if (data.success) {
          setOrganization(data.data.organization)
          setSubscription(data.data.subscription)
          setUsage(data.data.usage)
          setAvailablePlans(data.data.availablePlans)
          if (data.data.subscription?.billing_cycle) {
            setSelectedBillingCycle(data.data.subscription.billing_cycle)
          }
        } else {
          setError(data.error?.message || 'Failed to load subscription data')
        }
      } catch {
        setError('Failed to load subscription data')
      } finally {
        setLoading(false)
      }
    }

    if (orgId) {
      fetchData()
    }
  }, [orgId])

  const handleUpgrade = async () => {
    if (!selectedPlan) return

    try {
      setUpgrading(true)
      setError(null)

      const res = await fetch(`/api/organizations/${orgId}/subscription`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planSlug: selectedPlan,
          billingCycle: selectedBillingCycle,
        }),
      })

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to update subscription')
      }

      // Refresh data
      const refreshRes = await fetch(`/api/organizations/${orgId}/subscription`)
      const refreshData = await refreshRes.json()
      if (refreshData.success) {
        setOrganization(refreshData.data.organization)
        setSubscription(refreshData.data.subscription)
        setUsage(refreshData.data.usage)
      }

      setShowUpgradeModal(false)
      setSelectedPlan(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update subscription')
    } finally {
      setUpgrading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getCurrentPlanPrice = () => {
    if (!subscription?.plan) return 0
    return selectedBillingCycle === 'yearly'
      ? subscription.plan.price_yearly
      : subscription.plan.price_monthly
  }

  const getPlanBySlug = (slug: string) => {
    return availablePlans.find((p) => p.slug === slug)
  }

  const currentPlan = subscription?.plan || getPlanBySlug(organization?.subscription_tier || 'free')

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg font-diatype">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/admin/organizations/${orgId}`}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white font-gendy">
                Billing & Subscription
              </h1>
              <p className="text-gray-400 font-diatype">
                {organization?.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-6xl mx-auto">
        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-diatype">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-5 h-5 text-red-400" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Plan */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 font-gendy flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-cyan-400" />
                Current Plan
              </h2>

              <div className="bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-cyan-500/20 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-bold text-white font-gendy">
                        {currentPlan?.name || 'Free'}
                      </h3>
                      {subscription?.status === 'active' && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 font-diatype">
                      {currentPlan?.description || 'Basic features for small teams'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-cyan-400 font-gendy">
                      {formatPrice(getCurrentPlanPrice())}
                    </div>
                    <div className="text-sm text-gray-400 font-diatype">
                      per {subscription?.billing_cycle === 'yearly' ? 'year' : 'month'}
                    </div>
                  </div>
                </div>

                {subscription?.current_period_end && (
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 font-diatype">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {subscription.status === 'active'
                        ? `Renews on ${formatDate(subscription.current_period_end)}`
                        : `Ends on ${formatDate(subscription.current_period_end)}`}
                    </span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-cyan-500/25 transition-all font-diatype"
                  >
                    <Zap className="w-4 h-4" />
                    {currentPlan?.slug === 'enterprise' ? 'Manage Plan' : 'Upgrade Plan'}
                  </button>
                  <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-semibold transition-colors font-diatype">
                    Manage Payment
                  </button>
                </div>
              </div>

              {/* Plan Features */}
              {currentPlan?.features && (
                <div className="space-y-3">
                  <h4 className="font-medium text-white font-diatype">Your Plan Includes:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(currentPlan.features)
                      .filter(([, enabled]) => enabled)
                      .map(([feature]) => (
                        <div key={feature} className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                            <Check className="w-3 h-3 text-green-400" />
                          </div>
                          <span className="text-sm text-gray-300 font-diatype capitalize">
                            {feature.replace(/_/g, ' ')}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Available Plans */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 font-gendy flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                Available Plans
              </h2>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <button
                  onClick={() => setSelectedBillingCycle('monthly')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors font-diatype ${
                    selectedBillingCycle === 'monthly'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setSelectedBillingCycle('yearly')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors font-diatype flex items-center gap-2 ${
                    selectedBillingCycle === 'yearly'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Yearly
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                    Save 20%
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availablePlans.map((plan) => {
                  const isCurrentPlan = plan.slug === (currentPlan?.slug || organization?.subscription_tier)
                  const price = selectedBillingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly

                  return (
                    <div
                      key={plan.id}
                      className={`p-4 rounded-xl border transition-colors ${
                        isCurrentPlan
                          ? 'bg-cyan-500/10 border-cyan-500/30'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-white font-gendy">{plan.name}</h3>
                          <p className="text-sm text-gray-400 font-diatype">
                            {plan.max_users === -1 ? 'Unlimited' : plan.max_users} users,{' '}
                            {plan.max_teams === -1 ? 'unlimited' : plan.max_teams} teams
                          </p>
                        </div>
                        {isCurrentPlan && (
                          <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full font-diatype">
                            Current
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-2xl font-bold text-white font-gendy">
                          {formatPrice(price)}
                        </span>
                        <span className="text-sm text-gray-400 font-diatype">
                          /{selectedBillingCycle === 'yearly' ? 'year' : 'month'}
                        </span>
                      </div>

                      {!isCurrentPlan && (
                        <button
                          onClick={() => {
                            setSelectedPlan(plan.slug)
                            setShowUpgradeModal(true)
                          }}
                          className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors font-diatype flex items-center justify-center gap-2"
                        >
                          {price > getCurrentPlanPrice() ? 'Upgrade' : 'Switch'}
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Usage Stats */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h3 className="font-semibold text-white mb-4 font-gendy flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                Current Usage
              </h3>

              {usage && (
                <div className="space-y-4">
                  {/* Users */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400 font-diatype flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Users
                      </span>
                      <span className="text-white font-medium font-diatype">
                        {usage.users.current}
                        {!usage.users.unlimited && ` / ${usage.users.max}`}
                      </span>
                    </div>
                    {!usage.users.unlimited && (
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            usage.users.percent > 90
                              ? 'bg-red-500'
                              : usage.users.percent > 75
                              ? 'bg-yellow-500'
                              : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                          }`}
                          style={{ width: `${Math.min(usage.users.percent, 100)}%` }}
                        />
                      </div>
                    )}
                    {usage.users.unlimited && (
                      <p className="text-xs text-gray-500 font-diatype">Unlimited</p>
                    )}
                  </div>

                  {/* Teams */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400 font-diatype flex items-center gap-2">
                        <Folder className="w-4 h-4" />
                        Teams
                      </span>
                      <span className="text-white font-medium font-diatype">
                        {usage.teams.current}
                        {!usage.teams.unlimited && ` / ${usage.teams.max}`}
                      </span>
                    </div>
                    {!usage.teams.unlimited && (
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            usage.teams.percent > 90
                              ? 'bg-red-500'
                              : usage.teams.percent > 75
                              ? 'bg-yellow-500'
                              : 'bg-gradient-to-r from-green-500 to-emerald-500'
                          }`}
                          style={{ width: `${Math.min(usage.teams.percent, 100)}%` }}
                        />
                      </div>
                    )}
                    {usage.teams.unlimited && (
                      <p className="text-xs text-gray-500 font-diatype">Unlimited</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Upgrade Alert */}
            {usage && (usage.users.percent > 80 || usage.teams.percent > 80) && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-300 mb-1 font-gendy">
                      Approaching Limit
                    </h3>
                    <p className="text-sm text-yellow-200/80 font-diatype">
                      You're using most of your plan's capacity. Consider upgrading for more
                      resources.
                    </p>
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      className="mt-3 text-sm text-yellow-300 hover:text-yellow-200 font-medium font-diatype"
                    >
                      View upgrade options →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <h3 className="font-semibold text-white mb-4 font-gendy">Quick Links</h3>
              <div className="space-y-2">
                <Link
                  href={`/admin/organizations/${orgId}/members`}
                  className="block p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 font-diatype">Manage Members</span>
                    <ArrowUpRight className="w-4 h-4 text-gray-500" />
                  </div>
                </Link>
                <Link
                  href={`/admin/organizations/${orgId}/teams`}
                  className="block p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 font-diatype">Manage Teams</span>
                    <ArrowUpRight className="w-4 h-4 text-gray-500" />
                  </div>
                </Link>
                <Link
                  href={`/admin/organizations/${orgId}`}
                  className="block p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 font-diatype">Organization Settings</span>
                    <ArrowUpRight className="w-4 h-4 text-gray-500" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => !upgrading && setShowUpgradeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-gray-900 rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white font-gendy">
                  {selectedPlan ? 'Confirm Plan Change' : 'Select a Plan'}
                </h3>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {selectedPlan ? (
                <div>
                  {(() => {
                    const plan = getPlanBySlug(selectedPlan)
                    if (!plan) return null

                    const price =
                      selectedBillingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly

                    return (
                      <>
                        <div className="bg-white/5 rounded-xl p-4 mb-6">
                          <h4 className="font-semibold text-white mb-1 font-gendy">{plan.name}</h4>
                          <p className="text-sm text-gray-400 mb-3 font-diatype">
                            {plan.max_users === -1 ? 'Unlimited' : plan.max_users} users,{' '}
                            {plan.max_teams === -1 ? 'unlimited' : plan.max_teams} teams
                          </p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-cyan-400">
                              {formatPrice(price)}
                            </span>
                            <span className="text-sm text-gray-400">
                              /{selectedBillingCycle === 'yearly' ? 'year' : 'month'}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-400 mb-6 font-diatype">
                          Your plan will be changed immediately. You'll be charged the prorated
                          difference for this billing period.
                        </p>

                        {error && (
                          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-diatype mb-4">
                            {error}
                          </div>
                        )}

                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setSelectedPlan(null)
                              setError(null)
                            }}
                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold transition-colors font-diatype"
                          >
                            Back
                          </button>
                          <button
                            onClick={handleUpgrade}
                            disabled={upgrading}
                            className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 font-diatype"
                          >
                            {upgrading ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              'Confirm Change'
                            )}
                          </button>
                        </div>
                      </>
                    )
                  })()}
                </div>
              ) : (
                <div className="space-y-3">
                  {availablePlans
                    .filter((p) => p.slug !== (currentPlan?.slug || organization?.subscription_tier))
                    .map((plan) => {
                      const price =
                        selectedBillingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly

                      return (
                        <button
                          key={plan.id}
                          onClick={() => setSelectedPlan(plan.slug)}
                          className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/20 transition-colors text-left"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-white font-gendy">{plan.name}</h4>
                              <p className="text-sm text-gray-400 font-diatype">
                                {plan.max_users === -1 ? 'Unlimited' : plan.max_users} users
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-cyan-400">{formatPrice(price)}</div>
                              <div className="text-xs text-gray-500">
                                /{selectedBillingCycle === 'yearly' ? 'yr' : 'mo'}
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
