'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Building2,
  Mail,
  Lock,
  User,
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  Users,
  Sparkles,
  Shield,
  Zap,
  Crown,
  CreditCard,
  Briefcase,
} from 'lucide-react'

// Subscription plan types
interface Plan {
  id: string
  name: string
  slug: string
  price: number
  yearlyPrice: number
  maxUsers: number
  maxTeams: number
  features: string[]
  isPopular?: boolean
  isEnterprise?: boolean
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    slug: 'free',
    price: 0,
    yearlyPrice: 0,
    maxUsers: 5,
    maxTeams: 1,
    features: [
      'Basic AI Assessment',
      'Individual Results Dashboard',
      'Email Support',
      '10 Assessments/month',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    slug: 'starter',
    price: 49,
    yearlyPrice: 470,
    maxUsers: 25,
    maxTeams: 3,
    features: [
      'Everything in Free',
      'Team Analytics',
      'Priority Support',
      'Export Reports (PDF)',
      '100 Assessments/month',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    slug: 'professional',
    price: 149,
    yearlyPrice: 1430,
    maxUsers: 100,
    maxTeams: 10,
    features: [
      'Everything in Starter',
      'Custom Branding',
      'API Access',
      'Dedicated Success Manager',
      'Advanced Analytics',
      'Unlimited Assessments',
    ],
    isPopular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    slug: 'enterprise',
    price: 0,
    yearlyPrice: 0,
    maxUsers: -1,
    maxTeams: -1,
    features: [
      'Everything in Professional',
      'Unlimited Users & Teams',
      'SSO/SAML Integration',
      'Custom Integrations',
      'On-Premise Option',
      'SLA Guarantee',
      'Dedicated Account Team',
    ],
    isEnterprise: true,
  },
]

const industries = [
  'Technology',
  'Healthcare',
  'Finance & Banking',
  'Manufacturing',
  'Retail',
  'Education',
  'Government',
  'Professional Services',
  'Media & Entertainment',
  'Real Estate',
  'Transportation & Logistics',
  'Energy & Utilities',
  'Other',
]

const companySizes = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees',
]

type Step = 'plan' | 'organization' | 'admin' | 'payment'

export default function OrganizationSignupPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('plan')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Plan selection
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  // Organization details
  const [orgName, setOrgName] = useState('')
  const [industry, setIndustry] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [website, setWebsite] = useState('')

  // Admin account
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [jobTitle, setJobTitle] = useState('')

  // Password validation
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)
  const passwordsMatch = password === confirmPassword && password.length > 0
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial

  const steps: { key: Step; label: string; icon: React.ElementType }[] = [
    { key: 'plan', label: 'Select Plan', icon: CreditCard },
    { key: 'organization', label: 'Organization', icon: Building2 },
    { key: 'admin', label: 'Admin Account', icon: User },
    { key: 'payment', label: 'Confirmation', icon: Check },
  ]

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep)

  const canProceed = () => {
    switch (currentStep) {
      case 'plan':
        return selectedPlan !== null
      case 'organization':
        return orgName.trim().length >= 2 && industry !== ''
      case 'admin':
        return (
          fullName.trim().length >= 2 &&
          email.includes('@') &&
          isPasswordValid &&
          passwordsMatch
        )
      default:
        return true
    }
  }

  const handleNext = () => {
    if (currentStep === 'plan') setCurrentStep('organization')
    else if (currentStep === 'organization') setCurrentStep('admin')
    else if (currentStep === 'admin') setCurrentStep('payment')
  }

  const handleBack = () => {
    if (currentStep === 'organization') setCurrentStep('plan')
    else if (currentStep === 'admin') setCurrentStep('organization')
    else if (currentStep === 'payment') setCurrentStep('admin')
  }

  const handleSubmit = async () => {
    if (!selectedPlan) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/organizations/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Organization
          organizationName: orgName,
          industry,
          companySize,
          website: website || null,

          // Admin user
          adminFullName: fullName,
          adminEmail: email,
          adminPassword: password,
          adminJobTitle: jobTitle || null,

          // Plan
          planSlug: selectedPlan.slug,
          billingCycle,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error?.message || 'Registration failed')
      }

      // Redirect based on plan
      if (selectedPlan.slug === 'free') {
        // Free plan - go directly to dashboard
        router.push('/dashboard?welcome=true')
      } else if (selectedPlan.isEnterprise) {
        // Enterprise - go to contact sales confirmation
        router.push('/signup/organization/enterprise-requested')
      } else {
        // Paid plan - redirect to Stripe checkout
        if (data.data?.checkoutUrl) {
          window.location.href = data.data.checkoutUrl
        } else {
          router.push('/dashboard?welcome=true')
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.1),transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(59,130,246,0.08),transparent_50%)]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/hmn_logo.png"
              alt="HumanGlue"
              width={180}
              height={50}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <Link
            href="/signup"
            className="text-sm text-gray-400 hover:text-white transition-colors font-diatype"
          >
            Individual signup instead?
          </Link>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = step.key === currentStep
            const isCompleted = index < currentStepIndex

            return (
              <div key={step.key} className="flex items-center">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                      : isCompleted
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                        : 'bg-white/5 text-gray-500 border border-white/10'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium font-diatype hidden sm:inline">
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-2 ${
                      index < currentStepIndex ? 'bg-green-500/50' : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-diatype"
          >
            {error}
          </motion.div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Plan Selection */}
          {currentStep === 'plan' && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-5xl mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 font-gendy">
                  Choose Your Plan
                </h1>
                <p className="text-gray-400 font-diatype">
                  Select the plan that best fits your organization's needs
                </p>
              </div>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all font-diatype ${
                    billingCycle === 'monthly'
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all font-diatype flex items-center gap-2 ${
                    billingCycle === 'yearly'
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Yearly
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                    Save 20%
                  </span>
                </button>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {plans.map((plan) => {
                  const isSelected = selectedPlan?.id === plan.id
                  const price =
                    billingCycle === 'yearly' ? plan.yearlyPrice / 12 : plan.price

                  return (
                    <motion.button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-6 rounded-2xl text-left transition-all ${
                        isSelected
                          ? 'bg-cyan-500/10 border-2 border-cyan-500/50'
                          : 'bg-white/5 border border-white/10 hover:border-white/20'
                      }`}
                    >
                      {plan.isPopular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-xs font-semibold text-white font-diatype">
                          Most Popular
                        </div>
                      )}

                      <div className="flex items-center gap-2 mb-4">
                        {plan.isEnterprise ? (
                          <Crown className="w-5 h-5 text-yellow-400" />
                        ) : (
                          <Sparkles className="w-5 h-5 text-cyan-400" />
                        )}
                        <h3 className="text-lg font-semibold text-white font-gendy">
                          {plan.name}
                        </h3>
                      </div>

                      <div className="mb-4">
                        {plan.isEnterprise ? (
                          <div className="text-2xl font-bold text-white font-gendy">
                            Custom
                          </div>
                        ) : (
                          <>
                            <span className="text-3xl font-bold text-white font-gendy">
                              ${Math.round(price)}
                            </span>
                            <span className="text-gray-400 font-diatype">/mo</span>
                            {billingCycle === 'yearly' && plan.price > 0 && (
                              <div className="text-xs text-gray-500 font-diatype">
                                ${plan.yearlyPrice} billed annually
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div className="text-sm text-gray-400 mb-4 font-diatype">
                        {plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers} users,{' '}
                        {plan.maxTeams === -1 ? 'Unlimited' : plan.maxTeams} teams
                      </div>

                      <ul className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm text-gray-300 font-diatype"
                          >
                            <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {isSelected && (
                        <div className="absolute top-4 right-4">
                          <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Organization Details */}
          {currentStep === 'organization' && (
            <motion.div
              key="organization"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-xl mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 font-gendy">
                  Organization Details
                </h1>
                <p className="text-gray-400 font-diatype">
                  Tell us about your organization
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 space-y-6">
                {/* Organization Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                    Organization Name *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="Acme Corporation"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype"
                    />
                  </div>
                </div>

                {/* Industry */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                    Industry *
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype appearance-none"
                    >
                      <option value="" className="bg-gray-900">
                        Select industry
                      </option>
                      {industries.map((ind) => (
                        <option key={ind} value={ind} className="bg-gray-900">
                          {ind}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Company Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                    Company Size
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <select
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype appearance-none"
                    >
                      <option value="" className="bg-gray-900">
                        Select company size
                      </option>
                      {companySizes.map((size) => (
                        <option key={size} value={size} className="bg-gray-900">
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                    Website (optional)
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Admin Account */}
          {currentStep === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-xl mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 font-gendy">
                  Create Admin Account
                </h1>
                <p className="text-gray-400 font-diatype">
                  You'll be the organization administrator
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype"
                    />
                  </div>
                </div>

                {/* Job Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                    Job Title
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="CTO, VP of Engineering, etc."
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype"
                    />
                  </div>

                  {password && (
                    <div className="mt-3 space-y-1.5">
                      <PasswordRequirement met={hasMinLength} text="At least 8 characters" />
                      <PasswordRequirement met={hasUppercase} text="One uppercase letter" />
                      <PasswordRequirement met={hasLowercase} text="One lowercase letter" />
                      <PasswordRequirement met={hasNumber} text="One number" />
                      <PasswordRequirement met={hasSpecial} text="One special character" />
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-diatype"
                    />
                  </div>
                  {confirmPassword && (
                    <div className="mt-2">
                      <PasswordRequirement met={passwordsMatch} text="Passwords match" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Payment/Confirmation */}
          {currentStep === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-xl mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 font-gendy">
                  Review & Confirm
                </h1>
                <p className="text-gray-400 font-diatype">
                  {selectedPlan?.slug === 'free'
                    ? 'Start your free plan'
                    : selectedPlan?.isEnterprise
                      ? 'Submit enterprise inquiry'
                      : 'Review your order'}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 space-y-6">
                {/* Order Summary */}
                <div className="pb-6 border-b border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 font-gendy">
                    Order Summary
                  </h3>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-white font-medium font-diatype">
                        {selectedPlan?.name} Plan
                      </div>
                      <div className="text-sm text-gray-400 font-diatype">
                        {billingCycle === 'yearly' ? 'Billed annually' : 'Billed monthly'}
                      </div>
                    </div>
                    <div className="text-right">
                      {selectedPlan?.isEnterprise ? (
                        <div className="text-white font-semibold font-diatype">
                          Custom Pricing
                        </div>
                      ) : selectedPlan?.price === 0 ? (
                        <div className="text-white font-semibold font-diatype">Free</div>
                      ) : (
                        <div className="text-white font-semibold font-diatype">
                          $
                          {billingCycle === 'yearly'
                            ? selectedPlan?.yearlyPrice
                            : selectedPlan?.price}
                          /{billingCycle === 'yearly' ? 'year' : 'month'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Organization Details */}
                <div className="pb-6 border-b border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 font-gendy">
                    Organization
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-diatype">Name</span>
                      <span className="text-white font-diatype">{orgName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-diatype">Industry</span>
                      <span className="text-white font-diatype">{industry}</span>
                    </div>
                    {companySize && (
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-diatype">Size</span>
                        <span className="text-white font-diatype">{companySize}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin Account */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 font-gendy">
                    Admin Account
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-diatype">Name</span>
                      <span className="text-white font-diatype">{fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-diatype">Email</span>
                      <span className="text-white font-diatype">{email}</span>
                    </div>
                    {jobTitle && (
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-diatype">Title</span>
                        <span className="text-white font-diatype">{jobTitle}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Security Note */}
                <div className="flex items-start gap-3 p-4 bg-cyan-500/10 rounded-xl">
                  <Shield className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-300 font-diatype">
                    {selectedPlan?.slug === 'free'
                      ? 'Your free account will be active immediately after email verification.'
                      : selectedPlan?.isEnterprise
                        ? 'Our team will contact you within 24 hours to discuss your needs.'
                        : 'Your payment is secured with Stripe. You can cancel anytime.'}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="max-w-xl mx-auto mt-8 flex items-center justify-between">
          {currentStepIndex > 0 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-3 text-gray-400 hover:text-white transition-colors font-diatype"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          ) : (
            <div />
          )}

          {currentStep === 'payment' ? (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-diatype"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : selectedPlan?.slug === 'free' ? (
                <>
                  Create Free Account
                  <Zap className="w-5 h-5" />
                </>
              ) : selectedPlan?.isEnterprise ? (
                <>
                  Request Demo
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  Continue to Payment
                  <CreditCard className="w-5 h-5" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-diatype"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Login Link */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm font-diatype">
            Already have an account?{' '}
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {met ? (
        <Check className="w-3.5 h-3.5 text-green-400" />
      ) : (
        <X className="w-3.5 h-3.5 text-gray-500" />
      )}
      <span className={met ? 'text-green-400 font-diatype' : 'text-gray-500 font-diatype'}>
        {text}
      </span>
    </div>
  )
}
