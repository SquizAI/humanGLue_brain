'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/cn'
import { Button } from '@/components/atoms/Button'
import { colors, typography, spacing, effects, components } from '@/lib/design-system'
import { useRouter } from 'next/navigation'

// Icons (using Unicode for simplicity)
const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const InfoIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const MinusIcon = () => (
  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
)

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const MinusMiniIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
)

// Types
interface PricingTier {
  id: string
  name: string
  description: string
  monthlyPrice: number
  annualPrice: number
  popular: boolean
  features: string[]
  cta: string
  ctaAction: () => void
}

interface AddOn {
  id: string
  name: string
  description: string
  price: number
  unit: string
  icon: string
}

interface FAQItem {
  question: string
  answer: string
}

export default function PricingPage() {
  const router = useRouter()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual')
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, number>>({})
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  // Pricing Tiers
  const pricingTiers: PricingTier[] = [
    {
      id: 'individual',
      name: 'Individual',
      description: 'Perfect for personal AI transformation',
      monthlyPrice: 99,
      annualPrice: 999,
      popular: false,
      features: [
        '1 user account',
        'Full access to course library (100+ courses)',
        'AI maturity assessment (1 per quarter)',
        'Basic AI advisor chat',
        'Community forum access',
        'Certificate of completion',
        'Email support',
      ],
      cta: 'Get Started',
      ctaAction: () => router.push('/signup?plan=individual'),
    },
    {
      id: 'team',
      name: 'Team',
      description: 'Scale AI learning across your team',
      monthlyPrice: 499,
      annualPrice: 4999,
      popular: true,
      features: [
        'Up to 10 users',
        'Everything in Individual',
        'Advanced AI advisor with team insights',
        'Team analytics dashboard',
        '4 assessments per quarter',
        'Priority email & chat support',
        'Team progress tracking',
        'Custom learning paths',
      ],
      cta: 'Get Started',
      ctaAction: () => router.push('/signup?plan=team'),
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Custom solutions for large organizations',
      monthlyPrice: 0,
      annualPrice: 0,
      popular: false,
      features: [
        'Unlimited users',
        'Everything in Team',
        'Dedicated success manager',
        'White-label option',
        'Custom integrations (SSO, HRIS)',
        'Unlimited assessments',
        'Expert consultations (20 hours/month)',
        'Custom workshops',
        'API access',
        'SLA guarantees',
        'Phone support',
      ],
      cta: 'Contact Sales',
      ctaAction: () => router.push('/contact?plan=enterprise'),
    },
  ]

  // Add-ons
  const addOns: AddOn[] = [
    {
      id: 'consultations',
      name: 'Expert Consultations',
      description: '1-on-1 sessions with AI transformation experts',
      price: 300,
      unit: 'per hour',
      icon: '👤',
    },
    {
      id: 'workshops',
      name: 'Custom Workshops',
      description: 'Tailored workshops for your organization',
      price: 5000,
      unit: 'per workshop',
      icon: '🎓',
    },
    {
      id: 'assessments',
      name: 'Additional Assessments',
      description: 'Extra AI maturity assessments',
      price: 200,
      unit: 'per assessment',
      icon: '📊',
    },
    {
      id: 'priority-support',
      name: 'Priority Support Upgrade',
      description: '24/7 priority support with faster response times',
      price: 200,
      unit: 'per month',
      icon: '⚡',
    },
    {
      id: 'api-access',
      name: 'API Access',
      description: 'Full API access for custom integrations',
      price: 500,
      unit: 'per month',
      icon: '🔌',
    },
    {
      id: 'white-label',
      name: 'White Label',
      description: 'Customize the platform with your branding',
      price: 2000,
      unit: 'per month',
      icon: '🎨',
    },
  ]

  // FAQs
  const faqs: FAQItem[] = [
    {
      question: 'What happens after my free trial?',
      answer: 'Your free trial gives you full access to all features for 30 days. After the trial, you can choose a plan that fits your needs or continue using our free tier with limited features.',
    },
    {
      question: 'Can I switch plans later?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any charges or credits to your account.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and wire transfers for Enterprise plans.',
    },
    {
      question: 'Is there a setup fee?',
      answer: 'No setup fees for Individual and Team plans. Enterprise plans may include implementation costs depending on customization requirements.',
    },
    {
      question: 'What is your refund policy?',
      answer: 'We offer a 30-day money-back guarantee on all plans. If you\'re not satisfied, contact us within 30 days of purchase for a full refund.',
    },
    {
      question: 'How does billing work for the Team plan?',
      answer: 'The Team plan includes up to 10 users. Additional users can be added at $50/user/month. Billing is flexible - add or remove users as needed.',
    },
    {
      question: 'Do you offer educational or non-profit discounts?',
      answer: 'Yes! We offer 20% discounts for educational institutions and non-profit organizations. Contact our sales team to apply.',
    },
    {
      question: 'What happens to my data if I cancel?',
      answer: 'You can export all your data at any time. After cancellation, your data is retained for 90 days, giving you time to download everything before permanent deletion.',
    },
  ]

  // Calculate savings
  const calculateSavings = (tier: PricingTier) => {
    const monthlyCost = tier.monthlyPrice * 12
    const savings = monthlyCost - tier.annualPrice
    const percentage = Math.round((savings / monthlyCost) * 100)
    return { amount: savings, percentage }
  }

  // Calculate total for add-ons
  const calculateTotal = () => {
    return Object.entries(selectedAddOns).reduce((total, [id, quantity]) => {
      const addOn = addOns.find(a => a.id === id)
      return total + (addOn ? addOn.price * quantity : 0)
    }, 0)
  }

  const updateAddOnQuantity = (id: string, change: number) => {
    setSelectedAddOns(prev => {
      const current = prev[id] || 0
      const newValue = Math.max(0, current + change)
      if (newValue === 0) {
        const { [id]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [id]: newValue }
    })
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className={cn(spacing.section.y, 'relative overflow-hidden')}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-cyan-900/20 to-gray-950 pointer-events-none" />

        <div className={spacing.container.wide}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto relative z-10"
          >
            <h1 className={cn(typography.manifesto.h1, 'mb-6')}>
              <span className={typography.gradient.brand}>Transform Your Organization</span>
              <br />
              Choose Your AI Journey
            </h1>
            <p className={cn(typography.body.xl, 'text-gray-300 mb-12')}>
              Flexible pricing for teams of all sizes. Start your AI transformation today with our comprehensive platform.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={cn(
                'text-sm font-medium transition-colors',
                billingCycle === 'monthly' ? 'text-white' : 'text-gray-400'
              )}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annual' : 'monthly')}
                className={cn(
                  'relative w-16 h-8 rounded-full transition-colors',
                  billingCycle === 'annual' ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'bg-gray-700'
                )}
                aria-label="Toggle billing cycle"
              >
                <motion.div
                  className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
                  animate={{ x: billingCycle === 'annual' ? 32 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
              <span className={cn(
                'text-sm font-medium transition-colors',
                billingCycle === 'annual' ? 'text-white' : 'text-gray-400'
              )}>
                Annual
              </span>
              {billingCycle === 'annual' && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={components.badge.success}
                >
                  Save 16%
                </motion.span>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className={cn(spacing.section.ySmall, 'relative')}>
        <div className={spacing.container.wide}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {pricingTiers.map((tier, index) => {
              const price = billingCycle === 'monthly' ? tier.monthlyPrice : tier.annualPrice
              const savings = calculateSavings(tier)

              return (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative"
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-0 right-0 flex justify-center z-10">
                      <span className={cn(
                        components.badge.primary,
                        'bg-gradient-to-r from-blue-600 to-cyan-600 border-0 text-white'
                      )}>
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div
                    className={cn(
                      effects.backdrop.blur,
                      'rounded-2xl p-8 h-full border-2 transition-all duration-300',
                      tier.popular
                        ? 'border-cyan-500/50 shadow-2xl shadow-cyan-500/20 scale-105'
                        : 'border-gray-700/50 hover:border-gray-600/50'
                    )}
                  >
                    {/* Tier Header */}
                    <div className="mb-8">
                      <h3 className={cn(typography.heading.h3, 'mb-2')}>{tier.name}</h3>
                      <p className="text-gray-400 text-sm mb-6">{tier.description}</p>

                      <div className="flex items-baseline gap-2 mb-2">
                        {tier.id === 'enterprise' ? (
                          <span className={cn(typography.heading.h2, typography.gradient.cyan)}>
                            Custom
                          </span>
                        ) : (
                          <>
                            <span className={cn(typography.heading.h2)}>
                              ${price.toLocaleString()}
                            </span>
                            <span className="text-gray-400">
                              /{billingCycle === 'monthly' ? 'month' : 'year'}
                            </span>
                          </>
                        )}
                      </div>

                      {billingCycle === 'annual' && tier.id !== 'enterprise' && (
                        <p className="text-sm text-green-400">
                          Save ${savings.amount.toLocaleString()} ({savings.percentage}% off)
                        </p>
                      )}
                    </div>

                    {/* CTA Button */}
                    <Button
                      onClick={tier.ctaAction}
                      variant={tier.popular ? 'gradient' : 'secondary'}
                      className="w-full mb-8"
                      size="lg"
                    >
                      {tier.cta}
                    </Button>

                    {/* Features List */}
                    <div className="space-y-4">
                      <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                        What's included:
                      </p>
                      <ul className="space-y-3">
                        {tier.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              <CheckIcon />
                            </div>
                            <span className="text-gray-300 text-sm leading-relaxed">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className={cn(spacing.section.y, 'bg-black/50')}>
        <div className={spacing.container.wide}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className={cn(typography.heading.h2, 'mb-4')}>
              Compare Plans
            </h2>
            <p className={cn(typography.body.lg, 'text-gray-400')}>
              See all features side by side
            </p>
          </motion.div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4 px-4 font-semibold text-gray-400 uppercase text-sm">
                    Features
                  </th>
                  {pricingTiers.map(tier => (
                    <th key={tier.id} className="py-4 px-4 text-center">
                      <span className={cn(
                        'font-bold text-lg',
                        tier.popular && typography.gradient.cyan
                      )}>
                        {tier.name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {[
                  { name: 'Users', values: ['1', '10', 'Unlimited'] },
                  { name: 'Course Library Access', values: [true, true, true] },
                  { name: 'AI Maturity Assessments', values: ['1/quarter', '4/quarter', 'Unlimited'] },
                  { name: 'AI Advisor', values: ['Basic', 'Advanced', 'Advanced + Team Insights'] },
                  { name: 'Team Analytics', values: [false, true, true] },
                  { name: 'Custom Learning Paths', values: [false, true, true] },
                  { name: 'Dedicated Success Manager', values: [false, false, true] },
                  { name: 'White-label Option', values: [false, false, true] },
                  { name: 'Custom Integrations', values: [false, false, true] },
                  { name: 'Expert Consultations Included', values: [false, false, '20 hrs/month'] },
                  { name: 'API Access', values: [false, false, true] },
                  { name: 'SLA Guarantee', values: [false, false, true] },
                  { name: 'Support', values: ['Email', 'Email & Chat', 'Priority + Phone'] },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-800/30 transition-colors">
                    <td className="py-4 px-4 font-medium text-gray-300">
                      {row.name}
                    </td>
                    {row.values.map((value, j) => (
                      <td key={j} className="py-4 px-4 text-center">
                        {typeof value === 'boolean' ? (
                          value ? (
                            <div className="inline-flex">
                              <CheckIcon />
                            </div>
                          ) : (
                            <div className="inline-flex">
                              <MinusIcon />
                            </div>
                          )
                        ) : (
                          <span className="text-gray-300">{value}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Add-ons Section */}
      <section className={cn(spacing.section.y)}>
        <div className={spacing.container.wide}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className={cn(typography.heading.h2, 'mb-4')}>
              Enhance Your Plan
            </h2>
            <p className={cn(typography.body.lg, 'text-gray-400')}>
              Add extra capabilities to any plan
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {addOns.map((addOn, index) => {
              const quantity = selectedAddOns[addOn.id] || 0

              return (
                <motion.div
                  key={addOn.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    effects.backdrop.blur,
                    effects.border.base,
                    'rounded-xl p-6 hover:border-gray-600/50 transition-all duration-300'
                  )}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-3xl">{addOn.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{addOn.name}</h3>
                      <p className="text-sm text-gray-400 mb-3">{addOn.description}</p>
                      <p className="text-blue-400 font-semibold">
                        ${addOn.price.toLocaleString()} {addOn.unit}
                      </p>
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateAddOnQuantity(addOn.id, -1)}
                      disabled={quantity === 0}
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                        quantity === 0
                          ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                          : 'bg-gray-700 text-white hover:bg-gray-600'
                      )}
                      aria-label="Decrease quantity"
                    >
                      <MinusMiniIcon />
                    </button>
                    <span className="w-12 text-center font-semibold">{quantity}</span>
                    <button
                      onClick={() => updateAddOnQuantity(addOn.id, 1)}
                      className="w-8 h-8 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center"
                      aria-label="Increase quantity"
                    >
                      <PlusIcon />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Add-ons Total */}
          <AnimatePresence>
            {Object.keys(selectedAddOns).length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={cn(
                  effects.backdrop.blur,
                  'border-2 border-cyan-500/30 rounded-xl p-6 max-w-md mx-auto'
                )}
              >
                <h3 className="font-semibold text-lg mb-4">Your Add-ons</h3>
                <div className="space-y-2 mb-4">
                  {Object.entries(selectedAddOns).map(([id, quantity]) => {
                    const addOn = addOns.find(a => a.id === id)
                    if (!addOn) return null
                    return (
                      <div key={id} className="flex justify-between text-sm">
                        <span className="text-gray-400">
                          {addOn.name} × {quantity}
                        </span>
                        <span className="text-white font-semibold">
                          ${(addOn.price * quantity).toLocaleString()}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <div className="border-t border-gray-700 pt-4 flex justify-between items-center">
                  <span className="font-semibold">Total Add-ons</span>
                  <span className={cn(typography.heading.h4, typography.gradient.cyan)}>
                    ${calculateTotal().toLocaleString()}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={cn(spacing.section.y, 'bg-black/50')}>
        <div className={spacing.container.narrow}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className={cn(typography.heading.h2, 'mb-4')}>
              Frequently Asked Questions
            </h2>
            <p className={cn(typography.body.lg, 'text-gray-400')}>
              Everything you need to know about our pricing
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  effects.backdrop.blur,
                  effects.border.base,
                  'rounded-xl overflow-hidden'
                )}
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                  aria-expanded={expandedFAQ === index}
                >
                  <span className="font-semibold pr-8">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: expandedFAQ === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </motion.div>
                </button>
                <AnimatePresence>
                  {expandedFAQ === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 text-gray-400 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className={cn(spacing.section.ySmall)}>
        <div className={spacing.container.wide}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: '🔒',
                title: 'Secure Payments',
                description: 'Bank-level encryption for all transactions',
              },
              {
                icon: '↩️',
                title: '30-Day Money Back',
                description: 'Full refund if you\'re not satisfied',
              },
              {
                icon: '❌',
                title: 'Cancel Anytime',
                description: 'No long-term contracts or commitments',
              },
            ].map((badge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl mb-3">{badge.icon}</div>
                <h3 className="font-semibold mb-2">{badge.title}</h3>
                <p className="text-sm text-gray-400">{badge.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className={cn(spacing.section.y, 'relative overflow-hidden')}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-cyan-600/20 to-transparent pointer-events-none" />

        <div className={spacing.container.wide}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto relative z-10"
          >
            <h2 className={cn(typography.manifesto.h2, 'mb-6')}>
              Start Your AI Transformation Today
            </h2>
            <p className={cn(typography.body.xl, 'text-gray-300 mb-8')}>
              Join thousands of organizations already transforming with HumanGlue
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push('/signup')}
                variant="gradient"
                size="lg"
                className="px-12"
              >
                Get Started Free
              </Button>
              <Button
                onClick={() => router.push('/contact')}
                variant="secondary"
                size="lg"
                className="px-12"
              >
                Talk to Sales
              </Button>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              No credit card required • Start your 30-day free trial
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sticky Mobile CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 z-50">
        <Button
          onClick={() => router.push('/signup')}
          variant="gradient"
          className="w-full"
          size="lg"
        >
          Get Started Free
        </Button>
      </div>
    </div>
  )
}
