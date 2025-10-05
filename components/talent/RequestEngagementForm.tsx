'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Building2,
  Users,
  Target,
  Calendar,
  DollarSign,
  Briefcase,
  MessageSquare,
  Sparkles,
  CheckCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TalentProfile } from './TalentCard'
import { cn } from '@/utils/cn'
import { typography, spacing } from '@/lib/design-system'

interface RequestEngagementFormProps {
  talent: TalentProfile
}

interface FormData {
  // Step 1: Project Details
  projectName: string
  projectDescription: string
  timeline: string
  budgetRange: string
  urgency: 'immediate' | 'within-month' | 'flexible'

  // Step 2: Company Info
  companyName: string
  companySize: string
  industry: string
  contactName: string
  contactEmail: string
  contactPhone: string

  // Step 3: Transformation Goals
  primaryGoal: string
  behaviorChanges: string[]
  successMetrics: string
  currentChallenges: string

  // Step 4: Engagement Model
  engagementModel: 'embedded-team' | 'one-on-one' | 'workshop-series' | 'hybrid'
  preferredStartDate: string
  additionalNotes: string
}

const BUDGET_RANGES = [
  '$10,000 - $25,000',
  '$25,000 - $50,000',
  '$50,000 - $100,000',
  '$100,000 - $250,000',
  '$250,000+',
]

const COMPANY_SIZES = [
  '1-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1,000 employees',
  '1,000-5,000 employees',
  '5,000+ employees',
]

const BEHAVIOR_CHANGE_OPTIONS = [
  'Reduce AI fear and resistance',
  'Increase experimental mindset',
  'Improve cross-functional collaboration',
  'Build data-driven decision making',
  'Enhance learning agility',
  'Strengthen change resilience',
  'Develop AI literacy',
  'Foster innovation culture',
]

export function RequestEngagementForm({ talent }: RequestEngagementFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    projectDescription: '',
    timeline: '',
    budgetRange: '',
    urgency: 'flexible',
    companyName: '',
    companySize: '',
    industry: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    primaryGoal: '',
    behaviorChanges: [],
    successMetrics: '',
    currentChallenges: '',
    engagementModel: 'hybrid',
    preferredStartDate: '',
    additionalNotes: '',
  })

  const totalSteps = 4

  // Update form data
  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Toggle behavior change
  const toggleBehaviorChange = (behavior: string) => {
    setFormData((prev) => ({
      ...prev,
      behaviorChanges: prev.behaviorChanges.includes(behavior)
        ? prev.behaviorChanges.filter((b) => b !== behavior)
        : [...prev.behaviorChanges, behavior],
    }))
  }

  // Validate current step
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.projectName &&
          formData.projectDescription &&
          formData.timeline &&
          formData.budgetRange
        )
      case 2:
        return (
          formData.companyName &&
          formData.companySize &&
          formData.industry &&
          formData.contactName &&
          formData.contactEmail
        )
      case 3:
        return (
          formData.primaryGoal &&
          formData.behaviorChanges.length > 0 &&
          formData.successMetrics
        )
      case 4:
        return formData.engagementModel && formData.preferredStartDate
      default:
        return false
    }
  }

  // Navigation
  const nextStep = () => {
    if (currentStep < totalSteps && isStepValid()) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Submit form
  const handleSubmit = async () => {
    if (!isStepValid()) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    setIsSuccess(true)
  }

  // Calculate estimated cost
  const estimatedCost = () => {
    const weeks = parseInt(formData.timeline) || 0
    const hoursPerWeek = formData.engagementModel === 'embedded-team' ? 40 : 20
    return weeks * hoursPerWeek * talent.hourlyRate
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <div className="p-12 rounded-3xl bg-gradient-to-br from-green-500/10 to-green-600/5 border-2 border-green-500/20 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>

            <h1 className={cn(typography.heading.h2, 'text-white mb-4')}>
              Request Submitted!
            </h1>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Your engagement request has been sent to{' '}
              <span className="font-semibold text-purple-300">{talent.name}</span>. You'll
              receive a response within 24 hours to discuss next steps.
            </p>

            <div className="space-y-4 mb-8">
              <div className="p-4 rounded-xl bg-white/5 border border-gray-700 text-left">
                <div className="text-sm text-gray-400 mb-1">Project</div>
                <div className="font-semibold text-white">{formData.projectName}</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-gray-700 text-left">
                <div className="text-sm text-gray-400 mb-1">Contact Email</div>
                <div className="font-semibold text-white">{formData.contactEmail}</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-gray-700 text-left">
                <div className="text-sm text-gray-400 mb-1">Estimated Investment</div>
                <div className="text-2xl font-bold text-purple-400">
                  ${estimatedCost().toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/talent">
                <button className="px-8 py-4 rounded-full font-semibold bg-gray-800 text-white hover:bg-gray-700 transition-all">
                  Browse More Experts
                </button>
              </Link>
              <Link href={`/talent/${talent.id}`}>
                <button className="px-8 py-4 rounded-full font-semibold bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all">
                  View Expert Profile
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <section className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 py-12 border-b border-gray-800">
        <div className={spacing.container.wide}>
          <Link
            href={`/talent/${talent.id}`}
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to profile
          </Link>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className={cn(typography.heading.h2, 'text-white mb-3')}>
                Request Engagement
              </h1>
              <p className="text-lg text-gray-300">
                Working with{' '}
                <span className="font-semibold text-purple-300">{talent.name}</span> -{' '}
                {talent.title}
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all',
                    step < currentStep
                      ? 'bg-green-500 text-white'
                      : step === currentStep
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-800 text-gray-500'
                  )}
                >
                  {step < currentStep ? <Check className="w-6 h-6" /> : step}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className={spacing.section.y}>
        <div className={spacing.container.wide}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Form Column */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {/* Step 1: Project Details */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h2 className={cn(typography.heading.h3, 'text-white')}>
                          Project Details
                        </h2>
                        <p className="text-gray-400">
                          Tell us about your transformation project
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Project Name *
                      </label>
                      <input
                        type="text"
                        value={formData.projectName}
                        onChange={(e) => updateFormData('projectName', e.target.value)}
                        placeholder="e.g., AI Transformation Initiative Q2 2025"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                        data-testid="project-name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Project Description *
                      </label>
                      <textarea
                        value={formData.projectDescription}
                        onChange={(e) =>
                          updateFormData('projectDescription', e.target.value)
                        }
                        placeholder="Describe what you're trying to achieve, key challenges, and desired outcomes..."
                        rows={5}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none"
                        data-testid="project-description"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Timeline (weeks) *
                        </label>
                        <input
                          type="number"
                          value={formData.timeline}
                          onChange={(e) => updateFormData('timeline', e.target.value)}
                          placeholder="12"
                          min="1"
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                          data-testid="timeline"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Budget Range *
                        </label>
                        <select
                          value={formData.budgetRange}
                          onChange={(e) => updateFormData('budgetRange', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                          data-testid="budget-range"
                        >
                          <option value="">Select budget range</option>
                          {BUDGET_RANGES.map((range) => (
                            <option key={range} value={range}>
                              {range}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Urgency
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'immediate', label: 'Immediate' },
                          { value: 'within-month', label: 'Within Month' },
                          { value: 'flexible', label: 'Flexible' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() =>
                              updateFormData(
                                'urgency',
                                option.value as FormData['urgency']
                              )
                            }
                            className={cn(
                              'px-4 py-3 rounded-xl font-medium transition-all',
                              formData.urgency === option.value
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            )}
                            data-testid={`urgency-${option.value}`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Company Info */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h2 className={cn(typography.heading.h3, 'text-white')}>
                          Company Information
                        </h2>
                        <p className="text-gray-400">
                          Tell us about your organization
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Company Name *
                        </label>
                        <input
                          type="text"
                          value={formData.companyName}
                          onChange={(e) => updateFormData('companyName', e.target.value)}
                          placeholder="Your company name"
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                          data-testid="company-name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Company Size *
                        </label>
                        <select
                          value={formData.companySize}
                          onChange={(e) => updateFormData('companySize', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                          data-testid="company-size"
                        >
                          <option value="">Select company size</option>
                          {COMPANY_SIZES.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Industry *
                      </label>
                      <input
                        type="text"
                        value={formData.industry}
                        onChange={(e) => updateFormData('industry', e.target.value)}
                        placeholder="e.g., Healthcare, Finance, Technology"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                        data-testid="industry"
                      />
                    </div>

                    <div className="border-t border-gray-700 pt-6 mt-6">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Contact Information
                      </h3>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={formData.contactName}
                            onChange={(e) =>
                              updateFormData('contactName', e.target.value)
                            }
                            placeholder="John Doe"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                            data-testid="contact-name"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Email Address *
                            </label>
                            <input
                              type="email"
                              value={formData.contactEmail}
                              onChange={(e) =>
                                updateFormData('contactEmail', e.target.value)
                              }
                              placeholder="john@company.com"
                              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                              data-testid="contact-email"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              value={formData.contactPhone}
                              onChange={(e) =>
                                updateFormData('contactPhone', e.target.value)
                              }
                              placeholder="+1 (555) 000-0000"
                              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                              data-testid="contact-phone"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Transformation Goals */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                        <Target className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h2 className={cn(typography.heading.h3, 'text-white')}>
                          Transformation Goals
                        </h2>
                        <p className="text-gray-400">
                          Define what success looks like
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Primary Goal *
                      </label>
                      <textarea
                        value={formData.primaryGoal}
                        onChange={(e) => updateFormData('primaryGoal', e.target.value)}
                        placeholder="What's the main transformation outcome you're seeking?"
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none"
                        data-testid="primary-goal"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Desired Behavior Changes * (Select all that apply)
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {BEHAVIOR_CHANGE_OPTIONS.map((behavior) => (
                          <button
                            key={behavior}
                            onClick={() => toggleBehaviorChange(behavior)}
                            className={cn(
                              'px-4 py-3 rounded-xl font-medium text-left transition-all',
                              formData.behaviorChanges.includes(behavior)
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            )}
                            data-testid={`behavior-${behavior}`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  'w-5 h-5 rounded border-2 flex items-center justify-center',
                                  formData.behaviorChanges.includes(behavior)
                                    ? 'bg-white border-white'
                                    : 'border-gray-600'
                                )}
                              >
                                {formData.behaviorChanges.includes(behavior) && (
                                  <Check className="w-4 h-4 text-purple-500" />
                                )}
                              </div>
                              <span className="text-sm">{behavior}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Success Metrics *
                      </label>
                      <textarea
                        value={formData.successMetrics}
                        onChange={(e) => updateFormData('successMetrics', e.target.value)}
                        placeholder="How will you measure success? (e.g., 50% reduction in AI resistance, 80% team adoption rate)"
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none"
                        data-testid="success-metrics"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Current Challenges
                      </label>
                      <textarea
                        value={formData.currentChallenges}
                        onChange={(e) =>
                          updateFormData('currentChallenges', e.target.value)
                        }
                        placeholder="What obstacles are you facing right now?"
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none"
                        data-testid="current-challenges"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Engagement Model */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h2 className={cn(typography.heading.h3, 'text-white')}>
                          Engagement Model
                        </h2>
                        <p className="text-gray-400">
                          Choose how you'd like to work together
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Preferred Engagement Model *
                      </label>
                      <div className="space-y-3">
                        {[
                          {
                            value: 'embedded-team',
                            label: 'Embedded Team Member',
                            description:
                              'Full-time integration with your team for hands-on transformation',
                          },
                          {
                            value: 'one-on-one',
                            label: '1:1 Executive Coaching',
                            description:
                              'Individual sessions with leadership for strategic guidance',
                          },
                          {
                            value: 'workshop-series',
                            label: 'Workshop Series',
                            description:
                              'Structured training sessions for teams and departments',
                          },
                          {
                            value: 'hybrid',
                            label: 'Hybrid Approach',
                            description:
                              'Combination of coaching, workshops, and embedded support',
                          },
                        ].map((model) => (
                          <button
                            key={model.value}
                            onClick={() =>
                              updateFormData(
                                'engagementModel',
                                model.value as FormData['engagementModel']
                              )
                            }
                            className={cn(
                              'w-full p-4 rounded-xl text-left transition-all',
                              formData.engagementModel === model.value
                                ? 'bg-purple-500/20 border-2 border-purple-500'
                                : 'bg-gray-800 border border-gray-700 hover:bg-gray-700'
                            )}
                            data-testid={`engagement-${model.value}`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={cn(
                                  'w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5',
                                  formData.engagementModel === model.value
                                    ? 'bg-purple-500 border-purple-500'
                                    : 'border-gray-600'
                                )}
                              >
                                {formData.engagementModel === model.value && (
                                  <div className="w-3 h-3 rounded-full bg-white"></div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-white mb-1">
                                  {model.label}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {model.description}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Preferred Start Date *
                      </label>
                      <input
                        type="date"
                        value={formData.preferredStartDate}
                        onChange={(e) =>
                          updateFormData('preferredStartDate', e.target.value)
                        }
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                        data-testid="start-date"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Additional Notes
                      </label>
                      <textarea
                        value={formData.additionalNotes}
                        onChange={(e) =>
                          updateFormData('additionalNotes', e.target.value)
                        }
                        placeholder="Any additional information you'd like to share?"
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none"
                        data-testid="additional-notes"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-4 mt-8">
                {currentStep > 1 && (
                  <button
                    onClick={prevStep}
                    className="px-6 py-3 rounded-full font-semibold bg-gray-800 text-white hover:bg-gray-700 transition-all flex items-center gap-2"
                    data-testid="prev-button"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Previous
                  </button>
                )}

                {currentStep < totalSteps ? (
                  <button
                    onClick={nextStep}
                    disabled={!isStepValid()}
                    className={cn(
                      'px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 ml-auto',
                      isStepValid()
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg hover:shadow-purple-500/50'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    )}
                    data-testid="next-button"
                  >
                    Next
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!isStepValid() || isSubmitting}
                    className={cn(
                      'px-8 py-4 rounded-full font-semibold transition-all flex items-center gap-2 ml-auto',
                      isStepValid() && !isSubmitting
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg hover:shadow-purple-500/50'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    )}
                    data-testid="submit-button"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Request
                        <CheckCircle className="w-5 h-5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 p-6 rounded-3xl bg-white/5 border border-gray-700 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold text-white">Request Summary</h3>
                </div>

                {/* Expert Info */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {talent.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">
                        {talent.name}
                      </div>
                      <div className="text-xs text-gray-400">{talent.title}</div>
                    </div>
                  </div>
                  <div className="text-xs text-purple-300 mt-2">
                    {talent.adaptabilityImpact.transformationSuccessRate}% Success Rate
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <div className="flex items-center gap-2 text-gray-400 mb-2 text-sm">
                    <DollarSign className="w-4 h-4" />
                    <span>Hourly Rate</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    ${talent.hourlyRate}
                    <span className="text-sm text-gray-400 font-normal">/hr</span>
                  </div>
                </div>

                {/* Estimated Cost */}
                {formData.timeline && (
                  <div className="pt-6 border-t border-gray-700">
                    <div className="text-sm text-gray-400 mb-2">Estimated Investment</div>
                    <div className="text-3xl font-bold text-purple-400">
                      ${estimatedCost().toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Based on {formData.timeline} weeks
                    </div>
                  </div>
                )}

                {/* Completed Steps */}
                <div className="pt-6 border-t border-gray-700 space-y-2">
                  <div className="text-sm font-medium text-gray-400 mb-3">Progress</div>
                  {[
                    { step: 1, label: 'Project Details' },
                    { step: 2, label: 'Company Info' },
                    { step: 3, label: 'Transformation Goals' },
                    { step: 4, label: 'Engagement Model' },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className={cn(
                        'flex items-center gap-2 text-sm',
                        item.step < currentStep
                          ? 'text-green-400'
                          : item.step === currentStep
                          ? 'text-purple-400'
                          : 'text-gray-600'
                      )}
                    >
                      {item.step < currentStep ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-current"></div>
                      )}
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
