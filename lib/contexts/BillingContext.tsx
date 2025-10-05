'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

export type SubscriptionTier = 'free' | 'starter' | 'professional' | 'enterprise'
export type BillingCycle = 'monthly' | 'annual'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused'

export interface PaymentMethod {
  id: string
  type: 'card' | 'paypal' | 'bank'
  brand?: 'visa' | 'mastercard' | 'amex' | 'discover'
  last4: string
  expiry?: string
  holderName?: string
  isDefault: boolean
}

export interface Invoice {
  id: string
  date: string
  description: string
  amount: number
  status: 'paid' | 'pending' | 'failed'
  invoiceUrl?: string
  dueDate?: string
}

export interface UsageMetrics {
  assessments: { used: number; limit: number }
  users: { used: number; limit: number }
  storage: { used: number; limit: number } // GB
  workshops: { used: number; limit: number }
  aiInteractions: { used: number; limit: number }
}

export interface PlanFeatures {
  name: string
  price: number
  assessmentsLimit: number
  usersLimit: number
  storageLimit: number
  workshopsLimit: number
  aiInteractionsLimit: number
  features: string[]
  popularBadge?: boolean
}

export interface BillingContextType {
  // Subscription
  currentTier: SubscriptionTier
  billingCycle: BillingCycle
  subscriptionStatus: SubscriptionStatus
  nextBillingDate: string
  trialEndsAt: string | null

  // Payment Methods
  paymentMethods: PaymentMethod[]
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => Promise<void>
  removePaymentMethod: (id: string) => Promise<void>
  setDefaultPaymentMethod: (id: string) => Promise<void>

  // Invoices
  invoices: Invoice[]
  downloadInvoice: (id: string) => Promise<void>

  // Usage
  usage: UsageMetrics
  refreshUsage: () => Promise<void>

  // Plan Management
  availablePlans: PlanFeatures[]
  upgradePlan: (tier: SubscriptionTier, cycle: BillingCycle) => Promise<void>
  downgradePlan: (tier: SubscriptionTier) => Promise<void>
  changeBillingCycle: (cycle: BillingCycle) => Promise<void>
  cancelSubscription: (reason?: string) => Promise<void>
  pauseSubscription: () => Promise<void>
  resumeSubscription: () => Promise<void>

  // State
  isLoading: boolean
  error: string | null
}

const BillingContext = createContext<BillingContextType | undefined>(undefined)

// Mock plan data
const PLANS: Record<SubscriptionTier, PlanFeatures> = {
  free: {
    name: 'Free',
    price: 0,
    assessmentsLimit: 3,
    usersLimit: 5,
    storageLimit: 5,
    workshopsLimit: 0,
    aiInteractionsLimit: 10,
    features: [
      '3 assessments per month',
      'Up to 5 team members',
      '5GB storage',
      'Basic analytics',
      'Email support',
      '10 AI interactions/month'
    ]
  },
  starter: {
    name: 'Starter',
    price: 49,
    assessmentsLimit: 15,
    usersLimit: 10,
    storageLimit: 25,
    workshopsLimit: 2,
    aiInteractionsLimit: 100,
    features: [
      '15 assessments per month',
      'Up to 10 team members',
      '25GB storage',
      'Advanced analytics',
      'Priority email support',
      '2 workshop seats/month',
      '100 AI interactions/month',
      'Custom branding'
    ]
  },
  professional: {
    name: 'Professional',
    price: 99,
    assessmentsLimit: 50,
    usersLimit: 25,
    storageLimit: 100,
    workshopsLimit: 5,
    aiInteractionsLimit: 500,
    popularBadge: true,
    features: [
      '50 assessments per month',
      'Up to 25 team members',
      '100GB storage',
      'Advanced analytics & insights',
      'Priority support (24/7)',
      '5 workshop seats/month',
      '500 AI interactions/month',
      'Custom branding',
      'API access',
      'Advanced integrations'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: 299,
    assessmentsLimit: -1, // unlimited
    usersLimit: -1,
    storageLimit: 500,
    workshopsLimit: -1,
    aiInteractionsLimit: -1,
    features: [
      'Unlimited assessments',
      'Unlimited team members',
      '500GB+ storage',
      'Enterprise analytics',
      'Dedicated account manager',
      'Unlimited workshops',
      'Unlimited AI interactions',
      'Custom branding',
      'Full API access',
      'SSO/SAML',
      'Custom integrations',
      'SLA guarantee',
      'On-premise options'
    ]
  }
}

export function BillingProvider({ children }: { children: ReactNode }) {
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>('professional')
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>('active')
  const [nextBillingDate, setNextBillingDate] = useState('2025-11-04')
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null)

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      brand: 'visa',
      last4: '4242',
      expiry: '12/25',
      holderName: 'John Doe',
      isDefault: true
    }
  ])

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 'inv_001',
      date: '2025-10-04',
      description: 'Professional Plan - Monthly',
      amount: 99,
      status: 'paid',
      invoiceUrl: '/invoices/inv_001.pdf'
    },
    {
      id: 'inv_002',
      date: '2025-09-04',
      description: 'Professional Plan - Monthly',
      amount: 99,
      status: 'paid',
      invoiceUrl: '/invoices/inv_002.pdf'
    },
    {
      id: 'inv_003',
      date: '2025-08-04',
      description: 'Professional Plan - Monthly',
      amount: 99,
      status: 'paid',
      invoiceUrl: '/invoices/inv_003.pdf'
    }
  ])

  const [usage, setUsage] = useState<UsageMetrics>({
    assessments: { used: 12, limit: 50 },
    users: { used: 8, limit: 25 },
    storage: { used: 15.4, limit: 100 },
    workshops: { used: 2, limit: 5 },
    aiInteractions: { used: 234, limit: 500 }
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage
  useEffect(() => {
    try {
      const savedBilling = localStorage.getItem('humanglue_billing')
      if (savedBilling) {
        const data = JSON.parse(savedBilling)
        setCurrentTier(data.currentTier || 'professional')
        setBillingCycle(data.billingCycle || 'monthly')
        setSubscriptionStatus(data.subscriptionStatus || 'active')
        setNextBillingDate(data.nextBillingDate || '2025-11-04')
        setTrialEndsAt(data.trialEndsAt || null)
        setPaymentMethods(data.paymentMethods || [])
        setInvoices(data.invoices || [])
        setUsage(data.usage || usage)
      }
    } catch (error) {
      console.error('Error loading billing data:', error)
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        const billingData = {
          currentTier,
          billingCycle,
          subscriptionStatus,
          nextBillingDate,
          trialEndsAt,
          paymentMethods,
          invoices,
          usage
        }
        localStorage.setItem('humanglue_billing', JSON.stringify(billingData))
      } catch (error) {
        console.error('Error saving billing data:', error)
      }
    }
  }, [currentTier, billingCycle, subscriptionStatus, nextBillingDate, trialEndsAt, paymentMethods, invoices, usage, isLoaded])

  // Payment Methods
  const addPaymentMethod = async (method: Omit<PaymentMethod, 'id'>): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const newMethod: PaymentMethod = {
        ...method,
        id: `pm_${Date.now()}`
      }

      // If it's the first method or marked as default, make it default
      if (paymentMethods.length === 0 || method.isDefault) {
        setPaymentMethods([
          ...paymentMethods.map(pm => ({ ...pm, isDefault: false })),
          newMethod
        ])
      } else {
        setPaymentMethods([...paymentMethods, newMethod])
      }
    } catch (err) {
      setError('Failed to add payment method')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const removePaymentMethod = async (id: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      const method = paymentMethods.find(pm => pm.id === id)
      if (method?.isDefault && paymentMethods.length > 1) {
        throw new Error('Cannot remove default payment method. Set another as default first.')
      }

      setPaymentMethods(paymentMethods.filter(pm => pm.id !== id))
    } catch (err: any) {
      setError(err.message || 'Failed to remove payment method')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const setDefaultPaymentMethod = async (id: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      setPaymentMethods(
        paymentMethods.map(pm => ({
          ...pm,
          isDefault: pm.id === id
        }))
      )
    } catch (err) {
      setError('Failed to set default payment method')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Invoices
  const downloadInvoice = async (id: string): Promise<void> => {
    const invoice = invoices.find(inv => inv.id === id)
    if (invoice?.invoiceUrl) {
      // In a real app, this would trigger a download
      window.open(invoice.invoiceUrl, '_blank')
    }
  }

  // Usage
  const refreshUsage = async (): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      // In real app, fetch from API
      // For now, usage is already set
    } catch (err) {
      setError('Failed to refresh usage data')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Plan Management
  const upgradePlan = async (tier: SubscriptionTier, cycle: BillingCycle): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      setCurrentTier(tier)
      setBillingCycle(cycle)

      // Update usage limits based on new plan
      const plan = PLANS[tier]
      setUsage(prev => ({
        assessments: { used: prev.assessments.used, limit: plan.assessmentsLimit },
        users: { used: prev.users.used, limit: plan.usersLimit },
        storage: { used: prev.storage.used, limit: plan.storageLimit },
        workshops: { used: prev.workshops.used, limit: plan.workshopsLimit },
        aiInteractions: { used: prev.aiInteractions.used, limit: plan.aiInteractionsLimit }
      }))

      // Update next billing date
      const nextDate = new Date()
      nextDate.setMonth(nextDate.getMonth() + (cycle === 'monthly' ? 1 : 12))
      setNextBillingDate(nextDate.toISOString().split('T')[0])
    } catch (err) {
      setError('Failed to upgrade plan')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const downgradePlan = async (tier: SubscriptionTier): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      setCurrentTier(tier)

      const plan = PLANS[tier]
      setUsage(prev => ({
        assessments: { used: prev.assessments.used, limit: plan.assessmentsLimit },
        users: { used: prev.users.used, limit: plan.usersLimit },
        storage: { used: prev.storage.used, limit: plan.storageLimit },
        workshops: { used: prev.workshops.used, limit: plan.workshopsLimit },
        aiInteractions: { used: prev.aiInteractions.used, limit: plan.aiInteractionsLimit }
      }))
    } catch (err) {
      setError('Failed to downgrade plan')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const changeBillingCycle = async (cycle: BillingCycle): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setBillingCycle(cycle)

      // Update next billing date
      const nextDate = new Date()
      nextDate.setMonth(nextDate.getMonth() + (cycle === 'monthly' ? 1 : 12))
      setNextBillingDate(nextDate.toISOString().split('T')[0])
    } catch (err) {
      setError('Failed to change billing cycle')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const cancelSubscription = async (reason?: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSubscriptionStatus('canceled')
      // In real app, would send reason to API for feedback
    } catch (err) {
      setError('Failed to cancel subscription')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const pauseSubscription = async (): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSubscriptionStatus('paused')
    } catch (err) {
      setError('Failed to pause subscription')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const resumeSubscription = async (): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSubscriptionStatus('active')
    } catch (err) {
      setError('Failed to resume subscription')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <BillingContext.Provider
      value={{
        currentTier,
        billingCycle,
        subscriptionStatus,
        nextBillingDate,
        trialEndsAt,
        paymentMethods,
        addPaymentMethod,
        removePaymentMethod,
        setDefaultPaymentMethod,
        invoices,
        downloadInvoice,
        usage,
        refreshUsage,
        availablePlans: Object.values(PLANS),
        upgradePlan,
        downgradePlan,
        changeBillingCycle,
        cancelSubscription,
        pauseSubscription,
        resumeSubscription,
        isLoading,
        error
      }}
    >
      {children}
    </BillingContext.Provider>
  )
}

export function useBilling() {
  const context = useContext(BillingContext)
  if (context === undefined) {
    throw new Error('useBilling must be used within a BillingProvider')
  }
  return context
}

// Helper to get plan by tier
export function getPlanByTier(tier: SubscriptionTier): PlanFeatures {
  return PLANS[tier]
}

// Helper to calculate prorated amount
export function calculateProration(
  currentTier: SubscriptionTier,
  newTier: SubscriptionTier,
  billingCycle: BillingCycle,
  daysRemaining: number
): number {
  const currentPlan = PLANS[currentTier]
  const newPlan = PLANS[newTier]

  const currentPrice = billingCycle === 'monthly' ? currentPlan.price : currentPlan.price * 12 * 0.8
  const newPrice = billingCycle === 'monthly' ? newPlan.price : newPlan.price * 12 * 0.8

  const daysInCycle = billingCycle === 'monthly' ? 30 : 365
  const remainingCredit = (currentPrice / daysInCycle) * daysRemaining
  const newCharge = newPrice

  return Math.max(0, newCharge - remainingCredit)
}
