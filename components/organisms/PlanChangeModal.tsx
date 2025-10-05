'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Check,
  Crown,
  Zap,
  Users,
  Database,
  Calendar,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertCircle,
  Info
} from 'lucide-react'
import {
  useBilling,
  SubscriptionTier,
  BillingCycle,
  getPlanByTier,
  calculateProration
} from '@/lib/contexts/BillingContext'

interface PlanChangeModalProps {
  isOpen: boolean
  onClose: () => void
  targetTier?: SubscriptionTier
}

export function PlanChangeModal({ isOpen, onClose, targetTier }: PlanChangeModalProps) {
  const {
    currentTier,
    billingCycle,
    nextBillingDate,
    availablePlans,
    upgradePlan,
    downgradePlan,
    isLoading
  } = useBilling()

  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(targetTier || currentTier)
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>(billingCycle)
  const [applyImmediately, setApplyImmediately] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (targetTier) {
      setSelectedTier(targetTier)
    }
  }, [targetTier])

  const currentPlan = getPlanByTier(currentTier)
  const selectedPlan = getPlanByTier(selectedTier)

  const isUpgrade = availablePlans.findIndex(p => p.name.toLowerCase() === selectedTier) >
    availablePlans.findIndex(p => p.name.toLowerCase() === currentTier)

  const isDowngrade = availablePlans.findIndex(p => p.name.toLowerCase() === selectedTier) <
    availablePlans.findIndex(p => p.name.toLowerCase() === currentTier)

  const isSamePlan = selectedTier === currentTier && selectedCycle === billingCycle

  // Calculate pricing
  const monthlyPrice = selectedPlan.price
  const annualPrice = selectedPlan.price * 12 * 0.8 // 20% discount
  const displayPrice = selectedCycle === 'monthly' ? monthlyPrice : annualPrice
  const savingsAmount = selectedCycle === 'annual' ? (monthlyPrice * 12 - annualPrice) : 0

  // Calculate prorated amount for immediate upgrade
  const daysUntilBilling = Math.ceil(
    (new Date(nextBillingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )
  const proratedAmount = applyImmediately && isUpgrade
    ? calculateProration(currentTier, selectedTier, selectedCycle, daysUntilBilling)
    : 0

  const handleConfirm = async () => {
    if (isSamePlan) return

    setIsSubmitting(true)
    setError(null)

    try {
      if (isUpgrade) {
        await upgradePlan(selectedTier, selectedCycle)
      } else {
        await downgradePlan(selectedTier)
      }
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to change plan. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-900 border border-purple-500/30 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gray-900 border-b border-white/10 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white font-gendy">
                {isUpgrade ? 'Upgrade' : isDowngrade ? 'Downgrade' : 'Change'} Your Plan
              </h2>
              <p className="text-gray-400 font-diatype">
                Choose the plan that fits your needs
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-all"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="p-6 border-b border-white/10">
            <div className="max-w-md mx-auto">
              <label className="block text-sm font-medium text-gray-300 mb-3 font-diatype text-center">
                Billing Cycle
              </label>
              <div className="flex gap-3">
                {(['monthly', 'annual'] as BillingCycle[]).map((cycle) => (
                  <button
                    key={cycle}
                    onClick={() => setSelectedCycle(cycle)}
                    className={`flex-1 px-6 py-4 rounded-xl font-medium transition-all font-diatype ${
                      selectedCycle === cycle
                        ? 'bg-purple-500/20 border-2 border-purple-500/50 text-white'
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
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
          </div>

          {/* Plans Comparison */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Current Plan */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="text-sm text-gray-400 mb-2 font-diatype">Current Plan</div>
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="w-6 h-6 text-purple-400" />
                  <h3 className="text-2xl font-bold text-white font-gendy">
                    {currentPlan.name}
                  </h3>
                </div>
                <div className="text-3xl font-bold text-white mb-6 font-gendy">
                  ${currentPlan.price}
                  <span className="text-lg text-gray-400 font-normal">/{billingCycle}</span>
                </div>

                <div className="space-y-3">
                  <FeatureItem
                    icon={Zap}
                    text={`${currentPlan.assessmentsLimit === -1 ? 'Unlimited' : currentPlan.assessmentsLimit} assessments/month`}
                  />
                  <FeatureItem
                    icon={Users}
                    text={`${currentPlan.usersLimit === -1 ? 'Unlimited' : currentPlan.usersLimit} team members`}
                  />
                  <FeatureItem
                    icon={Database}
                    text={`${currentPlan.storageLimit}GB storage`}
                  />
                  <FeatureItem
                    icon={Calendar}
                    text={`${currentPlan.workshopsLimit === -1 ? 'Unlimited' : currentPlan.workshopsLimit} workshop seats`}
                  />
                  <FeatureItem
                    icon={Sparkles}
                    text={`${currentPlan.aiInteractionsLimit === -1 ? 'Unlimited' : currentPlan.aiInteractionsLimit} AI interactions`}
                  />
                </div>
              </div>

              {/* Selected Plan */}
              <div className={`border-2 rounded-2xl p-6 ${
                isUpgrade ? 'bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/50' :
                isDowngrade ? 'bg-gradient-to-br from-gray-900/30 to-gray-800/30 border-gray-500/50' :
                'bg-white/5 border-white/10'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-400 font-diatype">New Plan</div>
                  {isUpgrade && (
                    <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold rounded-full font-diatype flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Upgrade
                    </div>
                  )}
                  {isDowngrade && (
                    <div className="px-3 py-1 bg-gray-500/20 border border-gray-500/30 text-gray-300 text-xs font-semibold rounded-full font-diatype flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      Downgrade
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value as SubscriptionTier)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/30 transition-all font-gendy text-xl font-bold mb-3"
                  >
                    {availablePlans.map((plan) => (
                      <option key={plan.name} value={plan.name.toLowerCase()}>
                        {plan.name}
                      </option>
                    ))}
                  </select>

                  <div className="text-3xl font-bold text-white mb-2 font-gendy">
                    ${selectedCycle === 'monthly' ? selectedPlan.price : Math.round(selectedPlan.price * 12 * 0.8)}
                    <span className="text-lg text-gray-400 font-normal">/{selectedCycle}</span>
                  </div>

                  {selectedCycle === 'annual' && savingsAmount > 0 && (
                    <div className="text-sm text-green-400 font-semibold font-diatype">
                      Save ${Math.round(savingsAmount)}/year
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <FeatureItem
                    icon={Zap}
                    text={`${selectedPlan.assessmentsLimit === -1 ? 'Unlimited' : selectedPlan.assessmentsLimit} assessments/month`}
                    highlighted={selectedPlan.assessmentsLimit > currentPlan.assessmentsLimit}
                  />
                  <FeatureItem
                    icon={Users}
                    text={`${selectedPlan.usersLimit === -1 ? 'Unlimited' : selectedPlan.usersLimit} team members`}
                    highlighted={selectedPlan.usersLimit > currentPlan.usersLimit}
                  />
                  <FeatureItem
                    icon={Database}
                    text={`${selectedPlan.storageLimit}GB storage`}
                    highlighted={selectedPlan.storageLimit > currentPlan.storageLimit}
                  />
                  <FeatureItem
                    icon={Calendar}
                    text={`${selectedPlan.workshopsLimit === -1 ? 'Unlimited' : selectedPlan.workshopsLimit} workshop seats`}
                    highlighted={selectedPlan.workshopsLimit > currentPlan.workshopsLimit}
                  />
                  <FeatureItem
                    icon={Sparkles}
                    text={`${selectedPlan.aiInteractionsLimit === -1 ? 'Unlimited' : selectedPlan.aiInteractionsLimit} AI interactions`}
                    highlighted={selectedPlan.aiInteractionsLimit > currentPlan.aiInteractionsLimit}
                  />
                </div>
              </div>
            </div>

            {/* Change Timing */}
            {isUpgrade && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-blue-300 font-semibold mb-2 font-diatype">
                      Plan Change Options
                    </h4>
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="radio"
                          checked={applyImmediately}
                          onChange={() => setApplyImmediately(true)}
                          className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="text-white font-medium font-diatype">
                            Apply immediately
                          </div>
                          <div className="text-sm text-blue-300/80 font-diatype">
                            Prorated charge of ${proratedAmount.toFixed(2)} will be applied today
                          </div>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="radio"
                          checked={!applyImmediately}
                          onChange={() => setApplyImmediately(false)}
                          className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="text-white font-medium font-diatype">
                            Apply at next billing cycle
                          </div>
                          <div className="text-sm text-blue-300/80 font-diatype">
                            Changes will take effect on {new Date(nextBillingDate).toLocaleDateString()}
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isDowngrade && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-amber-300 font-semibold mb-2 font-diatype">
                      Downgrade Notice
                    </h4>
                    <p className="text-amber-300/80 font-diatype">
                      Your plan will be downgraded at the end of your current billing period on{' '}
                      {new Date(nextBillingDate).toLocaleDateString()}. You'll continue to have access
                      to {currentPlan.name} features until then.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="font-diatype">{error}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-6 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all font-diatype disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isSamePlan || isSubmitting}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/50 font-diatype disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {isUpgrade ? (
                      applyImmediately ? `Upgrade Now - $${proratedAmount.toFixed(2)}` : 'Schedule Upgrade'
                    ) : isDowngrade ? (
                      'Confirm Downgrade'
                    ) : (
                      'Confirm Change'
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Feature Item Component
interface FeatureItemProps {
  icon: any
  text: string
  highlighted?: boolean
}

function FeatureItem({ icon: Icon, text, highlighted }: FeatureItemProps) {
  return (
    <div className={`flex items-center gap-3 ${highlighted ? 'text-purple-300' : 'text-gray-300'}`}>
      <div className={`p-1 rounded-lg ${highlighted ? 'bg-purple-500/20' : 'bg-white/5'}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="font-diatype text-sm">{text}</span>
      {highlighted && <Check className="w-4 h-4 text-green-400 ml-auto" />}
    </div>
  )
}
