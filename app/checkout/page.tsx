'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/contexts/CartContext'
import Image from 'next/image'
import {
  ShoppingBag,
  CreditCard,
  User,
  MapPin,
  Mail,
  Phone,
  Lock,
  Tag,
  CheckCircle2,
  ArrowLeft,
  Trash2,
} from 'lucide-react'
import { cn } from '@/utils/cn'

export default function CheckoutPage() {
  const router = useRouter()
  const {
    items,
    removeFromCart,
    subtotal,
    tax,
    total,
    discountCode,
    applyDiscountCode,
    removeDiscountCode,
    clearCart,
  } = useCart()

  const [step, setStep] = useState<'info' | 'payment' | 'confirm'>('info')
  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState('')
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
  })

  useEffect(() => {
    if (items.length === 0) {
      router.push('/dashboard/learning')
    }
  }, [items.length, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleApplyCoupon = () => {
    const success = applyDiscountCode(couponInput)
    if (success) {
      setCouponInput('')
      setCouponError('')
    } else {
      setCouponError('Invalid coupon code')
    }
  }

  const handlePlaceOrder = () => {
    // Simulate order placement
    setTimeout(() => {
      clearCart()
      router.push('/dashboard?order=success')
    }, 1500)
  }

  if (items.length === 0) {
    return null
  }

  const isInfoComplete = formData.firstName && formData.lastName && formData.email && formData.phone
  const isPaymentComplete = formData.cardNumber && formData.expiryDate && formData.cvv && formData.cardName

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-gray-950/95 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-diatype">Back</span>
            </button>

            {/* Progress Indicator */}
            <div className="flex items-center gap-2">
              <div className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                step === 'info' ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-800 text-gray-400'
              )}>
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Info</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-800"></div>
              <div className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                step === 'payment' ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-800 text-gray-400'
              )}>
                <CreditCard className="w-4 h-4" />
                <span className="hidden sm:inline">Payment</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-800"></div>
              <div className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                step === 'confirm' ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-800 text-gray-400'
              )}>
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden sm:inline">Confirm</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white font-gendy">Checkout</h1>
                <p className="text-sm text-gray-400 font-diatype">Complete your purchase</p>
              </div>
            </div>

            {/* Billing Information */}
            {step === 'info' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6"
              >
                <h2 className="text-xl font-bold text-white mb-6 font-gendy">Billing Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 font-diatype">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-all font-diatype"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 font-diatype">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-all font-diatype"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 font-diatype">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-all font-diatype"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 font-diatype">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-all font-diatype"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-2 font-diatype">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-all font-diatype"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 font-diatype">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-all font-diatype"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 font-diatype">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-all font-diatype"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setStep('payment')}
                  disabled={!isInfoComplete}
                  className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-gendy"
                >
                  Continue to Payment
                </button>
              </motion.div>
            )}

            {/* Payment Information */}
            {step === 'payment' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Lock className="w-5 h-5 text-green-400" />
                  <h2 className="text-xl font-bold text-white font-gendy">Payment Details</h2>
                  <span className="text-xs text-gray-500 font-diatype">(Secure)</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 font-diatype">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-all font-diatype"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2 font-diatype">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-all font-diatype"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2 font-diatype">
                        CVV *
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        maxLength={4}
                        className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-all font-diatype"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 font-diatype">
                      Cardholder Name *
                    </label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      placeholder="Name on card"
                      className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-all font-diatype"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep('info')}
                    className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all font-gendy"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep('confirm')}
                    disabled={!isPaymentComplete}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-gendy"
                  >
                    Review Order
                  </button>
                </div>
              </motion.div>
            )}

            {/* Confirmation */}
            {step === 'confirm' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6"
              >
                <h2 className="text-xl font-bold text-white mb-6 font-gendy">Review & Confirm</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-300 font-diatype">
                      I agree to the{' '}
                      <a href="/terms" className="text-purple-400 hover:text-purple-300">
                        Terms & Conditions
                      </a>{' '}
                      and{' '}
                      <a href="/privacy" className="text-purple-400 hover:text-purple-300">
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('payment')}
                    className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all font-gendy"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={!agreeToTerms}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-gendy"
                  >
                    Place Order
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 font-gendy">Order Summary</h3>

                {/* Items */}
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white line-clamp-1 font-gendy">
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-400 font-diatype">Qty: {item.quantity}</p>
                        <p className="text-sm font-bold text-white font-diatype">
                          ${item.price * item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                {!discountCode && (
                  <div className="mb-4">
                    <label className="text-xs font-medium text-gray-400 mb-2 block font-diatype">
                      Discount Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value)
                          setCouponError('')
                        }}
                        placeholder="Enter code"
                        className="flex-1 px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all font-diatype"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors text-sm font-semibold font-diatype"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-xs text-red-400 mt-1 font-diatype">{couponError}</p>}
                  </div>
                )}

                {discountCode && (
                  <div className="mb-4 flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-semibold text-green-300 font-diatype">
                        {discountCode.code}
                      </span>
                    </div>
                    <button onClick={removeDiscountCode} className="text-xs text-red-400 hover:text-red-300">
                      Remove
                    </button>
                  </div>
                )}

                {/* Totals */}
                <div className="space-y-2 pt-4 border-t border-white/10">
                  <div className="flex justify-between text-sm font-diatype">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  {discountCode && (
                    <div className="flex justify-between text-sm font-diatype">
                      <span className="text-green-400">Discount</span>
                      <span className="text-green-400">
                        -${(subtotal - (total - tax)).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-diatype">
                    <span className="text-gray-400">Tax (8%)</span>
                    <span className="text-white">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
                    <span className="text-white font-gendy">Total</span>
                    <span className="text-white font-gendy">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="text-sm font-semibold text-white font-gendy">Secure Checkout</div>
                    <div className="text-xs text-gray-400 font-diatype">
                      Your payment information is encrypted
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
