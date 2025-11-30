'use client'

import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  CreditCard,
  Lock,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Workshop } from './WorkshopCard'
import { cn } from '@/utils/cn'
import { typography, spacing } from '@/lib/design-system'

interface WorkshopRegistrationProps {
  workshop: Workshop
}

type FormStep = 'details' | 'payment' | 'confirmation'

interface FormData {
  // Personal Details
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  jobTitle: string

  // Payment
  cardNumber: string
  expiryDate: string
  cvv: string
  billingZip: string

  // Preferences
  hearAbout: string
  specialRequirements: string
  newsletter: boolean
}

export function WorkshopRegistration({ workshop }: WorkshopRegistrationProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<FormStep>('details')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingZip: '',
    hearAbout: '',
    specialRequirements: '',
    newsletter: true,
  })

  const pillarConfig = {
    adaptability: {
      gradient: 'from-blue-500 to-blue-600',
      badgeBg: 'bg-blue-500/10',
      badgeBorder: 'border-blue-500/20',
      badgeText: 'text-blue-300',
    },
    coaching: {
      gradient: 'from-amber-500 to-orange-600',
      badgeBg: 'bg-amber-500/10',
      badgeBorder: 'border-amber-500/20',
      badgeText: 'text-amber-300',
    },
    marketplace: {
      gradient: 'from-cyan-500 to-cyan-600',
      badgeBg: 'bg-cyan-500/10',
      badgeBorder: 'border-cyan-500/20',
      badgeText: 'text-cyan-300',
    },
  }

  const config = pillarConfig[workshop.pillar]
  const price = workshop.price.earlyBird || workshop.price.amount
  const isSoldOut = workshop.capacity.remaining === 0

  // Form validation
  const validateStep = (step: FormStep): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (step === 'details') {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format'
      }
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    }

    if (step === 'payment') {
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required'
      } else if (formData.cardNumber.replace(/\s/g, '').length !== 16) {
        newErrors.cardNumber = 'Invalid card number'
      }
      if (!formData.expiryDate.trim()) {
        newErrors.expiryDate = 'Expiry date is required'
      } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = 'Format: MM/YY'
      }
      if (!formData.cvv.trim()) {
        newErrors.cvv = 'CVV is required'
      } else if (formData.cvv.length !== 3) {
        newErrors.cvv = 'CVV must be 3 digits'
      }
      if (!formData.billingZip.trim()) newErrors.billingZip = 'Billing ZIP is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleNextStep = () => {
    if (currentStep === 'details' && validateStep('details')) {
      setCurrentStep('payment')
    }
  }

  const handlePrevStep = () => {
    if (currentStep === 'payment') {
      setCurrentStep('details')
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateStep('payment')) {
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    setCurrentStep('confirmation')

    // Redirect after 3 seconds
    setTimeout(() => {
      router.push('/workshops')
    }, 3000)
  }

  if (isSoldOut) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className={cn(typography.heading.h2, 'text-white mb-4')}>
            Workshop Sold Out
          </h1>
          <p className="text-gray-400 mb-8">
            This workshop has reached full capacity.
          </p>
          <Link
            href="/workshops"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse Other Workshops
          </Link>
        </div>
      </div>
    )
  }

  if (currentStep === 'confirmation') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-2xl mx-auto px-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className={cn(typography.heading.h2, 'text-white mb-4')}>
            Registration Successful!
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            You're all set for <span className="font-bold">{workshop.title}</span>
          </p>

          <div className="p-6 rounded-2xl bg-white/5 border border-gray-700 mb-8">
            <p className="text-gray-400 mb-4">
              A confirmation email has been sent to{' '}
              <span className="text-white font-semibold">{formData.email}</span>
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Workshop Date: {workshop.schedule.date}</p>
              <p>Time: {workshop.schedule.time}</p>
              <p>Duration: {workshop.schedule.duration}</p>
            </div>
          </div>

          <p className="text-gray-400">
            Redirecting to workshops catalog...
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <section className={cn('bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900', spacing.section.y)}>
        <div className={spacing.container.narrow}>
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link
              href={`/workshops/${workshop.id}`}
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              data-testid="back-to-workshop"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Workshop
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className={cn(typography.heading.h2, 'text-white mb-4')}>
              Complete Your Registration
            </h1>
            <p className="text-gray-400">
              You're one step away from joining <span className="text-white font-semibold">{workshop.title}</span>
            </p>
          </motion.div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <StepIndicator
              number={1}
              label="Details"
              active={currentStep === 'details'}
              completed={currentStep === 'payment'}
            />
            <div className="w-16 h-0.5 bg-gray-700"></div>
            <StepIndicator
              number={2}
              label="Payment"
              active={currentStep === 'payment'}
              completed={false}
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit}>
                {/* Personal Details Step */}
                {currentStep === 'details' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <h2 className={cn(typography.heading.h4, 'text-white mb-6')}>
                      Personal Information
                    </h2>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        label="First Name"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        error={errors.firstName}
                        required
                        data-testid="first-name"
                      />
                      <FormField
                        label="Last Name"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        error={errors.lastName}
                        required
                        data-testid="last-name"
                      />
                    </div>

                    <FormField
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      error={errors.email}
                      required
                      data-testid="email"
                    />

                    <FormField
                      label="Phone Number"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      error={errors.phone}
                      required
                      data-testid="phone"
                    />

                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        label="Company (Optional)"
                        type="text"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        data-testid="company"
                      />
                      <FormField
                        label="Job Title (Optional)"
                        type="text"
                        value={formData.jobTitle}
                        onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                        data-testid="job-title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        How did you hear about us? (Optional)
                      </label>
                      <select
                        value={formData.hearAbout}
                        onChange={(e) => handleInputChange('hearAbout', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        data-testid="hear-about"
                      >
                        <option value="">Select an option</option>
                        <option value="search">Search Engine</option>
                        <option value="social">Social Media</option>
                        <option value="referral">Referral</option>
                        <option value="newsletter">Newsletter</option>
                        <option value="event">Event</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Special Requirements (Optional)
                      </label>
                      <textarea
                        value={formData.specialRequirements}
                        onChange={(e) =>
                          handleInputChange('specialRequirements', e.target.value)
                        }
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Any accessibility needs, dietary restrictions, etc."
                        data-testid="special-requirements"
                      />
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.newsletter}
                        onChange={(e) => handleInputChange('newsletter', e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                        data-testid="newsletter"
                      />
                      <span className="text-sm text-gray-400">
                        Send me updates about future workshops and HumanGlue content
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      className={cn(
                        'w-full px-6 py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2',
                        `bg-gradient-to-r ${config.gradient} hover:shadow-xl`
                      )}
                      data-testid="next-step"
                    >
                      Continue to Payment
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </motion.div>
                )}

                {/* Payment Step */}
                {currentStep === 'payment' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <Lock className="w-5 h-5 text-green-400" />
                      <h2 className={cn(typography.heading.h4, 'text-white')}>
                        Secure Payment
                      </h2>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm">
                      <p>
                        This is a demo checkout. No actual payment will be processed.
                      </p>
                    </div>

                    <FormField
                      label="Card Number"
                      type="text"
                      value={formData.cardNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '')
                        const formatted = value.match(/.{1,4}/g)?.join(' ') || value
                        handleInputChange('cardNumber', formatted)
                      }}
                      error={errors.cardNumber}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                      icon={<CreditCard className="w-5 h-5 text-gray-400" />}
                      data-testid="card-number"
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <FormField
                          label="Expiry Date"
                          type="text"
                          value={formData.expiryDate}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '')
                            if (value.length >= 2) {
                              value = value.slice(0, 2) + '/' + value.slice(2, 4)
                            }
                            handleInputChange('expiryDate', value)
                          }}
                          error={errors.expiryDate}
                          placeholder="MM/YY"
                          maxLength={5}
                          required
                          data-testid="expiry-date"
                        />
                      </div>
                      <FormField
                        label="CVV"
                        type="text"
                        value={formData.cvv}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '')
                          handleInputChange('cvv', value)
                        }}
                        error={errors.cvv}
                        placeholder="123"
                        maxLength={3}
                        required
                        data-testid="cvv"
                      />
                    </div>

                    <FormField
                      label="Billing ZIP Code"
                      type="text"
                      value={formData.billingZip}
                      onChange={(e) => handleInputChange('billingZip', e.target.value)}
                      error={errors.billingZip}
                      placeholder="12345"
                      required
                      data-testid="billing-zip"
                    />

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="flex-1 px-6 py-4 rounded-xl font-bold bg-gray-800 text-white hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
                        data-testid="prev-step"
                      >
                        <ArrowLeft className="w-5 h-5" />
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={cn(
                          'flex-1 px-6 py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2',
                          isSubmitting
                            ? 'bg-gray-600 cursor-not-allowed'
                            : `bg-gradient-to-r ${config.gradient} hover:shadow-xl`
                        )}
                        data-testid="submit-payment"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            Complete Registration
                            <CheckCircle className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </form>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl bg-white/5 backdrop-blur-xl border border-gray-700 p-6">
                <h3 className={cn(typography.heading.h5, 'text-white mb-6')}>
                  Order Summary
                </h3>

                <div className="space-y-4 mb-6">
                  <div>
                    <div className="font-semibold text-white mb-2">{workshop.title}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span
                        className={cn(
                          'px-2 py-1 rounded-full text-xs',
                          config.badgeBg,
                          'border',
                          config.badgeBorder,
                          config.badgeText
                        )}
                      >
                        {workshop.pillar}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-700 text-gray-300">
                        {workshop.level}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      {workshop.schedule.date}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-4 h-4" />
                      {workshop.schedule.time} ({workshop.schedule.duration})
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Users className="w-4 h-4" />
                      {workshop.capacity.remaining} spots remaining
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Workshop Price</span>
                    <span className="text-white font-semibold">${price}</span>
                  </div>
                  {workshop.price.earlyBird && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Early Bird Discount</span>
                      <span className="text-green-400 font-semibold">
                        -${workshop.price.amount - workshop.price.earlyBird}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-white">Total</span>
                    <span className="text-2xl font-bold text-white">${price}</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>30-day money-back guarantee</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Lock className="w-4 h-4 text-green-400" />
                    <span>Secure encrypted payment</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Step Indicator Component
interface StepIndicatorProps {
  number: number
  label: string
  active: boolean
  completed: boolean
}

function StepIndicator({ number, label, active, completed }: StepIndicatorProps) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-all',
          completed
            ? 'bg-green-500 text-white'
            : active
            ? 'bg-blue-500 text-white'
            : 'bg-gray-700 text-gray-400'
        )}
      >
        {completed ? <CheckCircle className="w-5 h-5" /> : number}
      </div>
      <span
        className={cn(
          'text-sm font-medium',
          active ? 'text-white' : 'text-gray-400'
        )}
      >
        {label}
      </span>
    </div>
  )
}

// Form Field Component
interface FormFieldProps {
  label: string
  type: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  required?: boolean
  placeholder?: string
  maxLength?: number
  icon?: React.ReactNode
  'data-testid'?: string
}

function FormField({
  label,
  type,
  value,
  onChange,
  error,
  required,
  placeholder,
  maxLength,
  icon,
  'data-testid': testId,
}: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2">{icon}</div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className={cn(
            'w-full px-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all',
            icon && 'pl-12',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500/20'
          )}
          data-testid={testId}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  )
}
