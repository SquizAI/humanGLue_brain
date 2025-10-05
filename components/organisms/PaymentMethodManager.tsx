'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard,
  Plus,
  Check,
  Trash2,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react'
import { useBilling, PaymentMethod } from '@/lib/contexts/BillingContext'

export function PaymentMethodManager() {
  const {
    paymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    isLoading
  } = useBilling()

  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white font-gendy">Payment Methods</h2>
          <p className="text-gray-400 font-diatype">Manage your payment options</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/50 font-diatype flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Payment Method
        </motion.button>
      </div>

      {/* Payment Methods List */}
      <div className="space-y-4">
        {paymentMethods.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
            <CreditCard className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2 font-gendy">
              No Payment Methods
            </h3>
            <p className="text-gray-400 mb-6 font-diatype">
              Add a payment method to get started with paid plans
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all font-diatype"
            >
              Add Your First Payment Method
            </button>
          </div>
        ) : (
          paymentMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              onSetDefault={() => setDefaultPaymentMethod(method.id)}
              onDelete={() => setShowDeleteConfirm(method.id)}
              isLoading={isLoading}
            />
          ))
        )}
      </div>

      {/* Add Payment Method Modal */}
      <AddPaymentMethodModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={async (method) => {
          await addPaymentMethod(method)
          setShowAddModal(false)
        }}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-red-500/30 rounded-2xl p-8 max-w-md w-full"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-red-500/10 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-white font-gendy">
                  Remove Payment Method?
                </h3>
              </div>

              <p className="text-gray-400 mb-6 font-diatype">
                Are you sure you want to remove this payment method? This action cannot be undone.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all font-diatype"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      await removePaymentMethod(showDeleteConfirm)
                      setShowDeleteConfirm(null)
                    } catch (error) {
                      // Error handled in context
                    }
                  }}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all font-diatype disabled:opacity-50"
                >
                  {isLoading ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Payment Method Card Component
interface PaymentMethodCardProps {
  method: PaymentMethod
  onSetDefault: () => void
  onDelete: () => void
  isLoading: boolean
}

function PaymentMethodCard({ method, onSetDefault, onDelete, isLoading }: PaymentMethodCardProps) {
  const getCardBrandIcon = (brand?: string) => {
    // In a real app, you'd use actual brand logos
    return <CreditCard className="w-6 h-6" />
  }

  const getCardBrandColor = (brand?: string) => {
    switch (brand) {
      case 'visa':
        return 'from-blue-600 to-blue-700'
      case 'mastercard':
        return 'from-red-600 to-orange-600'
      case 'amex':
        return 'from-blue-500 to-cyan-600'
      case 'discover':
        return 'from-orange-600 to-amber-600'
      default:
        return 'from-purple-600 to-blue-600'
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`bg-white/5 backdrop-blur-xl border rounded-2xl p-6 transition-all ${
        method.isDefault ? 'border-purple-500/50' : 'border-white/10'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 bg-gradient-to-br ${getCardBrandColor(method.brand)} rounded-lg`}>
            {getCardBrandIcon(method.brand)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-white font-diatype">
                {method.type === 'card' ? (
                  <>
                    {(method.brand ? method.brand.charAt(0).toUpperCase() + method.brand.slice(1) : 'Card')} •••• {method.last4}
                  </>
                ) : method.type === 'paypal' ? (
                  'PayPal'
                ) : (
                  'Bank Account'
                )}
              </h3>
              {method.isDefault && (
                <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold rounded-full font-diatype flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Default
                </span>
              )}
            </div>
            {method.holderName && (
              <p className="text-sm text-gray-400 font-diatype">{method.holderName}</p>
            )}
            {method.expiry && (
              <p className="text-sm text-gray-400 font-diatype">Expires {method.expiry}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!method.isDefault && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSetDefault}
              disabled={isLoading}
              className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg font-medium hover:bg-white/10 transition-all font-diatype text-sm disabled:opacity-50"
            >
              Set as Default
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDelete}
            disabled={method.isDefault && isLoading}
            className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-all disabled:opacity-50"
          >
            <Trash2 className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// Add Payment Method Modal Component
interface AddPaymentMethodModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (method: Omit<PaymentMethod, 'id'>) => Promise<void>
}

function AddPaymentMethodModal({ isOpen, onClose, onAdd }: AddPaymentMethodModalProps) {
  const [type, setType] = useState<'card' | 'paypal' | 'bank'>('card')
  const [cardNumber, setCardNumber] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '')
    const chunks = cleaned.match(/.{1,4}/g) || []
    return chunks.join(' ').substring(0, 19) // Max 16 digits + 3 spaces
  }

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4)
    }
    return cleaned
  }

  const detectCardBrand = (number: string): 'visa' | 'mastercard' | 'amex' | 'discover' => {
    const cleaned = number.replace(/\s/g, '')
    if (cleaned.startsWith('4')) return 'visa'
    if (cleaned.startsWith('5')) return 'mastercard'
    if (cleaned.startsWith('3')) return 'amex'
    if (cleaned.startsWith('6')) return 'discover'
    return 'visa'
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (type === 'card') {
      const cleaned = cardNumber.replace(/\s/g, '')
      if (!cleaned || cleaned.length < 15) {
        newErrors.cardNumber = 'Invalid card number'
      }
      if (!cardHolder.trim()) {
        newErrors.cardHolder = 'Cardholder name is required'
      }
      if (!expiry || expiry.length !== 5) {
        newErrors.expiry = 'Invalid expiry date (MM/YY)'
      }
      if (!cvv || cvv.length < 3) {
        newErrors.cvv = 'Invalid CVV'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const cleaned = cardNumber.replace(/\s/g, '')
      await onAdd({
        type,
        brand: detectCardBrand(cardNumber),
        last4: cleaned.slice(-4),
        expiry,
        holderName: cardHolder,
        isDefault
      })

      // Reset form
      setCardNumber('')
      setCardHolder('')
      setExpiry('')
      setCvv('')
      setIsDefault(false)
      setErrors({})
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
          className="bg-gray-900 border border-purple-500/30 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white font-gendy">Add Payment Method</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-all"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Payment Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3 font-diatype">
              Payment Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['card', 'paypal', 'bank'] as const).map((paymentType) => (
                <button
                  key={paymentType}
                  onClick={() => setType(paymentType)}
                  className={`px-4 py-3 rounded-xl font-medium transition-all font-diatype capitalize ${
                    type === paymentType
                      ? 'bg-purple-500/20 border-2 border-purple-500/50 text-white'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {paymentType}
                </button>
              ))}
            </div>
          </div>

          {/* Card Form */}
          {type === 'card' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all font-diatype ${
                    errors.cardNumber
                      ? 'border-red-500/30 focus:border-red-500/50'
                      : 'border-white/10 focus:border-purple-500/30'
                  }`}
                />
                {errors.cardNumber && (
                  <p className="text-red-400 text-sm mt-1 font-diatype">{errors.cardNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="John Doe"
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all font-diatype ${
                    errors.cardHolder
                      ? 'border-red-500/30 focus:border-red-500/50'
                      : 'border-white/10 focus:border-purple-500/30'
                  }`}
                />
                {errors.cardHolder && (
                  <p className="text-red-400 text-sm mt-1 font-diatype">{errors.cardHolder}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    maxLength={5}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all font-diatype ${
                      errors.expiry
                        ? 'border-red-500/30 focus:border-red-500/50'
                        : 'border-white/10 focus:border-purple-500/30'
                    }`}
                  />
                  {errors.expiry && (
                    <p className="text-red-400 text-sm mt-1 font-diatype">{errors.expiry}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-diatype">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                    placeholder="123"
                    maxLength={4}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all font-diatype ${
                      errors.cvv
                        ? 'border-red-500/30 focus:border-red-500/50'
                        : 'border-white/10 focus:border-purple-500/30'
                    }`}
                  />
                  {errors.cvv && (
                    <p className="text-red-400 text-sm mt-1 font-diatype">{errors.cvv}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PayPal / Bank Account Placeholder */}
          {type !== 'card' && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 text-center">
              <p className="text-blue-300 font-diatype">
                {type === 'paypal' ? 'PayPal' : 'Bank account'} integration coming soon!
              </p>
            </div>
          )}

          {/* Set as Default */}
          <div className="mt-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-5 h-5 rounded border-white/10 bg-white/5 text-purple-600 focus:ring-purple-500/30"
              />
              <span className="text-white font-medium font-diatype">
                Set as default payment method
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all font-diatype"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || type !== 'card'}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all font-diatype disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Payment Method'
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
